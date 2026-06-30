import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function buildMimeMessage({ to, subject, htmlBody, fromName, fromEmail }) {
  const boundary = "----=_Part_" + Math.random().toString(36).substring(2);
  const encodedSubject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;

  const lines = [
    `From: ${fromName} <${fromEmail}>`,
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    btoa(unescape(encodeURIComponent(htmlBody))),
    `--${boundary}--`,
  ];

  return lines.join("\r\n");
}

const CHECKOUT_URL = 'https://app.base44.com/checkout';
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch all abandoned carts (RLS is admin-only, so asServiceRole works)
    const carts = await base44.asServiceRole.entities.AbandonedCart.list('-created_date', 200);

    const cutoff = new Date(Date.now() - TWO_HOURS_MS);
    const eligible = carts.filter((c) =>
      !c.recovered &&
      c.email &&
      c.created_date &&
      new Date(c.created_date) < cutoff
    );

    if (eligible.length === 0) {
      return Response.json({ checked: true, eligible: 0 });
    }

    // Get Gmail connection
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

    const profileRes = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/profile',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const profile = await profileRes.json();
    const senderEmail = profile.emailAddress;

    const results = [];

    for (const cart of eligible) {
      const dedupKey = `cart_reminder:${cart.id}`;

      // Check if we already sent a reminder for this cart
      const existing = await base44.asServiceRole.entities.EmailLog.filter({
        campaign_id: dedupKey,
        type: 'abandoned_cart',
      });

      if (existing.length > 0) {
        results.push({ cartId: cart.id, skipped: true });
        continue;
      }

      const firstName = cart.first_name || 'there';
      const planLabel = cart.selected_plan === 'payment_plan' ? 'payment plan' : 'full access';

      const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#fdf5f3;font-family:Montserrat,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf5f3;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(74,14,46,0.08);">
        <tr><td style="background:#4A0E2E;padding:28px 36px;text-align:center;">
          <p style="margin:0;color:#E8B4AE;font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;">The Aligned Woman</p>
        </td></tr>
        <tr><td style="padding:36px 36px 32px;">
          <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:26px;color:#4A0E2E;font-weight:400;">
            Hi ${firstName}, your spot is waiting
          </h1>
          <p style="margin:0 0 20px;color:#6B4A5A;font-size:15px;line-height:1.6;">
            You were moments away from beginning your Aligned Woman Blueprint journey. Life happens — but
            this is your gentle nudge to pick up where you left off.
          </p>
          <p style="margin:0 0 28px;color:#6B4A5A;font-size:15px;line-height:1.6;">
            Your ${planLabel} is still reserved. Whenever you're ready, just click below to complete your enrolment.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
            <tr><td style="background:#C4847A;border-radius:100px;padding:14px 36px;">
              <a href="${CHECKOUT_URL}" style="color:#ffffff;font-family:Montserrat,Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;text-decoration:none;">
                Complete My Enrolment →
              </a>
            </td></tr>
          </table>
          <p style="margin:24px 0 0;font-size:12px;color:#8A7A76;word-break:break-all;">
            ${CHECKOUT_URL}
          </p>
        </td></tr>
        <tr><td style="background:#f5ddd9;padding:20px 36px;text-align:center;">
          <p style="margin:0;color:#8A7A76;font-size:12px;">
            © ${new Date().getFullYear()} The Aligned Woman Blueprint · This is an automated reminder.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

      const rawMessage = buildMimeMessage({
        to: cart.email,
        subject: `Hi ${firstName}, your Blueprint spot is still waiting`,
        htmlBody,
        fromName: "The Aligned Woman",
        fromEmail: senderEmail,
      });

      const encoded = btoa(rawMessage)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      let sendStatus = 'sent';
      let errorMsg = null;

      const sendRes = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ raw: encoded }),
        }
      );

      if (!sendRes.ok) {
        const err = await sendRes.json();
        errorMsg = err.error?.message || 'Gmail send failed';
        sendStatus = 'failed';
      }

      // Log regardless so we don't retry (avoids spamming on persistent failures)
      await base44.asServiceRole.entities.EmailLog.create({
        campaign_id: dedupKey,
        campaign_name: 'Abandoned Cart Reminder',
        to_email: cart.email,
        to_name: cart.first_name || '',
        subject: `Hi ${firstName}, your Blueprint spot is still waiting`,
        type: 'abandoned_cart',
        status: sendStatus,
        error_message: errorMsg,
        sent_at: new Date().toISOString(),
      });

      results.push({ cartId: cart.id, email: cart.email, status: sendStatus });
    }

    return Response.json({ checked: true, eligible: eligible.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});