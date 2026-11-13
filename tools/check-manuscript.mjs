// Static delivery checks only; this does not judge story quality or simulate people.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
async function walk(dir) {
  const found = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) found.push(...await walk(p));
    else if (e.name.endsWith('.md')) found.push(p);
  }
  return found;
}
const files = [...await walk(path.join(root, 'harbor')), ...['README.md', 'README.zh-CN.md', 'idea.md', 'CONTRIBUTING.md', 'archive/README.md'].map(f => path.join(root, f))];
let links = 0;
for (const file of files) {
  const text = await fs.readFile(file, 'utf8');
  if (text.includes('\uFFFD')) failures.push(`${file}: replacement character`);
  for (const m of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const href = m[1];
    if (/^(https?:|#)/.test(href)) continue;
    const dest = path.resolve(path.dirname(file), href.split('#')[0]);
    try { await fs.access(dest); links++; } catch { failures.push(`${path.relative(root, file)}: missing link ${href}`); }
  }
  if (!file.includes(`${path.sep}reviews${path.sep}`) && /旧表|旧版结/.test(text)) failures.push(`${file}: ambiguous table wording`);
}
const actions = await fs.readFile(path.join(root, 'harbor/action-cards.md'), 'utf8');
const evidence = await fs.readFile(path.join(root, 'harbor/evidence-cards.md'), 'utf8');
for (const [text, prefix, count] of [[actions, 'A', 13], [evidence, 'E', 12]]) {
  const ids = [...text.matchAll(new RegExp(`^## (${prefix}\\d{2}) `, 'gm'))].map(m => m[1]);
  const expected = Array.from({ length: count }, (_, i) => prefix + String(i + 1).padStart(2, '0'));
  if (JSON.stringify(ids) !== JSON.stringify(expected)) failures.push(`${prefix}: incomplete or duplicate cards ${ids}`);
}
const characters = (await fs.readdir(path.join(root, 'harbor/characters'))).filter(f => f.endsWith('.md'));
if (characters.length !== 6) failures.push(`Expected six characters, got ${characters.length}`);

// Check arithmetic of the actual example branches, not emotional experience.
const people = ['林照', '周渡', '陈雁', '何雨生', '许青禾', '唐穗'];
const plans = [
  { name: '拖船经灯塔', route: 'boat', rounds: [['A01','A02','A03'], ['A05','A08','A09'], ['A06','A12','A13']] },
  { name: '岸线接应', route: 'shore', rounds: [['A03','A04','A09'], ['A05','A06','A08'], ['A10','A11','A13']] },
  { name: '快案后接人', route: 'boat', rounds: [['A06','A07','A01'], ['A02','A05','A09'], ['A08','A12','A13']] },
  { name: '零命案调查', route: 'shore', rounds: [['A03','A04','A09'], ['A05','A08','A13'], ['A10','A11','A12']] },
  { name: '默认接应只做侧行动', route: 'default', rounds: [['A06','A07','A08'], ['A09','A10','A11'], ['A12','A13']] }
];
for (const plan of plans) {
  const done = new Set();
  for (const round of plan.rounds) {
    if (round.length > 3) failures.push(`${plan.name}: more than three actions`);
    for (const a of round) {
      if (done.has(a)) failures.push(`${plan.name}: duplicate ${a}`);
      done.add(a);
    }
  }
  const boat = ['A01','A02','A05'].every(a => done.has(a));
  const shore = ['A03','A04','A05'].every(a => done.has(a));
  if (plan.route === 'boat' && !boat || plan.route === 'shore' && !shore || plan.route === 'default' && (boat || shore)) failures.push(`${plan.name}: wrong route prerequisites`);
}
const soloGroups = [[people[0]], people.slice(1,3), people.slice(3)];
if (soloGroups.some(g => g.length < 1 || g.length > 3) || new Set(soloGroups.flat()).size !== 6) failures.push('Solo/helper grouping loses a player');
const result = { markdownFiles: files.length, validLocalLinks: links, characters: characters.length, actionCards: 13, evidenceCards: 12, exampleSchedules: plans.length, soloGrouping: soloGroups.map(g => g.length), failures };
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exitCode = 1;
