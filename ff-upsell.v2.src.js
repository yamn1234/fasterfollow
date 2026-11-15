/* ff-upsell v2: package upgrade nudge + "add with your order" add-ons on product page (works with add to cart, quick buy and direct buy) + cart add-ons */
(function () {
  if (window.__ffUp) return; window.__ffUp = 2;
  var DC = {};
  /* add-on catalogue: key -> [productId, qtyOptionId, valueId, linkOptionId, label] */
  var A = {
    ttl: [448533154, 518915100, 339920966, 1371452788, '500 لايك تيك توك'],
    ttv: [1893857930, 218784005, 561374422, 346112065, '10,000 مشاهدة تيك توك'],
    tts: [259350898, 1490569062, 835359413, 1166962287, '1000 حفظ للفيديو'],
    ttsh: [826382602, 818827325, 719016662, 44793662, '1000 شير للفيديو'],
    igv: [1993833332, 602085314, 1363283611, 522584568, '10,000 مشاهدة انستقرام'],
    igl: [452519602, 1792321324, 829209462, 1479702243, '500 لايك انستقرام عرب'],
    igf: [1678680199, 121195792, 1980529055, 2093591059, '1000 لايك انستقرام'],
    igsh: [1766990942, 436938651, 1191744251, 2010138340, '1000 شير انستقرام'],
    xlf: [1035193059, 914771228, 1297779055, 6515741, '100 لايك تويتر'],
    xrt: [1156544862, 834668984, 793025118, 579194388, '100 رتويت عربي'],
    xla: [1992612158, 1297613406, 1043169702, 641533229, '100 لايك تويتر عربي']
  };
  /* product -> add-ons; own = the add-on needs its own post link (main product takes a username) */
  var MAP = {
    1893857930: ['ttl', 'tts', 'ttsh'], 448533154: ['ttv', 'tts', 'ttsh'], 259350898: ['ttv', 'ttl'], 826382602: ['ttv', 'ttl'],
    760028678: ['tts', 'ttsh'], 1197814081: ['ttl', 'tts'],
    1993833332: ['igl', 'igf', 'igsh'], 452519602: ['igv', 'igsh'], 1678680199: ['igv', 'igsh'], 989524931: ['igl', 'igsh'], 1766990942: ['igv', 'igl'],
    1035193059: ['xrt'], 1992612158: ['xrt'], 1156544862: ['xla'],
    950370701: { own: ['ttv', 'ttl'] }, 761287925: { own: ['igv', 'igf'] }, 427608903: { own: ['igv', 'igf'] }, 1540018819: { own: ['igv', 'igf'] },
    344363915: { own: ['xlf'] }, 1894305233: { own: ['xlf'] }, 695419349: { own: ['xlf'] }, 1240610049: { own: ['xlf'] }
  };
  /* cart page cross-sell (same link) */
  var XS = { 1893857930: 'ttl', 760028678: 'ttl', 448533154: 'ttv', 452519602: 'igv', 1678680199: 'igv', 989524931: 'igv', 1993833332: 'igl' };

  function ready(cb) { var n = 0; (function t() { if (window.salla && salla.api && salla.api.product && salla.api.cart) return cb(); if (n++ < 120) setTimeout(t, 250); })(); }
  function det(id) {
    if (!DC[id]) DC[id] = salla.api.product.getDetails(id, ['options']).then(function (r) { return r && r.data; }).catch(function () { delete DC[id]; return null; });
    return DC[id];
  }
  var PC = {};
  /* live price of one package (getDetails can serve stale cached option prices) */
  function lp(pid, oid, vid, multi) {
    var k = pid + '_' + vid;
    if (!PC[k]) { var o = {}; o[oid] = multi ? [vid] : vid; PC[k] = salla.api.product.getPrice({ id: pid, quantity: 1, options: o }).then(function (r) { return num(r && r.data && r.data.price); }).catch(function () { delete PC[k]; return 0; }); }
    return PC[k];
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
  function fq(q) { if (q >= 1e6) return (q / 1e6) + ' مليون'; return String(Math.round(q)).replace(/([0-9])(?=([0-9]{3})+$)/g, '$1,'); }
  function css() {
    if (document.getElementById('ffup-css')) return;
    var st = document.createElement('style'); st.id = 'ffup-css';
    st.textContent = '.ffup{margin-top:10px;padding:10px 12px;border:1px dashed #ffab01;border-radius:12px;background:rgba(255,171,1,.08);display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;font-size:13px;line-height:1.6}.ffup[hidden]{display:none}.ffup-t{flex:1 1 180px;color:#f2f2f2}.ffup-s{display:block;color:#ffab01;font-weight:700;font-size:12.5px}.ffup-b{margin-inline-start:auto;background:#ffab01;color:#1a1206;border:0;border-radius:999px;padding:7px 16px;font-weight:700;font-size:13px;cursor:pointer;white-space:nowrap}.ffup-b[disabled]{opacity:.6;cursor:default}'
      + '.ffad{margin:14px 0 4px;padding:12px;border-radius:14px;border:1px solid rgba(255,171,1,.4);background:rgba(255,171,1,.05);color:#f2f2f2}.ffad h4{margin:0 0 8px;font-size:14.5px;font-weight:700;color:#ffab01}.ffad label{display:flex;align-items:center;gap:10px;padding:8px 10px;margin-top:6px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);cursor:pointer;font-size:13.5px}.ffad label.on{border-color:#ffab01;background:rgba(255,171,1,.12)}.ffad input[type=checkbox]{-webkit-appearance:checkbox!important;appearance:auto!important;width:18px!important;height:18px!important;accent-color:#ffab01;flex:0 0 auto;opacity:1!important;position:static!important}.ffad .n{flex:1}.ffad .p{font-weight:700;color:#ffab01;white-space:nowrap}.ffad .lk{display:none;width:100%;margin:6px 0 2px;padding:8px 10px;border-radius:8px;border:1px solid rgba(255,255,255,.2);background:rgba(0,0,0,.25);color:#fff;font-size:13px;direction:ltr}.ffad .row.on .lk{display:block}.ffad .lk.err{border-color:#ff5a5a}.ffad .tot{margin-top:8px;font-size:12.5px;opacity:.85}.ffad .busy{margin-top:8px;font-weight:700;color:#ffab01}'
      + '.ffxs{margin:14px 0;padding:14px;border-radius:16px;border:1px solid rgba(255,171,1,.45);background:rgba(255,171,1,.06)}.ffxs h3{font-size:15px;font-weight:700;margin:0 0 8px}.ffxs .ffup{margin-top:8px;border-style:solid}';
    document.head.appendChild(st);
  }

  /* 1) package upgrade nudge (product page + cart items) */
  var CM = null;
  function cartD() { if (!CM) CM = salla.api.cart.details().then(function (r) { return (r && r.data && r.data.cart && r.data.cart.items) || []; }).catch(function () { return []; }); return CM; }
  function cartMap() { return cartD().then(function (it) { var m = {}; it.forEach(function (i) { m[String(i.id)] = i.product_id; }); return m; }); }
  function nudge(el, d) {
    var radios = el.querySelectorAll('input[type=radio][name^="options["],input[type=checkbox][name^="options["]');
    var groups = {};
    [].forEach.call(radios, function (i) { (groups[i.name] = groups[i.name] || []).push(i); });
    Object.keys(groups).forEach(function (name) {
      var oid = +name.replace(/[^0-9]/g, '');
      var o = d.options.filter(function (x) { return +x.id === oid; })[0];
      if (!o || !o.details || o.details.length < 2) return;
      var multi = /multiple|checkbox/.test(o.type);
      var vals = o.details.map(function (v) { return { id: String(v.id), q: qty(v.name) }; });
      if (vals.filter(function (v) { return v.q > 0; }).length < 2) return;
      var inputs = groups[name];
      var host = inputs[0].closest('.s-product-options-option') || inputs[0].parentElement.parentElement;
      var box = document.createElement('div'); box.className = 'ffup'; box.hidden = true; host.appendChild(box);
      var tok = 0;
      function upd() {
        var chk = inputs.filter(function (i) { return i.checked; }), cur = chk[0];
        if (chk.length !== 1) { box.hidden = true; return; }
        var k = -1; vals.forEach(function (v, j) { if (v.id === String(cur.value)) k = j; });
        var c = vals[k], n = vals[k + 1];
        if (!c || !n || !c.q || !n.q || n.q <= c.q) { box.hidden = true; return; }
        var my = ++tok;
        Promise.all([lp(d.id, oid, +c.id, multi), lp(d.id, oid, +n.id, multi)]).then(function (pp) { if (my === tok) show(cur, c, n, pp[0], pp[1]); });
      }
      function show(cur, c, n, cp, np) {
        if (!cp || np <= cp) { box.hidden = true; return; }
        c.p = cp; n.p = np;
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
  }

  /* 2) add-ons on the product page */
  var PG = null; /* {pid, el, d, box, rows} */
  function addonsBox(pid, el, d) {
    var m = MAP[pid]; if (!m) return;
    var own = !!m.own, keys = own ? m.own : m;
    Promise.all(keys.map(function (k) { return det(A[k][0]); })).then(function (ds) {
      var rows = [];
      keys.forEach(function (k, j) {
        var a = A[k], x = ds[j]; if (!x || !x.options) return;
        var o = x.options.filter(function (z) { return +z.id === a[1]; })[0]; if (!o) return;
        var v = (o.details || []).filter(function (z) { return +z.id === a[2]; })[0]; if (!v) return;
        rows.push({ a: a, multi: /multiple|checkbox/.test(o.type) });
      });
      return Promise.all(rows.map(function (r) { return lp(r.a[0], r.a[1], r.a[2], r.multi); })).then(function (pp) {
        rows.forEach(function (r, j) { r.price = pp[j]; });
        return rows.filter(function (r) { return r.price > 0; });
      });
    }).then(function (rows) {
      if (!rows.length || document.querySelector('.ffad')) return;
      var box = document.createElement('div'); box.className = 'ffad';
      box.innerHTML = '<h4>أضف مع طلبك</h4>' + rows.map(function (r, j) {
        return '<div class="row" data-j="' + j + '"><label><input type="checkbox"><span class="n">' + esc(r.a[4]) + (own ? '' : ' لنفس الرابط') + '</span><span class="p">+' + M(r.price) + '</span></label>'
          + (own ? '<input class="lk" type="url" inputmode="url" placeholder="رابط المنشور أو الفيديو">' : '') + '</div>';
      }).join('') + '<div class="tot" hidden></div>';
      el.parentNode.insertBefore(box, el.nextSibling);
      [].forEach.call(box.querySelectorAll('.row'), function (rw) {
        var cb = rw.querySelector('input[type=checkbox]');
        cb.addEventListener('change', function () {
          rw.classList.toggle('on', cb.checked); rw.querySelector('label').classList.toggle('on', cb.checked);
          var t = 0, n = 0; [].forEach.call(box.querySelectorAll('.row'), function (r2) { if (r2.querySelector('input[type=checkbox]').checked) { t += rows[+r2.getAttribute('data-j')].price; n++; } });
          var tt = box.querySelector('.tot'); tt.hidden = !n; tt.innerHTML = n ? ('تنضاف ' + n + ' خدمة بـ' + M(t) + ' مع طلبك') : '';
        });
      });
      PG = { pid: pid, el: el, d: d, box: box, rows: rows, own: own };
    });
  }
  function mainLink() {
    var t = PG.el.querySelector('textarea[name^="options["],input[type=text][name^="options["],input[type=url][name^="options["]');
    return t && t.value.trim();
  }
  function mainOpts() {
    var o = {}, ok = true;
    [].forEach.call(PG.el.querySelectorAll('[name^="options["]'), function (i) {
      var id = (i.name.match(/[0-9]+/) || [])[0]; if (!id) return;
      if (i.type === 'radio' || i.type === 'checkbox') { if (!i.checked) return; if (/\[\]$/.test(i.name)) (o[id] = o[id] || []).push(i.value); else o[id] = i.value; }
      else if (i.value && i.value.trim()) o[id] = i.value.trim();
    });
    (PG.d.options || []).forEach(function (op) { if (op.required && !o[op.id]) ok = false; });
    return ok ? o : null;
  }
  function picked() {
    if (!PG) return [];
    var out = [];
    [].forEach.call(PG.box.querySelectorAll('.row'), function (rw) {
      if (!rw.querySelector('input[type=checkbox]').checked) return;
      var lk = rw.querySelector('.lk');
      out.push({ r: PG.rows[+rw.getAttribute('data-j')], lk: lk });
    });
    return out;
  }
  function addAddons(list, link) {
    return list.reduce(function (p, it) {
      return p.then(function () {
        var a = it.r.a, opts = {}, l = it.lk ? it.lk.value.trim() : link;
        if (!l) return;
        opts[a[1]] = it.r.multi ? [a[2]] : a[2]; opts[a[3]] = l;
        return salla.api.cart.addItem({ id: a[0], quantity: 1, options: opts }).catch(function () {});
      });
    }, Promise.resolve());
  }
  function ownMissing(list) {
    var bad = null;
    list.forEach(function (it) { if (it.lk) { var ok = /^https?:[/][/]|^www[.]|[.](com|net|be|ly)[/]/i.test(it.lk.value.trim()); it.lk.classList.toggle('err', !ok); if (!ok && !bad) bad = it.lk; } });
    return bad;
  }
  var pending = null, busy = false;
  function onBuyClick(e) {
    var t = e.target && e.target.closest && e.target.closest('.ffqb,salla-quick-buy,salla-mini-checkout-widget,salla-add-product-button,.sticky-product-bar button');
    if (!t || !PG || busy) return;
    var list = picked(); if (!list.length) return;
    var bad = ownMissing(list);
    if (bad) { e.preventDefault(); e.stopImmediatePropagation(); e.stopPropagation(); bad.scrollIntoView({ block: 'center' }); bad.focus(); return; }
    var link = mainLink();
    var isQ = t.matches('.ffqb,salla-quick-buy,salla-mini-checkout-widget');
    var isAdd = !isQ && (!!t.closest('salla-add-product-button') || /السلة|سلة/.test(t.textContent || ''));
    if (isAdd) { pending = { list: list, link: link, ts: Date.now() }; return; }
    /* quick buy / direct buy: put everything in the cart and go straight to checkout */
    var opts = mainOpts(); if (!opts) return; /* let the store show its own validation */
    e.preventDefault(); e.stopImmediatePropagation(); e.stopPropagation();
    busy = true;
    var msg = document.createElement('div'); msg.className = 'busy'; msg.textContent = 'جاري تجهيز طلبك...'; PG.box.appendChild(msg);
    var qi = document.querySelector('input[name=quantity]'), q = qi ? (+qi.value || 1) : 1;
    salla.api.cart.addItem({ id: PG.pid, quantity: q, options: opts })
      .then(function () { return addAddons(list, link); })
      .then(function () { try { return salla.api.cart.submit(); } catch (x) { location.href = '/cart'; } })
      .catch(function () { location.href = '/cart'; })
      .then(function () { busy = false; setTimeout(function () { if (msg.parentNode) msg.parentNode.removeChild(msg); }, 4000); });
  }
  function onAdded() {
    if (!pending || Date.now() - pending.ts > 20000) return;
    var p = pending; pending = null;
    addAddons(p.list, p.link).then(function () {
      [].forEach.call(PG.box.querySelectorAll('input[type=checkbox]'), function (c) { if (c.checked) c.click(); });
    });
  }

  function attach(el) {
    if (el.getAttribute('data-ffup')) return;
    el.setAttribute('data-ffup', '1');
    var fm = el.closest('form[id^="item-"]');
    var pidP = fm ? cartMap().then(function (m) { return m[fm.getAttribute('id').replace('item-', '')] || 0; }) : Promise.resolve(+el.getAttribute('product-id') || 0);
    pidP.then(function (pid) {
      if (!pid) return;
      det(pid).then(function (d) {
        if (!d || !d.options) return;
        nudge(el, d);
        if (!fm && !document.body.classList.contains('cart')) addonsBox(pid, el, d);
      });
    });
  }
  function scan() { [].forEach.call(document.querySelectorAll('salla-product-options:not([data-ffup])'), attach); }

  /* 3) related add-on on the cart page */
  var xsDone = false;
  function cartXS() {
    if (xsDone || !document.body.classList.contains('cart')) return;
    var last = document.querySelectorAll('form[id^="item-"]'); if (!last.length) return;
    xsDone = true;
    cartD().then(function (items) {
      var inCart = {}; items.forEach(function (it) { inCart[it.product_id] = 1; });
      var picks = [], used = {};
      items.forEach(function (it) {
        var a = A[XS[it.product_id]]; if (!a || inCart[a[0]] || used[a[0]]) return;
        var link = ''; (it.options || []).forEach(function (o) { if (o.type === 'textarea' && typeof o.value === 'string' && o.value.trim()) link = o.value.trim(); });
        if (!link) return;
        used[a[0]] = 1; picks.push({ a: a, link: link });
      });
      if (!picks.length) return;
      Promise.all(picks.map(function (p) { return det(p.a[0]); })).then(function (ds) {
        var rows = [];
        picks.forEach(function (p, j) {
          var d = ds[j]; if (!d) return;
          var o = (d.options || []).filter(function (z) { return +z.id === p.a[1]; })[0]; if (!o) return;
          var v = (o.details || []).filter(function (z) { return +z.id === p.a[2]; })[0]; if (!v) return;
          p.multi = /multiple|checkbox/.test(o.type); rows.push(p);
        });
        return Promise.all(rows.map(function (p) { return lp(p.a[0], p.a[1], p.a[2], p.multi); })).then(function (pp) { rows.forEach(function (p, j) { p.price = pp[j]; }); return rows.filter(function (p) { return p.price > 0; }); });
      }).then(function (rows) {
        if (!rows.length) return;
        var box = document.createElement('div'); box.className = 'ffxs';
        box.innerHTML = '<h3>يكمّل طلبك</h3>' + rows.map(function (p, j) {
          return '<div class="ffup"><div class="ffup-t">أضف <b>' + esc(p.a[4]) + '</b> لنفس الرابط<span class="ffup-s">بـ' + M(p.price) + ' فقط</span></div><button type="button" class="ffup-b" data-j="' + j + '">أضف للطلب</button></div>';
        }).join('');
        var anchor = last[last.length - 1];
        anchor.parentNode.insertBefore(box, anchor.nextSibling);
        [].forEach.call(box.querySelectorAll('button'), function (b) {
          b.onclick = function () {
            var p = rows[+b.getAttribute('data-j')], a = p.a, opts = {};
            opts[a[1]] = p.multi ? [a[2]] : a[2]; opts[a[3]] = p.link;
            b.disabled = true; b.textContent = 'جاري الإضافة...';
            salla.api.cart.addItem({ id: a[0], quantity: 1, options: opts }).then(function () { location.reload(); }).catch(function () { b.disabled = false; b.textContent = 'أضف للطلب'; });
          };
        });
      });
    });
  }

  ready(function () {
    css(); scan(); cartXS();
    window.addEventListener('click', onBuyClick, true);
    try { salla.event.cart.onItemAdded(onAdded); } catch (e) { try { salla.event.on('cart::item.added', onAdded); } catch (x) {} }
    var mo = new MutationObserver(function () { scan(); cartXS(); });
    mo.observe(document.body, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); }, 30000);
  });
})();
