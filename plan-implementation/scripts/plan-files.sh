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
#
#   plan-files.sh demo-install <frontend> [--force]
#       Instala (o actualiza) el kit del modo demo de Cypress en el frontend:
#       copia kits/cypress-demo con su VERSION y sus sumas de verificación y agrega
#       `import "./demo";` a cypress/support/e2e.ts. Si algún archivo del kit fue
#       tocado a mano no copia nada, lo lista y sale con 1 (--force lo pisa).
#
#   plan-files.sh demo-check <frontend>
#       Dice si el kit instalado está al día. Sale con 1 si no está instalado, si
#       fue modificado a mano o si la skill trae una versión más nueva.
#
#   plan-files.sh videos <spec> <frontend> [specs-de-cypress…]
#       Genera un video por caso E2E-n en <spec>/videos/ (fuera de git): comprueba
#       el kit y que videos/ esté ignorado, arma los subtítulos desde
#       test-walkthrough.md, corre Cypress en modo demo y corta un clip por caso.
#       Sin specs de Cypress usa los de la columna «Spec» de design.md. El entorno
#       (backend, build del frontend) lo levanta quien llama. Argumentos extra de
#       Cypress (p. ej. --config baseUrl=…): variable DEMO_CYPRESS_ARGS.
#
#   plan-files.sh videos-check <spec>
#       Falla si falta el clip de un E2E-n de los walkthrough-*.mmd, si sobra uno o
#       si algún clip no se puede reproducir.

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

KIT_SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)/kits/cypress-demo"
DEMO_VERSION_REL="cypress/support/demo/VERSION"
DEMO_CHECKSUMS_REL="cypress/support/demo/.checksums"
DEMO_IMPORT_LINE='import "./demo";'
DEMO_SCRIPT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)/demo-videos.mjs"

sha256_of() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | cut -d' ' -f1
  else
    shasum -a 256 "$1" | cut -d' ' -f1
  fi
}

# "<origen en el kit><TAB><destino en el proyecto>" por cada archivo del kit.
kit_pairs() {
  local rel
  while IFS= read -r rel; do
    if [ "$rel" = "VERSION" ]; then
      printf '%s\t%s\n' "$rel" "$DEMO_VERSION_REL"
    else
      printf '%s\t%s\n' "$rel" "$rel"
    fi
  done < <(cd "$KIT_SRC" && find . -type f | sed 's|^\./||' | sort)
}

frontend_dir() {
  [ -n "${1:-}" ] || { echo "Falta la carpeta del frontend." >&2; exit 1; }
  [ -d "$1" ] || { echo "No existe la carpeta $1." >&2; exit 1; }
  (cd "$1" && pwd -P)
}

# Imprime: missing | modified:<archivos> | stale | ok
demo_state() {
  local fe="$1" sums="$1/$DEMO_CHECKSUMS_REL" hash rel src dst modified=""
  if [ ! -f "$fe/$DEMO_VERSION_REL" ] || [ ! -f "$sums" ]; then
    echo missing; return 0
  fi
  while read -r hash rel; do
    if [ ! -f "$fe/$rel" ] || [ "$(sha256_of "$fe/$rel")" != "$hash" ]; then
      modified="$modified $rel"
    fi
  done < "$sums"
  if [ -n "$modified" ]; then
    echo "modified:${modified# }"; return 0
  fi
  while IFS=$'\t' read -r src dst; do
    if [ ! -f "$fe/$dst" ] || [ "$(sha256_of "$KIT_SRC/$src")" != "$(sha256_of "$fe/$dst")" ]; then
      echo stale; return 0
    fi
  done < <(kit_pairs)
  echo ok
}

ensure_demo_import() {
  local support="$1/cypress/support/e2e.ts"
  if ! grep -qF "$DEMO_IMPORT_LINE" "$support"; then
    printf '\n%s\n' "$DEMO_IMPORT_LINE" >> "$support"
    echo "  + $DEMO_IMPORT_LINE en cypress/support/e2e.ts"
  fi
}

