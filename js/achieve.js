/* Достижения: 56 штук в 8 разделах, у каждого видно, сколько осталось.
   Подключается после всех разделов (Я, Цели, Мы) и дополняет список BADGES из app.js. */
(function(){
"use strict";
const isObj = x => !!x && typeof x==="object" && !Array.isArray(x);
const len = a => Array.isArray(a)?a.length:0;
const GL = () => isObj(S.goals)?S.goals:{};
const GLIST = () => Array.isArray(GL().list)?GL().list:[];
const gardenT = () => window.LOVE&&LOVE.garden&&LOVE.garden.total ? LOVE.garden.total() : 0;
const gardenLv = () => window.LOVE&&LOVE.garden&&LOVE.garden.levelInfo ? LOVE.garden.levelInfo().lv : 1;
const gardenC = k => window.LOVE&&LOVE.garden ? (LOVE.garden.counts()[k]||0) : 0;
const trailP = () => window.GOALS&&GOALS.points ? GOALS.points() : 0;

Object.assign(I,{
  flame:'<path d="M12 21c-4 0-7-2.7-7-6.5 0-3.4 2.6-5.2 3.6-8.5 1.7 1.4 2.4 3 2.4 4.8 1-.6 1.8-1.8 2-3.3 2.6 2 4 4.5 4 7C17 18.3 15.6 21 12 21z"/>',
  leaf:'<path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14z"/><path d="M5 19l8-8"/>',
  peak:'<path d="M3 20l6-10 4 6 2-3 6 7z"/><path d="M9 10l1.5 2.5"/>',
  trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M9.5 17h5"/>'
});

const progsDone = () => PROGRAMS.filter(p=>progState(p).count===p.days.length).length;
const emoN = () => S.moods.reduce((a,m)=>a+(m.emotions||[]).length,0);
const cardsDay = () => S.cardLog.filter(c=>c.type==="day").length;
const testKinds = () => new Set(S.tests.map(t=>t.id)).size;
const nTests = () => typeof TESTS!=="undefined" ? Object.keys(TESTS).length : 5;
const xpT = () => typeof xpTotal==="function" ? xpTotal() : 0;
const stage = () => typeof stageOf==="function" ? stageOf(levelOf(xpT())) : 1;
const skills = () => { const v=Object.values(S.xp||{}).map(x=>skillLv(+x||0)); return v.length?v:[1]; };
const habBest = () => Math.max(0,...(Array.isArray(GL().hab)?GL().hab:[]).map(h=>Object.keys(isObj(h.days)?h.days:{}).filter(k=>+h.days[k]>=(h.n||1)).length));
const focusN = () => Object.values(isObj(GL().focus)?GL().focus:{}).reduce((a,n)=>a+(+n||0),0);
const books = () => { const r=GL().rd; return isObj(r)&&Array.isArray(r.books) ? r.books.filter(b=>b&&b.done).length : 0; };

const CATS=[["start","Первые шаги","star"],["habit","Постоянство","flame"],["diary","Дневник и чувства","diary"],["calm","Спокойствие и мысли","wind"],["know","Знания и тесты","book"],["grow","Мой рост","leaf"],["goals","Цели","peak"],["love","Отношения","heart"]];
// раздел и счётчик для достижений, которые уже были в приложении
const OLD={mood1:["start",()=>S.moods.length,1], test1:["start",()=>S.tests.length,1], thought1:["start",()=>S.thoughts.length,1],
  relief3:["calm",()=>S.relief.length,3], streak3:["habit",bestStreak,3], streak7:["habit",bestStreak,7], jar10:["diary",()=>S.grat.length,10],
  reader:["know",()=>S.read.length,3], program:["know",progsDone,1], emo10:["diary",emoN,10], cards7:["diary",cardsDay,7]};
BADGES.forEach(b=>{ const o=OLD[b.id]; if(o){ b.c=o[0]; b.p=o[1]; b.n=o[2]; } else if(!b.c) b.c="start"; });

const NEW=[
  ["streak14","habit","Две недели","14 дней подряд с Опорой",bestStreak,14],
  ["streak30","habit","Месяц заботы","30 дней подряд с Опорой",bestStreak,30],
  ["days30","habit","30 дней","30 дней, когда вы занимались собой",()=>len(S.days),30],
  ["days100","habit","Сто дней","100 дней, когда вы занимались собой",()=>len(S.days),100],
  ["days365","habit","Год рядом","365 дней, когда вы занимались собой",()=>len(S.days),365],
  ["mood30","diary","Месяц наблюдений","30 записей в дневнике настроения",()=>S.moods.length,30],
  ["mood100","diary","Летописец","100 записей в дневнике настроения",()=>S.moods.length,100],
  ["emo50","diary","Тонкая настройка","50 раз назвали эмоцию точно",emoN,50],
  ["jar30","diary","Полная банка","30 благодарностей",()=>S.grat.length,30],
  ["jar100","diary","Сто спасибо","100 благодарностей",()=>S.grat.length,100],
  ["sleep7","diary","Режим сна","7 записей в дневнике сна",()=>len(S.sleep),7],
  ["sleep30","diary","Знаю свой сон","30 записей в дневнике сна",()=>len(S.sleep),30],
  ["cards30","diary","Диалог с собой","30 карт дня",cardsDay,30],
  ["spread1","diary","Первый расклад","Сделан расклад из нескольких карт",()=>S.cardLog.filter(c=>c.type==="spread").length,1],
  ["relief10","calm","Умею успокаиваться","10 упражнений с оценкой до и после",()=>S.relief.length,10],
  ["relief30","calm","Внутренняя тишина","30 упражнений с оценкой до и после",()=>S.relief.length,30],
  ["relief100","calm","Мастер спокойствия","100 упражнений с оценкой до и после",()=>S.relief.length,100],
  ["thought5","calm","Свой адвокат","5 записей в дневнике мыслей",()=>S.thoughts.length,5],
  ["thought20","calm","Ясная голова","20 записей в дневнике мыслей",()=>S.thoughts.length,20],
  ["tests3","know","Исследователь","3 разных теста",testKinds,3],
  ["testsAll","know","Полная картина","Пройдены все тесты",testKinds,nTests()],
  ["reader10","know","Книжный червь","Прочитано 10 статей",()=>S.read.length,10],
  ["readerAll","know","Всё прочитано","Прочитаны все статьи",()=>S.read.length,ART.length],
  ["prog3","know","Три программы","Пройдены 3 программы до конца",progsDone,3],
  ["stage4","grow","Молодое дерево","Дерево доросло до 4 стадии",stage,4],
  ["stage8","grow","Своя роща","Дерево доросло до 8 стадии",stage,8],
  ["stage11","grow","Древо жизни","Дерево доросло до 11 стадии",stage,11],
  ["xp1000","grow","Тысяча очков","1000 очков роста",xpT,1000],
  ["skill5","grow","Опытный","Любой навык на 5 уровне",()=>Math.max(1,...skills()),5],
  ["harmony","grow","Гармония","Все 4 навыка на 3 уровне",()=>Math.min(...skills()),3],
  ["goal1","goals","Цель достигнута","Первая достигнутая цель",()=>GLIST().filter(x=>x.done).length,1],
  ["goal5","goals","Пять вершин","5 достигнутых целей",()=>GLIST().filter(x=>x.done).length,5],
  ["hab21","goals","21 день","Одна привычка выполнена 21 день",habBest,21],
  ["focus10","goals","В потоке","10 фокус-сессий",focusN,10],
  ["focus50","goals","Глубокий фокус","50 фокус-сессий",focusN,50],
  ["wins20","goals","Банка побед","20 побед в банке",()=>len(GL().wins),20],
  ["book1","goals","Книга прочитана","Первая дочитанная книга",books,1],
  ["pass","goals","Перевал","Тропа к вершине: уровень 6",trailP,70],
  ["summit","goals","На вершине","Тропа к вершине: все 11 уровней",trailP,260],
  ["garden1","love","Первый росток","В «Нашем саду» что-то выросло",gardenT,1],
  ["date5","love","Пять свиданий","5 проведённых свиданий",()=>gardenC("flower"),5],
  ["peace1","love","Мир после ссоры","Первая разобранная ссора",()=>gardenC("stone"),1],
  ["garden50","love","Цветущий сад","50 ростков в «Нашем саду»",gardenT,50],
  ["gardenL6","love","Сад у пруда","«Наш сад» на 6 уровне",gardenLv,6],
  ["gardenL11","love","Райский сад","«Наш сад» на 11 уровне",gardenLv,11]
];
NEW.forEach(([id,c,t,d,p,n])=>{ if(!BADGES.some(b=>b.id===id)) BADGES.push({id,c,t,d,p,n,ok:()=>p()>=n}); });

const cur = b => { try{ return b.p?Math.min(b.n,Math.max(0,b.p()||0)):(b.ok()?1:0); }catch(e){ return 0; } };
const has = b => S.badges.includes(b.id);
const pct = b => has(b)?100:Math.round(cur(b)/(b.n||1)*100);
const near = k => BADGES.filter(b=>!has(b)).sort((a,b)=>pct(b)-pct(a)).slice(0,k);
const catIco = c => (CATS.find(x=>x[0]===c)||CATS[0])[2];

// одна общая проверка: если открылось сразу несколько — одно сообщение
window.checkBadges = checkBadges = function(){
  const fresh=BADGES.filter(b=>{ try{ return !has(b) && b.ok(); }catch(e){ return false; } });
  if(!fresh.length) return;
  fresh.forEach(b=>S.badges.push(b.id)); save();
  setTimeout(()=>toast(fresh.length>1?`Новые достижения: ${fresh.length}`:`Новое достижение: «${fresh[0].t}»`), 900);
};

badgesRow = function(){
  checkBadges();
  const got=BADGES.filter(has), nx=near(1)[0];
  return `<button class="card badges-card" data-go="badges" data-from="growth">
    <span class="row" style="justify-content:space-between;width:100%"><strong class="ct">Достижения</strong><span class="tag">${got.length} из ${BADGES.length}</span></span>
    <span class="progress" style="display:block;width:100%"><i style="width:${Math.round(got.length/BADGES.length*100)}%"></i></span>
    ${got.length?`<span class="badge-strip">${got.slice(-8).map(b=>`<span class="bdg on" title="${esc(b.t)}">${ico(catIco(b.c),16)}</span>`).join("")}</span>`:""}
    ${nx?`<span class="small muted">Ближе всего: «${esc(nx.t)}» — ${cur(nx)} из ${nx.n}</span>`:""}
  </button>`;
};
window.badgesRow=badgesRow;

function tile(b){
  const on=has(b);
  return `<div class="tile badge ${on?"on":""}"><span class="ico">${ico(on?catIco(b.c):"lock",18)}</span><strong>${esc(b.t)}</strong><span class="small muted">${esc(b.d)}</span>${on||!b.n||b.n<2?"":`<span class="bd-p"><span class="progress"><i style="width:${pct(b)}%"></i></span><span class="small muted">${cur(b)} из ${b.n}</span></span>`}</div>`;
}
function vBadges(){
  checkBadges();
  const got=BADGES.filter(has).length, nx=near(3);
  return `${backBtn("growth","Мой рост")}
  <div class="stack-s"><h1>Достижения</h1><p class="muted small">${got} из ${BADGES.length}. Они открываются сами, когда вы пользуетесь Опорой, и никогда не сгорают.</p></div>
  <div class="progress"><i style="width:${Math.round(got/BADGES.length*100)}%"></i></div>
  ${nx.length?`<div class="stack-s"><span class="label">Ближе всего</span><div class="grid2">${nx.map(tile).join("")}</div></div>`:""}
  ${CATS.map(([c,t])=>{ const list=BADGES.filter(b=>b.c===c); if(!list.length) return ""; const g=list.filter(has).length;
    return `<div class="stack-s"><span class="label">${t} · ${g} из ${list.length}</span><div class="grid2">${list.map(tile).join("")}</div></div>`; }).join("")}`;
}
VIEWS.badges=[vBadges,null];
checkBadges();
})();
