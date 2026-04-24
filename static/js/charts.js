/**
 * charts.js — All Plotly chart rendering functions for FCF Viewer
 *
 * Exports (called from index.html inline script):
 *   renderRhsByStage, renderWaterValueByStage, renderHeatmapRhs,
 *   renderSurface3dRhs, renderSurface3dWaterValue, renderFcfEnvelope,
 *   renderBoxplotRhs, renderDataTable
 */

const PALETTE = [
  '#00d4aa', '#f97316', '#6366f1', '#ec4899',
  '#22d3ee', '#a3e635', '#fb923c', '#c084fc',
];

const BASE_LAYOUT = {
  paper_bgcolor: 'transparent',
  plot_bgcolor:  'transparent',
  font: {
    family: "'IBM Plex Mono', monospace",
    color:  '#94a3b8',
    size:   11,
  },
  margin: { t: 10, b: 50, l: 68, r: 20 },
  xaxis: {
    gridcolor: '#1e2a38',
    zerolinecolor: '#1e2a38',
    tickfont: { size: 10 },
  },
  yaxis: {
    gridcolor: '#1e2a38',
    zerolinecolor: '#1e2a38',
    tickfont: { size: 10 },
  },
  legend: { bgcolor: 'transparent', font: { size: 10 } },
};

const CFG = { responsive: true, displayModeBar: false };

// ── 01 · RHS por Estágio ────────────────────────────────────────────────
function renderRhsByStage(divId, data) {
  const traces = [];
  for (let c = 1; c <= data.max_cut; c++) {
    const pts = data.cuts.filter(d => d.cut === c).sort((a, b) => a.stage - b.stage);
    if (!pts.length) continue;
    traces.push({
      x: pts.map(d => d.stage),
      y: pts.map(d => d.rhs),
      name: `Corte ${c}`,
      mode: 'lines+markers',
      line:   { color: PALETTE[(c - 1) % PALETTE.length], width: 2 },
      marker: { size: 6, color: PALETTE[(c - 1) % PALETTE.length] },
    });
  }
  Plotly.newPlot(divId, traces, {
    ...BASE_LAYOUT,
    xaxis: { ...BASE_LAYOUT.xaxis, title: 'Estágio', dtick: 1 },
    yaxis: { ...BASE_LAYOUT.yaxis, title: `RHS (${data.rhs_unit})` },
  }, CFG);
}

// ── 02 · Valor da Água por Estágio ──────────────────────────────────────
function renderWaterValueByStage(divId, data, hydroName) {
  hydroName = hydroName || data.hydros[0];
  const traces = [];
  for (let c = 1; c <= data.max_cut; c++) {
    const pts = data.cuts.filter(d => d.cut === c).sort((a, b) => a.stage - b.stage);
    if (!pts.length) continue;
    traces.push({
      x: pts.map(d => d.stage),
      y: pts.map(d => d.hydros[hydroName]),
      name: `Corte ${c}`,
      mode: 'lines+markers',
      line: {
        color: PALETTE[(c - 1) % PALETTE.length],
        width: 2,
        dash: c > 4 ? 'dot' : 'solid',
      },
      marker: {
        size: 6,
        symbol: c > 4 ? 'diamond' : 'circle',
        color: PALETTE[(c - 1) % PALETTE.length],
      },
    });
  }
  Plotly.newPlot(divId, traces, {
    ...BASE_LAYOUT,
    xaxis: { ...BASE_LAYOUT.xaxis, title: 'Estágio', dtick: 1 },
    yaxis: { ...BASE_LAYOUT.yaxis, title: `Val. Água ${hydroName} (${data.vol_unit})` },
  }, CFG);
}

// ── 03 · Envelope da FCF ────────────────────────────────────────────────
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
      name: `Corte ${cut.cut}`,
      mode: 'lines',
      line: { color: PALETTE[idx % PALETTE.length], width: 1.5, dash: 'dot' },
      opacity: 0.55,
      hovertemplate: `Corte ${cut.cut}<br>V=%{x:.1f} hm³<br>FCF=%{y:.2f} ${data.rhs_unit}<extra></extra>`,
    });
  });

  traces.push({
    x: vols, y: envY,
    name: 'Envelope (FCF)',
    mode: 'lines',
    line: { color: '#00d4aa', width: 3 },
    fill: 'tozeroy',
    fillcolor: 'rgba(0,212,170,0.07)',
    hovertemplate: `Envelope<br>V=%{x:.1f} hm³<br>FCF=%{y:.2f} ${data.rhs_unit}<extra></extra>`,
  });

  Plotly.newPlot(divId, traces, {
    ...BASE_LAYOUT,
    margin: { ...BASE_LAYOUT.margin, b: 55 },
    xaxis: { ...BASE_LAYOUT.xaxis, title: `Volume ${hydroName} (hm³)` },
    yaxis: { ...BASE_LAYOUT.yaxis, title: `FCF (${data.rhs_unit})` },
  }, CFG);
}

