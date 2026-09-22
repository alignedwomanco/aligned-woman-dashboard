import React from "react";
import { Link } from "react-router-dom";
import LandingFooter from "@/components/home/LandingFooter";

/* ------------------------------------------------------------------
   MEET OUR FOUNDER
   Copy approved 22 Sep 2026. Portrait: swap PORTRAIT for the final
   image URL when you have one; the current one is from laurajanethomas.biz.
------------------------------------------------------------------ */

const BASK = "'Libre Baskerville', Georgia, serif";
const MONT = "Montserrat, sans-serif";

const PORTRAIT = "https://media.base44.com/images/public/69e1e7f05d39205bc001ea00/44ad00c70_LJT_17-04-2026-21-30-39.jpg";
const PROFILE_URL = "/StartingPointProfile";
const VERIFIED_URL = "/Apply";

const STORY = [
  "I built the multi-seven-figure business and hit the milestones. I created the success most people are chasing.",
  "And then I burned out. Slowly. Then all at once. Completely.",
  "The kind of burnout that takes the version of you who built it and makes it impossible to keep going. The kind that forces you to stop, question everything, and rebuild from the ground up.",
  "I used to think that was a personal failure. It wasn't. It was the predictable result of building inside a system that was never designed for a woman to last in it.",
  "What came next was the most defining chapter of my life. It forced me to redefine what success actually means. To understand what it looks like to build something that is not just successful, but sustainable, aligned, and honest about what I actually wanted.",
  "Now I do things differently. I've built a life and a business that are powerful, profitable, and a place I actually want to live inside.",
  "That is what I want for you. The kind of success that feels truly yours.",
  "I want you to become dangerously competent. Clear in your decisions, confident in your direction, and deeply aligned in the way you build your life and your business.",
  "You do not have to learn this the hard way. I did that for you already.",
];

const WHY = [
  "Women have been given fragmented answers to deeply interconnected problems. A specialist for the hormones. A therapist for the grief. A coach for the career. Each one looking at a single piece, none of them talking to each other, and a woman in the middle trying to assemble herself from five separate opinions.",
  "I know that woman, because I was her. Holding it all together, alone, and telling everyone I was fine.",
  "I built The Aligned Woman Co. so that no woman has to do that by herself. A place where she is seen, supported, and surrounded by people who understand what she is carrying.",
  "So I built the system that connects the pieces. Diagnostics to name the pattern you are running. Verified practitioners, education, community and events to do the work. Personalised guidance to tell you what to do next, and to measure whether it changed anything.",
  "We are not a wellness app. We are not a coaching platform. We are infrastructure: rigorous, evidence-informed, and built around the lived reality of women's lives.",
];

const CREDENTIALS = [
  {
    title: "Strategy and business",
    items: [
      "Founder and Managing Partner of Salt & Candy, an award-winning brand strategy and marketing consultancy, since 2013. Built to multi-seven figures. 100% independently owned.",
      "Fractional CMO and brand adviser to founders, CEOs and senior teams.",
      "Degree in Brand Communications, Vega School.",
    ],
  },
  {
    title: "Leadership and governance",
    items: [
      "Certified Director, Institute of Directors South Africa (cum laude).",
      "Former Chair of the 30% Club South Africa, working to increase women's representation on boards and in senior leadership.",
    ],
  },
  {
    title: "Coaching and human behaviour",
    items: [
      "Certified Coach.",
      "Internationally certified NLP practitioner.",
      "Internationally certified Time Line Therapy practitioner.",
      "Creator of the Starting Point Profile and the ALIVE Method, the diagnostic and sequencing framework behind The Aligned Woman Blueprint.",
    ],
  },
  {
    title: "Speaking and writing",
    items: [
      "Keynote speaker on burnout, alignment and women in leadership.",
      "Published author.",
      "Featured in Forbes, TechCrunch, Glamour, Business Day and The Times.",
    ],
  },
];

const STATS = [
  ["18+", "years advising founders and leaders"],
  ["7 fig", "agency founder, independently owned"],
  ["30%", "Club SA, former Chair"],
  ["5", "behavioural patterns in the Starting Point Profile"],
];

