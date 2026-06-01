import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ granted: false });
    }

    const email = (user.email || "").trim().toLowerCase();
    if (!email) {
      return Response.json({ granted: false });
    }

    const pending = await base44.asServiceRole.entities.PreApprovedMember.filter({
      email,
      status: "pending",
    });

    if (!pending || pending.length === 0) {
      return Response.json({ granted: false });
    }

    const record = pending[0];

    const membershipType = record.grant_membership_type || "paid";
    const grantTags = Array.isArray(record.grant_access_tags) ? record.grant_access_tags : [];
    const existingTags = Array.isArray(user.access_tags) ? user.access_tags : [];
    const mergedTags = [...new Set([...existingTags, ...grantTags])];

    await base44.asServiceRole.entities.User.update(user.id, {
      membership_type: membershipType,
      access_tags: mergedTags,
    });

    await base44.asServiceRole.entities.PreApprovedMember.update(record.id, {
      status: "claimed",
      claimed_user_email: email,
      claimed_at: new Date().toISOString(),
    });

    return Response.json({ granted: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});