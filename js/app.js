const PSY = window.PSY;
const PROGRAMS = window.PROGRAMS, ART = window.ARTICLES, TIPS = window.TIPS;

/* ===== Хранилище на устройстве ===== */
const KEY = "opora_v1";
const empty = () => ({moods:[], thoughts:[], tests:[], notes:[], demoCleared:false, days:[],
  programs:{}, activeProgram:null, relief:[], grat:null, badges:[], read:[], cardLog:[]});
let S = empty();
function load(){
  try{ const raw = localStorage.getItem(KEY); if(raw) S = Object.assign(empty(), JSON.parse(raw)); }catch(e){}
  if(!Array.isArray(S.days)) S.days=[];
  if(!S.programs) S.programs={};
  // перенос старой версии с одной программой
  if(S.program && S.program.done){ S.programs.calm7 = S.program; if(Object.keys(S.program.done).length) S.activeProgram="calm7"; delete S.program; }
  // банка благодарностей: забираем «хорошее» из старых записей дневника
  if(!Array.isArray(S.grat)){ S.grat = S.moods.filter(m=>m.good).map(m=>({id:uid(), text:m.good, ts:m.ts})); }
  ["relief","badges","read","moods","thoughts","tests","notes","cardLog"].forEach(k=>{ if(!Array.isArray(S[k])) S[k]=[]; });
  if(!Array.isArray(S.grat)) S.grat=[];
  if(!S.programs||typeof S.programs!=="object") S.programs={};
  if(S.xp && (typeof S.xp!=="object" || ["calm","res","aware","self"].some(k=>typeof S.xp[k]!=="number"))) S.xp=null;
  S.moods=S.moods.filter(m=>m && m.mood>=1 && m.mood<=5).map(m=>Object.assign({}, m, {tags:Array.isArray(m.tags)?m.tags:[], emotions:Array.isArray(m.emotions)?m.emotions:[]}));
  S.tests=S.tests.filter(t=>t && ["gad7","phq9","cbi","rse"].includes(t.id) && typeof t.score==="number");
  S.grat=S.grat.filter(g=>g && typeof g.text==="string");
}
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }

