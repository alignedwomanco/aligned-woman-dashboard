import React, { useEffect, useState } from "react";
import PayFastForm from "@/components/caps/PayFastForm";

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
const HERO_IMAGE = "";             // six-cap flat lay. Empty renders a toned placeholder.

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
      "https://media.base44.com/images/public/69f46886a412ee042303f1af/5c7656a0d_WhatsAppImage2026-09-22at1129511.jpeg",
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
    <div style={{ background: C.bg, color: C.ink, fontFamily: SANS, fontWeight: 300, minHeight: "100vh" }}>
      <Nav />
      <Hero />
      <StatBand />
      <Shop onBuy={setBuy} />
      <Money />
      <Why />
      <Faq />
      <Footer />

      {buy && <PayFastForm item={buy} price={PRICE} onClose={() => setBuy(null)} />}
    </div>
  );
}

/* ---------------- Sections ---------------- */

function Nav() {
  return (
    <div className="flex items-center justify-between px-6 md:px-24 py-6" style={{ borderBottom: `1px solid ${C.roseLight}` }}>
      <a href="/" style={{ fontFamily: SERIF, fontSize: 20, color: C.ink, textDecoration: "none" }}>The Aligned Woman Co.</a>
      <div className="flex items-center gap-4 md:gap-8 text-[13px] uppercase" style={{ letterSpacing: "0.12em" }}>
        <a href="#caps" className="hidden md:inline" style={{ color: C.ink, textDecoration: "none" }}>The caps</a>
        <a href="#money" className="hidden md:inline" style={{ color: C.ink, textDecoration: "none" }}>Where the money goes</a>
        <a href="#why" className="hidden md:inline" style={{ color: C.ink, textDecoration: "none" }}>Why</a>
        <a href="#caps" className="rounded-full px-6 py-3 font-medium" style={{ background: C.rose, color: C.ink, minHeight: 44, textDecoration: "none" }}>
          Buy a cap
        </a>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <div className="grid md:grid-cols-2 gap-10 md:gap-16 px-6 md:px-24 pt-16 pb-12 md:pt-24 md:pb-20 items-center">
      <div className="flex flex-col gap-7">
        <div className="text-[13px] uppercase font-medium" style={{ letterSpacing: "0.16em", color: C.burgMid }}>
          {RUN_SIZE} caps. 100% to <WFC />.
        </div>
        <h1 className="m-0 text-6xl md:text-[88px] leading-none" style={{ fontFamily: SERIF, fontWeight: 400, color: C.burg }}>
          You stay home.
        </h1>
        <p className="m-0 text-lg md:text-xl max-w-[560px]" style={{ lineHeight: 1.55 }}>
          After nine women were found dead in Ekurhuleni, the police told women in Kempton Park not to walk or run alone. This is the country's answer, embroidered on a cap.
        </p>
        <div className="flex flex-wrap items-center gap-5 mt-2">
          <a href="#caps" className="rounded-full px-9 py-5 text-[15px] font-medium" style={{ background: C.rose, color: C.ink, textDecoration: "none", letterSpacing: "0.04em" }}>
            Buy a cap for {money(PRICE)}
          </a>
          <div className="text-sm" style={{ color: C.burgMid }}>Every cent goes to <WFC />.</div>
        </div>
        <div className="flex items-baseline gap-3 mt-4 pt-6" style={{ borderTop: `1px solid ${C.roseLight}` }}>
          <div className="text-5xl" style={{ fontFamily: SERIF, color: C.burg }}>{SOLD}</div>
          <div className="text-[15px] uppercase" style={{ letterSpacing: "0.06em" }}>of {RUN_SIZE} caps sold</div>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {HERO_IMAGE ? (
          <img src={HERO_IMAGE} alt="The six caps, laid flat" className="w-full rounded-2xl object-cover" style={{ height: 480 }} />
        ) : (
          <div className="w-full rounded-2xl flex items-center justify-center text-center p-6 text-sm uppercase" style={{ height: 480, background: C.roseLight, color: C.burg, letterSpacing: "0.1em" }}>
            Six-cap flat lay. Drop the image URL into HERO_IMAGE.
          </div>
        )}
        <div className="text-xs uppercase text-right" style={{ letterSpacing: "0.1em", color: C.burgMid }}>Caps and embroidery sponsored by Barron</div>
      </div>
    </div>
  );
}

