/**
 * NATIVE BRIDGE
 *
 * Thin wrappers over Capacitor plugins with web fallbacks, so the exact same
 * build runs in a browser (development) and in a shipped iOS/Android binary.
 * Nothing here is required for gameplay — every call degrades quietly.
 */

interface CapacitorGlobal {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
}

const hasDom = (): boolean => typeof window !== 'undefined';

const cap = (): CapacitorGlobal =>
  hasDom() ? ((window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor ?? {}) : {};

export const isNative = (): boolean => cap().isNativePlatform?.() === true;
export const platform = (): string => cap().getPlatform?.() ?? 'web';

/** Share a text card through the OS sheet, falling back to the Web Share API. */
export async function shareText(title: string, text: string): Promise<boolean> {
  if (!hasDom()) return false;
  if (isNative()) {
    try {
      const mod = await import('@capacitor/share');
      await mod.Share.share({ title, text, dialogTitle: 'Share your life' });
      return true;
    } catch {
      /* fall through to web */
    }
  }
  if (typeof navigator !== 'undefined' && 'share' in navigator) {
    try {
      await navigator.share({ title, text });
      return true;
    } catch {
      return false;
    }
  }
  return copyText(text);
}

export async function copyText(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined') return false;
  try {
    const nav = navigator as Navigator & { clipboard?: { writeText: (t: string) => Promise<void> } };
    if (!nav.clipboard) return false;
    await nav.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Optional, opt-in, low-frequency notifications. Never spam. */
export async function scheduleDailyReminder(enabled: boolean): Promise<void> {
  if (!isNative()) return;
  try {
    const mod = await import('@capacitor/local-notifications');
    await mod.LocalNotifications.cancel({ notifications: [{ id: 1001 }] });
    if (!enabled) return;
    const perm = await mod.LocalNotifications.checkPermissions();
    let state = perm.display;
    if (state !== 'granted') {
      state = (await mod.LocalNotifications.requestPermissions()).display;
    }
    if (state !== 'granted') return;
    await mod.LocalNotifications.schedule({
      notifications: [
        {
          id: 1001,
          title: 'Your Daily Dilemma is waiting',
          body: 'One scenario. One decision. Forty seconds of consequences.',
          schedule: { on: { hour: 9, minute: 0 }, repeats: true },
          smallIcon: 'ic_stat_icon_config_sample',
        },
      ],
    });
  } catch {
    /* notifications are optional by design */
  }
}

export async function setStatusBarDark(): Promise<void> {
  if (!isNative()) return;
  try {
    const mod = await import('@capacitor/status-bar');
    await mod.StatusBar.setStyle({ style: mod.Style.Dark });
  } catch {
    /* ignore */
  }
}

/** Wires Capacitor's hardware back button to in-app navigation. */
export async function installBackButton(handler: () => boolean): Promise<void> {
  if (!isNative()) return;
  try {
    const mod = await import('@capacitor/app');
    await mod.App.addListener('backButton', () => {
      const handled = handler();
      if (!handled) void mod.App.exitApp();
    });
  } catch {
    /* ignore */
  }
}
