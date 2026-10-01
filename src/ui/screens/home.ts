import type { Trait } from '../../engine/types';
import type { App, ScreenModule } from '../shell';
import { Rng } from '../../engine/rng';
import { createNewGame } from '../../engine/state';
import { createDailyGame } from '../../daily-run';
import { ENDINGS, contentStats } from '../../content';
import { DAILY_OVERRIDES } from '../../content/daily';
import { TRAITS, traitDef } from '../../engine/catalog';
import { defaultMeta, loadGame, loadMeta, loadSettings, saveGame, todayKey } from '../../engine/save';
import { EVENT_MAP } from '../../content';
import { fmtMoneyShort } from '../../engine/text';
import { track } from '../../analytics';
import { escapeHtml, haptic, sfx } from '../feedback';
import { PLAYER_LOOKS, playerPortrait } from '../avatars';
import { statPips } from '../chrome';
import { navigate, openOverlay } from '../shell';

/* ============================================================== SPLASH ==== */

export const splashScreen: ScreenModule = {
  html() {
    return `<div class="screen splash">
      <div class="splash__mark">${splashMark()}</div>
      <div class="stack" style="gap:10px;align-items:center">
        <h1 class="splash__logo">WHAT COULD<em>GO WRONG?</em></h1>
        <div class="splash__sub">A bad decisions life simulator</div>
      </div>
      <div class="stack" style="width:100%;max-width:320px;gap:10px;margin-top:8px">
        <button class="btn btn--primary" data-act="enter">TAP TO BEGIN</button>
        <button class="btn btn--ghost" data-act="premium">Remove ads + get everything</button>
      </div>
      <p class="micro" style="max-width:300px">Playable offline. No account. Your bad decisions stay on this device.</p>
    </div>`;
  },
  actions: {
    enter() {
      haptic('tap');
      sfx('notify');
      navigate('home');
    },
  },
};

