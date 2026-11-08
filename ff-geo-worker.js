/**
 * Faster Follow — GEO edge worker (Cloudflare Workers, route: fasterfollow.com/*)
 *
 * AI crawlers (OAI-SearchBot, ChatGPT-User, PerplexityBot, Claude) do NOT run JavaScript,
 * so schema added by ff-seo.js in the browser is invisible to them. This worker fixes the
 * HTML at the edge, for every visitor (no cloaking):
 *   1) Product pages: adds Product + BreadcrumbList JSON-LD with the real starting price in SAR,
 *      or, when Salla already ships a Product schema (it does for Googlebot), corrects its price.
 *   2) Blog posts: adds BlogPosting JSON-LD.
 *   3) /llms.txt: serves a corrected guide (real starting prices, canonical links, text/plain).
 * Any error -> the original Salla response is returned untouched.
 */

const STORE_ID = '1438578597';
const API = 'https://api.salla.dev/store/v1/';
const BRAND = 'فاستر فولو';
const CACHE_TTL = 3600; // seconds; price edits in Salla show up within an hour

/* ---------- pure helpers (also unit-tested in the browser) ---------- */

export function priceRange(d) {
  const ok = x => (+x.additional_price || 0) < 99999 && !/غير متاح/.test(x.name || '');
  const vals = o => {
    const a = (o.details || []).filter(x => !x.is_out && ok(x));
    return a.length ? a : (o.details || []).filter(ok);
  };
  const ops = d.options || [];
  let lo = +d.price || 0, hi = lo, n = 1;
  for (const o of ops) {
    if (!o.required || o.visibility_condition) continue;
    const vs = vals(o);
    if (!vs.length) continue;
    let l1 = Infinity, h1 = -Infinity, c1 = 0;
    for (const v of vs) {
      let l = +v.additional_price || 0, h = l, c = 1;
      for (const dep of ops) {
        const vc = dep.visibility_condition;
        if (!vc || vc.option != o.id || vc.value != v.id) continue;
        if (!dep.required && (+v.additional_price || 0) > 0) continue;
        const p = vals(dep).map(x => +x.additional_price || 0);
        if (!p.length) continue;
        l += Math.min(...p); h += Math.max(...p); c *= p.length;
      }
      l1 = Math.min(l1, l); h1 = Math.max(h1, h); c1 += c;
    }
    lo += l1; hi += h1; n *= c1;
  }
  const r2 = x => Math.round(x * 100) / 100;
  return { lo: r2(lo), hi: r2(hi), n };
}

export function ratingFrom(r) {
  const cnt = +(r && r.count);
  if (!cnt) return null;
  let sum = 0, w = 0;
  for (const k of Object.keys(r.reviews || {})) { sum += +k * +r.reviews[k]; w += +r.reviews[k]; }
  const val = w ? Math.round(sum / w * 10) / 10 : +r.rating;
  return val ? { '@type': 'AggregateRating', ratingValue: val, reviewCount: cnt, bestRating: 5, worstRating: 1 } : null;
}

const esc = s => JSON.stringify(s).split('<').join('\\u003c');
const ldTag = (obj, id) => '<script type="application/ld+json" id="' + id + '">' + esc(obj) + '</script>';
const between = (html, re) => { const m = html.match(re); return m ? m[1].trim() : ''; };
const decodeEnt = s => s.split('&amp;').join('&').split('&quot;').join('"').split('&#039;').join("'");

