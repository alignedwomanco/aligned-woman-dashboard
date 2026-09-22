import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import LandingFooter from "@/components/home/LandingFooter";

/* ------------------------------------------------------------------
   MEET OUR FOUNDER
   Copy and design approved 22 Sep 2026.
   IMAGES: replace with the final uploads from the Base44 media library.
   HERO_IMAGE: egg-chair portrait (4:5). SECOND_IMAGE: crochet dress, arms folded (4:5).
   The page sits inside the site Layout (header) and ends with LandingFooter.
------------------------------------------------------------------ */
const HERO_IMAGE = "https://media.base44.com/images/public/69e1e7f05d39205bc001ea00/44ad00c70_LJT_17-04-2026-21-30-39.jpg";
const SECOND_IMAGE = "https://media.base44.com/images/public/69f46886a412ee042303f1af/4a8d06944_Facetune_17-04-2026-20-36-52.jpg";

const LINKS = {
  spp: "/StartingPointProfile",
  verified: "/Apply",
  cmo: "https://laurajanethomas.biz/fractional-cmo",
  coaching: "https://laurajanethomas.biz/services",
  speaking: "https://laurajanethomas.biz/speaking",
};

const C = { bg: "#F6EFE8", ink: "#080105", burg: "#4A0E2E", burgMid: "#6B1642", rose: "#C4847A", roseLight: "#E8B4AE", white: "#FFFFFF" };
const SERIF = "'Libre Baskerville', Baskerville, 'DM Serif Display', Georgia, serif";
const SANS = "'Montserrat', system-ui, sans-serif";

const CREDENTIALS = [
  { title: "Strategy and business", href: LINKS.cmo, items: [
    "Founder and Managing Partner of Salt & Candy, an award-winning brand strategy and marketing consultancy, since 2013. Built to multi-seven figures. 100% independently owned.",
    "Fractional CMO and brand adviser to founders, CEOs and senior teams.",
    "Degree in Brand Communications, Vega School.",
  ]},
  { title: "Leadership and governance", href: LINKS.cmo, items: [
    "Certified Director, Institute of Directors South Africa (cum laude).",
    "Former Chair of the 30% Club South Africa, working to increase women's representation on boards and in senior leadership.",
  ]},
  { title: "Coaching", href: LINKS.coaching, items: [
    "Certified Coach.",
    "Internationally certified NLP practitioner.",
    "Internationally certified Time Line Therapy practitioner.",
    "Creator of the Starting Point Profile and the ALIVE Method, the diagnostic and sequencing framework behind The Aligned Woman Blueprint.",
  ]},
  { title: "Speaking and writing", href: LINKS.speaking, items: [
    "Keynote speaker on burnout, alignment and women in leadership.",
    "Published author.",
    "Featured in Forbes, TechCrunch, Glamour, Business Day and The Times.",
  ]},
];

export default function Founder() {
  useEffect(() => {
    const id = "aw-founder-fonts";
    if (!document.getElementById(id)) {
      const l = document.createElement("link");
      l.id = id; l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@300;400;500&display=swap";
      document.head.appendChild(l);
    }
    document.title = "Meet our founder | Laura Jane Thomas | The Aligned Woman Co.";
    let m = document.querySelector('meta[name="description"]');
    if (!m) { m = document.createElement("meta"); m.name = "description"; document.head.appendChild(m); }
    m.content = "Laura Jane Thomas had the success everyone wants. It nearly cost her everything. She founded The Aligned Woman Co. so no woman has to figure this out alone.";
  }, []);

  return (
    <div style={{ background: C.bg, color: C.ink, fontFamily: SANS, fontWeight: 300 }}>
      <Hero />
      <Story />
      <Why />
      <Credentials />
      <Closing />
      <LandingFooter />
    </div>
  );
}

