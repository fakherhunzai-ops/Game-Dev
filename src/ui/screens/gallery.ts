import type { App, ScreenModule } from '../shell';
import { ACHIEVEMENTS, CONTENT_PACKS, ENDINGS, EVENT_MAP, NPCS, contentStats } from '../../content';
import { BUSINESS_TYPES, CAREER_PATHS, HOME_TIERS, TRAITS, traitDef } from '../../engine/catalog';
import { defaultMeta, loadMeta } from '../../engine/save';
import { escapeHtml } from '../feedback';
import { portrait } from '../avatars';
import { PREMIUM_FEATURES } from '../../monetization';
import { navigate } from '../shell';

/* ====================================================== ACHIEVEMENTS ===== */

export const achievementsScreen: ScreenModule = {
  html(app: App) {
    const meta = app.meta ?? defaultMeta();
    const unlocked = new Set(meta.achievements);
    const sorted = [...ACHIEVEMENTS].sort((a, b) => {
      const au = unlocked.has(a.id) ? 0 : 1;
      const bu = unlocked.has(b.id) ? 0 : 1;
      return au - bu;
    });
    const pct = Math.round((unlocked.size / ACHIEVEMENTS.length) * 100);

    return `<div class="screen">
      <div class="row" style="gap:12px;padding:4px 0 12px">
        <button class="btn btn--icon btn--ghost" data-act="goto" data-arg="home" aria-label="Back">←</button>
        <div class="listrow__main"><div class="title">ACHIEVEMENTS</div>
        <div class="micro">${unlocked.size} of ${ACHIEVEMENTS.length} unlocked</div></div>
      </div>
      <div class="scroll stack stack--lg">
        <div class="card stack" style="gap:10px">
          <div class="row row--between">
            <span class="eyebrow">Progress</span>
            <b>${pct}%</b>
          </div>
          <div class="progress"><i style="width:${pct}%"></i></div>
          <p class="micro">Achievements persist across every life you ever live. Some of them require doing something genuinely stupid.</p>
        </div>

        ${sorted
          .map((a) => {
            const on = unlocked.has(a.id);
            return `<div class="card card--tight" style="opacity:${on ? 1 : 0.55}">
              <div class="row" style="gap:12px">
                <span style="font-size:26px;${on ? '' : 'filter:grayscale(1) brightness(0.7)'}">${on ? a.icon : '🔒'}</span>
                <div class="listrow__main">
                  <div class="listrow__title">${escapeHtml(a.name)}</div>
                  <div class="listrow__sub">${on ? escapeHtml(a.desc) : a.secret ? 'Hidden until you find it.' : escapeHtml(a.desc)}</div>
                </div>
                ${on ? '<span class="badge badge--brand">✓</span>' : ''}
              </div>
            </div>`;
          })
          .join('')}
      </div>
    </div>`;
  },
};

/* ============================================================= ALBUM ===== */

