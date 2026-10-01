/**
 * WHAT COULD GO WRONG? — Core type contracts.
 *
 * Everything in `src/content` is pure data conforming to these types.
 * Nothing in this file may import from `src/ui` or `src/content` — the engine
 * is a pure, side-effect-free simulation that can be unit tested and replayed.
 */

/* ------------------------------------------------------------------ stats */

export type PrimaryStatKey =
  | 'career'
  | 'happiness'
  | 'stress'
  | 'relationships'
  | 'reputation';

export type SecondaryStatKey =
  | 'health'
  | 'energy'
  | 'karma';

export type StatKey = PrimaryStatKey | SecondaryStatKey;

/** Stats clamped to this range. `money` is unbounded and lives in Finances. */
export const STAT_MIN = 0;
export const STAT_MAX = 100;

export type Trait = 'ambitious' | 'charming' | 'risk_taker' | 'practical' | 'creative';

export type LifeStage = 'early_adult' | 'building' | 'established' | 'later';

export type Category =
  | 'career'
  | 'workplace'
  | 'business'
  | 'money'
  | 'investing'
  | 'romance'
  | 'friendship'
  | 'family'
  | 'health'
  | 'housing'
  | 'travel'
  | 'social';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export type Tone = 'good' | 'bad' | 'mixed' | 'chaos' | 'neutral';

export type RelationshipStatus = 'single' | 'dating' | 'engaged' | 'married' | 'divorced' | 'widowed';

/* --------------------------------------------------------------- condition */

/**
 * Declarative prerequisite language for events and choices.
 * Sibling keys are ANDed. `all` / `any` / `not` nest for boolean logic.
 *
 * Numeric range tuples are `[min, max]` and are inclusive; use `null` for an
 * open end, e.g. `[30, null]` means "30 or more".
 */
export interface Cond {
  age?: [number, number];
  /** In-game years elapsed since the life started (0-indexed). */
  year?: [number, number];
  stage?: LifeStage[];
  trait?: Trait[];
  /** Stat range checks. */
  stats?: Partial<Record<StatKey, [number | null, number | null]>>;
  /** Numeric user-defined flags. */
  flags?: Record<string, [number | null, number | null]>;
  /** Relationship score checks against an NPC id. */
  npc?: Record<string, [number | null, number | null]>;
  partner?: RelationshipStatus[] | 'any';
  children?: [number, number];
  career?: {
    path?: CareerPathId[];
    /** 0 = entry level; see careers.ts ladders. */
    level?: [number, number];
    employed?: boolean;
    titleContains?: string;
  };
  businesses?: {
    count?: [number, number];
    types?: BusinessTypeId[];
  };
  /** Investment holdings the player currently owns. */
  holdings?: {
    count?: [number, number];
    kinds?: Holding['kind'][];
  };
  /** Boolean/numeric flags that must be truthy. */
  has?: string[];
  /** Boolean flags that must be falsy. */
  lacks?: string[];
  /** Times this event id has already fired. */
  seen?: { id: string; times?: [number, number] };
  /** Free-form player tags accumulated during play (e.g. 'homeowner'). */
  tags?: string[];
  /** Restricts to specific housing tiers. */
  homeTier?: HomeTierId[];
  /** True when the player owns their home rather than renting it. */
  homeowner?: boolean;
  /** Months spent together with the current partner. */
  romanceMonths?: [number | null, number | null];
  /** Minimum liquid cash required (used for expensive choices). */
  minCash?: number;
  /** Minimum net worth required. */
  minNetWorth?: number;
  /** Maximum net worth — used for "you never got rich" endings. */
  maxNetWorth?: number;
  /** Consumer debt range. */
  debt?: [number | null, number | null];
  /** Lifetime run statistics (jobs lost, businesses founded, breakups...). */
  run?: Partial<
    Record<
      | 'decisionsMade'
      | 'highRiskChoices'
      | 'highRiskOutcomes'
      | 'eventsSeen'
      | 'businessesFounded'
      | 'businessesSold'
      | 'propertiesBought'
      | 'timesFired'
      | 'breakups'
      | 'promotions'
      | 'loansTaken'
      | 'vacations'
      | 'nightsOut',
      [number | null, number | null]
    >
  >;
  /** Extra independent roll, 0..1. `chance: 0.3` passes 30% of the time. */
  chance?: number;
  all?: Cond[];
  any?: Cond[];
  not?: Cond;
}

