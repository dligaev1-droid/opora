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
  ["leaves","Листья на воде","Напишите мысль, которая крутится в голове, положите её на лист и смотрите, как его уносит. Не спорьте с мыслью — просто отпустите."],
  ["chimes","Колокольчики","Проведите пальцем по трубкам — они качаются и звенят. Иногда их тронет ветер."],
  ["lava","Лава-лампа","Просто смотрите, как медленно плывут капли, и дышите в их ритме. Коснитесь — капля сменит направление."],
  ["mandala","Мандала","Выберите цвет и раскрашивайте узор. Раскрашивание мандал помогает снизить тревогу: внимание собирается в одной точке."],
  ["spin","Спиннер","Раскрутите спиннер пальцем и делайте медленный выдох, пока он не остановится."],
  ["jar","Банка спокойствия","Встряхните банку и смотрите, как оседают блёстки. Дышите спокойно — к концу и мысли станут тише."]
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
const buzz = ms => { if(window.HAP) return HAP(ms); try{ if(navigator.vibrate && !matchMedia("(prefers-reduced-motion: reduce)").matches) navigator.vibrate(ms); }catch(e){} };

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
// 10 спокойных видов из колоды МАК; при каждом заходе — следующий
const MIST_VIEWS=["05","03","15","30","09","23","52","02","24","10"];
function bindMist(cv){
  const G=setup(cv), fog=document.createElement("canvas"); fog.width=cv.width; fog.height=cv.height; const f=fog.getContext("2d"); f.setTransform(G.d,0,0,G.d,0,0);
  const fogCol = () => dark()?"rgba(58,68,82,":"rgba(226,233,238,";
  const fill = a => { f.globalCompositeOperation="source-over"; f.fillStyle=fogCol()+a+")"; f.fillRect(0,0,G.w,G.h); };
  fill(.93); f.fillStyle="rgba(255,255,255,.18)"; for(let i=0;i<260;i++){ f.beginPath(); f.arc(Math.random()*G.w,Math.random()*G.h,Math.random()*1.6+.3,0,7); f.fill(); }
  const img=new Image(); let ok=false; img.onload=()=>ok=true; img.src=`cards/${MIST_VIEWS[(C().mi||0)%MIST_VIEWS.length]}.webp`;
  const wipe=(p,prev)=>{ f.globalCompositeOperation="destination-out"; const steps=prev?Math.max(1,Math.ceil(Math.hypot(p[0]-prev[0],p[1]-prev[1])/6)):1;
    for(let k=0;k<steps;k++){ const q=prev?[prev[0]+(p[0]-prev[0])*k/steps, prev[1]+(p[1]-prev[1])*k/steps]:p; const g=f.createRadialGradient(q[0],q[1],0,q[0],q[1],30); g.addColorStop(0,"rgba(0,0,0,.9)"); g.addColorStop(1,"rgba(0,0,0,0)"); f.fillStyle=g; f.beginPath(); f.arc(q[0],q[1],30,0,7); f.fill(); } };
  let wv=0; drag(cv,(p,prev)=>{ wipe(p,prev); const n=performance.now(); if(n-wv>140){ wv=n; buzz(4); } });
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
  };
  const drawStones = () => stones.forEach(([sx,sy,rx,ry])=>{ x.fillStyle="rgba(60,50,40,.18)"; x.beginPath(); x.ellipse(sx+3,sy+5,rx,ry*.8,0,0,7); x.fill();
    const g=x.createRadialGradient(sx-rx*.3,sy-ry*.4,2,sx,sy,rx); g.addColorStop(0,"#A8A39B"); g.addColorStop(1,"#6E6A64"); x.fillStyle=g; x.beginPath(); x.ellipse(sx,sy,rx,ry,0,0,7); x.fill(); });
  base(); drawStones();
  let sv=0, sd=0; drag(cv,(p,prev)=>{ if(!prev) return; const dx=p[0]-prev[0], dy=p[1]-prev[1], L=Math.hypot(dx,dy); if(L<1.5) return; const nx=-dy/L, ny=dx/L;
    sd+=L; if(sd>26){ sd=0; const n=performance.now(); if(n-sv>90){ sv=n; buzz(5); } }
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

/* ---------- колокол: неровные обертоны, как у металлической трубки ---------- */
function bell(freq, vol=.07, dur=4){ const c=A(); if(!c) return; const t=c.currentTime, g=c.createGain(); g.connect(c.destination);
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.008); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  [[1,1],[2.76,.32],[5.4,.1],[8.93,.03]].forEach(([m,a],k)=>{ const o=c.createOscillator(), pg=c.createGain(); o.type="sine"; o.frequency.value=freq*m;
    pg.gain.setValueAtTime(a,t); if(k) pg.gain.exponentialRampToValueAtTime(.0001,t+dur/(1+k)); o.connect(pg); pg.connect(g); o.start(t); o.stop(t+dur+.05); }); }

/* ---------- 6. Колокольчики ---------- */
function bindChimes(cv){
  const G=setup(cv), N=7, NOTES=[392,440,523.25,587.33,659.25,783.99,880], top=34;
  const T=Array.from({length:N},(_,i)=>({x:G.w*(i+1)/(N+1), len:G.h*(.66-i*.05), th:0, v:0}));
  const strike=(i,dir,s)=>{ const t=T[i]; t.v+=dir*(.6+s*1.4); bell(NOTES[i], .05+.06*s, 4); buzz(8); };
  const tubeX=(t,y)=>t.x+Math.sin(t.th)*(y-top);
  drag(cv,(p,prev,first)=>{
    if(first){ T.forEach((t,i)=>{ if(Math.abs(p[0]-tubeX(t,p[1]))<14 && p[1]>top+16 && p[1]<top+16+t.len) strike(i,Math.random()<.5?-1:1,.5); }); return; }
    const dx=p[0]-prev[0];
    T.forEach((t,i)=>{ const y=(p[1]+prev[1])/2; if(y<top+16||y>top+16+t.len) return; const X=tubeX(t,y);
      if((prev[0]-X)*(p[0]-X)<0) strike(i,Math.sign(dx)||1,Math.min(1,Math.abs(dx)/18)); });
  });
  let prevT=performance.now(), breeze=performance.now();
  run(cv,now=>{ const x=G.x, nt=dark(), dt=Math.min(.05,(now-prevT)/1000); prevT=now;
    if(now-breeze>7000+Math.random()*4000){ breeze=now; const i=Math.floor(Math.random()*N); T[i].v+=(Math.random()-.5)*.5; bell(NOTES[i],.018,3); }
    T.forEach(t=>{ t.v+=(-16*t.th-1.1*t.v)*dt; t.th+=t.v*dt; });
    const g=x.createLinearGradient(0,0,0,G.h); g.addColorStop(0,nt?"#1B2440":"#F3D9C2"); g.addColorStop(1,nt?"#0E1424":"#C9DCEB"); x.fillStyle=g; x.fillRect(0,0,G.w,G.h);
    x.fillStyle=nt?"#5A4636":"#8A6A55"; x.fillRect(G.w*.08,top-8,G.w*.84,12);
    T.forEach(t=>{ const ax=t.x, ay=top+4, bx=ax+Math.sin(t.th)*14, by=ay+Math.cos(t.th)*14;
      x.strokeStyle=nt?"#9AA4B5":"#7A6F66"; x.lineWidth=1; x.beginPath(); x.moveTo(ax,ay); x.lineTo(bx,by); x.stroke();
      x.save(); x.translate(bx,by); x.rotate(-t.th);
      const tg=x.createLinearGradient(-7,0,7,0); tg.addColorStop(0,nt?"#7F8A99":"#A9B3BF"); tg.addColorStop(.45,"#F4F7FA"); tg.addColorStop(1,nt?"#5C6573":"#8995A3");
      x.fillStyle=tg; x.beginPath(); if(x.roundRect) x.roundRect(-7,0,14,t.len,5); else x.rect(-7,0,14,t.len); x.fill(); x.restore(); });
  });
}

/* ---------- 7. Лава-лампа ---------- */
function bindLava(cv){
  const G=setup(cv), W=110, H=Math.max(60,Math.round(110*G.h/G.w)), off=document.createElement("canvas"); off.width=W; off.height=H;
  const o=off.getContext("2d"), im=o.createImageData(W,H);
  const B=Array.from({length:7},()=>({x:14+Math.random()*(W-28), y:Math.random()*H, r:9+Math.random()*8, vy:(Math.random()-.5)*3, ph:Math.random()*6}));
  drag(cv,(p,prev,first)=>{ if(!first) return; const px=p[0]/G.w*W, py=p[1]/G.h*H; let best=null, bd=1e9; B.forEach(b=>{ const d=Math.hypot(b.x-px,b.y-py); if(d<bd){ bd=d; best=b; } });
    if(best){ best.vy+= py>best.y?-4:4; note(196,.05,2.5); buzz(40); } });
  let prevT=performance.now();
  const mix=(a,b,t)=>a+(b-a)*t;
  run(cv,now=>{ const dt=Math.min(.05,(now-prevT)/1000); prevT=now;
    B.forEach(b=>{ const heat=(b.y/H-.5); b.vy+=(-heat*2.2)*dt; b.vy*=Math.exp(-dt*.25); b.vy=Math.max(-4,Math.min(4,b.vy)); b.y+=b.vy*dt*3; b.x+=Math.sin(now/3000+b.ph)*dt*2;
      if(b.y<b.r){ b.y=b.r; b.vy=Math.abs(b.vy)*.3; } if(b.y>H-b.r){ b.y=H-b.r; b.vy=-Math.abs(b.vy)*.3; } b.x=Math.max(b.r,Math.min(W-b.r,b.x)); });
    const d=im.data;
    for(let y=0;y<H;y++){ const ty=y/H; for(let x=0;x<W;x++){ let f=0; for(const b of B){ const dx=x-b.x, dy=y-b.y; f+=b.r*b.r/(dx*dx+dy*dy+1); }
      const t=Math.max(0,Math.min(1,(f-.92)/.16)), i=(y*W+x)*4;
      const br=mix(38,92,ty), bg=mix(16,26,ty), bb=mix(64,74,ty), lr=mix(255,255,ty), lg=mix(170,84,ty), lb=mix(90,122,ty);
      d[i]=mix(br,lr,t); d[i+1]=mix(bg,lg,t); d[i+2]=mix(bb,lb,t); d[i+3]=255; } }
    o.putImageData(im,0,0); const x=G.x; x.imageSmoothingEnabled=true; x.drawImage(off,0,0,G.w,G.h);
    const v=x.createRadialGradient(G.w/2,G.h/2,G.h*.2,G.w/2,G.h/2,G.h*.75); v.addColorStop(0,"rgba(0,0,0,0)"); v.addColorStop(1,"rgba(0,0,0,.35)"); x.fillStyle=v; x.fillRect(0,0,G.w,G.h);
  });
}

/* ---------- 8. Мандала-раскраска ---------- */
const MCOL=["#F4B6C2","#F9D49B","#BFE3B4","#A9D6E8","#C9B8EE","#F6C7A4","#8FC4B0","#E3D9C6"];
let MD=null;
const pol=(r,a)=>[150+r*Math.cos(a),150+r*Math.sin(a)];
const f2=n=>n.toFixed(1);
function petal(r1,r2,a,w){ const [x1,y1]=pol(r1,a),[x2,y2]=pol(r2,a),[c1x,c1y]=pol((r1+r2)/2,a-w),[c2x,c2y]=pol((r1+r2)/2,a+w);
  return `M${f2(x1)} ${f2(y1)} Q${f2(c1x)} ${f2(c1y)} ${f2(x2)} ${f2(y2)} Q${f2(c2x)} ${f2(c2y)} ${f2(x1)} ${f2(y1)}Z`; }
function sector(r1,r2,a1,a2){ const p=(r,a)=>pol(r,a).map(f2).join(" ");
  return `M${p(r1,a1)} L${p(r2,a1)} A${r2} ${r2} 0 0 1 ${p(r2,a2)} L${p(r1,a2)} A${r1} ${r1} 0 0 0 ${p(r1,a1)}Z`; }
function mandala(seed){
  const n=[8,10,12][seed%3], st=Math.PI*2/n, segs=[];
  segs.push(`<circle cx="150" cy="150" r="18"/>`);
  for(let i=0;i<n;i++) segs.push(`<path d="${petal(20,56,i*st,st*.32)}"/>`);
  for(let i=0;i<n*2;i++){ const [x,y]=pol(64,i*st/2); segs.push(`<circle cx="${f2(x)}" cy="${f2(y)}" r="${seed%2?6:7}"/>`); }
  for(let i=0;i<n;i++) segs.push(`<path d="${petal(72,116,(i+.5)*st,st*.34)}"/>`);
  for(let i=0;i<n;i++) segs.push(`<path d="${petal(80,108,i*st,st*.16)}"/>`);
  for(let i=0;i<n*2;i++) segs.push(`<path d="${sector(122,138,i*st/2+.01,(i+1)*st/2-.01)}"/>`);
  return segs;
}
function vMandala(){
  if(!MD) MD={seed:0, f:{}, col:0};
  const segs=mandala(MD.seed);
  return `<div class="mnd-wrap"><svg class="mnd" viewBox="0 0 300 300" role="img" aria-label="Мандала для раскрашивания">${segs.map((s,i)=>s.replace(/^<(\w+)/,`<$1 class="mseg" data-ms="${i}" style="fill:${MD.f[i]||"var(--surface)"}"`)).join("")}</svg>
    <div class="mnd-pal" role="group" aria-label="Цвет">${MCOL.map((c,i)=>`<button class="mcol${i===MD.col?" on":""}" data-mc="${i}" style="background:${c}" aria-label="Цвет ${i+1}"></button>`).join("")}</div></div>`;
}
function bindMandala(){
  const svg=$(".mnd"); if(!svg) return;
  $$("[data-ms]").forEach(el=>el.addEventListener("pointerdown",e=>{ e.preventDefault(); touched(); const i=+el.dataset.ms, c=MCOL[MD.col]; MD.f[i]=c; el.style.fill=c; note(PENTA[i%PENTA.length]/2,.04,1.6); buzz(6); }));
  $$("[data-mc]").forEach(b=>b.onclick=()=>{ MD.col=+b.dataset.mc; $$("[data-mc]").forEach(x=>x.classList.toggle("on",x===b)); });
  const nw=$("#mndNew"); if(nw) nw.onclick=()=>{ MD.seed++; MD.f={}; render(); };
  const cl=$("#mndClr"); if(cl) cl.onclick=()=>{ MD.f={}; render(); };
}

/* ---------- 9. Спиннер ---------- */
function bindSpin(cv){
  const G=setup(cv), cx=G.w/2, cy=G.h/2, R=Math.min(G.w,G.h)*.3; let a=0, w=0, peak=0, lastT=performance.now(), hint="Раскрутите пальцем";
  let pa=null, pt0=0;
  cv.addEventListener("pointerdown",e=>{ const p=pt(cv,e); pa=Math.atan2(p[1]-cy,p[0]-cx); pt0=performance.now(); try{ cv.setPointerCapture(e.pointerId); }catch(_){} touched(); e.preventDefault(); });
  cv.addEventListener("pointermove",e=>{ if(pa==null) return; const p=pt(cv,e), na=Math.atan2(p[1]-cy,p[0]-cx), n=performance.now(); let d=na-pa; if(d>Math.PI) d-=Math.PI*2; if(d<-Math.PI) d+=Math.PI*2;
    const dt=Math.max(.008,(n-pt0)/1000); w=w*.6+(d/dt)*.4; w=Math.max(-40,Math.min(40,w)); a+=d; pa=na; pt0=n; });
  const up=()=>{ pa=null; if(Math.abs(w)>3){ peak=Math.abs(w); hint="Медленный выдох… пока не остановится"; } }; cv.addEventListener("pointerup",up); cv.addEventListener("pointercancel",up);
  run(cv,now=>{ const dt=Math.min(.05,(now-lastT)/1000); lastT=now;
    if(pa==null){ w*=Math.exp(-dt*.13); const s=Math.sign(w); w-=s*Math.min(Math.abs(w),.06*dt*10); a+=w*dt;
      if(peak>3 && Math.abs(w)<.05){ peak=0; w=0; hint="Остановился. Можно ещё раз"; bell(523.25,.05,3); buzz([30,60,30]); } }
    const seg=Math.floor(a/(Math.PI*2/3)); if(seg!==bindSpin.seg){ bindSpin.seg=seg; if(Math.abs(w)>1.5 && Math.abs(w)<30) buzz(Math.abs(w)>12?4:7); }
    const x=G.x, nt=dark(); x.fillStyle=nt?"#141B26":"#EEF2F6"; x.fillRect(0,0,G.w,G.h);
    const ghosts=Math.min(5,Math.floor(Math.abs(w)/6));
    for(let gI=ghosts;gI>=0;gI--){ x.save(); x.globalAlpha=gI?.12:1; x.translate(cx,cy); x.rotate(a-gI*w*.012);
      for(let k=0;k<3;k++){ x.save(); x.rotate(k*Math.PI*2/3); x.translate(0,-R*.62);
        const gg=x.createRadialGradient(-6,-6,2,0,0,R*.36); gg.addColorStop(0,"#B9D8F5"); gg.addColorStop(1,"#3F7FBF"); x.fillStyle=gg; x.beginPath(); x.arc(0,0,R*.36,0,7); x.fill();
        x.fillStyle=nt?"#1C2533":"#DDE6EF"; x.beginPath(); x.arc(0,0,R*.16,0,7); x.fill(); x.restore(); }
      x.fillStyle="#3F7FBF"; x.beginPath(); for(let k=0;k<3;k++){ const ang=k*Math.PI*2/3-Math.PI/2; x.moveTo(0,0); x.arc(0,0,R*.5,ang-.45,ang+.45); } x.fill();
      const cg=x.createRadialGradient(-4,-4,2,0,0,R*.22); cg.addColorStop(0,"#FFFFFF"); cg.addColorStop(1,"#9FB2C6"); x.fillStyle=cg; x.beginPath(); x.arc(0,0,R*.22,0,7); x.fill(); x.restore(); }
    x.fillStyle=nt?"#C9D4E2":"#5B6573"; x.font="500 13px Onest, system-ui, sans-serif"; x.textAlign="center"; x.fillText(hint,cx,G.h-18);
  });
}

/* ---------- 10. Банка спокойствия ---------- */
function bindJar(cv){
  const G=setup(cv), J={x:G.w*.2, y:G.h*.1, w:G.w*.6, h:G.h*.74}, cols=["#F6D365","#F2A7C0","#B9A7F2","#9FD6E8","#FFFFFF"];
  const P=Array.from({length:240},()=>({x:J.x+10+Math.random()*(J.w-20), y:J.y+J.h-6-Math.random()*26, vx:0, vy:0, c:cols[Math.floor(Math.random()*cols.length)], s:2+Math.random()*2.6, ph:Math.random()*6}));
  let lastSnd=0, hint="Встряхните банку пальцем";
  drag(cv,(p,prev)=>{ const dx=prev?p[0]-prev[0]:0, dy=prev?p[1]-prev[1]:-30, mcx=J.x+J.w/2, mcy=J.y+J.h/2;
    P.forEach(q=>{ q.vx+=dx*(.8+Math.random()*.6)+(Math.random()-.5)*60 - (q.y-mcy)*.25; q.vy+=dy*(.8+Math.random()*.6)-Math.random()*90 + (q.x-mcx)*.25; });
    hint="Смотрите, как блёстки оседают. Мысли тоже оседают, если им не мешать";
    const n=performance.now(); if(n-lastSnd>350){ lastSnd=n; buzz([10,30,10,30,10]); bell([1046.5,1174.66,1318.5,1567.98][Math.floor(Math.random()*4)],.02,2.2); } });
  let lastT=performance.now();
  run(cv,now=>{ const dt=Math.min(.05,(now-lastT)/1000); lastT=now; const x=G.x, nt=dark();
    P.forEach(q=>{ q.vy+=14*dt; const k=Math.exp(-dt*1.1); q.vx*=k; q.vy*=k; q.x+=q.vx*dt; q.y+=q.vy*dt;
      if(q.x<J.x+6){ q.x=J.x+6; q.vx*=-.4; } if(q.x>J.x+J.w-6){ q.x=J.x+J.w-6; q.vx*=-.4; }
      if(q.y<J.y+14){ q.y=J.y+14; q.vy*=-.3; } if(q.y>J.y+J.h-5){ q.y=J.y+J.h-5; q.vy=0; q.vx*=.8; } });
    const g=x.createLinearGradient(0,0,0,G.h); g.addColorStop(0,nt?"#151A2A":"#EDE7F6"); g.addColorStop(1,nt?"#0C1020":"#D8E6F2"); x.fillStyle=g; x.fillRect(0,0,G.w,G.h);
    x.fillStyle=nt?"rgba(90,120,180,.22)":"rgba(160,190,230,.35)"; x.beginPath(); if(x.roundRect) x.roundRect(J.x,J.y,J.w,J.h,26); else x.rect(J.x,J.y,J.w,J.h); x.fill();
    x.fillStyle=nt?"#3A2E25":"#B98A62"; x.beginPath(); if(x.roundRect) x.roundRect(J.x+J.w*.12,J.y-16,J.w*.76,18,6); else x.rect(J.x+J.w*.12,J.y-16,J.w*.76,18); x.fill();
    P.forEach(q=>{ const tw=.55+.45*Math.sin(now/400+q.ph); x.globalAlpha=tw; x.fillStyle=q.c; x.beginPath(); x.arc(q.x,q.y,q.s/2+.4,0,7); x.fill(); }); x.globalAlpha=1;
    x.strokeStyle="rgba(255,255,255,.7)"; x.lineWidth=1.5; x.beginPath(); if(x.roundRect) x.roundRect(J.x,J.y,J.w,J.h,26); else x.rect(J.x,J.y,J.w,J.h); x.stroke();
    x.strokeStyle="rgba(255,255,255,.5)"; x.lineWidth=4; x.beginPath(); x.moveTo(J.x+14,J.y+30); x.lineTo(J.x+14,J.y+J.h*.5); x.stroke();
    x.fillStyle=nt?"#C9D4E2":"#5B6573"; x.font="500 12.5px Onest, system-ui, sans-serif"; x.textAlign="center";
    const words=hint.split(" "); let line="", ly=G.h-10-(hint.length>40?14:0); const lines=[]; words.forEach(w0=>{ const t=line?line+" "+w0:w0; if(x.measureText(t).width>G.w-30){ lines.push(line); line=w0; } else line=t; }); lines.push(line);
    lines.forEach((l,k)=>x.fillText(l,G.w/2,ly+k*15));
  });
}

/* ---------- экран ---------- */
function vCalm(){
  const c=C(), m=MODES.find(x=>x[0]===c.mode)||MODES[0], from=prevRoute==="sos"?["sos","Быстрая помощь"]:["practices","Практики"];
  let stage="";
  if(m[0]==="pop") stage=vPop();
  else if(m[0]==="mandala") stage=vMandala();
  else stage=`<canvas class="calm-cv" id="calmCv" role="img" aria-label="${m[1]}"></canvas>`;
  const extra = m[0]==="pop" ? `<label class="row calm-sw"><input type="checkbox" id="popBr"${c.breath?" checked":""}> <span class="small">С подсказкой дыхания: вдох 4 секунды, на выдохе — нажать</span></label>`
    : m[0]==="mist" ? `<button class="btn quiet" id="mistNext">Другой вид</button>`
    : m[0]==="mandala" ? `<div class="row"><button class="btn quiet" id="mndNew">Новый узор</button><button class="btn quiet" id="mndClr">Очистить</button></div>`
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
  $$("[data-cm]").forEach(b=>b.onclick=()=>{ if(c.mode===b.dataset.cm) return; c.mode=b.dataset.cm; if(c.mode==="mist") c.mi=((c.mi||0)+1)%MIST_VIEWS.length; save(); render(); });
  const sn=$("#calmSnd"); if(sn) sn.onclick=()=>{ c.snd=!c.snd; save(); sn.textContent=c.snd?"Звук: вкл":"Звук: выкл"; };
  const dn=$("#calmDone"); if(dn) dn.onclick=()=>{ touched(); buzz([40,60,40]); reliefFinish("calm"); };
  const mn=$("#mistNext"); if(mn) mn.onclick=()=>{ c.mi=((c.mi||0)+1)%MIST_VIEWS.length; save(); render(); };
  const br=$("#popBr"); if(br) br.onchange=()=>{ c.breath=br.checked; save(); PB&&clearInterval(PB.iv); render(); };
  cancelAnimationFrame(loop);
  if(c.mode==="pop") bindPop();
  else if(c.mode==="mandala") bindMandala();
  else { const cv=$("#calmCv"); if(!cv) return; requestAnimationFrame(()=>{ if(!cv.isConnected) return; const fn={ripple:bindRipple, mist:bindMist, sand:bindSand, leaves:bindLeaves, chimes:bindChimes, lava:bindLava, spin:bindSpin, jar:bindJar}[c.mode]; if(fn) fn(cv); }); }
}
VIEWS.calm=[vCalm,bindCalm]; TAB_OF.calm="practices";

/* ---------- входы: «Практики» и SOS ---------- */
const entry = () => `<button class="banner card" data-go="calm"><span class="bi" style="background:var(--accent-soft);color:var(--accent)">${ico("hand",20)}</span><span class="bt"><strong>Антистресс</strong><span class="small muted">10 спокойных игр: пупырка, мандала, колокольчики, банка спокойствия…</span></span><span class="chev">›</span></button>`;
const vP0=VIEWS.practices[0];
VIEWS.practices=[()=>{ const h=vP0(), k=h.indexOf('<button class="banner card" data-go="sounds">'); return k<0?h:h.slice(0,k)+entry()+h.slice(k); }, VIEWS.practices[1]];
const vS0=VIEWS.sos[0];
VIEWS.sos=[()=>{ const t=document.createElement("template"); t.innerHTML=vS0(); const g=t.content.querySelector(".grid2");
  if(g){ const x=document.createElement("template"); x.innerHTML=`<button class="tile" data-go="calm" style="grid-column:1/-1;min-height:0;flex-direction:row;align-items:center;gap:12px"><span class="ico">${ico("hand")}</span><span class="stack-s" style="gap:2px"><strong>Занять руки</strong><span class="small muted">Пупырка, круги на воде — если сложно сосредоточиться</span></span></button>`; g.appendChild(x.content); }
  const d=document.createElement("div"); d.appendChild(t.content.cloneNode(true)); return d.innerHTML; }, VIEWS.sos[1]];
})();
