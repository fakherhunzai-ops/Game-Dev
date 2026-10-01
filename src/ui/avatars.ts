import type { NpcDef } from '../engine/types';
import { NPC_DEFS } from '../content/npcs';

/**
 * PROCEDURAL CHARACTER PORTRAITS
 *
 * Every face in the game is drawn at runtime from a palette, a hair style and
 * an expression. Nothing is downloaded, everything is vector-crisp on any
 * screen, and adding a character costs four lines of data.
 */

export type Expression = 'neutral' | 'happy' | 'worried' | 'angry' | 'shock' | 'smug' | 'sad';

interface Face {
  brow: (cx: number) => string;
  eye: (cx: number) => string;
  mouth: string;
}

const INK = '#181026';
const MOUTH = '#8d3d52';

function face(expr: Expression): Face {
  const eyeDot = (cx: number) => `<circle cx="${cx}" cy="54" r="2.8" fill="${INK}"/>`;
  const eyeWide = (cx: number) =>
    `<ellipse cx="${cx}" cy="54" rx="5" ry="5.6" fill="#fff"/><circle cx="${cx}" cy="54.5" r="2.6" fill="${INK}"/>`;
  const eyeArc = (cx: number) =>
    `<path d="M${cx - 5.5} 55 q5.5 -6 11 0" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  const brow = (angle: number, lift: number) => (cx: number) => {
    const dy = angle;
    return `<path d="M${cx - 6} ${44 + lift - dy} q6 -3 12 ${dy}" stroke-width="2.6" stroke-linecap="round" fill="none" />`;
  };

  switch (expr) {
    case 'happy':
      return {
        brow: (cx) => `<path d="M${cx - 6} 44 q6 -4 12 -1" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
        eye: eyeArc,
        mouth: `<path d="M43 66 q7 7 14 0" stroke="${MOUTH}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
      };
    case 'worried':
      return {
        brow: (cx) => `<path d="M${cx - 6} 46 q6 -2 12 -4" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
        eye: eyeDot,
        mouth: `<path d="M44 68 q6 -4 12 0" stroke="${MOUTH}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
      };
    case 'angry':
      return {
        brow: (cx) => `<path d="M${cx - 6} 43 l12 5" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
        eye: eyeDot,
        mouth: `<path d="M43 68 q7 -5 14 0" stroke="${MOUTH}" stroke-width="2.8" fill="none" stroke-linecap="round"/>`,
      };
    case 'shock':
      return {
        brow: (cx) => `<path d="M${cx - 7} 40 q7 -5 14 -1" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
        eye: eyeWide,
        mouth: `<ellipse cx="50" cy="68" rx="5" ry="6" fill="${MOUTH}"/>`,
      };
    case 'smug':
      return {
        brow: (cx) => `<path d="M${cx - 6} 43 q6 -3 12 0" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
        eye: eyeArc,
        mouth: `<path d="M42 66 q7 5 16 -3" stroke="${MOUTH}" stroke-width="2.8" fill="none" stroke-linecap="round"/>`,
      };
    case 'sad':
      return {
        brow: (cx) => `<path d="M${cx - 6} 47 q6 -3 12 -5" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
        eye: eyeDot,
        mouth: `<path d="M44 69 q6 -4 12 -1" stroke="${MOUTH}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
      };
    default:
      return {
        brow: brow(0, 0)(50).includes('undefined')
          ? () => ''
          : (cx) => `<path d="M${cx - 6} 45 q6 -3 12 0" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
        eye: eyeDot,
        mouth: `<path d="M44 67 q6 3 12 0" stroke="${MOUTH}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
      };
  }
}

