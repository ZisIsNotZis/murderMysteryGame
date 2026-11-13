// Stage 2: write 6 character books + host manual in parallel (one writer per file), all from spec.md.
const ctx = `项目 /home/z/vibe/murderMysteryGame。先完整阅读：
1. idea.md —— 设计宪法（一票否决红线）。
2. spec.md —— 《寿宴》诡计规格书 v2（真相/表层时间线、双读映射表、角色表、线索台账M/S/K、流程、写作规范锁§7）。

通用写作规范（来自§7，违反=返工）：
- 每句叙述与台词必须真话；不得声明死亡时刻；不得断言管家与园丁是两人；不截半句、不碎片记忆、不聚光线索（线索写成背景噪音）。
- 指称基线严格按§7.1；禁止句清单按§7.2。
- 你只写分配给你的那一个文件，不得改 spec.md 或其他文件。
- 每本4000~6000字，结构：开场引导（契约：这是民国寿宴家宅推理，没有一个人说谎）→ 你的身份与秘密 → 昨日至今晨行踪（全部真话，按§1.2逐时表）→ 你知道的线索（按台账分配给你）→ 你的任务与盘面策略。
- 文中所有句子对照映射表双读自检：表层读法与真相读法都为真。`;

const books = [
  { key: "book-zonghan", label: "撰写沈宗翰本（凶手）", who: "沈宗翰（长子，凶手）。额外要求：凶手本需写明其全部真话策略、晚间高调露面的动机包装、『我收拾的』退路台词、以及被指认后的坦白剧情文本；不得写任何教玩家撒谎的指令——他的谎言在规格里已被清除，全靠省略与真话引导。" },
  { key: "book-yurru", label: "撰写顾玉茹本", who: "顾玉茹。含真话退路披露触发（夜探书房被逼问时的自辩方向，见K1/K10与修订记录）。" },
  { key: "book-shuning", label: "撰写沈书宁本", who: "沈书宁。含20:40目击的两级披露规则与行踪陈述必含M4的写法。" },
  { key: "book-zongqi", label: "撰写沈宗麒本", who: "沈宗麒。含S6后半夜人影目击（第一人称）与后半场主动戏。" },
  { key: "book-mutang", label: "撰写周慕堂本", who: "周慕堂。含21:30与宗翰廊下密语、K6押契线索的持有写法。" },
  { key: "book-bai", label: "撰写白医生本", who: "白医生（家庭医生玩家）。含A1尸温描写的第一视角承接（都凉透了/僵直），专业身份让换算自然发生。" },
];

const results = await Promise.allSettled([
  ...books.map(b =>
    runs.run(b.key, {
      agent: "worker",
      label: b.label,
      task: `${ctx}

你负责：角色本 ${b.who}
写入文件：/home/z/vibe/murderMysteryGame/script/${b.key}.md
完成后最终回复<150字：本中埋了哪些台账号线索、自检结论。`,
    })
  ),
  runs.run("host-manual", {
    agent: "worker",
    label: "撰写主持人手册",
    task: `${ctx}

你负责：主持人手册（DM手册）。
写入文件：/home/z/vibe/murderMysteryGame/script/host-manual.md（约5000字）。
内容：开场白与契约宣读词（明确"没有一个人说谎"）；七阶段流程跑表（含每阶段时长与公开信息，按§6）；线索卡池发放规则（两轮32张、四域预算，按§6.3）；NPC（老陈、刘妈/厨娘）问询台词本——只说惯常事实与真话；三不纪律与兜底问答；复盘揭示脚本（先翻时间线后翻人数账，含两条分支：已提前翻面→抽验确认；人数账已合并→陈述式回放；纪律句"翻面后不得加速、不得替玩家收束K线"）；指认与真相宣读文本；重读增值引导（"回去看第X行的茶点"式复盘清单）。
完成后最终回复<150字摘要。`,
  }),
]);

const names = [...books.map(b => b.key), "host-manual"];
return results.map((r, i) => `=== ${names[i]} ===\n${r.status === "fulfilled" ? String(r.value) : `FAILED: ${r.reason}`}`).join("\n\n");
