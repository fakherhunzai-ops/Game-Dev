import type { App, ScreenModule } from '../shell';
import { defaultMeta, defaultSettings, exportBundle, saveMeta, saveSettings } from '../../engine/save';
import { loadArchive } from '../../lifecycle';
import { setAnalyticsSink } from '../../analytics';
import { escapeHtml, haptic, sfx, syncMusic, toast } from '../feedback';
import { isNative, scheduleDailyReminder, setStatusBarDark, shareText as nativeShare, platform } from '../../native';
import { navigate, openOverlay, closeOverlay } from '../shell';
import { contentStats } from '../../content';

/**
 * SETTINGS
 *
 * No dark patterns: every toggle does exactly what it says, data export is a
 * plain JSON blob the player owns, and "delete everything" actually deletes
 * everything.
 */
export const settingsScreen: ScreenModule = {
  html(app: App) {
    const st = app.settings ?? defaultSettings();
    const meta = app.meta ?? defaultMeta();
    const stats = contentStats();

    const toggle = (id: string, label: string, hint: string, on: boolean): string =>
      `<button class="listrow" data-act="toggle" data-arg="${id}" style="width:100%;text-align:left">
        <span class="listrow__main">
          <span class="listrow__title">${escapeHtml(label)}</span>
          <span class="listrow__sub">${escapeHtml(hint)}</span>
        </span>
        <span class="switch" role="switch" aria-checked="${on}"></span>
      </button>`;

    const archive = loadArchive();

    return `<div class="screen">
      <div class="row" style="gap:12px;padding:4px 0 12px">
        <button class="btn btn--icon btn--ghost" data-act="goto" data-arg="home" aria-label="Back">←</button>
        <div class="listrow__main"><div class="title">SETTINGS</div>
        <div class="micro">${escapeHtml(platform())} · ${stats.cards} scenarios loaded</div></div>
      </div>

      <div class="scroll stack stack--lg">
        <section class="card stack" style="gap:4px">
          <span class="eyebrow" style="padding-bottom:6px">Feel</span>
          ${toggle('music', 'Music', 'A slow, quiet loop. Off by default in most lives.', st.music)}
          ${toggle('sfx', 'Sound effects', 'Success, failure, money, achievements.', st.sfx)}
          ${toggle('haptics', 'Haptics', 'A short buzz when consequences land.', st.haptics)}
          ${toggle('reduceMotion', 'Reduce motion', 'Removes animation and confetti entirely.', st.reduceMotion)}
        </section>

        <section class="card stack" style="gap:4px">
          <span class="eyebrow" style="padding-bottom:6px">Text</span>
          <div class="seg" role="group" aria-label="Text size">
            <button data-act="textsize" data-arg="normal" aria-pressed="${st.textSize === 'normal'}">Normal</button>
            <button data-act="textsize" data-arg="large" aria-pressed="${st.textSize === 'large'}">Larger</button>
          </div>
          <p class="micro">The whole game honours the larger setting, including event copy.</p>
        </section>

        <section class="card stack" style="gap:4px">
          <span class="eyebrow" style="padding-bottom:6px">Notifications</span>
          ${toggle('notifications', 'Daily Dilemma reminder', 'One notification a day, at 9am, only if you asked for it.', st.notifications)}
          <p class="micro">${isNative() ? 'Delivered by your device. Nothing is sent anywhere.' : 'Available in the iOS and Android builds. The web build has no push access.'}</p>
        </section>

        <section class="card stack" style="gap:10px">
          <span class="eyebrow">Your data</span>
          <dl style="margin:0">
            ${row('Lives lived', String(meta.livesLived))}
            ${row('Decisions made', meta.totalDecisions.toLocaleString('en-US'))}
            ${row('Endings found', `${meta.endings.length}`)}
            ${row('Achievements', `${meta.achievements.length}`)}
            ${row('Archived lives', String(archive.length))}
          </dl>
          <div class="stack" style="gap:8px">
            <button class="btn btn--ghost btn--sm" data-act="export">Export save data</button>
            <button class="btn btn--ghost btn--sm" data-act="import">Import save data</button>
            <button class="btn btn--ghost btn--sm" data-act="share_stats">Share my stats</button>
          </div>
          <p class="micro">Export produces a plain JSON file containing everything the game knows about you. It never leaves the device unless you send it.</p>
        </section>

        <section class="card stack" style="gap:10px">
          <span class="eyebrow">Credits</span>
          <p class="micro">Written, designed and built as a single portable app: TypeScript engine, procedural art, synthesised audio. Every character, scene and sound effect is generated at runtime — nothing is downloaded, and the whole game runs offline.</p>
          <p class="micro">Content library v1.0 — ${stats.cards} scenarios, ${stats.endings} endings, ${stats.achievements} achievements.</p>
        </section>

        <section class="card stack" style="gap:10px" style="border-color:rgba(255,95,109,0.4)">
          <span class="eyebrow">Danger zone</span>
          <button class="btn btn--danger btn--sm" data-act="wipe">Delete everything and start over</button>
          <p class="micro">Erases your current life, your album, your achievements and your archived lives. There is no undo. We will not ask you to confirm twice — once is enough.</p>
        </section>
      </div>
    </div>`;
  },

  actions: {
    toggle(app: App, arg) {
      const st = app.settings;
      if (!st || !arg) return;
      const key = arg as keyof typeof st;
      if (typeof st[key] === 'boolean') {
        (st[key] as boolean) = !(st[key] as boolean);
      }
      saveSettings(st);
      haptic('tap');
      sfx('tap');
      applyAppearance(app);
      if (key === 'music') syncMusic();
      if (key === 'notifications') void scheduleDailyReminder(st.notifications);
      navigate('settings', app.params);
    },
    textsize(app: App, arg) {
      const st = app.settings;
      if (!st) return;
      st.textSize = arg === 'large' ? 'large' : 'normal';
      saveSettings(st);
      applyAppearance(app);
      navigate('settings', app.params);
    },
    export(app: App) {
      if (!app.game) {
        toast({ icon: 'ℹ️', title: 'No life in progress', body: 'Nothing to export yet.', tone: 'neutral' });
        return;
      }
      const json = exportBundle(app.game);
      openOverlay(`<div class="band"><div class="band__stamp">BACKUP</div>
        <h2 class="title-xl">YOUR SAVE, AS TEXT</h2></div>
        <p class="micro" style="margin-top:10px">Copy this somewhere safe. Import it on any device to continue exactly where you were — including delayed consequences that have not fired yet.</p>
        <textarea class="field" readonly style="height:160px;margin-top:12px;font-size:11px">${escapeHtml(json)}</textarea>
        <div style="height:12px"></div>
        <button class="btn btn--primary" data-act="copy_save">Copy to clipboard</button>
        <div style="height:8px"></div>
        <button class="btn btn--ghost" data-act="close_overlay">Close</button>`);
    },
    import(app: App) {
      openOverlay(`<div class="band"><div class="band__stamp">RESTORE</div>
        <h2 class="title-xl">PASTE A SAVE</h2></div>
        <p class="micro" style="margin-top:10px">This replaces your current life. Your album and achievements are merged, never lost.</p>
        <textarea class="field" id="importField" placeholder="Paste the exported JSON here" style="height:140px;margin-top:12px;font-size:11px"></textarea>
        <div style="height:12px"></div>
        <button class="btn btn--primary" data-act="do_import">Restore this life</button>
        <div style="height:8px"></div>
        <button class="btn btn--ghost" data-act="close_overlay">Cancel</button>`);
      void app;
    },
    async share_stats(app: App) {
      const meta = app.meta ?? defaultMeta();
      const text = `I have lived ${meta.livesLived} lives in What Could Go Wrong?, made ${meta.totalDecisions} decisions and found ${meta.endings.length} endings. Best net worth so far: ${Math.round(meta.bestNetWorth).toLocaleString('en-US')}.`;
      const ok = await nativeShare('My life simulator stats', text);
      toast({ icon: ok ? '📤' : '📋', title: ok ? 'Shared' : 'Copied', tone: 'good' });
    },
    wipe(app: App) {
      openOverlay(`<div class="band band--bad"><div class="band__stamp">CONFIRM</div>
        <h2 class="title-xl">DELETE EVERYTHING?</h2></div>
        <p class="body" style="margin-top:12px">Your current life, your album, your achievements and your archived lives will all be gone. There is genuinely no undo.</p>
        <div style="height:16px"></div>
        <button class="btn btn--danger" data-act="do_wipe">Yes. Delete it all.</button>
        <div style="height:8px"></div>
        <button class="btn btn--ghost" data-act="close_overlay">Keep my lives</button>`);
      void app;
    },
  },
};

function row(label: string, value: string): string {
  return `<div class="kv"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`;
}

/** Applies settings that affect the document rather than the save. */
export function applyAppearance(app: App): void {
  const st = app.settings ?? defaultSettings();
  document.body.classList.toggle('large-text', st.textSize === 'large');
  document.body.classList.toggle('reduce-motion', st.reduceMotion);
  void setStatusBarDark();
}

export { closeOverlay, navigate, setAnalyticsSink, saveMeta };
