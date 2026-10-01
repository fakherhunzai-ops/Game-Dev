import type { GameEvent } from '../../engine/types';

/** SOCIAL + SOCIAL MEDIA — reputation, performance, and the internet's long memory. */
export const socialEvents: GameEvent[] = [
  {
    id: 'social_viral_post',
    title: 'YOU POSTED SOMETHING AND IT IS DOING SOMETHING',
    body: `You wrote it on the train in four minutes and posted it without reading it twice, which is the only way good things ever get posted.

It now has 4,000 likes and 340 comments and somebody has quote-posted it with the words "read this again."`,
    art: 'social_viral',
    cat: 'social',
    weight: 13,
    cooldown: 48,
    when: { age: [22, 65] },
    choices: [
      {
        text: 'Ride it. Post a follow-up.',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU BECAME BRIEFLY KNOWN',
            body: `The follow-up does even better. For eleven days you are a person with a following, which means you are a person with notifications, which means you are a person checking a phone eighty times a day.

Then it stops. The internet moves on at 14:00 on a Thursday and does not tell you.`,
            tone: 'good',
            fx: { reputation: 20, happiness: 14, stress: 12, counter: { bigWins: 0, chaos: 0 }, flag: { wentViral: 1 } },
            delayed: [
              {
                inMonths: 4,
                chance: 0.5,
                title: 'SOMEONE FOUND THE OLD POSTS',
                body: `2016. A joke. It is genuinely a joke and it was genuinely funny then and it is being presented without the context of the entire rest of your personality.`,
                tone: 'bad',
                art: 'social_backlash',
                fx: { reputation: -18, stress: 24, happiness: -12 },
              },
            ],
          },
        ],
      },
      {
        text: 'Delete it and enjoy the private smugness',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU DELETED IT',
            body: `You screenshot the numbers first, obviously. Then you delete it, and you feel a genuinely nice private warmth that lasts three days and costs nothing.`,
            tone: 'good',
            fx: { happiness: 8, stress: -4, counter: { sensible: 1 } },
          },
        ],
      },
      {
        text: 'Turn it into a business',
        tag: 'chaotic',
        highRisk: true,
        time: 3,
        fx: { biz: { launch: 'content_studio' }, money: -4000, flag: { contentCreator: 1 }, counter: { businesses: 1 } },
        outcomes: [
          {
            title: 'YOU STARTED A MEDIA COMPANY (IT IS YOU)',
            body: `A newsletter, a rate card, a logo made in ninety minutes. You have 4,000 followers and you have decided that this is a business.

It might genuinely be a business. The first sponsorship offer arrives in eleven days and is worth $180.`,
            tone: 'chaos',
            fx: { happiness: 12, stress: 18, reputation: 10, income: 300, counter: { chaos: 1 } },
            delayed: [
              { inMonths: 12, chance: 0.4, title: 'IT BECAME REAL MONEY', body: `Brand deals, a course, a speaking fee, and a genuinely sweet month where your side income passes your salary.`, tone: 'good', fx: { income: 3400, money: 11000, happiness: 18, reputation: 20, flag: { creatorSuccess: 1 }, counter: { bigWins: 1 } } },
              { inMonths: 12, chance: 0.6, title: 'THE ALGORITHM MOVED ON', body: `Reach down 70% in four months. No explanation, no warning, no appeal process. You have a business whose entire distribution is a decision somebody else makes.`, tone: 'bad', fx: { income: -300, stress: 22, happiness: -14, reputation: -8 } },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'social_ex_photo',
    title: 'THE PHOTOGRAPH FROM 2014 SURFACES',
    body: `It is you, at 23, in a hat that you bought specifically because someone told you it looked good. Somebody has tagged you in a "ten years ago today" post.

Your colleagues can see it. Your partner can see it. It is genuinely funny and genuinely devastating.`,
    art: 'social_oldphoto',
    cat: 'social',
    weight: 9,
    cooldown: 999,
    when: { age: [28, 60] },
    choices: [
      {
        text: 'Repost it yourself with a self-deprecating caption',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU GOT AHEAD OF IT',
            body: `Your caption is genuinely funny and does the work for everyone else, and the whole thing dies in about four hours.

Two colleagues tell you it made them like you more, which is the exact opposite of what you expected.`,
            tone: 'good',
            fx: { reputation: 10, happiness: 8, relationships: 4, stress: -4 },
          },
        ],
      },
      {
        text: 'Untag yourself and hope',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU UNTAGGED YOURSELF',
            body: `It is still there. Untagging removes the association from your name and not from the internet, which is a distinction nobody has ever fully internalised.

It resurfaces in a group chat four months later, sent by a person you have met twice.`,
            tone: 'neutral',
            fx: { stress: 6, reputation: -2 },
          },
        ],
      },
      {
        text: 'Lean in. Commit to the hat for a whole day.',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'YOU WORE THE ACTUAL HAT TO WORK',
            body: `You find one online, pay for next-day delivery, and wear it into the building at 08:50 with the specific confidence of a man who has made peace with something.

It is a genuinely great bit. It is also now a photograph of you in a hat at 34, which will resurface at 44.`,
            tone: 'chaos',
            fx: { reputation: 14, happiness: 14, stress: 6, counter: { chaos: 1 }, flag: { hatGuy: 1 } },
          },
        ],
      },
    ],
  },

  {
    id: 'social_networking_event',
    title: 'A NETWORKING EVENT YOU PAID $75 TO ATTEND',
    body: `A conference room, forty people in lanyards, and a woman at the front explaining that "your network is your net worth," which is a sentence that has never once been true and is somehow repeated at every one of these.

You have a name badge with your job title on it. Your job title is not impressive.`,
    art: 'social_networking',
    cat: 'social',
    weight: 10,
    cooldown: 36,
    when: { career: { employed: true }, age: [23, 60] },
    choices: [
      {
        text: 'Talk to the three most senior people there',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU APPROACHED THE IMPORTANT ONES',
            body: `Two of them are polite and gone in ninety seconds. The third one is genuinely interested and asks you a real second question, and you have a twenty-minute conversation that leaves you with an actual contact.

Your hit rate is 33%, which is enormously better than the people standing by the pastries.`,
            tone: 'good',
            fx: { career: 8, reputation: 6, happiness: 4, stress: 6, flag: { newContact: 1 } },
            delayed: [
              {
                inMonths: 8,
                chance: 0.5,
                title: 'THE THIRD ONE EMAILED',
                body: `Not a job. A question, which is better. Then a project. Then, eventually, a role at a company you would not have thought to apply to.`,
                tone: 'good',
                fx: { career: 12, money: 3000, happiness: 8, counter: { promotions: 1 } },
              },
            ],
          },
        ],
      },
      {
        text: 'Find the other person standing alone',
        tag: 'kind',
        time: 1,
        outcomes: [
          {
            title: 'YOU TALKED TO THE PERSON ON THEIR OWN',
            body: `He is a freelancer who has been to eleven of these and hates them. You have a genuinely honest conversation about how bad these events are, which is the most effective networking either of you does all evening.

He gives you his number and means it.`,
            tone: 'good',
            fx: { happiness: 8, relationships: 6, career: 4, stress: -6, flag: { realContact: 1 } },
          },
        ],
      },
      {
        text: 'Drink three glasses of wine and leave early',
        tag: 'lazy',
        time: 1,
        outcomes: [
          {
            title: 'YOU SPOKE TO DIFFERENT PEOPLE ABOUT DIFFERENT THINGS',
            body: `None of them were useful professionally. One of them was a genuinely lovely conversation about a swimming pool in Portugal.

You leave at 20:40 with a warm feeling and no new contacts, which is a perfectly valid way to spend $75 and precisely the opposite of what was advertised.`,
            tone: 'neutral',
            fx: { happiness: 6, stress: -8, money: -12 },
          },
        ],
      },
      {
        text: 'Present yourself as a founder with a company',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'YOU BECAME A FOUNDER FOR FOUR HOURS',
            body: `You have a name, a one-line pitch, and the word "we" available to you. Four people ask to be introduced to your team, and one of them asks for a demo.

You say you are "in stealth," which is the most useful phrase in the English language.`,
            tone: 'chaos',
            fx: { reputation: 12, career: 8, stress: 10, counter: { chaos: 1 }, flag: { pretendedFounder: 1 } },
            delayed: [
              {
                inMonths: 6,
                chance: 0.5,
                title: 'SOMEBODY FOLLOWED UP',
                body: `An email asking for the update on the thing you are absolutely not building. It is a very warm email and it is addressed to "the team."`,
                tone: 'mixed',
                fx: { stress: 14, reputation: -6 },
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'social_friends_wedding_trio',
    title: 'THREE WEDDINGS IN ONE SUMMER',
    body: `You have been invited to three, in three different parts of the country, in eleven weeks. Each one is a genuinely lovely thing to be invited to and each one costs about $900 between travel, gift, hotel and the round of drinks you will inevitably buy.

You can do all three. You can do them and it will be genuinely stupid.`,
    art: 'social_wedding',
    cat: 'social',
    weight: 12,
    cooldown: 60,
    when: { age: [24, 50], minCash: 600 },
    choices: [
      {
        text: 'Do all three properly',
        tag: 'bold',
        time: 3,
        requires: { minCash: 2700 },
        outcomes: [
          {
            title: 'YOU DID ALL THREE',
            body: `Three gifts, three speeches, three sets of photographs, one genuinely destroyed suit and one weekend where you fly in and out on the same day.

You are exhausted and significantly poorer and you have three memories that you would not trade, which is a thing you can only say about a small number of expenditures.`,
            tone: 'good',
            fx: { money: -2700, happiness: 18, relationships: 14, stress: 16, npc: { jess: 14, marcus: 12, chad: 8 } },
          },
        ],
      },
      {
        text: 'Go to the closest one only',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU WENT TO ONE',
            body: `The local one, the one where you know most people, the one where you will actually have a good time rather than worrying about a train.

The other two send a message when the photographs go up. They are genuinely fine about it. You are not entirely fine about it.`,
            tone: 'mixed',
            fx: { money: -900, happiness: 8, relationships: -4, npc: { jess: -4, marcus: -6 } },
          },
        ],
      },
      {
        text: 'Decline all three and save the money',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU DECLINED ALL THREE',
            body: `Three RSVPs, three genuinely regretful messages, three gifts sent to arrive on time.

You have $2,700 and a series of photographs you are not in.`,
            tone: 'mixed',
            fx: { money: -300, happiness: -8, relationships: -10, npc: { jess: -8, marcus: -8 } },
          },
        ],
      },
      {
        text: 'Go to all three, and propose at one of them',
        tag: 'chaotic',
        highRisk: true,
        time: 3,
        requires: { minCash: 4000, partner: ['dating'] },
        outcomes: [
          {
            title: 'YOU PROPOSED AT SOMEBODY ELSE\'S WEDDING',
            body: `In fairness, you asked the couple first, and they said yes, and they genuinely meant it.

In fairness, it is still somebody else's day, and about four people at the next table will remember it as the day two things happened, and one of those people is the mother of the bride.`,
            tone: 'chaos',
            fx: {
              money: -6800,
              stress: 30,
              happiness: 14,
              reputation: -14,
              npc: { jess: -20, partner: 16 },
              setPartner: { npcId: 'partner', status: 'engaged' },
              counter: { chaos: 1, proposals: 1 },
              flag: { weddingProposal: 1 },
            },
          },
        ],
      },
    ],
  },

  {
    id: 'social_cancelled_plans',
    title: 'A TEXT ARRIVES AT 17:40',
    body: `"So sorry — still stuck at work 😩 can we do next week?"

You had a shower. You had changed your shirt. You were, genuinely, looking forward to it, which you had not admitted to yourself until 17:39.`,
    art: 'social_cancel',
    cat: 'social',
    weight: 12,
    cooldown: 24,
    when: { age: [21, 70] },
    choices: [
      {
        text: 'Be genuinely gracious about it',
        tag: 'kind',
        time: 1,
        outcomes: [
          {
            title: '"NO WORRIES, NEXT WEEK FOR SURE"',
            body: `You send it without any of the little passive-aggressive flourishes you were drafting, and you mean it, and you spend the evening doing something you actually wanted to do.

They reschedule within a fortnight and show up.`,
            tone: 'good',
            fx: { stress: -6, happiness: 6, relationships: 6, npc: { jess: 10 } },
          },
        ],
      },
      {
        text: 'Say "no worries" and mean the opposite',
        tag: 'risky',
        time: 1,
        outcomes: [
          {
            title: 'YOU SENT THE COLD VERSION',
            body: `"No worries!" with an exclamation mark that is doing a genuinely heroic amount of concealment work.

They notice, because people always notice. It becomes a small permanent fact between you.`,
            tone: 'bad',
            fx: { stress: 8, relationships: -6, npc: { jess: -10 }, happiness: -4 },
          },
        ],
      },
      {
        text: 'Go out anyway. Alone. Take a book.',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU WENT OUT ON YOUR OWN',
            body: `The bar is 40% full and you get a table by the window and read for two hours and drink one beer and it is genuinely, unexpectedly one of the better evenings of the year.

You begin, from this point, to do this about once a month.`,
            tone: 'good',
            fx: { happiness: 12, stress: -12, money: -24, flag: { enjoysOwnCompany: 1 } },
          },
        ],
      },
      {
        text: 'Send a genuinely honest message about how you feel',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: '"HONESTLY I WAS LOOKING FORWARD TO IT"',
            body: `You send it and immediately regret the send, and then they reply and it turns out they have been feeling like the only one doing any initiating and were about to say something similar.

The friendship is significantly better for the next three years because of a text you almost deleted.`,
            tone: 'good',
            fx: { happiness: 12, relationships: 12, npc: { jess: 18 }, stress: 6, flag: { honestWithFriends: 1 } },
          },
        ],
      },
    ],
  },

  {
    id: 'social_work_drinks',
    title: 'THE WORK NIGHT OUT',
    body: `There is a table booked for fourteen and a manager has said "the first round is on the company," which is the most expensive sentence in corporate life.

Attendance is optional. Attendance is noted.`,
    art: 'social_worksdrinks',
    cat: 'social',
    weight: 11,
    cooldown: 24,
    when: { career: { employed: true }, age: [22, 60] },
    choices: [
      {
        text: 'Go. Stay three hours. Leave on a high.',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU LEFT AT THE RIGHT TIME',
            body: `Three hours, two drinks, one genuinely useful conversation with someone from another team, and then out, before it turns.

The people who stayed until 01:40 will not be able to tell you what happened after you left, because none of them remember it.`,
            tone: 'good',
            fx: { career: 6, reputation: 6, happiness: 6, stress: -6, npc: { boss_gary: 6, priya: 4 } },
          },
        ],
      },
      {
        text: 'Go. Stay until the end. All of it.',
        tag: 'risky',
        highRisk: true,
        time: 1,
        outcomes: [
          { weight: 5, variance: 1, title: 'YOU BECAME TEMPORARILY BELOVED', body: `You are the fun one, briefly. Two colleagues who have never spoken to you properly now speak to you properly, and one of them will turn out to matter a great deal in two years.`, tone: 'good', fx: { reputation: 14, happiness: 12, relationships: 8, health: -6, stress: 8 } },
          {
            weight: 5,
            variance: 1,
            title: 'YOU SAID SOMETHING AT 00:30',
            body: `You know exactly what you said. You knew when you said it. It was about the promotion and it was about {coworker} and it was loud enough for a specific person to hear.

Monday is a very strange day.`,
            tone: 'bad',
            fx: { reputation: -14, npc: { boss_gary: -12, priya: -10 }, stress: 22, happiness: -10, counter: { chaos: 1 } },
          },
        ],
      },
      {
        text: 'Skip it. Go home.',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU DID NOT GO',
            body: `You say something about a prior commitment that is technically true if you count wanting to be in your own flat as a commitment.

Nothing happens. Nobody mentions it. It is an entirely safe decision that slowly accumulates interest.`,
            tone: 'neutral',
            fx: { stress: -8, happiness: 4, career: -2, reputation: -2 },
          },
        ],
      },
    ],
  },
];
