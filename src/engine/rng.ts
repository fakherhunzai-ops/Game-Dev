/**
 * Deterministic, serialisable PRNG.
 *
 * The RNG state lives inside the save file, so a reloaded game continues the
 * exact same stream. That also makes Daily Dilemma seeds shareable: everyone
 * with the same date string gets the same scenario order.
 *
 * mulberry32 — fast, decent statistical quality, and 32 bits of state.
 */
export class Rng {
  private s: number;

  constructor(seed: number) {
    this.s = seed >>> 0;
  }

  static fromString(str: string): Rng {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return new Rng(h);
  }

  /** Mutates internal state — snapshot it into the save after every turn. */
  next(): number {
    this.s = (this.s + 0x6d2b79f5) >>> 0;
    let t = this.s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  int(minInclusive: number, maxInclusive: number): number {
    return minInclusive + Math.floor(this.next() * (maxInclusive - minInclusive + 1));
  }

  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }

  /** Weighted pick. Returns null when all weights are zero. */
  weighted<T>(items: readonly T[], weightOf: (item: T) => number): T | null {
    let total = 0;
    for (const item of items) total += Math.max(0, weightOf(item));
    if (total <= 0) return null;
    let roll = this.next() * total;
    for (const item of items) {
      roll -= Math.max(0, weightOf(item));
      if (roll <= 0) return item;
    }
    return items[items.length - 1];
  }

  bool(p: number): boolean {
    return this.next() < p;
  }

  /** Retrieves, mutates and returns the live state word. */
  get state(): number {
    return this.s >>> 0;
  }

  set state(v: number) {
    this.s = v >>> 0;
  }
}

/** Clamp helper used everywhere stats are mutated. */
export const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);

/** Rounds to 2dp — keeps saves small and diffs readable. */
export const round2 = (v: number): number => Math.round(v * 100) / 100;
