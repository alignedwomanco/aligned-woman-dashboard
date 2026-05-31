import { useState, useEffect, useRef } from "react";
import { getAllArchetypes, getArchetype } from "@/data/archetypes";

const PATTERNS = {
  performer: {
    name: "The Performer",
    mirror: "You have not been achieving. You have been performing.",
    pillar: "Identity, Visibility & Personal Brand",
    secondaryPillar: "Mindset & Behaviour",
    description: [
      "You have built your life around a version of yourself that works. She is competent, composed, and almost impossible to fault. She shows up prepared. She delivers. She makes it look effortless. And the gap between who she is in public and who you are in private has become so wide that you are no longer sure which one is real.",
      "This is what it looks like to operate from a constructed identity rather than an authentic one. Your 'I am' statements, the version of you that walks into every room, were not chosen by you. They were assembled from what earned approval, what avoided rejection, what kept you safe in environments that rewarded performance over presence. Beneath the surface, this is identity protection: a behavioural driver so deep it runs beneath your conscious awareness.",
      "If you do not define yourself with intention, you will be defined by assumption. You have been defined by assumption for a long time. Not by the market. By yourself. The version of you that people admire is a construction. She is expensive to maintain. And the exhaustion you feel is not from the work. It is from the distance between who you perform as and who you actually are.",
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
      "Your cortisol pattern tells the story: you are wired. Your stress response has been in a sustained alarm state for so long that your body no longer distinguishes between a real threat and a Tuesday morning. Your fight response has been repurposed as productivity. You are not productive because you are thriving. You are productive because your body does not know how to stop.",
      "This maps to the rescuer pattern: you seek relief through fixing and overhelping. At work, you step in instead of empowering others. At home, you overextend, avoid conflict, manage everyone's emotions. The temporary sense of control comes at the cost of lingering exhaustion. This is overperforming from a place of lack. Saying weak yeses when you should be saying strong nos.",
      "Leadership is not about doing more. It is about buy-in, composure, and clarity. You have confused leadership with labour. The people around you have adapted to your capacity, which means they will never tell you to slow down. The foundation you are missing is not more strength. It is the ability to put yourself down."
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
      "Your relationship with money did not start when you opened your first bank account. It started in the household you grew up in, in the conversations you heard or did not hear, in the scripts you inherited without choosing them. 'Money does not grow on trees.' 'We cannot afford that.' 'Just put it on the card.' These scripts became your financial blueprint, and you have been operating on someone else's blueprint your entire adult life.",
      "Beneath the pattern sits a limiting decision, formed early. It might be 'I am not the kind of person who commands money.' Whatever it is, it has calcified into an identity constraint that no amount of financial literacy will fix on its own. The gap is not knowledge. It is sovereignty. You delegate decisions because the discomfort of getting it wrong feels more dangerous than the cost of never deciding.",
      "The irony is that you are competent everywhere else. You lead teams, you make complex decisions, you navigate ambiguity professionally. But the domain that actually determines your freedom is the one where you defer. The foundation you are missing is not a spreadsheet. It is the belief that you are someone who commands money."
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
      "The mechanism is precise: when you chronically override your body's signals, your cortisol system moves through three phases. First you are wired, running on adrenaline and determination. Then you are wired and tired, waking up exhausted but unable to sleep at night. Then you are just tired, and your body's stress response has effectively shut down. The bill comes due in your thirties or forties in ways that look like sudden decline but are actually years of accumulated debt. Weight gain around the abdomen. Irregular cycles. Brain fog. Inflammation that no one can quite explain.",
      "It shows up in your plate too. You are the woman who has not eaten properly since morning because there was always something more urgent. Protein skipped, blood sugar crashing, gut lining inflamed from years of eating in fight-or-flight. Your body is not failing you. You are failing to listen to it. The framework is simple: protein is your anchor, rhythm not restriction, awareness not control. But the Overrider cannot follow this framework because following it requires slowing down, and slowing down feels more dangerous than the symptoms.",
      "You have dissociated from your body so thoroughly that you do not notice the tension in your shoulders until someone touches them, the shallow breathing until a therapist points it out, the clenched jaw until it becomes a dental problem. Your body has been talking for years. The foundation you are missing is not willpower or a better supplement stack. It is the radical act of treating your body as a source of intelligence rather than something to override."
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
      "Three behavioural drivers sit beneath reactivity: fear of failure, need for approval, and desire for control. When these needs feel threatened, you do not respond. You react. The difference is structural. A response comes from your values. A reaction comes from your nervous system. The discernment pause exists: observe the behaviour, identify the emotional signal, consider the driver, then choose your response. You know this intellectually. The problem is that your amygdala moves faster than your discernment.",
      "This is your left-brain emotional circuit running the show. The protector, the critic. It holds fear, anxiety, insecurity. It identifies threats everywhere. It creates emotional reactivity that hijacks your logic before your frontal lobe can intervene. The cycle is clear: thoughts create feelings, feelings create actions, actions create results, results become evidence for the original belief. You are living inside a loop. Anxiety is future fear. You are investing your resources in a worst-case scenario that has not happened, and the investment itself is exhausting you.",
      "All influence, all connection, begins with listening first. But your pattern makes listening almost impossible because your emotional response arrives before the other person has finished speaking. The relational cost is quiet but severe: the people closest to you have learned to manage your reactions rather than connect with you honestly. The foundation you are missing is not mindfulness or willpower. It is the structural gap between how you receive emotional data and how you process it. That gap is addressable. But not with the tools you have been using."
    ],
    startingModule: "Behavioural Patterns & Emotional Regulation",
  },
};

