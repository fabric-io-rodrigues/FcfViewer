/**
 * ui.js — Language switcher, tabs, upload, controls, stats, samples
 *
 * Depends on: i18n.js  data.js  charts.js
 * index.html inline script defines: onDataLoaded()
 */

/* ── Language switcher ───────────────────────────────────────────────────── */

function setupLangSwitcher() {
  initLang();
}

function onAppLangChange(lang) {
  applyLang(lang);
  const d = getFcfData();
  if (d) renderAll(d);
}

/* ── Chart info panels ───────────────────────────────────────────────────── */

function setupChartInfo() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.chart-info-btn');
    if (!btn) return;
    const box = document.getElementById(btn.dataset.infoTarget);
    if (!box) return;
    const open = box.classList.toggle('visible');
    btn.classList.toggle('active', open);
  });
}

/* ── Tab navigation ──────────────────────────────────────────────────────── */

function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => _activateTab(btn.dataset.tab));
  });
}

function _activateTab(id) {
  document.querySelectorAll('.tab-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === id)
  );
  document.querySelectorAll('.tab-panel').forEach(p =>
    p.classList.toggle('active', p.id === id)
  );
  // Trigger Plotly resize for 3D charts that may have rendered while hidden
  setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
}

function activateFirstTab() {
  const first = document.querySelector('.tab-btn');
  if (first) _activateTab(first.dataset.tab);
}

/* ── Sample loaders ──────────────────────────────────────────────────────── */

function setupSamples() {
  document.querySelectorAll('.sample-card').forEach(btn => {
    btn.addEventListener('click', async () => {
      const url = btn.dataset.url;
      if (!url) return;
      btn.classList.add('loading');
      setLoading(btn.querySelector('.sample-card-name').textContent + '…');
      try {
        const d = await parseFcfUrl(url);
        onDataLoaded(d);
      } catch (e) {
        showError(e.message);
      } finally {
        btn.classList.remove('loading');
        setLoading(null);
      }
    });
  });
}

/* ── Upload zone ─────────────────────────────────────────────────────────── */

function setupDropZone() {
  const zone  = document.getElementById('drop-zone');
  const input = document.getElementById('file-input');

  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', async e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const f = e.dataTransfer.files[0];
    if (f) await _handleFile(f);
  });
  zone.addEventListener('click', () => input.click());
  input.addEventListener('change', async e => {
    if (e.target.files[0]) await _handleFile(e.target.files[0]);
    input.value = '';
  });
}

async function _handleFile(file) {
  setLoading(file.name + '…');
  try {
    const d = await parseFcfFile(file);
    onDataLoaded(d);
  } catch (e) {
    showError(e.message);
  } finally {
    setLoading(null);
  }
}

/* ── URL loader ──────────────────────────────────────────────────────────── */

function setupUrlLoad() {
  const btn = document.getElementById('btn-load-url');
  const inp = document.getElementById('url-input');
  btn.addEventListener('click',    () => _loadUrl(inp.value.trim()));
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') _loadUrl(inp.value.trim()); });
}

async function _loadUrl(url) {
  if (!url) return;
  setLoading(url.split('/').pop() + '…');
  try {
    const d = await parseFcfUrl(url);
    onDataLoaded(d);
  } catch (e) {
    showError(e.message);
  } finally {
    setLoading(null);
  }
}

/* ── Export button ───────────────────────────────────────────────────────── */
function setupExportBtn() {
  document.getElementById('btn-export')?.addEventListener('click', exportFcfJson);
}

/* ── Controls ────────────────────────────────────────────────────────────── */

