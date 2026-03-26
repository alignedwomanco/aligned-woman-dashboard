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
        
        const leaderboardData = allPoints
            .map((pts) => {
                const usr = allUsers.find((u) => u.email === pts.created_by);
                return {
                    points: pts.points,
                    streak: pts.streak,
                    level: pts.level,
                    email: pts.created_by,
                    full_name: usr?.full_name,
                    profile_picture: usr?.profile_picture,
                };
            })
            .slice(0, 10);

        return Response.json({ leaderboard: leaderboardData });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});