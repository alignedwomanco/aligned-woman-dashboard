import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Server-authoritative point values per action. The client sends a reason;
// points are looked up here so a client cannot award itself arbitrary totals.
const POINT_MAP = {
  post_created: 10,
  comment_created: 5,
  post_liked: 1,
};

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

    // Upsert the user's UserPoints record (created_by_id = user.id). Uses the
    // service role because UserPoints create/update is admin- or owner-gated.
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

    // Mirror the total onto the user profile for leaderboard display.
    await base44.asServiceRole.entities.User.update(user.id, {
      total_community_points: (user.total_community_points || 0) + points,
      last_active_community_date: new Date().toISOString(),
    });

    return Response.json({ success: true, points, newTotal });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});