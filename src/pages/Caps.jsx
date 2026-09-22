import React, { useEffect, useState } from "react";
import PayFastForm from "@/components/caps/PayFastForm";
import LandingFooter from "@/components/home/LandingFooter";

/* ------------------------------------------------------------------
   CAMPAIGN SETTINGS
   Everything the campaign needs to change lives here.
------------------------------------------------------------------ */
const PRICE = 350;                 // ZAR per cap
const RUN_SIZE = 200;              // caps in the run
const SOLD = 0;                    // update as orders are paid, or wire to CapOrder later
const SHIPPING = 0;                // courier fee at cost in ZAR; 0 until the courier quote is in
const PAYMENT_LINK = "";           // Stripe or PayFast link. Empty = order saved, payment link sent by email.
const DONATION_LINK = "";          // Women For Change direct donation link
const LEAD_TIME = "7 working days";
const HERO_IMAGE = "https://media.base44.com/images/public/69f46886a412ee042303f1af/11ecf7590_WhatsAppImage2026-09-22at135317.jpeg"; // wide hero shot, desktop and tablet. Empty renders a toned placeholder.
const HERO_IMAGE_MOBILE = "https://media.base44.com/images/public/69f46886a412ee042303f1af/7a30592a5_WhatsAppImage2026-09-22at1115541.jpeg"; // portrait hero shot, phones only.
const BARRON_LOGO = "https://media.base44.com/images/public/69f46886a412ee042303f1af/842e10106_barron-logo.svg";

/* Every cap carries its own colourway: one cap colour, one embroidery colour.
   swatch is the cap, ink is the embroidery thread. */
const LINES = [
  {
    id: "stay", line: "you stay home", placement: "front", swatch: "#20483D", ink: "#F2AFC7", cap: "Forest green", thread: "Light pink",
    images: [
      "https://media.base44.com/images/public/69f46886a412ee042303f1af/4704a2c6a_WhatsAppImage2026-09-22at1148031.jpeg",
      "https://media.base44.com/images/public/69f46886a412ee042303f1af/1e8098d4c_WhatsAppImage2026-09-22at114803.jpeg",
    ],
  },
  {
    id: "close", line: "you're too close", placement: "back", swatch: "#454B28", ink: "#F2AFC7", cap: "Olive", thread: "Light pink",
    images: [
      "https://media.base44.com/images/public/69f46886a412ee042303f1af/0828ee261_WhatsAppImage2026-09-22at1142212.jpeg",
      "https://media.base44.com/images/public/69f46886a412ee042303f1af/c5bedda2c_WhatsAppImage2026-09-22at1142211.jpeg",
    ],
  },
  {
    id: "kempton", line: "coming for kempton", placement: "front", swatch: "#B3122F", ink: "#F2AFC7", cap: "Red", thread: "Light pink",
    images: [
      "https://media.base44.com/images/public/69f46886a412ee042303f1af/49178e6f0_WhatsAppImage2026-09-22at1142201.jpeg",
      "https://media.base44.com/images/public/69f46886a412ee042303f1af/7f32a47ec_WhatsAppImage2026-09-22at114221.jpeg",
    ],
  },
  {
    id: "tryme", line: "try me", placement: "front", swatch: "#E7B7CA", ink: "#5A102D", cap: "Baby pink", thread: "Burgundy",
    images: [
      "https://media.base44.com/images/public/69f46886a412ee042303f1af/8f0e0a841_WhatsAppImage2026-09-22at1122462.jpeg",
      "https://media.base44.com/images/public/69f46886a412ee042303f1af/5d7ca5b2f_WhatsAppImage2026-09-22at1122461.jpeg",
    ],
  },
  {
    id: "no", line: "how about no", placement: "front", swatch: "#CBBCAF", ink: "#5A102D", cap: "Stone beige", thread: "Burgundy",
    images: [
      "https://media.base44.com/images/public/69f46886a412ee042303f1af/0ebba6e8d_how-about-no-stone-beige-front.png",
      "https://media.base44.com/images/public/69f46886a412ee042303f1af/c7ac5911f_WhatsAppImage2026-09-22at112951.jpeg",
    ],
  },
  {
    id: "bitch", line: "100% that bitch", placement: "front", swatch: "#5D2675", ink: "#F2AFC7", cap: "Purple", thread: "Light pink",
    images: [
      "https://media.base44.com/images/public/69f46886a412ee042303f1af/6bae76c6a_WhatsAppImage2026-09-22at112539.jpeg",
      "https://media.base44.com/images/public/69f46886a412ee042303f1af/2f494f5f2_WhatsAppImage2026-09-22at1125391.jpeg",
    ],
  },
];

