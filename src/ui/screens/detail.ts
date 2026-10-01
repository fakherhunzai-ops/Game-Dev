import type { GameState, StatKey } from '../../engine/types';
import type { App, ScreenModule } from '../shell';
import { bizDef, careerDef, homeDef, stageDef, CAREER_PATHS, MAX_AGE } from '../../engine/catalog';
import { netWorth } from '../../engine/conditions';
import { fmtMoney, fmtMoneyShort } from '../../engine/text';
import { NPC_DEFS } from '../../content/npcs';
import { escapeHtml } from '../feedback';
import { finishLife } from '../../lifecycle';
import { portrait } from '../avatars';
import { kv, quickNav, statLine, STAT_META, clampPct } from '../components';
import { navigate } from '../shell';
import { renderScene } from '../art';
import { lifeLine } from '../chrome';

export const CAREER_PATH_COUNT = CAREER_PATHS.length;

void MAX_AGE;

const PRIMARY: StatKey[] = ['career', 'happiness', 'stress', 'relationships', 'reputation'];
const SECONDARY: StatKey[] = ['health', 'energy', 'karma'];

function requireGame(app: App): GameState | null {
  return app.game;
}

function header(s: GameState, title: string, back: () => void): string {
  void back;
  return `<div class="row" style="gap:12px;padding:4px 0 12px">
    <button class="btn btn--icon btn--ghost" data-act="goto" data-arg="game" aria-label="Back">←</button>
    <div class="listrow__main"><div class="title">${escapeHtml(title)}</div>
    <div class="micro">${escapeHtml(lifeLine(s))}</div></div>
  </div>`;
}

/* ============================================================== STATS ===== */

export const statsScreen: ScreenModule = {
  html(app: App) {
    const s = requireGame(app);
    if (!s) return needsLife();
    return `<div class="screen">
      ${header(s, 'HOW YOU ARE DOING', () => navigate('game'))}
      <div class="scroll stack stack--lg">
        <div class="card stack stack--lg">
          <span class="eyebrow">Primary</span>
          ${PRIMARY.map((k) => statLine(k, s.player.stats[k])).join('')}
        </div>
        <div class="card stack stack--lg">
          <span class="eyebrow">Secondary</span>
          ${SECONDARY.map((k) => statLine(k, s.player.stats[k])).join('')}
        </div>
        <div class="card">
          <span class="eyebrow" style="display:block;margin-bottom:8px">The bigger picture</span>
          <dl style="margin:0">
            ${kv('Life stage', stageDef(s.player.stage).name)}
            ${kv('Income', `${fmtMoney(s.finances.salary + s.finances.sideIncome)} / month`)}
            ${kv('Outgoings', `${fmtMoney(s.finances.housingCost + s.finances.livingCost)} / month`)}
            ${kv('Net worth', fmtMoney(netWorth(s)))}
            ${kv('Peak net worth', fmtMoney(s.finances.peakNetWorth))}
            ${kv('Peak stress', String(Math.round(s.player.peakStress)))}
            ${kv('Decisions made', String(s.runStats.decisionsMade))}
          </dl>
        </div>
        <div class="card card--flat">
          <p class="micro">Stat effects are not linear. A stress of 85 poisons health, work and every relationship you have — the bars are connected even when it does not look like it.</p>
        </div>
      </div>
      ${quickNav('stats')}
    </div>`;
  },
};

/* ======================================================== RELATIONSHIPS === */

const REL_LABEL = (n: number): string =>
  n >= 85 ? 'Family, essentially' : n >= 70 ? 'Genuinely close' : n >= 50 ? 'Warm' : n >= 30 ? 'Complicated' : n >= 15 ? 'Strained' : 'Not speaking';

const ROLE_ORDER = ['best_friend', 'friend', 'romantic_partner', 'spouse', 'coworker', 'manager', 'parent', 'sibling'];

