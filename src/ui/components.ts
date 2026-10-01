import type { GameState, StatKey } from '../engine/types';
import type { DeltaReport } from '../engine/conditions';
import { fmtMoney, fmtMoneyShort } from '../engine/text';
import { homeDef, stageDef, traitDef } from '../engine/catalog';
import { NPC_DEFS } from '../content/npcs';
import { escapeHtml } from './feedback';
import { portrait, expressionForHappiness } from './avatars';

/**
 * Shared presentational fragments. Every function here is a pure string
 * builder, so a screen can be re-rendered from scratch at any moment without
 * leaving stale listeners or half-updated DOM behind.
 */

export const STAT_META: Record<
  StatKey,
  { label: string; short: string; cls: string; colour: string; higherIsBetter: boolean }
> = {
  career: { label: 'Career', short: 'CAREER', cls: 'career', colour: 'var(--c-career)', higherIsBetter: true },
  happiness: { label: 'Happiness', short: 'HAPPY', cls: 'happiness', colour: 'var(--c-happiness)', higherIsBetter: true },
  stress: { label: 'Stress', short: 'STRESS', cls: 'stress', colour: 'var(--c-stress)', higherIsBetter: false },
  relationships: {
    label: 'Relationships',
    short: 'PEOPLE',
    cls: 'relationships',
    colour: 'var(--c-relationships)',
    higherIsBetter: true,
  },
  reputation: { label: 'Reputation', short: 'REP', cls: 'reputation', colour: 'var(--c-reputation)', higherIsBetter: true },
  health: { label: 'Health', short: 'HEALTH', cls: 'health', colour: 'var(--c-health)', higherIsBetter: true },
  energy: { label: 'Energy', short: 'ENERGY', cls: 'energy', colour: 'var(--c-energy)', higherIsBetter: true },
  karma: { label: 'Karma', short: 'KARMA', cls: 'reputation', colour: 'var(--c-reputation)', higherIsBetter: true },
};

export const clampPct = (v: number): number => Math.max(0, Math.min(100, Math.round(v)));

export function statLine(key: StatKey, value: number, showValue = true): string {
  const m = STAT_META[key];
  const pct = clampPct(value);
  return `<div class="statline meter--${m.cls}" data-stat="${key}">
    <div class="statline__top">
      <span class="statline__label">${m.label}</span>
      ${showValue ? `<span class="statline__value">${pct}</span>` : ''}
    </div>
    <div class="meter"><i class="meter__fill" style="width:${pct}%"></i></div>
  </div>`;
}

/** The always-visible header: age, stage, money and four quick stats. */
export function hud(s: GameState): string {
  const quick: StatKey[] = ['career', 'happiness', 'stress', 'relationships'];
  return `
  <div class="topbar">
    <div class="topbar__age">
      <span class="eyebrow">Age</span>
      <b>${s.player.ageYears}</b>
    </div>
    <div class="pill">${escapeHtml(stageDef(s.player.stage).name)}</div>
    <div class="spacer"></div>
    <div class="topbar__cash">
      <span class="eyebrow">Cash</span>
      <b data-hud="cash" style="color:${s.finances.cash < 0 ? 'var(--danger)' : s.finances.cash < 1000 ? 'var(--amber)' : 'var(--good)'}">${fmtMoneyShort(s.finances.cash)}</b>
    </div>
  </div>
  <div class="hud">
    ${quick
      .map((k) => {
        const pct = clampPct(s.player.stats[k]);
        return `<div class="hud__item" data-hud="${k}">
          <div class="hud__label">${STAT_META[k].short}</div>
          <div class="hud__value">${pct}</div>
          <div class="hud__meter"><i style="width:${pct}%;background:${STAT_META[k].colour}"></i></div>
        </div>`;
      })
      .join('')}
  </div>`;
}

/** Bottom navigation between the always-available detail screens. */
export function quickNav(active: string): string {
  const items: Array<{ id: string; icon: string; label: string; route: string }> = [
    { id: 'game', icon: '🎲', label: 'Life', route: 'game' },
    { id: 'stats', icon: '📊', label: 'Stats', route: 'stats' },
    { id: 'relationships', icon: '💬', label: 'People', route: 'relationships' },
    { id: 'career', icon: '💼', label: 'Career', route: 'career' },
    { id: 'money', icon: '💰', label: 'Money', route: 'money' },
  ];
  return `<div class="row" style="gap:6px;padding-top:12px">
    ${items
      .map(
        (i) => `<button class="btn btn--sm ${active === i.id ? 'btn--primary' : 'btn--ghost'}"
          data-act="goto" data-arg="${i.route}"
          style="flex-direction:column;gap:3px;min-height:54px;font-size:9.5px;font-weight:800;letter-spacing:0.07em">
          <span style="font-size:17px">${i.icon}</span>${i.label.toUpperCase()}
        </button>`,
      )
      .join('')}
  </div>`;
}

export function npcName(id: string): string {
  return NPC_DEFS.find((n) => n.id === id)?.name ?? 'Someone';
}

export function playerChip(s: GameState): string {
  const t = traitDef(s.player.identity.trait);
  return `<div class="row" style="gap:12px">
    <div class="portrait portrait--sm">${portrait(s.player.identity.look, {
      expression: expressionForHappiness(s.player.stats.happiness, s.player.stats.stress),
    })}</div>
    <div class="listrow__main">
      <div class="listrow__title">${escapeHtml(s.player.identity.name)}</div>
      <div class="listrow__sub">${escapeHtml(t.name)} · ${escapeHtml(s.career.title)}</div>
    </div>
  </div>`;
}

