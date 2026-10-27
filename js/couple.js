/* Опора+ для пары: «Погода в паре», отчёт месяца, тест «Совпадаем ли мы», вечера для двоих, трудные разговоры.
   Подключается после relations.js и пользуется его общими функциями через window.LOVE. */
(function(){
"use strict";
const {L, plus, back, lockCard, LOCK, li} = window.LOVE;

/* ---------- Погода в паре ---------- */
const WX=[["c","Близость","Насколько вы чувствовали себя рядом"],["s","Поддержка","Насколько вы чувствовали опору друг в друге"],["t","Напряжение","Сколько было ссор, раздражения, холодка"]];
const WXC={c:"var(--accent)", s:"#D39A62", t:"var(--muted)"};
const weekKey = ts => { const d=new Date(ts); d.setHours(0,0,0,0); d.setDate(d.getDate()-((d.getDay()+6)%7)); return d.toISOString().slice(0,10); };
const wxList = () => { const l=L(); if(!Array.isArray(l.wx)) l.wx=[]; return l.wx; };
let WD=null;
function wxChart(list){
  const pts=list.slice(-12); if(pts.length<2) return `<p class="small muted">График появится после второй недели.</p>`;
  const W=300,H=150,px=i=>16+i*(W-32)/(pts.length-1), py=v=>H-18-(v-1)*(H-36)/9;
  const line=k=>`<polyline fill="none" stroke="${WXC[k]}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" ${k==="t"?'stroke-dasharray="5 5"':""} points="${pts.map((p,i)=>px(i)+","+py(p[k])).join(" ")}"/>`+pts.map((p,i)=>`<circle cx="${px(i)}" cy="${py(p[k])}" r="3" fill="${WXC[k]}"/>`).join("");
  return `<svg viewBox="0 0 ${W} ${H}" class="wx-chart" role="img" aria-label="Погода в паре по неделям">
    ${[1,5,10].map(v=>`<line x1="10" x2="${W-10}" y1="${py(v)}" y2="${py(v)}" class="grid"/>`).join("")}
    ${line("t")}${line("s")}${line("c")}
    ${pts.map((p,i)=>(i===0||i===pts.length-1)?`<text x="${px(i)}" y="${H-2}" text-anchor="${i?"end":"start"}">${new Date(p.ts).toLocaleDateString("ru-RU",{day:"numeric",month:"short"})}</text>`:"").join("")}
  </svg>
  <div class="row small">${WX.map(([k,t])=>`<span class="wx-leg"><i style="background:${WXC[k]}"></i>${t}</span>`).join("")}</div>`;
}
function vWx(){
  const list=wxList(), wk=weekKey(Date.now()), cur=list.find(x=>x.w===wk);
  if(!WD) WD=cur?{c:cur.c,s:cur.s,t:cur.t,note:cur.note||""}:{c:5,s:5,t:5,note:""};
  return `${back()}
  <div class="stack-s"><h1>Погода в паре</h1><p class="muted small">Раз в неделю, 30 секунд. Видно, как меняются отношения.</p></div>
  <div class="card">
    <span class="label">${cur?"Эта неделя · можно поправить":"Как прошла эта неделя?"}</span>
    ${WX.map(([k,t,h])=>`<label class="field wx-f"><span class="row" style="justify-content:space-between"><strong>${t}</strong><b class="wx-v" id="wv${k}">${WD[k]}</b></span><span class="small muted">${h}</span><input type="range" min="1" max="10" step="1" value="${WD[k]}" data-wx="${k}" aria-label="${t}"></label>`).join("")}
    <input type="text" id="wxNote" placeholder="Что повлияло (необязательно)" aria-label="Что повлияло" value="${esc(WD.note)}" maxlength="140">
    <button class="btn" id="wxSave">${cur?"Обновить":"Сохранить"}</button>
  </div>
  ${plus()?`<div class="card"><span class="label">Динамика</span>${wxChart(list)}</div>${report(true)}`:lockCard("График по неделям и отчёт месяца")}`;
}
function bindWx(){
  $$("[data-wx]").forEach(r=>r.oninput=()=>{ WD[r.dataset.wx]=+r.value; $("#wv"+r.dataset.wx).textContent=r.value; });
  $("#wxNote").oninput=e=>{ WD.note=e.target.value; };
  $("#wxSave").onclick=()=>{
    const list=wxList(), wk=weekKey(Date.now()), i=list.findIndex(x=>x.w===wk), rec={w:wk, ts:Date.now(), c:WD.c, s:WD.s, t:WD.t, note:WD.note.trim()};
    if(i>=0) list[i]=rec; else { list.push(rec); markDay(); award("aware",10); }
    save(); toast("Неделя отмечена"); render();
  };
}
/* ---------- Отчёт месяца ---------- */
const MONTHS=["январь","февраль","март","апрель","май","июнь","июль","август","сентябрь","октябрь","ноябрь","декабрь"];
function report(full){
  const l=L(), now=new Date(), m0=new Date(now.getFullYear(), now.getMonth(), 1).getTime(), inM=ts=>ts>=m0;
  let days=0; Object.values(l.prog||{}).forEach(p=>Object.values(p.done||{}).forEach(ts=>{ if(inM(ts)) days++; }));
  const fights=(l.fights||[]).filter(f=>inM(f.ts)).length, matches=(l.match||[]).filter(f=>inM(f.ts)).length, eves=(l.eves||[]).filter(f=>inM(f.ts)).length;
  const wx=wxList().filter(x=>inM(x.ts));
  const rows=[[days,"дней программ"],[eves,"вечеров вдвоём"],[fights,"разборов ссор"],[matches,"тестов вдвоём"],[wx.length,"отметок погоды"]].filter(r=>r[0]>0);
  if(!rows.length && !full) return "";
  let trend="";
  if(wx.length>=2){ const a=wx[0], b=wx[wx.length-1], d=b.c-a.c, t=b.t-a.t;
    trend=`<p class="small">Близость: ${a.c} → <strong>${b.c}</strong>${d>0?" ↑":d<0?" ↓":""} · напряжение: ${a.t} → <strong>${b.t}</strong>${t<0?" ↓":t>0?" ↑":""}</p>
    <p class="small muted">${d>0||t<0?"Отношения теплеют — то, что вы делаете, работает.":d<0||t>0?"Непростой месяц. Это повод не винить себя, а поговорить — или прийти на консультацию вдвоём.":"Месяц ровный. Стабильность — тоже результат."}</p>`; }
  return `<div class="card report"><span class="label">Ваш ${MONTHS[now.getMonth()]}</span>
    ${rows.length?`<div class="rep-grid">${rows.map(([n,t])=>`<div><b>${n}</b><span class="small muted">${t}</span></div>`).join("")}</div>`:`<p class="small muted">В этом месяце пока пусто. Начните с отметки погоды или вечера вдвоём.</p>`}
    ${trend}</div>`;
}

/* ---------- Тест «Совпадаем ли мы» ---------- */
const MQ=[
  ["Деньги","Крупные покупки мы должны обсуждать вдвоём.","Какую сумму каждый из вас считает крупной?"],
  ["Время","Мне важно проводить вместе почти все выходные.","Сколько времени вместе и врозь комфортно каждому?"],
  ["Личное пространство","У каждого должны быть своё время и свои друзья.","Что для вас «своё время» и как о нём договориться?"],
  ["Быт","Домашние дела нужно делить поровну.","Какие дела каждый готов взять на себя?"],
  ["Родители","Родители не должны влиять на наши решения.","Где для каждого граница участия родителей?"],
  ["Ссоры","Лучше сразу всё выяснить, чем ждать, пока остынем.","Как каждому легче мириться и сколько нужно времени?"],
  ["Чувства","Мне важно, чтобы мы часто говорили о чувствах.","Как часто и в какой форме вам хочется таких разговоров?"],
  ["Доверие","Переписки партнёра — его личное дело.","Что для каждого из вас значит доверие?"],
  ["Будущее","Я хорошо представляю, где мы будем через пять лет.","Совпадают ли ваши картинки будущего?"],
  ["Поддержка","Когда мне плохо, я хочу, чтобы меня выслушали, а не давали советы.","Какая поддержка нужна каждому, когда тяжело?"]
];
const MO=["Не согласен(на)","Скорее нет","Не уверен(а)","Скорее да","Согласен(на)"];
let MD={step:"intro", n1:"", n2:"", a:[], b:[], i:0};
function vMatch(){
  const l=L(); if(!Array.isArray(l.match)) l.match=[];
  const who=MD.step==="a"?(MD.n1||"Первый партнёр"):(MD.n2||"Второй партнёр");
  if(MD.step==="intro") return `${back()}
    <div class="stack-s"><h1>Совпадаем ли мы</h1><p class="muted small">10 утверждений. Отвечайте по очереди на одном телефоне и не подглядывайте. В конце увидите, где вы совпадаете, а о чём стоит поговорить.</p></div>
    <div class="card"><label class="field"><span>Имя первого</span><input type="text" id="mN1" value="${esc(MD.n1)}" maxlength="20"></label><label class="field"><span>Имя второго</span><input type="text" id="mN2" value="${esc(MD.n2)}" maxlength="20"></label><button class="btn" id="mGo">Начать</button></div>
    ${l.match.length?`<button class="btn quiet block" id="mLast">Последний результат</button>`:""}`;
  if(MD.step==="pass") return `${back()}<div class="card pass-card"><span class="pl-ico">${ico("hand",24)}</span><h2>Передайте телефон</h2><p class="muted">Теперь отвечает ${esc(MD.n2||"второй партнёр")}. Ответы первого скрыты.</p><button class="btn" id="mPass">Я ${esc(MD.n2||"второй")}, начинаю</button></div>`;
  if(MD.step==="a"||MD.step==="b"){ const [t,q]=MQ[MD.i]; return `${back()}
    <div class="stack-s"><span class="label">Отвечает: ${esc(who)}</span><div class="progress"><i style="width:${MD.i/MQ.length*100}%"></i></div></div>
    <div class="card"><span class="label">${MD.i+1} из ${MQ.length} · ${t}</span><h3>${q}</h3><div class="opts">${MO.map((o,i)=>`<button class="opt" data-mo="${i+1}">${o}</button>`).join("")}</div></div>`; }
  const r=MD.res||l.match[l.match.length-1]; if(!r) { MD.step="intro"; return vMatch(); }
  const same=[], diff=[]; MQ.forEach((q,i)=>{ (Math.abs(r.a[i]-r.b[i])<=1?same:diff).push(i); });
  const pct=Math.round(same.length/MQ.length*100), n1=esc(r.n1||"Первый"), n2=esc(r.n2||"Второй");
  const row=i=>`<div class="m-row"><strong>${MQ[i][0]}</strong><span class="small muted">${MQ[i][1]}</span><span class="small">${n1}: ${MO[r.a[i]-1].toLowerCase()} · ${n2}: ${MO[r.b[i]-1].toLowerCase()}</span>${diff.includes(i)?`<span class="small m-ask">Обсудите: ${MQ[i][2]}</span>`:""}</div>`;
  return `${back()}
  <div class="stack-s"><span class="label">${n1} и ${n2}</span><h1>Совпадение ${pct}%</h1><p class="muted small">Различия — это не плохо. Это темы, о которых стоит договориться, пока они не стали поводом для ссор.</p></div>
  <div class="card"><span class="label">Стоит обсудить · ${diff.length}</span>${diff.length?(plus()?diff.map(row).join(""):row(diff[0])):`<p class="small">Вы во многом смотрите одинаково. Здорово!</p>`}</div>
  ${!plus() && diff.length>1?lockCard(`Ещё ${diff.length-1} тем для разговора и все совпадения`):""}
  ${plus()?`<div class="card"><span class="label">Совпадаете · ${same.length}</span>${same.map(row).join("")}</div>`:""}
  <button class="btn quiet block" id="mNew">Пройти заново</button>`;
}
function bindMatch(){
  const g=$("#mGo"); if(g) g.onclick=()=>{ MD={step:"a", n1:$("#mN1").value.trim(), n2:$("#mN2").value.trim(), a:[], b:[], i:0}; render(); };
  const ls=$("#mLast"); if(ls) ls.onclick=()=>{ MD.step="res"; MD.res=null; render(); };
  const ps=$("#mPass"); if(ps) ps.onclick=()=>{ MD.step="b"; MD.i=0; render(); };
  $$("[data-mo]").forEach(b=>b.onclick=()=>{ MD[MD.step][MD.i]=+b.dataset.mo; MD.i++;
    if(MD.i>=MQ.length){ if(MD.step==="a"){ MD.step="pass"; } else { const r={ts:Date.now(), n1:MD.n1, n2:MD.n2, a:MD.a.slice(), b:MD.b.slice()}; L().match.push(r); MD.res=r; MD.step="res"; save(); markDay(); award("aware",20); } }
    render(); window.scrollTo(0,0); });
  const nw=$("#mNew"); if(nw) nw.onclick=()=>{ MD={step:"intro", n1:MD.n1, n2:MD.n2, a:[], b:[], i:0}; render(); };
}

/* ---------- Вечера для двоих ---------- */
const EV=[
  {id:"date", t:"Свидание дома", m:60, d:"Простой вечер, чтобы снова почувствовать друг друга", s:[
    [10,"Без телефонов","Уберите телефоны в другую комнату. Приготовьте вместе что-то простое: чай, бутерброды, фрукты."],
    [15,"Лучшее и трудное","Каждый рассказывает лучший момент недели и один трудный. Второй только слушает и не даёт советов."],
    [20,"Вопросы","Задайте друг другу по три вопроса из «Вопросов для двоих», уровень «Глубже»."],
    [10,"Три спасибо","По очереди скажите друг другу по три конкретные благодарности за эту неделю."],
    [5,"Одно дело вместе","Договоритесь о маленьком общем деле на следующую неделю и запишите его."]]},
  {id:"memory", t:"Вечер воспоминаний", m:60, d:"Вспомнить, с чего всё начиналось", s:[
    [10,"Старые фото","Найдите фотографии первых месяцев вместе. Посмотрите их рядом, не торопясь."],
    [15,"Наша история","Каждый по очереди рассказывает историю знакомства — своими глазами. Интересно, чем они отличаются."],
    [10,"Когда я понял(а)","Расскажите, в какой момент вы поняли, что этот человек вам дорог."],
    [15,"Трудное время","Вспомните период, который было тяжело пережить вместе. Что тогда помогло?"],
    [10,"Что дальше","Назовите по одному воспоминанию, которое хотите создать в этом году."]]},
  {id:"plans", t:"Вечер планов", m:60, d:"Собрать общую картинку будущего", s:[
    [10,"Мечты по отдельности","Каждый пишет на листке пять своих желаний на год — о себе, не о паре."],
    [15,"Обмен","Прочитайте списки друг другу. Спросите, почему это важно, без оценок."],
    [15,"Наш список","Составьте общий список: поездка, дом, деньги, привычки, время вместе."],
    [10,"Что убрать","Назовите по одной вещи, которую хотите в жизни сократить: суету, долги, лишние обязательства."],
    [10,"Первый шаг","Выберите по одному первому шагу на ближайший месяц и поставьте даты."]]}
];
function vEve(){
  const e=EV.find(x=>x.id===sub);
  if(!e) return `${back()}<div class="stack-s"><h1>Вечера для двоих</h1><p class="muted small">Готовые сценарии на час. Выберите вечер и просто идите по шагам.</p></div>
    <div class="list">${EV.map((x,i)=>li("lovee",x.id,ico("moon",18),x.t,`${x.m} мин · ${x.d}`,i>0&&!plus())).join("")}</div>`;
  const i=EV.indexOf(e);
  if(i>0 && !plus()) return `${back()}<div class="stack-s"><h1>${e.t}</h1><p class="muted small">${e.d}</p></div>${lockCard("Этот вечер доступен в Опора+")}`;
  return `${back()}
  <div class="stack-s"><span class="label">${e.m} минут · вдвоём</span><h1>${e.t}</h1><p class="muted small">${e.d}</p></div>
  <div class="eve">${e.s.map(([m,t,d],k)=>`<label class="eve-step"><input type="checkbox" aria-label="${t}"><span class="es-n">${k+1}</span><span class="es-b"><strong>${t}</strong> <span class="small muted">· ${m} мин</span><span class="small">${d}</span></span></label>`).join("")}</div>
  <button class="btn block" id="eDone">Мы провели этот вечер</button>`;
}
function bindEve(){
  const b=$("#eDone"); if(b) b.onclick=()=>{ const l=L(); if(!Array.isArray(l.eves)) l.eves=[]; l.eves.push({ts:Date.now(), id:sub}); save(); markDay(); award("self",20); toast("Здорово, что вы нашли время друг для друга"); go("love"); };
}

/* ---------- Трудные разговоры ---------- */
const TK=[
  {id:"home", t:"Быт и домашние дела", start:"«Мне хочется, чтобы дома нам обоим было спокойно. Давай обсудим, как мы делим дела?»", say:["«Мне тяжело, когда я одна (один) убираю после ужина. Давай попробуем по очереди?»","«Что тебе было бы удобнее взять на себя?»","«Давай попробуем так две недели и посмотрим, как пойдёт»"], no:["«Ты никогда ничего не делаешь»","Сравнения с другими парами или родителями"], tip:"Выпишите все домашние дела списком и распределите их. Через две недели вернитесь к списку и поправьте."},
  {id:"money", t:"Деньги", start:"«Я хочу, чтобы деньги не становились поводом для ссор. Давай спокойно обсудим, как нам удобно?»", say:["«Для меня деньги — это про безопасность. А для тебя?»","«Давай договоримся о сумме, которую каждый тратит без обсуждения»","«Что нам важно накопить в этом году?»"], no:["«Ты транжира»","«Это мои деньги» как упрёк","Разговор в день крупной покупки"], tip:"Обсуждайте деньги в спокойный день, а не сразу после траты. Удобно раз в месяц садиться и смотреть бюджет вместе."},
  {id:"parents", t:"Родители", start:"«Мне важно, чтобы с твоими родителями всё было хорошо — и чтобы решения о нашей жизни мы принимали вдвоём»", say:["«Когда твоя мама даёт советы о нашем доме, я чувствую себя неловко. Как нам быть?»","«Можешь поговорить с ней сам(а)? Тебя она скорее услышит»"], no:["«Твоя мать всегда…»","Требование выбрать между вами и родителями"], tip:"Правило, которое часто помогает: с родителями каждый договаривается сам — со своими."},
  {id:"jealous", t:"Ревность", start:"«Я хочу поговорить о том, что меня тревожит. Не чтобы обвинить, а чтобы мне стало спокойнее»", say:["«Когда я вижу…, я начинаю бояться, что…»","«Что могло бы помочь мне чувствовать себя увереннее?»"], no:["Допросы и «покажи телефон»","Угрозы и ультиматумы"], tip:"До разговора разделите на листке: что я знаю как факт, а что додумываю. Говорите о своих чувствах, а не о его или её вине."},
  {id:"intimacy", t:"Близость и секс", start:"«Мне важна наша близость, и хочется, чтобы нам обоим было хорошо. Можно поговорить об этом?»", say:["«Мне очень нравится, когда ты…»","«Чего бы тебе хотелось больше?»","«Давай попробуем…»"], no:["Сравнения с прошлыми партнёрами","Упрёки сразу после неудачи","«С тобой что-то не так»"], tip:"Говорите не в постели и не сразу после неудачного раза. Начинайте с того, что нравится, а потом — о желаниях."}
];
function vTalk(){
  const k=TK.find(x=>x.id===sub);
  if(!k) return `${back()}<div class="stack-s"><h1>Трудные разговоры</h1><p class="muted small">Как начать, что сказать и чего лучше не говорить</p></div>
    <div class="list">${TK.map((x,i)=>li("lovek",x.id,ico("thoughts",18),x.t,"Скрипт разговора",i>0&&!plus())).join("")}</div>`;
  if(TK.indexOf(k)>0 && !plus()) return `${back()}<div class="stack-s"><h1>${k.t}</h1></div>${lockCard("Скрипт доступен в Опора+")}`;
  return `${back()}
  <div class="stack-s"><span class="label">Трудный разговор</span><h1>${k.t}</h1></div>
  <div class="card"><span class="label">Как начать</span><p class="talk-start">${k.start}</p></div>
  <div class="card"><span class="label">Что можно сказать</span><ul class="talk-list ok">${k.say.map(s=>`<li>${s}</li>`).join("")}</ul></div>
  <div class="card"><span class="label">Чего лучше не говорить</span><ul class="talk-list no">${k.no.map(s=>`<li>${s}</li>`).join("")}</ul></div>
  <div class="card soft"><span class="label">Совет</span><p class="small">${k.tip}</p></div>
  <button class="btn quiet block" data-go="lovef">Подготовиться через «Разбор ссоры»</button>`;
}

/* ---------- Регистрация ---------- */
Object.assign(VIEWS,{lovew:[vWx,bindWx], lovem:[vMatch,bindMatch], lovee:[vEve,bindEve], lovek:[vTalk,null]});
["lovew","lovem","lovee","lovek"].forEach(r=>{ TAB_OF[r]="practices"; window.LOVE.ROOM_ROUTES.push(r); });
window.LOVE.couple = {report, weekKey, wxList, EV, TK};
})();
