import React from "react";

const sans = "Montserrat, sans-serif";
const C = { white: "#FFFFFF", warmGrey: "#C8B8B4" };

const MEDIA_LOGOS = [
  { name: "CNBC Africa", url: "https://media.base44.com/images/public/69f46886a412ee042303f1af/620d9770c_0a5612a9e_logo-cnbc-africa1.png" },
  { name: "Business Report", url: "https://media.base44.com/images/public/69f46886a412ee042303f1af/175069de5_bf555cefa_logo-business-report.png" },
  { name: "Cape Talk", url: "https://media.base44.com/images/public/69f46886a412ee042303f1af/5039003a6_054134b1f_logo-cape-talk.png", large: true },
  { name: "Good Hope FM", url: "https://media.base44.com/images/public/69f46886a412ee042303f1af/7ff39ba65_90980351c_logo-good-hope-fm.png", large: true },
  { name: "Health Matters", url: "https://media.base44.com/images/public/69f46886a412ee042303f1af/cfcbee2af_88f86edb9_logo-health-matters.png" },
  { name: "Sunday Times", url: "https://media.base44.com/images/public/69f46886a412ee042303f1af/bf265e972_dddb06872_logo-sunday-times.png", large: true },
];

export default function AsSeenIn() {
  return (
    <section
      className="py-10 px-6 md:px-8"
      style={{ background: C.white, borderBottom: "1px solid rgba(74,14,46,0.06)" }}
    >
      <div className="max-w-[1100px] mx-auto">
        <p
          className="text-center text-[10px] font-semibold uppercase tracking-[0.22em] mb-8"
          style={{ fontFamily: sans, color: C.warmGrey }}
        >
          As Seen In
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {MEDIA_LOGOS.map((logo) => (
            <img
              key={logo.name}
              src={logo.url}
              alt={logo.name}
              className="object-contain"
              style={{
                height: logo.large ? 156 : 52,
                maxWidth: logo.large ? 540 : 180,
                opacity: 0.85,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}