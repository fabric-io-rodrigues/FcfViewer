/**
 * data.js — Pyodide initialisation and FCF file parsing
 *
 * Pyodide runs the Python module (fcf_reader.py) inside the browser via
 * WebAssembly.  All heavy I/O and parsing happens in Python; JS receives
 * the result as a JSON string and converts it to a plain object.
 *
 * Large files (multi-GB) are supported as long as the browser has enough
 * RAM.  For streaming / chunked reading, the binary parser in fcf_reader.py
 * would need to be extended with a seek-based approach.
 */

// ── State ────────────────────────────────────────────────────────────────
let _pyodide  = null;
let _fcfData  = null;
let _pyCode   = null;   // cached Python source

const PYODIDE_INDEX = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';

// ── Pyodide bootstrap ────────────────────────────────────────────────────

/**
 * Load Pyodide and the Python module.
 * @param {function(string):void} [onStatus]  progress callback
 */
async function initPyodide(onStatus) {
  onStatus?.('Carregando Pyodide (WebAssembly)…');
  _pyodide = await loadPyodide({ indexURL: PYODIDE_INDEX });

  onStatus?.('Carregando módulo FCF Reader…');
  _pyCode = await _fetchPythonModule();
  await _pyodide.runPythonAsync(_pyCode);

  onStatus?.(null);   // done
}

async function _fetchPythonModule() {
  // Try to fetch from the file system (requires a local HTTP server).
  // Falls back to the inline copy embedded in the <script id="fcf-py"> tag.
  try {
    const r = await fetch('src/fcf_reader.py');
    if (r.ok) return r.text();
  } catch (_) { /* ignore */ }

  const el = document.getElementById('fcf-py');
  if (el) return el.textContent;

  throw new Error(
    'Não foi possível carregar src/fcf_reader.py. ' +
    'Execute o visualizador via servidor HTTP local (python -m http.server).'
  );
}

// ── File parsing ─────────────────────────────────────────────────────────

/**
 * Parse an FCF file selected via file picker or drag-and-drop.
 * @param {File} file
 * @returns {Promise<object>}
 */
async function parseFcfFile(file) {
  _assertReady();
  const buffer = await file.arrayBuffer();
  return _runParse(new Uint8Array(buffer), file.name);
}

/**
 * Fetch and parse an FCF file from a URL or local path served via HTTP.
 * @param {string} url
 * @returns {Promise<object>}
 */
async function parseFcfUrl(url) {
  _assertReady();
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status} ao buscar: ${url}`);
  const buffer = await resp.arrayBuffer();
  const filename = url.split('/').pop().split('?')[0];
  return _runParse(new Uint8Array(buffer), filename);
}

async function _runParse(uint8array, filename) {
  // Transfer the byte array to Python globals.
  // pyodide.toPy converts a JS Array → Python list; bytes() wraps it.
  // For very large arrays the conversion can be slow — a future optimisation
  // would use SharedArrayBuffer or a pyodide MemoryView.
  _pyodide.globals.set('_fcf_raw',      _pyodide.toPy(Array.from(uint8array)));
  _pyodide.globals.set('_fcf_filename', filename);

  const json = await _pyodide.runPythonAsync(
    'load_fcf(bytes(_fcf_raw), _fcf_filename)'
  );

  const result = JSON.parse(json);
  if (!result.ok) throw new Error(result.error || 'Erro desconhecido no parser Python.');
  return result;
}

function _assertReady() {
  if (!_pyodide) throw new Error('Pyodide ainda não foi inicializado.');
}

// ── Data store ───────────────────────────────────────────────────────────

function setFcfData(data) { _fcfData = data; }
function getFcfData()      { return _fcfData; }
