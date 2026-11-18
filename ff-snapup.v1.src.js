/* ff-snapup v1: Snap high-score account upgrade box (10K -> 50K -> 100K) + "الأوفر" badge on the cheapest-per-unit package */
(function () {
  if (window.__ffSU) return; window.__ffSU = 1;
  var UP = { 528958087: 626570225, 626570225: 1140971769 };
  var DC = {};
  function ready(cb) { var n = 0; (function t() { if (window.salla && salla.api && salla.api.product) return cb(); if (n++ < 120) setTimeout(t, 250); })(); }
  function det(id) {
    if (!DC[id]) DC[id] = salla.api.product.getDetails(id, ['options']).then(function (r) { return r && r.data; }).catch(function () { delete DC[id]; return null; });
    return DC[id];
  }
  function num(v) { if (v && typeof v === 'object') v = v.amount; v = parseFloat(v); return isNaN(v) ? 0 : v; }
  function M(v) { v = Math.round(v * 100) / 100; try { var s = salla.money(v); if (s) return s; } catch (e) {} return v + ' ر.س'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function qty(s) {
    s = String(s || '');
    var mil = /مليون/.test(s);
    var m = s.match(/([0-9][0-9.,]*)[ ]*(k|K|الف|ألف|الاف|آلاف|ألاف)?/);
    if (!m) return mil ? 1e6 : 0;
    var t = m[1], v;
    if (/^[0-9]{1,3}(,[0-9]{3})+$/.test(t)) v = parseFloat(t.replace(/,/g, ''));
    else v = parseFloat(t.replace(',', '.'));
    if (m[2]) v *= 1000;
    if (mil && v < 1000) v *= 1e6;
    return v || 0;
  }
  function price(d) { var s = num(d.sale_price), p = num(d.price); return s > 0 && (!p || s < p) ? s : p; }
  function avail(d) { if (d.is_available === false || d.status === 'out') return false; if (d.unlimited_quantity) return true; return d.quantity !== 0; }
  function scoreOf(d) { var m = String(d.name || '').match(/[(]([^)]*)[)]/); return m ? m[1] : ''; }
  function css() {
    if (document.getElementById('ffsu-css')) return;
    var st = document.createElement('style'); st.id = 'ffsu-css';
    st.textContent = '.ffsu{margin:0 0 12px;padding:12px;border-radius:14px;border:1px solid rgba(255,171,1,.45);background:rgba(255,171,1,.07);display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;color:#f2f2f2;font-size:13.5px;line-height:1.6}'
      + '.ffsu-t{flex:1 1 190px}.ffsu-s{display:block;color:#ffab01;font-weight:700;font-size:12.5px}'
      + '.ffsu-b{margin-inline-start:auto;background:#ffab01;color:#1a1206;border-radius:999px;padding:7px 16px;font-weight:700;font-size:13px;white-space:nowrap;text-decoration:none}'
      + '.ffbv{display:inline-block;margin-inline-start:6px;padding:1px 8px;border-radius:999px;background:#ffab01;color:#1a1206;font-size:11px;font-weight:700;line-height:1.7;vertical-align:middle}';
    document.head.appendChild(st);
  }

  /* 1) upgrade box on Snap score accounts */
  function upgrade(el, pid) {
    var tid = UP[pid]; if (!tid || document.querySelector('.ffsu')) return;
    Promise.all([det(pid), det(tid)]).then(function (r) {
      var c = r[0], n = r[1]; if (!c || !n || !avail(n)) return;
      var cp = price(c), np = price(n); if (!cp || !np || np <= cp) return;
      var cq = qty(scoreOf(c)), nq = qty(scoreOf(n)), x = cq && nq ? Math.round(nq / cq) : 0;
      var url = n.url || ('/p' + tid);
      var box = document.createElement('div'); box.className = 'ffsu';
      box.innerHTML = '<div class="ffsu-t">رقّي لحساب <b>' + esc(scoreOf(n) || n.name) + '</b> بزيادة <b>' + M(np - cp) + '</b> بس'
        + (x > 1 ? '<span class="ffsu-s">نقاط أكثر بـ' + x + ' أضعاف</span>' : '') + '</div>'
        + '<a class="ffsu-b" href="' + esc(url) + '">شوف الحساب</a>';
      css();
      el.parentNode.insertBefore(box, el);
    });
  }

  /* 2) "الأوفر" badge on the package with the lowest price per unit */
  function lp(pid, oid, vid, multi) {
    var o = {}; o[oid] = multi ? [vid] : vid;
    return salla.api.product.getPrice({ id: pid, quantity: 1, options: o }).then(function (r) { return num(r && r.data && r.data.price); }).catch(function () { return 0; });
  }
  function labelOf(i) {
    return (i.id && document.querySelector('label[for="' + i.id + '"]')) || i.closest('label') || i.parentElement;
  }
  function badge(el, d) {
    var base = price(d);
    (d.options || []).forEach(function (o) {
      var vals = (o.details || []).map(function (v) { return { id: String(v.id), q: qty(v.name), t: base + num(v.additional_price != null ? v.additional_price : v.price) }; }).filter(function (v) { return v.q > 0 && v.t > 0; });
      if (vals.length < 3) return;
      vals.sort(function (a, b) { return a.t / a.q - b.t / b.q; });
      var best = vals[0], next = vals[1];
      if (best.t / best.q > 0.95 * (next.t / next.q)) return; /* must be clearly cheaper per unit */
      var multi = /multiple|checkbox/.test(o.type);
      Promise.all([lp(d.id, o.id, +best.id, multi), lp(d.id, o.id, +next.id, multi)]).then(function (pp) {
        if (!pp[0] || !pp[1] || pp[0] / best.q > 0.95 * (pp[1] / next.q)) return; /* live prices must agree */
        var inp = el.querySelector('input[name^="options[' + o.id + ']"][value="' + best.id + '"]');
        if (!inp) return;
        var lb = labelOf(inp); if (!lb || lb.querySelector('.ffbv')) return;
        css();
        var b = document.createElement('span'); b.className = 'ffbv'; b.textContent = 'الأوفر';
        (lb.querySelector('.s-product-options-grid-mode-span') || lb).appendChild(b);
      });
    });
  }

  function attach(el) {
    if (el.getAttribute('data-ffsu') || el.closest('form[id^="item-"]')) return;
    el.setAttribute('data-ffsu', '1');
    var pid = +el.getAttribute('product-id') || 0; if (!pid) return;
    if (UP[pid]) upgrade(el, pid);
    det(pid).then(function (d) { if (d && d.options) badge(el, d); });
  }
  function scan() { [].forEach.call(document.querySelectorAll('salla-product-options[product-id]:not([data-ffsu])'), attach); }
  ready(function () {
    scan();
    var mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); }, 30000);
  });
})();
