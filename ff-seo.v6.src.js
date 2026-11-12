/* ff-seo v6 — Faster Follow structured data + H1 cleanup. No backslashes (Reparo-safe). */
/* First-order coupon popup (FA10, from ff-main) is turned off: block it before ff-main runs, and hide it if it was already created. The coupon stays in the hero. */
window.__ffPromo = 1;
(function () { var s = document.createElement('style'); s.textContent = '#ffp{display:none!important}'; (document.head || document.documentElement).appendChild(s); var p = document.getElementById('ffp'); if (p) p.remove(); })();
/* Sub-category chips: hide empty image boxes (categories without an image rendered an empty dark square) and give every chip the same pill look. */
(function () {
  if (document.getElementById('ff-subcat-fix')) return;
  var s = document.createElement('style'); s.id = 'ff-subcat-fix';
  s.textContent = '.sub-categories .selected-cat-item:has(img:not([src])),.sub-categories .selected-cat-item:has(img[src=""]){display:none!important}a.sub-categories{background:rgb(41,41,41);padding:8px;border-radius:8px;justify-content:center;min-height:56px}';
  (document.head || document.documentElement).appendChild(s);
})();
/* Quiet background calls: requests made by our own scripts (cdn.jsdelivr.net/gh/yamn1234) never show Salla error toasts to the shopper.
   Also: ff-main's price refresh must only ask for a product price on product pages (on /cart it was asking with the cart id -> 410 toast). */
