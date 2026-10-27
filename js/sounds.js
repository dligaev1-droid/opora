/* Звуки: мягкие сигналы в упражнениях и «Звуки для сна».
   Всё синтезируется прямо в браузере (Web Audio), без файлов и без интернета. */
(function(){
"use strict";
let ctx=null, master=null, comp=null, rev=null, cueBus=null;

function st(){ if(!S.snd || typeof S.snd!=="object") S.snd={v:{}, cues:true}; if(!S.snd.v || typeof S.snd.v!=="object") S.snd.v={}; return S.snd; }

function ac(){
  if(!ctx){
    const C=window.AudioContext||window.webkitAudioContext; if(!C) return null;
    try{ ctx=new C(); }catch(e){ return null; }
    comp=ctx.createDynamicsCompressor(); comp.threshold.value=-16; comp.ratio.value=3; comp.connect(ctx.destination);
    master=ctx.createGain(); master.connect(comp);
    rev=ctx.createConvolver(); rev.buffer=impulse(3);
    const rg=ctx.createGain(); rg.gain.value=.3; rev.connect(rg); rg.connect(comp);
    cueBus=ctx.createGain(); cueBus.gain.value=.55; cueBus.connect(comp); cueBus.connect(rev);
  }
  try{ if(navigator.audioSession) navigator.audioSession.type="playback"; }catch(e){}
  if(ctx.state==="suspended") ctx.resume().catch(()=>{});
  return ctx;
}
function impulse(sec){
  const n=Math.floor(ctx.sampleRate*sec), b=ctx.createBuffer(2,n,ctx.sampleRate);
  for(let c=0;c<2;c++){ const d=b.getChannelData(c); for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3.5); }
  return b;
}
function panner(p){ if(ctx.createStereoPanner){ const n=ctx.createStereoPanner(); n.pan.value=p; return n; } return ctx.createGain(); }

/* ---------- Мягкий тон (колокольчик / поющая чаша) ---------- */
const SOFT=[[1,1],[2,.22],[3,.06]];
const BOWL=[[1,1],[1.004,.7],[2.76,.32],[5.4,.1],[8.93,.03]];
function tone(freq, t, o){
  o=Object.assign({dur:2.6, vol:.16, attack:.02, partials:SOFT, bus:cueBus, pan:0}, o||{});
  const g=ctx.createGain(), p=panner(o.pan); g.connect(p); p.connect(o.bus);
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(o.vol,t+o.attack); g.gain.exponentialRampToValueAtTime(.0001,t+o.dur);
  o.partials.forEach(([m,a],k)=>{
    const osc=ctx.createOscillator(), pg=ctx.createGain(); osc.type="sine"; osc.frequency.value=freq*m;
    pg.gain.setValueAtTime(a,t); if(k>1) pg.gain.exponentialRampToValueAtTime(.0001, t+o.dur/(1+k*.6));
    osc.connect(pg); pg.connect(g); osc.start(t); osc.stop(t+o.dur+.1);
  });
}

/* ---------- Сигналы в упражнениях ---------- */
const N={C4:261.63,G4:392,A4:440,C5:523.25,D5:587.33,E5:659.25,G5:783.99,C6:1046.5};
function cue(name, arg){
  if(st().cues===false) return;
  if(!ac()) return;
  const t=ctx.currentTime+.03;
  switch(name){
    case "breath":   // 0 вдох · 1 пауза · 2 выдох · 3 пауза
      if(arg===0) tone(N.C5,t,{dur:3.4,vol:.15,attack:.35});
      else if(arg===1) tone(N.G5,t,{dur:2,vol:.06});
      else if(arg===2) tone(N.G4,t,{dur:3.8,vol:.16,attack:.35});
      else tone(N.D5,t,{dur:1.8,vol:.05});
      break;
    case "tense": tone(N.A4,t,{dur:1.4,vol:.11,attack:.01,partials:[[1,1],[2,.12]]}); break;
    case "relax": tone(N.C5,t,{dur:4.5,vol:.11,attack:.04,partials:BOWL}); tone(N.E5,t+.12,{dur:4.5,vol:.08,attack:.04,partials:BOWL}); break;
    case "done": [N.C5,N.E5,N.G5,N.C6].forEach((f,i)=>tone(f,t+i*.18,{dur:3.2,vol:.1,pan:(i-1.5)*.2})); break;
  }
}
function cueBtn(){
  const on=st().cues!==false;
  return `<button class="linkbtn small cue-t" id="cueT" aria-pressed="${on}">${on?"Звуковые сигналы: вкл":"Звуковые сигналы: выкл"}</button>`;
}
function bindCue(){
  const b=document.getElementById("cueT"); if(!b) return;
  b.onclick=()=>{ const s=st(); s.cues=(s.cues===false); save(); if(s.cues) cue("tense"); b.outerHTML=cueBtn(); bindCue(); };
}

/* ---------- Шумы ---------- */
function pinkGen(){ let b0=0,b1=0,b2=0; return ()=>{ const w=Math.random()*2-1; b0=.99765*b0+w*.099046; b1=.963*b1+w*.2965164; b2=.57*b2+w*1.0526913; return (b0+b1+b2+w*.1848)*.11; }; }
function brownGen(){ let l=0; return ()=>{ l=(l+.02*(Math.random()*2-1))/1.02; return l*3.5; }; }

const cache={};
// Генерирует звук длиной sec и бесшовно склеивает конец с началом
function bake(key, sec, fill){
  if(cache[key]) return cache[key];
  const sr=ctx.sampleRate, n=Math.floor(sr*sec), F=Math.floor(sr*1.5), m=n+F;
  const L=new Float32Array(m), R=new Float32Array(m);
  fill(L,R,sr,m);
  let sum=0; for(let i=0;i<n;i+=7) sum+=L[i]*L[i]+R[i]*R[i];
  const k=.11/Math.sqrt(sum/(2*n/7)||1);
  const b=ctx.createBuffer(2,n,sr);
  [L,R].forEach((a,c)=>{ const d=b.getChannelData(c);
    for(let i=0;i<n;i++){ let v=a[i]; if(i<F){ const x=i/F; v=a[i]*Math.sqrt(x)+a[n+i]*Math.sqrt(1-x); } d[i]=Math.max(-1,Math.min(1,v*k)); } });
  return cache[key]=b;
}
function genRain(L,R,sr,m){
  [L,R].forEach(A=>{
    const p=pinkGen(), br=brownGen(); let hp=0,lp=0,prev=0;
    const aH=Math.exp(-2*Math.PI*500/sr), aL=1-Math.exp(-2*Math.PI*6000/sr);
    for(let i=0;i<m;i++){ const x=p(); hp=aH*(hp+x-prev); prev=x; lp+=aL*(hp-lp); A[i]=lp*.9+br()*.08; }
  });
  const drops=Math.floor(m/sr*60);
  for(let k=0;k<drops;k++){
    const s=Math.floor(Math.random()*m), f=1400+Math.random()*4200, r=.982+Math.random()*.012, w=2*Math.PI*f/sr, c=2*r*Math.cos(w), r2=r*r;
    const a=Math.pow(Math.random(),2.5)*.05, pan=Math.random(), len=Math.min(Math.floor(sr*.04), m-s);
    let y1=0,y2=0;
    for(let j=0;j<len;j++){ const x=j<4?(Math.random()*2-1):0, y=c*y1-r2*y2+x; y2=y1; y1=y; const v=y*a; L[s+j]+=v*(1-pan); R[s+j]+=v*pan; }
  }
}
function genSea(L,R,sr,m){
  [[L,0],[R,.4]].forEach(([A,off])=>{
    const br=brownGen(), p=pinkGen(); let lp=0;
    for(let i=0;i<m;i++){
      const t=i/sr+off, ph=(t%8)/8, big=Math.floor(t/8)%2?.8:1;
      const e=(ph<.35?Math.pow(ph/.35,2):Math.pow(1-(ph-.35)/.65,1.7))*big;
      const a=1-Math.exp(-2*Math.PI*(250+2300*e)/sr); lp+=a*(p()-lp);
      A[i]=br()*.35*(.5+.5*e)+lp*(.15+e)*1.3;
    }
  });
}
function genWind(L,R,sr,m){
  [[L,0],[R,2.3]].forEach(([A,off])=>{
    const p=pinkGen(); let low=0,band=0;
    for(let i=0;i<m;i++){
      const t=i/sr+off, mod=.5+.3*Math.sin(2*Math.PI*t/20)+.2*Math.sin(2*Math.PI*t/6.7+1);
      const F=2*Math.sin(Math.PI*(220+650*mod)/sr), x=p();
      low+=F*band; const high=x-low-.6*band; band+=F*high;
      A[i]=band*(.3+.7*mod);
    }
  });
}
function genFire(L,R,sr,m){
  [L,R].forEach(A=>{ const br=brownGen(); let lp=0; const a=1-Math.exp(-2*Math.PI*420/sr);
    for(let i=0;i<m;i++){ lp+=a*(br()-lp); A[i]=lp*(1+.3*Math.sin(2*Math.PI*i/sr*.37)); } });
}
function genBrown(L,R,sr,m){
  [L,R].forEach(A=>{ const br=brownGen(); let lp=0; const a=1-Math.exp(-2*Math.PI*900/sr); for(let i=0;i<m;i++){ lp+=a*(br()-lp); A[i]=lp; } });
}

/* ---------- Живые слои: птицы, треск костра, поющая чаша ---------- */
function loop(fn, nextSec){ let alive=true, id=null; const step=()=>{ if(!alive) return; fn(); id=setTimeout(step, nextSec()*1000); }; id=setTimeout(step, 300); return ()=>{ alive=false; clearTimeout(id); }; }
function birds(out){
  return loop(()=>{
    const t0=ctx.currentTime+.05, f0=2400+Math.random()*1800, up=Math.random()<.5, n=2+Math.floor(Math.random()*5), gap=.09+Math.random()*.08, pan=Math.random()*1.6-.8;
    for(let k=0;k<n;k++){
      const t=t0+k*gap, d=.05+Math.random()*.06, o=ctx.createOscillator(), g=ctx.createGain(), p=panner(pan);
      const a=up?f0:f0*1.3, b=up?f0*1.3:f0;
      o.frequency.setValueAtTime(a,t); o.frequency.exponentialRampToValueAtTime(b,t+d);
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.07,t+.008); g.gain.exponentialRampToValueAtTime(.0005,t+d+.05);
      o.connect(g); g.connect(p); p.connect(out); o.start(t); o.stop(t+d+.08);
    }
  }, ()=>2.5+Math.random()*6);
}
function crackles(out){
  const one=t=>{
    const n=Math.floor(ctx.sampleRate*(.002+Math.random()*.012)), b=ctx.createBuffer(1,n,ctx.sampleRate), d=b.getChannelData(0);
    for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/n,4);
    const s=ctx.createBufferSource(), f=ctx.createBiquadFilter(), g=ctx.createGain(), p=panner(Math.random()*1.4-.7);
    s.buffer=b; f.type="highpass"; f.frequency.value=700+Math.random()*3200; g.gain.value=Math.pow(Math.random(),2)*.4;
    s.connect(f); f.connect(g); g.connect(p); p.connect(out); s.start(t);
  };
  return loop(()=>{ const t=ctx.currentTime+.02; one(t); if(Math.random()<.25){ const k=2+Math.floor(Math.random()*4); for(let i=1;i<=k;i++) one(t+i*(.015+Math.random()*.05)); } },
    ()=>.05+(-Math.log(1-Math.random()))*.22);
}
function bowl(out){
  const notes=[N.C4*.75, N.C4, N.C4*1.125, N.G4*.75];
  return loop(()=>{ tone(notes[Math.floor(Math.random()*notes.length)], ctx.currentTime+.05, {dur:11, vol:.25, attack:.015, partials:BOWL, bus:out, pan:Math.random()*.6-.3}); },
    ()=>9+Math.random()*8);
}

