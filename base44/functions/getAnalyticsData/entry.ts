import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only admins can access analytics data
    if (!user || !['admin', 'master_admin', 'owner'].includes(user.role)) {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get connection to Google Analytics
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('google_analytics');

    const propertyId = Deno.env.get('GA_PROPERTY_ID');
    if (!propertyId) {
      return Response.json({ error: 'GA_PROPERTY_ID not configured' }, { status: 500 });
    }

    // Parse query params
    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get('days') || '30');
    const metrics = url.searchParams.get('metrics') || 'activeUsers,sessions,pageViews';
    const dimensions = url.searchParams.get('dimensions') || 'date';

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const formatDate = (d) => d.toISOString().split('T')[0];

    // Build Analytics Data API request
    const analyticsUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;
    
    const response = await fetch(analyticsUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [
          {
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
          },
        ],
        metrics: metrics.split(',').map((m) => ({ name: m.trim() })),
        dimensions: dimensions.split(',').map((d) => ({ name: d.trim() })),
        orderBys: [
          {
            dimension: { dimensionName: 'date' },
            desc: true,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to fetch analytics data');
    }

    const data = await response.json();

    return Response.json({
      success: true,
      data: {
        rows: data.rows || [],
        totals: data.totals?.[0]?.metricValues || [],
        metadata: {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          days,
        },
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});