export const albumScreen: ScreenModule = {
  html(app: App) {
    const meta = app.meta ?? loadMeta() ?? defaultMeta();
    const stats = contentStats();
    const endingsPct = Math.round((meta.endings.length / ENDINGS.length) * 100);

    return `<div class="screen">
      <div class="row" style="gap:12px;padding:4px 0 12px">
        <button class="btn btn--icon btn--ghost" data-act="goto" data-arg="home" aria-label="Back">←</button>
        <div class="listrow__main"><div class="title">LIFE ALBUM</div>
        <div class="micro">Everything you have done across ${meta.livesLived} ${meta.livesLived === 1 ? 'life' : 'lives'}</div></div>
      </div>

      <div class="scroll stack stack--lg">
        <div class="card stack" style="gap:10px">
          <div class="row row--between">
            <span class="eyebrow">Endings found</span>
            <b>${meta.endings.length} / ${ENDINGS.length}</b>
          </div>
          <div class="progress"><i style="width:${endingsPct}%"></i></div>
        </div>

        <section class="stack" style="gap:10px">
          <span class="eyebrow">Endings</span>
          <div class="album-grid">
            ${ENDINGS.map((e) => {
              const on = meta.endings.includes(e.id);
              return `<div class="album-cell ${on ? 'album-cell--on' : ''}" title="${escapeHtml(on ? e.title : 'Undiscovered')}">
                <span class="album-cell__icon ${on ? '' : 'locked'}">${on ? rarityIcon(e.rarity) : '❓'}</span>
                <span>${on ? escapeHtml(e.title) : '???'}</span>
              </div>`;
            }).join('')}
          </div>
        </section>

        <section class="stack" style="gap:10px">
          <span class="eyebrow">Rare events (${meta.rareEvents.length} / ${stats.byRarity.rare ?? 0})</span>
          <div class="album-grid">
            ${Object.values(EVENT_MAP)
              .filter((e) => e.rarity === 'rare' || e.rarity === 'legendary')
              .map((e) => {
                const on = meta.rareEvents.includes(e.id);
                return `<div class="album-cell ${on ? 'album-cell--on' : ''}">
                  <span class="album-cell__icon ${on ? '' : 'locked'}">${on ? '✨' : '❓'}</span>
                  <span>${on ? escapeHtml(shortTitle(e.title)) : '???'}</span>
                </div>`;
              })
              .join('')}
          </div>
          <p class="micro">Rare events only start appearing after you have lived a few lives. The first one is always a surprise.</p>
        </section>

        <section class="stack" style="gap:10px">
          <span class="eyebrow">Careers held (${meta.careers.length} / ${CAREER_PATHS.length})</span>
          <div class="album-grid">
            ${CAREER_PATHS.map((c) => {
              const on = meta.careers.includes(c.id);
              return `<div class="album-cell ${on ? 'album-cell--on' : ''}">
                <span class="album-cell__icon ${on ? '' : 'locked'}">${on ? c.icon : '❓'}</span>
                <span>${on ? escapeHtml(c.name) : '???'}</span>
              </div>`;
            }).join('')}
          </div>
        </section>

        <section class="stack" style="gap:10px">
          <span class="eyebrow">Businesses founded</span>
          <div class="album-grid">
            ${BUSINESS_TYPES.map((b) => {
              const on = meta.businesses.includes(b.id);
              return `<div class="album-cell ${on ? 'album-cell--on' : ''}">
                <span class="album-cell__icon ${on ? '' : 'locked'}">${on ? b.emoji : '❓'}</span>
                <span>${on ? escapeHtml(b.name) : '???'}</span>
              </div>`;
            }).join('')}
          </div>
        </section>

        <section class="stack" style="gap:10px">
          <span class="eyebrow">Homes lived in</span>
          <div class="album-grid">
            ${HOME_TIERS.map((h) => {
              const on = meta.milestones.includes(h.id) || meta.milestones.includes(h.name);
              return `<div class="album-cell ${on ? 'album-cell--on' : ''}">
                <span class="album-cell__icon ${on ? '' : 'locked'}">${on ? '🏠' : '❓'}</span>
                <span>${on ? escapeHtml(h.name) : '???'}</span>
              </div>`;
            }).join('')}
          </div>
        </section>

        ${
          meta.milestones.length
            ? `<section class="card stack" style="gap:8px">
                <span class="eyebrow">Milestones</span>
                ${meta.milestones.slice(-24).map((m) => `<div class="listrow"><span class="badge badge--good">✓</span><span class="listrow__main">${escapeHtml(m)}</span></div>`).join('')}
              </section>`
            : ''
        }

        <section class="card stack" style="gap:10px">
          <span class="eyebrow">The cast (${NPCS.length})</span>
          <div class="row" style="gap:8px;flex-wrap:wrap">
            ${NPCS.map((n) => `<div style="width:64px" title="${escapeHtml(n.name)}">
              <div class="portrait" style="border-radius:14px">${portrait(n.id)}</div>
              <div class="micro center" style="margin-top:4px;font-size:10px">${escapeHtml(n.name.split(' ')[0])}</div>
            </div>`).join('')}
          </div>
        </section>

        <div class="card card--flat stack" style="gap:8px">
          <span class="eyebrow">Total decisions made</span>
          <div class="title-xl">${meta.totalDecisions.toLocaleString('en-US')}</div>
          <p class="micro">Best net worth so far: ${meta.bestNetWorth < 0 ? '−$' + Math.abs(Math.round(meta.bestNetWorth)).toLocaleString('en-US') : '$' + Math.round(meta.bestNetWorth).toLocaleString('en-US')}</p>
        </div>
      </div>
    </div>`;
  },
};

