// Stage 3b: rerun the two timed-out audits with tighter, grep-first scope.
const base = `项目 /home/z/vibe/murderMysteryGame。读 idea.md、spec.md（重点§1.2与§7），再按分配只读指定文件。
策略要求（防超时）：先用 grep 批量检索违禁词与关键词定位，再只精读命中段落，不做全文逐行精读。只写审查报告，不改剧本。最终回复<300字。`;
const files = ['book-zonghan.md','book-yurru.md','book-shuning.md','book-zongqi.md','book-mutang.md','book-bai.md','host-manual.md','clue-cards.md'];

const audits = await Promise.allSettled([
  runs.run("audit-ref-1", {
    agent: "reviewer",
    label: "指称审计·角色本前半",
    task: `${base}
你只审计这4个文件：${files.slice(0,4).map(f=>'script/'+f).join('、')}。
检查：称呼是否各一（对照§7.1基线）；违禁项 grep：管家、园丁、凉、僵、毒、凶手、几点的死亡声明类表述、人数断言（两个人/三名仆役等）；跨本对同一事件的时刻/在场/原话是否与§1.2一致。
缺陷写入 .scratch/audit-ref-1.md。`,
  }),
  runs.run("audit-ref-2", {
    agent: "reviewer",
    label: "指称审计·手册卡池后半",
    task: `${base}
你只审计这4个文件：${files.slice(4).map(f=>'script/'+f).join('、')}。
检查：同前（称呼基线、违禁词grep、与§1.2一致性），另加：手册NPC问答与六本口径是否一致（抽3处验证）；卡面台账号标注是否与spec台账编号一致。
缺陷写入 .scratch/audit-ref-2.md。`,
  }),
  runs.run("audit-tworead-1", {
    agent: "reviewer",
    label: "双读真值·承重句抽验",
    task: `${base}
你只做【双读真值抽验】：从 spec.md 映射表取全部条目编号，grep 各剧本文件定位每个条目对应的句子（含各本复述公共场面的段落），验证每句表层/真相两读都字面为真；标记任何真相下为假或表层下穿帮的句子。
只检查含映射条目的句子，不做全文扫描。缺陷写入 .scratch/audit-tworead-1.md。`,
  }),
]);

const names = ["audit-ref-1","audit-ref-2","audit-tworead-1"];
const fmt = (r) => (r.status === "fulfilled" ? String(r.value) : `FAILED: ${r.reason}`);
return audits.map((r, i) => `=== ${names[i]} ===\n${fmt(r)}`).join("\n\n");
