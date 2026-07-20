import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@17.7.0';

// The Blueprint course ID (hardcoded for now; for multi-product support,
// read course_id from Stripe metadata on the checkout session)
const BLUEPRINT_COURSE_ID = "69f4885c4fadbeea6d28a9be";

// The access tag the rest of the app actually checks. The dashboard gate, the
// members list, and the pre-approval claim all read "blueprint_paid". The old
// value here ("course_<id>_paid") was read by nothing, so access granted on
// purchase was invisible to the app. Keep this in sync with the AccessTag
// entity and the manual pre-approval grants.
const BLUEPRINT_ACCESS_TAG = "blueprint_paid";

// Where a new buyer signs in. The welcome email points here, and it is the
// authed entry that runs the pre-approval claim on first load.
const LOGIN_URL = "https://app.alignedwomanco.com/Dashboard";

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Webhook-Secret, Stripe-Signature",
      },
    });
  }

  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);

    // ----------------------------------------------------------------
    // STRIPE SIGNATURE VERIFICATION
    // This endpoint is invoked by Stripe. Verify every request was genuinely
    // sent by Stripe using the webhook signing secret, and reject anything
    // else. Unauthenticated manual payloads are no longer accepted.
    // ----------------------------------------------------------------
    const stripeKey = Deno.env.get("stripe");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!stripeKey || !webhookSecret) {
      return Response.json({ error: "Webhook is not configured" }, {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    const stripe = new Stripe(stripeKey);
    const signature = req.headers.get("stripe-signature");
    const rawBody = await req.text();

    let event;
    try {
      event = await stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error("Stripe signature verification failed:", err.message);
      return Response.json({ error: "Invalid signature" }, {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    // Only handle checkout.session.completed
    if (event.type !== "checkout.session.completed") {
      return Response.json({
        success: true,
        message: `Event type ${event.type} acknowledged but not processed`,
      }, {
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    const session = event.data.object;

    let email = "";
    let fullName = "";
    const courseId = BLUEPRINT_COURSE_ID;
    let transactionId = "";
    const paymentSource = "stripe";
    let amount = 0;
    let currency = "ZAR";
    let affiliateCode = "";
    let stripeSessionId = "";
    const purchaseType = "self";

    email = session.customer_details?.email || session.customer_email || "";
    fullName = session.customer_details?.name || "";
    stripeSessionId = session.id || "";
    transactionId = session.payment_intent || session.id || "";
    affiliateCode = session.client_reference_id || "";
    currency = (session.currency || "zar").toUpperCase();

    // amount_total is in cents (e.g. 399700 = R3,997.00)
    amount = session.amount_total ? session.amount_total / 100 : 0;

    // For multi-product support in future: read course_id from metadata
    // courseId = session.metadata?.course_id || BLUEPRINT_COURSE_ID;

    // Basic validation
    if (!email) {
      return Response.json({ error: "Email is required" }, {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    email = email.toLowerCase().trim();

    // ----------------------------------------------------------------
    // 1. GRANT COURSE ACCESS
    // ----------------------------------------------------------------

    const existingUsers = await base44.asServiceRole.entities.User.filter({ email });
    let userId = null;

    if (existingUsers.length > 0) {
      // Existing account: grant access directly so it is live immediately.
      userId = existingUsers[0].id;
      const currentTags = existingUsers[0].access_tags || [];
      const nextTags = currentTags.includes(BLUEPRINT_ACCESS_TAG)
        ? currentTags
        : [...currentTags, BLUEPRINT_ACCESS_TAG];
      await base44.asServiceRole.entities.User.update(userId, {
        membership_type: "paid",
        access_tags: nextTags,
      });
    } else {
      // Brand-new buyer with no account yet. Create a pending pre-approval keyed
      // to the email Stripe captured, so their first sign-in is claimed
      // automatically and they land straight in the course. This is the same
      // claim path used for manual pre-approvals. Reuse an existing pending
      // grant for this email rather than stacking a duplicate.
      const pending = await base44.asServiceRole.entities.PreApprovedMember.filter({
        email,
        status: "pending",
      });
      if (!pending || pending.length === 0) {
        await base44.asServiceRole.entities.PreApprovedMember.create({
          email,
          grant_membership_type: "paid",
          grant_access_tags: [BLUEPRINT_ACCESS_TAG],
          status: "pending",
          note: "Stripe purchase",
        });
      } else {
        await base44.asServiceRole.entities.PreApprovedMember.update(pending[0].id, {
          grant_membership_type: "paid",
          grant_access_tags: [BLUEPRINT_ACCESS_TAG],
        });
      }
    }

    // ----------------------------------------------------------------
    // 2. CREATE / UPDATE ENROLLMENT
    // ----------------------------------------------------------------

    const existingEnrollments = await base44.asServiceRole.entities.CourseEnrollment.filter({
      userEmail: email,
      courseId,
    });

    let enrollment;
    if (existingEnrollments.length > 0) {
      enrollment = await base44.asServiceRole.entities.CourseEnrollment.update(
        existingEnrollments[0].id,
        {
          isPaid: true,
          paymentSource,
          transactionId,
          enrolledAt: new Date().toISOString(),
        }
      );
    } else {
      enrollment = await base44.asServiceRole.entities.CourseEnrollment.create({
        courseId,
        userEmail: email,
        isPaid: true,
        paymentSource,
        transactionId,
        enrolledAt: new Date().toISOString(),
        progressPercentage: 0,
      });
    }

    // ----------------------------------------------------------------
    // 3. AFFILIATE LOOKUP AND COMMISSION CALCULATION
    // ----------------------------------------------------------------

    let affiliateId = "";
    let commissionPercentage = 0;
    let commissionAmount = 0;
    let affiliateRecord = null;

    if (affiliateCode) {
      try {
        const affiliates = await base44.asServiceRole.entities.Affiliate.filter({
          unique_code: affiliateCode,
        });

        if (affiliates.length > 0) {
          affiliateRecord = affiliates[0];
          affiliateId = affiliateRecord.id;
          commissionPercentage = affiliateRecord.commission_percentage || 0;
          commissionAmount = amount > 0 ? Math.round((amount * commissionPercentage / 100) * 100) / 100 : 0;
        } else {
          console.warn(`Affiliate code "${affiliateCode}" not found in database`);
        }
      } catch (affErr) {
        console.error("Affiliate lookup failed:", affErr.message);
        // Continue without affiliate attribution
      }
    }

    // ----------------------------------------------------------------
    // 4. CREATE SALE RECORD
    // ----------------------------------------------------------------

    await base44.asServiceRole.entities.Sale.create({
      buyer_email: email,
      buyer_name: fullName,
      amount,
      currency,
      purchase_type: purchaseType,
      status: "completed",
      stripe_session_id: stripeSessionId,
      affiliate_code: affiliateCode || "",
      affiliate_id: affiliateId || "",
      commission_percentage: commissionPercentage,
      commission_amount: commissionAmount,
    });

    // ----------------------------------------------------------------
    // 5. UPDATE AFFILIATE TOTALS
    // ----------------------------------------------------------------

    if (affiliateRecord && commissionAmount > 0) {
      try {
        await base44.asServiceRole.entities.Affiliate.update(affiliateRecord.id, {
          total_sales: (affiliateRecord.total_sales || 0) + 1,
          total_commission: (affiliateRecord.total_commission || 0) + commissionAmount,
        });
      } catch (affUpdateErr) {
        console.error("Affiliate totals update failed:", affUpdateErr.message);
        // Sale is still recorded with affiliate fields, so commission is not lost
      }

      // TODO: When Stripe Connect is active, create a Transfer here:
      // const stripe = new Stripe(STRIPE_SECRET_KEY);
      // await stripe.transfers.create({
      //   amount: Math.round(commissionAmount * 100), // in cents
      //   currency: currency.toLowerCase(),
      //   destination: affiliateRecord.stripe_account_id,
      //   description: `Commission for sale ${stripeSessionId}`,
      // });
    }

    // ----------------------------------------------------------------
    // 6. SEND WELCOME EMAIL (best effort)
    // ----------------------------------------------------------------

    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: "You're in. Welcome to The Aligned Woman Blueprint.",
        body: `
          <h2>You're in. Welcome to The Aligned Woman Blueprint.</h2>
          <p>Hi ${fullName || "there"},</p>
          <p>Your payment is confirmed and your Blueprint access is ready.</p>
          <p><strong>How to get in:</strong></p>
          <ol>
            <li>Go to <a href="${LOGIN_URL}">${LOGIN_URL}</a></li>
            <li>Sign in using this email address, ${email}, the same one you paid with</li>
            <li>You land straight in your dashboard with the Blueprint unlocked</li>
          </ol>
          <p>Please use the same email you paid with. That is the address your access is linked to.</p>
          <p>With love,<br/>The Aligned Woman Team</p>
        `,
      });
    } catch (emailErr) {
      console.error("Failed to send welcome email:", emailErr.message);
      // Don't fail the webhook if email fails
    }

    // ----------------------------------------------------------------
    // RESPONSE
    // ----------------------------------------------------------------

    return Response.json({
      success: true,
      message: "Payment processed and course access granted",
      enrollmentId: enrollment.id,
      userExists: existingUsers.length > 0,
      affiliateAttributed: !!affiliateRecord,
      commissionAmount,
    }, {
      headers: { "Access-Control-Allow-Origin": "*" },
    });

  } catch (error) {
    console.error("Webhook error:", error.message);
    return Response.json({ error: error.message }, {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
});