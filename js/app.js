const PSY = window.PSY;

/* ===== Хранилище на устройстве ===== */
const KEY = "opora_v1";
const empty = () => ({moods:[], thoughts:[], tests:[], notes:[], demoCleared:false, days:[], program:{done:{}, notes:{}}});
let S = empty();
function load(){ try{ const raw = localStorage.getItem(KEY); if(raw) S = Object.assign(empty(), JSON.parse(raw)); }catch(e){}
  if(!S.program||!S.program.done) S.program={done:{},notes:{}}; if(!Array.isArray(S.days)) S.days=[]; }
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
load();

/* примеры записей, пока пользователь не добавил свои */
function demoMoods(){
  const tags=[["работа"],["сон","семья"],["работа","усталость"],["спорт"],["друзья"],["работа"],["отдых","семья"],["сон"],["работа","усталость"],["спорт","друзья"]];
  const vals=[3,4,2,4,5,3,4,3,2,4];
  const notes=["Много встреч, к вечеру голова гудела","Выспался, утро спокойное","Дедлайн, тревожно","Пробежка 3 км","Встретились с другом, долго гуляли","Обычный день","Ездили к родителям","Проснулся в 4 утра","Опять задержался на работе","Йога и ужин с друзьями"];
  const now=new Date(); const out=[];
  vals.forEach((v,i)=>{ const d=new Date(now); d.setDate(d.getDate()-(vals.length-i)); d.setHours(20,0,0,0);
    out.push({id:"demo"+i, ts:d.getTime(), mood:v, tags:tags[i], note:notes[i], good:"", demo:true}); });
  return out;
}
function moodsAll(){ if(!S.moods.length && !S.demoCleared) return demoMoods(); return S.moods; }
const isDemo = () => !S.moods.length && !S.demoCleared;