function canonicalOf(html, fallback) { return between(html, /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i) || fallback; }
function metaOf(html, name) {
  return decodeEnt(between(html, new RegExp('<meta[^>]+(?:name|property)="' + name + '"[^>]+content="([^"]*)"', 'i')));
}
function h1Of(html) { return decodeEnt(between(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ')); }

/** Salla bug: for slugs with "(", "+", "---"... the canonical points to a cleaned URL that 301-redirects
 *  back to this page (canonical loop). Point canonical / hreflang / og:url to the URL that really serves. */
export function replaceCanonical(html, bad, good) {
  if (!bad || bad === good) return html;
  return html.split('"' + bad + '"').join('"' + good + '"');
}

/** Walk every JSON-LD block; returns { html, hadProduct, patched }. */
export function patchExistingProduct(html, lo) {
  let hadProduct = false, patched = false;
  const out = html.replace(/<script([^>]*type="application\/ld\+json"[^>]*)>([\s\S]*?)<\/script>/gi, (all, attrs, body) => {
    if (/salla-product-schema-script/.test(attrs)) return all; // related-products list
    let j; try { j = JSON.parse(body); } catch (e) { return all; }
    const items = [];
    [].concat(j).forEach(x => { if (x) { items.push(x); [].concat(x['@graph'] || []).forEach(g => items.push(g)); } });
    let changed = false;
    for (const x of items) {
      if ([].concat(x['@type']).indexOf('Product') < 0) continue;
      hadProduct = true;
      for (const o of [].concat(x.offers || [])) {
        if (!isNaN(+o.price) && +o.price < lo) {
          o.price = lo; o.priceCurrency = 'SAR';
          if (o.priceSpecification) { o.priceSpecification.price = lo; o.priceSpecification.priceCurrency = 'SAR'; }
          changed = true;
        }
      }
    }
    if (!changed) return all;
    patched = true;
    return '<script' + attrs + ' data-ff-edge="1">' + esc(j) + '</script>';
  });
  return { html: out, hadProduct, patched };
}

export function transformProduct(html, pageUrl, d, rating) {
  const { lo, hi, n } = priceRange(d);
  if (!(lo > 0)) return html;
  const p = patchExistingProduct(html, lo);
  html = p.html;
  const url = canonicalOf(html, pageUrl);
  const name = h1Of(html) || d.name;
  let add = '';
  if (!p.hadProduct) {
    const avail = (d.is_available === false || d.is_out_of_stock) ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock';
    const offers = hi > lo
      ? { '@type': 'AggregateOffer', priceCurrency: 'SAR', lowPrice: lo, highPrice: hi, offerCount: n, availability: avail, url }
      : { '@type': 'Offer', priceCurrency: 'SAR', price: lo, availability: avail, url, itemCondition: 'https://schema.org/NewCondition' };
    const img = (d.image && d.image.url) || metaOf(html, 'og:image');
    const prod = { '@context': 'https://schema.org', '@type': 'Product', '@id': url + '#product', name,
      description: metaOf(html, 'description'), image: img ? [img] : undefined, sku: String(d.sku || d.id),
      brand: { '@type': 'Brand', name: BRAND }, url, offers };
    if (rating) prod.aggregateRating = rating;
    add += ldTag(prod, 'ff-ld-product');
  }
  if (!/"BreadcrumbList"/.test(html)) {
    add += ldTag({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: BRAND, item: 'https://fasterfollow.com/' },
      { '@type': 'ListItem', position: 2, name, item: url }] }, 'ff-ld-bc');
  }
  return add ? html.replace(/<\/head>/i, add + '</head>') : html;
}

export function transformArticle(html, pageUrl) {
  if (/"(BlogPosting|Article)"/.test(html)) return html;
  const url = canonicalOf(html, pageUrl), img = metaOf(html, 'og:image');
  const a = { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: (h1Of(html) || metaOf(html, 'og:title')).slice(0, 110),
    description: metaOf(html, 'description'), mainEntityOfPage: url, url, inLanguage: 'ar', image: img ? [img] : undefined,
    author: { '@type': 'Organization', name: BRAND, url: 'https://fasterfollow.com/' },
    publisher: { '@type': 'Organization', name: BRAND, logo: { '@type': 'ImageObject', url: img } } };
  return html.replace(/<\/head>/i, ldTag(a, 'ff-ld-article') + '</head>');
}

/* ---------- llms.txt ---------- */

export const CATEGORIES = [
  ['خدمات سناب شات', 'https://fasterfollow.com/خدمات-سناب-شات/c754093200', 'متابعين سناب عرب وخليجيين، رفع نقاط السكور، حسابات ويوزرات سناب جاهزة للبيع، توثيق النجمة الصفراء'],
  ['خدمات تيك توك', 'https://fasterfollow.com/خدمات-تيك-توك/c1832009303', 'متابعين ولايكات ومشاهدات ومشاهدي بث مباشر، باقات الإكسبلور، حسابات تيك توك للبيع'],
  ['خدمات انستقرام', 'https://fasterfollow.com/شراء-متابعين-انستقرام-خليجيين/c1248447987', 'متابعين عرب وخليجيين، لايكات، مشاهدات ريلز وستوري، تعليقات، حسابات ويوزرات انستقرام'],
  ['خدمات يوتيوب', 'https://fasterfollow.com/خدمات-يوتيوب/c1990276475', 'مشتركين عرب، ساعات مشاهدة لتفعيل الأرباح، مشاهدات ولايكات وتعليقات، قنوات للبيع'],
  ['خدمات تويتر (X)', 'https://fasterfollow.com/شراء-متابعين-اكس-عرب-خليجيين/c405094608', 'متابعين عرب وخليجيين، لايكات، رتويت، مشاهدات، تصويت، مستمعي المساحات'],
  ['خدمات جاكو', 'https://fasterfollow.com/زيادة-متابعين-جاكو-خليجيين/c1678186289', 'متابعين خليجيين وتكبيس بث مباشر'],
  ['اشتراكات وتطبيقات', 'https://fasterfollow.com/اشتراك-تطبيقات-بلس-للايفون/c1218135965', 'اشتراكات رقمية رسمية (شات جي بي تي بلس، سناب بلس) وتطبيقات بلس']
];

// Best sellers shown in llms.txt (prices + links are pulled live from Salla)
export const TOP_PRODUCTS = [1930974748, 926222471, 1140971769, 1142472412, 462404944, 448533154, 1232938960,
  760028678, 452519602, 1993833332, 344363915, 1156544862, 719015983, 1675425209, 1542508622, 759576270];

export const PAGES = [
  ['الأسئلة الشائعة', 'https://fasterfollow.com/الأسئلة-الشائعة/page-476672746', 'مدة التنفيذ، الضمان، طرق الدفع'],
  ['طريقة الشراء', 'https://fasterfollow.com/طريقة-الشراء-من-متحر-فاستر-فولو/page-2080578897', 'خطوات الطلب والدفع'],
  ['سياسة الاسترجاع', 'https://fasterfollow.com/سياسة-الاسترجاع/page-1583532397', 'شروط الاسترداد والتعويض'],
  ['من نحن', 'https://fasterfollow.com/about-us/page-1575504027', 'تعريف بالمتجر'],
  ['شروط الاستخدام', 'https://fasterfollow.com/شروط-الاستخدام/page-651826671', 'القواعد المنظمة للخدمات'],
  ['سياسة الخصوصية', 'https://fasterfollow.com/سياسة-الخصوصية/page-1890006248', 'حماية البيانات']
];

const fmt = x => (Math.round(x * 100) / 100).toString();

export function buildLlms(products) {
  const L = [];
  L.push('# فاستر فولو (Faster Follow)', '');
  L.push('> متجر سعودي موثق متخصص في خدمات نمو حسابات التواصل الاجتماعي للأفراد وصناع المحتوى والمشاريع في السعودية والخليج: زيادة متابعين ولايكات ومشاهدات عرب وخليجيين حقيقيين على سناب شات وتيك توك وانستقرام ويوتيوب وتويتر (X) وجاكو، إضافة إلى حسابات ويوزرات جاهزة واشتراكات رقمية. التنفيذ فوري أو تدريجي حسب الخدمة، بدون كلمة مرور للخدمات التي تحتاج رابط الحساب فقط، مع ضمان ذهبي على الخدمات.');
  L.push('', '> Faster Follow is a verified Saudi store (fasterfollow.com) selling social-media growth services for Saudi/Gulf customers: real Arab & Gulf followers, likes and views for Snapchat, TikTok, Instagram, YouTube, X (Twitter) and Jaco, plus ready accounts/usernames and digital subscriptions. Prices are in SAR and depend on the selected package.', '');
  L.push('- الموقع: https://fasterfollow.com/', '- واتساب الدعم: +966537763009', '- البريد: support@fasterfollow.com',
    '- الدفع: مدى، Apple Pay، STC Pay', '- العملة: الريال السعودي (SAR)', '- كود خصم الطلب الأول: FA10', '');
  L.push('## الأقسام', '');
  for (const [n, u, d] of CATEGORIES) L.push('- [' + n + '](' + u + '): ' + d);
  L.push('', '## الخدمات الأكثر طلباً (الأسعار مباشرة من المتجر)', '');
  for (const p of products) {
    if (!p) continue;
    const price = p.hi > p.lo ? 'يبدأ من ' + fmt(p.lo) + ' ريال' : fmt(p.lo) + ' ريال';
    const stock = p.avail ? '' : ' (غير متوفر حالياً)';
    const rate = p.rating ? ' — ★ ' + p.rating.ratingValue + '/5 من ' + p.rating.reviewCount + ' تقييم' : '';
    L.push('- [' + p.name + '](' + p.url + '): ' + price + stock + rate);
  }
  L.push('', '## صفحات مهمة', '');
  for (const [n, u, d] of PAGES) L.push('- [' + n + '](' + u + '): ' + d);
  L.push('', '## للأنظمة والوكلاء', '',
    '- [Sitemap](https://fasterfollow.com/sitemap.xml): كل المنتجات والأقسام والمقالات',
    '- [المدونة](https://fasterfollow.com/blog): أدلة وشروحات حول نمو الحسابات',
    '- [UCP](https://fasterfollow.com/.well-known/ucp): Universal Commerce Protocol — بحث الكتالوج والسلة والدفع للوكلاء',
    '- [MCP](https://fasterfollow.com/mcp): Model Context Protocol endpoint',
    '- [API Catalog](https://fasterfollow.com/.well-known/api-catalog)', '');
  return L.join('\n');
}

/* ---------- Salla data (edge-cached) ---------- */

async function api(path, ctx) {
  const key = new Request('https://ff-edge-cache.local/' + path);
  const cache = caches.default;
  const hit = await cache.match(key);
  if (hit) return hit.json();
  const r = await fetch(API + path, { headers: { 'Store-Identifier': STORE_ID, currency: 'SAR', 'accept-language': 'ar' } });
  if (!r.ok) return null;
  const j = await r.json();
  ctx.waitUntil(cache.put(key, new Response(JSON.stringify(j), { headers: { 'cache-control': 'public, max-age=' + CACHE_TTL } })));
  return j;
}

async function productData(id, ctx) {
  const [det, rat] = await Promise.all([
    api('products/' + id + '/details?with[]=options', ctx),
    api('rating/summary/' + id, ctx)
  ]);
  if (!det || !det.data) return null;
  return { d: det.data, rating: ratingFrom(rat && rat.data) };
}

// final (served) URL of a product page — Salla's API url / canonical can redirect
async function canonicalUrl(u, ctx) {
  const key = new Request('https://ff-edge-cache.local/final/' + encodeURIComponent(u));
  const hit = await caches.default.match(key);
  if (hit) return hit.text();
  let c = u;
  try { const r = await fetch(u, { method: 'HEAD' }); if (r.ok && r.url) c = r.url; } catch (e) {}
  ctx.waitUntil(caches.default.put(key, new Response(c, { headers: { 'cache-control': 'public, max-age=86400' } })));
  return c;
}

// does `canon` redirect back to `self`? (cached 1 day)
async function canonicalLoops(canon, self, ctx) {
  const key = new Request('https://ff-edge-cache.local/loop/' + encodeURIComponent(canon));
  const hit = await caches.default.match(key);
  let loc;
  if (hit) loc = await hit.text();
  else {
    loc = '';
    try {
      const r = await fetch(canon, { redirect: 'manual' });
      if (r.status >= 300 && r.status < 400) loc = new URL(r.headers.get('location') || '', canon).href;
    } catch (e) {}
    ctx.waitUntil(caches.default.put(key, new Response(loc, { headers: { 'cache-control': 'public, max-age=86400' } })));
  }
  const norm = u => { try { return decodeURI(new URL(u).pathname); } catch (e) { return u; } };
  return !!loc && norm(loc) === norm(self);
}

async function llms(ctx) {
  const rows = await Promise.all(TOP_PRODUCTS.map(async id => {
    try {
      const x = await productData(id, ctx);
      if (!x) return null;
      const r = priceRange(x.d);
      if (!(r.lo > 0)) return null;
      return { name: x.d.name, url: await canonicalUrl(x.d.url, ctx), lo: r.lo, hi: r.hi, avail: x.d.is_available !== false && !x.d.is_out_of_stock, rating: x.rating };
    } catch (e) { return null; }
  }));
  return buildLlms(rows);
}

/* ---------- entry ---------- */

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    let path = url.pathname;
    try { path = decodeURI(path); } catch (e) {}

    if (req.method === 'GET' && (path === '/llms.txt' || path === '/llms-full.txt')) {
      try {
        const body = await llms(ctx);
        return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600', 'x-robots-tag': 'noindex' } });
      } catch (e) { return fetch(req); }
    }

    const res = await fetch(req);
    if (req.method !== 'GET' || res.status !== 200 || !(res.headers.get('content-type') || '').includes('text/html')) return res;

    const pm = path.match(/[/]p([0-9]+)$/);
    const isBlog = /^[/]blog[/].+[/]a-?[0-9]+$/.test(path);
    if (!pm && !isBlog) return res;

    try {
      const html = await res.clone().text();
      let out = html;
      if (pm) {
        const self = url.origin + url.pathname;
        const canon = canonicalOf(html, self);
        if (decodeURI(new URL(canon).pathname) !== path && await canonicalLoops(canon, self, ctx)) {
          out = replaceCanonical(out, canon, self);
        }
        const x = await productData(pm[1], ctx);
        if (x) out = transformProduct(out, self, x.d, x.rating);
      } else {
        out = transformArticle(html, url.origin + url.pathname);
      }
      if (out === html) return res;
      const h = new Headers(res.headers);
      h.delete('content-length'); h.set('x-ff-edge', '1');
      return new Response(out, { status: res.status, statusText: res.statusText, headers: h });
    } catch (e) {
      return res;
    }
  }
};
