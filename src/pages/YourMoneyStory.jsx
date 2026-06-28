import React, { useState, useMemo, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

/**
 * YOUR MONEY STORY  ·  Free integration workbook (starting-point pattern)
 * The Aligned Woman Co  ·  interactive mockup for review
 *
 * Grounded in four source teachings:
 *  - "The Worth Beneath the Money" (Laura's talk / cue cards)
 *  - Marisa Peer x Masoom Minawala (money blocks, worth, receiving)
 *  - Nagoski x Nagoski (feelings are tunnels, complete the stress cycle)
 *  - Brigitte (nervous-system setpoint, the wealth thermostat)
 *
 * Five locked archetypes scored by the Money Pattern quiz:
 *  Performer · Over-Functioner · Outsourcer · Overrider · Reactor
 *
 * No em dashes anywhere. Brand: DM Serif Display headings, Montserrat body (live workbook palette).
 */

/* ----------------------------------------------------------------- tokens */
// Brand tokens mapped to the live workbook palette (src/index.css :root).
// Headings use burgundy, body uses dark-grey, the same as the other workbooks.
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

// The inherited scripts (childhood money beliefs from the source material)
const SCRIPTS = [
  { id: "trees", label: "Money doesn't grow on trees." },
  { id: "afford", label: "We can't afford that." },
  { id: "never_gets", label: "I want never gets." },
  { id: "like_us", label: "People like us don't have money." },
  { id: "more_less", label: "If I have more, someone else has less." },
  { id: "lonely", label: "Money makes you lonely. You won't know who your friends are." },
  { id: "dirty", label: "Rich people are greedy. That's dirty money." },
  { id: "spiritual", label: "Good, spiritual people aren't meant to be wealthy." },
  { id: "hard", label: "You have to work hard for every cent." },
  { id: "card", label: "Just put it on the card." },
  { id: "taboo", label: "We don't talk about money in this house." },
  { id: "worth", label: "You get what you're worth, and not a cent more." },
];

// What the money atmosphere felt like at home
const HOMES = [
  {
    id: "scarcity",
    label: "Scarcity",
    note: "Tight, anxious, always one expense away from trouble.",
    reflect:
      "A home built on scarcity teaches the body that more is never safe, only briefly survived. As an adult you may save with a clenched fist, or swing the other way and spend before it can be taken.",
  },
  {
    id: "control",
    label: "Control",
    note: "Money was watched, counted, and held very carefully.",
    reflect:
      "A home built on control teaches that safety comes from gripping. As an adult you may track every cent and still feel uneasy, because the grip itself, not the balance, became the feeling of safety.",
  },
  {
    id: "avoidance",
    label: "Silence",
    note: "Money was a closed door. Nobody spoke about it.",
    reflect:
      "A home that went silent on money teaches that the subject itself is dangerous. As an adult you may avoid your own numbers, because looking feels like opening a door you were taught to keep shut.",
  },
  {
    id: "status",
    label: "Status",
    note: "Money was about how things looked from the outside.",
    reflect:
      "A home built on appearances teaches that money is a performance. As an adult your worth can quietly attach to what is visible, and the quiet, invisible kind of wealth can feel like it doesn't count.",
  },
  {
    id: "feast",
    label: "Feast and famine",
    note: "Plenty one month, panic the next. No steady middle.",
    reflect:
      "A home that swung between feast and famine teaches the body that calm is just the pause before the next drop. As an adult a full account can feel unfamiliar, so a part of you makes sure it empties.",
  },
];

// The five archetypes (locked) with portraits
const ARCHETYPES = {
  performer: {
    name: "The Performer",
    line: "You earn your worth.",
    body:
      "Money, for you, is proof that you are enough. You over-deliver, you out-work the room, and rest feels faintly dangerous, because if you stop proving, who are you. The hustle is not greed. It is a small girl who learned that being good enough was something you had to keep winning.",
    protects: "It protects you from the fear of not being enough by making sure you are always doing more.",
    costs: "It costs you rest, and it means no amount of success ever quite lands. The finish line keeps moving.",
    move:
      "Your work this season is to receive without earning first. To let one good thing arrive that you did not exhaust yourself for, and to let your body call it safe.",
    rep:
      "This week, receive one thing without earning it first. Let someone buy the coffee, accept a compliment with only thank you, or take a rest you did not justify. Notice the urge to repay it, and let the urge pass.",
  },
  overfunctioner: {
    name: "The Over-Functioner",
    line: "You hold it all together.",
    body:
      "You manage the money, yours and often everyone else's. You know the numbers, the dates, the balances. Letting go of the reins feels reckless. Underneath the spreadsheets is a nervous system that learned safety means holding on tightly and never, ever dropping the rope.",
    protects: "It protects you from chaos by keeping everything under your hands at once.",
    costs: "It costs you ease. Even in plenty, money stays a job rather than a flow, and you rarely feel held yourself.",
    move:
      "Your work this season is to loosen the grip on purpose, in one small place, and prove to your body that the ground does not disappear when you stop bracing.",
    rep:
      "This week, choose one small money task and deliberately leave it unmanaged for a day. Do not check it, do not fix it. Let your body learn that the ground holds even when you loosen your grip.",
  },
  outsourcer: {
    name: "The Outsourcer",
    line: "Your peace lives outside you.",
    body:
      "Your sense of okay rises and falls with the balance, the client reply, the market, the opinion of someone whose approval you did not ask for. You check the app the way you'd check for danger. Every price becomes a quiet referendum on whether you are allowed to exist.",
    protects: "It protects you by searching the outside world for proof that you are safe and worthy.",
    costs: "It costs you steadiness. Peace stays conditional, on loan from things you can never fully control.",
    move:
      "Your work this season is to build the security inside first, so that the number stops being the verdict on your soul.",
    rep:
      "This week, before you open the banking app, pause and name how you feel first. Decide your okayness before you see the number, so the number stops getting the final word on your worth.",
  },
  overrider: {
    name: "The Overrider",
    line: "You push past your own signals.",
    body:
      "When the body says slow down, you call it laziness and power through. You override the freeze, the fatigue, the quiet voice that says this is too far too fast. You are proud of your discipline. You also cannot understand why momentum keeps collapsing right when things start to work.",
    protects: "It protects you by staying in motion and in control, refusing to let feeling slow you down.",
    costs: "It costs you sustainability. The further you override the setpoint, the harder the rubber band snaps you back.",
    move:
      "Your work this season is to listen to the brake instead of flooring past it, and to raise the setpoint slowly enough that your body comes with you.",
    rep:
      "This week, when your body says slow down, believe it once. Stop ten minutes before you think you should, and call it wisdom rather than weakness. Notice that nothing falls apart.",
  },
  reactor: {
    name: "The Reactor",
    line: "Your money moves with your moods.",
    body:
      "Money is how you regulate. A hard week becomes a treat, a flush month becomes a spree, a scary number becomes a thing you simply do not look at. It is not a discipline problem. It is a nervous system reaching for the nearest soothing thing, and money is right there in your hand.",
    protects: "It protects you by soothing the feeling fast, before it can become unbearable.",
    costs: "It costs you stability. A full account feels unfamiliar, so a part of you quietly makes sure it drains back out.",
    move:
      "Your work this season is to feel the wave for its ninety seconds before you reach for the card, and to let a full account become familiar enough to keep.",
    rep:
      "This week, when a feeling sends you toward a purchase, set a timer for ninety seconds and just feel the wave first. Buy afterwards if you still want to. Most of the time, the wave passes before the timer does.",
  },
};

// The Money Pattern quiz. Each option awards points across archetypes.
const QUIZ = [
  {
    id: "q1",
    q: "A surprisingly large payment lands in your account. The first thing you feel is",
    options: [
      { label: "A flicker of guilt, like I haven't earned the right to this yet.", s: { performer: 2 } },
      { label: "An urge to immediately plan, allocate, and control every cent of it.", s: { overfunctioner: 2 } },
      { label: "Relief, finally, followed quickly by checking it's really there.", s: { outsourcer: 2 } },
      { label: "A buzz, and a sudden idea of something to treat myself to.", s: { reactor: 2 } },
    ],
  },
  {
    id: "q2",
    q: "Things are going well. Momentum is building. Without quite meaning to, you",
    options: [
      { label: "Pile on more work, because surely this can't last unless I push.", s: { performer: 2, overrider: 1 } },
      { label: "Go quiet and inexplicably exhausted, and stop doing what was working.", s: { reactor: 1, overrider: 2 } },
      { label: "Refresh the numbers constantly to make sure it's still true.", s: { outsourcer: 2 } },
      { label: "Tighten control of everything in case it slips away.", s: { overfunctioner: 2 } },
    ],
  },
  {
    id: "q3",
    q: "Naming your price out loud, to a client or a boss, feels like",
    options: [
      { label: "A test I have to pass by proving the value first.", s: { performer: 2 } },
      { label: "A referendum on whether I, as a person, am worth it.", s: { outsourcer: 2 } },
      { label: "Something I'd rather not look at too closely, so I'll keep it low.", s: { reactor: 1, outsourcer: 1 } },
      { label: "Fine. I've done the maths. The number is the number.", s: { overfunctioner: 1, overrider: 1 } },
    ],
  },
  {
    id: "q4",
    q: "When a bill or a hard money task arrives, you tend to",
    options: [
      { label: "Open it immediately and handle it, jaw tight, just to control it.", s: { overfunctioner: 2 } },
      { label: "Power through it fast and tell myself to stop being dramatic.", s: { overrider: 2 } },
      { label: "Let it sit unopened, because looking makes me anxious.", s: { reactor: 2 } },
      { label: "Worry about what it says about how I'm doing overall.", s: { outsourcer: 2 } },
    ],
  },
  {
    id: "q5",
    q: "The belief that fits most snugly, even if you'd argue with it out loud",
    options: [
      { label: "If I'm not working, I'm not worth paying.", s: { performer: 2 } },
      { label: "If I let go of the reins, it all falls apart.", s: { overfunctioner: 2 } },
      { label: "My bank balance tells me whether I'm okay.", s: { outsourcer: 2 } },
      { label: "Feelings are a distraction. I just need more discipline.", s: { overrider: 2 } },
    ],
  },
  {
    id: "q6",
    q: "Receiving something, a gift, a compliment, a tip you didn't expect, you usually",
    options: [
      { label: "Deflect, or rush to give something back so it's even.", s: { performer: 1, outsourcer: 1 } },
      { label: "Say sorry, or downplay it, before I can say thank you.", s: { outsourcer: 2 } },
      { label: "Feel a flash of why are you patronising me.", s: { overrider: 2 } },
      { label: "Take it, ride the high, and want more of that feeling.", s: { reactor: 2 } },
    ],
  },
  {
    id: "q7",
    q: "Rest, real rest, with money handled and nothing to do, feels",
    options: [
      { label: "Uncomfortable. I should be earning or improving something.", s: { performer: 2 } },
      { label: "Impossible. There's always a number to check or fix.", s: { overfunctioner: 2 } },
      { label: "Fragile. I can't relax until I know the outside world is stable.", s: { outsourcer: 2 } },
      { label: "Boring. I'll find something to spend or do to feel a spark.", s: { reactor: 2 } },
    ],
  },
  {
    id: "q8",
    q: "When you imagine holding far more money than you do now, your body",
    options: [
      { label: "Wants to know how I'll deserve and protect it through effort.", s: { performer: 2 } },
      { label: "Immediately wants a system to manage and contain it.", s: { overfunctioner: 2 } },
      { label: "Braces, like it's not really mine and could vanish.", s: { outsourcer: 1, reactor: 1 } },
      { label: "Tightens and quietly says this is too unfamiliar to be safe.", s: { overrider: 2 } },
    ],
  },
];

// Setpoint ladder for the thermostat
const RUNGS = [
  {
    v: 0, label: "Just getting by", note: "survival, watching every cent",
    reflect:
      "Your body reads survival as home. At this setting every cent is watched, and rest can feel like a luxury you have not earned. More may even feel suspicious, like it will only be taken away.",
  },
  {
    v: 1, label: "Covering the basics", note: "the bills are paid, barely",
    reflect:
      "Your body reads just enough as home. The bills get paid, but the margin is thin and familiar. Climb above it and a quiet part of you may spend back down to the line you know.",
  },
  {
    v: 2, label: "Comfortable", note: "a little breathing room",
    reflect:
      "Your body reads comfortable as home. There is breathing room, and it feels safe because it is known. Stretching into real surplus can feel oddly unsettling, like wearing someone else's coat.",
  },
  {
    v: 3, label: "More than enough", note: "a buffer, real choices",
    reflect:
      "Your body reads more than enough as home, a high and healthy setting. The work here is holding steady when a windfall lands, instead of unconsciously levelling yourself back down.",
  },
  {
    v: 4, label: "Wealthy", note: "freedom, ease, options",
    reflect:
      "Your body reads wealth as home. That is rare and hard won. The edge to watch is the leap to overflow, where even a regulated nervous system can brace at the unfamiliar.",
  },
  {
    v: 5, label: "Overflow", note: "more than you could spend",
    reflect:
      "Your body reads overflow as home. If that feels steady and true, beautiful. If it feels more like a story you are telling than a thing you can feel, notice that gap. The gap is the work.",
  },
];

// Snap-back behaviours, each with its own interpretation
const SNAPBACKS = [
  {
    id: "upgrade",
    label: "A surprise expense or sudden urge to upgrade appears right after a good month.",
    reflect: "The surprise expense after a good month is the thermostat cooling the room. A part of you restores the balance it recognises.",
  },
  {
    id: "treat",
    label: "A reward or treat quietly cancels out what I just earned.",
    reflect: "The reward that cancels the win is not indulgence. It is regulation, returning you to the number that feels like home.",
  },
  {
    id: "freeze",
    label: "I go quiet and exhausted, and stop doing the thing that was working.",
    reflect: "The sudden quiet and exhaustion is the plug being pulled. You climbed past familiar too fast, and the body hit the brake.",
  },
  {
    id: "shrink",
    label: "I lower a price, or don't ask, before anyone pushes back.",
    reflect: "Lowering the price before anyone pushes is a preemptive return to safety. You settle the room before it can unsettle you.",
  },
  {
    id: "avoid",
    label: "I stop looking at my accounts when they're doing well.",
    reflect: "Not looking when things are good is the body protecting a fragile new high it does not yet trust.",
  },
  {
    id: "selfdoubt",
    label: "I tell myself, see, I can't stay consistent, something is wrong with me.",
    reflect: "The voice that says something is wrong with me is the cruelest misread. It is not a flaw. It is a setpoint doing its oldest job.",
  },
];

// Complaint and desire beneath
const COMPLAINTS = [
  { id: "behind", label: "I can never get ahead." },
  { id: "notenough", label: "There's never quite enough." },
  { id: "keep", label: "I make it, but I can't seem to keep it." },
  { id: "deserve", label: "I work hard, so why isn't it landing." },
];
const DESIRES = [
  { id: "security", label: "Security", note: "to finally feel safe, and stop bracing." },
  { id: "freedom", label: "Freedom", note: "to choose, to breathe, to not be trapped." },
  { id: "love", label: "Love", note: "to be seen, valued, and held without earning it." },
];

// Body verdict after the worth declaration
const VERDICTS = [
  { id: "hot", label: "It went hot.", note: "a part of you doesn't believe it yet. That heat is honest. It is the gap between what's true and what feels familiar." },
  { id: "irritated", label: "A flash of irritation.", note: "like, don't patronise me. That guardedness is a protector. It kept you from hoping for something that once disappointed you." },
  { id: "landed", label: "It landed. It sank in.", note: "worth already feels somewhat familiar to you. Your work is to keep adding reps so it becomes home." },
  { id: "numb", label: "Nothing, or numb.", note: "numbness is often a held breath. The feeling is there, parked just below where you can reach it yet. Be gentle." },
];

// Short phrasings for the closing snapshot
const FEELING_PHRASE = {
  freeze: "freezing, or going a little blank",
  brace: "bracing, as though bad news is coming",
  avoid: "looking away, because you would rather not",
  fine: "staying calm, telling yourself it is only numbers",
};
const VERDICT_PHRASE = {
  hot: "still goes hot, because a part of you is not convinced yet",
  irritated: "sparks a flash of irritation, an old guard still on duty",
  landed: "lands and sinks in, worth is becoming familiar",
  numb: "goes quiet, the feeling still held just out of reach",
};

/* ----------------------------------------------------------------- sections */
const SECTIONS = [
  { key: "welcome", eyebrow: "Begin here", title: "The Mirror" },
  { key: "inheritance", eyebrow: "Part one", title: "The Inheritance" },
  { key: "home", eyebrow: "Part two", title: "The House You Grew Up In" },
  { key: "pattern", eyebrow: "Part three", title: "Your Money Pattern" },
  { key: "thermostat", eyebrow: "Part four", title: "The Thermostat" },
  { key: "desire", eyebrow: "Part five", title: "The Desire Beneath" },
  { key: "worth", eyebrow: "Part six", title: "The Worth Beneath" },
  { key: "story", eyebrow: "Part seven", title: "Write Your Money Story" },
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
    feeling: "",
    scripts: {},
    memory: "",
    home: "",
    caregiver: "",
    quiz: {},
    revealed: false,
    setpoint: null,
    snapbacks: {},
    complaint: "",
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

  // ── Access: the first half is free, the rest needs an account ──
  // FIRST_HALF_END is the last freely accessible section (the Money Pattern reveal).
  const FIRST_HALF_END = 3;
  const [isAuthed, setIsAuthed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let alive = true;
    base44.auth
      .me()
      .then(() => alive && setIsAuthed(true))
      .catch(() => alive && setIsAuthed(false))
      .finally(() => alive && setAuthChecked(true));
    return () => {
      alive = false;
    };
  }, []);

  // Returning after sign-up: hydrate the first-half answers handed across the gate.
  useEffect(() => {
    if (!authChecked || !isAuthed) return;
    try {
      const raw = localStorage.getItem("aw_moneystory");
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.a) setA((p) => ({ ...p, ...saved.a }));
        if (saved && typeof saved.nextIdx === "number") go(saved.nextIdx);
        localStorage.removeItem("aw_moneystory");
      }
    } catch (e) {
      // ignore a malformed handoff payload
    }
  }, [authChecked, isAuthed]);

  const gate = () => {
    try {
      localStorage.setItem(
        "aw_moneystory",
        JSON.stringify({
          a,
          nextIdx: Math.min(idx + 1, SECTIONS.length - 1),
          completed_at: new Date().toISOString(),
        })
      );
    } catch (e) {
      // storage unavailable, continue to sign-up regardless
    }
    window.location.href = "/register?from_url=/YourMoneyStory";
  };

  const locked = (i) => !isAuthed && i > FIRST_HALF_END;
  const atGate = !isAuthed && idx >= FIRST_HALF_END;

  const goNext = () => {
    if (atGate) {
      gate();
      return;
    }
    go(idx + 1);
  };

  // archetype scoring
  const scores = useMemo(() => {
    const s = { performer: 0, overfunctioner: 0, outsourcer: 0, overrider: 0, reactor: 0 };
    QUIZ.forEach((q) => {
      const choice = a.quiz[q.id];
      if (choice == null) return;
      const opt = q.options[choice];
      Object.entries(opt.s).forEach(([k, v]) => (s[k] += v));
    });
    return s;
  }, [a.quiz]);

  const ranked = useMemo(
    () => Object.entries(scores).sort((x, y) => y[1] - x[1]),
    [scores]
  );
  const dominantKey = ranked[0]?.[1] > 0 ? ranked[0][0] : null;
  const secondaryKey = ranked[1]?.[1] > 0 ? ranked[1][0] : null;
  const quizDone = Object.keys(a.quiz).length === QUIZ.length;

  // section completion for the sidebar
  const complete = (i) => {
    switch (SECTIONS[i].key) {
      case "welcome": return !!a.feeling;
      case "inheritance": return Object.values(a.scripts).some(Boolean);
      case "home": return !!a.home;
      case "pattern": return a.revealed && quizDone;
      case "thermostat": return Object.values(a.snapbacks).some(Boolean);
      case "desire": return !!a.desire;
      case "worth": return !!a.verdict;
      case "story": return a.pairs.some((p) => p.lie.trim() && p.truth.trim());
      default: return false;
    }
  };

  const dom = dominantKey ? ARCHETYPES[dominantKey] : null;
  const homeObj = HOMES.find((h) => h.id === a.home);
  const desireObj = DESIRES.find((d) => d.id === a.desire);
  const complaintObj = COMPLAINTS.find((c) => c.id === a.complaint);
  const chosenScripts = SCRIPTS.filter((s) => a.scripts[s.id]);

  // auto suggestion for the old lie
  const suggestedLie = useMemo(() => {
    if (chosenScripts.length) {
      return `I let go of the belief, handed to me long before I could question it, that "${chosenScripts[0].label.replace(/\.$/, "")}."`;
    }
    return "I let go of the belief, handed to me long before I could question it, that I was born undeserving of money.";
  }, [chosenScripts]);

  const suggestedTruth =
    "I am rewarded for the value I create, not for how much I suffer. More money is safe in my hands.";

  return (
    <div style={{ minHeight: "100vh", background: C.pink, fontFamily: sans, color: C.ink }}>
      <Fonts />
      <Style />
      <div className="ym-shell">
        {/* sidebar */}
        <aside className="ym-aside">
          <div className="ym-brand">
            <div className="ym-kicker">The Aligned Woman</div>
            <h1 className="ym-wordmark">
              Your Money <span className="ym-it">Story</span>
            </h1>
            <p className="ym-sub">A free integration. Roughly fifteen minutes, just for you.</p>
          </div>
          <nav className="ym-nav">
            {SECTIONS.map((s, i) => {
              const active = i === idx;
              const done = complete(i);
              return (
                <button
                  key={s.key}
                  className={"ym-navitem" + (active ? " is-active" : "")}
                  onClick={() => (locked(i) ? gate() : go(i))}
                >
                  <span className={"ym-dot" + (done ? " is-done" : "") + (active ? " is-cur" : "")}>
                    {done ? "✓" : i + 1}
                  </span>
                  <span className="ym-navlabel">{s.title}</span>
                </button>
              );
            })}
          </nav>
          <div className="ym-asidefoot">@alignedlaura</div>
        </aside>

        {/* main */}
        <main className="ym-main" ref={mainRef}>
          <div key={idx} className={reduced ? "ym-page" : "ym-page ym-fade"}>
            <div className="ym-eyebrow">{SECTIONS[idx].eyebrow}</div>

            {SECTIONS[idx].key === "welcome" && (
              <Welcome a={a} set={set} />
            )}
            {SECTIONS[idx].key === "inheritance" && (
              <Inheritance a={a} set={set} chosen={chosenScripts} />
            )}
            {SECTIONS[idx].key === "home" && (
              <HomeSection a={a} set={set} homeObj={homeObj} />
            )}
            {SECTIONS[idx].key === "pattern" && (
              <Pattern
                a={a}
                set={set}
                quizDone={quizDone}
                dom={dom}
                secondary={secondaryKey ? ARCHETYPES[secondaryKey] : null}
                scores={scores}
              />
            )}
            {SECTIONS[idx].key === "thermostat" && (
              <Thermostat a={a} set={set} />
            )}
            {SECTIONS[idx].key === "desire" && (
              <Desire a={a} set={set} complaintObj={complaintObj} desireObj={desireObj} />
            )}
            {SECTIONS[idx].key === "worth" && (
              <Worth a={a} set={set} />
            )}
            {SECTIONS[idx].key === "story" && (
              <Story
                a={a}
                set={set}
                suggestedLie={suggestedLie}
                suggestedTruth={suggestedTruth}
                dom={dom}
                homeObj={homeObj}
                desireObj={desireObj}
                complaintObj={complaintObj}
                chosenScripts={chosenScripts}
              />
            )}
          </div>

          {/* bottom nav */}
          <div className="ym-foot">
            <button
              className="ym-ghost"
              onClick={() => go(idx - 1)}
              disabled={idx === 0}
              style={{ visibility: idx === 0 ? "hidden" : "visible" }}
            >
              ← Previous
            </button>
            {idx < SECTIONS.length - 1 ? (
              <button className="ym-next" onClick={goNext}>
                {authChecked && atGate ? (
                  <>
                    <span className="ym-nextlabel">Sign up to continue</span>
                    <span className="ym-nexttitle">Your money story</span>
                    <span className="ym-arrow">→</span>
                  </>
                ) : (
                  <>
                    <span className="ym-nextlabel">Next</span>
                    <span className="ym-nexttitle">{SECTIONS[idx + 1].title}</span>
                    <span className="ym-arrow">→</span>
                  </>
                )}
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
  const opts = [
    {
      id: "freeze",
      label: "I freeze, or go a little blank.",
      phrase: "freeze, or go a little blank",
      reflect:
        "Freezing is the nervous system pulling the plug. When a thing feels too big to face, your body chooses stillness over risk. That is not weakness. It is an old, automatic kind of protection.",
    },
    {
      id: "brace",
      label: "I brace, like bad news is coming.",
      phrase: "brace, as though bad news is coming",
      reflect:
        "Bracing means your body learned that money news is usually bad news. Somewhere behind you is a room where the numbers brought tension, and your body still expects the flinch before you have even looked.",
    },
    {
      id: "avoid",
      label: "I look away. I'd rather not.",
      phrase: "look away, because you would rather not",
      reflect:
        "Looking away is the oldest protection there is. If you do not see it, it cannot hurt you, or so the logic goes. The quiet cost is that the thing you will not look at tends to run the show from the dark.",
    },
    {
      id: "fine",
      label: "I'm fine. It's just numbers.",
      phrase: "stay calm, because it is just numbers",
      reflect:
        "Calm can be two very different things. Sometimes it is real ease. Sometimes it is the steadiness of someone who decided long ago that feeling anything about money was not safe. Only you know which one this is, and we will gently find out.",
    },
  ];
  const chosen = opts.find((o) => o.id === a.feeling);
  return (
    <>
      <H2>
        This is not really a workbook about <span className="ym-it">money</span>.
      </H2>
      <Lede>
        Money, it turns out, is rarely about money. It is a mirror. What you earn, what you keep,
        the ceiling you keep hitting, all of it reflects something underneath. We are going to
        find that something together, gently, and by the end you will write yourself a new money
        story in your own words.
      </Lede>
      <Lede>
        Here is the promise. By the time we are done, you will see that you were never bad with
        money. You were handed a story and told it was yours. But the thing about stories is that
        they can be rewritten.
      </Lede>
      <CareNote>
        Before we begin, a few words of care. You set the pace here. You can skip any question,
        sit with anything that stirs, and stop whenever you need to. Nothing here is graded, and
        no one else will see your answers. This is gentle self-reflection, not therapy, and if
        something heavy surfaces, that is worth bringing to someone you trust.
      </CareNote>
      <Prompt>First, be honest, only you will see this. When money comes up, the bank app, a bill, a price, your body tends to</Prompt>
      <Choices value={a.feeling} onChange={(v) => set({ feeling: v })} options={opts} />
      {chosen && (
        <Reveal>
          <p style={{ margin: 0 }}>{chosen.reflect}</p>
          <p style={{ margin: "12px 0 0" }}>
            Notice you did not say you feel greedy or careless. Your body tends to{" "}
            <strong>{chosen.phrase}</strong>. Hold that. We are about to find where it began.
          </p>
        </Reveal>
      )}
    </>
  );
}

/* ------------------------------------------------------------- INHERITANCE */
function Inheritance({ a, set, chosen }) {
  const toggle = (id) => set({ scripts: { ...a.scripts, [id]: !a.scripts[id] } });
  return (
    <>
      <H2>
        You absorbed your money story before you could <span className="ym-it">question</span> it.
      </H2>
      <Lede>
        Between birth and about age seven, your brain ran in slow, almost hypnotic waves. The
        part of you that can say hang on, is that actually true, had not come online yet. So you
        did not choose your beliefs about money. You absorbed them whole, from the rooms you
        grew up in, and they have been quietly running the show ever since.
      </Lede>
      <Prompt>Which of these did you hear, or feel, growing up. Tick every one that lands.</Prompt>
      <div className="ym-checkgrid">
        {SCRIPTS.map((s) => (
          <button
            key={s.id}
            className={"ym-check" + (a.scripts[s.id] ? " is-on" : "")}
            onClick={() => toggle(s.id)}
          >
            <span className="ym-box">{a.scripts[s.id] ? "✓" : ""}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>
      {chosen.length > 0 && (
        <Reveal>
          <div className="ym-reveal-h">These are the scripts you were handed</div>
          <ul className="ym-scriptlist">
            {chosen.map((s) => (
              <li key={s.id}>{s.label}</li>
            ))}
          </ul>
          <p style={{ margin: "12px 0 0" }}>
            Read them again, slowly. Not one of them is a fact about you. Each one is a
            sentence someone else said, in a moment of their own fear, that a small version of
            you filed away as the truth. {chosen.length === 1 ? "It" : "They"} can be returned.
          </p>
        </Reveal>
      )}
      <Prompt soft>
        Now, only if it feels okay, reach for one money memory from childhood. It does not need to
        be the biggest or the hardest one. Choose a memory you can look at comfortably. What
        happened, and what did you quietly decide it meant. You are welcome to skip this.
      </Prompt>
      <TextArea
        value={a.memory}
        onChange={(v) => set({ memory: v })}
        placeholder="A memory you can look at gently. There are no wrong ones, and skipping is fine."
      />
      <Ground>
        Whatever surfaced is welcome, and you do not have to fix it or understand it yet. Take one
        slow breath. Feel your feet on the floor, or your hand resting wherever it is. You are
        here, now, and you are safe. When you are ready, we will keep going gently.
      </Ground>
    </>
  );
}

/* -------------------------------------------------------------------- HOME */
function HomeSection({ a, set, homeObj }) {
  return (
    <>
      <H2>
        Every home had its own weather around <span className="ym-it">money</span>.
      </H2>
      <Lede>
        Long before you had a bank account, you learned what money felt like by watching the
        adults around you. The atmosphere in your childhood home became your baseline, the
        emotional temperature your body now thinks of as normal.
      </Lede>
      <Prompt>When you think of money in the house you grew up in, the dominant feeling was</Prompt>
      <div className="ym-tiles">
        {HOMES.map((h) => (
          <button
            key={h.id}
            className={"ym-tile" + (a.home === h.id ? " is-on" : "")}
            onClick={() => set({ home: h.id })}
          >
            <span className="ym-tile-t">{h.label}</span>
            <span className="ym-tile-n">{h.note}</span>
          </button>
        ))}
      </div>
      {homeObj && (
        <Reveal>
          <div className="ym-reveal-h">What that home taught your body</div>
          <p style={{ margin: 0 }}>{homeObj.reflect}</p>
        </Reveal>
      )}
      <Prompt soft>
        Whose relationship with money did you watch most closely. Name them, and in a few words,
        what money seemed to mean to them.
      </Prompt>
      <TextArea
        value={a.caregiver}
        onChange={(v) => set({ caregiver: v })}
        placeholder="For example, my mother, who treated every cent like it might be the last."
      />
    </>
  );
}

/* ----------------------------------------------------------------- PATTERN */
function Pattern({ a, set, quizDone, dom, secondary, scores }) {
  const pick = (qid, oi) => set({ quiz: { ...a.quiz, [qid]: oi } });
  return (
    <>
      <H2>
        The way you protect yourself around money has a <span className="ym-it">shape</span>.
      </H2>
      <Lede>
        What looks like a money habit is usually a survival strategy you picked up young, a
        clever way of staying safe that has long outlived the danger. There are five common
        shapes. Answer honestly and we will find yours. There are no good or bad results here,
        only the pattern that has been protecting you.
      </Lede>

      {QUIZ.map((q, qi) => (
        <div key={q.id} className="ym-q">
          <div className="ym-qnum">Question {qi + 1} of {QUIZ.length}</div>
          <div className="ym-qtext">{q.q}</div>
          <div className="ym-qopts">
            {q.options.map((o, oi) => (
              <button
                key={oi}
                className={"ym-opt" + (a.quiz[q.id] === oi ? " is-on" : "")}
                onClick={() => pick(q.id, oi)}
              >
                <span className="ym-radio" />
                <span>{o.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      {!a.revealed && (
        <div className="ym-revealrow">
          <button
            className="ym-cta"
            disabled={!quizDone}
            onClick={() => set({ revealed: true })}
          >
            {quizDone ? "Reveal my money pattern" : `Answer all ${QUIZ.length} to reveal your pattern`}
          </button>
        </div>
      )}

      {a.revealed && dom && (
        <div className="ym-portrait">
          <div className="ym-portrait-eyebrow">Your money pattern</div>
          <h3 className="ym-portrait-name">{dom.name}</h3>
          <p className="ym-portrait-line">{dom.line}</p>
          <p className="ym-portrait-body">{dom.body}</p>
          <div className="ym-portrait-grid">
            <div>
              <div className="ym-pg-h">How it protects you</div>
              <p>{dom.protects}</p>
            </div>
            <div>
              <div className="ym-pg-h">What it has cost you</div>
              <p>{dom.costs}</p>
            </div>
          </div>
          <div className="ym-portrait-move">
            <div className="ym-pg-h">Your next move</div>
            <p>{dom.move}</p>
          </div>
          <div className="ym-portrait-rep">
            <div className="ym-pg-h">Your first rep this week</div>
            <p>{dom.rep}</p>
          </div>
          {secondary && (
            <p className="ym-secondary">
              A second pattern, <em>{secondary.name}</em>, also runs close behind. Most of us
              are a blend. Notice where it shows up too.
            </p>
          )}
          <div className="ym-bars">
            {Object.entries(scores).map(([k, v]) => {
              const max = Math.max(...Object.values(scores), 1);
              return (
                <div className="ym-bar" key={k}>
                  <span className="ym-barlabel">{ARCHETYPES[k].name.replace("The ", "")}</span>
                  <span className="ym-bartrack">
                    <span className="ym-barfill" style={{ width: `${(v / max) * 100}%` }} />
                  </span>
                </div>
              );
            })}
          </div>
        </div>
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
      <H2>
        You have a financial <span className="ym-it">setpoint</span>, like a thermostat.
      </H2>
      <Lede>
        Set a thermostat to a temperature and it will fight to hold it. Too warm, it cools. Too
        cool, it heats. Your nervous system holds a money setpoint the same way, just below your
        awareness. Drift too far above what feels familiar, and a quiet part of you works to bring
        you back home.
      </Lede>

      <Prompt>Where does your money currently feel set. Choose the level that feels most like home.</Prompt>
      <div className="ym-levels">
        {RUNGS.map((r) => (
          <button
            key={r.v}
            className={"ym-level" + (a.setpoint === r.v ? " is-on" : "")}
            onClick={() => set({ setpoint: r.v })}
          >
            <span className="ym-level-dot" />
            <span className="ym-level-text">
              <span className="ym-level-t">{r.label}</span>
              <span className="ym-level-n">{r.note}</span>
            </span>
          </button>
        ))}
      </div>
      {rung && (
        <Reveal>
          <p style={{ margin: 0 }}>{rung.reflect}</p>
          <p style={{ margin: "12px 0 0" }}>
            Whatever you chose, this is the temperature your nervous system fights to hold.
            Willpower rarely beats it. But a setpoint can be raised, one small repetition of
            safety at a time.
          </p>
        </Reveal>
      )}

      <Prompt soft>How does your thermostat pull you back. Tick everything you recognise.</Prompt>
      <div className="ym-checkgrid">
        {SNAPBACKS.map((s) => (
          <button
            key={s.id}
            className={"ym-check" + (a.snapbacks[s.id] ? " is-on" : "")}
            onClick={() => toggle(s.id)}
          >
            <span className="ym-box">{a.snapbacks[s.id] ? "✓" : ""}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>
      {chosen.length > 0 && (
        <Reveal>
          <div className="ym-reveal-h">
            {chosen.length === 1 ? "Your snap-back, read closely" : "Your snap-backs, read closely"}
          </div>
          <ul className="ym-snaplist">
            {chosen.map((s) => (
              <li key={s.id}>{s.reflect}</li>
            ))}
          </ul>
          <p style={{ margin: "12px 0 0" }}>
            None of these is a discipline problem, and none is a flaw. Say it with me. It is not
            me, it is my nervous system. Once you can see {chosen.length === 1 ? "it" : "them"},
            {" "}{chosen.length === 1 ? "it stops" : "they stop"} running you in the dark.
          </p>
        </Reveal>
      )}
    </>
  );
}

/* ----------------------------------------------------------------- DESIRE */
function Desire({ a, set, complaintObj, desireObj }) {
  return (
    <>
      <H2>
        Underneath the complaint is a <span className="ym-it">longing</span>.
      </H2>
      <Lede>
        The thing we say about money is rarely the thing we want from it. Follow the complaint
        down far enough and you almost always find one of three longings waiting at the bottom.
      </Lede>
      <Prompt>Your most familiar money complaint sounds most like</Prompt>
      <Choices
        value={a.complaint}
        onChange={(v) => set({ complaint: v })}
        options={COMPLAINTS}
      />
      {complaintObj && (
        <>
          <Prompt soft>
            Now go underneath it. When you imagine that complaint finally resolved, what you are
            really reaching for is
          </Prompt>
          <div className="ym-tiles ym-tiles-3">
            {DESIRES.map((d) => (
              <button
                key={d.id}
                className={"ym-tile" + (a.desire === d.id ? " is-on" : "")}
                onClick={() => set({ desire: d.id })}
              >
                <span className="ym-tile-t">{d.label}</span>
                <span className="ym-tile-n">{d.note}</span>
              </button>
            ))}
          </div>
        </>
      )}
      {desireObj && (
        <Reveal>
          <div className="ym-reveal-h">What you are actually chasing</div>
          <p style={{ margin: 0 }}>
            You said the longing under your money story is <strong>{desireObj.label.toLowerCase()}</strong>.
            That matters more than any budget, because money has been standing in for it all
            along. The work is not only to earn more. It is to give yourself{" "}
            {desireObj.label.toLowerCase()} in ways that do not depend on a number, so that money
            can finally be money, and not the whole weight of your wellbeing.
          </p>
        </Reveal>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ WORTH */
function Worth({ a, set }) {
  const v = VERDICTS.find((x) => x.id === a.verdict);
  return (
    <>
      <H2>
        The worth was always <span className="ym-it">yours</span>.
      </H2>
      <Lede>
        A small experiment, and the only one that asks something of your body. Put one hand on
        your chest. Soften your gaze, or close your eyes. And quietly, to yourself, say these
        words and mean them.
      </Lede>
      <div className="ym-declare">
        <p>I am worthy of wealth.</p>
        <p>I deserve abundance.</p>
        <p>I deserve a great deal.</p>
      </div>
      <Prompt>Now notice what happened in your body. The most honest answer is</Prompt>
      <Choices
        value={a.verdict}
        onChange={(v2) => set({ verdict: v2 })}
        options={VERDICTS.map((x) => ({ id: x.id, label: x.label }))}
      />
      {v && (
        <Reveal>
          <div className="ym-reveal-h">Whatever you felt is information, not a verdict</div>
          <p style={{ margin: 0 }}>{v.note}</p>
          <p style={{ margin: "12px 0 0" }}>
            Worth, like a setpoint, gets built one repetition at a time. You just did one.
          </p>
        </Reveal>
      )}
      {v && (
        <Ground>
          That exercise asks a lot of the body. Let it settle now. Soften your shoulders, unclench
          your jaw, and take one breath all the way down. Place a hand on your heart if that feels
          kind. There is nothing to do with what came up. You only have to let it be here.
        </Ground>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ STORY */
function Story({ a, set, suggestedLie, suggestedTruth, dom, homeObj, desireObj, complaintObj, chosenScripts }) {
  const updatePair = (i, field, val) =>
    set({ pairs: a.pairs.map((p, idx) => (idx === i ? { ...p, [field]: val } : p)) });
  const addPair = () => set({ pairs: [...a.pairs, { lie: "", truth: "" }] });
  const removePair = (i) => set({ pairs: a.pairs.filter((_, idx) => idx !== i) });
  const seedFirst = () => {
    const next = [...a.pairs];
    next[0] = { lie: suggestedLie, truth: suggestedTruth };
    set({ pairs: next });
  };

  const filled = a.pairs.filter((p) => p.lie.trim() && p.truth.trim());
  const ready = filled.length > 0;
  const firstEmpty = !a.pairs[0].lie.trim() && !a.pairs[0].truth.trim();

  // everything the snapshot weaves together
  const rung = a.setpoint != null ? RUNGS[a.setpoint] : null;
  const snapEx = SNAPBACKS.find((s) => a.snapbacks[s.id]);
  const feelingPhrase = FEELING_PHRASE[a.feeling];
  const verdictPhrase = VERDICT_PHRASE[a.verdict];

  return (
    <>
      <H2>
        Write your new money <span className="ym-it">agreement</span>.
      </H2>
      <Lede>
        We have done real work together. Now take it home in your own words. A money agreement
        comes in pairs. On the left, the old lie you were handed. On the right, the truth you are
        choosing instead. Write as many pairs as you need. Each lie deserves its own reframe,
        sitting right beside it.
      </Lede>

      <div className="ym-pairhead">
        <span>The old lie, let it go</span>
        <span>The truth that replaces it</span>
      </div>

      {a.pairs.map((p, i) => (
        <div className="ym-pairrow" key={i}>
          <div className="ym-paircell">
            <TextArea
              value={p.lie}
              onChange={(v) => updatePair(i, "lie", v)}
              placeholder={i === 0 ? suggestedLie : "Another belief you are ready to release."}
            />
          </div>
          <div className="ym-pairarrow" aria-hidden>→</div>
          <div className="ym-paircell">
            <TextArea
              value={p.truth}
              onChange={(v) => updatePair(i, "truth", v)}
              placeholder={i === 0 ? suggestedTruth : "The truer thing you are choosing in its place."}
            />
            {a.pairs.length > 1 && (
              <button className="ym-remove" onClick={() => removePair(i)} aria-label="Remove this reframe">
                Remove
              </button>
            )}
          </div>
        </div>
      ))}

      <div className="ym-pairactions">
        <button className="ym-addpair" onClick={addPair}>+ Add another reframe</button>
        {firstEmpty && (
          <button className="ym-link" onClick={seedFirst}>
            Use starting words for the first pair
          </button>
        )}
      </div>

      {ready && (
        <div className="ym-storycard">
          <div className="ym-story-eyebrow">Your money story</div>

          {/* MOVEMENT ONE */}
          <div className="ym-movement">
            <div className="ym-move-h">Where your story came from</div>
            <div className="ym-story-body">
              <p>
                It started in the house you grew up in, where money felt like{" "}
                <em>{homeObj ? homeObj.label.toLowerCase() : "something unspoken"}</em>.
                {a.caregiver.trim() ? (
                  <> The relationship you watched most closely was <em>{a.caregiver.trim()}</em>.</>
                ) : null}
                {chosenScripts.length ? (
                  <>
                    {" "}In those years you were handed beliefs like{" "}
                    <em>{chosenScripts[0].label.replace(/\.$/, "").toLowerCase()}</em>
                    {chosenScripts[1] ? (
                      <>, and <em>{chosenScripts[1].label.replace(/\.$/, "").toLowerCase()}</em></>
                    ) : null}
                    .
                  </>
                ) : null}
              </p>

              {a.memory.trim() ? (
                <p>One memory still holds it. <em>"{a.memory.trim()}"</em></p>
              ) : null}

              <p>
                Today, when money comes up, your body still{" "}
                <em>{feelingPhrase || "responds the way it learned to"}</em>. To stay safe, you
                learned to move through money as{" "}
                <em>{dom ? dom.name.toLowerCase() : "a protector"}</em>
                {dom ? <>, the part of you that {dom.line.replace(/^You /, "").replace(/\.$/, "").toLowerCase()}</> : null}.
              </p>

              {rung ? (
                <p>
                  Your nervous system has held its setpoint at{" "}
                  <em>{rung.label.toLowerCase()}</em>, and works quietly to pull you back whenever
                  you climb above it
                  {snapEx ? <>, often by the snap-back you know well: <em>{snapEx.label.replace(/\.$/, "").toLowerCase()}</em></> : null}
                  .
                </p>
              ) : null}

              <p>
                {complaintObj ? (
                  <>The complaint you carry, <em>{complaintObj.label.replace(/\.$/, "").toLowerCase()}</em>, is real. </>
                ) : null}
                Underneath it, what you have truly been reaching for is{" "}
                <em>{desireObj ? desireObj.label.toLowerCase() : "to feel safe"}</em>.
                {verdictPhrase ? (
                  <> And when you place a hand on your chest and claim your worth, it{" "}
                    <em>{verdictPhrase}</em>.</>
                ) : null}
              </p>
            </div>
          </div>

          {/* MOVEMENT TWO */}
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
              {dom ? (
                <p>{dom.move}</p>
              ) : null}
              {dom ? (
                <p className="ym-story-rep">
                  <span className="ym-rep-label">This week</span>
                  {dom.rep}
                </p>
              ) : null}
              <p className="ym-story-close">
                You give yourself <em>{desireObj ? desireObj.label.toLowerCase() : "safety"}</em>{" "}
                in ways that do not depend on a number, and you let your setpoint rise one safe
                repetition at a time. You were never bad with money. You were handed a story and
                told it was yours. This is the one you are choosing instead.
              </p>
            </div>
          </div>

          <div className="ym-story-actions">
            <button
              className="ym-cta"
              onClick={async () => {
                try {
                  const me = await base44.auth.me();
                  const mine = await base44.entities.MoneyStoryResponse.filter(
                    { created_by_id: me.id },
                    "-created_date",
                    1
                  );
                  const payload = { answers: a, is_complete: true, completed_at: new Date().toISOString() };
                  if (mine && mine[0]) {
                    await base44.entities.MoneyStoryResponse.update(mine[0].id, payload);
                  } else {
                    await base44.entities.MoneyStoryResponse.create(payload);
                  }
                } catch (e) {
                  // non-fatal: still take her to the dashboard
                }
                window.location.href = createPageUrl("Dashboard");
              }}
            >
              Save my money story
            </button>
            <button className="ym-ghost2" onClick={() => { /* PDF export wired in a later pass */ }}>Download as PDF</button>
          </div>
        </div>
      )}

      {ready && (
        <Ground label="You have done real work here">
          Before anything else, pause. This was tender, honest work, and you stayed with it. Take
          one slow breath and let that be enough for today. There is nothing you need to act on
          right now. Your story is saved, and it will be here whenever you return to it.
        </Ground>
      )}

      <div className="ym-nextstep">
        <div className="ym-ns-h">When you are ready, and only then</div>
        <p>
          This was the doorway. The Aligned Woman Blueprint is the room. Thirteen specialists,
          hand picked to teach ambitious women the things we were never taught, across body,
          nervous system, mind, money, and power. There is no rush. Your money story is welcome
          to come too, whenever the time is right for you.
        </p>
        <button className="ym-cta" onClick={() => { window.location.href = "/blueprint"; }}>Explore the Blueprint</button>
      </div>
    </>
  );
}

/* ----------------------------------------------------------------- shared UI */
function H2({ children }) {
  return <h2 className="ym-h2">{children}</h2>;
}
function Lede({ children }) {
  return <p className="ym-lede">{children}</p>;
}
function Prompt({ children, soft }) {
  return <p className={"ym-prompt" + (soft ? " is-soft" : "")}>{children}</p>;
}
function Reveal({ children }) {
  return <div className="ym-reveal">{children}</div>;
}
function CareNote({ children }) {
  return (
    <div className="ym-care">
      <span className="ym-care-mark" aria-hidden>♥</span>
      <div>{children}</div>
    </div>
  );
}
function Ground({ children, label = "A moment to land" }) {
  return (
    <div className="ym-ground" role="note">
      <div className="ym-ground-h">{label}</div>
      <div className="ym-ground-body">{children}</div>
    </div>
  );
}
function Choices({ value, onChange, options }) {
  return (
    <div className="ym-choices">
      {options.map((o) => (
        <button
          key={o.id}
          className={"ym-choice" + (value === o.id ? " is-on" : "")}
          onClick={() => onChange(o.id)}
        >
          <span className="ym-radio" />
          <span>{o.label}</span>
        </button>
      ))}
    </div>
  );
}
function TextArea({ value, onChange, placeholder }) {
  return (
    <textarea
      className="ym-textarea"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
    />
  );
}

/* ----------------------------------------------------------------- fonts */
function Fonts() {
  // DM Serif Display and Montserrat load globally in index.html.
  // This page inherits the live workbook fonts, so no injection is needed.
  return null;
}

/* ----------------------------------------------------------------- styles */
function Style() {
  return (
    <style>{`
:root{
  --maroon:${C.maroon}; --burg:${C.burgundy}; --rose:${C.rose};
  --pink:${C.pink}; --pink2:${C.pink2}; --ink:${C.ink}; --line:${C.line};
}
.ym-shell{display:grid;grid-template-columns:300px 1fr;min-height:100vh}
*{box-sizing:border-box}
button{font-family:${sans};cursor:pointer}
.ym-it{font-style:italic;color:${C.rose}}

/* ---- sidebar ---- */
.ym-aside{background:${C.maroon};color:#fff;padding:38px 28px;display:flex;flex-direction:column;position:sticky;top:0;height:100vh}
.ym-kicker{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:${C.rose};font-weight:500}
.ym-wordmark{font-family:${serif};font-weight:500;font-size:34px;line-height:1.05;margin:10px 0 0;letter-spacing:.2px}
.ym-sub{font-size:13px;line-height:1.5;color:rgba(255,255,255,.7);margin:14px 0 0;max-width:210px}
.ym-nav{margin-top:34px;display:flex;flex-direction:column;gap:2px;flex:1}
.ym-navitem{display:flex;align-items:center;gap:13px;background:none;border:0;padding:10px 10px;border-radius:9px;text-align:left;color:rgba(255,255,255,.78);transition:background .2s,color .2s;width:100%}
.ym-navitem:hover{background:rgba(255,255,255,.07);color:#fff}
.ym-navitem.is-active{background:rgba(255,255,255,.11);color:#fff}
.ym-navlabel{font-size:14px;font-weight:500}
.ym-dot{flex:none;width:24px;height:24px;border-radius:50%;border:1px solid rgba(255,255,255,.3);display:grid;place-items:center;font-size:12px;font-weight:600;color:rgba(255,255,255,.7)}
.ym-dot.is-cur{border-color:${C.rose};color:#fff}
.ym-dot.is-done{background:${C.rose};border-color:${C.rose};color:#fff}
.ym-asidefoot{margin-top:16px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.5)}

/* ---- main ---- */
.ym-main{position:relative;height:100vh;overflow-y:auto;padding:60px 7vw 30px;max-width:920px}
.ym-page{padding-bottom:120px}
.ym-fade{animation:ymfade .5s cubic-bezier(.2,.7,.3,1) both}
@keyframes ymfade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){.ym-fade{animation:none}}
.ym-eyebrow{font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:${C.burgundy};font-weight:600;margin-bottom:14px}
.ym-h2{font-family:${serif};font-weight:500;font-size:40px;line-height:1.12;color:${C.maroon};margin:0 0 22px;letter-spacing:.2px}
.ym-lede{font-size:17px;line-height:1.7;color:${C.ink};max-width:680px;margin:0 0 16px}
.ym-prompt{font-family:${serif};font-style:italic;font-size:20px;line-height:1.5;color:${C.burgundy};margin:30px 0 16px;max-width:660px}
.ym-prompt.is-soft{font-size:18px;color:${C.ink};opacity:.92}

/* ---- choices / radios ---- */
.ym-choices{display:flex;flex-direction:column;gap:10px;max-width:680px}
.ym-choice,.ym-opt{display:flex;align-items:flex-start;gap:14px;background:#fff;border:1px solid var(--line);border-radius:13px;padding:15px 17px;text-align:left;font-size:15px;line-height:1.45;color:${C.ink};transition:border-color .18s,box-shadow .18s,background .18s}
.ym-choice:hover,.ym-opt:hover{border-color:${C.rose}}
.ym-choice.is-on,.ym-opt.is-on{border-color:${C.maroon};background:${C.pink2};box-shadow:0 0 0 1px ${C.maroon} inset}
.ym-radio{flex:none;width:18px;height:18px;border-radius:50%;border:1.5px solid var(--line);margin-top:1px;position:relative;transition:border-color .18s}
.is-on .ym-radio{border-color:${C.maroon}}
.is-on .ym-radio::after{content:"";position:absolute;inset:3px;border-radius:50%;background:${C.maroon}}

/* ---- checkboxes ---- */
.ym-checkgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:760px}
.ym-check{display:flex;align-items:flex-start;gap:12px;background:#fff;border:1px solid var(--line);border-radius:12px;padding:13px 15px;text-align:left;font-size:14.5px;line-height:1.4;color:${C.ink};transition:border-color .18s,background .18s}
.ym-check:hover{border-color:${C.rose}}
.ym-check.is-on{border-color:${C.maroon};background:${C.pink2}}
.ym-box{flex:none;width:20px;height:20px;border-radius:6px;border:1.5px solid var(--line);display:grid;place-items:center;font-size:13px;color:#fff;transition:background .18s,border-color .18s}
.ym-check.is-on .ym-box{background:${C.maroon};border-color:${C.maroon}}

/* ---- tiles ---- */
.ym-tiles{display:grid;grid-template-columns:1fr 1fr 1fr;gap:11px;max-width:760px}
.ym-tiles-3{grid-template-columns:1fr 1fr 1fr}
.ym-tile{display:flex;flex-direction:column;gap:6px;background:#fff;border:1px solid var(--line);border-radius:14px;padding:18px 16px;text-align:left;transition:border-color .18s,background .18s,transform .18s}
.ym-tile:hover{border-color:${C.rose};transform:translateY(-2px)}
.ym-tile.is-on{border-color:${C.maroon};background:${C.pink2};box-shadow:0 0 0 1px ${C.maroon} inset}
.ym-tile-t{font-family:${serif};font-size:21px;color:${C.maroon};font-weight:500}
.ym-tile-n{font-size:13px;line-height:1.45;color:${C.ink};opacity:.78}

/* ---- textarea ---- */
.ym-textarea{width:100%;max-width:680px;display:block;background:#fff;border:1px solid var(--line);border-radius:13px;padding:15px 17px;font-family:${sans};font-size:15px;line-height:1.6;color:${C.ink};resize:vertical;transition:border-color .18s}
.ym-textarea:focus{outline:none;border-color:${C.maroon};box-shadow:0 0 0 1px ${C.maroon} inset}
.ym-textarea::placeholder{color:rgba(42,18,24,.42)}

/* ---- reveal ---- */
.ym-reveal{margin:22px 0 0;max-width:700px;background:${C.roseSoft};border-left:3px solid ${C.rose};border-radius:0 13px 13px 0;padding:18px 22px;font-size:15.5px;line-height:1.65;color:${C.ink};animation:ymslide .45s ease both}
@keyframes ymslide{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){.ym-reveal{animation:none}}
.ym-reveal strong{color:${C.maroon}}
.ym-reveal-h{font-family:${serif};font-style:italic;font-size:19px;color:${C.maroon};margin-bottom:8px}
.ym-scriptlist{margin:6px 0 0;padding-left:18px}
.ym-scriptlist li{margin:4px 0;line-height:1.45}

/* ---- quiz ---- */
.ym-q{margin:0 0 26px;max-width:760px}
.ym-qnum{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:${C.burgundy};font-weight:600;margin-bottom:8px}
.ym-qtext{font-family:${serif};font-size:23px;line-height:1.35;color:${C.maroon};margin-bottom:14px}
.ym-qopts{display:flex;flex-direction:column;gap:9px}
.ym-revealrow{margin:14px 0 0;max-width:760px}
.ym-cta{background:${C.maroon};color:#fff;border:0;border-radius:999px;padding:15px 30px;font-size:15px;font-weight:600;letter-spacing:.01em;transition:background .18s,transform .18s}
.ym-cta:hover:not(:disabled){background:${C.burgundy};transform:translateY(-1px)}
.ym-cta:disabled{opacity:.4;cursor:not-allowed}

/* ---- portrait ---- */
.ym-portrait{margin:30px 0 0;max-width:760px;background:${C.maroon};color:#fff;border-radius:20px;padding:38px 40px;animation:ympop .55s cubic-bezier(.2,.8,.2,1) both}
@keyframes ympop{from{opacity:0;transform:scale(.97) translateY(10px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){.ym-portrait{animation:none}}
.ym-portrait-eyebrow{font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:${C.rose};font-weight:600}
.ym-portrait-name{font-family:${serif};font-weight:500;font-size:42px;margin:10px 0 4px;line-height:1.05}
.ym-portrait-line{font-family:${serif};font-style:italic;font-size:22px;color:${C.rose};margin:0 0 18px}
.ym-portrait-body{font-size:16px;line-height:1.7;color:rgba(255,255,255,.9);margin:0 0 22px}
.ym-portrait-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;border-top:1px solid rgba(255,255,255,.16);padding-top:20px}
.ym-pg-h{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:${C.rose};font-weight:600;margin-bottom:7px}
.ym-portrait-grid p,.ym-portrait-move p{font-size:14.5px;line-height:1.6;color:rgba(255,255,255,.85);margin:0}
.ym-portrait-move{margin-top:20px;border-top:1px solid rgba(255,255,255,.16);padding-top:20px}
.ym-secondary{font-size:14px;line-height:1.6;color:rgba(255,255,255,.72);margin:20px 0 0}
.ym-secondary em{color:${C.rose};font-style:italic}
.ym-bars{margin-top:22px;display:flex;flex-direction:column;gap:9px}
.ym-bar{display:grid;grid-template-columns:130px 1fr;align-items:center;gap:12px}
.ym-barlabel{font-size:12px;color:rgba(255,255,255,.75)}
.ym-bartrack{height:7px;background:rgba(255,255,255,.14);border-radius:4px;overflow:hidden}
.ym-barfill{display:block;height:100%;background:${C.rose};border-radius:4px;transition:width .7s cubic-bezier(.2,.8,.2,1)}

/* ---- declaration ---- */
.ym-declare{max-width:680px;background:${C.maroon};color:#fff;border-radius:16px;padding:30px 36px;text-align:center;margin:8px 0 4px}
.ym-declare p{font-family:${serif};font-size:27px;line-height:1.4;margin:4px 0;font-weight:400}

/* ---- reframe editor + story ---- */
.ym-link{background:none;border:0;color:${C.burgundy};font-size:13.5px;text-decoration:underline;text-underline-offset:3px;padding:8px 0 0}
.ym-link:hover{color:${C.maroon}}
.ym-storycard{max-width:720px;margin:18px 0 28px;background:${C.maroon};color:#fff;border:1px solid ${C.maroon};border-radius:20px;padding:38px 40px;box-shadow:0 16px 48px rgba(92,26,46,.2);animation:ympop .55s cubic-bezier(.2,.8,.2,1) both}
@media (prefers-reduced-motion: reduce){.ym-storycard{animation:none}}
.ym-story-eyebrow{font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:${C.rose};font-weight:600;margin-bottom:6px}
.ym-story-body p{font-family:${serif};font-size:19px;line-height:1.6;color:rgba(255,255,255,.9);margin:0 0 14px}
.ym-story-body em{font-style:italic;color:${C.rose}}
.ym-story-vow{font-size:21px;color:#fff!important;padding-left:16px;border-left:3px solid rgba(255,255,255,.3);font-style:italic}
.ym-story-vow-new{border-left-color:${C.rose};color:#fff!important}
.ym-story-close{font-size:17px!important;opacity:.86;margin-top:18px!important}
.ym-story-actions{display:flex;gap:12px;margin-top:26px;flex-wrap:wrap}
.ym-storycard .ym-cta{background:#fff;color:${C.maroon}}
.ym-storycard .ym-cta:hover:not(:disabled){background:${C.pink};transform:translateY(-1px)}
.ym-ghost2{background:transparent;border:1px solid rgba(255,255,255,.5);color:#fff;border-radius:999px;padding:14px 26px;font-size:14.5px;font-weight:600;transition:background .18s,border-color .18s}
.ym-ghost2:hover{background:rgba(255,255,255,.12);border-color:#fff}

/* ---- level cards (thermostat) ---- */
.ym-levels{display:flex;flex-direction:column;gap:9px;max-width:640px;margin-bottom:4px}
.ym-level{display:flex;align-items:center;gap:14px;background:#fff;border:1px solid var(--line);border-radius:13px;padding:14px 18px;text-align:left;transition:border-color .18s,background .18s}
.ym-level:hover{border-color:${C.rose}}
.ym-level.is-on{border-color:${C.maroon};background:${C.pink2};box-shadow:0 0 0 1px ${C.maroon} inset}
.ym-level-dot{flex:none;width:16px;height:16px;border-radius:50%;border:1.5px solid var(--line);position:relative}
.ym-level.is-on .ym-level-dot{border-color:${C.maroon}}
.ym-level.is-on .ym-level-dot::after{content:"";position:absolute;inset:3px;border-radius:50%;background:${C.maroon}}
.ym-level-text{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}
.ym-level-t{font-family:${serif};font-size:20px;color:${C.maroon};font-weight:500}
.ym-level-n{font-size:13px;color:${C.ink};opacity:.7}

/* ---- snapback list ---- */
.ym-snaplist{margin:6px 0 0;padding-left:20px}
.ym-snaplist li{margin:7px 0;line-height:1.5}

/* ---- paired reframes editor ---- */
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
.ym-addpair{background:#fff;border:1px dashed ${C.rose};color:${C.maroon};border-radius:11px;padding:11px 18px;font-size:14px;font-weight:600;transition:background .18s}
.ym-addpair:hover{background:${C.pink2}}

/* ---- story snapshot movements ---- */
.ym-movement{padding:24px 0;border-top:1px solid rgba(255,255,255,.16)}
.ym-movement:first-of-type{border-top:0;padding-top:6px}
.ym-move-h{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:${C.rose};font-weight:600;margin-bottom:14px}
.ym-reframes{display:flex;flex-direction:column;gap:14px;margin-bottom:20px}
.ym-reframe{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:13px;padding:16px 20px}
.ym-reframe-old{font-family:${serif};font-style:italic;font-size:17px;color:rgba(255,255,255,.62);margin:0;text-decoration:line-through;text-decoration-color:rgba(196,114,127,.6)}
.ym-reframe-arrow{display:inline-block;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:${C.rose};margin:8px 0 6px}
.ym-reframe-new{font-family:${serif};font-size:20px;color:#fff;margin:0;line-height:1.4}

/* ---- care note + grounding ---- */
.ym-care{display:flex;gap:14px;max-width:680px;margin:8px 0 4px;background:#fff;border:1px solid var(--line);border-radius:14px;padding:18px 20px;font-size:14.5px;line-height:1.65;color:${C.ink}}
.ym-care-mark{flex:none;color:${C.rose};font-size:17px;line-height:1.5}
.ym-ground{max-width:680px;margin:22px 0 0;background:${C.pink2};border:1px solid var(--line);border-radius:16px;padding:20px 24px;text-align:center}
.ym-ground-h{font-family:${serif};font-style:italic;font-size:18px;color:${C.maroon};margin-bottom:8px}
.ym-ground-body{font-size:15px;line-height:1.7;color:${C.ink};opacity:.9;max-width:520px;margin:0 auto}

/* ---- portrait rep ---- */
.ym-portrait-rep{margin-top:18px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);border-radius:13px;padding:16px 20px}
.ym-portrait-rep p{font-size:15px;line-height:1.6;color:#fff;margin:0}

/* ---- snapshot rep line ---- */
.ym-story-rep{font-family:${sans}!important;font-size:15px!important;line-height:1.65;color:rgba(255,255,255,.92)!important;background:rgba(255,255,255,.08);border-radius:12px;padding:16px 18px;margin:0 0 14px!important}
.ym-rep-label{display:inline-block;font-family:${sans};font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:${C.rose};font-weight:600;margin-right:10px}

/* ---- next step ---- */
.ym-nextstep{max-width:700px;background:${C.pink2};border:1px solid var(--line);border-radius:18px;padding:30px 34px;margin-top:8px}
.ym-ns-h{font-family:${serif};font-style:italic;font-size:22px;color:${C.maroon};margin-bottom:10px}
.ym-nextstep p{font-size:15.5px;line-height:1.65;color:${C.ink};margin:0 0 18px}

/* ---- footer nav ---- */
.ym-foot{position:sticky;bottom:0;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 0;margin-top:auto;background:linear-gradient(180deg,rgba(249,237,231,0),${C.pink} 38%);backdrop-filter:blur(2px)}
.ym-ghost{background:none;border:0;color:${C.burgundy};font-size:14px;font-weight:600;padding:10px 4px}
.ym-ghost:hover{color:${C.maroon}}
.ym-next{display:flex;align-items:center;gap:10px;background:${C.maroon};color:#fff;border:0;border-radius:999px;padding:13px 24px;transition:background .18s,transform .18s}
.ym-next:hover{background:${C.burgundy};transform:translateY(-1px)}
.ym-nextlabel{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:${C.rose}}
.ym-nexttitle{font-family:${serif};font-size:17px}
.ym-arrow{font-size:16px}
.ym-end{font-family:${serif};font-style:italic;font-size:16px;color:${C.burgundy}}

/* ---- responsive ---- */
@media (max-width:860px){
  .ym-shell{grid-template-columns:1fr}
  .ym-aside{position:relative;height:auto;flex-direction:column;padding:24px 20px}
  .ym-nav{flex-direction:row;flex-wrap:wrap;gap:6px;margin-top:20px}
  .ym-navitem{width:auto;padding:8px 12px}
  .ym-navlabel{display:none}
  .ym-asidefoot{margin-top:14px}
  .ym-main{height:auto;padding:34px 22px 40px}
  .ym-h2{font-size:30px}
  .ym-checkgrid,.ym-tiles,.ym-tiles-3{grid-template-columns:1fr}
  .ym-portrait-grid{grid-template-columns:1fr;gap:18px}
  .ym-bar{grid-template-columns:96px 1fr}
  .ym-pairhead{display:none}
  .ym-pairrow{grid-template-columns:1fr;gap:8px;border:1px solid var(--line);border-radius:14px;padding:12px;background:rgba(255,255,255,.4)}
  .ym-pairarrow{transform:rotate(90deg)}
  .ym-storycard{padding:28px 22px}
  .ym-level-text{flex-direction:column;gap:2px}
}
`}</style>
  );
}