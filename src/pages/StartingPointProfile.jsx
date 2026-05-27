import { useState, useEffect, useRef } from "react";
import { getAllArchetypes, getArchetype } from "@/data/archetypes";

// ── Pattern data (unchanged) ──

const PATTERNS = {
  performer: {
    name: "The Performer",
    mirror: "You have not been achieving. You have been performing.",
    pillar: "Identity, Visibility & Personal Brand",
    secondaryPillar: "Mindset & Behaviour",
    description: [
      "You have built your life around a version of yourself that works. She is competent, composed, and almost impossible to fault. She shows up prepared. She delivers. She makes it look effortless. And the gap between who she is in public and who you are in private has become so wide that you are no longer sure which one is real.",
      "The Aligned Woman Blueprint Course addresses this through two pillars. Your primary work begins in Identity, Visibility & Personal Brand, where you will learn to define yourself with intention rather than assumption. Your secondary work sits in Mindset & Behaviour, where the identity protection patterns running beneath your conscious awareness are made visible and addressable.",
      "The foundation you are missing is not competence. You already have that. The foundation you are missing is knowing who you are without the performance."
    ],
    startingModule: "Identity Architecture",
  },
  overFunctioner: {
    name: "The Over-Functioner",
    mirror: "You have not been strong. You have been over-functioning.",
    pillar: "Nervous System & Emotional Regulation",
    secondaryPillar: "Leadership, Authority & Career",
    description: [
      "You carry more than your share and you have done it for so long that it feels like your nature rather than a pattern. You are the one who holds it together. The one who shows up early, stays late, absorbs the tension in the room, and makes sure nothing falls through. Other people's systems run because you run them. And the cost of that is a nervous system that has forgotten what rest actually feels like.",
      "The Aligned Woman Blueprint Course addresses this through two pillars. Your primary work begins in Nervous System & Emotional Regulation, where you will learn to recognise the difference between productivity and a body that does not know how to stop. Your secondary work sits in Leadership, Authority & Career, where you will unlearn the pattern of confusing leadership with labour and learn to lead from composure rather than capacity.",
      "The foundation you are missing is not more strength. It is the ability to put yourself down."
    ],
    startingModule: "Nervous System Literacy",
  },
  delegator: {
    name: "The Delegator",
    mirror: "You have not been delegating. You have been giving your power away.",
    pillar: "Money & Financial Agency",
    secondaryPillar: "Mindset & Behaviour",
    description: [
      "You earn well. You may even earn exceptionally. But somewhere along the way, you handed your financial agency to someone else, or to avoidance itself, and called it a personality trait. 'I am just not a numbers person.' 'I trust my partner with that.' 'I have someone who handles it.' These are not preferences. They are patterns. And they are costing you the one thing money is actually supposed to buy: freedom.",
      "The Aligned Woman Blueprint Course addresses this through two pillars. Your primary work begins in Money & Financial Agency, where you will trace the scripts you inherited and replace them with sovereignty over your own financial decisions. Your secondary work sits in Mindset & Behaviour, where the deeper pattern of delegating power and avoiding discomfort is made visible and addressable.",
      "The foundation you are missing is not a spreadsheet. It is the belief that you are someone who commands money."
    ],
    startingModule: "Financial Architecture",
  },
  overrider: {
    name: "The Overrider",
    mirror: "You have not been disciplined. You have been overriding.",
    pillar: "Health, Hormones & Body Literacy",
    secondaryPillar: "Nervous System & Emotional Regulation",
    description: [
      "You push through. Pain, fatigue, hormonal shifts, illness, grief. Your body sends signals and you override every single one because there is always something more important than how you feel. You have been rewarded for this your entire life. School rewarded it. Work rewarded it. Relationships rewarded it. Nobody told you that the override has a physiological cost that compounds.",
      "The Aligned Woman Blueprint Course addresses this through two pillars. Your primary work begins in Health, Hormones & Body Literacy, where you will learn what your body has been trying to tell you and why the override has a cost that compounds. Your secondary work sits in Nervous System & Emotional Regulation, where you will reconnect with the body you have been treating as an obstacle to productivity.",
      "The foundation you are missing is not willpower or a better supplement stack. It is the radical act of treating your body as a source of intelligence rather than something to override."
    ],
    startingModule: "Body & Hormonal Literacy",
  },
  reactor: {
    name: "The Reactor",
    mirror: "You have not been responsive. You have been reactive.",
    pillar: "Mindset & Behaviour",
    secondaryPillar: "Relationships & Connection",
    description: [
      "You respond. To other people's urgency, to emotional shifts in a room, to crises that may not be yours. Your life has a pattern of high reactivity followed by regret, correction, and then the same cycle again. You can see it happening. That is the painful part. You are not unaware. You are aware and still caught.",
      "The Aligned Woman Blueprint Course addresses this through two pillars. Your primary work begins in Mindset & Behaviour, where you will learn the structural difference between a response and a reaction, and build the gap between how you receive emotional data and how you process it. Your secondary work sits in Relationships & Connection, where the patterns that show up in how you relate to others are addressed at the root.",
      "The foundation you are missing is not mindfulness or willpower. It is the structural gap between how you receive emotional data and how you process it. That gap is addressable. But not with the tools you have been using."
    ],
    startingModule: "Behavioural Patterns & Emotional Regulation",
  },
};

