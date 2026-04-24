"""
fcf_reader.py — FCF Viewer Python module (runs inside Pyodide)

Parses SDDP Future Cost Function files:
  - .csv / .xls   Tab-delimited export (costmexx.xls, costmexx.csv)
  - .psr          Native binary SDDP file (costmexx.psr) — stub, fill in binary layout
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
# TSV / CSV parser  (costmexx.xls exported as tab-delimited)
# ---------------------------------------------------------------------------

def parse_costme_tsv(data: bytes) -> dict:
    """
    Row 0 : column names  — Stage | Num. Cut | Iteration | Cluster | Scenario | RHS | Vol. Hydro ...
    Row 1 : units         —      |           |           |         |          | k$  | k$/hm3    ...
    Row 2 : hydro labels  —      |           |           |         |          |     | H1 | H2   ...
    Row 3+: data
    """
    try:
        text = data.decode("latin-1")
    except Exception:
        text = data.decode("utf-8", errors="replace")

    reader = csv.reader(io.StringIO(text), delimiter="\t")
    rows = [r for r in reader]

    if len(rows) < 4:
        raise ValueError("Arquivo com menos de 4 linhas — formato inválido.")

    headers     = [h.strip() for h in rows[0]]
    units_row   = [u.strip() for u in rows[1]]
    hydro_row   = [h.strip() for h in rows[2]]

    def col_idx(name):
        for i, h in enumerate(headers):
            if name.lower() in h.lower():
                return i
        return -1

    i_stage    = col_idx("stage")
    i_cut      = col_idx("num. cut")
    i_iter     = col_idx("iteration")
    i_cluster  = col_idx("cluster")
    i_scenario = col_idx("scenario")
    i_rhs      = col_idx("rhs")

    hydro_cols = [
        (i, (hydro_row[i] if i < len(hydro_row) and hydro_row[i] else f"H{k+1}"))
        for k, (i, h) in enumerate(
            (i, h) for i, h in enumerate(headers) if "vol. hydro" in h.lower()
        )
    ]

    rhs_unit = units_row[i_rhs] if 0 <= i_rhs < len(units_row) else "k$"
    vol_unit = (
        units_row[hydro_cols[0][0]]
        if hydro_cols and hydro_cols[0][0] < len(units_row)
        else "k$/hm³"
    )

    cuts = []
    for row in rows[3:]:
        if not row or not row[0].strip():
            continue
        sv = _try_float(row[i_stage]) if i_stage >= 0 and i_stage < len(row) else None
        if sv is None:
            continue
        entry = {
            "stage":    int(sv),
            "cut":      int(_try_float(row[i_cut])      or 0) if i_cut      >= 0 and i_cut      < len(row) else 0,
            "iter":     int(_try_float(row[i_iter])     or 0) if i_iter     >= 0 and i_iter     < len(row) else 0,
            "cluster":  int(_try_float(row[i_cluster])  or 0) if i_cluster  >= 0 and i_cluster  < len(row) else 0,
            "scenario": int(_try_float(row[i_scenario]) or 0) if i_scenario >= 0 and i_scenario < len(row) else 0,
            "rhs":      _try_float(row[i_rhs]) if i_rhs >= 0 and i_rhs < len(row) else None,
            "hydros":   {},
        }
        for col_i, hydro_name in hydro_cols:
            entry["hydros"][hydro_name] = _try_float(row[col_i]) if col_i < len(row) else None
        cuts.append(entry)

    if not cuts:
        raise ValueError("Nenhum dado encontrado no arquivo.")

    stages      = sorted({c["stage"] for c in cuts})
    max_cut_num = max((c["cut"] for c in cuts), default=0)
    hydro_names = [name for _, name in hydro_cols]

    return {
        "cuts":     cuts,
        "stages":   stages,
        "max_cut":  max_cut_num,
        "hydros":   hydro_names,
        "rhs_unit": rhs_unit,
        "vol_unit": vol_unit,
    }


# ---------------------------------------------------------------------------
# Binary parser  (costmexx.psr — Fortran unformatted sequential)
# ---------------------------------------------------------------------------
#
# SDDP writes Fortran unformatted records.  Each record is wrapped:
#   [INT32 byte_count] [payload bytes] [INT32 byte_count]
#
# Layout assumed (update offsets to match your SDDP version):
#
#   Record 1 — Header
#     INT32  n_stages
#     INT32  n_cuts_per_stage
#     INT32  n_hydros
#     CHAR*12 rhs_unit
#     CHAR*12 * n_hydros  hydro_names
#
#   Record 2..N — One record per cut entry
#     INT32   stage
#     INT32   cut_number
#     INT32   iteration
#     FLOAT64 rhs
#     FLOAT64 * n_hydros  water_values
# ---------------------------------------------------------------------------

def _read_fortran_record(data: bytes, offset: int):
    """Return (payload_bytes, new_offset) for a Fortran unformatted record."""
    if offset + 4 > len(data):
        raise ValueError(f"EOF while reading record length at offset {offset}")
    rec_len = struct.unpack_from("<i", data, offset)[0]
    offset += 4
    if offset + rec_len > len(data):
        raise ValueError(f"Record data truncated at offset {offset}")
    payload = data[offset : offset + rec_len]
    offset += rec_len
    offset += 4  # trailing length word
    return payload, offset


def parse_costme_binary(data: bytes) -> dict:
    offset = 0

    # --- Header record ---
    try:
        hdr, offset = _read_fortran_record(data, offset)
    except ValueError as e:
        raise ValueError(f"Falha ao ler cabeçalho do binário: {e}")

    hp = 0

    def _int(buf, pos):
        return struct.unpack_from("<i", buf, pos)[0], pos + 4

    def _chars(buf, pos, n):
        return buf[pos : pos + n].decode("latin-1").strip(), pos + n

    n_stages, hp = _int(hdr, hp)
    n_cuts,   hp = _int(hdr, hp)
    n_hydros, hp = _int(hdr, hp)
    rhs_unit, hp = _chars(hdr, hp, 12)
    hydro_names  = []
    for _ in range(n_hydros):
        name, hp = _chars(hdr, hp, 12)
        hydro_names.append(name or f"H{len(hydro_names)+1}")

    vol_unit = "k$/hm³"  # not always stored; set default

    # --- Data records ---
    cuts = []
    while offset < len(data):
        try:
            rec, offset = _read_fortran_record(data, offset)
        except ValueError:
            break  # end of useful data

        rp = 0
        stage,     rp = _int(rec, rp)
        cut_num,   rp = _int(rec, rp)
        iteration, rp = _int(rec, rp)
        rhs = struct.unpack_from("<d", rec, rp)[0]; rp += 8
        hydros = {}
        for h in hydro_names:
            hydros[h] = struct.unpack_from("<d", rec, rp)[0]; rp += 8
        cuts.append({
            "stage": stage, "cut": cut_num, "iter": iteration,
            "cluster": 1, "scenario": 1,
            "rhs": rhs, "hydros": hydros,
        })

    if not cuts:
        raise ValueError(
            "Nenhum dado lido do binário. "
            "Verifique se o formato .psr corresponde ao layout esperado "
            "(Fortran unformatted, little-endian). "
            "Consulte os comentários em fcf_reader.py para ajustar."
        )

    stages   = sorted({c["stage"] for c in cuts})
    max_cut  = max((c["cut"] for c in cuts), default=0)

    return {
        "cuts": cuts, "stages": stages, "max_cut": max_cut,
        "hydros": hydro_names, "rhs_unit": rhs_unit, "vol_unit": vol_unit,
    }


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

def load_fcf(data: bytes, filename: str = "") -> str:
    """Called by Pyodide. Returns a JSON string with the parsed data or error."""
    fname = filename.lower().strip()
    try:
        if fname.endswith(".psr"):
            result = parse_costme_binary(data)
        else:
            result = parse_costme_tsv(data)
        result["filename"] = filename
        result["ok"] = True
        return json.dumps(result)
    except Exception as e:
        return json.dumps({"ok": False, "error": str(e)})