function rarityIcon(r: string): string {
  return r === 'legendary' ? '👑' : r === 'rare' ? '✨' : r === 'uncommon' ? '🔹' : '🏁';
}

function shortTitle(t: string): string {
  const words = t.split(' ').slice(0, 3).join(' ');
  return words.length > 18 ? `${words.slice(0, 16)}…` : words;
}

/* ============================================================== SHOP ===== */

export const shopScreen: ScreenModule = {
  html(app: App) {
    const premium = app.settings?.premium ?? false;
    return `<div class="screen">
      <div class="row" style="gap:12px;padding:4px 0 12px">
        <button class="btn btn--icon btn--ghost" data-act="goto" data-arg="home" aria-label="Back">←</button>
        <div class="listrow__main"><div class="title">OPTIONAL EXTRAS</div>
        <div class="micro">Everything below is optional. The game is complete without it.</div></div>
      </div>
      <div class="scroll stack stack--lg">
        <div class="card card--glow stack" style="gap:12px">
          <span class="eyebrow">${premium ? 'Owned' : 'One purchase'}</span>
          <div class="title-xl">${premium ? 'You have the premium unlock.' : 'Unlock everything. Pay once.'}</div>
          <div class="stack" style="gap:8px">
            ${PREMIUM_FEATURES.map(
              (f) => `<div class="row" style="gap:10px">
                <span style="font-size:18px">${f.icon}</span>
                <span class="listrow__main">
                  <span class="listrow__title" style="font-size:14px">${escapeHtml(f.name)}</span>
                  <span class="listrow__sub">${escapeHtml(f.desc)}</span>
                </span>
              </div>`,
            ).join('')}
          </div>
          ${
            premium
              ? '<div class="badge badge--good">ACTIVE</div>'
              : `<button class="btn btn--primary" data-act="buy_premium">UNLOCK — $7.99</button>
                 <p class="micro">No subscription. No currency. No advantage in the simulation — only more of it, and no ads.</p>`
          }
        </div>

        <section class="stack" style="gap:10px">
          <span class="eyebrow">Event packs</span>
          ${CONTENT_PACKS.map(
            (p) => `<div class="card card--tight row" style="gap:12px">
              <span style="font-size:24px">${p.icon}</span>
              <span class="listrow__main">
                <span class="listrow__title">${escapeHtml(p.name)}</span>
                <span class="listrow__sub">${escapeHtml(p.blurb)}</span>
              </span>
              <button class="btn btn--sm ${premium ? 'btn--ghost' : 'btn--primary'}" data-act="buy_pack" data-arg="${p.id}" ${premium ? 'disabled' : ''}>
                ${premium ? 'INCLUDED' : p.price}
              </button>
            </div>`,
          ).join('')}
        </section>

        <div class="card card--flat stack" style="gap:10px">
          <span class="eyebrow">What we will not do</span>
          <div class="stack" style="gap:8px">
            ${[
              'No ad will ever play because of a decision you made.',
              'No purchase makes you better at the game.',
              'No currency, no energy timers, no loot boxes.',
              'Rewarded ads are always optional and always capped.',
            ]
              .map((line) => `<div class="row" style="gap:10px"><span class="badge badge--good">✓</span><span class="micro" style="flex:1">${escapeHtml(line)}</span></div>`)
              .join('')}
          </div>
        </div>
      </div>
    </div>`;
  },
};

/* =============================================================== MISC ==== */

export const TRAIT_ROWS = TRAITS.map((t) => ({ id: t.id, name: t.name, colour: traitDef(t.id).color }));

export const back = (): void => navigate('home');
