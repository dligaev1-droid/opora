/* «Цели без выгорания» — третий режим (Опора+): цели от ценностей, мягкие привычки, фокус-таймер,
   энергия дня, разбор прокрастинации, программа «Перестать откладывать», «Тропа к вершине».
   Свой зелёный цвет и своё нижнее меню. Доступ к Опора+ общий с «Отношениями». */
(function(){
"use strict";
const LV = window.LOVE;
const plus = () => !!(LV && LV.plus());
const LOCK='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
const isObj = x => !!x && typeof x==="object" && !Array.isArray(x);
// Проверка и починка данных раздела: повреждённые записи отбрасываются, а не ломают экраны
const G = () => {
  if(!isObj(S.goals)) S.goals={};
  const g=S.goals;
  if(!Array.isArray(g.list)) g.list=[];
  g.list=g.list.filter(x=>isObj(x) && typeof x.t==="string" && x.id!=null);
  g.list.forEach(x=>{ x.id=String(x.id); if(!Array.isArray(x.steps)) x.steps=[]; x.steps=x.steps.filter(s=>isObj(s) && typeof s.t==="string"); x.steps.forEach(s=>{ if(s.id==null) s.id=uid(); s.id=String(s.id); }); });
  if(!Array.isArray(g.hab)) g.hab=[];
  g.hab=g.hab.filter(h=>isObj(h) && typeof h.t==="string" && h.id!=null);
  g.hab.forEach(h=>{ h.id=String(h.id); if(!isObj(h.days)) h.days={}; Object.keys(h.days).forEach(k=>{ const v=+h.days[k]; if(!(v>0)) delete h.days[k]; else h.days[k]=v; });
    h.n=Math.max(1,Math.min(20,Math.round(+h.n)||1)); h.w=Math.max(1,Math.min(7,Math.round(+h.w)||7)); });
  if(!Array.isArray(g.proc)) g.proc=[]; g.proc=g.proc.filter(isObj);
  ["focus","energy","fmin"].forEach(k=>{ if(!isObj(g[k])) g[k]={}; });
  Object.keys(g.energy).forEach(k=>{ const e=g.energy[k]; if(!isObj(e)||typeof e.v!=="number") delete g.energy[k]; else { if(!Array.isArray(e.p)) e.p=[]; if(!Array.isArray(e.m)) e.m=[]; } });
  if(!isObj(g.prog)) g.prog={done:{},notes:{}};
  if(!isObj(g.prog.done)) g.prog.done={}; if(!isObj(g.prog.notes)) g.prog.notes={};
  if(g.main!=null && !isObj(g.main)) delete g.main;
  return g;
};
// Номер дня по местной дате (ключ без часового пояса: день k — это UTC-полночь k*864e5)
const dayNum = (t=Date.now()) => { const d=new Date(t); return Math.round(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5); };
const dayTs = k => { const u=new Date(k*864e5); return new Date(u.getUTCFullYear(),u.getUTCMonth(),u.getUTCDate()).getTime(); };
const FREE={goals:3, hab:3, proc:3};
const hDone = (h,k) => (+h.days[k]||0) >= (h.n||1);
const weekStart = (d=dayNum()) => d-((new Date(d*864e5).getUTCDay()+6)%7);
const active = () => G().list.filter(x=>!x.done);

/* ---------- Навигация, шапка, общие куски ---------- */
const GR=["gtoday","ggoals","ghab","gfocus","gpath","ggoal","gnew","gproc","gprog","gart","gplus"];
const PARENT={ggoal:"ggoals",gnew:"ggoals",gproc:"gpath",gprog:"gpath",gart:"gpath",gplus:"gpath"};
const ROOT=["gtoday","ggoals","ghab","gfocus","gpath"];
const NAVI={
  gtoday:'<path d="M3 20h18M6 20l6-10 6 10M12 10V4l4 2-4 2"/>',
  ggoals:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".8" fill="currentColor"/>',
  ghab:'<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4M16 3v4M8 13l3 3 5-6"/>',
  gfocus:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/>',
  gpath:'<path d="M5 20c5 0 3-7 8-7s3-7 7-7"/><circle cx="5" cy="20" r="1.6"/><circle cx="20" cy="6" r="1.6"/>'
};
const NAV=[["gtoday","Сегодня"],["ggoals","Цели"],["ghab","Привычки"],["gfocus","Фокус"],["gpath","Путь"]];
const BL={gtoday:"Сегодня",ggoals:"Цели",ghab:"Привычки",gfocus:"Фокус",gpath:"Путь"};
const nico = (k,sz=22) => `<svg viewBox="0 0 24 24" width="${sz}" height="${sz}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${NAVI[k]}</svg>`;
const gback = () => ROOT.includes(route) ? "" : `<button class="back" data-go="${PARENT[route]||"gtoday"}">← ${BL[PARENT[route]||"gtoday"]}</button>`;
const lockCard = what => `<div class="card plus-lock"><span class="pl-ico">${LOCK}</span><h3>${what}</h3><p class="small muted">Доступно в Опора+</p><button class="btn" data-go="gplus">Подробнее</button></div>`;
const li = (go, sb, icon, t, s, locked) => `<button class="li" data-go="${go}"${sb?` data-sub="${sb}"`:""}><span class="ico">${icon}</span><span class="dt"><strong>${t}</strong><span class="small muted">${s}</span></span>${locked?`<span class="plus-tag sm">${LOCK}</span>`:`<span class="chev">›</span>`}</button>`;

// подключаемся к общим переключателям режимов
const prevRoom=window.ROOM_OF||(()=>"");
window.ROOM_OF = r => GR.includes(r) ? "goals" : prevRoom(r);
const prevNav=window.ROOM_NAV;
window.ROOM_NAV = r => { if(!GR.includes(r)) return prevNav?prevNav(r):""; const cur=ROOT.includes(r)?r:(PARENT[r]||"gtoday"); return NAV.map(([k,t])=>`<button data-go="${k}" ${cur===k?'aria-current="page"':''}>${nico(k)}<span>${t}</span></button>`).join(""); };
window.modeSwitch = cur => `<div class="mode-sw" role="group" aria-label="Режим"><button data-go="home" aria-pressed="${cur==="me"}">Я</button><button data-go="love" aria-pressed="${cur==="we"}">Мы</button><button data-go="gtoday" aria-pressed="${cur==="goals"}">Цели</button></div>`;
window.roomsRow = () => `<div class="rooms"><button class="room-card rc-love" data-go="love"><span class="rc-ico">${ico("heart",18)}</span><strong>Отношения</strong><span class="small">Близость, ссоры, свидания</span></button><button class="room-card rc-goals" data-go="gtoday"><span class="rc-ico">${nico("gtoday",18)}</span><strong>Цели</strong><span class="small">Без выгорания и «надо»</span></button></div>`;

/* ---------- Тропа к вершине ---------- */
const CAMPS=[[0,"Подножие"],[5,"Лесная тропа"],[15,"Первый привал"],[30,"Перевал"],[60,"Альпийский луг"],[100,"Снежник"],[160,"Вершина"]];
const LAP=160;
function points(){
  const g=G(); let p=0;
  g.list.forEach(x=>{ p+=x.steps.filter(s=>s.done).length*3; if(x.done) p+=10; });
  g.hab.forEach(h=>p+=Object.keys(h.days).filter(k=>hDone(h,k)).length);
  Object.values(g.focus).forEach(n=>p+=(+n||0)*2);
  p+=Object.keys(g.prog.done||{}).length*3 + g.proc.length*2 + Object.keys(g.energy).length;
  return p;
}
const PATH=[[40,186],[120,178],[70,160],[160,148],[110,128],[190,114],[150,96],[214,80],[186,62],[232,44],[244,26]];
function along(f){ const seg=[]; let tot=0; for(let i=1;i<PATH.length;i++){ const d=Math.hypot(PATH[i][0]-PATH[i-1][0],PATH[i][1]-PATH[i-1][1]); seg.push(d); tot+=d; }
  let need=f*tot; for(let i=0;i<seg.length;i++){ if(need<=seg[i]){ const t=need/seg[i]; return [PATH[i][0]+(PATH[i+1][0]-PATH[i][0])*t, PATH[i][1]+(PATH[i+1][1]-PATH[i][1])*t]; } need-=seg[i]; } return PATH[PATH.length-1]; }
function campOf(p){ const q=p%LAP; let c=0; CAMPS.forEach((x,i)=>{ if(q>=x[0]) c=i; }); return c; }
function mountain(){
  const p=points(), lap=Math.floor(p/LAP), q=p%LAP, f=q/LAP, [mx,my]=along(f), id="mt"+(mountain.n=(mountain.n||0)+1);
  const camps=CAMPS.slice(1).map(([v])=>along(v/LAP));
  return `<svg viewBox="0 0 360 200" class="mt-svg" role="img" aria-label="Тропа к вершине: ${CAMPS[campOf(p)][1]}">
  <defs><linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--mt-sky1)"/><stop offset="1" stop-color="var(--mt-sky2)"/></linearGradient></defs>
  <rect width="360" height="200" fill="url(#${id}s)"/>
  <path d="M-10 200 L70 120 L110 140 L170 70 L210 100 L250 20 L300 90 L330 70 L380 200Z" fill="var(--mt-far)"/>
  <path d="M244 26 L232 44 L254 46Z M250 20 L270 48 L262 50 L250 38 L238 52 L230 46Z" fill="var(--mt-snow)"/>
  <path d="M-10 200 L40 160 L90 175 L150 150 L200 172 L260 150 L380 185 L380 200Z" fill="var(--mt-near)"/>
  <polyline points="${PATH.map(x=>x.join(",")).join(" ")}" fill="none" stroke="var(--mt-path)" stroke-width="2.2" stroke-dasharray="4 5" stroke-linecap="round"/>
  ${camps.map(([x,y],i)=>`<g transform="translate(${x} ${y})"><rect x="-.8" y="-12" width="1.6" height="12" fill="var(--mt-pole)"/><path d="M.8 -12 L9 -9 L.8 -6Z" fill="${q>=CAMPS[i+1][0]?"var(--accent)":"var(--mt-flag)"}"/></g>`).join("")}
  <circle cx="${mx}" cy="${my}" r="9" fill="var(--accent)" opacity=".22"/><circle cx="${mx}" cy="${my}" r="5" fill="var(--accent)" stroke="#fff" stroke-width="2"/>
  ${lap?`<text x="16" y="24" class="mt-lap">Вершин: ${lap}</text>`:""}
  </svg>`;
}
function mtCard(){
  const p=points(), c=campOf(p), q=p%LAP, nx=CAMPS[c+1];
  return `<div class="card mt-card"><div class="mt-wrap">${mountain()}</div><div class="row" style="justify-content:space-between"><span class="stack-s" style="gap:2px"><span class="label">Тропа к вершине</span><strong>${CAMPS[c][1]}</strong></span><span class="small muted" style="text-align:right">${nx?`До «${nx[1]}»: ${nx[0]-q} ${plural(nx[0]-q,"шаг","шага","шагов")}`:"Вершина! Дальше — новая"}</span></div>
  <p class="small muted">Каждый сделанный шаг продвигает вас вверх. Назад тропа не ведёт — даже после паузы.</p></div>`;
}

/* ---------- Сегодня ---------- */
const CHG=["Сон","Прогулка","Спорт","Общение","Природа","Хобби","Тишина","Вкусная еда"];
const DRN=["Недосып","Конфликты","Переработка","Соцсети","Шум","Спешка","Болезнь","Тревога"];
let EOPEN=false;
function energyCard(){
  const e=G().energy[dayNum()];
  const ins=energyInsight();
  return `<div class="card"><span class="label">Энергия сегодня</span>
    <div class="batt" role="group" aria-label="Уровень энергии">${[1,2,3,4,5].map(v=>`<button class="bt-v${e&&e.v>=v?" on":""}" data-ev="${v}" aria-label="${v} из 5" aria-pressed="${!!(e&&e.v===v)}"><i></i></button>`).join("")}</div>
    ${e&&!EOPEN&&!(e.p||[]).length&&!(e.m||[]).length?`<button class="linkbtn small" id="eOpen" style="align-self:flex-start">+ Добавить причины: что заряжает и что забирает силы</button>`:""}
    ${e&&(EOPEN||(e.p||[]).length||(e.m||[]).length)?`<div class="stack-s"><span class="small muted">Что заряжает</span><div class="chips">${CHG.map(t=>`<button class="chip" data-ep="${t}" aria-pressed="${(e.p||[]).includes(t)}">${t}</button>`).join("")}</div>
      <span class="small muted">Что забирает силы</span><div class="chips">${DRN.map(t=>`<button class="chip" data-em="${t}" aria-pressed="${(e.m||[]).includes(t)}">${t}</button>`).join("")}</div></div>`:`<p class="small muted">Отметьте, сколько сегодня сил. Трудное лучше делать, когда их больше.</p>`}
    ${ins}</div>`;
}
function energyInsight(){
  const E=Object.values(G().energy).filter(x=>x&&x.v); if(E.length<5) return "";
  const hi=E.filter(x=>x.v>=4), cnt={}; hi.forEach(x=>(x.p||[]).forEach(t=>cnt[t]=(cnt[t]||0)+1));
  const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1]).slice(0,2).map(x=>x[0].toLowerCase());
  return top.length?`<p class="small">В дни, когда сил больше, чаще всего было: <strong>${top.join(" и ")}</strong>.</p>`:"";
}
function nextSteps(){ const out=[]; active().forEach(g=>{ const s=g.steps.find(x=>!x.done); if(s) out.push({g,s}); }); return out; }
function mainCard(){
  const g=G(), d=dayNum(), m=g.main&&g.main.d===d?g.main:null;
  if(m){ const goal=g.list.find(x=>x.id===m.gid), st=goal&&goal.steps.find(x=>x.id===m.sid);
    if(goal&&st) return `<div class="card main-step${st.done?" done":""}"><span class="label">Главный шаг дня</span><label class="ms-row"><input type="checkbox" id="msDone" ${st.done?"checked":""}><span><strong>${esc(st.t)}</strong><span class="small muted">${esc(goal.t)}</span></span></label>
      ${st.done?`<p class="small">Сделано. Остальное сегодня — по желанию.</p>`:`<button class="btn quiet" data-go="gfocus" data-sub="${esc(st.t.slice(0,60))}">Фокус 25 минут на этом шаге</button>`}</div>`; }
  const ns=nextSteps();
  if(!ns.length) return `<button class="card main-step empty" data-go="${active().length?"ggoals":"gnew"}"><span class="label">Главный шаг дня</span><strong>${active().length?"Добавьте следующий шаг к цели":"Поставьте первую цель"}</strong><span class="small muted">Один маленький шаг в день лучше большого рывка раз в месяц</span></button>`;
  return `<div class="card main-step"><span class="label">Выберите главный шаг дня</span><div class="opts">${ns.slice(0,3).map(({g:goal,s})=>`<button class="opt" data-ms="${goal.id}|${s.id}"><span><strong>${esc(s.t)}</strong><br><span class="small muted">${esc(goal.t)}</span></span></button>`).join("")}</div></div>`;
}
function habToday(){
  const hab=G().hab; if(!hab.length) return "";
  const d=dayNum();
  return `<div class="card"><div class="row" style="justify-content:space-between"><span class="label">Привычки сегодня</span><button class="linkbtn small" data-go="ghab">Все</button></div>
  ${hab.slice(0,5).map(h=>h.n>1?`<div class="hab-row hab-cnt"><span class="hc-t">${esc(h.t)}</span><span class="hc-c"><button class="hc-b" data-hm="${h.id}" aria-label="Минус">−</button><b>${+h.days[d]||0}/${h.n}</b><button class="hc-b" data-hp="${h.id}" aria-label="Плюс">+</button></span></div>`
    :`<label class="hab-row"><input type="checkbox" data-ht="${h.id}" ${hDone(h,d)?"checked":""}><span>${esc(h.t)}</span></label>`).join("")}</div>`;
}
function vToday(){
  const h=new Date().getHours(), hi=h<6?"Доброй ночи":h<12?"Доброе утро":h<18?"Добрый день":"Добрый вечер";
  return `<div class="top"><div class="brand"><div class="logo goals-logo">${nico("gtoday",18)}</div><div><div style="font-weight:700">Опора</div><div class="small muted">цели без выгорания</div></div></div><div class="top-r">${modeSwitch("goals")}<button class="sos-pill" data-go="sos">SOS</button></div></div>
  <div class="stack-s"><h1>${hi}</h1><p class="muted">Маленький шаг — тоже шаг</p></div>
  ${mainCard()}
  ${energyCard()}
  ${habToday()}
  ${mtCard()}`;
}
function bindToday(){
  const g=G(), d=dayNum();
  $$("[data-ms]").forEach(b=>b.onclick=()=>{ const [gid,sid]=b.dataset.ms.split("|"); g.main={d,gid,sid}; save(); render(); });
  const md=$("#msDone"); if(md) md.onchange=()=>{ const goal=g.list.find(x=>x.id===g.main.gid), st=goal&&goal.steps.find(x=>x.id===g.main.sid); if(st){ stepToggle(goal,st,md.checked); } render(); };
  $$("[data-ev]").forEach(b=>b.onclick=()=>{ const e=g.energy[d]||(g.energy[d]={v:0,p:[],m:[]}); const first=!e.v; e.v=+b.dataset.ev; save(); if(first){ markDay(); award("res",3); } render(); });
  const tog=(k,v)=>{ const e=g.energy[d]; if(!e) return; const a=e[k]||(e[k]=[]); const i=a.indexOf(v); if(i>=0) a.splice(i,1); else a.push(v); save(); render(); };
  const eo=$("#eOpen"); if(eo) eo.onclick=()=>{ EOPEN=true; render(); };
  $$("[data-ep]").forEach(b=>b.onclick=()=>tog("p",b.dataset.ep));
  $$("[data-em]").forEach(b=>b.onclick=()=>tog("m",b.dataset.em));
  $$("[data-ht]").forEach(b=>b.onchange=()=>{ habSet(b.dataset.ht, d, b.checked); render(); });
  bindCnt();
}

