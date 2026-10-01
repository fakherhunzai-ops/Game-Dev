import type { Category, Tone } from '../engine/types';
import { NPC_DEFS } from '../content/npcs';
import { portrait, type Expression } from './avatars';

/**
 * PROCEDURAL SCENE ILLUSTRATIONS
 *
 * Every environment in the game is vector geometry composed at runtime: rooms,
 * streets, hospitals, airports, charts, and the two or three people standing in
 * them. The result is a game with a real visual identity that ships zero image
 * assets, works entirely offline, and stays sharp on every screen density.
 */

const W = 320;
const H = 200;

/* ------------------------------------------------------------- primitives */

const rect = (x: number, y: number, w: number, h: number, fill: string, r = 0, opacity = 1): string =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${opacity !== 1 ? `opacity="${opacity}"` : ''}/>`;

const circle = (cx: number, cy: number, r: number, fill: string, opacity = 1): string =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${opacity !== 1 ? `opacity="${opacity}"` : ''}/>`;

const path = (d: string, fill: string, opacity = 1): string =>
  `<path d="${d}" fill="${fill}" ${opacity !== 1 ? `opacity="${opacity}"` : ''}/>`;

const stroke = (d: string, c: string, width = 2, opts = ''): string =>
  `<path d="${d}" fill="none" stroke="${c}" stroke-width="${width}" stroke-linecap="round" ${opts}/>`;

/** Layered window showing a city at night. */
const cityWindow = (x: number, y: number, w: number, h: number): string => {
  let buildings = '';
  let bx = x - 4;
  const heights = [0.42, 0.66, 0.5, 0.78, 0.36, 0.6];
  let i = 0;
  while (bx < x + w) {
    const bw = 14 + ((i * 7) % 12);
    const bh = h * (heights[i % heights.length] ?? 0.5);
    buildings += rect(bx, y + h - bh, bw, bh, '#0e1428');
    for (let wy = y + h - bh + 6; wy < y + h - 6; wy += 11) {
      for (let wx = bx + 4; wx < bx + bw - 4; wx += 8) {
        if ((wx + wy) % 3 === 0) buildings += rect(wx, wy, 3, 4, '#f5d98a', 1, 0.75);
      }
    }
    bx += bw + 4;
    i += 1;
  }
  return `<g>${rect(x, y, w, h, '#101832')}${buildings}${rect(x, y, w, h, '#0b0912', 0, 0.25)}
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#3a3255" stroke-width="4"/>
    ${stroke(`M${x + w / 2} ${y} v${h}`, '#3a3255', 3)}${stroke(`M${x} ${y + h / 2} h${w}`, '#3a3255', 3)}</g>`;
};

/** A person, drawn from the same system as the portraits. */
function person(npcId: string | null | undefined, x: number, y: number, scale: number, expr: Expression, flip = false): string {
  const def = NPC_DEFS.find((n) => n.id === npcId);
  if (!def) return '';
  const p = def.palette;
  const s = scale;
  const body = `
    ${path(`M-26 60 q6 -30 26 -30 q20 0 26 30 z`, p.outfit)}
    ${path(`M-10 34 q10 -6 20 0 l0 6 q-10 -5 -20 0 z`, p.accent, 0.9)}
    ${rect(-7, 20, 14, 14, p.skin, 6)}
    <ellipse cx="0" cy="4" rx="17" ry="19" fill="${p.skin}"/>
    ${hairShape(def.hairStyle, p.hair)}
    ${faceMarks(expr)}
  `;
  return `<g transform="translate(${x} ${y}) scale(${s}) ${flip ? 'scale(-1 1)' : ''}">${body}</g>`;
}

function hairShape(style: string, colour: string): string {
  switch (style) {
    case 'long':
      return `${path(`M-19 10 q-2 -24 20 -24 q22 0 20 24 l-2 18 h-6 l2 -20 q-6 7 -14 7 q-8 0 -14 -7 l2 20 h-6 z`, colour)}`;
    case 'bun':
      return `${circle(0, -22, 6, colour)}${path(`M-19 8 q0 -22 20 -22 q20 0 20 22 l-3 -5 q-6 -7 -17 -7 q-11 0 -17 7 z`, colour)}`;
    case 'curls':
      return `<g fill="${colour}"><circle cx="-13" cy="-8" r="7"/><circle cx="-5" cy="-15" r="8"/><circle cx="6" cy="-16" r="8"/><circle cx="14" cy="-7" r="7"/><circle cx="-17" cy="2" r="6"/><circle cx="17" cy="1" r="6"/></g>`;
    case 'bald':
      return `${path(`M-17 6 q1 -18 17 -18 q16 0 17 18 q-8 -7 -17 -7 q-9 0 -17 7 z`, colour, 0.7)}`;
    case 'bob':
      return `${path(`M-19 12 q0 -24 20 -24 q20 0 20 24 l-3 12 h-5 l1 -16 q-7 6 -14 6 q-7 0 -14 -6 l1 16 h-5 z`, colour)}`;
    case 'locs':
      return `<g fill="${colour}">${path(`M-18 6 q0 -20 18 -20 q18 0 18 20 q-8 -7 -18 -7 q-10 0 -18 7 z`, colour)}${rect(-20, 4, 5, 22, colour, 2)}${rect(15, 4, 5, 22, colour, 2)}${rect(-12, 8, 4, 14, colour, 2)}${rect(8, 8, 4, 14, colour, 2)}</g>`;
    default:
      return `${path(`M-18 8 q0 -22 18 -22 q18 0 18 22 q-7 -7 -18 -7 q-11 0 -18 7 z`, colour)}`;
  }
}

