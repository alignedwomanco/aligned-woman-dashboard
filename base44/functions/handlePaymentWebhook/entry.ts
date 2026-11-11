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

// Alignment Audit. Its Stripe payment links carry metadata
// product=alignment_audit, which Stripe copies onto the checkout session.
// A session with no product metadata is a Blueprint purchase, exactly as
// before. The audit never sets membership_type to "paid", because
// hasBlueprintAccess treats "paid" as Blueprint access.
const AUDIT_PRODUCT = "alignment_audit";
const AUDIT_ACCESS_TAG = "alignment_audit_paid";

// Where a new buyer signs in. The welcome email points here, and it is the
// authed entry that runs the pre-approval claim on first load.
const LOGIN_URL = "https://app.alignedwomanco.com/Dashboard";

// Who hears about every audit purchase.
const OWNER_EMAIL = "hello@laurajanethomas.biz";

const CORS = { "Access-Control-Allow-Origin": "*" };

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

async function logEmail(base44, entry) {
  try {
    await base44.asServiceRole.entities.EmailLog.create({
      sent_at: new Date().toISOString(),
      ...entry,
    });
  } catch (_err) {
    // Logging is best effort. Never block the webhook on it.
  }
}

async function sendLoggedEmail(base44, { to, toName, subject, body, type }) {
  let status = "sent";
  let errorMessage = "";
  try {
    await base44.asServiceRole.integrations.Core.SendEmail({ to, subject, body });
  } catch (err) {
    status = "failed";
    errorMessage = err?.message || "send_failed";
    console.error("Email send failed:", errorMessage);
  }
  await logEmail(base44, {
    to_email: to,
    to_name: toName || "",
    subject,
    type,
    status,
    error_message: errorMessage,
  });
}

