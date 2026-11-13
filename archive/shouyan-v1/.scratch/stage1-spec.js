// Stage 1: author the 诡计规格书 (trick spec), then adversarial review of the spec before any prose is written.
const ctx = `项目根目录 /home/z/vibe/murderMysteryGame。先完整阅读：
1. idea.md —— 设计宪法，逐条遵守，红队标准为一票否决。
2. .scratch/brainstorm/A.md 与 .scratch/brainstorm/B.md —— 已选定的主/副假设的脑暴依据。

已定决策（不可更改）：
- 主假设：《死亡在下午》——发现时刻=死亡时刻（死者死于当天下午，晚宴全程人已死；晚间所有"冲突"是死讯后的余波，因果倒置）。凶手的不在场证明做在晚间，而这恰是最大破绽。
- 副假设（复盘第二层）：《一人双职》——仆役老陈兼管家与园丁两职，玩家按"职务数=人数"多算一人。
- 规格：6~7名玩家本（定6人+主持人），民国宅院背景，含凶案。全篇角色只说真话，误导100%来自玩家默认假设。`;

// ---- Step 1: write the spec ----
const spec = await runs.run("spec-writer", {
  agent: "worker",
  label: "撰写诡计规格书",
  task: `${ctx}

撰写《诡计规格书》并写入 /home/z/vibe/murderMysteryGame/spec.md（UTF-8中文）。结构要求：

1. 【真相时间线】案发日客观事实，精确到时刻：死者死亡时刻/方式/凶手/动机链/下午与晚间每个真实事件。
2. 【表层时间线】玩家第一遍会重构的错误版本（标准晚宴谋杀）。
3. 【双读映射表】核心交付物：≥15行。每行=一条将写进剧本的原句 + 表层读法 + 真相读法，两层读法都必须字面为真。覆盖：物证线（尸温/茶点/餐位）、人证线（下午三点后无人见过死者）、晚宴余波各场戏、老陈双职相关句（副假设≥5行，沿用B.md映射表并融入本案）。
4. 【角色表】6名玩家角色+2名NPC（老陈、厨娘）：公开身份/秘密/独家线索/动机/下午与晚间真实行踪。凶手必须在其间，且其诡计=在晚间高调制造不在场证明（全部真话）。指定谁是凶手并给出完整手法：凶手如何知道死亡时刻不会被及时确认、为何晚宴照常。
5. 【公平线索台账】主诡计≥5处（物证2+人证2+可选纸面1）、副诡计≥4处，按背景噪音等级标注，分布到具体角色本/场景文本/线索卡。
6. 【流程设计】剧本杀标准流程（阅读→自我介绍→第一轮搜证→讨论→第二轮搜证→指认→复盘），每阶段公开什么信息、搜证budget如何分配（探索式信息流：信息通过选择获取）。
7. 【写作规范锁】给后续写手的硬约束：唯一指称基线、禁止句清单（不得声明死亡时刻、不得断言管家园丁两人、不得截半句等）、线索噪音化写法示例。
8. 【自审】按idea.md宪法15条逐条对照说明本规格如何满足；指出已知风险与缓解。

要求：映射表中每句原文都要能直接用于后续写作；整体要能支撑8~12万字级6人本（实际成文目标每本4000~6000字+主持人手册）。完成后最终回复<400字摘要：凶手设定、双诡计如何咬合、最大风险。`,
});

// ---- Step 2: adversarial spec review (3 independent red teams) ----
const reviews = await Promise.allSettled([
  runs.run("spec-review-fairness", {
    agent: "reviewer",
    label: "红队评审：公平性与可回溯性",
    task: `阅读 /home/z/vibe/murderMysteryGame/idea.md（宪法）与 /home/z/vibe/murderMysteryGame/spec.md（诡计规格书）。
以最严苛标准红队审查【公平性】：映射表每行表层/真相两读是否都严格为真？公平线索是否≥3处且真实可达（不是只有复盘才懂）？是否存在任何依赖"玩家没注意"的埋线？是否存在叙述者撒谎、截半句、碎片记忆的擦边？死亡时刻不声明是否被宪法允许（论证）？
输出缺陷清单（按严重度排序）+ 每条的修复建议。写入 /home/z/vibe/murderMysteryGame/.scratch/review-fairness.md，最终回复<300字。`,
  }),
  runs.run("spec-review-structure", {
    agent: "reviewer",
    label: "红队评审：结构与可玩性",
    task: `阅读 /home/z/vibe/murderMysteryGame/idea.md（宪法）与 /home/z/vibe/murderMysteryGame/spec.md（诡计规格书）。
以资深剧本杀作者+店家视角审查【结构与可玩性】：6人角色戏份/动机/线索是否均衡？凶手玩法是否成立（凶手知道什么、盘什么）？流程与搜证budget是否会让玩家在复盘前就撞破主诡计（过早暴露）或永远撞不到（需要主持人救场=宪法一票否决项）？副诡计第二层是否真的能在复盘时加菜而不是抢戏？
输出缺陷清单（按严重度排序）+ 修复建议。写入 /home/z/vibe/murderMysteryGame/.scratch/review-structure.md，最终回复<300字。`,
  }),
  runs.run("spec-review-surface", {
    agent: "reviewer",
    label: "红队评审：表层普通性",
    task: `阅读 /home/z/vibe/murderMysteryGame/idea.md（宪法）与 /home/z/vibe/murderMysteryGame/spec.md（诡计规格书）。
你扮演一个完全不知情的玩家，只看规格书里列出的"将写进剧本的原句"（映射表原文列），自问：第一遍读这些句子，我会觉得"这里怪怪的吗"？哪几句的写法会让我起疑（线索扎眼=违宪规则12）？表层时间线作为"标准晚宴谋杀"是否完整自洽无缺口（有没有表层读法下无法解释的悬空信息）？
输出扎眼句清单+改写方向。写入 /home/z/vibe/murderMysteryGame/.scratch/review-surface.md，最终回复<300字。`,
  }),
]);

const fmt = (r) => r.status === "fulfilled" ? String(r.value) : `FAILED: ${r.reason}`;
return `=== SPEC WRITER ===\n${fmt(spec)}\n\n=== 公平性红队 ===\n${fmt(reviews[0])}\n\n=== 结构红队 ===\n${fmt(reviews[1])}\n\n=== 表层红队 ===\n${fmt(reviews[2])}`;
