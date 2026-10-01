/**
 * WHAT COULD GO WRONG? — A Bad Decisions Life Simulator
 *
 * Boot: wire the engine's save layer to the presentation shell, register the
 * sixteen screens, install the global action bus and hand over to the splash.
 *
 * Layering, top to bottom:
 *   src/content     pure data — events, NPCs, endings, achievements
 *   src/engine      pure simulation — deterministic, unit tested, no DOM
 *   src/ui          presentation — screens, procedural art, motion, feedback
 *   src/main.ts     the seam
 */

import './ui/styles.css';

import {
  defaultMeta,
  defaultSettings,
  importBundle,
  loadGame,
  loadMeta,
  loadSettings,
  saveMeta,
  saveSettings,
} from './engine/save';
import { ACHIEVEMENTS } from './content';
import { track } from './analytics';
import { bindSettings, haptic, sfx, syncMusic, toast } from './ui/feedback';
import { copyText, installBackButton, isNative, platform, scheduleDailyReminder, setStatusBarDark } from './native';
import {
  GLOBAL_ACTIONS,
  OVERLAY_ACTIONS,
  app,
  closeOverlay,
  installClickBus,
  navigate,
  registerScreens,
  type App,
} from './ui/shell';
import { bindAchievementNames, dismissConsequence, gameScreen } from './ui/screens/game';
import { dailyScreen, homeScreen, leaveDaily, newLifeScreen, setupScreen, splashScreen } from './ui/screens/home';
import { careerScreen, moneyScreen, relationshipsScreen, statsScreen, timelineScreen } from './ui/screens/detail';
import { achievementsScreen, albumScreen, shopScreen } from './ui/screens/gallery';
import { applyAppearance, settingsScreen } from './ui/screens/settings';
import { summaryScreen } from './ui/screens/summary';
import { resetAllProgress } from './lifecycle';

function boot(): void {
  app.settings = loadSettings();
  app.meta = loadMeta() ?? defaultMeta();
  app.game = loadGame();

  bindSettings(app.settings);
  bindAchievementNames(
    Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, `${a.name} — ${a.desc}`])),
  );

  registerScreens({
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
  });

  installClickBus();
  installGlobalActions();
  installOverlayActions();
  applyAppearance(app);
  void setStatusBarDark();
  if (app.settings.notifications) void scheduleDailyReminder(true);

  // A life in progress goes straight back onto the table.
  navigate(app.game ? 'game' : 'splash');

  void installBackButton(() => {
    if (app.overlay) {
      closeOverlay();
      return true;
    }
    if (app.route === 'game' || app.route === 'splash') return app.route !== 'splash';
    navigate(app.game ? 'game' : 'home');
    return true;
  });

  track('game_started', {
    native: isNative(),
    platform: platform(),
    hasSave: !!app.game,
    livesLived: app.meta.livesLived,
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') persist();
  });
  window.addEventListener('pagehide', persist);
}

function persist(): void {
  saveSettings(app.settings);
  saveMeta(app.meta);
}

/* -------------------------------------------------------- global actions -- */

function installGlobalActions(): void {
  GLOBAL_ACTIONS.goto = (a: App, arg) => {
    if (!arg) return;
    haptic('tap');
    sfx('tap');
    navigate(arg as Parameters<typeof navigate>[0], a.params);
  };

  GLOBAL_ACTIONS.close_overlay = () => {
    haptic('tap');
    closeOverlay();
  };

  GLOBAL_ACTIONS.dismiss_consequence = (a) => dismissConsequence(a);

  GLOBAL_ACTIONS.leave_daily = (a) => leaveDaily(a);

  // Desktop shortcuts — handy for testing, harmless elsewhere.
  document.addEventListener('keydown', (event) => {
    const target = event.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
    if (app.overlay) {
      if (event.key === 'Enter' || event.key === ' ') {
        document.querySelector<HTMLElement>('[data-act="dismiss_consequence"]')?.click();
      }
      return;
    }
    if (app.route !== 'game') return;
    const n = Number(event.key);
    if (n >= 1 && n <= 4) {
      document.querySelector<HTMLElement>(`[data-act="choose"][data-arg="${n - 1}"]`)?.click();
    }
  });
}

