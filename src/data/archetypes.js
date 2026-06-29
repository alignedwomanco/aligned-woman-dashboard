/**
 * Archetype data: single source of truth.
 *
 * Used by:
 *   - Quiz result screen (QuizResult.jsx)        → name, mirrorLine, atBest, atWorst, videoUrl, posterImage
 *   - Dashboard State C (free user)               → name, fullDescription, primaryPillar, secondaryPillar, foundation
 *   - Dashboard State A with quiz (paid user)     → name, fullDescription, primaryPillar, secondaryPillar, foundation
 *   - Welcome carousel (QuizWelcome.jsx)          → name, posterImage
 *   - Intake card (WhyYouStarted / IntakeModal)   → name, mirrorLine
 */

const ARCHETYPES = {
  performer: {
    key: "performer",
    name: "The Performer",
    mirrorLine:
      "Identity is performance-dependent. Without the performing, you have no reliable sense of self.",

    atBest:
      "You are magnetic. Composed, prepared, and deeply competent. You walk into a room and people trust you before you have said a word. You deliver. You rise. You make complex things look effortless. Your ability to read a room and position yourself is a genuine skill, not a performance. When this pattern is working for you, it builds empires.",

    atWorst:
      "The version of you people admire is a construction, and she is expensive to maintain. You cannot remember the last time you let someone see you without the armour. The exhaustion you feel is not from the work. It is from the distance between who you perform as and who you actually are. You have built a life that looks right and feels hollow.",

    fullDescription:
      "You have built your life around a version of yourself that works. She is competent, composed, and almost impossible to fault. She shows up prepared. She delivers. She makes it look effortless. And the gap between who she is in public and who you are in private has become so wide that you are no longer sure which one is real.",

    primaryPillar: "Identity, Visibility & Personal Brand",
    primaryPillarNote:
      "where you will learn to define yourself with intention rather than assumption.",

    secondaryPillar: "Mindset & Behaviour",
    secondaryPillarNote:
      "where the identity protection patterns running beneath your conscious awareness are made visible and addressable.",

    foundation:
      "The foundation you are missing is not competence. You already have that. The foundation you are missing is knowing who you are without the performance.",

    videoUrl: "https://pub-e1032a6c8b9241cf9d03513d43a81f17.r2.dev/The%20Performer.mp4",
    posterImage: "",
  },

  overFunctioner: {
    key: "overFunctioner",
    name: "The Over-Functioner",
    mirrorLine:
      "You carry more than your share and your body knows it even when your mind refuses to admit it.",

    atBest:
      "You are the person everyone counts on, and for good reason. You show up. You hold space. You absorb complexity so others do not have to. Your instinct to care for the people around you is real and it has built trust, loyalty, and deep relationships. When this pattern is working for you, you are a quiet force.",

    atWorst:
      "You carry what is not yours to hold and your body knows it even when your mind refuses to admit it. You have confused leadership with labour. You say weak yeses when you should be saying strong nos. The people around you have adapted to your capacity, which means they will never tell you to slow down. Your nervous system has forgotten what rest actually feels like.",

    fullDescription:
      "You carry more than your share and you have done it for so long that it feels like your nature rather than a pattern. You are the one who holds it together. The one who shows up early, stays late, absorbs the tension in the room, and makes sure nothing falls through. Other people's systems run because you run them. And the cost of that is a nervous system that has forgotten what rest actually feels like.",

    primaryPillar: "Nervous System & Emotional Regulation",
    primaryPillarNote:
      "where you will learn to recognise the difference between productivity and a body that does not know how to stop.",

    secondaryPillar: "Leadership, Authority & Career",
    secondaryPillarNote:
      "where you will unlearn the pattern of confusing leadership with labour and learn to lead from composure rather than capacity.",

    foundation:
      "The foundation you are missing is not more strength. It is the ability to put yourself down.",

    videoUrl: "https://pub-e1032a6c8b9241cf9d03513d43a81f17.r2.dev/vertical%20The%20Over-Functioner.mp4",
    posterImage: "",
  },

  delegator: {
    key: "delegator",
    name: "The Delegator",
    mirrorLine:
      "You have not been delegating. You have been giving your power away.",

    atBest:
      "You know how to build systems, create space, and let other people do what they do well. You are strategic. You are not threatened by delegation. You can hold complexity without needing to control every detail. When this pattern is working for you, it looks like wisdom.",

    atWorst:
      "The distance that protects you also keeps you from the thing you want most. You have handed your decisions, your emotional choices, or your power to someone else and called it a preference. 'I trust them with that.' 'I am just not the one who deals with it.' These are not preferences. They are patterns. You are competent everywhere except the areas that actually determine your freedom.",

    fullDescription:
      "You are capable, often exceptionally so. But somewhere along the way you handed your decisions, your authority, or your hardest choices to someone else, or to avoidance itself, and called it a personality trait. 'I am just not the one who handles that.' 'I trust them with it.' 'Someone else takes care of it.' These are not preferences. They are patterns. And they are quietly costing you the one thing they were never meant to: your own freedom.",

    primaryPillar: "Leadership, Authority & Career",
    primaryPillarNote:
      "where you will reclaim authority over the decisions that shape your life instead of handing them to someone else.",

    secondaryPillar: "Mindset & Behaviour",
    secondaryPillarNote:
      "where the deeper pattern of delegating power and avoiding discomfort is made visible and addressable.",

    foundation:
      "The foundation you are missing is not competence. You already have that. It is the belief that you are someone who keeps her own authority rather than handing it away.",

    videoUrl: "https://pub-e1032a6c8b9241cf9d03513d43a81f17.r2.dev/vertical%20The%20Delegator%20.mp4",
    posterImage: "",
  },

  overrider: {
    key: "overrider",
    name: "The Overrider",
    mirrorLine:
      "Your body sends signals and you override every single one.",

    atBest:
      "You are relentless in the best sense. When you commit, you deliver. Your drive has taken you further than most people thought possible. You do not quit. You do not make excuses. When this pattern is working for you, it looks like discipline, focus, and extraordinary resilience.",

    atWorst:
      "Your body sends signals and you override every single one. Pain, fatigue, hormonal shifts, illness. The bill comes due in your thirties or forties in ways that look like sudden decline but are actually years of accumulated debt. You push through to dinner without eating. You push through the exhaustion without sleeping. You have dissociated from your body so thoroughly that you do not notice until something breaks.",

    fullDescription:
      "You push through. Pain, fatigue, hormonal shifts, illness, grief. Your body sends signals and you override every single one because there is always something more important than how you feel. You have been rewarded for this your entire life. School rewarded it. Work rewarded it. Relationships rewarded it. Nobody told you that the override has a physiological cost that compounds.",

    primaryPillar: "Health, Hormones & Body Literacy",
    primaryPillarNote:
      "where you will learn what your body has been trying to tell you and why the override has a cost that compounds.",

    secondaryPillar: "Nervous System & Emotional Regulation",
    secondaryPillarNote:
      "where you will reconnect with the body you have been treating as an obstacle to productivity.",

    foundation:
      "The foundation you are missing is not willpower or a better supplement stack. It is the radical act of treating your body as a source of intelligence rather than something to override.",

    videoUrl: "https://pub-e1032a6c8b9241cf9d03513d43a81f17.r2.dev/vertical%20The%20Overrider%20.mp4",
    posterImage: "",
  },

  reactor: {
    key: "reactor",
    name: "The Reactor",
    mirrorLine:
      "Your nervous system speaks before you do.",

    atBest:
      "You feel everything, fast and deep. That is not weakness. It is a form of intelligence that most people do not have access to. You read emotional shifts in a room before anyone else notices. You are perceptive, empathetic, and when this pattern is working for you, it makes you the person others trust with the truth.",

    atWorst:
      "Your nervous system speaks before you do. You react, then regret, then correct, then repeat. You can see the pattern clearly and you still fall into it. Your amygdala moves faster than your discernment. Anxiety is future fear, and you are investing your resources in worst-case scenarios that have not happened. The emotion shapes the words before your logic can intervene.",

    fullDescription:
      "You respond. To other people's urgency, to emotional shifts in a room, to crises that may not be yours. Your life has a pattern of high reactivity followed by regret, correction, and then the same cycle again. You can see it happening. That is the painful part. You are not unaware. You are aware and still caught.",

    primaryPillar: "Mindset & Behaviour",
    primaryPillarNote:
      "where you will learn the structural difference between a response and a reaction, and build the gap between how you receive emotional data and how you process it.",

    secondaryPillar: "Relationships & Connection",
    secondaryPillarNote:
      "where the patterns that show up in how you relate to others are addressed at the root.",

    foundation:
      "The foundation you are missing is not mindfulness or willpower. It is the structural gap between how you receive emotional data and how you process it. That gap is addressable. But not with the tools you have been using.",

    videoUrl: "https://pub-e1032a6c8b9241cf9d03513d43a81f17.r2.dev/vertical%20The%20Reactor%20.mp4",
    posterImage: "",
  },
};

/**
 * Carousel order for the welcome screen.
 * Matches the design: Performer center, others flanking.
 */
export const CAROUSEL_ORDER = [
  "performer",
  "overFunctioner",
  "delegator",
  "overrider",
  "reactor",
];

/**
 * Look up an archetype by its key (e.g., "performer")
 * or by its display name (e.g., "The Performer").
 */
export function getArchetype(keyOrName) {
  if (!keyOrName) return null;
  const lower = keyOrName.toLowerCase().replace(/\s+/g, "");

  // Direct key match
  if (ARCHETYPES[keyOrName]) return ARCHETYPES[keyOrName];

  // Name match
  return (
    Object.values(ARCHETYPES).find(
      (a) => a.name.toLowerCase().replace(/\s+/g, "") === lower
    ) || null
  );
}

/**
 * Return all archetypes as an array in carousel order.
 */
export function getAllArchetypes() {
  return CAROUSEL_ORDER.map((key) => ARCHETYPES[key]);
}

export default ARCHETYPES;