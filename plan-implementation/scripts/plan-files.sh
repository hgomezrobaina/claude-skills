#!/usr/bin/env bash
# Fija el commit base de un plan al empezar a implementarlo, repo por repo.
# Sirve en un repo único o en un workspace con varios repos hermanos.
#
#   plan-files.sh base [raíz]
#       Imprime la línea **Base:** (repo@sha de cada repo) para pegar en
#       tasks.md, y avisa de cambios sin commitear preexistentes.
#
# La raíz por defecto es el directorio actual. Los repos se descubren así:
#   - si la raíz está dentro de un repo git, ese repo (su toplevel) es el único;
#   - si no, cada carpeta hija de primer nivel que sea un repo git.
# PLAN_REPOS="a b ../c" fuerza la lista de repos (rutas relativas a la raíz).
#
#   plan-files.sh diagrams <carpeta-del-spec>
#       Exporta cada <spec>/diagrams/*.mmd a .png (escala 2, fondo blanco) y
#       .pdf (ajustado al diagrama), al lado del .mmd. Requiere `mmdc`
#       (npm i -g @mermaid-js/mermaid-cli). Si existe
#       ~/.config/mermaid/puppeteer.json (o $MMDC_PUPPETEER_CONFIG), se le pasa
#       a mmdc: ahí se fija el Chrome headless cuando Puppeteer no pudo bajar el suyo.
#
#   plan-files.sh diagrams-check <carpeta-del-spec>
#       Verifica sin exportar: cada .mmd tiene su .png y .pdf al día, cada ID
#       E2E-n de design.md aparece en algún diagrama plan-*.mmd y ningún
#       diagrama cita un E2E-n que no esté en design.md. Sale con 1 si falla algo.

set -euo pipefail

ROOT=""
REPO_NAMES=()
REPO_DIRS=()

add_repo() {
  local dir="$1" name="$2"
  REPO_DIRS+=("$dir")
  REPO_NAMES+=("$name")
}

is_repo_root() {
  local dir="$1" top
  top=$(git -C "$dir" rev-parse --show-toplevel 2>/dev/null) || return 1
  [ "$(cd "$dir" && pwd -P)" = "$(cd "$top" && pwd -P)" ]
}

