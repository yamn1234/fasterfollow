/* ff-acc: customer view for delivered digital accounts — runs only when URL hash is #acc=TOKEN */
(function () {
  var m = /^#acc=([A-Za-z0-9_-]{10,60})$/.exec(location.hash || '');
  if (!m || window.__ffAcc) return;
  window.__ffAcc = 1;
  var token = m[1];
  try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var css = '#ffacc{position:fixed;inset:0;z-index:2147483600;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;padding:16px;direction:rtl;font-family:inherit}' +
    '#ffacc .bx{width:min(460px,100%);max-height:92vh;overflow:auto;background:#14161b;color:#f2f2f2;border:1px solid rgba(255,178,26,.35);border-radius:18px;padding:18px 16px;box-shadow:0 20px 50px rgba(0,0,0,.5)}' +
    '#ffacc h3{margin:0 0 4px;font-size:17px;font-weight:800;color:#ffb21a}#ffacc .sb{margin:0 0 14px;font-size:13px;color:#a3a9b6;line-height:1.7}' +
    '#ffacc .ac{border:1px solid #2a2f3a;border-radius:14px;padding:6px 10px;margin-bottom:10px}#ffacc .ac b{display:block;font-size:12.5px;color:#a3a9b6;margin:6px 0 2px}' +
    '#ffacc .rw{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #22262f}#ffacc .rw:last-child{border-bottom:0}' +
    '#ffacc .lb{flex:0 0 auto;min-width:76px;font-size:12.5px;color:#a3a9b6}#ffacc .vl{flex:1;min-width:0;direction:ltr;text-align:left;font-family:ui-monospace,Menlo,monospace;font-size:14px;word-break:break-all;user-select:all}' +
    '#ffacc .cp{flex:0 0 auto;border:0;border-radius:9px;background:#ffb21a;color:#1b1206;font-weight:800;font-size:12.5px;padding:7px 12px;cursor:pointer;font-family:inherit}#ffacc .cp.ok{background:#22c55e;color:#fff}' +
    '#ffacc .nt{font-size:12.5px;color:#d6d9e0;background:#1c2029;border-radius:10px;padding:9px 10px;margin:4px 0 12px;line-height:1.7}' +
    '#ffacc .x{display:block;width:100%;margin-top:6px;border:1px solid #2a2f3a;background:transparent;color:#d6d9e0;border-radius:12px;padding:10px;font-weight:700;cursor:pointer;font-family:inherit}';
  function show(html) {
    var w = document.getElementById('ffacc');
    if (!w) {
      var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
      w = document.createElement('div'); w.id = 'ffacc'; document.body.appendChild(w);
      w.addEventListener('click', function (e) {
        if (e.target === w || e.target.classList.contains('x')) { w.parentNode.removeChild(w); return; }
        var b = e.target.closest && e.target.closest('.cp'); if (!b) return;
        var v = b.getAttribute('data-v');
        var done = function () { b.classList.add('ok'); b.textContent = 'تم النسخ'; setTimeout(function () { b.classList.remove('ok'); b.textContent = 'نسخ'; }, 1600); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(done, function () { fb(v); done(); });
        else { fb(v); done(); }
      });
    }
    w.innerHTML = '<div class="bx">' + html + '<button type="button" class="x">إغلاق</button></div>';
  }
  function fb(v) { var t = document.createElement('textarea'); t.value = v; t.style.position = 'fixed'; t.style.opacity = '0'; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (e) {} document.body.removeChild(t); }
  function run() {
    show('<h3>جاري تحميل بيانات حسابك…</h3>');
    fetch('https://fasterfollow.store/api/acc/' + token, { cache: 'no-store' }).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || 'تعذر التحميل'); return j; }); })
      .then(function (d) {
        var h = '<h3>بيانات حسابك جاهزة ✅</h3><p class="sb">' + esc(d.product) + '<br>رقم الطلب: ' + esc(d.orderId) + '</p>';
        if (d.note) h += '<div class="nt">' + esc(d.note) + '</div>';
        h += d.accounts.map(function (a, i) {
          return '<div class="ac">' + (d.accounts.length > 1 ? '<b>الحساب ' + (i + 1) + '</b>' : '') + a.fields.map(function (f) {
            return '<div class="rw"><span class="lb">' + esc(f.label) + '</span><span class="vl">' + esc(f.value) + '</span><button type="button" class="cp" data-v="' + esc(f.value) + '">نسخ</button></div>';
          }).join('') + '</div>';
        }).join('');
        h += '<p class="sb" style="margin:10px 0 0">احفظ البيانات عندك. أي مشكلة كلمنا واتساب.</p>';
        show(h);
      })
      .catch(function (e) { show('<h3>ما قدرنا نفتح الرابط</h3><p class="sb">' + esc(e.message) + ' — تواصل معنا واتساب ونرسلها لك.</p>'); });
  }
  if (document.body) run(); else document.addEventListener('DOMContentLoaded', run);
})();
