import type {
  CareerPathId,
  BusinessTypeId,
  HomeTierId,
  LifeStage,
  Trait,
} from './types';

/* ------------------------------------------------------------------ traits */

export interface TraitDef {
  id: Trait;
  name: string;
  tagline: string;
  blurb: string;
  /** Applied once at character creation. */
  bonuses: Record<string, number>;
  /** Colour used across the UI for this trait. */
  color: string;
  icon: string;
}

export const TRAITS: TraitDef[] = [
  {
    id: 'ambitious',
    name: 'Ambitious',
    tagline: 'Career growth · Higher stress',
    blurb:
      'You read the phrase "work-life balance" the way other people read a menu in a language they don\'t speak.',
    bonuses: { career: 12, stress: 10, energy: -5 },
    color: '#ff8a3d',
    icon: '▲',
  },
  {
    id: 'charming',
    name: 'Charming',
    tagline: 'Relationships · Social opportunities',
    blurb:
      'You have never once paid full price for anything, and you are not entirely sure how that happened.',
    bonuses: { relationships: 14, reputation: 8, career: -3 },
    color: '#ff5c8a',
    icon: '✦',
  },
  {
    id: 'risk_taker',
    name: 'Risk Taker',
    tagline: 'Bigger rewards · Bigger losses',
    blurb:
      'Your financial advisor has a specific tone of voice they use only when you call.',
    bonuses: { happiness: 6, stress: -4 },
    color: '#c56cff',
    icon: '⚡',
  },
  {
    id: 'practical',
    name: 'Practical',
    tagline: 'Money management · Fewer wild swings',
    blurb:
      'You own a labelled filing system and you have used it within the last ninety days.',
    bonuses: { stress: -10, happiness: -3 },
    color: '#3ec9a7',
    icon: '■',
  },
  {
    id: 'creative',
    name: 'Creative',
    tagline: 'Side hustles · Unique events',
    blurb:
      'You have eleven unfinished projects and a very compelling explanation for each of them.',
    bonuses: { happiness: 8, reputation: 4, stress: 4 },
    color: '#f5b83d',
    icon: '◆',
  },
];

export const traitDef = (id: Trait): TraitDef =>
  TRAITS.find((t) => t.id === id) ?? TRAITS[0];

/* ----------------------------------------------------------------- careers */

export interface CareerPathDef {
  id: CareerPathId;
  name: string;
  icon: string;
  /** Ordered ladder — index is the level. */
  ladder: string[];
  /** Base monthly salary at each rung, before performance scaling. */
  salaries: number[];
  /** Employers the player can land at, chosen by RNG on hire. */
  employers: string[];
  blurb: string;
  /** Level at which this path counts as "senior leadership". */
  leadershipLevel: number;
}

