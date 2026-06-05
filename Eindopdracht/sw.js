const CACHE_NAME = "pulsewatch-cache-v5";

const ROOT = "/BloodTracker/Eindopdracht/";

const FILES_TO_CACHE = [
  ROOT,
  ROOT + "index.html",
  ROOT + "manifest.json",

  // CSS
  ROOT + "Css/style.css",
  ROOT + "Css/Theme.css",
  ROOT + "Css/Instellingen.css",
  ROOT + "Css/Meetgeschiedenis.css",
  ROOT + "Css/Toevoegen.css",

  // JS
  ROOT + "Javascript/script.js",
  ROOT + "Javascript/translate.js",
  ROOT + "Javascript/instellingen.js",

  // Language JSON
  ROOT + "language/nl.json",
  ROOT + "language/en.json",
  ROOT + "language/de.json",

  // Images
  ROOT + "Images/favicon.ico",
  ROOT + "Images/Desktop.png",
  ROOT + "Images/heart_icon_192x192.png",
  ROOT + "Images/heart_icon_512x512.png",
  ROOT + "Images/telefoon.jpeg",

  // Pages
  ROOT + "Pages/Instellingen.html",
  ROOT + "Pages/MeetGeschiedenis.html",
  ROOT + "Pages/Toevoegen.html"
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
