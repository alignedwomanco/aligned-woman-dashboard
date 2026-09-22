import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

// Admin-only. Sends the saved reply on a support ticket back to the member who
// opened it. The recipient is read from the ticket record, so the caller can
// never choose an address.
const ADMIN_ROLES = ["owner", "admin", "master_admin"];

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
    const ticketId = body?.ticket_id;
    if (!ticketId) {
      return Response.json({ error: 'ticket_id is required' }, { status: 400 });
    }

    const tickets = await base44.asServiceRole.entities.SupportTicket.filter({ id: ticketId });
    const ticket = tickets?.[0];
    if (!ticket) {
      return Response.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const recipient = String(ticket.created_by || '').trim().toLowerCase();
    const reply = String(ticket.adminResponse || '').trim();

    if (!recipient || !recipient.includes('@')) {
      return Response.json({ error: 'This ticket has no member email on it' }, { status: 422 });
    }
    if (!reply) {
      return Response.json({ error: 'There is no saved reply on this ticket yet' }, { status: 409 });
    }

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: recipient,
      subject: `Re: ${ticket.subject || 'your support ticket'}`,
      body: `Your support ticket has been updated.\n\nAdmin response:\n${reply}\n\nTicket ID: ${ticket.id}`,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}