/* ------------------------------------------------------------------ effects */

export type BusinessTypeId =
  | 'coffee_shop'
  | 'software_startup'
  | 'online_store'
  | 'restaurant'
  | 'consulting'
  | 'content_studio'
  | 'real_estate'
  | 'food_truck';

/**
 * Effects are authored in a terse, readable shape and compiled by
 * `engine/conditions.ts` into typed mutations. Every value is a delta unless
 * the key is documented as absolute (`setX`).
 */
export interface Fx {
  /** Liquid cash delta. */
  money?: number;
  /** Long-term savings bucket delta. */
  savings?: number;
  /** Debt delta (positive = more debt). */
  debt?: number;
  /** Mortgage delta. */
  mortgage?: number;
  /** Proportional debt change, e.g. `-0.4` wipes 40% of the balance. */
  debtPct?: number;
  /** Recurring monthly income delta (salary, rent cheques, dividends). */
  income?: number;
  /** Recurring monthly expense delta (rent, subscriptions, staff). */
  expense?: number;
  /** Absolute monthly salary override (used on hire/promotion). */
  setSalary?: number;
  /** Proportional salary change, e.g. `0.15` for a 15% raise. */
  salaryPct?: number;

  /** Career capital: 0-100. Promotions read this. */
  career?: number;
  /** Direct job-performance delta, -1..1 scale. */
  jobPerf?: number;

  happiness?: number;
  stress?: number;
  relationships?: number;
  reputation?: number;
  health?: number;
  energy?: number;
  karma?: number;

  /** Relationship score deltas keyed by NPC id. */
  npc?: Record<string, number>;
  /** Remembers a choice on an NPC — surfaced later as "remembers: ...". */
  remember?: Record<string, string>;

  /** Numeric or boolean world flags. Numbers add; booleans/strings overwrite. */
  flag?: Record<string, number | boolean | string>;

  /** Mutates the player's active business (or one by id). */
  biz?: {
    id?: string;
    revenue?: number;
    expenses?: number;
    value?: number;
    employees?: number;
    rep?: number;
    /** 0-100 operational health. Low health triggers crisis events. */
    health?: number;
    launch?: BusinessTypeId;
    close?: string;
  };

  /** Achievement ids to award. A single id or a list. */
  ach?: string | string[];
  /** Life-album unlock ids. */
  unlock?: string | string[];
  /** Player tags to add. */
  tag?: string | string[];
  /** Counters for achievements, e.g. `{ highRisk: 1 }`. */
  counter?: Record<string, number>;
  /** Career transition. */
  setCareer?: { path: CareerPathId; level: number } | null;
  /** Changing relationship status. */
  setPartner?: { npcId: string | null; status: RelationshipStatus };
  /** Adds or removes a child. */
  child?: number;
  /** Feed entries rendered in the Life Timeline. */
  log?: string;
  /** Milestones recorded in the Life Album. */
  milestone?: string | string[];
  /** Housing move. */
  moveTo?: HomeTierId;
  /**
   * Buys property: pays the deposit, takes on the mortgage, moves the player.
   * Net worth is unchanged at the moment of purchase — cash converts to equity.
   */
  buyHome?: { tier: HomeTierId; down?: number };
}

/** A consequence scheduled to land later. This is the heart of the game. */
export interface Delayed {
  /** Months from now. 12 = "a year later". */
  inMonths: number;
  /** Probability this lands at all. Defaults to 1. */
  chance?: number;
  /** If true, the pending effect is discarded when it fires and reported instead. */
  fx?: Fx;
  /** Headline shown when the delayed beat fires, e.g. "SOMEONE REMEMBERED". */
  title?: string;
  /** Body copy for the delayed beat. */
  body?: string;
  tone?: Tone;
  /** Scene key for the delayed beat card. */
  art?: string;
  /** Forces specific events to appear later, bypassing their `when` gate. */
  queue?: ChainSpec[];
  /** Ends the life immediately with this ending id. */
  ending?: string;
}

