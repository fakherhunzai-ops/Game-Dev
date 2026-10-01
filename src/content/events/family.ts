import type { GameEvent } from '../../engine/types';

/**
 * FAMILY
 *
 * Parents, siblings, and the slow reversal where you become the one who
 * worries. Family events are the ones players tell us made them feel something,
 * which is an odd outcome for a comedy.
 */
export const familyEvents: GameEvent[] = [
  {
    id: 'family_parents_aging',
    title: 'YOUR {mom} HAS STARTED FORGETTING THINGS',
    body: `Small things. A name. Where the keys were. The word for the thing you use to open a tin.

She laughs it off. Your {sibling} has noticed too and has not said anything, which is how you know it is real.`,
    art: 'family_elder',
    cat: 'family',
    weight: 13,
    cooldown: 60,
    when: { age: [30, 62], stats: { stress: [0, 90] } },
    choices: [
      {
        text: 'Go home. Take a week. Sit with it.',
        tag: 'kind',
        time: 2,
        outcomes: [
          {
            title: 'YOU WENT HOME FOR A WEEK',
            body: `You sit in the kitchen and let her tell you about the neighbour's conservatory for forty minutes, and then you go to the doctor with her, and then you sit in a car park and do the arithmetic about what this is going to look like in five years.

Nothing is diagnosed. A referral is made. On the last evening your dad shakes your hand at the door, which he has done since you were eleven, and it means something different now.`,
            tone: 'mixed',
            fx: {
              npc: { mum: 20, dad: 14, brother_eli: 10 },
              happiness: 4,
              stress: 16,
              money: -900,
              karma: 8,
              flag: { wentHome: 1 },
              counter: { familySupport: 1 },
            },
            delayed: [
              {
                inMonths: 16,
                chance: 0.6,
                title: 'THE DIAGNOSIS, EVENTUALLY',
                body: `It arrives by phone on a Wednesday. Your mother describes it in her own words — "they think it's the memory one, you know the one" — and then asks what you are having for dinner.`,
                tone: 'bad',
                art: 'family_hospital',
                fx: { stress: 24, happiness: -14, npc: { mum: 10, dad: 10 } },
                queue: [{ id: 'chain_family_care', inMonths: 3 }],
              },
            ],
          },
        ],
      },
      {
        text: 'Call more often. From a distance.',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU CALLED TWICE A WEEK',
            body: `Genuine calls, twenty minutes, not just logistics. She starts telling you things she has never told you — about her twenties, about her mother, about money.

It is not the same as being there and it is a great deal more than nothing.`,
            tone: 'good',
            fx: { npc: { mum: 14 }, happiness: 8, stress: 6, karma: 5 },
          },
        ],
      },
      {
        text: 'Let your {sibling} handle it. He lives closer.',
        tag: 'lazy',
        time: 1,
        outcomes: [
          {
            title: 'ELI IS HANDLING IT',
            body: `He is, genuinely, handling it, and he never once complains, which is somehow the hardest part.

At a family lunch he says "it's fine, I'm the one who's here" in a completely neutral tone and everyone at the table hears it.`,
            tone: 'bad',
            fx: { npc: { brother_eli: -18, mum: -8 }, happiness: -8, stress: 10, flag: { passedTheBuck: 1 } },
            delayed: [
              {
                inMonths: 14,
                chance: 0.55,
                title: 'HE BROKE, QUIETLY',
                body: `A message at 2am, four paragraphs, apologising twice for sending it. He is twenty-nine, he has been doing this alone, and it has been going on for eight months longer than anyone realised.`,
                tone: 'bad',
                fx: { stress: 20, happiness: -12, npc: { brother_eli: -6 } },
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'family_sibling_success',
    title: 'YOUR BROTHER HAS DONE WELL',
    body: `He tells you at a family lunch, modestly, and your mother says "isn't that wonderful" three separate times, and the whole table turns to you with the same unspoken follow-up question.

He is not being smug. That is what makes it difficult.`,
    art: 'family_lunch',
    cat: 'family',
    weight: 12,
    cooldown: 48,
    when: { age: [24, 60] },
    choices: [
      {
        text: 'Be genuinely, unreservedly pleased',
        tag: 'kind',
        time: 1,
        outcomes: [
          {
            title: 'YOU WERE ACTUALLY PLEASED',
            body: `You mean it. You ask him real questions and you listen to the answers and at the end you say "that's genuinely brilliant" and he goes slightly red.

Something improves between you permanently that afternoon. He remembers it when it matters.`,
            tone: 'good',
            fx: {
              npc: { brother_eli: 22, mum: 12, dad: 8 },
              happiness: 10,
              stress: -6,
              relationships: 8,
              remember: { brother_eli: 'You were genuinely pleased for him in front of everybody.' },
            },
            delayed: [
              {
                inMonths: 20,
                chance: 0.5,
                title: 'HE PUT YOUR NAME FORWARD',
                body: `A role, or a client, or a contact — he does not make a thing of it. He simply says "my brother does that" in a room you are not in.`,
                tone: 'good',
                fx: { career: 14, money: 3000, happiness: 10, npc: { brother_eli: 10 } },
              },
            ],
          },
        ],
      },
      {
        text: 'Make a joke about it. Deflect.',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU MADE THE JOKE',
            body: `It is a good joke. Everyone laughs, including him, and the moment passes, and your mother looks at you for a half-second with an expression you choose not to read.

He stops telling you things after a while, in the same gradual way a tap drips.`,
            tone: 'bad',
            fx: { npc: { brother_eli: -14, mum: -4 }, happiness: -4, stress: 6, counter: { deflection: 1 } },
          },
        ],
      },
      {
        text: 'Ask him how he actually did it',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU ASKED HIM HOW',
            body: `He looks surprised, and then talks for twenty minutes with genuine enthusiasm about something he has clearly never been asked about.

Half of it is obvious. A quarter of it is clever. You take notes mentally, and you mean them.`,
            tone: 'good',
            fx: { career: 8, happiness: 6, npc: { brother_eli: 14 }, flag: { learnedFromEli: 1 } },
          },
        ],
      },
    ],
  },

  {
    id: 'family_christmas_dilemma',
    title: 'THE ANNUAL NEGOTIATION',
    body: `Two families, one day, three hundred miles between them, and a mother on each side who has said "oh, don't worry about us" in a tone that has been studied by linguists.

Someone is going to be disappointed and it is arithmetically guaranteed to be either your mother or theirs.`,
    art: 'family_christmas',
    cat: 'family',
    weight: 11,
    cooldown: 36,
    when: { partner: ['dating', 'engaged', 'married'], age: [23, 70] },
    choices: [
      {
        text: 'Do both. Drive all day.',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU SPENT FIVE HOURS IN A CAR',
            body: `Lunch there, dinner here, and a motorway service station at 16:40 eating something in a wrapper, and both mothers delighted, and both of you exhausted and not entirely speaking by midnight.

Nobody is upset. That is the win. The cost was invisible to everybody but you.`,
            tone: 'mixed',
            fx: { happiness: -4, stress: 18, relationships: 6, npc: { mum: 12, partner: 6 }, expense: 180 },
          },
        ],
      },
      {
        text: 'Split it: one family this year, the other next',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU ROTATED THE CALENDAR',
            body: `You announce a system. It is fair, it is repeatable, and it means somebody is disappointed on a schedule.

"Next year" turns out to be a genuinely powerful phrase. It costs nothing and defers everything.`,
            tone: 'good',
            fx: { stress: -6, relationships: 4, happiness: 4, flag: { christmasRotate: 1 } },
          },
        ],
      },
      {
        text: 'Stay home. Just the two of you.',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'THE QUIETEST DECEMBER IN YEARS',
            body: `You do it properly: a small meal, a long walk, nobody's aunt asking about your timeline.

Your mother says "well, as long as you're happy" in a way that has an undertow. It was, genuinely, the best holiday you have had as an adult.`,
            tone: 'good',
            fx: { happiness: 14, stress: -16, relationships: 8, npc: { mum: -12, dad: -6, partner: 14 }, flag: { skippedChristmas: 1 } },
          },
        ],
      },
      {
        text: 'Volunteer to work through the holidays',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'YOU VOLUNTEERED FOR THE SHIFT',
            body: `It is a genuinely good excuse and it is also genuinely good behaviour: you cover for a colleague with kids and you get the office to yourself and nobody asks you anything.

Your family eats without you. There is a photograph. You are not in it.`,
            tone: 'mixed',
            fx: { career: 6, money: 800, happiness: -6, npc: { mum: -14, dad: -10, partner: -8 }, counter: { chaos: 1 } },
          },
        ],
      },
    ],
  },

  {
    id: 'family_inheritance',
    title: 'A LETTER FROM A SOLICITOR',
    body: `Your great-aunt has died. You met her four times, and one of those times was at a wedding where she told you that you had "a good face."

The letter is formal and brief and there is a number in it, and the number has more digits than you were expecting.`,
    art: 'family_letter',
    cat: 'family',
    weight: 8,
    cooldown: 999,
    when: { age: [26, 70] },
    choices: [
      {
        text: 'Take it. Save it. Say nothing.',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU PUT IT SOMEWHERE SENSIBLE',
            body: `It goes into an account you do not look at, and you tell almost nobody, and it earns a genuinely boring amount of interest for four years.

You are now a person with a cushion, which changes your posture in conversations more than you expected.`,
            tone: 'good',
            fx: { money: 26000, savings: 0, stress: -10, happiness: 8, flag: { inheritance: 1 }, counter: { sensible: 1 } },
          },
        ],
      },
      {
        text: 'Spend a chunk on something wonderful',
        tag: 'risky',
        time: 1,
        outcomes: [
          {
            title: 'YOU BOUGHT THE WONDERFUL THING',
            body: `It is objectively irresponsible and subjectively one of the best decisions of your life. You think about your great-aunt every time you look at it, which is presumably exactly what she intended, having told you that you had a good face.`,
            tone: 'good',
            fx: { money: -9000, happiness: 20, stress: -12, reputation: 4, milestone: 'Bought something wonderful', flag: { inheritedSpent: 1 } },
          },
        ],
      },
      {
        text: 'Give half to your {sibling}',
        tag: 'kind',
        time: 1,
        outcomes: [
          {
            title: 'YOU SPLIT IT WITHOUT BEING ASKED',
            body: `He did not expect it. He had, in fact, already decided he was not entitled to any of it, and had told his partner so.

The transfer lands at 21:14 on a Sunday. He calls immediately and does not say much.`,
            tone: 'good',
            fx: {
              money: 13000,
              npc: { brother_eli: 30, mum: 14 },
              happiness: 14,
              karma: 12,
              relationships: 10,
              flag: { sharedInheritance: 1 },
              remember: { brother_eli: 'You split the inheritance with him before he could ask.' },
            },
          },
        ],
      },
    ],
  },

  {
    id: 'family_care_decision',
    title: 'SOMEONE HAS TO DECIDE',
    body: `The care home costs more than your job pays. The alternative is a rota of four people, two of whom work full time and one of whom is nineteen and has a life.

Everyone is looking at the same piece of paper. Everyone is waiting for somebody else to say the number first.`,
    art: 'family_care',
    cat: 'family',
    weight: 13,
    cooldown: 60,
    priority: 1,
    when: { age: [32, 62], flags: { wentHome: [1, null] } },
    choices: [
      {
        text: 'Pay for the care home. Take the financial hit.',
        tag: 'kind',
        time: 3,
        outcomes: [
          {
            title: 'YOU ARE PAYING FOR IT',
            body: `It is $2,900 a month, which is more than rent, and it does not stop, and there is no version of this where it stops.

You visit every second weekend. She is well looked after and she does not always know who you are, and one of those facts matters more than the other.`,
            tone: 'mixed',
            fx: {
              expense: 2900,
              stress: 20,
              happiness: -6,
              health: -6,
              npc: { mum: 16, dad: 14, brother_eli: 16 },
              flag: { payingForCare: 1 },
              karma: 10,
            },
            delayed: [
              {
                inMonths: 30,
                chance: 0.6,
                title: 'IT ENDED, AS THESE THINGS DO',
                body: `She dies on a Sunday morning in a room you have spent ninety-two Sundays in. The direct debit is cancelled by a bank clerk who apologises for the timing, and the money that has been leaving your account for two and a half years simply stops.`,
                tone: 'bad',
                art: 'family_hospital',
                fx: { expense: -2900, stress: 20, happiness: -16, npc: { mum: -100, dad: -40 }, milestone: 'Said goodbye' },
              },
              {
                inMonths: 26,
                chance: 0.5,
                title: 'THE MONEY RAN OUT BEFORE SHE DID',
                body: `Twenty-six months of payments. You have spent more on this than on every holiday, car and sofa of your adult life combined.`,
                tone: 'mixed',
                fx: { money: -12000, stress: 24, happiness: -10 },
              },
            ],
          },
        ],
      },
      {
        text: 'Move her in with you',
        tag: 'bold',
        time: 4,
        outcomes: [
          {
            title: 'SHE MOVES IN ON A SUNDAY',
            body: `A spare room, a hospital bed, a commode, and a folder of paperwork in a plastic wallet. Your home is no longer a home; it is a small facility with good cooking.

She is, in the moments when she is herself, intensely grateful and acutely aware of what it costs you, which is worse.`,
            tone: 'mixed',
            fx: {
              expense: 600,
              stress: 34,
              happiness: 4,
              health: -10,
              energy: -16,
              relationships: 10,
              npc: { mum: 30, dad: 20, brother_eli: 20 },
              flag: { caringAtHome: 1 },
              karma: 14,
              milestone: 'Cared for a parent',
            },
            delayed: [
              {
                inMonths: 14,
                chance: 0.6,
                title: 'YOU LOST YOURSELF IN IT',
                body: `You have not been to the cinema in a year. Your partner mentions, carefully, that they have not had a conversation with you that was not about medication since February.`,
                tone: 'bad',
                fx: { relationships: -16, happiness: -14, stress: 20, npc: { partner: -18 } },
              },
            ],
          },
        ],
      },
      {
        text: 'Shared rota. Everyone does their bit.',
        tag: 'smart',
        time: 2,
        outcomes: [
          {
            title: 'YOU BUILT A ROTA',
            body: `Four people, a shared calendar, and an agreement written in a group chat that everybody resents and everybody follows.

It works better than anyone expected and it is a great deal harder on Eli than on you and he says so, once, and you adjust it.`,
            tone: 'good',
            fx: {
              stress: 10,
              expense: 700,
              npc: { brother_eli: 10, mum: 8 },
              relationships: 6,
              flag: { careRota: 1 },
              counter: { familySupport: 1 },
            },
          },
        ],
      },
      {
        text: 'Step back. Let Eli lead.',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU STEPPED BACK',
            body: `You say it clearly: "you know this better than I do, tell me what to do and I'll do it."

He looks at you for a long moment and then does exactly that, and does it well, and never quite forgives you for making him be the one.`,
            tone: 'mixed',
            fx: { stress: -8, happiness: -8, npc: { brother_eli: -8, mum: 4 }, flag: { eliLeads: 1 } },
          },
        ],
      },
    ],
  },

  {
    id: 'family_new_baby_pressure',
    title: 'YOUR MOTHER HAS STARTED MENTIONING IT',
    body: `Never directly. That is not her method. She mentions a friend's grandchild. She mentions a pram she saw. She mentions that a cousin is expecting, twice, in the same conversation, in case you missed it.

You are not sure whether you want children and you are increasingly sure that the question is not yours alone.`,
    art: 'family_pressure',
    cat: 'family',
    weight: 11,
    cooldown: 36,
    when: { partner: ['married', 'engaged'], children: [0, 0], age: [28, 42] },
    choices: [
      {
        text: 'Have the direct conversation with her',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU SAID IT PLAINLY',
            body: `"Mum. If we have children it will be because we want them, not because you mention prams." She is quiet for a moment and then says "I know. I'm sorry," and then tells you something about her own twenties you have never heard.

The pressure stops. It is replaced by something quieter and harder to carry.`,
            tone: 'good',
            fx: { npc: { mum: 10 }, stress: -8, happiness: 6, relationships: 4 },
          },
        ],
      },
      {
        text: 'Deflect with humour, repeatedly',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU MADE IT A RUNNING JOKE',
            body: `It becomes the family bit. "Here we go." Everybody laughs. Nothing is ever discussed.

You are now the person at every family lunch whose entire relationship is a punchline and neither you nor your partner ever agreed to that.`,
            tone: 'mixed',
            fx: { stress: 8, happiness: -4, npc: { mum: 4, partner: -8 }, counter: { deflection: 1 } },
          },
        ],
      },
      {
        text: 'Get defensive and mention the money',
        tag: 'risky',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'YOU MENTIONED THE MONEY',
            body: `"Do you know what childcare costs?" It lands badly and it lands hard, and your mother — who did not have money, and knows, and has never once made you feel like a burden — goes very still.`,
            tone: 'bad',
            fx: { npc: { mum: -18, partner: -6 }, happiness: -10, stress: 14 },
          },
        ],
      },
    ],
  },

  {
    id: 'family_dads_workshop',
    title: 'YOUR DAD WANTS TO GIVE YOU SOMETHING',
    body: `It is a table. He made it, badly, in 1998, and it has been in the garage for two decades with a sheet over it.

"It's yours if you want it," he says, standing next to it, not looking at you. "I know it's not — I know you could buy better."`,
    art: 'family_workshop',
    cat: 'family',
    weight: 10,
    cooldown: 999,
    when: { age: [26, 60] },
    choices: [
      {
        text: 'Take it. Put it in your actual home.',
        tag: 'kind',
        time: 1,
        outcomes: [
          {
            title: 'YOU TOOK THE TABLE',
            body: `It is unbalanced, it is the wrong colour, and it now sits in your hall where you see it every single day.

He does not say anything when he visits. He just touches the corner of it, once, on the way past.`,
            tone: 'good',
            fx: { npc: { dad: 26, mum: 12 }, happiness: 14, relationships: 8, milestone: 'Took the table' },
          },
        ],
      },
      {
        text: 'Take it and keep it in the garage',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU TOOK THE TABLE AND STORED THE TABLE',
            body: `He never asks about it. You never mention it. It sits in your garage under its own sheet, exactly as it did in his, waiting for a version of you who has room.`,
            tone: 'mixed',
            fx: { npc: { dad: 8 }, happiness: 2, stress: 4 },
          },
        ],
      },
      {
        text: 'Say no, gently. You do not have room.',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU SAID NO TO THE TABLE',
            body: `He says "no, yeah, course" and puts the sheet back over it, and it is genuinely fine, and you think about that specific hand movement for years.`,
            tone: 'bad',
            fx: { npc: { dad: -14 }, happiness: -8, stress: 6 },
          },
        ],
      },
    ],
  },

  {
    id: 'family_wedding_invite_snub',
    title: 'YOU WERE NOT INVITED',
    body: `A cousin is getting married. You found out from a photograph — a big one, eighty people, and you can see six members of your own family in the front row who are perfectly capable of having told you.

Nobody has mentioned it. Nobody is going to.`,
    art: 'family_snub',
    cat: 'family',
    weight: 9,
    cooldown: 999,
    when: { age: [24, 65] },
    choices: [
      {
        text: 'Ask your mother directly what happened',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU ASKED',
            body: `There is a pause of about four seconds, which is all the information you need, and then a sentence that begins "well, you know what your aunt is like."

You do not know what your aunt is like. You now know a great deal.`,
            tone: 'mixed',
            fx: { npc: { mum: 6 }, happiness: -6, stress: 12, flag: { knowsSnub: 1 } },
          },
        ],
      },
      {
        text: 'Send a card and a gift anyway',
        tag: 'kind',
        time: 1,
        outcomes: [
          {
            title: 'YOU SENT A CARD',
            body: `Fifty dollars and a genuinely warm message, and you sign both your names.

You hear nothing for three weeks and then get a thank-you card with a photograph of a table arrangement on the front and two words inside.`,
            tone: 'mixed',
            fx: { money: -50, happiness: 4, karma: 6, reputation: 4, npc: { mum: 8 }, counter: { grace: 1 } },
          },
        ],
      },
      {
        text: 'Mention it loudly at the next family gathering',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'YOU BROUGHT IT UP AT LUNCH',
            body: `In front of eleven people, mid-pudding. The table divides instantly and permanently into two camps, and your grandmother says "oh, for goodness sake" with genuine force.

Nothing is resolved. A new front is opened.`,
            tone: 'chaos',
            fx: { stress: 20, happiness: -8, npc: { mum: -14, brother_eli: -8 }, counter: { chaos: 1 }, flag: { familySplit: 1 } },
          },
        ],
      },
    ],
  },
];
