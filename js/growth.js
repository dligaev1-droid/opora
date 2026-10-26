/* =====================================================
   Прокачка: 4 навыка, 24 уровня, 8 стадий дерева.
   Подключается после app.js и использует его функции.
   ===================================================== */

const SKILLS = {
  calm:  {t:"Спокойствие",  c:"#5B8FD0", d:"дыхание, заземление, расслабление"},
  res:   {t:"Ресурс",       c:"#4FA37C", d:"благодарности, отдых, программа о выгорании"},
  aware: {t:"Осознанность", c:"#E0A93B", d:"дневник, эмоции, тесты, карты"},
  self:  {t:"Опора на себя",c:"#9B7BD0", d:"дневник мыслей, границы, статьи"}
};
const SKILL_TITLES=["Новичок","Ученик","Практик","Уверенный","Опытный","Знаток","Наставник","Мастер","Гуру","Легенда"];
const STAGES=["Семечко","Росток","Саженец","Молодое дерево","Крепкое дерево","Цветущее дерево","Плодоносящее дерево","Роща"];
const MAX_LV=24, DAY_CAP=100;
const PROG_SKILL={calm7:"calm", burnout7:"res", bounds5:"self"};

// очки, нужные для уровня n (накопительно): быстрый старт, потом медленнее
const lvXP = n => 12*(n-1)*(n-1) - 2*(n-1);
function gInit(){
  if(!S.xp) S.xp={calm:0,res:0,aware:0,self:0};
  if(!S.xpDay) S.xpDay={d:"",v:0};
  if(!S.seed) S.seed=Math.floor(Math.random()*1e9);
}
gInit();
const xpTotal = () => Object.values(S.xp).reduce((a,b)=>a+b,0);
function levelOf(t){ let n=1; while(n<MAX_LV && t>=lvXP(n+1)) n++; return n; }
const stageOf = lv => Math.min(STAGES.length, Math.ceil(lv/3));
const skillLv = x => Math.min(10, Math.floor(Math.sqrt(x/25))+1);
const skillNext = l => 25*l*l;

function award(skill, pts, why){
  gInit();
  const today=dayKey();
  if(S.xpDay.d!==today) S.xpDay={d:today, v:0};
  const room=Math.max(0, DAY_CAP-S.xpDay.v);
  const got=Math.min(pts, room);
  S.lastActive=Date.now();
  if(!got){ save(); return 0; }
  const before=levelOf(xpTotal());
  S.xp[skill]+=got; S.xpDay.v+=got; save();
  const after=levelOf(xpTotal());
  if(after>before){
    const st0=stageOf(before), st1=stageOf(after);
    if(st1>st0) setTimeout(()=>stageCelebrate(after), 600);
    else setTimeout(()=>toast(`Новый уровень: ${after}`), 400);
  } else {
    xpToast(`+${got} · ${SKILLS[skill].t}`);
  }
  return got;
}
function xpToast(t){
  const el=document.createElement("div"); el.className="xp-pop"; el.textContent=t;
  document.body.appendChild(el); setTimeout(()=>el.remove(), 1800);
}
// бонус за возвращение после перерыва
(function(){
  if(S.lastActive && Date.now()-S.lastActive > 3*864e5){
    setTimeout(()=>{ if(award("res",20)) toast("Рады, что вы вернулись: +20 к ресурсу"); }, 1200);
  }
})();

