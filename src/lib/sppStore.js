import { base44 } from "@/api/base44Client";
import { ensureMemberProfile } from "@/lib/ensureMemberProfile";
import { PLATFORM_KEY, DESIGN_KEY, PATTERN_IMAGES, QUIZ_VERSION } from "@/data/startingPointProfile";

// ────────────────────────────────────────────────────────────────
// Starting Point Profile v3: storage, saving and tracking.
//
// aw_spp_progress  (localStorage) where she is in the quiz, so a refresh or a
//                  lost signal resumes at the same question. Cleared once
//                  the result is saved to her profile.
// aw_quiz_result   (localStorage) the hand-off. The Dashboard read this
//                  before v3 and still does, through saveQuizResultToProfile.
//                  Whichever page she reaches first saves it, then clears it.
// ProfileAttempt   one row per attempt, written only through the
//                  saveProfileAttempt backend function (see that file).
// ────────────────────────────────────────────────────────────────

export const PROGRESS_KEY = "aw_spp_progress";
export const RESULT_KEY = "aw_quiz_result";

const safeGet = (k) => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (_e) { return null; } };
const safeSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_e) { /* private mode */ } };
const safeDel = (k) => { try { localStorage.removeItem(k); } catch (_e) { /* private mode */ } };

export const readProgress = () => safeGet(PROGRESS_KEY);
export const writeProgress = (p) => safeSet(PROGRESS_KEY, p);
export const clearProgress = () => safeDel(PROGRESS_KEY);
export const readResult = () => safeGet(RESULT_KEY);
export const writeResult = (r) => safeSet(RESULT_KEY, r);
export const clearResult = () => safeDel(RESULT_KEY);

export const FIT_KEY = { "Yes, that's me": "yes", Partly: "partly", "Not really": "not_really" };
export const FIT_LABEL = { yes: "Yes, that's me", partly: "Partly", not_really: "Not really" };

export const guessToPlatform = (g) => (g === "X" ? "unsure" : PLATFORM_KEY[g] || undefined);
export const guessFromPlatform = (g) => (g === "unsure" ? "X" : DESIGN_KEY[g] || null);

export function mixToObject(mix) {
  const out = {};
  (mix || []).forEach((m) => { out[PLATFORM_KEY[m.k]] = m.pct; });
  return out;
}

// Rebuild the design-shaped mix (ranked, primary first) from the stored object.
export function mixFromObject(obj, primary, secondary) {
  if (!obj) return null;
  const rows = Object.entries(obj)
    .filter(([k]) => DESIGN_KEY[k])
    .map(([k, pct]) => ({ k: DESIGN_KEY[k], pct: Number(pct) || 0 }));
  if (rows.length !== 5) return null;
  const order = ["P", "O", "D", "V", "R"];
  rows.sort((a, b) => {
    if (a.k === primary) return -1;
    if (b.k === primary) return 1;
    if (a.k === secondary) return -1;
    if (b.k === secondary) return 1;
    return b.pct - a.pct || order.indexOf(a.k) - order.indexOf(b.k);
  });
  return rows;
}

export function pickImageIndex(designKey) {
  const list = PATTERN_IMAGES[designKey] || [];
  return list.length > 1 ? Math.floor(Math.random() * list.length) : 0;
}

export function imageFor(designKey, idx) {
  const list = PATTERN_IMAGES[designKey] || [];
  if (!list.length) return null;
  return list[Math.min(Math.max(0, Number(idx) || 0), list.length - 1)];
}

// ── ProfileAttempt, through the backend function ──
async function callAttempt(payload) {
  const res = await base44.functions.invoke("saveProfileAttempt", payload);
  return res?.data ?? res;
}

export async function attemptCreate(fields) {
  try {
    const r = await callAttempt({ action: "create", fields });
    return r?.id && r?.token ? { id: r.id, token: r.token } : null;
  } catch (_e) {
    return null;
  }
}

