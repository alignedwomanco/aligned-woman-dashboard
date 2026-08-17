import React, { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

/* ------------------------------------------------------------------
   IMAGERY
   Drop the live URLs in here. While a value is empty that frame renders
   a toned placeholder carrying the photo brief, so nothing breaks and
   you can see which frames are still outstanding.
------------------------------------------------------------------ */
const IMAGES = {
  hero: "",
  land: "",
  equine: "",
  founder: "https://media.base44.com/images/public/69f46886a412ee042303f1af/012ea2a9d_DSC08133.JPG",
  diagramBackdrop: "",
  how01: "https://media.base44.com/images/public/69f46886a412ee042303f1af/746fee3f4_cfe01d31250750b899d3ae137c9a44d9.jpg",
  how02: "https://media.base44.com/images/public/69f46886a412ee042303f1af/27864d491_Screenshot2026-08-14at222748.png",
  how03: "",
  how04: "",
  how05: "",
  how06: "",
  how07: "",
  how08: "",
  how09: "",
  how10: "",
  how11: "",
  awakening: "https://media.base44.com/images/public/69f46886a412ee042303f1af/28bcb612c_2.png",
  balanceBg: "https://media.base44.com/images/public/69f46886a412ee042303f1af/a4241c6dc_4.png",
  balanceLeaf: "https://media.base44.com/images/public/69f46886a412ee042303f1af/bfa885394_5.png",
  balanceInset: "https://media.base44.com/images/public/69f46886a412ee042303f1af/6107e8f89_6.png",
  whatToExpect: "https://media.base44.com/images/public/69f46886a412ee042303f1af/ce75d05bb_3.png",
  theLand: "https://media.base44.com/images/public/69f46886a412ee042303f1af/937228dee_lions-head_1721080568_Lions-Head-Pixalot_Wall_Art.jpg"
};

/* ------------------------------------------------------------------
   DESTINATIONS
   Both CTAs point at /Apply until you confirm where they should land.
------------------------------------------------------------------ */
const APPLY_URL = "/Apply";
const REGISTER_URL = "/Apply";

const THREE_PARTS = [
{
  number: "01",
  title: "Body",
  node: "Regulation",
  body:
  "Something has to change in your physiology before anything changes in your thinking. Every retreat opens in the body, because self-assessment done while you are still braced produces nothing you can use."
},
{
  number: "02",
  title: "Behaviour",
  node: "Safety",
  body:
  "This is the depth work. Not a conversation about patterns in general, but the identification of yours specifically, named and read with practitioners in the room."
},
{
  number: "03",
  title: "Belonging",
  node: "Worth",
  body:
  "Belonging is a mechanism, not a feeling. You leave connected to the women who were there with you and clear on exactly what you are doing next."
}];


const EXPECT = [
"To go deep, and to be guided the whole way down.",
"To be fully accepted for who you are, whatever that looks like on the day you arrive.",
"To be able to show every part of yourself, because every part of you is welcome here.",
"To be given space. To be held. To breathe.",
"To be given the knowledge and the wisdom to find yourself.",
"And to leave with tools you will still be using long after you have unpacked."];


const PRACTICES = [
{
  key: "how01",
  title: "Trauma-informed somatic practice",
  body: "Working with what the body holds, at a pace your system can take. Nothing is forced open.",
  brief: "Practitioner's hands near a woman's back, not touching, cropped close, warm"
},
{
  key: "how02",
  title: "Polyvagal-informed nervous system regulation",
  body:
  "Understanding why you shut down, brace or over-function, and learning to shift your state deliberately.",
  brief: "Light on skin, shoulder and collarbone, documentary, deep and warm"
},
{
  key: "how03",
  title: "Internal Family Systems",
  body:
  "Meeting the parts of yourself you have spent years trying to silence, and understanding what each has been protecting.",
  brief: "Two hands resting on a table in conversation, cropped close, real environment"
},
{
  key: "how04",
  title: "Neuro Linguistic Programming",
  body:
  "Working with the language you use about yourself, and the patterns underneath it. Changing what you say changes what you believe is possible.",
  brief: "A woman mid-sentence, profile, caught not staged, warm and deep"
},
{
  key: "how05",
  title: "Womb work",
  body:
  "Held space for what women carry in the body and rarely speak about. Cycles, birth, loss, longing.",
  brief: "Hands resting low on the belly, fabric texture, cropped close, warm"
},
{
  key: "how06",
  title: "Embodiment work",
  body:
  "Reconnecting with your body as somewhere you live rather than somewhere you manage. Learning to feel a decision, not only think it.",
  brief: "Bare feet on ground, earth or stone, real texture, documentary"
},
{
  key: "how07",
  title: "Anger work",
  body:
  "Anger is information. Here it is given somewhere to go, safely and with structure, instead of being swallowed for another decade.",
  brief: "Clenched fists or tensed back and shoulders, movement, cropped close, deep tones"
},
{
  key: "how08",
  title: "Facilitated dialogue and council",
  body: "Group work with a real structure, where every woman is heard and no one has to perform.",
  brief: "Women seated in council, shot from behind shoulders, real room with depth"
},
{
  key: "how09",
  title: "Sound healing",
  body:
  "Sound used to settle the nervous system and quieten the thinking mind, so the work that follows lands deeper than analysis.",
  brief: "A hand mid-strike near an instrument, motion blur acceptable"
},
{
  key: "how10",
  title: "Floating sound baths",
  body:
  "Held in water, weightless, with sound moving through you rather than around you. One of the fastest routes we know into genuine stillness.",
  brief: "Water surface, light moving through it, texture only, deep and warm"
},
{
  key: "how11",
  title: "Spiritual and ceremonial practice",
  body:
  "Ritual, stillness and meaning, held with the same care as everything else. Depending on the edition, this may include cacao ceremony.",
  brief: "Hands holding a cup, steam, texture and skin"
}];


const STANDARD = [
{ term: "Paper.", detail: "Qualifications reviewed." },
{ term: "Register.", detail: "Professional registration checked where it applies." },
{ term: "Person.", detail: "Interviewed directly, not vetted on paper alone." },
{ term: "Promise.", detail: "Ethical commitments signed." },
{ term: "Present tense.", detail: "Renewed annually, not granted once." }];


const CREDENTIALS = [
{
  title: "NLP Life and Business Coach",
  body: "Neuro Linguistic Practitioner, internationally accredited with the American Board of NLP"
},
{
  title: "Time Line Therapy Practitioner",
  body:
  "Internationally accredited with the American Board of Hypnotherapy and the Time Line Therapy Association"
},
{
  title: "Woman Within Circle Guide Facilitator",
  body: "Trained through Woman Within International"
},
{
  title: "Certified Director, Cum Laude",
  body: "Institute of Directors South Africa, 2021"
},
{
  title: "Degree in Brand Communications, Marketing and Media",
  body: "Specialising in copywriting, Vega School of Brand Leadership"
}];


const VALUES = [
{
  title: "Privacy",
  body:
  "What is shared here stays here. Small groups, closed rooms, and no cameras where the work is happening. For many of the women who come to us, this is the first place in years they have been able to speak without calculating who might hear it. We take that seriously."
},
{
  title: "Qualified practitioners",
  body:
  "Everyone who holds a room for us is qualified to be in it. We check before they stand in front of you, not after. It is the reason we say no far more often than we say yes."
},
{
  title: "Holistic practice",
  body:
  "Body, mind and spirit are not separate problems with separate solutions. We work with all of it, because you do not experience your life in categories."
},
{
  title: "Joy",
  body:
  "Not everything has to be heavy to be meaningful. There will be depth, and there will also be long dinners, real laughter and the kind of lightness you forgot you had access to. The two have never been opposites."
}];


const FOR_YOU_IF = [
"You want real connection. With other women, and with yourself.",
"You are searching for answers you know you carry, and cannot seem to reach.",
"You know there is a better version of you in there. You just do not know how to get to her.",
"You want to know who you actually are, underneath all of it.",
"You are ready to release the things you have been too ashamed to touch."];


const EXPERIENCE = [
"Sound baths held on the water, beside a waterfall",
"Ceremony",
"NLP rewiring",
"Somatic and nervous system reset",
"Anger and shame release",
"Equine work",
"EFT tapping",
"Ritual and breathwork journeys",
"Nature immersion in the Western Cape"];


const DIFFERENT = [
{
  heading: "You will not spend four days talking about yourself.",
  paragraphs: [
  "You already know your story. You can explain yourself to anyone who asks, and somewhere along the way the explaining became another place to hide.",
  "This retreat works underneath that. Through the body, through horses, through movement and sound and the subconscious, which does not care how articulate you are and does not respond to a well-told story. That is exactly why it reaches what talking has not."]

},
{
  heading: "You will leave knowing something specific about yourself.",
  paragraphs: [
  "Not a feeling of insight that dissolves by Tuesday. A named result about how you operate, identified during the retreat and handed to you, so you know precisely what you are working with rather than carrying home a general sense that something changed."]

},
{
  heading: "It does not end when you leave.",
  paragraphs: [
  "Everything you learn is waiting in your private space on our platform. We check in. And ninety days later we look again and show you what actually held."]

},
{
  heading: "Nobody has to know you were here.",
  paragraphs: [
  "Every woman in the room signs the same confidentiality agreement you do. No lists, no tagging, no cameras where the work happens. For most women who come to us, this is the first place in years they have been able to speak without calculating who might hear it."]

}];


const DETAILS = [
{ label: "Dates", value: "28 to 31 January 2027" },
{ label: "Location", value: "Western Cape, South Africa", note: "Venue announced to applicants" },
{ label: "Duration", value: "Three nights, four days" },
{ label: "Group size", value: "Twelve women" },
{ label: "Included", value: "All sessions, accommodation and meals" }];


/* ------------------------------------------------------------------
   MANIFESTO
   The Invitation by Oriah Mountain Dreamer is a copyrighted poem, so it
   is not reproduced here. Paste the stanzas from your design file as
   separate strings below and the section renders exactly as designed.
   Worth confirming you hold permission to publish it in full first.
------------------------------------------------------------------ */
const MANIFESTO_LINES = [];

function Rise({ children, className, style, as = "div" }) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] || motion.div;

  if (reduce) {
    const Tag = as;
    return (
      <Tag className={className} style={style}>
        {children}
      </Tag>);

  }

  return (
    <MotionTag
      className={className}
      style={style}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}>
      
      {children}
    </MotionTag>);

}

