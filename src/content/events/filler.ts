import type { GameEvent } from '../../engine/types';

/**
 * FILLER EVENTS
 *
 * Always eligible, always low-stakes, and genuinely part of the game: these
 * exist so the deck can never run dry, and so a run can breathe between the
 * big cards. Every one of them still changes at least one meaningful variable —
 * no dead choices, ever.
 */
export const fillerEvents: GameEvent[] = [
  {
    id: 'filler_month_going_well',
    title: 'A MONTH WITH NOTHING IN IT',
    body: `Work is fine. The flat is fine. Nobody is upset with you and nothing is due and there is a genuinely unfamiliar feeling of having nothing to worry about.

It will not last. That is not pessimism, it is meteorology.`,
    art: 'life_generic',
    cat: 'social',
    weight: 4,
    cooldown: 6,
    choices: [
      {
        text: 'Use it. Get ahead on something.',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU USED THE QUIET MONTH',
            body: `A course module, a savings transfer, an awkward email you have been avoiding for four months, and a dentist appointment.

None of it is interesting. All of it is load-bearing.`,
            tone: 'good',
            fx: { career: 4, money: 200, stress: -4, happiness: 4, counter: { sensible: 1 } },
          },
        ],
      },
      {
        text: 'Use it. Do absolutely nothing.',
        tag: 'lazy',
        time: 1,
        outcomes: [
          {
            title: 'YOU DID NOTHING AND IT WAS EXCELLENT',
            body: `Two films, four hours in a park, one very long bath, and a Tuesday where you did not look at your phone until noon.

You have not been this genuinely rested since a holiday you paid for.`,
            tone: 'good',
            fx: { happiness: 10, stress: -12, energy: 10, career: -2 },
          },
        ],
      },
      {
        text: 'Spend it on something you have wanted for a while',
        tag: 'risky',
        time: 1,
        requires: { minCash: 800 },
        outcomes: [
          {
            title: 'YOU BOUGHT THE THING',
            body: `It is not a necessity and it is not regrettable, and you think about it four or five times over the following year with a small, disproportionate pleasure.`,
            tone: 'good',
            fx: { money: -780, happiness: 12, stress: -6 },
          },
        ],
      },
    ],
  },

  {
    id: 'filler_weekend_choice',
    title: 'THE WEEKEND IS AVAILABLE',
    body: `No plans. Forty-eight hours and a genuinely open decision, which is more pressure than most people admit to.`,
    art: 'life_weekend',
    cat: 'social',
    weight: 4,
    cooldown: 5,
    choices: [
      {
        text: 'See people',
        tag: 'kind',
        time: 1,
        outcomes: [
          {
            title: 'YOU SAW PEOPLE',
            body: `Four friends, a long lunch, a genuinely unnecessary second bottle of wine, and a conversation that goes somewhere real for eleven minutes.

You come home at 19:00 and sleep for ten hours.`,
            tone: 'good',
            fx: { happiness: 12, stress: -10, relationships: 8, money: -110 },
          },
        ],
      },
      {
        text: "Do admin. Life's boring infrastructure.",
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU DID THE INFRASTRUCTURE',
            body: `Insurance, a form, an appointment, a drawer that has needed sorting since March. Four hours of genuinely unglamorous work.

Monday-you is significantly better off and will never know it.`,
            tone: 'good',
            fx: { stress: -8, money: -60, happiness: 2, counter: { sensible: 1 } },
          },
        ],
      },
      {
        text: 'Work on something of your own',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU WORKED ON YOUR OWN THING',
            body: `Six hours, headphones, and a genuinely satisfying afternoon with no meetings and no manager and no document that anybody else needs.

You have not finished it. You have moved it. That is what weekends are for now.`,
            tone: 'good',
            fx: { career: 4, happiness: 6, stress: 4, energy: -6, money: 90 },
          },
        ],
      },
    ],
  },

  {
    id: 'filler_small_temptation',
    title: 'SOMETHING SMALL AND PLEASANT IS ON OFFER',
    body: `It is not important. It is not a life decision. It is a small, immediate, mildly irresponsible option, and you are an adult with a budget and a functioning understanding of consequence.`,
    art: 'life_generic',
    cat: 'money',
    weight: 4,
    cooldown: 4,
    choices: [
      {
        text: 'Yes. Obviously yes.',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU SAID YES',
            body: `It cost you money you did not need to spend and it made a completely ordinary Tuesday measurably better.

That is a legitimate thing to buy with money and you are tired of pretending otherwise.`,
            tone: 'good',
            fx: { money: -140, happiness: 10, stress: -6 },
          },
        ],
      },
      {
        text: 'No. It is not the month for it.',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU SAID NO',
            body: `You put it back. You are, technically, correct, and being correct is a genuinely small and cold sort of pleasure.`,
            tone: 'neutral',
            fx: { money: 40, happiness: -2, stress: 2, counter: { sensible: 1 } },
          },
        ],
      },
      {
        text: 'Find the same thing secondhand',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU FOUND IT SECONDHAND',
            body: `Eleven minutes of searching, 40% cheaper, genuinely good condition, and it arrives on Thursday in a box with somebody else's handwriting on it.

The saving is small and the feeling of having won is disproportionate.`,
            tone: 'good',
            fx: { money: -80, happiness: 8, stress: -2, counter: { sensible: 1 } },
          },
        ],
      },
    ],
  },

  {
    id: 'filler_coworker_lunch',
    title: 'YOU HAVE BEEN INVITED TO LUNCH',
    body: `Four people from your team are going somewhere that takes an hour and a half and costs $22, and the invitation was genuinely warm rather than obligatory.

You have a sandwich in a bag and a thing that needs finishing.`,
    art: 'office_lunch',
    cat: 'workplace',
    weight: 4,
    cooldown: 5,
    choices: [
      {
        text: 'Go. Abandon the sandwich.',
        tag: 'kind',
        time: 1,
        outcomes: [
          {
            title: 'YOU WENT TO LUNCH',
            body: `An hour and a half, a genuinely funny conversation, and a piece of information about a restructure that is not public yet and that you now have eleven days' warning about.

That is what these lunches are for.`,
            tone: 'good',
            fx: { money: -22, career: 4, relationships: 6, happiness: 6, npc: { priya: 8 }, stress: -4 },
          },
        ],
      },
      {
        text: 'Stay and finish the thing',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU FINISHED THE THING',
            body: `Forty minutes of genuine focus with nobody in the building asking you anything. The thing is done, and it is good.

Three people went to lunch. You find out later what was discussed and you find it out last.`,
            tone: 'mixed',
            fx: { career: 3, jobPerf: 0.08, stress: 2 },
          },
        ],
      },
    ],
  },

  {
    id: 'filler_junk_mail_decision',
    title: 'A LETTER THAT IS NOT QUITE JUNK',
    body: `Insurance, or a bank, or a company you have some relationship with, offering something that is either a genuinely good idea or a way of extracting $34 a month for the rest of your life.

The small print is in a font designed by committee.`,
    art: 'money_letter',
    cat: 'money',
    weight: 4,
    cooldown: 6,
    choices: [
      {
        text: 'Read the small print properly',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU READ IT PROPERLY',
            body: `Twenty minutes and one genuinely alarming clause, which is more than 99% of people do and which saves you a real amount of money.`,
            tone: 'good',
            fx: { money: 90, stress: 4, happiness: 2, counter: { sensible: 1 } },
          },
        ],
      },
      {
        text: 'Bin it',
        tag: 'lazy',
        time: 1,
        outcomes: [
          {
            title: 'YOU BINNED IT',
            body: `It goes in the recycling, unopened, and joins a stack of things that are probably fine.

You will never know, which is genuinely the cheaper option most of the time.`,
            tone: 'neutral',
            fx: { stress: -2 },
          },
        ],
      },
      {
        text: 'Sign up because the man on the phone was nice',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'YOU SIGNED UP',
            body: `He was genuinely pleasant and asked about your day and you agreed to something you do not fully understand, which is the entire business model, executed perfectly.`,
            tone: 'bad',
            fx: { expense: 34, stress: 6, happiness: -4, counter: { chaos: 1 }, flag: { junkSubscription: 1 } },
          },
        ],
      },
    ],
  },

  {
    id: 'filler_health_baseline',
    title: 'YOU HAVE NOT SLEPT PROPERLY IN A WHILE',
    body: `Not badly. Just consistently 5% below where you need to be, which is the condition in which most adult decisions get made.

You have started to notice it at about 15:00 on weekdays.`,
    art: 'health_sleep',
    cat: 'health',
    weight: 4,
    cooldown: 6,
    choices: [
      {
        text: 'Fix the basics: earlier nights, less screen, actual water',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU FIXED THE BASICS',
            body: `Eleven days of genuinely boring discipline. In bed at 22:45, phone charging in the kitchen, water intake measured like a project.

It works. It is infuriating how well it works.`,
            tone: 'good',
            fx: { health: 8, energy: 12, stress: -10, happiness: 6, counter: { healthy: 1 } },
          },
        ],
      },
      {
        text: 'Push through it. You have things to do.',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU PUSHED THROUGH',
            body: `Three coffees before eleven and a genuinely productive afternoon, and a 02:40 wake-up where your brain offers you a full list of everything you have ever done wrong.`,
            tone: 'mixed',
            fx: { career: 3, energy: -10, health: -6, stress: 10 },
          },
        ],
      },
    ],
  },

  {
    id: 'filler_weather_week',
    title: 'A WEEK WHERE EVERYTHING IS SLIGHTLY HARDER',
    body: `Nothing has gone wrong. It is just that everything – the trains, the printer, the weather, a specific colleague's tone in a specific meeting – has been 10% worse than usual for eight consecutive days.`,
    art: 'life_generic',
    cat: 'health',
    weight: 4,
    cooldown: 5,
    choices: [
      {
        text: 'Recognise it for what it is and be kind to yourself',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU NOTICED IT',
            body: `You name it, out loud, to {partner} or to nobody: "this is just a bad week, it is not a bad life." It sounds absurd and it genuinely helps.`,
            tone: 'good',
            fx: { stress: -14, happiness: 8, health: 3 },
          },
        ],
      },
      {
        text: 'Take it out on a small, unrelated thing',
        tag: 'risky',
        time: 1,
        outcomes: [
          {
            title: 'YOU SNAPPED AT SOMETHING IRRELEVANT',
            body: `A customer service person, or a delivery driver, or a partner who asked a completely reasonable question about dinner.

It lasts four seconds and you think about it for four days.`,
            tone: 'bad',
            fx: { happiness: -8, stress: 8, karma: -6, relationships: -6 },
          },
        ],
      },
      {
        text: 'Book something to look forward to',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU BOOKED SOMETHING',
            body: `Two tickets, eleven weeks out, in a category of thing you would not normally do.

The having-booked is worth as much as the going, which is a thing about humans that Nobody understands.`,
            tone: 'good',
            fx: { money: -210, happiness: 14, stress: -12 },
          },
        ],
      },
    ],
  },
];