/* ---------- Цели ---------- */
const AREAS=["Здоровье","Работа","Деньги","Отношения","Учёба","Творчество","Дом","Отдых"];
const WHY=["Чтобы чувствовать себя лучше","Чтобы было спокойнее","Чтобы расти","Ради близких","Чтобы было интересно","Чтобы гордиться собой"];
function stepToggle(goal, st, on){
  st.done=on; st.ts=on?Date.now():null; save();
  if(on){ markDay(); award("res",8); toast("Шаг сделан"); if(goal.steps.length && goal.steps.every(s=>s.done)) setTimeout(()=>toast("Все шаги готовы — можно отметить цель достигнутой"),400); }
}
function vGoals(){
  const a=active(), done=G().list.filter(x=>x.done);
  const card=x=>{ const n=x.steps.length, k=x.steps.filter(s=>s.done).length;
    return `<button class="card goal-card" data-go="ggoal" data-sub="${x.id}"><span class="row" style="justify-content:space-between;width:100%"><span class="label">${esc(x.area||"Цель")}</span>${x.due?`<span class="small muted">до ${new Date(x.due).toLocaleDateString("ru-RU",{day:"numeric",month:"short"})}</span>`:""}</span>
      <strong class="gc-t">${esc(x.t)}</strong>${x.why?`<span class="small muted">Зачем: ${esc(x.why)}</span>`:""}
      <span class="progress" style="display:block;width:100%"><i style="width:${n?k/n*100:0}%"></i></span><span class="small muted">${n?`${k} из ${n} шагов`:"Добавьте первый шаг"}</span></button>`; };
  const canAdd=plus()||a.length<FREE.goals;
  return `<div class="stack-s"><h1>Цели</h1><p class="muted">Начинаем с «зачем», а не с «надо»</p></div>
  ${a.length?a.map(card).join(""):`<div class="card"><p>Целей пока нет. Начните с одной — самой важной на ближайший месяц.</p></div>`}
  ${canAdd?`<button class="btn block" data-go="gnew">+ Новая цель</button>`:lockCard(`Больше ${FREE.goals} целей одновременно`)}
  ${done.length?`<details class="more"><summary>Достигнутые · ${done.length}</summary><div>${done.map(x=>`<div class="entry"><span class="dot" style="background:var(--accent)"></span><div class="body"><strong>${esc(x.t)}</strong><span class="small muted">${fmtDate(x.done)}</span></div></div>`).join("")}</div></details>`:""}`;
}
let NG={i:0, area:"", why:"", t:"", step:"", due:""};
function vNew(){
  if(!plus() && active().length>=FREE.goals) return `${gback()}${lockCard(`Больше ${FREE.goals} целей одновременно`)}`;
  const steps=[
    ["Какая сфера?","",`<div class="chips">${AREAS.map(a=>`<button class="chip" data-na="${a}" aria-pressed="${NG.area===a}">${a}</button>`).join("")}</div>`],
    ["Зачем это вам?","Цель «потому что надо» быстро выжигает. Цель «потому что важно» держит.",`<div class="chips">${WHY.map(w=>`<button class="chip" data-nw="${w}" aria-pressed="${NG.why===w}">${w}</button>`).join("")}</div><input type="text" id="ngWhy" placeholder="Или своими словами" aria-label="Зачем" value="${esc(WHY.includes(NG.why)?"":NG.why)}" maxlength="120">`],
    ["Сформулируйте цель","Конкретно и по силам. Не «стать здоровым», а «гулять 3 раза в неделю».",`<input type="text" id="ngT" placeholder="Например: выучить 500 английских слов" aria-label="Цель" value="${esc(NG.t)}" maxlength="120">`],
    ["Первый шаг на 10 минут","Настолько маленький, что смешно не сделать.",`<input type="text" id="ngS" placeholder="Например: скачать приложение со словами" aria-label="Первый шаг" value="${esc(NG.step)}" maxlength="120">`],
    ["К какому сроку? (необязательно)","Срок помогает, но не должен давить. Можно оставить пустым.",`<input type="date" id="ngD" value="${esc(NG.due)}" aria-label="Срок">`]
  ];
  const [t,h,body]=steps[NG.i];
  return `${gback()}<div class="stack-s"><span class="label">Новая цель · ${NG.i+1} из 5</span><div class="progress"><i style="width:${NG.i*20}%"></i></div></div>
  <div class="card"><h3>${t}</h3>${h?`<p class="small muted">${h}</p>`:""}${body}
  <div class="row"><button class="btn quiet" id="ngBack" ${NG.i?"":"disabled"}>Назад</button><button class="btn" id="ngNext">${NG.i===4?"Сохранить цель":"Дальше"}</button></div></div>`;
}
function bindNew(){
  $$("[data-na]").forEach(b=>b.onclick=()=>{ NG.area=b.dataset.na; NG.i++; render(); });
  $$("[data-nw]").forEach(b=>b.onclick=()=>{ NG.why=b.dataset.nw; render(); });
  const keep=()=>{ const w=$("#ngWhy"); if(w&&w.value.trim()) NG.why=w.value.trim(); const t=$("#ngT"); if(t) NG.t=t.value.trim(); const s=$("#ngS"); if(s) NG.step=s.value.trim(); const d=$("#ngD"); if(d) NG.due=d.value; };
  const bk=$("#ngBack"); if(bk) bk.onclick=()=>{ keep(); if(NG.i>0){ NG.i--; render(); } };
  const nx=$("#ngNext"); if(nx) nx.onclick=()=>{ keep();
    if(NG.i===2 && !NG.t){ toast("Напишите цель"); return; }
    if(NG.i===3 && !NG.step){ toast("Придумайте самый маленький шаг"); return; }
    if(NG.i<4){ NG.i++; render(); return; }
    const id=uid(); G().list.push({id, t:NG.t, why:NG.why, area:NG.area, due:NG.due||"", created:Date.now(), done:null, steps:[{id:uid(), t:NG.step, done:false}]});
    save(); markDay(); award("self",10); NG={i:0,area:"",why:"",t:"",step:"",due:""}; toast("Цель поставлена"); go("ggoal", id);
  };
}
function vGoal(){
  const x=G().list.find(y=>y.id===sub); if(!x) return `${gback()}<div class="card"><p>Цель не найдена</p></div>`;
  const k=x.steps.filter(s=>s.done).length, n=x.steps.length;
  return `${gback()}
  <div class="stack-s"><span class="label">${esc(x.area||"Цель")}</span><h1>${esc(x.t)}</h1>${x.why?`<p class="muted">Зачем: ${esc(x.why)}</p>`:""}</div>
  <div class="progress"><i style="width:${n?k/n*100:0}%"></i></div>
  <div class="card"><span class="label">Шаги · ${k} из ${n}</span>
    ${x.steps.map(s=>`<div class="entry wish"><label class="wl"><input type="checkbox" data-st="${s.id}" ${s.done?"checked":""}><span class="small" style="${s.done?"text-decoration:line-through;color:var(--muted)":""}">${esc(s.t)}</span></label><button class="linkbtn small" data-sx="${s.id}" aria-label="Удалить шаг">✕</button></div>`).join("")}
    <div class="row" style="flex-wrap:nowrap"><input type="text" id="sIn" placeholder="Следующий маленький шаг" aria-label="Новый шаг" maxlength="120" style="flex:1;min-width:0"><button class="btn" id="sAdd" aria-label="Добавить шаг">+</button></div>
  </div>
  <button class="btn quiet block" data-go="gproc">Застряли? Разобрать, что мешает</button>
  ${x.done?"":`<button class="btn block" id="gDone">Цель достигнута</button>`}
  <button class="linkbtn small" id="gDel" style="align-self:center">Удалить цель</button>`;
}
function bindGoal(){
  const x=G().list.find(y=>y.id===sub); if(!x) return;
  $$("[data-st]").forEach(b=>b.onchange=()=>{ const s=x.steps.find(y=>y.id===b.dataset.st); if(s){ stepToggle(x,s,b.checked); render(); } });
  $$("[data-sx]").forEach(b=>b.onclick=()=>{ x.steps=x.steps.filter(y=>y.id!==b.dataset.sx); save(); render(); });
  const add=()=>{ const v=$("#sIn").value.trim(); if(!v) return; x.steps.push({id:uid(), t:v, done:false}); save(); render(); setTimeout(()=>{ const i=$("#sIn"); if(i) i.focus(); },0); };
  $("#sAdd").onclick=add; $("#sIn").onkeydown=e=>{ if(e.key==="Enter") add(); };
  const d=$("#gDone"); if(d) d.onclick=()=>{ x.done=Date.now(); save(); markDay(); award("self",30); toast("Цель достигнута! Вы молодец"); go("ggoals"); };
  const del=$("#gDel"); if(del) del.onclick=()=>{ if(del.dataset.sure){ G().list=G().list.filter(y=>y.id!==x.id); save(); go("ggoals"); } else { del.dataset.sure="1"; del.textContent="Точно удалить? Нажмите ещё раз"; } };
}