export const relationshipsScreen: ScreenModule = {
  html(app: App) {
    const s = requireGame(app);
    if (!s) return needsLife();

    const met = Object.values(s.npcs).filter((n) => n.met);
    const sorted = NPC_DEFS.filter((d) => met.some((m) => m.id === d.id)).sort((a, b) => {
      const ai = ROLE_ORDER.indexOf(a.role.toLowerCase().replace(/\s+/g, '_'));
      const bi = ROLE_ORDER.indexOf(b.role.toLowerCase().replace(/\s+/g, '_'));
      return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
    });

    const partner = s.romance.partnerId ? NPC_DEFS.find((d) => d.id === s.romance.partnerId) : undefined;

    return `<div class="screen">
      ${header(s, 'THE PEOPLE WHO KNOW YOU', () => navigate('game'))}
      <div class="scroll stack stack--lg">
        ${
          partner
            ? `<div class="card card--glow stack" style="gap:12px">
                <div class="row row--between">
                  <span class="eyebrow">${escapeHtml(s.romance.status)}</span>
                  <span class="pill">${s.romance.monthsTogether} months</span>
                </div>
                <div class="row" style="gap:12px">
                  <div class="avatar">${portrait(partner.id, { expression: 'happy' })}</div>
                  <div class="listrow__main">
                    <div class="title-xl">${escapeHtml(partner.name)}</div>
                    <div class="micro">${escapeHtml(partner.bio)}</div>
                  </div>
                </div>
                ${statLine('relationships', s.npcs[partner.id]?.score ?? 0)}
              </div>`
            : `<div class="card card--flat"><p class="micro">Single. Which is either a problem or an opportunity depending entirely on which card shows up next.</p></div>`
        }

        ${sorted
          .filter((d) => d.id !== s.romance.partnerId)
          .map((d) => {
            const n = s.npcs[d.id];
            const memories = n.memory.slice(-2);
            const sub = memories.length
              ? `Remembers: ${escapeHtml(memories[memories.length - 1].note)}`
              : escapeHtml(d.bio);
            return `<div class="card card--tight stack" style="gap:10px">
              <div class="row" style="gap:12px">
                <div class="portrait portrait--sm">${portrait(d.id, {
                  expression: n.score >= 70 ? 'happy' : n.score >= 35 ? 'neutral' : 'worried',
                })}</div>
                <div class="listrow__main">
                  <div class="listrow__title">${escapeHtml(d.name)}
                    <span class="badge badge--${n.score >= 70 ? 'good' : 'bad'}">${Math.round(n.score)}</span>
                  </div>
                  <div class="listrow__sub">${escapeHtml(d.role)} · ${REL_LABEL(n.score)}</div>
                </div>
              </div>
              <p class="micro">${sub}</p>
              ${statLine('relationships', n.score, false)}
            </div>`;
          })
          .join('')}

        ${
          met.length <= 1
            ? `<div class="card card--flat"><p class="micro">You have not met many people yet. Keep living.</p></div>`
            : ''
        }
      </div>
      ${quickNav('relationships')}
    </div>`;
  },
};

/* ============================================================= CAREER ===== */

