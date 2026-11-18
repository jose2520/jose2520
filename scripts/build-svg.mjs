// Genera jose-banner(.light).svg y jose-footer(.light).svg en la raíz del repo.
// - jose-banner.svg y jose-footer.svg cambian automáticamente entre modo oscuro
//   (rojo carmesí) y modo claro (lila) según prefers-color-scheme del navegador.
// - jose-banner-light.svg y jose-footer-light.svg fijan el tema claro (lila)
//   para el selector <picture> de GitHub.
// Las fuentes se embeben como subconjunto WOFF2 en base64.
//
//   cd scripts && npm install && npm run build

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as fontkit from 'fontkit';
import subsetFont from 'subset-font';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const fontFile = (pkg, file) => path.join(here, 'node_modules/@fontsource', pkg, 'files', file);

// ---------------------------------------------------------------------------
// Contenido (edita aquí)
// ---------------------------------------------------------------------------
const C = {
  handle: 'jose2520',
  name: 'Jose Del Carmen Díaz',
  fullName: 'Jose Del Carmen Díaz Díaz',
  role: 'Desarrollador Full-Stack y Mobile · Diseñador UI/UX',
  pitch: 'Barranquilla, Colombia. Del prototipo en Figma a producción.',
  status: 'Disponible para proyectos',
  artboard: 'portafolio.fig',
  pathCode1: '<path d="M24 114 C49 18 122 70…"',
  pathCode2: (accent) => `stroke="${accent}" fill="none"/>`,
  groups: [
    { row: 0, label: 'web & mobile', items: ['React', 'Next.js', 'React Native', 'TypeScript'] },
    { row: 0, label: 'backend & datos', items: ['.NET', 'Node.js', 'Python', 'SQL'] },
    { row: 1, label: 'diseño & entorno', items: ['Figma', 'Photoshop', 'Illustrator', 'Docker', 'Azure', 'Postman'] },
  ],
  motto: 'Algoritmo y diseño en perfecta simetría.',
  site: 'jose2520.github.io',
};

// ---------------------------------------------------------------------------
// Temas (oscuro en rojo carmesí · claro en lila)
// ---------------------------------------------------------------------------
const PALETTES = {
  dark: {
    bg1: '#0E080B', bg2: '#060609',
    dot: '#FFFFFF', dotO: 0.07,
    ink: '#F5F2F0', muted: '#A39FA8', faint: '#5C5762',
    accent: '#FF3349', accentSoft: '#FF8C98', glowO: 0.24,
    chipFill: '#FFFFFF', chipFillO: 0.045, chipStroke: '#FFFFFF', chipStrokeO: 0.14,
    board: '#141117', boardStroke: '#FFFFFF', boardStrokeO: 0.12, boardStrokeStrongO: 0.16,
    edge: '#FFFFFF', edgeO: 0.08,
    termStrokeO: 0.45, tickerO: 0.52, shadowO: 0.55,
  },
  light: {
    bg1: '#FAF7FF', bg2: '#F2ECFD',
    dot: '#231934', dotO: 0.09,
    ink: '#171222', muted: '#5E546E', faint: '#A79EB8',
    accent: '#8B5CF6', accentSoft: '#7C3AED', glowO: 0.16,
    chipFill: '#FFFFFF', chipFillO: 0.85, chipStroke: '#171222', chipStrokeO: 0.14,
    board: '#FFFFFF', boardStroke: '#171222', boardStrokeO: 0.12, boardStrokeStrongO: 0.17,
    edge: '#171222', edgeO: 0.10,
    termStrokeO: 0.38, tickerO: 0.60, shadowO: 0.12,
  },
};

const VAR_KEYS = Object.keys(PALETTES.dark);
const varsCss = (p) => VAR_KEYS.map((k) => `--${k}:${p[k]};`).join('');

// Referencias a variables CSS para usar en atributos SVG
const V = Object.fromEntries(VAR_KEYS.map((k) => [k, `var(--${k})`]));

const VARIANTS = [
  { suffix: '', adaptive: true, base: PALETTES.dark, light: PALETTES.light },
  { suffix: '-light', adaptive: false, base: PALETTES.light, light: PALETTES.light },
];

// ---------------------------------------------------------------------------
// Tipografía
// ---------------------------------------------------------------------------
const FONTS = {
  display: { family: 'JD Display', weight: 800, file: fontFile('bricolage-grotesque', 'bricolage-grotesque-latin-800-normal.woff2') },
  text: { family: 'JD Display', weight: 500, file: fontFile('bricolage-grotesque', 'bricolage-grotesque-latin-500-normal.woff2') },
  mono: { family: 'JD Mono', weight: 500, file: fontFile('geist-mono', 'geist-mono-latin-500-normal.woff2') },
};
for (const f of Object.values(FONTS)) f.kit = fontkit.openSync(f.file);

