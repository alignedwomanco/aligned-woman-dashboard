import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { createPageUrl } from "@/utils";

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

// The approved AW Verified seal: 16-point plum starburst with
// AW / VERIFIED / 2026 centred, and a small rose checkmark badge
// overlapping the bottom-right.
function AWSeal({ size = 128 }) {
  const badge = size * 0.34;
  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 160 160"
        width={size}
        height={size}
        aria-label="AW Verified seal"
      >
        <path
          d="M155.0,80.0L154.6,82.0L153.6,83.9L151.9,85.7L149.8,87.3L147.4,88.9L145.0,90.3L142.8,91.6L141.0,93.0L139.6,94.3L138.9,95.8L138.8,97.4L139.3,99.3L140.2,101.3L141.5,103.6L142.8,106.0L144.1,108.5L145.1,111.0L145.6,113.4L145.6,115.6L145.0,117.5L143.7,119.0L141.8,120.1L139.4,120.8L136.8,121.2L133.9,121.4L131.2,121.4L128.6,121.5L126.3,121.7L124.5,122.2L123.1,123.1L122.2,124.5L121.7,126.3L121.5,128.6L121.4,131.2L121.4,133.9L121.2,136.8L120.8,139.4L120.1,141.8L119.0,143.7L117.5,145.0L115.6,145.6L113.4,145.6L111.0,145.1L108.5,144.1L106.0,142.8L103.6,141.5L101.3,140.2L99.3,139.3L97.4,138.8L95.8,138.9L94.3,139.6L93.0,141.0L91.6,142.8L90.3,145.0L88.9,147.4L87.3,149.8L85.7,151.9L83.9,153.6L82.0,154.6L80.0,155.0L78.0,154.6L76.1,153.6L74.3,151.9L72.7,149.8L71.1,147.4L69.7,145.0L68.4,142.8L67.0,141.0L65.7,139.6L64.2,138.9L62.6,138.8L60.7,139.3L58.7,140.2L56.4,141.5L54.0,142.8L51.5,144.1L49.0,145.1L46.6,145.6L44.4,145.6L42.5,145.0L41.0,143.7L39.9,141.8L39.2,139.4L38.8,136.8L38.6,133.9L38.6,131.2L38.5,128.6L38.3,126.3L37.8,124.5L36.9,123.1L35.5,122.2L33.7,121.7L31.4,121.5L28.8,121.4L26.1,121.4L23.2,121.2L20.6,120.8L18.2,120.1L16.3,119.0L15.0,117.5L14.4,115.6L14.4,113.4L14.9,111.0L15.9,108.5L17.2,106.0L18.5,103.6L19.8,101.3L20.7,99.3L21.2,97.4L21.1,95.8L20.4,94.3L19.0,93.0L17.2,91.6L15.0,90.3L12.6,88.9L10.2,87.3L8.1,85.7L6.4,83.9L5.4,82.0L5.0,80.0L5.4,78.0L6.4,76.1L8.1,74.3L10.2,72.7L12.6,71.1L15.0,69.7L17.2,68.4L19.0,67.0L20.4,65.7L21.1,64.2L21.2,62.6L20.7,60.7L19.8,58.7L18.5,56.4L17.2,54.0L15.9,51.5L14.9,49.0L14.4,46.6L14.4,44.4L15.0,42.5L16.3,41.0L18.2,39.9L20.6,39.2L23.2,38.8L26.1,38.6L28.8,38.6L31.4,38.5L33.7,38.3L35.5,37.8L36.9,36.9L37.8,35.5L38.3,33.7L38.5,31.4L38.6,28.8L38.6,26.1L38.8,23.2L39.2,20.6L39.9,18.2L41.0,16.3L42.5,15.0L44.4,14.4L46.6,14.4L49.0,14.9L51.5,15.9L54.0,17.2L56.4,18.5L58.7,19.8L60.7,20.7L62.6,21.2L64.2,21.1L65.7,20.4L67.0,19.0L68.4,17.2L69.7,15.0L71.1,12.6L72.7,10.2L74.3,8.1L76.1,6.4L78.0,5.4L80.0,5.0L82.0,5.4L83.9,6.4L85.7,8.1L87.3,10.2L88.9,12.6L90.3,15.0L91.6,17.2L93.0,19.0L94.3,20.4L95.8,21.1L97.4,21.2L99.3,20.7L101.3,19.8L103.6,18.5L106.0,17.2L108.5,15.9L111.0,14.9L113.4,14.4L115.6,14.4L117.5,15.0L119.0,16.3L120.1,18.2L120.8,20.6L121.2,23.2L121.4,26.1L121.4,28.8L121.5,31.4L121.7,33.7L122.2,35.5L123.1,36.9L124.5,37.8L126.3,38.3L128.6,38.5L131.2,38.6L133.9,38.6L136.8,38.8L139.4,39.2L141.8,39.9L143.7,41.0L145.0,42.5L145.6,44.4L145.6,46.6L145.1,49.0L144.1,51.5L142.8,54.0L141.5,56.4L140.2,58.7L139.3,60.7L138.8,62.6L138.9,64.2L139.6,65.7L141.0,67.0L142.8,68.4L145.0,69.7L147.4,71.1L149.8,72.7L151.9,74.3L153.6,76.1L154.6,78.0L155.0,80.0Z"
          fill={SEAL_DARK}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span
          className="font-display text-white"
          style={{ fontSize: size * 0.3, lineHeight: 1 }}
        >
          AW
        </span>
        <span
          className="font-body font-bold uppercase"
          style={{
            fontSize: size * 0.075,
            letterSpacing: "0.22em",
            color: SEAL_ROSE,
            marginTop: size * 0.04,
          }}
        >
          Verified
        </span>
        <span
          className="font-body font-semibold"
          style={{
            fontSize: size * 0.065,
            letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.7)",
            marginTop: size * 0.02,
          }}
        >
          2026
        </span>
      </div>
      {/* Small rose checkmark badge, bottom-right overlay */}
      <div
        className="absolute flex items-center justify-center rounded-full border-2"
        style={{
          width: badge,
          height: badge,
          right: -badge * 0.12,
          bottom: -badge * 0.12,
          background: SEAL_ROSE,
          borderColor: CARD_BG,
        }}
      >
        <Check
          style={{ width: badge * 0.55, height: badge * 0.55, color: "#fff", strokeWidth: 3 }}
        />
      </div>
    </div>
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
    <div className="min-h-screen" style={{ background: PAGE_BG }}>
      {/* Light public header */}
      <header
        className="px-5 md:px-8 py-5 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${SEAL_DARK}14` }}
      >
        <Link to={createPageUrl("Home")}>
          <p
            className="font-display text-[14px] tracking-[0.1em]"
            style={{ color: INK }}
          >
            THE ALIGNED <span className="italic">WOMAN</span>
          </p>
        </Link>
        <Link
          to="/Apply"
          className="font-body font-semibold text-[12px] transition-colors hover:opacity-70"
          style={{ color: INK_SOFT }}
        >
          Apply to become AW Verified
        </Link>
      </header>

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
    </div>
  );
}