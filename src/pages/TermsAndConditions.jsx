import React from "react";
import { Link } from "react-router-dom";

const sections = [
  {
    title: "1. Introduction",
    content: `Welcome to The Aligned Woman Blueprint™ ("the Programme"). These Terms and Conditions govern your purchase of, and participation in, the Programme offered by The Aligned Woman (Pty) Ltd ("we", "us", "our").

By purchasing or enrolling in the Programme, you agree to be bound by these Terms and Conditions. Please read them carefully.`,
  },
  {
    title: "2. The Programme",
    content: `The Aligned Woman Blueprint™ is a premium transformational programme for women, structured around the ALIVE Method™ (Awareness, Liberation, Intention, Vision, Embodiment). The Programme includes:

• Access to all digital course modules and content
• Live group coaching sessions (as scheduled)
• Expert panel sessions
• Community platform access
• Programme workbooks and tools
• Bonus resources as announced

Content, schedules and delivery format may be updated from time to time. We will notify participants of material changes.`,
  },
  {
    title: "3. Payment Terms",
    content: `Pricing is region-dependent and will be displayed in your local currency at checkout. We offer two payment options:

Full Payment: The full programme fee paid at point of purchase.
Instalment Plan: Where available, monthly payments over an agreed period. All instalments must be completed to maintain full access.

Payments are processed securely via Stripe (international) or PayFast (South Africa). We do not store your card details.`,
  },
  {
    title: "4. Refund Policy",
    content: `Due to the nature of digital products and the immediate access granted upon purchase, we operate a limited refund policy:

• Within 7 days of purchase: A full refund may be requested if you have not accessed more than 20% of the programme content.
• After 7 days: No refunds will be issued.
• Instalment plans: Cancellation of an instalment plan will result in loss of programme access. Previously paid instalments are non-refundable.

To request a refund, contact us at hello@thealignedwoman.com within the refund window.`,
  },
  {
    title: "5. Intellectual Property",
    content: `All content within the Programme — including but not limited to videos, workbooks, frameworks, the ALIVE Method™, and The Aligned Woman Blueprint™ name — is the exclusive intellectual property of The Aligned Woman (Pty) Ltd.

You may not reproduce, redistribute, share, sell, or otherwise use any Programme content outside of your personal use. This includes sharing login credentials or content with third parties.`,
  },
  {
    title: "6. Programme Access",
    content: `Upon successful payment, you will receive access to the Programme platform within 24 hours.

Access is granted to a single user only and is non-transferable. You must not share your login details with any other person.

We reserve the right to suspend or revoke access without refund in the event of:
• Breach of these Terms and Conditions
• Abusive, harassing or harmful behaviour toward other participants or the team
• Sharing of programme content in violation of our intellectual property rights`,
  },
  {
    title: "7. Community Standards",
    content: `By participating in the Programme, you agree to uphold the following community standards:

• Treat all participants, facilitators and experts with respect and dignity
• Maintain confidentiality — what is shared in the community stays in the community
• No promotional or spam content in community spaces
• No hateful, discriminatory or harmful language or behaviour

Violation of community standards may result in removal from the Programme without refund.`,
  },
  {
    title: "8. Disclaimer",
    content: `The Aligned Woman Blueprint™ is a transformational personal development programme. It is not a substitute for professional medical, psychological, legal or financial advice.

Results will vary between individuals. We do not guarantee specific outcomes. Testimonials shared are individual experiences and are not typical results.`,
  },
  {
    title: "9. Limitation of Liability",
    content: `To the maximum extent permitted by law, The Aligned Woman (Pty) Ltd shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of or inability to use the Programme, even if we have been advised of the possibility of such damages.

Our total liability in any event shall not exceed the amount you paid for the Programme.`,
  },
  {
    title: "10. Privacy & Data",
    content: `We collect and process your personal data in accordance with our Privacy Policy. By purchasing the Programme, you consent to us storing your contact information and using it to provide the Programme and relevant communications.

We will never sell your data to third parties. You may unsubscribe from marketing communications at any time.`,
  },
  {
    title: "11. Governing Law",
    content: `These Terms and Conditions are governed by the laws of South Africa. Any disputes arising from these Terms and Conditions shall be subject to the exclusive jurisdiction of the courts of South Africa.`,
  },
  {
    title: "12. Changes to Terms",
    content: `We reserve the right to amend these Terms and Conditions at any time. Material changes will be communicated to enrolled participants via email. Your continued participation in the Programme following notification of changes constitutes acceptance of the updated Terms.`,
  },
  {
    title: "13. Contact",
    content: `If you have any questions about these Terms and Conditions, please contact us:

The Aligned Woman (Pty) Ltd
Email: hello@thealignedwoman.com
Website: www.thealignedwoman.com`,
  },
];

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDF5F3] via-white to-[#F5E8EE]">
      {/* Header */}
      <div className="bg-[#6E1D40] text-white py-16 px-4 text-center">
        <p className="text-[#E8B4AE] font-semibold tracking-widest uppercase text-sm mb-4">Legal</p>
        <h1 className="text-4xl md:text-5xl font-serif mb-4">Terms & Conditions</h1>
        <p className="text-white/70">The Aligned Woman Blueprint™</p>
        <p className="text-white/50 text-sm mt-3">Last updated: 30 April 2026</p>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-16">
        {/* Intro Banner */}
        <div className="bg-[#FDF5F3] border border-[#E8B4AE] rounded-2xl p-6 mb-12">
          <p className="text-[#6E1D40] font-semibold mb-2">Please read these terms carefully.</p>
          <p className="text-gray-600 text-sm leading-relaxed">
            These Terms and Conditions form a legally binding agreement between you and The Aligned Woman (Pty) Ltd. By purchasing or participating in the Programme, you confirm that you have read, understood and agree to these terms.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.title} className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-xl font-serif text-[#6E1D40] mb-4">{section.title}</h2>
              <div className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                {section.content}
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 mb-6">Questions about our Terms?</p>
          <Link
            to="/contact?type=general"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#6E1D40] text-white font-semibold rounded-xl hover:bg-[#5A1633] transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}