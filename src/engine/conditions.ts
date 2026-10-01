import type {
  Cond,
  Fx,
  GameState,
  StatKey,
  Business,
  NpcState,
  Holding,
} from './types';
import { STAT_MAX, STAT_MIN } from './types';
import { clamp, Rng, round2 } from './rng';
import {
  bizDef,
  careerSalary,
  careerTitle,
  homeDef,
  maxLevel,
  PARTNER_ALIAS,
  ROMANCE_CANDIDATES,
} from './catalog';

/* ----------------------------------------------------------------- net worth */

export function netWorth(s: GameState): number {
  const bizValue = s.businesses.filter((b) => b.active).reduce((a, b) => a + b.valuation, 0);
  const holdings = s.holdings.filter((h) => !h.sold).reduce((a, h) => a + h.value, 0);
  const home = homeDef(s.player.homeTier);
  const homeValue = home.owned ? home.value : 0;
  return round2(
    s.finances.cash +
      s.finances.savings +
      bizValue +
      holdings +
      homeValue -
      s.finances.debt -
      s.finances.mortgage,
  );
}

/** Property equity — what the player would walk away with after selling. */
export function homeEquity(s: GameState): number {
  const home = homeDef(s.player.homeTier);
  if (!home.owned) return 0;
  return round2(home.value - s.finances.mortgage);
}

export function liquidWealth(s: GameState): number {
  return s.finances.cash + s.finances.savings;
}

export function monthlyIncome(s: GameState): number {
  const bizProfit = s.businesses
    .filter((b) => b.active)
    .reduce((a, b) => a + Math.max(0, b.revenue - b.expenses), 0);
  return s.finances.salary + s.finances.sideIncome + bizProfit;
}

export function monthlyExpenses(s: GameState): number {
  return s.finances.housingCost + s.finances.livingCost;
}

/* -------------------------------------------------------------- conditions */

export interface EvalContext {
  rng: Rng;
  /** When evaluating hypothetical pools we don't want `chance` to consume RNG. */
  consumeChance?: boolean;
}

function inRange(v: number, range: [number | null, number | null] | undefined): boolean {
  if (!range) return true;
  const [lo, hi] = range;
  if (lo !== null && v < lo) return false;
  if (hi !== null && v > hi) return false;
  return true;
}

function truthy(v: number | boolean | string | undefined): boolean {
  if (v === undefined) return false;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  return v !== '' && v !== 'false';
}

/**
 * Evaluates a prerequisite tree. `context` defaults are provided so content can
 * call this from tests/tools without threading an Rng through.
 */