export interface ChainSpec {
  id: string;
  inMonths: number;
  chance?: number;
}

/* ------------------------------------------------------------------ choices */

export type ChoiceTag =
  | 'safe'
  | 'bold'
  | 'risky'
  | 'kind'
  | 'cruel'
  | 'chaotic'
  | 'smart'
  | 'lazy'
  | 'greedy';

export interface Outcome {
  /** Relative probability within the choice. Defaults to 1. */
  weight?: number;
  /**
   * -1 = reliably the safer branch, +1 = swingy. The Risk Taker trait shifts
   * weight towards positive variance, Practical towards negative.
   */
  variance?: number;
  /** Comedic headline, e.g. "THAT ESCALATED QUICKLY". */
  title: string;
  body: string;
  tone?: Tone;
  art?: string;
  quote?: string;
  fx?: Fx;
  delayed?: Delayed[];
  chain?: ChainSpec[];
  /** Ends the life here. */
  ending?: string;
}

export interface Choice {
  text: string;
  /** Small grey sub-label, e.g. "$8,000" or "Free, technically". */
  hint?: string;
  tag?: ChoiceTag;
  /** Hide the choice unless this passes. */
  requires?: Cond;
  /** Show, but locked, when this passes. */
  lockedWhen?: Cond;
  lockedText?: string;
  /** Months advanced by taking this choice. Defaults to 1. */
  time?: number;
  /** Merged into whichever outcome is selected. */
  fx?: Fx;
  /** One entry = deterministic. Multiple = weighted random outcome. */
  outcomes: Outcome[];
  /** Marks a decision as high-risk for the CHAOS AGENT achievement. */
  highRisk?: boolean;
}

/* ------------------------------------------------------------------- events */

export interface GameEvent {
  id: string;
  title: string;
  /** Body copy. Supports {name}, {age}, {job}, {partner}, {friend} tokens. */
  body: string;
  /** Optional NPC id who is speaking. */
  speaker?: string;
  /**
   * The character this card is *about* — the recurring face attached to it.
   * Improves that relationship slightly when the card resolves, which is how
   * the cast grows even when a card is not explicitly about them.
   */
  who?: string;
  /** Optional pull-quote rendered in the card. */
  quote?: string;
  /** Scene art key (see ui/art.ts). */
  art?: string;
  cat: Category;
  rarity?: Rarity;
  /** Base selection weight. Higher = shows up more often. Defaults to 10. */
  weight?: number;
  /** Months that must pass before this can appear again. Defaults to 18. */
  cooldown?: number;
  /** Higher priority events jump the queue when eligible. */
  priority?: number;
  when?: Cond;
  choices: Choice[];
  tags?: string[];
  /** Authored order for tie-breaks; assigned automatically by the registry. */
  order?: number;
}

/** An event instance queued to appear at a specific moment. */
export interface QueuedEvent {
  id: string;
  /** Absolute turn (months since life start) at which it becomes due. */
  dueTurn: number;
  /** Bypasses the event's `when` clause. */
  forced?: boolean;
}

/** A pending delayed consequence. */
export interface PendingEffect {
  id: string;
  dueTurn: number;
  sourceEventId: string;
  sourceChoice: string;
  payload: Delayed;
}

/* ------------------------------------------------------------- relationships */

export interface MemoryEntry {
  turn: number;
  age: number;
  note: string;
  /** True for choices they'd hold against you. */
  grudge?: boolean;
}

export interface NpcState {
  id: string;
  score: number;
  met: boolean;
  alive: boolean;
  memory: MemoryEntry[];
  /** Life events they've been through: new job, marriage, kids, success. */
  flags: Record<string, number | boolean>;
  /** Set when a romance ends. */
  status?: RelationshipStatus;
}

/* --------------------------------------------------------------- businesses */

export interface Business {
  id: string;
  type: BusinessTypeId;
  name: string;
  foundedTurn: number;
  /** Monthly revenue, grows or shrinks each month. */
  revenue: number;
  expenses: number;
  employees: number;
  rep: number;
  health: number;
  valuation: number;
  /** Consecutive months of positive growth — used for flavour + events. */
  momentum: number;
  active: boolean;
  /** Total cash the player has pulled out of it. */
  dividendsPaid: number;
}