function faceMarks(expr: Expression): string {
  const ink = '#181026';
  const eye = (cx: number): string => {
    if (expr === 'shock') return `${circle(cx, 6, 3.4, '#fff')}${circle(cx, 6.4, 1.8, ink)}`;
    if (expr === 'happy' || expr === 'smug') return stroke(`M${cx - 4} 6 q4 -4 8 0`, ink, 1.8);
    return circle(cx, 6, 2, ink);
  };
  const mouth =
    expr === 'happy'
      ? stroke('M-5 13 q5 5 10 0', '#8d3d52', 1.8)
      : expr === 'worried' || expr === 'sad'
        ? stroke('M-5 15 q5 -4 10 0', '#8d3d52', 1.8)
        : expr === 'angry'
          ? stroke('M-5 15 q5 -4 10 0', '#8d3d52', 2.2)
          : stroke('M-4 14 q4 2 8 0', '#8d3d52', 1.6);
  const brows =
    expr === 'angry'
      ? `${stroke('M-9 1 l8 3', ink, 2)}${stroke('M9 1 l-8 3', ink, 2)}`
      : expr === 'worried'
        ? `${stroke('M-9 0 l8 -3', ink, 2)}${stroke('M9 0 l-8 -3', ink, 2)}`
        : `${stroke('M-9 0 q4 -3 8 -1', ink, 1.8)}${stroke('M9 0 q-4 -3 -8 -1', ink, 1.8)}`;
  return `${brows}${eye(-7)}${eye(7)}${mouth}`;
}

/* ------------------------------------------------------------ environments */

type EnvArgs = [tone: Tone, a?: string | null, b?: string | null, expr?: Expression];
type Env = (...args: EnvArgs) => string;

const bg = (top: string, bottom: string): string =>
  `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
     <stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/>
   </linearGradient></defs>${rect(0, 0, W, H, 'url(#sky)')}`;

const floor = (y: number, c: string): string => rect(0, y, W, H - y, c);

const office: Env = (tone, a, _b, expr) =>
  bg('#1a1730', '#0f0d1c') +
  floor(142, '#141126') +
  cityWindow(196, 22, 96, 62) +
  rect(20, 96, 124, 8, '#4a4266', 3) +
  rect(28, 104, 8, 40, '#3a3352') +
  rect(128, 104, 8, 40, '#3a3352') +
  rect(48, 62, 54, 34, '#0f1428', 4) +
  rect(52, 66, 46, 26, toneColour(tone), 3, 0.35) +
  rect(74, 96, 6, 8, '#3a3352') +
  rect(62, 104, 26, 4, '#3a3352', 2) +
  person(a ?? 'priya', 232, 106, 0.86, expr ?? 'neutral') +
  rect(258, 30, 44, 30, '#241e3d', 3) +
  stroke('M264 48 l8 -8 l7 5 l9 -12 l8 8', '#3ec9a7', 2);

const meetingRoom: Env = (_tone, a, b, expr) =>
  bg('#171430', '#0e0c1a') +
  floor(150, '#131125') +
  rect(40, 34, 150, 58, '#e8e4f0', 4, 0.9) +
  stroke('M54 76 l22 -20 l18 12 l24 -26 l22 14 l20 -18', '#6c8bff', 2.6) +
  rect(206, 46, 82, 46, '#1c2440', 3) +
  rect(212, 52, 30, 34, '#2a3454', 2) +
  rect(248, 52, 30, 34, '#2a3454', 2) +
  path('M130 128 q30 -14 60 0 q30 14 60 0 l0 20 q-30 14 -60 0 q-30 -14 -60 0 z', '#3a3352') +
  person(a ?? 'boss_gary', 74, 118, 0.92, expr ?? 'neutral') +
  person(b ?? 'priya', 246, 118, 0.86, 'worried', true) +
  rect(140, 100, 42, 26, '#241e3d', 3) +
  stroke('M146 112 h30 M146 118 h20', '#6c8bff', 2);

const hrRoom: Env = (_tone, a, b, expr) =>
  bg('#1b1630', '#100d1e') +
  floor(150, '#15122a') +
  rect(96, 40, 128, 54, '#e8e4f0', 3, 0.85) +
  stroke('M108 80 h100 M108 70 h78 M108 60 h92', '#c2bcd4', 3) +
  path('M96 128 h140 l-14 22 h-112 z', '#4a3f66') +
  rect(150, 96, 44, 30, '#241e3d', 3) +
  person(a ?? 'boss_gary', 60, 112, 0.94, expr ?? 'angry') +
  person(b ?? 'priya', 262, 112, 0.9, 'worried', true);

