/**
 * ui.js — Upload zone, controls, stats panel, error/loading helpers
 *
 * Depends on:  data.js (parseFcfFile, parseFcfUrl, setFcfData)
 *              charts.js (all render* functions)
 * Calls back into the inline script in index.html via onDataLoaded().
 */

// ── Upload zone ──────────────────────────────────────────────────────────

function setupDropZone() {
  const zone  = document.getElementById('drop-zone');
  const input = document.getElementById('file-input');

  zone.addEventListener('dragover', e => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', async e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) await _handleFile(file);
  });
  zone.addEventListener('click', () => input.click());
  input.addEventListener('change', async e => {
    if (e.target.files[0]) await _handleFile(e.target.files[0]);
    input.value = '';   // reset so same file can be re-selected
  });
}

async function _handleFile(file) {
  setLoading(`Lendo ${file.name}…`);
  try {
    const data = await parseFcfFile(file);
    onDataLoaded(data);
  } catch (e) {
    showError(`Erro ao ler arquivo: ${e.message}`);
  } finally {
    setLoading(null);
  }
}

// ── URL / path loader ────────────────────────────────────────────────────

function setupUrlLoad() {
  const btn = document.getElementById('btn-load-url');
  const inp = document.getElementById('url-input');

  btn.addEventListener('click',  () => _handleUrl(inp.value.trim()));
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') _handleUrl(inp.value.trim()); });
}

async function _handleUrl(url) {
  if (!url) return;
  setLoading(`Carregando ${url}…`);
  try {
    const data = await parseFcfUrl(url);
    onDataLoaded(data);
  } catch (e) {
    showError(`Erro ao carregar URL: ${e.message}`);
  } finally {
    setLoading(null);
  }
}

// ── Controls ─────────────────────────────────────────────────────────────

let _selectedStage = null;
let _selectedHydro = null;
let _volMax        = 1000;

function setupControls(data) {
  _selectedStage = data.stages[0];
  _selectedHydro = data.hydros[0];
  _volMax        = 1000;

  const stgSel   = document.getElementById('sel-stage');
  const hydSel   = document.getElementById('sel-hydro');
  const volInput = document.getElementById('inp-vol-max');

  // populate stage selector
  stgSel.innerHTML = data.stages
    .map(s => `<option value="${s}">Estágio ${s}</option>`)
    .join('');
  stgSel.value = _selectedStage;

  // populate hydro selector
  hydSel.innerHTML = data.hydros
    .map(h => `<option value="${h}">${h}</option>`)
    .join('');
  hydSel.value = _selectedHydro;

  volInput.value = _volMax;

  // listeners
  stgSel.addEventListener('change', () => {
    _selectedStage = parseInt(stgSel.value, 10);
    renderFcfEnvelope('chart-envelope', data, _selectedStage, _selectedHydro, _volMax);
  });

  hydSel.addEventListener('change', () => {
    _selectedHydro = hydSel.value;
    renderWaterValueByStage('chart-wv',      data, _selectedHydro);
    renderSurface3dWaterValue('chart-3d-wv', data, _selectedHydro);
    renderFcfEnvelope('chart-envelope',      data, _selectedStage, _selectedHydro, _volMax);
  });

  volInput.addEventListener('change', () => {
    _volMax = parseFloat(volInput.value) || 1000;
    renderFcfEnvelope('chart-envelope', data, _selectedStage, _selectedHydro, _volMax);
  });
}

// ── Stats panel ──────────────────────────────────────────────────────────

function updateStats(data) {
  const rhsVals = data.cuts.map(c => c.rhs).filter(v => v != null);
  const minRhs  = Math.min(...rhsVals);
  const maxRhs  = Math.max(...rhsVals);
  const fmt     = v => v.toLocaleString('pt-BR', { maximumFractionDigits: 0 });

  _setText('stat-stages',   data.stages.length);
  _setText('stat-cuts',     data.cuts.length);
  _setText('stat-max-cut',  data.max_cut);
  _setText('stat-rhs-range', `${fmt(minRhs)} – ${fmt(maxRhs)}`);
  _setText('stat-rhs-unit', data.rhs_unit);
  _setText('stat-hydros',   data.hydros.length);
  _setText('stat-filename', data.filename || '—');
}

// ── UI helpers ───────────────────────────────────────────────────────────

function showSection(id) {
  document.getElementById(id).style.display = '';
}

function setLoading(msg) {
  const el  = document.getElementById('loading');
  const txt = document.getElementById('loading-msg');
  if (msg) {
    txt.textContent  = msg;
    el.style.display = 'flex';
  } else {
    el.style.display = 'none';
  }
}

function showError(msg) {
  const el = document.getElementById('error-banner');
  el.textContent  = msg;
  el.style.display = '';
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.style.display = 'none'; }, 9000);
}

function _setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
