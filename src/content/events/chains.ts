import type { GameEvent } from '../../engine/types';

/**
 * CHAIN EVENTS — the payoff half of a delayed consequence.
 *
 * These are never drawn from the normal pool (`weight: 0` + a chain-only
 * guard). They appear only when something the player did months or years ago
 * catches up with them. Each one should make the player say "oh no" out loud,
 * which is the entire design goal of the whole project.
 */
export const chainEvents: GameEvent[] = [
  {
    id: 'chain_hr_investigation',
    title: 'HR WOULD LIKE A WORD',
    body: `The invitation is in your calendar with the subject "Informal Catch-Up" and a meeting room that is the small one with no windows.

There are two people in it. One of them has a notepad, which means this is not informal, and one of them is from a department that does not attend catch-ups.`,
    art: 'office_hr',
    cat: 'workplace',
    weight: 0,
    cooldown: 0,
    priority: 5,
    when: { career: { employed: true } },
    choices: [
      {
        text: 'Be completely honest about everything',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU TOLD THEM EVERYTHING',
            body: `It takes forty minutes and you can feel your own voice doing strange things, and about halfway through the person with the notepad stops writing, which is either very good or very bad.

They thank you for your candour. Then you wait nine days.`,
            tone: 'mixed',
            fx: { stress: 18, reputation: 6, career: -4, npc: { boss_gary: 4 }, counter: { integrity: 1 } },
            delayed: [
              {
                inMonths: 1,
                chance: 0.7,
                title: 'A WRITTEN WARNING AND NOTHING ELSE',
                body: `No further action. A note on your record, an expectation of better judgement, and a genuine opportunity to be a different employee from here.`,
                tone: 'mixed',
                fx: { stress: -10, career: -2, reputation: 4 },
              },
              {
                inMonths: 1,
                chance: 0.3,
                title: 'THEY WERE ACTUALLY AFTER SOMETHING ELSE',
                body: `Your honesty made you the most reliable witness in an investigation about somebody two levels above you, and you had no idea it was happening.`,
                tone: 'good',
                fx: { reputation: 14, career: 6, npc: { boss_gary: -20 }, happiness: 6 },
              },
            ],
          },
        ],
      },
      {
        text: 'Deny everything, confidently',
        tag: 'bold',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'YOU DENIED IT ALL',
            body: `You are calm, specific, and consistent. You have clearly thought about this, which you have, for weeks.

The person with the notepad writes four words and closes it. What you do not know is that there is a timestamp on a server somewhere with your name on it.`,
            tone: 'bad',
            fx: { stress: 24, career: -8, reputation: -6, flag: { deniedToHR: 1 } },
            delayed: [
              {
                inMonths: 2,
                chance: 0.65,
                title: 'THEY HAD THE RECEIPTS',
                body: `A formal meeting, a printed page, and a date that matches. The lie is now the offence, and it is a bigger one than the original.`,
                tone: 'bad',
                art: 'office_fired',
                fx: { career: -22, reputation: -18, stress: 34, setCareer: null, happiness: -18, counter: { jobsLost: 1 }, flag: { employed: false } },
              },
            ],
          },
        ],
      },
      {
        text: 'Blame a process failure and volunteer to fix it',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU OFFERED A SOLUTION TO A PROBLEM YOU CAUSED',
            body: `It is genuinely audacious. You arrive with a proposed policy, a process diagram, and a tone of enthusiastic remediation.

They accept it. They are actually impressed. You have just spent forty minutes turning a misconduct meeting into a project.`,
            tone: 'good',
            fx: { career: 4, reputation: 8, stress: 12, flag: { turnedItAround: 1 } },
          },
        ],
      },
      {
        text: 'Resign on the spot',
        tag: 'chaotic',
        highRisk: true,
        time: 2,
        outcomes: [
          {
            title: 'YOU WALKED, MID-MEETING',
            body: `Fifteen minutes in, you stand up and say the words, and there is a silence of a very specific quality, and then the person from HR says "I would strongly advise you to sit back down."

You do not sit back down.`,
            tone: 'chaos',
            fx: {
              career: -18,
              stress: 20,
              happiness: 8,
              setCareer: null,
              flag: { employed: false, dramaticExit: 1 },
              counter: { quitJobs: 1, chaos: 1 },
              log: 'Walked out of an HR meeting',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'chain_hr_found_something',
    title: 'HR FOUND SOMETHING',
    body: `Your new employer is auditing employment history. It is routine — they do it for everyone at your level — and it takes them into a system at your previous employer, and it produces a set of dates that do not match the dates you wrote on a form three years ago.

The email says: "Could you give us a call at your convenience?"`,
    art: 'office_hr',
    cat: 'career',
    weight: 0,
    cooldown: 0,
    priority: 6,
    when: { career: { employed: true } },
    choices: [
      {
        text: 'Admit it. Explain exactly what happened.',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU TOLD THEM THE TRUTH',
            body: `You explain the gap, the reasons, the fear that produced the lie, and you do it without dressing it up, which takes genuine effort.

There is a long pause on the call. "Thank you for being straight with us," they say. "Most people aren't."`,
            tone: 'mixed',
            fx: { stress: 22, reputation: 6, career: -4, counter: { integrity: 1 } },
            delayed: [
              { inMonths: 1, chance: 0.7, title: 'IT WAS NOTED AND NOT MORE', body: `A note on your file, an amended form, and a manager who now knows something about your character that is genuinely useful.`, tone: 'good', fx: { stress: -16, career: 4, reputation: 8, happiness: 8 } },
              { inMonths: 1, chance: 0.3, title: 'THE POLICY IS THE POLICY', body: `Falsification of an application is a dismissable offence and they are genuinely sorry and they are also genuinely going to apply it.`, tone: 'bad', art: 'office_fired', fx: { career: -24, stress: 34, setCareer: null, happiness: -20, counter: { jobsLost: 1 }, flag: { employed: false } } },
            ],
          },
        ],
      },
      {
        text: 'Double down. Insist the dates are right.',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'YOU DOUBLED DOWN',
            body: `You cite a system migration, a merger, a period of chaos at the old company. It is a genuinely well-constructed argument and you deliver it with conviction.

They say they will look into it. That is the worst possible answer.`,
            tone: 'chaos',
            fx: { stress: 28, reputation: -8, counter: { chaos: 1 }, flag: { doubledDown: 1 } },
            delayed: [
              {
                inMonths: 2,
                chance: 0.7,
                title: 'THEY LOOKED INTO IT',
                body: `They spoke to somebody at the old company. There was no migration and no merger and the person who confirmed that was your old manager, who enjoyed it.`,
                tone: 'bad',
                art: 'office_fired',
                fx: { career: -25, reputation: -20, stress: 34, setCareer: null, happiness: -20, counter: { jobsLost: 1 }, flag: { employed: false } },
              },
            ],
          },
        ],
      },
      {
        text: 'Resign before they can decide',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU GOT THERE FIRST',
            body: `You resign in writing before the second call, which denies them the satisfaction and costs you the severance and the reference.

You have maintained control of a situation you entirely created, which is a small and expensive dignity.`,
            tone: 'mixed',
            fx: { career: -16, stress: 22, happiness: -8, setCareer: null, reputation: -4, counter: { quitJobs: 1 }, flag: { employed: false, resignedFirst: 1 } },
          },
        ],
      },
      {
        text: 'Blame the old employer publicly',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'YOU POSTED ABOUT IT',
            body: `A post about an old employer's record-keeping, which is genuinely a real problem, and which also contains enough detail for anyone who cares to work out exactly which employee is complaining.

HR reads it within four hours.`,
            tone: 'chaos',
            fx: { reputation: -18, stress: 30, career: -12, counter: { chaos: 1 } },
            delayed: [
              {
                inMonths: 1,
                chance: 0.75,
                title: 'THAT WAS THE WRONG LEVER',
                body: `The post is the reason, and the reason is written down, and you will be explaining that post in interviews for two years.`,
                tone: 'bad',
                fx: { career: -20, reputation: -16, stress: 30, setCareer: null, happiness: -16, counter: { jobsLost: 1 }, flag: { employed: false } },
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'chain_layoff',
    title: 'THE SECOND ROUND',
    body: `The calendar invite goes out at 15:40 with no agenda and a title that is a single word, and everybody in the building knows exactly what the single word means.

Your name is on the list. So is the person next to you. So is the person who has been here nineteen years and whose whole life is this building.`,
    art: 'office_layoff',
    cat: 'workplace',
    weight: 0,
    cooldown: 0,
    priority: 5,
    when: { career: { employed: true } },
    choices: [
      {
        text: 'Take the package. Leave well.',
        tag: 'smart',
        time: 2,
        outcomes: [
          {
            title: 'YOU TOOK IT AND SAID GOODBYE PROPERLY',
            body: `You shake four hands, you write one genuinely warm email to the team, and you take the plant.

Three months' money and a reference. You are out of the building by 16:20 with more dignity than the process deserved.`,
            tone: 'mixed',
            fx: {
              money: 7800,
              career: -12,
              stress: 14,
              setCareer: null,
              flag: { employed: false },
              counter: { jobsLost: 1 },
              log: 'Laid off',
            },
            delayed: [
              {
                inMonths: 4,
                chance: 0.55,
                title: 'SOMEONE FROM THE OLD PLACE CALLED',
                body: `Not HR. A former colleague who has landed somewhere better and needs somebody they trust.`,
                tone: 'good',
                fx: { career: 14, money: 2000, income: 400, happiness: 12, setCareer: { path: 'technology', level: 1 } },
              },
            ],
          },
        ],
      },
      {
        text: 'Point out loudly that this was a management failure',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'YOU SAID IT IN THE MEETING',
            body: `It is entirely true and it is entirely true at the wrong moment, to a room containing the people who made the decision and the people who are about to lose their jobs.

Four people message you afterwards. One of them says "you're my hero." The other three say "are you okay."`,
            tone: 'chaos',
            fx: {
              reputation: 8,
              career: -16,
              stress: 22,
              happiness: 6,
              setCareer: null,
              flag: { employed: false, wentDownLoud: 1 },
              counter: { jobsLost: 1, chaos: 1 },
            },
            delayed: [
              {
                inMonths: 7,
                chance: 0.4,
                title: 'IT MADE YOU UNHIRABLE IN ONE SPECIFIC NETWORK',
                body: `A recruiter, gently: "I've heard your name come up in a couple of rooms and the feedback isn't about your work."`,
                tone: 'bad',
                fx: { career: -10, stress: 18, happiness: -8 },
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'chain_double_life_caught',
    title: 'TWO CALENDARS, ONE PERSON',
    body: `Both of them have scheduled an all-hands. Same day. Same hour. Both mandatory. Both with the camera rules that suggest attendance is being monitored.

You have two laptops, one headset, and a genuinely interesting engineering problem in front of you.`,
    art: 'office_meeting',
    cat: 'workplace',
    weight: 0,
    cooldown: 0,
    priority: 6,
    when: {},
    choices: [
      {
        text: 'Dial in to both, muted, and improvise',
        tag: 'risky',
        highRisk: true,
        time: 1,
        outcomes: [
          { weight: 5, variance: 1, title: 'YOU PULLED IT OFF', body: `Two ears, two screens, one microphone carefully disabled. Neither meeting asks you a direct question, which is the entire skill.`, tone: 'good', fx: { money: 2800, stress: 22, happiness: 6, counter: { chaos: 1 } } },
          {
            weight: 5,
            variance: 1,
            title: 'BOTH OF THEM SAID YOUR NAME',
            body: `At the same time. You unmute to answer one and answer it into the other, and there is a pause, and then a voice says "— are you with us?"`,
            tone: 'bad',
            fx: { reputation: -20, stress: 34, happiness: -16, counter: { chaos: 1 }, flag: { twoJobsBlown: 1 }, money: -3000 },
            delayed: [
              {
                inMonths: 1,
                chance: 0.8,
                title: 'BOTH EMPLOYERS FOUND OUT',
                body: `Two separate meetings, two separate conversations, and the same conclusion reached independently in two buildings.`,
                tone: 'bad',
                art: 'office_fired',
                fx: { career: -24, stress: 34, setCareer: null, happiness: -20, counter: { jobsLost: 2 }, flag: { employed: false } },
              },
            ],
          },
        ],
      },
      {
        text: 'Quit the boring one. Keep the other.',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU CHOSE ONE',
            body: `You resign from the one you have been attending with your camera off, and for about six weeks you miss the money, and then a year of genuinely good work at the other one produces a raise that closes most of the gap.`,
            tone: 'good',
            fx: { money: -1200, income: -2800, stress: -18, happiness: 10, career: 8, flag: { twoJobs: 0 } },
          },
        ],
      },
      {
        text: 'Fake an illness for one and attend the other',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'YOU WERE SUDDENLY UNWELL',
            body: `Your acting is genuinely poor and the message is genuinely convincing, which tells you something about corporate life.

You have bought four weeks. Four weeks is a strategy, not a solution.`,
            tone: 'chaos',
            fx: { stress: 24, money: 2800, counter: { chaos: 1 }, flag: { dodged: 1 } },
            delayed: [
              {
                inMonths: 2,
                chance: 0.6,
                title: 'IT HAPPENED AGAIN',
                body: `A third overlap. And this time you have already used the illness, and the calendar is not getting any better.`,
                tone: 'bad',
                fx: { stress: 30, reputation: -12, money: -3000 },
                queue: [{ id: 'chain_double_life_caught', inMonths: 1 }],
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'chain_money_letters',
    title: 'THE LETTERS HAVE STARTED',
    body: `The first one is from a cousin you have met twice, asking for "a small helping hand, nothing major."

The second one is from a man you went to school with, with a business plan attached, and a paragraph about how "you always had a good head for this."

They both know. You do not know how they know.`,
    art: 'money_letters',
    cat: 'money',
    weight: 0,
    cooldown: 0,
    priority: 4,
    when: {},
    choices: [
      {
        text: 'Help the ones who genuinely need it. Refuse the rest.',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU DREW A LINE',
            body: `You work out, over one evening and a spreadsheet, a policy: family emergencies yes, business ideas no, and a number you are willing to lose.

You tell four people. Two are relieved, one is hurt, one does not reply.`,
            tone: 'good',
            fx: { money: -4000, happiness: 8, reputation: 8, karma: 10, relationships: 4, counter: { sensible: 1 } },
          },
        ],
      },
      {
        text: 'Give to everyone who asks',
        tag: 'kind',
        time: 2,
        outcomes: [
          {
            title: 'YOU GAVE TO ALL OF THEM',
            body: `Eleven people in fourteen months. Some of it is genuinely needed and some of it is genuinely a boat.

The word gets out, because the word always gets out, and the twelfth request arrives while you are still reading the eleventh.`,
            tone: 'mixed',
            fx: { money: -22000, happiness: 4, karma: 14, reputation: 10, stress: 14, flag: { generous: 1 } },
            delayed: [
              {
                inMonths: 10,
                chance: 0.5,
                title: 'IT NEVER STOPPED',
                body: `You have not spoken to a genuinely new person in a year without wondering, in the first four minutes, what they are going to ask for.`,
                tone: 'bad',
                fx: { stress: 22, happiness: -14, relationships: -8 },
              },
            ],
          },
        ],
      },
      {
        text: 'Tell everyone the money is gone',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU SAID IT WAS GONE',
            body: `It is not true and it is extremely effective. The requests stop within about a fortnight, and so do most of the messages, and you have learned something genuinely useful about the shape of the previous six months.`,
            tone: 'mixed',
            fx: { happiness: -6, reputation: -8, stress: -14, relationships: -6 },
          },
        ],
      },
    ],
  },

  {
    id: 'chain_market_crash',
    title: 'THE MARKET IS DOWN THIRTY PERCENT',
    body: `Six weeks. Everything you own is worth significantly less than it was and there is a specific graph that everybody has begun sending to everybody else.

Your own position is a number you have not looked at since Tuesday, which is two days before the worst of it.`,
    art: 'invest_crash',
    cat: 'investing',
    weight: 0,
    cooldown: 24,
    priority: 5,
    when: {},
    choices: [
      {
        text: 'Hold. Do not look at it for six months.',
        tag: 'smart',
        time: 6,
        outcomes: [
          {
            title: 'YOU HELD',
            body: `You delete the app in a genuinely dramatic gesture and then reinstall it in eleven days. Then you delete it again, properly, and you do not look for six months.

When you finally do, it is down 11% from the peak and up 4% from where you bought. The whole crisis was, on the graph, a small dent.`,
            tone: 'good',
            fx: { stress: -14, happiness: 10, counter: { diamondHands: 1 }, flag: { marketCrashDone: 1 } },
          },
        ],
      },
      {
        text: 'Sell everything and protect what is left',
        tag: 'risky',
        time: 1,
        outcomes: [
          {
            title: 'YOU SOLD INTO IT',
            body: `You get out at a number that feels like safety and is, in fact, a decision you will be describing to yourself for five years.

The relief is genuine, immediate and temporary.`,
            tone: 'bad',
            fx: { money: -12000, stress: 10, happiness: -14, counter: { panicSold: 1 }, flag: { marketCrashDone: 1 } },
            delayed: [
              {
                inMonths: 18,
                chance: 0.75,
                title: 'IT RECOVERED WITHOUT YOU',
                body: `Higher than the peak you sold at. You did not lose the money so much as refuse to have it.`,
                tone: 'bad',
                fx: { happiness: -12, stress: 12, counter: { wiser: 1 } },
              },
            ],
          },
        ],
      },
      {
        text: 'Buy aggressively into the fall',
        tag: 'chaotic',
        highRisk: true,
        time: 2,
        requires: { minCash: 5000 },
        outcomes: [
          { weight: 6, variance: 1, title: 'YOU BOUGHT IT ALL', body: `Twenty months later the position is up 78% and you are insufferable at dinner parties for approximately one year.`, tone: 'good', fx: { money: 42000, happiness: 20, reputation: 10, counter: { bigWins: 1, diamondHands: 1 }, flag: { marketCrashDone: 1 } } },
          { weight: 4, variance: 1, title: 'IT FELL FURTHER AND YOU RAN OUT', body: `You had committed everything you could and the bottom was another 14% below where you stopped being able to buy. That is the definition of a bad month.`, tone: 'bad', fx: { money: -5000, stress: 30, happiness: -16, counter: { losses: 1 }, flag: { marketCrashDone: 1 } } },
        ],
      },
    ],
  },

  {
    id: 'chain_family_care',
    title: 'IT HAS PROGRESSED',
    body: `The specialist uses a phrase with a number in it, which is how these things are communicated. It is not a long number.

Your mother is asking about the traffic on the way here.`,
    art: 'family_hospital',
    cat: 'family',
    weight: 0,
    cooldown: 0,
    priority: 5,
    when: {},
    choices: [
      {
        text: 'Become the person who organises everything',
        tag: 'kind',
        time: 3,
        outcomes: [
          {
            title: 'YOU TOOK IT ON',
            body: `Power of attorney, a folder, a medication list, a calendar of appointments, and a group chat with your brother in which you are, entirely by accident, the manager.

You are brilliant at it and it costs you a year of your life that you do not notice losing until afterwards.`,
            tone: 'mixed',
            fx: { stress: 30, happiness: -8, health: -10, energy: -18, npc: { mum: 24, dad: 20, brother_eli: 20 }, relationships: 10, karma: 16, milestone: 'Held the family together' },
          },
        ],
      },
      {
        text: 'Pay for help. Buy time.',
        tag: 'smart',
        time: 3,
        requires: { minCash: 6000 },
        outcomes: [
          {
            title: 'YOU BOUGHT THE HELP',
            body: `A carer four days a week, a cleaner, a driver. It is a genuinely enormous amount of money and it returns to you the thing that was actually running out, which was attention.

You visit on Sundays and you are present, rather than being there every day and being exhausted.`,
            tone: 'good',
            fx: { money: -18000, expense: 1400, stress: 12, npc: { mum: 20, dad: 16 }, happiness: 6, health: 4, counter: { sensible: 1 } },
            delayed: [
              {
                inMonths: 24,
                chance: 0.6,
                title: 'THE CARE ENDED',
                body: `Not with a crisis. With a phone call in the middle of a working morning, and a fortnight of arrangements, and then a bank transfer that no longer goes out on the first of the month.`,
                tone: 'bad',
                fx: { expense: -1400, stress: 18, happiness: -14, npc: { mum: -100 } },
              },
            ],
          },
        ],
      },
      {
        text: 'Step back and let the professionals lead',
        tag: 'safe',
        time: 2,
        outcomes: [
          {
            title: 'YOU STEPPED BACK',
            body: `You visit. You are warm. You do not take any of the appointments and you do not learn the medication names, and this is a completely defensible position that you will revisit at 3am for the next decade.`,
            tone: 'mixed',
            fx: { stress: 8, happiness: -12, npc: { mum: 4, dad: 2, brother_eli: -14 }, health: 4 },
          },
        ],
      },
    ],
  },

  {
    id: 'chain_big_money_friends',
    title: 'EVERYONE YOU HAVE EVER MET HAS AN IDEA',
    body: `Fourteen messages in nine days. Two are genuinely good. Four are someone else's business plan with your name at the top. Eight are a version of the same sentence, which begins "you're the only person I know who..."`,
    art: 'money_letters',
    cat: 'money',
    weight: 0,
    cooldown: 0,
    priority: 4,
    when: {},
    choices: [
      {
        text: 'Fund two properly. Sign real paperwork.',
        tag: 'smart',
        time: 3,
        outcomes: [
          { weight: 4, variance: 1, title: 'ONE OF THEM WORKED', body: `The boring one, obviously. The one with a real product and a real customer and no manifesto. You are up 3.1x on the pair and have learned that your instincts are worth less than your diligence.`, tone: 'good', fx: { money: 320000, happiness: 18, reputation: 18, counter: { bigWins: 1 } } },
          { weight: 6, variance: 1, title: 'BOTH OF THEM FAILED', body: `Genuinely, boringly, expensively failed. One of them did not return calls for four months and then apologised in a message that was mostly about their own feelings.`, tone: 'bad', fx: { money: -180000, stress: 24, happiness: -12, relationships: -8, counter: { losses: 1 } } },
        ],
      },
      {
        text: 'Invest in nothing and tell them why',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU REFUSED ALL FOURTEEN',
            body: `"This isn't something I do," which is clean, repeatable, and true, and which ends about half the relationships without a single argument.

The half that remain are the good half.`,
            tone: 'good',
            fx: { relationships: -8, happiness: 4, stress: -12, reputation: 4, counter: { sensible: 1 } },
          },
        ],
      },
      {
        text: 'Give a large amount to a friend with nothing in writing',
        tag: 'chaotic',
        highRisk: true,
        time: 2,
        outcomes: [
          {
            title: 'YOU GAVE $200,000 TO A FRIEND ON A HANDSHAKE',
            body: `It was genuinely generous and genuinely insane, and you did it because they asked at a moment when you were feeling good about yourself.

There is nothing in writing. There has never been anything in writing.`,
            tone: 'chaos',
            fx: { money: -200000, karma: 10, happiness: -4, stress: 22, relationships: 8, counter: { chaos: 1 }, flag: { handshakeDeal: 1 } },
            delayed: [
              { inMonths: 14, chance: 0.4, title: 'THEY PAID YOU BACK AND BECAME RICH', body: `They send it back with a number attached that you did not ask for and did not expect, along with a note you keep.`, tone: 'good', fx: { money: 340000, happiness: 20, relationships: 14, reputation: 10, counter: { bigWins: 1 } } },
              { inMonths: 14, chance: 0.6, title: 'THE FRIENDSHIP DID NOT SURVIVE THE MONEY', body: `Not acrimonious. Just a slowness, and an avoidance, and an absence that both of you can explain in ways that are not quite true.`, tone: 'bad', fx: { money: -200000, relationships: -20, happiness: -18, stress: 24 } },
            ],
          },
        ],
      },
    ],
  },
];
