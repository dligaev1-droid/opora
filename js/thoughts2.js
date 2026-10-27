/* Дневник автоматических мыслей — метод когнитивно-поведенческой терапии (А. Бек; в «Терапии настроения»
   его популяризировал Д. Бёрнс). Ситуация → эмоции в % → автоматические мысли и вера в них → когнитивные
   искажения → рациональный ответ → эмоции после. Формулировки и бланк — свои, фирменные бланки авторов не копируются. */
(function(){
"use strict";
const isObj = v => !!v && typeof v==="object" && !Array.isArray(v);
const clamp = v => Math.max(0,Math.min(100,Math.round(+v)||0));

const EMO=["Грусть","Тревога","Страх","Вина","Стыд","Злость","Раздражение","Обида","Одиночество","Безнадёжность","Разочарование","Неуверенность","Зависть","Растерянность"];
// [название, коротко, пример]
const DIST=[
 ["Чёрно-белое мышление","Всё или ничего: если не идеально, значит провал.","«Я ошибся в отчёте — я полный неудачник»"],
 ["Сверхобобщение","Один случай превращается в правило: «всегда», «никогда», «все».","«Меня никогда не замечают»"],
 ["Негативный фильтр","Замечаю только плохое, хорошее как будто исчезает.","Из десяти отзывов помню только один критический"],
 ["Обесценивание хорошего","Хорошее «не считается»: повезло, из вежливости, это ерунда.","«Похвалили, потому что так положено»"],
 ["Чтение мыслей","Уверенность, что знаю, что думают другие, без проверки.","«Он молчит — значит, злится на меня»"],
 ["Предсказание будущего","Уверенность, что всё закончится плохо.","«Я точно провалю собеседование»"],
 ["Катастрофизация","Преувеличиваю плохое и преуменьшаю свои силы.","«Если опоздаю, это конец карьеры»"],
 ["Эмоциональное обоснование","«Чувствую — значит, так и есть».","«Мне страшно, значит, это опасно»"],
 ["Долженствование","Жёсткие «должен», «обязан», «нельзя» к себе или другим.","«Я должен со всем справляться сам»"],
 ["Ярлыки","Вместо «я ошибся» — «я идиот».","«Я неудачница»"],
 ["Персонализация и вина","Беру на себя всю вину или целиком обвиняю другого.","«Ребёнок получил двойку — я плохая мать»"]
];
const ASKS=["Какие факты за и против этой мысли?","Что бы я сказал(а) другу в такой же ситуации?","Есть ли другое объяснение?","Что самое худшее, самое лучшее и самое вероятное?","Через год это будет так же важно?"];
const fresh = () => ({step:0, sit:"", em:[], th:[], cur:""});
let DM=null, OPEN=-1;

const LIST = () => { if(!Array.isArray(S.thoughts)) S.thoughts=[]; S.thoughts=S.thoughts.filter(isObj); return S.thoughts; };
const STEPS=["Ситуация","Эмоции","Мысли","Искажения","Ответ","После"];

function head(){
  return `<button class="back" id="dmBack">← ${DM.step?"Назад":"К дневнику"}</button>
  <div class="stack-s"><span class="label">Шаг ${DM.step+1} из ${STEPS.length} · ${STEPS[DM.step]}</span><div class="progress"><i style="width:${(DM.step+1)/STEPS.length*100}%"></i></div></div>`;
}
const slider = (id, v, label) => `<label class="field dm-sl"><span class="row" style="justify-content:space-between;flex-wrap:nowrap"><span>${label}</span><b id="${id}v">${v}%</b></span><input type="range" min="0" max="100" step="5" value="${v}" data-sl="${id}" aria-label="${esc(label)}"></label>`;

function vStep(){
  const s=DM.step;
  if(s===0) return `${head()}<div class="card"><h2>Что произошло?</h2><p class="small muted">Одно-два предложения: где, когда, с кем. Только факты, без оценок.</p>
    <textarea id="dmSit" rows="3" maxlength="300" placeholder="Например: на совещании начальник не ответил на моё предложение">${esc(DM.sit)}</textarea>
    <button class="btn" id="dmNext">Дальше</button></div>`;
  if(s===1) return `${head()}<div class="card"><h2>Что вы почувствовали?</h2><p class="small muted">Выберите одну или несколько эмоций и оцените силу каждой от 0 до 100%.</p>
    <div class="chips">${EMO.map(e=>`<button class="chip" data-em="${e}" aria-pressed="${DM.em.some(x=>x.n===e)}">${e}</button>`).join("")}</div>
    ${DM.em.map((x,i)=>slider("eb"+i, x.b, x.n)).join("")}
    <button class="btn" id="dmNext"${DM.em.length?"":" disabled"}>Дальше</button></div>`;
  if(s===2) return `${head()}<div class="card"><h2>Какие мысли пришли в голову?</h2><p class="small muted">Запишите их так, как они звучат внутри, — даже если кажутся глупыми. И отметьте, насколько вы в них верите.</p>
    ${DM.th.map((t,i)=>`<div class="dm-th"><div class="row" style="justify-content:space-between;flex-wrap:nowrap"><strong style="min-width:0;overflow-wrap:anywhere">${i+1}. ${esc(t.t)}</strong><button class="linkbtn small" data-thx="${i}" aria-label="Убрать мысль">✕</button></div>${slider("tb"+i, t.b, "Насколько верю")}</div>`).join("")}
    ${DM.th.length<5?`<div class="row" style="flex-wrap:nowrap"><input type="text" id="dmTh" maxlength="200" placeholder="«Он считает моё предложение глупым»" aria-label="Автоматическая мысль" value="${esc(DM.cur)}" style="flex:1;min-width:0"><button class="btn" id="dmAdd" aria-label="Добавить мысль">+</button></div>`:""}
    <button class="btn" id="dmNext"${DM.th.length?"":" disabled"}>Дальше</button></div>`;
  if(s===3) return `${head()}<div class="stack-s"><h2>Найдите искажения</h2><p class="small muted">Когнитивные искажения — привычные ошибки мышления. У одной мысли их часто несколько.</p></div>
    ${DM.th.map((t,i)=>`<div class="card"><span class="label">Мысль ${i+1}</span><p><strong>${esc(t.t)}</strong></p><div class="chips">${DIST.map(([n],k)=>`<button class="chip" data-ds="${i}|${k}" aria-pressed="${t.d.includes(k)}">${n}</button>`).join("")}</div></div>`).join("")}
    <details class="more"><summary>Что значит каждое искажение</summary><div>${DIST.map(([n,d,e])=>`<div class="entry"><div class="body"><strong>${n}</strong><span class="small">${d}</span><span class="small muted">${e}</span></div></div>`).join("")}</div></details>
    <button class="btn block" id="dmNext">Дальше</button>`;
  if(s===4) return `${head()}<div class="stack-s"><h2>Ответ мыслям</h2><p class="small muted">Напишите более реалистичную мысль — такую, в которую вы действительно можете поверить. Помогают вопросы:</p>
    <ul class="dm-asks">${ASKS.map(q=>`<li>${q}</li>`).join("")}</ul></div>
    ${DM.th.map((t,i)=>`<div class="card"><span class="label">Мысль ${i+1} · верю на ${t.b}%</span><p><strong>${esc(t.t)}</strong></p>
      ${t.d.length?`<p class="small muted">Искажения: ${t.d.map(k=>DIST[k][0].toLowerCase()).join(", ")}</p>`:""}
      <textarea data-rr="${i}" rows="3" maxlength="400" placeholder="Например: он мог не ответить, потому что спешил. Моё предложение обсуждали раньше и приняли">${esc(t.r)}</textarea>
      ${slider("rb"+i, t.rb, "Насколько верю новой мысли")}
      ${slider("ta"+i, t.a==null?t.b:t.a, "Насколько теперь верю старой мысли")}</div>`).join("")}
    <button class="btn block" id="dmNext">Дальше</button>`;
  return `${head()}<div class="card"><h2>Как вы себя чувствуете теперь?</h2><p class="small muted">Оцените те же эмоции заново. Даже небольшое снижение — уже результат.</p>
    ${DM.em.map((x,i)=>slider("ea"+i, x.a==null?x.b:x.a, `${x.n} · было ${x.b}%`)).join("")}
    <button class="btn" id="dmSave">Сохранить запись</button></div>`;
}
function syncSliders(){
  $$("[data-sl]").forEach(r=>{ const id=r.dataset.sl, v=+r.value, k=id.slice(0,2), i=+id.slice(2);
    if(k==="eb") DM.em[i].b=v; else if(k==="ea") DM.em[i].a=v; else if(k==="tb") DM.th[i].b=v; else if(k==="rb") DM.th[i].rb=v; else if(k==="ta") DM.th[i].a=v; });
  const sit=$("#dmSit"); if(sit) DM.sit=sit.value; const th=$("#dmTh"); if(th) DM.cur=th.value;
  $$("[data-rr]").forEach(t=>{ DM.th[+t.dataset.rr].r=t.value; });
}
function bindStep(){
  $$("[data-sl]").forEach(r=>r.oninput=()=>{ const b=$("#"+r.dataset.sl+"v"); if(b) b.textContent=r.value+"%"; });
  const bk=$("#dmBack"); if(bk) bk.onclick=()=>{ syncSliders(); if(DM.step) DM.step--; else DM=null; render(); window.scrollTo(0,0); };
  const nx=$("#dmNext"); if(nx) nx.onclick=()=>{ syncSliders();
    if(DM.step===0 && !DM.sit.trim()){ toast("Опишите ситуацию коротко"); return; }
    if(DM.step===2 && DM.cur.trim() && DM.th.length<5){ DM.th.push({t:DM.cur.trim().slice(0,200), b:80, d:[], r:"", rb:50, a:null}); DM.cur=""; }
    DM.step++; render(); window.scrollTo(0,0); };
  $$("[data-em]").forEach(b=>b.onclick=()=>{ syncSliders(); const n=b.dataset.em, i=DM.em.findIndex(x=>x.n===n); if(i>=0) DM.em.splice(i,1); else if(DM.em.length<5) DM.em.push({n, b:70, a:null}); else { toast("Не больше пяти эмоций"); return; } render(); });
  const add=()=>{ syncSliders(); const v=DM.cur.trim(); if(!v) return; DM.th.push({t:v.slice(0,200), b:80, d:[], r:"", rb:50, a:null}); DM.cur=""; render(); setTimeout(()=>{ const i=$("#dmTh"); if(i) i.focus(); },0); };
  const a=$("#dmAdd"); if(a){ a.onclick=add; $("#dmTh").onkeydown=e=>{ if(e.key==="Enter") add(); }; }
  $$("[data-thx]").forEach(b=>b.onclick=()=>{ syncSliders(); DM.th.splice(+b.dataset.thx,1); render(); });
  $$("[data-ds]").forEach(b=>b.onclick=()=>{ const [i,k]=b.dataset.ds.split("|").map(Number), d=DM.th[i].d, j=d.indexOf(k); if(j>=0) d.splice(j,1); else d.push(k); b.setAttribute("aria-pressed", j<0); });
  const sv=$("#dmSave"); if(sv) sv.onclick=()=>{ syncSliders();
    DM.em.forEach(x=>{ if(x.a==null) x.a=x.b; }); DM.th.forEach(t=>{ if(t.a==null) t.a=t.b; });
    const top=DM.em.slice().sort((x,y)=>y.b-x.b)[0];
    const rec={id:uid(), ts:Date.now(), v:2, situation:DM.sit.trim(), em:DM.em.map(x=>({n:x.n, b:clamp(x.b), a:clamp(x.a)})), th:DM.th.map(t=>({t:t.t, b:clamp(t.b), a:clamp(t.a), d:t.d.slice(), r:t.r.trim().slice(0,400), rb:clamp(t.rb)})),
      // поля для совместимости со старым видом записей
      thought:DM.th[0].t, emotion:DM.em.map(x=>x.n).join(", "), before:top.b, after:top.a, alt:DM.th.map(t=>t.r.trim()).filter(Boolean).join(" ")};
    LIST().push(rec); save(); markDay(); award("self",20);
    const diff=top.b-top.a; DM=null; toast(diff>0?`Запись сохранена. «${top.n}» стала слабее на ${diff}%`:"Запись сохранена"); render(); window.scrollTo(0,0); };
  setTimeout(()=>{ const t=$("#dmSit")||$("#dmTh"); if(t && !t.value) t.focus(); },50);
}

function distStats(list){
  const c=DIST.map(()=>0); list.forEach(r=>(r.th||[]).forEach(t=>(t.d||[]).forEach(k=>{ if(c[k]!=null) c[k]++; })));
  return DIST.map(([n],k)=>[n,c[k]]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]);
}
function recView(r){
  if(r.v===2 && Array.isArray(r.th)) return `<div class="stack-s small" style="padding-top:10px">
    <div><span class="label">Ситуация</span><p style="overflow-wrap:anywhere">${esc(r.situation)}</p></div>
    <div><span class="label">Эмоции</span>${(r.em||[]).map(x=>`<p>${esc(x.n)}: ${x.b}% → <strong>${x.a}%</strong></p>`).join("")}</div>
    ${r.th.map((t,i)=>`<div class="dm-rec"><span class="label">Мысль ${i+1}</span><p style="overflow-wrap:anywhere">${esc(t.t)} <span class="muted">— верю ${t.b}% → ${t.a}%</span></p>
      ${(t.d||[]).length?`<p class="muted">Искажения: ${t.d.map(k=>DIST[k]?DIST[k][0].toLowerCase():"").filter(Boolean).join(", ")}</p>`:""}
      ${t.r?`<p style="overflow-wrap:anywhere"><strong>Ответ:</strong> ${esc(t.r)} <span class="muted">— верю ${t.rb}%</span></p>`:""}</div>`).join("")}</div>`;
  const OLD=[["situation","Ситуация"],["thought","Автоматическая мысль"],["emotion","Эмоция"],["pro","Факты «за»"],["con","Факты «против»"],["alt","Новая мысль"]];
  return `<div class="stack-s small" style="padding-top:10px">${OLD.map(([k,t])=>r[k]?`<div><span class="label">${t}</span><p style="overflow-wrap:anywhere">${esc(r[k])}</p></div>`:"").join("")}</div>`;
}
function vList(){
  const list=LIST().slice().reverse(), st=distStats(list);
  const avg=list.filter(r=>typeof r.before==="number"&&typeof r.after==="number"), drop=avg.length?avg.reduce((a,r)=>a+(r.before-r.after),0)/avg.length:0;
  return `${backBtn("practices","Практики")}
  <div class="stack-s"><h1>Дневник автоматических мыслей</h1><p class="muted">Когда настроение резко падает, разберите, какие мысли за этим стоят, и ответьте им. 6 шагов, 10 минут.</p></div>
  <button class="btn block" id="dmNew">Новая запись</button>
  ${avg.length>=2&&drop>0?`<p class="small">После разбора ваши эмоции слабеют в среднем на <strong>${Math.round(drop)}%</strong>.</p>`:""}
  ${st.length?`<div class="card"><span class="label">Ваши частые искажения</span>${st.slice(0,4).map(([n,c])=>`<div class="row" style="justify-content:space-between"><span class="small">${n}</span><span class="small muted">${c}</span></div>`).join("")}<p class="small muted">Если знать свои привычные ловушки, их легче замечать в моменте.</p></div>`:""}
  <details class="more"><summary>11 когнитивных искажений</summary><div>${DIST.map(([n,d,e])=>`<div class="entry"><div class="body"><strong>${n}</strong><span class="small">${d}</span><span class="small muted">${e}</span></div></div>`).join("")}</div></details>
  <div class="card"><h3>Записи</h3>
  ${list.length?list.map(r=>`<details class="entry" style="display:block"><summary style="cursor:pointer;list-style:none"><div class="row" style="justify-content:space-between;flex-wrap:nowrap"><strong style="min-width:0;overflow-wrap:anywhere">${esc(r.thought||r.situation||"Запись")}</strong><span class="small muted" style="flex:none">${fmtDate(r.ts)}</span></div><div class="small muted">${esc(r.emotion||"")} ${typeof r.before==="number"?`${r.before}% → ${r.after}%`:""}</div></summary>${recView(r)}</details>`).join(""):`<p class="small muted">Пока пусто</p>`}
  </div>
  <p class="src-note">Метод когнитивно-поведенческой терапии (А. Бек). Подход с поиском когнитивных искажений популяризировал Д. Бёрнс в книге «Терапия настроения». Формулировки в приложении — наши.</p>
  <div class="card soft"><p class="small">Если мысли о себе очень тяжёлые и держатся неделями, проверьте настроение тестом PHQ‑9 и обсудите это со специалистом.</p><div class="row"><button class="btn quiet" data-go="tests" data-sub="phq9">Тест PHQ‑9</button><button class="btn" data-go="about" data-sub="book">Записаться</button></div></div>`;
}
function vThoughts(){
  // старый мастер (app.js) запускается через sub="new" — перехватываем на новый
  if(typeof TD!=="undefined" && TD){ TD=null; DM=fresh(); }
  return DM ? vStep() : vList();
}
function bindThoughts(){
  if(DM){ bindStep(); return; }
  const n=$("#dmNew"); if(n) n.onclick=()=>{ DM=fresh(); render(); window.scrollTo(0,0); };
}
VIEWS.thoughts=[vThoughts, bindThoughts];
// название в «Практиках»
const vPr0=VIEWS.practices[0];
VIEWS.practices=[()=>vPr0().replace("<strong>Дневник мыслей</strong>","<strong>Дневник мыслей</strong>").replace(/(<strong>Дневник мыслей<\/strong><span class="small muted">)5 мин/,"$110 мин · КПТ"), VIEWS.practices[1]];
})();
