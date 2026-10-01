/**
 * MONETIZATION
 *
 * Explicitly non-predatory, and enforced in code rather than in a policy doc:
 *
 *  - The entire game is free and offline. Every life is complete without paying.
 *  - Premium removes nothing from anyone else and adds no power.
 *  - Rewarded ads are strictly opt-in, strictly single-use, and never shown
 *    after a decision. There is no ad that plays because you did something.
 *  - Perks are capped per life so they cannot be farmed into an advantage.
 */

import type { Settings } from './engine/types';
import { track } from './analytics';

export type PerkId = 'reroll' | 'reveal_risk' | 'undo';

export interface PerkDef {
  id: PerkId;
  name: string;
  desc: string;
  icon: string;
  /** Hard cap of uses per life, regardless of how many ads are watched. */
  perLife: number;
}

export const PERKS: Record<PerkId, PerkDef> = {
  reroll: {
    id: 'reroll',
    name: 'REROLL THE CARD',
    desc: 'Swap this decision for a different one. Same life, different problem.',
    icon: '🎲',
    perLife: 2,
  },
  reveal_risk: {
    id: 'reveal_risk',
    name: 'REVEAL THE ODDS',
    desc: "Shows which options are gambles and roughly how they're weighted.",
    icon: '🔍',
    perLife: 3,
  },
  undo: {
    id: 'undo',
    name: 'UNDO THAT DECISION',
    desc: 'Rewind one choice. The consequence never happened. Probably.',
    icon: '↩️',
    perLife: 1,
  },
};

export interface PremiumFeature {
  id: string;
  name: string;
  desc: string;
  icon: string;
}

export const PREMIUM_FEATURES: PremiumFeature[] = [
  { id: 'no_ads', name: 'No ads, ever', desc: 'Not even the optional ones.', icon: '🚫' },
  { id: 'careers', name: 'Exclusive careers', desc: 'Private Equity and Founder at Scale.', icon: '💼' },
  { id: 'packs', name: 'All five event packs', desc: 'Corporate Chaos, Startup Life, Relationship Drama, Millionaire Problems, Travel & Adventure.', icon: '📦' },
  { id: 'themes', name: 'Cosmetic themes + avatars', desc: 'Restyle the whole game. Purely decorative.', icon: '🎨' },
  { id: 'supporter', name: 'You fund a small studio', desc: 'Which is the actual point.', icon: '❤️' },
];

export { CONTENT_PACKS as PACKS } from './content';

/** Adapters a native build supplies. Web falls back to a graceful no-op. */
export interface StoreAdapter {
  /** Returns true when the purchase completed. */
  purchase: (productId: string) => Promise<boolean>;
  /** Returns true when an ad was watched to completion. */
  showRewardedAd: (placement: PerkId) => Promise<boolean>;
  hasPremium: () => Promise<boolean>;
}

let store: StoreAdapter = {
  purchase: async () => false,
  showRewardedAd: async () => false,
  hasPremium: async () => false,
};

export function setStoreAdapter(next: StoreAdapter): void {
  store = next;
}

export const perksUsed = (settings: Settings, perk: PerkId): number =>
  perk === 'undo'
    ? settings.perks.undosBought
    : perk === 'reroll'
      ? settings.perks.rerollsUsed
      : settings.perks.hintsUsed;

export const perkAvailable = (settings: Settings, perk: PerkId): boolean =>
  !settings.adFree && perksUsed(settings, perk) < PERKS[perk].perLife;

/**
 * Watches a rewarded ad. Never called automatically — always from an explicit
 * tap, and the caller must handle a `false` result as "nothing happened".
 */
export async function watchRewardedAd(settings: Settings, perk: PerkId): Promise<boolean> {
  if (!perkAvailable(settings, perk)) return false;
  const watched = await store.showRewardedAd(perk);
  if (watched) {
    track('rewarded_ad_viewed', { placement: perk });
    if (perk === 'reroll') settings.perks.rerollsUsed += 1;
    if (perk === 'reveal_risk') settings.perks.hintsUsed += 1;
    if (perk === 'undo') {
      settings.perks.undosLeft += 1;
      settings.perks.undosBought += 1;
    }
  }
  return watched;
}

export async function purchasePremium(settings: Settings): Promise<boolean> {
  const ok = await store.purchase('premium_unlock');
  if (ok) {
    settings.premium = true;
    settings.adFree = true;
    track('premium_purchase', { product: 'premium_unlock' });
  }
  return ok;
}

export async function purchasePack(packId: string, settings: Settings): Promise<boolean> {
  const ok = await store.purchase(`pack_${packId}`);
  if (ok) {
    settings.premium = true;
    track('premium_purchase', { product: packId });
  }
  return ok;
}

/** The free-tier promise, enforced: no ad can ever be forced. */
export const IS_FREE_TO_FINISH = true;
export const CAN_PAY_FOR_POWER = false;
