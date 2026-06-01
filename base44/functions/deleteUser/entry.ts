import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only admins can delete users
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { userId } = await req.json();

    if (!userId) {
      return Response.json({ error: 'userId is required' }, { status: 400 });
    }

    // Fetch the user record to obtain their email for created_by queries.
    const users = await base44.asServiceRole.entities.User.filter({ id: userId });
    const targetUser = users[0];
    const email = targetUser?.email || null;

    // Delete related records by user_id or created_by email.
    const memberProfiles = await base44.asServiceRole.entities.MemberProfile.filter({ user_id: userId });
    for (const profile of memberProfiles) {
      await base44.asServiceRole.entities.MemberProfile.delete(profile.id);
    }

    if (email) {
      const progressRecords = await base44.asServiceRole.entities.CourseProgress.filter({ created_by: email });
      for (const record of progressRecords) {
        await base44.asServiceRole.entities.CourseProgress.delete(record.id);
      }

      const workbookResponses = await base44.asServiceRole.entities.WorkbookResponse.filter({ created_by: email });
      for (const response of workbookResponses) {
        await base44.asServiceRole.entities.WorkbookResponse.delete(response.id);
      }
    }

    // Delete the user via service role.
    await base44.asServiceRole.entities.User.delete(userId);

    return Response.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});