cmd_demo_install() {
  local fe force=0 arg
  fe="$(frontend_dir "${1:-}")"
  shift || true
  for arg in "$@"; do
    [ "$arg" = "--force" ] && force=1
  done

  shopt -s nullglob
  local configs=("$fe"/cypress.config.*)
  shopt -u nullglob
  [ "${#configs[@]}" -gt 0 ] || { echo "✗ no hay cypress.config.* en $fe" >&2; exit 1; }
  [ -f "$fe/cypress.config.ts" ] || {
    echo "✗ el kit solo soporta cypress.config.ts (hay $(basename "${configs[0]}"))" >&2; exit 1; }
  [ -f "$fe/cypress/support/e2e.ts" ] || {
    echo "✗ no encuentro cypress/support/e2e.ts en $fe" >&2; exit 1; }

  local state version
  state="$(demo_state "$fe")"
  version="$(tr -d '[:space:]' < "$KIT_SRC/VERSION")"
  case "$state" in
    ok)
      ensure_demo_import "$fe"
      echo "✓ kit v$version ya instalado y al día en $fe"
      return 0 ;;
    modified:*)
      if [ "$force" -eq 0 ]; then
        echo "✗ el kit instalado fue modificado a mano; no se copia nada:" >&2
        echo "${state#modified:}" | tr ' ' '\n' | sed 's/^/    /' >&2
        echo "  Revisa los cambios, o repite con --force para pisarlos." >&2
        exit 1
      fi ;;
  esac

  local src dst
  while IFS=$'\t' read -r src dst; do
    mkdir -p "$(dirname "$fe/$dst")"
    cp "$KIT_SRC/$src" "$fe/$dst"
  done < <(kit_pairs)
  : > "$fe/$DEMO_CHECKSUMS_REL"
  while IFS=$'\t' read -r src dst; do
    printf '%s  %s\n' "$(sha256_of "$fe/$dst")" "$dst" >> "$fe/$DEMO_CHECKSUMS_REL"
  done < <(kit_pairs)
  ensure_demo_import "$fe"
  echo "✓ kit v$version instalado en $fe"
}

cmd_demo_check() {
  local fe state installed version
  fe="$(frontend_dir "${1:-}")"
  state="$(demo_state "$fe")"
  version="$(tr -d '[:space:]' < "$KIT_SRC/VERSION")"
  case "$state" in
    missing)
      echo "✗ kit no instalado en $fe (plan-files.sh demo-install $fe)"; return 1 ;;
    modified:*)
      echo "✗ kit modificado a mano: ${state#modified:}"; return 1 ;;
    stale)
      installed="$(tr -d '[:space:]' < "$fe/$DEMO_VERSION_REL")"
      echo "✗ kit v$installed, la skill tiene v$version (plan-files.sh demo-install $fe)"; return 1 ;;
  esac
  if ! grep -qF "$DEMO_IMPORT_LINE" "$fe/cypress/support/e2e.ts"; then
    echo "✗ falta $DEMO_IMPORT_LINE en cypress/support/e2e.ts"; return 1
  fi
  echo "✓ kit v$version al día"
}

# Los videos no se commitean: si el spec vive en un repo, su carpeta videos/ tiene
# que estar ignorada. No edita el .gitignore: eso pasa por la revisión de la sección.
check_videos_ignored() {
  local spec="$1" top rel
  top=$(git -C "$spec" rev-parse --show-toplevel 2>/dev/null) || return 0
  if git -C "$top" check-ignore -q "$spec/videos/E2E-0.mp4"; then
    return 0
  fi
  rel="${spec#"$top"/}"
  echo "✗ $rel/videos/ no está ignorado por git (los videos no se commitean)." >&2
  echo "  Agrega esta línea al .gitignore de $top:  $rel/videos/   (o el patrón docs/specs/**/videos/)" >&2
  return 1
}