/* ---------- Привычки ---------- */
const HT=[["Стакан воды",8,7],["Прогулка 15 минут",1,7],["Лечь до 23:30",1,7],["Без телефона за час до сна",1,7],["5 минут дыхания",1,7],["Читать 10 страниц",1,7],["Тренировка",1,3],["Записать одну благодарность",1,7]];
let HN={n:1, w:7, t:""};
const WD=["вс","пн","вт","ср","чт","пт","сб"];
function habSet(id, d, on){ const h=G().hab.find(x=>x.id===id); if(!h) return; if(on){ if(!hDone(h,d)){ h.days[d]=h.n; markDay(); award("res",3); } } else delete h.days[d]; save(); }
function habInc(id, d, dv){ const h=G().hab.find(x=>x.id===id); if(!h) return; const was=hDone(h,d), v=Math.max(0,Math.min(h.n,(+h.days[d]||0)+dv)); if(v) h.days[d]=v; else delete h.days[d]; if(!was && hDone(h,d)){ markDay(); award("res",3); toast("Норма на сегодня выполнена"); } save(); }
function bindCnt(){ const d=dayNum(); $$("[data-hp]").forEach(b=>b.onclick=()=>{ habInc(b.dataset.hp,d,1); render(); }); $$("[data-hm]").forEach(b=>b.onclick=()=>{ habInc(b.dataset.hm,d,-1); render(); }); }
const freqT = h => h.w<7 ? `${h.w} ${plural(h.w,"раз","раза","раз")} в неделю` : "каждый день";
function vHab(){
  const hab=G().hab, d=dayNum(), canAdd=plus()||hab.length<FREE.hab;
  const week=[...Array(7)].map((_,i)=>d-6+i);
  return `<div class="stack-s"><h1>Привычки</h1><p class="muted">Пропустить день — нормально. Главное — не два подряд.</p></div>
  ${hab.length?hab.map(h=>{ const m30=Object.keys(h.days).filter(k=>+k>d-30&&hDone(h,k)).length, missY=h.w===7&&!hDone(h,d-1)&&!hDone(h,d)&&Object.keys(h.days).length;
    const ws=weekStart(d), wk=Object.keys(h.days).filter(k=>+k>=ws&&+k<=d&&hDone(h,k)).length;
    return `<div class="card hab-card"><div class="row" style="justify-content:space-between;flex-wrap:nowrap"><span class="stack-s" style="gap:2px;min-width:0"><strong>${esc(h.t)}</strong><span class="small muted">${freqT(h)}${h.n>1?` · ${h.n} за день`:""}</span></span><button class="linkbtn small" data-hx="${h.id}" aria-label="Удалить привычку">✕</button></div>
      ${h.n>1?`<div class="hab-row hab-cnt"><span class="hc-t small">Сегодня</span><span class="hc-c"><button class="hc-b" data-hm="${h.id}" aria-label="Минус">−</button><b>${+h.days[d]||0}/${h.n}</b><button class="hc-b" data-hp="${h.id}" aria-label="Плюс">+</button></span></div>`:""}
      <div class="hab-week">${week.map(k=>{ const v=+h.days[k]||0, on=hDone(h,k); return `<button class="hw${on?" on":v?" part":""}${k===d?" today":""}" data-hd="${h.id}|${k}" aria-pressed="${on}" aria-label="${WD[new Date(k*864e5).getUTCDay()]}"><span>${WD[new Date(k*864e5).getUTCDay()]}</span><i>${on?"✓":v?v:""}</i></button>`; }).join("")}</div>
      <span class="small muted">${h.w<7?`На этой неделе: ${Math.min(wk,h.w)} из ${h.w}${wk>=h.w?" — норма недели выполнена":""}`:`За 30 дней: ${m30} ${plural(m30,"раз","раза","раз")}${missY?" · вчера пропуск — сегодня отличный день вернуться":""}`}</span></div>`; }).join(""):`<div class="card"><p>Начните с одной маленькой привычки. Лучше простая каждый день, чем сложная раз в неделю.</p></div>`}
  ${canAdd?`<div class="card"><span class="label">Новая привычка</span><div class="row" style="flex-wrap:nowrap"><input type="text" id="hIn" placeholder="Своя привычка" aria-label="Новая привычка" maxlength="60" style="flex:1;min-width:0" value="${esc(HN.t)}"><button class="btn" id="hAdd" aria-label="Добавить привычку">+</button></div>
    <div class="stack-s"><span class="small muted">Как часто</span><div class="chips">${[[7,"Каждый день"],[5,"5 раз в неделю"],[3,"3 раза в неделю"],[1,"Раз в неделю"]].map(([w,t])=>`<button class="chip" data-hw="${w}" aria-pressed="${HN.w===w}">${t}</button>`).join("")}</div>
    <div class="hab-row hab-cnt"><span class="hc-t small muted">Сколько раз за день</span><span class="hc-c"><button class="hc-b" id="hnM" aria-label="Меньше">−</button><b>${HN.n}</b><button class="hc-b" id="hnP" aria-label="Больше">+</button></span></div></div>
    <span class="small muted">Или выберите готовую</span>
    <div class="chips">${HT.filter(([t])=>!hab.some(h=>h.t===t)).slice(0,6).map(([t,n,w])=>`<button class="chip" data-hs="${t}|${n}|${w}">${t}${n>1?` · ${n}`:""}${w<7?` · ${w}×/нед`:""}</button>`).join("")}</div></div>`:lockCard(`Больше ${FREE.hab} привычек`)}`;
}
function bindHab(){
  const add=(t,n,w)=>{ t=String(t||"").trim().slice(0,60); if(!t) return; const g=G(); if(!plus()&&g.hab.length>=FREE.hab){ toast(`Без Опора+ — до ${FREE.hab} привычек`); return; } g.hab.push({id:uid(), t, n:n||HN.n, w:w||HN.w, days:{}, created:Date.now()}); HN={n:1,w:7,t:""}; save(); render(); };
  const hi=$("#hIn"); if(hi) hi.oninput=()=>{ HN.t=hi.value; };
  $$("[data-hw]").forEach(b=>b.onclick=()=>{ HN.w=+b.dataset.hw; render(); });
  const nm=$("#hnM"); if(nm) nm.onclick=()=>{ HN.n=Math.max(1,HN.n-1); render(); };
  const np=$("#hnP"); if(np) np.onclick=()=>{ HN.n=Math.min(20,HN.n+1); render(); };
  bindCnt();
  const a=$("#hAdd"); if(a){ a.onclick=()=>add($("#hIn").value); $("#hIn").onkeydown=e=>{ if(e.key==="Enter") add($("#hIn").value); }; }
  $$("[data-hs]").forEach(b=>{ const [t,n,w]=b.dataset.hs.split("|"); b.onclick=()=>add(t,+n,+w); });
  $$("[data-hd]").forEach(b=>b.onclick=()=>{ const [id,k]=b.dataset.hd.split("|"); const h=G().hab.find(x=>x.id===id); habSet(id, +k, !(h&&hDone(h,k))); render(); });
  $$("[data-hx]").forEach(b=>b.onclick=()=>{ if(b.dataset.sure){ G().hab=G().hab.filter(x=>x.id!==b.dataset.hx); save(); render(); } else { b.dataset.sure="1"; b.textContent="Удалить?"; } });
}

