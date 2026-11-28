#!/usr/bin/env node
// Hoja de prueba de un símbolo/logo: lo que un senior mira antes de presentar.
//  · tamaños reales 16–128 px (y 16/32 ampliados ×4, píxel a píxel)
//  · sobre fondo claro, oscuro, de marca y gris medio
//  · recortes: avatar circular, squircle de iOS, círculo de Android con zona segura 66/108
//  · silueta (todo un color): si se vuelve una mancha, depende demasiado del color
//  · desenfoque ("prueba de entrecerrar los ojos"): ¿se reconoce la forma?
//  · el lockup (si se pasa) a anchos pequeños
//
// Uso: node proof.mjs --logo simbolo.svg --out proof.png [--lockup lockup.svg] [--brand "#1e2bfa"]
//        [--light "#ffffff"] [--dark "#111111"] [--title "Ruta A"]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { parseArgs, fail } from './lib/args.mjs';
import { renderSvg } from './lib/render.mjs';

const { flags } = parseArgs(process.argv.slice(2));
if (!flags.logo || !flags.out) {
  fail('uso: --logo simbolo.svg --out proof.png [--lockup l.svg] [--brand #hex] [--light #fff] [--dark #111]');
}
const logo = readFileSync(flags.logo, 'utf8');
const lockup = flags.lockup ? readFileSync(flags.lockup, 'utf8') : null;
const brand = flags.brand ?? '#3355ff';
const light = flags.light ?? '#ffffff';
const dark = flags.dark ?? '#111111';
const uri = (svg) => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
const pngUri = (buf) => `data:image/png;base64,${buf.toString('base64')}`;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

const W = 1400;
const pad = 40;
const parts = [];
let y = pad;
const label = (text, x, yy) => parts.push(`<text x="${x}" y="${yy}" font-family="sans-serif" font-size="14" fill="#555">${esc(text)}</text>`);
const section = (text) => {
  parts.push(`<text x="${pad}" y="${y + 18}" font-family="sans-serif" font-size="18" font-weight="700" fill="#111">${esc(text)}</text>`);
  y += 36;
};

if (flags.title) {
  parts.push(`<text x="${pad}" y="${y + 26}" font-family="sans-serif" font-size="28" font-weight="700" fill="#111">${esc(flags.title)} — prueba de símbolo</text>`);
  y += 56;
}

// 1 · Tamaños reales
section('Tamaños reales (px) y 16/32 ampliados ×4 sin suavizar');
let x = pad;
for (const s of [16, 24, 32, 48, 64, 128]) {
  const png = renderSvg(logo, { width: s });
  parts.push(`<image x="${x}" y="${y + (128 - s)}" width="${s}" height="${s}" href="${pngUri(png)}"/>`);
  label(`${s}`, x, y + 150);
  x += s + 40;
}
for (const s of [16, 32]) {
  const png = renderSvg(logo, { width: s });
  parts.push(`<rect x="${x - 4}" y="${y - 4 + 128 - s * 4}" width="${s * 4 + 8}" height="${s * 4 + 8}" fill="none" stroke="#ddd"/>`);
  parts.push(`<image x="${x}" y="${y + 128 - s * 4}" width="${s * 4}" height="${s * 4}" image-rendering="optimizeSpeed" href="${pngUri(png)}"/>`);
  label(`${s} ×4`, x, y + 150);
  x += s * 4 + 40;
}
y += 180;

// 2 · Fondos
section('Fondos');
const tile = 200;
x = pad;
for (const [name, bg] of [['claro', light], ['oscuro', dark], ['marca', brand], ['gris medio', '#8a8a8a']]) {
  parts.push(`<rect x="${x}" y="${y}" width="${tile}" height="${tile}" rx="12" fill="${bg}"/>`);
  parts.push(`<image x="${x + 40}" y="${y + 40}" width="${tile - 80}" height="${tile - 80}" href="${uri(logo)}"/>`);
  label(name, x, y + tile + 22);
  x += tile + 24;
}
y += tile + 50;

