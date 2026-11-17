// Genera jose-banner(.light).svg y jose-footer(.light).svg en la raíz del repo.
// Las fuentes se embeben como subconjunto WOFF2 en base64 para que el SVG
// se vea idéntico en cualquier sistema (GitHub no carga fuentes externas en <img>).
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
// Temas
// ---------------------------------------------------------------------------
const THEMES = {
  dark: {
    suffix: '',
    bg1: '#0E080B', bg2: '#060609',
    dot: '#FFFFFF', dotO: 0.07,
    ink: '#F5F2F0', muted: '#A39FA8', faint: '#5C5762',
    accent: '#FF3349', accentSoft: '#FF8C98', glowO: 0.24,
    chipFill: '#FFFFFF', chipFillO: 0.045, chipStroke: '#FFFFFF', chipStrokeO: 0.14,
    board: '#141117', boardStroke: '#FFFFFF', boardStrokeO: 0.12,
    edge: '#FFFFFF', edgeO: 0.08,
  },
  light: {
    suffix: '-light',
    bg1: '#FAF7FF', bg2: '#F2ECFD',
    dot: '#231934', dotO: 0.09,
    ink: '#171222', muted: '#5E546E', faint: '#A79EB8',
    accent: '#8B5CF6', accentSoft: '#7C3AED', glowO: 0.16,
    chipFill: '#FFFFFF', chipFillO: 0.85, chipStroke: '#171222', chipStrokeO: 0.14,
    board: '#FFFFFF', boardStroke: '#171222', boardStrokeO: 0.12,
    edge: '#171222', edgeO: 0.10,
  },
};

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

// Caracteres extra para poder editar textos en español sin perder glifos.
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

