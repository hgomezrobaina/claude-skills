#!/usr/bin/env node
// SVG → PNG.
// Uso: node render-svg.mjs <in.svg> <out.png> [--width 512 | --height 512] [--background "#fff"] [--fonts <dir>]
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { parseArgs, fail } from './lib/args.mjs';
import { renderSvg, readSvg } from './lib/render.mjs';

const { positional, flags } = parseArgs(process.argv.slice(2));
const [input, output] = positional;
if (!input || !output) {
  fail('uso: node render-svg.mjs <in.svg> <out.png> [--width N] [--background "#hex"] [--fonts dir]');
}
const png = renderSvg(readSvg(input), { width: flags.width, height: flags.height, background: flags.background, fontsDir: flags.fonts });
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, png);
console.log(`→ ${output}`);
