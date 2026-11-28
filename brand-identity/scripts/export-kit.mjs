#!/usr/bin/env node
// Exporta el kit completo de la marca a partir de brand.json (ver references/brand-json.md).
//
// Uso: node export-kit.mjs <ruta/brand.json> [--out <dir>] [--pdf]
//   --out  carpeta destino (por defecto <carpeta de brand.json>/exports)
//   --pdf  además, cada logo en PDF vectorial (imprenta) con Chrome headless
//
// Genera:
//   logo/<variante>.svg + <variante>-{256,512,1024,2048}.png
//   app-icon/ios/AppIcon-1024.png (opaco, sin alfa) + layers/ (fondo y frente por separado para Icon Composer)
//   app-icon/android/mipmap-*/ic_launcher_{foreground,background,monochrome}.png (108dp por densidad)
//                    mipmap-*/ic_launcher.png + ic_launcher_round.png (heredados) + mipmap-anydpi-v26/*.xml
//                    play-store-512.png
//   web/favicon.ico (16/32/48) · favicon.svg · apple-touch-icon.png (180, opaco)
//       icon-192.png · icon-512.png · icon-maskable-512.png · site.webmanifest · head.html
//   social/avatar-800.png (seguro para recorte circular)
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, join, resolve, basename } from 'node:path';
import { execFileSync } from 'node:child_process';
import { parseArgs, fail } from './lib/args.mjs';
import { renderSvg } from './lib/render.mjs';

const { positional, flags } = parseArgs(process.argv.slice(2));
const brandPath = positional[0] ?? fail('uso: node export-kit.mjs <brand.json> [--out dir] [--pdf]');
const root = dirname(resolve(brandPath));
const brand = JSON.parse(readFileSync(brandPath, 'utf8'));
const out = resolve(flags.out ?? join(root, 'exports'));
const fontsDir = brand.typography?.fontsDir ? join(root, brand.typography.fontsDir) : undefined;
const written = [];

const abs = (p) => join(root, p);
const read = (p) => readFileSync(abs(p), 'utf8');
const uri = (svg) => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
function save(rel, data) {
  const p = join(out, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, data);
  written.push(rel);
}
function png(svg, size, background) {
  return renderSvg(svg, { width: size, background, fontsDir });
}

// Compone un icono cuadrado: fondo (color o SVG) + glifo centrado ocupando `scale` del lado.
function iconSvg({ size, background, glyph, scale, clip }) {
  let bg = '';
  if (background) {
    bg = background.startsWith('#') ? `<rect width="${size}" height="${size}" fill="${background}"/>` : `<image width="${size}" height="${size}" preserveAspectRatio="xMidYMid slice" href="${uri(read(background))}"/>`;
  }
  const g = size * scale;
  const o = (size - g) / 2;
  const clipDef = clip === 'circle' ? `<clipPath id="k"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/></clipPath>` : clip === 'rounded' ? `<clipPath id="k"><rect width="${size}" height="${size}" rx="${size * 0.18}"/></clipPath>` : '';
  const glyphEl = glyph ? `<image x="${o}" y="${o}" width="${g}" height="${g}" preserveAspectRatio="xMidYMid meet" href="${uri(glyph)}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><defs>${clipDef}</defs><g${clip ? ' clip-path="url(#k)"' : ''}>${bg}${glyphEl}</g></svg>`;
}

// Quita el canal alfa (App Store y apple-touch-icon lo exigen opaco).
function flatten(rel, background) {
  const p = join(out, rel);
  execFileSync('python3', ['-I', '-c', 'import sys;from PIL import Image;im=Image.open(sys.argv[1]).convert("RGBA");bg=Image.new("RGB",im.size,sys.argv[2]);bg.paste(im,mask=im.split()[3]);bg.save(sys.argv[1])', p, background]);
}

// ICO con PNG embebidos (soportado desde Windows Vista y por todos los navegadores).
function ico(buffers) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(buffers.length, 4);
  const dir = Buffer.alloc(16 * buffers.length);
  let offset = 6 + dir.length;
  buffers.forEach(({ size, data }, i) => {
    const e = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, e);
    dir.writeUInt8(size >= 256 ? 0 : size, e + 1);
    dir.writeUInt8(0, e + 2);
    dir.writeUInt8(0, e + 3);
    dir.writeUInt16LE(1, e + 4);
    dir.writeUInt16LE(32, e + 6);
    dir.writeUInt32LE(data.length, e + 8);
    dir.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, dir, ...buffers.map((b) => b.data)]);
}

// 1 · Logos
const logos = brand.logo ?? {};
for (const [variant, rel] of Object.entries(logos)) {
  if (typeof rel !== 'string') {
    continue;
  }
  const svg = read(rel);
  save(`logo/${variant}.svg`, svg);
  for (const w of [256, 512, 1024, 2048]) {
    save(`logo/${variant}-${w}.png`, png(svg, w));
  }
}

