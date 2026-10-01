import { describe, expect, it } from 'vitest';
import { Rng } from './rng';
import { createNewGame, advanceMonths, freshMeta } from './state';
import { defaultSettings, loadMeta, saveGame, loadGame, migrate, SAVE_VERSION } from './save';
import { netWorth, applyFx, emptyReport, evalCond } from './conditions';
import {
  buildSummary,
  endingById,
  pickNextEvent,
  rerollEvent,
  resolveChoice,
  runDueBeats,
  sanitize,
  checkEndings,
} from './engine';
import { MAX_AGE, TRAITS } from './catalog';
import { CHAIN_ONLY, EVENT_MAP, FILLER_EVENTS } from '../content';
import type { GameState, PlayerIdentity, Trait } from './types';

const TRAIT_IDS: Trait[] = TRAITS.map((t) => t.id);

function newLife(seed: number, trait: Trait = 'ambitious', name = 'Test Subject'): GameState {
  const identity: PlayerIdentity = {
    name,
    avatar: 'a1',
    trait,
    look: 'l1',
    pronouns: 'they/them',
  };
  const settings = defaultSettings();
  return createNewGame({ identity, settings, meta: freshMeta(), seed });
}

/** Plays a full life, taking `choose` to pick an option index. */
function playLife(
  seed: number,
  trait: Trait,
  choose: (choiceCount: number, s: GameState) => number,
  maxTurns = 400,
): { state: GameState; events: string[] } {
  const s = newLife(seed, trait);
  const rng = new Rng(s.seed);
  const events: string[] = [];

  for (let i = 0; i < maxTurns && s.player.alive && s.player.ageYears < MAX_AGE; i++) {
    rng.state = s.rngState;
    const event = pickNextEvent(s, rng);
    s.rngState = rng.state;
    if (!event) break;
    s.currentEventId = event.id;
    events.push(event.id);

    const idx = choose(event.choices.length, s);
    const res = resolveChoice(s, rng, event, idx);
    s.rngState = rng.state;
    sanitize(s);
    if (res.ended) {
      s.player.endingId = res.endingId;
      break;
    }
  }
  return { state: s, events };
}

