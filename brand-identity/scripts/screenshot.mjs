#!/usr/bin/env node
// HTML/SVG → PNG o PDF con Chrome headless. Para mockups, moodboards, muestras tipográficas,
// el brand book (PDF) y logos en PDF vectorial para imprenta.
//
// Uso: node screenshot.mjs <in.html|in.svg|https://…> <out.png|out.pdf>
//        [--width 1440] [--height 900] [--scale 2] [--full] [--wait 500]
// PDF: usa el @page del documento si lo declara (preferCSSPageSize); si no, A4. Un .svg se imprime al tamaño del SVG.
import puppeteer from 'puppeteer-core';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs, fail } from './lib/args.mjs';
import { findChrome } from './lib/chrome.mjs';

const { positional, flags } = parseArgs(process.argv.slice(2));
const [input, output] = positional;
if (!input || !output) {
  fail('uso: node screenshot.mjs <in.html|in.svg|url> <out.png|out.pdf> [--width N --height N --scale 2 --full]');
}
const url = /^https?:\/\//.test(input) ? input : pathToFileURL(resolve(input)).href;
const width = Number(flags.width ?? 1440);
const height = Number(flags.height ?? 900);
const browser = await puppeteer.launch({ executablePath: findChrome(), headless: 'shell', args: ['--no-sandbox', '--font-render-hinting=none'] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: Number(flags.scale ?? 2) });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, Number(flags.wait ?? 300)));
  mkdirSync(dirname(resolve(output)), { recursive: true });
  if (extname(output).toLowerCase() === '.pdf') {
    if (extname(input).toLowerCase() === '.svg') {
      const svg = readFileSync(input, 'utf8');
      const vb = svg.match(/viewBox="([\d.\s-]+)"/);
      const [, , w, h] = vb ? vb[1].trim().split(/\s+/).map(Number) : [0, 0, width, height];
      await page.pdf({ path: output, width: `${w}px`, height: `${h}px`, printBackground: true, pageRanges: '1' });
    } else {
      await page.pdf({ path: output, printBackground: true, preferCSSPageSize: true, format: 'A4' });
    }
  } else {
    await page.screenshot({ path: output, fullPage: Boolean(flags.full) });
  }
  console.log(`→ ${output}`);
} finally {
  await browser.close();
}