const cafe: Env = (_tone, a, _b, expr) =>
  bg('#241c2e', '#141020') +
  floor(146, '#1b1524') +
  rect(0, 26, W, 46, '#3a2a22') +
  circle(56, 44, 10, '#e8d3b8', 0.9) +
  circle(58, 44, 6, '#5a3a22') +
  circle(96, 46, 9, '#e8d3b8', 0.85) +
  rect(140, 34, 60, 34, '#f0e6d2', 3, 0.16) +
  rect(30, 100, 110, 10, '#5a4436', 3) +
  rect(40, 110, 8, 36, '#4a3528') +
  rect(122, 110, 8, 36, '#4a3528') +
  person(a ?? 'jess', 226, 106, 0.92, expr ?? 'happy') +
  circle(196, 122, 7, '#f0e6d2') + circle(196, 122, 4, '#6b4a2c');

const bar: Env = (_tone, a, b, expr) =>
  bg('#1a1230', '#0c0918') +
  floor(150, '#141026') +
  rect(0, 22, W, 54, '#241a38') +
  rect(28, 30, 12, 32, '#f5b83d', 2, 0.8) +
  rect(46, 36, 12, 26, '#6c8bff', 2, 0.7) +
  rect(64, 28, 12, 34, '#3ec9a7', 2, 0.7) +
  rect(84, 34, 12, 28, '#ff5c8a', 2, 0.7) +
  circle(250, 54, 26, '#c56cff', 0.18) +
  stroke('M234 54 h32 M250 38 v32', '#c56cff', 2, 'opacity="0.4"') +
  rect(0, 132, W, 10, '#3a2a44', 0) +
  person(a ?? 'jess', 80, 112, 0.94, expr ?? 'happy') +
  person(b ?? 'chad', 246, 112, 0.9, 'smug', true);

const apartment: Env = (_tone, a, _b, expr) =>
  bg('#1c1834', '#100e20') +
  floor(150, '#161330') +
  cityWindow(24, 24, 108, 72) +
  rect(168, 96, 122, 40, '#3a3358', 8) +
  rect(176, 86, 44, 12, '#4a4270', 5) +
  rect(228, 86, 44, 12, '#4a4270', 5) +
  rect(196, 136, 8, 16, '#241e3d') +
  rect(268, 136, 8, 16, '#241e3d') +
  circle(290, 44, 14, '#f5b83d', 0.55) +
  rect(282, 60, 16, 8, '#3a3358') +
  person(a ?? 'jess', 118, 110, 0.9, expr ?? 'neutral');

const houseExterior: Env = (_tone, a, _b, expr) =>
  bg('#1b2340', '#0e1220') +
  circle(268, 40, 20, '#f5e3a8', 0.5) +
  rect(0, 140, W, H - 140, '#141a2e') +
  path('M60 140 l0 -62 l70 -48 l70 48 l0 62 z', '#3a3050') +
  path('M52 92 l78 -56 l78 56 z', '#5a3a44') +
  rect(96, 100, 34, 32, '#f5d98a', 2, 0.7) +
  rect(148, 100, 34, 32, '#f5d98a', 2, 0.6) +
  rect(116, 118, 26, 22, '#3a2a2a') +
  stroke('M40 140 h240', '#241e3d', 3) +
  circle(196, 142, 16, '#2f5a3a') +
  circle(196, 144, 6, '#3a2a1a') +
  person(a ?? 'marcus', 262, 108, 0.86, expr ?? 'happy');

const hospital: Env = (_tone, a, _b, expr) =>
  bg('#152030', '#0c131e') +
  floor(148, '#111a26') +
  rect(24, 104, 130, 40, '#e8eef5', 6, 0.92) +
  rect(32, 96, 44, 12, '#d6e0ea', 4) +
  rect(88, 96, 58, 12, '#d6e0ea', 4) +
  stroke('M40 122 h100', '#c2ccd8', 3) +
  rect(188, 44, 12, 44, '#ff5f6d', 2, 0.85) +
  rect(172, 60, 44, 12, '#ff5f6d', 2, 0.85) +
  rect(232, 100, 60, 44, '#1c2838', 3) +
  person(a ?? 'mum', 148, 112, 0.9, expr ?? 'worried');

const clinic: Env = (_tone, a, _b, expr) =>
  bg('#16283a', '#0d1622') +
  floor(150, '#121c28') +
  rect(30, 60, 120, 58, '#e8eef5', 4, 0.9) +
  stroke('M42 82 h96 M42 96 h70', '#b8c4d0', 3) +
  circle(238, 62, 22, '#3ec9a7', 0.2) +
  stroke('M238 50 v24 M226 62 h24', '#3ec9a7', 3.4) +
  rect(206, 104, 92, 40, '#1c2634', 4) +
  person(a ?? 'jess', 106, 112, 0.9, expr ?? 'neutral');

const gym: Env = (_tone, a, _b, expr) =>
  bg('#131c30', '#0b101c') +
  floor(148, '#101725') +
  stroke('M0 148 h320', '#2a3a52', 3) +
  rect(30, 112, 86, 10, '#2a3a52', 5) +
  rect(46, 100, 10, 34, '#1c2838', 4) +
  rect(90, 100, 10, 34, '#1c2838', 4) +
  rect(206, 44, 76, 44, '#101828', 3) +
  stroke('M214 72 l14 -12 l12 8 l16 -18 l14 10', '#6c8bff', 2.4) +
  person(a ?? 'jess', 210, 110, 0.9, expr ?? 'happy');