const C = {
  bg: "#F6EFE8",
  ink: "#080105",
  burg: "#4A0E2E",
  burgMid: "#6B1642",
  rose: "#C4847A",
  roseLight: "#E8B4AE",
  white: "#FFFFFF",
};
const SERIF = "'Libre Baskerville', Baskerville, 'DM Serif Display', Georgia, serif";
const SANS = "'Montserrat', system-ui, sans-serif";

const money = (n) => `R${Number(n).toLocaleString("en-ZA")}`;

/* Every mention of Women For Change links to their site. */
function WFC() {
  return (
    <a href="https://womenforchange.co.za/" target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: "2px" }}>
      Women For Change
    </a>
  );
}

/* ------------------------------------------------------------------ */

export default function Caps() {
  const [buy, setBuy] = useState(null);

  useEffect(() => {
    const id = "aw-caps-fonts";
    if (!document.getElementById(id)) {
      const l = document.createElement("link");
      l.id = id;
      l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@300;400;500&display=swap";
      document.head.appendChild(l);
    }
    document.title = "You stay home. Caps for Women For Change | The Aligned Woman Co.";
  }, []);

  return (
    <div className="aw-caps" style={{ background: C.bg, color: C.ink, fontFamily: SANS, fontWeight: 300, minHeight: "100vh" }}>
      {/* Mobile only: centre the page's text. Desktop keeps the editorial left alignment. */}
      <style>{`
        @media (max-width: 767px) {
          .aw-caps { text-align: center; }
          .aw-caps .text-right { text-align: center; }
          .aw-caps .aw-m-center { justify-content: center; gap: 10px; }
          .aw-caps .aw-nav-cta { padding: 8px 16px; font-size: 11px; min-height: 36px !important; }
        }
        /* Tablet: centre the hero buy row and its line about the money. */
        @media (min-width: 768px) and (max-width: 1023px) {
          .aw-hero-cta { justify-content: center; text-align: center; }
        }
        /* Hero: a full-bleed photograph with the copy laid over it. A soft wash
           keeps the text legible without hiding the image. */
        .aw-caps .aw-hero { min-height: 560px; }
        .aw-hero-scrim {
          background: linear-gradient(90deg, rgba(246,239,232,0.95) 0%, rgba(246,239,232,0.82) 34%, rgba(246,239,232,0.14) 66%, rgba(246,239,232,0) 88%);
        }
        /* The phone gets its own portrait frame. Hidden from the wide layout. */
        .aw-hero-img-mobile { display: none; }
        /* On a phone that portrait frame runs full width and the copy sits over
           the bottom half of it. It lands on the dark blazer, so it turns cream
           and takes a soft wash underneath. */
        @media (max-width: 767px) {
          .aw-caps .aw-hero { min-height: 0; }
          .aw-caps .aw-hero-img-desktop { display: none; }
          .aw-caps .aw-hero-img-mobile { display: block; }
          .aw-caps .aw-hero-content {
            position: absolute;
            left: 0; right: 0; bottom: 0;
            max-width: none;
            padding: 0 24px 28px;
            gap: 14px;
          }
          .aw-caps .aw-hero-content h1,
          .aw-caps .aw-hero-content p,
          .aw-caps .aw-hero-content > div { color: #FAF5F3 !important; }
          .aw-caps .aw-hero-content .aw-hero-note { color: #FFFFFF !important; }
          .aw-caps .aw-hero-content h1 { font-size: 36px; }
          .aw-caps .aw-hero-content p { font-size: 15px; line-height: 1.45; }
          .aw-caps .aw-hero-scrim {
            background: linear-gradient(180deg, rgba(8,1,5,0) 38%, rgba(8,1,5,0.55) 70%, rgba(8,1,5,0.8) 100%);
          }
        }
        /* Buy buttons. A lift on hover, a sheen that sweeps across, and a press. */
        .aw-buy {
          position: relative;
          overflow: hidden;
          transition: transform 220ms ease, box-shadow 220ms ease;
        }
        .aw-buy::after {
          content: "";
          position: absolute;
          top: 0; bottom: 0; left: -60%;
          width: 40%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
          transform: skewX(-18deg);
          transition: left 600ms ease;
          pointer-events: none;
        }
        .aw-buy:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 12px 28px rgba(74,14,46,0.28);
        }
        .aw-buy:hover::after { left: 120%; }
        .aw-buy:active { transform: translateY(0) scale(0.98); }
        @media (prefers-reduced-motion: reduce) {
          .aw-buy, .aw-buy::after { transition: none; }
          .aw-buy:hover { transform: none; }
        }
      `}</style>
      <Nav />
      <Hero />
      <StatBand />
      <Shop onBuy={setBuy} />
      <Money />
      <Why />
      <Faq />
      <MobileSupport />
      <PoweredBy />
      <LandingFooter />

      {buy && <PayFastForm item={buy} price={PRICE} onClose={() => setBuy(null)} />}
    </div>
  );
}

