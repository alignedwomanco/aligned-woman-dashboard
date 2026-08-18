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

function buildMimeMessage(to: string, bcc: string, subject: string, text: string): string {
  const headers = [
    `From: ${FROM_HEADER}`,
    `To: ${to}`,
    `Bcc: ${bcc}`,
    `Reply-To: ${OWNER_EMAIL}`,
    `Subject: ${subject}`,
    `Date: ${new Date().toUTCString()}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `Content-Transfer-Encoding: base64`,
  ].join("\r\n");

  // Blank line between headers and body. Without it the first body
  // line is read as a header and the email arrives mangled.
  return `${headers}\r\n\r\n${toBase64(text)}`;
}

function buildBody(name: string): string {
  return [
    `Hi ${name},`,
    ``,
    `Thank you for applying to be part of the AW Verified directory. Your application is with us, and it will be read by a real human soon!`,
    ``,
    `Here is what happens next. We review every application against the Aligned Woman Standard. Should you be successful, we will request your qualifications and the proof behind them, your professional registration where your field requires one, and how you work with the women who trust you. If your work looks like a fit, the next step is a real conversation with us.`,
    ``,
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

    const raw = toBase64Url(buildMimeMessage(to, OWNER_EMAIL, SUBJECT, buildBody(name)));

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