const street: Env = (_tone, a, _b, expr) =>
  bg('#1a1430', '#0c0a18') +
  rect(0, 118, W, H - 118, '#141126') +
  rect(0, 70, 60, 48, '#221b3c') +
  rect(64, 48, 48, 70, '#1c1734') +
  rect(116, 84, 54, 34, '#221b3c') +
  rect(176, 58, 44, 60, '#1c1734') +
  rect(224, 76, 40, 42, '#221b3c') +
  [22, 46, 78, 128, 150, 190, 240].map((x) => rect(x, 84, 7, 9, '#f5d98a', 1, 0.55)).join('') +
  stroke('M0 128 h320', '#3a3352', 2, 'stroke-dasharray="14 10"') +
  rect(276, 92, 4, 34, '#3a3352') +
  circle(278, 88, 6, '#f5b83d', 0.6) +
  person(a ?? 'chad', 152, 108, 0.94, expr ?? 'neutral');

const airport: Env = (_tone, a, _b, expr) =>
  bg('#16203c', '#0b1120') +
  floor(146, '#101728') +
  path('M-10 92 l210 -34 l0 12 l-160 40 z', '#c8d3e8', 0.35) +
  rect(226, 40, 74, 62, '#1c2440', 3) +
  stroke('M238 60 h50 M238 72 h34', '#6c8bff', 2.6) +
  rect(236, 84, 54, 8, '#3a3352', 3) +
  rect(28, 106, 52, 32, '#3a3352', 6) +
  stroke('M40 122 h28', '#7d7499', 3) +
  person(a ?? 'jess', 158, 106, 0.94, expr ?? 'neutral');

const planeWindow: Env = (_tone, a, _b, expr) =>
  bg('#0f1830', '#08101e') +
  circle(160, 96, 82, '#0b1226') +
  circle(160, 96, 74, '#12203c') +
  circle(150, 82, 8, '#1a2a4a') +
  circle(172, 84, 5, '#1a2a4a') +
  path('M80 150 q80 -20 160 0 z', '#0d1424') +
  rect(20, 30, 280, 4, '#1c2440', 2) +
  person(a ?? 'jess', 256, 112, 0.8, expr ?? 'happy');

const beach: Env = (_tone, a, _b, expr) =>
  bg('#1f3a5a', '#0d1e30') +
  circle(262, 40, 22, '#f5d98a', 0.75) +
  rect(0, 110, W, 34, '#2a5a72') +
  path('M0 112 q40 -6 80 0 q40 6 80 0 q40 -6 80 0 q40 6 80 0 v34 h-320 z', '#2f6a84') +
  rect(0, 140, W, H - 140, '#c9a86a') +
  circle(160, 152, 30, '#e0bd7c', 0.7) +
  path('M74 140 q-30 -8 -34 6 q26 8 34 -6 z', '#2f5a3a') +
  path('M74 140 q30 -8 34 6 q-26 8 -34 -6 z', '#2f5a3a') +
  rect(72, 140, 5, 36, '#3a2a1a') +
  person(a ?? 'jess', 244, 118, 0.84, expr ?? 'happy');

const mountain: Env = (_tone, a, _b, expr) =>
  bg('#1b2440', '#0d1424') +
  path('M-20 150 l90 -80 l70 62 l60 -52 l110 70 z', '#1c2440') +
  path('M-20 160 l70 -56 l60 50 l80 -62 l130 68 z', '#151c32') +
  circle(258, 38, 16, '#f5e3a8', 0.6) +
  stroke('M0 150 h320', '#3a3352', 2, 'stroke-dasharray="18 12"') +
  person(a ?? 'chad', 128, 118, 0.88, expr ?? 'happy');

const wedding: Env = (_tone, a, b, expr) =>
  bg('#241c44', '#100c1e') +
  floor(150, '#181430') +
  stroke('M92 150 v-92 q40 -34 80 0 v92', '#c9a86a', 5) +
  circle(132, 62, 5, '#ff5c8a') +
  circle(100, 78, 4, '#f5b83d') +
  circle(164, 74, 4, '#c56cff') +
  path('M200 66 c-10 -12 -24 -3 -16 7 l16 14 l16 -14 c8 -10 -6 -19 -16 -7 z', '#ff5c8a', 0.9) +
  person(a ?? 'alex', 108, 116, 0.92, expr ?? 'happy') +
  person(b ?? 'alex', 210, 116, 0.92, 'happy', true);

const dinnerForTwo: Env = (_tone, a, b, expr) =>
  bg('#221830', '#0f0b18') +
  floor(150, '#1a1426') +
  circle(160, 44, 24, '#f5b83d', 0.14) +
  rect(60, 108, 200, 10, '#4a3a52', 4) +
  circle(160, 108, 12, '#f0e6d2') +
  stroke('M160 92 v-14', '#f5b83d', 2.6) +
  circle(160, 90, 4, '#f5b83d', 0.8) +
  person(a ?? 'alex', 96, 106, 0.92, expr ?? 'happy') +
  person(b ?? 'nora', 226, 106, 0.92, 'happy', true);

