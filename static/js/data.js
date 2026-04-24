/**
 * data.js — Pyodide bootstrap + FCF file parsing + JSON export
 *
 * Large file note: passes Uint8Array directly to Pyodide using
 * JsProxy.to_py() — avoids the slow Array.from() intermediate step.
 */

let _pyodide = null;
let _fcfData = null;

const PYODIDE_INDEX = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';

/* ── Pyodide bootstrap ───────────────────────────────────────────────────── */

async function initPyodide(onStatus) {
  onStatus?.(t('loading.boot'));
  _pyodide = await loadPyodide({ indexURL: PYODIDE_INDEX });

  onStatus?.('FCF Reader…');
  await _pyodide.runPythonAsync(await _fetchPyModule());

  onStatus?.(null);
}

async function _fetchPyModule() {
  try {
    const r = await fetch('src/fcf_reader.py');
    if (r.ok) return r.text();
  } catch (_) {}
  const el = document.getElementById('fcf-py');
  if (el) return el.textContent;
  throw new Error('Cannot load src/fcf_reader.py — serve via HTTP server.');
}

/* ── Parsing ─────────────────────────────────────────────────────────────── */

async function parseFcfFile(file) {
  _assertReady();
  const buf = await file.arrayBuffer();
  return _runParse(new Uint8Array(buf), file.name);
}

async function parseFcfUrl(url) {
  _assertReady();
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status} — ${url}`);
  const buf  = await resp.arrayBuffer();
  return _runParse(new Uint8Array(buf), url.split('/').pop().split('?')[0]);
}

async function _runParse(uint8, filename) {
  /* Pass Uint8Array to Python — Pyodide converts via .to_py() (memoryview).
     Much faster than Array.from() for large files. */
  _pyodide.globals.set('_fcf_bytes',    uint8);
  _pyodide.globals.set('_fcf_filename', filename);
  const json = await _pyodide.runPythonAsync(
    'load_fcf(bytes(_fcf_bytes.to_py()), _fcf_filename)'
  );
  const result = JSON.parse(json);
  if (!result.ok) throw new Error(result.error || 'Parser error.');
  return result;
}

function _assertReady() {
  if (!_pyodide) throw new Error('Not initialised.');
}

/* ── JSON export ─────────────────────────────────────────────────────────── */

function exportFcfJson() {
  if (!_fcfData) return;
  const json = JSON.stringify(_fcfData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = (_fcfData.filename || 'fcf').replace(/\.[^.]+$/, '') + '_data.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/* ── Store ───────────────────────────────────────────────────────────────── */
function setFcfData(d) { _fcfData = d; }
function getFcfData()   { return _fcfData; }
