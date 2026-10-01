import type { GameEvent } from '../../engine/types';

/**
 * MONEY + HOUSING-ADJACENT SPENDING
 * The comedy of arithmetic performed by an optimist.
 */
export const moneyEvents: GameEvent[] = [
  {
    id: 'money_lottery_ticket',
    title: 'THE LINE AT THE CORNER SHOP',
    body: `The jackpot is at an absurd number. That number is on the window of the shop in the exact font used for all numbers that will never be yours.

The queue includes a man buying one ticket and a woman buying forty. You are standing behind both of them with no ticket and an opinion.`,
    art: 'money_lottery',
    cat: 'money',
    weight: 12,
    cooldown: 30,
    when: { age: [21, 80] },
    choices: [
      {
        text: 'Buy one ticket. Obviously.',
        hint: '$4',
        tag: 'risky',
        highRisk: true,
        time: 1,
        fx: { money: -4 },
        outcomes: [
          { weight: 12, variance: 1, title: 'NOTHING', body: 'You check the numbers on your phone at 11pm and get nothing. Not even a partial. Not even the number they give everybody.\n\nYou knew. That was never the point.', tone: 'neutral' },
          {
            weight: 2,
            variance: 1,
            title: 'YOU WON SOMETHING',
            body: `Two numbers and the bonus. The shop gives you $180 in cash and a photograph request that you decline with more dignity than the situation merits.

You tell four people. Every single one of them says "you should reinvest that," which is a genuinely insane thing to say about $180.`,
            tone: 'good',
            fx: { money: 180, happiness: 6, flag: { lotteryWon: 1 } },
          },
          {
            weight: 1,
            variance: 2,
            title: 'YOU WON A LOT. A SUSPICIOUS AMOUNT.',
            body: `You are standing in your kitchen at 22:14 reading a number that does not look real. You read it four more times. You sit down on the floor, which is where you remain for eleven minutes.

You do not tell anyone for three days. In those three days you make a plan on the back of an envelope and then you throw the envelope away.

People will tell you this money ruined your life. It did not. You were already like this.`,
            tone: 'good',
            fx: {
              money: 62000,
              happiness: 18,
              stress: 14,
              reputation: 6,
              flag: { lotteryBigWin: 1 },
              counter: { bigWins: 1 },
            },
            delayed: [
              {
                inMonths: 4,
                chance: 0.85,
                title: 'THE MONEY BECAME PUBLIC KNOWLEDGE',
                body: `You kept it quiet, you really did. But you paid off a car in cash in a small town and by August the word "lottery" was being used in your direction by people who had never previously asked you anything.`,
                tone: 'mixed',
                fx: { stress: 16, relationships: -6, flag: { knownRich: 1 } },
                queue: [{ id: 'chain_money_letters', inMonths: 2 }],
              },
            ],
          },
        ],
      },
      {
        text: 'Do not buy a ticket. Save the $4.',
        hint: 'The mathematically correct and emotionally empty option',
        tag: 'smart',
        time: 1,
        fx: { money: -0 },
        outcomes: [
          {
            title: 'YOU WALKED PAST',
            body: `You buy milk and leave. The $4 goes into your savings, where it joins an amount of money that will eventually buy you a very small amount of nothing.

Two days later you check the numbers out of curiosity, and your three numbers are there, and one of them is not. It is the correct outcome. You feel insane anyway.`,
            tone: 'neutral',
            fx: { happiness: -3, stress: 2, counter: { sensible: 1 } },
          },
        ],
      },
      {
        text: 'Buy forty tickets',
        hint: 'Burn $160 to increase your odds from nothing to nothing',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        requires: { minCash: 400 },
        outcomes: [
          {
            title: 'FORTY TICKETS',
            body: `The woman in front of you turns around and looks at you with genuine recognition. The shopkeeper raises his eyebrows in a way that will become a story he tells.

You win $20. The $140 loss is not the point. The point is that for four days you had something to look at.`,
            tone: 'chaos',
            fx: { money: -140, happiness: 4, stress: 6, counter: { chaos: 1 } },
          },
        ],
      },
    ],
  },

  {
    id: 'money_emergency_car',
    title: 'THE CAR HAS OPINIONS',
    body: `The noise started on the motorway and has now settled into a rhythm, which is worse, because rhythms imply commitment.

The garage says they can look at it Thursday. The provisional number, said out loud, was "$1,400, probably, maybe more."`,
    art: 'money_car',
    cat: 'money',
    weight: 14,
    cooldown: 24,
    when: { age: [21, 80], has: ['hasCar'] },
    choices: [
      {
        text: 'Pay for the full repair',
        hint: '$1,400',
        tag: 'smart',
        time: 1,
        requires: { minCash: 1400 },
        outcomes: [
          {
            title: 'FOURTEEN HUNDRED DOLLARS, GONE',
            body: `The garage calls twice: once to confirm the number and once to add $180 for a thing you cannot name and did not agree to.

The car runs beautifully. You feel about the car the way you feel about a friend who cost you £1,400 and is now being very nice.`,
            tone: 'mixed',
            fx: { money: -1400, stress: 8, happiness: -4, flag: { carFixed: 1 } },
          },
        ],
      },
      {
        text: 'Ignore it. Turn the radio up.',
        tag: 'risky',
        highRisk: true,
        time: 2,
        outcomes: [
          {
            title: 'THE RADIO IS NOW LOAD-BEARING',
            body: `You drive for six weeks with the volume at 14 and an internal monologue that says "it's fine, it's a car noise, cars make noises."

You become an expert in which road surfaces mask it best. This is not a skill anybody wants.`,
            tone: 'mixed',
            fx: { stress: 12, happiness: -4, flag: { carIgnored: 1 } },
            delayed: [
              {
                inMonths: 3,
                chance: 0.7,
                title: 'IT WAS NOT FINE',
                body: `It fails at a junction during rush hour with a noise like a dropped toolbox. You are fine. The car is not, and the recovery truck costs $260 before anybody has looked at anything.`,
                tone: 'bad',
                art: 'money_carbreak',
                fx: { money: -3400, stress: 24, happiness: -12, health: -4 },
              },
            ],
          },
        ],
      },
      {
        text: 'Sell it. Buy something cheaper and worse.',
        tag: 'bold',
        time: 2,
        outcomes: [
          {
            title: 'YOU SOLD IT TO A MAN NAMED DEAN',
            body: `Nine hundred dollars, cash, in a car park, no questions asked. He was extremely keen, which should have worried you more than it did.

The replacement cost $2,100 and has a smell. It is a reliable sort of smell. The car works.`,
            tone: 'mixed',
            fx: { money: 900, stress: 6, happiness: -6, flag: { cheaperCar: 1 } },
            delayed: [
              {
                inMonths: 8,
                chance: 0.35,
                title: 'DEAN HAS QUESTIONS',
                body: `A message: "hey mate, did you know about the thing with the..." followed by a photograph of something expensive and broken.`,
                tone: 'bad',
                fx: { stress: 14, reputation: -6, money: -600 },
              },
            ],
          },
        ],
      },
      {
        text: 'Fix it yourself using a video',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'YOU HAVE A WRENCH AND ACCESS TO THE INTERNET',
            body: `The video is seventeen minutes long and made by a man in Ohio who is far more confident than you are. You buy $60 of parts. You get the thing open.

You get it closed again, mostly. There is one bolt left over. You keep the bolt in a jar, like a trophy, or a warning.`,
            tone: 'chaos',
            fx: { money: -60, stress: 10, happiness: 8, flag: { diyRepair: 1 }, counter: { chaos: 1 } },
            delayed: [
              {
                inMonths: 6,
                chance: 0.45,
                title: 'THE BOLT WAS IMPORTANT',
                body: `A noise. A new noise. A noise that has opinions about the previous noise.`,
                tone: 'bad',
                fx: { money: -1800, stress: 14 },
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'money_lifestyle_creep',
    title: 'YOU HAVE BEEN LOOKING AT A SOFA',
    body: `It is not an expensive sofa. That is the thing. It is a reasonable sofa, from a reasonable shop, and it would replace the current sofa, which came from a man who was moving out and let you have it for nothing.

The current sofa has a structural sobriety problem.`,
    art: 'money_sofa',
    cat: 'money',
    weight: 12,
    cooldown: 30,
    when: { age: [22, 75] },
    choices: [
      {
        text: 'Buy the sofa',
        hint: '$1,900',
        tag: 'safe',
        time: 1,
        requires: { minCash: 1900 },
        outcomes: [
          {
            title: 'THE SOFA ARRIVES ON A THURSDAY',
            body: `Two men carry it up the stairs and take away the old one, and it is genuinely, unambiguously better. The room is different. The room is a room.

You sit on it that evening and think about how much better your life feels, which is a thing people pay $1,900 for sometimes and a thing that works exactly once.`,
            tone: 'good',
            fx: { money: -1900, happiness: 12, stress: -6, flag: { boughtSofa: 1 } },
          },
        ],
      },
      {
        text: 'Buy the sofa on 0% finance over 24 months',
        hint: '$79/month. What a deal.',
        tag: 'risky',
        time: 1,
        outcomes: [
          {
            title: 'IT IS TECHNICALLY 0%',
            body: `They are extremely clear that there is no interest, which is true, and extremely quiet about the fact that you have just committed 5% of your monthly income for two years to a piece of furniture.

You will notice this payment eleven times and resent it once, at month nineteen.`,
            tone: 'mixed',
            fx: { happiness: 10, expense: 79, flag: { financedSofa: 1 }, debt: 1900 },
          },
        ],
      },
      {
        text: 'Keep the existing sofa. It has character.',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'THE SOFA HAS CHARACTER',
            body: `You put a throw over the worst of it. The throw is grey. The sofa, underneath, remains a structural negotiation.

You save $1,900 and spend four months noticing the sofa.`,
            tone: 'neutral',
            fx: { happiness: -5, stress: 4, counter: { sensible: 1 } },
          },
        ],
      },
      {
        text: 'Take the sofa off a street corner at 1am',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'IT WAS FREE AND IT WAS ON A STREET',
            body: `You and {friend} carry it three blocks at 1am, laughing in the specific way that people laugh when they are doing something unwise in public.

There is a stain. It is dry. It has been dry for a while. You clean it twice and then decide not to think about it, which is a decision you will revisit.`,
            tone: 'chaos',
            fx: { happiness: 8, stress: 6, health: -3, npc: { jess: 10 }, counter: { chaos: 1 } },
          },
        ],
      },
    ],
  },

  {
    id: 'money_family_ask',
    title: 'THE PHONE CALL FROM HOME',
    body: `Your {sibling} is calling, which he never does. He gets through "hey, are you busy" in a tone that means he has rehearsed this call twice.

He needs help. Not enormous. But not small.`,
    art: 'money_family',
    cat: 'money',
    weight: 13,
    cooldown: 36,
    when: { age: [23, 65] },
    choices: [
      {
        text: 'Send the full amount',
        hint: '$2,400',
        tag: 'kind',
        time: 1,
        requires: { minCash: 2400 },
        fx: { money: -2400, npc: { brother_eli: 22, mum: 12, dad: 8 }, relationships: 8 },
        outcomes: [
          {
            title: 'YOU DID NOT HESITATE',
            body: `You say "done, I'll send it now" and he goes quiet in the way men go quiet when something actually lands, and then says "I'll get it back to you" and you both know he might not, and it does not matter, because he is your brother.`,
            tone: 'good',
            fx: {
              happiness: 8,
              stress: 6,
              flag: { helpedSibling: 1 },
              remember: { brother_eli: 'You sent the money without asking a single question.' },
            },
            delayed: [
              {
                inMonths: 22,
                chance: 0.6,
                title: 'HE PAID IT BACK AND THEN SOME',
                body: `He transfers it back with an absurd note: "and interest, don't argue with me." It is 40% more and he has clearly worked out what he owes by some private arithmetic you will never be shown.`,
                tone: 'good',
                fx: { money: 3400, happiness: 12, relationships: 6, npc: { brother_eli: 10 } },
              },
            ],
          },
        ],
      },
      {
        text: 'Send half and be honest about why',
        tag: 'smart',
        time: 1,
        requires: { minCash: 1200 },
        fx: { money: -1200 },
        outcomes: [
          {
            title: '"I CAN DO HALF. THE REST IS THE RENT."',
            body: `You tell him the real number and the real reason, which is more information than he has ever had about your finances.

He says "that's more than enough, seriously" and means it, and something between you gets slightly better and slightly more honest.`,
            tone: 'good',
            fx: { npc: { brother_eli: 10, mum: 4 }, happiness: 4, stress: 4, flag: { helpedSibling: 1 } },
          },
        ],
      },
      {
        text: 'Say you cannot afford it',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU SAID NO TO YOUR BROTHER',
            body: `It is a perfectly defensible decision and he handles it extremely well, which is the worst part. "Yeah, no, totally, forget I asked."

He is fine. He is going to be fine. You will think about the call for a year.`,
            tone: 'bad',
            fx: { npc: { brother_eli: -14, mum: -4 }, happiness: -8, stress: 12, flag: { refusedSibling: 1 } },
            delayed: [
              {
                inMonths: 10,
                chance: 0.5,
                title: 'IT DID NOT GO WELL FOR HIM',
                body: `Your mother mentions it in passing, six months late, in the way she mentions things: "you know he had a very hard year." You did not know. You chose not to know.`,
                tone: 'bad',
                fx: { happiness: -10, stress: 14, npc: { brother_eli: -6 } },
              },
            ],
          },
        ],
      },
      {
        text: 'Offer to lend it properly, with a written agreement',
        tag: 'bold',
        time: 1,
        requires: { minCash: 2400 },
        outcomes: [
          {
            title: 'A LOAN, WITH PAPERWORK',
            body: `You both feel strange about it. He signs it without reading it, which is somehow worse than if he had argued.

The money is protected. Something else has been moved slightly out of position, and it is not clear whether it will move back.`,
            tone: 'mixed',
            fx: {
              money: -2400,
              npc: { brother_eli: -6, dad: 10 },
              stress: 4,
              flag: { loanedSibling: 1 },
              remember: { brother_eli: 'He made you sign something. You understand why. You still minded.' },
            },
            delayed: [
              {
                inMonths: 18,
                chance: 0.55,
                title: 'THE LAST INSTALMENT',
                body: `He makes every payment, on time, in full, and the final transfer arrives with no message at all. That is the whole relationship now: paid in full.`,
                tone: 'mixed',
                fx: { money: 800, relationships: -3, npc: { brother_eli: 4 } },
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'money_debt_spiral',
    title: 'THE CARD IS NEARLY AT ITS LIMIT',
    body: `You have known this for a while and have been not-looking at it in a deliberate, practised way.

The minimum payment is $170. The balance is $8,400. At minimum payments, this will be resolved in a length of time that a financial calculator refuses to describe without a laugh.`,
    art: 'money_debt',
    cat: 'money',
    weight: 15,
    cooldown: 24,
    when: { flags: { hasCardDebt: [1, null] } },
    choices: [
      {
        text: 'Do a proper consolidation. Real numbers.',
        tag: 'smart',
        time: 2,
        outcomes: [
          {
            title: 'YOU LOOKED AT THE ACTUAL NUMBERS',
            body: `You make a spreadsheet. You make it at 11pm and it is not fun and it is genuinely transformative. You move the balance to a lower rate, cut the card up with actual scissors, and set up a standing payment that you will notice for three years.

$170 a month more for a while, and a countdown with a date at the end of it.`,
            tone: 'good',
            fx: { stress: 6, happiness: 8, money: -400, counter: { sensible: 1 }, flag: { handledDebt: 1 } },
            delayed: [
              {
                inMonths: 26,
                chance: 0.7,
                title: 'THE FINAL PAYMENT',
                body: `You make the last transfer on a Tuesday and sit looking at a zero on a screen. Nobody in the world knows about this and it is, genuinely, one of the best days of your life.`,
                tone: 'good',
                fx: { happiness: 18, stress: -16, flag: { debtFree: 1 }, money: 0 },
              },
            ],
          },
        ],
      },
      {
        text: 'Take out a loan to pay the card',
        tag: 'risky',
        time: 1,
        outcomes: [
          {
            title: 'YOU REFINANCED IT. SORT OF.',
            body: `The loan is at a genuinely lower rate, which is good, and the card is now empty, which is dangerous.

An empty card is not a financial instrument. It is a doorway.`,
            tone: 'mixed',
            fx: { stress: 4, happiness: 4, flag: { emptyCard: 1, handledDebt: 1 } },
            delayed: [
              {
                inMonths: 8,
                chance: 0.6,
                title: 'THE CARD IS NOT EMPTY',
                body: `You cannot remember the specific purchase that did it. It was not one thing, it was nine things, and three of them were extremely reasonable at the time.`,
                tone: 'bad',
                fx: { debt: 2600, stress: 18, happiness: -8 },
              },
            ],
          },
        ],
      },
      {
        text: 'Keep paying the minimum and never think about it',
        tag: 'lazy',
        time: 3,
        outcomes: [
          {
            title: 'YOU PAID THE MINIMUM. IT WAS MINIMAL.',
            body: `Three months pass. The balance goes down by $240 and up by $310 in interest and you have taken the very specific action of doing nothing at the exact speed the system prefers.`,
            tone: 'bad',
            fx: { stress: 10, happiness: -6, debt: 180, flag: { debtSpiral: 1 } },
          },
        ],
      },
    ],
  },

  {
    id: 'money_scam_or_opportunity',
    title: 'A GUARANTEED 14% RETURN',
    body: `An old colleague you vaguely remember has messaged you four times in three weeks. He is doing very well. He has photographs of a boat.

"I'm not going to pretend this is for everyone," he writes, in the exact way that things presented as not-for-everyone always are. "But if you're in before the 30th, you're in at the ground floor."`,
    art: 'money_scam',
    cat: 'investing',
    weight: 12,
    cooldown: 40,
    when: { minCash: 2000, age: [24, 75] },
    choices: [
      {
        text: 'Put in $5,000',
        tag: 'risky',
        highRisk: true,
        time: 2,
        requires: { minCash: 5000 },
        outcomes: [
          { weight: 3, variance: 1, title: 'IT PAID OUT TWICE', body: `It works. Twice. Two payments, on time, exactly as promised, and you feel like a person who understands something other people do not.\n\nThat feeling is worth exactly $5,000 and is also exactly why people put in more.`, tone: 'good', fx: { money: 1400, happiness: 10, reputation: 4, flag: { scamWin: 1 } } },
          {
            weight: 5,
            variance: 1,
            title: 'AND THEN IT DID NOT',
            body: `The third payment is late. Then the site is "under maintenance." Then his phone goes to a message about how this number is no longer in service.

You have lost $5,000 and, far worse, you have to decide whether to tell anyone.`,
            tone: 'bad',
            fx: { money: -5000, stress: 24, happiness: -14, reputation: -4, counter: { losses: 1 } },
            delayed: [
              {
                inMonths: 3,
                chance: 0.7,
                title: 'THERE ARE FOURTEEN OF YOU',
                body: `A group chat appears, containing people who all know each other slightly and none of whom know who he actually was. The total is not $5,000. The total is a number with a comma in it.`,
                tone: 'mixed',
                fx: { stress: 10, reputation: 6, flag: { scamGroup: 1 } },
              },
            ],
          },
        ],
      },
      {
        text: 'Ask for the actual paperwork',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU ASKED FOR THE PAPERWORK',
            body: `He sends a PDF with a logo that was clearly made in four minutes, and a "returns schedule" that has the grammatical texture of a translation.

You ask a follow-up question. He does not reply. You have your answer, and it is the cheapest answer you will ever get.`,
            tone: 'good',
            fx: { happiness: 4, career: 2, counter: { sensible: 1 } },
          },
        ],
      },
      {
        text: 'Report him to the authorities',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU FILED IT',
            body: `It takes fifty minutes on a website that has not been redesigned since 2011. You get a reference number.

Four months later you get an email thanking you for the report and informing you that your details have been added to a case file. That is the whole email.`,
            tone: 'good',
            fx: { reputation: 4, happiness: 4, karma: 6, flag: { reportedScam: 1 } },
          },
        ],
      },
      {
        text: 'Invest everything you have',
        hint: 'Maximum conviction',
        tag: 'chaotic',
        highRisk: true,
        time: 2,
        requires: { minCash: 8000 },
        outcomes: [
          {
            weight: 1,
            variance: 2,
            title: 'YOU HAD CONVICTION',
            body: `You put in a genuinely irresponsible amount and it returns a genuinely irresponsible amount, and for about six weeks you believe you have a gift.

You tell two people. One of them does not believe you and one of them does, which is worse.`,
            tone: 'good',
            fx: { money: 14500, happiness: 14, stress: 12, reputation: 8, counter: { bigWins: 1, chaos: 1 } },
          },
          {
            weight: 6,
            variance: 1,
            title: 'YOU HAD CONVICTION AND IT WAS WRONG',
            body: `Gone. All of it, in one transaction, and the specific horror of that is that you did not lose it to bad luck; you lost it because you decided to.

You have $400 and no rent money and thirty-one days until payday.`,
            tone: 'bad',
            fx: { money: -20000, stress: 34, happiness: -20, counter: { loses: 1, chaos: 1 }, flag: { wipedOut: 1 } },
          },
        ],
      },
    ],
  },

  {
    id: 'money_parents_gift',
    title: 'YOUR {mom} WANTS TO GIVE YOU MONEY',
    body: `She brings it up in the middle of a conversation about a neighbour's conservatory, which is her style.

"There's a bit put aside. Your dad doesn't know the exact amount. You could use it — I've seen your kitchen chairs."`,
    art: 'family_money',
    cat: 'family',
    weight: 12,
    cooldown: 48,
    when: { age: [22, 55] },
    choices: [
      {
        text: 'Take it. Say thank you. Genuinely.',
        hint: '$6,000',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU TOOK THE MONEY',
            body: `She transfers it and then immediately starts talking about something else, because that is how she handles being generous.

You spend three weeks feeling strange about it and then spend it on something sensible, and she is so pleased that it becomes a thing she mentions to relatives.`,
            tone: 'good',
            fx: {
              money: 6000,
              npc: { mum: 12, dad: -6 },
              happiness: 6,
              stress: -4,
              flag: { tookFamilyMoney: 1 },
              remember: { mum: 'You accepted the money with grace. She was proud of that.' },
            },
            delayed: [
              {
                inMonths: 14,
                chance: 0.5,
                title: 'YOUR DAD FINDING OUT',
                body: `He does not say anything directly. He says something adjacent, at a barbecue, aimed at roughly your direction, about how "nobody gave me anything."`,
                tone: 'mixed',
                fx: { npc: { dad: -10, mum: -4 }, stress: 10 },
              },
            ],
          },
        ],
      },
      {
        text: 'Refuse. You want to do this yourself.',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU SAID NO TO SIX THOUSAND DOLLARS',
            body: `She looks at you for a moment longer than usual and then says "alright" and pours more tea, and you sit there feeling simultaneously virtuous and stupid, which is the exact flavour of your twenties.`,
            tone: 'mixed',
            fx: { happiness: 4, stress: 8, reputation: 4, npc: { mum: 4 }, counter: { proud: 1 }, flag: { refusedFamilyMoney: 1 } },
          },
        ],
      },
      {
        text: 'Ask to borrow double that instead',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'YOU ASKED FOR TWICE AS MUCH',
            body: `The silence lasts about four seconds. She does not say no. She asks what it is for, and you do not have a great answer, and she says "I'll need to talk to your dad," which is a no wearing a coat.`,
            tone: 'chaos',
            fx: { npc: { mum: -10, dad: -8 }, stress: 14, happiness: -6, counter: { chaos: 1 }, flag: { overasked: 1 } },
          },
        ],
      },
    ],
  },

  {
    id: 'money_charity_ask',
    title: 'SOMEONE IS RUNNING FOR SOMETHING',
    body: `An acquaintance from a workplace five years ago is running 10km for a charity, and has sent an individualised message that has clearly gone to everyone he has ever met.

The link is there. The suggested amount is $50. He will see if you donate. He will see the exact amount if you do.`,
    art: 'money_charity',
    cat: 'money',
    weight: 8,
    cooldown: 30,
    when: { age: [22, 80] },
    choices: [
      {
        text: 'Donate $50',
        tag: 'kind',
        time: 1,
        outcomes: [
          {
            title: 'YOU GAVE FIFTY DOLLARS',
            body: `You do it quickly, before the feeling passes, and you feel good about it for about ninety seconds and then never think about it again, which is roughly the correct amount of time.`,
            tone: 'good',
            fx: { money: -50, happiness: 4, karma: 5, reputation: 2 },
          },
        ],
      },
      {
        text: 'Donate $500 and post about it',
        tag: 'chaotic',
        time: 1,
        requires: { minCash: 800 },
        outcomes: [
          {
            title: 'YOU MADE IT ABOUT YOU, LOUDLY',
            body: `The donation is real and the money goes to a real cause and 140 people see a screenshot of your generosity.

Two people congratulate you publicly. One person you respect says nothing at all, which you notice.`,
            tone: 'mixed',
            fx: { money: -500, reputation: 6, happiness: 6, karma: 4, counter: { chaos: 1 } },
            delayed: [
              {
                inMonths: 7,
                chance: 0.4,
                title: 'SOMEONE CHECKED THE LINK',
                body: `The charity's actual public total is visible. The amount you posted does not appear anywhere near your name, because you posted the page total, not your donation. Nobody says anything. Somebody noticed.`,
                tone: 'bad',
                fx: { reputation: -10, happiness: -6, stress: 10 },
              },
            ],
          },
        ],
      },
      {
        text: 'Ignore the message entirely',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU READ IT AND MOVED ON',
            body: `You open the message, read it properly, and close it. There is no obligation. There has never been any obligation. He is still going to see that you read it, which is a feature of the platform and a small, cheap punishment for being honest.`,
            tone: 'neutral',
            fx: { happiness: -2 },
          },
        ],
      },
    ],
  },
];
