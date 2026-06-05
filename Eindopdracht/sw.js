const CACHE_NAME = "pulsewatch-cache-v4";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",

  // CSS
  "./Css/style.css",
  "./Css/Theme.css",
  "./Css/Instellingen.css",
  "./Css/Meetgeschiedenis.css",
  "./Css/Toevoegen.css",

  // JS
  "./Javascript/script.js",
  "./Javascript/translate.js",
  "./Javascript/instellingen.js",

  // Language JSON
  "./language/nl.json",
  "./language/en.json",
  "./language/de.json",

  // Images
  "./Images/favicon.ico",
  "./Images/Desktop.png",
  "./Images/heart_icon_192x192.png",
  "./Images/heart_icon_512x512.png",
  "./Images/telefoon.jpeg",

  // Pages
  "./Pages/Instellingen.html",
  "./Pages/MeetGeschiedenis.html",
  "./Pages/Toevoegen.html"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
