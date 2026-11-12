/* ff-contrast v1: fixes system texts that end up dark-on-dark (or light-on-light) in the store's dark mode.
   Runs after load, in small idle chunks (no long tasks), and again on DOM changes. Only touches text whose
   contrast against its real background is below 3:1. */
(function () {
  if (window.__ffContrast) return;
  window.__ffContrast = 1;
  var LIGHT = '#e5e7eb', DARK = '#1f2937';
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, SVG: 1, PATH: 1, IMG: 1, VIDEO: 1, CANVAS: 1, IFRAME: 1, INPUT: 1, TEXTAREA: 1, SELECT: 1, OPTION: 1, BR: 1, HR: 1 };

  function parse(c) {
    var m = c && c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    var p = m[1].split(',').map(function (x) { return parseFloat(x); });
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  function lum(c) {
    function ch(v) { v = v / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
    return 0.2126 * ch(c.r) + 0.7152 * ch(c.g) + 0.0722 * ch(c.b);
  }
  function ratio(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }

  var bgCache = new WeakMap();
  function bgOf(el) {
    var chain = [], e = el, found = null;
    while (e && e.nodeType === 1) {
      if (bgCache.has(e)) { found = bgCache.get(e); break; }
      chain.push(e);
      var cs = getComputedStyle(e);
      if (cs.backgroundImage && cs.backgroundImage !== 'none' && cs.backgroundImage.indexOf('gradient') < 0) { found = 'img'; break; }
      var c = parse(cs.backgroundColor);
      if (c && c.a > 0.6) { found = c; break; }
      e = e.parentElement;
    }
    if (!found) found = parse(getComputedStyle(document.body).backgroundColor) || { r: 13, g: 20, b: 38, a: 1 };
    for (var i = 0; i < chain.length; i++) bgCache.set(chain[i], found);
    return found;
  }

  function hasText(el) {
    for (var n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && n.nodeValue.trim()) return true;
    return false;
  }

  function fix(el) {
    if (SKIP[el.tagName.toUpperCase()] || el.closest('svg')) return;
    if (!hasText(el)) return;
    var cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) === 0) return;
    var fg = parse(cs.color);
    if (!fg) return;
    var bg = bgOf(el);
    if (bg === 'img') return;
    if (ratio(fg, bg) >= 3) return;
    el.style.setProperty('color', lum(bg) < 0.4 ? LIGHT : DARK, 'important');
    el.setAttribute('data-ffc', '1');
  }

  var queue = [], busy = false;
  function pump(deadline) {
    var t0 = Date.now();
    while (queue.length && Date.now() - t0 < 8) {
      var el = queue.shift();
      if (el.isConnected) { try { fix(el); } catch (e) {} }
    }
    if (queue.length) later(pump); else busy = false;
  }
  function later(fn) { if (window.requestIdleCallback) requestIdleCallback(fn, { timeout: 500 }); else setTimeout(fn, 30); }
  function scan(root) {
    if (!root || root.nodeType !== 1) return;
    queue.push(root);
    var all = root.getElementsByTagName('*');
    for (var i = 0; i < all.length; i++) queue.push(all[i]);
    bgCache = new WeakMap();
    if (!busy) { busy = true; later(pump); }
  }

  var pending = [], timer = 0;
  function onMut(list) {
    for (var i = 0; i < list.length; i++) {
      var m = list[i];
      if (m.type === 'childList') for (var j = 0; j < m.addedNodes.length; j++) { var n = m.addedNodes[j]; if (n.nodeType === 1) pending.push(n); else if (n.parentElement) pending.push(n.parentElement); }
    }
    if (!timer) timer = setTimeout(function () { timer = 0; var p = pending; pending = []; p.forEach(scan); }, 400);
  }

  function start() {
    scan(document.body);
    try { new MutationObserver(onMut).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
  }
  if (document.readyState === 'complete') setTimeout(start, 1500);
  else window.addEventListener('load', function () { setTimeout(start, 1500); });
})();