/* ---------------- Sections ---------------- */

function Nav() {
  return (
    <div className="flex items-center justify-between px-6 md:px-24 py-6" style={{ borderBottom: `1px solid ${C.roseLight}` }}>
      <a href="/" className="block transition-opacity hover:opacity-80" aria-label="The Aligned Woman Co.">
        <img
          src="https://media.base44.com/images/public/69f46886a412ee042303f1af/6af7e7352_AWCologo.png"
          alt="The Aligned Woman Co."
          className="block w-auto"
          style={{ height: 144 }}
        />
      </a>
      <div className="flex items-center gap-4 md:gap-8 text-[13px] uppercase" style={{ letterSpacing: "0.12em" }}>
        <a href="#caps" className="hidden md:inline" style={{ color: C.ink, textDecoration: "none" }}>The caps</a>
        <a href="#money" className="hidden md:inline" style={{ color: C.ink, textDecoration: "none" }}>Where the money goes</a>
        <a href="#why" className="hidden md:inline" style={{ color: C.ink, textDecoration: "none" }}>Why</a>
        <a href="#caps" className="aw-buy aw-nav-cta rounded-full px-6 py-3 font-medium" style={{ background: C.rose, color: C.ink, minHeight: 44, textDecoration: "none" }}>
          Buy a cap
        </a>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <div className="aw-hero relative w-full">
      {HERO_IMAGE ? (
        <img
          src={HERO_IMAGE}
          alt="The forest green cap embroidered with you stay home, worn at golden hour"
          className="aw-hero-img-desktop absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="aw-hero-img-desktop absolute inset-0" style={{ background: C.roseLight }} />
      )}
      {HERO_IMAGE_MOBILE && (
        <img
          src={HERO_IMAGE_MOBILE}
          alt="The forest green cap embroidered with how about no, worn at golden hour"
          className="aw-hero-img-mobile w-full block"
          style={{ height: "auto" }}
        />
      )}
      <div className="aw-hero-scrim absolute inset-0" aria-hidden="true" />
      <div className="aw-hero-content relative flex flex-col gap-7 px-6 md:px-24 py-20 md:py-32 max-w-[760px]">
        <h1 className="m-0 text-5xl md:text-[80px] leading-none" style={{ fontFamily: SERIF, fontWeight: 400, color: C.burg }}>
          <span style={{ fontStyle: "italic", fontWeight: 700 }}>You</span> stay home.
        </h1>
        <p className="m-0 text-lg md:text-xl max-w-[560px]" style={{ lineHeight: 1.55 }}>
          After nine women were found dead in Ekurhuleni, the police told women in Kempton Park not to walk or run alone. This is the country's answer, embroidered on a cap.
        </p>
        <div className="flex flex-wrap items-center gap-5 mt-2 aw-m-center aw-hero-cta">
          <a href="#caps" className="aw-buy rounded-full px-9 py-5 text-[15px] font-medium" style={{ background: C.rose, color: C.ink, textDecoration: "none", letterSpacing: "0.04em" }}>
            Buy a cap for {money(PRICE)}
          </a>
          <div className="aw-hero-note text-sm" style={{ color: C.burgMid }}>Every cent goes to <WFC />.</div>
        </div>
        <div className="text-xs uppercase" style={{ letterSpacing: "0.1em", color: C.burgMid }}>Caps and embroidery sponsored by Barron</div>
      </div>
    </div>
  );
}

