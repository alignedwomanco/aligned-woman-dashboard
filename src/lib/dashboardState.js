import { base44 } from "@/api/base44Client";

/**
 * getDashboardState
 *
 * Reads the current authenticated user's User record and linked MemberProfile,
 * evaluates four conditional rules in priority order, and returns one of:
 *   "state_b"           paid user, first visit (has_seen_welcome = false)
 *   "state_a_no_quiz"   paid user, returning, no archetype yet
 *   "state_a_with_quiz" paid user, returning, archetype resolved
 *   "state_c"           free user with archetype resolved
 *
 * NOTE: When this function returns "state_b", the calling dashboard page is
 * responsible for flipping MemberProfile.has_seen_welcome to true AFTER the
 * welcome UI has been displayed. Do NOT perform that update here. State
 * determination must remain a pure read.
 *
 * @returns {Promise<{ state: string, user: object, profile: object }>}
 *   state is one of the four state identifiers above. user is the User record.
 *   profile is the MemberProfile record. Both are returned so the dashboard
 *   page does not need to re-fetch.
 * @throws {Error} if the user is not authenticated or MemberProfile is missing
 */
export async function getDashboardState() {
  // Step 1: Load authenticated user.
  const user = await base44.auth.me();
  if (!user || !user.id) {
    throw new Error("getDashboardState: no authenticated user found.");
  }

  // Step 2: Load MemberProfile linked to this user.
  const profiles = await base44.entities.MemberProfile.filter(
    { user_id: user.id },
    "-created_date",
    1
  );
  const profile = profiles?.[0] ?? null;

  if (!profile) {
    throw new Error(
      `getDashboardState: no MemberProfile found for user id ${user.id}.`
    );
  }

  // Step 3: Derive flags.
  const accessTags = Array.isArray(user.access_tags) ? user.access_tags : [];
  const isPaid = accessTags.includes("blueprint_paid");

  const hasSeenWelcome = profile.has_seen_welcome === true;
  const archetypeKey = profile.computed_archetype_key ?? null;

  // Step 4: State rules, evaluated in strict priority order.
  let state;
  if (isPaid && !hasSeenWelcome) {
    state = "state_b";
  } else if (isPaid && hasSeenWelcome && archetypeKey === null) {
    state = "state_a_no_quiz";
  } else if (isPaid && hasSeenWelcome && archetypeKey !== null) {
    state = "state_a_with_quiz";
  } else if (!isPaid && archetypeKey !== null) {
    state = "state_c";
  } else {
    // Fallback: free user with no quiz data. At launch this combination should
    // not occur (free users enter via the quiz signup path and always have
    // computed_archetype_key by the time they reach the dashboard). Returning
    // state_a_no_quiz is the safest fallback because it renders the quiz
    // invitation card, nudging the user toward completing it.
    state = "state_a_no_quiz";
  }

  return { state, user, profile };
}
