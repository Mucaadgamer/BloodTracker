const PREFS_KEY = "pulsewatch_prefs";

const standaard = {
  push: false,
  bloeddruk: false,
  tijdBloeddruk: "08:00",
  medicijnen: false,
  tijdMedicijnen: "09:00",
  taal: "nl",
  donker: false
};

function laadPrefs() {
  try {
    const opgeslagen = localStorage.getItem(PREFS_KEY);
    return Object.assign({}, standaard, opgeslagen ? JSON.parse(opgeslagen) : {});
  } catch {
    return { ...standaard };
  }
}

function slaPrefsOp(prefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

async function vulFormulier(prefs) {
  document.getElementById("toggle-push").checked       = prefs.push;
  document.getElementById("toggle-bloeddruk").checked  = prefs.bloeddruk;
  document.getElementById("toggle-medicijnen").checked = prefs.medicijnen;
  document.getElementById("tijd-bd").value             = prefs.tijdBloeddruk;
  document.getElementById("tijd-med").value            = prefs.tijdMedicijnen;
  document.getElementById("taal-keuze").value          = prefs.taal;
  document.getElementById("toggle-donker").checked     = prefs.donker;

  document.getElementById("tijd-bloeddruk").style.display =
    prefs.bloeddruk ? "flex" : "none";
  document.getElementById("tijd-medicijnen").style.display =
    prefs.medicijnen ? "flex" : "none";

  // DARK MODE ACTIVEREN
  document.documentElement.setAttribute(
    "data-theme",
    prefs.donker ? "dark" : "light"
  );

  // TAAL LADEN
  await loadLanguage(prefs.taal);
}

document.addEventListener("DOMContentLoaded", async () => {
  const prefs = laadPrefs();
  await vulFormulier(prefs);

  // PUSH
  document.getElementById("toggle-push").addEventListener("change", async (e) => {
    if (e.target.checked && Notification.permission !== "granted") {
      const toestemming = await Notification.requestPermission();
      if (toestemming !== "granted") {
        e.target.checked = false;
        alert("Meldingen geblokkeerd. Sta ze toe in je browser-instellingen.");
      }
    }
  });

  // BLOEDDRUK
  document.getElementById("toggle-bloeddruk").addEventListener("change", (e) => {
    document.getElementById("tijd-bloeddruk").style.display =
      e.target.checked ? "flex" : "none";
  });

  // MEDICIJNEN
  document.getElementById("toggle-medicijnen").addEventListener("change", (e) => {
    document.getElementById("tijd-medicijnen").style.display =
      e.target.checked ? "flex" : "none";
  });

  // DONKER THEMA
  document.getElementById("toggle-donker").addEventListener("change", (e) => {
    document.documentElement.setAttribute(
      "data-theme",
      e.target.checked ? "dark" : "light"
    );
  });

  // TAAL
  document.getElementById("taal-keuze").addEventListener("change", async (e) => {
    const lang = e.target.value;
    document.documentElement.lang = lang;
    await loadLanguage(lang);
  });

  // OPSLAAN
  document.getElementById("opslaan-btn").addEventListener("click", async () => {
    const nieuwePrefs = {
      push:           document.getElementById("toggle-push").checked,
      bloeddruk:      document.getElementById("toggle-bloeddruk").checked,
      tijdBloeddruk:  document.getElementById("tijd-bd").value,
      medicijnen:     document.getElementById("toggle-medicijnen").checked,
      tijdMedicijnen: document.getElementById("tijd-med").value,
      taal:           document.getElementById("taal-keuze").value,
      donker:         document.getElementById("toggle-donker").checked
    };

    slaPrefsOp(nieuwePrefs);
    await loadLanguage(nieuwePrefs.taal);

    const knop = document.getElementById("opslaan-btn");
    knop.textContent =
      nieuwePrefs.taal === "nl"
        ? "Opgeslagen!"
        : nieuwePrefs.taal === "de"
        ? "Gespeichert!"
        : "Saved!";

    setTimeout(() => {
      knop.textContent =
        nieuwePrefs.taal === "nl"
          ? "Opslaan"
          : nieuwePrefs.taal === "de"
          ? "Speichern"
          : "Save";
    }, 2000);
  });
});
