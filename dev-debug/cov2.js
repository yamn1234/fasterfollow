/* coverage v2: initial server HTML (no JS) rendered in a sandboxed iframe at a given width.
   window.__cov2(url, width) -> adds hit selector indexes to localStorage 'ffcov2' */
window.__cov2 = async function (url, width, selUrl, cssUrls) {
  var S = await (await fetch(selUrl)).json();
  var html = await (await fetch(url, { cache: 'no-store' })).text();
  var css = await Promise.all(cssUrls.map(function (u) { return fetch(u).then(function (r) { return r.text(); }); }));
  css[0] = css[0].split(String.fromCharCode(164)).join(String.fromCharCode(92));
  var f = document.createElement('iframe');
  f.setAttribute('sandbox', 'allow-same-origin');
  f.style.cssText = 'position:fixed;left:0;top:0;width:' + width + 'px;height:900px;border:0;z-index:-1;opacity:0';
  f.srcdoc = html.replace('<head>', '<head><base href="' + location.origin + '/">');
  document.body.appendChild(f);
  await new Promise(function (r) { f.onload = r; setTimeout(r, 15000); });
  var d = f.contentDocument;
  css.forEach(function (c) { var s = d.createElement('style'); s.textContent = c; d.head.appendChild(s); });
  await new Promise(function (r) { setTimeout(r, 800); });
  var strip = function (s) {
    var o = s, prev;
    do { prev = o; o = o.replace(/:not\([^()]*(\([^()]*\))?[^()]*\)/g, ''); } while (o !== prev);
    o = o.replace(/::?(before|after|placeholder|selection|marker|-webkit-[a-z-]+|-moz-[a-z-]+|-ms-[a-z-]+|first-letter|first-line|backdrop|file-selector-button)/g, '')
      .replace(/:(hover|focus|focus-visible|focus-within|active|visited|checked|disabled|enabled|invalid|valid|placeholder-shown|empty|target|indeterminate|required|read-only|autofill|open|link|any-link|defined)\b/g, '');
    return o.trim() || '*';
  };
  var prev = []; try { prev = JSON.parse(localStorage.getItem('ffcov2') || '[]'); } catch (e) {}
  var hit = new Set(prev), err = 0;
  S.forEach(function (sel, i) {
    var parts = sel.split(',');
    for (var p = 0; p < parts.length; p++) {
      var base = strip(parts[p].trim());
      var vars = [base];
      if (base.indexOf('salla-slider') > -1) vars.push(base.split('salla-slider').join('ff-defer-slider'));
      for (var v = 0; v < vars.length; v++) {
        var els;
        try { els = d.querySelectorAll(vars[v]); } catch (e) { err++; hit.add(i); return; }
        for (var k = 0; k < els.length; k++) {
          if (els[k].getBoundingClientRect().top < 1600) { hit.add(i); return; }
        }
      }
    }
  });
  localStorage.setItem('ffcov2', JSON.stringify(Array.from(hit)));
  var dh = d.documentElement.scrollHeight;
  f.remove();
  return 'w' + width + ' hit ' + hit.size + ' prev ' + prev.length + ' err ' + err + ' docH ' + dh;
};
