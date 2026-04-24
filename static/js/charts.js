/**
 * charts.js — PSR FCF Viewer · Plotly chart rendering
 *
 * All functions accept (divId, data, …options) and use the t() helper
 * from i18n.js for axis labels so re-renders on language change work.
 *
 * Chart palette: Tableau 10 + extras (user-specified)
 */

const PALETTE = [
  '#4E79A7','#F28E2B','#8CD17D','#B6992D','#E15759',
  '#76B7B2','#FF9DA7','#D7B5A6','#B07AA1','#59A14F',
  '#F1CE63','#A0CBE8',
];

// Plotly layout base for light theme
const _baseLayout = () => ({
  paper_bgcolor: 'transparent',
  plot_bgcolor:  '#fafaf8',
  font: {
    family: "'IBM Plex Mono', 'IBM Plex Sans', monospace",
    color:  '#374151',
    size:   11,
  },
  margin: { t: 16, b: 52, l: 70, r: 18 },
  xaxis: {
    gridcolor:     '#e5e0d8',
    zerolinecolor: '#ccc5b9',
    tickfont: { size: 10 },
    linecolor: '#ccc5b9',
  },
  yaxis: {
    gridcolor:     '#e5e0d8',
    zerolinecolor: '#ccc5b9',
    tickfont: { size: 10 },
    linecolor: '#ccc5b9',
  },
  legend: { bgcolor: 'rgba(255,255,255,.7)', font: { size: 10 }, bordercolor: '#e5e0d8', borderwidth: 1 },
});

const CFG = { responsive: true, displayModeBar: false };

// ── 01 · RHS por Estágio ─────────────────────────────────────────────────
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
      marker: { size: 6, color: PALETTE[(c - 1) % PALETTE.length] },
      hovertemplate: `${t('ax.cut')} ${c}<br>${t('ax.stage')}=%{x}<br>RHS=%{y:.2f}<extra></extra>`,
    });
  }
  Plotly.newPlot(divId, traces, {
    ..._baseLayout(),
    xaxis: { ..._baseLayout().xaxis, title: t('ax.stage'), dtick: 1 },
    yaxis: { ..._baseLayout().yaxis, title: `RHS (${data.rhs_unit})` },
  }, CFG);
}

// ── 02 · Valor da Água por Estágio ───────────────────────────────────────
function renderWaterValueByStage(divId, data, hydroName) {
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
        size: 6,
        symbol: c > 6 ? 'diamond' : 'circle',
        color: PALETTE[(c - 1) % PALETTE.length],
      },
      hovertemplate: `${t('ax.cut')} ${c}<br>${t('ax.stage')}=%{x}<br>${t('ax.wv')}=%{y:.5f}<extra></extra>`,
    });
  }
  Plotly.newPlot(divId, traces, {
    ..._baseLayout(),
    xaxis: { ..._baseLayout().xaxis, title: t('ax.stage'), dtick: 1 },
    yaxis: { ..._baseLayout().yaxis, title: `${t('ax.wv')} ${hydroName} (${data.vol_unit})` },
  }, CFG);
}

// ── 03 · Envelope da FCF ─────────────────────────────────────────────────
function renderFcfEnvelope(divId, data, stage, hydroName, volMax) {
  stage     = stage     ?? data.stages[0];
  hydroName = hydroName ?? data.hydros[0];
  volMax    = volMax    || 1000;

  const stageCuts = data.cuts.filter(d => d.stage === stage);
  const N    = 300;
  const vols = Array.from({ length: N + 1 }, (_, i) => (i / N) * volMax);

  const traces = [];
  const envY   = new Array(N + 1).fill(-Infinity);

  stageCuts.forEach((cut, idx) => {
    const wv = cut.hydros[hydroName] ?? 0;
    const y  = vols.map(v => cut.rhs + wv * v);
    y.forEach((val, i) => { if (val > envY[i]) envY[i] = val; });
    traces.push({
      x: vols, y,
      name: `${t('ax.cut')} ${cut.cut}`,
      mode: 'lines',
      line: { color: PALETTE[idx % PALETTE.length], width: 1.5, dash: 'dot' },
      opacity: 0.55,
      hovertemplate:
        `${t('ax.cut')} ${cut.cut}<br>${t('ax.vol')}=%{x:.1f} hm³<br>FCF=%{y:.2f} ${data.rhs_unit}<extra></extra>`,
    });
  });

  // Envelope line
  traces.push({
    x: vols, y: envY,
    name: `Envelope (${t('ax.fcf')})`,
    mode: 'lines',
    line: { color: '#092746', width: 2.5 },
    fill: 'tozeroy',
    fillcolor: 'rgba(9,39,70,.06)',
    hovertemplate:
      `Envelope<br>${t('ax.vol')}=%{x:.1f} hm³<br>${t('ax.fcf')}=%{y:.2f} ${data.rhs_unit}<extra></extra>`,
  });

  Plotly.newPlot(divId, traces, {
    ..._baseLayout(),
    xaxis: { ..._baseLayout().xaxis, title: `${t('ax.vol')} ${hydroName} (hm³)` },
    yaxis: { ..._baseLayout().yaxis, title: `${t('ax.fcf')} (${data.rhs_unit})` },
  }, CFG);
}

