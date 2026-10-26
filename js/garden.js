/* «Наш сад»: общий путь пары в картинке. Каждое общее дело что-то сажает. Сад только растёт и никогда не вянет. */
(function(){
"use strict";
const {L, back} = window.LOVE;

/* ---------- Что из чего растёт ---------- */
const KINDS={
  grass:{t:"Травинка", of:"ответ на вопрос дня"},
  flower:{t:"Цветок", of:"проведённое свидание"},
  tree:{t:"Дерево", of:"вечер вдвоём"},
  bush:{t:"Куст", of:"день программы"},
  stone:{t:"Камень в дорожке", of:"разобранная ссора"},
  fly:{t:"Бабочка", of:"тест или квиз вдвоём"},
  lamp:{t:"Фонарик", of:"отметка «Погоды в паре»"},
  star:{t:"Звезда", of:"сбывшееся желание из «Хотим вместе»"}
};
function counts(){
  const l=L(), qd=l.qd&&typeof l.qd==="object"?Object.values(l.qd):[];
  let prog=0; Object.values(l.prog||{}).forEach(p=>prog+=Object.keys((p&&p.done)||{}).length);
  return {
    grass: qd.filter(x=>x&&x.me).length,
    flower: ((l.scr&&l.scr.done)||[]).length,
    tree: (l.eves||[]).length,
    bush: prog,
    stone: (l.fights||[]).length,
    fly: (l.match||[]).length + (l.lw||[]).filter(r=>r&&r.b&&r.b.length).length,
    lamp: (l.wx||[]).length,
    star: (l.wish||[]).filter(w=>w&&w.done).length
  };
}
function maxStreak(){
  const l=L(), ks=Object.entries(l.qd||{}).filter(([k,v])=>v&&v.me).map(([k])=>+k).sort((a,b)=>a-b);
  let best=0, cur=0, prev=null; ks.forEach(k=>{ cur=(prev!=null&&k===prev+1)?cur+1:1; best=Math.max(best,cur); prev=k; }); return best;
}
function milestones(){
  const c=counts(), l=L();
  const progDone=Object.entries(l.prog||{}).some(([id,p])=>p&&Object.keys(p.done||{}).length>=7);
  return [
    ["Первый вопрос дня", c.grass>=1], ["7 дней вопросов подряд", maxStreak()>=7], ["30 вопросов дня", c.grass>=30],
    ["Первое свидание", c.flower>=1], ["10 свиданий", c.flower>=10], ["Первый вечер вдвоём", c.tree>=1],
    ["Узнали друг друга лучше", c.fly>=1], ["Первая разобранная ссора", c.stone>=1], ["Месяц «Погоды в паре»", c.lamp>=4],
    ["Мечта сбылась", c.star>=1], ["Программа пройдена", progDone]
  ];
}

/* ---------- Рисунок ---------- */
function rng(seed){ let a=seed>>>0; return ()=>{ a=(a+0x6D2B79F5)>>>0; let t=a; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; }; }
const pathX = y => 180 + 34*Math.sin((262-y)/34);
const pathW = y => 5 + (y-150)*.22;
const PAL={
  light:{sky1:"#F6D3C4", sky2:"#FCEFE6", sun:"#FFE3B8", hill1:"#E8C6B4", hill2:"#D6DDB8", g1:"#C9DAA9", g2:"#B4CC93", path:"#EEDFC8", grass:"#7FA36A", leaf:"#8DB37A", leaf2:"#6E9C64", trunk:"#8A6A55", stone:"#B9AFA5"},
  dark:{sky1:"#2A1D26", sky2:"#3C2A33", sun:"#F3E3C8", hill1:"#4A3340", hill2:"#36423A", g1:"#33402F", g2:"#2B3828", path:"#5A4A42", grass:"#7FA36A", leaf:"#6E9C64", leaf2:"#557F4E", trunk:"#6B5244", stone:"#8B8178"}
};
const FL=["#E58FA0","#F2B38A","#B9A2D8","#F2D06B","#F09AB0"];
function gardenSVG(opts={}){
  const P=PAL[opts.dark?"dark":"light"], c=counts(), items=[];
  const cap={grass:80, flower:40, tree:14, bush:24, stone:24, fly:12, lamp:12, star:30};
  Object.keys(cap).forEach((k,ki)=>{ const n=Math.min(c[k],cap[k]);
    for(let i=0;i<n;i++){ const r=rng((ki+1)*1000+i*7+3);
      if(k==="star"){ items.push({k, x:15+r()*330, y:12+r()*70, s:1}); continue; }
      if(k==="fly"){ items.push({k, x:30+r()*300, y:110+r()*70, s:1, c:FL[i%FL.length]}); continue; }
      if(k==="stone"){ const y=262-i*(100/Math.max(cap.stone,1))*.95-r()*4; items.push({k, x:pathX(y)+(r()-.5)*pathW(y)*1.1, y, s:.5+(y-150)/110*.7}); continue; }
      let x,y,t=0; do{ y=152+r()*104; x=8+r()*344; t++; } while(Math.abs(x-pathX(y))<pathW(y)+10 && t<20);
      items.push({k, x, y, s:(.45+(y-150)/110*.75)*1.35, c:FL[(i+ki)%FL.length], v:r()});
    }
  });
  items.sort((a,b)=>a.y-b.y);
  const draw=it=>{ const {x,y}=it, s=it.s; switch(it.k){
    case "grass": return `<path d="M${x} ${y}q-1.5 ${-6*s} ${-3*s} ${-9*s}M${x} ${y}q.5 ${-7*s} ${2.5*s} ${-11*s}M${x} ${y}q1.5 ${-5*s} ${4*s} ${-7*s}" stroke="${P.grass}" stroke-width="${1.1*s+.3}" fill="none" stroke-linecap="round"/>`;
    case "flower": { const h=14*s, r=3.2*s; let pet=""; for(let k=0;k<5;k++){ const a=k*1.2566+it.v; pet+=`<circle cx="${(x+Math.cos(a)*r*1.1).toFixed(1)}" cy="${(y-h+Math.sin(a)*r*1.1).toFixed(1)}" r="${r.toFixed(1)}" fill="${it.c}"/>`; }
      return `<path d="M${x} ${y}q${2*s} ${-h/2} 0 ${-h}" stroke="${P.leaf2}" stroke-width="${1.2*s}" fill="none"/><ellipse cx="${x+3*s}" cy="${y-h*.4}" rx="${3*s}" ry="${1.4*s}" fill="${P.leaf}" transform="rotate(-30 ${x+3*s} ${y-h*.4})"/>${pet}<circle cx="${x}" cy="${y-h}" r="${r*.7}" fill="#FFE7A8"/>`; }
    case "tree": { const h=46*s, r=17*s; return `<rect x="${x-2.2*s}" y="${y-h*.55}" width="${4.4*s}" height="${h*.55}" rx="${2*s}" fill="${P.trunk}"/><circle cx="${x}" cy="${y-h*.62}" r="${r}" fill="${P.leaf2}"/><circle cx="${x-r*.55}" cy="${y-h*.5}" r="${r*.72}" fill="${P.leaf}"/><circle cx="${x+r*.5}" cy="${y-h*.72}" r="${r*.62}" fill="${P.leaf}"/>${it.v>.5?`<circle cx="${x+r*.3}" cy="${y-h*.55}" r="${2.2*s}" fill="#E58FA0"/><circle cx="${x-r*.4}" cy="${y-h*.7}" r="${2.2*s}" fill="#E58FA0"/>`:""}`; }
    case "bush": return `<ellipse cx="${x}" cy="${y-5*s}" rx="${11*s}" ry="${7*s}" fill="${P.leaf}"/><ellipse cx="${x-5*s}" cy="${y-8*s}" rx="${6*s}" ry="${5*s}" fill="${P.leaf2}"/><ellipse cx="${x+5*s}" cy="${y-9*s}" rx="${5.5*s}" ry="${4.5*s}" fill="${P.leaf2}"/>`;
    case "stone": return `<ellipse cx="${x}" cy="${y}" rx="${5.5*s+1}" ry="${2.6*s+.6}" fill="${P.stone}"/><ellipse cx="${x-1.2*s}" cy="${y-.8*s}" rx="${2.4*s}" ry="${1*s}" fill="#fff" opacity=".25"/>`;
    case "fly": return `<g transform="translate(${x} ${y})"><ellipse cx="-3" cy="-1" rx="3.4" ry="2.4" fill="${it.c}" transform="rotate(-25)"/><ellipse cx="3" cy="-1" rx="3.4" ry="2.4" fill="${it.c}" transform="rotate(25)"/><ellipse cx="-2.4" cy="2.2" rx="2" ry="1.5" fill="${it.c}" opacity=".8"/><ellipse cx="2.4" cy="2.2" rx="2" ry="1.5" fill="${it.c}" opacity=".8"/><rect x="-.5" y="-3" width="1" height="6" rx=".5" fill="#5A4A42"/></g>`;
    case "lamp": { const h=22*s; return `<circle cx="${x}" cy="${y-h}" r="${9*s}" fill="#FFD58A" opacity=".28"/><rect x="${x-.8*s}" y="${y-h}" width="${1.6*s}" height="${h}" fill="#6B5244"/><rect x="${x-2.6*s}" y="${y-h-3.5*s}" width="${5.2*s}" height="${5.6*s}" rx="${1.2*s}" fill="#FFD58A"/>`; }
    case "star": return `<circle cx="${x}" cy="${y}" r="3.6" fill="#FFE3A8" opacity=".35"/><circle cx="${x}" cy="${y}" r="1.4" fill="#FFF3D2"/>`;
  } return ""; };
  const pts=[]; for(let y=262;y>=146;y-=4) pts.push([pathX(y),y,pathW(y)]);
  const pathD=`M${pts.map(p=>`${(p[0]-p[2]).toFixed(1)} ${p[1]}`).join(" L")} L${pts.reverse().map(p=>`${(p[0]+p[2]).toFixed(1)} ${p[1]}`).join(" L")}Z`;
  const id="gd"+(gardenSVG.n=(gardenSVG.n||0)+1);
  return `<svg viewBox="0 0 360 260" ${opts.xmlns?'xmlns="http://www.w3.org/2000/svg" width="1080" height="780"':'class="garden-svg" role="img" aria-label="Наш сад"'} ${opts.slice?'preserveAspectRatio="xMidYMax slice"':""}>
    <defs><linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.sky1}"/><stop offset="1" stop-color="${P.sky2}"/></linearGradient>
    <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.g1}"/><stop offset="1" stop-color="${P.g2}"/></linearGradient></defs>
    <rect width="360" height="260" fill="url(#${id}s)"/>
    <circle cx="292" cy="58" r="22" fill="${P.sun}" opacity=".9"/>
    <path d="M0 132 Q60 98 130 122 T260 112 T360 120 V170 H0Z" fill="${P.hill1}"/>
    <path d="M0 150 Q90 126 180 142 T360 138 V260 H0Z" fill="${P.hill2}"/>
    <path d="M0 158 Q100 140 190 152 T360 150 V260 H0Z" fill="url(#${id}g)"/>
    <path d="${pathD}" fill="${P.path}"/>
    ${items.map(draw).join("")}
  </svg>`;
}
const dark = () => matchMedia("(prefers-color-scheme: dark)").matches && document.documentElement.dataset.theme!=="light" || document.documentElement.dataset.theme==="dark";
const total = () => Object.values(counts()).reduce((a,b)=>a+b,0);

/* ---------- Карточка на «Сегодня» и экран сада ---------- */
function card(){
  const n=total();
  return `<button class="card garden-card" data-go="lovegd"><span class="garden-mini">${gardenSVG({dark:dark(), slice:true})}</span>
    <span class="row" style="justify-content:space-between;width:100%"><span class="stack-s" style="gap:2px"><span class="label">Наш сад</span><span class="small muted">${n?`${n} ${plural(n,"росток","ростка","ростков")} из общих дел`:"Сделайте что-то вместе — и здесь появится первый росток"}</span></span><span class="chev">›</span></span></button>`;
}
function vGarden(){
  const c=counts(), ms=milestones(), got=ms.filter(m=>m[1]).length;
  return `${back()}
  <div class="stack-s"><h1>Наш сад</h1><p class="muted small">Каждое общее дело что-то сажает. Сад только растёт и никогда не вянет — даже если вы делаете паузу.</p></div>
  <div class="garden-big">${gardenSVG({dark:dark()})}</div>
  ${total()?"":`<p class="small muted" style="text-align:center">Пока здесь тихо. Ответьте на вопрос дня — и вырастет первая травинка.</p>`}
  <div class="card"><span class="label">Что из чего растёт</span><div class="g-legend">${Object.entries(KINDS).map(([k,v])=>`<div class="g-row"><span class="g-ico g-${k}" aria-hidden="true"></span><span class="small"><strong>${v.t}</strong> — ${v.of}</span><b>${c[k]}</b></div>`).join("")}</div></div>
  <div class="card"><span class="label">Тёплые отметки · ${got} из ${ms.length}</span><div class="chips">${ms.map(([t,ok])=>`<span class="g-ms${ok?" on":""}">${ok?ico("check",14):""}${t}</span>`).join("")}</div></div>
  ${total()?`<button class="btn quiet block" id="gShare">${ico("share",18)} Поделиться садом</button>`:""}`;
}
async function gardenStory(){
  try{ await document.fonts.ready; }catch(e){}
  const svg=gardenSVG({xmlns:true}); const img=new Image(); const url=URL.createObjectURL(new Blob([svg],{type:"image/svg+xml"}));
  try{ await new Promise((res,rej)=>{ img.onload=res; img.onerror=rej; img.src=url; }); }catch(e){ toast("Не получилось нарисовать картинку"); return; }
  const W=1080,H=1920,cv=document.createElement("canvas"); cv.width=W; cv.height=H; const x=cv.getContext("2d");
  const g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,"#F8EFEA"); g.addColorStop(1,"#F3DCD6"); x.fillStyle=g; x.fillRect(0,0,W,H);
  const f='"Onest", system-ui, sans-serif'; x.textAlign="center"; x.fillStyle="#A84B5A"; x.font=`700 40px ${f}`; x.fillText("ОПОРА · ДЛЯ ПАРЫ", W/2, 220);
  x.fillStyle="#2B2023"; x.font=`800 104px ${f}`; x.fillText("Наш сад", W/2, 380);
  x.save(); x.beginPath(); x.roundRect?x.roundRect(60,470,960,693,48):x.rect(60,470,960,693); x.clip(); x.drawImage(img,60,470,960,693); x.restore(); URL.revokeObjectURL(url);
  const n=total(); x.fillStyle="#2B2023"; x.font=`700 64px ${f}`; x.fillText(`${n} ${plural(n,"росток","ростка","ростков")} из общих дел`, W/2, 1320);
  x.fillStyle="#6B5659"; x.font=`500 44px ${f}`; x.fillText("Каждое общее дело что-то сажает", W/2, 1400);
  x.fillStyle="#A84B5A"; x.font=`600 40px ${f}`; x.fillText((PSY.siteUrl||"").replace(/^https?:\/\//,"").replace(/\/$/,""), W/2, 1760);
  cv.toBlob(b=>showStory(b),"image/png");
}
function bindGarden(){ const s=$("#gShare"); if(s) s.onclick=gardenStory; }

VIEWS.lovegd=[vGarden,bindGarden]; TAB_OF.lovegd="practices"; window.LOVE.ROOM_ROUTES.push("lovegd");
window.LOVE.garden={card, gardenSVG, counts};
})();