// Merge tags into a pending pre-approval without dropping earlier grants, so a
// woman who buys two products before her first sign-in keeps both. membership
// only ever moves up: a "free" audit grant never downgrades a "paid" one.
async function upsertPendingPreApproval(base44, { email, tag, membershipType, note }) {
  const pending = await base44.asServiceRole.entities.PreApprovedMember.filter({
    email,
    status: "pending",
  });
  if (!pending || pending.length === 0) {
    await base44.asServiceRole.entities.PreApprovedMember.create({
      email,
      grant_membership_type: membershipType,
      grant_access_tags: [tag],
      status: "pending",
      note,
    });
    return { created: true };
  }
  const record = pending[0];
  const currentTags = Array.isArray(record.grant_access_tags) ? record.grant_access_tags : [];
  const mergedTags = Array.from(new Set([...currentTags, tag]));
  const nextType = record.grant_membership_type === "paid" || membershipType === "paid" ? "paid" : "free";
  await base44.asServiceRole.entities.PreApprovedMember.update(record.id, {
    grant_membership_type: nextType,
    grant_access_tags: mergedTags,
  });
  return { created: false };
}

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
    const rawBody = await req.text();

    // ----------------------------------------------------------------
    // STRIPE SIGNATURE VERIFICATION (mandatory)
    // This endpoint grants paid access, so every request must be verified as
    // a genuine Stripe webhook using the signing secret. Unsigned or
    // manually constructed payloads are rejected.
    // ----------------------------------------------------------------
    const stripeKey = Deno.env.get("stripe");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!stripeKey || !webhookSecret) {
      return Response.json({ error: "Webhook is not configured" }, {
        status: 500,
        headers: CORS,
      });
    }

    const stripe = new Stripe(stripeKey);
    const signature = req.headers.get("stripe-signature");

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        rawBody,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error("Stripe signature verification failed:", err.message);
      return Response.json({ error: "Invalid signature" }, {
        status: 400,
        headers: CORS,
      });
    }

    // Only handle checkout.session.completed
    if (event.type !== "checkout.session.completed") {
      return Response.json({
        success: true,
        message: `Event type ${event.type} acknowledged but not processed`,
      }, {
        headers: CORS,
      });
    }

    const session = event.data.object;

    let email = session.customer_details?.email || session.customer_email || "";
    // When a payment link collects a business name, Stripe puts the business
    // name in customer_details.name and the person's own name in
    // individual_name. Prefer the person, and trim the stray spaces buyers type.
    const fullName = String(
      session.customer_details?.individual_name || session.customer_details?.name || ""
    ).trim();
    const firstName = fullName.split(/\s+/)[0] || "there";
    const stripeSessionId = session.id || "";
    const transactionId = session.payment_intent || session.id || "";
    const affiliateCode = session.client_reference_id || "";
    const currency = (session.currency || "zar").toUpperCase();
    const paymentSource = "stripe";
    const purchaseType = "self";
    const courseId = BLUEPRINT_COURSE_ID;

    // amount_total is in cents (e.g. 399700 = R3,997.00)
    const amount = session.amount_total ? session.amount_total / 100 : 0;

    // Which product was bought. No value means the Blueprint, as before.
    const product = String(session.metadata?.product || "").trim().toLowerCase();
    const isAudit = product === AUDIT_PRODUCT;

    // Basic validation
    if (!email) {
      return Response.json({ error: "Email is required" }, {
        status: 400,
        headers: CORS,
      });
    }

    email = email.toLowerCase().trim();

    // ----------------------------------------------------------------
    // 0. IDEMPOTENCY
    // Stripe delivers events at least once and redelivers whenever an earlier
    // response is missed, so a repeat checkout.session.completed for the same
    // session must not create a second Sale or credit the affiliate twice.
    // ----------------------------------------------------------------

    if (stripeSessionId) {
      const existingSales = await base44.asServiceRole.entities.Sale.filter({
        stripe_session_id: stripeSessionId,
      });
      if (existingSales.length > 0) {
        return Response.json({
          success: true,
          duplicate: true,
          message: "This session has already been processed",
        }, {
          headers: CORS,
        });
      }
    }

    const existingUsers = await base44.asServiceRole.entities.User.filter({ email });
    const userExists = existingUsers.length > 0;

    // ================================================================
    // ALIGNMENT AUDIT BRANCH
    // Grants alignment_audit_paid only. Never touches membership_type,
    // Blueprint enrolment or the Blueprint welcome email.
    // ================================================================

    if (isAudit) {
      let userId = "";
      let preApprovalCreated = false;

      // 1. Grant the audit tag
      if (userExists) {
        userId = existingUsers[0].id;
        const currentTags = Array.isArray(existingUsers[0].access_tags) ? existingUsers[0].access_tags : [];
        if (!currentTags.includes(AUDIT_ACCESS_TAG)) {
          await base44.asServiceRole.entities.User.update(userId, {
            access_tags: [...currentTags, AUDIT_ACCESS_TAG],
          });
        }
      } else {
        const result = await upsertPendingPreApproval(base44, {
          email,
          tag: AUDIT_ACCESS_TAG,
          membershipType: "free",
          note: "Stripe purchase: Alignment Audit",
        });
        preApprovalCreated = result.created;
      }

      // 2. Record the Sale. The affiliate code is kept for reference, but no
      // commission is credited on the audit until that is decided.
      const sale = await base44.asServiceRole.entities.Sale.create({
        buyer_email: email,
        buyer_name: fullName,
        amount,
        currency,
        purchase_type: purchaseType,
        status: "completed",
        stripe_session_id: stripeSessionId,
        affiliate_code: affiliateCode || "",
        affiliate_id: "",
        commission_percentage: 0,
        commission_amount: 0,
        description: "Alignment Audit",
      });

      // 3. Create the audit record
      const now = new Date().toISOString();
      await base44.asServiceRole.entities.AuditResponse.create({
        user_id: userId,
        email,
        status: "purchased",
        answers: {},
        progress_percent: 0,
        purchased_at: now,
        sale_id: sale?.id || "",
        stripe_session_id: stripeSessionId,
        currency,
        amount,
      });

      // 4. Emails (best effort). Placeholder copy until Laura supplies final.
      // Layout and colours match the Blueprint welcome in verifyCheckoutSession.
      const safeFirst = esc(firstName);
      const safeEmail = esc(email);

      await sendLoggedEmail(base44, {
        to: email,
        toName: fullName,
        subject: "Let’s start your Alignment Audit",
        type: "welcome",
        body:
          '<div style="margin:0;padding:0;background-color:#F7F2EE;">' +
            '<div style="max-width:560px;margin:0 auto;padding:40px 24px;font-family:\'Montserrat\',Helvetica,Arial,sans-serif;color:#3A2B30;">' +
              '<div style="background-color:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(74,14,46,0.08);">' +
                '<div style="height:6px;background:linear-gradient(90deg,#4A0E2E,#C4847A);"></div>' +
                '<div style="padding:40px 36px;">' +
                  '<p style="margin:0 0 24px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#C4847A;font-weight:600;">One-to-one with Laura</p>' +
                  '<h1 style="margin:0 0 20px;font-family:\'DM Serif Display\',Georgia,serif;font-size:30px;line-height:1.2;color:#4A0E2E;font-weight:400;">Let’s start your Alignment Audit</h1>' +
                  '<p style="margin:0 0 16px;font-size:16px;line-height:1.7;">Hi ' + safeFirst + ',</p>' +
                  '<p style="margin:0 0 16px;font-size:16px;line-height:1.7;">Your payment is confirmed and your audit is open.</p>' +
                  '<p style="margin:0 0 16px;font-size:16px;line-height:1.7;">Sign in at app.alignedwomanco.com with ' + safeEmail + ', the email you paid with. The questions are waiting on your dashboard.</p>' +
                  '<p style="margin:0 0 16px;font-size:16px;line-height:1.7;">Give yourself about 90 minutes somewhere you won’t be interrupted. Your answers save as you go, so you can stop and pick it up later.</p>' +
                  '<p style="margin:0 0 16px;font-size:16px;line-height:1.7;">Once you submit, I’ll write your personalised blueprint and send it within seven working days. Then we book your one-hour call to go through it. After the call, I’ll send your AI script: custom instructions for your ChatGPT or Claude, so your AI is on board with who you are and what you want.</p>' +
                  '<p style="margin:0 0 28px;font-size:16px;line-height:1.7;">I’m excited to help you on your journey!</p>' +
                  '<a href="' + LOGIN_URL + '" style="display:inline-block;background-color:#4A0E2E;color:#FFFFFF;text-decoration:none;font-size:14px;letter-spacing:0.08em;text-transform:uppercase;font-weight:600;padding:16px 30px;border-radius:999px;">Start your audit</a>' +
                  '<p style="margin:32px 0 0;font-size:14px;line-height:1.7;color:#6B5B61;">With love,<br/>Laura</p>' +
                '</div>' +
              '</div>' +
              '<p style="margin:20px 0 0;text-align:center;font-size:12px;line-height:1.6;color:#9A8B90;">You are receiving this because you purchased the Alignment Audit.</p>' +
            '</div>' +
          '</div>',
      });

      const accountLine = userExists
        ? "Yes. The audit is unlocked on her account."
        : (preApprovalCreated
          ? "No. A pending pre-approval was created. If she signs up with a different email, move the grant by hand."
          : "No. Added to her existing pending pre-approval.");

      await sendLoggedEmail(base44, {
        to: OWNER_EMAIL,
        toName: "Laura",
        subject: `New Alignment Audit bought: ${fullName || email}`,
        type: "one_time",
        body: `
          <h2>New Alignment Audit bought</h2>
          <p><strong>Name:</strong> ${esc(fullName || "Not given")}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Paid:</strong> ${esc(currency)} ${esc(amount)}</p>
          <p><strong>Account exists:</strong> ${esc(accountLine)}</p>
        `,
      });

      return Response.json({
        success: true,
        product: AUDIT_PRODUCT,
        message: "Payment processed and audit access granted",
        userExists,
        preApprovalCreated,
      }, {
        headers: CORS,
      });
    }

    // ================================================================
    // BLUEPRINT BRANCH (unchanged behaviour, except pending pre-approvals
    // now merge tags instead of replacing them)
    // ================================================================

    // ----------------------------------------------------------------
    // 1. GRANT COURSE ACCESS
    // ----------------------------------------------------------------

    let userId = null;

    if (userExists) {
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
      // Brand-new buyer with no account yet. Create or merge a pending
      // pre-approval keyed to the email Stripe captured, so their first
      // sign-in is claimed automatically and they land straight in the course.
      await upsertPendingPreApproval(base44, {
        email,
        tag: BLUEPRINT_ACCESS_TAG,
        membershipType: "paid",
        note: "Stripe purchase",
      });
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
    }

    // ----------------------------------------------------------------
    // 6. SEND WELCOME EMAIL (best effort)
    // ----------------------------------------------------------------

    try {
      const safeName = esc(firstName);
      const safeEmail = esc(email);
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: "You're in. Welcome to The Aligned Woman Blueprint.",
        body: `
          <h2>You're in. Welcome to The Aligned Woman Blueprint.</h2>
          <p>Hi ${safeName},</p>
          <p>Your payment is confirmed and your Blueprint access is ready.</p>
          <p><strong>How to get in:</strong></p>
          <ol>
            <li>Go to <a href="${LOGIN_URL}">${LOGIN_URL}</a></li>
            <li>Sign in using this email address, ${safeEmail}, the same one you paid with</li>
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
      userExists,
      affiliateAttributed: !!affiliateRecord,
      commissionAmount,
    }, {
      headers: CORS,
    });

  } catch (error) {
    console.error("Webhook error:", error.message);
    return Response.json({ error: error.message }, {
      status: 500,
      headers: CORS,
    });
  }
});
