// The Alignment Audit: question set.
// Copied word for word from the Claude Doc "The Alignment Audit: Question Set"
// (1 November 2026). Never rewrite or paraphrase this copy here; change it in
// the doc first, with Laura's approval, then copy it across.
//
// Question ids are stable and are the keys in AuditResponse.answers:
// q1 to q59 for the shared parts, b1 to b14 and c1 to c13 for the track
// modules. "track" limits a question to one track. "type" picks the field:
//   text      a text field that grows as she types
//   facts     Q2 or Q3: short fields, some reused from her profile
//   sliders2  Q5: two sliders, 1 to 10
//   multi     tick any that apply (optional "other" text)
//   leakmap   Q18: one slider per area, -5 to +5, or "Doesn't apply"
//   hours     Q21: number fields, hours
//   lists2    Q23: two lists she can add rows to
//   rows5     one score per line, 1 to 5
//   single    pick one
//   readiness Q54: a 1 to 10 scale plus two text fields
//
// "carry" names the Starting Point Profile answers shown as a quote above
// the question (see SPP_CARRY below).

export const AUDIT_VERSION = "2026-11-01";

export const BEFORE_YOU_BEGIN = {
  title: "Before you begin",
  intro: "This audit reads your work and the woman doing it. You can't fix one while the other is leaking, so both are in here.",
  bullets: [
    "Answer with the true version. Not the one you'd give at a dinner party.",
    "Write the way you talk. One line is fine if one line is the answer.",
    "One question asks you to look at last week's calendar. Do it. Your memory is kind to you. Your calendar isn't.",
    "If a question feels too heavy to write down, skip it. We can talk about it on the call, or not at all.",
    "Give yourself about 90 minutes. You can save and come back.",
    "This is a coaching tool. It isn't therapy or a medical assessment. If something here brings up more than you expected, stop and talk to someone you trust.",
    // The doc adds "[Confirm storage and retention wording before launch.]"
    // after this line. That note is for Laura and is not shown.
    "Only I read your answers, and they're used for your diagnostic and nothing else.",
  ],
  promise: "Within five business days of submitting, you get a written diagnostic: where you actually are, the pattern holding you back, and the move I'd make next. Then we go through it together on a one-hour call.",
  tickLead: "Before you start, tick to agree:",
};

// The exact wording she agrees to. Stored with her answers when she ticks.
// The doc ends it with "[Link to full terms and privacy policy.]"; the page
// renders that as a link to TERMS_URL until Laura's full page exists.
export const AGREEMENT_TEXT = "I understand this audit is a coaching tool. It isn't therapy, medical advice or a diagnosis. I agree to Laura Jane Thomas collecting and using my answers, including anything I share about my health, to prepare my diagnostic. I know I can skip any question.";
export const TERMS_LABEL = "Read the full terms and privacy policy.";
export const TERMS_URL = "/terms-and-conditions";

export const TRACK_SCREEN = {
  title: "Start here: which one is you?",
  options: [
    { value: "business", label: "I run a business", sub: "Founders, owners and freelancers. Idea stage through to established." },
    { value: "career", label: "I have a career", sub: "Employed, between roles, or working out your next move." },
  ],
  note: "A few questions change depending on your answer. Most stay the same, because you're the same woman either way.",
};

export const BUSINESS_STAGES = [
  { value: "idea", label: "Idea" },
  { value: "just_started", label: "Just started" },
  { value: "growing", label: "Growing" },
  { value: "stuck", label: "Stuck" },
  { value: "rebuilding", label: "Rebuilding" },
];

export const LEAK_AREAS = [
  { id: "sleep", label: "Sleep" },
  { id: "body", label: "My body and health" },
  { id: "food", label: "Food and movement" },
  { id: "money", label: "Money" },
  { id: "partner", label: "My partner, or being single" },
  { id: "children", label: "Children, or caring for someone" },
  { id: "family", label: "My parents and family" },
  { id: "friends", label: "Friendships" },
  { id: "home", label: "My home" },
  { id: "work", label: "The work itself" },
  { id: "people", label: "The people I work with or for" },
  { id: "schedule", label: "My schedule" },
  { id: "phone", label: "My phone" },
  { id: "voice", label: "The voice in my head" },
];

