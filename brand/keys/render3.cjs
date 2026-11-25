const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1000,height:1000}});
for(const n of ['crunchyroll','adobe','discord']){await p.goto('file://'+process.cwd()+'/'+n+'.html');await p.waitForTimeout(500);
const m=await p.evaluate(()=>{const c=document.querySelector('.copy').getBoundingClientRect(),t=document.querySelector('.cta').getBoundingClientRect(),v=(document.querySelector('.win')||document.querySelector('.ph')).getBoundingClientRect();return [Math.round(c.bottom),Math.round(t.top),Math.round(v.bottom),document.fonts.check('800 20px T')]});
console.log(n,m.join(' '));await p.screenshot({path:n+'.png'});}
await b.close();})();
