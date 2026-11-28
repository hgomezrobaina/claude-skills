#!/usr/bin/env node
// Paletas de marca: escalas, contraste, daltonismo y hojas de muestra para presentar opciones.
//
//   node palette.mjs scale <hex> [--name brand] [--json out.json]      escala OKLCH 50–950 anclada a la semilla
//   node palette.mjs contrast <texto> <fondo>                          WCAG 2.x + APCA
//   node palette.mjs cvd <hex> [<hex>...]                              cómo lo ve alguien con daltonismo
//   node palette.mjs sheet --colors "#a,#b,#c" --labels "Primario,Acento,Fondo" --png out.png [--title "Ruta A"]
//        hoja visual: muestras, su escala, texto encima, y una fila por tipo de daltonismo
//   node palette.mjs check <brand.json>                                valida todos los pares declarados en colors.pairs
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { parseArgs, fail } from './lib/args.mjs';
import { scale, contrast, simulate, oklchCss, deltaE, naiveCmyk } from './lib/color.mjs';
import { renderSvg } from './lib/render.mjs';

const { positional, flags } = parseArgs(process.argv.slice(2));
const [cmd, ...rest] = positional;

function textOn(bg) {
  return contrast('#ffffff', bg).ratio >= contrast('#111111', bg).ratio ? '#ffffff' : '#111111';
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
}

