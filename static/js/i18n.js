/**
 * i18n.js — PSR FCF Viewer · Internationalisation
 * Languages: pt (Portuguese), es (Spanish), en (English)
 */

const TRANSLATIONS = {

  /* ── Portuguese ──────────────────────────────────────────────────────── */
  pt: {
    /* Nav */
    'nav.tag':      'SDDP',
    'nav.file_none':'',
    'nav.new_file': 'Carregar arquivo',

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

    /* Chart info panels */
    'c.envelope.info': 'A FCF é o envelope convexo dos cortes de Benders — hiperplanos de suporte da função custo-de-ir. Cada corte <em>k</em> define um plano: <code>fcf(k,v) = c(k) + Σ wv(k,h)·v(h)</code>. O envelope é o máximo sobre todos os cortes: <code>FCF(v) = max<sub>k</sub>{ c(k) + wv(k,h)·v(h) }</code>. Para um dado armazenamento, o corte "ativo" é o que maximiza esse valor, representando o cenário hidrológico mais restritivo.',
    'c.rhs.info':      'O intercepto <code>c(k)</code> é o termo constante de cada corte de Benders: estima o custo futuro quando todos os reservatórios estão vazios (<code>v = 0</code>). Cortes com <code>c(k)</code> elevado representam cenários de seco severo ou alta demanda, onde o custo operacional futuro é alto independentemente do armazenamento. A dispersão dos interceptos por estágio reflete a variabilidade hidrológica capturada na FCF.',
    'c.wv.info':       'O valor d\'água <code>wv(k,h)</code> é o "preço sombra" do volume armazenado no reservatório <em>h</em>: mede quanto o custo futuro diminuiria com 1 hm³ adicional. Unidade típica: k$/hm³. Plantas mais a montante da cascata tendem a ter maior <code>wv</code>, pois a água pode gerar em múltiplas usinas. Para reservatórios de regularização, <code>wv</code> reflete o acoplamento temporal entre estágios do SDDP.',
    'c.box.info':      'A distribuição dos interceptos <code>c(k)</code> por estágio revela a qualidade da aproximação da FCF. Caixas estreitas indicam convergência satisfatória; caixas largas — especialmente em estágios distantes do horizonte final — refletem maior incerteza hidrológica ainda não mapeada pelo algoritmo. Outliers podem corresponder a cenários de seco extremo explorados em iterações específicas do SDDP.',
    'c.heatmap.info':  'Todos os interceptos <code>c(k)</code> organizados por estágio (eixo horizontal) e índice de corte (eixo vertical). Colunas escuras marcam estágios críticos de alto custo futuro. Linhas horizontais de cor uniforme identificam cortes que permanecem "ativos" por muitos estágios — típico de cortes que capturam longos períodos de seco. Padrões diagonais podem revelar sazonalidade das afluências.',
    'c.cuts_iter.info':'Cada iteração do SDDP (Programação Dinâmica Dual Estocástica) adiciona novos cortes de Benders, refinando a aproximação da FCF. As primeiras iterações geram muitos cortes pois a FCF ainda é grosseira; o ritmo decresce conforme a convergência avança. A convergência é atingida quando o gap entre os limites superior e inferior do custo esperado tende a zero: <code>z_sup − z_inf ≈ 0</code>.',
    'c.3drhs.info':    'Superfície tridimensional dos interceptos <code>c(k)</code> em função do estágio e do índice de corte. Picos na superfície revelam estágios e iterações em que o SDDP identificou cenários de alto custo futuro. A textura irregular reflete a diversidade de cenários hidrológicos explorados. Arraste para rotacionar e examinar ângulos diferentes da estrutura da FCF.',
    'c.3dwv.info':     'Superfície tridimensional do valor d\'água <code>wv(k,h)</code> para o reservatório selecionado. Estágios com valores elevados indicam períodos em que a água tem alto custo de oportunidade — o sistema opera próximo do limite térmico. A variação entre cortes em um mesmo estágio captura a incerteza hidrológica: diferentes cenários implicam diferentes "preços sombra" para a água.',
    'c.table.info':    'Tabela completa de todos os cortes de Benders. Cada linha representa um corte <em>k</em> com intercepto <code>c(k)</code>, coeficientes <code>wv(k,h)</code> por reservatório, estágio e iteração de origem. Para um vetor de armazenamento <code>v</code>, o corte ativo é o de maior <code>fcf(k,v) = c(k) + Σ wv(k,h)·v(h)</code>. Use esta tabela para inspecionar os coeficientes exatos de qualquer corte.',

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

    'lbl.3d_large':  '3D indisponível — dataset muito grande',
    'lbl.table_cap': 'Exibindo 5.000 de',

    /* Footer & misc */
    'footer.brand': 'PSR FCF Viewer',
    'footer.loaded': 'Atualizado em',
    'loading.boot':  'Carregando…',
  },

  /* ── Spanish ─────────────────────────────────────────────────────────── */
  es: {
    'nav.tag':      'SDDP',
    'nav.file_none':'',
    'nav.new_file': 'Cargar archivo',

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

    /* Chart info panels */
    'c.envelope.info': 'La FCF es el envolvente convexo de los cortes de Benders — hiperplanos de soporte de la función costo-a-ir. Cada corte <em>k</em> define un plano: <code>fcf(k,v) = c(k) + Σ wv(k,h)·v(h)</code>. El envolvente es el máximo sobre todos los cortes: <code>FCF(v) = max<sub>k</sub>{ c(k) + wv(k,h)·v(h) }</code>. Para un almacenamiento dado, el corte "activo" es el que maximiza este valor, representando el escenario hidrológico más restrictivo.',
    'c.rhs.info':      'El intercepto <code>c(k)</code> es el término constante de cada corte de Benders: estima el costo futuro cuando todos los embalses están vacíos (<code>v = 0</code>). Cortes con <code>c(k)</code> alto representan escenarios de sequía severa o alta demanda, donde el costo operacional futuro es alto independientemente del almacenamiento. La dispersión de los interceptos por período refleja la variabilidad hidrológica capturada en la FCF.',
    'c.wv.info':       'El valor del agua <code>wv(k,h)</code> es el "precio sombra" del volumen almacenado en el embalse <em>h</em>: mide cuánto disminuiría el costo futuro con 1 hm³ adicional. Unidad típica: k$/hm³. Las plantas más aguas arriba de la cascada tienden a tener mayor <code>wv</code>, ya que el agua puede generar en múltiples centrales. Para embalses de regulación, <code>wv</code> refleja el acoplamiento temporal entre períodos del SDDP.',
    'c.box.info':      'La distribución de los interceptos <code>c(k)</code> por período revela la calidad de la aproximación de la FCF. Cajas estrechas indican convergencia satisfactoria; cajas amplias — especialmente en períodos alejados del horizonte final — reflejan mayor incertidumbre hidrológica aún no mapeada por el algoritmo. Los valores atípicos pueden corresponder a escenarios de sequía extrema explorados en iteraciones específicas del SDDP.',
    'c.heatmap.info':  'Todos los interceptos <code>c(k)</code> organizados por período (eje horizontal) e índice de corte (eje vertical). Las columnas oscuras marcan períodos críticos de alto costo futuro. Las filas horizontales de color uniforme identifican cortes "activos" en muchos períodos — típico de cortes que capturan largos períodos de sequía. Los patrones diagonales pueden revelar estacionalidad de las afluencias.',
    'c.cuts_iter.info':'Cada iteración del SDDP (Programación Dinámica Dual Estocástica) añade nuevos cortes de Benders, refinando la aproximación de la FCF. Las primeras iteraciones generan muchos cortes porque la FCF aún es gruesa; el ritmo decrece conforme avanza la convergencia. La convergencia se alcanza cuando la brecha entre los límites superior e inferior del costo esperado tiende a cero: <code>z_sup − z_inf ≈ 0</code>.',
    'c.3drhs.info':    'Superficie tridimensional de los interceptos <code>c(k)</code> en función del período y del índice de corte. Los picos en la superficie revelan períodos e iteraciones en que el SDDP identificó escenarios de alto costo futuro. La textura irregular refleja la diversidad de escenarios hidrológicos explorados. Arrastre para rotar y examinar diferentes ángulos de la estructura de la FCF.',
    'c.3dwv.info':     'Superficie tridimensional del valor del agua <code>wv(k,h)</code> para el embalse seleccionado. Los períodos con valores altos indican momentos de alto costo de oportunidad del agua — el sistema opera cerca del límite térmico. La variación entre cortes en el mismo período captura la incertidumbre hidrológica: distintos escenarios implican distintos "precios sombra" para el agua.',
    'c.table.info':    'Tabla completa de todos los cortes de Benders. Cada fila representa un corte <em>k</em> con intercepto <code>c(k)</code>, coeficientes <code>wv(k,h)</code> por embalse, período e iteración de origen. Para un vector de almacenamiento <code>v</code>, el corte activo es el de mayor <code>fcf(k,v) = c(k) + Σ wv(k,h)·v(h)</code>. Use esta tabla para inspeccionar los coeficientes exactos de cualquier corte.',

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

    'lbl.3d_large':  '3D no disponible — dataset demasiado grande',
    'lbl.table_cap': 'Mostrando 5.000 de',

    'footer.brand':  'PSR FCF Viewer',
    'footer.loaded': 'Actualizado en',
    'loading.boot':  'Cargando…',
  },

  /* ── English ─────────────────────────────────────────────────────────── */
  en: {
    'nav.tag':      'SDDP',
    'nav.file_none':'',
    'nav.new_file': 'Open file',

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

    /* Chart info panels */
    'c.envelope.info': 'The FCF is the convex hull of Benders cuts — supporting hyperplanes of the cost-to-go function. Each cut <em>k</em> defines a linear plane: <code>fcf(k,v) = c(k) + Σ wv(k,h)·v(h)</code>. The envelope is the maximum over all cuts: <code>FCF(v) = max<sub>k</sub>{ c(k) + wv(k,h)·v(h) }</code>. For a given storage level, the "active" cut is the one that maximizes this value, representing the most binding hydrological scenario.',
    'c.rhs.info':      'The intercept <code>c(k)</code> is the constant term of each Benders cut: it estimates the future cost when all reservoirs are empty (<code>v = 0</code>). Cuts with high <code>c(k)</code> represent severe drought or high-demand scenarios, where future operating costs are high regardless of storage. The spread of intercepts across stages reflects the hydrological variability captured in the FCF.',
    'c.wv.info':       'The water value <code>wv(k,h)</code> is the "shadow price" of stored volume in reservoir <em>h</em>: it measures how much future cost would decrease with 1 additional hm³. Typical unit: k$/hm³. Plants further upstream in the cascade tend to have higher <code>wv</code>, since water can generate at multiple plants. For storage reservoirs, <code>wv</code> reflects the temporal coupling between SDDP stages.',
    'c.box.info':      'The intercept <code>c(k)</code> distribution by stage reveals the quality of the FCF approximation. Narrow boxes indicate satisfactory convergence; wide boxes — especially in stages far from the final horizon — reflect greater hydrological uncertainty not yet mapped by the algorithm. Outliers may correspond to extreme drought scenarios explored in specific SDDP iterations.',
    'c.heatmap.info':  'All intercepts <code>c(k)</code> organized by stage (horizontal axis) and cut index (vertical axis). Dark columns mark critical stages with high future cost. Uniform-color horizontal rows identify cuts that remain "active" across many stages — typical of cuts capturing long drought periods. Diagonal patterns may reveal seasonal inflow patterns.',
    'c.cuts_iter.info':'Each SDDP iteration (Stochastic Dual Dynamic Programming) adds new Benders cuts, refining the FCF approximation. Early iterations generate many cuts because the FCF is still coarse; the rate decreases as convergence progresses. Convergence is reached when the gap between the upper and lower bounds of expected cost approaches zero: <code>z_sup − z_inf ≈ 0</code>.',
    'c.3drhs.info':    '3D surface of intercepts <code>c(k)</code> as a function of stage and cut index. Peaks in the surface reveal stages and iterations where SDDP identified high future-cost scenarios. The irregular texture reflects the diversity of hydrological scenarios explored. Drag to rotate and examine different angles of the FCF structure.',
    'c.3dwv.info':     '3D surface of the water value <code>wv(k,h)</code> for the selected reservoir. Stages with high values indicate periods when water carries high opportunity cost — the system operates near maximum thermal capacity. Variation between cuts in the same stage captures hydrological uncertainty: different scenarios imply different "shadow prices" for water.',
    'c.table.info':    'Complete table of all Benders cuts. Each row represents a cut <em>k</em> with intercept <code>c(k)</code>, water value coefficients <code>wv(k,h)</code> per reservoir, and the originating stage and iteration. For a given storage vector <code>v</code>, the active cut is the one with the highest <code>fcf(k,v) = c(k) + Σ wv(k,h)·v(h)</code>. Use this table to inspect the exact coefficients of any cut.',

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

    'lbl.3d_large':  '3D unavailable — dataset too large',
    'lbl.table_cap': 'Showing 5,000 of',

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

  const sel = document.getElementById('app-lang-select');
  if (sel) sel.value = lang;
}

function initLang() { applyLang(_lang); }