export const TIME_RECEIPT = [
  { id: "paid", label: "Paid work" },
  { id: "unpaid", label: "Unpaid work for other people" },
  { id: "admin", label: "Admin" },
  { id: "body", label: "Your body" },
  { id: "love", label: "The people you love" },
  { id: "nothing", label: "Nothing at all" },
];

export const INVISIBLE_LOAD = [
  { id: "smooth", label: "I smooth over tension between other people, even when I didn't cause it" },
  { id: "replay", label: "I replay conversations in my head long after they've ended" },
  { id: "holdback", label: "I hold back what I really think so things stay easy" },
  { id: "fix", label: "When someone close to me is upset, I feel it's my job to fix it" },
  { id: "carry", label: "I walk away from other people's stress carrying it as my own" },
  { id: "boundary", label: "Holding a boundary takes real effort, and I often give in" },
  { id: "moods", label: "I plan around other people's moods before they've even shown up" },
  { id: "drained", label: "I feel drained after time with people, even when it went well" },
];

export const STATES = [
  { id: "settled", label: "Settled, safe, like myself" },
  { id: "wired", label: "Wired, busy, on edge" },
  { id: "flat", label: "Flat, foggy, switched off" },
  { id: "swinging", label: "Swinging between the two without warning" },
];

export const BURNOUT_STAGES = [
  { value: "1", label: "Stretched but coping. Sleep still fixes it." },
  { value: "2", label: "Running on reserves. I wake up tired and lean on caffeine." },
  { value: "3", label: "Wired but tired. My body doesn't switch off anymore." },
  { value: "4", label: "My body is showing it: headaches, gut, skin or cycle changes. I push, then crash." },
  { value: "5", label: "Shut down. Everything feels heavy, and my body has made the stop for me." },
];

export const LOCKED_AREAS = [
  { value: "work", label: "work" },
  { value: "money", label: "money" },
  { value: "body", label: "my body" },
  { value: "relationship", label: "my relationship" },
  { value: "family", label: "family" },
  { value: "friendships", label: "friendships" },
  { value: "other", label: "something else" },
];

export const MEETING_BEHAVIOURS = [
  { value: "over_explain", label: "Over-explain." },
  { value: "apologise", label: "Apologise before making your point." },
  { value: "questions", label: "Turn statements into questions." },
  { value: "quiet", label: "Stay quiet when you know the answer." },
  { value: "push", label: "Push harder than the moment needs." },
];