export async function attemptUpdate(att, fields) {
  if (!att?.id || !att?.token) return false;
  try {
    await callAttempt({ action: "update", id: att.id, token: att.token, fields });
    return true;
  } catch (_e) {
    return false;
  }
}

export async function attemptLink(att) {
  if (!att?.id || !att?.token) return false;
  try {
    await callAttempt({ action: "link", id: att.id, token: att.token, fields: {} });
    return true;
  } catch (_e) {
    return false;
  }
}

// ── Tracking. Never send her name or email. ──
export function track(eventName, properties = {}) {
  try { base44.analytics.track({ eventName, properties }); } catch (_e) { /* ignore */ }
  try { if (typeof window.gtag === "function") window.gtag("event", eventName, properties); } catch (_e) { /* ignore */ }
  try { if (typeof window.fbq === "function") window.fbq("trackCustom", eventName, properties); } catch (_e) { /* ignore */ }
}

// Build the hand-off object from the quiz state.
export function buildResult({ res, answers, guess, fit, source, attempt, imgIdx, completedAt }) {
  return {
    version: QUIZ_VERSION,
    archetype_key: PLATFORM_KEY[res.primary],
    secondary_key: PLATFORM_KEY[res.secondary],
    answers: (answers || []).map((a) => PLATFORM_KEY[a]),
    guess: guessToPlatform(guess),
    fit: fit || undefined,
    mix: mixToObject(res.mix),
    source: source || "",
    attempt_id: attempt?.id || null,
    attempt_token: attempt?.token || null,
    image_variant: String(imgIdx ?? 0),
    completed_at: completedAt || new Date().toISOString(),
  };
}

// Find her MemberProfile the same way the Dashboard does (user_id first),
// creating one only when none exists.
export async function getOrCreateProfile(user) {
  if (!user?.id) return null;
  const existing = await base44.entities.MemberProfile.filter({ user_id: user.id }, "-created_date", 1);
  return existing?.[0] || (await ensureMemberProfile(user));
}

// Shared by the Dashboard, the quiz and the Your Pattern page. Saves any
// pending result to her profile and attempt, then clears the hand-off. A
// failed save leaves the hand-off in place so the next page load retries.
export async function saveQuizResultToProfile(user, { firstName } = {}) {
  const quiz = readResult();
  const profile = await getOrCreateProfile(user);
  if (!profile?.id) return profile;
  if (!quiz?.archetype_key) {
    if (firstName && !profile.first_name) {
      try { await base44.entities.MemberProfile.update(profile.id, { first_name: firstName }); } catch (_e) { /* ignore */ }
    }
    return profile;
  }
  const patch = {
    computed_archetype_key: quiz.archetype_key,
    quiz_completed_at: quiz.completed_at || new Date().toISOString(),
  };
  if (quiz.secondary_key) patch.secondary_archetype_key = quiz.secondary_key;
  if (quiz.guess) patch.quiz_guess = quiz.guess;
  if (quiz.fit) patch.quiz_fit = quiz.fit;
  if (quiz.mix) patch.quiz_mix = quiz.mix;
  if (quiz.source !== undefined) patch.quiz_source = quiz.source || "";
  if (quiz.attempt_id) patch.latest_attempt_id = quiz.attempt_id;
  if (quiz.image_variant !== undefined) patch.quiz_image_variant = String(quiz.image_variant);
  // A completed attempt brings back the first-visit greeting on Your Pattern.
  if (quiz.version === QUIZ_VERSION) patch.pattern_section_seen_at = null;
  const name = firstName || "";
  if (name && !profile.first_name) patch.first_name = name;
  await base44.entities.MemberProfile.update(profile.id, patch);
  if (quiz.attempt_id && quiz.attempt_token) {
    await attemptLink({ id: quiz.attempt_id, token: quiz.attempt_token });
  }
  clearResult();
  clearProgress();
  return { ...profile, ...patch };
}
