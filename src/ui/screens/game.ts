import type { Choice, GameEvent, GameState } from '../../engine/types';
import type { App, ScreenModule } from '../shell';
import { Rng } from '../../engine/rng';
import {
  choiceLockedReason,
  pickNextEvent,
  rerollEvent,
  resolveChoice,
  type Resolution,
} from '../../engine/engine';
import { EVENT_MAP } from '../../content';
import { fillTokens } from '../../engine/text';
import { saveGame } from '../../engine/save';
import { track } from '../../analytics';
import { confetti, escapeHtml, haptic, sfx, toast } from '../feedback';
import { renderScene } from '../art';
import { portrait } from '../avatars';
import { NPC_DEFS } from '../../content/npcs';
import { chipRow, deltaChips, hud, npcName, quickNav, TONE_EMOJI, TONE_LABEL } from '../components';
import { closeOverlay, navigate, openOverlay, overlayRoot, render } from '../shell';
import { PERKS, perkAvailable, watchRewardedAd, type PerkId } from '../../monetization';

/**
 * THE MAIN DECISION SCREEN.
 *
 * This is where the player actually lives: a scenario, a cast, two to four
 * ways to make it worse, and a consequence that lands with sound, motion and
 * numbers. Every decision routes through the same pipeline so delayed
 * consequences, achievements and endings can never be skipped.
 */

export function ensureCurrentEvent(app: App): GameEvent | null {
  const s = app.game;
  if (!s) return null;
  if (s.currentEventId) return EVENT_MAP[s.currentEventId] ?? null;
  const rng = new Rng(s.rngState);
  const next = pickNextEvent(s, rng);
  s.rngState = rng.state;
  s.currentEventId = next.id;
  saveGame(s);
  track('event_displayed', { id: next.id, category: next.cat, age: s.player.ageYears });
  return next;
}

function choiceClass(choice: Choice): string {
  return choice.tag ? `choice choice--${choice.tag}` : 'choice';
}

function choiceBody(
  choice: Choice,
  s: NonNullable<App['game']>,
  index: number,
  revealed: boolean,
): string {
  const locked = choice.lockedWhen ? choiceLockedReason(choice, s) : null;
  if (locked) {
    return `<button class="${choiceClass(choice)} btn--locked" disabled>
      <span class="choice__num">🔒</span>
      <span class="choice__body">
        <span class="choice__text">${escapeHtml(choice.lockedText ?? 'Locked')}</span>
        <span class="choice__hint">${escapeHtml(locked)}</span>
      </span>
    </button>`;
  }
  const risky = choice.highRisk && revealed;
  return `<button class="${choiceClass(choice)}" data-act="choose" data-arg="${index}">
    ${''}
    <span class="choice__num">${choice.tag ? TAG_GLYPH[choice.tag] ?? '·' : '·'}</span>
    <span class="choice__body">
      <span class="choice__text">${escapeHtml(choice.text)}</span>
      ${choice.hint ? `<span class="choice__hint">${escapeHtml(choice.hint)}</span>` : ''}
    </span>
    <span class="chip chip--${choice.tag ?? 'safe'}">${choice.tag ?? 'choice'}${risky ? ' 🎲' : ''}</span>
  </button>`;
}

const TAG_GLYPH: Record<string, string> = {
  bold: '⚡',
  risky: '🎲',
  smart: '🧠',
  kind: '💗',
  lazy: '🛋️',
  chaotic: '🌀',
  cruel: '🗡️',
  safe: '🛡️',
  greedy: '💰',
};

/**
 * THE PERK BAR.
 *
 * Optional, tiny and completely ignorable: one free undo per life plus two
 * opt-in ad slots. Nothing here is ever required, nothing is ever auto-played,
 * and premium switches the whole bar into free mode.
 */
