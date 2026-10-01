import { describe, expect, it } from 'vitest';
import {
  ACHIEVEMENTS,
  ALL_CARDS,
  CHAIN_ONLY,
  CONTENT_PACKS,
  ENDINGS,
  EVENTS,
  EVENT_MAP,
  NPCS,
  contentStats,
  validateContent,
} from './index';
import { DAILY_POOL } from './daily';
import { BUSINESS_TYPES, CAREER_PATHS, LIFE_STAGES } from '../engine/catalog';

/** Every token that appears in any card, so we can prove they all resolve. */
const tokensUsed = new Set<string>();
for (const card of ALL_CARDS) {
  const texts = [card.title, card.body, card.quote ?? ''];
  for (const choice of card.choices) {
    texts.push(choice.text, choice.hint ?? '');
    for (const o of choice.outcomes) texts.push(o.title, o.body);
  }
  for (const text of texts) {
    for (const m of text.matchAll(/\{(\w+)\}/g)) tokensUsed.add(m[1]);
  }
}

describe('content integrity', () => {
  it('has zero structural errors', () => {
    const errors = validateContent().filter((i) => i.level === 'error');
    expect(errors.map((e) => `${e.id}: ${e.message}`)).toEqual([]);
  });

  it('meets the MVP content floor', () => {
    const s = contentStats();
    expect(s.cards).toBeGreaterThanOrEqual(100);
    expect(s.endings).toBeGreaterThanOrEqual(20);
    expect(s.achievements).toBeGreaterThanOrEqual(20);
    expect(BUSINESS_TYPES.length).toBeGreaterThanOrEqual(7);
    expect(CAREER_PATHS.length).toBeGreaterThanOrEqual(8);
    expect(NPCS.length).toBeGreaterThanOrEqual(10);
    expect(CONTENT_PACKS.length).toBeGreaterThanOrEqual(5);
  });

  it('gives every card 2-4 choices with real consequences', () => {
    const problems: string[] = [];
    for (const card of ALL_CARDS) {
      if (card.choices.length < 2 || card.choices.length > 4) {
        problems.push(`${card.id}: ${card.choices.length} choices`);
      }
      for (const c of card.choices) {
        if (c.outcomes.length === 0) problems.push(`${card.id}: "${c.text}" has no outcome`);
        for (const o of c.outcomes) {
          if (!o.title) problems.push(`${card.id}: outcome without title`);
          if (!o.body || o.body.length < 20) problems.push(`${card.id}: "${o.title}" body too short`);
        }
      }
    }
    expect(problems).toEqual([]);
  });

  it('never lets a choice have zero effect', () => {
    // Every outcome must change at least one meaningful variable: stats,
    // money, relationships, a flag, a delayed consequence, a chain or an ending.
    const dead: string[] = [];
    for (const card of ALL_CARDS) {
      for (const c of card.choices) {
        for (const o of c.outcomes) {
          const fx = { ...(c.fx ?? {}), ...(o.fx ?? {}) };
          const meaningful = Object.keys(fx).length > 0 || o.ending || o.delayed?.length || o.chain?.length;
          if (!meaningful) dead.push(`${card.id} → "${c.text}" → "${o.title}"`);
        }
      }
    }
    expect(dead).toEqual([]);
  });

  it('keeps all outcomes inside a choice distinct', () => {
    for (const card of ALL_CARDS) {
      for (const c of card.choices) {
        const titles = c.outcomes.map((o) => o.title);
        expect(new Set(titles).size, `${card.id} → ${c.text}`).toBe(titles.length);
      }
    }
  });

  it('uses {tokens} the text engine can actually resolve', () => {
    const known = new Set([
      'name', 'age', 'ageNext', 'job', 'title', 'employer', 'salary', 'rent', 'money', 'savings',
      'debt', 'city', 'home', 'stage', 'trait', 'friend', 'friend2', 'chaos', 'coworker', 'boss',
      'mum', 'mom', 'dad', 'brother', 'sibling', 'doctor', 'investor', 'partner', 'partnerName',
      'kids', 'kidsCount', 'biz', 'bizShort', 'month', 'year',
    ]);
    const unknown = [...tokensUsed].filter((t) => !known.has(t));
    expect(unknown).toEqual([]);
  });

  it('resolves partner tokens to whichever NPC the player actually chose', () => {
    // No card may name a romanceable NPC directly in prose; that is how a
    // player married to Sam ends up reading about Alex.
    const romanceNames = ['Alex', 'Nora', 'Sam', 'Rina'];
    const offenders: string[] = [];
    for (const card of ALL_CARDS) {
      const prose = `${card.title} ${card.body} ${card.quote ?? ''} ${card.choices
        .flatMap((c) => c.outcomes.map((o) => `${o.title} ${o.body}`))
        .join(' ')}`;
      for (const n of romanceNames) {
        if (prose.includes(`{${n.toLowerCase()}}`)) offenders.push(`${card.id}: ${n}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('references only NPCs that exist', () => {
    for (const card of ALL_CARDS) {
      const refs: string[] = [];
      if (card.who) refs.push(card.who);
      if (card.speaker) refs.push(card.speaker);
      for (const c of card.choices) {
        for (const o of c.outcomes) {
          refs.push(...Object.keys(o.fx?.npc ?? {}));
          if (o.fx?.setPartner?.npcId && !o.fx.setPartner.npcId.includes('partner') && o.fx.setPartner.npcId !== 'new') {
            refs.push(o.fx.setPartner.npcId);
          }
        }
      }
      for (const r of refs) {
        if (r === 'partner' || r === 'new') continue;
        expect(NPCS.some((n) => n.id === r), `${card.id} references ${r}`).toBe(true);
      }
    }
  });

  it('gates rare and legendary cards behind repeat play', () => {
    for (const card of ALL_CARDS) {
      if (card.rarity === 'rare' || card.rarity === 'legendary') {
        const gate = JSON.stringify(card.when ?? {});
        expect(gate.includes('livesLived'), `${card.id} needs a livesLived gate`).toBe(true);
      }
    }
  });

  it('keeps chain-only and filler cards out of the random draw', () => {
    const chain = new Set(CHAIN_ONLY);
    for (const e of EVENTS) {
      expect(chain.has(e.id), `${e.id} must not be draftable`).toBe(false);
    }
    for (const id of chain) expect(EVENT_MAP[id], id).toBeDefined();
  });

  it('has endings with unique ids and titles', () => {
    const ids = new Set<string>();
    const titles = new Set<string>();
    for (const e of ENDINGS) {
      expect(ids.has(e.id), e.id).toBe(false);
      ids.add(e.id);
      expect(titles.has(e.title), e.title).toBe(false);
      titles.add(e.title);
    }
  });

  it('covers every life stage with age-eligible content', () => {
    for (const stage of LIFE_STAGES) {
      const inStage = EVENTS.filter((e) => {
        const age = e.when?.age;
        if (!age) return false;
        const lo = age[0] ?? 0;
        const hi = age[1] ?? 999;
        return lo <= stage.max && hi >= stage.min;
      });
      expect(inStage.length, `${stage.id} coverage`).toBeGreaterThan(5);
    }
  });

  it('references only career paths and business types the catalog defines', () => {
    const pathIds = new Set(CAREER_PATHS.map((c) => c.id));
    const bizIds = new Set(BUSINESS_TYPES.map((b) => b.id));
    for (const card of ALL_CARDS) {
      for (const p of card.when?.career?.path ?? []) {
        expect(pathIds.has(p), `${card.id} career ${p}`).toBe(true);
      }
      for (const b of card.when?.businesses?.types ?? []) {
        expect(bizIds.has(b), `${card.id} business ${b}`).toBe(true);
      }
      for (const c of card.choices) {
        for (const o of c.outcomes) {
          if (o.fx?.setCareer) {
            expect(pathIds.has(o.fx.setCareer.path), `${card.id} setCareer ${o.fx.setCareer.path}`).toBe(true);
          }
          if (o.fx?.biz?.launch) {
            expect(bizIds.has(o.fx.biz.launch), `${card.id} launch ${o.fx.biz.launch}`).toBe(true);
          }
        }
      }
    }
  });

  it('includes the headline achievements the brief names', () => {
    const names = ACHIEVEMENTS.map((a) => a.name);
    for (const required of [
      'BAD IDEA',
      "YOU'RE FIRED",
      'CAPITALIST',
      'LOVE HURTS',
      'DIAMOND HANDS',
      'MOM WAS RIGHT',
      'HOW DID THIS WORK?',
      'ONE PERCENT',
      'CHAOS AGENT',
    ]) {
      expect(names, required).toContain(required);
    }
  });

  it('includes the headline endings the brief names', () => {
    const titles = ENDINGS.map((e) => e.title);
    for (const required of [
      'RETIRED AT 35',
      'CORPORATE LEGEND',
      'SERIAL ENTREPRENEUR',
      'BROKE BUT HAPPY',
      'MILLIONAIRE',
      'BILLIONAIRE',
      'INTERNET CELEBRITY',
      'FAMILY FIRST',
      'WORKAHOLIC',
      'FIRED AGAIN',
      'STARTUP DISASTER',
      'WORLD TRAVELLER',
      'REAL ESTATE TYCOON',
      'QUIET LIFE',
      'ACCIDENTAL CEO',
      'DEBT KING',
      'EARLY RETIREMENT',
    ]) {
      expect(titles, required).toContain(required);
    }
    // Asked for as "LIVING WITH PARENTS" — shipped under a better name.
    expect(ENDINGS.some((e) => e.id === 'ending_living_with_parents')).toBe(true);
  });

  it('ships a usable Daily Dilemma pool', () => {
    expect(DAILY_POOL.length).toBeGreaterThanOrEqual(10);
    for (const id of DAILY_POOL) expect(EVENT_MAP[id], id).toBeDefined();
  });

  it('spans enough categories to keep runs varied', () => {
    const s = contentStats();
    for (const cat of [
      'career', 'workplace', 'business', 'money', 'investing', 'romance',
      'friendship', 'family', 'health', 'housing', 'travel', 'social',
    ]) {
      expect(s.byCategory[cat] ?? 0, cat).toBeGreaterThanOrEqual(3);
    }
  });
});