function StatBand() {
  const stats = [
    ["7", "women are killed every day in South Africa."],
    ["569", "women were murdered in three months this year."],
    ["6x", "our femicide rate is nearly 6x more against the global average."],
  ];
  return (
    <div className="grid md:grid-cols-3 gap-8 md:gap-12 px-6 md:px-24 py-12" style={{ background: C.burg, color: C.bg }}>
      {stats.map(([n, t]) => (
        <div key={n} className="flex flex-col gap-2">
          <div className="text-4xl" style={{ fontFamily: SERIF }}>{n}</div>
          <div className="text-sm" style={{ lineHeight: 1.5, color: C.roseLight }}>{t}</div>
        </div>
      ))}
    </div>
  );
}

function Shop({ onBuy }) {
  return (
    <div id="caps" className="px-6 md:px-24 pt-16 md:pt-24 pb-16 flex flex-col gap-10">
      <div className="flex flex-col gap-3 max-w-[720px]">
        <h2 className="m-0 text-4xl md:text-5xl" style={{ fontFamily: SERIF, fontWeight: 400, color: C.burg }}>Six lines women shouldn't have to say.</h2>
        <p className="m-0 text-[17px]" style={{ lineHeight: 1.6 }}>
          Barron 6-panel heavy brushed cotton cap, pre-curved peak, low profile, adjustable closure. One size. Each line comes in its own colourway, with its own embroidery colour. {money(PRICE)} each.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {LINES.map((l) => <ProductCard key={l.id} item={l} onBuy={onBuy} />)}
      </div>
      <div className="text-sm" style={{ color: C.burgMid }}>Shipping is charged at cost and never comes out of the donation.</div>
    </div>
  );
}

