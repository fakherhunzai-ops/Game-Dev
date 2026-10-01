import type {
  Choice,
  Cond,
  DecisionRecord,
  EndingDef,
  GameEvent,
  GameState,
  Outcome,
  StatKey,
  Tone,
} from './types';
import { STAT_MAX, STAT_MIN } from './types';
import { Rng, clamp, round2 } from './rng';
import {
  applyFx,
  countSeen,
  emptyReport,
  ensureNpc,
  evalCond,
  netWorth,
  syncCareer,
  type DeltaReport,
} from './conditions';
import { advanceMonths, type MonthTick } from './state';
import { MAX_AGE, homeDef, stageDef, stageForAge } from './catalog';
import { fillTokens } from './text';
import { ACHIEVEMENTS, ENDINGS, EVENT_MAP, EVENTS, FILLER_EVENTS } from '../content';

/* ------------------------------------------------------------- resolution */

export interface Beat {
  id: string;
  title: string;
  body: string;
  tone: Tone;
  art?: string;
  quote?: string;
  report: DeltaReport;
  /** True when this beat silently flagged a future consequence. */
  secret?: boolean;
  endingId?: string | null;
}

export interface Resolution {
  event: GameEvent;
  choiceIndex: number;
  choiceText: string;
  outcome: Outcome;
  headline: string;
  body: string;
  tone: Tone;
  art: string;
  quote?: string;
  report: DeltaReport;
  tick: MonthTick;
  /** Futures the player has just set in motion (teased, never explained). */
  teasers: string[];
  /** Delayed consequences that came due *because* of this decision. */
  beats: Beat[];
  achievements: string[];
  ended: boolean;
  endingId: string | null;
  advancedMonths: number;
}

/* ------------------------------------------------------------ event choice */

function rarityMultiplier(r: GameEvent['rarity']): number {
  switch (r) {
    case 'legendary':
      return 0.22;
    case 'rare':
      return 0.5;
    case 'uncommon':
      return 0.82;
    default:
      return 1;
  }
}

/**
 * Context-sensitive weighting. This is what stops run 4 feeling like run 1:
 * a broke, burnt-out 41-year-old with two kids simply does not get the same
 * deck as a 24-year-old with $18k and a gym membership.
 */
export function weightFor(s: GameState, e: GameEvent): number {
  let w = e.weight ?? 10;
  w *= rarityMultiplier(e.rarity ?? 'common');

  const stage = stageDef(s.player.stage);
  if (stage.emphasis.includes(e.cat)) w *= 1.55;

  // Category fatigue — avoid three money cards in a row.
  const recent = s.recentCats;
  const last1 = recent[recent.length - 1];
  const last3 = recent.slice(-3);
  const last6 = recent.slice(-6);
  if (last1 === e.cat) w *= 0.28;
  else if (last3.includes(e.cat)) w *= 0.5;
  else if (last6.includes(e.cat)) w *= 0.75;

  // State-driven pulls.
  const st = s.player.stats;
  if (st.stress > 68 && (e.cat === 'health' || e.cat === 'workplace')) w *= 1.5;
  if (st.stress > 80 && e.cat === 'health') w *= 1.5;
  if (st.happiness < 38 && (e.cat === 'romance' || e.cat === 'friendship' || e.cat === 'travel')) w *= 1.45;
  if (s.finances.cash < 1200 && e.cat === 'money') w *= 1.6;
  if (s.finances.cash > 90000 && (e.cat === 'investing' || e.cat === 'business')) w *= 1.4;
  if (st.reputation > 75 && e.cat === 'social') w *= 1.3;
  if (st.health < 45 && e.cat === 'health') w *= 1.7;
  if (s.romance.status === 'married' && (e.cat === 'family' || e.cat === 'housing')) w *= 1.3;
  if (s.romance.children > 0 && e.cat === 'family') w *= 1.5;
  if (s.businesses.some((b) => b.active && b.health < 40)) {
    if (e.cat === 'business') w *= 1.7;
  }
  if (s.player.identity.trait === 'creative' && (e.cat === 'social' || e.cat === 'business')) w *= 1.2;
  if (s.player.identity.trait === 'risk_taker' && (e.cat === 'investing' || e.cat === 'business')) w *= 1.2;
  if (s.player.identity.trait === 'practical' && e.cat === 'investing') w *= 0.75;
  if (s.player.identity.trait === 'ambitious' && e.cat === 'career') w *= 1.25;
  if (s.player.identity.trait === 'charming' && (e.cat === 'romance' || e.cat === 'social')) w *= 1.25;

  // Repeat appearances are fine but should be rarer than firsts.
  if (countSeen(s, e.id) > 0) w *= 0.3;

  return Math.max(0.01, w);
}