function setupControls(data) {
  data._hydro  = data.hydros[0];
  data._stage  = data.stages[0];
  data._volMax = 1000;

  const hydSel   = document.getElementById('sel-hydro');
  const stgSel   = document.getElementById('sel-stage');
  const volInput = document.getElementById('inp-vol-max');

  /* Hydro selector */
  hydSel.innerHTML = data.hydros
    .map(h => `<option value="${h}">${h}</option>`)
    .join('');
  hydSel.value = data._hydro;

  /* Stage selector */
  stgSel.innerHTML = data.stages
    .map(s => `<option value="${s}">${t('ax.stage')} ${s}</option>`)
    .join('');
  stgSel.value = data._stage;

  volInput.value = data._volMax;

  hydSel.onchange = () => {
    data._hydro = hydSel.value;
    renderWaterValue(        'chart-wv',     data, data._hydro);
    renderSurface3dWaterValue('chart-3d-wv', data, data._hydro);
    renderEnvelope(          'chart-envelope', data, data._stage, data._hydro, data._volMax);
  };

  stgSel.onchange = () => {
    data._stage = parseInt(stgSel.value, 10);
    renderEnvelope('chart-envelope', data, data._stage, data._hydro, data._volMax);
  };

  volInput.onchange = () => {
    data._volMax = parseFloat(volInput.value) || 1000;
    renderEnvelope('chart-envelope', data, data._stage, data._hydro, data._volMax);
  };
}

/* ── Stats panel ─────────────────────────────────────────────────────────── */

function updateStats(data) {
  const rhs  = data.cuts.map(c => c.rhs).filter(v => v != null);
  const lo   = Math.min(...rhs);
  const hi   = Math.max(...rhs);
  const fmt  = v => v.toLocaleString('pt-BR', { maximumFractionDigits: 0 });

  _set('stat-stages',    data.stages.length);
  _set('stat-cuts',      data.cuts.length);
  _set('stat-max-cut',   data.max_cut);
  _set('stat-rhs-range', `${fmt(lo)} – ${fmt(hi)}`);
  _set('stat-rhs-unit',  data.rhs_unit);
  _set('stat-reservoirs', data.hydros.length);
  _set('stat-file',      data.filename || '—');

  /* Navbar filename */
  const nf = document.getElementById('nav-file');
  if (nf) nf.textContent = data.filename || '';
}

/* ── Metadata panel (PSR header values) ──────────────────────────────────── */

function updateMetaPanel(data) {
  const meta  = data.metadata || {};
  const panel = document.getElementById('meta-panel');
  if (!panel || !Object.keys(meta).length) return;

  const items = [];
  if (meta.anoini) {
    const m = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    items.push(`<span class="meta-item"><strong>${t('meta.period')}</strong> ${m[(meta.mesini||1)-1]}/${meta.anoini}</span>`);
  }
  if (meta.nper)    items.push(`<span class="meta-item"><strong>${t('meta.stages')}</strong> ${meta.nper}</span>`);
  if (meta.iter)    items.push(`<span class="meta-item"><strong>${t('meta.iter')}</strong> ${meta.iter}</span>`);
  if (meta.zinf != null) items.push(`<span class="meta-item"><strong>${t('meta.zinf')}</strong> ${_fmtNum(meta.zinf)} ${data.rhs_unit}</span>`);
  if (meta.zsup != null) items.push(`<span class="meta-item"><strong>${t('meta.zsup')}</strong> ${_fmtNum(meta.zsup)} ${data.rhs_unit}</span>`);
  if (meta.zinf != null && meta.zsup != null && meta.zsup !== 0) {
    const gap = Math.abs((meta.zsup - meta.zinf) / meta.zsup * 100).toFixed(2);
    items.push(`<span class="meta-item"><strong>${t('meta.gap')}</strong> ${gap}%</span>`);
  }

  if (items.length) {
    panel.innerHTML = items.join('');
    panel.classList.add('visible');
  }
}

/* ── New-file button (returns to landing) ────────────────────────────────── */

function setupNewFileBtn() {
  document.getElementById('btn-new-file')?.addEventListener('click', showLanding);
}

/* ── View switching ──────────────────────────────────────────────────────── */

function showDashboard() {
  document.getElementById('view-landing')  .style.display = 'none';
  document.getElementById('view-dashboard').style.display = '';
  document.getElementById('subnav')        .style.display = '';
  document.getElementById('btn-new-file')  .style.display = '';
}

function showLanding() {
  document.getElementById('view-dashboard').style.display = 'none';
  document.getElementById('subnav')        .style.display = 'none';
  document.getElementById('view-landing')  .style.display = '';
  document.getElementById('btn-new-file')  .style.display = 'none';
  document.getElementById('nav-file')      .textContent   = '';
}

/* ── Loading / error ─────────────────────────────────────────────────────── */

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
  el._t = setTimeout(() => { el.style.display = 'none'; }, 12000);
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function _set(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function _fmtNum(v) {
  return v.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
}
