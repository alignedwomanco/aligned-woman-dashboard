import React, { useState, useMemo, useEffect, useRef } from "react";

/**
 * YOUR MONEY STORY  ·  Free integration workbook (starting-point pattern)
 * The Aligned Woman Co  ·  interactive mockup for review
 *
 * Built for a COLD reader who has never heard of a money block or subconscious
 * programming. Structure is TEACH, then ASK (open), then optionally LOCATE.
 * Three movements:  Understand  ·  Uncover  ·  Rewrite
 *
 * Grounded in the source teachings:
 *  - The reticular activating system and the bits-per-second filter
 *  - The 0 to 7 window: delta and theta brainwaves, the critical faculty
 *  - 95% subconscious, whose one job is safety: familiar = safe, new = danger
 *  - The financial setpoint / thermostat, and why wealth reverts (70% stats)
 *  - The five protection patterns (Performer, Over-Functioner, Outsourcer,
 *    Overrider, Reactor)
 *  - The 90-second emotional wave (feelings are tunnels, built to move through)
 *  - Worth is not price: untying value-as-human from value-of-service
 *  - Learned beliefs can be unlearned: no baby is born with a money block
 *
 * No em dashes anywhere. Brand: Crimson Pro headings, DM Sans body.
 */

/* ----------------------------------------------------------------- tokens */
// Mapped to the live workbook palette (src/index.css :root) so this matches Cindy's workbook.
const C = {
  maroon: "var(--aw-burg-core)",
  burgundy: "var(--aw-burg-mid)",
  rose: "var(--aw-rose-core)",
  pink: "var(--aw-off-white)",
  pink2: "var(--aw-rose-wash)",
  ink: "var(--aw-dark-grey)",
  line: "var(--aw-border-light)",
  roseSoft: "var(--aw-rose-wash)",
};
const serif = "var(--aw-font-display)";
const sans = "var(--aw-font-sans)";

/* ----------------------------------------------------------------- content */

// Inherited money scripts, used as a recognition aid (not leading)
const SCRIPTS = [
  { id: "trees", label: "Money doesn't grow on trees." },
  { id: "afford", label: "We can't afford that." },
  { id: "never_gets", label: "I want never gets." },
  { id: "like_us", label: "People like us don't have money." },
  { id: "more_less", label: "If I have more, someone else has less." },
  { id: "lonely", label: "Money changes people. You won't know who your friends are." },
  { id: "dirty", label: "Rich people are greedy. That's dirty money." },
  { id: "spiritual", label: "Good, spiritual people aren't meant to be wealthy." },
  { id: "hard", label: "You have to work hard for every cent." },
  { id: "card", label: "Just put it on the card." },
  { id: "taboo", label: "We don't talk about money in this house." },
  { id: "worth", label: "You get what you're worth, and not a cent more." },
];

// Money atmosphere locator (offered after open reflection, optional)
const HOMES = [
  { id: "scarcity", label: "Scarcity", note: "tight and anxious, never quite enough" },
  { id: "control", label: "Control", note: "watched, counted, held very carefully" },
  { id: "silence", label: "Silence", note: "a closed door, never discussed" },
  { id: "status", label: "Status", note: "about how things looked from outside" },
  { id: "feast", label: "Feast and famine", note: "plenty, then panic, no steady middle" },
];
const HOME_READ = {
  scarcity: "A home built on scarcity teaches the body that more is never safe, only briefly survived. That can become a clenched fist around money, or the opposite, spending it before it can be taken.",
  control: "A home built on control teaches that safety comes from gripping. The grip itself, more than the balance, becomes the feeling of being okay.",
  silence: "A home that went silent on money teaches that the subject itself is dangerous, so as an adult you may avoid your own numbers, because looking feels like opening a door you were taught to keep shut.",
  status: "A home built on appearances teaches that money is a performance, so your worth can quietly attach to what is visible, and the quiet kind of wealth can feel like it does not count.",
  feast: "A home that swung between feast and famine teaches that calm is just the pause before the next drop, so a full account can feel unfamiliar, and a part of you makes sure it empties.",
};
// Childhood home gently predisposes an adult money relationship. A small nudge
// (one question's worth) tips ties without overriding a clear quiz result.
const HOME_NUDGE = {
  scarcity: { keeper: 2, prover: 1 },
  control: { keeper: 2, provider: 1 },
  silence: { avoider: 2 },
  status: { spender: 2, provider: 1 },
  feast: { spender: 2, avoider: 1 },
};
// The archetype a given home most often grows, for the connecting copy.
const HOME_AFFINITY = { scarcity: "keeper", control: "keeper", silence: "avoider", status: "spender", feast: "spender" };

// Money-story archetypes (distinct from the platform pattern archetypes).
// These describe a woman's inherited RELATIONSHIP to money, not her protection pattern.
const ARCHETYPES = {
  keeper: {
    name: "The Keeper",
    line: "holds on tightly, in case it disappears",
    body:
      "Money, to you, is something to guard. You save, you watch, you keep a careful eye, and even when there is plenty a part of you braces for the day it vanishes. Spending on yourself can feel almost dangerous. Underneath the caution is a younger you who learned, somewhere, that money was not safe to enjoy, only to hold.",
    protects: "It protects you from loss by keeping a tight grip, so you are never caught short.",
    costs: "It costs you enjoyment and ease. More money rarely brings more peace, because the fear of losing it travels with you.",
    move: "Your work this season is to let money move a little, on purpose, and find that safety does not vanish when you spend.",
    rep: "This week, spend a small amount on something purely for your own enjoyment, with no justification. Notice the discomfort, breathe through it, and let yourself keep the pleasure.",
  },
  spender: {
    name: "The Spender",
    line: "lets money move through her hands",
    body:
      "Money, to you, is meant to be lived. It comes in and flows out again, on joy, on others, on the moment, and a full account can feel strangely unfamiliar, almost dull. You are brilliant at making it and just as quick to release it. Beneath the open hand is often a quiet belief that there will always be more, or that holding on is not really for someone like you.",
    protects: "It protects you from feeling small by refusing to live small, and from the discomfort of holding what feels unfamiliar.",
    costs: "It costs you a foundation. The wealth never quite settles, because a part of you keeps the account at the level it knows.",
    move: "Your work this season is to let an account stay full long enough to feel familiar, so keeping becomes as natural to you as giving.",
    rep: "This week, set aside one small amount and do not touch it, simply to let your body practise the unfamiliar feeling of money staying.",
  },
  avoider: {
    name: "The Avoider",
    line: "looks away to feel safe",
    body:
      "Money, to you, is something you would rather not look at. The unopened envelope, the banking app you close fast, the admin you keep meaning to do. It is not laziness. Somewhere you learned that money was stressful, or shameful, or simply not discussed, so your safest move became not looking. The trouble is that what you will not look at tends to run you from the dark.",
    protects: "It protects you from anxiety and shame by keeping money out of sight.",
    costs: "It costs you agency. Decisions get made by avoidance rather than choice, and the not knowing slowly grows heavier than the knowing would.",
    move: "Your work this season is to look, gently and briefly, and learn that facing the number is almost always lighter than dreading it.",
    rep: "This week, open your accounts once, for two minutes, with a hand on your heart and a kind word to yourself. You do not have to fix anything. Just look, and breathe.",
  },
  provider: {
    name: "The Provider",
    line: "takes care of everyone but herself",
    body:
      "Money, to you, is for the people you love. You give, you fund, you rescue, you pick up the bill, and you are usually the last person on your own list. Being needed feels like being valuable. Beneath the generosity is often a belief that your worth lives in what you provide, and that keeping something for yourself is somehow selfish.",
    protects: "It protects your sense of worth by making you indispensable to the people around you.",
    costs: "It costs you yourself. There is rarely anything left over for your own dreams, and resentment can grow quietly underneath the giving.",
    move: "Your work this season is to put yourself on your own list, and to learn that you are worthy whether or not you are providing.",
    rep: "This week, keep one thing for yourself that you would normally give away, money, time, or energy, and let yourself feel worthy without earning it through giving.",
  },
  prover: {
    name: "The Prover",
    line: "believes money must be earned the hard way",
    body:
      "Money, to you, is something you must earn, and earn hard. Ease feels suspicious, and receiving without working for it feels almost wrong. You can make money, but usually through effort and often exhaustion, because somewhere you learned that you must work hard for every cent, and that suffering is the price of deserving. Rest can feel unearned.",
    protects: "It protects you from the fear of not deserving by making sure you always pay in effort first.",
    costs: "It costs you rest and receiving. Money stays tied to struggle, so the more you have, the harder you feel you must work to keep deserving it.",
    move: "Your work this season is to receive something you did not have to suffer for, and to let it be safe to hold money that came easily.",
    rep: "This week, accept one thing you did not earn, a gift, a kindness, some help, a rest, without paying it back or explaining it away. Let your body learn that ease is allowed.",
  },
};

