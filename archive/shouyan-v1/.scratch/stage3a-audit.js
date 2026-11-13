// Stage 3a: cross-book consistency + constitution audit of the drafted script.
const base = `项目 /home/z/vibe/murderMysteryGame。先读 idea.md（宪法）、spec.md（规格书v2），再读 script/ 下全部7个文件（6角色本+host-manual.md）。只读与写审查报告，不改剧本。
可用 grep/精确检索辅助。输出写入指定报告文件，最终回复<300字。`;

const audits = await Promise.allSettled([
  runs.run("audit-ref", {
    agent: "reviewer",
    label: "跨本审计：指称一致与违禁句",
    task: `${base}
审计【指称一致性与违禁句】：每个人物/地点/物件在7个文件中的称呼是否各一且符合§7.1基线；有无"管家/园丁"字样、人数断言、死亡时刻声明/换算、定性词（凶手/下毒等非复盘语境）、截半句、碎片记忆、聚光句；跨本对同一事件的叙述是否互相矛盾（时刻、谁在场、谁说了什么，对照§1.2）。
逐文件列缺陷（文件+行内容+问题+修复建议），写入 .scratch/audit-ref.md。`,
  }),
  runs.run("audit-clues", {
    agent: "reviewer",
    label: "跨本审计：线索台账落位",
    task: `${base}
审计【线索落位与可达性】：台账M/S/K每一条是否都在指定文件中真实落位（引用原文验证）；M1/M3/M4/M5是否不抽卡也可达；K链（K3→K5→K4/K1+K2）是否在各本+手册+卡池描述下可成链；两轮32张卡的发放规则与各本叙述是否自洽；主持人手册的NPC问答是否与角色本口径一致。
逐条列缺陷+修复建议，写入 .scratch/audit-clues.md。`,
  }),
  runs.run("audit-tworead", {
    agent: "reviewer",
    label: "跨本审计：双读真值抽验",
    task: `${base}
审计【双读真值】：对7个文件做逐段扫描，凡涉及映射表条目（尸温/茶点/餐位/放话/敲门/烧纸/裹壶/密语等）或承重事实的句子，验证表层读法与真相读法是否都字面为真；找出任何一句在真相下为假、或在表层下穿帮（提前暴露主诡计）的句子。特别注意各本"复述公共场面"的段落（最易走样）。
逐句列缺陷+修复建议，写入 .scratch/audit-tworead.md。`,
  }),
]);

const fmt = (r) => (r.status === "fulfilled" ? String(r.value) : `FAILED: ${r.reason}`);
return `=== 指称/违禁 ===\n${fmt(audits[0])}\n\n=== 线索落位 ===\n${fmt(audits[1])}\n\n=== 双读真值 ===\n${fmt(audits[2])}`;
