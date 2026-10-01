import type { GameEvent } from '../../engine/types';

/** HEALTH — the stat that quietly ends the game if ignored. */
export const healthEvents: GameEvent[] = [
  {
    id: 'health_ignored_symptom',
    title: 'IT HAS BEEN THREE WEEKS',
    body: `It is probably nothing. It is the kind of nothing that a person googles at 23:00 and then closes the laptop quickly.

It has not gone away. It has, in fact, become a thing you now arrange your day around slightly.`,
    art: 'health_checkup',
    cat: 'health',
    weight: 14,
    cooldown: 30,
    when: { age: [24, 80], stats: { health: [0, 82] } },
    choices: [
      {
        text: 'Book the appointment',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU WENT TO THE DOCTOR',
            body: `The doctor is {doctor} and she is calm in a way that makes you calm, and then she says "let's just run a few things" in a way that makes you not calm at all.

Two weeks of waiting for results. It is the longest two weeks of your adult life and you will be genuinely, embarrassingly grateful for a normal result.`,
            tone: 'good',
            fx: { money: -180, stress: 10, health: 8, happiness: 4, flag: { sawDoctor: 1 } },
            delayed: [
              { inMonths: 2, chance: 0.85, title: 'IT WAS NOTHING', body: `A slightly irritated something. A change to one thing. A follow-up in six months that you will reschedule twice and eventually attend.`, tone: 'good', fx: { health: 10, stress: -12, happiness: 10 } },
              { inMonths: 2, chance: 0.15, title: 'IT WAS NOT NOTHING', body: `Caught early, which is the phrase they use, and which is the only phrase that matters. Treatment is straightforward and unpleasant and entirely successful.`, tone: 'mixed', fx: { health: -6, stress: 16, money: -2400, happiness: -6, flag: { healthScare: 1 } } },
            ],
          },
        ],
      },
      {
        text: 'Ignore it. It will sort itself out.',
        tag: 'risky',
        highRisk: true,
        time: 3,
        outcomes: [
          {
            title: 'YOU IGNORED IT SUCCESSFULLY',
            body: `It does sort itself out, three months later, quietly, without any intervention or explanation.

You take from this entirely the wrong lesson.`,
            tone: 'mixed',
            fx: { stress: 8, health: -4, flag: { ignoresSymptoms: 1 } },
          },
        ],
      },
      {
        text: 'Google it thoroughly and conclude the worst',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'YOU HAVE FOUR CONDITIONS AND ELEVEN WEEKS TO LIVE',
            body: `You read for two hours. You read a forum thread from 2011 that ends without an update, which is the most terrifying thing on the internet.

You do not sleep. You eventually go to the doctor, who tells you it is nothing, and you cry in the car park from pure relief.`,
            tone: 'chaos',
            fx: { stress: 26, health: -6, happiness: -8, money: -180, counter: { chaos: 1 } },
          },
        ],
      },
    ],
  },

  {
    id: 'health_the_gym_membership',
    title: 'THE DIRECT DEBIT IS STILL GOING OUT',
    body: `You have paid $62 a month for eleven months. You have been six times. That is $113 per visit, which is more than a hotel gym in a hotel you could not afford to stay in.

The email says: "We've noticed you haven't visited in a while! Come back and see us 💪"`,
    art: 'health_gym',
    cat: 'health',
    weight: 11,
    cooldown: 36,
    when: { age: [23, 70] },
    choices: [
      {
        text: 'Actually go. Three times a week. Properly.',
        tag: 'bold',
        time: 2,
        outcomes: [
          {
            title: 'YOU WENT PROPERLY',
            body: `The first two weeks are genuinely miserable. The third week is less miserable. By week six you notice you are taking the stairs without thinking about it, and by week ten you are a person who has opinions about running shoes.

You have not lost weight. Everything is easier.`,
            tone: 'good',
            fx: { health: 16, stress: -16, energy: 14, happiness: 12, expense: 62, flag: { fitness: 1 }, counter: { healthy: 1 } },
            delayed: [
              {
                inMonths: 18,
                chance: 0.5,
                title: 'IT MATTERED LATER',
                body: `A routine check-up at 41 has a genuinely good outcome and the doctor says "whatever you're doing, keep doing it," and you think about a stairwell in your thirties.`,
                tone: 'good',
                fx: { health: 14, happiness: 10, money: 0 },
              },
            ],
          },
        ],
      },
      {
        text: 'Cancel it and buy running shoes instead',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU CANCELLED IT',
            body: `The cancellation takes eleven minutes on a website designed by someone who hates you, and you buy a decent pair of shoes for $95 and run outside like a person from a film.

You run four times in the first month. That is four more times than the gym.`,
            tone: 'good',
            fx: { money: -95, expense: -62, health: 8, stress: -8, energy: 6, happiness: 6, counter: { sensible: 1 } },
          },
        ],
      },
      {
        text: 'Keep paying and keep not going',
        tag: 'lazy',
        time: 3,
        outcomes: [
          {
            title: 'YOU HAVE KEPT PAYING',
            body: `It is now, functionally, a subscription to a feeling. The feeling is "I am a person who goes to the gym," which is genuinely valuable and costs $744 a year.`,
            tone: 'neutral',
            fx: { money: -186, stress: 4, happiness: -2, expense: 62 },
          },
        ],
      },
    ],
  },

  {
    id: 'health_burnout_collapse',
    title: 'YOU CANNOT GET UP',
    body: `Not in a dramatic way. In a way where the alarm goes at 7:10 and you look at the ceiling and understand, with total clarity, that you are not going to be able to do today.

This has never happened to you before.`,
    art: 'health_exhausted',
    cat: 'health',
    weight: 15,
    cooldown: 30,
    priority: 2,
    when: { stats: { stress: [78, 100] }, age: [24, 70] },
    choices: [
      {
        text: 'Call in sick and sleep for two days',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU TOOK TWO DAYS',
            body: `You sleep for eleven hours and then four more. You eat something in the afternoon. You do not look at your phone.

On the second evening you sit in a chair with a cup of tea and feel a genuinely unfamiliar sensation, which after some examination turns out to be "fine."`,
            tone: 'good',
            fx: { stress: -30, health: 12, energy: 16, happiness: 10, jobPerf: -0.1, career: -2 },
          },
        ],
      },
      {
        text: 'Go to work anyway',
        tag: 'risky',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'YOU WENT IN',
            body: `You are genuinely not fit to be in a building. You sit in three meetings and contribute nothing and leave at 16:40, and nobody notices, which tells you something about the meetings.

You do this for eleven more days.`,
            tone: 'bad',
            fx: { stress: 14, health: -16, energy: -14, jobPerf: -0.2, happiness: -10 },
            delayed: [
              {
                inMonths: 2,
                chance: 0.65,
                title: 'YOUR BODY MADE THE DECISION',
                body: `Not dramatic. Just a Tuesday in which you stand up and have to sit back down, and then a fortnight off, and a doctor saying the word "exhaustion" without a follow-up sentence.`,
                tone: 'bad',
                art: 'health_sick',
                fx: { stress: -16, health: -14, career: -8, money: -1600, happiness: -10 },
              },
            ],
          },
        ],
      },
      {
        text: 'Resign. Today. On the phone.',
        tag: 'chaotic',
        highRisk: true,
        time: 2,
        outcomes: [
          {
            title: 'YOU RESIGNED FROM BED',
            body: `You do it by email, lying down, at 9:41, with a sentence you wrote three times. It is genuinely the most adult thing you have done in five years and it is extremely badly received.

Then you sleep for a fortnight, and then you start, slowly, to get better.`,
            tone: 'chaos',
            fx: {
              career: -20,
              stress: -34,
              health: 14,
              happiness: 12,
              setCareer: null,
              flag: { quitForHealth: 1 },
              counter: { quitJobs: 1 },
              log: 'Resigned for health reasons',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'health_drinking_question',
    title: 'IT HAS BECOME A REGULAR THING',
    body: `Not a problem. Nobody has said the word. But it is Tuesday and you are having the second one because the first one did nothing, and you have noticed yourself noticing that.

{partner} said something last week that was not quite about drinking and was entirely about drinking.`,
    art: 'health_drink',
    cat: 'health',
    weight: 12,
    cooldown: 36,
    when: { age: [26, 70], stats: { health: [0, 78] } },
    choices: [
      {
        text: 'Stop for three months and see',
        tag: 'smart',
        time: 3,
        outcomes: [
          {
            title: 'YOU STOPPED FOR THREE MONTHS',
            body: `The first two weeks are genuinely boring in a way you did not expect, and you have no idea what to do with your hands in a pub.

Week three you sleep properly for the first time in years. Week six you have a conversation with {friend} that you would not have had otherwise. You do not decide to stop forever. You just know that you can.`,
            tone: 'good',
            fx: { health: 16, stress: -12, energy: 14, happiness: 8, relationships: 8, money: 620, flag: { soberCurious: 1 }, counter: { healthy: 1 } },
          },
        ],
      },
      {
        text: 'Cut down. Only weekends.',
        tag: 'safe',
        time: 2,
        outcomes: [
          {
            title: 'YOU CUT DOWN',
            body: `It works for six weeks and then a Thursday happens, and then a work thing, and then it is Tuesday again and you are having the second one.

You have not failed. You have established a baseline, which is useful information.`,
            tone: 'mixed',
            fx: { health: 6, stress: -4, money: 200, happiness: 2 },
          },
        ],
      },
      {
        text: 'Talk to {partner} about it honestly',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU STARTED THE CONVERSATION',
            body: `You say it first, before they can, which changes the entire shape of the evening. They had been rehearsing something for two weeks and now they do not have to say it.

"I don't think it's a problem," they say. "I think you're unhappy, and this is where it goes."`,
            tone: 'good',
            fx: { relationships: 14, happiness: 10, stress: -8, health: 8, npc: { partner: 18 }, flag: { honestAboutDrinking: 1 } },
          },
        ],
      },
      {
        text: 'Deflect with a joke',
        tag: 'lazy',
        time: 2,
        outcomes: [
          {
            title: 'YOU MADE A JOKE ABOUT IT',
            body: `It is a genuinely good joke. It gets a genuine laugh. It also closes a door very quietly, and you both hear the click.`,
            tone: 'bad',
            fx: { health: -6, stress: 10, relationships: -8, npc: { partner: -14 }, happiness: -4 },
            delayed: [
              {
                inMonths: 14,
                chance: 0.5,
                title: 'THEY STOPPED MENTIONING IT',
                body: `Not acceptance. Cessation of trying. It is a much worse thing and it is much harder to notice.`,
                tone: 'bad',
                fx: { relationships: -10, health: -10, stress: 12, happiness: -10 },
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'health_big_bill',
    title: 'THE HOSPITAL BILL HAS ARRIVED',
    body: `It is itemised, which is the cruelty. A line for a thing you do not remember, a line for a person you never met, and a line for a small plastic object that cost $180 and is presumably now landfill.

You were insured. The insurance has views.`,
    art: 'health_bill',
    cat: 'money',
    weight: 12,
    cooldown: 36,
    when: { minCash: 500, age: [23, 80] },
    choices: [
      {
        text: 'Pay it and be done',
        hint: '$2,400',
        tag: 'safe',
        time: 1,
        requires: { minCash: 2400 },
        outcomes: [
          {
            title: 'YOU PAID IT',
            body: `It takes eleven minutes and it is the single largest debit from your account this year and there is nothing to show for it at all.

You keep the itemised bill. You do not know why you keep it.`,
            tone: 'mixed',
            fx: { money: -2400, stress: 12, happiness: -6 },
          },
        ],
      },
      {
        text: 'Call them and dispute the itemised charges',
        tag: 'smart',
        time: 2,
        outcomes: [
          {
            title: 'YOU SPENT THREE HOURS ON THE PHONE',
            body: `Hold music, four transfers, one genuinely helpful person called Denise who is not supposed to do what she does.

The bill comes down by 61%. Your hourly rate for that phone call is genuinely better than your job.`,
            tone: 'good',
            fx: { money: -950, stress: 14, happiness: 6, counter: { negotiations: 1, sensible: 1 } },
          },
        ],
      },
      {
        text: 'Ignore it and hope it goes away',
        tag: 'risky',
        highRisk: true,
        time: 2,
        outcomes: [
          {
            title: 'YOU PUT IT IN A DRAWER',
            body: `It does not go away. It goes to a second letter, then a third with red on it, then a phone call at 09:14 from a number you do not recognise.

You pay it eventually, with a fee, and the drawer has cost you $380 and eleven months of low hum.`,
            tone: 'bad',
            fx: { money: -2780, stress: 22, happiness: -8, counter: { chaos: 1 } },
          },
        ],
      },
    ],
  },

  {
    id: 'health_mind',
    title: 'SOMETHING IS NOT RIGHT AND YOU CANNOT NAME IT',
    body: `Not sad, exactly. Not stressed, exactly. It is more that the things you used to look forward to have become things you have to remember to look forward to.

You have been describing it to yourself as "a bit flat" for about seven months.`,
    art: 'health_mind',
    cat: 'health',
    weight: 14,
    cooldown: 36,
    when: { stats: { happiness: [0, 55] }, age: [22, 80] },
    choices: [
      {
        text: 'Talk to a professional',
        tag: 'smart',
        time: 2,
        outcomes: [
          {
            title: 'YOU BOOKED A SESSION',
            body: `The first one is genuinely awkward and you spend most of it explaining things you already knew. The fourth one is where it starts.

It is expensive and it is not a fix; it is a set of tools, and the tools work.`,
            tone: 'good',
            fx: { money: -900, stress: -18, happiness: 14, health: 8, relationships: 6, flag: { inTherapy: 1 }, milestone: 'Started therapy' },
          },
        ],
      },
      {
        text: 'Tell {friend}. Properly. Not the social version.',
        tag: 'kind',
        time: 1,
        outcomes: [
          {
            title: 'YOU TOLD JESS THE REAL VERSION',
            body: `Not "yeah, busy, you?" — the actual thing, at 22:40, in a kitchen, with a bottle of wine that neither of you finishes.

She does not try to fix it. She asks two good questions and then just sits there with you, and that turns out to be the whole treatment.`,
            tone: 'good',
            fx: { happiness: 16, stress: -18, relationships: 14, npc: { jess: 22 }, flag: { leanedOnFriend: 1 } },
            delayed: [
              {
                inMonths: 10,
                chance: 0.6,
                title: 'SHE REMEMBERED TO CHECK',
                body: `A message, unprompted, four months later: "hey. how are you actually doing?" You had forgotten anybody knew.`,
                tone: 'good',
                fx: { happiness: 12, stress: -10, npc: { jess: 14 } },
              },
            ],
          },
        ],
      },
      {
        text: 'Change something physical instead',
        tag: 'bold',
        time: 2,
        outcomes: [
          {
            title: 'YOU CHANGED THE OUTSIDE',
            body: `New flat, new haircut, new city, new job application, all in eleven weeks. It is a genuinely effective short-term strategy and everyone around you is impressed.

The flat feeling comes with you, because it lives in your head, which you find out at about month four.`,
            tone: 'mixed',
            fx: { money: -3200, stress: 14, happiness: 10, health: 8, flag: { rearrangedTheDeck: 1 } },
            delayed: [
              {
                inMonths: 5,
                chance: 0.6,
                title: 'IT CAUGHT UP',
                body: `You are in a nicer room, in a better city, with the same feeling, and there is now nowhere left to move to.`,
                tone: 'bad',
                fx: { happiness: -14, stress: 16 },
              },
            ],
          },
        ],
      },
      {
        text: 'Do nothing. It is probably just a phase.',
        tag: 'lazy',
        time: 3,
        outcomes: [
          {
            title: 'YOU DID NOTHING',
            body: `Three months. It does not get worse in a way you could point at, and it does not get better, and the flatness becomes the default setting rather than a temporary condition.

You will remember this period as a blur, which is exactly what it is.`,
            tone: 'bad',
            fx: { happiness: -8, stress: 10, health: -6, energy: -10 },
          },
        ],
      },
    ],
  },
];