// Parts in screen order. The track module sits between Part 7 and Part 8.
export const PARTS = [
  {
    id: "p1",
    title: "Part 1: Where you are right now",
    intro: "The facts first, so the rest has context.",
    questions: [
      { id: "q1", n: "1", type: "text", text: "In a few sentences, where are you right now? Say it the way you'd say it to a close friend, not a recruiter." },
      {
        id: "q2", n: "2", track: "business", type: "facts",
        text: "What's the business, how long have you been running it, and what stage is it at? (Idea, just started, growing, stuck, rebuilding.)",
        fields: [
          { key: "what", label: "The business", profile: "role_or_business" },
          { key: "how_long", label: "How long" },
          { key: "stage", label: "Stage", profile: "stage", options: "BUSINESS_STAGES" },
        ],
      },
      {
        id: "q3", n: "3", track: "career", type: "facts",
        text: "What's your role, how long have you been in it, and what industry are you in?",
        fields: [
          { key: "role", label: "Role", profile: "role_or_business" },
          { key: "how_long", label: "How long", profile: "stage" },
          { key: "industry", label: "Industry", profile: "industry" },
        ],
      },
      { id: "q4", n: "4", type: "text", text: "What happened in the last month or two that made you book this now?" },
      {
        id: "q5", n: "5", type: "sliders2",
        text: "Two sliders, 1 to 10. How right does your life look from the outside? How right does it feel from the inside?",
        sliders: [
          { key: "outside", label: "How right does your life look from the outside?" },
          { key: "inside", label: "How right does it feel from the inside?" },
        ],
      },
      { id: "q6", n: "6", type: "text", text: "If nothing changes in the next 12 months, what happens? Be specific. What gets worse, and what do you lose?" },
      { id: "q7", n: "7", type: "text", text: "What have you already tried to change this? What helped for a while, and what didn't work at all?" },
    ],
  },
  {
    id: "p2",
    title: "Part 2: Awareness. What you're not seeing",
    intro: "A blind spot doesn't show up when you ask about it directly. These come at it sideways.",
    questions: [
      { id: "q8", n: "8", type: "text", text: "What are you waiting to sort out \"once things calm down\"? How long have you been telling yourself you just need to get through this stretch? Has the stretch turned into years?" },
      { id: "q9", n: "9", type: "text", carry: "q9", text: "What conversation have you been avoiding? Who is it with?" },
      { id: "q10", n: "10", type: "text", text: "What do the people closest to you keep telling you that you brush off? Now write two lines in your best friend's voice: \"What's really going on with her is...\"" },
      { id: "q11", n: "11", type: "text", text: "Which decision have you made in your head more than once, and still not acted on?" },
      { id: "q12", n: "12", type: "text", text: "Where do you say yes when you mean no? Give me the most recent example, not the general habit." },
      { id: "q13", n: "13", type: "text", text: "What do you complain about most? Think about what comes up when you're venting to a friend, or going over it in your own head at night." },
      { id: "q14", n: "14", type: "text", text: "Now take that same complaint and look at what you do that keeps it going. This isn't about blame. Most of what we complain about survives because we keep making room for it. We say yes when we could say no, or we fix it ourselves instead of having the hard conversation. What's your version here, and what would change if you stopped doing it?" },
      { id: "q15", n: "15", type: "text", text: "What are you calling \"fine\" that isn't?" },
      { id: "q16", n: "16", type: "text", text: "When did you last feel completely like yourself? Where were you and what were you doing?" },
      { id: "q17", n: "17", type: "multi", options: "LOCKED_AREAS", text: "Is there an area you'd rather I didn't ask about? You don't need to say what it is. Just tick where it lives: work, money, my body, my relationship, family, friendships, something else." },
    ],
  },
  {
    id: "p3",
    title: "Part 3: The Energy Leak Map",
    intro: "This is where most of the diagnostic comes from. Don't rate how happy you are with each area. Rate what it does to your energy right now.",
    questions: [
      { id: "q18", n: "18", type: "leakmap", text: "Score each area from -5 (it drains me most days) to +5 (it fills me up). 0 is neutral. Leave out anything that doesn't apply." },
      { id: "q19", n: "19", type: "text", text: "Look at your lowest score. What's actually happening there? Describe a bad day in that area." },
      { id: "q20", n: "20", type: "text", text: "Look at your highest score. What makes it work? How much of your week does it get?" },
      { id: "q21", n: "21", type: "hours", lead: "The time receipt.", text: "Open your calendar for last week. Roughly how many hours went to: paid work, unpaid work for other people, admin, your body, the people you love, and nothing at all?" },
      { id: "q22", n: "22", type: "text", carry: "q22", lead: "The spending pattern.", text: "Think back over the last month. What did you spend on that you didn't need, and what were you trying to feel at the time? No amounts or details. Just the pattern." },
      {
        id: "q23", n: "23", type: "lists2", lead: "Your stress bucket.",
        text: "Make two lists. First, everything filling your bucket right now, including the things you've decided are \"just part of it\". Be specific: not \"work\" but \"the 7am Monday meeting\". Second, everything that empties it. Scrolling and wine don't count.",
        lists: [
          { key: "filling", label: "First: what's filling it" },
          { key: "emptying", label: "Second: what empties it" },
        ],
      },
      { id: "q24", n: "24", type: "text", text: "Who do you feel more tired after seeing? You don't need to name them. What happens in those conversations?" },
      { id: "q25", n: "25", type: "rows5", rows: "INVISIBLE_LOAD", lead: "The invisible load.", text: "Score each line from 1 (rarely) to 5 (almost always).", lowLabel: "Rarely", highLabel: "Almost always" },
      { id: "q26", n: "26", type: "text", text: "What time of day do you crash? What do you reach for when it happens? Coffee, sugar, wine, your phone, a nap, pushing through?" },
    ],
  },
  {
    id: "p4",
    title: "Part 4: Liberation. What you're carrying",
    intro: "Some of what's heavy was never yours to carry.",
    questions: [
      { id: "q27", n: "27", type: "text", text: "What are you still doing out of guilt or obligation? A role, a client, a promise, a habit. Which of those would you stop tomorrow if nobody would be disappointed?" },
      { id: "q28", n: "28", type: "text", text: "Whose approval are you still working for? It could be someone who isn't in your life anymore." },
      { id: "q29", n: "29", type: "text", text: "What rule did you grow up with about money, work or being a woman that still runs you? Do you actually agree with it?" },
      { id: "q30", n: "30", type: "text", text: "Finish this sentence without thinking too hard: \"Good women don't...\"" },
      { id: "q31", n: "31", type: "text", text: "Pick the habit you most want to drop. Overworking, over-explaining, staying quiet, whatever yours is. What is it protecting you from?" },
      { id: "q32", n: "32", type: "text", text: "What are you scared would happen if you fully rested for two weeks?" },
      { id: "q33", n: "33", type: "text", carry: "q33", text: "Which story about yourself are you tired of telling?" },
    ],
  },
  {
    id: "p5",
    title: "Part 5: Intention. What you actually want",
    intro: "",
    questions: [
      { id: "q34", n: "34", type: "text", text: "What do you want? Write the answer you'd give if nobody was ever going to read it." },
      { id: "q35", n: "35", type: "text", text: "Now, what do you think you should want? Whose voice is that?", em: "should" },
      { id: "q36", n: "36", type: "text", text: "You get one priority for the next six months and everything else is allowed to slide. What is it?" },
      { id: "q37", n: "37", type: "text", text: "What are you willing to give up to get it? What will you not give up, no matter what?" },
      { id: "q38", n: "38", type: "text", text: "What's in the way of that priority? List it all, then mark each one: a real constraint, or a fear dressed up as a fact." },
      { id: "q39", n: "39", type: "text", text: "How do you make big decisions right now? Gut, research, asking several people before you trust yourself, or waiting until it's forced on you? How is that working?" },
      { id: "q40", n: "40", type: "text", text: "Think of a recent decision you handed to someone else. How did it turn out, and how did you feel about yourself afterwards?" },
      { id: "q41", n: "41", type: "text", text: "What are you good at that drains you? What are you good at that gives you energy back? Roughly how much of your week goes to each?" },
    ],
  },
  {
    id: "p6",
    title: "Part 6: Vision. Where you're heading",
    intro: "",
    questions: [
      { id: "q42", n: "42", type: "text", text: "It's three years from now and it went well. Walk me through an ordinary Tuesday. What time do you start, who's around you, what are you working on, and how do you feel at 4pm?" },
      { id: "q43", n: "43", type: "text", text: "What does success look like for you that you'd be a bit embarrassed to say out loud? Too big, too small, too selfish, whatever it is." },
      { id: "q44", n: "44", type: "text", text: "Who do you look at and think \"I want that\"? Which part, exactly? Be honest, even if it's the money or the status." },
    ],
  },
  {
    id: "p7",
    title: "Part 7: Embodiment. How you're living it",
    intro: "Your body usually knows before you do.",
    questions: [
      { id: "q45", n: "45", type: "text", text: "How many hours do you sleep on a normal night, and how do you feel when you wake up?" },
      { id: "q46", n: "46", type: "rows5", rows: "STATES", text: "How much of a normal week do you spend in each of these? Score 1 (rarely) to 5 (most of the time).", lowLabel: "Rarely", highLabel: "Most of the time" },
      { id: "q47", n: "47", type: "text", text: "After something stressful happens, how long until you feel okay again? Minutes, hours, days?" },
      { id: "q48", n: "48", type: "single", options: "BURNOUT_STAGES", carry: "q48", text: "Pick the one that sounds most like you right now:" },
      { id: "q49", n: "49", type: "text", text: "What does your body keep asking for that you keep overriding?" },
      { id: "q50", n: "50", type: "text", text: "Which symptoms have you been treating as normal, or putting down to \"just stress\"? Think sleep, mood, digestion, your cycle, headaches, libido. Share only what you're comfortable with." },
      { id: "q51", n: "51", type: "text", text: "What's one thing you know works for you that you've stopped doing? A walk, a class, cooking, being outside, seeing a particular friend." },
    ],
  },
  {
    id: "tb",
    track: "business",
    title: "I run a business",
    intro: "",
    groups: true,
    questions: [
      { id: "b1", n: "B1", group: "Position", type: "text", text: "What do you want the business to be known for? What is it actually known for? If ten clients described it, what would they say?" },
      { id: "b2", n: "B2", group: "Position", type: "text", text: "Who's the client you'd clone tomorrow? Who's the one you dread hearing from?" },
      { id: "b3", n: "B3", group: "Position", type: "text", text: "Why does someone pick you over the business most like yours? If you're not sure, say so." },
      { id: "b4", n: "B4", group: "Value", type: "text", text: "Where does your money actually come from? List your offers and roughly what share of income each brings in." },
      { id: "b5", n: "B5", group: "Value", type: "text", text: "Which offer do you love delivering, and which do you resent? Is the money in the one you love?" },
      { id: "b6", n: "B6", group: "Value", type: "text", carry: "worth", text: "When did you last put your prices up? What stopped you doing it sooner?" },
      { id: "b7", n: "B7", group: "Value", type: "text", text: "Where is money leaking? Late invoices, discounts, scope creep, tools you pay for and don't use, clients who cost more than they pay." },
      { id: "b8", n: "B8", group: "Visibility", type: "text", text: "How do new clients find you right now? If the honest answer is \"they just do\", write that." },
      { id: "b9", n: "B9", group: "Visibility", type: "text", text: "What do you hold back from saying publicly about your work or your industry?" },
      { id: "b10", n: "B10", group: "Pace", type: "text", text: "How many hours a week do you work? How many would you like to work?" },
      { id: "b11", n: "B11", group: "Pace", type: "text", text: "What are you doing in the business that someone else should be doing?" },
      { id: "b12", n: "B12", group: "Pace", type: "text", text: "If you were off sick for a month, what would happen to the business?" },
      { id: "b13", n: "B13", group: "Pace", type: "text", text: "What does the business keep asking of you that you don't want to give anymore?" },
      { id: "b14", n: "B14", group: "Pace", type: "text", text: "If the business disappeared tomorrow, what would you feel about yourself? Is it closer to grief or to terror?" },
    ],
  },
  {
    id: "tc",
    track: "career",
    title: "I have a career",
    intro: "",
    groups: true,
    questions: [
      { id: "c1", n: "C1", group: "Position", type: "text", text: "What are you known for at work? What do you want to be known for?" },
      { id: "c2", n: "C2", group: "Position", type: "text", text: "If your manager had to explain your value to their boss in one sentence, what would they say? Is it accurate?" },
      { id: "c3", n: "C3", group: "Position", type: "text", text: "Have you outgrown your role, or has it outgrown you? What tells you that?" },
      { id: "c4", n: "C4", group: "Value", type: "text", text: "Do you know what someone with your experience earns in your market? When did you last check?" },
      { id: "c5", n: "C5", group: "Value", type: "text", carry: "worth", text: "When did you last ask for more money or a bigger scope? What happened?" },
      { id: "c6", n: "C6", group: "Value", type: "text", text: "What do you do that isn't in your job description and nobody credits you for?" },
      { id: "c7", n: "C7", group: "Visibility", type: "text", text: "Who in your company or industry knows your work well? Who puts your name forward when you're not in the room? Who should, and doesn't?" },
      { id: "c8", n: "C8", group: "Visibility", type: "multi", options: "MEETING_BEHAVIOURS", withText: true, text: "In meetings, which of these do you do? Over-explain. Apologise before making your point. Turn statements into questions. Stay quiet when you know the answer. Push harder than the moment needs." },
      { id: "c9", n: "C9", group: "Pace", type: "text", text: "What time do you actually log off? How often do you check messages after that?" },
      { id: "c10", n: "C10", group: "Pace", type: "text", text: "If you resigned tomorrow, what would you miss? What wouldn't you miss for a second?" },
      { id: "c11", n: "C11", group: "Pace", type: "text", text: "What's the next move you keep circling? A promotion, a new company, a new industry, a break, going out on your own. What's in the way?" },
      { id: "c12", n: "C12", group: "Pace", type: "text", text: "Is there a business idea sitting at the back of your mind? Tell me about it, even if it feels unrealistic." },
      { id: "c13", n: "C13", group: "Pace", type: "text", text: "If your job title disappeared tomorrow, what would you feel about yourself?" },
    ],
  },
  {
    id: "p8",
    title: "Part 8: The honest bit",
    intro: "",
    questions: [
      { id: "q52", n: "52", type: "text", text: "What are you most afraid I'll tell you?" },
      { id: "q53", n: "53", type: "text", text: "What do you already know you need to do?" },
      {
        id: "q54", n: "54", type: "readiness",
        text: "On a scale of 1 to 10, how ready are you to change something in the next 30 days? Why that number and not lower? What would make it one point higher?",
        scaleText: "On a scale of 1 to 10, how ready are you to change something in the next 30 days?",
        textFields: [
          { key: "why", label: "Why that number and not lower?" },
          { key: "higher", label: "What would make it one point higher?" },
        ],
      },
      { id: "q55", n: "55", type: "text", text: "What would make this audit worth it for you?" },
      { id: "q56", n: "56", type: "text", text: "Anything else I should know about you, or about this moment in your life?" },
    ],
  },
  {
    id: "p9",
    title: "Part 9: What's already working",
    intro: "We finish here on purpose. Whatever comes next gets built on what you've already got.",
    questions: [
      { id: "q57", n: "57", type: "text", text: "What are you proud of that most people don't see?" },
      { id: "q58", n: "58", type: "text", text: "Think of a hard stretch you've already come through. What got you through it?" },
      { id: "q59", n: "59", type: "text", carry: "q59", text: "Who can you be completely honest with right now? When did you last tell them how you really are?" },
    ],
  },
];

