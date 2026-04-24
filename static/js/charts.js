/**
 * charts.js — PSR FCF Viewer · All Plotly chart rendering
 *
 * Palette: Tableau 10 + extras (user-specified)
 * Theme: light (warm whites, PSR gold/blue accents)
 *
 * Public functions:
 *   renderEnvelope, renderRhsByStage, renderWaterValue,
 *   renderBoxplot, renderHeatmap,
 *   renderSurface3dRhs, renderSurface3dWaterValue,
 *   renderDataTable, renderAll
 */

const PALETTE = [
  '#4E79A7','#F28E2B','#8CD17D','#B6992D','#E15759',
  '#76B7B2','#FF9DA7','#D7B5A6','#B07AA1','#59A14F',
  '#F1CE63','#A0CBE8',
];

/* PSR colorscale for heatmap / surfaces: gold → PSR blue */
const PSR_CS = [
  [0,    '#fff8ee'],
  [0.25, '#f0d9a0'],
  [0.55, '#ab9671'],
  [0.8,  '#1d5fa6'],
  [1,    '#092746'],
];

/* Light-theme Plotly base layout */
const _bl = () => ({
  paper_bgcolor: 'transparent',
  plot_bgcolor:  '#fafaf8',
  font: {
    family: "'IBM Plex Mono','IBM Plex Sans',monospace",
    color:  '#374151',
    size:   11,
  },
  margin: { t: 14, b: 52, l: 68, r: 16 },
  xaxis: {
    gridcolor:     '#e6e1d8',
    zerolinecolor: '#ccc5b8',
    linecolor:     '#ccc5b8',
    tickfont: { size: 10 },
  },
  yaxis: {
    gridcolor:     '#e6e1d8',
    zerolinecolor: '#ccc5b8',
    linecolor:     '#ccc5b8',
    tickfont: { size: 10 },
  },
  legend: {
    bgcolor: 'rgba(255,255,255,.8)',
    font: { size: 10 },
    bordercolor: '#e6e1d8',
    borderwidth: 1,
  },
});

const CFG = { responsive: true, displayModeBar: false };

/* ─────────────────────────────────────────────────────────────────────────
   01 · FCF Envelope  (with active-cut highlighting)
   FCF(V) = max_k { c(k) + wv(k)·V }
   ───────────────────────────────────────────────────────────────────────── */
function renderEnvelope(divId, data, stage, hydroName, volMax) {
  stage     = stage     ?? data.stages[0];
  hydroName = hydroName ?? data.hydros[0];
  volMax    = volMax    || 1000;

  const stageCuts = data.cuts.filter(d => d.stage === stage);
  if (!stageCuts.length) { document.getElementById(divId).innerHTML = ''; return; }

  const N    = 400;
  const vols = Array.from({ length: N + 1 }, (_, i) => (i / N) * volMax);

  /* Compute envelope and active cut per point */
  const envY      = new Array(N + 1).fill(-Infinity);
  const activeIdx = new Array(N + 1).fill(0);

  stageCuts.forEach((cut, k) => {
    const wv = cut.hydros[hydroName] ?? 0;
    vols.forEach((v, i) => {
      const y = cut.rhs + wv * v;
      if (y > envY[i]) { envY[i] = y; activeIdx[i] = k; }
    });
  });

  const traces = [];

  /* Individual cut lines (faint) */
  stageCuts.forEach((cut, k) => {
    const wv = cut.hydros[hydroName] ?? 0;
    traces.push({
      x: vols,
      y: vols.map(v => cut.rhs + wv * v),
      name: `${t('ax.cut')} ${cut.cut} (${t('ax.iter')||'iter'} ${cut.iter})`,
      mode: 'lines',
      line: { color: PALETTE[k % PALETTE.length], width: 1.5, dash: 'dot' },
      opacity: 0.5,
      hovertemplate:
        `<b>${t('ax.cut')} ${cut.cut}</b><br>${t('ax.vol')} = %{x:.1f} hm³<br>FCF = %{y:.2f} ${data.rhs_unit}<extra></extra>`,
    });
  });

  /* Envelope: one segment per active cut for coloring */
  const transitions = [0];
  for (let i = 1; i <= N; i++) {
    if (activeIdx[i] !== activeIdx[i - 1]) transitions.push(i);
  }
  transitions.push(N + 1);

  for (let t2 = 0; t2 < transitions.length - 1; t2++) {
    const from = transitions[t2];
    const to   = Math.min(transitions[t2 + 1], N);
    const k    = activeIdx[from];
    const cut  = stageCuts[k];
    traces.push({
      x: vols.slice(from, to + 1),
      y: envY.slice(from, to + 1),
      name: `${t('ax.envelope')} — ${t('ax.cut')} ${cut.cut}`,
      mode: 'lines',
      line: { color: PALETTE[k % PALETTE.length], width: 3 },
      showlegend: t2 === 0,   /* only first segment shows in legend */
      legendgroup: 'envelope',
      hovertemplate:
        `<b>${t('ax.envelope')}</b> (${t('ax.cut')} ${cut.cut})<br>${t('ax.vol')} = %{x:.1f} hm³<br>FCF = %{y:.2f} ${data.rhs_unit}<extra></extra>`,
    });
  }

  /* Fill under envelope */
  traces.push({
    x: vols,
    y: envY,
    name: '_fill',
    mode: 'lines',
    line: { color: 'transparent' },
    fill: 'tozeroy',
    fillcolor: 'rgba(9,39,70,.04)',
    showlegend: false,
    hoverinfo: 'skip',
  });

  const bl = _bl();
  Plotly.newPlot(divId, traces, {
    ...bl,
    margin: { ...bl.margin, b: 56 },
    xaxis: { ...bl.xaxis, title: `${t('ax.vol')} ${hydroName} (hm³)` },
    yaxis: { ...bl.yaxis, title: `${t('ax.fcf')} (${data.rhs_unit})` },
  }, CFG);
}