(function () {
  if (window.__ffQuiet) return; window.__ffQuiet = 1;
  var onProduct = /p[0-9]+$/.test(location.pathname);
  function ours() { try { return (new Error().stack || '').indexOf('yamn1234/fasterfollow') > -1; } catch (e) { return false; } }
  function wrap(obj, name, guard) {
    if (!obj || typeof obj[name] !== 'function' || obj[name].__ffq) return;
    var orig = obj[name];
    var fn = function () {
      var self = this, args = arguments;
      if (guard && guard(args)) return Promise.reject(new Error('ff-skip'));
      if (!ours() || !salla.api || !salla.api.withoutNotifier) return orig.apply(self, args);
      return salla.api.withoutNotifier(function () { return orig.apply(self, args); });
    };
    fn.__ffq = 1; obj[name] = fn;
  }
  function priceGuard(args) {
    if (onProduct || !ours()) return false;
    return true;
  }
  var n = 0;
  (function go() {
    var s = window.salla;
    if (!s || !s.api || !s.api.product) { if (++n < 100) setTimeout(go, 100); return; }
    wrap(s.api.product, 'getPrice', priceGuard);
    if (s.product && s.product.api && s.product.api !== s.api.product) wrap(s.product.api, 'getPrice', priceGuard);
    wrap(s.api.product, 'fetch'); wrap(s.api.product, 'getDetails');
    if (s.api.component) wrap(s.api.component, 'getReviews');
    if (s.cart) wrap(s.cart, 'details');
    if (s.api.cart) wrap(s.api.cart, 'details');
  })();
})();
/* Landing pages: Reparo drops one Next.js chunk (framework), so the page stays blank. Re-add any missing chunk from Salla's own build list. */
(function () {
  if (location.pathname.indexOf('/pages/lp') !== 0 || window.__ffLpFix) return; window.__ffLpFix = 1;
  var B = 'https://cdn.assets.salla.network/theme-landing-page/master/';
  /* Run only after full load: starting Next.js while the page is still parsing (Rocket Loader) can hang the tab. */
  if (document.readyState === 'complete') setTimeout(go, 300); else window.addEventListener('load', function () { setTimeout(go, 300); });
  function go() { if (window.next) return; fetch(B + 'index.html').then(function (r) { return r.text(); }).then(function (h) {
    if (window.next) return;
    var have = {};
    [].forEach.call(document.scripts, function (s) { if (s.src) have[s.src.split('?')[0]] = 1; });
    var re = /<script src="([^"]+_next[^"]+[.]js)"/g, m;
    while ((m = re.exec(h))) {
      var u = m[1];
      if (have[u] || u.indexOf('polyfills') > -1 || u.indexOf(B) !== 0) continue;
      var s = document.createElement('script'); s.src = u; s.async = true; document.head.appendChild(s);
    }
  }).catch(function () {}); }
})();
/* Landing pages: Salla's HTML block doesn't run inline scripts, so page widgets get their JS here. */
(function () {
  if (location.pathname.indexOf('/pages/lp') !== 0 || window.__ffLpUi) return; window.__ffLpUi = 1;
  window.ffQ = function (b) { var i = b.closest('.ff-faq-item'); if (!i) return; var o = i.classList.contains('ff-faq-open'); document.querySelectorAll('.ff-faq-item.ff-faq-open').forEach(function (e) { e.classList.remove('ff-faq-open'); }); if (!o) i.classList.add('ff-faq-open'); };
  var tries = 0;
  (function wait() {
    var c = document.getElementById('igx-cnt');
    if (!c) { if (++tries < 40) setTimeout(wait, 500); return; }
    if (c.getAttribute('data-on')) return; c.setAttribute('data-on', '1');
    var n = 1250, names = ['عبدالله', 'نورة', 'فهد', 'ريم', 'سلطان', 'لمى', 'خالد', 'سارة', 'ناصر', 'جود'], i = 0;
    setInterval(function () { var e = document.getElementById('igx-cnt'); if (e) { n += Math.floor(Math.random() * 3) + 1; e.textContent = n.toLocaleString('en-US'); } }, 1400);
    setInterval(function () { var t = document.getElementById('igx-tst'); if (t) { i = (i + 1) % names.length; t.textContent = 'بدأ يتابعك: ' + names[i]; } }, 3200);
    document.addEventListener('click', function (ev) {
      var b = ev.target.closest && ev.target.closest('#igx-code'); if (!b) return;
      try { navigator.clipboard.writeText('FA10'); } catch (e) {}
      b.textContent = 'تم النسخ'; setTimeout(function () { b.textContent = 'FA10'; }, 1800);
    });
    var s = document.getElementById('igx-stk'), pk = document.getElementById('igx-pk');
    if (s && pk && 'IntersectionObserver' in window) {
      var seen = false;
      window.addEventListener('scroll', function () { s.classList.toggle('on', window.scrollY > 500 && !seen); }, { passive: true });
      new IntersectionObserver(function (e) { seen = e[0].isIntersecting; if (seen) s.classList.remove('on'); }).observe(pk);
    }
  })();
})();
(function () {
  if (window.__ffSeo) return; window.__ffSeo = 1;
  var SITE = location.origin, BRAND = 'فاستر فولو';
  var path = decodeURI(location.pathname);
  function meta(n) { var m = document.querySelector('meta[property="' + n + '"],meta[name="' + n + '"]'); return m ? m.content : ''; }
  function canon() { var l = document.querySelector('link[rel=canonical]'); return l ? l.href : location.href.split('?')[0]; }
  function txt(e) { return e ? e.textContent.replace(/[ ]+/g, ' ').trim() : ''; }
  function hasType(t) {
    return [].some.call(document.querySelectorAll('script[type="application/ld+json"]'), function (s) {
      /* top-level types only: Salla's related-products ItemList nests Product items and must not count */
      try { var j = JSON.parse(s.textContent); return [].concat(j).some(function (x) {
        return x && ([].concat(x['@type']).indexOf(t) > -1 || [].concat(x['@graph'] || []).some(function (g) { return [].concat(g['@type']).indexOf(t) > -1; }));
      }); } catch (e) { return false; }
    });
  }
  function add(obj, id) {
    if (document.getElementById(id)) return;
    var s = document.createElement('script'); s.type = 'application/ld+json'; s.id = id;
    s.textContent = JSON.stringify(obj); document.head.appendChild(s);
  }
  function crumbs(list) {
    return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: list.map(function (c, i) {
      return { '@type': 'ListItem', position: i + 1, name: c[0], item: c[1] }; }) };
  }
  function h1() { return txt(document.querySelector('h1')) || document.title.split('|')[0].trim(); }

  /* keep a single H1: extra H1s become H2 with same classes */
  function fixH1() {
    var hs = document.querySelectorAll('h1');
    for (var i = 1; i < hs.length; i++) {
      var n = document.createElement('h2'); n.className = hs[i].className; n.innerHTML = hs[i].innerHTML;
      hs[i].parentNode.replaceChild(n, hs[i]);
    }
  }

  /* same endpoint the store's reviews summary uses */
  async function rating(id) {
    try {
      var r = ((await (function(f){try{return window.salla&&salla.api&&salla.api.withoutNotifier?salla.api.withoutNotifier(f):f()}catch(e){return Promise.reject(e)}})(function () { return salla.api.request('rating/summary/' + id); })) || {}).data || {};
      var cnt = +r.count; if (!cnt) return null;
      var sum = 0, w = 0, rv = r.reviews || {};
      Object.keys(rv).forEach(function (k) { sum += (+k) * (+rv[k]); w += +rv[k]; });
      var val = w ? Math.round(sum / w * 10) / 10 : +r.rating;
      if (!val) return null;
      return { '@type': 'AggregateRating', ratingValue: val, reviewCount: cnt, bestRating: 5, worstRating: 1 };
    } catch (e) { return null; }
  }

  /* Salla's own Product schema (served to Googlebot) puts the base price (often 1 SAR) before required options.
     Patch it to the real starting price shown on the page. */
  function patchSalla(lo, hi, cur) {
    [].forEach.call(document.querySelectorAll('script[type="application/ld+json"]'), function (s) {
      if (s.id === 'ff-ld-product') return;
      var j; try { j = JSON.parse(s.textContent); } catch (e) { return; }
      var changed = false;
      var items = [];
      [].concat(j).forEach(function (x) { if (x) { items.push(x); [].concat(x['@graph'] || []).forEach(function (g) { items.push(g); }); } });
      items.forEach(function (x) {
        if (!x || [].concat(x['@type']).indexOf('Product') < 0 || !x.offers) return;
        [].concat(x.offers).forEach(function (o) {
          if (!isNaN(+o.price) && +o.price < lo) { /* includes 0 */
            o.price = lo; o.priceCurrency = cur;
            if (o.priceSpecification) { o.priceSpecification.price = lo; o.priceSpecification.priceCurrency = cur; }
            changed = true;
          }
        });
      });
      if (changed) { s.textContent = JSON.stringify(j); s.setAttribute('data-ff-patched', lo + '-' + hi); }
    });
  }

  async function product(id) {
    var sallaHas = hasType('Product');
    var d = {};
    try { d = (await (function(f){try{return window.salla&&salla.api&&salla.api.withoutNotifier?salla.api.withoutNotifier(f):f()}catch(e){return Promise.reject(e)}})(function () { return salla.api.product.getDetails(+id, ['options']); })).data || {}; } catch (e) {}
    /* API returns prices in the visitor's display currency: convert back to the store base currency (SAR) */
    var bc = d.base_currency_price || {};
    var base = +d.price || 0;
    var f = 1;
    try { var rates = salla.config.get('currencies') || {}, code = salla.config.get('user.currency_code');
      if (code && rates[code] && +rates[code].amount) f = 1 / +rates[code].amount; } catch (e) {}
    if (f === 1 && bc.amount && base) f = bc.amount / base;
    var cur = bc.currency || 'SAR';
    function money(x) { return Math.round(x * f * 100) / 100; }
    var ops = d.options || [], adds = [];
    function vals(o) {
      var ok = function (x) { return money(+x.additional_price || 0) < 99999 && !/غير متاح/.test(x.name || ''); };
      var a = (o.details || []).filter(function (x) { return !x.is_out && ok(x); });
      /* fully sold-out product: still report its real price (marked OutOfStock) instead of 0 */
      return a.length ? a : (o.details || []).filter(ok);
    }
    /* required options; a value can unlock dependent required options (visibility_condition), priced on top of it */
    ops.forEach(function (o) {
      if (!o.required || o.visibility_condition) return;
      var vs = vals(o); if (!vs.length) return;
      var lo = Infinity, hi = -Infinity, cnt = 0;
      vs.forEach(function (v) {
        var l = +v.additional_price || 0, h = l, c = 1;
        ops.forEach(function (dep) {
          var vc = dep.visibility_condition;
          if (!vc || vc.option != o.id || vc.value != v.id) return;
          /* a free parent value (e.g. duration = 0) priced only by its quantity sub-option: count it even if not flagged required */
          if (!dep.required && (+v.additional_price || 0) > 0) return;
          var p = vals(dep).map(function (x) { return +x.additional_price || 0; });
          if (!p.length) return;
          l += Math.min.apply(0, p); h += Math.max.apply(0, p); c *= p.length;
        });
        lo = Math.min(lo, l); hi = Math.max(hi, h); cnt += c;
      });
      adds.push([lo, hi, cnt]);
    });
    var lo = base, hi = base, n = 1;
    adds.forEach(function (a) { lo += a[0]; hi += a[1]; n *= a[2]; });
    lo = money(lo); hi = money(hi);
    if (sallaHas) { if (lo > 0) patchSalla(lo, hi, cur); return; }
    var avail = (d.is_available === false || d.is_out_of_stock) ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock';
    var offers = hi > lo
      ? { '@type': 'AggregateOffer', priceCurrency: cur, lowPrice: lo, highPrice: hi, offerCount: n, availability: avail, url: canon() }
      : { '@type': 'Offer', priceCurrency: cur, price: lo, availability: avail, url: canon(), itemCondition: 'https://schema.org/NewCondition' };
    var img = (d.image && d.image.url) || meta('og:image');
    var p = { '@context': 'https://schema.org', '@type': 'Product', '@id': canon() + '#product', name: h1() || d.name,
      description: meta('description') || meta('og:description'), image: img ? [img] : undefined, sku: String(d.sku || id),
      brand: { '@type': 'Brand', name: BRAND }, url: canon(), offers: offers };
    if (lo <= 0) delete p.offers;
    var r = await rating(id);
    if (r) p.aggregateRating = r;
    if (!p.offers && !p.aggregateRating) return;
    add(p, 'ff-ld-product');
  }


  function article() {
    if (hasType('BlogPosting') || hasType('Article')) return;
    var img = meta('og:image'), t = document.querySelector('time[datetime]');
    var a = { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: h1().slice(0, 110), description: meta('description'),
      mainEntityOfPage: canon(), url: canon(), inLanguage: 'ar', image: img ? [img] : undefined,
      author: { '@type': 'Organization', name: BRAND, url: SITE },
      publisher: { '@type': 'Organization', name: BRAND, logo: { '@type': 'ImageObject', url: (window.salla && salla.config.get('store.logo')) || img } } };
    if (t) a.datePublished = t.getAttribute('datetime');
    add(a, 'ff-ld-article');
  }

  /* images with empty alt: linked thumbnails get their link's title/text/slug, the rest get the page heading */
  function fixAlt() {
    [].forEach.call(document.querySelectorAll('img'), function (im) {
      if ((im.getAttribute('alt') || '').trim()) return;
      var a = im.closest('a'), t = '';
      if (a) {
        t = (a.getAttribute('title') || a.getAttribute('aria-label') || txt(a)).trim();
        if (!t && a.href) { try { t = decodeURI(a.pathname).split('/').filter(Boolean).slice(-2, -1)[0] || ''; } catch (e) {} t = t.split('-').join(' '); }
      }
      im.setAttribute('alt', (t || h1()).slice(0, 120));
    });
  }

  async function run() {
    fixH1(); fixAlt();
    var home = [BRAND, SITE + '/'];
    var m = path.match(/[/]p([0-9]+)$/);
    if (m) {
      await product(m[1]);
      if (!hasType('BreadcrumbList')) add(crumbs([home, [h1(), canon()]]), 'ff-ld-bc');
    } else if (/^[/]blog[/].+[/]a-?[0-9]+$/.test(path)) {
      article(); /* Salla already renders a BreadcrumbList on blog posts */
    }
  }
  /* Cloudflare Rocket Loader is on: window 'load' listeners are unreliable, so poll until DOM + Salla SDK are ready */
  var t0 = Date.now();
  (function wait() {
    var ok = document.readyState !== 'loading' && window.salla && salla.api && salla.config && document.querySelector('h1');
    if (ok || Date.now() - t0 > 15000) { try { run(); } catch (e) {} return; }
    setTimeout(wait, 300);
  })();
})();
/* Checkout: backup gateway as a payment-method tile (replaces the top freshPay bar) + clear guidance when Salla rejects the payment. No backslashes. */
(function () {
  if (window.__ffAltPay || location.pathname.indexOf('/checkout') !== 0) return;
  window.__ffAltPay = 1;
  var CSS =
    '#freshPayMainWrapper{display:none!important}' +
    'ul.list--payment-methods li.ffalt-li{flex:1 0 100%!important;width:100%!important;max-width:100%!important;grid-column:1/-1!important;list-style:none}' +
    'ul.list--payment-methods li.ffalt-li .ffalt-b{display:flex!important;align-items:center;justify-content:space-between;gap:10px;width:100%!important;max-width:100%!important;height:auto!important;min-height:58px;padding:10px 40px 10px 14px!important;border-radius:10px;border:1px dashed rgba(255,171,1,.55)!important;background:rgba(255,171,1,.06)!important;color:#fff;font-family:inherit;cursor:pointer;text-align:start}' +
    'ul.list--payment-methods li.ffalt-li .ffalt-b.on{border-style:solid!important;border-color:#ffab01!important;background:rgba(255,171,1,.12)!important}' +
    '.ffalt-b .t{display:flex;flex-direction:column;gap:2px;line-height:1.35}.ffalt-b .t b{font-size:14px;font-weight:800;color:#ffc53d}.ffalt-b .t small{font-size:11.5px;color:#c9d0e0}' +
    '.ffalt-bg{display:flex;gap:4px;flex:0 0 auto;direction:ltr}.ffalt-bg span{display:inline-flex;align-items:center;height:20px;padding:0 6px;border-radius:5px;background:#fff;color:#111827;font-size:10px;font-weight:800}.ffalt-bg .ap{background:#000;color:#fff;box-shadow:0 0 0 1px #fff}.ffalt-bg .vi{color:#1a1f71;font-style:italic}.ffalt-bg .md{color:#00a650}' +
    'body.ffalt-on ul.list--payment-methods li:not(.ffalt-li) button.active{background:rgb(11,18,34)!important;border-color:rgb(42,54,87)!important}' +
    'body.ffalt-on [data-ffalt-hide]{display:none!important}' +
    '#ffalt-panel{display:none;margin:14px 0 0;padding:14px;border-radius:14px;border:1px solid rgba(255,171,1,.35);background:#0b1222;color:#e5e7eb;direction:rtl}' +
    'body.ffalt-on #ffalt-panel{display:block}' +
    '#ffalt-panel h4{margin:0 0 6px;font-size:15px;font-weight:800;color:#fff}#ffalt-panel p{margin:0 0 10px;font-size:13px;line-height:1.8;color:#c9d0e0}' +
    '#ffalt-panel ol{margin:0 0 12px;padding:0 18px 0 0;font-size:13px;line-height:1.9;color:#c9d0e0}' +
    '#ffalt-panel #freshPayContainer{display:block;min-height:80px}' +
    '.payment-alert{background:#fff4e5!important;border:1px solid #f59e0b!important;flex-wrap:wrap}' +
    '.payment-alert .payment-alert__text{color:#7c2d12!important;font-weight:700!important;opacity:1!important}' +
    '.payment-alert .ffalt-help{flex:1 0 100%;margin:8px 0 0;font-size:13px;line-height:1.8;color:#431407;font-weight:500}' +
    '.payment-alert .ffalt-go{display:block;width:100%;margin:10px 0 0;min-height:44px;border:0;border-radius:12px;background:#111827;color:#ffc53d;font-family:inherit;font-size:14.5px;font-weight:800;cursor:pointer}' +
    '@keyframes ffaltp{0%,100%{box-shadow:0 0 0 0 rgba(255,171,1,.0)}50%{box-shadow:0 0 0 6px rgba(255,171,1,.35)}}.ffalt-b.pulse{animation:ffaltp 1.2s ease 3}';
  var st = document.createElement('style'); st.id = 'ffalt-css'; st.textContent = CSS;
  (document.head || document.documentElement).appendChild(st);

  var on = false;
  function ul() { return document.querySelector('ul.list--payment-methods'); }
  function panel() {
    var p = document.getElementById('ffalt-panel');
    if (p) return p;
    var u = ul(); if (!u) return null;
    /* the payment step block: append at its end (outside Vue-managed sibling lists) */
    var host = u.closest('.payment_methods');
    for (var i = 0; i < 3 && host; i++) host = host.parentElement;
    host = host && host.parentElement;
    if (!host) return null;
    p = document.createElement('div'); p.id = 'ffalt-panel';
    p.innerHTML = '<h4>الدفع عبر البوابة البديلة</h4>' +
      '<p>نفس الطلب ونفس المبلغ، بس الدفع يتم من صفحة دفع ثانية آمنة. استخدمها إذا انرفضت بطاقتك أو ما كمل الدفع.</p>' +
      '<ol><li>اضغط زر الدفع اللي تحت.</li><li>ادفع بمدى أو فيزا/ماستركارد أو Apple Pay.</li><li>بعد الدفع يوصلك تأكيد الطلب ونبدأ التنفيذ.</li></ol>' +
      '<div class="ffalt-mount"></div>';
    host.appendChild(p);
    return p;
  }
  function markHide() {
    var u = ul(); if (!u) return;
    var pm = u.closest('.payment_methods');
    var l1 = pm && pm.parentElement && pm.parentElement.parentElement;
    var l2 = l1 && l1.parentElement;
    if (!l1 || !l2) return;
    [].forEach.call(l1.children, function (c) { if (!c.contains(pm)) c.setAttribute('data-ffalt-hide', ''); });
    [].forEach.call(l2.children, function (c) { if (c !== l1 && !c.querySelector('.payment-alert') && !c.classList.contains('payment-alert')) c.setAttribute('data-ffalt-hide', ''); });
  }
  function openFresh() {
    var p = panel(); if (!p) return;
    var c = document.getElementById('freshPayContainer');
    if (c && c.parentNode !== p.querySelector('.ffalt-mount')) p.querySelector('.ffalt-mount').appendChild(c);
    if (c && typeof window.handleAbsoluteFreshPayment === 'function') {
      c.style.display = 'none';
      try { window.handleAbsoluteFreshPayment(); } catch (e) {}
    }
  }
  function closeFresh() {
    var c = document.getElementById('freshPayContainer'), m = document.getElementById('iframeMountPoint');
    if (c) c.style.display = 'none';
    if (m) m.innerHTML = '';
  }
  function setOn(v, scroll) {
    on = v;
    document.body.classList.toggle('ffalt-on', v);
    var b = document.querySelector('.ffalt-b'); if (b) b.classList.toggle('on', v);
    if (v) {
      markHide(); openFresh();
      var p = panel(); if (p && scroll) setTimeout(function () { p.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 50);
    } else closeFresh();
  }
  function tile() {
    var u = ul(); if (!u || u.querySelector('li.ffalt-li')) return;
    var dv = u.firstElementChild && u.firstElementChild.getAttributeNames().filter(function (a) { return a.indexOf('data-v-') === 0; })[0] || '';
    var li = document.createElement('li'); li.className = 'ffalt-li'; if (dv) li.setAttribute(dv, '');
    li.innerHTML = '<button type="button" class="btn btn--round btn--payment-option ffalt-b" aria-label="الدفع عبر البوابة البديلة">' +
      '<span class="t"><b>بوابة الدفع البديلة</b><small>إذا انرفضت بطاقتك ادفع من هنا</small></span>' +
      '<span class="ffalt-bg"><span class="md">mada</span><span class="vi">VISA</span><span class="ap">Apple Pay</span></span></button>';
    if (on) li.firstChild.classList.add('on');
    li.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); setOn(!on, true); }, true);
    u.appendChild(li);
  }
  /* picking any Salla method switches back to Salla's own form */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('ul.list--payment-methods li:not(.ffalt-li) button');
    if (b && on) setOn(false);
  }, true);
  function alertHelp() {
    var a = document.querySelector('.payment-alert');
    if (!a || a.querySelector('.ffalt-help')) return;
    var h = document.createElement('div'); h.className = 'ffalt-help';
    h.innerHTML = 'لا تشيل هم، طلبك محفوظ. جرّب بطاقة ثانية، أو كمّل الدفع عبر <b>بوابة الدفع البديلة</b> (مدى، فيزا، Apple Pay) بنفس المبلغ.' +
      '<button type="button" class="ffalt-go">ادفع عبر البوابة البديلة</button>';
    h.querySelector('button').addEventListener('click', function (e) {
      e.preventDefault(); setOn(true, true);
    });
    a.appendChild(h);
    var b = document.querySelector('.ffalt-b');
    if (b) { b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse'); }
  }
  function tick() { tile(); alertHelp(); if (on) markHide(); }
  var n = 0;
  (function loop() { tick(); if (++n < 40) setTimeout(loop, 300); })();
  if (window.MutationObserver) {
    var q = 0;
    new MutationObserver(function () { if (q) return; q = 1; setTimeout(function () { q = 0; tick(); }, 150); })
      .observe(document.body || document.documentElement, { childList: true, subtree: true });
  }
})();

