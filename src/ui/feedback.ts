/**
 * Feedback: haptics, synthesised audio, toasts, floating numbers, confetti.
 *
 * Sound is generated with the Web Audio API rather than shipped as files, so
 * the game stays tiny, loads instantly and works completely offline. Every
 * call is safe to make when audio or haptics are disabled.
 */

import type { Settings } from '../engine/types';

let settings: Settings | null = null;
let ctx: AudioContext | null = null;

export function bindSettings(s: Settings): void {
  settings = s;
}

/* ----------------------------------------------------------------- haptics */

/** Capacitor haptics are loaded lazily so the web build never blocks on them. */
async function nativeHaptics(): Promise<{ impact: (o: { style: string }) => Promise<void>; notification: (o: { type: string }) => Promise<void> } | null> {
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  if (!cap?.isNativePlatform?.()) return null;
  try {
    const mod = await import('@capacitor/haptics');
    return {
      impact: (o) => mod.Haptics.impact({ style: o.style as never }),
      notification: (o) => mod.Haptics.notification({ type: o.type as never }),
    };
  } catch {
    return null;
  }
}

export type HapticKind = 'tap' | 'success' | 'warning' | 'error' | 'heavy';

export function haptic(kind: HapticKind = 'tap'): void {
  if (!hasDom() || !settings?.haptics) return;
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    const pattern: Record<HapticKind, number | number[]> = {
      tap: 8,
      success: [12, 40, 18],
      warning: [18, 60, 18],
      error: 70,
      heavy: 26,
    };
    try {
      navigator.vibrate(pattern[kind]);
    } catch {
      /* ignore — vibration is a nice-to-have */
    }
  }
  void nativeHaptics().then((h) => {
    if (!h) return;
    const styleFor: Record<HapticKind, string> = {
      tap: 'LIGHT',
      success: 'MEDIUM',
      warning: 'MEDIUM',
      error: 'HEAVY',
      heavy: 'HEAVY',
    };
    void h.impact({ style: styleFor[kind] });
  });
}

/* ------------------------------------------------------------------ audio */

const hasDom = (): boolean => typeof document !== 'undefined' && typeof window !== 'undefined';

function audio(): AudioContext | null {
  if (!hasDom()) return null;
  if (!settings?.sfx && !settings?.music) return null;
  if (ctx) return ctx;
  type WithLegacy = typeof window & { webkitAudioContext?: typeof AudioContext };
  const Ctor = window.AudioContext ?? (window as WithLegacy).webkitAudioContext;
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
  } catch {
    return null;
  }
  return ctx;
}

interface Tone {
  f: number;
  t: number;
  d?: number;
  type?: OscillatorType;
  gain?: number;
}

function play(tones: Tone[], gainScale = 1): void {
  if (!settings?.sfx) return;
  const c = audio();
  if (!c) return;
  if (c.state === 'suspended') void c.resume();
  const now = c.currentTime;
  for (const tone of tones) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = tone.type ?? 'triangle';
    osc.frequency.setValueAtTime(tone.f, now + tone.t);
    const peak = (tone.gain ?? 0.09) * gainScale;
    gain.gain.setValueAtTime(0.0001, now + tone.t);
    gain.gain.exponentialRampToValueAtTime(peak, now + tone.t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + tone.t + (tone.d ?? 0.16));
    osc.connect(gain).connect(c.destination);
    osc.start(now + tone.t);
    osc.stop(now + tone.t + (tone.d ?? 0.16) + 0.02);
  }
}

export type Sfx = 'tap' | 'success' | 'failure' | 'money' | 'notify' | 'achievement' | 'levelup' | 'heartbreak';

export function sfx(kind: Sfx): void {
  switch (kind) {
    case 'tap':
      play([{ f: 420, t: 0, d: 0.05, type: 'sine', gain: 0.035 }]);
      break;
    case 'success':
      play([
        { f: 523.25, t: 0, d: 0.14 },
        { f: 659.25, t: 0.09, d: 0.14 },
        { f: 783.99, t: 0.18, d: 0.24 },
      ]);
      break;
    case 'levelup':
      play([
        { f: 440, t: 0, d: 0.12 },
        { f: 554.37, t: 0.08, d: 0.12 },
        { f: 659.25, t: 0.16, d: 0.12 },
        { f: 880, t: 0.24, d: 0.3 },
      ]);
      break;
    case 'failure':
      play([
        { f: 232, t: 0, d: 0.2, type: 'sawtooth', gain: 0.06 },
        { f: 174, t: 0.14, d: 0.3, type: 'sawtooth', gain: 0.06 },
      ]);
      break;
    case 'money':
      play([
        { f: 1318.5, t: 0, d: 0.09, type: 'square', gain: 0.045 },
        { f: 1760, t: 0.06, d: 0.16, type: 'square', gain: 0.045 },
      ]);
      break;
    case 'notify':
      play([
        { f: 880, t: 0, d: 0.1, type: 'sine' },
        { f: 1174.66, t: 0.1, d: 0.16, type: 'sine' },
      ]);
      break;
    case 'achievement':
      play([
        { f: 659.25, t: 0, d: 0.12 },
        { f: 880, t: 0.1, d: 0.12 },
        { f: 1046.5, t: 0.2, d: 0.14 },
        { f: 1318.5, t: 0.3, d: 0.32 },
      ]);
      break;
    case 'heartbreak':
      play([
        { f: 392, t: 0, d: 0.26, type: 'sine', gain: 0.07 },
        { f: 311.13, t: 0.18, d: 0.34, type: 'sine', gain: 0.07 },
      ]);
      break;
  }
}

