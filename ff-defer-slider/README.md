Product pages: defer Salla salla-slider (p-xxxx.entry.js, ~208KB Swiper bundle) until first touch/scroll/key, or 12s after load. Desktop (>=1024px) restores immediately.
Blinder rule A: find <salla-slider  -> rule-open.html
Blinder rule B: find </salla-slider> -> rule-close.html
Route: /*/p*
open.js mirrors every salla-slider CSS rule onto ff-defer-slider so the gallery looks identical before hydration.

## 2026-11-12 product-page speed pass
- Blinder 62 (/*/p*): LCP <img> src -> cdn-cgi/image width=600 (avif ~25KB instead of 38KB webp 1000x1000).
- Blinder 63 (/*/p*): product-only critical CSS ff-crit-prod.v2.block.html (103KB -> 66KB); rule 39 now excludes /*/p*.
  Built from initial-HTML (no-JS iframe) + post-JS coverage, verified 0 above-fold computed-style diffs (dev-debug/verify.js).
  v1 (post-JS coverage only) caused CLS 0.16: it dropped pre-hydration rules (:not(.hydrated) etc). Don't repeat.
- Blinder 64 paint-gate script after gallery: made FCP wait (counted as render-blocking) -> disabled (/ff-off-gate).
- Blinders 59-61 (font preload removal) are no-ops: blinders run before Reparo injections, so they can't edit injected code.
- PSI mobile after: p1142472412 90 (FCP 1.1s, LCP 3.3s), p926222471 88. PSI is bimodal (some runs paint ~1-2s late on Salla JS).
