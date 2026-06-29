import React, { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play, Plus, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import AsSeenIn from "@/components/blueprint/AsSeenIn";

// ─── SCROLL REVEAL HOOK ───
function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return ref;
}

// ─── COUNTER ANIMATION HOOK ───
function useCounter(target, duration = 1200, prefix = "", suffix = "", enabled = true) {
  const [value, setValue] = useState(0);
  const [struck, setStruck] = useState(false);
  const triggered = useRef(false);

  const start = useCallback(() => {
    if (triggered.current || !enabled) return;
    triggered.current = true;
    const startTime = performance.now();
    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(update);
      else {
        setValue(target);
        if (suffix === "__strike") setTimeout(() => setStruck(true), 300);
      }
    };
    requestAnimationFrame(update);
  }, [target, duration, enabled, suffix]);

  return { value, struck, start };
}

// ─── ALIVE PARALLAX HOOK ───
function useAliveParallax() {
  useEffect(() => {
    const isMobile = () => window.innerWidth < 768;
    let ticking = false;
    const handle = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (!isMobile()) {
            document.querySelectorAll(".alive-letter").forEach((letter) => {
              const section = letter.closest(".alive-phase");
              if (!section) return;
              const rect = section.getBoundingClientRect();
              const vh = window.innerHeight;
              if (rect.top < vh && rect.bottom > 0) {
                const progress = (vh - rect.top) / (vh + rect.height);
                const offset = (progress - 0.5) * 60;
                letter.style.transform = `translateY(${offset}px)`;
              }
            });
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);
}

// ─── BRAND TOKENS (CSS custom properties not in tailwind.config) ───
const C = {
  ink: "#080105",
  burgDeep: "#0E0208",
  burgDark: "#1A0510",
  burgCore: "#4A0E2E",
  burgMid: "#6B1642",
  roseDeep: "#A86460",
  roseCore: "#C4847A",
  roseLight: "#E8B4AE",
  rosePale: "#F5DDD9",
  roseWash: "#FDF5F3",
  white: "#FFFFFF",
  offWhite: "#FAF5F3",
  warmGrey: "#C8B8B4",
  midGrey: "#8A7A76",
  darkGrey: "#3A2A28",
};

const GRAD = {
  darkHero: "linear-gradient(155deg,#080105 0%,#1A0510 40%,#2D0819 70%,#0E0208 100%)",
  editorial: "linear-gradient(160deg,#0E0208 0%,#1A0510 35%,#4A0E2E 65%,#1A0510 100%)",
  burgWarm: "linear-gradient(135deg,#3D0B27 0%,#4A0E2E 40%,#6B1642 75%,#3D0B27 100%)",
  roseLight: "linear-gradient(135deg,#FAF5F3 0%,#F5DDD9 100%)",
};

const serif = "'DM Serif Display', Georgia, serif";
const sans = "Montserrat, sans-serif";

// ─── DATA ───

const FACULTY = [
  { name: "Laura Jane Thomas", domain: "Founder", desc: "Aligned Woman Co Founder. Award-winning strategist, author, speaker.", filter: "all" },
  { name: "Boitumelo Boikhutso", domain: "Mindset & Behaviour", desc: "Psychology and trauma-informed thinking.", filter: "Mindset & Behaviour" },
  { name: "Dr Wendy Mahoney", domain: "Mindset & Behaviour", desc: "NLP, behavioural transformation, TEDx speaker.", filter: "Mindset & Behaviour" },
  { name: "Phoebe Greenacre", domain: "Nervous System", desc: "Somatic practitioner and regulation coach.", filter: "Nervous System" },
  { name: "Natacha Wauquiez", domain: "Nervous System", desc: "Trauma therapy, PTSD, somatic EMDR.", filter: "Nervous System" },
  { name: "Danielle Venter", domain: "Health & Hormones", desc: "Dietitian, nutrigenomics and metabolic health.", filter: "Health & Hormones" },
  { name: "Dr Shirley Du Plessis", domain: "Health & Hormones", desc: "Integrative hormonal health and burnout.", filter: "Health & Hormones" },
  { name: "Dr Nasrat Sirkissoon", domain: "Money", desc: "PhD Entrepreneurship, 20 years financial services.", filter: "Money" },
  { name: "Refilwe Moloto", domain: "Leadership & Authority", desc: "Strategic advisor, award-winning broadcaster.", filter: "Leadership & Authority" },
  { name: "Cindy Norcott", domain: "Leadership & Authority", desc: "CEO Pro Talent, international keynote speaker.", filter: "Leadership & Authority" },
  { name: "Nokuthula Magwaza", domain: "Leadership & Authority", desc: "WEDO Ambassador, purpose-driven leadership.", filter: "Leadership & Authority" },
  { name: "Cato Vermeulen", domain: "Relationships", desc: "Feminine sales expert, Forbes featured.", filter: "Relationships" },
  { name: "Mimi Nicklin", domain: "Relationships", desc: "Empathy advocate, 5.9 million global reach.", filter: "Relationships" },
  { name: "Tinashe Mujera", domain: "Identity & Visibility", desc: "Personal positioning and digital presence.", filter: "Identity & Visibility" },
];

const FACULTY_FILTERS = ["all", "Mindset & Behaviour", "Nervous System", "Health & Hormones", "Money", "Leadership & Authority", "Relationships", "Identity & Visibility"];

const PILLARS = [
  {
    label: "Mindset & Behaviour",
    quote: "You stop reacting and start responding.",
    outcomes: [
      "You will see the unconscious patterns shaping your behaviour and finally have language for what was previously invisible.",
      "You will respond from your own values rather than react from old conditioning that no longer serves you.",
      "You will rebuild the relationship between thought and action so your decisions feel like yours.",
      "You will operate from clarity, not from the inherited rules nobody named.",
    ],
  },
  {
    label: "Nervous System",
    quote: "Your body becomes an asset, not an obstacle.",
    outcomes: [
      "You will recognise the difference between a stress response and a real problem and stop letting your nervous system make decisions for you.",
      "You will have real-time regulation tools that work in boardrooms, difficult conversations, and the moments that used to unravel you.",
      "You will rebuild your capacity to sustain high performance without the crash that currently follows every peak.",
      "You will understand what your body has been trying to tell you and finally know how to listen.",
    ],
  },
  {
    label: "Health & Hormones",
    quote: "Your biology becomes a teacher, not a mystery.",
    outcomes: [
      "You will understand how your hormonal cycle is shaping your energy, your focus, your relationships and your work.",
      "You will stop fighting your physiology and start designing around it.",
      "You will have a vocabulary for what your body is doing and a framework for working with it.",
      "You will know what is normal and what is asking for attention.",
    ],
  },
  {
    label: "Money",
    quote: "You stop performing financial confidence and build it.",
    outcomes: [
      "You will understand your relationship with money at the level of pattern, not personality.",
      "You will make financial decisions from clarity rather than from anxiety or avoidance.",
      "You will have language for what you actually want and a framework for getting there.",
      "You will stop outsourcing financial authority and start owning it.",
    ],
  },
  {
    label: "Leadership & Authority",
    quote: "You lead from who you are, not who you should be.",
    outcomes: [
      "You will communicate, decide and hold a room without performing.",
      "You will set boundaries that hold without explanation or apology.",
      "You will navigate power without losing yourself in it.",
      "You will stop waiting for permission and start operating with the authority you already have.",
    ],
  },
  {
    label: "Relationships",
    quote: "You build relationships you do not have to manage.",
    outcomes: [
      "You will see the patterns running underneath your closest relationships.",
      "You will move from invisible labour to clear contribution.",
      "You will stop translating yourself and start being met.",
      "You will know what intimacy actually requires.",
    ],
  },
  {
    label: "Identity & Visibility",
    quote: "You stop hiding and start being seen, on your own terms.",
    outcomes: [
      "You will reclaim the parts of yourself that were edited for legibility.",
      "You will hold visibility without collapsing under it.",
      "You will know what you stand for and what you do not.",
      "You will move from performance to presence.",
    ],
  },
];

const ALIVE_PHASES = [
  { letter: "A", name: "Awareness", quote: "You stop fighting symptoms and start seeing causes.", body: "Deep recognition of what is actually running your decisions, your patterns, and your behaviour. Not surface mindset work. The kind of seeing that changes what is possible, permanently." },
  { letter: "L", name: "Liberation", quote: "The body does what thinking alone never could.", body: "Releasing what your nervous system has been holding. Survival patterns. Stored stress. The weight that no amount of analysis has been able to lift. You cannot think your way out of what the body has locked in." },
  { letter: "I", name: "Intention", quote: "Rebuild from clarity, not from pressure.", body: "From a regulated, clear internal state you rebuild. Not from fear. Not from who you have been told to be. From actual clarity about who you are, what you are building, and why it matters to you specifically." },
  { letter: "V", name: "Vitality", quote: "Sustainable performance without the crash.", body: "Operating from capacity rather than depletion. This is where the external changes become visible. Better decisions, faster recovery, cleaner thinking under pressure, and the energy to sustain all of it." },
  { letter: "E", name: "Embodiment", quote: "The shift becomes who you are.", body: "Not practised. Not performed. Embodied. This is not a destination you reach. It is a fundamentally different internal state you operate from. One that does not require maintenance because it has become you." },
];

const TESTIMONIALS = [
  { name: "Tarryn", age: 34, quote: "I run a team of twelve. I am not the kind of person who buys personal development programmes. But this is not personal development. The NLP module by Dr Wendy alone changed how I communicate with my team. I didn't even realise I was doing it wrong. I just thought people were difficult." },
  { name: "Zinhle", age: 29, quote: "You genuinely don't know what you don't know. I came in thinking I had my life together and then the nervous system module completely changed how I understand why I react the way I do. I would never have thought to look there. That's the thing. You can't fix what you can't even see." },
  { name: "Nandi", age: 31, quote: "This is what the world needs for women. Not more motivation. Not another podcast telling us to wake up earlier. Actual foundations. I can't believe no one has done this before." },
  { name: "Priya", age: 33, quote: "The way everything connects is something I have never seen before. Like you don't just learn about money in isolation. You start to see why your financial behaviour is connected to your nervous system which is connected to your identity. Once you see it you can't unsee it." },
  { name: "Lerato", age: 36, quote: "I wish I had this ten years ago. The amount of money I have spent on coaching and therapy trying to figure out what this programme laid out in the first three modules. It would have saved me years. Genuinely years." },
  { name: "Nadia", age: 27, quote: "I have always battled with confidence and honestly thought that was just who I was. Like that was my personality. The work from Cindy and Refilwe completely changed that for me. It's not a personality trait. It's a skill. Nobody ever framed it like that for me before." },
  { name: "Ash", age: 30, quote: "I have been stuck for the last year on what to do with my career. Not because I don't know what I want but because I couldn't get out of my own way. This gave me the actual tools to stop overthinking and start making decisions. I am going into work on Monday to have the salary conversation I have been avoiding for eight months." },
];

const FAQS = [
  { q: "What exactly is The Aligned Woman Blueprint?", a: "It is an online programme built across seven domains that ambitious women are expected to navigate but rarely taught: psychology, nervous system regulation, health, money, identity, leadership, and the integration of all of them.\n\nEach domain is taught by a credentialed specialist in that field, not by a single coach or content creator covering everything. The faculty includes practitioners whose combined private consultation value exceeds R116,000. You are getting direct access to what they teach, structured into a guided curriculum you can work through at your own pace.\n\nThe programme is built on the ALIVE Method, a five-phase sequence (Awareness, Liberation, Intention, Vision, Execution) that determines the order in which the teaching is delivered. This is deliberate. Most wellness education lets you pick and choose topics at random. The Blueprint is sequenced because each phase builds on the one before it, and skipping phases is why most personal development efforts do not hold.\n\nInside the programme you get guided expert modules, deep-work workbooks designed for real application. It is not a library of content to browse. It is an architecture you move through.\n\nThe simplest way to describe it: it is the education women should have been given alongside every degree, promotion, and life transition they have ever navigated. It did not exist, so we built it." },
  { q: "Who is this for?", a: "Ambitious women, typically 26 to 38, who are succeeding by every external measure and privately exhausted, reactive, or overwhelmed." },
  { q: "How is this different from other programmes I have tried?", a: "The order. Most programmes give the right information in the wrong sequence. The ALIVE Method puts regulation before identity, foundation before structure. Always." },
  { q: "I have tried courses before and nothing changed. Why would this be different?", a: "Tools without sequence do not build anything. This programme is sequenced. Each domain is built on the last." },
  { q: "Can I justify spending this on myself?", a: "The hesitation around spending on yourself is the first pattern the Blueprint addresses. R3,997 is less than a single private consultation with any of your thirteen specialists." },
  { q: "What if I do not have the emotional capacity for deep work right now?", a: "The Low Energy Entry Points Guide is built for exactly this. You can progress even on your worst days." },
  { q: "How much time do I need each week?", a: "Designed for 2-3 hours per week. You can move faster or slower; lifetime access means no deadlines beyond your own." },
  { q: "Is this therapy?", a: "No. This is education. It may complement therapy. It does not replace it." },
  { q: "Do I need to be spiritual or religious to benefit from this?", a: "No. The Blueprint is grounded in psychology, physiology, and structured education. No belief system required." },
  { q: "When does it start?", a: "Doors open 1 June 2026." },
  { q: "What happens after I complete the programme?", a: "Lifetime access to all content and updates. Priority access to live experiences. Founding rate locked for future Blueprint content." },
];

const COMPARISON_ROWS = [
  { generic: "Generic content not designed for how women actually operate", blueprint: "Built specifically around female psychology, biology, and the internal systems that drive everything else", coaching: "Dependent on one person's methodology and availability" },
  { generic: "Random experts with no connection between their teachings", blueprint: "14 credentialed specialists whose knowledge is intentionally sequenced to build on each other", coaching: "One practitioner covering multiple domains they may not specialise in" },
  { generic: "Right information in the wrong order. Tools without a system", blueprint: "The ALIVE Method delivers every tool in the physiological and psychological sequence your nervous system requires", coaching: "Sessions without structure. Insight without integration" },
  { generic: "Asks you to change before you have the capacity to hold the change", blueprint: "Builds capacity first. Regulation before identity work. Foundation before structure. Always", coaching: "Explores the problem without always providing the structural solution" },
  { generic: "Designed for ideal conditions. Requires motivation and consistency you may not have", blueprint: "Built for your real life. The Low Energy Entry Points Guide means you can progress even on your worst days", coaching: "Requires weekly appointments that depend on your schedule and budget" },
  { generic: "Private access equivalent would cost R116,200 or more", blueprint: "R3,997. Everything included. No upsells. No hidden costs", coaching: "Ongoing cost with no defined endpoint or measurable outcome" },
  { generic: "No accountability for results. No guarantee", blueprint: "30-day completion guarantee. Complete the programme. Feel the shift. Or receive a full refund", coaching: "No structured guarantee or completion framework" },
];

// ─── SHARED COMPONENTS ───

function SectionReveal({ children, className = "", style = {}, delay = 0 }) {
  const ref = useScrollReveal(0.15);
  return (
    <div
      ref={ref}
      className={`animate-on-scroll ${className}`}
      style={{ ...style, transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function Eyebrow({ children, color = C.burgCore, dark = false }) {
  return (
    <div className="flex items-center justify-center gap-4 mb-6">
      <div className="w-6 h-px" style={{ background: dark ? "rgba(255,255,255,0.2)" : `${color}40` }} />
      <span
        className="text-[10px] font-semibold uppercase tracking-[0.22em]"
        style={{ fontFamily: sans, color: dark ? C.roseCore : color }}
      >
        {children}
      </span>
      <div className="w-6 h-px" style={{ background: dark ? "rgba(255,255,255,0.2)" : `${color}40` }} />
    </div>
  );
}

function EyebrowLeft({ children, color = C.roseCore }) {
  return (
    <span
      className="text-[10px] font-semibold uppercase tracking-[0.22em] mb-4 block"
      style={{ fontFamily: sans, color }}
    >
      {children}
    </span>
  );
}

function PrimaryCTA({ large = false, label = "Begin Your Blueprint +", className = "", onClick }) {
  return (
    <Link
      to="/checkout"
      onClick={onClick}
      className={`cta-primary inline-block rounded-full font-bold uppercase text-center ${className}`}
      style={{
        fontFamily: sans,
        fontSize: large ? 14 : 12,
        letterSpacing: large ? "0.18em" : "0.14em",
        padding: large ? "22px 56px" : "18px 40px",
        minHeight: 48,
      }}
    >
      {label}
    </Link>
  );
}

function SecondaryCTA({ label = "Explore The Programme", dark = true, className = "" }) {
  return (
    <a
      href="#enrol"
      className={`cta-secondary inline-block rounded-full font-bold uppercase text-center ${className}`}
      style={{
        fontFamily: sans,
        fontSize: 12,
        letterSpacing: "0.14em",
        padding: "18px 40px",
        minHeight: 48,
        color: dark ? C.white : C.burgCore,
        border: dark ? "1px solid rgba(255,255,255,0.3)" : `1px solid ${C.burgCore}`,
      }}
    >
      {label}
    </a>
  );
}



// ─── STAT BAR (with counter animation) ───
function StatBar() {
  const containerRef = useRef(null);
  const [vals, setVals] = useState({ v14: 0, v7: 0, v116200: 0, v3997: 0 });
  const [struck, setStruck] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        observer.unobserve(el);

        const duration = 1200;
        const startTime = performance.now();
        const targets = { v14: 14, v7: 7, v116200: 116200, v3997: 3997 };

        const tick = (now) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setVals({
            v14: Math.round(targets.v14 * eased),
            v7: Math.round(targets.v7 * eased),
            v116200: Math.round(targets.v116200 * eased),
            v3997: Math.round(targets.v3997 * eased),
          });
          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            setVals(targets);
            setTimeout(() => setStruck(true), 300);
          }
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stats = [
    { label: "Specialists", display: `${vals.v14}`, style: { color: C.white } },
    { label: "Life Domains", display: `${vals.v7}`, style: { color: C.white } },
    { label: "Private Value", display: `R${vals.v116200.toLocaleString()}`, struck, style: { color: C.roseLight } },
    { label: "Your Investment", display: `R${vals.v3997.toLocaleString()}`, style: { color: C.white } },
  ];

  return (
    <dl ref={containerRef} className="grid grid-cols-2 md:grid-cols-4 gap-0 max-w-[700px] mx-auto mb-10">
      {stats.map((s, i) => (
        <div key={i} className="flex flex-col items-center py-4 md:py-0">
          <dt className="order-2 text-[9px] font-semibold uppercase tracking-[0.2em] mt-1" style={{ fontFamily: sans, color: "rgba(255,255,255,0.5)" }}>
            {s.label}
          </dt>
          <dd className="order-1" style={{ fontFamily: serif, fontStyle: "italic", fontSize: 36, ...s.style }}>
            {s.struck
              ? <s style={{ color: C.roseLight, textDecoration: "line-through" }}>{s.display}</s>
              : s.display
            }
          </dd>
        </div>
      ))}
    </dl>
  );
}


// ═══════════════════════════════════════════════
// SECTION 02: HERO
// ═══════════════════════════════════════════════

function Hero() {
  return (
    <section
      id="hero"
      className="relative flex items-center justify-center text-center px-6 md:px-8"
      style={{ background: GRAD.darkHero, minHeight: "92vh", paddingTop: 80, paddingBottom: 80 }}
    >
      <div className="max-w-[880px] mx-auto">
        {/* Category pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span
            className="inline-block rounded-full px-5 py-2 mb-8 text-[10px] font-semibold uppercase tracking-[0.22em]"
            style={{
              fontFamily: sans,
              color: C.roseCore,
              border: `1px solid rgba(196,132,122,0.2)`,
            }}
          >
            THE EDUCATION WOMEN SHOULD HAVE BEEN GIVEN
          </span>
        </motion.div>

        {/* Headline H1 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mb-4"
          style={{ lineHeight: 1 }}
        >
          <h1>
            <span
              className="block"
              style={{
                fontFamily: sans,
                fontWeight: 800,
                textTransform: "uppercase",
                fontSize: "clamp(48px, 7vw, 72px)",
                color: C.white,
                lineHeight: 1,
              }}
            >
              The Aligned
            </span>
            <span
              className="block"
              style={{
                fontFamily: serif,
                fontStyle: "italic",
                fontSize: "clamp(64px, 9vw, 96px)",
                color: C.roseCore,
                lineHeight: 1.05,
              }}
            >
              Woman
            </span>
            <span
              className="block"
              style={{
                fontFamily: sans,
                fontWeight: 800,
                textTransform: "uppercase",
                fontSize: "clamp(48px, 7vw, 72px)",
                color: C.white,
                lineHeight: 1,
              }}
            >
              Blueprint
            </span>
          </h1>
        </motion.div>

        {/* Domain bar */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-[13px] font-semibold uppercase tracking-[0.06em] mb-4"
          style={{ fontFamily: sans, color: C.roseLight }}
        >
          Psychology &middot; Money &middot; Health &middot; Identity &middot; Leadership
        </motion.p>

        {/* Format description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="max-w-[640px] mx-auto text-[15px] font-light leading-relaxed mb-10"
          style={{ fontFamily: sans, color: "rgba(255,255,255,0.65)" }}
        >
          A structured digital programme with guided modules, specialist-led content, deep-work workbooks, and personalised progress tracking.
        </motion.p>

        {/* Stat bar */}
        <StatBar />

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
        >
          <PrimaryCTA />
          <SecondaryCTA />
        </motion.div>


      </div>
    </section>
  );
}


// ═══════════════════════════════════════════════
// SECTION 03: YOU ARE NOT FAILING
// ═══════════════════════════════════════════════

function YouAreNotFailing() {
  const problems = [
    {
      title: "The Performance Gap",
      body: "You meet every deadline. You deliver. You show up. And then you go home and cry in the car because you cannot explain why doing everything right feels like slow collapse.",
    },
    {
      title: "The Body That Will Not Cooperate",
      body: "Your body is sending signals you do not have the language for. The exhaustion that sleep does not fix. The anxiety before meetings you could run in your sleep. The hormonal shifts that your doctor calls normal and that you know are costing you more than you are admitting.",
    },
    {
      title: "The Investment That Never Pays Off",
      body: "You have tried the therapy. The productivity system. The wellness programme. The coach. Each gave you something. None of it connected into anything that actually changed how you operate. Because tools without the right sequence do not build anything.",
    },
  ];

  return (
    <section className="py-14 md:py-24 px-6 md:px-8" style={{ background: C.offWhite }}>
      <div className="max-w-[1100px] mx-auto">
        <SectionReveal>
          <Eyebrow>DO ANY OF THESE SOUND FAMILIAR</Eyebrow>

          <div className="text-center mb-4">
            <h2>
              <span
                className="block text-[clamp(36px,5vw,52px)] font-extrabold uppercase"
                style={{ fontFamily: sans, color: C.burgCore, lineHeight: 1.1 }}
              >
                YOU ARE NOT
              </span>
              <span
                className="block text-[clamp(40px,6vw,60px)]"
                style={{ fontFamily: serif, fontStyle: "italic", color: C.roseCore, lineHeight: 1.1 }}
              >
                failing.
              </span>
            </h2>
          </div>

          <p
            className="text-center max-w-[640px] mx-auto mb-6 text-[18px]"
            style={{ fontFamily: serif, fontStyle: "italic", color: C.midGrey }}
          >
            You are succeeding at a game you were never taught the rules to.
          </p>

          <p
            className="text-center max-w-[700px] mx-auto mb-12 text-[15px] font-light leading-[1.88]"
            style={{ fontFamily: sans, color: C.darkGrey }}
          >
            Most women who find their way here are not struggling because they lack ambition, intelligence, or drive. They are struggling because the education system taught them how to achieve and then left them completely alone inside what achievement actually requires.
          </p>
        </SectionReveal>

        {/* Problem cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {problems.map((p, i) => (
            <SectionReveal key={i}>
              <div
                className="bg-white rounded-lg p-8 h-full"
                style={{ border: `1px solid rgba(74,14,46,0.08)` }}
              >
                <h3
                  className="text-[24px] mb-4"
                  style={{ fontFamily: serif, fontStyle: "italic", color: C.burgCore }}
                >
                  {p.title}
                </h3>
                <p
                  className="text-[14px] font-light leading-[1.8]"
                  style={{ fontFamily: sans, color: C.darkGrey }}
                >
                  {p.body}
                </p>
              </div>
            </SectionReveal>
          ))}
        </div>

        {/* Reframe bar */}
        <SectionReveal>
          <div
            className="rounded-lg px-8 py-10 text-center max-w-[880px] mx-auto"
            style={{ background: C.rosePale }}
          >
            <p
              className="text-[18px] leading-relaxed"
              style={{ fontFamily: serif, fontStyle: "italic", color: C.burgCore }}
            >
              None of this is a character flaw. It is a curriculum gap. And it is exactly what The Aligned Woman Blueprint&trade; was built to fill.
            </p>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}





// ═══════════════════════════════════════════════
// SECTION 05: VIDEO
// ═══════════════════════════════════════════════

function VideoSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="py-14 md:py-24 px-6 md:px-8" style={{ background: C.offWhite }}>
      <div className="max-w-[900px] mx-auto">
        <SectionReveal>
          <div
            className="relative rounded-lg overflow-hidden cursor-pointer group"
            style={{ aspectRatio: "16/9", border: `1px solid rgba(74,14,46,0.08)`, background: C.burgDeep }}
            onClick={() => setPlaying(true)}
          >
            <video
              src="https://pub-92fd07e9117b4774bd919918a55b163b.r2.dev/AlignedWoman_Horizontal_Final_UPD_SHORT.mp4"
              autoPlay={playing}
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            {!playing && (
              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                style={{ background: "rgba(14,2,8,0.35)" }}
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: C.roseCore }}
                >
                  <Play className="w-8 h-8 ml-1" style={{ color: C.burgDeep }} fill={C.burgDeep} />
                </div>
              </div>
            )}
          </div>
          <p
            className="text-center mt-6 text-[10px] font-semibold uppercase tracking-[0.22em]"
            style={{ fontFamily: sans, color: C.burgCore }}
          >
            WATCH THE BLUEPRINT INTRODUCTION
          </p>
        </SectionReveal>
      </div>
    </section>
  );
}


// ═══════════════════════════════════════════════
// SECTION 06: WHY THE BLUEPRINT EXISTS
// ═══════════════════════════════════════════════

function WhyExists() {
  const domains = ["Psychology", "Nervous System", "Decision Making", "Money", "Identity", "Leadership", "Feminine Business", "Relationships"];

  return (
    <section className="py-14 md:py-24 px-6 md:px-8" style={{ background: GRAD.burgWarm }}>
      <div className="max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Left col (60%) */}
          <div className="lg:col-span-3">
            <SectionReveal>
              <EyebrowLeft color={C.roseCore}>THE STRUCTURAL PROBLEM</EyebrowLeft>

              <h2 className="mb-8">
                <span className="block text-[clamp(32px,4vw,48px)] font-extrabold uppercase text-white" style={{ fontFamily: sans, lineHeight: 1.1 }}>
                  WHY THE
                </span>
                <span className="block text-[clamp(36px,5vw,56px)]" style={{ fontFamily: serif, fontStyle: "italic", color: C.roseCore, lineHeight: 1.1 }}>
                  Aligned Woman
                </span>
                <span className="block text-[clamp(32px,4vw,48px)] font-extrabold uppercase text-white" style={{ fontFamily: sans, lineHeight: 1.1 }}>
                  BLUEPRINT EXISTS.
                </span>
              </h2>

              <p className="text-[15px] font-light leading-[1.88] mb-4" style={{ fontFamily: sans, color: C.roseLight }}>
                Most women were never taught the internal skills required to navigate modern life. So they spend years trying to figure it out alone and blaming themselves for the gap.
              </p>
              <p className="text-[15px] font-light leading-[1.88] mb-6" style={{ fontFamily: sans, color: C.roseLight }}>
                Ambitious women are not failing. They are navigating complex lives without the education that actually shapes long-term success. That is not a personal failure. It is a structural one.
              </p>
              <p className="text-[15px] font-medium leading-[1.88] mb-8" style={{ fontFamily: sans, color: C.white }}>
                These internal skills influence everything, from relationships and health to career growth and financial independence. Yet almost no one teaches how they work together.
              </p>

              {/* Domain tags */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {domains.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 rounded"
                    style={{ border: `1px solid rgba(232,180,174,0.2)` }}
                  >
                    <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: C.roseCore }} />
                    <span className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ fontFamily: sans, color: C.roseLight }}>
                      {d}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-[14px] font-light leading-[1.8]" style={{ fontFamily: sans, color: "rgba(255,255,255,0.6)" }}>
                The Aligned Woman Blueprint brings all seven domains together, not as separate topics, but as one connected system designed to work in the order the nervous system and psychology actually require.
              </p>
            </SectionReveal>
          </div>

          {/* Right col (40%) */}
          <div className="lg:col-span-2">
            <SectionReveal>
              {/* Alternative card */}
              <div
                className="rounded-lg p-8 mb-8"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ fontFamily: sans, color: C.roseCore }}>
                  THE ALTERNATIVE
                </p>
                <p className="text-[14px] font-light leading-relaxed mb-6" style={{ fontFamily: sans, color: "rgba(255,255,255,0.6)" }}>
                  To access each of these specialists privately would require individual consultations, separate bookings, and no connection between them.
                </p>
                <div className="mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] block mb-1" style={{ fontFamily: sans, color: "rgba(255,255,255,0.5)" }}>
                    Private Access Cost
                  </span>
                  <s className="text-[24px]" style={{ fontFamily: serif, fontStyle: "italic", color: C.roseCore }}>
                    R116,200
                  </s>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] block mb-1" style={{ fontFamily: sans, color: "rgba(255,255,255,0.5)" }}>
                    Your Investment
                  </span>
                  <span className="text-[48px]" style={{ fontFamily: serif, fontStyle: "italic", color: C.white }}>
                    R3,997
                  </span>
                </div>
              </div>

              {/* Proof points */}
              {[
                { num: "01", title: "This is why it worked when nothing else has.", body: "Every tool you have tried gave you the right information in the wrong order. The ALIVE Method changes that." },
                { num: "02", title: "The investment is the first act of alignment.", body: "That woman who cannot spend on herself is exactly who this was built for. That hesitation is not caution; it is the first pattern the Blueprint addresses." },
                { num: "03", title: "You are not broken. You are under-built.", body: "There is nothing wrong with you that making more effort will fix. What is missing is the internal architecture nobody ever taught you. That is a structural problem with a structural solution." },
              ].map((pp, i) => (
                <div key={i} className="mb-6">
                  <span className="text-[32px] block mb-2" style={{ fontFamily: serif, fontStyle: "italic", color: C.roseCore }}>
                    {pp.num}
                  </span>
                  <p className="text-[14px] font-semibold mb-1" style={{ fontFamily: sans, color: C.white }}>
                    {pp.title}
                  </p>
                  <p className="text-[13px] font-light leading-[1.7]" style={{ fontFamily: sans, color: "rgba(255,255,255,0.6)" }}>
                    {pp.body}
                  </p>
                </div>
              ))}
            </SectionReveal>
          </div>
        </div>

        {/* Section CTA */}
        <SectionReveal>
          <div className="text-center mt-20">
            <PrimaryCTA large />
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}


