/* paint-yield hop 1: lets the browser paint the first screen before deferred scripts run */
(function(){try{var s=document.currentScript&&document.currentScript.src;if(s&&document.readyState==='loading')document.write('<script data-cfasync="false" src="'+s.replace('ff-y1.js','ff-y2.js')+'"><\/script>')}catch(e){}})();
