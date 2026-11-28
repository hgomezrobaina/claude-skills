#!/usr/bin/env node
// Hoja comparativa: pone imágenes (PNG o SVG) lado a lado con su etiqueta, para presentar opciones.
// Uso: node contact-sheet.mjs --images "a.svg,b.svg,c.png" --labels "A · Geométrica,B · Orgánica,C" --out sheet.png
//        [--cols 3] [--cell 360] [--title "Logos — ronda 1"] [--background "#f4f4f4"] [--cell-background "#ffffff"]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, extname } from 'node:path';
import { parseArgs, fail } from './lib/args.mjs';
import { renderSvg } from './lib/render.mjs';

const { flags } = parseArgs(process.argv.slice(2));
if (!flags.images || !flags.out) {
  fail('uso: --images "a.svg,b.png" --labels "A,B" --out sheet.png [--cols 3] [--cell 360] [--title T]');
}
const images = flags.images.split(',').map((s) => s.trim());
const labels = (flags.labels ?? '').split(',').map((s) => s.trim());
const cols = Number(flags.cols ?? Math.min(images.length, 3));
const cell = Number(flags.cell ?? 360);
const gap = 24;
const pad = 40;
const labelH = 44;
const titleH = flags.title ? 56 : 0;
const rows = Math.ceil(images.length / cols);
const width = pad * 2 + cols * cell + (cols - 1) * gap;
const height = pad * 2 + titleH + rows * (cell + labelH) + (rows - 1) * gap;
const bg = flags.background ?? '#f2f2f0';
const cellBg = flags['cell-background'] ?? '#ffffff';

function dataUri(path) {
  const ext = extname(path).toLowerCase();
  const mime = ext === '.svg' ? 'image/svg+xml' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
  return `data:${mime};base64,${readFileSync(path).toString('base64')}`;
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const parts = [`<rect width="${width}" height="${height}" fill="${bg}"/>`];
if (flags.title) {
  parts.push(`<text x="${pad}" y="${pad + 26}" font-family="sans-serif" font-size="26" font-weight="700" fill="#111">${esc(flags.title)}</text>`);
}
images.forEach((img, i) => {
  const c = i % cols;
  const r = Math.floor(i / cols);
  const x = pad + c * (cell + gap);
  const y = pad + titleH + r * (cell + labelH + gap);
  const inner = cell * 0.8;
  parts.push(`<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="10" fill="${cellBg}"/>`);
  parts.push(`<image x="${x + (cell - inner) / 2}" y="${y + (cell - inner) / 2}" width="${inner}" height="${inner}" preserveAspectRatio="xMidYMid meet" href="${dataUri(img)}"/>`);
  parts.push(`<text x="${x}" y="${y + cell + 28}" font-family="sans-serif" font-size="17" fill="#222">${esc(labels[i] ?? img.split('/').pop())}</text>`);
});
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${parts.join('')}</svg>`;
mkdirSync(dirname(flags.out), { recursive: true });
writeFileSync(flags.out, renderSvg(svg));
console.log(`→ ${flags.out}`);
