import type { GameEvent } from '../../engine/types';

/**
 * SIDE HUSTLES
 *
 * The seven ways adults try to turn an evening into money: freelance, online
 * store, content, tutoring, reselling, investing and rental. Each one costs
 * energy first and pays later, and each one can quietly become the real job.
 */
export const hustleEvents: GameEvent[] = [
  {
    id: 'hustle_online_store',
    title: 'DROP SHIPPING IS NOT A BUSINESS MODEL, PROBABLY',
    body: `A person you have never met in a country you have never visited is explaining, with total conviction, that the only thing standing between you and six figures is a supplier link and the willingness to stop overthinking it.

The margins are described as "healthy". The refund rate is described as "a rounding error".`,
    art: 'money_wallet',
    cat: 'business',
    weight: 9,
    cooldown: 40,
    when: { age: [23, 60], lacks: ['has_online_store'] },
    who: 'chad',
    choices: [
      {
        text: 'Launch a small online store selling one niche thing well',
        hint: '$1,400 to start',
        tag: 'bold',
        time: 3,
        fx: { money: -1400, energy: -8, stress: 6 },
        outcomes: [
          {
            title: 'SOMETHING SMALL AND REAL',
            body: `Niche, specific, unglamorous: you sell one category of thing to one kind of person. It takes eleven evenings to build and four weekends to photograph.

The first month is $340. The fourth is $1,180. It is not a business yet. It is a very persistent hobby that pays for itself, which is a much better thing to have than a business.`,
            tone: 'good',
            fx: {
              income: 820,
              expense: 260,
              energy: -6,
              reputation: 5,
              counter: { sensible: 1 },
              flag: { has_online_store: 1 },
              milestone: 'Started an online store',
              log: 'Started an online store',
            },
            chain: [{ id: 'hustle_online_store_grows', inMonths: 16 }],
          },
        ],
      },
      {
        text: 'Go all in. Pay for the course, the ads, the whole thing.',
        hint: '$4,200 on a dream',
        tag: 'risky',
        highRisk: true,
        time: 4,
        fx: { money: -4200, stress: 12, energy: -12 },
        outcomes: [
          {
            weight: 3,
            title: 'SOMEHOW THAT WORKED',
            body: `The course is 80% padding and 20% genuinely useful, and the 20% turns out to be the thing that works. You find an audience in a sub-niche so specific it barely exists.

Fourth-quarter revenue is $11,000 with a 34% margin. You are not a drop shipper. You are a small brand nobody has heard of with customers who love you, which is a different and much better sentence.`,
            tone: 'good',
            fx: {
              income: 3100,
              expense: 1450,
              reputation: 12,
              energy: -10,
              ach: 'ach_capitalist',
              counter: { riskWin: 1 },
              flag: { has_online_store: 1, storeLive: 1 },
              milestone: 'Built a small brand',
              log: 'Went all in on the store',
            },
            chain: [{ id: 'hustle_online_store_grows', inMonths: 12 }],
          },
          {
            weight: 5,
            title: 'YOU PAID FOR A COURSE ABOUT SELLING COURSES',
            body: `The supplier is unreachable. Two shipments are held at customs. The ad account is suspended for reasons explained in a policy document nobody has ever finished reading.

The final inventory is a wardrobe full of 240 units of a product you personally do not want, cannot sell, and now cannot throw away because that would mean admitting the number.`,
            tone: 'bad',
            fx: {
              money: -2600,
              stress: 18,
              happiness: -10,
              energy: -12,
              counter: { regret: 1 },
              flag: { deadStock: 1 },
              log: 'Bought 240 units of nothing',
            },
          },
        ],
      },
      {
        text: 'Do the sums first, and decide against it',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU RAN THE NUMBERS AND SAID NO',
            body: `Two hours with a spreadsheet: customer acquisition cost, return rate, the actual margin after shipping. It does not work at your scale and it would have taken the evenings you currently spend with people you like.

You keep the $1,400 and you keep your Tuesday.`,
            tone: 'good',
            fx: { happiness: 8, energy: 6, stress: -6, counter: { sensible: 1 }, log: 'Did the maths' },
          },
        ],
      },
    ],
  },

  {
    id: 'hustle_online_store_grows',
    title: 'THE STORE WANTS TO BE A REAL JOB',
    body: `Twelve hundred orders. A supplier who now answers within an hour. A customer-service inbox that has genuinely got away from you, and a certain amount of mild panic every time somebody asks about a return.

It is making real money. It is also eating four evenings a week and both weekend mornings.`,
    art: 'business_success',
    cat: 'business',
    weight: 0,
    cooldown: 999,
    priority: 5,
    when: { has: ['has_online_store'] },
    choices: [
      {
        text: 'Quit the day job. This is the job now.',
        tag: 'bold',
        time: 4,
        requires: { flags: { storeLive: [1, null] } },
        outcomes: [
          {
            title: 'YOU GAVE NOTICE ON A TUESDAY',
            body: `Nine weeks of handover, a genuinely awkward leaving speech, and then a Monday morning in your own kitchen with a laptop and 340 unread emails.

It is the same work as before, except that the money is now yours and so is the fear. Revenue doubles within a year because you finally have the daylight hours.`,
            tone: 'good',
            fx: {
              setCareer: null,
              flag: { employed: false },
              income: 4200,
              expense: 1200,
              stress: 14,
              happiness: 12,
              energy: -6,
              counter: { quitJob: 1 },
              milestone: 'Went full time on your own thing',
              log: 'Left the job for the store',
            },
          },
        ],
      },
      {
        text: 'Hire somebody part-time to run the boring half',
        tag: 'smart',
        time: 3,
        outcomes: [
          {
            title: 'YOU BOUGHT YOUR EVENINGS BACK',
            body: `Eighteen hours a week, paid fairly, doing the packing and the returns and the messages. Your margin drops by a third and your life comes back.

The store keeps growing, slightly slower, and you stop dreading the notification sound.`,
            tone: 'good',
            fx: { expense: 1450, income: 1600, stress: -12, energy: 10, happiness: 8, log: 'Hired the first person' },
          },
        ],
      },
      {
        text: 'Sell the whole thing to somebody with more energy',
        tag: 'safe',
        time: 2,
        outcomes: [
          {
            title: 'YOU SOLD IT FOR TWENTY-TWO THOUSAND',
            body: `A buyer, an NDA, and four weeks of due diligence conducted entirely over email. They pay $22,000 for a wardrobe-sized operation with real customers and a good reputation.

You keep the supplier relationship, which is the actual asset, and spend the money on something sensible that you will not remember in ten years.`,
            tone: 'mixed',
            fx: {
              money: 22000,
              income: -820,
              expense: -260,
              happiness: 4,
              flag: { has_online_store: 0, soldStore: 1 },
              counter: { businessesSold: 1 },
              milestone: 'Sold a business',
              ach: 'ach_wealthy_exit',
              log: 'Sold the online store',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'hustle_content_creation',
    title: 'YOU COULD JUST POST ABOUT IT',
    body: `Three devices, one ring light, and the specific humiliation of watching yourself talk on camera for the first time.

Two hundred people see the first one. Four see the second. Somebody in the comments has strong opinions about your lighting, and the honest truth is that you agree with them.`,
    art: 'social_viral',
    cat: 'social',
    weight: 9,
    cooldown: 42,
    when: { age: [23, 58], lacks: ['contentCreator'] },
    who: 'chad',
    choices: [
      {
        text: 'Post every week for a year. No expectations.',
        hint: 'One year of Tuesdays',
        tag: 'bold',
        time: 2,
        fx: { energy: -10, happiness: 4 },
        outcomes: [
          {
            title: 'FIFTY-TWO POSTS LATER',
            body: `The first twenty are bad. The next twenty are competent. Somewhere in the forties, three of them actually land and the graph genuinely moves.

Twelve thousand followers, a sponsorship offer for a product you have never used, and forty dollars a month in ad revenue. It will never be a living. It is, however, the first time you have built an audience from nothing, and that turns out to be a transferable skill.`,
            tone: 'good',
            fx: {
              reputation: 14,
              income: 340,
              happiness: 10,
              energy: -8,
              flag: { contentCreator: 1 },
              milestone: 'Built an audience',
              counter: { creative: 1 },
              log: 'Posted every week for a year',
            },
            chain: [{ id: 'hustle_content_sponsorship', inMonths: 20, chance: 0.6 }],
          },
        ],
      },
      {
        text: 'Chase the trend. Optimise for the algorithm.',
        tag: 'risky',
        highRisk: true,
        time: 3,
        outcomes: [
          {
            weight: 3,
            title: 'ONE OF THEM DID TWO MILLION VIEWS',
            body: `You rode a format at the exact moment it was peaking, and the result is 2.4 million views in nine days, 180,000 new followers and a genuinely surreal fortnight of people recognising your voice.

The next eleven posts do nothing at all. The audience you have built is loyal to a format, not to you, and formats have a half-life of about five weeks.`,
            tone: 'chaos',
            fx: {
              reputation: 22,
              income: 3800,
              happiness: 12,
              stress: 20,
              ach: 'ach_how_did_this_work',
              counter: { riskWin: 1, chaos: 1 },
              flag: { contentCreator: 1, famous: 1 },
              milestone: 'Went viral',
              log: 'Went viral',
            },
            chain: [{ id: 'hustle_content_backlash', inMonths: 10, chance: 0.5 }],
          },
          {
            weight: 4,
            title: 'THE ALGORITHM CHANGED AND TOOK YOU WITH IT',
            body: `Four months of posting into a void. The engagement rate collapses, the comment section turns, and a man on the internet explains that you have "lost the plot" to four thousand people who agree with him.

You have spent a hundred evenings making things nobody watched and you cannot get the evenings back.`,
            tone: 'bad',
            fx: { happiness: -14, stress: 14, energy: -14, reputation: -6, counter: { regret: 1 }, log: 'Posted into the void' },
          },
        ],
      },
      {
        text: 'Start a newsletter instead. Boring, but yours.',
        tag: 'smart',
        time: 3,
        outcomes: [
          {
            title: 'NINE HUNDRED PEOPLE WHO ACTUALLY WANT IT',
            body: `No algorithm, no trends, no ring light. Just a weekly email to a list that grows by four a week, forever, because nobody can take it away from you.

Nine hundred subscribers. Two of them are now clients. One of them offered you a job you did not take.`,
            tone: 'good',
            fx: {
              reputation: 9,
              income: 260,
              happiness: 6,
              flag: { newsletter: 1 },
              milestone: 'Started a newsletter',
              counter: { sensible: 1 },
              log: 'Started a newsletter',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'hustle_content_sponsorship',
    title: 'A BRAND WOULD LIKE TO WORK WITH YOU',
    body: `The email is warmer than you expected and the offer is $2,400 for a single integration. They would like "authentic enthusiasm" for a product that is, generously, fine.

There is a second, smaller offer from a company you actually use. It pays $400.`,
    art: 'social_networking',
    cat: 'social',
    weight: 0,
    cooldown: 999,
    priority: 4,
    choices: [
      {
        text: 'Take the $2,400 and read the script they wrote',
        tag: 'greedy',
        time: 1,
        outcomes: [
          {
            title: 'YOU READ THE SCRIPT',
            body: `It takes forty minutes, it performs well, and eleven people in the comments ask whether you are "doing ads now".

The money clears. The next sponsorship offer is smaller, because the engagement on that post was measurably worse than everything around it.`,
            tone: 'mixed',
            fx: { money: 2400, income: 300, reputation: -5, happiness: 2, counter: { money: 1 }, log: 'Took the sponsorship' },
          },
        ],
      },
      {
        text: 'Take the $400 from the company you actually use',
        tag: 'kind',
        time: 1,
        outcomes: [
          {
            title: 'YOU SAID YES TO THE SMALL ONE',
            body: `Four hundred dollars and a genuinely enthusiastic thirty seconds, because you have used the thing for three years and can explain why.

That post outperforms everything you have made. Two more brands in the same category reach out, and one of them becomes a long-term relationship worth more than the $2,400 would have been.`,
            tone: 'good',
            fx: {
              money: 400,
              income: 900,
              reputation: 12,
              happiness: 8,
              karma: 8,
              counter: { sensible: 1 },
              log: 'Chose the honest sponsor',
            },
          },
        ],
      },
      {
        text: 'Say no to both and keep the account clean',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'NO ADS ON YOUR FEED',
            body: `You reply to both politely and decline. The list grows a little slower. The trust grows a little faster.

Six months later a publisher offers you money for something you actually wanted to make.`,
            tone: 'good',
            fx: { reputation: 8, happiness: 6, karma: 6, flag: { noAds: 1 } },
          },
        ],
      },
    ],
  },

  {
    id: 'hustle_content_backlash',
    title: 'THE INTERNET HAS TURNED ON YOU',
    body: `A two-year-old joke has resurfaced out of context. There are 4,000 quote posts and a hashtag with your handle in it.

Three of the accounts are bots. Two are people you used to work with. One is a genuine, thoughtful criticism that is hard to argue with.`,
    art: 'social_backlash',
    cat: 'social',
    weight: 0,
    cooldown: 999,
    priority: 6,
    choices: [
      {
        text: 'Apologise properly, once, and stop talking',
        tag: 'smart',
        time: 2,
        outcomes: [
          {
            title: 'YOU SAID IT ONCE AND WENT QUIET',
            body: `Four paragraphs: what you said, why it landed badly, what you are changing. No defensiveness, no "sorry you felt that way", no follow-up in the replies.

The storm lasts nine days instead of four months. Two brands quietly drop you. The audience that stays is smaller and considerably better.`,
            tone: 'mixed',
            fx: { reputation: 6, stress: 16, happiness: -8, income: -300, karma: 10, log: 'Handled it properly' },
          },
        ],
      },
      {
        text: 'Argue with every single reply',
        tag: 'chaotic',
        highRisk: true,
        time: 3,
        outcomes: [
          {
            title: 'THAT ESCALATED QUICKLY',
            body: `Fourteen hours over two days. You win several individual arguments and lose the entire narrative, and somewhere around reply 200 you type something you will think about in the shower for the next six years.

The account triples in size. They are not there for the content.`,
            tone: 'chaos',
            fx: {
              reputation: -24,
              stress: 30,
              happiness: -16,
              income: 600,
              counter: { chaos: 1, regret: 1 },
              ach: 'ach_bad_idea',
              log: 'Argued with the entire internet',
            },
          },
        ],
      },
      {
        text: 'Deactivate and disappear for a month',
        tag: 'safe',
        time: 4,
        outcomes: [
          {
            title: 'YOU DROPPED OFF THE FACE OF THE PLATFORM',
            body: `Thirty-one days without the app. The outrage moves on within a week because it always does, and you spend the month reading books and sleeping properly for the first time in a year.

You come back to a smaller account and a much better head. The income never fully recovers and you do not entirely mind.`,
            tone: 'mixed',
            fx: {
              income: -280,
              stress: -24,
              happiness: 14,
              health: 10,
              energy: 12,
              flag: { steppedBack: 1 },
              log: 'Deleted the app for a month',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'hustle_tutoring',
    title: 'THE NEIGHBOUR NEEDS A TUTOR',
    body: `Fifteen dollars an hour, twice a week, for a fourteen-year-old who has decided that maths is a personal insult.

It is not much money. It is, however, an extremely small number of hours and a very short walk.`,
    art: 'office_laptop',
    cat: 'money',
    weight: 9,
    cooldown: 36,
    when: { age: [22, 70], lacks: ['tutoring'] },
    choices: [
      {
        text: 'Take it. Two evenings a week.',
        tag: 'safe',
        time: 2,
        outcomes: [
          {
            title: 'TWICE A WEEK FOR FOURTEEN MONTHS',
            body: `The first month is painful. Somewhere in the third, something clicks and the kid starts arguing with you about method, which is the actual sign it is working.

Fourteen months, one exam result, and a mother who tells literally everybody at the school. Within a year you have four students and have tripled the rate.`,
            tone: 'good',
            fx: {
              income: 520,
              energy: -6,
              happiness: 8,
              reputation: 6,
              karma: 8,
              flag: { tutoring: 1 },
              milestone: 'Started tutoring',
              log: 'Started tutoring',
            },
          },
        ],
      },
      {
        text: 'Take it, and charge what you are actually worth',
        hint: '$55/hour, no apology',
        tag: 'bold',
        time: 2,
        outcomes: [
          {
            title: 'YOU QUOTED A HIGHER NUMBER AND THEY SAID YES',
            body: `The pause on the phone lasts about four seconds. Then they say yes, and something in your understanding of your own value shifts permanently.

Twenty-two years old, earning $55 an hour, two evenings a week, being treated like a professional by adults for the first time.`,
            tone: 'good',
            fx: {
              income: 1450,
              reputation: 8,
              happiness: 12,
              energy: -8,
              flag: { tutoring: 1 },
              counter: { sensible: 1 },
              milestone: 'Started tutoring',
              log: 'Charged real money for tutoring',
            },
          },
        ],
      },
      {
        text: 'Say no. Your evenings are not for sale.',
        tag: 'lazy',
        time: 1,
        outcomes: [
          {
            title: 'YOU KEPT YOUR EVENINGS',
            body: `You decline, politely, and spend the evening doing something entirely unproductive, which is the correct and underrated use of an evening.

Nobody remembers this decision, including you.`,
            tone: 'mixed',
            fx: { happiness: 6, energy: 8, stress: -4, log: 'Kept the evenings free' },
          },
        ],
      },
    ],
  },

  {
    id: 'hustle_reselling',
    title: 'THERE IS MONEY IN OTHER PEOPLE\'S GARAGE',
    body: `A colleague mentions, casually, that he made $600 last month buying furniture at estate sales and selling it four towns over.

You have since looked at the classifieds for two hours, which is two more hours than you have ever previously spent looking at the classifieds.`,
    art: 'money_wallet',
    cat: 'money',
    weight: 8,
    cooldown: 38,
    when: { age: [23, 62], lacks: ['reseller'] },
    choices: [
      {
        text: 'Test it with $200 and a Saturday',
        tag: 'smart',
        time: 2,
        fx: { money: -200 },
        outcomes: [
          {
            title: 'TWO HUNDRED DOLLARS AND A SATURDAY',
            body: `You buy four things. The lamp and the chair sell within a week for $340 together, which is a 70% return on a Saturday's work.

You keep doing it, roughly one Saturday a month, for years. It never becomes a business and never stops being a genuinely pleasant way to make $400.`,
            tone: 'good',
            fx: {
              money: 340,
              income: 420,
              energy: -6,
              happiness: 6,
              flag: { reseller: 1 },
              milestone: 'Flipped your first thing',
              counter: { sensible: 1 },
              log: 'Started buying and selling',
            },
          },
        ],
      },
      {
        text: 'Go big. Buy the whole contents of a house clearance.',
        hint: '$3,000',
        tag: 'risky',
        highRisk: true,
        time: 3,
        fx: { money: -3000, energy: -14 },
        outcomes: [
          {
            weight: 1,
            title: 'YOU FOUND SOMETHING GENUINELY GOOD',
            body: `In a box of costume jewellery, under a folded newspaper from 1988, there is a watch. You look it up three times to be sure, and then you drive it to an expert who confirms it.

It sells at auction for $9,400. The lot you paid $3,000 for returns $12,600 in total.`,
            tone: 'good',
            fx: {
              money: 12600,
              happiness: 18,
              reputation: 8,
              counter: { riskWin: 1 },
              ach: 'ach_diamond_hands',
              flag: { reseller: 1, foundTreasure: 1 },
              milestone: 'Found the watch',
              log: 'Found a watch in a box',
            },
          },
          {
            weight: 4,
            title: 'YOU NOW OWN A GARAGE FULL OF OTHER PEOPLE\'S FURNITURE',
            body: `The wardrobe does not fit through a doorway. The piano is completely unsellable and cost $400 to move. The "vintage" chairs are from a dentist's waiting room in 1997.

You spend seven months selling it item by item for less than you paid, and lose about $900 along with the entire spare bedroom.`,
            tone: 'bad',
            fx: {
              money: -900,
              stress: 14,
              happiness: -8,
              energy: -12,
              counter: { regret: 1 },
              flag: { reseller: 1, clutter: 1 },
              log: 'Bought a house clearance',
            },
          },
        ],
      },
      {
        text: 'Decide it is somebody else\'s Saturday',
        tag: 'lazy',
        time: 1,
        outcomes: [
          {
            title: 'NOT FOR YOU, GENUINELY',
            body: `You work out, quite quickly and clearly, that this requires a van, a storage unit and a personality type you do not have.

That is a genuinely valuable thing to know about yourself, and it costs nothing to learn.`,
            tone: 'mixed',
            fx: { happiness: 4, stress: -4 },
          },
        ],
      },
    ],
  },
];
