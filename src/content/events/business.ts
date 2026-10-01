import type { GameEvent } from '../../engine/types';

/**
 * BUSINESS / ENTREPRENEURSHIP
 *
 * The business system is deliberately light: revenue, expenses, reputation and
 * a health meter that drifts based on profitability. Events here are the big
 * swings — the ones players screenshot.
 */
export const businessEvents: GameEvent[] = [
  {
    id: 'biz_founding_itch',
    title: 'THE IDEA WILL NOT LEAVE YOU ALONE',
    body: `You have thought about it in the shower, on the train, and during a meeting about a document. You have a name. You have a rough number. You have a genuine, specific, unpleasant certainty that if you do not try this you will be thinking about it at fifty-five.

You also have a salary, a landlord, and a rent payment that does not care about your certainty.`,
    art: 'business_idea',
    cat: 'business',
    weight: 14,
    cooldown: 24,
    when: { age: [23, 55], lacks: ['founder'], stats: { career: [25, 100] } },
    choices: [
      {
        text: 'Start a consulting agency. Low cost, uses what you know.',
        hint: '$6,000 to set up',
        tag: 'smart',
        time: 3,
        requires: { minCash: 6000 },
        fx: {
          money: -6000,
          biz: { launch: 'consulting' },
          flag: { founder: 1 },
          milestone: 'Founded Consulting Agency',
          counter: { businesses: 1 },
        },
        outcomes: [
          {
            title: 'YOU ARE IN BUSINESS',
            body: `One client, introduced by a former colleague, at a day rate you made up and then immediately regretted not making up higher.

You do the work at night for the first three months. You invoice in a font that suggests a larger company. You are genuinely, unreasonably happy.`,
            tone: 'good',
            fx: { happiness: 14, stress: 14, career: 6, income: 400, reputation: 4 },
            delayed: [
              { inMonths: 7, chance: 0.5, title: 'A CLIENT WANTS YOU FULL-TIME', body: `Four days a week, retainer, and a suggestion that you might "come in-house properly." It is security wearing the costume of an opportunity.`, tone: 'mixed', fx: { money: 4000, stress: 10, flag: { retainerOffer: 1 } } },
              { inMonths: 11, chance: 0.4, title: 'THE REFERRALS ARRIVED', body: `Three at once, all from the same person, all of whom want the version of you that the first client described to them.`, tone: 'good', fx: { money: 7000, income: 900, happiness: 12, reputation: 8 } },
            ],
          },
        ],
      },
      {
        text: 'Start an online store. Small, testable, evenings and weekends.',
        hint: '$9,000 to set up',
        tag: 'bold',
        time: 3,
        requires: { minCash: 9000 },
        fx: {
          money: -9000,
          biz: { launch: 'online_store' },
          flag: { founder: 1 },
          milestone: 'Founded Online Store',
          counter: { businesses: 1 },
        },
        outcomes: [
          {
            title: 'YOU HAVE A WAREHOUSE (IT IS A SPARE ROOM)',
            body: `Two hundred units of a product you are fairly confident in, stacked against a wall, in a room that now smells faintly of cardboard.

First sale: 22:40 on day three. You tell four people. One of them asks if it counts as a real business.`,
            tone: 'good',
            fx: { happiness: 10, stress: 12, flag: { ecommerce: 1 } },
            delayed: [
              { inMonths: 5, chance: 0.45, title: 'A RETURN, A VERY UNHAPPY EMAIL, AND A REVIEW', body: `One star, 400 words, and a photograph of your product in a bin. It is the fourth result for your brand name on the search engine nobody optimises for.`, tone: 'bad', fx: { money: -800, reputation: -10, stress: 14 } },
              { inMonths: 8, chance: 0.35, title: 'IT WENT VIRAL, SORT OF', body: `A person with 400,000 followers posted a photograph of your product on a windowsill with no caption. You sell out in nine hours and cannot restock for three weeks.`, tone: 'good', art: 'social_viral', fx: { money: 14000, reputation: 12, stress: 16, happiness: 12, counter: { bigWins: 1 } } },
            ],
          },
        ],
      },
      {
        text: 'Try the startup. The expensive, ambitious one.',
        hint: '$22,000. Very high risk.',
        tag: 'chaotic',
        highRisk: true,
        time: 4,
        requires: { minCash: 22000 },
        fx: {
          money: -22000,
          biz: { launch: 'software_startup' },
          flag: { founder: 1, startup: 1 },
          milestone: 'Founded Software Startup',
          counter: { businesses: 1, chaos: 1 },
        },
        outcomes: [
          {
            title: 'YOU ARE A FOUNDER NOW',
            body: `You have a product, a website with three pages, and a co-founder who is either brilliant or unwell. You have begun to use the word "we" about a company with two people in it.

You stop sleeping properly. You start to talk about the problem you are solving at parties, which you swore you would never do.`,
            tone: 'chaos',
            fx: { happiness: 12, stress: 30, health: -10, reputation: 8, career: 8 },
            delayed: [
              { inMonths: 10, chance: 0.3, title: 'IT STARTED WORKING', body: `Revenue. Actual revenue, from actual strangers, growing at a rate you describe on the phone to your brother using the word "unbelievable" three times.`, tone: 'good', art: 'business_success', fx: { money: 26000, income: 3000, happiness: 20, reputation: 16, flag: { startupWorking: 1 } } },
              { inMonths: 10, chance: 0.5, title: 'IT RAN OUT OF RUNWAY', body: `Eleven months of spending and a bank balance that says $1,840. Your co-founder has stopped replying to messages in the group chat.`, tone: 'bad', art: 'business_fail', fx: { money: -4000, stress: 30, happiness: -16, flag: { startupDying: 1 } } },
              { inMonths: 10, chance: 0.2, title: 'IT PLATEAUED AT "FINE"', body: `Not a failure. Not a success. Stuck at a level where it pays for itself and your time and nothing else, forever, like a treadmill in a spare room.`, tone: 'mixed', fx: { income: 600, stress: 14, happiness: -4 } },
            ],
          },
        ],
      },
      {
        text: 'Do not start it. Keep the salary.',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU DID NOT DO IT',
            body: `You write the plan out properly, look at the number, and close the document. It is the right decision by every metric available and it takes you about four seconds to make it.

You will open that document again. Possibly twice a year. Possibly for the rest of your working life.`,
            tone: 'neutral',
            fx: { stress: -4, happiness: -4, flag: { ideaDeferred: 1 } },
          },
        ],
      },
    ],
  },

  {
    id: 'biz_first_hire',
    title: 'YOU NEED A SECOND PERSON',
    body: `You have done the arithmetic four times and it says the same thing every time: the work is now more than one person and the money is not quite enough for two.

You have interviewed three people. One of them was excellent and one of them told you about a situation at their last job for eleven minutes without being asked.`,
    art: 'business_hire',
    cat: 'business',
    weight: 14,
    cooldown: 24,
    when: { businesses: { count: [1, 9] }, minCash: 3000 },
    choices: [
      {
        text: 'Hire the excellent one. Pay properly.',
        tag: 'smart',
        time: 2,
        outcomes: [
          {
            title: 'YOU HIRED THE GOOD ONE',
            body: `You offer slightly more than you wanted to and slight less than they asked for, and they accept, and the relief is physical.

They fix three things in the first week that you had been avoiding for six months. Hiring well is a genuinely underrated pleasure.`,
            tone: 'good',
            fx: { biz: { expenses: 3400, employees: 1, rep: 8, health: 8 }, happiness: 8, stress: -8, money: -600 },
          },
        ],
      },
      {
        text: 'Hire the cheapest available',
        tag: 'risky',
        highRisk: true,
        time: 2,
        outcomes: [
          {
            title: 'YOU OPTIMISED FOR COST',
            body: `They start on a Monday and are pleasant and enthusiastic, and by week three you understand exactly what you bought.

It takes you five months to have the conversation, and the conversation is worse because of the five months.`,
            tone: 'mixed',
            fx: { biz: { expenses: 2100, employees: 1, health: -6 }, stress: 14, happiness: -4 },
            delayed: [
              {
                inMonths: 5,
                chance: 0.6,
                title: 'THE CONVERSATION HAPPENED',
                body: `You let them go. It takes forty minutes and they cry briefly and you handle it as well as you are able, which is not well.`,
                tone: 'bad',
                fx: { biz: { employees: -1, expenses: -2100, rep: -8 }, stress: 16, happiness: -10 },
              },
            ],
          },
        ],
      },
      {
        text: 'Hire nobody. Work more hours instead.',
        tag: 'bold',
        time: 2,
        outcomes: [
          {
            title: 'YOU DID IT ALL YOURSELF',
            body: `Sixty-hour weeks, for eight months, and a quality of output you are genuinely proud of, and a slow, creeping flatness that arrives at about month six.

You have saved $34,000 in salary and you will spend significantly more than that in health, relationships and one very bad November.`,
            tone: 'mixed',
            fx: { stress: 26, health: -12, energy: -16, biz: { rep: 10, health: 4 }, money: 1400, happiness: -6 },
          },
        ],
      },
      {
        text: 'Hire your {friend} as a favour',
        tag: 'chaotic',
        highRisk: true,
        time: 2,
        outcomes: [
          {
            title: 'YOU HIRED A FRIEND',
            body: `He is capable, he is loyal, he is free in three weeks, and you have both agreed this will be strictly professional, out loud, using those exact words.

The first month is excellent. The fourth month is when you have to tell him something about his performance in a room, with a door closed.`,
            tone: 'chaos',
            fx: { biz: { expenses: 2900, employees: 1, rep: 4 }, npc: { marcus: 10 }, happiness: 6, counter: { chaos: 1 }, flag: { hiredFriend: 1 } },
            delayed: [
              { inMonths: 7, chance: 0.5, title: 'THE FRIENDSHIP TOOK THE DAMAGE', body: `He is not angry about the feedback. He is angry about the fact that you now have a file on him.`, tone: 'bad', fx: { relationships: -16, npc: { marcus: -26 }, stress: 20, happiness: -10 } },
              { inMonths: 9, chance: 0.3, title: 'IT WORKED THE WAY PEOPLE HOPE IT WILL', body: `Four years later he is running the thing when you are away and neither of you ever mentions the word trust because it is simply established.`, tone: 'good', fx: { biz: { rep: 14, health: 12, revenue: 2600 }, npc: { marcus: 20 }, happiness: 14 } },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'biz_raise_prices',
    title: 'THE MATH IS NOT WORKING',
    body: `You have run the numbers at 23:00 for the fourth night in a row and they say the same thing: you are busy and you are not making money, and the gap between those two facts is a pricing decision you have been avoiding since the day you started.`,
    art: 'business_pricing',
    cat: 'business',
    weight: 13,
    cooldown: 20,
    when: { businesses: { count: [1, 9] } },
    choices: [
      {
        text: 'Raise prices 22%. Communicate it properly.',
        tag: 'bold',
        time: 2,
        outcomes: [
          {
            title: 'YOU RAISED PRICES AND TOLD EVERYONE WHY',
            body: `A genuine, well-written note: what changed, what it costs, what it pays for. Two clients leave. Four stay and one of them says "honestly, you should have done this a year ago."

The business is smaller and it is finally profitable, which is a trade you would make again.`,
            tone: 'good',
            fx: { biz: { revenue: 2200, rep: 8, health: 16 }, money: 1800, happiness: 10, stress: -6, counter: { smartBusiness: 1 } },
          },
        ],
      },
      {
        text: 'Raise prices quietly and hope nobody notices',
        tag: 'risky',
        highRisk: true,
        time: 2,
        outcomes: [
          {
            title: 'YOU DID IT QUIETLY',
            body: `No announcement. New invoices, new number, and a fortnight of low-level dread every time an email arrives.

Most people do not notice. One person does, and does not say anything, and simply stops, and you never find out which of them it was.`,
            tone: 'mixed',
            fx: { biz: { revenue: 1600, rep: -6, health: 8 }, money: 900, stress: 10 },
          },
        ],
      },
      {
        text: 'Cut costs instead',
        tag: 'safe',
        time: 2,
        outcomes: [
          {
            title: 'YOU ATTACKED THE COSTS',
            body: `You renegotiate everything, cancel three subscriptions you had forgotten about, and switch suppliers to a company with a worse website and better prices.

It gets you 80% of the way to profit and costs nothing except four very boring Saturdays.`,
            tone: 'good',
            fx: { biz: { expenses: -1400, health: 12 }, stress: 6, happiness: 4, counter: { sensible: 1 } },
          },
        ],
      },
      {
        text: 'Take a loan and grow out of the problem',
        tag: 'chaotic',
        highRisk: true,
        time: 3,
        outcomes: [
          {
            title: 'YOU BORROWED TO SCALE',
            body: `The money arrives as a single line in an account and it is genuinely thrilling, and it is also now a monthly obligation that exists independently of whether the growth materialises.

You expand. You hire. You sign a lease.`,
            tone: 'chaos',
            fx: { money: 34000, debt: 34000, stress: 18, biz: { revenue: 4200, expenses: 3100, employees: 2, health: 6 }, counter: { loansTaken: 1, chaos: 1 }, flag: { leveraged: 1 } },
            delayed: [
              { inMonths: 9, chance: 0.45, title: 'IT WORKED AND YOU PAID IT BACK EARLY', body: `The expansion paid for itself in eight months. You clear the loan with a genuine, childish sense of superiority.`, tone: 'good', fx: { debt: -34000, money: 12000, happiness: 18, reputation: 10, biz: { health: 14 } } },
              { inMonths: 9, chance: 0.55, title: 'THE OBLIGATION OUTLIVED THE GROWTH', body: `The growth was real and slower than the loan. You are now working for a bank you have never met, at a rate you agreed to in a better mood.`, tone: 'bad', fx: { stress: 28, happiness: -14, biz: { health: -18 }, money: -4000 } },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'biz_key_employee_quits',
    title: 'YOUR BEST PERSON IS LEAVING',
    body: `They ask for five minutes and then say "I've been offered something and I think I'm going to take it," and the sentence lands in your stomach before it lands in your head.

They know everything. They do the thing you cannot do. They have been, quietly, the reason the last eighteen months worked.`,
    art: 'business_resignation',
    cat: 'business',
    weight: 13,
    cooldown: 30,
    when: { businesses: { count: [1, 9] } },
    choices: [
      {
        text: 'Counteroffer. Pay what they are worth.',
        tag: 'bold',
        time: 2,
        outcomes: [
          {
            title: 'YOU PAID TO KEEP THEM',
            body: `You offer 28% more and a title, and they take it after a weekend of thinking, and the relief is enormous and short-lived.

They are now the most expensive person in the business and they know exactly how much they are worth to you.`,
            tone: 'mixed',
            fx: { biz: { expenses: 2600, rep: 6 }, stress: 8, money: -400, flag: { keptThem: 1 } },
            delayed: [
              { inMonths: 11, chance: 0.5, title: 'THEY LEFT ANYWAY', body: `Twelve months later, more money and slightly less guilt, and this time they tell you at a better moment. There is nothing you can do and you have paid $31,000 for the delay.`, tone: 'bad', fx: { biz: { expenses: -2600, rep: -10, health: -8 }, stress: 18, happiness: -10 } },
              { inMonths: 11, chance: 0.3, title: 'IT WAS ACTUALLY ABOUT THE MONEY', body: `It was about the money. They are visibly happier, visibly more committed, and have stopped job-hunting, which you can tell because of the quality of everything.`, tone: 'good', fx: { biz: { rep: 12, revenue: 2200, health: 10 }, happiness: 10 } },
            ],
          },
        ],
      },
      {
        text: 'Wish them well and let them go',
        tag: 'smart',
        time: 2,
        outcomes: [
          {
            title: 'YOU LET THEM GO GRACEFULLY',
            body: `You do it properly: handover, a real reference, a genuine goodbye, and a drink that is slightly sad.

They leave on excellent terms and, three months later, recommend a client to you that pays for two years of their salary.`,
            tone: 'good',
            fx: { biz: { employees: -1, expenses: -2200, rep: 4 }, stress: 12, happiness: -6, npc: { priya: 10 } },
            delayed: [
              {
                inMonths: 8,
                chance: 0.6,
                title: 'THEY SENT SOMEBODY BETTER',
                body: `An email: "I worked with this person for four years. They're better than me. Hiring them is the easiest decision you'll make this year."`,
                tone: 'good',
                fx: { biz: { employees: 1, expenses: 2800, rep: 14, revenue: 3400, health: 12 }, happiness: 14, reputation: 8 },
              },
            ],
          },
        ],
      },
      {
        text: 'Make it extremely difficult for them to leave',
        tag: 'chaotic',
        highRisk: true,
        time: 2,
        outcomes: [
          {
            title: 'YOU REMINDED THEM ABOUT THE CONTRACT',
            body: `There is a non-compete. There is a notice period. There is a clause. You mention all three in one conversation and you watch their face change and you understand, immediately, that you have won something and lost something larger.

They stay for the notice period and they do the absolute minimum. They tell this story in interviews for the rest of their career.`,
            tone: 'chaos',
            fx: { biz: { rep: -16, health: -14, employees: -1, expenses: -2200 }, reputation: -14, stress: 20, counter: { chaos: 1 }, flag: { nastyExit: 1 } },
            delayed: [
              {
                inMonths: 7,
                chance: 0.5,
                title: 'THE INDUSTRY IS SMALLER THAN YOU THINK',
                body: `Two prospective clients have heard a version of the story. One of them says, on a call, "we heard something about how you handled a departure."`,
                tone: 'bad',
                fx: { reputation: -12, biz: { rep: -10 }, stress: 16, happiness: -10 },
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'biz_acquisition_small',
    title: 'SOMEBODY WANTS TO BUY IT',
    body: `It comes by email, from a company you have vaguely heard of, in language that is warm and completely non-committal.

The number is eight times what the business is worth on paper. It is also, if you are honest, the number that would let you stop worrying about a specific letter from a bank.`,
    art: 'business_offer',
    cat: 'business',
    weight: 12,
    cooldown: 999,
    priority: 2,
    when: { businesses: { count: [1, 9] }, age: [26, 68] },
    choices: [
      {
        text: 'Sell. Take the money.',
        tag: 'bold',
        time: 3,
        outcomes: [
          {
            title: 'YOU SOLD THE COMPANY',
            body: `Nine weeks of lawyers, three revisions, and a genuinely emotional moment in a conference room where you sign your own name on a document that removes something you built from your own life.

The money lands on a Thursday. You sit in a car park and check the banking app four times, which is what everybody does.`,
            tone: 'good',
            fx: {
              money: 84000,
              biz: { close: 'sold' },
              happiness: 16,
              stress: -14,
              reputation: 14,
              counter: { businessesSold: 1, bigWins: 1 },
              flag: { soldBusiness: 1 },
              milestone: 'Sold a business',
              log: 'Sold the company',
            },
            delayed: [
              {
                inMonths: 14,
                chance: 0.5,
                title: 'THEY SHUT IT DOWN',
                body: `The acquirer "integrated the assets and sunset the brand," which means that the thing you built now exists only in a folder of screenshots you took because you could not quite believe it was real.`,
                tone: 'mixed',
                fx: { happiness: -12, reputation: -4, stress: 10 },
              },
              {
                inMonths: 20,
                chance: 0.35,
                title: 'THE ITCH RETURNED',
                body: `It always returns. You have money and time and a specific kind of empty that only exists in people who have already sold something.`,
                tone: 'mixed',
                fx: { happiness: -6, stress: 8, flag: { eligibleAgain: 1 } },
              },
            ],
          },
        ],
      },
      {
        text: 'Reject it. You are not finished.',
        tag: 'bold',
        time: 2,
        outcomes: [
          {
            title: 'YOU SAID NO TO EIGHTY-FOUR THOUSAND DOLLARS',
            body: `You write a gracious reply and you mean about 60% of it. The number sits in your head for the next three years and appears, unhelpfully, at 3am on several occasions.`,
            tone: 'mixed',
            fx: { stress: 10, happiness: 4, reputation: 6, biz: { health: 8, rep: 8 }, flag: { refusedOffer: 1 } },
          },
        ],
      },
      {
        text: 'Negotiate. Ask for 60% more.',
        tag: 'smart',
        time: 3,
        outcomes: [
          { weight: 3, variance: 1, title: 'THEY SAID YES', body: `They say yes. They say yes immediately, which means you should have asked for more, which is a specific kind of agony to experience while receiving a great deal of money.`, tone: 'good', fx: { money: 129000, biz: { close: 'sold' }, happiness: 20, reputation: 16, stress: -12, counter: { businessesSold: 1, bigWins: 1, negotiations: 1 }, flag: { soldBusiness: 1 }, milestone: 'Sold a business' } },
          { weight: 4, variance: 1, title: 'THEY WALKED', body: `"We completely understand, and we wish you the very best." Fourteen words. And then nothing, for a year, and then a competitor of yours is bought by the same company for the number they offered you.`, tone: 'bad', fx: { stress: 20, happiness: -14, reputation: -4, flag: { bargainFailed: 1 } } },
        ],
      },
      {
        text: 'Ask them to buy half',
        tag: 'chaotic',
        highRisk: true,
        time: 3,
        outcomes: [
          {
            title: 'YOU SOLD 51% AND KEPT 49%',
            body: `You get $46,000 in cash and a minority stake, and a board member, and a monthly meeting in which you explain your own decisions to a man called Graham.

You are no longer the owner of the thing you made. You are, as Graham phrases it in the second meeting, "the founder, which is a different role."`,
            tone: 'chaos',
            fx: {
              money: 46000,
              happiness: 8,
              stress: 22,
              reputation: 10,
              biz: { rep: 8 },
              counter: { bigWins: 1, chaos: 1 },
              flag: { soldHalf: 1, hasGraham: 1 },
            },
            delayed: [
              {
                inMonths: 12,
                chance: 0.5,
                title: 'GRAHAM HAS A VIEW',
                body: `The board wants to change the thing that made it work, because the thing that made it work does not appear on a spreadsheet under a heading Graham recognises.`,
                tone: 'mixed',
                fx: { stress: 24, happiness: -10, biz: { health: -14, rep: -6 } },
              },
              {
                inMonths: 24,
                chance: 0.3,
                title: 'THE STATE OF THE MARKET',
                body: `They buy you out completely at a valuation none of you expected, and you have twice the money and none of the business and a specific feeling you were not expecting.`,
                tone: 'good',
                fx: { money: 320000, happiness: 14, stress: -20, reputation: 18, counter: { bigWins: 1 }, milestone: 'Sold a business' },
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'biz_big_acquisition',
    title: 'TWO MILLION DOLLARS',
    body: `It is a large company. There is a person from their corporate development team who is genuinely nice and has done this forty times, and two slides, and a number with seven digits in it.

"This is a very straightforward proposal," she says.

It is not straightforward. That is why she said it.`,
    art: 'business_bigoffer',
    cat: 'business',
    weight: 0,
    cooldown: 999,
    priority: 3,
    when: {
      businesses: { count: [1, 9] },
      stats: { career: [70, 100] },
      flags: { bigEnoughToSell: [1, null] },
    },
    choices: [
      {
        text: 'Sell. Two million dollars, done.',
        hint: 'Financial freedom. Emotional paperwork.',
        tag: 'bold',
        time: 4,
        outcomes: [
          {
            title: 'YOU SOLD FOR TWO MILLION DOLLARS',
            body: `It takes eleven weeks and involves a document that must be signed using a specific pen, and there is a moment in a glass room where everyone is smiling and you are thinking about a Friday in the first year when you could not make payroll.

$1.34 million after fees and tax. It lands, and the world does not change at all, except permanently.`,
            tone: 'good',
            art: 'business_success',
            fx: {
              money: 1340000,
              biz: { close: 'sold' },
              happiness: 24,
              stress: -30,
              reputation: 24,
              counter: { businessesSold: 1, bigWins: 1 },
              flag: { soldBig: 1, wealthy: 1 },
              milestone: 'Sold a company for seven figures',
              log: 'Sold the company for $2M',
            },
            delayed: [
              {
                inMonths: 8,
                chance: 0.7,
                title: 'EVERYONE WOULD LIKE A WORD',
                body: `The messages start within a fortnight. Old friends, second cousins, a man from school who has a project. Four of them are genuine opportunities. Six are the same conversation wearing different clothes.`,
                tone: 'mixed',
                fx: { stress: 16, relationships: -6 },
                queue: [{ id: 'chain_big_money_friends', inMonths: 2 }],
              },
            ],
          },
        ],
      },
      {
        text: 'Reject it. You have not finished.',
        tag: 'bold',
        time: 3,
        outcomes: [
          {
            title: 'YOU TURNED DOWN TWO MILLION DOLLARS',
            body: `You do it calmly, in a real meeting, with a real rationale, and the nice woman from corporate development says "I understand completely, and for what it's worth, I think you might be right."

Almost nobody in your life understands it. Your brother does. Your mother does not and says so.`,
            tone: 'mixed',
            fx: {
              stress: 18,
              happiness: 8,
              reputation: 12,
              biz: { health: 12, rep: 14 },
              flag: { refusedBig: 1 },
              counter: { gambles: 1 },
              log: 'Turned down a $2M acquisition',
            },
            delayed: [
              { inMonths: 22, chance: 0.35, title: 'YOU WERE RIGHT', body: `A competitor buys the market and the category explodes, and your position in it is now what people are paying attention to.`, tone: 'good', fx: { money: 900000, happiness: 22, reputation: 24, counter: { bigWins: 1 }, flag: { wealthy: 1 } } },
              { inMonths: 22, chance: 0.4, title: 'YOU WERE WRONG', body: `The category collapses. A platform moves into it, prices go to zero, and the same company buys a competitor for $400,000 eighteen months later.`, tone: 'bad', fx: { stress: 30, happiness: -20, biz: { health: -30, revenue: -4000 }, flag: { bigMiss: 1 } } },
              { inMonths: 22, chance: 0.25, title: 'IT JUST KEPT GOING, MODESTLY', body: `No explosion, no collapse. A good business, paying you a good living, for as long as you are prepared to run it.`, tone: 'mixed', fx: { income: 4000, happiness: 10, milestone: 'Built something that lasted' } },
            ],
          },
        ],
      },
      {
        text: 'Negotiate hard',
        tag: 'smart',
        time: 4,
        outcomes: [
          { weight: 5, variance: 1, title: 'YOU GOT THREE POINT FOUR', body: `You hold out, you bring in your own lawyer at a cost that makes you wince, and you get 70% more than the opening number.

They do not enjoy it. They respect it. You get $2.28 million after everything.`,
            tone: 'good', art: 'business_success',
            fx: { money: 2280000, biz: { close: 'sold' }, happiness: 26, stress: -20, reputation: 26, counter: { businessesSold: 1, bigWins: 1, negotiations: 1 }, flag: { soldBig: 1, wealthy: 1 }, milestone: 'Sold a company for seven figures' },
          },
          { weight: 4, variance: 1, title: 'THEY WITHDREW', body: `"We've decided to pursue a different opportunity." Which is fourteen words for: you pushed too hard and they found somebody cheaper. You have no income from it, no exit, and an expensive lawyer.`, tone: 'bad', fx: { money: -22000, stress: 30, happiness: -18, biz: { health: -16 }, flag: { lostDeal: 1 } } },
        ],
      },
      {
        text: 'Sell half your ownership',
        tag: 'chaotic',
        highRisk: true,
        time: 4,
        outcomes: [
          {
            title: 'YOU SOLD HALF',
            body: `$670,000 in cash and half of your shares, and a new board and a new boss and a new quarterly cadence that you agreed to while standing up.

You have more money than you have ever had and less control than you have had since you were twenty-four.`,
            tone: 'chaos',
            fx: {
              money: 670000,
              happiness: 12,
              stress: 26,
              reputation: 16,
              biz: { rep: 6 },
              counter: { bigWins: 1, chaos: 1 },
              flag: { soldHalfBig: 1 },
            },
            delayed: [
              { inMonths: 16, chance: 0.4, title: 'THEY BOUGHT THE REST', body: `A second transaction, at a valuation that makes the first look like a rounding error, and you are out entirely and extremely wealthy.`, tone: 'good', fx: { money: 1900000, happiness: 20, stress: -24, reputation: 20, flag: { wealthy: 1 }, milestone: 'Sold a business' } },
              { inMonths: 16, chance: 0.6, title: 'YOU WERE VOTED OFF THE BOARD', body: `You retain your shares and lose the company. Somebody uses the phrase "founder transition" in a meeting you are attending.`, tone: 'bad', fx: { happiness: -20, stress: 26, career: -10, biz: { health: -14 }, flag: { ousted: 1 } } },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'biz_audit',
    title: 'THERE IS A LETTER FROM THE TAX OFFICE',
    body: `It is not a letter about money. It is a letter about records, which is either much better or much worse, depending on what is in your records.

Your records are in three places, one of which is a shoebox, and one of which is an email account you have not accessed since the business started.`,
    art: 'business_audit',
    cat: 'business',
    weight: 11,
    cooldown: 60,
    when: { businesses: { count: [1, 9] }, minCash: 2000 },
    choices: [
      {
        text: 'Get an accountant. Do it properly.',
        tag: 'smart',
        time: 3,
        outcomes: [
          {
            title: 'YOU HIRED AN ACCOUNTANT',
            body: `She is sixty, deeply unimpressed by you, and extremely good. She finds four things you did wrong, three of which are fixable, and one deduction you had not claimed.

The audit closes with a small penalty and no further action, which is the best possible outcome and costs $3,400 to achieve.`,
            tone: 'good',
            fx: { money: -3400, stress: 12, biz: { health: 12, rep: 6 }, happiness: 6, counter: { sensible: 1 } },
          },
        ],
      },
      {
        text: 'Handle it yourself',
        tag: 'risky',
        highRisk: true,
        time: 3,
        outcomes: [
          {
            title: 'YOU REPLIED TO THE LETTER YOURSELF',
            body: `Eleven evenings. A spreadsheet that starts to make sense at about hour nine. A genuine, deep understanding of the paperwork of your own business, which in fairness you should have had two years ago.

You get through it. The penalty is $6,100 and it could have been much worse.`,
            tone: 'mixed',
            fx: { money: -6100, stress: 24, biz: { health: 6 }, happiness: -6, counter: { survivedAudit: 1 } },
          },
        ],
      },
      {
        text: 'Panic and hide the shoebox',
        tag: 'chaotic',
        highRisk: true,
        time: 3,
        outcomes: [
          {
            title: 'YOU MADE IT CONSIDERABLY WORSE',
            body: `You provide partial records, then amended records, then an explanation, then a different explanation. Each one is internally consistent and they do not agree with each other.

What would have been a penalty becomes an investigation, and an investigation has a calendar, and the calendar has your name on every page.`,
            tone: 'chaos',
            fx: {
              money: -14000,
              stress: 36,
              reputation: -14,
              biz: { health: -24, rep: -12 },
              counter: { chaos: 1 },
              flag: { underInvestigation: 1 },
            },
            delayed: [
              {
                inMonths: 9,
                chance: 0.6,
                title: 'THE INVESTIGATION CLOSED',
                body: `No charges. A genuinely enormous final bill, a formal note on your record as a business, and eleven months of your life you will never describe as a good use of time.`,
                tone: 'bad',
                fx: { money: -22000, stress: 24, happiness: -14, biz: { health: -10 } },
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'biz_partner_conflict',
    title: 'YOUR BUSINESS PARTNER HAS STOPPED PULLING',
    body: `It has been building for months. Late, then absent, then present but not really, and then a message that says "can we talk about my role" at 23:40 on a Sunday.

You own this together. In paperwork, it is 50/50, which was a lovely thing to write down in a café two years ago.`,
    art: 'business_partner',
    cat: 'business',
    weight: 12,
    cooldown: 60,
    when: { businesses: { count: [1, 9] }, age: [24, 62] },
    choices: [
      {
        text: 'Have the honest conversation',
        tag: 'smart',
        time: 2,
        outcomes: [
          {
            title: 'YOU TALKED FOR FOUR HOURS',
            body: `Two hours of it was not about work. The actual problem was a thing that happened in March that neither of you had named, and once it was named, the rest of it came apart in about forty minutes.

You agree a new split. It is genuinely fair and it took two years to reach.`,
            tone: 'good',
            fx: { stress: -10, happiness: 8, biz: { health: 12, rep: 6 }, npc: { marcus: 12 }, flag: { partnerReconciled: 1 } },
          },
        ],
      },
      {
        text: 'Buy them out',
        tag: 'bold',
        time: 3,
        outcomes: [
          {
            title: 'YOU BOUGHT THEM OUT',
            body: `It costs $40,000 and it is the most grown-up financial act of your life. The paperwork takes six weeks and the handshake takes four seconds.

You own 100% of something for the first time. Everything is now definitively your fault.`,
            tone: 'mixed',
            fx: {
              money: -40000,
              stress: 14,
              happiness: 6,
              biz: { rep: 6, health: 8 },
              flag: { soleOwner: 1 },
              counter: { negotiations: 1 },
            },
            delayed: [
              {
                inMonths: 12,
                chance: 0.5,
                title: 'YOU FOUND OUT WHAT THEY WERE ACTUALLY DOING',
                body: `By accident, going through the old CRM: a quarter of the client base was their relationships, not the company's. You own a business and no longer own the reason people called it.`,
                tone: 'bad',
                fx: { biz: { revenue: -3800, health: -16 }, stress: 22, happiness: -12 },
              },
            ],
          },
        ],
      },
      {
        text: 'Sell your half to them',
        tag: 'safe',
        time: 2,
        outcomes: [
          {
            title: 'YOU SOLD YOUR HALF',
            body: `$34,000 and you walk away from two years of work, and the strange part is how light you feel for about six weeks and how specific the emptiness is after that.

They rename it three months later. You find out from a leaflet.`,
            tone: 'mixed',
            fx: { money: 34000, stress: -20, happiness: -6, biz: { close: 'sold' }, flag: { walkedAway: 1 }, counter: { businessesSold: 1 } },
          },
        ],
      },
      {
        text: 'Do nothing and let it rot',
        tag: 'lazy',
        time: 3,
        outcomes: [
          {
            title: 'NEITHER OF YOU SAID ANYTHING',
            body: `Six months of polite, load-bearing avoidance. The business gets smaller in a way that neither of you could point to on any specific day.

Two people running something badly together is much worse than one person running it badly alone, which is a thing you now know.`,
            tone: 'bad',
            fx: { biz: { health: -22, revenue: -2400, rep: -8 }, stress: 18, happiness: -12, relationships: -8 },
          },
        ],
      },
    ],
  },

  {
    id: 'biz_expand',
    title: 'A SECOND LOCATION IS AVAILABLE',
    body: `Same street as your best customers, and a lease at a price that is either an opportunity or a trap depending on a footfall figure that was given to you verbally by a man who is very keen.`,
    art: 'business_expand',
    cat: 'business',
    weight: 12,
    cooldown: 36,
    when: { businesses: { count: [1, 9] }, minCash: 26000 },
    choices: [
      {
        text: 'Take the lease. Expand.',
        tag: 'bold',
        time: 4,
        outcomes: [
          {
            title: 'YOU SIGNED A SECOND LEASE',
            body: `Sixty-one pages and a guarantee you signed twice. There is a fit-out period, a new team, and a fortnight where you genuinely wonder if you have ruined your life.

You are now an operator rather than a maker, and those are completely different jobs.`,
            tone: 'mixed',
            fx: {
              money: -26000,
              expense: 2400,
              stress: 24,
              biz: { revenue: 5200, expenses: 3600, employees: 3, rep: 10, health: 4 },
              counter: { expansions: 1 },
            },
            delayed: [
              { inMonths: 10, chance: 0.45, title: 'THE SECOND ONE OUTPERFORMED THE FIRST', body: `It is busier, newer and better staffed, and the original now looks slightly tired in a way you cannot unsee.`, tone: 'good', fx: { income: 2600, happiness: 16, reputation: 12, biz: { health: 14 } } },
              { inMonths: 10, chance: 0.55, title: 'TWO LOCATIONS, THREE PROBLEMS', body: `You cannot be in both. The newer one suffers when you are at the older one and the older one suffers when you are not. You have doubled the business and quadrupled the management.`, tone: 'bad', fx: { stress: 28, happiness: -12, biz: { health: -18, rep: -8 }, expense: 600 } },
            ],
          },
        ],
      },
      {
        text: 'Decline. Improve the one you have.',
        tag: 'smart',
        time: 2,
        outcomes: [
          {
            title: 'YOU INVESTED IN WHAT EXISTS',
            body: `The money that would have been a second lease goes into the first: refurbishment, better equipment, a proper website, and two pay rises for people who deserve them.

The business gets quieter and better and more profitable, in that order.`,
            tone: 'good',
            fx: { money: -9000, biz: { rep: 16, health: 18, revenue: 1800 }, happiness: 10, stress: -8, counter: { smartBusiness: 1 } },
          },
        ],
      },
      {
        text: 'Franchise it instead',
        tag: 'chaotic',
        highRisk: true,
        time: 5,
        outcomes: [
          {
            title: 'YOU WROTE A FRANCHISE MANUAL',
            body: `Seventy pages. Operational standards, a training schedule, a brand book. You have started using the word "systemise" unironically.

Two franchisees sign in the first year and both of them immediately do things differently.`,
            tone: 'chaos',
            fx: {
              income: 2200,
              stress: 20,
              reputation: 12,
              biz: { rep: 10, revenue: 3000 },
              counter: { chaos: 1 },
              flag: { franchised: 1 },
            },
            delayed: [
              { inMonths: 14, chance: 0.5, title: 'A FRANCHISEE WENT OFF-BRAND', body: `One of them has changed the recipe, the prices and the paint colour, and customers are leaving one-star reviews about food you have never served.`, tone: 'bad', fx: { reputation: -16, biz: { rep: -16, health: -10 }, stress: 20, income: -900 } },
              { inMonths: 20, chance: 0.3, title: 'THE ROYALTIES COMPOUNDED', body: `Six locations, none of which you have ever stood inside, all of which pay you on the first of the month.`, tone: 'good', fx: { income: 5400, happiness: 18, money: 24000, reputation: 16, flag: { passiveIncome: 1 } } },
            ],
          },
        ],
      },
    ],
  },
];