/* ─────────────────────────────────────────────────────────────────────────
   02 · RHS (Intercepts) by Stage
   ───────────────────────────────────────────────────────────────────────── */
function renderRhsByStage(divId, data) {
  const traces = [];
  for (let c = 1; c <= data.max_cut; c++) {
    const pts = data.cuts.filter(d => d.cut === c).sort((a, b) => a.stage - b.stage);
    if (!pts.length) continue;
    traces.push({
      x: pts.map(d => d.stage),
      y: pts.map(d => d.rhs),
      name: `${t('ax.cut')} ${c}`,
      mode: 'lines+markers',
      line:   { color: PALETTE[(c - 1) % PALETTE.length], width: 2 },
      marker: { size: 5, color: PALETTE[(c - 1) % PALETTE.length] },
      hovertemplate:
        `${t('ax.cut')} ${c}<br>${t('ax.stage')} = %{x}<br>${t('ax.rhs')} = %{y:.2f} ${data.rhs_unit}<extra></extra>`,
    });
  }
  const bl = _bl();
  Plotly.newPlot(divId, traces, {
    ...bl,
    xaxis: { ...bl.xaxis, title: t('ax.stage'), dtick: _dtick(data.stages.length) },
    yaxis: { ...bl.yaxis, title: `${t('ax.rhs')} (${data.rhs_unit})` },
  }, CFG);
}

/* ─────────────────────────────────────────────────────────────────────────
   03 · Water Value by Stage
   ───────────────────────────────────────────────────────────────────────── */
function renderWaterValue(divId, data, hydroName) {
  hydroName = hydroName || data.hydros[0];
  const traces = [];
  for (let c = 1; c <= data.max_cut; c++) {
    const pts = data.cuts.filter(d => d.cut === c).sort((a, b) => a.stage - b.stage);
    if (!pts.length) continue;
    traces.push({
      x: pts.map(d => d.stage),
      y: pts.map(d => d.hydros[hydroName]),
      name: `${t('ax.cut')} ${c}`,
      mode: 'lines+markers',
      line: {
        color: PALETTE[(c - 1) % PALETTE.length],
        width: 2,
        dash: c > 6 ? 'dot' : 'solid',
      },
      marker: {
        size: 5,
        symbol: c > 6 ? 'diamond' : 'circle',
        color: PALETTE[(c - 1) % PALETTE.length],
      },
      hovertemplate:
        `${t('ax.cut')} ${c}<br>${t('ax.stage')} = %{x}<br>${t('ax.wv')} = %{y:.5f}<extra></extra>`,
    });
  }
  const bl = _bl();
  Plotly.newPlot(divId, traces, {
    ...bl,
    xaxis: { ...bl.xaxis, title: t('ax.stage'), dtick: _dtick(data.stages.length) },
    yaxis: { ...bl.yaxis, title: `${t('ax.wv')} ${hydroName} (${data.vol_unit})` },
  }, CFG);
}