/* ===== Утилиты ===== */
const $ = (s,el=document)=>el.querySelector(s);
const $$ = (s,el=document)=>[...el.querySelectorAll(s)];
const esc = s => String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid = () => Math.random().toString(36).slice(2,10);
const fmtDate = ts => new Date(ts).toLocaleDateString("ru-RU",{day:"numeric",month:"long"});
const fmtDT = ts => new Date(ts).toLocaleString("ru-RU",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
const plural=(n,a,b,c)=>{const m10=n%10,m100=n%100; return m10===1&&m100!==11?a:(m10>=2&&m10<=4&&(m100<12||m100>14)?b:c);};
function toast(t){
  const q=toast.q||(toast.q=[]);
  if(toast._busy && toast._busy!==t){ if(q.length<2 && !q.includes(t)) q.push(t); return; }
  const el=$("#toast"); el.textContent=t; el.hidden=false; toast._busy=t; clearTimeout(toast._t);
  toast._t=setTimeout(()=>{ el.hidden=true; toast._busy=null; const n=q.shift(); if(n) setTimeout(()=>toast(n),200); },2600);
}
async function copy(text, el){
  try{ await navigator.clipboard.writeText(text); toast("Скопировано"); }
  catch(e){ if(el){ const r=document.createRange(); r.selectNodeContents(el); const s=getSelection(); s.removeAllRanges(); s.addRange(r);} toast("Выделено — скопируйте вручную"); }
}
load();

/* ===== Серия дней ===== */
const dayKey = (d=new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
function markDay(){ const k=dayKey(); if(!S.days.includes(k)){ S.days.push(k); save(); } checkBadges(); }
function streak(){
  const set=new Set(S.days); let n=0; const d=new Date();
  if(!set.has(dayKey(d))) d.setDate(d.getDate()-1);
  while(set.has(dayKey(d))){ n++; d.setDate(d.getDate()-1); }
  return n;
}
function bestStreak(){
  const ds=[...new Set(S.days)].sort(); let best=0, cur=0, prev=null;
  ds.forEach(k=>{ const t=new Date(k+"T12:00:00").getTime(); cur = prev && Math.round((t-prev)/864e5)===1 ? cur+1 : 1; best=Math.max(best,cur); prev=t; });
  return best;
}

/* ===== Примеры для пустого дневника ===== */
function demoMoods(){
  const tags=[["работа"],["сон","семья"],["работа","усталость"],["спорт"],["друзья"],["работа"],["отдых","семья"],["сон"],["работа","усталость"],["спорт","друзья"]];
  const vals=[3,4,2,4,5,3,4,3,2,4];
  const emo=[["Тревога/напряжение"],["Спокойствие/облегчение"],["Тревога/беспокойство"],["Радость/воодушевление"],["Радость/благодарность"],[],["Спокойствие/умиротворение"],["Грусть/бессилие"],["Злость/раздражение"],["Радость/азарт"]];
  const notes=["Много встреч, к вечеру голова гудела","Выспался, утро спокойное","Дедлайн, тревожно","Пробежка 3 км","Встретились с другом, долго гуляли","Обычный день","Ездили к родителям","Проснулся в 4 утра","Опять задержался на работе","Йога и ужин с друзьями"];
  const now=new Date(); const out=[];
  vals.forEach((v,i)=>{ const d=new Date(now); d.setDate(d.getDate()-(vals.length-i)); d.setHours(20,0,0,0);
    out.push({id:"demo"+i, ts:d.getTime(), mood:v, tags:tags[i], emotions:emo[i], note:notes[i], good:"", demo:true}); });
  return out;
}
function moodsAll(){ if(!S.moods.length && !S.demoCleared) return demoMoods(); return S.moods; }
const isDemo = () => !S.moods.length && !S.demoCleared;

/* ===== Иконки и лица ===== */
const MOODS=[{v:1,t:"Плохо"},{v:2,t:"Так себе"},{v:3,t:"Нормально"},{v:4,t:"Хорошо"},{v:5,t:"Отлично"}];
const moodColor = v => `var(--m${v})`;
function face(v){
  const mouths={1:"M10 22 Q16 16 22 22",2:"M10 21 Q16 18 22 21",3:"M10 20 L22 20",4:"M10 19 Q16 23 22 19",5:"M9 18 Q16 26 23 18"};
  return `<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="${moodColor(v)}" opacity=".9"/><circle cx="11.5" cy="13" r="1.8" fill="#fff"/><circle cx="20.5" cy="13" r="1.8" fill="#fff"/><path d="${mouths[v]}" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>`;
}
const I = {
  home:'<path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  tests:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  diary:'<path d="M4 19V5a1 1 0 0 1 1-1h11l4 4v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M8 14l3-3 2 2 3-4"/>',
  thoughts:'<path d="M12 3a7 7 0 0 0-4 12.7V19h8v-3.3A7 7 0 0 0 12 3z"/><path d="M10 22h4"/>',
  about:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  wind:'<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h7"/>',
  hand:'<path d="M8 13V5a1.5 1.5 0 0 1 3 0v6M11 11V4a1.5 1.5 0 0 1 3 0v7M14 11V5a1.5 1.5 0 0 1 3 0v8a7 7 0 0 1-7 7 6 6 0 0 1-5-3l-2-4a1.5 1.5 0 0 1 2.5-1.5L8 14"/>',
  heart:'<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
  cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  practices:'<path d="M5 19c0-8 5-14 15-15-1 10-7 15-15 15z"/><path d="M5 19c3-4 6-7 10-10"/>',
  book:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
  share:'<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"/>',
  check:'<path d="m5 12 5 5 9-10"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  jar:'<path d="M8 3h8v3l2 3v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9l2-3z"/><path d="M8 6h8"/><circle cx="10" cy="15" r="1.4"/><circle cx="14" cy="13" r="1.4"/><circle cx="12.5" cy="17.5" r="1.4"/>',
  body:'<circle cx="12" cy="4.5" r="2"/><path d="M12 7v7M8 9.5l4-1 4 1M9.5 21l2.5-7 2.5 7"/>',
  emo:'<circle cx="12" cy="12" r="9"/><path d="M12 3v9l6.4 6.4M12 12 3.5 9.2"/>',
  star:'<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>'
};
const ico = (n,sz=20)=>`<svg viewBox="0 0 24 24" width="${sz}" height="${sz}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;

/* ===== Навигация ===== */
const TABS=[["home","Главная"],["tests","Тесты"],["diary","Дневник"],["practices","Практики"],["about","Психолог"]];
const TAB_OF={badges:"home", sos:"home", breath:"practices", ground:"practices", pmr:"practices", thoughts:"practices", programs:"practices", program:"practices", article:"practices", jar:"practices"};
let route="home", sub=null, prevRoute="home";
function stopAll(){ stopBreath(); stopPmr(); }
function go(r, s=null){
  stopAll();
  if(route==="tests" && T.id && T.i>=TESTS[T.id].q.length) T={id:null,i:0,a:[]};
  if(r!==route && !["breath","ground","pmr"].includes(route)) prevRoute=route;
  if(["breath","ground","pmr"].includes(r)){ RL=null; groundStep=-1; }
  route=r; sub=s; render(); window.scrollTo(0,0);
  if(!go._pop){ try{ history.pushState({r,s}, "", r==="home"?location.pathname+location.search:"#"+r); }catch(e){} }
}
function renderTabs(){
  const rm=window.ROOM_OF?ROOM_OF(route):""; if(rm && window.ROOM_NAV){ $("#tabs").innerHTML=ROOM_NAV(route); $("#tabs").closest("nav").setAttribute("aria-label",{love:"Для пары",goals:"Цели",intim:"Близость"}[rm]||"Разделы"); return; }
  $("#tabs").closest("nav").setAttribute("aria-label","Разделы");
  const main = TAB_OF[route] || route;
  $("#tabs").innerHTML = TABS.map(([k,t])=>`<button data-go="${k}" ${main===k?'aria-current="page"':''}>${ico(k,22)}<span>${t}</span></button>`).join("");
}
document.addEventListener("click", e=>{
  const g=e.target.closest("[data-go]"); if(g && !g.disabled){ e.preventDefault(); go(g.dataset.go, g.dataset.sub||null); }
});
const backBtn = (to, label) => `<button class="back" data-go="${to}">← ${label}</button>`;
const backPrev = () => backBtn(prevRoute==="sos"?"sos":prevRoute==="home"?"home":"practices", prevRoute==="sos"?"Быстрая помощь":prevRoute==="home"?"Главная":"Практики");

function header(){
  return `<div class="top"><div class="brand"><div class="logo">О</div><div><div style="font-weight:700">Опора</div><div class="small muted">с психологом ${esc(PSY.nameWith)}</div></div></div><div class="top-r">${window.modeSwitch?modeSwitch("me"):""}<button class="sos-pill" data-go="sos">SOS</button></div></div>`;
}

/* ===== Достижения ===== */
const BADGES=[
  {id:"mood1", t:"Первый шаг", d:"Первая запись в дневнике", ok:()=>S.moods.length>=1},
  {id:"test1", t:"Знаю себя", d:"Пройден первый тест", ok:()=>S.tests.length>=1},
  {id:"thought1", t:"Мысль ≠ факт", d:"Первая разобранная мысль", ok:()=>S.thoughts.length>=1},
  {id:"relief3", t:"Минус напряжение", d:"3 упражнения с оценкой до и после", ok:()=>S.relief.length>=3},
  {id:"streak3", t:"Три дня подряд", d:"Занимались 3 дня подряд", ok:()=>bestStreak()>=3},
  {id:"streak7", t:"Неделя заботы", d:"Занимались 7 дней подряд", ok:()=>bestStreak()>=7},
  {id:"jar10", t:"Полная горсть", d:"10 благодарностей в банке", ok:()=>S.grat.length>=10},
  {id:"reader", t:"Читатель", d:"Прочитано 3 статьи", ok:()=>S.read.length>=3},
  {id:"program", t:"До конца", d:"Пройдена целая программа", ok:()=>PROGRAMS.some(p=>progState(p).count===p.days.length)},
  {id:"emo10", t:"Словарь чувств", d:"10 раз назвали эмоцию точно", ok:()=>S.moods.reduce((a,m)=>a+(m.emotions||[]).length,0)>=10}
];
function checkBadges(){
  const fresh=BADGES.filter(b=>!S.badges.includes(b.id) && b.ok());
  if(!fresh.length) return;
  fresh.forEach(b=>S.badges.push(b.id)); save();
  setTimeout(()=>toast("Новое достижение: «"+fresh[0].t+"»"), 900);
}
function badgesRow(){
  const got=BADGES.filter(b=>S.badges.includes(b.id)).length;
  return `<button class="card badges-card" data-go="badges" data-from="growth">
    <span class="row" style="justify-content:space-between;width:100%"><strong class="ct">Достижения</strong><span class="tag">${got} из ${BADGES.length}</span></span>
    <span class="badge-strip">${BADGES.map(b=>`<span class="bdg ${S.badges.includes(b.id)?"on":""}" title="${esc(b.t)}">${ico("star",16)}</span>`).join("")}</span>
  </button>`;
}
function vBadges(){
  return `${backBtn("growth","Мой рост")}
  <div class="stack-s"><h1>Достижения</h1></div>
  <div class="grid2">${BADGES.map(b=>{const on=S.badges.includes(b.id); return `<div class="tile badge ${on?"on":""}"><span class="ico">${ico(on?"star":"lock",18)}</span><strong>${esc(b.t)}</strong><span class="small muted">${esc(b.d)}</span></div>`;}).join("")}</div>`;
}

/* ===== Шкала напряжения «до и после» ===== */
const EX_NAMES={breath:"Дыхание «квадрат»", ground:"Заземление 5‑4‑3‑2‑1", pmr:"Расслабление мышц"};
let RL=null; // {ex, before, after, stage}
function reliefBefore(ex){
  if(RL && RL.ex===ex && RL.stage!=="before") return "";
  const v = RL && RL.ex===ex ? RL.before : 6;
  return `<div class="card relief">
    <label class="field"><span>Напряжение сейчас <strong id="rbV" class="rv">${v}</strong></span>
    <input type="range" id="rbR" min="0" max="10" step="1" value="${v}" aria-label="Напряжение до упражнения, от 0 до 10"></label>
    <div class="scale-lbl small muted"><span>спокойно</span><span>очень сильно</span></div>
  </div>`;
}
function reliefAfter(ex){
  if(!RL || RL.ex!==ex || RL.stage!=="after") return "";
  return `<div class="card relief soft" id="relAfter">
    <label class="field"><span>А теперь? <strong id="raV" class="rv">${RL.after}</strong></span>
    <input type="range" id="raR" min="0" max="10" step="1" value="${RL.after}" aria-label="Напряжение после упражнения, от 0 до 10"></label>
    <div class="scale-lbl small muted"><span>спокойно</span><span>очень сильно</span></div>
    <button class="btn" id="raSave">Готово</button>
  </div>`;
}
function reliefDone(ex){
  if(!RL || RL.ex!==ex || RL.stage!=="done") return "";
  const d=RL.before-RL.after;
  return `<div class="card soft">
    <div class="relief-res"><span class="big-num">${RL.before}</span><span class="arrow">→</span><span class="big-num" style="color:var(--ok)">${RL.after}</span></div>
    <p>${d>0?`Минус ${d} ${plural(d,"пункт","пункта","пунктов")} напряжения. Отлично.`:d===0?"Без изменений. Попробуйте другое упражнение.":"Стало тяжелее. Откройте быструю помощь или позвоните близкому."}</p>
    <div class="row"><button class="btn quiet" id="rlAgain">Ещё раз</button>${d<=0?`<button class="btn quiet" data-go="sos">Быстрая помощь</button>`:""}</div>
  </div>`;
}
function bindRelief(ex){
  const r=$("#rbR"); if(r) r.oninput=()=>{ $("#rbV").textContent=r.value; RL={ex, before:+r.value, after:+r.value, stage:"before"}; };
  const a=$("#raR"); if(a) a.oninput=()=>{ $("#raV").textContent=a.value; RL.after=+a.value; };
  const s=$("#raSave"); if(s) s.onclick=()=>{ S.relief.push({ex, before:RL.before, after:RL.after, ts:Date.now()}); RL.stage="done"; save(); markDay(); award("calm",10); render(); };
  const ag=$("#rlAgain"); if(ag) ag.onclick=()=>{ RL={ex, before:RL.after, after:RL.after, stage:"before"}; render(); window.scrollTo(0,0); };
}
function reliefStart(ex){ const r=$("#rbR"); const v=r?+r.value:(RL&&RL.ex===ex?RL.before:6); RL={ex, before:v, after:Math.max(0,v-1), stage:"doing"}; }
function reliefFinish(ex){ if(RL && RL.ex===ex && RL.stage==="doing"){ RL.stage="after"; render(); setTimeout(()=>{const el=$("#relAfter"); if(el) el.scrollIntoView({behavior:"smooth",block:"center"});},50); } }
function reliefStats(){
  if(S.relief.length<2) return "";
  const avg = S.relief.reduce((a,r)=>a+(r.before-r.after),0)/S.relief.length;
  if(avg<=0) return "";
  return `<p class="small">Упражнения снижают ваше напряжение в среднем на <strong>${avg.toFixed(1).replace(".",",")}</strong> из 10</p>`;
}

/* ===== Главная ===== */
function vHome(){
  const h=new Date().getHours();
  const hi = h<6?"Доброй ночи":h<12?"Доброе утро":h<18?"Добрый день":"Добрый вечер";
  const today = S.moods.filter(m=>new Date(m.ts).toDateString()===new Date().toDateString()).pop();
  return `${header()}
  <div class="stack-s"><h1>${hi}</h1><p class="muted">Как вы себя чувствуете сейчас?</p></div>
  <div class="card">
    <div class="moods">${MOODS.map(m=>`<button class="mood" data-qm="${m.v}" ${today&&today.mood===m.v?'aria-pressed="true"':''}>${face(m.v)}<span>${m.t}</span></button>`).join("")}</div>
  </div>
  ${typeof homeCard==="function"?homeCard():""}
  ${typeof homeTree==="function"?homeTree():""}
  ${typeof homeThought==="function"?homeThought():""}
  ${homeProgress()}
  <button class="banner sos-banner" data-go="sos"><span class="bi">${ico("heart",20)}</span><span class="bt"><strong>Накрыло?</strong><span class="small muted">Помощь за 2 минуты</span></span><span class="chev">›</span></button>
  <div class="grid2">
    <button class="tile" data-go="tests" data-sub="cbi"><span class="ico">${ico("tests")}</span><strong>Тест на выгорание</strong><span class="small muted">1 минута</span></button>
    <button class="tile" data-go="breath"><span class="ico">${ico("wind")}</span><strong>Снять напряжение</strong><span class="small muted">2 минуты</span></button>
    <button class="tile" data-go="sounds"><span class="ico">${ico("moon")}</span><strong>Звуки для сна</strong><span class="small muted">Дождь, море, лес</span></button>
    <button class="tile" data-go="about" data-sub="book"><span class="ico">${ico("cal")}</span><strong>Записаться</strong><span class="small muted">к ${esc(PSY.nameTo)}</span></button>
  </div>
  ${window.roomsRow?roomsRow():window.loveBanner?loveBanner():""}
  ${S.days.length>=2?installCard():""}
  <p class="disclaimer">Не заменяет консультацию специалиста. Данные хранятся только у вас.</p>`;
}
function bindHome(){
  $$("[data-qm]").forEach(b=>b.onclick=()=>{draft.mood=+b.dataset.qm; go("diary");});
  const ib=$("#installBtn"); if(ib) ib.onclick=async()=>{ if(!installEvt) return; installEvt.prompt(); try{ await installEvt.userChoice; }catch(e){} installEvt=null; render(); };
  const ix=$("#installHide"); if(ix) ix.onclick=()=>{ S.installHidden=true; save(); render(); };
}

/* ===== SOS ===== */
function vSOS(){
  return `${backBtn("home","Главная")}
  <div class="stack-s"><h1>Быстрая помощь</h1><p class="muted">Вы в безопасности. Выберите одно.</p></div>
  <div class="grid2">
    <button class="tile" data-go="breath"><span class="ico">${ico("wind")}</span><strong>Дыхание</strong><span class="small muted">2 минуты</span></button>
    <button class="tile" data-go="ground"><span class="ico">${ico("hand")}</span><strong>Заземление</strong><span class="small muted">5‑4‑3‑2‑1</span></button>
  </div>
  <details class="more">
    <summary>Если это паническая атака</summary>
    <ol class="steps small">
      <li>Скажите себе: «Это паническая атака. Она неприятна, но не опасна и пройдёт». Пик обычно наступает в первые 10 минут, затем волна спадает.</li>
      <li>Не боритесь с ощущениями. Позвольте им быть и наблюдайте, как они меняются.</li>
      <li>Сделайте выдох длиннее вдоха: вдох на 4 счёта, выдох на 6.</li>
      <li>Упритесь стопами в пол, сожмите и разожмите кулаки 5 раз.</li>
      <li>Когда станет легче, запишите, что случилось перед атакой. Обсудим это на сессии.</li>
    </ol>
  </details>
  <div class="card sos">
    <h3>Если есть мысли навредить себе</h3>
    <p class="small">Обратитесь за помощью сейчас.</p>
    <div class="stack-s">
      <div><div class="label">Экстренные службы</div><a class="phone" href="tel:112">112</a></div>
      <div><div class="label">Психологическая помощь МЧС, круглосуточно</div><a class="phone" href="tel:+74959895050">8 495 989‑50‑50</a></div>
      <div><div class="label">Телефон доверия для подростков и родителей, бесплатно</div><a class="phone" href="tel:88002000122">8 800 2000‑122</a></div>
      <div><div class="label">Психологическая помощь МЧС онлайн</div><a href="https://psi.mchs.gov.ru/" target="_blank" rel="noopener" style="color:var(--ink);font-weight:600">psi.mchs.gov.ru</a></div>
    </div>
  </div>`;
}

/* ===== Заземление ===== */
let groundStep=-1;
const GROUND=[
  ["5","вещей, которые вы видите","Назовите их про себя или вслух. Например: лампа, кружка, окно."],
  ["4","вещи, которые можно потрогать","Ощутите их фактуру: ткань одежды, стол, телефон в руке."],
  ["3","звука, которые вы слышите","Шум улицы, гул техники, собственное дыхание."],
  ["2","запаха","Если запахов нет, вспомните два любимых."],
  ["1","вкус","Отпейте воды или просто заметьте вкус во рту."]
];
function vGround(){
  const doing = RL && RL.ex==="ground" && RL.stage==="doing";
  const g=GROUND[Math.max(0,groundStep)];
  return `${backPrev()}
  <div class="stack-s"><h1>Заземление</h1><p class="muted">Вернуться в «здесь и сейчас» через 5 чувств</p></div>
  ${reliefBefore("ground")}
  ${doing?`<div class="card">
    <div class="row" style="justify-content:space-between"><span class="label">Шаг ${groundStep+1} из 5</span></div>
    <div class="progress"><i style="width:${(groundStep+1)*20}%"></i></div>
    <div class="row" style="align-items:flex-end;gap:12px"><span class="big-num">${g[0]}</span><strong style="font-size:1.1rem;padding-bottom:4px">${g[1]}</strong></div>
    <p class="small">${g[2]}</p>
    <div class="row"><button class="btn quiet" id="gPrev" ${groundStep===0?"disabled":""}>Назад</button><button class="btn" id="gNext">${groundStep===4?"Готово":"Дальше"}</button></div>
  </div>`:(RL&&RL.ex==="ground"&&RL.stage!=="before"?"":`<button class="btn block" id="gStart">Начать</button>`)}
  ${reliefAfter("ground")}${reliefDone("ground")}`;
}
function bindGround(){
  bindRelief("ground");
  const st=$("#gStart"); if(st) st.onclick=()=>{ reliefStart("ground"); groundStep=0; render(); };
  const n=$("#gNext"); if(n) n.onclick=()=>{ if(groundStep===4){ groundStep=-1; reliefFinish("ground"); } else { groundStep++; render(); } };
  const p=$("#gPrev"); if(p) p.onclick=()=>{ if(groundStep>0){groundStep--; render();} };
}

/* ===== Дыхание ===== */
const PHASES=[["Вдох",1],["Задержка",1],["Выдох",.55],["Задержка",.55]];
let bTimer=null, bState={running:false, phase:0, sec:4, cycles:0};
function vBreath(){
  const showRun = !(RL && RL.ex==="breath" && (RL.stage==="after"||RL.stage==="done"));
  return `${backPrev()}
  <div class="stack-s"><h1>Дыхание</h1><p class="muted">Вдох · пауза · выдох · пауза — по 4 секунды</p></div>
  ${reliefBefore("breath")}
  ${showRun?`<div class="card">
    <div class="breath-wrap"><div class="breath"><div class="ring"></div><div class="ball" id="ball"></div><div class="txt"><div class="phase" id="bPhase">Готовы?</div><div class="count" id="bCount">4</div></div></div></div>
    <p class="small muted" style="text-align:center" id="bCycles">0 из 5 кругов</p>
    <button class="btn block" id="bBtn">Начать</button>
    ${window.SND?SND.cueBtn():""}
  </div>
  <p class="disclaimer">Кружится голова — дышите как обычно</p>`:""}
  ${reliefAfter("breath")}${reliefDone("breath")}`;
}
function bindBreath(){
  bindRelief("breath");
  const b=$("#bBtn"); if(b) b.onclick=()=> bState.running?finishBreath():startBreath();
  if(window.SND) SND.bindCue();
}
function applyPhase(){
  const [t,s]=PHASES[bState.phase]; const b=$("#ball"); if(!b) return;
  $("#bPhase").textContent=t; $("#bCount").textContent=bState.sec; b.style.transform=`scale(${s})`;
  if(bState.running && bState.sec===4 && window.SND) SND.cue("breath", bState.phase);
}
function startBreath(){
  reliefStart("breath");
  const rb=$(".relief"); if(rb) rb.remove();
  bState={running:true, phase:0, sec:4, cycles:0}; $("#bBtn").textContent="Закончить"; applyPhase();
  bTimer=setInterval(()=>{
    bState.sec--;
    if(bState.sec===0){ bState.phase=(bState.phase+1)%4; bState.sec=4;
      if(bState.phase===0){ bState.cycles++; const c=$("#bCycles"); if(c) c.textContent=`${bState.cycles} из 5 кругов`; if(bState.cycles>=5){ finishBreath(); return; } } }
    applyPhase();
  },1000);
}
function stopBreath(){ clearInterval(bTimer); bTimer=null; bState.running=false; }
function finishBreath(){
  const cyc=bState.cycles; stopBreath();
  if(cyc>=1){ if(window.SND) SND.cue("done"); reliefFinish("breath"); }
  else { RL=null; render(); }
}

/* ===== Расслабление мышц по Джекобсону ===== */
const PMR=[
  {p:"hands", t:"Кисти и предплечья", tense:"Сожмите кулаки как можно сильнее"},
  {p:"arms", t:"Плечи и руки", tense:"Согните руки в локтях и напрягите бицепсы"},
  {p:"shoulders", t:"Плечи", tense:"Поднимите плечи к ушам"},
  {p:"face", t:"Лицо", tense:"Зажмурьтесь и сморщите нос"},
  {p:"neck", t:"Шея", tense:"Слегка прижмите подбородок к груди"},
  {p:"belly", t:"Живот", tense:"Втяните и напрягите живот"},
  {p:"legs", t:"Бёдра", tense:"Напрягите бёдра, прижав колени друг к другу"},
  {p:"feet", t:"Стопы", tense:"Потяните носки на себя"}
];
const TENSE=5, RELAX=10;
let pmrT=null, pmrS={i:0, phase:"tense", sec:TENSE, running:false};
function figure(active){
  const c=p=>`class="fp ${p===active?"on":""}"`;
  return `<svg class="figure" viewBox="0 0 120 220" aria-hidden="true">
    <circle ${c("face")} cx="60" cy="24" r="16"/>
    <rect ${c("neck")} x="53" y="40" width="14" height="10" rx="4"/>
    <rect ${c("shoulders")} x="28" y="50" width="64" height="14" rx="7"/>
    <rect class="fp" x="40" y="64" width="40" height="34" rx="6"/>
    <rect ${c("belly")} x="40" y="98" width="40" height="28" rx="6"/>
    <rect ${c("arms")} x="16" y="58" width="12" height="44" rx="6"/><rect ${c("arms")} x="92" y="58" width="12" height="44" rx="6"/>
    <rect ${c("hands")} x="14" y="104" width="14" height="34" rx="7"/><rect ${c("hands")} x="92" y="104" width="14" height="34" rx="7"/>
    <rect ${c("legs")} x="40" y="128" width="18" height="50" rx="8"/><rect ${c("legs")} x="62" y="128" width="18" height="50" rx="8"/>
    <rect ${c("feet")} x="36" y="180" width="22" height="26" rx="8"/><rect ${c("feet")} x="62" y="180" width="22" height="26" rx="8"/>
  </svg>`;
}
function vPmr(){
  const doing = pmrS.running;
  const hideRun = RL && RL.ex==="pmr" && (RL.stage==="after"||RL.stage==="done");
  const cur=PMR[pmrS.i];
  return `${backPrev()}
  <div class="stack-s"><h1>Расслабление мышц</h1><p class="muted">Напрячь ${TENSE} сек · расслабить ${RELAX} сек · 3 минуты</p></div>
  ${reliefBefore("pmr")}
  ${hideRun?"":`<div class="card pmr">
    <div class="pmr-wrap">${figure(doing?cur.p:null)}
      <div class="stack-s pmr-txt">
        <span class="label">${doing?`Шаг ${pmrS.i+1} из ${PMR.length} · ${esc(cur.t)}`:"Готовы?"}</span>
        <div class="phase" id="pPhase">${doing?(pmrS.phase==="tense"?"Напрягите":"Расслабьте"):"8 групп мышц"}</div>
        <p class="small" id="pHint">${doing?(pmrS.phase==="tense"?esc(cur.tense):"Почувствуйте разницу"):"Без боли. Если где‑то больно — пропустите."}</p>
        <div class="count" id="pCount">${doing?pmrS.sec:""}</div>
      </div>
    </div>
    <div class="progress"><i style="width:${doing?(pmrS.i/PMR.length*100):0}%"></i></div>
    <button class="btn block" id="pmrBtn">${doing?"Закончить":"Начать"}</button>
    ${window.SND?SND.cueBtn():""}
  </div>`}
  ${reliefAfter("pmr")}${reliefDone("pmr")}`;
}
function bindPmr(){
  bindRelief("pmr");
  if(window.SND) SND.bindCue();
  const b=$("#pmrBtn"); if(b) b.onclick=()=>{ if(pmrS.running){ const done=pmrS.i; stopPmr(); if(done>=2) reliefFinish("pmr"); else { RL=null; render(); } } else startPmr(); };
}
function startPmr(){
  reliefStart("pmr");
  pmrS={i:0, phase:"tense", sec:TENSE, running:true}; render();
  const cue=n=>{ if(window.SND) SND.cue(n); }; cue("tense");
  pmrT=setInterval(()=>{
    pmrS.sec--;
    if(pmrS.sec<=0){
      if(pmrS.phase==="tense"){ pmrS.phase="relax"; pmrS.sec=RELAX; cue("relax"); }
      else { pmrS.i++; if(pmrS.i>=PMR.length){ stopPmr(); cue("done"); reliefFinish("pmr"); return; } pmrS.phase="tense"; pmrS.sec=TENSE; cue("tense"); }
      render(); return;
    }
    const c=$("#pCount"); if(c) c.textContent=pmrS.sec;
  },1000);
}
function stopPmr(){ clearInterval(pmrT); pmrT=null; pmrS.running=false; }

/* ===== Тесты ===== */
const FREQ4=[["Ни разу",0],["Несколько дней",1],["Больше половины дней",2],["Почти каждый день",3]];
const TESTS={
  cbi:{title:"Выгорание", code:"CBI", min:1, icon:"wind", desc:"6 вопросов о том, насколько вы истощены. Копенгагенский опросник выгорания. 1 минута.",
    intro:"Как часто в последнее время:", max:100, unit:"из 100", score:"mean",
    opts:[["Всегда",100],["Часто",75],["Иногда",50],["Редко",25],["Никогда или почти никогда",0]],
    q:["Вы чувствуете усталость","Вы чувствуете физическое истощение","Вы чувствуете эмоциональное истощение","Вы думаете: «Я больше не могу»","Вы чувствуете себя вымотанным(-ой)","Вы чувствуете слабость и уязвимость к болезням"],
    levels:[[49,"Низкий уровень выгорания","ok","Сил пока хватает. Продолжайте замечать, что вас наполняет, и берегите это: сон, отдых без телефона, приятные дела."],
            [74,"Умеренное выгорание","m2","Ресурс заметно просел. Это сигнал остановиться и пересобрать нагрузку, пока усталость не стала хронической. Попробуйте программу «Выход из выгорания» и обсудите ситуацию со специалистом."],
            [100,"Высокое выгорание","m1","Вы очень истощены. В таком состоянии трудно справляться самостоятельно, и это не ваша слабость. Рекомендую консультацию: вместе разберём, что забирает силы и как их вернуть."]],
    program:"burnout7"},
  gad7:{title:"Тревожность", code:"GAD‑7", min:2, icon:"heart", desc:"7 вопросов о тревоге за последние 2 недели. Около 2 минут.",
    intro:"Как часто за последние 2 недели вас беспокоило:", max:21, unit:"из 21", score:"sum", opts:FREQ4,
    q:["Нервозность, тревога или ощущение, что вы «на грани»","Неспособность остановить или контролировать беспокойство","Чрезмерное беспокойство о разных вещах","Трудно расслабиться","Такое беспокойство, что трудно усидеть на месте","Лёгкая раздражительность или вспыльчивость","Страх, что может случиться что‑то ужасное"],
    levels:[[4,"Минимальная тревожность","ok","Уровень тревоги сейчас в пределах обычного. Продолжайте замечать своё состояние и пользоваться дыхательными практиками, когда нужно."],
            [9,"Лёгкая тревожность","m3","Тревога заметна, но обычно с ней можно работать самостоятельно: дневник мыслей, режим сна, дыхание. Если состояние держится дольше месяца, стоит обсудить его со специалистом."],
            [14,"Умеренная тревожность","m2","Тревога ощутимо влияет на жизнь. Это частый запрос, и с ним хорошо работает когнитивно‑поведенческая терапия. Рекомендую консультацию."],
            [21,"Выраженная тревожность","m1","Тревога сильная и, скорее всего, сильно мешает. Пожалуйста, не оставайтесь с этим в одиночку: запишитесь на консультацию к психологу или к врачу‑психиатру."]],
    program:"calm7"},
  rse:{title:"Самооценка", code:"Розенберг", min:2, icon:"star", desc:"10 утверждений о том, как вы к себе относитесь. Шкала самооценки Розенберга. 2 минуты.",
    intro:"Насколько вы согласны с утверждением:", max:30, unit:"из 30", score:"sum",
    opts:[["Полностью согласен(-на)",3],["Согласен(-на)",2],["Не согласен(-на)",1],["Совсем не согласен(-на)",0]],
    q:["В целом я доволен(-льна) собой",{t:"Иногда мне кажется, что я ни на что не годен(-дна)",r:1},"Я считаю, что у меня есть ряд хороших качеств","Я способен(-на) делать что‑то не хуже большинства людей",{t:"Мне кажется, мне особо нечем гордиться",r:1},{t:"Иногда я чувствую себя бесполезным(-ой)",r:1},"Я чувствую, что я ценный человек, по крайней мере не хуже других",{t:"Хотелось бы больше уважать себя",r:1},{t:"В целом я склонен(-нна) считать себя неудачником(-цей)",r:1},"Я отношусь к себе положительно"],
    levels:[[14,"Сниженная самооценка","m1","Вы часто бываете к себе строги и недооцениваете себя. С этим можно работать: научиться замечать свои сильные стороны и говорить с собой бережнее. Это хорошая тема для консультаций."],
            [25,"Нормальная самооценка","ok","В целом вы относитесь к себе ровно и принимаете себя. Бывают моменты сомнений, и это нормально."],
            [30,"Высокая самооценка","ok","Вы уверены в себе и цените себя. Это хороший ресурс, на который можно опираться в трудные периоды."]]},
  phq9:{title:"Настроение", code:"PHQ‑9", min:3, icon:"emo", desc:"9 вопросов о настроении за последние 2 недели. Около 3 минут.",
    intro:"Как часто за последние 2 недели вас беспокоило:", max:27, unit:"из 27", score:"sum", opts:FREQ4,
    q:["Мало интереса или удовольствия от привычных занятий","Подавленность, уныние или безнадёжность","Трудности с засыпанием, прерывистый сон или слишком много сна","Усталость или упадок сил","Плохой аппетит или переедание","Плохое мнение о себе: ощущение, что вы неудачник или подвели себя или близких","Трудно сосредоточиться, например на чтении или фильме","Вы двигаетесь или говорите так медленно, что это заметно окружающим. Или наоборот: суетливость, не можете усидеть на месте","Мысли, что лучше было бы умереть, или мысли причинить себе вред"],
    levels:[[4,"Минимальное снижение настроения","ok","Признаков сниженного настроения почти нет. Поддерживайте то, что вам помогает: сон, движение, общение."],
            [9,"Лёгкое снижение настроения","m3","Есть признаки сниженного настроения. Попробуйте каждый день отмечать настроение в дневнике и добавить приятные дела. Если через 2–3 недели не станет лучше, обсудим это на консультации."],
            [14,"Умеренное снижение настроения","m2","Настроение заметно снижено. С этим стоит работать вместе со специалистом, самостоятельные усилия могут даваться тяжело. Рекомендую консультацию."],
            [19,"Умеренно‑тяжёлое снижение настроения","m1","Состояние серьёзное. Рекомендую не откладывать консультацию психолога и показаться врачу‑психиатру или психотерапевту."],
            [27,"Тяжёлое снижение настроения","m1","Состояние очень тяжёлое. Пожалуйста, обратитесь к врачу‑психиатру в ближайшее время. Вы не обязаны справляться с этим в одиночку."]],
    risk:8}
};
const qText = q => typeof q==="string"?q:q.t;
function scoreOf(id, ans){
  const t=TESTS[id]; const maxOpt=Math.max(...t.opts.map(o=>o[1]));
  const vals=ans.map((v,i)=> (typeof t.q[i]==="object" && t.q[i].r) ? maxOpt-v : v);
  const sum=vals.reduce((a,b)=>a+b,0);
  return t.score==="mean" ? Math.round(sum/vals.length) : sum;
}
const level=(id,score)=>TESTS[id].levels.find(l=>score<=l[0]);
const lvlColor = l => l[2]==="ok"?"var(--ok)":`var(--${l[2]})`;
let T={id:null, i:0, a:[]};
function vTests(){
  if(sub && TESTS[sub]){ T={id:sub,i:0,a:[]}; sub=null; }
  if(T.id && T.i < TESTS[T.id].q.length) return vQuestion();
  if(T.id) return vResult();
  const hist=S.tests.slice().reverse().slice(0,8);
  return `<div class="stack-s"><h1>Тесты</h1><p class="muted">Не диагноз, а повод присмотреться к себе</p></div>
  <div class="list">${Object.entries(TESTS).map(([k,t])=>{ const last=S.tests.filter(r=>r.id===k).pop(); const l=last?level(k,last.score):null;
    return `<button class="li" data-test="${k}"><span class="ico">${ico(t.icon||"tests",20)}</span><span class="dt"><strong>${t.title}</strong><span class="small muted">${l?`<span style="color:${lvlColor(l)}">${l[1]}</span>`:`${t.q.length} вопросов · ${t.min} мин`}</span></span><span class="chev">›</span></button>`;}).join("")}</div>
  ${hist.length?`<details class="more"><summary>История</summary><div>${hist.map(r=>{const t=TESTS[r.id]; if(!t) return ""; const l=level(r.id,r.score); return `<div class="entry"><span class="dot" style="background:${lvlColor(l)}"></span><div class="body"><strong>${t.title}: ${r.score} ${t.unit}</strong><span class="small muted">${l[1]} · ${fmtDate(r.ts)}</span></div></div>`}).join("")}</div></details>`:""}`;
}
function vQuestion(){
  const t=TESTS[T.id], n=t.q.length;
  return `<button class="back" id="tBack">← ${T.i?"Предыдущий вопрос":"К тестам"}</button>
  <div class="stack-s"><span class="label">${t.title} · вопрос ${T.i+1} из ${n}</span><div class="progress"><i style="width:${(T.i/n)*100}%"></i></div></div>
  <div class="card">
    <p class="small muted">${t.intro}</p>
    <h2>${esc(qText(t.q[T.i]))}</h2>
    <div class="opts">${t.opts.map(([o,v])=>`<button class="opt ${T.a[T.i]===v?"sel":""}" data-ans="${v}"><span>${esc(o)}</span></button>`).join("")}</div>
  </div>`;
}
function vResult(){
  const t=TESTS[T.id]; const score=scoreOf(T.id,T.a); const l=level(T.id,score);
  const risk = t.risk!=null && T.a[t.risk]>0;
  const segs = t.levels.map((lv,i)=>{const prev=i?t.levels[i-1][0]:-1; return `<span style="flex:${lv[0]-prev};background:${lvlColor(lv)};opacity:${lv===l?1:.3}"></span>`}).join("");
  const prev=S.tests.filter(r=>r.id===T.id); const before = prev.length>=2 ? prev[prev.length-2] : null;
  const prog = t.program ? PROGRAMS.find(p=>p.id===t.program) : null;
  return `<button class="back" id="tDone">← К тестам</button>
  <div class="card">
    <span class="label">${t.title} · ${esc(t.code)}</span>
    <div class="row" style="align-items:flex-end;gap:10px"><span class="big-num">${score}</span><span class="muted" style="padding-bottom:6px">${t.unit}</span></div>
    <div class="scale" aria-hidden="true">${segs}</div>
    <div><span class="result-sev" style="background:var(--surface-2);color:${lvlColor(l)}">${l[1]}</span></div>
    ${before?`<p class="small muted">В прошлый раз (${fmtDate(before.ts)}): ${before.score} ${t.unit}</p>`:""}
  </div>
  ${risk?`<div class="card sos"><h3>Вы отметили мысли о смерти или вреде себе</h3><p class="small">Это важно. Пожалуйста, поговорите с кем‑то уже сегодня: с близким человеком, специалистом или по телефону экстренной помощи 112.</p><button class="btn sosb" data-go="sos">Где получить помощь</button></div>`:""}
  <div class="card soft">
    <div class="row"><div class="logo">${esc(PSY.name[0])}</div><strong>${esc(PSY.name)}</strong></div>
    <p>${l[3]}</p>
    <button class="btn" data-go="about" data-sub="book">Обсудить на консультации</button>
  </div>
  ${prog && l[2]!=="ok"?`<button class="banner card" data-go="programs" data-sub="${prog.id}"><span class="bi" style="background:var(--accent-soft);color:var(--accent)">${ico("practices",20)}</span><span class="bt"><strong>${esc(prog.title)}</strong><span class="small muted">Программа на ${prog.days.length} ${plural(prog.days.length,"день","дня","дней")}</span></span><span class="chev">›</span></button>`:""}
  ${risk||l[2]==="m1"?"":`<button class="btn quiet block" id="storyBtn">${ico("image",18)} Карточка для сторис</button>`}
  <p class="disclaimer">Опросник не ставит диагноз</p>`;
}
function bindTests(){
  $$("[data-test]").forEach(b=>b.onclick=()=>{T={id:b.dataset.test,i:0,a:[]}; render(); scrollTo(0,0);});
  $$("[data-ans]").forEach(b=>b.onclick=()=>{
    T.a[T.i]=+b.dataset.ans; T.i++;
    if(T.i===TESTS[T.id].q.length){ const sc=scoreOf(T.id,T.a); S.tests.push({id:T.id, score:sc, ts:Date.now()}); save(); markDay(); if(level(T.id,sc)[2]!=="m1") award("aware",10); }
    render(); scrollTo(0,0);
  });
  const bk=$("#tBack"); if(bk) bk.onclick=()=>{ if(T.i>0){T.i--;} else T={id:null,i:0,a:[]}; render(); };
  const dn=$("#tDone"); if(dn) dn.onclick=()=>{T={id:null,i:0,a:[]}; render();};
  const sb=$("#storyBtn"); if(sb) sb.onclick=()=>{ const t=TESTS[T.id]; const l=level(T.id,scoreOf(T.id,T.a)); storyCard(t, l); };
}

/* ===== Карточка для сторис ===== */
function cssVar(n){ return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
function wrapText(ctx, text, maxW){
  const words=text.split(" "); const lines=[]; let line="";
  words.forEach(w=>{ const test=line?line+" "+w:w; if(ctx.measureText(test).width>maxW && line){ lines.push(line); line=w; } else line=test; });
  if(line) lines.push(line); return lines;
}
async function storyCard(t, l){
  try{ await document.fonts.ready; }catch(e){}
  const W=1080, H=1920, c=document.createElement("canvas"); c.width=W; c.height=H; const x=c.getContext("2d");
  const colors={ok:"#2E8A63", m1:"#C2453B", m2:"#D9823B", m3:"#B9A43A"};
  const lc=colors[l[2]]||"#3577B8";
  const g=x.createLinearGradient(0,0,W,H); g.addColorStop(0,"#3F86C8"); g.addColorStop(1,"#1C4670");
  x.fillStyle=g; x.fillRect(0,0,W,H);
  // мягкие круги
  x.globalAlpha=.12; x.fillStyle="#fff"; [[880,260,260],[140,1500,320],[980,1650,180]].forEach(([a,b,r])=>{x.beginPath();x.arc(a,b,r,0,Math.PI*2);x.fill();}); x.globalAlpha=1;
  const disp='"Onest", system-ui, sans-serif', body='"Onest", system-ui, sans-serif';
  // лого
  x.fillStyle="#fff"; x.beginPath(); x.roundRect ? x.roundRect(90,140,110,110,30) : x.rect(90,140,110,110); x.fill();
  x.fillStyle="#3577B8"; x.font=`800 72px ${disp}`; x.textAlign="center"; x.textBaseline="middle"; x.fillText("О",145,198);
  x.textAlign="left"; x.textBaseline="alphabetic"; x.fillStyle="#fff"; x.font=`700 54px ${body}`; x.fillText("Опора",230,190);
  x.globalAlpha=.75; x.font=`400 34px ${body}`; x.fillText(`с психологом ${PSY.nameWith}`,230,238); x.globalAlpha=1;
  // карточка
  const cx=90, cy=520, cw=W-180, ch=820;
  x.fillStyle="#fff"; x.beginPath(); x.roundRect ? x.roundRect(cx,cy,cw,ch,48) : x.rect(cx,cy,cw,ch); x.fill();
  x.fillStyle="#5B6478"; x.font=`600 34px ${body}`; x.fillText(`Я ПРОШЁЛ(-ЛА) ТЕСТ «${t.title.toUpperCase()}»`, cx+70, cy+110);
  x.fillStyle="#1F2630"; x.font=`800 92px ${disp}`;
  const lines=wrapText(x, l[1], cw-140); lines.forEach((ln,i)=>x.fillText(ln, cx+70, cy+250+i*110));
  // шкала
  const sy=cy+250+lines.length*110+30, sw=cw-140; let sx=cx+70;
  const total=t.levels[t.levels.length-1][0]+1;
  t.levels.forEach((lv,i)=>{ const prev=i?t.levels[i-1][0]+1:0; const w=(lv[0]+1-prev)/total*sw-8;
    x.globalAlpha= lv===l?1:.25; x.fillStyle=colors[lv[2]]||"#3577B8"; x.beginPath(); x.roundRect ? x.roundRect(sx,sy,w,26,13) : x.rect(sx,sy,w,26); x.fill(); sx+=w+8; });
  x.globalAlpha=1;
  x.fillStyle="#5B6478"; x.font=`400 40px ${body}`;
  wrapText(x, "Тест занимает пару минут. Проверьте себя тоже.", cw-140).forEach((ln,i)=>x.fillText(ln, cx+70, sy+130+i*54));
  // ссылка
  const url=(PSY.siteUrl||location.href).replace(/^https?:\/\//,"").replace(/\/$/,"");
  x.fillStyle="#fff"; x.font=`600 46px ${body}`; x.textAlign="center";
  x.fillText("Пройти тест бесплатно:", W/2, 1560);
  x.font=`700 44px ${body}`; x.fillText(url, W/2, 1630);
  x.globalAlpha=.7; x.font=`400 32px ${body}`; x.fillText("Без регистрации · данные остаются у вас", W/2, 1700); x.globalAlpha=1;
  c.toBlob(blob=>showStory(blob), "image/png");
}
function showStory(blob){
  const url=URL.createObjectURL(blob);
  const file=new File([blob],"opora-test.png",{type:"image/png"});
  const canShare = navigator.canShare && navigator.canShare({files:[file]});
  const m=document.createElement("div"); m.className="modal"; m.setAttribute("role","dialog"); m.setAttribute("aria-label","Карточка для сторис");
  m.innerHTML=`<div class="modal-in"><img src="${url}" alt="Карточка с результатом теста"><div class="row">
    ${canShare?`<button class="btn" id="stShare">${ico("share",18)} Поделиться</button>`:""}
    <a class="btn ${canShare?"quiet":""}" href="${url}" download="opora-test.png">Сохранить картинку</a>
    <button class="btn quiet" id="stClose">Закрыть</button></div>
    <p class="small muted">На телефоне можно также нажать на картинку и удерживать, чтобы сохранить.</p></div>`;
  document.body.appendChild(m);
  const close=()=>{ m.remove(); URL.revokeObjectURL(url); };
  $("#stClose",m).onclick=close; m.onclick=e=>{ if(e.target===m) close(); };
  const sh=$("#stShare",m); if(sh) sh.onclick=async()=>{ try{ await navigator.share({files:[file], text:"Проверьте себя: "+(PSY.siteUrl||"")}); }catch(e){} };
}

/* ===== Колесо эмоций ===== */
const EMO=[
  {k:"Радость", c:"#E3A93B", n:["воодушевление","гордость","благодарность","нежность","азарт"]},
  {k:"Спокойствие", c:"#4FA37C", n:["умиротворение","облегчение","уверенность","безопасность","расслабленность"]},
  {k:"Грусть", c:"#5B7FC7", n:["печаль","одиночество","разочарование","тоска","бессилие"]},
  {k:"Тревога", c:"#8C6BC2", n:["беспокойство","страх","растерянность","напряжение","паника"]},
  {k:"Злость", c:"#D0583F", n:["раздражение","обида","возмущение","зависть","ярость"]},
  {k:"Стыд и вина", c:"#9A7B62", n:["стыд","вина","неловкость","сожаление","неуверенность"]}
];
const emoColor = name => (EMO.find(e=>e.k===name.split("/")[0])||{c:"#888"}).c;
let emoOpen=null;
function wheelSVG(){
  const R=114, r=44, N=EMO.length;
  const pt=(rad,a)=>[120+rad*Math.cos(a), 120+rad*Math.sin(a)];
  return `<svg class="wheel" viewBox="0 0 240 240" role="group" aria-label="Колесо эмоций">${EMO.map((e,i)=>{
    const a0=-Math.PI/2+i*2*Math.PI/N+0.02, a1=-Math.PI/2+(i+1)*2*Math.PI/N-0.02;
    const [x0,y0]=pt(R,a0),[x1,y1]=pt(R,a1),[x2,y2]=pt(r,a1),[x3,y3]=pt(r,a0);
    const am=(a0+a1)/2, [tx,ty]=pt((R+r)/2,am);
    const label = e.k==="Стыд и вина" ? `<tspan x="${tx.toFixed(1)}" dy="-5">Стыд</tspan><tspan x="${tx.toFixed(1)}" dy="12">и вина</tspan>` : e.k;
    return `<g class="seg ${emoOpen===i?"on":""}" data-emo="${i}" tabindex="0" role="button" aria-label="${e.k}">
      <path d="M${x0.toFixed(1)} ${y0.toFixed(1)} A${R} ${R} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)} A${r} ${r} 0 0 0 ${x3.toFixed(1)} ${y3.toFixed(1)}Z" fill="${e.c}"/>
      <text x="${tx.toFixed(1)}" y="${(ty+4).toFixed(1)}" text-anchor="middle">${label}</text></g>`;}).join("")}
    <circle cx="120" cy="120" r="${r-6}" class="hub"/><text x="120" y="117" text-anchor="middle" class="hubt">Что я</text><text x="120" y="131" text-anchor="middle" class="hubt">чувствую?</text></svg>`;
}

/* ===== Дневник настроения ===== */
const TAGS=["работа","семья","отношения","друзья","сон","усталость","деньги","спорт","отдых","здоровье","учёба"];
let draft={mood:null,tags:[],emotions:[],note:"",good:""};
function chartSVG(list){
  const days=14, W=320, H=120, pl=22, pr=18, pt=10, pb=22;
  const now=new Date(); now.setHours(0,0,0,0);
  const pts=[];
  for(let i=days-1;i>=0;i--){ const d=new Date(now); d.setDate(d.getDate()-i);
    const es=list.filter(m=>{const x=new Date(m.ts); x.setHours(0,0,0,0); return x.getTime()===d.getTime();});
    pts.push({d, v: es.length? es.reduce((a,b)=>a+b.mood,0)/es.length : null}); }
  const x=i=>pl+i*(W-pl-pr)/(days-1), y=v=>pt+(5-v)*(H-pt-pb)/4;
  let grid=""; for(let v=1;v<=5;v++) grid+=`<line x1="${pl}" x2="${W-pr}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" stroke-width="1"/><text x="${pl-8}" y="${y(v)+3}" text-anchor="end">${v}</text>`;
  let path="", seg=false;
  pts.forEach((p,i)=>{ if(p.v==null){seg=false;return;} path+=(seg?"L":"M")+x(i).toFixed(1)+" "+y(p.v).toFixed(1)+" "; seg=true; });
  const dots=pts.map((p,i)=>p.v==null?"":`<circle cx="${x(i)}" cy="${y(p.v)}" r="4" fill="${moodColor(Math.round(p.v))}" stroke="var(--surface)" stroke-width="1.5"/>`).join("");
  const labels=pts.map((p,i)=> (i%3===1||i===days-1)?`<text x="${x(i)}" y="${H-6}" text-anchor="middle">${p.d.getDate()}.${String(p.d.getMonth()+1).padStart(2,"0")}</text>`:"").join("");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Настроение за 14 дней">${grid}<path d="${path}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round"/>${dots}${labels}</svg>`;
}
function insights(list){
  const lines=[];
  if(list.length>=4){
    const avg=list.reduce((a,b)=>a+b.mood,0)/list.length; const by={};
    list.forEach(m=>m.tags.forEach(t=>{(by[t]=by[t]||[]).push(m.mood);}));
    const rows=Object.entries(by).filter(([,v])=>v.length>=2).map(([t,v])=>[t,v.reduce((a,b)=>a+b,0)/v.length]);
    if(rows.length){ rows.sort((a,b)=>b[1]-a[1]); const best=rows[0], worst=rows[rows.length-1];
      if(best[1]-avg>=0.3) lines.push(`В дни с тегом «${best[0]}» настроение выше среднего: ${best[1].toFixed(1)} против ${avg.toFixed(1)}.`);
      if(avg-worst[1]>=0.3) lines.push(`В дни с тегом «${worst[0]}» настроение ниже: ${worst[1].toFixed(1)}.`); }
  }
  const cnt={}; list.forEach(m=>(m.emotions||[]).forEach(e=>{const k=e.split("/")[0]; cnt[k]=(cnt[k]||0)+1;}));
  const total=Object.values(cnt).reduce((a,b)=>a+b,0);
  let bars="";
  if(total>=3){
    const rows=Object.entries(cnt).sort((a,b)=>b[1]-a[1]);
    bars=`<div class="emo-bars">${rows.map(([k,v])=>`<div class="eb"><span class="small">${k}</span><span class="bar"><i style="width:${v/rows[0][1]*100}%;background:${emoColor(k)}"></i></span><span class="small muted">${v}</span></div>`).join("")}</div>`;
    lines.push(`Чаще всего вы отмечали: ${rows[0][0].toLowerCase()}.`);
  }
  if(!lines.length) return "";
  return `<div class="card soft"><h3>Наблюдения</h3>${lines.map(l=>`<p class="small">${l}</p>`).join("")}${bars}</div>`;
}
function vDiary(){
  const list=moodsAll().slice().sort((a,b)=>b.ts-a.ts);
  const avg = list.length? (list.slice(0,7).reduce((a,b)=>a+b.mood,0)/Math.min(7,list.length)).toFixed(1):"—";
  const open = emoOpen!=null ? EMO[emoOpen] : null;
  return `<div class="stack-s"><h1>Дневник</h1></div>
  <div class="card" id="newMood">
    <h3>Как вы сейчас?</h3>
    <div class="moods">${MOODS.map(m=>`<button class="mood" data-mood="${m.v}" aria-pressed="${draft.mood===m.v}">${face(m.v)}<span>${m.t}</span></button>`).join("")}</div>
    <div class="stack-s" id="emoBlock"><span class="small muted">Какая эмоция?</span>
      <div class="wheel-wrap">${wheelSVG()}</div>
      ${open?`<div class="chips">${open.n.map(n=>{const v=open.k+"/"+n; return `<button class="chip" data-emoval="${esc(v)}" aria-pressed="${draft.emotions.includes(v)}" style="--ec:${open.c}">${n}</button>`;}).join("")}</div>`:""}
      ${draft.emotions.length?`<div class="row">${draft.emotions.map(e=>`<span class="etag" style="--ec:${emoColor(e)}">${esc(e.split("/")[1])}</span>`).join("")}</div>`:""}
    </div>
    <div class="stack-s"><span class="small muted">С чем связано?</span><div class="chips">${TAGS.map(t=>`<button class="chip" data-tag="${t}" aria-pressed="${draft.tags.includes(t)}">${t}</button>`).join("")}</div></div>
    <textarea id="mNote" placeholder="Пара слов о дне (необязательно)" aria-label="Заметка">${esc(draft.note)}</textarea>
    <input type="text" id="mGood" placeholder="Что было хорошего?" aria-label="Что было хорошего" value="${esc(draft.good)}">
    <button class="btn" id="mSave" ${draft.mood?"":"disabled"}>Сохранить запись</button>
  </div>
  <div class="card">
    <div class="row" style="justify-content:space-between"><h3>14 дней</h3><span class="small muted">среднее <strong style="color:var(--ink)">${avg}</strong></span></div>
    ${isDemo()?`<div class="demo-note"><span>Это пример</span><button class="linkbtn" id="clrDemo">Убрать</button></div>`:""}
    ${chartSVG(list)}
  </div>
  ${insights(list)}
  <details class="more"><summary>Записи${list.length?` · ${list.length}`:""}</summary><div>
    ${list.length?list.slice(0,20).map(m=>`<div class="entry"><span class="dot" style="background:${moodColor(m.mood)}"></span><div class="body"><div class="row" style="justify-content:space-between"><strong>${MOODS[m.mood-1].t}</strong><span class="small muted">${fmtDT(m.ts)}</span></div>${(m.emotions||[]).length?`<div class="row">${m.emotions.map(e=>`<span class="etag" style="--ec:${emoColor(e)}">${esc(e.split("/")[1])}</span>`).join("")}</div>`:""}${m.note?`<p class="small">${esc(m.note)}</p>`:""}${m.good?`<p class="small muted">Хорошее: ${esc(m.good)}</p>`:""}${m.tags.length?`<div class="row">${m.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</div>`:""}</div></div>`).join(""):`<p class="small muted">Пока пусто</p>`}
  </div></details>`;
}
function bindDiary(){
  $$("[data-mood]").forEach(b=>b.onclick=()=>{draft.mood=+b.dataset.mood; keepDraft(); render();});
  $$("[data-tag]").forEach(b=>b.onclick=()=>{const t=b.dataset.tag; draft.tags=draft.tags.includes(t)?draft.tags.filter(x=>x!==t):[...draft.tags,t]; keepDraft(); render();});
  $$("[data-emo]").forEach(g=>{ const f=()=>{ const i=+g.dataset.emo; emoOpen = emoOpen===i?null:i; keepDraft(); const y=scrollY; render(); scrollTo(0,y); };
    g.onclick=f; g.onkeydown=e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); f(); } }; });
  $$("[data-emoval]").forEach(b=>b.onclick=()=>{ const v=b.dataset.emoval; keepDraft();
    draft.emotions = draft.emotions.includes(v) ? draft.emotions.filter(x=>x!==v) : [...draft.emotions, v].slice(-3);
    const y=scrollY; render(); scrollTo(0,y); });
  $("#mSave").onclick=()=>{ keepDraft();
    const good=draft.good.trim();
    S.moods.push({id:uid(),ts:Date.now(),mood:draft.mood,tags:draft.tags,emotions:draft.emotions,note:draft.note.trim(),good});
    if(good) S.grat.push({id:uid(), text:good, ts:Date.now(), fresh:true});
    S.demoCleared=true; save(); markDay(); award("aware", 10+(draft.emotions.length?5:0)); draft={mood:null,tags:[],emotions:[],note:"",good:""}; emoOpen=null;
    toast(good?"Запись сохранена, хорошее — в банке":"Запись сохранена"); render(); };
  const c=$("#clrDemo"); if(c) c.onclick=()=>{S.demoCleared=true; save(); render();};
  if(sub==="emo"){ sub=null; setTimeout(()=>{const e=$("#emoBlock"); if(e) e.scrollIntoView({block:"center"});},30); }
}
function keepDraft(){ const n=$("#mNote"), g=$("#mGood"); if(n) draft.note=n.value; if(g) draft.good=g.value; }

