/* «Антистресс»: 5 спокойных кликеров, чтобы занять руки и снизить напряжение.
   Пупырка (можно с подсказкой дыхания), круги на воде, запотевшее стекло, песочный сад, листья на воде.
   Без рекламы и бесконечных уровней: оценка напряжения до и после, очки — один раз за сессию. */
(function(){
"use strict";
const MODES=[
  ["pop","Пупырка","Лопайте пузырьки. С дыханием — нажимайте на выдохе: так дыхание само замедлится."],
  ["ripple","Круги на воде","Касайтесь воды или ведите пальцем: расходятся круги и звучат мягкие ноты."],
  ["mist","Запотевшее стекло","Протрите стекло пальцем. Стекло медленно запотевает снова — не спешите."],
  ["sand","Песочный сад","Ведите пальцем медленно: грабли оставляют ровные линии. Это японская практика спокойного внимания."],
  ["leaves","Листья на воде","Напишите мысль, которая крутится в голове, положите её на лист и смотрите, как его уносит. Не спорьте с мыслью — просто отпустите."]
];
const C = () => { if(!S.calm || typeof S.calm!=="object") S.calm={mode:"pop", snd:true, breath:true}; return S.calm; };
const dark = () => document.documentElement.getAttribute("data-theme")==="dark" || (!document.documentElement.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);

/* ---------- звук и вибрация ---------- */
let ac=null;
function A(){ if(!C().snd) return null; if(!ac){ const K=window.AudioContext||window.webkitAudioContext; if(!K) return null; try{ ac=new K(); }catch(e){ return null; } } if(ac.state==="suspended") ac.resume().catch(()=>{}); return ac; }
function popSnd(){ const c=A(); if(!c) return; const t=c.currentTime, o=c.createOscillator(), g=c.createGain(), f=c.createBiquadFilter();
  o.type="sine"; o.frequency.setValueAtTime(560+Math.random()*160,t); o.frequency.exponentialRampToValueAtTime(130,t+.09);
  f.type="lowpass"; f.frequency.value=2200; g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.32,t+.004); g.gain.exponentialRampToValueAtTime(.0001,t+.12);
  o.connect(f); f.connect(g); g.connect(c.destination); o.start(t); o.stop(t+.15); }
function note(freq, vol=.1, dur=2.4){ const c=A(); if(!c) return; const t=c.currentTime, g=c.createGain(); g.connect(c.destination);
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.02); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  [[1,1],[2,.18],[3.01,.05]].forEach(([m,a])=>{ const o=c.createOscillator(), pg=c.createGain(); o.type="sine"; o.frequency.value=freq*m; pg.gain.value=a; o.connect(pg); pg.connect(g); o.start(t); o.stop(t+dur+.05); }); }
function plop(){ const c=A(); if(!c) return; const t=c.currentTime, o=c.createOscillator(), g=c.createGain(); o.type="sine";
  o.frequency.setValueAtTime(260,t); o.frequency.exponentialRampToValueAtTime(620,t+.12); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.12,t+.01); g.gain.exponentialRampToValueAtTime(.0001,t+.25);
  o.connect(g); g.connect(c.destination); o.start(t); o.stop(t+.3); }
const PENTA=[261.63,293.66,329.63,392,440,523.25,587.33,659.25,783.99];
const buzz = ms => { try{ if(navigator.vibrate && !matchMedia("(prefers-reduced-motion: reduce)").matches) navigator.vibrate(ms); }catch(e){} };

/* ---------- напряжение до и после (общий механизм упражнений) ---------- */
const touched = () => { if(!RL || RL.ex!=="calm" || RL.stage==="before") reliefStart("calm"); };

