import React, { useEffect, useState } from "react";
import LandingFooter from "@/components/home/LandingFooter";

/* ════════════════════════════════════════════════════════════════
   THE ALIGNMENT AUDIT: public sales page (/alignment-audit)
   Anyone can view and buy. No login. Buying goes to the Stripe
   payment link below; handlePaymentWebhook grants alignment_audit_paid
   when the link carries metadata product=alignment_audit.
   The questionnaire itself is /Audit (signed-in only).
   Structure mirrors laurajanethomas.biz/claritysprint.
   ════════════════════════════════════════════════════════════════ */

/* ── SETTINGS: everything Laura may want to change lives here ── */
const BUY_URL = "https://buy.stripe.com/00w28t0sS09r5SFaJreME0a";      // $280 (USD), one price for everyone

const PRICE = "$280";
const QUESTIONNAIRE_TIME = "about 90 minutes";
const PORTRAIT = "https://media.base44.com/images/public/69f46886a412ee042303f1af/f214efd57_LAURATHOMAS.jpg";
const HERO_IMAGE = "https://media.base44.com/images/public/69f46886a412ee042303f1af/bb0aa636c_-e-x-t-e-r-n-a-l_-i-m-a-g-e_-t-o_-i-m-a-g-e-c3e4cb49-6189-4f32-a0bd-b89edf9acaf2.png";
const HERO_IMAGE_MOBILE = "https://media.base44.com/images/public/69f46886a412ee042303f1af/db8b7640b_-e-x-t-e-r-n-a-l_-i-m-a-g-e_-t-o_-i-m-a-g-e-ef746f81-ff44-40d1-8005-60428405848e.png";

const C = {
  burg: "#4A0E2E",
  burgMid: "#6B1642",
  burgDeep: "#26030F",
  rose: "#C4847A",
  roseLight: "#E8B4AE",
  ivory: "#F5F1EC",
  sand: "#EEE7DF",
  card: "rgba(245,238,228,0.97)",
  ink: "#1A0E12",
  body: "#4A3C42",
  muted: "#5A4A50",
  line: "rgba(74,14,46,0.2)",
};
const SERIF = "'Libre Baskerville', Georgia, serif";
const SANS = "Montserrat, sans-serif";

/* ── Content ── */
// The A.L.I.V.E. cards change with the track she picks (business or career).
const LETTERS = {
  business: [
    { letter: "A", label: "Awareness", sub: "What you're not seeing.", look: "Where the business actually is, your blind spots as its founder, the conversation you're avoiding, and your Energy Leak Map.", back: "Where you and the business really are, and where your energy is leaking." },
    { letter: "L", label: "Liberation", sub: "What you're carrying.", look: "The clients, offers and promises you keep out of guilt, the approval you're still working for, and the money rules that still set your prices.", back: "What's costing the business, and you, most." },
    { letter: "I", label: "Intention", sub: "What you actually want.", look: "The business you want, separated from the one it has become. Your one priority for six months, and how you make big calls.", back: "The gap between the business you want and the one you're running." },
    { letter: "V", label: "Vision", sub: "Where you're heading.", look: "An ordinary Tuesday three years from now as the owner, and the version of success you wouldn't say out loud.", back: "Two roads: the business if nothing changes, and if you make the move." },
    { letter: "E", label: "Embodiment", sub: "How you're living it.", look: "Your hours, your pace, what you should hand off, whether the business survives a month without you, and what your body keeps telling you.", back: "Your next move in the business, and your first 30 days." },
  ],
  career: [
    { letter: "A", label: "Awareness", sub: "What you're not seeing.", look: "Where you really are in your role, your blind spots at work, the conversation you're avoiding, and your Energy Leak Map.", back: "Where your career really is, and where your energy is leaking." },
    { letter: "L", label: "Liberation", sub: "What you're carrying.", look: "The expectations and approval you keep working for, the work nobody credits, and the rules about money and being a woman at work that still run you.", back: "What's holding your career back most." },
    { letter: "I", label: "Intention", sub: "What you actually want.", look: "What you want from your work, separated from what you think you should want. Your one priority for six months, and how you make big calls.", back: "The gap between the career you want and the one you're in." },
    { letter: "V", label: "Vision", sub: "Where you're heading.", look: "An ordinary Tuesday three years from now, the next move you keep circling, and the version of success you wouldn't say out loud.", back: "Two roads: your career if nothing changes, and if you make the move." },
    { letter: "E", label: "Embodiment", sub: "How you're living it.", look: "When you really log off, your sleep, how fast you recover from stress, where you sit on the burnout scale, and what your body keeps telling you.", back: "Your next career move, and your first 30 days." },
  ],
};

const MODULES = {
  business: {
    title: "Plus your business module: 14 questions",
    items: [
      { name: "Position", body: "What the business is known for against what you want it known for, the client you'd clone and the one you dread, and why anyone picks you." },
      { name: "Value", body: "Where your money actually comes from, the offer you love against the one you resent, your pricing, and where money is leaking out." },
      { name: "Visibility", body: "How new clients really find you, and what you hold back from saying publicly about your work." },
      { name: "Pace", body: "The hours you work against the hours you want, what to hand off, what happens if you're off for a month, and who you are without the business." },
    ],
  },
  career: {
    title: "Plus your career module: 13 questions",
    items: [
      { name: "Position", body: "What you're known for at work against what you want to be known for, how your manager would sum up your value, and whether you've outgrown the role." },
      { name: "Value", body: "What your experience is worth in your market, when you last asked for more, and the work you do that nobody credits." },
      { name: "Visibility", body: "Who puts your name forward when you're not in the room, and the habits in meetings that make you smaller." },
      { name: "Pace", body: "When you really log off, the next move you keep circling, the business idea at the back of your mind, and who you are without the job title." },
    ],
  },
};

