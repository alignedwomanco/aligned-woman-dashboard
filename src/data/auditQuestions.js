// The Alignment Audit: question set.
// Question wording is copied word for word from the Claude Doc "The
// Alignment Audit: Question Set" (1 November 2026). Box labels and chip
// options come from "Alignment Audit: Answer Format Update" (1 November
// 2026) and are approved copy. Never rewrite or paraphrase either here;
// change the doc first, with Laura's approval, then copy it across.
//
// The One Big Dream update (10 November 2026) is approved copy from
// "Alignment Audit: One Big Dream and $280 Update" and follows the same
// rule.
//
// Question ids are stable and are the keys in AuditResponse.answers:
// q1 to q59 and d1 to d6 for the shared parts, b1 to b14 and c1 to c13
// for the track modules. q14 is answered inside q13's rows and no longer
// has a field. d1 to d6 were added on 10 November 2026: d6 closes Part 5,
// d1 to d5 sit in Part 6. An id never changes, wherever its question
// moves: q37 and q38 now sit in Part 6 and keep their ids.
//
// RETIRED: q15, q24, q36, q40, q43, q49, q55 (11 November 2026, it
// repeated d4) and d5 (11 November 2026, merged into d3) carry "retired: true". A
// retired question stays in its part's array, is never shown on the audit
// screens and is never counted in progress, on the review screen or in
// numbering (questionsFor leaves it out). Its saved answer stays in
// answers, untouched, and shows in the admin and profile views under
// "From an earlier version of the audit" (see AuditAnswersView.jsx). q37 lost its
// "give" box the same way: the saved words are kept (see retiredFields).
//
// NUMBERING: shared questions carry no number of their own. The number
// she sees is worked out from position by displayNumbers(track): 1 to 57
// with no gaps on either track, skipping retired questions. Only track
// questions keep a hand-typed "n" (B1 to B14, C1 to C13). Never type a
// number onto a shared question.
//
// "type" picks the field:
//   text      a text field that grows as she types
//   facts     Q2 or Q3: short fields, some reused from her profile
//   sliders2  Q5: two sliders, 1 to 10
//   multi     tick any that apply (optional text)
//   leakmap   Q18: one slider per area, -5 to +5, or "Doesn't apply"
//   hours     Q21: number fields, hours, with a running total
//   lists2    two lists she can add lines to; a line can carry an extra box
//   rows5     one score per line, 1 to 5
//   single    pick one
//   readiness Q54: a 1 to 10 scale plus two text fields
//   rows      rows she adds to, each with the boxes in "columns"
//   fields    two or more labelled boxes for one question
//   chips     tappable options, mode "single" or "multi"
//   prefix    one line that starts with fixed words she finishes
//
// Inside rows and fields, each box has a "kind": text, short, number
// (optional suffix), time, chips (options and mode) or toggle.
//
// PLACEHOLDERS: every question and every box has an empty "placeholder".
// Laura writes the example answers. Fill them in here; an empty one shows
// nothing.
//
// "carry" names the Starting Point Profile answers shown as a quote above
// the question (see SPP_CARRY). "quote" names an answer of hers from
// earlier in this audit shown the same way (see liveQuote). It is one
// kind, or a list of kinds shown in order.

export const AUDIT_VERSION = "2026-11-10";

// Turns approved labels into options. Values are lower_snake_case.
export function slug(label) {
  return String(label)
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
const opts = (labels) => labels.map((label) => ({ value: slug(label), label }));

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
    "Only I read your answers, and they're used for your blueprint and nothing else.",
  ],
  promise: "Within five business days of submitting, you get a blueprint written about you: where you actually are, the pattern holding you back, and the move I'd make next. Then we go through it together on a one-hour call.",
  tickLead: "Before you start, tick to agree:",
};

// The exact wording she agrees to. Stored with her answers when she ticks.
// The doc ends it with "[Link to full terms and privacy policy.]"; the page
// renders that as a link to TERMS_URL until Laura's full page exists.
export const AGREEMENT_TEXT = "I understand this audit is a coaching tool. It isn't therapy, medical advice or a diagnosis. I agree to Laura Jane Thomas collecting and using my answers, including anything I share about my health, to prepare my blueprint. I know I can skip any question.";
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

