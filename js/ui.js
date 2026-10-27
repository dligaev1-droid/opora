/* Карусели, которые листаются не только пальцем: перетаскивание мышью, стрелки по краям
   (на компьютере) и затухание у края, чтобы было видно, что дальше есть ещё карточки. */
(function(){
"use strict";
const fine = () => matchMedia("(hover: hover) and (pointer: fine)").matches;
const ARR = d => `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d<0?"M15 5l-7 7 7 7":"M9 5l7 7-7 7"}"/></svg>`;

function step(c){ const it=c.firstElementChild; return it ? it.getBoundingClientRect().width + (parseFloat(getComputedStyle(c).columnGap)||12) : c.clientWidth*.8; }
function update(w, c){
  const max=c.scrollWidth-c.clientWidth-2;
  w.classList.toggle("at-start", c.scrollLeft<=2);
  w.classList.toggle("at-end", c.scrollLeft>=max);
  w.classList.toggle("no-scroll", max<=0);
}
function enhance(c){
  if(c.dataset.enh) return; c.dataset.enh="1";
  const w=document.createElement("div"); w.className="car-wrap";
  c.parentNode.insertBefore(w, c); w.appendChild(c);
  const mk=d=>{ const b=document.createElement("button"); b.type="button"; b.className="car-arr "+(d<0?"prev":"next"); b.setAttribute("aria-label", d<0?"Назад":"Вперёд"); b.innerHTML=ARR(d); b.onclick=e=>{ e.stopPropagation(); c.scrollBy({left:d*step(c), behavior:"smooth"}); }; return b; };
  w.appendChild(mk(-1)); w.appendChild(mk(1));
  c.addEventListener("scroll", ()=>update(w,c), {passive:true});
  // перетаскивание мышью
  let down=false, sx=0, sl=0, moved=false;
  c.addEventListener("pointerdown", e=>{ if(e.pointerType!=="mouse" || e.button!==0) return; down=true; moved=false; sx=e.clientX; sl=c.scrollLeft; });
  c.addEventListener("pointermove", e=>{ if(!down) return; const dx=e.clientX-sx;
    if(!moved && Math.abs(dx)>6){ moved=true; c.classList.add("dragging"); try{ c.setPointerCapture(e.pointerId); }catch(_){} }
    if(moved){ c.scrollLeft=sl-dx; e.preventDefault(); } });
  const up=e=>{ if(!down) return; down=false; if(moved){ c.classList.remove("dragging"); try{ c.releasePointerCapture(e.pointerId); }catch(_){}
      // доводим до ближайшей карточки
      const s=step(c); c.scrollTo({left:Math.round(c.scrollLeft/s)*s, behavior:"smooth"}); setTimeout(()=>{ moved=false; },0); } };
  c.addEventListener("pointerup", up); c.addEventListener("pointercancel", up); c.addEventListener("lostpointercapture", e=>{ if(down) up(e); });
  // после перетаскивания не открываем карточку, на которой отпустили кнопку
  c.addEventListener("click", e=>{ if(moved){ e.preventDefault(); e.stopPropagation(); moved=false; } }, true);
  c.addEventListener("dragstart", e=>e.preventDefault());
  // колесо мыши: вертикальную прокрутку над каруселью превращаем в горизонтальную, пока есть куда листать
  c.addEventListener("wheel", e=>{ if(!fine() || e.ctrlKey) return; const max=c.scrollWidth-c.clientWidth; if(max<=0) return;
    const d=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:(e.shiftKey?e.deltaY:0); if(!d) return;
    if((d<0 && c.scrollLeft<=0) || (d>0 && c.scrollLeft>=max-1)) return; c.scrollLeft+=d; e.preventDefault(); }, {passive:false});
  requestAnimationFrame(()=>update(w,c));
}
function enhanceAll(){ document.querySelectorAll("#app .carousel").forEach(enhance); }
const r0=window.render;
window.render=function(){ const out=r0.apply(this, arguments); try{ enhanceAll(); }catch(e){} return out; };
window.addEventListener("resize", ()=>document.querySelectorAll(".car-wrap").forEach(w=>{ const c=w.querySelector(".carousel"); if(c) update(w,c); }));
if(document.readyState!=="loading") setTimeout(enhanceAll,0); else document.addEventListener("DOMContentLoaded", ()=>setTimeout(enhanceAll,0));
})();
