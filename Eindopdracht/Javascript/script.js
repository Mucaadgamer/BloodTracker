// ─── CONSTANTEN ──────────────────────────────────────
const STORAGE_KEY = 'pulsewatch_data';
let huidigePagina = 1;
const ITEMS_PER_PAGINA = 4;
let huidigeFilter = "alles"; // ⭐ NIEUW

// ─── DATA FUNCTIES ────────────────────────────────────

function laadMetingen() {
  const json = localStorage.getItem(STORAGE_KEY);
  return json ? JSON.parse(json) : [];
}

function slaMetingenOp(metingen) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(metingen));
}

function voegMetingToe(meting) {
  const metingen = laadMetingen();
  metingen.push(meting);
  slaMetingenOp(metingen);
}

function verwijderMeting(id) {
  const metingen = laadMetingen();
  slaMetingenOp(metingen.filter(m => m.id !== id));
}

// ─── FORMULIER VERWERKEN ─────────────────────────────

function stelDatumIn() {
  const input = document.getElementById('datum');
  if (!input) return;

  const nu = new Date();
  const lokaalIso = new Date(nu.getTime() - nu.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  input.value = lokaalIso;
}

function verwerkFormulier(event) {
  event.preventDefault();

  const nieuweMeting = {
    id: Date.now(),
    datum: document.getElementById('datum').value,
    systolisch: parseInt(document.getElementById('systolisch').value),
    diastolisch: parseInt(document.getElementById('diastolisch').value),
    pols: parseInt(document.getElementById('pols').value),
    notitie: document.getElementById('notitie')?.value || '',
  };

  voegMetingToe(nieuweMeting);

  const melding = document.getElementById('succes-melding');
  if (melding) {
    melding.style.display = 'block';
    setTimeout(() => window.location.href = '../index.html', 1500);
  } else {
    window.location.href = '../index.html';
  }
}

// ─── DASHBOARD ───────────────────────────────────────

function gemiddelde(arr) {
  if (arr.length === 0) return '--';
  return Math.round(arr.reduce((t, v) => t + v, 0) / arr.length);
}

function formateerDatum(datumString) {
  const d = new Date(datumString);
  if (isNaN(d.getTime())) return datumString;

  return (
    d.toLocaleDateString('nl-NL', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }) +
    ', ' +
    d.toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit',
    })
  );
}

function maakMetingHTML(meting) {
  return `
    <div class="meting-item">
      <div>
        <p class="meting-waarden">
          ${meting.systolisch}/${meting.diastolisch} mmHg · ${meting.pols} bpm
        </p>
        ${meting.notitie ? `<p class="meting-notitie">${meting.notitie}</p>` : ''}
      </div>
      <p class="meting-datum">${formateerDatum(meting.datum)}</p>
    </div>
  `;
}

// ─── MEEST RECENTE METING (3 CARDS) ───────────────────

function updateLaatsteMeting() {
  const metingen = laadMetingen();
  if (metingen.length === 0) return;

  const laatste = metingen.sort((a, b) => b.id - a.id)[0];

  const sysEl = document.getElementById('laatste-sys');
  const diaEl = document.getElementById('laatste-dia');
  const polsEl = document.getElementById('laatste-pols');

  if (sysEl) sysEl.textContent = laatste.systolisch;
  if (diaEl) diaEl.textContent = laatste.diastolisch;
  if (polsEl) polsEl.textContent = laatste.pols;
}

// ─── RECENTE METINGEN (ONDERAAN INDEX) ───────────────

function updateDashboard() {
  const metingen = laadMetingen();

  if (document.getElementById('gem-sys')) {
    document.getElementById('gem-sys').textContent = gemiddelde(metingen.map(m => m.systolisch));
    document.getElementById('gem-dia').textContent = gemiddelde(metingen.map(m => m.diastolisch));
    document.getElementById('gem-pols').textContent = gemiddelde(metingen.map(m => m.pols));
  }

  const lijstEl = document.getElementById('recente-lijst');
  if (lijstEl) {
    if (metingen.length === 0) {
      lijstEl.innerHTML = '<p class="leeg-tekst">Nog geen metingen. Voeg je eerste meting toe!</p>';
      return;
    }

    const recentste = [...metingen].sort((a, b) => b.id - a.id).slice(0, 2);
    lijstEl.innerHTML = recentste.map(maakMetingHTML).join('');
  }
}

// ─── INITIALISATIE ────────────────────────────────────

const formulier = document.getElementById('meting-formulier');
if (formulier) {
  stelDatumIn();
  formulier.addEventListener('submit', verwerkFormulier);
}

if (document.getElementById('laatste-sys')) updateLaatsteMeting();
if (document.getElementById('gem-sys') || document.getElementById('recente-lijst')) updateDashboard();

// ─── GESCHIEDENIS ─────────────────────────────────────

