/* Quick view: clearer eye button on product cards + a richer quick-view sheet
   (package list with prices instead of a dropdown, short service summary, sticky buy-now / add-to-cart).
   No backslashes (Reparo-safe). Loads nothing extra until the visitor opens a quick view. */
(function () {
  if (window.__ffQv) return; window.__ffQv = 1;
  var st = document.createElement('style');
  st.textContent = [
    /* card button: amber pill with a label */
    '.s-product-card-quick-view-btn button{width:auto!important;min-width:0!important;height:30px!important;padding:0 10px 0 9px!important;border-radius:999px!important;background:rgba(10,12,20,.82)!important;border:1.5px solid #ffab01!important;color:#ffab01!important;gap:5px;display:inline-flex!important;align-items:center;box-shadow:0 4px 12px rgba(0,0,0,.45)}',
    '.s-product-card-quick-view-btn button i,.s-product-card-quick-view-btn button svg{color:#ffab01!important;fill:currentColor;font-size:15px!important}',
    '.s-product-card-quick-view-btn button:after{content:"عرض سريع";font:700 12px/1 inherit;color:#ffab01;white-space:nowrap}',
    /* sheet */
    '#angel-quick-view .angel-quick-view__sub-title{display:none!important}',
    '#angel-quick-view .angel-quick-view__price .total-price{font-size:26px!important;color:#ffab01!important}',
    '.ffqv-sum{margin:10px 0 4px;padding:12px 14px;border-radius:14px;background:rgba(255,171,1,.06);border:1px solid rgba(255,171,1,.25);font-size:14px;line-height:1.75;color:inherit}',
    '.ffqv-sum b.h{display:block;font-size:13px;color:#ffab01;margin-bottom:4px}',
    '.ffqv-sum ul{margin:6px 0 0;padding:0;list-style:none}',
    '.ffqv-sum li{position:relative;padding-right:18px;margin:3px 0}',
    '.ffqv-sum li:before{content:"";position:absolute;right:2px;top:10px;width:7px;height:7px;border-radius:50%;background:#ffab01}',
    '.ffqv-sum a{display:inline-block;margin-top:6px;font-size:13px;font-weight:700;color:#ffab01;text-decoration:underline}',
    '.ffqv-list{display:flex;flex-direction:column;gap:8px;margin-top:8px}',
    '.ffqv-it{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:12px;border:1.5px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);cursor:pointer;text-align:right;width:100%;color:inherit;font:inherit}',
    '.ffqv-it i{flex:none;width:18px;height:18px;border-radius:50%;border:2px solid rgba(255,255,255,.35)}',
    '.ffqv-it span{flex:1;font-size:13.5px;line-height:1.5}',
    '.ffqv-it b{flex:none;font-size:14.5px;font-weight:800;color:#ffab01;white-space:nowrap}',
    '.ffqv-it.on{border-color:#ffab01;background:rgba(255,171,1,.09)}',
    '.ffqv-it.on i{border-color:#ffab01;background:radial-gradient(circle,#ffab01 0 4px,transparent 5px)}',
    '.ffqv-hide{position:absolute!important;opacity:0!important;pointer-events:none!important;height:0!important;overflow:hidden!important}',
    '#angel-quick-view .angel-quick-view__add-to-cart{position:sticky;bottom:0;z-index:5;gap:8px;padding:10px 0 4px;background:inherit;flex-wrap:wrap}',
    '.ffqv-buy{flex:1 1 100%;height:48px;border-radius:12px;border:0;background:#ffab01;color:#1a1206;font:800 17px/48px inherit;cursor:pointer;box-shadow:0 8px 20px rgba(255,171,1,.25)}',
    '.ffqv-buy[disabled]{opacity:.6}'
  ].join('');
  document.head.appendChild(st);

  function num(t) { var m = String(t || '').replace(/,/g, '').match(/[0-9]+([.][0-9]+)?/); return m ? parseFloat(m[0]) : 0; }
  function cur(t) { var m = String(t || '').replace(/[0-9.,()+ ]+/g, ' ').trim(); return m || ''; }

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
      var add = bar.querySelector('salla-add-product-button button, button');
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