export function isEligible(s: GameState, e: GameEvent, rng: Rng, forced = false): boolean {
  if (s.seen[e.id] !== undefined) {
    const cd = e.cooldown ?? 18;
    if (s.player.turn - s.seen[e.id] < cd) return false;
  }
  if (forced) return true;
  return evalCond(e.when, s, { rng, consumeChance: true });
}

/** Pulls the next event: due scripted beats first, then weighted discovery. */
export function pickNextEvent(s: GameState, rng: Rng): GameEvent {
  // 1. Forced chain events that have come due.
  const dueIdx = s.queue.findIndex((q) => q.dueTurn <= s.player.turn);
  if (dueIdx >= 0) {
    const due = s.queue.splice(dueIdx, 1)[0];
    const ev = EVENT_MAP[due.id];
    if (ev) return ev;
  }

  // 2. Weighted pick from everything eligible right now.
  const pool: GameEvent[] = [];
  for (const e of EVENTS) {
    if (e.id === s.currentEventId) continue;
    if (isEligible(s, e, rng)) pool.push(e);
  }

  const chosen = rng.weighted(pool, (e) => weightFor(s, e));
  if (chosen) return chosen;

  // 3. Never stall: guaranteed-alive filler cards keep the calendar moving.
  const fillerId = rng.pick(FILLER_EVENTS.map((f) => f.id));
  return (fillerId && EVENT_MAP[fillerId]) || EVENTS[0];
}

/* ------------------------------------------------------------------ perks */

/**
 * REROLL. Swaps the card on the table for a different one without spending
 * time. Used by the optional rewarded perk and by the Daily Dilemma.
 * The avoided id is excluded so a reroll can never hand back the same card.
 */
export function rerollEvent(s: GameState, rng: Rng, avoidId?: string): GameEvent {
  const previous = avoidId ?? s.currentEventId ?? undefined;
  s.currentEventId = null;
  let next = pickNextEvent(s, rng);
  for (let guard = 0; guard < 6 && previous && next.id === previous; guard++) {
    next = pickNextEvent(s, rng);
  }
  if (previous && next.id === previous) {
    // Nothing else was eligible: keep the original rather than stall.
    s.currentEventId = previous;
    return EVENT_MAP[previous] ?? next;
  }
  s.currentEventId = next.id;
  return next;
}

/* ------------------------------------------------------------ outcome pick */

export function pickOutcome(s: GameState, choice: Choice, rng: Rng): Outcome {
  if (choice.outcomes.length === 1) return choice.outcomes[0];
  const trait = s.player.identity.trait;
  const pick = rng.weighted(choice.outcomes, (o) => {
    let w = Math.max(0.05, o.weight ?? 1);
    const variance = o.variance ?? 0;
    if (trait === 'risk_taker' && variance > 0) w *= 1 + variance * 0.6;
    if (trait === 'practical' && variance > 0) w *= 1 - variance * 0.35;
    if (trait === 'practical' && variance < 0) w *= 1.15;
    // A lucky streak is partly engineered: karma nudges the coin.
    const karma = (s.player.stats.karma - 50) / 100;
    if (o.tone === 'good') w *= 1 + karma * 0.25;
    if (o.tone === 'bad') w *= 1 - karma * 0.2;
    return w;
  });
  return pick ?? choice.outcomes[0];
}

/* ------------------------------------------------------- choice resolution */

function impactOf(report: DeltaReport): number {
  let sum = 0;
  for (const v of Object.values(report.stats)) sum += Math.abs(v ?? 0);
  sum += Math.min(40, Math.abs(report.money) / 250);
  sum += Math.min(20, Math.abs(report.debt) / 500);
  return round2(sum);
}

