// ─── CONSTANTEN ──────────────────────────────────────
const STORAGE_KEY = 'pulsewatch_data';
let huidigePagina = 1;
const ITEMS_PER_PAGINA = 4;

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
  const gefilterd = metingen.filter((m) => m.id !== id);
  slaMetingenOp(gefilterd);
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
    setTimeout(() => {
      window.location.href = '../index.html';
    }, 1500);
  }
}

// ─── DASHBOARD ───────────────────────────────────────

function gemiddelde(arr) {
  if (arr.length === 0) return '--';
  const som = arr.reduce((t, v) => t + v, 0);
  return Math.round(som / arr.length);
}

function formateerDatum(datumString) {
  const d = new Date(datumString);
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

function updateDashboard() {
  const metingen = laadMetingen();

  const sys = metingen.map((m) => m.systolisch);
  const dia = metingen.map((m) => m.diastolisch);
  const pols = metingen.map((m) => m.pols);

  if (document.getElementById('gem-sys')) {
    document.getElementById('gem-sys').textContent = gemiddelde(sys);
    document.getElementById('gem-dia').textContent = gemiddelde(dia);
    document.getElementById('gem-pols').textContent = gemiddelde(pols);
  }

  const lijstEl = document.getElementById('recente-lijst');
  if (!lijstEl) return;

  if (metingen.length === 0) {
    lijstEl.innerHTML =
      '<p class="leeg-tekst">Nog geen metingen. Voeg je eerste meting toe!</p>';
    return;
  }

  const recentste = [...metingen].sort((a, b) => b.id - a.id).slice(0, 2);

  lijstEl.innerHTML = recentste.map(maakMetingHTML).join('');
}

// ─── INITIALISATIE ────────────────────────────────────

const formulier = document.getElementById('meting-formulier');
if (formulier) {
  stelDatumIn();
  formulier.addEventListener('submit', verwerkFormulier);
}

if (document.getElementById('gem-sys')) {
  updateDashboard();
}

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
        <p class="meting-waarden">
          ${meting.systolisch}/${meting.diastolisch} mmHg · ${meting.pols} bpm
        </p>
        <p class="meting-datum">${formateerDatum(meting.datum)}</p>
        ${meting.notitie ? `<p class="meting-notitie">📝 ${meting.notitie}</p>` : ''}
      </div>
      <div class="geschiedenis-rechts">
        <span class="status-badge" style="color:${status.kleur}">
          ${status.label}
        </span>
        <button class="verwijder-knop" onclick="verwijderEnHerlaad(${meting.id})">🗑️</button>
      </div>
    </div>
  `;
}

function laadGeschiedenispagina() {
  const metingen = laadMetingen().sort((a, b) => b.id - a.id);
  const lijst = document.getElementById('geschiedenis-lijst');
  const badge = document.getElementById('totaal-badge');

  if (!lijst) return;

  if (badge) badge.textContent = metingen.length + ' metingen';

  if (metingen.length === 0) {
    lijst.innerHTML = '<p class="leeg-tekst">Nog geen metingen.</p>';
    document.getElementById('paginatie').innerHTML = '';
    return;
  }

  const totaalPaginas = Math.ceil(metingen.length / ITEMS_PER_PAGINA);
  if (huidigePagina > totaalPaginas) huidigePagina = totaalPaginas;

  const start = (huidigePagina - 1) * ITEMS_PER_PAGINA;
  const einde = start + ITEMS_PER_PAGINA;
  const paginaMetingen = metingen.slice(start, einde);

  lijst.innerHTML = paginaMetingen.map(maakGeschiedenisItemHTML).join('');

  document.getElementById('paginatie').innerHTML = `
    <button ${huidigePagina === 1 ? 'disabled' : ''} onclick="vorigePagina()">Vorige</button>
    <span>Pagina ${huidigePagina} van ${totaalPaginas}</span>
    <button ${huidigePagina === totaalPaginas ? 'disabled' : ''} onclick="volgendePagina()">Volgende</button>
  `;
}

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

function controleerDesktop() {
  const overlay = document.getElementById('desktop-overlay');
  if (!overlay) return;

  // Detecteer mobiel via user-agent
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    overlay.style.display = 'none';
    return;
  }

  // Desktop → overlay tonen
  if (window.innerWidth > 800) {
    overlay.style.display = 'flex';

    // QR-code naar de huidige pagina-URL
    const url = encodeURIComponent(window.location.href);
    const qr = document.getElementById('desktop-qr');
    if (qr) {
      qr.src =
        'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' + url;
    }
  } else {
    overlay.style.display = 'none';
  }
}

controleerDesktop();
window.addEventListener('resize', controleerDesktop);

document.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        const target = this.getAttribute('href');
        window.location.href = target;
    });
});


