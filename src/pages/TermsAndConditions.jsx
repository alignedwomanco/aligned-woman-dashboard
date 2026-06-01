import React from "react";
import { Link } from "react-router-dom";
import LandingFooter from "@/components/home/LandingFooter";

const SECTIONS = [
  {
    num: "1",
    title: "Company Information",
    content: (
      <div className="space-y-2">
        <p>ALIGNED WOMAN LTD</p>
        <p>Registered in England and Wales</p>
        <p>Incorporated under the Companies Act 2006</p>
        <p>For the purposes of data protection law, ALIGNED WOMAN LTD is the Data Controller.</p>
      </div>
    ),
  },
  {
    num: "2",
    title: "Educational Purpose Only",
    content: (
      <p>All content provided by The Aligned Woman is intended for educational and informational purposes only. The Aligned Woman does not provide medical advice, mental health treatment, psychotherapy, counselling, diagnosis, or crisis support. Nothing within our programmes, courses, quizzes, materials, or community spaces should be interpreted as a substitute for professional medical, psychological, psychiatric, or therapeutic care.</p>
    ),
  },
  {
    num: "3",
    title: "Not Therapy, Not Diagnosis",
    content: (
      <div className="space-y-4">
        <p>Participation in any Aligned Woman programme, course, quiz, or experience does not constitute therapy, counselling, or a therapeutic relationship of any kind.</p>
        <p>While some contributors may be qualified healthcare practitioners, therapists, or clinicians in their professional capacity, their participation within The Aligned Woman platform is strictly educational in nature.</p>
        <p className="font-semibold" style={{ color: "#6B1B3D" }}>We do not:</p>
        <ul className="space-y-2 pl-4">
          <li style={{ borderLeft: "2px solid #C4866C", paddingLeft: "1rem" }}>Diagnose physical or mental health conditions</li>
          <li style={{ borderLeft: "2px solid #C4866C", paddingLeft: "1rem" }}>Provide treatment plans or clinical interventions</li>
          <li style={{ borderLeft: "2px solid #C4866C", paddingLeft: "1rem" }}>Replace care from a licensed healthcare or mental health professional</li>
        </ul>
        <p>If you have concerns about your physical health, mental health, or emotional wellbeing, you are encouraged to seek support from a qualified professional.</p>
      </div>
    ),
  },
  {
    num: "4",
    title: "Quizzes, Screenings & Self-Assessment Tools",
    content: (
      <div className="space-y-4">
        <p>Any quizzes, questionnaires, or self-assessment tools (including but not limited to hormone, nervous system, or PMDD awareness tools) are provided for educational awareness only.</p>
        <p className="font-semibold" style={{ color: "#6B1B3D" }}>They:</p>
        <ul className="space-y-2 pl-4">
          <li style={{ borderLeft: "2px solid #C4866C", paddingLeft: "1rem" }}>Are not diagnostic tools</li>
          <li style={{ borderLeft: "2px solid #C4866C", paddingLeft: "1rem" }}>Do not provide medical or psychological diagnoses</li>
          <li style={{ borderLeft: "2px solid #C4866C", paddingLeft: "1rem" }}>Are not a substitute for professional assessment</li>
        </ul>
        <p>Results should be interpreted as informational and may highlight patterns worth discussing with a qualified professional.</p>
      </div>
    ),
  },
  {
    num: "5",
    title: "Personal Responsibility",
    content: (
      <div className="space-y-4">
        <p>By participating in The Aligned Woman, you acknowledge and agree that:</p>
        <ul className="space-y-2 pl-4">
          <li style={{ borderLeft: "2px solid #C4866C", paddingLeft: "1rem" }}>You are responsible for your own physical, emotional, and mental wellbeing</li>
          <li style={{ borderLeft: "2px solid #C4866C", paddingLeft: "1rem" }}>You choose how and whether to apply any information provided</li>
          <li style={{ borderLeft: "2px solid #C4866C", paddingLeft: "1rem" }}>You engage with the content at your own pace and discretion</li>
        </ul>
        <p>Personal growth and self-reflection may bring up emotions or insights. You agree to seek appropriate professional or personal support if needed.</p>
      </div>
    ),
  },
  {
    num: "6",
    title: "No Guarantees",
    content: (
      <p>The Aligned Woman does not guarantee specific outcomes, results, or transformations. Any examples, testimonials, or case studies shared are illustrative only and do not promise similar results. Individual experiences vary based on personal circumstances, readiness, and engagement.</p>
    ),
  },
  {
    num: "7",
    title: "Scope of Practice",
    content: (
      <p>The Aligned Woman operates as an education and learning platform. Participation does not create a practitioner–client, therapist–client, doctor–patient, or coach–client relationship unless explicitly stated and contracted outside of The Aligned Woman platform.</p>
    ),
  },
  {
    num: "8",
    title: "Emotional Safety & Self-Pacing",
    content: (
      <div className="space-y-4">
        <p>You agree to:</p>
        <ul className="space-y-2 pl-4">
          <li style={{ borderLeft: "2px solid #C4866C", paddingLeft: "1rem" }}>Engage with content in a way that feels safe and appropriate for you</li>
          <li style={{ borderLeft: "2px solid #C4866C", paddingLeft: "1rem" }}>Pause or step back if content feels overwhelming</li>
          <li style={{ borderLeft: "2px solid #C4866C", paddingLeft: "1rem" }}>Respect your own boundaries and nervous system capacity</li>
        </ul>
        <p>The Aligned Woman is not responsible for emotional distress arising from self-inquiry, reflection, or participation.</p>
      </div>
    ),
  },
  {
    num: "9",
    title: "Community Conduct",
    content: (
      <div className="space-y-4">
        <p>If you participate in any community spaces (online or in person), you agree to:</p>
        <ul className="space-y-2 pl-4">
          <li style={{ borderLeft: "2px solid #C4866C", paddingLeft: "1rem" }}>Treat others with respect, confidentiality, and care</li>
          <li style={{ borderLeft: "2px solid #C4866C", paddingLeft: "1rem" }}>Avoid giving medical, therapeutic, or diagnostic advice to others</li>
          <li style={{ borderLeft: "2px solid #C4866C", paddingLeft: "1rem" }}>Respect diversity of experience, background, and belief</li>
        </ul>
        <p>The Aligned Woman reserves the right to remove participants who breach community standards.</p>
      </div>
    ),
  },
  {
    num: "10",
    title: "Intellectual Property",
    content: (
      <p>All materials, content, videos, exercises, frameworks, text, graphics, and resources provided by The Aligned Woman are the intellectual property of ALIGNED WOMAN LTD or its contributors. You may not copy, reproduce, distribute, resell, or create derivative works without prior written permission.</p>
    ),
  },
  {
    num: "11",
    title: "Payments, Pricing & Access",
    content: (
      <p>Pricing, payment terms, access periods, and any payment plan options are clearly stated at the point of registration or purchase. By enrolling, you agree to the pricing and payment terms in effect at the time of sign-up. Access to content may be suspended or revoked if payment obligations are not met.</p>
    ),
  },
  {
    num: "12",
    title: "Refunds & Cancellations",
    content: (
      <p>Refund policies, if applicable, are outlined at the point of purchase and form part of these Terms & Conditions. Unless otherwise stated, digital content and access-based programmes are non-refundable once access has been granted.</p>
    ),
  },
  {
    num: "13",
    title: "Limitation of Liability",
    content: (
      <p>To the fullest extent permitted by law, The Aligned Woman, its founders, contributors, partners, and affiliates are not liable for any loss, injury, or damages arising from participation in our programmes or use of our content, including but not limited to emotional distress, financial loss, or personal decisions made as a result of the information provided.</p>
    ),
  },
];