const startup: Env = (_tone, a, _b, expr) =>
  bg('#111a34', '#0a1020') +
  floor(150, '#0e1526') +
  rect(28, 44, 96, 60, '#0f1830', 3) +
  stroke('M38 92 l18 -16 l14 10 l18 -22 l16 12', '#3ec9a7', 2.6) +
  rect(138, 56, 74, 48, '#0f1830', 3) +
  stroke('M148 92 l14 -20 l12 10 l14 -22 l14 14', '#6c8bff', 2.4) +
  rect(226, 66, 72, 40, '#0f1830', 3) +
  stroke('M236 92 h52 M236 84 h34', '#c56cff', 2.2) +
  rect(20, 110, 280, 8, '#2a3a52', 3) +
  person(a ?? 'chad', 92, 116, 0.86, expr ?? 'smug');

const storefront: Env = (_tone, a, _b, expr) =>
  bg('#1e1a34', '#0d0b18') +
  floor(148, '#151228') +
  rect(28, 46, 264, 88, '#241e3d', 5) +
  rect(40, 58, 72, 50, '#f5d98a', 3, 0.35) +
  rect(120, 58, 72, 50, '#3ec9a7', 3, 0.3) +
  rect(200, 58, 80, 50, '#6c8bff', 3, 0.3) +
  rect(28, 34, 264, 14, '#3a3352', 4) +
  stroke('M36 41 h250', '#c9a86a', 3) +
  circle(160, 118, 10, '#c9a86a', 0.8) +
  person(a ?? 'marcus', 276, 122, 0.72, expr ?? 'happy', true);

const warehouse: Env = (_tone, a, _b, expr) =>
  bg('#1a1a2c', '#0c0c18') +
  floor(150, '#131320') +
  rect(30, 96, 54, 54, '#5a4436', 3) +
  rect(30, 96, 54, 8, '#7a5c46', 2) +
  rect(96, 84, 54, 66, '#5a4436', 3) +
  rect(96, 84, 54, 8, '#7a5c46', 2) +
  rect(200, 70, 76, 80, '#3a3352', 3) +
  stroke('M34 116 h46 M100 104 h46 M206 90 h64', '#7a5c46', 2) +
  person(a ?? 'chad', 268, 116, 0.8, expr ?? 'neutral');

const chartUp: Env = (_tone, a, _b, _expr) =>
  bg('#10261f', '#0a1614') +
  rect(24, 30, 272, 122, '#0e1c1a', 6, 0.9) +
  stroke('M40 132 h240', '#2a4a42', 2) +
  path('M40 128 l34 -16 l26 10 l34 -30 l26 14 l38 -38 l30 20 l24 -14 l0 62 l-212 0 z', '#3ec9a7', 0.16) +
  stroke('M40 128 l34 -16 l26 10 l34 -30 l26 14 l38 -38 l30 20 l24 -14', '#3ec9a7', 3) +
  circle(268, 66, 5, '#3ec9a7') +
  person(a ?? null, 0, 0, 0, 'neutral');

const chartDown: Env = (_tone, a, _b, _expr) =>
  bg('#2a1420', '#130a10') +
  rect(24, 30, 272, 122, '#200f18', 6, 0.9) +
  stroke('M40 48 h240', '#4a2434', 2) +
  path('M40 52 l30 22 l26 -12 l30 34 l26 -18 l34 40 l30 -16 l24 22', '#ff5f6d', 3) +
  rect(232, 118, 62, 24, '#3a1420', 4) +
  stroke('M244 130 h38', '#ff5f6d', 3) +
  person(a ?? null, 0, 0, 0, 'neutral');

const phoneSocial: Env = (_tone, a, _b, expr) =>
  bg('#1c1436', '#0c0918') +
  circle(160, 96, 70, '#c56cff', 0.08) +
  rect(126, 24, 68, 148, '#0f0b1c', 12, 0.98) +
  rect(132, 32, 56, 128, '#1a1430', 7) +
  circle(160, 50, 12, '#ff5c8a', 0.85) +
  stroke('M154 50 l6 6 l10 -12', '#fff', 2.4) +
  rect(140, 72, 40, 6, '#3a3352', 3) +
  rect(140, 84, 32, 6, '#3a3352', 3) +
  rect(140, 96, 40, 6, '#3a3352', 3) +
  [0, 1, 2].map((i) => circle(146 + i * 16, 118, 7, ['#ff5c8a', '#f5b83d', '#3ec9a7'][i], 0.7)).join('') +
  person(a ?? 'chad', 262, 112, 0.8, expr ?? 'smug', true);

const envelope: Env = (_tone, a, _b, _expr) =>
  bg('#1e1a30', '#0d0b18') +
  rect(78, 56, 164, 96, '#f0e6d2', 5, 0.94) +
  path('M78 58 l82 56 l82 -56', '#d8ccb4') +
  stroke('M78 58 l82 56 l82 -56', '#c2b498', 3) +
  stroke('M100 128 h60 M100 138 h44', '#b0a288', 3) +
  circle(252, 56, 16, '#c56cff', 0.3) +
  person(a ?? null, 0, 0, 0, 'neutral');