/* ---------------- Hero ---------------- */
function Hero() {
  return (
    <section className="relative w-full overflow-hidden h-[640px] md:h-[900px] lg:h-[920px]" style={{ background: C.burg, color: C.bg }}>
      <img src={HERO_IMAGE} alt="Laura Jane Thomas, founder of The Aligned Woman Co." className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "center 18%" }} />
      {/* mobile and tablet: vertical fade */}
      <div className="absolute inset-0 lg:hidden" style={{ background: "linear-gradient(180deg, rgba(74,14,46,0.05) 0%, rgba(74,14,46,0.35) 45%, rgba(74,14,46,0.92) 100%)" }} />
      {/* desktop: left-to-right fade plus a bottom fade */}
      <div className="absolute inset-0 hidden lg:block" style={{ background: "linear-gradient(90deg, rgba(74,14,46,0.88) 0%, rgba(74,14,46,0.55) 45%, rgba(74,14,46,0.05) 100%)" }} />
      <div className="absolute inset-0 hidden lg:block" style={{ background: "linear-gradient(180deg, rgba(74,14,46,0) 55%, rgba(74,14,46,0.7) 100%)" }} />

      <div className="absolute inset-x-0 bottom-0 px-5 pb-8 md:px-12 md:pb-14 lg:inset-x-auto lg:left-24 lg:bottom-24 lg:px-0 lg:pb-0 lg:w-[640px] flex flex-col gap-4 md:gap-5 lg:gap-7 items-center text-center lg:items-start lg:text-left">
        <div className="text-xs md:text-[13px] uppercase font-medium" style={{ letterSpacing: "0.18em", color: C.roseLight }}>Meet our founder</div>
        <h1 className="m-0 text-[34px] md:text-[52px] lg:text-[68px] leading-[1.08] lg:leading-[1.04]" style={{ fontFamily: SERIF, fontWeight: 400, color: C.bg }}>
          I had the success everyone wants. <em style={{ color: C.roseLight }}>It nearly cost me everything.</em>
        </h1>
        <div className="flex flex-col gap-1 pt-4 lg:pt-6 w-full lg:w-auto items-center lg:items-start" style={{ borderTop: "1px solid rgba(232,180,174,0.5)" }}>
          <div className="text-lg lg:text-[22px]" style={{ fontFamily: SERIF }}>Laura Jane Thomas</div>
          <div className="text-xs lg:text-[13px] uppercase" style={{ letterSpacing: "0.12em", color: C.roseLight }}>Founder, The Aligned Woman Co.</div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Story ---------------- */
