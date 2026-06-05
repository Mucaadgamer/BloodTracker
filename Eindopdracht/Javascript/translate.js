async function loadLanguage(lang) {
  try {
    // ✔ Detecteer automatisch of we in /Pages/ zitten
    let basePath = window.location.pathname.includes("/Pages/")
      ? "../"
      : "./";

    const url = `${basePath}language/${lang}.json`;

    const cache = await caches.open("pulsewatch-final-v3");
    const cached = await cache.match(url);

    let data;

    if (cached) {
      data = await cached.json();
    } else {
      const response = await fetch(url);
      data = await response.json();
    }

    // ⭐ 1. Statische teksten vertalen (iconen behouden)
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (!data[key]) return;

      const icon =
        el.querySelector("svg, i, span.icon, .nav-icon")?.outerHTML ||
        (el.textContent.trim().match(/^[^\w\s]/)?.[0] || "");

      el.innerHTML = `${icon} ${data[key]}`.trim();
    });

    // ⭐ 2. Placeholders vertalen
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (data[key]) el.placeholder = data[key];
    });

    // ⭐ 3. Dynamische content vertalen
    translateDynamicContent(data);

  } catch (err) {
    console.error("Taal laden mislukt:", err);
  }
}


// ⭐ 4. Vertaal dynamische content (geschiedenis + dashboard + filters)
function translateDynamicContent(data) {

  // ─── STATUS BADGES ───────────────────────────────
  document.querySelectorAll(".status-badge").forEach(el => {
    const txt = el.textContent.trim();

    const map = {
      "Optimaal": data["status_optimal"],
      "Normaal": data["status_normal"],
      "Hoog-normaal": data["status_high_normal"],
      "Te hoog": data["status_too_high"],

      "Optimal": data["status_optimal"],
      "Normal": data["status_normal"],
      "High-normal": data["status_high_normal"],
      "Too high": data["status_too_high"],

      "Hoch-normal": data["status_high_normal"],
      "Zu hoch": data["status_too_high"]
    };

    if (map[txt]) el.textContent = map[txt];
  });

  // ─── LEEGTEKST ───────────────────────────────────
  const empty = document.querySelector(".leeg-tekst");
  if (empty && data["no_measurements"]) {
    empty.textContent = data["no_measurements"];
  }

  // ─── FILTER KNOPPEN ──────────────────────────────
  document.querySelectorAll(".filter-btn").forEach(btn => {
    const f = btn.dataset.filter;

    const map = {
      "vandaag": data["filter_today"],
      "week": data["filter_week"],
      "maand": data["filter_month"],
      "alles": data["filter_all"]
    };

    if (map[f]) btn.textContent = map[f];
  });

  // ─── PAGINATIE ───────────────────────────────────
  const paginatie = document.getElementById("paginatie");
  if (paginatie) {
    paginatie.querySelectorAll("button").forEach(btn => {
      if (btn.textContent.includes("Vorige") && data["previous"]) {
        btn.textContent = data["previous"];
      }
      if (btn.textContent.includes("Volgende") && data["next"]) {
        btn.textContent = data["next"];
      }
    });
  }

  // ─── DASHBOARD TITELS ────────────────────────────
  if (document.getElementById("recent-title") && data["recent_measurements"]) {
    document.getElementById("recent-title").textContent = data["recent_measurements"];
  }
}
