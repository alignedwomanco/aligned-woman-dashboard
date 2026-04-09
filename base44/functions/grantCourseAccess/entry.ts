import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Admin-only function to manually grant course access to a user by email
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || !['admin', 'owner', 'master_admin'].includes(user.role)) {
      return Response.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { email, courseId, isPaid, paymentSource, transactionId } = await req.json();

    if (!email || !courseId) {
      return Response.json({ error: "email and courseId are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();

    // Check for existing enrollment
    const existing = await base44.asServiceRole.entities.CourseEnrollment.filter({
      userEmail: normalizedEmail,
      courseId,
    });

    let enrollment;
    if (existing.length > 0) {
      enrollment = await base44.asServiceRole.entities.CourseEnrollment.update(existing[0].id, {
        isPaid: isPaid !== false,
        paymentSource: paymentSource || "manual",
        transactionId: transactionId || "",
        enrolledAt: new Date().toISOString(),
      });
    } else {
      enrollment = await base44.asServiceRole.entities.CourseEnrollment.create({
        courseId,
        userEmail: normalizedEmail,
        isPaid: isPaid !== false,
        paymentSource: paymentSource || "manual",
        transactionId: transactionId || "",
        enrolledAt: new Date().toISOString(),
        progressPercentage: 0,
      });
    }

    // Update user access tags if user exists
    const users = await base44.asServiceRole.entities.User.filter({ email: normalizedEmail });
    if (users.length > 0) {
      const currentTags = users[0].access_tags || [];
      const courseTag = `course_${courseId}_paid`;
      if (!currentTags.includes(courseTag)) {
        await base44.asServiceRole.entities.User.update(users[0].id, {
          access_tags: [...currentTags, courseTag],
        });
      }
    }

    return Response.json({
      success: true,
      enrollmentId: enrollment.id,
      userFound: users.length > 0,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});