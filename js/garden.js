/* «Наш сад»: общий путь пары в картинке. Каждое общее дело что-то сажает. Сад только растёт и никогда не вянет.
   11 уровней сада: с каждым появляется новое украшение. Сад меняется вместе с временем года. */
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
const total = () => Object.values(counts()).reduce((a,b)=>a+b,0);
function maxStreak(){
  const l=L(), ks=Object.entries(l.qd||{}).filter(([k,v])=>v&&v.me).map(([k])=>+k).sort((a,b)=>a-b);
  let best=0, cur=0, prev=null; ks.forEach(k=>{ cur=(prev!=null&&k===prev+1)?cur+1:1; best=Math.max(best,cur); prev=k; }); return best;
}

/* ---------- 11 уровней сада ---------- */
const LEVELS=[
  [0,"Голая земля","Здесь вырастет ваш сад"],
  [1,"Первые всходы","Появились первые ростки"],
  [5,"Лужайка","У сада появилась табличка с названием"],
  [12,"Палисадник","Сад обнесён низким заборчиком"],
  [22,"Уютный уголок","У дорожки стоит скамейка для двоих"],
  [35,"Сад у пруда","Появился пруд с кувшинками"],
  [55,"Сад с качелями","Можно качаться вдвоём"],
  [80,"Розовая арка","Над дорожкой — арка из роз"],
  [110,"Сад с беседкой","На холме стоит беседка"],
  [150,"Сад под радугой","Над садом встала радуга"],
  [200,"Райский сад","Гирлянда огоньков и светлячки"]
];
const levelOf = (n=total()) => { let i=0; LEVELS.forEach((x,k)=>{ if(n>=x[0]) i=k; }); return i; };
function levelInfo(){ const n=total(), i=levelOf(n), nx=LEVELS[i+1];
  return {n, i, lv:i+1, name:LEVELS[i][1], next:nx, left:nx?nx[0]-n:0, pct:nx?Math.round((n-LEVELS[i][0])/(nx[0]-LEVELS[i][0])*100):100}; }

function milestones(){
  const c=counts(), l=L(), n=total(), lv=levelOf(n)+1;
  const progDone=Object.values(l.prog||{}).filter(p=>p&&Object.keys(p.done||{}).length>=7).length;
  return [
    ["Первый вопрос дня", c.grass>=1], ["7 дней вопросов подряд", maxStreak()>=7], ["30 дней вопросов подряд", maxStreak()>=30],
    ["30 вопросов дня", c.grass>=30], ["100 вопросов дня", c.grass>=100],
    ["Первое свидание", c.flower>=1], ["10 свиданий", c.flower>=10], ["25 свиданий", c.flower>=25],
    ["Первый вечер вдвоём", c.tree>=1], ["5 вечеров вдвоём", c.tree>=5], ["10 вечеров вдвоём", c.tree>=10],
    ["Узнали друг друга лучше", c.fly>=1], ["5 тестов и квизов вдвоём", c.fly>=5],
    ["Первая разобранная ссора", c.stone>=1], ["Учимся мириться: 5 ссор разобрано", c.stone>=5],
    ["Месяц «Погоды в паре»", c.lamp>=4], ["Три месяца «Погоды в паре»", c.lamp>=12],
    ["Мечта сбылась", c.star>=1], ["5 сбывшихся желаний", c.star>=5],
    ["Программа пройдена", progDone>=1], ["Три программы пройдены", progDone>=3],
    ["Всё понемногу: все 8 ростков", Object.values(c).every(v=>v>0)],
    ["50 ростков в саду", n>=50], ["100 ростков в саду", n>=100],
    ["Сад у пруда", lv>=6], ["Сад с беседкой", lv>=9], ["Райский сад", lv>=11]
  ];
}

/* ---------- Время года ---------- */
const SEAS={spring:"Весна", summer:"Лето", autumn:"Осень", winter:"Зима"};
function season(){ const s=L().gs; if(SEAS[s]) return s; const m=new Date().getMonth(); return m<2||m===11?"winter":m<5?"spring":m<8?"summer":"autumn"; }