/* Sharp product-card images + hover preview. No backslashes (Reparo-safe).
   Salla gives cards the 120x120 thumbnail of images uploaded by API, which is blurry at 220px+ on retina.
   1) Swap thumbnail paths (bwxgX/<uuid>-WxH-KEY.ext) for the original (bwxgX/KEY.ext); Cloudflare resizing still serves a small file.
   2) Desktop only: hovering a card image for a moment opens a large preview; the big file loads only on hover. */
(function () {
  if (window.__ffImg) return; window.__ffImg = 1;
  var TH = /(cdn[.]salla[.]sa[/][^/]+[/]|bwxgX[/])[0-9a-f]{8}-[0-9a-f-]{27}-[0-9.]+x[0-9.]+-/;
  function fix(u) {
    if (!u || typeof u !== 'string' || !TH.test(u)) return u;
    u = u.replace(TH, '$1');
    /* card images are shown ~220-360px wide: 500px covers retina */
    if (u.indexOf('/cdn-cgi/image/') > -1) u = u.replace(/width=[0-9]+/, function (m) { return +m.slice(6) < 500 ? "width=500" : m; });
    return u;
  }
  var P = HTMLImageElement.prototype, d = Object.getOwnPropertyDescriptor(P, 'src');
  if (d && d.set) Object.defineProperty(P, 'src', { configurable: true, enumerable: d.enumerable, get: function () { return d.get.call(this); }, set: function (v) { d.set.call(this, fix(v)); } });
  var sa = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (n, v) {
    if (this.tagName === 'IMG') { var k = String(n).toLowerCase(); if (k === 'src' || k === 'data-src') v = fix(v); }
    return sa.call(this, n, v);
  };
  function sweep() {
    var a = document.querySelectorAll('img[src*="x"],img[data-src*="x"]');
    for (var i = 0; i < a.length; i++) {
      var im = a[i], ds = im.getAttribute('data-src'), s = im.getAttribute('src');
      if (ds && TH.test(ds)) sa.call(im, 'data-src', fix(ds));
      if (s && TH.test(s)) sa.call(im, 'src', fix(s));
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sweep); else sweep();
  [600, 1500, 3000].forEach(function (t) { setTimeout(sweep, t); });

  /* hover preview: real mouse + wide screen only */
  if (!(window.matchMedia && matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)').matches)) return;
  var box = null, bimg = null, timer = 0, cur = null;
  function big(u) {
    u = fix(u || '');
    if (u.indexOf('/cdn-cgi/image/') > -1) return u.replace(/width=[0-9]+/, 'width=900');
    return u;
  }
  function make() {
    var st = document.createElement('style');
    st.textContent = '#ffzoom{position:fixed;z-index:2147482000;width:440px;height:440px;border-radius:18px;overflow:hidden;background:#111;box-shadow:0 24px 60px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.08);pointer-events:none;opacity:0;transform:scale(.96);transition:opacity .16s ease,transform .16s ease}#ffzoom.on{opacity:1;transform:none}#ffzoom img{width:100%;height:100%;object-fit:cover;display:block}';
    document.head.appendChild(st);
    box = document.createElement('div'); box.id = 'ffzoom';
    bimg = document.createElement('img'); bimg.alt = ''; bimg.decoding = 'async';
    box.appendChild(bimg); document.body.appendChild(box);
  }
  function show(im) {
    if (!box) make();
    var r = im.getBoundingClientRect(), W = 440, gap = 16, vw = innerWidth, vh = innerHeight;
    var left = r.right + gap + W <= vw ? r.right + gap : r.left - gap - W;
    if (left < 8) left = Math.max(8, Math.min(vw - W - 8, r.left + r.width / 2 - W / 2));
    var top = Math.max(8, Math.min(vh - W - 8, r.top + r.height / 2 - W / 2));
    box.style.left = left + 'px'; box.style.top = top + 'px';
    var u = big(im.currentSrc || im.src);
    if (bimg.getAttribute('src') !== u) { box.classList.remove('on'); bimg.onload = function () { if (cur === im) box.classList.add('on'); }; bimg.src = u; }
    else box.classList.add('on');
  }
  function hide() { clearTimeout(timer); cur = null; if (box) box.classList.remove('on'); }
  document.addEventListener('mouseover', function (e) {
    var im = e.target && e.target.closest && e.target.closest('.s-product-card-image img, .s-product-card-entry img.s-product-card-image-cover');
    if (!im) { if (cur) hide(); return; }
    if (im === cur) return;
    hide(); cur = im;
    timer = setTimeout(function () { if (cur === im) show(im); }, 350);
  }, { passive: true });
  window.addEventListener('scroll', hide, { passive: true });
})();


/* Category pages: group product cards by type (followers, score, follower accounts, score accounts...) with a small heading per group.
   Uses CSS order on the grid only: no DOM moves, no extra requests, works with infinite scroll. No backslashes (Reparo-safe). */
(function () {
  if (window.__ffGrp) return; window.__ffGrp = 1;
  var G = [['fol', 'متابعين'], ['sco', 'زيادة سكور'], ['lik', 'لايكات'], ['vie', 'مشاهدات'], ['com', 'تعليقات'], ['eng', 'تفاعل وباقات'], ['acf', 'حسابات متابعين'], ['acs', 'حسابات سكور'], ['acc', 'حسابات ويوزرات'], ['oth', 'خدمات أخرى'], ['out', 'نفدت الكمية']];
  var IDX = {}; G.forEach(function (g, i) { IDX[g[0]] = i; });
  function has(n, a) { for (var i = 0; i < a.length; i++) if (n.indexOf(a[i]) > -1) return true; return false; }
  function kind(n) {
    n = String(n || '').trim();
    if (has(n, ['يوزر', 'للبيع']) || n.indexOf('حساب') === 0 || n.indexOf('قناة') === 0)
      return has(n, ['متابع', 'مشترك']) ? 'acf' : has(n, ['سكور', 'نقطة', 'نقاط']) ? 'acs' : 'acc';
    if (has(n, ['سكور', 'نقاط'])) return 'sco';
    if (n.indexOf('بكج') === 0) return 'eng';
    if (has(n, ['متابع', 'مشترك', 'اعضاء', 'أعضاء'])) return 'fol';
    if (has(n, ['لايك', 'تكبيس', 'إعجاب'])) return 'lik';
    if (has(n, ['مشاهد', 'ساعات', 'مستمع'])) return 'vie';
    if (has(n, ['تعليق', 'كومنت', 'منشن'])) return 'com';
    if (has(n, ['بكج', 'اكسبلور', 'رتويت', 'شير', 'مشاركة', 'حفظ', 'تصويت', 'ترند', 'هاشتاق', 'حملة', 'تقييم'])) return 'eng';
    return 'oth';
  }
  var css = 0;
  function addCss() {
    if (css) return; css = 1;
    var s = document.createElement('style');
    s.textContent = '.ffgh{grid-column:1/-1;display:flex;align-items:center;gap:10px;min-width:0;white-space:nowrap;margin:14px 2px 0;font-weight:800;font-size:17px;color:#fff}.ffgh b{width:4px;height:18px;border-radius:3px;background:#ffab01;flex:none}.ffgh small{font-weight:600;font-size:12px;color:#ffab01;background:rgba(255,171,1,.12);border-radius:999px;padding:2px 9px}.ffgh span{overflow:hidden;text-overflow:ellipsis}.ffgh i{flex:1;min-width:8px;height:1px;background:linear-gradient(to left,rgba(255,255,255,.14),transparent)}.ffgh.ffoff{display:none}@media(max-width:640px){.ffgh{font-size:15px;margin-top:8px}}';
    document.head.appendChild(s);
  }
  function sorted(pl) {
    var sb = pl.getAttribute('sort-by') || '';
    if (sb && sb !== 'ourSuggest') return true;
    var f = document.getElementById('product-filter');
    return !!(f && f.value && f.value !== 'ourSuggest');
  }
  function run(pl) {
    var w = pl.querySelector('.s-products-list-wrapper'); if (!w) return;
    var cards = w.querySelectorAll(':scope > .s-product-card-entry');
    var heads = w.querySelectorAll(':scope > .ffgh');
    if (sorted(pl)) { for (var h = 0; h < heads.length; h++) heads[h].classList.add('ffoff'); for (var q = 0; q < cards.length; q++) cards[q].style.order = cards[q].classList.contains('s-product-card-out-of-stock') ? '99999' : ''; return; }
    var cnt = {}, used = 0, byk = {};
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i], k = c.getAttribute('data-ffk');
      if (!k) { var t = c.querySelector('.s-product-card-content-title'); k = kind(t ? t.textContent : ''); c.setAttribute('data-ffk', k); }
      if (c.classList.contains('s-product-card-out-of-stock')) k = 'out';
      if (!cnt[k]) { cnt[k] = 0; used++; byk[k] = []; }
      cnt[k]++; byk[k].push(c);
      c.style.order = String(IDX[k] * 1000 + 1 + i);
    }
    if (used < 2) { for (var j = 0; j < heads.length; j++) heads[j].classList.add('ffoff'); return; }
    addCss();
    G.forEach(function (g, gi) {
      var el = w.querySelector(':scope > .ffgh[data-k="' + g[0] + '"]');
      if (!cnt[g[0]]) { if (el) el.classList.add('ffoff'); return; }
      if (!el) {
        el = document.createElement('div'); el.className = 'ffgh'; el.setAttribute('data-k', g[0]); el.setAttribute('role', 'heading'); el.setAttribute('aria-level', '2');
        el.innerHTML = '<b></b><span></span><small></small><i></i>';
        el.children[1].textContent = g[1];
        w.insertBefore(el, w.firstChild);
      }
      el.classList.remove('ffoff');
      el.style.order = String(gi * 1000);
      var lb = cnt[g[0]] + (cnt[g[0]] > 10 || cnt[g[0]] < 3 ? ' خدمة' : ' خدمات');
      if (el.children[2].textContent !== lb) el.children[2].textContent = lb;
      el.style.gridColumn = '';
    });
    /* small groups (fewer cards than one row) share a row: their headers sit side by side above their cards */
    var cols = getComputedStyle(w).gridTemplateColumns.split(' ').filter(Boolean).length;
    if (cols < 2) return;
    /* small groups share a row (first fit, a later small group may move up next to an earlier one) */
    var packs = [];
    G.forEach(function (g) {
      var k = g[0], n = cnt[k]; if (!n || n >= cols || k === 'out') return;
      for (var p = 0; p < packs.length; p++) if (packs[p].sum + n <= cols) { packs[p].ks.push(k); packs[p].sum += n; return; }
      packs.push({ ks: [k], sum: n });
    });
    packs.forEach(function (pk) {
      if (pk.ks.length < 2) return;
      var base = IDX[pk.ks[0]] * 1000, left = cols;
      pk.ks.forEach(function (k, n) {
        var h = w.querySelector(':scope > .ffgh[data-k="' + k + '"]');
        var sp = n === pk.ks.length - 1 ? left : cnt[k];
        left -= cnt[k];
        h.style.order = String(base - 20 + n);
        h.style.gridColumn = 'span ' + sp;
        byk[k].forEach(function (c, ci) { c.style.order = String(base + 1 + n * 100 + ci); });
      });
    });
  }
  var lists = [], tm = 0;
  function all() { for (var i = 0; i < lists.length; i++) run(lists[i]); }
  function init() {
    var a = document.querySelectorAll('salla-products-list[source="product.index"],salla-products-list[source="categories"]');
    for (var i = 0; i < a.length; i++) {
      var pl = a[i]; if (pl.__ffg) continue; pl.__ffg = 1; lists.push(pl);
      new MutationObserver(function () { clearTimeout(tm); tm = setTimeout(all, 60); }).observe(pl, { childList: true, subtree: true });
      run(pl);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  [800, 2500].forEach(function (t) { setTimeout(init, t); });
  document.addEventListener('change', function (e) { if (e.target && e.target.id === 'product-filter') setTimeout(all, 50); });
  var rz = 0; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(all, 150); }, { passive: true });
})();