function bloeddrukStatus(sys, dia) {
  const lang = document.documentElement.lang || 'nl';

  const labels = {
    nl: ['Optimaal', 'Normaal', 'Hoog-normaal', 'Te hoog'],
    en: ['Optimal', 'Normal', 'High-normal', 'Too high'],
    de: ['Optimal', 'Normal', 'Hoch-normal', 'Zu hoch'],
  };

  let index = 3;
  if (sys < 120 && dia < 80) index = 0;
  else if (sys < 130 && dia < 85) index = 1;
  else if (sys < 140 && dia < 90) index = 2;

  return {
    label: labels[lang][index],
    kleur: ['#16a34a', '#2d8c5a', '#d97706', '#dc2626'][index],
  };
}

function maakGeschiedenisItemHTML(meting) {
  const status = bloeddrukStatus(meting.systolisch, meting.diastolisch);
  return `
    <div class="geschiedenis-item">
      <div class="geschiedenis-links">
        <p class="meting-waarden">${meting.systolisch}/${meting.diastolisch} mmHg · ${meting.pols} bpm</p>
        <p class="meting-datum">${formateerDatum(meting.datum)}</p>
        ${meting.notitie ? `<p class="meting-notitie">📝 ${meting.notitie}</p>` : ''}
      </div>
      <div class="geschiedenis-rechts">
        <span class="status-badge" style="color:${status.kleur}">${status.label}</span>
        <button class="verwijder-knop" onclick="verwijderEnHerlaad(${meting.id})">🗑️</button>
      </div>
    </div>
  `;
}

// ─── FILTER FUNCTIE ─────────────────────────────────────

function filterMetingen(metingen, filter) {
  const nu = new Date();

  if (filter === "vandaag") {
    return metingen.filter(m => {
      const d = new Date(m.datum);
      return d.toDateString() === nu.toDateString();
    });
  }

  if (filter === "week") {
    const weekStart = new Date(nu);
    weekStart.setDate(nu.getDate() - nu.getDay());
    return metingen.filter(m => new Date(m.datum) >= weekStart);
  }

  if (filter === "maand") {
    const maandStart = new Date(nu.getFullYear(), nu.getMonth(), 1);
    return metingen.filter(m => new Date(m.datum) >= maandStart);
  }

  return metingen;
}

// ─── GESCHIEDENIS LADEN MET FILTER ─────────────────────

function laadGeschiedenispagina(filter = huidigeFilter) {
  huidigeFilter = filter;

  let metingen = laadMetingen().sort((a, b) => b.id - a.id);
  metingen = filterMetingen(metingen, filter);

  const lijst = document.getElementById('geschiedenis-lijst');
  const paginatieEl = document.getElementById('paginatie');

  if (!lijst) return;

  if (metingen.length === 0) {
    lijst.innerHTML = '<p class="leeg-tekst">Geen metingen gevonden.</p>';
    if (paginatieEl) paginatieEl.innerHTML = '';
    return;
  }

  const totaalPaginas = Math.ceil(metingen.length / ITEMS_PER_PAGINA);
  if (huidigePagina > totaalPaginas) huidigePagina = totaalPaginas;

  const start = (huidigePagina - 1) * ITEMS_PER_PAGINA;
  const paginaMetingen = metingen.slice(start, start + ITEMS_PER_PAGINA);

  lijst.innerHTML = paginaMetingen.map(maakGeschiedenisItemHTML).join('');

  if (paginatieEl) {
    paginatieEl.innerHTML = `
      <button ${huidigePagina === 1 ? 'disabled' : ''} onclick="vorigePagina()">Vorige</button>
      <span>Pagina ${huidigePagina} van ${totaalPaginas}</span>
      <button ${huidigePagina === totaalPaginas ? 'disabled' : ''} onclick="volgendePagina()">Volgende</button>
    `;
  }
}

// ─── FILTER KNOPPEN ─────────────────────────────────────

document.querySelectorAll(".filter-btn")?.forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    huidigePagina = 1;
    laadGeschiedenispagina(btn.dataset.filter);
  });
});

// ─── PAGINATIE ─────────────────────────────────────────

function volgendePagina() {
  huidigePagina++;
  laadGeschiedenispagina();
}

function vorigePagina() {
  huidigePagina--;
  laadGeschiedenispagina();
}

function verwijderEnHerlaad(id) {
  if (!confirm('Weet je zeker dat je deze meting wilt verwijderen?')) return;
  verwijderMeting(id);
  laadGeschiedenispagina();
}

if (document.getElementById('geschiedenis-lijst')) {
  laadGeschiedenispagina();
}

// ─── DESKTOP OVERLAY ──────────────────────────────────

function controleerDesktop() {
  const overlay = document.getElementById('desktop-overlay');
  if (!overlay) return;

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    overlay.style.display = 'none';
    return;
  }

  if (window.innerWidth > 800) {
    overlay.style.display = 'flex';
    const qr = document.getElementById('desktop-qr');
    if (qr) {
      qr.src = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' + encodeURIComponent(window.location.href);
    }
  } else {
    overlay.style.display = 'none';
  }
}

controleerDesktop();
window.addEventListener('resize', controleerDesktop);

// ─── NAVIGATIE VIA data-nav ───────────────────────────

document.querySelectorAll('[data-nav]').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    const target = this.getAttribute('href');
    if (target) window.location.href = target;
  });
});
