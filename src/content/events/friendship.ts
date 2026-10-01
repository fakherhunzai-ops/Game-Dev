import type { GameEvent } from '../../engine/types';

/**
 * FRIENDSHIP
 *
 * Friendships in this game are mostly about the specific moment one person
 * needs something and the other one has to decide how much they care.
 * Chad exists to test the limits of loyalty.
 */
export const friendshipEvents: GameEvent[] = [
  {
    id: 'friend_hotdog_startup',
    title: 'YOUR FRIEND HAS A BUSINESS IDEA',
    body: `{chaos} has been talking for eleven minutes without a full stop. You have caught "delivery", "hot dogs" and "the Uber of" and are now well behind.

He needs $8,000. He has a deck. The deck is nine slides and four of them are photographs of hot dogs.`,
    quote: '"Trust me. This is going to be huge."',
    speaker: 'chad',
    art: 'friends_hotdog',
    cat: 'friendship',
    weight: 16,
    cooldown: 999,
    priority: 2,
    when: { age: [22, 42], npc: { chad: [20, 100] } },
    choices: [
      {
        text: 'Invest the full $8,000',
        hint: 'All in on the hot dogs',
        tag: 'risky',
        highRisk: true,
        time: 1,
        requires: { minCash: 8000 },
        outcomes: [
          {
            title: 'YOU ARE NOW A HOT DOG INVESTOR',
            body: `You transfer it on a Sunday. He sends a voice note that is ninety seconds of pure joy and then a text that says "you will not regret this" which is, historically, the least reliable sentence in the language.

You both spend a month referring to it as "the company."`,
            tone: 'mixed',
            fx: {
              money: -8000,
              npc: { chad: 24 },
              happiness: 8,
              stress: 8,
              flag: { investedChad: 1 },
              log: 'Backed a hot-dog delivery startup',
            },
            delayed: [
              { inMonths: 9, chance: 0.35, title: 'IT ACTUALLY WORKED', body: `Three vans. A real logo. A partnership with a football club and a genuinely decent product. He pays you out and then asks if you want to stay in, and the number he says makes you put the phone down on the table.`, tone: 'good', art: 'business_success', fx: { money: 34000, happiness: 18, npc: { chad: 20 }, counter: { bigWins: 1 } } },
              { inMonths: 9, chance: 0.3, title: 'IT DID NOT WORK, AND HE KNEW', body: `The vans were leased. The football club partnership was a photograph. There is no money and he has stopped answering, and then answered once, at 2am, with a message that was mostly an apology.`, tone: 'bad', art: 'business_fail', fx: { money: -8000, stress: 18, happiness: -12, npc: { chad: -18 }, flag: { chadDebt: 1 } } },
              { inMonths: 9, chance: 0.35, title: 'IT RAN OUT OF MONEY SLOWLY', body: `There was revenue, briefly. Then there was a van repair, then a health inspection, then a hot dog supplier who wanted paying up front. It did not fail so much as dissolve.`, tone: 'mixed', fx: { money: -8000, stress: 10, npc: { chad: 6 }, flag: { chadWoundDown: 1 } } },
            ],
          },
        ],
      },
      {
        text: 'Invest $1,000',
        hint: 'Supportive. Bounded.',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'A THOUSAND DOLLARS OF ENCOURAGEMENT',
            body: `You call it "a small bet on a friend," which is more or less what it is. He takes it happily and texts you eleven times in the first week, then twice in the second, then not at all.

You lose the $1,000 and keep the friendship and privately consider that a good trade.`,
            tone: 'neutral',
            fx: { money: -1000, npc: { chad: 12 }, happiness: 3 },
          },
        ],
      },
      {
        text: 'Say no',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU SAID NO',
            body: `You explain it well. You are generous about it. You say "it's not the idea, mate, it's my situation" and he nods and says "no, yeah, totally" seven times.

He is fine with it. He is not fine with it. He will be fine with it in about four years.`,
            tone: 'mixed',
            fx: { npc: { chad: -12 }, stress: 2, happiness: -3, reputation: 2 },
          },
        ],
      },
      {
        text: 'Start a competing hot-dog company',
        hint: 'The most dangerous option available',
        tag: 'chaotic',
        highRisk: true,
        time: 2,
        requires: { minCash: 20000 },
        outcomes: [
          {
            title: 'YOU STARTED A COMPETING HOT-DOG COMPANY',
            body: `You do not tell him. You register a name, you order a van, and you spend a fortnight feeling like a genuinely terrible person with an excellent business plan.

He finds out in month three, from a shared acquaintance, at a barbecue, in front of six people.`,
            tone: 'chaos',
            fx: {
              money: -18000,
              npc: { chad: -40 },
              reputation: -10,
              stress: 20,
              flag: { betrayedChad: 1, hotDogWar: 1 },
              counter: { chaos: 1 },
              biz: { launch: 'food_truck' },
              remember: { chad: 'You started a competing company while he was pitching you. He has not forgotten a single detail.' },
            },
            delayed: [
              { inMonths: 8, chance: 0.5, title: 'THE STREET FIGHT', body: `There is a pitch outside a venue that takes exactly one van. Both of you applied for the permit. Only one of you got it, and the reason given was "pre-existing complaint" which is not a thing you filed.`, tone: 'chaos', fx: { stress: 18, npc: { chad: -15 }, money: 2000 } },
              { inMonths: 20, chance: 0.3, title: 'HE SOLD HIS TO THE PEOPLE YOU PITCHED TO', body: `The people you spent four months courting have bought him out and gone into business with him, and the announcement email is very warm and goes to a mailing list you gave them.`, tone: 'bad', fx: { career: -8, happiness: -12, npc: { chad: -6 }, money: -3000 } },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'friend_borrow_ten_k',
    title: 'HE NEEDS TEN THOUSAND DOLLARS',
    body: `{friend} is sitting on your sofa not drinking the tea you made, which is how you know.

His business has a cash-flow problem. Not a death problem, he says. A timing problem. He has never asked you for anything, in eleven years, except help moving a wardrobe in 2019.`,
    art: 'friends_sofa_money',
    cat: 'friendship',
    weight: 12,
    cooldown: 999,
    priority: 1,
    when: { age: [25, 55], npc: { jess: [30, 100] }, minCash: 6000 },
    choices: [
      {
        text: 'Lend him $10,000 with a repayment plan',
        tag: 'bold',
        time: 1,
        requires: { minCash: 10000 },
        fx: { money: -10000 },
        outcomes: [
          {
            title: 'YOU WROTE IT DOWN ON PAPER',
            body: `He signs it with a pen you had to go and find and he makes a small joke about lawyers, and you both laugh, and neither of you is convinced.

He pays the first instalment three weeks early. Then the second one is four days late and neither of you mentions it.`,
            tone: 'mixed',
            fx: {
              npc: { jess: 18 },
              stress: 8,
              flag: { loanedJess: 1 },
              remember: { jess: 'You lent her the money and made her sign something. She understood why and it still stung.' },
            },
            delayed: [
              { inMonths: 11, chance: 0.45, title: 'THE REPAYMENT STOPS WITHOUT EXPLANATION', body: `Three instalments in, then nothing, then a text that says "I'll sort it" which arrives a week after the date it was supposed to have been sorted by.`, tone: 'bad', fx: { stress: 16, npc: { jess: -8 }, happiness: -8, flag: { jessOwes: 1 } } },
              { inMonths: 14, chance: 0.4, title: 'SHE PAID EVERY PENNY, EARLY', body: `The full balance, in one transfer, four months ahead of schedule, with a message that is so sincere it is almost unreadable. "I have never been able to owe anyone anything. You did not make me feel small."`, tone: 'good', fx: { money: 10000, happiness: 16, npc: { jess: 22 }, relationships: 8 } },
            ],
          },
        ],
      },
      {
        text: 'Gift it. Do not expect it back.',
        tag: 'kind',
        time: 1,
        requires: { minCash: 10000 },
        fx: { money: -10000 },
        outcomes: [
          {
            title: 'YOU GAVE HER TEN THOUSAND DOLLARS',
            body: `You say "it's a gift, I don't want it back, and if you argue with me I'll be annoyed."

She cries. Not in a big way — three tears, wiped fast, and then a very long silence, and then "okay." You have changed the shape of the friendship permanently and it is not yet clear in which direction.`,
            tone: 'good',
            fx: {
              happiness: 16,
              stress: -4,
              npc: { jess: 34 },
              relationships: 10,
              flag: { giftedJess: 1 },
              counter: { generosity: 1 },
              remember: { jess: 'You gave her ten thousand dollars and refused to call it a loan.' },
            },
            delayed: [
              {
                inMonths: 20,
                chance: 0.6,
                title: 'SHE NAMED A THING AFTER YOU',
                body: `The business does well. There is a product, and the product has a name, and the name is yours. She tells you about it in a car park, casually, watching your face.`,
                tone: 'good',
                fx: { happiness: 20, reputation: 8, npc: { jess: 20 }, relationships: 12 },
              },
              {
                inMonths: 8,
                chance: 0.3,
                title: 'SHE STARTED AVOIDING YOU',
                body: `Not dramatically. Just slower replies, and a cancelled dinner, and a reluctance to be in a room where the money exists. Being given ten thousand dollars by your best friend turns out to be a complicated thing to hold.`,
                tone: 'bad',
                fx: { npc: { jess: -10 }, happiness: -10, relationships: -6, stress: 10 },
              },
            ],
          },
        ],
      },
      {
        text: 'Refuse',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU SAID NO AND IT WAS AWKWARD',
            body: `You explain. He listens. He says "no, you're right, absolutely, forget it" and drinks the tea he did not want, and leaves twenty minutes later than the conversation ended.

He does not ask again, ever, about anything.`,
            tone: 'bad',
            fx: {
              npc: { jess: -24 },
              happiness: -10,
              stress: 12,
              flag: { refusedJess: 1 },
              remember: { jess: 'She asked you for ten thousand dollars and you said no.' },
            },
            delayed: [
              {
                inMonths: 24,
                chance: 0.5,
                title: 'SHE FIGURED IT OUT WITHOUT YOU',
                body: `You hear about it third-hand: she sold a stake to somebody awful, kept the business, and lost something in the process. "She's doing really well," says the mutual friend, in the tone people use for that sentence.`,
                tone: 'mixed',
                fx: { happiness: -8, npc: { jess: -6 }, relationships: -4 },
              },
            ],
          },
        ],
      },
      {
        text: 'Invest in the business instead',
        hint: 'Money in, equity out',
        tag: 'bold',
        time: 1,
        requires: { minCash: 10000 },
        fx: { money: -10000 },
        outcomes: [
          {
            title: 'YOU ARE NOW A SHAREHOLDER',
            body: `A 9% stake and a conversation about "the board" which consists of the two of you at a kitchen table with a bottle of wine.

It is a completely different relationship now. You find out about things. You have opinions about her hiring.`,
            tone: 'mixed',
            fx: {
              npc: { jess: 14 },
              stress: 10,
              flag: { investedJess: 1 },
              log: 'Bought 9% of a friend\'s company',
            },
            delayed: [
              { inMonths: 18, chance: 0.45, title: 'THE COMPANY GREW AND SO DID THE PROBLEMS', body: `A bigger competitor makes an approach. She wants to sell. You want to hold. You are having meetings now, real ones, with an agenda.`, tone: 'mixed', fx: { money: 12000, stress: 18, npc: { jess: -6 }, relationships: -8 } },
              { inMonths: 22, chance: 0.4, title: 'IT WORKED AND YOU BOTH GOT PAID', body: `A buyout at a number neither of you had said out loud. Your 9% is worth more than a year of your salary and you take her out for a meal that costs more than the sofa.`, tone: 'good', fx: { money: 41000, happiness: 18, npc: { jess: 14 }, counter: { bigWins: 1 } } },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'friend_wedding_speech',
    title: 'YOU HAVE BEEN ASKED TO MAKE A SPEECH',
    body: `{friend} is getting married and has asked you to speak, which is an honour, and a nightmare, and a thing you agreed to five months ago and have not thought about since.

It is in nine days. Eighty people will be there. Her parents will be there. Her father has a very specific sense of humour.`,
    art: 'social_wedding',
    cat: 'friendship',
    weight: 11,
    cooldown: 999,
    when: { age: [24, 48], npc: { jess: [35, 100] } },
    choices: [
      {
        text: 'Prepare properly and rehearse it',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU REHEARSED IN THE CAR',
            body: `Four days of practice. Timed at four minutes ten. You cut the story about the tattoo because it is not your story to tell, and you keep the one about the job interview because it genuinely gets a laugh.

You stand up and your hands shake slightly and then you do it properly — you describe your friend accurately, which is rarer at weddings than people realise.`,
            tone: 'good',
            fx: { reputation: 12, happiness: 12, npc: { jess: 24 }, relationships: 8, stress: -6 },
          },
        ],
      },
      {
        text: 'Wing it. Be charming. It will be fine.',
        tag: 'risky',
        highRisk: true,
        time: 1,
        outcomes: [
          { weight: 4, variance: 1, title: 'IT WAS ABSOLUTELY FINE', body: `Two jokes land, one does not, and the one that does not is forgotten by the time the dessert arrives. You sit down and drink half a glass of something and think, for the first time in your life, that improvising is a strategy.`, tone: 'good', fx: { reputation: 6, happiness: 8, npc: { jess: 12 } } },
          {
            weight: 6,
            variance: 1,
            title: 'YOU TOLD THE WRONG STORY',
            body: `It was the one about the job interview. It was always going to be the one about the job interview. You get to the part about the manager and you hear your own voice getting slightly louder and you cannot stop.

Her mother's face does a thing. You finish, sit down, and the applause is warm and just long enough to be misleading.`,
            tone: 'bad',
            fx: { reputation: -14, happiness: -14, stress: 20, npc: { jess: -10 }, relationships: -6, counter: { fauxPa: 1 } },
          },
        ],
      },
      {
        text: 'Use the speech to confess something you have been holding',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'YOU SAID THE THING',
            body: `You had a plan and the plan did not include this, and then you are standing there with a microphone telling four generations of two families about the night you did not come when she called.

It is the most honest thing anyone has said in that room in years. The room does not know what to do with it. {friend} does.`,
            tone: 'chaos',
            fx: {
              happiness: 12,
              stress: 26,
              reputation: -8,
              npc: { jess: 30 },
              relationships: 12,
              counter: { chaos: 1 },
              remember: { jess: 'You apologised in your speech at her wedding, in front of everyone.' },
            },
          },
        ],
      },
      {
        text: 'Cancel. Say you cannot do it.',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU WITHDREW',
            body: `You give a reason and the reason is decent and she says "of course" in a way that means something different.

Somebody else does it. They do it badly. You watch, and feel relief, and then feel something else.`,
            tone: 'mixed',
            fx: { stress: -10, happiness: -8, npc: { jess: -12 } },
          },
        ],
      },
    ],
  },

  {
    id: 'friend_growing_apart',
    title: 'IT HAS BEEN EIGHTEEN MONTHS',
    body: `You scroll past a photograph and realise something has quietly happened: {friend2} has been in your phone's group chat for eighteen months and in your actual life for about four hours of it.

Nobody did anything wrong. That is what makes it difficult.`,
    art: 'friends_drift',
    cat: 'friendship',
    weight: 11,
    cooldown: 36,
    when: { age: [25, 60], npc: { marcus: [-20, 45] } },
    choices: [
      {
        text: 'Call him. Actually call.',
        tag: 'kind',
        time: 1,
        outcomes: [
          {
            title: 'YOU CALLED HIM',
            body: `The first two minutes are about logistics and the third minute is about his ex and the fourth minute is about a sandwich he had in 2016 and by minute twenty you are both doing the thing where you are being yourself.

It takes ninety minutes. You have not laughed like that since the last time you did this.`,
            tone: 'good',
            fx: { happiness: 14, stress: -10, npc: { marcus: 20 }, relationships: 8, flag: { reconnectedMarcus: 1 } },
            delayed: [
              {
                inMonths: 10,
                chance: 0.5,
                title: 'HE HELD ON TO IT',
                body: `When things get genuinely bad for you — and they do — he is the one who turns up without being asked, with a bag of things from a shop, and stays for four hours.`,
                tone: 'good',
                fx: { happiness: 12, stress: -14, npc: { marcus: 16 } },
              },
            ],
          },
        ],
      },
      {
        text: 'Send a message that says "we should catch up soon"',
        tag: 'lazy',
        time: 1,
        outcomes: [
          {
            title: '"WE SHOULD CATCH UP SOON"',
            body: `He replies "yes! definitely!" with two exclamation marks, and you both mean it, and it does not happen.

Six weeks later one of you sends the same message again and the loop closes on itself like a very slow door.`,
            tone: 'neutral',
            fx: { happiness: -3, npc: { marcus: 2 }, relationships: -2 },
          },
        ],
      },
      {
        text: 'Let it go. People grow.',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU LET IT GO',
            body: `It is a reasonable philosophy and it is also a decision, and you make it in a hallway in about four seconds.

He notices the silence eventually and stops being the one who tries.`,
            tone: 'bad',
            fx: { npc: { marcus: -18 }, happiness: -8, relationships: -6, flag: { driftedMarcus: 1 } },
          },
        ],
      },
    ],
  },

  {
    id: 'friend_roommate_offer',
    title: 'A ROOMMATE SITUATION, POTENTIALLY',
    body: `Rent has gone up in every building in the city, including yours, including the one you are currently sitting in doing arithmetic about.

{friend2} needs a place. You have a spare room, or a space where a spare room could theoretically be. He is tidy. He is quiet. He once lived with you for five weeks in 2019 and it went fine, mostly, apart from the thing with the pans.`,
    art: 'housing_roommate',
    cat: 'housing',
    weight: 12,
    cooldown: 60,
    when: {
      age: [21, 34],
      homeTier: ['shared_apartment', 'studio', 'one_bed', 'rental_house'],
      stats: { stress: [0, 75] },
      lacks: ['hasRoommate'],
    },
    choices: [
      {
        text: 'Move him in. Split everything.',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU HAVE A ROOMMATE',
            body: `The first month is genuinely great. The second month is good. In the third month you discover that his definition of "cleaning the kitchen" and yours differ at a conceptual level.

The money side is real and immediate: your housing costs drop by nearly half and your savings go up for the first time in two years.`,
            tone: 'good',
            fx: { expense: -420, happiness: 4, stress: 6, npc: { marcus: 14 }, flag: { hasRoommate: 1 } },
            delayed: [
              {
                inMonths: 9,
                chance: 0.45,
                title: 'THE PANS CAME BACK AROUND',
                body: `A disagreement about a saucepan that has been building for four months reaches a head at 11pm on a Wednesday and involves the phrase "I literally always do it."`,
                tone: 'mixed',
                fx: { stress: 12, npc: { marcus: -12 }, happiness: -6 },
              },
              {
                inMonths: 16,
                chance: 0.4,
                title: 'IT TURNED INTO A FRIENDSHIP WITH BINS',
                body: `You have a system now. A rota. A shared spreadsheet. You live with one of your best friends and it is unglamorous and genuinely good.`,
                tone: 'good',
                fx: { happiness: 10, npc: { marcus: 14 }, stress: -8 },
              },
            ],
          },
        ],
      },
      {
        text: 'Say no. You like your space.',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU KEPT THE SPARE ROOM',
            body: `You explain it honestly: you need the space, you have done the living-with-friends thing, you are not doing it again.

He finds somewhere twelve minutes further out. You stay friends. You pay $420 more a month for the privilege of being alone with your thoughts, which are, on balance, fine thoughts.`,
            tone: 'neutral',
            fx: { stress: -6, happiness: 2, npc: { marcus: -4 } },
          },
        ],
      },
      {
        text: 'Move in with him instead and sublet your place',
        hint: 'Aggressively financial',
        tag: 'bold',
        highRisk: true,
        time: 2,
        outcomes: [
          {
            title: 'YOU INVERTED THE SITUATION',
            body: `His place is bigger and cheaper and you sublet yours to a couple who seem nice, which is what everyone says about every subtenant.

You are making $300 a month on the spread. It is the first actual money you have ever made from a decision, as opposed to a job.`,
            tone: 'good',
            fx: { income: 300, expense: -200, happiness: 4, npc: { marcus: 10 }, flag: { subletting: 1 }, counter: { landlordEmbryo: 1 } },
            delayed: [
              {
                inMonths: 7,
                chance: 0.45,
                title: 'THE COUPLE HAVE CONCERNS',
                body: `There is a leak. There is, apparently, a leak that existed before them. There is now a conversation about who is responsible, and you are the landlord in this conversation, whether or not you have accepted it.`,
                tone: 'bad',
                fx: { money: -1800, stress: 16, npc: { marcus: -6 } },
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'friend_the_group_chat',
    title: 'THE GROUP CHAT HAS TURNED ON SOMEONE',
    body: `There are 240 unread messages and the tone has changed from jokes to something else. The subject is a person who was, until recently, in the chat.

Somebody is posting screenshots. Somebody else is posting a paragraph that begins "look, I'm just saying." You have known all of these people for a decade.`,
    art: 'friends_groupchat',
    cat: 'friendship',
    weight: 10,
    cooldown: 60,
    when: { age: [24, 55] },
    choices: [
      {
        text: 'Defend the person publicly in the chat',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU SAID SOMETHING',
            body: `You type it out three times and send the fourth. It is four sentences, it is not aggressive, and it ends the conversation in about ninety seconds.

Two people react with a thumbs-up. Three people do not react at all. The chat is quiet for four days and then resumes as though nothing happened, which is worse.`,
            tone: 'mixed',
            fx: { reputation: 8, happiness: 6, stress: 12, counter: { integrity: 1 } },
            delayed: [
              {
                inMonths: 8,
                chance: 0.5,
                title: 'YOU WERE QUIETLY MOVED',
                body: `A second chat exists. You find out about it in a way that is unmistakable: a plan, agreed, in a thread you are not in.`,
                tone: 'bad',
                fx: { relationships: -10, happiness: -12, stress: 12 },
              },
            ],
          },
        ],
      },
      {
        text: 'Message the person privately',
        tag: 'kind',
        time: 1,
        outcomes: [
          {
            title: 'YOU SENT A PRIVATE MESSAGE',
            body: `"Hey. I've seen the chat. I think that's out of order." It takes fourteen minutes to write.

He replies with a paragraph that starts "I don't even know what I did" and you do not have an answer for him, because nobody in the chat did either.`,
            tone: 'good',
            fx: { happiness: 8, karma: 8, reputation: 4, flag: { privateDecency: 1 } },
          },
        ],
      },
      {
        text: 'Add the screenshot of a screenshot',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'YOU FED THE FIRE. WITH FIRE.',
            body: `It is funny. It is genuinely, wildly funny, and eleven people react to it inside four minutes.

The person the chat is about gets sent the whole thread by somebody. Which means the whole thread, including the part you made worse.`,
            tone: 'chaos',
            fx: { reputation: -10, happiness: 4, counter: { chaos: 1 }, flag: { chatEscalation: 1 } },
            delayed: [
              {
                inMonths: 5,
                chance: 0.55,
                title: 'IT CAME BACK AROUND TO YOU',
                body: `There is a version of the story now where you are the villain, and it is a version being told by people you have not personally wronged, which is how these things always travel.`,
                tone: 'bad',
                fx: { reputation: -14, relationships: -10, stress: 16, npc: { jess: -6 } },
              },
            ],
          },
        ],
      },
      {
        text: 'Set the chat to silent and never open it again',
        tag: 'lazy',
        time: 1,
        outcomes: [
          {
            title: 'YOU MUTED THE CHAT',
            body: `240 messages becomes 12 unread becomes a small number that sits there permanently, like a stack of post you have decided not to open.

You are still in the group. You are not in the group.`,
            tone: 'neutral',
            fx: { stress: -8, relationships: -4, happiness: -2 },
          },
        ],
      },
    ],
  },
];