function perkBar(app: App): string {
  const s = app.game;
  if (!s) return '';
  const st = s.settings;
  const revealed = app.revealedEventId === s.currentEventId;
  const premium = st.premium || st.adFree;

  const slot = (perk: PerkId, label: string): string => {
    const used = perk === 'reroll' ? st.perks.rerollsUsed : st.perks.hintsUsed;
    const left = Math.max(0, PERKS[perk].perLife - used);
    const open = premium || perkAvailable(st, perk);
    return `<button class="btn btn--sm btn--ghost" data-act="perk" data-arg="${perk}" ${
      open ? '' : 'disabled'
    }>${PERKS[perk].icon} ${label}${premium ? '' : ` · ${left}`}</button>`;
  };

  const undoLeft = st.perks.undosLeft;
  const undoOpen = premium || undoLeft > 0;

  return `<div class="stack" style="gap:8px">
    <div class="row row--between">
      <span class="eyebrow">Optional perks — never required</span>
      ${premium ? '<span class="chip chip--good">premium · free</span>' : ''}
    </div>
    <div class="grid-3">
      <button class="btn btn--sm btn--ghost" data-act="perk" data-arg="undo" ${
        undoOpen ? '' : 'disabled'
      }>↩️ Undo${premium ? '' : ` · ${undoLeft}`}</button>
      ${slot('reroll', 'Reroll')}
      ${revealed ? `<button class="btn btn--sm btn--ghost" data-act="perk" data-arg="reveal_risk" disabled>🔍 Odds · on</button>` : slot('reveal_risk', 'Odds')}
    </div>
    <p class="hint">Reroll swaps the card. Odds marks which options are gambles. Undo takes back your last decision — you get one per life.</p>
  </div>`;
}

/** Applies a perk the player has already paid for (ad watched, or premium). */
function applyPerk(app: App, perk: PerkId): void {
  const s = app.game;
  if (!s) return;
  if (perk === 'reroll') {
    const rng = new Rng(s.rngState);
    const next = rerollEvent(s, rng, s.currentEventId ?? undefined);
    s.rngState = rng.state;
    app.revealedEventId = null;
    saveGame(s);
    track('event_displayed', { id: next.id, category: next.cat, kind: 'reroll', age: s.player.ageYears });
    sfx('tap');
    toast({ icon: '🎲', title: 'Different card', body: 'Same life. New problem.', tone: 'neutral' });
    render();
    return;
  }
  if (perk === 'reveal_risk') {
    app.revealedEventId = s.currentEventId;
    toast({ icon: '🔍', title: 'The odds are showing', body: 'Gambles are marked 🎲.', tone: 'neutral' });
    render();
  }
}

/**
 * Takes back the last decision by restoring the pre-decision snapshot. The
 * snapshot is a plain JSON copy of the whole life, so an undo restores stats,
 * money, NPC memory and the event queue together — it cannot half-apply.
 */
function undoLastDecision(app: App): boolean {
  const s = app.game;
  if (!s?.undoSnapshot) return false;
  let restored: GameState;
  try {
    restored = JSON.parse(s.undoSnapshot) as GameState;
  } catch {
    s.undoSnapshot = null;
    return false;
  }
  const premium = restored.settings.premium || restored.settings.adFree;
  if (!premium) restored.settings.perks.undosLeft = Math.max(0, restored.settings.perks.undosLeft - 1);
  restored.undoSnapshot = null;
  app.game = restored;
  app.revealedEventId = null;
  app.lastResolution = null;
  closeOverlay();
  saveGame(restored);
  haptic('tap');
  return true;
}