export function evalCond(
  cond: Cond | undefined,
  s: GameState,
  ctx: EvalContext = { rng: new Rng(1), consumeChance: false },
): boolean {
  if (!cond) return true;

  const p = s.player;

  if (cond.all && !cond.all.every((c) => evalCond(c, s, ctx))) return false;
  if (cond.any && !cond.any.some((c) => evalCond(c, s, ctx))) return false;
  if (cond.not && evalCond(cond.not, s, ctx)) return false;

  if (cond.age && !inRange(p.ageYears, cond.age)) return false;
  if (cond.year) {
    const years = Math.floor(p.turn / 12);
    if (!inRange(years, cond.year)) return false;
  }
  if (cond.stage && !cond.stage.includes(p.stage)) return false;
  if (cond.trait && !cond.trait.includes(p.identity.trait)) return false;

  if (cond.stats) {
    for (const [k, range] of Object.entries(cond.stats) as [StatKey, [number, number]][]) {
      if (!inRange(p.stats[k] ?? 0, range)) return false;
    }
  }

  if (cond.flags) {
    for (const [k, range] of Object.entries(cond.flags)) {
      const v = s.flags[k];
      if (v === undefined) return false;
      if (typeof v === 'boolean') {
        if (!inRange(v ? 1 : 0, range)) return false;
      } else if (typeof v === 'number') {
        if (!inRange(v, range)) return false;
      } else {
        return false;
      }
    }
  }

  if (cond.npc) {
    for (const [rawId, range] of Object.entries(cond.npc)) {
      const id = resolveNpcAlias(s, rawId);
      if (!id) return false;
      const n = s.npcs[id];
      if (!n || !inRange(n.score, range)) return false;
    }
  }
  if (cond.romanceMonths && !inRange(s.romance.monthsTogether, cond.romanceMonths)) {
    return false;
  }

  if (cond.partner && cond.partner !== 'any' && !cond.partner.includes(s.romance.status)) {
    return false;
  }
  if (cond.partner === 'any' && s.romance.status === 'single') return false;

  if (cond.children && !inRange(s.romance.children, cond.children)) return false;

  if (cond.career) {
    if (cond.career.path && !cond.career.path.includes(s.career.path)) return false;
    if (cond.career.level && !inRange(s.career.level, cond.career.level)) return false;
    if (cond.career.employed !== undefined) {
      const employed = s.career.level >= 0 && truthy(s.flags.employed);
      if (employed !== cond.career.employed) return false;
    }
    if (
      cond.career.titleContains &&
      !s.career.title.toLowerCase().includes(cond.career.titleContains.toLowerCase())
    ) {
      return false;
    }
  }

  if (cond.businesses) {
    const active = s.businesses.filter((b) => b.active);
    if (cond.businesses.count && !inRange(active.length, cond.businesses.count)) return false;
    if (cond.businesses.types && !active.some((b) => cond.businesses!.types!.includes(b.type))) {
      return false;
    }
  }

  if (cond.holdings) {
    const held = s.holdings.filter((h) => !h.sold);
    if (cond.holdings.count && !inRange(held.length, cond.holdings.count)) return false;
    if (cond.holdings.kinds && !held.some((h) => cond.holdings!.kinds!.includes(h.kind))) {
      return false;
    }
  }

  if (cond.has && !cond.has.every((k) => truthy(s.flags[k]))) return false;
  if (cond.lacks && cond.lacks.some((k) => truthy(s.flags[k]))) return false;

  if (cond.homeTier && !cond.homeTier.includes(s.player.homeTier)) return false;

  if (cond.minCash !== undefined && s.finances.cash + s.finances.savings < cond.minCash) {
    return false;
  }
  if (cond.minNetWorth !== undefined && netWorth(s) < cond.minNetWorth) return false;
  if (cond.maxNetWorth !== undefined && netWorth(s) > cond.maxNetWorth) return false;
  if (cond.debt && !inRange(s.finances.debt, cond.debt)) return false;
  if (cond.run) {
    for (const [k, range] of Object.entries(cond.run)) {
      const v = s.runStats[k as keyof typeof s.runStats] ?? 0;
      if (!inRange(v as number, range as [number | null, number | null])) return false;
    }
  }

  if (cond.seen) {
    const times = s.seen[cond.seen.id] === undefined ? 0 : countSeen(s, cond.seen.id);
    if (!inRange(times, cond.seen.times ?? [null, null])) return false;
  }

  if (cond.tags && !cond.tags.every((t) => p.tags.includes(t))) return false;

  if (cond.chance !== undefined && ctx.consumeChance !== false) {
    if (!ctx.rng.bool(cond.chance)) return false;
  }

  return true;
}

/** Counts how many times an event has actually been played (not just queued). */
export function countSeen(s: GameState, id: string): number {
  return s.seenCount[id] ?? 0;
}

/* --------------------------------------------------------- effects applier */

export interface DeltaReport {
  stats: Partial<Record<StatKey, number>>;
  money: number;
  savings: number;
  debt: number;
  income: number;
  expense: number;
  salary: number;
  npc: Record<string, number>;
  flags: Record<string, number | boolean | string>;
  achievements: string[];
  unlocks: string[];
  business?: string;
  headline?: string[];
  milestone?: string[];
  ending?: string;
  movedTo?: string;
  partner?: string;
  child?: number;
}

export function emptyReport(): DeltaReport {
  return {
    stats: {},
    money: 0,
    savings: 0,
    debt: 0,
    income: 0,
    expense: 0,
    salary: 0,
    npc: {},
    flags: {},
    achievements: [],
    unlocks: [],
    headline: [],
    milestone: [],
  };
}

const asList = (v: string | string[] | undefined): string[] =>
  v === undefined ? [] : Array.isArray(v) ? v : [v];

function bump(report: DeltaReport, key: StatKey, before: number, after: number) {
  const d = round2(after - before);
  if (d === 0) return;
  report.stats[key] = round2((report.stats[key] ?? 0) + d);
}

