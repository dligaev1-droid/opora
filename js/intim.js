/* «Близость 18+» — просветительский раздел о сексуальности взрослых (тариф «Опора+ Всё»).
   В рамках закона РФ: знак 18+ и подтверждение возраста (436-ФЗ), без откровенных описаний и изображений,
   без диагнозов и назначений (только «когда к врачу»), без тем, попадающих под запреты о «пропаганде».
   Все ответы хранятся только на телефоне пользователя (сведения об интимной жизни — особая категория данных, 152-ФЗ). */
(function(){
"use strict";
const LV=window.LOVE;
const isObj = v => !!v && typeof v==="object" && !Array.isArray(v);
// Проверка и починка данных раздела: повреждённые записи отбрасываются, а не ломают экраны
const I = () => {
  if(!isObj(S.intim)) S.intim={};
  const x=S.intim;
  if(typeof x.adult!=="boolean") x.adult=x.adult===true;
  if(!Array.isArray(x.tests)) x.tests=[]; x.tests=x.tests.filter(r=>isObj(r) && Array.isArray(r.a) && r.a.length===12);
  if(!Array.isArray(x.maps)) x.maps=[]; x.maps=x.maps.filter(r=>isObj(r) && Array.isArray(r.a) && Array.isArray(r.b));
  return x;
};
const all = () => !!(LV && LV.L().all);
const adult = () => !!I().adult;
const LOCK='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
const AGE=`<span class="age18" aria-label="Только для взрослых, 18 плюс">18+</span>`;

/* ---------- Навигация ---------- */
const IR=["itoday","iknow","iart","ipair","iwish","isens","italk","icons","itest","ihelp","iplus"];
const ROOT=["itoday","iknow","ipair","itest","ihelp"];
const PARENT={iart:"iknow",iwish:"ipair",isens:"ipair",italk:"ipair",icons:"ipair",iplus:"itoday"};
const NAVI={
  itoday:'<path d="M12 21s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 8a4.3 4.3 0 0 1 7.5 2.8C19.5 16.4 12 21 12 21z"/>',
  iknow:'<path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z"/><path d="M8 7h6"/>',
  ipair:'<circle cx="9" cy="12" r="6"/><circle cx="15" cy="12" r="6"/>',
  itest:'<path d="M5 12h3l2-5 4 10 2-5h3"/>',
  ihelp:'<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.5"/>'
};
const NAV=[["itoday","Обзор"],["iknow","Знания"],["ipair","Пара"],["itest","Тест"],["ihelp","Помощь"]];
const BL={itoday:"Обзор",iknow:"Знания",ipair:"Пара",itest:"Тест",ihelp:"Помощь"};
const nico = (k,sz=22) => `<svg viewBox="0 0 24 24" width="${sz}" height="${sz}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${NAVI[k]}</svg>`;
const iback = () => ROOT.includes(route) ? "" : `<button class="back" data-go="${PARENT[route]||"itoday"}">← ${BL[PARENT[route]||"itoday"]}</button>`;
const lockCard = what => `<div class="card plus-lock"><span class="pl-ico">${LOCK}</span><h3>${what}</h3><p class="small muted">Доступно в тарифе «Опора+ Всё»</p><button class="btn" data-go="iplus">Подробнее</button></div>`;
const li = (go, sb, icon, t, s, locked) => `<button class="li" data-go="${go}"${sb?` data-sub="${sb}"`:""}><span class="ico">${icon}</span><span class="dt"><strong>${t}</strong><span class="small muted">${s}</span></span>${locked?`<span class="plus-tag sm">${LOCK}</span>`:`<span class="chev">›</span>`}</button>`;

const prevRoom=window.ROOM_OF||(()=>"");
window.ROOM_OF = r => IR.includes(r) ? "intim" : prevRoom(r);
const prevNav=window.ROOM_NAV;
window.ROOM_NAV = r => { if(!IR.includes(r)) return prevNav?prevNav(r):""; if(!adult()) return ""; const cur=ROOT.includes(r)?r:(PARENT[r]||"itoday"); return NAV.map(([k,t])=>`<button data-go="${k}" ${cur===k?'aria-current="page"':''}>${nico(k)}<span>${t}</span></button>`).join(""); };
const prevRow=window.roomsRow;
window.roomsRow = () => (prevRow?prevRow():`<div class="rooms"></div>`).replace(/<\/div>\s*$/, "") + `<button class="room-card rc-intim" data-go="itoday"><span class="rc-ico">${nico("itoday",18)}</span><span class="row" style="gap:8px"><strong>Близость</strong>${AGE}</span><span class="small">Желание, тело и разговоры в паре — бережно и без стыда</span></button></div>`;
window.intimLi = () => `<button class="li" data-go="itoday"><span class="ico">${nico("itoday",18)}</span><span class="dt"><strong>Близость ${AGE}</strong><span class="small muted">Желание, тело, разговоры о близости</span></span><span class="chev">›</span></button>`;

/* ---------- Подтверждение возраста ---------- */
function gate(){
  return `<div class="card age-gate">${AGE.replace('age18"','age18 big"')}
    <h2>Раздел для взрослых</h2>
    <p class="small">Здесь просветительские материалы психолога о сексуальности и близости взрослых людей: желание, тело, здоровье, разговоры в паре. Без откровенных изображений.</p>
    <p class="small muted">Информационная продукция для лиц старше 18 лет. Запрещено для детей.</p>
    <button class="btn" id="ageYes">Мне есть 18 лет</button>
    <button class="btn quiet" data-go="home">Мне нет 18 — вернуться</button>
  </div>`;
}
const guard = (v,b) => [()=>adult()?v():gate(), ()=>{ if(!adult()){ const y=$("#ageYes"); if(y) y.onclick=()=>{ I().adult=true; save(); render(); }; return; } if(b) b(); }];

/* ---------- Статьи ---------- */
const IA=[
  {id:"desire", t:"Почему желание бывает разным — и это нормально", m:4, p:[
    "Принято думать, что желание должно возникать само, внезапно и сильно. У многих людей так и бывает — это называют спонтанным желанием. Но у многих других желание отзывчивое: оно появляется не до, а в ответ на близость — объятия, нежность, ощущение безопасности.",
    "Оба варианта — норма. Отзывчивое желание не значит, что с человеком что-то не так или что он «не любит». Просто ему нужно больше времени, тепла и подходящих условий, чтобы захотеть.",
    "В парах почти всегда желание у партнёров не совпадает по силе и частоте. Это не поломка отношений, а обычная разница, о которой можно договариваться — без давления и обид.",
    "Полезный вопрос не «почему ты не хочешь?», а «что помогает тебе почувствовать желание и что мешает?». Ответить на него поможет тест «Тормоза и газ»."]},
  {id:"stress", t:"Стресс, усталость и желание", m:3, p:[
    "Исследователи описывают желание как систему с двумя педалями: «газ» — то, что его разжигает, и «тормоз» — то, что гасит. Часто дело не в слабом газе, а в том, что тормоз зажат.",
    "Самые сильные тормоза — стресс, хроническая усталость, недосып, тревога, нерешённые конфликты и ощущение, что на тебе всё держится. Когда организм в режиме выживания, близость отходит на второй план — это естественная реакция, а не каприз.",
    "Поэтому иногда лучшее, что можно сделать для близости, — не «стараться больше», а снять нагрузку: выспаться, разделить домашние дела, дать друг другу отдохнуть, помириться.",
    "Если желания нет давно, а вместе с ним пропали силы, радость и интерес к жизни — это может быть признаком выгорания или депрессии. Пройдите тест на выгорание в основном разделе и обсудите это со специалистом."]},
  {id:"body", t:"Тело, стыд и образ себя", m:3, p:[
    "Трудно расслабиться рядом с другим человеком, когда в голове звучит: «живот», «не такая кожа», «он(а) заметит». Недовольство телом — один из самых частых и самых незаметных тормозов близости.",
    "Стыд часто приходит из прошлого: замечания в детстве, сравнения, неудачный опыт. Он не говорит правду о вашем теле — он говорит о том, чему вас когда-то научили.",
    "Помогает переключать внимание с того, как вы выглядите, на то, что вы чувствуете: тепло, прикосновения, дыхание. И говорить партнёру о своих переживаниях — чаще всего он видит вас совсем иначе.",
    "Если стыд или неприязнь к телу сильно мешают жить, с этим хорошо работать вместе с психологом."]},
  {id:"diff", t:"Мужчины и женщины: различия и мифы", m:4, p:[
    "Различия есть, но они меньше, чем принято думать. В среднем мужчины чаще описывают спонтанное желание, а женщины — отзывчивое. Но различия внутри каждого пола больше, чем между полами: есть мужчины с отзывчивым желанием и женщины со спонтанным.",
    "Миф «мужчины всегда хотят» вредит обоим: мужчинам стыдно признаться в усталости или отсутствии желания, а женщины воспринимают это как отвержение. На деле стресс и усталость гасят желание у всех.",
    "Миф «если любит — догадается» тоже не работает. Никто не умеет читать мысли. Желания нужно называть словами — и это нормально, даже спустя годы вместе.",
    "Миф «с возрастом всё заканчивается»: меняется тело и ритм, но близость и удовольствие возможны в любом возрасте. Иногда — даже спокойнее и глубже, чем в молодости."]},
  {id:"horm", t:"Гормоны простыми словами", m:4, p:[
    "Это общая информация, а не руководство к лечению. Анализы и лечение назначает только врач.",
    "Тестостерон влияет на желание и у мужчин, и у женщин. Он может снижаться с возрастом, при хроническом стрессе, недосыпе, лишнем весе и некоторых заболеваниях.",
    "У женщин уровень гормонов меняется в течение цикла, поэтому желание часто колеблется в разные дни месяца. После родов, при кормлении грудью и в период менопаузы уровень эстрогенов снижается — могут появиться сухость и дискомфорт. Это решаемо: с этим идут к гинекологу.",
    "Желание могут снижать и другие причины: повышенный пролактин, нарушения работы щитовидной железы, некоторые лекарства. Если вы связываете перемены с началом приёма препарата — не отменяйте его сами, обсудите с врачом.",
    "Не принимайте гормоны и добавки «для либидо» без назначения врача — это может быть опасно."]},
  {id:"life", t:"Когда жизнь меняется: роды, болезнь, возраст", m:3, p:[
    "Близость не стоит на месте: она меняется вместе с жизнью. После рождения ребёнка, во время болезни, при переезде, смене работы или с возрастом желание и привычки пары почти всегда перестраиваются.",
    "После родов многим нужно несколько месяцев, а иногда и больше, чтобы тело восстановилось и желание вернулось. Усталость, недосып и новая роль — серьёзные тормоза. Важно не торопить себя и не сравнивать с другими.",
    "В трудные периоды помогает сохранять близость без цели: объятия, нежность, время вдвоём. Это держит связь, пока остальное восстанавливается.",
    "Если изменения сопровождаются болью, тревогой или напряжением в паре — это повод обратиться к врачу или психологу. Вы не обязаны справляться с этим в одиночку."]}
];
function vKnow(){
  return `<div class="stack-s"><h1>Знания</h1><p class="muted">Коротко и по делу — без стыда и мифов</p></div>
  <div class="list">${IA.map((a,i)=>li("iart",a.id,ico("book",18),a.t,`${a.m} мин`,i>0&&!all())).join("")}</div>
  <button class="card feat feat-i" data-go="ihelp"><span class="label">Важно</span><strong class="feat-t">Когда идти к врачу</strong><span class="small">Тревожные признаки и к какому специалисту обращаться</span><span class="feat-go">Открыть →</span></button>`;
}
function vArt(){
  const i=Math.max(0,IA.findIndex(a=>a.id===sub)), a=IA[i];
  if(i>0&&!all()) return `${iback()}<div class="stack-s"><h1>${a.t}</h1></div>${lockCard("Статья доступна в «Опора+ Всё»")}`;
  return `${iback()}<article class="stack"><div class="stack-s"><span class="label">${a.m} мин чтения · ${AGE}</span><h1>${a.t}</h1></div>${a.p.map(t=>`<p>${t}</p>`).join("")}</article>
  <p class="disclaimer">Материал носит просветительский характер и не заменяет консультацию врача.</p>`;
}

/* ---------- Тест «Тормоза и газ» ---------- */
const TQ=[
  ["b","tired","Мне сложно почувствовать желание, когда я устал(а)","Усталость","Сон и отдых — лучшая прелюдия. Попробуйте близость не поздно вечером, а когда больше сил."],
  ["b","stress","…когда у меня стресс на работе или с деньгами","Стресс","Нужна «перезагрузка» перед близостью: прогулка, душ, 10 минут тишины, чтобы мысли отпустили."],
  ["b","conflict","…когда мы недавно поссорились","Обиды и ссоры","Сначала помириться и договорить. Нерешённая обида — один из самых сильных тормозов."],
  ["b","body","…когда я недоволен(льна) своим телом","Недовольство телом","Переключайте внимание с внешнего вида на ощущения. Расскажите партнёру, что вас тревожит."],
  ["b","fear","…когда боюсь, что «не получится»","Тревога за результат","Уберите цель «должно получиться». Близость без обязательного продолжения снижает давление."],
  ["b","privacy","…когда нет уединения или могут помешать","Нет уединения","Позаботьтесь об обстановке: закрытая дверь, время, когда точно никто не помешает."],
  ["g","time","Желание приходит легче, когда мы провели время вдвоём","Время вдвоём","Свидания, прогулки и разговоры — это тоже близость. Планируйте время только для двоих."],
  ["g","wanted","…когда я чувствую себя желанным(ой)","Чувствовать себя желанным(ой)","Скажите партнёру, какие слова и знаки внимания для вас важны — и делайте то же для него."],
  ["g","rest","…когда я хорошо отдохнул(а)","Отдых","Выходные без спешки и выспавшееся утро могут дать больше, чем любые ухищрения."],
  ["g","new","…когда есть ощущение новизны","Новизна","Новое место, новая обстановка, новое совместное занятие — новизна в жизни оживляет и близость."],
  ["g","laugh","…когда мы вместе смеёмся и нам легко","Лёгкость и юмор","Игра и смех снимают напряжение. Не всё должно быть серьёзно."],
  ["g","safe","…когда я чувствую себя в безопасности и меня не торопят","Безопасность","Договоритесь, что «не сейчас» всегда можно сказать без обиды. Это парадоксально усиливает желание."]
];
const TO=["Не про меня","Немного","Заметно","Очень"];
let TS={i:0, a:[]};
function vTest(){
  const x=I();
  if(TS.i===0 && !TS.a.length && !TS.fresh && x.tests.length) TS.i=TQ.length;
  if(TS.i>=TQ.length && !x.tests.length) TS={i:0,a:[]};
  if(TS.i<TQ.length){ const q=TQ[TS.i];
    return `<div class="stack-s"><h1>Тормоза и газ</h1><p class="muted small">Что гасит и что разжигает ваше желание. 12 вопросов, 2 минуты.</p></div>
    <div class="progress"><i style="width:${TS.i/TQ.length*100}%"></i></div>
    <div class="card"><span class="label">${q[0]==="b"?"Тормоза":"Газ"} · ${TS.i+1} из ${TQ.length}</span><h3>${q[2]}</h3><div class="opts">${TO.map((o,i)=>`<button class="opt" data-ta="${i}">${o}</button>`).join("")}</div>
    ${TS.i?`<button class="linkbtn small" id="tBack" style="align-self:flex-start">← Предыдущий</button>`:""}</div>
    <p class="src-note">Это не научный тест, а упражнение для самонаблюдения по мотивам модели двойного контроля желания (Bancroft, Janssen, 2000). Научные опросники этой модели (SIS/SES) содержат откровенные формулировки, поэтому здесь используется упрощённая версия без баллов и норм.</p><p class="disclaimer">Не диагноз, а способ лучше понять себя. Ответы хранятся только на этом телефоне.</p>`; }
  const r=x.tests[x.tests.length-1]; const top=k=>TQ.map((q,i)=>[q,r.a[i]]).filter(([q])=>q[0]===k).sort((a,b)=>b[1]-a[1]).filter(([,v])=>v>0).slice(0,2);
  const B=top("b"), Gs=top("g");
  const block=(lab,arr)=>`<div class="card"><span class="label">${lab}</span>${arr.length?arr.map(([q],k)=>`<div class="m-row"><strong>${q[3]}</strong>${all()?`<span class="small">${q[4]}</span>`:""}</div>`).join(""):`<p class="small muted">Ничего не выделяется</p>`}</div>`;
  return `<div class="stack-s"><span class="label">Ваш результат</span><h1>Тормоза и газ</h1><p class="muted small">Чтобы желанию было легче, важно и отпустить тормоза, и нажать на газ.</p></div>
  ${block("Главные тормоза",B)}${block("Что разжигает",Gs)}
  ${all()?`<p class="small">Покажите результат партнёру или пройдите тест вдвоём по очереди — так проще понять друг друга.</p>`:lockCard("Советы, как отпустить тормоза и нажать на газ")}
  <button class="btn quiet block" id="tAgain">Пройти заново</button>
  <button class="linkbtn small" id="tDel" style="align-self:center">Удалить мои ответы</button>`;
}
function bindTest(){
  $$("[data-ta]").forEach(b=>b.onclick=()=>{ TS.a[TS.i]=+b.dataset.ta; TS.i++; if(TS.i>=TQ.length){ I().tests.push({ts:Date.now(), a:TS.a.slice()}); save(); award("aware",10); } render(); window.scrollTo(0,0); });
  const bk=$("#tBack"); if(bk) bk.onclick=()=>{ TS.i--; render(); };
  const ag=$("#tAgain"); if(ag) ag.onclick=()=>{ TS={i:0,a:[],fresh:true}; render(); };
  const dl=$("#tDel"); if(dl) dl.onclick=()=>{ I().tests=[]; TS={i:0,a:[],fresh:true}; save(); toast("Ответы удалены"); render(); };
}

/* ---------- Пара ---------- */
function vPair(){
  return `<div class="stack-s"><h1>Пара</h1><p class="muted">Говорить о близости — нормально. Вот с чего начать.</p></div>
  <div class="list">
    ${li("icons",null,ico("hand",18),"Согласие и границы","«Да», «нет» и «не сейчас»",false)}
    ${li("italk",null,ico("thoughts",18),"Как начать разговор о близости","Скрипт без неловкости",!all())}
    ${li("iwish",null,ico("heart",18),"Карта желаний","Вдвоём на одном телефоне: чего хочется больше",!all())}
    ${li("isens",null,nico("ipair",18),"Близость без спешки","Упражнение на внимание и доверие",!all())}
  </div>
  <div class="card soft"><p class="small">Если разговоры заходят в тупик, можно прийти на консультацию вдвоём — это нормальная часть заботы об отношениях.</p><button class="btn" data-go="about" data-sub="book" style="align-self:flex-start">Записаться к ${esc(PSY.nameTo)}</button></div>`;
}
function vCons(){
  return `${iback()}<div class="stack-s"><span class="label">Важно для всех</span><h1>Согласие и границы</h1></div>
  <div class="card"><ul class="talk-list ok">
    <li>Близость — только по взаимному и добровольному желанию.</li>
    <li>«Нет» и «не сейчас» — полноценные ответы. Их не нужно объяснять или оправдывать.</li>
    <li>Передумать можно в любой момент — даже если вы уже начали.</li>
    <li>Молчание, усталость или «ну ладно» под давлением — это не согласие.</li>
    <li>В браке и долгих отношениях согласие нужно точно так же.</li></ul></div>
  <div class="card"><span class="label">Что не является нормой</span><ul class="talk-list no">
    <li>Уговоры, давление, обиды и наказание молчанием за отказ.</li>
    <li>Шантаж, угрозы, принуждение.</li></ul></div>
  <div class="card sos"><h3>Если вас принуждают</h3><p class="small">Это насилие, и вы не виноваты. Вы можете получить помощь.</p>
    <div class="stack-s"><div><div class="label">Экстренные службы</div><a class="phone" href="tel:112">112</a></div>
    <div><div class="label">Горячая линия для пострадавших от домашнего насилия, бесплатно</div><a class="phone" href="tel:88007000600">8 800 7000‑600</a></div></div></div>`;
}
function vTalk(){
  if(!all()) return `${iback()}<div class="stack-s"><h1>Как начать разговор о близости</h1></div>${lockCard("Скрипт разговора")}`;
  return `${iback()}<div class="stack-s"><span class="label">Скрипт</span><h1>Как начать разговор о близости</h1></div>
  <div class="card"><span class="label">Когда</span><p class="small">В спокойный момент, когда вы оба не устали и никуда не спешите. Не в постели и не сразу после неудачной попытки.</p></div>
  <div class="card"><span class="label">Как начать</span><p class="talk-start">«Мне важна наша близость, и мне хочется, чтобы нам обоим было хорошо. Можно об этом поговорить?»</p></div>
  <div class="card"><span class="label">Что можно сказать</span><ul class="talk-list ok"><li>«Мне очень нравится, когда ты…»</li><li>«Мне не хватает… Как ты на это смотришь?»</li><li>«Что тебе хотелось бы больше? А что не нравится?»</li><li>«Давай договоримся, что “не сейчас” можно сказать без обиды»</li></ul></div>
  <div class="card"><span class="label">Чего лучше не говорить</span><ul class="talk-list no"><li>Сравнения с прошлыми партнёрами или «у других»</li><li>«С тобой что-то не так»</li><li>Упрёки и подсчёты «сколько раз было»</li></ul></div>
  <div class="card soft"><span class="label">Совет</span><p class="small">Начинайте с хорошего: что вам нравится уже сейчас. Потом — о желаниях. Слушайте ответ до конца и не торопитесь с выводами: один разговор — это начало, а не решение всего.</p></div>
  <button class="btn quiet block" data-go="iwish">Перейти к «Карте желаний»</button>`;
}
const WI=["Больше объятий в течение дня","Нежность без обязательного продолжения","Время вдвоём без спешки","Комплименты и тёплые слова","Чтобы инициативу чаще брал партнёр","Пробовать что-то новое вместе","Открыто говорить о близости","Романтические вечера","Больше спонтанности","Чувствовать себя желанным(ой)","Больше отдыха и меньше усталости","Знать, что можно сказать «не сейчас»"];
const WO=["Хочу больше","Всё хорошо","Не сейчас"];
let WM={step:"intro", n1:"", n2:"", a:[], b:[], i:0};
function vWish(){
  if(!all()) return `${iback()}<div class="stack-s"><h1>Карта желаний</h1></div>${lockCard("Карта желаний для пары")}`;
  const x=I();
  if(WM.step==="intro") return `${iback()}<div class="stack-s"><h1>Карта желаний</h1><p class="muted small">12 пунктов о близости — без откровенностей. Каждый отвечает по очереди на одном телефоне и не подглядывает. В конце — где вы совпадаете и о чём стоит поговорить.</p></div>
    <div class="card"><label class="field"><span>Имя первого</span><input type="text" id="wN1" value="${esc(WM.n1)}" maxlength="20"></label><label class="field"><span>Имя второго</span><input type="text" id="wN2" value="${esc(WM.n2)}" maxlength="20"></label><button class="btn" id="wGo">Начать</button></div>
    ${x.maps.length?`<button class="btn quiet block" id="wLast">Последний результат</button>`:""}`;
  if(WM.step==="pass") return `${iback()}<div class="card pass-card"><span class="pl-ico">${ico("hand",24)}</span><h2>Передайте телефон</h2><p class="muted">Теперь отвечает ${esc(WM.n2||"второй партнёр")}. Ответы первого скрыты.</p><button class="btn" id="wPass">Начать</button></div>`;
  if(WM.step==="a"||WM.step==="b") return `${iback()}<div class="stack-s"><span class="label">Отвечает: ${esc(WM.step==="a"?(WM.n1||"первый"):(WM.n2||"второй"))} · ${WM.i+1} из ${WI.length}</span><div class="progress"><i style="width:${WM.i/WI.length*100}%"></i></div></div>
    <div class="card"><h3>${WI[WM.i]}</h3><div class="opts">${WO.map((o,i)=>`<button class="opt" data-wo="${i}">${o}</button>`).join("")}</div></div>`;
  const r=WM.res||x.maps[x.maps.length-1]; if(!r){ WM.step="intro"; return vWish(); }
  const both=[], diff=[]; WI.forEach((t,i)=>{ if(r.a[i]===0&&r.b[i]===0) both.push(i); else if(r.a[i]!==r.b[i] && (r.a[i]===0||r.b[i]===0)) diff.push(i); });
  const n1=esc(r.n1||"Первый"), n2=esc(r.n2||"Второй");
  return `${iback()}<div class="stack-s"><span class="label">${n1} и ${n2}</span><h1>Ваша карта</h1></div>
  <div class="card"><span class="label">Оба хотите больше · ${both.length}</span>${both.length?both.map(i=>`<p>• ${WI[i]}</p>`).join(""):`<p class="small muted">Совпадений нет — это тоже информация</p>`}<p class="small muted">С этого легко начать: здесь вы уже согласны.</p></div>
  <div class="card"><span class="label">Стоит бережно обсудить · ${diff.length}</span>${diff.length?diff.map(i=>`<div class="m-row"><strong>${WI[i]}</strong><span class="small">${n1}: ${WO[r.a[i]].toLowerCase()} · ${n2}: ${WO[r.b[i]].toLowerCase()}</span></div>`).join(""):`<p class="small muted">Расхождений нет</p>`}<p class="small muted">«Не сейчас» — уважаемый ответ. Обсуждайте, что могло бы помочь, а не уговаривайте.</p></div>
  <div class="row"><button class="btn quiet" id="wNew">Пройти заново</button><button class="btn quiet" id="wDel">Удалить результат</button></div>`;
}
function bindWish(){
  const g=$("#wGo"); if(g) g.onclick=()=>{ WM={step:"a", n1:$("#wN1").value.trim(), n2:$("#wN2").value.trim(), a:[], b:[], i:0}; render(); };
  const l=$("#wLast"); if(l) l.onclick=()=>{ WM.step="res"; WM.res=null; render(); };
  const p=$("#wPass"); if(p) p.onclick=()=>{ WM.step="b"; WM.i=0; render(); };
  $$("[data-wo]").forEach(b=>b.onclick=()=>{ WM[WM.step][WM.i]=+b.dataset.wo; WM.i++;
    if(WM.i>=WI.length){ if(WM.step==="a") WM.step="pass"; else { const r={ts:Date.now(), n1:WM.n1, n2:WM.n2, a:WM.a.slice(), b:WM.b.slice()}; I().maps.push(r); WM.res=r; WM.step="res"; save(); award("aware",15); } }
    render(); window.scrollTo(0,0); });
  const n=$("#wNew"); if(n) n.onclick=()=>{ WM={step:"intro", n1:WM.n1, n2:WM.n2, a:[], b:[], i:0}; render(); };
  const d=$("#wDel"); if(d) d.onclick=()=>{ I().maps=[]; WM={step:"intro", n1:"", n2:"", a:[], b:[], i:0}; save(); toast("Результат удалён"); render(); };
}
function vSens(){
  if(!all()) return `${iback()}<div class="stack-s"><h1>Близость без спешки</h1></div>${lockCard("Упражнение для пары")}`;
  return `${iback()}<div class="stack-s"><span class="label">Упражнение для пары · 20 минут</span><h1>Близость без спешки</h1><p class="muted small">Упражнение на внимание и доверие. Его часто используют специалисты, когда в паре накопилось напряжение вокруг близости.</p></div>
  <div class="card"><span class="label">Главное правило</span><p>Цель — не «дойти до чего-то», а просто чувствовать. Заранее договоритесь, что сегодня близость не продолжится дальше упражнения. Это снимает давление с обоих.</p></div>
  <div class="eve">${[
    ["Подготовка","Тихая комната, приглушённый свет, телефоны в другой комнате. 20 минут, когда никто не помешает."],
    ["Прикосновения по очереди","Один медленно касается рук, плеч, спины, лица другого — без цели, с интересом, как будто впервые. Второй просто замечает ощущения. 10 минут, потом меняетесь."],
    ["Обратная связь","Тот, кого касаются, может сказать: «приятно», «чуть легче», «здесь не нужно». Это не критика, а подсказка."],
    ["Разговор после","Что было приятно? Что удивило? Было ли что-то неловкое? Без оценок «получилось / не получилось»."]
  ].map(([t,d],k)=>`<div class="eve-step"><span class="es-n">${k+1}</span><span class="es-b"><strong>${t}</strong><span class="small">${d}</span></span></div>`).join("")}</div>
  <p class="small muted">Повторяйте несколько раз в неделю. Если упражнение вызывает сильную тревогу или неприятные воспоминания — остановитесь и обсудите это со специалистом.</p>`;
}

/* ---------- Помощь ---------- */
function vHelp(){
  return `<div class="stack-s"><h1>Помощь</h1><p class="muted">Когда нужен врач, психолог или срочная помощь</p></div>
  <div class="card"><span class="label">Сразу к врачу, если</span><ul class="talk-list no">
    <li>Боль, кровь, необычные выделения или высыпания</li>
    <li>Желание резко пропало вместе с сильной усталостью, изменением веса, настроения</li>
    <li>Трудности с эрекцией — они бывают ранним сигналом проблем с сосудами, стоит проверить сердце и давление</li>
    <li>Изменения начались после нового лекарства (не отменяйте его сами)</li>
    <li>Есть повод беспокоиться об инфекциях</li></ul></div>
  <div class="card"><span class="label">К кому обращаться</span>
    <div class="m-row"><strong>Гинеколог</strong><span class="small">Боль, сухость, цикл, после родов, менопауза, контрацепция</span></div>
    <div class="m-row"><strong>Уролог или андролог</strong><span class="small">Эрекция, боль, мужское здоровье</span></div>
    <div class="m-row"><strong>Эндокринолог</strong><span class="small">Подозрение на гормональные нарушения, щитовидная железа</span></div>
    <div class="m-row"><strong>Врач-сексолог</strong><span class="small">Сексуальные трудности, которые не объясняются другими причинами</span></div>
    <div class="m-row"><strong>Психолог</strong><span class="small">Когда причина в отношениях, стрессе, тревоге, стыде или прошлом опыте</span></div></div>
  <div class="card soft"><p class="small">Я психолог и помогаю с психологической стороной близости: желание и его различия в паре, тревога, стыд, разговоры о сложном. Можно прийти одному или вдвоём.</p><button class="btn" data-go="about" data-sub="book" style="align-self:flex-start">Записаться к ${esc(PSY.nameTo)}</button></div>
  <div class="card sos"><h3>Если есть насилие или принуждение</h3>
    <div class="stack-s"><div><div class="label">Экстренные службы</div><a class="phone" href="tel:112">112</a></div>
    <div><div class="label">Горячая линия для пострадавших от домашнего насилия, бесплатно</div><a class="phone" href="tel:88007000600">8 800 7000‑600</a></div></div></div>
  <p class="disclaimer">Материалы раздела носят просветительский характер, не являются медицинской консультацией и не заменяют приём врача.</p>`;
}

/* ---------- Обзор ---------- */
function vToday(){
  const last=I().tests[I().tests.length-1];
  return `<div class="top"><div class="brand"><div class="logo intim-logo">${nico("itoday",18)}</div><div><div style="font-weight:700">Опора</div><div class="small muted">близость</div></div></div><div class="top-r">${AGE}<button class="sos-pill" data-go="sos">SOS</button></div></div>
  <div class="stack-s"><h1>Близость</h1><p class="muted">Бережно, без стыда и без откровенных картинок</p></div>
  <button class="card feat feat-i" data-go="itest"><span class="label">Тест · 2 минуты</span><strong class="feat-t">Тормоза и газ</strong><span class="small">${last?"Посмотреть свой результат":"Что гасит и что разжигает ваше желание"}</span><span class="feat-go">${last?"Открыть →":"Начать →"}</span></button>
  <div class="grid2">
    <button class="tile" data-go="iknow"><span class="ico">${nico("iknow")}</span><strong>Знания</strong><span class="small muted">Желание, гормоны, мифы</span></button>
    <button class="tile" data-go="ipair"><span class="ico">${nico("ipair")}</span><strong>Для пары</strong><span class="small muted">Разговор, карта желаний</span></button>
  </div>
  <div class="list">${li("icons",null,ico("hand",18),"Согласие и границы","Важно знать каждому",false)}${li("ihelp",null,nico("ihelp",18),"Когда идти к врачу","И к какому специалисту",false)}</div>
  ${all()?"":`<button class="banner card plus-banner" data-go="iplus"><span class="bi">${LOCK}</span><span class="bt"><strong>Открыть всё — «Опора+ Всё»</strong><span class="small muted">Близость, отношения и цели в одном тарифе</span></span><span class="chev">›</span></button>`}
  <p class="disclaimer">Ничего из этого раздела не покидает ваш телефон. ${AGE} Информационная продукция для взрослых.</p>
  <button class="btn quiet block" data-go="home">← Вернуться в Опору</button>`;
}

/* ---------- Тариф «Опора+ Всё» ---------- */
const fnv = s => { let h=0x811c9dc5; for(const c of s){ h^=c.charCodeAt(0); h=Math.imul(h,16777619)>>>0; } return h.toString(16); };
function vPlus(){
  return `${iback()}<div class="stack-s"><h1>Опора+ Всё</h1><p class="muted">Всё, что есть в приложении</p></div>
  <div class="card"><ul class="plus-list">
    <li>${ico("check",18)}<span><strong>Всё из «Опора+»:</strong> отношения и цели без ограничений</span></li>
    <li>${ico("check",18)}<span><strong>Близость ${AGE}:</strong> все статьи, карта желаний, скрипт разговора, упражнение для пары, советы по тесту</span></li>
    ${PSY.plusDiscount?`<li>${ico("check",18)}<span>Скидка ${+PSY.plusDiscount}% на консультации</span></li>`:""}
  </ul></div>
  ${all()?`<div class="card soft"><p><strong>«Опора+ Всё» подключена</strong></p><p class="small muted">Спасибо, что поддерживаете проект.</p></div>`:
  `<div class="card soft"><p><strong>Подписка скоро появится</strong></p><p class="small">Хотите доступ одним из первых — напишите ${esc(PSY.nameTo)}.</p>${PSY.telegram?`<a class="btn" href="https://t.me/${encodeURIComponent(PSY.telegram)}" target="_blank" rel="noopener" style="align-self:flex-start">Написать в Telegram</a>`:""}</div>
  <div class="card"><label class="field"><span>У меня есть код доступа</span><div class="row" style="flex-wrap:nowrap"><input type="text" id="ipCode" autocomplete="off" autocapitalize="characters" style="flex:1;min-width:0"><button class="btn" id="ipGo">Ввести</button></div></label></div>`}`;
}
function bindPlus(){
  const b=$("#ipGo"); if(!b) return;
  const f=()=>{ const v=$("#ipCode").value.trim().toUpperCase(); if(!v) return;
    if((PSY.allCodes||[]).includes(fnv(v))){ const l=LV.L(); l.plus=true; l.all=true; save(); toast("«Опора+ Всё» подключена"); render(); }
    else if((PSY.plusCodes||[]).includes(fnv(v))){ LV.L().plus=true; save(); toast("Подключена «Опора+». Для раздела 18+ нужен тариф «Всё»"); render(); }
    else toast("Код не подошёл"); };
  b.onclick=f; $("#ipCode").onkeydown=e=>{ if(e.key==="Enter") f(); };
}

/* ---------- Регистрация ---------- */
const V={itoday:[vToday], iknow:[vKnow], iart:[vArt], ipair:[vPair], iwish:[vWish,bindWish], isens:[vSens], italk:[vTalk], icons:[vCons], itest:[vTest,bindTest], ihelp:[vHelp], iplus:[vPlus,bindPlus]};
Object.entries(V).forEach(([k,[v,b]])=>{ VIEWS[k]=guard(v,b); TAB_OF[k]="practices"; });
window.INTIM={I, all, adult, AGE, LOCK, iback, lockCard, li, nico, guard, IR, ROOT, PARENT, NAV, NAVI, BL, TQ, IA, V};
})();