const DATA_SECTIONS = [
  {
    num: "14",
    title: "What Personal Data We Collect",
    content: (
      <div className="space-y-4">
        <p>When you sign up for The Aligned Woman or any affiliated programme, we may collect:</p>
        <ul className="space-y-2 pl-4">
          {["Name", "Email address", "Country, city, or general location", "Age range", "Payment preference", "Programme participation details", "Information you voluntarily provide through forms or questionnaires"].map(item => (
            <li key={item} style={{ borderLeft: "2px solid #C4866C", paddingLeft: "1rem" }}>{item}</li>
          ))}
        </ul>
        <p>We do not intentionally collect medical records or diagnostic data.</p>
      </div>
    ),
  },
  {
    num: "15",
    title: "How We Use Your Data",
    content: (
      <div className="space-y-4">
        <p>Your data is used to:</p>
        <ul className="space-y-2 pl-4">
          {["Register you for programmes, courses, or events", "Communicate with you about enrolment and participation", "Provide access to content or platforms", "Improve services and user experience", "Meet legal or regulatory obligations"].map(item => (
            <li key={item} style={{ borderLeft: "2px solid #C4866C", paddingLeft: "1rem" }}>{item}</li>
          ))}
        </ul>
        <p>We do not sell personal data.</p>
      </div>
    ),
  },
  {
    num: "16",
    title: "Legal Basis for Processing (UK GDPR)",
    content: (
      <div className="space-y-4">
        <p>We process personal data under the following lawful bases:</p>
        <ul className="space-y-2 pl-4">
          {["Consent", "Contractual necessity", "Legitimate interest", "Legal obligation"].map(item => (
            <li key={item} style={{ borderLeft: "2px solid #C4866C", paddingLeft: "1rem" }}>{item}</li>
          ))}
        </ul>
        <p>You may withdraw consent at any time.</p>
      </div>
    ),
  },
  {
    num: "17",
    title: "Data Storage & Security",
    content: (
      <p>We take appropriate technical and organisational measures to protect your data. Access is limited to authorised personnel and trusted service providers only. No system can be guaranteed 100% secure, but reasonable safeguards are in place.</p>
    ),
  },
  {
    num: "18",
    title: "Data Sharing",
    content: (
      <div className="space-y-4">
        <p>Limited data may be shared with trusted third parties for operational purposes such as:</p>
        <ul className="space-y-2 pl-4">
          {["Email communications", "Website or course hosting", "Payment processing (once active)"].map(item => (
            <li key={item} style={{ borderLeft: "2px solid #C4866C", paddingLeft: "1rem" }}>{item}</li>
          ))}
        </ul>
        <p>All third parties are required to comply with data protection standards.</p>
      </div>
    ),
  },
  {
    num: "19",
    title: "International Data Transfers",
    content: (
      <p>Some service providers may store data outside the UK or EEA. Where this occurs, appropriate safeguards are used in accordance with UK GDPR.</p>
    ),
  },
  {
    num: "20",
    title: "Your Rights",
    content: (
      <div className="space-y-4">
        <p>You have the right to:</p>
        <ul className="space-y-2 pl-4">
          {["Access your data", "Request corrections", "Request deletion", "Restrict or object to processing", "Withdraw consent", "Request data portability"].map(item => (
            <li key={item} style={{ borderLeft: "2px solid #C4866C", paddingLeft: "1rem" }}>{item}</li>
          ))}
        </ul>
        <p>Requests can be made via the website contact form.</p>
      </div>
    ),
  },
  {
    num: "21",
    title: "Cookies & Analytics",
    content: (
      <p>The website may use cookies or analytics tools to improve functionality and performance. You can manage cookies through your browser settings.</p>
    ),
  },
  {
    num: "22",
    title: "Data Retention",
    content: (
      <p>Personal data is retained only for as long as necessary to fulfil its purpose or comply with legal obligations.</p>
    ),
  },
  {
    num: "23",
    title: "Changes to These Terms",
    content: (
      <p>We may update these Terms & Conditions from time to time. Continued use of the platform constitutes acceptance of the updated terms.</p>
    ),
  },
  {
    num: "24",
    title: "Contact",
    content: (
      <p>For questions regarding these Terms & Conditions or data protection, please contact us via the website contact form.</p>
    ),
  },
];

