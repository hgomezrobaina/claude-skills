#!/usr/bin/env node
// Convierte un texto en curvas (path) con una fuente real, para wordmarks.
// El SVG final de un logo NUNCA depende de una fuente instalada.
//
// Uso:
//   node outline-text.mjs --font <archivo.ttf|otf> --text "marca" --out wordmark.svg
//     [--size 200]            tamaño en unidades del SVG
//     [--tracking 0]          espaciado uniforme, en milésimas de em (como en Figma/Illustrator: -20 = -2%)
//     [--kern "a,r:-12;r,c:8"] ajustes manuales por par, en milésimas de em (se SUMAN al kerning de la fuente)
//     [--fill "#111"]         color
//     [--no-font-kerning]     ignora la tabla de kerning de la fuente
//     [--pad 0]               margen alrededor, en unidades
//
// Escribe un SVG con viewBox ajustado a la caja real de la tinta y una línea por consola con las métricas
// (ancho, alto, altura de mayúsculas y x-height) para construir la retícula.
import opentype from 'opentype.js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { parseArgs, fail } from './lib/args.mjs';

const { flags } = parseArgs(process.argv.slice(2));
if (!flags.font || !flags.text || !flags.out) {
  fail('uso: node outline-text.mjs --font f.ttf --text "marca" --out w.svg [--size 200] [--tracking 0] [--kern "a,b:-10"]');
}
const font = opentype.loadSync(flags.font);
const size = Number(flags.size ?? 200);
const tracking = Number(flags.tracking ?? 0);
const pad = Number(flags.pad ?? 0);
const fill = flags.fill ?? '#111111';
const useFontKerning = !flags['no-font-kerning'];
const manual = new Map();
if (typeof flags.kern === 'string') {
  for (const pair of flags.kern.split(';').filter(Boolean)) {
    const [chars, value] = pair.split(':');
    const [a, b] = chars.split(',');
    manual.set(`${a}${b}`, Number(value));
  }
}

const scale = size / font.unitsPerEm;
const glyphs = font.stringToGlyphs(flags.text);
const chars = Array.from(flags.text);
let x = 0;
const paths = [];
glyphs.forEach((glyph, i) => {
  const p = glyph.getPath(x, 0, size);
  paths.push(p.toPathData(2));
  if (i < glyphs.length - 1) {
    let advance = glyph.advanceWidth * scale;
    if (useFontKerning) {
      advance += font.getKerningValue(glyph, glyphs[i + 1]) * scale;
    }
    advance += (tracking / 1000) * size;
    advance += ((manual.get(`${chars[i]}${chars[i + 1]}`) ?? 0) / 1000) * size;
    x += advance;
  }
});

// Caja de tinta real
const full = new opentype.Path();
x = 0;
glyphs.forEach((glyph, i) => {
  full.extend(glyph.getPath(x, 0, size));
  if (i < glyphs.length - 1) {
    let advance = glyph.advanceWidth * scale;
    if (useFontKerning) {
      advance += font.getKerningValue(glyph, glyphs[i + 1]) * scale;
    }
    advance += (tracking / 1000) * size + ((manual.get(`${chars[i]}${chars[i + 1]}`) ?? 0) / 1000) * size;
    x += advance;
  }
});
const box = full.getBoundingBox();
const vbX = box.x1 - pad;
const vbY = box.y1 - pad;
const w = box.x2 - box.x1 + pad * 2;
const h = box.y2 - box.y1 + pad * 2;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX.toFixed(2)} ${vbY.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}">\n  <path fill="${fill}" d="${paths.join(' ')}"/>\n</svg>\n`;
mkdirSync(dirname(flags.out), { recursive: true });
writeFileSync(flags.out, svg);
const os2 = font.tables.os2 ?? {};
const capH = os2.sCapHeight ? (os2.sCapHeight * scale).toFixed(1) : 'n/d';
const xH = os2.sxHeight ? (os2.sxHeight * scale).toFixed(1) : 'n/d';
console.log(`→ ${flags.out}  ancho=${w.toFixed(1)} alto=${h.toFixed(1)} capHeight=${capH} xHeight=${xH} (unidades del SVG, size=${size})`);