function hair(style: NpcDef['hairStyle'], color: string): string {
  switch (style) {
    case 'long':
      return `<path d="M24 56 q-2 -30 26 -30 q28 0 26 30 l-2 22 h-8 l2 -24 q-8 8 -18 8 q-10 0 -18 -8 l2 24 h-8 z" fill="${color}"/>`;
    case 'bun':
      return `<circle cx="50" cy="18" r="7" fill="${color}"/><path d="M25 52 q0 -27 25 -27 q25 0 25 27 l-4 -6 q-8 -8 -21 -8 q-13 0 -21 8 z" fill="${color}"/>`;
    case 'curls':
      return `<g fill="${color}"><circle cx="32" cy="34" r="9"/><circle cx="42" cy="27" r="10"/><circle cx="54" cy="25" r="10"/><circle cx="66" cy="32" r="9"/><circle cx="26" cy="44" r="7"/><circle cx="73" cy="43" r="7"/></g>`;
    case 'bald':
      return `<path d="M26 50 q2 -22 24 -22 q22 0 24 22 q-10 -8 -24 -8 q-14 0 -24 8 z" fill="${color}" opacity="0.75"/>`;
    case 'bob':
      return `<path d="M24 58 q0 -30 26 -30 q26 0 26 30 l-3 14 h-7 l2 -18 q-9 7 -18 7 q-9 0 -18 -7 l2 18 h-7 z" fill="${color}"/>`;
    case 'locs':
      return `<g fill="${color}"><path d="M25 50 q0 -26 25 -26 q25 0 25 26 q-10 -8 -25 -8 q-15 0 -25 8 z"/><rect x="22" y="48" width="6" height="30" rx="3"/><rect x="72" y="48" width="6" height="30" rx="3"/><rect x="30" y="54" width="5" height="20" rx="2.5"/><rect x="65" y="54" width="5" height="20" rx="2.5"/></g>`;
    default:
      return `<path d="M25 50 q0 -27 25 -27 q25 0 25 27 q-9 -8 -25 -8 q-16 0 -25 8 z" fill="${color}"/>`;
  }
}

export interface PortraitOptions {
  expression?: Expression;
  /** Scale of the head within the frame. */
  zoom?: number;
}

/** Returns an SVG string for a portrait, ready to drop into innerHTML. */
export function portrait(npcId: string, opts: PortraitOptions = {}): string {
  const def = NPC_DEFS.find((n) => n.id === npcId);
  if (!def) return placeholder(npcId);
  const f = face(opts.expression ?? 'neutral');
  const p = def.palette;
  const id = `pp_${npcId}_${opts.expression ?? 'neutral'}`;
  const zoom = opts.zoom ?? 1;
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(def.name)}">
  <defs>
    <linearGradient id="${id}_bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.accent}" stop-opacity="0.30"/>
      <stop offset="1" stop-color="#0d0b14" stop-opacity="0.95"/>
    </linearGradient>
    <clipPath id="${id}_clip"><rect width="100" height="100" rx="0"/></clipPath>
  </defs>
  <g clip-path="url(#${id}_clip)">
    <rect width="100" height="100" fill="#191428"/>
    <rect width="100" height="100" fill="url(#${id}_bg)"/>
    <g transform="translate(50 54) scale(${zoom}) translate(-50 -54)">
      <path d="M14 104 q4 -26 36 -26 q32 0 36 26 z" fill="${p.outfit}"/>
      <path d="M40 74 q10 8 20 0 l3 8 q-13 8 -26 0 z" fill="${p.accent}" opacity="0.9"/>
      <rect x="43" y="62" width="14" height="16" rx="6" fill="${p.skin}"/>
      <ellipse cx="50" cy="48" rx="22" ry="25" fill="${p.skin}"/>
      <ellipse cx="28" cy="50" rx="4" ry="6" fill="${p.skin}"/>
      <ellipse cx="72" cy="50" rx="4" ry="6" fill="${p.skin}"/>
      <ellipse cx="50" cy="48" rx="22" ry="25" fill="${p.outfit}" opacity="0.06"/>
      ${hair(def.hairStyle, p.hair)}
      ${f.brow(43)}${f.brow(57)}${f.eye(43)}${f.eye(57)}
      <path d="M50 56 q-2 4 1 5" stroke="${INK}" stroke-width="1.6" fill="none" opacity="0.5" stroke-linecap="round"/>
      ${f.mouth}
    </g>
  </g>