const measure = (font, text, size, ls = 0) =>
  (FONTS[font].kit.layout(text).advanceWidth / FONTS[font].kit.unitsPerEm) * size + ls * text.length;

const EXTRA_CHARS = 'áéíóúÁÉÍÓÚñÑüÜ¿¡·—–…“”‘’×→✓';
const ASCII = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join('');

const fontCache = new Map();
async function fontFaces(keys) {
  const chars = ASCII + EXTRA_CHARS;
  const css = [];
  for (const f of keys.map((k) => FONTS[k])) {
    if (fontCache.has(f)) { css.push(fontCache.get(f)); continue; }
    const buf = await subsetFont(fs.readFileSync(f.file), chars, { targetFormat: 'woff2' });
    const rule = `@font-face{font-family:'${f.family}';font-weight:${f.weight};src:url(data:font/woff2;base64,${buf.toString('base64')}) format('woff2');}`;
    fontCache.set(f, rule);
    css.push(rule);
  }
  return css.join('\n');
}

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const r1 = (n) => Math.round(n * 10) / 10;

const themeCss = (variant) => `
      :root { ${varsCss(variant.base)} }
      .only-light { display: ${variant.adaptive ? 'none' : 'inline'}; }
      .only-dark  { display: ${variant.adaptive ? 'inline' : 'none'}; }${variant.adaptive ? `
      @media (prefers-color-scheme: light) {
        :root { ${varsCss(variant.light)} }
        .only-dark  { display: none; }
        .only-light { display: inline; }
      }` : ''}`;

const baseStyle = (variant) => `${themeCss(variant)}
      .display { font-family: 'JD Display', 'Segoe UI', system-ui, sans-serif; font-weight: 800; }
      .text    { font-family: 'JD Display', 'Segoe UI', system-ui, sans-serif; font-weight: 500; }
      .mono    { font-family: 'JD Mono', ui-monospace, 'SFMono-Regular', Consolas, monospace; font-weight: 500; }
      .rise  { animation: rise .7s cubic-bezier(.2,.8,.2,1) both; }
      .fade  { animation: fade .5s ease-out both; }
      .draw  { stroke-dasharray: 1; animation: draw 1.6s linear .6s both; }
      .ring  { transform-box: fill-box; transform-origin: center; animation: ring 2.4s ease-out 1s infinite; }
      @keyframes rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
      @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
      @keyframes ring { from { opacity: .7; transform: scale(1); } to { opacity: 0; transform: scale(2.8); } }
      @media (prefers-reduced-motion: reduce) {
        .rise, .fade, .draw, .ring { animation: none; }
      }`;

const canvas = (W, H, glow) => `
  <g clip-path="url(#clip)">
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <rect width="${W}" height="${H}" fill="url(#grid)"/>
    ${glow}
  </g>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="17.5" fill="none" stroke="${V.edge}" style="stroke-opacity:${V.edgeO}"/>`;

const commonDefs = (W, H) => `
    <clipPath id="clip"><rect width="${W}" height="${H}" rx="18"/></clipPath>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" style="stop-color:${V.bg1}"/>
      <stop offset="1" style="stop-color:${V.bg2}"/>
    </linearGradient>
    <radialGradient id="glow">
      <stop offset="0" style="stop-color:${V.accent};stop-opacity:${V.glowO}"/>
      <stop offset="1" style="stop-color:${V.accent};stop-opacity:0"/>
    </radialGradient>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="10" cy="10" r="1" fill="${V.dot}" style="fill-opacity:${V.dotO}"/>
    </pattern>`;

// Ancla cuadrada estilo herramienta de diseño
const anchor = (x, y, s = 9, fill = V.board) =>
  `<rect x="${r1(x - s / 2)}" y="${r1(y - s / 2)}" width="${s}" height="${s}" fill="${fill}" stroke="${V.accent}" stroke-width="1.6"/>`;

