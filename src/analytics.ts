/**
 * ANALYTICS
 *
 * A tiny, dependency-free event bus with a hard rule: nothing personal and
 * nothing identifying ever leaves the device. It exists so the game can be
 * tuned (which cards get skipped? where do players quit?) and so a production
 * build can forward the same shape to whatever backend the studio uses.
 *
 * Swap `sink` for Firebase/Segment/PostHog and every call site keeps working.
 */

export type AnalyticsEvent =
  | 'game_started'
  | 'life_started'
  | 'event_displayed'
  | 'choice_selected'
  | 'life_completed'
  | 'ending_reached'
  | 'achievement_unlocked'
  | 'rewarded_ad_viewed'
  | 'premium_purchase'
  | 'daily_played'
  | 'daily_shared'
  | 'life_summary_shared'
  | 'settings_changed'
  | 'screen_viewed'
  | 'content_error';

export interface AnalyticsRecord {
  event: AnalyticsEvent;
  at: number;
  props?: Record<string, string | number | boolean | null>;
}

type Sink = (record: AnalyticsRecord) => void;

const buffer: AnalyticsRecord[] = [];
const MAX_BUFFER = 300;

let sink: Sink = () => {
  /* default: no-op. Replace with a network sink in production. */
};

export function setAnalyticsSink(next: Sink): void {
  sink = next;
  for (const rec of buffer.splice(0, buffer.length)) sink(rec);
}

export function track(event: AnalyticsEvent, props?: AnalyticsRecord['props']): void {
  const record: AnalyticsRecord = { event, at: Date.now(), props };
  if (buffer.length < MAX_BUFFER) buffer.push(record);
  try {
    sink(record);
  } catch {
    /* analytics must never break the game */
  }
}

export function getAnalyticsBuffer(): AnalyticsRecord[] {
  return [...buffer];
}

/** Scrub anything that could identify a player before it leaves the device. */
export function sanitizeProps(props?: Record<string, unknown>): AnalyticsRecord['props'] {
  if (!props) return undefined;
  const out: Record<string, string | number | boolean | null> = {};
  for (const [k, v] of Object.entries(props)) {
    if (k === 'name' || k === 'playerName') {
      out[k] = '[redacted]';
      continue;
    }
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' || v === null) {
      out[k] = v;
    }
  }
  return out;
}