const FAQ = [
  { q: "\"I've done the Starting Point Profile. Isn't this the same?\"", a: "No. The Profile names your pattern. The Audit reads your actual situation, your business or career, how the pattern shows up in it, and what to do next. Your Profile answers feed into it." },
  { q: "\"Is this coaching?\"", a: "It's a diagnosis. You get a written blueprint and one call. If you want ongoing work after that, that's the Clarity Sprint, and your fee comes off it." },
  { q: "\"I don't run a business.\"", a: "Choose the career track at the start. The questions follow your role, your value and your next move." },
  { q: "\"I'm already flat out. I don't have time for this.\"", a: `The questionnaire takes ${QUESTIONNAIRE_TIME} and saves as you go, so you can do it in pieces. Then I do the work. The hour on the call is the only time you need to block out.` },
  { q: "\"Will you ask about my finances?\"", a: "I'll ask how money moves through your business or career. I won't ask for bank statements, account details or amounts." },
  { q: "\"What happens after I pay?\"", a: "You get an email straight away. Sign in at app.alignedwomanco.com with the email you paid with, and your questionnaire is waiting on your dashboard. Submit it whenever you're ready. Your seven working days start then." },
];

const REVIEWS = [
  { headline: "For the first time in my business, everything feels aligned.", quote: "I came to Laura overwhelmed and unclear about how to position my brand. Within a matter of weeks, she helped me articulate exactly what I do, who I do it for, and how to confidently show up as a leader. For the first time in my business, everything feels aligned, and the results speak for themselves.", name: "Tasha Berrings", company: "Founder, Clean Beauty Startup" },
  { headline: "Laura provides actionable support to help you thrive.", quote: "Laura provides actionable support to help you thrive. If you're considering her for consulting or coaching, I can hands down say you're getting your money's worth. You leave with valuable insights and practical techniques to help navigate and reconnect with what truly drives you, all while protecting your energy so you don't end up overworked and burnt out. One session and Laura will leave you feeling empowered. I highly recommend her services.", name: "Tharunisa Reddy", company: "" },
  { headline: "She taught me to back myself.", quote: "Laura is just phenomenal. She helped me connect to my core and feel more confident about what I do and the value I provide to others. I feel far less awkward selling myself or my services. She taught me to back myself, and to detach my sense of self-worth from how much I make. It set me free, and I am excited for the next chapter in my career.", name: "Iris Smyth", company: "" },
  { headline: "Working with Laura was like plugging my business into power.", quote: "She pulled the strategy, story, and messaging out of me in a way that felt effortless. The outcome was anything but. I now have a clear roadmap, a stronger offer, and marketing that finally makes sense and feels like me.", name: "Vanessa Rathbone", company: "Founder, Wellness Consultancy" },
  { headline: "Brand therapist, coach, and visionary all in one.", quote: "Laura isn't just a strategist. She's a brand therapist, coach, and visionary all in one. Her ability to combine mindset work with razor-sharp strategy is unmatched. I walked away with more than a brand. I walked away with confidence, direction, and a business that is finally growing.", name: "Elena S.", company: "CEO, Luxury Wellness Brand" },
  { headline: "Zoom out and zoom in with equal brilliance.", quote: "I have worked with other consultants before, but no one has Laura's ability to zoom out and zoom in with equal brilliance. Her mind is next level.", name: "Ashleigh", company: "Founder, Thee Lux Retreat Co." },
  { headline: "Laura has an extraordinary gift for translating messy ideas into clear, compelling vision.", quote: "She doesn't just 'get' what's in your head, she elevates it beyond what you thought was possible. Her blend of strategic insight, creative brilliance, and intuition is unmatched. I can't recommend her highly enough.", name: "Wendy Mahoney", company: "Newmella Holdings" },
  { headline: "Partnering with this team has been transformative for Ubank.", quote: "We have never experienced such rapid and consistent elevation of our brand. Their strategic alignment of both our internal and external communications, coupled with their ability to manage high-level partnerships, has significantly advanced our business objectives, even earning us industry recognition. Their professionalism, dedication, and impact have been exceptional. We highly recommend their services.", name: "Luthando Vutula", company: "CEO, Ubank" },
  { headline: "This was a complete inside-out transformation of a business established for over 30 years.", quote: "Taking on this project was no small feat. The strategy and rebrand not only needed to resonate with our customers, but also with both internal and external stakeholders. Laura's presentation of the new brand direction received immediate buy-in from our external partners and was successfully rolled out internally to ensure alignment at every level. This rebrand combines visual appeal with real-world functionality, driving both engagement and execution.", name: "Kevin Vyvyan-Day", company: "CEO, Barron" },
  { headline: "I thought I was just getting a logo, but what Laura delivered was an entire brand world.", quote: "She didn't just design something beautiful; she built a visual system that finally reflects the depth and direction of my business. It's cohesive, elevated, and powerful. I finally feel seen and so does my audience.", name: "Jenna Cummings", company: "Founder, Luxury Interior Studio" },
  { headline: "Laura and her team take no prisoners and always aim for excellence.", quote: "We might live on the opposite sides of the world, but that hasn't stopped us from success. I hired Laura to help with Strategy for two clients. Both of these clients' social media accounts engagement rate and website visits went up as a result. I look forward to continuing to work with Laura!", name: "Stephanie O'Brien", company: "Founder, Carmella Consulting" },
  { headline: "Laura and her team successfully captured the essence of our luxury mental wellness brand.", quote: "A brand transcends mere elements such as logos and visuals; it embodies the brand's personality. Healing Destinations holds personal significance to me, and this can present a formidable challenge for many. The result was an exemplary final product. For those seeking insight, creativity and a beautiful brand, I highly recommend.", name: "Mica Angel", company: "Mother, Founder & CEO, Healing Destinations" },
  { headline: "No matter whether you are local or international, this is the company to take your marketing to another level.", quote: "Laura and her team are able to beat time difference odds and provide us with extremely fast service. We have also been able to upscale our client delivery, because of Laura's insight in culture and marketing strategy. The keen eye for detail and gorgeous design is a huge bonus!", name: "Shanny Sommer", company: "CEO, Welcome To Influence" },
  { headline: "They listened attentively, grasped our needs and consistently exceeded our expectations.", quote: "From the moment we engaged with them, it was evident that they are deeply knowledgeable and invested in our brand's success. Their commitment to understanding our vision and goals was refreshing.", name: "Charen Nortje", company: "CEO, Ring Artisan" },
  { headline: "Working with Laura and her team has been an amazing experience.", quote: "I would recommend 100%, very hands on, professional and understanding. I wished I had found her sooner. Continue being such an amazing company!!", name: "Christelle Dossous", company: "Onaturell Beauty" },
  { headline: "Real insight, real confidence.", quote: "Laura's talk on The Hidden Tax on Female Leadership made me think differently about where I am in my life and my work. It gave me real insight, real confidence, and I wish it had been longer.", name: "Big5Digital", company: "Guest keynote, 2026" },
  { headline: "No one has ever explained money to me the way she did.", quote: "Laura was incredible. No one has ever explained money to me the way she did. Her stories were so real, you could hear a pin drop in the room. She really touched people.", name: "Mpho Gumede", company: "That Brunch Club" },
  { headline: "Our Women's Day celebration was a huge success.", quote: "To the most amazing speaker and panellist, on behalf of the D&I team and EY, thank you for helping make our Women's Day celebration a huge success.", name: "Clayton Jordy Fowlds", company: "D&I Team, EY" },
  { headline: "They even stayed overtime.", quote: "The teams thoroughly enjoyed and were engaged in your H2H workshop. They even stayed overtime. Thank you for such a fantastic session.", name: "Cathy Stadler", company: "Director of Marketing, Oracle" },
];

