import type { GameEvent } from '../engine/types';
import { EVENT_MAP } from './index';

/**
 * DAILY DILEMMA
 *
 * One hand-picked scenario per day, seeded by the UTC date so every player
 * gets the same card. Playable in about forty seconds with a guest character
 * whose stats are set by the card itself, so the daily never touches your run.
 */
export interface DailyScenario {
  id: string;
  /** Overrides for the guest avatar's opening state. */
  overrides?: {
    age?: number;
    stats?: Partial<Record<'career' | 'happiness' | 'stress' | 'relationships' | 'reputation' | 'health' | 'energy', number>>;
    flags?: Record<string, number | boolean>;
  };
}

/** Curated pool — strong scenarios that read well in isolation. */
export const DAILY_POOL: string[] = [
  'career_salary_spreadsheet',
  'career_lie_to_boss',
  'career_credit_stolen',
  'friend_hotdog_startup',
  'friend_borrow_ten_k',
  'romance_ex_returns',
  'money_scam_or_opportunity',
  'money_lottery_ticket',
  'social_viral_post',
  'biz_founding_itch',
  'health_mind',
  'family_inheritance',
  'random_payroll_error',
  'career_office_romance',
  'housing_rent_increase',
  'social_networking_event',
  'health_drinking_question',
  'career_promotion_gauntlet',
  'invest_crash_panic',
  'travel_promotion_abroad',
];

/** Overrides that make each daily card land with sensible numbers. */
export const DAILY_OVERRIDES: Record<string, DailyScenario['overrides']> = {
  career_salary_spreadsheet: { age: 27, stats: { career: 45, stress: 40 }, flags: { employed: true } },
  career_lie_to_boss: { age: 25, stats: { career: 40, stress: 45 }, flags: { employed: true } },
  friend_hotdog_startup: { age: 26, stats: { relationships: 70 }, flags: { cash: 12000 } },
  friend_borrow_ten_k: { age: 31, stats: { relationships: 65 } },
  money_scam_or_opportunity: { age: 34, stats: { happiness: 55 } },
  biz_founding_itch: { age: 29, stats: { career: 55, stress: 50 } },
  travel_promotion_abroad: { age: 31, stats: { career: 60 }, flags: { employed: true, married: true } },
  invest_crash_panic: { age: 38, stats: { stress: 65 } },
  health_mind: { age: 33, stats: { happiness: 35, stress: 60 } },
  romance_ex_returns: { age: 30, stats: { relationships: 60 } },
};

export interface DailyCard {
  date: string;
  event: GameEvent;
  overrides: DailyScenario['overrides'];
  index: number;
}

/** Deterministic index from a date string — everyone sees the same card. */
export function dailyIndexFor(date: string, length: number): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < date.length; i++) {
    h ^= date.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h % length;
}

export function dailyCard(date: string): DailyCard {
  const index = dailyIndexFor(date, DAILY_POOL.length);
  const id = DAILY_POOL[index];
  const event = EVENT_MAP[id] ?? EVENT_MAP[Object.keys(EVENT_MAP)[0]];
  return {
    date,
    event,
    overrides: DAILY_OVERRIDES[id],
    index,
  };
}

/**
 * Placeholder for the community-split feature. When a backend exists, this is
 * the single call that needs replacing — the UI already renders the result.
 */
export const COMMUNITY_BACKEND_ENABLED = false;
export function fetchCommunitySplit(
  _eventId: string,
  _date: string,
): Promise<number[] | null> {
  return Promise.resolve(null);
}