const QUESTIONS = [
  { id: 1, label: "01", dimension: "Recognition", setup: "Think about the last time someone told you, out loud, that you had done something well. A meaningful recognition. Specific, not generic. Recent enough that you remember the moment.", question: "What happened inside you in the next ten minutes?", answers: [{ text: "The words registered. The feeling did not quite land. You smiled, said the right thing, and moved on to the next thing you need to prove.", pattern: "performer" }, { text: "You deflected. Pointed to what still needs to happen, who else contributed, how much is left to do before you can actually rest.", pattern: "overFunctioner" }, { text: "You felt it briefly, then wondered whether it was genuine. You checked with someone else later to see if they agreed.", pattern: "delegator" }, { text: "You felt the flash of relief, then immediately started calculating what you need to sustain or exceed it next time.", pattern: "overrider" }, { text: "You replayed what they said for longer than you would admit. The feeling shifted several times before you landed anywhere.", pattern: "reactor" }] },
  { id: 2, label: "02", dimension: "Pressure", setup: "You are leading a meeting. Someone challenges your recommendation publicly. The room is watching.", question: "What is your first internal response?", answers: [{ text: "A sharp awareness of how this looks to everyone watching. Your credibility is being tested and you need to manage the perception.", pattern: "performer" }, { text: "Frustration, because you have already done the work they have not seen. You absorb it and move on rather than create tension.", pattern: "overFunctioner" }, { text: "A momentary pull to defer to whoever has the most authority in the room. The conflict is not worth the cost.", pattern: "delegator" }, { text: "You sharpen. The pushback actually focuses you. You will hold this position until the data says otherwise.", pattern: "overrider" }, { text: "A flood of feeling that arrives before the words do. You know the right response but you are managing an internal wave before you can deliver it.", pattern: "reactor" }] },
  { id: 3, label: "03", dimension: "Opportunity", setup: "An opportunity lands that would stretch you significantly. It is visible, ambitious, and you are maybe 70% ready.", question: "What do you actually do?", answers: [{ text: "You say yes, then privately build the version of yourself that can deliver it. Nobody sees the gap between who you are and who you show up as.", pattern: "performer" }, { text: "You say yes, then immediately start mapping every detail you need to control. Your preparation will be flawless even if your body pays for it.", pattern: "overFunctioner" }, { text: "You want to say yes, but you check with people you trust first. If enough of them validate it, you move. If not, you wait.", pattern: "delegator" }, { text: "You have already said yes. 70% is more than enough. You will figure it out in motion and deal with the cost later.", pattern: "overrider" }, { text: "You oscillate. One hour you are certain, the next you are listing reasons it could go wrong. You will probably say yes, but it will exhaust you before it begins.", pattern: "reactor" }] },
  { id: 4, label: "04", dimension: "Exhaustion", setup: "You have had three consecutive weeks where every day demanded more than you had.", question: "What does week four actually look like?", answers: [{ text: "You still show up as if nothing has shifted. The exhaustion is real but invisible. No one in your life would know.", pattern: "performer" }, { text: "You are still running everyone else's schedule while your own body sends signals you have not paused long enough to read.", pattern: "overFunctioner" }, { text: "You have delegated the operational load but kept the emotional weight. You are tired in a way that no amount of handing things off fixes.", pattern: "delegator" }, { text: "You push harder. Exhaustion is noise. You will rest when the quarter ends, or the launch is over, or the children are older. There is always a reason.", pattern: "overrider" }, { text: "Your capacity has become unpredictable. Some hours you are sharp, others you can barely function, and you cannot tell which version of you will show up.", pattern: "reactor" }] },
  { id: 5, label: "05", dimension: "Body Signals", setup: "Your sleep has been off for weeks. Your energy crashes every afternoon. Something in your body has shifted and it is not resolving on its own.", question: "What is your honest first response?", answers: [{ text: "You notice it, but you manage it cosmetically. You adjust what is visible and keep going. Admitting something is wrong would change how people see you.", pattern: "performer" }, { text: "You notice it, but everyone else's needs come first. You will deal with your own body when there is a gap in the schedule. There is never a gap.", pattern: "overFunctioner" }, { text: "You book a professional, but when they ask you to describe what is happening, you struggle to articulate it. You have been disconnected from the signals longer than you realized.", pattern: "delegator" }, { text: "You override it. Coffee, willpower, a supplement stack. Your body has been sending signals for months but stopping feels more dangerous than continuing.", pattern: "overrider" }, { text: "You spiral. Every symptom becomes a thread of research and worst-case thinking. You know you are probably fine but the anxiety has already hijacked your week.", pattern: "reactor" }] },
  { id: 6, label: "06", dimension: "Nourishment", setup: "It is 3pm on a demanding day. You have not eaten properly since morning.", question: "What actually happens next?", answers: [{ text: "You eat something if people are around. If you are alone, you skip it. Eating feels like a concession to a body you are trying to control rather than listen to.", pattern: "performer" }, { text: "You realize you fed everyone else first. The children, the team, the partner. You will grab something eventually. You always do this.", pattern: "overFunctioner" }, { text: "You order something or ask someone to handle it. Choosing what to eat feels like one more decision you do not have bandwidth for today.", pattern: "delegator" }, { text: "You push through to dinner. Your body learned long ago that its needs come last on the priority list and it stopped protesting.", pattern: "overrider" }, { text: "It depends entirely on your emotional state. Some days you eat everything in sight. Some days nothing. Your relationship with food is a mirror of whatever you are feeling.", pattern: "reactor" }] },
  { id: 7, label: "07", dimension: "Disappointment", setup: "Someone close to you lets you down in a way that actually matters. Not a small thing. A real one.", question: "What do you do with it?", answers: [{ text: "You process it privately. You do not want them to see how much it affected you because that would change how they see you.", pattern: "performer" }, { text: "You absorb it. You tell yourself they are doing their best. You adjust your expectations downward and carry on doing more yourself.", pattern: "overFunctioner" }, { text: "You vent to someone else rather than addressing it with the person directly. The conversation you need to have stays permanently unspoken.", pattern: "delegator" }, { text: "You compartmentalize it. There is too much happening to sit with the feeling. You note the data point and move forward.", pattern: "overrider" }, { text: "You feel it viscerally. It loops in your mind. You compose and delete several messages. By the time you respond, the emotion has shaped the words more than you intended.", pattern: "reactor" }] },
  { id: 8, label: "08", dimension: "Support", setup: "You need something from someone. Not a task delegated. Real support. The kind that requires you to be seen as not having it all together.", question: "What do you actually do?", answers: [{ text: "You frame the ask so it does not reveal vulnerability. You will accept help as long as it does not disturb the image.", pattern: "performer" }, { text: "You do not ask. You have built a life around being the one who gives. Receiving feels structurally wrong.", pattern: "overFunctioner" }, { text: "You ask for the practical layer only. The emotional need stays unspoken because you are not sure you trust anyone enough with it.", pattern: "delegator" }, { text: "You did not realize you needed help until something broke. You do not stop long enough to feel the gap before it becomes a crisis.", pattern: "overrider" }, { text: "You reach out, but the way you ask carries the full emotional charge. It lands heavier than you intended and the dynamic shifts.", pattern: "reactor" }] },
  { id: 9, label: "09", dimension: "Conflict", setup: "There is a conversation you have been avoiding. Something needs to be said, and you know it.", question: "What has kept you from saying it?", answers: [{ text: "The fear that the honest version of you will not be received the way the composed version would be.", pattern: "performer" }, { text: "The belief that holding the peace is more important than holding your ground. You absorb the cost so nobody else has to.", pattern: "overFunctioner" }, { text: "The hope that someone else will address it, or that it will resolve itself without you having to step into the discomfort.", pattern: "delegator" }, { text: "You have already decided it does not matter enough to slow down for. You have moved past it mentally, even though your body has not.", pattern: "overrider" }, { text: "You have rehearsed it a hundred times but you do not trust yourself to deliver it without the emotion hijacking the message.", pattern: "reactor" }] },
  { id: 10, label: "10", dimension: "Money", setup: "Think about your actual relationship with your own financial position. Not the story you tell people. The real one.", question: "Which of these is closest to the truth?", answers: [{ text: "You earn well and look financially together. But the money serves the image as much as it serves you. You spend to maintain a version of your life that matches who you perform as.", pattern: "performer" }, { text: "You manage the money for everyone. You know what everyone else needs but have not updated your own financial plan in longer than you would admit.", pattern: "overFunctioner" }, { text: "You have handed the financial thinking to someone else. A partner, a parent, a planner. You earn but you do not command the money. And you have been calling it a preference.", pattern: "delegator" }, { text: "You earn, invest, execute. But money is a performance metric, not a source of freedom. You cannot imagine what enough would actually feel like.", pattern: "overrider" }, { text: "Your relationship with money shifts with your emotional state. Good months feel abundant. Hard months feel like evidence of something fundamentally wrong with you.", pattern: "reactor" }] },
  { id: 11, label: "11", dimension: "Worth", setup: "Think about the last time your contribution was being assessed. A performance review, a salary conversation, a moment where what you bring was being weighed against what you receive.", question: "What happened internally?", answers: [{ text: "You presented well. You highlighted the right things. But you left knowing you positioned yourself for approval rather than for what you actually deserve.", pattern: "performer" }, { text: "You listed everything you have done, and it was a lot. But the list felt like a justification for existing rather than a case for being valued. You have always traded energy for belonging.", pattern: "overFunctioner" }, { text: "You deferred to what felt reasonable rather than what felt right. You looked at what others in your position receive and used that as your ceiling. You are uncomfortable deciding what you are worth.", pattern: "delegator" }, { text: "You made the case and held it. But the case was built on output, not value. Every number you cited was about what you produced, not what you are worth when you are not producing anything.", pattern: "overrider" }, { text: "It depended on the day. Some weeks you felt certain you were undervalued. Other weeks you wondered if you were overreaching. Your sense of your own worth shifts with your emotional state, and you know it.", pattern: "reactor" }] },
  { id: 12, label: "12", dimension: "The Pattern", setup: "Read these five sentences slowly. Pick the one you have lived the longest.", question: "Which of these is the pattern you are most tired of?", answers: [{ text: "I am tired of building a life that looks right and feels hollow. The version of me people admire is not the version of me I live with.", pattern: "performer" }, { text: "I am tired of holding everything together for people who do not notice what it costs me. My capacity has become everyone else's comfort.", pattern: "overFunctioner" }, { text: "I am tired of feeling competent everywhere except the areas that actually determine my freedom. I have been giving my power away and calling it a preference.", pattern: "delegator" }, { text: "I am tired of my body paying the price for what my mind refuses to slow down for. I know the signals are there. I override every single one.", pattern: "overrider" }, { text: "I am tired of seeing the pattern clearly and still falling into it. I know what I do. I cannot seem to stop doing it.", pattern: "reactor" }] },
];

