import type { GameState, Settings } from './engine/types';
import { createNewGame } from './engine/state';
import { defaultMeta, loadMeta, loadSettings, saveDaily, todayKey, type MetaState } from './engine/save';
import { EVENT_MAP } from './content';
import { DAILY_OVERRIDES } from './content/daily';
import { track } from './analytics';

/**
 * DAILY DILEMMA
 *
 * One scenario per day, identical for every player in the world, decided by
 * the UTC date. It runs on a throwaway guest save so it can never damage the
 * real run — you get the consequence, the album records it, and the guest is
 * thrown away.
 */
export function createDailyGame(id: string, settings?: Settings, meta?: MetaState): GameState {
  const key = todayKey();
  const overrides = DAILY_OVERRIDES[id] ?? { age: 27 };
  const state = createNewGame({
    identity: {
      name: 'Guest',
      avatar: 'l1',
      look: 'l1',
      trait: 'risk_taker',
      pronouns: 'they/them',
    },
    settings: settings ?? loadSettings(),
    meta: meta ?? loadMeta(),
    seed: hash(`wcgg-daily-${key}-${id}`),
    startAge: overrides.age ?? 27,
  });

  // Shape the guest so the scenario lands with sensible numbers.
  if (overrides.stats) {
    for (const [k, v] of Object.entries(overrides.stats)) {
      if (typeof v === 'number') state.player.stats[k as keyof typeof state.player.stats] = v;
    }
  }
  if (overrides.flags) {
    for (const [k, v] of Object.entries(overrides.flags)) state.flags[k] = v;
  }
  state.dailyId = id;
  state.currentEventId = EVENT_MAP[id] ? id : null;

  const m = meta ?? defaultMeta();
  saveDaily({ date: key, id, played: false, scores: m.lastDailyDate === key ? undefined : undefined } as never);
  track('daily_played', { id, date: key });
  return state;
}

function hash(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const DAILY_IDS = Object.keys(DAILY_OVERRIDES);
