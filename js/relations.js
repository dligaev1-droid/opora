/* Раздел «Отношения» (Опора+): отдельная «комната» в тёплых тонах.
   Бесплатно: первый день каждой программы, тест, первый уровень вопросов, первый разбор ссоры, первая статья.
   Остальное открывается подпиской. Оплаты пока нет: доступ включается кодом (см. js/config.js → plusCodes). */
(function(){
"use strict";

/* ---------- Доступ ---------- */
const fnv = s => { let h=0x811c9dc5; for(const c of s){ h^=c.charCodeAt(0); h=Math.imul(h,16777619)>>>0; } return h.toString(16); };
// Проверка и починка данных раздела: повреждённые записи отбрасываются, а не ломают экраны
const isObj = x => !!x && typeof x==="object" && !Array.isArray(x);
function L(){
  if(!isObj(S.love)) S.love={};
  const l=S.love;
  const arr=(k,ok)=>{ if(!Array.isArray(l[k])) l[k]=[]; l[k]=l[k].filter(x=>isObj(x) && (!ok || ok(x))); };
  arr("tests", r=>typeof r.a==="number" && typeof r.v==="number" && ["safe","anx","avd","mix"].includes(r.s));
  arr("fights", f=>isObj(f.v));
  arr("match", r=>Array.isArray(r.a) && Array.isArray(r.b));
  arr("lw", r=>Array.isArray(r.a));
  arr("eves"); arr("wx", x=>typeof x.c==="number" && typeof x.s==="number" && typeof x.t==="number");
  arr("wish", x=>typeof x.t==="string");
  if(!isObj(l.prog)) l.prog={};
  Object.keys(l.prog).forEach(k=>{ const p=l.prog[k]; if(!isObj(p)) l.prog[k]={done:{},notes:{}}; else { if(!isObj(p.done)) p.done={}; if(!isObj(p.notes)) p.notes={}; } });
  if(!isObj(l.qd)) l.qd={};
  Object.keys(l.qd).forEach(k=>{ if(!isObj(l.qd[k])) delete l.qd[k]; });
  if(!isObj(l.scr)) l.scr={open:[],done:[]};
  ["open","done"].forEach(k=>{ if(!Array.isArray(l.scr[k])) l.scr[k]=[]; l.scr[k]=l.scr[k].filter(Number.isInteger); });
  if(!isObj(l.dates)) l.dates={start:"",list:[]};
  if(typeof l.dates.start!=="string") l.dates.start="";
  if(!Array.isArray(l.dates.list)) l.dates.list=[];
  l.dates.list=l.dates.list.filter(x=>isObj(x) && typeof x.t==="string" && typeof x.d==="string");
  if(l.me!=null && typeof l.me!=="string") delete l.me;
  return l;
}
const plus = () => !!L().plus;
const LOCK='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
const lockTag = () => plus()?"":`<span class="plus-tag">${LOCK} Опора+</span>`;

/* ---------- Программы ---------- */
const LP={
  close:{t:"Ближе друг к другу", d:"7 дней · для тех, кто в паре", days:[
    {t:"Карта ваших отношений", p:["Прежде чем что-то менять, полезно честно посмотреть, где вы сейчас. Не чтобы найти виноватых, а чтобы понять, куда направить силы.","Отношения — это несколько разных сфер. В одной может быть тепло, а в другой давно холодно, и это нормально."], task:"Оцените от 1 до 10: близость, доверие, быт, как вы решаете конфликты, время вдвоём. Где больше всего хочется прибавить хотя бы один балл?", ask:"Мои оценки и что я заметил(а)"},
    {t:"Как мы показываем заботу", p:["Один заботится делами: починил, приготовил, встретил. Другой ждёт слов или прикосновений. Оба любят, но не слышат друг друга.","Обиду часто вызывает не отсутствие заботы, а то, что её показывают на другом языке."], task:"Вспомните три момента, когда вы чувствовали себя любимым(ой). Что именно тогда делал партнёр? А как заботу обычно показываете вы?", ask:"Как я чувствую заботу и как её показываю"},
    {t:"Маленькие сигналы", p:["Пары сближаются не на больших свиданиях, а в мелочах: «смотри, какая собака», «как прошёл день?», рука на плече.","Каждый такой сигнал — маленькая просьба о внимании. Если отвернуться, она гаснет. Если откликнуться, растёт доверие."], task:"Сегодня ловите сигналы партнёра и откликайтесь хотя бы на три: поднимите глаза, ответьте, улыбнитесь, задайте вопрос.", ask:"Какие сигналы я заметил(а)"},
    {t:"Я-сообщение вместо упрёка", p:["«Ты опять не позвонил» вызывает оборону. «Я волновалась, когда не могла до тебя дозвониться» вызывает желание успокоить.","Говорить о своих чувствах — не слабость, а самый короткий путь к тому, чтобы вас услышали."], task:"Возьмите одну частую претензию и переделайте её по схеме: «Когда… я чувствую… потому что мне важно… Мне бы хотелось…». Можно в «Разборе ссоры».", ask:"Моё я-сообщение"},
    {t:"Что стоит за ссорой", p:["Ссорятся из-за посуды, а на самом деле — из-за «мне не помогают», «меня не ценят», «я один(одна) за всё отвечаю».","Пока спорите о посуде, ссора повторяется. Когда звучит настоящая потребность, появляется шанс договориться."], task:"Вспомните последнюю ссору. Какая потребность стояла за вашими словами: уважение, помощь, внимание, безопасность, свобода? А за словами партнёра?", ask:"Моя потребность и, возможно, партнёра"},
    {t:"Заметить хорошее", p:["Со временем мозг привыкает к хорошему и замечает в основном то, что раздражает. Это не значит, что хорошего нет.","Благодарность вслух — одно из самых простых и сильных действий для отношений."], task:"Напишите три конкретные вещи, за которые вы благодарны партнёру на этой неделе. И скажите хотя бы одну из них вслух.", ask:"За что я благодарен(на)"},
    {t:"Ваш ритуал", p:["Ритуалы делают пару парой: кофе вместе по утрам, прогулка в воскресенье, «как ты?» перед сном.","Не нужно много времени. Нужна регулярность и то, что это только ваше."], task:"Придумайте вместе один маленький ритуал на 10–15 минут и попробуйте его на этой неделе.", ask:"Наш ритуал"}
  ]},
  part:{t:"Пережить расставание", d:"7 дней · бережно, по шагу в день", days:[
    {t:"Можно горевать", p:["Расставание — это потеря, даже если вы сами его выбрали. Грусть, злость, облегчение и вина могут приходить по очереди или все сразу.","Не нужно «быстро отпустить». Чувства проходят, когда им разрешают быть."], task:"Назовите, что вы чувствуете сегодня, без оценки «правильно» или «неправильно». Если хочется плакать — можно.", ask:"Что я чувствую сегодня"},
    {t:"Опора на тело", p:["В горе тело первым сдаёт: сон сбивается, еда не лезет или, наоборот, тянет заедать.","Сейчас не время для больших целей. Достаточно минимума: поесть, поспать, выйти на улицу."], task:"Выберите на сегодня три маленьких дела для тела: например, тёплый обед, 15 минут прогулки, лечь до полуночи.", ask:"Мои три дела"},
    {t:"Письмо, которое не отправлю", p:["Многое осталось несказанным: обида, благодарность, вопросы без ответа.","Письмо, которое вы не отправите, помогает выговориться, не вступая снова в разговор."], task:"Напишите бывшему партнёру всё, что хочется сказать. Не отправляйте. Можно потом порвать или сжечь.", ask:"Что я хочу сказать"},
    {t:"Меньше поводов возвращаться мыслями", p:["Каждый просмотр его или её страницы — как сдирать корочку с раны.","Не нужно резко выбрасывать всё. Достаточно убрать то, что держит вас в прошлом каждый день."], task:"Решите, что сделать с соцсетями (скрыть, отписаться, архивировать переписку) и с вещами (убрать в коробку). Без спешки, по силам.", ask:"Что я решил(а)"},
    {t:"Что я узнал(а) о себе", p:["В любых отношениях мы узнаём себя: что нам важно, где наши границы, что мы больше не готовы терпеть.","Это не поиск вины. Это опыт, который останется с вами."], task:"Ответьте на три вопроса: что мне было хорошо в этих отношениях? Что было больно? Что я хочу иначе в будущем?", ask:"Мои ответы"},
    {t:"Кто рядом", p:["После расставания хочется закрыться. Но изоляция усиливает боль.","Поддержка не обязана быть большой: сообщение другу, звонок маме, кофе с коллегой."], task:"Напишите сегодня одному человеку, с которым вам спокойно. Не обязательно рассказывать всё.", ask:"Кому я написал(а)"},
    {t:"Кто я теперь", p:["В паре часть жизни строилась вокруг «мы». Теперь есть место для «я».","Начните с маленького: занятие, место, привычка, которые только ваши."], task:"Выберите одно дело только для себя и сделайте его на этой неделе.", ask:"Моё дело для себя"}
  ]}
};
const progOf = id => { const l=L(); return l.prog[id] || (l.prog[id]={done:{}, notes:{}}); };
const doneCount = id => Object.keys(progOf(id).done).length;

/* ---------- Тест «Стиль привязанности» ---------- */
// Авторское упражнение психолога по мотивам двухмерной модели привязанности (тревога и избегание). Не научный тест.
const AQ=[
  ["a","Я часто переживаю, что партнёр любит меня меньше, чем я его."],
  ["v","Мне некомфортно, когда партнёр хочет слишком сильной близости."],
  ["a","Если партнёр долго не отвечает, я начинаю тревожиться."],
  ["v","Мне сложно делиться с партнёром своими переживаниями."],
  ["a","Мне нужно часто слышать, что меня любят."],
  ["v","С трудностями я предпочитаю справляться сам(а)."],
  ["a","Я боюсь, что меня бросят."],
  ["v","Когда отношения становятся серьёзнее, мне хочется отстраниться."],
  ["a","Когда партнёр отдаляется, я стараюсь сильнее его удержать."],
  ["v","Мне неловко просить партнёра о помощи."],
  ["a","Я сомневаюсь, что достоин(а) любви."],
  ["v","Своя независимость мне важнее, чем близость."]
];
const AOPT=["Совсем не про меня","Скорее нет","Иногда","Скорее да","Точно про меня"];
const ASTY={
  safe:{t:"Надёжный стиль", d:"Вам в целом комфортно и в близости, и в самостоятельности. Вы можете попросить о поддержке и дать её, а конфликты не воспринимаете как конец отношений.", tip:"Ваша сила — в открытости. Берегите её: говорите о своих потребностях прямо, даже когда страшно."},
  anx:{t:"Тревожный стиль", d:"Близость для вас очень важна, и поэтому страшно её потерять. Молчание или холодность партнёра легко воспринимаются как угроза, хочется больше подтверждений любви.", tip:"Помогает замечать тревогу раньше, чем действовать: пауза, дыхание, я-сообщение вместо проверок. Своя жизнь и опоры вне пары делают отношения спокойнее."},
  avd:{t:"Избегающий стиль", d:"Вы цените независимость и привыкли справляться сами. Когда близости становится много, хочется отстраниться, а чувства сложно облекать в слова.", tip:"Попробуйте маленькие шаги к открытости: рассказать об одном переживании, попросить о мелкой помощи. Отстраниться можно, но лучше сказать об этом, чем исчезнуть."},
  mix:{t:"Смешанный стиль", d:"Вам одновременно хочется близости и страшно её. Тянет к человеку, а когда он рядом — хочется отдалиться. Это изматывает, и это не ваша вина: так часто складывается после болезненного опыта.", tip:"С этим особенно хорошо работать вместе с психологом: в безопасной обстановке можно понять, откуда страх, и постепенно учиться доверять."}
};
const styleOf = (a,v) => a<3 && v<3 ? "safe" : a>=3 && v<3 ? "anx" : a<3 ? "avd" : "mix";
let AT={i:0, a:[]};

/* ---------- Вопросы для двоих ---------- */
const QL=[
  {t:"Знакомство заново", q:["Какой момент этой недели был для тебя самым приятным?","Что ты любил(а) делать в детстве больше всего?","Какое место тебе хотелось бы показать мне?","За что ты сегодня можешь себя похвалить?","Какая еда напоминает тебе о доме?","Какую песню ты бы поставил(а) про нас?","Если бы у нас был свободный день без дел, как бы ты его провёл(а)?","Чему ты научился(ась) в этом году?","Что тебя смешит сильнее всего?","О каком своём поступке ты вспоминаешь с гордостью?","Какую привычку ты хотел(а) бы завести?","Какой твой идеальный вечер?"]},
  {t:"Глубже", q:["Когда ты в последний раз чувствовал(а) себя по-настоящему спокойно?","Чего ты боишься, но редко говоришь об этом?","Что в нашей паре даёт тебе силы?","Какие слова поддержки тебе нужнее всего, когда тяжело?","Что ты понял(а) о себе благодаря нашим отношениям?","Какой мой поступок тронул тебя больше всего?","Что тебе сложно у меня попросить?","Какое воспоминание из детства до сих пор на тебя влияет?","В чём мы с тобой разные, и что тебе в этом нравится?","Как ты понимаешь, что я тебя люблю?","Что тебе хотелось бы, чтобы я лучше понимал(а) о тебе?","Когда ты чувствуешь себя одиноким(ой) рядом со мной?"]},
  {t:"О нас", q:["Каким ты видишь наш обычный день через пять лет?","Что мы делаем хорошо как пара?","Какую нашу традицию ты бы точно сохранил(а)?","Какая наша ссора научила нас чему-то важному?","Что нам стоит делать чаще?","О чём мы давно не говорили, а стоило бы?","Что для тебя значит «быть командой»?","Как нам лучше мириться после ссоры?","Какое наше общее приключение ты хочешь повторить?","Что я могу сделать на этой неделе, чтобы тебе было теплее?","О чём ты мечтаешь для нас?","Что ты хочешь сказать мне прямо сейчас?"]}
];
let QS={lv:0, i:0};

/* ---------- Разбор ссоры ---------- */
const FS=[
  ["what","Что случилось?","Только факты, как сняла бы камера: кто что сказал и сделал.","Например: он пришёл на час позже и не предупредил"],
  ["feel","Что я почувствовал(а)?","Назовите чувства: обида, злость, тревога, усталость, страх…","Например: тревогу, потом обиду"],
  ["need","Что мне было важно?","Какая потребность стоит за чувством: уважение, забота, предсказуемость, помощь, свобода…","Например: чтобы обо мне помнили"],
  ["other","Что, возможно, чувствовал(а) партнёр?","Попробуйте посмотреть его или её глазами. Это не оправдание, а попытка понять.","Например: устал, не хотел ссоры"],
  ["want","О чём я хочу попросить?","Конкретно и выполнимо: что сделать в следующий раз.","Например: писать, если задерживаешься"]
];
let FD={i:0, v:{}};
const iMsg = v => `Когда ${v.what||"…"}, я чувствую ${v.feel||"…"}, потому что мне важно ${v.need||"…"}. Я прошу: ${v.want||"…"}.`;

/* ---------- Статьи ---------- */
const LA=[
  {id:"fights", t:"Почему мы ссоримся из-за мелочей", m:3, p:["Немытая чашка, опоздание, телефон за ужином — поводы для ссор часто кажутся смешными со стороны. Но мелочь почти никогда не бывает про мелочь.","За раздражением обычно стоит неудовлетворённая потребность: «меня не замечают», «на мне всё держится», «мне не помогают». Пока спор идёт о чашке, настоящий вопрос остаётся без ответа, и ссора повторяется по кругу.","Помогает остановиться и спросить себя: что на самом деле меня задело? Какую потребность я пытаюсь защитить? Тогда вместо «ты вечно…» можно сказать: «Мне важно чувствовать, что мы вместе ведём дом».","И ещё: ссориться лучше не на пике усталости и голода. Иногда лучший шаг — сказать «Давай вернёмся к этому через час» и действительно вернуться."]},
  {id:"jealous", t:"Ревность: что с ней делать", m:3, p:["Ревность — это смесь страха потерять и сомнения в своей ценности. Она бывает у всех, и сама по себе не делает человека плохим партнёром.","Проблемы начинаются, когда ревность управляет поступками: проверка телефона, допросы, запреты. Они не успокаивают надолго, зато подтачивают доверие с обеих сторон.","Попробуйте разделить: что я знаю как факт, а что додумываю? Чего я на самом деле боюсь? Что мне поможет почувствовать себя в безопасности — и могу ли я попросить об этом прямо?","Если ревность мучает постоянно, даже без поводов, часто за ней стоит старая боль. С этим хорошо работать с психологом."]},
  {id:"breakup", t:"Как пережить расставание", m:4, p:["После расставания плохо не потому, что вы слабы, а потому, что мозг переживает потерю. Тоска, навязчивые мысли, желание написать — нормальные реакции, они проходят.","Помогает режим: еда, сон, движение, хотя бы минимум. Помогают люди: даже короткий разговор снижает остроту боли. Помогает меньше поводов возвращаться мыслями: скрыть страницу, убрать вещи с глаз.","Не торопите себя «отпустить». У горя есть свой темп. Важно не застревать в одиночестве и не принимать важных решений в самые тяжёлые дни.","Если становится совсем невыносимо, появляются мысли о том, что жить не хочется, — сразу обратитесь за помощью. Раздел SOS всегда под рукой."]}
];

/* ---------- Общие куски ---------- */
let loveFrom="home";
const ROOM_ROUTES=["lovetog","lovepath","lovepsy","love","lovep","lovet","loveq","lovef","lovea","plus"];
const BACKL={love:"Сегодня",lovetog:"Вместе",loveid:"Свидания",lovepath:"Путь",lovepsy:"Психолог"};
const back = () => { if(["love","lovetog","loveid","lovepath","lovepsy","lovewl"].includes(route)) return ""; const p={lovew:"love",lovemd:"love",lovedt:"love",loved:"love",lovex:"love",lovegd:"love",lovem:"lovetog",lovekn:"lovetog",lovelw:"lovetog",loveq:"lovetog",lovee:"lovetog",lovep:"lovepath",lovet:"lovepath",lovef:"lovepath",lovek:"lovepath",lovea:"lovepath",plus:"lovepsy"}[route]||"love"; return `<button class="back" data-go="${p}">← ${BACKL[p]}</button>`; };
const lockCard = (what) => `<div class="card plus-lock"><span class="pl-ico">${LOCK}</span><h3>${what}</h3><p class="small muted">Доступно в Опора+</p><button class="btn" data-go="plus">Подробнее</button></div>`;
const HERO=`<svg viewBox="0 0 160 90" class="love-art" aria-hidden="true"><defs><radialGradient id="lg1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".55"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></radialGradient><radialGradient id="lg2"><stop offset="0" stop-color="#E7B58E" stop-opacity=".7"/><stop offset="1" stop-color="#E7B58E" stop-opacity="0"/></radialGradient></defs><circle cx="62" cy="46" r="40" fill="url(#lg1)"/><circle cx="98" cy="44" r="40" fill="url(#lg2)"/><circle cx="64" cy="46" r="20" fill="none" stroke="var(--accent)" stroke-width="1.6" opacity=".8"/><circle cx="96" cy="46" r="20" fill="none" stroke="var(--accent)" stroke-width="1.6" opacity=".8"/></svg>`;
const li = (go, sb, icoSvg, title, small, locked) => `<button class="li" data-go="${go}"${sb?` data-sub="${sb}"`:""}><span class="ico">${icoSvg}</span><span class="dt"><strong>${title}</strong><span class="small muted">${small}</span></span>${locked?`<span class="plus-tag sm">${LOCK}</span>`:`<span class="chev">›</span>`}</button>`;

/* ---------- Режим «Для пары»: своё меню из 5 вкладок ---------- */
const NAVI={
  love:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  lovetog:'<circle cx="9" cy="12" r="6"/><circle cx="15" cy="12" r="6"/>',
  loveid:'<rect x="3" y="9" width="18" height="12" rx="2"/><path d="M12 9v12M3 13h18M12 9c-1.5-4-6-4.5-6-2s4 2 6 2zM12 9c1.5-4 6-4.5 6-2s-4 2-6 2z"/>',
  lovepath:'<path d="M5 20c5 0 3-7 8-7s3-7 7-7"/><circle cx="5" cy="20" r="1.6"/><circle cx="20" cy="6" r="1.6"/>',
  lovepsy:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>'
};
const NAV=[["love","Сегодня"],["lovetog","Вместе"],["loveid","Свидания"],["lovepath","Путь"],["lovepsy","Психолог"]];
const PARENT={lovew:"love",lovemd:"love",lovedt:"love",loved:"love",lovex:"love",lovegd:"love", lovem:"lovetog",lovekn:"lovetog",lovelw:"lovetog",loveq:"lovetog",lovee:"lovetog", lovewl:"loveid", lovep:"lovepath",lovet:"lovepath",lovef:"lovepath",lovek:"lovepath",lovea:"lovepath", plus:"lovepsy", lovecsi:"lovepath", love30:"lovetog", lovesos:"love"};
const TAB_ROOT=["love","lovetog","loveid","lovepath","lovepsy","lovewl"];
const nico = (k,sz=22) => `<svg viewBox="0 0 24 24" width="${sz}" height="${sz}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${NAVI[k]}</svg>`;
window.ROOM_NAV = r => { const cur=TAB_ROOT.includes(r)?(r==="lovewl"?"loveid":r):(PARENT[r]||"love"); return NAV.map(([k,t])=>`<button data-go="${k}" ${cur===k?'aria-current="page"':''}>${nico(k)}<span>${t}</span></button>`).join(""); };
window.modeSwitch = cur => `<div class="mode-sw" role="group" aria-label="Режим"><button data-go="home" aria-pressed="${cur==="me"}">Я</button><button data-go="love" aria-pressed="${cur==="we"}">Мы</button></div>`;
const roomHead = () => `<div class="top"><div class="brand"><div class="logo love-logo">${ico("heart",18)}</div><div><div style="font-weight:700">Опора</div><div class="small muted">для пары</div></div></div><div class="top-r">${modeSwitch("we")}<button class="sos-pill" data-go="sos">SOS</button></div></div>`;
const tileL = (go, icon, t, s) => `<button class="tile" data-go="${go}"><span class="ico">${icon}</span><strong>${t}</strong><span class="small muted">${s}</span></button>`;

/* Сегодня */
function vLove(){
  const h=new Date().getHours(), hi=h<6?"Доброй ночи":h<12?"Доброе утро":h<18?"Добрый день":"Добрый вечер";
  return `${roomHead()}
  <div class="stack-s"><h1 class="hello">${hi}</h1><p class="muted">Минутка друг для друга</p></div>
  ${T()?T().dqCard():""}
  <div class="quick2"><button class="btn quiet" data-go="lovemd">${ico("heart",18)} Как ты сейчас?</button><button class="btn quiet" data-go="lovedt">${ico("cal",18)} Наши даты</button></div>
  ${T()?T().datesCard():""}
  ${window.LOVE.garden?LOVE.garden.card():""}
  ${wxCard()}
  ${plus()&&C()?C().report(false):""}`;
}
/* Вместе */
function vTog(){
  return `<div class="stack-s"><h1>Вместе</h1><p class="muted">Игры и тесты для двоих</p></div>
  <button class="card feat" data-go="lovem"><span class="label">Тест для пары</span><strong class="feat-t">Совпадаем ли мы</strong><span class="small">10 тем — деньги, быт, родители, доверие. Отвечаете по очереди на одном телефоне.</span><span class="feat-go">Начать →</span></button>
  <div class="grid2">
    ${tileL("lovekn",ico("star"),"Насколько ты меня знаешь","Квиз по ссылке")}
    ${tileL("lovelw",ico("heart"),"Как мы чувствуем любовь","Тест вдвоём")}
    ${tileL("loveq",ico("thoughts"),"Вопросы для двоих","36 вопросов")}
    ${tileL("lovee",ico("moon"),"Вечера для двоих","Сценарии на час")}
  </div>`;
}
/* Путь */
function vPath(){
  const l=L(), last=l.tests[l.tests.length-1];
  return `<div class="stack-s"><h1>Путь</h1><p class="muted">Разобраться в себе и в отношениях</p></div>
  <div class="stack-s"><span class="label">Программы</span><div class="carousel">${Object.entries(LP).map(([id,p])=>{ const n=doneCount(id); return `<button class="card prog-card" data-go="lovep" data-sub="${id}:${Math.min(n+1,p.days.length)}"><span class="stack-s"><strong style="font-size:1.05rem">${p.t}</strong><span class="small muted">${p.d}</span></span><span class="stack-s"><span class="small">${n?`Пройдено ${n} из ${p.days.length}`:"День 1 бесплатно"}</span><span class="progress"><i style="width:${n/p.days.length*100}%"></i></span></span></button>`; }).join("")}</div></div>
  <div class="stack-s"><span class="label">Разобраться</span><div class="list">
    ${li("lovet",null,ico("star",18),"Мой стиль привязанности",last?ASTY[last.s].t:"Самонаблюдение · 2 минуты",false)}
    ${li("lovef",null,ico("hand",18),"Разбор ссоры","Понять себя и сказать без упрёков",!plus() && l.fights.length>=1)}
    ${li("lovek",null,ico("book",18),"Трудные разговоры","Деньги, родители, ревность, близость",false)}
  </div></div>
  ${window.intimLi?`<div class="list">${intimLi()}</div>`:""}
  <div class="stack-s"><span class="label">Почитать</span><div class="list">${LA.map((a,i)=>li("lovea",a.id,ico("book",18),a.t,`${a.m} мин`,i>0 && !plus())).join("")}</div></div>`;
}
/* Психолог */
function vPsy(){
  return `<div class="card">
    <div class="row" style="gap:16px;flex-wrap:nowrap">${psyAva("avatar")}<div class="stack-s" style="min-width:0"><h2>${esc(PSY.fullName||PSY.name)}</h2><p class="small muted">${esc(PSY.role)}</p></div></div>
    <p>Когда самим не получается договориться, помогает взгляд со стороны. Можно прийти одному или вдвоём: ссоры, ревность, доверие, расставание.</p>
    <button class="btn" data-go="about" data-sub="book">Записаться на консультацию</button>
  </div>
  ${plus()?`<button class="banner card plus-banner" data-go="plus"><span class="bi">${ico("check",20)}</span><span class="bt"><strong>Опора+ подключена</strong><span class="small muted">Всё открыто</span></span><span class="chev">›</span></button>`
  :`<button class="banner card plus-banner" data-go="plus"><span class="bi">${LOCK}</span><span class="bt"><strong>Открыть всё — Опора+</strong><span class="small muted">Программы, свидания, график отношений</span></span><span class="chev">›</span></button>`}
  <button class="btn quiet block" data-go="home">← Вернуться в Опору для себя</button>
  <p class="disclaimer">Если в отношениях есть насилие или угрозы — это не тема для упражнений. Откройте SOS или позвоните 112.</p>`;
}

/* «Погода в паре» на главном экране раздела */
const C = () => window.LOVE && window.LOVE.couple;
const T = () => window.LOVE && window.LOVE.together;
function wxCard(){
  if(!C()) return "";
  const list=C().wxList(), cur=list.find(x=>x.w===C().weekKey(Date.now())), last=list[list.length-1];
  return `<button class="card wx-card" data-go="lovew"><span class="stack-s" style="min-width:0"><span class="label">Погода в паре</span>
    ${last?`<span class="wx-now"><span>Близость <b>${last.c}</b></span><span>Поддержка <b>${last.s}</b></span><span>Напряжение <b>${last.t}</b></span></span>`:`<strong>Как у вас дела на этой неделе?</strong>`}
    <span class="small muted">${cur?"Неделя отмечена · смотреть динамику":"30 секунд, раз в неделю"}</span></span><span class="chev">›</span></button>`;
}

/* ---------- День программы ---------- */
function vLoveProg(){
  const [id,dn]=String(sub||"close:1").split(":"); const P=LP[id]||LP.close; const pid=LP[id]?id:"close";
  const d=Math.max(1,Math.min(P.days.length, +dn||1)), D=P.days[d-1], st=progOf(pid), k=String(d);
  const nav=`<div class="day-dots">${P.days.map((_,i)=>`<button class="dd${st.done[i+1]?" done":""}${i+1===d?" cur":""}" data-go="lovep" data-sub="${pid}:${i+1}" aria-label="День ${i+1}">${i+1}</button>`).join("")}</div>`;
  if(d>1 && !plus()) return `${back()}<div class="stack-s"><span class="label">${P.t} · день ${d}</span><h1>${D.t}</h1></div>${nav}${lockCard("Следующие дни программы")}`;
  return `${back()}
  <div class="stack-s"><span class="label">${P.t} · день ${d} из ${P.days.length}</span><h1>${D.t}</h1></div>
  ${nav}
  <article class="stack">${D.p.map(t=>`<p>${t}</p>`).join("")}</article>
  <div class="card"><span class="label">Задание</span><p>${D.task}</p>
    <label class="field"><span class="small muted">${D.ask}</span><textarea id="lpNote" placeholder="Для себя">${esc(st.notes[k]||"")}</textarea></label>
    ${st.done[k]?`<p class="small" style="color:var(--ok)">${ico("check",16)} Выполнено</p>`:`<button class="btn" id="lpDone">Готово</button>`}
  </div>
  ${d<P.days.length?`<button class="btn quiet block" data-go="lovep" data-sub="${pid}:${d+1}">День ${d+1} →</button>`:""}
  ${pid==="part"?`<p class="disclaimer">Если становится невыносимо — <button class="linkbtn small" data-go="sos" style="display:inline-flex;min-height:0">откройте SOS</button></p>`:""}`;
}
function bindLoveProg(){
  const [id,dn]=String(sub||"close:1").split(":"); const pid=LP[id]?id:"close", k=String(Math.max(1,+dn||1)), st=progOf(pid);
  const n=$("#lpNote"); if(n) n.oninput=()=>{ st.notes[k]=n.value; save(); };
  const b=$("#lpDone"); if(b) b.onclick=()=>{ st.done[k]=Date.now(); save(); markDay(); award("self",20); toast(`День ${k} выполнен`); render(); };
}

/* ---------- Тест ---------- */
function vLoveTest(){
  const l=L();
  if(AT.i===0 && !AT.a.length && !AT.fresh && l.tests.length) AT.i=AQ.length;
  if(AT.i<AQ.length){
    const [,q]=AQ[AT.i];
    return `${back()}
    <div class="stack-s"><h1>Стиль привязанности</h1><p class="muted small">Отвечайте про отношения в целом — нынешние или прошлые</p></div>
    <div class="progress"><i style="width:${AT.i/AQ.length*100}%"></i></div>
    <div class="card"><span class="label">Вопрос ${AT.i+1} из ${AQ.length}</span><h3>${q}</h3>
      <div class="opts">${AOPT.map((o,i)=>`<button class="opt" data-ao="${i+1}">${o}</button>`).join("")}</div>
      ${AT.i?`<button class="linkbtn small" id="aBack" style="align-self:flex-start">← Предыдущий</button>`:""}
    </div>
    <p class="src-note">Это не научный тест, а упражнение для самонаблюдения, которое составил психолог по мотивам двухмерной модели привязанности (тревога и избегание). Научные опросники привязанности не опубликованы для свободного использования, поэтому здесь их нет. Результат — повод присмотреться к себе, а не оценка.</p><p class="disclaimer">Не диагноз, а повод лучше понять себя.</p>`;
  }
  const r=l.tests[l.tests.length-1], S1=ASTY[r.s];
  const x=20+(r.v-1)/4*160, y=180-(r.a-1)/4*160;
  return `${back()}
  <div class="stack-s"><span class="label">Ваш результат</span><h1>${S1.t}</h1></div>
  <div class="card">
    <svg viewBox="0 0 200 200" class="att-map" role="img" aria-label="Тревога ${r.a.toFixed(1)} из 5, избегание ${r.v.toFixed(1)} из 5">
      ${[["anx",20,20,26,32,"start","тревожный"],["mix",100,20,174,32,"end","смешанный"],["safe",20,100,26,174,"start","надёжный"],["avd",100,100,174,174,"end","избегающий"]].map(([k,x0,y0,tx,ty,an,t])=>`<rect x="${x0}" y="${y0}" width="80" height="80" class="q${k===r.s?" me":""}"/><text x="${tx}" y="${ty}" style="text-anchor:${an}" class="${k===r.s?"me":""}">${t}</text>`).join("")}
      <text x="100" y="196" class="ax">избегание →</text><text x="10" y="100" class="ax" transform="rotate(-90 10 100)">тревога →</text>
      <circle cx="${x}" cy="${y}" r="9" class="dot"/>
    </svg>
    <p>${S1.d}</p>
  </div>
  ${plus()?`<div class="card soft"><span class="label">Что с этим делать</span><p class="small">${S1.tip}</p></div>`:lockCard("Что с этим делать: советы для вашего стиля")}
  <div class="row"><button class="btn quiet" id="aAgain">Пройти заново</button><button class="btn" data-go="about" data-sub="book">Обсудить с ${esc(PSY.nameWith)}</button></div>`;
}
function bindLoveTest(){
  $$("[data-ao]").forEach(b=>b.onclick=()=>{ AT.a[AT.i]=+b.dataset.ao; AT.i++;
    if(AT.i>=AQ.length){ const m=k=>{ const v=AQ.map((q,i)=>q[0]===k?(q[2]?6-AT.a[i]:AT.a[i]):null).filter(x=>x!=null); return v.reduce((s,x)=>s+x,0)/v.length; };
      const a=m("a"), v=m("v"); L().tests.push({ts:Date.now(), a, v, s:styleOf(a,v)}); save(); markDay(); award("aware",15); }
    render(); window.scrollTo(0,0); });
  const bk=$("#aBack"); if(bk) bk.onclick=()=>{ AT.i--; render(); };
  const ag=$("#aAgain"); if(ag) ag.onclick=()=>{ AT={i:0,a:[],fresh:true}; render(); };
}

/* ---------- Вопросы для двоих ---------- */
function vLoveQ(){
  const lv=QL[QS.lv], locked=QS.lv>0 && !plus();
  return `${back()}
  <div class="stack-s"><h1>Вопросы для двоих</h1><p class="muted small">Задавайте по очереди и слушайте, не перебивая. Ответить можно и самому себе.</p></div>
  <div class="seg seg3" role="tablist">${QL.map((x,i)=>`<button role="tab" data-ql="${i}" aria-selected="${i===QS.lv}">${x.t}${i>0&&!plus()?" "+LOCK:""}</button>`).join("")}</div>
  ${locked?lockCard(`Уровень «${lv.t}»`):`<div class="card q-card"><span class="label">${QS.i+1} из ${lv.q.length}</span><p class="q-text" aria-live="polite">${lv.q[QS.i]}</p>
    <div class="row" style="justify-content:space-between"><button class="btn quiet" id="qPrev" ${QS.i?"":"disabled"}>←</button><button class="btn" id="qNext">${QS.i<lv.q.length-1?"Следующий":"Сначала"}</button></div></div>`}`;
}
function bindLoveQ(){
  $$("[data-ql]").forEach(b=>b.onclick=()=>{ QS={lv:+b.dataset.ql, i:0}; render(); });
  const n=$("#qNext"); if(n) n.onclick=()=>{ const lv=QL[QS.lv]; QS.i=(QS.i+1)%lv.q.length; if(QS.i===lv.q.length-1){ award("self",10); } render(); };
  const p=$("#qPrev"); if(p) p.onclick=()=>{ if(QS.i>0){ QS.i--; render(); } };
}

/* ---------- Разбор ссоры ---------- */
function vLoveF(){
  const l=L(), locked=!plus() && l.fights.length>=1 && FD.i<FS.length;
  const hist=l.fights.length?`<details class="more"><summary>Мои разборы · ${l.fights.length}</summary><div>${l.fights.slice().reverse().map(f=>`<div class="entry"><div class="body"><p class="small">${esc(iMsg(f.v))}</p><span class="small muted">${fmtDate(f.ts)}</span></div></div>`).join("")}</div></details>`:"";
  if(locked && FD.i===0) return `${back()}<div class="stack-s"><h1>Разбор ссоры</h1></div>${lockCard("Новые разборы ссор")}${hist}`;
  if(FD.i<FS.length){
    const [k,t,h,ph]=FS[FD.i];
    return `${back()}
    <div class="stack-s"><h1>Разбор ссоры</h1><p class="muted small">Лучше делать, когда эмоции немного улеглись</p></div>
    <div class="progress"><i style="width:${FD.i/FS.length*100}%"></i></div>
    <div class="card"><span class="label">Шаг ${FD.i+1} из ${FS.length}</span>
      <label class="field"><span><strong>${t}</strong></span><span class="small muted">${h}</span><textarea id="fIn" placeholder="${ph}">${esc(FD.v[k]||"")}</textarea></label>
      <div class="row"><button class="btn quiet" id="fPrev" ${FD.i?"":"disabled"}>Назад</button><button class="btn" id="fNext">${FD.i===FS.length-1?"Готово":"Дальше"}</button></div>
    </div>${hist}`;
  }
  const msg=iMsg(FD.v);
  return `${back()}
  <div class="stack-s"><h1>Что можно сказать</h1><p class="muted small">Я-сообщение: о себе, без обвинений. Поправьте слова, чтобы звучало как вы.</p></div>
  <div class="card"><div class="copybox" id="fOut">${esc(msg)}</div><div class="row"><button class="btn" id="fCopy">Скопировать</button><button class="btn quiet" id="fNew">Новый разбор</button></div></div>
  <div class="card soft"><span class="label">Перед разговором</span><ul class="steps small"><li>Выберите спокойное время, не на бегу и не на голодный желудок.</li><li>Начните с того, что вам важны эти отношения.</li><li>Выслушайте ответ до конца, прежде чем возражать.</li></ul></div>${hist}`;
}
function bindLoveF(){
  const keep=()=>{ const t=$("#fIn"); if(t) FD.v[FS[FD.i][0]]=t.value.trim(); };
  const n=$("#fNext"); if(n) n.onclick=()=>{ keep(); FD.i++; if(FD.i>=FS.length){ L().fights.push({ts:Date.now(), v:Object.assign({},FD.v)}); save(); markDay(); award("aware",20); } render(); window.scrollTo(0,0); };
  const p=$("#fPrev"); if(p) p.onclick=()=>{ keep(); if(FD.i>0){ FD.i--; render(); } };
  const c=$("#fCopy"); if(c) c.onclick=()=>copy(iMsg(FD.v), $("#fOut"));
  const nw=$("#fNew"); if(nw) nw.onclick=()=>{ FD={i:0,v:{}}; render(); };
}

/* ---------- Статья ---------- */
function vLoveA(){
  const i=Math.max(0,LA.findIndex(a=>a.id===sub)), a=LA[i];
  if(i>0 && !plus()) return `${back()}<div class="stack-s"><h1>${a.t}</h1></div>${lockCard("Статья доступна в Опора+")}`;
  return `${back()}<article class="stack"><div class="stack-s"><span class="label">${a.m} мин чтения</span><h1>${a.t}</h1></div>${a.p.map(t=>`<p>${t}</p>`).join("")}</article>
  <div class="card soft"><p class="small">Узнали себя? Разберём вашу ситуацию на консультации.</p><button class="btn" data-go="about" data-sub="book" style="align-self:flex-start">Записаться</button></div>`;
}

/* ---------- Опора+ ---------- */
function vPlus(){
  return `${back()}
  <div class="love-hero">${HERO}<div class="stack-s"><h1>Опора+</h1><p class="muted">Всё о близости и отношениях — в одном месте</p></div></div>
  <div class="card"><ul class="plus-list">
    <li>${ico("check",18)}<span>Программы «Ближе друг к другу» и «Пережить расставание» целиком</span></li>
    <li>${ico("check",18)}<span>Советы для вашего стиля привязанности</span></li>
    <li>${ico("check",18)}<span>Все 36 вопросов для двоих</span></li>
    <li>${ico("check",18)}<span>Разборы ссор без ограничений</span></li>
    <li>${ico("check",18)}<span>Тест для пары «Совпадаем ли мы» с темами для разговора</span></li>
    <li>${ico("check",18)}<span>Вечера для двоих и скрипты трудных разговоров</span></li>
    <li>${ico("check",18)}<span>График «Погода в паре» и отчёт месяца</span></li>
    <li>${ico("check",18)}<span>40 свиданий-сюрпризов и список «Хотим вместе» без ограничений</span></li>
    <li>${ico("check",18)}<span>Полный профиль «Как мы чувствуем любовь» с советами</span></li>
    <li>${ico("check",18)}<span>Все статьи и новые материалы каждый месяц</span></li>
    <li>${ico("check",18)}<span><strong>Цели без выгорания:</strong> безлимит целей и привычек, программа «Перестать откладывать», разборы прокрастинации</span></li>
    ${PSY.plusDiscount?`<li>${ico("check",18)}<span><strong>Скидка ${+PSY.plusDiscount}% на консультации у ${esc(PSY.nameFrom||PSY.nameTo)}</strong></span></li>`:""}
  </ul></div>
  ${plus()?`<div class="card soft"><p><strong>Опора+ подключена</strong></p><p class="small muted">Спасибо, что поддерживаете проект.</p><button class="linkbtn small" id="plusOff" style="align-self:flex-start">Отключить на этом устройстве</button></div>`:
  `<div class="card soft"><p><strong>Подписка скоро появится</strong></p><p class="small">Хотите получить доступ одним из первых — напишите ${esc(PSY.nameTo)}.</p>${PSY.telegram?`<a class="btn" href="https://t.me/${encodeURIComponent(PSY.telegram)}" target="_blank" rel="noopener" style="align-self:flex-start">Написать в Telegram</a>`:""}</div>
  <div class="card"><label class="field"><span>У меня есть код доступа</span><div class="row" style="flex-wrap:nowrap"><input type="text" id="plusCode" autocomplete="off" autocapitalize="characters" style="flex:1;min-width:0"><button class="btn" id="plusGo">Ввести</button></div></label></div>`}`;
}
function bindPlus(){
  const go=$("#plusGo");
  if(go){ const f=()=>{ const v=$("#plusCode").value.trim().toUpperCase(); if(!v) return;
      if((PSY.allCodes||[]).includes(fnv(v))){ const l=L(); l.plus=true; l.all=true; save(); toast("«Опора+ Всё» подключена"); render(); } else if((PSY.plusCodes||[]).includes(fnv(v))){ L().plus=true; save(); toast("Опора+ подключена"); render(); } else toast("Код не подошёл"); };
    go.onclick=f; $("#plusCode").onkeydown=e=>{ if(e.key==="Enter") f(); }; }
  const off=$("#plusOff"); if(off) off.onclick=()=>{ L().plus=false; save(); render(); };
}

/* ---------- Регистрация ---------- */
window.LOVE={L, plus, back, lockCard, LOCK, li, ROOM_ROUTES, LP, QL, tileL};
Object.assign(VIEWS,{lovetog:[vTog,null], lovepath:[vPath,null], lovepsy:[vPsy,null], love:[vLove,null], lovep:[vLoveProg,bindLoveProg], lovet:[vLoveTest,bindLoveTest], loveq:[vLoveQ,bindLoveQ], lovef:[vLoveF,bindLoveF], lovea:[vLoveA,null], plus:[vPlus,bindPlus]});
ROOM_ROUTES.forEach(r=>TAB_OF[r]="practices");
window.ROOM_OF = r => ROOM_ROUTES.includes(r) ? "love" : "";
window.loveBanner = () => `<button class="banner card love-banner" data-go="love"><span class="bi">${ico("heart",20)}</span><span class="bt"><strong>Отношения</strong><span class="small muted">Близость, ссоры, расставания</span></span>${plus()?"":`<span class="plus-tag">Опора+</span>`}<span class="chev">›</span></button>`;
})();
