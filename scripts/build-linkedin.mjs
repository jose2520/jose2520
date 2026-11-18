// Genera el banner de LinkedIn (1584x396) en ../linkedin/
//   linkedin-banner.svg        (tema oscuro, rojo carmesí)
//   linkedin-banner-light.svg  (tema claro, lila)
//
//   cd scripts && node build-linkedin.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as fontkit from 'fontkit';
import subsetFont from 'subset-font';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(here, '..', 'linkedin');
const fontFile = (pkg, file) => path.join(here, 'node_modules/@fontsource', pkg, 'files', file);

const C = {
  prompt: 'jose.dev@full-stack:~$',
  cmd: 'whoami',
  tag: 'Jose.dev',
  name: 'Jose Del Carmen Díaz',
  role1: 'Desarrollador Full-Stack y Mobile',
  role2: 'Diseñador UI/UX',
  location: 'Barranquilla, Colombia',
  site: 'jose2520.github.io',
  motto: 'Algoritmo y diseño en perfecta simetría.',
};

const PALETTES = {
  dark: {
    bg1: '#0C0609', bg2: '#040407', dot: '#FFFFFF', dotO: 0.06,
    ink: '#F7F4F2', muted: '#A6A0AC', faint: '#5E5866',
    accent: '#FF2A44', accentBright: '#FF7A8A', accentHot: '#FFD5DA', glowO: 0.34,
    selFillO: 0.04, pillFillO: 0.065,
    coreIn: '#220E15', coreOut: '#090508',
    board: '#141117',
  },
  light: {
    bg1: '#FAF7FF', bg2: '#EFE6FD', dot: '#231934', dotO: 0.08,
    ink: '#171222', muted: '#5E546E', faint: '#A79EB8',
    accent: '#7C3AED', accentBright: '#A78BFA', accentHot: '#FFFFFF', glowO: 0.22,
    selFillO: 0.045, pillFillO: 0.07,
    coreIn: '#FFFFFF', coreOut: '#EDE3FE',
    board: '#FFFFFF',
  },
};

const FONTS = {
  display: { family: 'JD Display', weight: 800, file: fontFile('bricolage-grotesque', 'bricolage-grotesque-latin-800-normal.woff2') },
  text: { family: 'JD Text', weight: 500, file: fontFile('bricolage-grotesque', 'bricolage-grotesque-latin-500-normal.woff2') },
  mono: { family: 'JD Mono', weight: 500, file: fontFile('geist-mono', 'geist-mono-latin-500-normal.woff2') },
};
for (const f of Object.values(FONTS)) f.kit = fontkit.openSync(f.file);
const measure = (font, text, size, ls = 0) =>
  (FONTS[font].kit.layout(text).advanceWidth / FONTS[font].kit.unitsPerEm) * size + ls * text.length;

