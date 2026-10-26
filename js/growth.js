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
let treeUid=0;
function isDark(){ const t=document.documentElement.getAttribute("data-theme"); return t? t==="dark" : matchMedia("(prefers-color-scheme: dark)").matches; }
function treeColors(night){
  return night
    ? {sky1:"#2A4566", sky2:"#142336", hill1:"#2E4A3A", hill2:"#1E3428", far:"#243A4C", bark1:"#8E6E52", bark2:"#6B5039", bark3:"#4E3A29",
       l1:"#3F7F55", l2:"#2F6A47", l3:"#5D9B6C", hi:"#7DB88A", soil:"#4A3A2C", night:true}
    : {sky1:"#F3F8FD", sky2:"#CFE3F5", hill1:"#B9D99E", hill2:"#8FBF79", far:"#D6E7C9", bark1:"#A3805F", bark2:"#82634A", bark3:"#5E4635",
       l1:"#6DB070", l2:"#4C9560", l3:"#8CC484", hi:"#B5DE9F", soil:"#9C7A58", night:false};
}
const f1 = n => n.toFixed(1);
function leafPath(x,y,len,ang,col,vein){
  // лист-капелька с прожилкой
  const a=ang*Math.PI/180, ca=Math.cos(a), sa=Math.sin(a);
  const tip=[x+ca*len, y+sa*len], w=len*.42;
  const m=[x+ca*len*.5, y+sa*len*.5], n=[-sa*w, ca*w];
  return `<path d="M${f1(x)} ${f1(y)} Q${f1(m[0]+n[0])} ${f1(m[1]+n[1])} ${f1(tip[0])} ${f1(tip[1])} Q${f1(m[0]-n[0])} ${f1(m[1]-n[1])} ${f1(x)} ${f1(y)}Z" fill="${col}"/>`+
    (vein?`<path d="M${f1(x)} ${f1(y)} L${f1(x+ca*len*.85)} ${f1(y+sa*len*.85)}" stroke="${vein}" stroke-width="1" opacity=".55"/>`:"");
}
function treeSVG(lv, opts={}){
  const night = opts.colors && opts.colors.night!==undefined ? opts.colors.night : isDark();
  const C=Object.assign(treeColors(night), opts.colors||{});
  const R=rng(S.seed||7), st=stageOf(lv), id="tr"+(++treeUid);
  const tot=xpTotal()||1, mix=Object.entries(S.xp).map(([k,v])=>[k,v/tot]);
  const accent=()=>{ let r=R(), acc=0; for(const [k,p] of mix){ acc+=p; if(r<=acc) return SKILLS[k].c; } return C.l1; };
  const G=246, X=150, out=[];

  /* небо */
  out.push(`<rect x="0" y="0" width="300" height="300" fill="url(#${id}sky)"/>`);
  if(night){
    for(let i=0;i<26;i++){ out.push(`<circle cx="${f1(20+R()*260)}" cy="${f1(20+R()*150)}" r="${f1(.6+R()*1.1)}" fill="#fff" opacity="${f1(.4+R()*.6)}"/>`); }
    out.push(`<mask id="${id}moon"><rect width="300" height="300" fill="#fff"/><circle cx="229" cy="63" r="13" fill="#000"/></mask><circle cx="222" cy="68" r="15" fill="#F4EFD8" mask="url(#${id}moon)"/>`);
  } else {
    if(lv>=4){ out.push(`<circle cx="226" cy="66" r="26" fill="#FFF3C4" opacity=".55"/><circle cx="226" cy="66" r="15" fill="#FFE08A"/>`); }
    if(lv>=7){ const cl=(x,y,s)=>`<g opacity=".9" fill="#fff"><ellipse cx="${x}" cy="${y}" rx="${18*s}" ry="${7*s}"/><ellipse cx="${x-9*s}" cy="${y-4*s}" rx="${9*s}" ry="${7*s}"/><ellipse cx="${x+6*s}" cy="${y-6*s}" rx="${11*s}" ry="${9*s}"/></g>`;
      out.push(cl(70,72,1)); if(lv>=12) out.push(cl(150,44,.8)); }
  }
  if(st>=8) out.push(`<circle cx="150" cy="150" r="140" fill="url(#${id}glow)"/>`);

  /* дальние холмы и земля */
  if(lv>=4) out.push(`<path d="M0 ${G-18} Q60 ${G-46} 120 ${G-24} T240 ${G-30} T300 ${G-20} V300 H0Z" fill="${C.far}"/>`);
  out.push(`<path d="M0 ${G+2} Q75 ${G-16} 150 ${G-4} T300 ${G} V300 H0Z" fill="url(#${id}hill)"/>`);
  out.push(`<ellipse cx="${X}" cy="${G+4}" rx="${lv<7?22:46+Math.min(30,(lv-7)*2.5)}" ry="${lv<7?5:9}" fill="#000" opacity=".12"/>`);
  // камешки
  out.push(`<ellipse cx="88" cy="${G+14}" rx="6" ry="3.5" fill="#B9B1A3"/><ellipse cx="214" cy="${G+18}" rx="4.5" ry="3" fill="#C9C1B3"/>`);

  const blobs=[], plantStart=out.length;
  if(lv<=3){
    out.push(`<ellipse cx="${X}" cy="${G+1}" rx="20" ry="6" fill="${C.soil}"/>`);
    if(lv===1){ out.push(`<ellipse cx="${X}" cy="${G-3}" rx="8" ry="5.5" fill="${C.bark2}"/><ellipse cx="${X-2.5}" cy="${G-5}" rx="3" ry="1.6" fill="#fff" opacity=".35"/>`); }
    if(lv>=2){
      const h=lv===2?18:30;
      out.push(`<path d="M${X} ${G-1} C${X-3} ${G-h*.4} ${X+3} ${G-h*.7} ${X} ${G-h}" stroke="${C.l2}" stroke-width="3" fill="none" stroke-linecap="round"/>`);
      out.push(leafPath(X,G-h,lv===2?10:14,-150,C.l1,C.hi)+leafPath(X,G-h,lv===2?10:14,-30,C.l3,C.hi));
      if(lv===3) out.push(`<ellipse cx="${X}" cy="${G-h-5}" rx="3.5" ry="5" fill="${C.l2}"/>`);
    }
  } else if(lv<=6){
    const h=46+(lv-4)*20;
    out.push(`<ellipse cx="${X}" cy="${G+1}" rx="22" ry="6" fill="${C.soil}"/>`);
    out.push(`<path d="M${X} ${G} C${X-8} ${G-h*.35} ${X+8} ${G-h*.65} ${X+1} ${G-h}" stroke="${C.l2}" stroke-width="${3.5+(lv-4)*.8}" fill="none" stroke-linecap="round"/>`);
    const pairs=2+(lv-4);
    for(let i=0;i<pairs;i++){ const t=.32+.62*i/pairs, y=G-h*t, x=X+Math.sin(t*3)*4, L=13+lv*1.6-i*1.2;
      out.push(leafPath(x,y,L,-160+i*6,i%2?C.l1:C.l3,C.hi)+leafPath(x,y,L,-20-i*6,i%2?C.l3:C.l1,C.hi)); }
    out.push(leafPath(X+1,G-h,12,-115,C.l1,C.hi)+leafPath(X+1,G-h,12,-65,C.l3,C.hi));
  } else {
    const k=lv-7;
    const H=Math.min(98, 56+k*2.7), W=Math.min(16, 6.5+k*.65);
    // корни
    for(const s of [-1,1]){ out.push(`<path d="M${X+s*W*.6} ${G-2} Q${X+s*(W+8)} ${G} ${X+s*(W+16+k)} ${G+5}" stroke="${C.bark2}" stroke-width="${f1(2+W*.25)}" fill="none" stroke-linecap="round"/>`); }
    // ствол
    out.push(`<path d="M${X-W} ${G} C${X-W*.55} ${G-H*.45} ${X-W*.5} ${G-H*.8} ${X-W*.32} ${G-H} L${X+W*.32} ${G-H} C${X+W*.5} ${G-H*.8} ${X+W*.55} ${G-H*.45} ${X+W} ${G}Z" fill="url(#${id}bark)"/>`);
    // текстура коры
    for(let i=0;i<Math.min(9,3+k);i++){ const y=G-8-R()*H*.85, x=X+(R()-.5)*W*.9; out.push(`<path d="M${f1(x)} ${f1(y)} q${f1((R()-.5)*3)} -6 ${f1((R()-.5)*2)} -${f1(6+R()*8)}" stroke="${C.bark3}" stroke-width="1.1" fill="none" opacity=".55" stroke-linecap="round"/>`); }
    if(k>=6) out.push(`<ellipse cx="${X+W*.15}" cy="${G-H*.45}" rx="2.6" ry="3.6" fill="${C.bark3}" opacity=".7"/>`);
    // ветви
    const depth=Math.min(5, 2+Math.floor(k/3)), tips=[];
    const br=(x,y,a,len,d,w)=>{
      const x2=x+Math.cos(a)*len, y2=y+Math.sin(a)*len, mx=(x+x2)/2+Math.cos(a+1.57)*len*.12, my=(y+y2)/2+Math.sin(a+1.57)*len*.12;
      out.push(`<path d="M${f1(x)} ${f1(y)} Q${f1(mx)} ${f1(my)} ${f1(x2)} ${f1(y2)}" stroke="${C.bark2}" stroke-width="${f1(w)}" fill="none" stroke-linecap="round"/>`);
      if(d<=0){ tips.push([x2,y2]); return; }
      if(d<=2) tips.push([x2,y2]);
      const sp=.4+R()*.28;
      br(x2,y2,a-sp,len*(.7+R()*.1),d-1,w*.68);
      br(x2,y2,a+sp,len*(.7+R()*.1),d-1,w*.68);
      if(d>2 && R()<.45) br(x2,y2,a+(R()-.5)*.35,len*.62,d-2,w*.55);
    };
    br(X, G-H+5, -Math.PI/2, Math.min(38, 23+k*1.1), depth, Math.max(2.2,W*.62));
    // крона: три слоя с тенью и светом
    const n=Math.min(70, 12+k*3.4);
    const cx=X, cy=G-H-12-k*.4, rx=Math.min(96, 48+k*3), ry=Math.min(54, 33+k*1.6);
    for(let i=0;i<n;i++){ const t=R()*Math.PI*2, r=Math.sqrt(R()); blobs.push([cx+Math.cos(t)*rx*r, cy+Math.sin(t)*ry*r, 10+R()*8]); }
    tips.forEach(([x,y])=>blobs.push([x,y,7+R()*5]));
    blobs.sort((a,b)=>a[1]-b[1]);
    blobs.forEach(([x,y,r])=>out.push(`<circle cx="${f1(x+2)}" cy="${f1(y+4)}" r="${f1(r+1.5)}" fill="${C.l2}"/>`));
    blobs.forEach(([x,y,r],i)=>out.push(`<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${i%3?C.l1:C.l3}"/>`));
    blobs.forEach(([x,y,r])=>{ if(R()<.6) out.push(`<circle cx="${f1(x-r*.32)}" cy="${f1(y-r*.36)}" r="${f1(r*.45)}" fill="${C.hi}" opacity=".55"/>`); });
    // листья-акценты цвета навыков
    for(let i=0;i<Math.min(22,4+k*1.3);i++){ const [x,y]=blobs[Math.floor(R()*blobs.length)]; out.push(leafPath(x+(R()-.5)*12,y+(R()-.5)*10,7+R()*3,R()*360,accent(),null)); }
    // трава
    if(lv>=9){ for(let i=0;i<Math.min(18,lv-5);i++){ const x=f1(24+R()*252), y=G+4+R()*14, c=R()<.5?C.l2:C.l1;
      out.push(`<path d="M${x} ${f1(y)} q-2 -6 -5 -10 M${x} ${f1(y)} q0 -8 1 -13 M${x} ${f1(y)} q3 -5 6 -9" stroke="${c}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`); } }
    // цветы на земле
    if(lv>=12){ const cols=["#F2A7C0","#FFFFFF","#F6D365","#B9A7F2"]; for(let i=0;i<Math.min(10,lv-10);i++){ const x=30+R()*240, y=G+8+R()*12;
      out.push(`<path d="M${f1(x)} ${f1(y)} v-7" stroke="${C.l2}" stroke-width="1.2"/><circle cx="${f1(x)}" cy="${f1(y-8)}" r="2.6" fill="${cols[i%4]}"/><circle cx="${f1(x)}" cy="${f1(y-8)}" r="1" fill="#F2C14E"/>`); } }
    // птицы
    if(lv>=13){ for(let i=0;i<Math.min(3,lv-12);i++){ const x=48+R()*50+(i%2)*140, y=42+R()*26, s=.8+R()*.4;
      out.push(`<path d="M${f1(x)} ${f1(y)} q${f1(5*s)} ${f1(-6*s)} ${f1(10*s)} 0 q${f1(5*s)} ${f1(-6*s)} ${f1(10*s)} 0 q${f1(-5*s)} ${f1(-2*s)} ${f1(-10*s)} ${f1(3*s)} q${f1(-5*s)} ${f1(-5*s)} ${f1(-10*s)} ${f1(-3*s)}Z" fill="${night?"#C9D4E2":"#4A5563"}"/>`); } }
    // цветы в кроне: 5 лепестков
    if(lv>=16){ for(let i=0;i<Math.min(34,(lv-15)*6);i++){ const [x0,y0,r0]=blobs[Math.floor(R()*blobs.length)], x=x0+(R()-.5)*r0, y=y0+(R()-.5)*r0, c=R()<.7?"#F6B8CB":"#FFFFFF";
      let p=""; for(let j=0;j<5;j++){ const a=j*1.2566+R()*.2; p+=`<circle cx="${f1(x+Math.cos(a)*2.6)}" cy="${f1(y+Math.sin(a)*2.6)}" r="2.1" fill="${c}"/>`; }
      out.push(p+`<circle cx="${f1(x)}" cy="${f1(y)}" r="1.3" fill="#F2C14E"/>`); } }
    // плоды с бликом
    if(lv>=19){ for(let i=0;i<Math.min(18,(lv-18)*4);i++){ const [x0,y0,r0]=blobs[Math.floor(R()*blobs.length)], x=x0+(R()-.5)*r0, y=y0+r0*.3;
      out.push(`<path d="M${f1(x)} ${f1(y-4)} q1 -3 3 -4" stroke="${C.bark3}" stroke-width="1" fill="none"/><circle cx="${f1(x)}" cy="${f1(y)}" r="4.6" fill="#E9783A"/><circle cx="${f1(x-1.5)}" cy="${f1(y-1.6)}" r="1.4" fill="#fff" opacity=".7"/>`); } }
    // роща: молодые деревья вокруг и светлячки
    if(lv>=22){
      for(let i=0;i<lv-21;i++){ const left=i%2===0, x=left?44+i*8:256-i*8, h=30+i*7, gy=G+6;
        out.push(`<path d="M${x-2.5} ${gy} L${x-1.5} ${gy-h} L${x+1.5} ${gy-h} L${x+2.5} ${gy}Z" fill="${C.bark2}"/>`);
        for(let j=0;j<5;j++){ const bx=x+(R()-.5)*16, by=gy-h-(R()*10), br2=7+R()*5; out.push(`<circle cx="${f1(bx+1)}" cy="${f1(by+2)}" r="${f1(br2+1)}" fill="${C.l2}"/><circle cx="${f1(bx)}" cy="${f1(by)}" r="${f1(br2)}" fill="${j%2?C.l1:C.l3}"/>`); } }
      for(let i=0;i<10;i++){ out.push(`<circle class="ffly" style="animation-delay:${f1(R()*3)}s" cx="${f1(40+R()*220)}" cy="${f1(80+R()*150)}" r="2.4" fill="#FFE27A" filter="url(#${id}blur)"/>`); }
    }
  }
  if(lv<=6){ const sc=lv<=3?2.1:1.12; const plant=out.splice(plantStart); out.push(`<g transform="translate(${X} ${G}) scale(${sc}) translate(${-X} ${-G})">${plant.join("")}</g>`); }
  const defs=`<defs>
    <radialGradient id="${id}sky" cx=".5" cy=".3" r=".8"><stop offset="0" stop-color="${C.sky1}"/><stop offset="1" stop-color="${C.sky2}"/></radialGradient>
    <linearGradient id="${id}hill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.hill1}"/><stop offset="1" stop-color="${C.hill2}"/></linearGradient>
    <linearGradient id="${id}bark" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.bark1}"/><stop offset=".55" stop-color="${C.bark2}"/><stop offset="1" stop-color="${C.bark3}"/></linearGradient>
    <radialGradient id="${id}glow"><stop offset="0" stop-color="#FFF6C8" stop-opacity=".5"/><stop offset="1" stop-color="#FFF6C8" stop-opacity="0"/></radialGradient>
    <filter id="${id}blur" x="-2" y="-2" width="5" height="5"><feGaussianBlur stdDeviation="1.6"/></filter>
    <clipPath id="${id}clip"><circle cx="150" cy="150" r="142"/></clipPath></defs>`;
  return `<svg class="tree ${opts.cls||""}" viewBox="0 0 300 300" role="img" aria-label="Дерево, уровень ${lv}">${defs}<g clip-path="url(#${id}clip)">${out.join("")}</g></svg>`;
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
      <span class="small muted">${t?`Уровень ${lv} из ${MAX_LV}`:"Сделайте первое упражнение — и оно прорастёт"}</span>
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
  const svg=treeSVG(lv,{colors:{night:false}}).replace("<svg ",'<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" ');
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