/* ─────────────────────────────────────────────────────────────────────────
   04 · Box Plot — RHS distribution by Stage
   ───────────────────────────────────────────────────────────────────────── */
function renderBoxplot(divId, data) {
  const traces = data.stages.map((s, idx) => ({
    type:      'box',
    y:         data.cuts.filter(d => d.stage === s).map(d => d.rhs),
    name:      `${t('ax.stage')} ${s}`,
    marker:    { color: PALETTE[idx % PALETTE.length], size: 4 },
    line:      { color: PALETTE[idx % PALETTE.length] },
    fillcolor: PALETTE[idx % PALETTE.length] + '28',
    boxpoints: data.max_cut <= 20 ? 'all' : 'outliers',
    jitter:    0.3,
    pointpos:  -1.5,
  }));
  const bl = _bl();
  Plotly.newPlot(divId, traces, {
    ...bl,
    margin: { ...bl.margin, b: data.stages.length > 30 ? 70 : 52 },
    xaxis: { ...bl.xaxis, title: t('ax.stage'), tickangle: data.stages.length > 20 ? -45 : 0 },
    yaxis: { ...bl.yaxis, title: `${t('ax.rhs')} (${data.rhs_unit})` },
    showlegend: false,
  }, CFG);
}

/* ─────────────────────────────────────────────────────────────────────────
   05 · Heatmap — RHS (Cuts × Stages)
   ───────────────────────────────────────────────────────────────────────── */
function renderHeatmap(divId, data) {
  const stages = data.stages;
  const cuts   = Array.from({ length: data.max_cut }, (_, i) => i + 1);
  const z = stages.map(s =>
    cuts.map(c => {
      const f = data.cuts.find(d => d.stage === s && d.cut === c);
      return f ? f.rhs : null;
    })
  );
  const bl = _bl();
  Plotly.newPlot(divId, [{
    type: 'heatmap',
    z,
    x: cuts.map(c => `${c}`),
    y: stages.map(s => `${s}`),
    colorscale: PSR_CS,
    colorbar: {
      tickfont: { size: 9, color: '#6b7280' },
      title: { text: data.rhs_unit, font: { size: 10, color: '#6b7280' } },
      thickness: 14,
    },
    zsmooth: false,
    hoverongaps: false,
    hovertemplate:
      `${t('ax.stage')} %{y}  ${t('ax.cut')} %{x}<br>${t('ax.rhs')} = %{z:.2f} ${data.rhs_unit}<extra></extra>`,
  }], {
    ...bl,
    margin: { t: 14, b: 60, l: 68, r: 80 },
    xaxis: { ...bl.xaxis, title: t('ax.cut_num') },
    yaxis: { ...bl.yaxis, title: t('ax.stage'), autorange: 'reversed' },
  }, CFG);
}

/* ─────────────────────────────────────────────────────────────────────────
   06 · 3D Surface — RHS
   ───────────────────────────────────────────────────────────────────────── */
function renderSurface3dRhs(divId, data) {
  const { stages, cuts: cutZ } = _surface3dData(data, null, true);
  Plotly.newPlot(divId, [{
    type: 'surface',
    x: stages,
    y: Array.from({ length: data.max_cut }, (_, i) => i + 1),
    z: cutZ,
    colorscale: PSR_CS,
    opacity: 0.93,
    contours: { z: { show: true, usecolormap: true, project: { z: true } } },
    colorbar: { tickfont: { size: 9, color: '#6b7280' }, thickness: 12 },
    hovertemplate:
      `${t('ax.stage')} %{x}  ${t('ax.cut')} %{y}<br>${t('ax.rhs')} = %{z:.2f}<extra></extra>`,
  }], _scene3d(data.rhs_unit, t('ax.rhs')), CFG);
}

/* ─────────────────────────────────────────────────────────────────────────
   07 · 3D Surface — Water Value
   ───────────────────────────────────────────────────────────────────────── */
