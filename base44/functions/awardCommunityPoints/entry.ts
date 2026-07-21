import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Server-authoritative point values per action.
const POINT_MAP = {
  post_created: 10,
};

// Upsert the user's UserPoints record and mirror the total onto the profile.
async function awardPoints(base44, user, points) {
  const existing = await base44.asServiceRole.entities.UserPoints.filter({ created_by_id: user.id });
  const today = new Date().toISOString().slice(0, 10);

  let newTotal;
  if (existing && existing.length > 0) {
    const cur = existing[0];
    newTotal = (cur.points || 0) + points;
    await base44.asServiceRole.entities.UserPoints.update(cur.id, {
      points: newTotal,
      level: Math.floor(newTotal / 100) + 1,
      lastActivityDate: today,
    });
  } else {
    newTotal = points;
    await base44.asServiceRole.entities.UserPoints.create({
      points: newTotal,
      level: Math.floor(newTotal / 100) + 1,
      lastActivityDate: today,
    });
  }

  await base44.asServiceRole.entities.User.update(user.id, {
    total_community_points: (user.total_community_points || 0) + points,
    last_active_community_date: new Date().toISOString(),
  });

  return newTotal;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const reason = body?.reason;
    const points = POINT_MAP[reason] || 0;
    if (points === 0) {
      return Response.json({ success: true, points: 0, ignored: true });
    }

    // Verify the action genuinely occurred and hasn't already been rewarded.
    // Clients cannot be trusted to self-report; we look up the real entity
    // server-side. Only a post actually created by this user within the last
    // few minutes — and not already rewarded — earns points. This prevents
    // users from farming points by calling the endpoint repeatedly.
    if (reason === 'post_created') {
      const recent = await base44.asServiceRole.entities.CommunityPost.filter(
        { created_by_id: user.id }, '-created_date', 1
      );
      const post = recent?.[0];
      if (!post) {
        return Response.json({ success: true, points: 0, ignored: true });
      }
      const ageMs = Date.now() - new Date(post.created_date || Date.now()).getTime();
      if (ageMs > 5 * 60 * 1000) {
        return Response.json({ success: true, points: 0, ignored: true });
      }
      if (post.points_awarded) {
        return Response.json({ success: true, points: 0, ignored: true });
      }

      const newTotal = await awardPoints(base44, user, points);
      // Mark the post as rewarded so subsequent calls cannot double-award.
      await base44.asServiceRole.entities.CommunityPost.update(post.id, { points_awarded: true });
      return Response.json({ success: true, points, newTotal });
    }

    return Response.json({ success: true, points: 0, ignored: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});