/** Minimum months a decision advances, by life stage. Keeps runs ~60-80 cards. */
export const STAGE_MONTH_FLOOR: Record<GameState['player']['stage'], number> = {
  early_adult: 3,
  building: 6,
  established: 9,
  later: 14,
};

const TEASERS = [
  'You have a feeling about this one. You ignore it.',
  'Noted. Filed. Possibly permanently.',
  'Someone will remember this.',
  'This will be fine, probably, for now.',
  'The universe quietly takes a copy.',
  'Future you is going to have opinions about this.',
  'Statistically, this was a decision.',
  'Something moved. You did not see what.',
];

export function resolveChoice(
  s: GameState,
  rng: Rng,
  event: GameEvent,
  choiceIndex: number,
): Resolution {
  const choice = event.choices[choiceIndex] ?? event.choices[0];
  const outcome = pickOutcome(s, choice, rng);
  // Decisions advance the calendar. Early adulthood is granular; by your
  // fifties a single decision can skip more than a year, because that is how
  // decades actually feel from the inside.
  const months = Math.max(choice.time ?? 1, STAGE_MONTH_FLOOR[s.player.stage]);

  const report = emptyReport();

  // Choice-level effects land first, then the outcome's.
  applyFx(s, choice.fx, report);
  applyFx(s, outcome.fx, report);

  const teasers: string[] = [];

  // Schedule delayed consequences.
  const delayed = outcome.delayed ?? [];
  for (let i = 0; i < delayed.length; i++) {
    const d = delayed[i];
    if (d.chance !== undefined && !rng.bool(d.chance)) continue;
    s.pending.push({
      id: `p_${s.player.turn}_${event.id}_${i}`,
      // Authored delays are relative to *after* this decision's time passes,
      // so "three months later" always genuinely arrives later.
      dueTurn: s.player.turn + months + Math.max(1, d.inMonths),
      sourceEventId: event.id,
      sourceChoice: choice.text,
      payload: d,
    });
    if (d.title) teasers.push(d.title);
    else teasers.push(rng.pick(TEASERS));
  }

  const chains = [...(outcome.chain ?? [])];
  for (const c of chains) {
    if (c.chance !== undefined && !rng.bool(c.chance)) continue;
    s.queue.push({
      id: c.id,
      dueTurn: s.player.turn + months + Math.max(1, c.inMonths),
      forced: false,
    });
  }

  // Bookkeeping for the life timeline.
  const record: DecisionRecord = {
    turn: s.player.turn,
    age: s.player.ageYears,
    eventId: event.id,
    eventTitle: event.title,
    choiceText: choice.text,
    choiceTag: choice.tag,
    outcomeTitle: outcome.title,
    tone: outcome.tone ?? 'neutral',
    impact: impactOf(report),
    deltas: { ...report.stats, money: report.money },
    turn_label: `Age ${s.player.ageYears}`,
  };
  s.history.push(record);
  if (s.history.length > 600) s.history.shift();

  const tone: Tone = outcome.tone ?? 'neutral';
  s.feed.push({
    turn: s.player.turn,
    age: s.player.ageYears,
    title: outcome.title,
    body: fillTokens(outcome.body, s),
    tone,
    kind: 'decision',
    icon: event.cat,
  });
  for (const line of report.headline ?? []) {
    s.feed.push({
      turn: s.player.turn,
      age: s.player.ageYears,
      title: line,
      body: '',
      tone: 'neutral',
      kind: 'milestone',
    });
  }
  if (s.feed.length > 200) s.feed.splice(0, s.feed.length - 200);

  // Stats that the player earned by taking the shot.
  s.runStats.decisionsMade += 1;
  if (choice.highRisk) s.runStats.highRiskChoices += 1;
  if (choice.highRisk && (tone === 'good' || tone === 'chaos')) s.runStats.highRiskOutcomes += 1;

  s.seen[event.id] = s.player.turn;
  s.seenCount[event.id] = (s.seenCount[event.id] ?? 0) + 1;
  if (event.rarity === 'rare' || event.rarity === 'legendary') {
    if (!s.album.rareEvents.includes(event.id)) s.album.rareEvents.push(event.id);
  }
  s.runStats.eventsSeen += 1;
  if (!s.album.eventsSeen.includes(event.id)) s.album.eventsSeen.push(event.id);
  s.recentCats.push(event.cat);
  if (s.recentCats.length > 10) s.recentCats.shift();

  if (outcome.title) record.outcomeTitle = fillTokens(outcome.title, s);

  // --- time passes -------------------------------------------------------
  const noteBefore = s.finances.worstLoss;
  const tick = advanceMonths(s, months, rng);

  // Track the big financial swings for the life summary.
  if (report.money < 0 && Math.abs(report.money) > noteBefore) {
    s.finances.worstLossLabel = fillTokens(outcome.title, s);
  }
  if (report.money > 0 && report.money > s.finances.bestGain) {
    s.finances.bestGainLabel = fillTokens(outcome.title, s);
  } else if (report.money <= 0) {
    const nwGain = netWorth(s);
    if (nwGain > s.finances.bestGain) {
      s.finances.bestGain = nwGain;
      s.finances.bestGainLabel = fillTokens(outcome.title, s);
    }
  }

  // --- delayed consequences come due -------------------------------------
  const beats = runDueBeats(s, rng);

  // --- achievements + endings --------------------------------------------
  const achievements = checkAchievements(s, rng);

  let endingId: string | null = null;
  if (outcome.ending) endingId = outcome.ending;
  for (const b of beats) if (b.endingId) endingId = b.endingId;
  if (!endingId) {
    const over = s.player.ageYears >= MAX_AGE || s.player.stats.health <= 0;
    endingId = checkEndings(s, over);
  }

  if (endingId) {
    s.player.endingId = endingId;
  }

  s.currentEventId = null;
  s.updatedAt = Date.now();

  return {
    event,
    choiceIndex,
    choiceText: choice.text,
    outcome,
    headline: fillTokens(outcome.title, s),
    body: fillTokens(outcome.body, s),
    tone,
    art: outcome.art ?? event.art ?? defaultArtFor(event.cat),
    quote: outcome.quote ? fillTokens(outcome.quote, s) : undefined,
    report,
    tick,
    teasers: teasers.length ? teasers : [],
    beats,
    achievements,
    ended: !!endingId,
    endingId,
    advancedMonths: months,
  };
}

