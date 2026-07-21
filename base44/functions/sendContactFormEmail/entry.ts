import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Simple MIME message builder
function buildMimeMessage(from, to, bcc, subject, text) {
  const boundary = "----=_Part_" + Math.random().toString(16).slice(2);
  const date = new Date().toUTCString();
  
  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    `Bcc: ${bcc}`,
    `Subject: ${subject}`,
    `Date: ${date}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
  ];
  
  return headers.join("\r\n") + text;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { submissionId, recipientEmail, submissionType, firstName } = await req.json();

    // Prevent open mail relay: the thank-you may only go to the authenticated
    // user's own email. Clients cannot send to arbitrary external addresses.
    if (!recipientEmail || recipientEmail !== user.email) {
      return Response.json({ error: 'Recipient must match your account email' }, { status: 403 });
    }

    // Get Gmail access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("gmail");

    // Email content based on submission type
    const emailSubjects = {
      apply_expert: "Thank You for Your Expert Application",
      apply_programme: "Thank You for Your Programme Application",
      corporate_di: "Thank You for Your Corporate D&I Enquiry",
      brand_collab: "Thank You for Your Collaboration Enquiry",
      press: "Thank You for Your Media Enquiry",
      general: "Thank You for Your Enquiry",
      newsletter: "Thank You for Subscribing",
    };

    const emailBodies = {
      apply_expert: `Dear ${firstName},\n\nThank you for your interest in joining The Aligned Woman network of experts. We've received your application and our team will review it within 5-7 business days.\n\nWe'll be in touch soon to discuss next steps.\n\nWith warmth,\nThe Aligned Woman Team`,
      apply_programme: `Dear ${firstName},\n\nThank you for your application to The Aligned Woman Blueprint. We've received your submission and will be in touch within 24-48 hours.\n\nWith warmth,\nThe Aligned Woman Team`,
      corporate_di: `Dear ${firstName},\n\nThank you for your enquiry about our Corporate D&I programmes. We've received your message and will be in touch within 24-48 hours to discuss how we can support your organisation.\n\nWith warmth,\nThe Aligned Woman Team`,
      brand_collab: `Dear ${firstName},\n\nThank you for reaching out about a potential collaboration. We're excited to hear your idea and will review your enquiry within 24-48 hours.\n\nWith warmth,\nThe Aligned Woman Team`,
      press: `Dear ${firstName},\n\nThank you for your media enquiry. We've received your message and our team will be in touch within 24-48 hours.\n\nWith warmth,\nThe Aligned Woman Team`,
      general: `Dear ${firstName},\n\nThank you for reaching out to The Aligned Woman. We've received your message and will respond within 24-48 hours.\n\nWith warmth,\nThe Aligned Woman Team`,
      newsletter: `Dear ${firstName},\n\nThank you for subscribing to The Aligned Woman newsletter. You'll now receive our latest insights, resources, and updates.\n\nWith warmth,\nThe Aligned Woman Team`,
    };

    const subject = emailSubjects[submissionType] || "Thank You for Your Enquiry";
    const body = emailBodies[submissionType] || emailBodies.general;

    // Build MIME message
    const rawMessage = buildMimeMessage(
      "The Aligned Woman <hello@alignedwomanco.com>",
      recipientEmail,
      "hello@alignedwomanco.com",
      subject,
      body
    );

    // Encode for Gmail API (base64url)
    const base64Encoded = btoa(rawMessage)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // Send email via Gmail API
    const response = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          raw: base64Encoded,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to send email");
    }

    return Response.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});