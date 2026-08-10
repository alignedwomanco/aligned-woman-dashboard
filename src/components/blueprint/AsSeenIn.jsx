import React from "react";

const sans = "Montserrat, sans-serif";
const C = { white: "#FFFFFF", warmGrey: "#C8B8B4" };

const MEDIA_LOGOS = [
  { name: "Sunday Times", url: "https://media.base44.com/images/public/69f46886a412ee042303f1af/bf265e972_dddb06872_logo-sunday-times.png", large: true },
  { name: "CNBC Africa", url: "https://media.base44.com/images/public/69f46886a412ee042303f1af/620d9770c_0a5612a9e_logo-cnbc-africa1.png" },
  { name: "Business Report", url: "https://media.base44.com/images/public/69f46886a412ee042303f1af/175069de5_bf555cefa_logo-business-report.png" },
  { name: "Cape Talk", url: "https://media.base44.com/images/public/69f46886a412ee042303f1af/5039003a6_054134b1f_logo-cape-talk.png" },
  { name: "Good Hope FM", url: "https://media.base44.com/images/public/69f46886a412ee042303f1af/7ff39ba65_90980351c_logo-good-hope-fm.png", large: true },
  { name: "Health Matters", url: "https://media.base44.com/images/public/69f46886a412ee042303f1af/cfcbee2af_88f86edb9_logo-health-matters.png" },
];

// Duplicate the set so the marquee can loop seamlessly without a visible jump.
const LOOP_LOGOS = [...MEDIA_LOGOS, ...MEDIA_LOGOS];

const logoStyle = (large) => ({
  height: large ? 156 : 52,
  maxWidth: large ? 540 : 180,
  opacity: 0.85,
  flexShrink: 0,
});

export default function AsSeenIn() {
  return (
    <section
      className="py-10 px-6 md:px-8"
      style={{ background: C.white, borderBottom: "1px solid rgba(74,14,46,0.06)" }}
    >
      <style>{`
        @keyframes asseenin-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        /* Auto-scroll only on mobile and tablet; desktop stays static + centered. */
        @media (max-width: 1024px) {
          .asSeenInMarquee {
            overflow: hidden;
            -webkit-mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent);
            mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent);
          }
          .asSeenInTrack {
            display: flex;
            align-items: center;
            gap: 48px;
            width: max-content;
            animation: asseenin-marquee 30s linear infinite;
          }
          .asSeenInTrack:hover { animation-play-state: paused; }
        }
      `}</style>

      <div className="max-w-[1100px] mx-auto">
        <p
          className="text-center text-[10px] font-semibold uppercase tracking-[0.22em] mb-8"
          style={{ fontFamily: sans, color: C.warmGrey }}
        >
          As Seen In
        </p>

        {/* Desktop: static centered row */}
        <div className="hidden lg:flex flex-nowrap items-center justify-center gap-12 overflow-x-auto">
          {MEDIA_LOGOS.map((logo) => (
            <img
              key={logo.name}
              src={logo.url}
              alt={logo.name}
              className="object-contain"
              style={logoStyle(logo.large)}
            />
          ))}
        </div>

        {/* Mobile & tablet: auto-scrolling marquee */}
        <div className="asSeenInMarquee lg:hidden" aria-hidden="true">
          <div className="asSeenInTrack">
            {LOOP_LOGOS.map((logo, i) => (
              <img
                key={`${logo.name}-${i}`}
                src={logo.url}
                alt={logo.name}
                className="object-contain"
                style={logoStyle(logo.large)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}