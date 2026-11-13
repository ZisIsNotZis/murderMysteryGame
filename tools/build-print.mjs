// Dependency-free print export. Source Markdown remains authoritative.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'harbor', 'print');
const esc = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

function inline(s, source) {
  let t = esc(s);
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    const target = /^(https?:|#)/.test(href) ? href : path.relative(outDir, path.resolve(root, path.dirname(source), href)).replaceAll('\\', '/');
    return `<a href="${esc(target)}">${label}</a>`;
  });
  return t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>');
}

function markdown(text, source) {
  const lines = text.replaceAll('\r', '').split('\n');
  let html = '', para = [], list = null;
  const flush = () => { if (para.length) { html += `<p>${inline(para.join(' '), source)}</p>\n`; para = []; } };
  const endList = () => { if (list) { html += `</${list}>\n`; list = null; } };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('```')) {
      flush(); endList(); let code = '';
      while (++i < lines.length && !lines[i].startsWith('```')) code += lines[i] + '\n';
      html += `<pre>${esc(code)}</pre>\n`; continue;
    }
    if (!line.trim()) { flush(); endList(); continue; }
    const heading = line.match(/^(#{1,6}) (.+)$/);
    if (heading) { flush(); endList(); const n = heading[1].length; html += `<h${n}>${inline(heading[2], source)}</h${n}>\n`; continue; }
    if (line.trim().startsWith('|') && lines[i + 1]?.match(/^\|[\s:|\-]+\|\s*$/)) {
      flush(); endList();
      const cells = row => row.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(s => s.trim());
      html += '<table><thead><tr>' + cells(line).map(c => `<th>${inline(c, source)}</th>`).join('') + '</tr></thead><tbody>';
      i++;
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith('|')) html += '<tr>' + cells(lines[++i]).map(c => `<td>${inline(c, source)}</td>`).join('') + '</tr>';
      html += '</tbody></table>\n'; continue;
    }
    const bullet = line.match(/^[-*] (.+)$/), numbered = line.match(/^\d+\. (.+)$/);
    if (bullet || numbered) {
      flush(); const kind = bullet ? 'ul' : 'ol';
      if (list !== kind) { endList(); html += `<${kind}>`; list = kind; }
      html += `<li>${inline((bullet || numbered)[1], source)}</li>`; continue;
    }
    if (line.startsWith('> ')) { flush(); endList(); html += `<blockquote>${inline(line.slice(2), source)}</blockquote>\n`; continue; }
    endList(); para.push(line);
  }
  flush(); endList(); return html;
}

const style = `
@page { size: A4; margin: 17mm 16mm 18mm; }
* { box-sizing: border-box; }
body { margin: 0 auto; max-width: 850px; padding: 28px; color: #202c31; background: #fff; font: 16px/1.8 "Microsoft YaHei", "Noto Sans CJK SC", sans-serif; }
h1 { font-size: 27px; line-height: 1.4; color: #174b53; margin: 0 0 18px; }
h2 { font-size: 21px; margin: 28px 0 10px; line-height: 1.5; break-after: avoid; }
h3 { font-size: 18px; break-after: avoid; }
p { margin: 0 0 13px; orphans: 3; widows: 3; }
ul, ol { padding-left: 1.5em; } li { margin-bottom: 7px; }
a { color: #145b66; } code { font-size: .9em; }
blockquote { border-left: 3px solid #668d91; padding: 8px 14px; margin: 16px 0; background: #f4f7f7; }
pre { white-space: pre-wrap; font: 13px/1.5 monospace; padding: 14px; background: #f5f5f5; }
table { border-collapse: collapse; width: 100%; font-size: 14px; margin: 16px 0; }
th,td { border: 1px solid #b8c8ca; padding: 7px 9px; text-align: left; vertical-align: top; }
th { background: #eaf0f0; } tr { break-inside: avoid; }
.source { font-size: 12px; color: #63757a; border-top: 1px solid #cbd6d7; padding-top: 7px; margin-bottom: 20px; }
.document { margin-top: 50px; padding-top: 30px; border-top: 2px solid #174b53; }
.document > h1:first-of-type { margin-top: 0; }
nav { padding: 14px 20px; background: #eef4f4; } nav a { display: block; }
.print-note { font-size: 14px; }
@media print {
  body { max-width: none; padding: 0; font-size: 10.5pt; line-height: 1.75; }
  h1 { font-size: 21pt; } h2 { font-size: 15pt; } h3 { font-size: 12pt; }
  table { font-size: 9pt; } pre { font-size: 9pt; }
  .document { break-before: page; margin: 0; padding: 0; border: none; }
  nav, .print-note { display: none; } a { text-decoration: none; color: inherit; }
}
`;

