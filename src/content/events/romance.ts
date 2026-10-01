import type { GameEvent } from '../../engine/types';

/**
 * ROMANCE
 *
 * Adult, not explicit. The tension in these events comes from logistics,
 * money, timing and the specific horror of being asked a direct question
 * about your intentions.
 */
export const romanceEvents: GameEvent[] = [
  {
    id: 'romance_first_meeting',
    title: 'THIS COULD GO SEVERAL WAYS',
    body: `You have been talking to someone for forty minutes at a party and it has been the kind of conversation that makes the room go slightly out of focus.

They are funny in a way that is not performing. They asked you a real question and then listened to the answer, which is statistically rare.`,
    art: 'romance_bar',
    cat: 'romance',
    weight: 18,
    cooldown: 30,
    when: { partner: ['single', 'divorced'], age: [21, 62] },
    choices: [
      {
        text: 'Ask them out. Directly.',
        tag: 'bold',
        time: 1,
        outcomes: [
          { weight: 6, variance: 1, title: 'THEY SAID YES', body: `You ask. They look at you for a half-second longer than necessary and say "yeah, actually, I'd like that," and you exchange numbers and stand there for a further twenty minutes because neither of you wants to be the one who leaves.`, tone: 'good', fx: { happiness: 14, npc: { partner: 24 }, setPartner: { npcId: 'new', status: 'dating' }, flag: { dating: 1 } } },
          { weight: 4, variance: 1, title: 'THEY ARE SEEING SOMEONE', body: `"Oh — I'm actually sort of seeing someone," they say, kindly, and then you have to do the following ninety seconds, which are the longest ninety seconds in the known universe.`, tone: 'bad', fx: { happiness: -8, stress: 8, npc: { partner: 10 } } },
        ],
      },
      {
        text: 'Get their number, leave it there for now',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU GOT THE NUMBER',
            body: `You message the next day with something that took eleven minutes to compose. They reply in four minutes with something much better.

It goes on for three weeks this way: good, careful, a little formal.`,
            tone: 'good',
            fx: { happiness: 8, npc: { partner: 12 }, setPartner: { npcId: 'new', status: 'dating' } },
          },
        ],
      },
      {
        text: 'Say something extremely clever and then leave without asking',
        tag: 'lazy',
        time: 1,
        outcomes: [
          {
            title: 'YOU WERE VERY FUNNY AND THEN YOU LEFT',
            body: `You do land the good line. You land it perfectly. And then you leave, because leaving is easier than asking.

You think about it in the taxi for eleven minutes, and then occasionally for four years.`,
            tone: 'bad',
            fx: { happiness: -6, stress: 6, npc: { partner: 8 }, flag: { whatIf: 1 } },
          },
        ],
      },
    ],
  },

  {
    id: 'romance_move_in',
    title: 'THE QUESTION OF THE KEYS',
    body: `It has been about a year. They have a toothbrush at yours and you have a drawer at theirs and neither of you has ever said the sentence out loud.

The rent is going up in both places. That is genuinely a factor. You both know that it is genuinely a factor.`,
    art: 'romance_movein',
    cat: 'romance',
    weight: 14,
    cooldown: 60,
    when: { partner: ['dating'], npc: { partner: [40, 100] }, age: [22, 55] },
    choices: [
      {
        text: 'Ask them to move in',
        tag: 'bold',
        time: 2,
        outcomes: [
          {
            title: 'THEY SAID YES AND THEN THERE WAS A VAN',
            body: `"Obviously," they say, which is the best possible answer and also means this conversation could have happened eight months ago.

Then there is a van, and then there is a conversation about a lamp that will define your relationship for the next three years.`,
            tone: 'good',
            fx: {
              happiness: 16,
              stress: 8,
              expense: 300,
              flag: { cohabiting: 1 },
              npc: { partner: 20 },
              milestone: 'Moved in with someone',
              log: 'Moved in with a partner',
            },
            delayed: [
              {
                inMonths: 10,
                chance: 0.5,
                title: 'THE LAMP HAS RECURRED',
                body: `It has come up four times. It is, objectively, a deeply unpleasant lamp. It is not about the lamp, and both of you know it is not about the lamp, and both of you will discuss the lamp anyway.`,
                tone: 'mixed',
                fx: { stress: 10, npc: { partner: -6 }, happiness: -4 },
              },
              {
                inMonths: 16,
                chance: 0.4,
                title: 'IT BECAME A HOME',
                body: `One evening you come in and they have rearranged something small, and there is a meal happening, and you have the specific and surprising thought that you are quite happy.`,
                tone: 'good',
                fx: { happiness: 14, stress: -10, npc: { partner: 14 } },
              },
            ],
          },
        ],
      },
      {
        text: 'Wait for them to bring it up',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU WAITED',
            body: `Eleven weeks. They are also waiting. It becomes a silent contest of who is less afraid, and it gets itself resolved by an argument about something else entirely at the end of October.`,
            tone: 'mixed',
            fx: { stress: 12, happiness: -6, npc: { partner: -8 } },
          },
        ],
      },
      {
        text: 'Suggest they keep their own place for now',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU KEPT TWO PLACES',
            body: `It is a perfectly reasonable position, articulated reasonably, and it lands as a door being closed gently but definitively.

"Right," they say. "No, that's — no, that's sensible." They do not mention it again for a long time.`,
            tone: 'bad',
            fx: { npc: { partner: -14 }, happiness: -8, stress: 6, flag: { keptDistance: 1 } },
          },
        ],
      },
    ],
  },

  {
    id: 'romance_meet_family',
    title: 'THEY WANT YOU TO MEET THEIR PARENTS',
    body: `"They're fine," they say, in the tone of somebody describing something that is not fine.

There is a roast. There is a brother who "can be a lot." There is a very specific set of questions you will be asked and you have two days to write the answers.`,
    art: 'familyscene_dinner',
    cat: 'romance',
    weight: 13,
    cooldown: 60,
    when: { partner: ['dating', 'engaged'], age: [22, 60] },
    choices: [
      {
        text: 'Turn up early, bring wine, be genuinely useful',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU WERE EARLY AND YOU CARRIED THINGS',
            body: `You arrive with a bottle and take a tray from a person who was not expecting help. You ask the father about his garden and the mother about her work and you do not talk about yourself once.

They are warm by the third hour. On the drive home, your partner says nothing for four minutes and then says "they liked you," in a voice that suggests they did not expect to be able to say that.`,
            tone: 'good',
            fx: { happiness: 12, npc: { partner: 18 }, relationships: 10, reputation: 6, flag: { metFamily: 1 } },
          },
        ],
      },
      {
        text: 'Be honest when asked about your plans in life',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU TOLD THEM THE TRUTH ABOUT YOUR FUTURE',
            body: `The father asks what you are doing with yourself, genuinely wanting to know, and you tell him something true and unpolished and slightly uncertain.

He nods slowly. "I respect that," he says, and does not clarify what part, and you spend the next hour trying to work it out.`,
            tone: 'mixed',
            fx: { reputation: 4, happiness: 4, npc: { partner: 10, dad: 0 }, flag: { honestInLaws: 1 } },
            delayed: [
              {
                inMonths: 8,
                chance: 0.5,
                title: 'HE REMEMBERED WHAT YOU SAID',
                body: `A phone call from a person you have met twice, asking whether you were serious about that thing you said at the table. He has a contact. He is not doing it for you — he is doing it for his child.`,
                tone: 'good',
                fx: { career: 8, money: 2000, npc: { partner: 10 } },
              },
            ],
          },
        ],
      },
      {
        text: 'Make yourself impressive',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU PERFORMED BEAUTIFULLY',
            body: `You have the job, the flat, the plan, the story about the client. It is a genuinely good performance and the mother is genuinely impressed.

The brother, at the door, says "you don't have to do that here" and it is either a kindness or the most surgical insult you have received all year.`,
            tone: 'mixed',
            fx: { reputation: 8, stress: 12, npc: { partner: -4 }, happiness: -2 },
          },
        ],
      },
      {
        text: 'Cancel. Say you are unwell.',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'YOU DID NOT GO',
            body: `You have a genuine headache and you use it, and it works, and then the photographs from the evening start appearing and you are in none of them, because you were not there.

"I told them you were sick," they say later. "They asked if you were going to be at the next one."`,
            tone: 'bad',
            fx: { stress: 10, happiness: -8, npc: { partner: -16 }, relationships: -6, counter: { chaos: 1 } },
          },
        ],
      },
    ],
  },

  {
    id: 'romance_money_fight',
    title: 'IT IS ACTUALLY ABOUT MONEY',
    body: `The argument started about a weekend away and it is now about everything, and both of you know it, and neither of you can stop.

"Every single time we have to make a decision about money," they say, "you make it on your own and tell me afterwards."`,
    art: 'romance_argument',
    cat: 'romance',
    weight: 14,
    cooldown: 24,
    when: { partner: ['dating', 'engaged', 'married'], age: [22, 70] },
    choices: [
      {
        text: 'Apologise, properly, without a "but"',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU APOLOGISED WITHOUT A QUALIFIER',
            body: `No "but I thought". No "only because". Just the apology, delivered flat, and then silence to let it land.

They are visibly braced for the second half of the sentence and it does not arrive. Something in the room shifts by about two degrees.`,
            tone: 'good',
            fx: { relationships: 12, npc: { partner: 16 }, stress: -8, happiness: 6, flag: { apologisedProperly: 1 } },
          },
        ],
      },
      {
        text: 'Defend the decision with numbers',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU PRODUCED A GENUINELY SOLID CASE',
            body: `You explain the position clearly. It is a good explanation. It is internally consistent and it addresses every point they made and it is exactly the wrong thing to do to a person who is telling you they feel shut out.

"That's not the point," they say, and they are correct.`,
            tone: 'bad',
            fx: { stress: 14, happiness: -10, npc: { partner: -14 }, relationships: -6 },
          },
        ],
      },
      {
        text: 'Turn it around and bring up something they did',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'YOU MENTIONED THE THING',
            body: `It is a real thing and it happened in a different month and it is not the same category of thing at all, and you say it anyway, and the temperature drops about nine degrees.

Neither of you sleeps well. In the morning the argument has a history, a name, and a repeat schedule.`,
            tone: 'chaos',
            fx: { relationships: -14, npc: { partner: -22 }, stress: 20, happiness: -14, counter: { chaos: 1 } },
            delayed: [
              {
                inMonths: 6,
                chance: 0.6,
                title: 'IT BECAME THE THING YOU SAY',
                body: `It has become shorthand. It comes up now as a reference, a shorthand, a card that gets played when the argument needs an escalation.`,
                tone: 'bad',
                fx: { relationships: -8, npc: { partner: -8 }, happiness: -8 },
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'romance_proposal',
    title: 'THE QUESTION, EVENTUALLY',
    body: `You are both at an age where other people have started using the word. Your mother has started using it. There is a ring shop you walk past twice a week and have begun to notice deliberately.

You are happy. You are also aware that this is a decision and not a conclusion.`,
    art: 'romance_proposal',
    cat: 'romance',
    weight: 13,
    cooldown: 999,
    priority: 2,
    when: {
      partner: ['dating'],
      npc: { partner: [58, 100] },
      romanceMonths: [10, 999],
      age: [24, 55],
      has: ['cohabiting'],
    },
    choices: [
      {
        text: 'Propose',
        tag: 'bold',
        time: 2,
        outcomes: [
          {
            title: 'THEY SAID YES',
            body: `You do it in a way that is slightly botched and entirely sincere, and they laugh and then cry and then say the word, and you spend forty minutes on a bench with your arms around each other not saying anything useful.

Then the wedding happens, or rather the planning of the wedding happens, which is a different game entirely.`,
            tone: 'good',
            fx: {
              happiness: 20,
              stress: 10,
              money: -4400,
              relationships: 12,
              npc: { partner: 24, mum: 12 },
              setPartner: { npcId: 'partner', status: 'engaged' },
              milestone: 'Engaged',
              log: 'Proposed and was accepted',
              counter: { proposals: 1 },
            },
            delayed: [
              {
                inMonths: 11,
                chance: 0.7,
                title: 'THE WEDDING WAS ENORMOUS AND EXPENSIVE',
                body: `Two families, one seating chart, and an argument about a cousin that will be referenced for a decade. You are married. The photographs are genuinely good.`,
                tone: 'good',
                art: 'social_wedding',
                fx: {
                  setPartner: { npcId: 'partner', status: 'married' },
                  money: -11000,
                  happiness: 16,
                  stress: 8,
                  milestone: 'Married',
                  log: 'Married',
                },
              },
              {
                inMonths: 11,
                chance: 0.3,
                title: 'THE ENGAGEMENT DID NOT SURVIVE THE PLANNING',
                body: `It is not one fight. It is a series of small negotiations about other people's expectations in which both of you stop being the people who were on the bench.`,
                tone: 'bad',
                fx: {
                  setPartner: { npcId: null, status: 'single' },
                  happiness: -22,
                  stress: 26,
                  relationships: -10,
                  counter: { breakups: 1 },
                  log: 'Engagement ended',
                },
              },
            ],
          },
        ],
      },
      {
        text: 'Say you are happy as it is',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: '"I\'M HAPPY. THIS IS ENOUGH FOR ME."',
            body: `It is true when you say it, which is the problem. They hear it and nod and say "okay" and it is genuinely okay, right up until it is not, and by then it has been three years and neither of you has raised it again.`,
            tone: 'mixed',
            fx: { stress: -4, happiness: 4, npc: { partner: -12 }, flag: { refusedMarriage: 1 } },
            delayed: [
              {
                inMonths: 30,
                chance: 0.5,
                title: 'THEY BROUGHT IT UP',
                body: `A quiet evening, a bottle of wine, and the sentence they have been holding for two and a half years: "I need to know whether this is it."`,
                tone: 'mixed',
                fx: { stress: 20, happiness: -10, npc: { partner: -10 } },
              },
            ],
          },
        ],
      },
      {
        text: 'End it. You know this is not it.',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU ENDED IT',
            body: `You are honest and it takes eleven minutes and it is the worst eleven minutes of the year, and then you are outside their building at 11pm with everything you own in a bag.

You are correct. Being correct is not a comfort, and you knew that, and you did it anyway.`,
            tone: 'bad',
            fx: {
              happiness: -20,
              stress: 24,
              relationships: -12,
              npc: { partner: -20, jess: -4 },
              setPartner: { npcId: null, status: 'single' },
              counter: { breakups: 1 },
              log: 'Ended a long relationship',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'romance_jealousy',
    title: 'WHO IS THAT',
    body: `It is nothing. You know it is nothing because it is your nothing.

But it is now the third time this month that the name has come up in a particular tone, and you are being asked a question that is not the question being asked.`,
    art: 'romance_jealousy',
    cat: 'romance',
    weight: 11,
    cooldown: 36,
    when: { partner: ['dating', 'engaged', 'married'], stats: { relationships: [0, 75] } },
    choices: [
      {
        text: 'Explain fully and openly',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU TOLD THEM EVERYTHING',
            body: `Completely, including the parts that were not necessary, including a detail you had not planned to include, because you would rather be slightly over-transparent than live inside this conversation twice.

"Okay," they say. "Thank you. Sorry." And it is genuinely finished, which is rarer than it should be.`,
            tone: 'good',
            fx: { relationships: 8, npc: { partner: 12 }, stress: -8, happiness: 6 },
          },
        ],
      },
      {
        text: 'Ask them why they are really asking',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU ASKED THE SECOND QUESTION',
            body: `"What are you actually worried about?" It takes them a long time to answer, and the answer is about their last relationship, and it is not about you at all, and this turns out to be genuinely useful.`,
            tone: 'good',
            fx: { relationships: 10, npc: { partner: 14 }, happiness: 6, stress: 2, flag: { openConversation: 1 } },
          },
        ],
      },
      {
        text: 'Get defensive',
        tag: 'risky',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: '"I CAN\'T BELIEVE WE\'RE DOING THIS"',
            body: `You escalate first, which is a strategy, and the strategy works in the sense that they drop it immediately.

They drop it in a way that suggests a file has been opened somewhere and will be added to.`,
            tone: 'bad',
            fx: { relationships: -10, npc: { partner: -14 }, stress: 14, happiness: -8 },
            delayed: [
              {
                inMonths: 7,
                chance: 0.55,
                title: 'THE FILE WAS REOPENED',
                body: `It comes back, during something completely unrelated, brought out with the specific smoothness of a person who has been holding on to it.`,
                tone: 'bad',
                fx: { relationships: -8, stress: 16, happiness: -10, npc: { partner: -8 } },
              },
            ],
          },
        ],
      },
      {
        text: 'Take it as an opportunity to be very funny about it',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU DEFUSED IT WITH COMEDY',
            body: `It works, immediately, and the mood lifts, and you get a genuine laugh and probably two days of credit.

The thing underneath it is still underneath it. Comedy is excellent at moving things out of the room and useless at removing them.`,
            tone: 'mixed',
            fx: { relationships: 4, happiness: 4, stress: -4, npc: { partner: 6 }, flag: { deflectedWithJokes: 1 } },
          },
        ],
      },
    ],
  },

  {
    id: 'romance_ex_returns',
    title: 'THE MESSAGE ARRIVES AT 22:40',
    body: `"Hey. I know this is random. I was walking past the place we used to go and I thought about you."

You read it. You read it again. You put the phone face down and then pick it up again eleven seconds later.`,
    art: 'romance_ex',
    cat: 'romance',
    weight: 10,
    cooldown: 999,
    when: { age: [24, 55], lacks: ['exHandled'] },
    choices: [
      {
        text: 'Reply. Just to see.',
        tag: 'risky',
        highRisk: true,
        time: 2,
        outcomes: [
          {
            title: 'YOU REPLIED',
            body: `It is a perfectly innocent reply. It leads to a perfectly innocent coffee, which leads to a two-hour conversation, which leads to a taxi, which leads to a thing that is considerably harder to explain than a coffee.`,
            tone: 'chaos',
            fx: {
              happiness: 10,
              stress: 18,
              karma: -6,
              flag: { exHandled: 1, exTriangle: 1 },
              counter: { chaos: 1 },
            },
            delayed: [
              {
                inMonths: 2,
                chance: 0.6,
                title: 'SOMEBODY SAW YOU',
                body: `Not a person you know. A person who knows a person. The information travels the way information travels in this city: slowly, and then all at once, at a birthday dinner.`,
                tone: 'bad',
                art: 'romance_caught',
                fx: { relationships: -18, npc: { partner: -24 }, stress: 24, happiness: -14 },
              },
            ],
          },
        ],
      },
      {
        text: 'Do not reply. Delete it.',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU DELETED IT',
            body: `You delete the message and then you delete the contact, and then you sit for twenty minutes with the particular feeling of having been disciplined about something that nobody will ever know about.

You will think about it again in about four years, briefly, and feel nothing much.`,
            tone: 'good',
            fx: { happiness: 6, stress: -6, karma: 8, flag: { exHandled: 1 }, counter: { integrity: 1 } },
          },
        ],
      },
      {
        text: 'Reply, and tell your partner you did',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU SAID IT OUT LOUD FIRST',
            body: `"My ex messaged me. I'm going to reply and say I hope they're well, and then I'm not going to reply again."

The conversation that follows takes forty minutes and is not entirely comfortable and is probably the most honest one you have had this year.`,
            tone: 'good',
            fx: { relationships: 12, npc: { partner: 18 }, happiness: 8, stress: 4, flag: { exHandled: 1 } },
          },
        ],
      },
    ],
  },

  {
    id: 'romance_kids_question',
    title: 'THE CONVERSATION ABOUT CHILDREN',
    body: `You are both thirty-something and the question has moved from theoretical to practical without either of you noticing the transition.

"Do you actually want this?" they ask. "Not for me. Not for your mum. Do you want it?"`,
    art: 'family_kids',
    cat: 'romance',
    weight: 14,
    cooldown: 999,
    priority: 2,
    when: { partner: ['married', 'engaged'], age: [27, 45], children: [0, 0] },
    choices: [
      {
        text: 'Yes. Properly yes.',
        tag: 'bold',
        time: 6,
        outcomes: [
          {
            title: 'YOU SAID YES',
            body: `It takes eighteen months and a genuinely difficult conversation with a doctor and one silent car journey home, and then it happens.

You are woken at 03:40 by a sound that reorganises your entire personality. You are so tired that you have started saying "at this moment in time" unironically. You would do it again.`,
            tone: 'good',
            fx: {
              child: 1,
              happiness: 22,
              stress: 26,
              health: -8,
              expense: 950,
              energy: -20,
              relationships: 14,
              milestone: 'Became a parent',
              log: 'Had a child',
              flag: { hasKids: 1 },
            },
            delayed: [
              {
                inMonths: 22,
                chance: 0.6,
                title: 'THE COST BECOMES REAL',
                body: `Childcare is more than your rent was when you were twenty-five, and there is a spreadsheet open on the kitchen table that neither of you wants to look at on a weekday.`,
                tone: 'mixed',
                fx: { stress: 14, money: -3800, expense: 220 },
              },
            ],
          },
        ],
      },
      {
        text: 'No. You have to be honest.',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU SAID NO',
            body: `The conversation takes three days and is the hardest thing you have done. They do not want to leave you. They do not want to give it up either.

You do not resolve it tonight. You resolve it over four months, in pieces, in restaurants and on walks, and eventually one of you makes a decision that the other one has to live inside.`,
            tone: 'mixed',
            fx: { happiness: -12, stress: 22, relationships: -8, npc: { partner: -14 }, flag: { noKidsChoice: 1 } },
            delayed: [
              {
                inMonths: 26,
                chance: 0.5,
                title: 'IT CAME BACK',
                body: `Not as an argument. As a feeling they mention, once, on a holiday, looking at somebody else's child, and then never again.`,
                tone: 'mixed',
                fx: { relationships: -10, happiness: -10, stress: 12 },
              },
            ],
          },
        ],
      },
      {
        text: '"I don\'t know, and I need to be allowed not to know."',
        tag: 'smart',
        time: 2,
        outcomes: [
          {
            title: 'YOU SAID THE HONEST, USELESS THING',
            body: `It is the truthful answer and it is not the answer they wanted, and it buys you time rather than resolution.

They say "okay" and you both go to bed at 22:30, and nothing has been decided, which is itself a decision with a clock on it.`,
            tone: 'mixed',
            fx: { stress: 12, npc: { partner: 4 }, happiness: -4 },
          },
        ],
      },
    ],
  },

  {
    id: 'romance_long_distance',
    title: 'THEY HAVE BEEN OFFERED A JOB IN ANOTHER CITY',
    body: `It is a good role. Genuinely good — the kind that does not come around twice. It is fourteen hundred miles away.

"You'd hate it there," they say, in the voice of somebody who has rehearsed asking you not to move.`,
    art: 'romance_distance',
    cat: 'romance',
    weight: 12,
    cooldown: 999,
    when: { partner: ['dating', 'engaged', 'married'], age: [23, 58] },
    choices: [
      {
        text: 'Go with them. Quit your job.',
        tag: 'bold',
        time: 3,
        outcomes: [
          {
            title: 'YOU MOVED',
            body: `You resign, you pack a flat in eleven boxes, and you land in a city where you know one person and none of the good sandwich places.

For four months you are unemployed and slightly unmoored. For eleven months you are homesick in a way you do not fully admit. And they are happier than you have ever seen them.`,
            tone: 'mixed',
            fx: {
              career: -16,
              happiness: 10,
              stress: 20,
              relationships: 16,
              npc: { partner: 24 },
              flag: { movedForLove: 1 },
              setCareer: null,
              log: 'Moved cities for a partner',
              counter: { sacrifices: 1 },
            },
            delayed: [
              {
                inMonths: 12,
                chance: 0.6,
                title: 'YOU REBUILT IT',
                body: `A role. A café. Two people you would now call friends. The city stops being a place you moved to and becomes a place you live.`,
                tone: 'good',
                fx: { career: 12, happiness: 14, money: 2000, setCareer: { path: 'marketing', level: 1 } },
              },
              {
                inMonths: 18,
                chance: 0.25,
                title: 'YOU STARTED RESENTING IT',
                body: `It does not appear as a fight. It appears as a tone you use when they mention a work trip, and both of you hear it, and neither of you says the word.`,
                tone: 'bad',
                fx: { happiness: -14, stress: 18, relationships: -10, npc: { partner: -10 } },
              },
            ],
          },
        ],
      },
      {
        text: 'Ask them to stay',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU ASKED THEM TO STAY',
            body: `You do it honestly and without an ultimatum, and they take a week to think, and they stay.

They are fine. Mostly. But the role goes to somebody who is now in a photograph at a conference, and occasionally you catch them looking at something on their phone for slightly too long.`,
            tone: 'mixed',
            fx: { npc: { partner: 10 }, happiness: 4, stress: 12, flag: { askedThemToStay: 1 } },
            delayed: [
              {
                inMonths: 14,
                chance: 0.4,
                title: 'IT CAME UP',
                body: `"I'm not saying I regret it. I'm saying I think about it." Which is a sentence that lives in a house with both of you now.`,
                tone: 'bad',
                fx: { relationships: -12, happiness: -10, stress: 14, npc: { partner: -8 } },
              },
            ],
          },
        ],
      },
      {
        text: 'Try long distance',
        tag: 'risky',
        highRisk: true,
        time: 6,
        outcomes: [
          {
            title: 'FOURTEEN HUNDRED MILES AND A LOT OF VIDEO CALLS',
            body: `It works for five months and then it becomes a series of scheduled conversations about logistics, and then it becomes a series of cancelled calls, and then it becomes a decision neither of you wants to make first.

The flights cost a fortune and the airport is a genuinely terrible place to be sad.`,
            tone: 'mixed',
            fx: { money: -4200, stress: 24, happiness: -6, relationships: -6, flag: { longDistance: 1 } },
            delayed: [
              { inMonths: 9, chance: 0.45, title: 'IT SURVIVED', body: `You find a rhythm. It is not the same relationship; it is a different, more deliberate one, and it works in a way that surprises both of you.`, tone: 'good', fx: { relationships: 14, npc: { partner: 20 }, happiness: 12, stress: -10 } },
              { inMonths: 9, chance: 0.55, title: 'IT DID NOT', body: `The end is not dramatic. It is a call at 21:00 on a Sunday in which both of you are very kind to each other and both of you know.`, tone: 'bad', fx: { setPartner: { npcId: null, status: 'single' }, happiness: -22, stress: 20, counter: { breakups: 1 }, relationships: -10 } },
            ],
          },
        ],
      },
      {
        text: 'Break up. Cleanly. Now.',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU ENDED IT BEFORE IT COULD BREAK',
            body: `You do it in one conversation, which is genuinely the kindest available option, and it is still the worst evening of the year.

"They're going to go," you say, "and I'm not, and I'd rather do this now than in six months when we hate each other."`,
            tone: 'mixed',
            fx: {
              happiness: -16,
              stress: 20,
              relationships: -10,
              setPartner: { npcId: null, status: 'single' },
              counter: { breakups: 1 },
              flag: { cleanBreakup: 1 },
            },
          },
        ],
      },
    ],
  },

  {
    id: 'romance_infertility_arc',
    title: 'IT HAS BEEN A YEAR OF TRYING',
    body: `The appointments have a waiting room with very specific magazines. The conversations have a vocabulary now. There is a calendar, and the calendar has a purpose, and the purpose has started to make everything else feel like a delay.

The doctor says "there are options" in the way that means "there are costs."`,
    art: 'health_clinic',
    cat: 'romance',
    weight: 11,
    cooldown: 999,
    when: { partner: ['married', 'engaged', 'dating'], age: [28, 44], children: [0, 0], flags: { tryingForKids: [1, null] } },
    choices: [
      {
        text: 'Pursue treatment. Whatever it costs.',
        tag: 'bold',
        time: 8,
        outcomes: [
          {
            title: 'TWO YEARS, A LOT OF MONEY, AND A HOSPITAL CAR PARK',
            body: `Three rounds. The hormones make them a person you have to learn again. You become extremely good at reading a waiting room.

Round two fails on a Thursday. Round three is on a Tuesday in April.`,
            tone: 'mixed',
            fx: { money: -18000, stress: 30, health: -10, relationships: 12, npc: { partner: 16 }, flag: { fertilityTreatment: 1 } },
            delayed: [
              {
                inMonths: 10,
                chance: 0.5,
                title: 'IT WORKED',
                body: `A phone call at 14:20 from a nurse who reads from a screen and then, hearing your voice, stops reading from the screen.`,
                tone: 'good',
                art: 'family_kids',
                fx: { child: 1, happiness: 26, stress: -10, expense: 950, relationships: 12, milestone: 'Became a parent', flag: { hasKids: 1 } },
              },
              {
                inMonths: 10,
                chance: 0.5,
                title: 'IT DID NOT WORK',
                body: `The third round fails and nobody says anything in the car, and then they say "I think I'm done" and you say "okay," and you sit in a car park for forty minutes holding hands.`,
                tone: 'bad',
                fx: { happiness: -20, relationships: 16, stress: 18, npc: { partner: 10 }, flag: { fertilityFailed: 1 } },
              },
            ],
          },
        ],
      },
      {
        text: 'Stop. Choose each other instead.',
        tag: 'kind',
        time: 2,
        outcomes: [
          {
            title: 'YOU STOPPED',
            body: `You say the sentence out loud in a restaurant: "I want you more than I want this." And they cry in public, which they have never done.

The grief does not go away. It just becomes the kind of grief that lives in the house quietly and gets smaller.`,
            tone: 'mixed',
            fx: { happiness: -8, relationships: 20, stress: -6, npc: { partner: 20 }, money: -2000, flag: { choseEachOther: 1 } },
            delayed: [
              {
                inMonths: 20,
                chance: 0.4,
                title: 'SOMETHING ELSE BECAME POSSIBLE',
                body: `An adoption process that starts with a class in a community centre on Tuesdays, and a social worker who is genuinely on your side.`,
                tone: 'good',
                fx: { child: 1, happiness: 22, stress: 14, expense: 700, relationships: 14, money: -9000, milestone: 'Became a parent' },
              },
              {
                inMonths: 20,
                chance: 0.6,
                title: 'YOU BUILT A DIFFERENT LIFE',
                body: `Two people, a dog nobody planned, a house that is genuinely quiet, and a habit of taking the long holiday in February. It is not the life either of you had pictured. It is a very good life.`,
                tone: 'good',
                fx: { happiness: 16, stress: -14, relationships: 14, money: 6000, flag: { quietLife: 1 } },
              },
            ],
          },
        ],
      },
      {
        text: 'Separate for a while to think',
        tag: 'risky',
        highRisk: true,
        time: 4,
        outcomes: [
          {
            title: 'SIX WEEKS APART',
            body: `You go to {friend}'s spare room. You both talk to somebody professional. You both cry at the same time on separate Wednesdays.

At the end of it you have either the same marriage or a completely different one, and it is not yet clear which.`,
            tone: 'mixed',
            fx: { stress: 26, happiness: -14, relationships: 4, npc: { partner: 6, jess: 10 }, flag: { separated: 1 } },
            delayed: [
              { inMonths: 7, chance: 0.55, title: 'YOU CAME BACK BETTER', body: `Not fixed — different. Therapy, an actual schedule, and a rule about not discussing it after 21:00.`, tone: 'good', fx: { relationships: 16, happiness: 12, stress: -12, npc: { partner: 14 } } },
              { inMonths: 7, chance: 0.45, title: 'YOU CAME BACK WORSE', body: `You come back to the same house and the same unreconciled thing, and now you both know that distance did not fix it either.`, tone: 'bad', fx: { relationships: -16, happiness: -18, stress: 20, setPartner: { npcId: null, status: 'divorced' }, counter: { breakups: 1 } } },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'romance_breakup_decision',
    title: 'YOU HAVE BEEN CHECKING THEIR LOCATION',
    body: `Not obsessively. Just — occasionally, at night, in a way that you would not describe to anyone.

You are unhappy. You have been unhappy for a while, in a low-grade way, in a way you keep describing to yourself as a phase.`,
    art: 'romance_unhappy',
    cat: 'romance',
    weight: 12,
    cooldown: 60,
    when: { partner: ['dating', 'engaged', 'married'], stats: { happiness: [0, 48] }, npc: { partner: [-100, 55] } },
    choices: [
      {
        text: 'End it. Say the real reason.',
        tag: 'bold',
        time: 2,
        outcomes: [
          {
            title: 'YOU ENDED IT PROPERLY',
            body: `You do it in person, you say the true thing, which is not flattering to either of you, and you do not try to make it their fault or yours.

They are angry, then sad, then — eventually, months later — civil. You are single and you do not know who you are yet, which is terrifying and useful.`,
            tone: 'mixed',
            fx: {
              happiness: -14,
              stress: 18,
              relationships: -8,
              npc: { partner: -14 },
              setPartner: { npcId: null, status: 'single' },
              counter: { breakups: 1 },
              flag: { endedIt: 1 },
            },
            delayed: [
              {
                inMonths: 8,
                chance: 0.6,
                title: 'YOU BECAME A DIFFERENT PERSON',
                body: `Six months of nobody to be accountable to, a hobby you would never have taken up, and a genuine, surprising fondness for your own company.`,
                tone: 'good',
                fx: { happiness: 16, stress: -14, health: 8, flag: { foundSelf: 1 } },
              },
            ],
          },
        ],
      },
      {
        text: 'Suggest couples counselling',
        tag: 'smart',
        time: 2,
        outcomes: [
          {
            title: 'YOU BOOKED THE SESSIONS',
            body: `Ninety minutes, a beige room, and a woman who says "let's start with this week" and then does not let either of you get away with anything.

It is expensive and uncomfortable and the two of you talk to each other honestly for the first time in eighteen months.`,
            tone: 'good',
            fx: { money: -1600, stress: 8, relationships: 14, happiness: 8, npc: { partner: 14 }, flag: { therapy: 1 } },
            delayed: [
              { inMonths: 12, chance: 0.55, title: 'IT ACTUALLY HELPED', body: `Not a miracle. A set of tools, and the habit of using them, and the sense that you chose this rather than drifted into it.`, tone: 'good', fx: { relationships: 16, happiness: 14, stress: -14, npc: { partner: 12 } } },
              { inMonths: 12, chance: 0.45, title: 'IT CLARIFIED THE END', body: `Six months of sessions and the eventual conclusion, reached together, that this should finish. It is the most amicable ending you have ever had.`, tone: 'mixed', fx: { happiness: -8, stress: 8, setPartner: { npcId: null, status: 'divorced' }, counter: { breakups: 1 }, relationships: -4 } },
            ],
          },
        ],
      },
      {
        text: 'Stay, and start an affair',
        tag: 'chaotic',
        highRisk: true,
        time: 2,
        outcomes: [
          {
            title: 'YOU DID THE THING',
            body: `Three weeks of genuine exhilaration and one specific, permanent change in your understanding of yourself, which is that you are a person who will do this.

Nobody knows. The interesting part is how quickly "nobody knows" becomes "I am the only person who knows."`,
            tone: 'chaos',
            fx: { happiness: 6, stress: 30, karma: -18, relationships: -12, counter: { chaos: 1 }, flag: { affair: 1 } },
            delayed: [
              {
                inMonths: 6,
                chance: 0.65,
                title: 'IT CAME OUT',
                body: `It always comes out. Not through a dramatic discovery — through a phone left unlocked, or a message at the wrong moment, or somebody who saw you.`,
                tone: 'bad',
                art: 'romance_caught',
                fx: { setPartner: { npcId: null, status: 'divorced' }, happiness: -26, stress: 34, relationships: -20, reputation: -14, counter: { breakups: 1 } },
              },
            ],
          },
        ],
      },
      {
        text: 'Stay. Accept it. This is fine.',
        tag: 'lazy',
        time: 3,
        outcomes: [
          {
            title: 'YOU STAYED AND STOPPED MENTIONING IT',
            body: `You work out, quietly, how to be content-ish. Separate interests, separate friends, a physical affection that is warm and not electric.

It is not unhappy. It is a life with the volume turned down, and you chose it, and there is a version of that which is fine.`,
            tone: 'neutral',
            fx: { happiness: -6, stress: 8, relationships: 4, flag: { settled: 1 } },
          },
        ],
      },
    ],
  },
];
