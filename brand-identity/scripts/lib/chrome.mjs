// Localiza un Chrome/Chromium headless ya instalado (puppeteer, playwright o el sistema).
// Prioridad: $BRAND_CHROME → ~/.config/mermaid/puppeteer.json → cachés de puppeteer/playwright → PATH.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

function newestDir(base) {
  if (!existsSync(base)) {
    return [];
  }
  return readdirSync(base).sort().reverse().map((d) => join(base, d));
}

function candidates() {
  const home = homedir();
  const list = [];
  if (process.env.BRAND_CHROME) {
    list.push(process.env.BRAND_CHROME);
  }
  const mermaid = join(home, '.config/mermaid/puppeteer.json');
  if (existsSync(mermaid)) {
    try {
      list.push(JSON.parse(readFileSync(mermaid, 'utf8')).executablePath);
    } catch {
      // config ilegible: se ignora
    }
  }
  for (const d of newestDir(join(home, '.cache/puppeteer/chrome-headless-shell'))) {
    list.push(join(d, 'chrome-headless-shell-linux64/chrome-headless-shell'));
  }
  for (const d of newestDir(join(home, '.cache/puppeteer/chrome'))) {
    list.push(join(d, 'chrome-linux64/chrome'));
  }
  for (const d of newestDir(join(home, '.cache/ms-playwright')).filter((p) => p.includes('chromium'))) {
    list.push(join(d, 'chrome-linux/chrome'), join(d, 'chrome-linux/headless_shell'), join(d, 'chrome-headless-shell-linux64/chrome-headless-shell'));
  }
  for (const bin of ['google-chrome', 'chromium', 'chromium-browser']) {
    try {
      list.push(execSync(`command -v ${bin}`, { encoding: 'utf8' }).trim());
    } catch {
      // no está en el PATH
    }
  }
  return list.filter(Boolean);
}

export function findChrome() {
  const found = candidates().find((p) => existsSync(p));
  if (!found) {
    throw new Error('No encontré Chrome headless. Instala uno con `npx @puppeteer/browsers install chrome-headless-shell@stable` o define BRAND_CHROME.');
  }
  return found;
}