// The money-story quiz. Each option awards points across the five money archetypes.
const QUIZ = [
  {
    id: "q1",
    q: "A larger-than-expected amount lands in your account. Your very first instinct is to",
    options: [
      { label: "Tuck it away quickly and try not to touch it.", s: { keeper: 2 } },
      { label: "Think of something to enjoy, or someone to spoil.", s: { spender: 2 } },
      { label: "Barely register it, and avoid looking too closely.", s: { avoider: 2 } },
      { label: "Feel a flicker that I have not really earned it yet.", s: { prover: 2 } },
    ],
  },
  {
    id: "q2",
    q: "Deep down, money feels most like",
    options: [
      { label: "Something that could vanish, so I guard it.", s: { keeper: 2 } },
      { label: "Something to enjoy while it is here.", s: { spender: 2 } },
      { label: "Something I hold for the people I love.", s: { provider: 2 } },
      { label: "Something earned, and only through hard work.", s: { prover: 2 } },
    ],
  },
  {
    id: "q3",
    q: "When you spend on yourself, just for you, you feel",
    options: [
      { label: "Anxious, like I should be saving it instead.", s: { keeper: 2 } },
      { label: "Good. That is what money is for.", s: { spender: 2 } },
      { label: "Guilty, it could have gone to someone else.", s: { provider: 2 } },
      { label: "Fine, but only once I feel I have earned it.", s: { prover: 2 } },
    ],
  },
  {
    id: "q4",
    q: "Your bank balance and statements are",
    options: [
      { label: "Checked often, and watched closely.", s: { keeper: 2 } },
      { label: "A bit of a blur, I do not really track them.", s: { spender: 2 } },
      { label: "Avoided. I would rather not open them.", s: { avoider: 2 } },
      { label: "Organised mostly around everyone else's needs.", s: { provider: 2 } },
    ],
  },
  {
    id: "q5",
    q: "The money belief that fits most snugly, even if you would argue with it",
    options: [
      { label: "If I let it go, there might not be more.", s: { keeper: 2 } },
      { label: "If I do not look at it, it cannot stress me.", s: { avoider: 2 } },
      { label: "Money is for the people I love, not really for me.", s: { provider: 2 } },
      { label: "I should have to earn whatever I get to keep.", s: { prover: 2 } },
    ],
  },
  {
    id: "q6",
    q: "People who know you well would say you are",
    options: [
      { label: "The one who always picks up the bill.", s: { provider: 2 } },
      { label: "Generous, and a little impulsive.", s: { spender: 2 } },
      { label: "Private, hard to read when it comes to money.", s: { avoider: 2 } },
      { label: "Always working, always earning.", s: { prover: 2 } },
    ],
  },
  {
    id: "q7",
    q: "The hardest thing for you with money is",
    options: [
      { label: "Letting myself actually spend and enjoy it.", s: { keeper: 2 } },
      { label: "Holding onto it, it slips through my hands.", s: { spender: 2 } },
      { label: "Facing it at all, the numbers, the truth of it.", s: { avoider: 2 } },
      { label: "Receiving it without feeling I owe something back.", s: { prover: 2 } },
    ],
  },
  {
    id: "q8",
    q: "If you suddenly had far more money than you do now, the first feeling would be",
    options: [
      { label: "Fear of losing it, so I would lock it away.", s: { keeper: 2 } },
      { label: "Excitement, and a long list of things to do.", s: { spender: 2 } },
      { label: "Overwhelm, I would not know where to begin.", s: { avoider: 2 } },
      { label: "Relief that I could finally take care of everyone.", s: { provider: 2 } },
    ],
  },
];

// Setpoint ladder for the thermostat
const RUNGS = [
  { v: 0, label: "Just getting by", note: "survival, watching every cent",
    reflect: "Your body reads survival as home. At this setting every cent is watched, and rest can feel unearned. More may even feel suspicious, as if it will only be taken away." },
  { v: 1, label: "Covering the basics", note: "the bills are paid, barely",
    reflect: "Your body reads just enough as home. The margin is thin and familiar. Climb above it and a quiet part of you may spend back down to the line you know." },
  { v: 2, label: "Comfortable", note: "a little breathing room",
    reflect: "Your body reads comfortable as home. There is breathing room, and it feels safe because it is known. Stretching into real surplus can feel oddly unsettling." },
  { v: 3, label: "More than enough", note: "a buffer and real choices",
    reflect: "Your body reads more than enough as home, a high and healthy setting. The work here is holding steady when a windfall lands, rather than levelling yourself back down." },
  { v: 4, label: "Wealthy", note: "freedom, ease, options",
    reflect: "Your body reads wealth as home, which is rare and hard won. The edge to watch is the leap to overflow, where even a settled nervous system can brace at the unfamiliar." },
  { v: 5, label: "Overflow", note: "more than you could spend",
    reflect: "Your body reads overflow as home. If that feels steady and true, beautiful. If it feels more like a story you are telling than a thing you can feel, notice that gap. The gap is the work." },
];

// Snap-back behaviours, each with its own interpretation
const SNAPBACKS = [
  { id: "upgrade", label: "A surprise expense or sudden urge to upgrade appears right after a good month.",
    reflect: "The surprise expense after a good month is the thermostat cooling the room. A part of you restores the balance it recognises." },
  { id: "treat", label: "A reward or treat quietly cancels out what I just earned.",
    reflect: "The reward that cancels the win is not indulgence. It is regulation, returning you to the number that feels like home." },
  { id: "freeze", label: "I go quiet and exhausted, and stop doing the thing that was working.",
    reflect: "The sudden quiet and exhaustion is the plug being pulled. You climbed past familiar too fast, and the body hit the brake." },
  { id: "shrink", label: "I lower a price, or don't ask, before anyone pushes back.",
    reflect: "Lowering the price before anyone pushes is a preemptive return to safety. You settle the room before it can unsettle you." },
  { id: "avoid", label: "I stop looking at my accounts when they're doing well.",
    reflect: "Not looking when things are good is the body protecting a fragile new high it does not yet trust." },
  { id: "selfdoubt", label: "I tell myself, see, I can't stay consistent, something is wrong with me.",
    reflect: "The voice that says something is wrong with me is the cruelest misread. It is not a flaw. It is a setpoint doing its oldest job." },
];

// Desire locator (offered after open reflection)
const DESIRES = [
  { id: "security", label: "Security", note: "to feel safe, and stop bracing" },
  { id: "freedom", label: "Freedom", note: "to choose, to breathe, to not be trapped" },
  { id: "love", label: "Love", note: "to be seen and valued without earning it" },
];

// Body verdict after the worth declaration
const VERDICTS = [
  { id: "hot", label: "It went hot, or tight.", note: "a part of you does not believe it yet. That heat is honest. It is the gap between what is true and what feels familiar." },
  { id: "irritated", label: "A flash of irritation.", note: "something like, do not patronise me. That guardedness is a protector. It kept you from hoping for something that once disappointed you." },
  { id: "landed", label: "It landed, and sank in.", note: "worth already feels somewhat familiar to you. The work is to keep adding repetitions until it becomes home." },
  { id: "numb", label: "Nothing, or numb.", note: "numbness is often a held breath. The feeling is there, parked just below where you can reach it yet. Be gentle." },
];
const VERDICT_PHRASE = {
  hot: "still goes hot, because a part of you is not yet convinced",
  irritated: "sparks a flash of irritation, an old guard still on duty",
  landed: "lands and sinks in, worth is becoming familiar",
  numb: "goes quiet, the feeling still held just out of reach",
};

/* ----------------------------------------------------------------- sections */
const SECTIONS = [
  { key: "welcome", movement: "", eyebrow: "Begin here", title: "Start" },
  { key: "filter", movement: "Understand", eyebrow: "Understand · one", title: "Your Brain on Money" },
  { key: "program", movement: "Understand", eyebrow: "Understand · two", title: "Where It Was Installed" },
  { key: "thermostat", movement: "Understand", eyebrow: "Understand · three", title: "The Money Thermostat" },
  { key: "pattern", movement: "Uncover", eyebrow: "Uncover · one", title: "Your Protection Pattern" },
  { key: "tracing", movement: "Uncover", eyebrow: "Uncover · two", title: "Where It Began" },
  { key: "worth", movement: "Uncover", eyebrow: "Uncover · three", title: "Worth and Price" },
  { key: "rewrite", movement: "Rewrite", eyebrow: "Rewrite · one", title: "Rewriting the Story" },
  { key: "story", movement: "Rewrite", eyebrow: "Rewrite · two", title: "Your Money Story" },
];

/* ----------------------------------------------------------------- helpers */
function useReduced() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setR(m.matches);
    const fn = () => setR(m.matches);
    m.addEventListener?.("change", fn);
    return () => m.removeEventListener?.("change", fn);
  }, []);
  return r;
}

