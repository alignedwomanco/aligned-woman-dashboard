import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { createPageUrl } from "@/utils";
import LandingFooter from "@/components/home/LandingFooter";

// ────────────────────────────────────────────────────────────────
// The Aligned Woman Standard · public page at /theawstandard.
//
// PUBLIC on purpose: the AW Verified seal on practitioners' own
// sites links here, so this page must open without a login wall.
// It renders its own light chrome (no member sidebar).
//
// Copy source: the approved Standard design (Version 1, 2026),
// carried verbatim. Visual treatment follows the approved design:
// warm peach page gradient, solid cream cards, plum starburst seal
// with a small rose checkmark badge, and the "Download the Standard
// in full (PDF)" inline link (styled but not wired until the PDF
// exists, so there are no dead ends).
// ────────────────────────────────────────────────────────────────

const FIVE_CHECKS = [
  {
    title: "Qualifications, with proof",
    body: "She has told us her training, certifications, and credentials, and we have seen the paper. Not a bio claim. The actual certificates.",
  },
  {
    title: "Registration, where her profession requires it",
    body: "If her field registers with a professional body or council, we have her registration number and we have checked it is current. For businesses, that includes company registration, country, and directors on record.",
  },
  {
    title: "A real conversation",
    body: "We speak to every applicant before the mark is granted. Not a form review, a conversation. How she works, who she serves, and whether her way of working belongs among women who came here to be treated well.",
  },
  {
    title: "A signed commitment to how women are treated",
    body: "Every Verified practitioner signs The Aligned Woman Code of Care: clear pricing, honest claims, respect for a woman's pace and consent, and no pressure tactics, ever. Not a box ticked in passing. A document with her name on it, and breaking it is grounds for losing the mark.",
  },
  {
    title: "Standing that stays current",
    body: "Verification carries the year it was granted and is renewed annually. The mark means she meets the Standard now, not that she once did.",
  },
];

// Design palette
const PAGE_BG = "linear-gradient(180deg, #F4EBE7 0%, #F9F2EF 100%)";
const CARD_BG = "#FCFAF9";
const INK = "#3E1E26"; // primary plum
const INK_SOFT = "#7E726F"; // muted brown
const LABEL = "#A68D89"; // section label
const SEAL_DARK = "#3E1E26";
const SEAL_ROSE = "#BA928A";
const CTA_GRAD = "linear-gradient(135deg, #5C4349 0%, #382A2E 100%)";

const CARD = "rounded-2xl shadow-[0_8px_30px_rgba(62,30,38,0.06)]";

// The approved AW Verified seal image (16-point plum starburst with
// AW / VERIFIED / 2026 and a rose checkmark badge).
const SEAL_IMAGE_URL =
  "https://media.base44.com/images/public/69f46886a412ee042303f1af/c01141aed_aw-verified-seal.png";

function AWSeal({ size = 128 }) {
  return (
    <img
      src={SEAL_IMAGE_URL}
      alt="AW Verified seal"
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}

// Small inline "AW VERIFIED" pill with a checkmark dot, per the design.
function AWVerifiedPill() {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="inline-flex items-center justify-center rounded-full"
        style={{ width: 18, height: 18, background: SEAL_DARK }}
      >
        <Check style={{ width: 11, height: 11, color: "#fff", strokeWidth: 3 }} />
      </span>
      <span
        className="font-body font-bold uppercase"
        style={{ fontSize: 11, letterSpacing: "0.22em", color: INK }}
      >
        AW Verified
      </span>
    </span>
  );
}