/* ---------- Фокус ---------- */
let FT={min:25, end:0, left:25*60, run:false, brk:false, label:"", snd:""}, fTimer=null;
const SNDS=[["","Тишина"],["rain","Дождь"],["noise","Шум"],["forest","Лес"]];
function fmt(s){ s=Math.max(0,Math.ceil(s)); return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`; }
function ring(){ const tot=FT.min*60, f=FT.run||FT.left<tot?1-FT.left/tot:0, R=88, C=2*Math.PI*R;
  return `<svg viewBox="0 0 200 200" class="f-ring" aria-hidden="true"><circle cx="100" cy="100" r="${R}" class="fr-bg"/><circle cx="100" cy="100" r="${R}" class="fr-fg" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-f)}" transform="rotate(-90 100 100)"/></svg>`; }
function vFocus(){
  if(sub && !FT.run){ FT.label=String(sub).slice(0,80); sub=null; }
  const today=+(G().focus[dayNum()]||0);
  return `<div class="stack-s"><h1>Фокус</h1><p class="muted">Одно дело, без отвлечений. Телефон — экраном вниз.</p></div>
  <div class="card f-card">
    <div class="f-wrap">${ring()}<div class="f-mid"><span class="f-time" id="fTime">${fmt(FT.left)}</span><span class="small muted">${FT.brk?"перерыв":FT.run?"фокус":"готовы?"}</span></div></div>
    ${FT.run?"":`<div class="chips f-min">${[10,25,45].map(m=>`<button class="chip" data-fm="${m}" aria-pressed="${FT.min===m&&!FT.brk}">${m} мин</button>`).join("")}</div>
      <input type="text" id="fLab" placeholder="Над чем работаете? (необязательно)" aria-label="Над чем работаете" value="${esc(FT.label)}" maxlength="80">`}
    ${FT.run&&FT.label?`<p class="f-lab">${esc(FT.label)}</p>`:""}
    <button class="btn block" id="fGo">${FT.run?"Остановить":FT.brk?"Начать перерыв":"Начать"}</button>
    <div class="stack-s"><span class="small muted">Звук на фон</span><div class="chips">${SNDS.map(([k,t])=>`<button class="chip" data-fs="${k}" aria-pressed="${FT.snd===k}">${t}</button>`).join("")}</div></div>
  </div>
  ${FT.run?`<button class="btn quiet block" id="fFull">На весь экран</button>`:""}
  <p class="small muted" style="text-align:center">Сегодня ${today} ${plural(today,"сессия","сессии","сессий")} фокуса</p>
  ${focusWeek()}
  ${FT.full&&FT.run?`<div class="f-full" role="dialog" aria-label="Фокус на весь экран"><span class="label">${FT.brk?"Перерыв":"Фокус"}</span>${FT.label?`<p class="f-lab">${esc(FT.label)}</p>`:""}<span class="f-time" id="fTime2">${fmt(FT.left)}</span><button class="btn quiet" id="fExit">Свернуть</button></div>`:""}`;
}
function focusWeek(){ const g=G(), d=dayNum(), days=[...Array(7)].map((_,i)=>d-6+i), mins=days.map(k=>+g.fmin[k]||(+g.focus[k]||0)*25), tot=mins.reduce((a,b)=>a+b,0), mx=Math.max(25,...mins);
  if(!tot) return "";
  return `<div class="card"><span class="label">Фокус за неделю · ${tot>=60?`${Math.floor(tot/60)} ч ${tot%60} мин`:`${tot} мин`}</span><div class="d-bars f-bars">${days.map((k,i)=>`<span class="db" style="--h:${Math.max(3,mins[i]/mx*100)}%" title="${mins[i]} мин"><i></i><small>${WD[new Date(k*864e5).getUTCDay()]}</small></span>`).join("")}</div></div>`; }
