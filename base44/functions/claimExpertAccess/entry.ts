import { createClientFromRequest } from "npm:@base44/sdk@0.8.23";

// Faculty comp access. This tag is also listed on the Blueprint course's tags,
// so granting it unlocks the course with no sale, no coupon, and no "paid"
// label on someone who never paid.
const FACULTY_ACCESS_TAG = "blueprint_faculty";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  // Authenticated call. Identify the signed-in person from their token.
  let base44;
  let user;
  try {
    base44 = createClientFromRequest(req);
    user = await base44.auth.me();
  } catch (_err) {
    return json({ success: false, reason: "not_authenticated" }, 401);
  }
  if (!user) {
    return json({ success: false, reason: "not_authenticated" }, 401);
  }

  const userEmail = (user.email || "").toLowerCase();
  if (!userEmail) {
    return json({ success: true, isExpert: false, granted: false, hasAccess: false });
  }

  // Is this account a linked expert? The match is on Expert.linked_user_email,
  // which the admin sets to the expert's login email. No match means a normal
  // member and this call does nothing for them.
  let isExpert = false;
  try {
    const experts = await base44.asServiceRole.entities.Expert.filter({
      linked_user_email: userEmail,
    });
    isExpert = Array.isArray(experts) && experts.length > 0;
  } catch (err) {
    // A transient read error must not strand faculty. Report it so the client
    // can retry on a later navigation rather than silently granting nothing.
    return json(
      { success: false, reason: "expert_lookup_failed", detail: err?.message || "" },
      500,
    );
  }

  if (!isExpert) {
    return json({ success: true, isExpert: false, granted: false, hasAccess: false });
  }

  // Grant the faculty tag if it is not already present. Idempotent: a second
  // call sees the tag and grants nothing. The Set guards against a duplicate
  // entry if two calls ever overlap.
  const currentTags = Array.isArray(user.access_tags) ? user.access_tags : [];
  if (currentTags.includes(FACULTY_ACCESS_TAG)) {
    return json({ success: true, isExpert: true, granted: false, hasAccess: true });
  }

  try {
    const nextTags = Array.from(new Set([...currentTags, FACULTY_ACCESS_TAG]));
    await base44.asServiceRole.entities.User.update(user.id, { access_tags: nextTags });
  } catch (err) {
    return json(
      { success: false, reason: "grant_failed", detail: err?.message || "" },
      500,
    );
  }

  return json({ success: true, isExpert: true, granted: true, hasAccess: true });
});