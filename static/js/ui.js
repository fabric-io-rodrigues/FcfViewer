/**
 * ui.js — Upload, language switcher, controls, stats, helpers
 *
 * Depends on: i18n.js  data.js  charts.js
 * Calls back into the inline script in index.html: onDataLoaded()
 */

// ── Language switcher ─────────────────────────────────────────────────────

function setupLangSwitcher() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      applyLang(lang);
      // Re-render charts if data is loaded (axis labels change)
      const data = getFcfData();
      if (data) renderAll(data);
    });
  });
  // Apply saved/default language
  initLang();
}

// ── Upload zone ───────────────────────────────────────────────────────────

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
    input.value = '';
  });
}

async function _handleFile(file) {
  setLoading(`${t('upload.title').split(' ')[0]}… ${file.name}`);
  try {
    const data = await parseFcfFile(file);
    onDataLoaded(data);
  } catch (e) {
    showError(e.message);
  } finally {
    setLoading(null);
  }
}

// ── URL / path loader ─────────────────────────────────────────────────────

function setupUrlLoad() {
  const btn = document.getElementById('btn-load-url');
  const inp = document.getElementById('url-input');

  btn.addEventListener('click',   () => _handleUrl(inp.value.trim()));
  inp.addEventListener('keydown', e  => { if (e.key === 'Enter') _handleUrl(inp.value.trim()); });
}

async function _handleUrl(url) {
  if (!url) return;
  setLoading(`${url}…`);
  try {
    const data = await parseFcfUrl(url);
    onDataLoaded(data);
  } catch (e) {
    showError(e.message);
  } finally {
    setLoading(null);
  }
}

// ── Export JSON button ────────────────────────────────────────────────────

function setupExportBtn() {
  document.getElementById('btn-export')
    ?.addEventListener('click', exportFcfJson);
}

// ── Controls ──────────────────────────────────────────────────────────────

function setupControls(data) {
  data._selectedStage = data.stages[0];
  data._selectedHydro = data.hydros[0];
  data._volMax        = 1000;

  const stgSel   = document.getElementById('sel-stage');
  const hydSel   = document.getElementById('sel-hydro');
  const volInput = document.getElementById('inp-vol-max');

  stgSel.innerHTML = data.stages
    .map(s => `<option value="${s}">${t('ax.stage')} ${s}</option>`)
    .join('');
  stgSel.value = data._selectedStage;

  hydSel.innerHTML = data.hydros
    .map(h => `<option value="${h}">${h}</option>`)
    .join('');
  hydSel.value = data._selectedHydro;

  volInput.value = data._volMax;

  stgSel.addEventListener('change', () => {
    data._selectedStage = parseInt(stgSel.value, 10);
    renderFcfEnvelope('chart-envelope', data, data._selectedStage, data._selectedHydro, data._volMax);
  });

  hydSel.addEventListener('change', () => {
    data._selectedHydro = hydSel.value;
    renderWaterValueByStage(  'chart-wv',       data, data._selectedHydro);
    renderSurface3dWaterValue('chart-3d-wv',    data, data._selectedHydro);
    renderFcfEnvelope(        'chart-envelope', data, data._selectedStage, data._selectedHydro, data._volMax);
  });

  volInput.addEventListener('change', () => {
    data._volMax = parseFloat(volInput.value) || 1000;
    renderFcfEnvelope('chart-envelope', data, data._selectedStage, data._selectedHydro, data._volMax);
  });
}

// ── Stats panel ───────────────────────────────────────────────────────────

function updateStats(data) {
  const rhsVals = data.cuts.map(c => c.rhs).filter(v => v != null);
  const minRhs  = Math.min(...rhsVals);
  const maxRhs  = Math.max(...rhsVals);
  const fmt     = v => v.toLocaleString('pt-BR', { maximumFractionDigits: 0 });

  _setText('stat-stages',    data.stages.length);
  _setText('stat-cuts',      data.cuts.length);
  _setText('stat-max-cut',   data.max_cut);
  _setText('stat-rhs-range', `${fmt(minRhs)} – ${fmt(maxRhs)}`);
  _setText('stat-rhs-unit',  data.rhs_unit);
  _setText('stat-hydros',    data.hydros.length);
  _setText('stat-filename',  data.filename || '—');
}

// ── Metadata panel (PSR binary info) ─────────────────────────────────────

function updateMetaPanel(data) {
  const meta = data.metadata;
  const panel = document.getElementById('meta-panel');
  if (!panel || !meta || Object.keys(meta).length === 0) return;

  const items = [];
  if (meta.anoini) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    items.push(`<span class="meta-item"><strong>${t('meta.period')}</strong> ${months[(meta.mesini||1)-1]}/${meta.anoini} · ${meta.nper} ${t('ax.stage').toLowerCase()}s</span>`);
  }
  if (meta.iter)    items.push(`<span class="meta-item"><strong>${t('meta.iter')}</strong> ${meta.iter}</span>`);
  if (meta.zinf)    items.push(`<span class="meta-item"><strong>${t('meta.zinf')}</strong> ${meta.zinf.toFixed(2)} ${data.rhs_unit}</span>`);
  if (meta.zsup)    items.push(`<span class="meta-item"><strong>${t('meta.zsup')}</strong> ${meta.zsup.toFixed(2)} ${data.rhs_unit}</span>`);
  if (meta.itbst)   items.push(`<span class="meta-item"><strong>${t('meta.itbst')}</strong> ${meta.itbst}</span>`);
  if (meta.zsupbst) items.push(`<span class="meta-item"><strong>${t('meta.zsupbst')}</strong> ${meta.zsupbst.toFixed(2)} ${data.rhs_unit}</span>`);

  if (items.length) {
    panel.innerHTML = items.join('');
    panel.classList.add('visible');
  }
}

// ── UI helpers ────────────────────────────────────────────────────────────

function showSection(id) {
  document.getElementById(id).style.display = '';
}

function setLoading(msg) {
  const el  = document.getElementById('loading');
  const txt = document.getElementById('loading-msg');
  if (msg) { txt.textContent = msg; el.style.display = 'flex'; }
  else      { el.style.display = 'none'; }
}

function showError(msg) {
  const el = document.getElementById('error-banner');
  el.textContent = msg;
  el.style.display = '';
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.display = 'none'; }, 10000);
}

function _setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
