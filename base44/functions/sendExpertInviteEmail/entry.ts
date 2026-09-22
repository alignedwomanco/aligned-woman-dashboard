import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

// Admin-only. The two expert onboarding emails: a role invitation, and the
// pre-approval notice. Recipient and copy come from fixed templates chosen by
// `template`, so the endpoint cannot be used to send arbitrary mail.
const ADMIN_ROLES = ["owner", "admin", "master_admin"];
const SIGNUP_LINK = "https://app.alignedwomanco.com/welcome";

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
    const email = String(body?.email ?? '').trim().toLowerCase();
    const template = body?.template === 'preapproved' ? 'preapproved' : 'invite';
    const role = String(body?.role ?? 'expert').replace(/[^a-z_]/gi, '');

    if (!email || !email.includes('@')) {
      return Response.json({ error: 'A valid email address is required' }, { status: 400 });
    }

    const subject = template === 'preapproved'
      ? "You're pre-approved - The Aligned Woman"
      : 'Invitation to join as expert - The Aligned Woman Blueprint';

    const text = template === 'preapproved'
      ? `Hi,\n\nYou have been pre-approved to access your expert dashboard on The Aligned Woman.\n\nSign in using this email address (${email}) here:\n${SIGNUP_LINK}\n\nOnce you sign in, your profile will be ready to edit.\n\nWarmly,\nThe Aligned Woman team`
      : `You've been invited to join The Aligned Woman Blueprint as ${role.replace('_', ' ')}. Please sign up at ${SIGNUP_LINK}`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      subject,
      body: text,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}