const chars = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join('') + 'áéíóúÁÉÍÓÚñÑ·';
async function fontFaces() {
  const css = [];
  for (const f of Object.values(FONTS)) {
    const buf = await subsetFont(fs.readFileSync(f.file), chars, { targetFormat: 'woff2' });
    css.push(`@font-face{font-family:'${f.family}';font-weight:${f.weight};src:url(data:font/woff2;base64,${buf.toString('base64')}) format('woff2');}`);
  }
  return css.join('\n');
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const r1 = (n) => Math.round(n * 10) / 10;

function banner(p, faces) {
  // Bloque de texto desplazado claramente hacia la derecha (X = 524)
  const W = 1584, H = 396, X = 524;
  const anchor = (x, y, s = 9) =>
    `<rect x="${r1(x - s / 2)}" y="${r1(y - s / 2)}" width="${s}" height="${s}" fill="${p.board}" stroke="${p.accent}" stroke-width="1.8"/>`;
  const node = (x, y, r = 3.4) =>
    `<g><circle cx="${x}" cy="${y}" r="${r1(r * 1.9)}" fill="${p.accent}" fill-opacity="0.22"/><circle cx="${x}" cy="${y}" r="${r}" fill="${p.accent}"/><circle cx="${x}" cy="${y}" r="${r1(r * 0.45)}" fill="${p.accentHot}"/></g>`;

  // Nombre con frame de selección estilo Figma
  const nameSize = 64, nameLs = -1.1, nameY = 178;
  const nameW = measure('display', C.name, nameSize, nameLs);
  const sel = { x: X - 14, y: nameY - 58, w: r1(nameW + 28), h: 74 };

  // Cápsula neón para ">_ Desarrollador Full-Stack y Mobile · Diseñador UI/UX"
  const roleSize = 23.5;
  const prefixW = measure('mono', '>_', 21);
  const roleText = `${C.role1} · ${C.role2}`;
  const roleW = measure('text', roleText, roleSize);
  const pillPadX = 22;
  const pill = {
    x: sel.x,
    y: sel.y + sel.h + 20,
    w: r1(Math.max(sel.w, prefixW + 14 + roleW + pillPadX * 2)),
    h: 46,
  };
  const roleStartX = r1(pill.x + (pill.w - (prefixW + 14 + roleW)) / 2);

  const promptW = measure('mono', C.prompt, 16);
  const cmdW = measure('mono', C.cmd, 16);
  const footSize = 13.8;
  const locW = measure('mono', C.location, footSize);
  const siteW = measure('mono', C.site, footSize);

  // Izquierda: Curva Bézier principal + curva armónica secundaria + plumilla
  const curve = 'M -20 306 C 72 112, 192 76, 268 168 S 344 312, 392 86';
  const curve2 = 'M -20 340 C 88 170, 194 120, 268 202 S 352 336, 404 144';

  // Derecha: Núcleo HUD </> y red de circuitos PCB
  const CX = 1432, CY = 186;

  // 60 marcas angulares estilo telemetría alrededor del HUD
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const a = (i * 6 * Math.PI) / 180;
    const major = i % 5 === 0;
    const rIn = major ? 110 : 113;
    const rOut = major ? 120 : 117.5;
    return `<line x1="${r1(CX + Math.cos(a) * rIn)}" y1="${r1(CY + Math.sin(a) * rIn)}" x2="${r1(CX + Math.cos(a) * rOut)}" y2="${r1(CY + Math.sin(a) * rOut)}" stroke="${p.accent}" stroke-width="${major ? 1.8 : 0.9}" opacity="${major ? 0.85 : 0.35}"/>`;
  }).join('');

  // Símbolo </> contorneado estilo neón
  const codeSymbolPaths = `
    <path d="M ${CX - 18} ${CY - 22} L ${CX - 44} ${CY} L ${CX - 18} ${CY + 22} L ${CX - 13} ${CY + 16} L ${CX - 32} ${CY} L ${CX - 13} ${CY - 16} Z"/>
    <path d="M ${CX + 18} ${CY - 22} L ${CX + 44} ${CY} L ${CX + 18} ${CY + 22} L ${CX + 13} ${CY + 16} L ${CX + 32} ${CY} L ${CX + 13} ${CY - 16} Z"/>
    <path d="M ${CX + 5} ${CY - 28} L ${CX + 13} ${CY - 26} L ${CX - 5} ${CY + 28} L ${CX - 13} ${CY + 26} Z"/>`;

  // Trazas PCB escalonadas calibradas para no tocar el bloque de texto (que termina en x = 1186)
  const tracesLeft = [
    `M ${CX - 92} ${CY - 96} L ${CX - 118} ${CY - 122} H ${CX - 178} L ${CX - 194} ${CY - 138} H ${CX - 232}`,
    `M ${CX - 114} ${CY - 70} H ${CX - 154} L ${CX - 172} ${CY - 88} H ${CX - 210}`,
    `M ${CX - 126} ${CY - 42} H ${CX - 172} L ${CX - 186} ${CY - 56} H ${CX - 218}`,
    `M ${CX - 132} ${CY - 14} H ${CX - 202}`,
    `M ${CX - 132} ${CY + 14} H ${CX - 166} L ${CX - 182} ${CY + 30} H ${CX - 214}`,
    `M ${CX - 124} ${CY + 44} H ${CX - 156} L ${CX - 174} ${CY + 62} H ${CX - 206}`,
    `M ${CX - 110} ${CY + 74} L ${CX - 134} ${CY + 98} H ${CX - 192}`,
    `M ${CX - 86} ${CY + 102} L ${CX - 114} ${CY + 130} H ${CX - 172}`,
  ];
  const tracesLeftEnds = [
    [CX - 232, CY - 138], [CX - 210, CY - 88], [CX - 218, CY - 56], [CX - 202, CY - 14],
    [CX - 214, CY + 30], [CX - 206, CY + 62], [CX - 192, CY + 98], [CX - 172, CY + 130],
  ];
  const tracesRight = [
    `M ${CX + 96} ${CY - 92} L ${CX + 116} ${CY - 112} H ${CX + 146}`,
    `M ${CX + 122} ${CY - 52} H ${CX + 150}`,
    `M ${CX + 132} ${CY - 10} H ${CX + 150}`,
    `M ${CX + 126} ${CY + 34} H ${CX + 150}`,
    `M ${CX + 106} ${CY + 78} L ${CX + 126} ${CY + 98} H ${CX + 146}`,
  ];
  const tracesRightEnds = [
    [CX + 146, CY - 112], [CX + 146, CY + 98],
  ];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <title>${esc(C.name)}: ${esc(C.role1)} · ${esc(C.role2)}</title>
  <style>
    ${faces}
    .display { font-family: 'JD Display', sans-serif; font-weight: 800; }
    .text    { font-family: 'JD Text', sans-serif; font-weight: 500; }
    .mono    { font-family: 'JD Mono', monospace; font-weight: 500; }
  </style>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.bg1}"/><stop offset="1" stop-color="${p.bg2}"/>
    </linearGradient>
    <radialGradient id="glow">
      <stop offset="0" stop-color="${p.accent}" stop-opacity="${p.glowO}"/>
      <stop offset="0.5" stop-color="${p.accent}" stop-opacity="${r1(p.glowO * 0.35)}"/>
      <stop offset="1" stop-color="${p.accent}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="coreGrad" cx="50%" cy="45%" r="55%">
      <stop offset="0" stop-color="${p.coreIn}"/>
      <stop offset="1" stop-color="${p.coreOut}"/>
    </radialGradient>
    <linearGradient id="traceGradL" gradientUnits="userSpaceOnUse" x1="${CX - 90}" y1="${CY}" x2="${CX - 240}" y2="${CY}">
      <stop offset="0" stop-color="${p.accent}" stop-opacity="0.92"/>
      <stop offset="0.65" stop-color="${p.accent}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${p.accent}" stop-opacity="0.22"/>
    </linearGradient>
    <linearGradient id="traceGradR" gradientUnits="userSpaceOnUse" x1="${CX + 90}" y1="${CY}" x2="${W}" y2="${CY}">
      <stop offset="0" stop-color="${p.accent}" stop-opacity="0.92"/>
      <stop offset="1" stop-color="${p.accent}" stop-opacity="0.28"/>
    </linearGradient>
    <pattern id="grid" width="22" height="22" patternUnits="userSpaceOnUse">
      <circle cx="11" cy="11" r="1.1" fill="${p.dot}" fill-opacity="${p.dotO}"/>
    </pattern>
    <filter id="neonGlow" x="-45%" y="-45%" width="190%" height="190%">
      <feGaussianBlur stdDeviation="6" result="b1"/>
      <feGaussianBlur stdDeviation="2.2" result="b2"/>
      <feMerge>
        <feMergeNode in="b1"/>
        <feMergeNode in="b2"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2.8" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Lienzo base -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <ellipse cx="${CX}" cy="${CY}" rx="370" ry="250" fill="url(#glow)"/>
  <ellipse cx="200" cy="315" rx="360" ry="205" fill="url(#glow)" opacity=".68"/>

  <!-- IZQUIERDA: Curva Bézier + curva armónica + manejadores y plumilla (Diseño UI/UX) -->
  <path d="${curve2}" fill="none" stroke="${p.accent}" stroke-width="1.3" stroke-dasharray="5 6" stroke-linecap="round" opacity=".32"/>
  <path d="${curve}" fill="none" stroke="${p.accent}" stroke-width="6.5" stroke-linecap="round" opacity=".2" filter="url(#neonGlow)"/>
  <path d="${curve}" fill="none" stroke="${p.accent}" stroke-width="3" stroke-linecap="round" opacity=".96"/>
  <g stroke="${p.faint}" stroke-width="1.2" stroke-dasharray="4 4">
    <line x1="268" y1="168" x2="192" y2="76"/><line x1="268" y1="168" x2="344" y2="260"/>
    <line x1="392" y1="86" x2="352" y2="172"/>
  </g>
  <circle cx="192" cy="76" r="4.8" fill="${p.accent}"/>
  <circle cx="344" cy="260" r="4.8" fill="${p.accent}"/>
  <circle cx="352" cy="172" r="4.8" fill="${p.accent}"/>
  ${anchor(268, 168)}${anchor(392, 86)}
  <!-- Plumilla vectorial dibujando el nodo superior -->
  <g transform="translate(392, 86)">
    <path d="M 14.9 -21.9 L 21.9 -14.9 L 35 -28 L 28 -35 Z" fill="${p.ink}"/>
    <path d="M 0 0 L 17 -5.7 L 21.9 -14.9 L 14.9 -21.9 L 5.7 -17 Z" fill="${p.ink}" stroke="${p.accent}" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M 0 0 L 7 -7" stroke="${p.bg1}" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="7.8" cy="-7.8" r="2" fill="${p.bg1}"/>
  </g>

  <!-- CENTRO-DERECHA: Identidad, cápsula de rol neón y pie (X = 524) -->
  <text x="${X}" y="98" class="mono" font-size="16" fill="${p.accent}">${esc(C.prompt)}</text>
  <text x="${r1(X + promptW + 10)}" y="98" class="mono" font-size="16" fill="${p.muted}">${C.cmd}</text>
  <rect x="${r1(X + promptW + 10 + cmdW + 6)}" y="84" width="8.5" height="17" fill="${p.accent}"/>

  <!-- Etiqueta de componente sobre la esquina derecha del frame -->
  <text x="${r1(sel.x + sel.w)}" y="${sel.y - 10}" class="mono" font-size="13" fill="${p.accentBright}" text-anchor="end">&lt;${C.tag} /&gt;</text>

  <!-- Frame de selección del nombre -->
  <rect x="${sel.x}" y="${sel.y}" width="${sel.w}" height="${sel.h}" fill="${p.accent}" fill-opacity="${p.selFillO}" stroke="${p.accent}" stroke-width="1.5"/>
  ${anchor(sel.x, sel.y, 8.5)}${anchor(sel.x + sel.w, sel.y, 8.5)}${anchor(sel.x, sel.y + sel.h, 8.5)}${anchor(sel.x + sel.w, sel.y + sel.h, 8.5)}
  <text x="${X}" y="${nameY}" class="display" font-size="${nameSize}" letter-spacing="${nameLs}" fill="${p.ink}">${esc(C.name)}</text>

  <!-- Cápsula neón con ">_ Desarrollador Full-Stack y Mobile · Diseñador UI/UX" -->
  <rect x="${pill.x}" y="${pill.y}" width="${pill.w}" height="${pill.h}" rx="${pill.h / 2}" fill="none" stroke="${p.accent}" stroke-width="2.4" opacity=".65" filter="url(#neonGlow)"/>
  <rect x="${pill.x}" y="${pill.y}" width="${pill.w}" height="${pill.h}" rx="${pill.h / 2}" fill="${p.accent}" fill-opacity="${p.pillFillO}" stroke="${p.accent}" stroke-width="1.6"/>
  <text x="${roleStartX}" y="${pill.y + 30}" class="mono" font-size="21" fill="${p.accent}" filter="url(#softGlow)">&gt;_</text>
  <text x="${r1(roleStartX + prefixW + 14)}" y="${pill.y + 31}" class="text" font-size="${roleSize}" fill="${p.ink}">${esc(C.role1)} <tspan fill="${p.accent}">·</tspan> ${esc(C.role2)}</text>

  <!-- Pie alineado al bloque de texto -->
  <circle cx="${sel.x + 5}" cy="${H - 46}" r="4.2" fill="${p.accent}"/>
  <text x="${sel.x + 17}" y="${H - 41}" class="mono" font-size="${footSize}" fill="${p.muted}">${esc(C.location)}</text>
  <text x="${r1(sel.x + 17 + locW + 12)}" y="${H - 41}" class="mono" font-size="${footSize}" fill="${p.faint}">·</text>
  <text x="${r1(sel.x + 17 + locW + 24)}" y="${H - 41}" class="mono" font-size="${footSize}" fill="${p.accent}">${esc(C.site)}</text>
  <text x="${r1(sel.x + 17 + locW + 24 + siteW + 12)}" y="${H - 41}" class="mono" font-size="${footSize}" fill="${p.faint}">·</text>
  <text x="${r1(sel.x + 17 + locW + 24 + siteW + 24)}" y="${H - 41}" class="mono" font-size="${footSize}" fill="${p.muted}">${esc(C.motto)}</text>

  <!-- DERECHA: Núcleo HUD </> y red de circuitos PCB (Código y tecnología) -->
  <g fill="none" stroke="url(#traceGradL)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    ${tracesLeft.map((d) => `<path d="${d}"/>`).join('\n    ')}
  </g>
  <g fill="none" stroke="url(#traceGradR)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    ${tracesRight.map((d) => `<path d="${d}"/>`).join('\n    ')}
  </g>

  <!-- Pulsos de energía brillantes sobre las trazas -->
  <g stroke="${p.accentBright}" stroke-width="2.6" stroke-linecap="round" filter="url(#softGlow)">
    <line x1="${CX - 168}" y1="${CY - 122}" x2="${CX - 134}" y2="${CY - 122}"/>
    <line x1="${CX - 166}" y1="${CY - 42}" x2="${CX - 136}" y2="${CY - 42}"/>
    <line x1="${CX - 184}" y1="${CY - 14}" x2="${CX - 148}" y2="${CY - 14}"/>
    <line x1="${CX - 162}" y1="${CY + 14}" x2="${CX - 136}" y2="${CY + 14}"/>
    <line x1="${CX - 176}" y1="${CY + 98}" x2="${CX - 144}" y2="${CY + 98}"/>
  </g>

  <!-- Nodos luminosos en cada extremo y vértice de circuito -->
  ${tracesLeftEnds.map(([x, y]) => node(x, y, 3.5)).join('')}
  ${tracesRightEnds.map(([x, y]) => node(x, y, 3.5)).join('')}
  <g fill="${p.accent}">
    <circle cx="${CX - 154}" cy="${CY - 70}" r="2.5"/>
    <circle cx="${CX - 172}" cy="${CY - 42}" r="2.5"/>
    <circle cx="${CX - 166}" cy="${CY + 14}" r="2.5"/>
    <circle cx="${CX - 156}" cy="${CY + 44}" r="2.5"/>
  </g>

  <!-- Anillos concéntricos del reactor / HUD tecnológico -->
  <circle cx="${CX}" cy="${CY}" r="134" fill="none" stroke="${p.accent}" stroke-width="1" opacity=".24"/>
  <circle cx="${CX}" cy="${CY}" r="134" fill="none" stroke="${p.accent}" stroke-width="2.2" stroke-dasharray="45 165" stroke-dashoffset="20" stroke-linecap="round" opacity=".75"/>
  ${ticks}
  <!-- Anillo de potencia segmentado con resplandor neón -->
  <circle cx="${CX}" cy="${CY}" r="102" fill="none" stroke="${p.accent}" stroke-width="3.6" stroke-dasharray="68 20 18 20 42 20" stroke-linecap="round" filter="url(#neonGlow)"/>
  <circle cx="${CX}" cy="${CY}" r="102" fill="none" stroke="${p.accentHot}" stroke-width="1.2" stroke-dasharray="68 20 18 20 42 20" stroke-linecap="round" opacity=".7"/>
  <!-- Anillos técnicos intermedios -->
  <circle cx="${CX}" cy="${CY}" r="88" fill="none" stroke="${p.accentBright}" stroke-width="1.4" stroke-dasharray="8 10" opacity=".7"/>
  <circle cx="${CX}" cy="${CY}" r="78" fill="none" stroke="${p.accent}" stroke-width="1.8" stroke-dasharray="110 70" stroke-dashoffset="40" opacity=".8"/>

  <!-- Disco central con gradiente profundo y doble aro luminoso -->
  <circle cx="${CX}" cy="${CY}" r="66" fill="url(#coreGrad)" stroke="${p.accent}" stroke-width="2.4" filter="url(#softGlow)"/>
  <circle cx="${CX}" cy="${CY}" r="58" fill="none" stroke="${p.accentBright}" stroke-width="1" stroke-dasharray="4 6" opacity=".5"/>

  <!-- Símbolo </> contorneado estilo neón en el núcleo -->
  <g fill="${p.accent}" fill-opacity="0.28" stroke="${p.accent}" stroke-width="3" stroke-linejoin="round" filter="url(#neonGlow)">
    ${codeSymbolPaths}
  </g>
  <g fill="none" stroke="${p.accentHot}" stroke-width="1.7" stroke-linejoin="round">
    ${codeSymbolPaths}
  </g>
</svg>
`;
}

fs.mkdirSync(outDir, { recursive: true });
const faces = await fontFaces();
for (const [suffix, p] of [['', PALETTES.dark], ['-light', PALETTES.light]]) {
  const file = path.join(outDir, `linkedin-banner${suffix}.svg`);
  fs.writeFileSync(file, banner(p, faces));
  console.log(`✓ linkedin/linkedin-banner${suffix}.svg`);
}
