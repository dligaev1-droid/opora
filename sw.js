// Офлайн-режим: файлы приложения сохраняются на телефоне.
// При каждом обновлении приложения увеличивайте номер версии.
const VERSION = "opora-v64";
const FILES = [
  "./", "./index.html", "./css/style.css", "./js/theme.js", "./js/config.js", "./js/content.js", "./js/content2.js", "./js/daily.js", "./js/app.js", "./js/growth.js", "./js/cards.js", "./js/thought.js", "./js/sounds.js", "./js/relations.js", "./js/couple.js", "./js/together.js", "./js/garden-spots.js", "./js/garden.js", "./js/goals.js", "./js/goals2.js", "./js/goals3.js", "./js/intim.js", "./js/intim2.js", "./js/retain.js", "./js/love2.js", "./js/thoughts2.js", "./js/achieve.js", "./js/howto.js", "./js/calm.js", "./js/simple.js", "./js/haptic.js", "./js/cardfx.js", "./js/legal.js", "./js/ui.js",
  "./fonts/onest.woff", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  // Свои файлы: сначала сеть (чтобы быстро получать обновления), без сети — из кэша
  e.respondWith(
    fetch(e.request)
      .then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