// ═══════════════════════════════════════════════
// SECTION 07: FACULTY
// ═══════════════════════════════════════════════

function Faculty() {
  const [activeFilter, setActiveFilter] = useState("all");

  const { data: experts = [] } = useQuery({
    queryKey: ["blueprint-experts"],
    queryFn: () => base44.entities.Expert.filter({ isPublished: true }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["blueprint-expert-categories"],
    queryFn: () => base44.entities.ExpertCategory.list(),
  });

  // Support both legacy string and new array for category
  const getExpertCategoryIds = (e) =>
    Array.isArray(e.category) ? e.category : e.category ? [e.category] : [];

  const getCategoryName = (id) => categories.find((c) => c.id === id)?.name || "";

  const getExpertCategoryNames = (e) =>
    getExpertCategoryIds(e).map(getCategoryName).filter(Boolean);

  const sortedExperts = [...experts].sort((a, b) => {
    const aIds = getExpertCategoryIds(a);
    const bIds = getExpertCategoryIds(b);
    const aCat = categories.find((c) => aIds.includes(c.id));
    const bCat = categories.find((c) => bIds.includes(c.id));
    return (aCat?.order ?? 9999) - (bCat?.order ?? 9999);
  });

  const filtered = activeFilter === "all"
    ? sortedExperts
    : sortedExperts.filter((e) => getExpertCategoryNames(e).includes(activeFilter));

  // Build filter list from actual categories
  const filterLabels = ["all", ...categories.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((c) => c.name)];

  function getInitials(name) {
    if (!name) return "?";
    return name.split(" ").filter(Boolean).map((p) => p[0]).join("").toUpperCase().slice(0, 2);
  }

  return (
    <section className="py-14 md:py-24 px-6 md:px-8" style={{ background: C.offWhite }}>
      <div className="max-w-[1200px] mx-auto">
        <SectionReveal>
          <Eyebrow>YOUR FACULTY</Eyebrow>
          <div className="text-center mb-4">
            <h2>
              <span className="block text-[clamp(32px,4vw,48px)] font-extrabold uppercase" style={{ fontFamily: sans, color: C.burgCore, lineHeight: 1.1 }}>
                NOT A COLLECTION
              </span>
              <span className="block text-[clamp(36px,5vw,56px)]" style={{ fontFamily: serif, fontStyle: "italic", color: C.roseCore, lineHeight: 1.1 }}>
                of experts.
              </span>
            </h2>
          </div>
          <p className="text-center max-w-[700px] mx-auto mb-10 text-[16px]" style={{ fontFamily: serif, fontStyle: "italic", color: C.midGrey }}>
            A coordinated system of expertise, intentionally structured so that each discipline builds on the last.
          </p>
        </SectionReveal>

        {/* Filter pills */}
        <SectionReveal>
          <div className="flex flex-wrap justify-center gap-2 mb-10 overflow-x-auto">
            {filterLabels.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className="rounded-full px-4 transition-all duration-200 text-[11px] font-medium uppercase tracking-[0.08em] whitespace-nowrap"
                style={{
                  fontFamily: sans,
                  minHeight: 44,
                  background: activeFilter === f ? C.burgCore : "transparent",
                  color: activeFilter === f ? C.white : C.burgCore,
                  border: activeFilter === f ? `1px solid ${C.burgCore}` : `1px solid rgba(74,14,46,0.15)`,
                }}
              >
                {f === "all" ? "All" : f}
              </button>
            ))}
          </div>
        </SectionReveal>

        {/* Faculty grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {filtered.map((expert) => (
            <SectionReveal key={expert.id}>
              <div
                className="bg-white rounded-lg p-4 h-full flex flex-col items-center text-center overflow-hidden"
                style={{ border: `1px solid rgba(74,14,46,0.06)` }}
              >
                {/* Circular photo */}
                <div
                  className="w-20 h-20 rounded-full mb-4 flex-shrink-0 overflow-hidden flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${C.roseLight}, ${C.rosePale})` }}
                >
                  {expert.profile_picture ? (
                    <img src={expert.profile_picture} alt={expert.name} className="w-full h-full object-cover" />
                  ) : null}
                </div>

                {/* Category */}
                <span className="text-[8px] font-semibold uppercase tracking-[0.18em] mb-1 block" style={{ fontFamily: sans, color: C.midGrey }}>
                  {getExpertCategoryNames(expert).join(" · ") || ""}
                </span>

                {/* Name */}
                <span className="text-[13px] font-bold leading-snug mb-2 block" style={{ fontFamily: sans, color: C.burgCore }}>
                  {expert.name}
                </span>

                {/* Bio snippet */}
                {expert.bio && (
                  <p className="text-[11px] font-light leading-[1.6] mb-3 line-clamp-4 w-full" style={{ fontFamily: sans, color: C.midGrey }}>
                    {expert.bio}
                  </p>
                )}

                {/* CTA */}
                <a
                  href={`/experts/${expert.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-[9px] font-bold uppercase tracking-[0.18em] hover:opacity-60 transition-opacity mt-auto pt-1"
                  style={{ fontFamily: sans, color: C.burgCore }}
                >
                  VIEW PROFILE &rarr;
                </a>
              </div>
            </SectionReveal>
          ))}
        </div>

        {/* Value anchor bar */}
        <SectionReveal>
          <div
            className="rounded-lg px-6 py-5 text-center mt-10"
            style={{ background: C.rosePale }}
          >
            <p className="text-[14px]" style={{ fontFamily: sans, color: C.burgCore }}>
              Accessing all 14 specialists privately would cost{" "}
              <strong>R116,200</strong> &middot; Your access inside the Blueprint:{" "}
              <strong>included</strong>
            </p>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}


// ═══════════════════════════════════════════════
// SECTION 08: WHAT CHANGES (7 PILLARS)
// ═══════════════════════════════════════════════

function WhatChanges() {
  const [active, setActive] = useState(0);
  const pillar = PILLARS[active];

  return (
    <section className="py-14 md:py-24 px-6 md:px-8" style={{ background: GRAD.editorial }}>
      <div className="max-w-[1100px] mx-auto">
        <SectionReveal>
          <Eyebrow dark>WHAT CHANGES</Eyebrow>
          <div className="text-center mb-12">
            <h2>
              <span className="block text-[clamp(28px,4vw,44px)] font-extrabold uppercase text-white" style={{ fontFamily: sans, lineHeight: 1.1 }}>
                NOT WHAT YOU WILL LEARN.
              </span>
              <span className="block text-[clamp(32px,5vw,52px)]" style={{ fontFamily: serif, fontStyle: "italic", color: C.roseCore, lineHeight: 1.1 }}>
                What you will become.
              </span>
            </h2>
          </div>
        </SectionReveal>

        <div className="flex flex-col lg:flex-row gap-0">
          {/* Tab rail (desktop) / pill scroller (mobile) */}
          <div className="lg:w-[260px] flex-shrink-0 mb-6 lg:mb-0">
            {/* Mobile: horizontal scroll */}
            <div className="flex lg:hidden gap-2 overflow-x-auto pb-4 snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
              {PILLARS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className="rounded-full px-4 py-2 whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.06em] transition-all snap-center flex-shrink-0"
                  style={{
                    fontFamily: sans,
                    minHeight: 44,
                    background: active === i ? "rgba(196,132,122,0.15)" : "transparent",
                    color: active === i ? C.roseCore : "rgba(255,255,255,0.5)",
                    border: active === i ? `1px solid rgba(196,132,122,0.3)` : "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Desktop: vertical tabs */}
            <div className="hidden lg:flex flex-col" role="tablist">
              {PILLARS.map((p, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={active === i}
                  onClick={() => setActive(i)}
                  className="text-left px-6 py-4 text-[13px] font-medium uppercase transition-all"
                  style={{
                    fontFamily: sans,
                    color: active === i ? C.roseCore : "rgba(255,255,255,0.5)",
                    background: active === i ? "rgba(196,132,122,0.15)" : "transparent",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    borderLeft: active === i ? `3px solid ${C.roseCore}` : "3px solid transparent",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content panel */}
          <div className="flex-1 lg:pl-10" role="tabpanel" aria-labelledby={`pillar-${active}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-3 block" style={{ fontFamily: sans, color: C.roseCore }}>
                  {pillar.label}
                </span>
                <h3 className="text-[28px] mb-6" style={{ fontFamily: serif, fontStyle: "italic", color: C.white }}>
                  &ldquo;{pillar.quote}&rdquo;
                </h3>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-4 block" style={{ fontFamily: sans, color: "rgba(255,255,255,0.4)" }}>
                  WHAT THIS MEANS IN PRACTICE
                </span>
                <div className="space-y-5">
                  {pillar.outcomes.map((o, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="text-[20px] flex-shrink-0 w-8" style={{ fontFamily: serif, fontStyle: "italic", color: C.roseCore }}>
                        {i + 1}
                      </span>
                      <p className="text-[14px] font-light leading-[1.75]" style={{ fontFamily: sans, color: C.roseLight }}>
                        {o}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Closing block */}
        <SectionReveal>
          <div className="text-center mt-20 pt-12" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-[20px] mb-2" style={{ fontFamily: serif, fontStyle: "italic", color: C.white }}>
              You were meant to rewrite the rules. On your own terms.
            </p>
            <p className="text-[14px] font-light mb-10" style={{ fontFamily: sans, color: "rgba(255,255,255,0.6)" }}>
              If you recognised yourself in any of these seven domains, the Blueprint was built for you.
            </p>
            <PrimaryCTA large />
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}


// ─── ALIVE PHASE (per-phase IO trigger) ───
function AlivePhase({ phase }) {
  const ref = useScrollReveal(0.15);
  return (
    <div
      ref={ref}
      className="animate-on-scroll alive-phase relative rounded-lg p-8 md:p-10 overflow-hidden"
      style={{ background: C.white, border: `1px solid rgba(74,14,46,0.06)`, minHeight: 200 }}
    >
      <span
        className="alive-letter absolute top-4 right-4 md:right-8 pointer-events-none select-none"
        style={{
          fontFamily: serif,
          fontStyle: "italic",
          fontSize: "clamp(120px, 15vw, 200px)",
          color: C.rosePale,
          lineHeight: 1,
          opacity: 0.6,
        }}
      >
        {phase.letter}
      </span>
      <div className="relative z-10">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-3 block" style={{ fontFamily: sans, color: C.burgCore }}>
          {phase.letter} &middot; {phase.name}
        </span>
        <h3 className="text-[24px] mb-4" style={{ fontFamily: serif, fontStyle: "italic", color: C.burgCore }}>
          &ldquo;{phase.quote}&rdquo;
        </h3>
        <p className="text-[14px] font-light leading-[1.8] max-w-[600px]" style={{ fontFamily: sans, color: C.darkGrey }}>
          {phase.body}
        </p>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════
// SECTION 09: THE ALIVE METHOD
// ═══════════════════════════════════════════════

function ALIVEMethod() {
  return (
    <section className="py-14 md:py-24 px-6 md:px-8" style={{ background: C.offWhite }}>
      <div className="max-w-[900px] mx-auto">
        <SectionReveal>
          <Eyebrow>THE PROPRIETARY FRAMEWORK</Eyebrow>
          <h2 className="text-center mb-2">
            <span className="text-[clamp(36px,5vw,52px)]" style={{ fontFamily: serif, fontStyle: "italic", color: C.burgCore }}>
              The ALIVE Method.
            </span>
          </h2>
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] mb-8" style={{ fontFamily: sans, color: C.burgCore }}>
            THE RIGHT TOOLS, IN THE RIGHT ORDER
          </p>
          <p className="text-center max-w-[700px] mx-auto text-[15px] font-light leading-[1.88] mb-4" style={{ fontFamily: sans, color: C.darkGrey }}>
            Most programmes give you the right information in the wrong order. They ask you to set goals before your nervous system can hold them. To lead before you have examined the identity you are leading from. To build before the foundation exists.
          </p>
          <p className="text-center max-w-[700px] mx-auto text-[15px] font-medium leading-[1.88] mb-12" style={{ fontFamily: sans, color: C.burgCore }}>
            The ALIVE Method reverses that. Five stages. One sequence. Designed around what your nervous system and psychology actually require.
          </p>
        </SectionReveal>

        {/* 5 phases, each triggers independently */}
        <div className="space-y-6">
          {ALIVE_PHASES.map((phase, i) => (
            <AlivePhase key={i} phase={phase} />
          ))}
        </div>
      </div>
    </section>
  );
}


// ═══════════════════════════════════════════════
// SECTION 10: TESTIMONIALS
// ═══════════════════════════════════════════════

function Testimonials() {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? TESTIMONIALS : TESTIMONIALS.slice(0, 4);

  return (
    <section className="py-14 md:py-24 px-6 md:px-8" style={{ background: GRAD.burgWarm }}>
      <div className="max-w-[1000px] mx-auto">
        <SectionReveal>
          <Eyebrow dark>WHAT FOUNDING MEMBERS ARE SAYING</Eyebrow>
          <h2 className="text-center mb-12">
            <span className="text-[clamp(36px,5vw,48px)]" style={{ fontFamily: serif, fontStyle: "italic", color: C.white }}>
              In their words.
            </span>
          </h2>
        </SectionReveal>

        {/* Masonry-style columns */}
        <div className="md:columns-2 gap-6 space-y-6">
          {visible.map((t, i) => (
            <SectionReveal key={i}>
              <div
                className="testimonial-card break-inside-avoid rounded p-8"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <p className="text-[16px] leading-[1.7] mb-4" style={{ fontFamily: serif, fontStyle: "italic", color: C.white }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p className="text-[12px] font-medium" style={{ fontFamily: sans, color: C.roseCore }}>
                  - {t.name}, {t.age}
                </p>
              </div>
            </SectionReveal>
          ))}
        </div>

        {!showAll && TESTIMONIALS.length > 4 && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowAll(true)}
              className="rounded-full px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] transition-all hover:opacity-80"
              style={{
                fontFamily: sans,
                color: C.white,
                border: "1px solid rgba(255,255,255,0.3)",
                background: "transparent",
                minHeight: 48,
              }}
            >
              Read more testimonials
            </button>
          </div>
        )}
      </div>
    </section>
  );
}


// ═══════════════════════════════════════════════
// SECTION 11: WHO THIS IS FOR
// ═══════════════════════════════════════════════

function WhoThisIsFor() {
  const recognitions = [
    { title: "THE PARADOX", body: "Your life looks impressive from the outside and exhausts you from the inside." },
    { title: "THE COMPETENCE GAP", body: "You are good at what you do. You still cannot explain why it does not feel like enough." },
    { title: "THE UNFINISHED FIXES", body: "You have tried therapy, programmes, coaches, systems. Nothing ever sticks." },
    { title: "THE 3AM MIND", body: "You lie awake planning tomorrow while your body has not recovered from last week." },
    { title: "THE UNNAMED THING", body: "You know something is missing. You cannot name it. So you push harder and hope it resolves itself." },
    { title: "THE READINESS", body: "You are ready to stop performing competence, and start embodying it." },
  ];

  const notFit = [
    "You want quick fixes, hacks, or shortcuts instead of doing the actual work.",
    "You believe your exhaustion is a scheduling problem a better calendar will solve.",
    "You want a community to vent in rather than a system to move through.",
    "You are not willing to complete the programme; the guarantee requires completion, not consumption.",
  ];

  return (
    <section className="py-14 md:py-24 px-6 md:px-8" style={{ background: C.offWhite }}>
      <div className="max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16" style={{ alignItems: "start" }}>
          {/* Left col (sticky) */}
          <div style={{ position: "sticky", top: 96, alignSelf: "start" }}>
            <SectionReveal>
              <EyebrowLeft color={C.burgCore}>WHO THIS IS FOR</EyebrowLeft>
              <h2>
                <span className="block text-[clamp(28px,4vw,44px)]" style={{ fontFamily: serif, fontStyle: "italic", color: C.burgCore, lineHeight: 1.15 }}>
                  The most capable person in every room.
                </span>
                <span className="block text-[clamp(28px,4vw,44px)]" style={{ fontFamily: serif, fontStyle: "italic", color: C.roseCore, lineHeight: 1.15 }}>
                  The least okay inside it.
                </span>
              </h2>
            </SectionReveal>
          </div>

          {/* Right col */}
          <div>
            <SectionReveal>
              <p className="text-[15px] font-light leading-[1.88] mb-8" style={{ fontFamily: sans, color: C.darkGrey }}>
                If any part of that sentence recognised you, this is the signal you have been looking for. Below are the six recognitions women consistently bring when they arrive here, and the four situations where the Blueprint is simply not the right fit.
              </p>
            </SectionReveal>

            {/* Recognition cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {recognitions.map((r, i) => (
                <SectionReveal key={i}>
                  <div
                    className="bg-white rounded-lg p-6 h-full"
                    style={{ border: `1px solid rgba(74,14,46,0.06)` }}
                  >
                    <h3 className="text-[12px] font-bold uppercase tracking-[0.1em] mb-2" style={{ fontFamily: sans, color: C.burgCore }}>
                      {r.title}
                    </h3>
                    <p className="text-[14px] font-light leading-[1.7]" style={{ fontFamily: sans, color: C.darkGrey }}>
                      {r.body}
                    </p>
                  </div>
                </SectionReveal>
              ))}
            </div>
          </div>
        </div>

        {/* Affirmation line */}
        <SectionReveal>
          <p className="text-center text-[18px] my-12" style={{ fontFamily: serif, fontStyle: "italic", color: C.burgCore }}>
            If you recognised yourself above, you are exactly who the Blueprint was built for.
          </p>
        </SectionReveal>

        {/* Not the right fit */}
        <SectionReveal>
          <div
            className="max-w-[880px] mx-auto rounded-lg px-8 py-8"
            style={{ background: "rgba(74,14,46,0.04)", borderTop: `2px solid ${C.burgCore}` }}
          >
            <h3 className="text-[12px] font-bold uppercase tracking-[0.12em] mb-6" style={{ fontFamily: sans, color: C.burgCore }}>
              &#x2715; THIS IS NOT THE RIGHT FIT IF
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notFit.map((n, i) => (
                <div key={i} className="flex gap-3">
                  <X className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: C.burgCore }} />
                  <p className="text-[14px] font-light leading-[1.7]" style={{ fontFamily: sans, color: C.darkGrey }}>
                    {n}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}


// ═══════════════════════════════════════════════
// SECTION 12: COMPARISON TABLE
// ═══════════════════════════════════════════════

function ComparisonTable() {
  return (
    <section className="py-14 md:py-24 px-6 md:px-8" style={{ background: GRAD.editorial }}>
      <div className="max-w-[1100px] mx-auto">
        <SectionReveal>
          <Eyebrow dark>THE DIFFERENCE</Eyebrow>
          <h2 className="text-center mb-2">
            <span className="text-[clamp(32px,5vw,48px)]" style={{ fontFamily: serif, fontStyle: "italic", color: C.white }}>
              This is not another programme.
            </span>
          </h2>
          <p className="text-center max-w-[700px] mx-auto text-[15px] font-light leading-[1.8] mb-12" style={{ fontFamily: sans, color: "rgba(255,255,255,0.6)" }}>
            Most programmes give you the right information in the wrong order, by the wrong people, without the structure to make it stick. Here is exactly what makes this different.
          </p>
        </SectionReveal>

        {/* Desktop table */}
        <SectionReveal>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
              <caption className="sr-only">Comparison of The Aligned Woman Blueprint against generic programmes and traditional coaching</caption>
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="text-left p-4 text-[11px] font-semibold uppercase tracking-[0.14em]"
                    style={{ fontFamily: sans, color: "rgba(255,255,255,0.5)", width: "30%" }}
                  >
                    Generic Programmes
                  </th>
                  <th
                    scope="col"
                    className="text-left p-4 text-[11px] font-semibold uppercase tracking-[0.14em] relative"
                    style={{
                      fontFamily: sans,
                      color: C.white,
                      width: "40%",
                      background: "rgba(196,132,122,0.1)",
                      borderTop: `3px solid ${C.roseCore}`,
                    }}
                  >
                    <span
                      className="absolute -top-3 left-4 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-[0.15em]"
                      style={{ background: C.roseCore, color: C.burgDeep }}
                    >
                      THIS IS YOU
                    </span>
                    The Aligned Woman Blueprint
                  </th>
                  <th
                    scope="col"
                    className="text-left p-4 text-[11px] font-semibold uppercase tracking-[0.14em]"
                    style={{ fontFamily: sans, color: "rgba(255,255,255,0.5)", width: "30%" }}
                  >
                    Traditional Coaching
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <td className="p-4 text-[13px] font-light leading-[1.6] align-top" style={{ fontFamily: sans, color: "rgba(255,255,255,0.5)" }}>
                      <span className="mr-2" style={{ color: "rgba(255,255,255,0.3)" }}>&#x2715;</span>
                      {row.generic}
                    </td>
                    <td
                      className="p-4 text-[13px] font-light leading-[1.6] align-top"
                      style={{ fontFamily: sans, color: C.white, background: "rgba(196,132,122,0.1)" }}
                    >
                      <span className="mr-2" style={{ color: C.roseCore }}>&#x2713;</span>
                      {row.blueprint}
                    </td>
                    <td className="p-4 text-[13px] font-light leading-[1.6] align-top" style={{ fontFamily: sans, color: "rgba(255,255,255,0.5)" }}>
                      <span className="mr-2" style={{ color: "rgba(255,255,255,0.3)" }}>&#x2715;</span>
                      {row.coaching}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionReveal>

        {/* Mobile: stacked cards */}
        <div className="md:hidden space-y-4">
          {COMPARISON_ROWS.map((row, i) => (
            <SectionReveal key={i}>
              <div className="rounded-lg p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex gap-2 mb-3">
                  <span style={{ color: C.roseCore }}>&#x2713;</span>
                  <p className="text-[14px] font-medium leading-[1.6]" style={{ fontFamily: sans, color: C.roseLight }}>
                    {row.blueprint}
                  </p>
                </div>
                <div className="pt-3 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="text-[12px] font-light leading-[1.5]" style={{ fontFamily: sans, color: "rgba(255,255,255,0.4)" }}>
                    <span className="font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>vs Generic: </span>
                    {row.generic}
                  </p>
                  <p className="text-[12px] font-light leading-[1.5]" style={{ fontFamily: sans, color: "rgba(255,255,255,0.4)" }}>
                    <span className="font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>vs Coaching: </span>
                    {row.coaching}
                  </p>
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}


// ═══════════════════════════════════════════════
// SECTION 13: PRICING
// ═══════════════════════════════════════════════

function Pricing() {
  return (
    <section id="enrol" className="py-14 md:py-24 px-6 md:px-8" style={{ background: C.offWhite }}>
      <div className="max-w-[600px] mx-auto text-center">
        <SectionReveal>
          <Eyebrow>YOUR INVESTMENT</Eyebrow>
          <h2 className="mb-2">
            <span className="text-[clamp(32px,5vw,48px)]" style={{ fontFamily: serif, fontStyle: "italic", color: C.burgCore }}>
              Everything you should have been taught.
            </span>
          </h2>
          <p className="text-[15px] font-light leading-[1.8] mb-10" style={{ fontFamily: sans, color: C.midGrey }}>
            Finally. In one place. For less than the cost of a single private consultation with one of your thirteen specialists.
          </p>
        </SectionReveal>

        {/* Pricing card */}
        <SectionReveal>
          <div
            className="bg-white rounded-lg p-10 md:p-12 text-center"
            style={{ boxShadow: "0 20px 60px rgba(74,14,46,0.1)" }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-1" style={{ fontFamily: sans, color: C.midGrey }}>
              PRIVATE ACCESS VALUE
            </p>
            <p className="mb-6">
              <s className="text-[28px]" style={{ fontFamily: serif, fontStyle: "italic", color: C.roseCore }}>
                R116,200
              </s>
            </p>

            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-1" style={{ fontFamily: sans, color: C.midGrey }}>
              YOUR INVESTMENT
            </p>
            <p className="text-[56px] mb-2" style={{ fontFamily: serif, fontStyle: "italic", color: C.burgCore }}>
              R3,997
            </p>
            <p className="text-[14px] font-light mb-6" style={{ fontFamily: sans, color: C.darkGrey }}>
              That is a 97% saving against private access.
            </p>

            <PrimaryCTA className="w-full" />
          </div>
        </SectionReveal>

        <p className="mt-6 text-[11px] font-light uppercase tracking-[0.1em]" style={{ fontFamily: sans, color: C.midGrey }}>
          DOORS OPEN 1 JUNE 2026 &middot; FOUNDING PRICE CLOSES AT LAUNCH
        </p>
      </div>
    </section>
  );
}





// ═══════════════════════════════════════════════
// SECTION 14: FINAL CLOSE
// ═══════════════════════════════════════════════

function FinalClose() {
  return (
    <section className="pt-14 md:pt-24 pb-8 md:pb-12 px-6 md:px-8" style={{ background: GRAD.darkHero }}>
      <div className="max-w-[1100px] mx-auto">
        {/* Top block: 60/40 grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 mb-10">
          <div className="lg:col-span-3">
            <SectionReveal>
              <EyebrowLeft color={C.roseCore}>FOUNDING MEMBER PRICE</EyebrowLeft>
              <h2 className="text-[32px] mb-6" style={{ fontFamily: serif, fontStyle: "italic", color: C.white }}>
                This price will not last for long.
              </h2>
              <p className="text-[15px] font-light leading-[1.88] mb-4" style={{ fontFamily: sans, color: C.roseLight }}>
                R3,997 is the founding price, set deliberately to make the Blueprint accessible to the women who need it most before it transitions to full price. The 13 specialists, the sequenced system, the bonuses. All of this at this price closes on launch day.
              </p>
              <p className="text-[15px] font-light leading-[1.88]" style={{ fontFamily: sans, color: C.roseLight }}>
                Founding members also receive first access to LauraAI Beta, priority for future live experiences, and this rate locked permanently for any future Blueprint content.
              </p>
            </SectionReveal>
          </div>

          <div className="lg:col-span-2">
            <SectionReveal>
              <div className="rounded-lg p-8" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ fontFamily: sans, color: "rgba(255,255,255,0.5)" }}>
                  DOORS OPEN
                </p>
                <p className="text-[36px] mb-6" style={{ fontFamily: serif, fontStyle: "italic", color: C.white }}>
                  Founding Price.
                </p>
                <div className="space-y-3 mb-8">
                  {[
                    "Full access to 14 specialists, 7 domains, and the ALIVE Method.",
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: C.roseCore }} />
                      <p className="text-[14px] font-light leading-[1.6]" style={{ fontFamily: sans, color: C.roseLight }}>
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
                <PrimaryCTA label="Secure Your Place" className="w-full" />
              </div>
            </SectionReveal>
          </div>
        </div>

      </div>
    </section>
  );
}


// ═══════════════════════════════════════════════
// SECTION 15: FAQ
// ═══════════════════════════════════════════════

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section className="py-14 md:py-24 px-6 md:px-8" style={{ background: C.offWhite }}>
      <div className="max-w-[800px] mx-auto">
        <SectionReveal>
          <Eyebrow>YOUR QUESTIONS ANSWERED</Eyebrow>
          <h2 className="text-center mb-2">
            <span className="text-[clamp(32px,5vw,48px)]" style={{ fontFamily: serif, fontStyle: "italic", color: C.burgCore }}>
              Everything you need to know.
            </span>
          </h2>
          <p className="text-center text-[15px] font-light leading-[1.8] mb-12" style={{ fontFamily: sans, color: C.midGrey }}>
            If your question is not here, email{" "}
            <a href="mailto:hello@alignedwomanco.com" className="underline hover:opacity-70" style={{ color: C.burgCore }}>
              hello@alignedwomanco.com
            </a>{" "}
            and we will answer it before you decide.
          </p>
        </SectionReveal>

        <div>
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className={`faq-item${isOpen ? " is-open" : ""}`} style={{ borderBottom: `1px solid rgba(74,14,46,0.08)` }}>
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between text-left py-5 px-2 hover:opacity-80"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  style={{ minHeight: 56 }}
                >
                  <span className="text-[15px] font-medium pr-4" style={{ fontFamily: sans, color: C.burgCore }}>
                    {faq.q}
                  </span>
                  <span className="faq-icon flex-shrink-0 w-6 h-6 flex items-center justify-center">
                    <Plus className="w-4 h-4" style={{ color: C.burgCore }} />
                  </span>
                </button>
                <div
                  id={`faq-panel-${i}`}
                  role="region"
                  className={`faq-answer${isOpen ? " is-open" : ""}`}
                >
                  <div className="faq-answer-inner">
                    <div className="px-2 pb-5 space-y-3">
                      {faq.a.split("\n\n").map((para, pi) => (
                        <p key={pi} className="text-[14px] font-light leading-[1.8]" style={{ fontFamily: sans, color: C.darkGrey }}>
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center mt-10 text-[14px] font-light" style={{ fontFamily: sans, color: C.midGrey }}>
          Still have a question before you decide?{" "}
          <a href="mailto:hello@alignedwomanco.com" className="underline hover:opacity-70" style={{ color: C.burgCore }}>
            hello@alignedwomanco.com
          </a>
        </p>
      </div>
    </section>
  );
}


// ═══════════════════════════════════════════════
// SECTION 16: FOOTER
// ═══════════════════════════════════════════════

function PageFooter() {
  return (
    <footer className="py-12 px-6 md:px-8" style={{ background: C.ink }}>
      <div className="max-w-[1100px] mx-auto text-center">
        <p className="text-[12px] font-light" style={{ fontFamily: sans, color: "rgba(255,255,255,0.4)" }}>
          &copy; {new Date().getFullYear()} The Aligned Woman Blueprint. All rights reserved.
        </p>
      </div>
    </footer>
  );
}


// ═══════════════════════════════════════════════
// STICKY MOBILE CTA BAR
// ═══════════════════════════════════════════════

function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (dismissed) return;
      const hero = document.getElementById("hero");
      const enrol = document.getElementById("enrol");
      if (!hero) return;

      const heroBottom = hero.getBoundingClientRect().bottom;
      const pastHero = heroBottom < 0;

      // Hide when over pricing or final close
      let overPricing = false;
      if (enrol) {
        const rect = enrol.getBoundingClientRect();
        overPricing = rect.top < window.innerHeight && rect.bottom > 0;
      }

      setVisible(pastHero && !overPricing);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [dismissed]);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center gap-3 px-4 md:hidden"
          style={{
            background: C.ink,
            height: 64,
            borderTop: `1px solid rgba(196,132,122,0.2)`,
          }}
        >
          <Link
            to="/checkout"
            className="flex-1 text-center rounded-full py-3 text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ fontFamily: sans, background: C.roseCore, color: C.burgDeep }}
          >
            Begin Your Blueprint +
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="p-2"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


// ═══════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════

export default function AWBlueprint() {
  useAliveParallax();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const aff = (new URLSearchParams(window.location.search).get("aff") || "").trim();
    if (aff) {
      sessionStorage.setItem("aff", aff);
    }
  }, []);

  return (
    <div style={{ fontFamily: sans }}>
      <style>{`
        html { scroll-behavior: smooth; }

        /* ── SCROLL REVEAL BASE ── */
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.6s cubic-bezier(0.25, 0.1, 0.25, 1.0),
                      transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1.0);
        }
        .animate-on-scroll.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── CTA STYLES ── */
        .cta-primary {
          background: #C4847A;
          color: #0E0208;
          transition: background-color 0.25s ease, box-shadow 0.25s ease, transform 0.1s ease;
        }
        @media (hover: hover) {
          .cta-primary:hover {
            background: #A86460;
            box-shadow: inset 0 0 20px rgba(255,255,255,0.1);
          }
        }
        .cta-primary:active { transform: translateY(1px); background: #8C5550; }
        .cta-primary:focus-visible { outline: 2px solid #E8B4AE; outline-offset: 3px; box-shadow: 0 0 0 4px rgba(232,180,174,0.3); }

        .cta-secondary {
          background: transparent;
          transition: border-color 0.25s ease, color 0.25s ease;
        }
        @media (hover: hover) {
          .cta-secondary:hover { border-color: rgba(255,255,255,0.6) !important; }
        }
        .cta-secondary:active { border-color: rgba(255,255,255,0.8) !important; }

        /* ── FAQ ACCORDION ── */
        .faq-answer {
          display: grid;
          grid-template-rows: 0fr;
          opacity: 0;
          transition: grid-template-rows 0.3s ease-out, opacity 0.3s ease-out;
        }
        .faq-answer.is-open {
          grid-template-rows: 1fr;
          opacity: 1;
        }
        .faq-answer-inner { overflow: hidden; }
        .faq-icon {
          transition: transform 0.3s ease-out;
          display: inline-flex;
        }
        .faq-item.is-open .faq-icon { transform: rotate(45deg); }

        /* ── TESTIMONIAL CARD HOVER ── */
        @media (hover: hover) {
          .testimonial-card {
            transition: transform 0.3s ease-out, box-shadow 0.3s ease-out;
          }
          .testimonial-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          }
        }

        /* ── DOMAIN FILTER TAG TRANSITION ── */
        .domain-tag {
          transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }

        /* ── CLOSING SEQUENCE DELAYS ── */
        .closing-sequence .closing-label     { transition-delay: 0ms; }
        .closing-sequence .closing-line-1    { transition-delay: 200ms; transition-duration: 0.8s; }
        .closing-sequence .closing-line-2    { transition-delay: 1400ms; transition-duration: 0.8s; }
        .closing-sequence .closing-body      { transition-delay: 2400ms; }
        .closing-sequence .closing-directive { transition-delay: 3200ms; }
        .closing-sequence .closing-cta       { transition-delay: 3800ms; }
        .closing-sequence .closing-guarantee { transition-delay: 4000ms; }

        /* ── ALIVE LETTER ── */
        .alive-letter {
          will-change: transform;
          transition: opacity 1.0s ease-out;
        }

        /* ── REDUCED MOTION ── */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-delay: 0ms !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
          .animate-on-scroll { opacity: 1 !important; transform: none !important; }
          html { scroll-behavior: auto; }
        }
      `}</style>

      <Hero />
      <AsSeenIn />
      <YouAreNotFailing />
      <VideoSection />
      <WhyExists />
      <Faculty />
      <WhatChanges />
      <ALIVEMethod />
      <Testimonials />
      <WhoThisIsFor />
      <ComparisonTable />
      <Pricing />
      <FinalClose />
      <FAQSection />
      <PageFooter />
      <StickyMobileCTA />
    </div>
  );
}