/**
 * Applies an effect bundle to the game state and reports exactly what changed.
 * The report drives the animated consequence screen, so it must reflect *real*
 * deltas after clamping (reporting "+18 stress" when stress only moved 4 is a
 * lie the player will notice).
 */
export function applyFx(s: GameState, fx: Fx | undefined, report?: DeltaReport): DeltaReport {
  const r = report ?? emptyReport();
  if (!fx) return r;
  const p = s.player;
  const f = s.finances;

  if (fx.money) {
    const before = f.cash;
    f.cash = round2(f.cash + fx.money);
    r.money = round2(r.money + (f.cash - before));
    if (fx.money > 0) f.totalEarned = round2(f.totalEarned + fx.money);
    else f.totalSpent = round2(f.totalSpent - fx.money);
    if (fx.money < 0 && Math.abs(fx.money) > f.worstLoss) {
      f.worstLoss = Math.abs(fx.money);
    }
    if (fx.money > 0 && fx.money > f.bestGain) f.bestGain = fx.money;
  }
  if (fx.savings) {
    const before = f.savings;
    f.savings = round2(Math.max(0, f.savings + fx.savings));
    r.savings = round2(r.savings + (f.savings - before));
    if (fx.savings > 0) f.totalEarned = round2(f.totalEarned + fx.savings);
  }
  if (fx.debt) {
    const before = f.debt;
    f.debt = round2(Math.max(0, f.debt + fx.debt));
    r.debt = round2(r.debt + (f.debt - before));
  }
  if (fx.debtPct) {
    const before = f.debt;
    f.debt = round2(Math.max(0, f.debt * (1 + fx.debtPct)));
    r.debt = round2(r.debt + (f.debt - before));
  }
  if (fx.mortgage) {
    f.mortgage = round2(Math.max(0, f.mortgage + fx.mortgage));
  }
  if (fx.income) {
    f.sideIncome = round2(f.sideIncome + fx.income);
    r.income = round2(r.income + fx.income);
  }
  if (fx.expense) {
    f.livingCost = round2(Math.max(0, f.livingCost + fx.expense));
    r.expense = round2(r.expense + fx.expense);
  }
  if (fx.salaryPct) {
    f.salary = Math.max(0, Math.round(f.salary * (1 + fx.salaryPct) / 10) * 10);
    r.salary = f.salary;
  }
  if (fx.setSalary !== undefined) {
    f.salary = Math.max(0, Math.round(fx.setSalary));
    r.salary = f.salary;
  }

  const statKeys: StatKey[] = [
    'career',
    'happiness',
    'stress',
    'relationships',
    'reputation',
    'health',
    'energy',
    'karma',
  ];
  for (const k of statKeys) {
    const v = fx[k as keyof Fx];
    if (typeof v === 'number' && v !== 0) {
      const before = p.stats[k];
      p.stats[k] = round2(clamp(before + v, STAT_MIN, STAT_MAX));
      bump(r, k, before, p.stats[k]);
      if (k === 'stress' && p.stats.stress > p.peakStress) p.peakStress = p.stats.stress;
      if (k === 'happiness' && p.stats.happiness < p.lowestHappiness) {
        p.lowestHappiness = p.stats.happiness;
      }
    }
  }

  if (fx.jobPerf) {
    s.career.performance = round2(clamp(s.career.performance + fx.jobPerf * 100, 0, 100));
  }

  if (fx.npc) {
    for (const [rawId, delta] of Object.entries(fx.npc)) {
      const id = resolveNpcAlias(s, rawId) ?? rawId;
      const n = ensureNpc(s, id);
      const before = n.score;
      n.score = round2(clamp(before + delta, -100, 100));
      r.npc[id] = round2(r.npc[id] ? r.npc[id] + (n.score - before) : n.score - before);
    }
  }

  if (fx.remember) {
    for (const [rawId, note] of Object.entries(fx.remember)) {
      const id = resolveNpcAlias(s, rawId) ?? rawId;
      const n = ensureNpc(s, id);
      n.memory.push({
        turn: s.player.turn,
        age: s.player.ageYears,
        note,
        grudge: (r.npc[id] ?? 0) < 0,
      });
      if (n.memory.length > 12) n.memory.shift();
    }
  }

  if (fx.flag) {
    for (const [k, v] of Object.entries(fx.flag)) {
      if (typeof v === 'number') {
        const before = typeof s.flags[k] === 'number' ? (s.flags[k] as number) : 0;
        s.flags[k] = round2(before + v);
        r.flags[k] = s.flags[k];
      } else {
        s.flags[k] = v;
        r.flags[k] = v;
      }
    }
  }

  if (fx.biz) {
    const target = fx.biz.id
      ? s.businesses.find((b) => b.id === fx.biz!.id)
      : s.businesses.find((b) => b.active);
    if (fx.biz.launch) {
      const created = launchBusiness(s, fx.biz.launch);
      r.business = created.id;
      s.flags.lastBizTurn = s.player.turn;
      r.headline!.push(`Founded ${created.name}`);
    } else if (target) {
      if (fx.biz.revenue) target.revenue = round2(Math.max(0, target.revenue + fx.biz.revenue));
      if (fx.biz.expenses) target.expenses = round2(Math.max(0, target.expenses + fx.biz.expenses));
      if (fx.biz.value) target.valuation = round2(Math.max(0, target.valuation + fx.biz.value));
      if (fx.biz.employees) {
        target.employees = Math.max(0, target.employees + fx.biz.employees);
      }
      if (fx.biz.rep) target.rep = round2(clamp(target.rep + fx.biz.rep, 0, 100));
      if (fx.biz.health) target.health = round2(clamp(target.health + fx.biz.health, 0, 100));
      r.business = target.id;
      s.flags.lastBizTurn = s.player.turn;
      if (fx.biz.close) {
        target.active = false;
        r.headline!.push(`${target.name} closed`);
      }
    }
  }

  for (const id of asList(fx.ach)) {
    if (awardAchievementInternal(s, id)) r.achievements.push(id);
  }
  for (const id of asList(fx.unlock)) {
    if (unlockAlbum(s, id)) r.unlocks.push(id);
  }
  for (const t of asList(fx.tag)) if (!s.player.tags.includes(t)) s.player.tags.push(t);
  if (fx.counter) {
    // Authoritative counters. A few of them also feed the lifetime run stats
    // that endings and achievements read from.
    const mirrored: Record<string, keyof typeof s.runStats> = {
      jobsLost: 'timesFired',
      promotions: 'promotions',
      loansTaken: 'loansTaken',
      breakups: 'breakups',
    };
    for (const [k, v] of Object.entries(fx.counter)) {
      s.achievements.counters[k] = (s.achievements.counters[k] ?? 0) + v;
      const target = mirrored[k];
      if (target && typeof s.runStats[target] === 'number') {
        (s.runStats[target] as number) += v;
      }
    }
  }
  if (fx.setCareer !== undefined) {
    if (fx.setCareer === null) {
      s.flags.employed = false;
    } else {
      const path = fx.setCareer.path;
      const lvl = clamp(fx.setCareer.level, 0, maxLevel(path));
      s.career.path = path;
      s.career.level = lvl;
      s.career.monthsInRole = 0;
      s.flags.employed = true;
    }
    syncCareer(s, true);
  }
  if (fx.setPartner) {
    const requested = fx.setPartner.npcId;
    let id: string | null = requested;
    if (requested === 'new') {
      id = pickNewPartner(s);
      const n = ensureNpc(s, id);
      n.met = true;
      n.flags.romanced = true;
    } else if (requested === PARTNER_ALIAS) {
      id = s.romance.partnerId;
    }
    if (id) {
      const n = ensureNpc(s, id);
      n.met = true;
      n.status = fx.setPartner.status;
      if (s.romance.partnerId !== id) s.romance.monthsTogether = 0;
    }
    s.romance.status = fx.setPartner.status;
    s.romance.partnerId = id;
    if (fx.setPartner.status === 'single' || fx.setPartner.status === 'divorced') {
      const wasAttached =
        s.romance.status === 'dating' ||
        s.romance.status === 'engaged' ||
        s.romance.status === 'married';
      s.romance.monthsTogether = 0;
      s.romance.partnerId = null;
      if (id) ensureNpc(s, id).status = fx.setPartner.status;
      if (wasAttached) {
        s.runStats.breakups += 1;
        s.romance.breakups += 1;
      }
    }
    r.partner = fx.setPartner.status;
  }
  if (fx.child) {
    s.romance.children = Math.max(0, s.romance.children + fx.child);
    r.child = fx.child;
  }
  if (fx.log) r.headline!.push(fx.log);
  for (const m of asList(fx.milestone)) {
    if (unlockAlbum(s, m)) r.milestone!.push(m);
  }
  if (fx.buyHome) {
    const def = homeDef(fx.buyHome.tier);
    const down = fx.buyHome.down ?? def.moveInCost;
    f.cash = round2(f.cash - down);
    f.totalSpent = round2(f.totalSpent + down);
    r.money = round2(r.money - down);
    f.mortgage = round2(f.mortgage + Math.max(0, def.value - down));
    moveHome(s, def.id, r);
    s.runStats.propertiesBought += 1;
    if (!s.player.tags.includes('homeowner')) s.player.tags.push('homeowner');
  }
  if (fx.moveTo) {
    moveHome(s, fx.moveTo, r);
  }

  if (r.money !== 0 || r.savings !== 0) {
    const nw = netWorth(s);
    if (nw > s.finances.peakNetWorth) s.finances.peakNetWorth = round2(nw);
  }

  return r;
}