const players = [
  'harbor/player-guide.md', 'harbor/table-board.md',
  'harbor/characters/lin-zhao.md', 'harbor/characters/zhou-du.md', 'harbor/characters/chen-yan.md',
  'harbor/characters/he-yusheng.md', 'harbor/characters/xu-qinghe.md', 'harbor/characters/tang-sui.md'
];
const host = ['harbor/host-manual.md', 'harbor/action-cards.md', 'harbor/evidence-cards.md', 'harbor/endings.md'];

async function build(name, title, sources) {
  let sections = '', links = '';
  for (let i = 0; i < sources.length; i++) {
    const source = sources[i], text = await fs.readFile(path.join(root, source), 'utf8');
    const label = text.split('\n')[0].replace(/^#\s*/, '').trim();
    links += `<a href="#section-${i}">${esc(label)}</a>`;
    sections += `<section class="document" id="section-${i}"><div class="source">${esc(source)} · 以对应Markdown原稿为准</div>${markdown(text, source)}</section>`;
  }
  const html = `<!doctype html>\n<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>${style}</style></head><body><h1>${esc(title)}</h1><p>合作剧本杀完整初稿。尚未真人试玩。玩家册每个角色独立分页；主持人册含全部剧透。</p><p class="print-note">在浏览器中打开后打印，建议A4、缩放100%、关闭浏览器页眉页脚。可按目录选择需要的页面。卡片以章节形式排版，可整页使用或自行裁切。</p><nav>${links}</nav>${sections}</body></html>\n`;
  await fs.writeFile(path.join(outDir, name), html, 'utf8');
  return { file: `harbor/print/${name}`, documents: sources.length, bytes: Buffer.byteLength(html) };
}

await fs.mkdir(outDir, { recursive: true });
console.log(JSON.stringify(await build('player-materials.html', '请把船开回来 玩家打印册', players)));
console.log(JSON.stringify(await build('host-materials.html', '请把船开回来 主持人打印册 含剧透', host)));

// Separate handouts so host-only answers and distribution notes never appear
// on the page handed to a player. Each action or evidence starts a new page.
let cardSections = '', cardLinks = '', cardCount = 0;
for (const [source, prefix] of [['harbor/action-cards.md', 'A'], ['harbor/evidence-cards.md', 'E']]) {
  const text = await fs.readFile(path.join(root, source), 'utf8');
  for (const part of text.split(/^## /m).filter(p => new RegExp(`^${prefix}\\d{2} `).test(p))) {
    const publicText = prefix === 'A' ? part.split('**完成与回声。**')[0].trim() : part.trim();
    const label = publicText.split('\n')[0], id = label.slice(0, 3);
    cardLinks += `<a href="#${id}">${esc(label)}</a>`;
    cardSections += `<section class="document" id="${id}">${markdown('# ' + publicText, source)}</section>`;
    cardCount++;
  }
}
const cardHtml = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>请把船开回来 可分发卡片册</title><style>${style}</style></head><body><h1>请把船开回来 可分发卡片册</h1><p>主持人打印后按行动选择与证据分发规则逐张给玩家。包含调查材料，玩家开场前勿通读。本册不含主持人答题说明和结局。</p><p class="print-note">每张卡独立分页。行动完成后的回声与参考方案在主持人册中。</p><nav>${cardLinks}</nav>${cardSections}</body></html>`;
await fs.writeFile(path.join(outDir, 'handout-cards.html'), cardHtml, 'utf8');
console.log(JSON.stringify({ file: 'harbor/print/handout-cards.html', cards: cardCount, bytes: Buffer.byteLength(cardHtml) }));
