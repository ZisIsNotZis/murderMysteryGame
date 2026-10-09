// Stage 1 (split): spec written in two bounded sequential parts, then 3 parallel red-team reviews.
const ctx = `项目根目录 /home/z/vibe/murderMysteryGame。先完整阅读：
1. idea.md —— 设计宪法，逐条遵守，红队标准为一票否决。
2. .scratch/brainstorm/A.md 与 .scratch/brainstorm/B.md —— 已选定的主/副假设的脑暴依据。

已定决策（不可更改）：
- 主假设：《死亡在下午》——发现时刻=死亡时刻（死者死于当天下午，晚宴全程人已死；晚间所有"冲突"是死讯后的余波，因果倒置）。凶手的不在场证明做在晚间，而这恰是最大破绽。
- 副假设（复盘第二层）：《一人双职》——仆役老陈兼管家与园丁两职，玩家按"职务数=人数"多算一人。
- 规格：6名玩家+主持人，民国宅院背景，含凶案。全篇角色只说真话，误导100%来自玩家默认假设。
- 输出文件 /home/z/vibe/murderMysteryGame/spec.md。注意：前一个写手因超时失败且未落盘，你是全新开始；直接用 write 工具写文件，不要花过多时间反复推敲，先成稿再迭代（后续有红队评审）。控制在合理篇幅，优先完成全部必备章节。`;

// ---- Part 1: core trick spec ----
const p1 = await runs.run("spec-core", {
  agent: "worker",
  label: "规格书·核心诡计篇",
  task: `${ctx}

撰写 spec.md 的【上半部分】（用 write 一次写入）：
1. 【真相时间线】案发日客观事实，精确到时刻：死者身份/死亡时刻/死因/凶手/动机链/下午与晚间每个真实事件（凶手如何处理尸检风险、为何晚宴照常、晚间的"冲突余波"每场是什么）。
2. 【表层时间线】玩家第一遍重构的错误版本（标准晚宴谋杀），需自洽无悬空信息。
3. 【双读映射表】核心交付物：≥15行，每行=将写进剧本的原句 + 表层读法 + 真相读法，两读都字面为真。覆盖物证线（尸温/茶点/餐位）、人证线（下午三点后无人见过死者）、晚宴余波各场、老陈双职句（≥5行，融入本案）。
4. 【角色表】6名玩家+2NPC（老陈、厨娘）：公开身份/秘密/独家线索/动机/下午与晚间真实行踪。指定凶手并说明其手法与盘面策略。
最终回复<200字：凶手是谁+一句话手法。`,
});

// ---- Part 2: ledger/flow/locks, appended by second writer ----
const p2 = await runs.run("spec-ops", {
  agent: "worker",
  label: "规格书·运营与规范篇",
  task: `${ctx}

spec.md 上半部分（真相/表层时间线、映射表、角色表）已由前一写手完成。先完整阅读 spec.md 现有内容，保持一致（尤其凶手设定与时间细节），然后用 edit 工具在文末追加【下半部分】：
5. 【公平线索台账】主诡计≥5处（物证2+人证2+可选纸面1）、副诡计≥4处，标注噪音等级与埋设位置（具体到哪个角色本/场景/线索卡）。
6. 【流程设计】剧本杀标准流程（阅读→自我介绍→第一轮搜证→讨论→第二轮搜证→指认→复盘），每阶段公开信息、搜证budget分配（探索式信息流：信息通过选择获取）。主持人手册要点：何时公开什么、复盘揭示脚本框架（先主诡计翻时间线、再副诡计翻人数账）。
7. 【写作规范锁】给后续写手的硬约束：唯一指称基线、禁止句清单（不得声明死亡时刻、不得断言管家园丁两人、不得截半句/碎片记忆等）、线索噪音化写法示例（对照：扎眼写法 vs 噪音写法）。
8. 【自审】按idea.md宪法15条逐条对照说明；已知风险与缓解。
最终回复<200字摘要。`,
  // depends on spec-core
});

// ---- Reviews (parallel) ----
const reviews = await Promise.allSettled([
  runs.run("spec-review-fairness", {
    agent: "reviewer",
    label: "红队评审：公平性与可回溯性",
    task: `阅读 /home/z/vibe/murderMysteryGame/idea.md 与 /home/z/vibe/murderMysteryGame/spec.md。
以最严苛标准红队审查【公平性】：映射表每行表层/真相两读是否都严格为真？公平线索是否≥3处且真实可达（不靠复盘才懂）？是否有依赖"玩家没注意"的埋线？是否有叙述者撒谎、截半句、碎片记忆擦边？死亡时刻不声明是否被宪法允许（论证）？
输出缺陷清单（按严重度排序）+修复建议，写入 /home/z/vibe/murderMysteryGame/.scratch/review-fairness.md，最终回复<300字。`,
  }),
  runs.run("spec-review-structure", {
    agent: "reviewer",
    label: "红队评审：结构与可玩性",
    task: `阅读 /home/z/vibe/murderMysteryGame/idea.md 与 /home/z/vibe/murderMysteryGame/spec.md。
以资深剧本杀作者+店家视角审查【结构与可玩性】：6人戏份/动机/线索是否均衡？凶手玩法是否成立？流程与搜证budget是否会导致过早撞破主诡计或永远撞不到（需主持人救场=一票否决）？副诡计第二层能否在复盘加菜而不抢戏？
输出缺陷清单（按严重度排序）+修复建议，写入 /home/z/vibe/murderMysteryGame/.scratch/review-structure.md，最终回复<300字。`,
  }),
  runs.run("spec-review-surface", {
    agent: "reviewer",
    label: "红队评审：表层普通性",
    task: `阅读 /home/z/vibe/murderMysteryGame/idea.md 与 /home/z/vibe/murderMysteryGame/spec.md。
你扮演完全不知情的玩家，只看映射表中"将写进剧本的原句"：第一遍读会觉得"怪怪的吗"？哪几句写法扎眼（违宪规则12）？表层时间线作为"标准晚宴谋杀"是否自洽无缺口？
输出扎眼句清单+改写方向，写入 /home/z/vibe/murderMysteryGame/.scratch/review-surface.md，最终回复<300字。`,
  }),
]);

const fmt = (r) => (r.status === "fulfilled" ? String(r.value) : `FAILED: ${r.reason}`);
return `=== SPEC CORE ===\n${fmt(p1)}\n\n=== SPEC OPS ===\n${fmt(p2)}\n\n=== 公平性红队 ===\n${fmt(reviews[0])}\n\n=== 结构红队 ===\n${fmt(reviews[1])}\n\n=== 表层红队 ===\n${fmt(reviews[2])}`;