/* ===== Банка благодарностей ===== */
const JAR_COLORS=["#E3A93B","#4FA37C","#5B7FC7","#D0583F","#8C6BC2","#E07AA0","#3BA6B5"];
function ballPos(i){
  // раскладка шариков снизу вверх рядами внутри банки
  const perRow=[5,4]; let row=0, idx=i, n=0;
  while(idx >= perRow[row%2]){ idx-=perRow[row%2]; row++; }
  n=perRow[row%2];
  const r=14, gap=30, w=(n-1)*gap, cx=120-w/2+idx*gap + ((i*37)%7-3);
  const cy=316-r-row*25;
  return {x:cx, y:cy, r};
}
function vJar(){
  const list=S.grat;
  const shown=list.slice(-70);
  const balls=shown.map((g,i)=>{ const p=ballPos(i); const col=JAR_COLORS[(list.length-shown.length+i)%JAR_COLORS.length];
    return `<circle class="ball-g ${g.fresh?"drop":""}" cx="${p.x}" cy="${p.y}" r="${p.r}" fill="${col}" style="--dy:${-(p.y+40)}px" data-gid="${g.id}"><title>${esc(g.text)}</title></circle>`; }).join("");
  const fill = Math.min(1, list.length/70);
  return `${backBtn("practices","Практики")}
  <div class="stack-s"><h1>Благодарности</h1><p class="muted">Одна хорошая вещь в день</p></div>
  <div class="card jar-card">
    <svg class="jar" viewBox="0 0 240 340" role="img" aria-label="Банка: ${list.length} ${plural(list.length,"благодарность","благодарности","благодарностей")}">
      <defs><clipPath id="jarClip"><path d="M58 70 Q40 90 40 120 L40 300 Q40 330 70 330 L170 330 Q200 330 200 300 L200 120 Q200 90 182 70 Z"/></clipPath></defs>
      <rect x="70" y="30" width="100" height="26" rx="8" class="lid"/>
      <path d="M78 56 L162 56 L162 70 L78 70 Z" class="neck"/>
      <g clip-path="url(#jarClip)">${balls}</g>
      <path d="M58 70 Q40 90 40 120 L40 300 Q40 330 70 330 L170 330 Q200 330 200 300 L200 120 Q200 90 182 70 Z" class="glass"/>
      <path d="M58 110 Q54 200 60 290" class="shine"/>
    </svg>
    <p class="jar-count"><strong>${list.length}</strong> ${plural(list.length,"благодарность","благодарности","благодарностей")}</p>
    <div class="row" style="flex-wrap:nowrap;width:100%"><input type="text" id="gIn" placeholder="Что хорошего?" aria-label="Что было хорошего" style="flex:1;min-width:0" maxlength="140"><button class="btn" id="gAdd">В банку</button></div>
    ${list.length?`<button class="btn quiet" id="gRand">Достать случайную</button><p class="small" id="gShow" hidden></p>`:""}
  </div>
  ${list.length?`<details class="more"><summary>Все записи · ${list.length}</summary><div>${list.slice().reverse().slice(0,10).map(g=>`<div class="entry"><span class="dot" style="background:${JAR_COLORS[list.indexOf(g)%JAR_COLORS.length]}"></span><div class="body"><p class="small">${esc(g.text)}</p><span class="small muted">${fmtDate(g.ts)}</span></div></div>`).join("")}</div></details>`:""}`;
}
function bindJar(){
  const add=()=>{ const v=$("#gIn").value.trim(); if(!v){ $("#gIn").focus(); return; }
    S.grat.forEach(g=>delete g.fresh); S.grat.push({id:uid(), text:v, ts:Date.now(), fresh:true}); save(); markDay(); award("res",10); render();
    toast("Положили в банку"); };
  $("#gAdd").onclick=add; $("#gIn").onkeydown=e=>{ if(e.key==="Enter") add(); };
  const r=$("#gRand"); if(r) r.onclick=()=>{ const g=S.grat[Math.floor(Math.random()*S.grat.length)]; const s=$("#gShow"); s.hidden=false; s.innerHTML=`«${esc(g.text)}» · <span class="muted">${fmtDate(g.ts)}</span>`; };
  setTimeout(()=>{ let ch=false; S.grat.forEach(g=>{ if(g.fresh){ delete g.fresh; ch=true; } }); if(ch) save(); }, 1200);
}