export const CAREER_PATHS: CareerPathDef[] = [
  {
    id: 'corporate',
    name: 'Corporate',
    icon: '🏢',
    ladder: [
      'Junior Coordinator',
      'Coordinator',
      'Manager',
      'Senior Manager',
      'Director',
      'Vice President',
      'Chief Operating Officer',
    ],
    salaries: [3100, 4200, 6100, 8400, 12500, 19500, 34000],
    employers: ['Halvorsen Group', 'Meridian Partners', 'Brightline Corp', 'Omni Federal', 'Kestrel Holdings'],
    blurb: 'Meetings about meetings. Excellent dental.',
    leadershipLevel: 4,
  },
  {
    id: 'technology',
    name: 'Technology',
    icon: '💻',
    ladder: [
      'Junior Developer',
      'Developer',
      'Senior Developer',
      'Tech Lead',
      'Engineering Manager',
      'Director of Engineering',
      'Chief Technology Officer',
    ],
    salaries: [3900, 5600, 8200, 10800, 14200, 19000, 27000],
    employers: ['Northwind Labs', 'Palewell Systems', 'Tesseract', 'Copperline', 'Modal Nine'],
    blurb: 'Fixing in twenty minutes what you broke over three days.',
    leadershipLevel: 4,
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: '🩺',
    ladder: [
      'Nursing Assistant',
      'Registered Nurse',
      'Charge Nurse',
      'Nurse Manager',
      'Director of Nursing',
      'Hospital Administrator',
    ],
    salaries: [2900, 4800, 5900, 7600, 10400, 16000],
    employers: ['St. Auberon Hospital', 'Cedar Vale Clinic', 'Lakeview Medical', 'Providence North'],
    blurb: 'Deeply meaningful. Absolutely exhausting.',
    leadershipLevel: 4,
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: '📣',
    ladder: [
      'Junior Marketing Assistant',
      'Marketing Coordinator',
      'Marketing Manager',
      'Senior Marketing Manager',
      'Head of Marketing',
      'Chief Marketing Officer',
    ],
    salaries: [2800, 3700, 5400, 7600, 11800, 21000],
    employers: ['Hearth & Vine', 'Bloombox', 'Cascade Media', 'Perch Agency', 'Nova Consumer'],
    blurb: 'Turning "make it go viral" into a five-year plan.',
    leadershipLevel: 4,
  },
  {
    id: 'sales',
    name: 'Sales',
    icon: '📞',
    ladder: [
      'Sales Development Rep',
      'Account Executive',
      'Senior Account Executive',
      'Sales Manager',
      'Director of Sales',
      'VP of Sales',
      'Chief Revenue Officer',
    ],
    salaries: [3000, 4600, 6900, 9500, 13500, 20000, 29000],
    employers: ['Quill & Doyle', 'Ridgeline Software', 'Baxter Industrial', 'Fernwood Supply'],
    blurb: 'Uncapped commission. Increasingly creative quota maths.',
    leadershipLevel: 5,
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: '📈',
    ladder: [
      'Financial Analyst',
      'Senior Analyst',
      'Associate',
      'Vice President',
      'Director',
      'Managing Director',
      'Chief Financial Officer',
    ],
    salaries: [4200, 5900, 8100, 13000, 18500, 27000, 38000],
    employers: ['Cawdor Capital', 'Ashgrove Securities', 'Two Rivers Bank', 'Helix Partners'],
    blurb: 'You will be extremely well paid and mildly haunted.',
    leadershipLevel: 5,
  },
  {
    id: 'creative',
    name: 'Creative',
    icon: '🎨',
    ladder: [
      'Junior Designer',
      'Designer',
      'Senior Designer',
      'Art Director',
      'Creative Director',
      'Executive Creative Director',
    ],
    salaries: [2700, 3900, 5800, 8200, 12000, 17500],
    employers: ['Studio Halcyon', 'Paper Tiger', 'Broadside', 'Modern Optimist'],
    blurb: 'Being told the logo needs more "pop" for the rest of your natural life.',
    leadershipLevel: 4,
  },
  {
    id: 'government',
    name: 'Government',
    icon: '🏛️',
    ladder: [
      'Administrative Trainee',
      'Policy Analyst',
      'Program Officer',
      'Senior Program Officer',
      'Branch Manager',
      'Deputy Director',
      'Director-General',
    ],
    salaries: [2900, 3800, 4900, 6200, 7900, 10200, 15500],
    employers: ['Department of Regional Affairs', 'City Planning Office', 'Transport Authority', 'Bureau of Statistics'],
    blurb: 'Rock-solid pension. A pace of change measured in geological time.',
    leadershipLevel: 5,
  },
  {
    id: 'freelance',
    name: 'Freelance',
    icon: '🧾',
    ladder: [
      'Glorified Freelancer',
      'Freelancer',
      'Specialist',
      'In-Demand Specialist',
      'Agency of One',
      'Studio Owner',
    ],
    salaries: [2400, 3600, 5400, 7800, 11500, 17000],
    employers: ['Self-employed'],
    blurb: 'Nobody tells you what to do, and nobody tells you what to do.',
    leadershipLevel: 4,
  },
  {
    id: 'entrepreneur',
    name: 'Entrepreneur',
    icon: '🚀',
    ladder: [
      'Founder (Pre-Revenue)',
      'Founder (Theoretically Revenue)',
      'Founder (Actual Revenue)',
      'Scaling Founder',
      'Serial Founder',
      'Industry Disruptor',
    ],
    salaries: [1200, 2200, 4000, 7500, 13000, 26000],
    employers: ['Your own company'],
    blurb: 'The highs are incredible. The lows are a phone call with your accountant.',
    leadershipLevel: 3,
  },
];

export const careerDef = (id: CareerPathId): CareerPathDef =>
  CAREER_PATHS.find((c) => c.id === id) ?? CAREER_PATHS[0];

export function careerTitle(path: CareerPathId, level: number): string {
  const def = careerDef(path);
  return def.ladder[Math.min(level, def.ladder.length - 1)];
}

export function careerSalary(
  path: CareerPathId,
  level: number,
  performance: number,
): number {
  const def = careerDef(path);
  const base = def.salaries[Math.min(level, def.salaries.length - 1)];
  // Performance (0-100, neutral 50) scales pay between 0.85x and 1.25x.
  const factor = 0.85 + (performance / 100) * 0.4;
  return Math.round((base * factor) / 10) * 10;
}

export const maxLevel = (path: CareerPathId): number => careerDef(path).ladder.length - 1;

/* ----------------------------------------------------------------- housing */