// The screen between Part 3 and Part 4. Not a part, not counted in progress.
export const PAUSE_SCREEN = {
  title: "Before the next part",
  body: "The next part asks about what you're carrying. Take a breath, get some water, come back when you're ready.",
  button: "I'm ready",
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

// Shared option sets from the Answer Format Update.
const REL = ["Partner", "Family member", "Boss or manager", "Colleague", "Client", "Friend", "Someone else"];
export const RELATIONSHIPS = opts(REL);
export const RELATIONSHIPS_PAST = opts([...REL, "Someone no longer in my life"]);
export const RELATIONSHIPS_VOICE = opts([...REL, "Someone no longer in my life", "Myself"]);
export const RELATIONSHIPS_HONEST = opts([...REL, "No one right now"]);
export const HOW_LONG = opts(["Weeks", "Months", "About a year", "Years"]);
export const LAST_FELT = opts(["This week", "This month", "This year", "Longer ago", "I can't remember"]);
export const FEELINGS = opts(["Relief", "Reward", "Comfort", "Control", "To keep up", "To feel I'm getting somewhere", "Other"]);
export const CAN_CHANGE = opts(["Yes", "Partly", "No"]);
export const CRASH_TIME = opts(["Morning", "Midday", "Afternoon", "Evening", "Late night", "No pattern"]);
export const REACH_FOR = opts(["Coffee", "Sugar", "Wine", "My phone", "A nap", "Pushing through", "Other"]);
export const OBLIGATION_TYPE = opts(["Role", "Client", "Promise", "Habit", "Other"]);
export const YES_NO = opts(["Yes", "No"]);
export const AGREE = opts(["Yes", "Partly", "No"]);
export const HABITS = opts(["Overworking", "Over-explaining", "Staying quiet", "People-pleasing", "Perfectionism", "Other"]);
export const CONSTRAINT = opts(["Real constraint", "Fear dressed up as a fact"]);
export const DECIDE_HOW = opts(["Gut", "Research", "Asking several people", "Waiting until it's forced", "Other"]);
export const WAKE_FEEL = opts(["Rested", "Okay", "Tired", "Exhausted"]);
export const RECOVERY = opts(["Minutes", "Hours", "A day", "A few days", "Longer"]);
export const SYMPTOMS = opts(["Sleep", "Mood", "Digestion", "My cycle", "Headaches", "Libido", "Skin", "Other"]);
export const LAST_TOLD = opts(["This week", "This month", "Longer ago", "Never"]);
export const LEAKS = opts(["Late invoices", "Discounts", "Scope creep", "Tools I pay for and don't use", "Clients who cost more than they pay", "Other"]);
export const CHECK_AFTER = opts(["Never", "Sometimes", "Most evenings", "Always"]);
export const GOAL_STATUS = opts(["Done", "Partly", "Didn't start", "Dropped"]);
export const NEXT_MOVE = opts(["A promotion", "A new company", "A new industry", "A break", "Going out on my own", "Other"]);

// Box helpers, so every box carries a label, a kind and an empty placeholder.
const text = (key, label) => ({ key, label, kind: "text", placeholder: "" });
const short = (key, label) => ({ key, label, kind: "short", placeholder: "" });
const num = (key, label, suffix = "") => ({ key, label, kind: "number", suffix, placeholder: "" });
const time = (key, label) => ({ key, label, kind: "time", placeholder: "" });
const chips = (key, label, options, mode = "single") => ({ key, label, kind: "chips", options, mode, placeholder: "" });
const toggle = (key, label, options) => ({ key, label, kind: "toggle", options, placeholder: "" });

// Parts as stored. Screen order comes from partsForTrack: since 11 November
// 2026 her track module sits straight after Part 1.
export const PARTS = [
  {
    id: "p1",
    title: "Part 1: Where you are right now",
    intro: "The facts first, so the rest has context.",
    questions: [
      { id: "q1", type: "text", placeholder: "", text: "In a few sentences, where are you right now? Say it the way you'd say it to a close friend, not a recruiter." },
      {
        id: "q2", track: "business", type: "facts", placeholder: "",
        text: "What's the business, how long have you been running it, and what stage is it at? (Idea, just started, growing, stuck, rebuilding.)",
        fields: [
          { key: "what", label: "The business", profile: "role_or_business", placeholder: "" },
          { key: "how_long", label: "How long", placeholder: "" },
          { key: "stage", label: "Stage", profile: "stage", options: "BUSINESS_STAGES", placeholder: "" },
        ],
      },
      {
        id: "q3", track: "career", type: "facts", placeholder: "",
        text: "What's your role, how long have you been in it, and what industry are you in?",
        fields: [
          { key: "role", label: "Role", profile: "role_or_business", placeholder: "" },
          { key: "how_long", label: "How long", profile: "stage", placeholder: "" },
          { key: "industry", label: "Industry", profile: "industry", placeholder: "" },
        ],
      },
      { id: "q4", type: "text", placeholder: "", text: "What happened in the last month or two that made you book this now?" },
      {
        id: "q5", type: "sliders2", placeholder: "",
        text: "Two sliders, 1 to 10. How right does your life look from the outside? How right does it feel from the inside?",
        sliders: [
          { key: "outside", label: "How right does your life look from the outside?" },
          { key: "inside", label: "How right does it feel from the inside?" },
        ],
      },
      { id: "q6", type: "text", placeholder: "", text: "If nothing changes in the next 12 months, what happens? Be specific. What gets worse, and what do you lose?" },
      { id: "q7", type: "text", placeholder: "", text: "What have you already tried to change this? What helped for a while, and what didn't work at all?" },
    ],
  },
  {
    id: "p2",
    title: "Part 2: Awareness. What you're not seeing",
    intro: "A blind spot doesn't show up when you ask about it directly. These come at it sideways.",
    questions: [
      {
        id: "q8", type: "rows", maxRows: 3, placeholder: "",
        text: "What are you waiting to sort out \"once things calm down\"? How long have you been telling yourself you just need to get through this stretch? Has the stretch turned into years?",
        columns: [text("what", "What's waiting"), chips("how_long", "How long it's been waiting", "HOW_LONG")],
      },
      {
        id: "q9", type: "fields", carry: "q9", placeholder: "",
        text: "What conversation have you been avoiding? Who is it with?",
        fields: [text("about", "What it's about"), chips("who", "Who it's with", "RELATIONSHIPS")],
      },
      {
        id: "q10", type: "fields", placeholder: "",
        text: "What do the people closest to you keep telling you that you brush off? Now write two lines in your best friend's voice: \"What's really going on with her is...\"",
        fields: [
          text("told", "What they keep telling me"),
          { ...text("voice", "In my best friend's voice"), leadIn: "What's really going on with her is..." },
        ],
      },
      {
        id: "q11", type: "rows", maxRows: 3, placeholder: "",
        text: "Which decision have you made in your head more than once, and still not acted on?",
        columns: [text("decision", "The decision"), chips("how_long", "How long I've been circling it", "HOW_LONG")],
      },
      {
        id: "q12", type: "fields", placeholder: "",
        text: "Where do you say yes when you mean no? Give me the most recent example, not the general habit.",
        fields: [chips("who", "Who asked", "RELATIONSHIPS"), text("yes_to", "What I said yes to"), text("wanted", "What I wanted to say")],
      },
      {
        // Q13 and Q14 share one card so each complaint stays lined up with
        // its follow-up. Saved under q13; q14 has no field of its own.
        id: "q13", type: "rows", maxRows: 3, placeholder: "",
        text: "What do you complain about most? Think about what comes up when you're venting to a friend, or going over it in your own head at night. Add up to three.",
        text2: "Now take that same complaint and look at what you do that keeps it going. This isn't about blame. Most of what we complain about survives because we keep making room for it. We say yes when we could say no, or we fix it ourselves instead of having the hard conversation. What's your version here, and what would change if you stopped doing it?",
        columns: [text("complaint", "The complaint"), text("keeps", "What I do that keeps it going"), text("if_stopped", "What would change if I stopped")],
      },
      {
        id: "q15", retired: true, type: "rows", maxRows: 3, placeholder: "",
        text: "What are you calling \"fine\" that isn't?",
        columns: [text("what", "What I'm calling fine")],
      },
      {
        id: "q16", type: "fields", placeholder: "",
        text: "When did you last feel completely like yourself? Where were you and what were you doing?",
        fields: [chips("when", "When", "LAST_FELT"), text("where", "Where I was and what I was doing")],
      },
      { id: "q17", type: "multi", options: "LOCKED_AREAS", placeholder: "", text: "Is there an area you'd rather I didn't ask about? You don't need to say what it is. Just tick where it lives: work, money, my body, my relationship, family, friendships, something else." },
    ],
  },
  {
    id: "p3",
    title: "Part 3: The Energy Leak Map",
    intro: "This is where most of your blueprint comes from. Don't rate how happy you are with each area. Rate what it does to your energy right now.",
    questions: [
      { id: "q18", type: "leakmap", placeholder: "", text: "Score each area from -5 (it drains me most days) to +5 (it fills me up). 0 is neutral. Leave out anything that doesn't apply." },
      { id: "q19", type: "text", quote: "lowest", placeholder: "", text: "Look at your lowest score. What's actually happening there? Describe a bad day in that area." },
      { id: "q20", type: "text", quote: "highest", placeholder: "", text: "Look at your highest score. What makes it work? How much of your week does it get?" },
      { id: "q21", type: "hours", placeholder: "", lead: "The time receipt.", text: "Open your calendar for last week. Roughly how many hours went to: paid work, unpaid work for other people, admin, your body, the people you love, and nothing at all?" },
      {
        id: "q22", type: "rows", maxRows: 3, carry: "q22", placeholder: "",
        lead: "The spending pattern.",
        text: "Think back over the last month. What did you spend on that you didn't need, and what were you trying to feel at the time? No amounts or details. Just the pattern.",
        columns: [short("bought", "What I bought"), chips("feel", "What I was trying to feel", "FEELINGS", "multi")],
      },
      {
        id: "q23", type: "lists2", placeholder: "", lead: "Your stress bucket.",
        text: "Make two lists. First, everything filling your bucket right now, including the things you've decided are \"just part of it\". Be specific: not \"work\" but \"the 7am Monday meeting\". Second, everything that empties it. Scrolling and wine don't count.",
        lists: [
          { key: "filling", label: "First: what's filling it", placeholder: "", extra: chips("can_change", "Can I change this?", "CAN_CHANGE") },
          { key: "emptying", label: "Second: what empties it", placeholder: "" },
        ],
      },
      {
        id: "q24", retired: true, type: "rows", maxRows: 3, placeholder: "",
        text: "Who do you feel more tired after seeing? You don't need to name them. What happens in those conversations?",
        columns: [chips("who", "Who", "RELATIONSHIPS"), text("what", "What happens")],
      },
      { id: "q25", type: "rows5", rows: "INVISIBLE_LOAD", placeholder: "", lead: "The invisible load.", text: "Score each line from 1 (rarely) to 5 (almost always).", lowLabel: "Rarely", highLabel: "Almost always" },
      {
        id: "q26", type: "fields", placeholder: "",
        text: "What time of day do you crash? What do you reach for when it happens? Coffee, sugar, wine, your phone, a nap, pushing through?",
        fields: [chips("when", "When", "CRASH_TIME"), chips("reach", "What I reach for", "REACH_FOR", "multi")],
      },
    ],
  },
  {
    id: "p4",
    title: "Part 4: Liberation. What you're carrying",
    intro: "Some of what's heavy was never yours to carry.",
    pauseBefore: true,
    questions: [
      {
        id: "q27", type: "rows", maxRows: 3, placeholder: "",
        text: "What are you still doing out of guilt or obligation? A role, a client, a promise, a habit. Which of those would you stop tomorrow if nobody would be disappointed?",
        columns: [short("what", "What it is"), chips("type", "Type", "OBLIGATION_TYPE"), toggle("stop", "Would I stop tomorrow?", "YES_NO")],
      },
      {
        id: "q28", type: "fields", placeholder: "",
        text: "Whose approval are you still working for? It could be someone who isn't in your life anymore.",
        fields: [chips("who", "Who", "RELATIONSHIPS_PAST"), text("earn", "What I do to earn it")],
      },
      {
        id: "q29", type: "rows", maxRows: 3, placeholder: "",
        text: "What rule did you grow up with about money, work or being a woman that still runs you? Do you actually agree with it?",
        columns: [short("rule", "The rule"), chips("agree", "Do I agree?", "AGREE")],
      },
      {
        id: "q30", type: "prefix", leadIn: "Good women don't", placeholder: "",
        text: "Finish this sentence without thinking too hard: \"Good women don't...\"",
      },
      {
        id: "q31", type: "fields", placeholder: "",
        text: "Pick the habit you most want to drop. Overworking, over-explaining, staying quiet, whatever yours is. What is it protecting you from?",
        fields: [chips("habit", "The habit", "HABITS"), text("protects", "What it protects me from")],
      },
      { id: "q32", type: "text", placeholder: "", text: "What are you scared would happen if you fully rested for two weeks?" },
      { id: "q33", type: "text", carry: "q33", placeholder: "", text: "Which story about yourself are you tired of telling?" },
    ],
  },
  {
    id: "p5",
    title: "Part 5: Intention. What you actually want",
    intro: "",
    questions: [
      // Q34 and Q35 sit side by side on a wide screen, stacked on a phone.
      { id: "q34", type: "text", pairWith: "q35", placeholder: "", text: "What do you want? Write the answer you'd give if nobody was ever going to read it." },
      {
        id: "q35", type: "fields", em: "should", placeholder: "",
        text: "Now, what do you think you should want? Whose voice is that?",
        fields: [text("should", "What I think I should want"), chips("whose", "Whose voice", "RELATIONSHIPS_VOICE")],
      },
      {
        id: "q39", type: "fields", placeholder: "",
        text: "How do you make big decisions right now? Gut, research, asking several people before you trust yourself, or waiting until it's forced on you? How is that working?",
        fields: [chips("how", "How I decide", "DECIDE_HOW", "multi"), text("working", "How it's working")],
      },
      {
        id: "q41", type: "lists2", placeholder: "",
        text: "What are you good at that drains you? What are you good at that gives you energy back? Roughly how much of your week goes to each?",
        lists: [
          { key: "drains", label: "Good at, but it drains me", placeholder: "", extra: num("hours", "Hours a week", "hours a week") },
          { key: "energy", label: "Good at, and it gives me energy", placeholder: "", extra: num("hours", "Hours a week", "hours a week") },
        ],
      },
      {
        id: "d6", type: "fields", placeholder: "", lead: "Watching or doing.",
        text: "Can I be honest with you? Most of us watch far more about change than we actually do. In a normal week, roughly how many hours go to learning how to change your life or work, like podcasts, books, courses and reels? And how many go to actually doing it?",
        fields: [num("learning", "Hours learning", "a week"), num("doing", "Hours doing", "a week")],
      },
      // Retired on 10 November 2026. Hidden from her, answers kept. Her Q36
      // answer is quoted back above d2 (see liveQuote "earlierDream").
      { id: "q36", retired: true, type: "text", placeholder: "", text: "You get one priority for the next six months and everything else is allowed to slide. What is it?" },
      {
        id: "q40", retired: true, type: "fields", placeholder: "",
        text: "Think of a recent decision you handed to someone else. How did it turn out, and how did you feel about yourself afterwards?",
        fields: [short("decision", "The decision"), chips("who", "Who made it", "RELATIONSHIPS"), text("outcome", "How it turned out"), text("felt", "How I felt about myself")],
      },
    ],
  },
  {
    id: "p6",
    title: "Part 6: Vision. Where you're heading",
    intro: "This is the part where you get to want things. Take your time.",
    questions: [
      {
        id: "d1", type: "rows", maxRows: 3, placeholder: "", lead: "This year's receipts.",
        text: "Think back to January. What did you want this year to be about? How much of it happened?",
        columns: [short("wanted", "What I wanted"), chips("status", "Where it got to", "GOAL_STATUS"), text("blocker", "What got in the way")],
      },
      { id: "q42", type: "text", placeholder: "", text: "It's three years from now and it went well. Walk me through an ordinary Tuesday. What time do you start, who's around you, what are you working on, and how do you feel at 4pm?" },
      { id: "q44", type: "text", placeholder: "", text: "Who do you look at and think \"I want that\"? Which part, exactly? Be honest, even if it's the money or the status." },
      {
        id: "d2", type: "text", quote: "earlierDream", placeholder: "", lead: "One big dream.",
        text: "If the next 12 months could make one dream real, which would it be? Think big and get specific. Include the version you'd be a bit embarrassed to say out loud. If you could finish it by the end of next month, it isn't big enough.",
      },
      {
        // Merged with d5 on 11 November 2026 (approved by Laura in chat).
        // Keys kept, so earlier answers stay in place.
        id: "d3", type: "fields", quote: ["calendar", "earlierGive"], placeholder: "", lead: "Make room.",
        text: "What would you stop doing, or put on hold, to make room for this dream? Which one would be hardest to let go of, and why?",
        fields: [text("wait", "What I'd stop or put on hold"), text("hardest", "The hardest one to let go of, and why")],
      },
      { id: "d4", type: "text", quote: "dream", placeholder: "", lead: "Three months from now.", text: "What would have to be true three months from now for you to know it's moving?" },
      { id: "d5", retired: true, type: "text", quote: ["calendar", "earlierGive"], placeholder: "", lead: "Make room.", text: "What would you stop doing in your week to make room for it?" },
      {
        // Moved from Part 5 and reworded on 10 November 2026. The "give"
        // box came off the screen; its saved words stay in answers.q37.give,
        // show above d5 (liveQuote "earlierGive") and in the admin and
        // profile views under the original wording below.
        id: "q37", type: "fields", placeholder: "",
        text: "What will you not give up for this, no matter what?",
        fields: [text("wont", "What I won't give up")],
        retiredText: "What are you willing to give up to get it? What will you not give up, no matter what?",
        retiredFields: [text("give", "What I'll give up")],
      },
      {
        // Moved from Part 5 and reworded on 10 November 2026.
        id: "q38", type: "rows", maxRows: 5, quote: "dream", placeholder: "",
        text: "What's in the way of it? List it all, then mark each one: a real constraint, or a fear dressed up as a fact.",
        columns: [short("obstacle", "What's in the way"), toggle("kind", "Real constraint, or fear dressed up as a fact?", "CONSTRAINT")],
      },
      // Retired on 10 November 2026. Hidden from her, answer kept and quoted
      // back above d2 (see liveQuote "earlierDream").
      { id: "q43", retired: true, type: "text", placeholder: "", text: "What does success look like for you that you'd be a bit embarrassed to say out loud? Too big, too small, too selfish, whatever it is." },
    ],
  },
  {
    id: "p7",
    title: "Part 7: Embodiment. How you're living it",
    intro: "Your body usually knows before you do.",
    questions: [
      {
        id: "q45", type: "fields", placeholder: "",
        text: "How many hours do you sleep on a normal night, and how do you feel when you wake up?",
        fields: [num("hours", "Hours a night"), chips("wake", "When I wake up I feel", "WAKE_FEEL")],
      },
      { id: "q46", type: "rows5", rows: "STATES", placeholder: "", text: "How much of a normal week do you spend in each of these? Score 1 (rarely) to 5 (most of the time).", lowLabel: "Rarely", highLabel: "Most of the time" },
      { id: "q47", type: "chips", options: "RECOVERY", mode: "single", placeholder: "", text: "After something stressful happens, how long until you feel okay again? Minutes, hours, days?" },
      { id: "q48", type: "single", options: "BURNOUT_STAGES", carry: "q48", placeholder: "", text: "Pick the one that sounds most like you right now:" },
      { id: "q49", retired: true, type: "text", placeholder: "", text: "What does your body keep asking for that you keep overriding?" },
      {
        id: "q50", type: "fields", placeholder: "",
        text: "Which symptoms have you been treating as normal, or putting down to \"just stress\"? Think sleep, mood, digestion, your cycle, headaches, libido. Share only what you're comfortable with.",
        fields: [chips("symptoms", "Symptoms", "SYMPTOMS", "multi"), text("detail", "Anything you'd like to add")],
      },
      { id: "q51", type: "text", placeholder: "", text: "What's one thing you know works for you that you've stopped doing? A walk, a class, cooking, being outside, seeing a particular friend." },
    ],
  },
  {
    id: "tb",
    track: "business",
    title: "I run a business",
    intro: "",
    groups: true,
    questions: [
      { id: "b1", n: "B1", group: "Position", type: "text", placeholder: "", text: "What do you want the business to be known for? What is it actually known for? If ten clients described it, what would they say?" },
      { id: "b2", n: "B2", group: "Position", type: "text", placeholder: "", text: "Who's the client you'd clone tomorrow? Who's the one you dread hearing from?" },
      { id: "b3", n: "B3", group: "Position", type: "text", placeholder: "", text: "Why does someone pick you over the business most like yours? If you're not sure, say so." },
      {
        id: "b4", n: "B4", group: "Value", type: "rows", maxRows: 6, total: "share", placeholder: "",
        text: "Where does your money actually come from? List your offers and roughly what share of income each brings in.",
        columns: [short("offer", "The offer"), num("share", "Share of income", "%")],
      },
      {
        // The two chip fields use her B4 offers as their options, and fall
        // back to text boxes when B4 is empty.
        id: "b5", n: "B5", group: "Value", type: "fields", placeholder: "",
        text: "Which offer do you love delivering, and which do you resent? Is the money in the one you love?",
        fields: [
          { ...chips("love", "The ones I love delivering", "B4_OFFERS", "multi"), fallback: "text" },
          { ...chips("resent", "The ones I resent", "B4_OFFERS", "multi"), fallback: "text" },
          text("money", "Is the money in the one you love?"),
        ],
      },
      { id: "b6", n: "B6", group: "Value", type: "text", carry: "worth", placeholder: "", text: "When did you last put your prices up? What stopped you doing it sooner?" },
      { id: "b7", n: "B7", group: "Value", type: "chips", options: "LEAKS", mode: "multi", placeholder: "", text: "Where is money leaking? Late invoices, discounts, scope creep, tools you pay for and don't use, clients who cost more than they pay." },
      { id: "b8", n: "B8", group: "Visibility", type: "text", placeholder: "", text: "How do new clients find you right now? If the honest answer is \"they just do\", write that." },
      { id: "b9", n: "B9", group: "Visibility", type: "text", placeholder: "", text: "What do you hold back from saying publicly about your work or your industry?" },
      {
        id: "b10", n: "B10", group: "Pace", type: "fields", placeholder: "",
        text: "How many hours a week do you work? How many would you like to work?",
        fields: [num("now", "Hours I work now", "a week"), num("want", "Hours I'd like to work", "a week")],
      },
      { id: "b11", n: "B11", group: "Pace", type: "text", placeholder: "", text: "What are you doing in the business that someone else should be doing?" },
      { id: "b12", n: "B12", group: "Pace", type: "text", placeholder: "", text: "If you were off sick for a month, what would happen to the business?" },
      { id: "b13", n: "B13", group: "Pace", type: "text", placeholder: "", text: "What does the business keep asking of you that you don't want to give anymore?" },
      { id: "b14", n: "B14", group: "Pace", type: "text", placeholder: "", text: "If the business disappeared tomorrow, what would you feel about yourself? Is it closer to grief or to terror?" },
    ],
  },
  {
    id: "tc",
    track: "career",
    title: "I have a career",
    intro: "",
    groups: true,
    questions: [
      { id: "c1", n: "C1", group: "Position", type: "text", placeholder: "", text: "What are you known for at work? What do you want to be known for?" },
      { id: "c2", n: "C2", group: "Position", type: "text", placeholder: "", text: "If your manager had to explain your value to their boss in one sentence, what would they say? Is it accurate?" },
      { id: "c3", n: "C3", group: "Position", type: "text", placeholder: "", text: "Have you outgrown your role, or has it outgrown you? What tells you that?" },
      { id: "c4", n: "C4", group: "Value", type: "text", placeholder: "", text: "Do you know what someone with your experience earns in your market? When did you last check?" },
      { id: "c5", n: "C5", group: "Value", type: "text", carry: "worth", placeholder: "", text: "When did you last ask for more money or a bigger scope? What happened?" },
      { id: "c6", n: "C6", group: "Value", type: "text", placeholder: "", text: "What do you do that isn't in your job description and nobody credits you for?" },
      { id: "c7", n: "C7", group: "Visibility", type: "text", placeholder: "", text: "Who in your company or industry knows your work well? Who puts your name forward when you're not in the room? Who should, and doesn't?" },
      { id: "c8", n: "C8", group: "Visibility", type: "multi", options: "MEETING_BEHAVIOURS", withText: true, placeholder: "", text: "In meetings, which of these do you do? Over-explain. Apologise before making your point. Turn statements into questions. Stay quiet when you know the answer. Push harder than the moment needs." },
      {
        id: "c9", n: "C9", group: "Pace", type: "fields", placeholder: "",
        text: "What time do you actually log off? How often do you check messages after that?",
        fields: [time("logoff", "When I actually log off"), chips("check", "After that I check messages", "CHECK_AFTER")],
      },
      {
        id: "c10", n: "C10", group: "Pace", type: "lists2", placeholder: "",
        text: "If you resigned tomorrow, what would you miss? What wouldn't you miss for a second?",
        lists: [
          { key: "miss", label: "What I'd miss", placeholder: "" },
          { key: "wont_miss", label: "What I wouldn't miss for a second", placeholder: "" },
        ],
      },
      {
        id: "c11", n: "C11", group: "Pace", type: "fields", placeholder: "",
        text: "What's the next move you keep circling? A promotion, a new company, a new industry, a break, going out on your own. What's in the way?",
        fields: [chips("move", "The move", "NEXT_MOVE"), text("in_way", "What's in the way")],
      },
      { id: "c12", n: "C12", group: "Pace", type: "text", placeholder: "", text: "Is there a business idea sitting at the back of your mind? Tell me about it, even if it feels unrealistic." },
      { id: "c13", n: "C13", group: "Pace", type: "text", placeholder: "", text: "If your job title disappeared tomorrow, what would you feel about yourself?" },
    ],
  },
  {
    id: "p8",
    title: "Part 8: The honest bit",
    intro: "",
    questions: [
      { id: "q52", type: "text", placeholder: "", text: "What are you most afraid I'll tell you?" },
      { id: "q53", type: "text", placeholder: "", text: "What do you already know you need to do?" },
      {
        id: "q54", type: "readiness", placeholder: "",
        text: "On a scale of 1 to 10, how ready are you to change something in the next 30 days? Why that number and not lower? What would make it one point higher?",
        scaleText: "On a scale of 1 to 10, how ready are you to change something in the next 30 days?",
        textFields: [
          // The first label quotes her score once she picks one.
          { key: "why", label: "Why that number and not lower?", scoreLabel: "Why {score} and not lower?", placeholder: "" },
          { key: "higher", label: "What would make it one point higher?", placeholder: "" },
        ],
      },
      { id: "q55", retired: true, type: "text", placeholder: "", text: "Ninety days from now, what would tell you this was worth doing?" },
      { id: "q56", type: "text", placeholder: "", text: "Anything else I should know about you, or about this moment in your life?" },
    ],
  },
  {
    id: "p9",
    title: "Part 9: What's already working",
    intro: "We finish here on purpose. Whatever comes next gets built on what you've already got.",
    questions: [
      { id: "q57", type: "text", placeholder: "", text: "What are you proud of that most people don't see?" },
      { id: "q58", type: "text", placeholder: "", text: "Think of a hard stretch you've already come through. What got you through it?" },
      {
        id: "q59", type: "fields", carry: "q59", placeholder: "",
        text: "Who can you be completely honest with right now? When did you last tell them how you really are?",
        fields: [
          chips("who", "Who", "RELATIONSHIPS_HONEST"),
          { ...chips("when", "When I last told them how I really am", "LAST_TOLD"), hideWhen: { field: "who", value: "no_one_right_now" } },
        ],
      },
    ],
  },
];

export const WHEN_YOU_FINISH = {
  title: "That's it.",
  lines: [
    "Thank you for being this honest. Most people never sit down and look at all of this in one go.",
    "Within five business days you'll get your written blueprint, and then we'll go through it together on a one-hour call.",
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
  RELATIONSHIPS,
  RELATIONSHIPS_PAST,
  RELATIONSHIPS_VOICE,
  RELATIONSHIPS_HONEST,
  HOW_LONG,
  LAST_FELT,
  FEELINGS,
  CAN_CHANGE,
  CRASH_TIME,
  REACH_FOR,
  OBLIGATION_TYPE,
  YES_NO,
  AGREE,
  HABITS,
  CONSTRAINT,
  DECIDE_HOW,
  WAKE_FEEL,
  RECOVERY,
  SYMPTOMS,
  LAST_TOLD,
  LEAKS,
  CHECK_AFTER,
  NEXT_MOVE,
  GOAL_STATUS,
};

// Her B4 offers, as chip options for B5.
export function b4Offers(answers) {
  const rows = Array.isArray(answers?.b4) ? answers.b4 : [];
  const seen = new Set();
  const out = [];
  for (const r of rows) {
    const label = String(r?.offer || "").trim();
    if (!label || seen.has(label.toLowerCase())) continue;
    seen.add(label.toLowerCase());
    out.push({ value: label, label });
  }
  return out;
}

// Options for a box, including the ones built from her own answers.
export function optionsFor(name, answers) {
  if (name === "B4_OFFERS") return b4Offers(answers);
  return OPTION_SETS[name] || [];
}

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

const signed = (n) => (n > 0 ? `+${n}` : String(n));
function joinAreas(labels) {
  if (labels.length <= 1) return labels[0] || "";
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

// Her own words from an answer, whether it was saved as plain text or kept
// under "legacy" when a layout changed.
function wordsOf(v) {
  if (typeof v === "string") return v.trim();
  if (v && typeof v === "object" && typeof v.legacy === "string") return v.legacy.trim();
  return "";
}

// Her earlier answers quoted back above a later question. Read live, so
// they change if she goes back and edits. Returns null when there is
// nothing to quote, one line as a string, or { lead, lines } for a small
// heading with one or more lines under it.
export function liveQuote(kind, answers) {
  if (kind === "lowest" || kind === "highest") {
    const map = answers?.q18 || {};
    const scored = LEAK_AREAS
      .map((a) => ({ label: a.label, v: map[a.id] }))
      .filter((x) => typeof x.v === "number");
    if (!scored.length) return null;
    const target = kind === "lowest" ? Math.min(...scored.map((x) => x.v)) : Math.max(...scored.map((x) => x.v));
    const at = scored.filter((x) => x.v === target).map((x) => x.label);
    const word = kind === "lowest" ? "lowest" : "highest";
    return at.length === 1
      ? `Your ${word} was ${at[0]}, at ${signed(target)}.`
      : `Your ${word} were ${joinAreas(at)}, both at ${signed(target)}.`;
  }
  // Her answers to the retired Q36 and Q43, above One big dream.
  if (kind === "earlierDream") {
    const lines = [wordsOf(answers?.q36), wordsOf(answers?.q43)].filter(Boolean);
    return lines.length ? { lead: "You wrote earlier:", lines } : null;
  }
  if (kind === "dream") {
    const d = wordsOf(answers?.d2);
    return d ? `Your dream: ${d}` : null;
  }
  // Her Q21 time receipt on one line. Items she left blank are left out.
  if (kind === "calendar") {
    const map = answers?.q21 || {};
    const items = TIME_RECEIPT
      .filter((r) => typeof map[r.id] === "number")
      .map((r) => `${r.label} ${map[r.id]}`);
    return items.length ? { lead: "Your calendar last week:", lines: [items.join(" · ")] } : null;
  }
  // What she said she'd give up, from before Q37 lost that box.
  if (kind === "earlierGive") {
    const g = wordsOf(answers?.q37?.give);
    return g ? `You wrote earlier: ${g}` : null;
  }
  return null;
}

// Parts that apply to her track, in order.
// Her track module comes straight after Part 1 (moved 11 November 2026).
export function partsForTrack(track) {
  const shared = PARTS.filter((p) => !p.track);
  const mine = PARTS.filter((p) => p.track && p.track === track);
  return [shared[0], ...mine, ...shared.slice(1)].filter(Boolean);
}

// The questions she sees in a part. Retired questions are left out, so
// they never show on the audit screens, in progress, on the review screen
// or in numbering.
export function questionsFor(part, track) {
  return part.questions.filter((q) => !q.retired && (!q.track || q.track === track));
}

// The number shown beside each question, worked out from position: a map
// from question id to label. Shared questions run 1, 2, 3 with no gaps,
// carrying on past the track module. Track questions keep their letters
// (B1 to B14, C1 to C13). Q13 takes one number: Q14 is answered inside it.
export function displayNumbers(track) {
  const out = {};
  let count = 0;
  for (const part of partsForTrack(track)) {
    for (const q of questionsFor(part, track)) {
      if (part.track) out[q.id] = q.n || "";
      else { count += 1; out[q.id] = String(count); }
    }
  }
  return out;
}

// ── Answers saved before the Answer Format Update ──
// A plain-text answer to a question that is now structured moves into the
// first text box of the first row, or the first text field. Where the new
// layout has no text box, the words are kept under "legacy" and shown to
// her above the question, so nothing is lost.
const TEXT_KINDS = ["text", "short"];

function firstTextKey(boxes) {
  const b = (boxes || []).find((x) => TEXT_KINDS.includes(x.kind));
  return b ? b.key : null;
}

export function migrateAnswers(answers) {
  const src = answers || {};
  const out = { ...src };
  const changed = {};
  const all = PARTS.flatMap((p) => p.questions);
  for (const q of all) {
    const v = src[q.id];
    if (typeof v !== "string" || !v.trim()) continue;
    let next = null;
    if (q.type === "rows") {
      const k = firstTextKey(q.columns);
      next = k ? [{ [k]: v }] : [{ legacy: v }];
    } else if (q.type === "fields") {
      const k = firstTextKey(q.fields);
      next = k ? { [k]: v } : { legacy: v };
    } else if (q.type === "chips") {
      next = { selected: [], other: "", legacy: v };
    } else if (q.type === "lists2") {
      next = { [q.lists[0].key]: [{ text: v }] };
    } else if (q.type === "prefix") {
      // Only her own words are kept; the fixed lead-in is dropped once.
      const words = v.replace(/^\s*"?good women don'?t\.{0,3}"?\s*/i, "") || v;
      next = words !== v ? words : null;
    }
    if (next !== null) { out[q.id] = next; changed[q.id] = next; }
  }
  // Old string lines in lists2 become { text } items.
  for (const q of all.filter((x) => x.type === "lists2")) {
    const v = out[q.id];
    if (!v || typeof v !== "object" || Array.isArray(v)) continue;
    let touched = false;
    const next = { ...v };
    for (const l of q.lists) {
      if (Array.isArray(v[l.key]) && v[l.key].some((x) => typeof x === "string")) {
        next[l.key] = v[l.key].map((x) => (typeof x === "string" ? { text: x } : x));
        touched = true;
      }
    }
    if (touched) { out[q.id] = next; changed[q.id] = next; }
  }
  // A saved Q14 lands in the first row's "What I do that keeps it going".
  if (typeof src.q14 === "string" && src.q14.trim()) {
    const rows = Array.isArray(out.q13) && out.q13.length ? out.q13.map((r) => ({ ...r })) : [{}];
    rows[0].keeps = rows[0].keeps ? `${rows[0].keeps}\n${src.q14}` : src.q14;
    out.q13 = rows;
    changed.q13 = rows;
  }
  if (src.q14 !== undefined) {
    delete out.q14;
    changed.q14 = null;
  }
  return { answers: out, changed };
}

// ── Answered or skipped ──
const filled = (x) => {
  if (x === undefined || x === null) return false;
  if (typeof x === "number") return true;
  if (typeof x === "string") return x.trim().length > 0;
  if (Array.isArray(x)) return x.some(filled);
  if (typeof x === "object") {
    if (Array.isArray(x.selected) && x.selected.length) return true;
    return Object.values(x).some(filled);
  }
  return !!x;
};

// Whether a single answer counts as answered, for progress and review.
export function isAnswered(q, v) {
  if (v === undefined || v === null) return false;
  switch (q.type) {
    case "text":
    case "prefix":
      return String(v).trim().length > 0;
    case "fields":
      // Only the boxes on screen now count, plus words kept under "legacy".
      // A box that has since come off (Q37 "give") doesn't mark it done.
      if (typeof v !== "object" || Array.isArray(v)) return filled(v);
      return filled(v.legacy) || (q.fields || []).some((f) => filled(v[f.key]));
    case "facts":
    case "hours":
    case "lists2":
    case "rows":
      return filled(v);
    case "sliders2":
      return (q.sliders || []).some((s) => typeof v?.[s.key] === "number");
    case "multi":
      return (Array.isArray(v?.selected) && v.selected.length > 0) || String(v?.text || "").trim().length > 0;
    case "chips":
      return (Array.isArray(v?.selected) && v.selected.length > 0) || String(v?.other || "").trim().length > 0 || String(v?.legacy || "").trim().length > 0;
    case "leakmap":
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
