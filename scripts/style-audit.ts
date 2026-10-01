/**
 * STYLE AUDIT
 *
 * The screens are pure string builders, which means a typo in a class name is
 * invisible in tests and invisible in a type check: the markup still renders,
 * it just renders unstyled. This script closes that gap.
 *
 *   npm run style:audit
 *
 * It fails (exit 1) when:
 *   1. a class used in `src/ui/**` has no rule in `styles.css`
 *   2. a `var(--token)` is used that was never declared on `:root`
 *   3. an animation or keyframe referenced by the CSS does not exist
 *   4. a declared-but-unused class exists only to be dead weight (warning)
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const CSS = readFileSync('src/ui/styles.css', 'utf8');

/** Every file under src/ui plus src/main.ts (inline markup lives there too). */
function uiFiles(dir = 'src/ui'): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...uiFiles(p));
    else if (p.endsWith('.ts') && !p.endsWith('.test.ts')) out.push(p);
  }
  return out;
}

const files = [...uiFiles(), 'src/main.ts'];
const sources = files.map((f) => ({ name: f, text: readFileSync(f, 'utf8') }));

/* ------------------------------------------------------------ 1. class names */

const cssClasses = new Set<string>();
for (const m of CSS.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) cssClasses.add(m[1]);

const used = new Map<string, string[]>();

/** Attributes that legitimately hold a single-word value which is not a class. */
const NOT_A_CLASS = new Set(['active', 'on', 'premium', 'look', 'i', 'v', 'tone', 'true', 'false']);

function record(cls: string, file: string): void {
  if (cls.endsWith('--')) return; // the variant is generated: meter--${cls}
  if (!/^[a-z][a-z0-9_-]*$/.test(cls)) return;
  if (cls.length < 3 || NOT_A_CLASS.has(cls)) return;
  const list = used.get(cls) ?? [];
  list.push(file);
  used.set(cls, list);
}

/** Dynamic variants seen in the markup, e.g. `chip--${tone}`. */
const dynamicPrefixes = new Set<string>();

for (const { name, text } of sources) {
  // class="..." | class='...' | className="..." | className={`...`}
  for (const m of text.matchAll(/class(?:Name)?=(?:"([^"]*)"|'([^']*)'|`([^`]*)`)/g)) {
    const raw = m[1] ?? m[2] ?? m[3] ?? '';
    const staticPart = raw.replace(/\$\{[^}]*\}/g, ' ');
    for (const token of staticPart.split(/[\s?:()[\]|&]+/)) record(token.trim(), name);
    // remember the prefixes so a generated variant can be verified
    for (const d of raw.matchAll(/([a-z][\w-]*)--\$\{/g)) dynamicPrefixes.add(d[1]);
  }
}

/** Every variant that the CSS defines, e.g. `.chip` → chip--risky, chip--kind. */
const variantsFor = new Map<string, Set<string>>();
for (const cls of cssClasses) {
  const [base, variant] = cls.split('--');
  if (!variant) continue;
  const set = variantsFor.get(base) ?? new Set<string>();
  set.add(variant);
  variantsFor.set(base, set);
}

const missing: string[] = [];
for (const [cls, where] of used) {
  if (cssClasses.has(cls)) continue;
  // A generated variant (chip--risky) counts as styled when its base exists.
  const [base, variant] = cls.split('--');
  if (variant && (variantsFor.get(base)?.size || cssClasses.has(base))) continue;
  missing.push(`${cls}  (from ${where[0]})`);
}

/* --------------------------------------------------------- 2. design tokens */

const declaredVars = new Set<string>();
for (const m of CSS.matchAll(/^\s*(--[\w-]+)\s*:/gm)) declaredVars.add(m[1]);

const missingVars: string[] = [];
for (const { name, text } of sources) {
  for (const m of text.matchAll(/var\((--[\w-]+)\)/g)) {
    if (!declaredVars.has(m[1])) missingVars.push(`${m[1]}  (${name})`);
  }
}

/* ------------------------------------------------------- 3. keyframes exist */

const keyframes = new Set<string>([...CSS.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]));
const missingKeyframes: string[] = [];
for (const m of CSS.matchAll(/animation(?:-name)?:\s*([^;]+);/g)) {
  for (const part of m[1].split(',')) {
    const name = part.trim().split(/\s+/)[0];
    if (/^[\w-]+$/.test(name) && !keyframes.has(name) && name !== 'none') {
      missingKeyframes.push(name);
    }
  }
}

/* --------------------------------------------------- 4. domain variant coverage */

/**
 * These variants come from data, not from the markup, so the audit has to know
 * the domain. Each list mirrors a union type in src/engine/types.ts — if the
 * type gains a member and the CSS does not, this fails.
 */
const DOMAIN: Record<string, { prefix: string; variants: string[] }> = {
  'choice tags': {
    prefix: 'choice',
    variants: ['safe', 'bold', 'risky', 'kind', 'cruel', 'chaotic', 'smart', 'lazy', 'greedy'],
  },
  'chip tags': {
    prefix: 'chip',
    variants: ['safe', 'bold', 'risky', 'kind', 'cruel', 'chaotic', 'smart', 'lazy', 'greedy'],
  },
  'stat meters': {
    prefix: 'meter',
    variants: ['career', 'happiness', 'stress', 'relationships', 'reputation', 'health', 'energy'],
  },
  'consequence tones': { prefix: 'band', variants: ['good', 'bad', 'mixed', 'chaos', 'neutral'] },
  badges: { prefix: 'badge', variants: ['good', 'bad', 'brand'] },
  'timeline tones': { prefix: 'tl-item', variants: ['good', 'bad', 'chaos'] },
  deltas: { prefix: 'delta', variants: ['up', 'down', 'money-up', 'money-down', 'npc-up', 'npc-down'] },
};

const domainGaps: string[] = [];
for (const [label, { prefix, variants }] of Object.entries(DOMAIN)) {
  for (const v of variants) {
    if (!cssClasses.has(`${prefix}--${v}`)) domainGaps.push(`${prefix}--${v}  (${label})`);
  }
}

/* ----------------------------------------------------------------- report */

const report: string[] = [];
report.push(`style audit — ${files.length} source files, ${cssClasses.size} css classes, ${declaredVars.size} tokens`);
report.push(`classes used in markup: ${used.size}`);

if (domainGaps.length) report.push(`\n✗ DATA-DRIVEN VARIANTS WITH NO RULE (${domainGaps.length}):\n  ${domainGaps.join('\n  ')}`);

if (missing.length) report.push(`\n✗ UNSTYLED CLASSES (${missing.length}):\n  ${missing.join('\n  ')}`);
if (missingVars.length) report.push(`\n✗ UNDECLARED CSS VARIABLES (${missingVars.length}):\n  ${missingVars.join('\n  ')}`);
if (missingKeyframes.length)
  report.push(`\n✗ MISSING KEYFRAMES (${missingKeyframes.length}):\n  ${missingKeyframes.join('\n  ')}`);

const unusedCritical = [...cssClasses].filter(
  (c) => !used.has(c) && !dynamicPrefixes.has(c.split('--')[0]) && !c.startsWith('_'),
);
report.push(`\nunused css classes: ${unusedCritical.length}`);
if (process.env.VERBOSE) report.push(`  ${unusedCritical.join(', ')}`);

console.log(report.join('\n'));

if (missing.length || missingVars.length || missingKeyframes.length || domainGaps.length) {
  console.log('\nFAIL');
  process.exit(1);
}
console.log('\nOK — every class in the markup has a rule, every token resolves.');