/* -------------------------------------------------------- delayed pipeline */

export function runDueBeats(s: GameState, rng: Rng, limit = 3): Beat[] {
  const beats: Beat[] = [];
  const due = s.pending.filter((p) => p.dueTurn <= s.player.turn).sort((a, b) => a.dueTurn - b.dueTurn);
  for (const p of due.slice(0, limit)) {
    const idx = s.pending.indexOf(p);
    if (idx >= 0) s.pending.splice(idx, 1);
    if (p.payload.chance !== undefined && p.dueTurn > s.player.turn) {
      // second roll for long-fuse events only
      if (!rng.bool(p.payload.chance)) continue;
    }
    const report = emptyReport();
    applyFx(s, p.payload.fx, report);
    for (const c of p.payload.queue ?? []) {
      s.queue.push({ id: c.id, dueTurn: s.player.turn + Math.max(0, c.inMonths), forced: false });
    }
    const title = fillTokens(
      p.payload.title ?? 'AND THEN SOMETHING HAPPENED',
      s,
    );
    const body = fillTokens(p.payload.body ?? '', s);
    const tone: Tone = p.payload.tone ?? (report.money > 0 ? 'good' : 'bad');
    s.feed.push({
      turn: s.player.turn,
      age: s.player.ageYears,
      title,
      body,
      tone,
      kind: 'delayed',
      icon: 'clock',
    });
    beats.push({
      id: p.id,
      title,
      body,
      tone,
      art: p.payload.art ?? 'consequence_clock',
      report,
      endingId: p.payload.ending ?? null,
    });
  }
  return beats;
}

/* ------------------------------------------------------------ achievements */