const clockScene: Env = (_tone, a, _b, _expr) =>
  bg('#1a1430', '#0b0918') +
  circle(160, 96, 62, '#241e3d') +
  circle(160, 96, 56, '#141026') +
  circle(160, 96, 3, '#c56cff') +
  stroke('M160 96 v-34', '#c56cff', 4) +
  stroke('M160 96 l24 16', '#c56cff', 3) +
  [0, 1, 2, 3].map((i) => {
    const ang = (i * Math.PI) / 2;
    return circle(160 + Math.sin(ang) * 48, 96 - Math.cos(ang) * 48, 2.6, '#7d7499');
  }).join('') +
  person(a ?? null, 0, 0, 0, 'neutral');

const celebration: Env = (_tone, a, b, expr) =>
  bg('#241c48', '#0f0c1e') +
  floor(150, '#181430') +
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((i) => {
    const colours = ['#ff5c8a', '#f5b83d', '#3ec9a7', '#6c8bff', '#c56cff'];
    const x = ((i * 53) % 300) + 8;
    const y = ((i * 37) % 100) + 14;
    return `<rect x="${x}" y="${y}" width="7" height="10" rx="2" fill="${colours[i % colours.length]}" transform="rotate(${(i * 41) % 180} ${x} ${y})" opacity="0.85"/>`;
  }).join('') +
  path('M120 150 l24 -34 l24 34 z', '#f5b83d', 0.75) +
  path('M80 150 l16 -22 l16 22 z', '#ff5c8a', 0.6) +
  person(a ?? 'jess', 232, 118, 0.9, expr ?? 'happy') +
  person(b ?? 'marcus', 68, 118, 0.9, 'happy');

const quiet: Env = (_tone, a, _b, expr) =>
  bg('#1a2438', '#0c1120') +
  floor(150, '#111828') +
  cityWindow(30, 30, 110, 66) +
  rect(176, 104, 118, 34, '#2a3450', 8) +
  rect(184, 96, 42, 10, '#3a4666', 5) +
  circle(286, 46, 16, '#f5b83d', 0.4) +
  person(a ?? 'jess', 250, 112, 0.86, expr ?? 'happy');

const grave: Env = (_tone, a, _b, _expr) =>
  bg('#20202e', '#0e0e16') +
  rect(0, 132, W, H - 132, '#1a1a26') +
  path('M128 132 v-56 q32 -26 64 0 v56 z', '#3a3a4c') +
  stroke('M144 96 h32 M144 106 h20', '#5a5a70', 3) +
  circle(240, 46, 18, '#c8d3e8', 0.25) +
  stroke('M40 132 q10 -6 20 0 q10 6 20 0', '#2a2a3a', 2) +
  person(a ?? null, 0, 0, 0, 'neutral');

const generic: Env = (tone, a, _b, expr) =>
  bg('#1c1834', '#0d0b1a') +
  floor(150, '#151228') +
  cityWindow(216, 28, 82, 58) +
  rect(24, 104, 100, 34, '#2a2444', 6) +
  circle(160, 60, 26, toneColour(tone), 0.12) +
  person(a ?? 'jess', 152, 116, 0.98, expr ?? 'neutral');

const disaster: Env = (_tone, _a, _b, _expr) =>
  bg('#2a1a24', '#120a10') +
  floor(150, '#1c1218') +
  path('M0 150 l40 -70 l30 40 l40 -60 l40 50 l40 -34 l40 44 l40 -26 l50 56 z', '#241420') +
  stroke('M40 70 l6 -14 M170 60 l-8 12', '#f5b83d', 3) +
  circle(58, 40, 20, '#c56cff', 0.22) +
  rect(196, 96, 100, 54, '#1c1218', 3) +
  stroke('M208 118 h76 M208 130 h50', '#3a2430', 3);

const blackCar: Env = (_tone, a, _b, _expr) =>
  bg('#141024', '#08060f') +
  floor(144, '#100c1c') +
  rect(0, 118, W, 6, '#1c1830') +
  path('M56 144 l8 -30 q6 -14 26 -16 l52 -2 q22 0 32 12 l20 12 q10 4 10 12 l0 12 z', '#1c1830') +
  path('M84 100 q18 -8 44 -8 l8 12 h-56 z', '#2a3454', 0.7) +
  circle(96, 146, 12, '#0d0b14') + circle(96, 146, 5, '#2a2444') +
  circle(180, 146, 12, '#0d0b14') + circle(180, 146, 5, '#2a2444') +
  circle(250, 40, 26, '#c9a86a', 0.18) +
  person(a ?? null, 0, 0, 0, 'neutral');

const oldPhoto: Env = (_tone, a, _b, _expr) =>
  bg('#2a2418', '#120f0a') +
  rect(70, 40, 180, 120, '#f0e6d2', 4, 0.92) +
  rect(80, 50, 160, 100, '#c8b89a', 2, 0.6) +
  circle(120, 96, 16, '#8d7a5c', 0.6) +
  circle(160, 92, 14, '#8d7a5c', 0.5) +
  circle(200, 98, 15, '#8d7a5c', 0.45) +
  stroke('M92 132 h140', '#b0a288', 3) +
  person(a ?? null, 0, 0, 0, 'neutral');

