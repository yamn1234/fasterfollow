/* window.__ver(url,width,cssA[],cssB[]) renders the initial server HTML (no JS) twice and diffs computed styles of elements above 1300px */
window.__ver = async function (url, width, A, B) {
  var html = await (await fetch(url, { cache: 'no-store' })).text();
  var get = function (list) { return Promise.all(list.map(function (u) { return fetch(u).then(function (r) { return r.text(); }); })); };
  var fix = function (s) { return s.split(String.fromCharCode(164)).join(String.fromCharCode(92)); };
  var props = ['display','position','top','left','width','height','margin-top','margin-bottom','margin-left','margin-right','padding-top','padding-bottom','padding-left','padding-right','color','background-color','background-image','font-size','font-weight','font-family','line-height','flex-direction','flex-wrap','justify-content','align-items','visibility','opacity','border-top-width','border-bottom-width','border-radius','gap','grid-template-columns','text-align','overflow-x','overflow-y','z-index','transform','object-fit','aspect-ratio','box-shadow'];
  async function render(cssList) {
    var css = (await get(cssList)).map(fix);
    var f = document.createElement('iframe');
    f.setAttribute('sandbox', 'allow-same-origin');
    f.style.cssText = 'position:fixed;left:0;top:0;width:' + width + 'px;height:900px;border:0;z-index:-1;opacity:0';
    f.srcdoc = html.replace('<head>', '<head><base href="' + location.origin + '/">');
    document.body.appendChild(f);
    await new Promise(function (r) { f.onload = r; setTimeout(r, 15000); });
    var d = f.contentDocument;
    css.forEach(function (c) { var s = d.createElement('style'); s.textContent = c; d.head.appendChild(s); });
    await new Promise(function (r) { setTimeout(r, 800); });
    var out = [];
    d.querySelectorAll('body *').forEach(function (e) {
      var r = e.getBoundingClientRect();
      var cs = f.contentWindow.getComputedStyle(e);
      out.push({ e: e.tagName.toLowerCase() + '.' + String(e.className && e.className.baseVal !== undefined ? e.className.baseVal : e.className).slice(0, 50), top: r.top, v: props.map(function (p) { return cs.getPropertyValue(p); }) });
    });
    f.remove();
    return out;
  }
  var a = await render(A), b = await render(B);
  var n = Math.min(a.length, b.length), diffs = [];
  for (var i = 0; i < n; i++) {
    if (a[i].top >= 1300 && b[i].top >= 1300) continue;
    var dp = [];
    for (var k = 0; k < props.length; k++) if (a[i].v[k] !== b[i].v[k]) dp.push(props[k] + ':' + a[i].v[k].slice(0, 30) + '>' + b[i].v[k].slice(0, 30));
    if (dp.length) diffs.push(a[i].e + ' @' + Math.round(a[i].top) + ' ' + dp.join(' ; '));
  }
  return 'w' + width + ' els ' + a.length + '/' + b.length + ' diffs ' + diffs.length + '\n' + diffs.slice(0, 12).join('\n');
};
