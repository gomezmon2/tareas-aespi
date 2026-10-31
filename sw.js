// Service worker de Tareas AESPI.
// Guarda la página y los iconos para que la app abra rápido; los datos siempre se piden a Apps Script.
// Si cambias index.html, sube también este archivo cambiando el número de versión.
const VERSION = 'tareas-aespi-v9';
const ARCHIVOS = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/favicon.png'];

self.addEventListener('install', e => {
  // cache: 'reload' = descargar de GitHub, no de la copia temporal del navegador
  e.waitUntil(caches.open(VERSION)
    .then(c => c.addAll(ARCHIVOS.map(a => new Request(a, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(claves => Promise.all(claves.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // Apps Script, fotos, fuentes: directo a internet
  // Primero internet (para tener siempre la última versión); si no hay conexión, la copia guardada
  e.respondWith(
    // cache: 'no-cache' = preguntar siempre a GitHub si hay versión nueva (evita esperar hasta 10 min)
    fetch(e.request, { cache: 'no-cache' })
      .then(r => { const copia = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copia)); return r; })
      .catch(() => caches.match(e.request))
  );
});