function ProductCard({ item, onBuy }) {
  const [photo, setPhoto] = useState(0);
  const images = item.images || [];
  const swatchDot = { width: 22, height: 22, borderRadius: "100%", border: "1px solid rgba(8,1,5,0.18)", flexShrink: 0 };
  return (
    <div className="flex flex-col gap-4 rounded-2xl p-6" style={{ background: C.white }}>
      {images.length > 0 ? (
        <div className="flex flex-col gap-2">
          <img
            src={images[photo]}
            alt={`${item.line}, embroidered on the ${item.cap.toLowerCase()} cap`}
            className="w-full rounded-xl"
            style={{ height: "auto", display: "block" }}
          />
          <div className="flex gap-2 aw-m-center">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setPhoto(i)}
                aria-label={`View photo ${i + 1}`}
                className="rounded-lg overflow-hidden"
                style={{ width: 56, height: 56, padding: 0, background: "none", cursor: "pointer", border: `1px solid ${i === photo ? C.burg : C.roseLight}` }}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl flex items-center justify-center" style={{ height: 220, background: item.swatch }}>
          <div className="text-[26px] text-center px-4" style={{ fontFamily: SERIF, color: item.ink }}>{item.line}</div>
        </div>
      )}
      <div className="flex justify-between items-baseline aw-m-center">
        <div className="text-xl" style={{ fontFamily: SERIF, color: C.burg }}>{item.line}</div>
        <div className="text-sm font-medium">{money(PRICE)}</div>
      </div>
      <div className="text-[13px] uppercase" style={{ color: C.burgMid, letterSpacing: "0.06em" }}>Embroidered on the {item.placement}</div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5 aw-m-center">
          <span style={{ ...swatchDot, background: item.swatch }} />
          <span className="text-[13px]" style={{ color: C.burgMid }}>{item.cap} cap</span>
        </div>
        <div className="flex items-center gap-2.5 aw-m-center">
          <span style={{ ...swatchDot, background: item.ink }} />
          <span className="text-[13px]" style={{ color: C.burgMid }}>{item.thread} embroidery</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onBuy({ id: item.id, line: item.line, placement: item.placement, cap: item.cap, thread: item.thread })}
        className="aw-buy rounded-full py-4 text-sm font-medium"
        style={{ background: C.rose, color: C.ink, border: 0, minHeight: 44, cursor: "pointer" }}
      >
        Buy now
      </button>
    </div>
  );
}