function installOverlayActions(): void {
  OVERLAY_ACTIONS.close_overlay = () => {
    haptic('tap');
    closeOverlay();
  };

  OVERLAY_ACTIONS.dismiss_consequence = (a) => dismissConsequence(a);

  OVERLAY_ACTIONS.close_daily = (a) => leaveDaily(a);

  OVERLAY_ACTIONS.copy_save = async (a) => {
    if (!a.game) return;
    const { exportBundle } = await import('./engine/save');
    const ok = await copyText(exportBundle(a.game));
    toast({
      icon: ok ? '📋' : '⚠️',
      title: ok ? 'Copied' : 'Copy failed',
      body: ok ? 'Paste it somewhere safe.' : 'Select the text and copy it manually.',
      tone: ok ? 'good' : 'bad',
    });
  };

  OVERLAY_ACTIONS.do_import = (a) => {
    const field = document.getElementById('importField') as HTMLTextAreaElement | null;
    const raw = field?.value?.trim();
    if (!raw) {
      toast({ icon: '⚠️', title: 'Nothing pasted', tone: 'bad' });
      return;
    }
    const restored = importBundle(raw);
    if (!restored) {
      toast({
        icon: '⚠️',
        title: 'That save could not be read',
        body: 'Check that you copied all of it.',
        tone: 'bad',
      });
      return;
    }
    a.game = restored.state;
    const meta = a.meta ?? defaultMeta();
    for (const e of restored.meta.endings) if (!meta.endings.includes(e)) meta.endings.push(e);
    for (const e of restored.meta.achievements) {
      if (!meta.achievements.includes(e)) meta.achievements.push(e);
    }
    a.meta = meta;
    saveMeta(meta);
    closeOverlay();
    toast({ icon: '✅', title: 'Life restored', tone: 'good' });
    navigate('game');
  };

  OVERLAY_ACTIONS.do_wipe = (a) => {
    resetAllProgress();
    a.game = null;
    a.meta = defaultMeta();
    saveMeta(a.meta);
    closeOverlay();
    toast({ icon: '🧹', title: 'Everything deleted', body: 'A clean slate.', tone: 'neutral' });
    navigate('home');
  };

  OVERLAY_ACTIONS.buy_premium = async (a) => {
    const { purchasePremium } = await import('./monetization');
    const st = a.settings ?? defaultSettings();
    const ok = await purchasePremium(st);
    saveSettings(st);
    a.settings = st;
    closeOverlay();
    toast({
      icon: ok ? '✨' : 'ℹ️',
      title: ok ? 'Premium unlocked' : 'Store unavailable here',
      body: ok
        ? 'Thank you — genuinely.'
        : 'Purchases are handled inside the App Store and Play Store builds.',
      tone: ok ? 'good' : 'neutral',
    });
  };

  OVERLAY_ACTIONS.buy_pack = async (a, arg) => {
    const { purchasePack } = await import('./monetization');
    const st = a.settings ?? defaultSettings();
    if (!arg) return;
    const ok = await purchasePack(arg, st);
    saveSettings(st);
    toast({
      icon: ok ? '📦' : 'ℹ️',
      title: ok ? 'Pack added' : 'Store unavailable here',
      body: ok
        ? 'New scenarios are already in the deck.'
        : 'Purchases are handled inside the App Store and Play Store builds.',
      tone: ok ? 'good' : 'neutral',
    });
  };
}

/* --------------------------------------------------------------- start ---- */

function start(): void {
  boot();
  syncMusic();
  if (app.game) {
    window.setTimeout(
      () =>
        toast({
          icon: '⏳',
          title: `${app.game?.player.identity.name} is ${app.game?.player.ageYears}`,
          body: 'Your life is exactly where you left it.',
          tone: 'neutral',
        }),
      420,
    );
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
