/* Открыто внутри Telegram, Instagram, ВКонтакте и т. п. (встроенный браузер приложения).
   Там записи и прогресс могут пропадать после закрытия окна (так было у тестировщицы Тины в Telegram на iPhone),
   а кнопки «На экран Домой» нет. Поэтому при каждом запуске просим открыть «Опору» в обычном браузере. */
(function(){
"use strict";
const ua=navigator.userAgent||"";
function host(){
  if(typeof window.TelegramWebviewProxy!=="undefined" || typeof window.TelegramWebview!=="undefined" || /Telegram/i.test(ua)) return "Telegram";
  if(/Instagram/i.test(ua)) return "Instagram";
  if(/FBAN|FBAV|FB_IAB/i.test(ua)) return "Facebook";
  if(/VKAndroidApp|vkclient|VKApp/i.test(ua)) return "ВКонтакте";
  if(/OKApp/i.test(ua)) return "Одноклассниках";
  if(/\bLine\//i.test(ua)) return "LINE";
  return "";
}
const APP=host();
window.INAPP=APP;
if(!APP) return;
const IOS=/iphone|ipad|ipod/i.test(ua);
const URL0=location.origin+location.pathname;
function show(){
  if(document.querySelector(".inapp-m")) return;
  try{ if(sessionStorage.getItem("opora_inapp")) return; }catch(e){}
  if(typeof S!=="undefined" && S && S.inappHide) return;
  const how = IOS
    ? `Нажмите <b>⋯</b> вверху справа → <b>«Открыть в Safari»</b>. Потом в Safari: «Поделиться» → <b>«На экран Домой»</b> — и «Опора» будет открываться как обычное приложение.`
    : `Нажмите <b>⋮</b> вверху справа → <b>«Открыть в браузере»</b>. Потом в меню браузера → <b>«Добавить на главный экран»</b> — и «Опора» будет открываться как обычное приложение.`;
  const m=document.createElement("div"); m.className="modal inapp-m"; m.setAttribute("role","dialog"); m.setAttribute("aria-label","Откройте в браузере");
  m.innerHTML=`<div class="modal-in">
    <h2>Откройте «Опору» в браузере</h2>
    <p class="small">Сейчас приложение открыто внутри ${APP==="Одноклассниках"?"Одноклассников":APP}. Здесь ваши ответы и прогресс могут пропасть, когда вы закроете окно.</p>
    <p class="small">${how}</p>
    <div class="stack-s"><button class="btn block" id="inCopy">Скопировать ссылку</button><button class="btn quiet block" id="inOk">Понятно</button></div>
    <button class="linkbtn small" id="inHide" style="align-self:center">Больше не показывать</button></div>`;
  document.body.appendChild(m);
  const close=()=>{ m.remove(); try{ sessionStorage.setItem("opora_inapp","1"); }catch(e){} };
  m.querySelector("#inOk").onclick=close;
  m.querySelector("#inHide").onclick=()=>{ try{ S.inappHide=1; save(); }catch(e){} close(); };
  m.querySelector("#inCopy").onclick=async()=>{
    let ok=false; try{ await navigator.clipboard.writeText(URL0); ok=true; }catch(e){}
    if(!ok){ try{ const t=document.createElement("textarea"); t.value=URL0; t.style.position="fixed"; t.style.opacity="0"; document.body.appendChild(t); t.select(); ok=document.execCommand("copy"); t.remove(); }catch(e){} }
    if(typeof toast==="function") toast(ok?"Ссылка скопирована — вставьте её в Safari или Chrome":URL0);
  };
}
// после экрана знакомства (он сам по себе модальный) — чуть позже
function later(){ setTimeout(show, 900); }
if(document.readyState==="complete") later(); else window.addEventListener("load", later);
})();
