import type { GameEvent } from '../../engine/types';

/**
 * RANDOM EVENTS — the universe's contribution.
 *
 * These should feel believable and slightly unfair, which is the correct
 * relationship between an adult and the world.
 */
export const randomEvents: GameEvent[] = [
  {
    id: 'random_layoff',
    title: 'YOUR ROLE HAS BEEN IDENTIFIED AS REDUNDANT',
    body: `There is a meeting in a small room with a person from HR whose job today is to be kind to you, and a person from legal who is not being paid to be.

You have thirty minutes, a folder, and a genuinely excellent severance offer that expires on Friday.`,
    art: 'office_layoff',
    cat: 'workplace',
    weight: 12,
    cooldown: 24,
    priority: 2,
    when: { career: { employed: true }, age: [23, 62] },
    choices: [
      {
        text: 'Take the severance and leave with dignity',
        tag: 'smart',
        time: 2,
        outcomes: [
          {
            title: 'YOU TOOK THE PACKAGE',
            body: `Three months' pay and a genuinely civil goodbye. You are out by 11:40 with a box containing a plant and a mug.

You go to a café and sit with a laptop you are not allowed to use yet, and you stare at a wall for forty minutes and it is, unexpectedly, one of the better mornings of the year.`,
            tone: 'mixed',
            fx: {
              money: 9200,
              career: -12,
              stress: 12,
              happiness: 6,
              setCareer: null,
              flag: { employed: false, tookPackage: 1 },
              counter: { jobsLost: 1 },
              log: 'Made redundant',
            },
            delayed: [
              {
                inMonths: 5,
                chance: 0.6,
                title: 'THE MONEY RAN OUT BEFORE THE CLARITY DID',
                body: `Month five, and the package is genuinely gone, and you have applied for eleven roles and heard back from two, and you have started to take the silence personally.`,
                tone: 'bad',
                fx: { stress: 24, happiness: -12 },
              },
              {
                inMonths: 7,
                chance: 0.45,
                title: 'SOMETHING BETTER CAME FROM IT',
                body: `Not immediately, and not from an application: from a conversation you had because you were not at work, with somebody who needed exactly what you do.`,
                tone: 'good',
                fx: { career: 16, money: 4000, income: 600, happiness: 16, setCareer: { path: 'technology', level: 1 } },
              },
            ],
          },
        ],
      },
      {
        text: 'Fight it. Get a lawyer.',
        tag: 'bold',
        highRisk: true,
        time: 3,
        outcomes: [
          {
            title: 'YOU HIRED A LAWYER',
            body: `$2,400 of representation and a genuinely uncomfortable six weeks in which you are still technically employed and nobody speaks to you.

It settles at the door of a tribunal for more than they offered and less than you hoped, which is what settling always is.`,
            tone: 'mixed',
            fx: {
              money: 14000,
              career: -14,
              stress: 26,
              reputation: 6,
              setCareer: null,
              flag: { employed: false, sued: 1 },
              counter: { jobsLost: 1 },
            },
            delayed: [
              {
                inMonths: 10,
                chance: 0.5,
                title: 'THE WORD GOT AROUND',
                body: `Two recruiters have heard the story. One of them describes you as "a risk." The other describes you as "the person who did not roll over." Both of those descriptions follow you into interviews.`,
                tone: 'mixed',
                fx: { career: -6, reputation: -8, stress: 14 },
              },
            ],
          },
        ],
      },
      {
        text: 'Beg for your job back',
        tag: 'risky',
        time: 1,
        outcomes: [
          {
            title: 'YOU ASKED THEM TO RECONSIDER',
            body: `You say it in the small room, to two people who have been handed a decision that was made four floors above them, and they look at you with real sympathy and zero authority.

They cannot. It was never theirs. You have now done that in front of them.`,
            tone: 'bad',
            fx: { career: -16, stress: 26, happiness: -16, reputation: -8, setCareer: null, flag: { employed: false }, counter: { jobsLost: 1 } },
          },
        ],
      },
      {
        text: 'Use the thirty minutes to write down everything you know',
        tag: 'chaotic',
        highRisk: true,
        time: 2,
        outcomes: [
          {
            title: 'YOU SPENT THE THIRTY MINUTES TAKING NOTES',
            body: `Every process, every contact, every client relationship, every password-adjacent thing you have ever been trusted with. Not to do anything with — just because you can, and because they scheduled this on a Tuesday.

You walk out with a folder and a genuinely magnificent exit plan.`,
            tone: 'chaos',
            fx: {
              money: 9200,
              career: -8,
              stress: 14,
              happiness: 10,
              reputation: 4,
              setCareer: null,
              flag: { employed: false, tookNotes: 1 },
              counter: { jobsLost: 1, chaos: 1 },
            },
            delayed: [
              {
                inMonths: 8,
                chance: 0.4,
                title: 'YOU STARTED A COMPETITOR',
                body: `You had the clients, the process and the contacts, and you were angry for exactly long enough to do something about it.`,
                tone: 'good',
                fx: { biz: { launch: 'consulting' }, money: -6000, stress: 20, happiness: 12, reputation: 8, flag: { founder: 1 } },
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'random_economic_downturn',
    title: 'THE NEWS HAS A TONE',
    body: `Rates up, hiring freezes, three companies you know of announcing "a period of consolidation." The word recession is being used in a way that suggests people are hedging.

Your position is genuinely fine for now. That is what everyone thinks at this exact point in the cycle.`,
    art: 'money_recession',
    cat: 'money',
    weight: 12,
    cooldown: 48,
    priority: 1,
    when: { age: [23, 70] },
    choices: [
      {
        text: 'Cut every non-essential expense. Now.',
        tag: 'smart',
        time: 2,
        outcomes: [
          {
            title: 'YOU DID A GENUINE COST AUDIT',
            body: `Four subscriptions you had forgotten about, two you did not need, one insurance policy that was three times the market rate, and a phone contract that has been out of contract for two years.

You find $340 a month and you have made your position genuinely defensible.`,
            tone: 'good',
            fx: { expense: -340, stress: -8, happiness: -2, money: 400, counter: { sensible: 1 } },
          },
        ],
      },
      {
        text: 'Hold steady. You are fine.',
        tag: 'safe',
        time: 2,
        outcomes: [
          {
            title: 'YOU HELD STEADY',
            body: `You are fine. The downturn is real and slower than the news implies, and for eleven months nothing happens to you at all except that everything gets slightly more expensive.`,
            tone: 'neutral',
            fx: { stress: 8, expense: 90 },
          },
          {
            weight: 0.4,
            variance: 1,
            title: 'IT REACHED YOU EVENTUALLY',
            body: `Not a layoff. A hiring freeze, followed by a pay review deferred, followed by a bonus of zero. You are employed and you are 9% worse off in real terms.`,
            tone: 'mixed',
            fx: { stress: 12, happiness: -8, money: -600 },
          },
        ],
      },
      {
        text: 'Buy while everything is cheap',
        tag: 'bold',
        highRisk: true,
        time: 3,
        requires: { minCash: 6000 },
        outcomes: [
          { weight: 5, variance: 1, title: 'YOU BOUGHT THE DOWNTURN', body: `Everything you put in is up 40% eighteen months later, and you develop a genuinely unearned belief in your own judgement.`, tone: 'good', fx: { money: 14000, happiness: 16, reputation: 6, counter: { bigWins: 1 } } },
          { weight: 5, variance: 1, title: 'IT WENT DEEPER THAN ANYONE EXPECTED', body: `Down another 26% after you bought in, and you hold it for three years before it comes back, which is a long three years.`, tone: 'bad', fx: { money: -6000, stress: 22, happiness: -12, counter: { losses: 1 } } },
        ],
      },
      {
        text: 'Quit your job and retrain into something recession-proof',
        tag: 'chaotic',
        highRisk: true,
        time: 6,
        outcomes: [
          {
            title: 'YOU RETRAINED INTO HEALTHCARE',
            body: `Twelve months of a course and a placement in a hospital, and a starting salary that is genuinely less than what you were on.

The work is real, in a way that your previous work was not, and it is much harder to fire a person who is needed on a ward at 4am.`,
            tone: 'good',
            fx: {
              career: 4,
              money: -8000,
              happiness: 10,
              stress: 22,
              health: -8,
              setCareer: { path: 'healthcare', level: 0 },
              counter: { careerChanges: 1, chaos: 1 },
              flag: { recessionProof: 1 },
              log: 'Retrained into healthcare',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'random_old_friend_returns',
    title: 'A NAME YOU HAVE NOT SEEN IN ELEVEN YEARS',
    body: `"Long time! I know this is out of nowhere but I'm in town for work and I'd genuinely love to catch up."

The last time you saw them was at a party where something happened that neither of you has ever mentioned.`,
    art: 'friends_reunion',
    cat: 'friendship',
    weight: 11,
    cooldown: 999,
    when: { age: [28, 62] },
    choices: [
      {
        text: 'Meet up. Genuinely catch up.',
        tag: 'kind',
        time: 1,
        outcomes: [
          {
            title: 'YOU MET FOR COFFEE',
            body: `Two hours. They are doing well and they have children and a business and a genuinely different life, and after forty minutes you are both twenty-two again and laughing about a specific night in a specific car park.

You swap numbers. You text twice over the following year. That is the whole resurgence and it is genuinely nice.`,
            tone: 'good',
            fx: { happiness: 14, stress: -10, relationships: 8, npc: { marcus: 12 }, flag: { rekindled: 1 } },
            delayed: [
              {
                inMonths: 9,
                chance: 0.4,
                title: 'THEY HAD AN IDEA FOR YOU',
                body: `Not a pitch. An introduction. They have been quietly recommending you to somebody for four months without saying anything.`,
                tone: 'good',
                fx: { career: 12, money: 3000, happiness: 10 },
              },
            ],
          },
        ],
      },
      {
        text: 'Meet up, and ask about the thing that happened',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU BROUGHT UP THE PARTY',
            body: `You do it lightly and they go quiet, and then they apologise properly, eleven years late and in a café, for something you had genuinely stopped thinking about.

You had both been carrying a slightly different version. Now you have the same one.`,
            tone: 'good',
            fx: { happiness: 16, stress: -12, relationships: 12, karma: 8, npc: { marcus: 16 }, counter: { closure: 1 } },
          },
        ],
      },
      {
        text: 'Do not reply',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU LEFT IT ON READ',
            body: `Not out of malice. You were busy, and then it was three days, and then replying would have required an explanation about why you had not replied.

They do not message again. You think about it occasionally at 23:00.`,
            tone: 'bad',
            fx: { happiness: -6, relationships: -4, npc: { marcus: -10 } },
          },
        ],
      },
    ],
  },

  {
    id: 'random_surprise_offer',
    title: 'A JOB OFFER OUT OF NOWHERE',
    body: `You were not looking. Somebody — a person you met once at an event, or a former manager, or someone who read something you wrote — has a role and a budget and a name.

They want an answer by Thursday. The number is 26% above what you currently earn.`,
    art: 'office_offer',
    cat: 'career',
    weight: 12,
    cooldown: 30,
    when: { career: { employed: true }, age: [24, 58] },
    choices: [
      {
        text: 'Take it. Move.',
        tag: 'bold',
        time: 2,
        outcomes: [
          {
            title: 'YOU TOOK THE JOB',
            body: `Thirty days of notice, a genuinely awkward leaving lunch, and a new desk in a building with a worse coffee machine and better everything else.

You are the new person again, which is exhausting and clarifying in equal measure.`,
            tone: 'good',
            fx: {
              career: 14,
              money: 2400,
              salaryPct: 0.26,
              happiness: 10,
              stress: 14,
              jobPerf: -0.15,
              counter: { jobChanges: 1 },
              log: 'Changed jobs',
            },
            delayed: [
              {
                inMonths: 7,
                chance: 0.4,
                title: 'THE ROLE WAS NOT WHAT WAS DESCRIBED',
                body: `It was described as a role with scope and authority, and it is a role with responsibility and no authority, which is the oldest bait in the trade.`,
                tone: 'bad',
                fx: { career: -6, stress: 20, happiness: -12 },
              },
              {
                inMonths: 14,
                chance: 0.5,
                title: 'YOU GREW INTO IT',
                body: `It took a year of hard, unglamorous work and now it genuinely fits, and there is a person underneath you whose job used to be yours.`,
                tone: 'good',
                fx: { career: 18, money: 5000, salaryPct: 0.08, happiness: 14, counter: { promotions: 1 } },
              },
            ],
          },
        ],
      },
      {
        text: 'Use it to get a raise where you are',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'THEY MATCHED MOST OF IT',
            body: `Not all of it, and they know you know. But there is a genuine raise and a genuine promotion and the words "we'd hate to lose you" in a tone that suggests they had budgeted for this possibility.

You stay. Your name is now attached to a number that somebody is watching.`,
            tone: 'good',
            fx: { career: 12, money: 1200, happiness: 8, stress: 10, npc: { boss_gary: -4 }, counter: { counteroffers: 1, promotions: 1 } },
          },
        ],
      },
      {
        text: 'Decline. You like where you are.',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU DECLINED',
            body: `Genuinely, warmly, without playing games. They say they completely understand and to get in touch if anything changes, which people say, and which they mean about 30% of the time.

You stay. Nothing changes. Something has shifted slightly in how you think about yourself, and you are not sure whether it is good.`,
            tone: 'mixed',
            fx: { stress: -6, happiness: 4, career: 2 },
          },
        ],
      },
    ],
  },

  {
    id: 'random_family_emergency',
    title: 'THE CALL COMES AT 06:12',
    body: `It is your brother and his voice is doing something you have not heard it do since you were children.

Your dad is in hospital. It is serious enough that they have used the word serious, and he does not have any more information than that, and he is standing in a corridor.`,
    art: 'family_hospital',
    cat: 'family',
    weight: 13,
    cooldown: 60,
    priority: 2,
    when: { age: [24, 65] },
    choices: [
      {
        text: 'Get there. Today. Whatever it costs.',
        tag: 'kind',
        time: 1,
        outcomes: [
          {
            title: 'YOU WERE THERE BY 14:00',
            body: `An absurdly priced ticket, a train, a taxi, and a corridor with five of you standing in it and nobody knowing what to do with their hands.

He is genuinely unwell and he is also, by 18:00, sitting up and making a joke about the food, and the relief in your chest is a physical thing.`,
            tone: 'good',
            fx: {
              money: -780,
              stress: 20,
              happiness: 4,
              npc: { dad: 24, mum: 18, brother_eli: 16 },
              relationships: 12,
              karma: 10,
              flag: { showedUpForDad: 1 },
              milestone: 'Showed up when it mattered',
            },
            delayed: [
              {
                inMonths: 5,
                chance: 0.6,
                title: 'HE MENTIONED IT, ONCE, SIDEWAYS',
                body: `"You didn't have to come, you know." Which is his entire emotional range in six words, and which means the opposite.`,
                tone: 'good',
                fx: { npc: { dad: 16 }, happiness: 12, relationships: 8 },
              },
            ],
          },
        ],
      },
      {
        text: 'Call. Talk to the doctors. Stay where you are.',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU STAYED AND STAYED IN TOUCH',
            body: `Four calls a day, one of them with a consultant who explains things properly, and a running group chat with your brother that becomes the primary organ of the family for a fortnight.

He is genuinely okay. You were genuinely useful. You were also not there.`,
            tone: 'mixed',
            fx: { stress: 18, npc: { dad: 6, mum: 4, brother_eli: -8 }, happiness: -6, karma: 2 },
          },
        ],
      },
      {
        text: 'Freeze. Do not reply for a few hours.',
        tag: 'lazy',
        time: 1,
        outcomes: [
          {
            title: 'YOU PUT THE PHONE DOWN',
            body: `Not deliberately. You just – could not. You made a coffee. You looked at the wall. You replied at 11:40 with four words and then spent four hours feeling like a specific kind of coward.

He was fine, eventually. That is not the point and you know it.`,
            tone: 'bad',
            fx: { stress: 24, happiness: -14, npc: { dad: -10, brother_eli: -16 }, relationships: -8 },
          },
        ],
      },
    ],
  },

  {
    id: 'random_stolen_wallet',
    title: 'AND THEN THE WALLET WAS GONE',
    body: `You know it was at the bar. You know exactly which thirty seconds it happened in. The barman has seen it before and is genuinely sorry in a professional way.

Cards, cash, ID, and a loyalty card with two full stamps on it.`,
    art: 'money_wallet',
    cat: 'money',
    weight: 10,
    cooldown: 48,
    when: { age: [21, 75] },
    choices: [
      {
        text: 'Do everything properly: police, bank, replacement',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU DID THE ADMIN OF BEING ROBBED',
            body: `Two hours on the phone, a police report that takes forty minutes and generates a reference number that nobody will ever look at, and $60 in replacement fees.

The wallet itself was a gift, which is the actual loss.`,
            tone: 'mixed',
            fx: { money: -160, stress: 14, happiness: -8, flag: { beenRobbed: 1 } },
          },
        ],
      },
      {
        text: 'Cancel the cards and move on',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU CANCELLED THE CARDS',
            body: `A genuinely impressive eleven-minute phone call. You do not report it, and you will think about that when you read about the area two years later.`,
            tone: 'neutral',
            fx: { money: -90, stress: 10, happiness: -6 },
          },
        ],
      },
      {
        text: 'Post about it and offer a reward',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'YOU OFFERED A $200 REWARD',
            body: `It gets 800 shares. You are contacted by three people who do not have it and one person who is genuinely trying to help and does not have it either.

You have become, briefly, a local story. Somebody at work mentions it.`,
            tone: 'chaos',
            fx: { money: -60, reputation: 6, stress: 12, happiness: 2, counter: { chaos: 1 } },
          },
        ],
      },
    ],
  },

  {
    id: 'random_roof_leak',
    title: 'THERE IS WATER WHERE WATER SHOULD NOT BE',
    body: `A patch, on the ceiling, that was a small mark on Tuesday and is a genuinely ambitious shape by Saturday, and has begun to develop a drip with a schedule.

Upstairs says it is not them. Upstairs is, on the evidence, very likely them.`,
    art: 'housing_leak',
    cat: 'housing',
    weight: 12,
    cooldown: 36,
    when: { homeTier: ['shared_apartment', 'studio', 'one_bed', 'rental_house', 'first_home', 'nice_condo'] },
    choices: [
      {
        text: 'Call the landlord or insurer. Do it by the book.',
        tag: 'smart',
        time: 2,
        outcomes: [
          {
            title: 'YOU DID IT BY THE BOOK',
            body: `Four calls, one visit, and a fortnight with a bucket and a genuinely unpleasant smell. The ceiling gets fixed. The paint does not match, which you will notice every single day for four years.`,
            tone: 'mixed',
            fx: { money: -280, stress: 14, happiness: -6, counter: { sensible: 1 } },
          },
        ],
      },
      {
        text: 'Fix it yourself, badly, at 22:00',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'YOU BOUGHT A TUBE OF THINGS AND MADE IT WORSE',
            body: `There is now a patch of something on top of the original problem, which has not been solved, and which has been sealed inside a new layer of material.

It holds for four months, which is exactly long enough to have forgotten about it.`,
            tone: 'chaos',
            fx: { money: -40, stress: 10, happiness: -2, counter: { chaos: 1 }, flag: { badDIY: 1 } },
            delayed: [
              {
                inMonths: 4,
                chance: 0.6,
                title: 'IT CAME THROUGH THE PATCH',
                body: `All at once, at 02:40, with a noise, onto a sofa.`,
                tone: 'bad',
                fx: { money: -2400, stress: 24, happiness: -12 },
              },
            ],
          },
        ],
      },
      {
        text: 'Move out and pretend it was never your problem',
        tag: 'risky',
        time: 2,
        outcomes: [
          {
            title: 'YOU LEFT A DAMP CEILING AND A DISPUTE',
            body: `You give notice, move, and eleven weeks later receive a letter from the agent claiming $1,200 for water damage that "was not reported."

You pay $700 of it because fighting is $700 of your time.`,
            tone: 'bad',
            fx: { money: -1900, stress: 18, happiness: -8, counter: { chaos: 0 } },
          },
        ],
      },
    ],
  },

  {
    id: 'random_payroll_error',
    title: 'YOU HAVE BEEN PAID TWICE',
    body: `The second payment lands on the 14th with a reference number that is identical to the first. Finance has not noticed. Finance will notice.

The amount is $2,410 and there is a genuinely interesting decision available to you in the next five minutes.`,
    art: 'money_payroll',
    cat: 'money',
    weight: 11,
    cooldown: 48,
    when: { career: { employed: true } },
    choices: [
      {
        text: 'Report it immediately',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU EMAILED FINANCE',
            body: `It takes two minutes and they reverse it within the hour, and the person from finance replies with "thanks for being honest, you'd be amazed."

You will be mildly resentful about this for a fortnight and permanently glad about it.`,
            tone: 'good',
            fx: { reputation: 10, happiness: 4, stress: -4, karma: 10, counter: { integrity: 1 } },
            delayed: [
              {
                inMonths: 6,
                chance: 0.4,
                title: 'SOMEONE REMEMBERED',
                body: `A promotion panel, and a small line in a note from a finance manager who had no reason to write it.`,
                tone: 'good',
                fx: { career: 8, npc: { boss_gary: 6 }, happiness: 8 },
              },
            ],
          },
        ],
      },
      {
        text: 'Say nothing and see what happens',
        tag: 'risky',
        highRisk: true,
        time: 2,
        outcomes: [
          {
            title: 'NOTHING HAPPENED FOR SIX WEEKS',
            body: `Six weeks of a slightly larger number than you expected, and a low-grade hum every time the phone buzzes.

Then an email from finance, marked high priority, with your name in the subject line.`,
            tone: 'mixed',
            fx: { money: 2410, stress: 16, flag: { keptOverpayment: 1 } },
            delayed: [
              {
                inMonths: 2,
                chance: 0.8,
                title: 'THEY FOUND IT',
                body: `A politely worded email that is not a question. The money goes back and there is a note on your file, which nobody will ever mention and everybody can see.`,
                tone: 'bad',
                fx: { money: -2410, stress: 20, reputation: -8, npc: { boss_gary: -4 } },
              },
            ],
          },
        ],
      },
      {
        text: 'Move it to savings immediately and say nothing ever',
        tag: 'chaotic',
        highRisk: true,
        time: 2,
        outcomes: [
          {
            title: 'YOU MOVED IT AND COMMITTED',
            body: `It is in a savings account and you have already begun to think of it as yours, which took about four hours.

The email arrives in week seven and it is not angry. That is somehow worse.`,
            tone: 'chaos',
            fx: { money: 2410, savings: 0, stress: 20, karma: -8, counter: { chaos: 1 }, flag: { keptOverpayment: 1 } },
            delayed: [
              {
                inMonths: 2,
                chance: 0.85,
                title: 'THEY ASKED FOR IT BACK',
                body: `A reply-all to your manager, cc finance, with the transaction reference and the word "overpayment" in bold.`,
                tone: 'bad',
                fx: { money: -2410, stress: 26, reputation: -14, npc: { boss_gary: -10 } },
              },
            ],
          },
        ],
      },
    ],
  },
];
