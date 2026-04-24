"""
fcf_reader.py — PSR FCF Viewer · Python module (runs inside Pyodide)

Parses SDDP Future Cost Function files:
  - .psr   Native binary (costmexx.psr) — Fortran-style linked-list records
  - .csv / .xls   Tab-delimited export from SDDP (costmexx.xls / .csv)
  - .json  Pre-parsed JSON (re-exported by this viewer)

Binary format (little-endian, no Fortran record markers):
  Block 0  (offset 0, nrecut bytes) — File header
    INT32  nrecut     record/block size in bytes
    INT32  ircut      (internal counter)
    INT32  verr4      file version
    INT32  ndam       number of reservoirs
    INT32  nplant     number of hydro plants
    INT32  nseq       number of sequences
    INT32  norden     inflow order (0 = no inflow agents)
    INT32  mesini     start month
    INT32  anoini     start year
    INT32  nper       number of periods (stages)
    FLOAT64 zinf0
    INT32  iter
    FLOAT64 zinf
    FLOAT64 zsup
    INT32  itbst
    FLOAT64 zsupbst
    INT32[nper] iprev   pointer to last cut-record for each stage (1-indexed)

  Block 1  (offset nrecut, nrecut bytes) — Agent codes
    INT32[ndam]   numdam   reservoir codes
    INT32[nplant] numhid   plant codes

  Cut records  (offset nrecut*(ireg-1)) — Linked list per stage
    INT32  ireg       pointer to previous cut (0 = end of chain)
    INT32  iter
    INT32  cluster
    INT32  simulation
    INT32  it0
    FLOAT64 rhs
    FLOAT64[ndam]          dam_vol   (water values per reservoir)
    FLOAT64[norden*nplant] hyd_inflow (inflow water values, row-major by order)
"""

import io
import csv
import json
import struct


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _try_float(val):
    try:
        return float(val)
    except (ValueError, TypeError):
        return None


# ---------------------------------------------------------------------------
# PSR Binary parser  (.psr)
# ---------------------------------------------------------------------------

def parse_costme_binary(data: bytes) -> dict:
    f = io.BytesIO(data)

    def _ri():
        return struct.unpack('<i', f.read(4))[0]

    def _rd():
        return struct.unpack('<d', f.read(8))[0]

    # ── Header (Block 0 at offset 0) ──────────────────────────────────────
    nrecut  = _ri()
    ircut   = _ri()
    verr4   = _ri()
    ndam    = _ri()
    nplant  = _ri()
    nseq    = _ri()
    norden  = _ri()
    mesini  = _ri()
    anoini  = _ri()
    nper    = _ri()
    zinf0   = _rd()
    iter_   = _ri()
    zinf    = _rd()
    zsup    = _rd()
    itbst   = _ri()
    zsupbst = _rd()
    iprev   = [_ri() for _ in range(nper)]

    # ── Agent codes (Block 1 at offset nrecut) ────────────────────────────
    f.seek(nrecut)
    numdam  = [_ri() for _ in range(ndam)]
    numhid  = [_ri() for _ in range(nplant)]

    # Agent names: "H{code}" for dams, "P{code}" for plants (inflow)
    dam_names = [f"H{numdam[i]}" for i in range(ndam)]

    # ── Walk linked lists for every stage ─────────────────────────────────
    # iprev[stage] → last cut record for that stage (1-indexed)
    # Each cut record's first field (ireg) points to the previous cut.
    # Chain ends at ireg == 0.  We collect them in reverse then reverse back.

    cuts = []
    for stage_idx in range(nper):
        iaux = iprev[stage_idx]
        chain = []
        while iaux > 0:
            f.seek(nrecut * (iaux - 1))
            ireg_      = struct.unpack('<i', f.read(4))[0]
            iter_c     = struct.unpack('<i', f.read(4))[0]
            cluster    = struct.unpack('<i', f.read(4))[0]
            simulation = struct.unpack('<i', f.read(4))[0]
            it0        = struct.unpack('<i', f.read(4))[0]
            rhs        = struct.unpack('<d', f.read(8))[0]

            # Dam water values
            dam_vol = [struct.unpack('<d', f.read(8))[0] for _ in range(ndam)]

            # Inflow water values (norden orders × nplant plants)
            hyd_inflow = []
            for _ in range(norden):
                row = [struct.unpack('<d', f.read(8))[0] for _ in range(nplant)]
                hyd_inflow.append(row)

            chain.append({
                'iter': iter_c, 'cluster': cluster, 'scenario': simulation,
                'rhs': rhs,
                'dam_vol': dam_vol,
                'hyd_inflow': hyd_inflow,
            })
            iaux = ireg_

        # Chain is last→first; reverse to get cut 1, 2, 3 …
        chain.reverse()
        for cut_num, c in enumerate(chain, start=1):
            hydros = {dam_names[i]: c['dam_vol'][i] for i in range(ndam)}
            cuts.append({
                'stage':    stage_idx + 1,
                'cut':      cut_num,
                'iter':     c['iter'],
                'cluster':  c['cluster'],
                'scenario': c['scenario'],
                'rhs':      c['rhs'],
                'hydros':   hydros,
            })

    if not cuts:
        raise ValueError("Nenhum corte encontrado no arquivo PSR.")

    stages      = sorted({c['stage'] for c in cuts if c['rhs'] is not None})
    max_cut_num = max(c['cut'] for c in cuts)

    return {
        'format':   'psr',
        'metadata': {
            'nper':    nper,
            'ndam':    ndam,
            'nplant':  nplant,
            'norden':  norden,
            'mesini':  mesini,
            'anoini':  anoini,
            'iter':    iter_,
            'zinf':    zinf,
            'zsup':    zsup,
            'zsupbst': zsupbst,
            'itbst':   itbst,
        },
        'cuts':     cuts,
        'stages':   stages,
        'max_cut':  max_cut_num,
        'hydros':   dam_names,
        'rhs_unit': 'k$',
        'vol_unit': 'k$/hm³',
    }


