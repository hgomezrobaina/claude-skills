// Utilidades de color: escalas OKLCH, contraste WCAG 2.x y APCA, simulación de daltonismo.
import { converter, formatHex, toGamut, wcagContrast, filterDeficiencyDeuter, filterDeficiencyProt, filterDeficiencyTrit } from 'culori';

const toOklch = converter('oklch');
const toRgb = converter('rgb');
const inGamut = toGamut('rgb', 'oklch');

export const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
// Luminosidad OKLCH objetivo por paso (claro → oscuro). Punto de partida, no dogma.
const TARGET_L = [0.975, 0.94, 0.885, 0.805, 0.715, 0.625, 0.535, 0.455, 0.38, 0.305, 0.235];

export function hex(color) {
  return formatHex(color);
}

export function oklchOf(hexValue) {
  const c = toOklch(hexValue);
  return { l: c.l, c: c.c ?? 0, h: c.h ?? 0 };
}

export function oklchCss(hexValue) {
  const { l, c, h } = oklchOf(hexValue);
  return `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(3)} ${h.toFixed(1)})`;
}

// Escala de 11 pasos anclada al color semilla: la semilla queda EXACTA en el paso cuya L objetivo es más cercana.
export function scale(seedHex) {
  const seed = oklchOf(seedHex);
  let anchor = 0;
  TARGET_L.forEach((l, i) => {
    if (Math.abs(l - seed.l) < Math.abs(TARGET_L[anchor] - seed.l)) {
      anchor = i;
    }
  });
  const out = TARGET_L.map((l, i) => {
    if (i === anchor) {
      return { step: STEPS[i], hex: formatHex(seedHex), anchor: true };
    }
    // El croma baja en los extremos para que los claros no se vean chillones ni los oscuros sucios.
    const t = Math.abs(l - seed.l) / 0.75;
    const c = seed.c * Math.max(0.12, 1 - t * t * 1.4);
    const color = inGamut({ mode: 'oklch', l, c, h: seed.h });
    return { step: STEPS[i], hex: formatHex(color), anchor: false };
  });
  return out;
}

// APCA-W3 0.0.98G-4g. Devuelve Lc con signo (positivo: texto oscuro sobre claro).
function apcaY(hexValue) {
  const { r, g, b } = toRgb(hexValue);
  const lin = (v) => Math.pow(Math.max(0, v), 2.4);
  let y = 0.2126729 * lin(r) + 0.7151522 * lin(g) + 0.072175 * lin(b);
  if (y < 0.022) {
    y += Math.pow(0.022 - y, 1.414);
  }
  return y;
}

export function apca(textHex, bgHex) {
  const yt = apcaY(textHex);
  const yb = apcaY(bgHex);
  if (Math.abs(yb - yt) < 0.0005) {
    return 0;
  }
  if (yb > yt) {
    const s = (Math.pow(yb, 0.56) - Math.pow(yt, 0.57)) * 1.14;
    return s < 0.1 ? 0 : (s - 0.027) * 100;
  }
  const s = (Math.pow(yb, 0.65) - Math.pow(yt, 0.62)) * 1.14;
  return s > -0.1 ? 0 : (s + 0.027) * 100;
}

export function contrast(fg, bg) {
  const ratio = wcagContrast(fg, bg);
  const lc = apca(fg, bg);
  return {
    ratio: Number(ratio.toFixed(2)),
    aaText: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaaText: ratio >= 7,
    uiComponent: ratio >= 3,
    apcaLc: Number(lc.toFixed(1)),
  };
}

const CVD = {
  deuteranopia: filterDeficiencyDeuter(1),
  protanopia: filterDeficiencyProt(1),
  tritanopia: filterDeficiencyTrit(1),
};

export function simulate(hexValue) {
  const out = {};
  for (const [name, fn] of Object.entries(CVD)) {
    out[name] = formatHex(fn(hexValue));
  }
  return out;
}

// Distancia perceptual simple en OKLab (ΔE OK). < 0.05 ≈ difícil de distinguir lado a lado.
export function deltaE(a, b) {
  const la = converter('oklab')(a);
  const lb = converter('oklab')(b);
  return Math.hypot(la.l - lb.l, la.a - lb.a, la.b - lb.b);
}

// Aproximación CMYK SIN perfil ICC: solo orientativa. Para imprenta usar scripts/cmyk.py con un perfil.
export function naiveCmyk(hexValue) {
  const { r, g, b } = toRgb(hexValue);
  const k = 1 - Math.max(r, g, b);
  if (k >= 1) {
    return [0, 0, 0, 100];
  }
  const f = (v) => Math.round(((1 - v - k) / (1 - k)) * 100);
  return [f(r), f(g), f(b), Math.round(k * 100)];
}
