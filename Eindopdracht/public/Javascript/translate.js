async function loadLanguage(lang) {
  try {
    // ABSOLUUT PAD — DIT IS DE FIX
    const url = `/public/language/${lang}.json`;

    // EERST PROBEREN UIT CACHE (OFFLINE)
    const cache = await caches.open("pulsewatch-final-v1");
    const cached = await cache.match(url);

    let data;

    if (cached) {
      data = await cached.json();
    } else {
      const response = await fetch(url);
      data = await response.json();
    }

    // ALLE data-i18n TEKSTEN UPDATEN
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (data[key]) el.textContent = data[key];
    });

    // ALLE PLACEHOLDERS UPDATEN
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (data[key]) el.placeholder = data[key];
    });

  } catch (err) {
    console.error("Taal laden mislukt:", err);
  }
}
