/* FF invoice overlay: shown on fasterfollow.com when the URL has ?ff_invoice=1 (after paying through the alternative gateway) */
(function () {
  if (window.__ffInv) return; window.__ffInv = 1;
  var q; try { q = new URLSearchParams(location.search); } catch (e) { return; }
  if (!q.has('ff_invoice')) return;
  function v(k) { var x = q.get(k); return x == null ? '' : String(x).trim(); }
  var orderId = v('orderId'); if (orderId.charAt(0) === '#') orderId = orderId.slice(1);
  var amount = v('amount'), currency = v('currency') || 'ر.س', services = v('services'), pkg = v('package'),
      link = v('link'), notes = v('notes'), name = v('name'), phone = v('phone'), email = v('email');
  var css = '#ffinv{position:fixed;inset:0;z-index:2147483000;background:rgba(5,9,20,.92);overflow-y:auto;-webkit-overflow-scrolling:touch;direction:rtl;font-family:inherit}' +
    '#ffinv .w{max-width:520px;margin:0 auto;padding:22px 16px 40px}' +
    '#ffinv .c{background:#111a2e;border:1px solid #22304d;border-radius:18px;padding:22px 18px;box-shadow:0 14px 34px rgba(0,0,0,.45);color:#e5e7eb}' +
    '#ffinv .ok{width:64px;height:64px;margin:0 auto 12px;border-radius:50%;background:rgba(16,185,129,.14);border:2px solid #10b981;display:flex;align-items:center;justify-content:center}' +
    '#ffinv .ok svg{width:34px;height:34px;stroke:#10b981}' +
    '#ffinv h2{margin:0 0 6px;text-align:center;font-size:21px;color:#fff;font-weight:800}' +
    '#ffinv .sub{margin:0 0 18px;text-align:center;font-size:14px;line-height:1.8;color:#9aa6bf}' +
    '#ffinv .inv{border-top:1px dashed #22304d;border-bottom:1px dashed #22304d;padding:6px 0;margin:0 0 16px}' +
    '#ffinv .r{display:flex;justify-content:space-between;gap:12px;padding:9px 0;font-size:14px;line-height:1.6}' +
    '#ffinv .r:not(:first-child){border-top:1px solid rgba(255,255,255,.05)}' +
    '#ffinv .r span{color:#9aa6bf;flex:0 0 auto}#ffinv .r b{color:#fff;font-weight:700;text-align:left;word-break:break-word;max-width:68%}' +
    '#ffinv .r.t b{color:#ffc53d;font-size:17px}#ffinv .pd{display:inline-block;padding:2px 10px;border-radius:999px;background:rgba(16,185,129,.15);color:#10b981;font-size:13px;font-style:normal}' +
    '#ffinv .nx{background:rgba(255,171,1,.07);border:1px solid rgba(255,171,1,.3);border-radius:12px;padding:12px 14px;margin:0 0 16px;font-size:13.5px;line-height:1.9;color:#d8deea}#ffinv .nx b{color:#ffc53d}' +
    '#ffinv .b{display:flex;align-items:center;justify-content:center;width:100%;min-height:48px;margin:0 0 10px;border-radius:12px;border:0;font-family:inherit;font-size:15px;font-weight:800;text-decoration:none;cursor:pointer}' +
    '#ffinv .b.wa{background:#22c55e;color:#06210f}#ffinv .b.cp{background:transparent;border:1px solid #22304d;color:#e5e7eb}#ffinv .b.hm{background:#ffab01;color:#111827}' +
    '#ffinv .nt{margin:14px 0 0;text-align:center;font-size:12px;color:#9aa6bf;line-height:1.8}html.ffinv-on,html.ffinv-on body{overflow:hidden!important}';
  function build() {
    if (document.getElementById('ffinv')) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var o = document.createElement('div'); o.id = 'ffinv'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'فاتورة طلبك');
    o.innerHTML = '<div class="w"><div class="c">' +
      '<div class="ok"><svg viewBox="0 0 24 24" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>' +
      '<h2>تم استلام دفعتك بنجاح</h2><p class="sub">شكراً لثقتك، هذي فاتورة طلبك. احتفظ برقم الطلب عشان تتابع معنا.</p>' +
      '<div class="inv"></div>' +
      '<div class="nx"><b>وش يصير الحين؟</b><br>طلبك وصلنا ويبدأ التنفيذ في أقرب وقت. لتسريع التنفيذ أرسل لنا رقم الطلب على واتساب من الزر اللي تحت.</div>' +
      '<a class="b wa" target="_blank" rel="noopener">تواصل معنا على واتساب لتأكيد طلبك</a>' +
      '<button class="b cp" type="button">نسخ رقم الطلب</button>' +
      '<button class="b hm" type="button">الرجوع للمتجر</button>' +
      '<p class="nt">طريقة الدفع: بطاقة بنكية / مدى / Apple Pay عبر بوابة الدفع البديلة.<br>تقدر تصوّر هالصفحة كإثبات للدفع.</p></div></div>';
    var date = '';
    try { date = new Date().toLocaleString('ar-SA-u-ca-gregory', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch (e) {}
    var rows = [['رقم الطلب', orderId ? '#' + orderId : ''], ['التاريخ', date], ['الخدمة', services],
      ['الباقة', pkg && services.indexOf(pkg) < 0 ? pkg : ''], ['الرابط / اليوزر', link], ['ملاحظات', notes],
      ['الاسم', name], ['الجوال', phone], ['البريد', email], ['حالة الدفع', '*'], ['المبلغ المدفوع', amount ? amount + ' ' + currency : '']];
    var inv = o.querySelector('.inv');
    rows.forEach(function (r) {
      if (!r[1]) return;
      var d = document.createElement('div'); d.className = r[0] === 'المبلغ المدفوع' ? 'r t' : 'r';
      var s = document.createElement('span'); s.textContent = r[0];
      var b = document.createElement('b');
      if (r[1] === '*') { var p = document.createElement('i'); p.className = 'pd'; p.textContent = 'مدفوع'; b.appendChild(p); } else b.textContent = r[1];
      d.appendChild(s); d.appendChild(b); inv.appendChild(d);
    });
    var msg = ['السلام عليكم، دفعت عبر بوابة الدفع البديلة'];
    if (orderId) msg.push('رقم الطلب: #' + orderId);
    if (services) msg.push('الخدمة: ' + services);
    if (link) msg.push('الرابط / اليوزر: ' + link);
    if (amount) msg.push('المبلغ: ' + amount + ' ' + currency);
    o.querySelector('.wa').href = 'https://wa.me/966537763009?text=' + encodeURIComponent(msg.join('\n'));
    var cp = o.querySelector('.cp');
    if (!orderId) cp.style.display = 'none';
    cp.addEventListener('click', function () {
      var t = '#' + orderId;
      function done() { cp.textContent = 'تم النسخ ✓'; setTimeout(function () { cp.textContent = 'نسخ رقم الطلب'; }, 1800); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, done); else done();
    });
    o.querySelector('.hm').addEventListener('click', function () {
      o.remove(); document.documentElement.classList.remove('ffinv-on');
      try { history.replaceState(null, '', location.pathname); } catch (e) {}
    });
    document.body.appendChild(o);
    document.documentElement.classList.add('ffinv-on');
  }
  if (document.body) build(); else document.addEventListener('DOMContentLoaded', build);
})();