/* ===== Дневник мыслей (КПТ) ===== */
const TSTEPS=[
  {k:"situation",t:"Ситуация",q:"Что произошло? Где, когда, с кем?",ph:"Начальник попросил зайти к нему после обеда"},
  {k:"thought",t:"Автоматическая мысль",q:"Какая мысль пришла в голову первой?",ph:"Я что‑то сделал не так, меня уволят"},
  {k:"emotion",t:"Эмоция",q:"Что вы почувствовали и насколько сильно?",ph:"Тревога, страх",scale:"before"},
  {k:"pro",t:"Факты «за»",q:"Какие факты подтверждают эту мысль?",ph:"На прошлой неделе я сдал отчёт с опозданием"},
  {k:"con",t:"Факты «против»",q:"Какие факты ей противоречат? Что бы вы сказали другу?",ph:"Отчёт приняли. Меня хвалили за проект. Он часто зовёт обсудить планы"},
  {k:"alt",t:"Новая мысль",q:"Как можно посмотреть на ситуацию реалистичнее?",ph:"Скорее всего, это рабочий вопрос. Даже если есть замечания, я с ними справлюсь",scale:"after"}
];
let TD=null;
function vThoughts(){
  if(TD) return vThoughtStep();
  const list=S.thoughts.slice().reverse();
  return `${backBtn("practices","Практики")}
  <div class="stack-s"><h1>Дневник мыслей</h1><p class="muted">Проверить тревожную мысль фактами · 6 шагов</p></div>
  <button class="btn block" id="tNew">Разобрать мысль</button>
  <div class="card"><h3>Записи</h3>
  ${list.length?list.map(r=>`<details class="entry" style="display:block"><summary style="cursor:pointer;list-style:none"><div class="row" style="justify-content:space-between"><strong style="min-width:0;overflow-wrap:anywhere">${esc(r.thought||r.situation)}</strong><span class="small muted">${fmtDate(r.ts)}</span></div><div class="small muted">${esc(r.emotion)} ${r.before}% → ${r.after}%</div></summary>
  <div class="stack-s small" style="padding-top:10px">${TSTEPS.map(s=>r[s.k]?`<div><span class="label">${s.t}</span><p style="overflow-wrap:anywhere">${esc(r[s.k])}</p></div>`:"").join("")}</div></details>`).join(""):`<p class="small muted">Пока пусто</p>`}
  </div>`;
}
function vThoughtStep(){
  const s=TSTEPS[TD.step], n=TSTEPS.length;
  return `<button class="back" id="tdBack">← ${TD.step?"Назад":"К дневнику мыслей"}</button>
  <div class="stack-s"><span class="label">Шаг ${TD.step+1} из ${n} · ${s.t}</span><div class="progress"><i style="width:${((TD.step+1)/n)*100}%"></i></div></div>
  <div class="card">
    <h2>${s.q}</h2>
    <label class="field"><span class="small muted">Например: ${esc(s.ph)}</span><textarea id="tdIn" rows="4">${esc(TD[s.k]||"")}</textarea></label>
    ${s.scale?`<label class="field"><span>${s.scale==="before"?"Сила эмоции":"Насколько сильна эмоция теперь"}: <strong id="tdV">${TD[s.scale]}%</strong></span><input type="range" id="tdR" min="0" max="100" step="5" value="${TD[s.scale]}"></label>`:""}
    <button class="btn" id="tdNext">${TD.step===n-1?"Сохранить":"Дальше"}</button>
  </div>
  ${TD.step===n-1&&TD.thought?`<div class="card"><span class="label">Было</span><p class="small">${esc(TD.thought)}</p></div>`:""}`;
}
function bindThoughts(){
  const nw=$("#tNew"); if(nw) nw.onclick=()=>{TD={step:0,before:70,after:40}; render();};
  if(!TD) return;
  const s=TSTEPS[TD.step];
  const keep=()=>{TD[s.k]=$("#tdIn").value; const r=$("#tdR"); if(r) TD[s.scale]=+r.value;};
  const r=$("#tdR"); if(r) r.oninput=()=>$("#tdV").textContent=r.value+"%";
  $("#tdBack").onclick=()=>{keep(); if(TD.step) TD.step--; else TD=null; render();};
  $("#tdNext").onclick=()=>{ keep();
    if(TD.step<TSTEPS.length-1){TD.step++; render(); scrollTo(0,0); return;}
    const {step,...rec}=TD; S.thoughts.push({...rec,id:uid(),ts:Date.now()}); save(); markDay(); award("self",20);
    const diff=TD.before-TD.after; TD=null; toast(diff>0?`Запись сохранена. Эмоция стала слабее на ${diff}%`:"Запись сохранена"); render();
  };
  setTimeout(()=>{const t=$("#tdIn"); if(t) t.focus();},50);
}