/* ===== Серия дней ===== */
const dayKey = (d=new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
function markDay(){ const k=dayKey(); if(!S.days.includes(k)){ S.days.push(k); save(); } }
function streak(){
  const set=new Set(S.days); let n=0; const d=new Date();
  if(!set.has(dayKey(d))) d.setDate(d.getDate()-1);
  while(set.has(dayKey(d))){ n++; d.setDate(d.getDate()-1); }
  return n;
}
const plural=(n,a,b,c)=>{const m10=n%10,m100=n%100; return m10===1&&m100!==11?a:(m10>=2&&m10<=4&&(m100<12||m100>14)?b:c);};

/* ===== Утилиты ===== */
const $ = (s,el=document)=>el.querySelector(s);
const esc = s => String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid = () => Math.random().toString(36).slice(2,10);
const fmtDate = ts => new Date(ts).toLocaleDateString("ru-RU",{day:"numeric",month:"long"});
const fmtDT = ts => new Date(ts).toLocaleString("ru-RU",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
function toast(t){ const el=$("#toast"); el.textContent=t; el.hidden=false; clearTimeout(toast._t); toast._t=setTimeout(()=>el.hidden=true,2200); }
async function copy(text, el){
  try{ await navigator.clipboard.writeText(text); toast("Скопировано"); }
  catch(e){ if(el){ const r=document.createRange(); r.selectNodeContents(el); const s=getSelection(); s.removeAllRanges(); s.addRange(r);} toast("Выделено — скопируйте вручную"); }
}

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
  wind:'<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h7"/>',
  hand:'<path d="M8 13V5a1.5 1.5 0 0 1 3 0v6M11 11V4a1.5 1.5 0 0 1 3 0v7M14 11V5a1.5 1.5 0 0 1 3 0v8a7 7 0 0 1-7 7 6 6 0 0 1-5-3l-2-4a1.5 1.5 0 0 1 2.5-1.5L8 14"/>',
  heart:'<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
  cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  practices:'<path d="M5 19c0-8 5-14 15-15-1 10-7 15-15 15z"/><path d="M5 19c3-4 6-7 10-10"/>',
  book:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
  share:'<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"/>',
  check:'<path d="m5 12 5 5 9-10"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'
};
const ico = (n,sz=20)=>`<svg viewBox="0 0 24 24" width="${sz}" height="${sz}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;

/* ===== Навигация ===== */
const TABS=[["home","Главная"],["tests","Тесты"],["diary","Дневник"],["practices","Практики"],["about","Психолог"]];
let route="home", sub=null;
function go(r, s=null){ stopBreath(); route=r; sub=s; render(); window.scrollTo(0,0); }
function renderTabs(){
  const main = ["sos","breath"].includes(route) ? "home" : ["thoughts","program","article"].includes(route) ? "practices" : route;
  $("#tabs").innerHTML = TABS.map(([k,t])=>`<button data-go="${k}" ${main===k?'aria-current="page"':''}>${ico(k,22)}<span>${t}</span></button>`).join("");
}
document.addEventListener("click", e=>{
  const g=e.target.closest("[data-go]"); if(g){ go(g.dataset.go, g.dataset.sub||null); }
});

function header(){
  return `<div class="top"><div class="brand"><div class="logo">О</div><div><div style="font-weight:700">Опора</div><div class="small muted">с психологом ${esc(PSY.nameWith)}</div></div></div><button class="sos-pill" data-go="sos">SOS</button></div>`;
}

/* ===== Главная ===== */
let pickMood=null;
function vHome(){
  const h=new Date().getHours();
  const hi = h<6?"Доброй ночи":h<12?"Доброе утро":h<18?"Добрый день":"Добрый вечер";
  const today = S.moods.find(m=>new Date(m.ts).toDateString()===new Date().toDateString());
  return `${header()}
  <div class="stack-s"><h1>${hi}</h1><p class="muted">Как вы себя чувствуете сейчас?</p></div>
  <div class="card">
    ${today?`<div class="row">${face(today.mood)}<div><strong>Сегодня: ${MOODS[today.mood-1].t.toLowerCase()}</strong><div class="small muted">Отметка в ${new Date(today.ts).toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit"})}. Можно добавить ещё одну.</div></div></div>`:""}
    <div class="moods">${MOODS.map(m=>`<button class="mood" data-qm="${m.v}">${face(m.v)}<span>${m.t}</span></button>`).join("")}</div>
    <p class="small muted">Нажмите — и добавьте подробности в дневнике.</p>
  </div>
  ${homeProgress()}
  ${installCard()}
  <div class="card sos">
    <div class="stack-s"><h3>Накрыло прямо сейчас?</h3><p class="small">Дыхание, заземление и что делать при панической атаке. Займёт 2–5 минут.</p></div>
    <button class="btn sosb" data-go="sos">Открыть быструю помощь</button>
  </div>
  <div class="grid2">
    <button class="tile" data-go="breath"><span class="ico">${ico("wind")}</span><strong>Дыхание «квадрат»</strong><span class="small muted">4 секунды на шаг</span></button>
    <button class="tile" data-go="tests"><span class="ico">${ico("tests")}</span><strong>Проверить состояние</strong><span class="small muted">Тревога и настроение</span></button>
    <button class="tile" data-go="thoughts" data-sub="new"><span class="ico">${ico("thoughts")}</span><strong>Разобрать мысль</strong><span class="small muted">Дневник КПТ</span></button>
    <button class="tile" data-go="about" data-sub="book"><span class="ico">${ico("cal")}</span><strong>Записаться</strong><span class="small muted">к ${esc(PSY.nameTo)}</span></button>
  </div>
  <button class="btn quiet block" data-share>${ico("share",18)} Поделиться Опорой с другом</button>
  <p class="disclaimer">Приложение помогает между встречами и не заменяет консультацию специалиста. Ваши записи хранятся только на этом устройстве.</p>`;
}

/* ===== SOS ===== */
let groundStep=0;
const GROUND=[
  ["5","вещей, которые вы видите","Назовите их про себя или вслух. Например: лампа, кружка, окно."],
  ["4","вещи, которые можно потрогать","Ощутите их фактуру: ткань одежды, стол, телефон в руке."],
  ["3","звука, которые вы слышите","Шум улицы, гул техники, собственное дыхание."],
  ["2","запаха","Если запахов нет, вспомните два любимых."],
  ["1","вкус","Отпейте воды или просто заметите вкус во рту."]
];
function vSOS(){
  const g=GROUND[groundStep];
  return `<button class="back" data-go="home">← Назад</button>
  <div class="stack-s"><h1>Быстрая помощь</h1><p class="muted">Вы в безопасности. Делайте по одному шагу.</p></div>
  <div class="card">
    <div class="row" style="justify-content:space-between"><h3>Дыхание «квадрат»</h3><span class="tag">2 минуты</span></div>
    <p class="small muted">Медленное дыхание с паузами снижает возбуждение нервной системы.</p>
    <button class="btn" data-go="breath">Начать дыхание</button>
  </div>
  <div class="card">
    <div class="row" style="justify-content:space-between"><h3>Заземление 5‑4‑3‑2‑1</h3><span class="tag">${groundStep+1} из 5</span></div>
    <div class="progress"><i style="width:${(groundStep+1)*20}%"></i></div>
    <div class="row" style="align-items:flex-end;gap:12px"><span class="big-num">${g[0]}</span><strong style="font-size:1.1rem;padding-bottom:4px">${g[1]}</strong></div>
    <p class="small">${g[2]}</p>
    <div class="row"><button class="btn quiet" id="gPrev" ${groundStep===0?"disabled":""}>Назад</button><button class="btn" id="gNext">${groundStep===4?"Начать заново":"Дальше"}</button></div>
  </div>
  <div class="card">
    <h3>Если это паническая атака</h3>
    <ol class="steps small">
      <li>Скажите себе: «Это паническая атака. Она неприятна, но не опасна и пройдёт». Пик обычно наступает в первые 10 минут, затем волна спадает.</li>
      <li>Не боритесь с ощущениями. Позвольте им быть и наблюдайте, как они меняются.</li>
      <li>Сделайте выдох длиннее вдоха: вдох на 4 счёта, выдох на 6.</li>
      <li>Упритесь стопами в пол, сожмите и разожмите кулаки 5 раз.</li>
      <li>Когда станет легче, запишите, что случилось перед атакой. Обсудим это на сессии.</li>
    </ol>
  </div>
  <div class="card sos">
    <h3>Если вам угрожает опасность</h3>
    <p class="small">Если есть мысли причинить себе вред или вы не справляетесь, обратитесь за помощью сейчас.</p>
    <div class="stack-s">
      <div><div class="label">Экстренные службы</div><div class="phone">112</div></div>
      <div><div class="label">Детский телефон доверия, бесплатно</div><div class="phone">8 800 2000 122</div></div>
      <div><div class="label">Психологическая помощь МЧС онлайн</div><a href="https://psi.mchs.gov.ru/" target="_blank" rel="noopener" style="color:var(--ink);font-weight:600">psi.mchs.gov.ru</a></div>
    </div>
  </div>`;
}
function bindSOS(){
  $("#gNext").onclick=()=>{ groundStep = groundStep===4?0:groundStep+1; render(); };
  $("#gPrev").onclick=()=>{ if(groundStep>0){groundStep--; render();} };
}

/* ===== Дыхание ===== */
const PHASES=[["Вдох",1],["Задержка",1],["Выдох",.55],["Задержка",.55]];
let bTimer=null, bState={running:false, phase:0, sec:4, cycles:0};
function vBreath(){
  return `<button class="back" data-go="sos">← Быстрая помощь</button>
  <div class="stack-s"><h1>Дыхание «квадрат»</h1><p class="muted">Вдох, пауза, выдох, пауза — по 4 секунды. Сделайте 4–6 кругов.</p></div>
  <div class="card">
    <div class="breath-wrap"><div class="breath"><div class="ring"></div><div class="ball" id="ball"></div><div class="txt"><div class="phase" id="bPhase">Готовы?</div><div class="count" id="bCount">4</div></div></div></div>
    <p class="small muted" style="text-align:center" id="bCycles">Кругов: 0</p>
    <button class="btn block" id="bBtn">Начать</button>
  </div>
  <p class="disclaimer">Если кружится голова, вернитесь к обычному дыханию.</p>`;
}
function bindBreath(){ $("#bBtn").onclick=()=> bState.running?stopBreath(true):startBreath(); }
function applyPhase(){
  const [t,s]=PHASES[bState.phase]; const b=$("#ball"); if(!b) return;
  $("#bPhase").textContent=t; $("#bCount").textContent=bState.sec; b.style.transform=`scale(${s})`;
}
function startBreath(){
  bState={running:true, phase:0, sec:4, cycles:0}; $("#bBtn").textContent="Остановить"; applyPhase();
  bTimer=setInterval(()=>{
    bState.sec--;
    if(bState.sec===0){ bState.phase=(bState.phase+1)%4; bState.sec=4; if(bState.phase===0){bState.cycles++; if(bState.cycles===2) markDay(); const c=$("#bCycles"); if(c) c.textContent="Кругов: "+bState.cycles;} }
    applyPhase();
  },1000);
}
function stopBreath(ui){
  clearInterval(bTimer); bTimer=null; const was=bState.running; bState.running=false;
  if(ui && was){ $("#bBtn").textContent="Начать снова"; $("#bPhase").textContent="Отлично"; $("#ball").style.transform="scale(.55)"; }
}

/* ===== Тесты ===== */
const OPTS=[["Ни разу",0],["Несколько дней",1],["Больше половины дней",2],["Почти каждый день",3]];
const TESTS={
  gad7:{title:"Тревожность", code:"GAD‑7", desc:"7 вопросов о тревоге за последние 2 недели. Около 2 минут.", max:21,
    q:["Нервозность, тревога или ощущение, что вы «на грани»","Неспособность остановить или контролировать беспокойство","Чрезмерное беспокойство о разных вещах","Трудно расслабиться","Такое беспокойство, что трудно усидеть на месте","Лёгкая раздражительность или вспыльчивость","Страх, что может случиться что‑то ужасное"],
    levels:[[4,"Минимальная","ok","Уровень тревоги сейчас в пределах обычного. Продолжайте замечать своё состояние и пользоваться дыхательными практиками, когда нужно."],
            [9,"Лёгкая","m3","Тревога заметна, но обычно с ней можно работать самостоятельно: дневник мыслей, режим сна, дыхание. Если состояние держится дольше месяца, стоит обсудить его со специалистом."],
            [14,"Умеренная","m2","Тревога ощутимо влияет на жизнь. Это частый запрос, и с ним хорошо работает когнитивно‑поведенческая терапия. Рекомендую консультацию."],
            [21,"Выраженная","m1","Тревога сильная и, скорее всего, сильно мешает. Пожалуйста, не оставайтесь с этим в одиночку: запишитесь на консультацию к психологу или к врачу‑психиатру."]]},
  phq9:{title:"Настроение", code:"PHQ‑9", desc:"9 вопросов о настроении за последние 2 недели. Около 3 минут.", max:27,
    q:["Мало интереса или удовольствия от привычных занятий","Подавленность, уныние или безнадёжность","Трудности с засыпанием, прерывистый сон или слишком много сна","Усталость или упадок сил","Плохой аппетит или переедание","Плохое мнение о себе: ощущение, что вы неудачник или подвели себя или близких","Трудно сосредоточиться, например на чтении или фильме","Вы двигаетесь или говорите так медленно, что это заметно окружающим. Или наоборот: суетливость, не можете усидеть на месте","Мысли, что лучше было бы умереть, или мысли причинить себе вред"],
    levels:[[4,"Минимальная","ok","Признаков сниженного настроения почти нет. Поддерживайте то, что вам помогает: сон, движение, общение."],
            [9,"Лёгкая","m3","Есть признаки сниженного настроения. Попробуйте каждый день отмечать настроение в дневнике и добавить приятные дела. Если через 2–3 недели не станет лучше, обсудим это на консультации."],
            [14,"Умеренная","m2","Настроение заметно снижено. С этим стоит работать вместе со специалистом, самостоятельные усилия могут даваться тяжело. Рекомендую консультацию."],
            [19,"Умеренно‑тяжёлая","m1","Состояние серьёзное. Рекомендую не откладывать консультацию психолога и показаться врачу‑психиатру или психотерапевту."],
            [27,"Тяжёлая","m1","Состояние очень тяжёлое. Пожалуйста, обратитесь к врачу‑психиатру в ближайшее время. Вы не обязаны справляться с этим в одиночку."]]}
};
let T={id:null, i:0, a:[]};
function vTests(){
  if(T.id && T.i < TESTS[T.id].q.length) return vQuestion();
  if(T.id) return vResult();
  const hist=S.tests.slice().reverse().slice(0,6);
  return `<div class="stack-s"><h1>Проверить состояние</h1><p class="muted">Короткие опросники, которыми пользуются психологи по всему миру. Результат не диагноз, а повод внимательнее посмотреть на себя.</p></div>
  ${Object.entries(TESTS).map(([k,t])=>`<div class="card"><div class="row" style="justify-content:space-between"><h3>${t.title}</h3><span class="tag">${t.code}</span></div><p class="small muted">${t.desc}</p><button class="btn" data-test="${k}">Пройти тест</button></div>`).join("")}
  ${hist.length?`<div class="card"><h3>Ваши результаты</h3>${hist.map(r=>{const t=TESTS[r.id]; const l=level(r.id,r.score); return `<div class="entry"><span class="dot" style="background:var(--${l[2]==='ok'?'ok':l[2]})"></span><div class="body"><strong>${t.title}: ${r.score} из ${t.max}</strong><span class="small muted">${l[1]} · ${fmtDate(r.ts)}</span></div></div>`}).join("")}</div>`:""}`;
}
const level=(id,score)=>TESTS[id].levels.find(l=>score<=l[0]);
function vQuestion(){
  const t=TESTS[T.id], n=t.q.length;
  return `<button class="back" id="tBack">← ${T.i?"Предыдущий вопрос":"К тестам"}</button>
  <div class="stack-s"><span class="label">${t.title} · вопрос ${T.i+1} из ${n}</span><div class="progress"><i style="width:${(T.i/n)*100}%"></i></div></div>
  <div class="card">
    <p class="small muted">Как часто за последние 2 недели вас беспокоило:</p>
    <h2>${t.q[T.i]}</h2>
    <div class="opts">${OPTS.map(([o,v])=>`<button class="opt" data-ans="${v}"><span>${o}</span><b>${v}</b></button>`).join("")}</div>
  </div>`;
}
function vResult(){
  const t=TESTS[T.id]; const score=T.a.reduce((x,y)=>x+y,0); const l=level(T.id,score);
  const risk = T.id==="phq9" && T.a[8]>0;
  const col = l[2]==="ok"?"var(--ok)":`var(--${l[2]})`;
  const segs = t.levels.map((lv,i)=>{const prev=i?t.levels[i-1][0]:-1; return `<span style="flex:${lv[0]-prev};background:${lv[2]==='ok'?'var(--ok)':'var(--'+lv[2]+')'};opacity:${lv===l?1:.3}"></span>`}).join("");
  return `<button class="back" id="tDone">← К тестам</button>
  <div class="card">
    <span class="label">${t.title} · ${t.code}</span>
    <div class="row" style="align-items:flex-end;gap:10px"><span class="big-num">${score}</span><span class="muted" style="padding-bottom:6px">из ${t.max}</span></div>
    <div class="scale" aria-hidden="true">${segs}</div>
    <div><span class="result-sev" style="background:var(--surface-2);color:${col}">${l[1]} выраженность</span></div>
  </div>
  ${risk?`<div class="card sos"><h3>Вы отметили мысли о смерти или вреде себе</h3><p class="small">Это важно. Пожалуйста, поговорите с кем‑то уже сегодня: с близким человеком, специалистом или по телефону экстренной помощи 112.</p><button class="btn sosb" data-go="sos">Где получить помощь</button></div>`:""}
  <div class="card soft">
    <div class="row"><div class="logo">${esc(PSY.name[0])}</div><strong>Комментарий психолога</strong></div>
    <p>${l[3]}</p>
    <button class="btn" data-go="about" data-sub="book">Обсудить результат с ${esc(PSY.nameWith)}</button>
  </div>
  <p class="disclaimer">Опросник помогает оценить состояние, но не ставит диагноз. Диагноз может поставить только врач.</p>`;
}
function bindTests(){
  document.querySelectorAll("[data-test]").forEach(b=>b.onclick=()=>{T={id:b.dataset.test,i:0,a:[]}; render(); scrollTo(0,0);});
  document.querySelectorAll("[data-ans]").forEach(b=>b.onclick=()=>{
    T.a[T.i]=+b.dataset.ans; T.i++;
    if(T.i===TESTS[T.id].q.length){ S.tests.push({id:T.id, score:T.a.reduce((x,y)=>x+y,0), ts:Date.now()}); save(); markDay(); }
    render(); scrollTo(0,0);
  });
  const bk=$("#tBack"); if(bk) bk.onclick=()=>{ if(T.i>0){T.i--;} else T={id:null,i:0,a:[]}; render(); };
  const dn=$("#tDone"); if(dn) dn.onclick=()=>{T={id:null,i:0,a:[]}; render();};
}

/* ===== Дневник настроения ===== */
const TAGS=["работа","семья","отношения","друзья","сон","усталость","спорт","отдых","здоровье","учёба"];
let draft={mood:null,tags:[],note:"",good:""};
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
  if(list.length<4) return "";
  const avg=list.reduce((a,b)=>a+b.mood,0)/list.length; const by={};
  list.forEach(m=>m.tags.forEach(t=>{(by[t]=by[t]||[]).push(m.mood);}));
  const rows=Object.entries(by).filter(([,v])=>v.length>=2).map(([t,v])=>[t,v.reduce((a,b)=>a+b,0)/v.length]);
  if(!rows.length) return "";
  rows.sort((a,b)=>b[1]-a[1]); const best=rows[0], worst=rows[rows.length-1];
  const lines=[];
  if(best[1]-avg>=0.3) lines.push(`В дни с тегом «${best[0]}» настроение выше среднего: ${best[1].toFixed(1)} против ${avg.toFixed(1)}.`);
  if(avg-worst[1]>=0.3) lines.push(`В дни с тегом «${worst[0]}» настроение ниже: ${worst[1].toFixed(1)}. Можно обсудить это на сессии.`);
  if(!lines.length) return "";
  return `<div class="card soft"><h3>Что видно по записям</h3>${lines.map(l=>`<p class="small">${l}</p>`).join("")}</div>`;
}
function vDiary(){
  const list=moodsAll().slice().sort((a,b)=>b.ts-a.ts);
  const avg = list.length? (list.slice(0,7).reduce((a,b)=>a+b.mood,0)/Math.min(7,list.length)).toFixed(1):"—";
  return `<div class="stack-s"><h1>Дневник настроения</h1><p class="muted">10 секунд в день, чтобы увидеть, что на вас влияет.</p></div>
  <div class="card" id="newMood">
    <h3>Как вы сейчас?</h3>
    <div class="moods">${MOODS.map(m=>`<button class="mood" data-mood="${m.v}" aria-pressed="${draft.mood===m.v}">${face(m.v)}<span>${m.t}</span></button>`).join("")}</div>
    <div class="stack-s"><span class="small muted">С чем это связано?</span><div class="chips">${TAGS.map(t=>`<button class="chip" data-tag="${t}" aria-pressed="${draft.tags.includes(t)}">${t}</button>`).join("")}</div></div>
    <label class="field"><span>Пара слов о дне</span><textarea id="mNote" placeholder="Что происходило, что чувствовали">${esc(draft.note)}</textarea></label>
    <label class="field"><span>Что сегодня было хорошего?</span><input type="text" id="mGood" placeholder="Даже мелочь: вкусный кофе, звонок другу" value="${esc(draft.good)}"></label>
    <button class="btn" id="mSave" ${draft.mood?"":"disabled"}>Сохранить запись</button>
  </div>
  <div class="card">
    <div class="row" style="justify-content:space-between"><h3>Последние 14 дней</h3><span class="small muted">Среднее за 7 записей: <strong style="color:var(--ink)">${avg}</strong></span></div>
    ${isDemo()?`<div class="demo-note"><span>Сейчас показаны примеры. Они исчезнут после вашей первой записи.</span><button class="linkbtn" id="clrDemo">Убрать</button></div>`:""}
    ${chartSVG(list)}
  </div>
  ${insights(list)}
  <div class="card"><h3>Записи</h3>
    ${list.length?list.slice(0,20).map(m=>`<div class="entry"><span class="dot" style="background:${moodColor(m.mood)}"></span><div class="body"><div class="row" style="justify-content:space-between"><strong>${MOODS[m.mood-1].t}</strong><span class="small muted">${fmtDT(m.ts)}</span></div>${m.note?`<p class="small">${esc(m.note)}</p>`:""}${m.good?`<p class="small muted">Хорошее: ${esc(m.good)}</p>`:""}${m.tags.length?`<div class="row">${m.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</div>`:""}</div></div>`).join(""):`<p class="small muted">Записей пока нет. Отметьте настроение выше.</p>`}
  </div>`;
}
function bindDiary(){
  document.querySelectorAll("[data-mood]").forEach(b=>b.onclick=()=>{draft.mood=+b.dataset.mood; keepDraft(); render();});
  document.querySelectorAll("[data-tag]").forEach(b=>b.onclick=()=>{const t=b.dataset.tag; draft.tags=draft.tags.includes(t)?draft.tags.filter(x=>x!==t):[...draft.tags,t]; keepDraft(); render();});
  $("#mSave").onclick=()=>{ keepDraft(); S.moods.push({id:uid(),ts:Date.now(),mood:draft.mood,tags:draft.tags,note:draft.note.trim(),good:draft.good.trim()}); S.demoCleared=true; save(); markDay(); draft={mood:null,tags:[],note:"",good:""}; toast("Запись сохранена"); render(); };
  const c=$("#clrDemo"); if(c) c.onclick=()=>{S.demoCleared=true; save(); render();};
}
function keepDraft(){ const n=$("#mNote"), g=$("#mGood"); if(n) draft.note=n.value; if(g) draft.good=g.value; }

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
  return `<button class="back" data-go="practices">← Практики</button>
  <div class="stack-s"><h1>Дневник мыслей</h1><p class="muted">Метод когнитивно‑поведенческой терапии: замечаем тревожную мысль, проверяем её фактами и находим более реалистичный взгляд.</p></div>
  <div class="card soft"><h3>Когда заполнять</h3><p class="small">Когда настроение резко изменилось или накрыла тревога. Шесть коротких шагов, около 5 минут.</p><button class="btn" id="tNew">Разобрать мысль</button></div>
  <div class="card"><h3>Ваши записи</h3>
  ${list.length?list.map(r=>`<details class="entry" style="display:block"><summary style="cursor:pointer;list-style:none"><div class="row" style="justify-content:space-between"><strong style="min-width:0;overflow-wrap:anywhere">${esc(r.thought||r.situation)}</strong><span class="small muted">${fmtDate(r.ts)}</span></div><div class="small muted">${esc(r.emotion)} ${r.before}% → ${r.after}%</div></summary>
  <div class="stack-s small" style="padding-top:10px">${TSTEPS.map(s=>r[s.k]?`<div><span class="label">${s.t}</span><p style="overflow-wrap:anywhere">${esc(r[s.k])}</p></div>`:"").join("")}</div></details>`).join(""):`<p class="small muted">Пока пусто. Первая запись займёт 5 минут.</p>`}
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
    const {step,...rec}=TD; S.thoughts.push({...rec,id:uid(),ts:Date.now()}); save(); markDay();
    const diff=TD.before-TD.after; TD=null; toast(diff>0?`Запись сохранена. Эмоция стала слабее на ${diff}%`:"Запись сохранена"); render();
  };
  setTimeout(()=>{const t=$("#tdIn"); if(t) t.focus();},50);
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
    <p class="small muted">Заполните заявку, скопируйте текст и отправьте ${esc(PSY.nameTo)} в мессенджер.</p>
    <form id="bForm" class="stack-s" novalidate>
      <label class="field"><span>Как к вам обращаться</span><input type="text" id="bName" required value="${esc(BK.name)}"></label>
      <label class="field"><span>Формат</span><select id="bFmt">${["Онлайн","Очно","Пока не знаю"].map(o=>`<option ${BK.fmt===o?"selected":""}>${o}</option>`).join("")}</select></label>
      <label class="field"><span>Удобное время</span><input type="text" id="bTime" placeholder="Например, будни после 18:00" value="${esc(BK.time)}"></label>
      <label class="field"><span>С чем хотите поработать</span><textarea id="bReq" placeholder="Коротко, в двух‑трёх предложениях">${esc(BK.req)}</textarea></label>
      <button class="btn" type="submit">Подготовить заявку</button>
    </form>
    ${bookText?`<div class="copybox" id="bOut">${esc(bookText)}</div><div class="row"><button class="btn" id="bCopy">Скопировать текст</button>${contact}</div>`:""}
    <div class="stack-s small">
      <div><span class="label">Telegram</span><div>${PSY.telegram?"@"+esc(PSY.telegram):'<span class="muted">появится после настройки</span>'}</div></div>
      <div><span class="label">Телефон</span><div class="phone" style="font-size:1rem">${PSY.phone?esc(PSY.phone):'<span class="muted" style="font-weight:400">появится после настройки</span>'}</div></div>
    </div>
  </div>
  <div class="card">
    <h3>Что обсудить на сессии</h3>
    <p class="small muted">Записывайте мысли между встречами, чтобы ничего не забыть.</p>
    <div class="row" style="flex-wrap:nowrap"><input type="text" id="nIn" placeholder="Например: почему я злюсь на брата" style="flex:1;min-width:0"><button class="btn" id="nAdd" aria-label="Добавить">+</button></div>
    ${S.notes.length?S.notes.slice().reverse().map(n=>`<div class="entry"><input type="checkbox" data-nd="${n.id}" ${n.done?"checked":""} style="margin-top:5px;accent-color:var(--accent)" aria-label="Обсудили"><div class="body"><p class="small" style="${n.done?"text-decoration:line-through;color:var(--muted)":""}">${esc(n.text)}</p><span class="small muted">${fmtDate(n.ts)}</span></div><button class="linkbtn small" data-ndel="${n.id}">Удалить</button></div>`).join(""):`<p class="small muted">Список пуст.</p>`}
  </div>
  <div class="card">
    <button class="btn quiet" data-share style="align-self:flex-start">${ico("share",18)} Поделиться приложением</button>
    <h3>Конфиденциальность</h3>
    <p class="small">Без регистрации и рекламы. Дневники и результаты тестов хранятся только в браузере на этом устройстве и никуда не отправляются.</p>
    <button class="linkbtn small" id="wipe" style="align-self:flex-start">Удалить все мои данные</button>
    <div id="wipeConfirm" hidden class="demo-note"><span>Удалить все записи без возможности восстановить?</span><span class="row"><button class="btn quiet" id="wipeNo">Отмена</button><button class="btn sosb" id="wipeYes">Удалить</button></span></div>
  </div>`;
}
function bindAbout(){
  $("#bForm").onsubmit=e=>{ e.preventDefault();
    BK={name:$("#bName").value,fmt:$("#bFmt").value,time:$("#bTime").value,req:$("#bReq").value};
    const name=BK.name.trim(); if(!name){ $("#bName").focus(); toast("Укажите, как к вам обращаться"); return; }
    bookText=`Здравствуйте, ${PSY.name}! Хочу записаться на консультацию.\nИмя: ${name}\nФормат: ${$("#bFmt").value}\nУдобное время: ${$("#bTime").value.trim()||"обсудим"}\nЗапрос: ${$("#bReq").value.trim()||"расскажу на встрече"}`;
    render(); $("#bOut").scrollIntoView({behavior:"smooth",block:"center"});
  };
  const c=$("#bCopy"); if(c) c.onclick=()=>copy(bookText,$("#bOut"));
  const add=()=>{const v=$("#nIn").value.trim(); if(!v) return; S.notes.push({id:uid(),text:v,ts:Date.now(),done:false}); save(); render();};
  $("#nAdd").onclick=add; $("#nIn").onkeydown=e=>{if(e.key==="Enter") add();};
  document.querySelectorAll("[data-nd]").forEach(b=>b.onchange=()=>{const n=S.notes.find(x=>x.id===b.dataset.nd); n.done=b.checked; save(); render();});
  document.querySelectorAll("[data-ndel]").forEach(b=>b.onclick=()=>{S.notes=S.notes.filter(x=>x.id!==b.dataset.ndel); save(); render();});
  $("#wipe").onclick=()=>$("#wipeConfirm").hidden=false;
  $("#wipeNo").onclick=()=>$("#wipeConfirm").hidden=true;
  $("#wipeYes").onclick=()=>{S=empty(); save(); toast("Данные удалены"); render();};
  if(sub==="book"){ sub=null; setTimeout(()=>$("#book").scrollIntoView({block:"start"}),30); }
}

/* ===== Практики, программа, статьи ===== */
const PR = window.PROGRAM, ART = window.ARTICLES;
function progState(){
  const done=S.program.done, n=PR.days.length; let next=null;
  for(let i=1;i<=n;i++){ if(!done[i]){ next=i; break; } }
  // новый день открывается на следующий календарный день после выполнения предыдущего
  let lockedUntilTomorrow=false;
  if(next && next>1 && dayKey(new Date(done[next-1]))===dayKey()) lockedUntilTomorrow=true;
  return {done, n, next, count:Object.keys(done).length, lockedUntilTomorrow};
}
function dayStatus(i){
  const st=progState();
  if(st.done[i]) return "done";
  if(i===st.next) return st.lockedUntilTomorrow?"tomorrow":"open";
  return "locked";
}
function homeProgress(){
  const st=progState(), s=streak();
  const week=[]; for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); week.push({on:S.days.includes(dayKey(d)), l:d.toLocaleDateString("ru-RU",{weekday:"short"}).slice(0,2)}); }
  const dots=`<div class="week">${week.map(w=>`<span class="wd ${w.on?"on":""}"><i></i>${w.l}</span>`).join("")}</div>`;
  let prog;
  if(!st.next) prog=`<p class="small"><strong>Программа «${esc(PR.title)}» пройдена.</strong> Можно перечитать дни в разделе «Практики».</p>`;
  else {
    const d=PR.days[st.next-1];
    prog = st.lockedUntilTomorrow
      ? `<div class="row" style="justify-content:space-between"><div><span class="label">Программа · день ${st.next} из ${st.n}</span><p class="small muted">Сегодняшний день выполнен. Следующий откроется завтра.</p></div></div>`
      : `<div class="stack-s"><span class="label">Программа · день ${st.next} из ${st.n}</span><strong>${esc(d.title)}</strong><button class="btn" data-go="program" data-sub="${st.next}">${st.count?"Продолжить":"Начать программу"} · ${d.minutes} мин</button></div>`;
  }
  return `<div class="card">
    <div class="row" style="justify-content:space-between"><h3>${s?`${s} ${plural(s,"день","дня","дней")} подряд`:"Начните серию"}</h3><span class="small muted">${s?"Так держать":"Любое упражнение засчитывается"}</span></div>
    ${dots}
    <div class="progress"><i style="width:${st.count/st.n*100}%"></i></div>
    ${prog}
  </div>`;
}
function vPractices(){
  const st=progState();
  return `<div class="stack-s"><h1>Практики</h1><p class="muted">Программа, упражнения и короткие статьи от ${esc(PSY.nameFrom||PSY.name)}.</p></div>
  <div class="card soft">
    <div class="row" style="justify-content:space-between"><h3>${esc(PR.title)}</h3><span class="tag">${st.count} из ${st.n}</span></div>
    <p class="small">${esc(PR.subtitle)}</p>
    <div class="days">${PR.days.map((d,i)=>{const k=i+1, ds=dayStatus(k);
      const icon = ds==="done"?ico("check",16):ds==="open"?`<b>${k}</b>`:ico("lock",14);
      return `<button class="day ${ds}" ${ds==="locked"||ds==="tomorrow"?"disabled":""} data-go="program" data-sub="${k}" aria-label="День ${k}: ${esc(d.title)}"><span class="dn">${icon}</span><span class="dt"><span class="small muted">День ${k}${ds==="tomorrow"?" · откроется завтра":""}</span><strong>${esc(d.title)}</strong></span></button>`;}).join("")}</div>
  </div>
  <div class="stack-s"><span class="label">Упражнения</span>
  <div class="grid2">
    <button class="tile" data-go="breath"><span class="ico">${ico("wind")}</span><strong>Дыхание «квадрат»</strong><span class="small muted">2 минуты</span></button>
    <button class="tile" data-go="sos"><span class="ico">${ico("hand")}</span><strong>Заземление 5‑4‑3‑2‑1</strong><span class="small muted">Когда накрыло</span></button>
    <button class="tile" data-go="thoughts"><span class="ico">${ico("thoughts")}</span><strong>Дневник мыслей</strong><span class="small muted">${S.thoughts.length?`Записей: ${S.thoughts.length}`:"Метод КПТ"}</span></button>
    <button class="tile" data-go="diary"><span class="ico">${ico("diary")}</span><strong>Дневник настроения</strong><span class="small muted">10 секунд в день</span></button>
  </div></div>
  <div class="card"><h3>Почитать</h3>
    ${ART.map(a=>`<button class="art" data-go="article" data-sub="${a.id}"><span class="ico">${ico("book",18)}</span><span class="dt"><strong>${esc(a.title)}</strong><span class="small muted">${a.minutes} мин чтения</span></span></button>`).join("")}
  </div>`;
}
function vProgramDay(){
  const k=+sub||progState().next||1, d=PR.days[k-1], ds=dayStatus(k);
  if(!d || ds==="locked") return vPractices();
  const act = d.action?`<button class="btn" data-go="${d.action.to}" ${d.action.sub?`data-sub="${d.action.sub}"`:""}>${esc(d.action.label)}</button>`:"";
  return `<button class="back" data-go="practices">← Практики</button>
  <div class="stack-s"><span class="label">${esc(PR.title)} · день ${k} из ${PR.days.length} · ${d.minutes} мин</span><h1>${esc(d.title)}</h1></div>
  <div class="card">${d.text.map(t=>`<p>${esc(t)}</p>`).join("")}</div>
  <div class="card"><h3>Задание на сегодня</h3>
    <ul class="tasks">${d.tasks.map(t=>`<li>${esc(t)}</li>`).join("")}</ul>
    ${act}
  </div>
  ${d.ask?`<div class="card"><label class="field"><span>${esc(d.ask)}</span><textarea id="pNote" placeholder="Пара предложений для себя. Можно обсудить на сессии">${esc(S.program.notes[k]||"")}</textarea></label></div>`:""}
  ${ds==="done"
    ? `<div class="card soft"><div class="row">${ico("check",20)}<strong>День выполнен ${fmtDate(S.program.done[k])}</strong></div>${d.final?finalBlock():""}</div>`
    : ds==="tomorrow" ? `<p class="small muted" style="text-align:center">Этот день откроется завтра. Отдохните и закрепите вчерашнее.</p>`
    : `<button class="btn block" id="pDone">Отметить день выполненным</button>`}`;
}
function finalBlock(){
  const g=S.tests.filter(t=>t.id==="gad7"); let cmp="";
  if(g.length>=2){ const a=g[0].score, b=g[g.length-1].score, d=a-b;
    cmp=`<p class="small">Тревожность в начале: <strong>${a}</strong>, сейчас: <strong>${b}</strong>. ${d>0?`Снижение на ${d} ${plural(d,"балл","балла","баллов")}.`:"Результат пока не изменился, это тоже важная информация."}</p>`; }
  return `${cmp}<p class="small">Хотите продолжить работу глубже? Обсудим ваши записи за неделю на консультации.</p><button class="btn" data-go="about" data-sub="book">Записаться к ${esc(PSY.nameTo)}</button>`;
}
function bindProgramDay(){
  const k=+sub||progState().next||1;
  const n=$("#pNote"); if(n) n.oninput=()=>{ S.program.notes[k]=n.value; save(); };
  const b=$("#pDone"); if(b) b.onclick=()=>{ S.program.done[k]=Date.now(); save(); markDay();
    toast(k===PR.days.length?"Программа пройдена":"День "+k+" выполнен"); render(); window.scrollTo(0,0); };
}
function vArticle(){
  const a=ART.find(x=>x.id===sub); if(!a) return vPractices();
  return `<button class="back" data-go="practices">← Практики</button>
  <article class="stack">
    <div class="stack-s"><span class="label">${a.minutes} мин чтения</span><h1>${esc(a.title)}</h1><p class="lead">${esc(a.lead)}</p></div>
    ${a.body.map(t=>`<p>${esc(t)}</p>`).join("")}
  </article>
  <div class="card soft">
    <div class="row"><div class="logo">${esc(PSY.name[0])}</div><strong>${esc(PSY.name)}, ${esc(PSY.role.toLowerCase())}</strong></div>
    <p class="small">Если узнали себя в этом тексте, давайте разберём вашу ситуацию на консультации.</p>
    <div class="row"><button class="btn" data-go="about" data-sub="book">Записаться</button><button class="btn quiet" data-share>${ico("share",18)} Поделиться</button></div>
  </div>`;
}

/* ===== Поделиться ===== */
document.addEventListener("click", async e=>{
  const b=e.target.closest("[data-share]"); if(!b) return;
  const url = PSY.siteUrl || (location.protocol.startsWith("http") ? location.origin+location.pathname : "");
  const text = `Опора — бесплатная карманная поддержка от психолога ${PSY.name}: дыхание при тревоге, дневник настроения, тесты. Без регистрации.`;
  try{ if(navigator.share){ await navigator.share({title:"Опора", text, url: url||undefined}); return; } }catch(err){ if(err && err.name==="AbortError") return; }
  try{ await navigator.clipboard.writeText(url?text+" "+url:text); toast("Ссылка скопирована. Отправьте её другу"); }
  catch(err){ toast("Не удалось скопировать ссылку"); }
});

/* ===== Рендер ===== */
function render(){
  const v={home:vHome,sos:vSOS,breath:vBreath,tests:vTests,diary:vDiary,thoughts:vThoughts,about:vAbout,practices:vPractices,program:vProgramDay,article:vArticle}[route]||vHome;
  if(route==="thoughts" && sub==="new"){ TD={step:0,before:70,after:40}; sub=null; }
  $("#app").innerHTML=`<main class="view">${v()}</main>`;
  renderTabs();
  ({home:bindHome,sos:bindSOS,breath:bindBreath,tests:bindTests,diary:bindDiary,thoughts:bindThoughts,about:bindAbout,practices:()=>{},program:bindProgramDay,article:()=>{}}[route]||(()=>{}))();
}
function bindHome(){
  document.querySelectorAll("[data-qm]").forEach(b=>b.onclick=()=>{draft.mood=+b.dataset.qm; go("diary");});
  const ib=$("#installBtn"); if(ib) ib.onclick=async()=>{ if(!installEvt) return; installEvt.prompt(); try{ await installEvt.userChoice; }catch(e){} installEvt=null; render(); };
  const ix=$("#installHide"); if(ix) ix.onclick=()=>{ S.installHidden=true; save(); render(); };
}

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
      ? `<p class="small">В Safari нажмите «Поделиться» внизу экрана, затем «На экран Домой».</p>`
      : `<p class="small">Откройте меню браузера (⋮) и выберите «Установить приложение» или «Добавить на главный экран».</p>`;
  return `<div class="card soft"><div class="row" style="justify-content:space-between"><h3>Поставьте Опору на телефон</h3><button class="linkbtn small" id="installHide">Скрыть</button></div><p class="small muted">Значок на экране, запуск в одно касание и работа без интернета.</p>${how}</div>`;
}

/* ===== Адрес страницы: #sos, #diary и т.д. ===== */
const ROUTES=["home","sos","breath","tests","diary","thoughts","about","practices"];
const _go=go;
go=function(r,s=null){ _go(r,s); try{ history.replaceState(null,"", r==="home"?location.pathname:"#"+r); }catch(e){} };
window.addEventListener("hashchange",()=>{ const h=location.hash.slice(1); if(ROUTES.includes(h) && h!==route){ _go(h); } });
const h0=(location.hash||"").slice(1);
if(ROUTES.includes(h0)) route=h0;
render();

/* ===== Офлайн-режим ===== */
if("serviceWorker" in navigator && location.protocol.startsWith("http")){
  window.addEventListener("load", ()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
}