/* ---------- холст ---------- */
let loop=null;
function setup(cv){ const r=cv.getBoundingClientRect(), d=Math.min(2,window.devicePixelRatio||1); cv.width=Math.max(1,Math.round(r.width*d)); cv.height=Math.max(1,Math.round(r.height*d)); const x=cv.getContext("2d"); x.setTransform(d,0,0,d,0,0); return {x, w:r.width, h:r.height, d}; }
const pt = (cv,e) => { const r=cv.getBoundingClientRect(); return [e.clientX-r.left, e.clientY-r.top]; };
function run(cv, fn){ cancelAnimationFrame(loop); const step=t=>{ if(!cv.isConnected){ loop=null; return; } fn(t); loop=requestAnimationFrame(step); }; loop=requestAnimationFrame(step); }
function drag(cv, on){ let down=false, last=null;
  cv.addEventListener("pointerdown", e=>{ down=true; last=pt(cv,e); try{ cv.setPointerCapture(e.pointerId); }catch(_){} touched(); on(last, null, true); e.preventDefault(); });
  cv.addEventListener("pointermove", e=>{ if(!down) return; const p=pt(cv,e); on(p, last, false); last=p; });
  const up=()=>{ down=false; last=null; }; cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up); }

/* ---------- 1. Пупырка ---------- */
const PAL=[["#9BD0F0","#5B9BD0"],["#F6B8CB","#D8749A"],["#BDE5AE","#74B865"],["#F8D98A","#E0A93B"],["#D3C3F5","#9B7BD0"],["#A9E2DA","#4FA39A"]];
let PB=null; // {popped:Set, round, target, phase, t0}
function vPop(){
  if(!PB) PB={popped:new Set(), round:0, target:-1, phase:"in", t0:Date.now()};
  const [c1,c2]=PAL[PB.round%PAL.length];
  return `<div class="pop-wrap"><p class="pop-hint" id="popHint" aria-live="polite">${C().breath?"Вдох…":"Нажимайте на пузырьки"}</p>
    <div class="pop-grid" style="--c1:${c1};--c2:${c2}">${Array.from({length:42},(_,i)=>`<button class="pb${PB.popped.has(i)?" on":""}" data-pb="${i}" aria-label="Пузырёк"></button>`).join("")}</div></div>`;
}
function bindPop(){
  const grid=$(".pop-grid"), hint=$("#popHint"); if(!grid) return;
  const btns=[...grid.querySelectorAll("[data-pb]")];
  const free = () => btns.map((b,i)=>i).filter(i=>!PB.popped.has(i));
  const mark = () => btns.forEach((b,i)=>b.classList.toggle("tg", C().breath && i===PB.target && !PB.popped.has(i)));
  const next = () => { const f=free(); PB.target=f.length?f[Math.floor(Math.random()*f.length)]:-1; PB.phase="in"; PB.t0=Date.now(); mark(); };
  const refill = () => { PB.round++; PB.popped=new Set(); const [c1,c2]=PAL[PB.round%PAL.length]; grid.style.setProperty("--c1",c1); grid.style.setProperty("--c2",c2); btns.forEach(b=>b.classList.remove("on")); next(); };
  const doPop = (i,b) => { PB.popped.add(i); b.classList.add("on"); popSnd(); buzz(12);
    if(!free().length){ hint.textContent="Готово! Новый лист пузырьков…"; note(523.25,.08,1.6); setTimeout(()=>{ if(grid.isConnected){ refill(); } },900); return; }
    if(C().breath) next(); };
  btns.forEach((b,i)=>b.onclick=()=>{ if(PB.popped.has(i)) return; touched();
    if(C().breath){ if(i!==PB.target){ hint.textContent="Нажимайте на светящийся пузырёк"; return; } if(PB.phase==="in"){ hint.textContent="Дождитесь выдоха…"; return; } }
    doPop(i,b); });
  if(C().breath){ if(PB.target<0||PB.popped.has(PB.target)) next(); else mark();
    clearInterval(PB.iv); PB.iv=setInterval(()=>{ if(!grid.isConnected){ clearInterval(PB.iv); return; }
      const s=(Date.now()-PB.t0)/1000;
      if(PB.phase==="in"){ if(s>=4){ PB.phase="out"; PB.t0=Date.now(); grid.classList.add("exh"); hint.textContent="Медленный выдох — нажмите на пузырёк"; } else { grid.classList.remove("exh"); hint.textContent=`Вдох… ${Math.ceil(4-s)}`; } }
      else if(s>=6){ PB.phase="in"; PB.t0=Date.now(); grid.classList.remove("exh"); }
    },200); }
}