function Story() {
  const big = { fontFamily: SERIF, color: C.burg, lineHeight: 1.45 };
  return (
    <section id="story" className="px-5 md:px-12 lg:px-24 pt-16 lg:pt-28 pb-12 lg:pb-24 flex flex-col items-center gap-10 lg:gap-14">
      <div className="w-full max-w-[1000px] flex flex-col gap-6 lg:gap-7 text-center lg:text-left">
        <div className="text-xs lg:text-[13px] uppercase font-medium" style={{ letterSpacing: "0.16em", color: C.burgMid }}>The story</div>
        <p className="m-0 text-[22px] md:text-2xl lg:text-[28px]" style={big}>I built the multi-seven-figure business and hit the milestones. I created the success most people are chasing.</p>
        <p className="m-0 text-[22px] md:text-2xl lg:text-[28px]" style={big}>And then I burned out. Slowly. Then all at once. Completely.</p>
        <p className="m-0 text-base md:text-[17px] lg:text-[19px]" style={{ lineHeight: 1.75 }}>The kind of burnout that takes the version of you who built it and makes it impossible to keep going. The kind that forces you to stop, question everything, and rebuild from the ground up.</p>
        <p className="m-0 text-base md:text-[17px] lg:text-lg" style={{ lineHeight: 1.7 }}>I used to think that was a personal failure. It wasn't. It was the predictable result of building inside a system that was never designed for a woman to last in it.</p>
        <p className="m-0 text-base md:text-[17px] lg:text-lg" style={{ lineHeight: 1.7 }}>What came next was the most defining chapter of my life. It forced me to redefine what success actually means. To understand what it looks like to build something that is not just successful, but sustainable, aligned, and honest about what I actually wanted.</p>
        <p className="m-0 text-base md:text-[17px] lg:text-lg" style={{ lineHeight: 1.7 }}>Now I do things differently. I've built a life and a business that are powerful, profitable, and a place I actually want to live inside.</p>
        <p className="m-0 text-base md:text-[17px] lg:text-lg" style={{ lineHeight: 1.7 }}>That is what I want for you. The kind of success that feels truly yours.</p>
      </div>

      {/* Pull quote card */}
      <div className="relative w-full max-w-[1248px] rounded-3xl p-8 lg:p-16 grid lg:grid-cols-2 gap-5 lg:gap-16 items-center overflow-hidden" style={{ background: C.white }}>
        <div aria-hidden="true" className="absolute select-none pointer-events-none text-[150px] md:text-[200px] lg:text-[260px] leading-none -left-1 top-6 lg:-left-2" style={{ fontFamily: SERIF, color: C.roseLight, opacity: 0.6, zIndex: 0 }}>“</div>
        <div aria-hidden="true" className="absolute select-none pointer-events-none text-[150px] md:text-[200px] lg:text-[260px] leading-none right-2 -bottom-16 lg:right-6 lg:-bottom-24" style={{ fontFamily: SERIF, color: C.roseLight, opacity: 0.6, zIndex: 0 }}>”</div>
        <div className="relative text-[34px] md:text-5xl lg:text-[56px] leading-[1.08] text-center lg:text-left" style={{ fontFamily: SERIF, color: C.burg, zIndex: 1 }}>
          I want you to become <em>dangerously competent.</em>
        </div>
        <div className="relative flex flex-col gap-4 lg:gap-5 text-center lg:text-left" style={{ zIndex: 1 }}>
          <p className="m-0 text-base md:text-[17px] lg:text-lg" style={{ lineHeight: 1.7 }}>Clear in your decisions, confident in your direction, and deeply aligned in the way you build your life and your business.</p>
          <p className="m-0 text-base md:text-[17px] lg:text-lg font-normal" style={{ lineHeight: 1.7, color: C.burg }}>You do not have to learn this the hard way. I did that for you already.</p>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Why AW exists ---------------- */
function Why() {
  return (
    <section id="why" className="px-5 md:px-12 lg:px-24 py-14 lg:py-24 grid md:grid-cols-[300px_minmax(0,1fr)] lg:grid-cols-[480px_minmax(0,1fr)] gap-8 md:gap-10 lg:gap-24 items-start" style={{ background: C.roseLight }}>
      <div className="md:sticky md:top-6 lg:top-8">
        {SECOND_IMAGE ? (
          <img src={SECOND_IMAGE} alt="Laura Jane Thomas" className="w-full rounded-2xl object-cover object-top h-[430px] md:h-[375px] lg:h-[600px]" />
        ) : (
          <div className="w-full rounded-2xl flex items-center justify-center text-center p-6 text-xs uppercase h-[430px] md:h-[375px] lg:h-[600px]" style={{ background: C.rose, color: C.burg, letterSpacing: "0.12em" }}>Second image of Laura</div>
        )}
      </div>
      <div className="flex flex-col gap-5 lg:gap-6 text-center md:text-left items-center md:items-start">
        <div className="text-xs lg:text-[13px] uppercase font-medium" style={{ letterSpacing: "0.16em", color: C.burg }}>Why The Aligned Woman Co. exists</div>
        <p className="m-0 text-[22px] md:text-2xl lg:text-[26px]" style={{ fontFamily: SERIF, color: C.burg, lineHeight: 1.45 }}>Women have been given fragmented answers to deeply interconnected problems.</p>
        <p className="m-0 text-base md:text-[17px] lg:text-lg" style={{ lineHeight: 1.7 }}>A specialist for the hormones. A therapist for the grief. A coach for the career. Each one looking at a single piece, none of them talking to each other, and a woman in the middle trying to assemble herself from five separate opinions.</p>
        <p className="m-0 text-base md:text-[17px] lg:text-lg" style={{ lineHeight: 1.7 }}>I know that woman, because I was her. Holding it all together, alone, and telling everyone I was fine.</p>
        <p className="m-0 text-base md:text-[17px] lg:text-lg" style={{ lineHeight: 1.7 }}>I built The Aligned Woman Co. so that no woman has to do that by herself. A place where she is seen, supported, and surrounded by people who understand what she is carrying.</p>
        <p className="m-0 text-base md:text-[17px] lg:text-lg" style={{ lineHeight: 1.7 }}>So I built the system that connects the pieces. Diagnostics to name the pattern you are running. Verified practitioners, education, community and events to do the work. Personalised guidance to tell you what to do next, and to measure whether it changed anything.</p>
        <div className="mt-2 lg:mt-4 p-6 lg:p-8 rounded-2xl text-lg lg:text-[22px] w-full" style={{ background: C.burg, color: C.bg, fontFamily: SERIF, lineHeight: 1.5 }}>
          We are not a wellness app. We are not a coaching platform. We are infrastructure: rigorous, evidence-informed, and built around the lived reality of women's lives.
        </div>
      </div>
    </section>
  );
}

/* ---------------- Credentials ---------------- */
function Credentials() {
  return (
    <section id="credentials" className="px-5 md:px-12 lg:px-24 pt-16 lg:pt-28 pb-12 lg:pb-24 flex flex-col gap-7 lg:gap-14 items-center md:items-stretch">
      <div className="grid lg:grid-cols-2 gap-6 lg:gap-20 items-end text-center md:text-left">
        <h2 className="m-0 text-[32px] md:text-[46px] lg:text-5xl leading-[1.1]" style={{ fontFamily: SERIF, fontWeight: 400, color: C.burg }}>My expertise and credentials</h2>
        <p className="m-0 text-base md:text-[17px] lg:text-lg" style={{ lineHeight: 1.7 }}>I have spent eighteen years at the intersection of three things most people keep separate: brand strategy, leadership, and the psychology of the woman doing the building. Everything on this platform draws on all three.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 w-full">
        {CREDENTIALS.map((c) => (
          <div key={c.title} className="rounded-2xl p-6 lg:p-8 flex flex-col gap-4 lg:gap-5 text-center md:text-left" style={{ background: C.white }}>
            <div className="text-xl lg:text-[22px] pb-3 lg:pb-4" style={{ fontFamily: SERIF, color: C.burg, borderBottom: `1px solid ${C.roseLight}` }}>{c.title}</div>
            <div className="flex flex-col gap-3 text-[15px]" style={{ lineHeight: 1.6 }}>
              {c.items.map((t) => <div key={t}>{t}</div>)}
            </div>
            <a href={c.href} target="_blank" rel="noreferrer" className="mt-auto self-center md:self-start inline-flex items-center rounded-full px-5 text-[13px] font-medium uppercase" style={{ minHeight: 44, border: `1px solid ${C.burg}`, color: C.burg, letterSpacing: "0.08em", textDecoration: "none" }}>Learn more</a>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Closing ---------------- */
function Closing() {
  return (
    <section id="start" className="px-5 md:px-12 lg:px-24 py-16 lg:py-28 flex flex-col items-center gap-6 lg:gap-9 text-center" style={{ background: C.ink, color: C.bg }}>
      <div className="max-w-[840px] text-[34px] md:text-5xl leading-[1.15]" style={{ fontFamily: SERIF }}>You do not have to figure this out alone.</div>
      <div className="text-base lg:text-lg" style={{ color: C.roseLight }}>Start with one honest picture of where you are.</div>
      <div className="flex flex-col md:flex-row gap-3 lg:gap-4 mt-2 w-full md:w-auto">
        <Link to={LINKS.spp} className="rounded-full px-9 py-5 text-[15px] font-medium text-center" style={{ background: C.rose, color: C.ink, textDecoration: "none", letterSpacing: "0.04em" }}>Take the Starting Point Profile</Link>
        <Link to={LINKS.verified} className="rounded-full px-9 py-5 text-[15px] font-medium text-center" style={{ border: `1px solid ${C.roseLight}`, color: C.bg, textDecoration: "none", letterSpacing: "0.04em" }}>Become AW Verified</Link>
      </div>
    </section>
  );
}