const KEY_TO_ENUM = {
  performer: "performer",
  overFunctioner: "over_functioner",
  delegator: "delegator",
  overrider: "overrider",
  reactor: "reactor",
};

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Design tokens ──
const INK = "#4A0E2E";
const INK_BODY = "rgba(58,42,40,0.78)";
const INK_MUTED = "rgba(58,42,40,0.5)";
const ROSE = "#C4847A";
const ROSE_DEEP = "#A86460";
const HAIRLINE = "rgba(74,14,46,0.1)";
const HAIRLINE_STRONG = "rgba(196,132,122,0.35)";
const SERIF = "'DM Serif Display', Georgia, serif";
const SANS = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";
const EASE = "cubic-bezier(0.2, 0.7, 0.2, 1)";

// ── Archetype carousel (new design) ──

function ArchetypeCarousel({ mobile }) {
  const archetypes = getAllArchetypes();
  const len = archetypes.length;
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % len), 3200);
    return () => clearInterval(id);
  }, [len]);

  const cW = mobile ? 140 : 280;
  const sW = mobile ? 80 : 160;
  const gap = mobile ? 12 : 28;
  const totalW = cW + (sW + gap) * 2;

  // Position each card relative to center based on distance from active
  const getOffset = (i) => {
    let diff = i - active;
    if (diff > len / 2) diff -= len;
    if (diff < -len / 2) diff += len;
    return diff;
  };

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{
        position: "relative",
        width: totalW,
        height: mobile ? 340 : 620,
        margin: "0 auto",
        padding: mobile ? "20px 0 16px" : "32px 0 24px",
      }}>
        {archetypes.map((arch, i) => {
          const diff = getOffset(i);
          const isCenter = diff === 0;
          const isSide = Math.abs(diff) === 1;
          const isVisible = Math.abs(diff) <= 1;

          const w = isCenter ? cW : sW;
          const centerX = totalW / 2;
          const x = isCenter
            ? centerX - cW / 2
            : diff === -1
            ? centerX - cW / 2 - gap - sW
            : diff === 1
            ? centerX + cW / 2 + gap
            : diff < 0
            ? -sW - 20
            : totalW + 20;

          return (
            <div
              key={arch.key}
              style={{
                position: "absolute",
                top: mobile ? 20 : 32,
                left: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: mobile ? 10 : 14,
                width: w,
                transform: `translateX(${x}px)`,
                opacity: isVisible ? (isCenter ? 1 : 0.55) : 0,
                transition: `all 800ms ${EASE}`,
                pointerEvents: isVisible ? "auto" : "none",
              }}
            >
              <div style={{
                fontFamily: SANS,
                fontSize: isCenter ? (mobile ? 10 : 12) : (mobile ? 8 : 10),
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: isCenter ? ROSE_DEEP : "rgba(74,14,46,0.45)",
                textAlign: "center",
                lineHeight: 1.3,
                minHeight: mobile ? 26 : 32,
                transition: `all 800ms ${EASE}`,
                whiteSpace: "nowrap",
              }}>
                {arch.name.replace("The ", "")}
              </div>
              <div style={{
                width: "100%",
                aspectRatio: "9 / 16",
                background: arch.videoUrl ? "#3D0B27" : "linear-gradient(160deg, #FBEFEC 0%, #F5DDD9 100%)",
                border: `1px solid ${isCenter ? "rgba(196,132,122,0.55)" : "rgba(196,132,122,0.25)"}`,
                borderRadius: mobile ? 8 : 10,
                boxShadow: isCenter
                  ? mobile
                    ? "0 10px 28px rgba(74,14,46,0.18)"
                    : "0 18px 48px rgba(74,14,46,0.22)"
                  : "none",
                position: "relative",
                overflow: "hidden",
                transition: `all 800ms ${EASE}`,
              }}>
                {arch.videoUrl && (
                  <video
                    src={arch.videoUrl}
                    muted
                    playsInline
                    autoPlay
                    loop
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      pointerEvents: "none",
                    }}
                  />
                )}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: arch.videoUrl
                    ? "radial-gradient(circle at 50% 60%, transparent 40%, rgba(74,14,46,0.3) 100%)"
                    : "radial-gradient(circle at 50% 60%, transparent 50%, rgba(74,14,46,0.1) 100%)",
                  pointerEvents: "none",
                }} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: mobile ? 8 : 10, marginTop: mobile ? 8 : 16 }}>
        {archetypes.map((_, i) => (
          <span
            key={i}
            onClick={() => setActive(i)}
            style={{
              width: i === active ? (mobile ? 18 : 24) : (mobile ? 6 : 8),
              height: mobile ? 4 : 5,
              borderRadius: 2,
              background: i === active ? ROSE : "rgba(196,132,122,0.35)",
              transition: `all 600ms ${EASE}`,
              cursor: "pointer",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main component ──

export default function StartingPointProfile() {
  const [screen, setScreen] = useState("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [resultKey, setResultKey] = useState(null);
  const [underPattern, setUnderPattern] = useState(null);
  const [secondaryKey, setSecondaryKey] = useState(null);
  const [shuffledQs, setShuffledQs] = useState([]);
  const [fadeIn, setFadeIn] = useState(true);
  const [selected, setSelected] = useState(null);
  const [mobile, setMobile] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setShuffledQs(QUESTIONS.map((q) => ({ ...q, answers: shuffleArray(q.answers) })));
  }, []);

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const transition = (cb) => {
    setFadeIn(false);
    setTimeout(() => {
      cb();
      setFadeIn(true);
      if (ref.current) ref.current.scrollTo({ top: 0, behavior: "instant" });
      window.scrollTo({ top: 0, behavior: "instant" });
    }, 400);
  };

  const handleAnswer = (pattern) => {
    setSelected(pattern);
    const newA = { ...answers, [currentQ]: pattern };
    setAnswers(newA);
    setTimeout(() => {
      if (currentQ < shuffledQs.length - 1) {
        transition(() => {
          setCurrentQ(currentQ + 1);
          setSelected(null);
        });
      } else {
        const scores = { performer: 0, overFunctioner: 0, delegator: 0, overrider: 0, reactor: 0 };
        Object.values(newA).forEach((p) => { scores[p]++; });
        const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
        const primaryKey = sorted[0][0];
        const secondKey = sorted[1][1] > 0 ? sorted[1][0] : null;
        setResult(PATTERNS[primaryKey]);
        setResultKey(primaryKey);
        setUnderPattern(secondKey ? PATTERNS[secondKey] : null);
        setSecondaryKey(secondKey);
        transition(() => {
          setScreen("gate");
          setSelected(null);
        });
      }
    }, 600);
  };

  const handleSeeResult = () => {
    const quizResult = {
      archetype_key: KEY_TO_ENUM[resultKey],
      secondary_key: secondaryKey ? KEY_TO_ENUM[secondaryKey] : null,
      completed_at: new Date().toISOString(),
    };
    localStorage.setItem("aw_quiz_result", JSON.stringify(quizResult));
    window.location.href = "/Dashboard";
  };

  const restart = () => {
    setAnswers({});
    setCurrentQ(0);
    setResult(null);
    setResultKey(null);
    setUnderPattern(null);
    setSecondaryKey(null);
    setSelected(null);
    setShuffledQs(QUESTIONS.map((q) => ({ ...q, answers: shuffleArray(q.answers) })));
    transition(() => setScreen("intro"));
  };

  // ════════════════════════════════════════════════════════
  //  WELCOME SCREEN (new light design)
  // ════════════════════════════════════════════════════════

  if (screen === "intro") {
    const centered = !mobile;
    return (
      <div ref={ref} style={{ minHeight: "100vh", background: "#FAF5F3", fontFamily: SANS, color: INK, padding: mobile ? "60px 24px 80px" : "88px 64px 120px", boxSizing: "border-box", position: "relative", overflow: "hidden" }}>
        {/* Atmospheric haze */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% -10%, rgba(196,132,122,0.16), transparent 55%), radial-gradient(circle at -10% 110%, rgba(232,180,174,0.12), transparent 60%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: mobile ? "100%" : 760, margin: "0 auto", opacity: fadeIn ? 1 : 0, transform: fadeIn ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.4s ease, transform 0.4s ease", ...(centered ? { textAlign: "center" } : {}) }}>

          <div style={{ fontFamily: SANS, fontSize: mobile ? 10 : 11, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: ROSE }}>
            The Starting Point Profile
          </div>

          <h1 style={{ margin: mobile ? "28px 0 28px" : "36px auto 36px", fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: mobile ? 44 : 72, lineHeight: 1.05, letterSpacing: "-0.02em", color: INK, maxWidth: mobile ? "100%" : 640 }}>
            Are you ready for<br />a mirror moment?
          </h1>

          <p style={{ margin: centered ? "0 auto" : 0, fontFamily: SANS, fontSize: mobile ? 14 : 15, lineHeight: 1.75, color: INK_BODY, maxWidth: mobile ? "100%" : 560, fontWeight: 300 }}>
            Twelve questions. One pattern you have probably been running for years. Naming it is the first thing the work asks of you.
          </p>

          <p style={{ margin: centered ? (mobile ? "20px 0 0" : "24px auto 0") : (mobile ? "20px 0 0" : "24px 0 0"), fontFamily: SANS, fontSize: mobile ? 14 : 15, lineHeight: 1.75, color: INK_BODY, maxWidth: mobile ? "100%" : 560, fontWeight: 300 }}>
            This is not a personality quiz. It is a diagnostic built from the work of thirteen specialists across psychology, neuroscience, health, money, and leadership. It reads the pattern running beneath your ambition, your exhaustion, and the gap between how your life looks and how it feels. Most women who take it say they have never been described this precisely. That is the point.
          </p>

          <div style={{ marginTop: mobile ? 28 : 36 }}>
            <button
              onClick={() => transition(() => setScreen("quiz"))}
              style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: mobile ? "16px 28px" : "18px 36px", borderRadius: 100, background: ROSE, color: "#FFFFFF", border: "none", fontFamily: SANS, fontSize: mobile ? 10 : 11, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", cursor: "pointer", width: mobile ? "100%" : "auto", justifyContent: mobile ? "center" : "flex-start", transition: `background 180ms ${EASE}` }}
              onMouseEnter={(e) => (e.currentTarget.style.background = ROSE_DEEP)}
              onMouseLeave={(e) => (e.currentTarget.style.background = ROSE)}
            >
              Show me <span>→</span>
            </button>
          </div>

          <h2 style={{ margin: centered ? (mobile ? "40px 0 24px" : "64px auto 32px") : (mobile ? "40px 0 24px" : "64px 0 32px"), fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: mobile ? 26 : 36, lineHeight: 1.15, letterSpacing: "-0.015em", color: INK }}>
            Which one are <em style={{ fontStyle: "italic", color: ROSE_DEEP }}>you</em>?
          </h2>

          <ArchetypeCarousel mobile={mobile} />

          <div style={{ marginTop: mobile ? 32 : 44, marginLeft: centered ? "auto" : 0, marginRight: centered ? "auto" : 0, paddingLeft: centered ? 0 : (mobile ? 16 : 20), paddingTop: centered ? 28 : 0, borderLeft: centered ? "none" : `1px solid ${HAIRLINE_STRONG}`, borderTop: centered ? `1px solid ${HAIRLINE_STRONG}` : "none", maxWidth: mobile ? "100%" : 560 }}>
            <p style={{ margin: 0, fontFamily: SANS, fontSize: mobile ? 13 : 14, lineHeight: 1.7, color: INK_BODY, fontWeight: 300 }}>
              You will recognise yourself in more than one answer. That is how patterns work. They overlap. Pick the one that runs first, the response you default to before you have time to choose a better one. This is not reading your best day. It is reading your operating system.
            </p>
          </div>

          <div style={{ marginTop: mobile ? 36 : 48 }}>
            <button
              onClick={() => transition(() => setScreen("quiz"))}
              style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: mobile ? "16px 28px" : "18px 36px", borderRadius: 100, background: ROSE, color: "#FFFFFF", border: "none", fontFamily: SANS, fontSize: mobile ? 10 : 11, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", cursor: "pointer", width: mobile ? "100%" : "auto", justifyContent: mobile ? "center" : "flex-start", transition: `background 180ms ${EASE}` }}
              onMouseEnter={(e) => (e.currentTarget.style.background = ROSE_DEEP)}
              onMouseLeave={(e) => (e.currentTarget.style.background = ROSE)}
            >
              Show me <span>→</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  //  QUIZ SCREEN (new light design)
  // ════════════════════════════════════════════════════════

  if (screen === "quiz" && shuffledQs.length > 0) {
    const q = shuffledQs[currentQ];
    const handleBack = () => {
      if (currentQ > 0) {
        transition(() => {
          setCurrentQ(currentQ - 1);
          setSelected(null);
        });
      } else {
        transition(() => setScreen("intro"));
      }
    };

    return (
      <div ref={ref} style={{ minHeight: "100vh", background: "#FAF5F3", fontFamily: SANS, color: INK, position: "relative", overflow: "hidden" }}>
        {/* Atmospheric haze */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% -10%, rgba(196,132,122,0.16), transparent 55%), radial-gradient(circle at -10% 110%, rgba(232,180,174,0.12), transparent 60%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: mobile ? "100%" : 700, margin: "0 auto", padding: mobile ? "48px 24px 80px" : "72px 28px 100px", opacity: fadeIn ? 1 : 0, transform: fadeIn ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.4s ease, transform 0.4s ease" }}>

          {/* Progress rail */}
          <div style={{ display: "flex", gap: mobile ? 4 : 8, marginBottom: mobile ? 32 : 48 }}>
            {shuffledQs.map((_, i) => (
              <div key={i} style={{ flex: 1, height: 2, borderRadius: 2, background: i < currentQ ? ROSE : i === currentQ ? ROSE : HAIRLINE, transition: `background 0.4s ${EASE}` }} />
            ))}
          </div>

          {/* Eyebrow */}
          <div style={{ fontFamily: SANS, fontSize: mobile ? 10 : 11, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: ROSE }}>
            Question {q.label} of 12
          </div>

          {/* Dimension */}
          <div style={{ marginTop: mobile ? 10 : 14, fontFamily: SANS, fontSize: mobile ? 10 : 11, fontWeight: 600, letterSpacing: "0.24em", textTransform: "uppercase", color: INK_MUTED }}>
            {q.dimension}
          </div>

          {/* Setup text */}
          {q.setup && (
            <p style={{ margin: mobile ? "22px 0 0" : "28px 0 0", fontFamily: SANS, fontSize: mobile ? 14 : 15, fontWeight: 300, lineHeight: 1.75, color: INK_BODY, maxWidth: mobile ? "100%" : 560 }}>
              {q.setup}
            </p>
          )}

          {/* Question */}
          <h2 style={{ margin: mobile ? "32px 0 28px" : "44px 0 36px", fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: mobile ? 28 : 38, lineHeight: 1.15, letterSpacing: "-0.015em", color: INK, maxWidth: mobile ? "100%" : 640 }}>
            {q.question}
          </h2>

          {/* Answer cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: mobile ? 10 : 12 }}>
            {q.answers.map((a, i) => {
              const isSel = selected === a.pattern;
              return (
                <button
                  key={i}
                  onClick={() => !selected && handleAnswer(a.pattern)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: mobile ? "18px 20px" : "22px 26px",
                    borderRadius: 8,
                    background: isSel ? "rgba(196,132,122,0.06)" : "#FFFFFF",
                    border: `1px solid ${isSel ? ROSE : HAIRLINE}`,
                    boxShadow: isSel ? "0 2px 0 rgba(196,132,122,0.25)" : "none",
                    color: INK_BODY,
                    fontFamily: SANS,
                    fontSize: mobile ? 13 : 14,
                    lineHeight: 1.65,
                    fontWeight: 400,
                    cursor: selected ? "default" : "pointer",
                    transition: `all 200ms ${EASE}`,
                  }}
                  onMouseEnter={(e) => {
                    if (!selected) {
                      e.currentTarget.style.borderColor = HAIRLINE_STRONG;
                      e.currentTarget.style.background = "rgba(196,132,122,0.03)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selected || !isSel) {
                      e.currentTarget.style.borderColor = isSel ? ROSE : HAIRLINE;
                      e.currentTarget.style.background = isSel ? "rgba(196,132,122,0.06)" : "#FFFFFF";
                    }
                  }}
                >
                  {a.text}
                </button>
              );
            })}
          </div>

          {/* Footer nav */}
          <div style={{ marginTop: mobile ? 32 : 44, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
            <button
              onClick={handleBack}
              style={{ background: "transparent", border: "none", color: INK_MUTED, fontFamily: SANS, fontSize: mobile ? 10 : 11, fontWeight: 600, letterSpacing: "0.24em", textTransform: "uppercase", cursor: "pointer", padding: 0, transition: `color 180ms ${EASE}` }}
              onMouseEnter={(e) => (e.currentTarget.style.color = INK)}
              onMouseLeave={(e) => (e.currentTarget.style.color = INK_MUTED)}
            >
              ← Back
            </button>
            <span style={{ fontFamily: SANS, fontSize: mobile ? 10 : 11, fontWeight: 600, letterSpacing: "0.24em", textTransform: "uppercase", color: INK_MUTED }}>
              {currentQ + 1} / {shuffledQs.length}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  //  RESULT / GATE SCREEN (new light design)
  // ════════════════════════════════════════════════════════

  if (screen === "gate" && result) {
    const arch = getArchetype(resultKey) || {};
    const videoUrl = arch.videoUrl || "";
    const atBest = arch.atBest || "";
    const atWorst = arch.atWorst || "";

    const videoCard = (cardWidth) => (
      <div style={{
        width: cardWidth,
        aspectRatio: "9 / 16",
        background: videoUrl ? "#3D0B27" : "linear-gradient(160deg, #FBEFEC 0%, #F5DDD9 100%)",
        border: "1px solid rgba(196,132,122,0.3)",
        borderRadius: 8,
        position: "relative",
        overflow: "hidden",
      }}>
        {videoUrl && (
          <video
            src={videoUrl}
            muted
            playsInline
            autoPlay
            loop
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
        {/* Bottom gradient for text readability */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(20,4,12,0.92) 0%, rgba(20,4,12,0.7) 30%, rgba(20,4,12,0.15) 55%, transparent 70%)", pointerEvents: "none" }} />
        {/* Play button glass blur top right */}
        <div style={{
          position: "absolute",
          top: mobile ? 14 : 18,
          right: mobile ? 14 : 18,
          width: mobile ? 36 : 44,
          height: mobile ? 36 : 44,
          borderRadius: "50%",
          background: "rgba(20,4,12,0.55)",
          border: "1px solid rgba(255,255,255,0.3)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
        }}>
          <svg width={mobile ? 10 : 12} height={mobile ? 12 : 14} viewBox="0 0 14 16" fill="#FFFFFF" style={{ marginLeft: 2 }}>
            <path d="M0 0 L14 8 L0 16 Z" />
          </svg>
        </div>
        {/* Overlay text */}
        <div style={{ position: "absolute", left: mobile ? 18 : 24, right: mobile ? 18 : 24, bottom: mobile ? 22 : 28 }}>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: mobile ? 22 : 28, lineHeight: 1.05, letterSpacing: "-0.015em", color: "#FFFFFF", marginBottom: mobile ? 12 : 16, textShadow: "0 2px 16px rgba(0,0,0,0.65), 0 0 32px rgba(0,0,0,0.4)" }}>
            {result.name}
          </div>
          <p style={{ margin: 0, fontFamily: SANS, fontSize: mobile ? 11 : 13, lineHeight: 1.6, color: "rgba(255,255,255,0.96)", fontWeight: 400, textShadow: "0 1px 8px rgba(0,0,0,0.65), 0 0 24px rgba(0,0,0,0.3)" }}>
            {atBest.split(". ").slice(0, 3).join(". ") + "."}
          </p>
        </div>
      </div>
    );

    const headerBlock = (
      <>
        <div style={{ fontFamily: SANS, fontSize: mobile ? 10 : 11, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: ROSE }}>
          Your Starting Point
        </div>

        <h1 style={{
          margin: mobile ? "20px 0 20px" : "24px 0 28px",
          fontFamily: SERIF,
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: mobile ? 52 : 84,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          color: INK,
        }}>
          {result.name}
        </h1>

        <p style={{
          margin: 0,
          fontFamily: SERIF,
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: mobile ? 18 : 22,
          lineHeight: 1.45,
          color: ROSE_DEEP,
          maxWidth: mobile ? "100%" : 460,
        }}>
          {result.mirror}
        </p>
      </>
    );

    const detailBlock = (
      <div style={{ marginTop: mobile ? 28 : 32, display: "flex", flexDirection: "column", gap: mobile ? 20 : 22, maxWidth: mobile ? "100%" : 460 }}>
        <div>
          <div style={{ fontFamily: SANS, fontSize: mobile ? 10 : 11, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: ROSE, marginBottom: mobile ? 8 : 10 }}>At your best</div>
          <p style={{ margin: 0, fontFamily: SANS, fontSize: mobile ? 13 : 14, lineHeight: 1.7, color: INK_BODY, fontWeight: 300 }}>
            {atBest}
          </p>
        </div>
        <div>
          <div style={{ fontFamily: SANS, fontSize: mobile ? 10 : 11, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: ROSE, marginBottom: mobile ? 8 : 10 }}>At your worst</div>
          <p style={{ margin: 0, fontFamily: SANS, fontSize: mobile ? 13 : 14, lineHeight: 1.7, color: INK_BODY, fontWeight: 300 }}>
            {atWorst}
          </p>
        </div>
      </div>
    );

    const footerBlock = (
      <>
        <div style={{ margin: "32px 0", width: 56, height: 1, background: ROSE }} />
        <p style={{ margin: 0, fontFamily: SANS, fontSize: mobile ? 14 : 15, lineHeight: 1.75, color: INK_BODY, maxWidth: mobile ? "100%" : 460, fontWeight: 300 }}>
          Your full diagnostic is ready, written by our specialists about the pattern that has been running your life. Sign up to read the full detail.
        </p>
        <div style={{ marginTop: mobile ? 32 : 40, display: "flex", flexDirection: mobile ? "column" : "row", gap: mobile ? 12 : 16, alignItems: mobile ? "stretch" : "center", flexWrap: "wrap" }}>
          <button
            onClick={handleSeeResult}
            style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: mobile ? "16px 28px" : "18px 36px", borderRadius: 100, background: ROSE, color: "#FFFFFF", border: "none", fontFamily: SANS, fontSize: mobile ? 10 : 11, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", cursor: "pointer", justifyContent: mobile ? "center" : "flex-start", transition: `background 180ms ${EASE}` }}
            onMouseEnter={(e) => (e.currentTarget.style.background = ROSE_DEEP)}
            onMouseLeave={(e) => (e.currentTarget.style.background = ROSE)}
          >
            See your full result <span>→</span>
          </button>
          <button
            onClick={restart}
            style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: mobile ? "15px 28px" : "17px 36px", borderRadius: 100, background: "transparent", color: ROSE_DEEP, border: `1px solid ${HAIRLINE_STRONG}`, fontFamily: SANS, fontSize: mobile ? 10 : 11, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", cursor: "pointer", justifyContent: mobile ? "center" : "flex-start", transition: `all 180ms ${EASE}` }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(196,132,122,0.06)"; e.currentTarget.style.borderColor = ROSE; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = HAIRLINE_STRONG; }}
          >
            Retake
          </button>
        </div>
      </>
    );

    if (mobile) {
      return (
        <div ref={ref} style={{ minHeight: "100vh", background: "#FAF5F3", fontFamily: SANS, color: INK, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% -10%, rgba(196,132,122,0.16), transparent 55%), radial-gradient(circle at -10% 110%, rgba(232,180,174,0.12), transparent 60%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", padding: "60px 24px 80px", opacity: fadeIn ? 1 : 0, transform: fadeIn ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.4s ease, transform 0.4s ease" }}>
            {headerBlock}
            <div style={{ display: "flex", justifyContent: "center", margin: "32px 0" }}>
              {videoCard(260)}
            </div>
            {detailBlock}
            {footerBlock}
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} style={{ minHeight: "100vh", background: "#FAF5F3", fontFamily: SANS, color: INK, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% -10%, rgba(196,132,122,0.16), transparent 55%), radial-gradient(circle at -10% 110%, rgba(232,180,174,0.12), transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 900, margin: "0 auto", padding: "88px 64px 120px", opacity: fadeIn ? 1 : 0, transform: fadeIn ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.4s ease, transform 0.4s ease" }}>
          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 56, alignItems: "start" }}>
            <div>{videoCard(300)}</div>
            <div>
              {headerBlock}
              {detailBlock}
              {footerBlock}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading fallback ──
  return (
    <div style={{ minHeight: "100vh", background: "#FAF5F3", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: `3px solid ${ROSE}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}