// ── 04 · Heatmap RHS ─────────────────────────────────────────────────────
function renderHeatmapRhs(divId, data) {
  const stages = data.stages;
  const cuts   = Array.from({ length: data.max_cut }, (_, i) => i + 1);
  const z = stages.map(s =>
    cuts.map(c => {
      const f = data.cuts.find(d => d.stage === s && d.cut === c);
      return f ? f.rhs : null;
    })
  );
  Plotly.newPlot(divId, [{
    type: 'heatmap',
    z,
    x: cuts.map(c => `${t('ax.cut')} ${c}`),
    y: stages.map(s => `${t('ax.stage')} ${s}`),
    colorscale: [
      [0,   '#fff3df'],
      [0.35,'#f0c97a'],
      [0.65,'#ab9671'],
      [1,   '#092746'],
    ],
    colorbar: {
      tickfont: { size: 9, color: '#6b7280' },
      title: { text: data.rhs_unit, font: { size: 10, color: '#6b7280' } },
    },
    zsmooth: false,
    hoverongaps: false,
    hovertemplate:
      `${t('ax.stage')} %{y}<br>${t('ax.cut')} %{x}<br>RHS=%{z:.2f}<extra></extra>`,
  }], {
    ..._baseLayout(),
    margin: { t: 16, b: 60, l: 86, r: 80 },
    xaxis: { ..._baseLayout().xaxis, title: t('ax.cut_num') },
    yaxis: { ..._baseLayout().yaxis, title: t('ax.stage'), autorange: 'reversed' },
  }, CFG);
}

// ── 05 · 3D Surface — RHS ────────────────────────────────────────────────
function renderSurface3dRhs(divId, data) {
  const stages = data.stages;
  const cuts   = Array.from({ length: data.max_cut }, (_, i) => i + 1);
  const z = cuts.map(c =>
    stages.map(s => {
      const f = data.cuts.find(d => d.stage === s && d.cut === c);
      return f ? f.rhs : null;
    })
  );
  Plotly.newPlot(divId, [{
    type: 'surface', x: stages, y: cuts, z,
    colorscale: [
      [0, '#fff3df'], [0.4, '#e0b86a'], [0.7, '#ab9671'], [1, '#092746'],
    ],
    opacity: 0.92,
    contours: { z: { show: true, usecolormap: true, project: { z: true } } },
    colorbar: { tickfont: { size: 9, color: '#6b7280' } },
  }], {
    paper_bgcolor: 'transparent',
    font: { family: "'IBM Plex Mono', monospace", color: '#374151', size: 10 },
    margin: { t: 10, b: 10, l: 10, r: 10 },
    scene: {
      bgcolor: '#fafaf8',
      xaxis: { title: t('ax.stage'), gridcolor: '#ddd7cc', zerolinecolor: '#ccc5b9' },
      yaxis: { title: t('ax.cut'),   gridcolor: '#ddd7cc', zerolinecolor: '#ccc5b9' },
      zaxis: { title: `RHS (${data.rhs_unit})`, gridcolor: '#ddd7cc', zerolinecolor: '#ccc5b9' },
      camera: { eye: { x: 1.6, y: -1.6, z: 1.0 } },
    },
  }, CFG);
}