export default function TermsAndConditions() {
  return (
    <div style={{ background: "#FAF5F3", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "#6B1B3D", padding: "clamp(60px,10vw,100px) clamp(24px,6vw,80px) clamp(40px,6vw,60px)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(196,134,108,0.7)", marginBottom: 16 }}>
            The Aligned Woman
          </p>
          <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2.5rem,6vw,4rem)", color: "#fff", fontWeight: 400, lineHeight: 1.15, marginBottom: 20 }}>
            Terms &amp; Conditions
          </h1>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>
            Last updated: 7 January 2026
          </p>
        </div>
      </div>

      {/* Intro */}
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(107,27,61,0.08)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "clamp(32px,5vw,56px) clamp(24px,6vw,80px)" }}>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 15, fontWeight: 400, lineHeight: 1.8, color: "#4A2030" }}>
            These Terms & Conditions apply to all programmes, courses, digital content, live or recorded sessions, events, quizzes, community spaces, and resources offered by The Aligned Woman and its affiliated offerings, including but not limited to The Aligned Woman Blueprint.
          </p>
          <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: "italic", fontSize: "clamp(1.1rem,2.5vw,1.4rem)", color: "#C4866C", marginTop: 20 }}>
            By accessing, registering for, or participating in any Aligned Woman offering, you agree to these Terms & Conditions.
          </p>
        </div>
      </div>

      {/* Main Sections */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "clamp(48px,8vw,80px) clamp(24px,6vw,80px)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          {SECTIONS.map((s) => (
            <div key={s.num} style={{ borderBottom: "1px solid rgba(107,27,61,0.08)", paddingBottom: 40 }}>
              <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: 700, color: "#C4866C", minWidth: 28, marginTop: 4 }}>
                  {s.num}.
                </span>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontFamily: "Montserrat, sans-serif", fontSize: 13, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B1B3D", marginBottom: 16 }}>
                    {s.title}
                  </h2>
                  <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, fontWeight: 300, lineHeight: 1.85, color: "#4A2030" }}>
                    {s.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Data Protection divider */}
        <div style={{ margin: "64px 0 48px", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(107,27,61,0.15)" }} />
            <div>
              <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: "#C4866C", marginBottom: 6 }}>
                Section Two
              </p>
              <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(1.6rem,4vw,2.4rem)", color: "#6B1B3D", fontWeight: 400 }}>
                Data Protection &amp; Privacy
              </h2>
            </div>
            <div style={{ flex: 1, height: 1, background: "rgba(107,27,61,0.15)" }} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          {DATA_SECTIONS.map((s) => (
            <div key={s.num} style={{ borderBottom: "1px solid rgba(107,27,61,0.08)", paddingBottom: 40 }}>
              <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: 700, color: "#C4866C", minWidth: 28, marginTop: 4 }}>
                  {s.num}.
                </span>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontFamily: "Montserrat, sans-serif", fontSize: 13, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B1B3D", marginBottom: 16 }}>
                    {s.title}
                  </h2>
                  <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, fontWeight: 300, lineHeight: 1.85, color: "#4A2030" }}>
                    {s.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Back to top */}
        <div style={{ textAlign: "center", marginTop: 64 }}>
          <Link
            to="/"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#6B1B3D",
              textDecoration: "none",
              borderBottom: "1px solid rgba(107,27,61,0.3)",
              paddingBottom: 2,
            }}
          >
            ← Return Home
          </Link>
        </div>
      </div>
      <LandingFooter />
    </div>
  );
}