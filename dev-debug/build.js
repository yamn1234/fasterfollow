const postcss=require('postcss');const fs=require('fs');const zlib=require('zlib');
const R='/home/claude/fasterfollow/';
const S=JSON.parse(fs.readFileSync(R+'dev-debug/sel.json','utf8'));
const hit=new Set();fs.readFileSync(process.argv[2]||'ranges.txt','utf8').trim().split(/\s+/).forEach(t=>{const [a,b]=t.split('-').map(Number);for(let i=a;i<=(b??a);i++)hit.add(S[i])});
function reduce(css){const root=postcss.parse(css);let drop=0;root.walkRules(r=>{const p=r.parent;if(p.type==='atrule'&&/keyframes/i.test(p.name))return;if(!hit.has(r.selector)){r.remove();drop++}});let c=1;while(c){c=0;root.walkAtRules(a=>{if(a.nodes&&a.nodes.length===0){a.remove();c=1}})}return [root.toString(),drop]}
const main=fs.readFileSync(R+'ff-crit-main.v1.css','utf8');
const critPh=fs.readFileSync(R+'ff-crit-app.v2.ph.css','utf8');
const crit=critPh.split('¤').join('\\');
const [m2,dm]=reduce(main);const [c2,dc]=reduce(crit);
const gz=s=>zlib.gzipSync(Buffer.from(s)).length;
console.log('main',Buffer.byteLength(main),gz(main),'->',Buffer.byteLength(m2),gz(m2),'dropped',dm);
console.log('crit',Buffer.byteLength(crit),gz(crit),'->',Buffer.byteLength(c2),gz(c2),'dropped',dc);
fs.writeFileSync('main.red.css',m2);fs.writeFileSync('crit.red.css',c2);
