import type { GameState, StatKey } from '../engine/types';
import { STAT_META, clampPct } from './components';

/**
 * Compact chrome used on the home screen and in headers — the "at a glance"
 * version of a life, so returning players instantly remember where they were.
 */

const PIP_ORDER: StatKey[] = ['career', 'happiness', 'stress', 'relationships'];

export function statPips(s: GameState): string {
  return `<div class="hud" style="grid-template-columns:repeat(4,1fr)">
    ${PIP_ORDER.map((k) => `<div class="tile" style="padding:8px;gap:6px">
      <span class="hud__label">${STAT_META[k].short}</span>
      <b style="font-size:17px;font-variant-numeric:tabular-nums">${clampPct(s.player.stats[k])}</b>
      <span class="hud__meter"><i style="width:${clampPct(s.player.stats[k])}%;background:${STAT_META[k].colour}"></i></span>
    </div>`).join('')}
  </div>`;
}

export function hpBar(s: GameState): string {
  const h = clampPct(s.player.stats.health);
  return `<div class="statline meter--health">
    <div class="statline__top"><span class="statline__label">Health</span>
    <span class="statline__value">${h}</span></div>
    <div class="meter"><i class="meter__fill" style="width:${h}%"></i></div>
  </div>`;
}

/** A one-line "where you are" summary for headers and share cards. */
export function lifeLine(s: GameState): string {
  const bits = [`Age ${s.player.ageYears}`, s.career.title];
  if (s.romance.partnerId) bits.push(s.romance.status);
  if (s.romance.children > 0) bits.push(s.romance.children === 1 ? '1 child' : `${s.romance.children} children`);
  return bits.join(' · ');
}
