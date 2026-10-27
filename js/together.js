/* Вместе: вопрос дня для пары, серия дней, «Как ты сейчас?», наши даты, квиз «Насколько ты меня знаешь»,
   тест «Как мы чувствуем любовь», идеи свиданий, список «Хотим вместе».
   Обмен с партнёром — ссылкой в мессенджере: данные лежат после # в адресе и не уходят ни на какой сервер. */
(function(){
"use strict";
const {L, plus, back, lockCard, LOCK, li} = window.LOVE;

/* ---------- Обмен ссылками ---------- */
const enc = o => { const b=new TextEncoder().encode(JSON.stringify(o)); let s=""; b.forEach(x=>s+=String.fromCharCode(x)); return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); };
const dec = s => { s=s.replace(/-/g,"+").replace(/_/g,"/"); const bin=atob(s); return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin,c=>c.charCodeAt(0)))); };
const str = (v,n=400) => typeof v==="string" ? v.slice(0,n) : "";
const int = (v,max) => Number.isInteger(v) && v>=0 && v<max ? v : -1;
let IN=null;
(function(){
  const m=(location.hash||"").match(/^#x=([\w-]{4,6000})$/);
  if(!m) return;
  try{ const o=dec(m[1]); if(o && typeof o==="object" && typeof o.t==="string") IN=o; }catch(e){}
  try{ history.replaceState(null,"",location.pathname+location.search+"#lovex"); }catch(e){}
})();
const linkOf = p => (PSY.siteUrl || location.origin+location.pathname) + "#x=" + enc(p);
async function send(text, p){
  const url=linkOf(p);
  try{ if(navigator.share){ await navigator.share({text, url}); return; } }catch(e){ if(e && e.name==="AbortError") return; }
  try{ window.open("https://t.me/share/url?url="+encodeURIComponent(url)+"&text="+encodeURIComponent(text), "_blank", "noopener"); }catch(e){}
}
const copyLink = (p, el) => copy(linkOf(p), el);
const me = () => str(L().me,30);
const nameField = () => me() ? "" : `<label class="field"><span class="small">Как подписать (имя)</span><input type="text" id="myName" maxlength="30" autocomplete="given-name"></label>`;
const keepName = () => { const n=$("#myName"); if(n && n.value.trim()){ L().me=n.value.trim().slice(0,30); save(); } return me()||"Партнёр"; };

/* ---------- Вопрос дня ---------- */
const DQ=["Что сегодня тебя порадовало?","Какой момент нашего знакомства ты помнишь лучше всего?","Что тебе сейчас нужно от меня больше всего?","Какую песню ты бы включил(а) прямо сейчас?","Куда бы ты хотел(а) поехать вдвоём этим летом?","За что ты сегодня благодарен(на)?","Что тебя удивило во мне, когда мы познакомились?","Какое блюдо ты хочешь, чтобы мы приготовили вместе?","Что помогает тебе успокоиться после тяжёлого дня?","Какая наша общая шутка тебе нравится больше всего?","Чему ты хочешь научиться в этом году?","Что ты любишь делать, когда остаёшься один(одна)?","Какой подарок ты помнишь до сих пор?","Чем ты гордишься на этой неделе?","Какое у тебя самое тёплое воспоминание из детства?","Что я делаю, от чего тебе становится спокойнее?","Какой фильм ты готов(а) пересматривать бесконечно?","Что тебе хочется изменить в нашем обычном дне?","Какое место в городе для тебя особенное?","О чём ты мечтал(а) в 15 лет?","Что для тебя идеальное утро?","Какой мой поступок ты бы назвал(а) самым заботливым?","Чего тебе не хватает в последнее время?","Какое у тебя тайное удовольствие?","Как ты понимаешь, что у тебя был хороший день?","Что бы ты сделал(а), если бы у нас был лишний выходной?","Какая привычка у меня тебе нравится?","О чём ты сегодня думал(а) чаще всего?","Какая книга или фильм изменили тебя?","Что тебе хочется попробовать вместе впервые?","Какой комплимент ты хотел(а) бы услышать?","Кто из друзей знает тебя лучше всех?","Что ты чувствуешь, когда мы долго не видимся?","Какой сезон тебе ближе и почему?","Что для тебя значит «дом»?","Когда ты в последний раз смеялся(ась) до слёз?","Какой совет ты бы дал(а) себе год назад?","Чем я могу помочь тебе на этой неделе?","Какая наша поездка была самой лучшей?","Что тебя сейчас тревожит, хотя бы немного?","Какое занятие заставляет тебя забыть о времени?","Что ты ценишь в наших отношениях больше всего?","Какой запах напоминает тебе о счастье?","Как бы ты описал(а) нас тремя словами?","Что тебе хочется услышать от меня сегодня?","Какой у тебя был самый смелый поступок?","Что тебе проще: попросить о помощи или помочь?","Какое наше «впервые» ты помнишь лучше всего?","Что ты хотел(а) бы, чтобы я лучше понимал(а) о твоей работе?","Какая мечта у тебя есть, о которой ты редко говоришь?","Как ты любишь, чтобы тебя поддерживали, когда плохо?","Что бы ты хотел(а) сохранить в нас через десять лет?","Какое животное ты бы завёл(а)?","Что тебя вдохновляет в последнее время?","Какую традицию ты хочешь, чтобы у нас появилась?","Что в тебе изменилось с тех пор, как мы вместе?","Где ты чувствуешь себя по-настоящему собой?","Что тебе сегодня было трудно?","За что ты можешь похвалить себя прямо сейчас?","Что ты хочешь сказать мне, но откладываешь?"];
const dayNum = (t=Date.now()) => { const d=new Date(t); return Math.floor(new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime()/864e5); };
const qOf = dn => ((dn % DQ.length) + DQ.length) % DQ.length;
const QD = () => { const l=L(); if(!l.qd || typeof l.qd!=="object") l.qd={}; return l.qd; };
function streak(){
  const qd=QD(); let n=0, d=dayNum();
  if(!qd[d]) d--;
  while(qd[d] && qd[d].me){ n++; d--; }
  return n;
}
function dqCard(){
  const d=dayNum(), r=QD()[d], s=streak();
  return `<button class="card dq-card" data-go="loved"><span class="row" style="justify-content:space-between"><span class="label">Вопрос дня для двоих</span>${s?`<span class="streak">${s} ${plural(s,"день","дня","дней")} подряд</span>`:""}</span>
    <span class="dq-q">${DQ[qOf(d)]}</span>
    <span class="small muted">${!r||!r.me?"Ответьте и отправьте партнёру — увидите ответы друг друга":r.them?"Оба ответили · посмотреть":"Ваш ответ готов · ждём партнёра"}</span></button>`;
}
function vDay(){
  const d=dayNum(), q=qOf(d), r=QD()[d]||{};
  const hist=Object.entries(QD()).filter(([k,v])=>+k!==d && v.me).sort((a,b)=>b[0]-a[0]).slice(0,14);
  return `${back()}
  <div class="stack-s"><span class="label">Вопрос дня${streak()?` · серия ${streak()}`:""}</span><h1 class="dq-h">${DQ[q]}</h1></div>
  ${r.me?`<div class="card"><span class="label">Вы</span><p>${esc(r.me)}</p>
      ${r.them?`<span class="label">${esc(r.tn||"Партнёр")}</span><p>${esc(r.them)}</p>`:`<p class="small muted">Отправьте вопрос партнёру. Его ответ откроется вам, когда он ответит и пришлёт ссылку обратно.</p>`}
      ${nameField()}
      <div class="row"><button class="btn" id="dqSend">${r.them?"Отправить партнёру ещё раз":"Отправить партнёру"}</button><button class="btn quiet" id="dqCopy">Скопировать ссылку</button></div>
      <button class="linkbtn small" id="dqEdit" style="align-self:flex-start">Изменить ответ</button></div>`
  :`<div class="card"><textarea id="dqIn" placeholder="Ваш ответ" aria-label="Ваш ответ" maxlength="400">${esc(r.draft||"")}</textarea><button class="btn" id="dqSave">Ответить</button></div>`}
  <p class="disclaimer">Ответы хранятся только на ваших телефонах и передаются только ссылкой, которую вы отправляете сами.</p>
  ${hist.length?`<details class="more"><summary>Прошлые вопросы · ${hist.length}</summary><div>${hist.map(([k,v])=>`<div class="entry"><div class="body"><strong class="small">${esc(DQ[v.q]||"")}</strong><p class="small">Вы: ${esc(v.me)}</p>${v.them?`<p class="small">${esc(v.tn||"Партнёр")}: ${esc(v.them)}</p>`:""}<span class="small muted">${fmtDate(+k*864e5)}</span></div></div>`).join("")}</div></details>`:""}`;
}
function bindDay(){
  const d=dayNum(), q=qOf(d), qd=QD();
  const sv=$("#dqSave"); if(sv) sv.onclick=()=>{ const v=$("#dqIn").value.trim(); if(!v){ toast("Напишите пару слов"); return; }
    const first=!qd[d]||!qd[d].me; qd[d]=Object.assign(qd[d]||{}, {q, me:v}); delete qd[d].draft; save(); if(first){ markDay(); award("self",5); } render(); };
  const pl=()=>({t:"q", d, q, n:keepName(), a:qd[d].me, ...(qd[d].them?{r:qd[d].them}:{})});
  const sn=$("#dqSend"); if(sn) sn.onclick=()=>send(`${keepName()} ответил(а) на вопрос дня в «Опоре». Ответь — и увидишь ответ:`, pl());
  const cp=$("#dqCopy"); if(cp) cp.onclick=()=>copyLink(pl(), cp);
  const ed=$("#dqEdit"); if(ed) ed.onclick=()=>{ qd[d].draft=qd[d].me; qd[d].me=""; save(); render(); };
}

/* ---------- «Как ты сейчас?» ---------- */
const MS=["Скучаю по тебе","Устал(а), обними меня","Мне нужно немного побыть одному(ой)","Всё хорошо, думаю о тебе","Тревожно, поддержи меня","Хочу поговорить","Злюсь, но не на тебя","Давай сегодня отдохнём вместе","Обнимаю тебя","Я рядом","Позвоню, как смогу","Давай поговорим вечером"];
const MS_SEND=8;
function vMood(){
  return `${back()}<div class="stack-s"><h1>Как ты сейчас?</h1><p class="muted small">Иногда сложно сказать словами. Выберите — и отправьте партнёру.</p></div>
  <div class="card">${nameField()}<div class="mood-list">${MS.slice(0,MS_SEND).map((m,i)=>`<button class="opt" data-ms="${i}">${m}</button>`).join("")}</div></div>`;
}
function bindMood(){ $$("[data-ms]").forEach(b=>b.onclick=()=>{ const i=+b.dataset.ms, n=keepName(); send(`${n}: «${MS[i]}»`, {t:"m", n, s:i}); }); }

/* ---------- Наши даты ---------- */
const DT = () => { const l=L(); if(!l.dates || typeof l.dates!=="object") l.dates={start:"", list:[]}; if(!Array.isArray(l.dates.list)) l.dates.list=[]; return l.dates; };
const daysTo = md => { const now=new Date(); now.setHours(0,0,0,0); const [m,d]=md.split("-").map(Number); let t=new Date(now.getFullYear(),m-1,d); if(t<now) t=new Date(now.getFullYear()+1,m-1,d); return Math.round((t-now)/864e5); };
function upcoming(){
  const D=DT(), all=[]; if(D.start) all.push({t:"Годовщина", md:D.start.slice(5)});
  D.list.forEach(x=>{ if(/^\d{4}-\d{2}-\d{2}$/.test(x.d)) all.push({t:x.t, md:x.d.slice(5)}); });
  return all.map(x=>Object.assign(x,{n:daysTo(x.md)})).sort((a,b)=>a.n-b.n);
}
function datesCard(){
  const D=DT(); if(!D.start && !D.list.length) return "";
  const together=D.start?Math.max(0,Math.floor((Date.now()-new Date(D.start).getTime())/864e5)):null, nx=upcoming()[0];
  return `<button class="card dates-card" data-go="lovedt">${together!=null?`<span><b>${together.toLocaleString("ru-RU")}</b><span class="small muted">${plural(together,"день","дня","дней")} вместе</span></span>`:""}${nx?`<span><b>${nx.n||"Сегодня!"}</b><span class="small muted">${nx.n?`${plural(nx.n,"день","дня","дней")} до: ${esc(nx.t)}`:esc(nx.t)}</span></span>`:""}<span class="chev">›</span></button>`;
}
function vDates(){
  const D=DT(), up=upcoming();
  return `${back()}<div class="stack-s"><h1>Наши даты</h1><p class="muted small">Сколько вы вместе и что скоро</p></div>
  <div class="card"><label class="field"><span>Когда вы вместе</span><input type="date" id="dStart" value="${esc(D.start)}"></label>${datesCard()}</div>
  <div class="card"><span class="label">Важные даты</span>
    ${up.filter(x=>x.t!=="Годовщина"||!D.start).length||D.list.length?D.list.map((x,i)=>`<div class="entry"><div class="body"><strong>${esc(x.t)}</strong><span class="small muted">${x.d?new Date(x.d).toLocaleDateString("ru-RU",{day:"numeric",month:"long"}):""} · через ${daysTo(x.d.slice(5))} дн.</span></div><button class="linkbtn small" data-ddel="${i}">Удалить</button></div>`).join(""):`<p class="small muted">День рождения партнёра, день знакомства, первая поездка…</p>`}
    <div class="row" style="flex-wrap:nowrap"><input type="text" id="dName" placeholder="Название" aria-label="Название даты" style="flex:1;min-width:0" maxlength="40"><input type="date" id="dDate" aria-label="Дата" style="width:auto"></div>
    <button class="btn quiet" id="dAdd">Добавить дату</button></div>`;
}
function bindDates(){
  const D=DT();
  $("#dStart").onchange=e=>{ D.start=e.target.value; save(); render(); };
  $("#dAdd").onclick=()=>{ const t=$("#dName").value.trim(), d=$("#dDate").value; if(!t||!d){ toast("Укажите название и дату"); return; } D.list.push({t,d}); save(); render(); };
  $$("[data-ddel]").forEach(b=>b.onclick=()=>{ D.list.splice(+b.dataset.ddel,1); save(); render(); });
}

/* ---------- Квиз «Насколько ты меня знаешь» ---------- */
const KQ=[
  ["Мой идеальный выходной",["Дома под пледом","Прогулка и кафе","Поездка за город","Встреча с друзьями"]],
  ["Когда мне грустно, мне больше поможет",["Обнять молча","Поговорить","Отвлечь чем-то весёлым","Дать побыть одному(ой)"]],
  ["Моё любимое время суток",["Раннее утро","День","Вечер","Ночь"]],
  ["Что мне приятнее получить",["Тёплые слова","Маленький подарок","Время вместе","Помощь с делами"]],
  ["Где я хочу побывать больше всего",["У моря","В горах","В большом городе","В тихой деревне"]],
  ["Что меня раздражает сильнее",["Опоздания","Беспорядок","Шум","Когда перебивают"]],
  ["Как я отдыхаю после тяжёлого дня",["Сериал","Ванна или душ","Спорт или прогулка","Разговор с близкими"]],
  ["Какая еда меня точно порадует",["Пицца","Что-то домашнее","Суши","Сладкое"]],
  ["В споре я скорее",["Сразу говорю","Молчу и думаю","Ухожу остыть","Шучу"]],
  ["Лучший подарок для меня",["Впечатление","Полезная вещь","Сделанное своими руками","Книга"]],
  ["Что для меня важнее дома",["Уют","Чистота","Простор","Тишина"]],
  ["Утром мне нужно",["Кофе","Тишина","Объятия","Ещё поспать"]],
  ["О чём я мечтаю чаще",["О путешествиях","О своём доме","О любимом деле","О спокойствии"]],
  ["Как я люблю отмечать день рождения",["Шумно с друзьями","Вдвоём","С семьёй","Лучше не отмечать"]],
  ["Что меня быстрее всего рассмешит",["Смешное видео","Глупая шутка","Воспоминание","Щекотка"]],
  // «Наше прошлое»
  ["Что я первым заметил(а) в тебе",["Улыбку","Глаза","Голос","Чувство юмора"]],
  ["Какой момент начала наших отношений мне дороже всего",["Первое свидание","Первая поездка","Первое «люблю»","Обычный вечер вместе"]],
  ["Как я чувствовал(а) себя на нашем первом свидании",["Волновался(ась)","Было легко","Хотелось произвести впечатление","Сразу понял(а), что это надолго"]],
  ["Какую нашу поездку я вспоминаю чаще",["Самую первую","Самую далёкую","Неудачную, но смешную","Любимой ещё не было"]],
  ["Когда я понял(а), что у нас всё серьёзно",["С первой встречи","Через несколько недель","После трудного периода","Когда познакомился(ась) с твоей семьёй"]],
  ["Что из начала отношений мне хочется вернуть",["Свидания","Долгие разговоры","Сюрпризы","Ничего — сейчас лучше"]],
  ["Какое наше фото мне нравится больше всего",["Из путешествия","Случайное домашнее","С праздника","Самое первое"]],
  ["Какой твой поступок тронул меня сильнее всего",["Поддержка в трудный момент","Сюрприз","Забота, когда я болел(а)","Слова, которые ты сказал(а)"]],
  ["Наш первый год одним словом",["Влюблённость","Приключение","Притирка","Спокойствие"]],
  ["Наша годовщина для меня — это",["Важный праздник","Повод побыть вдвоём","Обычный день","Я не помню дату"]],
  // «Вкусы»
  ["Мой любимый жанр фильмов",["Комедия","Драма","Фантастика","Детектив или триллер"]],
  ["Моя любимая кухня",["Итальянская","Японская","Домашняя","Грузинская"]],
  ["Что я пью по утрам",["Чёрный кофе","Кофе с молоком","Чай","Воду"]],
  ["Музыка, которую я включу в дороге",["Поп","Рок","Рэп","Что-то спокойное"]],
  ["Мой идеальный отпуск",["Пляж и море","Походы и активность","Города и музеи","Дома без планов"]],
  ["Моё любимое время года",["Весна","Лето","Осень","Зима"]],
  ["Чего мне хочется вечером",["Сладкого","Солёного","Острого","Всего подряд"]],
  ["Что я выберу на свободный вечер",["Настольную игру","Сериал","Прогулку","Книгу"]],
  ["Мой любимый цвет",["Синий","Зелёный","Красный","Чёрный или белый"]],
  ["Какое животное я бы завёл(а)",["Кошку","Собаку","Кого-то необычного","Никого"]],
  // «Страхи и мечты»
  ["Чего я боюсь больше всего",["Остаться одному(ой)","Потерять близких","Не реализоваться","Болезней"]],
  ["Моя главная мечта на ближайшие 5 лет",["Свой дом","Любимое дело","Путешествия","Семья и дети"]],
  ["Если бы деньги не были проблемой, я бы",["Путешествовал(а)","Открыл(а) своё дело","Помогал(а) другим","Отдыхал(а)"]],
  ["Что тревожит меня чаще всего",["Деньги","Здоровье","Работа","Отношения"]],
  ["Чему я хочу научиться",["Новому языку","Играть на инструменте","Новому спорту","Творчеству"]],
  ["Где я хотел(а) бы жить",["В большом городе","У моря","За городом","Там, где сейчас"]],
  ["Что придаёт мне смелости",["Твоя поддержка","Мой опыт","Друзья","Вера в себя"]],
  ["О чём я жалею чаще",["О несказанном","О непопробованном","О потраченном времени","Почти ни о чём"]],
  ["Какой я вижу нашу старость",["Дом с садом","Путешествия","Рядом с детьми и внуками","Пока не думал(а)"]],
  ["Что для меня значит успех",["Свобода","Признание","Спокойствие","Счастливая семья"]]
];
// Темы квиза: первая бесплатно, остальные — Опора+. Ссылки партнёру работают для всех тем.
const KT=[{t:"Обо мне", a:0, b:15},{t:"Наше прошлое", a:15, b:25},{t:"Вкусы", a:25, b:35},{t:"Страхи и мечты", a:35, b:45}];
let KD={step:"intro", i:0, ids:[], a:[]};
function pick5(th=0){ const T=KT[th]||KT[0], ids=KQ.map((_,i)=>i).slice(T.a,T.b); for(let i=ids.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [ids[i],ids[j]]=[ids[j],ids[i]]; } return ids.slice(0,5); }
function vKnow(){
  if(KD.step==="intro") return `${back()}<div class="stack-s"><h1>Насколько ты меня знаешь</h1><p class="muted small">Ответьте на 5 вопросов о себе и отправьте партнёру. Он попробует угадать — и вы оба увидите результат.</p></div>
    <div class="card"><span class="small muted">Тема</span><div class="chips">${KT.map((x,i)=>`<button class="chip" data-kt="${i}" aria-pressed="${(KD.th||0)===i}">${x.t}${i>0&&!plus()?" "+LOCK:""}</button>`).join("")}</div>
    ${(KD.th||0)>0&&!plus()?`<p class="small muted">Тема «${KT[KD.th].t}» доступна в Опора+. Тема «Обо мне» — бесплатно.</p><button class="btn" data-go="plus">Подробнее</button>`:`${nameField()}<button class="btn" id="kGo">Загадать о себе</button>`}</div>`;
  if(KD.step==="ask"){ const [t,o]=KQ[KD.ids[KD.i]]; return `${back()}<div class="stack-s"><span class="label">О себе · ${KD.i+1} из 5</span><div class="progress"><i style="width:${KD.i*20}%"></i></div></div>
    <div class="card"><h3>${t}</h3><div class="opts">${o.map((x,i)=>`<button class="opt" data-ka="${i}">${x}</button>`).join("")}</div></div>`; }
  const p={t:"k", n:me()||"Партнёр", i:KD.ids, a:KD.a};
  return `${back()}<div class="card pass-card"><span class="pl-ico">${ico("check",24)}</span><h2>Готово</h2><p class="muted">Отправьте партнёру — пусть угадает ваши ответы.</p>
    <div class="row" style="justify-content:center"><button class="btn" id="kSend">Отправить партнёру</button><button class="btn quiet" id="kCopy">Скопировать ссылку</button></div></div>`;
}
function bindKnow(){
  $$("[data-kt]").forEach(b=>b.onclick=()=>{ KD.th=+b.dataset.kt; render(); });
  const g=$("#kGo"); if(g) g.onclick=()=>{ keepName(); const th=KD.th||0; KD={step:"ask", i:0, ids:pick5(th), a:[], th}; render(); };
  $$("[data-ka]").forEach(b=>b.onclick=()=>{ KD.a[KD.i]=+b.dataset.ka; KD.i++; if(KD.i>=5){ KD.step="done"; markDay(); award("self",5); } render(); });
  const p={t:"k", n:me()||"Партнёр", i:KD.ids, a:KD.a};
  const s=$("#kSend"); if(s) s.onclick=()=>send(`${p.n} загадал(а) 5 вопросов о себе в «Опоре». Угадаешь?`, p);
  const c=$("#kCopy"); if(c) c.onclick=()=>copyLink(p, c);
}

/* ---------- Тест «Как мы чувствуем любовь» ---------- */
const LW={
  w:{t:"Слова", s:["Когда мне говорят тёплые слова","Когда меня хвалят и замечают старания"], tip:"Говорите, за что цените. Хвалите при других. Пишите тёплые сообщения среди дня."},
  time:{t:"Время вдвоём", s:["Когда мы проводим время вдвоём, без телефонов","Когда со мной по-настоящему разговаривают"], tip:"Время без телефонов, прогулки и разговоры, где всё внимание — друг другу."},
  help:{t:"Помощь делом", s:["Когда мне помогают с делами","Когда берут на себя что-то, что я не люблю делать"], tip:"Возьмите на себя дело, которое партнёр не любит. Помогайте, не дожидаясь просьбы."},
  gift:{t:"Знаки внимания", s:["Когда мне дарят что-то со смыслом","Когда приносят маленький сюрприз «просто так»"], tip:"Маленькие сюрпризы: любимая шоколадка, цветок, вещь, которая напомнила о нём или о ней."},
  touch:{t:"Прикосновения", s:["Когда меня обнимают","Когда держат за руку или садятся рядом"], tip:"Обнимайте при встрече и прощании, держитесь за руки, садитесь рядом."}
};
const LK=Object.keys(LW), LP=[]; LK.forEach((a,i)=>LK.slice(i+1).forEach(b=>LP.push([a,b])));
let LD={step:"intro", n1:"", n2:"", a:[], b:[], i:0, solo:false};
const lwScore = arr => { const s={}; LK.forEach(k=>s[k]=0); arr.forEach((k)=>{ if(s[k]!=null) s[k]++; }); return s; };
function lwBlock(name, sc, full){
  const top=LK.slice().sort((a,b)=>sc[b]-sc[a]);
  return `<div class="card"><span class="label">${esc(name)}</span><h3>${LW[top[0]].t}${full?` и ${LW[top[1]].t.toLowerCase()}`:""}</h3>
    ${full?`<div class="lw-bars">${top.map(k=>`<div class="eb"><span class="small">${LW[k].t}</span><span class="bar"><i style="width:${sc[k]/4*100}%"></i></span><span class="small muted">${sc[k]}</span></div>`).join("")}</div>
    <p class="small"><strong>Как порадовать:</strong> ${LW[top[0]].tip}</p>`:""}</div>`;
}
function vLw(){
  const l=L(); if(!Array.isArray(l.lw)) l.lw=[];
  if(LD.step==="intro") return `${back()}<div class="stack-s"><h1>Как мы чувствуем любовь</h1><p class="muted small">Люди по-разному чувствуют, что их любят: через слова, время, помощь, подарки или прикосновения. 10 пар — выбирайте, что вам ценнее.</p><p class="src-note">Это игра для разговора, а не научный тест. Идея «пяти языков любви» Г. Чепмена популярна, но исследования её не подтверждают (Impett, Park, Muise, 2024): людям нужны все формы заботы, а не одна. Используйте результат как повод поговорить о том, что для вас важно.</p></div>
    <div class="card"><label class="field"><span>Ваше имя</span><input type="text" id="lN1" value="${esc(LD.n1||me())}" maxlength="20"></label><label class="field"><span>Имя партнёра (если проходите вдвоём)</span><input type="text" id="lN2" value="${esc(LD.n2)}" maxlength="20"></label>
    <div class="row"><button class="btn" id="lGo">Пройти вдвоём</button><button class="btn quiet" id="lSolo">Только я</button></div></div>
    ${l.lw.length?`<button class="btn quiet block" id="lLast">Последний результат</button>`:""}`;
  if(LD.step==="pass") return `${back()}<div class="card pass-card"><span class="pl-ico">${ico("hand",24)}</span><h2>Передайте телефон</h2><p class="muted">Теперь отвечает ${esc(LD.n2||"партнёр")}.</p><button class="btn" id="lPass">Начать</button></div>`;
  if(LD.step==="a"||LD.step==="b"){ const [x,y]=LP[LD.i], v=LD.i%2;
    return `${back()}<div class="stack-s"><span class="label">Отвечает: ${esc(LD.step==="a"?(LD.n1||"вы"):(LD.n2||"партнёр"))} · ${LD.i+1} из ${LP.length}</span><div class="progress"><i style="width:${LD.i/LP.length*100}%"></i></div></div>
    <div class="card"><h3>Что вам ценнее?</h3><div class="opts"><button class="opt" data-lw="${x}">${LW[x].s[v]}</button><button class="opt" data-lw="${y}">${LW[y].s[1-v]}</button></div></div>`; }
  const r=LD.res||l.lw[l.lw.length-1]; if(!r){ LD.step="intro"; return vLw(); }
  return `${back()}<div class="stack-s"><span class="label">Результат</span><h1>Как вы чувствуете любовь</h1></div>
    ${lwBlock(r.n1||"Вы", lwScore(r.a), plus())}${r.b&&r.b.length?lwBlock(r.n2||"Партнёр", lwScore(r.b), plus()):""}
    ${plus()?`<p class="small muted">Мы часто любим так, как хотим, чтобы любили нас. Если ваши способы разные — это не беда: просто теперь вы знаете, на каком языке говорить.</p>`:lockCard("Полный профиль и советы, как радовать друг друга")}
    <button class="btn quiet block" id="lNew">Пройти заново</button>`;
}
function bindLw(){
  const start=solo=>{ LD={step:"a", n1:$("#lN1").value.trim(), n2:$("#lN2").value.trim(), a:[], b:[], i:0, solo}; if(LD.n1 && !me()){ L().me=LD.n1; save(); } render(); };
  const g=$("#lGo"); if(g) g.onclick=()=>start(false);
  const so=$("#lSolo"); if(so) so.onclick=()=>start(true);
  const la=$("#lLast"); if(la) la.onclick=()=>{ LD.step="res"; LD.res=null; render(); };
  const ps=$("#lPass"); if(ps) ps.onclick=()=>{ LD.step="b"; LD.i=0; render(); };
  $$("[data-lw]").forEach(b=>b.onclick=()=>{ LD[LD.step][LD.i]=b.dataset.lw; LD.i++;
    if(LD.i>=LP.length){ if(LD.step==="a" && !LD.solo){ LD.step="pass"; } else { const r={ts:Date.now(), n1:LD.n1, n2:LD.solo?"":LD.n2, a:LD.a.slice(), b:LD.solo?[]:LD.b.slice()}; L().lw.push(r); LD.res=r; LD.step="res"; save(); markDay(); award("aware",15); } }
    render(); window.scrollTo(0,0); });
  const nw=$("#lNew"); if(nw) nw.onclick=()=>{ LD={step:"intro", n1:LD.n1, n2:LD.n2, a:[], b:[], i:0}; render(); };
}

/* ---------- Идеи свиданий ---------- */
// h: home|out · c: 0 бесплатно, 1 недорого, 2 с бюджетом · m: минуты
const ID=[
  ["Пикник на полу в гостиной: плед, свечи, любимая еда","home",1,90],["Прогулка без цели: на каждом перекрёстке по очереди выбираете, куда свернуть","out",0,60],["Приготовить блюдо кухни страны, где вы ещё не были","home",1,120],["Смотреть рассвет вместе","out",0,60],["Вечер старых фотографий и историй к ним","home",0,60],["Сходить туда, где вы были на первом свидании","out",1,120],
  ["Устроить домашний кинотеатр с попкорном и программкой","home",1,150],["Настольная игра или пазл на весь вечер","home",0,120],["Написать друг другу письма и прочитать вслух","home",0,45],["Пойти в музей или на выставку, где никто из вас не был","out",2,180],["Танцевать дома под плейлист вашей молодости","home",0,30],["Мастер-класс вдвоём: гончарный, кулинарный, рисование","out",2,180],
  ["Велосипедная прогулка в новый район или парк","out",1,180],["Завтрак в постель по очереди — сегодня одному, завтра другому","home",1,45],["Звёздное небо: выехать за город и лечь на плед","out",1,180],["Сделать вместе что-то руками: собрать полку, посадить цветы","home",1,120],["Вечер вопросов из «Вопросов для двоих» при свечах","home",0,60],["Поход в баню или спа вдвоём","out",2,180],
  ["Выбрать на карте ближайший город и съездить на день","out",2,600],["Кафе, где вы никогда не были, и заказать то, чего не пробовали","out",2,90],["Караоке дома или в баре","out",1,120],["Сходить на концерт или в театр","out",2,180],["Устроить фотосессию друг другу на прогулке","out",0,90],["Вечер без телефонов: убрать их в ящик до утра","home",0,240],
  ["Испечь что-то по семейному рецепту одного из вас","home",1,120],["Составить список «Хотим вместе» и выбрать первый пункт","home",0,45],["Покататься на коньках, роликах или лодке","out",1,120],["Сходить на рынок и приготовить ужин из того, что приглянулось","out",1,180],["Посмотреть фильм, который любил(а) один из вас в детстве","home",0,120],["Массаж по очереди с ароматным маслом","home",1,60],
  ["Поехать на природу с термосом и бутербродами","out",1,240],["Пройти квест-комнату вдвоём","out",2,90],["Записать «капсулу времени»: письма себе через год","home",0,45],["Устроить дегустацию: сыры, чаи или шоколад","home",2,90],["Вместе сделать доброе дело: приют для животных, помощь соседям","out",0,120],["Вечер мечтаний: где мы будем через 5 лет","home",0,60],
  ["Нарисовать портреты друг друга, даже если не умеете","home",0,45],["Сходить в планетарий или на обсерваторию","out",2,120],["Устроить «день да»: один предлагает, другой соглашается","out",1,480],["Ужин при свечах дома в нарядной одежде","home",1,120]
];
const dSeg = cur => `<div class="seg" role="tablist"><button role="tab" data-go="loveid" aria-selected="${cur==="id"}">Сюрпризы</button><button role="tab" data-go="lovewl" aria-selected="${cur==="wl"}">Хотим вместе</button></div>`;
const FREE_IDEAS=8;
const SC = () => { const l=L(); if(!l.scr || typeof l.scr!=="object") l.scr={open:[], done:[]}; ["open","done"].forEach(k=>{ if(!Array.isArray(l.scr[k])) l.scr[k]=[]; }); return l.scr; };
const canOpen = i => plus() || i<FREE_IDEAS;
const cost=c=>["бесплатно","недорого","с бюджетом"][c], dur=m=>m<60?m+" мин":m<=180?(Math.round(m/60*2)/2+" ч").replace(".",","):"на весь день";
const meta = i => `${ID[i][1]==="home"?"Дома":"Вне дома"} · ${cost(ID[i][2])} · ${dur(ID[i][3])}`;
let SCI=null;
function vIdeas(){
  const s=SC(), next=ID.findIndex((_,i)=>!s.open.includes(i));
  const tile=i=>{
    const o=s.open.includes(i), d=s.done.includes(i);
    if(o) return `<button class="sc-tile open${d?" done":""}" data-sc="${i}"><span class="sc-n">${i+1}${d?` · ${ico("check",14)} провели`:""}</span><span class="sc-t">${ID[i][0]}</span></button>`;
    if(!canOpen(i)) return `<button class="sc-tile lock" data-go="plus" aria-label="Свидание ${i+1}, доступно в Опора+"><span class="sc-big">${i+1}</span>${LOCK}</button>`;
    return `<button class="sc-tile cover${i===next?" next":""}" data-sc="${i}" aria-label="Свидание ${i+1}, закрыто"><span class="sc-big">${i+1}</span><span class="small">${i===next?"Следующее":"?"}</span></button>`;
  };
  return `<div class="stack-s"><h1>Свидания</h1></div>${dSeg("id")}
  <div class="stack-s">
    <p class="muted small">${ID.length} свиданий под защитным слоем. Открывайте по очереди — одно за раз, так интереснее. Но если не терпится, можно стереть и все сразу.</p></div>
  <div class="row small muted"><span>Открыто ${s.open.length} из ${ID.length}</span><span>·</span><span>Провели ${s.done.length}</span></div>
  <div class="sc-grid">${ID.map((_,i)=>tile(i)).join("")}</div>
  ${!plus()?lockCard(`Ещё ${ID.length-FREE_IDEAS} свиданий`):""}
  ${ID.some((_,i)=>canOpen(i)&&!s.open.includes(i))?`<button class="linkbtn small" id="scAll" style="align-self:center">Не терпится? Открыть все сразу</button>`:""}`;
}
function scModal(i){
  SCI=i; const s=SC(), opened=s.open.includes(i);
  const m=document.createElement("div"); m.className="sc-modal"; m.setAttribute("role","dialog"); m.setAttribute("aria-modal","true"); m.setAttribute("aria-label",`Свидание ${i+1}`);
  m.innerHTML=`<div class="sc-sheet">
    <div class="sc-card"><div class="sc-under"><span class="label">Свидание ${i+1}</span><p class="sc-text">${ID[i][0]}</p><span class="small muted">${meta(i)}</span></div>${opened?"":`<canvas class="sc-canvas" aria-hidden="true"></canvas>`}</div>
    <p class="small muted sc-hint" ${opened?"hidden":""}>Сотрите слой пальцем</p>
    <div class="sc-act" ${opened?"":"hidden"}>
      <button class="btn" id="scDone">${s.done.includes(i)?"Отметить, что ещё не были":"Мы провели это свидание"}</button>
      <button class="btn quiet" id="scWish">В «Хотим вместе»</button>
    </div>
    <div class="row" style="justify-content:space-between"><button class="linkbtn small" id="scSkip" ${opened?"hidden":""}>Открыть без стирания</button><button class="linkbtn small" id="scClose" style="margin-left:auto">Закрыть</button></div>
  </div>`;
  document.body.appendChild(m); document.body.style.overflow="hidden";
  const close=()=>{ m.remove(); document.body.style.overflow=""; SCI=null; render(); };
  m.onclick=e=>{ if(e.target===m) close(); };
  m.querySelector("#scClose").onclick=close;
  m.addEventListener("keydown",e=>{ if(e.key==="Escape") close(); });
  m.querySelector("#scDone").onclick=()=>{ const s=SC(); if(s.done.includes(i)) s.done=s.done.filter(x=>x!==i); else { s.done.push(i); markDay(); award("self",20); toast("Здорово, что вы нашли время друг для друга"); } save(); close(); };
  m.querySelector("#scWish").onclick=()=>{ if(wishAdd(ID[i][0])) toast("Добавлено в «Хотим вместе»"); };
  const reveal=()=>{
    const s=SC(); if(!s.open.includes(i)){ s.open.push(i); save(); award("self",3); if(window.SND) SND.cue("done"); }
    const cv=m.querySelector(".sc-canvas"); if(cv){ cv.classList.add("gone"); setTimeout(()=>cv.remove(),600); }
    m.querySelector(".sc-hint").hidden=true; m.querySelector("#scSkip").hidden=true; m.querySelector(".sc-act").hidden=false;
  };
  m.querySelector("#scSkip").onclick=reveal;
  const cv=m.querySelector(".sc-canvas"); if(cv) paintCover(cv, i, reveal);
  setTimeout(()=>(m.querySelector("#scSkip:not([hidden])")||m.querySelector("#scClose")).focus(),50);
}
function paintCover(cv, i, onDone){
  const r=cv.getBoundingClientRect(), dpr=Math.min(2, window.devicePixelRatio||1);
  cv.width=Math.round(r.width*dpr); cv.height=Math.round(r.height*dpr);
  const x=cv.getContext("2d"); x.scale(dpr,dpr); const W=r.width, H=r.height;
  const g=x.createLinearGradient(0,0,W,H); g.addColorStop(0,"#C97F8B"); g.addColorStop(.5,"#E3B49B"); g.addColorStop(1,"#B86A7A");
  x.fillStyle=g; x.fillRect(0,0,W,H);
  for(let k=0;k<260;k++){ x.fillStyle=`rgba(255,255,255,${Math.random()*.35})`; x.beginPath(); x.arc(Math.random()*W, Math.random()*H, Math.random()*1.6, 0, 7); x.fill(); }
  x.strokeStyle="rgba(255,255,255,.45)"; x.lineWidth=1.5; x.strokeRect(10.5,10.5,W-21,H-21);
  x.fillStyle="rgba(255,255,255,.95)"; x.textAlign="center"; x.textBaseline="middle";
  x.font=`700 ${Math.round(W*.28)}px ${getComputedStyle(document.body).fontFamily}`; x.fillText(String(i+1), W/2, H*.44);
  x.font=`600 15px ${getComputedStyle(document.body).fontFamily}`; x.fillText("сотрите, чтобы открыть", W/2, H*.44+W*.2);
  x.globalCompositeOperation="destination-out"; x.strokeStyle="#000"; x.fillStyle="#000";
  let down=false, last=null, moves=0, done=false;
  const pt=e=>{ const b=cv.getBoundingClientRect(); return [e.clientX-b.left, e.clientY-b.top]; };
  const dot=(a,b)=>{ x.lineWidth=40; x.lineCap="round"; x.beginPath(); x.moveTo(a[0],a[1]); x.lineTo(b[0],b[1]); x.stroke(); };
  const check=()=>{ const d=x.getImageData(0,0,cv.width,cv.height).data; let clear=0, n=0; for(let k=3;k<d.length;k+=4*24){ n++; if(d[k]<40) clear++; } if(!done && clear/n>.5){ done=true; onDone(); } };
  cv.addEventListener("pointerdown",e=>{ down=true; last=pt(e); dot(last,last); try{ cv.setPointerCapture(e.pointerId); }catch(_){} e.preventDefault(); });
  cv.addEventListener("pointermove",e=>{ if(!down) return; const p=pt(e); dot(last,p); last=p; if(++moves%8===0) check(); e.preventDefault(); });
  const up=()=>{ if(down){ down=false; check(); } };
  cv.addEventListener("pointerup",up); cv.addEventListener("pointercancel",up);
}
function bindIdeas(){
  $$("[data-sc]").forEach(b=>b.onclick=()=>scModal(+b.dataset.sc));
  const all=$("#scAll"); if(all) all.onclick=()=>{ const s=SC(); ID.forEach((_,i)=>{ if(canOpen(i) && !s.open.includes(i)) s.open.push(i); }); save(); toast("Все свидания открыты"); render(); };
}

/* ---------- Хотим вместе ---------- */
const WL = () => { const l=L(); if(!Array.isArray(l.wish)) l.wish=[]; return l.wish; };
const FREE_WISH=5;
function wishAdd(t){
  t=String(t||"").trim().slice(0,120); if(!t) return false; const w=WL();
  if(w.some(x=>x.t.toLowerCase()===t.toLowerCase())){ toast("Уже есть в списке"); return false; }
  if(!plus() && w.length>=FREE_WISH){ toast(`Без Опора+ — до ${FREE_WISH} пунктов`); return false; }
  w.push({id:uid(), t, done:false}); save(); return true;
}
function vWish(){
  const w=WL(), left=w.filter(x=>!x.done), done=w.filter(x=>x.done);
  const row=x=>`<div class="entry wish"><label class="wl"><input type="checkbox" data-wd="${x.id}" ${x.done?"checked":""}><span class="small" style="${x.done?"text-decoration:line-through;color:var(--muted)":""}">${esc(x.t)}</span></label><button class="linkbtn small" data-wx="${x.id}" aria-label="Удалить">✕</button></div>`;
  return `<div class="stack-s"><h1>Свидания</h1></div>${dSeg("wl")}<p class="muted small">Места, поездки, дела — всё, что хочется сделать вдвоём</p>
  <div class="card"><div class="row" style="flex-wrap:nowrap"><input type="text" id="wIn" placeholder="Например: увидеть море" aria-label="Новое желание" maxlength="120" style="flex:1;min-width:0"><button class="btn" id="wAdd" aria-label="Добавить">+</button></div>
    ${left.length?left.map(row).join(""):`<p class="small muted">Пока пусто. Загляните в «Свидания-сюрпризы» — открытое свидание можно добавить сюда.</p>`}
    ${done.length?`<details class="more"><summary>Сделали · ${done.length}</summary><div>${done.map(row).join("")}</div></details>`:""}
    ${!plus()?`<p class="small muted">${w.length} из ${FREE_WISH} · без ограничений в <button class="linkbtn small" data-go="plus" style="display:inline-flex;min-height:0">Опора+</button></p>`:""}</div>
  ${w.length?`<div class="row"><button class="btn quiet" id="wSend">Отправить список партнёру</button></div>`:""}
`;
}
function bindWish(){
  const add=()=>{ const i=$("#wIn"); if(wishAdd(i.value)) render(); };
  $("#wAdd").onclick=add; $("#wIn").onkeydown=e=>{ if(e.key==="Enter") add(); };
  $$("[data-wd]").forEach(b=>b.onchange=()=>{ const x=WL().find(y=>y.id===b.dataset.wd); if(x){ x.done=b.checked; if(b.checked){ award("self",10); toast("Здорово! Ещё одно «вместе»"); } save(); render(); } });
  $$("[data-wx]").forEach(b=>b.onclick=()=>{ L().wish=WL().filter(y=>y.id!==b.dataset.wx); save(); render(); });
  const s=$("#wSend"); if(s) s.onclick=()=>{ const n=keepName(); send(`${n} делится списком «Хотим вместе» из «Опоры»:`, {t:"w", n, l:WL().filter(x=>!x.done).map(x=>x.t).slice(0,30)}); };
}

/* ---------- Входящая ссылка от партнёра ---------- */
let XA=null;
function vIn(){
  const o=IN;
  if(!o) return `${back()}<div class="card"><h3>Ссылка устарела</h3><p class="small muted">Попросите партнёра отправить её ещё раз.</p></div>`;
  const n=esc(str(o.n,30)||"Партнёр");
  if(o.t==="q"){
    const q=int(o.q,DQ.length), d=Number.isInteger(o.d)?o.d:dayNum(); if(q<0) return vInBad();
    const my=QD()[d]; const mine = my && my.me && my.q===q ? my.me : (typeof o.r==="string" ? o.r : "");
    if(mine){ return `${back()}<div class="stack-s"><span class="label">Вопрос дня</span><h1 class="dq-h">${DQ[q]}</h1></div>
      <div class="card"><span class="label">Вы</span><p>${esc(mine)}</p><span class="label">${n}</span><p>${esc(str(o.a))}</p></div>
      <button class="btn block" data-go="loved">К вопросу дня</button>`; }
    return `${back()}<div class="stack-s"><span class="label">${n} ответил(а) на вопрос дня</span><h1 class="dq-h">${DQ[q]}</h1><p class="muted small">Ответьте сами — и увидите ответ.</p></div>
      <div class="card"><textarea id="xIn" placeholder="Ваш ответ" aria-label="Ваш ответ" maxlength="400"></textarea>${nameField()}<button class="btn" id="xQ">Ответить и посмотреть</button></div>`;
  }
  if(o.t==="m"){ const s=int(o.s,MS.length); if(s<0) return vInBad();
    return `${back()}<div class="card mood-in"><span class="label">${n} сейчас</span><p class="q-text">«${MS[s]}»</p></div>
      <div class="card"><span class="label">Ответить</span>${nameField()}<div class="mood-list">${MS.map((t,i)=>i>=MS_SEND?`<button class="opt" data-mr="${i}">${t}</button>`:"").join("")}</div></div>`; }
  if(o.t==="k"){ const ids=Array.isArray(o.i)?o.i.map(x=>int(x,KQ.length)):[], a=Array.isArray(o.a)?o.a.map(x=>int(x,4)):[];
    if(ids.length!==5 || a.length!==5 || ids.includes(-1) || a.includes(-1)) return vInBad();
    if(!XA) XA={i:0, g:[]};
    if(XA.i<5){ const [t,opts]=KQ[ids[XA.i]]; return `${back()}<div class="stack-s"><span class="label">Угадайте, что ответил(а) ${n} · ${XA.i+1} из 5</span><div class="progress"><i style="width:${XA.i*20}%"></i></div></div>
      <div class="card"><h3>${t}</h3><p class="small muted">Как ответил(а) ${n}?</p><div class="opts">${opts.map((x,i)=>`<button class="opt" data-kg="${i}">${x}</button>`).join("")}</div></div>`; }
    const sc=XA.g.filter((g,i)=>g===a[i]).length;
    return `${back()}<div class="stack-s"><span class="label">Квиз от: ${n}</span><h1>${sc} из 5</h1><p class="muted small">${sc>=4?"Вы отлично друг друга знаете!":sc>=2?"Неплохо! Есть что узнать друг о друге.":"Отличный повод поговорить и узнать друг друга заново."}</p></div>
      <div class="card">${ids.map((id,i)=>`<div class="m-row"><strong>${KQ[id][0]}</strong><span class="small">${n}: ${KQ[id][1][a[i]]}</span><span class="small ${XA.g[i]===a[i]?"k-ok":"m-ask"}">Вы: ${KQ[id][1][XA.g[i]]} ${XA.g[i]===a[i]?"✓":""}</span></div>`).join("")}</div>
      ${nameField()}<div class="row"><button class="btn" id="kRes">Отправить результат</button><button class="btn quiet" data-go="lovekn">Загадать свои</button></div>`;
  }
  if(o.t==="kr"){ const s=int(o.s,6); if(s<0) return vInBad();
    return `${back()}<div class="stack-s"><span class="label">Квиз «Насколько ты меня знаешь»</span><h1>${n} угадал(а) ${s} из 5</h1></div><div class="card"><p class="small">${s>=4?"Вас хорошо знают!":"Самое время узнать друг друга получше — например, через «Вопросы для двоих»."}</p></div><button class="btn block" data-go="lovekn">Сыграть ещё</button>`; }
  if(o.t==="w"){ const items=Array.isArray(o.l)?o.l.filter(x=>typeof x==="string").map(x=>x.slice(0,120)).slice(0,30):[];
    return `${back()}<div class="stack-s"><span class="label">Список от: ${n}</span><h1>Хотим вместе</h1></div>
      <div class="card">${items.length?items.map(t=>`<p class="small">• ${esc(t)}</p>`).join(""):`<p class="small muted">Список пуст</p>`}</div>
      ${items.length?`<button class="btn block" id="wMerge">Добавить к себе</button>`:""}`; }
  return vInBad();
}
const vInBad = () => `${back()}<div class="card"><h3>Не получилось открыть ссылку</h3><p class="small muted">Возможно, она обрезалась при пересылке. Попросите отправить ещё раз.</p></div>`;
function bindIn(){
  const o=IN; if(!o) return;
  const xq=$("#xQ"); if(xq) xq.onclick=()=>{ const v=$("#xIn").value.trim(); if(!v){ toast("Напишите пару слов"); return; }
    const q=o.q, d=Number.isInteger(o.d)?o.d:dayNum(), n=keepName(), qd=QD();
    qd[d]={q, me:v, them:str(o.a), tn:str(o.n,30)}; save(); markDay(); award("self",5); render();
    setTimeout(()=>{ const c=$("#app .card"); if(c){ c.insertAdjacentHTML("afterend", `<button class="btn block" id="xBack">Отправить мой ответ</button>`); $("#xBack").onclick=()=>send(`${n} тоже ответил(а) на вопрос дня:`, {t:"q", d, q, n, a:v, r:str(o.a)}); } }, 0);
  };
  if(o.t==="q" && Number.isInteger(o.d) && o.r!==undefined){ const qd=QD(); const r=qd[o.d]; if(r && r.q===o.q && !r.them){ r.them=str(o.a); r.tn=str(o.n,30); save(); } }
  $$("[data-mr]").forEach(b=>b.onclick=()=>{ const n=keepName(); const i=+b.dataset.mr; send(`${n}: «${MS[i]}»`, {t:"m", n, s:i}); });
  $$("[data-kg]").forEach(b=>b.onclick=()=>{ XA.g[XA.i]=+b.dataset.kg; XA.i++; if(XA.i>=5){ markDay(); award("aware",5); } render(); });
  const kr=$("#kRes"); if(kr) kr.onclick=()=>{ const n=keepName(), sc=XA.g.filter((g,i)=>g===o.a[i]).length; send(`${n} угадал(а) ${sc} из 5 в квизе «Насколько ты меня знаешь»`, {t:"kr", n, s:sc}); };
  const wm=$("#wMerge"); if(wm) wm.onclick=()=>{ let k=0; (o.l||[]).forEach(t=>{ if(typeof t==="string" && wishAdd(t)) k++; }); toast(k?`Добавлено: ${k}`:"Ничего нового"); go("lovewl"); };
}

/* ---------- Регистрация ---------- */
Object.assign(VIEWS,{loved:[vDay,bindDay], lovemd:[vMood,bindMood], lovedt:[vDates,bindDates], lovekn:[vKnow,bindKnow], lovelw:[vLw,bindLw], loveid:[vIdeas,bindIdeas], lovewl:[vWish,bindWish], lovex:[vIn,bindIn]});
["loved","lovemd","lovedt","lovekn","lovelw","loveid","lovewl","lovex"].forEach(r=>{ TAB_OF[r]="practices"; window.LOVE.ROOM_ROUTES.push(r); });
window.LOVE.together={dqCard, datesCard};
})();
window.addEventListener("popstate",()=>{ const m=document.querySelector(".sc-modal"); if(m){ m.remove(); document.body.style.overflow=""; } });
