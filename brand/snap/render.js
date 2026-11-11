const {chromium}=require('playwright');const fs=require('fs');
eval(fs.readFileSync('data.js','utf8'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1000,height:1000},deviceScaleFactor:Number(process.env.DSF||1)});
await p.goto('file://'+process.cwd()+'/tpl.html');await p.waitForTimeout(400);
const only=process.argv.slice(2).map(Number);
for(const d of DATA){ if(only.length&&!only.includes(d.id)) continue;
 await p.evaluate(x=>render(x),d); await p.waitForTimeout(120);
 const ov=await p.evaluate(()=>{const h=document.getElementById('hb');return [h.style.fontSize, document.querySelector('.copy').getBoundingClientRect().bottom, document.querySelector('.cta').getBoundingClientRect().top]});
 console.log(d.id,ov.join(' '));
 await p.screenshot({path:'out/'+d.id+'.png'});}
await b.close();})();