// ---------------------------------------------------------------------------
// Banner (panorámico: más ancho y más bajo, 1500x304)
// ---------------------------------------------------------------------------
function banner(variant, fonts) {
  const W = 1500, H = 304, X = 56;

  // Nombre + caja de selección
  const nameSize = 56, nameLs = -1, nameY = 108;
  const nameW = measure('display', C.name, nameSize, nameLs);
  const sel = { x: X - 12, y: 56, w: r1(nameW + 26), h: 68 };

  // Fila superior: etiqueta del frame + estado
  const handleW = measure('mono', C.handle, 15);
  const statusX = r1(X + 22 + handleW + 32);

  // Chips agrupados en 1 sola fila panorámica inferior
  const chipH = 34, padX = 15.8, gap = 9, groupGap = 38, chipSize = 15, labelY = 238, chipY = 250;
  let cx = X, delay = 0.45;
  const groups = C.groups.map((g) => {
    const startX = cx;
    const chips = g.items.map((item) => {
      const w = r1(measure('text', item, chipSize) + padX * 2);
      const chip = { item, x: r1(cx), w, d: delay };
      cx += w + gap; delay += 0.04;
      return chip;
    });
    cx += groupGap - gap;
    return { ...g, x: startX, labelY, chipY, chips };
  });

  // Ventana trasera (terminal) + ventana delantera (portafolio.fig)
  const T = { x: 862, y: 20, w: 312, h: 174 };
  const B = { x: 1112, y: 38, w: 332, h: 182 };
  const curve = 'M 1144 142 C 1172 76, 1252 76, 1266 112 S 1354 152, 1390 104';
  const codeLineDark = C.pathCode2(PALETTES.dark.accent);
  const codeLineLight = C.pathCode2(PALETTES.light.accent);
  const codeW = Math.max(measure('mono', C.pathCode1, 12), measure('mono', codeLineDark, 12));
  const promptW = measure('mono', 'jose.dev@full-stack:~$ ', 12.5);

  const chipsSvg = groups.map((g) => `
    <g class="rise" style="animation-delay:${g.chips[0].d.toFixed(2)}s">
      ${anchor(g.x + 3.5, g.labelY - 4.5, 7, V.accent)}
      <text x="${g.x + 14}" y="${g.labelY}" class="mono" font-size="14" fill="${V.muted}">${esc(g.label)}</text>
    </g>${g.chips.map((c) => `
    <g class="rise" style="animation-delay:${c.d.toFixed(2)}s">
      <rect x="${c.x}" y="${g.chipY}" width="${c.w}" height="${chipH}" rx="${chipH / 2}" fill="${V.chipFill}" stroke="${V.chipStroke}" style="fill-opacity:${V.chipFillO};stroke-opacity:${V.chipStrokeO}"/>
      <text x="${r1(c.x + c.w / 2)}" y="${g.chipY + 22}" text-anchor="middle" class="text" font-size="${chipSize}" fill="${V.ink}">${esc(c.item)}</text>
    </g>`).join('')}`).join('');

  // Plumilla (herramienta pluma), punta en el origen
  const nib = `
      <g>
        <path d="M 14.9 -21.9 L 21.9 -14.9 L 36 -29 L 29 -36 Z" fill="${V.ink}"/>
        <path d="M 0 0 L 17 -5.7 L 21.9 -14.9 L 14.9 -21.9 L 5.7 -17 Z" fill="${V.ink}" stroke="${V.accent}" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M 0 0 L 7 -7" stroke="${V.bg1}" stroke-width="1.6" stroke-linecap="round"/>
        <circle cx="7.8" cy="-7.8" r="2" fill="${V.bg1}"/>
        <animateMotion dur="2.2s" fill="freeze" keyPoints="0;0;1" keyTimes="0;.2727;1" calcMode="linear" path="${curve}"/>
      </g>`;

  const headY = B.y + 30;
  const inspectY = B.y + B.h - 62;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="title desc">
  <title id="title">${esc(C.fullName)} (${C.handle}): ${esc(C.role)}</title>
  <desc id="desc">${esc(`Banner con el nombre seleccionado como en una herramienta de diseño, una pestaña de terminal (jose.dev@full-stack:~$) en segundo plano y la mesa de trabajo portafolio.fig delante donde una pluma dibuja una curva Bézier junto a su código. Stack: ${C.groups.map((g) => `${g.label}: ${g.items.join(', ')}`).join('; ')}.`)}</desc>
  <defs>${commonDefs(W, H)}
    <filter id="winShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="-6" dy="-4" stdDeviation="8" flood-color="#000000" flood-opacity="0.28"/>
    </filter>
    <clipPath id="type"><rect x="${B.x + 16}" y="${inspectY + 22}" width="0" height="36">
      <animate attributeName="width" from="0" to="${r1(codeW + 8)}" begin="1.2s" dur="1.4s" fill="freeze"/>
    </rect></clipPath>
    <style>${baseStyle(variant)}
      .blink { animation: blink 1.1s steps(1, end) infinite; }
      @keyframes blink { 50% { opacity: 0; } }
      .type-static { display: none; }
      @media (prefers-reduced-motion: reduce) { .type-anim { display: none; } .type-static { display: inline; } .blink { animation: none; } }
    </style>
    <style>
${fonts}
    </style>
  </defs>
${canvas(W, H, `<ellipse cx="1220" cy="120" rx="420" ry="210" fill="url(#glow)"/>
    <ellipse cx="180" cy="300" rx="380" ry="140" fill="url(#glow)" opacity=".6"/>`)}

  <!-- Etiqueta del frame + estado -->
  <g class="rise">
    <path d="M ${X + 4} 28 v 14 M ${X + 12} 28 v 14 M ${X} 32 h 16 M ${X} 38 h 16" stroke="${V.accent}" stroke-width="1.8" stroke-linecap="round"/>
    <text x="${X + 22}" y="41" class="mono" font-size="15" fill="${V.accent}">${C.handle}</text>
    <circle cx="${statusX}" cy="36" r="4.5" fill="${V.accent}"/>
    <circle cx="${statusX}" cy="36" r="4.5" fill="none" stroke="${V.accent}" stroke-width="1.5" class="ring"/>
    <text x="${statusX + 13}" y="41" class="text" font-size="15" fill="${V.muted}">${esc(C.status)}</text>
  </g>

  <!-- Nombre seleccionado -->
  <text x="${X}" y="${nameY}" class="display rise" style="animation-delay:.08s" font-size="${nameSize}" letter-spacing="${nameLs}" fill="${V.ink}">${esc(C.name)}</text>
  <g class="fade" style="animation-delay:.3s">
    <rect x="${sel.x}" y="${sel.y}" width="${sel.w}" height="${sel.h}" fill="none" stroke="${V.accent}" stroke-width="1.6"/>
    ${anchor(sel.x, sel.y, 8, V.bg1)} ${anchor(sel.x + sel.w, sel.y, 8, V.bg1)}
    ${anchor(sel.x, sel.y + sel.h, 8, V.bg1)} ${anchor(sel.x + sel.w, sel.y + sel.h, 8, V.bg1)}
  </g>

  <!-- Rol y propuesta -->
  <text x="${X}" y="162" class="text rise" style="animation-delay:.16s" font-size="21" fill="${V.ink}">${esc(C.role)}</text>
  <text x="${X}" y="192" class="text rise" style="animation-delay:.24s" font-size="18" fill="${V.muted}">${esc(C.pitch)}</text>

  <!-- Stack -->${chipsSvg}

  <!-- Ventana trasera: terminal jose.dev@full-stack:~$ -->
  <g class="fade" style="animation-delay:.12s">
    <rect x="${T.x}" y="${T.y}" width="${T.w}" height="${T.h}" rx="13" fill="${V.board}" stroke="${V.accent}" stroke-width="1.3" style="stroke-opacity:${V.termStrokeO}"/>
    <path d="M ${T.x} ${T.y + 32} H ${T.x + T.w}" stroke="${V.boardStroke}" style="stroke-opacity:${V.boardStrokeStrongO}"/>
    <circle cx="${T.x + 16}" cy="${T.y + 16}" r="3.8" fill="${V.accent}" fill-opacity=".45"/>
    <circle cx="${T.x + 28}" cy="${T.y + 16}" r="3.8" fill="${V.accent}" fill-opacity=".72"/>
    <circle cx="${T.x + 40}" cy="${T.y + 16}" r="3.8" fill="${V.accent}"/>
    <text x="${T.x + 54}" y="${T.y + 20.5}" class="mono" font-size="12.5">
      <tspan fill="${V.accent}">jose.dev@full-stack</tspan><tspan fill="${V.ink}">:</tspan><tspan fill="${V.accentSoft}">~</tspan><tspan fill="${V.ink}">$</tspan>
    </text>
    <rect x="${r1(T.x + 54 + promptW)}" y="${T.y + 9.5}" width="7" height="14" rx="1.5" fill="${V.accent}" class="blink"/>
    <g class="mono" font-size="11.5" fill="${V.muted}">
      <text x="${T.x + 16}" y="${T.y + 54}" fill="${V.ink}">$ npm run dev</text>
      <text x="${T.x + 16}" y="${T.y + 76}"><tspan fill="${V.accent}">✓</tspan> web    ready</text>
      <text x="${T.x + 16}" y="${T.y + 98}"><tspan fill="${V.accent}">✓</tspan> mobile ready</text>
      <text x="${T.x + 16}" y="${T.y + 120}"><tspan fill="${V.accent}">✓</tspan> api    online</text>
      <text x="${T.x + 16}" y="${T.y + 142}"><tspan fill="${V.accent}">✓</tspan> ui/ux  synced</text>
      <text x="${T.x + 16}" y="${T.y + 162}" fill="${V.faint}">listening :3000</text>
    </g>
  </g>

  <!-- Ventana delantera: mesa de trabajo portafolio.fig -->
  <g class="fade" style="animation-delay:.22s">
    <rect x="${B.x}" y="${B.y}" width="${B.w}" height="${B.h}" rx="13" fill="${V.board}" stroke="${V.boardStroke}" style="stroke-opacity:${V.boardStrokeStrongO}" filter="url(#winShadow)"/>
    <path d="M ${B.x} ${headY} H ${B.x + B.w}" stroke="${V.boardStroke}" style="stroke-opacity:${V.boardStrokeO}"/>
    <path d="M ${B.x + 16} ${B.y + 10} h 10 v 10 h -10 z" fill="none" stroke="${V.accent}" stroke-width="1.5"/>
    <text x="${B.x + 32}" y="${B.y + 20}" class="mono" font-size="12.5" fill="${V.ink}">${C.artboard}</text>
    <text x="${B.x + B.w - 16}" y="${B.y + 20}" text-anchor="end" class="mono" font-size="11" fill="${V.faint}">fig · 100%</text>
    <path d="M ${B.x} ${inspectY} H ${B.x + B.w}" stroke="${V.boardStroke}" style="stroke-opacity:${V.boardStrokeO}"/>
    <rect x="${B.x + 16}" y="${inspectY + 9}" width="8" height="8" rx="2" fill="${V.accent}"/>
    <text x="${B.x + 30}" y="${inspectY + 17}" class="mono" font-size="11" fill="${V.muted}">stroke · <tspan class="only-dark">${PALETTES.dark.accent}</tspan><tspan class="only-light">${PALETTES.light.accent}</tspan> · 3px</text>
  </g>
  <path d="${curve}" fill="none" stroke="${V.accent}" stroke-width="2.8" stroke-linecap="round" pathLength="1" class="draw"/>
  <g class="fade" style="animation-delay:2.2s">
    <path d="M 1252 76 L 1280 148" stroke="${V.muted}" stroke-width="1.2"/>
    <circle cx="1252" cy="76" r="3.4" fill="${V.board}" stroke="${V.muted}" stroke-width="1.2"/>
    <circle cx="1280" cy="148" r="3.4" fill="${V.board}" stroke="${V.muted}" stroke-width="1.2"/>
    ${anchor(1144, 142, 8)} ${anchor(1266, 112, 8)} ${anchor(1390, 104, 8)}
  </g>
  <g class="mono" font-size="11.5" fill="${V.ink}">
    <g class="type-anim" clip-path="url(#type)">
      <text x="${B.x + 16}" y="${inspectY + 37}" fill="${V.muted}">${esc(C.pathCode1)}</text>
      <text x="${B.x + 16}" y="${inspectY + 53}" fill="${V.accentSoft}"><tspan class="only-dark">${esc(codeLineDark)}</tspan><tspan class="only-light">${esc(codeLineLight)}</tspan></text>
    </g>
    <g class="type-static">
      <text x="${B.x + 16}" y="${inspectY + 37}" fill="${V.muted}">${esc(C.pathCode1)}</text>
      <text x="${B.x + 16}" y="${inspectY + 53}" fill="${V.accentSoft}"><tspan class="only-dark">${esc(codeLineDark)}</tspan><tspan class="only-light">${esc(codeLineLight)}</tspan></text>
    </g>
  </g>
  ${nib}
</svg>
`;
}

// ---------------------------------------------------------------------------
// Footer (panorámico: más ancho y más bajo, 1500x146)
// ---------------------------------------------------------------------------
function footer(variant, fonts) {
  const W = 1500, H = 146, X = 56;
  const typedText = 'const build = ({ ui: "Figma", web: "React", api: ".NET" }) => deploy();';
  const typedW = r1(measure('mono', typedText, 13));
  const codeStartX = X + 18;

  const ticker = 'git commit -m "feat: algoritmo y diseño"   ·   npx expo start   ·   dotnet run --project Api';
  const tickerUnit = `${ticker}   ·   `;
  const tickerShift = r1(measure('mono', tickerUnit, 11.5));

  const wave1 = 'M -10 102 C 200 80, 375 80, 525 98 S 825 118, 1000 98 S 1300 78, 1510 94';
  const wave2 = 'M -10 92 C 200 116, 375 116, 525 98 S 825 78, 1000 98 S 1300 118, 1510 102';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="title desc">
  <title id="title">${esc(C.motto)} ${esc(C.fullName)} (${C.handle})</title>
  <desc id="desc">Pie de página con el lema, código escribiéndose en vivo, fragmentos de código en movimiento, trazo Bézier animado y enlace al portafolio ${C.site}.</desc>
  <defs>${commonDefs(W, H)}
    <clipPath id="footerType">
      <rect x="${codeStartX}" y="54" width="${typedW}" height="24">
        <animate attributeName="width" values="0;${typedW};${typedW};0;0" keyTimes="0;0.55;0.82;0.95;1" dur="7.5s" repeatCount="indefinite"/>
      </rect>
    </clipPath>
    <style>${themeCss(variant)}
      .display { font-family: 'JD Display', 'Segoe UI', system-ui, sans-serif; font-weight: 800; }
      .mono    { font-family: 'JD Mono', ui-monospace, 'SFMono-Regular', Consolas, monospace; font-weight: 500; }
      .blink   { animation: blink 0.9s steps(1, end) infinite; }
      @keyframes blink { 50% { opacity: 0; } }
    </style>
    <style>
${fonts}
    </style>
  </defs>
  <g clip-path="url(#clip)">
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <rect width="${W}" height="${H}" fill="url(#grid)"/>
    <ellipse cx="750" cy="155" rx="680" ry="115" fill="url(#glow)"/>

    <!-- Línea de código inferior en movimiento -->
    <g class="mono" font-size="11.5" fill="${V.accentSoft}" style="opacity:${V.tickerO}">
      <text x="-${tickerShift}" y="132">${esc(`${tickerUnit}${tickerUnit}${tickerUnit}${ticker}`)}</text>
      <animateTransform attributeName="transform" type="translate" from="0 0" to="${tickerShift} 0" dur="22s" repeatCount="indefinite"/>
    </g>

    <!-- Onda Bézier animada -->
    <path d="${wave1}" fill="none" stroke="${V.accent}" stroke-width="2.4" stroke-linecap="round">
      <animate attributeName="d" values="${wave1};${wave2};${wave1}" dur="7s" repeatCount="indefinite"/>
    </path>
    <g>
      <path d="M 375 80 L 675 116 M 825 118 L 1175 78" stroke="${V.muted}" stroke-opacity=".65" stroke-width="1.1">
        <animate attributeName="d" values="M 375 80 L 675 116 M 825 118 L 1175 78;M 375 116 L 675 80 M 825 78 L 1175 118;M 375 80 L 675 116 M 825 118 L 1175 78" dur="7s" repeatCount="indefinite"/>
      </path>
      <circle cx="375" cy="80" r="3.4" fill="${V.bg1}" stroke="${V.muted}" stroke-width="1.1">
        <animate attributeName="cy" values="80;116;80" dur="7s" repeatCount="indefinite"/>
      </circle>
      <circle cx="675" cy="116" r="3.4" fill="${V.bg1}" stroke="${V.muted}" stroke-width="1.1">
        <animate attributeName="cy" values="116;80;116" dur="7s" repeatCount="indefinite"/>
      </circle>
      <circle cx="825" cy="118" r="3.4" fill="${V.bg1}" stroke="${V.muted}" stroke-width="1.1">
        <animate attributeName="cy" values="118;78;118" dur="7s" repeatCount="indefinite"/>
      </circle>
      <circle cx="1175" cy="78" r="3.4" fill="${V.bg1}" stroke="${V.muted}" stroke-width="1.1">
        <animate attributeName="cy" values="78;118;78" dur="7s" repeatCount="indefinite"/>
      </circle>
      ${anchor(525, 98, 9, V.bg1)} ${anchor(1000, 98, 9, V.bg1)}
    </g>
  </g>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="17.5" fill="none" stroke="${V.edge}" style="stroke-opacity:${V.edgeO}"/>

  <!-- Cabecera: lema y dominio -->
  <text x="${X}" y="42" class="display" font-size="26" letter-spacing="-.4" fill="${V.ink}">${esc(C.motto)}</text>
  <text x="${W - X}" y="42" text-anchor="end" class="mono" font-size="15" fill="${V.muted}">${C.site}</text>

  <!-- Línea de código escribiéndose en vivo con cursor en movimiento -->
  <text x="${X}" y="70" class="mono" font-size="13" fill="${V.accent}">&gt;</text>
  <g clip-path="url(#footerType)" class="mono" font-size="13">
    <text x="${codeStartX}" y="70" fill="${V.ink}">
      <tspan fill="${V.accent}">const</tspan> build = ({ ui: <tspan fill="${V.accentSoft}">"Figma"</tspan>, web: <tspan fill="${V.accentSoft}">"React"</tspan>, api: <tspan fill="${V.accentSoft}">".NET"</tspan> }) <tspan fill="${V.accent}">=&gt;</tspan> deploy();
    </text>
  </g>
  <rect x="${codeStartX + typedW + 3}" y="57" width="7.5" height="15" rx="1.5" fill="${V.accent}" class="blink">
    <animate attributeName="x" values="${codeStartX};${r1(codeStartX + typedW + 3)};${r1(codeStartX + typedW + 3)};${codeStartX};${codeStartX}" keyTimes="0;0.55;0.82;0.95;1" dur="7.5s" repeatCount="indefinite"/>
  </rect>
</svg>
`;
}