const Eyebrow = ({ children, style, light }) => (
  <p style={{ fontFamily: MONT, fontWeight: 500, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: light ? "#E8B4AE" : "#A86460", margin: 0, ...style }}>
    {children}
  </p>
);

const Body = ({ children, strong }) => (
  <p style={{ fontFamily: MONT, fontWeight: strong ? 400 : 300, fontSize: 17, lineHeight: 1.75, color: strong ? "#4A0E2E" : "#3A2A28", margin: "0 0 22px" }}>
    {children}
  </p>
);

const Button = ({ to, children, ghost }) => (
  <Link
    to={to}
    style={{
      display: "inline-flex",
      alignItems: "center",
      minHeight: 48,
      padding: "14px 28px",
      borderRadius: 999,
      background: ghost ? "transparent" : "#C4847A",
      color: ghost ? "#4A0E2E" : "#080105",
      border: ghost ? "1px solid #4A0E2E" : "1px solid #C4847A",
      fontFamily: MONT,
      fontWeight: 500,
      fontSize: 13,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      textDecoration: "none",
    }}
  >
    {children}
  </Link>
);

export default function Founder() {
  React.useEffect(() => {
    document.title = "Meet our founder | Laura Jane Thomas | The Aligned Woman Co.";
  }, []);

  return (
    <div style={{ background: "#FAF5F3" }}>
      <style>{`
        .fd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(40px,8vw,100px); align-items: center; }
        .fd-cred { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 40px 56px; }
        .fd-stats { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 32px; }
        @media (max-width: 900px) {
          .fd-grid { grid-template-columns: 1fr; }
          .fd-cred { grid-template-columns: 1fr; }
          .fd-stats { grid-template-columns: repeat(2, minmax(0,1fr)); }
        }
      `}</style>

      {/* ── HERO ── */}
      <section style={{ background: "#4A0E2E", color: "#FAF5F3", padding: "clamp(80px,10vw,120px) clamp(24px,6vw,80px) clamp(64px,8vw,96px)" }}>
        <div className="fd-grid" style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div>
            <Eyebrow light style={{ marginBottom: 28 }}>Meet our founder</Eyebrow>
            <h1 style={{ fontFamily: BASK, fontWeight: 400, fontSize: "clamp(2.6rem,5.5vw,4.4rem)", lineHeight: 1.05, margin: "0 0 28px", color: "#FAF5F3" }}>
              I built the business everyone is chasing. <em style={{ color: "#E8B4AE", fontStyle: "italic" }}>Then it burned me down.</em>
            </h1>
            <p style={{ fontFamily: MONT, fontWeight: 300, fontSize: 15, letterSpacing: "0.04em", color: "#E8B4AE", margin: 0 }}>
              Laura Jane Thomas, Founder, The Aligned Woman Co.
            </p>
          </div>
          <div style={{ aspectRatio: "4 / 5", overflow: "hidden", borderRadius: 16, background: "#6B1642" }}>
            {PORTRAIT ? (
              <img src={PORTRAIT} alt="Laura Jane Thomas" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#E8B4AE", fontFamily: MONT, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Portrait
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── STORY ── */}
      <section style={{ background: "#FAF5F3", padding: "clamp(80px,10vw,112px) clamp(24px,6vw,80px)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Eyebrow style={{ marginBottom: 28 }}>The story</Eyebrow>
          {STORY.map((p, i) => (
            <Body key={i} strong={i === STORY.length - 1}>{p}</Body>
          ))}
        </div>
      </section>

      {/* ── PULL QUOTE ── */}
      <section style={{ background: "#F5DDD9", padding: "clamp(64px,8vw,96px) clamp(24px,6vw,80px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontFamily: BASK, fontWeight: 400, fontStyle: "italic", fontSize: "clamp(1.8rem,3.6vw,2.8rem)", lineHeight: 1.25, color: "#4A0E2E", margin: 0 }}>
            I know that woman, because I was her.
          </p>
        </div>
      </section>

      {/* ── WHY AW EXISTS ── */}
      <section style={{ background: "#FAF5F3", padding: "clamp(80px,10vw,112px) clamp(24px,6vw,80px)" }}>
        <div className="fd-grid" style={{ maxWidth: 1180, margin: "0 auto", alignItems: "start" }}>
          <div>
            <Eyebrow style={{ marginBottom: 28 }}>Why The Aligned Woman Co. exists</Eyebrow>
            <h2 style={{ fontFamily: BASK, fontWeight: 400, fontSize: "clamp(2.4rem,5vw,3.8rem)", lineHeight: 1.05, color: "#4A0E2E", margin: 0 }}>
              So no woman has to do this <em style={{ color: "#A86460", fontStyle: "italic" }}>alone.</em>
            </h2>
          </div>
          <div style={{ paddingTop: "clamp(0px,3vw,48px)" }}>
            {WHY.map((p, i) => (
              <Body key={i} strong={i === WHY.length - 1}>{p}</Body>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: "#4A0E2E", color: "#FAF5F3", padding: "clamp(48px,6vw,72px) clamp(24px,6vw,80px)" }}>
        <div className="fd-stats" style={{ maxWidth: 1180, margin: "0 auto" }}>
          {STATS.map(([n, l]) => (
            <div key={n}>
              <div style={{ fontFamily: BASK, fontSize: "clamp(2rem,4vw,3rem)", lineHeight: 1, marginBottom: 10 }}>{n}</div>
              <div style={{ fontFamily: MONT, fontWeight: 300, fontSize: 14, lineHeight: 1.5, color: "#E8B4AE" }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CREDENTIALS ── */}
      <section style={{ background: "#FAF5F3", padding: "clamp(80px,10vw,112px) clamp(24px,6vw,80px)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ maxWidth: 720, marginBottom: 56 }}>
            <Eyebrow style={{ marginBottom: 28 }}>My expertise and credentials</Eyebrow>
            <h2 style={{ fontFamily: BASK, fontWeight: 400, fontSize: "clamp(2.2rem,4.5vw,3.4rem)", lineHeight: 1.05, color: "#4A0E2E", margin: "0 0 24px" }}>
              Eighteen years at the intersection of three things most people keep <em style={{ color: "#A86460", fontStyle: "italic" }}>separate.</em>
            </h2>
            <Body>Brand strategy, leadership, and the psychology of the woman doing the building. Everything on this platform draws on all three.</Body>
          </div>
          <div className="fd-cred">
            {CREDENTIALS.map((c) => (
              <div key={c.title}>
                <h3 style={{ fontFamily: MONT, fontWeight: 700, fontSize: 13, letterSpacing: "0.04em", color: "#4A0E2E", margin: "0 0 16px", paddingBottom: 12, borderBottom: "1px solid #E8B4AE" }}>
                  {c.title}
                </h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {c.items.map((it) => (
                    <li key={it} style={{ fontFamily: MONT, fontWeight: 300, fontSize: 15, lineHeight: 1.7, color: "#3A2A28", padding: "8px 0 8px 20px", position: "relative" }}>
                      <span style={{ position: "absolute", left: 0, top: 18, width: 6, height: 6, borderRadius: 999, background: "#C4847A" }} />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOSING ── */}
      <section style={{ background: "linear-gradient(160deg,#FAF5F3,#F5DDD9)", padding: "clamp(80px,10vw,112px) clamp(24px,6vw,80px)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: BASK, fontWeight: 400, fontSize: "clamp(2.2rem,4.5vw,3.4rem)", lineHeight: 1.1, color: "#4A0E2E", margin: "0 0 20px" }}>
            You do not have to assemble yourself from five opinions.
          </h2>
          <p style={{ fontFamily: MONT, fontWeight: 300, fontSize: 17, lineHeight: 1.7, color: "#3A2A28", margin: "0 auto 36px", maxWidth: 560 }}>
            Start with one honest picture of where you are.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
            <Button to={PROFILE_URL}>Take the Starting Point Profile</Button>
            <Button to={VERIFIED_URL} ghost>Become AW Verified</Button>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