/* --------------------------------------------------------------- helpers */

/**
 * Resolves relationship aliases used by content. `partner` always refers to
 * whoever the player is actually with right now, so a single authored event
 * works for every love interest in the pool.
 */
export function resolveNpcAlias(s: GameState, id: string): string | null {
  if (id === PARTNER_ALIAS || id === 'romance') {
    return s.romance.partnerId ?? null;
  }
  return id;
}

/**
 * Picks the next unused love interest. Deterministic given the save state, so
 * a reload can never reroll who the player ends up with.
 */
export function pickNewPartner(s: GameState): string {
  const used = new Set(
    Object.values(s.npcs)
      .filter((n) => n.flags.romanced === true)
      .map((n) => n.id),
  );
  const pool = ROMANCE_CANDIDATES.filter((id) => !used.has(id));
  const list = pool.length ? pool : [...ROMANCE_CANDIDATES];
  const roll = (s.seed + s.rngState + s.player.turn * 7919) >>> 0;
  return list[roll % list.length];
}

export function ensureNpc(s: GameState, id: string): NpcState {
  if (!s.npcs[id]) {
    s.npcs[id] = { id, score: 0, met: false, alive: true, memory: [], flags: {} };
  }
  return s.npcs[id];
}

/** Keeps title and salary consistent with the current path/level. */
export function syncCareer(s: GameState, resetPerformance = false): void {
  const employed = truthy(s.flags.employed);
  const def = s.career;
  if (!employed) {
    def.title = 'Between Jobs';
    s.finances.salary = 0;
    return;
  }
  const path = def.path;
  const levels = maxLevel(path);
  def.level = clamp(def.level, 0, levels);
  def.title = careerTitleFor(path, def.level);
  if (resetPerformance) def.performance = clamp(def.performance, 30, 70);
  s.finances.salary = careerSalary(path, def.level, def.performance);
  if (def.level > def.peakLevel) {
    def.peakLevel = def.level;
    def.peakTitle = def.title;
  }
}

