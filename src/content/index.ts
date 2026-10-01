import type {
  AchievementDef,
  ContentPack,
  EndingDef,
  GameEvent,
  NpcDef,
} from '../engine/types';

import { NPC_DEFS } from './npcs';

import { careerEvents } from './events/career';
import { moneyEvents } from './events/money';
import { housingEvents } from './events/housing';
import { familyEvents } from './events/family';
import { healthEvents } from './events/health';
import { socialEvents } from './events/social';
import { randomEvents } from './events/random';
import { businessEvents } from './events/business';
import { investingEvents } from './events/investing';
import { romanceEvents } from './events/romance';
import { friendshipEvents } from './events/friendship';
import { travelEvents } from './events/travel';
import { hustleEvents } from './events/hustle';
import { chainEvents } from './events/chains';
import { fillerEvents } from './events/filler';
import { rareEvents } from './events/rare';
import { resolutionEvents } from './events/later';
import { ENDINGS as ENDINGS_RAW } from './endings';
import { ACHIEVEMENTS as ACHIEVEMENTS_RAW } from './achievements';

/**
 * THE COMPOSITION POINT.
 *
 * Adding content is a data change, never a code change: drop a `GameEvent[]`
 * into `src/content/events/` and add it to the registry below. The engine
 * discovers it, the validator checks it, the UI renders it.
 */

/** Cards that compete for the main decision slot. */
export const EVENT_SETS: GameEvent[][] = [
  careerEvents,
  moneyEvents,
  housingEvents,
  romanceEvents,
  friendshipEvents,
  familyEvents,
  healthEvents,
  socialEvents,
  randomEvents,
  businessEvents,
  investingEvents,
  travelEvents,
  hustleEvents,
  resolutionEvents,
  rareEvents,
];

/** Cards the player only ever reaches through a queued/delayed payoff. */
export const CHAIN_EVENTS: GameEvent[] = [...chainEvents];

/** Safety-net cards: always eligible, always low stakes, never a dead choice. */
export const FILLER_EVENTS: GameEvent[] = [...fillerEvents];

export const EVENTS: GameEvent[] = EVENT_SETS.flat();

export const ALL_CARDS: GameEvent[] = [...EVENTS, ...CHAIN_EVENTS, ...FILLER_EVENTS];

export const EVENT_MAP: Record<string, GameEvent> = Object.fromEntries(
  ALL_CARDS.map((e) => [e.id, e]),
);

/** Ids that must never be drawn randomly — they only appear when queued. */
export const CHAIN_ONLY: string[] = [...CHAIN_EVENTS.map((e) => e.id), ...FILLER_EVENTS.map((e) => e.id)];

export const NPCS: NpcDef[] = NPC_DEFS;

export const ENDINGS: EndingDef[] = ENDINGS_RAW;

export const ACHIEVEMENTS: AchievementDef[] = ACHIEVEMENTS_RAW;

/**
 * Cosmetics and bonus content. Nothing here changes the difficulty of a run:
 * packs add *more* scenarios, never better odds, and premium never touches the
 * simulation.
 */
export const CONTENT_PACKS: ContentPack[] = [
  {
    id: 'corporate_chaos',
    name: 'Corporate Chaos',
    blurb: 'Reorgs, synergy VPs, and a printer that knows your name.',
    icon: '🏢',
    price: '$2.99',
    categories: ['workplace', 'career'],
    unlocks: ['pkg_synergy_vp', 'pkg_meeting_that_never_ends'],
  },
  {
    id: 'startup_life',
    name: 'Startup Life',
    blurb: 'Ten months of runway and total, unshakeable conviction.',
    icon: '🚀',
    price: '$2.99',
    categories: ['business'],
    unlocks: ['pkg_seed_round', 'pkg_cofounder_breakup'],
  },
  {
    id: 'relationship_drama',
    name: 'Relationship Drama',
    blurb: 'Merged playlists and the IKEA argument.',
    icon: '💔',
    price: '$2.99',
    categories: ['romance'],
    unlocks: ['pkg_meet_the_parents', 'pkg_ikea_argument'],
  },
  {
    id: 'millionaire_problems',
    name: 'Millionaire Problems',
    blurb: 'A boat that requires a bigger boat.',
    icon: '💸',
    price: '$2.99',
    categories: ['money', 'investing'],
    unlocks: ['pkg_the_friends_who_ask', 'pkg_late_tax_bill'],
  },
  {
    id: 'travel_adventure',
    name: 'Travel & Adventure',
    blurb: 'Airport chaos, questionable hostels, one perfect week.',
    icon: '✈️',
    price: '$2.99',
    categories: ['travel'],
    unlocks: ['pkg_lost_passport', 'pkg_the_hostel'],
  },
];

