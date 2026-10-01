import type { App, ScreenModule } from '../shell';
import { buildSummary, endingById, type LifeSummary } from '../../engine/engine';
import { clearGame, exportBundle, defaultMeta, loadMeta, saveGame } from '../../engine/save';
import { fmtMoney, fmtMoneyShort } from '../../engine/text';
import { ACHIEVEMENTS, ENDINGS } from '../../content';
import { NPC_DEFS } from '../../content/npcs';
import { traitDef } from '../../engine/catalog';
import { confetti, escapeHtml, haptic, sfx, toast } from '../feedback';
import { playerPortrait } from '../avatars';
import { renderScene } from '../art';
import { archiveLife, finishLife, type CompletedLife } from '../../lifecycle';
import { leaveDaily } from './home';
import { track } from '../../analytics';
import { shareText as nativeShare } from '../../native';
import { navigate } from '../shell';

/**
 * END-OF-LIFE SUMMARY.
 *
 * The payoff screen. It turns a whole run into a shareable card, then hands
 * the player the only button that matters: live another life.
 */

let cached: CompletedLife | null = null;
let finalisedFor: number | null = null;

function summaryFor(app: App): { summary: LifeSummary; completed: CompletedLife } | null {
  const s = app.game;
  if (!s) return null;
  if (cached && finalisedFor === s.createdAt) return { summary: cached.summary, completed: cached };
  const meta = app.meta ?? loadMeta() ?? defaultMeta();
  const completed = finishLife(s, meta);
  app.meta = meta;
  archiveLife(s, completed.summary);
  cached = completed;
  finalisedFor = s.createdAt;
  return { summary: completed.summary, completed };
}