/* ===== Программы ===== */
const progData = p => (S.programs[p.id] = S.programs[p.id] || {done:{}, notes:{}});
function progState(p){
  const d=progData(p), done=d.done, n=p.days.length; let next=null;
  for(let i=1;i<=n;i++){ if(!done[i]){ next=i; break; } }
  // новый день открывается на следующий календарный день после выполнения предыдущего
  const lockedUntilTomorrow = !!(next && next>1 && dayKey(new Date(done[next-1]))===dayKey());
  return {done, n, next, count:Object.keys(done).length, lockedUntilTomorrow};
}
function dayStatus(p,i){
  const st=progState(p);
  if(st.done[i]) return "done";
  if(i===st.next) return st.lockedUntilTomorrow?"tomorrow":"open";
  return "locked";
}
function homeProgress(){
  const s=streak();
  const week=[]; for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); week.push({on:S.days.includes(dayKey(d)), l:d.toLocaleDateString("ru-RU",{weekday:"short"}).slice(0,2)}); }
  const dots=`<div class="week">${week.map(w=>`<span class="wd ${w.on?"on":""}"><i></i>${w.l}</span>`).join("")}</div>`;
  const p = PROGRAMS.find(x=>x.id===S.activeProgram);
  let prog;
  if(!p){
    prog=`<div class="stack-s"><span class="label">Начать программу</span><div class="chips">${PROGRAMS.map(x=>`<button class="chip" data-go="programs" data-sub="${x.id}">${esc(x.short)}</button>`).join("")}</div></div>`;
  } else {
    const st=progState(p);
    if(!st.next) prog=`<p class="small"><strong>Программа «${esc(p.title)}» пройдена.</strong> <button class="linkbtn" data-go="practices">Выбрать следующую</button></p>`;
    else { const d=p.days[st.next-1];
      prog = `<div class="progress"><i style="width:${st.count/st.n*100}%"></i></div>` + (st.lockedUntilTomorrow
        ? `<div><span class="label">${esc(p.title)} · день ${st.next} из ${st.n}</span><p class="small muted">Следующий день откроется завтра</p></div>`
        : `<div class="stack-s"><span class="label">${esc(p.title)} · день ${st.next} из ${st.n}</span><strong>${esc(d.title)}</strong><button class="btn" data-go="program" data-sub="${p.id}:${st.next}">${st.count?"Продолжить":"Начать"} · ${d.minutes} мин</button></div>`); }
  }
  return `<div class="card">
    <div class="row" style="justify-content:space-between"><h3>${s?`${s} ${plural(s,"день","дня","дней")} подряд`:"Ваша неделя"}</h3>${s?`<span class="tag">серия</span>`:""}</div>
    ${dots}
    ${prog}
  </div>`;
}
function programCard(p){
  const st=progState(p);
  return `<button class="card prog-card ${S.activeProgram===p.id?"active":""}" data-go="programs" data-sub="${p.id}">
    <span class="pc-top"><span class="tag" style="align-self:flex-start">${st.n} ${plural(st.n,"день","дня","дней")}</span><strong class="ct">${esc(p.title)}</strong></span>
    <span class="small muted">${st.count?`Пройдено ${st.count} из ${st.n}`:"Не начата"}</span>
    <span class="progress" style="width:100%;display:block"><i style="width:${st.count/st.n*100}%"></i></span>
  </button>`;
}
function vPrograms(){
  const p=PROGRAMS.find(x=>x.id===sub); if(!p) return vPractices();
  const st=progState(p);
  return `${backBtn("practices","Практики")}
  <div class="stack-s"><span class="label">${p.days.length} ${plural(p.days.length,"день","дня","дней")}</span><h1>${esc(p.title)}</h1><p class="muted">${esc(p.subtitle)}</p></div>
  <div class="card soft">
    <div class="days">${p.days.map((d,i)=>{const k=i+1, ds=dayStatus(p,k);
      const icon = ds==="done"?ico("check",16):ds==="open"?`<b>${k}</b>`:ico("lock",14);
      return `<button class="day ${ds}" ${ds==="locked"||ds==="tomorrow"?"disabled":""} data-go="program" data-sub="${p.id}:${k}" aria-label="День ${k}: ${esc(d.title)}"><span class="dn">${icon}</span><span class="dt"><span class="small muted">День ${k} · ${d.minutes} мин${ds==="tomorrow"?" · откроется завтра":""}</span><strong>${esc(d.title)}</strong></span></button>`;}).join("")}</div>
  </div>
  ${st.count===0?`<p class="disclaimer">Новый день открывается раз в сутки</p>`:""}`;
}
function parseProgSub(){ const [id,k]=String(sub||"").split(":"); const p=PROGRAMS.find(x=>x.id===id)||PROGRAMS[0]; return {p, k:+k||progState(p).next||1}; }
function vProgramDay(){
  const {p,k}=parseProgSub(); const d=p.days[k-1], ds=dayStatus(p,k);
  if(!d || ds==="locked"){ sub=p.id; return vPrograms(); }
  const notes=progData(p).notes;
  const act = d.action?`<button class="btn" data-go="${d.action.to}" ${d.action.sub?`data-sub="${d.action.sub}"`:""}>${esc(d.action.label)}</button>`:"";
  return `<button class="back" data-go="programs" data-sub="${p.id}">← ${esc(p.title)}</button>
  <div class="stack-s"><span class="label">День ${k} из ${p.days.length} · ${d.minutes} мин</span><h1>${esc(d.title)}</h1></div>
  <div class="card">${d.text.map(t=>`<p>${esc(t)}</p>`).join("")}</div>
  <div class="card"><h3>Задание</h3>
    <ul class="tasks">${d.tasks.map(t=>`<li>${esc(t)}</li>`).join("")}</ul>
    ${act}
  </div>
  ${d.ask?`<div class="card"><label class="field"><span>${esc(d.ask)}</span><textarea id="pNote" placeholder="Для себя">${esc(notes[k]||"")}</textarea></label></div>`:""}
  ${ds==="done"
    ? `<div class="card soft"><div class="row">${ico("check",20)}<strong>День выполнен ${fmtDate(progData(p).done[k])}</strong></div>${d.final?finalBlock(p):""}</div>`
    : ds==="tomorrow" ? `<p class="disclaimer">Откроется завтра</p>`
    : `<button class="btn block" id="pDone">${ico("check",18)} Готово</button>`}`;
}
function finalBlock(p){
  let cmp="";
  if(p.compareTest){ const t=TESTS[p.compareTest]; const g=S.tests.filter(x=>x.id===p.compareTest);
    if(g.length>=2){ const a=g[0].score, b=g[g.length-1].score, d=a-b;
      cmp=`<p class="small">${t.title} в начале: <strong>${a}</strong>, сейчас: <strong>${b}</strong> ${t.unit}. ${d>0?`Снижение на ${d} ${plural(d,"балл","балла","баллов")}.`:"Результат пока не изменился, это тоже важная информация."}</p>`; } }
  return `${cmp}<button class="btn" data-go="about" data-sub="book">Обсудить итоги с ${esc(PSY.nameWith)}</button>`;
}
function bindProgramDay(){
  const {p,k}=parseProgSub(); const data=progData(p);
  const n=$("#pNote"); if(n) n.oninput=()=>{ data.notes[k]=n.value; save(); };
  const b=$("#pDone"); if(b) b.onclick=()=>{ data.done[k]=Date.now(); S.activeProgram=p.id; save(); markDay(); award(PROG_SKILL[p.id]||"self",25);
    toast(k===p.days.length?"Программа пройдена":"День "+k+" выполнен"); render(); window.scrollTo(0,0); };
}