// ---------------------------------------------------------------------------
// Badges de contacto (adaptativos Dark Carmesí <-> Light Lila)
// ---------------------------------------------------------------------------
const ICONS = {
  chrome: '<path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 0 1-6.865-2.29zm13.342 2.166a5.446 5.446 0 0 1 1.45 7.09l.002.001h-.002l-5.344 9.257c.206.01.413.016.621.016 6.627 0 12-5.373 12-12 0-1.54-.29-3.011-.818-4.364zM12 16.364a4.364 4.364 0 1 1 0-8.728 4.364 4.364 0 0 1 0 8.728Z"/>',
  linkedin: '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>',
  mail: '<path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>',
};

function makeBadge(cfg, adaptive) {
  const { label, value, w1, w2, icon, dark, light } = cfg;
  const W = w1 + w2, H = 28;
  const cssVars = (p) => `--b-lbg:${p.lbg};--b-rbg:${p.rbg};--b-ltxt:${p.ltxt};--b-rtxt:${p.rtxt};--b-ico:${p.ico};--b-bdr:${p.bdr};`;
  const style = adaptive
    ? `:root{${cssVars(dark)}}@media (prefers-color-scheme: light){:root{${cssVars(light)}}}`
    : `:root{${cssVars(light)}}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <defs>
    <clipPath id="r"><rect width="${W}" height="${H}" rx="4"/></clipPath>
    <style>${style}</style>
  </defs>
  <g clip-path="url(#r)" shape-rendering="crispEdges">
    <rect width="${w1}" height="${H}" fill="var(--b-lbg)"/>
    <rect x="${w1}" width="${w2}" height="${H}" fill="var(--b-rbg)"/>
  </g>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="3.5" fill="none" stroke="var(--b-bdr)"/>
  <g transform="translate(10, 7) scale(0.5833)" fill="var(--b-ico)">${ICONS[icon]}</g>
  <g text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="10">
    <text x="${r1(12 + w1 / 2)}" y="17.5" fill="var(--b-ltxt)" letter-spacing="1">${label}</text>
    <text x="${r1(w1 + w2 / 2)}" y="17.5" fill="var(--b-rtxt)" font-weight="bold" letter-spacing="1">${value}</text>
  </g>
</svg>
`;
}

