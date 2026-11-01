import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const AUDIT_ACCESS_TAG = 'alignment_audit_paid';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ granted: false });
    }

    const email = user.email.trim().toLowerCase();

    const matches = await base44.asServiceRole.entities.PreApprovedMember.filter({
      email,
      status: 'pending',
    });

    if (!matches || matches.length === 0) {
      return Response.json({ granted: false });
    }

    const record = matches[0];

    const grantType = record.grant_membership_type || 'paid';
    const grantTags = Array.isArray(record.grant_access_tags) ? record.grant_access_tags : ['blueprint_paid'];

    const existingTags = Array.isArray(user.access_tags) ? user.access_tags : [];
    const mergedTags = Array.from(new Set([...existingTags, ...grantTags]));

    // membership_type only ever moves up. A "free" grant (for example an
    // Alignment Audit) never downgrades a member who is already "paid".
    const nextMembershipType =
      user.membership_type === 'paid' || grantType === 'paid'
        ? 'paid'
        : (user.membership_type || grantType);

    await base44.asServiceRole.entities.User.update(user.id, {
      membership_type: nextMembershipType,
      access_tags: mergedTags,
    });

    await base44.asServiceRole.entities.PreApprovedMember.update(record.id, {
      status: 'claimed',
      claimed_user_email: email,
      claimed_at: new Date().toISOString(),
    });

    // Link any audit bought before she had an account to her new user id.
    if (grantTags.includes(AUDIT_ACCESS_TAG)) {
      try {
        const audits = await base44.asServiceRole.entities.AuditResponse.filter({ email });
        for (const audit of audits || []) {
          if (!audit.user_id) {
            await base44.asServiceRole.entities.AuditResponse.update(audit.id, { user_id: user.id });
          }
        }
      } catch (_err) {
        // Best effort. The audit is still readable by her email.
      }
    }

    // Enroll user in any courses whose tags match the granted access tags
    const allCourses = await base44.asServiceRole.entities.Course.list();
    const now = new Date().toISOString();

    for (const tag of grantTags) {
      const matchingCourses = allCourses.filter(
        (c) => Array.isArray(c.tags) && c.tags.includes(tag)
      );

      for (const course of matchingCourses) {
        const existing = await base44.asServiceRole.entities.CourseEnrollment.filter({
          userEmail: email,
          courseId: course.id,
        });

        if (!existing || existing.length === 0) {
          await base44.asServiceRole.entities.CourseEnrollment.create({
            userEmail: email,
            courseId: course.id,
            isPaid: true,
            paymentSource: "preapproval",
            enrolledAt: now,
          });
        }
      }
    }

    return Response.json({ granted: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
