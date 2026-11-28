#!/usr/bin/env node
// ADN visual de un sitio (competidor o referencia): captura, colores dominantes, fuentes reales,
// favicon/apple-touch/og:image, título y descripción. Para la auditoría de competencia.
//
// Uso: node site-dna.mjs <url> --out <carpeta> [--width 1440] [--mobile]
// Escribe <carpeta>/<dominio>/{home.png, dna.json} y un resumen por consola.
// Los colores salen del CSS calculado de los elementos visibles, ponderados por área: son el color
// que se VE, no el que declara una hoja de estilos sin usar.
import puppeteer from 'puppeteer-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs, fail } from './lib/args.mjs';
import { findChrome } from './lib/chrome.mjs';

const { positional, flags } = parseArgs(process.argv.slice(2));
const url = positional[0] ?? fail('uso: node site-dna.mjs <url> --out <carpeta> [--mobile]');
if (!flags.out) {
  fail('falta --out');
}
const host = new URL(url).hostname.replace(/^www\./, '');
const dir = join(flags.out, host);
mkdirSync(dir, { recursive: true });
const mobile = Boolean(flags.mobile);
const browser = await puppeteer.launch({ executablePath: findChrome(), headless: 'shell', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36');
  await page.setViewport(mobile ? { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true } : { width: Number(flags.width ?? 1440), height: 900, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: join(dir, mobile ? 'home-mobile.png' : 'home.png') });
  const dna = await page.evaluate(() => {
    const toHex = (c) => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) {
        return null;
      }
      const [r, g, b, a = '1'] = m[1].split(/[ ,/]+/).filter(Boolean);
      if (Number(a) < 0.5) {
        return null;
      }
      return `#${[r, g, b].map((v) => Math.round(Number(v)).toString(16).padStart(2, '0')).join('')}`;
    };
    const colors = {};
    const textColors = {};
    const fonts = {};
    const vh = window.innerHeight * 3;
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2 || r.top > vh) {
        continue;
      }
      const s = getComputedStyle(el);
      if (s.visibility === 'hidden' || s.display === 'none' || Number(s.opacity) < 0.3) {
        continue;
      }
      const area = Math.min(r.width * r.height, window.innerWidth * window.innerHeight);
      const bg = toHex(s.backgroundColor);
      if (bg) {
        colors[bg] = (colors[bg] ?? 0) + area;
      }
      const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
      if (hasText) {
        const fg = toHex(s.color);
        const weight = (el.textContent.trim().length || 1) * parseFloat(s.fontSize);
        if (fg) {
          textColors[fg] = (textColors[fg] ?? 0) + weight;
        }
        const fam = s.fontFamily.split(',')[0].replace(/["']/g, '').trim();
        const key = `${fam} ${s.fontWeight}`;
        fonts[key] = (fonts[key] ?? 0) + weight;
      }
    }
    const top = (o, n) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => ({ value: k, share: v }));
    const norm = (list) => {
      const total = list.reduce((s, x) => s + x.share, 0) || 1;
      return list.map((x) => ({ value: x.value, share: Number(((x.share / total) * 100).toFixed(1)) }));
    };
    const meta = (sel) => document.querySelector(sel)?.getAttribute('content') ?? document.querySelector(sel)?.getAttribute('href') ?? null;
    const abs = (h) => (h ? new URL(h, location.href).href : null);
    const logoImg = [...document.querySelectorAll('header img, header svg, a[href="/"] img, a[href="/"] svg, [class*="logo" i] img, [class*="logo" i] svg, img[alt*="logo" i]')][0];
    return {
      url: location.href,
      title: document.title,
      description: meta('meta[name="description"]'),
      ogImage: abs(meta('meta[property="og:image"]')),
      themeColor: meta('meta[name="theme-color"]'),
      favicon: abs(meta('link[rel~="icon"]')),
      appleTouchIcon: abs(meta('link[rel="apple-touch-icon"]')),
      logo: logoImg ? (logoImg.tagName.toLowerCase() === 'svg' ? { type: 'inline-svg', svg: logoImg.outerHTML.slice(0, 20000) } : { type: 'img', src: abs(logoImg.getAttribute('src')) }) : null,
      backgroundColors: norm(top(colors, 8)),
      textColors: norm(top(textColors, 6)),
      fonts: norm(top(fonts, 8)),
      headline: document.querySelector('h1')?.textContent.trim().replace(/\s+/g, ' ').slice(0, 200) ?? null,
    };
  });
  writeFileSync(join(dir, 'dna.json'), `${JSON.stringify(dna, null, 2)}\n`);
  if (dna.logo?.type === 'inline-svg') {
    writeFileSync(join(dir, 'logo.svg'), dna.logo.svg);
  }
  console.log(`${host}: "${dna.title}"`);
  console.log(`  H1: ${dna.headline}`);
  console.log(`  Fondos: ${dna.backgroundColors.map((c) => `${c.value} ${c.share}%`).join(' · ')}`);
  console.log(`  Texto:  ${dna.textColors.map((c) => `${c.value} ${c.share}%`).join(' · ')}`);
  console.log(`  Fuentes: ${dna.fonts.map((f) => `${f.value} ${f.share}%`).join(' · ')}`);
  console.log(`  Logo: ${dna.logo ? (dna.logo.type === 'img' ? dna.logo.src : 'SVG inline → logo.svg') : 'no detectado (mirar la captura)'}`);
  console.log(`→ ${dir}`);
} finally {
  await browser.close();
}
