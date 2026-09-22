import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

// The "connect" form on a directory card. It always writes to the platform
// inbox, never to an address the caller supplies.
const PLATFORM_INBOX = 'hello@alignedwomanco.com';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const expertId = body?.expert_id;
    const senderName = String(body?.sender_name ?? '').trim().slice(0, 200);
    const senderEmail = String(body?.sender_email ?? '').trim().slice(0, 200);
    const reason = String(body?.reason ?? '').trim().slice(0, 4000);

    if (!expertId || !senderName || !senderEmail || !reason) {
      return Response.json({ error: 'expert_id, sender_name, sender_email and reason are required' }, { status: 400 });
    }

    const experts = await base44.asServiceRole.entities.Expert.filter({ id: expertId });
    const expert = experts?.[0];
    if (!expert) {
      return Response.json({ error: 'Practitioner not found' }, { status: 404 });
    }

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: PLATFORM_INBOX,
      subject: `Expert connection request - ${expert.name || 'unknown'}`,
      body:
        `Name: ${senderName}\n` +
        `Email: ${senderEmail}\n` +
        `Expert: ${expert.name || ''}\n\n` +
        `Message:\n${reason}`,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}