discover_repos() {
  ROOT="$(cd "${1:-$PWD}" && pwd -P)"

  if [ -n "${PLAN_REPOS:-}" ]; then
    local rel
    for rel in $PLAN_REPOS; do
      local dir="$ROOT/$rel"
      [ -d "$dir" ] || { echo "⚠ no existe $rel" >&2; continue; }
      git -C "$dir" rev-parse --git-dir >/dev/null 2>&1 || { echo "⚠ $rel no es un repo git" >&2; continue; }
      add_repo "$(cd "$dir" && pwd -P)" "$rel"
    done
    return 0
  fi

  local top
  if top=$(git -C "$ROOT" rev-parse --show-toplevel 2>/dev/null); then
    top="$(cd "$top" && pwd -P)"
    add_repo "$top" "$(basename "$top")"
    return 0
  fi

  local child
  for child in "$ROOT"/*; do
    [ -d "$child" ] || continue
    case "$(basename "$child")" in .*|node_modules|vendor) continue ;; esac
    if is_repo_root "$child"; then
      add_repo "$(cd "$child" && pwd -P)" "$(basename "$child")"
    fi
  done
  return 0
}

cmd_base() {
  discover_repos "${1:-}"
  if [ "${#REPO_DIRS[@]}" -eq 0 ]; then
    echo "No encontré repos git en $ROOT." >&2; exit 1
  fi

  local parts=() i dirty
  for i in "${!REPO_DIRS[@]}"; do
    local dir="${REPO_DIRS[$i]}" name="${REPO_NAMES[$i]}" sha
    sha=$(git -C "$dir" rev-parse --short=10 HEAD 2>/dev/null) || {
      echo "⚠ $name no tiene commits todavía; queda fuera de la base." >&2; continue; }
    parts+=("$name@$sha")
    dirty=$(git -C "$dir" status --porcelain)
    if [ -n "$dirty" ]; then
      echo "⚠ $name ya tiene cambios sin commitear (pregúntale al usuario qué hacer):" >&2
      echo "$dirty" | sed 's/^/    /' >&2
    fi
  done
  [ "${#parts[@]}" -gt 0 ] || { echo "Ningún repo con commits en $ROOT." >&2; exit 1; }
  local joined=""
  for i in "${!parts[@]}"; do
    [ -z "$joined" ] && joined="${parts[$i]}" || joined="$joined, ${parts[$i]}"
  done
  echo "**Base:** $joined"
}

spec_dir() {
  [ -n "${1:-}" ] || { echo "Falta la carpeta del spec." >&2; exit 1; }
  [ -d "$1" ] || { echo "No existe la carpeta $1." >&2; exit 1; }
  (cd "$1" && pwd -P)
}

cmd_diagrams() {
  local dir; dir="$(spec_dir "${1:-}")"
  command -v mmdc >/dev/null || {
    echo "Falta mmdc: npm i -g @mermaid-js/mermaid-cli" >&2; exit 1; }
  local cfg="${MMDC_PUPPETEER_CONFIG:-$HOME/.config/mermaid/puppeteer.json}"
  local pargs=()
  [ -f "$cfg" ] && pargs=(-p "$cfg")
  shopt -s nullglob
  local files=("$dir"/diagrams/*.mmd) f base
  [ "${#files[@]}" -gt 0 ] || { echo "No hay .mmd en $dir/diagrams/." >&2; exit 1; }
  for f in "${files[@]}"; do
    base="${f%.mmd}"
    mmdc "${pargs[@]}" -q -i "$f" -o "$base.png" -s 2 -b white
    mmdc "${pargs[@]}" -q -i "$f" -o "$base.pdf"
    echo "✓ ${f#$dir/} → .png .pdf"
  done
}

cmd_diagrams_check() {
  local dir; dir="$(spec_dir "${1:-}")"
  shopt -s nullglob
  local files=("$dir"/diagrams/*.mmd) f ext fail=0
  [ "${#files[@]}" -gt 0 ] || { echo "✗ No hay .mmd en diagrams/." >&2; exit 1; }
  for f in "${files[@]}"; do
    for ext in png pdf; do
      if [ ! -f "${f%.mmd}.$ext" ]; then
        echo "✗ ${f#$dir/}: falta .$ext"; fail=1
      elif [ "$f" -nt "${f%.mmd}.$ext" ]; then
        echo "✗ ${f#$dir/}: el .$ext es más viejo que el .mmd"; fail=1
      fi
    done
  done
  if [ -f "$dir/design.md" ]; then
    local matrix diagrams id
    matrix=$(grep -oE '\bE2E-[0-9]+\b' "$dir/design.md" | sort -u || true)
    diagrams=$(cat "$dir"/diagrams/plan-*.mmd 2>/dev/null | grep -oE '\bE2E-[0-9]+\b' | sort -u || true)
    for id in $matrix; do
      grep -qx "$id" <<<"$diagrams" || { echo "✗ $id está en design.md pero en ningún diagrama plan-*.mmd"; fail=1; }
    done
    for id in $diagrams; do
      grep -qx "$id" <<<"$matrix" || { echo "✗ $id aparece en un diagrama pero no en design.md"; fail=1; }
    done
  fi
  [ "$fail" -eq 0 ] && echo "✓ Diagramas al día y cubren la matriz."
  return "$fail"
}

case "${1:-}" in
  base)            cmd_base "${2:-}" ;;
  diagrams)        cmd_diagrams "${2:-}" ;;
  diagrams-check)  cmd_diagrams_check "${2:-}" ;;
  *)      echo "Uso: $0 base [raíz] | diagrams <spec> | diagrams-check <spec>" >&2; exit 1 ;;
esac