/* ---------- 2. Круги на воде ---------- */
function bindRipple(cv){
  const G=setup(cv), rings=[]; let lastSpawn=0, amb=0;
  const add=(x,y,soft)=>{ rings.push({x,y,t:performance.now(),a:soft?.35:.8}); if(!soft){ const i=Math.min(PENTA.length-1,Math.max(0,Math.floor(x/G.w*PENTA.length))); note(PENTA[i]*(y<G.h*.4?2:1), y<G.h*.4?.06:.09, 2.8); buzz(6); } };
  drag(cv,(p,prev,first)=>{ const n=performance.now(); if(first||n-lastSpawn>140){ add(p[0],p[1]); lastSpawn=n; } });
  run(cv,t=>{ const x=G.x, nt=dark();
    const g=x.createLinearGradient(0,0,0,G.h); g.addColorStop(0,nt?"#10324A":"#5FB3CF"); g.addColorStop(1,nt?"#071A28":"#21708F"); x.fillStyle=g; x.fillRect(0,0,G.w,G.h);
    x.globalAlpha=.08; x.fillStyle="#fff"; for(let i=0;i<6;i++){ const yy=(i*G.h/6+t*.01)%G.h; x.fillRect(0,yy,G.w,1.2); } x.globalAlpha=1;
    if(t-amb>2600){ amb=t; add(Math.random()*G.w, Math.random()*G.h, true); }
    for(let i=rings.length-1;i>=0;i--){ const r=rings[i], s=(t-r.t)/1000; if(s>4){ rings.splice(i,1); continue; }
      for(let k=0;k<3;k++){ const rr=s*55-k*14; if(rr<=0) continue; x.beginPath(); x.ellipse(r.x,r.y,rr,rr*.62,0,0,Math.PI*2); x.strokeStyle=`rgba(255,255,255,${(r.a*(1-s/4)*(1-k*.28)).toFixed(3)})`; x.lineWidth=2-k*.5; x.stroke(); } }
  });
}

/* ---------- 3. Запотевшее стекло ---------- */
function bindMist(cv){
  const G=setup(cv), fog=document.createElement("canvas"); fog.width=cv.width; fog.height=cv.height; const f=fog.getContext("2d"); f.setTransform(G.d,0,0,G.d,0,0);
  const fogCol = () => dark()?"rgba(58,68,82,":"rgba(226,233,238,";
  const fill = a => { f.globalCompositeOperation="source-over"; f.fillStyle=fogCol()+a+")"; f.fillRect(0,0,G.w,G.h); };
  fill(.93); f.fillStyle="rgba(255,255,255,.18)"; for(let i=0;i<260;i++){ f.beginPath(); f.arc(Math.random()*G.w,Math.random()*G.h,Math.random()*1.6+.3,0,7); f.fill(); }
  const img=new Image(); let ok=false; img.onload=()=>ok=true; img.src="cards/05.webp";
  const wipe=(p,prev)=>{ f.globalCompositeOperation="destination-out"; const steps=prev?Math.max(1,Math.ceil(Math.hypot(p[0]-prev[0],p[1]-prev[1])/6)):1;
    for(let k=0;k<steps;k++){ const q=prev?[prev[0]+(p[0]-prev[0])*k/steps, prev[1]+(p[1]-prev[1])*k/steps]:p; const g=f.createRadialGradient(q[0],q[1],0,q[0],q[1],30); g.addColorStop(0,"rgba(0,0,0,.9)"); g.addColorStop(1,"rgba(0,0,0,0)"); f.fillStyle=g; f.beginPath(); f.arc(q[0],q[1],30,0,7); f.fill(); } };
  drag(cv,(p,prev)=>wipe(p,prev));
  let lastFog=0;
  run(cv,t=>{ const x=G.x;
    if(ok){ const s=Math.max(G.w/img.width,G.h/img.height), w=img.width*s, h=img.height*s; x.drawImage(img,(G.w-w)/2,(G.h-h)/2,w,h); if(dark()){ x.fillStyle="rgba(10,20,35,.35)"; x.fillRect(0,0,G.w,G.h); } }
    else { const g=x.createLinearGradient(0,0,0,G.h); g.addColorStop(0,"#F6C9A8"); g.addColorStop(1,"#7FB6D6"); x.fillStyle=g; x.fillRect(0,0,G.w,G.h); }
    if(t-lastFog>100){ lastFog=t; fill(.005); }
    x.setTransform(1,0,0,1,0,0); x.drawImage(fog,0,0); x.setTransform(G.d,0,0,G.d,0,0);
  });
}

