/* Category pages: group product cards by type (followers, score, follower accounts, score accounts...) with a small heading per group.
   Uses CSS order on the grid only: no DOM moves, no extra requests, works with infinite scroll. No backslashes (Reparo-safe). */
(function () {
  if (window.__ffGrp3) return; window.__ffGrp3 = 1;
  var G = [['fol', 'متابعين'], ['sco', 'زيادة سكور'], ['lik', 'لايكات'], ['vie', 'مشاهدات'], ['com', 'تعليقات'], ['eng', 'تفاعل وباقات'], ['acf', 'حسابات متابعين'], ['acs', 'حسابات سكور'], ['acc', 'حسابات ويوزرات'], ['oth', 'خدمات أخرى']];
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
    if (sorted(pl)) { for (var h = 0; h < heads.length; h++) heads[h].classList.add('ffoff'); for (var q = 0; q < cards.length; q++) cards[q].style.order = ''; return; }
    var cnt = {}, used = 0, byk = {};
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i], k = c.getAttribute('data-ffk');
      if (!k) { var t = c.querySelector('.s-product-card-content-title'); k = kind(t ? t.textContent : ''); c.setAttribute('data-ffk', k); }
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
      var k = g[0], n = cnt[k]; if (!n || n >= cols) return;
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
      var pl = a[i]; if (pl.__ffg3) continue; pl.__ffg3 = 1; lists.push(pl);
      new MutationObserver(function () { clearTimeout(tm); tm = setTimeout(all, 60); }).observe(pl, { childList: true, subtree: true });
      run(pl);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  [800, 2500].forEach(function (t) { setTimeout(init, t); });
  document.addEventListener('change', function (e) { if (e.target && e.target.id === 'product-filter') setTimeout(all, 50); });
  var rz = 0; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(all, 150); }, { passive: true });
})();