// ── 04 · Heatmap RHS ────────────────────────────────────────────────────
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
    x: cuts.map(c => `Corte ${c}`),
    y: stages.map(s => `Stage ${s}`),
    colorscale: [
      [0,   '#0f2027'],
      [0.3, '#1e4d6b'],
      [0.6, '#00d4aa'],
      [1,   '#f97316'],
    ],
    colorbar: {
      tickfont: { size: 9, color: '#64748b' },
      title: { text: data.rhs_unit, font: { size: 10, color: '#64748b' } },
    },
    zsmooth: false,
    hoverongaps: false,
  }], {
    ...BASE_LAYOUT,
    margin: { t: 10, b: 60, l: 80, r: 80 },
    xaxis: { ...BASE_LAYOUT.xaxis, title: 'Número do Corte' },
    yaxis: { ...BASE_LAYOUT.yaxis, title: 'Estágio', autorange: 'reversed' },
  }, CFG);
}

// ── 05 · 3D Surface — RHS ───────────────────────────────────────────────
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
      [0, '#0f2027'], [0.4, '#1e4d6b'], [0.7, '#00d4aa'], [1, '#f97316'],
    ],
    opacity: 0.92,
    contours: { z: { show: true, usecolormap: true, project: { z: true } } },
    colorbar: { tickfont: { size: 9, color: '#64748b' } },
  }], {
    paper_bgcolor: 'transparent',
    font: { family: "'IBM Plex Mono', monospace", color: '#94a3b8', size: 10 },
    margin: { t: 10, b: 10, l: 10, r: 10 },
    scene: {
      bgcolor: '#0b0f14',
      xaxis: { title: 'Estágio',         gridcolor: '#1e2a38', zerolinecolor: '#1e2a38' },
      yaxis: { title: 'Corte',           gridcolor: '#1e2a38', zerolinecolor: '#1e2a38' },
      zaxis: { title: `RHS (${data.rhs_unit})`, gridcolor: '#1e2a38', zerolinecolor: '#1e2a38' },
      camera: { eye: { x: 1.6, y: -1.6, z: 1.0 } },
    },
  }, CFG);
}

// ── 06 · 3D Surface — Valor da Água ─────────────────────────────────────
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
      [0, '#1a0533'], [0.3, '#6366f1'], [0.7, '#ec4899'], [1, '#f97316'],
    ],
    opacity: 0.92,
    contours: { z: { show: true, usecolormap: true, project: { z: true } } },
    colorbar: { tickfont: { size: 9, color: '#64748b' } },
  }], {
    paper_bgcolor: 'transparent',
    font: { family: "'IBM Plex Mono', monospace", color: '#94a3b8', size: 10 },
    margin: { t: 10, b: 10, l: 10, r: 10 },
    scene: {
      bgcolor: '#0b0f14',
      xaxis: { title: 'Estágio',    gridcolor: '#1e2a38', zerolinecolor: '#1e2a38' },
      yaxis: { title: 'Corte',      gridcolor: '#1e2a38', zerolinecolor: '#1e2a38' },
      zaxis: {
        title: `${hydroName} (${data.vol_unit})`,
        gridcolor: '#1e2a38', zerolinecolor: '#1e2a38',
      },
      camera: { eye: { x: 1.6, y: -1.6, z: 1.0 } },
    },
  }, CFG);
}

// ── 07 · Box Plot — RHS por Estágio ─────────────────────────────────────
function renderBoxplotRhs(divId, data) {
  const traces = data.stages.map((s, idx) => {
    const vals = data.cuts.filter(d => d.stage === s).map(d => d.rhs);
    return {
      type:      'box',
      y:         vals,
      name:      `S${s}`,
      marker:    { color: PALETTE[idx % PALETTE.length], size: 5 },
      line:      { color: PALETTE[idx % PALETTE.length] },
      fillcolor: PALETTE[idx % PALETTE.length] + '28',
      boxpoints: 'all',
      jitter:    0.35,
      pointpos:  -1.6,
    };
  });
  Plotly.newPlot(divId, traces, {
    ...BASE_LAYOUT,
    xaxis: { ...BASE_LAYOUT.xaxis, title: 'Estágio' },
    yaxis: { ...BASE_LAYOUT.yaxis, title: `RHS (${data.rhs_unit})` },
    showlegend: false,
  }, CFG);
}

// ── 08 · Tabela de Dados ────────────────────────────────────────────────
function renderDataTable(divId, data) {
  const hydros  = data.hydros;
  const headers = [
    'Estágio', 'Corte', 'Iter.', 'Cluster', 'Cenário',
    `RHS (${data.rhs_unit})`,
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
