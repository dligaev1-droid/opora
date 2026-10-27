/* Удержание: знакомство при первом входе и «Для вас», короткая главная с лентой «Сегодня»,
   сохранение данных в файл, напоминания через календарь телефона (.ics, без сервера),
   статистика настроения («год в клетках», отчёт месяца), дневник сна, SOS для пары. */
(function(){
"use strict";
const isObj = v => !!v && typeof v==="object" && !Array.isArray(v);
const plusOn = () => !!(window.LOVE && LOVE.plus && LOVE.plus());
const LOCK='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
const R = () => {
  if(S.onb!=null && !isObj(S.onb)) S.onb=null;
  if(isObj(S.onb) && !Array.isArray(S.onb.f)) S.onb.f=[];
  if(!Array.isArray(S.sleep)) S.sleep=[];
  S.sleep=S.sleep.filter(e=>isObj(e) && /^\d{4}-\d\d-\d\d$/.test(e.d) && /^\d\d:\d\d$/.test(e.bed) && /^\d\d:\d\d$/.test(e.wake) && e.q>=1 && e.q<=5);
  S.sleep.forEach(e=>{ if(!Array.isArray(e.tags)) e.tags=[]; });
  if(typeof S.bak!=="number") S.bak=0;
  return S;
};
const backTo = (to,label) => `<button class="back" data-go="${to}">← ${label}</button>`;

/* ================= Знакомство ================= */
const FOC=[
  ["anx","Тревога"],["stress","Стресс и напряжение"],["burn","Выгорание"],["sleep","Сон"],
  ["self","Самооценка"],["mood","Настроение"],["rel","Отношения"],["goal","Мотивация и цели"]
];
// [маршрут, sub, заголовок, подпись, иконка]
const REC={
  anx:[["program","calm7:1","«7 дней спокойствия»","Программа · 10 минут в день","heart"],["tests","gad7","Тест на тревожность","2 минуты","tests"],["breath",null,"Дыхание при тревоге","2 минуты","wind"]],
  stress:[["pmr",null,"Расслабление мышц","3 минуты","body"],["breath",null,"Дыхание «квадрат»","2 минуты","wind"],["sounds",null,"Звуки для отдыха","Дождь, море, лес","moon"]],
  burn:[["tests","cbi","Тест на выгорание","1 минута","tests"],["program","burnout7:1","«Выход из выгорания»","Программа · 7 дней","heart"],["gprg","energy:1","Энергия без выгорания","14 дней в «Целях»","star"]],
  sleep:[["sleep",null,"Дневник сна","Связь сна и настроения","moon"],["program","sleep7:1","«Сон за 7 дней»","Программа · день 1 бесплатно","heart"],["sounds",null,"Звуки для сна","С таймером","moon"]],
  self:[["tests","rse","Тест самооценки","2 минуты","tests"],["program","self7:1","«Опора на себя»","Программа · день 1 бесплатно","heart"],["article","selfcrit","Внутренний критик","Статья · 3 минуты","book"]],
  mood:[["diary",null,"Дневник настроения","1 минута в день","diary"],["tests","phq9","Тест настроения","3 минуты","tests"],["mstats",null,"Что влияет на настроение","Статистика","emo"]],
  rel:[["love",null,"Режим «Мы»","Для пары","heart"],["lovesos",null,"SOS для пары","Когда поссорились","hand"],["lovet",null,"Стиль привязанности","Тест · 2 минуты","star"]],
  goal:[["gwheel",null,"Колесо баланса","8 сфер жизни","emo"],["gval",null,"Мои ценности","Цели без выгорания","heart"],["gtoday",null,"Режим «Цели»","Ритуалы и привычки","star"]]
};
const needOnb = () => { R(); return !S.onb && !S.days.length && !S.moods.length && !S.tests.length; };
let OB={i:0, f:[], min:5};
function recsOf(f){ const out=[], seen=new Set(); (f.length?f:["stress"]).forEach(k=>(REC[k]||[]).forEach(r=>{ const key=r[0]+(r[1]||""); if(!seen.has(key)){ seen.add(key); out.push(r); } }));
  // по одной лучшей рекомендации из каждой выбранной темы — в начало
  const first=(f.length?f:["stress"]).map(k=>REC[k][0]); return [...first, ...out.filter(r=>!first.includes(r))].slice(0,3); }
function vOnb(){
  const dots=`<div class="onb-dots">${[0,1,2,3].map(i=>`<i class="${i<=OB.i?"on":""}"></i>`).join("")}</div>`;
  if(OB.i===0) return `<div class="onb">${dots}<div class="logo onb-logo">О</div>
    <h1>Опора</h1><p class="lead">Карманная поддержка от психолога ${esc(PSY.nameFrom||PSY.name)}</p>
    <ul class="onb-list"><li>${ico("heart",18)}<span>Быстрая помощь, когда накрыло</span></li><li>${ico("diary",18)}<span>Дневник, тесты и программы по 5–10 минут</span></li><li>${ico("lock",18)}<span>Без регистрации. Всё хранится только на вашем телефоне</span></li></ul>
    <button class="btn block" id="obNext">Начать</button><button class="linkbtn small" id="obSkip" style="align-self:center">Пропустить</button></div>`;
  if(OB.i===1) return `<div class="onb">${dots}<h2>Что вас сейчас беспокоит?</h2><p class="muted small">Можно выбрать до трёх. Это поможет показать самое нужное.</p>
    <div class="chips">${FOC.map(([k,t])=>`<button class="chip" data-of="${k}" aria-pressed="${OB.f.includes(k)}">${t}</button>`).join("")}</div>
    <button class="btn block" id="obNext">${OB.f.length?"Дальше":"Пока ничего — дальше"}</button><button class="linkbtn small" id="obBack" style="align-self:center">Назад</button></div>`;
  if(OB.i===2) return `<div class="onb">${dots}<h2>Сколько времени в день готовы уделять себе?</h2><p class="muted small">Даже 2 минуты в день дают результат, если регулярно.</p>
    <div class="opts">${[[2,"2 минуты","Только самое быстрое"],[5,"5 минут","Упражнение или запись в дневнике"],[10,"10 минут и больше","Программы и практики"]].map(([m,t,s])=>`<button class="opt${OB.min===m?" sel":""}" data-om="${m}"><span><strong>${t}</strong><br><span class="small muted">${s}</span></span></button>`).join("")}</div>
    <button class="linkbtn small" id="obBack" style="align-self:center">Назад</button></div>`;
  const recs=recsOf(OB.f);
  return `<div class="onb">${dots}<h2>Ваш план на старт</h2><p class="muted small">${OB.min<=2?"Начните с самого короткого — этого достаточно.":"Начните с первого пункта сегодня, остальное — в ближайшие дни."}</p>
    <div class="list">${recs.map((r,i)=>`<div class="li" style="cursor:default"><span class="ico">${ico(r[4],18)}</span><span class="dt"><strong>${i+1}. ${r[2]}</strong><span class="small muted">${r[3]}</span></span></div>`).join("")}</div>
    <div class="card soft"><span class="label">Напоминание</span><p class="small">Привычка держится на напоминаниях. Добавьте в календарь телефона ежедневное напоминание отметить настроение — без серверов и рассылок.</p>
      <div class="row" style="flex-wrap:nowrap"><input type="time" id="obT" value="21:00" aria-label="Время напоминания" style="max-width:130px"><button class="btn quiet" id="obCal">Добавить в календарь</button></div></div>
    <button class="btn block" id="obGo">Начать: ${recs[0][2]}</button><button class="linkbtn small" id="obHome" style="align-self:center">На главную</button></div>`;
}
function bindOnb(){
  const fin=()=>{ S.onb={f:OB.f.slice(), min:OB.min, ts:Date.now()}; delete S._onbForce; save(); };
  const n=$("#obNext"); if(n) n.onclick=()=>{ OB.i++; render(); window.scrollTo(0,0); };
  const b=$("#obBack"); if(b) b.onclick=()=>{ OB.i--; render(); };
  const s=$("#obSkip"); if(s) s.onclick=()=>{ S.onb={f:[], skip:true, ts:Date.now()}; delete S._onbForce; save(); render(); };
  $$("[data-of]").forEach(c=>c.onclick=()=>{ const k=c.dataset.of, i=OB.f.indexOf(k); if(i>=0) OB.f.splice(i,1); else if(OB.f.length<3) OB.f.push(k); else { toast("Не больше трёх"); return; } render(); });
  $$("[data-om]").forEach(o=>o.onclick=()=>{ OB.min=+o.dataset.om; OB.i++; render(); window.scrollTo(0,0); });
  const c=$("#obCal"); if(c) c.onclick=()=>ics("mood", $("#obT").value||"21:00");
  const g=$("#obGo"); if(g) g.onclick=()=>{ fin(); const r=recsOf(OB.f)[0]; go(r[0], r[1]); };
  const h=$("#obHome"); if(h) h.onclick=()=>{ fin(); render(); };
}

/* ================= Главная «Я» ================= */
const vHome0=VIEWS.home[0], bHome0=VIEWS.home[1];
function forYou(){
  const o=S.onb; if(!o || o.skip || !o.f.length) return "";
  const recs=recsOf(o.f), names=o.f.map(k=>(FOC.find(x=>x[0]===k)||[,""])[1].toLowerCase()).join(", ");
  return `<div class="stack-s"><div class="row" style="justify-content:space-between"><span class="label">Для вас · ${esc(names)}</span><button class="linkbtn small" id="fyEdit">Изменить</button></div>
  <div class="grid2">${recs.map(r=>`<button class="tile" data-go="${r[0]}"${r[1]?` data-sub="${r[1]}"`:""}><span class="ico">${ico(r[4])}</span><strong>${r[2]}</strong><span class="small muted">${r[3]}</span></button>`).join("")}
    <button class="tile" data-go="about" data-sub="book"><span class="ico">${ico("cal")}</span><strong>Записаться</strong><span class="small muted">к ${esc(PSY.nameTo)}</span></button></div></div>`;
}
function bakNudge(){
  if(S.days.length<5 || (S.bak && Date.now()-S.bak<30*864e5)) return "";
  return `<button class="banner card" data-go="about" data-sub="data"><span class="bi">${ico("lock",20)}</span><span class="bt"><strong>Сохраните копию данных</strong><span class="small muted">${S.bak?"Прошёл месяц с прошлой копии":"Чтобы ничего не потерять при смене телефона"}</span></span><span class="chev">›</span></button>`;
}
// «Сегодня» на главной: две одинаковые плитки рядом — карта дня и моё дерево
function todayDuo(){
  let mak="", tree="";
  if(typeof todayCard==="function"){ const c=todayCard(), st=c?(c.a.some(x=>x)?"Ответы сохранены":"Ответьте на вопросы"):"Вытяните карту";
    mak=`<button class="tday" data-go="cards"><span class="tday-vis mak"><span class="tday-c back">${cardBack()}</span><span class="tday-c">${c?cardFront(c.id):cardBack()}</span></span>
      <span class="tday-t"><strong>Карта дня</strong><span class="small muted">${st}</span></span>${c&&c.a.some(x=>x)?`<span class="tday-ok" aria-hidden="true">${ico("check",14)}</span>`:""}</button>`; }
  if(typeof treeSVG==="function"){ const t=xpTotal(), lv=levelOf(t), sg=stageOf(lv), cur=lvXP(lv), nx=lv<MAX_LV?lvXP(lv+1):cur, pc=lv<MAX_LV?Math.round((t-cur)/(nx-cur)*100):100;
    tree=`<button class="tday" data-go="growth"><span class="tday-vis tree">${treeSVG(lv)}</span>
      <span class="tday-t"><strong>Мой рост</strong><span class="small muted">${t?`${STAGES[sg-1]} · ур. ${lv}`:"Посадите семечко"}</span><span class="progress"><i style="width:${pc}%"></i></span></span></button>`; }
  return mak||tree ? `<div class="today-duo">${mak}${tree}</div>` : "";
}
function vHome(){
  if(needOnb()){ document.body.classList.add("onb-on"); return vOnb(); }
  document.body.classList.remove("onb-on");
  // разбираем старую главную как DOM: так надёжнее, чем искать строки
  const t=document.createElement("template"); t.innerHTML=vHome0();
  const root=t.content, pick=sel=>{ const e=root.querySelector(sel); if(e) e.remove(); return e; };
  // лента «Сегодня»: карта дня, мысль дня, мой рост — листается вбок
  const feed=[pick(".mak-banner"), pick(".card.thought"), pick(".tree-card")].filter(Boolean);
  // входы в режимы есть в шапке («Я / Мы / Цели»), а «Близость» — в «Практиках»
  pick(".rooms");
  const fy=forYou();
  if(fy){ const g=root.querySelector('.grid2'); if(g && g.querySelector('[data-sub="cbi"]')) g.remove(); }
  const sos=root.querySelector(".sos-banner"), disc=root.querySelector(".disclaimer");
  const frag=h=>{ const x=document.createElement("template"); x.innerHTML=h; return x.content; };
  if(feed.length && sos){ const w=document.createElement("div"); w.className="stack-s today"; w.innerHTML='<span class="label">Сегодня</span>'+todayDuo();
    const th=feed.find(el=>el.classList.contains("thought")); if(th) w.appendChild(th); sos.before(w); }
  if(fy && sos) sos.after(frag(fy));
  const bn=bakNudge(); if(bn && disc) disc.before(frag(bn));
  const d=document.createElement("div"); d.appendChild(root.cloneNode(true)); return d.innerHTML;
}
function bindHome(){
  if(needOnb()){ bindOnb(); return; }
  bHome0();
  const e=$("#fyEdit"); if(e) e.onclick=()=>{ OB={i:1, f:(S.onb&&S.onb.f||[]).slice(), min:(S.onb&&S.onb.min)||5}; S.onb=null; S._onbForce=true; save(); render(); };
}
const needOnb0=needOnb;
// повторное знакомство по кнопке «Изменить» показываем даже при наличии данных
const needOnbF = () => (S._onbForce && !S.onb) || needOnb0();
VIEWS.home=[()=>{ if(needOnbF()){ document.body.classList.add("onb-on"); return vOnb(); } return vHome(); }, ()=>{ if(needOnbF()){ bindOnb(); return; } bindHome(); }];

/* ================= Напоминания (.ics) ================= */
const RM={
  mood:{t:"Опора: как вы сегодня?", d:"Отметьте настроение в дневнике — это минута.", freq:"DAILY", def:"21:00", name:"Отметить настроение", s:"Каждый день"},
  sleep:{t:"Опора: как спалось?", d:"Запишите сон в дневник сна.", freq:"DAILY", def:"09:00", name:"Дневник сна", s:"Каждое утро"},
  breath:{t:"Опора: минута дыхания", d:"Две минуты дыхания «квадрат» снимают напряжение дня.", freq:"DAILY", def:"14:00", name:"Пауза на дыхание", s:"Каждый день"},
  week:{t:"Опора: итог недели", d:"10 минут: что получилось, что мешало, три шага на неделю.", freq:"WEEKLY", by:"SU", def:"19:00", name:"Итог недели", s:"По воскресеньям"}
};
const pad = n => String(n).padStart(2,"0");
const ie = t => String(t).replace(/[\\,;]/g, m=>"\\"+m);
function ics(kind, time){
  const r=RM[kind]||RM.mood, [hh,mm]=(time||r.def).split(":").map(Number), now=new Date(), st=new Date();
  st.setHours(hh||0, mm||0, 0, 0); if(st<=now) st.setDate(st.getDate()+1);
  if(r.by==="SU") while(st.getDay()!==0) st.setDate(st.getDate()+1);
  const f=d=>`${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const url=PSY.siteUrl||"";
  const txt=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Opora//RU","CALSCALE:GREGORIAN","BEGIN:VEVENT",
    `UID:${Date.now().toString(36)}-${kind}@opora`, `DTSTAMP:${f(now)}`, `DTSTART:${f(st)}`, `DURATION:PT5M`,
    `RRULE:FREQ=${r.freq}${r.by?";BYDAY="+r.by:""}`, `SUMMARY:${ie(r.t)}`, `DESCRIPTION:${ie(r.d)}${url?"\\n"+url:""}`, url?`URL:${url}`:"",
    "BEGIN:VALARM","ACTION:DISPLAY",`DESCRIPTION:${ie(r.t)}`,"TRIGGER:PT0M","END:VALARM","END:VEVENT","END:VCALENDAR"].filter(Boolean).join("\r\n");
  saveFile(new Blob([txt],{type:"text/calendar"}), `opora-${kind}.ics`, "Откройте файл — телефон предложит добавить напоминание в календарь");
}
async function saveFile(blob, name, hint){
  try{ const file=new File([blob], name, {type:blob.type});
    if(navigator.canShare && navigator.canShare({files:[file]}) && /android|iphone|ipad/i.test(navigator.userAgent)){ await navigator.share({files:[file], title:name}); return; } }
  catch(e){ if(e && e.name==="AbortError") return; }
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  if(hint) toast(hint);
}
function vRemind(){
  return `${backTo("about","Психолог")}<div class="stack-s"><h1>Напоминания</h1><p class="muted small">Опора не присылает уведомлений с сервера и ничего о вас не знает. Вместо этого напоминание добавляется в календарь вашего телефона — его легко изменить или удалить там же.</p></div>
  ${Object.entries(RM).map(([k,r])=>`<div class="card rm-card"><div class="row" style="justify-content:space-between;flex-wrap:nowrap"><span class="stack-s" style="gap:2px;min-width:0"><strong>${r.name}</strong><span class="small muted">${r.s}</span></span><input type="time" data-rt="${k}" value="${r.def}" aria-label="Время: ${r.name}"></div><button class="btn quiet" data-rc="${k}">Добавить в календарь</button></div>`).join("")}
  <p class="small muted">После нажатия откроется файл календаря: подтвердите добавление. На Android файл может сначала скачаться — откройте его из уведомления о загрузке.</p>`;
}
function bindRemind(){ $$("[data-rc]").forEach(b=>b.onclick=()=>{ const k=b.dataset.rc, t=$(`[data-rt="${k}"]`); ics(k, t?t.value:RM[k].def); }); }

/* ================= Сохранение данных в файл ================= */
function exportData(){
  const payload={app:"opora", v:1, ts:Date.now(), data:S};
  const d=new Date(), name=`opora-${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}.json`;
  S.bak=Date.now(); save();
  saveFile(new Blob([JSON.stringify(payload)],{type:"application/json"}), name, "Файл сохранён. Храните его в надёжном месте");
  setTimeout(()=>{ if(route==="about") render(); }, 300);
}
let IMP=null;
function readImport(file){
  if(!file) return; if(file.size>20e6){ toast("Файл слишком большой"); return; }
  const fr=new FileReader();
  fr.onload=()=>{ try{ const j=JSON.parse(String(fr.result)); const d=isObj(j)&&j.app==="opora"&&isObj(j.data)?j.data:j;
      if(!isObj(d) || !["moods","days","tests","thoughts"].some(k=>Array.isArray(d[k]))) throw 0;
      IMP={d, ts:j.ts||0, n:(d.moods||[]).length, days:(d.days||[]).length}; render(); setTimeout(()=>{ const e=$("#dataCard"); if(e) e.scrollIntoView({block:"center"}); },30);
    }catch(e){ toast("Это не файл Опоры или он повреждён"); } };
  fr.onerror=()=>toast("Не удалось прочитать файл"); fr.readAsText(file);
}
function dataCard(){
  return `<div class="card" id="dataCard"><h3>Мои данные</h3>
  <p class="small">Всё хранится только на этом телефоне. Чтобы не потерять записи при смене телефона или очистке браузера, сохраните копию в файл, а на новом устройстве восстановите из него.</p>
  <p class="small muted">${S.bak?`Последняя копия: ${fmtDate(S.bak)}`:"Копий пока не было"}. Файл содержит все ваши записи, включая раздел 18+, — не пересылайте его посторонним.</p>
  <div class="row"><button class="btn" id="dExp">Сохранить копию</button><label class="btn quiet file-btn">Восстановить<input type="file" id="dImp" accept="application/json,.json"></label></div>
  ${IMP?`<div class="demo-note"><span>В файле ${IMP.n} ${plural(IMP.n,"запись","записи","записей")} настроения и ${IMP.days} ${plural(IMP.days,"день","дня","дней")} занятий${IMP.ts?`, копия от ${fmtDate(IMP.ts)}`:""}. Текущие данные на этом телефоне будут заменены.</span><span class="row"><button class="btn quiet" id="iNo">Отмена</button><button class="btn" id="iYes">Восстановить</button></span></div>`:""}
  <button class="li" data-go="remind" style="margin-top:4px"><span class="ico">${ico("cal",18)}</span><span class="dt"><strong>Напоминания</strong><span class="small muted">Через календарь телефона, без серверов</span></span><span class="chev">›</span></button>
  </div>`;
}
const vAbout0=VIEWS.about[0], bAbout0=VIEWS.about[1];
function vAbout(){ const h=vAbout0(), k=h.indexOf('<button class="btn quiet" data-share'), i=h.lastIndexOf('<div class="card">', k); return i<0?h+dataCard():h.slice(0,i)+dataCard()+h.slice(i); }
function bindAbout(){
  const wantData=sub==="data"; if(wantData) sub=null;
  bAbout0();
  const e=$("#dExp"); if(e) e.onclick=exportData;
  const f=$("#dImp"); if(f) f.onchange=()=>readImport(f.files[0]);
  const n=$("#iNo"); if(n) n.onclick=()=>{ IMP=null; render(); };
  const y=$("#iYes"); if(y) y.onclick=()=>{ try{ localStorage.setItem(KEY, JSON.stringify(IMP.d)); }catch(err){ toast("Не хватает места для восстановления"); return; } IMP=null; toast("Данные восстановлены"); setTimeout(()=>location.reload(), 600); };
  if(wantData) setTimeout(()=>{ const c=$("#dataCard"); if(c) c.scrollIntoView({block:"start"}); },30);
}

/* ================= Дневник сна ================= */
const STAGS=["Кофе после обеда","Экран перед сном","Стресс","Спорт","Поздний ужин","Алкоголь","Шум","Просыпался(ась) ночью"];
const dur = e => { const [a,b]=e.bed.split(":").map(Number), [c,d]=e.wake.split(":").map(Number); let m=(c*60+d)-(a*60+b); if(m<=0) m+=1440; return m; };
const hm = m => `${Math.floor(m/60)} ч${m%60?` ${m%60} мин`:""}`;
let SF=null;
function vSleep(){
  const s=R().sleep.slice().sort((a,b)=>a.d<b.d?-1:1), today=dayKey(), have=s.find(e=>e.d===today);
  if(!SF) SF=have?{bed:have.bed, wake:have.wake, q:have.q, tags:have.tags.slice()}:(s.length?{bed:s[s.length-1].bed, wake:s[s.length-1].wake, q:0, tags:[]}:{bed:"23:30", wake:"07:30", q:0, tags:[]});
  const last=s.slice(-14), week=s.filter(e=>(Date.now()-new Date(e.d+"T12:00").getTime())<7.5*864e5);
  const avgD=week.length?week.reduce((a,e)=>a+dur(e),0)/week.length:0, avgQ=week.length?week.reduce((a,e)=>a+e.q,0)/week.length:0;
  const mx=Math.max(540,...last.map(dur));
  return `${backTo("practices","Практики")}<div class="stack-s"><h1>Дневник сна</h1><p class="muted small">30 секунд утром. Через пару недель станет видно, как сон влияет на настроение и что ему мешает.</p></div>
  <div class="card"><span class="label">${have?"Сегодняшняя запись":"Прошлая ночь"}</span>
    <div class="grid2 sl-times"><label class="field"><span class="small muted">Лёг(ла)</span><input type="time" id="slB" value="${SF.bed}"></label><label class="field"><span class="small muted">Встал(а)</span><input type="time" id="slW" value="${SF.wake}"></label></div>
    <p class="small">Получается: <strong id="slD">${hm(dur(SF))}</strong></p>
    <span class="small muted">Как спалось?</span>
    <div class="moods">${MOODS.map(m=>`<button class="mood" data-sq="${m.v}" aria-pressed="${SF.q===m.v}">${face(m.v)}<span>${["Ужасно","Плохо","Средне","Хорошо","Отлично"][m.v-1]}</span></button>`).join("")}</div>
    <span class="small muted">Что могло повлиять</span><div class="chips">${STAGS.map(t=>`<button class="chip" data-st="${t}" aria-pressed="${SF.tags.includes(t)}">${t}</button>`).join("")}</div>
    <button class="btn" id="slSave"${SF.q?"":" disabled"}>${have?"Обновить":"Сохранить"}</button></div>
  ${week.length?`<div class="card"><span class="label">Последние 7 дней</span><div class="st-grid"><div class="st-cell"><b>${hm(Math.round(avgD))}</b><span class="small muted">в среднем</span></div><div class="st-cell"><b>${avgQ.toFixed(1)}</b><span class="small muted">качество из 5</span></div></div>
    ${avgD<420?`<p class="small">Взрослым обычно нужно 7–9 часов сна. Попробуйте ложиться на 15 минут раньше каждые несколько дней.</p>`:""}</div>`:""}
  ${last.length>1?`<div class="card"><span class="label">Две недели</span><div class="d-bars sl-bars">${last.map(e=>`<span class="db" style="--h:${Math.max(6,dur(e)/mx*100)}%" title="${hm(dur(e))}"><i style="background:${moodColor(e.q)}"></i><small>${+e.d.slice(8)}</small></span>`).join("")}</div><p class="small muted">Высота — длительность, цвет — качество сна.</p></div>`:""}
  ${sleepInsight(s)}
  <div class="list">${li2("sounds",null,"moon","Звуки для сна","Дождь, море, лес — с таймером")}${li2("remind",null,"cal","Напоминание утром","Через календарь телефона")}</div>`;
}
const li2 = (go,sb,ic,t,s) => `<button class="li" data-go="${go}"${sb?` data-sub="${sb}"`:""}><span class="ico">${ico(ic,18)}</span><span class="dt"><strong>${t}</strong><span class="small muted">${s}</span></span><span class="chev">›</span></button>`;
function moodOn(dk){ const m=S.moods.filter(x=>dayKey(new Date(x.ts))===dk); return m.length?m.reduce((a,b)=>a+b.mood,0)/m.length:null; }
function sleepInsight(s){
  if(s.length<5) return s.length?`<p class="small muted">Ещё ${5-s.length} ${plural(5-s.length,"запись","записи","записей")} — и появятся наблюдения.</p>`:"";
  const lines=[], avg=a=>a.reduce((x,y)=>x+y,0)/a.length;
  const pairs=s.map(e=>({e, m:moodOn(e.d)})).filter(p=>p.m!=null);
  const long=pairs.filter(p=>dur(p.e)>=420).map(p=>p.m), short=pairs.filter(p=>dur(p.e)<390).map(p=>p.m);
  if(long.length>=2 && short.length>=2) lines.push(`После сна 7 часов и больше настроение в среднем <strong>${avg(long).toFixed(1)}</strong>, а после короткого сна — <strong>${avg(short).toFixed(1)}</strong> из 5.`);
  const good=pairs.filter(p=>p.e.q>=4).map(p=>p.m), bad=pairs.filter(p=>p.e.q<=2).map(p=>p.m);
  if(!lines.length && good.length>=2 && bad.length>=2) lines.push(`После хорошей ночи настроение <strong>${avg(good).toFixed(1)}</strong>, после плохой — <strong>${avg(bad).toFixed(1)}</strong> из 5.`);
  const allQ=avg(s.map(e=>e.q)), eff=STAGS.map(t=>{ const w=s.filter(e=>e.tags.includes(t)); return {t, n:w.length, v:w.length?avg(w.map(e=>e.q))-allQ:0}; }).filter(r=>r.n>=2&&r.v<-.3).sort((a,b)=>a.v-b.v).slice(0,2);
  if(eff.length) lines.push(`Хуже всего спится, когда было: ${eff.map(r=>`<strong>${r.t.toLowerCase()}</strong>`).join(" и ")}.`);
  const beds=s.slice(-14).map(e=>{ const [a,b]=e.bed.split(":").map(Number); let m=a*60+b; if(m<720) m+=1440; return m; }), spread=Math.max(...beds)-Math.min(...beds);
  if(beds.length>=5 && spread>=120) lines.push("Время отхода ко сну сильно скачет. Одно и то же время каждый день — один из самых действенных способов улучшить сон.");
  if(!lines.length) return `<p class="small muted">Закономерностей пока не видно — продолжайте отмечать и настроение, и сон.</p>`;
  return `<div class="card soft"><span class="label">Наблюдения</span>${lines.map(l=>`<p class="small">${l}</p>`).join("")}</div>`;
}
function bindSleep(){
  const upd=()=>{ SF.bed=$("#slB").value||SF.bed; SF.wake=$("#slW").value||SF.wake; $("#slD").textContent=hm(dur(SF)); };
  $("#slB").oninput=upd; $("#slW").oninput=upd;
  $$("[data-sq]").forEach(b=>b.onclick=()=>{ upd(); SF.q=+b.dataset.sq; render(); });
  $$("[data-st]").forEach(b=>b.onclick=()=>{ upd(); const t=b.dataset.st, i=SF.tags.indexOf(t); if(i>=0) SF.tags.splice(i,1); else SF.tags.push(t); b.setAttribute("aria-pressed", i<0); });
  $("#slSave").onclick=()=>{ upd(); const s=R().sleep, d=dayKey(), i=s.findIndex(e=>e.d===d), rec={d, bed:SF.bed, wake:SF.wake, q:SF.q, tags:SF.tags.slice()};
    if(i>=0) s[i]=rec; else { s.push(rec); markDay(); award("res",5); } if(s.length>400) S.sleep=s.slice(-400); save(); toast("Сон записан"); SF=null; render(); };
}

/* ================= Статистика настроения ================= */
const MN=["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const MNs=["Я","Ф","М","А","М","И","И","А","С","О","Н","Д"];
let MSY=null, MSM=null;
function dayAvg(list){ const by={}; list.forEach(m=>{ const k=dayKey(new Date(m.ts)); (by[k]=by[k]||[]).push(m.mood); }); const out={}; Object.entries(by).forEach(([k,v])=>out[k]=v.reduce((a,b)=>a+b,0)/v.length); return out; }
function vMStats(){
  const list=S.moods.slice(), now=new Date(), y=MSY??now.getFullYear(), m=MSM??now.getMonth(), da=dayAvg(list);
  const first=new Date(y,m,1), dim=new Date(y,m+1,0).getDate(), off=(first.getDay()+6)%7;
  const inM=list.filter(x=>{ const d=new Date(x.ts); return d.getFullYear()===y && d.getMonth()===m; });
  const pm=new Date(y,m-1,1), inP=list.filter(x=>{ const d=new Date(x.ts); return d.getFullYear()===pm.getFullYear() && d.getMonth()===pm.getMonth(); });
  const avg=a=>a.length?a.reduce((s,x)=>s+x.mood,0)/a.length:0;
  const cal=`<div class="mcal">${["пн","вт","ср","чт","пт","сб","вс"].map(w=>`<span class="mc-h">${w}</span>`).join("")}${Array(off).fill('<span></span>').join("")}${[...Array(dim)].map((_,i)=>{ const k=`${y}-${pad(m+1)}-${pad(i+1)}`, v=da[k]; return `<span class="mc-d${v?" on":""}" style="${v?`--c:${moodColor(Math.round(v))}`:""}" title="${v?v.toFixed(1):""}">${i+1}</span>`; }).join("")}</div>`;
  const nav=`<div class="row" style="justify-content:space-between;flex-wrap:nowrap"><button class="icon-btn" id="msPrev" aria-label="Предыдущий месяц">‹</button><strong>${MN[m]} ${y}</strong><button class="icon-btn" id="msNext" aria-label="Следующий месяц"${y===now.getFullYear()&&m===now.getMonth()?" disabled":""}>›</button></div>`;
  // отчёт месяца
  const lines=[];
  if(inM.length){ const a=avg(inM), p=avg(inP); lines.push(`Среднее настроение: <strong>${a.toFixed(1)}</strong> из 5${inP.length?` (в прошлом месяце ${p.toFixed(1)}${a-p>=.2?" — стало лучше":p-a>=.2?" — стало тяжелее":""})`:""}.`);
    const dows=[0,1,2,3,4,5,6].map(i=>{ const w=inM.filter(x=>(new Date(x.ts).getDay()+6)%7===i); return [i,w.length?avg(w):null,w.length]; }).filter(r=>r[2]>=2);
    if(dows.length>=3){ dows.sort((a,b)=>b[1]-a[1]); const W=["понедельник","вторник","среда","четверг","пятница","суббота","воскресенье"]; lines.push(`Лучший день недели — <strong>${W[dows[0][0]]}</strong>, самый трудный — <strong>${W[dows[dows.length-1][0]]}</strong>.`); }
    const all=avg(inM), by={}; inM.forEach(x=>(x.tags||[]).forEach(t=>(by[t]=by[t]||[]).push(x.mood)));
    const eff=Object.entries(by).filter(([,v])=>v.length>=2).map(([t,v])=>[t,v.reduce((s,z)=>s+z,0)/v.length-all]).sort((a,b)=>b[1]-a[1]);
    const up=eff.filter(e=>e[1]>=.3).slice(0,2), dn=eff.filter(e=>e[1]<=-.3).slice(-2).reverse();
    if(up.length) lines.push(`Поднимает настроение: ${up.map(e=>`<strong>${esc(e[0])}</strong>`).join(", ")}.`);
    if(dn.length) lines.push(`Тянет вниз: ${dn.map(e=>`<strong>${esc(e[0])}</strong>`).join(", ")}.`);
    const emo={}; inM.forEach(x=>(x.emotions||[]).forEach(e=>{ const k=e.split("/")[1]||e; emo[k]=(emo[k]||0)+1; })); const te=Object.entries(emo).sort((a,b)=>b[1]-a[1]).slice(0,3);
    if(te.length) lines.push(`Чаще всего вы называли: ${te.map(e=>e[0]).join(", ")}.`);
    const sl=R().sleep.filter(e=>e.d.startsWith(`${y}-${pad(m+1)}`)); if(sl.length>=3) lines.push(`Средний сон: <strong>${hm(Math.round(sl.reduce((a,e)=>a+dur(e),0)/sl.length))}</strong>.`);
  }
  // год в клетках
  const yearCard = plusOn() ? (()=>{ const yy=now.getFullYear();
      return `<div class="card"><span class="label">${yy} — год в клетках</span><div class="ypix" role="img" aria-label="Настроение по дням за год">${MNs.map(x=>`<span class="yp-h">${x}</span>`).join("")}${[...Array(31)].map((_,d)=>[...Array(12)].map((_,mo)=>{ const dimm=new Date(yy,mo+1,0).getDate(); if(d>=dimm) return '<i class="na"></i>'; const v=da[`${yy}-${pad(mo+1)}-${pad(d+1)}`]; return v?`<i style="background:${moodColor(Math.round(v))}"></i>`:"<i></i>"; }).join("")).join("")}</div>
      <div class="yp-leg">${MOODS.map(x=>`<span><i style="background:${moodColor(x.v)}"></i>${x.t}</span>`).join("")}</div></div>`; })()
    : `<div class="card plus-lock"><span class="pl-ico">${LOCK}</span><h3>Год в клетках</h3><p class="small muted">Весь год одним экраном: каждый день — клетка цвета вашего настроения. Доступно в Опора+</p><button class="btn" data-go="plus">Подробнее</button></div>`;
  return `${backTo("diary","Дневник")}<div class="stack-s"><h1>Что влияет на настроение</h1><p class="muted small">Чем больше записей, тем точнее выводы. Для честной картины отмечайте и хорошие, и плохие дни.</p></div>
  <div class="card">${nav}${cal}</div>
  <div class="card"><span class="label">Отчёт месяца · ${inM.length} ${plural(inM.length,"запись","записи","записей")}</span>${lines.length?lines.map(l=>`<p class="small">${l}</p>`).join(""):`<p class="small muted">В этом месяце записей пока нет.</p><button class="btn quiet" data-go="diary" style="align-self:flex-start">Сделать запись</button>`}</div>
  ${yearCard}
  ${S.sleep&&S.sleep.length?"":`<button class="banner card" data-go="sleep"><span class="bi">${ico("moon",20)}</span><span class="bt"><strong>Добавьте дневник сна</strong><span class="small muted">Увидите, как сон влияет на настроение</span></span><span class="chev">›</span></button>`}`;
}
function bindMStats(){
  const now=new Date(); const cy=()=>MSY??now.getFullYear(), cm=()=>MSM??now.getMonth();
  const p=$("#msPrev"); if(p) p.onclick=()=>{ let y=cy(), m=cm()-1; if(m<0){ m=11; y--; } MSY=y; MSM=m; render(); };
  const n=$("#msNext"); if(n) n.onclick=()=>{ let y=cy(), m=cm()+1; if(m>11){ m=0; y++; } MSY=y; MSM=m; render(); };
}
// входы в статистику и сон из дневника и практик
const vDiary0=VIEWS.diary[0];
VIEWS.diary=[()=>{ const h=vDiary0(), k=h.indexOf('<details class="more"><summary>Записи');
  const add=`<div class="grid2"><button class="tile" data-go="mstats"><span class="ico">${ico("emo")}</span><strong>Что влияет на настроение</strong><span class="small muted">Календарь и отчёт месяца</span></button><button class="tile" data-go="sleep"><span class="ico">${ico("moon")}</span><strong>Дневник сна</strong><span class="small muted">${R().sleep.length?`Записей: ${S.sleep.length}`:"Сон и настроение"}</span></button></div>`;
  return k<0?h+add:h.slice(0,k)+add+h.slice(k); }, VIEWS.diary[1]];
const vPr0=VIEWS.practices[0];
VIEWS.practices=[()=>{ const h=vPr0(), k=h.indexOf('<div class="stack-s"><span class="label">Упражнения</span>');
  const add=`<button class="banner card" data-go="sleep"><span class="bi">${ico("diary",20)}</span><span class="bt"><strong>Дневник сна</strong><span class="small muted">Как сон влияет на настроение</span></span><span class="chev">›</span></button>`;
  return k<0?h+add:h.slice(0,k)+add+h.slice(k); }, VIEWS.practices[1]];

/* ================= SOS для пары ================= */
const FE=[["Обида","обиду"],["Злость","злость"],["Тревога","тревогу"],["Одиночество","одиночество"],["Бессилие","бессилие"],["Ревность","ревность"],["Стыд","стыд"],["Разочарование","разочарование"],["Усталость","усталость"]];
const NE=[["Уважение","меня уважали"],["Внимание","меня замечали"],["Поддержка","меня поддерживали"],["Чтобы услышали","меня слышали"],["Честность","всё было честно"],["Близость","мы были ближе"],["Своё пространство","у меня было своё пространство"],["Ясность","я понимал(а), что происходит"]];
const MP=["повысил(а) голос","перебивал(а) тебя","сказал(а) «ты всегда» или «ты никогда»","замолчал(а) и ушёл(ла) от разговора","вспомнил(а) старые обиды","сказал(а) обидные слова"];
let LS={st:0, min:20, run:false, end:0, left:1200, f:[], n:[], p:[], sit:""};
let lsT=null;
const fmtT = s => { s=Math.max(0,Math.ceil(s)); return `${Math.floor(s/60)}:${pad(s%60)}`; };
function lsStop(){ if(lsT){ clearInterval(lsT); lsT=null; } LS.run=false; }
function lsTick(){
  if(route!=="lovesos"){ LS.left=Math.max(0,(LS.end-Date.now())/1000); lsStop(); return; }
  LS.left=(LS.end-Date.now())/1000;
  const t=$("#lsTime"); if(t) t.textContent=fmtT(LS.left);
  const fg=$(".fr-fg"); if(fg){ const C=2*Math.PI*88; fg.setAttribute("stroke-dashoffset", C*(LS.left/(LS.min*60))); }
  if(LS.left<=0){ lsStop(); if(window.SND) SND.cue("done"); LS.st=2; toast("Пауза окончена"); render(); window.scrollTo(0,0); }
}
function script(){
  const fe=LS.f.map(k=>FE.find(x=>x[0]===k)[1]), ne=LS.n.map(k=>NE.find(x=>x[0]===k)[1]), sit=LS.sit.trim().replace(/[.!]+$/,"");
  const join=a=>a.length<2?(a[0]||""):a.slice(0,-1).join(", ")+" и "+a[a.length-1];
  return [ "Я готов(а) вернуться к разговору.",
    fe.length?`${sit?`Когда ${sit}, я`:"Я"} почувствовал(а) ${join(fe)}.`:(sit?`Мне было трудно, когда ${sit}.`:""),
    ne.length?`Мне важно, чтобы ${join(ne)}.`:"",
    LS.p.length?`Мне жаль, что я ${join(LS.p)}.`:"",
    "Давай попробуем ещё раз: сначала расскажи, как это было для тебя, — я послушаю и не буду перебивать." ].filter(Boolean).join(" ");
}
function vLoveSos(){
  const top=`${backTo("love","Сегодня")}<div class="stack-s"><span class="label">SOS для пары · шаг ${LS.st+1} из 4</span>`;
  if(LS.st===0) return `${top}<h1>Стоп. Сначала пауза</h1></div>
    <div class="card"><p>Когда спор накаляется, пульс растёт, и тело переходит в режим «бей или беги». В таком состоянии почти невозможно слышать друг друга — даже если очень хочется договориться.</p><p class="small muted">Пауза — не бегство и не наказание молчанием. Это забота о разговоре: после неё вы вернётесь и договорите.</p></div>
    <div class="card soft"><span class="label">Скажите партнёру</span><p class="q-text" id="lsPh">«Мне нужно ${LS.min} минут, чтобы успокоиться. Я не ухожу от разговора — я вернусь, и мы договорим».</p><button class="btn quiet sm" id="lsCopy" style="align-self:flex-start">Скопировать</button></div>
    <div class="stack-s"><span class="small muted">Сколько нужно на паузу</span><div class="chips">${[10,20,30].map(m=>`<button class="chip" data-lm="${m}" aria-pressed="${LS.min===m}">${m} минут</button>`).join("")}</div></div>
    <button class="btn block" id="lsGo">Начать паузу</button>
    <button class="linkbtn small" id="lsSkip" style="align-self:center">Мы уже остыли — к разговору</button>
    <div class="card sos"><h3>Если вам страшно</h3><p class="small">Угрозы, толчки, удары, запирание, отбирание телефона — это не ссора, а насилие. Уйдите в безопасное место и позвоните.</p>
      <div class="stack-s"><div><div class="label">Экстренные службы</div><a class="phone" href="tel:112">112</a></div><div><div class="label">Горячая линия для пострадавших от домашнего насилия, бесплатно</div><a class="phone" href="tel:88007000600">8 800 7000‑600</a></div></div></div>`;
  if(LS.st===1){ const C=2*Math.PI*88, f=LS.left/(LS.min*60);
    return `${top}<h1>Пауза</h1><p class="muted small">Дышите в ритме круга. Не прокручивайте в голове, кто прав, — дайте телу успокоиться.</p></div>
    <div class="card f-card"><div class="f-wrap"><svg viewBox="0 0 200 200" class="f-ring" aria-hidden="true"><circle cx="100" cy="100" r="88" class="fr-bg"/><circle cx="100" cy="100" r="88" class="fr-fg" stroke-dasharray="${C}" stroke-dashoffset="${C*f}" transform="rotate(-90 100 100)"/></svg>
      <div class="f-mid"><span class="ls-breath${LS.run?" on":""}" aria-hidden="true"></span><span class="f-time" id="lsTime">${fmtT(LS.left)}</span><span class="small muted">${LS.run?"вдох 4 · выдох 6":"на паузе"}</span></div></div>
      <div class="row f-min"><button class="btn" id="lsRun">${LS.run?"Пауза таймера":"Продолжить"}</button><button class="btn quiet" id="lsDone">Я спокоен(на)</button></div></div>
    <div class="card"><span class="label">Что помогает</span><ul class="talk-list ok"><li>Выйти в другую комнату или на улицу, пройтись</li><li>Выпить воды, умыться прохладной водой</li><li>Медленно дышать: выдох длиннее вдоха</li><li>Спросить себя: что я чувствую под злостью? Чего мне на самом деле не хватает?</li></ul>
      <span class="label">Чего лучше не делать</span><ul class="talk-list no"><li>Писать партнёру длинные сообщения прямо сейчас</li><li>Жаловаться общим друзьям и родственникам</li><li>Пить алкоголь, чтобы «успокоиться»</li></ul></div>`; }
  if(LS.st===2) return `${top}<h1>Что я чувствую на самом деле</h1><p class="muted small">Под злостью почти всегда есть что-то уязвимое. Если назвать это, партнёру будет проще вас услышать.</p></div>
    <div class="card"><span class="label">Я почувствовал(а)</span><div class="chips">${FE.map(([t])=>`<button class="chip" data-lf="${t}" aria-pressed="${LS.f.includes(t)}">${t}</button>`).join("")}</div></div>
    <div class="card"><span class="label">Мне было важно</span><div class="chips">${NE.map(([t])=>`<button class="chip" data-ln="${t}" aria-pressed="${LS.n.includes(t)}">${t}</button>`).join("")}</div></div>
    <div class="card"><label class="field"><span>Что произошло — коротко, без оценок</span><input type="text" id="lsSit" maxlength="120" placeholder="Например: ты пришёл позже и не предупредил" value="${esc(LS.sit)}"></label></div>
    <div class="card"><span class="label">Моя часть — честно</span><p class="small muted">Признать свою часть — сильный шаг. Он почти всегда смягчает другого.</p><div class="chips">${MP.map(t=>`<button class="chip" data-lp="${esc(t)}" aria-pressed="${LS.p.includes(t)}">${t}</button>`).join("")}</div></div>
    <button class="btn block" id="lsNext">Собрать слова для разговора</button>`;
  return `${top}<h1>Вернуться к разговору</h1></div>
  <div class="card soft"><span class="label">Можно сказать так</span><p class="q-text" id="lsScr">${esc(script())}</p>
    <div class="row"><button class="btn quiet sm" id="lsCopy2">Скопировать</button><button class="btn quiet sm" id="lsEdit">Изменить</button></div></div>
  <div class="card"><span class="label">Как говорить</span><ul class="talk-list ok"><li>По очереди: 5–10 минут говорит один, второй только слушает и пересказывает услышанное</li><li>О себе: «я почувствовал(а)», а не «ты меня довёл(а)»</li><li>Об одном случае — без «всегда», «никогда» и старых обид</li><li>Если снова накаляется — ещё одна пауза. Это нормально</li></ul></div>
  <button class="btn quiet block" data-go="lovef">Разобрать ссору подробнее</button>
  <div class="card"><p class="small">Если ссоры повторяются по одному кругу, на консультации вдвоём можно найти, что их запускает.</p><button class="btn" data-go="about" data-sub="book" style="align-self:flex-start">Записаться к ${esc(PSY.nameTo)}</button></div>
  <button class="linkbtn small" id="lsReset" style="align-self:center">Начать заново</button>`;
}
function bindLoveSos(){
  $$("[data-lm]").forEach(b=>b.onclick=()=>{ LS.min=+b.dataset.lm; LS.left=LS.min*60; render(); });
  const cp=$("#lsCopy"); if(cp) cp.onclick=()=>copy($("#lsPh").textContent.replace(/[«»]/g,""), $("#lsPh"));
  const g=$("#lsGo"); if(g) g.onclick=()=>{ LS.st=1; LS.left=LS.min*60; LS.end=Date.now()+LS.left*1000; LS.run=true; if(window.SND) SND.cue("relax"); lsT=setInterval(lsTick,500); render(); window.scrollTo(0,0); };
  const sk=$("#lsSkip"); if(sk) sk.onclick=()=>{ LS.st=2; render(); window.scrollTo(0,0); };
  const r=$("#lsRun"); if(r) r.onclick=()=>{ if(LS.run){ LS.left=Math.max(1,(LS.end-Date.now())/1000); lsStop(); } else { LS.end=Date.now()+LS.left*1000; LS.run=true; lsT=setInterval(lsTick,500); } render(); };
  const d=$("#lsDone"); if(d) d.onclick=()=>{ lsStop(); LS.st=2; render(); window.scrollTo(0,0); };
  if(LS.st===1 && LS.run && !lsT) lsT=setInterval(lsTick,500);
  const keepSit=()=>{ const s=$("#lsSit"); if(s) LS.sit=s.value; };
  const tog=(arr,v,b)=>{ keepSit(); const i=arr.indexOf(v); if(i>=0) arr.splice(i,1); else arr.push(v); b.setAttribute("aria-pressed", i<0); };
  $$("[data-lf]").forEach(b=>b.onclick=()=>tog(LS.f,b.dataset.lf,b));
  $$("[data-ln]").forEach(b=>b.onclick=()=>tog(LS.n,b.dataset.ln,b));
  $$("[data-lp]").forEach(b=>b.onclick=()=>tog(LS.p,b.dataset.lp,b));
  const s=$("#lsSit"); if(s) s.oninput=keepSit;
  const n=$("#lsNext"); if(n) n.onclick=()=>{ keepSit(); LS.st=3; markDay(); award("aware",10); render(); window.scrollTo(0,0); };
  const c2=$("#lsCopy2"); if(c2) c2.onclick=()=>copy(script(), $("#lsScr"));
  const ed=$("#lsEdit"); if(ed) ed.onclick=()=>{ LS.st=2; render(); };
  const rs=$("#lsReset"); if(rs) rs.onclick=()=>{ lsStop(); LS={st:0, min:20, run:false, end:0, left:1200, f:[], n:[], p:[], sit:""}; render(); window.scrollTo(0,0); };
}

/* ================= «Мы»: короче «Сегодня» и вход в SOS ================= */
const vLove0=VIEWS.love?VIEWS.love[0]:null;
const darkOn = () => matchMedia("(prefers-color-scheme: dark)").matches && document.documentElement.dataset.theme!=="light" || document.documentElement.dataset.theme==="dark";
function ourPath(){
  const G=LOVE.garden, Cp=LOVE.couple; if(!G) return "";
  const n=Object.values(G.counts()).reduce((a,b)=>a+b,0), wx=Cp?Cp.wxList():[], last=wx[wx.length-1];
  return `<div class="card our-path"><span class="label">Наш путь</span>
    <button class="op-garden" data-go="lovegd" aria-label="Открыть «Наш сад»"><span class="garden-mini">${G.gardenSVG({dark:darkOn(), slice:true})}</span></button>
    <button class="li" data-go="lovegd"><span class="ico">${ico("practices",18)}</span><span class="dt"><strong>Наш сад${G.levelInfo?` · уровень ${G.levelInfo().lv}`:""}</strong><span class="small muted">${n?`${G.levelInfo?G.levelInfo().name+" · ":""}${n} ${plural(n,"росток","ростка","ростков")} из общих дел`:"Сделайте что-то вместе — появится первый росток"}</span></span><span class="chev">›</span></button>
    <button class="li" data-go="lovew"><span class="ico">${ico("emo",18)}</span><span class="dt"><strong>Погода в паре${plusOn()?" и отчёт месяца":""}</strong><span class="small muted">${last?`Близость ${last.c} · поддержка ${last.s} · напряжение ${last.t}`:"30 секунд раз в неделю"}</span></span><span class="chev">›</span></button></div>`;
}
const sosBanner = () => `<button class="banner card sos-pair" data-go="lovesos"><span class="bi">${ico("hand",20)}</span><span class="bt"><strong>Поссорились?</strong><span class="small muted">Пауза, дыхание и слова, чтобы помириться</span></span><span class="chev">›</span></button>`;
if(vLove0){
  VIEWS.love=[()=>{ let h=vLove0();
    h=h.replace('<button class="sos-pill" data-go="sos">','<button class="sos-pill" data-go="lovesos">');
    const i=h.indexOf('<button class="card garden-card"'); if(i>=0) h=h.slice(0,i)+ourPath();
    const q=h.indexOf('<div class="quick2">'); if(q>=0){ const e=h.indexOf("</div>",q)+6; h=h.slice(0,e)+sosBanner()+h.slice(e); }
    return h; }, VIEWS.love[1]];
}
if(window.LOVE && LOVE.ROOM_ROUTES && !LOVE.ROOM_ROUTES.includes("lovesos")) LOVE.ROOM_ROUTES.push("lovesos");

/* ================= Регистрация ================= */
Object.assign(VIEWS,{about:[vAbout,bindAbout], remind:[vRemind,bindRemind], sleep:[vSleep,bindSleep], mstats:[vMStats,bindMStats], lovesos:[vLoveSos,bindLoveSos]});
Object.assign(TAB_OF,{remind:"about", sleep:"practices", mstats:"diary", lovesos:"practices"});
// нижнее меню прячем только на экране знакомства
const render0=window.render;
window.render=function(){ document.body.classList.toggle("onb-on", route==="home" && needOnbF()); return render0.apply(this, arguments); };
window.RETAIN={ics, exportData, R};
})();
