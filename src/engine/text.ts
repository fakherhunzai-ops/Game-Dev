import type { GameState } from './types';
import { homeDef, stageDef, traitDef } from './catalog';
import { NPC_DEFS } from '../content/npcs';

const money = (n: number): string =>
  n < 0
    ? `-$${Math.abs(Math.round(n)).toLocaleString('en-US')}`
    : `$${Math.round(n).toLocaleString('en-US')}`;

const moneyShort = (n: number): string => {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1000).toFixed(abs >= 100_000 ? 0 : 1)}K`;
  return `${sign}$${Math.round(abs)}`;
};

export { money as fmtMoney, moneyShort as fmtMoneyShort };

/**
 * Resolves {tokens} in event copy against the live game state.
 * Content authors write `{friend}`, `{boss}`, `{partner}` — never hard-coded
 * names — so a player who married Sam never reads about Alex.
 */
export function fillTokens(text: string, s: GameState): string {
  const npcName = (id: string): string => {
    const n = s.npcs[id];
    const def = NPC_DEFS.find((d) => d.id === id);
    if (!def) return 'Someone';
    if (!n || !n.met) return def.name;
    return def.name;
  };

  const partnerId = s.romance.partnerId;
  const partnerName = partnerId ? npcName(partnerId) : 'your partner';
  const kids = s.romance.children;

  const map: Record<string, string> = {
    name: s.player.identity.name,
    age: String(s.player.ageYears),
    ageNext: String(s.player.ageYears + 1),
    job: s.flags.employed === false ? 'between jobs' : s.career.title,
    title: s.career.title,
    employer: s.career.employer,
    salary: money(s.finances.salary),
    rent: money(s.finances.housingCost),
    money: money(s.finances.cash),
    savings: money(s.finances.savings),
    debt: money(s.finances.debt),
    city: typeof s.flags.city === 'string' ? s.flags.city : 'the city',
    home: homeDef(s.player.homeTier).name,
    stage: stageDef(s.player.stage).name,
    trait: traitDef(s.player.identity.trait).name,
    friend: npcName('jess'),
    friend2: npcName('marcus'),
    chaos: npcName('chad'),
    coworker: npcName('priya'),
    boss: npcName('boss_gary'),
    mum: npcName('mum'),
    mom: npcName('mum'),
    dad: npcName('dad'),
    brother: npcName('brother_eli'),
    sibling: npcName('brother_eli'),
    doctor: npcName('dr_chen'),
    investor: npcName('investor_vera'),
    partner: partnerName,
    partnerName,
    kids: kids === 0 ? 'no kids' : kids === 1 ? 'a child' : `${kids} children`,
    kidsCount: String(kids),
    biz: s.businesses.find((b) => b.active)?.name ?? 'the business',
    bizShort: s.businesses.find((b) => b.active)?.name.split(' ')[0] ?? 'the business',
  };

  return text.replace(/\{(\w+)\}/g, (full, key: string) => {
    const v = map[key];
    return v === undefined ? full : v;
  });
}

export const ageWord = (age: number): string => {
  if (age < 30) return 'twenties';
  if (age < 40) return 'thirties';
  if (age < 50) return 'forties';
  if (age < 60) return 'fifties';
  return 'later years';
};

export const stageLabel = (s: GameState): string => stageDef(s.player.stage).name;