function renderSurface3dWaterValue(divId, data, hydroName) {
  hydroName = hydroName || data.hydros[0];
  const { stages, cuts: cutZ } = _surface3dData(data, hydroName, false);
  Plotly.newPlot(divId, [{
    type: 'surface',
    x: stages,
    y: Array.from({ length: data.max_cut }, (_, i) => i + 1),
    z: cutZ,
    colorscale: [
      [0, '#fff8ee'], [0.3, '#76B7B2'], [0.65, '#4E79A7'], [1, '#092746'],
    ],
    opacity: 0.93,
    contours: { z: { show: true, usecolormap: true, project: { z: true } } },
    colorbar: { tickfont: { size: 9, color: '#6b7280' }, thickness: 12 },
    hovertemplate:
      `${t('ax.stage')} %{x}  ${t('ax.cut')} %{y}<br>${t('ax.wv')} = %{z:.4f}<extra></extra>`,
  }], _scene3d(data.vol_unit, `${t('ax.wv')} ${hydroName}`), CFG);
}

/* ─────────────────────────────────────────────────────────────────────────
   08 · Data Table
   ───────────────────────────────────────────────────────────────────────── */
function renderDataTable(divId, data) {
  const hydros = data.hydros;
  const maxHydrosCols = Math.min(hydros.length, 6);   // cap columns for readability
  const shownHydros   = hydros.slice(0, maxHydrosCols);
  const more          = hydros.length - maxHydrosCols;

  const thCells = [
    t('th.stage'), t('th.cut'), t('th.iter'), t('th.cluster'), t('th.scenario'),
    `${t('th.rhs')} (${data.rhs_unit})`,
    ...shownHydros.map(h => `${h} (${data.vol_unit})`),
    ...(more > 0 ? [`+${more} ${t('ax.wv')}`] : []),
  ].map(h => `<th>${h}</th>`).join('');

  const bodyRows = data.cuts.map(c => {
    const cells = [
      c.stage, c.cut, c.iter, c.cluster, c.scenario,
      c.rhs != null ? c.rhs.toFixed(4) : '—',
      ...shownHydros.map(h => c.hydros[h] != null ? c.hydros[h].toFixed(5) : '—'),
      ...(more > 0 ? ['…'] : []),
    ];
    return `<tr>${cells.map(v => `<td>${v}</td>`).join('')}</tr>`;
  }).join('');

  document.getElementById(divId).innerHTML = `
    <div class="table-inner">
      <table class="data-table">
        <thead><tr>${thCells}</tr></thead>
        <tbody>${bodyRows}</tbody>
      </table>
    </div>`;
}

/* ─────────────────────────────────────────────────────────────────────────
   Render all (called on load and on language change)
   ───────────────────────────────────────────────────────────────────────── */
function renderAll(data) {
  if (!data) return;
  const h = data._hydro  || data.hydros[0];
  const s = data._stage  || data.stages[0];
  const v = data._volMax || 1000;

  renderEnvelope(         'chart-envelope', data, s, h, v);
  renderRhsByStage(        'chart-rhs',     data);
  renderWaterValue(        'chart-wv',      data, h);
  renderBoxplot(           'chart-box',     data);
  renderHeatmap(           'chart-heatmap', data);
  renderSurface3dRhs(      'chart-3d-rhs',  data);
  renderSurface3dWaterValue('chart-3d-wv',  data, h);
  renderDataTable(         'chart-table',   data);
}

/* ─────────────────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────────────────── */
function _surface3dData(data, hydroName, useRhs) {
  const stages = data.stages;
  const cuts   = Array.from({ length: data.max_cut }, (_, i) => i + 1);
  const z = cuts.map(c =>
    stages.map(s => {
      const f = data.cuts.find(d => d.stage === s && d.cut === c);
      if (!f) return null;
      return useRhs ? f.rhs : (f.hydros[hydroName] ?? null);
    })
  );
  return { stages, cuts: z };
}

function _scene3d(unit, zTitle) {
  return {
    paper_bgcolor: 'transparent',
    font: {
      family: "'IBM Plex Mono',monospace",
      color: '#374151',
      size: 10,
    },
    margin: { t: 10, b: 10, l: 10, r: 10 },
    scene: {
      bgcolor: '#fafaf8',
      xaxis: { title: t('ax.stage'), gridcolor: '#ddd8ce', zerolinecolor: '#ccc5b8' },
      yaxis: { title: t('ax.cut'),   gridcolor: '#ddd8ce', zerolinecolor: '#ccc5b8' },
      zaxis: { title: `${zTitle} (${unit})`, gridcolor: '#ddd8ce', zerolinecolor: '#ccc5b8' },
      camera: { eye: { x: 1.5, y: -1.5, z: 0.9 } },
    },
  };
}

function _dtick(nStages) {
  if (nStages <= 20)  return 1;
  if (nStages <= 60)  return 5;
  if (nStages <= 120) return 10;
  return 20;
}