/* ===== Практики и статьи ===== */
function vPractices(){
  return `<div class="stack-s"><h1>Практики</h1></div>
  <div class="stack-s"><span class="label">Программы</span><div class="carousel">${PROGRAMS.map(programCard).join("")}</div></div>
  ${window.roomsRow?roomsRow():window.loveBanner?loveBanner():""}
  <button class="banner card" data-go="cards"><span class="mak-thumb">${typeof cardBack==="function"?cardBack():""}</span><span class="bt"><strong>Метафорические карты</strong><span class="small muted">Карта дня и расклады</span></span><span class="chev">›</span></button>
  <button class="banner card" data-go="sounds"><span class="bi">${ico("moon",20)}</span><span class="bt"><strong>Звуки для сна</strong><span class="small muted">Дождь, море, лес, костёр, поющая чаша</span></span><span class="chev">›</span></button>
  <div class="stack-s"><span class="label">Упражнения</span>
  ${reliefStats()}
  <div class="grid2">
    <button class="tile" data-go="breath"><span class="ico">${ico("wind")}</span><strong>Дыхание</strong><span class="small muted">2 мин</span></button>
    <button class="tile" data-go="pmr"><span class="ico">${ico("body")}</span><strong>Расслабление мышц</strong><span class="small muted">3 мин</span></button>
    <button class="tile" data-go="ground"><span class="ico">${ico("hand")}</span><strong>Заземление</strong><span class="small muted">2 мин</span></button>
    <button class="tile" data-go="thoughts"><span class="ico">${ico("thoughts")}</span><strong>Дневник мыслей</strong><span class="small muted">5 мин</span></button>
    <button class="tile" data-go="diary" data-sub="emo"><span class="ico">${ico("emo")}</span><strong>Колесо эмоций</strong><span class="small muted">1 мин</span></button>
    <button class="tile" data-go="jar"><span class="ico">${ico("jar")}</span><strong>Благодарности</strong><span class="small muted">${S.grat.length?`В банке: ${S.grat.length}`:"1 мин"}</span></button>
  </div></div>
  <div class="stack-s"><span class="label">Почитать</span><div class="list">
    ${ART.map(a=>`<button class="li" data-go="article" data-sub="${a.id}"><span class="ico">${ico(S.read.includes(a.id)?"check":"book",18)}</span><span class="dt"><strong>${esc(a.title)}</strong><span class="small muted">${a.minutes} мин</span></span><span class="chev">›</span></button>`).join("")}
  </div></div>`;
}
function vArticle(){
  const a=ART.find(x=>x.id===sub); if(!a) return vPractices();
  if(!S.read.includes(a.id)){ S.read.push(a.id); save(); setTimeout(()=>{ checkBadges(); award("self",5); },0); }
  return `${backBtn("practices","Практики")}
  <article class="stack">
    <div class="stack-s"><span class="label">${a.minutes} мин чтения</span><h1>${esc(a.title)}</h1><p class="lead">${esc(a.lead)}</p></div>
    ${a.body.map(t=>`<p>${esc(t)}</p>`).join("")}
  </article>
  <div class="card soft">
    <div class="row"><div class="logo">${esc(PSY.name[0])}</div><strong>${esc(PSY.name)}, ${esc(PSY.role.toLowerCase())}</strong></div>
    <p class="small">Узнали себя? Разберём вашу ситуацию.</p>
    <div class="row"><button class="btn" data-go="about" data-sub="book">Записаться</button><button class="btn quiet" data-share>${ico("share",18)} Поделиться</button></div>
  </div>`;
}