/* ------------------------------------------------------------ careers/housing */

export type CareerPathId =
  | 'corporate'
  | 'technology'
  | 'healthcare'
  | 'marketing'
  | 'sales'
  | 'finance'
  | 'creative'
  | 'government'
  | 'freelance'
  | 'entrepreneur';

export type HomeTierId =
  | 'parents_couch'
  | 'shared_apartment'
  | 'studio'
  | 'one_bed'
  | 'rental_house'
  | 'first_home'
  | 'nice_condo'
  | 'suburban_house'
  | 'luxury_apartment'
  | 'estate'
  | 'beach_house';

/* -------------------------------------------------------------------- state */

export interface DecisionRecord {
  turn: number;
  age: number;
  eventId: string;
  eventTitle: string;
  choiceText: string;
  choiceTag?: ChoiceTag;
  outcomeTitle: string;
  tone: Tone;
  /** Net stat swing, used to compute "best/worst decision". */
  impact: number;
  deltas: Partial<Record<StatKey, number>> & { money?: number };
  turn_label: string;
}

export interface FeedEntry {
  turn: number;
  age: number;
  title: string;
  body: string;
  tone: Tone;
  kind: 'decision' | 'consequence' | 'delayed' | 'milestone' | 'system' | 'money';
  icon?: string;
}

export interface AchievementRecord {
  id: string;
  unlockedTurn: number;
  unlockedAge: number;
}

export interface MarketState {
  /** Index level, starts at 100. */
  index: number;
  /** -1 bear, 0 flat, 1 bull. */
  cycle: number;
  /** Months remaining in the current cycle. */
  cycleTurns: number;
  /** Set true once the index has dropped >20% from peak during this life. */
  crashed: boolean;
  /** Highest index seen. */
  peak: number;
}

export interface Holding {
  id: string;
  label: string;
  kind: 'index' | 'stock' | 'crypto' | 'property' | 'collectible';
  cost: number;
  value: number;
  /** Monthly volatility multiplier; crypto swings hardest. */
  volatility: number;
  acquiredTurn: number;
  sold: boolean;
}

export interface Finances {
  cash: number;
  savings: number;
  /** Consumer debt. Accrues interest every month. */
  debt: number;
  /** Secured property debt. Serviced by `housingCost`, no separate interest. */
  mortgage: number;
  salary: number;
  /** Recurring side income, summed from businesses and hustles. */
  sideIncome: number;
  /** Monthly rent or mortgage payment. */
  housingCost: number;
  livingCost: number;
  /** Temp/gig income that appears when a salary does not. */
  gigIncome: number;
  totalEarned: number;
  totalSpent: number;
  peakNetWorth: number;
  /** Worst single-hit cash loss, tracked for the life summary. */
  worstLoss: number;
  worstLossLabel: string;
  bestGain: number;
  bestGainLabel: string;
}

export interface CareerTrack {
  path: CareerPathId;
  level: number;
  title: string;
  employer: string;
  performance: number;
  monthsInRole: number;
  jobsHeld: number;
  jobsLost: number;
  peakTitle: string;
  peakLevel: number;
  /** Times the player accepted a counteroffer instead of leaving. */
  counteroffers: number;
}

export interface RomanceState {
  status: RelationshipStatus;
  partnerId: string | null;
  monthsTogether: number;
  children: number;
  proposals: number;
  breakups: number;
}

export interface PlayerIdentity {
  name: string;
  avatar: string;
  trait: Trait;
  /** Cosmetic palette id from the character creator. */
  look: string;
  /** Optional pronoun selection. */
  pronouns: 'she/her' | 'he/him' | 'they/them';
}

export interface PlayerState {
  identity: PlayerIdentity;
  ageYears: number;
  ageMonths: number;
  /** Absolute game turn in months since life start. */
  turn: number;
  startAge: number;
  stage: LifeStage;
  alive: boolean;
  endingId: string | null;
  stats: Record<StatKey, number>;
  /** Derived but cached for display. */
  tags: string[];
  peakStress: number;
  lowestHappiness: number;
  homeTier: HomeTierId;
}