export const WHEN_YOU_FINISH = {
  title: "That's it.",
  lines: [
    "Thank you for being this honest. Most people never sit down and look at all of this in one go.",
    "Within five business days you'll get your written diagnostic, and then we'll go through it together on a one-hour call.",
    "If anything you wrote is sitting heavily with you, don't wait for the call. Talk to someone you trust, or a professional.",
  ],
};

// Lookup tables named by string in the question data above.
export const OPTION_SETS = {
  BUSINESS_STAGES,
  LEAK_AREAS,
  TIME_RECEIPT,
  INVISIBLE_LOAD,
  STATES,
  BURNOUT_STAGES,
  LOCKED_AREAS,
  MEETING_BEHAVIOURS,
};

// Starting Point Profile answers carried forward, by SPP question index
// (0-based, in the order of Q in src/data/startingPointProfile.js).
// Q9 Conflict, Q8 Support, Q10 Money, Q11 Worth, Q4 Exhaustion, Q5 Body
// signals, Q12 The pattern.
export const SPP_CARRY = {
  q9: [8],
  q59: [7],
  q22: [9],
  worth: [10],
  q48: [3, 4],
  q33: [11],
};
export const CARRY_LEAD = "In your Starting Point Profile, you said:";

// Parts that apply to her track, in order.
export function partsForTrack(track) {
  return PARTS.filter((p) => !p.track || p.track === track);
}

export function questionsFor(part, track) {
  return part.questions.filter((q) => !q.track || q.track === track);
}

// Whether a single answer counts as answered, for progress and review.
export function isAnswered(q, v) {
  if (v === undefined || v === null) return false;
  switch (q.type) {
    case "text":
      return String(v).trim().length > 0;
    case "facts":
      return Object.values(v || {}).some((x) => String(x || "").trim().length > 0);
    case "sliders2":
      return (q.sliders || []).some((s) => typeof v?.[s.key] === "number");
    case "multi":
      return (Array.isArray(v?.selected) && v.selected.length > 0) || String(v?.text || "").trim().length > 0;
    case "leakmap":
      return Object.keys(v || {}).length > 0;
    case "hours":
      return Object.values(v || {}).some((x) => x !== "" && x !== null && x !== undefined);
    case "lists2":
      return Object.values(v || {}).some((list) => Array.isArray(list) && list.some((x) => String(x || "").trim()));
    case "rows5":
      return Object.keys(v || {}).length > 0;
    case "single":
      return !!v;
    case "readiness":
      return typeof v?.score === "number" || Object.values(v?.text || {}).some((x) => String(x || "").trim());
    default:
      return !!v;
  }
}