function tick(){
  FT.left=(FT.end-Date.now())/1000;
  const t=document.getElementById("fTime"); if(t) t.textContent=fmt(FT.left);
  const t2=document.getElementById("fTime2"); if(t2) t2.textContent=fmt(FT.left);
  const fg=document.querySelector(".fr-fg"); if(fg){ const C=2*Math.PI*88; fg.setAttribute("stroke-dashoffset", C*(FT.left/(FT.min*60))); }
  if(FT.left<=0){ clearInterval(fTimer); fTimer=null; FT.run=false; FT.full=false; if(window.SND) SND.cue("done");
    if(FT.brk){ FT.brk=false; FT.min=25; FT.left=25*60; toast("Перерыв окончен"); }
    else { const g=G(), d=dayNum(); g.focus[d]=(+g.focus[d]||0)+1; g.fmin[d]=(+g.fmin[d]||0)+FT.min; save(); markDay(); award("res",10); FT.brk=true; FT.min=5; FT.left=5*60; toast("Сессия фокуса завершена. Отдохните 5 минут"); }
    if(route==="gfocus") render();
  }
}
function bindFocus(){
  $$("[data-fm]").forEach(b=>b.onclick=()=>{ FT.min=+b.dataset.fm; FT.left=FT.min*60; FT.brk=false; render(); });
  const lb=$("#fLab"); if(lb) lb.oninput=()=>{ FT.label=lb.value; };
  $("#fGo").onclick=()=>{
    if(FT.run){ clearInterval(fTimer); fTimer=null; FT.run=false; FT.full=false; FT.brk=false; FT.left=FT.min*60; render(); return; }
    FT.run=true; FT.end=Date.now()+FT.left*1000; if(window.SND) SND.cue("tense"); fTimer=setInterval(tick, 500); render();
  };
  const ff=$("#fFull"); if(ff) ff.onclick=()=>{ FT.full=true; render(); };
  const fx=$("#fExit"); if(fx) fx.onclick=()=>{ FT.full=false; render(); };
  $$("[data-fs]").forEach(b=>b.onclick=()=>{ const k=b.dataset.fs; if(window.SND && SND.play){ if(FT.snd) SND.stopOne(FT.snd); if(k) SND.play(k); } FT.snd=k; render(); });
}