/* ---------- Рисунок ---------- */
function rng(seed){ let a=seed>>>0; return ()=>{ a=(a+0x6D2B79F5)>>>0; let t=a; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; }; }
const pathX = y => 180 + 34*Math.sin((262-y)/34);
const pathW = y => 5 + (y-150)*.22;
const PAL={
  light:{sky1:"#F6D3C4", sky2:"#FCEFE6", sun:"#FFE3B8", hill1:"#E8C6B4", hill2:"#D6DDB8", g1:"#C9DAA9", g2:"#B4CC93", path:"#EEDFC8", grass:"#7FA36A", leaf:"#8DB37A", leaf2:"#6E9C64", trunk:"#8A6A55", stone:"#B9AFA5", wood:"#B98A62", water:"#9FD0E6"},
  dark:{sky1:"#2A1D26", sky2:"#3C2A33", sun:"#F3E3C8", hill1:"#4A3340", hill2:"#36423A", g1:"#33402F", g2:"#2B3828", path:"#5A4A42", grass:"#7FA36A", leaf:"#6E9C64", leaf2:"#557F4E", trunk:"#6B5244", stone:"#8B8178", wood:"#8A6A55", water:"#3E6E8A"}
};
const SPAL={
  spring:{light:{g1:"#CFE3A6", g2:"#B9D58F", leaf:"#9CC97F", hill2:"#D3E2B0"}, dark:{}},
  summer:{light:{}, dark:{}},
  autumn:{light:{sky1:"#F4CDB0", g1:"#D8D29C", g2:"#C7BE86", hill2:"#E0CFA0", grass:"#A39A5A", leaf:"#E0A458", leaf2:"#C9773F"}, dark:{g1:"#3E3C2A", g2:"#353224", hill2:"#45402E", leaf:"#A8733C", leaf2:"#8A5A30", grass:"#8F8650"}},
  winter:{light:{sky1:"#DCE6F0", sky2:"#F3F6FA", sun:"#FFF4DA", hill1:"#E4E9F1", hill2:"#EEF2F6", g1:"#F4F7FA", g2:"#E3EAF1", path:"#FBF8F4", grass:"#9DB59A", leaf:"#6F9A7A", leaf2:"#557F63"}, dark:{sky1:"#1C2230", sky2:"#2A3242", hill1:"#3A4352", hill2:"#465163", g1:"#56616F", g2:"#4A5462", path:"#6B7480", leaf:"#4F7360", leaf2:"#3E5E4E"}}
};
const FL=["#E58FA0","#F2B38A","#B9A2D8","#F2D06B","#F09AB0"];
// места украшений: в них не сажаем ростки
const DECO=[[3,96,250,14],[4,0,0,0],[5,78,206,26],[6,304,238,48],[7,96,178,26],[8,0,0,0],[9,312,160,30]];
function gardenSVG(opts={}){
  const ss=opts.season||season(), mode=opts.dark?"dark":"light";
  const P=Object.assign({}, PAL[mode], SPAL[ss][mode]), c=counts(), n=Object.values(c).reduce((a,b)=>a+b,0);
  const lv=opts.level!=null?opts.level:levelOf(n)+1, items=[], winter=ss==="winter";
  const zones=DECO.filter(z=>lv>=z[0]&&z[3]);
  const cap={grass:80, flower:40, tree:14, bush:24, stone:24, fly:12, lamp:12, star:30};
  Object.keys(cap).forEach((k,ki)=>{ const m=Math.min(c[k],cap[k]);
    for(let i=0;i<m;i++){ const r=rng((ki+1)*1000+i*7+3);
      if(k==="star"){ items.push({k, x:15+r()*330, y:12+r()*70, s:1}); continue; }
      if(k==="fly"){ if(winter) continue; items.push({k, x:30+r()*300, y:110+r()*70, s:1, c:FL[i%FL.length]}); continue; }
      if(k==="stone"){ const y=262-i*(100/Math.max(cap.stone,1))*.95-r()*4; items.push({k, x:pathX(y)+(r()-.5)*pathW(y)*1.1, y, s:.5+(y-150)/110*.7}); continue; }
      let x,y,t=0; do{ y=152+r()*104; x=8+r()*344; t++; } while((Math.abs(x-pathX(y))<pathW(y)+10 || zones.some(z=>Math.hypot(x-z[1],(y-z[2])*1.4)<z[3])) && t<30);
      items.push({k, x, y, s:(.45+(y-150)/110*.75)*1.35, c:FL[(i+ki)%FL.length], v:r()});
    }
  });
  // украшения уровней — тоже предметы сада, чтобы правильно перекрываться по глубине
  const sc = y => (.45+(y-150)/110*.75)*1.35;
  if(lv>=3) items.push({k:"sign", x:96, y:250, s:sc(250)});
  if(lv>=4) items.push({k:"fence", x:0, y:256, s:1});
  if(lv>=5) items.push({k:"bench", x:78, y:206, s:sc(206)});
  if(lv>=6) items.push({k:"pond", x:304, y:238, s:sc(238)});
  if(lv>=7) items.push({k:"swing", x:96, y:178, s:sc(178)});
  if(lv>=8){ const y=232; items.push({k:"arch", x:pathX(y), y, s:sc(y)}); }
  if(lv>=9) items.push({k:"gazebo", x:312, y:160, s:sc(160)});
  items.sort((a,b)=>a.y-b.y);
  const snow=(x,y,rx,ry)=>winter?`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="#fff" opacity=".92"/>`:"";
  const draw=it=>{ const {x,y}=it, s=it.s; switch(it.k){
    case "grass": return `<path d="M${x} ${y}q-1.5 ${-6*s} ${-3*s} ${-9*s}M${x} ${y}q.5 ${-7*s} ${2.5*s} ${-11*s}M${x} ${y}q1.5 ${-5*s} ${4*s} ${-7*s}" stroke="${P.grass}" stroke-width="${1.1*s+.3}" fill="none" stroke-linecap="round"/>`;
    case "flower": { const h=14*s, r=3.2*s; let pet=""; for(let k=0;k<5;k++){ const a=k*1.2566+it.v; pet+=`<circle cx="${(x+Math.cos(a)*r*1.1).toFixed(1)}" cy="${(y-h+Math.sin(a)*r*1.1).toFixed(1)}" r="${r.toFixed(1)}" fill="${it.c}"/>`; }
      return `<path d="M${x} ${y}q${2*s} ${-h/2} 0 ${-h}" stroke="${P.leaf2}" stroke-width="${1.2*s}" fill="none"/><ellipse cx="${x+3*s}" cy="${y-h*.4}" rx="${3*s}" ry="${1.4*s}" fill="${P.leaf}" transform="rotate(-30 ${x+3*s} ${y-h*.4})"/>${pet}<circle cx="${x}" cy="${y-h}" r="${r*.7}" fill="#FFE7A8"/>${snow(x,y-h-r*.9,r*1.4,r*.55)}`; }
    case "tree": { const h=46*s, r=17*s;
      const fruit = ss==="spring" ? (it.v>.25?"#F6C1D0":"") : ss==="autumn" ? (it.v>.4?"#E9783A":"") : ss==="winter" ? "" : (it.v>.5?"#E58FA0":"");
      return `<rect x="${x-2.2*s}" y="${y-h*.55}" width="${4.4*s}" height="${h*.55}" rx="${2*s}" fill="${P.trunk}"/><circle cx="${x}" cy="${y-h*.62}" r="${r}" fill="${P.leaf2}"/><circle cx="${x-r*.55}" cy="${y-h*.5}" r="${r*.72}" fill="${P.leaf}"/><circle cx="${x+r*.5}" cy="${y-h*.72}" r="${r*.62}" fill="${P.leaf}"/>${fruit?`<circle cx="${x+r*.3}" cy="${y-h*.55}" r="${2.2*s}" fill="${fruit}"/><circle cx="${x-r*.4}" cy="${y-h*.7}" r="${2.2*s}" fill="${fruit}"/>${ss==="spring"?`<circle cx="${x+r*.1}" cy="${y-h*.86}" r="${2.2*s}" fill="${fruit}"/><circle cx="${x-r*.75}" cy="${y-h*.48}" r="${2*s}" fill="${fruit}"/>`:""}`:""}${snow(x,y-h*.62-r*.72,r*.8,r*.32)}${snow(x-r*.6,y-h*.5-r*.55,r*.45,r*.2)}`; }
    case "bush": return `<ellipse cx="${x}" cy="${y-5*s}" rx="${11*s}" ry="${7*s}" fill="${P.leaf}"/><ellipse cx="${x-5*s}" cy="${y-8*s}" rx="${6*s}" ry="${5*s}" fill="${P.leaf2}"/><ellipse cx="${x+5*s}" cy="${y-9*s}" rx="${5.5*s}" ry="${4.5*s}" fill="${P.leaf2}"/>${snow(x,y-11*s,8*s,2.6*s)}`;
    case "stone": return `<ellipse cx="${x}" cy="${y}" rx="${5.5*s+1}" ry="${2.6*s+.6}" fill="${P.stone}"/><ellipse cx="${x-1.2*s}" cy="${y-.8*s}" rx="${2.4*s}" ry="${1*s}" fill="#fff" opacity=".25"/>`;
    case "fly": return `<g transform="translate(${x} ${y})"><ellipse cx="-3" cy="-1" rx="3.4" ry="2.4" fill="${it.c}" transform="rotate(-25)"/><ellipse cx="3" cy="-1" rx="3.4" ry="2.4" fill="${it.c}" transform="rotate(25)"/><ellipse cx="-2.4" cy="2.2" rx="2" ry="1.5" fill="${it.c}" opacity=".8"/><ellipse cx="2.4" cy="2.2" rx="2" ry="1.5" fill="${it.c}" opacity=".8"/><rect x="-.5" y="-3" width="1" height="6" rx=".5" fill="#5A4A42"/></g>`;
    case "lamp": { const h=22*s; return `<circle cx="${x}" cy="${y-h}" r="${9*s}" fill="#FFD58A" opacity=".28"/><rect x="${x-.8*s}" y="${y-h}" width="${1.6*s}" height="${h}" fill="#6B5244"/><rect x="${x-2.6*s}" y="${y-h-3.5*s}" width="${5.2*s}" height="${5.6*s}" rx="${1.2*s}" fill="#FFD58A"/>`; }
    case "star": return `<circle cx="${x}" cy="${y}" r="3.6" fill="#FFE3A8" opacity=".35"/><circle cx="${x}" cy="${y}" r="1.4" fill="#FFF3D2"/>`;
    case "sign": return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-1.4" y="-16" width="2.8" height="16" fill="${P.trunk}"/><rect x="-15" y="-24" width="30" height="11" rx="2.5" fill="${P.wood}"/><text x="0" y="-16.2" text-anchor="middle" font-size="6" font-weight="700" fill="#FFF6EA" font-family="Onest, system-ui, sans-serif">Наш сад</text>${winter?'<rect x="-15" y="-25.5" width="30" height="2.4" rx="1.2" fill="#fff"/>':""}</g>`;
    case "fence": { let f=""; const post=(px,py,k)=>`<rect x="${(px-1.3*k).toFixed(1)}" y="${(py-11*k).toFixed(1)}" width="${(2.6*k).toFixed(1)}" height="${(11*k).toFixed(1)}" rx="${k}" fill="${P.wood}"/>${winter?`<ellipse cx="${px.toFixed(1)}" cy="${(py-11*k).toFixed(1)}" rx="${(1.8*k).toFixed(1)}" ry="${(.9*k).toFixed(1)}" fill="#fff"/>`:""}`;
      const g=pathX(256), w=pathW(256)+6;
      for(const [a,b] of [[0,g-w],[g+w,360]]){ const k=1.15; for(let px=a+5;px<b-2;px+=11) f+=post(px,258,k); f+=`<rect x="${a}" y="${(258-8*k).toFixed(1)}" width="${(b-a).toFixed(1)}" height="${(1.8*k).toFixed(1)}" fill="${P.wood}"/><rect x="${a}" y="${(258-4*k).toFixed(1)}" width="${(b-a).toFixed(1)}" height="${(1.8*k).toFixed(1)}" fill="${P.wood}"/>`; }
      return f; }
    case "bench": return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-13" y="-8" width="26" height="3" rx="1.2" fill="${P.wood}"/><rect x="-13" y="-15" width="26" height="2.6" rx="1.2" fill="${P.wood}"/><rect x="-13" y="-11.4" width="26" height="2.2" rx="1" fill="${P.wood}"/><rect x="-11" y="-5" width="2" height="5" fill="${P.trunk}"/><rect x="9" y="-5" width="2" height="5" fill="${P.trunk}"/>${winter?'<rect x="-13" y="-9.4" width="26" height="1.8" rx=".9" fill="#fff"/>':""}</g>`;
    case "pond": return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="30" ry="10" fill="${winter?"#DCEBF5":P.water}"/><ellipse cx="0" cy="-1.5" rx="26" ry="7.5" fill="${winter?"#EAF4FA":P.water}" opacity=".7"/>${winter?'<path d="M-14 -2 l9 2 M4 1 l10 -2" stroke="#fff" stroke-width="1.2"/>':`<path d="M-16 -1 q6 -2 12 0 M6 2 q6 -2 11 0" stroke="#fff" stroke-width="1" fill="none" opacity=".7"/><ellipse cx="-12" cy="2" rx="4.5" ry="1.8" fill="${P.leaf}"/><ellipse cx="10" cy="-2" rx="4" ry="1.6" fill="${P.leaf}"/><circle cx="-11" cy="1" r="1.6" fill="#F6B8CB"/>`}<path d="M24 -2 q-1 -10 -3 -14 M27 -1 q1 -11 2 -15" stroke="${P.leaf2}" stroke-width="1.2" fill="none"/></g>`;
    case "swing": return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-15 0 L-11 -30 L-7 0 M7 0 L11 -30 L15 0" stroke="${P.trunk}" stroke-width="2.2" fill="none" stroke-linecap="round"/><rect x="-13" y="-32" width="26" height="2.6" rx="1.2" fill="${P.trunk}"/><path d="M-6 -30 V-9 M6 -30 V-9" stroke="#8B8178" stroke-width=".9"/><rect x="-8" y="-9.5" width="16" height="2.6" rx="1.2" fill="${P.wood}"/>${winter?'<rect x="-13" y="-33.6" width="26" height="1.8" rx=".9" fill="#fff"/>':""}</g>`;
    case "arch": { const w=pathW(y)+9; let roses=""; const rr=rng(77); for(let i=0;i<14;i++){ const a=Math.PI*(i/13), rx=w*Math.cos(a), ry=-22*s-Math.sin(a)*w*.7; roses+=`<circle cx="${(x+rx+(rr()-.5)*2).toFixed(1)}" cy="${(y+ry+(rr()-.5)*2).toFixed(1)}" r="${(1.9*s+.6).toFixed(1)}" fill="${winter?"#fff":i%3?"#E58FA0":"#F6C1D0"}"/>`; }
      return `<path d="M${(x-w).toFixed(1)} ${y} V${(y-22*s).toFixed(1)} A${w.toFixed(1)} ${(w*.7).toFixed(1)} 0 0 1 ${(x+w).toFixed(1)} ${(y-22*s).toFixed(1)} V${y}" stroke="${P.wood}" stroke-width="${(2.2*s).toFixed(1)}" fill="none"/><path d="M${(x-w).toFixed(1)} ${y} V${(y-22*s).toFixed(1)} A${w.toFixed(1)} ${(w*.7).toFixed(1)} 0 0 1 ${(x+w).toFixed(1)} ${(y-22*s).toFixed(1)} V${y}" stroke="${P.leaf2}" stroke-width="${(1*s).toFixed(1)}" stroke-dasharray="2 3" fill="none"/>${roses}`; }
    case "gazebo": return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-20 -26 L0 -40 L20 -26Z" fill="${winter?"#fff":"#C97B6B"}"/><rect x="-18" y="-26" width="36" height="3" fill="${P.wood}"/><rect x="-16" y="-23" width="2.4" height="23" fill="${P.wood}"/><rect x="13.6" y="-23" width="2.4" height="23" fill="${P.wood}"/><rect x="-1.2" y="-23" width="2.4" height="23" fill="${P.wood}" opacity=".7"/><rect x="-18" y="-8" width="36" height="2" fill="${P.wood}"/><rect x="-19" y="-1" width="38" height="2.4" rx="1" fill="${P.trunk}"/></g>`;
  } return ""; };
  const pts=[]; for(let y=262;y>=146;y-=4) pts.push([pathX(y),y,pathW(y)]);
  const pathD=`M${pts.map(p=>`${(p[0]-p[2]).toFixed(1)} ${p[1]}`).join(" L")} L${pts.reverse().map(p=>`${(p[0]+p[2]).toFixed(1)} ${p[1]}`).join(" L")}Z`;
  const id="gd"+(gardenSVG.n=(gardenSVG.n||0)+1), R=rng(4242);
  const rainbow = lv>=10 ? ["#F28B82","#F6B26B","#FFE08A","#9ED38A","#8CC8EC","#B39DDB"].map((c,i)=>`<path d="M${40+i*5} 150 A${140-i*5} ${110-i*5} 0 0 1 ${320-i*5} 150" stroke="${c}" stroke-width="5" fill="none" opacity="${opts.dark?.28:.5}"/>`).join("") : "";
  let garland="", sky="";
  if(lv>=11){ garland=`<path d="M0 96 Q90 122 180 100 T360 98" stroke="#6B5244" stroke-width=".8" fill="none"/>`; const q=(a,b,c,t)=>(1-t)*(1-t)*a+2*(1-t)*t*b+t*t*c;
    for(let i=0;i<19;i++){ const u=i/18*2, sg=u<1?[[0,96],[90,122],[180,100]]:[[180,100],[270,78],[360,98]], t=u<1?u:u-1, xx=q(sg[0][0],sg[1][0],sg[2][0],t), y2=q(sg[0][1],sg[1][1],sg[2][1],t); garland+=`<circle cx="${xx.toFixed(1)}" cy="${(y2+2.4).toFixed(1)}" r="${opts.dark?2.6:2.2}" fill="${["#FFD58A","#F6B8CB","#B9E0F2","#C9F2B0"][i%4]}"${opts.dark?' opacity=".95"':""}/>`; }
    for(let i=0;i<14;i++) sky+=`<circle cx="${(20+R()*320).toFixed(1)}" cy="${(120+R()*120).toFixed(1)}" r="1.8" fill="#FFE27A" opacity=".8"/>`; }
  if(winter){ for(let i=0;i<40;i++) sky+=`<circle cx="${(R()*360).toFixed(1)}" cy="${(R()*250).toFixed(1)}" r="${(.8+R()*1.4).toFixed(1)}" fill="#fff" opacity="${(.5+R()*.5).toFixed(2)}"/>`; }
  if(ss==="autumn"){ for(let i=0;i<14;i++){ const xx=R()*360, yy=40+R()*190, a=R()*180; sky+=`<ellipse cx="${xx.toFixed(1)}" cy="${yy.toFixed(1)}" rx="2.8" ry="1.3" fill="${R()<.5?"#E0A458":"#C9773F"}" transform="rotate(${a.toFixed(0)} ${xx.toFixed(1)} ${yy.toFixed(1)})"/>`; } }
  if(ss==="spring"){ for(let i=0;i<10;i++){ sky+=`<circle cx="${(R()*360).toFixed(1)}" cy="${(60+R()*170).toFixed(1)}" r="1.6" fill="#F6C1D0" opacity=".9"/>`; } }
  return `<svg viewBox="0 0 360 260" ${opts.xmlns?'xmlns="http://www.w3.org/2000/svg" width="1080" height="780"':'class="garden-svg" role="img" aria-label="Наш сад, уровень '+lv+'"'} ${opts.slice?'preserveAspectRatio="xMidYMax slice"':""}>
    <defs><linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.sky1}"/><stop offset="1" stop-color="${P.sky2}"/></linearGradient>
    <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.g1}"/><stop offset="1" stop-color="${P.g2}"/></linearGradient>
    <radialGradient id="${id}r"><stop offset="0" stop-color="#FFF3C8" stop-opacity=".55"/><stop offset="1" stop-color="#FFF3C8" stop-opacity="0"/></radialGradient></defs>
    <rect width="360" height="260" fill="url(#${id}s)"/>
    <circle cx="292" cy="58" r="22" fill="${P.sun}" opacity=".9"/>
    ${rainbow}
    <path d="M0 132 Q60 98 130 122 T260 112 T360 120 V170 H0Z" fill="${P.hill1}"/>
    <path d="M0 150 Q90 126 180 142 T360 138 V260 H0Z" fill="${P.hill2}"/>
    <path d="M0 158 Q100 140 190 152 T360 150 V260 H0Z" fill="url(#${id}g)"/>
    ${lv>=11?`<ellipse cx="180" cy="190" rx="200" ry="90" fill="url(#${id}r)"/>`:""}
    <path d="${pathD}" fill="${P.path}"/>
    ${items.map(draw).join("")}
    ${garland}${sky}
  </svg>`;
}
const dark = () => matchMedia("(prefers-color-scheme: dark)").matches && document.documentElement.dataset.theme!=="light" || document.documentElement.dataset.theme==="dark";