function StatBand() {
  const stats = [
    [String(RUN_SIZE), "caps in the run. When they're gone, they're gone."],
    ["100%", <>of proceeds to <WFC />. Barron covers the caps and embroidery, so there is no cost of goods to deduct.</>],
    [money(RUN_SIZE * PRICE), <>to <WFC /> if every cap sells. You decide how close we get.</>],
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
          <div className="flex gap-2">
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
      <div className="flex justify-between items-baseline">
        <div className="text-xl" style={{ fontFamily: SERIF, color: C.burg }}>{item.line}</div>
        <div className="text-sm font-medium">{money(PRICE)}</div>
      </div>
      <div className="text-[13px] uppercase" style={{ color: C.burgMid, letterSpacing: "0.06em" }}>Embroidered on the {item.placement}</div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <span style={{ ...swatchDot, background: item.swatch }} />
          <span className="text-[13px]" style={{ color: C.burgMid }}>{item.cap} cap</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span style={{ ...swatchDot, background: item.ink }} />
          <span className="text-[13px]" style={{ color: C.burgMid }}>{item.thread} embroidery</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onBuy({ id: item.id, line: item.line, placement: item.placement, cap: item.cap, thread: item.thread })}
        className="rounded-full py-4 text-sm font-medium"
        style={{ background: C.rose, color: C.ink, border: 0, minHeight: 44, cursor: "pointer" }}
      >
        Buy now with PayFast
      </button>
    </div>
  );
}

function Money() {
  const partners = [
    ["Beneficiary", <WFC />, "Registered NPO. 100% of proceeds."],
    ["Production partner", "Barron", "Caps and embroidery, sponsored in full."],
    ["Run by", "The Aligned Woman Co.", "Design, sales, fulfilment and PR. No margin."],
    ["Design and illustration", "sadhana.ai / creative-studio", "Artwork and campaign visuals, donated."],
  ];
  return (
    <div id="money" className="grid md:grid-cols-2 gap-10 md:gap-16 px-6 md:px-24 py-16" style={{ borderTop: `1px solid ${C.roseLight}` }}>
      <div className="flex flex-col gap-4">
        <h2 className="m-0 text-4xl" style={{ fontFamily: SERIF, fontWeight: 400, color: C.burg }}>Where the money goes.</h2>
        <p className="m-0 text-[17px]" style={{ lineHeight: 1.6 }}>Every rand you pay for a cap goes to <WFC />, the registered NPO whose petition led to gender-based violence and femicide being declared a national disaster in November 2025.</p>
        <p className="m-0 text-[17px]" style={{ lineHeight: 1.6 }}>Barron is sponsoring the caps and the embroidery. sadhana.ai / creative-studio is donating the design and illustration. We are covering the platform and the fulfilment ourselves. That is how 100% stays 100%.</p>
        <p className="m-0 text-[17px]" style={{ lineHeight: 1.6 }}>When the run sells out we will publish the total, the transfer confirmation and <WFC />'s receipt, here and on our channels.</p>
      </div>
      <div className="flex flex-col gap-4">
        {partners.map(([k, n, d]) => (
          <div key={k} className="rounded-2xl p-7 flex flex-col gap-1.5" style={{ background: C.white }}>
            <div className="text-xs uppercase" style={{ letterSpacing: "0.12em", color: C.burgMid }}>{k}</div>
            <div className="text-2xl" style={{ fontFamily: SERIF, color: C.burg }}>{n}</div>
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

function Footer() {
  return (
    <div className="flex flex-col md:flex-row gap-2 justify-between px-6 md:px-24 py-8 text-xs uppercase" style={{ borderTop: `1px solid ${C.roseLight}`, letterSpacing: "0.08em", color: C.burgMid }}>
      <div>The Aligned Woman Co.</div>
      <div>#TheAlignedWomanBlueprint · #SouthAfricanWomen</div>
    </div>
  );
}