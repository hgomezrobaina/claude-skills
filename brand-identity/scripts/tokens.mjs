#!/usr/bin/env node
// brand.json → tokens para el código y para el resto de skills.
//   tokens/tokens.json      Design Tokens (DTCG 2025.10: color como objeto {colorSpace, components, hex})
//   tokens/tokens.css       variables CSS (:root + modo oscuro si brand.colors.dark existe)
//   tokens/tailwind.css     bloque @theme de Tailwind v4
// Uso: node tokens.mjs <brand.json> [--out <dir>]   (por defecto <carpeta de brand.json>/tokens)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { converter } from 'culori';
import { parseArgs, fail } from './lib/args.mjs';
import { scale, oklchCss } from './lib/color.mjs';

const { positional, flags } = parseArgs(process.argv.slice(2));
const brandPath = positional[0] ?? fail('uso: node tokens.mjs <brand.json> [--out dir]');
const brand = JSON.parse(readFileSync(brandPath, 'utf8'));
const out = resolve(flags.out ?? join(dirname(resolve(brandPath)), 'tokens'));
mkdirSync(out, { recursive: true });
const toRgb = converter('rgb');

const colorToken = (hex, description) => {
  const { r, g, b } = toRgb(hex);
  const t = { $type: 'color', $value: { colorSpace: 'srgb', components: [r, g, b].map((v) => Number(v.toFixed(4))), hex: hex.toLowerCase() } };
  if (description) {
    t.$description = description;
  }
  return t;
};

const tokens = { color: {}, font: {}, size: {}, radius: {}, space: {}, duration: {}, easing: {} };
const css = [];
const tw = [];
for (const c of brand.colors?.palette ?? []) {
  tokens.color[c.id] = colorToken(c.hex, [c.name, c.role].filter(Boolean).join(' · '));
  css.push(`  --color-${c.id}: ${c.hex}; /* ${oklchCss(c.hex)} */`);
  tw.push(`  --color-${c.id}: ${oklchCss(c.hex)};`);
  if (c.scale) {
    tokens.color[`${c.id}-scale`] = {};
    for (const s of scale(c.hex)) {
      tokens.color[`${c.id}-scale`][s.step] = colorToken(s.hex);
      css.push(`  --color-${c.id}-${s.step}: ${s.hex};`);
      tw.push(`  --color-${c.id}-${s.step}: ${oklchCss(s.hex)};`);
    }
  }
}
for (const f of brand.typography?.families ?? []) {
  tokens.font[f.id] = { $type: 'fontFamily', $value: [f.family, ...(f.fallback ?? ['sans-serif'])] };
  const stack = [f.family, ...(f.fallback ?? ['sans-serif'])].map((s) => (s.includes(' ') ? `"${s}"` : s)).join(', ');
  css.push(`  --font-${f.id}: ${stack};`);
  tw.push(`  --font-${f.id}: ${stack};`);
}
for (const [k, px] of Object.entries(brand.typography?.scale ?? {})) {
  tokens.size[k] = { $type: 'dimension', $value: { value: px / 16, unit: 'rem' } };
  css.push(`  --text-${k}: ${px / 16}rem;`);
  tw.push(`  --text-${k}: ${px / 16}rem;`);
}
for (const [k, px] of Object.entries(brand.radii ?? {})) {
  tokens.radius[k] = { $type: 'dimension', $value: { value: px, unit: 'px' } };
  css.push(`  --radius-${k}: ${px}px;`);
  tw.push(`  --radius-${k}: ${px}px;`);
}
for (const [k, px] of Object.entries(brand.spacing ?? {})) {
  tokens.space[k] = { $type: 'dimension', $value: { value: px, unit: 'px' } };
  css.push(`  --space-${k}: ${px}px;`);
}
for (const [k, ms] of Object.entries(brand.motion?.durations ?? {})) {
  tokens.duration[k] = { $type: 'duration', $value: { value: ms, unit: 'ms' } };
  css.push(`  --duration-${k}: ${ms}ms;`);
}
for (const [k, bez] of Object.entries(brand.motion?.easing ?? {})) {
  tokens.easing[k] = { $type: 'cubicBezier', $value: bez };
  css.push(`  --ease-${k}: cubic-bezier(${bez.join(', ')});`);
  tw.push(`  --ease-${k}: cubic-bezier(${bez.join(', ')});`);
}
for (const k of Object.keys(tokens)) {
  if (Object.keys(tokens[k]).length === 0) {
    delete tokens[k];
  }
}

let dark = '';
if (brand.colors?.dark) {
  const palette = Object.fromEntries((brand.colors.palette ?? []).map((c) => [c.id, c.hex]));
  const lines = Object.entries(brand.colors.dark).map(([id, v]) => `    --color-${id}: ${palette[v] ?? v};`);
  dark = `\n@media (prefers-color-scheme: dark) {\n  :root {\n${lines.join('\n')}\n  }\n}\n`;
}
writeFileSync(join(out, 'tokens.json'), `${JSON.stringify(tokens, null, 2)}\n`);
writeFileSync(join(out, 'tokens.css'), `/* ${brand.name} — generado por brand-identity/scripts/tokens.mjs desde brand.json. No editar a mano. */\n:root {\n${css.join('\n')}\n}\n${dark}`);
writeFileSync(join(out, 'tailwind.css'), `/* ${brand.name} — Tailwind v4. Generado desde brand.json. */\n@theme {\n${tw.join('\n')}\n}\n`);
console.log(`→ ${join(out, 'tokens.json')}\n→ ${join(out, 'tokens.css')}\n→ ${join(out, 'tailwind.css')}`);