export function checkAchievements(s: GameState, rng: Rng): string[] {
  const unlocked: string[] = [];
  for (const a of ACHIEVEMENTS) {
    if (s.achievements.unlocked[a.id]) continue;
    let pass = false;
    if (a.counter) {
      pass = (s.achievements.counters[a.counter.key] ?? 0) >= a.counter.gte;
    }
    if (!pass) {
      pass = evalCond(a.when, s, { rng, consumeChance: false });
    }
    if (pass) {
      s.achievements.unlocked[a.id] = {
        id: a.id,
        unlockedTurn: s.player.turn,
        unlockedAge: s.player.ageYears,
      };
      unlocked.push(a.id);
      s.feed.push({
        turn: s.player.turn,
        age: s.player.ageYears,
        title: `Achievement: ${a.name}`,
        body: a.desc,
        tone: 'good',
        kind: 'milestone',
        icon: 'trophy',
      });
    }
  }
  return unlocked;
}

/* ----------------------------------------------------------------- endings */

/**
 * Resolves the ending for the current state.
 *
 * `allowFinal: false` only returns endings that are allowed to cut a life
 * short (retirement, ruin). Everything else — the millionaire endings, the
 * quiet-life endings, the fallbacks — is only considered once the life is
 * actually over, otherwise a lucky 32-year-old would have their run ended
 * the moment they became rich.
 */
export function checkEndings(s: GameState, allowFinal = false): string | null {
  let best: EndingDef | null = null;
  const rng = new Rng(s.seed);
  for (const e of ENDINGS) {
    if (e.final && !allowFinal) continue;
    if (!evalCond(e.when, s, { rng, consumeChance: false })) continue;
    if (!best || e.priority > best.priority) best = e;
  }
  return best ? best.id : null;
}

export const endingById = (id: string | null): EndingDef | null =>
  id ? (ENDINGS.find((e) => e.id === id) ?? null) : null;

/* --------------------------------------------------------------- life cycle */

/** Applies a resolution and advances the world one step. */
export function commitResolution(s: GameState, res: Resolution): void {
  if (res.ended && res.endingId) {
    s.player.endingId = res.endingId;
    s.player.alive = false;
  }
  s.player.stage = stageForAge(s.player.ageYears);
  syncCareer(s, false);
}

/* --------------------------------------------------------- state sanitation */

/**
 * Runs after every resolution: keeps numbers inside their legal ranges and
 * converts impossible states into story. A bankrupt player does not get a
 * negative bank balance — they get debt and a problem.
 */
export function sanitize(s: GameState): void {
  const p = s.player;
  for (const [k, v] of Object.entries(p.stats) as [StatKey, number][]) {
    p.stats[k] = round2(clamp(v, STAT_MIN, STAT_MAX));
  }
  if (s.finances.cash < 0) {
    const shortfall = Math.abs(s.finances.cash);
    s.finances.cash = 0;
    s.finances.debt = round2(s.finances.debt + shortfall);
  }
  if (s.finances.debt > 0 && s.finances.debt < 1) s.finances.debt = 0;
  s.finances.salary = Math.max(0, s.finances.salary);
  s.finances.housingCost = Math.max(0, s.finances.housingCost);
  s.npcs['jess'] = ensureNpc(s, 'jess');
  const home = homeDef(s.player.homeTier);
  if (Math.abs(s.finances.housingCost - home.cost) > 1 && s.flags.housingOverridden !== true) {
    s.finances.housingCost = home.cost;
  }
  if (p.stats.health <= 0) {
    // Health bottoming out is a hospital arc, not a game over.
    p.stats.health = 22;
    p.stats.stress = clamp(p.stats.stress - 20, STAT_MIN, STAT_MAX);
    s.finances.cash = round2(s.finances.cash * 0.6);
    s.feed.push({
      turn: p.turn,
      age: p.ageYears,
      title: 'MEDICAL BILL, MEDICAL BILL',
      body: 'You are fine. Your bank account requires a lie-down.',
      tone: 'bad',
      kind: 'system',
    });
  }
  if (s.finances.salary > 0 && s.flags.employed === false) {
    s.flags.employed = true;
  }
}

/* ----------------------------------------------------------------- summary */

