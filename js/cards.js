/* =====================================================
   Метафорические карты (МАК): карта дня, расклад из 3 карт, журнал.
   Картинки карт — в папке cards/ (85 штук). Если файла нет, карта рисуется кодом.
   Свои картинки: положить в папку cards/ и перечислить в js/content.js → CARD_FILES.
   ===================================================== */

const CARD_FILES = window.CARD_FILES || [];
const DECK = CARD_FILES.length || 36;
if(!Array.isArray(S.cardLog)) S.cardLog=[];

const CQ = {
  see:  ["Что вы видите на этой карте?","Что первым бросается в глаза?","Что происходит на картинке?","Где на этой карте были бы вы?"],
  feel: ["Какое чувство она вызывает?","Какое слово приходит первым?","Где в теле откликается этот образ?","Чего здесь не хватает?"],
  link: ["Как это связано с вашим днём?","Что эта карта хочет вам сказать?","Какой маленький шаг она подсказывает?","Что бы вы взяли из этой картинки себе?"]
};
const SPREAD = [
  {t:"Ситуация", q:"Что сейчас происходит? Что вы видите на карте?"},
  {t:"Ресурс",   q:"Что может вас поддержать?"},
  {t:"Шаг",      q:"Какой первый маленький шаг?"}
];

/* ---------- временные карты, нарисованные кодом ---------- */
const CPAL = [
  ["#FDE2C8","#F7B8A6","#C9A7C7","#9C88B5","#6E6A9E","#FFF1D0"],
  ["#DDEFF7","#9FCFE6","#6FA9C9","#3E7FA6","#255C7E","#FFF6D6"],
  ["#E9F2DF","#BFD9B0","#86B583","#5A9264","#355F44","#FFF3C4"],
  ["#2C3E66","#151F38","#3A4D7A","#273760","#18233F","#F4EFD8"],
  ["#EEF0F2","#D5DAE0","#B7BFC9","#98A3B1","#7A8698","#FFFFFF"],
  ["#FCEBD0","#F2C893","#E3A66B","#C98452","#9E603C","#FFF4DA"],
  ["#F1EAF8","#D6C6EE","#B3A0DD","#8C79C2","#66579C","#FFF6E0"],
  ["#FFD9A8","#F48C6B","#C86A7A","#8E4F72","#5A3657","#FFE7A3"]
];
function cardArt(i){
  const R=rng(i*7919+13), P=CPAL[(i*5+Math.floor(i/8))%CPAL.length], id="ca"+i+"_"+(++treeUid);
  const [s1,s2,far,mid,near,sun]=P, dark=P===CPAL[3];
  const o=[];
  o.push(`<rect width="200" height="300" fill="url(#${id}g)"/>`);
  const sx=40+R()*120, sy=60+R()*60;
  o.push(`<circle cx="${f1(sx)}" cy="${f1(sy)}" r="${f1(16+R()*14)}" fill="${sun}" opacity="${dark?.95:.9}"/>`);
  if(dark) for(let k=0;k<18;k++) o.push(`<circle cx="${f1(R()*200)}" cy="${f1(R()*150)}" r="${f1(.5+R())}" fill="#fff" opacity="${f1(.4+R()*.6)}"/>`);
  const hill=(y,amp,col)=>{ let d=`M0 ${y}`; for(let x=0;x<=200;x+=25) d+=` Q${x+12} ${f1(y-amp*R())} ${x+25} ${f1(y+(R()-.5)*amp*.6)}`; return `<path d="${d} V300 H0Z" fill="${col}"/>`; };
  const m=i%12;
  if(m===4||m===10){ // вода
    o.push(hill(180,20,far)); o.push(`<rect x="0" y="200" width="200" height="100" fill="${mid}"/>`);
    for(let k=0;k<6;k++) o.push(`<path d="M${f1(20+R()*150)} ${f1(215+R()*70)} h${f1(14+R()*18)}" stroke="${s1}" stroke-width="1.5" opacity=".5"/>`);
  } else { o.push(hill(190,30,far)); o.push(hill(225,26,mid)); o.push(hill(258,22,near)); }
  const ink=dark?"#0E1528":"#2D2A3A";
  switch(m){
    case 1: o.push(`<path d="M92 300 L99 ${f1(186)} L101 186 L118 300Z" fill="${s1}" opacity=".85"/>`); break;
    case 2: o.push(`<rect x="86" y="170" width="28" height="56" rx="2" fill="${ink}"/><rect x="90" y="174" width="20" height="48" fill="${sun}" opacity=".85"/><circle cx="106" cy="200" r="1.6" fill="${ink}"/>`); break;
    case 3: o.push(`<path d="M99 250 L98 196 L102 196 L101 250Z" fill="${ink}"/><circle cx="100" cy="186" r="20" fill="${ink}"/><circle cx="88" cy="194" r="12" fill="${ink}"/><circle cx="113" cy="193" r="13" fill="${ink}"/>`); break;
    case 4: o.push(`<path d="M80 214 h44 l-6 9 h-32Z" fill="${ink}"/><path d="M101 214 V180 L120 208Z" fill="${s1}"/><path d="M101 214 V186" stroke="${ink}" stroke-width="2"/>`); break;
    case 5: for(let k=0;k<7;k++) o.push(`<rect x="${70+k*9}" y="${250-k*14}" width="22" height="5" rx="1" fill="${ink}" opacity="${f1(1-k*.1)}"/>`); break;
    case 6: o.push(`<path d="M76 236 V206 L100 188 L124 206 V236Z" fill="${ink}"/><rect x="93" y="212" width="14" height="12" fill="${sun}"/>`); break;
    case 7: for(let k=0;k<7;k++){ const x=40+R()*120, y=50+R()*90, s=.6+R()*.6; o.push(`<path d="M${f1(x)} ${f1(y)} q${f1(4*s)} ${f1(-5*s)} ${f1(8*s)} 0 q${f1(4*s)} ${f1(-5*s)} ${f1(8*s)} 0" stroke="${ink}" stroke-width="1.6" fill="none"/>`); } break;
    case 8: o.push(`<circle cx="100" cy="160" r="11" fill="none" stroke="${ink}" stroke-width="4"/><path d="M100 171 V206 M100 196 h8 M100 203 h6" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>`); break;
    case 9: o.push(`<path d="M93 236 L96 168 H104 L107 236Z" fill="${s1}"/><rect x="95" y="186" width="10" height="7" fill="${ink}"/><rect x="94" y="160" width="12" height="9" fill="${sun}"/><path d="M106 164 L170 150 L170 178Z" fill="${sun}" opacity=".35"/>`); break;
    case 10: o.push(`<path d="M30 205 Q100 165 170 205" stroke="${ink}" stroke-width="4" fill="none"/>`); for(let k=0;k<7;k++){ const x=40+k*20; o.push(`<path d="M${x} 205 V${f1(205-30*Math.sin(Math.PI*(x-30)/140))}" stroke="${ink}" stroke-width="1.5"/>`); } break;
    case 11: o.push(`<circle cx="86" cy="196" r="6" fill="${ink}"/><path d="M78 240 Q80 206 86 204 Q92 206 94 240Z" fill="${ink}"/><circle cx="114" cy="200" r="5.5" fill="${ink}"/><path d="M107 240 Q109 210 114 208 Q119 210 121 240Z" fill="${ink}"/>`); break;
  }
  return `<svg viewBox="0 0 200 300" class="cart" role="img" aria-label="Метафорическая карта"><defs><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s1}"/><stop offset="1" stop-color="${s2}"/></linearGradient></defs>${o.join("")}</svg>`;
}
function cardFront(i){
  return CARD_FILES[i] ? `<img class="cart" src="cards/${encodeURI(CARD_FILES[i])}" alt="Метафорическая карта ${i+1}" loading="lazy">` : cardArt(i);
}
function cardBack(){
  const gid="cbk"+(cardBack.n=(cardBack.n||0)+1);
  return `<svg viewBox="0 0 200 300" class="cart" aria-hidden="true"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3F86C8"/><stop offset="1" stop-color="#1C4670"/></linearGradient></defs>
    <rect width="200" height="300" fill="url(#${gid})"/><rect x="9" y="9" width="182" height="282" rx="12" fill="none" stroke="#E8C77A" stroke-opacity=".75" stroke-width="1.6"/><rect x="15" y="15" width="170" height="270" rx="9" fill="none" stroke="#E8C77A" stroke-opacity=".35"/>
    ${[70,52,34].map((r,k)=>`<circle cx="100" cy="150" r="${r}" fill="none" stroke="${k?"#fff":"#E8C77A"}" stroke-opacity="${k?.22:.55}"/>`).join("")}
    ${[[100,40],[100,260],[30,150],[170,150]].map(([x,y])=>`<path d="M${x} ${y-5} L${x+4} ${y} L${x} ${y+5} L${x-4} ${y}Z" fill="#E8C77A" opacity=".7"/>`).join("")}
    <text x="100" y="166" text-anchor="middle" font-family="Onest, system-ui, sans-serif" font-weight="800" font-size="44" fill="#fff">О</text></svg>`;
}
function mcard(i, faceUp, extra=""){
  return `<div class="mcard ${faceUp?"up":""} ${extra}"><div class="mc-in"><div class="mc-face mc-back">${cardBack()}</div><div class="mc-face mc-front">${faceUp?cardFront(i):""}</div></div></div>`;
}

/* ---------- логика ---------- */
// сначала карты, которые человек ещё не открывал; когда все увидены — те, что открывались давнее всего
function freshPick(n, r){
  const last={}; S.cardLog.forEach(c=>(c.ids||[c.id]).forEach(i=>{ if(i>=0 && i<DECK) last[i]=Math.max(last[i]||0, c.ts||1); }));
  const all=[...Array(DECK).keys()], unseen=all.filter(i=>!last[i]);
  const shuffle=a=>{ for(let k=a.length-1;k>0;k--){ const j=Math.floor(r()*(k+1)); [a[k],a[j]]=[a[j],a[k]]; } return a; };
  let pool=shuffle(unseen);
  if(pool.length<n){ const old=all.filter(i=>last[i]).sort((x,y)=>last[x]-last[y]).slice(0, Math.max(n*4, Math.ceil(DECK/3))); pool=pool.concat(shuffle(old)); }
  return pool.slice(0,n);
}
function dayPick(n){ return freshPick(n, rng((S.seed||1)+parseInt(dayKey().replace(/-/g,""),10))); }
const todayCard = () => S.cardLog.find(c=>c.type==="day" && c.d===dayKey());
function pickQ(){ const r=rng(Date.now()%1e9); return [CQ.see,CQ.feel,CQ.link].map(g=>g[Math.floor(r()*g.length)]); }

function homeCard(){
  const c=todayCard();
  return `<button class="banner card mak-banner" data-go="cards">
    <span class="mak-thumb">${c?cardFront(c.id):cardBack()}</span>
    <span class="bt"><strong>Карта дня</strong><span class="small muted">${c?(c.a.some(x=>x)?"Ответы сохранены":"Ответьте на вопросы"):"Вытяните карту и прислушайтесь к себе"}</span></span>
    <span class="chev">›</span></button>`;
}

/* ---------- объяснение: зачем нужны карты и как с ними работать ---------- */
function makGuide(open){
  return `<details class="more mak-guide"${open?" open":""}><summary>Как работать с картами</summary>
  <div class="stack-s mg-body">
    <p><strong>Зачем это нужно.</strong> Метафорические карты — инструмент, которым пользуются психологи. У картинки нет «правильного» смысла: каждый видит в ней своё. То, что вы заметите, расскажет не о карте, а о вас — о чувствах, мыслях и желаниях, которые трудно назвать прямо.</p>
    <p class="small muted">Это не гадание: карта ничего не предсказывает и не решает за вас. Она помогает посмотреть на свою ситуацию со стороны и услышать себя.</p>
    <span class="label">Когда пригодится</span>
    <ul class="tasks small"><li>Тревожно или грустно, а почему — непонятно</li><li>Нужно принять решение, и вы застряли</li><li>Утром — настроиться на день, вечером — подвести итог</li><li>Хочется поговорить с собой, но не знаете, с чего начать</li></ul>
    <span class="label">Как выполнять · 5–10 минут</span>
    <ol class="steps small">
      <li><strong>Остановитесь.</strong> Сделайте 2–3 спокойных вдоха. Подумайте о ситуации, которая вас волнует, или просто о своём дне.</li>
      <li><strong>Выберите карту, не раздумывая.</strong> Рубашки одинаковые — доверьтесь руке. Работайте с той картой, что выпала, даже если она кажется «не про вас».</li>
      <li><strong>Рассмотрите картинку 1–2 минуты.</strong> Что первым бросилось в глаза? Какие детали? Что здесь происходит, что было до и что будет после?</li>
      <li><strong>Заметьте чувства.</strong> Что откликается внутри: тепло, грусть, тревога, интерес? Где это ощущается в теле?</li>
      <li><strong>Свяжите с собой.</strong> На что в вашей жизни это похоже? Какую подсказку или маленький шаг вы видите? Запишите ответы — первое, что приходит в голову, без оценки и красивых формулировок.</li>
    </ol>
    <span class="label">Важно</span>
    <ul class="tasks small"><li>Правильных и неправильных ответов нет. Ваше восприятие и есть результат.</li><li>Если карта вызвала неприятные чувства — это тоже важная информация. Можно остановиться и сделать дыхательное упражнение.</li><li>Возвращайтесь к журналу через неделю: со стороны часто видно то, что не было заметно сразу.</li><li>Если карта задела что-то глубокое, принесите её на консультацию — разберём вместе.</li></ul>
    <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn quiet" data-go="breath">Дыхание</button><button class="btn quiet" data-go="about">Записаться к психологу</button></div>
  </div></details>`;
}
let justFlipped=false;
function vCards(){
  const c=todayCard();
  const intro=`<div class="stack-s"><h1>Метафорические карты</h1><p class="muted">Не гадание, а способ прислушаться к себе</p></div>`;
  let day;
  if(!c){
    const ids=dayPick(3);
    day=`<div class="card"><span class="label">Карта дня</span><p class="small muted">Выберите одну карту, не раздумывая</p>
      <div class="fan">${ids.map((id,k)=>`<button class="fan-c" data-pick="${id}" aria-label="Выбрать карту ${k+1}">${mcard(id,false)}</button>`).join("")}</div></div>`;
  } else {
    day=`<div class="card">
      <span class="label">Карта дня · ${fmtDate(c.ts)}</span>
      <div class="mc-big">${mcard(c.id,true,justFlipped?"reveal":"")}</div>
      <p class="small muted">Рассмотрите картинку минуту-две, не торопясь. Потом ответьте на вопросы — первое, что приходит в голову. Правильных ответов нет.</p>
      ${c.q.map((q,k)=>`<label class="field"><span>${esc(q)}</span><textarea id="cq${k}" rows="2" placeholder="Первое, что приходит в голову">${esc(c.a[k]||"")}</textarea></label>`).join("")}
      <button class="btn" id="cSave">Сохранить</button>
    </div>`;
  }
  justFlipped=false;
  const past=S.cardLog.slice().reverse().filter(x=>!(x.type==="day"&&x.d===dayKey()));
  return `${backBtn(prevRoute==="home"?"home":"practices", prevRoute==="home"?"Главная":"Практики")}
  ${intro}${S.cardLog.length?"":`<div class="card soft mak-how"><span class="label">Как это работает</span><ol class="steps small"><li>Сделайте пару вдохов и подумайте о своём дне или о том, что волнует.</li><li>Выберите карту, не раздумывая.</li><li>Рассмотрите картинку и ответьте на 3 вопроса — первое, что приходит в голову. Правильных ответов нет.</li></ol><p class="small muted">Это не гадание: карта помогает услышать себя. Подробнее — внизу страницы.</p></div>`}${day}
  <button class="banner card" data-go="spread"><span class="bi" style="background:var(--accent-soft);color:var(--accent)">${ico("image",20)}</span><span class="bt"><strong>Расклад из 3 карт</strong><span class="small muted">Ситуация · Ресурс · Шаг</span></span><span class="chev">›</span></button>
  ${past.length?`<details class="more"><summary>Журнал · ${past.length}</summary><div class="stack">${past.slice(0,30).map(x=>`<div class="jr"><div class="jr-cards">${x.ids.map(id=>`<span class="mak-thumb">${cardFront(id)}</span>`).join("")}</div><div class="stack-s" style="min-width:0"><span class="small muted">${x.type==="day"?"Карта дня":"Расклад"} · ${fmtDate(x.ts)}</span>${x.a.map((a,k)=>a?`<p class="small"><strong>${esc(x.type==="day"?x.q[k]:SPREAD[k].t)}</strong> ${esc(a)}</p>`:"").join("")}</div></div>`).join("")}</div></details>`:""}
  ${makGuide(false)}
  <p class="disclaimer">Карты помогают заметить мысли и чувства. Их можно принести на консультацию.</p>`;
}
function bindCards(){
  $$("[data-pick]").forEach(b=>b.onclick=()=>{
    const id=+b.dataset.pick;
    S.cardLog.push({type:"day", d:dayKey(), ts:Date.now(), id, ids:[id], q:pickQ(), a:["","",""]}); save(); markDay();
    justFlipped=true; render();
  });
  const s=$("#cSave"); if(s) s.onclick=()=>{
    const c=todayCard(); c.a=[0,1,2].map(k=>($("#cq"+k)||{}).value||"");
    const first=!c.rewarded && c.a.some(x=>x.trim()); if(first) c.rewarded=true;
    save(); if(first) award("aware",10); toast("Сохранено"); checkBadges();
  };
}

/* ---------- расклад из 3 карт ---------- */
let SP=null;
function vSpread(){
  if(!SP){ const ids=freshPick(3, rng(Date.now()%1e9)); SP={ids, open:[false,false,false], a:["","",""], saved:false}; }
  const all=SP.open.every(Boolean);
  return `${backBtn("cards","Карты")}
  <div class="stack-s"><h1>Расклад</h1><p class="muted">Подумайте о ситуации, которая вас волнует. Открывайте карты по одной: откройте карту, ответьте на вопрос и только потом переходите к следующей.</p></div>
  <details class="more"><summary>Что значат три карты</summary><ul class="tasks small" style="margin-top:10px">
    <li><strong>Ситуация</strong> — как вы видите происходящее сейчас. Что на карте похоже на вашу ситуацию?</li>
    <li><strong>Ресурс</strong> — что может поддержать: качество, человек, воспоминание, занятие. Что на карте даёт силы?</li>
    <li><strong>Шаг</strong> — с чего начать. Какое маленькое действие подсказывает картинка? Лучше такое, что можно сделать в ближайшие дни.</li>
  </ul><p class="small muted">Карта не даёт ответ, а помогает его найти. Если ничего не приходит в голову — опишите просто, что видите: часто смысл появляется по ходу.</p></details>
  <div class="spread">${SP.ids.map((id,k)=>`<button class="sp-c" data-open="${k}" ${SP.open[k]?"disabled":""}><span class="label">${SPREAD[k].t}</span>${mcard(id,SP.open[k],SP.open[k]&&SP.last===k?"reveal":"")}</button>`).join("")}</div>
  ${SP.open.some(Boolean)?`<div class="card">${SPREAD.map((p,k)=>SP.open[k]?`<label class="field"><span><strong>${p.t}.</strong> ${p.q}</span><textarea id="sq${k}" rows="2">${esc(SP.a[k])}</textarea></label>`:"").join("")}
    ${all?`<button class="btn" id="spSave">${SP.saved?"Сохранено":"Сохранить расклад"}</button>`:""}</div>`:""}
  ${SP.saved?`<button class="btn quiet block" id="spNew">Новый расклад</button>`:""}`;
}
function bindSpread(){
  const keep=()=>SP.a=SP.a.map((v,k)=>($("#sq"+k)||{value:v}).value);
  $$("[data-open]").forEach(b=>b.onclick=()=>{ keep(); const k=+b.dataset.open; SP.open[k]=true; SP.last=k; render(); });
  const s=$("#spSave"); if(s) s.onclick=()=>{ keep(); if(SP.saved) return; S.cardLog.push({type:"spread", ts:Date.now(), ids:SP.ids, a:SP.a}); SP.saved=true; save(); markDay(); award("aware",15); render(); };
  const n=$("#spNew"); if(n) n.onclick=()=>{ SP=null; render(); window.scrollTo(0,0); };
  SP.last=null;
}

VIEWS.cards=[vCards,bindCards];
VIEWS.spread=[vSpread,bindSpread];
TAB_OF.cards="practices"; TAB_OF.spread="practices";
BADGES.push({id:"cards7", t:"Слушаю себя", d:"7 карт дня", ok:()=>S.cardLog.filter(c=>c.type==="day").length>=7});