export default function TheAWStandard() {
  return (
    <div className="min-h-screen pt-20" style={{ background: PAGE_BG }}>
      <main className="max-w-3xl mx-auto px-5 md:px-6 py-12 space-y-8">
        {/* Header + seal */}
        <section className={`${CARD} p-6 md:p-10`} style={{ background: CARD_BG }}>
          <p
            className="font-body font-bold uppercase mb-3"
            style={{ fontSize: 10, letterSpacing: "0.22em", color: LABEL }}
          >
            The Aligned Woman Standard · 2026
          </p>
          <h1
            className="font-display leading-tight mb-5"
            style={{ fontSize: 34, color: INK }}
          >
            What AW Verified actually means.
          </h1>
          <p
            className="font-body leading-relaxed mb-4 max-w-2xl"
            style={{ fontSize: 14, color: INK_SOFT }}
          >
            Anyone can call herself an expert online. That is exactly the problem this
            platform exists to solve. So when you see the AW Verified mark, we want you to
            know precisely what stands behind it, because trust that cannot be explained is
            not trust, it is branding.
          </p>
          <p
            className="font-body leading-relaxed mb-7 max-w-2xl"
            style={{ fontSize: 13, color: INK_SOFT }}
          >
            This is Version 1 of the Standard. We review it annually, and when it changes,
            every Verified practitioner is held to the new version at her next renewal.{" "}
            <span
              className="font-bold underline underline-offset-2"
              style={{ color: INK }}
            >
              Download the Standard in full (PDF)
            </span>
          </p>
          <div className="flex items-center gap-5 flex-wrap">
            <AWSeal size={132} />
            <div className="hidden sm:block">
              <AWVerifiedPill />
            </div>
          </div>
        </section>

        {/* Five checks */}
        <section className={`${CARD} p-6 md:p-10`} style={{ background: CARD_BG }}>
          <p
            className="font-body font-semibold mb-7"
            style={{ fontSize: 12.5, color: LABEL }}
          >
            — Every AW Verified practitioner and business has passed five checks
          </p>
          <ol className="space-y-7">
            {FIVE_CHECKS.map((check, i) => (
              <li
                key={check.title}
                className="flex gap-5 pb-7 last:pb-0"
                style={{ borderBottom: i < FIVE_CHECKS.length - 1 ? `1px solid ${SEAL_DARK}12` : "none" }}
              >
                <span
                  className="font-display italic leading-none flex-shrink-0 w-7 text-right"
                  style={{ fontSize: 26, color: SEAL_ROSE }}
                >
                  {i + 1}
                </span>
                <div>
                  <p className="font-display mb-2" style={{ fontSize: 18, color: INK }}>
                    {check.title}
                  </p>
                  <p
                    className="font-body leading-relaxed"
                    style={{ fontSize: 13.5, color: INK_SOFT }}
                  >
                    {check.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* What the mark does not promise */}
        <section className={`${CARD} p-6 md:p-10`} style={{ background: CARD_BG }}>
          <h2 className="font-display mb-4" style={{ fontSize: 24, color: INK }}>
            And what the mark does not promise
          </h2>
          <p
            className="font-body leading-relaxed mb-5"
            style={{ fontSize: 13.5, color: INK_SOFT }}
          >
            We believe trust is built by being honest about edges, so here are ours. AW
            Verification confirms credentials, registration, and conduct at the time of
            review; it is not a guarantee of outcomes, and it is not medical, psychological,
            legal, or financial advice by us. The work she does with you remains her work,
            under her professional responsibility.
          </p>
          <p
            className="font-display italic leading-relaxed"
            style={{ fontSize: 16, color: INK }}
          >
            What we promise is this: we checked, we keep checking, and if she falls short of
            the Standard, we act.
          </p>
        </section>

        {/* Complaints process */}
        <section className={`${CARD} p-6 md:p-10`} style={{ background: CARD_BG }}>
          <p
            className="font-body font-bold uppercase mb-3"
            style={{ fontSize: 10, letterSpacing: "0.22em", color: LABEL }}
          >
            The AW Standard Complaints Process
          </p>
          <h2 className="font-display mb-4" style={{ fontSize: 24, color: INK }}>
            If a Verified practitioner falls short
          </h2>
          <p
            className="font-body leading-relaxed mb-5"
            style={{ fontSize: 13.5, color: INK_SOFT }}
          >
            Tell us. Every report is read by our team, treated in confidence, and
            investigated against the Standard and the Code of Care she signed. Where either
            has been broken, we can suspend or remove the AW Verified mark, and we have done
            the vetting so that we rarely have to.
          </p>
          <ul className="space-y-3">
            {[
              <>
                Report concerns to{" "}
                <a
                  href="mailto:hello@alignedwoman.com"
                  className="underline underline-offset-2"
                  style={{ color: INK }}
                >
                  hello@alignedwoman.com
                </a>{" "}
                or through Support, wherever you are in the app.
              </>,
              "You will hear back from a person. We do not close reports with a template.",
              "Removal of the mark is our decision, made to protect the women on this platform.",
            ].map((item, i) => (
              <li
                key={i}
                className="flex gap-3 font-body leading-relaxed"
                style={{ fontSize: 13, color: INK_SOFT }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2"
                  style={{ background: SEAL_ROSE }}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA band */}
        <section
          className="rounded-2xl text-white p-6 md:p-10"
          style={{ background: CTA_GRAD }}
        >
          <h2 className="font-display leading-tight mb-4" style={{ fontSize: 26 }}>
            For you, and for the women who serve you
          </h2>
          <p
            className="font-body leading-relaxed mb-3 max-w-2xl"
            style={{ fontSize: 13.5, color: "rgba(255,255,255,0.9)" }}
          >
            If you are here to find help: look for the mark. It means we did the checking so
            you do not have to.
          </p>
          <p
            className="font-body leading-relaxed mb-7 max-w-2xl"
            style={{ fontSize: 13.5, color: "rgba(255,255,255,0.9)" }}
          >
            If you are a practitioner or a woman-owned business and your work can stand in
            front of this Standard, we would love to meet you.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to={createPageUrl("ExpertsDirectory")}
              className="inline-flex items-center justify-center gap-2 rounded-full font-body font-bold uppercase transition-colors duration-200 hover:opacity-90"
              style={{
                background: SEAL_ROSE,
                color: "#fff",
                fontSize: 11,
                letterSpacing: "0.22em",
                padding: "14px 28px",
              }}
            >
              <span
                className="inline-flex items-center justify-center rounded-full"
                style={{ width: 16, height: 16, background: "rgba(255,255,255,0.25)" }}
              >
                <Check style={{ width: 10, height: 10, color: "#fff", strokeWidth: 3 }} />
              </span>
              Browse AW Verified practitioners <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/Apply"
              className="inline-flex items-center justify-center gap-2 rounded-full font-body font-bold uppercase transition-colors duration-200 hover:bg-white/15"
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.4)",
                color: "#fff",
                fontSize: 11,
                letterSpacing: "0.22em",
                padding: "14px 28px",
              }}
            >
              Apply to become AW Verified
            </Link>
          </div>
        </section>

        {/* Legal fine print */}
        <section className={`${CARD} p-6 md:p-8`} style={{ background: CARD_BG }}>
          <p
            className="font-body leading-relaxed"
            style={{ fontSize: 11, color: "rgba(126,114,111,0.85)" }}
          >
            AW Verified and The Aligned Woman Standard are marks of The Aligned Woman Co.
            This page describes Version 1 of the Standard, reviewed annually. Verification
            reflects our review of credentials, registration, and conduct at the time of
            assessment and at each renewal, and each Verified practitioner's signed Aligned
            Woman Code of Care. It does not constitute an endorsement of specific outcomes
            or a professional referral. The Standard, and any practitioner's Verified
            status, may be updated or withdrawn at our discretion to protect our members.
          </p>
        </section>

      </main>

      <LandingFooter />
    </div>
  );
}