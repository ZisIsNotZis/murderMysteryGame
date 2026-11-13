// Delivery consistency only. Does not measure human experience or establish legal guilt.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const failures=[];
async function files(dir){
  const result=[];
  for(const e of await fs.readdir(dir,{withFileTypes:true})){
    const p=path.join(dir,e.name);
    if(e.isDirectory())result.push(...await files(p));else result.push(p);
  }
  return result;
}
const all=await files(path.join(root,'proof-seven'));
const md=[...all.filter(p=>p.endsWith('.md')),...['README.md','README.zh-CN.md','idea.md','CONTRIBUTING.md'].map(p=>path.join(root,p))];
let localLinks=0;
for(const p of md){
  const text=await fs.readFile(p,'utf8');
  if(text.includes('\uFFFD'))failures.push(`${p}: replacement character`);
  for(const m of text.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)){
    const href=m[1];if(/^(https?:|#)/.test(href))continue;
    try{await fs.access(path.resolve(path.dirname(p),href.split('#')[0]));localLinks++;}
    catch{failures.push(`${path.relative(root,p)}: missing ${href}`);}
  }
}
for(const [source,prefix,count] of [['evidence.md','P',17],['workbook.md','Q',8],['stations.md','S',5],['recollection.md','R',1]]){
  const text=await fs.readFile(path.join(root,'proof-seven',source),'utf8');
  const ids=[...text.matchAll(new RegExp('^## ('+prefix+'\\d{2}) ','gm'))].map(m=>m[1]);
  const expected=Array.from({length:count},(_,i)=>prefix+String(i+1).padStart(2,'0'));
  if(JSON.stringify(ids)!==JSON.stringify(expected))failures.push(`${source}: bad card sequence ${ids}`);
}
const roles=(await fs.readdir(path.join(root,'proof-seven/characters'))).filter(p=>p.endsWith('.md'));
if(roles.length!==6)failures.push('Need six characters');
for(const name of ['layer-a.svg','layer-b.svg','layer-c.svg']){
  const s=await fs.readFile(path.join(root,'proof-seven/assets',name),'utf8');
  if(/<rect width="760" height="500" fill="[^n]/.test(s))failures.push(`${name}: opaque whole-sheet background`);
}
const proof=await fs.readFile(path.join(root,'proof-seven/assets/proof-layered.svg'),'utf8');
if(proof.includes('scale(.8)'))failures.push('Impressions use different scale');
const handouts=await fs.readFile(path.join(root,'proof-seven/print/handouts.html'),'utf8');
const handoutCount=(handouts.match(/<section class="document"/g)||[]).length;
if(handoutCount!==32)failures.push(`Expected 32 handout sections, got ${handoutCount}`);
for(const leak of ['核验与回响','主持人答复','主持人顺序'])if(handouts.includes(leak))failures.push(`Host-only section leaked: ${leak}`);
for(const id of ['P17','Q03','R01','F01'])if(!handouts.includes(`id="${id}"`))failures.push(`Missing handout ${id}`);
const layout=await fs.readFile(path.join(root,'proof-seven/print/booklet-layout.html'),'utf8');
const numbers=[...layout.matchAll(/class="num">(\d+)</g)].map(m=>Number(m[1]));
if(JSON.stringify(numbers)!==JSON.stringify([8,1,2,7,6,3,4,5]))failures.push(`Wrong booklet imposition: ${numbers}`);
if(layout.includes('送煤的也算成我的'))failures.push('Private letter leaked into default public layout');
let htmlImages=0;
for(const p of all.filter(p=>p.endsWith('.html'))){
  const text=await fs.readFile(p,'utf8');
  for(const m of text.matchAll(/<img[^>]+src="([^"]+)"/g)){
    if(/^https?:/.test(m[1]))continue;
    try{await fs.access(path.resolve(path.dirname(p),m[1]));htmlImages++;}catch{failures.push(`${p}: missing rendered image ${m[1]}`);}
  }
}
const baseline=JSON.parse(await fs.readFile(path.join(root,'.scratch/third-script/preserved-works.json'),'utf8'));
let preserved=0;
for(const entry of baseline.files){
  const b=await fs.readFile(path.join(root,entry.path));
  const hash=crypto.createHash('sha256').update(b).digest('hex');
  if(hash!==entry.sha256)failures.push(`Prior work changed: ${entry.path}`);else preserved++;
}
console.log(JSON.stringify({markdownFiles:md.length,validLocalLinks:localLinks,characters:roles.length,evidenceCards:17,workbookPages:8,stationCards:5,recollectionCards:1,handouts:handoutCount,bookletPageOrder:numbers,renderedLocalImages:htmlImages,unchangedPriorFiles:preserved,failures},null,2));
if(failures.length)process.exitCode=1;
