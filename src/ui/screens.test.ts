import { describe, expect, it } from 'vitest';
import type { GameState } from '../engine/types';
import { Rng } from '../engine/rng';
import { createNewGame } from '../engine/state';
import { defaultMeta, defaultSettings } from '../engine/save';
import { pickNextEvent, resolveChoice, type Resolution } from '../engine/engine';
import { EVENT_MAP } from '../content';
import { app, type App, type Route } from './shell';
import { consequenceHtml, gameScreen } from './screens/game';
import { dailyScreen, homeScreen, newLifeScreen, setupScreen, splashScreen } from './screens/home';
import { careerScreen, moneyScreen, relationshipsScreen, statsScreen, timelineScreen } from './screens/detail';
import { achievementsScreen, albumScreen, shopScreen } from './screens/gallery';
import { settingsScreen } from './screens/settings';
import { summaryScreen } from './screens/summary';

/**
 * UI INTEGRITY
 *
 * Every screen is a pure function of app state, which means we can render all
 * sixteen of them in a headless test run and prove that no screen throws, no
 * screen returns an empty document, and no screen leaks an unresolved template
 * placeholder or an "undefined" into the markup the player would read.
 */

function freshApp(overrides: Partial<App> = {}): App {
  const settings = defaultSettings();
  settings.sfx = false;
  settings.music = false;
  settings.haptics = false;
  const meta = defaultMeta();
  const buildApp: App = {
    ...app,
    route: 'home',
    params: {},
    game: null,
    meta,
    settings,
    overlay: null,
    lastResolution: null,
    busy: false,
    screens: {},
    summaryIndex: 0,
    parkedLife: null,
    inDaily: false,
    ...overrides,
  };
  return buildApp;
}

function newLife(seed = 7, age = 23): GameState {
  const settings = defaultSettings();
  settings.sfx = false;
  settings.music = false;
  return createNewGame({
    identity: { name: 'Testy McTest', avatar: 'l1', look: 'l1', trait: 'risk_taker', pronouns: 'they/them' },
    settings,
    meta: defaultMeta(),
    seed,
    startAge: age,
  });
}

const ALL_SCREENS: Array<{ route: Route; needsGame: boolean }> = [
  { route: 'splash', needsGame: false },
  { route: 'home', needsGame: false },
  { route: 'new_life', needsGame: false },
  { route: 'setup', needsGame: false },
  { route: 'game', needsGame: true },
  { route: 'stats', needsGame: true },
  { route: 'relationships', needsGame: true },
  { route: 'career', needsGame: true },
  { route: 'money', needsGame: true },
  { route: 'timeline', needsGame: true },
  { route: 'achievements', needsGame: false },
  { route: 'album', needsGame: false },
  { route: 'summary', needsGame: true },
  { route: 'settings', needsGame: false },
  { route: 'daily', needsGame: false },
  { route: 'shop', needsGame: false },
];

const SCREEN_MODULES = {
  splash: splashScreen,
  home: homeScreen,
  new_life: newLifeScreen,
  setup: setupScreen,
  game: gameScreen,
  stats: statsScreen,
  relationships: relationshipsScreen,
  career: careerScreen,
  money: moneyScreen,
  timeline: timelineScreen,
  achievements: achievementsScreen,
  album: albumScreen,
  summary: summaryScreen,
  settings: settingsScreen,
  daily: dailyScreen,
  shop: shopScreen,
};

