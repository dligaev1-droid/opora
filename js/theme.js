/* Оформление: светлая или тёмная тема. По умолчанию — по времени суток:
   с 21:00 до 7:00 включается ночная тема, утром — дневная. Можно выбрать «как в телефоне», «всегда светлая» или «всегда тёмная».
   Подключается в <head> до стилей, чтобы страница сразу открывалась в нужной теме без мигания. */
(function(){
  var MODES=["time","system","light","dark"], NIGHT_FROM=21, NIGHT_TO=7;
  function pref(){
    if(typeof S!=="undefined" && S && MODES.indexOf(S.theme)>=0) return S.theme;
    try{ var s=JSON.parse(localStorage.getItem("opora_v1")||"{}"); if(MODES.indexOf(s.theme)>=0) return s.theme; }catch(e){}
    return "time";
  }
  function isNight(d){ var h=(d||new Date()).getHours(); return h>=NIGHT_FROM || h<NIGHT_TO; }
  function wanted(){ var p=pref(); return p==="time" ? (isNight()?"dark":"light") : p==="system" ? null : p; }
  function apply(){
    var el=document.documentElement, t=wanted(), prev=el.getAttribute("data-theme");
    if(t) el.setAttribute("data-theme",t); else el.removeAttribute("data-theme");
    var ms=document.querySelectorAll('meta[name="theme-color"]');
    for(var i=0;i<ms.length;i++){ var m=ms[i]; if(!m.dataset.orig) m.dataset.orig=m.content; m.content = t ? (t==="dark"?"#11151B":"#F5F2EC") : m.dataset.orig; }
    return prev!==t;
  }
  function set(mode){ if(MODES.indexOf(mode)<0) return; if(typeof S!=="undefined" && S){ S.theme=mode; if(window.save) save(); } apply(); if(window.render) render(); }
  apply();
  window.THEME={apply:apply, set:set, pref:pref, isNight:isNight, NIGHT_FROM:NIGHT_FROM, NIGHT_TO:NIGHT_TO};
  // раз в минуту проверяем время: вечером тема сама станет ночной, утром — дневной
  setInterval(function(){ if(apply() && window.render) render(); }, 60000);
  document.addEventListener("visibilitychange", function(){ if(!document.hidden && apply() && window.render) render(); });
})();
