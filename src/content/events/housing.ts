import type { GameEvent } from '../../engine/types';

/** HOUSING — rent, buy, move, and the landlord who owns your ceiling. */
export const housingEvents: GameEvent[] = [
  {
    id: 'housing_rent_increase',
    title: 'THE RENT IS GOING UP',
    body: `Your landlord Ray has sent a letter that is four sentences long and manages to be warm, legal and terrifying at once.

The rent is going up by 18%. The letter uses the phrase "market conditions" and the phrase "we value you as a tenant", in that order.`,
    art: 'housing_letter',
    cat: 'housing',
    weight: 15,
    cooldown: 24,
    when: { homeTier: ['shared_apartment', 'studio', 'one_bed', 'rental_house'], age: [21, 75] },
    speaker: 'landlord_ray',
    choices: [
      {
        text: 'Negotiate. Cite the boiler.',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU MENTIONED THE BOILER. AND THE DAMP.',
            body: `You write a careful email listing four genuine issues and one that you may have exaggerated. You offer a smaller increase and you are polite about it.

He comes back at 9% and a promise about the boiler that is not a promise, and you take it, because 9% is not 18% and you are not moving over this.`,
            tone: 'good',
            fx: { expense: 120, stress: 6, happiness: 4, flag: { negotiatedRent: 1 } },
          },
        ],
      },
      {
        text: 'Pay it and stay. Moving costs more than this.',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU SIGNED IT',
            body: `You do the arithmetic: deposit, van, a month of overlap, a fortnight of your life. He is right and that is the most insulting part.

The rent goes up. So does your understanding of how this works.`,
            tone: 'neutral',
            fx: { expense: 240, stress: 8, happiness: -4 },
          },
        ],
      },
      {
        text: 'Move. Immediately. Out of spite.',
        tag: 'chaotic',
        highRisk: true,
        time: 2,
        outcomes: [
          {
            title: 'YOU MOVED OUT OF PRINCIPLE',
            body: `The new place is $200 cheaper and eleven minutes further from everything and has a kitchen with a window into a corridor.

Total cost of the move: $2,100 and a weekend. Total saving, over two years: substantial. Total satisfaction: immediate and disproportionate.`,
            tone: 'mixed',
            fx: { money: -2100, expense: -140, stress: 16, happiness: 4, counter: { chaos: 1 }, flag: { movedOutOfSpite: 1 } },
          },
        ],
      },
      {
        text: 'Buy a place instead. Get out of this forever.',
        tag: 'bold',
        time: 3,
        requires: { minCash: 30000 },
        outcomes: [
          {
            title: 'YOU STARTED LOOKING AT PROPERTY LISTINGS',
            body: `At 23:40, in bed, on your phone, at flats you cannot afford in areas you have never been to.

It takes eleven weeks, two rejected offers, and a mortgage adviser who says "you're in a good position" in a tone that implies you are not. And then you own 100% of a problem, which is legally distinct from rent.`,
            tone: 'good',
            fx: {
              buyHome: { tier: 'first_home' },
              stress: 20,
              happiness: 16,
              flag: { homeowner: 1 },
              tag: ['homeowner'],
              counter: { propertiesBought: 1 },
              milestone: 'Bought a home',
              log: 'Bought a flat',
            },
            delayed: [
              {
                inMonths: 4,
                chance: 0.7,
                title: 'SOMETHING EXPENSIVE IN THE BUILDING',
                body: `The boiler. The roof. The thing under the sink that a plumber describes as "interesting." There is nobody to call, because you are the nobody.`,
                tone: 'bad',
                fx: { money: -4200, stress: 14 },
              },
              {
                inMonths: 30,
                chance: 0.5,
                title: 'THE VALUE WENT UP',
                body: `A valuation, unprompted, from a letter that arrives addressed to the occupier. It is worth more now. You have accidentally done a good financial thing by doing the most boring thing available.`,
                tone: 'good',
                fx: { money: 14000, happiness: 12, counter: { propertyGains: 1 } },
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'housing_flatmate_problem',
    title: 'THE DISH SITUATION HAS BECOME UNTENABLE',
    body: `It has been eleven days. The pan has been on the hob for eleven days. The pan has developed a relationship with the hob.

There is an unspoken agreement in this flat and it has been broken by exactly one person and both of you know which person.`,
    art: 'housing_dishes',
    cat: 'housing',
    weight: 11,
    cooldown: 30,
    when: { homeTier: ['shared_apartment'], age: [21, 40] },
    choices: [
      {
        text: 'Have a direct, calm conversation',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU SAID THE ACTUAL WORDS',
            body: `"Can we talk about the kitchen, because I'm getting genuinely annoyed about it and I'd rather say it than let it go weird."

They look relieved, which you did not expect. It turns out they had also been dreading a conversation, just a different one.`,
            tone: 'good',
            fx: { stress: -8, happiness: 6, relationships: 4, npc: { marcus: 10 }, flag: { adultConversation: 1 } },
          },
        ],
      },
      {
        text: 'Wash it yourself, resentfully',
        tag: 'lazy',
        time: 1,
        outcomes: [
          {
            title: 'YOU WASHED THE PAN',
            body: `You do it in a specific way: loudly enough to be heard, quietly enough to deny. It is a technical performance and you have been rehearsing it for a week.

Nothing changes except that you now have a permanent low-grade argument in your own head.`,
            tone: 'bad',
            fx: { stress: 10, happiness: -6, relationships: -4 },
          },
        ],
      },
      {
        text: 'Escalate by leaving your own things everywhere',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'YOU OPENED A SECOND FRONT',
            body: `Your cereal, your mug, your three plates, distributed with tactical intent across every surface.

The flat is now a contested territory. Neither of you mentions it. Both of you are aware of every single object.`,
            tone: 'chaos',
            fx: { stress: 16, happiness: -4, npc: { marcus: -16 }, counter: { chaos: 1 } },
            delayed: [
              {
                inMonths: 3,
                chance: 0.5,
                title: 'IT ENDED AT THE FRIDGE',
                body: `A note, on the fridge, in handwriting. Notes on fridges have ended friendships with less justification.`,
                tone: 'bad',
                fx: { relationships: -8, stress: 12, npc: { marcus: -10 } },
              },
            ],
          },
        ],
      },
      {
        text: 'Move out without telling them first',
        tag: 'chaotic',
        highRisk: true,
        time: 2,
        outcomes: [
          {
            title: 'YOU GAVE THREE WEEKS NOTICE TO THE WRONG PERSON',
            body: `Your landlord knows. Your flatmate does not, until a Saturday morning when you are carrying a mattress down a stairwell and they open their bedroom door in a dressing gown.

It is extremely awkward and completely, gloriously effective.`,
            tone: 'chaos',
            fx: { money: -1400, expense: -120, stress: 14, happiness: 8, npc: { marcus: -20 }, counter: { chaos: 1 } },
          },
        ],
      },
    ],
  },

  {
    id: 'housing_dream_neighbourhood',
    title: 'THE PERFECT PLACE EXISTS AND YOU HAVE SEVEN DAYS',
    body: `Right area, right size, wrong price by about 12%. There are two other viewings scheduled this week and one of them is a couple who brought a tape measure, which is the most threatening thing a person can do.

The agent says "we're expecting it to go by Friday" with the flat affect of a man who says this forty times a week.`,
    art: 'housing_viewing',
    cat: 'housing',
    weight: 12,
    cooldown: 36,
    when: { age: [22, 70], minCash: 4000 },
    choices: [
      {
        text: 'Offer asking price. Immediately.',
        tag: 'bold',
        time: 2,
        outcomes: [
          {
            title: 'YOU TOOK IT AT ASKING',
            body: `You sign something within nine hours of seeing it, in a café, with a pen that does not work, and the agent does not hide his surprise.

The first night in a new place is always strange. This one has a window that gets the evening light and a kitchen that is genuinely good, and you stand in it at 21:00 with a takeaway and think: correct.`,
            tone: 'good',
            fx: {
              money: -2600,
              expense: 300,
              happiness: 18,
              stress: 8,
              moveTo: 'one_bed',
              milestone: 'Moved to a better place',
              flag: { niceFlat: 1 },
            },
          },
        ],
      },
      {
        text: 'Offer 8% under and negotiate',
        tag: 'smart',
        time: 2,
        outcomes: [
          {
            title: 'YOU NEGOTIATED AND GOT HALFWAY',
            body: `The couple with the tape measure do not offer. You get it at 4% under asking, which is $40 a month and a small permanent smugness.

The agent describes you to a colleague as "the difficult one," which you overhear, and take as a compliment.`,
            tone: 'good',
            fx: { money: -2400, expense: 280, happiness: 14, stress: 6, moveTo: 'one_bed', counter: { sensible: 1 } },
          },
        ],
      },
      {
        text: 'Walk away. Out of budget.',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU WALKED AWAY',
            body: `It is the correct financial decision and you know it, and you spend four months thinking about that window.

Somebody else lives there now. You walk past it sometimes.`,
            tone: 'neutral',
            fx: { happiness: -6, stress: 2, counter: { sensible: 1 } },
          },
        ],
      },
      {
        text: 'Take it even though you cannot really afford it',
        tag: 'risky',
        highRisk: true,
        time: 2,
        outcomes: [
          {
            title: 'YOU TOOK IT ANYWAY',
            body: `It is 46% of your take-home, which a website told you is "stretched" in the way a doctor says "concerning."

You live well for eleven months and then you have one bad month and the whole thing becomes a machine that eats your weekends.`,
            tone: 'mixed',
            fx: {
              money: -2600,
              expense: 520,
              happiness: 14,
              stress: 22,
              moveTo: 'one_bed',
              flag: { overstretched: 1 },
            },
            delayed: [
              {
                inMonths: 9,
                chance: 0.6,
                title: 'THE STRETCH BECAME A TEAR',
                body: `One unexpected bill, one delayed payment, and suddenly the rent is the only thing you think about between the 14th and the 28th of every month.`,
                tone: 'bad',
                fx: { stress: 22, happiness: -14, debt: 2400 },
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'housing_landlord_sells',
    title: 'YOUR LANDLORD IS SELLING THE BUILDING',
    body: `Ray has decided to "rationalise his portfolio," which is landlord for "you have eight weeks."

He is genuinely apologetic, which is worse, because he is about to make $300,000 on a building you have lived in for four years and he feels bad about the eight weeks.`,
    art: 'housing_notice',
    cat: 'housing',
    weight: 12,
    cooldown: 48,
    speaker: 'landlord_ray',
    when: { homeTier: ['shared_apartment', 'studio', 'one_bed', 'rental_house'] },
    choices: [
      {
        text: 'Find somewhere quickly. Pay whatever it costs.',
        tag: 'safe',
        time: 2,
        outcomes: [
          {
            title: 'YOU MOVED IN EIGHTEEN DAYS',
            body: `Three viewings, one application, a van, four people carrying a sofa up two flights in the rain including {friend} who complained the entire time.

The new place is more expensive and worse. That is what happens in a hurry.`,
            tone: 'mixed',
            fx: { money: -2600, expense: 180, stress: 18, happiness: -6, moveTo: 'shared_apartment', npc: { jess: 8 } },
          },
        ],
      },
      {
        text: 'Make Ray pay you to leave',
        tag: 'bold',
        time: 2,
        outcomes: [
          {
            title: 'YOU NEGOTIATED A MOVE-OUT PACKAGE',
            body: `It takes a single email that mentions your statutory position and the phrase "I have been here four years and have photographs of everything."

He pays $3,200 relocation. You have never felt more like an adult in your life.`,
            tone: 'good',
            fx: { money: 3200, stress: 8, happiness: 12, moveTo: 'one_bed', expense: 220, counter: { negotiations: 1 } },
          },
        ],
      },
      {
        text: 'Offer to buy it yourself',
        tag: 'chaotic',
        highRisk: true,
        time: 3,
        requires: { minCash: 30000 },
        outcomes: [
          {
            title: 'YOU MADE AN OFFER ON THE BUILDING',
            body: `It is a genuinely absurd thing to do and he takes the meeting, because you are the only person who has ever asked.

You cannot afford it. Somebody with real money buys it, and they are a company, and the first thing the company does is replace the boiler and raise the rent by 30%.`,
            tone: 'chaos',
            fx: { stress: 16, happiness: -4, counter: { chaos: 1 }, flag: { triedToBuyBuilding: 1 } },
            delayed: [
              {
                inMonths: 10,
                chance: 0.5,
                title: 'THE NEW OWNERS HAVE A VISION',
                body: `New paint, new boiler, new rent. The flat is genuinely nicer and you can no longer afford it.`,
                tone: 'mixed',
                fx: { expense: 260, stress: 14, money: -1000 },
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'housing_parents_basement',
    title: 'THE OPTION YOU SAID YOU WOULD NEVER TAKE',
    body: `The maths have stopped working. Rent is $1,650 and your income is $2,400 and there is a room at your parents' house that has not been decorated since 2009 and has your school photos in it.

Your mother has not offered. She has just, several times, mentioned the room.`,
    art: 'housing_basement',
    cat: 'housing',
    weight: 13,
    cooldown: 48,
    when: { minCash: 0, stats: { stress: [45, 100] }, homeTier: ['shared_apartment', 'studio', 'one_bed'], age: [22, 45] },
    choices: [
      {
        text: 'Move back in. Save everything.',
        tag: 'smart',
        time: 2,
        outcomes: [
          {
            title: 'YOU MOVED BACK HOME',
            body: `Week one is genuinely lovely — there is food, and the food is free, and your mother makes a noise of real happiness when you walk in.

Week three you have a curfew you did not agree to. Week six you are having a conversation about the volume of your headphones that you have not had since you were fifteen.`,
            tone: 'mixed',
            fx: {
              money: 3600,
              expense: -900,
              stress: 14,
              happiness: -6,
              moveTo: 'parents_couch',
              npc: { mum: 14, dad: 4 },
              reputation: -6,
              flag: { movedHome: 1 },
              log: 'Moved back in with parents',
            },
            delayed: [
              {
                inMonths: 8,
                chance: 0.6,
                title: 'YOU SAVED A GENUINE AMOUNT OF MONEY',
                body: `Eight months. You look at the balance and it is a number you could not have produced any other way, and you feel about it exactly the way people who have done this always describe: grateful and slightly humiliated.`,
                tone: 'good',
                fx: { money: 5000, happiness: 6, stress: -6, flag: { savedAtHome: 1 } },
              },
            ],
          },
        ],
      },
      {
        text: 'Move to a cheaper city',
        tag: 'bold',
        highRisk: true,
        time: 3,
        outcomes: [
          {
            title: 'YOU LEFT THE CITY',
            body: `Two hours away, rent is 55% lower and your salary is 30% lower, so you are genuinely ahead and your entire social life is a two-hour train journey.

On the first Sunday you sit in a garden you could never have had and think: correct, and also: quiet.`,
            tone: 'mixed',
            fx: {
              money: 1200,
              expense: -780,
              happiness: 6,
              stress: -14,
              relationships: -10,
              moveTo: 'one_bed',
              jobPerf: -0.1,
              flag: { leftCity: 1 },
              log: 'Moved out of the city',
            },
            delayed: [
              {
                inMonths: 12,
                chance: 0.5,
                title: 'THE TRAIN BECAME THE RELATIONSHIP',
                body: `Every visit is a weekend, which means every visit is an Event, which means you no longer do the ordinary things that hold friendships together.`,
                tone: 'bad',
                fx: { relationships: -12, npc: { jess: -12, marcus: -10 }, happiness: -8 },
              },
            ],
          },
        ],
      },
      {
        text: 'Take on a ridiculous commute instead',
        tag: 'risky',
        highRisk: true,
        time: 2,
        outcomes: [
          {
            title: 'NINETY MINUTES EACH WAY',
            body: `Cheaper flat, further out. Three hours a day on a train, which is ten hours a week, which is a part-time job you are not paid for and which involves a lot of sitting.

You read forty books that year. You also start to feel genuinely strange on Sundays.`,
            tone: 'mixed',
            fx: { expense: -420, stress: 22, health: -8, happiness: -6, flag: { longCommute: 1 } },
            delayed: [
              {
                inMonths: 10,
                chance: 0.55,
                title: 'THE COMMUTE WON',
                body: `You stop reading on the train. You just sit. That is the moment you notice it, and the moment it has already been true for a while.`,
                tone: 'bad',
                fx: { stress: 18, health: -10, happiness: -10 },
              },
            ],
          },
        ],
      },
    ],
  },
];