export const gameScreen: ScreenModule = {
  html(app: App): string {
    const s = app.game;
    if (!s) {
      return `<div class="screen center stack" style="justify-content:center">
        <div class="title-xl">No life in progress</div>
        <button class="btn btn--primary" data-act="goto" data-arg="home">Back to the menu</button>
      </div>`;
    }
    const event = ensureCurrentEvent(app);
    if (!event) {
      return `<div class="screen">${hud(s)}<p class="body">Loading…</p></div>`;
    }

    const who = event.who ? NPC_DEFS.find((n) => n.id === event.who) : undefined;
    const speaker = event.speaker ? NPC_DEFS.find((n) => n.id === event.speaker) : undefined;
    const title = fillTokens(event.title, s);
    const body = fillTokens(event.body, s);
    const quote = event.quote ? fillTokens(event.quote, s) : undefined;

    return `<div class="screen">
      ${hud(s)}
      <div class="scroll stack stack--lg" style="padding-top:12px;padding-bottom:14px">
        <div class="scene scene--tall">
          ${renderScene({ art: event.art, category: event.cat, npc: who?.id ?? speaker?.id, npc2: 'player' })}
          <div class="scene__scrim"></div>
          <div class="scene__caption">
            <span class="chip">${escapeHtml(categoryLabel(event.cat))}</span>
            ${event.rarity && event.rarity !== 'common' ? `<span class="chip chip--chaotic">${event.rarity}</span>` : ''}
            <span class="spacer"></span>
            ${who ? `<span class="chip">${escapeHtml(who.name)}</span>` : ''}
          </div>
        </div>

        <div class="stack" style="gap:10px">
          <h1 class="headline">${escapeHtml(title)}</h1>
          <p class="body">${escapeHtml(body)}</p>
          ${quote ? `<p class="quote">“${escapeHtml(quote)}”${speaker ? `<br><span class="micro">— ${escapeHtml(speaker.name)}</span>` : ''}</p>` : ''}
        </div>

        <div class="stack" style="gap:9px">
          ${event.choices.map((c, i) => choiceBody(c, s, i, app.revealedEventId === event.id)).join('')}
        </div>

        ${perkBar(app)}
      </div>
      ${quickNav('game')}
    </div>`;
  },

  actions: {
    async perk(app: App, arg: string | undefined, el: HTMLElement) {
      const s = app.game;
      if (!s || app.busy || !arg) return;
      const perk = arg as PerkId;
      const st = s.settings;
      const premium = st.premium || st.adFree;

      if (perk === 'undo') {
        if (s.settings.perks.undosLeft <= 0 && !premium) {
          toast({ icon: '↩️', title: 'No undos left this life', body: 'Watch one, or live with it.', tone: 'neutral' });
          return;
        }
        const restored = undoLastDecision(app);
        toast({
          icon: restored ? '↩️' : '🤷',
          title: restored ? 'Taken back' : 'Nothing to take back yet',
          body: restored ? 'That decision never happened. Probably.' : 'Make a decision first.',
          tone: restored ? 'good' : 'neutral',
        });
        render();
        return;
      }

      if (premium) {
        applyPerk(app, perk);
        return;
      }
      const granted = await watchRewardedAd(st, perk);
      if (!granted) {
        toast({
          icon: 'ℹ️',
          title: 'No ad available',
          body: 'Rewarded ads only run in the store builds.',
          tone: 'neutral',
        });
        return;
      }
      applyPerk(app, perk);
      el.blur();
    },

    async choose(app: App, arg: string | undefined, el: HTMLElement) {
      const s = app.game;
      if (!s || app.busy) return;
      const event = s.currentEventId ? EVENT_MAP[s.currentEventId] : null;
      if (!event) return;
      const index = Number(arg ?? 0);
      const choice = event.choices[index];
      if (!choice) return;

      app.busy = true;
      el.classList.add('pulse');
      haptic('tap');
      sfx('tap');

      // A short beat of anticipation before the consequence lands.
      await new Promise((r) => window.setTimeout(r, 170));

      // One snapshot, taken immediately before the choice resolves: this is
      // what the undo perk spends, and it is why undo restores everything.
      s.undoSnapshot = JSON.stringify(s);

      const rng = new Rng(s.rngState);
      const resolution = resolveChoice(s, rng, event, index);
      s.rngState = rng.state;
      saveGame(s);

      track('choice_selected', {
        event: event.id,
        choice: index,
        tag: choice.tag ?? null,
        age: s.player.ageYears,
      });
      for (const id of resolution.achievements) {
        track('achievement_unlocked', { id, age: s.player.ageYears });
      }
      for (const beat of resolution.beats) {
        track('event_displayed', { id: beat.id, kind: 'delayed', age: s.player.ageYears });
      }
      if (resolution.ended && resolution.endingId) {
        track('ending_reached', { id: resolution.endingId, age: s.player.ageYears, source: 'choice' });
      }

      app.busy = false;
      showConsequence(app, resolution);
    },
  },
};

