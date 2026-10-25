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
      "You have become very good at looking like you have it handled, and very tired of being the only one who knows you don't.",

    atBest:
      "You read a room in seconds. You hold standards others rely on, and you deliver under pressure without letting it show.",

    atWorst:
      "The gap between how it looks and how it feels keeps widening. Praise doesn't land, rest feels like a risk, and nobody gets to see the real picture, sometimes not even you.",

    fullDescription:
      "Your nervous system learned that being seen struggling was unsafe. So you built a polished version that does the visible work while the real you runs underneath it, unsupported.",

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
      "You hold everything together so well that nobody has noticed you're the one who needs holding.",

    atBest:
      "You see what needs doing before anyone asks. People feel safe around you, and things work because you are in them.",

    atWorst:
      "Your needs keep moving to the bottom of the list. You resent the load and keep picking it up anyway, and when you finally stop, there is nothing left for you.",

    fullDescription:
      "Somewhere along the way, being useful became the condition for being loved. Your system treats other people's discomfort as an emergency you have to fix.",

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
      "You've earned the seat at the table. You're still waiting for someone to tell you it's yours.",

    atBest:
      "You are collaborative, generous with credit and easy to work with. You make space for others and keep the peace.",

    atWorst:
      "Decisions about your money, health and career end up in other people's hands. You undersell yourself, then wonder why the outcome doesn't fit you.",

    fullDescription:
      "You learned that taking up space caused friction, so you hand the wheel over before anyone can say you took too much. It looks like modesty. It costs you authorship of your own life.",

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
      "You've pushed through so much for so long that your body has stopped asking, and started telling.",

    atBest:
      "You are relentless, reliable and hard to rattle. When things get difficult, you are the one who keeps going.",

    atWorst:
      "Sleep, energy, pain and mood send signals you've learned to ignore. You rest only when your body forces you to, and the bill keeps arriving later and larger.",

    fullDescription:
      "Your capacity became your identity. Every time you push past a signal and it works, your system learns that signals don't matter, until they matter all at once.",

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
      "You feel everything at full volume, and most days the feeling chooses before you do.",

    atBest:
      "You are honest, alive to what is happening and quick to sense when something is wrong. People always know where they stand with you.",

    atWorst:
      "Your response arrives before your choice does. You say things you walk back, freeze when it matters, and spend days replaying moments that lasted seconds.",

    fullDescription:
      "Your nervous system is set to react fast, usually because it once had to. This isn't a character flaw. It's a missing gap between feeling and response, and that gap can be built.",

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