const baseStyle = (t) => `
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

const canvas = (t, W, H, glow) => `
  <g clip-path="url(#clip)">
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <rect width="${W}" height="${H}" fill="url(#grid)"/>
    ${glow}
  </g>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="17.5" fill="none" stroke="${t.edge}" stroke-opacity="${t.edgeO}"/>`;

const commonDefs = (t, W, H) => `
    <clipPath id="clip"><rect width="${W}" height="${H}" rx="18"/></clipPath>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${t.bg1}"/>
      <stop offset="1" stop-color="${t.bg2}"/>
    </linearGradient>
    <radialGradient id="glow">
      <stop offset="0" stop-color="${t.accent}" stop-opacity="${t.glowO}"/>
      <stop offset="1" stop-color="${t.accent}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="10" cy="10" r="1" fill="${t.dot}" fill-opacity="${t.dotO}"/>
    </pattern>`;

// Ancla cuadrada estilo herramienta de diseño
const anchor = (t, x, y, s = 9, fill = t.board) =>
  `<rect x="${r1(x - s / 2)}" y="${r1(y - s / 2)}" width="${s}" height="${s}" fill="${fill}" stroke="${t.accent}" stroke-width="1.6"/>`;

// ---------------------------------------------------------------------------
// Banner
// ---------------------------------------------------------------------------
function banner(t, fonts) {
  const W = 1200, H = 408, X = 56;

  // Nombre + caja de selección
  const nameSize = 58, nameLs = -1, nameY = 122;
  const nameW = measure('display', C.name, nameSize, nameLs);
  const sel = { x: X - 12, y: 68, w: r1(nameW + 26), h: 72 };

  // Fila superior: etiqueta del frame + estado
  const handleW = measure('mono', C.handle, 15);
  const statusX = r1(X + 22 + handleW + 32);

  // Chips agrupados en 2 filas a la izquierda
  const chipH = 34, padX = 14, gap = 8, groupGap = 28, chipSize = 14.5;
  const rowY = [
    { labelY: 256, chipY: 268 },
    { labelY: 330, chipY: 342 },
  ];
  const rowCursor = [X, X];
  let delay = 0.45;
  const groups = C.groups.map((g) => {
    const r = g.row ?? 0;
    const startX = rowCursor[r];
    const chips = g.items.map((item) => {
      const w = r1(measure('text', item, chipSize) + padX * 2);
      const chip = { item, x: r1(rowCursor[r]), w, d: delay };
      rowCursor[r] += w + gap; delay += 0.04;
      return chip;
    });
    rowCursor[r] += groupGap - gap;
    return { ...g, x: startX, ...rowY[r], chips };
  });

  // Ventana trasera (terminal) desplazada a la izquierda + ventana delantera (portafolio.fig)
  const T = { x: 716, y: 28, w: 316, h: 210 };
  const B = { x: 856, y: 86, w: 292, h: 290 };
  const curve = 'M 886 234 C 912 136, 986 136, 998 188 S 1080 248, 1110 150';
  const codeLine2 = C.pathCode2(t.accent);
  const codeW = Math.max(measure('mono', C.pathCode1, 12.5), measure('mono', codeLine2, 12.5));
  const promptW = measure('mono', 'jose.dev@full-stack:~$ ', 13);

  const chipsSvg = groups.map((g) => `
    <g class="rise" style="animation-delay:${g.chips[0].d.toFixed(2)}s">
      ${anchor(t, g.x + 3.5, g.labelY - 4.5, 7, t.accent)}
      <text x="${g.x + 14}" y="${g.labelY}" class="mono" font-size="14" fill="${t.muted}">${esc(g.label)}</text>
    </g>${g.chips.map((c) => `
    <g class="rise" style="animation-delay:${c.d.toFixed(2)}s">
      <rect x="${c.x}" y="${g.chipY}" width="${c.w}" height="${chipH}" rx="${chipH / 2}" fill="${t.chipFill}" fill-opacity="${t.chipFillO}" stroke="${t.chipStroke}" stroke-opacity="${t.chipStrokeO}"/>
      <text x="${r1(c.x + c.w / 2)}" y="${g.chipY + 22}" text-anchor="middle" class="text" font-size="${chipSize}" fill="${t.ink}">${esc(c.item)}</text>
    </g>`).join('')}`).join('');

  // Plumilla (herramienta pluma), punta en el origen
  const nib = `
      <g>
        <path d="M 14.9 -21.9 L 21.9 -14.9 L 36 -29 L 29 -36 Z" fill="${t.ink}"/>
        <path d="M 0 0 L 17 -5.7 L 21.9 -14.9 L 14.9 -21.9 L 5.7 -17 Z" fill="${t.ink}" stroke="${t.accent}" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M 0 0 L 7 -7" stroke="${t.bg1}" stroke-width="1.6" stroke-linecap="round"/>
        <circle cx="7.8" cy="-7.8" r="2" fill="${t.bg1}"/>
        <animateMotion dur="2.2s" fill="freeze" keyPoints="0;0;1" keyTimes="0;.2727;1" calcMode="linear" path="${curve}"/>
      </g>`;

  const headY = B.y + 32;
  const inspectY = B.y + B.h - 94;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="title desc">
  <title id="title">${esc(C.fullName)} (${C.handle}): ${esc(C.role)}</title>
  <desc id="desc">${esc(`Banner con el nombre seleccionado como en una herramienta de diseño, una pestaña de terminal (jose.dev@full-stack:~$) en segundo plano y la mesa de trabajo portafolio.fig delante donde una pluma dibuja una curva Bézier junto a su código. Stack: ${C.groups.map((g) => `${g.label}: ${g.items.join(', ')}`).join('; ')}.`)}</desc>
  <defs>${commonDefs(t, W, H)}
    <filter id="winShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="-6" dy="-4" stdDeviation="8" flood-color="#000000" flood-opacity="${t.suffix ? 0.12 : 0.55}"/>
    </filter>
    <clipPath id="type"><rect x="${B.x + 18}" y="${inspectY + 32}" width="0" height="54">
      <animate attributeName="width" from="0" to="${r1(codeW + 8)}" begin="1.2s" dur="1.4s" fill="freeze"/>
    </rect></clipPath>
    <style>${baseStyle(t)}
      .blink { animation: blink 1.1s steps(1, end) infinite; }
      @keyframes blink { 50% { opacity: 0; } }
      .type-static { display: none; }
      @media (prefers-reduced-motion: reduce) { .type-anim { display: none; } .type-static { display: inline; } .blink { animation: none; } }
    </style>
    <style>
${fonts}
    </style>
  </defs>
${canvas(t, W, H, `<ellipse cx="1000" cy="150" rx="360" ry="250" fill="url(#glow)"/>
    <ellipse cx="140" cy="390" rx="340" ry="160" fill="url(#glow)" opacity=".6"/>`)}

  <!-- Etiqueta del frame + estado -->
  <g class="rise">
    <path d="M ${X + 4} 38 v 14 M ${X + 12} 38 v 14 M ${X} 42 h 16 M ${X} 48 h 16" stroke="${t.accent}" stroke-width="1.8" stroke-linecap="round"/>
    <text x="${X + 22}" y="51" class="mono" font-size="15" fill="${t.accent}">${C.handle}</text>
    <circle cx="${statusX}" cy="46" r="4.5" fill="${t.accent}"/>
    <circle cx="${statusX}" cy="46" r="4.5" fill="none" stroke="${t.accent}" stroke-width="1.5" class="ring"/>
    <text x="${statusX + 13}" y="51" class="text" font-size="15" fill="${t.muted}">${esc(C.status)}</text>
  </g>

  <!-- Nombre seleccionado -->
  <text x="${X}" y="${nameY}" class="display rise" style="animation-delay:.08s" font-size="${nameSize}" letter-spacing="${nameLs}" fill="${t.ink}">${esc(C.name)}</text>
  <g class="fade" style="animation-delay:.3s">
    <rect x="${sel.x}" y="${sel.y}" width="${sel.w}" height="${sel.h}" fill="none" stroke="${t.accent}" stroke-width="1.6"/>
    ${anchor(t, sel.x, sel.y, 8, t.bg1)} ${anchor(t, sel.x + sel.w, sel.y, 8, t.bg1)}
    ${anchor(t, sel.x, sel.y + sel.h, 8, t.bg1)} ${anchor(t, sel.x + sel.w, sel.y + sel.h, 8, t.bg1)}
  </g>

  <!-- Rol y propuesta -->
  <text x="${X}" y="180" class="text rise" style="animation-delay:.16s" font-size="21" fill="${t.ink}">${esc(C.role)}</text>
  <text x="${X}" y="210" class="text rise" style="animation-delay:.24s" font-size="18" fill="${t.muted}">${esc(C.pitch)}</text>

  <!-- Stack -->${chipsSvg}

  <!-- Ventana trasera: terminal jose.dev@full-stack:~$ -->
  <g class="fade" style="animation-delay:.12s">
    <rect x="${T.x}" y="${T.y}" width="${T.w}" height="${T.h}" rx="14" fill="${t.board}" stroke="${t.accent}" stroke-opacity="${t.suffix ? 0.38 : 0.45}" stroke-width="1.3"/>
    <path d="M ${T.x} ${T.y + 36} H ${T.x + T.w}" stroke="${t.boardStroke}" stroke-opacity="${t.boardStrokeO * 1.4}"/>
    <circle cx="${T.x + 18}" cy="${T.y + 18}" r="4" fill="${t.accent}" fill-opacity=".45"/>
    <circle cx="${T.x + 31}" cy="${T.y + 18}" r="4" fill="${t.accent}" fill-opacity=".72"/>
    <circle cx="${T.x + 44}" cy="${T.y + 18}" r="4" fill="${t.accent}"/>
    <text x="${T.x + 58}" y="${T.y + 22.5}" class="mono" font-size="13">
      <tspan fill="${t.accent}">jose.dev@full-stack</tspan><tspan fill="${t.ink}">:</tspan><tspan fill="${t.accentSoft}">~</tspan><tspan fill="${t.ink}">$</tspan>
    </text>
    <rect x="${r1(T.x + 58 + promptW)}" y="${T.y + 11}" width="7.5" height="15" rx="1.5" fill="${t.accent}" class="blink"/>
    <g class="mono" font-size="12" fill="${t.muted}">
      <text x="${T.x + 18}" y="${T.y + 62}" fill="${t.ink}">$ npm run dev</text>
      <text x="${T.x + 18}" y="${T.y + 88}"><tspan fill="${t.accent}">✓</tspan> web    ready</text>
      <text x="${T.x + 18}" y="${T.y + 112}"><tspan fill="${t.accent}">✓</tspan> mobile ready</text>
      <text x="${T.x + 18}" y="${T.y + 136}"><tspan fill="${t.accent}">✓</tspan> api    online</text>
      <text x="${T.x + 18}" y="${T.y + 160}"><tspan fill="${t.accent}">✓</tspan> ui/ux  synced</text>
      <text x="${T.x + 18}" y="${T.y + 188}" fill="${t.faint}">listening :3000</text>
    </g>
  </g>

  <!-- Ventana delantera: mesa de trabajo portafolio.fig -->
  <g class="fade" style="animation-delay:.22s">
    <rect x="${B.x}" y="${B.y}" width="${B.w}" height="${B.h}" rx="14" fill="${t.board}" stroke="${t.boardStroke}" stroke-opacity="${t.boardStrokeO * 1.3}" filter="url(#winShadow)"/>
    <path d="M ${B.x} ${headY} H ${B.x + B.w}" stroke="${t.boardStroke}" stroke-opacity="${t.boardStrokeO}"/>
    <path d="M ${B.x + 18} ${B.y + 11} h 10 v 10 h -10 z" fill="none" stroke="${t.accent}" stroke-width="1.5"/>
    <text x="${B.x + 36}" y="${B.y + 21}" class="mono" font-size="13" fill="${t.ink}">${C.artboard}</text>
    <text x="${B.x + B.w - 16}" y="${B.y + 21}" text-anchor="end" class="mono" font-size="11.5" fill="${t.faint}">fig · 100%</text>
    <path d="M ${B.x} ${inspectY} H ${B.x + B.w}" stroke="${t.boardStroke}" stroke-opacity="${t.boardStrokeO}"/>
    <rect x="${B.x + 18}" y="${inspectY + 13}" width="10" height="10" rx="2" fill="${t.accent}"/>
    <text x="${B.x + 34}" y="${inspectY + 22}" class="mono" font-size="12" fill="${t.muted}">stroke · ${t.accent} · 3px</text>
  </g>
  <path d="${curve}" fill="none" stroke="${t.accent}" stroke-width="3" stroke-linecap="round" pathLength="1" class="draw"/>
  <g class="fade" style="animation-delay:2.2s">
    <path d="M 986 136 L 1010 242" stroke="${t.muted}" stroke-width="1.2"/>
    <circle cx="986" cy="136" r="3.6" fill="${t.board}" stroke="${t.muted}" stroke-width="1.2"/>
    <circle cx="1010" cy="242" r="3.6" fill="${t.board}" stroke="${t.muted}" stroke-width="1.2"/>
    ${anchor(t, 886, 234)} ${anchor(t, 998, 188)} ${anchor(t, 1110, 150)}
  </g>
  <g class="mono" font-size="12.5" fill="${t.ink}">
    <g class="type-anim" clip-path="url(#type)">
      <text x="${B.x + 18}" y="${inspectY + 50}" fill="${t.muted}">${esc(C.pathCode1)}</text>
      <text x="${B.x + 18}" y="${inspectY + 72}" fill="${t.accentSoft}">${esc(codeLine2)}</text>
    </g>
    <g class="type-static">
      <text x="${B.x + 18}" y="${inspectY + 50}" fill="${t.muted}">${esc(C.pathCode1)}</text>
      <text x="${B.x + 18}" y="${inspectY + 72}" fill="${t.accentSoft}">${esc(codeLine2)}</text>
    </g>
  </g>
  ${nib}
</svg>
`;
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------
function footer(t, fonts) {
  const W = 1200, H = 164, X = 56;
  const typedText = 'const build = ({ ui: "Figma", web: "React", api: ".NET" }) => deploy();';
  const typedW = r1(measure('mono', typedText, 13));
  const codeStartX = X + 18;

  const ticker = 'git commit -m "feat: algoritmo y diseño"   ·   npx expo start   ·   dotnet run --project Api';

  const wave1 = 'M -10 112 C 160 88, 300 88, 420 108 S 660 130, 800 108 S 1040 86, 1210 104';
  const wave2 = 'M -10 102 C 160 126, 300 126, 420 108 S 660 86, 800 108 S 1040 128, 1210 112';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="title desc">
  <title id="title">${esc(C.motto)} ${esc(C.fullName)} (${C.handle})</title>
  <desc id="desc">Pie de página con el lema, código escribiéndose en vivo, fragmentos de código en movimiento, trazo Bézier animado y enlace al portafolio ${C.site}.</desc>
  <defs>${commonDefs(t, W, H)}
    <clipPath id="footerType">
      <rect x="${codeStartX}" y="62" width="${typedW}" height="24">
        <animate attributeName="width" values="0;${typedW};${typedW};0;0" keyTimes="0;0.55;0.82;0.95;1" dur="7.5s" repeatCount="indefinite"/>
      </rect>
    </clipPath>
    <style>
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
    <ellipse cx="600" cy="175" rx="540" ry="125" fill="url(#glow)"/>

    <!-- Línea de código inferior en movimiento -->
    <g class="mono" font-size="11.5" fill="${t.accentSoft}" opacity="${t.suffix ? 0.6 : 0.52}">
      <text x="-980" y="148">${esc(`${ticker}   ·   ${ticker}   ·   ${ticker}`)}</text>
      <animateTransform attributeName="transform" type="translate" from="0 0" to="980 0" dur="22s" repeatCount="indefinite"/>
    </g>

    <!-- Onda Bézier animada -->
    <path d="${wave1}" fill="none" stroke="${t.accent}" stroke-width="2.4" stroke-linecap="round">
      <animate attributeName="d" values="${wave1};${wave2};${wave1}" dur="7s" repeatCount="indefinite"/>
    </path>
    <g>
      <path d="M 300 88 L 540 128 M 660 130 L 940 86" stroke="${t.muted}" stroke-opacity=".65" stroke-width="1.1">
        <animate attributeName="d" values="M 300 88 L 540 128 M 660 130 L 940 86;M 300 126 L 540 90 M 660 86 L 940 128;M 300 88 L 540 128 M 660 130 L 940 86" dur="7s" repeatCount="indefinite"/>
      </path>
      <circle cx="300" cy="88" r="3.4" fill="${t.bg1}" stroke="${t.muted}" stroke-width="1.1">
        <animate attributeName="cy" values="88;126;88" dur="7s" repeatCount="indefinite"/>
      </circle>
      <circle cx="540" cy="128" r="3.4" fill="${t.bg1}" stroke="${t.muted}" stroke-width="1.1">
        <animate attributeName="cy" values="128;90;128" dur="7s" repeatCount="indefinite"/>
      </circle>
      <circle cx="660" cy="130" r="3.4" fill="${t.bg1}" stroke="${t.muted}" stroke-width="1.1">
        <animate attributeName="cy" values="130;86;130" dur="7s" repeatCount="indefinite"/>
      </circle>
      <circle cx="940" cy="86" r="3.4" fill="${t.bg1}" stroke="${t.muted}" stroke-width="1.1">
        <animate attributeName="cy" values="86;128;86" dur="7s" repeatCount="indefinite"/>
      </circle>
      ${anchor(t, 420, 108, 9, t.bg1)} ${anchor(t, 800, 108, 9, t.bg1)}
    </g>
  </g>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="17.5" fill="none" stroke="${t.edge}" stroke-opacity="${t.edgeO}"/>

  <!-- Cabecera: lema y dominio -->
  <text x="${X}" y="46" class="display" font-size="27" letter-spacing="-.4" fill="${t.ink}">${esc(C.motto)}</text>
  <text x="${W - X}" y="46" text-anchor="end" class="mono" font-size="15" fill="${t.muted}">${C.site}</text>

  <!-- Línea de código escribiéndose en vivo con cursor en movimiento -->
  <text x="${X}" y="78" class="mono" font-size="13" fill="${t.accent}">&gt;</text>
  <g clip-path="url(#footerType)" class="mono" font-size="13">
    <text x="${codeStartX}" y="78" fill="${t.ink}">
      <tspan fill="${t.accent}">const</tspan> build = ({ ui: <tspan fill="${t.accentSoft}">"Figma"</tspan>, web: <tspan fill="${t.accentSoft}">"React"</tspan>, api: <tspan fill="${t.accentSoft}">".NET"</tspan> }) <tspan fill="${t.accent}">=&gt;</tspan> deploy();
    </text>
  </g>
  <rect x="${codeStartX + typedW + 3}" y="65" width="7.5" height="15" rx="1.5" fill="${t.accent}" class="blink">
    <animate attributeName="x" values="${codeStartX};${r1(codeStartX + typedW + 3)};${r1(codeStartX + typedW + 3)};${codeStartX};${codeStartX}" keyTimes="0;0.55;0.82;0.95;1" dur="7.5s" repeatCount="indefinite"/>
  </rect>
</svg>
`;
}

// ---------------------------------------------------------------------------
const OUTPUTS = [
  ['jose-banner', banner, ['display', 'text', 'mono']],
  ['jose-footer', footer, ['display', 'mono']],
];
for (const t of Object.values(THEMES)) {
  for (const [name, fn, keys] of OUTPUTS) {
    const file = path.join(root, `${name}${t.suffix}.svg`);
    const svg = fn(t, await fontFaces(keys));
    fs.writeFileSync(file, svg);
    console.log(`✓ ${path.relative(root, file)}  ${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB`);
  }
}