function careerTitleFor(path: GameState['career']['path'], level: number): string {
  return careerTitle(path, level);
}

export function launchBusiness(s: GameState, type: Business['type'], name?: string): Business {
  const def = bizDef(type);
  const biz: Business = {
    id: `biz_${s.businesses.length + 1}_${type}`,
    type,
    name: name ?? defaultBusinessName(type, s.businesses.length),
    foundedTurn: s.player.turn,
    revenue: def.baseRevenue,
    expenses: def.baseExpenses,
    employees: 1,
    rep: 40,
    health: 62,
    valuation: Math.round(def.setupCost * 0.8),
    momentum: 0,
    active: true,
    dividendsPaid: 0,
  };
  s.businesses.push(biz);
  s.runStats.businessesFounded += 1;
  if (!s.player.tags.includes('founder')) s.player.tags.push('founder');
  if (!s.album.businesses.includes(type)) s.album.businesses.push(type);
  return biz;
}

function defaultBusinessName(type: Business['type'], n: number): string {
  const names: Record<string, string[]> = {
    coffee_shop: ['The Daily Grind', 'Bean There', 'Second Cup Of Regret'],
    software_startup: ['Volt Systems', 'Parsely', 'Nice Try Inc.'],
    online_store: ['Curated Chaos', 'The Drop Ship', 'Warehouse West'],
    restaurant: ['Table 12', 'Osteria Nova', 'The Half Portion'],
    consulting: ['Clearview Advisory', 'Third Opinion', 'Slide Deck & Co.'],
    content_studio: ['Loud House Media', 'Format', 'The Algorithm'],
    real_estate: ['Keystone Properties', 'Brick & Mortar', 'Corner Lot Holdings'],
    food_truck: ['Wheels & Meals', 'The Rolling Spoon', 'Curbside'],
  };
  const list = names[type] ?? ['Untitled Venture'];
  return list[n % list.length];
}