export function categoryLabel(cat: string): string {
  const map: Record<string, string> = {
    career: 'CAREER',
    workplace: 'THE OFFICE',
    business: 'YOUR BUSINESS',
    money: 'MONEY',
    investing: 'INVESTING',
    romance: 'ROMANCE',
    friendship: 'FRIENDS',
    family: 'FAMILY',
    health: 'HEALTH',
    housing: 'HOME',
    travel: 'TRAVEL',
    social: 'ONLINE',
  };
  return map[cat] ?? cat.toUpperCase();
}

/* ------------------------------------------------- consequence presentation */

export function showConsequence(app: App, res: Resolution): void {
  const s = app.game;
  if (!s) return;

  // Feel it before you read it.
  const tone = res.tone;
  if (tone === 'good') {
    sfx('success');
    haptic('success');
    if (res.report.money > 20000 || res.achievements.length) confetti(30);
  } else if (tone === 'chaos') {
    sfx('failure');
    haptic('heavy');
    const root = document.getElementById('app');
    root?.classList.add('shake');
    window.setTimeout(() => root?.classList.remove('shake'), 500);
  } else if (tone === 'bad') {
    sfx('failure');
    haptic('warning');
    const root = document.getElementById('app');
    root?.classList.add('shake');
    window.setTimeout(() => root?.classList.remove('shake'), 480);
  } else {
    sfx('notify');
    haptic('tap');
  }
  if (res.report.money > 0) window.setTimeout(() => sfx('money'), 260);

  openOverlay(consequenceHtml(app, res));

  // After the overlay is in the DOM, sync the HUD numbers behind it.
  const root = document.querySelector<HTMLElement>('[data-hud="cash"]');
  if (root && res.report.money) {
    root.textContent = `$${Math.round(s.finances.cash).toLocaleString('en-US')}`;
  }
  overlayRoot()?.scrollTo?.({ top: 0 });
}