/* ---------- Микшер ---------- */
const I=d=>`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const AMB={
  rain:  {t:"Дождь", sec:12, gen:genRain, lvl:.9, ico:I('<path d="M7 14a4 4 0 0 1 .4-8A5 5 0 0 1 17 7a3.5 3.5 0 0 1 0 7z"/><path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3"/>')},
  sea:   {t:"Море", sec:16, gen:genSea, lvl:.9, ico:I('<path d="M2 8c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0M2 13c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0M2 18c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0"/>')},
  forest:{t:"Лес и птицы", sec:20, gen:genWind, live:birds, send:.35, lvl:.7, ico:I('<path d="M12 3l6 9h-4l4 6H6l4-6H6z"/><path d="M12 18v3"/>')},
  fire:  {t:"Костёр", sec:10, gen:genFire, live:crackles, lvl:.8, ico:I('<path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-6 1.5 1 2 2.5 2 4 1-1 1.5-3 1-8z"/>')},
  bowl:  {t:"Поющая чаша", live:bowl, send:.6, lvl:1, ico:I('<path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M8 21h8"/><path d="M15 4c-1 1.5 1 2.5 0 4"/>')},
  noise: {t:"Мягкий шум", sec:10, gen:genBrown, lvl:.75, ico:I('<path d="M2 12h3l2-6 3 12 3-9 2 6 2-3h5"/>')}
};
const ON={};
const vol=k=>{ const v=st().v[k]; return typeof v==="number"?Math.max(0,Math.min(1,v)):.6; };
function start(k){
  if(!ac() || ON[k]) return;
  const d=AMB[k], g=ctx.createGain(); g.gain.value=0; g.connect(master);
  if(d.send){ const sg=ctx.createGain(); sg.gain.value=d.send; g.connect(sg); sg.connect(rev); }
  g.gain.setTargetAtTime(vol(k)*d.lvl, ctx.currentTime, .5);
  let src=null;
  if(d.gen){ src=ctx.createBufferSource(); src.buffer=bake(k,d.sec,d.gen); src.loop=true; src.connect(g); src.start(); }
  ON[k]={g, src, stopLive:d.live?d.live(g):null};
}
function stop(k){
  const o=ON[k]; if(!o) return; delete ON[k];
  const t=ctx.currentTime; o.g.gain.cancelScheduledValues(t); o.g.gain.setTargetAtTime(0,t,.3);
  if(o.stopLive) o.stopLive();
  setTimeout(()=>{ try{ o.src && o.src.stop(); }catch(e){} try{ o.g.disconnect(); }catch(e){} }, 1600);
}
function stopAll(){ Object.keys(ON).forEach(stop); setTimer(0); pill(); }
const playing=()=>Object.keys(ON).length>0;

let tEnd=0, tId=null, tFade=null;
function setTimer(min){
  clearTimeout(tId); clearTimeout(tFade); tEnd=0; tSel=min;
  if(master && ctx){ master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setValueAtTime(1,ctx.currentTime); }
  if(!min) return;
  tEnd=Date.now()+min*60000;
  tFade=setTimeout(()=>{ if(master) master.gain.setTargetAtTime(0, ctx.currentTime, 7); }, Math.max(0,min*60000-25000));
  tId=setTimeout(()=>{ Object.keys(ON).forEach(stop); tEnd=0; tSel=0; setTimeout(()=>{ if(master) master.gain.setValueAtTime(1,ctx.currentTime); }, 1800); pill(); if(route==="sounds") render(); }, min*60000);
}
let tSel=0;
const left=()=>tEnd?Math.max(1,Math.ceil((tEnd-Date.now())/60000)):0;

function vSounds(){
  const on=playing();
  return `${backPrev()}
  <div class="stack-s"><h1>Звуки для сна</h1><p class="muted">Включайте и смешивайте. Работает без интернета.</p></div>
  <div class="snd-grid">${Object.entries(AMB).map(([k,d])=>`<div class="snd${ON[k]?" on":""}">
    <button class="snd-t" data-snd="${k}" aria-pressed="${!!ON[k]}"><span class="ico">${d.ico}</span><span>${d.t}</span></button>
    <input type="range" min="0" max="1" step="0.01" value="${vol(k)}" data-sv="${k}" aria-label="Громкость: ${d.t}">
  </div>`).join("")}</div>
  <div class="stack-s"><span class="label">Выключить через</span>
    <div class="chips">${[[0,"Без таймера"],[15,"15 мин"],[30,"30 мин"],[60,"60 мин"]].map(([m,t])=>`<button class="chip" data-tm="${m}" aria-pressed="${tSel===m}">${t}</button>`).join("")}</div>
    ${tEnd?`<p class="small muted" id="tLeft">Звук плавно стихнет через ${left()} мин</p>`:""}
  </div>
  ${on?`<button class="btn quiet block" id="sStop">Остановить всё</button>`:""}
  <p class="disclaimer">Приятнее в наушниках. На iPhone выключите беззвучный режим.</p>`;
}
function bindSounds(){
  $$("[data-snd]").forEach(b=>b.onclick=()=>{ const k=b.dataset.snd; if(ON[k]) stop(k); else start(k); if(!ac()){ toast("Браузер не поддерживает звук"); return; } render(); });
  $$("[data-sv]").forEach(r=>r.oninput=()=>{ const k=r.dataset.sv, v=+r.value; st().v[k]=v; save(); const o=ON[k]; if(o && ctx) o.g.gain.setTargetAtTime(v*AMB[k].lvl, ctx.currentTime, .08); });
  $$("[data-tm]").forEach(b=>b.onclick=()=>{ setTimer(+b.dataset.tm); render(); });
  const s=document.getElementById("sStop"); if(s) s.onclick=()=>{ stopAll(); render(); };
}
// Мини-плеер: виден на других экранах, пока играет звук
function pill(){
  let el=document.getElementById("sndPill");
  const show=playing() && typeof route!=="undefined" && route!=="sounds";
  if(!show){ if(el) el.remove(); return; }
  if(!el){ el=document.createElement("div"); el.id="sndPill"; el.className="snd-pill"; document.body.appendChild(el); }
  el.innerHTML=`<button class="sp-open" data-go="sounds">${AMB[Object.keys(ON)[0]].ico}<span>Звуки${tEnd?` · ${left()} мин`:""}</span></button><button class="sp-stop" aria-label="Остановить звуки">${I('<rect x="7" y="7" width="10" height="10" rx="2"/>')}</button>`;
  el.querySelector(".sp-stop").onclick=()=>{ stopAll(); };
}
setInterval(()=>{ if(!tEnd) return; const l=document.getElementById("tLeft"); if(l) l.textContent=`Звук плавно стихнет через ${left()} мин`; pill(); }, 30000);

VIEWS.sounds=[vSounds, bindSounds]; TAB_OF.sounds="practices";
window.SND={cue, cueBtn, bindCue, pill, stopAll, playing, play:start, stopOne:k=>{ stop(k); pill(); }};
})();
