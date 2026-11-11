/* ff-seo v6 — Faster Follow structured data + H1 cleanup. No backslashes (Reparo-safe). */
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