function Slot({ src, alt, brief, className }) {
  if (src) {
    return <img src={src} alt={alt} className={`rt-img ${className || ""}`} />;
  }
  return (
    <div className={`rt-slot ${className || ""}`} role="img" aria-label={alt}>
      <span className="rt-slotText">{brief}</span>
    </div>);

}

function Diagram() {
  return (
    <svg
      viewBox="0 0 1000 1120"
      role="img"
      aria-label="Sacred geometry composition of Body, Behaviour and Belonging"
      className="rt-diagram rt-desktopOnly">
      
      <defs>
        <radialGradient id="rt-sg-ctr">
          <stop offset="0%" stopColor="var(--rt-rose-pale)" stopOpacity="0.4" />
          <stop offset="55%" stopColor="var(--rt-rose)" stopOpacity="0.14" />
          <stop offset="100%" stopColor="var(--rt-rose)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="rt-sg-node">
          <stop offset="0%" stopColor="var(--rt-rose)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--rt-rose)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g>
        <circle cx="500" cy="560" r="490" fill="none" stroke="rgba(250,245,243,0.5)" strokeWidth="2.5" strokeDasharray="2 14" strokeLinecap="round" />
        <animateTransform attributeName="transform" type="rotate" from="0 500 560" to="360 500 560" dur="60s" repeatCount="indefinite" />
      </g>
      <g>
        <circle cx="500" cy="560" r="440" fill="none" stroke="rgba(250,245,243,0.4)" strokeWidth="2.5" strokeDasharray="2 14" strokeLinecap="round" />
        <animateTransform attributeName="transform" type="rotate" from="360 500 560" to="0 500 560" dur="45s" repeatCount="indefinite" />
      </g>
      <line x1="500" y1="553" x2="180" y2="288" stroke="rgba(250,245,243,0.15)" strokeWidth="2" />
      <line x1="500" y1="553" x2="820" y2="288" stroke="rgba(250,245,243,0.15)" strokeWidth="2" />
      <line x1="500" y1="693" x2="500" y2="932" stroke="rgba(250,245,243,0.15)" strokeWidth="2" />

      <circle cx="500" cy="350" r="290" fill="rgba(250,245,243,0.025)" stroke="rgba(250,245,243,0.55)" strokeWidth="2.5" />
      <circle cx="335" cy="655" r="290" fill="rgba(250,245,243,0.025)" stroke="rgba(250,245,243,0.55)" strokeWidth="2.5" />
      <circle cx="665" cy="655" r="290" fill="rgba(250,245,243,0.025)" stroke="rgba(250,245,243,0.55)" strokeWidth="2.5" />

      <g className="rt-breathe">
        <circle cx="500" cy="553" r="210" fill="url(#rt-sg-ctr)" />
      </g>
      <circle cx="500" cy="553" r="140" fill="none" stroke="rgba(250,245,243,0.7)" strokeWidth="2.5" />
      <text x="500" y="563" textAnchor="middle" className="rt-dgCentre">Inner life</text>

      <text x="500" y="192" textAnchor="middle" className="rt-dgTitle">Body</text>
      <g textAnchor="middle" className="rt-dgBody">
        <text x="500" y="232">Something has to change in your</text>
        <text x="500" y="257">physiology before anything changes</text>
        <text x="500" y="282">in your thinking. Every retreat</text>
        <text x="500" y="307">opens in the body, because</text>
        <text x="500" y="332">self-assessment done while you are</text>
        <text x="500" y="357">still braced produces nothing</text>
        <text x="500" y="382">you can use.</text>
      </g>

      <text x="262" y="628" textAnchor="middle" className="rt-dgTitle">Behaviour</text>
      <g textAnchor="middle" className="rt-dgBody">
        <text x="262" y="668">This is the depth work.</text>
        <text x="262" y="693">Not a conversation about</text>
        <text x="262" y="718">patterns in general, but the</text>
        <text x="262" y="743">identification of yours</text>
        <text x="262" y="768">specifically, named and read</text>
        <text x="262" y="793">with practitioners</text>
        <text x="262" y="818">in the room.</text>
      </g>

      <text x="742" y="628" textAnchor="middle" className="rt-dgTitle">Belonging</text>
      <g textAnchor="middle" className="rt-dgBody">
        <text x="742" y="668">Belonging is a mechanism,</text>
        <text x="742" y="693">not a feeling. You leave</text>
        <text x="742" y="718">connected to the women who</text>
        <text x="742" y="743">were there with you and clear</text>
        <text x="742" y="768">on exactly what you are</text>
        <text x="742" y="793">doing next.</text>
      </g>

      <g className="rt-pulse">
        <circle cx="150" cy="262" r="120" fill="url(#rt-sg-node)" />
      </g>
      <g className="rt-pulse rt-pulse--b">
        <circle cx="850" cy="262" r="120" fill="url(#rt-sg-node)" />
      </g>
      <g className="rt-pulse rt-pulse--c">
        <circle cx="500" cy="1012" r="120" fill="url(#rt-sg-node)" />
      </g>
      <circle cx="150" cy="262" r="78" fill="none" stroke="rgba(250,245,243,0.4)" strokeWidth="2.5" />
      <circle cx="850" cy="262" r="78" fill="none" stroke="rgba(250,245,243,0.4)" strokeWidth="2.5" />
      <circle cx="500" cy="1012" r="78" fill="none" stroke="rgba(250,245,243,0.4)" strokeWidth="2.5" />
      <text x="150" y="269" textAnchor="middle" className="rt-dgNode">Regulation</text>
      <text x="850" y="269" textAnchor="middle" className="rt-dgNode">Safety</text>
      <text x="500" y="1019" textAnchor="middle" className="rt-dgNode">Worth</text>
    </svg>);

}

