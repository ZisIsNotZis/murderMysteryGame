# Active Work

## 《寿宴》剧本杀（已完成 v1，待真人实测）

- 交付物：`README.md`、`spec.md`、`script/`（6角色本+host-manual+clue-cards）。git 已提交。
- 设计宪法：`idea.md`。主诡计《死亡在下午》＋副诡计《一人双职》，全篇真话、双读皆真。
- 验证链：3路spec红队 → 成稿3路一致性审计（两轮修复）→ LLM盲测×2（普通桌+老手桌，均通过）。
- 过程档案：`.scratch/`（brainstorm、review-*、audit-*、blindtest-*、stage*.js 工作流脚本）。
- 残留事项：
  - [ ] 真人实桌 1–2 场（LLM盲测不能替代），复盘维度见 blindtest-1.md 观察节。
  - [ ] 卡面实体化（不得增删事实句，spec §7）。
- 重启方法：直接读 README.md；修订时先读 spec.md §7 写作规范锁与 §修订记录，改后重跑 `.scratch/stage3b-audit.js` 式审计 + 一场盲测。
