/**
 * i18n.js — PSR FCF Viewer · Internationalisation
 * Languages: pt (Portuguese), es (Spanish), en (English)
 */

const TRANSLATIONS = {

  /* ── Portuguese ──────────────────────────────────────────────────────── */
  pt: {
    /* Nav */
    'nav.tag': 'SDDP',
    'nav.file_none': '',

    /* Header */
    'hdr.label':    'PSR · SDDP',
    'hdr.title':    'FCF Viewer',
    'hdr.subtitle': 'Função de Custo Futuro',
    'hdr.desc':     'Visualize e analise os cortes de Benders que aproximam a Função de Custo Futuro (FCF) multi-dimensional de cada estágio do SDDP — base das simulações de despacho hidrotérmico.',

    /* Upload */
    'up.drop':      'Arraste o arquivo aqui ou clique para selecionar',
    'up.hint':      'costmexx.psr  ·  costmexx.xls  ·  costmexx.csv',
    'up.url_lbl':   'ou endereço:',
    'up.url_ph':    'http://localhost/data/costmexx.psr',
    'up.btn':       'Carregar',
    'up.samples':   'Casos de exemplo',

    /* Sample names */
    's.exemplo': 'Exemplo Didático',
    's.island':  'Sistema Ilha',
    's.bolivia': 'Bolívia',
    's.brasil':  'Brasil',

    /* Stats */
    'st.stages':    'Estágios',
    'st.cuts':      'Cortes totais',
    'st.max_cut':   'Cortes / estágio',
    'st.rhs_range': 'Intervalo RHS',
    'st.reservoirs':'Reservatórios',
    'st.file':      'Arquivo',

    /* Controls */
    'ctrl.reservoir': 'Reservatório',
    'ctrl.stage':     'Estágio',
    'ctrl.vol_max':   'Vol. máx. (hm³)',
    'ctrl.export':    'Exportar JSON',

    /* Metadata */
    'meta.period':  'Período',
    'meta.stages':  'Estágios',
    'meta.iter':    'Iterações',
    'meta.zinf':    'Z inferior',
    'meta.zsup':    'Z superior',
    'meta.gap':     'Gap',

    /* Tabs */
    'tab.curves':   'Curvas FCF',
    'tab.distrib':  'Distribuição',
    'tab.surfaces': 'Superfícies 3D',
    'tab.data':     'Dados',

    /* Chart titles & descriptions */
    'c.envelope.t': 'Função de Custo Futuro — Envelope',
    'c.envelope.d': 'FCF(V) = max { c(k) + wv(k)·V } para o estágio selecionado. Cada linha tracejada é um corte linear (hiperplano de suporte); a curva sólida é o envelope convexo — a FCF aproximada.',
    'c.rhs.t':      'Interceptos dos Cortes por Estágio',
    'c.rhs.d':      'Valor do intercepto c(k) de cada corte em função do estágio. Representa o custo futuro esperado com armazenamento nulo.',
    'c.wv.t':       'Valor da Água por Estágio',
    'c.wv.d':       'Coeficiente wv(k) — variação do custo futuro por hm³ adicional armazenado. Reflete o benefício econômico de ter mais água disponível para geração futura.',
    'c.box.t':      'Distribuição dos Interceptos por Estágio',
    'c.box.d':      'Dispersão dos valores de intercepto c(k) em cada estágio — mediana, quartis e pontos individuais.',
    'c.heatmap.t':  'Mapa de Calor — Interceptos (Cortes × Estágios)',
    'c.heatmap.d':  'Visão global dos interceptos. Tons mais escuros indicam maior custo futuro esperado.',
    'c.3drhs.t':    'Superfície 3D — Interceptos da FCF',
    'c.3drhs.d':    'Superfície do intercepto c(k) ao longo dos estágios e cortes. Arraste para rotacionar.',
    'c.3dwv.t':     'Superfície 3D — Valor da Água',
    'c.3dwv.d':     'Superfície do coeficiente wv(k) para o reservatório selecionado.',
    'c.cuts_iter.t': 'Cortes por Iteração',
    'c.cuts_iter.d': 'Número de cortes gerados em cada iteração do SDDP — reflete a evolução da FCF ao longo do processo de convergência.',
    'c.table.t':    'Tabela de Cortes FCF',
    'c.table.d':    'Todos os cortes com intercepto, valor da água e metadados de iteração.',

    /* Axis labels */
    'ax.stage':    'Estágio',
    'ax.cut':      'Corte',
    'ax.iter':     'Iteração',
    'lbl.cuts_count': 'Qtd. de Cortes',
    'ax.rhs':      'Intercepto c(k)',
    'ax.vol':      'Volume',
    'ax.fcf':      'FCF',
    'ax.wv':       'Valor da Água',
    'ax.cut_num':  'Número do Corte',
    'ax.envelope': 'Envelope FCF',

    /* Table */
    'th.stage':    'Estágio',
    'th.cut':      'Corte',
    'th.iter':     'Iter.',
    'th.cluster':  'Cluster',
    'th.scenario': 'Cenário',
    'th.rhs':      'RHS',

    /* Footer & misc */
    'footer.brand': 'PSR FCF Viewer',
    'footer.loaded': 'Atualizado em',
    'loading.boot':  'Carregando…',
  },

  /* ── Spanish ─────────────────────────────────────────────────────────── */
  es: {
    'nav.tag': 'SDDP',
    'nav.file_none': '',

    'hdr.label':    'PSR · SDDP',
    'hdr.title':    'FCF Viewer',
    'hdr.subtitle': 'Función de Costo Futuro',
    'hdr.desc':     'Visualice y analice los cortes de Benders que aproximan la Función de Costo Futuro (FCF) multi-dimensional de cada etapa del SDDP — base de las simulaciones de despacho hidrotérmico.',

    'up.drop':    'Arrastre el archivo aquí o haga clic para seleccionar',
    'up.hint':    'costmexx.psr  ·  costmexx.xls  ·  costmexx.csv',
    'up.url_lbl': 'o dirección:',
    'up.url_ph':  'http://localhost/data/costmexx.psr',
    'up.btn':     'Cargar',
    'up.samples': 'Casos de ejemplo',

    's.exemplo': 'Ejemplo Didáctico',
    's.island':  'Sistema Isla',
    's.bolivia': 'Bolivia',
    's.brasil':  'Brasil',

    'st.stages':    'Etapas',
    'st.cuts':      'Cortes totales',
    'st.max_cut':   'Cortes / etapa',
    'st.rhs_range': 'Rango RHS',
    'st.reservoirs':'Embalses',
    'st.file':      'Archivo',

    'ctrl.reservoir': 'Embalse',
    'ctrl.stage':     'Etapa',
    'ctrl.vol_max':   'Vol. máx. (hm³)',
    'ctrl.export':    'Exportar JSON',

    'meta.period': 'Período',
    'meta.stages': 'Etapas',
    'meta.iter':   'Iteraciones',
    'meta.zinf':   'Z inferior',
    'meta.zsup':   'Z superior',
    'meta.gap':    'Gap',

    'tab.curves':   'Curvas FCF',
    'tab.distrib':  'Distribución',
    'tab.surfaces': 'Superficies 3D',
    'tab.data':     'Datos',

    'c.envelope.t': 'Función de Costo Futuro — Envolvente',
    'c.envelope.d': 'FCF(V) = max { c(k) + wv(k)·V } para la etapa seleccionada. Cada línea es un corte lineal; la curva sólida es la envolvente convexa.',
    'c.rhs.t':      'Interceptos de los Cortes por Etapa',
    'c.rhs.d':      'Valor del intercepto c(k) de cada corte en función de la etapa.',
    'c.wv.t':       'Valor del Agua por Etapa',
    'c.wv.d':       'Coeficiente wv(k) — variación del costo futuro por hm³ adicional almacenado.',
    'c.box.t':      'Distribución de Interceptos por Etapa',
    'c.box.d':      'Dispersión de los valores de intercepto en cada etapa.',
    'c.heatmap.t':  'Mapa de Calor — Interceptos (Cortes × Etapas)',
    'c.heatmap.d':  'Vista global de los interceptos por etapa y corte.',
    'c.3drhs.t':    'Superficie 3D — Interceptos de la FCF',
    'c.3drhs.d':    'Superficie del intercepto c(k) a lo largo de etapas y cortes.',
    'c.3dwv.t':     'Superficie 3D — Valor del Agua',
    'c.3dwv.d':     'Superficie del coeficiente wv(k) para el embalse seleccionado.',
    'c.cuts_iter.t': 'Cortes por Iteración',
    'c.cuts_iter.d': 'Número de cortes generados en cada iteración del SDDP — refleja la evolución de la FCF durante el proceso de convergencia.',
    'c.table.t':    'Tabla de Cortes FCF',
    'c.table.d':    'Todos los cortes con intercepto, valor del agua y metadatos.',

    'ax.stage':    'Etapa',
    'ax.cut':      'Corte',
    'ax.iter':     'Iteración',
    'lbl.cuts_count': 'Cant. de Cortes',
    'ax.rhs':      'Intercepto c(k)',
    'ax.vol':      'Volumen',
    'ax.fcf':      'FCF',
    'ax.wv':       'Valor del Agua',
    'ax.cut_num':  'Número de Corte',
    'ax.envelope': 'Envolvente FCF',

    'th.stage':    'Etapa',
    'th.cut':      'Corte',
    'th.iter':     'Iter.',
    'th.cluster':  'Cluster',
    'th.scenario': 'Escenario',
    'th.rhs':      'RHS',

    'footer.brand':  'PSR FCF Viewer',
    'footer.loaded': 'Actualizado en',
    'loading.boot':  'Cargando…',
  },

  /* ── English ─────────────────────────────────────────────────────────── */
  en: {
    'nav.tag': 'SDDP',
    'nav.file_none': '',

    'hdr.label':    'PSR · SDDP',
    'hdr.title':    'FCF Viewer',
    'hdr.subtitle': 'Future Cost Function',
    'hdr.desc':     'Visualize and analyze the Benders cuts approximating the multi-dimensional Future Cost Function (FCF) for each SDDP stage — the foundation of hydrothermal dispatch simulations.',

    'up.drop':    'Drop file here or click to select',
    'up.hint':    'costmexx.psr  ·  costmexx.xls  ·  costmexx.csv',
    'up.url_lbl': 'or address:',
    'up.url_ph':  'http://localhost/data/costmexx.psr',
    'up.btn':     'Load',
    'up.samples': 'Sample cases',

    's.exemplo': 'Basic Example',
    's.island':  'Island System',
    's.bolivia': 'Bolivia',
    's.brasil':  'Brazil',

    'st.stages':    'Stages',
    'st.cuts':      'Total cuts',
    'st.max_cut':   'Cuts / stage',
    'st.rhs_range': 'RHS range',
    'st.reservoirs':'Reservoirs',
    'st.file':      'File',

    'ctrl.reservoir': 'Reservoir',
    'ctrl.stage':     'Stage',
    'ctrl.vol_max':   'Max vol. (hm³)',
    'ctrl.export':    'Export JSON',

    'meta.period': 'Period',
    'meta.stages': 'Stages',
    'meta.iter':   'Iterations',
    'meta.zinf':   'Lower bound',
    'meta.zsup':   'Upper bound',
    'meta.gap':    'Gap',

    'tab.curves':   'FCF Curves',
    'tab.distrib':  'Distribution',
    'tab.surfaces': '3D Surfaces',
    'tab.data':     'Data',

    'c.envelope.t': 'Future Cost Function — Envelope',
    'c.envelope.d': 'FCF(V) = max { c(k) + wv(k)·V } for the selected stage. Each dashed line is a linear cut (supporting hyperplane); the solid curve is the convex envelope — the approximated FCF.',
    'c.rhs.t':      'Cut Intercepts by Stage',
    'c.rhs.d':      'Intercept value c(k) of each cut across stages. Represents the expected future cost at zero storage.',
    'c.wv.t':       'Water Value by Stage',
    'c.wv.d':       'Coefficient wv(k) — change in future cost per additional hm³ stored. Reflects the economic benefit of having more water available for future generation.',
    'c.box.t':      'Intercept Distribution by Stage',
    'c.box.d':      'Spread of intercept values c(k) in each stage — median, quartiles, and individual points.',
    'c.heatmap.t':  'Heat Map — Intercepts (Cuts × Stages)',
    'c.heatmap.d':  'Global view of intercepts across all stages and cuts.',
    'c.3drhs.t':    '3D Surface — FCF Intercepts',
    'c.3drhs.d':    'Surface of the intercept c(k) across stages and cuts. Drag to rotate.',
    'c.3dwv.t':     '3D Surface — Water Value',
    'c.3dwv.d':     'Surface of the water value coefficient wv(k) for the selected reservoir.',
    'c.cuts_iter.t': 'Cuts by Iteration',
    'c.cuts_iter.d': 'Number of cuts generated in each SDDP iteration — reflects the FCF evolution throughout the convergence process.',
    'c.table.t':    'FCF Cuts Table',
    'c.table.d':    'All cuts with intercept, water value, and iteration metadata.',

    'ax.stage':    'Stage',
    'ax.cut':      'Cut',
    'ax.iter':     'Iteration',
    'lbl.cuts_count': 'Cut Count',
    'ax.rhs':      'Intercept c(k)',
    'ax.vol':      'Volume',
    'ax.fcf':      'FCF',
    'ax.wv':       'Water Value',
    'ax.cut_num':  'Cut Number',
    'ax.envelope': 'FCF Envelope',

    'th.stage':    'Stage',
    'th.cut':      'Cut',
    'th.iter':     'Iter.',
    'th.cluster':  'Cluster',
    'th.scenario': 'Scenario',
    'th.rhs':      'RHS',

    'footer.brand':  'PSR FCF Viewer',
    'footer.loaded': 'Updated at',
    'loading.boot':  'Loading…',
  },
};

/* ── Active language ─────────────────────────────────────────────────────── */
let _lang = localStorage.getItem('fcf_lang') || 'pt';

function currentLang() { return _lang; }

/** Return translated string for key. Falls back to PT, then to key itself. */
function t(key) {
  return (TRANSLATIONS[_lang]?.[key]) ??
         (TRANSLATIONS['pt']?.[key]) ??
         key;
}

/**
 * Apply translations to the DOM.
 * - [data-i18n]       → textContent
 * - [data-i18n-html]  → innerHTML  (allows <strong> etc.)
 * - [data-i18n-ph]    → placeholder
 */
function applyLang(lang) {
  if (!TRANSLATIONS[lang]) return;
  _lang = lang;
  localStorage.setItem('fcf_lang', lang);

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = t(el.dataset.i18n);
    if (v !== undefined) el.textContent = v;
  });

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const v = t(el.dataset.i18nHtml);
    if (v !== undefined) el.innerHTML = v;
  });

  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const v = t(el.dataset.i18nPh);
    if (v !== undefined) el.placeholder = v;
  });

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

function initLang() { applyLang(_lang); }