const ENV: Record<string, Env> = {
  office,
  meeting: meetingRoom,
  hr: hrRoom,
  cafe,
  bar,
  apartment,
  house: houseExterior,
  hospital,
  clinic,
  gym,
  street,
  airport,
  plane: planeWindow,
  beach,
  mountain,
  wedding,
  dinner: dinnerForTwo,
  startup,
  storefront,
  warehouse,
  chartUp,
  chartDown,
  phone: phoneSocial,
  letter: envelope,
  clock: clockScene,
  celebration,
  quiet,
  grave,
  disaster,
  car: blackCar,
  photo: oldPhoto,
  generic,
};

function toneColour(tone: Tone): string {
  switch (tone) {
    case 'good':
      return '#3ec9a7';
    case 'bad':
      return '#ff5f6d';
    case 'chaos':
      return '#c56cff';
    default:
      return '#6c8bff';
  }
}

/* ------------------------------------------------------------ art key map */

interface ArtSpec {
  env: keyof typeof ENV;
  who?: boolean;
  who2?: boolean;
  expr?: Expression;
}

/**
 * Every `art:` key used anywhere in the content library resolves here. Authors
 * pick a key; the engine of the visuals picks the room, the cast and the mood.
 */
const ART: Record<string, ArtSpec> = {};

function assign(keys: string[], spec: ArtSpec): void {
  for (const k of keys) ART[k] = spec;
}

assign(['office_hr', 'office_review', 'office_liedesk', 'office_application'], { env: 'hr', who: true, expr: 'worried' });
assign(['office_fired', 'office_layoff', 'office_reorg', 'office_stare', 'office_conflict'], { env: 'office', who: true, expr: 'shock' });
assign(['office_promotion', 'office_offer', 'office_mentor'], { env: 'office', who: true, expr: 'happy' });
assign(['office_meeting', 'office_consultants', 'office_coffee_meet', 'office_lunch'], { env: 'meeting', who: true, who2: true });
assign(['office_crunch', 'office_late', 'office_burnout', 'office_laptop', 'office_freelance'], { env: 'office', who: true, expr: 'worried' });
assign(['office_spreadsheet', 'office_dresscode'], { env: 'office', who: true });
assign(['money_debt', 'money_letters', 'money_letter', 'money_recession', 'money_payroll'], { env: 'letter', expr: 'worried' });
assign(['money_lottery', 'money_wallet', 'money_charity', 'money_family', 'money_sofa'], { env: 'apartment', who: true, expr: 'happy' });
assign(['money_car', 'money_carbreak', 'money_scam'], { env: 'car' });
assign(['invest_chart', 'invest_tip', 'invest_advisor'], { env: 'chartUp' });
assign(['invest_crash'], { env: 'chartDown' });
assign(['invest_property'], { env: 'house', who: true, expr: 'happy' });
assign(['invest_collectible'], { env: 'apartment', who: true, expr: 'smug' });
assign(['business_idea', 'business_partner'], { env: 'startup', who: true, expr: 'smug' });
assign(['business_hire', 'business_expand', 'business_pricing', 'business_meeting'], { env: 'meeting', who: true, who2: true });
assign(['business_audit', 'business_fail'], { env: 'warehouse', who: true, expr: 'worried' });
assign(['business_bigoffer', 'business_offer', 'business_resignation', 'business_success'], { env: 'startup', who: true, expr: 'happy' });
assign(['romance_caught', 'romance_jealousy', 'romance_argument', 'romance_unhappy'], { env: 'dinner', who: true, who2: true, expr: 'angry' });
assign(['romance_proposal'], { env: 'dinner', who: true, who2: true, expr: 'happy' });
assign(['romance_movein'], { env: 'apartment', who: true, expr: 'happy' });
assign(['romance_distance', 'romance_ex'], { env: 'phone', who: true, expr: 'sad' });
assign(['romance_bar', 'social_worksdrinks'], { env: 'bar', who: true, who2: true });
assign(['friends_drift', 'friends_groupchat'], { env: 'phone', who: true });
assign(['friends_hotdog', 'friends_reunion', 'friends_sofa_money'], { env: 'cafe', who: true, expr: 'smug' });
assign(['family_hospital', 'family_elder', 'family_care'], { env: 'hospital', who: true, expr: 'sad' });
assign(['family_christmas', 'family_lunch', 'familyscene_dinner', 'family_pressure', 'family_snub'], { env: 'dinner', who: true, who2: true });
assign(['family_kids', 'family_workshop'], { env: 'apartment', who: true, expr: 'happy' });
assign(['family_letter', 'family_money'], { env: 'letter' });
assign(['health_sick', 'health_bill', 'health_clinic', 'health_checkup'], { env: 'clinic', who: true, expr: 'worried' });
assign(['health_gym', 'health_drink', 'health_sleep'], { env: 'gym', who: true, expr: 'happy' });
assign(['health_mind', 'health_exhausted'], { env: 'apartment', who: true, expr: 'sad' });
assign(['housing_basement', 'housing_roommate'], { env: 'apartment', who: true, expr: 'worried' });
assign(['housing_dishes', 'housing_leak', 'housing_letter', 'housing_notice'], { env: 'apartment', who: true });
assign(['housing_viewing'], { env: 'house', who: true, expr: 'happy' });
assign(['travel_abroad', 'travel_world', 'travel_map', 'travel_family'], { env: 'mountain', who: true, expr: 'happy' });
assign(['travel_airport', 'travel_flight'], { env: 'airport', who: true });
assign(['travel_wedding', 'social_wedding'], { env: 'wedding', who: true, who2: true, expr: 'happy' });
assign(['social_viral', 'social_backlash'], { env: 'phone', who: true, expr: 'shock' });
assign(['social_cancel', 'social_networking', 'social_oldphoto'], { env: 'bar', who: true, expr: 'worried' });
assign(['later_retire', 'ending_retired', 'ending_comfortable', 'ending_quiet'], { env: 'quiet', who: true, expr: 'happy' });
assign(['later_will', 'later_advice'], { env: 'apartment', who: true, expr: 'neutral' });
assign(['life_generic', 'life_weekend', 'life_goodyear'], { env: 'generic', who: true, expr: 'happy' });
assign(['rare_letter'], { env: 'letter' });
assign(['rare_house'], { env: 'house', who: true, expr: 'smug' });
assign(['rare_disaster'], { env: 'disaster' });
assign(['rare_blackcar'], { env: 'car' });
assign(['ending_final'], { env: 'grave' });
assign(['ending_survivor'], { env: 'quiet', who: true, expr: 'neutral' });
assign(['ending_health'], { env: 'clinic', who: true, expr: 'worried' });
assign(['ending_workaholic'], { env: 'office', who: true, expr: 'shock' });
assign(['ending_corporate'], { env: 'office', who: true, expr: 'smug' });
assign(['ending_ceo', 'ending_founder', 'ending_entrepreneur', 'ending_billionaire'], { env: 'startup', who: true, expr: 'smug' });
assign(['ending_failure', 'ending_ruin', 'ending_debt', 'ending_fired'], { env: 'disaster' });
assign(['ending_family'], { env: 'dinner', who: true, who2: true, expr: 'happy' });
assign(['ending_happy'], { env: 'celebration', who: true, expr: 'happy' });
assign(['ending_famous'], { env: 'phone', who: true, expr: 'smug' });
assign(['ending_longlife'], { env: 'quiet', who: true, expr: 'happy' });
assign(['ending_parents'], { env: 'apartment', who: true, expr: 'sad' });
assign(['ending_property'], { env: 'house', who: true, expr: 'happy' });
assign(['ending_rich'], { env: 'chartUp' });
assign(['ending_romance'], { env: 'wedding', who: true, who2: true, expr: 'happy' });
assign(['ending_solo'], { env: 'bar', who: true, expr: 'neutral' });
assign(['ending_traveler'], { env: 'mountain', who: true, expr: 'happy' });
assign(['consequence_clock'], { env: 'clock' });