/* ---------- 4. Песочный сад ---------- */
function bindSand(cv){
  const G=setup(cv), x=G.x, R=(a=>()=>(a=(a*16807)%2147483647)/2147483647)(7);
  const stones=[[.24,.3,26,18],[.72,.62,34,22],[.42,.8,18,13]].map(([a,b,rx,ry])=>[a*G.w,b*G.h,rx,ry]);
  const base = () => { x.fillStyle="#E9DCBD"; x.fillRect(0,0,G.w,G.h); for(let i=0;i<1600;i++){ x.fillStyle=R()<.5?"rgba(160,130,90,.10)":"rgba(255,255,255,.22)"; x.fillRect(R()*G.w,R()*G.h,1.2,1.2); }
    // ровные круги вокруг камней, как в японском саду
    stones.forEach(([sx,sy,rx,ry])=>{ for(let k=1;k<=3;k++){ x.beginPath(); x.ellipse(sx,sy,rx+k*9,ry+k*9,0,0,7); x.strokeStyle="rgba(150,120,80,.28)"; x.lineWidth=2; x.stroke(); x.beginPath(); x.ellipse(sx,sy-1,rx+k*9,ry+k*9,0,0,7); x.strokeStyle="rgba(255,250,235,.45)"; x.lineWidth=1; x.stroke(); } }); };
  const drawStones = () => stones.forEach(([sx,sy,rx,ry])=>{ x.fillStyle="rgba(60,50,40,.18)"; x.beginPath(); x.ellipse(sx+3,sy+5,rx,ry*.8,0,0,7); x.fill();
    const g=x.createRadialGradient(sx-rx*.3,sy-ry*.4,2,sx,sy,rx); g.addColorStop(0,"#A8A39B"); g.addColorStop(1,"#6E6A64"); x.fillStyle=g; x.beginPath(); x.ellipse(sx,sy,rx,ry,0,0,7); x.fill(); });
  base(); drawStones();
  drag(cv,(p,prev)=>{ if(!prev) return; const dx=p[0]-prev[0], dy=p[1]-prev[1], L=Math.hypot(dx,dy); if(L<1.5) return; const nx=-dy/L, ny=dx/L;
    for(let k=-1.5;k<=1.5;k++){ const o=k*8; x.lineCap="round";
      x.beginPath(); x.moveTo(prev[0]+nx*o,prev[1]+ny*o); x.lineTo(p[0]+nx*o,p[1]+ny*o); x.strokeStyle="rgba(150,118,78,.38)"; x.lineWidth=2.6; x.stroke();
      x.beginPath(); x.moveTo(prev[0]+nx*(o-1.6),prev[1]+ny*(o-1.6)); x.lineTo(p[0]+nx*(o-1.6),p[1]+ny*(o-1.6)); x.strokeStyle="rgba(255,250,235,.55)"; x.lineWidth=1; x.stroke(); }
    drawStones(); });
  const b=$("#sandReset"); if(b) b.onclick=()=>{ base(); drawStones(); note(392,.06,1.4); };
}