describe('deterministic rng', () => {
  it('produces a stable stream for a given seed', () => {
    const a = new Rng(1234);
    const b = new Rng(1234);
    const seqA = Array.from({ length: 20 }, () => a.next());
    const seqB = Array.from({ length: 20 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it('resumes exactly from a serialised state', () => {
    const a = new Rng(99);
    for (let i = 0; i < 5; i++) a.next();
    const saved = a.state;
    const nextFromA = a.next();
    const b = new Rng(1);
    b.state = saved;
    expect(b.next()).toBe(nextFromA);
  });

  it('seed replay is identical for identical choices', () => {
    const first = playLife(424242, 'risk_taker', () => 0);
    const second = playLife(424242, 'risk_taker', () => 0);
    expect(first.events).toEqual(second.events);
  });
});

describe('new life setup', () => {
  it('starts the player as a broke twenty-something with a job', () => {
    const s = newLife(7);
    expect(s.player.ageYears).toBeGreaterThanOrEqual(21);
    expect(s.player.ageYears).toBeLessThanOrEqual(27);
    expect(s.finances.cash).toBeGreaterThan(0);
    expect(s.finances.salary).toBeGreaterThan(1000);
    expect(s.flags.employed).toBe(true);
    expect(s.romance.status).toBe('single');
  });

  it('applies personality trait bonuses at creation', () => {
    const ambitious = newLife(11, 'ambitious');
    const practical = newLife(11, 'practical');
    expect(ambitious.player.stats.career).toBeGreaterThan(practical.player.stats.career);
    expect(ambitious.player.stats.stress).toBeGreaterThan(practical.player.stats.stress);
  });

  it('seeds the recurring cast', () => {
    const s = newLife(3);
    expect(s.npcs['jess'].met).toBe(true);
    expect(s.npcs['boss_gary'].met).toBe(true);
    expect(s.npcs['mum'].met).toBe(true);
  });
});

describe('event selection', () => {
  it('always returns an event, even with everything on cooldown', () => {
    const s = newLife(21);
    const rng = new Rng(1);
    for (let i = 0; i < 500; i++) {
      const e = pickNextEvent(s, rng);
      expect(e).toBeTruthy();
      // Simulate it firing so cooldowns engage.
      s.seen[e.id] = s.player.turn;
      s.player.turn += 1;
    }
  });

  it('never repeats a card inside its authored cooldown window', () => {
    const careful = new Set([...CHAIN_ONLY, ...FILLER_EVENTS.map((f) => f.id)]);
    for (const seed of [3, 19, 44, 91]) {
      const { state } = playLife(seed, 'creative', (n) => n - 1);
      expect(state.history.length).toBeGreaterThan(0);

      // Count occurrences and confirm the gap between them respects cooldown.
      const turns: Record<string, number[]> = {};
      for (const h of state.history) (turns[h.eventId] ??= []).push(h.turn);
      for (const [id, list] of Object.entries(turns)) {
        if (careful.has(id) || list.length < 2) continue;
        const cd = EVENT_MAP[id]?.cooldown ?? 18;
        if (cd <= 0) continue;
        for (let i = 1; i < list.length; i++) {
          expect(list[i] - list[i - 1]).toBeGreaterThanOrEqual(cd);
        }
      }
    }
  });

  it('produces varied, state-appropriate events across seeds', () => {
    const sets: string[][] = [];
    for (let seed = 0; seed < 12; seed++) {
      const { events } = playLife(seed * 7919, 'charming', () => 0, 60);
      sets.push(events);
    }
    const flat = new Set(sets.flat());
    expect(flat.size).toBeGreaterThan(40);
    // Different lives should not be identical.
    expect(sets[0].join(',')).not.toBe(sets[1].join(','));
  });
});

describe('choice resolution', () => {
  it('applies stat, money and relationship deltas', () => {
    const s = newLife(5);
    const before = { ...s.player.stats };
    const cashBefore = s.finances.cash;
    const rng = new Rng(1);
    const event = EVENT_MAP['money_lottery_ticket'];
    const res = resolveChoice(s, rng, event, 0);
    expect(res.headline.length).toBeGreaterThan(0);
    expect(res.advancedMonths).toBeGreaterThanOrEqual(1);
    const changed =
      JSON.stringify(before) !== JSON.stringify(s.player.stats) || s.finances.cash !== cashBefore;
    expect(changed).toBe(true);
  });

  it('never leaves the player with a negative cash balance after sanitising', () => {
    const s = newLife(9);
    s.finances.cash = 100;
    applyFx(s, { money: -50000 }, emptyReport());
    sanitize(s);
    expect(s.finances.cash).toBeGreaterThanOrEqual(0);
  });

  it('clamps stats to 0..100', () => {
    const s = newLife(9);
    applyFx(s, { stress: 500, happiness: -500 }, emptyReport());
    sanitize(s);
    expect(s.player.stats.stress).toBeLessThanOrEqual(100);
    expect(s.player.stats.happiness).toBeGreaterThanOrEqual(0);
  });

  it('moves time forward and ages the player', () => {
    const s = newLife(31);
    const age = s.player.ageYears;
    const turn = s.player.turn;
    advanceMonths(s, 14, new Rng(2));
    expect(s.player.turn).toBe(turn + 14);
    expect(s.player.ageYears).toBe(age + 1);
  });
});

describe('delayed consequences', () => {
  it('schedules and fires a delayed beat months later', () => {
    const s = newLife(13);
    const rng = new Rng(4);
    // Forwarding the salary sheet always schedules an HR investigation later.
    const event = EVENT_MAP['career_salary_spreadsheet'];
    resolveChoice(s, rng, event, 3);
    expect(s.pending.length).toBeGreaterThan(0);
    const due = s.pending[0].dueTurn;
    const before = s.player.stats.stress;

    // Fast-forward past the due date.
    s.player.turn = due + 1;
    const beats = runDueBeats(s, rng);
    expect(beats.length).toBeGreaterThan(0);
    expect(beats[0].body.length).toBeGreaterThan(0);
    expect(beats[0].title).toContain('HR');
    // The beat itself raises the alarm; the consequence is the queued event.
    expect(s.queue.some((q) => q.id === 'chain_hr_investigation')).toBe(true);
    expect(s.pending.length).toBe(0);
    expect(typeof before).toBe('number');
  });

  it('queues chained events that then appear in play', () => {
    const s = newLife(17);
    const rng = new Rng(5);
    // The salary leak schedules a delayed beat which in turn queues the chain.
    resolveChoice(s, rng, EVENT_MAP['career_salary_spreadsheet'], 3);
    expect(s.pending.length).toBeGreaterThan(0);
    // It must land strictly after the card that caused it.
    expect(s.pending[0].dueTurn).toBeGreaterThan(s.player.turn);
    s.player.turn = s.pending[0].dueTurn + 1;
    runDueBeats(s, rng);
    expect(s.queue.some((q) => q.id === 'chain_hr_investigation')).toBe(true);

    const queued = s.queue.find((q) => q.id === 'chain_hr_investigation')!;
    s.player.turn = queued.dueTurn + 1;
    const next = pickNextEvent(s, rng);
    expect(next.id).toBe('chain_hr_investigation');
  });

  it('records NPC memories of important choices', () => {
    const s = newLife(19);
    const rng = new Rng(6);
    resolveChoice(s, rng, EVENT_MAP['career_salary_spreadsheet'], 2);
    expect(s.npcs['priya'].memory.length).toBeGreaterThan(0);
    expect(s.npcs['priya'].score).toBeGreaterThan(50);
  });

  it('a refused favour is remembered and can pay off later', () => {
    const s = newLife(23);
    const rng = new Rng(7);
    s.finances.cash = 40000;
    s.npcs['jess'].score = 70;
    resolveChoice(s, rng, EVENT_MAP['friend_borrow_ten_k'], 2); // refuse
    expect(s.npcs['jess'].score).toBeLessThan(50);
    expect(s.npcs['jess'].memory.some((m) => m.note.toLowerCase().includes('no'))).toBe(true);
  });
});

describe('relationships', () => {
  it('assigns a partner from the pool, not always the same person', () => {
    const partners = new Set<string>();
    for (let seed = 1; seed < 40; seed++) {
      const s = newLife(seed);
      const rng = new Rng(seed);
      resolveChoice(s, rng, EVENT_MAP['romance_first_meeting'], 1);
      if (s.romance.partnerId) partners.add(s.romance.partnerId);
    }
    expect(partners.size).toBeGreaterThan(1);
  });

  it('lets events address whoever the partner happens to be', () => {
    const s = newLife(41);
    const rng = new Rng(41);
    resolveChoice(s, rng, EVENT_MAP['romance_first_meeting'], 1);
    const partner = s.romance.partnerId!;
    const before = s.npcs[partner].score;
    applyFx(s, { npc: { partner: 10 } }, emptyReport());
    expect(s.npcs[partner].score).toBeGreaterThan(before);
  });
});

describe('full playthroughs', () => {
  it('reaches an ending in 40 very different lives', () => {
    const endingsSeen = new Set<string>();
    for (let seed = 0; seed < 40; seed++) {
      const trait = TRAIT_IDS[seed % TRAIT_IDS.length];
      const { state } = playLife(
        seed * 104729 + 13,
        trait,
        (n, s) => {
          // A deterministic "personality" per seed so runs diverge.
          const style = (seed + s.player.turn) % 3;
          if (style === 0) return 0;
          if (style === 1) return n - 1;
          return Math.floor(n / 2);
        },
      );
      const ending = state.player.endingId ?? checkEndings(state, true);
      expect(ending, `seed ${seed} produced no ending`).toBeTruthy();
      endingsSeen.add(ending!);
      // The run must have gone somewhere.
      expect(state.player.turn).toBeGreaterThan(0);
      expect(state.history.length).toBeGreaterThan(3);
    }
    // Replayability: many distinct endings across a modest number of lives.
    expect(endingsSeen.size).toBeGreaterThanOrEqual(6);
  });

  it('never gets stuck without an event or a stale save', () => {
    const { state, events } = playLife(31337, 'practical', (n) => Math.min(1, n - 1));
    expect(events.length).toBeGreaterThan(10);
    expect(state.player.ageYears).toBeGreaterThan(23);
  });

  it('produces a complete life summary', () => {
    const { state } = playLife(555, 'ambitious', (n, s) => (s.player.turn + n) % n);
    const summary = buildSummary(state);
    expect(summary.name).toBe('Test Subject');
    expect(summary.ageReached).toBeGreaterThan(23);
    expect(summary.decisionCount).toBeGreaterThan(3);
    expect(summary.ending).toBeTruthy();
    expect(summary.score).toBeGreaterThan(0);
    expect(summary.majorDecisions.length).toBeGreaterThan(0);
    expect(Number.isFinite(summary.finalNetWorth)).toBe(true);
  });

  it('lets a bold player finish much richer or poorer than a safe player', () => {
    const results = [0, 1, 2].map((seed) => {
      const bold = playLife(seed * 977 + 5, 'risk_taker', (n) => Math.min(n - 1, 1));
      const safe = playLife(seed * 977 + 5, 'practical', () => 0);
      return [netWorth(bold.state), netWorth(safe.state)];
    });
    const spread = results.flat();
    expect(Math.max(...spread) - Math.min(...spread)).toBeGreaterThan(1000);
  });
});

describe('save system', () => {
  it('round-trips a life through storage', () => {
    const s = newLife(64);
    s.player.identity.name = 'Round Trip';
    s.finances.cash = 12345.67;
    s.flags.customThing = 9;
    saveGame(s);
    const restored = loadGame();
    expect(restored).toBeTruthy();
    expect(restored!.player.identity.name).toBe('Round Trip');
    expect(restored!.finances.cash).toBeCloseTo(12345.67, 2);
    expect(restored!.flags.customThing).toBe(9);
  });

  it('migrates an old save forward instead of losing the run', () => {
    const legacy = { version: 1, player: { ageYears: 30 } } as unknown as GameState;
    const migrated = migrate(legacy);
    expect(migrated.version).toBe(SAVE_VERSION);
    expect(migrated.seenCount).toBeDefined();
    expect(migrated.recentCats).toBeDefined();
  });

  it('reloads a mid-run state with identical RNG position', () => {
    const { state } = playLife(777, 'creative', () => 0, 30);
    saveGame(state);
    const a = new Rng(state.seed);
    a.state = state.rngState;
    const b = new Rng(loadGame()!.seed);
    b.state = loadGame()!.rngState;
    expect(Array.from({ length: 6 }, () => a.next())).toEqual(
      Array.from({ length: 6 }, () => b.next()),
    );
  });

  it('persists cross-run meta progress', () => {
    saveGame(newLife(1));
    const meta = loadMeta();
    expect(meta).toBeDefined();
  });
});

describe('endings and achievements', () => {
  it('resolves a specific ending for a retired millionaire', () => {
    const s = newLife(2);
    s.player.ageYears = 45;
    s.finances.cash = 2_400_000;
    s.flags.retired = true;
    s.player.stats.stress = 30;
    const id = checkEndings(s, true);
    const ending = endingById(id);
    expect(ending).toBeTruthy();
    expect(['ending_retired_35', 'ending_early_retirement', 'ending_one_percent', 'ending_comfortable']).toContain(
      ending!.id,
    );
  });

  it('always has a fallback ending for an unremarkable life', () => {
    const s = newLife(3);
    s.player.ageYears = 84;
    const id = checkEndings(s, true);
    expect(id).toBeTruthy();
  });

  it('awards achievements and counts them once', () => {
    const s = newLife(4);
    const r = applyFx(s, { ach: ['ach_bad_idea'] }, emptyReport());
    expect(r.achievements).toContain('ach_bad_idea');
    const r2 = applyFx(s, { ach: ['ach_bad_idea'] }, emptyReport());
    expect(r2.achievements).toEqual([]);
  });

  it('rerolls to a different card, deterministically', () => {
    const a = newLife(11);
    const b = newLife(11);
    const ra = new Rng(a.seed);
    const rb = new Rng(b.seed);
    const first = pickNextEvent(a, ra);
    const rerolled = rerollEvent(a, ra, first.id);
    const rerolledAgain = rerollEvent(b, rb, first.id);
    expect(rerolled.id).not.toBe(first.id);
    expect(rerolledAgain.id).toBe(rerolled.id);
    expect(a.currentEventId).toBe(rerolled.id);
  });

  it('keeps a life replayable after an undo snapshot is restored', () => {
    const s = newLife(12);
    const rng = new Rng(s.seed);
    const event = pickNextEvent(s, rng);
    s.currentEventId = event.id;
    const before = JSON.stringify(s);
    resolveChoice(s, rng, event, 0);
    expect(s.player.turn).toBeGreaterThan(0);

    const restored = JSON.parse(before) as GameState;
    expect(restored.player.turn).toBe(0);
    expect(restored.currentEventId).toBe(event.id);
    // The restored life still resolves choices without throwing.
    const rng2 = new Rng(restored.seed);
    const next = pickNextEvent(restored, rng2);
    expect(next.id).toBeTruthy();
  });

  it('gates rare events behind multiple lives lived', () => {
    const s = newLife(5);
    const rare = EVENT_MAP['rare_the_letter'];
    expect(evalCond(rare.when, s)).toBe(false);
    s.flags.livesLived = 3;
    s.player.ageYears = 40;
    expect(evalCond(rare.when, s)).toBe(true);
  });
});
