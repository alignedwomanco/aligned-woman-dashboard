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

const NOTIFY_EMAIL = 'hello@laurajanethomas.biz';
const LOOKBACK_MINUTES = 15;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch recent users (sorted newest-first)
    const recentUsers = await base44.asServiceRole.entities.User.list('-created_date', 50);

    // Filter to those created within the lookback window
    const cutoff = new Date(Date.now() - LOOKBACK_MINUTES * 60 * 1000);
    const newUsers = recentUsers.filter((u) =>
      u.created_date && new Date(u.created_date) > cutoff
    );

    if (newUsers.length === 0) {
      return Response.json({ checked: true, newUsers: 0 });
    }

    // Get Gmail connection for sending
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

    const profileRes = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/profile',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const profile = await profileRes.json();
    const senderEmail = profile.emailAddress;

    const results = [];

    for (const newUser of newUsers) {
      const dedupKey = `new_user:${newUser.id}`;

      // Check if we already sent a notification for this user
      const existing = await base44.asServiceRole.entities.EmailLog.filter({
        campaign_id: dedupKey,
        type: 'one_time',
      });

      if (existing.length > 0) {
        results.push({ userId: newUser.id, skipped: true });
        continue;
      }

      const newUserEmail = newUser.email || 'unknown email';
      const newUserName = newUser.full_name || 'Unknown';
      const userRole = newUser.role || 'user';
      const joinedDate = newUser.created_date
        ? new Date(newUser.created_date).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'medium', timeStyle: 'short' })
        : new Date().toUTCString();

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
        <tr><td style="padding:32px 36px;">
          <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:24px;color:#4A0E2E;font-weight:400;">New Member Registered</h1>
          <p style="margin:0 0 24px;color:#6B4A5A;font-size:14px;line-height:1.6;">A new user just created an account. Here are their details:</p>
          <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 24px;">
            <tr><td style="padding:8px 0;color:#8A7A76;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;border-bottom:1px solid #f5ddd9;">Name</td><td style="padding:8px 0;color:#4A0E2E;font-size:14px;border-bottom:1px solid #f5ddd9;text-align:right;">${newUserName}</td></tr>
            <tr><td style="padding:8px 0;color:#8A7A76;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;border-bottom:1px solid #f5ddd9;">Email</td><td style="padding:8px 0;color:#4A0E2E;font-size:14px;border-bottom:1px solid #f5ddd9;text-align:right;">${newUserEmail}</td></tr>
            <tr><td style="padding:8px 0;color:#8A7A76;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;border-bottom:1px solid #f5ddd9;">Role</td><td style="padding:8px 0;color:#4A0E2E;font-size:14px;border-bottom:1px solid #f5ddd9;text-align:right;">${userRole}</td></tr>
            <tr><td style="padding:8px 0;color:#8A7A76;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Joined</td><td style="padding:8px 0;color:#4A0E2E;font-size:14px;text-align:right;">${joinedDate}</td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#f5ddd9;padding:20px 36px;text-align:center;">
          <p style="margin:0;color:#8A7A76;font-size:12px;">This is an automated notification from The Aligned Woman platform.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

      const rawMessage = buildMimeMessage({
        to: NOTIFY_EMAIL,
        subject: `New Member: ${newUserName} (${newUserEmail})`,
        htmlBody,
        fromName: "The Aligned Woman",
        fromEmail: senderEmail,
      });

      const encoded = btoa(rawMessage)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

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
        throw new Error(err.error?.message || 'Gmail send failed');
      }

      // Log so we don't send twice
      await base44.asServiceRole.entities.EmailLog.create({
        campaign_id: dedupKey,
        campaign_name: 'New User Notification',
        to_email: NOTIFY_EMAIL,
        to_name: 'Laura',
        subject: `New Member: ${newUserName} (${newUserEmail})`,
        type: 'one_time',
        status: 'sent',
        sent_at: new Date().toISOString(),
      });

      results.push({ userId: newUser.id, sent: true, email: newUserEmail });
    }

    return Response.json({ checked: true, newUsers: newUsers.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});