/* ----------------------------------------------------------------- app */
export default function YourMoneyStory() {
  const [idx, setIdx] = useState(0);
  const [visited, setVisited] = useState({ 0: true });
  const [a, setA] = useState({
    baseline: "",
    rasStep: 0,
    rasGreen: "",
    filterNote: "",
    homeFeel: "",
    scripts: {},
    home: "",
    memory: "",
    caregiver: "",
    bodyNow: "",
    quiz: {},
    revealed: false,
    setpoint: null,
    snapbacks: {},
    desireText: "",
    desire: "",
    verdict: "",
    pairs: [{ lie: "", truth: "" }],
  });
  const reduced = useReduced();
  const mainRef = useRef(null);
  const set = (patch) => setA((p) => ({ ...p, ...patch }));

  const go = (n) => {
    const next = Math.max(0, Math.min(SECTIONS.length - 1, n));
    setIdx(next);
    setVisited((v) => ({ ...v, [next]: true }));
    mainRef.current?.scrollTo?.({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  // archetype scoring
  const scores = useMemo(() => {
    const s = { keeper: 0, spender: 0, avoider: 0, provider: 0, prover: 0 };
    let answered = 0;
    QUIZ.forEach((q) => {
      const choice = a.quiz[q.id];
      if (choice == null) return;
      answered += 1;
      Object.entries(q.options[choice].s).forEach(([k, v]) => (s[k] += v));
    });
    // gentle home nudge, applied only once every question is answered
    if (answered === QUIZ.length && a.home && HOME_NUDGE[a.home]) {
      Object.entries(HOME_NUDGE[a.home]).forEach(([k, v]) => (s[k] += v));
    }
    return s;
  }, [a.quiz, a.home]);
  const ranked = useMemo(() => Object.entries(scores).sort((x, y) => y[1] - x[1]), [scores]);
  const dominantKey = ranked[0]?.[1] > 0 ? ranked[0][0] : null;
  const secondaryKey = ranked[1]?.[1] > 0 ? ranked[1][0] : null;
  const quizDone = Object.keys(a.quiz).length === QUIZ.length;

  const complete = (i) => {
    switch (SECTIONS[i].key) {
      case "welcome": return !!a.baseline.trim();
      case "filter": return a.rasStep >= 2 || !!a.filterNote.trim();
      case "program": return Object.values(a.scripts).some(Boolean) || !!a.homeFeel.trim();
      case "thermostat": return a.setpoint != null;
      case "pattern": return a.revealed && quizDone;
      case "tracing": return !!a.caregiver.trim() || !!a.memory.trim() || !!a.bodyNow.trim();
      case "worth": return !!a.verdict;
      case "rewrite": return a.pairs.some((p) => p.lie.trim() && p.truth.trim());
      case "story": return a.pairs.some((p) => p.lie.trim() && p.truth.trim());
      default: return false;
    }
  };

  const dom = dominantKey ? ARCHETYPES[dominantKey] : null;
  const homeObj = HOMES.find((h) => h.id === a.home);
  const homeExpectKey = a.home ? HOME_AFFINITY[a.home] : null;
  const homeExpect = homeExpectKey ? ARCHETYPES[homeExpectKey] : null;
  const homeAligned = !!(homeExpectKey && dominantKey && homeExpectKey === dominantKey);
  const desireObj = DESIRES.find((d) => d.id === a.desire);
  const chosenScripts = SCRIPTS.filter((s) => a.scripts[s.id]);

  const suggestedLie = useMemo(() => {
    if (chosenScripts.length)
      return `I am letting go of the belief, handed to me before I could question it, that ${chosenScripts[0].label.replace(/\.$/, "").toLowerCase()}.`;
    return "I am letting go of the belief, handed to me before I could question it, that I was born undeserving of money.";
  }, [chosenScripts]);
  const suggestedTruth = "I am rewarded for the value I create, not for how much I suffer, and more money is safe in my hands.";

  // group sidebar by movement
  const groups = [];
  SECTIONS.forEach((s, i) => {
    const last = groups[groups.length - 1];
    if (!last || last.movement !== s.movement) groups.push({ movement: s.movement, items: [{ s, i }] });
    else last.items.push({ s, i });
  });

  // numbered markers: intro is a dot, body steps are 01..n, the final synthesis is a star
  let cnt = 0;
  const markers = SECTIONS.map((s) => {
    if (s.key === "welcome") return { glyph: "•", kind: "dot" };
    if (s.key === "story") return { glyph: "✦", kind: "star" };
    cnt += 1;
    return { glyph: String(cnt).padStart(2, "0"), kind: "num" };
  });
  const doneCount = SECTIONS.reduce((acc, _s, i) => acc + (complete(i) ? 1 : 0), 0);
  const progressPct = Math.round((doneCount / SECTIONS.length) * 100);

  return (
    <div className="ym-app">
      <Fonts />
      <Style />

      <header className="ym-topbar">
        <div className="ym-topbar-brand">
          <span className="ym-logo">AW</span>
          <span className="ym-logolock">
            <span className="ym-logo-t">THE ALIGNED</span>
            <span className="ym-logo-s">Woman Co.</span>
          </span>
        </div>
        <div className="ym-topbar-main">
          <span className="ym-tab">{SECTIONS[idx].title}</span>
          <div className="ym-util">
            <button className="ym-util-link" onClick={() => { window.location.href = "/Dashboard"; }}>← Back to Dashboard</button>
            <span className="ym-saving"><span className="ym-saving-dot" />Auto-saving</span>
            <span className="ym-progresspill">{progressPct}%</span>
          </div>
        </div>
      </header>

      <div className="ym-progress-track"><div className="ym-progress-fill" style={{ width: `${progressPct}%` }} /></div>

      <div className="ym-shell">
        <aside className="ym-aside">
          <div className="ym-brand">
            <div className="ym-kicker">Integration Practice</div>
            <h1 className="ym-wordmark">Your <span className="ym-it">Money</span> Story</h1>
          </div>
          <nav className="ym-nav">
            {groups.map((g, gi) => (
              <div key={gi} className="ym-group">
                {g.movement && <div className="ym-grouplabel">{g.movement}</div>}
                {g.items.map(({ s, i }) => {
                  const active = i === idx;
                  const done = complete(i) && !active;
                  const m = markers[i];
                  return (
                    <button key={s.key} className={"ym-navitem" + (active ? " is-active" : "")} onClick={() => go(i)}>
                      <span className={"ym-ind" + (done ? " is-done" : "") + (active ? " is-cur" : "") + (m.kind === "star" ? " is-star" : "")}>
                        {done ? "✓" : m.glyph}
                      </span>
                      <span className="ym-navlabel">{s.title}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
          <button className="ym-backlink" onClick={() => { window.location.href = "/Dashboard"; }}>← Back to Dashboard</button>
          <a className="ym-expert" href="/experts/laura-thomas">
            <div className="ym-expert-av">LT</div>
            <div className="ym-expert-meta">
              <div className="ym-expert-name">Laura Jane Thomas</div>
              <div className="ym-expert-role">Founder | Nervous System &amp; Money</div>
            </div>
          </a>
        </aside>

        <main className="ym-main" ref={mainRef}>
          <div key={idx} className={reduced ? "ym-page" : "ym-page ym-fade"}>
            <div className="ym-eyebrow">{SECTIONS[idx].eyebrow}</div>

            {SECTIONS[idx].key === "welcome" && <Welcome a={a} set={set} />}
            {SECTIONS[idx].key === "filter" && <Filter a={a} set={set} />}
            {SECTIONS[idx].key === "program" && <Program a={a} set={set} chosen={chosenScripts} homeObj={homeObj} />}
            {SECTIONS[idx].key === "thermostat" && <Thermostat a={a} set={set} />}
            {SECTIONS[idx].key === "pattern" && (
              <Pattern a={a} set={set} quizDone={quizDone} dom={dom} secondary={secondaryKey ? ARCHETYPES[secondaryKey] : null} scores={scores} homeObj={homeObj} homeExpect={homeExpect} homeAligned={homeAligned} />
            )}
            {SECTIONS[idx].key === "tracing" && <Tracing a={a} set={set} />}
            {SECTIONS[idx].key === "worth" && <Worth a={a} set={set} desireObj={desireObj} />}
            {SECTIONS[idx].key === "rewrite" && <Rewrite a={a} set={set} suggestedLie={suggestedLie} suggestedTruth={suggestedTruth} />}
            {SECTIONS[idx].key === "story" && (
              <Story a={a} set={set} dom={dom} homeObj={homeObj} desireObj={desireObj} chosenScripts={chosenScripts} />
            )}
          </div>

          <div className="ym-foot">
            <button className="ym-ghost" onClick={() => go(idx - 1)} disabled={idx === 0} style={{ visibility: idx === 0 ? "hidden" : "visible" }}>← Previous</button>
            {idx < SECTIONS.length - 1 ? (
              <button className="ym-next" onClick={() => go(idx + 1)}>
                <span className="ym-nextlabel">Next</span>
                <span className="ym-nexttitle">{SECTIONS[idx + 1].title}</span>
                <span className="ym-arrow">→</span>
              </button>
            ) : (
              <span className="ym-end">Your story is yours to keep.</span>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- WELCOME */
function Welcome({ a, set }) {
  return (
    <>
      <H2>This is not really a workbook about <span className="ym-it">money</span>.</H2>
      <Lede>
        Money is rarely about money. It behaves more like a mirror. What you earn, what you keep,
        the ceiling you keep hitting, all of it reflects something underneath. Over the next little
        while we are going to find that something together, in three movements. First we will
        understand how your mind actually handles money, and there is real neuroscience here that
        almost no one is taught. Then we will gently uncover where your particular story began.
        Then you will rewrite it, in your own words.
      </Lede>
      <Lede>
        Here is the promise to hold onto. By the end, you will see that you were never bad with
        money. You were handed a story, very young, and told it was yours. The good news, and it is
        backed by how the brain works, is that a story can be rewritten.
      </Lede>
      <CareNote>
        A few words of care first. You set the pace. You can skip any question, sit with anything
        that stirs, and stop whenever you need to. Nothing here is graded, and no one else sees your
        answers. This is gentle self-reflection, not therapy, and if something heavy surfaces, that
        is worth taking to someone you trust.
      </CareNote>
      <Prompt>To begin, in one honest line, how would you describe your relationship with money right now.</Prompt>
      <TextArea value={a.baseline} onChange={(v) => set({ baseline: v })} placeholder="Whatever is true today. We will look back at this line at the very end." />
      {a.baseline.trim() && (
        <Reveal>
          Thank you for being honest. Keep that line in mind. We are not going to argue with it. We
          are going to understand where it came from, and then you get to decide whether it stays.
        </Reveal>
      )}
    </>
  );
}

/* ------------------------------------------------------------ FILTER (RAS) */
function Filter({ a, set }) {
  return (
    <>
      <H2>Your brain shows you a <span className="ym-it">filtered</span> world.</H2>
      <Lede>
        Before we talk about your money, a quick experiment, because it will make everything after
        it click. Play along, it takes fifteen seconds.
      </Lede>

      {a.rasStep === 0 && (
        <div className="ym-exp">
          <p className="ym-exp-step">Step one</p>
          <p className="ym-exp-instruction">
            Look up from this screen and slowly scan the room you are in. Silently count everything
            you can see that is the colour red. Take ten seconds and really look.
          </p>
          <button className="ym-cta" onClick={() => set({ rasStep: 1 })}>Done, I counted the red</button>
        </div>
      )}

      {a.rasStep === 1 && (
        <div className="ym-exp">
          <p className="ym-exp-step">Step two, do not look up again</p>
          <p className="ym-exp-instruction">
            Without looking back at the room, how much can you remember that was the colour green.
          </p>
          <Choices
            value={a.rasGreen}
            onChange={(v) => set({ rasGreen: v, rasStep: 2 })}
            options={[
              { id: "lots", label: "Quite a lot, actually." },
              { id: "some", label: "One or two things." },
              { id: "none", label: "No idea. I was only looking for red." },
            ]}
          />
        </div>
      )}

      {a.rasStep >= 2 && (
        <>
          <Reveal>
            Most people go blank on the green. Not because the green things were not there, but
            because I set your filter to red, and your brain did exactly what it does every waking
            second. It showed you what it was told to look for, and quietly hid the rest.
          </Reveal>
          <Teach label="What just happened">
            <p>
              Your eyes, ears, and skin take in around <Stat>11 million</Stat> bits of information
              every second. Your conscious mind can handle roughly <Stat>40 to 50</Stat> of them.
              Everything else is filtered out before you ever notice it.
            </p>
            <p>
              The filter doing this sits at the base of your brain. It is called the reticular
              activating system, and its only job is to decide which tiny slice of reality reaches
              you. It does not choose neutrally. It shows you more of whatever it has been trained
              to look for. Train it on red and you see red everywhere. Train it, young, on not
              enough, on money is stressful, on people like us do not get to have this, and it will
              find the evidence for that in your life every single day, and skip past the evidence
              against it. You are not imagining your money reality. You are, in part, filtering it.
            </p>
          </Teach>
          <Prompt>So, gently. When money comes up in your day, what does your filter tend to show you first.</Prompt>
          <TextArea value={a.filterNote} onChange={(v) => set({ filterNote: v })} placeholder="Whatever comes. For example, what is missing, what could go wrong, what others have, or something else entirely." />
        </>
      )}
    </>
  );
}

/* ----------------------------------------------------------------- PROGRAM */
function Program({ a, set, chosen, homeObj }) {
  const toggle = (id) => set({ scripts: { ...a.scripts, [id]: !a.scripts[id] } });
  return (
    <>
      <H2>Your filter was set before you could <span className="ym-it">question</span> it.</H2>
      <Teach label="The science">
        <p>
          So where did the filter get its settings. Mostly in your first seven years, before you
          could argue back. As a baby your brain runs in delta waves, the slow rhythm of deep
          sleep. From about two to six it runs mostly in theta, the same dreamy, suggestible state
          a hypnotist works hard to reach in an adult. The part of you that can fold its arms and
          say, hang on, is that actually true, is called the critical faculty, and it does not come
          online until around age <Stat>7</Stat>.
        </p>
        <p>
          Which means that during the exact years your money beliefs were forming, you had no
          filter and no defenses. You did not weigh what you were told about money. You downloaded
          it whole, like a program, from the people around you and the feeling in the room. Today
          around <Stat>95%</Stat> of what you do runs from that program, below your awareness. And
          its one job is not to make you happy or wealthy. It is to keep you safe. It does that with
          a single rule. Familiar is safe. Unfamiliar is danger. Hold onto that rule, because it
          explains almost everything that comes next.
        </p>
      </Teach>
      <Prompt>Take a breath and think back. Not the facts of money in your childhood home, but the feeling of it. What was it like.</Prompt>
      <TextArea value={a.homeFeel} onChange={(v) => set({ homeFeel: v })} placeholder="The atmosphere, the tone, what happened in the room when money came up. In your own words." />

      <Prompt soft>Many of us absorbed money in actual sentences. Tick any of these you genuinely heard or felt. Only the ones that are true.</Prompt>
      <div className="ym-checkgrid">
        {SCRIPTS.map((s) => (
          <button key={s.id} className={"ym-check" + (a.scripts[s.id] ? " is-on" : "")} onClick={() => toggle(s.id)}>
            <span className="ym-box">{a.scripts[s.id] ? "✓" : ""}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>
      {chosen.length > 0 && (
        <Reveal>
          <div className="ym-reveal-h">These were programmed, not chosen</div>
          <p style={{ margin: 0 }}>
            Read them back slowly. Not one of them is a fact about you. Each is a sentence someone
            else said, often in their own fear, that a small version of you absorbed as truth before
            you had any way to question it. That is the whole point. {chosen.length === 1 ? "It" : "They"} can be returned.
          </p>
        </Reveal>
      )}

      <Prompt soft>If you had to name the weather around money in that home, which comes closest. It is fine if none of them fit.</Prompt>
      <div className="ym-tiles">
        {HOMES.map((h) => (
          <button key={h.id} className={"ym-tile" + (a.home === h.id ? " is-on" : "")} onClick={() => set({ home: h.id })}>
            <span className="ym-tile-t">{h.label}</span>
            <span className="ym-tile-n">{h.note}</span>
          </button>
        ))}
      </div>
      {homeObj && (
        <Reveal>
          <div className="ym-reveal-h">What that taught your body</div>
          <p style={{ margin: 0 }}>{HOME_READ[homeObj.id]}</p>
        </Reveal>
      )}
    </>
  );
}

/* -------------------------------------------------------------- THERMOSTAT */
function Thermostat({ a, set }) {
  const rung = a.setpoint != null ? RUNGS[a.setpoint] : null;
  const toggle = (id) => set({ snapbacks: { ...a.snapbacks, [id]: !a.snapbacks[id] } });
  const chosen = SNAPBACKS.filter((s) => a.snapbacks[s.id]);
  return (
    <>
      <H2>Why more money can feel <span className="ym-it">unsafe</span>.</H2>
      <Teach label="The science">
        <p>
          Here is what that one rule, familiar is safe, does to money. Because your system treats
          familiar as safe, it holds a money setpoint, exactly the way a thermostat holds a
          temperature. Earn or hold more than feels familiar, and a part of you, below awareness,
          gets uneasy and works to bring you back down to the number it knows. Drop too low and it
          scrambles to climb back up.
        </p>
        <p>
          This is not weakness, and it is not bad maths. It is regulation. It is why roughly{" "}
          <Stat>70%</Stat> of lottery winners are broke within a few years, why most people who
          inherit money lose it, and why about seventy percent of wealthy families have lost the
          wealth by the second generation, and ninety percent by the third. The amount changed. The
          setpoint did not. Once you see this, what looked like self-sabotage starts to look like a
          thermostat simply doing its job.
        </p>
      </Teach>
      <Prompt>Where does money feel set for you right now. A felt sense, not your actual balance.</Prompt>
      <div className="ym-levels">
        {RUNGS.map((r) => (
          <button key={r.v} className={"ym-level" + (a.setpoint === r.v ? " is-on" : "")} onClick={() => set({ setpoint: r.v })}>
            <span className="ym-level-dot" />
            <span className="ym-level-text"><span className="ym-level-t">{r.label}</span><span className="ym-level-n">{r.note}</span></span>
          </button>
        ))}
      </div>
      {rung && (
        <Reveal>
          <p style={{ margin: 0 }}>{rung.reflect}</p>
          <p style={{ margin: "12px 0 0" }}>This is the temperature your system fights to hold. Willpower rarely beats it, but a setpoint can be raised, one small repetition of safety at a time.</p>
        </Reveal>
      )}
      <Prompt soft>See if you recognise how your thermostat pulls you back. Some of these may fit, and some may not fit at all.</Prompt>
      <div className="ym-checkgrid">
        {SNAPBACKS.map((s) => (
          <button key={s.id} className={"ym-check" + (a.snapbacks[s.id] ? " is-on" : "")} onClick={() => toggle(s.id)}>
            <span className="ym-box">{a.snapbacks[s.id] ? "✓" : ""}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>
      {chosen.length > 0 && (
        <Reveal>
          <div className="ym-reveal-h">{chosen.length === 1 ? "Your snap-back, read closely" : "Your snap-backs, read closely"}</div>
          <ul className="ym-snaplist">{chosen.map((s) => <li key={s.id}>{s.reflect}</li>)}</ul>
          <p style={{ margin: "12px 0 0" }}>None of these is a discipline problem. Say it plainly. It is not me, it is my nervous system. Once you can see {chosen.length === 1 ? "it" : "them"}, {chosen.length === 1 ? "it stops" : "they stop"} running you in the dark.</p>
        </Reveal>
      )}
    </>
  );
}

/* ----------------------------------------------------------------- PATTERN */
function Pattern({ a, set, quizDone, dom, secondary, scores, homeObj, homeExpect, homeAligned }) {
  const pick = (qid, oi) => set({ quiz: { ...a.quiz, [qid]: oi } });
  return (
    <>
      <H2>The shape your <span className="ym-it">protection</span> took.</H2>
      <Teach label="What to know first">
        <p>
          To keep you at that setpoint, your mind develops habits. They can look like personality,
          or money style, but underneath they are protection strategies, picked up young by watching
          the people around you. None of them is a flaw. Each one kept a younger you safe. The work
          is not to judge the strategy, it is to see it clearly, because what runs in the dark runs
          you. There are five common shapes.
        </p>
      </Teach>
      <Lede>
        There are no right answers and no good or bad result. Choose what is most true, even if it
        is only a little true.
      </Lede>

      {QUIZ.map((q, qi) => (
        <div key={q.id} className="ym-q">
          <div className="ym-qnum">Question {qi + 1} of {QUIZ.length}</div>
          <div className="ym-qtext">{q.q}</div>
          <div className="ym-qopts">
            {q.options.map((o, oi) => (
              <button key={oi} className={"ym-opt" + (a.quiz[q.id] === oi ? " is-on" : "")} onClick={() => pick(q.id, oi)}>
                <span className="ym-radio" /><span>{o.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      {!a.revealed && (
        <div className="ym-revealrow">
          <button className="ym-cta" disabled={!quizDone} onClick={() => set({ revealed: true })}>
            {quizDone ? "Show me my pattern" : `Answer all ${QUIZ.length} to see your pattern`}
          </button>
        </div>
      )}

      {a.revealed && dom && (
        <div className="ym-portrait">
          <div className="ym-portrait-eyebrow">Your protection pattern</div>
          <h3 className="ym-portrait-name">{dom.name}</h3>
          <p className="ym-portrait-line">The one who {dom.line}.</p>
          <p className="ym-portrait-body">{dom.body}</p>
          <div className="ym-portrait-grid">
            <div><div className="ym-pg-h">How it protects you</div><p>{dom.protects}</p></div>
            <div><div className="ym-pg-h">What it has cost you</div><p>{dom.costs}</p></div>
          </div>
          <div className="ym-portrait-move"><div className="ym-pg-h">Your next move</div><p>{dom.move}</p></div>
          <div className="ym-portrait-rep"><div className="ym-pg-h">Your first rep this week</div><p>{dom.rep}</p></div>
          {secondary && <p className="ym-secondary">A second pattern, <em>{secondary.name}</em>, runs close behind. Most of us are a blend. Notice where it shows up too.</p>}
          {homeObj && homeExpect && (
            <div className="ym-homelink">
              {homeAligned ? (
                <>This sits right where your story began. A home that felt <em>{homeObj.note}</em> tends to grow exactly this relationship with money.</>
              ) : (
                <>Worth noticing. A home that felt <em>{homeObj.note}</em> most often grows <em>{homeExpect.name}</em>, yet your answers point to <em>{dom.name}</em>. Both can be true. We often adapt, or even invert, the pattern we grew up around, so trust what felt most honest as you answered.</>
              )}
            </div>
          )}
          <div className="ym-bars">
            {Object.entries(scores).map(([k, v]) => {
              const max = Math.max(...Object.values(scores), 1);
              return (
                <div className="ym-bar" key={k}>
                  <span className="ym-barlabel">{ARCHETYPES[k].name.replace("The ", "")}</span>
                  <span className="ym-bartrack"><span className="ym-barfill" style={{ width: `${(v / max) * 100}%` }} /></span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

/* ----------------------------------------------------------------- TRACING */
function Tracing({ a, set }) {
  return (
    <>
      <H2>Now we go looking for where it <span className="ym-it">began</span>.</H2>
      <Teach label="A little science, so this feels safe">
        <p>
          You can see the machinery now, so we can go gently looking for where your particular story
          started. One piece of neuroscience first, because it makes this safe. When a feeling is
          triggered, the chemical surge of it lasts about <Stat>90 seconds</Stat>, and then it is
          built to pass. Ninety seconds.
        </p>
        <p>
          The reason a money fear can feel like it has lasted years is that most of us never let it
          move through. We slam the door on it, or we are so afraid of opening the door that we
          brace against it forever. So as we look back, you are allowed to feel what comes up. It is
          a wave, not a life sentence, and it is designed to move. Go only as far as feels okay, and
          skip anything you would rather not touch today.
        </p>
      </Teach>
      <Prompt>Whose relationship with money did you watch most closely growing up, and what did money seem to mean to them.</Prompt>
      <TextArea value={a.caregiver} onChange={(v) => set({ caregiver: v })} placeholder="For example, a parent, a grandparent. What money seemed to be for them: safety, stress, status, freedom." />
      <Prompt soft>If a memory comes, one you can look at comfortably, what is it. You are welcome to skip this.</Prompt>
      <TextArea value={a.memory} onChange={(v) => set({ memory: v })} placeholder="A money moment from childhood that feels okay to revisit. Skipping is completely fine." />
      <Prompt soft>And now. When money stresses you today, where do you feel it in your body, and how old does that feeling seem.</Prompt>
      <TextArea value={a.bodyNow} onChange={(v) => set({ bodyNow: v })} placeholder="For example, a tight chest that feels about seven years old. Notice without forcing." />
      <Ground>
        Whatever surfaced is welcome, and you do not have to fix it or even understand it yet. Take
        one slow breath. Feel your feet on the floor, or your hand resting wherever it is. You are
        here, now, and you are safe. When you are ready, we will keep going gently.
      </Ground>
    </>
  );
}

/* ------------------------------------------------------------------ WORTH */
function Worth({ a, set, desireObj }) {
  const v = VERDICTS.find((x) => x.id === a.verdict);
  return (
    <>
      <H2>Underneath money is almost always <span className="ym-it">worth</span>.</H2>
      <Teach label="The tangle to undo">
        <p>
          For nearly everyone, underneath money sits worth. We are handed a phrase that sounds
          empowering and quietly does harm. Charge what you are worth. The moment your price and
          your worth are tied together, every number becomes a test of whether you, as a person,
          deserve to exist, and of course that is terrifying to raise.
        </p>
        <p>
          So untie them. Your price reflects the value of what you provide. Your worth is not a
          number, not for sale, and not up for debate. And here is the hopeful part, the one that
          makes all of this possible. No baby was ever born believing it was unworthy of money.
          Every belief you carry was learned. Anything learned can be unlearned.
        </p>
      </Teach>
      <Prompt>When you imagine having genuinely enough, more than the setpoint you named, what actually changes for you.</Prompt>
      <TextArea value={a.desireText} onChange={(v2) => set({ desireText: v2 })} placeholder="Picture an ordinary day with enough. What is different. How do you feel, what do you do, who are you with." />
      <Prompt soft>If one word sits underneath what you just described, which is closest. It is fine to feel your own word instead.</Prompt>
      <div className="ym-tiles ym-tiles-3">
        {DESIRES.map((d) => (
          <button key={d.id} className={"ym-tile" + (a.desire === d.id ? " is-on" : "")} onClick={() => set({ desire: d.id })}>
            <span className="ym-tile-t">{d.label}</span><span className="ym-tile-n">{d.note}</span>
          </button>
        ))}
      </div>
      {desireObj && (
        <Reveal>
          <p style={{ margin: 0 }}>
            You named <strong>{desireObj.label.toLowerCase()}</strong>. That matters more than any
            budget, because money has been standing in for it. The deeper work is to give yourself{" "}
            {desireObj.label.toLowerCase()} in ways that do not depend on a number, so money can
            finally just be money.
          </p>
        </Reveal>
      )}

      <Lede>One small experiment, the only one that asks something of your body. Put one hand on your chest, soften your gaze, and quietly say these words, and mean them.</Lede>
      <div className="ym-declare"><p>I am worthy of wealth.</p><p>I deserve abundance.</p><p>I deserve a great deal.</p></div>
      <Prompt>Notice what happened in your body. The most honest answer is</Prompt>
      <Choices value={a.verdict} onChange={(v2) => set({ verdict: v2 })} options={VERDICTS.map((x) => ({ id: x.id, label: x.label }))} />
      {v && (
        <>
          <Reveal>
            <div className="ym-reveal-h">Whatever you felt is information, not a verdict</div>
            <p style={{ margin: 0 }}>{v.note}</p>
            <p style={{ margin: "12px 0 0" }}>That response is simply the current setpoint of your worth. Like any setpoint, it can be raised one repetition at a time. You just did one.</p>
          </Reveal>
          <Ground>
            That exercise asks a lot of the body. Let it settle now. Soften your shoulders, unclench
            your jaw, and take one breath all the way down. There is nothing to do with what came up.
            You only have to let it be here.
          </Ground>
        </>
      )}
    </>
  );
}

/* ---------------------------------------------------------------- REWRITE */
function Rewrite({ a, set, suggestedLie, suggestedTruth }) {
  const updatePair = (i, field, val) => set({ pairs: a.pairs.map((p, idx) => (idx === i ? { ...p, [field]: val } : p)) });
  const addPair = () => set({ pairs: [...a.pairs, { lie: "", truth: "" }] });
  const removePair = (i) => set({ pairs: a.pairs.filter((_, idx) => idx !== i) });
  const seedFirst = () => { const next = [...a.pairs]; next[0] = { lie: suggestedLie, truth: suggestedTruth }; set({ pairs: next }); };
  const firstEmpty = !a.pairs[0].lie.trim() && !a.pairs[0].truth.trim();
  return (
    <>
      <H2>Now you <span className="ym-it">rewrite</span> it.</H2>
      <Teach label="Why this works">
        <p>
          This is the part your brain makes possible. The same machinery that installed the old
          story can install a new one. Not by force, and not by repeating an affirmation you do not
          believe. You rewrite a setpoint the way the old one was built, by repetition and by making
          the new thing familiar, one small safe rep at a time. You let the ninety-second wave move
          through you instead of spending or freezing to escape it. And you write the new belief in
          your own words, true enough that you can actually feel it.
        </p>
      </Teach>
      <Lede>
        A money agreement comes in pairs. On the left, an old lie you were handed. On the right, the
        truer thing you are choosing instead. Write as many pairs as you need. Each lie deserves its
        own reframe, sitting right beside it.
      </Lede>
      <div className="ym-pairhead"><span>The old lie, let it go</span><span>The truth that replaces it</span></div>
      {a.pairs.map((p, i) => (
        <div className="ym-pairrow" key={i}>
          <div className="ym-paircell"><TextArea value={p.lie} onChange={(v) => updatePair(i, "lie", v)} placeholder={i === 0 ? suggestedLie : "Another belief you are ready to release."} /></div>
          <div className="ym-pairarrow" aria-hidden>→</div>
          <div className="ym-paircell">
            <TextArea value={p.truth} onChange={(v) => updatePair(i, "truth", v)} placeholder={i === 0 ? suggestedTruth : "The truer thing you choose in its place."} />
            {a.pairs.length > 1 && <button className="ym-remove" onClick={() => removePair(i)}>Remove</button>}
          </div>
        </div>
      ))}
      <div className="ym-pairactions">
        <button className="ym-addpair" onClick={addPair}>+ Add another reframe</button>
        {firstEmpty && <button className="ym-link" onClick={seedFirst}>Use starting words for the first pair</button>}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ STORY */
function Story({ a, set, dom, homeObj, desireObj, chosenScripts }) {
  const filled = a.pairs.filter((p) => p.lie.trim() && p.truth.trim());
  const ready = filled.length > 0;
  const rung = a.setpoint != null ? RUNGS[a.setpoint] : null;
  const snapEx = SNAPBACKS.find((s) => a.snapbacks[s.id]);
  const verdictPhrase = VERDICT_PHRASE[a.verdict];

  return (
    <>
      <H2>Your money story, in your <span className="ym-it">own words</span>.</H2>
      <Lede>
        You have done the understanding and the uncovering and the rewriting. Here it all is in one
        place: where your story came from, and the one you are choosing now. This is yours to keep.
      </Lede>

      {!ready && (
        <Reveal>
          Your story assembles here once you have written at least one reframe in the previous step.
          Head back to Rewriting the Story and name one old lie and the truth that replaces it.
        </Reveal>
      )}

      {ready && (
        <div className="ym-storycard">
          <div className="ym-story-eyebrow">Your money story</div>

          <div className="ym-movement">
            <div className="ym-move-h">Where your story came from</div>
            <div className="ym-story-body">
              <p>
                It began in the home you grew up in, where money felt like{" "}
                <em>{a.homeFeel.trim() ? a.homeFeel.trim().replace(/\.$/, "") : homeObj ? homeObj.label.toLowerCase() : "something unspoken"}</em>.
                {a.caregiver.trim() ? <> The relationship you watched most closely was <em>{a.caregiver.trim().replace(/\.$/, "")}</em>.</> : null}
                {chosenScripts.length ? <> You were handed beliefs like <em>{chosenScripts[0].label.replace(/\.$/, "").toLowerCase()}</em>{chosenScripts[1] ? <>, and <em>{chosenScripts[1].label.replace(/\.$/, "").toLowerCase()}</em></> : null}, before you could question them.</> : null}
              </p>
              {a.memory.trim() ? <p>One memory still holds it. <em>"{a.memory.trim()}"</em></p> : null}
              <p>
                Your brain filed all of it as familiar, and so as safe, and built a setpoint around
                it{rung ? <>, holding your money at <em>{rung.label.toLowerCase()}</em></> : null}. To
                protect that setpoint you learned to move through money as{" "}
                <em>{dom ? dom.name.toLowerCase() : "a protector"}</em>, the one who {dom ? dom.line : "kept you safe"}
                {snapEx ? <>, pulling you back with the snap-back you know well, <em>{snapEx.label.replace(/\.$/, "").toLowerCase()}</em></> : null}.
              </p>
              <p>
                {a.bodyNow.trim() ? <>You still feel it in the body. <em>{a.bodyNow.trim().replace(/\.$/, "")}</em>. </> : null}
                Underneath the whole story, what you have really been reaching for is{" "}
                <em>{desireObj ? desireObj.label.toLowerCase() : a.desireText.trim() ? a.desireText.trim().replace(/\.$/, "") : "to feel safe"}</em>.
                {verdictPhrase ? <> And when you claim your worth out loud, your body {verdictPhrase}, which simply shows how familiar worth feels right now.</> : null}
              </p>
            </div>
          </div>

          <div className="ym-movement ym-movement-new">
            <div className="ym-move-h">How you are rewriting it</div>
            <div className="ym-reframes">
              {filled.map((p, i) => (
                <div className="ym-reframe" key={i}>
                  <p className="ym-reframe-old">{p.lie.trim()}</p>
                  <span className="ym-reframe-arrow" aria-hidden>becomes</span>
                  <p className="ym-reframe-new">{p.truth.trim()}</p>
                </div>
              ))}
            </div>
            <div className="ym-story-body">
              {dom ? <p>{dom.move}</p> : null}
              {dom ? <p className="ym-story-rep"><span className="ym-rep-label">This week</span>{dom.rep}</p> : null}
              {a.baseline.trim() ? (
                <p className="ym-story-close">You arrived saying <em>"{a.baseline.trim().replace(/\.$/, "")}."</em> That was the old filter speaking. You were never bad with money. You were handed a story and told it was yours. This is the one you are choosing now, and you make it familiar one safe repetition at a time.</p>
              ) : (
                <p className="ym-story-close">You were never bad with money. You were handed a story and told it was yours. This is the one you are choosing now, and you make it familiar one safe repetition at a time.</p>
              )}
            </div>
          </div>

          <div className="ym-story-actions">
            <button className="ym-cta" onClick={() => {}}>Save my money story</button>
            <button className="ym-ghost2" onClick={() => {}}>Download as PDF</button>
          </div>
        </div>
      )}

      {ready && (
        <Ground label="You have done real work here">
          Before anything else, pause. This was honest, tender work, and you stayed with it. Take one
          slow breath and let that be enough for today. There is nothing you need to act on right now.
          Your story is saved, and it will be here whenever you return.
        </Ground>
      )}

      <div className="ym-nextstep">
        <div className="ym-ns-h">When you are ready, and only then</div>
        <p>
          This was the doorway. The Aligned Woman Blueprint is the room. Thirteen specialists, hand
          picked to teach ambitious women the things we were never taught, across body, nervous
          system, mind, money, and power. There is no rush. Your money story is welcome to come too,
          whenever the time is right for you.
        </p>
        <button className="ym-cta" onClick={() => { window.location.href = "/blueprint"; }}>Explore the Blueprint</button>
      </div>
    </>
  );
}

/* ----------------------------------------------------------------- shared UI */
function H2({ children }) { return <h2 className="ym-h2">{children}</h2>; }
function Lede({ children }) { return <p className="ym-lede">{children}</p>; }
function Prompt({ children, soft }) { return <p className={"ym-prompt" + (soft ? " is-soft" : "")}>{children}</p>; }
function Reveal({ children }) { return <div className="ym-reveal">{children}</div>; }
function Teach({ children, label }) {
  return (
    <div className="ym-teach">
      <div className="ym-teach-h"><span className="ym-teach-mark" aria-hidden>◆</span>{label}</div>
      <div className="ym-teach-body">{children}</div>
    </div>
  );
}
function Stat({ children }) { return <span className="ym-stat">{children}</span>; }
function CareNote({ children }) {
  return <div className="ym-care"><span className="ym-care-mark" aria-hidden>♥</span><div>{children}</div></div>;
}
function Ground({ children, label = "A moment to land" }) {
  return <div className="ym-ground" role="note"><div className="ym-ground-h">{label}</div><div className="ym-ground-body">{children}</div></div>;
}
function Choices({ value, onChange, options }) {
  return (
    <div className="ym-choices">
      {options.map((o) => (
        <button key={o.id} className={"ym-choice" + (value === o.id ? " is-on" : "")} onClick={() => onChange(o.id)}>
          <span className="ym-radio" /><span>{o.label}</span>
        </button>
      ))}
    </div>
  );
}
function TextArea({ value, onChange, placeholder }) {
  return <textarea className="ym-textarea" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} />;
}

/* ----------------------------------------------------------------- fonts */
function Fonts() {
  // DM Serif Display and Montserrat load globally in index.html, the same as Cindy's workbook.
  return null;
}

/* ----------------------------------------------------------------- styles */
function Style() {
  return (
    <style>{`
:root{--maroon:${C.maroon};--burg:${C.burgundy};--rose:${C.rose};--pink:${C.pink};--pink2:${C.pink2};--ink:${C.ink};--line:${C.line};}
*{box-sizing:border-box}
button{font-family:${sans};cursor:pointer}
.ym-it{font-style:italic;color:${C.rose}}

/* app frame */
.ym-app{display:flex;flex-direction:column;height:100vh;background:${C.pink}}

/* top bar */
.ym-topbar{flex:none;height:74px;display:grid;grid-template-columns:300px 1fr;border-bottom:1px solid var(--line);background:#fff}
.ym-topbar-brand{display:flex;align-items:center;gap:12px;padding:0 26px;border-right:1px solid var(--line)}
.ym-logo{flex:none;width:40px;height:40px;border-radius:50%;background:${C.maroon};color:#fff;display:grid;place-items:center;font-family:${serif};font-weight:600;font-size:15px;letter-spacing:.02em}
.ym-logolock{display:flex;flex-direction:column;line-height:1.1}
.ym-logo-t{font-size:12px;font-weight:700;letter-spacing:.14em;color:${C.ink}}
.ym-logo-s{font-family:${serif};font-style:italic;font-size:15px;color:${C.rose}}
.ym-topbar-main{display:flex;align-items:center;justify-content:space-between;padding:0 30px}
.ym-tab{position:relative;font-size:14.5px;font-weight:600;color:${C.maroon};padding:26px 2px;border-bottom:2px solid ${C.maroon};margin-bottom:-1px}
.ym-util{display:flex;align-items:center;gap:22px}
.ym-util-link{background:none;border:0;font-size:13.5px;color:${C.burgundy};font-weight:500}
.ym-util-link:hover{color:${C.maroon}}
.ym-saving{display:flex;align-items:center;gap:7px;font-size:13px;font-style:italic;color:rgba(42,18,24,.55)}
.ym-saving-dot{width:7px;height:7px;border-radius:50%;background:${C.rose};animation:ympulse 2s ease-in-out infinite}
@keyframes ympulse{0%,100%{opacity:.4}50%{opacity:1}}
@media (prefers-reduced-motion: reduce){.ym-saving-dot{animation:none}}
.ym-progresspill{font-size:13px;font-weight:600;color:${C.burgundy};border:1px solid var(--line);border-radius:999px;padding:6px 14px}
.ym-progress-track{height:2px;width:100%;background:rgba(74,14,46,0.06)}
.ym-progress-fill{height:100%;background:var(--aw-grad-progress);transition:width 320ms ease}

/* shell + light sidebar */
.ym-shell{flex:1;display:grid;grid-template-columns:300px 1fr;min-height:0}
.ym-aside{background:#fff;color:${C.ink};padding:34px 26px;display:flex;flex-direction:column;height:100%;overflow-y:auto;border-right:1px solid var(--line)}
.ym-kicker{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:${C.rose};font-weight:600}
.ym-wordmark{font-family:${serif};font-weight:500;font-size:30px;line-height:1.08;margin:10px 0 0;color:${C.maroon}}
.ym-nav{margin-top:30px;display:flex;flex-direction:column;gap:16px;flex:1}
.ym-group{display:flex;flex-direction:column;gap:2px}
.ym-grouplabel{font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:${C.rose};font-weight:700;margin:0 0 6px 12px}
.ym-navitem{display:flex;align-items:center;gap:13px;background:none;border:0;padding:9px 12px;border-radius:10px;text-align:left;color:rgba(42,18,24,.72);transition:background .2s,color .2s;width:100%}
.ym-navitem:hover{background:${C.pink2};color:${C.maroon}}
.ym-navitem.is-active{background:${C.pink2};color:${C.maroon}}
.ym-navlabel{font-size:13.5px;font-weight:500;line-height:1.3}
.ym-ind{flex:none;width:26px;height:26px;border-radius:50%;border:1px solid var(--line);display:grid;place-items:center;font-size:10.5px;font-weight:700;color:rgba(42,18,24,.5);background:#fff}
.ym-ind.is-star{font-size:12px;color:${C.rose}}
.ym-navitem.is-active .ym-ind,.ym-ind.is-cur{border-color:${C.maroon};background:${C.maroon};color:#fff}
.ym-ind.is-done{border-color:${C.maroon};background:${C.maroon};color:#fff}
.ym-backlink{align-self:flex-start;background:none;border:0;color:${C.burgundy};font-size:13.5px;font-weight:500;padding:14px 12px}
.ym-backlink:hover{color:${C.maroon}}
.ym-expert{display:flex;align-items:center;gap:12px;margin-top:10px;padding-top:18px;border-top:1px solid var(--line);text-decoration:none;color:inherit;cursor:pointer;transition:opacity .18s}
.ym-expert:hover{opacity:.78}
.ym-expert-av{flex:none;width:44px;height:44px;border-radius:50%;background:${C.maroon};color:#fff;display:grid;place-items:center;font-family:${serif};font-weight:600;font-size:16px}
.ym-expert-name{font-size:14px;font-weight:700;color:${C.ink}}
.ym-expert-role{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:rgba(42,18,24,.55);font-weight:600;margin-top:3px;line-height:1.35}

.ym-main{position:relative;height:100%;overflow-y:auto;padding:54px 7vw 30px}
.ym-page{padding-bottom:120px;max-width:820px}
.ym-fade{animation:ymfade .5s cubic-bezier(.2,.7,.3,1) both}
@keyframes ymfade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){.ym-fade{animation:none}}
.ym-eyebrow{font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:${C.burgundy};font-weight:600;margin-bottom:14px}
.ym-h2{font-family:${serif};font-weight:500;font-size:44px;line-height:1.1;color:${C.maroon};margin:0 0 22px;max-width:760px}
.ym-foot{max-width:820px}
.ym-lede{font-size:17px;line-height:1.7;color:${C.ink};max-width:680px;margin:0 0 16px}
.ym-prompt{font-family:${serif};font-style:italic;font-size:20px;line-height:1.5;color:${C.burgundy};margin:30px 0 16px;max-width:660px}
.ym-prompt.is-soft{font-size:18px;color:${C.ink};opacity:.92}

/* teaching block */
.ym-teach{max-width:700px;background:#fff;border:1px solid var(--line);border-left:3px solid ${C.maroon};border-radius:0 16px 16px 0;padding:22px 26px;margin:6px 0 8px}
.ym-teach-h{display:flex;align-items:center;gap:9px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:${C.maroon};font-weight:700;margin-bottom:12px}
.ym-teach-mark{color:${C.rose};font-size:10px}
.ym-teach-body p{font-size:16px;line-height:1.72;color:${C.ink};margin:0 0 14px}
.ym-teach-body p:last-child{margin-bottom:0}
.ym-stat{font-family:${serif};font-style:normal;font-weight:600;color:${C.maroon};background:${C.roseSoft};padding:1px 8px;border-radius:6px;white-space:nowrap}

/* experiment */
.ym-exp{max-width:660px;background:${C.pink2};border:1px solid var(--line);border-radius:16px;padding:24px 28px;margin:6px 0}
.ym-exp-step{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:${C.burgundy};font-weight:600;margin:0 0 10px}
.ym-exp-instruction{font-family:${serif};font-size:21px;line-height:1.5;color:${C.maroon};margin:0 0 18px}

/* choices / radios */
.ym-choices{display:flex;flex-direction:column;gap:10px;max-width:680px}
.ym-choice,.ym-opt{display:flex;align-items:flex-start;gap:14px;background:#fff;border:1px solid var(--line);border-radius:13px;padding:15px 17px;text-align:left;font-size:15px;line-height:1.45;color:${C.ink};transition:border-color .18s,background .18s,box-shadow .18s}
.ym-choice:hover,.ym-opt:hover{border-color:${C.rose}}
.ym-choice.is-on,.ym-opt.is-on{border-color:${C.maroon};background:${C.pink2};box-shadow:0 0 0 1px ${C.maroon} inset}
.ym-radio{flex:none;width:18px;height:18px;border-radius:50%;border:1.5px solid var(--line);margin-top:1px;position:relative}
.is-on .ym-radio{border-color:${C.maroon}}
.is-on .ym-radio::after{content:"";position:absolute;inset:3px;border-radius:50%;background:${C.maroon}}

/* checkboxes */
.ym-checkgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:760px}
.ym-check{display:flex;align-items:flex-start;gap:12px;background:#fff;border:1px solid var(--line);border-radius:12px;padding:13px 15px;text-align:left;font-size:14.5px;line-height:1.4;color:${C.ink};transition:border-color .18s,background .18s}
.ym-check:hover{border-color:${C.rose}}
.ym-check.is-on{border-color:${C.maroon};background:${C.pink2}}
.ym-box{flex:none;width:20px;height:20px;border-radius:6px;border:1.5px solid var(--line);display:grid;place-items:center;font-size:13px;color:#fff}
.ym-check.is-on .ym-box{background:${C.maroon};border-color:${C.maroon}}

/* tiles */
.ym-tiles{display:grid;grid-template-columns:1fr 1fr 1fr;gap:11px;max-width:760px}
.ym-tile{display:flex;flex-direction:column;gap:6px;background:#fff;border:1px solid var(--line);border-radius:14px;padding:16px;text-align:left;transition:border-color .18s,background .18s,transform .18s}
.ym-tile:hover{border-color:${C.rose};transform:translateY(-2px)}
.ym-tile.is-on{border-color:${C.maroon};background:${C.pink2};box-shadow:0 0 0 1px ${C.maroon} inset}
.ym-tile-t{font-family:${serif};font-size:20px;color:${C.maroon};font-weight:500}
.ym-tile-n{font-size:12.5px;line-height:1.45;color:${C.ink};opacity:.78}

/* textarea */
.ym-textarea{width:100%;max-width:680px;display:block;background:#fff;border:1px solid var(--line);border-radius:13px;padding:15px 17px;font-family:${sans};font-size:15px;line-height:1.6;color:${C.ink};resize:vertical}
.ym-textarea:focus{outline:none;border-color:${C.maroon};box-shadow:0 0 0 1px ${C.maroon} inset}
.ym-textarea::placeholder{color:rgba(42,18,24,.42)}

/* reveal */
.ym-reveal{margin:22px 0 0;max-width:700px;background:${C.roseSoft};border-left:3px solid ${C.rose};border-radius:0 13px 13px 0;padding:18px 22px;font-size:15.5px;line-height:1.65;color:${C.ink};animation:ymslide .45s ease both}
@keyframes ymslide{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){.ym-reveal{animation:none}}
.ym-reveal strong{color:${C.maroon}}
.ym-reveal-h{font-family:${serif};font-style:italic;font-size:19px;color:${C.maroon};margin-bottom:8px}
.ym-snaplist{margin:6px 0 0;padding-left:20px}
.ym-snaplist li{margin:7px 0;line-height:1.5}

/* care + ground */
.ym-care{display:flex;gap:14px;max-width:680px;margin:8px 0 4px;background:#fff;border:1px solid var(--line);border-radius:14px;padding:18px 20px;font-size:14.5px;line-height:1.65;color:${C.ink}}
.ym-care-mark{flex:none;color:${C.rose};font-size:17px}
.ym-ground{max-width:680px;margin:22px 0 0;background:${C.pink2};border:1px solid var(--line);border-radius:16px;padding:20px 24px;text-align:center}
.ym-ground-h{font-family:${serif};font-style:italic;font-size:18px;color:${C.maroon};margin-bottom:8px}
.ym-ground-body{font-size:15px;line-height:1.7;color:${C.ink};opacity:.9;max-width:520px;margin:0 auto}

/* quiz */
.ym-q{margin:0 0 26px;max-width:760px}
.ym-qnum{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:${C.burgundy};font-weight:600;margin-bottom:8px}
.ym-qtext{font-family:${serif};font-size:23px;line-height:1.35;color:${C.maroon};margin-bottom:14px}
.ym-qopts{display:flex;flex-direction:column;gap:9px}
.ym-revealrow{margin:14px 0 0;max-width:760px}
.ym-cta{background:${C.maroon};color:#fff;border:0;border-radius:999px;padding:15px 30px;font-size:15px;font-weight:600;transition:background .18s,transform .18s}
.ym-cta:hover:not(:disabled){background:${C.burgundy};transform:translateY(-1px)}
.ym-cta:disabled{opacity:.4;cursor:not-allowed}

/* portrait */
.ym-portrait{margin:30px 0 0;max-width:760px;background:${C.maroon};color:#fff;border-radius:20px;padding:38px 40px;animation:ympop .55s cubic-bezier(.2,.8,.2,1) both}
@keyframes ympop{from{opacity:0;transform:scale(.97) translateY(10px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){.ym-portrait{animation:none}}
.ym-portrait-eyebrow{font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:${C.rose};font-weight:600}
.ym-portrait-name{font-family:${serif};font-weight:500;font-size:40px;margin:10px 0 4px;line-height:1.05}
.ym-portrait-line{font-family:${serif};font-style:italic;font-size:21px;color:${C.rose};margin:0 0 18px}
.ym-portrait-body{font-size:16px;line-height:1.7;color:rgba(255,255,255,.9);margin:0 0 22px}
.ym-portrait-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;border-top:1px solid rgba(255,255,255,.16);padding-top:20px}
.ym-pg-h{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:${C.rose};font-weight:600;margin-bottom:7px}
.ym-portrait-grid p,.ym-portrait-move p,.ym-portrait-rep p{font-size:14.5px;line-height:1.6;color:rgba(255,255,255,.85);margin:0}
.ym-portrait-move{margin-top:20px;border-top:1px solid rgba(255,255,255,.16);padding-top:20px}
.ym-portrait-rep{margin-top:18px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);border-radius:13px;padding:16px 20px}
.ym-portrait-rep p{color:#fff}
.ym-secondary{font-size:14px;line-height:1.6;color:rgba(255,255,255,.72);margin:20px 0 0}
.ym-secondary em{color:${C.rose};font-style:italic}
.ym-homelink{font-size:14.5px;line-height:1.65;color:rgba(255,255,255,.8);margin:16px 0 0;padding:14px 18px;background:rgba(255,255,255,.07);border-left:2px solid ${C.rose};border-radius:0 11px 11px 0}
.ym-homelink em{color:${C.rose};font-style:italic}
.ym-bars{margin-top:22px;display:flex;flex-direction:column;gap:9px}
.ym-bar{display:grid;grid-template-columns:130px 1fr;align-items:center;gap:12px}
.ym-barlabel{font-size:12px;color:rgba(255,255,255,.75)}
.ym-bartrack{height:7px;background:rgba(255,255,255,.14);border-radius:4px;overflow:hidden}
.ym-barfill{display:block;height:100%;background:${C.rose};border-radius:4px;transition:width .7s cubic-bezier(.2,.8,.2,1)}

/* level cards */
.ym-levels{display:flex;flex-direction:column;gap:9px;max-width:640px}
.ym-level{display:flex;align-items:center;gap:14px;background:#fff;border:1px solid var(--line);border-radius:13px;padding:14px 18px;text-align:left;transition:border-color .18s,background .18s}
.ym-level:hover{border-color:${C.rose}}
.ym-level.is-on{border-color:${C.maroon};background:${C.pink2};box-shadow:0 0 0 1px ${C.maroon} inset}
.ym-level-dot{flex:none;width:16px;height:16px;border-radius:50%;border:1.5px solid var(--line);position:relative}
.ym-level.is-on .ym-level-dot{border-color:${C.maroon}}
.ym-level.is-on .ym-level-dot::after{content:"";position:absolute;inset:3px;border-radius:50%;background:${C.maroon}}
.ym-level-text{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}
.ym-level-t{font-family:${serif};font-size:20px;color:${C.maroon};font-weight:500}
.ym-level-n{font-size:13px;color:${C.ink};opacity:.7}

/* declaration */
.ym-declare{max-width:680px;background:${C.maroon};color:#fff;border-radius:16px;padding:30px 36px;text-align:center;margin:8px 0 4px}
.ym-declare p{font-family:${serif};font-size:26px;line-height:1.4;margin:4px 0}

/* reframe editor */
.ym-link{background:none;border:0;color:${C.burgundy};font-size:13.5px;text-decoration:underline;text-underline-offset:3px;padding:8px 0 0}
.ym-link:hover{color:${C.maroon}}
.ym-pairhead{display:grid;grid-template-columns:1fr 34px 1fr;gap:0 14px;max-width:760px;margin:6px 0 8px}
.ym-pairhead span{font-size:11px;letter-spacing:.16em;text-transform:uppercase;font-weight:600;color:${C.burgundy}}
.ym-pairhead span:last-child{grid-column:3}
.ym-pairrow{display:grid;grid-template-columns:1fr 34px 1fr;gap:0 14px;align-items:start;max-width:760px;margin:0 0 12px}
.ym-paircell{display:flex;flex-direction:column;gap:6px}
.ym-paircell .ym-textarea{max-width:none}
.ym-pairarrow{align-self:center;text-align:center;color:${C.rose};font-size:18px}
.ym-remove{align-self:flex-start;background:none;border:0;color:${C.burgundy};opacity:.65;font-size:12.5px;text-decoration:underline;text-underline-offset:3px;padding:2px 0}
.ym-remove:hover{opacity:1;color:${C.maroon}}
.ym-pairactions{display:flex;align-items:center;gap:18px;max-width:760px;margin:4px 0 0;flex-wrap:wrap}
.ym-addpair{background:#fff;border:1px dashed ${C.rose};color:${C.maroon};border-radius:11px;padding:11px 18px;font-size:14px;font-weight:600}
.ym-addpair:hover{background:${C.pink2}}

/* story snapshot */
.ym-storycard{max-width:720px;margin:18px 0 28px;background:${C.maroon};color:#fff;border:1px solid ${C.maroon};border-radius:20px;padding:38px 40px;box-shadow:0 16px 48px rgba(92,26,46,.2);animation:ympop .55s cubic-bezier(.2,.8,.2,1) both}
@media (prefers-reduced-motion: reduce){.ym-storycard{animation:none}}
.ym-story-eyebrow{font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:${C.rose};font-weight:600;margin-bottom:6px}
.ym-movement{padding:24px 0;border-top:1px solid rgba(255,255,255,.16)}
.ym-movement:first-of-type{border-top:0;padding-top:6px}
.ym-move-h{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:${C.rose};font-weight:600;margin-bottom:14px}
.ym-story-body p{font-family:${serif};font-size:19px;line-height:1.6;color:rgba(255,255,255,.9);margin:0 0 14px}
.ym-story-body em{font-style:italic;color:${C.rose}}
.ym-reframes{display:flex;flex-direction:column;gap:14px;margin-bottom:20px}
.ym-reframe{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:13px;padding:16px 20px}
.ym-reframe-old{font-family:${serif};font-style:italic;font-size:17px;color:rgba(255,255,255,.62);margin:0;text-decoration:line-through;text-decoration-color:rgba(196,114,127,.6)}
.ym-reframe-arrow{display:inline-block;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:${C.rose};margin:8px 0 6px}
.ym-reframe-new{font-family:${serif};font-size:20px;color:#fff;margin:0;line-height:1.4}
.ym-story-rep{font-family:${sans}!important;font-size:15px!important;line-height:1.65;color:rgba(255,255,255,.92)!important;background:rgba(255,255,255,.08);border-radius:12px;padding:16px 18px;margin:0 0 14px!important}
.ym-rep-label{display:inline-block;font-family:${sans};font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:${C.rose};font-weight:600;margin-right:10px}
.ym-story-close{font-size:17px!important;opacity:.9;margin-top:18px!important}
.ym-story-actions{display:flex;gap:12px;margin-top:26px;flex-wrap:wrap}
.ym-storycard .ym-cta{background:#fff;color:${C.maroon}}
.ym-storycard .ym-cta:hover:not(:disabled){background:${C.pink};transform:translateY(-1px)}
.ym-ghost2{background:transparent;border:1px solid rgba(255,255,255,.5);color:#fff;border-radius:999px;padding:14px 26px;font-size:14.5px;font-weight:600}
.ym-ghost2:hover{background:rgba(255,255,255,.12);border-color:#fff}

/* next step */
.ym-nextstep{max-width:700px;background:${C.pink2};border:1px solid var(--line);border-radius:18px;padding:30px 34px;margin-top:8px}
.ym-ns-h{font-family:${serif};font-style:italic;font-size:22px;color:${C.maroon};margin-bottom:10px}
.ym-nextstep p{font-size:15.5px;line-height:1.65;color:${C.ink};margin:0 0 18px}

/* footer nav */
.ym-foot{position:sticky;bottom:0;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 0;margin-top:auto;background:linear-gradient(180deg,rgba(249,237,231,0),${C.pink} 38%)}
.ym-ghost{background:none;border:0;color:${C.burgundy};font-size:14px;font-weight:600;padding:10px 4px}
.ym-ghost:hover{color:${C.maroon}}
.ym-next{display:flex;align-items:center;gap:10px;background:${C.maroon};color:#fff;border:0;border-radius:999px;padding:13px 24px;transition:background .18s,transform .18s}
.ym-next:hover{background:${C.burgundy};transform:translateY(-1px)}
.ym-nextlabel{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:${C.rose}}
.ym-nexttitle{font-family:${serif};font-size:17px}
.ym-arrow{font-size:16px}
.ym-end{font-family:${serif};font-style:italic;font-size:16px;color:${C.burgundy}}

@media (max-width:860px){
  .ym-app{height:auto;min-height:100vh}
  .ym-topbar{grid-template-columns:1fr;height:auto}
  .ym-topbar-brand{border-right:0;border-bottom:1px solid var(--line);padding:14px 20px}
  .ym-topbar-main{padding:12px 20px;flex-wrap:wrap;gap:10px}
  .ym-tab{padding:6px 2px}
  .ym-util{gap:14px}
  .ym-shell{grid-template-columns:1fr}
  .ym-aside{height:auto;padding:22px 20px;border-right:0;border-bottom:1px solid var(--line)}
  .ym-nav{flex-direction:row;flex-wrap:wrap;gap:12px;margin-top:18px}
  .ym-group{flex:1 1 auto}
  .ym-navlabel{display:none}
  .ym-grouplabel{margin-left:2px}
  .ym-navitem{width:auto;padding:8px 10px}
  .ym-backlink{display:none}
  .ym-expert{border-top:0;padding-top:0;margin-top:14px}
  .ym-main{height:auto;overflow:visible;padding:30px 22px 40px}
  .ym-h2{font-size:30px}
  .ym-checkgrid,.ym-tiles,.ym-tiles-3{grid-template-columns:1fr}
  .ym-portrait-grid{grid-template-columns:1fr;gap:18px}
  .ym-bar{grid-template-columns:96px 1fr}
  .ym-pairhead{display:none}
  .ym-pairrow{grid-template-columns:1fr;gap:8px;border:1px solid var(--line);border-radius:14px;padding:12px;background:rgba(255,255,255,.4)}
  .ym-pairarrow{transform:rotate(90deg)}
  .ym-storycard,.ym-portrait{padding:28px 22px}
  .ym-level-text{flex-direction:column;gap:2px}
}
`}</style>
  );
}