/* ---------- 5. Листья на воде ---------- */
let LV=[];
function bindLeaves(cv){
  const G=setup(cv), cols=["#7FB069","#9BC27E","#E0A458","#C9773F","#B5C96A"];
  const add=(text,y)=>{ LV.push({x:text?95:-40, y:y==null?G.h*(.3+Math.random()*.45):y, t:text||"", c:cols[Math.floor(Math.random()*cols.length)], ph:Math.random()*6, v:18+Math.random()*8, s:text?1:.7}); plop(); buzz(8); };
  if(!cv.dataset.init){ cv.dataset.init=1; LV=LV.filter(l=>l.x<G.w+80); }
  drag(cv,(p,prev,first)=>{ if(first) add("",p[1]); });
  const inp=$("#lvIn"), btn=$("#lvGo");
  const go=()=>{ const v=(inp.value||"").trim(); if(!v){ inp.focus(); return; } touched(); add(v.slice(0,60)); inp.value=""; };
  if(btn) btn.onclick=go; if(inp) inp.onkeydown=e=>{ if(e.key==="Enter"){ e.preventDefault(); go(); } };
  const wrap=(x,txt,max)=>{ const words=txt.split(" "), lines=[]; let cur=""; words.forEach(w=>{ const tt=cur?cur+" "+w:w; if(x.measureText(tt).width>max && cur){ lines.push(cur); cur=w; } else cur=tt; }); if(cur) lines.push(cur); return lines.slice(0,3); };
  let prevT=performance.now();
  run(cv,t=>{ const x=G.x, nt=dark(), dt=Math.min(.05,(t-prevT)/1000); prevT=t;
    const g=x.createLinearGradient(0,0,0,G.h); g.addColorStop(0,nt?"#16384A":"#7CC3D8"); g.addColorStop(1,nt?"#0B2230":"#3E8FAE"); x.fillStyle=g; x.fillRect(0,0,G.w,G.h);
    x.fillStyle=nt?"#1E3B2C":"#7DAA62"; x.fillRect(0,0,G.w,14); x.fillRect(0,G.h-14,G.w,14);
    x.strokeStyle="rgba(255,255,255,.16)"; x.lineWidth=1.4; for(let i=0;i<9;i++){ const yy=24+i*(G.h-48)/8, off=(t*.03+i*57)%(G.w+120)-60; x.beginPath(); x.moveTo(off,yy); x.quadraticCurveTo(off+25,yy-3,off+50,yy); x.stroke(); }
    for(let i=LV.length-1;i>=0;i--){ const l=LV[i]; l.x+=l.v*dt; if(l.x>G.w+90){ LV.splice(i,1); continue; }
      const y=l.y+Math.sin(t/900+l.ph)*4, a=Math.sin(t/1300+l.ph)*.12, W=(l.t?86:36)*l.s, H=(l.t?34:18)*l.s;
      x.save(); x.translate(l.x,y); x.rotate(a);
      x.fillStyle="rgba(0,0,0,.12)"; x.beginPath(); x.ellipse(3,5,W,H,0,0,7); x.fill();
      x.fillStyle=l.c; x.beginPath(); x.moveTo(-W,0); x.quadraticCurveTo(0,-H*1.5,W,0); x.quadraticCurveTo(0,H*1.5,-W,0); x.fill();
      x.strokeStyle="rgba(255,255,255,.35)"; x.lineWidth=1; x.beginPath(); x.moveTo(-W*.9,0); x.lineTo(W*.9,0); x.stroke();
      if(l.t){ x.fillStyle="#1F2A22"; x.font="600 11px Onest, system-ui, sans-serif"; x.textAlign="center"; const ls=wrap(x,l.t,W*1.3); ls.forEach((s,k)=>x.fillText(s,0,(k-(ls.length-1)/2)*12+4)); }
      x.restore(); }
  });
}

