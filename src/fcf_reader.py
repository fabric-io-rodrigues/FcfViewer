"""
fcf_reader.py — PSR FCF Viewer · Python parser (runs inside Pyodide)

Supported formats:
  .psr   Native SDDP binary (costmexx.psr / costsexx.psr / costmebo.psr …)
  .csv   Tab-delimited export (costmexx.xls saved as CSV)
  .xls   Same tab-delimited format (SDDP XLS export, not real XLSX)
  .json  Pre-exported JSON from this viewer (no re-parsing needed)

Binary format (little-endian, no Fortran record wrappers):
──────────────────────────────────────────────────────────
Block 0  (offset 0, nrecut bytes) — File header
  INT32  nrecut     size of each record/block in bytes
  INT32  ircut      (internal SDDP counter)
  INT32  verr4      file version
  INT32  ndam       number of reservoirs (dam agents)
  INT32  nplant     number of hydro plants (inflow agents)
  INT32  nseq       number of sequences
  INT32  norden     number of inflow orders (0 = no inflow agents)
  INT32  mesini     start month (1-12)
  INT32  anoini     start year
  INT32  nper       number of periods/stages
  FLOAT64 zinf0
  INT32  iter
  FLOAT64 zinf
  FLOAT64 zsup
  INT32  itbst
  FLOAT64 zsupbst
  INT32[nper] iprev   linked-list head per stage (1-indexed record number)

Block 1  (offset nrecut, nrecut bytes) — Agent codes
  INT32[ndam]   numdam   reservoir codes
  INT32[nplant] numhid   plant codes

Cut records  (at byte offset nrecut*(ireg-1)):
  INT32   ireg        pointer to previous cut (0 = end of chain)
  INT32   iter
  INT32   cluster
  INT32   simulation
  INT32   it0
  FLOAT64 rhs
  FLOAT64[ndam]             dam_vol   (water-value coefficients per reservoir)
  FLOAT64[norden × nplant]  hyd_inflow (inflow wv — row-major: order × plant)
"""

import io
import csv
import json
import struct


# ── Helpers ──────────────────────────────────────────────────────────────────

def _try_float(val):
    try:
        return float(val)
    except (ValueError, TypeError):
        return None


# ── PSR Binary parser ─────────────────────────────────────────────────────────

def parse_psr(data: bytes) -> dict:
    f = io.BytesIO(data)
    ri = lambda: struct.unpack('<i', f.read(4))[0]
    rd = lambda: struct.unpack('<d', f.read(8))[0]

    # ── Header (Block 0) ──────────────────────────────────────────────────
    nrecut  = ri()
    ircut   = ri()
    verr4   = ri()
    ndam    = ri()
    nplant  = ri()
    nseq    = ri()
    norden  = ri()
    mesini  = ri()
    anoini  = ri()
    nper    = ri()
    zinf0   = rd()
    iter_   = ri()
    zinf    = rd()
    zsup    = rd()
    itbst   = ri()
    zsupbst = rd()
    iprev   = [ri() for _ in range(nper)]

    # ── Agent codes (Block 1) ─────────────────────────────────────────────
    f.seek(nrecut)
    numdam = [ri() for _ in range(ndam)]
    numhid = [ri() for _ in range(nplant)]

    # Agent labels
    dam_names = [f"H{numdam[i]}" for i in range(ndam)]
    # Inflow groups: "Inflow 0", "Inflow -1", ... (SDDP convention: order 0, -1, -2 …)
    inflow_groups = []
    for iord in range(norden):
        order_label = str(iord * -1)
        inflow_groups.append({
            'label': f"Inflow ({order_label})",
            'plants': [f"P{numhid[ip]}" for ip in range(nplant)],
        })

    # ── Walk linked lists for every stage ─────────────────────────────────
    cuts = []
    for stage_idx in range(nper):
        iaux  = iprev[stage_idx]
        chain = []
        while iaux > 0:
            f.seek(nrecut * (iaux - 1))
            ireg_      = struct.unpack('<i', f.read(4))[0]
            iter_c     = struct.unpack('<i', f.read(4))[0]
            cluster    = struct.unpack('<i', f.read(4))[0]
            simulation = struct.unpack('<i', f.read(4))[0]
            it0        = struct.unpack('<i', f.read(4))[0]
            rhs        = struct.unpack('<d', f.read(8))[0]

            dam_vol    = [struct.unpack('<d', f.read(8))[0] for _ in range(ndam)]

            # hyd_inflow[norden][nplant]
            hyd_inflow = []
            for _ in range(norden):
                row = [struct.unpack('<d', f.read(8))[0] for _ in range(nplant)]
                hyd_inflow.append(row)

            chain.append({
                'iter': iter_c, 'cluster': cluster, 'scenario': simulation,
                'rhs': rhs, 'dam_vol': dam_vol, 'hyd_inflow': hyd_inflow,
            })
            iaux = ireg_

        # Linked list is last→first; reverse to get cut 1, 2, 3 …
        chain.reverse()
        for cut_num, c in enumerate(chain, start=1):
            hydros = {dam_names[i]: c['dam_vol'][i] for i in range(ndam)}
            # Include inflow water values as separate agent groups
            inflow_vals = {}
            for iord, grp in enumerate(inflow_groups):
                for ip, pname in enumerate(grp['plants']):
                    key = f"{grp['label']}·{pname}"
                    inflow_vals[key] = c['hyd_inflow'][iord][ip]
            cuts.append({
                'stage':    stage_idx + 1,
                'cut':      cut_num,
                'iter':     c['iter'],
                'cluster':  c['cluster'],
                'scenario': c['scenario'],
                'rhs':      c['rhs'],
                'hydros':   hydros,
                'inflow':   inflow_vals if inflow_vals else None,
            })

    if not cuts:
        raise ValueError("No cuts found in PSR file.")

    stages      = sorted({c['stage'] for c in cuts if c['rhs'] is not None})
    max_cut_num = max(c['cut'] for c in cuts)

    return {
        'format': 'psr',
        'metadata': {
            'nper': nper, 'ndam': ndam, 'nplant': nplant, 'norden': norden,
            'mesini': mesini, 'anoini': anoini,
            'iter': iter_, 'zinf': zinf, 'zsup': zsup,
            'zsupbst': zsupbst, 'itbst': itbst,
        },
        'cuts':     cuts,
        'stages':   stages,
        'max_cut':  max_cut_num,
        'hydros':   dam_names,
        'has_inflow': norden > 0,
        'rhs_unit': 'k$',
        'vol_unit': 'k$/hm³',
    }