/* ---------- Карточка на «Сегодня» и экран сада ---------- */
function card(){
  const n=total(), li=levelInfo();
  return `<button class="card garden-card" data-go="lovegd"><span class="garden-mini">${gardenSVG({dark:dark(), slice:true})}</span>
    <span class="row" style="justify-content:space-between;width:100%"><span class="stack-s" style="gap:2px"><span class="label">Наш сад · уровень ${li.lv} из ${LEVELS.length}</span><span class="small muted">${n?`${li.name} · ${n} ${plural(n,"росток","ростка","ростков")} из общих дел`:"Сделайте что-то вместе — и здесь появится первый росток"}</span></span><span class="chev">›</span></span></button>`;
}
function vGarden(){
  const c=counts(), ms=milestones(), got=ms.filter(m=>m[1]).length, li=levelInfo(), ss=season(), own=SEAS[L().gs];
  return `${back()}
  <div class="stack-s"><h1>Наш сад</h1><p class="muted small">Каждое общее дело что-то сажает. Сад только растёт и никогда не вянет — даже если вы делаете паузу.</p></div>
  <div class="garden-big">${gardenSVG({dark:dark()})}</div>
  <div class="row g-seas" role="group" aria-label="Время года в саду"><button class="chip" data-gs="" aria-pressed="${!own}">Как за окном</button>${Object.entries(SEAS).map(([k,t])=>`<button class="chip" data-gs="${k}" aria-pressed="${own&&ss===k}">${t}</button>`).join("")}</div>
  <div class="card"><div class="row" style="justify-content:space-between"><span class="stack-s" style="gap:2px"><span class="label">Уровень ${li.lv} из ${LEVELS.length}</span><strong>${LEVELS[li.i][1]}</strong></span><span class="tag">${li.n} ${plural(li.n,"росток","ростка","ростков")}</span></div>
    <div class="progress"><i style="width:${li.pct}%"></i></div>
    <p class="small muted">${li.next?`До уровня «${li.next[1]}»: ${li.left} ${plural(li.left,"росток","ростка","ростков")}. ${li.next[2]}.`:"Максимальный уровень. Ваш сад расцвёл полностью!"}</p>
    <details class="more"><summary>Все ${LEVELS.length} уровней</summary><ol class="mt-lv">${LEVELS.map(([v,t,d],i)=>`<li class="${i<=li.i?"on":""}${i===li.i?" cur":""}"><b>${i<li.i||(i===li.i&&!li.next)?"✓":i+1}</b><span><strong>${t}</strong><span class="small muted">${v} ${plural(v,"росток","ростка","ростков")} · ${d}</span></span></li>`).join("")}</ol></details></div>
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
  const n=total(), li=levelInfo(); x.fillStyle="#2B2023"; x.font=`700 64px ${f}`; x.fillText(`Уровень ${li.lv} · ${li.name}`, W/2, 1320);
  x.fillStyle="#6B5659"; x.font=`500 44px ${f}`; x.fillText(`${n} ${plural(n,"росток","ростка","ростков")} из общих дел`, W/2, 1400);
  x.fillStyle="#A84B5A"; x.font=`600 40px ${f}`; x.fillText((PSY.siteUrl||"").replace(/^https?:\/\//,"").replace(/\/$/,""), W/2, 1760);
  cv.toBlob(b=>showStory(b),"image/png");
}
function bindGarden(){
  const s=$("#gShare"); if(s) s.onclick=gardenStory;
  $$("[data-gs]").forEach(b=>b.onclick=()=>{ const l=L(); if(b.dataset.gs) l.gs=b.dataset.gs; else delete l.gs; save(); render(); });
}

VIEWS.lovegd=[vGarden,bindGarden]; TAB_OF.lovegd="practices"; window.LOVE.ROOM_ROUTES.push("lovegd");
window.LOVE.garden={card, gardenSVG, counts, total, levelInfo, LEVELS, milestones};
})();
