/* ff-upsell v1: package upgrade nudge (product page + cart) and related add-on (cart) */
(function () {
  if (window.__ffUp) return; window.__ffUp = 1;
  var DC = {};
  var XS = {
    1893857930: [448533154, 518915100, 339920966, 1371452788, 0, '500 لايك تيك توك'],
    760028678: [448533154, 518915100, 339920966, 1371452788, 0, '500 لايك تيك توك'],
    448533154: [1893857930, 218784005, 561374422, 346112065, 1, '10,000 مشاهدة تيك توك'],
    452519602: [1993833332, 602085314, 1363283611, 522584568, 0, '10,000 مشاهدة انستقرام'],
    1678680199: [1993833332, 602085314, 1363283611, 522584568, 0, '10,000 مشاهدة انستقرام'],
    989524931: [1993833332, 602085314, 1363283611, 522584568, 0, '10,000 مشاهدة انستقرام'],
    1993833332: [452519602, 1792321324, 829209462, 1479702243, 0, '500 لايك انستقرام عرب']
  };
  function ready(cb) { var n = 0; (function t() { if (window.salla && salla.api && salla.api.product && salla.api.cart) return cb(); if (n++ < 120) setTimeout(t, 250); })(); }
  function det(id) {
    if (!DC[id]) DC[id] = salla.api.product.getDetails(id, ['options']).then(function (r) { return r && r.data; }).catch(function () { delete DC[id]; return null; });
    return DC[id];
  }
  function num(v) { if (v && typeof v === 'object') v = v.amount; v = parseFloat(v); return isNaN(v) ? 0 : v; }
  function M(v) { v = Math.round(v * 100) / 100; try { var s = salla.money(v); if (s) return s; } catch (e) {} return v + ' ر.س'; }
  function qty(s) {
    s = String(s || '');
    var mil = /مليون/.test(s);
    var m = s.match(/([0-9][0-9.,]*)\s*(k|K|الف|ألف|الاف|آلاف|ألاف)?/);
    if (!m) return mil ? 1e6 : 0;
    var t = m[1], v;
    if (/^[0-9]{1,3}(,[0-9]{3})+$/.test(t)) v = parseFloat(t.replace(/,/g, ''));
    else v = parseFloat(t.replace(',', '.'));
    if (m[2]) v *= 1000;
    if (mil && v < 1000) v *= 1e6;
    return v || 0;
  }
  function fq(q) { if (q >= 1e6) return (q / 1e6) + ' مليون'; return String(Math.round(q)).replace(/(\d)(?=(\d{3})+$)/g, '$1,'); }
  function css() {
    if (document.getElementById('ffup-css')) return;
    var st = document.createElement('style'); st.id = 'ffup-css';
    st.textContent = '.ffup{margin-top:10px;padding:10px 12px;border:1px dashed #ffab01;border-radius:12px;background:rgba(255,171,1,.08);display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;font-size:13px;line-height:1.6}.ffup[hidden]{display:none}.ffup-t{flex:1 1 180px}.ffup-s{display:block;color:#ffab01;font-weight:700;font-size:12.5px}.ffup-b{margin-inline-start:auto;background:#ffab01;color:#1a1206;border:0;border-radius:999px;padding:7px 16px;font-weight:700;font-size:13px;cursor:pointer;white-space:nowrap}.ffup-b[disabled]{opacity:.6;cursor:default}.ffxs{margin:14px 0;padding:14px;border-radius:16px;border:1px solid rgba(255,171,1,.45);background:rgba(255,171,1,.06)}.ffxs h3{font-size:15px;font-weight:700;margin:0 0 8px}.ffxs .ffup{margin-top:8px;border-style:solid}';
    document.head.appendChild(st);
  }

  /* 1) package upgrade nudge */
  function attach(el) {
    if (el.getAttribute('data-ffup')) return;
    var radios = el.querySelectorAll('input[type=radio][name^="options["],input[type=checkbox][name^="options["]');
    if (!radios.length) return;
    el.setAttribute('data-ffup', '1');
    var pid = +el.getAttribute('product-id') || +(salla.config && salla.config.get && salla.config.get('page.id')) || 0;
    if (!pid) return;
    det(pid).then(function (d) {
      if (!d || !d.options) return;
      var base = num(d.price);
      var groups = {};
      [].forEach.call(radios, function (i) { (groups[i.name] = groups[i.name] || []).push(i); });
      Object.keys(groups).forEach(function (name) {
        var oid = +name.replace(/[^0-9]/g, '');
        var o = d.options.filter(function (x) { return +x.id === oid; })[0];
        if (!o || !o.details || o.details.length < 2) return;
        var vals = o.details.map(function (v) { return { id: String(v.id), q: qty(v.name), p: base + num(v.additional_price) }; });
        if (vals.filter(function (v) { return v.q > 0; }).length < 2) return;
        var inputs = groups[name];
        var host = inputs[0].closest('.s-product-options-option') || inputs[0].parentElement.parentElement;
        var box = document.createElement('div'); box.className = 'ffup'; box.hidden = true; host.appendChild(box);
        function upd() {
          var chk = inputs.filter(function (i) { return i.checked; });
          var cur = chk[0];
          if (chk.length !== 1) { box.hidden = true; return; }
          var k = -1; vals.forEach(function (v, j) { if (v.id === String(cur.value)) k = j; });
          var c = vals[k], n = vals[k + 1];
          if (!c || !n || !c.q || !n.q || n.q <= c.q || !c.p || n.p <= c.p) { box.hidden = true; return; }
          var pct = Math.round((1 - (n.p / n.q) / (c.p / c.q)) * 100);
          if (pct < 5) { box.hidden = true; return; }
          box.innerHTML = '<div class="ffup-t">بزيادة <b>' + M(n.p - c.p) + '</b> بس تاخذ <b>' + fq(n.q) + '</b> بدل ' + fq(c.q) + '<span class="ffup-s">سعر الوحدة أرخص ' + pct + '%</span></div><button type="button" class="ffup-b">رقّ الباقة</button>';
          box.hidden = false;
          box.querySelector('button').onclick = function () {
            var ni = inputs.filter(function (i) { return String(i.value) === n.id; })[0];
            if (!ni) return;
            if (cur.type === 'checkbox' && cur.checked) cur.click();
            if (!ni.checked) ni.click();
            if (!ni.checked) { ni.checked = true; ni.dispatchEvent(new Event('change', { bubbles: true })); }
          };
        }
        inputs.forEach(function (i) { i.addEventListener('change', function () { setTimeout(upd, 0); }); });
        upd();
      });
    });
  }
  function scan() { [].forEach.call(document.querySelectorAll('salla-product-options:not([data-ffup])'), attach); }

  /* 2) related add-on on the cart page */
  var xsDone = false;
  function cartXS() {
    if (xsDone || !document.body.classList.contains('cart')) return;
    var last = document.querySelectorAll('form[id^="item-"]'); if (!last.length) return;
    xsDone = true;
    salla.api.cart.details().then(function (r) {
      var items = (r && r.data && r.data.cart && r.data.cart.items) || [];
      var inCart = {}; items.forEach(function (it) { inCart[it.product_id] = 1; });
      var picks = [], used = {};
      items.forEach(function (it) {
        var x = XS[it.product_id]; if (!x || inCart[x[0]] || used[x[0]]) return;
        var link = ''; (it.options || []).forEach(function (o) { if (o.type === 'textarea' && typeof o.value === 'string' && o.value.trim()) link = o.value.trim(); });
        if (!link) return;
        used[x[0]] = 1; picks.push({ x: x, link: link });
      });
      if (!picks.length) return;
      Promise.all(picks.map(function (p) { return det(p.x[0]); })).then(function (ds) {
        var rows = [];
        picks.forEach(function (p, j) {
          var d = ds[j]; if (!d) return;
          var o = (d.options || []).filter(function (z) { return +z.id === p.x[1]; })[0]; if (!o) return;
          var v = (o.details || []).filter(function (z) { return +z.id === p.x[2]; })[0]; if (!v) return;
          p.price = num(d.price) + num(v.additional_price); rows.push(p);
        });
        if (!rows.length) return;
        var box = document.createElement('div'); box.className = 'ffxs';
        box.innerHTML = '<h3>يكمّل طلبك</h3>' + rows.map(function (p, j) {
          return '<div class="ffup"><div class="ffup-t">أضف <b>' + p.x[5] + '</b> لنفس الرابط<span class="ffup-s">بـ' + M(p.price) + ' فقط</span></div><button type="button" class="ffup-b" data-j="' + j + '">أضف للطلب</button></div>';
        }).join('');
        var list = last[last.length - 1];
        var anchor = list.closest('form') || list;
        anchor.parentNode.insertBefore(box, anchor.nextSibling);
        [].forEach.call(box.querySelectorAll('button'), function (b) {
          b.onclick = function () {
            var p = rows[+b.getAttribute('data-j')], x = p.x, opts = {};
            opts[x[1]] = x[4] ? [x[2]] : x[2]; opts[x[3]] = p.link;
            b.disabled = true; b.textContent = 'جاري الإضافة...';
            salla.api.cart.addItem({ id: x[0], quantity: 1, options: opts }).then(function () { location.reload(); }).catch(function () { b.disabled = false; b.textContent = 'أضف للطلب'; });
          };
        });
      });
    }).catch(function () {});
  }

  ready(function () {
    css(); scan(); cartXS();
    var mo = new MutationObserver(function () { scan(); cartXS(); });
    mo.observe(document.body, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); }, 30000);
  });
})();