export const careerScreen: ScreenModule = {
  html(app: App) {
    const s = requireGame(app);
    if (!s) return needsLife();
    const def = careerDef(s.career.path);

    return `<div class="screen">
      ${header(s, 'THE JOB', () => navigate('game'))}
      <div class="scroll stack stack--lg">
        <div class="card stack" style="gap:12px">
          <div class="row row--between">
            <span class="eyebrow">${escapeHtml(def.name)}</span>
            <span class="pill">Level ${s.career.level}/${def.ladder.length - 1}</span>
          </div>
          <div class="title-xl">${escapeHtml(s.career.title)}</div>
          <div class="micro">${escapeHtml(s.career.employer)}</div>
          <div class="row" style="gap:8px;flex-wrap:wrap">
            <span class="badge">${fmtMoney(s.finances.salary)}/mo</span>
            <span class="badge">${s.career.monthsInRole} months in role</span>
            <span class="badge ${s.career.jobsLost > 0 ? 'badge--bad' : ''}">${s.career.jobsLost} jobs lost</span>
          </div>
          ${statLine('career', s.player.stats.career)}
          <div class="statline meter--reputation">
            <div class="statline__top"><span class="statline__label">Job performance</span>
            <span class="statline__value">${Math.round(clampPct(s.career.performance * 100))}</span></div>
            <div class="meter"><i class="meter__fill" style="width:${clampPct(s.career.performance * 100)}%"></i></div>
          </div>
        </div>

        <div class="card stack" style="gap:10px">
          <span class="eyebrow">The ladder</span>
          ${def.ladder
            .map(
              (rung, i) => `<div class="row" style="gap:10px;opacity:${i <= s.career.level ? 1 : 0.42}">
                <span class="badge ${i <= s.career.level ? 'badge--brand' : ''}">${i + 1}</span>
                <span class="listrow__main">
                  <span class="listrow__title" style="font-size:14px">${escapeHtml(rung)}</span>
                  <span class="listrow__sub">${fmtMoney((def.salaries[i] ?? 0) * 12)}/year</span>
                </span>
                ${i === s.career.level ? '<span class="chip chip--good">you</span>' : ''}
              </div>`,
            )
            .join('')}
        </div>

        ${
          s.businesses.length
            ? `<div class="card stack" style="gap:12px">
                <span class="eyebrow">Things you own</span>
                ${s.businesses
                  .map(
                    (b) => `<div class="row" style="gap:10px">
                      <span style="font-size:22px">${bizDef(b.type).emoji}</span>
                      <span class="listrow__main">
                        <span class="listrow__title">${escapeHtml(b.name)} ${b.active ? '' : '<span class="badge badge--bad">closed</span>'}</span>
                        <span class="listrow__sub">${b.employees} staff · ${fmtMoneyShort(b.revenue)}/mo revenue · worth ${fmtMoneyShort(b.valuation)}</span>
                      </span>
                      <span class="badge ${b.health > 50 ? 'badge--good' : 'badge--bad'}">${Math.round(b.health)}</span>
                    </div>`,
                  )
                  .join('')}
              </div>`
            : ''
        }

        <div class="card card--flat">
          <p class="micro">Promotions are not automatic. They come from performance, from being visible, and from the specific decisions you made when nobody was watching.</p>
        </div>
      </div>
      ${quickNav('career')}
    </div>`;
  },
};

/* ============================================================== MONEY ===== */

export const moneyScreen: ScreenModule = {
  html(app: App) {
    const s = requireGame(app);
    if (!s) return needsLife();
    const holdings = s.holdings.filter((h) => !h.sold);
    const invested = holdings.reduce((a, h) => a + h.value, 0);
    const home = homeDef(s.player.homeTier);

    return `<div class="screen">
      ${header(s, 'MONEY, BRIEFLY', () => navigate('game'))}
      <div class="scroll stack stack--lg">
        <div class="card">
          <div class="row row--between" style="margin-bottom:10px">
            <div>
              <div class="eyebrow">Net worth</div>
              <div class="title-xl money">${fmtMoney(netWorth(s))}</div>
            </div>
            <div style="text-align:right">
              <div class="eyebrow">Peak</div>
              <div class="title money">${fmtMoneyShort(s.finances.peakNetWorth)}</div>
            </div>
          </div>
          <dl style="margin:0">
            ${kv('Cash', fmtMoney(s.finances.cash))}
            ${s.finances.savings > 0 ? kv('Savings', fmtMoney(s.finances.savings)) : ''}
            ${s.finances.debt > 0 ? kv('Debt', fmtMoney(s.finances.debt), '#ff9aa2') : ''}
            ${s.finances.mortgage > 0 ? kv('Mortgage', fmtMoney(s.finances.mortgage)) : ''}
            ${invested > 0 ? kv('Investments', fmtMoney(invested)) : ''}
            ${kv('Home', `${home.name}${home.owned ? '' : ' (rented)'}`)}
          </dl>
        </div>

        <div class="card stack" style="gap:10px">
          <span class="eyebrow">Monthly</span>
          ${kv('Salary', fmtMoney(s.finances.salary))}
          ${s.finances.sideIncome ? kv('Side income', fmtMoney(s.finances.sideIncome)) : ''}
          ${kv('Housing', `−${fmtMoney(s.finances.housingCost)}`)}
          ${kv('Everything else', `−${fmtMoney(s.finances.livingCost)}`)}
          ${kv(
            'Left over',
            `${s.finances.salary + s.finances.sideIncome - s.finances.housingCost - s.finances.livingCost >= 0 ? '+' : '−'}${fmtMoney(
              Math.abs(s.finances.salary + s.finances.sideIncome - s.finances.housingCost - s.finances.livingCost),
            )}`,
          )}
        </div>

        ${
          holdings.length
            ? `<div class="card stack" style="gap:10px">
                <span class="eyebrow">Investments</span>
                ${holdings
                  .map((h) => {
                    const gain = h.value - h.cost;
                    return `<div class="row row--between">
                      <span>${escapeHtml(h.label)}</span>
                      <span class="money" style="color:${gain >= 0 ? 'var(--good)' : 'var(--danger)'}">
                        ${fmtMoneyShort(h.value)} <span class="micro">(${gain >= 0 ? '+' : '−'}${fmtMoneyShort(Math.abs(gain))})</span>
                      </span>
                    </div>`;
                  })
                  .join('')}
              </div>`
            : ''
        }

        ${
          s.businesses.length
            ? `<div class="card stack" style="gap:10px">
                <span class="eyebrow">Businesses</span>
                ${s.businesses
                  .map(
                    (b) => `<div class="stack" style="gap:6px">
                      <div class="row row--between">
                        <b>${escapeHtml(b.name)}</b>
                        <span class="badge ${b.active ? 'badge--good' : 'badge--bad'}">${b.active ? 'open' : 'closed'}</span>
                      </div>
                      <dl style="margin:0">
                        ${kv('Revenue', `${fmtMoney(b.revenue)}/mo`)}
                        ${kv('Costs', `${fmtMoney(b.expenses)}/mo`)}
                        ${kv('Profit', fmtMoney(b.revenue - b.expenses), b.revenue > b.expenses ? 'var(--good)' : 'var(--danger)')}
                        ${kv('Staff', String(b.employees))}
                        ${kv('Valuation', fmtMoneyShort(b.valuation))}
                        ${kv('Paid you', fmtMoneyShort(b.dividendsPaid))}
                      </dl>
                    </div>`,
                  )
                  .join('')}
              </div>`
            : ''
        }

        ${
          s.finances.debt > 8000
            ? `<div class="card" style="border-color:rgba(255,95,109,0.45)">
                <div class="row" style="gap:10px">
                  <span style="font-size:20px">🔻</span>
                  <p class="micro" style="flex:1">Debt accrues interest every month. There are ways out — a consolidation, a sale, or the genuinely nuclear option — but the number does not shrink on its own.</p>
                </div>
              </div>`
            : ''
        }
      </div>
      ${quickNav('money')}
    </div>`;
  },
};