/** The full consequence card, as markup. Kept pure so it can be tested. */
export function consequenceHtml(app: App, res: Resolution): string {
  const s = app.game;
  if (!s) return '';
  const tone = res.tone;
  const chips = deltaChips(res.report);
  const months = res.advancedMonths;
  const timeText = months === 1 ? '1 month later' : `${months} months later`;
  const who = EVENT_MAP[res.event.id]?.who;
  const whoDef = who ? NPC_DEFS.find((n) => n.id === who) : undefined;

  const beatsHtml = res.beats.length
    ? `<div class="stack" style="gap:10px;margin-top:6px">
        <div class="eyebrow">And then, later…</div>
        ${res.beats
          .map(
            (b) => `<div class="card card--glow stack" style="gap:8px;animation:pop-in 500ms var(--spring) ${
              420 + chips.length * 60
            }ms backwards">
              <div class="row row--between">
                <span class="chip chip--chaotic">💭 delayed</span>
                <span class="micro">Age ${s.player.ageYears}</span>
              </div>
              <div class="title">${escapeHtml(b.title)}</div>
              ${b.body ? `<p class="body" style="font-size:15px">${escapeHtml(b.body)}</p>` : ''}
              ${chipRow(deltaChips(b.report))}
            </div>`,
          )
          .join('')}
      </div>`
    : '';

  const achievementHtml = res.achievements.length
    ? `<div class="card stack" style="gap:8px;border-color:rgba(245,184,61,0.5)">
        <div class="eyebrow">Achievement unlocked</div>
        ${res.achievements
          .map(
            (id) =>
              `<div class="row" style="gap:10px"><span style="font-size:22px">🏆</span>
                <b>${escapeHtml(achievementName(id))}</b></div>`,
          )
          .join('')}
      </div>`
    : '';

  return `
    <div class="band band--${tone}" style="animation:pop-in 420ms var(--spring)">
      <div class="band__stamp">${TONE_LABEL[tone] ?? 'CONSEQUENCE'}</div>
      <div class="row" style="gap:12px;align-items:flex-start">
        <div style="font-size:30px;line-height:1">${TONE_EMOJI[tone] ?? '📌'}</div>
        <div class="stack" style="gap:6px;flex:1">
          <h2 class="headline" style="font-size:clamp(20px,6vw,26px)">${escapeHtml(res.headline)}</h2>
          <div class="micro">Age ${s.player.ageYears} · ${timeText}</div>
        </div>
      </div>
    </div>

    <div class="scene" style="margin-top:14px">
      ${renderScene({ art: res.art, category: res.event.cat, tone, npc: who, npc2: 'player' })}
      <div class="scene__scrim"></div>
    </div>

    <p class="body" style="margin-top:14px">${escapeHtml(res.body)}</p>
    ${res.quote ? `<p class="quote" style="margin-top:12px">“${escapeHtml(res.quote)}”</p>` : ''}

    ${whoDef ? `<div class="row" style="gap:10px;margin-top:14px">
      <div class="portrait portrait--xs">${portrait(whoDef.id)}</div>
      <span class="micro">${escapeHtml(whoDef.name)} will remember this.</span>
    </div>` : ''}

    ${chips.length ? `<div style="margin-top:16px"><div class="eyebrow" style="margin-bottom:8px">What changed</div>${chipRow(chips)}</div>` : ''}

    ${beatsHtml}

    ${
      res.teasers.length
        ? `<div class="card card--flat" style="margin-top:14px">
            <div class="row" style="gap:10px">
              <span style="font-size:18px">🕰️</span>
              <p class="micro" style="flex:1">This is not over. Something you decided today is still moving.</p>
            </div>
          </div>`
        : ''
    }

    ${achievementHtml}

    <div style="height:16px"></div>
    <button class="btn btn--primary" data-act="dismiss_consequence">
      ${res.ended ? 'See how it ended' : 'Next decision'}
    </button>
    <div style="height:10px"></div>`;
}

function achievementName(id: string): string {
  // The achievements module is the source of truth; imported lazily to keep
  // the game screen's import graph small.
  return ACH_NAMES[id] ?? id.replace('ach_', '').replace(/_/g, ' ').toUpperCase();
}

let ACH_NAMES: Record<string, string> = {};

export function bindAchievementNames(map: Record<string, string>): void {
  ACH_NAMES = map;
}

/** Dismisses the consequence and moves the life forward. */
export function dismissConsequence(app: App): void {
  const s = app.game;
  closeOverlay();
  if (!s) {
    navigate('home');
    return;
  }
  if (s.player.endingId) {
    track('life_completed', { age: s.player.ageYears, decisions: s.runStats.decisionsMade });
    track('ending_reached', { id: s.player.endingId, age: s.player.ageYears });
    navigate('summary');
    return;
  }
  if (s.player.stats.health <= 0 || s.player.ageYears >= 84) {
    navigate('summary');
    return;
  }
  navigate('game');
}

/** Utility used by the reroll perk and the Daily Dilemma. */
export function refreshEvent(app: App): void {
  const s = app.game;
  if (!s) return;
  s.currentEventId = null;
  const rng = new Rng(s.rngState);
  const next = pickNextEvent(s, rng);
  s.rngState = rng.state;
  s.currentEventId = next.id;
  saveGame(s);
}

export function notifyTeaser(text: string): void {
  toast({ icon: '🕰️', title: 'Something is still moving', body: text, tone: 'chaos' });
}

export { npcName };