function splashMark(): string {
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sm" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ff5c8a"/><stop offset="1" stop-color="#ff8a3d"/>
      </linearGradient>
    </defs>
    <circle cx="60" cy="60" r="54" fill="none" stroke="url(#sm)" stroke-width="4"/>
    <circle cx="60" cy="60" r="42" fill="#1b1530"/>
    <path d="M38 44 h44 M38 58 h44 M38 72 h30" stroke="#3a3255" stroke-width="5" stroke-linecap="round"/>
    <path d="M28 28 l64 64 M92 28 l-64 64" stroke="url(#sm)" stroke-width="1.6" opacity="0.5"/>
    <circle cx="88" cy="34" r="11" fill="#f5b83d"/>
    <text x="88" y="40" text-anchor="middle" font-size="15" font-weight="900" fill="#22190a" font-family="system-ui">?</text>
  </svg>`;
}

/* ================================================================ HOME ==== */

export const homeScreen: ScreenModule = {
  html(app: App) {
    const meta = app.meta ?? defaultMeta();
    const s = app.game;
    const endingCount = meta.endings.length;
    const achCount = meta.achievements.length;
    const stats = contentStats();

    const saveCard = s
      ? `<div class="card card--glow stack" style="gap:12px">
          <div class="row row--between">
            <span class="eyebrow">Life in progress</span>
            <span class="pill">${escapeHtml(stageLabelFor(s))}</span>
          </div>
          <div class="row" style="gap:12px">
            <div class="avatar avatar--on">${playerPortrait(s.player.identity.avatar || s.player.identity.look, hpFace(s))}</div>
            <div class="listrow__main">
              <div class="title-xl">${escapeHtml(s.player.identity.name)}</div>
              <div class="micro">${escapeHtml(s.career.title)} · Age ${s.player.ageYears}</div>
              <div class="row" style="gap:6px;margin-top:6px">
                <span class="badge">${fmtMoneyShort(s.finances.cash)}</span>
                <span class="badge ${s.player.stats.stress > 70 ? 'badge--bad' : ''}">${escapeHtml(traitDef(s.player.identity.trait).name)}</span>
              </div>
            </div>
          </div>
          ${statPips(s)}
          <button class="btn btn--primary" data-act="continue">CONTINUE LIFE</button>
        </div>`
      : `<div class="card stack" style="gap:12px">
          <span class="eyebrow">No life in progress</span>
          <div class="title-xl">You are 23, employed, and one decision away from a much more interesting year.</div>
          <p class="subtitle">${stats.cards} scenarios. ${stats.endings} endings. ${stats.achievements} achievements. Most of them are your fault.</p>
          <button class="btn btn--primary" data-act="goto" data-arg="new_life">START NEW LIFE</button>
        </div>`;

    return `<div class="screen">
      <div class="row row--between" style="padding:6px 0 14px">
        <div class="stack" style="gap:2px">
          <div class="eyebrow">WHAT COULD GO WRONG?</div>
          <div class="micro">Lives lived: ${meta.livesLived} · Endings: ${endingCount}/${ENDINGS.length}</div>
        </div>
        <button class="btn btn--icon btn--ghost" data-act="goto" data-arg="settings" aria-label="Settings">⚙️</button>
      </div>

      <div class="scroll stack stack--lg">
        ${saveCard}

        <div class="stack" style="gap:10px">
          <button class="btn btn--ghost" data-act="daily">
            <span class="btn__label"><span>📅 DAILY DILEMMA</span>
            <span class="btn__hint">${todayDone(meta) ? 'Done for today — come back tomorrow' : dbgToday()}</span></span>
            ${todayDone(meta) ? '<span class="badge badge--good">✓</span>' : '<span class="badge badge--brand">NEW</span>'}
          </button>
          <button class="btn btn--ghost" data-act="goto" data-arg="album">
            <span class="btn__label"><span>📖 LIFE ALBUM</span>
            <span class="btn__hint">${endingCount} of ${ENDINGS.length} endings · ${meta.rareEvents.length} rare events</span></span>
            <span class="badge">${Math.round((endingCount / ENDINGS.length) * 100)}%</span>
          </button>
          <button class="btn btn--ghost" data-act="goto" data-arg="achievements">
            <span class="btn__label"><span>🏆 ACHIEVEMENTS</span>
            <span class="btn__hint">${achCount} of ${stats.achievements} unlocked</span></span>
            <span class="badge">${achCount}</span>
          </button>
          <button class="btn btn--ghost" data-act="goto" data-arg="settings">
            <span class="btn__label"><span>⚙️ SETTINGS</span>
            <span class="btn__hint">Sound, haptics, notifications, data</span></span>
          </button>
          ${meta.livesLived > 0 ? `<button class="btn btn--ghost" data-act="goto" data-arg="summary">
            <span class="btn__label"><span>📜 LAST LIFE SUMMARY</span>
            <span class="btn__hint">Re-read how it went</span></span>
          </button>` : ''}
        </div>

        <p class="micro center" style="padding:0 12px">
          Best net worth so far: <b>${fmtMoneyShort(meta.bestNetWorth)}</b>
        </p>
      </div>
    </div>`;
  },
  actions: {
    continue() {
      haptic('tap');
      navigate('game');
    },
    async daily(app: App) {
      haptic('tap');
      const meta = app.meta ?? defaultMeta();
      const key = todayKey();
      if (meta.lastDailyDate === key && meta.dailyDone) {
        openOverlay(`<div class="band band--good"><div class="band__stamp">DAILY</div>
          <h2 class="title-xl">ALREADY DONE TODAY</h2></div>
          <p class="body" style="margin-top:12px">You played today's dilemma. A new one unlocks at midnight UTC.</p>
          <div style="height:16px"></div>
          <button class="btn btn--primary" data-act="close_overlay">Fine</button>`);
        return;
      }
      const id = app.params.dailyId ?? pickDaily(key);
      navigate('daily', { dailyId: id });
    },
  },
};

function pickDaily(key: string): string {
  const ids = Object.keys(DAILY_OVERRIDES);
  const rng = Rng.fromString(`daily:${key}`);
  return ids[Math.floor(rng.next() * ids.length)] ?? 'career_salary_spreadsheet';
}

function todayDone(meta: ReturnType<typeof defaultMeta>): boolean {
  return meta.lastDailyDate === todayKey() && meta.dailyDone;
}

function dbgToday(): string {
  return 'One scenario. Forty seconds. Shareable seed.';
}

function stageLabelFor(s: NonNullable<App['game']>): string {
  return s.player.stage.replace('_', ' ').toUpperCase();
}

function hpFace(s: NonNullable<App['game']>): 'happy' | 'neutral' | 'worried' | 'shock' {
  if (s.player.stats.health < 30 || s.player.stats.stress > 85) return 'shock';
  if (s.player.stats.happiness > 65) return 'happy';
  if (s.player.stats.happiness < 30) return 'worried';
  return 'neutral';
}

/* ============================================================ NEW LIFE ==== */

export const newLifeScreen: ScreenModule = {
  html(app: App) {
    const s = app.game;
    const stats = contentStats();
    return `<div class="screen">
      <div class="row" style="gap:12px;padding:4px 0 12px">
        <button class="btn btn--icon btn--ghost" data-act="goto" data-arg="home" aria-label="Back">←</button>
        <div class="listrow__main"><div class="title">START A NEW LIFE</div>
        <div class="micro">Everything from here is technically a choice</div></div>
      </div>
      <div class="scroll stack stack--lg">
        <div class="card stack" style="gap:14px">
          <span class="eyebrow">The setup</span>
          <div class="title-xl">Junior Marketing Assistant, 23, $2,800 a month.</div>
          <p class="body">You have $4,500 saved, rent is $1,100, you are single, your stress is manageable and your happiness is fine — the specific kind of fine that means nothing is obviously wrong.

Then you make decisions for the next sixty years and we all watch what happens.</p>
          <div class="grid-3">
            <div class="tile"><span class="eyebrow">Age</span><b>23</b></div>
            <div class="tile"><span class="eyebrow">Salary</span><b>${fmtMoneyShort(2800)}</b></div>
            <div class="tile"><span class="eyebrow">Saved</span><b>${fmtMoneyShort(4500)}</b></div>
          </div>
        </div>

        <div class="card stack" style="gap:10px">
          <span class="eyebrow">What you're getting into</span>
          <div class="grid-2">
            <div class="tile"><b>${stats.cards}</b><span class="micro">scenarios</span></div>
            <div class="tile"><b>${stats.endings}</b><span class="micro">endings</span></div>
            <div class="tile"><b>${stats.achievements}</b><span class="micro">achievements</span></div>
            <div class="tile"><b>${stats.avgChoices.toFixed(1)}</b><span class="micro">options per card</span></div>
          </div>
          <p class="micro">Consequences do not arrive immediately. A decision you make at 24 can come back at 27, and the game will not warn you.</p>
        </div>

        ${
          s
            ? `<div class="card" style="border-color:rgba(255,95,109,0.4)">
                <div class="row" style="gap:10px">
                  <span style="font-size:20px">⚠️</span>
                  <p class="micro" style="flex:1">Starting a new life replaces <b>${escapeHtml(s.player.identity.name)}</b> at age ${s.player.ageYears}. Your album, achievements and endings are kept forever.</p>
                </div>
              </div>`
            : ''
        }
      </div>
      <div style="height:14px"></div>
      <button class="btn btn--primary" data-act="goto" data-arg="setup">CHOOSE WHO YOU ARE</button>
      <div style="height:10px"></div>
    </div>`;
  },
  actions: {
    confirm(app: App) {
      app.game = null;
      navigate('setup');
    },
  },
};

/* =============================================================== SETUP ==== */

const DEFAULT_NAME = '';

export const setupScreen: ScreenModule = {
  html(app: App) {
    const name = (app.params as { name?: string }).name ?? DEFAULT_NAME;
    const trait = ((app.params as { trait?: Trait }).trait ?? 'ambitious') as Trait;
    const look = (app.params as { look?: string }).look ?? PLAYER_LOOKS[0].id;

    return `<div class="screen">
      <div class="row" style="gap:12px;padding:4px 0 12px">
        <button class="btn btn--icon btn--ghost" data-act="goto" data-arg="new_life" aria-label="Back">←</button>
        <div class="listrow__main"><div class="title">WHO ARE YOU?</div>
        <div class="micro">Three questions. Then a lifetime of consequences.</div></div>
      </div>

      <div class="scroll stack stack--lg">
        <div class="stack" style="gap:8px">
          <span class="eyebrow">1 · Your name</span>
          <input class="field" id="nameField" maxlength="16" placeholder="Type a name" value="${escapeHtml(name)}"
            autocomplete="off" autocapitalize="words" spellcheck="false" />
          <div class="row" style="gap:6px">
            ${['Jules', 'Ronnie', 'Max', 'Kit', 'Birdie', 'Sol']
              .map((n) => `<button class="chip" data-act="namerandom" data-arg="${n}">${n}</button>`)
              .join('')}
          </div>
        </div>

        <div class="stack" style="gap:8px">
          <span class="eyebrow">2 · Your face</span>
          <div class="row" style="gap:10px;overflow-x:auto;padding-bottom:2px">
            ${PLAYER_LOOKS.map(
              (l) => `<button data-act="look" data-arg="${l.id}" aria-label="Look ${l.id}"
                style="flex:0 0 auto;background:none;padding:0">
                <span class="avatar ${look === l.id ? 'avatar--on' : ''}" style="width:64px;height:64px">${playerPortrait(l.id, 'neutral')}</span>
              </button>`,
            ).join('')}
          </div>
        </div>

        <div class="stack" style="gap:8px">
          <span class="eyebrow">3 · Your one advantage</span>
          ${TRAITS.map((tr) => traitCard(tr, trait === tr.id)).join('')}
        </div>
      </div>

      <div style="height:14px"></div>
      <button class="btn btn--primary" data-act="start">START LIFE AT 23</button>
      <div style="height:10px"></div>
    </div>`;
  },
  mount(app: App) {
    const field = document.getElementById('nameField') as HTMLInputElement | null;
    field?.addEventListener('input', () => {
      const params = app.params as { name?: string };
      params.name = field.value;
    });
    field?.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Enter') (e.target as HTMLInputElement).blur();
    });
  },
  actions: {
    namerandom(app, arg) {
      const field = document.getElementById('nameField') as HTMLInputElement | null;
      if (field) field.value = arg ?? 'Jules';
      (app.params as { name?: string }).name = arg ?? 'Jules';
      haptic('tap');
    },
    look(app, arg) {
      (app.params as { look?: string }).look = arg;
      haptic('tap');
      sfx('tap');
      navigate('setup', app.params);
      // Keep whatever name the player already typed.
      const field = document.getElementById('nameField') as HTMLInputElement | null;
      if (field) field.value = (app.params as { name?: string }).name ?? '';
      field?.focus();
    },
    trait(app, arg) {
      (app.params as { trait?: Trait }).trait = arg as Trait;
      haptic('tap');
      sfx('tap');
      navigate('setup', app.params);
      const field = document.getElementById('nameField') as HTMLInputElement | null;
      if (field) field.value = (app.params as { name?: string }).name ?? '';
    },
    start(app: App) {
      const params = app.params as { name?: string; trait?: Trait; look?: string };
      const name = (params.name ?? '').trim() || 'Jules';
      const trait = params.trait ?? 'ambitious';
      const look = params.look ?? PLAYER_LOOKS[0].id;

      const settings = app.settings ?? loadSettings();
      const meta = app.meta ?? loadMeta();
      app.settings = settings;
      app.meta = meta;

      const state = createNewGame({
        identity: { name, avatar: look, look, trait, pronouns: 'they/them' },
        settings,
        meta,
      });
      app.game = state;
      saveGame(state);
      track('life_started', { trait, age: 23 });
      sfx('levelup');
      haptic('success');
      navigate('game');
    },
  },
};

function traitCard(t: (typeof TRAITS)[number], on: boolean): string {
  const bonuses = Object.entries(t.bonuses)
    .map(([k, v]) => `<span class="chip ${v > 0 ? 'chip--good' : 'chip--bad'}">${k} ${v > 0 ? '+' : ''}${v}</span>`)
    .join(' ');
  return `<button class="trait ${on ? 'trait--on' : ''}" data-act="trait" data-arg="${t.id}">
    <span class="trait__glyph" style="background:${t.color}22;color:${t.color}">${t.icon}</span>
    <span style="flex:1">
      <span class="listrow__title">${escapeHtml(t.name)}</span>
      <span class="listrow__sub">${escapeHtml(t.blurb)}</span>
      <span class="row" style="gap:5px;flex-wrap:wrap;margin-top:6px">${bonuses}</span>
    </span>
  </button>`;
}

/* =========================================================== DAILY ======== */

export const dailyScreen: ScreenModule = {
  html(app: App) {
    const id = app.params.dailyId ?? 'career_salary_sheet' /* replaced below */;
    const key = todayKey();
    const meta = app.meta ?? defaultMeta();
    const done = meta.lastDailyDate === key && meta.dailyDone;
    const scenario = EVENT_MAP[id];

    if (done) {
      return `<div class="screen">
        <div class="row" style="gap:12px;padding:4px 0 12px">
          <button class="btn btn--icon btn--ghost" data-act="leave_daily" aria-label="Back">←</button>
          <div class="listrow__main"><div class="title">DAILY DILEMMA</div>
          <div class="micro">${key} · everyone in the world got this one</div></div>
        </div>
        <div class="scroll stack stack--lg">
          ${emptyCard()}
        </div>
        <button class="btn btn--primary" data-act="leave_daily">BACK TO MY LIFE</button>
      </div>`;
    }

    return `<div class="screen">
      <div class="row" style="gap:12px;padding:4px 0 12px">
        <button class="btn btn--icon btn--ghost" data-act="leave_daily" aria-label="Back">←</button>
        <div class="listrow__main"><div class="title">DAILY DILEMMA</div>
        <div class="micro">${key} · the same scenario for everyone</div></div>
      </div>
      <div class="scroll stack stack--lg">
        <div class="card card--glow stack" style="gap:12px">
          <span class="eyebrow">Today's card</span>
          <div class="title-xl">${escapeHtml(scenario?.title ?? 'A decision you were not expecting')}</div>
          <p class="micro">One scenario. One decision. Roughly forty seconds. It runs on a stranger's life, not yours — nothing here can damage your run.</p>
        </div>
        <div class="card stack" style="gap:10px">
          <span class="eyebrow">How it works</span>
          <div class="row" style="gap:10px"><span class="badge badge--brand">1</span><span class="micro" style="flex:1">You play a guest character with a life shaped to fit the scenario.</span></div>
          <div class="row" style="gap:10px"><span class="badge badge--brand">2</span><span class="micro" style="flex:1">You make one decision and live with the consequence.</span></div>
          <div class="row" style="gap:10px"><span class="badge badge--brand">3</span><span class="micro" style="flex:1">Everyone playing today gets the same card. Compare results.</span></div>
        </div>
      </div>
      <div style="height:14px"></div>
      <button class="btn btn--primary" data-act="play_daily">PLAY TODAY'S DILEMMA</button>
      <div style="height:10px"></div>
    </div>`;
  },

  actions: {
    play_daily(app: App) {
      const id = app.params.dailyId ?? 'career_salary_spreadsheet';
      // Park the real life so the guest run cannot touch it.
      app.parkedLife = app.game;
      app.inDaily = true;
      haptic('success');
      sfx('notify');
      app.game = createDailyGame(id, app.settings, app.meta);
      navigate('game');
    },
    leave_daily(app: App) {
      leaveDaily(app);
    },
  },
};

/** Returns from a Daily Dilemma to whatever real life was parked. */
export function leaveDaily(app: App): void {
  if (app.parkedLife) {
    app.game = app.parkedLife;
    saveGame(app.parkedLife);
  } else {
    app.game = loadGame();
  }
  app.parkedLife = null;
  app.inDaily = false;
  navigate(app.game ? 'game' : 'home');
}

function emptyCard(): string {
  return `<div class="card center stack" style="gap:10px;align-items:center">
    <div style="font-size:34px">📅</div>
    <div class="title">Today's dilemma is done</div>
    <p class="subtitle">A new scenario unlocks at midnight UTC. Everyone in the world gets the same one.</p>
  </div>`;
}
