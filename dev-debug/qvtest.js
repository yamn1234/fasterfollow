document.querySelectorAll('style').forEach(function(x){if(x.textContent.indexOf('.ffqv-sum{margin:10px')>-1)x.remove()});(function(g){document.getElementById=function(i){return i==='angel-quick-view'?null:g.call(document,i)}})(document.getElementById);
/* Quick view v7: compact sheet (mobile + desktop), packages as tappable tiles, short summary,
   sticky bar with direct purchase (opens the guest mini checkout of ff-gc) + add to cart.
   No backslashes (Reparo-safe). Loads nothing extra until the visitor opens a quick view. */
(function () {
  
  var M = '.angel-quick-view-modal', Q = '#angel-quick-view';
  var st = document.createElement('style');
  st.textContent = [
    /* card button: amber pill with a label */
    '.s-product-card-quick-view-btn button{width:auto!important;min-width:0!important;height:30px!important;padding:0 10px 0 9px!important;border-radius:999px!important;background:#0d1426!important;opacity:1!important;border:1.5px solid #ffab01!important;color:#ffab01!important;gap:5px;display:inline-flex!important;align-items:center;box-shadow:0 4px 12px rgba(0,0,0,.45)}',
    '.s-product-card-quick-view-btn{opacity:1!important}.angel-quick-view-btn{position:relative;z-index:6}',
    '.s-product-card-quick-view-btn button i,.s-product-card-quick-view-btn button svg{color:#ffab01!important;fill:currentColor;font-size:15px!important}',
    '.s-product-card-quick-view-btn button:after{content:"عرض سريع";font-size:12px;font-weight:700;line-height:1;color:#ffab01;white-space:nowrap}',
    /* modal frame */
    M + ' .s-modal-body{width:min(880px,calc(100vw - 24px))!important;max-width:none!important;padding:0!important;border-radius:20px!important;overflow:hidden!important;background:#0d1426!important;border:1px solid rgba(255,171,1,.2)!important;box-shadow:0 30px 80px rgba(0,0,0,.6)!important}',
    M + ' .s-modal-header{position:absolute;top:12px;left:12px;z-index:20;margin:0!important;padding:0!important}',
    M + ' .s-modal-close{width:34px!important;height:34px!important;border-radius:50%!important;background:rgba(255,255,255,.08)!important;color:#fff!important;border:1px solid rgba(255,255,255,.14)!important}',
    Q + ' .angel-quick-view__wrapper{display:grid!important;grid-template-columns:minmax(0,40%) minmax(0,1fr);align-items:start;gap:0!important}',
    Q + ' .angel-quick-view__images{width:auto!important;max-width:none!important;padding:18px!important;position:sticky;top:0}',
    Q + ' .angel-quick-view__images img{border-radius:14px;aspect-ratio:1/1;object-fit:cover}',
    Q + ' .promotion-title,' + Q + ' .angel-quick-view__actions,' + Q + ' .angel-quick-view__brand,' + Q + ' .angel-quick-view__sub-title,' + Q + ' .angel-quick-view__description{display:none!important}',
    Q + ' .angel-quick-view__content{width:auto!important;max-width:none!important;max-height:min(84vh,660px);overflow-y:auto;overscroll-behavior:contain;padding:22px 20px 0 22px!important;scrollbar-width:thin}',
    Q + ' .angel-quick-view__details{display:flex!important;flex-direction:column;gap:10px}',
    Q + ' .angel-quick-view__details>a{order:1;padding-left:40px}',
    Q + ' .angel-quick-view__title{font-size:19px!important;line-height:1.5!important;margin:0!important}',
    Q + ' .ffqv-meta{order:2;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}',
    Q + ' .ffqv-meta .angel-quick-view__price,' + Q + ' .ffqv-meta .angel-quick-view__rating{margin:0!important}',
    Q + ' .angel-quick-view__price .total-price{font-size:24px!important;color:#ffab01!important;margin:0!important}',
    Q + ' .angel-quick-view__price .price{margin:0!important}',
    Q + ' .ffqv-sum{order:3}',
    Q + ' .angel-quick-view__form{order:4;margin:0!important}',
    '.ffqv-th{display:none;width:56px;height:56px;border-radius:12px;object-fit:cover;flex:none}',
    '.ffqv-sum{padding:10px 12px;border-radius:12px;background:rgba(255,171,1,.06);border:1px solid rgba(255,171,1,.2);font-size:13.5px;line-height:1.7;color:#d9dbe3}',
    '.ffqv-sum ul{margin:0;padding:0;list-style:none;display:grid;gap:3px}',
    '.ffqv-sum li{position:relative;padding-right:16px}',
    '.ffqv-sum li:before{content:"";position:absolute;right:2px;top:9px;width:6px;height:6px;border-radius:50%;background:#ffab01}',
    '.ffqv-sum p{margin:0 0 4px}',
    '.ffqv-sum a{display:inline-block;margin-top:4px;font-size:12.5px;font-weight:700;color:#ffab01;text-decoration:underline}',
    '.ffqv-lb{display:block;font-size:14px;font-weight:800;color:#fff;margin:2px 0 8px}',
    '.ffqv-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}',
    '.ffqv-it{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-width:0;padding:10px 12px;border-radius:12px;border:1.5px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);cursor:pointer;text-align:right;width:100%;color:#e9e9ee;font:inherit;transition:border-color .15s,background .15s}',
    '.ffqv-it b{font-size:14.5px;font-weight:800;line-height:1.35}',
    '.ffqv-it small{font-size:11.5px;color:#9ca3af;line-height:1.4}',
    '.ffqv-it em{font-style:normal;font-size:14px;font-weight:800;color:#ffab01;margin-top:2px;white-space:nowrap}',
    '.ffqv-it.on{border-color:#ffab01;background:rgba(255,171,1,.1)}',
    '.ffqv-hide{position:absolute!important;opacity:0!important;pointer-events:none!important;height:0!important;width:0!important;overflow:hidden!important}',
    Q + ' .s-product-options-option{display:block!important}',
    Q + ' .s-product-options-option-content{width:100%!important;max-width:none!important}',
    Q + ' .s-product-options-option-label{display:block;margin-bottom:6px}',
    /* sticky bar */
    Q + ' .angel-quick-view__add-to-cart{position:sticky;bottom:0;z-index:5;display:grid!important;grid-template-columns:1.4fr 1fr;gap:8px;margin:12px -20px 0 -22px!important;padding:12px 20px 14px 22px!important;background:#0d1426;border-top:1px solid rgba(255,255,255,.08);box-shadow:0 -12px 20px #0d1426}',
    Q + ' .angel-quick-view__add-to-cart>div:not(.ffqv-keep){display:none!important}',
    Q + ' .angel-quick-view__add-to-cart salla-add-product-button,' + Q + ' .angel-quick-view__add-to-cart salla-add-product-button button{width:100%!important;margin:0!important}',
    Q + ' .angel-quick-view__add-to-cart salla-add-product-button button{height:50px!important;border-radius:12px!important;background:transparent!important;border:1.5px solid rgba(255,171,1,.7)!important;color:#ffab01!important;box-shadow:none!important;font-size:15px!important;font-weight:700!important}',
    Q + ' .angel-quick-view__add-to-cart salla-add-product-button button *{color:#ffab01!important}',
    '.ffqv-buy{display:flex;align-items:center;justify-content:center;gap:7px;height:50px;border-radius:12px;border:0;background:linear-gradient(180deg,#ffc23d,#ffab01);color:#1a1206;font-family:inherit;font-size:16.5px;font-weight:800;cursor:pointer;box-shadow:0 8px 20px rgba(255,171,1,.28)}',
    '.ffqv-buy svg{width:17px;height:17px;flex:none}',
    '.ffqv-buy[disabled]{opacity:.6;cursor:wait}',
    /* mobile: one column, thumbnail instead of the big slider */
    '@media(max-width:767px){' +
      M + ' .s-modal-body{width:calc(100vw - 16px)!important;border-radius:18px!important}' +
      Q + ' .angel-quick-view__wrapper{grid-template-columns:minmax(0,1fr)}' +
      Q + ' .angel-quick-view__images{display:none!important}' +
      Q + ' .angel-quick-view__content{max-height:86vh;padding:16px 14px 0 14px!important}' +
      Q + ' .angel-quick-view__details>a{display:flex;align-items:center;gap:10px}' +
      '.ffqv-th{display:block}' +
      Q + ' .angel-quick-view__title{font-size:16px!important}' +
      Q + ' .angel-quick-view__price .total-price{font-size:21px!important}' +
      '.ffqv-list{gap:7px}.ffqv-it{padding:9px 10px}.ffqv-it b{font-size:13.5px}' +
      Q + ' .angel-quick-view__add-to-cart{margin:10px -14px 0!important;padding:10px 14px 12px!important;grid-template-columns:1.5fr 1fr}' +
      '.ffqv-buy{font-size:15.5px;height:48px}' + Q + ' .angel-quick-view__add-to-cart salla-add-product-button button{height:48px!important;font-size:14px!important}' +
    '}'
  ].join('');
  document.head.appendChild(st);

  var TIMEW = ['خلال', 'ساع', 'يوم', 'ايام', 'أيام', 'دقيق', 'شهر', 'اسبوع', 'أسبوع'];
  function hasAny(s, a) { for (var i = 0; i < a.length; i++) if (s.indexOf(a[i]) > -1) return true; return false; }
  function num(t) { var m = String(t || '').replace(/,/g, '').match(/[0-9]+([.][0-9]+)?/); return m ? parseFloat(m[0]) : 0; }
  function cur(t) { var c = String(t || '').replace(/[0-9][0-9.,]*/g, '').replace(/[()+]/g, '').trim(); return c || 'ر.س'; }
  function money(v, c) { return Number(v).toLocaleString('en-US', { maximumFractionDigits: v < 100 ? 2 : 0 }) + ' ' + c; }
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  /* "دعم 100 متابع ... (خلال 12 ساعة) (56.7 ج.م)" -> {name, time, add} */
  function parse(txt) {
    var r = { name: txt, time: '', add: 0 }, s = txt.trim();
    var a = s.lastIndexOf('('), b = s.lastIndexOf(')');
    if (a > -1 && b === s.length - 1) {
      var inner = s.slice(a + 1, b);
      if (/[0-9]/.test(inner) && !hasAny(inner, TIMEW)) { r.add = num(inner); s = s.slice(0, a).trim(); }
    }
    var k = s.indexOf('(خلال');
    if (k > -1) { var e = s.indexOf(')', k); if (e > -1) { r.time = s.slice(k + 1, e).trim(); s = (s.slice(0, k) + s.slice(e + 1)).replace(/ +/g, ' ').trim(); } }
    var w = s.split(' ');
    for (var i = 0; i < w.length; i++) {
      var n = w[i].replace(/[,،]/g, '');
      if (n && !isNaN(+n) && +n > 0) { r.name = w[i] + (w[i + 1] ? ' ' + w[i + 1] : ''); if (!r.time) r.time = w.slice(i + 2).join(' ').slice(0, 60); return r; }
    }
    r.name = s; return r;
  }
  function priceBox(root) { return root.querySelector('.angel-quick-view__price .starting-or-normal-price') || root.querySelector('.angel-quick-view__price'); }

  function layout(root) {
    var det = root.querySelector('.angel-quick-view__details'); if (!det || det.querySelector('.ffqv-meta')) return;
    var meta = document.createElement('div'); meta.className = 'ffqv-meta';
    var pr = det.querySelector('.angel-quick-view__price'), ra = det.querySelector('.angel-quick-view__rating');
    if (pr) meta.appendChild(pr); if (ra) meta.appendChild(ra);
    det.insertBefore(meta, det.firstChild);
    var img = root.querySelector('.angel-quick-view__images img'), a = det.querySelector(':scope > a');
    if (img && a && !a.querySelector('.ffqv-th')) { var th = document.createElement('img'); th.className = 'ffqv-th'; th.alt = ''; th.src = img.currentSrc || img.src; a.insertBefore(th, a.firstChild); }
  }

  function summary(root, html, url) {
    if (root.querySelector('.ffqv-sum')) return;
    var box = document.createElement('div'); box.innerHTML = html;
    var lead = '', qs = box.querySelectorAll('blockquote');
    for (var i = 0; i < qs.length; i++) if (qs[i].textContent.indexOf('باختصار') > -1) { lead = qs[i].textContent.replace('باختصار:', '').trim(); break; }
    if (!lead) { var p = box.querySelector('p'); if (p) lead = p.textContent.trim(); }
    if (lead.length > 170) { lead = lead.slice(0, 170); lead = lead.slice(0, lead.lastIndexOf(' ')) + '…'; }
    var ul = box.querySelector('ul'), li = '';
    if (ul) li = [].slice.call(ul.querySelectorAll('li'), 0, 3).map(function (x) { return '<li>' + esc(x.textContent.trim()) + '</li>'; }).join('');
    if (!lead && !li) return;
    var d = document.createElement('div'); d.className = 'ffqv-sum';
    d.innerHTML = (lead ? '<p>' + esc(lead) + '</p>' : '') + (li ? '<ul>' + li + '</ul>' : '') + (url ? '<a href="' + esc(url) + '">كل تفاصيل الخدمة</a>' : '');
    var det = root.querySelector('.angel-quick-view__details'); if (det) det.appendChild(d);
  }

  function packages(root) {
    var pb = priceBox(root), base = num(pb && pb.textContent), c = cur(pb && pb.textContent);
    root.querySelectorAll('select.s-form-control').forEach(function (sel) {
      if (sel.__ffqv || sel.options.length < 3) return; sel.__ffqv = 1;
      var list = document.createElement('div'); list.className = 'ffqv-list';
      [].slice.call(sel.options).forEach(function (o) {
        if (!o.value || o.disabled) return;
        var p = parse(o.textContent), total = base + p.add;
        var b = document.createElement('button'); b.type = 'button'; b.className = 'ffqv-it' + (sel.value === o.value ? ' on' : '');
        b.innerHTML = '<b></b>' + (p.time ? '<small></small>' : '') + '<em></em>';
        b.firstChild.textContent = p.name;
        if (p.time) b.children[1].textContent = p.time;
        b.lastChild.textContent = money(total, c);
        b.addEventListener('click', function () {
          sel.value = o.value; sel.dispatchEvent(new Event('change', { bubbles: true })); sel.dispatchEvent(new Event('input', { bubbles: true }));
          [].forEach.call(list.children, function (x) { x.classList.remove('on'); }); b.classList.add('on');
        });
        list.appendChild(b);
      });
      if (!list.children.length) return;
      sel.classList.add('ffqv-hide');
      sel.parentNode.insertBefore(list, sel.nextSibling);
    });
  }

  function buyNow(root, id) {
    var bar = root.querySelector('.angel-quick-view__add-to-cart');
    if (!bar || bar.querySelector('.ffqv-buy')) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'ffqv-buy';
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.2 2 4.6 13.6h6.2L9.9 22l8.6-11.7h-6.3L13.2 2z"/></svg><span>شراء مباشر</span>';
    bar.insertBefore(b, bar.firstChild);
    b.addEventListener('click', function () {
      var qb = id && document.querySelector('.ffqb[data-pid="' + id + '"]');
      if (qb) {
        var x = document.querySelector(M + ' .s-modal-close'); if (x) x.click();
        setTimeout(function () { qb.click(); }, 260);
        return;
      }
      /* fallback: add to cart then go to the cart */
      var add = bar.querySelector('salla-add-product-button button'); if (!add) return;
      var done = false, once = function () { if (done) return; done = true; location.href = '/cart'; };
      try { if (window.salla && salla.event && salla.event.on) salla.event.on('cart::item.added', once); } catch (e) {}
      b.disabled = true; setTimeout(function () { b.disabled = false; }, 4000);
      add.click();
    });
  }

  function enhance(root) {
    if (!root) return;
    var form = root.querySelector('.angel-quick-view__form'); if (!form) return;
    layout(root);
    if (form.__ffqv) { packages(root); return; } form.__ffqv = 1;
    var lb = root.querySelector('.s-product-options-option-label'); if (lb) lb.classList.add('ffqv-lb');
    var pe = root.querySelector('[product-id]'), id = pe ? pe.getAttribute('product-id') : '';
    packages(root); buyNow(root, id);
    var link = (root.querySelector('.angel-quick-view__details > a') || {}).href || '';
    if (id && window.salla && salla.api && salla.api.product && salla.api.product.getDetails) {
      salla.api.product.getDetails(id).then(function (r) { var d = (r && r.data) || {}; if (d.description) summary(root, d.description, link); }).catch(function () {});
    }
  }

  var tm = 0, mo = new MutationObserver(function () {
    if (tm) return;
    tm = setTimeout(function () { tm = 0; var q = document.querySelector('#angel-quick-view'); if (q) enhance(q); }, 120);
  });
  mo.observe(document.body || document.documentElement, { childList: true, subtree: true });
})();

'ok'