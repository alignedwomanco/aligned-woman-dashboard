import { createClientFromRequest } from "npm:@base44/sdk@0.8.23";

// Faculty are granted the same blueprint_paid entitlement that buyers receive,
// so they unlock the course through the access checks the app already
// recognizes, with no gate changes anywhere. Faculty stay distinguishable from
// buyers in the data because they have no Sale record and remain membership_type
// "free"; only buyers ever get a Sale and a paid membership.
const BLUEPRINT_ACCESS_TAG = "blueprint_paid";

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

  // Grant the blueprint access tag if it is not already present. Idempotent: a
  // second call sees the tag and grants nothing. The Set guards against a
  // duplicate entry if two calls ever overlap.
  const currentTags = Array.isArray(user.access_tags) ? user.access_tags : [];
  if (currentTags.includes(BLUEPRINT_ACCESS_TAG)) {
    return json({ success: true, isExpert: true, granted: false, hasAccess: true });
  }

  try {
    const nextTags = Array.from(new Set([...currentTags, BLUEPRINT_ACCESS_TAG]));
    await base44.asServiceRole.entities.User.update(user.id, { access_tags: nextTags });
  } catch (err) {
    return json(
      { success: false, reason: "grant_failed", detail: err?.message || "" },
      500,
    );
  }

  return json({ success: true, isExpert: true, granted: true, hasAccess: true });
});