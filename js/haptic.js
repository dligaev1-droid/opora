/* Вибрация: тактильные сигналы в практиках и играх.
   Работает на Android (Chrome, Яндекс Браузер и др.). iPhone не даёт сайтам управлять вибрацией — там её просто нет.
   Выключается в «Психолог» → «Оформление» и при системной настройке «уменьшить движение». */
(function(){
"use strict";
const can = () => !!navigator.vibrate && !matchMedia("(prefers-reduced-motion: reduce)").matches && !(typeof S!=="undefined" && S && S.vib===false);
// паттерны: число — длина вибрации, массив — вибрация/пауза/вибрация…
const P={
  tap:8, pop:12, soft:6,
  inhale:[40,60,40],          // вдох — двойной мягкий толчок
  hold:15,                    // пауза — короткий
  exhale:[120],               // выдох — один длинный
  tense:[30,40,30,40,30],     // напрячь — частое «тук-тук-тук»
  relax:[200],                // расслабить — длинная мягкая волна
  step:20,                    // следующий шаг
  done:[60,80,60,80,180],     // финиш
  card:[15,40,25,40,60]       // открытие карты
};
function hap(name){ if(!can()) return; try{ navigator.vibrate(typeof name==="number"||Array.isArray(name)?name:(P[name]||8)); }catch(e){} }
window.HAP=hap;

// все переходы фаз в практиках уже идут через звуковые сигналы — повторяем их вибрацией (даже если звук выключен)
function hook(){
  if(!window.SND || SND._hap) return false;
  const c0=SND.cue;
  SND.cue=function(name, arg){
    if(name==="breath") hap(arg===0?"inhale":arg===2?"exhale":"hold");
    else if(name==="tense") hap("tense");
    else if(name==="relax") hap("relax");
    else if(name==="done") hap("done");
    return c0.apply(this, arguments);
  };
  SND._hap=true; return true;
}
if(!hook()) document.addEventListener("DOMContentLoaded", hook);

// шаги, где сигнала нет: заземление, программы, дневники
document.addEventListener("click", e=>{
  const t=e.target.closest && e.target.closest("#gNext,#gStart,#raSave,#cSave,#spSave,[data-pick],[data-open],#tourNext,[data-fp],#fPgOk");
  if(!t) return;
  if(t.matches("[data-pick],[data-open]")) return;          // у карт своя вибрация
  hap(t.id==="raSave"||t.id==="spSave"||t.id==="cSave"?"done":"step");
}, {passive:true});

// переключатель в «Оформлении»
function vibCard(){
  if(!navigator.vibrate) return `<p class="small muted">Вибрация: на этом телефоне браузер её не поддерживает (так на iPhone).</p>`;
  const on=!(S.vib===false);
  return `<div class="row" style="justify-content:space-between;flex-wrap:nowrap"><span class="stack-s" style="gap:2px"><strong>Вибрация</strong><span class="small muted">Ритм дыхания, шаги практик и отклик в играх</span></span><button class="chip" id="vibT" aria-pressed="${on}">${on?"Вкл":"Выкл"}</button></div>`;
}
const r0=window.render;
window.render=function(){ r0.apply(this, arguments);
  const tc=document.getElementById("themeCard");
  if(tc && !document.getElementById("vibT") && !tc.querySelector(".vib-w")){ const d=document.createElement("div"); d.className="vib-w"; d.innerHTML=vibCard(); tc.appendChild(d);
    const b=document.getElementById("vibT"); if(b) b.onclick=()=>{ S.vib=(S.vib===false); save(); if(S.vib) hap("done"); d.innerHTML=vibCard(); render(); }; }
};
})();
