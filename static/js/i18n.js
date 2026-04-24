/**
 * i18n.js — Internationalisation for PSR FCF Viewer
 * Supported languages: pt (Portuguese), es (Spanish), en (English)
 */

const TRANSLATIONS = {
  pt: {
    // Header
    'header.label':    'SDDP · Função de Custo Futuro',
    'header.title':    'FCF Viewer',
    'header.subtitle': '— Visualizador de Cortes FCF',
    'header.desc':     'Visualize os cortes da Função de Custo Futuro gerados pelo SDDP. Suporte a <code>.csv</code>, <code>.xls</code> (TSV) e <code>.psr</code> (binário nativo). Todo o processamento acontece no browser via <strong>Pyodide</strong> — nenhum dado sai da sua máquina.',

    // Upload
    'upload.icon':     '↑',
    'upload.title':    'Arraste o arquivo aqui ou clique para selecionar',
    'upload.hint':     'costmexx.csv · costmexx.xls · costmexx.psr · dados.json',
    'upload.url_label':'ou URL / caminho local:',
    'upload.url_ph':   'http://localhost:8080/data/costmexx.psr',
    'upload.btn':      'Carregar',

    // Stats
    'stat.stages':     'Estágios',
    'stat.cuts':       'Cortes totais',
    'stat.max_cut':    'Cortes máx. / estágio',
    'stat.rhs_range':  'Range RHS',
    'stat.hydros':     'Reservatórios',
    'stat.filename':   'Arquivo',

    // Controls
    'ctrl.hydro':      'Reservatório',
    'ctrl.stage':      'Estágio (Envelope)',
    'ctrl.vol_max':    'Vol. máx. (hm³)',
    'ctrl.export':     'Exportar JSON',

    // Metadata panel
    'meta.period':     'Período',
    'meta.iter':       'Iteração',
    'meta.zinf':       'Limite inf.',
    'meta.zsup':       'Limite sup.',
    'meta.itbst':      'Melhor iter.',
    'meta.zsupbst':    'Melhor zsup',

    // Chart titles & descriptions
    'c01.title': '01 · RHS por Estágio',
    'c01.desc':  'Intercepto de cada corte ao longo dos estágios. Representa o custo futuro esperado em estado de referência (volume nulo).',
    'c02.title': '02 · Valor da Água por Estágio',
    'c02.desc':  'Coeficiente ∂FCF/∂V — sensibilidade do custo futuro ao volume armazenado no reservatório selecionado.',
    'c03.title': '03 · Envelope da FCF',
    'c03.desc':  'Forma da FCF para o estágio selecionado. Cada linha é um corte linear; o envelope (linha escura) é o supremo — a FCF real aproximada.',
    'c04.title': '04 · Heatmap — RHS: Cortes × Estágios',
    'c04.desc':  'Mapa de calor do valor RHS por combinação estágio × número de corte. Células brancas indicam cortes ausentes.',
    'c05.title': '05 · 3D — Stage × Cut × RHS',
    'c05.desc':  'Superfície 3D do intercepto da FCF. Arraste para rotacionar.',
    'c06.title': '06 · 3D — Stage × Cut × Val. Água',
    'c06.desc':  'Superfície 3D do valor da água do reservatório selecionado.',
    'c07.title': '07 · Box Plot — RHS por Estágio',
    'c07.desc':  'Distribuição estatística dos valores RHS em cada estágio: mediana, quartis e pontos individuais.',
    'c08.title': '08 · Tabela de Dados',
    'c08.desc':  'Todos os cortes da FCF em formato tabular — estágio, corte, iteração, RHS e valores da água.',

    // Chart axis labels
    'ax.stage':   'Estágio',
    'ax.cut':     'Corte',
    'ax.rhs':     'RHS',
    'ax.vol':     'Volume',
    'ax.fcf':     'FCF',
    'ax.wv':      'Val. Água',
    'ax.cut_num': 'Número do Corte',

    // Table headers
    'th.stage':   'Estágio',
    'th.cut':     'Corte',
    'th.iter':    'Iter.',
    'th.cluster': 'Cluster',
    'th.scenario':'Cenário',
    'th.rhs':     'RHS',

    // Footer
    'footer.src': 'PSR FCF Viewer · SDDP · Pyodide + Plotly.js',
    'footer.loaded': 'Carregado em',

    // Loading
    'loading.init': 'Inicializando Pyodide…',
    'loading.module': 'Carregando módulo FCF Reader…',
  },

  es: {
    'header.label':    'SDDP · Función de Costo Futuro',
    'header.title':    'FCF Viewer',
    'header.subtitle': '— Visualizador de Cortes FCF',
    'header.desc':     'Visualice los cortes de la Función de Costo Futuro generados por SDDP. Compatible con <code>.csv</code>, <code>.xls</code> (TSV) y <code>.psr</code> (binario nativo). Todo el procesamiento ocurre en el navegador vía <strong>Pyodide</strong>.',

    'upload.icon':     '↑',
    'upload.title':    'Arrastre el archivo aquí o haga clic para seleccionar',
    'upload.hint':     'costmexx.csv · costmexx.xls · costmexx.psr · datos.json',
    'upload.url_label':'o URL / ruta local:',
    'upload.url_ph':   'http://localhost:8080/data/costmexx.psr',
    'upload.btn':      'Cargar',

    'stat.stages':    'Etapas',
    'stat.cuts':      'Cortes totales',
    'stat.max_cut':   'Cortes máx. / etapa',
    'stat.rhs_range': 'Rango RHS',
    'stat.hydros':    'Embalses',
    'stat.filename':  'Archivo',

    'ctrl.hydro':     'Embalse',
    'ctrl.stage':     'Etapa (Envolvente)',
    'ctrl.vol_max':   'Vol. máx. (hm³)',
    'ctrl.export':    'Exportar JSON',

    'meta.period':    'Período',
    'meta.iter':      'Iteración',
    'meta.zinf':      'Cota inf.',
    'meta.zsup':      'Cota sup.',
    'meta.itbst':     'Mejor iter.',
    'meta.zsupbst':   'Mejor zsup',

    'c01.title': '01 · RHS por Etapa',
    'c01.desc':  'Intercepto de cada corte a lo largo de las etapas. Representa el costo futuro esperado con volumen nulo.',
    'c02.title': '02 · Valor del Agua por Etapa',
    'c02.desc':  'Coeficiente ∂FCF/∂V — sensibilidad del costo futuro al volumen almacenado en el embalse seleccionado.',
    'c03.title': '03 · Envolvente de la FCF',
    'c03.desc':  'Forma de la FCF para la etapa seleccionada. La envolvente (línea oscura) es el supremo de los cortes lineales.',
    'c04.title': '04 · Heatmap — RHS: Cortes × Etapas',
    'c04.desc':  'Mapa de calor del valor RHS por combinación etapa × número de corte.',
    'c05.title': '05 · 3D — Etapa × Corte × RHS',
    'c05.desc':  'Superficie 3D del intercepto de la FCF. Arrastre para rotar.',
    'c06.title': '06 · 3D — Etapa × Corte × Val. Agua',
    'c06.desc':  'Superficie 3D del valor del agua del embalse seleccionado.',
    'c07.title': '07 · Box Plot — RHS por Etapa',
    'c07.desc':  'Distribución estadística de los valores RHS en cada etapa.',
    'c08.title': '08 · Tabla de Datos',
    'c08.desc':  'Todos los cortes de la FCF en formato tabular.',

    'ax.stage':   'Etapa',
    'ax.cut':     'Corte',
    'ax.rhs':     'RHS',
    'ax.vol':     'Volumen',
    'ax.fcf':     'FCF',
    'ax.wv':      'Val. Agua',
    'ax.cut_num': 'Número de Corte',

    'th.stage':   'Etapa',
    'th.cut':     'Corte',
    'th.iter':    'Iter.',
    'th.cluster': 'Cluster',
    'th.scenario':'Escenario',
    'th.rhs':     'RHS',

    'footer.src': 'PSR FCF Viewer · SDDP · Pyodide + Plotly.js',
    'footer.loaded': 'Cargado en',

    'loading.init':   'Inicializando Pyodide…',
    'loading.module': 'Cargando módulo FCF Reader…',
  },

  en: {
    'header.label':    'SDDP · Future Cost Function',
    'header.title':    'FCF Viewer',
    'header.subtitle': '— FCF Cut Visualizer',
    'header.desc':     'Visualize the Future Cost Function cuts generated by SDDP. Supports <code>.csv</code>, <code>.xls</code> (TSV) and <code>.psr</code> (native binary). All processing happens in the browser via <strong>Pyodide</strong> — no data leaves your machine.',

    'upload.icon':     '↑',
    'upload.title':    'Drag file here or click to select',
    'upload.hint':     'costmexx.csv · costmexx.xls · costmexx.psr · data.json',
    'upload.url_label':'or URL / local path:',
    'upload.url_ph':   'http://localhost:8080/data/costmexx.psr',
    'upload.btn':      'Load',

    'stat.stages':    'Stages',
    'stat.cuts':      'Total cuts',
    'stat.max_cut':   'Max cuts / stage',
    'stat.rhs_range': 'RHS range',
    'stat.hydros':    'Reservoirs',
    'stat.filename':  'File',

    'ctrl.hydro':     'Reservoir',
    'ctrl.stage':     'Stage (Envelope)',
    'ctrl.vol_max':   'Max vol. (hm³)',
    'ctrl.export':    'Export JSON',

    'meta.period':    'Period',
    'meta.iter':      'Iteration',
    'meta.zinf':      'Lower bound',
    'meta.zsup':      'Upper bound',
    'meta.itbst':     'Best iter.',
    'meta.zsupbst':   'Best zsup',

    'c01.title': '01 · RHS by Stage',
    'c01.desc':  'Intercept of each cut along the stages. Represents the expected future cost at zero storage.',
    'c02.title': '02 · Water Value by Stage',
    'c02.desc':  'Coefficient ∂FCF/∂V — sensitivity of future cost to stored volume in the selected reservoir.',
    'c03.title': '03 · FCF Envelope',
    'c03.desc':  'Shape of the FCF for the selected stage. The envelope (dark line) is the supremum of the linear cuts — the approximated real FCF.',
    'c04.title': '04 · Heatmap — RHS: Cuts × Stages',
    'c04.desc':  'Heat map of RHS value by stage × cut number combination. White cells indicate missing cuts.',
    'c05.title': '05 · 3D — Stage × Cut × RHS',
    'c05.desc':  '3D surface of the FCF intercept. Drag to rotate.',
    'c06.title': '06 · 3D — Stage × Cut × Water Value',
    'c06.desc':  '3D surface of the water value for the selected reservoir.',
    'c07.title': '07 · Box Plot — RHS by Stage',
    'c07.desc':  'Statistical distribution of RHS values in each stage: median, quartiles, and individual points.',
    'c08.title': '08 · Data Table',
    'c08.desc':  'All FCF cuts in tabular format — stage, cut, iteration, RHS and water values.',

    'ax.stage':   'Stage',
    'ax.cut':     'Cut',
    'ax.rhs':     'RHS',
    'ax.vol':     'Volume',
    'ax.fcf':     'FCF',
    'ax.wv':      'Water Value',
    'ax.cut_num': 'Cut Number',

    'th.stage':   'Stage',
    'th.cut':     'Cut',
    'th.iter':    'Iter.',
    'th.cluster': 'Cluster',
    'th.scenario':'Scenario',
    'th.rhs':     'RHS',

    'footer.src': 'PSR FCF Viewer · SDDP · Pyodide + Plotly.js',
    'footer.loaded': 'Loaded at',

    'loading.init':   'Loading Pyodide…',
    'loading.module': 'Loading FCF Reader module…',
  },
};

// ── Active language ──────────────────────────────────────────────────────
let _lang = localStorage.getItem('fcf_lang') || 'pt';

function currentLang() { return _lang; }

/** Translate a key */
function t(key) {
  return (TRANSLATIONS[_lang] && TRANSLATIONS[_lang][key]) ||
         (TRANSLATIONS['pt'][key]) || key;
}

/**
 * Apply translations to all [data-i18n] elements.
 * Elements with data-i18n-html get innerHTML set (allows tags).
 */
function applyLang(lang) {
  if (!TRANSLATIONS[lang]) return;
  _lang = lang;
  localStorage.setItem('fcf_lang', lang);

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const val = t(key);
    if (val !== undefined) el.textContent = val;
  });

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.dataset.i18nHtml;
    const val = t(key);
    if (val !== undefined) el.innerHTML = val;
  });

  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.dataset.i18nPh;
    const val = t(key);
    if (val !== undefined) el.placeholder = val;
  });

  // Update active language button
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

/** Init language on page load */
function initLang() {
  applyLang(_lang);
}
