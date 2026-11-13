// Dependency-free print export. Source Markdown remains authoritative.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'proof-seven', 'print');
const esc = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

function inline(s, source) {
  let t = esc(s);
  t = t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, href) => {
    const target = path.relative(outDir, path.resolve(root, path.dirname(source), href)).replaceAll('\\', '/');
    return '<img src="' + esc(target) + '" alt="' + alt + '">';
  });
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
h1 { font-size: 27px; line-height: 1.4; color: #684d3b; margin: 0 0 18px; }
h2 { font-size: 21px; margin: 28px 0 10px; line-height: 1.5; break-after: avoid; }
h3 { font-size: 18px; break-after: avoid; }
p { margin: 0 0 13px; orphans: 3; widows: 3; }
ul, ol { padding-left: 1.5em; } li { margin-bottom: 7px; }
a { color: #145b66; } code { font-size: .9em; }
blockquote { border-left: 3px solid #668d91; padding: 8px 14px; margin: 16px 0; background: #f4f7f7; }
pre { white-space: pre-wrap; font: 13px/1.5 monospace; padding: 14px; background: #f5f5f5; }
img { max-width: 100%; max-height: 380px; object-fit: contain; display: block; margin: 14px auto; }
table { border-collapse: collapse; width: 100%; font-size: 14px; margin: 16px 0; }
th,td { border: 1px solid #b8c8ca; padding: 7px 9px; text-align: left; vertical-align: top; }
th { background: #eaf0f0; } tr { break-inside: avoid; }
.source { font-size: 12px; color: #63757a; border-top: 1px solid #cbd6d7; padding-top: 7px; margin-bottom: 20px; }
.document { margin-top: 50px; padding-top: 30px; border-top: 2px solid #684d3b; }
.document > h1:first-of-type { margin-top: 0; }
nav { padding: 14px 20px; background: #f4eee2; } nav a { display: block; }
.print-note { font-size: 14px; }
@media print {
  body { max-width: none; padding: 0; font-size: 10.5pt; line-height: 1.75; }
  h1 { font-size: 21pt; } h2 { font-size: 15pt; } h3 { font-size: 12pt; }
  table { font-size: 9pt; } pre { font-size: 9pt; }
  .document { break-before: page; margin: 0; padding: 0; border: none; }
  nav, .print-note { display: none; } a { text-decoration: none; color: inherit; }
}
`;


async function build(name, title, sources) {
  let sections = '', links = '';
  for (let i = 0; i < sources.length; i++) {
    const source = sources[i], text = await fs.readFile(path.join(root, source), 'utf8');
    const label = text.split('\n')[0].replace(/^#\s*/, '').trim();
    links += `<a href="#section-${i}">${esc(label)}</a>`;
    sections += `<section class="document" id="section-${i}"><div class="source">${esc(source)} · 以对应Markdown原稿为准</div>${markdown(text, source)}</section>`;
  }
  const html = `<!doctype html>\n<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>${style}</style></head><body><h1>${esc(title)}</h1><p>合作剧本杀文本定稿。尚未真人试玩。玩家册每个角色独立分页；主持人册含全部剧透。</p><p class="print-note">在浏览器中打开后打印，建议A4、缩放100%、关闭浏览器页眉页脚。可按目录选择需要的页面。卡片以章节形式排版，可整页使用或自行裁切。</p><nav>${links}</nav>${sections}</body></html>\n`;
  await fs.writeFile(path.join(outDir, name), html, 'utf8');
  return { file: `proof-seven/print/${name}`, documents: sources.length, bytes: Buffer.byteLength(html) };
}


const playerSources=['proof-seven/player-guide.md','proof-seven/scene-board.md',...['meng-qing','shen-zhou','lu-qin','han-zhao','lin-qi','xu-you'].map(n=>'proof-seven/characters/'+n+'.md')];
const hostSources=['proof-seven/host-manual.md','proof-seven/evidence.md','proof-seven/stations.md','proof-seven/workbook.md','proof-seven/recollection.md','proof-seven/endings.md'];
await fs.mkdir(outDir,{recursive:true});
console.log(JSON.stringify(await build('player-materials.html','第七次校样 玩家册',playerSources)));
console.log(JSON.stringify(await build('host-materials.html','第七次校样 主持人册 含剧透',hostSources)));
let sections='',nav='',count=0;
for(const [source,prefix] of [['proof-seven/evidence.md','P'],['proof-seven/workbook.md','Q'],['proof-seven/recollection.md','R'],['proof-seven/stations.md','S']]){
  const text=await fs.readFile(path.join(root,source),'utf8');
  for(const part of text.split(/^## /m).filter(p=>new RegExp('^'+prefix+'\\d{2} ').test(p))){
    const chunk=prefix==='S'?part.split('**核验与回响。**')[0].trim():part.trim();
    const label=chunk.split('\n')[0],id=label.slice(0,3);
    nav+='<a href="#'+id+'">'+esc(label)+'</a>';
    sections+='<section class="document" id="'+id+'">'+markdown('# '+chunk,source)+'</section>';
    count++;
  }
}
const workbookSource=await fs.readFile(path.join(root,'proof-seven/workbook.md'),'utf8');
const folding=workbookSource.split('## 折页模型 玩家可读')[1].split('## 主持人顺序')[0].trim();
nav+='<a href="#F01">F01 折页模型</a>';
sections+='<section class="document" id="F01">'+markdown('# F01 折页模型\n\n'+folding,'proof-seven/workbook.md')+'</section>';
count++;
const wrap=(title,body,css=style)=>'<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(title)+'</title><style>'+css+'</style></head><body>'+body+'</body></html>';
await fs.writeFile(path.join(outDir,'handouts.html'),wrap('第七次校样 可分发材料','<h1>第七次校样 可分发材料</h1><p>主持人按目录分发。包含调查资料，玩家开场前勿通读。Q03先交陆芹与许柚；公开拼册可用空白替页。R01按探索触发给韩照。每卡独立分页，不含主持人核验答案。</p><nav>'+nav+'</nav>'+sections));
console.log(JSON.stringify({file:'proof-seven/print/handouts.html',cards:count}));
const panels=Object.fromEntries((await fs.readFile(path.join(root,'proof-seven/workbook.md'),'utf8')).split(/^## /m).filter(p=>/^Q\d{2} /.test(p)).map(p=>[p.slice(0,3),p.substring(p.indexOf('\n')+1).trim()]));
const art=(n)=>'<img src="../assets/'+n+'" alt="原稿描摹">';
const prose=(q)=>markdown(panels[q].split('**原图边线**')[0].trim(),'proof-seven/workbook.md');
const pages={
  1:'<h1>春天借住在四楼</h1><p>一册认路的图画笔记</p>'+art('panel-door.svg'),
  2:'<h2>原作图文 江望</h2><p>本次整理与修复：____________</p><p>核读者与日期：____________</p><p>排页样稿。公开范围按作者与收件人实际确认填写。</p>',
  3:prose('Q07'),4:prose('Q08'),5:prose('Q04'),6:prose('Q01'),
  7:'<h2>公开更正页</h2><p>原刊误署顾砚生，本次更正为江望原作。</p><p>本次整理贡献与旧记录的更正另行记载。私人末页未自动纳入公开版。</p><p>实际更正文案：____________</p>',
  8:'<h2>此页另封</h2><p>本册此页留空。私人原页另存，未列入本次公开范围。</p><p>如后续公开，由作者与收件人分别确认。</p>'
};
const sides=[['外张外面',8,1],['外张里面',2,7],['内张外面',6,3],['内张里面',4,5]];
const bookletStyle='@page{size:A4 landscape;margin:10mm}body{margin:0;color:#3e3d31;font:15px/1.7 "Microsoft YaHei",sans-serif;background:#fff}.sheet{display:flex;position:relative;min-height:185mm;border:1px solid #c8bca6;break-after:page}.page{width:50%;padding:14mm 13mm 15mm;box-sizing:border-box;position:relative}.page+ .page{border-left:1px dashed #aaa}.page h1{font-size:25px}.page h2{font-size:20px}.page img{width:95%;max-height:62mm;object-fit:contain;display:block;margin:7mm auto}.page p{margin:0 0 4mm}.num{position:absolute;bottom:4mm;left:50%;font-size:12px}.side{position:absolute;top:2mm;left:3mm;font-size:10px;color:#777}.screen-note{padding:12px;background:#f4eee2}@media print{.screen-note{display:none}.sheet{border:0}}';
let sheets='<p class="screen-note">两张纸四面排页样稿。请先按页位手动核对翻面方向，或用两张白纸对折再贴卡。私人页默认空白；本文件不是已经获准发行的新刊。</p>';
for(const [label,l,r] of sides)sheets+='<section class="sheet"><span class="side">'+label+' · 手工核对翻面</span><div class="page">'+pages[l]+'<span class="num">'+l+'</span></div><div class="page">'+pages[r]+'<span class="num">'+r+'</span></div></section>';
await fs.writeFile(path.join(outDir,'booklet-layout.html'),wrap('春天借住在四楼 八页排页样稿',sheets,bookletStyle));
console.log(JSON.stringify({file:'proof-seven/print/booklet-layout.html',sides:sides.map(s=>s.slice(1))}));