export function moveHome(s: GameState, tierId: string, r?: DeltaReport): void {
  const def = homeDef(tierId as never);
  const report = r ?? emptyReport();
  const before = s.player.homeTier;
  s.player.homeTier = def.id;
  s.finances.housingCost = def.cost;
  if (r) {
    r.expense = round2(def.cost - (before === def.id ? def.cost : def.cost));
  }
  report.movedTo = def.id;
  if (before !== def.id) {
    report.headline!.push(`Moved: ${def.name}`);
    if (!s.album.milestones.includes(`home_${def.id}`)) {
      s.album.milestones.push(`home_${def.id}`);
    }
  }
}

export function awardAchievementInternal(s: GameState, id: string): boolean {
  if (s.achievements.unlocked[id]) return false;
  s.achievements.unlocked[id] = {
    id,
    unlockedTurn: s.player.turn,
    unlockedAge: s.player.ageYears,
  };
  return true;
}

export function unlockAlbum(s: GameState, id: string): boolean {
  if (s.album.milestones.includes(id)) return false;
  s.album.milestones.push(id);
  return true;
}

export function markUnlocked(s: GameState, id: string, key: string): boolean {
  const arr = (s.album as unknown as Record<string, string[]>)[key];
  if (!arr || arr.includes(id)) return false;
  arr.push(id);
  return true;
}

export function addHolding(s: GameState, h: Holding): void {
  s.holdings.push(h);
}

export function describeCond(cond: Cond | undefined, s: GameState): string {
  if (!cond) return '';
  const bits: string[] = [];
  if (cond.stats) {
    for (const [k, range] of Object.entries(cond.stats)) {
      const [lo, hi] = range as [number | null, number | null];
      if (lo !== null && hi === null) bits.push(`${label(k)} ${lo}+`);
      else if (lo === null && hi !== null) bits.push(`${label(k)} under ${hi}`);
      else if (lo !== null && hi !== null) bits.push(`${label(k)} ${lo}–${hi}`);
    }
  }
  if (cond.partner && cond.partner !== 'any') {
    bits.push(
      cond.partner.includes('married')
        ? 'married'
        : cond.partner.includes('dating') || cond.partner.includes('engaged')
          ? 'in a relationship'
          : 'single',
    );
  }
  if (cond.age) bits.push(`age ${cond.age[0]}+`);
  if (cond.children) bits.push(`${cond.children[0]}+ kids`);
  if (cond.career?.level) bits.push(`${careerLevelWord(cond.career.level[0], s)}`);
  if (cond.trait) bits.push(`${cond.trait[0].replace('_', ' ')} trait`);
  if (cond.businesses?.count) bits.push(`${cond.businesses.count[0]}+ businesses`);
  if (cond.flags) {
    for (const [k, range] of Object.entries(cond.flags)) {
      const [lo] = range;
      if (lo !== null) bits.push(`${label(k)} ${lo}+`);
    }
  }
  if (cond.has) for (const k of cond.has) bits.push(label(k));
  return bits.filter(Boolean).join(' · ');
}

function careerLevelWord(level: number, s: GameState): string {
  const lvl = level ?? 0;
  if (lvl >= s.career.peakLevel) return `${lvl}+ promotion level`;
  return `career level ${lvl}+`;
}

function label(k: string): string {
  return k
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^\w/, (c) => c.toUpperCase());
}