# Specs de Cypress de la columna «Spec» de la matriz de design.md (en cypress/e2e/).
specs_from_design() {
  local spec="$1" fe="$2" path
  [ -f "$spec/design.md" ] || return 0
  grep -oE '`[^`]+\.cy\.(ts|tsx|js|jsx)`' "$spec/design.md" | tr -d '`' | sort -u | while IFS= read -r path; do
    [ -f "$fe/cypress/e2e/$path" ] && printf 'cypress/e2e/%s\n' "$path"
  done
  return 0
}

cmd_videos() {
  local spec fe
  spec="$(spec_dir "${1:-}")"
  fe="$(frontend_dir "${2:-}")"
  shift 2
  command -v ffmpeg >/dev/null 2>&1 || { echo "✗ Falta ffmpeg" >&2; exit 1; }
  command -v node >/dev/null 2>&1 || { echo "✗ Falta node" >&2; exit 1; }

  check_videos_ignored "$spec" || exit 1
  cmd_demo_check "$fe" || exit 1

  local work="$spec/videos/.work" raw="$spec/videos/.work/raw"
  mkdir -p "$spec/videos"
  node "$DEMO_SCRIPT" captions "$spec" || exit 1
  rm -rf "${raw:?}"
  mkdir -p "$raw"

  local specs=()
  if [ "$#" -gt 0 ]; then
    specs=("$@")
  else
    while IFS= read -r path; do specs+=("$path"); done < <(specs_from_design "$spec" "$fe")
  fi
  [ "${#specs[@]}" -gt 0 ] || {
    echo "✗ No encontré specs de Cypress en la columna «Spec» de design.md; pásalos como argumentos." >&2
    exit 1; }

  local cypress_cmd extra=() joined cy_exit=0 cut_exit=0
  if [ -x "$fe/node_modules/.bin/cypress" ]; then
    cypress_cmd=("$fe/node_modules/.bin/cypress")
  else
    cypress_cmd=(npx --no-install cypress)
  fi
  read -r -a extra <<<"${DEMO_CYPRESS_ARGS:-}" || true
  joined="$(IFS=,; echo "${specs[*]}")"

  echo "▶ Cypress en modo demo: $joined"
  (cd "$fe" && env -u ELECTRON_RUN_AS_NODE "${cypress_cmd[@]}" run \
      --config-file cypress.demo.config.ts --no-runner-ui \
      ${extra[@]+"${extra[@]}"} \
      --env "demo=true,demoCaptions=$work/captions.json,demoOut=$raw" \
      --spec "$joined") || cy_exit=$?

  node "$DEMO_SCRIPT" cut "$spec" || cut_exit=$?

  if [ "$cy_exit" -ne 0 ]; then
    echo "✗ Cypress terminó con código $cy_exit: revisa los casos que fallaron" >&2
  fi
  [ "$cy_exit" -eq 0 ] && [ "$cut_exit" -eq 0 ]
}

cmd_videos_check() {
  local spec; spec="$(spec_dir "${1:-}")"
  node "$DEMO_SCRIPT" check "$spec"
}

case "${1:-}" in
  base)            cmd_base "${2:-}" ;;
  diagrams)        cmd_diagrams "${2:-}" ;;
  diagrams-check)  cmd_diagrams_check "${2:-}" ;;
  demo-install)    shift; cmd_demo_install "$@" ;;
  demo-check)      cmd_demo_check "${2:-}" ;;
  videos)          shift; cmd_videos "$@" ;;
  videos-check)    cmd_videos_check "${2:-}" ;;
  *)      echo "Uso: $0 base [raíz] | diagrams <spec> | diagrams-check <spec> | demo-install <frontend> [--force] | demo-check <frontend> | videos <spec> <frontend> [specs…] | videos-check <spec>" >&2; exit 1 ;;
esac