// ── 06 · 3D Surface — Water Value ────────────────────────────────────────
function renderSurface3dWaterValue(divId, data, hydroName) {
  hydroName = hydroName || data.hydros[0];
  const stages = data.stages;
  const cuts   = Array.from({ length: data.max_cut }, (_, i) => i + 1);
  const z = cuts.map(c =>
    stages.map(s => {
      const f = data.cuts.find(d => d.stage === s && d.cut === c);
      return f ? (f.hydros[hydroName] ?? null) : null;
    })
  );
  Plotly.newPlot(divId, [{
    type: 'surface', x: stages, y: cuts, z,
    colorscale: [
      [0, '#fff3df'], [0.35, '#76B7B2'], [0.65, '#4E79A7'], [1, '#092746'],
    ],
    opacity: 0.92,
    contours: { z: { show: true, usecolormap: true, project: { z: true } } },
    colorbar: { tickfont: { size: 9, color: '#6b7280' } },
  }], {
    paper_bgcolor: 'transparent',
    font: { family: "'IBM Plex Mono', monospace", color: '#374151', size: 10 },
    margin: { t: 10, b: 10, l: 10, r: 10 },
    scene: {
      bgcolor: '#fafaf8',
      xaxis: { title: t('ax.stage'),  gridcolor: '#ddd7cc', zerolinecolor: '#ccc5b9' },
      yaxis: { title: t('ax.cut'),    gridcolor: '#ddd7cc', zerolinecolor: '#ccc5b9' },
      zaxis: {
        title: `${t('ax.wv')} ${hydroName} (${data.vol_unit})`,
        gridcolor: '#ddd7cc', zerolinecolor: '#ccc5b9',
      },
      camera: { eye: { x: 1.6, y: -1.6, z: 1.0 } },
    },
  }, CFG);
}

// ── 07 · Box Plot — RHS por Estágio ──────────────────────────────────────
function renderBoxplotRhs(divId, data) {
  const traces = data.stages.map((s, idx) => {
    const vals = data.cuts.filter(d => d.stage === s).map(d => d.rhs);
    return {
      type:      'box',
      y:         vals,
      name:      `${t('ax.stage')} ${s}`,
      marker:    { color: PALETTE[idx % PALETTE.length], size: 5 },
      line:      { color: PALETTE[idx % PALETTE.length] },
      fillcolor: PALETTE[idx % PALETTE.length] + '30',
      boxpoints: 'all',
      jitter:    0.35,
      pointpos:  -1.6,
    };
  });
  Plotly.newPlot(divId, traces, {
    ..._baseLayout(),
    xaxis: { ..._baseLayout().xaxis, title: t('ax.stage') },
    yaxis: { ..._baseLayout().yaxis, title: `RHS (${data.rhs_unit})` },
    showlegend: false,
  }, CFG);
}

// ── 08 · Tabela de Dados ─────────────────────────────────────────────────
function renderDataTable(divId, data) {
  const hydros  = data.hydros;
  const headers = [
    t('th.stage'), t('th.cut'), t('th.iter'), t('th.cluster'), t('th.scenario'),
    `${t('th.rhs')} (${data.rhs_unit})`,
    ...hydros.map(h => `${h} (${data.vol_unit})`),
  ];

  const thCells = headers.map(h => `<th>${h}</th>`).join('');
  const bodyRows = data.cuts.map(c => {
    const cells = [
      c.stage, c.cut, c.iter, c.cluster, c.scenario,
      c.rhs != null ? c.rhs.toFixed(4) : '—',
      ...hydros.map(h => c.hydros[h] != null ? c.hydros[h].toFixed(6) : '—'),
    ];
    return `<tr>${cells.map(v => `<td>${v}</td>`).join('')}</tr>`;
  }).join('');

  document.getElementById(divId).innerHTML = `
    <div class="table-wrapper">
      <table class="data-table">
        <thead><tr>${thCells}</tr></thead>
        <tbody>${bodyRows}</tbody>
      </table>
    </div>`;
}

// ── Re-render all charts (called on language change) ──────────────────────
function renderAll(data) {
  if (!data) return;
  const h0 = data._selectedHydro || data.hydros[0];
  const s0 = data._selectedStage || data.stages[0];
  const vm = data._volMax        || 1000;

  renderRhsByStage(         'chart-rhs',      data);
  renderWaterValueByStage(  'chart-wv',        data, h0);
  renderFcfEnvelope(        'chart-envelope',  data, s0, h0, vm);
  renderHeatmapRhs(         'chart-heatmap',   data);
  renderSurface3dRhs(       'chart-3d-rhs',    data);
  renderSurface3dWaterValue('chart-3d-wv',     data, h0);
  renderBoxplotRhs(         'chart-boxplot',   data);
  renderDataTable(          'chart-table',     data);
}