describe('screen rendering', () => {
  it('renders every screen without a game in progress', () => {
    for (const { route, needsGame } of ALL_SCREENS) {
      if (needsGame) continue;
      const a = freshApp({ route });
      const html = SCREEN_MODULES[route].html(a);
      expect(html.length, `${route} produced empty markup`).toBeGreaterThan(80);
      expect(html, `${route} lost its screen wrapper`).toContain('class="screen');
    }
  });

  it('renders every screen with a life in progress', () => {
    for (const { route } of ALL_SCREENS) {
      const a = freshApp({ route, game: newLife() });
      const html = SCREEN_MODULES[route].html(a);
      expect(html.length, `${route} produced empty markup`).toBeGreaterThan(80);
      expect(html, `${route} lost its screen wrapper`).toContain('class="screen');
    }
  });

  it('never leaks undefined, NaN or unresolved tokens into the UI', () => {
    for (const { route } of ALL_SCREENS) {
      const a = freshApp({ route, game: newLife() });
      const html = SCREEN_MODULES[route].html(a);
      expect(html, `${route} leaked undefined`).not.toMatch(/>undefined</);
      expect(html, `${route} leaked NaN`).not.toContain('NaN');
      expect(html, `${route} leaked a raw token`).not.toMatch(/\{[a-zA-Z]+\}/);
      expect(html, `${route} leaked [object Object]`).not.toContain('[object Object]');
    }
  });

  it('renders a life at every stage without breaking', () => {
    for (const age of [23, 32, 45, 58, 70, 83]) {
      const g = newLife(11, age);
      for (const { route } of ALL_SCREENS) {
        const a = freshApp({ route, game: g });
        expect(() => SCREEN_MODULES[route].html(a), `${route} at age ${age}`).not.toThrow();
      }
    }
  });

  it('renders a broke, indebted, unhealthy life without breaking', () => {
    const g = newLife(5, 44);
    g.finances.cash = -2400;
    g.finances.debt = 88_000;
    g.finances.salary = 0;
    g.player.stats.stress = 97;
    g.player.stats.health = 8;
    g.player.stats.happiness = 3;
    g.career.jobsLost = 4;
    g.romance.status = 'divorced';
    g.romance.breakups = 3;
    for (const { route } of ALL_SCREENS) {
      const a = freshApp({ route, game: g });
      expect(() => SCREEN_MODULES[route].html(a), `${route} in ruins`).not.toThrow();
    }
  });
});

describe('the decision loop', () => {
  it('serves a card, resolves a choice, and serves the next one', () => {
    const g = newLife(21);
    const a = freshApp({ route: 'game', game: g });

    for (let i = 0; i < 25; i++) {
      const html = gameScreen.html(a);
      expect(html, `turn ${i} produced no card`).toContain('class="choice');
      const event = g.currentEventId ? EVENT_MAP[g.currentEventId] : null;
      expect(event, `turn ${i} had no current event`).not.toBeNull();
      if (!event) break;
      expect(html).toContain(event.choices.length > 1 ? 'data-arg="1"' : 'data-arg="0"');

      const rng = new Rng(g.rngState);
      const res = resolveChoice(g, rng, event, i % event.choices.length);
      g.rngState = rng.state;

      const overlay = consequenceHtml(a, res);
      expect(overlay.length, `turn ${i} consequence empty`).toBeGreaterThan(200);
      expect(overlay).toContain('data-act="dismiss_consequence"');
      expect(overlay).not.toContain('undefined');
      if (g.player.endingId) break;
    }
  });

  it('shows the player what changed after a real choice', () => {
    const g = newLife(3);
    const a = freshApp({ route: 'game', game: g });
    const event = pickNextEvent(g, new Rng(g.rngState));
    const rng = new Rng(g.rngState);
    const res: Resolution = resolveChoice(g, rng, event, 0);
    const overlay = consequenceHtml(a, res);

    // Every card resolves into either visible deltas or a delayed payoff tease.
    const hasDeltas = overlay.includes('delta--');
    const hasTease = overlay.includes('still moving');
    const hasBeats = overlay.includes('And then, later');
    expect(hasDeltas || hasTease || hasBeats).toBe(true);
    expect(overlay).toContain(res.headline.slice(0, 8));
  });

  it('keeps navigation state across the whole loop', () => {
    const g = newLife(9);
    const a = freshApp({ route: 'game', game: g });
    const before = g.player.identity.name;
    for (const route of ['stats', 'money', 'career', 'relationships', 'timeline', 'game'] as Route[]) {
      a.route = route;
      SCREEN_MODULES[route].html(a);
    }
    expect(a.game?.player.identity.name).toBe(before);
    expect(a.game?.finances.cash).toBe(g.finances.cash);
  });
});
