import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Use service role to fetch users and points
        const allUsers = await base44.asServiceRole.entities.User.list();
        const allPoints = await base44.asServiceRole.entities.UserPoints.list("-points");
        
        // Member email addresses are deliberately not returned. The board only
        // needs a display name, an avatar and enough to mark the caller's own
        // row, so the client never receives another member's address.
        const callerEmail = (user.email || "").toLowerCase();
        const leaderboardData = allPoints
            .map((pts) => {
                const usr = allUsers.find((u) => u.email === pts.created_by);
                return {
                    id: pts.id,
                    points: pts.points,
                    streak: pts.streak,
                    level: pts.level,
                    full_name: usr?.full_name,
                    profile_picture: usr?.profile_picture,
                    is_current_user: (pts.created_by || "").toLowerCase() === callerEmail,
                };
            })
            .slice(0, 10);

        return Response.json({ leaderboard: leaderboardData });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});