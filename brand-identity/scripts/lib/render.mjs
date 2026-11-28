// Render de SVG a PNG con resvg (determinista, sin navegador).
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

function fontFilesIn(dir) {
  if (!dir || !existsSync(dir)) {
    return [];
  }
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...fontFilesIn(full));
    } else if (['.ttf', '.otf'].includes(extname(entry.name).toLowerCase())) {
      out.push(full);
    }
  }
  return out;
}

// opts: { width?, height?, background?, fontsDir? }
export function renderSvg(svg, opts = {}) {
  const fitTo = opts.width ? { mode: 'width', value: Number(opts.width) } : opts.height ? { mode: 'height', value: Number(opts.height) } : { mode: 'original' };
  const resvg = new Resvg(svg, {
    fitTo,
    background: opts.background,
    font: { loadSystemFonts: true, fontFiles: fontFilesIn(opts.fontsDir) },
  });
  return resvg.render().asPng();
}

export function readSvg(path) {
  return readFileSync(path, 'utf8');
}