function Money() {
  const partners = [
    ["Beneficiary", <WFC />, "Registered NPO. 100% of proceeds."],
    ["Production partner", <img src={BARRON_LOGO} alt="Barron" className="block" style={{ height: 30, width: "auto" }} />, "Caps and embroidery, sponsored in full.", "https://barron.com/"],
    ["Design and illustration", "sadhana.ai / creative-studio", "Artwork and campaign visuals, donated.", "https://sadhana-ai-creative.sadhanasahaye.chatgpt.site/"],
  ];
  return (
    <div id="money" className="grid md:grid-cols-2 gap-10 md:gap-16 px-6 md:px-24 py-16" style={{ borderTop: `1px solid ${C.roseLight}` }}>
      <div className="flex flex-col gap-4">
        <h2 className="m-0 text-4xl" style={{ fontFamily: SERIF, fontWeight: 400, color: C.burg }}>Where the money goes.</h2>
        <p className="m-0 text-[17px]" style={{ lineHeight: 1.6 }}>The Aligned Woman Co. would like to thank its partners for making this real. Barron, for supplying every cap and all the embroidery. sadhana.ai / creative-studio, for the artwork and campaign visuals.</p>
        <p className="m-0 text-[17px]" style={{ lineHeight: 1.6 }}>Every rand you pay for a cap goes to <WFC />, the registered NPO whose petition led to gender-based violence and femicide being declared a national disaster in November 2025.</p>
        <p className="m-0 text-[17px]" style={{ lineHeight: 1.6 }}>As the caps, embroidery and the design are all donated, and we cover the platform and fulfilment ourselves, there is nothing to deduct. That is how 100% stays 100%.</p>
        <p className="m-0 text-[17px]" style={{ lineHeight: 1.6 }}>When the run sells out we will publish the total, the transfer confirmation and <WFC />'s receipt, here and on our channels.</p>
      </div>
      <div className="flex flex-col gap-4">
        {partners.map(([k, n, d, href]) => (
          <div key={k} className="rounded-2xl p-7 flex flex-col gap-1.5" style={{ background: C.white }}>
            <div className="text-xs uppercase" style={{ letterSpacing: "0.12em", color: C.burgMid }}>{k}</div>
            <div className="text-2xl" style={{ fontFamily: SERIF, color: C.burg }}>
              {href ? (
                <a href={href} target="_blank" rel="noreferrer" style={{ color: C.burg, textDecoration: "none" }} className="transition-opacity hover:opacity-70">{n}</a>
              ) : n}
            </div>
            <div className="text-sm" style={{ lineHeight: 1.5 }}>{d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Why() {
  return (
    <div id="why" className="grid md:grid-cols-2 gap-10 md:gap-16 px-6 md:px-24 py-16 md:py-24" style={{ background: C.ink, color: C.bg }}>
      <div className="flex flex-col gap-5">
        <h2 className="m-0 text-4xl" style={{ fontFamily: SERIF, fontWeight: 400, color: C.roseLight }}>Why a cap.</h2>
        <p className="m-0 text-[17px]" style={{ lineHeight: 1.65 }}>We have all posted. We have all worn black on a Friday. This is the one with a number attached.</p>
        <p className="m-0 text-[17px]" style={{ lineHeight: 1.65 }}>A cap is worn on the head. It is in every selfie, every memorial run, every school pickup. It says the line so you don't have to, to the person who needs to hear it.</p>
        <p className="m-0 text-[17px]" style={{ lineHeight: 1.65 }}>Seven women are killed every day in South Africa, according to the South African Medical Research Council's 20-year femicide study. Nine were found in Ekurhuleni in two months. We are not going to fix that with a cap. We are going to send all proceeds to the people who are working on it.</p>
      </div>
      <div className="flex flex-col justify-end gap-3">
        <div className="text-5xl md:text-[64px]" style={{ fontFamily: SERIF, lineHeight: 1.05, color: C.bg }}>Stop telling women how to avoid femicide.</div>
        <div className="text-[13px] uppercase" style={{ letterSpacing: "0.12em", color: C.rose }}>The country's answer, September 2026</div>
      </div>
    </div>
  );
}

function Faq() {
  const qs = [
    ["When will my cap arrive?", `Caps are embroidered to order by Barron. Allow ${LEAD_TIME} from close of the run, plus courier time.`],
    ["What size?", "One size, adjustable closure at the back. Fits most adults."],
    ["Can I just donate?", DONATION_LINK ? null : "Yes. Give directly to Women For Change. The cap is for wearing the line in public."],
  ];
  return (
    <div className="grid md:grid-cols-3 gap-10 px-6 md:px-24 py-16 md:py-20">
      {qs.map(([q, a]) => (
        <div key={q} className="flex flex-col gap-2">
          <div className="text-xl" style={{ fontFamily: SERIF, color: C.burg }}>{q}</div>
          <div className="text-[15px]" style={{ lineHeight: 1.6 }}>
            {a ?? (<>Yes. Give directly to <WFC /> <a href={DONATION_LINK} target="_blank" rel="noreferrer" style={{ color: C.burg }}>here</a>. The cap is for wearing the line in public.</>)}
          </div>
        </div>
      ))}
    </div>
  );
}

/* Mobile only. */
function MobileSupport() {
  return (
    <a
      href="https://womenforchange.co.za/"
      target="_blank"
      rel="noreferrer"
      className="md:hidden block"
    >
      <img
        src="https://media.base44.com/images/public/69f46886a412ee042303f1af/4bbc43bad_Screenshot2026-09-22at123254.png"
        alt="Survivor Support Line. Support and guidance for anyone affected by GBV."
        className="w-full block"
        style={{ height: "auto" }}
      />
    </a>
  );
}

/* Desktop and tablet only. */
function PoweredBy() {
  return (
    <a
      href="https://womenforchange.co.za/"
      target="_blank"
      rel="noreferrer"
      className="hidden md:block transition-opacity hover:opacity-80"
    >
      <img
        src="https://media.base44.com/images/public/69f46886a412ee042303f1af/c69324b82_Screenshot2026-09-22at123236.png"
        alt="Powered by Women For Change"
        className="w-full block"
        style={{ height: "auto" }}
      />
    </a>
  );
}