import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

// A member writing to a practitioner through her profile. The recipient is read
// from the Expert record, so a caller can never choose who the message goes to.
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
    const regarding = String(body?.regarding ?? '').trim().slice(0, 200);
    const message = String(body?.message ?? '').trim().slice(0, 4000);

    if (!expertId || !senderName || !senderEmail || !message) {
      return Response.json({ error: 'expert_id, sender_name, sender_email and message are required' }, { status: 400 });
    }

    const experts = await base44.asServiceRole.entities.Expert.filter({ id: expertId });
    const expert = experts?.[0];
    if (!expert) {
      return Response.json({ error: 'Practitioner not found' }, { status: 404 });
    }

    const recipient = String(expert.email || expert.linked_user_email || '').trim().toLowerCase();
    if (!recipient || !recipient.includes('@')) {
      return Response.json({ error: 'This practitioner has no contact address' }, { status: 422 });
    }

    const firstName = String(expert.name || '').trim().split(/\s+/)[0] || 'there';

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: recipient,
      from_name: 'The Aligned Woman Co',
      subject: `New message from ${senderName} via your Aligned Woman profile`,
      body:
        `Hi ${firstName},\n\n` +
        `You have received a message from ${senderName} via your Aligned Woman profile.\n\n` +
        `From: ${senderName} (${senderEmail})\n` +
        (regarding ? `Regarding: ${regarding}\n` : '') +
        `\nMessage:\n${message}\n\n` +
        `Reply directly to ${senderEmail} to respond.`,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}