const BADGE_SPECS = [
  {
    name: 'badge-portfolio', label: 'PORTAFOLIO', value: 'JOSE2520.GITHUB.IO', w1: 118, w2: 168, icon: 'chrome',
    dark:  { lbg: '#141117', rbg: '#0E080B', ltxt: '#F5F2F0', rtxt: '#FFFFFF', ico: '#FF3349', bdr: '#2A2228' },
    light: { lbg: '#EDE5FC', rbg: '#FAF7FF', ltxt: '#171222', rtxt: '#7C3AED', ico: '#8B5CF6', bdr: '#D8CBF2' },
  },
  {
    name: 'badge-linkedin', label: 'LINKEDIN', value: 'JOSE-DE-CARMEN-D', w1: 104, w2: 158, icon: 'linkedin',
    dark:  { lbg: '#0E080B', rbg: '#FF3349', ltxt: '#F5F2F0', rtxt: '#FFFFFF', ico: '#FF3349', bdr: '#FF3349' },
    light: { lbg: '#EDE5FC', rbg: '#8B5CF6', ltxt: '#171222', rtxt: '#FFFFFF', ico: '#8B5CF6', bdr: '#8B5CF6' },
  },
  {
    name: 'badge-email', label: 'CORREO', value: 'ESCRÍBEME', w1: 92, w2: 104, icon: 'mail',
    dark:  { lbg: '#0E080B', rbg: '#F5F2F0', ltxt: '#F5F2F0', rtxt: '#0E080B', ico: '#FF3349', bdr: '#2A2228' },
    light: { lbg: '#EDE5FC', rbg: '#7C3AED', ltxt: '#171222', rtxt: '#FFFFFF', ico: '#8B5CF6', bdr: '#7C3AED' },
  },
];

