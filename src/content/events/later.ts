import type { GameEvent } from '../../engine/types';

/**
 * LATER-LIFE + RESOLUTION EVENTS
 *
 * These are the cards that let a life end *deliberately* rather than by
 * attrition: retirement, downsizing, wills, legacy. They also provide the
 * release valves the economy needs (debt crisis) so a player can always
 * choose their way out of a spiral instead of watching it happen.
 */
export const resolutionEvents: GameEvent[] = [
  {
    id: 'chain_debt_crisis',
    title: 'THE DEBT HAS STOPPED BEING A NUMBER',
    body: `It is a set of behaviours now. You open post in a particular order. You recognise the area codes. There is a folder, and the folder has a name you gave it so that you would stop calling it "the bad folder."

The total is a figure you have stopped saying out loud, because saying it makes it real, and it has become more real than you can currently hold.`,
    art: 'money_debt',
    cat: 'money',
    weight: 0,
    cooldown: 0,
    priority: 6,
    when: { debt: [12_000, null] },
    choices: [
      {
        text: 'Consolidate, negotiate, and pay it down properly',
        tag: 'smart',
        time: 6,
        outcomes: [
          {
            title: 'YOU GOT A HANDLE ON IT',
            body: `Six hours of phone calls over four days, three negotiated reductions, one interest freeze, and a spreadsheet that is genuinely ugly and genuinely survivable.

It takes years. You pay it. The day the folder gets thrown away is not dramatic and it is one of the best days of your life.`,
            tone: 'good',
            fx: {
              debtPct: -0.35,
              stress: -18,
              happiness: 10,
              money: -1800,
              counter: { sensible: 1 },
              flag: { debtPlan: 1, debtCrisisQueued: 0 },
              log: 'Faced the debt',
            },
            delayed: [
              {
                inMonths: 34,
                chance: 0.65,
                title: 'THE FOLDER WENT IN THE BIN',
                body: `The final transfer clears and the balance reads zero and you sit looking at it for a while, and then do the genuinely extraordinary thing of not telling anybody at all.`,
                tone: 'good',
                fx: { debtPct: -0.6, happiness: 20, stress: -20, flag: { debtFree: 1 }, milestone: 'Cleared the debt' },
              },
            ],
          },
        ],
      },
      {
        text: 'Sell everything you own to clear it',
        tag: 'bold',
        time: 3,
        outcomes: [
          {
            title: 'YOU SOLD ALMOST EVERYTHING',
            body: `The car, the instruments, the good camera, three pieces of furniture you actually liked. It goes on a platform that takes 12% and it sells over nine weekends.

You clear a genuine chunk and you own almost nothing, and the lightness is genuinely extraordinary and slightly disorienting.`,
            tone: 'mixed',
            fx: {
              money: 9000,
              debt: -9000,
              happiness: 6,
              stress: -22,
              health: 4,
              flag: { debtCrisisQueued: 0 },
              milestone: 'Sold everything',
            },
          },
        ],
      },
      {
        text: 'Declare bankruptcy',
        tag: 'chaotic',
        highRisk: true,
        time: 6,
        outcomes: [
          {
            title: 'YOU WENT BANKRUPT',
            body: `A court date, a trustee, and a genuine and complete description of every asset and liability you have, given under oath.

It clears almost everything. It stays on your record for six years. Some of it — the house, if you have one, and a specific kind of relationship with credit and with yourself — does not come back.`,
            tone: 'chaos',
            fx: {
              debtPct: -0.95,
              money: -1200,
              stress: -20,
              happiness: -12,
              reputation: -16,
              flag: { bankrupt: 1, debtCrisisQueued: 0 },
              unlock: 'bankrupt',
              counter: { chaos: 1 },
              log: 'Declared bankruptcy',
            },
            delayed: [
              {
                inMonths: 24,
                chance: 0.6,
                title: 'IT FOLLOWED YOU',
                body: `A landlord, an application, a form with the question on it, and the specific pause of somebody reading a document about you in front of you.`,
                tone: 'bad',
                fx: { stress: 18, happiness: -8, reputation: -8 },
              },
            ],
          },
        ],
      },
      {
        text: 'Do nothing and hope the whole thing resolves itself',
        tag: 'lazy',
        time: 4,
        outcomes: [
          {
            title: 'YOU LET IT RUN',
            body: `Four more months. The letters get firmer and the phone calls get earlier in the day and the total gets larger without you doing anything at all, which is the trick of it.`,
            tone: 'bad',
            fx: { debt: 4200, stress: 20, happiness: -10, health: -4, flag: { debtCrisisQueued: 0 } },
          },
        ],
      },
    ],
  },

  {
    id: 'later_retire_early_decision',
    title: 'THE ARITHMETIC SAYS YOU COULD STOP',
    body: `You have run the numbers four times, on three different evenings, because the first three felt like a trick.

The number is not luxurious. It is sufficient. Which means the thing you have been telling yourself is impossible is currently a decision.`,
    art: 'later_retire',
    cat: 'career',
    weight: 12,
    cooldown: 999,
    priority: 4,
    when: {
      age: [38, 58],
      minNetWorth: 900_000,
      career: { employed: true },
      lacks: ['retired'],
    },
    choices: [
      {
        text: 'Stop. Hand in your notice.',
        tag: 'bold',
        time: 3,
        outcomes: [
          {
            title: 'YOU HANDED IN YOUR NOTICE AND MEANT IT',
            body: `Eleven weeks of handover and then a Tuesday with nothing in it, which is genuinely one of the strangest experiences available to an adult.

You spend the first two months sleeping and the third one realising that you have to build a life rather than stop living one.`,
            tone: 'good',
            fx: {
              stress: -30,
              happiness: 20,
              health: 12,
              energy: 16,
              setCareer: null,
              flag: { retired: 1, employed: false },
              milestone: 'Retired early',
              log: 'Retired early',
            },
          },
        ],
      },
      {
        text: 'Go part time. Ease out over two years.',
        tag: 'smart',
        time: 6,
        outcomes: [
          {
            title: 'YOU WENT TO THREE DAYS',
            body: `A negotiation that takes four meetings and could have taken one. Monday to Wednesday and a four-day weekend, every week, forever.

It is the single most effective thing you have ever done for your health and it cost you 40% of your income.`,
            tone: 'good',
            fx: { career: -6, salaryPct: -0.4, stress: -22, health: 12, happiness: 16, energy: 14, flag: { partTime: 1 } },
          },
        ],
      },
      {
        text: 'Keep working. What would you even do?',
        tag: 'safe',
        time: 2,
        outcomes: [
          {
            title: 'YOU KEPT WORKING',
            body: `Honestly asked and honestly answered: you would not know what to do. So you stay, and you are good at it, and the number gets bigger, and the question gets quieter.`,
            tone: 'mixed',
            fx: { career: 6, money: 6000, happiness: -4, stress: 8, flag: { keptWorking: 1 } },
          },
        ],
      },
    ],
  },

  {
    id: 'later_retirement_day',
    title: 'THE LAST DAY',
    body: `There is a card. There is a cake, which somebody ordered, and there is a speech which goes on slightly too long and contains one genuinely accurate thing about you.

You have been in this building for eighteen years. Tomorrow there is nothing in the calendar.`,
    art: 'later_retire',
    cat: 'career',
    weight: 14,
    cooldown: 999,
    priority: 4,
    when: { age: [58, 76], career: { employed: true } },
    choices: [
      {
        text: 'Retire properly. Do the handover. Cry a bit.',
        tag: 'kind',
        time: 4,
        outcomes: [
          {
            title: 'YOU RETIRED ON A FRIDAY',
            body: `You do the handover properly — two weeks of notes and a genuine conversation with your replacement about which meetings to kill.

On Friday you walk out with a box and stand on the pavement and do not know which way to turn, and a colleague you have worked with for eleven years walks you to the station and does not say anything the whole way, which is the most useful thing anybody could have done.`,
            tone: 'good',
            fx: {
              stress: -28,
              happiness: 18,
              health: 10,
              energy: 14,
              setCareer: null,
              flag: { retired: 1, employed: false },
              milestone: 'Retired',
              log: 'Retired',
            },
          },
        ],
      },
      {
        text: 'Retire, and immediately take a part-time job somewhere unrelated',
        tag: 'smart',
        time: 4,
        outcomes: [
          {
            title: 'YOU RETIRED AND GOT A JOB IN A SHOP',
            body: `Three days a week, terrible pay, and a set of colleagues who have no idea what you used to do and do not care.

You stack shelves and you talk to people and you are, genuinely, the happiest you have been at work in twenty years.`,
            tone: 'good',
            fx: {
              stress: -24,
              happiness: 22,
              health: 10,
              income: 900,
              flag: { retired: 1, secondAct: 1 },
              milestone: 'Retired into something else',
            },
          },
        ],
      },
      {
        text: 'Stay on as a consultant. Two days a week.',
        tag: 'safe',
        time: 6,
        outcomes: [
          {
            title: 'YOU DID THE CONSULTING THING',
            body: `Two days a week, an absurd day rate, and a genuine resentment from the people who now have your job and are being told what to do by you on Wednesdays.

The money is excellent. It stretches the leaving-out over four years and it is not entirely clear that this helped.`,
            tone: 'mixed',
            fx: { income: 3400, stress: 6, health: -4, happiness: 4, flag: { consultantRetirement: 1 }, milestone: 'Retired (sort of)' },
          },
        ],
      },
    ],
  },

  {
    id: 'later_the_will',
    title: 'YOU ARE WRITING A WILL',
    body: `A solicitor, a form, and a question that turns out to be much harder than it should be: who gets it.

You are not ill. You are not old, particularly. You are simply at the age where the people around you have started doing this, and one of them has just died.`,
    art: 'later_will',
    cat: 'family',
    weight: 12,
    cooldown: 999,
    when: { age: [42, 78], minNetWorth: 40_000 },
    choices: [
      {
        text: 'Split it evenly among the family',
        tag: 'kind',
        time: 1,
        outcomes: [
          {
            title: 'YOU SPLIT IT EVENLY',
            body: `A simple, boring, watertight document that says what people would expect it to say. It costs $600 and takes ninety minutes and it spares the people you love a genuinely enormous amount of pain.`,
            tone: 'good',
            fx: { money: -600, stress: -12, happiness: 8, karma: 10, flag: { willFamily: 1 }, milestone: 'Made a will' },
          },
        ],
      },
      {
        text: 'Leave most of it to one person and explain why in the document',
        tag: 'bold',
        time: 2,
        outcomes: [
          {
            title: 'YOU WROTE IT DOWN, IN FULL',
            body: `Four pages of reasoning attached to the will, addressed to everybody, saying the true version of why. It is uncomfortable to write and it will be uncomfortable to read and it is significantly better than the alternative.`,
            tone: 'mixed',
            fx: { money: -600, stress: 8, relationships: -4, happiness: 4, flag: { willExplained: 1 }, milestone: 'Made a will' },
          },
        ],
      },
      {
        text: 'Leave a chunk to something that mattered to you',
        tag: 'kind',
        time: 1,
        outcomes: [
          {
            title: 'YOU LEFT A THIRD OF IT AWAY FROM YOUR FAMILY',
            body: `A charity, or a scholarship, or a small arts fund in a specific city. You do not tell anybody about it and you find you enjoy not telling them rather more than you expected.`,
            tone: 'good',
            fx: { money: -600, karma: 16, happiness: 12, reputation: 8, flag: { legacyGift: 1 }, milestone: 'Left a legacy' },
          },
        ],
      },
      {
        text: 'Do not write one. You will get to it.',
        tag: 'lazy',
        time: 3,
        outcomes: [
          {
            title: 'YOU DID NOT DO IT',
            body: `It stays on a list that also contains the boiler service and a dentist appointment, and it stays there for four years.

The people you leave behind will spend eighteen months sorting out something you could have finished in an afternoon.`,
            tone: 'bad',
            fx: { stress: 8, happiness: -4, karma: -8, flag: { noWill: 1 } },
          },
        ],
      },
    ],
  },

  {
    id: 'later_legacy_checkin',
    title: 'SOMEBODY YOUNGER ASKS FOR YOUR ADVICE',
    body: `A person of about twenty-five sits across from you and asks, genuinely, what you would do differently. They have a notebook. They are not doing it as a bit.

You have approximately fourteen seconds before you have to say something true.`,
    art: 'later_advice',
    cat: 'social',
    weight: 12,
    cooldown: 999,
    when: { age: [52, 80] },
    choices: [
      {
        text: 'Tell them the thing you actually know',
        tag: 'kind',
        time: 1,
        outcomes: [
          {
            title: 'YOU TOLD THEM THE REAL THING',
            body: `Not the career advice. The other thing — about the years and the people and the specific expense that turned out not to matter at all.

They write it down. Twenty years later they tell somebody else, and attribute it to you.`,
            tone: 'good',
            fx: { happiness: 16, reputation: 8, karma: 12, stress: -6, flag: { passedItOn: 1 }, milestone: 'Passed it on' },
          },
        ],
      },
      {
        text: 'Give them a list of practical, tactical advice',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU GAVE THEM THE LIST',
            body: `Negotiate the first offer. Put money in the boring fund. Learn the name of everybody on the team. Never resign in the same conversation.

It is genuinely useful and it is not what they came for.`,
            tone: 'good',
            fx: { career: 4, reputation: 6, happiness: 6, karma: 4 },
          },
        ],
      },
      {
        text: 'Tell them not to ask people over fifty for advice',
        tag: 'chaotic',
        time: 1,
        outcomes: [
          {
            title: 'YOU TOLD THEM TO IGNORE YOU',
            body: `"Everyone my age is describing a world that stopped existing in 2004. Ask somebody who is thirty."

They laugh, write it down anyway, and genuinely take the advice, which turns out to be the most useful thing you could have said.`,
            tone: 'good',
            fx: { happiness: 12, reputation: 6, karma: 6, stress: -8, flag: { passedItOn: 1 } },
          },
        ],
      },
    ],
  },
];
