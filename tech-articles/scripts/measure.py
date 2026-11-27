#!/usr/bin/env python3
"""Measure a technical article draft: words per section (prose vs code), reading
time, budget per block, style lint and es/en structural parity.

Usage:
  measure.py es.md                         # table per section + total
  measure.py es.md --blocks 0-2,3-4,5-6,7- # budget per block (H2 indexes, 0 = hook before first H2)
  measure.py es.md --lint                  # style and hard-rule checks
  measure.py es.md --parity en.md          # structural parity between translations
  measure.py es.md --json                  # machine-readable output

Only the standard library is used.
"""

import argparse
import json
import re
import sys
from pathlib import Path

WPM = 275
MIN_MINUTES, MAX_MINUTES = 10, 15  # hard rule 12: every article reads in 10-15 min
CONTACT_TITLES = {"hablemos", "let's talk", "lets talk"}
DEFAULT_BUDGETS = [
    ("Diagnóstico", "<=", 25),
    ("Contexto y descarte", "<=", 20),
    ("Solución y prueba de fuego", ">=", 45),
    ("Cierre", "<=", 10),
]
CODE_LANGS_NEEDING_PATH = {"ts", "typescript", "tsx", "js", "javascript", "jsx", "py", "python", "go", "java", "cs", "csharp", "rs", "rust", "kt", "kotlin", "php", "rb", "ruby"}
PATH_COMMENT = re.compile(r"^\s*(//|#|--|/\*|<!--)\s*\S+\.[A-Za-z0-9]+")

LINT_ES = [
    ("voseo", re.compile(r"\b(tenés|podés|querés|sabés|hacés|decís|sos|mirá|fijate|fijáte|tené|hacé|poné|probá|usá|andá|vení)\b", re.I)),
    ("primera del plural", re.compile(r"\b(nosotros|nuestr[oa]s?|vamos a|veamos|todos sabemos|hemos visto)\b", re.I)),
    ("muletilla", re.compile(r"(en este art[ií]culo|es importante (destacar|mencionar|notar)|cabe (mencionar|destacar)|en resumen|sin m[aá]s pre[aá]mbulos|manos a la obra|como todos sabemos|a continuaci[oó]n veremos)", re.I)),
    ("registro comercial", re.compile(r"\b(potent[ea]s?|game[- ]changer|gu[ií]a (definitiva|completa)|incre[ií]ble|m[aá]gi(a|co))\b", re.I)),
]
LINT_EN = [
    ("first person plural", re.compile(r"\b(we'll|let's (dive|see|take)|as we all know)\b", re.I)),
    ("filler", re.compile(r"(in this article|it is important to note|without further ado|in summary|in conclusion)", re.I)),
    ("marketing register", re.compile(r"\b(powerful|game[- ]changer|ultimate guide|complete guide|amazing|magic(al)?)\b", re.I)),
]
# Genre clichés: the stock sentence that concedes the example code is fine.
# Rule 14: an article never uses the formula that every other article uses,
# and never uses the same rhetorical hinge twice.
CLICHE_ES = [
    ("fórmula de permanencia", re.compile(r"(puede|podr[íi]a|podria)\s+(quedarse|seguir|vivir)\s+(as[íi]|igual|sin\s+tocar)|aguanta\s+a[ñn]os|a[ñn]os\s+sin\s+tocarl|lleva\s+(\w+\s+)?a[ñn]os\s+en\s+producci[óo]n\s+y|no\s+ha\s+dado\s+(un\s+)?problema|hace\s+lo\s+que\s+promete|funciona\s+y\s+nadie\s+lo\s+toca|y\s+nadie\s+lo\s+ha\s+tocado", re.I)),
]
CLICHE_EN = [
    ("durability formula", re.compile(r"(can|could|will)\s+(stay|live|sit)\s+(like\s+)?(this|that)\s+for\s+years|has\s+been\s+in\s+production\s+for\s+years\s+and|does\s+(exactly\s+)?what\s+it\s+promises|works\s+fine\s+and\s+(nobody|no\s+one)\s+touches", re.I)),
]
# Formulaic hinges: fine once, a tic from the second time on.
HINGES_ES = [
    ("conviene decir", re.compile(r"\bconviene\s+(decir|aclarar|se[ñn]alar|recordar|advertir)\b", re.I)),
    ("la salida obvia", re.compile(r"\bla\s+(segunda\s+|otra\s+)?salida\s+obvia\b", re.I)),
    ("hay que conceder", re.compile(r"\bhay\s+que\s+conced[eé]r?(le|selo|lo)?\b", re.I)),
    ("lo que no cambió", re.compile(r"\blo\s+que\s+no\s+(cambi[óo]|cambia)\b", re.I)),
    ("más/menos de lo que parece", re.compile(r"\bde\s+lo\s+que\s+parece\b", re.I)),
    ("no es X, sino Y", re.compile(r"\bno\s+es\s+[^,.;]{3,60},\s+sino\b", re.I)),
    ("lo que sí/lo que no", re.compile(r"^\s*\*{0,2}lo\s+que\s+(s[íi]|no)\b", re.I)),
    ("y eso es todo/y ya", re.compile(r"\by\s+(eso\s+es\s+todo|ya\s+est[áa])\b", re.I)),
    ("el segundo orden", re.compile(r"\bel\s+(segundo|primer)\s+orden\b", re.I)),
]
HINGES_EN = [
    ("worth saying", re.compile(r"\bit'?s\s+worth\s+(saying|noting|pointing\s+out)\b", re.I)),
    ("the obvious way out", re.compile(r"\bthe\s+(second\s+|other\s+)?obvious\s+way\s+out\b", re.I)),
    ("credit where due", re.compile(r"\b(credit\s+where\s+(it'?s\s+)?due|to\s+be\s+fair\s+to\s+it)\b", re.I)),
    ("what didn't change", re.compile(r"\bwhat\s+(didn'?t|did\s+not)\s+change\b", re.I)),
    ("more than it looks", re.compile(r"\b(more|less)\s+than\s+it\s+(looks|seems)\b", re.I)),
    ("not X, but Y", re.compile(r"\bis\s+not\s+[^,.;]{3,60},\s+but\b", re.I)),
    ("the second-order effect", re.compile(r"\bthe\s+(second|first)[- ]order\s+(effect|cost|consequence)s?\b", re.I)),
]
OPENER_STOP = {"el", "la", "los", "las", "un", "una", "the", "a", "an"}