export interface HomeTierDef {
  id: HomeTierId;
  name: string;
  /** Monthly cost (rent or mortgage). */
  cost: number;
  /** One-off cost to move in (deposit / down payment). */
  moveInCost: number;
  stressDelta: number;
  happinessDelta: number;
  prestige: number;
  /** Owned homes build equity that counts towards net worth. */
  owned: boolean;
  /** Full market value. Net worth subtracts the outstanding mortgage. */
  value: number;
  blurb: string;
}

export const HOME_TIERS: HomeTierDef[] = [
  {
    id: 'parents_couch',
    name: "Parents' Spare Room",
    cost: 0,
    moveInCost: 0,
    stressDelta: 6,
    happinessDelta: -4,
    prestige: 0,
    owned: false,
    value: 0,
    blurb: 'Free. In every sense that matters and several that do not.',
  },
  {
    id: 'shared_apartment',
    name: 'Shared Apartment',
    cost: 900,
    moveInCost: 900,
    stressDelta: 2,
    happinessDelta: 0,
    prestige: 1,
    owned: false,
    value: 0,
    blurb: 'Two people, one bathroom, an unspoken agreement about the dishes.',
  },
  {
    id: 'studio',
    name: 'Studio Apartment',
    cost: 1100,
    moveInCost: 1100,
    stressDelta: 0,
    happinessDelta: 2,
    prestige: 2,
    owned: false,
    value: 0,
    blurb: 'Everything you own, visible from the door.',
  },
  {
    id: 'one_bed',
    name: 'One-Bedroom',
    cost: 1650,
    moveInCost: 1650,
    stressDelta: -3,
    happinessDelta: 6,
    prestige: 4,
    owned: false,
    value: 0,
    blurb: 'A door you can close. Genuinely underrated.',
  },
  {
    id: 'rental_house',
    name: 'Rental House',
    cost: 2400,
    moveInCost: 2400,
    stressDelta: -2,
    happinessDelta: 8,
    prestige: 6,
    owned: false,
    value: 0,
    blurb: 'A garden you did not ask for and cannot legally ignore.',
  },
  {
    id: 'first_home',
    name: 'First Home',
    cost: 2200,
    moveInCost: 42000,
    stressDelta: 4,
    happinessDelta: 12,
    prestige: 9,
    owned: true,
    value: 240000,
    blurb: 'Yours. Also the boiler\'s, apparently, and the boiler has opinions.',
  },
  {
    id: 'nice_condo',
    name: 'City Condo',
    cost: 2900,
    moveInCost: 68000,
    stressDelta: -2,
    happinessDelta: 10,
    prestige: 13,
    owned: true,
    value: 385000,
    blurb: 'Floor-to-ceiling windows and a gym you will visit four times.',
  },
  {
    id: 'suburban_house',
    name: 'Suburban House',
    cost: 3400,
    moveInCost: 92000,
    stressDelta: -6,
    happinessDelta: 10,
    prestige: 12,
    owned: true,
    value: 525000,
    blurb: 'A lawn, a shed, and neighbours who watch everything.',
  },
  {
    id: 'luxury_apartment',
    name: 'Luxury Apartment',
    cost: 5600,
    moveInCost: 130000,
    stressDelta: -4,
    happinessDelta: 14,
    prestige: 22,
    owned: true,
    value: 780000,
    blurb: 'The concierge knows your name and absolutely nothing else about you.',
  },
  {
    id: 'estate',
    name: 'Hilltop Estate',
    cost: 11000,
    moveInCost: 480000,
    stressDelta: -2,
    happinessDelta: 16,
    prestige: 38,
    owned: true,
    value: 2400000,
    blurb: 'Six bedrooms. You use two. The other four think about you.',
  },
  {
    id: 'beach_house',
    name: 'Coastal House',
    cost: 7400,
    moveInCost: 340000,
    stressDelta: -10,
    happinessDelta: 20,
    prestige: 30,
    owned: true,
    value: 1750000,
    blurb: 'Salt air, slow mornings, and a truly unreasonable number of stairs.',
  },
];

export const homeDef = (id: HomeTierId): HomeTierDef =>
  HOME_TIERS.find((h) => h.id === id) ?? HOME_TIERS[0];

/* -------------------------------------------------------------- businesses */

export interface BusinessTypeDef {
  id: BusinessTypeId;
  name: string;
  emoji: string;
  setupCost: number;
  baseRevenue: number;
  baseExpenses: number;
  /** Monthly revenue volatility multiplier. */
  volatility: number;
  blurb: string;
  /** Failure threshold — how punishing bad months are. */
  fragility: number;
}

