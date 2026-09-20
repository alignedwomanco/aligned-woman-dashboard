import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ────────────────────────────────────────────────────────────────
// sendExpertApplicationEmail
//
// Sends the AW Verified confirmation to the applicant, with a real
// Bcc header putting a copy in hello@alignedwomanco.com. That Bcc is
// the whole reason this function exists: the Core SendEmail
// integration accepts only to, subject, body and from_name, so a
// blind copy is impossible through it. Raw MIME through the Gmail
// connector is the only path.
//
// SECURITY. The Apply page is public and anonymous, so this endpoint
// is callable without a login. It therefore must never accept a
// recipient address from the caller: doing so would turn it into an
// open mail relay able to send from hello@alignedwomanco.com to any
// address on the internet, which would get the domain blacklisted.
//
// Instead the caller passes only an applicationId. The recipient is
// read server side from the ExpertApplication record itself, so the
// only address reachable is one already stored on a real record.
// Three further guards narrow the window:
//   1. the record must exist
//   2. it must have been created in the last 15 minutes
//   3. its status must still be pending
// Together these mean the endpoint can only ever re-send a fixed
// template to someone who just applied.
//
// Known bug avoided here: sendContactFormEmail joins its headers with
// a single trailing CRLF, so the first line of its body is parsed as
// a header. This builds the header block and the body separately and
// joins them with a blank line, which is what RFC 5322 requires.
// Body is base64 encoded so accented names do not break btoa.
// ────────────────────────────────────────────────────────────────

const OWNER_EMAIL = "hello@alignedwomanco.com";
const FROM_HEADER = `The Aligned Woman <${OWNER_EMAIL}>`;
const SUBJECT = "We have your application";
const GROUP_SUBJECT = "We have your group request";
const MAX_AGE_MS = 15 * 60 * 1000;

