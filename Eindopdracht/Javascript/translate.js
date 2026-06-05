// Absolute root for GitHub Pages
const ROOT = "/BloodTracker/Eindopdracht/";

async function loadLanguage(lang) {
  try {
    const url = `${ROOT}language/${lang}.json`;
    const response = await fetch(url);
    const data = await response.json();

    // 1. Translate static texts
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (!data[key]) return;

      const icon =
        el.querySelector("svg, i, span.icon, .nav-icon")?.outerHTML ||
        (el.textContent.trim().match(/^[^\w\s]/)?.[0] || "");

      el.innerHTML = `${icon} ${data[key]}`.trim();
    });

    // 2. Translate placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (data[key]) el.placeholder = data[key];
    });

    // 3. Translate dynamic content
    translateDynamicContent(data);

  } catch (err) {
    console.error("Taal laden mislukt:", err);
  }
}

function translateDynamicContent(data) {
  // STATUS BADGES
  // ✅ Use data-status attribute instead of matching text content,
  // so it works no matter which language was loaded previously
  document.querySelectorAll(".status-badge").forEach(el => {
    // Prefer data-status if set, otherwise fall back to text matching
    const status = el.dataset.status || el.textContent.trim();

    const map = {
      // Dutch originals and their English/German equivalents → all map to translation keys
      "Optimaal":    data["status_optimal"],
      "Normaal":     data["status_normal"],
      "Hoog-normaal":data["status_high_normal"],
      "Te hoog":     data["status_too_high"],
      "Optimal":     data["status_optimal"],
      "Normal":      data["status_normal"],
      "High-normal": data["status_high_normal"],
      "Too high":    data["status_too_high"],
      "Hoch-normal": data["status_high_normal"],
      "Zu hoch":     data["status_too_high"],
      // ✅ Also support the raw keys directly
      "status_optimal":     data["status_optimal"],
      "status_normal":      data["status_normal"],
      "status_high_normal": data["status_high_normal"],
      "status_too_high":    data["status_too_high"],
    };

    if (map[status]) {
      el.textContent = map[status];
      // ✅ Store a stable key so next language switch still works
      if (!el.dataset.status) {
        // Reverse-map current text to a stable key
        const reverseMap = {
          "Optimaal": "status_optimal", "Optimal": "status_optimal",
          "Normaal": "status_normal",   "Normal": "status_normal",
          "Hoog-normaal": "status_high_normal", "High-normal": "status_high_normal", "Hoch-normal": "status_high_normal",
          "Te hoog": "status_too_high", "Too high": "status_too_high", "Zu hoch": "status_too_high",
        };
        el.dataset.status = reverseMap[status] || status;
      }
    }
  });

  // EMPTY STATE TEXT
  const empty = document.querySelector(".leeg-tekst");
  if (empty && data["no_measurements"]) {
    empty.textContent = data["no_measurements"];
  }

  // FILTER BUTTONS
  // ✅ Use data-filter attribute (already on buttons), never text content
  document.querySelectorAll(".filter-btn").forEach(btn => {
    const f = btn.dataset.filter;
    const map = {
      "vandaag": data["filter_today"],
      "week":    data["filter_week"],
      "maand":   data["filter_month"],
      "alles":   data["filter_all"]
    };
    if (map[f]) btn.textContent = map[f];
  });

  // PAGINATION BUTTONS
  // ✅ Use data attributes instead of matching Dutch text
  const paginatie = document.getElementById("paginatie");
  if (paginatie) {
    paginatie.querySelectorAll("button[data-action]").forEach(btn => {
      if (btn.dataset.action === "previous" && data["previous"]) {
        btn.textContent = data["previous"];
      }
      if (btn.dataset.action === "next" && data["next"]) {
        btn.textContent = data["next"];
      }
    });

    // ✅ Fallback: still match Dutch/English/German text if data-action is not set
    paginatie.querySelectorAll("button:not([data-action])").forEach(btn => {
      const txt = btn.textContent.trim();
      if ((txt === "Vorige" || txt === "Previous" || txt === "Zurück") && data["previous"]) {
        btn.textContent = data["previous"];
      }
      if ((txt === "Volgende" || txt === "Next" || txt === "Weiter") && data["next"]) {
        btn.textContent = data["next"];
      }
    });
  }
}