export const BUSINESS_TYPES: BusinessTypeDef[] = [
  {
    id: 'coffee_shop',
    name: 'Coffee Shop',
    emoji: '☕',
    setupCost: 45000,
    baseRevenue: 14000,
    baseExpenses: 12200,
    volatility: 0.12,
    fragility: 0.7,
    blurb: 'A charming way to convert money into the smell of money.',
  },
  {
    id: 'software_startup',
    name: 'Software Startup',
    emoji: '🛠️',
    setupCost: 22000,
    baseRevenue: 9000,
    baseExpenses: 9800,
    volatility: 0.34,
    fragility: 1.1,
    blurb: 'Loses money at an impressive rate until, sometimes, it does not.',
  },
  {
    id: 'online_store',
    name: 'Online Store',
    emoji: '📦',
    setupCost: 9000,
    baseRevenue: 6500,
    baseExpenses: 4900,
    volatility: 0.24,
    fragility: 0.9,
    blurb: 'Infinite shelf space, finite patience for returns.',
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    emoji: '🍽️',
    setupCost: 72000,
    baseRevenue: 28000,
    baseExpenses: 26500,
    volatility: 0.18,
    fragility: 1.2,
    blurb: 'The classic. Also the classic way to lose a house.',
  },
  {
    id: 'consulting',
    name: 'Consulting Agency',
    emoji: '💼',
    setupCost: 6000,
    baseRevenue: 11000,
    baseExpenses: 6200,
    volatility: 0.14,
    fragility: 0.6,
    blurb: 'You sell the ability to look confidently at a spreadsheet.',
  },
  {
    id: 'content_studio',
    name: 'Content Studio',
    emoji: '🎬',
    setupCost: 7500,
    baseRevenue: 5200,
    baseExpenses: 3900,
    volatility: 0.42,
    fragility: 0.8,
    blurb: 'Occasionally enormous. Mostly a group chat with a logo.',
  },
  {
    id: 'real_estate',
    name: 'Property Company',
    emoji: '🏘️',
    setupCost: 120000,
    baseRevenue: 24000,
    baseExpenses: 14000,
    volatility: 0.16,
    fragility: 1.0,
    blurb: 'Bricks do not ghost you. Tenants occasionally do.',
  },
  {
    id: 'food_truck',
    name: 'Food Truck',
    emoji: '🚚',
    setupCost: 28000,
    baseRevenue: 15500,
    baseExpenses: 12800,
    volatility: 0.22,
    fragility: 0.95,
    blurb: 'A kitchen that can flee. The business model writes itself.',
  },
];

export const bizDef = (id: BusinessTypeId): BusinessTypeDef =>
  BUSINESS_TYPES.find((b) => b.id === id) ?? BUSINESS_TYPES[0];

/* -------------------------------------------------------------- life stages */

export interface LifeStageDef {
  id: LifeStage;
  name: string;
  min: number;
  max: number;
  blurb: string;
  /** Categories weighted up during this stage. */
  emphasis: string[];
}

export const LIFE_STAGES: LifeStageDef[] = [
  {
    id: 'early_adult',
    name: 'Early Adult Life',
    min: 18,
    max: 29,
    blurb: 'Underpaid, over-optimistic, and operating on four hours of sleep.',
    emphasis: ['romance', 'friendship', 'housing', 'social', 'money'],
  },
  {
    id: 'building',
    name: 'The Building Years',
    min: 30,
    max: 39,
    blurb: 'Everything is simultaneously going well and about to be a problem.',
    emphasis: ['career', 'workplace', 'business', 'family', 'housing'],
  },
  {
    id: 'established',
    name: 'Established Life',
    min: 40,
    max: 54,
    blurb: 'You are now the person other people ask for advice. Terrifying.',
    emphasis: ['career', 'health', 'family', 'investing', 'business'],
  },
  {
    id: 'later',
    name: 'Later Life',
    min: 55,
    max: 200,
    blurb: 'Legacy, knees, and a growing suspicion that you were right all along.',
    emphasis: ['health', 'family', 'investing', 'travel', 'social'],
  },
];

export function stageForAge(age: number): LifeStage {
  for (const s of LIFE_STAGES) if (age >= s.min && age <= s.max) return s.id;
  return 'later';
}

export function stageDef(id: LifeStage): LifeStageDef {
  return LIFE_STAGES.find((s) => s.id === id) ?? LIFE_STAGES[0];
}

/** Hard cap — reaching this age always ends the run. */
export const MAX_AGE = 84;

/**
 * The pool of romanceable NPCs. The engine picks one when an event says
 * `setPartner: { npcId: 'new' }`, so two players comparing notes get different
 * partners — and different lives.
 */
export const ROMANCE_CANDIDATES = ['alex', 'nora', 'sam', 'rina'] as const;

/** Alias prefixes understood by conditions and effects. */
export const PARTNER_ALIAS = 'partner';