// 3 · Recortes y zonas seguras
section('Recortes: avatar circular · squircle iOS · Android (círculo = zona segura 66/108)');
x = pad;
parts.push(`<defs>
  <clipPath id="circ"><circle cx="${tile / 2}" cy="${tile / 2}" r="${tile / 2}"/></clipPath>
  <clipPath id="sq"><rect width="${tile}" height="${tile}" rx="${tile * 0.2237}"/></clipPath>
  <filter id="silD"><feFlood flood-color="${dark}"/><feComposite in2="SourceAlpha" operator="in"/></filter>
  <filter id="silL"><feFlood flood-color="${light}"/><feComposite in2="SourceAlpha" operator="in"/></filter>
  <filter id="blur"><feGaussianBlur stdDeviation="7"/></filter>
</defs>`);
const glyph = tile * 0.6;
const off = (tile - glyph) / 2;
parts.push(`<g transform="translate(${x} ${y})"><g clip-path="url(#circ)"><rect width="${tile}" height="${tile}" fill="${brand}"/><image x="${off}" y="${off}" width="${glyph}" height="${glyph}" href="${uri(logo)}"/></g></g>`);
label('avatar redes', x, y + tile + 22);
x += tile + 24;
parts.push(`<g transform="translate(${x} ${y})"><g clip-path="url(#sq)"><rect width="${tile}" height="${tile}" fill="${brand}"/><image x="${off}" y="${off}" width="${glyph}" height="${glyph}" href="${uri(logo)}"/></g></g>`);
label('iOS', x, y + tile + 22);
x += tile + 24;
const safe = tile * (66 / 108);
parts.push(`<g transform="translate(${x} ${y})"><g clip-path="url(#circ)"><rect width="${tile}" height="${tile}" fill="${brand}"/><image x="${(tile - safe) / 2}" y="${(tile - safe) / 2}" width="${safe}" height="${safe}" href="${uri(logo)}"/></g><circle cx="${tile / 2}" cy="${tile / 2}" r="${safe / 2}" fill="none" stroke="#ff2d55" stroke-dasharray="4 4"/></g>`);
label('Android adaptativo', x, y + tile + 22);
y += tile + 50;

// 4 · Silueta y desenfoque
section('Silueta (un solo color) y desenfoque — ¿se reconoce?');
x = pad;
parts.push(`<rect x="${x}" y="${y}" width="${tile}" height="${tile}" rx="12" fill="${light}" stroke="#ddd"/><image x="${x + 40}" y="${y + 40}" width="${tile - 80}" height="${tile - 80}" filter="url(#silD)" href="${uri(logo)}"/>`);
label('silueta oscura', x, y + tile + 22);
x += tile + 24;
parts.push(`<rect x="${x}" y="${y}" width="${tile}" height="${tile}" rx="12" fill="${dark}"/><image x="${x + 40}" y="${y + 40}" width="${tile - 80}" height="${tile - 80}" filter="url(#silL)" href="${uri(logo)}"/>`);
label('silueta clara', x, y + tile + 22);
x += tile + 24;
parts.push(`<rect x="${x}" y="${y}" width="${tile}" height="${tile}" rx="12" fill="${light}" stroke="#ddd"/><image x="${x + 40}" y="${y + 40}" width="${tile - 80}" height="${tile - 80}" filter="url(#blur)" href="${uri(logo)}"/>`);
label('entrecerrar los ojos', x, y + tile + 22);
y += tile + 50;

// 5 · Lockup a anchos pequeños
if (lockup) {
  section('Lockup a anchos reales (px)');
  x = pad;
  for (const w of [80, 120, 200, 320]) {
    const png = renderSvg(lockup, { width: w });
    parts.push(`<image x="${x}" y="${y}" width="${w}" height="80" preserveAspectRatio="xMinYMid meet" href="${pngUri(png)}"/>`);
    label(`${w}px`, x, y + 100);
    x += w + 48;
  }
  y += 130;
  const tw = 420;
  x = pad;
  for (const [name, bg, filter] of [['claro', light, ''], ['oscuro (silueta clara)', dark, ' filter="url(#silL)"']]) {
    parts.push(`<rect x="${x}" y="${y}" width="${tw}" height="140" rx="12" fill="${bg}" stroke="#ddd"/><image x="${x + 40}" y="${y + 30}" width="${tw - 80}" height="80"${filter} href="${uri(lockup)}"/>`);
    label(name, x, y + 162);
    x += tw + 24;
  }
  y += 190;
}

const H = y + pad;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#f5f5f3"/>${parts.join('')}</svg>`;
mkdirSync(dirname(flags.out), { recursive: true });
writeFileSync(flags.out, renderSvg(svg));
console.log(`→ ${flags.out}`);
