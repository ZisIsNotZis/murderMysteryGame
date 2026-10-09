// Stage 0/1: brainstorm candidate core assumptions for the jubensha script.
const ctx = `你在为一个剧本杀剧本项目做创意脑暴。项目根目录 /home/z/vibe/murderMysteryGame。
必须先完整阅读 /home/z/vibe/murderMysteryGame/idea.md（设计宪法），严格遵守其全部规则：
- 误导只能来自读者/玩家的默认假设，绝不靠：藏信息、换称呼、截半句话、碎片记忆、叙述者撒谎、文字游戏。
- 表层第一遍读必须普通、清晰、自洽；揭示后前文每句必须为真且可回溯；公平线索至少3处；重读更妙。
- 6~7名玩家本，含凶案。不写UI，专注剧本文本结构。`;

const angles = [
  { key: "brainstorm-A", label: "脑暴：时间线类假设", angle: "时间/因果类默认假设（如：叙述顺序=发生顺序、因果方向、某段叙述的时态被误读）。你重点探索但不必局限于示例。" },
  { key: "brainstorm-B", label: "脑暴：身份与存在类假设", angle: "人物存在/身份类默认假设（如：被正常描写的角色已死、两个被分别描写的人是同一人、群像中多算或少算一人）。注意宪法对指称/换称呼的严格限制，诡计不能靠指称把戏。" },
  { key: "brainstorm-C", label: "脑暴：场景与社会常规类假设", angle: "场景/社会常规类默认假设（如：两次相似场景被默认为同一次、角色行为默认符合社会常规（性别/职业/关系）、地点默认同一）。" },
];

const results = await Promise.all(angles.map(a =>
  runs.run(a.key, {
    agent: "worker",
    label: a.label,
    task: `${ctx}

你的探索角度：${a.angle}

任务：
1. 提出 2~3 个候选主假设（只选1个主假设+至多1个副假设的思路）。
2. 对每个候选写出：假设内容、为何玩家必然默认带入（普遍性评估）、揭示后爽感类型（"原来如此" vs "恍然大悟"）、公平线索埋设难度（低/中/高，需几处、埋在哪类文本）、双时间线映射表可行性草案（表层版本 vs 真相版本，各3~5条示例句，要求两句都为真）。
3. 按宪法逐条自审，淘汰依赖"作者使坏"的候选，说明淘汰理由。
4. 推荐你角度下的最佳候选并给出理由。

把完整产出写入 /home/z/vibe/murderMysteryGame/.scratch/brainstorm/${a.key.slice(-1)}.md（UTF-8中文）。
最终回复（<600字）：推荐的1个最佳候选摘要 + 三个候选的一句话清单。`
  }).then(r => ({ angle: a.angle, result: r }))
));

return results.map(r => `=== ${r.angle} ===\n${r.result}`).join("\n\n");