export interface AchievementsState {
  unlocked: Record<string, AchievementRecord>;
  counters: Record<string, number>;
}

export interface AlbumState {
  endings: string[];
  careers: string[];
  businesses: string[];
  milestones: string[];
  rareEvents: string[];
  eventsSeen: string[];
}

export interface Settings {
  music: boolean;
  sfx: boolean;
  haptics: boolean;
  reduceMotion: boolean;
  notifications: boolean;
  theme: string;
  textSize: 'normal' | 'large';
  premium: boolean;
  tutorialDone: boolean;
  adFree: boolean;
  /**
   * Rewarded-ad perks. Every one of these is opt-in and capped per life:
   * nothing here can be bought into an advantage, only into convenience.
   */
  perks: {
    /** Undos currently available. One free per life, more only by watching an ad. */
    undosLeft: number;
    /** Rerolls used this life. */
    rerollsUsed: number;
    /** Risk reveals used this life. */
    hintsUsed: number;
    /** Undos granted by ads this life (the cap counts these, not the free one). */
    undosBought: number;
  };
}

export interface RunStats {
  decisionsMade: number;
  highRiskChoices: number;
  highRiskOutcomes: number;
  eventsSeen: number;
  businessesFounded: number;
  businessesSold: number;
  propertiesBought: number;
  timesFired: number;
  breakups: number;
  promotions: number;
  loansTaken: number;
  vacations: number;
  nightsOut: number;
}

export interface GameState {
  /** Save schema version — bump when migrations are needed. */
  version: number;
  seed: number;
  rngState: number;
  player: PlayerState;
  finances: Finances;
  career: CareerTrack;
  romance: RomanceState;
  businesses: Business[];
  holdings: Holding[];
  npcs: Record<string, NpcState>;
  flags: Record<string, number | boolean | string>;
  market: MarketState;
  achievements: AchievementsState;
  album: AlbumState;
  settings: Settings;
  runStats: RunStats;
  history: DecisionRecord[];
  feed: FeedEntry[];
  pending: PendingEffect[];
  queue: QueuedEvent[];
  /** event id -> turn it last fired. */
  seen: Record<string, number>;
  /** event id -> total number of times it has fired. */
  seenCount: Record<string, number>;
  /** Rolling window of category ids for variety shaping. */
  recentCats: string[];
  /** The event currently on screen, if any. */
  currentEventId: string | null;
  /**
   * The state as it was *before* the last decision, so the player can take it
   * back. Rewardeds ads and the free per-life undo both spend this.
   */
  undoSnapshot: string | null;
  dailyId: string | null;
  createdAt: number;
  updatedAt: number;
}

/* ---------------------------------------------------------------- interface */

export interface EndingDef {
  id: string;
  title: string;
  /**
   * `final: true` endings are only considered when a life is over (the player
   * reaches MAX_AGE or retires). Omit it for endings that can end a run early.
   */
  final?: boolean;
  blurb: string;
  body: string;
  art?: string;
  rarity: Rarity;
  /** Higher priority wins when several endings qualify. */
  priority: number;
  when: Cond;
  /** Opener line shown on the summary card. */
  flavour: string;
}

/** A purchasable cosmetic/extra-content bundle. Never a difficulty modifier. */
export interface ContentPack {
  id: string;
  name: string;
  blurb: string;
  icon: string;
  price: string;
  /** Categories the pack adds cards to. */
  categories: Category[];
  unlocks: string[];
}

export interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
  secret?: boolean;
  when: Cond;
  /** Optional counter-based check, e.g. `fired3`. */
  counter?: { key: string; gte: number };
}

export interface NpcDef {
  id: string;
  name: string;
  role: string;
  bio: string;
  /** Palette keys for the procedural portrait. */
  palette: { skin: string; hair: string; outfit: string; accent: string };
  hairStyle: 'short' | 'long' | 'bun' | 'curls' | 'bald' | 'bob' | 'locs';
  pronouns: string;
}
