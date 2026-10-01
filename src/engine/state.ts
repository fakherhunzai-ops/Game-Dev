import type { GameState, PlayerIdentity, Settings, StatKey, Holding } from './types';
import { STAT_MAX, STAT_MIN } from './types';
import { Rng, clamp, round2 } from './rng';
import {
  CAREER_PATHS,
  careerSalary,
  careerTitle,
  homeDef,
  stageForAge,
  traitDef,
} from './catalog';
import { emptyReport, ensureNpc, syncCareer } from './conditions';
import { defaultMeta, defaultSettings, SAVE_VERSION, type MetaState } from './save';

export interface NewLifeOptions {
  identity: PlayerIdentity;
  settings: Settings;
  meta: MetaState;
  /** Overrides for the Daily Dilemma / challenge modes. */
  seed?: number;
  startAge?: number;
  careerPath?: GameState['career']['path'];
}

/**
 * Starting loadout. Deliberately mundane: a small job, a small flat, a small
 * cushion. Everything after this is the player's fault.
 */
export function createNewGame(opts: NewLifeOptions): GameState {
  const { identity } = opts;
  const seed = opts.seed ?? Math.floor(Math.random() * 2 ** 31);
  const rng = new Rng(seed);
  const startAge = opts.startAge ?? 23 + rng.int(0, 2);
  const path = opts.careerPath ?? 'marketing';
  const pathDef = CAREER_PATHS.find((c) => c.id === path) ?? CAREER_PATHS[3];

  const stats: Record<StatKey, number> = {
    career: 18,
    happiness: 65,
    stress: 22,
    relationships: 55,
    reputation: 50,
    health: 80,
    energy: 72,
    karma: 50,
  };

  // Personality traits nudge the opening position.
  const bonuses = traitDef(identity.trait).bonuses;
  const idx: Record<string, StatKey> = {
    career: 'career',
    happiness: 'happiness',
    stress: 'stress',
    relationships: 'relationships',
    reputation: 'reputation',
    health: 'health',
    energy: 'energy',
  };
  for (const [k, v] of Object.entries(bonuses)) {
    const key = idx[k];
    if (key) stats[key] = clamp(stats[key] + v, STAT_MIN, STAT_MAX);
  }

  const employer = pathDef.employers[rng.int(0, pathDef.employers.length - 1)];
  const level = 0;
  const performance = 50;

  const state: GameState = {
    version: SAVE_VERSION,
    seed,
    rngState: rng.state,
    player: {
      identity,
      ageYears: startAge,
      ageMonths: rng.int(0, 11),
      turn: 0,
      startAge,
      stage: stageForAge(startAge),
      alive: true,
      endingId: null,
      stats,
      tags: [],
      peakStress: stats.stress,
      lowestHappiness: stats.happiness,
      homeTier: 'studio',
    },
    finances: {
      cash: 4500,
      savings: 0,
      debt: 0,
      salary: careerSalary(path, level, performance),
      sideIncome: 0,
      housingCost: homeDef('studio').cost,
      livingCost: 780,
      gigIncome: 0,
      mortgage: 0,
      totalEarned: 4500,
      totalSpent: 0,
      peakNetWorth: 0,
      worstLoss: 0,
      worstLossLabel: '—',
      bestGain: 0,
      bestGainLabel: '—',
    },
    career: {
      path,
      level,
      title: careerTitle(path, level),
      employer,
      performance,
      monthsInRole: 0,
      jobsHeld: 1,
      jobsLost: 0,
      peakTitle: careerTitle(path, level),
      peakLevel: level,
      counteroffers: 0,
    },
    romance: {
      status: 'single',
      partnerId: null,
      monthsTogether: 0,
      children: 0,
      proposals: 0,
      breakups: 0,
    },
    businesses: [],
    holdings: [],
    npcs: {},
    flags: {
      employed: true,
      city: 'Fairmont',
      // Progression across runs: some events only unlock for veterans.
      livesLived: opts.meta.livesLived ?? 0,
      premium: opts.settings?.premium ?? false,
      liesTold: 0,
      favorsCalled: 0,
      timesBroke: 0,
    },
    market: {
      index: 100,
      cycle: 1,
      cycleTurns: rng.int(10, 20),
      crashed: false,
      peak: 100,
    },
    achievements: { unlocked: {}, counters: {} },
    album: {
      endings: [...opts.meta.endings],
      careers: [...opts.meta.careers],
      businesses: [...opts.meta.businesses],
      milestones: [...opts.meta.milestones],
      rareEvents: [...opts.meta.rareEvents],
      eventsSeen: [...opts.meta.seenEvents],
    },
    settings: opts.settings ?? defaultSettings(),
    runStats: {
      decisionsMade: 0,
      highRiskChoices: 0,
      highRiskOutcomes: 0,
      eventsSeen: 0,
      businessesFounded: 0,
      businessesSold: 0,
      propertiesBought: 0,
      timesFired: 0,
      breakups: 0,
      promotions: 0,
      loansTaken: 0,
      vacations: 0,
      nightsOut: 0,
    },
    history: [],
    feed: [],
    pending: [],
    queue: [],
    seen: {},
    seenCount: {},
    recentCats: [],
    currentEventId: null,
    undoSnapshot: null,
    dailyId: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // Seed the recurring cast — they exist from day one, relationships vary.
  const cast: Array<[string, number]> = [
    ['jess', 58],
    ['marcus', 52],
    ['mum', 74],
    ['dad', 46],
    ['priya', 44],
    ['chad', 38],
    ['boss_gary', 50],
    ['brother_eli', 52],
  ];
  for (const [id, score] of cast) {
    const n = ensureNpc(state, id);
    n.met = true;
    n.score = clamp(score + (identity.trait === 'charming' ? 10 : 0), -100, 100);
  }

  syncCareer(state, false);
  state.finances.peakNetWorth = state.finances.cash;
  return state;
}

/** Fresh starting meta for a brand new install. */
export const freshMeta = defaultMeta;

/* --------------------------------------------------------------- holdings */

export function makeHolding(
  label: string,
  kind: Holding['kind'],
  cost: number,
  volatility: number,
  turn: number,
): Holding {
  return {
    id: `h_${kind}_${turn}_${Math.floor(Math.random() * 9999)}`,
    label,
    kind,
    cost,
    value: cost,
    volatility,
    acquiredTurn: turn,
    sold: false,
  };
}

/* ----------------------------------------------------------- market model */

/**
 * A small random-walk market with visible boom/bust cycles. Cycles are what
 * make delayed consequences land well: a player can buy high, hold through a
 * crash, and be rewarded (or ruined) years later.
 */
export function tickMarket(s: GameState, rng: Rng): void {
  const m = s.market;
  m.cycleTurns -= 1;
  if (m.cycleTurns <= 0) {
    const next = rng.next();
    m.cycle = next < 0.42 ? 1 : next < 0.78 ? 0 : -1;
    m.cycleTurns = rng.int(8, 22);
  }

  const drift = m.cycle === 1 ? 0.011 : m.cycle === -1 ? -0.012 : 0.0015;
  const shock = (rng.next() - 0.5) * 0.055;
  const churn = 0.02 * (Math.abs(s.player.stats.stress - 50) / 100);
  const pct = drift + shock + churn;
  m.index = round2(Math.max(12, m.index * (1 + pct)));
  if (m.index > m.peak) m.peak = m.index;
  if (m.index < m.peak * 0.8) m.crashed = true;

  for (const h of s.holdings) {
    if (h.sold) continue;
    const vol = h.volatility;
    const move = drift * (h.kind === 'property' ? 0.5 : 1) + (rng.next() - 0.5) * 0.06 * vol * 2;
    const mean = h.kind === 'property' ? 0.004 : 0;
    h.value = round2(Math.max(0, h.value * (1 + move + mean)));
    if (h.kind === 'property' && rng.bool(0.06)) h.value = round2(h.value * 1.01);
  }
}

/** A business can only get so big on a given headcount. */
export function bizCapacity(b: { employees: number; type: string }): number {
  const base = 20_000;
  return Math.max(4_000, base * Math.max(1, b.employees));
}

/**
 * Business P&L each month — the small-business treadmill.
 *
 * Growth is logistic against headcount capacity, so a one-person shop plateaus
 * instead of compounding into a trillion-dollar empire across forty years.
 * Losses are capped at what an owner could plausibly cover in a month.
 */
export function tickBusinesses(s: GameState, rng: Rng): void {
  for (const b of s.businesses) {
    if (!b.active) continue;

    const capacity = bizCapacity(b);
    const headroom = clamp(1 - b.revenue / capacity, -0.6, 1);
    const growthBase = ((b.rep - 45) / 900) * Math.max(0.05, headroom);
    const swing = (rng.next() - 0.48) * 0.2;
    const healthDrag = (60 - b.health) / 900;
    const pct = clamp(growthBase + swing - healthDrag, -0.16, 0.12);

    b.revenue = round2(clamp(b.revenue * (1 + pct), 150, capacity));
    // Costs move toward a margin that reflects how well the business is run.
    // A well-regarded operation keeps ~28% of revenue; a struggling one loses
    // money. Without this, revenue growth compounds and margins never compress.
    const margin = clamp(0.08 + (b.rep - 45) / 260 + (b.health - 60) / 350, -0.18, 0.22);
    const targetExpenses = b.revenue * (1 - margin);
    b.expenses = round2(
      clamp(b.expenses + (targetExpenses - b.expenses) * 0.35, 150, capacity * 1.3),
    );

    const profit = round2(b.revenue - b.expenses);
    b.momentum = profit > 0 ? b.momentum + 1 : Math.min(0, b.momentum - 1);
    b.valuation = round2(
      clamp(
        b.valuation * (1 + clamp(profit / Math.max(4000, b.revenue), -0.06, 0.05)),
        500,
        capacity * 13,
      ),
    );
    b.health = round2(clamp(b.health + (profit > 0 ? 1.6 : -4.2), 0, 100));
    b.rep = round2(clamp(b.rep + (profit > 0 ? 0.6 : -1.6) + (rng.next() - 0.5), 0, 100));
    // A business nobody attends to drifts. Events are how you keep it sharp,
    // so an owner who stops caring slowly stops earning.
    if (s.player.turn - (Number(s.flags.lastBizTurn) || 0) > 18) {
      b.rep = round2(clamp(b.rep - 0.5, 0, 100));
      b.health = round2(clamp(b.health - 0.4, 0, 100));
    }

    if (profit > 0) {
      s.finances.cash = round2(s.finances.cash + profit);
      s.finances.totalEarned = round2(s.finances.totalEarned + profit);
      b.dividendsPaid = round2(b.dividendsPaid + profit);
    } else {
      // The owner eats the loss, but only up to a plausible monthly amount.
      const loss = Math.min(Math.abs(profit), 7_500);
      s.finances.cash = round2(s.finances.cash - loss);
      s.finances.totalSpent = round2(s.finances.totalSpent + loss);
      if (s.finances.cash < 0) {
        s.finances.debt = round2(s.finances.debt + Math.abs(s.finances.cash));
        s.finances.cash = 0;
      }
    }

    // A business that cannot pay its way closes. This is the mercy rule.
    const failing = b.health <= 12 && b.momentum < -4;
    if ((b.health <= 0 || failing) && rng.bool(failing ? 0.5 : 0.35)) {
      b.active = false;
      s.flags[`biz_closed_${b.id}`] = s.player.turn;
      s.feed.push({
        turn: s.player.turn,
        age: s.player.ageYears,
        title: `${b.name} closed`,
        body: 'The paperwork takes a fortnight. The feeling takes longer.',
        tone: 'bad',
        kind: 'system',
      });
    }
  }
}

/* ------------------------------------------------------------- monthly tick */

export interface MonthTick {
  rentPaid: number;
  salaryPaid: number;
  debtInterest: number;
  netCash: number;
  wentBroke: boolean;
}

/**
 * Advances the calendar by `months`, applying salary, rent, living costs,
 * debt interest and market movement. Called once per resolved decision.
 */
export function advanceMonths(s: GameState, months: number, rng: Rng): MonthTick {
  const tick: MonthTick = {
    rentPaid: 0,
    salaryPaid: 0,
    debtInterest: 0,
    netCash: 0,
    wentBroke: false,
  };
  const f = s.finances;

  for (let i = 0; i < months; i++) {
    s.player.turn += 1;
    s.player.ageMonths += 1;
    while (s.player.ageMonths >= 12) {
      s.player.ageMonths -= 12;
      s.player.ageYears += 1;
    }
    s.player.stage = stageForAge(s.player.ageYears);
    s.career.monthsInRole += 1;

    // A modest income floor. Employment can end through no choice of the
    // player's, and an economy where zero income compounds into permanent ruin
    // is not a game, it is a trap. Temp shifts, gig work, benefits.
    if (f.salary <= 0 && s.player.ageYears < 68 && s.player.ageYears >= 18) {
      f.gigIncome = round2(820 + Math.min(900, Math.max(0, s.player.stats.energy) * 7));
    } else if (f.salary > 0) {
      f.gigIncome = round2(f.gigIncome * 0.5);
      if (f.gigIncome < 10) f.gigIncome = 0;
    }

    const income = f.salary + f.sideIncome + f.gigIncome;
    const outgo = f.housingCost + f.livingCost;
    let net = income - outgo;

    if (f.debt > 0) {
      // Interest scales down as the balance grows — crushing, not mathematically
      // impossible to escape. A person always gets a way out.
      // Interest softens as the balance grows: crushing, escapable.
      const rate = f.debt > 250_000 ? 0.0025 : f.debt > 40_000 ? 0.006 : 0.011;
      const interest = round2(f.debt * rate);
      f.debt = round2(f.debt + interest);
      tick.debtInterest = round2(tick.debtInterest + interest);
      net -= interest;
    }
    // Surface a debt crisis as a decision rather than a silent death spiral.
    if (f.debt > 18_000 && !s.flags.debtCrisisQueued && !s.queue.some((q) => q.id === 'chain_debt_crisis')) {
      s.flags.debtCrisisQueued = s.player.turn;
      s.queue.push({ id: 'chain_debt_crisis', dueTurn: s.player.turn + 2, forced: false });
    }
    // A mortgage is serviced by `housingCost`; only the principal balance
    // slowly amortises here so the number keeps moving in the right direction.
    if (f.mortgage > 0) {
      f.mortgage = round2(Math.max(0, f.mortgage * 0.9985));
    }
    if (f.mortgage > 0 && f.mortgage < 500) f.mortgage = 0;

    tick.salaryPaid = round2(tick.salaryPaid + income);
    tick.rentPaid = round2(tick.rentPaid + outgo);

    f.cash = round2(f.cash + net);
    f.totalEarned = round2(f.totalEarned + income);
    f.totalSpent = round2(f.totalSpent + outgo);
    tick.netCash = round2(tick.netCash + net);

    // Lifestyle creep. A CTO does not live like a junior assistant, and the
    // money that would have compounded for fifty years gets spent on a better
    // flat, a car, school fees and takeaway. This is what keeps old age
    // comfortable rather than interplanetary.
    const targetLiving =
      640 + f.salary * 0.22 + f.sideIncome * 0.1 + Math.min(2000, Math.max(0, f.cash) * 0.0035);
    if (Math.abs(f.livingCost - targetLiving) > 20) {
      f.livingCost = round2(f.livingCost + (targetLiving - f.livingCost) * 0.1);
    }

    // Financial stress: being in the red poisons everything else.
    if (f.cash < 0) {
      const covered = Math.min(Math.abs(f.cash), Math.max(0, f.savings));
      if (covered > 0) {
        f.savings = round2(f.savings - covered);
        f.cash = round2(f.cash + covered);
      }
    }
    if (f.cash < 0) {
      if (!tick.wentBroke) {
        tick.wentBroke = true;
        s.flags.timesBroke = (typeof s.flags.timesBroke === 'number' ? s.flags.timesBroke : 0) + 1;
      }
      const shortfall = Math.abs(f.cash);
      f.cash = 0;
      f.debt = round2(f.debt + shortfall);
      s.player.stats.stress = clamp(s.player.stats.stress + 1.7, STAT_MIN, STAT_MAX);
      s.player.stats.happiness = clamp(s.player.stats.happiness - 1.2, STAT_MIN, STAT_MAX);
      s.player.stats.health = clamp(s.player.stats.health - 0.35, STAT_MIN, STAT_MAX);
    }

    tickMarket(s, rng);
    tickBusinesses(s, rng);

    // Passive drift — life keeps happening between decisions.
    const stressDrift = s.player.stats.stress > 65 ? -1.1 : -1.6;
    s.player.stats.stress = clamp(s.player.stats.stress + stressDrift, STAT_MIN, STAT_MAX);
    s.player.stats.energy = clamp(s.player.stats.energy + 1.4, STAT_MIN, STAT_MAX);
    // Ageing, modulated by stress and age. Slow in your twenties, felt later.
    const ageLoad = Math.max(0, (s.player.ageYears - 34) / 240);
    const healthDecay = 0.045 + ageLoad + Math.max(0, (s.player.stats.stress - 50) / 900);
    s.player.stats.health = clamp(s.player.stats.health - healthDecay, STAT_MIN, STAT_MAX);
    // The body recovers a little when life is calm.
    if (s.player.stats.stress < 40 && s.player.stats.health < 92) {
      s.player.stats.health = clamp(s.player.stats.health + 0.09, STAT_MIN, STAT_MAX);
    }
    if (s.player.stats.health < 45) {
      s.player.stats.happiness = clamp(s.player.stats.happiness - 0.6, STAT_MIN, STAT_MAX);
      s.player.stats.energy = clamp(s.player.stats.energy - 0.8, STAT_MIN, STAT_MAX);
    }
    if (s.romance.status === 'married' || s.romance.status === 'engaged') {
      s.romance.monthsTogether += 1;
      s.player.stats.happiness = clamp(s.player.stats.happiness + 0.25, STAT_MIN, STAT_MAX);
    } else if (s.romance.status === 'dating') {
      s.romance.monthsTogether += 1;
    }
    if (s.player.stats.reputation > 50) s.player.stats.career = clamp(s.player.stats.career + 0.2, STAT_MIN, STAT_MAX);
    if (s.player.stats.stress > 80) s.player.stats.career = clamp(s.player.stats.career - 0.3, STAT_MIN, STAT_MAX);

    // Career seniority trickles up with tenure and performance.
    if (s.flags.employed !== false) {
      const perfPush = (s.career.performance - 50) / 100;
      s.player.stats.career = clamp(s.player.stats.career + perfPush * 0.6, STAT_MIN, STAT_MAX);
    }
  }

  const nw = s.finances.cash + s.finances.savings - s.finances.debt;
  if (nw > s.finances.peakNetWorth) s.finances.peakNetWorth = round2(nw);
  s.player.peakStress = Math.max(s.player.peakStress, s.player.stats.stress);
  s.player.lowestHappiness = Math.min(s.player.lowestHappiness, s.player.stats.happiness);
  s.player.ageYears = Math.min(s.player.ageYears, 200);
  s.player.stage = stageForAge(s.player.ageYears);
  return tick;
}

/** Applies a whole effect bundle without a report (used by monthly systems). */
export function silentApply(s: GameState, fn: (state: GameState) => void): void {
  fn(s);
}

export { emptyReport };
