import type { GameState } from './engine/types';
import { buildSummary, checkAchievements, checkEndings, type LifeSummary } from './engine/engine';
import { Rng } from './engine/rng';
import { defaultMeta, loadMeta, loadSettings, saveMeta, clearGame, type MetaState } from './engine/save';
import { ACHIEVEMENTS, ENDINGS } from './content';
import { track } from './analytics';

/**
 * LIFE LIFECYCLE
 *
 * Everything that happens between "this run is over" and "here is what you
 * were like": computing the summary, folding it into the persistent meta
 * album, awarding the ending, and unlocking whatever the player earned — all
 * without ever wiping the record of previous lives.
 */

export interface CompletedLife {
  summary: LifeSummary;
  newAchievements: string[];
  newEnding: boolean;
  newRareEvents: string[];
  /** True when this was a Daily Dilemma guest run, not a real life. */
  daily: boolean;
}

/** Archives a finished life into persistent meta and returns the summary. */
export function finishLife(state: GameState, meta: MetaState = loadMeta()): CompletedLife {
  // Daily Dilemma runs are throwaway guests. They record that you played and
  // nothing else: no archived life, no album progress, no wiped save.
  if (state.dailyId) {
    const rng = new Rng(state.rngState);
    const unlocked = checkAchievements(state, rng);
    state.rngState = rng.state;
    const summary = buildSummary(state);
    meta.lastDailyDate = new Date().toISOString().slice(0, 10);
    meta.dailyDone = true;
    for (const a of Object.keys(state.achievements.unlocked)) {
      if (!meta.achievements.includes(a)) meta.achievements.push(a);
    }
    saveMeta(meta);
    return { summary, newAchievements: unlocked, newEnding: false, newRareEvents: [], daily: true };
  }

  // Make sure a final ending is committed even if the UI raced ahead.
  const endingId = state.player.endingId ?? checkEndings(state, true);
  if (endingId) state.player.endingId = endingId;

  // Sweep up any achievements the last beat earned.
  const rng = new Rng(state.rngState);
  const justUnlocked = checkAchievements(state, rng);
  state.rngState = rng.state;

  const summary = buildSummary(state);

  const newEnding = !!endingId && !meta.endings.includes(endingId);
  if (endingId && newEnding) meta.endings.push(endingId);

  const newAchievements: string[] = [];
  for (const a of Object.keys(state.achievements.unlocked)) {
    if (!meta.achievements.includes(a)) {
      meta.achievements.push(a);
      newAchievements.push(a);
      track('achievement_unlocked', { id: a, age: summary.ageReached });
    }
  }

  const newRareEvents = state.album.rareEvents.filter((e) => !meta.rareEvents.includes(e));
  meta.rareEvents.push(...newRareEvents);
  for (const c of state.album.careers) if (!meta.careers.includes(c)) meta.careers.push(c);
  for (const b of state.album.businesses) if (!meta.businesses.includes(b)) meta.businesses.push(b);
  for (const m of state.album.milestones) if (!meta.milestones.includes(m)) meta.milestones.push(m);
  for (const e of Object.keys(state.seen)) if (!meta.seenEvents.includes(e)) meta.seenEvents.push(e);

  meta.livesLived += 1;
  meta.bestNetWorth = Math.max(meta.bestNetWorth, summary.finalNetWorth);
  meta.totalDecisions += state.runStats.decisionsMade;

  saveMeta(meta);

  track('life_completed', {
    age: summary.ageReached,
    decisions: summary.decisionCount,
    netWorth: Math.round(summary.finalNetWorth),
    ending: endingId ?? 'none',
  });

  // The run is finished. The save is left in place so a reload still shows the
  // summary; it is replaced the moment a new life begins.
  return {
    summary,
    newAchievements: [...justUnlocked, ...newAchievements],
    newEnding,
    newRareEvents,
    daily: false,
  };
}

export interface ArchiveEntry {
  name: string;
  endingId: string | null;
  age: number;
  netWorth: number;
  decisions: number;
  at: number;
}

const ARCHIVE_KEY = 'wcgg.archive.v1';
const MAX_ARCHIVE = 20;

export function loadArchive(): ArchiveEntry[] {
  try {
    const raw = localStorage.getItem(ARCHIVE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ArchiveEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function archiveLife(state: GameState, summary: LifeSummary): void {
  const entries = loadArchive();
  entries.unshift({
    name: state.player.identity.name,
    endingId: state.player.endingId,
    age: summary.ageReached,
    netWorth: summary.finalNetWorth,
    decisions: summary.decisionCount,
    at: Date.now(),
  });
  try {
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(entries.slice(0, MAX_ARCHIVE)));
  } catch {
    /* storage full — the album in meta still has the important parts */
  }
}

/** Rolls the album forward without ending a life — used by the daily. */
export function noteDailyPlayed(meta: MetaState = loadMeta()): void {
  meta.lastDailyDate = new Date().toISOString().slice(0, 10);
  meta.dailyDone = true;
  saveMeta(meta);
}

export function resetAllProgress(): void {
  clearGame();
  try {
    localStorage.removeItem(ARCHIVE_KEY);
  } catch {
    /* ignore */
  }
}

export const metaDefaults = defaultMeta;
export const settingsDefaults = loadSettings;
export const ENDING_COUNT = ENDINGS.length;
export const ACHIEVEMENT_COUNT = ACHIEVEMENTS.length;