/* ── Small pieces ── */
const eyebrow = (color = C.burg) => ({ margin: 0, fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color });

function BuyButton({ children = "Get my Alignment Audit", block = false, soft = false }) {
  return (
    <a
      href={BUY_URL}
      className="aa-btn"
      style={{
        display: block ? "flex" : "inline-flex", alignItems: "center", justifyContent: "center", gap: 12,
        minHeight: 56, padding: "0 40px", background: soft ? "rgba(196,132,122,0.6)" : C.rose, color: C.burgDeep,
        fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", textDecoration: "none",
      }}
    >
      {children} <span aria-hidden="true">→</span>
    </a>
  );
}

function Icon({ d, color }) {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
      <circle cx="12" cy="12" r="10" />
      <path d={d} />
    </svg>
  );
}

function H2({ children, style }) {
  return <h2 className="aa-h2" style={{ margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: 56, lineHeight: 1.02, color: C.ink, ...style }}>{children}</h2>;
}
const em = { fontStyle: "italic", color: C.burg };

/* ── Page ── */
export default function AlignmentAuditPage() {
  const [track, setTrack] = useState("business");
  const [page, setPage] = useState(0);
  const [perView, setPerView] = useState(3);
  const pages = Math.ceil(REVIEWS.length / perView);

  // How many reviews sit on the single line, by width.
  useEffect(() => {
    const calc = () => setPerView(window.innerWidth <= 720 ? 1 : window.innerWidth <= 1024 ? 2 : 3);
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  // A wider screen holds more reviews, so a page can fall out of range.
  useEffect(() => { if (page >= pages) setPage(0); }, [pages, page]);

  // Keeps the line moving on its own.
  useEffect(() => {
    if (pages < 2) return;
    const id = setInterval(() => setPage((p) => (p + 1) % pages), 6000);
    return () => clearInterval(id);
  }, [pages]);
  const mod = MODULES[track];

  useEffect(() => {
    const id = "aw-audit-fonts";
    if (!document.getElementById(id)) {
      const l = document.createElement("link");
      l.id = id;
      l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@300;400;600&display=swap";
      document.head.appendChild(l);
    }
    document.title = "The Alignment Audit | The Aligned Woman Co.";
  }, []);

  const trackBtn = (key, label) => {
    const on = track === key;
    return (
      <button
        type="button"
        onClick={() => setTrack(key)}
        aria-pressed={on}
        style={{
          minHeight: 48, padding: "0 32px", border: `1px solid ${C.burg}`, cursor: "pointer",
          background: on ? C.burg : "transparent", color: on ? C.ivory : C.burg,
          fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase",
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="aw-audit" style={{ background: C.ivory, color: C.ink, fontFamily: SANS, fontWeight: 300 }}>
      <style>{`
        .aw-audit .aa-btn {
          position: relative; overflow: hidden;
          transition: transform 240ms ease, box-shadow 240ms ease, filter 240ms ease;
        }
        .aw-audit .aa-btn:hover {
          filter: brightness(0.96);
          transform: translateY(-2px);
          box-shadow: 0 12px 26px rgba(74,14,46,0.22);
        }
        .aw-audit .aa-btn:active { transform: translateY(0); box-shadow: 0 4px 10px rgba(74,14,46,0.18); }
        .aw-audit .aa-btn::after {
          content: ""; position: absolute; top: 0; bottom: 0; left: -60%; width: 40%;
          background: linear-gradient(100deg, transparent, rgba(255,255,255,0.42), transparent);
          transform: skewX(-18deg); opacity: 0; pointer-events: none;
        }
        .aw-audit .aa-btn:hover::after { animation: aa-sheen 900ms ease-out; }
        .aw-audit .aa-btn span[aria-hidden="true"] {
          display: inline-block;
          animation: aa-arrow-nudge 1900ms ease-in-out infinite;
        }
        .aw-audit .aa-btn:hover span[aria-hidden="true"] {
          animation: aa-arrow-slide 700ms ease-out;
        }
        @keyframes aa-sheen {
          0% { left: -60%; opacity: 0; }
          25% { opacity: 1; }
          100% { left: 120%; opacity: 0; }
        }
        @keyframes aa-arrow-nudge {
          0%, 70%, 100% { transform: translateX(0); }
          80% { transform: translateX(4px); }
          90% { transform: translateX(0); }
        }
        @keyframes aa-arrow-slide {
          0% { transform: translateX(0); }
          55% { transform: translateX(8px); }
          100% { transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .aw-audit .aa-btn, .aw-audit .aa-btn span[aria-hidden="true"], .aw-audit .aa-btn::after { animation: none !important; transition: none !important; }
        }
        .aw-audit details summary { cursor: pointer; list-style: none; }
        .aw-audit .aa-fade { animation: aaFade 380ms ease both; }
        @keyframes aaFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) { .aw-audit .aa-fade { animation: none; } }
        .aw-audit details summary::-webkit-details-marker { display: none; }
        .aw-audit .aa-hero-mobile-bg { display: none; }
        @media (max-width: 1024px) {
          .aw-audit .aa-hero {
            grid-template-columns: 1fr !important; position: relative;
            aspect-ratio: 9 / 16;
          }
          .aw-audit .aa-hero-media { display: none !important; }
          .aw-audit .aa-hero-mobile-bg {
            display: block !important; position: absolute; inset: 0; z-index: 0; overflow: hidden;
            background: #F3EAE1;
          }
          .aw-audit .aa-hero-mobile-bg img {
            width: 100%; height: 100%; object-fit: cover; object-position: center center; display: block;
          }
          .aw-audit .aa-hero-mobile-bg::after {
            content: ""; position: absolute; inset: 0;
            background: linear-gradient(180deg, rgba(20,2,10,0.62) 0%, rgba(20,2,10,0.28) 42%, rgba(20,2,10,0.35) 74%, rgba(20,2,10,0.8) 100%);
          }
          .aw-audit .aa-hero-copy {
            position: relative; z-index: 1;
            padding: 18px 20px 28px !important; min-height: 0 !important;
            justify-content: space-between !important;
            text-align: center !important;
          }
          .aw-audit .aa-hero-text {
            text-align: center;
            padding: 0;
            background: none;
            box-shadow: none;
          }
          .aw-audit .aa-hero-text p,
          .aw-audit .aa-hero-text h1 {
            text-shadow: 0 2px 14px rgba(14,2,7,0.8), 0 1px 3px rgba(14,2,7,0.85);
            margin-left: auto !important;
            margin-right: auto !important;
          }
          .aw-audit .aa-hero-copy h1,
          .aw-audit .aa-hero-copy h1 span { color: #FFFFFF !important; }
          .aw-audit .aa-hero-copy h1 span:last-child { color: rgba(255,214,199,0.96) !important; }
          .aw-audit .aa-hero-copy p { color: rgba(255,255,255,0.88) !important; }
          .aw-audit .aa-hero-copy > div:last-child p:last-child { color: rgba(255,214,199,0.95) !important; }
        }
        .aw-audit .aa-hero-note { display: none; }
        /* Tablet only: the pricing note moves onto the hero image, so the
           standalone block under the hero is hidden at this width. */
        @media (min-width: 721px) and (max-width: 1024px) {
          .aw-audit .aa-hero-note {
            display: block; max-width: 560px; margin: 26px auto 0; text-align: center;
          }
          .aw-audit .aa-hero-note p {
            text-shadow: 0 2px 14px rgba(14,2,7,0.8), 0 1px 3px rgba(14,2,7,0.85);
          }
          .aw-audit .aa-hero-note p:first-child { font-size: 15px !important; line-height: 1.6 !important; }
          .aw-audit .aa-hero-note p:last-child { color: rgba(255,214,199,0.95) !important; font-size: 15px !important; line-height: 1.65 !important; }
          .aw-audit .aa-price-note { display: none !important; }
          /* Copy sits a little lower, the button follows the text instead of
             being pinned to the bottom of the image. */
          .aw-audit .aa-hero-copy {
            justify-content: flex-start !important;
            padding: 56px 24px 32px !important;
          }
          .aw-audit .aa-hero-text > p:last-of-type {
            font-size: 19px !important; line-height: 1.6 !important;
          }
          .aw-audit .aa-hero-copy > div:last-child { margin-top: 30px; }
          /* The three Core Audit blocks stack on tablet instead of running
             side by side. */
          .aw-audit .aa-core-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 720px) {
          .aw-audit .aa-hero-h { font-size: 40px !important; }
          .aw-audit .aa-sec { padding: 64px 20px !important; }
          .aw-audit .aa-h2 { font-size: 34px !important; }
          .aw-audit .aa-price { font-size: 56px !important; }
          .aw-audit .aa-box { padding: 36px 22px !important; }
          .aw-audit .aa-arrow { display: none !important; }
          .aw-audit .aa-alive-row { grid-template-columns: 1fr !important; max-width: 100% !important; }
        }
      `}</style>

      {/* 1. HERO */}
      <section
        className="aa-hero"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          alignItems: "stretch",
          background: C.ivory,
          color: C.ink,
        }}
      >
        <div className="aa-hero-mobile-bg" aria-hidden="true">
          <img src={HERO_IMAGE_MOBILE} alt="" />
        </div>
        <div className="aa-hero-media" style={{ position: "relative", minHeight: 640, overflow: "hidden" }}>
          <img
            src={HERO_IMAGE}
            alt="The Alignment Audit blueprint on a chair in a daisy meadow"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "32% center", display: "block" }}
          />
        </div>
        <div className="aa-hero-copy" style={{ padding: "104px 72px", display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "left" }}>
          <div className="aa-hero-text">
            <p style={{ ...eyebrow(C.muted), fontWeight: 400, marginBottom: 28 }}>A senior diagnostic for women building a business or a career.</p>
            <h1 className="aa-hero-h" style={{ margin: "0 0 28px", fontFamily: SERIF, fontWeight: 400, fontSize: 54, lineHeight: 1.06, letterSpacing: "-0.01em", color: C.ink }}>
              <span style={{ display: "block" }}>You've asked everyone else.</span>
              <span style={{ display: "block", fontStyle: "italic", color: C.burg }}>Now get an answer about you.</span>
            </h1>
            <p style={{ margin: "0 0 36px", maxWidth: 560, fontSize: 17, lineHeight: 1.65, color: C.body }}>
              One questionnaire. One blueprint written about you. One hour with me. An honest read on your business or career, and on the woman running it.
            </p>
            <div className="aa-hero-note">
              <p style={{ margin: "0 0 8px", fontSize: 13, lineHeight: 1.55, color: C.muted }}>
                {PRICE}, paid once. Your blueprint within seven working days.
              </p>
              <p style={{ margin: "0 auto", maxWidth: 520, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, lineHeight: 1.6, color: C.burg }}>
                Usually I work at fractional CMO and advisory rates. The Alignment Audit is my diagnostic on its own, so you can get my eyes on your situation before you commit to anything more.
              </p>
            </div>
          </div>
          <div>
            <BuyButton soft />
          </div>
        </div>
      </section>

      {/* 1b. PRICING NOTE, directly under the hero (hidden on tablet,
          where it sits on the hero image instead) */}
      <div
        className="aa-price-note"
        style={{
          background: C.ivory,
          borderTop: "1px solid rgba(74,14,46,0.1)",
          padding: "30px 24px 40px",
          textAlign: "center",
        }}
      >
        <p style={{ margin: "0 0 10px", fontSize: 14, color: C.muted }}>
          {PRICE}, paid once. Your blueprint within seven working days.
        </p>
        <p style={{ margin: "0 auto", maxWidth: 620, fontFamily: SERIF, fontStyle: "italic", fontSize: 14, lineHeight: 1.6, color: C.burg }}>
          Usually I work at fractional CMO and advisory rates. The Alignment Audit is my diagnostic on its own, so you can get my eyes on your situation before you commit to anything more.
        </p>
      </div>

      {/* 2. THE JAR */}
      <section className="aa-sec" style={{ padding: "112px 24px", background: "#EFE7DD", textAlign: "center" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <H2 style={{ marginBottom: 48 }}>You can't read the label <span style={em}>from inside the jar.</span></H2>
          <div style={{ fontSize: 15, lineHeight: 1.75 }}>
            <p style={{ margin: "0 0 20px" }}>Maybe you built something real and it has stalled. You're busier than ever and the growth doesn't match the effort.</p>
            <p style={{ margin: "0 0 20px" }}>Maybe you're good at your job and you've outgrown it. You know there's a next move. You can't see it from where you're standing.</p>
            <p style={{ margin: "0 0 20px" }}>So you read the books. You took the free quiz. You asked ChatGPT at midnight. You know your pattern by name now, and you're still making the same call you made last year. <span style={{ fontFamily: SERIF, ...em }}>(Yes, close the tab.)</span></p>
            <p style={{ margin: "0 0 20px" }}>More information won't fix that. You're too close to your own situation to see it, which is why every answer you find feels true for about a day.</p>
            <p style={{ margin: "32px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 22, lineHeight: 1.5, color: C.burg }}>
              ChatGPT gives you the most likely answer. Your friends give you the kindest one. The Alignment Audit gives you the honest one, from someone who's built the thing.
            </p>
          </div>
          <div style={{ marginTop: 40 }}><BuyButton /></div>
        </div>
      </section>

      {/* 3. BOTH SIDES */}
      <section className="aa-sec" style={{ padding: "112px 48px" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 64, alignItems: "center" }}>
          <div style={{ flex: "1 1 360px", minWidth: 0 }}>
            <img src={PORTRAIT} alt="Laura Jane Thomas" loading="lazy" style={{ width: "100%", aspectRatio: "3 / 4", objectFit: "cover", display: "block" }} />
          </div>
          <div style={{ flex: "1 1 420px", minWidth: 0 }}>
            <H2 style={{ fontSize: 46, lineHeight: 1.05, marginBottom: 24 }}>I have sat on <span style={em}>both sides of this.</span></H2>
            <div style={{ fontSize: 14, lineHeight: 1.75, color: C.body }}>
              <p style={{ margin: "0 0 18px" }}>Before I advised anyone, I built and ran my own multi-seven-figure, award-winning marketing agency for over a decade and led brand and marketing work for some of the biggest names in the market.</p>
              <p style={{ margin: "0 0 18px" }}>I am a certified Neuro-Linguistic Programming (NLP) and Time Line Therapy practitioner, certified by the American Board of NLP. I am also a certified director, a speaker and an author, and I hold a specialised degree in brand communications.</p>
              <p style={{ margin: "0 0 18px" }}>I have built a business from nothing, and I have been the strategist brought in to fix and grow ones that were already established. I have sat on both sides of the problem you are bringing me.</p>
              <p style={{ margin: "0 0 18px" }}>So when I read your answers, you are not getting theory or a borrowed framework off the internet. You are getting someone who has made these exact decisions with real money on the line, many times over.</p>
              <p style={{ margin: "0 0 18px" }}>I also learned the hard way what it costs to build something while running yourself into the ground. After a decade at full tilt, I had every answer and no idea who I was. My body called it before I did. I rebuilt, and I changed how I work and how I help the people I work with. So your Audit reads your business or career and the woman running it, because you can only sustain a plan that fits the person carrying it out.</p>
              <p style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: C.burg }}>That is the difference. Operator experience, without the burnout most business advice runs on.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE OFFER */}
      <section className="aa-sec" style={{ padding: "112px 24px", background: C.sand }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ maxWidth: 780, margin: "0 auto 48px", textAlign: "center" }}>
            <p style={{ ...eyebrow(), marginBottom: 24 }}>The Offer</p>
            <H2 style={{ fontSize: 64, lineHeight: 0.98, marginBottom: 24 }}>Introducing <span style={em}>The Alignment Audit.</span></H2>
            <p style={{ margin: "0 0 24px", fontSize: 17, lineHeight: 1.7, color: C.body }}>
              You answer my questions online, in your own time. Within seven working days I send you a blueprint written about you: where you actually are, what's costing you, and the move I'd make next. Then we go through it together on a one-hour call.
            </p>
            <p style={{ margin: "0 0 24px", fontFamily: SERIF, fontStyle: "italic", fontSize: 20, lineHeight: 1.5, color: C.burg }}>
              This is not a personality test. It's not a course. It's a diagnosis, written by me.
            </p>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: C.body }}>
              It runs on my A.L.I.V.E. Method: Awareness, Liberation, Intention, Vision, Embodiment. Around 60 questions everyone answers, then a module for your track. You can skip anything that feels too heavy to write down.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 40 }}>
            <p style={{ ...eyebrow(C.muted), fontWeight: 400, marginBottom: 14 }}>Choose your track</p>
            <div style={{ display: "inline-flex", flexWrap: "wrap", justifyContent: "center" }}>
              {trackBtn("business", "I run a business")}
              {trackBtn("career", "I have a career")}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            {[LETTERS[track].slice(0, 3), LETTERS[track].slice(3)].map((row, r) => (
              <div
                key={r}
                className="aa-alive-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`,
                  gap: 1,
                  background: "rgba(26,26,26,0.10)",
                  width: "100%",
                  maxWidth: row.length === 3 ? 999 : 666,
                }}
              >
                {row.map((l) => (
                  <div key={`${track}-${l.letter}`} className="aa-fade" style={{ background: C.card, padding: "36px 28px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                      <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 72, lineHeight: 1, color: C.burg }}>{l.letter}</span>
                      <span style={{ marginTop: 8, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: C.muted }}>{track === "business" ? "Business" : "Career"}</span>
                    </div>
                    <p style={{ margin: "0 0 8px", fontFamily: SERIF, fontWeight: 700, fontSize: 17 }}>{l.label}</p>
                    <p style={{ margin: "0 0 14px", fontFamily: SERIF, fontStyle: "italic", fontSize: 14, lineHeight: 1.4, color: C.burg }}>{l.sub}</p>
                    <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 600 }}>We look at:</p>
                    <p style={{ margin: "0 0 14px", fontSize: 12, lineHeight: 1.6, color: C.muted }}>{l.look}</p>
                    <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 600 }}>You get back:</p>
                    <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, fontStyle: "italic", color: C.burg }}>{l.back}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 48 }}>
            <p style={{ ...eyebrow(), textAlign: "center", marginBottom: 20 }}>{mod.title}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 1, background: "rgba(26,26,26,0.10)" }}>
              {mod.items.map((m) => (
                <div key={`${track}-${m.name}`} className="aa-fade" style={{ background: "#FFFFFF", padding: "28px 26px" }}>
                  <p style={{ margin: "0 0 10px", fontFamily: SERIF, fontSize: 20, color: C.burg }}>{m.name}</p>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65 }}>{m.body}</p>
                </div>
              ))}
            </div>
            <p style={{ margin: "18px auto 0", maxWidth: 640, fontSize: 13, lineHeight: 1.6, textAlign: "center", color: C.muted }}>
              Grouped the same way as the Clarity Sprint, so nothing is wasted if you go on to work with me.
            </p>
          </div>

          <p style={{ margin: "64px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 28, textAlign: "center", color: C.burg }}>
            One questionnaire. One blueprint. One hour. The thinking in between is mine.
          </p>
        </div>
      </section>

      {/* 5. WHAT YOU GET */}
      <section className="aa-sec" style={{ padding: "104px 24px", background: C.sand, borderTop: "1px solid rgba(74,14,46,0.1)" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ ...eyebrow(), marginBottom: 24 }}>What You Get</p>
            <H2 style={{ marginBottom: 16 }}>What you get inside <span style={em}>The Alignment Audit.</span></H2>
            <p style={{ margin: "0 auto", maxWidth: 620, fontSize: 15, color: C.muted }}>A complete senior diagnostic, for women who want an honest read before they decide what to do next.</p>
          </div>

          <p style={{ ...eyebrow(), marginBottom: 16 }}>The Core Audit</p>
          <div className="aa-core-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 1, background: "rgba(26,26,26,0.10)" }}>
            {[
              ["Your Alignment Questionnaire", "Included", "Business or career track, online, saved as you go. Six questions build on your Starting Point Profile, so you don't repeat yourself."],
              ["Your written blueprint", "$488", "Written by me within seven working days, section by section through the A.L.I.V.E. Method. Yours to keep."],
              ["One hour with me", "$304", "We go through your blueprint together on a call, so nothing in it stays theoretical. You leave knowing your next move and why."],
            ].map(([t, v, d]) => (
              <div key={t} style={{ background: C.card, padding: "30px 28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                  <p style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: 16 }}>{t}</p>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: C.burg, whiteSpace: "nowrap" }}>{v}</p>
                </div>
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: C.muted }}>{d}</p>
              </div>
            ))}
          </div>

          <div className="aa-box" style={{ marginTop: 16, padding: "56px 48px", background: C.card, border: `1px solid ${C.burg}` }}>
            <p style={{ ...eyebrow(), marginBottom: 16 }}>Included: written by me</p>
            <h3 style={{ margin: "0 0 20px", fontFamily: SERIF, fontWeight: 400, fontSize: 46, lineHeight: 1 }}>Your <span style={em}>blueprint.</span></h3>
            <p style={{ margin: "0 0 40px", maxWidth: 760, fontSize: 14, lineHeight: 1.7, color: C.body }}>Not a score or a personality type. A blueprint written about you, built from everything you tell me. It comes in two parts.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "48px 64px" }}>
              {[
                ["Part one: where you are", [
                  ["Your Energy Leak Map.", "Fourteen areas of your life, from sleep and money to your phone and the voice in your head, read for what they're doing to your energy."],
                  ["The receipts.", "Where last week's hours went, your spending pattern and the invisible load you carry for other people, set against what you say matters."],
                  ["Your blind spots.", "The conversation you're avoiding and the decision you keep making in your head, named plainly."],
                  ["What's costing you most.", "The beliefs and habits doing the damage, and what each one costs you now."],
                ]],
                ["Part two: where you go from here", [
                  ["What you actually want.", "Separated from what you think you should want."],
                  ["The two roads.", "Where the next year goes if nothing changes, and where it goes if you make the move."],
                  ["Your track.", "Your position, value, visibility and pace, read against your business or your career."],
                  ["Your next move.", "The one decision I'd make first in your position, why, and your first 30 days."],
                ]],
              ].map(([title, items]) => (
                <div key={title} style={{ flex: "1 1 320px", minWidth: 0 }}>
                  <p style={{ margin: "0 0 18px", fontFamily: SERIF, fontSize: 20, color: C.burg }}>{title}</p>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", fontSize: 13, lineHeight: 1.65 }}>
                    {items.map(([b, t]) => (
                      <li key={b} style={{ marginBottom: 14 }}><span style={{ fontWeight: 600 }}>{b}</span> {t}</li>
                    ))}
                  </ul>
                </div>
              ))}
              <div style={{ flex: "1 1 260px", minWidth: 0 }}>
                <img
                  className="aa-blueprint-img"
                  src="https://media.base44.com/images/public/69f46886a412ee042303f1af/b668ffb8a_generated_image.png"
                  alt="The Alignment Audit blueprint, held open"
                  style={{ display: "block", width: "100%", height: "auto", position: "relative", zIndex: 1, opacity: 1, mixBlendMode: "normal", filter: "none", border: 0 }}
                />
              </div>
            </div>
            <p style={{ margin: "48px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 22, textAlign: "center", color: C.burg }}>
              Most advice assumes you'll run like a machine. This is written for the woman who has to carry it out.
            </p>
          </div>

          <p style={{ ...eyebrow(), margin: "48px 0 16px" }}>Plus This Bonus</p>
          <div style={{ background: "rgba(38,3,15,0.95)", padding: "32px 30px", marginBottom: 64 }}>
            <span style={{ display: "inline-block", marginBottom: 14, padding: "5px 12px", border: "1px solid rgba(255,255,255,0.3)", fontSize: 9, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.75)" }}>Bonus</span>
            <p style={{ margin: "0 0 8px", fontFamily: SERIF, fontWeight: 700, fontSize: 17, color: "#FFFFFF" }}>Your full fee, credited to the Clarity Sprint</p>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: "rgba(255,255,255,0.72)" }}>
              If your blueprint shows you need one-to-one work with me, book the Clarity Sprint within 12 months and the full {PRICE} comes off. Your answers carry straight into our first session.
            </p>
          </div>

          <div id="buy" className="aa-box" style={{ maxWidth: 680, margin: "0 auto", padding: "56px 44px", background: "rgba(245,238,228,0.95)", border: "1px solid rgba(26,26,26,0.2)", textAlign: "center", boxSizing: "border-box" }}>
            <p style={{ margin: "0 0 6px", fontSize: 14, color: C.muted }}>If you booked each element separately at my standard rates:</p>
            <p style={{ margin: "0 0 28px", fontFamily: SERIF, fontSize: 28, color: C.muted, textDecoration: "line-through" }}>$792</p>
            <p style={{ margin: "0 0 22px", fontSize: 14, color: C.muted }}>The Alignment Audit is a standalone diagnostic, at</p>
            <p className="aa-price" style={{ margin: "0 0 6px", fontFamily: SERIF, fontWeight: 700, fontSize: 76, color: C.burg }}>{PRICE}</p>
            <p style={{ margin: "0 0 28px", fontSize: 13, color: C.muted }}>Paid once</p>
            <p style={{ margin: "0 0 32px", fontFamily: SERIF, fontStyle: "italic", fontSize: 15, lineHeight: 1.6, color: C.burg }}>That's less than one hour of my advisory time, for a written blueprint and an hour with me.</p>
            <BuyButton block />
            <p style={{ margin: "16px 0 0", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: C.muted }}>
              Online. Blueprint within seven working days.
            </p>
          </div>
        </div>
      </section>

      {/* 6. OBJECTIONS */}
      <section className="aa-sec" style={{ padding: "104px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <H2 style={{ lineHeight: 0.98, marginBottom: 48 }}>What you might be thinking right now.</H2>
          <div style={{ textAlign: "left", borderTop: `1px solid ${C.line}` }}>
            {FAQ.map((f) => (
              <details key={f.q} style={{ borderBottom: `1px solid ${C.line}`, padding: "20px 0" }}>
                <summary style={{ minHeight: 44, display: "flex", alignItems: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: C.burg }}>{f.q}</summary>
                <p style={{ margin: "12px 0 0", fontSize: 14, lineHeight: 1.7, color: C.body }}>{f.a}</p>
              </details>
            ))}
          </div>
          <p style={{ margin: "48px 0 24px", fontFamily: SERIF, fontStyle: "italic", fontSize: 22, color: C.burg }}>If you have read this far and you are still here, you already know what you are going to do.</p>
          <BuyButton />
        </div>
      </section>

      {/* 7. REVIEWS */}
      <section className="aa-sec" style={{ padding: "104px 24px", background: "#EDE7E0" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <H2 style={{ fontStyle: "italic", fontSize: 52, lineHeight: 1, marginBottom: 14 }}>What people say after working with me.</H2>
            <p style={{ margin: 0, fontSize: 14, color: C.muted }}>Senior receipts from the wider practice. Real outcomes. Named voices.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button type="button" className="aa-arrow" aria-label="Previous reviews" onClick={() => setPage((page - 1 + pages) % pages)} style={{ flex: "0 0 auto", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", color: C.ink }}>
              <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <div style={{ flex: "1 1 auto", minWidth: 0, overflow: "hidden" }}>
              <div style={{ display: "flex", transition: "transform 700ms cubic-bezier(0.4,0,0.2,1)", transform: `translateX(-${page * 100}%)` }}>
                {REVIEWS.map((t) => (
                  <figure key={t.name} style={{ flex: `0 0 ${100 / perView}%`, maxWidth: `${100 / perView}%`, boxSizing: "border-box", margin: 0, padding: "0 24px", textAlign: "center" }}>
                    <p style={{ margin: "0 0 22px", fontFamily: SERIF, fontWeight: 700, fontSize: 20, lineHeight: 1.15, textTransform: "uppercase" }}>{t.headline}</p>
                    <blockquote style={{ margin: "0 0 20px", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1.75, color: C.muted }}>{t.quote}</blockquote>
                    <figcaption style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: C.body }}>
                      <span style={{ color: C.burg }}>{t.name}</span>{t.company ? ` | ${t.company}` : ""}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
            <button type="button" className="aa-arrow" aria-label="Next reviews" onClick={() => setPage((page + 1) % pages)} style={{ flex: "0 0 auto", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", color: C.ink }}>
              <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20, marginTop: 40 }}>
            <button type="button" aria-label="Previous reviews" onClick={() => setPage((page - 1 + pages) % pages)} style={{ minWidth: 44, minHeight: 44, background: "transparent", border: "none", cursor: "pointer", fontSize: 18, color: C.ink }}>‹</button>
            <p style={{ margin: 0, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: C.muted }}>{page + 1} of {pages}</p>
            <button type="button" aria-label="Next reviews" onClick={() => setPage((page + 1) % pages)} style={{ minWidth: 44, minHeight: 44, background: "transparent", border: "none", cursor: "pointer", fontSize: 18, color: C.ink }}>›</button>
          </div>
        </div>
      </section>

      {/* 8. RIGHT FOR YOU */}
      <section className="aa-sec" style={{ padding: "104px 24px", background: C.burg }}>
        <div style={{ maxWidth: 1300, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56, color: C.ivory }}>
            <p style={{ ...eyebrow("rgba(245,241,236,0.6)"), fontWeight: 400, marginBottom: 24 }}>Is This Right For You?</p>
            <H2 style={{ color: C.ivory, lineHeight: 0.98 }}>Is this the right offer for you?</H2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40, marginBottom: 56 }}>
            {[
              ["This is for you if:", "M8 12l3 3 5-6", C.burg, [
                "You look completely capable from the outside and second-guess every big call on the inside.",
                "You know something is off and you can't name it yet.",
                "You want a senior read before you spend money on the wrong fix.",
                "You're not sure you're ready for six weeks, and you want to start somewhere real.",
              ]],
              ["This is not for you if:", "M9 9l6 6M15 9l-6 6", C.muted, [
                "You want someone to make the decision for you.",
                "You want reassurance more than the truth. I'll tell you what I see, even when it's not what you hoped to hear.",
                "You're not going to act on what you read.",
              ]],
            ].map(([title, d, color, items]) => (
              <div key={title} className="aa-box" style={{ background: "rgba(245,241,236,0.94)", padding: "44px 40px", borderRadius: 8 }}>
                <p style={{ ...eyebrow(C.ink), fontWeight: 700, marginBottom: 28 }}>{title}</p>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", fontSize: 14, lineHeight: 1.65 }}>
                  {items.map((it) => (
                    <li key={it} style={{ display: "flex", gap: 14, marginBottom: 18 }}><Icon d={d} color={color} /><span>{it}</span></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: "0 0 28px", fontFamily: SERIF, fontStyle: "italic", fontSize: 22, color: "rgba(245,241,236,0.85)" }}>If you have read both columns and you are still here, you already know which one applies to you.</p>
            <BuyButton />
          </div>
        </div>
      </section>

      {/* 9. THIS IS THE MOMENT */}
      <section className="aa-sec" style={{ padding: "120px 24px", background: "#F2EBE3", textAlign: "center" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <p style={{ ...eyebrow(C.muted), fontWeight: 400, marginBottom: 24 }}>Let's begin</p>
          <H2 style={{ lineHeight: 0.98, marginBottom: 24 }}>This is the moment.</H2>
          <p style={{ margin: "0 0 12px", fontSize: 15, lineHeight: 1.7, color: C.muted }}>You know what the Audit is, what it costs and what you walk away with. The only question left is whether you want the honest version.</p>
          <p style={{ margin: "0 0 40px", fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: C.burg }}>You don't need another opinion. You need an accurate one.</p>
          <div className="aa-box" style={{ maxWidth: 560, margin: "0 auto", padding: 32, border: "1px solid rgba(26,26,26,0.2)", background: "rgba(245,238,228,0.95)", boxSizing: "border-box" }}>
            <p style={{ margin: "0 0 12px", fontFamily: SERIF, fontSize: 20 }}>Get your Alignment Audit.</p>
            <ul style={{ margin: "0 0 24px", padding: 0, listStyle: "none", fontSize: 13, lineHeight: 1.9, color: C.muted }}>
              <li>{PRICE}, paid once.</li>
              <li>Your blueprint within seven working days.</li>
              <li>One hour with me to go through it.</li>
              <li>Full fee credited to the Clarity Sprint.</li>
            </ul>
            <BuyButton block />
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}