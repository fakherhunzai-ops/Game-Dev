import type { GameEvent } from '../../engine/types';

/**
 * INVESTING
 *
 * The market has real boom/bust cycles (see state.ts tickMarket). These events
 * let the player buy in, panic, hold, or get greedy — and the delayed payoffs
 * are what make a decision at 26 feel enormous at 34.
 */
export const investingEvents: GameEvent[] = [
  {
    id: 'invest_first_index',
    title: 'YOU HAVE MONEY SITTING IN AN ACCOUNT DOING NOTHING',
    body: `It is not a lot. It is, however, more than the recommended three months of expenses, which means that every month it sits there it is technically getting slightly worse.

A colleague has explained index funds to you twice. The second time you understood it.`,
    art: 'invest_chart',
    cat: 'investing',
    weight: 15,
    cooldown: 24,
    when: { minCash: 5000, age: [22, 70] },
    choices: [
      {
        text: 'Invest $5,000 in a boring index fund',
        tag: 'smart',
        time: 2,
        requires: { minCash: 5000 },
        fx: {
          money: -5000,
          flag: { indexInvestor: 1 },
          milestone: 'Started investing',
          counter: { investments: 1 },
        },
        outcomes: [
          {
            title: 'YOU BOUGHT THE BORING THING',
            body: `It takes eleven minutes and it is the most financially responsible thing you have ever done, which is a slightly sad reflection on the rest of your life.

You check the value four times a day for the first week and then, gradually, once a month.`,
            tone: 'good',
            fx: { happiness: 6, stress: -4 },
            delayed: [
              {
                inMonths: 18,
                chance: 0.75,
                title: 'IT DID THE THING IT IS SUPPOSED TO DO',
                body: `Slowly, without drama, over eighteen months. You sell nothing and do nothing and the number is meaningfully larger than you put in.`,
                tone: 'good',
                fx: { money: 2100, happiness: 8, counter: { patientInvestor: 1 } },
              },
              {
                inMonths: 10,
                chance: 0.45,
                title: 'THE CRASH',
                body: `Twenty-nine percent down in seven weeks. It is in the news constantly. Your colleague has stopped mentioning index funds.`,
                tone: 'bad',
                art: 'invest_crash',
                fx: { stress: 18 },
                queue: [{ id: 'chain_market_crash', inMonths: 1 }],
              },
            ],
          },
        ],
      },
      {
        text: 'Pick individual stocks. You have read things.',
        tag: 'risky',
        highRisk: true,
        time: 2,
        requires: { minCash: 5000 },
        fx: { money: -5000, flag: { stockPicker: 1 }, counter: { investments: 1 } },
        outcomes: [
          { weight: 5, variance: 1, title: 'YOU ARE CLEARLY A GENIUS', body: `Two positions, both up, one of them up 60%. You have begun to develop a philosophy, which you explain to {friend} at a barbecue for eleven minutes.`, tone: 'good', fx: { money: 4200, happiness: 12, reputation: 4, flag: { luckyPicker: 1 } } },
          { weight: 6, variance: 1, title: 'THE ONE YOU LIKED MOST WENT TO ZERO', body: `The company had a genuinely compelling story and a genuinely absent product, which you would have noticed if you had read past the third paragraph.`, tone: 'bad', fx: { money: -5000, stress: 20, happiness: -12, counter: { losses: 1 } } },
          { weight: 3, variance: 2, title: 'YOU MADE TEN TIMES YOUR MONEY AND IT RUINED YOU', body: `A position that goes up 900% in fourteen months. It is genuinely life-changing and it teaches you something false about yourself that will cost you more than it made.`, tone: 'chaos', fx: { money: 45000, happiness: 18, stress: 12, counter: { bigWins: 1, chaos: 1 }, flag: { earlyWin: 1, overconfident: 1 } } },
        ],
      },
      {
        text: 'Invest in crypto. The whole thing.',
        tag: 'chaotic',
        highRisk: true,
        time: 2,
        requires: { minCash: 6000 },
        fx: { money: -6000, flag: { cryptoBro: 1 }, counter: { investments: 1, chaos: 1 } },
        outcomes: [
          { weight: 3, variance: 2, title: 'IT WENT UP BY A FACTOR OF ELEVEN', body: `You cannot explain why. Nobody can explain why. You sell at the top, by accident, because you needed the money for a car, and this is the only piece of luck you will ever be able to point to.`, tone: 'good', fx: { money: 66000, happiness: 22, stress: 16, reputation: 6, counter: { bigWins: 1, chaos: 1 }, flag: { earlyWin: 1 } } },
          { weight: 7, variance: 1, title: 'IT WENT DOWN BY A FACTOR OF ELEVEN', body: `It takes five months, which is the cruel part, because for the first three you were up.`, tone: 'bad', fx: { money: -6000, stress: 24, happiness: -14, counter: { losses: 1 } } },
        ],
      },
      {
        text: 'Keep it in cash. Sleep fine.',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU KEPT IT IN CASH',
            body: `It is genuinely defensible and you will be told it was the wrong decision by at least two people within a year, both of whom will be correct and both of whom will be insufferable about it.`,
            tone: 'neutral',
            fx: { stress: -4, counter: { sensible: 1 } },
          },
        ],
      },
    ],
  },

  {
    id: 'invest_property_rental',
    title: 'A SMALL FLAT IS FOR SALE AND THE NUMBERS WORK',
    body: `$156,000. A 22% deposit. Rent covers the mortgage and about $180 a month on top, which is not life-changing but is four figures a year for holding an asset that, historically, goes up.

You have seen the boiler. The boiler is a genuine risk factor.`,
    art: 'invest_property',
    cat: 'investing',
    weight: 12,
    cooldown: 60,
    when: { minCash: 40000, age: [25, 65] },
    choices: [
      {
        text: 'Buy it. Become a landlord.',
        tag: 'bold',
        time: 4,
        requires: { minCash: 38000 },
        fx: {
          money: -34000,
          mortgage: 122000,
          income: 180,
          flag: { landlord: 1 },
          tag: ['landlord'],
          counter: { propertiesBought: 1 },
          milestone: 'Bought an investment property',
          log: 'Bought a rental property',
        },
        outcomes: [
          {
            title: 'YOU OWN A FLAT YOU DO NOT LIVE IN',
            body: `There is a tenant, a tenancy agreement, a boiler that is twelve years old, and a phone number you now have to answer.

It is genuinely passive for four months. Then it is genuinely not.`,
            tone: 'mixed',
            fx: { happiness: 8, stress: 12, reputation: 6 },
            delayed: [
              { inMonths: 9, chance: 0.55, title: 'THE BOILER DID THE THING', body: `November. A tenant without heating. An emergency call-out at a rate that is only offered to people without options. $2,600 and a genuinely apologetic plumber.`, tone: 'bad', fx: { money: -2600, stress: 16, happiness: -6 } },
              { inMonths: 26, chance: 0.5, title: 'IT APPRECIATED, QUIETLY', body: `A remortgage valuation comes back $41,000 higher than what you paid, and the rent has gone up twice without you doing anything at all.`, tone: 'good', fx: { money: 12000, happiness: 14, reputation: 8, counter: { propertyGains: 1 } } },
            ],
          },
        ],
      },
      {
        text: 'Buy it and live in it',
        tag: 'smart',
        time: 4,
        requires: { minCash: 38000 },
        fx: {
          money: -34000,
          mortgage: 122000,
          stress: -6,
          happiness: 14,
          moveTo: 'one_bed',
          flag: { landlord: 0, homeowner: 1 },
          tag: ['homeowner'],
          counter: { propertiesBought: 1 },
          milestone: 'Bought a home',
        },
        outcomes: [
          {
            title: 'YOU BOUGHT A FLAT THAT YOU LIVE IN',
            body: `No tenant, no agent, no phone calls at 22:00. Just a mortgage that is less than the rent you were paying, in a place that is genuinely yours.

The boiler is now your problem and it is also now your boiler.`,
            tone: 'good',
            fx: { expense: -200, happiness: 14 },
          },
        ],
      },
      {
        text: 'Look at the boiler. Walk away.',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU WALKED AWAY OVER A BOILER',
            body: `It is a genuinely sensible decision, and over the next six years that flat roughly doubles in value, which you will be reminded of by the Rightmove alerts you never turned off.`,
            tone: 'neutral',
            fx: { happiness: -4, counter: { sensible: 1 } },
          },
        ],
      },
      {
        text: 'Go all in. Buy three units in the same building.',
        tag: 'chaotic',
        highRisk: true,
        time: 6,
        requires: { minCash: 105000 },
        outcomes: [
          {
            title: 'YOU BOUGHT THREE FLATS',
            body: `You are now a property company, whether or not you intended to be, with $366,000 of debt and $540 a month of net rent and a specific new relationship with interest rates.

You think about interest rate announcements the way you used to think about football results.`,
            tone: 'chaos',
            fx: {
              money: -98000,
              mortgage: 366000,
              income: 540,
              stress: 28,
              flag: { landlord: 1, leveraged: 1 },
              tag: ['landlord'],
              counter: { propertiesBought: 3, chaos: 1 },
              milestone: 'Built a property portfolio',
            },
            delayed: [
              { inMonths: 12, chance: 0.5, title: 'RATES MOVED', body: `A remortgage at a rate that was not the rate you had mentally budgeted for, applied to a number that is much larger than your mental budget.`, tone: 'bad', fx: { stress: 30, income: -420, happiness: -14, expense: 380 } },
              { inMonths: 30, chance: 0.4, title: 'YOU BECAME GENUINELY WEALTHY ON PAPER', body: `Three flats, all tenanted, all worth significantly more — and you are now the sort of person whose net worth is discussed at family lunches in a tone you do not entirely enjoy.`, tone: 'good', fx: { money: 48000, happiness: 16, reputation: 16, counter: { propertyGains: 1 }, milestone: 'Property portfolio' } },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'invest_crash_panic',
    title: 'EVERYTHING IS RED',
    body: `The market is down 24% in six weeks. Your phone is a source of genuine physical discomfort. Somebody in your group chat has posted a graph with no caption and everybody knows what it means.

You have made no decisions yet. That is the only thing you have done right.`,
    art: 'invest_crash',
    cat: 'investing',
    weight: 16,
    cooldown: 24,
    priority: 2,
    when: {
      holdings: { count: [1, 9] },
      stats: { stress: [35, 100] },
      age: [23, 75],
      lacks: ['marketCrashDone'],
    },
    choices: [
      {
        text: 'Hold. Do nothing. Close the app.',
        tag: 'smart',
        time: 2,
        outcomes: [
          {
            title: 'YOU DID NOTHING',
            body: `It is the hardest thing you have ever done and it involves no action at all, which is why it is so difficult and why it is correct.

You delete the app for three weeks. You put the phone in a drawer on the worst day.`,
            tone: 'good',
            fx: { stress: -8, happiness: 4, counter: { diamondHands: 1 }, flag: { heldTheCrash: 1 } },
            delayed: [
              {
                inMonths: 20,
                chance: 0.7,
                title: 'IT CAME BACK',
                body: `Higher than it was. It took twenty months and the recovery was boring and nobody wrote a single article about it.`,
                tone: 'good',
                fx: { money: 0, happiness: 16, reputation: 8, counter: { patientInvestor: 1 } },
              },
            ],
          },
        ],
      },
      {
        text: 'Sell everything. Stop the bleeding.',
        tag: 'risky',
        time: 1,
        outcomes: [
          {
            title: 'YOU SOLD',
            body: `The relief lasts about forty minutes and is replaced by a very specific and permanent item in your memory: the number you sold at.

You have realised the loss and you have also, technically, succeeded in making sure it cannot get worse.`,
            tone: 'bad',
            fx: { money: -6000, stress: 16, happiness: -12, counter: { panicSold: 1 }, flag: { soldTheBottom: 1 } },
            delayed: [
              {
                inMonths: 14,
                chance: 0.7,
                title: 'IT RECOVERED WITHOUT YOU',
                body: `The index is now higher than when you sold. You did not lose the money; you simply did not get it back, which is a subtle and expensive distinction.`,
                tone: 'bad',
                fx: { happiness: -10, stress: 12 },
              },
            ],
          },
        ],
      },
      {
        text: 'Buy more. Everyone else is panicking.',
        tag: 'chaotic',
        highRisk: true,
        time: 2,
        requires: { minCash: 4000 },
        outcomes: [
          { weight: 5, variance: 1, title: 'YOU BOUGHT THE BOTTOM', body: `The bottom is only obvious afterwards and you are, for once, standing on it. Eighteen months later the position has almost doubled.`, tone: 'good', fx: { money: 9000, happiness: 20, reputation: 12, stress: -6, counter: { bigWins: 1 }, flag: { boughtTheDip: 1 } } },
          { weight: 5, variance: 1, title: 'IT WAS NOT THE BOTTOM', body: `It fell another 19% over the following five months, and you bought at the second of four bottoms, and you have to sit inside that for a long time.`, tone: 'bad', fx: { money: -4000, stress: 26, happiness: -14, counter: { losses: 1 } } },
        ],
      },
    ],
  },

  {
    id: 'invest_friend_tip',
    title: 'AN INSIDE TIP',
    body: `{friend2} has a friend who works at a company that is "about to be acquired." He is extremely specific. He has a number and a date.

He also, six years ago, told you about a band that was going to be huge.`,
    art: 'invest_tip',
    cat: 'investing',
    weight: 11,
    cooldown: 48,
    when: { minCash: 2500, age: [24, 70] },
    choices: [
      {
        text: 'Put $4,000 in',
        tag: 'risky',
        highRisk: true,
        time: 2,
        requires: { minCash: 4000 },
        outcomes: [
          { weight: 3, variance: 1, title: 'THE ACQUISITION WAS REAL', body: `It happens on the date, at the number. You make $6,100 and you have to sit with the knowledge that this was not judgement, it was proximity.`, tone: 'good', fx: { money: 10100, happiness: 14, reputation: 4, counter: { bigWins: 1 }, flag: { insiderWin: 1 } } },
          { weight: 7, variance: 1, title: 'NOTHING HAPPENED', body: `No acquisition. No announcement. The stock drifts down 8% and your friend's friend stops replying to messages, which tells you everything.`, tone: 'bad', fx: { money: -4000, stress: 12, happiness: -8, npc: { marcus: -4 } } },
        ],
      },
      {
        text: 'Report it. It is insider trading.',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU MENTIONED THE WORD "ILLEGAL"',
            body: `You say it lightly, as a joke, and then you say it again without the joke, and {friend2} goes very quiet and then says "you're right, forget I said anything."

He is slightly odd with you for a month and then entirely normal forever.`,
            tone: 'good',
            fx: { karma: 10, reputation: 6, happiness: 4, npc: { marcus: 6 }, counter: { integrity: 1 } },
          },
        ],
      },
      {
        text: 'Contribute it to the group chat so everyone can laugh',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'YOU POSTED IT IN THE GROUP CHAT',
            body: `Eleven people see it. Two of them act on it. One of them screenshots it, because people screenshot things, and it now exists in a way that cannot be un-existed.`,
            tone: 'chaos',
            fx: { reputation: -8, npc: { marcus: -20 }, stress: 12, counter: { chaos: 1 }, flag: { tippedTheChat: 1 } },
          },
        ],
      },
    ],
  },

  {
    id: 'invest_collectible',
    title: 'A THING YOU COLLECTED AS A TEENAGER IS NOW WORTH MONEY',
    body: `You found it in a box at your parents' house: sealed, in decent condition, and there is a listing online at a genuinely silly number.

Your mother says "I kept meaning to throw that out."`,
    art: 'invest_collectible',
    cat: 'investing',
    weight: 9,
    cooldown: 999,
    when: { age: [26, 60] },
    choices: [
      {
        text: 'Sell it now',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU SOLD IT IN THREE DAYS',
            body: `A buyer, a bank transfer, and a genuinely absurd amount of money for a thing that has been in a box for twelve years.

Your mother does not believe the number. You show her the transfer. She says "well, I never."`,
            tone: 'good',
            fx: { money: 4200, happiness: 12, npc: { mum: 6 }, flag: { soldCollection: 1 } },
          },
        ],
      },
      {
        text: 'Hold it. It is going up.',
        tag: 'risky',
        highRisk: true,
        time: 2,
        outcomes: [
          { weight: 5, variance: 1, title: 'IT DOUBLED', body: `Two years later, the same item, a different listing, a number with one more digit in it. You sell into genuine demand and feel like a very clever person.`, tone: 'good', fx: { money: 11000, happiness: 14, counter: { bigWins: 1 } } },
          { weight: 5, variance: 1, title: 'THE MARKET WAS A SPIKE', body: `It peaks at a number that a handful of people made up, and then the people move on to a different thing, and now it is worth $180 and you have kept it for six years for nothing.`, tone: 'bad', fx: { money: 180, happiness: -8, stress: 6 } },
        ],
      },
      {
        text: 'Give it to your {sibling}',
        tag: 'kind',
        time: 1,
        outcomes: [
          {
            title: 'YOU GAVE IT TO ELI',
            body: `He had the other half of the set. He is genuinely, disproportionately moved by it, in the specific way men are moved by objects.

He sells it a year later for a lot of money and tells you immediately, before he tells anyone else.`,
            tone: 'good',
            fx: { npc: { brother_eli: 24, mum: 8 }, happiness: 12, karma: 8, relationships: 6 },
          },
        ],
      },
    ],
  },

  {
    id: 'invest_financial_advisor',
    title: 'A MAN IN A SUIT WOULD LIKE TO HELP',
    body: `He was recommended by somebody you trust, which is how these things always arrive. He has a laptop, a chart, a warm manner and a fee structure.

He wants 1.2% a year to manage your money, which does not sound like very much, and is the whole point.`,
    art: 'invest_advisor',
    cat: 'investing',
    weight: 10,
    cooldown: 48,
    when: { minCash: 30000, age: [28, 70] },
    choices: [
      {
        text: 'Sign up. Let an adult do it.',
        tag: 'safe',
        time: 2,
        outcomes: [
          {
            title: 'YOU HIRED AN ADVISOR',
            body: `He is entirely competent, does roughly what an index fund would do, and charges 1.2% for the privilege of making you feel better about decisions you were already capable of making.

You stop thinking about money at 23:40, which over a lifetime is genuinely worth something.`,
            tone: 'mixed',
            fx: { expense: 240, stress: -12, happiness: 8, money: -240, flag: { hasAdvisor: 1 } },
            delayed: [
              { inMonths: 30, chance: 0.6, title: 'THE FEES ADD UP', body: `You do the arithmetic at a kitchen table and find that 1.2% over three decades is a genuinely enormous amount of money.`, tone: 'mixed', fx: { happiness: -6, counter: { wiser: 1 } } },
              { inMonths: 24, chance: 0.35, title: 'HE EARNED HIS FEE ONCE', body: `He talks you out of a single decision during a panic in March of the third year. That conversation is probably worth the fees on its own.`, tone: 'good', fx: { money: 9000, stress: -14, happiness: 10 } },
            ],
          },
        ],
      },
      {
        text: 'Read two books and do it yourself',
        tag: 'smart',
        time: 2,
        outcomes: [
          {
            title: 'YOU READ THE BOOKS',
            body: `Both of them say the same thing in different fonts: boring, diversified, cheap, automatic, and do not look at it.

You set up an automatic transfer and a spreadsheet you check quarterly. It is unglamorous and it will outperform the man in the suit.`,
            tone: 'good',
            fx: { happiness: 10, stress: -8, money: 1400, career: 4, counter: { sensible: 1 }, milestone: 'Took control of your finances' },
          },
        ],
      },
      {
        text: 'Sign up, and ask him for a job',
        tag: 'chaotic',
        highRisk: true,
        time: 2,
        outcomes: [
          {
            title: 'YOU ASKED THE ADVISOR FOR A JOB',
            body: `He laughs, then realises you are not joking, then becomes genuinely helpful, because people who are good at money are rarely short of introductions.

He does not hire you. He introduces you to somebody who does.`,
            tone: 'chaos',
            fx: { career: 10, reputation: 6, happiness: 4, flag: { financeContact: 1 }, counter: { chaos: 1 } },
            delayed: [
              {
                inMonths: 12,
                chance: 0.4,
                title: 'THE INTRODUCTION PAID OFF',
                body: `A role in a completely different industry at a number that requires you to read it twice.`,
                tone: 'good',
                fx: { career: 20, money: 12000, happiness: 12, setCareer: { path: 'finance', level: 2 } },
              },
            ],
          },
        ],
      },
    ],
  },
];