</svg>`;
}

function placeholder(id: string): string {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="100" height="100" fill="#241e3d"/>
    <text x="50" y="60" text-anchor="middle" font-size="34" fill="#7d7499" font-family="system-ui" font-weight="800">?</text>
    <title>${esc(id)}</title>
  </svg>`;
}

/** A generated look for a user-created character. */
export interface Look {
  id: string;
  skin: string;
  hair: string;
  outfit: string;
  accent: string;
  hairStyle: NpcDef['hairStyle'];
}

export const PLAYER_LOOKS: Look[] = [
  { id: 'l1', skin: '#e8c19a', hair: '#2b1f1c', outfit: '#ff5c8a', accent: '#ffd166', hairStyle: 'short' },
  { id: 'l2', skin: '#8d5a3b', hair: '#12100f', outfit: '#3ec9a7', accent: '#ffe066', hairStyle: 'curls' },
  { id: 'l3', skin: '#f0d2b4', hair: '#c9903c', outfit: '#6c8bff', accent: '#d8e2ff', hairStyle: 'bob' },
  { id: 'l4', skin: '#6b4230', hair: '#1a1512', outfit: '#c56cff', accent: '#f3d9ff', hairStyle: 'locs' },
  { id: 'l5', skin: '#d8a374', hair: '#6b6b6b', outfit: '#f5b83d', accent: '#3a2c10', hairStyle: 'bald' },
  { id: 'l6', skin: '#c98d63', hair: '#4a2f22', outfit: '#ff8a5c', accent: '#ffe8d6', hairStyle: 'bun' },
  { id: 'l7', skin: '#f2d7c0', hair: '#8d3b52', outfit: '#2f9e8f', accent: '#d4fff4', hairStyle: 'long' },
  { id: 'l8', skin: '#a9744f', hair: '#3a2b3c', outfit: '#e8e0f5', accent: '#5c4a7a', hairStyle: 'short' },
];

export function playerPortrait(
  lookId: string,
  expression: Expression = 'neutral',
  name = 'You',
): string {
  const look = PLAYER_LOOKS.find((l) => l.id === lookId) ?? PLAYER_LOOKS[0];
  const def: NpcDef = {
    id: `player_${look.id}`,
    name,
    role: 'You',
    bio: '',
    palette: { skin: look.skin, hair: look.hair, outfit: look.outfit, accent: look.accent },
    hairStyle: look.hairStyle,
    pronouns: 'they/them',
  };
  const f = face(expression);
  const p = def.palette;
  const id = `pl_${look.id}_${expression}`;
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Your character">
  <defs>
    <linearGradient id="${id}_bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.outfit}" stop-opacity="0.34"/>
      <stop offset="1" stop-color="#0d0b14" stop-opacity="0.96"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" fill="#191428"/>
  <rect width="100" height="100" fill="url(#${id}_bg)"/>
  <path d="M14 104 q4 -26 36 -26 q32 0 36 26 z" fill="${p.outfit}"/>
  <path d="M40 74 q10 8 20 0 l3 8 q-13 8 -26 0 z" fill="${p.accent}" opacity="0.9"/>
  <rect x="43" y="62" width="14" height="16" rx="6" fill="${p.skin}"/>
  <ellipse cx="50" cy="48" rx="22" ry="25" fill="${p.skin}"/>
  <ellipse cx="28" cy="50" rx="4" ry="6" fill="${p.skin}"/>
  <ellipse cx="72" cy="50" rx="4" ry="6" fill="${p.skin}"/>
  ${hair(def.hairStyle, p.hair)}
  ${f.brow(43)}${f.brow(57)}${f.eye(43)}${f.eye(57)}${f.mouth}
</svg>`;
}

/** Expression that matches how a life is actually going. */
export function expressionForHappiness(happiness: number, stress: number): Expression {
  if (stress > 82) return 'shock';
  if (happiness >= 72) return 'happy';
  if (happiness >= 45) return 'neutral';
  if (happiness >= 25) return 'worried';
  return 'sad';
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);
}
