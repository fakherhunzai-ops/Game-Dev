import type { GameState, Settings } from './types';
import { netWorth } from './conditions';

export const SAVE_VERSION = 3;

const SAVE_KEY = 'wcgg.save.v1';
const META_KEY = 'wcgg.meta.v1';
const SETTINGS_KEY = 'wcgg.settings.v1';
const DAILY_KEY = 'wcgg.daily.v1';

/* ------------------------------------------------------------------ storage */

/**
 * Storage adapter. Capacitor's Preferences plugin is used on device; in the
 * browser we fall back to localStorage. Both are synchronous-friendly via an
 * in-memory mirror so the engine never has to await on the hot path.
 */
interface Driver {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

const memory = new Map<string, string>();

const driver: Driver = (() => {
  try {
    if (typeof localStorage !== 'undefined') {
      const probe = '__wcgg_probe__';
      localStorage.setItem(probe, '1');
      localStorage.removeItem(probe);
      return {
        get: (k) => (memory.has(k) ? memory.get(k)! : localStorage.getItem(k)),
        set: (k, v) => {
          memory.set(k, v);
          try {
            localStorage.setItem(k, v);
          } catch {
            /* quota — memory mirror keeps the session alive */
          }
        },
        remove: (k) => {
          memory.delete(k);
          localStorage.removeItem(k);
        },
      };
    }
  } catch {
    /* private mode / unavailable */
  }
  return {
    get: (k) => memory.get(k) ?? null,
    set: (k, v) => void memory.set(k, v),
    remove: (k) => void memory.delete(k),
  };
})();

/* ------------------------------------------------------------------- meta */

export interface MetaState {
  endings: string[];
  achievements: string[];
  careers: string[];
  businesses: string[];
  rareEvents: string[];
  milestones: string[];
  livesLived: number;
  bestNetWorth: number;
  totalDecisions: number;
  lastDailyDate: string | null;
  dailyDone: boolean;
  premium: boolean;
  seenEvents: string[];
}

export function defaultMeta(): MetaState {
  return {
    endings: [],
    achievements: [],
    careers: [],
    businesses: [],
    rareEvents: [],
    milestones: [],
    livesLived: 0,
    bestNetWorth: 0,
    totalDecisions: 0,
    lastDailyDate: null,
    dailyDone: false,
    premium: false,
    seenEvents: [],
  };
}

export function loadMeta(): MetaState {
  const raw = driver.get(META_KEY);
  if (!raw) return defaultMeta();
  try {
    return { ...defaultMeta(), ...(JSON.parse(raw) as Partial<MetaState>) };
  } catch {
    return defaultMeta();
  }
}

export function saveMeta(meta: MetaState): void {
  driver.set(META_KEY, JSON.stringify(meta));
}

/* -------------------------------------------------------------- settings */

export function defaultSettings(): Settings {
  return {
    music: true,
    sfx: true,
    haptics: true,
    reduceMotion: false,
    notifications: false,
    theme: 'midnight',
    textSize: 'normal',
    premium: false,
    tutorialDone: false,
    adFree: false,
    perks: { undosLeft: 1, rerollsUsed: 0, hintsUsed: 0, undosBought: 0 },
  };
}

export function loadSettings(): Settings {
  const raw = driver.get(SETTINGS_KEY);
  if (!raw) return defaultSettings();
  try {
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return { ...defaultSettings(), ...parsed, perks: { ...defaultSettings().perks, ...parsed.perks } };
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(s: Settings): void {
  driver.set(SETTINGS_KEY, JSON.stringify(s));
}

/* --------------------------------------------------------------- run save */

export function saveGame(state: GameState): void {
  state.updatedAt = Date.now();
  try {
    driver.set(SAVE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function loadGame(): GameState | null {
  const raw = driver.get(SAVE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as GameState;
    return migrate(parsed);
  } catch {
    return null;
  }
}

export function hasSave(): boolean {
  return driver.get(SAVE_KEY) !== null;
}

export function clearGame(): void {
  driver.remove(SAVE_KEY);
}

/* ------------------------------------------------------------- migration */

/**
 * Forward-migrates old saves. Every shipped version must keep working — a
 * player mid-life should never lose a run because we added a field.
 */
export function migrate(state: GameState): GameState {
  const s = state as GameState & { version?: number };
  const v = s.version ?? 1;

  if (v < 2) {
    // v1 had no seenCount; derive it from the album + seen map.
    s.seenCount = s.seenCount ?? {};
    s.recentCats = s.recentCats ?? [];
    s.runStats = s.runStats ?? ({} as GameState['runStats']);
  }
  if (v < 3) {
    s.seenCount = s.seenCount ?? {};
    s.recentCats = s.recentCats ?? [];
    s.undoSnapshot = s.undoSnapshot ?? null;
    s.dailyId = s.dailyId ?? null;
    if (s.settings && !s.settings.perks) {
      s.settings.perks = { undosLeft: 1, rerollsUsed: 0, hintsUsed: 0, undosBought: 0 };
    }
  }

  if (s.settings && s.settings.perks) {
    s.settings.perks.undosBought = s.settings.perks.undosBought ?? 0;
    s.settings.perks.undosLeft = s.settings.perks.undosLeft ?? 1;
  }
  s.undoSnapshot = s.undoSnapshot ?? null;

  s.version = SAVE_VERSION;
  return s;
}

/* ---------------------------------------------------------------- daily */

export interface DailyRecord {
  date: string;
  eventId: string;
  answered: boolean;
  choiceIndex: number | null;
  streak: number;
}

export function todayKey(d = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(
    d.getUTCDate(),
  ).padStart(2, '0')}`;
}

export function loadDaily(): DailyRecord | null {
  const raw = driver.get(DAILY_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DailyRecord;
  } catch {
    return null;
  }
}

export function saveDaily(rec: DailyRecord): void {
  driver.set(DAILY_KEY, JSON.stringify(rec));
}

/* ---------------------------------------------------------------- export */

export interface SaveBundle {
  kind: 'wcgg-save';
  version: number;
  exportedAt: number;
  state: GameState;
  meta: MetaState;
}

export function exportBundle(state: GameState): string {
  const bundle: SaveBundle = {
    kind: 'wcgg-save',
    version: SAVE_VERSION,
    exportedAt: Date.now(),
    state,
    meta: loadMeta(),
  };
  return JSON.stringify(bundle, null, 2);
}

export function importBundle(json: string): { state: GameState; meta: MetaState } | null {
  try {
    const bundle = JSON.parse(json) as SaveBundle;
    if (bundle.kind !== 'wcgg-save' || !bundle.state) return null;
    return { state: migrate(bundle.state), meta: { ...defaultMeta(), ...bundle.meta } };
  } catch {
    return null;
  }
}

/** Compact share text for the end-of-life card. */
export function shareText(state: GameState, endingTitle: string): string {
  const nw = netWorth(state);
  const nwStr = nw >= 1_000_000 ? `$${(nw / 1_000_000).toFixed(1)}M` : `$${Math.round(nw).toLocaleString()}`;
  return [
    'WHAT COULD GO WRONG? — A Bad Decisions Life Simulator',
    `${state.player.identity.name}'s Life`,
    `Ending: ${endingTitle}`,
    `Age reached: ${state.player.ageYears}`,
    `Net worth: ${nwStr}`,
    `Decisions made: ${state.runStats.decisionsMade}`,
    `Peak career: ${state.career.peakTitle}`,
    '',
    'Think you could do worse? Probably.',
  ].join('\n');
}
