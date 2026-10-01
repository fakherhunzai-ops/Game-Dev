import type { NpcDef } from '../engine/types';

/**
 * The recurring cast. These people show up in dozens of events across decades
 * and remember what you did. Portraits are drawn procedurally by the UI from
 * the palette + hair style below, so the whole cast costs zero bytes.
 */
export const NPC_DEFS: NpcDef[] = [
  {
    id: 'jess',
    name: 'Jess',
    role: 'Best friend',
    bio: 'Met at nineteen. Has seen you at your absolute worst and stayed anyway.',
    palette: { skin: '#e3b08a', hair: '#3a2b2e', outfit: '#e8556d', accent: '#ffd166' },
    hairStyle: 'long',
    pronouns: 'she/her',
  },
  {
    id: 'marcus',
    name: 'Marcus',
    role: 'Friend',
    bio: 'Reliable, sensible, secretly keeps a spreadsheet of everyone he knows.',
    palette: { skin: '#8d5a3b', hair: '#1a1416', outfit: '#3ec9a7', accent: '#f0f4ff' },
    hairStyle: 'short',
    pronouns: 'he/him',
  },
  {
    id: 'chad',
    name: 'Chad',
    role: 'Friend (loosely)',
    bio: 'Every idea is huge. Every cheque is someone else\'s.',
    palette: { skin: '#f0c9a0', hair: '#c8952f', outfit: '#ff8a3d', accent: '#2b2340' },
    hairStyle: 'bob',
    pronouns: 'he/him',
  },
  {
    id: 'priya',
    name: 'Priya',
    role: 'Coworker',
    bio: 'Competent, quiet, and knows exactly what everyone in the office earns.',
    palette: { skin: '#a9714b', hair: '#20161d', outfit: '#6c8bff', accent: '#ffe066' },
    hairStyle: 'bun',
    pronouns: 'she/her',
  },
  {
    id: 'boss_gary',
    name: 'Gary Whitlock',
    role: 'Your manager',
    bio: 'Has a favourite mug that says WORLD\'S OKAYEST BOSS and genuinely believes it.',
    palette: { skin: '#dcae86', hair: '#6b6b6b', outfit: '#4a4f6a', accent: '#ff5c8a' },
    hairStyle: 'bald',
    pronouns: 'he/him',
  },
  {
    id: 'mum',
    name: 'Mum',
    role: 'Parent',
    bio: 'Has been right about your decisions since you were eleven. Never mentions it.',
    palette: { skin: '#d8a883', hair: '#5c4033', outfit: '#8e6bbf', accent: '#f7e4c8' },
    hairStyle: 'bob',
    pronouns: 'she/her',
  },
  {
    id: 'dad',
    name: 'Dad',
    role: 'Parent',
    bio: 'Communicates primarily through forwarded articles and a firm handshake.',
    palette: { skin: '#c99a72', hair: '#3f3a37', outfit: '#5f7a61', accent: '#e8e3d9' },
    hairStyle: 'short',
    pronouns: 'he/him',
  },
  {
    id: 'brother_eli',
    name: 'Eli',
    role: 'Sibling',
    bio: 'Two years younger and somehow already further ahead. Loves you. Knows it.',
    palette: { skin: '#e0b28d', hair: '#4a3a2c', outfit: '#f5b83d', accent: '#2b2340' },
    hairStyle: 'curls',
    pronouns: 'he/him',
  },
  {
    id: 'alex',
    name: 'Alex',
    role: 'Romance',
    bio: 'Warm, funny, asks uncomfortable questions about your five-year plan.',
    palette: { skin: '#f2c8a2', hair: '#7a4b2a', outfit: '#c56cff', accent: '#fff1d6' },
    hairStyle: 'long',
    pronouns: 'they/them',
  },
  {
    id: 'nora',
    name: 'Nora',
    role: 'Romance',
    bio: 'Direct to the point of being alarming. Excellent taste in terrible restaurants.',
    palette: { skin: '#b8794f', hair: '#171113', outfit: '#ff5c8a', accent: '#ffe066' },
    hairStyle: 'locs',
    pronouns: 'she/her',
  },
  {
    id: 'sam',
    name: 'Sam',
    role: 'Romance',
    bio: 'Kind, grounded, and quietly saving for something they have not told you about.',
    palette: { skin: '#e8c6a0', hair: '#c0a080', outfit: '#3ec9a7', accent: '#2b2340' },
    hairStyle: 'curls',
    pronouns: 'he/him',
  },
  {
    id: 'rina',
    name: 'Rina',
    role: 'Romance',
    bio: 'Brilliant, ambitious, and allergic to being anyone\'s second priority.',
    palette: { skin: '#dfa87f', hair: '#221a24', outfit: '#6c8bff', accent: '#ff8a3d' },
    hairStyle: 'bun',
    pronouns: 'she/her',
  },
  {
    id: 'dr_chen',
    name: 'Dr. Chen',
    role: 'Doctor',
    bio: 'Genuinely concerned. Not great at hiding it.',
    palette: { skin: '#e6c39f', hair: '#2a2a2e', outfit: '#e9eef6', accent: '#3ec9a7' },
    hairStyle: 'short',
    pronouns: 'she/her',
  },
  {
    id: 'investor_vera',
    name: 'Vera Sørensen',
    role: 'Investor',
    bio: 'Has funded four billion-dollar companies and eleven spectacular disasters. Same energy either way.',
    palette: { skin: '#f0d0b0', hair: '#d8d4cc', outfit: '#2b2340', accent: '#f5b83d' },
    hairStyle: 'bob',
    pronouns: 'she/her',
  },
  {
    id: 'landlord_ray',
    name: 'Ray',
    role: 'Landlord',
    bio: 'Owns eleven properties and one very tired set of keys.',
    palette: { skin: '#c48d63', hair: '#8a8a8a', outfit: '#6b7280', accent: '#ff8a3d' },
    hairStyle: 'bald',
    pronouns: 'he/him',
  },
];

export const npcDef = (id: string): NpcDef | undefined => NPC_DEFS.find((n) => n.id === id);

export const ROMANCE_NPCS = ['alex', 'nora', 'sam', 'rina'];

/** Core relationships shown on the Relationships screen even before they matter. */
export const CORE_NPCS = [
  'jess',
  'marcus',
  'chad',
  'priya',
  'boss_gary',
  'mum',
  'dad',
  'brother_eli',
];