/* ---------------------------------------------------------------- stats --- */

export interface ContentStats {
  events: number;
  cards: number;
  choices: number;
  endings: number;
  achievements: number;
  npcs: number;
  chainCards: number;
  fillerCards: number;
  byCategory: Record<string, number>;
  byRarity: Record<string, number>;
  avgChoices: number;
}

export function contentStats(): ContentStats {
  const byCategory: Record<string, number> = {};
  const byRarity: Record<string, number> = {};
  let choices = 0;
  for (const e of ALL_CARDS) {
    byCategory[e.cat] = (byCategory[e.cat] ?? 0) + 1;
    byRarity[e.rarity ?? 'common'] = (byRarity[e.rarity ?? 'common'] ?? 0) + 1;
    choices += e.choices.length;
  }
  return {
    events: EVENTS.length,
    cards: ALL_CARDS.length,
    choices,
    endings: ENDINGS.length,
    achievements: ACHIEVEMENTS.length,
    npcs: NPCS.length,
    chainCards: CHAIN_EVENTS.length,
    fillerCards: FILLER_EVENTS.length,
    byCategory,
    byRarity,
    avgChoices: choices / Math.max(1, ALL_CARDS.length),
  };
}

/* ------------------------------------------------------------- validation - */

export interface ValidationIssue {
  level: 'error' | 'warn';
  id: string;
  message: string;
}

const TAGS = new Set([
  'bold',
  'safe',
  'smart',
  'kind',
  'lazy',
  'chaotic',
  'risky',
  'cruel',
  'romantic',
  'greedy',
]);

/**
 * Fails loudly in development if content drifts from the schema. This is what
 * keeps a hundred hand-authored cards honest as the library grows.
 */
