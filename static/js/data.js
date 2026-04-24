/**
 * data.js — Pyodide bootstrap + FCF file parsing + JSON export
 *
 * The Python module (fcf_reader.py) runs inside the browser via Pyodide
 * (WebAssembly).  JS receives a JSON string and converts to a plain object.
 *
 * Supported inputs:  .psr  .csv  .xls  .json
 * Supported outputs: JSON download (exportFcfJson)
 */

let _pyodide  = null;
let _fcfData  = null;

const PYODIDE_INDEX = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';

// ── Pyodide bootstrap ─────────────────────────────────────────────────────

async function initPyodide(onStatus) {
  onStatus?.(t('loading.init'));
  _pyodide = await loadPyodide({ indexURL: PYODIDE_INDEX });

  onStatus?.(t('loading.module'));
  const code = await _fetchPyModule();
  await _pyodide.runPythonAsync(code);

  onStatus?.(null);
}

async function _fetchPyModule() {
  // Prefer fetching the file (works when served via HTTP).
  // Falls back to an inline <script id="fcf-py"> tag.
  try {
    const r = await fetch('src/fcf_reader.py');
    if (r.ok) return r.text();
  } catch (_) { /* ignore network error */ }

  const el = document.getElementById('fcf-py');
  if (el) return el.textContent;

  throw new Error(
    'Cannot load src/fcf_reader.py. ' +
    'Serve the viewer via an HTTP server: python -m http.server'
  );
}

// ── File parsing ──────────────────────────────────────────────────────────

/** Parse a File object (from file picker or drag-and-drop). */
async function parseFcfFile(file) {
  _assertReady();
  const buffer = await file.arrayBuffer();
  return _runParse(new Uint8Array(buffer), file.name);
}

/** Fetch and parse from a URL. */
async function parseFcfUrl(url) {
  _assertReady();
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status} — ${url}`);
  const buffer = await resp.arrayBuffer();
  const filename = url.split('/').pop().split('?')[0];
  return _runParse(new Uint8Array(buffer), filename);
}

async function _runParse(uint8array, filename) {
  // Convert Uint8Array → Python bytes via list (works for files up to ~1 GB).
  // For multi-GB files, consider reading the PSR in chunks using the seek API.
  _pyodide.globals.set('_fcf_raw',      _pyodide.toPy(Array.from(uint8array)));
  _pyodide.globals.set('_fcf_filename', filename);
  const json = await _pyodide.runPythonAsync(
    'load_fcf(bytes(_fcf_raw), _fcf_filename)'
  );
  const result = JSON.parse(json);
  if (!result.ok) throw new Error(result.error || 'Unknown parser error.');
  return result;
}

function _assertReady() {
  if (!_pyodide) throw new Error('Pyodide not yet initialised.');
}

// ── JSON export ───────────────────────────────────────────────────────────

/** Download the current FCF data as a .json file. */
function exportFcfJson() {
  if (!_fcfData) return;
  const json = JSON.stringify(_fcfData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  const base = (_fcfData.filename || 'fcf').replace(/\.[^.]+$/, '');
  a.href     = url;
  a.download = `${base}_data.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// ── Data store ────────────────────────────────────────────────────────────

function setFcfData(data) { _fcfData = data; }
function getFcfData()      { return _fcfData; }
