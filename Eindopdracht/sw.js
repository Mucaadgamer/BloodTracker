const CACHE_NAME = "pulsewatch-final-v4";

const ASSETS = [
  // HTML
  "index.html",
  "Pages/Instellingen.html",
  "Pages/Toevoegen.html",
  "Pages/MeetGeschiedenis.html",

  "images/favicon.ico",

  // CSS
  "Css/style.css",
  "Css/Instellingen.css",
  "Css/Toevoegen.css",
  "Css/Meetgeschiedenis.css",

  // JS
  "Javascript/script.js",
  "Javascript/translate.js",
  "Javascript/instellingen.js",

  // Taal
  "language/nl.json",
  "language/en.json",
  "language/de.json",

  // Afbeeldingen
  "Images/heart_icon_192x192.png",
  "Images/heart_icon_512x512.png",
  "Images/Desktop.png",
  "Images/telefoon.jpeg",

  // Manifest
  "manifest.json"
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
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
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
          return caches.match("index.html");
        }
      });
    })
  );
});
