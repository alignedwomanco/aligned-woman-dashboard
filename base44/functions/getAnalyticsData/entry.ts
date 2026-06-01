import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only admins can access analytics data
    if (!user || !["admin", "master_admin"].includes(user.role)) {
      return Response.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // Get the authorized Google Analytics connector
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("google_analytics");

    // Fetch analytics data from Google Analytics API
    const days = 30; // Default to last 30 days
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    // Get property ID from connector config or use default
    // User needs to configure their GA4 Property ID
    const propertyId = "properties/XXXXXXXXX"; // Replace with actual GA4 property ID

    const response = await fetch(
      `https://analyticsdata.googleapis.com/v1/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: "date" }],
          metrics: [
            { name: "activeUsers" },
            { name: "sessions" },
            { name: "screenPageViews" },
          ],
          orderBys: [{ dimension: { dimensionName: "date" }, desc: true }],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to fetch analytics data");
    }

    const data = await response.json();

    return Response.json({
      success: true,
      data,
      period: { startDate, endDate, days },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});