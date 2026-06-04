import { createClientFromRequest } from "npm:@base44/sdk@0.8.23";

const BLUEPRINT_ACCESS_TAG = "blueprint_paid";
const STRIPE_API_BASE = "https://api.stripe.com/v1";

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

  // Resolve the Stripe Checkout Session id from a POST body or a GET query.
  let sessionId = "";
  try {
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      sessionId = (body && (body.session_id || body.sessionId)) || "";
    } else if (req.method === "GET") {
      const url = new URL(req.url);
      sessionId = url.searchParams.get("session_id") || "";
    } else {
      return json({ success: false, reason: "method_not_allowed" }, 405);
    }
  } catch (_err) {
    return json({ success: false, reason: "bad_request" }, 400);
  }

  if (!sessionId) {
    return json({ success: false, reason: "missing_session_id" }, 400);
  }

  // Identify the logged in buyer. This function is authenticated, so a real
  // user token is required. In normal use there is no 401 here because the
  // success page only calls this once the buyer is signed in.
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

  // The Stripe secret key lives in app secrets, never in code.
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    return json({ success: false, reason: "stripe_key_missing" }, 500);
  }

  // Retrieve the session from Stripe to confirm the payment is genuine.
  let session = {};
  try {
    const res = await fetch(
      STRIPE_API_BASE + "/checkout/sessions/" + encodeURIComponent(sessionId),
      { headers: { Authorization: "Bearer " + stripeKey } },
    );
    session = await res.json();
    if (!res.ok) {
      const detail =
        session && session.error ? session.error.message || "" : "";
      return json({ success: false, reason: "stripe_lookup_failed", detail }, 400);
    }
  } catch (err) {
    return json(
      { success: false, reason: "stripe_unreachable", detail: err?.message || "" },
      502,
    );
  }

  // Guard 1: the payment must actually be complete and paid.
  const paymentStatus = session.payment_status || "";
  const sessionStatus = session.status || "";
  const isPaid = paymentStatus === "paid" || sessionStatus === "complete";
  if (!isPaid) {
    return json({ success: false, reason: "not_paid", payment_status: paymentStatus }, 402);
  }

  const details = session.customer_details || {};
  const stripeEmail = ((details.email) || "").toLowerCase();
  const stripeName = details.name || "";
  const amountTotal = session.amount_total;
  const amount = typeof amountTotal === "number" ? amountTotal / 100 : 0;
  const currency = ((session.currency) || "zar").toUpperCase();
  const userEmail = (user.email || "").toLowerCase();

  // Guard 2: consume the session once. If a completed Sale already exists for
  // this session it has been processed. Only the original Stripe payer email
  // may re-link it on a later visit; anyone else is routed to support.
  let alreadyProcessed = false;
  let conflict = false;
  try {
    const existing = await base44.asServiceRole.entities.Sale.filter({
      stripe_session_id: sessionId,
    });
    const completed = (existing || []).find((s) => s.status === "completed");
    if (completed) {
      alreadyProcessed = true;
      const payer = (completed.buyer_email || "").toLowerCase();
      const userHasTag =
        Array.isArray(user.access_tags) && user.access_tags.includes(BLUEPRINT_ACCESS_TAG);
      if (!userHasTag && payer && payer !== userEmail) {
        conflict = true;
      }
    }
  } catch (_err) {
    // If the lookup fails we fall through. The grant below is idempotent on
    // the access tag, so a buyer is never blocked by a transient read error.
  }

  if (conflict) {
    return json({
      success: true,
      granted: false,
      hasAccess: false,
      alreadyProcessed: true,
      conflict: true,
    });
  }

  // Grant access to the logged in user. Provider agnostic by design: access is
  // attached to whoever is signed in, not by matching the payment email. This
  // is what makes Google, Apple relay addresses, and the rest all work.
  let granted = false;
  try {
    const currentTags = Array.isArray(user.access_tags) ? user.access_tags : [];
    const patch = {};
    if (!currentTags.includes(BLUEPRINT_ACCESS_TAG)) {
      patch.access_tags = [...currentTags, BLUEPRINT_ACCESS_TAG];
      granted = true;
    }
    if (user.membership_type !== "paid") {
      patch.membership_type = "paid";
    }
    if (Object.keys(patch).length > 0) {
      await base44.asServiceRole.entities.User.update(user.id, patch);
    }
  } catch (err) {
    return json(
      { success: false, reason: "grant_failed", detail: err?.message || "" },
      500,
    );
  }

  // Record the Sale once. A Sale write failure must not block access, since the
  // grant above is the thing that matters. Anything missed is reconciled later.
  if (!alreadyProcessed) {
    try {
      await base44.asServiceRole.entities.Sale.create({
        buyer_email: stripeEmail || userEmail,
        buyer_name: stripeName,
        amount,
        currency,
        purchase_type: "self",
        stripe_session_id: sessionId,
        status: "completed",
        marketing_opt_in: false,
      });
    } catch (_err) {
      // Intentionally swallowed. Access has already been granted.
    }
  }

  return json({
    success: true,
    granted,
    hasAccess: true,
    alreadyProcessed,
    conflict: false,
  });
});