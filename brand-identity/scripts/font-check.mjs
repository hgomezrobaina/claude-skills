#!/usr/bin/env node
// ¿Sirve esta fuente para la marca? Cobertura de caracteres por idioma, métricas y rasgos OpenType.
// Uso: node font-check.mjs <fuente.ttf|otf> [<otra>...] [--chars "€₡"]
import opentype from 'opentype.js';
import { parseArgs, fail } from './lib/args.mjs';

const { positional, flags } = parseArgs(process.argv.slice(2));
if (positional.length === 0) {
  fail('uso: node font-check.mjs <fuente.ttf> [...] [--chars "extra"]');
}
const SETS = {
  'español': 'ÁÉÍÓÚÜÑáéíóúüñ¿¡«»',
  'portugués': 'ÃÕÇÂÊÔÀãõçâêôà',
  'francés/catalán': 'ÀÈÉÊËÎÏÔÙÛÇŒàèéêëîïôùûçœl·l',
  'alemán': 'ÄÖÜäöüß',
  'símbolos': '€$£¥%&@#©®™°·–—…“”‘’',
  'cifras': '0123456789',
};
const FEATURES = { kern: 'kerning', liga: 'ligaduras', tnum: 'cifras tabulares', lnum: 'cifras de caja alta', onum: 'cifras de caja baja', ss01: 'conjunto estilístico 1', case: 'formas para mayúsculas', zero: 'cero con barra', frac: 'fracciones' };
for (const file of positional) {
  const font = opentype.loadSync(file);
  const name = font.names.fullName?.en ?? file;
  console.log(`\n${name}  (${font.numGlyphs} glifos, ${font.unitsPerEm} upm)`);
  const sets = { ...SETS };
  if (flags.chars) {
    sets.extra = flags.chars;
  }
  for (const [lang, chars] of Object.entries(sets)) {
    const missing = Array.from(chars).filter((ch) => font.charToGlyphIndex(ch) === 0);
    console.log(`  ${missing.length ? '✗' : '✓'} ${lang}${missing.length ? `: faltan ${missing.join(' ')}` : ''}`);
  }
  const gsub = (font.tables.gsub?.features ?? []).map((f) => f.tag);
  const gpos = (font.tables.gpos?.features ?? []).map((f) => f.tag);
  const all = new Set([...gsub, ...gpos]);
  console.log(`  OpenType: ${Object.entries(FEATURES).filter(([t]) => all.has(t)).map(([, d]) => d).join(', ') || 'ninguno de los habituales'}`);
  const os2 = font.tables.os2 ?? {};
  if (os2.sxHeight && os2.sCapHeight) {
    console.log(`  x-height/cap-height: ${(os2.sxHeight / os2.sCapHeight).toFixed(2)} (más alto = más legible en tamaños pequeños)`);
  }
  if (font.tables.fvar) {
    console.log(`  Variable: ${font.tables.fvar.axes.map((a) => `${a.tag} ${a.minValue}–${a.maxValue}`).join(', ')}`);
  }
  const lic = font.names.license?.en ?? font.names.licenseURL?.en;
  console.log(`  Licencia declarada: ${lic ? lic.slice(0, 120) : 'no declarada en el archivo (verificar en la fuente de descarga)'}`);
}
