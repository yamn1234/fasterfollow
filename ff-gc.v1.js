/* FF guest checkout v29 - product + category pages part (loaded by the inline core) */
(function () {
  if (window.FFG2 || !window.FFG) return;
  window.FFG2 = 1;
  var addMada = window.__ffgAddMada || function () {};
  var GUEST_FIRST = 'عميل';
  var GUEST_LAST = 'المتجر';
  /* ================= 2) Product + category pages ================= */
  var isGuest = function () {
    try { return !!(window.salla && salla.config && salla.config.isGuest()); } catch (e) { return false; }
  };
  var canApplePay = function () {
    try { return !!(window.ApplePaySession && ApplePaySession.canMakePayments()); } catch (e) { return false; }
  };
  var quiet = function (fn) { return salla.api.withoutNotifier ? salla.api.withoutNotifier(fn) : fn(); };
  /* national mobile length and first digits per country */
  var RULES = { SA: [9, '5'], AE: [9, '5'], KW: [8, '569'], QA: [8, '3567'], BH: [8, '36'], OM: [8, '79'], EG: [10, '1'] };
  var phoneOk = function (cc, ph) {
    var r = RULES[cc];
    if (!r) return ph.length >= 6 && ph.length <= 13;
    return ph.length === r[0] && r[1].indexOf(ph.charAt(0)) > -1;
  };
  /* all countries: ISO|dial code|Arabic name (Gulf + Arab first) */
var COUNTRIES = 'SA|966|المملكة العربية السعودية;AE|971|الإمارات العربية المتحدة;KW|965|الكويت;QA|974|قطر;BH|973|البحرين;OM|968|عُمان;EG|20|مصر;JO|962|الأردن;IQ|964|العراق;SY|963|سوريا;LB|961|لبنان;PS|970|الأراضي الفلسطينية;YE|967|اليمن;LY|218|ليبيا;SD|249|السودان;TN|216|تونس;DZ|213|الجزائر;MA|212|المغرب;MR|222|موريتانيا;TR|90|تركيا;US|1|الولايات المتحدة;GB|44|المملكة المتحدة;IS|354|آيسلندا;AZ|994|أذربيجان;AM|374|أرمينيا;AW|297|أروبا;AU|61|أستراليا;AF|93|أفغانستان;AL|355|ألبانيا;DE|49|ألمانيا;AG|1|أنتيغوا وبربودا;AD|376|أندورا;AO|244|أنغولا;AI|1|أنغويلا;UY|598|أورغواي;UZ|998|أوزبكستان;UG|256|أوغندا;UA|380|أوكرانيا;IE|353|أيرلندا;ET|251|إثيوبيا;ER|291|إريتريا;ES|34|إسبانيا;EE|372|إستونيا;IL|972|إسرائيل;SZ|268|إسواتيني;ID|62|إندونيسيا;IR|98|إيران;IT|39|إيطاليا;AR|54|الأرجنتين;IO|246|الإقليم البريطاني في المحيط الهندي;EC|593|الإكوادور;BR|55|البرازيل;PT|351|البرتغال;BA|387|البوسنة والهرسك;CZ|420|التشيك;ME|382|الجبل الأسود;DK|45|الدانمرك;CV|238|الرأس الأخضر;SV|503|السلفادور;SN|221|السنغال;SE|46|السويد;EH|212|الصحراء الغربية;SO|252|الصومال;CN|86|الصين;GA|241|الغابون;VA|39|الفاتيكان;PH|63|الفلبين;CM|237|الكاميرون;CG|242|الكونغو - برازافيل;CD|243|الكونغو - كينشاسا;MX|52|المكسيك;NO|47|النرويج;AT|43|النمسا;NE|227|النيجر;IN|91|الهند;JP|81|اليابان;GR|30|اليونان;PG|675|بابوا غينيا الجديدة;PY|595|باراغواي;PK|92|باكستان;PW|680|بالاو;BB|1|بربادوس;BM|1|برمودا;BN|673|بروناي;BE|32|بلجيكا;BG|359|بلغاريا;BZ|501|بليز;BD|880|بنغلاديش;PA|507|بنما;BJ|229|بنين;BT|975|بوتان;BW|267|بوتسوانا;PR|1|بورتوريكو;BF|226|بوركينا فاسو;BI|257|بوروندي;PL|48|بولندا;BO|591|بوليفيا;PF|689|بولينيزيا الفرنسية;PE|51|بيرو;BY|375|بيلاروس;TH|66|تايلاند;TW|886|تايوان;TM|993|تركمانستان;TA|290|تريستان دا كونا;TT|1|ترينيداد وتوباغو;TD|235|تشاد;CL|56|تشيلي;TZ|255|تنزانيا;TG|228|توغو;TV|688|توفالو;TK|690|توكيلاو;TO|676|تونغا;TL|670|تيمور - ليشتي;JM|1|جامايكا;GI|350|جبل طارق;AX|358|جزر آلاند;BS|1|جزر البهاما;KM|269|جزر القمر;MQ|596|جزر المارتينيك;MV|960|جزر المالديف;TC|1|جزر توركس وكايكوس;SB|677|جزر سليمان;FO|298|جزر فارو;FK|500|جزر فوكلاند;VI|1|جزر فيرجن الأمريكية;VG|1|جزر فيرجن البريطانية;KY|1|جزر كايمان;CK|682|جزر كوك;CC|61|جزر كوكوس (كيلينغ);MH|692|جزر مارشال;MP|1|جزر ماريانا الشمالية;WF|681|جزر والس وفوتونا;AC|247|جزيرة أسينشيون;CX|61|جزيرة كريسماس;IM|44|جزيرة مان;NF|672|جزيرة نورفولك;CF|236|جمهورية أفريقيا الوسطى;DO|1|جمهورية الدومينيكان;ZA|27|جنوب أفريقيا;SS|211|جنوب السودان;GE|995|جورجيا;DJ|253|جيبوتي;JE|44|جيرسي;DM|1|دومينيكا;RW|250|رواندا;RU|7|روسيا;RO|40|رومانيا;RE|262|روينيون;ZM|260|زامبيا;ZW|263|زيمبابوي;CI|225|ساحل العاج;WS|685|ساموا;AS|1|ساموا الأمريكية;BL|590|سان بارتليمي;PM|508|سان بيير ومكويلون;MF|590|سان مارتن;SM|378|سان مارينو;VC|1|سانت فنسنت وجزر غرينادين;KN|1|سانت كيتس ونيفيس;LC|1|سانت لوسيا;SX|1|سانت مارتن;SH|290|سانت هيلينا;ST|239|ساو تومي وبرينسيبي;LK|94|سريلانكا;SJ|47|سفالبارد وجان ماين;SK|421|سلوفاكيا;SI|386|سلوفينيا;SG|65|سنغافورة;SR|597|سورينام;CH|41|سويسرا;SL|232|سيراليون;SC|248|سيشل;RS|381|صربيا;TJ|992|طاجيكستان;GM|220|غامبيا;GH|233|غانا;GD|1|غرينادا;GL|299|غرينلاند;GT|502|غواتيمالا;GP|590|غوادلوب;GU|1|غوام;GF|594|غويانا الفرنسية;GY|592|غيانا;GG|44|غيرنزي;GN|224|غينيا;GQ|240|غينيا الاستوائية;GW|245|غينيا بيساو;VU|678|فانواتو;FR|33|فرنسا;VE|58|فنزويلا;FI|358|فنلندا;VN|84|فيتنام;FJ|679|فيجي;CY|357|قبرص;KG|996|قيرغيزستان;KZ|7|كازاخستان;NC|687|كاليدونيا الجديدة;HR|385|كرواتيا;KH|855|كمبوديا;CA|1|كندا;CU|53|كوبا;CW|599|كوراساو;KR|82|كوريا الجنوبية;KP|850|كوريا الشمالية;CR|506|كوستاريكا;XK|383|كوسوفو;CO|57|كولومبيا;KI|686|كيريباتي;KE|254|كينيا;LV|371|لاتفيا;LA|856|لاوس;LU|352|لوكسمبورغ;LR|231|ليبيريا;LT|370|ليتوانيا;LI|423|ليختنشتاين;LS|266|ليسوتو;MT|356|مالطا;ML|223|مالي;MY|60|ماليزيا;YT|262|مايوت;MG|261|مدغشقر;MK|389|مقدونيا الشمالية;MW|265|ملاوي;MO|853|منطقة ماكاو الإدارية الخاصة;MN|976|منغوليا;MU|230|موريشيوس;MZ|258|موزمبيق;MD|373|مولدوفا;MC|377|موناكو;MS|1|مونتسرات;MM|95|ميانمار (بورما);FM|691|ميكرونيزيا;NA|264|ناميبيا;NR|674|ناورو;NP|977|نيبال;NG|234|نيجيريا;NI|505|نيكاراغوا;NZ|64|نيوزيلندا;NU|683|نيوي;HT|509|هايتي;HN|504|هندوراس;HU|36|هنغاريا;NL|31|هولندا;BQ|599|هولندا الكاريبية;HK|852|هونغ كونغ الصينية (منطقة إدارية خاصة)';
  var digits = function (s) {
    return String(s || '').split('').filter(function (c) { return '0123456789'.indexOf(c) > -1; }).join('');
  };
  var flag = function (iso) {
    return String.fromCodePoint(127397 + iso.charCodeAt(0)) + String.fromCodePoint(127397 + iso.charCodeAt(1));
  };

  /* payment always in SAR: switch the session AND the API header (requests carrying the old
     currency header switch the session back) before the cart/checkout is built */
  var curCode = function () {
    try { return String(salla.api.getHeaders().currency || salla.config.get('user.currency_code') || ''); } catch (e) { return ''; }
  };
  var ensureSAR = function () {
    if (curCode() === 'SAR') return Promise.resolve();
    return salla.api.currency.change('SAR').then(function () {
      try { salla.api.setHeader('currency', 'SAR'); } catch (e) {}
      try { salla.config.set('user.currency_code', 'SAR'); } catch (e) {}
    }).catch(function () { throw new Error('تعذر تحويل العملة للريال، حاول مرة ثانية'); });
  };

  /* quick buy = this product only: remove whatever is already in the cart */
  var emptyCart = function () {
    return salla.api.cart.getCurrentCartId()
      .then(function () { return quiet(function () { return salla.api.cart.details(); }); })
      .then(function (r) {
        var items = (r && r.data && r.data.cart && r.data.cart.items) || [];
        return Promise.all(items.map(function (it) {
          return quiet(function () { return salla.api.cart.deleteItem(it.id); }).catch(function () {});
        }));
      }).catch(function () {});
  };

  /* SAR -> empty cart -> add this product (form) -> checkout id. One run at a time. */
  var inflight = null;
  var prepCheckout = function (form, onSar) {
    if (inflight) return inflight;
    inflight = ensureSAR()
      .then(function () { if (onSar) onSar(); })
      .then(emptyCart)
      .then(function () {
        return quiet(function () { return salla.cart.addItem(new FormData(form)); })
          .catch(function (e) {
            var m = '';
            try { m = e.response.data.error.message || ''; } catch (er) {}
            throw new Error(m || 'اختر الباقة واكتب الرابط أولاً');
          });
      })
      .then(function () { return salla.api.cart.getCurrentCartId(); })
      .then(function (cid) { return salla.api.cart.status(cid, true, true); })
      .then(function (r) {
        var url = r && r.data && r.data.next_step && r.data.next_step.url;
        if (!url) throw new Error('تعذر تجهيز الطلب');
        return { id: url.split('/checkout/')[1].split('?')[0].split('#')[0].split('/')[0], url: url };
      })
      .then(function (r) { inflight = null; return r; }, function (e) { inflight = null; throw e; });
    return inflight;
  };

  var sendContact = function (ck, g) {
    if (!g) return Promise.resolve(ck);
    return fetch(salla.url.get('checkout/' + ck.id + '/customer'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ first_name: g.first, last_name: g.last, email: '', phone: g.phone, country_code: g.cc, country_key: g.key })
    }).then(function (res) {
      if (res.ok) return ck;
      return res.json().catch(function () { return {}; }).then(function (j) {
        var er = (j && j.error) || {};
        var fl = er.fields || {};
        var msg = '';
        for (var k in fl) { if (fl[k] && fl[k][0]) { msg = fl[k][0]; break; } }
        throw new Error(msg || er.message || 'تعذر حفظ بياناتك');
      });
    });
  };

  var PH_KEY = 'ffGuestPhone';
  var savePhone = function (g) {
    try { localStorage.setItem(PH_KEY, g.cc + '|' + g.key + '|' + g.phone); } catch (e) {}
  };
  var lastPhone = function () {
    try { var s = localStorage.getItem(PH_KEY); return s ? s.split('|') : null; } catch (e) { return null; }
  };
  var TRACK = {
    'checkout::started': 'Checkout Started', 'payment::method_updated': 'Payment Info Entered',
    'payment::submitted': 'Payment Submitted', 'payment::pending': 'Payment Pending',
    'payment::succeeded': 'Payment Succeeded', 'payment::failed': 'Payment Failed',
    'coupon::entered': 'Coupon Entered', 'coupon::applied': 'Coupon Applied',
    'coupon::denied': 'Coupon Denied', 'coupon::removed': 'Coupon Removed'
  };
  var mcss =
    '#ffmc{position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;direction:rtl}' +
    '#ffmc .cd{position:relative;width:min(480px,100%);max-height:92vh;overflow-y:auto;background:#fff;border-radius:16px;box-shadow:0 20px 50px rgba(0,0,0,.4);font-family:inherit;color:#111827}' +
    '#ffmc .cd.dk{background:#111827;color:#f3f4f6}' +
    '#ffmc .x{position:absolute;top:10px;left:10px;z-index:2;width:32px;height:32px;border:0;border-radius:50%;background:#f3f4f6;color:#374151;font-size:20px;line-height:32px;cursor:pointer}' +
    '#ffmc .st{padding:22px 18px 18px}' +
    '#ffmc h3{margin:0 0 4px;font-size:17px;font-weight:700;padding-left:36px}' +
    '#ffmc .sb{margin:0 0 14px;font-size:13px;color:#6b7280}' +
    '#ffmc .dk .sb{color:#9ca3af}' +
    '#ffmc .r{display:flex;gap:8px}' +
    '#ffmc .r select,#ffmc .r input{height:46px;border:1px solid #d1d5db;border-radius:12px;background:#fff;color:#111827;font-size:16px;padding:0 10px;min-width:0;box-sizing:border-box}' +
    '#ffmc .dk .r select,#ffmc .dk .r input{border-color:#94a3b84d;background:transparent;color:#f3f4f6}#ffmc .dk .r option{background:#111827}' +
    '#ffmc .r select{flex:0 0 112px;width:112px;direction:ltr;text-overflow:ellipsis}' +
    '#ffmc .r input{flex:1;direction:ltr;text-align:left}' +
    '#ffmc .go{display:block;width:100%;height:48px;margin-top:12px;border:0;border-radius:12px;background:linear-gradient(135deg,#ffd76a 0%,#ffb21a 48%,#ff8a00 100%);color:#1b1206;font-size:16px;font-weight:800;cursor:pointer;font-family:inherit;box-shadow:0 8px 18px -8px rgba(255,146,0,.75),inset 0 1px 0 rgba(255,255,255,.55)}' +
    '#ffmc .go[disabled]{opacity:.6;cursor:wait}' +
    '#ffmc .e{color:#dc2626;font-size:13px;min-height:18px;margin-top:6px}#ffmc .dk .e{color:#f87171}' +
    '#ffmc .lg{display:block;margin:4px auto 0;background:none;border:0;color:#6b7280;font-size:13px;text-decoration:underline;cursor:pointer}' +
    '#ffmc .nt{margin:8px 0 0;font-size:12px;color:#6b7280;text-align:center}#ffmc .dk .nt{color:#9ca3af}' +
    '#ffmc iframe{display:block;width:100%;border:0;background:#fff;transition:height .25s}' +
    '#ffmc .ld{padding:60px 0;text-align:center;color:#6b7280;font-size:14px}' +
    '#ffmc .pr{display:flex;align-items:center;gap:12px;padding:18px 18px 6px 52px}' +
    '#ffmc .pr img{width:56px;height:56px;border-radius:12px;object-fit:cover;flex-shrink:0}' +
    '#ffmc .pr b{display:block;font-size:15px;line-height:1.5}' +
    '#ffmc .op{padding:4px 18px 0}' +
    '#ffmc .ft{position:sticky;bottom:0;padding:12px 18px 16px;background:#fff;border-top:1px solid #94a3b833}#ffmc .dk .ft{background:#111827;box-shadow:0 -8px 16px rgba(0,0,0,.35)}' +
    '#ffmc .tt{display:flex;justify-content:space-between;align-items:center;font-size:15px;margin-bottom:10px}#ffmc .tt span:last-child{font-weight:700;color:#ffb21a;font-size:18px}' +
    '#ffmc .ft .r{margin-bottom:2px}' +
    '@media (max-width:640px){#ffmc{align-items:flex-end}#ffmc .cd{width:100%;border-radius:18px 18px 0 0;max-height:94vh}}';

  var closeMini = function () {
    var m = document.getElementById('ffmc');
    if (m && m.parentNode) m.parentNode.removeChild(m);
    document.documentElement.style.overflow = '';
  };

  /* modal shell: .stg holds our own steps, .fw holds Salla's checkout frame (never moved,
     moving an iframe reloads it) */
  var openShell = function (dark) {
    closeMini();
    var wrap = document.createElement('div');
    wrap.id = 'ffmc';
    wrap.innerHTML = '<style>' + mcss + '</style><div class="cd' + (dark ? ' dk' : '') + '"><button type="button" class="x" aria-label="إغلاق">×</button><div class="bd"><div class="stg"></div><div class="fw"></div></div></div>';
    document.body.appendChild(wrap);
    document.documentElement.style.overflow = 'hidden';
    var sh = { wrap: wrap, card: wrap.querySelector('.cd'), stage: wrap.querySelector('.stg'), fw: wrap.querySelector('.fw'), closable: 1 };
    wrap.querySelector('.x').addEventListener('click', function () { if (sh.closable) closeMini(); });
    wrap.addEventListener('click', function (e) { if (e.target === wrap && sh.closable) closeMini(); });
    return sh;
  };

  /* start loading Salla's mini checkout page in the background (after the currency is SAR) */
  var preload = function (sh) {
    if (sh.f || !document.getElementById('ffmc')) return;
    var f = document.createElement('iframe');
    f.setAttribute('allow', 'payment');
    /* Salla's widget CSS gives every iframe min-height:250px: keep ours fully hidden until it is ready */
    f.style.cssText = 'height:0px;min-height:0;visibility:hidden';
    sh.f = f;
    sh.loaded = 0;
    f.onload = function () {
      sh.loaded = 1;
      if (sh.onLoaded) { var cb = sh.onLoaded; sh.onLoaded = null; cb(); }
    };
    sh.fw.appendChild(f);
    f.src = '/_app/fast-checkout';
  };

  /* small help line under "إكمال الدفع" inside Salla's frame, using Salla's own classes */
  var ALT_STORE = 'https://fasterfollow.store';
  /* ===== backup gateway (RMZ): same cart total, paid on pay.rmz.gg without any login =====
     The "صفحة الدفع" product in the RMZ store costs 1 SAR, so quantity = amount. The order lands in RMZ
     with a note holding the Salla service, its options, the link and the phone. */
  var RMZ_API = 'https://embed.rmz.gg/api/embed';
  var RMZ_KEY = 'rmz_pk_2425_Myn6vC7pgZXLvJAIeJ59bLBr';
  var RMZ_PRODUCT = 18226;
  var rmzPost = function (path, body) {
    return fetch(RMZ_API + path, {
      method: 'POST',
      headers: { 'X-Embed-Key': RMZ_KEY, 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok || !j || j.success === false) throw new Error((j && (j.message || (j.error && j.error.message))) || 'تعذر الاتصال بالبوابة البديلة');
        return j.data || {};
      });
    });
  };
  var cartSummary = function (cart, g, x) {
    var NL = String.fromCharCode(10);
    var lines = ['جوال: +' + g.key + ' ' + g.phone];
    (cart.items || []).forEach(function (it) {
      lines.push((it.product_name || '') + ' × ' + (it.quantity || 1));
      (it.options || []).forEach(function (o) {
        var v = '';
        var sel = (o.details || []).filter(function (d) { return d.is_selected || d.selected; }).map(function (d) { return d.name; });
        if (sel.length) v = sel.join('، ');
        else if (typeof o.value === 'string' && o.value) v = o.value;
        if (v) lines.push('- ' + o.name + ': ' + v);
      });
    });
    if (x && x.id) lines.push('سلة: ' + x.id.slice(0, 12));
    return lines.join(NL).slice(0, 490);
  };
  /* short service lines for the success screen */
  var cartLines = function (cart) {
    return (cart.items || []).map(function (it) {
      var sel = '';
      (it.options || []).forEach(function (o) {
        var s = (o.details || []).filter(function (d) { return d.is_selected || d.selected; }).map(function (d) { return d.name; });
        if (!sel && s.length && o.type !== 'checkbox') sel = s.join('، ');
      });
      return (it.product_name || '') + (sel ? ' — ' + sel : '');
    }).join(' | ').slice(0, 300);
  };
  /* payments sent to RMZ and not confirmed yet (this device only) */
  var PEND_KEY = 'ffRmzPending';
  var loadPending = function () { try { return JSON.parse(localStorage.getItem(PEND_KEY) || '[]'); } catch (e) { return []; } };
  var writePending = function (list) { try { localStorage.setItem(PEND_KEY, JSON.stringify(list.slice(0, 5))); } catch (e) {} };
  var savePending = function (p) { writePending([p].concat(loadPending().filter(function (x) { return x.ck !== p.ck; }))); };
  var dropPending = function (ck) { writePending(loadPending().filter(function (x) { return x.ck !== ck; })); };
  var rmzStatus = function (ck) {
    return fetch(RMZ_API + '/payment/status/' + encodeURIComponent(ck), { headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (j) { return (j && j.data) || {}; });
  };
  var PAID_CSS =
    '#ffmc .ok{padding:28px 20px 22px;text-align:center}' +
    '#ffmc .ok .ic{width:64px;height:64px;margin:0 auto 12px;border-radius:50%;background:#dcfce7;color:#16a34a;display:flex;align-items:center;justify-content:center}' +
    '#ffmc .ok .ic svg{width:34px;height:34px}' +
    '#ffmc .ok h3{padding:0;margin:0 0 6px;font-size:19px}' +
    '#ffmc .ok .on{margin:14px 0 4px;font-size:13px;color:#6b7280}' +
    '#ffmc .ok .no{font-size:28px;font-weight:800;letter-spacing:.5px;direction:ltr}' +
    '#ffmc .ok .am{margin:6px 0 0;font-size:15px;font-weight:700}' +
    '#ffmc .ok .ln{margin:12px 0 0;padding:10px 12px;border-radius:12px;background:#f3f4f6;font-size:13px;color:#374151;line-height:1.7}' +
    '#ffmc .ok .sb{margin:12px 0 0}' +
    '#ffmc .wt{padding:26px 20px 20px;text-align:center}' +
    '#ffmc .wt .sp{width:38px;height:38px;margin:0 auto 14px;border:4px solid #fde68a;border-top-color:#f59e0b;border-radius:50%;animation:ffspin 1s linear infinite}' +
    '@keyframes ffspin{to{transform:rotate(360deg)}}' +
    '#ffmc .wt h3{padding:0;margin:0 0 6px}' +
    '#ffmc .wt a.lk2{display:block;margin-top:10px;font-size:13px;color:#6b7280;text-decoration:underline}' +
    '@media (prefers-reduced-motion:reduce){#ffmc .wt .sp{animation:none}}';
  var showPaid = function (sh, pend, orderId) {
    dropPending(pend.ck);
    /* the Salla cart still holds the item that was paid elsewhere */
    try { emptyCart(); } catch (e) {}
    if (sh.f) { sh.f.style.height = '0px'; sh.f.style.visibility = 'hidden'; }
    sh.card.className = 'cd';
    sh.closable = 1;
    sh.stage.innerHTML = '<style>' + PAID_CSS + '</style><div class="ok">' +
      '<div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>' +
      '<h3>تم الدفع بنجاح</h3><p class="sb">شكراً لك، استلمنا طلبك وبيبدأ التنفيذ قريباً.</p>' +
      '<p class="on">رقم طلبك</p><div class="no"></div><p class="am"></p><div class="ln"></div>' +
      '<p class="sb">احتفظ برقم الطلب، تحتاجه لو تواصلت معنا.</p>' +
      '<button type="button" class="go">تم</button></div>';
    sh.stage.querySelector('.no').textContent = orderId ? '#' + orderId : '—';
    sh.stage.querySelector('.am').innerHTML = Number(pend.amt || 0).toLocaleString('en-US') + ' <i class="sicon-sar"></i>';
    var ln = sh.stage.querySelector('.ln');
    if (pend.lines) ln.textContent = pend.lines; else ln.parentNode.removeChild(ln);
    sh.stage.querySelector('.go').addEventListener('click', closeMini);
    try { salla.event.createAndDispatch('ff::rmz-paid', { order_id: orderId, amount: pend.amt }); } catch (e) {}
  };
  var waitForRmz = function (sh, pend, tab) {
    sh.closable = 1;
    /* the payment tab was opened by this page, so it can be closed from here once the payment is confirmed */
    var closeTab = function () {
      try { if (tab && !tab.closed) tab.close(); } catch (e) {}
      try { window.focus(); } catch (e) {}
    };
    sh.stage.innerHTML = '<style>' + PAID_CSS + '</style><div class="wt"><div class="sp"></div>' +
      '<h3>أكمل الدفع في الصفحة اللي انفتحت</h3><p class="sb">أول ما يكتمل الدفع، بيظهر لك هنا تأكيد الطلب ورقمه.</p>' +
      '<a class="go" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;text-decoration:none">فتح صفحة الدفع مرة ثانية</a>' +
      '<a class="lk2" href="#">إلغاء</a></div>';
    sh.stage.querySelector('a.go').href = pend.url;
    var stop = 0, n = 0;
    sh.stage.querySelector('.lk2').addEventListener('click', function (e) { e.preventDefault(); stop = 1; closeTab(); closeMini(); });
    var tick = function () {
      if (stop || !document.getElementById('ffmc')) return;
      n++;
      rmzStatus(pend.ck).then(function (d) {
        if (stop) return;
        if (d.is_paid) { stop = 1; closeTab(); showPaid(sh, pend, d.order_id); return; }
        if (n < 600) setTimeout(tick, 3000);
      }).catch(function () { if (n < 600) setTimeout(tick, 5000); });
    };
    setTimeout(tick, 3000);
    /* the customer coming back to this tab: check right away */
    document.addEventListener('visibilitychange', function () { if (!document.hidden && !stop) { n = Math.max(0, n - 1); rmzStatus(pend.ck).then(function (d) { if (!stop && d.is_paid) { stop = 1; closeTab(); showPaid(sh, pend, d.order_id); } }).catch(function () {}); } });
  };
  /* any page: a payment finished on RMZ while the customer was away -> show the confirmation once */
  var checkPendingOnLoad = function () {
    var list = loadPending();
    if (!list.length) return;
    var fresh = list.filter(function (x) { return Date.now() - (x.t || 0) < 86400000; });
    if (fresh.length !== list.length) writePending(fresh);
    fresh.forEach(function (p, i) {
      setTimeout(function () {
        rmzStatus(p.ck).then(function (d) {
          if (!d.is_paid || document.getElementById('ffmc')) return;
          var sh = openShell(false);
          showPaid(sh, p, d.order_id);
        }).catch(function () {});
      }, 1200 + i * 400);
    });
  };

  var payViaRmz = function (sh) {
    var x = sh.x;
    var run = function (g) {
      if (sh.f) { sh.f.style.height = '0px'; sh.f.style.visibility = 'hidden'; }
      sh.card.className = 'cd';
      sh.stage.innerHTML = '<div class="ld">جاري تحويلك لبوابة الدفع البديلة…</div>';
      /* open the payment tab now, inside the tap (popup blockers allow it only here) */
      var tab = null;
      try {
        tab = window.open('', '_blank');
        if (tab) tab.document.write('<html dir="rtl"><body style="font-family:sans-serif;text-align:center;padding:60px 16px;color:#555">جاري فتح صفحة الدفع…</body></html>');
      } catch (e) {}
      var email = '';
      try { email = salla.config.get('user.email') || ''; } catch (e) {}
      if (!email) email = 'guest' + g.key + g.phone + '@fasterfollow.com';
      quiet(function () { return salla.api.cart.details(); }).then(function (r) {
        var cart = (r && r.data && r.data.cart) || {};
        var amount = Math.ceil(Number(cart.total) || 0);
        if (amount < 1) throw new Error('السلة فارغة، حدّث الصفحة وحاول مرة ثانية');
        return rmzPost('/guest/checkout', {
          product_id: RMZ_PRODUCT, quantity: amount,
          customer_first_name: g.first, customer_last_name: g.last,
          customer_email: email, customer_phone: "5" + String(Math.floor(1e7 + 9e7 * Math.random())), customer_country_code: "966", /* random Saudi number: RMZ never messages the real customer */
          /* guest checkouts store only customer_note (max 500); notice is ignored for guests */
          customer_note: cartSummary(cart, g, x)
        }).then(function (ck) { ck._lines = cartLines(cart); return ck; });
      }).then(function (ck) {
        if (ck.type !== 'payment_required' || !ck.checkout_url) throw new Error('تعذر تجهيز الدفع البديل');
        return rmzPost('/guest/payment/initiate', { checkout_url: ck.checkout_url, payment_method: 'card' })
          .then(function (p) { return { ck: ck, url: (p && p.redirect_url) || ck.payment_url }; });
      }).then(function (r) {
        var url = r.url;
        if (!url || url.indexOf('https://') !== 0) throw new Error('تعذر تجهيز الدفع البديل');
        var pend = { ck: r.ck.checkout_url, amt: Number(r.ck.amount) || 0, lines: r.ck._lines, url: url, t: Date.now() };
        savePending(pend);
        if (tab && !tab.closed) {
          tab.location.href = url;
          waitForRmz(sh, pend, tab);
        } else {
          /* popup blocked: same tab; the confirmation shows when the customer comes back */
          window.location.href = url;
        }
      }).catch(function (e) {
        try { if (tab && !tab.closed) tab.close(); } catch (er) {}
        sh.stage.innerHTML = '<div class="st"><h3>تعذر فتح البوابة البديلة</h3><p class="sb"></p>' +
          '<a class="go" style="display:flex;align-items:center;justify-content:center;text-decoration:none" href="' + ALT_STORE + '">اطلب من متجرنا البديل</a></div>';
        sh.stage.querySelector('.sb').textContent = (e && e.message) || 'حاول مرة ثانية بعد قليل';
      });
    };
    if (sh.g) { run(sh.g); return; }
    /* logged-in customers never gave a phone in our window: ask for it once */
    if (sh.f) { sh.f.style.height = '0px'; sh.f.style.visibility = 'hidden'; }
    sh.card.className = 'cd';
    sh.stage.innerHTML = '<div class="st"><h3>الدفع عبر بوابة بديلة</h3><p class="sb">اكتب رقم جوالك وكمّل الدفع بالبطاقة أو Apple Pay أو STC Pay</p>' +
      '<div class="ph-slot"></div><button type="button" class="go">متابعة للدفع</button><div class="e"></div></div>';
    var row = phoneRow();
    sh.stage.querySelector('.ph-slot').appendChild(row);
    sh.stage.querySelector('.go').addEventListener('click', function () {
      var g = row.read();
      if (typeof g === 'string') { sh.stage.querySelector('.e').textContent = g; return; }
      sh.g = g;
      run(g);
    });
  };

  /* small help line under "إكمال الدفع" inside Salla's frame, using Salla's own classes */
  var ALT_STORE = 'https://fasterfollow.store';
  /* big "alternative payment" button under Salla's mini checkout (v28) */
  var ALT_CSS =
    '#ffmc .alt{padding:14px 16px 18px;border-top:1px solid #eef0f3;background:#fafafa}' +
    '#ffmc .alt p{margin:0 0 8px;font-size:13px;color:#4b5563;text-align:center}' +
    '#ffmc .alt button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;width:100%;min-height:62px;padding:10px 12px;border:0;border-radius:14px;background:#111827;color:#fff;font-family:inherit;font-size:16px;font-weight:800;cursor:pointer;box-shadow:0 8px 18px -8px rgba(17,24,39,.6)}' +
    '#ffmc .alt button:active{transform:scale(.99)}' +
    '#ffmc .alt .bg{display:flex;gap:6px;align-items:center;justify-content:center}' +
    '#ffmc .alt .bg span{display:inline-flex;align-items:center;justify-content:center;height:22px;padding:0 7px;border-radius:5px;background:#fff;color:#111827;font-size:11px;font-weight:800;line-height:1;direction:ltr}' +
    '#ffmc .alt .bg .vi{color:#1a1f71;font-style:italic;letter-spacing:.5px}' +
    '#ffmc .alt .bg .ap{background:#000;color:#fff;box-shadow:0 0 0 1px #fff}' +
    '#ffmc .dk .alt{background:#0b1220;border-color:#1f2937}#ffmc .dk .alt p{color:#9ca3af}#ffmc .dk .alt button{background:#fff;color:#111827}#ffmc .dk .alt .bg span{box-shadow:0 0 0 1px #e5e7eb}';
  var MC_SVG = '<svg width="26" height="16" viewBox="0 0 26 16" aria-hidden="true"><circle cx="9" cy="8" r="7" fill="#eb001b"/><circle cx="17" cy="8" r="7" fill="#f79e1b"/><path d="M13 2.26A7 7 0 0 1 13 13.74A7 7 0 0 1 13 2.26Z" fill="#ff5f00"/></svg>';
  var addAlt = function (sh) {
    if (!sh.fw || sh.fw.querySelector('.alt')) return;
    var box = document.createElement('div');
    box.className = 'alt';
    box.innerHTML = '<style>' + ALT_CSS + '</style><p>البطاقة انرفضت أو الدفع ما كمل؟</p>' +
      '<button type="button"><span>ادفع ببوابة الدفع البديلة</span>' +
      '<span class="bg"><span class="vi">VISA</span><span>' + MC_SVG + '</span><span class="ap">Apple Pay</span></span></button>';
    box.querySelector('button').addEventListener('click', function () {
      if (box.parentNode) box.parentNode.removeChild(box);
      payViaRmz(sh);
    });
    sh.fw.appendChild(box);
  };
  var addHelp = function (f, sh) {
    addAlt(sh);
    var put = function () {
      try {
        var fd = f.contentWindow.document;
        if (fd.getElementById('ffhelp')) return;
        var col = fd.querySelector('.mini-checkout__header .flex.flex-col');
        if (!col) return;
        var p = fd.createElement('div');
        p.id = 'ffhelp';
        p.className = 'text-xs text-darker-100';
        p.style.marginTop = '2px';
        p.innerHTML = 'إذا انرفضت بطاقتك، <a class="underline text-red-50 cursor-pointer" href="#">ادفع ببوابة بديلة</a>';
        p.querySelector('a').addEventListener('click', function (e) {
          e.preventDefault();
          var b = sh.fw && sh.fw.querySelector('.alt');
          if (b && b.parentNode) b.parentNode.removeChild(b);
          payViaRmz(sh);
        });
        col.appendChild(p);
      } catch (e) {}
    };
    put();
    /* the frame re-renders on some steps: keep the line there while the window is open */
    var keep = setInterval(function () {
      if (!document.getElementById('ffmc') || !f.contentWindow) { clearInterval(keep); return; }
      put();
    }, 1000);
  };

  /* Salla's own mini checkout (the one logged-in customers get) for a prepared checkout */
  var showCheckout = function (sh, x) {
    sh.x = x;
    sh.card.className = 'cd';
    sh.stage.innerHTML = '<div class="ld">جاري تجهيز الدفع…</div>';
    preload(sh);
    var f = sh.f;
    var ready = 0;
    var fallback = setTimeout(function () { if (!ready) window.location.href = x.url; }, 20000);
    var dropLoader = function () { sh.stage.innerHTML = ''; };
    var onMsg = function (e) {
      if (!document.getElementById('ffmc')) { window.removeEventListener('message', onMsg); clearTimeout(fallback); return; }
      if (e.source !== f.contentWindow || e.origin !== location.origin) return;
      var d = e.data || {}, t = d.type, m = d.message;
      if (t === 'height') {
        if (ready) f.style.height = Math.max(250, Math.floor((m && m.height) || 0)) + 'px';
        else f.setAttribute('data-h', Math.max(250, Math.floor((m && m.height) || 0)));
      } else if (t === 'close') {
        closeMini();
      } else if (t === 'apple-pay-sheet') {
        sh.closable = !(m && m.open);
      } else if (t === 'redirect') {
        if (typeof m === 'string' && m.indexOf('http') === 0) window.location.href = m;
      } else if (t === 'login' || t === 'removeToken') {
        window.location.href = x.url;
      } else if (t === 'dispatchEvent' && m && m.name) {
        if (m.name === 'mini-checkout::initiated') {
          ready = 1; clearTimeout(fallback); dropLoader(); addHelp(f, sh);
          f.style.height = (f.getAttribute('data-h') || 560) + 'px';
          f.style.visibility = 'visible';
        }
        if (m.name === 'mini-checkout::init-failed') { window.location.href = x.url; return; }
        try { window.dispatchEvent(new CustomEvent(m.name, { bubbles: true, detail: m.payload })); } catch (er) {}
        var tn = TRACK[m.name];
        if (tn) {
          var pl = { checkout_type: 'mini_checkout' };
          var src = m.payload || {};
          for (var k in src) { if (Object.prototype.hasOwnProperty.call(src, k)) pl[k] = src[k]; }
          try { salla.event.createAndDispatch(m.name, pl); } catch (er) {}
          try { salla.analytics.track(tn, pl); } catch (er) {}
        }
      }
    };
    window.addEventListener('message', onMsg);
    var start = function () {
      var w = f.contentWindow;
      var n = 0;
      var patch = function () {
        n++;
        if (!w.salla || !w.salla.config || !w.salla.api || typeof w.salla.api.request !== 'function') {
          if (n < 300) setTimeout(patch, 30); else window.location.href = x.url;
          return;
        }
        try {
          var hs2 = w.document.createElement('style');
          hs2.textContent = '#ff01sup{display:none!important}';
          w.document.head.appendChild(hs2);
        } catch (er) {}
        addMada(w);
        /* the checkout is already prepared (and the guest's contact sent): let the mini checkout use it */
        w.salla.config.isGuest = function () { return false; };
        try { w.salla.api.setHeader('currency', 'SAR'); } catch (er) {}
        var orig = w.salla.api.request;
        w.salla.api.request = function (u) {
          if (typeof u === 'string' && (u === 'checkout/mini' || (u.indexOf('cart/') === 0 && u.indexOf('/status') > 0))) {
            return Promise.resolve({ data: { next_step: { to: 'checkout', url: x.url, id: x.id } } });
          }
          return orig.apply(this, arguments);
        };
        var colors = null;
        try { colors = salla.config.get('theme.color'); } catch (er) {}
        w.postMessage({ source: 'mini-checkout', type: 'init', data: {
          id: salla.config.get('store.id'), token: null, products: null, cartId: null,
          canMakePayments: canApplePay(), lang: document.documentElement.lang || 'ar',
          appUrl: location.origin + '/_app/fast-checkout', apiUrl: 'https://api.salla.dev/store/v1',
          colors: colors, config: {}, inline: false, formData: { id: 0 }, hasFormSelector: false
        } }, location.origin);
        w.postMessage({ source: 'mini-checkout', type: 'width', data: document.body.clientWidth }, location.origin);
      };
      patch();
    };
    if (sh.loaded) start(); else sh.onLoaded = start;
  };

  /* country + phone row (guests only) */
  var phoneRow = function () {
    var row = document.createElement('div');
    row.className = 'r';
    row.innerHTML = '<select class="cc"></select><input class="ph" type="tel" inputmode="numeric" placeholder="رقم الجوال" autocomplete="tel-national">';
    var sel = row.querySelector('.cc'), ph = row.querySelector('.ph');
    var lp = lastPhone();
    var uc = '';
    try { uc = String(salla.config.get('user.country_code') || '').toUpperCase(); } catch (e) {}
    if (lp) uc = lp[0];
    var list = COUNTRIES.split(';');
    for (var ci = 0; ci < list.length; ci++) {
      var c = list[ci].split('|');
      var o = document.createElement('option');
      o.value = c[0] + '|' + c[1];
      o.textContent = flag(c[0]) + ' +' + c[1] + '  ' + c[2];
      if (c[0] === uc) o.selected = true;
      sel.appendChild(o);
    }
    if (lp && lp[2]) ph.value = lp[2];
    /* returns guest data or an error string */
    row.read = function () {
      var parts = sel.value.split('|');
      var phone = digits(ph.value);
      while (phone.charAt(0) === '0') phone = phone.slice(1);
      var maxLen = RULES[parts[0]] ? RULES[parts[0]][0] : 9;
      if (phone.indexOf(parts[1]) === 0 && phone.length > maxLen) phone = phone.slice(parts[1].length);
      if (!phoneOk(parts[0], phone)) return 'رقم الجوال لا يطابق رمز الدولة المختار';
      var g = { first: GUEST_FIRST, last: GUEST_LAST, phone: phone, cc: parts[0], key: parts[1] };
      savePhone(g);
      return g;
    };
    row.ph = ph;
    return row;
  };

  var sarNote = function () {
    return curCode() === 'SAR' ? '' : '<p class="nt">الدفع يتم بالريال السعودي</p>';
  };

  /* product page, guest: phone step -> mini checkout. form = the page's product form */
  var openGuestBuy = function (form) {
    var sh = openShell(false);
    var warm = prepCheckout(form, function () { preload(sh); });
    warm.catch(function () {});
    sh.stage.innerHTML =
      '<div class="st"><h3>إكمال الطلب</h3><p class="sb">اكتب رقم جوالك وكمّل الدفع هنا مباشرة، بدون تسجيل</p>' +
      '<div class="ph-slot"></div><button type="button" class="go">متابعة للدفع</button><div class="e"></div>' + sarNote() +
      '<button type="button" class="lg">عندك حساب؟ سجّل دخول</button></div>';
    var row = phoneRow();
    sh.stage.querySelector('.ph-slot').appendChild(row);
    var go = sh.stage.querySelector('.go'), err = sh.stage.querySelector('.e');
    setTimeout(function () { try { if (!row.ph.value) row.ph.focus(); } catch (e) {} }, 50);
    var submit = function () {
      var g = row.read();
      if (typeof g === 'string') { err.textContent = g; return; }
      err.textContent = '';
      go.disabled = true;
      go.textContent = 'لحظات…';
      warm.catch(function () { return prepCheckout(form, function () { preload(sh); }); })
        .then(function (ck) { sh.g = g; return sendContact(ck, g); })
        .then(function (x) { showCheckout(sh, x); })
        .catch(function (e) {
          warm = Promise.reject(e); warm.catch(function () {});
          go.disabled = false;
          go.textContent = 'متابعة للدفع';
          err.textContent = (e && e.message) || 'تعذر المتابعة';
        });
    };
    go.addEventListener('click', submit);
    row.ph.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
    sh.stage.querySelector('.lg').addEventListener('click', function () {
      closeMini();
      try { salla.event.dispatch('login::open'); } catch (e) {}
    });
  };

  var guestBuyFromPage = function () {
    var form = document.querySelector('form.product-form');
    if (!form || !window.salla || !salla.cart) return;
    if (form.reportValidity && !form.reportValidity()) return;
    if (document.getElementById('ffmc')) return;
    openGuestBuy(form);
  };

  /* "Buy now" widget on the product page */
  window.addEventListener('mini-checkout::before-init', function (ev) {
    if (!isGuest()) return;
    ev.preventDefault();
    ev.stopImmediatePropagation();
    guestBuyFromPage();
  });

  /* "Buy now" / Apple Pay login prompt for guests is hooked in the inline core; it calls this */
  window.__ffgBuy = guestBuyFromPage;

  /* ===== payment links: https://fasterfollow.com/-/p<PAY_ID>?pay=<code>&n=<note> =====
     The "رابط دفع" product carries the amount: quantity = amount / product price (1 SAR -> any whole amount).
     The code hides the amount from casual editing (check the order total anyway). */
  var PAY_ID = '897417910';
  var payDecode = function (code) {
    code = String(code || '').toLowerCase();
    if (code.length < 4) return 0;
    var body = code.slice(0, -2), ck = code.slice(-2);
    var n = parseInt(body, 36);
    if (!(n > 1000003) || (n - 1000003) % 7) return 0;
    var a = (n - 1000003) / 7;
    var s = 0;
    for (var i = 0; i < body.length; i++) s = (s * 31 + body.charCodeAt(i)) % 1296;
    s = (s + a) % 1296;
    var c = s.toString(36);
    if (c.length < 2) c = '0' + c;
    return c === ck ? a : 0;
  };
  var payParam = function (k) {
    var q = location.search.slice(1).split('&');
    for (var i = 0; i < q.length; i++) {
      var kv = q[i].split('=');
      if (kv[0] === k) { try { return decodeURIComponent((kv[1] || '').split('+').join(' ')); } catch (e) { return kv[1] || ''; } }
    }
    return '';
  };
  var PAY_CSS =
    '#ffmc.ffpay{background:#0b1220}#ffmc.ffpay .x{display:none}' +
    '#ffmc .pz{padding:26px 20px 20px;text-align:center}' +
    '#ffmc .pz .lb{font-size:13px;color:#6b7280;margin:0 0 6px}' +
    '#ffmc .pz .am{font-size:34px;font-weight:800;color:#111827;margin:0 0 4px;direction:rtl}' +
    '#ffmc .pz .am i{font-size:26px}' +
    '#ffmc .pz .nn{display:inline-block;margin:6px 0 2px;padding:6px 12px;border-radius:999px;background:#f3f4f6;color:#374151;font-size:13px}' +
    '#ffmc .pz .sn{font-size:15px;font-weight:700;margin:0 0 14px}' +
    '#ffmc .pz .r{margin-top:16px;text-align:right}' +
    '#ffmc .pz .sc{margin:12px 0 0;font-size:12px;color:#9ca3af}' +
    '#ffmc .pz .lo{display:block;width:64px;height:64px;margin:0 auto 8px;border-radius:16px;object-fit:contain;background:#f9fafb}' +
    '@media (max-width:640px){#ffmc.ffpay{align-items:center;padding:16px;box-sizing:border-box}#ffmc.ffpay .cd{border-radius:18px;max-height:calc(100vh - 32px)}}';

  var openPayLink = function () {
    var code = payParam('pay');
    if (!code || location.pathname.slice(-(PAY_ID.length + 1)) !== 'p' + PAY_ID) return false;
    var amount = payDecode(code);
    var note = payParam('n').slice(0, 80);
    var sh = openShell(false);
    sh.wrap.className = 'ffpay';
    sh.closable = 0;
    var st = document.createElement('style');
    st.textContent = PAY_CSS;
    sh.wrap.appendChild(st);
    var storeName = '';
    try { storeName = String(salla.config.get('store.name') || '').split('|')[0].trim(); } catch (e) {}
    if (!amount) {
      sh.stage.innerHTML = '<div class="pz"><p class="sn">رابط الدفع غير صحيح</p><p class="lb">تواصل مع المتجر لإرسال رابط جديد</p></div>';
      return true;
    }
    sh.stage.innerHTML =
      '<div class="pz"><img class="lo" alt=""><p class="sn"></p><p class="lb">المبلغ المطلوب</p><div class="am"></div><div class="nt-slot"></div>' +
      '<div class="ph-slot"></div><button type="button" class="go">ادفع الآن</button><div class="e"></div>' +
      '<p class="sc">دفع آمن عبر سلة</p></div>';
    sh.stage.querySelector('.sn').textContent = storeName;
    var logo = '';
    try { logo = salla.config.get('store.logo') || ''; } catch (e) {}
    var lo = sh.stage.querySelector('.lo');
    if (logo) lo.src = logo; else lo.parentNode.removeChild(lo);
    /* always SAR (the page may still show another currency) */
    sh.stage.querySelector('.am').innerHTML = '<span>' + Number(amount).toLocaleString('en-US') + '</span> <i class="sicon-sar"></i>';
    if (note) {
      var nn = document.createElement('div');
      nn.className = 'nn';
      nn.textContent = note;
      sh.stage.querySelector('.nt-slot').appendChild(nn);
    }
    var row = null;
    if (isGuest()) {
      row = phoneRow();
      sh.stage.querySelector('.ph-slot').appendChild(row);
    }
    var go = sh.stage.querySelector('.go'), err = sh.stage.querySelector('.e');
    go.disabled = true;
    var form = document.createElement('form');
    form.innerHTML = '<input type="hidden" name="id" value="' + Number(PAY_ID) + '"><input type="hidden" name="quantity" value="1">';
    /* SAR first, then the product's unit price decides the quantity; the order is prepared right away */
    var warm = ensureSAR().then(function () {
      preload(sh);
      return quiet(function () { return salla.api.product.getDetails(PAY_ID); });
    }).then(function (r) {
      var unit = Number(r && r.data && r.data.price) || 0;
      var qn = unit ? Math.round(amount / unit * 1000) / 1000 : 0;
      if (!unit || qn !== Math.round(qn) || qn < 1) throw new Error('المبلغ لا يتوافق مع إعدادات الدفع، تواصل مع المتجر');
      var mx = Number(r.data.max_quantity) || 0;
      if (mx > 0 && qn > mx) throw new Error('المبلغ أكبر من الحد المسموح للرابط، تواصل مع المتجر');
      form.querySelector('[name=quantity]').value = String(qn);
      go.disabled = false;
      return prepCheckout(form);
    });
    warm.catch(function (e) { go.disabled = false; err.textContent = (e && e.message) || 'تعذر تجهيز الدفع'; });
    var submit = function () {
      var g = null;
      if (row) {
        g = row.read();
        if (typeof g === 'string') { err.textContent = g; return; }
      }
      err.textContent = '';
      go.disabled = true;
      go.textContent = 'لحظات…';
      warm.catch(function () { return prepCheckout(form); })
        .then(function (ck) { sh.g = g; return sendContact(ck, g); })
        .then(function (x) { showCheckout(sh, x); })
        .catch(function (e) {
          warm = Promise.reject(e); warm.catch(function () {});
          go.disabled = false;
          go.textContent = 'ادفع الآن';
          err.textContent = (e && e.message) || 'تعذر المتابعة';
        });
    };
    go.addEventListener('click', submit);
    if (row) row.ph.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
    return true;
  };
  var startPay = function () {
    var t = 0;
    var w = setInterval(function () {
      t++;
      if (window.salla && salla.api && salla.api.cart && salla.api.product && salla.config) {
        clearInterval(w);
        try { openPayLink(); } catch (e) {}
      } else if (t > 200) clearInterval(w);
    }, 50);
  };
  if (location.search.indexOf('pay=') > -1) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startPay);
    else startPay();
  }

  /* ===== link generator: any page whose content has the marker [ff-paylinks] ===== */
  var PL_MARK = '[ff-paylinks]';
  var PL_CSS =
    '#ffpl{--p:#121a2b;--p2:#18223a;--ln:#26324d;--fg:#eef1f7;--mu:#9aa6bf;--g:#ffb21a;--g2:#ff8a00;direction:rtl;text-align:right;max-width:560px;margin:8px auto;display:flex;flex-direction:column;gap:14px;color:var(--fg);font-family:inherit}' +
    '#ffpl *{box-sizing:border-box}' +
    '#ffpl .cdx{background:var(--p);border:1px solid var(--ln);border-radius:18px;padding:18px;display:flex;flex-direction:column;gap:12px}' +
    '#ffpl label{font-size:13px;color:var(--mu)}' +
    '#ffpl .am{display:flex;align-items:center;gap:10px;background:var(--p2);border:1px solid var(--ln);border-radius:14px;padding:4px 14px}' +
    '#ffpl .am:focus-within{border-color:var(--g)}' +
    '#ffpl .am input{flex:1;min-width:0;height:auto!important;border:0!important;background:transparent!important;color:var(--fg)!important;font-weight:800!important;font-size:34px!important;line-height:1.3!important;padding:4px 0!important;direction:ltr;text-align:right;outline:none;box-shadow:none!important}' +
    '#ffpl .am span{color:var(--mu);font-size:17px}' +
    '#ffpl .chips{display:flex;flex-wrap:wrap;gap:8px}' +
    '#ffpl .chip{border:1px solid var(--ln);background:transparent;color:var(--fg);border-radius:999px;padding:5px 14px;font-size:14px;cursor:pointer;font-family:inherit}' +
    '#ffpl .chip:hover{border-color:var(--g);color:var(--g)}' +
    '#ffpl .nt{width:100%;border:1px solid var(--ln);background:var(--p2);color:var(--fg);border-radius:12px;padding:12px 14px;font-size:15px;font-family:inherit}' +
    '#ffpl .nt:focus{border-color:var(--g);outline:none}' +
    '#ffpl .ms{font-size:13px;min-height:18px;margin:0;color:#f87171}#ffpl .ms.ok{color:#34d399}' +
    '#ffpl .sm{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap}#ffpl .sm b{font-size:20px}#ffpl .sm span{color:var(--mu);font-size:13px}' +
    '#ffpl .lk{background:var(--p2);border:1px dashed var(--ln);border-radius:12px;padding:12px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;direction:ltr;text-align:left;word-break:break-all;user-select:all}' +
    '#ffpl .ac{display:grid;grid-template-columns:1fr 1fr;gap:10px}' +
    '#ffpl .bt{display:flex;align-items:center;justify-content:center;gap:8px;height:46px;border-radius:12px;border:1px solid var(--ln);background:var(--p2);color:var(--fg);font-size:14.5px;font-weight:700;cursor:pointer;text-decoration:none;font-family:inherit}' +
    '#ffpl .bt:hover{border-color:var(--g);color:var(--fg)}' +
    '#ffpl .bt.pr{grid-column:1/-1;border:0;color:#1b1206;background:linear-gradient(135deg,#ffd76a,var(--g) 48%,var(--g2))}' +
    '#ffpl .bt.wd{grid-column:1/-1}' +
    '#ffpl .bt[disabled]{opacity:.45;cursor:not-allowed}' +
    '#ffpl h3{font-size:17px;margin:4px 0 0;color:var(--fg)}' +
    '#ffpl .it{display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--p);border:1px solid var(--ln);border-radius:14px;padding:10px 14px}' +
    '#ffpl .it div{min-width:0}#ffpl .it b{display:block}#ffpl .it small{display:block;color:var(--mu);font-size:12.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '#ffpl .mi{height:34px;padding:0 12px;border-radius:10px;border:1px solid var(--ln);background:transparent;color:var(--fg);font-size:13px;cursor:pointer;font-family:inherit;flex-shrink:0}' +
    '#ffpl .mi:hover{border-color:var(--g);color:var(--g)}' +
    '#ffpl .em{color:var(--mu);font-size:13.5px;margin:0;padding:14px;border:1px dashed var(--ln);border-radius:14px;text-align:center}' +
    '#ffpl .hn{font-size:12.5px;color:var(--mu);margin:0}' +
    '#ffpl .ck{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--mu);cursor:pointer}#ffpl .ck input{width:18px;height:18px;accent-color:var(--g);margin:0}';

  var payEncode = function (a) {
    var n = a * 7 + 1000003;
    var body = n.toString(36);
    var s = 0;
    for (var i = 0; i < body.length; i++) s = (s * 31 + body.charCodeAt(i)) % 1296;
    s = (s + a) % 1296;
    var c = s.toString(36);
    if (c.length < 2) c = '0' + c;
    return body + c;
  };

  var mountPayLinks = function (holder) {
    var BASE = 'https://fasterfollow.com/-/p' + PAY_ID;
    var MIN = 5;
    var box = document.createElement('div');
    box.id = 'ffpl';
    box.innerHTML = '<style>' + PL_CSS + '</style>' +
      '<div class="cdx"><label for="ffpl-a">المبلغ بالريال السعودي</label>' +
        '<div class="am"><input id="ffpl-a" inputmode="numeric" autocomplete="off" value="150"><span>ر.س</span></div>' +
        '<div class="chips"><button type="button" class="chip" data-v="50">50</button><button type="button" class="chip" data-v="100">100</button><button type="button" class="chip" data-v="250">250</button><button type="button" class="chip" data-v="500">500</button></div>' +
        '<p class="ms" id="ffpl-m"></p>' +
        '<label for="ffpl-n">وصف يظهر للعميل (اختياري)</label>' +
        '<input id="ffpl-n" class="nt" maxlength="80" placeholder="مثال: طلب رقم 1052">' +
        '<label class="ck"><input type="checkbox" id="ffpl-x"> إظهار الوصف في صفحة الدفع أيضاً (يطوّل الرابط)</label>' +
      '</div>' +
      '<div class="cdx"><div class="sm"><b id="ffpl-s"></b><span id="ffpl-d"></span></div>' +
        '<div class="lk" id="ffpl-l"></div>' +
        '<div class="ac"><button type="button" class="bt pr" id="ffpl-c">نسخ الرابط</button>' +
          '<button type="button" class="bt" id="ffpl-t">نسخ رسالة</button>' +
          '<a class="bt" id="ffpl-w" href="#" target="_blank" rel="noopener">واتساب</a>' +
          '<a class="bt wd" id="ffpl-o" href="#" target="_blank" rel="noopener">فتح الرابط كما يراه العميل</a></div>' +
        '<p class="ms ok" id="ffpl-k"></p>' +
        '<p class="hn">الرابط يحوّل العميل للريال تلقائياً. طابق مبلغ الطلب في سلة مع المبلغ اللي أرسلته قبل التنفيذ.</p>' +
      '</div>' +
      '<h3>آخر الروابط</h3><div id="ffpl-r" style="display:flex;flex-direction:column;gap:8px"></div>';
    holder.parentNode.replaceChild(box, holder);
    var $ = function (id) { return document.getElementById(id); };
    var aEl = $('ffpl-a'), nEl = $('ffpl-n'), lEl = $('ffpl-l'), mEl = $('ffpl-m'), kEl = $('ffpl-k');
    var max = 0, cur = null;
    var fmt = function (a) { return Number(a).toLocaleString('en-US') + ' ر.س'; };
    var toLatin = function (s) {
      var out = '', ar = '٠١٢٣٤٥٦٧٨٩';
      String(s || '').split('').forEach(function (ch) {
        var i = ar.indexOf(ch);
        if (i > -1) out += i; else if ('0123456789'.indexOf(ch) > -1) out += ch;
      });
      return out;
    };
    var build = function () {
      var a = parseInt(toLatin(aEl.value), 10) || 0;
      var note = nEl.value.trim();
      var bad = '';
      if (!a) bad = 'اكتب المبلغ بالأرقام.';
      else if (a < MIN) bad = 'أقل مبلغ ' + MIN + ' ر.س (الحد الأدنى للطلب في سلة).';
      else if (max && a > max) bad = 'أعلى مبلغ حالياً ' + max + ' ر.س. ارفع «أقصى كمية للطلب» في منتج رابط دفع للمبالغ الأكبر.';
      mEl.textContent = bad;
      $('ffpl-c').disabled = !!bad;
      $('ffpl-t').disabled = !!bad;
      if (bad) {
        cur = null; lEl.textContent = '—'; $('ffpl-s').textContent = '—';
        $('ffpl-w').removeAttribute('href'); $('ffpl-o').removeAttribute('href');
        return;
      }
      /* the description goes in the message; it is added to the link only on request (Arabic makes links long) */
      var url = BASE + '?pay=' + payEncode(a) + (note && $('ffpl-x').checked ? '&n=' + encodeURIComponent(note) : '');
      var NL = String.fromCharCode(10);
      var text = 'مرحباً،' + NL + 'هذا رابط الدفع ' + (note ? 'لـ ' + note + ' ' : '') + 'بمبلغ ' + fmt(a) + ' من فاستر فولو:' + NL + url + NL + 'الدفع مباشر وآمن عبر سلة، بدون تسجيل.';
      cur = { a: a, note: note, url: url, text: text };
      lEl.textContent = url;
      $('ffpl-s').textContent = fmt(a);
      $('ffpl-d').textContent = note || 'بدون وصف';
      $('ffpl-w').href = 'https://wa.me/?text=' + encodeURIComponent(text);
      $('ffpl-o').href = url;
    };
    var copy = function (text, done) {
      var ok = function () { kEl.textContent = done; };
      var fb = function () {
        try {
          var r = document.createRange(); r.selectNodeContents(lEl);
          var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
          document.execCommand('copy');
          kEl.textContent = done;
        } catch (e) { kEl.textContent = 'حدّدت الرابط، انسخه يدوياً.'; }
      };
      try { navigator.clipboard.writeText(text).then(ok, fb); } catch (e) { fb(); }
    };
    var KEY = 'ffPayLinks';
    var load = function () { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } };
    var render = function () {
      var r = $('ffpl-r'); r.innerHTML = '';
      var list = load();
      if (!list.length) {
        var p = document.createElement('p'); p.className = 'em';
        p.textContent = 'الروابط اللي تنسخها أو ترسلها تنحفظ هنا في هذا الجهاز.';
        r.appendChild(p); return;
      }
      list.forEach(function (x) {
        var it = document.createElement('div'); it.className = 'it';
        var t = document.createElement('div');
        var b = document.createElement('b'); b.textContent = fmt(x.a);
        var s = document.createElement('small'); s.textContent = (x.note || 'بدون وصف') + ' · ' + new Date(x.t).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });
        t.appendChild(b); t.appendChild(s);
        var c = document.createElement('button'); c.type = 'button'; c.className = 'mi'; c.textContent = 'نسخ';
        c.addEventListener('click', function () { copy(x.url, 'نسخت رابط ' + fmt(x.a) + '.'); });
        it.appendChild(t); it.appendChild(c);
        r.appendChild(it);
      });
    };
    var remember = function () {
      if (!cur) return;
      var list = load().filter(function (x) { return x.url !== cur.url; });
      list.unshift({ a: cur.a, note: cur.note, url: cur.url, t: Date.now() });
      try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, 20))); } catch (e) {}
      render();
    };
    aEl.addEventListener('input', build);
    nEl.addEventListener('input', build);
    $('ffpl-x').addEventListener('change', build);
    var chips = box.querySelectorAll('.chip');
    for (var i = 0; i < chips.length; i++) {
      chips[i].addEventListener('click', function () { aEl.value = this.getAttribute('data-v'); build(); });
    }
    $('ffpl-c').addEventListener('click', function () { if (cur) { copy(cur.url, 'نسخت الرابط، أرسله للعميل.'); remember(); } });
    $('ffpl-t').addEventListener('click', function () { if (cur) { copy(cur.text, 'نسخت الرسالة مع الرابط.'); remember(); } });
    $('ffpl-w').addEventListener('click', function (e) { if (!cur) { e.preventDefault(); return; } remember(); });
    build();
    render();
    /* the real limit = the product's max quantity (1 SAR each) */
    try {
      quiet(function () { return salla.api.product.getDetails(PAY_ID); }).then(function (r) {
        max = Number(r && r.data && r.data.max_quantity) || 0;
        build();
      }).catch(function () {});
    } catch (e) {}
  };

  var findMarker = function () {
    if (!document.body || document.getElementById('ffpl')) return null;
    if ((document.body.textContent || '').indexOf(PL_MARK) === -1) return null;
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var n;
    while ((n = w.nextNode())) {
      if (n.nodeValue && n.nodeValue.indexOf(PL_MARK) > -1) {
        var el = n.parentNode;
        if (el && el.tagName === 'SCRIPT') continue;
        return el;
      }
    }
    return null;
  };
  var startPL = function () {
    var t = 0;
    var w = setInterval(function () {
      t++;
      var el = findMarker();
      if (el && window.salla && salla.api && salla.api.product) {
        clearInterval(w);
        try { mountPayLinks(el); } catch (e) {}
      } else if (t > 60) clearInterval(w);
    }, 250);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startPL);
  else startPL();

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', checkPendingOnLoad);
  else checkPendingOnLoad();

  /* ===== category pages: "شراء سريع" on every product card ===== */
  var QB_CSS = '.ffqb{position:relative;overflow:hidden;isolation:isolate;display:flex;align-items:center;justify-content:center;gap:7px;width:100%;height:42px;margin-top:8px;padding:0 12px;border:1.5px solid transparent;border-radius:12px;background:linear-gradient(180deg,#1c2433,#121826) padding-box,linear-gradient(135deg,#ffe08a,#ffb21a 45%,#ff7a00) border-box;color:#ffc53d;font-size:14px;font-weight:800;letter-spacing:.2px;cursor:pointer;font-family:inherit;box-shadow:0 6px 18px -8px rgba(255,170,0,.55),inset 0 1px 0 rgba(255,255,255,.06);transition:transform .15s ease,box-shadow .15s ease}' +
    '.ffqb:hover{transform:translateY(-1px);box-shadow:0 10px 24px -8px rgba(255,170,0,.8),inset 0 1px 0 rgba(255,255,255,.08)}' +
    '.ffqb:active{transform:translateY(0) scale(.98)}' +
    '.ffqb span{position:relative;z-index:1;background:linear-gradient(90deg,#ffe08a,#ffb21a);-webkit-background-clip:text;background-clip:text;color:transparent}' +
    '.ffqb svg{position:relative;z-index:1;width:16px;height:16px;flex-shrink:0;color:#ffb21a;filter:drop-shadow(0 0 6px rgba(255,178,26,.6))}' +
    '.ffqb::after{content:"";position:absolute;top:0;bottom:0;left:-60%;width:40%;background:linear-gradient(100deg,rgba(255,214,102,0),rgba(255,214,102,.22),rgba(255,214,102,0));transform:skewX(-20deg);animation:ffqbShine 3.4s ease-in-out infinite;pointer-events:none}' +
    '@keyframes ffqbShine{0%,62%{left:-60%}100%{left:130%}}' +
    '.ffqb[disabled]{cursor:wait;opacity:.75}.ffqb[disabled]::after{animation-duration:.9s}' +
    '@media (prefers-reduced-motion:reduce){.ffqb::after{animation:none}.ffqb{transition:none}}';


  var openQuickBuy = function (pid, btn) {
    if (document.getElementById('ffmc')) return;
    if (btn) btn.disabled = true;
    var conv = curCode() !== 'SAR';
    /* switch to SAR first, so the prices in the sheet are the ones that will be charged */
    ensureSAR().then(function () {
      return quiet(function () { return salla.api.product.getDetails(pid, ['options']); });
    }).then(function (r) {
      if (btn) btn.disabled = false;
      var p = (r && r.data) || {};
      var guest = isGuest();
      var sh = openShell(true);
      preload(sh);
      var img = (p.image && (p.image.url || p.image)) || '';
      sh.stage.innerHTML =
        '<div class="pr">' + (typeof img === 'string' && img ? '<img alt="">' : '') + '<div><b class="nm"></b></div></div>' +
        '<form class="op ffq-form" onsubmit="return false"><input type="hidden" name="id" value="' + Number(pid) + '"><input type="hidden" name="quantity" value="1"></form>' +
        '<div class="ft"><div class="tt"><span>الإجمالي</span><span class="tp"></span></div>' +
        '<div class="ph-slot"></div><button type="button" class="go">ادفع الآن</button><div class="e"></div>' + (conv ? '<p class="nt">الأسعار والدفع بالريال السعودي</p>' : '') + '</div>';
      sh.stage.querySelector('.nm').textContent = p.name || '';
      var im = sh.stage.querySelector('.pr img');
      if (im) im.src = img;
      var form = sh.stage.querySelector('form');
      if (p.options && p.options.length) {
        var po = document.createElement('salla-product-options');
        po.setAttribute('product-id', String(pid));
        po.setAttribute('options', JSON.stringify(p.options));
        po.setAttribute('config', JSON.stringify({ 'single-option': { type: 'button' }, 'multiple-option': { type: 'button' } }));
        form.appendChild(po);
      }
      var tp = sh.stage.querySelector('.tp');
      var setPrice = function (v) { try { tp.innerHTML = salla.money(v); } catch (e) { tp.textContent = v; } };
      setPrice(p.price || 0);
      /* build the order in the background once the form is complete; reused at "pay" if unchanged */
      var sig = function () {
        var a = [];
        new FormData(form).forEach(function (v, k) { a.push(k + '=' + v); });
        return a.join('&');
      };
      var warm = null, warmSig = '', warmRes = null;
      var tryWarm = function () {
        if (!form.checkValidity || !form.checkValidity()) return;
        var s = sig();
        if (s === warmSig) return;
        warmSig = s;
        warmRes = null;
        var pr = (warm ? warm.catch(function () {}) : Promise.resolve()).then(function () {
          return prepCheckout(form, function () { preload(sh); });
        });
        warm = pr;
        pr.then(function (res) { if (warm === pr && warmSig === s) warmRes = res; }).catch(function () {});
      };
      var pt = null, wt = null;
      var refresh = function () {
        clearTimeout(pt);
        pt = setTimeout(function () {
          quiet(function () { return salla.api.product.getPrice(new FormData(form)); })
            .then(function (x) { if (x && x.data && x.data.price != null) setPrice(x.data.price); })
            .catch(function () {});
        }, 250);
        clearTimeout(wt);
        wt = setTimeout(tryWarm, 700);
      };
      form.addEventListener('change', refresh);
      form.addEventListener('input', refresh);
      var row = null;
      if (guest) {
        row = phoneRow();
        sh.stage.querySelector('.ph-slot').appendChild(row);
      }
      var go = sh.stage.querySelector('.go'), err = sh.stage.querySelector('.e');
      go.addEventListener('click', function () {
        if (form.reportValidity && !form.reportValidity()) { err.textContent = 'اختر العدد واكتب الرابط أولاً'; return; }
        var g = null;
        if (row) {
          g = row.read();
          if (typeof g === 'string') { err.textContent = g; return; }
        }
        err.textContent = '';
        go.disabled = true;
        go.textContent = 'لحظات…';
        clearTimeout(wt);
        var s = sig();
        (warm ? warm.catch(function () {}) : Promise.resolve())
          .then(function () {
            if (warmRes && warmSig === s) return warmRes;
            warmSig = s;
            return prepCheckout(form, function () { preload(sh); });
          })
          .then(function (ck) { sh.g = g; return sendContact(ck, g); })
          .then(function (x) { showCheckout(sh, x); })
          .catch(function (e) {
            go.disabled = false;
            go.textContent = 'ادفع الآن';
            err.textContent = (e && e.message) || 'تعذر المتابعة';
          });
      });
    }).catch(function () {
      if (btn) btn.disabled = false;
      try { salla.notify.error('تعذر فتح الخدمة، حاول مرة ثانية'); } catch (e) {}
    });
  };

  /* ===== "تفاصيل الخدمة": a short summary pulled from the product description ===== */
  var DT_CSS =
    '.ffdt{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;margin-top:8px;padding:7px 10px;border-radius:10px;border:1px solid rgba(148,163,184,.35);background:transparent;color:inherit;font:inherit;font-size:13px;font-weight:600;cursor:pointer;opacity:.85;transition:opacity .15s,border-color .15s}' +
    '.ffdt:hover{opacity:1;border-color:rgba(255,178,26,.7)}.ffdt svg{width:15px;height:15px;flex-shrink:0;color:#ffb21a}.ffdt[disabled]{cursor:wait;opacity:.6}' +
    '#ffmc .ffd{padding:20px 18px 18px}' +
    '#ffmc .ffd h3{margin:0 0 14px;font-size:16px;font-weight:700;line-height:1.5;padding-left:44px}' +
    '#ffmc .ffd .cp{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}' +
    '#ffmc .ffd .cp div{flex:1 1 140px;display:flex;gap:8px;align-items:flex-start;padding:10px;border-radius:12px;background:rgba(255,178,26,.08);border:1px solid rgba(255,178,26,.25);font-size:13px;line-height:1.55}' +
    '#ffmc .ffd .cp b{display:block;font-size:11px;color:#ffb21a;font-weight:700}' +
    '#ffmc .ffd .cp i{font-style:normal;font-size:16px;line-height:1.2}' +
    '#ffmc .ffd ul{list-style:none;margin:0;padding:0}' +
    '#ffmc .ffd li{position:relative;padding:7px 24px 7px 0;font-size:14px;line-height:1.6;border-bottom:1px solid rgba(148,163,184,.15)}#ffmc .ffd li:last-child{border-bottom:0}' +
    '#ffmc .ffd li::before{content:"";position:absolute;right:2px;top:13px;width:12px;height:7px;border:solid #22c55e;border-width:0 0 2px 2px;transform:rotate(-45deg)}' +
    '#ffmc .ffd .ac{display:flex;gap:8px;margin-top:16px}#ffmc .ffd .ac>*{flex:1}' +
    '#ffmc .ffd .lk{display:flex;align-items:center;justify-content:center;padding:11px;border-radius:12px;border:1px solid rgba(148,163,184,.35);color:inherit;text-decoration:none;font-size:14px;font-weight:600}' +
    '#ffmc .ffd .ffqb{margin-top:0}';

  var clip = function (t, n) {
    t = String(t || '').replace(WS, ' ').trim();
    if (t.length <= n) return t;
    var c = t.slice(0, n), sp = c.lastIndexOf(' ');
    return (sp > n * 0.6 ? c.slice(0, sp) : c) + '…';
  };
  var WS = new RegExp('[ ' + String.fromCharCode(9, 10, 13, 160) + ']+', 'g');
  var BUL = ['✓', '✔', '•', '🔹', '🔸', '▪️', '▪', '✅', '⭐', '◀', '-', '*', '️'];
  var stripBul = function (t) {
    var again = true;
    while (again) {
      again = false;
      t = t.replace(/^ +/, '');
      for (var i = 0; i < BUL.length; i++) if (t.indexOf(BUL[i]) === 0) { t = t.slice(BUL[i].length); again = true; }
    }
    return t;
  };
  var RX_TIME = /(يبدأ|البدء|تنفيذ|التنفيذ|تسليم|التسليم|يصلك|مدة|خلال|فوري|فورا|فوراً|يوم عمل|ساعة|ساعات|دقيقة|دقائق)/;
  var RX_NUMT = /([0-9٠-٩]+|فوري|فورا|فوراً|مباشر)/;
  var RX_GUAR = /(ضمان|تعويض|استرجاع|استرداد)/;
  var RX_HEAD = /(مميزات|المميزات|تفاصيل|ماذا تحصل|ما الذي تحصل|يشمل|لماذا تختار|ملاحظات مهمة)/;
  var summarize = function (html) {
    var doc;
    try { doc = new DOMParser().parseFromString('<div>' + (html || '') + '</div>', 'text/html'); } catch (e) { return null; }
    var root = doc.body;
    var all = root.querySelectorAll('h1,h2,h3,h4,h5,p,li,div');
    var blocks = [];
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.tagName === 'DIV' && el.querySelector('p,li,div,h2,h3,h4')) continue;
      if (el.tagName === 'P' && el.closest('li')) continue;
      var tx = (el.textContent || '').replace(WS, ' ').trim();
      if (!tx || /^[━─—_=.•*-]+$/.test(tx)) continue;
      var bl = stripBul(tx);
      var head = /^H[1-5]$/.test(el.tagName) || (el.tagName === 'P' && el.children.length === 1 && el.firstElementChild.tagName === 'STRONG' && tx.length < 70 && bl === tx && el.firstElementChild.textContent.trim() === tx && /[؟?]$|مميزات|تفاصيل|ملاحظات|يشمل|خطوات/.test(tx));
      var bullet = el.tagName === 'LI' || bl !== tx;
      blocks.push({ t: bl, head: head, bullet: bullet });
    }
    /* stat cards like "82% / نسبة القبول" */
    var stats = [];
    var ds = root.querySelectorAll('div');
    for (var s = 0; s < ds.length; s++) {
      var k = ds[s].children;
      if (k.length === 2 && k[0].tagName === 'DIV' && k[1].tagName === 'DIV' && !k[0].children.length && k[0].textContent.trim().length <= 6) {
        stats.push(k[0].textContent.trim() + ' ' + k[1].textContent.trim());
      }
    }
    var time = '', guar = '', feats = [];
    /* the features list: bullets under a "مميزات / تفاصيل" heading, else any bullets */
    var pick = function (want) {
      var out = [], par = [], on = false;
      for (var j = 0; j < blocks.length; j++) {
        var b = blocks[j];
        if (b.head) { on = !want || RX_HEAD.test(b.t); continue; }
        if (on && b.bullet) out.push(b.t);
        else if (on && want) {
          /* a features paragraph: keep its short clauses */
          var cl = b.t.split(/[.،؛!] |[.]$/);
          for (var c2 = 0; c2 < cl.length; c2++) {
            var cx = cl[c2].trim().replace(/^و(?=[^ ])/, '').replace(/^مع /, '');
            if (cx.length >= 12 && cx.length <= 95) par.push(cx);
          }
        }
      }
      return out.length >= 2 ? out : out.concat(par);
    };
    var list = pick(true);
    if (list.length < 2) list = pick(false).concat(list);
    for (var q = 0; q < stats.length; q++) {
      if (!time && /يوم|ساعة|دقيقة/.test(stats[q])) time = stats[q];
      else if (!guar && RX_GUAR.test(stats[q])) guar = stats[q];
      else list.push(stats[q]);
    }
    var sentences = [];
    for (var m = 0; m < blocks.length; m++) {
      var parts = blocks[m].t.split(/[.!؟?] |[.]$/);
      for (var n = 0; n < parts.length; n++) if (parts[n].trim()) sentences.push(parts[n].trim());
    }
    var srcs = list.concat(sentences);
    var nl = list.length;
    /* best line about when it starts/arrives: a delivery word plus a duration or "فوري" */
    for (var a = 0; a < srcs.length && !time; a++) {
      var x = srcs[a];
      if (x.length > 120 || RX_GUAR.test(x) || /^(ج|س|نعم|لا|بدلا|بدلاً|هل)[ :،]/.test(x)) continue;
      if (!/(يبدأ|البدء|تنفيذ|التنفيذ|تسليم|التسليم|يصلك|مدة|يوم عمل)/.test(x)) continue;
      /* in the list "فوري" is enough; in plain text a real duration is required */
      if (/[0-9٠-٩]+ ?(ساعة|ساعات|يوم|أيام|دقيقة|دقائق)/.test(x) || (a < nl && /(فوري|فورا|فوراً|مباشرة)/.test(x))) time = x;
    }
    for (var g2 = 0; g2 < srcs.length && !guar; g2++) {
      var y = srcs[g2], gi = y.search(RX_GUAR);
      if (gi < 0 || y.length > 120 || (g2 >= nl && gi > 20)) continue;
      if (/[0-9٠-٩]|دائم|كامل|تلقائي|الرفض|النقص/.test(y)) guar = y;
    }
    var seen = {};
    for (var f = 0; f < list.length && feats.length < 5; f++) {
      var it = list[f];
      if (it === time || it === guar || it.length < 6) continue;
      var key = it.slice(0, 18);
      if (seen[key]) continue;
      seen[key] = 1;
      feats.push(clip(it.replace(/[ .،:]+$/, ''), 80));
    }
    if (!feats.length) {
      for (var z = 0; z < sentences.length && feats.length < 3; z++) {
        if (sentences[z] !== time && sentences[z] !== guar && sentences[z].length > 12) feats.push(clip(sentences[z].replace(/[ .،:]+$/, ''), 90));
      }
    }
    return { time: clip(time, 70), guar: clip(guar, 70), feats: feats };
  };

  var DT_CACHE = {};
  var openDetails = function (pid, btn, url) {
    if (document.getElementById('ffmc')) return;
    if (btn) btn.disabled = true;
    var got = DT_CACHE[pid] ? Promise.resolve(DT_CACHE[pid]) : quiet(function () { return salla.api.product.getDetails(pid); }).then(function (r) {
      var p = (r && r.data) || {};
      DT_CACHE[pid] = { name: p.name || '', url: p.url || url || '', sale: !p.status || p.status === 'sale', s: summarize(p.description || '') };
      return DT_CACHE[pid];
    });
    got.then(function (d) {
      if (btn) btn.disabled = false;
      var sh = openShell(true);
      var s = d.s || { feats: [] };
      var h = '<style>' + DT_CSS + '</style><div class="ffd"><h3></h3>';
      if (s.time || s.guar) {
        h += '<div class="cp">';
        if (s.time) h += '<div><i>⏱️</i><span><b>وقت التنفيذ</b><span class="vt"></span></span></div>';
        if (s.guar) h += '<div><i>🛡️</i><span><b>الضمان</b><span class="vg"></span></span></div>';
        h += '</div>';
      }
      if (s.feats.length) h += '<ul></ul>';
      h += '<div class="ac">' + (d.sale ? '<button type="button" class="ffqb"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.2 2 4.6 13.6h6.2L9.9 22l8.6-11.7h-6.3L13.2 2z"/></svg><span>شراء سريع</span></button>' : '') +
        '<a class="lk">التفاصيل الكاملة</a></div></div>';
      sh.stage.innerHTML = h;
      sh.stage.querySelector('h3').textContent = d.name;
      if (s.time) sh.stage.querySelector('.vt').textContent = s.time;
      if (s.guar) sh.stage.querySelector('.vg').textContent = s.guar;
      var ul = sh.stage.querySelector('ul');
      for (var i = 0; ul && i < s.feats.length; i++) {
        var li = document.createElement('li');
        li.textContent = s.feats[i];
        ul.appendChild(li);
      }
      var lk = sh.stage.querySelector('.lk');
      if (d.url) lk.href = d.url; else lk.style.display = 'none';
      var qb = sh.stage.querySelector('.ffqb');
      if (qb) qb.addEventListener('click', function () { closeMini(); openQuickBuy(pid, null); });
    }).catch(function () {
      if (btn) btn.disabled = false;
      try { salla.notify.error('تعذر عرض التفاصيل، حاول مرة ثانية'); } catch (e) {}
    });
  };
  var makeDetailsBtn = function (pid, url) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'ffdt';
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" stroke-linecap="round"/></svg><span>تفاصيل الخدمة</span>';
    b.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openDetails(pid, this, url);
    });
    return b;
  };

  var addQuickButtons = function () {
    if (document.querySelector('form.product-form')) return; /* product page has its own buttons */
    var cards = document.querySelectorAll('custom-salla-product-card, salla-product-card');
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      if (c.getAttribute('data-ffqb')) continue;
      var ap = c.querySelector('salla-add-product-button[product-id]');
      if (!ap) continue;
      c.setAttribute('data-ffqb', '1');
      var pid = ap.getAttribute('product-id');
      var row = ap.closest('.s-product-card-content-footer') || ap.parentNode;
      var la = c.querySelector('a[href]');
      var db = makeDetailsBtn(pid, la ? la.href : '');
      if (row && row.parentNode) row.parentNode.insertBefore(db, row.nextSibling);
      if (ap.getAttribute('product-status') && ap.getAttribute('product-status') !== 'sale') continue;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'ffqb';
      b.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.2 2 4.6 13.6h6.2L9.9 22l8.6-11.7h-6.3L13.2 2z"/></svg><span>شراء سريع</span>';
      b.setAttribute('aria-label', 'شراء سريع');
      b.setAttribute('data-pid', pid);
      b.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        openQuickBuy(this.getAttribute('data-pid'), this);
      });
      /* full width under the card's own button row, details link under it */
      if (db.parentNode) db.parentNode.insertBefore(b, db);
    }
  };
  var startCards = function () {
    try {
      var qs = document.createElement('style');
      qs.textContent = QB_CSS + DT_CSS;
      document.head.appendChild(qs);
    } catch (e) {}
    addQuickButtons();
    try {
      var qt = null;
      new MutationObserver(function () {
        if (qt) return;
        qt = setTimeout(function () { qt = null; addQuickButtons(); }, 300);
      }).observe(document.body, { childList: true, subtree: true });
    } catch (e) { setInterval(addQuickButtons, 1500); }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startCards);
  else startCards();

  if (window.__ffgQ) { window.__ffgQ = 0; try { guestBuyFromPage(); } catch (e) {} }
})();
