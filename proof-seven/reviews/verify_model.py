"""Digital artifact check; does not represent a physical print or a blind playtest."""
from pathlib import Path
from copy import deepcopy
from itertools import permutations
from html import escape
import json
import re
import unicodedata
import xml.etree.ElementTree as ET
import pymupdf as fitz

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(__file__).resolve().parent / "model-check"
OUT.mkdir(exist_ok=True)


def raster(svg, filename=None):
    with fitz.open(stream=svg, filetype="svg") as doc:
        pix = doc[0].get_pixmap(alpha=True)
        if filename:
            doc[0].get_pixmap(alpha=False).save(OUT / filename)
        return pix


layers = {
    name: ET.fromstring((ROOT / "assets" / f"layer-{name.lower()}.svg").read_text(encoding="utf-8"))
    for name in "ABC"
}
individual = {name: raster(ET.tostring(svg)) for name, svg in layers.items()}
reference = raster((ROOT / "assets" / "proof-layered.svg").read_bytes(), "paper-reference.png")


def intersection(first, second, bounds):
    x0, y0, x1, y1 = bounds
    for y in range(y0, y1):
        for x in range(x0, x1):
            a = individual[first].pixel(x, y)
            b = individual[second].pixel(x, y)
            if a[3] == 255 and b[3] == 255:
                return x, y
    raise AssertionError(f"No opaque intersection between {first} and {second}")


left_point = intersection("A", "B", (95, 185, 225, 280))
right_point = intersection("B", "C", (345, 200, 505, 300))
assert individual["A"].pixel(0, 0)[3] == 0
assert individual["B"].pixel(0, 0)[3] == 0
assert individual["C"].pixel(0, 0)[3] == 0

orders = []
for order in permutations("ABC"):
    root = ET.Element("svg", {"xmlns": "http://www.w3.org/2000/svg", "width": "760", "height": "500", "viewBox": "0 0 760 500"})
    for name in order:
        for child in layers[name]:
            root.append(deepcopy(child))
    pix = raster(ET.tostring(root), f"layers-{''.join(order)}.png")
    matches = all(pix.pixel(*point)[:3] == reference.pixel(*point)[:3] for point in (left_point, right_point))
    orders.append({"bottom_to_top": "".join(order), "matches_both_crossings": matches})
assert [item["bottom_to_top"] for item in orders if item["matches_both_crossings"]] == ["ABC"]

workbook = (ROOT / "workbook.md").read_text(encoding="utf-8")
cards = {
    "Q" + number: (title.strip(), body.strip())
    for number, title, body in re.findall(r"^## Q(\d\d) ([^\n]+)\n(.*?)(?=^## |\Z)", workbook, re.M | re.S)
}
assert set(cards) == {f"Q{index:02d}" for index in range(1, 9)}

# These four joins are stated by the actual printed text and described drawing edges.
joins = {"Q07": ("school", "twelve_steps"), "Q08": ("twelve_steps", "tree"), "Q04": ("tree", "cat"), "Q01": ("cat", "door")}
body_orders = [
    list(order) for order in permutations(joins)
    if joins[order[0]][0] == "school"
    and joins[order[-1]][1] == "door"
    and all(joins[a][1] == joins[b][0] for a, b in zip(order, order[1:]))
]
assert body_orders == [["Q07", "Q08", "Q04", "Q01"]]

panel_roots = {}
panel_edges = {}
for q in joins:
    image_path = re.search(r"!\[[^\]]*\]\((assets/[^)]+)\)", cards[q][1]).group(1)
    data = (ROOT / image_path).read_bytes()
    panel_roots[q] = ET.fromstring(data)
    pix = raster(data)
    edges = {}
    for side, xs in (("left", range(0, 2)), ("right", range(318, 320))):
        edges[side] = sorted({
            y for x in xs for y in range(220)
            if max(pix.pixel(x, y)[:3]) < 120
        })
    panel_edges[q] = edges
graphic_orders = [
    list(order) for order in permutations(joins)
    if not panel_edges[order[0]]["left"]
    and not panel_edges[order[-1]]["right"]
    and all(set(panel_edges[a]["right"]) & set(panel_edges[b]["left"]) for a, b in zip(order, order[1:]))
]
assert graphic_orders == body_orders

strip = ET.Element("svg", {"xmlns": "http://www.w3.org/2000/svg", "width": "1280", "height": "220", "viewBox": "0 0 1280 220"})
for index, q in enumerate(body_orders[0]):
    group = ET.SubElement(strip, "g", {"transform": f"translate({index * 320} 0)"})
    for child in panel_roots[q]:
        group.append(deepcopy(child))