// ---------------------------------------------------------------------------
const OUTPUTS = [
  ['jose-banner', banner, ['display', 'text', 'mono']],
  ['jose-footer', footer, ['display', 'mono']],
];
for (const variant of VARIANTS) {
  for (const [name, fn, keys] of OUTPUTS) {
    const file = path.join(root, `${name}${variant.suffix}.svg`);
    const svg = fn(variant, await fontFaces(keys));
    fs.writeFileSync(file, svg);
    console.log(`✓ ${path.relative(root, file)}  ${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB`);
  }
}

const cardsDir = path.join(root, 'profile-summary-card-output');
fs.mkdirSync(cardsDir, { recursive: true });
for (const b of BADGE_SPECS) {
  for (const [suffix, adaptive] of [['', true], ['-light', false]]) {
    const file = path.join(cardsDir, `${b.name}${suffix}.svg`);
    fs.writeFileSync(file, makeBadge(b, adaptive));
    console.log(`✓ ${path.relative(root, file)}`);
  }
}

// Hacer adaptativo streak-stats y las tarjetas de commits si existen
function makeStreakAdaptive(rawSvg, adaptive) {
  const clean = rawSvg.replace(/:root\{[^}]+\}(@media\s*\(prefers-color-scheme:\s*light\)\{:root\{[^}]+\}\})?\s*/g, '');
  const darkVars = '--s-bg:#0E080B;--s-stroke:#2A2228;--s-ink:#F5F2F0;--s-muted:#A39FA8;--s-accent:#FF3349;';
  const lightVars = '--s-bg:#FAF7FF;--s-stroke:#E4DAF6;--s-ink:#171222;--s-muted:#5E546E;--s-accent:#8B5CF6;';
  const rule = adaptive
    ? `:root{${darkVars}}@media (prefers-color-scheme: light){:root{${lightVars}}}`
    : `:root{${lightVars}}`;
  return clean
    .replace(/#0e080b/gi, 'var(--s-bg)')
    .replace(/#2a2228/gi, 'var(--s-stroke)')
    .replace(/#f5f2f0/gi, 'var(--s-ink)')
    .replace(/#a39fa8/gi, 'var(--s-muted)')
    .replace(/#ff3349/gi, 'var(--s-accent)')
    .replace('<style>', `<style>${rule}\n`);
}

const streakSrc = fs.existsSync('/tmp/streak.svg')
  ? fs.readFileSync('/tmp/streak.svg', 'utf8')
  : (fs.existsSync(path.join(cardsDir, 'streak-stats.svg')) ? fs.readFileSync(path.join(cardsDir, 'streak-stats.svg'), 'utf8') : null);
if (streakSrc) {
  fs.writeFileSync(path.join(cardsDir, 'streak-stats.svg'), makeStreakAdaptive(streakSrc, true));
  fs.writeFileSync(path.join(cardsDir, 'streak-stats-light.svg'), makeStreakAdaptive(streakSrc, false));
  console.log('✓ profile-summary-card-output/streak-stats(.light).svg');
}

for (const card of ['2-most-commit-language.svg', '4-productive-time.svg']) {
  const darkFile = path.join(cardsDir, 'github_dark', card);
  const lightFile = path.join(cardsDir, 'default', card);
  if (fs.existsSync(darkFile)) {
    const raw = fs.readFileSync(darkFile, 'utf8').replace(/:root\{[^}]+\}(@media\s*\(prefers-color-scheme:\s*light\)\{:root\{[^}]+\}\})?/g, '');
    const dVars = '--c-bg:#0E080B;--c-bdr:#2A2228;--c-title:#FF3349;--c-txt:#F5F2F0;--c-bar:#FF3349;';
    const lVars = '--c-bg:#FAF7FF;--c-bdr:#E4DAF6;--c-title:#7C3AED;--c-txt:#171222;--c-bar:#8B5CF6;';
    const adapt = (s, isAdapt) => s
      .replace(/#0d1117|var\(--c-bg\)/gi, 'var(--c-bg)')
      .replace(/#2e343b|var\(--c-bdr\)/gi, 'var(--c-bdr)')
      .replace(/#0366d6|var\(--c-title\)/gi, 'var(--c-title)')
      .replace(/#77909c|var\(--c-txt\)/gi, 'var(--c-txt)')
      .replace(/#40c463|var\(--c-bar\)/gi, 'var(--c-bar)')
      .replace('<style>', `<style>:root{${isAdapt ? dVars : lVars}}${isAdapt ? `@media (prefers-color-scheme: light){:root{${lVars}}}` : ''}`);
    fs.writeFileSync(darkFile, adapt(raw, true));
    fs.writeFileSync(lightFile, adapt(raw, false));
    console.log(`✓ adaptive ${card}`);
  }
}
