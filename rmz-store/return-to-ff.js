/* فاستر فولو: بعد الدفع في رمز رجّع العميل لفاستر فولو بدل ما يضل في متجر رمز */
(function () {
  try {
    var p = location.pathname, q = location.search, ref = document.referrer || "";
    var landed = p.indexOf("/orders") === 0 || q.indexOf("auth_required") > -1 || q.indexOf("payment") > -1;
    var fromGateway = ref.indexOf("rmz.gg") === -1;
    var hasOpener = false;
    try { hasOpener = !!window.opener; } catch (e) {}
    if (!landed || !(hasOpener || fromGateway)) return;

    var target = "https://fasterfollow.com/?ff_paid=1";

    var box = document.createElement("div");
    box.setAttribute("style", "position:fixed;inset:0;z-index:2147483647;background:#0b1222;color:#fff;display:flex;align-items:center;justify-content:center;font-family:Tahoma,sans-serif;direction:rtl;text-align:center;padding:24px");
    box.innerHTML = '<div style="max-width:420px"><div style="font-size:46px;color:#10b981">✓</div>' +
      '<h2 style="margin:8px 0 10px;font-size:21px">تم الدفع بنجاح</h2>' +
      '<p style="color:#9aa6bf;line-height:1.9;margin:0 0 18px">جاري إرجاعك لمتجر فاستر فولو لعرض فاتورة طلبك…</p>' +
      '<a id="ff-back" href="' + target + '" style="display:block;background:#ffab01;color:#111827;font-weight:800;padding:14px;border-radius:12px;text-decoration:none">الرجوع لفاستر فولو الآن</a></div>';
    (document.body || document.documentElement).appendChild(box);

    setTimeout(function () {
      if (hasOpener) {
        try { window.close(); } catch (e) {}
      }
      setTimeout(function () { location.replace(target); }, 400);
    }, 1500);
  } catch (e) {}
})();
