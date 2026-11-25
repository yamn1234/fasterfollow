import re
s=open('canva.html').read()
STAR='<svg viewBox="0 0 24 24"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>'
BOLT='<svg viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>'
SHIELD='<svg viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg>'
USER='<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>'
PLAY='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M10 8.5l6 3.5-6 3.5z"/></svg>'
DL='<svg viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>'
APPS='<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>'
CLOUD='<svg viewBox="0 0 24 24"><path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9.5 4.3 4.3 0 0 0 7 18z"/></svg>'
UP='<svg viewBox="0 0 24 24"><path d="M12 20V9M7 14l5-5 5 5M5 4h14"/></svg>'
SMILE='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8M9 9.5h.01M15 9.5h.01"/></svg>'
SCR='<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>'
TICK='<div class="tick"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>'
P=[
 dict(n='crunchyroll',kick='على حسابك',a='كرانشي رول',b='سنة كاملة',lead='ميغا فان: <b>أنمي بدون إعلانات</b> وحلقات جديدة أول بأول.',
  feats=[(USER,'يتفعّل على حسابك','· مو حساب مشترك'),(PLAY,'بدون إعلانات','· مكتبة الأنمي كاملة'),(DL,'تحميل الحلقات','· شاهد بدون نت'),(SHIELD,'ضمان ذهبي','· طول مدة الاشتراك')],
  app='Crunchyroll',badge='MEGA FAN',rows=[(PLAY,'بدون إعلانات','مشاهدة متواصلة'),(DL,'تحميل الحلقات','شاهد بدون نت'),(SCR,'أكثر من جهاز','بنفس الوقت')],btn='ابدأ المشاهدة',done=('تم تفعيل ميغا فان','على حسابك · 12 شهر')),
 dict(n='adobe',kick='على حسابك',a='أدوبي كريتيف',b='كلاود برو',lead='<b>أكثر من 20 تطبيق</b> من أدوبي لمدة شهر كامل على حسابك.',
  feats=[(USER,'يتفعّل على حسابك','· بكود تفعيل'),(APPS,'فوتوشوب وبريمير وإليستريتر','· وأكثر'),(CLOUD,'مساحة سحابية وخطوط','· Adobe Fonts'),(SHIELD,'ضمان ذهبي','· طول مدة الاشتراك')],
  app='Creative Cloud',badge='PRO',rows=[(APPS,'Photoshop · Illustrator','مفعّلة'),(PLAY,'Premiere · After Effects','مفعّلة'),(CLOUD,'التخزين السحابي','متاح')],btn='افتح التطبيقات',done=('تم تفعيل كريتيف كلاود','على حسابك · شهر')),
 dict(n='discord',kick='على حسابك',a='ديسكورد نيترو',b='3 شهور',lead='<b>نيترو بكامل مزاياه</b> بسعر أقل بكثير من الرسمي.',
  feats=[(USER,'يتفعّل على حسابك','· بكود تفعيل'),(UP,'رفع ملفات لين 500 ميجا','· وبث بجودة عالية'),(SMILE,'إيموجي وستيكرات','· بكل السيرفرات'),(SHIELD,'ضمان ذهبي','· طول مدة الاشتراك')],
  app='Discord',badge='NITRO',rows=[(UP,'رفع ملفات أكبر','لين 500 ميجا'),(SCR,'بث بجودة عالية','وشير شاشة'),(SMILE,'إيموجي مخصصة','بكل مكان')],btn='استخدم نيترو',done=('تم تفعيل نيترو','على حسابك · 3 شهور')),
]
cs=s.index('<div class="copy">');ce=s.index('<div class="cta">')
as_=s.index('<div class="app">');ae=s.index('<div class="home"></div>')
for d in P:
  f=''.join(f'<div class="f"><i>{ic}</i><p>{t} <small>{sm}</small></p></div>' for ic,t,sm in d['feats'])
  copy=f'<div class="copy"><span class="kick">{d["kick"]}</span><h1><span class="a">{d["a"]}</span><span class="b">{d["b"]}</span></h1><p class="lead">{d["lead"]}</p><div class="feats">{f}</div></div>'
  rows='<div class="gap6"></div>'.join(f'<div class="row ok"><div class="ic">{ic}</div><div class="tx"><b>{t}</b><s>{sm}</s></div>{TICK}</div>' for ic,t,sm in d['rows'])
  app=f'<div class="app"><div class="hero"><b>{d["app"]}</b><span class="pro">{d["badge"]}</span></div>{rows}<div class="gap6"></div><div class="btn">{d["btn"]}</div><div class="done"><div class="big"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><b>{d["done"][0]}</b><s>{d["done"][1]}</s></div></div>\n'
  out=s[:cs]+copy+s[ce:as_]+app+s[ae:]
  open(d['n']+'.html','w').write(out)