/* ---------- Дерево ---------- */
function rng(seed){ let a=seed>>>0; return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function treeColors(){
  return {sky:cssVar("--accent-soft")||"#E1EDF8", ground:cssVar("--surface-2")||"#EEE9E0", bark:"#8A6A4F", leaf:"#6FB277", leaf2:"#4E9A62", leaf3:"#88C08A"};
}
function treeSVG(lv, opts={}){
  const C=Object.assign(treeColors(), opts.colors||{});
  const R=rng(S.seed||7), st=stageOf(lv);
  const tot=xpTotal()||1, mix=Object.entries(S.xp).map(([k,v])=>[k,v/tot]);
  const greens=[C.leaf,C.leaf2,C.leaf3];
  const leafColor=()=>greens[Math.floor(R()*3)];
  const accent=()=>{ let r=R(), acc=0; for(const [k,p] of mix){ acc+=p; if(r<=acc) return SKILLS[k].c; } return C.leaf; };
  const G=262, X=150; const out=[];
  out.push(`<circle cx="150" cy="150" r="140" fill="${C.sky}"/>`);
  if(st>=8) out.push(`<circle cx="150" cy="150" r="140" fill="url(#glow)"/>`);
  out.push(`<ellipse cx="150" cy="${G+6}" rx="128" ry="18" fill="${C.ground}"/>`);
  const leaves=[], tips=[];
  if(lv<=3){
    out.push(`<ellipse cx="${X}" cy="${G-2}" rx="13" ry="8" fill="${C.bark}"/>`);
    if(lv>=2) out.push(`<path d="M${X} ${G-4} Q${X-2} ${G-20} ${X+1} ${G-30}" stroke="${C.leaf2}" stroke-width="3" fill="none" stroke-linecap="round"/>`);
    if(lv>=3){ out.push(`<ellipse cx="${X-9}" cy="${G-30}" rx="9" ry="5" transform="rotate(-25 ${X-9} ${G-30})" fill="${C.leaf}"/><ellipse cx="${X+10}" cy="${G-33}" rx="9" ry="5" transform="rotate(25 ${X+10} ${G-33})" fill="${C.leaf2}"/>`); }
  } else if(lv<=6){
    const h=45+(lv-3)*18;
    out.push(`<path d="M${X} ${G} Q${X-6} ${G-h/2} ${X+2} ${G-h}" stroke="${C.leaf2}" stroke-width="${3+lv-3}" fill="none" stroke-linecap="round"/>`);
    const n=(lv-3)*2+2;
    for(let i=0;i<n;i++){ const y=G-h*(.3+.7*i/n), s=i%2?1:-1, x=X+s*10; out.push(`<ellipse cx="${x}" cy="${y}" rx="${10+lv}" ry="${5+lv/2}" transform="rotate(${s*30} ${x} ${y})" fill="${leafColor()}"/>`); }
    out.push(`<circle cx="${X+2}" cy="${G-h-4}" r="${6+lv}" fill="${C.leaf}"/>`);
  } else {
    const k=lv-7;
    const H=Math.min(100, 58+k*2.8), W=Math.min(17, 6+k*.7);
    out.push(`<path d="M${X-W} ${G} C${X-W*.6} ${G-H*.5} ${X-W*.45} ${G-H*.8} ${X-W*.3} ${G-H} L${X+W*.3} ${G-H} C${X+W*.45} ${G-H*.8} ${X+W*.6} ${G-H*.5} ${X+W} ${G}Z" fill="${C.bark}"/>`);
    const depth=Math.min(5, 2+Math.floor(k/3));
    const br=(x,y,a,len,d,w)=>{
      const x2=x+Math.cos(a)*len, y2=y+Math.sin(a)*len;
      out.push(`<path d="M${x.toFixed(1)} ${y.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${C.bark}" stroke-width="${w.toFixed(1)}" stroke-linecap="round"/>`);
      if(d<=0){ tips.push([x2,y2]); return; }
      const sp=.42+R()*.25;
      br(x2,y2,a-sp,len*(.68+R()*.12),d-1,w*.66);
      br(x2,y2,a+sp,len*(.68+R()*.12),d-1,w*.66);
      if(d>2 && R()<.4) br(x2,y2,a+(R()-.5)*.3,len*.6,d-2,w*.55);
    };
    br(X, G-H+4, -Math.PI/2, Math.min(40, 24+k*1.2), depth, Math.max(2,W*.7));
    // крона
    const blobs=Math.min(60, 10+k*3);
    const cx=X, cy=G-H-12-k*.4, rx=Math.min(98, 50+k*3.1), ry=Math.min(54, 34+k*1.6);
    for(let i=0;i<blobs;i++){ const t=R()*Math.PI*2, r=Math.sqrt(R()); const x=cx+Math.cos(t)*rx*r, y=cy+Math.sin(t)*ry*r; leaves.push([x,y]); out.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(11+R()*8).toFixed(1)}" fill="${leafColor()}" opacity="${(.85+R()*.15).toFixed(2)}"/>`); }
    // акценты навыков: небольшие листья цвета навыков
    const acc=Math.min(18, 3+k);
    for(let i=0;i<acc;i++){ const [x,y]=leaves[Math.floor(R()*leaves.length)]; out.push(`<circle cx="${(x+(R()-.5)*10).toFixed(1)}" cy="${(y+(R()-.5)*10).toFixed(1)}" r="${(5+R()*3).toFixed(1)}" fill="${accent()}" opacity=".9"/>`); }
    tips.forEach(([x,y])=>{ out.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(8+R()*5).toFixed(1)}" fill="${leafColor()}"/>`); });
    if(lv>=9){ for(let i=0;i<Math.min(14,lv-6);i++){ const x=40+R()*220; out.push(`<path d="M${x} ${G+6} l-3 -9 M${x} ${G+6} l1 -12 M${x} ${G+6} l4 -8" stroke="${C.leaf2}" stroke-width="2" stroke-linecap="round"/>`); } }
    if(lv>=13){ for(let i=0;i<Math.min(3,lv-12);i++){ const x=50+R()*60+(i%2)*130, y=42+R()*30; out.push(`<path d="M${x} ${y} q6 -6 12 0 q6 -6 12 0" stroke="#5A6470" stroke-width="2" fill="none" stroke-linecap="round"/>`); } }
    if(lv>=16){ for(let i=0;i<Math.min(36,(lv-15)*6);i++){ const [x,y]=leaves[Math.floor(R()*leaves.length)]; out.push(`<circle cx="${(x+(R()-.5)*14).toFixed(1)}" cy="${(y+(R()-.5)*14).toFixed(1)}" r="3.2" fill="#F2A7C0"/><circle cx="${(x).toFixed(1)}" cy="${(y).toFixed(1)}" r="1.4" fill="#FFF3B0"/>`); } }
    if(lv>=19){ for(let i=0;i<Math.min(16,(lv-18)*4);i++){ const [x,y]=leaves[Math.floor(R()*leaves.length)]; out.push(`<circle cx="${x.toFixed(1)}" cy="${(y+6).toFixed(1)}" r="4.6" fill="#E8833A"/>`); } }
    if(lv>=22){
      for(let i=0;i<lv-21;i++){ const x=i%2?250-i*12:50+i*12, h=34+i*6; out.push(`<rect x="${x-2}" y="${G-h+8}" width="4" height="${h-8}" fill="${C.bark}"/><circle cx="${x}" cy="${G-h}" r="${12+i*2}" fill="${C.leaf2}"/><circle cx="${x+6}" cy="${G-h+6}" r="${9+i}" fill="${C.leaf}"/>`); }
      for(let i=0;i<8;i++){ out.push(`<circle class="ffly" style="animation-delay:${(R()*3).toFixed(2)}s" cx="${(50+R()*200).toFixed(1)}" cy="${(70+R()*150).toFixed(1)}" r="2.6" fill="#FFE27A"/>`); }
    }
  }
  const cid="tc"+Math.floor(R()*1e9);
  return `<svg class="tree ${opts.cls||""}" viewBox="0 0 300 300" role="img" aria-label="Дерево, уровень ${lv}"><defs><radialGradient id="glow"><stop offset="0" stop-color="#FFF6C8" stop-opacity=".55"/><stop offset="1" stop-color="#FFF6C8" stop-opacity="0"/></radialGradient><clipPath id="${cid}"><circle cx="150" cy="150" r="140"/><rect x="0" y="240" width="300" height="60"/></clipPath></defs><g clip-path="url(#${cid})">${out.join("")}</g></svg>`;
}

/* ---------- Главная: мини-дерево ---------- */
function homeTree(){
  const t=xpTotal(), lv=levelOf(t), st=stageOf(lv);
  const cur=lvXP(lv), nxt=lv<MAX_LV?lvXP(lv+1):cur, pct=lv<MAX_LV?Math.round((t-cur)/(nxt-cur)*100):100;
  return `<button class="card tree-card" data-go="growth">
    <span class="tree-mini">${treeSVG(lv)}</span>
    <span class="tc-body">
      <span class="label">Мой рост</span>
      <strong class="ct">${STAGES[st-1]}</strong>
      <span class="small muted">Уровень ${lv} из ${MAX_LV}</span>
      <span class="progress" style="display:block"><i style="width:${pct}%"></i></span>
    </span>
    <span class="chev">›</span>
  </button>`;
}

/* ---------- Экран «Мой рост» ---------- */
function vGrowth(){
  const t=xpTotal(), lv=levelOf(t), st=stageOf(lv);
  const cur=lvXP(lv), nxt=lv<MAX_LV?lvXP(lv+1):cur;
  const left=Math.max(0,nxt-t), pct=lv<MAX_LV?Math.round((t-cur)/(nxt-cur)*100):100;
  const todayLeft = S.xpDay && S.xpDay.d===dayKey() ? Math.max(0,DAY_CAP-S.xpDay.v) : DAY_CAP;
  return `${backBtn("home","Главная")}
  <div class="card growth-hero">
    ${treeSVG(lv,{cls:"big"})}
    <div class="stack-s" style="text-align:center;align-items:center">
      <span class="label">Стадия ${st} из ${STAGES.length}</span>
      <h1>${STAGES[st-1]}</h1>
      <span class="muted">Уровень ${lv} · ${t} ${plural(t,"очко","очка","очков")}</span>
    </div>
    <div class="progress"><i style="width:${pct}%"></i></div>
    <p class="small muted" style="text-align:center">${lv<MAX_LV?`До ${lv+1} уровня: ${left} ${plural(left,"очко","очка","очков")}`:"Максимальный уровень. Вы вырастили рощу!"}${todayLeft<DAY_CAP?` · сегодня можно ещё ${todayLeft}`:""}</p>
    <button class="btn quiet" id="treeStory">${ico("image",18)} Поделиться деревом</button>
  </div>
  <div class="stack-s"><span class="label">Навыки</span>
    <div class="list">${Object.entries(SKILLS).map(([k,s])=>{ const x=S.xp[k], l=skillLv(x), a=skillNext(l-1), b=skillNext(l), p=l>=10?100:Math.round((x-a)/(b-a)*100);
      return `<div class="li skill"><span class="sdot" style="background:${s.c}"></span><span class="dt" style="flex:1"><span class="row" style="justify-content:space-between"><strong>${s.t}</strong><span class="small muted">${l} · ${SKILL_TITLES[l-1]}</span></span><span class="progress" style="display:block"><i style="width:${p}%;background:${s.c}"></i></span><span class="small muted">${s.d}</span></span></div>`; }).join("")}</div>
  </div>
  <div class="stack-s"><span class="label">Стадии</span>
    <div class="stages">${STAGES.map((n,i)=>`<div class="stg ${i+1<=st?"on":""}"><span>${i+1<=st?ico("check",14):i+1}</span><small>${n}</small></div>`).join("")}</div>
  </div>
  ${badgesRow()}
  <details class="more"><summary>Как получать очки</summary>
    <ul class="tasks small">
      <li>Упражнение с оценкой до/после: +10 к спокойствию</li>
      <li>Запись в дневнике: +10 к осознанности, с эмоцией +5</li>
      <li>Благодарность: +10 к ресурсу</li>
      <li>Разобранная мысль: +20 к опоре на себя</li>
      <li>День программы: +25</li>
      <li>Тест, новая статья: +10 и +5</li>
      <li>Не больше ${DAY_CAP} очков в день. Прогресс никогда не сгорает.</li>
    </ul>
  </details>`;
}
function bindGrowth(){
  const b=$("#treeStory"); if(b) b.onclick=()=>treeStory();
}
function stageCelebrate(lv){
  const st=stageOf(lv);
  const m=document.createElement("div"); m.className="modal"; m.setAttribute("role","dialog"); m.setAttribute("aria-label","Новая стадия");
  m.innerHTML=`<div class="modal-in celebrate">${treeSVG(lv,{cls:"big"})}<span class="label" style="text-align:center">Новая стадия · уровень ${lv}</span><h2 style="text-align:center">${STAGES[st-1]}</h2><p class="small muted" style="text-align:center">Ваше дерево выросло. Это результат вашей заботы о себе.</p><div class="row" style="justify-content:center"><button class="btn" id="cShare">${ico("image",18)} Поделиться</button><button class="btn quiet" id="cClose">Отлично</button></div></div>`;
  document.body.appendChild(m);
  $("#cClose",m).onclick=()=>{ m.remove(); render(); };
  $("#cShare",m).onclick=()=>{ m.remove(); treeStory(); };
}
async function treeStory(){
  try{ await document.fonts.ready; }catch(e){}
  const lv=levelOf(xpTotal()), st=stageOf(lv);
  const svg=treeSVG(lv,{colors:{sky:"#E1EDF8",ground:"#EEE9E0"}}).replace("<svg ",'<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" ');
  const img=new Image(); const url=URL.createObjectURL(new Blob([svg],{type:"image/svg+xml"}));
  await new Promise((res,rej)=>{ img.onload=res; img.onerror=rej; img.src=url; });
  const W=1080,H=1920,c=document.createElement("canvas"); c.width=W; c.height=H; const x=c.getContext("2d");
  const g=x.createLinearGradient(0,0,W,H); g.addColorStop(0,"#3F86C8"); g.addColorStop(1,"#1C4670"); x.fillStyle=g; x.fillRect(0,0,W,H);
  const f='"Onest", system-ui, sans-serif';
  x.fillStyle="#fff"; x.beginPath(); x.roundRect ? x.roundRect(90,140,110,110,30) : x.rect(90,140,110,110); x.fill();
  x.fillStyle="#3577B8"; x.font=`800 72px ${f}`; x.textAlign="center"; x.textBaseline="middle"; x.fillText("О",145,198);
  x.textAlign="left"; x.textBaseline="alphabetic"; x.fillStyle="#fff"; x.font=`700 54px ${f}`; x.fillText("Опора",230,190);
  x.globalAlpha=.75; x.font=`400 34px ${f}`; x.fillText(`с психологом ${PSY.nameWith}`,230,238); x.globalAlpha=1;
  x.fillStyle="#fff"; x.beginPath(); x.roundRect ? x.roundRect(90,360,900,1180,56) : x.rect(90,360,900,1180); x.fill();
  x.drawImage(img,90,400,900,900);
  x.textAlign="center"; x.fillStyle="#68707A"; x.font=`600 34px ${f}`; x.fillText(`МОЁ ДЕРЕВО · УРОВЕНЬ ${lv}`, W/2, 1370);
  x.fillStyle="#1F2630"; x.font=`800 80px ${f}`; x.fillText(STAGES[st-1], W/2, 1465);
  x.fillStyle="#fff"; x.font=`600 46px ${f}`; x.fillText("Расту каждый день", W/2, 1660);
  const link=(PSY.siteUrl||location.href).replace(/^https?:\/\//,"").replace(/\/$/,"");
  x.font=`700 44px ${f}`; x.fillText(link, W/2, 1730);
  URL.revokeObjectURL(url);
  c.toBlob(b=>showStory(b),"image/png");
}
VIEWS.growth=[vGrowth,bindGrowth];
TAB_OF.growth="home";
