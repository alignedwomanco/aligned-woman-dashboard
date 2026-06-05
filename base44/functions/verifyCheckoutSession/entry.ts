import { createClientFromRequest } from "npm:@base44/sdk@0.8.23";

const BLUEPRINT_ACCESS_TAG = "blueprint_paid";
const STRIPE_API_BASE = "https://api.stripe.com/v1";

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

Deno.serve(async (req: Request) => {
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
  let session: Record<string, unknown> = {};
  try {
    const res = await fetch(
      STRIPE_API_BASE + "/checkout/sessions/" + encodeURIComponent(sessionId),
      { headers: { Authorization: "Bearer " + stripeKey } },
    );
    session = await res.json();
    if (!res.ok) {
      const detail =
        session && (session as any).error ? (session as any).error.message || "" : "";
      return json({ success: false, reason: "stripe_lookup_failed", detail }, 400);
    }
  } catch (err) {
    return json(
      { success: false, reason: "stripe_unreachable", detail: (err as any)?.message || "" },
      502,
    );
  }

  // Guard 1: the payment must actually be complete and paid.
  const paymentStatus = (session.payment_status as string) || "";
  const sessionStatus = (session.status as string) || "";
  const isPaid = paymentStatus === "paid" || sessionStatus === "complete";
  if (!isPaid) {
    return json({ success: false, reason: "not_paid", payment_status: paymentStatus }, 402);
  }

  const details = (session.customer_details as Record<string, unknown>) || {};
  const stripeEmail = ((details.email as string) || "").toLowerCase();
  const stripeName = (details.name as string) || "";
  const amountTotal = session.amount_total;
  const amount = typeof amountTotal === "number" ? amountTotal / 100 : 0;
  const currency = ((session.currency as string) || "zar").toUpperCase();
  const userEmail = (user.email || "").toLowerCase();

  // The affiliate code rides along as the Stripe client_reference_id, set by
  // the checkout page from the captured ?aff= value. Normalised to a trimmed
  // lowercase slug so it matches Affiliate.unique_code regardless of casing.
  const affiliateCode = ((session.client_reference_id as string) || "").trim().toLowerCase();
  let affiliateAttributed = false;
  let attributedCommission = 0;

  // Guard 2: consume the session once. If a completed Sale already exists for
  // this session it has been processed. Only the original Stripe payer email
  // may re-link it on a later visit; anyone else is routed to support.
  let alreadyProcessed = false;
  let conflict = false;
  try {
    const existing = await base44.asServiceRole.entities.Sale.filter({
      stripe_session_id: sessionId,
    });
    const completed = (existing || []).find((s: any) => s.status === "completed");
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
    const patch: Record<string, unknown> = {};
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
      { success: false, reason: "grant_failed", detail: (err as any)?.message || "" },
      500,
    );
  }

  // Record the Sale once, with affiliate attribution. A Sale write failure must
  // not block access, since the grant above is the thing that matters.
  if (!alreadyProcessed) {
    // Resolve the affiliate from the code and compute commission. Commission is
    // only credited on a real paid amount, so a 100 percent off comp (amount 0)
    // never inflates an affiliate's totals.
    let affiliateId = "";
    let commissionPercentage = 0;
    let commissionAmount = 0;
    let affiliateRecord: any = null;
    if (affiliateCode) {
      try {
        const matches = await base44.asServiceRole.entities.Affiliate.filter({
          unique_code: affiliateCode,
        });
        if (matches && matches.length > 0) {
          affiliateRecord = matches[0];
          affiliateId = affiliateRecord.id;
          commissionPercentage = Number(affiliateRecord.commission_percentage) || 0;
          commissionAmount =
            amount > 0
              ? Math.round((amount * commissionPercentage / 100) * 100) / 100
              : 0;
        }
      } catch (_err) {
        // Attribution is non-critical. Access is already granted.
      }
    }

    affiliateAttributed = !!affiliateRecord;
    attributedCommission = commissionAmount;

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
        affiliate_code: affiliateCode || "",
        affiliate_id: affiliateId || "",
        commission_percentage: commissionPercentage,
        commission_amount: commissionAmount,
      });
    } catch (_err) {
      // Intentionally swallowed. Access has already been granted.
    }

    // Roll up the affiliate's running totals, only on a real commission.
    if (affiliateRecord && commissionAmount > 0) {
      try {
        await base44.asServiceRole.entities.Affiliate.update(affiliateRecord.id, {
          total_sales: (Number(affiliateRecord.total_sales) || 0) + 1,
          total_commission: (Number(affiliateRecord.total_commission) || 0) + commissionAmount,
        });
      } catch (_err) {
        // The Sale already carries the affiliate fields, so commission is
        // recoverable from Sales even if this rollup write fails.
      }
    }
  }

  return json({
    success: true,
    granted,
    hasAccess: true,
    alreadyProcessed,
    conflict: false,
    affiliateCode: affiliateCode || "",
    affiliateAttributed,
    commissionAmount: attributedCommission,
  });
});