SECTION_NUMBER_REF = re.compile(r"(§\s*\d|\bsecci[oó]n\s+\d|\bsection\s+\d)", re.I)


def words(text):
    return len(re.findall(r"\S+", text))


def strip_comments(lines):
    """Return lines with HTML comments blanked, keeping line numbers stable."""
    out, inside = [], False
    for line in lines:
        buf, i = "", 0
        while i < len(line):
            if inside:
                end = line.find("-->", i)
                if end == -1:
                    i = len(line)
                else:
                    inside, i = False, end + 3
            else:
                start = line.find("<!--", i)
                if start == -1:
                    buf += line[i:]
                    i = len(line)
                else:
                    buf += line[i:start]
                    inside, i = True, start + 4
        out.append(buf)
    return out


def parse(path):
    raw = Path(path).read_text(encoding="utf-8").splitlines()
    lines = strip_comments(raw)
    sections = [{"title": "(gancho, antes del primer H2)", "prose": 0, "code": 0, "start": 1}]
    code_blocks, in_code, lang, first_code_line = [], False, "", None
    for n, line in enumerate(lines, 1):
        fence = re.match(r"^\s*(```|~~~)\s*([\w+-]*)", line)
        if fence:
            if not in_code:
                in_code, lang, first_code_line = True, fence.group(2).lower(), None
                code_blocks.append({"line": n, "lang": lang, "first": None})
            else:
                in_code = False
            continue
        if in_code:
            if code_blocks[-1]["first"] is None and line.strip():
                code_blocks[-1]["first"] = line
            sections[-1]["code"] += words(line)
            continue
        h2 = re.match(r"^##\s+(.*)", line)
        if h2 and not line.startswith("###"):
            sections.append({"title": h2.group(1).strip(), "prose": 0, "code": 0, "start": n})
            continue
        if re.match(r"^#\s+", line):
            continue  # article title
        # image alt text is for screen readers, not reading time
        prose_line = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", line)
        sections[-1]["prose"] += words(re.sub(r"^#+\s*", "", prose_line))
    for s in sections:
        s["total"] = s["prose"] + s["code"]
        s["contact"] = s["title"].lower() in CONTACT_TITLES
    return raw, lines, sections, code_blocks


def structure(raw, lines, code_blocks):
    text = "\n".join(lines)
    raw_text = "\n".join(raw)
    no_code = re.sub(r"```.*?```", "", text, flags=re.S)
    return {
        "H2": len(re.findall(r"^## ", no_code, re.M)),
        "H3": len(re.findall(r"^### ", no_code, re.M)),
        "bloques de código": len(code_blocks),
        "filas de tabla": len([l for l in no_code.splitlines() if l.strip().startswith("|") and not re.match(r"^\s*\|[\s:|-]+\|\s*$", l)]),
        "notas": len(re.findall(r"^> \*\*(Nota|Note)", no_code, re.M)),
        "citas en negrita": len(re.findall(r"^> \*\*(?!Nota|Note)", no_code, re.M)),
        "imágenes": len(re.findall(r"!\[[^\]]*\]\([^)]+\)", no_code)),
        "figuras pendientes": len(re.findall(r"<!--\s*\n?\s*(FIGURA|FIGURE)", raw_text)),
        "enlaces": len(re.findall(r"(?<!!)\[[^\]]+\]\(https?://", no_code)),
    }


