import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Build a RFC 2822 MIME message
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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Must be called by an admin
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { recipientEmail, recipientName } = await req.json();
    if (!recipientEmail) {
      return Response.json({ error: 'recipientEmail is required' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

    // Get the sender's Gmail profile (so the "from" address is your real Gmail)
    const profileRes = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/profile',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const profile = await profileRes.json();
    const senderEmail = profile.emailAddress;

    const loginUrl = 'https://app.base44.com'; // users are redirected to the app login
    const displayName = recipientName || recipientEmail;

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#fdf5f3;font-family:Montserrat,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf5f3;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(74,14,46,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#4A0E2E;padding:32px 40px;text-align:center;">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695154cb868ee011bb627195/23f49bf5a_AlignedWomanLogoPurple.png"
                alt="The Aligned Woman" height="40" style="filter:brightness(0) invert(1);height:40px;" />
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:28px;color:#4A0E2E;font-weight:400;">
                Welcome, ${displayName}!
              </h1>
              <p style="margin:0 0 24px;color:#6B4A5A;font-size:15px;line-height:1.6;">
                You've been invited to <strong>The Aligned Woman Blueprint</strong> — your personal operating system for embodied success.
              </p>
              <p style="margin:0 0 24px;color:#6B4A5A;font-size:15px;line-height:1.6;">
                Your account has been created with this email address (<strong>${recipientEmail}</strong>). Click the button below to set your password and log in for the first time.
              </p>
              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:32px 0;">
                <tr>
                  <td style="background:#C4847A;border-radius:100px;padding:14px 36px;">
                    <a href="${loginUrl}" style="color:#ffffff;font-family:Montserrat,Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;text-decoration:none;">
                      Access My Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;color:#8A7A76;font-size:13px;line-height:1.6;">
                If the button doesn't work, paste this link into your browser:
              </p>
              <p style="margin:0;font-size:12px;color:#C4847A;word-break:break-all;">${loginUrl}</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f5ddd9;padding:24px 40px;text-align:center;">
              <p style="margin:0;color:#8A7A76;font-size:12px;line-height:1.6;">
                © ${new Date().getFullYear()} The Aligned Woman Blueprint. All rights reserved.<br/>
                Questions? Reply to this email and we'll be happy to help.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const rawMessage = buildMimeMessage({
      to: recipientEmail,
      subject: "Welcome to The Aligned Woman Blueprint — Your Access Details",
      htmlBody,
      fromName: "The Aligned Woman",
      fromEmail: senderEmail,
    });

    // Gmail API expects base64url encoded raw message
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

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});