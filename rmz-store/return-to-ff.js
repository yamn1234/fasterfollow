(function () {
  var p = location.pathname;
  var q = location.search;
  if (p.indexOf("/orders") !== 0 && q.indexOf("auth_required") === -1) return;
  function show() {
    if (document.getElementById("ff-back-wrap")) return;
    var wrap = document.createElement("div");
    wrap.id = "ff-back-wrap";
    wrap.className = "ff-back-wrap";
    var box = document.createElement("div");
    box.className = "ff-back-box";
    var ok = document.createElement("div");
    ok.className = "ff-back-ok";
    ok.textContent = "✓";
    var h = document.createElement("h2");
    h.textContent = "تم الدفع بنجاح";
    var t = document.createElement("p");
    t.textContent = "جاري إرجاعك لمتجر فاستر فولو لعرض فاتورة طلبك";
    var a = document.createElement("a");
    a.id = "ff-back-btn";
    a.className = "ff-back-btn";
    a.href = "https://fasterfollow.com/";
    a.textContent = "الرجوع لفاستر فولو الآن";
    box.appendChild(ok);
    box.appendChild(h);
    box.appendChild(t);
    box.appendChild(a);
    wrap.appendChild(box);
    var st = document.createElement("style");
    st.textContent = ".ff-back-wrap{position:fixed;top:0;left:0;right:0;bottom:0;z-index:2147483647;background:#0b1222;color:#fff;display:flex;align-items:center;justify-content:center;direction:rtl;text-align:center;padding:24px;font-family:Tahoma,sans-serif}.ff-back-box{max-width:420px}.ff-back-ok{font-size:46px;color:#10b981}.ff-back-wrap h2{margin:8px 0 10px;font-size:21px;color:#fff}.ff-back-wrap p{color:#9aa6bf;line-height:1.9;margin:0 0 18px}.ff-back-btn{display:block;background:#ffab01;color:#111827;font-weight:800;padding:14px;border-radius:12px;text-decoration:none}";
    document.body.appendChild(st);
    document.body.appendChild(wrap);
    setTimeout(function () { a.click(); }, 1500);
  }
  if (document.body) { show(); } else { document.addEventListener("DOMContentLoaded", show); }
})();