/* ===== Психолог и запись ===== */
let bookText="", BK={name:"",fmt:"Онлайн",time:"",req:""};
function vAbout(){
  const contact = PSY.telegram?`<a class="btn ghost" href="https://t.me/${encodeURIComponent(PSY.telegram)}" target="_blank" rel="noopener">Открыть Telegram</a>`:"";
  return `<div class="card">
    <div class="row" style="gap:16px;flex-wrap:nowrap"><div class="avatar">${esc(PSY.name[0])}</div><div class="stack-s" style="min-width:0"><h2>${esc(PSY.name)}</h2><p class="small muted">${esc(PSY.role)}</p><p class="small muted">${esc(PSY.formats)}</p></div></div>
    <p>${esc(PSY.about)}</p>
    <div class="stack-s"><span class="label">С чем работаю</span><div class="chips">${PSY.topics.map(t=>`<span class="tag" style="font-size:.85rem;padding:5px 12px">${esc(t)}</span>`).join("")}</div></div>
  </div>
  <div class="card" id="book">
    <h3>Записаться на консультацию</h3>
    <p class="small muted">${PSY.telegram?"Заполните — откроется чат с готовым сообщением":"Заполните и скопируйте заявку"}</p>
    <form id="bForm" class="stack-s" novalidate>
      <label class="field"><span>Как к вам обращаться</span><input type="text" id="bName" required value="${esc(BK.name)}"></label>
      <label class="field"><span>Формат</span><select id="bFmt">${["Онлайн","Очно","Пока не знаю"].map(o=>`<option ${BK.fmt===o?"selected":""}>${o}</option>`).join("")}</select></label>
      <label class="field"><span>Удобное время</span><input type="text" id="bTime" placeholder="Например, будни после 18:00" value="${esc(BK.time)}"></label>
      <label class="field"><span>С чем хотите поработать</span><textarea id="bReq" placeholder="Коротко, в двух‑трёх предложениях">${esc(BK.req)}</textarea></label>
      <button class="btn" type="submit">${PSY.telegram?"Отправить в Telegram":"Подготовить заявку"}</button>
    </form>
    ${bookText?`<p class="small muted">Если текст не подставился в чат — скопируйте его:</p><div class="copybox" id="bOut">${esc(bookText)}</div><div class="row"><button class="btn quiet" id="bCopy">Скопировать текст</button>${contact}</div>`:""}
    <div class="stack-s small">
      <div><span class="label">Telegram</span><div>${PSY.telegram?`<a class="tap" href="https://t.me/${encodeURIComponent(PSY.telegram)}" target="_blank" rel="noopener" style="color:inherit;font-weight:600">@${esc(PSY.telegram)}</a>`:'<span class="muted">появится после настройки</span>'}</div></div>
      <div><span class="label">Телефон</span><div class="phone" style="font-size:1rem">${PSY.phone?`<a class="tap" href="tel:${esc(PSY.phone.replace(/[^+\d]/g,""))}" style="color:inherit">${esc(PSY.phone)}</a>`:'<span class="muted" style="font-weight:400">появится после настройки</span>'}</div></div>
    </div>
  </div>
  <div class="card">
    <h3>Что обсудить на сессии</h3>
    
    <div class="row" style="flex-wrap:nowrap"><input type="text" id="nIn" placeholder="Тема для сессии" aria-label="Что обсудить на сессии" style="flex:1;min-width:0"><button class="btn" id="nAdd" aria-label="Добавить">+</button></div>
    ${S.notes.length?S.notes.slice().reverse().map(n=>`<div class="entry"><input type="checkbox" data-nd="${n.id}" ${n.done?"checked":""} style="margin-top:5px;accent-color:var(--accent)" aria-label="Обсудили"><div class="body"><p class="small" style="${n.done?"text-decoration:line-through;color:var(--muted)":""}">${esc(n.text)}</p><span class="small muted">${fmtDate(n.ts)}</span></div><button class="linkbtn small" data-ndel="${n.id}">Удалить</button></div>`).join(""):`<p class="small muted">Список пуст.</p>`}
  </div>
  <div class="card">
    <button class="btn quiet" data-share style="align-self:flex-start">${ico("share",18)} Поделиться приложением</button>
    <h3>Конфиденциальность</h3>
    <p class="small">Без регистрации и рекламы. Записи хранятся только на этом устройстве.</p>
    <button class="linkbtn small" id="wipe" style="align-self:flex-start">Удалить все мои данные</button>
    <div id="wipeConfirm" hidden class="demo-note"><span>Удалить все записи без возможности восстановить?</span><span class="row"><button class="btn quiet" id="wipeNo">Отмена</button><button class="btn sosb" id="wipeYes">Удалить</button></span></div>
  </div>`;
}
function bindAbout(){
  $("#bForm").onsubmit=e=>{ e.preventDefault();
    BK={name:$("#bName").value,fmt:$("#bFmt").value,time:$("#bTime").value,req:$("#bReq").value};
    const name=BK.name.trim(); if(!name){ $("#bName").focus(); toast("Укажите, как к вам обращаться"); return; }
    bookText=`Здравствуйте, ${PSY.name}! Хочу записаться на консультацию.\nИмя: ${name}\nФормат: ${BK.fmt}\nУдобное время: ${BK.time.trim()||"обсудим"}\nЗапрос: ${BK.req.trim()||"расскажу на встрече"}`;
    if(PSY.telegram){
      try{ window.open(`https://t.me/${encodeURIComponent(PSY.telegram)}?text=${encodeURIComponent(bookText)}`, "_blank", "noopener"); }catch(err){}
      try{ navigator.clipboard.writeText(bookText).catch(()=>{}); }catch(err){}
    }
    render(); $("#bOut").scrollIntoView({behavior:"smooth",block:"center"});
  };
  const c=$("#bCopy"); if(c) c.onclick=()=>copy(bookText,$("#bOut"));
  const add=()=>{const v=$("#nIn").value.trim(); if(!v) return; S.notes.push({id:uid(),text:v,ts:Date.now(),done:false}); save(); render();};
  $("#nAdd").onclick=add; $("#nIn").onkeydown=e=>{if(e.key==="Enter") add();};
  $$("[data-nd]").forEach(b=>b.onchange=()=>{const n=S.notes.find(x=>x.id===b.dataset.nd); n.done=b.checked; save(); render();});
  $$("[data-ndel]").forEach(b=>b.onclick=()=>{S.notes=S.notes.filter(x=>x.id!==b.dataset.ndel); save(); render();});
  $("#wipe").onclick=()=>$("#wipeConfirm").hidden=false;
  $("#wipeNo").onclick=()=>$("#wipeConfirm").hidden=true;
  $("#wipeYes").onclick=()=>{S=empty(); S.grat=[]; if(typeof gInit==="function") gInit(); save(); toast("Данные удалены"); render();};
  if(sub==="book"){ sub=null; setTimeout(()=>$("#book").scrollIntoView({block:"start"}),30); }
}

