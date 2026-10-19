import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ────────────────────────────────────────────────────────────────
// sendContactFormEmail
//
// The enquiry form is public and anonymous, so this endpoint is
// callable without a login. It therefore never accepts a recipient
// address from the caller: that would turn it into an open mail relay
// able to send from hello@alignedwomanco.com to any address on the
// internet, which would get the domain blacklisted.
//
// The caller passes only a submissionId. Everything else is read from
// the ContactSubmission record itself, and three guards narrow the
// window to "someone who just filled in the form":
//   1. the record must exist
//   2. it must have been created in the last 15 minutes
//   3. its status must still be new
//
// Two emails go out. The woman who wrote in gets the thank you. The
// owner inbox gets the enquiry itself, with her message, so nothing
// sits unseen in a dashboard.
//
// Fixed here: the previous version joined its headers and body with a
// single trailing CRLF, so the first line of the body was parsed as a
// header and the email arrived mangled. Headers and body are now
// separated by the blank line RFC 5322 requires, and the body is
// base64 encoded so accented names survive btoa.
// ────────────────────────────────────────────────────────────────

const OWNER_EMAIL = "hello@alignedwomanco.com";
const FROM_HEADER = `The Aligned Woman <${OWNER_EMAIL}>`;
const MAX_AGE_MS = 15 * 60 * 1000;

const EMAIL_SUBJECTS: Record<string, string> = {
  apply_expert: "Thank You for Your Expert Application",
  apply_programme: "Thank You for Your Programme Application",
  corporate_di: "Thank You for Your Corporate D&I Enquiry",
  brand_collab: "Thank You for Your Collaboration Enquiry",
  press: "Thank You for Your Media Enquiry",
  general: "Thank You for Your Enquiry",
  newsletter: "Thank You for Subscribing",
};

const EMAIL_BODIES: Record<string, (name: string) => string> = {
  apply_expert: (n) => `Dear ${n},\n\nThank you for your interest in joining The Aligned Woman network of experts. We've received your application and our team will review it within 5-7 business days.\n\nWe'll be in touch soon to discuss next steps.\n\nWith warmth,\nThe Aligned Woman Team`,
  apply_programme: (n) => `Dear ${n},\n\nThank you for your application to The Aligned Woman Blueprint. We've received your submission and will be in touch within 24-48 hours.\n\nWith warmth,\nThe Aligned Woman Team`,
  corporate_di: (n) => `Dear ${n},\n\nThank you for your enquiry about our Corporate D&I programmes. We've received your message and will be in touch within 24-48 hours to discuss how we can support your organisation.\n\nWith warmth,\nThe Aligned Woman Team`,
  brand_collab: (n) => `Dear ${n},\n\nThank you for reaching out about a potential collaboration. We're excited to hear your idea and will review your enquiry within 24-48 hours.\n\nWith warmth,\nThe Aligned Woman Team`,
  press: (n) => `Dear ${n},\n\nThank you for your media enquiry. We've received your message and our team will be in touch within 24-48 hours.\n\nWith warmth,\nThe Aligned Woman Team`,
  general: (n) => `Dear ${n},\n\nThank you for reaching out to The Aligned Woman. We've received your message and will respond within 24-48 hours.\n\nWith warmth,\nThe Aligned Woman Team`,
  newsletter: (n) => `Dear ${n},\n\nThank you for subscribing to The Aligned Woman newsletter. You'll now receive our latest insights, resources, and updates.\n\nWith warmth,\nThe Aligned Woman Team`,
};

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
    bcc ? `Bcc: ${bcc}` : null,
    `Reply-To: ${OWNER_EMAIL}`,
    `Subject: =?utf-8?B?${toBase64(subject)}?=`,
    `Date: ${new Date().toUTCString()}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `Content-Transfer-Encoding: base64`,
  ].filter(Boolean).join("\r\n");

  // Blank line between headers and body. Without it the first body line
  // is read as a header and the email arrives mangled.
  return `${headers}\r\n\r\n${toBase64(text)}`;
}

async function sendViaGmail(accessToken: string, raw: string) {
  const response = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw: toBase64Url(raw) }),
    }
  );

  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    throw new Error(detail?.error?.message || "Gmail rejected the message");
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { submissionId } = await req.json();

    if (!submissionId || typeof submissionId !== "string") {
      return Response.json({ error: "submissionId is required" }, { status: 400 });
    }

    // The recipient is never taken from the caller. It is read from the
    // record, which is what keeps this from being an open relay.
    const matches = await base44.asServiceRole.entities.ContactSubmission.filter({
      id: submissionId,
    });
    const submission = Array.isArray(matches) ? matches[0] : null;

    if (!submission) {
      return Response.json({ error: "Submission not found" }, { status: 404 });
    }

    if (submission.status && submission.status !== "new") {
      return Response.json({ error: "Submission has already been handled" }, { status: 409 });
    }

    const createdAt = new Date(submission.created_date).getTime();
    if (!createdAt || Date.now() - createdAt > MAX_AGE_MS) {
      return Response.json({ error: "Submission is outside the send window" }, { status: 409 });
    }

    const to = (submission.email || "").trim();
    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return Response.json({ error: "Submission has no usable email" }, { status: 422 });
    }

    const type = submission.type || "general";
    const firstName = (submission.first_name || "there").trim();
    const fullName = [submission.first_name, submission.last_name].filter(Boolean).join(" ").trim() || firstName;

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("gmail");
    if (!accessToken) {
      return Response.json({ error: "Gmail connector is not available" }, { status: 503 });
    }

    // 1. The thank you, to the woman who wrote in.
    const subject = EMAIL_SUBJECTS[type] || EMAIL_SUBJECTS.general;
    const body = (EMAIL_BODIES[type] || EMAIL_BODIES.general)(firstName);
    await sendViaGmail(accessToken, buildMimeMessage(to, OWNER_EMAIL, subject, body));

    // 2. The enquiry itself, to the owner inbox, so the message is read
    // rather than waiting to be found. Best effort: she already has her
    // confirmation, and the record is the source of truth.
    try {
      const alertLines = [
        `Name: ${fullName}`,
        `Email: ${to}`,
        submission.country ? `Country: ${submission.country}` : null,
        submission.extra_field_label && submission.extra_field_value
          ? `${submission.extra_field_label}: ${submission.extra_field_value}`
          : null,
        `Enquiry type: ${type}`,
        ``,
        (submission.message || "").trim(),
        ``,
        `Review: https://app.alignedwomanco.com/admin?tab=leads`,
      ].filter((line) => line !== null);

      await sendViaGmail(
        accessToken,
        buildMimeMessage(
          OWNER_EMAIL,
          "",
          `New enquiry - ${fullName}`,
          alertLines.join("\n"),
        ),
      );
    } catch (_err) {
      // Best effort. The submission record is the source of truth.
    }

    return Response.json({ success: true, sentTo: to, alerted: OWNER_EMAIL });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});