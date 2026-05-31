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

    // Delete all related records first (MemberProfile, etc)
    const memberProfiles = await base44.asServiceRole.entities.MemberProfile.filter({ user_id: userId });
    for (const profile of memberProfiles) {
      await base44.asServiceRole.entities.MemberProfile.delete(profile.id);
    }

    // Delete the user via service role
    await base44.asServiceRole.entities.User.delete(userId);

    return Response.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});