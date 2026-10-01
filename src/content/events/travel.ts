import type { GameEvent } from '../../engine/types';

/** TRAVEL — the money you can't get back and never regret, mostly. */
export const travelEvents: GameEvent[] = [
  {
    id: 'travel_promotion_abroad',
    title: 'THEY WANT YOU IN ANOTHER COUNTRY',
    body: `A promotion with a relocation attached: eighteen months in a city eleven hours away, a 34% raise, a housing allowance, and a genuinely enormous opportunity that your manager is describing using the word "transformational."

{boss} is excited for you in a way that suggests he has been asked to be.`,
    art: 'travel_airport',
    cat: 'travel',
    weight: 14,
    cooldown: 999,
    priority: 3,
    when: { career: { employed: true, level: [1, 9] }, stats: { career: [40, 100] }, age: [24, 52] },
    choices: [
      {
        text: 'Go. Move overseas. Alone if you have to.',
        tag: 'bold',
        time: 6,
        outcomes: [
          {
            title: 'YOU MOVED ELEVEN HOURS AWAY',
            body: `Two suitcases, an apartment that came furnished and smells like someone else's choice of candle, and a first week in which you do not know how the bins work and cannot ask.

Month three you are lonely in a way that is genuinely instructive. Month nine you have a life. Month fourteen you realise you have stopped thinking about the old one.`,
            tone: 'good',
            art: 'travel_abroad',
            fx: {
              career: 20,
              money: 6000,
              income: 900,
              happiness: 6,
              stress: 24,
              reputation: 10,
              flag: { movedAbroad: 1 },
              setCareer: { path: 'corporate', level: 3 },
              milestone: 'Moved overseas',
              log: 'Relocated abroad for work',
              counter: { promotions: 1 },
            },
            delayed: [
              {
                inMonths: 14,
                chance: 0.55,
                title: 'EVERYONE ELSE MOVED ON WITHOUT YOU',
                body: `You fly back for a wedding and discover that the group has reorganised itself around a table you are not at. Nothing has happened. Everything has happened.`,
                tone: 'bad',
                fx: { relationships: -16, npc: { jess: -18, marcus: -14 }, happiness: -12, stress: 12 },
              },
              {
                inMonths: 20,
                chance: 0.4,
                title: 'THE PHONES STOPPED RINGING AND YOU DID NOT MIND',
                body: `You have people here now. Different people, with a completely different history, and the feeling is not better or worse. It is genuinely a different life.`,
                tone: 'good',
                fx: { happiness: 16, stress: -14, relationships: 8, reputation: 10 },
              },
            ],
          },
        ],
      },
      {
        text: 'Ask them to move with you',
        tag: 'bold',
        time: 4,
        requires: { partner: ['dating', 'engaged', 'married'] },
        outcomes: [
          {
            title: 'YOU ASKED THEM TO COME',
            body: `They have a career, a mother nearby, and a life they have spent nine years assembling. You are asking them to put all of it in a box and fly eleven hours.

They take a week. They say yes. They say it in a specific tone that suggests they will be reminding you of it.`,
            tone: 'mixed',
            fx: {
              career: 16,
              money: 4000,
              income: 900,
              stress: 22,
              happiness: 12,
              relationships: 8,
              npc: { partner: 14 },
              flag: { movedAbroad: 1, partnerGaveUpJob: 1 },
              counter: { promotions: 1 },
              milestone: 'Moved overseas',
            },
            delayed: [
              {
                inMonths: 18,
                chance: 0.5,
                title: 'THEY HAVE NOT FOUND THEIR FEET',
                body: `They have been trying. The job market there is different and the language in the office is different and their qualifications mean slightly less than they did at home. It comes up in the third year, at a kitchen table, at 22:30.`,
                tone: 'bad',
                fx: { relationships: -18, npc: { partner: -22 }, happiness: -12, stress: 18 },
              },
              {
                inMonths: 24,
                chance: 0.45,
                title: 'IT BECAME OUR LIFE RATHER THAN YOUR JOB',
                body: `They found something. A business, a course, a group of people. You stopped being the reason they were there.`,
                tone: 'good',
                fx: { happiness: 18, relationships: 16, npc: { partner: 20 }, money: 5000 },
              },
            ],
          },
        ],
      },
      {
        text: 'Reject it. Stay where your life is.',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU SAID NO',
            body: `You do it properly, with reasons, and {boss} nods and says he understands and then offers it to somebody with three years less experience than you.

The role goes. You stay. Everything continues exactly as it was, which is either the point or the problem.`,
            tone: 'mixed',
            fx: { stress: -10, relationships: 8, npc: { jess: 10, partner: 12 }, career: -6, happiness: 4, flag: { refusedRelocation: 1 } },
          },
        ],
      },
      {
        text: 'Quit and start your own thing in the new country',
        tag: 'chaotic',
        highRisk: true,
        time: 8,
        outcomes: [
          {
            title: 'YOU WENT. AND YOU DID NOT TAKE THE JOB.',
            body: `You resign, you fly, and you land in a city where you have a visa, some savings and absolutely no plan, and you start something small.

It is genuinely insane and you are genuinely happier than you have been in five years, for about four months, and then the money gets involved.`,
            tone: 'chaos',
            art: 'travel_abroad',
            fx: {
              career: -12,
              happiness: 16,
              stress: 32,
              money: -14000,
              reputation: 8,
              flag: { movedAbroad: 1, wentSoloAbroad: 1 },
              counter: { chaos: 1 },
            },
            delayed: [
              { inMonths: 14, chance: 0.4, title: 'IT WORKED', body: `A small business in a new market with no competition and genuine demand, and clients who found you because you were the only person who would answer.`, tone: 'good', fx: { money: 26000, income: 2200, happiness: 18, reputation: 14 } },
              { inMonths: 14, chance: 0.45, title: 'IT DID NOT', body: `The visa has conditions. The savings have a floor. You are eleven hours from everyone who would help you, which was the point until it was the problem.`, tone: 'bad', fx: { money: -8000, stress: 30, happiness: -18, relationships: -10, flag: { cameHome: 1 } } },
              { inMonths: 14, chance: 0.15, title: 'A THIRD THING HAPPENED', body: `You got a job at a company in the country you moved to, doing the thing you were going to do anyway, but hired by people you met in a bar. Life is not a strategy.`, tone: 'good', fx: { career: 14, money: 4000, income: 700, happiness: 14 } },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'travel_cheap_flight',
    title: 'THE FLIGHTS ARE ABSURDLY CHEAP',
    body: `A fare error, or a sale, or a genuine mistake by an airline in a different timezone: $180 return to a city you have always said you would go to.

It is for four days and it is in eleven weeks and the return leg lands at 06:15 on a Monday.`,
    art: 'travel_flight',
    cat: 'travel',
    weight: 13,
    cooldown: 24,
    when: { age: [22, 72], minCash: 500 },
    choices: [
      {
        text: 'Book it. Go. Four days is enough.',
        tag: 'bold',
        time: 2,
        fx: { money: -740, happiness: 16, stress: -18, health: 6, counter: { vacations: 1 }, milestone: 'Went somewhere' },
        outcomes: [
          {
            title: 'YOU WENT AND IT WAS ACTUALLY GREAT',
            body: `Four days is not enough and that is precisely why it works. You walk eleven miles a day, you eat things you cannot identify, and you take four hundred photographs that you will look at twice.

The 06:15 landing on Monday is genuinely brutal and entirely worth it.`,
            tone: 'good',
            fx: { happiness: 16, stress: -14, relationships: 4, reputation: 4 },
            delayed: [
              {
                inMonths: 8,
                chance: 0.5,
                title: 'YOU STARTED DOING THIS MORE',
                body: `Two more trips in the same year, both booked on a Wednesday, neither discussed in advance. It becomes a genuinely defining habit.`,
                tone: 'good',
                fx: { happiness: 14, stress: -14, money: -900, milestone: 'The travel habit' },
              },
            ],
          },
        ],
      },
      {
        text: 'Book it and invite someone',
        tag: 'kind',
        time: 2,
        fx: { money: -1480, happiness: 12, npc: { jess: 16 }, relationships: 10, counter: { vacations: 1 } },
        outcomes: [
          {
            title: 'YOU WENT WITH JESS',
            body: `Four days, one hotel room, and eleven conversations that you would not have had in your own city because there would have been a television.

You find out something about her that you did not know after twelve years of friendship, at a bus stop in a language you do not speak.`,
            tone: 'good',
            fx: { happiness: 18, relationships: 14, npc: { jess: 18 } },
          },
        ],
      },
      {
        text: 'Do not book it. You have responsibilities.',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU DID NOT BOOK IT',
            body: `You look at it three times over four days and then the price goes back up, which the website announces, unhelpfully.

You have saved $740 and you will think about this in about six years with an intensity that surprises you.`,
            tone: 'neutral',
            fx: { happiness: -6, stress: 2 },
          },
        ],
      },
    ],
  },

  {
    id: 'travel_sabbatical',
    title: 'AN OPPORTUNITY TO STOP FOR A YEAR',
    body: `You have done the arithmetic. If you cash in the leave, sublet, and live cheaply, you can afford eleven months of not working.

Eleven months is a genuinely long time. You would come back to a career that has moved on without you by exactly eleven months.`,
    art: 'travel_map',
    cat: 'travel',
    weight: 11,
    cooldown: 999,
    when: { age: [27, 50], minCash: 22000, career: { employed: true }, stats: { stress: [45, 100] } },
    choices: [
      {
        text: 'Take the year. Go.',
        tag: 'chaotic',
        highRisk: true,
        time: 12,
        outcomes: [
          {
            title: 'YOU TOOK THE YEAR',
            body: `Four continents, one backpack, and a genuinely significant amount of time spent sitting on buses looking out of windows.

Month two you stop feeling like you are on holiday. Month five you stop checking your old company's news. Month nine you start to think about what you actually want, which is the entire point and is also quite uncomfortable.`,
            tone: 'good',
            art: 'travel_world',
            fx: {
              money: -18000,
              happiness: 24,
              stress: -34,
              health: 14,
              setCareer: null,
              flag: { sabbatical: 1, employed: false },
              milestone: 'Took a sabbatical',
              log: 'Took a year out',
            },
            delayed: [
              {
                inMonths: 3,
                chance: 0.5,
                title: 'SOMETHING FOUND YOU WHILE YOU WERE GONE',
                body: `A message from a stranger, or a former colleague, about a thing you would never have been asked about if you had been at your desk.`,
                tone: 'good',
                fx: { career: 16, money: 8000, happiness: 12, flag: { returnedToSomethingBetter: 1 } },
              },
              {
                inMonths: 4,
                chance: 0.5,
                title: 'YOU CAME BACK TO A SMALLER WORLD',
                body: `The role you would have gone back to has been filled by two people, and the person who filled it does not know who you are.`,
                tone: 'bad',
                fx: { career: -14, stress: 20, happiness: -8 },
              },
            ],
          },
        ],
      },
      {
        text: 'Take three months instead',
        tag: 'smart',
        time: 4,
        outcomes: [
          {
            title: 'YOU TOOK THREE MONTHS',
            body: `Unpaid leave, negotiated over two meetings, with a genuinely good plan: two destinations, one of them cheap, and a return date already in the calendar.

It is enough. It is genuinely enough. You come back rested rather than transformed, which is the version that survives contact with real life.`,
            tone: 'good',
            fx: { money: -5000, happiness: 16, stress: -26, health: 10, flag: { miniSabbatical: 1 }, milestone: 'Took a long break' },
          },
        ],
      },
      {
        text: 'Do not go. Bank the money and the career.',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU DID NOT GO',
            body: `You save it and you keep working and eleven months later you are in the same chair with a larger number in a different account.

Nothing at all is wrong. There is just a specific window, and windows close.`,
            tone: 'neutral',
            fx: { stress: 6, happiness: -6, money: 1400 },
          },
        ],
      },
    ],
  },

  {
    id: 'travel_wedding_abroad',
    title: 'A WEDDING ABROAD. IN FOURTEEN WEEKS.',
    body: `A friend from university is marrying in Portugal, and the invitation is beautiful and the details are sparse and the accommodation is "up to you, plenty of lovely places nearby!"

The flights are already $780 and rising.`,
    art: 'travel_wedding',
    cat: 'travel',
    weight: 12,
    cooldown: 999,
    when: { age: [24, 55], minCash: 1200 },
    choices: [
      {
        text: 'Go. Book everything. Do it properly.',
        tag: 'bold',
        time: 2,
        requires: { minCash: 2400 },
        outcomes: [
          {
            title: 'YOU WENT TO THE WEDDING IN PORTUGAL',
            body: `Three days, forty people, one genuinely unbelievable evening and a swimming pool at 3am containing seven adults who all have mortgages.

It costs more than a holiday should. It is also the last time all of those people will be in the same place, which nobody says out loud because nobody knows it yet.`,
            tone: 'good',
            fx: {
              money: -2400,
              happiness: 20,
              stress: -10,
              relationships: 16,
              npc: { jess: 18, marcus: 14, chad: 10 },
              milestone: 'The Portugal wedding',
            },
          },
        ],
      },
      {
        text: 'Go cheap: share a room with three people',
        tag: 'smart',
        time: 2,
        outcomes: [
          {
            title: 'YOU SHARED A ROOM WITH FOUR PEOPLE',
            body: `A bed you did not choose, a bathroom with a queue, and a genuinely hilarious three days that costs you $900 instead of $2,400.

You are thirty-one and you sleep on a sofa and it is completely fine and you are very slightly embarrassed about it the entire time.`,
            tone: 'good',
            fx: { money: -900, happiness: 14, relationships: 10, stress: 6, npc: { chad: 12, marcus: 8 } },
          },
        ],
      },
      {
        text: 'Send a generous gift and decline',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU SENT A GIFT AND DID NOT GO',
            body: `A genuinely generous amount, a card, and a message that is warm and true.

They post forty photographs. You look at all of them, at home, on a Sunday.`,
            tone: 'mixed',
            fx: { money: -300, happiness: -6, relationships: -4, npc: { jess: -6 } },
          },
        ],
      },
    ],
  },

  {
    id: 'travel_family_holiday',
    title: 'THE FAMILY HOLIDAY, ADULT EDITION',
    body: `Your mother has suggested a house, all of you, for a week. Her, your dad, Eli, you, and whoever you are currently bringing.

The last time this happened you were nineteen and had no negotiating power.`,
    art: 'travel_family',
    cat: 'family',
    weight: 11,
    cooldown: 48,
    when: { age: [26, 58] },
    choices: [
      {
        text: 'Go. Pay for a chunk of it.',
        tag: 'kind',
        time: 2,
        fx: { money: -2600, npc: { mum: 18, dad: 14, brother_eli: 10 }, happiness: 10, relationships: 8 },
        outcomes: [
          {
            title: 'YOU PAID FOR THE HOUSE',
            body: `Seven days, one kitchen, four adults negotiating a dishwasher, and a genuinely great afternoon on day three where everybody is in the sea at the same time.

Your mother says thank you four times, which is three more than necessary, and means something different each time.`,
            tone: 'good',
            fx: { happiness: 16, stress: -14, npc: { mum: 16, dad: 12, brother_eli: 12 }, milestone: 'The family holiday' },
          },
        ],
      },
      {
        text: 'Go, but take your own car so you can leave',
        tag: 'smart',
        time: 2,
        outcomes: [
          {
            title: 'YOU DROVE SEPARATELY',
            body: `It is a genuinely excellent strategy that everyone notices and nobody mentions, and it means you can leave on day six when your dad starts on politics.

You get 80% of the family holiday and none of the last two days, which is the correct ratio.`,
            tone: 'good',
            fx: { money: -1100, happiness: 12, stress: -8, npc: { mum: 10, dad: 8 } },
          },
        ],
      },
      {
        text: 'Decline. You need the leave for yourself.',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU SAID NO',
            body: `You use the week to do nothing at all, which is genuinely restorative and which you will think about for eleven months in a good way and one specific evening in a bad way.

Your mother sends photographs every day. You look at all of them.`,
            tone: 'mixed',
            fx: { stress: -14, happiness: 4, npc: { mum: -10, dad: -6, brother_eli: -6 } },
          },
        ],
      },
    ],
  },
];
