import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

// Sends the member-to-member connection request email. The sender is taken from
// the signed-in account and the recipient must be an existing member, so the
// endpoint cannot be used to mail arbitrary addresses.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const recipientEmail = String(body?.recipient_email ?? '').trim().toLowerCase();
    const note = String(body?.note ?? '').trim().slice(0, 1000);

    if (!recipientEmail || !note) {
      return Response.json({ error: 'recipient_email and note are required' }, { status: 400 });
    }

    const senderEmail = String(user.email ?? '').trim().toLowerCase();
    if (recipientEmail === senderEmail) {
      return Response.json({ error: 'You cannot connect with yourself' }, { status: 400 });
    }

    // The recipient must be a real member. This is what stops the function from
    // being used as an open relay to any address a caller supplies.
    const members = await base44.asServiceRole.entities.User.filter({ email: recipientEmail });
    if (!members || members.length === 0) {
      return Response.json({ error: 'That member could not be found' }, { status: 404 });
    }

    const senderName = user.full_name || 'A member';
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: recipientEmail,
      subject: 'New connection request',
      body: `${senderName} wants to connect with you on The Aligned Woman.\n\nMessage: ${note}\n\nSign in to view and respond to your connection requests.`,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}