/* «Цели без выгорания», часть 2: ритуалы утра и вечера, колесо баланса, ценности, итог недели,
   статистика, банка побед, ещё 3 программы и статьи. Бесплатно: 3 цели, 3 привычки, 1 ритуал,
   колесо, ценности, банка побед, первый итог недели, день 1 программ. Остальное — Опора+. */
(function(){
"use strict";
const N=window.GOALS; if(!N) return;
const {G, plus, LOCK, isObj, gback, lockCard, li, nico, GR, PARENT, dayNum, dayTs, weekStart, active, hDone, FREE, WD, AREAS, WHY, PD, GA}=N;
const uidS = () => Math.random().toString(36).slice(2,9);

/* ---------- Данные и их починка ---------- */
const X = () => {
  const g=G();
  if(!Array.isArray(g.rit)) g.rit=[];
  g.rit=g.rit.filter(r=>isObj(r) && typeof r.t==="string" && Array.isArray(r.steps));
  g.rit.forEach(r=>{ r.id=String(r.id||uidS()); r.steps=r.steps.filter(s=>isObj(s) && typeof s.t==="string"); r.steps.forEach(s=>{ s.id=String(s.id||uidS()); }); if(!isObj(r.days)) r.days={}; Object.keys(r.days).forEach(k=>{ if(!Array.isArray(r.days[k])) delete r.days[k]; }); if(!["am","pm","day"].includes(r.k)) r.k="day"; });
  if(!Array.isArray(g.wheel)) g.wheel=[]; g.wheel=g.wheel.filter(w=>isObj(w) && typeof w.ts==="number" && Array.isArray(w.v) && w.v.length===8 && w.v.every(v=>typeof v==="number" && v>=1 && v<=10));
  if(!Array.isArray(g.vals)) g.vals=[]; g.vals=g.vals.filter(v=>VAL.includes(v)).slice(0,5);
  if(!isObj(g.valNote)) g.valNote={};
  if(!isObj(g.weeks)) g.weeks={};
  Object.keys(g.weeks).forEach(k=>{ const w=g.weeks[k]; if(!isObj(w)){ delete g.weeks[k]; return; } if(!Array.isArray(w.next)) w.next=[]; w.next=w.next.filter(t=>typeof t==="string"); if(!Array.isArray(w.nd)) w.nd=[]; if(!Array.isArray(w.bad)) w.bad=[]; ["good","badT","proud"].forEach(f=>{ if(typeof w[f]!=="string") w[f]=""; }); });
  if(!Array.isArray(g.wins)) g.wins=[]; g.wins=g.wins.filter(w=>isObj(w) && typeof w.t==="string" && typeof w.ts==="number");
  if(!isObj(g.progs)) g.progs={};
  Object.keys(g.progs).forEach(k=>{ const p=g.progs[k]; if(!isObj(p)){ delete g.progs[k]; return; } if(!isObj(p.done)) p.done={}; if(!isObj(p.notes)) p.notes={}; });
  return g;
};
const pl = (n,a,b,c) => { const m=n%10, h=n%100; return m===1&&h!==11?a:m>=2&&m<=4&&(h<12||h>14)?b:c; };
const minT = m => m>=60 ? `${Math.floor(m/60)} ч ${m%60} мин` : `${m} мин`;

/* ---------- Навигация ---------- */
const NEW=["grit","gwheel","gval","gweek","gstats","gprg","gwins"];
NEW.forEach(r=>{ if(!GR.includes(r)) GR.push(r); });
Object.assign(PARENT,{grit:"ghab", gwheel:"gpath", gval:"gpath", gweek:"gpath", gstats:"gpath", gprg:"gpath", gwins:"gpath"});

/* ---------- Ритуалы ---------- */
const RT={
  am:{t:"Утро без спешки", steps:["Стакан воды","Три медленных вдоха у окна","Потянуться 2 минуты","Выбрать главный шаг дня","Первые 15 минут без телефона"]},
  day:{t:"Пауза среди дня", steps:["Встать и пройтись 5 минут","Выпить воды","Минуту смотреть вдаль","Три медленных вдоха"]},
  pm:{t:"Вечер для сна", steps:["Телефон на зарядку вне кровати","Записать одну хорошую вещь за день","Подготовить вещи на завтра","Приглушить свет","5 минут дыхания"]}
};
const RK={am:"Утро", day:"День", pm:"Вечер"};
const FREE_RIT=1;
const ritDone = (r,d) => r.steps.length>0 && r.steps.every(s=>(r.days[d]||[]).includes(s.id));
const ritStreak = r => { let d=dayNum(); if(!ritDone(r,d)) d--; let n=0; while(ritDone(r,d)){ n++; d--; } return n; };
const nowKind = () => { const h=new Date().getHours(); return h<12?"am":h<18?"day":"pm"; };
function ritCard(){
  const g=X(); if(!g.rit.length) return `<button class="card rit-card empty" data-go="ghab"><span class="label">Ритуал дня</span><strong>Утро без спешки или вечер для сна</strong><span class="small muted">3–5 простых шагов, которые задают тон дню. Первый ритуал — бесплатно.</span></button>`;
  const k=nowKind(), r=g.rit.find(x=>x.k===k)||g.rit.find(x=>!ritDone(x,dayNum()))||g.rit[0], d=dayNum(), n=(r.days[d]||[]).filter(id=>r.steps.some(s=>s.id===id)).length, st=ritStreak(r);
  return `<button class="card rit-card" data-go="grit" data-sub="${r.id}"><span class="row" style="justify-content:space-between;width:100%"><span class="label">${RK[r.k]} · ритуал</span>${st>1?`<span class="small muted">${st} ${pl(st,"день","дня","дней")} подряд</span>`:""}</span>
    <strong>${esc(r.t)}</strong><span class="progress" style="display:block;width:100%"><i style="width:${r.steps.length?n/r.steps.length*100:0}%"></i></span><span class="small muted">${ritDone(r,d)?"Выполнен сегодня ✓":`${n} из ${r.steps.length} · открыть`}</span></button>`;
}
function ritSection(){
  const g=X(), d=dayNum(), can=plus()||g.rit.length<FREE_RIT, free=Object.keys(RT).filter(k=>!g.rit.some(r=>r.k===k));
  return `<h2 class="h-sec">Ритуалы</h2>
  ${g.rit.length?`<div class="list">${g.rit.map(r=>{ const n=(r.days[d]||[]).length, st=ritStreak(r); return `<button class="li" data-go="grit" data-sub="${r.id}"><span class="ico">${ico(r.k==="pm"?"moon":r.k==="am"?"star":"wind",18)}</span><span class="dt"><strong>${esc(r.t)}</strong><span class="small muted">${RK[r.k]} · ${ritDone(r,d)?"сегодня выполнен ✓":`${Math.min(n,r.steps.length)} из ${r.steps.length}`}${st>1?` · ${st} ${pl(st,"день","дня","дней")} подряд`:""}</span></span><span class="chev">›</span></button>`; }).join("")}</div>`
    :`<p class="small muted">Ритуал — это несколько простых шагов в одно и то же время. Он работает лучше силы воли: решение принято заранее.</p>`}
  ${free.length?(can?`<div class="chips">${free.map(k=>`<button class="chip" data-rnew="${k}">+ ${RT[k].t}</button>`).join("")}</div>`
    :`<button class="banner card plus-banner" data-go="gplus"><span class="bi">${LOCK}</span><span class="bt"><strong>Утро, день и вечер</strong><span class="small muted">Бесплатно — ${FREE_RIT} ритуал. Все три — в Опора+</span></span><span class="chev">›</span></button>`):""}
  <h2 class="h-sec">Привычки</h2>`;
}
function bindRitNew(){
  $$("[data-rnew]").forEach(b=>b.onclick=()=>{ const k=b.dataset.rnew, g=X(); if(!plus() && g.rit.length>=FREE_RIT){ go("gplus"); return; }
    const r={id:uidS(), k, t:RT[k].t, steps:RT[k].steps.map(t=>({id:uidS(), t})), days:{}, created:Date.now()}; g.rit.push(r); save(); toast("Ритуал добавлен — его можно настроить под себя"); go("grit", r.id); });
}
let REDIT=false;
function vRit(){
  const g=X(), r=g.rit.find(x=>x.id===sub); if(!r) return `${gback()}<div class="card"><p>Ритуал не найден</p></div>`;
  const d=dayNum(), arr=r.days[d]||[], st=ritStreak(r), done=ritDone(r,d);
  return `${gback()}<div class="stack-s"><span class="label">${RK[r.k]} · ${r.steps.length} ${pl(r.steps.length,"шаг","шага","шагов")}</span><h1>${esc(r.t)}</h1>${st?`<p class="muted small">${st} ${pl(st,"день","дня","дней")} подряд. Пропуск — не провал: главное, не два подряд.</p>`:`<p class="muted small">Отмечайте шаги по ходу. Порядок можно менять как удобно.</p>`}</div>
  <div class="eve">${r.steps.map((s,k)=>`<label class="eve-step"><input type="checkbox" data-rs="${s.id}"${arr.includes(s.id)?" checked":""}><span class="es-n">${k+1}</span><span class="es-b"><span>${esc(s.t)}</span></span>${REDIT?`<button class="linkbtn small" data-rx="${s.id}" aria-label="Убрать шаг">✕</button>`:""}</label>`).join("")}</div>
  ${done?`<p class="small" style="color:var(--accent)">${ico("check",16)} Ритуал выполнен сегодня</p>`:""}
  ${REDIT?`<div class="card"><span class="label">Настроить</span>
    <label class="field"><span class="small muted">Название</span><input type="text" id="rName" value="${esc(r.t)}" maxlength="40"></label>
    <div class="row" style="flex-wrap:nowrap"><input type="text" id="rIn" placeholder="Новый шаг" aria-label="Новый шаг" maxlength="60" style="flex:1;min-width:0"><button class="btn" id="rAdd" aria-label="Добавить шаг">+</button></div>
    <button class="btn" id="rOk">Готово</button><button class="linkbtn small" id="rDel" style="align-self:center">Удалить ритуал</button></div>`
  :`<button class="btn quiet block" id="rEdit">Настроить шаги</button>`}`;
}
function bindRit(){
  const g=X(), r=g.rit.find(x=>x.id===sub); if(!r) return; const d=dayNum();
  $$("[data-rs]").forEach(b=>b.onchange=()=>{ const a=r.days[d]||(r.days[d]=[]), id=b.dataset.rs, was=ritDone(r,d); const i=a.indexOf(id); if(b.checked&&i<0) a.push(id); if(!b.checked&&i>=0) a.splice(i,1); if(!a.length) delete r.days[d];
    save(); if(!was && ritDone(r,d)){ markDay(); award("res",10); if(window.SND) SND.cue("done"); toast("Ритуал выполнен"); render(); } else if(was!==ritDone(r,d)) render(); });
  $$("[data-rx]").forEach(b=>b.onclick=e=>{ e.preventDefault(); r.steps=r.steps.filter(s=>s.id!==b.dataset.rx); save(); render(); });
  const ed=$("#rEdit"); if(ed) ed.onclick=()=>{ REDIT=true; render(); };
  const add=()=>{ const i=$("#rIn"), v=i.value.trim().slice(0,60); if(!v) return; if(r.steps.length>=8){ toast("Не больше 8 шагов — ритуал должен быть лёгким"); return; } r.steps.push({id:uidS(), t:v}); save(); render(); setTimeout(()=>{ const n=$("#rIn"); if(n) n.focus(); },0); };
  const a=$("#rAdd"); if(a){ a.onclick=add; $("#rIn").onkeydown=e=>{ if(e.key==="Enter") add(); }; }
  const ok=$("#rOk"); if(ok) ok.onclick=()=>{ const n=$("#rName").value.trim(); if(n) r.t=n.slice(0,40); REDIT=false; save(); render(); };
  const del=$("#rDel"); if(del) del.onclick=()=>{ if(del.dataset.sure){ g.rit=g.rit.filter(x=>x.id!==r.id); REDIT=false; save(); go("ghab"); } else { del.dataset.sure="1"; del.textContent="Точно удалить? Нажмите ещё раз"; } };
}

/* ---------- Колесо баланса ---------- */
const WS=["Здоровье","Работа","Деньги","Отношения","Близкие и друзья","Развитие","Отдых","Дом и быт"];
const WA=["Здоровье","Работа","Деньги","Отношения","Отношения","Учёба","Отдых","Дом"];
let WF=null;
function wheelSvg(v, prev){
  const c=150, R=104, n=8, a0=-Math.PI/2-Math.PI/n;
  const pt=(a,r)=>[c+Math.cos(a)*r, c+Math.sin(a)*r];
  const wedge=(i,r,cls)=>{ const a1=a0+i*2*Math.PI/n, a2=a1+2*Math.PI/n, [x1,y1]=pt(a1,r), [x2,y2]=pt(a2,r); return `<path class="${cls}" d="M${c} ${c}L${x1.toFixed(1)} ${y1.toFixed(1)}A${r} ${r} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}Z"/>`; };
  const lab=WS.map((t,i)=>{ const a=a0+(i+.5)*2*Math.PI/n, [x,y]=pt(a,R+18); const anc=Math.abs(x-c)<10?"middle":x<c?"end":"start"; return `<text x="${x.toFixed(1)}" y="${(y+4).toFixed(1)}" text-anchor="${anc}">${t.split(" ")[0]} ${v[i]}</text>`; }).join("");
  return `<svg class="g-wheel" viewBox="0 0 300 300" role="img" aria-label="Колесо баланса: ${WS.map((t,i)=>`${t} ${v[i]} из 10`).join(", ")}">
    ${WS.map((_,i)=>wedge(i,R,"gw-bg")).join("")}
    ${[.2,.4,.6,.8].map(f=>`<circle cx="${c}" cy="${c}" r="${R*f}" class="gw-ring"/>`).join("")}
    ${v.map((x,i)=>wedge(i,R*x/10,"gw-v gw"+i)).join("")}
    ${prev?`<polygon class="gw-prev" points="${prev.map((x,i)=>pt(a0+(i+.5)*2*Math.PI/n,R*x/10).map(z=>z.toFixed(1)).join(",")).join(" ")}"/>`:""}
    ${lab}</svg>`;
}
function vWheel(){
  const g=X(), last=g.wheel[g.wheel.length-1];
  if(WF || !last){ if(!WF) WF=(last?last.v:Array(8).fill(5)).slice();
    return `${gback()}<div class="stack-s"><h1>Колесо баланса</h1><p class="muted small">Оцените, насколько вас устраивает каждая сфера сейчас: 1 — совсем нет, 10 — полностью. Это не экзамен — честно, для себя.</p><p class="src-note">Колесо баланса — инструмент коучинга для самоанализа, а не психологический тест: у него нет норм, только ваша собственная оценка.</p></div>
    <div class="card">${WS.map((t,i)=>`<label class="field gw-sl"><span class="row" style="justify-content:space-between"><span>${t}</span><b id="wv${i}">${WF[i]}</b></span><input type="range" min="1" max="10" step="1" value="${WF[i]}" data-wi="${i}" aria-label="${t}"></label>`).join("")}
    <button class="btn" id="wSave">Построить колесо</button>${last?`<button class="btn quiet" id="wCancel">Отмена</button>`:""}</div>`; }
  const v=last.v, prev=g.wheel.length>1?g.wheel[g.wheel.length-2]:null, low=v.map((x,i)=>({i,x})).sort((a,b)=>a.x-b.x).slice(0,2);
  const days=Math.floor((Date.now()-last.ts)/864e5);
  return `${gback()}<div class="stack-s"><span class="label">${new Date(last.ts).toLocaleDateString("ru-RU",{day:"numeric",month:"long"})}</span><h1>Колесо баланса</h1></div>
  <div class="card gw-card">${wheelSvg(v, plus()&&prev?prev.v:null)}${plus()&&prev?`<p class="small muted" style="text-align:center">Пунктир — прошлое колесо</p>`:""}</div>
  <div class="card"><span class="label">Куда направить внимание</span><p class="small">Не обязательно, чтобы всё было на 10. Важно, чтобы баланс устраивал вас. Начните с одной сферы.</p>
    ${low.map(({i,x})=>`<div class="ip-step"><span class="es-b"><strong>${WS[i]} · ${x}</strong><span class="small muted">Что подняло бы на 1 балл?</span></span><button class="btn quiet sm" data-wg="${i}">Цель</button></div>`).join("")}</div>
  ${prev?(plus()?`<div class="card"><span class="label">С прошлого раза</span>${WS.map((t,i)=>{ const dd=v[i]-prev.v[i]; return dd?`<div class="row" style="justify-content:space-between"><span class="small">${t}</span><span class="small" style="color:${dd>0?"var(--ok)":"var(--muted)"}">${dd>0?"+":""}${dd}</span></div>`:""; }).join("")||`<p class="small muted">Без изменений</p>`}</div>`
    :lockCard("Сравнение с прошлым колесом и история")):""}
  ${plus()&&g.wheel.length>2?`<details class="more"><summary>История · ${g.wheel.length}</summary><div>${g.wheel.slice().reverse().map(w=>`<div class="entry"><span class="dot" style="background:var(--accent)"></span><div class="body"><strong>Среднее ${(w.v.reduce((a,b)=>a+b,0)/8).toFixed(1)}</strong><span class="small muted">${fmtDate(w.ts)}</span></div></div>`).join("")}</div></details>`:""}
  <button class="btn quiet block" id="wNew">${days>=25?"Пора обновить — прошёл месяц":"Оценить заново"}</button>
  <p class="small muted" style="text-align:center">Лучше всего — раз в месяц</p>`;
}
function bindWheel(){
  $$("[data-wi]").forEach(r=>r.oninput=()=>{ WF[+r.dataset.wi]=+r.value; $("#wv"+r.dataset.wi).textContent=r.value; });
  const s=$("#wSave"); if(s) s.onclick=()=>{ X().wheel.push({ts:Date.now(), v:WF.slice()}); WF=null; save(); markDay(); award("aware",10); render(); window.scrollTo(0,0); };
  const c=$("#wCancel"); if(c) c.onclick=()=>{ WF=null; render(); };
  const n=$("#wNew"); if(n) n.onclick=()=>{ WF=X().wheel[X().wheel.length-1].v.slice(); render(); window.scrollTo(0,0); };
  $$("[data-wg]").forEach(b=>b.onclick=()=>{ const i=+b.dataset.wg; N.newGoal(WA[i]); go("gnew"); });
}

/* ---------- Ценности ---------- */
const VAL=["Здоровье","Семья","Любовь","Дружба","Свобода","Развитие","Творчество","Честность","Спокойствие","Безопасность","Признание","Достижения","Достаток","Забота о других","Приключения","Красота","Знания","Смысл","Природа","Юмор","Независимость","Мастерство","Справедливость","Благодарность","Смелость","Ответственность","Порядок","Удовольствие","Влияние","Вклад в мир"];
let VP=null;
const goalsOf = v => G().list.filter(x=>String(x.why||"").includes(`«${v}»`));
function vVal(){
  const g=X();
  if(VP || !g.vals.length){ if(!VP) VP=g.vals.slice();
    return `${gback()}<div class="stack-s"><h1>Мои ценности</h1><p class="muted small">Ценность нельзя достичь, как цель, — по ней можно жить. Выберите до 5 самых важных: без них жизнь теряет вкус. Цели, связанные с ценностями, меньше выжигают.</p></div>
    <div class="card"><span class="label">Выбрано ${VP.length} из 5</span><div class="chips">${VAL.map(v=>`<button class="chip" data-vp="${v}" aria-pressed="${VP.includes(v)}">${v}</button>`).join("")}</div>
    <button class="btn" id="vSave"${VP.length?"":" disabled"}>Сохранить</button>${g.vals.length?`<button class="btn quiet" id="vCancel">Отмена</button>`:""}</div>`; }
  return `${gback()}<div class="stack-s"><h1>Мои ценности</h1><p class="muted small">Ваш компас. Когда сомневаетесь, браться ли за дело, спросите: к какой ценности это ведёт?</p></div>
  ${g.vals.map(v=>{ const gl=goalsOf(v); return `<div class="card val-card"><div class="row" style="justify-content:space-between;flex-wrap:nowrap"><strong class="val-t">${v}</strong><span class="small muted">${gl.length?`${gl.length} ${pl(gl.length,"цель","цели","целей")}`:"нет целей"}</span></div>
    <textarea data-vn="${esc(v)}" maxlength="200" placeholder="Что это значит для меня? Например: «больше времени с детьми»" aria-label="Что значит ${esc(v)}">${esc(g.valNote[v]||"")}</textarea>
    ${gl.length?gl.map(x=>`<button class="linkbtn small" data-go="ggoal" data-sub="${x.id}" style="align-self:flex-start">→ ${esc(x.t)}</button>`).join(""):`<button class="btn quiet sm" data-vg="${esc(v)}" style="align-self:flex-start">Поставить цель ради этого</button>`}</div>`; }).join("")}
  ${g.vals.some(v=>!goalsOf(v).length)&&active().length?`<p class="small muted">Если важная ценность остаётся без единой цели, а время уходит на «надо» — это частый источник выгорания.</p>`:""}
  <button class="btn quiet block" id="vEdit">Изменить выбор</button>`;
}
function bindVal(){
  $$("[data-vp]").forEach(b=>b.onclick=()=>{ const v=b.dataset.vp, i=VP.indexOf(v); if(i>=0) VP.splice(i,1); else if(VP.length<5) VP.push(v); else { toast("Не больше 5 — выберите самое важное"); return; } render(); });
  const s=$("#vSave"); if(s) s.onclick=()=>{ X().vals=VP.slice(); VP=null; save(); markDay(); award("aware",10); render(); window.scrollTo(0,0); };
  const c=$("#vCancel"); if(c) c.onclick=()=>{ VP=null; render(); };
  const e=$("#vEdit"); if(e) e.onclick=()=>{ VP=X().vals.slice(); render(); window.scrollTo(0,0); };
  $$("[data-vn]").forEach(t=>t.oninput=()=>{ X().valNote[t.dataset.vn]=t.value.slice(0,200); save(); });
  $$("[data-vg]").forEach(b=>b.onclick=()=>{ if(!plus() && active().length>=FREE.goals){ go("gnew"); return; } N.newGoal("", `Ради ценности «${b.dataset.vg}»`); go("gnew"); });
}
// Ценности — в шаге «Зачем?» при создании цели
const WHY0=WHY.slice();
const nv=VIEWS.gnew;
VIEWS.gnew=[()=>{ WHY.splice(0,WHY.length, ...X().vals.map(v=>`Ради ценности «${v}»`), ...WHY0); return nv[0](); }, nv[1]];

/* ---------- Итог недели ---------- */
const WB=["Усталость","Много дел","Отвлекался(ась)","Не было сил","Тревога","Болезнь","Непредвиденное","Слишком большие шаги"];
const FREE_WEEK=1;
const targetWeek = () => { const d=dayNum(), ws=weekStart(d), dow=(new Date(d*864e5).getUTCDay()+6)%7, g=X(); return dow<=1 && (g.weeks[ws-7] || !g.weeks[ws]) ? ws-7 : ws; };
function weekStats(ws){
  const g=X(), from=dayTs(ws), to=dayTs(ws+7), inW=t=>t>=from&&t<to, days=[...Array(7)].map((_,i)=>ws+i);
  let steps=0; g.list.forEach(x=>x.steps.forEach(s=>{ if(s.done && s.ts && inW(s.ts)) steps++; }));
  const goals=g.list.filter(x=>x.done && inW(x.done)).length;
  const hab=g.hab.reduce((a,h)=>a+days.filter(k=>hDone(h,k)).length,0);
  const fmin=days.reduce((a,k)=>a+(+g.fmin[k]||(+g.focus[k]||0)*25),0);
  const en=days.map(k=>g.energy[k]).filter(e=>e&&e.v), eAvg=en.length?en.reduce((a,e)=>a+e.v,0)/en.length:0;
  const rit=g.rit.reduce((a,r)=>a+days.filter(k=>ritDone(r,k)).length,0);
  const wins=g.wins.filter(w=>inW(w.ts)).length;
  return {steps, goals, hab, fmin, eAvg, rit, wins};
}
function statGrid(s){
  const cell=(v,t)=>`<div class="st-cell"><b>${v}</b><span class="small muted">${t}</span></div>`;
  return `<div class="st-grid">${cell(s.steps,pl(s.steps,"шаг","шага","шагов"))}${cell(s.hab,"отметок привычек")}${cell(minT(s.fmin),"фокуса")}${cell(s.rit,pl(s.rit,"ритуал","ритуала","ритуалов"))}${s.eAvg?cell(s.eAvg.toFixed(1),"энергия из 5"):""}${s.wins?cell(s.wins,pl(s.wins,"победа","победы","побед")):""}${s.goals?cell(s.goals,pl(s.goals,"цель достигнута","цели достигнуто","целей достигнуто")):""}</div>`;
}
let WR=null;
const wLabel = ws => { const a=new Date(ws*864e5), b=new Date((ws+6)*864e5), o={day:"numeric",month:"long",timeZone:"UTC"}; return a.getUTCMonth()===b.getUTCMonth() ? `${a.getUTCDate()} – ${b.toLocaleDateString("ru-RU",o)}` : `${a.toLocaleDateString("ru-RU",o)} – ${b.toLocaleDateString("ru-RU",o)}`; };
function vWeek(){
  const g=X(), ws=targetWeek(), r=g.weeks[ws], s=weekStats(ws), n=Object.keys(g.weeks).length;
  const locked=!plus() && !r && n>=FREE_WEEK;
  const head=`${gback()}<div class="stack-s"><span class="label">${wLabel(ws)}</span><h1>Итог недели</h1><p class="muted small">10 минут раз в неделю. Мотивация приходит и уходит — система остаётся.</p></div>
  <div class="card"><span class="label">Неделя в цифрах</span>${statGrid(s)}</div>`;
  if(locked) return `${head}${lockCard("Итог каждую неделю и история недель")}<p class="small muted">Первый итог недели — бесплатно, он у вас уже есть.</p>`;
  if(r && !WR) return `${head}
    ${r.good?`<div class="card"><span class="label">Что получилось</span><p>${esc(r.good)}</p></div>`:""}
    ${r.bad.length||r.badT?`<div class="card"><span class="label">Что мешало</span>${r.bad.length?`<div class="chips">${r.bad.map(t=>`<span class="chip" aria-pressed="true">${esc(t)}</span>`).join("")}</div>`:""}${r.badT?`<p class="small">${esc(r.badT)}</p>`:""}</div>`:""}
    ${r.proud?`<div class="card soft"><span class="label">Чем горжусь</span><p>${esc(r.proud)}</p></div>`:""}
    <div class="card"><span class="label">Три шага на следующую неделю</span>${r.next.map((t,i)=>`<label class="hab-row"><input type="checkbox" data-wn="${i}" ${r.nd[i]?"checked":""}><span>${esc(t)}</span></label>`).join("")||`<p class="small muted">Шаги не заданы</p>`}</div>
    <button class="btn quiet block" id="wrEdit">Изменить</button>
    ${plus()&&n>1?`<details class="more"><summary>Прошлые недели · ${n-1}</summary><div>${Object.keys(g.weeks).map(Number).filter(k=>k!==ws).sort((a,b)=>b-a).map(k=>{ const w=g.weeks[k]; return `<div class="entry"><span class="dot" style="background:var(--accent)"></span><div class="body"><strong>${wLabel(k)}</strong><span class="small muted">${esc((w.good||w.proud||"").slice(0,90))||"—"}</span></div></div>`; }).join("")}</div></details>`:""}`;
  if(!WR) WR=r?{good:r.good, bad:r.bad.slice(), badT:r.badT, proud:r.proud, next:[0,1,2].map(i=>r.next[i]||"")}:{good:"", bad:[], badT:"", proud:"", next:["","",""]};
  return `${head}
  <div class="card"><label class="field"><span>Что получилось? Даже маленькое считается</span><textarea id="wrG" maxlength="500">${esc(WR.good)}</textarea></label></div>
  <div class="card"><span class="label">Что мешало</span><div class="chips">${WB.map(t=>`<button class="chip" data-wb="${t}" aria-pressed="${WR.bad.includes(t)}">${t}</button>`).join("")}</div>
    <textarea id="wrB" maxlength="300" placeholder="Своими словами, если хочется" aria-label="Что мешало">${esc(WR.badT)}</textarea>
    ${WR.bad.includes("Слишком большие шаги")?`<p class="small">Совет: на следующей неделе делите шаги так, чтобы каждый занимал 10–30 минут.</p>`:WR.bad.includes("Усталость")||WR.bad.includes("Не было сил")?`<p class="small">Совет: запланируйте отдых так же серьёзно, как дела. Иногда главный шаг недели — выспаться.</p>`:""}</div>
  <div class="card"><label class="field"><span>Чем я горжусь на этой неделе</span><input type="text" id="wrP" maxlength="140" value="${esc(WR.proud)}"></label></div>
  <div class="card"><span class="label">Три главных шага на следующую неделю</span>${[0,1,2].map(i=>`<input type="text" data-wx="${i}" maxlength="100" placeholder="Шаг ${i+1}" aria-label="Шаг ${i+1}" value="${esc(WR.next[i])}">`).join("")}
    <p class="small muted">Они появятся на экране «Сегодня».</p></div>
  <button class="btn block" id="wrSave">Сохранить итог</button>`;
}
function bindWeek(){
  const g=X(), ws=targetWeek(), r=g.weeks[ws];
  $$("[data-wn]").forEach(b=>b.onchange=()=>{ r.nd[+b.dataset.wn]=b.checked; save(); if(b.checked){ markDay(); award("res",5); } });
  const ed=$("#wrEdit"); if(ed) ed.onclick=()=>{ WR=null; WR={good:r.good, bad:r.bad.slice(), badT:r.badT, proud:r.proud, next:[0,1,2].map(i=>r.next[i]||"")}; render(); };
  const keep=()=>{ if(!WR) return; const a=$("#wrG"); if(a) WR.good=a.value; const b=$("#wrB"); if(b) WR.badT=b.value; const p=$("#wrP"); if(p) WR.proud=p.value; $$("[data-wx]").forEach(i=>WR.next[+i.dataset.wx]=i.value); };
  $$("[data-wb]").forEach(b=>b.onclick=()=>{ keep(); const t=b.dataset.wb, i=WR.bad.indexOf(t); if(i>=0) WR.bad.splice(i,1); else WR.bad.push(t); render(); });
  const sv=$("#wrSave"); if(sv) sv.onclick=()=>{ keep(); const old=g.weeks[ws];
    g.weeks[ws]={ts:Date.now(), good:WR.good.trim().slice(0,500), bad:WR.bad.slice(), badT:WR.badT.trim().slice(0,300), proud:WR.proud.trim().slice(0,140), next:WR.next.map(t=>t.trim().slice(0,100)).filter(Boolean), nd:old?old.nd:[]};
    WR=null; save(); if(!old){ markDay(); award("aware",20); if(window.SND) SND.cue("done"); } toast("Итог недели сохранён"); render(); window.scrollTo(0,0); };
}
function weekPlanCard(){
  const g=X(), ks=Object.keys(g.weeks).map(Number).sort((a,b)=>b-a), d=dayNum(), dow=(new Date(d*864e5).getUTCDay()+6)%7;
  const r=ks.length?g.weeks[ks[0]]:null;
  if(r && r.next.length && Date.now()-r.ts<9*864e5){ const k=ks[0];
    return `<div class="card"><div class="row" style="justify-content:space-between"><span class="label">План недели</span><button class="linkbtn small" data-go="gweek">Итог</button></div>${r.next.map((t,i)=>`<label class="hab-row"><input type="checkbox" data-tw="${k}|${i}" ${r.nd[i]?"checked":""}><span>${esc(t)}</span></label>`).join("")}</div>`; }
  if(dow>=4 || (dow<=1 && !g.weeks[weekStart(d)-7] && g.list.length)) return `<button class="card feat feat-g" data-go="gweek"><span class="label">10 минут</span><strong class="feat-t">Подвести итог недели</strong><span class="small">Что получилось, что мешало и три шага на следующую неделю</span><span class="feat-go">Начать →</span></button>`;
  return "";
}

/* ---------- Банка побед ---------- */
let WINR=null;
function vWins(){
  const g=X(), list=g.wins.slice().reverse();
  return `${gback()}<div class="stack-s"><h1>Банка побед</h1><p class="muted small">Записывайте маленькие успехи: позвонил(а), дописал(а), не сорвался(ась), выспался(ась). В трудный день достаньте одну — это противоядие от мысли «я ничего не делаю».</p></div>
  <div class="card"><div class="row" style="flex-wrap:nowrap"><input type="text" id="wiIn" placeholder="Моя победа сегодня" aria-label="Победа" maxlength="140" style="flex:1;min-width:0"><button class="btn" id="wiAdd" aria-label="Добавить победу">+</button></div></div>
  ${list.length>2?`<button class="btn quiet block" id="wiRand">Достать случайную победу</button>`:""}
  ${WINR?`<div class="card soft wi-pick"><span class="label">${fmtDate(WINR.ts)}</span><p class="q-text">${esc(WINR.t)}</p></div>`:""}
  ${list.length?`<div class="card"><span class="label">Побед в банке: ${list.length}</span>${list.slice(0,40).map(w=>`<div class="entry"><span class="dot" style="background:var(--accent)"></span><div class="body"><span>${esc(w.t)}</span><span class="small muted">${fmtDate(w.ts)}</span></div></div>`).join("")}</div>`:`<div class="card"><p class="small muted">Банка пока пуста. Начните с сегодняшнего дня — что-то хорошее точно было.</p></div>`}`;
}
function bindWins(){
  const add=()=>{ const i=$("#wiIn"), v=i.value.trim().slice(0,140); if(!v) return; const g=X(); g.wins.push({ts:Date.now(), t:v}); if(g.wins.length>500) g.wins=g.wins.slice(-500); save(); markDay(); award("self",3); WINR=null; toast("Победа в банке"); render(); };
  $("#wiAdd").onclick=add; $("#wiIn").onkeydown=e=>{ if(e.key==="Enter") add(); };
  const r=$("#wiRand"); if(r) r.onclick=()=>{ const w=X().wins; let p; do p=w[Math.floor(Math.random()*w.length)]; while(w.length>1 && p===WINR); WINR=p; if(window.SND) SND.cue("relax"); render(); };
}

/* ---------- Статистика ---------- */
function vStats(){
  const g=X(), d=dayNum(), ws=weekStart(d), s=weekStats(ws);
  const head=`${gback()}<div class="stack-s"><h1>Статистика</h1><p class="muted small">Видно, что вы на самом деле делаете, — даже когда кажется, что ничего.</p></div>
  <div class="card"><span class="label">Эта неделя</span>${statGrid(s)}</div>`;
  if(!plus()) return `${head}${lockCard("Графики за 12 недель: привычки, фокус, энергия и сон")}`;
  const weeks=[...Array(12)].map((_,i)=>ws-7*(11-i));
  const heat=h=>`<div class="hm" role="img" aria-label="${esc(h.t)}: отметки за 12 недель">${weeks.map(w=>[...Array(7)].map((_,k)=>{ const day=w+k, v=+h.days[day]||0; return `<i class="${day>d?"fut":hDone(h,day)?"on":v?"part":""}"></i>`; }).join("")).join("")}</div>`;
  const fw=weeks.slice(-8).map(w=>[...Array(7)].reduce((a,_,k)=>a+(+g.fmin[w+k]||(+g.focus[w+k]||0)*25),0)), fmx=Math.max(25,...fw);
  const E=Object.entries(g.energy).filter(([,e])=>e&&e.v).map(([k,e])=>({d:+k, v:e.v, p:e.p||[], m:e.m||[]}));
  const byDow=[0,1,2,3,4,5,6].map(i=>{ const a=E.filter(e=>(new Date(e.d*864e5).getUTCDay()+6)%7===i); return a.length?a.reduce((s,e)=>s+e.v,0)/a.length:0; });
  const avg=a=>a.length?a.reduce((s,e)=>s+e.v,0)/a.length:0;
  const slp=E.filter(e=>e.p.includes("Сон")), nsl=E.filter(e=>e.m.includes("Недосып"));
  const totSteps=g.list.reduce((a,x)=>a+x.steps.filter(z=>z.done).length,0), totGoals=g.list.filter(x=>x.done).length;
  const totF=Object.keys(g.focus).reduce((a,k)=>a+(+g.fmin[k]||(+g.focus[k]||0)*25),0);
  const best=g.hab.reduce((m,h)=>{ let run=0, b=0; Object.keys(h.days).map(Number).sort((a,c)=>a-c).forEach((k,i,arr)=>{ if(!hDone(h,k)) return; run=(i&&arr[i-1]===k-1&&hDone(h,k-1))?run+1:1; b=Math.max(b,run); }); return Math.max(m,b); },0);
  const DW=["пн","вт","ср","чт","пт","сб","вс"];
  return `${head}
  <div class="card"><span class="label">За всё время</span><div class="st-grid">
    <div class="st-cell"><b>${totSteps}</b><span class="small muted">${pl(totSteps,"шаг","шага","шагов")} к целям</span></div>
    <div class="st-cell"><b>${totGoals}</b><span class="small muted">${pl(totGoals,"цель","цели","целей")} достигнуто</span></div>
    <div class="st-cell"><b>${minT(totF)}</b><span class="small muted">в фокусе</span></div>
    <div class="st-cell"><b>${best}</b><span class="small muted">${pl(best,"день","дня","дней")} — лучшая серия привычки</span></div></div></div>
  ${g.hab.length?`<div class="card"><span class="label">Привычки за 12 недель</span>${g.hab.map(h=>`<div class="stack-s" style="gap:6px"><strong class="small">${esc(h.t)}</strong>${heat(h)}</div>`).join("")}<p class="small muted">Каждый столбик — неделя, сверху понедельник.</p></div>`:""}
  <div class="card"><span class="label">Фокус по неделям</span><div class="d-bars f-bars">${fw.map((m,i)=>`<span class="db" style="--h:${Math.max(3,m/fmx*100)}%" title="${minT(m)}"><i></i><small>${new Date(weeks[4+i]*864e5).getUTCDate()}</small></span>`).join("")}</div></div>
  ${E.length>=5?`<div class="card"><span class="label">Энергия по дням недели</span><div class="d-bars f-bars">${byDow.map((v,i)=>`<span class="db" style="--h:${Math.max(3,v/5*100)}%" title="${v?v.toFixed(1):"нет данных"}"><i></i><small>${DW[i]}</small></span>`).join("")}</div>
    ${slp.length>=2||nsl.length>=2?`<p class="small">${slp.length>=2?`В дни, когда заряжал сон, энергия в среднем <strong>${avg(slp).toFixed(1)}</strong>`:""}${slp.length>=2&&nsl.length>=2?", а ":""}${nsl.length>=2?`${slp.length>=2?"":"В "}дни недосыпа — <strong>${avg(nsl).toFixed(1)}</strong>`:""} из 5.</p>`:`<p class="small muted">Отмечайте причины энергии на «Сегодня» — здесь появится связь со сном.</p>`}</div>`
    :`<div class="card"><p class="small muted">Отметьте энергию хотя бы 5 дней — появится график по дням недели и связь со сном.</p></div>`}`;
}

/* ---------- Программы ---------- */
const PG=[
 {id:"morning", t:"Утро за 7 дней", s:"Спокойное начало дня без спешки и телефона", days:[
  ["Утро начинается вечером",["Тяжёлое утро чаще всего — следствие позднего вечера. Недосып делает любое утро трудным, как бы хорошо оно ни было спланировано.","Начнём с малого: лечь на 15 минут раньше и убрать телефон из кровати."],"Сегодня лягте на 15 минут раньше. Телефон поставьте заряжаться вне кровати."],
  ["15 минут без телефона",["Первое, что видят многие утром, — сообщения и новости. Мозг сразу переходит в режим реакции на чужие задачи.","Первые 15 минут — только ваши: вода, окно, тишина."],"Завтра не берите телефон первые 15 минут после пробуждения."],
  ["Вода и свет",["Яркий дневной свет утром помогает проснуться и настраивает внутренние часы — так вечером легче уснуть.","Стакан воды после ночи — простой способ мягко запустить день."],"Утром выпейте стакан воды и 5 минут побудьте у открытого окна или на улице."],
  ["Пять минут движения",["Не нужна полноценная тренировка. Пять минут растяжки или прогулки разгоняют кровь и поднимают настроение.","Важнее регулярность, чем интенсивность."],"Подвигайтесь 5 минут утром так, как приятно телу."],
  ["Один главный шаг",["Если день начинается со списка из 20 дел, к вечеру остаётся чувство, что ничего не успели.","Выберите одно главное дело на день до того, как откроете почту и мессенджеры."],"Утром выберите главный шаг дня на экране «Сегодня»."],
  ["Завтрак сидя",["Еда на бегу — сигнал телу, что вы в спешке. Даже 10 минут сидя за столом снижают ощущение гонки.","Можно без телефона: просто еда, вкус и мысли."],"Позавтракайте сидя, без экрана, хотя бы 10 минут."],
  ["Ваш ритуал",["За неделю вы попробовали шесть шагов. Какие-то понравились, какие-то нет — это нормально.","Соберите из того, что сработало, свой утренний ритуал из 3–5 шагов."],"Добавьте ритуал «Утро без спешки» и настройте его под себя.",["ghab",null,"К ритуалам"]]
 ]},
 {id:"detox", t:"Цифровой детокс", s:"Вернуть внимание и время из телефона", days:[
  ["Сколько на самом деле",["Мы почти всегда недооцениваем время в телефоне. Честная цифра — первый шаг.","Не нужно ругать себя: просто посмотрите на данные."],"Откройте в настройках телефона экранное время за неделю и запишите цифру и три самых затратных приложения."],
  ["Тише уведомления",["Каждое уведомление вырывает из дела, и возвращение к сосредоточенности занимает время.","Оставьте уведомления только от людей, а не от приложений."],"Отключите уведомления во всех приложениях, кроме сообщений от близких и важных рабочих."],
  ["Другой главный экран",["Привычка открывать соцсети часто срабатывает автоматически: рука сама тянется к знакомой иконке.","Если убрать её с первого экрана, появляется секунда на выбор."],"Уберите соцсети и игры с первого экрана телефона в папку."],
  ["Спальня без телефона",["Свет экрана и бесконечная лента мешают заснуть и ухудшают сон.","Будильник можно заменить обычным или оставить телефон на зарядке у двери."],"Сегодня оставьте телефон на ночь вне спальни или хотя бы вне досягаемости руки."],
  ["Зоны без экрана",["Еда и разговоры с близкими — лучшие места, чтобы начать.","Когда телефон не лежит на столе, разговор становится глубже."],"Договоритесь с собой или с близкими: за едой телефоны не лежат на столе."],
  ["Можно поскучать",["Скука — не враг. Именно в паузах мозг отдыхает и приходят идеи.","Мы разучились ждать без экрана: в очереди, в транспорте, на остановке."],"Проведите 10 минут без телефона и наушников: прогулка, окно, чай."],
  ["Ваши правила",["Детокс — не отказ от телефона, а возвращение выбора: вы пользуетесь им, а не он вами.","Сравните экранное время с первым днём."],"Запишите три правила, которые оставите себе, и посмотрите, как изменилось экранное время."]
 ]},
 {id:"energy", t:"Энергия без выгорания", s:"14 дней, чтобы научиться беречь силы", days:[
  ["Ваша батарейка",["Энергия — не бесконечный ресурс, а батарейка, которая разряжается и заряжается.","Первый шаг — замечать уровень заряда каждый день."],"Отметьте энергию на экране «Сегодня» и делайте это все 14 дней.",["gtoday",null,"На «Сегодня»"]],
  ["Что заряжает, что забирает",["У каждого свои источники сил и свои «утечки». Их стоит знать в лицо.","Отмечайте причины вместе с уровнем энергии — через неделю появятся закономерности."],"Выпишите по три вещи: что вас заряжает и что забирает силы."],
  ["Сон — основа",["Никакая продуктивность не перекроет хронический недосып.","Помогает одно и то же время отхода ко сну, даже в выходные."],"Выберите время отхода ко сну и придерживайтесь его три дня подряд."],
  ["Микропаузы",["Мозг устаёт от непрерывной работы. Короткие паузы каждые 60–90 минут помогают дольше сохранять ясность.","Пауза — это не телефон, а смена занятия: встать, пройтись, посмотреть вдаль."],"Сегодня делайте 5-минутную паузу каждые полтора часа работы."],
  ["Одно «нет»",["Выгорание часто начинается с бесконечных «да» — чужим просьбам, лишним задачам, ожиданиям.","Отказ — это забота о своих силах, а не эгоизм."],"Откажитесь сегодня от одного дела или просьбы, которые вам не по силам."],
  ["Достаточно хорошо",["Перфекционизм съедает больше всего энергии: последние 20% качества стоят 80% сил.","Для многих задач «достаточно хорошо» — правильная планка."],"Выберите одно дело и сделайте его «на четвёрку», а не «на пятёрку»."],
  ["Первая неделя",["Неделя позади. Посмотрите на отметки энергии: в какие дни её было больше и почему?","Это ваша личная карта сил."],"Подведите итог недели.",["gweek",null,"Итог недели"]],
  ["Движение и природа",["Прогулка на свежем воздухе — один из самых доступных способов восстановиться.","Даже 20 минут среди деревьев снижают напряжение."],"Прогуляйтесь 20 минут, лучше в парке или там, где есть деревья."],
  ["Настоящий отдых",["Листать ленту — не отдых: мозг продолжает получать информацию.","Настоящий отдых — то, после чего становится больше сил: сон, прогулка, хобби, общение с близкими."],"Запланируйте на эту неделю один час настоящего отдыха и защитите его, как важную встречу."],
  ["Упростить и поделиться",["Не всё нужно делать самому и идеально. Что-то можно поручить, упростить или вовсе не делать.","Освободившиеся силы — ваш запас."],"Найдите одно дело, которое можно поручить, упростить или убрать."],
  ["Доброта к себе",["Ругать себя за усталость — значит добавлять нагрузку.","Говорите с собой так, как с близким человеком, который очень устал."],"Напишите себе пару тёплых слов, как другу в трудный период."],
  ["Сверка с ценностями",["Больше всего выжигают дела, которые не связаны с тем, что для вас важно.","Посмотрите на цели: к каким ценностям они ведут?"],"Выберите свои ценности и проверьте, есть ли у каждой хотя бы одна цель.",["gval",null,"Мои ценности"]],
  ["Признаки выгорания",["Апатия, раздражение, плохой сон, ощущение бессмысленности, частые болезни — сигналы не поднажать, а остановиться и пересмотреть нагрузку.","Если признаков много и они держатся неделями, стоит обратиться к специалисту."],"Пройдите тест на выгорание в основном разделе приложения.",["tests",null,"К тестам"]],
  ["План поддержки",["Энергия будет колебаться — это нормально. Важно, что теперь вы знаете свои источники сил и ранние сигналы усталости.","Составьте план: что делать, когда батарейка садится."],"Запишите три действия, которые помогают вам восстановиться, и держите их под рукой."]
 ]}
];
const pst = id => { const g=X(); if(!isObj(g.progs[id])) g.progs[id]={done:{}, notes:{}}; return g.progs[id]; };
const pDone = id => { const p=X().progs[id], P=PG.find(x=>x.id===id); return p&&P ? Object.keys(p.done).filter(k=>+k>=1&&+k<=P.days.length).length : 0; };
const pNext = id => { const P=PG.find(x=>x.id===id), p=X().progs[id]; if(!p) return 1; for(let d=1; d<=P.days.length; d++) if(!p.done[d]) return d; return P.days.length; };
function vPrg(){
  const [id,dn]=String(sub||"morning:1").split(":"), P=PG.find(x=>x.id===id)||PG[0];
  const d=Math.max(1,Math.min(P.days.length,+dn||1)), D=P.days[d-1], st=pst(P.id), k=String(d);
  const nav=`<div class="day-dots">${P.days.map((_,i)=>`<button class="dd${st.done[i+1]?" done":""}${i+1===d?" cur":""}" data-go="gprg" data-sub="${P.id}:${i+1}" aria-label="День ${i+1}">${i+1}</button>`).join("")}</div>`;
  const head=`${gback()}<div class="stack-s"><span class="label">${P.t} · день ${d} из ${P.days.length}</span><h1>${D[0]}</h1></div>${nav}`;
  if(d>1&&!plus()) return `${head}${lockCard("Следующие дни программы")}<p class="small muted">День 1 открыт всем: <button class="linkbtn small" data-go="gprg" data-sub="${P.id}:1" style="display:inline-flex;min-height:0">вернуться к нему</button></p>`;
  const L=D[3];
  return `${head}<article class="stack">${D[1].map(t=>`<p>${t}</p>`).join("")}</article>
  <div class="card"><span class="label">Задание</span><p>${D[2]}</p>${L?`<button class="btn quiet" data-go="${L[0]}"${L[1]?` data-sub="${L[1]}"`:""} style="align-self:flex-start">${L[2]}</button>`:""}
    <textarea id="gqNote" placeholder="Для себя" aria-label="Заметка" maxlength="1000">${esc(st.notes[k]||"")}</textarea>
    ${st.done[k]?`<p class="small" style="color:var(--accent)">${ico("check",16)} Выполнено</p>`:`<button class="btn" id="gqDone">Готово</button>`}</div>
  ${d<P.days.length?`<button class="btn quiet block" data-go="gprg" data-sub="${P.id}:${d+1}">День ${d+1} →</button>`:""}`;
}
function bindPrg(){
  const [id,dn]=String(sub||"morning:1").split(":"), P=PG.find(x=>x.id===id)||PG[0], k=String(Math.max(1,Math.min(P.days.length,+dn||1))), st=pst(P.id);
  const n=$("#gqNote"); if(n) n.oninput=()=>{ st.notes[k]=n.value.slice(0,1000); save(); };
  const b=$("#gqDone"); if(b) b.onclick=()=>{ st.done[k]=Date.now(); save(); markDay(); award("self",15);
    if(pDone(P.id)===P.days.length){ if(window.SND) SND.cue("done"); toast(`Программа «${P.t}» пройдена`); } else toast(`День ${k} выполнен`); render(); };
}

/* ---------- Новые статьи ---------- */
[
 {id:"ritual", t:"Ритуалы вместо силы воли", m:3, p:["Сила воли похожа на мышцу, которая к вечеру устаёт. Поэтому решения, которые приходится принимать заново каждый день, даются всё тяжелее.","Ритуал снимает эту нагрузку: решение принято заранее, остаётся только следовать шагам. Утренний ритуал задаёт тон дню, вечерний — помогает телу понять, что пора отдыхать.","Хороший ритуал короткий: 3–5 шагов и 10–20 минут. Привязывайте его к тому, что уже происходит каждый день: проснулся — стакан воды, почистил зубы — телефон на зарядку.","Пропустили день — не страшно. Ритуал не экзамен, а опора, к которой можно вернуться в любой день."]},
 {id:"values", t:"Цели от ценностей: почему это бережёт силы", m:3, p:["Цель «потому что надо» держится на напряжении. Как только сил становится меньше, она первой превращается в источник вины.","Цель, связанная с тем, что для вас важно, работает иначе: даже трудные шаги ощущаются осмысленными. Это одна из идей терапии принятия и ответственности.","Попробуйте для каждой цели ответить: к какой ценности она ведёт? Если ответа нет, возможно, это чужая цель — родителей, начальника, ленты в соцсетях.","Ценности не нужно выбирать «правильно». Достаточно честно: что для вас действительно важно сейчас."]},
 {id:"rest", t:"Отдых — часть работы", m:3, p:["Многие отдыхают по остаточному принципу: когда всё сделано. Но всё не бывает сделано, и отдых не наступает.","Восстановление — такая же часть продуктивности, как работа. Спортсмены планируют отдых между тренировками, потому что именно в нём растут силы.","Хороший отдых бывает разным: физический (сон, прогулка), умственный (смена занятия, тишина), социальный (тёплое общение) и творческий (хобби).","Запланируйте отдых в календаре заранее — и защищайте его так же, как важную встречу."]}
].forEach(a=>{ if(!GA.some(b=>b.id===a.id)) GA.push(a); });

/* ---------- Сегодня ---------- */
function vToday(){
  const g=X(), h=new Date().getHours(), hi=h<6?"Доброй ночи":h<12?"Доброе утро":h<18?"Добрый день":"Добрый вечер", e=g.energy[dayNum()];
  return `<div class="top"><div class="brand"><div class="logo goals-logo">${nico("gtoday",18)}</div><div><div style="font-weight:700">Опора</div><div class="small muted">цели без выгорания</div></div></div><div class="top-r">${modeSwitch("goals")}<button class="sos-pill" data-go="sos">SOS</button></div></div>
  <div class="stack-s"><h1>${hi}</h1><p class="muted">Маленький шаг — тоже шаг</p></div>
  ${ritCard()}
  ${N.mainCard()}
  ${weekPlanCard()}
  ${N.energyCard()}
  ${e&&e.v<=2&&g.wins.length?`<button class="card soft" data-go="gwins" style="text-align:left"><span class="label">Сил сегодня мало</span><strong>Загляните в банку побед</strong><span class="small muted">У вас там ${g.wins.length} ${pl(g.wins.length,"победа","победы","побед")}. Вы делаете больше, чем кажется.</span></button>`:""}
  ${N.habToday()}
  ${N.mtCard()}`;
}
function bindToday(){
  N.bindToday();
  $$("[data-tw]").forEach(b=>b.onchange=()=>{ const [k,i]=b.dataset.tw.split("|"), r=X().weeks[k]; if(!r) return; r.nd[+i]=b.checked; save(); if(b.checked){ markDay(); award("res",5); toast("Шаг недели сделан"); } });
}

/* ---------- Привычки + ритуалы ---------- */
const vHab0=VIEWS.ghab[0], bHab0=VIEWS.ghab[1];
const vHab = () => { const h=vHab0(), i=h.indexOf("</div>")+6; return h.slice(0,i)+ritSection()+h.slice(i); };
const bindHab = () => { bHab0(); bindRitNew(); };

/* ---------- Путь ---------- */
function vPath(){
  const g=X(), n=Object.keys(g.prog.done).length, lw=g.wheel[g.wheel.length-1];
  const prog=(go,sb,t,s,tot,done)=>`<button class="li" data-go="${go}" data-sub="${sb}"><span class="ico">${nico("gpath",18)}</span><span class="dt"><strong>${t}</strong><span class="small muted">${tot} ${pl(tot,"день","дня","дней")} · ${done?`пройдено ${done}`:"день 1 бесплатно"}</span></span>${done===tot?`<span class="chev" style="color:var(--accent)">${ico("check",18)}</span>`:`<span class="chev">›</span>`}</button>`;
  const totalDays=PD.length+PG.reduce((a,p)=>a+p.days.length,0);
  return `<div class="stack-s"><h1>Путь</h1><p class="muted">Понять себя, выбрать направление и мягко двигаться дальше</p></div>
  <button class="card feat feat-g" data-go="gweek"><span class="label">Раз в неделю · 10 минут</span><strong class="feat-t">Итог недели</strong><span class="small">${g.weeks[targetWeek()]?"Итог подведён — посмотреть":"Что получилось, что мешало и три шага на следующую неделю"}</span><span class="feat-go">Открыть →</span></button>
  <div class="grid2">
    <button class="tile" data-go="gwheel"><span class="ico">${ico("emo")}</span><strong>Колесо баланса</strong><span class="small muted">${lw?`Среднее ${(lw.v.reduce((a,b)=>a+b,0)/8).toFixed(1)} из 10`:"8 сфер жизни"}</span></button>
    <button class="tile" data-go="gval"><span class="ico">${ico("heart")}</span><strong>Ценности</strong><span class="small muted">${g.vals.length?g.vals.slice(0,2).join(", ")+(g.vals.length>2?"…":""):"Ваш компас"}</span></button>
    <button class="tile" data-go="gstats"><span class="ico">${ico("tests")}</span><strong>Статистика</strong><span class="small muted">Привычки, фокус, энергия</span></button>
    <button class="tile" data-go="gwins"><span class="ico">${ico("jar")}</span><strong>Банка побед</strong><span class="small muted">${g.wins.length?`${g.wins.length} ${pl(g.wins.length,"победа","победы","побед")}`:"Маленькие успехи"}</span></button>
  </div>
  <h2 class="h-sec">Программы · ${1+PG.length}</h2>
  <div class="list">
    ${prog("gprog",Math.min(n+1,7),"Перестать откладывать",null,7,n)}
    ${PG.map(p=>prog("gprg",`${p.id}:${pNext(p.id)}`,p.t,p.s,p.days.length,pDone(p.id))).join("")}
  </div>
  <p class="small muted">Всего ${totalDays} ${pl(totalDays,"день","дня","дней")} пошаговой работы.</p>
  <h2 class="h-sec">Инструменты</h2>
  <div class="list">
    ${li("gproc",null,ico("thoughts",18),"Разбор прокрастинации","Чувство, мысль-ловушка, маленький шаг",!plus()&&g.proc.length>=FREE.proc)}
    ${li("gfocus",null,nico("gfocus",18),"Фокус-таймер","Своё время, режим чтения со счётом страниц, звуки",false)}
  </div>
  <h2 class="h-sec">Почитать · ${GA.length}</h2>
  <div class="list">${GA.map((a,i)=>li("gart",a.id,ico("book",18),a.t,`${a.m} мин`,i>0&&!plus())).join("")}</div>
  ${plus()?"":`<button class="banner card plus-banner" data-go="gplus"><span class="bi">${LOCK}</span><span class="bt"><strong>Открыть всё — Опора+</strong><span class="small muted">Ритуалы, статистика, итоги недели, ${1+PG.length} программы</span></span><span class="chev">›</span></button>`}
  <div class="card"><p class="small">Не получается сдвинуться с места, хотя очень хочется? Иногда за этим стоит что-то важное — разберём на консультации.</p><button class="btn" data-go="about" data-sub="book" style="align-self:flex-start">Записаться к ${esc(PSY.nameTo)}</button></div>
  <button class="btn quiet block" data-go="home">← Вернуться в Опору для себя</button>`;
}

/* ---------- Опора+ ---------- */
const vPlus0=VIEWS.gplus[0];
function vPlus(){
  const totalDays=PD.length+PG.reduce((a,p)=>a+p.days.length,0);
  const row=t=>`<li>${ico("check",18)}<span>${t}</span></li>`;
  const list=`<div class="card"><span class="label">Цели без выгорания</span><ul class="plus-list">
    ${row("<strong>Ритуалы утра, дня и вечера</strong> — готовые и свои")}
    ${row("<strong>Итог недели</strong> каждую неделю и история всех недель")}
    ${row("<strong>Статистика:</strong> привычки за 12 недель, фокус по неделям, связь энергии и сна")}
    ${row(`<strong>${1+PG.length} программы — ${totalDays} дней:</strong> откладывание, утро, цифровой детокс, энергия без выгорания`)}
    ${row("<strong>Без ограничений:</strong> цели, привычки, разборы прокрастинации")}
    ${row(`<strong>Все ${GA.length} статей</strong> и история колеса баланса`)}
  </ul></div>
  ${plus()?"":`<div class="card"><span class="label">Бесплатно всем</span><p class="small">${FREE.goals} цели и ${FREE.hab} привычки, 1 ритуал, фокус-таймер, колесо баланса, ценности, банка побед, первый итог недели, день 1 каждой программы.</p></div>`}`;
  return vPlus0().replace(/<div class="card"><span class="label">Цели без выгорания<\/span><ul class="plus-list">[\s\S]*?<\/ul><\/div>/, list);
}

/* ---------- Регистрация ---------- */
Object.assign(VIEWS,{gtoday:[vToday,bindToday], ghab:[vHab,bindHab], gpath:[vPath,null], gplus:[vPlus,VIEWS.gplus[1]],
  grit:[vRit,bindRit], gwheel:[vWheel,bindWheel], gval:[vVal,bindVal], gweek:[vWeek,bindWeek], gstats:[vStats,null], gprg:[vPrg,bindPrg], gwins:[vWins,bindWins]});
NEW.forEach(r=>TAB_OF[r]="practices");
N.X=X; N.PG=PG;
})();
