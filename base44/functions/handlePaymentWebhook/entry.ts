import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// The Blueprint course ID (hardcoded for now; for multi-product support,
// read course_id from Stripe metadata on the checkout session)
const BLUEPRINT_COURSE_ID = "69f4885c4fadbeea6d28a9be";
const BLUEPRINT_ACCESS_TAG = `course_${BLUEPRINT_COURSE_ID}_paid`;

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
    const body = await req.json();

    // ----------------------------------------------------------------
    // DETECT FORMAT: Stripe event vs custom/manual call
    // ----------------------------------------------------------------

    let email = "";
    let fullName = "";
    let courseId = BLUEPRINT_COURSE_ID;
    let transactionId = "";
    let paymentSource = "webhook";
    let amount = 0;
    let currency = "ZAR";
    let affiliateCode = "";
    let stripeSessionId = "";
    let purchaseType = "self";
    let isStripeEvent = false;

    if (body.type && body.data && body.data.object) {
      // ---------------------------------------------------------------
      // STRIPE WEBHOOK EVENT
      // ---------------------------------------------------------------
      isStripeEvent = true;

      // Only handle checkout.session.completed for now
      if (body.type !== "checkout.session.completed") {
        return Response.json({
          success: true,
          message: `Event type ${body.type} acknowledged but not processed`,
        }, {
          headers: { "Access-Control-Allow-Origin": "*" },
        });
      }

      const session = body.data.object;

      // TODO: Add Stripe signature verification before go-live
      // const signature = req.headers.get("stripe-signature");
      // Verify using webhook signing secret (whsec_xxx)

      email = session.customer_details?.email || session.customer_email || "";
      fullName = session.customer_details?.name || "";
      stripeSessionId = session.id || "";
      transactionId = session.payment_intent || session.id || "";
      paymentSource = "stripe";
      affiliateCode = session.client_reference_id || "";
      currency = (session.currency || "zar").toUpperCase();

      // amount_total is in cents (e.g. 399700 = R3,997.00)
      amount = session.amount_total ? session.amount_total / 100 : 0;

      // For multi-product support in future: read course_id from metadata
      // courseId = session.metadata?.course_id || BLUEPRINT_COURSE_ID;

    } else {
      // ---------------------------------------------------------------
      // CUSTOM / MANUAL CALL (existing format, backward compatible)
      // ---------------------------------------------------------------
      email = body.email || "";
      fullName = body.full_name || "";
      courseId = body.courseId || BLUEPRINT_COURSE_ID;
      transactionId = body.transactionId || "";
      paymentSource = body.paymentSource || "webhook";
      amount = body.amount || 0;
      currency = body.currency || "ZAR";
      affiliateCode = body.affiliate_code || "";
      stripeSessionId = body.stripe_session_id || "";
      purchaseType = body.purchase_type || "self";
    }

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

    // Check if user already exists
    const existingUsers = await base44.asServiceRole.entities.User.filter({ email });
    let userId = null;

    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
      // Add access tag to existing user
      const currentTags = existingUsers[0].access_tags || [];
      if (!currentTags.includes(BLUEPRINT_ACCESS_TAG)) {
        await base44.asServiceRole.entities.User.update(userId, {
          access_tags: [...currentTags, BLUEPRINT_ACCESS_TAG],
        });
      }
    }
    // If user doesn't exist yet, the enrollment record will be matched when they sign up

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
    // 6. SEND WELCOME EMAIL
    // ----------------------------------------------------------------

    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: "Welcome to The Aligned Woman Blueprint! \u{1F389}",
        body: `
          <h2>You're In! Welcome to The Aligned Woman Blueprint</h2>
          <p>Hi ${fullName || "there"},</p>
          <p>Your purchase is confirmed and your course access is ready!</p>
          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Sign up or log in at your learning dashboard</li>
            <li>Head to the Classroom to start your Blueprint journey</li>
            <li>Complete the onboarding to personalise your experience</li>
          </ol>
          <p>If you already have an account, your Blueprint course is now unlocked.</p>
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