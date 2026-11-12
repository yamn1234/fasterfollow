(function(){var K='ffdbg',C={},M=[],last=0,t0=Date.now();
function save(force){var n=Date.now();if(!force&&n-last<60)return;last=n;try{localStorage.setItem(K,JSON.stringify({at:n-t0,m:M.slice(-40),c:C}))}catch(e){}}
function bump(k){C[k]=(C[k]||0)+1;save(false)}
window.ffMark=function(s){M.push((Date.now()-t0)+' '+s);save(true)};
ffMark('start '+location.pathname.slice(-12));
var MO=window.MutationObserver;function W(cb){var s=String(cb).slice(0,90);return new MO(function(a,b){bump('MO '+s);return cb.call(this,a,b)})}W.prototype=MO.prototype;window.MutationObserver=W;
var st=window.setTimeout;window.setTimeout=function(f,d){if(typeof f!=='function')return st.apply(window,arguments);var s=String(f).slice(0,70);var a=[].slice.call(arguments,2);return st.call(window,function(){bump('TO '+s);return f.apply(this,a)},d)};
var si=window.setInterval;window.setInterval=function(f,d){if(typeof f!=='function')return si.apply(window,arguments);var s=String(f).slice(0,70);return si.call(window,function(){bump('IV '+s);return f.apply(this,arguments)},d)};
var raf=window.requestAnimationFrame;window.requestAnimationFrame=function(f){var s=String(f).slice(0,70);return raf.call(window,function(t){bump('RAF '+s);return f(t)})};
['appendChild','insertBefore','replaceChild','removeChild'].forEach(function(m){var o=Node.prototype[m];Node.prototype[m]=function(x){bump('DOM '+m+' '+(x&&x.nodeName));return o.apply(this,arguments)}});
var sa=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n){bump('ATTR '+this.nodeName+' '+n);return sa.apply(this,arguments)};
var cd=customElements.define;customElements.define=function(n){ffMark('define '+n);return cd.apply(this,arguments)};
addEventListener('DOMContentLoaded',function(){ffMark('DCL')});addEventListener('load',function(){ffMark('load')});
document.addEventListener('theme::ready',function(){ffMark('theme::ready')});
})()