/* Quick view: clearer eye button on product cards + a richer quick-view sheet
   (package list with prices instead of a dropdown, short service summary, sticky buy-now / add-to-cart).
   No backslashes (Reparo-safe). Loads nothing extra until the visitor opens a quick view. */
(function () {
  if (window.__ffQv) return; window.__ffQv = 1;
  var st = document.createElement('style');
  st.textContent = [
    /* card button: amber pill with a label */
    '.s-product-card-quick-view-btn button{width:auto!important;min-width:0!important;height:30px!important;padding:0 10px 0 9px!important;border-radius:999px!important;background:#0d1426!important;opacity:1!important;border:1.5px solid #ffab01!important;color:#ffab01!important;gap:5px;display:inline-flex!important;align-items:center;box-shadow:0 4px 12px rgba(0,0,0,.45)}',
    '.s-product-card-quick-view-btn{opacity:1!important}.angel-quick-view-btn{position:relative;z-index:6}',
    '.s-product-card-quick-view-btn button i,.s-product-card-quick-view-btn button svg{color:#ffab01!important;fill:currentColor;font-size:15px!important}',
    '.s-product-card-quick-view-btn button:after{content:"عرض سريع";font-size:12px;font-weight:700;line-height:1;color:#ffab01;white-space:nowrap}',
    /* sheet */
    '#angel-quick-view .angel-quick-view__sub-title{display:none!important}',
    '#angel-quick-view .angel-quick-view__price .total-price{font-size:26px!important;color:#ffab01!important}',
    '.ffqv-sum{margin:10px 0 4px;padding:12px 14px;border-radius:14px;background:rgba(255,171,1,.06);border:1px solid rgba(255,171,1,.25);font-size:14px;line-height:1.75;color:#e9e9ee}',
    '.ffqv-sum b.h{display:block;font-size:13px;color:#ffab01;margin-bottom:4px}',
    '.ffqv-sum ul{margin:6px 0 0;padding:0;list-style:none}',
    '.ffqv-sum li{position:relative;padding-right:18px;margin:3px 0}',
    '.ffqv-sum li:before{content:"";position:absolute;right:2px;top:10px;width:7px;height:7px;border-radius:50%;background:#ffab01}',
    '.ffqv-sum a{display:inline-block;margin-top:6px;font-size:13px;font-weight:700;color:#ffab01;text-decoration:underline}',
    '.ffqv-list{display:flex;flex-direction:column;gap:8px;margin-top:8px}',
    '.ffqv-it{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:12px;border:1.5px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);cursor:pointer;text-align:right;width:100%;color:#e9e9ee;font:inherit}',
    '.ffqv-it i{flex:none;width:18px;height:18px;border-radius:50%;border:2px solid rgba(255,255,255,.35)}',
    '.ffqv-it span{flex:1;font-size:13.5px;line-height:1.5}',
    '.ffqv-it b{flex:none;font-size:14.5px;font-weight:800;color:#ffab01;white-space:nowrap}',
    '.ffqv-it.on{border-color:#ffab01;background:rgba(255,171,1,.09)}',
    '.ffqv-it.on i{border-color:#ffab01;background:radial-gradient(circle,#ffab01 0 4px,transparent 5px)}',
    '.ffqv-hide{position:absolute!important;opacity:0!important;pointer-events:none!important;height:0!important;overflow:hidden!important}',
    '#angel-quick-view .angel-quick-view__add-to-cart{position:sticky;bottom:0;z-index:5;gap:8px;padding:10px 0 6px;background:rgb(13,20,38);box-shadow:0 -10px 18px rgb(13,20,38);flex-wrap:wrap}',
    '.ffqv-buy{flex:1 1 100%;height:50px;border-radius:12px;border:0;background:#ffab01;color:#1a1206;font-family:inherit;font-size:18px;font-weight:800;cursor:pointer;box-shadow:0 8px 20px rgba(255,171,1,.25)}',
    '#angel-quick-view .angel-quick-view__add-to-cart salla-add-product-button button{background:transparent!important;border:1.5px solid #ffab01!important;color:#ffab01!important;box-shadow:none!important}',
    '#angel-quick-view .angel-quick-view__add-to-cart salla-add-product-button button *{color:#ffab01!important}',
    '#angel-quick-view .s-product-options-option{display:block!important}',
    '#angel-quick-view .s-product-options-option-content{width:100%!important;max-width:none!important}',
    '#angel-quick-view .s-product-options-option-label{display:block;margin-bottom:6px}',
    '.ffqv-buy[disabled]{opacity:.6}'
  ].join('');
  document.head.appendChild(st);

  function num(t) { var m = String(t || '').replace(/,/g, '').match(/[0-9]+([.][0-9]+)?/); return m ? parseFloat(m[0]) : 0; }
  function cur(t) { return String(t || '').replace(/[0-9][0-9.,]*/, '').replace(/[()+]/g, '').trim(); }

  function summary(root, html, url) {
    var box = document.createElement('div'); box.innerHTML = html;
    var q = box.querySelector('blockquote'), ul = box.querySelector('ul'), out = '';
    if (q) { var t = q.textContent.replace('باختصار:', '').trim(); out += '<b class="h">باختصار</b>' + esc(t); }
    else { var p = box.querySelector('p'); if (p) out += esc(p.textContent.trim().slice(0, 260)); }
    if (ul) { var li = [].slice.call(ul.querySelectorAll('li'), 0, 5).map(function (x) { return '<li>' + esc(x.textContent.trim()) + '</li>'; }).join(''); if (li) out += '<ul>' + li + '</ul>'; }
    if (!out) return;
    var d = document.createElement('div'); d.className = 'ffqv-sum';
    d.innerHTML = out + (url ? '<a href="' + url + '">كل تفاصيل الخدمة</a>' : '');
    var old = root.querySelector('.angel-quick-view__description');
    if (old) { old.style.display = 'none'; old.parentNode.insertBefore(d, old.nextSibling); }
  }
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  function packages(root) {
    var base = num((root.querySelector('.angel-quick-view__price .starting-or-normal-price') || root.querySelector('.angel-quick-view__price') || {}).textContent);
    var c = cur((root.querySelector('.angel-quick-view__price .starting-or-normal-price') || root.querySelector('.angel-quick-view__price') || {}).textContent);
    root.querySelectorAll('select.s-form-control').forEach(function (sel) {
      if (sel.__ffqv || sel.options.length < 3) return; sel.__ffqv = 1;
      var list = document.createElement('div'); list.className = 'ffqv-list';
      [].slice.call(sel.options).forEach(function (o) {
        if (!o.value) return;
        var txt = o.textContent.trim(), add = 0, mm = txt.match(/[(]([^()]*[0-9][^()]*)[)][ ]*$/);
        if (mm) { add = num(mm[1]); txt = txt.slice(0, mm.index).trim(); }
        var total = base + add;
        var b = document.createElement('button'); b.type = 'button'; b.className = 'ffqv-it' + (sel.value === o.value ? ' on' : '');
        b.innerHTML = '<i></i><span></span><b></b>';
        b.children[1].textContent = txt;
        b.children[2].textContent = (total % 1 ? total.toFixed(2) : String(total)) + ' ' + c;
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

  function buyNow(root) {
    var bar = root.querySelector('.angel-quick-view__add-to-cart');
    if (!bar || bar.querySelector('.ffqv-buy')) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'ffqv-buy'; b.textContent = 'اشترِ الآن';
    bar.insertBefore(b, bar.firstChild);
    b.addEventListener('click', function () {
      var add = bar.querySelector('salla-add-product-button button') || [].filter.call(bar.querySelectorAll('button'), function (x) { return x !== b && !x.closest('.s-quantity-input'); })[0];
      if (!add || add === b) return;
      var go = function () { location.href = '/cart'; };
      var done = false, once = function () { if (done) return; done = true; go(); };
      try { if (window.salla && salla.event && salla.event.on) salla.event.on('cart::item.added', once); } catch (e) {}
      try { if (window.salla && salla.cart && salla.cart.event && salla.cart.event.onItemAdded) salla.cart.event.onItemAdded(once); } catch (e) {}
      b.disabled = true; setTimeout(function () { b.disabled = false; }, 4000);
      add.click();
    });
  }

  function enhance(root) {
    if (!root || !root.querySelector('.angel-quick-view__form')) return;
    var form = root.querySelector('.angel-quick-view__form');
    if (form.__ffqv) { packages(root); return; } form.__ffqv = 1;
    packages(root); buyNow(root);
    var id = (root.querySelector('[product-id]') || {}).getAttribute ? root.querySelector('[product-id]').getAttribute('product-id') : '';
    var link = (root.querySelector('.angel-quick-view__description a') || root.querySelector('.angel-quick-view__details > a') || {}).href || '';
    if (id && window.salla && salla.api && salla.api.product && salla.api.product.getDetails) {
      salla.api.product.getDetails(id).then(function (r) { var d = (r && r.data) || {}; if (d.description) summary(root, d.description, link); }).catch(function () {});
    }
  }

  var tm = 0;
  new MutationObserver(function () {
    clearTimeout(tm);
    tm = setTimeout(function () { enhance(document.getElementById('angel-quick-view')); }, 120);
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