export const summaryScreen: ScreenModule = {
  html(app: App) {
    const s = app.game;
    if (!s) {
      return `<div class="screen center stack" style="justify-content:center;gap:14px">
        <div style="font-size:36px">📜</div>
        <div class="title-xl">No finished life to show</div>
        <p class="subtitle">Play one to the end and this is where the reckoning lives.</p>
        <button class="btn btn--primary" data-act="goto" data-arg="new_life">START A NEW LIFE</button>
        <button class="btn btn--ghost" data-act="goto" data-arg="home">Back to the menu</button>
      </div>`;
    }

    const data = summaryFor(app);
    if (!data) return '';
    const { summary, completed } = data;

    // A Daily Dilemma run gets a compact result card, not a full life summary.
    if (completed.daily) {
      const ending = summary.ending;
      return `<div class="screen">
        <div class="scroll stack stack--lg">
          <div class="band band--chaos">
            <div class="band__stamp">DAILY DILEMMA</div>
            <h2 class="headline">${escapeHtml(ending?.title ?? 'WELL. THAT HAPPENED.')}</h2>
            <p class="micro" style="margin-top:8px">${escapeHtml(ending?.flavour ?? '')}</p>
          </div>
          <div class="card stack" style="gap:10px">
            <span class="eyebrow">Your guest decided</span>
            <b>${escapeHtml(summary.majorDecisions[0]?.choiceText ?? 'something')}</b>
            <p class="body" style="font-size:15px">${escapeHtml(summary.majorDecisions[0]?.outcomeTitle ?? '')}</p>
          </div>
          <div class="card">
            <span class="eyebrow" style="display:block;margin-bottom:8px">The rest of their life</span>
            <dl style="margin:0">
              ${kvRow('Lived to', String(summary.ageReached))}
              ${kvRow('Net worth', fmtMoney(summary.finalNetWorth))}
              ${kvRow('Career peak', escapeHtml(summary.careerPeak))}
            </dl>
          </div>
          <p class="micro center">A new dilemma unlocks at midnight UTC. Everyone gets the same one.</p>
        </div>
        <div style="height:14px"></div>
        <div class="stack" style="gap:10px">
          <button class="btn btn--primary" data-act="leave_daily">BACK TO MY LIFE</button>
          <button class="btn btn--ghost" data-act="share_daily">📤 Share today's result</button>
        </div>
      </div>`;
    }
    const ending = summary.ending;
    const t = traitDef(summary.identity.trait);
    const major = summary.majorDecisions.slice(0, 6);

    return `<div class="screen">
      <div class="scroll stack stack--lg">
        <div class="sharecard">
          <div class="sharecard__brand">WHAT COULD GO WRONG?</div>
          <div class="row" style="gap:12px;margin-top:10px;align-items:flex-start">
            <div class="avatar avatar--on" style="width:64px;height:64px">${playerPortrait(summary.identity.avatar || summary.identity.look, 'neutral')}</div>
            <div style="flex:1">
              <div class="sharecard__name">${escapeHtml(summary.name)}</div>
              <div class="micro">${t.name} · ${summary.yearsLived} years</div>
            </div>
          </div>
          <div class="sharecard__ending">${escapeHtml(ending?.title ?? 'THE END')}</div>
          <p class="micro" style="margin-top:4px">${escapeHtml(ending?.flavour ?? '')}</p>
          <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:12px">
            <span class="badge">Age ${summary.ageReached}</span>
            <span class="badge">${fmtMoneyShort(summary.finalNetWorth)}</span>
            <span class="badge">${summary.decisionCount} decisions</span>
          </div>
        </div>

        ${
          completed.newEnding
            ? `<div class="card card--glow center stack" style="gap:6px">
                <span class="eyebrow">New ending discovered</span>
                <div class="title-xl">${escapeHtml(ending?.title ?? '')}</div>
                <div class="micro">${summary.ending ? `${(app.meta?.endings.length ?? 1)} of ${ENDINGS.length} endings found` : ''}</div>
              </div>`
            : ''
        }

        ${
          ending
            ? `<div class="card stack" style="gap:10px">
                <span class="eyebrow">How it ended</span>
                <p class="body">${escapeHtml(ending.body)}</p>
              </div>`
            : ''
        }

        <div class="scene">
          ${renderScene({ art: ending?.art ?? 'celebration', tone: 'neutral' })}
          <div class="scene__scrim"></div>
        </div>

        <div class="card">
          <span class="eyebrow" style="display:block;margin-bottom:8px">The numbers</span>
          <dl style="margin:0">
            ${kvRow('Age reached', `${summary.ageReached}`)}
            ${kvRow('Total earned', fmtMoney(summary.totalEarned))}
            ${kvRow('Peak net worth', fmtMoney(summary.peakNetWorth))}
            ${kvRow('Final net worth', fmtMoney(summary.finalNetWorth))}
            ${kvRow('Career peak', escapeHtml(summary.careerPeak))}
            ${kvRow('Businesses created', String(summary.businesses))}
            ${summary.businessesSold ? kvRow('Businesses sold', String(summary.businessesSold)) : ''}
            ${summary.properties ? kvRow('Properties bought', String(summary.properties)) : ''}
            ${kvRow('Peak stress', String(Math.round(summary.peakStress)))}
            ${kvRow('Lowest happiness', String(Math.round(summary.lowestHappiness)))}
            ${summary.marriedTo ? kvRow('Married to', escapeHtml(summary.marriedTo)) : ''}
            ${summary.children ? kvRow('Children', String(summary.children)) : ''}
          </dl>
        </div>

        ${
          summary.relationships.length
            ? `<div class="card stack" style="gap:10px">
                <span class="eyebrow">Who you left behind</span>
                ${summary.relationships
                  .slice(0, 8)
                  .map(
                    (r) => `<div class="row row--between">
                      <span>${escapeHtml(r.name)}</span>
                      <span class="badge badge--${r.score >= 60 ? 'good' : 'bad'}">${Math.round(r.score)}</span>
                    </div>`,
                  )
                  .join('')}
              </div>`
            : ''
        }

        ${
          summary.bestDecision || summary.worstDecision
            ? `<div class="card stack" style="gap:12px">
                <span class="eyebrow">The verdict</span>
                ${
                  summary.bestDecision
                    ? `<div class="stack" style="gap:4px">
                        <span class="chip chip--good">best decision</span>
                        <b>${escapeHtml(summary.bestDecision.outcomeTitle)}</b>
                        <span class="micro">Age ${summary.bestDecision.age} · “${escapeHtml(summary.bestDecision.choiceText)}”</span>
                      </div>`
                    : ''
                }
                ${
                  summary.worstDecision
                    ? `<div class="stack" style="gap:4px">
                        <span class="chip chip--bad">most expensive mistake</span>
                        <b>${escapeHtml(summary.worstDecision.outcomeTitle)}</b>
                        <span class="micro">Age ${summary.worstDecision.age} · “${escapeHtml(summary.worstDecision.choiceText)}”</span>
                      </div>`
                    : ''
                }
                ${summary.worstLossLabel ? `<p class="micro">The single worst hit: ${escapeHtml(summary.worstLossLabel)} — ${fmtMoney(summary.worstLoss)}.</p>` : ''}
              </div>`
            : ''
        }

        ${
          major.length
            ? `<div class="card stack" style="gap:10px">
                <span class="eyebrow">Decisions that mattered</span>
                ${major
                  .map(
                    (d) => `<div class="stack" style="gap:2px">
                      <span class="micro">Age ${d.age} · ${escapeHtml(d.eventTitle)}</span>
                      <b style="font-size:14px">${escapeHtml(d.choiceText)}</b>
                    </div>`,
                  )
                  .join('')}
              </div>`
            : ''
        }

        ${
          summary.achievements.length
            ? `<div class="card stack" style="gap:10px">
                <span class="eyebrow">Earned this life</span>
                <div class="row" style="gap:6px;flex-wrap:wrap">
                  ${summary.achievements
                    .map((id) => {
                      const a = ACHIEVEMENTS.find((x) => x.id === id);
                      return `<span class="chip chip--good">${a?.icon ?? '🏆'} ${escapeHtml(a?.name ?? id)}</span>`;
                    })
                    .join('')}
                </div>
              </div>`
            : ''
        }
      </div>

      <div style="height:14px"></div>
      <div class="stack" style="gap:10px">
        <button class="btn btn--primary" data-act="again">LIVE ANOTHER LIFE</button>
        <button class="btn btn--ghost" data-act="share">📤 Share this life</button>
        <button class="btn btn--ghost" data-act="goto" data-arg="album">See the album</button>
      </div>
      <div style="height:10px"></div>
    </div>`;
  },
  mount() {
    // The run is over — celebrate it.
    sfx('achievement');
    haptic('success');
    confetti(36);
  },
  actions: {
    leave_daily(app: App) {
      app.game = null;
      cached = null;
      finalisedFor = null;
      leaveDaily(app);
    },
    async share_daily(app: App) {
      const data = summaryFor(app);
      const e = data?.summary.ending;
      const d = data?.summary.majorDecisions[0];
      const text = [
        `Today's Daily Dilemma in What Could Go Wrong?`,
        `I chose: "${d?.choiceText ?? 'something questionable'}"`,
        `Result: ${e?.title ?? 'a surprise'}`,
        '',
        'Same card for everyone. How did yours go?',
      ].join('\n');
      const ok = await nativeShare("Today's Daily Dilemma", text);
      track('daily_shared', { ending: e?.id ?? 'none' });
      toast({ icon: ok ? '📤' : '📋', title: ok ? 'Shared' : 'Copied to clipboard', tone: 'good' });
    },
    again(app: App) {
      app.game = null;
      cached = null;
      finalisedFor = null;
      clearGame();
      navigate('new_life');
    },
    async share(app: App) {
      const s = app.game;
      if (!s) return;
      const data = summaryFor(app);
      const summary = data?.summary;
      const ending = summary?.ending;
      const text = [
        `${summary?.name ?? 'I'} lived to ${summary?.ageReached ?? '?'} and got: ${ending?.title ?? 'THE END'}.`,
        `${summary?.decisionCount ?? 0} decisions · peak net worth ${fmtMoneyShort(summary?.peakNetWorth ?? 0)} · peak stress ${Math.round(summary?.peakStress ?? 0)}`,
        '',
        'What Could Go Wrong? — A Bad Decisions Life Simulator',
      ].join('\n');
      const ok = await nativeShare('My life, summarised', text);
      track('life_summary_shared', { ending: ending?.id ?? 'none' });
      toast({ icon: ok ? '📤' : '📋', title: ok ? 'Shared' : 'Copied to clipboard', tone: 'good' });
      void exportBundle;
      void saveGame;
      void NPC_DEFS;
      void endingById;
    },
  },
};

function kvRow(label: string, value: string): string {
  return `<div class="kv"><dt>${escapeHtml(label)}</dt><dd>${value}</dd></div>`;
}

export { buildSummary };
