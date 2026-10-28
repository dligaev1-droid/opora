/* «Спокойная» главная для новичков: приложение открывается постепенно, чтобы не было слишком много сразу.
   День 1 — «Как вы?», один шаг на сегодня и SOS (и дерево — когда появятся первые очки).
   День 2 — добавляются карта дня, дерево и мысль дня с пометкой «Новое».
   День 3 — открыто всё, включая переключатель «Я · Мы · Цели», с коротким сообщением об этом.
   Касается только тех, кто начал пользоваться после выхода этой версии: у остальных главная не меняется. */
(function(){
"use strict";
const RELEASE = Date.UTC(2026,9,28,8,0);   // 28 октября 2026
const isObj = x => !!x && typeof x==="object" && !Array.isArray(x);
function SM(){
  if(isObj(S.simple)) return S.simple;
  const o=S.onb; if(isObj(o) && typeof o.ts==="number" && o.ts>=RELEASE){ S.simple={since:o.ts}; save(); return S.simple; }
  return null;
}
const dk = t => { const d=new Date(t); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
function stage(sm){
  if(sm.done) return 2;
  const from=dk(sm.since), today=dayKey(), days=new Set(S.days.filter(d=>d>=from)); days.add(today);
  const st=Math.min(2, days.size-1);
  if(st>=2){ sm.done=true; sm.doneDay=today; save(); }
  return st;
}
const tpl = h => { const t=document.createElement("template"); t.innerHTML=h; return t.content; };
const out = frag => { const d=document.createElement("div"); d.appendChild(frag.cloneNode(true)); return d.innerHTML; };
const gotIt = (id, label, title, text) => `<div class="card soft tip-card" id="${id}"><div class="row"><span class="label">${label}</span><button class="linkbtn small" data-sm-ok="${id}">Понятно</button></div><strong>${title}</strong><p class="small">${text}</p></div>`;

function stepCard(st){
  const recs = window.RECS_OF ? window.RECS_OF((S.onb&&S.onb.f)||[]) : [];
  if(!recs.length) return "";
  const r=recs[st%recs.length];
  return `<div class="card step-card"><span class="label">Ваш шаг на сегодня</span>
    <button class="li" data-go="${r[0]}"${r[1]?` data-sub="${r[1]}"`:""}><span class="ico">${ico(r[4],18)}</span><span class="dt"><strong>${r[2]}</strong><span class="small muted">${r[3]}</span></span><span class="chev">›</span></button>
    <p class="small muted">Одного шага в день достаточно. Завтра здесь будет следующий.</p></div>`;
}

const vH0=VIEWS.home[0], bH0=VIEWS.home[1];
function vHomeS(){
  const h=vH0();
  if(/class="onb"/.test(h)) return h;                 // идёт знакомство — не трогаем
  const sm=SM();
  if(!sm) return h;                                   // давний пользователь — главная как раньше
  const st=stage(sm), c=tpl(h);
  if(st>=2){                                          // всё открыто: один раз сообщаем об этом
    if(!sm.allOk){ const tc=c.querySelector(".tip-card"); if(tc) tc.remove(); const top=c.querySelector(".top"); const n=tpl(gotIt("smAll","Теперь открыто всё","Вы освоились — вот что ещё есть в Опоре","Вверху — переключатель «Я · Мы · Цели»: раздел для пары и цели без выгорания. В «Практиках» — программы, карты и антистресс. В «Моём росте» — дерево и достижения.")); if(top) top.after(n); else c.prepend(n); }
    return out(c);
  }
  const pick = sel => c.querySelector(sel);
  const top=pick(".top"); if(top){ const ms=top.querySelector(".mode-sw"); if(ms) ms.remove(); }
  const greet=[...c.querySelectorAll(".stack-s")].find(e=>e.querySelector("h1"));
  const moods=(pick(".moods")||{}).closest ? pick(".moods").closest(".card") : null;
  const today=pick(".today"), sos=pick(".sos-banner"), disc=pick(".disclaimer");
  const f=document.createDocumentFragment(), add=x=>{ if(x) f.appendChild(typeof x==="string"?tpl(x):x); };
  add(top);
  if(st===0 && !sm.introOk) add(gotIt("smIntro","Добро пожаловать","Начнём с простого","Опора помогает справляться с тревогой и стрессом. Сегодня — только главное: отметьте, как вы, и сделайте один маленький шаг. Остальное будет открываться в ближайшие дни."));
  add(greet); add(moods);
  add(stepCard(st));
  if(st===0){
    // дерево появляется, как только есть первые очки: о нём уже рассказало окно «Ваши первые очки»
    const tr=today && today.querySelector('.tday[data-go="growth"]');
    if(tr && typeof xpTotal==="function" && xpTotal()>0){ const w=tpl(`<div class="stack-s"><span class="label">Мой рост</span><div class="sm-one"></div></div>`); w.querySelector(".sm-one").appendChild(tr); add(w); }
  } else if(today){
    const lab=today.querySelector(".label"); if(lab && !sm.newOk) lab.insertAdjacentHTML("afterend",`<p class="small sm-new"><span class="tag">Новое</span> Карта дня, ваше дерево и мысль дня — маленькие ежедневные ритуалы на минуту. <button class="linkbtn small" data-sm-ok="smNew">Понятно</button></p>`);
    add(today);
  }
  add(sos);
  add(`<p class="small muted sm-more">${st===0?"Карты, программы, раздел для пары и цели откроются в ближайшие дни.":"Завтра откроется всё остальное: программы, раздел для пары и цели."} <button class="linkbtn small" id="smAllNow">Показать всё сейчас</button></p>`);
  add(disc);
  return out(f);
}
function bHomeS(){
  if(bH0) bH0();
  const sm=SM(); if(!sm) return;
  $$("[data-sm-ok]").forEach(b=>b.onclick=()=>{ const k=b.dataset.smOk; if(k==="smIntro") sm.introOk=1; if(k==="smNew") sm.newOk=1; if(k==="smAll"){ sm.allOk=1; if(!isObj(S.tipsSeen)) S.tipsSeen={}; S.tipsSeen.home=1; } save(); render(); });
  const a=$("#smAllNow"); if(a) a.onclick=()=>{ sm.done=true; sm.doneDay=dayKey(); save(); render(); window.scrollTo(0,0); };
}
VIEWS.home=[vHomeS,bHomeS];
window.SIMPLE={SM, stage:()=>{ const s=SM(); return s?stage(s):2; }};
})();
