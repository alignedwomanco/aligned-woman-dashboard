import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Webhook-Secret",
      },
    });
  }

  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    
    const body = await req.json();
    const { email, full_name, courseId, transactionId, paymentSource, webhookSecret } = body;

    // Basic validation
    if (!email || !courseId) {
      return Response.json({ error: "email and courseId are required" }, { status: 400 });
    }

    // Use service role for all operations since this is a webhook (no user session)
    // Check if user already exists
    const existingUsers = await base44.asServiceRole.entities.User.filter({ email });
    let userId = null;

    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
      // Add access tag to existing user
      const currentTags = existingUsers[0].access_tags || [];
      const courseTag = `course_${courseId}_paid`;
      if (!currentTags.includes(courseTag)) {
        await base44.asServiceRole.entities.User.update(userId, {
          access_tags: [...currentTags, courseTag],
        });
      }
    }
    // If user doesn't exist yet, the enrollment record will be matched when they sign up

    // Check if enrollment already exists for this user + course
    const existingEnrollments = await base44.asServiceRole.entities.CourseEnrollment.filter({
      userEmail: email.toLowerCase(),
      courseId,
    });

    let enrollment;
    if (existingEnrollments.length > 0) {
      // Update existing enrollment to paid
      enrollment = await base44.asServiceRole.entities.CourseEnrollment.update(
        existingEnrollments[0].id,
        {
          isPaid: true,
          paymentSource: paymentSource || "webhook",
          transactionId: transactionId || "",
          enrolledAt: new Date().toISOString(),
        }
      );
    } else {
      // Create new paid enrollment
      enrollment = await base44.asServiceRole.entities.CourseEnrollment.create({
        courseId,
        userEmail: email.toLowerCase(),
        isPaid: true,
        paymentSource: paymentSource || "webhook",
        transactionId: transactionId || "",
        enrolledAt: new Date().toISOString(),
        progressPercentage: 0,
      });
    }

    // Also record the sale
    await base44.asServiceRole.entities.Sale.create({
      buyer_email: email.toLowerCase(),
      buyer_name: full_name || "",
      amount: body.amount || 0,
      currency: body.currency || "ZAR",
      region: body.region || "",
      purchase_type: body.purchase_type || "self",
      status: "completed",
      stripe_session_id: body.stripe_session_id || "",
      payfast_payment_id: body.payfast_payment_id || "",
    });

    // Send welcome email
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: "Welcome to The Aligned Woman Blueprint! 🎉",
        body: `
          <h2>You're In! Welcome to The Aligned Woman Blueprint</h2>
          <p>Hi ${full_name || "there"},</p>
          <p>Your purchase is confirmed and your course access is ready!</p>
          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Sign up or log in at your learning dashboard</li>
            <li>Head to the Classroom to start your Blueprint journey</li>
            <li>Complete the onboarding to personalize your experience</li>
          </ol>
          <p>If you already have an account, your Blueprint course is now unlocked.</p>
          <p>With love,<br/>The Aligned Woman Team</p>
        `,
      });
    } catch (emailErr) {
      console.error("Failed to send welcome email:", emailErr.message);
      // Don't fail the webhook if email fails
    }

    return Response.json({
      success: true,
      message: "Payment processed and course access granted",
      enrollmentId: enrollment.id,
      userExists: existingUsers.length > 0,
    }, {
      headers: { "Access-Control-Allow-Origin": "*" },
    });

  } catch (error) {
    console.error("Webhook error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});