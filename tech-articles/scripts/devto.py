#!/usr/bin/env python3
"""Crea o actualiza en dev.to el artículo de `publish/<slug>/<lang>.md` (API v1 de Forem).

Uso:
    python3 devto.py publish/<slug>/es.md --dry-run     # valida y enseña lo que se enviaría, sin llamar a la API
    python3 devto.py publish/<slug>/es.md               # crea o actualiza el BORRADOR
    python3 devto.py publish/<slug>/es.md --publish     # publica (sólo si el autor lo ha pedido: regla 13)
    python3 devto.py publish/<slug>/es.md --status      # estado del artículo en dev.to

La clave sale de la variable de entorno DEVTO_API_KEY (dev.to → Settings → Extensions →
DEV Community API Keys). Nunca se imprime ni se guarda en disco.

Los metadatos van en `publish/<slug>/devto.json`, una entrada por idioma (el nombre del .md):

    {
      "es": {"description": "...", "tags": ["nestjs", "react"], "series": null,
             "canonical_url": null, "main_image": null, "id": null, "url": null},
      "en": {...}
    }

`id` y `url` los escribe el script tras crear el artículo; con `id`, las siguientes
ejecuciones actualizan ese mismo artículo en vez de crear otro.

Comportamiento (verificado en developers.forem.com/api/v1, 2026-11-06):
- POST /api/articles crea; PUT /api/articles/{id} actualiza. Cuerpo {"article": {...}}.
- Cabeceras: `api-key` y `accept: application/vnd.forem.api-v1+json`.
- `published` por defecto es false (borrador). Un PUT con `published: false` sobre un
  artículo publicado lo devuelve a borrador, así que al actualizar sólo se envía
  `published` cuando se pasa --publish.
- `tags` va como LISTA (como mucho 4). La documentación dice «cadena separada por comas», pero
  la API real la ignora y pone tags automáticos (comprobado el 2026-11-06 al publicar
  domain-errors-nest-react); con una lista los guarda tal cual.
- El título va en el campo `title`: el H1 del .md se quita del cuerpo.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

API = "https://dev.to/api"
HEADERS = {
    "accept": "application/vnd.forem.api-v1+json",
    "content-type": "application/json",
    # Un cliente genérico: ningún dato personal en la cabecera.
    "user-agent": "tech-articles-skill/1.0",
}
TAG = re.compile(r"^[a-z0-9]+$")
LOCAL_IMAGE = re.compile(r"!\[[^\]]*\]\((?!https?://)([^)]+)\)")
# Markers left while drafting: uppercase, whole words ("depending" must not match).
PENDING = re.compile(r"<!--\s*FIGURA|\bPENDIENTE\b|\bPENDING\b")


def fail(msg: str) -> None:
    print(f"✗ {msg}", file=sys.stderr)
    sys.exit(1)


def split_title(markdown: str) -> tuple[str, str]:
    """The first `# ` line is the title; the body is everything after it."""
    lines = markdown.splitlines()
    for i, line in enumerate(lines):
        if line.startswith("# "):
            body = "\n".join(lines[i + 1 :]).lstrip("\n")
            return line[2:].strip(), body + ("\n" if not body.endswith("\n") else "")
        if line.strip():
            break
    fail("el artículo no empieza por un título `# …`")
    raise SystemExit  # unreachable


def validate(title: str, body: str, meta: dict) -> list[str]:
    problems = []
    description = meta.get("description") or ""
    tags = meta.get("tags") or []

    if not description:
        problems.append("falta `description` en devto.json")
    elif len(description) > 160:
        problems.append(f"`description` tiene {len(description)} caracteres (máximo 160)")
    if not tags:
        problems.append("faltan `tags` en devto.json")
    if len(tags) > 4:
        problems.append(f"{len(tags)} tags (dev.to admite 4)")
    for t in tags:
        if not TAG.match(t):
            problems.append(f"tag «{t}»: minúsculas y números, sin guiones ni espacios")
    for path in LOCAL_IMAGE.findall(body):
        problems.append(f"imagen con ruta local: {path} (súbela al repo y usa raw.githubusercontent.com)")
    if PENDING.search(body) or PENDING.search(title):
        problems.append("quedan marcas FIGURA / PENDIENTE / PENDING en el texto")
    return problems


def request(method: str, path: str, key: str, payload: dict | None = None) -> dict | list:
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(f"{API}{path}", data=data, method=method, headers={**HEADERS, "api-key": key})
    try:
        with urllib.request.urlopen(req, timeout=30) as res:
            return json.loads(res.read() or b"{}")
    except urllib.error.HTTPError as e:
        detail = e.read().decode(errors="replace")[:300]
        hints = {401: "clave inválida o caducada", 404: "no existe ese artículo o no es tuyo", 422: "dev.to rechazó los datos", 429: "límite de peticiones; espera y repite"}
        fail(f"{method} {path} → {e.code} ({hints.get(e.code, 'error')}): {detail}")
    except urllib.error.URLError as e:
        fail(f"sin conexión con dev.to: {e.reason}")
    raise SystemExit  # unreachable


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("article", type=Path, help="publish/<slug>/<lang>.md")
    ap.add_argument("--meta", type=Path, help="devto.json (por defecto, junto al artículo)")
    ap.add_argument("--publish", action="store_true", help="publicar; sin esto, borrador")
    ap.add_argument("--dry-run", action="store_true", help="validar y mostrar sin llamar a la API")
    ap.add_argument("--status", action="store_true", help="mostrar el estado en dev.to")
    args = ap.parse_args()

    if not args.article.is_file():
        fail(f"no existe {args.article}")
    lang = args.article.stem
    meta_path = args.meta or args.article.with_name("devto.json")
    if not meta_path.is_file():
        fail(f"no existe {meta_path}: créalo desde assets/devto.json")
    all_meta = json.loads(meta_path.read_text())
    meta = all_meta.get(lang)
    if meta is None:
        fail(f"{meta_path} no tiene entrada «{lang}»")

    title, body = split_title(args.article.read_text())
    problems = validate(title, body, meta)

    if args.dry_run or problems:
        print(f"Artículo: {args.article}  ({lang})")
        print(f"  título:       {title}")
        print(f"  descripción:  {meta.get('description')}  ({len(meta.get('description') or '')}/160)")
        print(f"  tags:         {', '.join(meta.get('tags') or [])}")
        print(f"  serie:        {meta.get('series')}")
        print(f"  canonical:    {meta.get('canonical_url')}")
        print(f"  portada:      {meta.get('main_image')}")
        print(f"  cuerpo:       {len(body.split())} palabras, {body.count(chr(10))} líneas")
        print(f"  acción:       {'PUT /articles/' + str(meta['id']) if meta.get('id') else 'POST /articles'}"
              f"{' + publicar' if args.publish else ' (borrador)'}")
    if problems:
        for p in problems:
            print(f"  ✗ {p}")
        sys.exit(1)
    if args.dry_run:
        print("  ✓ listo para enviar")
        return

    key = os.environ.get("DEVTO_API_KEY")
    if not key:
        fail("falta la variable de entorno DEVTO_API_KEY")

    if args.status:
        if not meta.get("id"):
            fail("devto.json no tiene `id`: el artículo aún no se ha creado")
        for page in range(1, 11):
            items = request("GET", f"/articles/me/all?per_page=100&page={page}", key)
            match = next((a for a in items if a.get("id") == meta["id"]), None)
            if match:
                state = "publicado" if match.get("published_at") else "borrador"
                print(f"{lang}: {state} · {match.get('url')} · editado {match.get('edited_at') or match.get('created_at')}")
                return
            if not items:
                break
        fail(f"no encuentro el artículo {meta['id']} entre los tuyos")

    article = {"title": title, "body_markdown": body, "description": meta["description"], "tags": list(meta["tags"])}
    for field in ("series", "canonical_url", "main_image"):
        if meta.get(field):
            article[field] = meta[field]

    if meta.get("id"):
        if args.publish:
            article["published"] = True
        result = request("PUT", f"/articles/{meta['id']}", key, {"article": article})
        verb = "actualizado"
    else:
        article["published"] = args.publish
        result = request("POST", "/articles", key, {"article": article})
        verb = "creado"

    meta["id"] = result.get("id", meta.get("id"))
    meta["url"] = result.get("url", meta.get("url"))
    meta_path.write_text(json.dumps(all_meta, ensure_ascii=False, indent=2) + "\n")
    state = "publicado" if result.get("published_at") or args.publish else "borrador"
    print(f"✓ {lang} {verb} ({state}): {meta['url']}  (id {meta['id']}, guardado en {meta_path.name})")


if __name__ == "__main__":
    main()