(OUT / "body-four-panels.svg").write_bytes(ET.tostring(strip))
raster(ET.tostring(strip), "body-four-panels.png")

sequence = ["Q05", "Q02", *body_orders[0], "Q06", "Q03"]
faces = {
    "outer-front": (8, 1),
    "outer-back": (2, 7),
    "inner-front": (6, 3),
    "inner-back": (4, 5),
}


def wraps(line, units=33):
    lines, current, used = [], "", 0
    for char in line:
        width = 1 if unicodedata.east_asian_width(char) in "WF" else 0.55
        if used + width > units:
            lines.append(current)
            current, used = "", 0
        current += char
        used += width
    if current:
        lines.append(current)
    return lines or [""]


def page_text(page):
    q = sequence[page - 1]
    title, body = cards[q]
    if page == 8:
        body = body.split("**公开替代页**：", 1)[1].split("选择替代页", 1)[0].strip()
        title = "私人原页另封"
    # Keep the complete four narrative pages; do not add text to the original work.
    clean = re.sub(r"!\[[^\]]*\]\([^)]+\)", "", body)
    clean = re.sub(r"[*#]", "", clean)
    clean = re.sub(r"^原图边线：", "图稿边线：", clean, flags=re.M)
    return q, title, clean


for face, slots in faces.items():
    parts = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="1122" height="794" viewBox="0 0 1122 794">',
        '<rect width="1122" height="794" fill="white"/>',
        '<style>text{font-family:Microsoft YaHei,SimSun,sans-serif;fill:#202020}</style>',
        '<path d="M561 15V779" stroke="#999" stroke-dasharray="6 5"/>',
        f'<text x="30" y="22" font-size="12">Digital imposition check: {face}; fold on centre line; not a physical print.</text>',
    ]
    for half, page in enumerate(slots):
        x = 38 + 561 * half
        q, title, body = page_text(page)
        parts.append(f'<text x="{x}" y="62" font-size="16" fill="#666">页位 {page} · {q}</text>')
        parts.append(f'<text x="{x}" y="108" font-size="26">{escape(title)}</text>')
        y = 153
        if q in panel_roots:
            group = ET.Element("g", {"transform": f"translate({x} {y - 8}) scale(0.9375)"})
            for child in panel_roots[q]:
                group.append(deepcopy(child))
            parts.append(ET.tostring(group, encoding="unicode"))
            y += 225
        for paragraph in body.splitlines():
            for line in wraps(paragraph, 27):
                parts.append(f'<text x="{x}" y="{y}" font-size="18">{escape(line)}</text>')
                y += 28
            if paragraph.strip():
                y += 9
        assert y < 750, (face, page, y)
        parts.append(f'<text x="{x}" y="767" font-size="14">{page}</text>')
    parts.append("</svg>")
    content = "".join(parts)
    # No unapproved private letter is present in the public sample.
    assert "小芹：" not in content and "送煤的" not in content and "鞋又小了" not in content
    path = OUT / f"booklet-{face}.svg"
    path.write_text(content, encoding="utf-8")
    raster(content.encode("utf-8"), f"booklet-{face}.png")

# Opening the nested right-folded leaves reads these eight physical surfaces.
reading_surfaces = [
    ("outer-front", 1), ("outer-back", 0),
    ("inner-front", 1), ("inner-back", 0),
    ("inner-back", 1), ("inner-front", 0),
    ("outer-back", 1), ("outer-front", 0),
]
read_pages = [faces[face][side] for face, side in reading_surfaces]
assert read_pages == list(range(1, 9))

report = {
    "scope": "digital SVG render, deterministic layer permutations, and nested-leaf imposition; no physical printer or human playtest",
    "svg_pixel_size": [reference.width, reference.height],
    "transparent_corner_alpha": {name: individual[name].pixel(0, 0)[3] for name in "ABC"},
    "crossing_pixels": {"left": left_point, "right": right_point},
    "layer_orders": orders,
    "body_orders_matching_published_joins": body_orders,
    "panel_edge_ink_y": panel_edges,
    "body_orders_matching_rendered_drawing_edges": graphic_orders,
    "page_cards": {page: q for page, q in enumerate(sequence, 1)},
    "faces": faces,
    "nested_leaf_read_order": read_pages,
    "private_page": "public replacement only; actual private letter absent from all sample faces",
}
(OUT / "results.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps(report, ensure_ascii=False, indent=2))
