import type { GameState, Settings } from '../engine/types';
import type { MetaState } from '../engine/save';
import { escapeHtml } from './feedback';

/**
 * The shell: one mutable app object, one router, one delegated click bus.
 *
 * Screens are pure `html(app)` functions plus an optional `actions` map. All
 * interaction goes through `data-act`, which means a re-render can never leave
 * a stale listener behind and navigating can never destroy game state — the
 * `GameState` lives here, outside the DOM, for the whole life.
 */

export type Route =
  | 'splash'
  | 'home'
  | 'new_life'
  | 'setup'
  | 'game'
  | 'stats'
  | 'relationships'
  | 'career'
  | 'money'
  | 'timeline'
  | 'achievements'
  | 'album'
  | 'summary'
  | 'settings'
  | 'daily'
  | 'shop';

export interface ScreenParams {
  toastMessage?: string;
  /** Summary screen: which archived life to show. */
  summaryIndex?: number;
  dailyId?: string;
}

export type ActionHandler = (
  app: App,
  arg: string | undefined,
  el: HTMLElement,
) => void | Promise<void>;

export interface ScreenModule {
  html: (app: App) => string;
  actions?: Record<string, ActionHandler>;
  mount?: (app: App, root: HTMLElement) => void;
}

export interface App {
  route: Route;
  params: ScreenParams;
  game: GameState | null;
  meta: MetaState;
  settings: Settings;
  /** The consequence currently on screen, if any. */
  overlay: { html: string; onClose?: () => void } | null;
  /** Last resolution, kept so the game screen can show its aftermath. */
  lastResolution: unknown;
  /** Set while a long transition is running, to swallow double taps. */
  busy: boolean;
  screens: Partial<Record<Route, ScreenModule>>;
  summaryIndex: number;
  /** The real life, parked while a Daily Dilemma guest run is on screen. */
  parkedLife: GameState | null;
  /** Set while the Daily Dilemma is being played. */
  inDaily: boolean;
  /** The event whose gamble odds the player has paid to see. */
  revealedEventId: string | null;
}

export const app: App = {
  route: 'splash',
  params: {},
  game: null,
  meta: null as unknown as MetaState,
  settings: null as unknown as Settings,
  overlay: null,
  lastResolution: null,
  busy: false,
  screens: {},
  summaryIndex: 0,
  parkedLife: null,
  inDaily: false,
  revealedEventId: null,
};

export function registerScreens(map: Partial<Record<Route, ScreenModule>>): void {
  Object.assign(app.screens, map);
}

/* ---------------------------------------------------------------- routing */

export function navigate(route: Route, params: ScreenParams = {}): void {
  app.route = route;
  app.params = params;
  render();
}

/** Re-renders the current screen in place. */
export function render(): void {
  const root = document.getElementById('app');
  if (!root) return;
  const screen = app.screens[app.route];
  if (!screen) {
    root.innerHTML = `<div class="screen"><p class="body">Missing screen: ${app.route}</p></div>`;
    return;
  }
  root.innerHTML = screen.html(app);
  screen.mount?.(app, root);
}

/* --------------------------------------------------------------- overlays */

export function openOverlay(html: string, onClose?: () => void): void {
  closeOverlay();
  app.overlay = { html, onClose };
  const el = document.createElement('div');
  el.className = 'overlay';
  el.id = 'overlay';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.innerHTML = `<div class="overlay__inner">${html}</div>`;
  document.body.appendChild(el);
  // Keep the page behind from scrolling while a modal is up.
  document.body.style.overflow = 'hidden';
}

export function closeOverlay(): void {
  const el = document.getElementById('overlay');
  if (el) {
    el.classList.add('overlay--out');
    window.setTimeout(() => el.remove(), 240);
  }
  app.overlay = null;
  document.body.style.overflow = '';
}

export function overlayRoot(): HTMLElement | null {
  return document.getElementById('overlay');
}

/* ------------------------------------------------------------ click router */

export function installClickBus(): void {
  document.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-act]');
    if (!target) return;
    if (app.busy) {
      event.preventDefault();
      return;
    }
    const act = target.dataset.act;
    if (!act) return;
    const arg = target.dataset.arg;

    // Overlay actions take priority while a modal is open.
    if (app.overlay) {
      const overlayHandler = OVERLAY_ACTIONS[act];
      if (overlayHandler) {
        event.preventDefault();
        void overlayHandler(app, arg, target);
        return;
      }
    }

    const screen = app.screens[app.route];
    const handler = screen?.actions?.[act];
    if (handler) {
      event.preventDefault();
      void handler(app, arg, target);
      return;
    }
    const global = GLOBAL_ACTIONS[act];
    if (global) {
      event.preventDefault();
      void global(app, arg, target);
    }
  });
}

/** Actions available from any screen. */
export const GLOBAL_ACTIONS: Record<string, ActionHandler> = {};

/** Actions that work while a modal is open. */
export const OVERLAY_ACTIONS: Record<string, ActionHandler> = {};

/* -------------------------------------------------------------- fragments */

export function screen(content: string, opts: { flush?: boolean; cls?: string } = {}): string {
  return `<div class="screen${opts.flush ? ' screen--flush' : ''}${opts.cls ? ` ${opts.cls}` : ''}">${content}</div>`;
}

export function backButton(route: Route, label = 'Back'): string {
  return `<button class="btn btn--icon btn--ghost" data-act="goto" data-arg="${route}" aria-label="${label}">←</button>`;
}

export function topBar(opts: {
  left?: string;
  center?: string;
  right?: string;
}): string {
  return `<div class="topbar">
    <div class="row" style="flex:1">${opts.left ?? ''}</div>
    <div>${opts.center ?? ''}</div>
    <div class="row" style="flex:1;justify-content:flex-end">${opts.right ?? ''}</div>
  </div>`;
}

export function headerRow(title: string, subtitle: string | null, back: Route): string {
  return `<div class="row" style="gap:12px;padding-bottom:6px">
    ${backButton(back)}
    <div class="listrow__main">
      <div class="title">${escapeHtml(title)}</div>
      ${subtitle ? `<div class="micro">${escapeHtml(subtitle)}</div>` : ''}
    </div>
  </div>`;
}

export function emptyState(icon: string, title: string, body: string): string {
  return `<div class="card center stack" style="align-items:center;gap:8px">
    <div style="font-size:34px">${icon}</div>
    <div class="title">${escapeHtml(title)}</div>
    <p class="subtitle">${escapeHtml(body)}</p>
  </div>`;
}
