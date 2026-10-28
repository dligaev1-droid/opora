/* Живые метафорические карты — приёмы анимации карточных игр:
   — рубашка с золотой рамкой и пробегающим бликом;
   — карты в веере покачиваются, при нажатии приподнимаются;
   — открытие: подъём, переворот, вспышка света и золотые искры, вибрация;
   — открытая карта наклоняется за пальцем или мышью, по ней бежит отблеск, края мягко светятся.
   Всё отключается при системной настройке «уменьшить движение». */
(function(){
"use strict";
const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// золотые искры и вспышка вокруг только что открытой карты
function burst(card){
  if(still() || card.querySelector(".mc-burst")) return;
  const b=document.createElement("div"); b.className="mc-burst"; b.setAttribute("aria-hidden","true");
  let h='<i class="mc-flash"></i>';
  for(let k=0;k<26;k++){ const a=Math.random()*Math.PI*2, d=60+Math.random()*110, s=2+Math.random()*4;
    h+=`<b style="--dx:${(Math.cos(a)*d).toFixed(0)}px;--dy:${(Math.sin(a)*d-30).toFixed(0)}px;--s:${s.toFixed(1)}px;--t:${(.9+Math.random()*.9).toFixed(2)}s;--d:${(.35+Math.random()*.25).toFixed(2)}s"></b>`; }
  b.innerHTML=h; card.appendChild(b); setTimeout(()=>b.remove(), 2200);
  if(window.HAP) setTimeout(()=>HAP("card"), 350);
}
// наклон за пальцем/мышью и движущийся отблеск
function tilt(card){
  if(still() || card._tilt) return; card._tilt=true;
  let raf=0, tx=0, ty=0;
  const set=(x,y)=>{ tx=x; ty=y; if(raf) return; raf=requestAnimationFrame(()=>{ raf=0;
    card.style.setProperty("--rx",(-ty*10).toFixed(2)+"deg"); card.style.setProperty("--ry",(tx*12).toFixed(2)+"deg");
    card.style.setProperty("--mx",(50+tx*50).toFixed(1)+"%"); card.style.setProperty("--my",(50+ty*50).toFixed(1)+"%"); }); };
  const move=e=>{ const r=card.getBoundingClientRect(); set(Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1)), Math.max(-1,Math.min(1,(e.clientY-r.top)/r.height*2-1))); };
  card.addEventListener("pointermove", move);
  card.addEventListener("pointerdown", e=>{ card.classList.add("held"); move(e); });
  const reset=()=>{ card.classList.remove("held"); set(0,0); };
  card.addEventListener("pointerleave", reset); card.addEventListener("pointerup", reset); card.addEventListener("pointercancel", reset);
}
function enhance(){
  document.querySelectorAll(".mcard.up").forEach(c=>{ c.classList.add("live"); tilt(c); if(c.classList.contains("reveal")) burst(c); });
  document.querySelectorAll(".fan-c").forEach((b,i)=>{ b.style.setProperty("--fi",i); });
}
// веер: при выборе — короткая пауза, чтобы карта успела «подняться»
document.addEventListener("click", e=>{
  const b=e.target.closest && e.target.closest(".fan-c,.sp-c:not([disabled])");
  if(!b || b._go || still()) return;
  e.stopImmediatePropagation(); e.preventDefault();
  b.classList.add("picked"); if(window.HAP) HAP(15);
  const fan=b.closest(".fan"); if(fan) fan.classList.add("has-pick");
  setTimeout(()=>{ b._go=true; b.click(); }, 260);
}, true);
["cards","spread"].forEach(k=>{ const v=VIEWS[k]; if(!v) return; const b0=v[1]; VIEWS[k]=[v[0], (...a)=>{ if(b0) b0(...a); requestAnimationFrame(enhance); }]; });
})();