# ---------------------------------------------------------------------------
# TSV / CSV parser  (.csv / .xls)
# ---------------------------------------------------------------------------
#
# Row 0 : column names  — Stage | Num. Cut | Iteration | Cluster | Scenario | RHS | Vol. Hydro ...
# Row 1 : units         —      |           |           |         |          | k$  | k$/hm3    ...
# Row 2 : hydro labels  —      |           |           |         |          |     | H1 | H2   ...
# Row 3+: data

def parse_costme_tsv(data: bytes) -> dict:
    try:
        text = data.decode('latin-1')
    except Exception:
        text = data.decode('utf-8', errors='replace')

    reader = csv.reader(io.StringIO(text), delimiter='\t')
    rows = [r for r in reader]

    if len(rows) < 4:
        raise ValueError("Arquivo com menos de 4 linhas — formato TSV inválido.")

    headers   = [h.strip() for h in rows[0]]
    units_row = [u.strip() for u in rows[1]]
    hydro_row = [h.strip() for h in rows[2]]

    def col_idx(name):
        for i, h in enumerate(headers):
            if name.lower() in h.lower():
                return i
        return -1

    i_stage    = col_idx('stage')
    i_cut      = col_idx('num. cut')
    i_iter     = col_idx('iteration')
    i_cluster  = col_idx('cluster')
    i_scenario = col_idx('scenario')
    i_rhs      = col_idx('rhs')

    hydro_cols = []
    k = 0
    for i, h in enumerate(headers):
        if 'vol. hydro' in h.lower():
            label = hydro_row[i].strip() if i < len(hydro_row) else ''
            hydro_cols.append((i, label or f'H{k+1}'))
            k += 1

    rhs_unit = units_row[i_rhs] if 0 <= i_rhs < len(units_row) else 'k$'
    vol_unit = (units_row[hydro_cols[0][0]]
                if hydro_cols and hydro_cols[0][0] < len(units_row) else 'k$/hm³')

    cuts = []
    for row in rows[3:]:
        if not row or not row[0].strip():
            continue
        def _cell(idx):
            return row[idx].strip() if 0 <= idx < len(row) else ''
        sv = _try_float(_cell(i_stage))
        if sv is None:
            continue
        entry = {
            'stage':    int(sv),
            'cut':      int(_try_float(_cell(i_cut))      or 0),
            'iter':     int(_try_float(_cell(i_iter))     or 0),
            'cluster':  int(_try_float(_cell(i_cluster))  or 0),
            'scenario': int(_try_float(_cell(i_scenario)) or 0),
            'rhs':      _try_float(_cell(i_rhs)),
            'hydros':   {},
        }
        for col_i, hname in hydro_cols:
            entry['hydros'][hname] = _try_float(_cell(col_i))
        cuts.append(entry)

    if not cuts:
        raise ValueError("Nenhum dado encontrado no arquivo TSV.")

    stages      = sorted({c['stage'] for c in cuts})
    max_cut_num = max(c['cut'] for c in cuts)
    hydro_names = [name for _, name in hydro_cols]

    return {
        'format':   'tsv',
        'metadata': {},
        'cuts':     cuts,
        'stages':   stages,
        'max_cut':  max_cut_num,
        'hydros':   hydro_names,
        'rhs_unit': rhs_unit,
        'vol_unit': vol_unit,
    }


# ---------------------------------------------------------------------------
# JSON passthrough  (.json — re-exported by this viewer)
# ---------------------------------------------------------------------------

def parse_json(data: bytes) -> dict:
    try:
        text = data.decode('utf-8')
    except Exception:
        text = data.decode('latin-1', errors='replace')
    obj = json.loads(text)
    # Validate minimal keys
    required = ('cuts', 'stages', 'max_cut', 'hydros')
    missing = [k for k in required if k not in obj]
    if missing:
        raise ValueError(f"JSON inválido — campos ausentes: {missing}")
    return obj


# ---------------------------------------------------------------------------
# Public entry point (called by Pyodide)
# ---------------------------------------------------------------------------

def load_fcf(data: bytes, filename: str = '') -> str:
    """Parse an FCF file and return a JSON string."""
    fname = filename.lower().strip()
    try:
        if fname.endswith('.psr'):
            result = parse_costme_binary(data)
        elif fname.endswith('.json'):
            result = parse_json(data)
        else:
            result = parse_costme_tsv(data)
        result['filename'] = filename
        result['ok'] = True
        return json.dumps(result)
    except Exception as e:
        return json.dumps({'ok': False, 'error': str(e)})
