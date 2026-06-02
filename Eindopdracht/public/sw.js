const CACHE_NAME = "pulsewatch-final-v2";

const ASSETS = [
  // HTML
  "/public/index.html",
  "/public/Pages/Instellingen.html",
  "/public/Pages/Toevoegen.html",
  "/public/Pages/MeetGeschiedenis.html",

  // CSS
  "/public/Css/style.css",
  "/public/Css/Instellingen.css",
  "/public/Css/Toevoegen.css",
  "/public/Css/Meetgeschiedenis.css",

  // JS
  "/public/Javascript/script.js",
  "/public/Javascript/translate.js",
  "/public/Javascript/instellingen.js",

  // Taal
  "/public/language/nl.json",
  "/public/language/en.json",
  "/public/language/de.json",

  // Afbeeldingen (namen aanpassen als ze anders zijn)
  "/public/Images/heart_icon_192x192.png",
  "/public/Images/heart_icon_512x512.png",
  "/public/Images/Desktop.png",
  "/public/Images/telefoon.jpeg",

  // Manifest
  "/public/manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).catch(() => {
        if (event.request.mode === "navigate") {
          return caches.match("/public/index.html");
        }
      });
    })
  );
});