/* =========================================================== TIMELINE ===== */

export const timelineScreen: ScreenModule = {
  html(app: App) {
    const s = requireGame(app);
    if (!s) return needsLife();
    const entries = [...s.feed].reverse().slice(0, 80);

    return `<div class="screen">
      ${header(s, 'THE STORY SO FAR', () => navigate('game'))}
      <div class="scroll stack">
        ${
          entries.length
            ? `<div class="timeline">
                ${entries
                  .map(
                    (e) => `<div class="tl-item tl-item--${e.tone}">
                      <div class="tl-item__age">Age ${e.age} · ${escapeHtml(kindLabel(e.kind))}</div>
                      <div class="tl-item__title">${escapeHtml(e.title)}</div>
                      ${e.body ? `<div class="tl-item__body">${escapeHtml(e.body)}</div>` : ''}
                    </div>`,
                  )
                  .join('')}
              </div>`
            : `<div class="card card--flat"><p class="micro">Nothing has happened yet. Give it a month.</p></div>`
        }
      </div>
      ${quickNav('game')}
    </div>`;
  },
};

function kindLabel(kind: string): string {
  const map: Record<string, string> = {
    decision: 'decision',
    consequence: 'consequence',
    delayed: 'consequence',
    milestone: 'milestone',
    money: 'money',
    system: 'life',
  };
  return map[kind] ?? kind;
}

/* ============================================================ SHARED ====== */

export function needsLife(): string {
  return `<div class="screen center stack" style="justify-content:center;gap:14px">
    <div style="font-size:36px">🫥</div>
    <div class="title-xl">No life in progress</div>
    <p class="subtitle">Start one and this screen fills up with consequences.</p>
    <button class="btn btn--primary" data-act="goto" data-arg="new_life">START A NEW LIFE</button>
    <button class="btn btn--ghost" data-act="goto" data-arg="home">Back to the menu</button>
  </div>`;
}

export { finishLife, STAT_META, renderScene };