const CATEGORY_ENV: Record<Category, keyof typeof ENV> = {
  career: 'office',
  workplace: 'meeting',
  business: 'startup',
  money: 'letter',
  investing: 'chartUp',
  romance: 'dinner',
  friendship: 'cafe',
  family: 'dinner',
  health: 'clinic',
  housing: 'apartment',
  travel: 'airport',
  social: 'phone',
};

const CATEGORY_WHO: Record<Category, string | undefined> = {
  career: 'boss_gary',
  workplace: 'priya',
  business: 'chad',
  money: undefined,
  investing: undefined,
  romance: undefined,
  friendship: 'jess',
  family: 'mum',
  health: 'jess',
  housing: 'marcus',
  travel: 'jess',
  social: 'chad',
};

export interface SceneRequest {
  art?: string;
  category?: Category;
  tone?: Tone;
  /** NPC id to stage in the scene. */
  npc?: string | null;
  npc2?: string | null;
  /** Expression override for the main figure. */
  expression?: Expression;
}

/**
 * Renders a scene. Always returns something coherent, even for a key that does
 * not exist yet — a missing art key degrades to the category default, never to
 * a broken image.
 */
export function renderScene(req: SceneRequest): string {
  const spec = req.art ? ART[req.art] : undefined;
  const env = spec ? ENV[spec.env] : undefined;
  const tone: Tone = req.tone ?? 'neutral';

  const buildEnv = env ?? ENV[CATEGORY_ENV[req.category ?? 'career']] ?? ENV.generic;
  const first = req.npc ?? (spec?.who ? undefined : CATEGORY_WHO[req.category ?? 'career']) ?? null;
  const second = req.npc2 ?? null;
  const expr: Expression =
    req.expression ??
    spec?.expr ??
    (tone === 'good' ? 'happy' : tone === 'bad' ? 'worried' : tone === 'chaos' ? 'shock' : 'neutral');

  const body = buildEnv(tone, first, second, expr);
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Scene illustration">${body}
    <rect width="${W}" height="${H}" fill="url(#vig)"/>
    <defs><radialGradient id="vig" cx="0.5" cy="0.45" r="0.75">
      <stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.45"/>
    </radialGradient></defs>
  </svg>`;
}

/** Small square illustration for list rows and tiles. */
export function renderTile(art: string | undefined, category: Category, tone: Tone = 'neutral'): string {
  return renderScene({ art, category, tone });
}

export const ART_KEYS = Object.keys(ART);

/** Used by the content validator to catch mistyped scene keys. */
export function hasArt(key: string): boolean {
  return key in ART;
}

export { portrait };