function toBase64(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function toBase64Url(input: string): string {
  return toBase64(input)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

const BRAND_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695154cb868ee011bb627195/23f49bf5a_AlignedWomanLogoPurple.png";
const BRAND_FONT_BODY = "Montserrat, 'Helvetica Neue', Arial, sans-serif";
const BRAND_FONT_DISPLAY = "'DM Serif Display', Georgia, 'Times New Roman', serif";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function linkify(s: string): string {
  return escapeHtml(s).replace(/(https?:\/\/[^\s<]+)/g, (u) => `<a href="${u}" style="color:#C4847A;text-decoration:underline;word-break:break-all;">${u}</a>`);
}

// Turns the plain text email into the branded HTML version. Blocks are
// split on blank lines. A line shaped "Label: https://..." becomes the
// call to action (the first one a filled button, later ones a link).
// The sign off is set quieter. The plain text part is still sent, so
// a client that cannot render HTML gets exactly the same words.
function renderCircleHtml(subject: string, text: string): string {
  const blocks = text.replace(/\r/g, "").split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const ctaRe = /^(.{2,80}?):\s*(https?:\/\/\S+)$/;
  let usedButton = false;
  const parts: string[] = [];
  const P = `margin:0 0 18px;font-family:${BRAND_FONT_BODY};font-size:15px;line-height:1.7;color:#3D2B2D;font-weight:300;`;
  const QUIET = `margin:0 0 6px;font-family:${BRAND_FONT_BODY};font-size:14px;line-height:1.6;color:#8A7068;font-weight:300;`;

  blocks.forEach((block, i) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const isSignOff = /^with warmth,?$/i.test(lines[0] || "") || (i === blocks.length - 1 && lines.length <= 3 && /aligned woman/i.test(block));
    if (isSignOff) {
      parts.push(`<p style="${QUIET}margin-top:10px;">${lines.map(escapeHtml).join("<br/>")}</p>`);
      return;
    }
    const single = lines.length === 1 ? lines[0] : "";
    const cta = single ? single.match(ctaRe) : null;
    if (cta) {
      const label = escapeHtml(cta[1]);
      const href = cta[2];
      if (!usedButton) {
        usedButton = true;
        parts.push(
          `<table cellpadding="0" cellspacing="0" role="presentation" style="margin:6px 0 26px;"><tr><td style="background:#4A0E2E;border-radius:100px;padding:15px 34px;">` +
          `<a href="${href}" style="color:#FFFFFF;font-family:${BRAND_FONT_BODY};font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;text-decoration:none;display:inline-block;">${label}</a>` +
          `</td></tr></table>`,
        );
      } else {
        parts.push(`<p style="${P}"><strong style="font-weight:600;">${label}:</strong> <a href="${href}" style="color:#C4847A;text-decoration:underline;word-break:break-all;">${href}</a></p>`);
      }
      return;
    }
    parts.push(`<p style="${P}">${lines.map(linkify).join("<br/>")}</p>`);
  });

  const heading = escapeHtml(subject).replace(/\bWoman\b/, `<em style="font-style:italic;">Woman</em>`).replace(/\bWomen\b/, `<em style="font-style:italic;">Women</em>`);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#F7EFEC;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#F7EFEC;padding:36px 14px;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" role="presentation" style="max-width:580px;width:100%;background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 14px 40px rgba(61,43,45,0.07);">
          <tr>
            <td style="background:#4A0E2E;padding:28px 40px;text-align:center;">
              <img src="${BRAND_LOGO}" alt="The Aligned Woman" height="36" style="filter:brightness(0) invert(1);height:36px;" />
            </td>
          </tr>
          <tr>
            <td style="padding:38px 40px 26px;">
              <h1 style="margin:0 0 22px;font-family:${BRAND_FONT_DISPLAY};font-size:27px;line-height:1.2;color:#4A0E2E;font-weight:400;">${heading}</h1>
              ${parts.join("\n              ")}
            </td>
          </tr>
          <tr>
            <td style="background:#F5DDD9;padding:22px 40px;text-align:center;">
              <p style="margin:0;font-family:${BRAND_FONT_BODY};font-size:12px;line-height:1.7;color:#8A7068;">
                The education women should have been given.<br/>
                Reply to this email and a person will answer.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildMimeMessage(to: string, bcc: string, subject: string, text: string, cc = ""): string {
  const boundary = `----=_AW_${crypto.randomUUID().replace(/-/g, "")}`;
  const headers = [
    `From: ${FROM_HEADER}`,
    `To: ${to}`,
    cc ? `Cc: ${cc}` : null,
    `Bcc: ${bcc}`,
    `Reply-To: ${OWNER_EMAIL}`,
    `Subject: =?utf-8?B?${toBase64(subject)}?=`,
    `Date: ${new Date().toUTCString()}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ].filter(Boolean).join("\r\n");

  // Blank line between headers and body. Without it the first body
  // line is read as a header and the email arrives mangled.
  const body = [
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    toBase64(text),
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    toBase64(renderCircleHtml(subject, text)),
    `--${boundary}--`,
  ].join("\r\n");
  return `${headers}\r\n\r\n${body}`;
}

// A woman who only asked to start her own group (the Community page form)
// never applied to the directory, so she gets the group wording.
function buildGroupBody(name: string, groupName: string, requestedBy: string): string {
  return [
    `Hi ${name},`,
    ``,
    requestedBy
      ? `${requestedBy} has asked us to set up ${groupName || "a group"} on The Aligned Woman with you as its host. The request is with us, and it will be read by a real person.`
      : `Thank you for asking to start ${groupName || "your own group"} on The Aligned Woman. Your request is with us, and it will be read by a real person.`,
    ``,
    `Every group is approved one at a time, so the platform stays a place women can trust. Once yours is approved, it gets its own address, a private room only the women you invite can see, and a short guide to hosting it well.`,
    ``,
    `You will hear from us either way, within 14 working days.`,
    ``,
    ...(requestedBy ? [`${requestedBy} is copied on this email so you both know where things stand.`, ``] : []),
    `With warmth,`,
    `Laura`,
    `Founder, The Aligned Woman`,
  ].join("\n");
}

function buildBody(name: string, wantsCommunity: boolean): string {
  return [
    `Hi ${name},`,
    ``,
    `Thank you for applying to be part of the AW Verified directory. Your application is with us, and it will be read by a real human soon!`,
    ``,
    `Here is what happens next. We review every application against the Aligned Woman Standard. Should you be successful, we will request your qualifications and the proof behind them, your professional registration where your field requires one, and how you work with the women who trust you. If your work looks like a fit, the next step is a real conversation with us.`,
    ``,
    // One line added when community hosting was ticked, per the host guide.
    ...(wantsCommunity
      ? [`You have also asked about hosting your own community. We approve those one at a time, after a conversation, so we will be in touch about that separately.`, ``]
      : []),
    `You will hear from us either way, within 14 working days.`,
    ``,
    `With warmth,`,
    `Laura`,
    `Founder, The Aligned Woman`,
  ].join("\n");
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { applicationId } = await req.json();

    if (!applicationId || typeof applicationId !== "string") {
      return Response.json({ error: "applicationId is required" }, { status: 400 });
    }

    // The recipient is never taken from the caller. It is read from the
    // record, which is what keeps this from being an open relay.
    const matches = await base44.asServiceRole.entities.ExpertApplication.filter({
      id: applicationId,
    });
    const application = Array.isArray(matches) ? matches[0] : null;

    if (!application) {
      return Response.json({ error: "Application not found" }, { status: 404 });
    }

    if (application.status !== "pending") {
      return Response.json({ error: "Application is not pending" }, { status: 409 });
    }

    const createdAt = new Date(application.created_date).getTime();
    if (!createdAt || Date.now() - createdAt > MAX_AGE_MS) {
      return Response.json({ error: "Application is outside the send window" }, { status: 409 });
    }

    const to = (application.email || "").trim();
    const name = (application.applicant_name || "there").trim();

    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return Response.json({ error: "Application has no usable email" }, { status: 422 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("gmail");
    if (!accessToken) {
      return Response.json({ error: "Gmail connector is not available" }, { status: 503 });
    }

    const interests = Array.isArray(application.interested_in) ? application.interested_in : [];
    const wantsCommunity = interests.includes("host_community");
    const groupOnly = wantsCommunity && !interests.includes("marketplace_profile") && !interests.includes("host_course");
    const subject = groupOnly ? GROUP_SUBJECT : SUBJECT;
    const requestedBy = (application.requested_by_name || "").trim();
    // The woman who sent the request on someone else's behalf is copied in,
    // so a mistyped host address never fails silently. Read from the record,
    // never from the caller, for the same open relay reason as the recipient.
    const requesterEmail = (application.requested_by_email || "").trim().toLowerCase();
    const cc = groupOnly && requesterEmail && requesterEmail !== to.toLowerCase() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requesterEmail) ? requesterEmail : "";
    const text = groupOnly ? buildGroupBody(name, (application.community_name || "").trim(), cc ? requestedBy : "") : buildBody(name, wantsCommunity);
    const raw = toBase64Url(buildMimeMessage(to, OWNER_EMAIL, subject, text, cc));

    const response = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw }),
      }
    );

    if (!response.ok) {
      const detail = await response.json().catch(() => ({}));
      throw new Error(detail?.error?.message || "Gmail rejected the message");
    }

    return Response.json({ success: true, sentTo: to, bcc: OWNER_EMAIL });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