# ── TSV / CSV parser ──────────────────────────────────────────────────────────
#
# Row 0 : headers  — Stage | Num. Cut | Iteration | Cluster | Scenario | RHS | Vol. Hydro …
# Row 1 : units    — …     | …        | …         | …       | …        | k$  | k$/hm3     …
# Row 2 : labels   — …     | …        | …         | …       | …        | …   | H1 | H2     …
# Row 3+: data

def parse_tsv(data: bytes) -> dict:
    try:
        text = data.decode('latin-1')
    except Exception:
        text = data.decode('utf-8', errors='replace')

    rows = list(csv.reader(io.StringIO(text), delimiter='\t'))
    if len(rows) < 4:
        raise ValueError("File has fewer than 4 rows — invalid TSV format.")

    headers   = [h.strip() for h in rows[0]]
    units_row = [u.strip() for u in rows[1]]
    hydro_row = [h.strip() for h in rows[2]]

    def ci(name):
        for i, h in enumerate(headers):
            if name.lower() in h.lower():
                return i
        return -1

    i_stage = ci('stage');  i_cut = ci('num. cut')
    i_iter  = ci('iteration'); i_cluster = ci('cluster')
    i_scen  = ci('scenario'); i_rhs = ci('rhs')

    hydro_cols, k = [], 0
    for i, h in enumerate(headers):
        if 'vol. hydro' in h.lower():
            label = (hydro_row[i].strip() if i < len(hydro_row) else '') or f'H{k+1}'
            hydro_cols.append((i, label));  k += 1

    rhs_unit = units_row[i_rhs] if 0 <= i_rhs < len(units_row) else 'k$'
    vol_unit = (units_row[hydro_cols[0][0]]
                if hydro_cols and hydro_cols[0][0] < len(units_row) else 'k$/hm³')

    cuts = []
    for row in rows[3:]:
        if not row or not row[0].strip():
            continue
        def cell(idx):
            return row[idx].strip() if 0 <= idx < len(row) else ''
        sv = _try_float(cell(i_stage))
        if sv is None:
            continue
        entry = {
            'stage':    int(sv),
            'cut':      int(_try_float(cell(i_cut))     or 0),
            'iter':     int(_try_float(cell(i_iter))    or 0),
            'cluster':  int(_try_float(cell(i_cluster)) or 0),
            'scenario': int(_try_float(cell(i_scen))    or 0),
            'rhs':      _try_float(cell(i_rhs)),
            'hydros':   {},
            'inflow':   None,
        }
        for col_i, hname in hydro_cols:
            entry['hydros'][hname] = _try_float(cell(col_i))
        cuts.append(entry)

    if not cuts:
        raise ValueError("No data rows found in TSV.")

    stages = sorted({c['stage'] for c in cuts})
    return {
        'format':  'tsv',
        'metadata': {},
        'cuts':    cuts,
        'stages':  stages,
        'max_cut': max(c['cut'] for c in cuts),
        'hydros':  [n for _, n in hydro_cols],
        'has_inflow': False,
        'rhs_unit': rhs_unit,
        'vol_unit': vol_unit,
    }


# ── JSON passthrough ──────────────────────────────────────────────────────────

def parse_json_file(data: bytes) -> dict:
    try:
        text = data.decode('utf-8')
    except Exception:
        text = data.decode('latin-1', errors='replace')
    obj = json.loads(text)
    for key in ('cuts', 'stages', 'max_cut', 'hydros'):
        if key not in obj:
            raise ValueError(f"Invalid FCF JSON — missing key: '{key}'")
    return obj


# ── Public entry point ────────────────────────────────────────────────────────

def load_fcf(data: bytes, filename: str = '') -> str:
    """Called by Pyodide. Returns a JSON string."""
    fname = filename.lower().strip()
    try:
        if fname.endswith('.psr'):
            result = parse_psr(data)
        elif fname.endswith('.json'):
            result = parse_json_file(data)
        else:
            result = parse_tsv(data)
        result['filename'] = filename
        result['ok'] = True
        return json.dumps(result)
    except Exception as e:
        return json.dumps({'ok': False, 'error': str(e)})