/* ===== Поделиться ===== */
document.addEventListener("click", async e=>{
  const b=e.target.closest("[data-share]"); if(!b) return;
  const url = PSY.siteUrl || (location.protocol.startsWith("http") ? location.origin+location.pathname : "");
  const text = `Опора — бесплатная карманная поддержка от психолога ${PSY.name}: снять напряжение, проверить выгорание и тревогу, дневник настроения. Без регистрации.`;
  try{ if(navigator.share){ await navigator.share({title:"Опора", text, url: url||undefined}); return; } }catch(err){ if(err && err.name==="AbortError") return; }
  try{ await navigator.clipboard.writeText(url?text+" "+url:text); toast("Ссылка скопирована. Отправьте её другу"); }
  catch(err){ toast("Не удалось скопировать ссылку"); }
});

/* ===== Установка на телефон ===== */
let installEvt=null;
const isStandalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
window.addEventListener("beforeinstallprompt", e=>{ e.preventDefault(); installEvt=e; if(route==="home") render(); });
window.addEventListener("appinstalled", ()=>{ installEvt=null; toast("Приложение установлено"); if(route==="home") render(); });
function installCard(){
  if(isStandalone() || S.installHidden) return "";
  const how = installEvt
    ? `<button class="btn" id="installBtn">Установить</button>`
    : isIOS()
      ? `<p class="small">Safari → «Поделиться» → «На экран Домой»</p>`
      : `<p class="small">Меню браузера ⋮ → «Добавить на главный экран»</p>`;
  return `<div class="card soft"><div class="row" style="justify-content:space-between;flex-wrap:nowrap"><h3>Установить на телефон</h3><button class="linkbtn small" id="installHide">Скрыть</button></div>${how}</div>`;
}

/* ===== Рендер ===== */
const VIEWS={home:[vHome,bindHome], sos:[vSOS,null], ground:[vGround,bindGround], breath:[vBreath,bindBreath], pmr:[vPmr,bindPmr],
  tests:[vTests,bindTests], diary:[vDiary,bindDiary], thoughts:[vThoughts,bindThoughts], about:[vAbout,bindAbout],
  practices:[vPractices,null], programs:[vPrograms,null], program:[vProgramDay,bindProgramDay], article:[vArticle,null],
  jar:[vJar,bindJar], badges:[vBadges,null]};
function render(){
  if(route==="thoughts" && sub==="new"){ TD={step:0,before:70,after:40}; sub=null; }
  const [v,b]=VIEWS[route]||VIEWS.home;
  const room=window.ROOM_OF?ROOM_OF(route):"";
  if((document.documentElement.dataset.room||"")!==room){ if(room) document.documentElement.dataset.room=room; else delete document.documentElement.dataset.room; }
  $("#app").innerHTML=`<main class="view">${v()}</main>`;
  renderTabs();
  if(b) b();
  if(window.SND) SND.pill();
}

/* ===== Адрес страницы: #sos, #diary и т.д. ===== */
window.addEventListener("popstate",e=>{ const st=e.state||{}; const h=st.r||location.hash.slice(1)||"home"; go._pop=true; try{ go(VIEWS[h]?h:"home", st.s||null); } finally { go._pop=false; } });
function boot(){
  const h0=(location.hash||"").slice(1);
  if(VIEWS[h0] && !["program","programs","article"].includes(h0)) route=h0;
  render();
  checkBadges();
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", boot); else setTimeout(boot,0);

/* ===== Офлайн-режим ===== */
if("serviceWorker" in navigator && location.protocol.startsWith("http")){
  window.addEventListener("load", ()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
}
