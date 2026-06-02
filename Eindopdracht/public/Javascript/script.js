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