function sheetSvg({ colors, labels, title }) {
  const sw = 220;
  const gap = 16;
  const pad = 32;
  const width = pad * 2 + colors.length * sw + (colors.length - 1) * gap;
  const rowsCvd = ['deuteranopia', 'protanopia', 'tritanopia'];
  const height = pad + 40 + 200 + 24 + 40 + 24 + rowsCvd.length * 56 + pad + 20;
  let y0 = pad + 40;
  const parts = [`<rect width="${width}" height="${height}" fill="#fafafa"/>`, `<text x="${pad}" y="${pad + 18}" font-family="sans-serif" font-size="20" font-weight="700" fill="#111">${esc(title ?? 'Paleta')}</text>`];
  colors.forEach((c, i) => {
    const x = pad + i * (sw + gap);
    const fg = textOn(c);
    const ct = contrast(fg, c);
    parts.push(`<rect x="${x}" y="${y0}" width="${sw}" height="200" rx="12" fill="${c}"/>`);
    parts.push(`<text x="${x + 16}" y="${y0 + 32}" font-family="sans-serif" font-size="16" font-weight="700" fill="${fg}">${esc(labels[i] ?? '')}</text>`);
    parts.push(`<text x="${x + 16}" y="${y0 + 56}" font-family="monospace" font-size="13" fill="${fg}">${c.toUpperCase()}</text>`);
    parts.push(`<text x="${x + 16}" y="${y0 + 76}" font-family="monospace" font-size="11" fill="${fg}">${esc(oklchCss(c))}</text>`);
    parts.push(`<text x="${x + 16}" y="${y0 + 180}" font-family="sans-serif" font-size="13" fill="${fg}">Aa texto ${ct.ratio}:1 · Lc ${Math.abs(ct.apcaLc)}</text>`);
    const sc = scale(c);
    const cell = sw / sc.length;
    sc.forEach((s, j) => {
      parts.push(`<rect x="${x + j * cell}" y="${y0 + 212}" width="${cell + 0.5}" height="40" fill="${s.hex}"/>`);
      if (s.anchor) {
        parts.push(`<rect x="${x + j * cell + 1}" y="${y0 + 213}" width="${cell - 2}" height="38" fill="none" stroke="${textOn(s.hex)}" stroke-width="2"/>`);
      }
    });
  });
  let y = y0 + 200 + 24 + 40 + 24;
  rowsCvd.forEach((kind) => {
    parts.push(`<text x="${pad}" y="${y - 6}" font-family="sans-serif" font-size="11" fill="#555">${kind}</text>`);
    colors.forEach((c, i) => {
      const x = pad + i * (sw + gap);
      parts.push(`<rect x="${x}" y="${y}" width="${sw}" height="34" rx="6" fill="${simulate(c)[kind]}"/>`);
    });
    y += 56;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${parts.join('')}</svg>`;
}

function confusable(colors) {
  const warnings = [];
  for (let i = 0; i < colors.length; i += 1) {
    for (let j = i + 1; j < colors.length; j += 1) {
      for (const kind of ['deuteranopia', 'protanopia', 'tritanopia']) {
        const d = deltaE(simulate(colors[i])[kind], simulate(colors[j])[kind]);
        if (d < 0.06) {
          warnings.push(`${colors[i]} y ${colors[j]} se confunden con ${kind} (ΔE OK ${d.toFixed(3)})`);
        }
      }
    }
  }
  return warnings;
}

if (cmd === 'scale') {
  const seed = rest[0] ?? fail('falta el color semilla');
  const name = flags.name ?? 'brand';
  const sc = scale(seed);
  console.log(`Escala "${name}" desde ${seed} (★ = semilla exacta)`);
  for (const s of sc) {
    const w = contrast('#ffffff', s.hex);
    const b = contrast('#111111', s.hex);
    console.log(`${String(s.step).padStart(4)} ${s.hex}${s.anchor ? ' ★' : '  '}  ${oklchCss(s.hex).padEnd(26)} blanco ${String(w.ratio).padStart(5)}:1  negro ${String(b.ratio).padStart(5)}:1`);
  }
  if (flags.json) {
    mkdirSync(dirname(flags.json), { recursive: true });
    writeFileSync(flags.json, JSON.stringify({ name, seed, steps: sc }, null, 2));
    console.log(`→ ${flags.json}`);
  }
} else if (cmd === 'contrast') {
  const [fg, bg] = rest;
  if (!fg || !bg) {
    fail('uso: contrast <texto> <fondo>');
  }
  const r = contrast(fg, bg);
  console.log(`${fg} sobre ${bg}: ${r.ratio}:1  AA texto ${r.aaText ? '✓' : '✗'}  AA grande/UI ${r.aaLarge ? '✓' : '✗'}  AAA ${r.aaaText ? '✓' : '✗'}  APCA Lc ${r.apcaLc}`);
  console.log('Guía APCA (orientativa): Lc 90 texto de lectura · 75 cuerpo mínimo · 60 texto grande/UI · 45 titulares · 30 elementos no textuales');
} else if (cmd === 'cvd') {
  for (const c of rest) {
    const s = simulate(c);
    console.log(`${c}  deuter ${s.deuteranopia}  prot ${s.protanopia}  trit ${s.tritanopia}  CMYK≈${naiveCmyk(c).join('/')} (sin ICC)`);
  }
  for (const w of confusable(rest)) {
    console.log(`⚠ ${w}`);
  }
} else if (cmd === 'sheet') {
  if (!flags.colors || !flags.png) {
    fail('uso: sheet --colors "#a,#b" --labels "A,B" --png out.png [--title T]');
  }
  const colors = flags.colors.split(',').map((s) => s.trim());
  const labels = (flags.labels ?? '').split(',').map((s) => s.trim());
  mkdirSync(dirname(flags.png), { recursive: true });
  writeFileSync(flags.png, renderSvg(sheetSvg({ colors, labels, title: flags.title })));
  console.log(`→ ${flags.png}`);
  for (const w of confusable(colors)) {
    console.log(`⚠ ${w}`);
  }
} else if (cmd === 'check') {
  const brand = JSON.parse(readFileSync(rest[0] ?? fail('falta brand.json'), 'utf8'));
  const palette = Object.fromEntries((brand.colors?.palette ?? []).map((c) => [c.id, c.hex]));
  let bad = 0;
  for (const p of brand.colors?.pairs ?? []) {
    const fg = palette[p.fg] ?? p.fg;
    const bg = palette[p.bg] ?? p.bg;
    const r = contrast(fg, bg);
    const need = p.use === 'large' || p.use === 'ui' ? r.aaLarge : r.aaText;
    if (!need) {
      bad += 1;
    }
    console.log(`${need ? '✓' : '✗'} ${p.fg} sobre ${p.bg} (${p.use ?? 'text'}): ${r.ratio}:1 · APCA Lc ${r.apcaLc}`);
  }
  for (const w of confusable(Object.values(palette))) {
    console.log(`⚠ ${w}`);
  }
  process.exit(bad ? 1 : 0);
} else {
  fail('comandos: scale | contrast | cvd | sheet | check');
}