/* ------------------------------------------------- consequence rendering -- */

export interface DeltaChip {
  label: string;
  value: string;
  cls: string;
}

/** Turns an engine DeltaReport into the animated chips the player sees. */
export function deltaChips(report: DeltaReport): DeltaChip[] {
  const chips: DeltaChip[] = [];
  const sign = (n: number): string => (n > 0 ? '+' : '−');

  for (const [key, val] of Object.entries(report.stats)) {
    const k = key as StatKey;
    const meta = STAT_META[k];
    if (!val || !meta) continue;
    const good = meta.higherIsBetter ? val > 0 : val < 0;
    chips.push({
      label: meta.label,
      value: `${sign(val)}${Math.abs(Math.round(val * 10) / 10)}`,
      cls: good ? 'delta--up' : 'delta--down',
    });
  }

  if (report.money) {
    chips.push({
      label: report.money > 0 ? 'Cash in' : 'Cash out',
      value: `${report.money > 0 ? '+' : '−'}${fmtMoney(Math.abs(report.money))}`,
      cls: `delta--${report.money > 0 ? 'money-up' : 'money-down'}`,
    });
  }
  if (report.savings) {
    chips.push({
      label: 'Savings',
      value: `${sign(report.savings)}${fmtMoney(Math.abs(report.savings))}`,
      cls: `delta--${report.savings > 0 ? 'money-up' : 'money-down'}`,
    });
  }
  if (report.debt) {
    chips.push({
      label: 'Debt',
      value: `${sign(report.debt)}${fmtMoney(Math.abs(report.debt))}`,
      cls: `delta--${report.debt > 0 ? 'down' : 'up'}`,
    });
  }
  if (report.income) {
    chips.push({
      label: 'Monthly income',
      value: `${sign(report.income)}${fmtMoney(Math.abs(report.income))}`,
      cls: `delta--${report.income > 0 ? 'money-up' : 'money-down'}`,
    });
  }
  if (report.expense) {
    chips.push({
      label: 'Monthly costs',
      value: `${sign(report.expense)}${fmtMoney(Math.abs(report.expense))}`,
      cls: `delta--${report.expense > 0 ? 'down' : 'up'}`,
    });
  }
  if (report.salary) {
    chips.push({
      label: 'Salary',
      value: `${sign(report.salary)}${fmtMoney(Math.abs(report.salary))}`,
      cls: `delta--${report.salary > 0 ? 'money-up' : 'money-down'}`,
    });
  }

  for (const [npc, val] of Object.entries(report.npc)) {
    if (!val) continue;
    chips.push({
      label: npcName(npc),
      value: `${sign(val)}${Math.abs(Math.round(val))}`,
      cls: `delta--${val > 0 ? 'npc-up' : 'npc-down'}`,
    });
  }

  if (report.child) {
    chips.push({ label: 'Family', value: `${sign(report.child)}1`, cls: report.child > 0 ? 'delta--up' : 'delta--down' });
  }
  return chips;
}

export function chipRow(chips: DeltaChip[]): string {
  if (!chips.length) return '';
  return `<div class="deltas">
    ${chips
      .map(
        (c, i) =>
          `<span class="delta ${c.cls}" style="animation-delay:${i * 60}ms">
            <span style="opacity:0.7;font-weight:700">${escapeHtml(c.label)}</span>
            <b>${escapeHtml(c.value)}</b>
          </span>`,
      )
      .join('')}
  </div>`;
}

export const TONE_LABEL: Record<string, string> = {
  good: 'THAT WORKED',
  bad: 'CONSEQUENCE',
  chaos: 'THAT ESCALATED QUICKLY',
  mixed: 'MIXED RESULTS',
  neutral: 'AND SO',
};

export const TONE_EMOJI: Record<string, string> = {
  good: '🎉',
  bad: '💀',
  chaos: '🌀',
  mixed: '🤔',
  neutral: '📌',
};

export function kv(label: string, value: string, tone = ''): string {
  return `<div class="kv"><dt>${escapeHtml(label)}</dt><dd style="${tone ? `color:${tone}` : ''}">${value}</dd></div>`;
}

export function financeSummary(s: GameState): string {
  const monthly = s.finances.salary + s.finances.sideIncome;
  const outgoings = s.finances.housingCost + s.finances.livingCost;
  const flow = monthly - outgoings;
  return `<div class="card">
    <div class="row row--between" style="margin-bottom:10px">
      <div>
        <div class="eyebrow">Cash</div>
        <div class="title-xl money">${fmtMoney(s.finances.cash)}</div>
      </div>
      <div style="text-align:right">
        <div class="eyebrow">Monthly</div>
        <div class="title money" style="color:${flow >= 0 ? 'var(--good)' : 'var(--danger)'}">
          ${flow >= 0 ? '+' : '−'}${fmtMoney(Math.abs(flow))}
        </div>
      </div>
    </div>
    <dl style="margin:0">
      ${kv('Monthly income', fmtMoney(monthly))}
      ${kv('Housing', `−${fmtMoney(s.finances.housingCost)}`)}
      ${kv('Living costs', `−${fmtMoney(s.finances.livingCost)}`)}
      ${s.finances.debt > 0 ? kv('Debt', fmtMoney(s.finances.debt), 'var(--danger)') : ''}
      ${s.finances.mortgage > 0 ? kv('Mortgage', fmtMoney(s.finances.mortgage)) : ''}
      ${s.finances.savings > 0 ? kv('Savings', fmtMoney(s.finances.savings)) : ''}
      ${kv('Home', homeDef(s.player.homeTier).name)}
    </dl>
  </div>`;
}
