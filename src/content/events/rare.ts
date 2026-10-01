import type { GameEvent } from '../../engine/types';

/**
 * RARE EVENTS
 *
 * Low selection weight plus tight conditions means most players will not see
 * these on a first run. Several require you to have lived a few lives already
 * (`livesLived`), which gives completionists a genuine reason to replay.
 */
export const rareEvents: GameEvent[] = [
  {
    id: 'rare_the_offer_you_cannot_refuse',
    title: 'A MEETING THAT IS NOT ON YOUR CALENDAR',
    body: `A car is outside. The driver knows your name, which is the unsettling part, because you have never met him and he is not looking at a screen.

Somebody has been watching what you do for a long time and has decided to make an approach in person.`,
    art: 'rare_blackcar',
    cat: 'career',
    rarity: 'rare',
    weight: 3,
    cooldown: 120,
    priority: 4,
    when: { age: [30, 55], stats: { reputation: [70, 100], career: [65, 100] }, flags: { livesLived: [1, null] } },
    choices: [
      {
        text: 'Get in the car',
        tag: 'chaotic',
        highRisk: true,
        time: 2,
        outcomes: [
          {
            title: 'YOU GOT IN THE CAR',
            body: `Twenty minutes across the city, a building with no signage, and a room with three people in it who have clearly rehearsed a version of this conversation for somebody exactly like you.

The offer is real, enormous and specific. It is also for a job that does not exist yet, in a company that has not been announced, doing something they will only describe in the abstract.`,
            tone: 'good',
            fx: {
              career: 22,
              money: 20000,
              salaryPct: 0.45,
              reputation: 14,
              stress: 16,
              happiness: 12,
              flag: { gotTheCall: 1 },
              unlock: 'rare_the_offer',
              milestone: 'Got the call',
            },
            delayed: [
              {
                inMonths: 12,
                chance: 0.5,
                title: 'WHAT THEY WERE ACTUALLY BUILDING',
                body: `It is not what they described. It is considerably stranger and considerably more interesting, and your job has turned into something that did not have a name when you accepted it.`,
                tone: 'good',
                fx: { career: 14, reputation: 16, happiness: 16, money: 30000, flag: { madeTheFuture: 1 } },
              },
            ],
          },
        ],
      },
      {
        text: 'Decline and walk home',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU WALKED AWAY FROM THE CAR',
            body: `You say no thanks to a man who already knows your name, which is the single most sensible decision you will make this decade and feels, at the time, like cowardice.

He nods once, gets back in, and you never see him again.`,
            tone: 'good',
            fx: { happiness: 4, stress: -6, counter: { sensible: 1 }, unlock: 'rare_the_car_declined' },
          },
        ],
      },
    ],
  },

  {
    id: 'rare_viral_misfortune',
    title: 'YOU ARE THE SUBJECT OF A VIDEO',
    body: `Eleven seconds. Your face, at an angle you do not recognise, doing something you would describe as reasonable and which the internet is describing as something else.

It has 2.1 million views. There is a remix. Somebody in your office has found it.`,
    art: 'social_backlash',
    cat: 'social',
    rarity: 'rare',
    weight: 3,
    cooldown: 120,
    priority: 4,
    when: { age: [24, 60], stats: { reputation: [30, 100] }, flags: { livesLived: [1, null] } },
    choices: [
      {
        text: 'Lean into it. Do an interview.',
        tag: 'chaotic',
        highRisk: true,
        time: 2,
        outcomes: [
          {
            title: 'YOU DID THE INTERVIEW',
            body: `You are charming and self-deprecating and eleven minutes long, and it works better than it has any right to.

By Thursday you have 180,000 followers and a genuine sense that you have discovered a door in a wall.`,
            tone: 'chaos',
            fx: { reputation: 26, happiness: 16, stress: 22, money: 8000, flag: { wentViral: 1 }, unlock: 'rare_viral_fame' },
          },
        ],
      },
      {
        text: 'Wait it out. Say nothing.',
        tag: 'smart',
        time: 3,
        outcomes: [
          {
            title: 'YOU SAID NOTHING FOR THREE MONTHS',
            body: `It dies, as these things do, in about eleven days, and then resurfaces twice, and then becomes a thing that a specific subset of people remember and nobody else does.

You handled it perfectly and it cost you three months of not sleeping.`,
            tone: 'good',
            fx: { stress: 18, reputation: -4, happiness: -6, counter: { sensible: 1 } },
          },
        ],
      },
      {
        text: 'Find out who filmed it',
        tag: 'risky',
        highRisk: true,
        time: 2,
        outcomes: [
          {
            title: 'YOU FOUND THEM',
            body: `A man in his forties with a phone and a channel and a genuine belief that he is documenting society. He is not malicious. He is worse than malicious; he is friendly about it.`,
            tone: 'mixed',
            fx: { stress: 22, happiness: -8, reputation: 6, counter: { chaos: 1 }, unlock: 'rare_met_the_filmer' },
          },
        ],
      },
    ],
  },

  {
    id: 'rare_inheritance_estate',
    title: 'THERE IS A HOUSE AND IT COMES WITH A CONDITION',
    body: `An estate agent calls about a property in a village you have been to once, at a funeral. It belonged to a relative you met twice and it has been left to you, outright, on one condition.

The condition is that you live in it for a year.`,
    art: 'rare_house',
    cat: 'housing',
    rarity: 'rare',
    weight: 2.5,
    cooldown: 999,
    priority: 4,
    when: { age: [28, 58], flags: { livesLived: [2, null] } },
    choices: [
      {
        text: 'Do the year. Move to the village.',
        tag: 'bold',
        time: 12,
        outcomes: [
          {
            title: 'YOU MOVED TO THE VILLAGE',
            body: `A five-hour commute twice a week, a pub with nine regulars, and a house that is genuinely colder than any building you have ever lived in.

Month four you realise you have stopped thinking about the city. Month eight you have a local and a routine and a set of people who know what you do on Thursdays.`,
            tone: 'good',
            fx: {
              moveTo: 'rental_house',
              happiness: 22,
              stress: -24,
              health: 12,
              money: 6000,
              relationships: -10,
              flag: { inheritedHouse: 1 },
              unlock: 'rare_the_year_in_the_house',
              milestone: 'The year in the house',
            },
            delayed: [
              {
                inMonths: 14,
                chance: 0.6,
                title: 'YOU SOLD IT FOR A GENUINE FORTUNE',
                body: `The condition fulfilled, the house sold, and a village property market that has quietly doubled in a decade. A number lands in your account that changes the arithmetic of the rest of your life.`,
                tone: 'good',
                fx: { money: 380000, happiness: 18, reputation: 12, unlock: 'rare_house_sold' },
              },
            ],
          },
        ],
      },
      {
        text: 'Sell the interest. Take the money.',
        tag: 'smart',
        time: 2,
        outcomes: [
          {
            title: 'YOU SOLD YOUR INTEREST',
            body: `A solicitor explains that you can assign the benefit, for considerably less than the house is worth, to somebody willing to do the year themselves.

You take $85,000 and you will spend a genuinely significant portion of your life wondering about the house.`,
            tone: 'mixed',
            fx: { money: 85000, stress: -8, happiness: -4, unlock: 'rare_house_sold' },
          },
        ],
      },
    ],
  },

  {
    id: 'rare_the_reference',
    title: 'SOMEBODY YOU FIRED IS NOW A RECRUITER',
    body: `The name at the top of the email is one you have not thought about in six years. You let them go in a room with a window, on a Thursday, and you did it as well as you were capable of.

They have done extremely well and they have an opportunity, and they have reached out to you specifically.`,
    art: 'office_offer',
    cat: 'career',
    rarity: 'rare',
    weight: 3,
    cooldown: 999,
    priority: 4,
    when: { age: [32, 58], run: { promotions: [1, null] }, flags: { livesLived: [1, null] } },
    choices: [
      {
        text: 'Take the meeting',
        tag: 'bold',
        time: 2,
        outcomes: [
          {
            title: 'YOU TOOK THE MEETING',
            body: `The first four minutes are about the role. The fifth minute is about the Thursday, and they bring it up themselves, kindly, and you both handle it like adults.

They offer you the role. It is genuinely excellent, and you get the sense they wanted to be able to offer it.`,
            tone: 'good',
            fx: { career: 20, salaryPct: 0.3, happiness: 14, reputation: 10, money: 6000, unlock: 'rare_the_reference', milestone: 'The person you fired hired you' },
          },
        ],
      },
      {
        text: 'Reply and apologise for how you handled it',
        tag: 'kind',
        time: 1,
        outcomes: [
          {
            title: 'YOU APOLOGISED, SIX YEARS LATE',
            body: `They reply within a day and say it was fine, and that they have used you as an example of how to do it properly, which is not the reply you were braced for.

You do not take the role. You keep the correspondence.`,
            tone: 'good',
            fx: { happiness: 16, karma: 12, reputation: 8, relationships: 6, unlock: 'rare_the_reference_apology' },
          },
        ],
      },
    ],
  },

  {
    id: 'rare_one_good_year',
    title: 'A YEAR IN WHICH NOTHING GOES WRONG',
    body: `It happens so rarely that you do not notice until the eleventh month. Nobody dies. Nobody leaves. The boiler holds. Work is going well and home is going well and your body is behaving.

You have had a good year. You are 41. You have had three of these.`,
    art: 'life_goodyear',
    cat: 'social',
    rarity: 'rare',
    weight: 3,
    cooldown: 999,
    priority: 3,
    when: { age: [35, 70], stats: { stress: [0, 35], happiness: [65, 100] }, flags: { livesLived: [1, null] } },
    choices: [
      {
        text: 'Notice it. Actually notice it.',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU STOPPED AND NOTICED IT',
            body: `You write four paragraphs in a notebook—about the kitchen, about a specific Tuesday, about how your shoulders feel. It is the most valuable thing you produce that year and nobody will ever read it.`,
            tone: 'good',
            fx: { happiness: 18, stress: -14, health: 10, karma: 10, unlock: 'rare_one_good_year', milestone: 'A good year, noticed' },
          },
        ],
      },
      {
        text: 'Use the momentum. Ambition time.',
        tag: 'bold',
        time: 3,
        outcomes: [
          {
            title: 'YOU SPENT THE GOOD YEAR ON AMBITION',
            body: `A new role, a bigger number, a thing that requires a great deal of you. It works and it costs and the year after is considerably harder than the year before.`,
            tone: 'mixed',
            fx: { career: 18, salaryPct: 0.22, stress: 22, happiness: -6, money: 9000, unlock: 'rare_pushed_the_good_year' },
          },
        ],
      },
    ],
  },

  {
    id: 'rare_the_letter',
    title: 'A LETTER FROM YOUR YOUNGER SELF',
    body: `You find it moving a box, in your own handwriting, dated twenty years ago, from a school project that asked you to write to your future self.

It is three paragraphs. The second paragraph is genuinely difficult to read.`,
    art: 'rare_letter',
    cat: 'social',
    rarity: 'rare',
    weight: 3,
    cooldown: 999,
    priority: 3,
    when: { age: [36, 75], flags: { livesLived: [2, null] } },
    choices: [
      {
        text: 'Read it properly and take it seriously',
        tag: 'kind',
        time: 1,
        outcomes: [
          {
            title: 'YOU READ IT TWICE',
            body: `The first time fast, the second time slowly. They wanted three things and you have got one of them, and the one you have is the one they were least certain about.

You do the thing they asked you to do in the third paragraph, twenty years late, on a Saturday afternoon.`,
            tone: 'good',
            fx: { happiness: 22, stress: -18, health: 8, karma: 10, unlock: 'rare_read_the_letter', milestone: 'The letter' },
          },
        ],
      },
      {
        text: 'Put it back in the box',
        tag: 'lazy',
        time: 1,
        outcomes: [
          {
            title: 'YOU PUT IT BACK',
            body: `You close the box and put it on top of the wardrobe and go and do something else, because it is a Tuesday and because you know how it goes.

It will be there.`,
            tone: 'neutral',
            fx: { happiness: -4, stress: 6, unlock: 'rare_letter_unread' },
          },
        ],
      },
    ],
  },

  {
    id: 'rare_the_two_of_you',
    title: 'TWO COMPANIES, ONE DINNER',
    body: `You are sitting opposite the person who was, for four years, the biggest problem in your working life. You have both been invited to the same industry dinner and you have been seated together by an algorithm or a sadist.

They order the same thing you do.`,
    art: 'business_meeting',
    cat: 'career',
    rarity: 'rare',
    weight: 3,
    cooldown: 999,
    priority: 3,
    when: { age: [34, 62], stats: { career: [60, 100] }, flags: { livesLived: [1, null] } },
    choices: [
      {
        text: 'Be genuinely warm. It was a long time ago.',
        tag: 'kind',
        time: 1,
        outcomes: [
          {
            title: 'YOU WERE GENUINELY WARM',
            body: `Two hours, no score-settling, and one genuinely interesting conversation about a problem you are both having. By dessert you are discussing a piece of work you could do together.`,
            tone: 'good',
            fx: { career: 14, reputation: 12, happiness: 12, karma: 8, unlock: 'rare_made_peace', milestone: 'Made peace' },
          },
        ],
      },
      {
        text: 'Ask them, directly, about the thing they did',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU ASKED THEM ABOUT IT',
            body: `They do not remember it. Not defensively — they genuinely, sincerely do not remember it, and they are clearly telling the truth, and you have been carrying something for eleven years that does not exist.`,
            tone: 'mixed',
            fx: { happiness: 10, stress: -20, karma: 6, unlock: 'rare_the_thing_they_forgot', milestone: 'The thing they forgot' },
          },
        ],
      },
      {
        text: 'Settle an old score, quietly, in a room full of people',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'YOU IMPLIED SOMETHING',
            body: `One sentence, said pleasantly, in front of four people who all understood it, and the temperature at the table drops by a degree that only the two of you can measure.

It is genuinely satisfying for about forty minutes and then permanently sad.`,
            tone: 'chaos',
            fx: { happiness: -6, stress: 16, reputation: -8, counter: { chaos: 1 }, unlock: 'rare_settled_a_score' },
          },
        ],
      },
    ],
  },

  {
    id: 'rare_the_weather_event',
    title: 'THE WATER IS IN THE STREET',
    body: `It comes on a Thursday. Four days of rain, then a river that is not supposed to be there, then a night in which the entire ground floor of your street is a different colour.

Nobody is hurt. Everybody is standing in it.`,
    art: 'rare_disaster',
    cat: 'housing',
    rarity: 'rare',
    weight: 3,
    cooldown: 999,
    priority: 4,
    when: { age: [26, 72], flags: { livesLived: [1, null] } },
    choices: [
      {
        text: 'Help the neighbours. The whole week.',
        tag: 'kind',
        time: 2,
        outcomes: [
          {
            title: 'YOU SPENT THE WEEK IN OTHER PEOPLE\'S HALLWAYS',
            body: `Wet-vac, furniture up the stairs, an eight-year-old who has lost everything she owns and one genuinely moving moment involving a stranger and a box of photographs.

You have never known your neighbours' names properly. You know them now.`,
            tone: 'good',
            fx: { happiness: 16, stress: 18, health: -6, karma: 16, relationships: 12, reputation: 14, unlock: 'rare_the_flood', milestone: 'The flood' },
            delayed: [
              {
                inMonths: 14,
                chance: 0.5,
                title: 'THEY DID NOT FORGET IT',
                body: `A street that looks after each other, years later, in a hundred small ways: keys, deliveries, a lift to the airport, a relationship with your actual neighbours that most adults never have.`,
                tone: 'good',
                fx: { happiness: 14, stress: -14, relationships: 10, health: 6 },
              },
            ],
          },
        ],
      },
      {
        text: 'Get out of there and stay somewhere dry',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU LEFT',
            body: `Three nights in a hotel, insurance calls, and a genuinely comfortable week that you spend being glad you are not in the street.

You come back to a street that has been through something, and you were in a hotel.`,
            tone: 'neutral',
            fx: { money: -900, stress: -6, happiness: 2, relationships: -8, reputation: -6 },
          },
        ],
      },
    ],
  },
];
