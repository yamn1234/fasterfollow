/* ff-ty: branded hero on the Salla thank-you page (replaces the confetti illustration) */
(function () {
  if (window.__ffTy) return; window.__ffTy = 1;
  var LOGO = 'https://cdn.jsdelivr.net/gh/yamn1234/fasterfollow@main/brand/logo-badge-176.webp';
  function isTy() { return /^[/]thankyou[/]/.test(location.pathname) || (document.body && document.body.classList.contains('thank-you')); }
  if (!isTy()) return;
  var st = document.createElement('style');
  st.textContent =
    'body.thank-you .container.mt-4 .py-10>img,body.thank-you .container.mt-4 .py-10>svg,body.thank-you .container.mt-4 .py-10>picture,body.thank-you .container.mt-4 .py-10>lottie-player,body.thank-you .container.mt-4 .py-10>.ff-ty-old{display:none!important}' +
    '.ff-ty-hero{display:flex;flex-direction:column;align-items:center;margin:4px auto 14px}' +
    '.ff-ty-hero .rg{position:relative;width:118px;height:118px;border-radius:50%;padding:4px;background:conic-gradient(from 210deg,#ffd76a,#ffab01,#ff8a00,#ffd76a);box-shadow:0 0 0 6px rgba(255,171,1,.08),0 12px 34px -10px rgba(255,150,0,.55)}' +
    '.ff-ty-hero .in{width:100%;height:100%;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden}' +
    '.ff-ty-hero .in img{width:100%;height:100%;object-fit:cover;display:block}' +
    '.ff-ty-hero .ok{position:absolute;top:0;left:0;width:34px;height:34px;border-radius:50%;background:#10b981;border:3px solid #111a2e;display:flex;align-items:center;justify-content:center}' +
    '.ff-ty-hero .sp{position:absolute;color:#ffc53d;opacity:.9}.ff-ty-hero .sp.a{top:-6px;right:-14px;width:16px}.ff-ty-hero .sp.b{top:30px;left:-22px;width:11px;opacity:.65}.ff-ty-hero .sp.c{bottom:-2px;right:-20px;width:9px;opacity:.5}' +
    '.ff-ty-hero .tg{margin-top:14px;display:inline-flex;align-items:center;gap:6px;padding:5px 14px;border-radius:999px;background:rgba(255,171,1,.1);border:1px solid rgba(255,171,1,.3);color:#ffc53d;font-size:12.5px;font-weight:700}' +
    '@media (prefers-reduced-motion:no-preference){.ff-ty-hero .sp{animation:ffTw 2.6s ease-in-out infinite}.ff-ty-hero .sp.b{animation-delay:.9s}.ff-ty-hero .sp.c{animation-delay:1.7s}}' +
    '@keyframes ffTw{0%,100%{transform:scale(.85);opacity:.35}50%{transform:scale(1.1);opacity:1}}';
  document.head.appendChild(st);
  var star = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0c.7 6.4 5.6 11.3 12 12-6.4.7-11.3 5.6-12 12-.7-6.4-5.6-11.3-12-12C6.4 11.3 11.3 6.4 12 0z"/></svg>';
  function run() {
    var box = document.querySelector('.container.mt-4 .py-10');
    if (!box || box.querySelector('.ff-ty-hero')) return !!box;
    var h1 = box.querySelector('h1');
    if (!h1) return false;
    // كل اللي قبل العنوان (صورة الاحتفال) ينخفى
    var n = box.firstElementChild;
    while (n && n !== h1 && !n.contains(h1)) { if (n.querySelector('img,svg,picture,lottie-player') || /^(IMG|SVG|PICTURE)$/i.test(n.tagName)) n.classList.add('ff-ty-old'); n = n.nextElementSibling; }
    var hero = document.createElement('div');
    hero.className = 'ff-ty-hero';
    hero.innerHTML = '<div class="rg"><div class="in"><img src="' + LOGO + '" width="110" height="110" alt="فاستر فولو" decoding="async"></div>' +
      '<span class="ok"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>' +
      '<span class="sp a">' + star + '</span><span class="sp b">' + star + '</span><span class="sp c">' + star + '</span></div>' +
      '<div class="tg">شكراً لثقتك بفاستر فولو — نسعد بخدمتك دايماً</div>';
    var anchor = h1;
    while (anchor.parentElement && anchor.parentElement !== box) anchor = anchor.parentElement;
    box.insertBefore(hero, anchor);
    return true;
  }
  var tries = 0;
  (function loop() { if (run() || ++tries > 40) return; setTimeout(loop, 150); })();
})();
