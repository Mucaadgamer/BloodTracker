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

