Product pages: defer Salla salla-slider (p-xxxx.entry.js, ~208KB Swiper bundle) until first touch/scroll/key, or 12s after load. Desktop (>=1024px) restores immediately.
Blinder rule A: find <salla-slider  -> rule-open.html
Blinder rule B: find </salla-slider> -> rule-close.html
Route: /*/p*
open.js mirrors every salla-slider CSS rule onto ff-defer-slider so the gallery looks identical before hydration.