export interface LifeSummary {
  name: string;
  ending: EndingDef | null;
  ageReached: number;
  yearsLived: number;
  totalEarned: number;
  peakNetWorth: number;
  finalNetWorth: number;
  careerPeak: string;
  careerPath: string;
  businesses: number;
  businessesSold: number;
  properties: number;
  relationships: { id: string; name: string; score: number }[];
  majorDecisions: DecisionRecord[];
  worstDecision: DecisionRecord | null;
  bestDecision: DecisionRecord | null;
  worstLoss: number;
  worstLossLabel: string;
  bestGain: number;
  bestGainLabel: string;
  peakStress: number;
  lowestHappiness: number;
  achievements: string[];
  milestones: string[];
  children: number;
  marriedTo: string | null;
  stats: Record<StatKey, number>;
  score: number;
  identity: GameState['player']['identity'];
  decisionCount: number;
}

export function buildSummary(s: GameState): LifeSummary {
  const sorted = [...s.history].sort((a, b) => b.impact - a.impact);
  const ending = endingById(s.player.endingId ?? checkEndings(s, true));
  const nw = netWorth(s);
  const relationships = Object.values(s.npcs)
    .filter((n) => n.met)
    .map((n) => ({ id: n.id, name: n.id, score: n.score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  const yearScore =
    Math.max(0, s.player.ageYears - s.player.startAge) * 3 +
    Math.min(90, nw / 40_000) +
    s.player.stats.happiness * 0.8 +
    s.player.stats.health * 0.4 +
    s.album.milestones.length * 4 +
    Object.keys(s.achievements.unlocked).length * 2 +
    s.career.peakLevel * 5;

  return {
    name: s.player.identity.name,
    ending,
    ageReached: s.player.ageYears,
    yearsLived: Math.max(0, Math.floor(s.player.turn / 12)),
    totalEarned: s.finances.totalEarned,
    peakNetWorth: s.finances.peakNetWorth,
    finalNetWorth: nw,
    careerPeak: s.career.peakTitle,
    careerPath: s.career.path,
    businesses: s.runStats.businessesFounded,
    businessesSold: s.runStats.businessesSold,
    properties: s.runStats.propertiesBought,
    relationships,
    majorDecisions: s.history
      .slice()
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 5),
    worstDecision: sorted.find((d) => d.tone === 'bad') ?? sorted[0] ?? null,
    bestDecision: sorted.find((d) => d.tone === 'good') ?? sorted[1] ?? null,
    worstLoss: s.finances.worstLoss,
    worstLossLabel: s.finances.worstLossLabel,
    bestGain: s.finances.bestGain,
    bestGainLabel: s.finances.bestGainLabel,
    peakStress: s.player.peakStress,
    lowestHappiness: s.player.lowestHappiness,
    achievements: Object.keys(s.achievements.unlocked),
    milestones: s.album.milestones,
    children: s.romance.children,
    marriedTo: s.romance.status === 'married' ? s.romance.partnerId : null,
    stats: { ...s.player.stats },
    score: Math.round(yearScore),
    identity: s.player.identity,
    decisionCount: s.history.length,
  };
}

/* -------------------------------------------------------------------- misc */

export function defaultArtFor(cat: string): string {
  const map: Record<string, string> = {
    career: 'office_promotion',
    workplace: 'office_conflict',
    business: 'business_meeting',
    money: 'money_cash',
    investing: 'invest_chart',
    romance: 'romance_date',
    friendship: 'friends_bar',
    family: 'family_home',
    health: 'health_checkup',
    housing: 'apartment_moving',
    travel: 'travel_airport',
    social: 'social_party',
  };
  return map[cat] ?? 'life_generic';
}

/** Human-readable list of the requirements a choice is missing. */
export function choiceLockedReason(choice: Choice, s: GameState): string | null {
  if (!choice.requires) return null;
  if (evalCond(choice.requires, s, { rng: new Rng(1), consumeChance: false })) return null;
  if (choice.lockedText) return choice.lockedText;
  const c: Cond = choice.requires;
  if (c.minCash) return `You need ${Math.round(c.minCash).toLocaleString('en-US')} in cash.`;
  if (c.stats?.health) return 'You are not well enough.';
  if (c.partner) return 'You are not in a relationship.';
  if (c.businesses) return 'You do not own a business.';
  if (c.career) return 'Not in the right job for this.';
  if (c.trait) return 'Not your personality.';
  if (c.age) return `Unlocks at ${c.age[0]}.`;
  if (c.npc) return 'Not close enough yet.';
  return 'Not available right now.';
}