/* ---------- Путь: программа, разбор прокрастинации, статьи ---------- */
const PD=[
  {t:"Это не лень", p:["Мы откладываем не из-за лени, а чтобы не встречаться с неприятным чувством: скукой, тревогой, страхом ошибиться.","Откладывание даёт облегчение прямо сейчас — и счёт с процентами потом. Понять, от какого чувства вы убегаете, — первый шаг."], task:"Выпишите три дела, которые откладываете. Рядом с каждым — чувство, которое возникает, когда о нём думаете."},
  {t:"Правило 10 минут", p:["Начать — самое трудное. Мозг пугается всей задачи целиком.","Договоритесь с собой: только 10 минут, потом можно остановиться. Чаще всего вы продолжите."], task:"Выберите одно дело и сделайте только первые 10 минут. Можно через «Фокус» на 10 минут."},
  {t:"Мысли-ловушки", p:["«Надо идеально», «сделаю, когда будет настроение», «у меня всё равно не получится» — эти мысли звучат как правда, но это привычки мышления.","Их можно заметить и ответить им, как ответили бы другу."], task:"Найдите свою главную мысль-ловушку и напишите ей ответ. Помогает «Разбор прокрастинации»."},
  {t:"Среда сильнее силы воли", p:["Сила воли быстро заканчивается. Обстановка работает всегда.","Уберите то, что отвлекает, и подготовьте то, что помогает начать."], task:"На время одной сессии фокуса уберите телефон в другую комнату и закройте лишние вкладки."},
  {t:"Энергия, а не время", p:["Час, когда вы бодры, стоит трёх, когда вы выжаты.","Трудное — на пик энергии. Рутину — на спад."], task:"Три дня подряд замечайте, когда у вас больше всего сил: утром, днём или вечером. Это и есть ваш пик."},
  {t:"Доброта вместо кнута", p:["Кажется, что ругать себя полезно. Исследования показывают обратное: самокритика усиливает откладывание, а прощение себя за прошлую неудачу его снижает.","Говорите с собой так, как говорили бы с близким человеком, который застрял."], task:"Напишите себе короткое письмо как другу, который откладывает важное дело. Что бы вы ему сказали?"},
  {t:"Система на будущее", p:["Мотивация приходит и уходит. Система остаётся.","Раз в неделю: что получилось, что мешало, какие три шага главные на следующую неделю."], task:"Составьте план следующей недели: три главных шага и когда вы их сделаете."}
];
const PT=[["Скука","Сделать дело интереснее: музыка, таймер-соревнование, награда после."],["Тревога","Тревога уменьшается от действия. Самый маленький шаг снижает её сильнее, чем размышления."],["Страх ошибки","Первая версия имеет право быть плохой. Её задача — существовать, а не быть идеальной."],["Не знаю, с чего начать","Достаточно знать только первый шаг. Остальное станет понятнее по ходу."],["Усталость","Возможно, сейчас нужен отдых, а не сила воли. Отдохните — и вернитесь на 10 минут."],["Слишком много всего","Выберите одно. Остальное подождёт — ничего не рухнет за 25 минут."]];
const PM=[["«Должно быть идеально»","Сделанное лучше идеального. Сначала черновик — потом улучшу."],["«Сделаю, когда будет настроение»","Настроение часто приходит после начала, а не до."],["«У меня всё равно не получится»","Я не знаю этого заранее. Проверю на маленьком шаге."],["«Это слишком долго»","Мне не нужно делать всё сразу. Только 10 минут."],["«Потом будет проще»","Потом будет так же — только меньше времени."]];
let PR={i:0, task:"", feel:"", thought:"", step:""};
function vProc(){
  const g=G(), locked=!plus() && g.proc.length>=FREE.proc;
  if(locked && PR.i===0) return `${gback()}<div class="stack-s"><h1>Разбор прокрастинации</h1></div>${lockCard("Новые разборы")}`;
  if(PR.i<4){
    const body=[
      ["Что вы откладываете?",`<input type="text" id="prIn" placeholder="Например: отчёт для начальника" aria-label="Что откладываю" value="${esc(PR.task)}" maxlength="120">`],
      ["Что вы чувствуете, когда думаете об этом?",`<div class="opts">${PT.map(([t])=>`<button class="opt${PR.feel===t?" sel":""}" data-pf="${t}">${t}</button>`).join("")}</div>`],
      ["Какая мысль мешает начать?",`<div class="opts">${PM.map(([t])=>`<button class="opt${PR.thought===t?" sel":""}" data-pm="${t}">${t}</button>`).join("")}</div>`],
      ["Самый маленький шаг на 10 минут",`<input type="text" id="prIn" placeholder="Например: открыть файл и написать заголовок" aria-label="Маленький шаг" value="${esc(PR.step)}" maxlength="120">`]
    ][PR.i];
    return `${gback()}<div class="stack-s"><h1>Разбор прокрастинации</h1><div class="progress"><i style="width:${PR.i*25}%"></i></div></div>
    <div class="card"><span class="label">Шаг ${PR.i+1} из 4</span><h3>${body[0]}</h3>${body[1]}
    <div class="row"><button class="btn quiet" id="prBack" ${PR.i?"":"disabled"}>Назад</button>${PR.i===1||PR.i===2?"":`<button class="btn" id="prNext">${PR.i===3?"Готово":"Дальше"}</button>`}</div></div>`;
  }
  const fe=PT.find(x=>x[0]===PR.feel), th=PM.find(x=>x[0]===PR.thought);
  return `${gback()}<div class="stack-s"><span class="label">${esc(PR.task)}</span><h1>Что поможет</h1></div>
  ${fe?`<div class="card"><span class="label">Чувство: ${esc(fe[0])}</span><p>${fe[1]}</p></div>`:""}
  ${th?`<div class="card"><span class="label">Мысль ${esc(th[0])}</span><p><strong>Ответ:</strong> ${th[1]}</p></div>`:""}
  <div class="card soft"><span class="label">Ваш шаг</span><p class="q-text">${esc(PR.step)}</p><button class="btn" data-go="gfocus" data-sub="${esc(PR.step.slice(0,80))}" id="prFocus">Начать — 10 минут фокуса</button></div>
  <button class="btn quiet block" id="prNew">Новый разбор</button>`;
}
function bindProc(){
  const keep=()=>{ const i=$("#prIn"); if(!i) return; if(PR.i===0) PR.task=i.value.trim(); if(PR.i===3) PR.step=i.value.trim(); };
  $$("[data-pf]").forEach(b=>b.onclick=()=>{ PR.feel=b.dataset.pf; PR.i++; render(); });
  $$("[data-pm]").forEach(b=>b.onclick=()=>{ PR.thought=b.dataset.pm; PR.i++; render(); });
  const bk=$("#prBack"); if(bk) bk.onclick=()=>{ keep(); if(PR.i>0){ PR.i--; render(); } };
  const nx=$("#prNext"); if(nx) nx.onclick=()=>{ keep(); if(PR.i===0&&!PR.task){ toast("Напишите, что откладываете"); return; } if(PR.i===3&&!PR.step){ toast("Придумайте маленький шаг"); return; }
    PR.i++; if(PR.i===4){ G().proc.push({ts:Date.now(), task:PR.task, feel:PR.feel, thought:PR.thought, step:PR.step}); save(); markDay(); award("aware",15); } render(); };
  const pf=$("#prFocus"); if(pf) pf.addEventListener("click",()=>{ FT.min=10; FT.left=600; FT.brk=false; }, true);
  const nw=$("#prNew"); if(nw) nw.onclick=()=>{ PR={i:0,task:"",feel:"",thought:"",step:""}; render(); };
}
function vProg(){
  const d=Math.max(1,Math.min(7,+sub||1)), D=PD[d-1], st=G().prog, k=String(d);
  const nav=`<div class="day-dots">${PD.map((_,i)=>`<button class="dd${st.done[i+1]?" done":""}${i+1===d?" cur":""}" data-go="gprog" data-sub="${i+1}" aria-label="День ${i+1}">${i+1}</button>`).join("")}</div>`;
  if(d>1&&!plus()) return `${gback()}<div class="stack-s"><span class="label">Перестать откладывать · день ${d}</span><h1>${D.t}</h1></div>${nav}${lockCard("Следующие дни программы")}`;
  return `${gback()}<div class="stack-s"><span class="label">Перестать откладывать · день ${d} из 7</span><h1>${D.t}</h1></div>${nav}
  <article class="stack">${D.p.map(t=>`<p>${t}</p>`).join("")}</article>
  <div class="card"><span class="label">Задание</span><p>${D.task}</p><textarea id="gpNote" placeholder="Для себя" aria-label="Заметка">${esc(st.notes[k]||"")}</textarea>
  ${st.done[k]?`<p class="small" style="color:var(--accent)">${ico("check",16)} Выполнено</p>`:`<button class="btn" id="gpDone">Готово</button>`}</div>
  ${d<7?`<button class="btn quiet block" data-go="gprog" data-sub="${d+1}">День ${d+1} →</button>`:""}`;
}
function bindProg(){
  const d=String(Math.max(1,Math.min(7,+sub||1))), st=G().prog;
  const n=$("#gpNote"); if(n) n.oninput=()=>{ st.notes[d]=n.value; save(); };
  const b=$("#gpDone"); if(b) b.onclick=()=>{ st.done[d]=Date.now(); save(); markDay(); award("self",20); toast(`День ${d} выполнен`); render(); };
}
const GA=[
  {id:"lazy", t:"Почему мы откладываем — и это не лень", m:3, p:["Прокрастинация — это не про управление временем, а про управление чувствами. Мы откладываем дела, которые вызывают скуку, тревогу, сомнение или страх оценки.","Откладывание работает как обезболивающее: прямо сейчас становится легче. Но потом приходят вина, спешка и ещё больше тревоги — и дело становится ещё неприятнее. Круг замыкается.","Что помогает: назвать чувство («мне тревожно, что получится плохо»), уменьшить шаг до 10 минут и обращаться с собой бережно. Ругань не мотивирует — она добавляет то самое неприятное чувство, от которого хочется сбежать.","Если откладывается почти всё и давно, а сил нет даже на любимое — это может быть не прокрастинация, а выгорание или подавленность. Пройдите тест на выгорание и обсудите это со специалистом."]},
  {id:"burn", t:"Цели, которые не выжигают", m:3, p:["Цели выжигают, когда их слишком много, когда они про «надо» и «должен» и когда в них нет места отдыху.","Начинайте с ценности: зачем мне это? Цель, которая связана с тем, что для вас важно, даёт силы. Цель «потому что все так делают» — забирает.","Держите одновременно одну-три цели. Делите их на шаги, которые можно сделать за 10–30 минут. Планируйте отдых так же серьёзно, как работу.","Тревожные признаки: апатия, раздражение, плохой сон, ощущение, что всё бессмысленно. Это сигнал не поднажать, а пересмотреть цели и нагрузку."]},
  {id:"back", t:"Как вернуться после срыва", m:2, p:["Срыв — не провал, а часть любого изменения. Почти никто не меняет привычки по прямой.","Работает правило «не пропускать дважды»: один пропуск — случайность, два подряд — начало новой привычки, уже ненужной.","Не ждите понедельника. Вернитесь сегодня — но с шагом поменьше. Если раньше было 30 минут, начните с 5.","И спросите себя без упрёка: что помешало? Возможно, шаг был слишком большим или время неудобным. Это не слабость — это информация для настройки."]}
];
function vArt(){
  const i=Math.max(0,GA.findIndex(a=>a.id===sub)), a=GA[i];
  if(i>0&&!plus()) return `${gback()}<div class="stack-s"><h1>${a.t}</h1></div>${lockCard("Статья доступна в Опора+")}`;
  return `${gback()}<article class="stack"><div class="stack-s"><span class="label">${a.m} мин чтения</span><h1>${a.t}</h1></div>${a.p.map(t=>`<p>${t}</p>`).join("")}</article>
  <div class="card soft"><p class="small">Если чувствуете, что сил нет совсем, — это повод поговорить со специалистом.</p><button class="btn" data-go="about" data-sub="book" style="align-self:flex-start">Записаться к ${esc(PSY.nameTo)}</button></div>`;
}
function vPath(){
  const n=Object.keys(G().prog.done).length;
  return `<div class="stack-s"><h1>Путь</h1><p class="muted">Понять, что мешает, и мягко двигаться дальше</p></div>
  <button class="card feat feat-g" data-go="gprog" data-sub="${Math.min(n+1,7)}"><span class="label">Программа · 7 дней</span><strong class="feat-t">Перестать откладывать</strong><span class="small">${n?`Пройдено ${n} из 7`:"Почему мы откладываем и что с этим делать. День 1 бесплатно."}</span><span class="feat-go">${n?"Продолжить →":"Начать →"}</span></button>
  <div class="stack-s"><span class="label">Инструменты</span><div class="list">
    ${li("gproc",null,ico("thoughts",18),"Разбор прокрастинации","Чувство, мысль-ловушка, маленький шаг",!plus()&&G().proc.length>=FREE.proc)}
    ${li("gfocus",null,nico("gfocus",18),"Фокус-таймер","10, 25 или 45 минут со звуками",false)}
  </div></div>
  <div class="stack-s"><span class="label">Почитать</span><div class="list">${GA.map((a,i)=>li("gart",a.id,ico("book",18),a.t,`${a.m} мин`,i>0&&!plus())).join("")}</div></div>
  ${plus()?"":`<button class="banner card plus-banner" data-go="gplus"><span class="bi">${LOCK}</span><span class="bt"><strong>Открыть всё — Опора+</strong><span class="small muted">Цели и отношения без ограничений</span></span><span class="chev">›</span></button>`}
  <div class="card"><p class="small">Не получается сдвинуться с места, хотя очень хочется? Иногда за этим стоит что-то важное — разберём на консультации.</p><button class="btn" data-go="about" data-sub="book" style="align-self:flex-start">Записаться к ${esc(PSY.nameTo)}</button></div>
  <button class="btn quiet block" data-go="home">← Вернуться в Опору для себя</button>`;
}
/* Опора+ в зелёном режиме */
const fnv = s => { let h=0x811c9dc5; for(const c of s){ h^=c.charCodeAt(0); h=Math.imul(h,16777619)>>>0; } return h.toString(16); };
function vGPlus(){
  return `${gback()}<div class="stack-s"><h1>Опора+</h1><p class="muted">Два мира в одной подписке</p></div>
  <div class="card"><span class="label">Цели без выгорания</span><ul class="plus-list">
    <li>${ico("check",18)}<span>Сколько угодно целей и привычек</span></li>
    <li>${ico("check",18)}<span>Программа «Перестать откладывать» целиком</span></li>
    <li>${ico("check",18)}<span>Разборы прокрастинации без ограничений и все статьи</span></li></ul></div>
  <div class="card"><span class="label">Отношения</span><ul class="plus-list">
    <li>${ico("check",18)}<span>Программы, свидания-сюрпризы, график «Погода в паре»</span></li>
    <li>${ico("check",18)}<span>Тесты и игры для пары, скрипты трудных разговоров</span></li></ul></div>
  ${plus()?`<div class="card soft"><p><strong>Опора+ подключена</strong></p><p class="small muted">Спасибо, что поддерживаете проект.</p></div>`:
  `<div class="card soft"><p><strong>Подписка скоро появится</strong></p><p class="small">Хотите доступ одним из первых — напишите ${esc(PSY.nameTo)}.</p>${PSY.telegram?`<a class="btn" href="https://t.me/${encodeURIComponent(PSY.telegram)}" target="_blank" rel="noopener" style="align-self:flex-start">Написать в Telegram</a>`:""}</div>
  <div class="card"><label class="field"><span>У меня есть код доступа</span><div class="row" style="flex-wrap:nowrap"><input type="text" id="gpCode" autocomplete="off" autocapitalize="characters" style="flex:1;min-width:0"><button class="btn" id="gpGo">Ввести</button></div></label></div>`}`;
}
function bindGPlus(){
  const b=$("#gpGo"); if(!b) return;
  const f=()=>{ const v=$("#gpCode").value.trim().toUpperCase(); if(!v) return; if((PSY.plusCodes||[]).includes(fnv(v))){ LV.L().plus=true; save(); toast("Опора+ подключена"); render(); } else toast("Код не подошёл"); };
  b.onclick=f; $("#gpCode").onkeydown=e=>{ if(e.key==="Enter") f(); };
}

/* ---------- Регистрация ---------- */
Object.assign(VIEWS,{gtoday:[vToday,bindToday], ggoals:[vGoals,null], gnew:[vNew,bindNew], ggoal:[vGoal,bindGoal], ghab:[vHab,bindHab], gfocus:[vFocus,bindFocus], gpath:[vPath,null], gproc:[vProc,bindProc], gprog:[vProg,bindProg], gart:[vArt,null], gplus:[vGPlus,bindGPlus]});
GR.forEach(r=>TAB_OF[r]="practices");
window.GOALS={G, plus, LOCK, isObj, gback, lockCard, li, nico, GR, ROOT, PARENT, NAV, NAVI, BL, dayNum, dayTs, weekStart, active, hDone, FREE, WD, AREAS, WHY, PD, GA,
  mainCard, energyCard, habToday, mtCard, points, bindToday, bindCnt, stepToggle,
  newGoal:(area,why)=>{ NG={i:area?1:0, area:area||"", why:why||"", t:"", step:"", due:""}; }};
})();
