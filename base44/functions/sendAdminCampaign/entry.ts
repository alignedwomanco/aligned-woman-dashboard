import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

// Admin-only. Sends one saved email campaign to the audience that campaign
// targets. Recipients are resolved here, from the records the campaign points
// at, so a caller can never choose who an email goes to and the browser never
// holds the send capability.
const ADMIN_ROLES = ["owner", "admin", "master_admin"];
const RECIPIENT_LIMIT = 500;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!ADMIN_ROLES.includes(user.role)) {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const campaignId = body?.campaign_id;
    if (!campaignId) {
      return Response.json({ error: 'campaign_id is required' }, { status: 400 });
    }

    const campaign = await base44.asServiceRole.entities.EmailCampaign.get(campaignId);
    if (!campaign) {
      return Response.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Resolve recipients from the campaign's own audience, never from input.
    let recipients = [];
    if (campaign.target_audience === 'all_waitlist') {
      const rows = await base44.asServiceRole.entities.WaitlistSignup.list('-created_date', RECIPIENT_LIMIT);
      recipients = rows.map((r) => ({ email: r.email, name: r.full_name }));
    } else if (campaign.target_audience === 'abandoned_carts') {
      const rows = await base44.asServiceRole.entities.AbandonedCart.list('-created_date', RECIPIENT_LIMIT);
      recipients = rows.filter((r) => r.email).map((r) => ({ email: r.email, name: r.full_name }));
    } else if (campaign.target_audience === 'applications') {
      const rows = await base44.asServiceRole.entities.Application.list('-created_date', RECIPIENT_LIMIT);
      recipients = rows.map((r) => ({ email: r.email, name: r.full_name }));
    }

    const subject = campaign.subject || '';
    const html = campaign.body_html || '';
    let sent = 0;

    for (const recipient of recipients) {
      if (!recipient.email) continue;

      let status = 'sent';
      let errorMessage = '';
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: recipient.email,
          subject,
          body: html,
          from_name: 'The Aligned Woman',
        });
        sent += 1;
      } catch (err) {
        status = 'failed';
        errorMessage = err?.message || 'send_failed';
      }

      try {
        await base44.asServiceRole.entities.EmailLog.create({
          campaign_id: campaign.id,
          campaign_name: campaign.name || '',
          to_email: recipient.email,
          to_name: recipient.name || '',
          subject,
          type: 'campaign',
          status,
          error_message: errorMessage,
          sent_at: new Date().toISOString(),
        });
      } catch (_err) {
        // Logging is best effort. Never fail the send over it.
      }
    }

    await base44.asServiceRole.entities.EmailCampaign.update(campaign.id, {
      status: 'sent',
      sent_at: new Date().toISOString(),
      sent_count: sent,
    });

    return Response.json({ success: true, sent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}