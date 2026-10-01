import { Rng } from '../src/engine/rng';
import { createNewGame, freshMeta } from '../src/engine/state';
import { defaultSettings } from '../src/engine/save';
import { pickNextEvent, resolveChoice, sanitize, checkEndings } from '../src/engine/engine';
import { MAX_AGE } from '../src/engine/catalog';
import { netWorth } from '../src/engine/conditions';
import { homeDef } from '../src/engine/catalog';
import type { Trait } from '../src/engine/types';

const STRATEGY = (process.env.STRATEGY ?? 'random') as 'random' | 'careful';
const traits: Trait[] = ['ambitious','charming','risk_taker','practical','creative'];

type SimChoice = {
  tag?: string;
  requires?: unknown;
  cost?: number;
  outcomes?: { fx?: { money?: number; salary?: number } }[];
};

/** Approximates a thoughtful player: safe/smart plays, and keeps an eye on money. */
function carefulPick(choices: SimChoice[], jitter: number): number {
  const rank: Record<string, number> = { smart: 0, safe: 1, kind: 1, bold: 2, lazy: 3, risky: 4, chaotic: 5, cruel: 6, greedy: 3 };
  let best = 0;
  let bestScore = 99;
  choices.forEach((c, i) => {
    const tag = (rank[c.tag ?? 'bold'] ?? 3) * 0.6;
    const outs = c.outcomes ?? [];
    const avgMoney = outs.length
      ? outs.reduce((a, o) => a + (o.fx?.money ?? 0), 0) / outs.length
      : 0;
    const riskPenalty = c.cost ? -c.cost / 25_000 : 0;
    // A careful player does not pay for something that returns nothing.
    const money = -Math.max(-1.6, Math.min(1.6, avgMoney / 12_000));
    const score = tag + money + riskPenalty + ((jitter + i) % 3) * 0.25;
    if (score < bestScore) { bestScore = score; best = i; }
  });
  return best;
}
let totalDecisions = 0, totalAge = 0, n = 0;
const components: Record<string, number[]> = {};
const endingCounts: Record<string, number> = {};
const nwSamples: number[] = [];
let millions = 0;
const stageCounts: Record<string, number> = {};

for (let seed = 0; seed < 120; seed++) {
  const identity = { name: 'Sim', avatar: 'a1', trait: traits[seed % 5], look: 'l1', pronouns: 'they/them' as const };
  const s = createNewGame({ identity, settings: defaultSettings(), meta: freshMeta(), seed: seed * 7717 + 3 });
  const rng = new Rng(s.seed);
  let i = 0;
  for (; i < 1200 && s.player.alive && s.player.ageYears < MAX_AGE; i++) {
    rng.state = s.rngState;
    const ev = pickNextEvent(s, rng);
    s.rngState = rng.state;
    s.currentEventId = ev.id;
    stageCounts[s.player.stage] = (stageCounts[s.player.stage] ?? 0) + 1;
    const n2 = ev.choices.length;
    const idx = STRATEGY === 'careful'
      ? carefulPick(ev.choices as SimChoice[], seed + i)
      : (seed + i * 3) % n2;
    const res = resolveChoice(s, rng, ev, idx);
    s.rngState = rng.state;
    sanitize(s);
    if (res.ended) { s.player.endingId = res.endingId; break; }
  }
  const end = s.player.endingId ?? checkEndings(s, true);
  endingCounts[end ?? 'none'] = (endingCounts[end ?? 'none'] ?? 0) + 1;
  totalDecisions += i; totalAge += s.player.ageYears; n++;
  const nw = netWorth(s);
  nwSamples.push(nw);
  if (nw >= 10_000_000) millions++;
  const comp = {
    cash: s.finances.cash, savings: s.finances.savings,
    biz: s.businesses.filter(b=>b.active).reduce((a,b)=>a+b.valuation,0),
    holdings: s.holdings.filter(h=>!h.sold).reduce((a,h)=>a+h.value,0),
    home: homeDef(s.player.homeTier).owned ? homeDef(s.player.homeTier).value : 0,
    mortgage: s.finances.mortgage, debt: s.finances.debt,
    salary: s.finances.salary, living: s.finances.livingCost, housing: s.finances.housingCost,
  };
  for (const [k,v] of Object.entries(comp)) (components[k] ??= []).push(v as number);
}
console.log('lives:', n, 'avg decisions:', (totalDecisions/n).toFixed(1), 'avg age reached:', (totalAge/n).toFixed(1));
console.log('net worth: median', nwSamples.sort((a,b)=>a-b)[Math.floor(nwSamples.length/2)].toFixed(0), 'max', Math.max(...nwSamples).toFixed(0), '>=10M:', millions);
const med = (xs:number[]) => xs.sort((a,b)=>a-b)[Math.floor(xs.length/2)];
console.log('components (median):', Object.fromEntries(Object.entries(components).map(([k,v])=>[k, Math.round(med(v))])));
console.log('stages:', stageCounts);
console.log('endings:');
for (const [k,v] of Object.entries(endingCounts).sort((a,b)=>b[1]-a[1])) console.log('  ', k, v);