const QUESTIONS = [
  { id: 1, label: "01", dimension: "Recognition", setup: "Think about the last time someone told you, out loud, that you had done something well. A meaningful recognition. Specific, not generic. Recent enough that you remember the moment.", question: "What was your internal response?", answers: [{ text: "You received it cleanly. Said thank you. Felt it land. Then moved on without immediately deflecting or diminishing it.", pattern: "delegator" }, { text: "You smiled and said the right thing. But inside, you were already questioning whether they really meant it, or whether you had somehow created a false impression.", pattern: "performer" }, { text: "You felt a brief warmth, then immediately thought of three things you still had not done well enough.", pattern: "overFunctioner" }, { text: "You redirected it. Gave credit to the team, the timing, the circumstances. Something in you resists being seen as the one who made it happen.", pattern: "overrider" }, { text: "You were not sure how to sit with it. You either dismissed it quickly or replayed it repeatedly before you landed anywhere.", pattern: "reactor" }] },
  { id: 2, label: "02", dimension: "Pressure", setup: "You are leading a meeting. Someone challenges your recommendation publicly. The room is watching.", question: "What is your first internal response?", answers: [{ text: "A sharp awareness of how you are being perceived. You adjust your position carefully, not because you have changed your mind, but because you need the room back.", pattern: "performer" }, { text: "You feel a pull to fix the tension immediately. You soften your stance or over-explain to reduce the discomfort in the room.", pattern: "overFunctioner" }, { text: "Your body responds before your logic does. There is heat, or a freeze, or a sudden urge to either defend hard or withdraw entirely.", pattern: "reactor" }, { text: "You feel the challenge but hold it at a distance. You defer, or give ground, because the conflict feels more costly than the concession.", pattern: "delegator" }, { text: "You push through. You keep the meeting moving. You process it alone later, if at all.", pattern: "overrider" }] },
  { id: 3, label: "03", dimension: "Opportunity", setup: "An opportunity lands that would stretch you significantly. It is visible, ambitious, and you are maybe 70% ready.", question: "What do you actually do?", answers: [{ text: "You say yes, then quietly work twice as hard to close the gap between where you are and where you need to appear to be.", pattern: "performer" }, { text: "You take it on, then immediately start managing everyone else's expectations and timelines as well as your own.", pattern: "overFunctioner" }, { text: "You hesitate. You think about who else might be better placed. You wonder if it is the right time. You probably do not take it.", pattern: "delegator" }, { text: "You assess whether your body and energy can sustain it. If you have nothing left, you decline, and feel the cost of that declining for weeks.", pattern: "overrider" }, { text: "You either jump impulsively because the energy of the moment pulls you in, or you overthink it until the window closes and the decision is made for you before you can deliver it.", pattern: "reactor" }] },
  { id: 4, label: "04", dimension: "Exhaustion", setup: "You have had three consecutive weeks where every day demanded more than you had.", question: "What does week four actually look like?", answers: [{ text: "You still show up as if nothing has shifted. The output stays consistent. You manage the perception. Inside, you are running on fumes.", pattern: "performer" }, { text: "You carry everyone else through it. You check in on the team. You hold the energy in the room. You do not let anyone see the cost.", pattern: "overFunctioner" }, { text: "You get quieter. You withdraw. You start delegating more, sometimes to the point of disengagement, because you genuinely do not have the reserves to engage.", pattern: "delegator" }, { text: "You ignore the signals and push into week four the same way you pushed into weeks one, two, and three. You will rest when it is over.", pattern: "overrider" }, { text: "Your reactions become unpredictable. Small things land harder. You say things you have to walk back. You are not your worst self, but you are close, and you know it.", pattern: "reactor" }] },
  { id: 5, label: "05", dimension: "Body Signals", setup: "Your sleep has been off for weeks. Your energy crashes every afternoon. Something in your body has shifted and it is not resolving on its own.", question: "What is your honest first response?", answers: [{ text: "You keep the presentation of energy intact externally. You use whatever you need to maintain output. You do not let the fatigue show.", pattern: "performer" }, { text: "You try to fix it by adding structure: earlier sleep, better nutrition, more exercise. You manage your body the way you manage a project.", pattern: "overFunctioner" }, { text: "You google it briefly, feel overwhelmed by the options, and hand the problem to someone else. A doctor, a partner, a programme you pay for and do not follow.", pattern: "delegator" }, { text: "You note it and continue. You have performed through worse. You will address it properly once the current pressure eases.", pattern: "overrider" }, { text: "You spiral slightly. You catastrophise, or swing to the other end and dismiss it entirely. Either way, it has already hijacked your week.", pattern: "reactor" }] },
  { id: 6, label: "06", dimension: "Nourishment", setup: "It is 3pm on a demanding day. You have not eaten properly since morning.", question: "What actually happens next?", answers: [{ text: "You eat something if people are around. If you are alone, you probably skip it or grab whatever requires no thought, then feel the energy crash an hour later and push through it.", pattern: "performer" }, { text: "You have snacks prepared. You have thought about this. But you have probably already eaten them while solving someone else's problem and did not register the meal.", pattern: "overFunctioner" }, { text: "You decide you will sort it later and continue working. Later becomes evening. You eat more than you needed because you waited too long and your body stopped being able to regulate the signal.", pattern: "delegator" }, { text: "You override the signal completely. You are aware you are hungry. You file it for later. Your body has learned to stop asking.", pattern: "overrider" }, { text: "You make an impulsive decision. You eat something that is not aligned with how you want to feel, feel guilty about it, and the guilt takes more energy than whatever you are feeling.", pattern: "reactor" }] },
  { id: 7, label: "07", dimension: "Disappointment", setup: "Someone close to you lets you down in a way that actually matters. Not a small thing. A real one.", question: "What do you do with it?", answers: [{ text: "You process it privately. You do not let it show. You adjust your expectations quietly and continue.", pattern: "performer" }, { text: "You absorb the impact and immediately start managing the situation. You try to fix it, smooth it over, or hold the relationship together while processing your own disappointment separately.", pattern: "overFunctioner" }, { text: "You minimise it. You tell yourself it does not matter, or that you should have expected less. You move the responsibility for your own needs somewhere else.", pattern: "delegator" }, { text: "You push through the feeling. You acknowledge it briefly and get back to what needs doing. You will deal with it eventually.", pattern: "overrider" }, { text: "Your response is immediate and felt by the room. You either say more than you intended, go quiet in a way that communicates clearly, or replay the moment until you have exhausted your interpretation of it and said more than you intended.", pattern: "reactor" }] },
  { id: 8, label: "08", dimension: "Support", setup: "You need something from someone. Not a task delegated. Real support. The kind that requires you to be seen as not having it all together.", question: "What do you actually do?", answers: [{ text: "You reframe the need so it sounds like a strategic conversation rather than a personal one. You get the support without revealing that you needed it.", pattern: "performer" }, { text: "You offer support to others while waiting for someone to notice you need it too. You do not ask directly.", pattern: "overFunctioner" }, { text: "You find a way to hand the weight to someone else, but in a way that feels like you are just being practical rather than vulnerable.", pattern: "delegator" }, { text: "You do not ask. You manage. You file the need and continue until the moment where it is no longer possible to continue.", pattern: "overrider" }, { text: "You either ask for it in a way that is harder to receive than you intended, or you avoid asking entirely because the risk of the ask feels higher than the cost of going without it, and the dynamic shifts.", pattern: "reactor" }] },
  { id: 9, label: "09", dimension: "Conflict", setup: "There is a conversation you have been avoiding. Something needs to be said, and you know it.", question: "What has kept you from saying it?", answers: [{ text: "The fear that the honest version will damage how you are perceived. You are waiting for a version of the conversation where you can be direct without the relational cost.", pattern: "performer" }, { text: "You are protecting someone. You have decided, on their behalf, that they cannot handle it, or that the timing is wrong, or that your role is to hold the peace.", pattern: "overFunctioner" }, { text: "You are not entirely sure what you want to say. The clarity you need to have the conversation keeps evading you, and without it, the conversation does not happen.", pattern: "delegator" }, { text: "You have not had the capacity. You will have it when things settle. Things have not settled.", pattern: "overrider" }, { text: "You are afraid of your own response in the moment. You do not fully trust that the version of you in that conversation will say it the way you intend, and the cost of getting it wrong feels higher than the cost of not saying it. You have been holding the unsaid thing so tightly it is already hijacking the message.", pattern: "reactor" }] },
  { id: 10, label: "10", dimension: "Money", setup: "Think about your actual relationship with your own financial position. Not the story you tell people. The real one.", question: "Which of these is closest to the truth?", answers: [{ text: "You earn well and spend in ways that support the version of yourself you present. The number is less important than what it signals.", pattern: "performer" }, { text: "You manage it carefully because losing control of it would mean losing control of everything. It is less about wealth and more about not being caught out.", pattern: "overFunctioner" }, { text: "You have handed the real decision-making to someone or something else. A partner, an advisor, avoidance. You are not sure of the actual number.", pattern: "delegator" }, { text: "You know roughly where you are and you will deal with the gaps later. There is always something more urgent than sorting this properly.", pattern: "overrider" }, { text: "Your relationship with money is emotionally charged. It is either a source of anxiety, a comfort mechanism, or both. The number does not match the feeling, and you have not fully worked out why. Something about it makes you feel fundamentally wrong with you.", pattern: "reactor" }] },
  { id: 11, label: "11", dimension: "Worth", setup: "Think about the last time your contribution was being assessed. A performance review, a salary conversation, a moment where what you bring was being weighed against what you receive.", question: "What was your internal experience?", answers: [{ text: "You prepared extensively. You presented a version of yourself that made the strongest possible case. Internally, you were managing the gap between what you know you deliver and the fear that they would see through it.", pattern: "performer" }, { text: "You advocated for the team before yourself. You mentioned everything you had held together. You left wondering if you had undersold your own part.", pattern: "overFunctioner" }, { text: "You accepted what was offered. You told yourself it was fair, or close enough, or that negotiating would create more tension than the difference was worth.", pattern: "delegator" }, { text: "You went in underprepared. You had the skills but not the data to support the conversation. You walked out knowing you should have fought harder but not having the energy to go back.", pattern: "overrider" }, { text: "You either over-advocated and felt the room shift, or you froze entirely and said less than you meant to. The emotional charge of the moment overrode the strategy. You are still in a reactive state, and you know it.", pattern: "reactor" }] },
  { id: 12, label: "12", dimension: "The Pattern", setup: "Read these five sentences slowly. Pick the one you have lived the longest.", question: "Which of these is the pattern you are most tired of?", answers: [{ text: "I am tired of building a life that looks exactly right and feels like it belongs to someone else.", pattern: "performer" }, { text: "I am tired of holding everything together for everyone and having nothing left for myself.", pattern: "overFunctioner" }, { text: "I am tired of waiting for someone else to give me permission to take up the space I have already earned.", pattern: "delegator" }, { text: "I am tired of my body paying the price for everything I refuse to put down.", pattern: "overrider" }, { text: "I am tired of reacting before I have had the chance to choose, and watching the cost of that pattern compound in the relationships and opportunities I seem to stop doing it.", pattern: "reactor" }] },
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

  if (screen === "intro") {
    const centered = !mobile;
    return (
      <div ref={ref} style={{ minHeight: "100vh", background: "#FAF5F3", fontFamily: SANS, color: INK, padding: mobile ? "60px 24px 80px" : "88px 64px 120px", boxSizing: "border-box", position: "relative", overflow: "hidden" }}>
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
            This is not a personality quiz. It is a diagnostic built from the work of thirteen specialists across psychology, neuroscience, health, money, and leadership. It reads the pattern running beneath your ambition, your exhaustion, and the gap between what you are capable of and what you are actually doing.
          </p>
          <div style={{ marginTop: mobile ? 28 : 36 }}>
            <button
              onClick={() => transition(() => setScreen("quiz"))}
              style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: mobile ? "16px 28px" : "18px 36px", borderRadius: 100, background: ROSE, color: "#FFFFFF", border: "none", fontFamily: SANS, fontSize: mobile ? 10 : 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", cursor: "pointer", transition: `background 180ms ${EASE}` }}
              onMouseEnter={(e) => (e.currentTarget.style.background = ROSE_DEEP)}
              onMouseLeave={(e) => (e.currentTarget.style.background = ROSE)}
            >
              Show me <span>&#8594;</span>
            </button>
          </div>
          <h2 style={{ margin: centered ? (mobile ? "40px 0 24px" : "64px auto 32px") : (mobile ? "40px 0 24px" : "64px 0 32px"), fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: mobile ? 26 : 36, lineHeight: 1.15, letterSpacing: "-0.015em", color: INK }}>
            Which one are <em style={{ fontStyle: "italic", color: ROSE_DEEP }}>you</em>?
          </h2>
          <ArchetypeCarousel mobile={mobile} />
          <div style={{ marginTop: mobile ? 32 : 44, paddingLeft: centered ? 0 : (mobile ? 16 : 20), paddingTop: centered ? 28 : 0, borderLeft: centered ? "none" : `1px solid ${HAIRLINE}`, maxWidth: mobile ? "100%" : 560, marginLeft: centered ? "auto" : 0, marginRight: centered ? "auto" : 0 }}>
            <p style={{ margin: 0, fontFamily: SANS, fontSize: mobile ? 13 : 14, lineHeight: 1.7, color: INK_BODY, fontWeight: 300 }}>
              You will recognise yourself in more than one answer. That is how patterns work. They overlap. Pick the one that runs first, the response you default to before you have time to choose a better one. This is not reading your best day. It is reading your operating system.
            </p>
          </div>
          <div style={{ marginTop: mobile ? 36 : 48 }}>
            <button
              onClick={() => transition(() => setScreen("quiz"))}
              style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: mobile ? "16px 28px" : "18px 36px", borderRadius: 100, background: ROSE, color: "#FFFFFF", border: "none", fontFamily: SANS, fontSize: mobile ? 10 : 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", cursor: "pointer", transition: `background 180ms ${EASE}` }}
              onMouseEnter={(e) => (e.currentTarget.style.background = ROSE_DEEP)}
              onMouseLeave={(e) => (e.currentTarget.style.background = ROSE)}
            >
              Show me <span>&#8594;</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% -10%, rgba(196,132,122,0.16), transparent 55%), radial-gradient(circle at -10% 110%, rgba(232,180,174,0.12), transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: mobile ? "100%" : 700, margin: "0 auto", padding: mobile ? "48px 24px 80px" : "72px 28px 100px", opacity: fadeIn ? 1 : 0, transform: fadeIn ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.4s ease, transform 0.4s ease" }}>
          <div style={{ display: "flex", gap: mobile ? 4 : 8, marginBottom: mobile ? 32 : 48 }}>
            {shuffledQs.map((_, i) => (
              <div key={i} style={{ flex: 1, height: 2, borderRadius: 2, background: i <= currentQ ? ROSE : HAIRLINE, transition: `background 0.4s ${EASE}` }} />
            ))}
          </div>
          <div style={{ fontFamily: SANS, fontSize: mobile ? 10 : 11, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: ROSE }}>
            Question {q.label} of 12
          </div>
          <div style={{ marginTop: mobile ? 10 : 14, fontFamily: SANS, fontSize: mobile ? 10 : 11, fontWeight: 600, letterSpacing: "0.24em", textTransform: "uppercase", color: INK_MUTED }}>
            {q.dimension}
          </div>
          {q.setup && (
            <p style={{ margin: mobile ? "22px 0 0" : "28px 0 0", fontFamily: SANS, fontSize: mobile ? 14 : 15, fontWeight: 300, lineHeight: 1.75, color: INK_BODY, maxWidth: mobile ? "100%" : 560 }}>
              {q.setup}
            </p>
          )}
          <h2 style={{ margin: mobile ? "32px 0 28px" : "44px 0 36px", fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: mobile ? 28 : 38, lineHeight: 1.15, letterSpacing: "-0.015em", color: INK, maxWidth: mobile ? "100%" : 640 }}>
            {q.question}
          </h2>
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
          <div style={{ marginTop: mobile ? 32 : 44, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
            <button
              onClick={handleBack}
              style={{ background: "transparent", border: "none", color: INK_MUTED, fontFamily: SANS, fontSize: mobile ? 10 : 11, fontWeight: 600, letterSpacing: "0.24em", textTransform: "uppercase", cursor: "pointer", padding: 0, transition: `color 180ms ${EASE}` }}
              onMouseEnter={(e) => (e.currentTarget.style.color = INK)}
              onMouseLeave={(e) => (e.currentTarget.style.color = INK_MUTED)}
            >
              &#8592; Back
            </button>
            <span style={{ fontFamily: SANS, fontSize: mobile ? 10 : 11, fontWeight: 600, letterSpacing: "0.24em", textTransform: "uppercase", color: INK_MUTED }}>
              {currentQ + 1} / {shuffledQs.length}
            </span>
          </div>
        </div>
      </div>
    );
  }

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
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(20,4,12,0.92) 0%, rgba(20,4,12,0.7) 30%, rgba(20,4,12,0.15) 55%, transparent 70%)", pointerEvents: "none" }} />
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
        <h1 style={{ margin: mobile ? "20px 0 20px" : "24px 0 28px", fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: mobile ? 52 : 84, lineHeight: 1, letterSpacing: "-0.02em", color: INK }}>
          {result.name}
        </h1>
        <p style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: mobile ? 18 : 22, lineHeight: 1.45, color: ROSE_DEEP, maxWidth: mobile ? "100%" : 460 }}>
          {result.mirror}
        </p>
      </>
    );

    const detailBlock = (
      <div style={{ marginTop: mobile ? 28 : 32, display: "flex", flexDirection: "column", gap: mobile ? 20 : 22, maxWidth: mobile ? "100%" : 460 }}>
        <div>
          <div style={{ fontFamily: SANS, fontSize: mobile ? 10 : 11, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: ROSE, marginBottom: mobile ? 8 : 10 }}>At your best</div>
          <p style={{ margin: 0, fontFamily: SANS, fontSize: mobile ? 13 : 14, lineHeight: 1.7, color: INK_BODY, fontWeight: 300 }}>{atBest}</p>
        </div>
        <div>
          <div style={{ fontFamily: SANS, fontSize: mobile ? 10 : 11, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: ROSE, marginBottom: mobile ? 8 : 10 }}>At your worst</div>
          <p style={{ margin: 0, fontFamily: SANS, fontSize: mobile ? 13 : 14, lineHeight: 1.7, color: INK_BODY, fontWeight: 300, filter: "blur(6px)", userSelect: "none" }}>{atWorst}</p>
        </div>
      </div>
    );

    const footerBlock = (
      <>
        <div style={{ margin: "32px 0", width: 56, height: 1, background: ROSE }} />
        <p style={{ margin: 0, fontFamily: SANS, fontSize: mobile ? 14 : 15, lineHeight: 1.75, color: INK_BODY, maxWidth: mobile ? "100%" : 460, fontWeight: 300 }}>
          Your full diagnostic is ready, written by our specialists about the pattern that has been running your life. Sign up to read the full detail.
        </p>
      </>
    );

    if (mobile) {
      return (
        <div ref={ref} style={{ minHeight: "100vh", background: "#FAF5F3", fontFamily: SANS, color: INK, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% -10%, rgba(196,132,122,0.16), transparent 55%), radial-gradient(circle at -10% 110%, rgba(232,180,174,0.12), transparent 60%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", padding: "60px 24px 80px", opacity: fadeIn ? 1 : 0, transform: fadeIn ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.4s ease, transform 0.4s ease" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
              {videoCard(260)}
            </div>
            {headerBlock}
            {detailBlock}
            {/* Bottom centered footer */}
            <div style={{ marginTop: 40, textAlign: "center" }}>
              <p style={{ margin: "0 auto 24px", fontFamily: SANS, fontSize: 14, lineHeight: 1.75, color: INK_BODY, fontWeight: 300 }}>
                Your full diagnostic is ready, written by our specialists about the pattern that has been running your life. Sign up to read the full detail.
              </p>
              <button
                onClick={handleSeeResult}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 100, background: "#FFFFFF", color: ROSE_DEEP, border: `1px solid ${HAIRLINE_STRONG}`, fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", cursor: "pointer", transition: `all 180ms ${EASE}` }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(196,132,122,0.06)"; e.currentTarget.style.borderColor = ROSE; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.borderColor = HAIRLINE_STRONG; }}
              >
                <span style={{ fontSize: 12 }}>&#x1F512;</span> Read the full detail
              </button>
              <div style={{ marginTop: 12 }}>
                <button
                  onClick={restart}
                  style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "11px 22px", borderRadius: 100, background: "transparent", color: ROSE_DEEP, border: `1px solid ${HAIRLINE_STRONG}`, fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", cursor: "pointer", transition: `all 180ms ${EASE}` }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(196,132,122,0.06)"; e.currentTarget.style.borderColor = ROSE; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = HAIRLINE_STRONG; }}
                >
                  Retake
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} style={{ minHeight: "100vh", background: "#FAF5F3", fontFamily: SANS, color: INK, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% -10%, rgba(196,132,122,0.16), transparent 55%), radial-gradient(circle at -10% 110%, rgba(232,180,174,0.12), transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 900, margin: "0 auto", padding: "88px 64px 120px", opacity: fadeIn ? 1 : 0, transform: fadeIn ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.4s ease, transform 0.4s ease" }}>
          {/* Top: 2-col grid */}
          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 56, alignItems: "start" }}>
            <div>{videoCard(300)}</div>
            <div>
              {headerBlock}
              {detailBlock}
            </div>
          </div>
          {/* Bottom: full-width centered footer */}
          <div style={{ marginTop: 56, textAlign: "center" }}>
            <p style={{ margin: "0 auto 28px", fontFamily: SANS, fontSize: 15, lineHeight: 1.75, color: INK_BODY, maxWidth: 460, fontWeight: 300 }}>
              Your full diagnostic is ready, written by our specialists about the pattern that has been running your life. Sign up to read the full detail.
            </p>
            <button
              onClick={handleSeeResult}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 26px", borderRadius: 100, background: "#FFFFFF", color: ROSE_DEEP, border: `1px solid ${HAIRLINE_STRONG}`, fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", cursor: "pointer", transition: `all 180ms ${EASE}` }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(196,132,122,0.06)"; e.currentTarget.style.borderColor = ROSE; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.borderColor = HAIRLINE_STRONG; }}
            >
              <span style={{ fontSize: 12 }}>&#x1F512;</span> Read the full detail
            </button>
            <div style={{ marginTop: 12 }}>
              <button
                onClick={restart}
                style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "12px 28px", borderRadius: 100, background: "transparent", color: ROSE_DEEP, border: `1px solid ${HAIRLINE_STRONG}`, fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", cursor: "pointer", transition: `all 180ms ${EASE}` }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(196,132,122,0.06)"; e.currentTarget.style.borderColor = ROSE; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = HAIRLINE_STRONG; }}
              >
                Retake
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FAF5F3", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: `3px solid ${ROSE}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}