export function validateContent(
  events: GameEvent[] = ALL_CARDS,
  endingDefs: EndingDef[] = ENDINGS,
  achievementDefs: AchievementDef[] = ACHIEVEMENTS,
  npcs: NpcDef[] = NPCS,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seenIds = new Set<string>();
  const npcIds = new Set(npcs.map((n) => n.id));
  const endingsById = new Set(endingDefs.map((e) => e.id));
  const achById = new Set(achievementDefs.map((a) => a.id));

  const all = new Set(events.map((e) => e.id));

  for (const e of events) {
    if (seenIds.has(e.id)) issues.push({ level: 'error', id: e.id, message: 'duplicate event id' });
    seenIds.add(e.id);
    if (!e.title) issues.push({ level: 'error', id: e.id, message: 'missing title' });
    if (!e.body) issues.push({ level: 'error', id: e.id, message: 'missing body' });
    if (e.choices.length < 2) issues.push({ level: 'error', id: e.id, message: 'needs 2+ choices' });
    if (e.choices.length > 4) issues.push({ level: 'error', id: e.id, message: 'max 4 choices' });
    if (e.who && !npcIds.has(e.who)) {
      issues.push({ level: 'error', id: e.id, message: `unknown character "${e.who}"` });
    }
    if (e.speaker && !npcIds.has(e.speaker)) {
      issues.push({ level: 'error', id: e.id, message: `unknown speaker "${e.speaker}"` });
    }

    for (const c of e.choices) {
      if (!c.text) issues.push({ level: 'error', id: e.id, message: 'choice missing text' });
      if (c.tag && !TAGS.has(c.tag)) {
        issues.push({ level: 'error', id: e.id, message: `unknown tag "${c.tag}"` });
      }
      if (c.outcomes.length === 0) {
        issues.push({ level: 'error', id: e.id, message: `choice "${c.text}" has no outcomes` });
      }
      if (c.requires && c.requires.stats) {
        // A requirement that can never be met is a dead choice.
        for (const [k, v] of Object.entries(c.requires.stats)) {
          if (v && v[0] !== null && v[0] !== undefined && v[0] > 100) {
            issues.push({ level: 'error', id: e.id, message: `unreachable requirement on ${k}` });
          }
        }
      }
      for (const o of c.outcomes) {
        if (!o.title) {
          issues.push({ level: 'error', id: `${e.id}/${c.text}`, message: 'outcome missing title' });
        }
        if (!o.body) {
          issues.push({ level: 'error', id: `${e.id}/${c.text}`, message: 'outcome missing body' });
        }
        if (o.ending && !endingsById.has(o.ending)) {
          issues.push({ level: 'error', id: e.id, message: `unknown ending "${o.ending}"` });
        }
        for (const chainSpec of [...(o.chain ?? []), ...(o.delayed ?? []).flatMap((d) => d.queue ?? [])]) {
          if (!all.has(chainSpec.id)) {
            issues.push({ level: 'error', id: e.id, message: `queues unknown card "${chainSpec.id}"` });
          }
        }
        const npcRefs: string[] = [];
        if (o.fx?.npc) npcRefs.push(...Object.keys(o.fx.npc));
        if (o.fx?.setPartner?.npcId && o.fx.setPartner.npcId !== 'new' && o.fx.setPartner.npcId !== 'partner') {
          npcRefs.push(o.fx.setPartner.npcId);
        }
        if (o.fx?.remember) npcRefs.push(...Object.keys(o.fx.remember));
        for (const ref of npcRefs) {
          // `partner` is a runtime alias resolved against the live save.
          if (ref === 'partner' || ref === 'new') continue;
          if (!npcIds.has(ref)) {
            issues.push({ level: 'error', id: e.id, message: `unknown npc "${ref}"` });
          }
        }
        const unlocks = [
          ...(Array.isArray(o.fx?.ach) ? o.fx!.ach! : o.fx?.ach ? [o.fx.ach] : []),
        ] as string[];
        for (const a of unlocks) {
          if (achievementDefs.length && !achById.has(a)) {
            issues.push({ level: 'warn', id: e.id, message: `unlocks unknown achievement "${a}"` });
          }
        }
      }
    }
  }

  for (const en of endingDefs) {
    if (!en.title) issues.push({ level: 'error', id: en.id, message: 'ending missing title' });
    if (en.priority === undefined) {
      issues.push({ level: 'warn', id: en.id, message: 'ending without priority' });
    }
  }

  for (const a of achievementDefs) {
    if (!a.name) issues.push({ level: 'error', id: a.id, message: 'achievement missing name' });
  }

  return issues;
}

/** Developer-facing summary, printed by `npm run content:report`. */
export function contentReport(): string {
  const s = contentStats();
  const issues = validateContent();
  const errors = issues.filter((i) => i.level === 'error');
  const lines = [
    `Cards:        ${s.cards} (${s.events} draftable, ${s.chainCards} chain-only, ${s.fillerCards} filler)`,
    `Choices:      ${s.choices} (avg ${s.avgChoices.toFixed(2)} per card)`,
    `Endings:      ${s.endings}`,
    `Achievements: ${s.achievements}`,
    `NPCs:         ${s.npcs}`,
    '',
    'By category:',
    ...Object.entries(s.byCategory)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `  ${k.padEnd(14)} ${v}`),
    '',
    'By rarity:',
    ...Object.entries(s.byRarity).map(([k, v]) => `  ${k.padEnd(14)} ${v}`),
    '',
    errors.length === 0 ? 'No content errors.' : `${errors.length} content errors:`,
    ...errors.slice(0, 40).map((e) => `  - ${e.id}: ${e.message}`),
  ];
  return lines.join('\n');
}