/* ---------- экран ---------- */
function vCalm(){
  const c=C(), m=MODES.find(x=>x[0]===c.mode)||MODES[0], from=prevRoute==="sos"?["sos","Быстрая помощь"]:["practices","Практики"];
  let stage="";
  if(m[0]==="pop") stage=vPop();
  else stage=`<canvas class="calm-cv" id="calmCv" role="img" aria-label="${m[1]}"></canvas>`;
  const extra = m[0]==="pop" ? `<label class="row calm-sw"><input type="checkbox" id="popBr"${c.breath?" checked":""}> <span class="small">С подсказкой дыхания: вдох 4 секунды, на выдохе — нажать</span></label>`
    : m[0]==="sand" ? `<button class="btn quiet" id="sandReset">Разровнять песок</button>`
    : m[0]==="leaves" ? `<div class="row" style="flex-wrap:nowrap"><input type="text" id="lvIn" maxlength="60" placeholder="Например: «я не справлюсь»" aria-label="Мысль" style="flex:1;min-width:0"><button class="btn" id="lvGo">На лист</button></div><p class="small muted">Можно просто коснуться воды — появится пустой лист.</p>` : "";
  return `${backBtn(from[0],from[1])}
  <div class="stack-s"><h1>Антистресс</h1><p class="muted">Занять руки и успокоиться за пару минут</p></div>
  <div class="chips calm-modes" role="tablist">${MODES.map(([k,t])=>`<button class="chip" role="tab" data-cm="${k}" aria-pressed="${k===m[0]}">${t}</button>`).join("")}</div>
  ${reliefBefore("calm")}
  <div class="card calm-card"><p class="small">${m[2]}</p><div class="calm-stage">${stage}</div>${extra}
    <div class="row" style="justify-content:space-between"><button class="linkbtn small" id="calmSnd">${c.snd?"Звук: вкл":"Звук: выкл"}</button>${!RL||RL.ex!=="calm"||RL.stage==="before"||RL.stage==="doing"?`<button class="btn quiet" id="calmDone">Мне спокойнее</button>`:""}</div></div>
  ${reliefAfter("calm")}${reliefDone("calm")}
  <p class="small muted">Если тревога сильная и не проходит — откройте <button class="linkbtn small" data-go="sos" style="display:inline">быструю помощь</button>.</p>`;
}
function bindCalm(){
  const c=C();
  bindRelief("calm");
  $$("[data-cm]").forEach(b=>b.onclick=()=>{ if(c.mode===b.dataset.cm) return; c.mode=b.dataset.cm; save(); render(); });
  const sn=$("#calmSnd"); if(sn) sn.onclick=()=>{ c.snd=!c.snd; save(); sn.textContent=c.snd?"Звук: вкл":"Звук: выкл"; };
  const dn=$("#calmDone"); if(dn) dn.onclick=()=>{ touched(); reliefFinish("calm"); };
  const br=$("#popBr"); if(br) br.onchange=()=>{ c.breath=br.checked; save(); PB&&clearInterval(PB.iv); render(); };
  cancelAnimationFrame(loop);
  if(c.mode==="pop") bindPop();
  else { const cv=$("#calmCv"); if(!cv) return; requestAnimationFrame(()=>{ if(!cv.isConnected) return; ({ripple:bindRipple, mist:bindMist, sand:bindSand, leaves:bindLeaves})[c.mode](cv); }); }
}
VIEWS.calm=[vCalm,bindCalm]; TAB_OF.calm="practices";

/* ---------- входы: «Практики» и SOS ---------- */
const entry = () => `<button class="banner card" data-go="calm"><span class="bi" style="background:var(--accent-soft);color:var(--accent)">${ico("hand",20)}</span><span class="bt"><strong>Антистресс</strong><span class="small muted">Пупырка, круги на воде, песочный сад и ещё 2 — занять руки и выдохнуть</span></span><span class="chev">›</span></button>`;
const vP0=VIEWS.practices[0];
VIEWS.practices=[()=>{ const h=vP0(), k=h.indexOf('<button class="banner card" data-go="sounds">'); return k<0?h:h.slice(0,k)+entry()+h.slice(k); }, VIEWS.practices[1]];
const vS0=VIEWS.sos[0];
VIEWS.sos=[()=>{ const t=document.createElement("template"); t.innerHTML=vS0(); const g=t.content.querySelector(".grid2");
  if(g){ const x=document.createElement("template"); x.innerHTML=`<button class="tile" data-go="calm" style="grid-column:1/-1;min-height:0;flex-direction:row;align-items:center;gap:12px"><span class="ico">${ico("hand")}</span><span class="stack-s" style="gap:2px"><strong>Занять руки</strong><span class="small muted">Пупырка, круги на воде — если сложно сосредоточиться</span></span></button>`; g.appendChild(x.content); }
  const d=document.createElement("div"); d.appendChild(t.content.cloneNode(true)); return d.innerHTML; }, VIEWS.sos[1]];
})();