def parse_blocks(spec, n_sections):
    blocks = []
    for part in spec.split(","):
        a, _, b = part.partition("-")
        start = int(a)
        end = int(b) if b else (start if "-" not in part else n_sections - 1)
        blocks.append(range(start, end + 1))
    return blocks


def lint(path, raw, lines, sections, code_blocks):
    is_en = Path(path).stem.lower().startswith("en")
    rules = LINT_EN if is_en else LINT_ES
    issues = []
    contact_start = next((s["start"] for s in sections if s["contact"]), len(lines) + 1)
    in_code = False
    prev_prose = None
    for n, line in enumerate(lines, 1):
        if re.match(r"^\s*(```|~~~)", line):
            in_code = not in_code
            prev_prose = None
            continue
        if in_code:
            continue
        stripped = line.strip()
        is_prose = bool(stripped) and not re.match(r"^(#|[-*+] |\d+\. |>|\||!\[|<|\*[^*])", stripped)
        if is_prose and prev_prose is not None:
            issues.append((n, "regla 9", "línea ajustada: el párrafo continúa en la línea anterior (un párrafo por línea)"))
        prev_prose = n if is_prose else None
        if not stripped:
            continue
        for name, rx in rules:
            for m in rx.finditer(line):
                issues.append((n, name, f"«{m.group(0)}»"))
        if SECTION_NUMBER_REF.search(line):
            issues.append((n, "regla 8", "referencia a sección por número: referenciar por título"))
        if "¿" in line and n < contact_start:
            issues.append((n, "tono", "pregunta retórica fuera del bloque de contacto"))
        if re.search(r"\bPENDIENTE\b|\bTODO\b|\bTBD\b", line):
            issues.append((n, "pendiente", stripped[:80]))
    for n, line in enumerate(raw, 1):
        if re.match(r"^\s*(FIGURA|FIGURE)\b", line):
            issues.append((n, "figura", "figura pendiente de generar: " + line.strip()[:70]))
    # one-sentence paragraphs not followed by a code block
    in_code = False
    for i, line in enumerate(lines):
        s = line.strip()
        if re.match(r"^(```|~~~)", s):
            in_code = not in_code
            continue
        # captions are a whole line in italics, with * or _
        if in_code or not s or re.match(r"^(#|[-*+] |\d+\. |>|\||!\[|<|```|\*)", s) or re.fullmatch(r"_[^_].*_", s):
            continue
        prev_blank = i == 0 or not lines[i - 1].strip()
        nxt = next((l.strip() for l in lines[i + 1:] if l.strip()), "")
        if prev_blank and len(re.findall(r"[.!?](\s|$)", s)) <= 1 and not nxt.startswith("```") and not s.endswith(":") and i + 1 < contact_start:
            issues.append((i + 1, "tono", "párrafo de una sola oración (¿remate lapidario? fundir con el anterior)"))
    # cadence (rule 14): genre clichés, formulaic hinges used twice, repeated openers
    prose, in_code = [], False
    for n, line in enumerate(lines, 1):
        if re.match(r"^\s*(```|~~~)", line):
            in_code = not in_code
            continue
        if in_code or not line.strip() or line.strip().startswith("#"):
            continue
        prose.append((n, line))
    for _, rx in (CLICHE_EN if is_en else CLICHE_ES):
        for n, line in prose:
            for m in rx.finditer(line):
                issues.append((n, "cadencia", f"fórmula de artículo: «{m.group(0).strip()}» — decir lo mismo de otra forma"))
    for name, rx in (HINGES_EN if is_en else HINGES_ES):
        hits = [n for n, line in prose for _ in rx.finditer(line)]
        if len(hits) > 1:
            where = ", ".join("L%d" % n for n in hits)
            issues.append((hits[1], "cadencia", f"«{name}» {len(hits)} veces ({where}): variar el esquema desde la segunda"))
    openers = {}
    for n, line in prose:
        for sent in re.split(r"(?<=[.:;!?])\s+", line.strip()):
            ws = [w for w in re.findall(r"[\w'’-]+", sent.lower(), re.UNICODE) if w not in OPENER_STOP]
            if len(ws) >= 2:
                openers.setdefault(" ".join(ws[:2]), []).append(n)
    for key, ns in sorted(openers.items()):
        if len(ns) >= 4:
            where = ", ".join("L%d" % n for n in sorted(set(ns)))
            issues.append((ns[1], "cadencia", f"{len(ns)} oraciones empiezan por «{key}» ({where})"))
    for b in code_blocks:
        if b["lang"] in CODE_LANGS_NEEDING_PATH and not (b["first"] and PATH_COMMENT.match(b["first"])):
            issues.append((b["line"], "regla 6", f"snippet `{b['lang']}` sin la ruta del archivo como primera línea"))
    base = Path(path).parent
    for n, line in enumerate(lines, 1):
        for m in re.finditer(r"!\[[^\]]*\]\(([^)\s]+)\)", line):
            target = m.group(1)
            if not target.startswith("http") and not (base / target).exists():
                issues.append((n, "figura", f"la imagen no existe: {target}"))
    return sorted(issues)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("file")
    ap.add_argument("--blocks", help="H2 index ranges per budget block, e.g. 0-2,3-4,5-6,7-")
    ap.add_argument("--lint", action="store_true")
    ap.add_argument("--parity", metavar="OTHER")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    raw, lines, sections, code_blocks = parse(args.file)
    body = [s for s in sections if not s["contact"]]
    total = sum(s["total"] for s in body)
    prose = sum(s["prose"] for s in body)
    minutes = total / WPM
    in_band = MIN_MINUTES <= minutes <= MAX_MINUTES
    result = {"file": args.file, "total": total, "prose": prose, "code": total - prose, "minutes": round(minutes, 1), "in_band": in_band, "sections": sections}

    if args.blocks:
        blocks = parse_blocks(args.blocks, len(sections))
        result["blocks"] = []
        for (name, op, pct), rng in zip(DEFAULT_BUDGETS, blocks):
            w = sum(sections[i]["total"] for i in rng if i < len(sections) and not sections[i]["contact"])
            share = 100 * w / total if total else 0
            ok = share <= pct if op == "<=" else share >= pct
            result["blocks"].append({"block": name, "sections": f"{rng.start}-{rng.stop - 1}", "words": w, "pct": round(share, 1), "budget": f"{op} {pct} %", "ok": ok})
    if args.lint:
        result["lint"] = [{"line": n, "rule": r, "msg": m} for n, r, m in lint(args.file, raw, lines, sections, code_blocks)]
    if args.parity:
        a = structure(raw, lines, code_blocks)
        oraw, olines, _, oblocks = parse(args.parity)
        b = structure(oraw, olines, oblocks)
        result["parity"] = [{"item": k, "a": a[k], "b": b[k], "ok": a[k] == b[k]} for k in a]

    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return

    print(f"\n{args.file}: {total:,} palabras ({prose:,} prosa + {total - prose:,} código) · {result['minutes']} min a {WPM} ppm\n".replace(",", "."))
    lo, hi = MIN_MINUTES * WPM, MAX_MINUTES * WPM
    if in_band:
        print(f"Duración ✓ dentro de la banda {MIN_MINUTES}-{MAX_MINUTES} min ({lo:,}-{hi:,} palabras)\n".replace(",", "."))
    elif minutes < MIN_MINUTES:
        print(f"Duración ✗ por debajo de {MIN_MINUTES} min: faltan {lo - total:,} palabras. Revisar si falta prueba de fuego, matices o vuelta al inventario; no rellenar.\n".replace(",", "."))
    else:
        print(f"Duración ✗ por encima de {MAX_MINUTES} min: sobran {total - hi:,} palabras. Recortar (matices → estado del arte → diagnóstico) o partir en dos artículos.\n".replace(",", "."))
    print(f"{'#':>2}  {'Sección':<58} {'Prosa':>6} {'Código':>7} {'Total':>6}")
    for i, s in enumerate(sections):
        mark = " (excluida)" if s["contact"] else ""
        print(f"{i:>2}  {(s['title'][:56] + mark):<58} {s['prose']:>6} {s['code']:>7} {s['total']:>6}")
    if "blocks" in result:
        print("\n| Bloque | Secciones | Palabras | % | Presupuesto |\n| --- | --- | --- | --- | --- |")
        for b in result["blocks"]:
            print(f"| {b['block']} | {b['sections']} | {b['words']} | {b['pct']} % | {b['budget']} {'✓' if b['ok'] else '✗'} |")
    if "lint" in result:
        print(f"\nLint: {len(result['lint'])} avisos")
        for it in result["lint"]:
            print(f"  L{it['line']:<5} [{it['rule']}] {it['msg']}")
    if "lint" in result and not in_band:
        print(f"  [regla 12] {result['minutes']} min fuera de la banda {MIN_MINUTES}-{MAX_MINUTES}")
    if "parity" in result:
        print(f"\nParidad {args.file} ↔ {args.parity}")
        for p in result["parity"]:
            print(f"  {'✓' if p['ok'] else '✗'} {p['item']:<20} {p['a']:>4} ↔ {p['b']:<4}")
        if not all(p["ok"] for p in result["parity"]):
            sys.exit(1)


if __name__ == "__main__":
    main()