/* ------------------------------------------------- background music (soft) */

let musicTimer: number | null = null;

export function startMusic(): void {
  if (!hasDom() || !settings?.music || musicTimer !== null) return;
  const c = audio();
  if (!c) return;
  // A slow, unobtrusive four-bar loop. Deliberately quiet.
  const chords = [
    [220, 277.18, 329.63],
    [196, 246.94, 293.66],
    [174.61, 220, 261.63],
    [196, 246.94, 329.63],
  ];
  let bar = 0;
  const tick = (): void => {
    if (!settings?.music) return;
    const c2 = audio();
    if (c2) {
      for (const f of chords[bar % chords.length]) {
        play([{ f, t: 0, d: 1.9, type: 'sine', gain: 0.012 }]);
      }
    }
    bar += 1;
  };
  tick();
  musicTimer = window.setInterval(tick, 2000);
}

export function stopMusic(): void {
  if (musicTimer !== null) {
    window.clearInterval(musicTimer);
    musicTimer = null;
  }
}

export function syncMusic(): void {
  if (!hasDom()) return;
  if (settings?.music) startMusic();
  else stopMusic();
}

/* ----------------------------------------------------------------- toasts */

export interface ToastOptions {
  icon?: string;
  title: string;
  body?: string;
  tone?: 'good' | 'bad' | 'chaos' | 'neutral';
  duration?: number;
}

export function toast(opts: ToastOptions): void {
  if (!hasDom()) return;
  let host = document.querySelector<HTMLDivElement>('.toasts');
  if (!host) {
    host = document.createElement('div');
    host.className = 'toasts';
    document.body.appendChild(host);
  }
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  if (opts.tone === 'good') el.style.borderColor = 'rgba(70,211,154,0.5)';
  if (opts.tone === 'bad') el.style.borderColor = 'rgba(255,95,109,0.5)';
  if (opts.tone === 'chaos') el.style.borderColor = 'rgba(168,108,255,0.55)';
  el.innerHTML = `
    <div class="toast__icon">${opts.icon ?? '⭐'}</div>
    <div class="listrow__main">
      <div class="listrow__title">${escapeHtml(opts.title)}</div>
      ${opts.body ? `<div class="listrow__sub">${escapeHtml(opts.body)}</div>` : ''}
    </div>`;
  host.appendChild(el);
  const life = opts.duration ?? 2800;
  window.setTimeout(() => {
    el.classList.add('toast--out');
    window.setTimeout(() => el.remove(), 260);
  }, life);
}

/* --------------------------------------------------- floating stat numbers */

export function floatAt(el: Element | null, text: string, colour: string): void {
  if (!hasDom() || !el) return;
  const rect = el.getBoundingClientRect();
  const node = document.createElement('div');
  node.className = 'float';
  node.textContent = text;
  node.style.color = colour;
  node.style.left = `${rect.left + rect.width / 2 - 14}px`;
  node.style.top = `${rect.top - 4}px`;
  document.body.appendChild(node);
  window.setTimeout(() => node.remove(), 1150);
}

/* --------------------------------------------------------------- confetti */

export function confetti(count = 26): void {
  if (!hasDom() || settings?.reduceMotion) return;
  const colors = ['#ff5c8a', '#f5b83d', '#3ec9a7', '#6c8bff', '#a86cff'];
  for (let i = 0; i < count; i++) {
    const bit = document.createElement('i');
    bit.className = 'confetti-bit';
    bit.style.left = `${Math.random() * 100}vw`;
    bit.style.top = '-14px';
    bit.style.background = colors[i % colors.length];
    bit.style.animationDelay = `${Math.random() * 320}ms`;
    bit.style.animationDuration = `${1500 + Math.random() * 900}ms`;
    document.body.appendChild(bit);
    window.setTimeout(() => bit.remove(), 2600);
  }
}

/* ---------------------------------------------------------------- helpers */

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** A tiny delay helper for choreographed reveal sequences. */
export const wait = (ms: number): Promise<void> => new Promise((r) => window.setTimeout(r, ms));
