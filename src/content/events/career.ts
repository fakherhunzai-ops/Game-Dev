import type { GameEvent } from '../../engine/types';

/**
 * CAREER + WORKPLACE
 *
 * The engine of most adult misery and most adult money. Note the pattern used
 * throughout: nearly every choice is *immediately* survivable. The damage is
 * scheduled.
 */
export const careerEvents: GameEvent[] = [
  /* 1 ------------------------------------------------------------------- */
  {
    id: 'career_salary_spreadsheet',
    title: 'THE SPREADSHEET',
    body: `Your manager {boss} has emailed you "Q3 Planning — DO NOT FORWARD" and attached the entire company salary sheet by mistake.

You scroll. You find your name. You find {coworker}'s name directly underneath it. They earn thirty percent more than you for, as far as you can tell, attending the same meetings.`,
    quote: '"Please treat the attached as confidential." — sent to 340 people',
    speaker: 'boss_gary',
    art: 'office_spreadsheet',
    cat: 'workplace',
    weight: 18,
    cooldown: 60,
    when: { career: { employed: true }, age: [21, 58] },
    choices: [
      {
        text: 'Ask for a raise',
        hint: 'Calmly. With evidence.',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU BROUGHT RECEIPTS',
            body: `You walk into {boss}'s office with a printout and a rehearsed opening sentence. He goes very still, then very reasonable, which is somehow worse.

"Let me look at the band," he says, which is manager for "let me hope you die of old age first."

Eight days later an adjustment lands. It is not thirty percent. It is eleven percent and a title with the word "Senior" in it, which costs them nothing and buys them two years of your life.`,
            tone: 'good',
            fx: {
              career: 8,
              happiness: 6,
              stress: -4,
              npc: { boss_gary: -4 },
              remember: { boss_gary: 'You asked for a raise with evidence. He respected it and resented it.' },
              log: 'Negotiated a raise',
              flag: { askedForRaise: 1 },
            },
            delayed: [
              {
                inMonths: 14,
                chance: 0.55,
                title: 'THE REBANDING',
                body: `HR announces a "market alignment review." Salaries go up across the team. Yours goes up marginally less than everyone else's, in a way that is technically impossible to prove.`,
                tone: 'mixed',
                fx: { career: -3, stress: 6, npc: { boss_gary: -3 } },
              },
            ],
          },
        ],
      },
      {
        text: 'Pretend you never saw it',
        hint: 'Dignity intact',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU SAW NOTHING',
            body: `You close the attachment. You reply "thanks, will review." You spend the next four months noticing, in exquisite detail, every single thing {coworker} does that you now do not.

The knowledge does not go away. It just moves in.`,
            tone: 'bad',
            fx: {
              stress: 12,
              happiness: -8,
              career: -2,
              flag: { knowsSalaryGap: 1, resentment: 1 },
            },
            delayed: [
              {
                inMonths: 5,
                chance: 0.5,
                title: 'IT COMES UP AT DINNER',
                body: `You mention it. Once. Lightly. It does not land the way you meant it, and now it is a Thing, and the Thing has a name.`,
                tone: 'mixed',
                fx: { stress: 8, relationships: -5 },
              },
            ],
          },
        ],
      },
      {
        text: 'Tell {coworker}',
        hint: 'Solidarity!',
        tag: 'kind',
        time: 1,
        outcomes: [
          {
            title: 'SOLIDARITY, BRIEFLY',
            body: `{coworker} goes pale, then furious — not at the company, at you, for knowing. Then at the company. Then you both stand in the stairwell and have the most honest conversation either of you has had at work in a year.

She starts applying that night. She is gone in seven weeks and her seat is not backfilled, so you now do her job too.`,
            tone: 'mixed',
            fx: {
              npc: { priya: 22, boss_gary: -6 },
              reputation: 6,
              career: 3,
              stress: 10,
              remember: { priya: 'You told her about the pay gap instead of keeping it.' },
            },
            delayed: [
              {
                inMonths: 20,
                chance: 0.7,
                title: 'SHE REMEMBERED',
                body: `{coworker} emails out of nowhere. She is a director now. She has a role that is exactly your job, with a pay band that would make you sit down.

"You were honest with me when it cost you something," she writes. "The link is below."`,
                tone: 'good',
                fx: { career: 10, happiness: 10, npc: { priya: 15 }, flag: { poachOffer: 1 } },
                queue: [{ id: 'career_poach_offer', inMonths: 1 }],
              },
            ],
          },
        ],
      },
      {
        text: 'Forward it to the entire company',
        hint: 'Burn it all down',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'WELL. THAT HAPPENED.',
            body: `You hit forward, type "for transparency x" and spend four minutes with your heart trying to exit through your throat.

Within an hour, 340 people know what everyone earns. Within a day, it is on a forum. Within a week, HR is an actual war room and {boss}'s job is a coin flip.

Nobody knows it was you. Two people suspect. You have never felt so alive and so certain you are about to be fired, in either order.`,
            tone: 'chaos',
            fx: {
              reputation: 22,
              stress: 28,
              career: -12,
              npc: { boss_gary: -30, priya: 10, jess: 8 },
              flag: { salaryLeak: 1, chaosRep: 1 },
              counter: { chaos: 1 },
              remember: { boss_gary: 'Somebody forwarded the salary sheet. He never found out who.' },
            },
            delayed: [
              {
                inMonths: 3,
                chance: 1,
                title: 'HR INVESTIGATION',
                body: 'Someone has been going through the email server, which they can do, apparently, because it is theirs.',
                tone: 'bad',
                art: 'office_hr',
                queue: [{ id: 'chain_hr_investigation', inMonths: 0 }],
              },
            ],
          },
        ],
      },
    ],
  },

  /* 2 ------------------------------------------------------------------- */
  {
    id: 'career_burnout',
    title: 'RUNNING ON VAPOURS',
    body: `You have been awake so long that the office carpet has started to look like an option. Your eye has developed a twitch with opinions. Last night you dreamed about a spreadsheet and woke up reaching for the keyboard.

Your body is filing a complaint. It has attached documents.`,
    art: 'office_burnout',
    cat: 'health',
    weight: 14,
    cooldown: 30,
    when: { stats: { stress: [58, 100] }, career: { employed: true } },
    choices: [
      {
        text: 'Take actual time off',
        hint: 'Use the leave you have',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU TOOK A WEEK. IT WAS A WEEK.',
            body: `You book the leave. {boss} says "of course, you've earned it" in the tone of a man who has never taken it himself.

Day one you sleep for fourteen hours. Day three you go outside. By day six your shoulders have come down from somewhere near your ears and you remember you have hobbies.

You come back to 412 unread emails and a project that has quietly had its deadline moved up. But you come back with a spine.`,
            tone: 'good',
            fx: { stress: -26, health: 10, energy: 12, happiness: 8, career: -2, npc: { boss_gary: 3 } },
          },
        ],
      },
      {
        text: 'Push through it',
        hint: 'You are, unfortunately, built like this',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'FINE. EVERYTHING IS FINE.',
            body: `You push. The work is genuinely good — you are sharper when you are slightly unravelled, and you hate that this is true.

The project lands. You get a nod in the Monday standup and no money.

You go home, sit on the floor of your apartment with your shoes still on, and do not move for forty minutes.`,
            tone: 'mixed',
            fx: { career: 12, stress: 17, health: -14, happiness: -8, jobPerf: 0.2 },
            delayed: [
              {
                inMonths: 4,
                chance: 0.65,
                title: 'THE CRASH',
                body: `It does not come gradually. You stand up from a desk on a Tuesday and your body simply declines to continue, and you are off for three weeks with something a doctor calls "a bit of exhaustion" and you call "the bill for the last year."`,
                tone: 'bad',
                art: 'health_sick',
                fx: { stress: -18, health: -10, career: -6, money: -1400, happiness: -6 },
              },
            ],
          },
        ],
      },
      {
        text: 'Quit, immediately, on the spot',
        hint: 'Dramatic. Costly. Wonderful.',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'YOU SAID THE WORDS OUT LOUD',
            body: `It starts as a joke in the kitchen and ends with you in {boss}'s office saying "I think I'm done" before you have decided to say it.

The quiet afterwards is extraordinary. You have no income, no plan, and the first genuinely peaceful week you have had in two years.

Marcus calls it "the classic you." Your mother calls it "a conversation we should have."`,
            tone: 'chaos',
            fx: {
              career: -22,
              stress: -32,
              happiness: 16,
              reputation: -6,
              flag: { quitDramatically: 1, employed: false },
              setCareer: null,
              counter: { quitJobs: 1 },
              log: 'Walked out',
            },
            delayed: [
              {
                inMonths: 2,
                chance: 0.8,
                title: 'THE PANIC ARRIVES LATE',
                body: `The serenity has an interest rate. Your savings statement arrives and you do the maths you have been avoiding, three times, hoping for a different answer.`,
                tone: 'bad',
                fx: { stress: 22, happiness: -12 },
              },
            ],
          },
        ],
      },
    ],
  },

  /* 3 ------------------------------------------------------------------- */
  {
    id: 'career_credit_stolen',
    title: 'YOUR IDEA, THEIR SLIDE',
    body: `You look up at the all-hands and there it is: your idea. On a slide. With {coworker}'s name on it and a stock photo of a handshake.

You know it is yours. There is a screenshot of the message you sent in the group chat last month, which {coworker} has "forgotten."`,
    art: 'office_conflict',
    cat: 'workplace',
    weight: 15,
    cooldown: 45,
    when: { career: { employed: true } },
    choices: [
      {
        text: 'Say something in the meeting',
        hint: 'In front of everyone',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU SAID IT OUT LOUD',
            body: `"That's from my message." Four words, said aloud, in a room of thirty.

{coworker} does the laugh — the specific laugh — and says "oh, I mean, we all build on each other" and the meeting moves on like a river over a body.

Afterwards, three separate people message you privately. Two of them say "good for you." One of them says "careful."`,
            tone: 'mixed',
            fx: {
              reputation: 12,
              career: 4,
              stress: 14,
              npc: { priya: -8, boss_gary: -2 },
              flag: { spokeUp: 1 },
              remember: { priya: 'You called her out in the all-hands. She has not forgotten.' },
            },
            delayed: [
              {
                inMonths: 7,
                chance: 0.6,
                title: 'THE REPERCUSSION',
                body: `Nothing dramatic. Just the slow drift of being quietly uninvited from things. Two projects reassigned "to balance the team's workload." A meeting that happens without you that you find out about after.`,
                tone: 'bad',
                fx: { career: -8, stress: 10, jobPerf: -0.15 },
              },
            ],
          },
        ],
      },
      {
        text: 'Document everything, say nothing, wait',
        hint: 'The long game',
        tag: 'smart',
        time: 2,
        outcomes: [
          {
            title: 'YOU STARTED A FILE',
            body: `You screenshot the message. You save the file as "notes.txt" because you are not an idiot. You say nothing and start keeping a log with dates, times and outcomes, like a person building a legal case, which you are.

It is unglamorous. It is also extremely effective.`,
            tone: 'good',
            fx: {
              stress: 5,
              career: 3,
              flag: { hasPaperTrail: 1 },
              counter: { strategic: 1 },
            },
            delayed: [
              {
                inMonths: 11,
                chance: 0.6,
                title: 'THE FILE COMES OUT',
                body: `A restructure. A decision about who leads the new team. {coworker} submits a proposal; you submit an actual record of the last two years with dates on it.

You get the team. {coworker} gets a new manager: you.`,
                tone: 'good',
                fx: {
                  career: 14,
                  happiness: 10,
                  stress: 4,
                  npc: { priya: -6 },
                  setCareer: { path: 'marketing', level: 2 },
                },
              },
            ],
          },
        ],
      },
      {
        text: 'Steal something of theirs later',
        hint: 'Escalate, symmetrically',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'PETTY. EFFECTIVE. PETTY.',
            body: `Six weeks later, {coworker} presents a plan that is now, inexplicably, also your plan, and the room turns and says "wait, didn't {coworker} already do this?"

It works. It is a horrible way to live and it works.`,
            tone: 'chaos',
            fx: { career: 5, reputation: -10, stress: 8, npc: { priya: -20 }, counter: { chaos: 1 } },
          },
        ],
      },
    ],
  },

  /* 4 ------------------------------------------------------------------- */
  {
    id: 'career_lie_to_boss',
    title: 'YOU COULD JUST SAY YOU SENT IT',
    body: `You did not send it. You are not going to send it. It is 9:40 and {boss} is standing at your desk with a very specific expression.

"Did that go out to the client?" he asks.

The truthful answer will take seventeen seconds and cost you a client meeting.`,
    art: 'office_liedesk',
    cat: 'workplace',
    weight: 16,
    cooldown: 30,
    when: { career: { employed: true } },
    choices: [
      {
        text: 'Yes. Obviously. It went out.',
        hint: 'Seventeen seconds saved',
        tag: 'bold',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'SEVENTEEN SECONDS, BEAUTIFULLY SPENT',
            body: `"Yep, sent this morning." He nods and walks away. You have bought yourself four hours and a small deposit of dread.

At lunch you send the actual email with a timestamp that does not match. Nobody notices. Nobody has noticed yet.`,
            tone: 'good',
            fx: {
              stress: 9,
              career: 2,
              flag: { liedToBoss: 1, lies: 1 },
              counter: { lies: 1 },
              log: 'Told a small, convenient lie',
              remember: { boss_gary: 'You told him it was sent. It was not sent.' },
            },
            delayed: [
              {
                inMonths: 9,
                chance: 0.7,
                title: 'SOMEONE REMEMBERED',
                body: `The client account gets audited. Timestamps are pulled. There is a two-hour gap between what you told {boss} and what actually happened, and it is sitting in a PDF with your name on the header.`,
                tone: 'bad',
                art: 'office_hr',
                fx: { career: -10, reputation: -8, stress: 18, npc: { boss_gary: -14 } },
                queue: [{ id: 'chain_hr_investigation', inMonths: 2 }],
              },
            ],
          },
        ],
      },
      {
        text: 'No. I dropped the ball. I will fix it now.',
        hint: 'Painful. Correct.',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'GROWN-UP BEHAVIOUR. IN AN OFFICE.',
            body: `{boss} blinks. He was braced for a story and got an admission, and he visibly does not know what to do with it.

"Right," he says. "Get it out by two." Then, from the doorway, without turning around: "That's rarer than it should be."

You send it by 1:40. It is fine. It is completely fine.`,
            tone: 'good',
            fx: {
              career: 5,
              reputation: 7,
              npc: { boss_gary: 12 },
              stress: -3,
              flag: { honestWithBoss: 1 },
              remember: { boss_gary: 'You owned a mistake immediately. He noticed.' },
            },
            delayed: [
              {
                inMonths: 10,
                chance: 0.5,
                title: 'THE BENEFIT OF THE DOUBT',
                body: `A different problem lands on your desk — a real one, the kind that gets people walked out. Before anyone else sees it, {boss} says your name in a meeting as the person who "tells you the truth."

It shields you. You will never quite know from what.`,
                tone: 'good',
                fx: { career: 8, npc: { boss_gary: 8 }, jobPerf: 0.1 },
              },
            ],
          },
        ],
      },
      {
        text: 'Blame IT. The email system. Technology broadly.',
        hint: 'A classic for a reason',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: '"WE\'VE HAD ISSUES WITH THE SERVER"',
            body: `You deliver this with the flat confidence of a man who has never administered a server, to a man who has also never administered a server. Neither of you can tell.

He says "IT's been a nightmare" and tells you a story about his printer that lasts six minutes. You are in the clear.`,
            tone: 'good',
            fx: { stress: 6, career: 1, flag: { liedToBoss: 1, lies: 1 }, counter: { lies: 1 } },
            delayed: [
              {
                inMonths: 4,
                chance: 0.45,
                title: 'IT DISAGREES',
                body: `IT sends a log to all managers "for transparency." Your name appears in it twice, flagged, next to a subject line you have described, out loud, as a technology failure.`,
                tone: 'bad',
                fx: { reputation: -12, npc: { boss_gary: -10 }, stress: 14, career: -5 },
              },
            ],
          },
        ],
      },
    ],
  },

  /* 5 ------------------------------------------------------------------- */
  {
    id: 'career_poach_offer',
    title: 'A RECRUITER, OR SOMETHING LIKE ONE',
    body: `A message appears: "Hi! Loved your profile. We're building something special and your background is EXACTLY what we need."

The role pays forty percent more. The company is called something like Quiverr. They have a website. It was made in the last eighteen months.`,
    art: 'office_offer',
    cat: 'career',
    weight: 13,
    cooldown: 36,
    when: { career: { employed: true, level: [1, 9] }, age: [23, 55] },
    choices: [
      {
        text: 'Take the offer',
        hint: '+40% salary, -100% certainty',
        tag: 'bold',
        time: 2,
        outcomes: [
          {
            title: 'YOU SIGNED THE THING',
            body: `The contract arrives as a PDF named "Offer_FINAL_v3_final.pdf" and you read maybe sixty percent of it.

Your notice period is awkward. {boss} takes it personally in a way that suggests he has never previously thought about you as a person who could leave.

Day one at the new place: a laptop, a lanyard, and a slide deck about "the journey ahead."`,
            tone: 'good',
            fx: {
              career: 14,
              happiness: 6,
              stress: 10,
              reputation: 4,
              jobPerf: -0.2,
              flag: { jumpedShip: 1 },
              counter: { jobChanges: 1 },
            },
            delayed: [
              {
                inMonths: 14,
                chance: 0.55,
                title: 'THE SECOND HALF OF THE STORY',
                body: `The company announces a "strategic realignment" on a Thursday. By Friday the word is being used in past tense.

The salary was real for fourteen months. The money is real. The lesson is being assembled in the background.`,
                tone: 'bad',
                fx: { career: -8, stress: 20, happiness: -10, flag: { layoffRisk: 1 } },
                queue: [{ id: 'chain_layoff', inMonths: 3 }],
              },
            ],
          },
        ],
      },
      {
        text: 'Use it as leverage',
        hint: 'Ask {boss} to match',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU PLAYED THE CARD',
            body: `You do it well — no ultimatum, just "I have had an approach and I want to be transparent with you."

{boss} leans back. "What do you want?" And there it is, the entire conversation, reduced to a number you now have to say out loud.

They match. Mostly. At a level that means you have just converted yourself into a line item somebody watches.`,
            tone: 'mixed',
            fx: {
              career: 9,
              stress: 12,
              jobPerf: 0.1,
              npc: { boss_gary: -5 },
              flag: { counteroffer: 1 },
              counter: { counteroffers: 1 },
            },
            delayed: [
              {
                inMonths: 18,
                chance: 0.45,
                title: 'A LINE ITEM AND A NAPKIN',
                body: `Budget season. Someone at the top says "let's talk about attrition cost" and your name comes up attached to a number larger than your peers'.

They do not fire you. They just stop investing in you, which is quieter.`,
                tone: 'bad',
                fx: { career: -6, happiness: -8, stress: 10 },
              },
            ],
          },
        ],
      },
      {
        text: 'Decline, politely, and stay',
        hint: 'Loyalty. Or inertia. Same result.',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU SAID NO',
            body: `You write a pleasant reply. The recruiter replies with "totally understand! Keep me in mind 🙂" and you never hear from them again.

You stay. The familiarity is genuinely worth something: you know how to get things done here, and that is a real skill with a real price.`,
            tone: 'neutral',
            fx: { stress: -6, happiness: 3, career: 2, npc: { boss_gary: 5 } },
          },
        ],
      },
      {
        text: 'Take the offer, tell nobody, keep both jobs',
        hint: 'Overemployment. What could go wrong?',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'YOU ARE NOW TWO PEOPLE',
            body: `Two laptops. Two sets of meetings. Two calendars carefully colour-coded and never, ever photographed.

The money is unbelievable. So is the lying. You develop a habit of talking to yourself in the third person just to keep the names straight.`,
            tone: 'chaos',
            fx: { money: 4200, income: 2800, stress: 30, health: -10, career: 8, counter: { chaos: 1 }, flag: { twoJobs: 1 } },
            delayed: [
              {
                inMonths: 6,
                chance: 0.6,
                title: 'THE CALENDAR OVERLAPS',
                body: `A December all-hands in your personal calendar next to a December all-hands in the other one. Same day. Same hour. Different logos.

You attend one on your phone, muted, in a stairwell, praying neither asks you a direct question.`,
                tone: 'chaos',
                art: 'office_meeting',
                fx: { stress: 26 },
                queue: [{ id: 'chain_double_life_caught', inMonths: 4 }],
              },
            ],
          },
        ],
      },
    ],
  },

  /* 6 ------------------------------------------------------------------- */
  {
    id: 'career_meeting_waste',
    title: 'THIS MEETING IS ONE EMAIL',
    body: `Six people. Forty minutes. A shared screen showing a document with "DRAFT — DO NOT EDIT" at the top, which two people are currently editing.

The meeting could be a paragraph. The paragraph could be a sentence. The sentence is "decision was already made."`,
    art: 'office_meeting',
    cat: 'workplace',
    weight: 11,
    cooldown: 24,
    when: { career: { employed: true } },
    choices: [
      {
        text: 'Say the quiet part',
        hint: '"Could this be an email?"',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU SAID THE LINE',
            body: `The room goes quiet in a way that tells you it has been thought, repeatedly, by everyone present, for approximately two years.

Brenda from Ops says "I mean... yes" and there is a small, dangerous laugh. The meeting ends eight minutes early. Something shifts.`,
            tone: 'mixed',
            fx: { reputation: 14, career: 4, stress: -6, npc: { boss_gary: -3, priya: 8 } },
            delayed: [
              {
                inMonths: 6,
                chance: 0.4,
                title: 'YOU ARE INVITED TO FEWER MEETINGS',
                body: `Not as punishment. It is subtler. Certain people stop looping you in, and those certain people are the ones who decide things.`,
                tone: 'mixed',
                fx: { career: -5, stress: -8, happiness: 6 },
              },
            ],
          },
        ],
      },
      {
        text: 'Contribute enthusiastically',
        hint: 'Be a team player. Say "circling back".',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: '"LOVE THAT. LET\'S CIRCLE BACK."',
            body: `You say four sentences that mean nothing and one that means slightly less. You make eye contact. You nod at the right moments. It is a genuinely good performance.

Nothing changes. It takes you eleven minutes to recover.`,
            tone: 'neutral',
            fx: { career: 2, stress: 4, jobPerf: 0.05, npc: { boss_gary: 3 } },
          },
        ],
      },
      {
        text: 'Work on other things the whole time',
        hint: 'Camera off, brain elsewhere',
        tag: 'lazy',
        time: 1,
        outcomes: [
          {
            title: 'YOU DID AN ENTIRE WEEK OF WORK',
            body: `You answer a client email, finish a deck, book a dentist appointment and reorganise your entire cloud storage, while saying "right" into a muted microphone at eighteen-minute intervals.

Nobody notices. The productivity is genuine. The guilt arrives later, on schedule.`,
            tone: 'good',
            fx: { career: 3, jobPerf: 0.1, happiness: 3, stress: 2 },
          },
        ],
      },
      {
        text: 'Fall asleep with the camera on',
        hint: 'Do not',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'THE NOD. THE DEEP NOD.',
            body: `You were fine for thirty minutes. Then your head does the thing, the sudden six-inch drop, and you are awake with your eyes already open, hoping it looked like concentration.

It did not look like concentration. {coworker} has a screenshot. She says she does not. She says it while smiling.`,
            tone: 'chaos',
            fx: { reputation: -10, stress: 12, npc: { priya: -6 }, counter: { chaos: 1 }, flag: { sleptInMeeting: 1 } },
          },
        ],
      },
    ],
  },

  /* 7 ------------------------------------------------------------------- */
  {
    id: 'career_promotion_gauntlet',
    title: 'THE PROMOTION IS UP FOR GRABS',
    body: `They have "opened up" the role rather than handing it to you, which is corporate for "made you apply for your own future."

Your competition is {coworker}, who is competent, liked, and — crucially — has never once pointed out that a meeting could have been an email.

The interview panel includes {boss}.`,
    art: 'office_promotion',
    cat: 'career',
    weight: 15,
    cooldown: 48,
    priority: 2,
    when: {
      career: { employed: true, level: [1, 8] },
      stats: { career: [45, 100] },
      age: [24, 58],
    },
    choices: [
      {
        text: 'Prepare properly. Rehearse. Win it.',
        tag: 'smart',
        time: 2,
        outcomes: [
          {
            title: 'YOU WERE EMBARRASSINGLY PREPARED',
            body: `You have three examples for every competency, a plan for the first ninety days, and a number.

{coworker} has a strong informal case. You have a document.

They give it to you. {boss} says "you've earned this" and does not mention money, which is the part you have rehearsed and did not get to use.`,
            tone: 'good',
            fx: {
              career: 16,
              happiness: 12,
              stress: 6,
              jobPerf: 0.1,
              flag: { promoted: 1 },
              counter: { promotions: 1 },
              npc: { boss_gary: 6, priya: -10 },
              setCareer: { path: 'marketing', level: 2 },
              log: 'Promoted',
            },
            delayed: [
              {
                inMonths: 8,
                chance: 0.5,
                title: 'THE RAISE YOU DID NOT NEGOTIATE',
                body: `Your new title came with a "salary review in six months" and it is now eight. The review is scheduled for a date that keeps, mysteriously, being rescheduled.`,
                tone: 'mixed',
                fx: { stress: 12, happiness: -8, career: 2 },
              },
            ],
          },
        ],
      },
      {
        text: 'Focus on relationships, not prep',
        hint: 'Work the room',
        tag: 'bold',
        time: 2,
        outcomes: [
          {
            title: 'YOU WORKED THE ROOM',
            body: `You buy coffee. You remember that the panel chair's daughter plays lacrosse. You are warm, funny and absolutely not talking about competencies.

It is close. It goes to {coworker} because "we're looking for someone with more structure."

{coworker} gets your job and immediately starts delegating to you.`,
            tone: 'bad',
            fx: { career: -8, stress: 16, happiness: -14, npc: { priya: -6, boss_gary: 4 }, flag: { promoted: false } },
          },
        ],
      },
      {
        text: 'Withdraw and let {coworker} take it',
        hint: 'Peace. Other opportunities. Probably.',
        tag: 'kind',
        time: 1,
        outcomes: [
          {
            title: 'YOU STEPPED ASIDE',
            body: `You email the panel chair and remove yourself. It is genuinely gracious and you feel genuinely good about it for about nine days.

{coworker} is grateful. {coworker} is also now your manager, and grateful managers make strangely demanding bosses.`,
            tone: 'mixed',
            fx: {
              stress: -10,
              happiness: -4,
              reputation: 8,
              npc: { priya: 20, boss_gary: 2 },
              remember: { priya: 'You withdrew so she could have the promotion.' },
            },
            delayed: [
              {
                inMonths: 16,
                chance: 0.6,
                title: 'SHE PAID IT BACK',
                body: `{coworker} needs a number two she trusts absolutely. She does not look far. The money is not amazing. The autonomy is unusual.`,
                tone: 'good',
                fx: { career: 12, happiness: 8, money: 3000, npc: { priya: 10 } },
              },
            ],
          },
        ],
      },
    ],
  },

  /* 8 ------------------------------------------------------------------- */
  {
    id: 'career_reference_lie',
    title: 'THE APPLICATION FORM',
    body: `"Why did you leave your last role?" asks the form, in a box that is far too small for the truth.

The truth is that you left because a manager said something small and cruel in front of the team and you stood up and walked out, and you would do it again.

The form wants a sentence. You have a sentence. It is not the true one.`,
    art: 'office_application',
    cat: 'career',
    weight: 14,
    cooldown: 40,
    when: { career: { employed: false }, age: [22, 52] },
    choices: [
      {
        text: 'Embellish. Gently. Just enough.',
        hint: 'Everyone does it',
        tag: 'bold',
        time: 2,
        outcomes: [
          {
            title: 'JUST ENOUGH',
            body: `You write "seeking a new challenge" and move a couple of roles around by a few months to close a gap. Small things. Defensible things.

You get the interview. The interview goes beautifully. You are very good at this when you are not being honest.`,
            tone: 'good',
            fx: {
              career: 12,
              happiness: 8,
              stress: 8,
              flag: { liedOnApplication: 1, lies: 1 },
              counter: { lies: 1 },
              log: 'Stretched the truth on an application',
            },
            delayed: [
              {
                inMonths: 34,
                chance: 0.75,
                title: 'HR FOUND SOMETHING',
                body: `Three years in. A background check for a promotion, or an audit, or a merger, and dates are compared against old records by a person who is paid to do exactly that.`,
                tone: 'bad',
                art: 'office_hr',
                fx: { stress: 22 },
                queue: [{ id: 'chain_hr_found_something', inMonths: 1 }],
              },
            ],
          },
        ],
      },
      {
        text: 'Tell the truth, all of it',
        hint: 'Risky in a different way',
        tag: 'smart',
        time: 2,
        outcomes: [
          {
            title: '"I LEFT BECAUSE OF HOW I WAS TREATED"',
            body: `You write it out properly. It is measured and specific and it does not sound bitter, which takes an hour and three rewrites.

The hiring manager reads it twice. "This is the most honest answer I've had this year," she says, and you cannot tell whether that is good or merely interesting. It is good.`,
            tone: 'good',
            fx: {
              career: 11,
              reputation: 12,
              happiness: 10,
              stress: -4,
              flag: { honestWorker: 1 },
              remember: { boss_gary: 'You told the truth on the application about why you left.' },
            },
          },
        ],
      },
      {
        text: 'Claim you were "part of a restructuring"',
        hint: 'Technically a category of thing that can happen',
        tag: 'safe',
        time: 2,
        outcomes: [
          {
            title: 'THE NEUTRAL PHRASE',
            body: `"My role was affected by a broader restructuring." This is the tofu of explanations: it takes on the flavour of whatever they want to hear.

They hear "laid off, not fired," they move on, and you get a job on a sentence that means nothing and hides everything.`,
            tone: 'neutral',
            fx: { career: 8, stress: 3, flag: { liedOnApplication: 1, lies: 1 } },
          },
        ],
      },
    ],
  },

  /* 9 ------------------------------------------------------------------- */
  {
    id: 'career_reorg',
    title: 'THERE IS A REORG',
    body: `An all-hands is called at 4:30 on a Friday, which is the corporate equivalent of a doctor saying "take a seat."

The company is "aligning around strategic priorities." There are new boxes on a slide. Your name is in one of the boxes. The box under you is currently occupied by {coworker}, who has not been told yet.`,
    art: 'office_reorg',
    cat: 'workplace',
    weight: 12,
    cooldown: 48,
    priority: 1,
    when: { career: { employed: true, level: [1, 9] }, age: [23, 58] },
    choices: [
      {
        text: 'Tell {coworker} before the email goes out',
        tag: 'kind',
        time: 1,
        outcomes: [
          {
            title: 'YOU WARNED HER',
            body: `You catch her at the lift. "They're moving you under me. The email is at five. I'm sorry." She goes through four expressions in two seconds and lands on something calm and terrible.

She thanks you. Then she goes to HR and asks a lot of extremely precise questions.`,
            tone: 'mixed',
            fx: {
              npc: { priya: 18 },
              reputation: 10,
              stress: 10,
              remember: { priya: 'You told her about the reorg before HR did.' },
            },
            delayed: [
              {
                inMonths: 9,
                chance: 0.5,
                title: 'SHE LEFT, AND TOOK THE TEAM',
                body: `{coworker} resigns, takes two key people with her, and tells every one of them exactly how she found out what was happening. Your warning becomes evidence of her integrity and, by implication, of the company's lack of it.

You get her vacancy. And her workload. And no headcount.`,
                tone: 'mixed',
                fx: { career: 6, stress: 18, jobPerf: -0.15, npc: { priya: 10 } },
              },
            ],
          },
        ],
      },
      {
        text: 'Say nothing and take the promotion',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU NOW HAVE A DIRECT REPORT',
            body: `The email goes out at 5:02. {coworker} reads it on her phone on the train and messages you two words: "congratulations, I guess."

Monday she is polite, punctual and utterly unreachable. She does exactly what is asked and not one thing more, forever.`,
            tone: 'mixed',
            fx: {
              career: 10,
              happiness: -6,
              stress: 14,
              npc: { priya: -22 },
              counter: { promotions: 1 },
              flag: { managedPriya: 1 },
              setCareer: { path: 'marketing', level: 2 },
            },
            delayed: [
              {
                inMonths: 15,
                chance: 0.5,
                title: 'THE EXIT INTERVIEW',
                body: `{coworker} leaves. Her exit interview with HR runs ninety minutes, which is ninety minutes longer than these things usually run.`,
                tone: 'bad',
                fx: { career: -6, reputation: -8, stress: 12, npc: { priya: -10 } },
              },
            ],
          },
        ],
      },
      {
        text: 'Apply for a different role in the new structure',
        hint: 'Lateral, safe-ish',
        tag: 'smart',
        time: 2,
        outcomes: [
          {
            title: 'YOU DUCKED THE WHOLE THING',
            body: `There is a role in a team nobody understands, reporting to someone in a different building. Nobody wants it. You take it.

It is quieter there. You learn a completely different set of skills and the org chart forgets about you in the way that org charts do — which is either career death or the best thing that ever happened to you.`,
            tone: 'mixed',
            fx: { career: 4, stress: -14, happiness: 8, jobPerf: 0.1, flag: { sideways: 1 } },
            delayed: [
              {
                inMonths: 20,
                chance: 0.5,
                title: 'THE CULT OF THE FORGOTTEN TEAM',
                body: `The team nobody understood turns out to be doing the work the whole company now needs. There are three of you. There is suddenly a budget.`,
                tone: 'good',
                fx: { career: 16, money: 4000, happiness: 10, flag: { darkHorse: 1 } },
              },
            ],
          },
        ],
      },
    ],
  },

  /* 10 ------------------------------------------------------------------ */
  {
    id: 'career_freelance_flirtation',
    title: 'EVERYONE ELSE SEEMS TO BE FREELANCE NOW',
    body: `Three people you used to work with have gone independent. They post about it at 11am on a Tuesday, from a café, with a laptop that is angled specifically to catch the light.

One of them just posted "booked out until March 😅" which is either true or the most successful lie in the industry.`,
    art: 'office_freelance',
    cat: 'career',
    weight: 12,
    cooldown: 42,
    when: { career: { employed: true }, stats: { stress: [40, 100] }, age: [23, 50] },
    choices: [
      {
        text: 'Go freelance. Fully. Hand in notice.',
        tag: 'bold',
        highRisk: true,
        time: 2,
        outcomes: [
          {
            title: 'YOU ARE NOW YOUR OWN BOSS',
            body: `You hand in your notice and immediately feel the specific dread of a person who has voluntarily removed the floor.

Week one: freedom. Week two: spreadsheets about the freedom. Week three: your first invoice, which you send with the emotional intensity of a marriage proposal.

The laptop-desk-in-a-café thing is real, and it is significantly colder than it looks.`,
            tone: 'chaos',
            fx: {
              career: 6,
              happiness: 10,
              stress: 16,
              reputation: 4,
              setCareer: { path: 'freelance', level: 0 },
              flag: { freelance: 1, employed: true },
              counter: { quitJobs: 1 },
              log: 'Went freelance',
            },
            delayed: [
              {
                inMonths: 4,
                chance: 0.6,
                title: 'A CLIENT PAYS LATE. VERY LATE.',
                body: `Invoice 004 is thirty-eight days overdue. You send a polite reminder, then a slightly less polite reminder, then a message that you rewrite four times to remove the word "please" entirely.`,
                tone: 'bad',
                fx: { money: -2200, stress: 18, happiness: -8 },
              },
              {
                inMonths: 22,
                chance: 0.5,
                title: 'REFERRALS COMPOUND',
                body: `Somebody recommends you to somebody who recommends you to somebody with an actual budget and a pathological dislike of agencies.`,
                tone: 'good',
                fx: { money: 8000, career: 8, happiness: 8, income: 900 },
              },
            ],
          },
        ],
      },
      {
        text: 'Do one freelance project on the side',
        hint: 'Test the water. Quietly.',
        tag: 'smart',
        time: 2,
        outcomes: [
          {
            title: 'A SMALL, NIGHTS-AND-WEEKENDS EXPERIMENT',
            body: `You take one project. It is a mistake to take it and you take it anyway. You do the work at 10pm on weeknights and most of two weekends.

The money is small and real. The confidence is large and slightly dangerous.`,
            tone: 'good',
            fx: { money: 1800, happiness: 5, stress: 10, career: 3, flag: { sideHustle: 1 } },
          },
        ],
      },
      {
        text: 'Stay put. Read their posts. Feel something.',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU SCROLLED FOR FORTY MINUTES',
            body: `You look at a photograph of a laptop on a wooden table beside a coffee that is definitely cold, and you feel a very specific combination of envy and relief.

Then you close the app, go back to your desk, and answer an email about a meeting about a document.`,
            tone: 'neutral',
            fx: { stress: 5, happiness: -3 },
          },
        ],
      },
    ],
  },

  /* 11 ------------------------------------------------------------------ */
  {
    id: 'career_dress_code',
    title: 'CASUAL FRIDAY WAS A TRAP',
    body: `The email said "casual Friday to celebrate the end of the quarter!" and you have taken it in the spirit in which it was written.

Two people are in corporate attire. One person appears to be in pyjama trousers of a formal cut. {boss} is wearing a polo shirt and looks like a man at gunpoint.`,
    art: 'office_dresscode',
    cat: 'workplace',
    weight: 7,
    cooldown: 60,
    when: { career: { employed: true } },
    choices: [
      {
        text: 'Own it completely',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU COMMITTED TO THE BIT',
            body: `You spend the entire day behaving as though this is the correct and only outfit, sitting in meetings with the serene confidence of a man who has never known doubt.

Two colleagues ask where you got it. One person takes a photograph, which will resurface in four years.`,
            tone: 'good',
            fx: { reputation: 8, happiness: 6, stress: 3, npc: { priya: 4 } },
          },
        ],
      },
      {
        text: 'Hide at your desk all day',
        tag: 'lazy',
        time: 1,
        outcomes: [
          {
            title: 'YOU BECAME FURNITURE',
            body: `You do not stand up between 9:14 and 15:40. You take lunch at your desk. You drink a coffee so slowly it becomes a personality.

It works. Nobody sees you. Nobody remembers you were there, which is both the win and the problem.`,
            tone: 'neutral',
            fx: { stress: -4, career: -1, jobPerf: -0.05 },
          },
        ],
      },
      {
        text: 'Go home "sick" and come back changed',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'A STRATEGIC WITHDRAWAL',
            body: `You tell {boss} you are not feeling well, which is true in a way that lawyers would enjoy.

You come back Monday in the most neutral outfit ever assembled by a human being. Grey, structurally unclear, inoffensive. You have learned something.`,
            tone: 'mixed',
            fx: { stress: -6, career: -2, npc: { boss_gary: -4 } },
          },
        ],
      },
    ],
  },

  /* 12 ------------------------------------------------------------------ */
  {
    id: 'career_mentor',
    title: 'SOMEONE SENIOR HAS TAKEN AN INTEREST',
    body: `A person two levels above you stops at your desk and says, "I read your thing. It was good. Do you have twenty minutes?"

They are not your manager. They have been at the company eleven years. Their calendar is a fortress and they have just opened a gate for you, for reasons that are currently unclear.`,
    art: 'office_mentor',
    cat: 'career',
    weight: 11,
    cooldown: 60,
    when: { career: { employed: true }, stats: { career: [30, 100] } },
    choices: [
      {
        text: 'Take the meeting. Be honest about what you want.',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU SAID WHAT YOU WANTED OUT LOUD',
            body: `You say "I want to be doing what you do in five years" and immediately want to crawl under the table.

They say "good, most people lie." Then they spend forty minutes telling you exactly what it costs.

It is not a promise. It is a door left unlocked.`,
            tone: 'good',
            fx: { career: 12, stress: 4, happiness: 6, flag: { mentor: 1 } },
            delayed: [
              {
                inMonths: 18,
                chance: 0.6,
                title: 'THEY PUT YOUR NAME FORWARD',
                body: `A role opens. It is not advertised. Your name is already in the conversation before you have heard the role exists, because someone with eleven years of capital spent a little of it on you.`,
                tone: 'good',
                fx: { career: 16, money: 2500, happiness: 12, counter: { promotions: 1 } },
              },
            ],
          },
        ],
      },
      {
        text: 'Take the meeting. Say the safe, impressive things.',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU WERE VERY IMPRESSIVE',
            body: `You say "I'm really focused on growing in this space" and "I'd love to understand how you think about leadership." Both sentences have been said before, many times, in this building.

They nod, say "well, keep doing what you're doing," and never book another one.`,
            tone: 'neutral',
            fx: { career: 4, npc: { boss_gary: 2 } },
          },
        ],
      },
      {
        text: 'Ask them to mentor you, formally, weekly',
        hint: 'Bold. Specific. Slightly terrifying.',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU ASKED FOR THE WHOLE THING',
            body: `You ask for a standing weekly slot. They laugh — the real one — and say "nobody has ever asked me that directly" and open their calendar.

Every other Thursday, 8:30am, for as long as it lasts. It is the single best hour of your working month and also the one you dread most, because they have no interest in being kind.`,
            tone: 'good',
            fx: { career: 15, stress: 8, happiness: 4, flag: { mentor: 1, mentorWeekly: 1 } },
            delayed: [
              {
                inMonths: 26,
                chance: 0.45,
                title: 'THEY LEAVE',
                body: `They take a role at a competitor. The calendar invite disappears from your schedule without a notification, which is the most honest thing that has ever happened to you.`,
                tone: 'bad',
                fx: { career: -6, happiness: -8, stress: 8 },
              },
            ],
          },
        ],
      },
    ],
  },

  /* 13 ------------------------------------------------------------------ */
  {
    id: 'career_crunch_weekend',
    title: 'IT IS SATURDAY AND THEY NEED YOU',
    body: `A message at 08:12: "Emergency — client has moved the review to Monday. Can you get the deck to a strong place by Sunday night? 🙏"

You had plans. Genuine plans. Booked plans.`,
    art: 'office_crunch',
    cat: 'workplace',
    weight: 14,
    cooldown: 18,
    when: { career: { employed: true } },
    choices: [
      {
        text: 'Cancel your plans and do it',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU WORKED THE WEEKEND. AGAIN.',
            body: `You cancel. You apologise to two people and lie to a third. You spend eleven hours on Saturday and nine on Sunday making a deck that will be shown for twenty-two minutes.

It is a genuinely good deck. {boss} says "incredible work" and does not mention compensation, and it does not occur to you to ask, and that is the actual story here.`,
            tone: 'mixed',
            fx: {
              career: 7,
              jobPerf: 0.2,
              stress: 14,
              happiness: -8,
              energy: -10,
              npc: { boss_gary: 8, jess: -6 },
              counter: { weekendWork: 1 },
            },
            delayed: [
              {
                inMonths: 5,
                chance: 0.55,
                title: 'IT IS NOW THE EXPECTATION',
                body: `Nobody agreed to anything. It simply became true that you are the person who does this, and so you will now be asked, and if you refuse it will be a change in you rather than a change in circumstances.`,
                tone: 'bad',
                fx: { stress: 12, happiness: -6 },
              },
            ],
          },
        ],
      },
      {
        text: 'Say no. You have plans.',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: '"I\'M NOT AVAILABLE THIS WEEKEND"',
            body: `You send it without a paragraph of explanation, which is the hard part. No "so sorry", no "unless it's really needed."

The reply is "no problem! enjoy 😊" and it is fine, and it was always going to be fine, and you have spent two years believing otherwise.`,
            tone: 'good',
            fx: {
              stress: -12,
              happiness: 12,
              energy: 8,
              career: -3,
              npc: { boss_gary: -2, jess: 8 },
              flag: { setBoundary: 1 },
              counter: { boundaries: 1 },
            },
          },
        ],
      },
      {
        text: 'Say yes, then do ninety minutes and send it',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU SENT SOMETHING. IT HAD WORDS ON IT.',
            body: `This deck is not to a strong place. This deck is to a place that exists, contains the client's name spelled correctly, and has no empty slides.

Monday's review goes fine because the client also did not prepare. Nobody ever knows the difference. You have learned the most valuable lesson in white-collar work.`,
            tone: 'good',
            fx: { career: 3, stress: 2, jobPerf: 0.05, happiness: 4, flag: { learnedTheLesson: 1 } },
          },
        ],
      },
      {
        text: 'Ignore the message until Monday',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'READ 08:12. REPLIED: NEVER.',
            body: `You put the phone face down and go and have the weekend you planned, with a small cold stone in your chest the entire time.

Monday 9am you walk in with a coffee. {boss} is at your desk. So is the client. So is a conversation that takes eleven minutes and will be remembered for two years.`,
            tone: 'chaos',
            fx: {
              career: -12,
              reputation: -14,
              stress: 20,
              happiness: 4,
              npc: { boss_gary: -18, jess: 10 },
              counter: { chaos: 1 },
            },
          },
        ],
      },
    ],
  },

  /* 14 ------------------------------------------------------------------ */
  {
    id: 'career_glassdoor_rant',
    title: 'THE REVIEW SITE IS RIGHT THERE',
    body: `Your company has a 2.4 out of 5 and the most recent review says "management is a rumour" which, honestly.

You have a login. You have nine years of material. You have a cursor blinking in a text box labelled "Your review."`,
    art: 'office_laptop',
    cat: 'workplace',
    weight: 9,
    cooldown: 60,
    when: { career: { employed: true }, stats: { stress: [45, 100] } },
    choices: [
      {
        text: 'Write the full, detailed, devastating review',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'NINE HUNDRED WORDS, NO REGRETS',
            body: `You use headers. You use specific examples. You use the phrase "institutional cowardice" and then you sit back and feel the specific joy of a person who has absolutely done something they should not have done.

It gets four thousand views. It is quoted on a forum. Somebody prints it and leaves it in the second-floor kitchenette.`,
            tone: 'chaos',
            fx: { happiness: 14, stress: -8, reputation: -6, counter: { chaos: 1 }, flag: { wroteReview: 1 } },
            delayed: [
              {
                inMonths: 5,
                chance: 0.45,
                title: 'THE PHRASE WAS VERY SPECIFIC',
                body: `"Institutional cowardice" is a phrase that appears in exactly one document accessible to exactly one group of people. It is a lot of words, but not enough.`,
                tone: 'bad',
                art: 'office_hr',
                fx: { stress: 18, npc: { boss_gary: -14 }, career: -8 },
                queue: [{ id: 'chain_hr_investigation', inMonths: 2 }],
              },
            ],
          },
        ],
      },
      {
        text: 'Write a fair, balanced review',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'THREE STARS. GENUINELY FAIR.',
            body: `You write that the work is interesting, the people are decent, and the pay is below market. You note that management is "well-meaning but stretched."

You post it. You feel like a journalist. The company's score stays at 2.4 because it takes more than one honest person.`,
            tone: 'good',
            fx: { happiness: 5, stress: -3, reputation: 3 },
          },
        ],
      },
      {
        text: 'Close the tab. Make tea. Continue.',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'THE TEA WAS GOOD',
            body: `You close the tab and make tea in the office kitchen next to a man microwaving fish, which is a whole separate document you could write.

Nothing changes. Nothing ever changes. That is, in its own way, a kind of stability.`,
            tone: 'neutral',
            fx: { stress: 2, happiness: -2 },
          },
        ],
      },
    ],
  },

  /* 15 ------------------------------------------------------------------ */
  {
    id: 'career_sideways_industry',
    title: 'SOMEONE THINKS YOU COULD DO A COMPLETELY DIFFERENT JOB',
    body: `Your {friend} sets you up with a contact in a field you have never worked in. The contact, to your genuine surprise, is interested.

"You'd be good at this," they say, "you've got the head for it." They explain the role. It is entirely unlike anything you have done and pays approximately the same.

You have worked very hard to be good at your current, wrong job.`,
    art: 'office_coffee_meet',
    cat: 'career',
    weight: 10,
    cooldown: 60,
    when: { career: { employed: true }, age: [25, 48], npc: { jess: [35, 100] } },
    choices: [
      {
        text: 'Retrain. Take the pay cut. Start over.',
        tag: 'bold',
        highRisk: true,
        time: 6,
        outcomes: [
          {
            title: 'YOU STARTED AGAIN AT THE BOTTOM',
            body: `Six months of evening coursework and a probationary salary that requires you to say the words "that's fine, it's an investment" out loud, to yourself, in the mirror.

You are the dumbest person in every meeting for the first four months. It is the best you have felt in years.`,
            tone: 'good',
            fx: {
              career: 4,
              money: -3500,
              happiness: 14,
              stress: 16,
              reputation: 6,
              setCareer: { path: 'technology', level: 0 },
              flag: { retrained: 1 },
              counter: { careerChanges: 1 },
              log: 'Changed careers entirely',
            },
            delayed: [
              {
                inMonths: 18,
                chance: 0.6,
                title: 'THE CURVE FLATTENS AND RISES',
                body: `You realise you have stopped being the person who asks the obvious question and become the person who answers it. Someone asks you for help. You help them. It is extraordinary.`,
                tone: 'good',
                fx: { career: 18, money: 2500, happiness: 10, jobPerf: 0.2 },
              },
            ],
          },
        ],
      },
      {
        text: 'Keep the job, do the retraining at night, decide later',
        tag: 'smart',
        time: 4,
        outcomes: [
          {
            title: 'YOU ARE DOING BOTH AND IT IS A LOT',
            body: `Nights and weekends. You are tired in a way that is different from work-tired: this tiredness has a direction.

You do not yet know if it will work. You only know that you have not been able to stop thinking about it, which is more than you can say for anything else in your life.`,
            tone: 'good',
            fx: { career: 6, stress: 18, happiness: 6, energy: -10, flag: { hedging: 1 } },
            delayed: [
              {
                inMonths: 12,
                chance: 0.55,
                title: 'you finish it. then what?',
                body: `The course ends. You have a certificate and a decision. The certificate is in a drawer within a week, which tells you something about yourself.`,
                tone: 'mixed',
                fx: { career: 6, happiness: 4 },
                queue: [{ id: 'career_sideways_industry_2', inMonths: 0 }],
              },
            ],
          },
        ],
      },
      {
        text: 'Say no. This is your life. You have built it.',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU SAID NO',
            body: `You do it cleanly and without drama. "I appreciate it, genuinely, but that's not the move for me right now."

You mean it. For about a year. Then, at some point, a thought arrives without warning and you do not get to choose whether to have it.`,
            tone: 'neutral',
            fx: { stress: -4, happiness: 2, flag: { refusedPivot: 1 } },
          },
        ],
      },
    ],
  },

  /* 16 ------------------------------------------------------------------ */
  {
    id: 'career_office_romance',
    title: 'THIS IS A BAD IDEA AND YOU BOTH KNOW IT',
    body: `{coworker} has stayed late. You have stayed late. The office at 19:40 has a specific intimacy that has ruined thousands of professional relationships and one or two marriages.

"One drink?" she says, and it is not a question about drinks.`,
    art: 'office_late',
    cat: 'romance',
    weight: 9,
    cooldown: 60,
    when: { career: { employed: true }, partner: ['single', 'dating'], age: [22, 45] },
    choices: [
      {
        text: 'One drink. Just one.',
        tag: 'risky',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'IT WAS NOT ONE DRINK',
            body: `It was four drinks and eleven years of context and a walk that went the long way round for no reason either of you will admit to.

In the morning you have two problems: the professional one, which is significant, and the other one, which is that you actually like her.`,
            tone: 'mixed',
            fx: {
              happiness: 12,
              stress: 16,
              npc: { priya: 20, boss_gary: 0 },
              flag: { officeRomance: 1 },
              remember: { priya: 'Something started in the office at 19:40. Neither of you mentioned it again for a while.' },
            },
            delayed: [
              {
                inMonths: 4,
                chance: 0.6,
                title: 'SOMEONE NOTICED THE LIFT',
                body: `An entirely harmless moment in a lift, witnessed by a person with no context and excellent timing. By Thursday there is a version of events circulating that is not accurate but is not flattering either.`,
                tone: 'bad',
                art: 'office_hr',
                fx: { reputation: -12, stress: 18, npc: { priya: -6 } },
                queue: [{ id: 'chain_hr_investigation', inMonths: 2 }],
              },
              {
                inMonths: 10,
                chance: 0.35,
                title: 'IT BECAME REAL',
                body: `Somewhere between a project and a hospital visit and a very long phone call, it stopped being a bad idea and started being a relationship.`,
                tone: 'good',
                fx: { happiness: 16, npc: { priya: 20 }, setPartner: { npcId: 'priya', status: 'dating' } },
              },
            ],
          },
        ],
      },
      {
        text: 'Decline. You like your job.',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: '"I SHOULD GET HOME"',
            body: `You say it kindly. She nods, and the not-asking becomes an established fact between you, and by Monday it is simply part of the architecture, like the lift.

Work stays easy. Something else does not.`,
            tone: 'neutral',
            fx: { stress: -6, happiness: -4, career: 3, npc: { priya: -4 } },
          },
        ],
      },
      {
        text: 'Be honest: "I think that is a terrible idea and I want to anyway."',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'AT LEAST EVERYONE WAS INFORMED',
            body: `You say the true thing out loud, which nobody expects and which changes the entire shape of the evening. She laughs — properly, the real laugh — and says "at least one of us is honest."

What happens next is complicated and entirely deliberate.`,
            tone: 'mixed',
            fx: {
              happiness: 14,
              stress: 12,
              npc: { priya: 24 },
              reputation: 4,
              flag: { officeRomance: 1, honestHeart: 1 },
              setPartner: { npcId: 'priya', status: 'dating' },
            },
            delayed: [
              {
                inMonths: 7,
                chance: 0.5,
                title: 'HR HAS A POLICY ABOUT THIS',
                body: `There is a form. There is a meeting about the form. There is a person whose entire job is the form.`,
                tone: 'mixed',
                fx: { stress: 12, reputation: -4, happiness: 4 },
              },
            ],
          },
        ],
      },
    ],
  },

  /* 17 ------------------------------------------------------------------ */
  {
    id: 'career_layoff_survivor',
    title: 'THEY CUT YOUR TEAM AND KEPT YOU',
    body: `Eleven people walked out of this building this morning carrying identical boxes, and you are not one of them.

Your workload is now four people's. Your manager keeps saying "we're doing everything we can." The kettle has been boiled by someone who will never boil it again.`,
    art: 'office_layoff',
    cat: 'workplace',
    weight: 14,
    cooldown: 40,
    priority: 1,
    when: { stats: { stress: [45, 100] }, career: { employed: true }, age: [23, 60] },
    choices: [
      {
        text: 'Ask directly if your job is safe',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: '"I CAN\'T PROMISE YOU ANYTHING"',
            body: `{boss} says it with real pain, which is the worst possible answer because it is honest.

You now know something that other people do not, and it sits in your chest like a swallowed coin.`,
            tone: 'mixed',
            fx: { stress: 18, happiness: -6, npc: { boss_gary: 6 }, flag: { knowsUnstable: 1 } },
            delayed: [
              {
                inMonths: 3,
                chance: 0.55,
                title: 'IT WAS NOT SAFE',
                body: `The next round is smaller and more surgical, and you were right to be worried, and being right is worth nothing at all.`,
                tone: 'bad',
                fx: { stress: 16, happiness: -10 },
                queue: [{ id: 'chain_layoff', inMonths: 1 }],
              },
            ],
          },
        ],
      },
      {
        text: 'Absorb the work and become indispensable',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU BECAME LOAD-BEARING',
            body: `You take on the work of three people who no longer exist and you do it well, because that is what you do.

You are now structurally impossible to fire. You are also structurally impossible to promote, because promoting you would expose how much of the building is currently resting on you.`,
            tone: 'mixed',
            fx: {
              career: 8,
              stress: 24,
              jobPerf: 0.25,
              health: -8,
              npc: { boss_gary: 10 },
              flag: { loadBearing: 1 },
            },
            delayed: [
              {
                inMonths: 9,
                chance: 0.5,
                title: 'NOBODY THANKED YOU',
                body: `The quarter closes well. There is a company-wide email about resilience. There is a team lunch. There is no money and no title and no mention of the fact that you have been doing four jobs since March.`,
                tone: 'bad',
                fx: { stress: 16, happiness: -14, career: -2 },
              },
            ],
          },
        ],
      },
      {
        text: 'Start looking, that day, quietly',
        tag: 'smart',
        time: 1,
        outcomes: [
          {
            title: 'YOU UPDATED THE CV AT 11AM',
            body: `You do it on your phone in a stairwell. It takes forty minutes and feels like learning a language you used to speak.

Nothing happens today. Something has started, which is the point.`,
            tone: 'good',
            fx: { stress: -4, career: 4, flag: { jobHunting: 1 }, jobPerf: -0.05 },
            delayed: [
              {
                inMonths: 4,
                chance: 0.6,
                title: 'A RECRUITER, PROPERLY THIS TIME',
                body: `Not the Quiverr sort. A real one, from a real firm, with a real brief. Someone you have never met needs someone who does exactly what you do.`,
                tone: 'good',
                fx: { career: 10, happiness: 8 },
                queue: [{ id: 'career_poach_offer', inMonths: 0 }],
              },
            ],
          },
        ],
      },
      {
        text: 'Volunteer for the redundancy package',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'YOU PUT YOUR HAND UP',
            body: `Everyone else is braced for the letter and you walk into HR and ask for it. The HR person actually checks whether you are joking, twice.

The package is real money. The silence afterwards is real too.`,
            tone: 'chaos',
            fx: {
              money: 11000,
              career: -14,
              stress: -18,
              happiness: 10,
              reputation: -4,
              setCareer: null,
              flag: { tookPackage: 1, employed: false },
              counter: { quitJobs: 1 },
              log: 'Took the voluntary package',
            },
          },
        ],
      },
    ],
  },

  /* 18 ------------------------------------------------------------------ */
  {
    id: 'career_sideways_industry_2',
    title: 'THE DECISION YOU PUT IN A DRAWER',
    body: `It is a Tuesday. You are doing your actual job and it is fine and then, without warning, you think about it again.

You have a certificate in a drawer and a decision you have been not-making for a year.`,
    art: 'office_stare',
    cat: 'career',
    weight: 0,
    cooldown: 999,
    when: { has: ['hedging'] },
    choices: [
      {
        text: 'Commit. Hand in notice. Now.',
        tag: 'bold',
        highRisk: true,
        time: 3,
        outcomes: [
          {
            title: 'YOU DID IT ON A TUESDAY',
            body: `The anti-climax is the strange part. You expected a montage; you got an email to HR and a laminated badge to hand back.

You are going to be bad at this for eighteen months. You already know that, and you have decided to enjoy it.`,
            tone: 'good',
            fx: {
              career: 8,
              money: -2000,
              happiness: 16,
              stress: 14,
              setCareer: { path: 'technology', level: 0 },
              flag: { retrained: 1, employed: true },
              counter: { careerChanges: 1 },
            },
          },
        ],
      },
      {
        text: 'Leave it in the drawer',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'THE DRAWER CLOSES',
            body: `You put it back. Not dramatically — you just stop thinking about it the way you stop thinking about any number.

It will come back every so often, on quiet Tuesdays, for the rest of your life.`,
            tone: 'neutral',
            fx: { happiness: -4, stress: -2, flag: { drawerClosed: 1 } },
          },
        ],
      },
    ],
  },

  /* 19 ------------------------------------------------------------------ */
  {
    id: 'career_annual_review',
    title: 'ANNUAL REVIEW SEASON',
    body: `You are asked to complete a self-assessment, providing "evidence of impact" and "examples of exceeding expectations", in a form that will be skimmed by a person who has never seen your work.

There is a box labelled "achievements this period" and it is 400 characters.`,
    art: 'office_review',
    cat: 'workplace',
    weight: 10,
    cooldown: 36,
    when: { career: { employed: true } },
    choices: [
      {
        text: 'Honest, modest, accurate self-assessment',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: 'YOU WROTE THE TRUTH, MODESTLY',
            body: `Four hundred characters later you have listed genuine contributions in language so understated it reads as a confession.

You get "meets expectations" and a 1.8% increase, which is a pay cut in real terms, and everybody knows this, and everybody calls it a raise.`,
            tone: 'bad',
            fx: { career: 2, happiness: -6, stress: 5, money: 240 },
          },
        ],
      },
      {
        text: 'Aggressively reframe everything as a victory',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU TURNED AN EMAIL INTO A PROGRAMME',
            body: `You did not run a project. You "led a cross-functional initiative." You did not attend a meeting. You "drove stakeholder alignment across three departments."

It is nonsense and it is precisely the nonsense being asked for. The reviewer reads it, ticks the top box, and gives you "exceeds expectations."`,
            tone: 'good',
            fx: { career: 8, money: 1800, happiness: 4, reputation: -3, stress: -2 },
            delayed: [
              {
                inMonths: 8,
                chance: 0.4,
                title: 'THEY REMEMBERED THE WORD "LED"',
                body: `You are now "the person who led that thing" and you will be asked about it, in detail, by a new director, in a room, on the record.`,
                tone: 'mixed',
                fx: { stress: 14, career: 2 },
              },
            ],
          },
        ],
      },
      {
        text: 'Say exactly what you think, in writing',
        tag: 'chaotic',
        highRisk: true,
        time: 1,
        outcomes: [
          {
            title: 'FOUR HUNDRED CHARACTERS OF HONESTY',
            body: `"I have exceeded expectations in the areas of absorbing redundancies, managing upwards and not saying the true thing in meetings."

Your manager reads it. Twice. Then books a meeting with you that is not about your performance.`,
            tone: 'chaos',
            fx: { happiness: 12, stress: 10, reputation: -6, npc: { boss_gary: -6 }, counter: { chaos: 1 } },
          },
        ],
      },
    ],
  },

  /* 20 ------------------------------------------------------------------ */
  {
    id: 'career_consultant_visit',
    title: 'THEY HAVE HIRED A CONSULTANCY',
    body: `Four people in excellent shoes are walking the floor with clipboards and asking questions in a tone of warm, forensic interest.

They are here "to understand the business." Everyone knows this means "to recommend redundancies while also charging for the recommendation."`,
    art: 'office_consultants',
    cat: 'workplace',
    weight: 10,
    cooldown: 48,
    when: { career: { employed: true, level: [0, 9] }, age: [24, 58] },
    choices: [
      {
        text: 'Tell them exactly what is wrong',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU GAVE THEM THE WHOLE MAP',
            body: `Forty minutes. No filter. You name the duplicated teams, the process nobody uses, the manager whose whole function is a weekly email.

They write it all down. They thank you warmly. They send a version of your own analysis back to the company for a fee with your name nowhere on it.`,
            tone: 'mixed',
            fx: { career: 6, reputation: 6, stress: 8, flag: { toldConsultants: 1 }, counter: { chaos: 0 } },
            delayed: [
              {
                inMonths: 5,
                chance: 0.5,
                title: 'THEIR RECOMMENDATION INCLUDED YOUR TEAM',
                body: `The report recommends consolidating the function you described in such helpful detail. You have just optimised your own department out of existence.`,
                tone: 'bad',
                fx: { stress: 20, career: -8, flag: { layoffRisk: 1 } },
                queue: [{ id: 'chain_layoff', inMonths: 4 }],
              },
            ],
          },
        ],
      },
      {
        text: 'Tell them the company is doing great',
        tag: 'safe',
        time: 1,
        outcomes: [
          {
            title: '"HONESTLY? IT RUNS WELL."',
            body: `You give them nothing. They are visibly disappointed, which is enormously satisfying, and then they talk to the man who has been complaining about his keyboard for four years and get seventeen pages.`,
            tone: 'neutral',
            fx: { stress: -2, reputation: 2 },
          },
        ],
      },
      {
        text: 'Ask them for a job instead',
        tag: 'bold',
        time: 1,
        outcomes: [
          {
            title: 'YOU NETWORKED AT THE LAYOFF PARTY',
            body: `You talk to the senior one for twenty minutes about the industry, the work, and what it pays. Not a job. Not yet. But there is a card, and the card is real.

"It's a brutal job," she says. "You'd probably like it."`,
            tone: 'good',
            fx: { career: 6, happiness: 4, flag: { consultantContact: 1 } },
            delayed: [
              {
                inMonths: 14,
                chance: 0.4,
                title: 'THE CARD IN YOUR WALLET',
                body: `An email. The exact role, the exact team, a number that is genuinely difficult to say no to.`,
                tone: 'good',
                fx: { career: 18, money: 6000, happiness: 6 },
              },
            ],
          },
        ],
      },
    ],
  },
];
