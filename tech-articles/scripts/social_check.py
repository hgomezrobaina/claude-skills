#!/usr/bin/env python3
"""
Comprueba los posts de `social.md` contra los límites de cada red.

Cada post es un archivo de texto plano en `publish/<slug>/posts/`, nombrado por red e
idioma, que el autor abre y copia entero:
  x-<lang>.txt        -> límite de X sin Premium: 280 caracteres ponderados
  linkedin-<lang>.txt -> reglas de formato para móvil (post-formatter, adaptadas)
También acepta un `social.md` antiguo con bloques ```text bajo `## Post de X` / `## Post de LinkedIn`.

Conteo de X (twitter-text v3): cada URL cuenta 23; los caracteres latinos, la
puntuación general y los signos de U+2000-U+201F/U+2032-U+2037 cuentan 1; el resto
(emojis, CJK, flechas…) cuenta 2.

Uso: python3 social_check.py publish/<slug>/posts/*.txt
"""
import pathlib
import re
import sys

URL = re.compile(r"https?://\S+")
LIGHT = [(0x0000, 0x10FF), (0x2000, 0x200D), (0x2010, 0x201F), (0x2032, 0x2037)]


def x_length(text: str) -> int:
    total = 0
    for url in URL.findall(text):
        total += 23
    text = URL.sub("", text)
    i = 0
    while i < len(text):
        cp = ord(text[i])
        # a variation selector or ZWJ glued to an emoji doesn't add weight of its own
        if cp in (0xFE0F, 0x200D):
            i += 1
            continue
        total += 1 if any(a <= cp <= b for a, b in LIGHT) else 2
        i += 1
    return total


def blocks(md: str):
    section = None
    for m in re.finditer(r"^## ([^\n]+)$|^```text\n(.*?)^```", md, re.M | re.S):
        if m.group(1):
            section = m.group(1)
        elif section:
            yield section, m.group(2).rstrip("\n")


def check_x(name, body):
    n = x_length(body)
    ok = n <= 280
    print(f"{'✓' if ok else '✗'} {name}: {n}/280 caracteres ponderados ({280 - n} de margen)")
    return ok


def check_linkedin(name, body):
    ok = True
    lines = body.split("\n")
    nonblank = [l for l in lines if l.strip()]
    words = len(body.split())
    chars = len(body)
    # a line with a link is as long as its URL: it doesn't count against the line limits
    prose = [l for l in nonblank if not URL.search(l)]
    long_lines = [l for l in prose if len(l) > 55]
    very_long = [l for l in prose if len(l) > 110]
    print(f"· {name}: {words} palabras, {chars}/3000 caracteres, {len(nonblank)} líneas con texto")
    checks = [
        (chars <= 3000, "más de 3.000 caracteres"),
        (len(nonblank) <= 20, f"{len(nonblank)} líneas con texto (máximo 20)"),
        (len(nonblank[0]) <= 50 if nonblank else True, f"el gancho tiene {len(nonblank[0]) if nonblank else 0} caracteres (máximo 50)"),
        (len(long_lines) <= 4 and not very_long, f"{len(long_lines)} líneas de más de 55 caracteres (máximo 4, ninguna de más de 110)"),
        ("—" not in body, "lleva rayas (—)"),
        (all(not (a.strip() and b.strip()) for a, b in zip(lines, lines[1:])), "hay líneas seguidas sin línea en blanco entre ellas"),
        (120 <= words <= 300, f"{words} palabras (objetivo 150-250, tope 300)"),
    ]
    for passed, msg in checks:
        if not passed:
            ok = False
            print(f"  ✗ {msg}")
    if ok:
        print("  ✓ formato de LinkedIn correcto")
    return ok


def posts(paths):
    for path in paths:
        text = open(path, encoding="utf-8").read()
        if path.endswith(".md"):
            yield from blocks(text)
        else:
            yield pathlib.Path(path).stem, text.rstrip("\n")


def main():
    found = False
    all_ok = True
    for name, body in posts(sys.argv[1:]):
        low = name.lower()
        if "linkedin" in low:
            found = True
            all_ok &= check_linkedin(name, body)
        elif re.search(r"(^|\b|_)x(\b|-|$)", low):
            found = True
            all_ok &= check_x(name, body)
    if not found:
        print("No hay posts: pasa los archivos posts/x-<lang>.txt y posts/linkedin-<lang>.txt.")
        sys.exit(2)
    sys.exit(0 if all_ok else 1)


if __name__ == "__main__":
    main()
