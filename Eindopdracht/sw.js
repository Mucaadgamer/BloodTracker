const CACHE_NAME = "pulsewatch-cache-v6";

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

// INSTALL: cache all files, then skip waiting
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting()) // ✅ moved inside waitUntil
  );
});

// ACTIVATE: remove old caches, then claim clients
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim()) // ✅ moved inside waitUntil
  );
});

// FETCH: cache-first, fall back to network
// This makes the app work offline reliably
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached; // ✅ serve from cache first
      return fetch(event.request).then(response => {
        // Optionally cache new requests on the fly
        if (
          response &&
          response.status === 200 &&
          response.type === "basic"
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // If both cache and network fail, return nothing gracefully
        console.warn("Fetch failed and no cache:", event.request.url);
      });
    })
  );
});