// 2 · Icono de app
const ai = brand.appIcon;
if (ai) {
  const fg = read(ai.foreground);
  const bgSpec = ai.background;
  const bgColor = bgSpec.startsWith('#') ? bgSpec : '#ffffff';
  const scale = Number(ai.scale ?? 0.6);
  // iOS
  save('app-icon/ios/AppIcon-1024.png', png(iconSvg({ size: 1024, background: bgSpec, glyph: fg, scale }), 1024));
  flatten('app-icon/ios/AppIcon-1024.png', bgColor);
  save('app-icon/ios/layers/background.png', png(iconSvg({ size: 1024, background: bgSpec, glyph: null, scale }), 1024));
  save('app-icon/ios/layers/foreground.svg', iconSvg({ size: 1024, background: null, glyph: fg, scale }));
  save('app-icon/ios/layers/foreground.png', png(iconSvg({ size: 1024, background: null, glyph: fg, scale }), 1024));
  if (ai.monochrome) {
    save('app-icon/ios/layers/tinted.png', png(iconSvg({ size: 1024, background: null, glyph: read(ai.monochrome), scale }), 1024));
  }
  // Android adaptativo: 108dp por capa; el glifo dentro de la zona segura de 66dp.
  const aScale = Math.min(scale, 66 / 108);
  const densities = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
  for (const [d, m] of Object.entries(densities)) {
    const s = Math.round(108 * m);
    save(`app-icon/android/mipmap-${d}/ic_launcher_foreground.png`, png(iconSvg({ size: s, background: null, glyph: fg, scale: aScale }), s));
    save(`app-icon/android/mipmap-${d}/ic_launcher_background.png`, png(iconSvg({ size: s, background: bgSpec, glyph: null, scale }), s));
    if (ai.monochrome) {
      save(`app-icon/android/mipmap-${d}/ic_launcher_monochrome.png`, png(iconSvg({ size: s, background: null, glyph: read(ai.monochrome), scale: aScale }), s));
    }
    const legacy = Math.round(48 * m);
    save(`app-icon/android/mipmap-${d}/ic_launcher.png`, png(iconSvg({ size: legacy, background: bgSpec, glyph: fg, scale, clip: 'rounded' }), legacy));
    save(`app-icon/android/mipmap-${d}/ic_launcher_round.png`, png(iconSvg({ size: legacy, background: bgSpec, glyph: fg, scale, clip: 'circle' }), legacy));
  }
  const mono = ai.monochrome ? '\n    <monochrome android:drawable="@mipmap/ic_launcher_monochrome" />' : '';
  const xml = `<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n    <background android:drawable="@mipmap/ic_launcher_background" />\n    <foreground android:drawable="@mipmap/ic_launcher_foreground" />${mono}\n</adaptive-icon>\n`;
  save('app-icon/android/mipmap-anydpi-v26/ic_launcher.xml', xml);
  save('app-icon/android/mipmap-anydpi-v26/ic_launcher_round.xml', xml);
  save('app-icon/android/play-store-512.png', png(iconSvg({ size: 512, background: bgSpec, glyph: fg, scale }), 512));
  flatten('app-icon/android/play-store-512.png', bgColor);

  // 3 · Web
  const fav = logos.favicon ? read(logos.favicon) : logos.symbol ? read(logos.symbol) : fg;
  const icoBufs = [16, 32, 48].map((size) => ({ size, data: png(fav, size) }));
  save('web/favicon.ico', ico(icoBufs));
  save('web/favicon.svg', fav);
  save('web/apple-touch-icon.png', png(iconSvg({ size: 180, background: bgSpec, glyph: fg, scale }), 180));
  flatten('web/apple-touch-icon.png', bgColor);
  save('web/icon-192.png', png(iconSvg({ size: 192, background: bgSpec, glyph: fg, scale }), 192));
  save('web/icon-512.png', png(iconSvg({ size: 512, background: bgSpec, glyph: fg, scale }), 512));
  // Maskable: zona segura = círculo de radio 40% → el glifo cabe en ~0.56 del lado.
  save('web/icon-maskable-512.png', png(iconSvg({ size: 512, background: bgSpec, glyph: fg, scale: Math.min(scale, 0.56) }), 512));
  const manifest = {
    name: brand.name,
    short_name: brand.shortName ?? brand.name,
    icons: [
      { src: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { src: '/icon-512.png', type: 'image/png', sizes: '512x512' },
      { src: '/icon-maskable-512.png', type: 'image/png', sizes: '512x512', purpose: 'maskable' },
    ],
    theme_color: brand.web?.themeColor ?? bgColor,
    background_color: brand.web?.backgroundColor ?? '#ffffff',
    display: 'standalone',
  };
  save('web/site.webmanifest', `${JSON.stringify(manifest, null, 2)}\n`);
  save('web/head.html', `<link rel="icon" href="/favicon.ico" sizes="32x32">\n<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n<link rel="apple-touch-icon" href="/apple-touch-icon.png">\n<link rel="manifest" href="/site.webmanifest">\n<meta name="theme-color" content="${manifest.theme_color}">\n`);

  // 4 · Redes
  save('social/avatar-800.png', png(iconSvg({ size: 800, background: bgSpec, glyph: fg, scale: Math.min(scale, 0.6) }), 800));
}

// 5 · PDF vectorial para imprenta
if (flags.pdf) {
  const script = join(dirname(new URL(import.meta.url).pathname), 'screenshot.mjs');
  for (const variant of Object.keys(logos)) {
    const svgPath = join(out, `logo/${variant}.svg`);
    execFileSync('node', [script, svgPath, join(out, `logo/${variant}.pdf`)], { stdio: 'inherit' });
    written.push(`logo/${variant}.pdf`);
  }
}

console.log(`Kit exportado en ${out} (${written.length} archivos)`);
for (const w of written) {
  console.log(`  ${w}`);
}
