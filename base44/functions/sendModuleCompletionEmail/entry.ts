import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

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

    // This function is invoked by the entity automation on CourseProgress changes.
    // The payload includes: event, data (current record), old_data (previous), changed_fields.
    const body = await req.json();
    const { data, old_data } = body;

    // Only act on page completions
    if (!data || data.status !== 'completed') {
      return Response.json({ skipped: true, reason: 'status not completed' });
    }

    // Skip if this page was already completed before (status didn't actually change)
    if (old_data && old_data.status === 'completed') {
      return Response.json({ skipped: true, reason: 'page was already completed' });
    }

    const moduleId = data.moduleId;
    const userId = data.created_by_id;

    if (!moduleId || !userId) {
      return Response.json({ skipped: true, reason: 'missing moduleId or userId' });
    }

    // Look up all pages that belong to this module
    const modulePages = await base44.asServiceRole.entities.CoursePage.filter(
      { moduleId },
      "order",
      500
    );

    if (modulePages.length === 0) {
      return Response.json({ skipped: true, reason: 'module has no pages' });
    }

    // Look up all progress records this user has for pages in this module
    const allProgress = await base44.asServiceRole.entities.CourseProgress.filter(
      { moduleId, created_by_id: userId },
      "-created_date",
      500
    );

    // Build pageId -> latest status map (most recently updated record wins on duplicates)
    const progressMap = {};
    const dateMap = {};
    allProgress.forEach((p) => {
      if (!p.pageId) return;
      const pDate = p.updated_date || p.created_date || "";
      if (!progressMap[p.pageId] || pDate > (dateMap[p.pageId] || "")) {
        progressMap[p.pageId] = p.status;
        dateMap[p.pageId] = pDate;
      }
    });

    // A module is complete when every page in it has status "completed"
    const allComplete = modulePages.every((p) => progressMap[p.id] === 'completed');
    if (!allComplete) {
      return Response.json({ skipped: true, reason: 'module not yet fully complete' });
    }

    // ── Module just became complete — gather details for the email ──

    let moduleTitle = 'your module';
    try {
      const mod = await base44.asServiceRole.entities.CourseModule.get(moduleId);
      if (mod?.title) moduleTitle = mod.title;
    } catch (_e) {
      // fall back to generic label
    }

    let userEmail = null;
    let userName = null;
    try {
      const user = await base44.asServiceRole.entities.User.get(userId);
      userEmail = user?.email;
      userName = user?.full_name;
    } catch (_e) {
      // fall back
    }

    if (!userEmail) {
      return Response.json({ skipped: true, reason: 'no user email found' });
    }

    // ── Send the email via the connected Gmail connector ──
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

    const profileRes = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/profile',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const profile = await profileRes.json();
    const senderEmail = profile.emailAddress;

    const displayName = userName || userEmail;
    const dashboardUrl = req.headers.get('origin') || 'https://app.base44.com';

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
                You did it, ${displayName}!
              </h1>
              <p style="margin:0 0 24px;color:#6B4A5A;font-size:15px;line-height:1.6;">
                You just completed <strong>${moduleTitle}</strong>. That's real momentum — every module you finish
                is a step closer to the woman you're becoming.
              </p>
              <p style="margin:0 0 24px;color:#6B4A5A;font-size:15px;line-height:1.6;">
                Take a moment to let it land. Then, when you're ready, head back to your Classroom
                to pick up where you left off and keep the rhythm going.
              </p>
              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:32px 0;">
                <tr>
                  <td style="background:#C4847A;border-radius:100px;padding:14px 36px;">
                    <a href="${dashboardUrl}" style="color:#ffffff;font-family:Montserrat,Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;text-decoration:none;">
                      Continue My Journey →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;color:#8A7A76;font-size:13px;line-height:1.6;">
                If the button doesn't work, paste this link into your browser:
              </p>
              <p style="margin:0;font-size:12px;color:#C4847A;word-break:break-all;">${dashboardUrl}</p>
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
      to: userEmail,
      subject: `You just completed "${moduleTitle}" 🎉`,
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

    return Response.json({
      success: true,
      sentTo: userEmail,
      module: moduleTitle,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});