export default function Retreats() {
  const carRef = useRef(null);

  const scrollCar = (dir) => {
    const el = carRef.current;
    if (!el) return;
    const card = el.querySelector("[data-card]");
    const w = card ? card.offsetWidth + 16 : 360;
    el.scrollBy({ left: dir * w, behavior: "smooth" });
  };

  return (
    <div className="rt-root">
      <style>{`
        .rt-root {
          /* Olive, ivory and ink. These sit alongside the burgundy and rose
             tokens already in index.css. Scoped here so nothing else in the
             app is affected. Promote to :root when a second surface needs them. */
          --rt-olive-deep: #1B2412;
          --rt-olive: #243019;
          --rt-hunter: #314323;
          --rt-olive-label: #5A5F2E;
          --rt-green-wash: #F1F4ED;
          --rt-cream-page: #FAF5F3;
          --rt-cream-edition: #F8F4EF;
          --rt-bone: #EAE2D4;
          --rt-cream: #E8E0CB;
          --rt-blush: #F5DDD9;
          --rt-rose: #C4847A;
          --rt-rose-light: #E8B4AE;
          --rt-rose-pale: #EFCFC8;
          --rt-rose-deep: #A86460;
          --rt-burg: #4A0E2E;
          --rt-burg-mid: #6B1642;
          --rt-ink: #080105;
          --rt-ink-soft: #0E0208;
          --rt-body: #2A2226;
          --rt-body-soft: #4A3A2A;
          --rt-body-mid: #5A4A44;
          --rt-meta: #6B5B57;
          --rt-white: #FFFFFF;

          --rt-display: "Baskervville", "DM Serif Display", Georgia, serif;
          --rt-sans: "Montserrat", "Helvetica Neue", Arial, sans-serif;

          font-family: var(--rt-sans);
          color: var(--rt-ink);
          background: var(--rt-cream-page);
        }
        .rt-root p, .rt-root h1, .rt-root h2, .rt-root h3, .rt-root h4,
        .rt-root blockquote { margin: 0; }
        .rt-root img { display: block; }

        /* ---------- responsive switch ---------- */
        .rt-mobileOnly { display: none; }
        @media (max-width: 700px) {
          .rt-desktopOnly { display: none !important; }
          .rt-mobileOnly { display: block; }
        }
        .rt-grid-resp { }
        .rt-cols-resp { }
        @media (max-width: 700px) {
          .rt-grid-resp { grid-template-columns: 1fr !important; gap: 36px !important; }
          .rt-cols-resp { column-count: 1 !important; }
        }
        .rt-sticky-col { display: flex; flex-direction: column; justify-content: flex-start; }
        .rt-sticky-img { position: static; }
        @media (min-width: 701px) {
          .rt-sticky-img { position: sticky; top: 88px; }
        }

        /* ---------- surfaces ---------- */
        .rt-sec { padding: clamp(80px, 14vw, 140px) clamp(24px, 6vw, 80px); }
        .rt-sec--tall { padding: clamp(96px, 16vw, 160px) clamp(24px, 6vw, 80px); }
        .rt-sec--band { padding: clamp(56px, 9vw, 96px) clamp(24px, 6vw, 80px); }
        .rt-sec--bandTight { padding: clamp(48px, 8vw, 80px) clamp(24px, 6vw, 80px); }
        .rt-bg-page { background: var(--rt-cream-page); }
        .rt-bg-hunter { background: var(--rt-hunter); }
        .rt-bg-blush { background: var(--rt-blush); }
        .rt-bg-cream { background: var(--rt-cream); }
        .rt-bg-ink { background: var(--rt-ink); }
        .rt-bg-olive { background: var(--rt-olive); }
        .rt-bg-oliveDeep { background: var(--rt-olive-deep); }
        .rt-bg-edition { background: var(--rt-cream-edition); }

        .rt-w680 { max-width: 680px; margin: 0 auto; }
        .rt-w820 { max-width: 820px; margin: 0 auto; }
        .rt-w1100 { max-width: 1100px; margin: 0 auto; }
        .rt-w1240 { max-width: 1240px; margin: 0 auto; }

        /* ---------- type ---------- */
        .rt-eyebrow {
          font-size: 12px; font-weight: 700; letter-spacing: 0.28em;
          text-transform: uppercase;
        }
        .rt-subLabel {
          font-size: 11px; font-weight: 700; letter-spacing: 0.24em;
          text-transform: uppercase; color: var(--rt-olive-label);
          margin-bottom: 14px;
        }
        .rt-h1 {
          font-family: var(--rt-display); font-weight: 400;
          font-size: clamp(38px, 7vw, 72px); line-height: 1.22;
          letter-spacing: -0.01em; color: var(--rt-cream-page);
        }
        .rt-h2 {
          font-family: var(--rt-display); font-weight: 400;
          font-size: clamp(34px, 5.5vw, 56px); line-height: 1.25;
        }
        .rt-h2 i, .rt-h2 em { font-style: italic; }
        .rt-h3 {
          font-family: var(--rt-display); font-weight: 400;
          font-size: clamp(24px, 2.6vw, 30px); line-height: 1.3;
        }
        .rt-p {
          font-size: clamp(16px, 1.5vw, 18px); font-weight: 300;
          line-height: 1.75; color: var(--rt-body);
        }
        .rt-p--onDark { color: rgba(232,224,203,0.92); }
        .rt-p--sm { font-size: 16px; }
        .rt-pull {
          font-family: var(--rt-display); font-style: italic; font-weight: 400;
          font-size: clamp(26px, 4vw, 40px); line-height: 1.4; color: var(--rt-cream);
        }
        .rt-pull span { color: var(--rt-rose-light); }
        .rt-standfirst {
          font-family: var(--rt-display); font-style: italic; font-weight: 400;
          font-size: clamp(20px, 2.4vw, 26px); line-height: 1.4;
          color: var(--rt-rose-light);
        }

        /* ---------- buttons ---------- */
        .rt-btn {
          display: block; width: 100%; max-width: 460px; box-sizing: border-box;
          padding: 20px 28px; text-align: center; font-size: 12px; font-weight: 700;
          letter-spacing: 0.22em; text-transform: uppercase; text-decoration: none;
          border: none; border-radius: 0; transition: background 200ms ease;
        }
        .rt-btn--cream { background: var(--rt-cream); color: var(--rt-ink); }
        .rt-btn--cream:hover { background: var(--rt-cream-page); }
        .rt-btn--bone { background: var(--rt-bone); color: var(--rt-ink-soft); }
        .rt-btn--bone:hover { background: var(--rt-cream-edition); }
        .rt-btn--rose { background: var(--rt-rose); color: var(--rt-ink-soft); }
        .rt-btn--rose:hover { background: var(--rt-rose-deep); }
        .rt-fineprint {
          margin-top: 20px; font-size: 13px; font-weight: 300; line-height: 1.6;
        }

        /* ---------- media ---------- */
        .rt-fill { position: absolute; inset: 0; width: 100%; height: 100%; }
        .rt-veil { position: absolute; inset: 0; pointer-events: none; background: rgba(49,67,35,0.15); }
        .rt-veil--card { background: rgba(49,67,35,0.46); }
        .rt-img { width: 100%; height: 100%; object-fit: cover; }
        .rt-slot {
          width: 100%; height: 100%; display: flex; align-items: center;
          justify-content: center; padding: 24px; box-sizing: border-box;
          background: linear-gradient(160deg, var(--rt-hunter), var(--rt-olive-deep));
        }
        .rt-slotText {
          font-size: 12px; font-weight: 300; line-height: 1.5; text-align: center;
          color: rgba(232,224,203,0.88); max-width: 34ch;
        }

        /* ---------- 01 hero ---------- */
        .rt-hero { position: relative; min-height: 100svh; display: flex; align-items: flex-end; }
        .rt-hero__copy {
          position: relative; width: 100%; max-width: 820px;
          padding: clamp(24px, 6vw, 80px);
          padding-bottom: clamp(56px, 9vh, 104px);
          pointer-events: none;
        }
        .rt-hero__copy a { pointer-events: auto; }

        /* ---------- 04 three parts ---------- */
        .rt-parts {
          position: relative; overflow: hidden; background: var(--rt-ink);
          padding: clamp(96px, 16vw, 150px) clamp(24px, 6vw, 80px);
        }
        .rt-parts__backdrop {
          position: absolute; top: -2%; left: -2%; width: 104%; height: 104%;
          filter: blur(14px);
        }
        .rt-parts__inner { position: relative; max-width: 1160px; margin: 0 auto; text-align: center; }
        .rt-diagram {
          display: block; width: 100%; max-width: 740px;
          margin: 56px auto 0; overflow: visible;
        }
        .rt-dgTitle { font: 400 40px var(--rt-display); fill: #E8DFCA; }
        .rt-dgCentre { font: italic 400 30px var(--rt-display); fill: #E8DFCA; }
        .rt-dgBody { font: 300 15px var(--rt-sans); fill: #E8DFCA; }
        .rt-dgNode { font: 400 20px var(--rt-display); fill: #E8DFCA; }
        .rt-breathe { transform-box: fill-box; transform-origin: center; animation: rtBreathe 5s ease-in-out infinite; }
        .rt-pulse { transform-box: fill-box; transform-origin: center; animation: rtPulse 4.5s ease-in-out infinite; }
        .rt-pulse--b { animation-duration: 5.6s; animation-delay: -1.8s; }
        .rt-pulse--c { animation-duration: 6.2s; animation-delay: -3.4s; }
        @keyframes rtBreathe { 0%, 100% { transform: scale(1); opacity: 0.45; } 50% { transform: scale(1.12); opacity: 1; } }
        @keyframes rtPulse { 0%, 100% { transform: scale(0.9); opacity: 0.3; } 50% { transform: scale(1.12); opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .rt-breathe, .rt-pulse { animation: none; }
        }
        .rt-stack { margin: 48px auto 0; max-width: 480px; text-align: left; display: grid; gap: 40px; }
        .rt-stack.rt-mobileOnly { display: none; }
        @media (max-width: 700px) {
          .rt-stack.rt-mobileOnly { display: grid; }
        }
        .rt-stack__mark {
          width: 64px; height: 64px; border: 2px solid #E8DFCA;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px; font-family: var(--rt-display); font-style: italic;
          font-size: 18px; color: #E8DFCA;
        }
        .rt-stack h3 {
          margin-bottom: 14px; font-family: var(--rt-display); font-weight: 400;
          font-size: 30px; line-height: 1.2; color: #E8DFCA;
        }
        .rt-stack p { font-size: 15px; font-weight: 300; line-height: 1.75; color: #E8DFCA; }
        .rt-stack__node {
          margin-top: 14px; font-family: var(--rt-display); font-size: 17px;
          color: #E8DFCA;
        }

        /* ---------- 05 expect ---------- */
        .rt-expect { display: grid; gap: clamp(28px, 4vw, 40px); }
        .rt-expect p {
          font-size: clamp(17px, 1.8vw, 21px); font-weight: 300;
          line-height: 1.7; color: var(--rt-body);
        }

        /* ---------- 06b equine + 09 founder ---------- */
        .rt-split {
          display: flex; flex-wrap: wrap; gap: clamp(40px, 6vw, 80px);
        }
        .rt-split--centre { align-items: center; }
        .rt-split--top { align-items: flex-start; }
        .rt-split__media { flex: 1 1 300px; max-width: 460px; width: 100%; }
        .rt-split__media > * { width: 100%; aspect-ratio: 4 / 5; }
        .rt-split__copy { flex: 1 1 440px; max-width: 560px; }
        .rt-split--sticky { align-items: stretch; }
        .rt-split--sticky .rt-split__media { display: flex; flex-direction: column; justify-content: flex-start; }
        @media (min-width: 701px) {
          .rt-split--sticky .rt-split__media > * { position: sticky; top: 88px; }
        }
        .rt-founder__media { flex: 1 1 300px; max-width: 420px; width: 100%; align-self: stretch; }
        .rt-founder__sticky > * { width: 100%; aspect-ratio: 4 / 5; }
        .rt-founder__copy { flex: 1 1 440px; max-width: 640px; }
        @media (min-width: 701px) {
          .rt-founder__sticky { position: sticky; top: 32px; }
        }
        .rt-quote {
          padding-left: 24px; border-left: 2px solid var(--rt-burg);
          font-family: var(--rt-display); font-style: italic; font-weight: 400;
          font-size: clamp(19px, 2vw, 23px); line-height: 1.55; color: var(--rt-burg);
        }
        .rt-age {
          flex: 0 0 64px; font-family: var(--rt-display); font-weight: 400;
          font-size: clamp(26px, 2.8vw, 32px); line-height: 1.2; color: var(--rt-burg);
        }

        /* ---------- 07 carousel ---------- */
        .rt-carousel {
          display: flex; gap: 16px; overflow-x: auto;
          scroll-snap-type: x mandatory; scrollbar-width: none;
          padding: 0 clamp(24px, 6vw, 80px) 8px;
          scroll-padding-left: clamp(24px, 6vw, 80px);
        }
        .rt-carousel::-webkit-scrollbar { display: none; }
        .rt-card {
          position: relative; flex: 0 0 auto; width: min(78vw, 400px);
          aspect-ratio: 4 / 5; scroll-snap-align: start;
        }
        .rt-card__copy { position: absolute; left: 0; right: 0; bottom: 0; padding: 24px; pointer-events: none; }
        .rt-card__title {
          font-family: var(--rt-display); font-weight: 400;
          font-size: clamp(22px, 2.2vw, 27px); line-height: 1.3;
          color: var(--rt-cream-page); margin-bottom: 12px;
        }
        .rt-card__body { font-size: 13.5px; font-weight: 300; line-height: 1.6; color: rgba(250,245,243,0.92); }
        .rt-arrows { display: flex; gap: 3px; justify-content: flex-end; margin-top: 24px; }
        @media (hover: none) { .rt-arrows { display: none; } }
        .rt-arrow {
          width: 52px; height: 52px; display: flex; align-items: center;
          justify-content: center; background: transparent;
          border: 1px solid var(--rt-burg); color: var(--rt-burg);
          font-size: 18px; cursor: pointer; border-radius: 0;
          transition: background 200ms ease, color 200ms ease;
        }
        .rt-arrow:hover { background: var(--rt-burg); color: var(--rt-cream-page); }

        /* ---------- 08 standard rows ---------- */
        .rt-row {
          display: flex; flex-wrap: wrap; gap: 8px 48px;
          border-top: 1px solid rgba(232,224,203,0.18); padding: 26px 0;
        }
        .rt-row:last-of-type { border-bottom: 1px solid rgba(232,224,203,0.18); }
        .rt-row__term { flex: 0 1 220px; color: var(--rt-cream); }
        .rt-row__detail {
          flex: 1 1 280px; align-self: center; font-size: 16px;
          font-weight: 300; line-height: 1.7; color: rgba(232,224,203,0.88);
        }

        /* ---------- 10 values ---------- */
        .rt-values {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
          gap: 24px;
        }
        .rt-valueCard {
          background: var(--rt-green-wash); border-radius: 10px;
          padding: clamp(40px, 4vw, 56px) clamp(28px, 3vw, 40px); text-align: center;
        }
        .rt-valueCard h3 {
          margin-bottom: 20px; font-family: var(--rt-display); font-style: italic;
          font-weight: 400; font-size: clamp(26px, 2.8vw, 34px); line-height: 1.3;
          color: var(--rt-burg);
        }
        .rt-valueCard p { font-size: 15px; font-weight: 300; line-height: 1.75; color: var(--rt-body); }

        /* ---------- edition bands ---------- */
        .rt-editionRow {
          border-top: 1px solid rgba(74,14,46,0.18);
          padding: clamp(18px, 3vw, 26px) 0;
          font-family: var(--rt-display); font-weight: 400;
          font-size: clamp(18px, 2.2vw, 24px); line-height: 1.45; color: var(--rt-ink-soft);
        }
        .rt-editionRow:last-of-type {
          border-bottom: 1px solid rgba(74,14,46,0.18);
          font-style: italic; color: var(--rt-burg);
        }
        .rt-expRow {
          display: flex; align-items: baseline; gap: 20px;
          border-top: 1px solid rgba(248,244,239,0.16);
          padding: clamp(14px, 2.5vw, 20px) 0;
        }
        .rt-expRow:last-of-type { border-bottom: 1px solid rgba(248,244,239,0.16); }
        .rt-expRow__mark { flex: 0 0 28px; height: 1px; background: var(--rt-rose); align-self: center; }
        .rt-expRow p {
          font-family: var(--rt-display); font-weight: 400;
          font-size: clamp(21px, 2.8vw, 30px); line-height: 1.4; color: var(--rt-cream-edition);
        }
        .rt-details {
          border-top: 1px solid rgba(74,14,46,0.18);
          border-bottom: 1px solid rgba(74,14,46,0.18);
        }
        .rt-details summary {
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          padding: clamp(22px, 3.5vw, 30px) 0; cursor: pointer; list-style: none;
        }
        .rt-details summary::-webkit-details-marker { display: none; }
        .rt-details summary h3 {
          font-family: var(--rt-display); font-weight: 400;
          font-size: clamp(22px, 2.8vw, 28px); line-height: 1.3; color: var(--rt-ink-soft);
        }
        .rt-details__glyph { font-weight: 300; font-size: 22px; color: var(--rt-burg); flex-shrink: 0; }
        .rt-details[open] .rt-details__glyph { transform: rotate(45deg); }
        .rt-details__body { padding-bottom: clamp(32px, 5vw, 44px); display: grid; gap: clamp(32px, 5vw, 44px); }
        .rt-details__body h4 {
          margin-bottom: 16px; font-family: var(--rt-display); font-weight: 400;
          font-size: clamp(21px, 2.6vw, 26px); line-height: 1.35; color: var(--rt-ink-soft);
        }
        .rt-details__body p { font-size: 16px; font-weight: 300; line-height: 1.8; color: var(--rt-ink-soft); }
        .rt-detailBlock {
          border-top: 1px solid rgba(248,244,239,0.16);
          padding: clamp(24px, 4vw, 32px) 0;
        }
        .rt-detailBlock:last-of-type { border-bottom: 1px solid rgba(248,244,239,0.16); }
        .rt-detailBlock__label {
          margin-bottom: 10px; font-size: 10px; font-weight: 700; letter-spacing: 0.28em;
          text-transform: uppercase; color: var(--rt-rose);
        }
        .rt-detailBlock__value {
          font-family: var(--rt-display); font-weight: 400;
          font-size: clamp(23px, 3vw, 30px); line-height: 1.3; color: var(--rt-cream-edition);
        }
        .rt-detailBlock__note { margin-top: 8px; font-size: 13px; font-weight: 300; color: rgba(248,244,239,0.6); }

        /* ---------- 14 manifesto ---------- */
        .rt-poem {
          display: grid; gap: 28px; border-left: 2px solid var(--rt-rose);
          padding-left: clamp(24px, 3vw, 40px); font-family: var(--rt-display);
          font-weight: 400; font-size: clamp(19px, 2.1vw, 23px); line-height: 1.7;
          color: var(--rt-white);
        }
      `}</style>

      {/* 01 HERO */}
      <section className="rt-hero">
        <video
          className="rt-fill"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          src="https://pub-f81092ac00b24c449008a93f41d7542d.r2.dev/retreat-1.mp4"
          style={{ objectFit: "cover", objectPosition: "center" }} />
        
        <div
          className="rt-veil"
          style={{ background: "rgba(49,67,35,0.5)" }} />
        
        <div className="rt-hero__copy">
          <p className="rt-eyebrow" style={{ marginBottom: "20px", color: "var(--rt-cream)" }}>
            Retreats
          </p>
          <h1 className="rt-h1" style={{ marginBottom: "24px" }}>
            Bespoke retreats for women who are ready for something to change.
          </h1>
          <p
            className="rt-p"
            style={{
              marginBottom: "40px",
              maxWidth: "560px",
              fontSize: "clamp(16px, 1.8vw, 18px)",
              lineHeight: 1.7,
              color: "rgba(250,245,243,0.94)"
            }}>
            
            Immersive, multi-day experiences in South Africa, created for the woman who senses
            there is more available to her and wants to understand what has been standing in the way.
          </p>
          <a href="#next-retreat" className="rt-btn rt-btn--cream">
            See the next retreat
          </a>
        </div>
      </section>

      {/* "Not just rest" + "Most retreats" — two-column / overlapping layout */}
      <section className="rt-sec" style={{ background: "#F6F3ED" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Rise>
            <h2 className="rt-h2" style={{ marginBottom: "clamp(32px, 4vw, 56px)", color: "var(--rt-burg)" }}>
              Not just rest. <i className="[font-family:'Libre_Baskerville',_serif]">Awakening.</i>
            </h2>
          </Rise>
          <div
            className="rt-grid-resp"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 45fr) minmax(0, 55fr)",
              gap: "clamp(32px, 5vw, 80px)",
              alignItems: "stretch"
            }}>
            <Rise>
              <p className="rt-p" style={{ marginBottom: "28px", color: "#3C3630" }}>
                A retreat with us is not designed to help you recover from your life. It is designed
                to change your relationship with it.
              </p>
              <div className="rt-cols-resp" style={{ columnCount: 2, columnGap: 28 }}>
                <p className="rt-p" style={{ marginBottom: 18, color: "#3C3630" }}>
                  Together we bring the subconscious to the conscious. The patterns that have been
                  running quietly underneath your decisions become something you can see clearly,
                  understand fully, and finally work with rather than around. That is where clarity
                  comes from. Not from stepping away, but from finally seeing accurately.
                </p>
                <p className="rt-p" style={{ color: "#3C3630" }}>
                  You do not need to arrive with the answers. You only need to arrive open.
                </p>
              </div>
            </Rise>
            <div className="rt-sticky-col">
              <div className="rt-sticky-img" style={{ position: "relative", width: "100%", aspectRatio: "4 / 5", overflow: "hidden" }}>
                <Slot src={IMAGES.awakening} alt="Retreat setting" brief="Retreat setting" className="rt-fill" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rt-sec" style={{ background: "#F6F3ED" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Rise>
            <h2 className="rt-h2" style={{ marginBottom: "clamp(36px, 5vw, 64px)", color: "var(--rt-burg)", maxWidth: "880px" }}>
              Most retreats sit at one end or the other. We built ours in the middle.
            </h2>
          </Rise>
          <Rise>
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "clamp(360px, 46vw, 560px)",
                marginBottom: "clamp(56px, 7vw, 88px)"
              }}>
              <div style={{ position: "absolute", right: 0, top: 0, width: "62%", height: "100%", overflow: "hidden" }}>
                <Slot src={IMAGES.balanceBg} alt="Forest waterfall" brief="Forest waterfall" className="rt-fill" />
              </div>
              <div style={{ position: "absolute", left: 0, bottom: 0, width: "46%", height: "80%", overflow: "hidden" }}>
                <Slot src={IMAGES.balanceLeaf} alt="Forest leaves" brief="Forest leaves" className="rt-fill" />
              </div>
              <div
                style={{
                  position: "absolute",
                  left: "5%",
                  bottom: "-28px",
                  width: "clamp(110px, 12vw, 160px)",
                  height: "clamp(110px, 12vw, 160px)",
                  overflow: "hidden",
                  border: "6px solid #F6F3ED"
                }}>
                <Slot src={IMAGES.balanceInset} alt="Detail" brief="Detail" className="rt-fill" />
              </div>
            </div>
          </Rise>
          <div
            className="rt-grid-resp"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.15fr)",
              gap: "clamp(32px, 5vw, 72px)",
              alignItems: "start"
            }}>
            <Rise>
              <p className="rt-pull" style={{ color: "var(--rt-burg)" }}>
                Body opens. Behaviour does the work.{" "}
                <span style={{ color: "var(--rt-burg-mid)" }} className="[font-family:'Libre_Baskerville',_serif]">Belonging carries it home.</span>
              </p>
            </Rise>
            <Rise>
              <p className="rt-eyebrow" style={{ color: "var(--rt-olive-label)", marginBottom: 18 }}>
                The balance is the method
              </p>
              <div className="rt-cols-resp" style={{ columnCount: 2, columnGap: 28 }}>
                <p className="rt-p" style={{ marginBottom: 18, color: "#3C3630" }}>
                  After years of research and practice, we found that retreats rarely support women
                  in the way real change requires.
                </p>
                <p className="rt-p" style={{ marginBottom: 18, color: "#3C3630" }}>
                  They are either too spiritual, without enough grounded practice to survive an
                  ordinary Tuesday. Or too clinical, with nothing in them that reaches the parts of
                  you that thinking alone cannot change.
                </p>
                <p className="rt-p" style={{ marginBottom: 18, color: "#3C3630" }}>
                  The balance between the two is where alignment actually happens. Our retreats are
                  built to hold both.
                </p>
                <p className="rt-p" style={{ color: "#3C3630" }}>
                  No two are the same. But every one of them follows the same method, and the same
                  three elements are always present.
                </p>
              </div>
            </Rise>
          </div>
        </div>
      </section>

      {/* 04 BODY BEHAVIOUR BELONGING */}
      <section className="rt-parts">
        <div className="rt-parts__backdrop">
          <Slot src={IMAGES.diagramBackdrop} alt="" brief="" className="rt-fill" />
        </div>
        <Rise className="rt-parts__inner">
          <h2
            className="rt-h2"
            style={{
              fontSize: "clamp(34px, 5.5vw, 48px)",
              lineHeight: 1.1,
              color: "#E8DFCA"
            }}>
            
            Body. Behaviour. <em style={{ color: "#E8DFCA" }} className="[font-family:'Libre_Baskerville',_serif]">Belonging.</em>
          </h2>
          <p
            style={{
              marginTop: "16px",
              fontSize: "15px",
              fontWeight: 300,
              lineHeight: 1.8,
              color: "#E8DFCA"
            }}>
            
            Everything we create is built around three principles.
          </p>

          <Diagram />

          <div className="rt-stack rt-mobileOnly">
            {THREE_PARTS.map((part) =>
            <div key={part.title}>
                <div className="rt-stack__mark">{part.number}</div>
                <h3>{part.title}</h3>
                <p>{part.body}</p>
                <p className="rt-stack__node">{part.node}</p>
              </div>
            )}
          </div>
        </Rise>
      </section>

      {/* 05 WHAT TO EXPECT */}
      <section className="rt-sec" style={{ background: "#F6F3ED" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Rise style={{ display: "flex", justifyContent: "flex-end" }}>
            <h2 className="rt-h2" style={{ marginBottom: "clamp(32px, 4vw, 56px)", color: "var(--rt-burg)", textAlign: "right" }}>
              What to expect
            </h2>
          </Rise>
          <div
            className="rt-grid-resp"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 45fr) minmax(0, 55fr)",
              gap: "clamp(32px, 5vw, 80px)",
              alignItems: "stretch"
            }}>
            <div className="rt-sticky-col">
              <div className="rt-sticky-img" style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
                <Slot src={IMAGES.whatToExpect} alt="What to expect" brief="What to expect on retreat" className="rt-fill" />
              </div>
            </div>
            <Rise>
              <div className="rt-expect">
                {EXPECT.map((line) =>
                <p key={line} style={{ color: "#3C3630" }}>{line}</p>
                )}
              </div>
            </Rise>
          </div>
        </div>
      </section>

      {/* 06 THE LAND */}
      <section>
        <div
          className="rt-bg-hunter"
          style={{ padding: "clamp(72px, 12vw, 120px) clamp(24px, 6vw, 80px)" }}>
          <div style={{ maxWidth: 1240, margin: "0 auto" }}>
            <div
              className="rt-grid-resp"
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 45fr) minmax(0, 55fr)",
                gap: "clamp(32px, 5vw, 80px)",
                alignItems: "stretch"
              }}>
              <Rise>
                <h2 className="rt-h2" style={{ marginBottom: "32px", color: "var(--rt-cream)" }}>
                  The land does some of the work
                </h2>
                <p className="rt-p rt-p--onDark" style={{ marginBottom: "24px" }}>
                  Africa has always been a deeply healing place, and we do not take that lightly.
                </p>
                <p className="rt-p rt-p--onDark" style={{ marginBottom: "24px" }}>
                  Our spaces are chosen with care and we work with the land rather than on top of it.
                  Somewhere the noise drops away, the light changes how you feel, and the ground under
                  you asks you to slow down before anyone has said a word.
                </p>
                <p className="rt-p rt-p--onDark">
                  Place is not the backdrop to this work. It is part of the method.
                </p>
              </Rise>
              <div className="rt-sticky-col">
                <div className="rt-sticky-img" style={{ position: "relative", width: "100%", aspectRatio: "4 / 5", overflow: "hidden" }}>
                  <Slot src={IMAGES.theLand} alt="Lion's Head at golden hour" brief="African landscape at golden hour" className="rt-fill" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 06b EQUINE-ASSISTED WORK */}
      <section className="rt-sec rt-bg-cream">
        <div className="rt-w1100 rt-split rt-split--centre rt-split--sticky">
          <div className="rt-split__media">
            <video
              src="https://pub-f81092ac00b24c449008a93f41d7542d.r2.dev/SCOTY.mp4"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                borderRadius: "inherit"
              }}
              autoPlay
              muted
              loop
              playsInline />
          </div>
          <Rise className="rt-split__copy">
            <h2
              className="rt-h2"
              style={{ marginBottom: "28px", fontSize: "clamp(30px, 4.5vw, 48px)" }}>
              
              Equine-assisted work
            </h2>
            <p className="rt-p" style={{ marginBottom: "24px" }}>
              Horses respond to the state you are actually in, not the one you are presenting. They
              act as emotional mirrors, giving immediate feedback with no interpretation and no
              delay. For a woman who has spent twenty years managing how she comes across, that is
              the whole point. There is nowhere to perform.
            </p>
            <p className="rt-p" style={{ marginBottom: "24px" }}>
              It is also why this work reaches women that talking has not. It has been used
              deliberately with people for whom talk-based approaches were not working. In one study
              of adult women, equine coaching was associated with improvements in depression,
              anxiety and general health, and participants elsewhere have described an increased
              sense of peace, less anxiety, and more trust in themselves and in others.
            </p>
            <p className="rt-p" style={{ marginBottom: "24px" }}>
              Horses have been part of my life since before I could walk. Three years ago, at the
              start of my own healing, I did this work with my own horse and processed something I
              had never been able to reach any other way. That is why equine work is part of our
              retreats wherever the space allows it.
            </p>
            <p
              style={{
                fontFamily: "var(--rt-display)",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "clamp(20px, 2.2vw, 25px)",
                lineHeight: 1.4,
                color: "var(--rt-burg)"
              }}>
              
              Laura
            </p>
          </Rise>
        </div>
      </section>

      {/* 07 HOW WE WORK */}
      <section className="rt-bg-page" style={{ padding: "clamp(80px, 14vw, 140px) 0" }}>
        <Rise className="rt-w1100" style={{ padding: "0 clamp(24px, 6vw, 80px)" }}>
          <h2 className="rt-h2" style={{ marginBottom: "28px" }}>How we work</h2>
          <p className="rt-p" style={{ marginBottom: "12px", maxWidth: "640px" }}>
            We work with a range of practices, chosen and sequenced for the women in the room rather
            than delivered from a fixed template.
          </p>
          <p className="rt-p" style={{ marginBottom: "clamp(40px, 6vw, 56px)" }}>
            Some of what we draw on:
          </p>
        </Rise>

        <div className="rt-carousel" ref={carRef}>
          {PRACTICES.map((practice) =>
          <div className="rt-card" data-card="1" key={practice.key}>
              <Slot
              src={IMAGES[practice.key]}
              alt={practice.title}
              brief={practice.brief}
              className="rt-fill" />
            
              <div className="rt-veil rt-veil--card" />
              <div className="rt-card__copy">
                <p className="rt-card__title">{practice.title}</p>
                <p className="rt-card__body">{practice.body}</p>
              </div>
            </div>
          )}
        </div>

        <div className="rt-w1100" style={{ padding: "0 clamp(24px, 6vw, 80px)" }}>
          <div className="rt-arrows">
            <button
              type="button"
              className="rt-arrow"
              aria-label="Previous practice"
              onClick={() => scrollCar(-1)}>
              
              ←
            </button>
            <button
              type="button"
              className="rt-arrow"
              aria-label="Next practice"
              onClick={() => scrollCar(1)}>
              
              →
            </button>
          </div>
          <p
            style={{
              margin: "clamp(32px, 5vw, 48px) 0 0",
              fontStyle: "italic",
              fontSize: "clamp(15px, 1.4vw, 17px)",
              fontWeight: 300,
              lineHeight: 1.7,
              color: "var(--rt-burg)"
            }}>
            
            Nothing is compulsory. You can be in every room and speak in none of them.
          </p>
        </div>
      </section>

      {/* 08 HELD BY PEOPLE WE TRUST */}
      <section className="rt-sec rt-sec--tall rt-bg-hunter">
        <Rise className="rt-w820">
          <h2 className="rt-h2" style={{ marginBottom: "28px", color: "var(--rt-cream)" }}>
            Held by people we trust completely
          </h2>
          <p
            className="rt-p rt-p--onDark"
            style={{ marginBottom: "clamp(48px, 7vw, 64px)", maxWidth: "620px" }}>
            
            Every practitioner who holds a room for us is drawn from the same register we hold every
            specialist to.
          </p>
          {STANDARD.map((row) =>
          <div className="rt-row" key={row.term}>
              <p className="rt-h3 rt-row__term">{row.term}</p>
              <p className="rt-row__detail">{row.detail}</p>
            </div>
          )}
        </Rise>
      </section>

      {/* 09 MEET THE FOUNDER */}
      <section className="rt-sec rt-bg-cream">
        <div className="rt-w1100 rt-split rt-split--top">
          <div className="rt-founder__media">
            <div className="rt-founder__sticky">
              <Slot
                src={IMAGES.founder}
                alt="Laura, founder of The Aligned Woman Co."
                brief="Laura, founder portrait, direct gaze, natural expression, real environment" />
              
            </div>
          </div>

          <div className="rt-founder__copy">
            <p className="rt-eyebrow" style={{ marginBottom: "24px", color: "var(--rt-burg)" }}>
              Meet the founder
            </p>
            <p
              style={{
                marginBottom: "clamp(40px, 5vw, 56px)",
                fontFamily: "var(--rt-display)",
                fontWeight: 400,
                fontSize: "clamp(26px, 3.2vw, 36px)",
                lineHeight: 1.35
              }}>
              
              Hi, I'm Laura, the founder of The Aligned Woman Co.
            </p>

            <p className="rt-subLabel">The story most women share</p>
            <p className="rt-p rt-p--sm" style={{ marginBottom: "22px" }}>
              My story runs deep, but I don't think it's completely unique. I believe a lot of women
              have gone through it. They just haven't had the vocabulary to speak it, to label it,
              and the world hasn't cared enough to help us really cure it.
            </p>
            <p className="rt-p rt-p--sm" style={{ marginBottom: "22px" }}>
              The reality is that women have been told to function in a world that wasn't built for
              them, and as a result we've been put on the back foot no matter how hard we work. The
              system is rigged against us.
            </p>
            <p className="rt-p rt-p--sm" style={{ marginBottom: "clamp(36px, 4vw, 48px)" }}>
              We have no playbook to work from. We're making it up as we go along, and this has led
              to the highest rate of women in burnout in history.
            </p>

            <blockquote className="rt-quote" style={{ marginBottom: "clamp(36px, 4vw, 48px)" }}>
              We're told to be in our feminine, but we must also take on most of the unpaid load at
              home. Raise children with care, but bring home 50% of the money. Look good, feel good,
              be happy. Don't complain. Anger doesn't look good on you. Work harder to be taken a
              little more seriously, but not too much.
            </blockquote>
            <p className="rt-p rt-p--sm" style={{ marginBottom: "22px" }}>
              And don't even get me started on the medical system.
            </p>
            <p className="rt-p rt-p--sm" style={{ marginBottom: "clamp(36px, 4vw, 48px)" }}>
              All of this failed me. Like it's failed so many others.
            </p>

            <p className="rt-subLabel">Good on paper</p>
            <div style={{ display: "grid", gap: "20px", marginBottom: "clamp(36px, 4vw, 48px)" }}>
              <div style={{ display: "flex", gap: "20px" }}>
                <p className="rt-age">32</p>
                <p className="rt-p rt-p--sm">
                  By 32 I was making more money than I knew what to do with. I had built and was
                  running a multi-7-figure business, I was travelling business and first class so
                  often I probably don't even know how to turn right anymore. I'd won awards at
                  work, and in my sport. Travelled the world. Never said no to a good time. But deep
                  down I had that gnawing feeling that something wasn't quite right.
                </p>
              </div>
              <div style={{ display: "flex", gap: "20px" }}>
                <p className="rt-age">35</p>
                <p className="rt-p rt-p--sm">
                  By 35 I was divorced, so burnt out I couldn't get out of bed, and given such bad
                  advice about medication that at one point I was even suicidal. If you knew me, you
                  wouldn't believe this. I couldn't even believe it!
                </p>
              </div>
            </div>
            <p
              style={{
                marginBottom: "clamp(36px, 4vw, 48px)",
                fontFamily: "var(--rt-display)",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "clamp(20px, 2.2vw, 25px)",
                lineHeight: 1.5
              }}>
              
              How does this happen to someone who looks so good on paper?
            </p>

            <p className="rt-subLabel">The real work</p>
            <p className="rt-p rt-p--sm" style={{ marginBottom: "22px" }}>
              The missing pieces of my life, of my soul, needed putting back together, and no talk
              therapist alone was getting anywhere with me. And so the journey back to myself began.
            </p>
            <p className="rt-p rt-p--sm" style={{ marginBottom: "22px" }}>
              Not the work I thought I was doing. Not the spiritual bypassing I'd become accustomed
              to for so long. The real work.
            </p>
            <p className="rt-p rt-p--sm" style={{ marginBottom: "clamp(36px, 4vw, 48px)" }}>
              I spent years, and hundreds of thousands, figuring out what it really means to do "the
              work" as a woman. There's no quick fix, and no linear, cut and paste way. But there is
              a method, and I believe it will get you there a lot faster than anything I've ever
              seen.
            </p>

            <p className="rt-subLabel">Why we check everything</p>
            <p className="rt-p rt-p--sm" style={{ marginBottom: "22px" }}>
              Along the way I also spent a lot of money and time on people who did far more harm
              than good. At one point I nearly paid for that with my life.
            </p>
            <p className="rt-p rt-p--sm" style={{ marginBottom: "clamp(36px, 4vw, 48px)" }}>
              That is why doing the correct due diligence on every facilitator we work with is one
              of my highest values, and one of this company's. I will not put a woman in a room with
              someone I haven't checked myself. There is nothing about this I am willing to be
              casual with.
            </p>

            <p className="rt-subLabel">Why the retreats exist</p>
            <p className="rt-p rt-p--sm" style={{ marginBottom: "22px" }}>
              I couldn't find everything I've found in any one place. It took years of travelling
              and searching across the world. So I've brought those teachings together, and put them
              in one place.
            </p>
            <p className="rt-p rt-p--sm" style={{ marginBottom: "22px" }}>
              The Aligned Woman Co. retreats were born to create transformative experiences that
              bring it all together. Wellness and transformational practices, community, and
              practitioners who are genuinely qualified and genuinely experienced.
            </p>
            <p className="rt-p rt-p--sm" style={{ marginBottom: "40px" }}>
              It is my soul's and my heart's desire to help women get to where they need to be,
              without going through what I went through.
            </p>

            <p
              style={{
                marginBottom: "16px",
                fontFamily: "var(--rt-display)",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "clamp(24px, 3vw, 32px)",
                lineHeight: 1.4,
                color: "var(--rt-burg)"
              }}>
              
              Join me on the journey back to yourself.
            </p>
            <p style={{ marginBottom: "4px", fontSize: "15px", fontWeight: 600 }}>Laura</p>
            <p
              style={{
                marginBottom: "clamp(48px, 7vw, 64px)",
                fontSize: "13px",
                fontWeight: 300,
                color: "var(--rt-body-mid)"
              }}>
              
              Founder, The Aligned Woman Co.
            </p>

            <div style={{ borderTop: "1px solid var(--rt-burg)", paddingTop: "32px" }}>
              <p
                className="rt-eyebrow"
                style={{ marginBottom: "8px", letterSpacing: "0.24em", color: "var(--rt-burg)" }}>
                
                Laura Thomas
              </p>
              <p
                style={{
                  marginBottom: "28px",
                  fontSize: "13px",
                  fontWeight: 300,
                  lineHeight: 1.6,
                  color: "var(--rt-body-soft)"
                }}>
                
                Award-winning business strategist, published author and speaker.
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
                  gap: "20px 40px"
                }}>
                
                {CREDENTIALS.map((credential) =>
                <div key={credential.title}>
                    <p style={{ marginBottom: "4px", fontSize: "13px", fontWeight: 600, lineHeight: 1.5 }}>
                      {credential.title}
                    </p>
                    <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 300,
                      lineHeight: 1.6,
                      color: "var(--rt-body-soft)"
                    }}>
                    
                      {credential.body}
                    </p>
                  </div>
                )}
              </div>
              <p
                style={{
                  marginTop: "40px",
                  fontSize: "12px",
                  fontWeight: 300,
                  color: "var(--rt-meta)"
                }}>
                
                If you are struggling, please reach out. SADAG, 0800 567 567.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10 OUR VALUES */}
      <section className="rt-sec rt-bg-page">
        <Rise className="rt-w1240">
          <p
            className="rt-eyebrow"
            style={{ marginBottom: "20px", textAlign: "center", color: "var(--rt-burg)" }}>
            
            Our values
          </p>
          <h2
            className="rt-h2"
            style={{
              margin: "0 auto clamp(48px, 7vw, 72px)",
              maxWidth: "880px",
              textAlign: "center"
            }}>
            
            What we hold <em style={{ color: "var(--rt-olive-label)" }}>without exception.</em>
          </h2>
          <div className="rt-values">
            {VALUES.map((value) =>
            <div className="rt-valueCard" key={value.title}>
                <h3>{value.title}</h3>
                <p>{value.body}</p>
              </div>
            )}
          </div>
        </Rise>
      </section>

      {/* 11 IT DOES NOT END */}
      <section className="rt-sec rt-sec--tall rt-bg-hunter">
        <Rise className="rt-w680">
          <h2 className="rt-h2" style={{ marginBottom: "32px", color: "var(--rt-cream)" }}>
            It does not end when you fly home
          </h2>
          <p className="rt-p rt-p--onDark" style={{ marginBottom: "24px" }}>
            Most retreats end at the airport. That is why most of what happens on them does not last.
          </p>
          <p className="rt-p rt-p--onDark" style={{ marginBottom: "24px" }}>
            Everything you learn is waiting for you in a private online space when you get back.
            Your workbooks, the guidance from each session, and the practices you were given, all in
            one place, so the work does not live in a notebook you stop opening.
          </p>
          <p className="rt-p rt-p--onDark" style={{ marginBottom: "56px" }}>
            We check in with you afterwards, and the women who were there with you are in that
            space too.
          </p>
          <p className="rt-pull">
            The retreat is the middle of this. <span>Not the whole of it.</span>
          </p>
        </Rise>
      </section>

      {/* EDITION ONE, BAND 1 THE RETREAT */}
      <section id="next-retreat" className="rt-sec--band rt-bg-oliveDeep">
        <Rise className="rt-w820" style={{ width: "100%" }}>
          <p className="rt-eyebrow" style={{ marginBottom: "16px", color: "var(--rt-rose)" }}>
            Edition One · 2027
          </p>
          <h2
            className="rt-h2"
            style={{
              marginBottom: "12px",
              fontSize: "clamp(44px, 9vw, 88px)",
              lineHeight: 1.12,
              color: "var(--rt-cream-edition)"
            }}>
            
            Release and Restart
          </h2>
          <p
            className="rt-standfirst"
            style={{ marginBottom: "clamp(28px, 4vw, 40px)", fontSize: "clamp(21px, 3vw, 30px)" }}>
            
            What if four days could change everything?
          </p>
          <p
            style={{
              marginBottom: "14px",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "rgba(248,244,239,0.85)"
            }}>
            
            28 to 31 January 2027 · Western Cape · Twelve places
          </p>
          <div style={{ width: "100%", height: "1px", background: "rgba(248,244,239,0.22)" }} />
        </Rise>
      </section>

      {/* BAND 2 THE FEELING */}
      <section className="rt-sec--band rt-bg-edition">
        <Rise className="rt-w680">
          {[
          "There is a particular relief in being somewhere that asks nothing of you except to be exactly who you are, at your core.",
          "For four days in the Western Cape, held by Mama Africa, you will be guided and released from everything you thought you needed to be. You will put down the invisible shackles. You will find a space safe enough to return to yourself, and to meet what you are actually capable of.",
          "You will not be the capable one. You will not hold anything, manage anyone or explain yourself. You will be guided, fed, held, and left alone when you need to be, among eleven women who understand exactly why you came without you having to say it.",
          "Some of it will be hard. The work that reaches what talking has not usually is. But you will not be taken anywhere you are not carried through, and you will not be asked to do anything you do not want to do."].
          map((line) =>
          <p
            key={line.slice(0, 24)}
            style={{
              marginBottom: "24px",
              fontSize: "clamp(17px, 1.8vw, 20px)",
              fontWeight: 300,
              lineHeight: 1.8,
              color: "var(--rt-ink-soft)"
            }}>
            
              {line}
            </p>
          )}
          <p
            style={{
              marginBottom: "clamp(32px, 5vw, 44px)",
              fontSize: "clamp(17px, 1.8vw, 20px)",
              fontWeight: 300,
              lineHeight: 1.8,
              color: "var(--rt-ink-soft)"
            }}>
            
            This is finally a space where every part of you is welcome and every part of you is seen.
            And what you have been looking for is not something we give you. It is already in you,
            and this is where you find it.
          </p>
          <p
            style={{
              fontFamily: "var(--rt-display)",
              fontWeight: 400,
              fontSize: "clamp(25px, 3.6vw, 38px)",
              lineHeight: 1.4,
              color: "var(--rt-burg)"
            }}>
            
            You will leave feeling more yourself than you have in years. You will leave aligned.
          </p>
        </Rise>
      </section>

      {/* BAND 3 FOR YOU IF */}
      <section className="rt-sec--bandTight rt-bg-edition">
        <div className="rt-w820">
          <Rise
            as="p"
            className="rt-eyebrow"
            style={{ marginBottom: "clamp(20px, 3vw, 28px)", color: "var(--rt-burg)" }}>
            
            This retreat is for you if
          </Rise>
          {FOR_YOU_IF.map((line) =>
          <Rise as="p" className="rt-editionRow" key={line}>
              {line}
            </Rise>
          )}
          <Rise as="p" className="rt-editionRow">
            And you have decided that 2027 is your year.
          </Rise>
        </div>
      </section>

      {/* BAND 4 WHAT YOU WILL EXPERIENCE */}
      <section className="rt-sec--band rt-bg-olive">
        <div className="rt-w820">
          <Rise
            as="p"
            className="rt-eyebrow"
            style={{ marginBottom: "clamp(24px, 4vw, 36px)", color: "var(--rt-rose-light)" }}>
            
            What you will experience
          </Rise>
          {EXPERIENCE.map((line) =>
          <Rise className="rt-expRow" key={line}>
              <span className="rt-expRow__mark" />
              <p>{line}</p>
            </Rise>
          )}
          <Rise
            as="p"
            style={{
              marginTop: "clamp(28px, 4vw, 40px)",
              fontFamily: "var(--rt-display)",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(24px, 3.4vw, 36px)",
              lineHeight: 1.4,
              color: "var(--rt-rose-light)"
            }}>
            
            Let Mama Africa hold you.
          </Rise>
        </div>
      </section>

      {/* BAND 6 WHAT MAKES THIS DIFFERENT */}
      <section className="rt-sec--bandTight rt-bg-edition">
        <Rise className="rt-w680">
          <details className="rt-details">
            <summary>
              <h3>What makes this different from what you have done before</h3>
              <span className="rt-details__glyph">+</span>
            </summary>
            <div className="rt-details__body">
              {DIFFERENT.map((block) =>
              <div key={block.heading}>
                  <h4>{block.heading}</h4>
                  {block.paragraphs.map((paragraph, index) =>
                <p
                  key={paragraph.slice(0, 24)}
                  style={{ marginBottom: index < block.paragraphs.length - 1 ? "18px" : 0 }}>
                  
                      {paragraph}
                    </p>
                )}
                </div>
              )}
            </div>
          </details>
        </Rise>
      </section>

      {/* BAND 7 THE DETAILS AND APPLY */}
      <section className="rt-sec--band rt-bg-oliveDeep">
        <Rise className="rt-w680">
          <p className="rt-eyebrow" style={{ marginBottom: "20px", color: "var(--rt-rose)" }}>
            The next retreat
          </p>
          <h2
            className="rt-h2"
            style={{
              marginBottom: "16px",
              fontSize: "clamp(36px, 6vw, 60px)",
              lineHeight: 1.2,
              color: "var(--rt-cream-edition)"
            }}>
            
            Release and Restart
          </h2>
          <p
            style={{
              marginBottom: "clamp(48px, 8vw, 64px)",
              fontSize: "clamp(15px, 1.5vw, 17px)",
              fontWeight: 300,
              lineHeight: 1.75,
              color: "rgba(248,244,239,0.78)"
            }}>
            
            A balanced edition. Somatic and psychological work throughout, with ceremony held on the
            third evening.
          </p>

          <div style={{ marginBottom: "clamp(48px, 8vw, 64px)" }}>
            {DETAILS.map((detail) =>
            <div className="rt-detailBlock" key={detail.label}>
                <p className="rt-detailBlock__label">{detail.label}</p>
                <p className="rt-detailBlock__value">{detail.value}</p>
                {detail.note ? <p className="rt-detailBlock__note">{detail.note}</p> : null}
              </div>
            )}
          </div>

          <a href={APPLY_URL} className="rt-btn rt-btn--bone">
            Apply for a place
          </a>
          <p className="rt-fineprint" style={{ color: "rgba(248,244,239,0.65)" }}>
            Places are applied for, not bought. Applications take a few minutes and we respond to
            every one.
          </p>
        </Rise>
      </section>

      {/* 13 FINAL CTA */}
      <section
        className="rt-bg-page"
        style={{ padding: "clamp(96px, 16vw, 150px) clamp(24px, 6vw, 80px)" }}>
        
        <Rise className="rt-w680">
          <h2
            className="rt-h2"
            style={{
              marginBottom: "clamp(40px, 6vw, 56px)",
              fontSize: "clamp(30px, 5vw, 48px)",
              lineHeight: 1.3
            }}>
            
            Retreat dates are announced to our register first.
          </h2>
          <a href={REGISTER_URL} className="rt-btn rt-btn--rose">
            Join the retreat register
          </a>
          <p className="rt-fineprint" style={{ color: "var(--rt-meta)" }}>
            Account required. Takes under a minute to register. No credit card required.
          </p>
        </Rise>
      </section>

      {/* 14 MANIFESTO */}
      <section className="rt-sec rt-sec--tall rt-bg-ink">
        <div className="rt-w680">
          <p className="rt-eyebrow" style={{ marginBottom: "20px", color: "var(--rt-rose)" }}>
            Our manifesto
          </p>
          <p
            className="rt-p"
            style={{ marginBottom: "clamp(48px, 7vw, 64px)", color: "var(--rt-white)" }}>
            
            I'll leave you with this. My favourite poem, and one I always come back to, and is the
            Aligned Woman Co's Manifesto: The Invitation by Oriah Mountain Dreamer.
          </p>
          {MANIFESTO_LINES.length > 0 ?
          <div className="rt-poem">
              {MANIFESTO_LINES.map((line) =>
            <p key={line.slice(0, 24)}>{line}</p>
            )}
            </div> :
          null}
          <p
            style={{
              marginTop: "clamp(40px, 5vw, 56px)",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "var(--rt-rose)"
            }}>
            
            The Invitation · Oriah Mountain Dreamer
          </p>
        </div>
      </section>
    </div>);

}