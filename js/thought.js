/* =====================================================
   Мысль дня: цитата + совет. Новые открываются по одной
   в день при заходе в приложение. Открытые хранятся в коллекции.
   ===================================================== */

const QUOTES = window.QUOTES || [];

function permOf(n, salt){
  const r=rng((S.seed||1)*31+salt), a=[...Array(n).keys()];
  for(let i=n-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}
function unlockDaily(){
  if(!S.dq) S.dq={d:"", q:[], t:[], cq:null, ct:null};
  if(!Array.isArray(S.favQ)) S.favQ=[];
  if(!Array.isArray(S.favT)) S.favT=[];
  const today=dayKey();
  if(S.dq.d===today && S.dq.cq!=null) return;
  const pick=(list, opened, salt)=>{
    const perm=permOf(list.length, salt), have=new Set(opened.map(x=>x.i));
    const next=perm.find(i=>!have.has(i));
    if(next!==undefined){ opened.push({i:next, ts:Date.now()}); return next; }
    // всё открыто — дальше показываем по кругу
    return perm[S.days.length % perm.length];
  };
  S.dq.cq=pick(QUOTES, S.dq.q, 101);
  S.dq.ct=pick(TIPS, S.dq.t, 202);
  S.dq.d=today; save();
}
unlockDaily();

function homeThought(){
  unlockDaily();
  const q=QUOTES[S.dq.cq], t=TIPS[S.dq.ct], fav=S.favQ.includes(S.dq.cq);
  return `<div class="card thought">
    <span class="label">Мысль дня</span>
    <blockquote class="q">${esc(q.t)}</blockquote>
    <div class="qa">— ${esc(q.a)}${q.s?`, <span class="muted">${esc(q.s)}</span>`:""}</div>
    <div class="qact">
      <button class="icon-btn ${fav?"on":""}" data-favq="${S.dq.cq}" aria-label="${fav?"Убрать из избранного":"В избранное"}" aria-pressed="${fav}">${ico("heart",18)}</button>
      <button class="icon-btn" data-qshare="${S.dq.cq}" aria-label="Поделиться цитатой">${ico("share",18)}</button>
      <button class="linkbtn small" data-go="collection" style="margin-left:auto">Коллекция · ${S.dq.q.length+S.dq.t.length}</button>
    </div>
    <div class="tipline"><span class="ico">${ico("bulb",16)}</span><div><span class="label">Совет дня</span><p>${esc(t)}</p></div></div>
  </div>`;
}

/* ---------- коллекция ---------- */
let colTab="q", colFav=false;
function vCollection(){
  unlockDaily();
  const isQ=colTab==="q";
  const opened=(isQ?S.dq.q:S.dq.t).slice().reverse();
  const fav=isQ?S.favQ:S.favT;
  const list=colFav?opened.filter(x=>fav.includes(x.i)):opened;
  const total=isQ?QUOTES.length:TIPS.length, left=total-(isQ?S.dq.q:S.dq.t).length;
  return `${backBtn("home","Главная")}
  <div class="stack-s"><h1>Коллекция</h1><p class="muted">Каждый день, когда вы заходите, открывается новая цитата и новый совет</p></div>
  <div class="seg" role="tablist">
    <button role="tab" aria-selected="${isQ}" data-ctab="q">Цитаты · ${S.dq.q.length}/${QUOTES.length}</button>
    <button role="tab" aria-selected="${!isQ}" data-ctab="t">Советы · ${S.dq.t.length}/${TIPS.length}</button>
  </div>
  <div class="row"><button class="chip" aria-pressed="${!colFav}" data-cfav="0">Все</button><button class="chip" aria-pressed="${colFav}" data-cfav="1">${ico("heart",14)} Избранное · ${fav.length}</button></div>
  <div class="stack">${list.length?list.map(x=>{
    const on=fav.includes(x.i);
    if(isQ){ const q=QUOTES[x.i]; return `<div class="card qcard"><blockquote class="q sm">${esc(q.t)}</blockquote><div class="qa">— ${esc(q.a)}${q.s?`, <span class="muted">${esc(q.s)}</span>`:""}</div>
      <div class="qact"><span class="small muted">${fmtDate(x.ts)}</span><button class="icon-btn ${on?"on":""}" style="margin-left:auto" data-favq="${x.i}" aria-pressed="${on}" aria-label="Избранное">${ico("heart",18)}</button><button class="icon-btn" data-qshare="${x.i}" aria-label="Поделиться">${ico("share",18)}</button></div></div>`; }
    return `<div class="card qcard"><p>${esc(TIPS[x.i])}</p><div class="qact"><span class="small muted">${fmtDate(x.ts)}</span><button class="icon-btn ${on?"on":""}" style="margin-left:auto" data-favt="${x.i}" aria-pressed="${on}" aria-label="Избранное">${ico("heart",18)}</button></div></div>`;
  }).join(""):`<p class="small muted" style="text-align:center">${colFav?"Нажмите на сердечко, чтобы сохранить в избранное":"Пока пусто"}</p>`}</div>
  ${left>0?`<div class="locked"><span>${ico("lock",16)}</span><span class="small">Ещё ${left} ${plural(left,"закрыта","закрыты","закрыто")}. Следующая откроется ${S.dq.d===dayKey()?"завтра":"при следующем заходе"}.</span></div>`:""}`;
}
function bindCollection(){
  $$("[data-ctab]").forEach(b=>b.onclick=()=>{ colTab=b.dataset.ctab; render(); });
  $$("[data-cfav]").forEach(b=>b.onclick=()=>{ colFav=b.dataset.cfav==="1"; render(); });
}
// избранное и «поделиться» работают на любом экране
document.addEventListener("click", e=>{
  const fq=e.target.closest("[data-favq]"), ft=e.target.closest("[data-favt]"), sh=e.target.closest("[data-qshare]");
  if(fq){ const i=+fq.dataset.favq; S.favQ=S.favQ.includes(i)?S.favQ.filter(x=>x!==i):[...S.favQ,i]; save(); const y=scrollY; render(); scrollTo(0,y); }
  if(ft){ const i=+ft.dataset.favt; S.favT=S.favT.includes(i)?S.favT.filter(x=>x!==i):[...S.favT,i]; save(); const y=scrollY; render(); scrollTo(0,y); }
  if(sh){ quoteStory(QUOTES[+sh.dataset.qshare]); }
});

/* ---------- цитата для сторис ---------- */
async function quoteStory(q){
  try{ await document.fonts.ready; }catch(e){}
  const W=1080,H=1920,c=document.createElement("canvas"); c.width=W; c.height=H; const x=c.getContext("2d");
  const g=x.createLinearGradient(0,0,W,H); g.addColorStop(0,"#3F86C8"); g.addColorStop(1,"#1C4670"); x.fillStyle=g; x.fillRect(0,0,W,H);
  x.globalAlpha=.1; x.fillStyle="#fff"; [[900,300,280],[120,1620,320]].forEach(([a,b,r])=>{x.beginPath();x.arc(a,b,r,0,Math.PI*2);x.fill();}); x.globalAlpha=1;
  const f='"Onest", system-ui, sans-serif';
  // логотип
  x.fillStyle="#fff"; x.beginPath(); x.roundRect ? x.roundRect(90,140,110,110,30) : x.rect(90,140,110,110); x.fill();
  x.fillStyle="#3577B8"; x.font=`800 72px ${f}`; x.textAlign="center"; x.textBaseline="middle"; x.fillText("О",145,198);
  x.textAlign="left"; x.textBaseline="alphabetic"; x.fillStyle="#fff"; x.font=`700 54px ${f}`; x.fillText("Опора",230,190);
  x.globalAlpha=.75; x.font=`400 34px ${f}`; x.fillText(`с психологом ${PSY.nameWith}`,230,238); x.globalAlpha=1;
  // текст цитаты
  let size=q.t.length>80?60:q.t.length>45?70:84;
  x.font=`700 ${size}px ${f}`;
  let lines=wrapText(x, q.t, W-200);
  while(lines.length>9 && size>44){ size-=6; x.font=`700 ${size}px ${f}`; lines=wrapText(x,q.t,W-200); }
  const lh=size*1.25, blockH=lines.length*lh, top=(H-blockH)/2-40;
  x.fillStyle="rgba(255,255,255,.35)"; x.font=`800 220px ${f}`; x.fillText("“",80,top+80);
  x.fillStyle="#fff"; x.font=`700 ${size}px ${f}`;
  lines.forEach((ln,i)=>x.fillText(ln,100,top+size+i*lh));
  x.globalAlpha=.85; x.font=`500 40px ${f}`;
  x.fillText("— "+q.a, 100, top+blockH+90); x.globalAlpha=1;
  // ссылка
  const link=(PSY.siteUrl||location.href).replace(/^https?:\/\//,"").replace(/\/$/,"");
  x.textAlign="center"; x.font=`600 40px ${f}`; x.globalAlpha=.85; x.fillText("Мысль дня в приложении", W/2, 1700); x.globalAlpha=1;
  x.font=`700 44px ${f}`; x.fillText(link, W/2, 1765);
  c.toBlob(b=>showStory(b),"image/png");
}

VIEWS.collection=[vCollection,bindCollection];
TAB_OF.collection="home";
