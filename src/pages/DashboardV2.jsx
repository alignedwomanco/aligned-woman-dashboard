import React, { useState, useEffect, useRef } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { getDashboardState } from "@/lib/dashboardState";
import useContinueModule from "@/hooks/useContinueModule";
import { getArchetype } from "@/data/archetypes";
import { createPageUrl } from "@/utils";

// ────────────────────────────────────────────────────────────────
// DashboardV2 · parallel rebuild of the member dashboard
//
// ADMIN-ONLY PREVIEW while we build. Members never see this page:
// anyone without an admin role is sent to the live /Dashboard.
// The live Dashboard.jsx is untouched.
//
// CUTOVER NOTE (agreed with Laura, on record):
// No data or schema migrates at cutover. This page binds to the
// SAME live entities the current dashboard uses today:
//   User, MemberProfile, CourseProgress, Course, MoneyStoryResponse.
// When the rebuild is complete, cutover is a one-line swap in
// App.jsx so /Dashboard renders this page instead of Dashboard.jsx.
// Keep Dashboard.jsx in place as the instant rollback. Then remove
// the admin gate and the preview banner below.
//
// CUTOVER TODO: the live Dashboard owns flipping
// MemberProfile.has_seen_welcome after the state_b welcome renders.
// This preview deliberately does NOT write it. At cutover, move that
// write here.
//
// Design source: the approved AWB handoff pack (July 2026).
// State map, design → data:
//   Design A (pattern + course)  → state_a_with_quiz
//   Design B (course, no pattern)→ state_a_no_quiz and state_b
//   Design C (free member)       → state_c_no_quiz; state_c (free
//     WITH a pattern) shows the pattern hero, filled CTA on
//     "Read your full pattern" since there is no course to continue.
//
// Token note: the handoff's #F8ECE7 eyebrow-on-dark is not a token.
// Nearest token is awrose-pale, used for all eyebrows on dark panels.
// ────────────────────────────────────────────────────────────────

const PRIVILEGED_ROLES = ["admin", "master_admin", "owner"];

const NAV_ITEMS = [
  { label: "Dashboard", path: "/DashboardV2", active: true },
  { label: "Classroom", path: "/Classroom" },
  { label: "Directory", path: "/ExpertsDirectory" },
  { label: "My Profile", path: "/ProfileSettings" },
];

const KEY_MAP = {
  performer: "performer",
  over_functioner: "overFunctioner",
  delegator: "delegator",
  overrider: "overrider",
  reactor: "reactor",
};

// Supply the Cloudflare R2 mp4 URL to switch this card on.
const YIN_VIDEO_URL = "";

// Background video for the pattern band (02), all states.
const PATTERN_VIDEO_URL =
  "https://pub-e1032a6c8b9241cf9d03513d43a81f17.r2.dev/YourPattern.mp4";

// Legibility shadow for copy sitting over the video.
const TEXT_SHADOW = { textShadow: "0 2px 14px rgba(0,0,0,0.55)" };

// Muted looped background video. muted + playsInline + the canplay retry
// is the combination that autoplays on iOS Safari and Android Chrome;
// same approach already proven in StateAWithQuiz.
function AutoplayVideo({ src, className }) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || !src) return;
    v.muted = true;
    v.src = src;
    v.load();
    const tryPlay = () => {
      v.play().catch(() => {});
    };
    v.addEventListener("canplay", tryPlay, { once: true });
    v.play().catch(() => {});
    return () => v.removeEventListener("canplay", tryPlay);
  }, [src]);
  return (
    <video
      ref={ref}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      aria-hidden="true"
      className={className}
    />
  );
}

// Button recipes, per the handoff global spec.
const BTN_FILLED =
  "inline-flex items-center gap-2 bg-awburg-core hover:bg-awburg-dark text-paper font-body font-bold text-[11px] tracking-eyebrow uppercase py-3 px-6 rounded-full transition-colors duration-200";
const BTN_FILLED_ROSE =
  "inline-flex items-center gap-2 bg-awrose-core hover:bg-awrose-deep text-white font-body font-bold text-[11px] tracking-eyebrow uppercase py-3 px-6 rounded-full transition-colors duration-200";
const BTN_OUTLINE =
  "inline-flex items-center gap-2 bg-transparent border border-awburg-core/35 text-awburg-core hover:bg-awburg-core hover:text-paper font-body font-bold text-[11px] tracking-eyebrow uppercase py-3 px-6 rounded-full transition-colors duration-200";
const BTN_OUTLINE_DARK =
  "inline-flex items-center gap-2 bg-transparent border border-white/40 text-white hover:bg-white/15 font-body font-bold text-[11px] tracking-eyebrow uppercase py-3 px-6 rounded-full transition-colors duration-200";
const LINK_ON_DARK =
  "font-body font-bold text-[11px] tracking-eyebrow uppercase text-white/75 hover:text-white underline underline-offset-4 transition-colors";

const DARK_PANEL_STYLE = {
  background:
    "linear-gradient(135deg, var(--aw-burg-dark) 0%, var(--aw-burg-core) 60%, var(--aw-burg-mid) 100%)",
};

// ── Soft-focus radial washes (AWB handoff, July 2026) ──
// Deep burgundy (#644242) anchored off-centre, diffusing into the cream
// page background (#f6efee) at ~40% — an atmospheric glow, not a hard
// geometric gradient. Used on the page body, the hero overlay, and the
// Trusted Help cards.
// Two-layer page background (AWB handoff, July 2026):
// 1. Base — a soft diagonal wash through warm blush neutrals. Reads as
//    almost-neutral warmth; the mid-tones are the darkest it gets.
// 2. Atmosphere orbs — fixed, behind content (z-0, pointer-events-none):
//    a faint rose sphere bleeding off the right edge, and a white haze
//    brightening the top-left. Glass cards pick both up through their
//    backdrop blur.
const PAGE_BG_STYLE = {
  backgroundColor: "#F6EEEA",
  backgroundImage:
    "linear-gradient(168deg, #F6EEEA 0%, #EEDAD3 30%, #E9D3CD 55%, #F1E3DD 80%, #F8F1ED 100%)",
};
const ROSE_SPHERE_STYLE = {
  position: "fixed",
  right: "-160px",
  top: "44%",
  width: "680px",
  height: "680px",
  borderRadius: "50%",
  backgroundImage:
    "radial-gradient(circle at 32% 28%, #F3E0D9 0%, #E6C4BA 40%, #DDB5AA 70%, #D8AEA4 100%)",
  filter: "blur(28px)",
  opacity: 0.38,
  zIndex: 0,
  pointerEvents: "none",
  transform: "translateY(-50%)",
};
const TOP_HAZE_STYLE = {
  position: "fixed",
  left: "-220px",
  top: "-260px",
  width: "760px",
  height: "760px",
  borderRadius: "50%",
  background: "rgba(255,245,240,0.85)",
  filter: "blur(120px)",
  zIndex: 0,
  pointerEvents: "none",
};
const SOFT_RADIAL_OVERLAY =
  "radial-gradient(130% 120% at 18% 12%, rgba(100,66,66,0.46) 0%, rgba(168,138,138,0.40) 42%, rgba(246,239,238,0.22) 74%, rgba(246,239,238,0.10) 100%)";
const SOFT_RADIAL_CARD =
  "radial-gradient(120% 120% at 18% 0%, rgba(100,66,66,0.14) 0%, rgba(168,138,138,0.08) 46%, rgba(246,239,238,0) 82%)";

// Background video + burgundy overlay for the Blueprint learning cards.
const BLUEPRINT_BG_VIDEO =
  "https://pub-f81092ac00b24c449008a93f41d7542d.r2.dev/6102718_Smoky%20Smoke%20Plume%20Vapor_By_Via_Films_Artlist_HD.mp4";
const BLUEPRINT_VIDEO_OVERLAY =
  "linear-gradient(135deg, rgba(26,5,16,0.80) 0%, rgba(74,14,46,0.80) 60%, rgba(107,22,66,0.80) 100%)";

const GLASS_CARD =
  "rounded-2xl border border-awburg-core/10 bg-white/40 backdrop-blur-2xl shadow-sm";

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function SectionLabel({ children }) {
  return (
    <p className="font-body font-semibold text-[14px] text-awburg-core mb-6">
      {children}
    </p>
  );
}

const NUMBER_WORDS = [
  "zero", "one", "two", "three", "four", "five",
  "six", "seven", "eight", "nine", "ten",
];

function numberWord(n, capitalize = false) {
  const w = n >= 0 && n <= 10 ? NUMBER_WORDS[n] : String(n);
  return capitalize ? w.charAt(0).toUpperCase() + w.slice(1) : w;
}

// Whole-course percent ring for the learning card.
function ProgressRing({ percent }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div className="relative w-24 h-24 flex-shrink-0" aria-label={`${clamped}% complete`}>
      <svg viewBox="0 0 72 72" className="w-24 h-24 -rotate-90">
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="5"
        />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="var(--aw-rose-light)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * clamped) / 100}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-body font-semibold text-white text-sm">
        {clamped}%
      </span>
    </div>
  );
}

function EyebrowOnDark({ children }) {
  return (
    <p className="font-body font-bold text-[10px] tracking-eyebrow uppercase text-awrose-pale mb-2">
      {children}
    </p>
  );
}

function Tag({ children }) {
  return (
    <span className="inline-block font-body font-bold text-[9px] tracking-eyebrow uppercase text-awburg-core bg-awrose-pale/70 rounded-full px-3 py-1">
      {children}
    </span>
  );
}

// ── 02 · Pattern hero, design state A (pattern known) ──
function PatternHero({ profile, isPaid }) {
  const [expanded, setExpanded] = useState(false);
  const archKey = KEY_MAP[profile?.computed_archetype_key] || "performer";
  const arch = getArchetype(archKey);

  return (
    <section
      className="relative rounded-2xl overflow-hidden text-white"
      style={DARK_PANEL_STYLE}
    >
      {/* Background video; gradient beneath remains the fallback. */}
      <AutoplayVideo
        src={PATTERN_VIDEO_URL}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Soft radial burgundy wash, ~40%, diffusing into cream. */}
      <div
        className="absolute inset-0"
        style={{ background: SOFT_RADIAL_OVERLAY }}
      />
      <div className="relative z-10 p-6 md:p-8">
        <div style={TEXT_SHADOW}>
          <EyebrowOnDark>Your pattern</EyebrowOnDark>
          <h2 className="font-display text-[26px] md:text-[30px] leading-tight mb-3">
            {arch?.name || "Your pattern"}
          </h2>
          <p className="font-body font-light text-sm leading-relaxed text-white/90 max-w-xl mb-6">
            {arch?.mirrorLine ||
              (arch?.atBest ? arch.atBest.split(". ").slice(0, 2).join(". ") + "." : "")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {/* Free member with a pattern has no Continue, so this is her
              single filled action. Paid members get the outline tier. */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className={isPaid ? BTN_OUTLINE_DARK : BTN_FILLED_ROSE}
          >
            Read your full pattern
            <ChevronDown
              className="w-3.5 h-3.5 transition-transform duration-200"
              style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>
          <Link to="/StartingPointProfile" className={LINK_ON_DARK}>
            Retake the profile
          </Link>
        </div>

        {/* Inline full-pattern narrative. Becomes a route to the Full
            Pattern page once that page is built; inline keeps the law of
            no dead ends until then. */}
        {expanded && (
          <div
            className="mt-6 pt-6 border-t border-white/15 space-y-4 max-w-2xl"
            style={TEXT_SHADOW}
          >
            {arch?.fullDescription && (
              <p className="font-body font-light text-sm leading-relaxed text-white/90">
                {arch.fullDescription}
              </p>
            )}
            {arch?.primaryPillar && (
              <p className="font-body font-light text-sm leading-relaxed text-white/90">
                The Aligned Woman Blueprint Course addresses this through two pillars. Your
                primary work begins in{" "}
                <span className="font-medium text-white">{arch.primaryPillar}</span>,{" "}
                {arch.primaryPillarNote} Your secondary work sits in{" "}
                <span className="font-medium text-white">{arch.secondaryPillar}</span>,{" "}
                {arch.secondaryPillarNote}
              </p>
            )}
            {arch?.foundation && (
              <p className="font-display italic text-sm leading-relaxed text-awrose-pale">
                {arch.foundation}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ── 02 · Profile invitation hero, design states B and C ──
function ProfileInviteHero({ variant, onDismiss }) {
  const isFree = variant === "c";
  return (
    <section
      className="relative rounded-2xl overflow-hidden text-white"
      style={DARK_PANEL_STYLE}
    >
      {/* Background video; gradient beneath remains the fallback. */}
      <AutoplayVideo
        src={PATTERN_VIDEO_URL}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Soft radial burgundy wash, ~40%, diffusing into cream. */}
      <div
        className="absolute inset-0"
        style={{ background: SOFT_RADIAL_OVERLAY }}
      />
      <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex-1 min-w-0" style={TEXT_SHADOW}>
          <EyebrowOnDark>{isFree ? "Begin here" : "Your starting point"}</EyebrowOnDark>
          <h2 className="font-display text-[24px] md:text-[28px] leading-tight mb-3">
            {isFree
              ? "Where should you start? Let's find out together."
              : "Want the work to fit you even better?"}
          </h2>
          <p className="font-body font-light text-sm leading-relaxed text-white/90 max-w-xl">
            {isFree
              ? "A few quiet minutes, a handful of honest questions, and we will show you the pattern that has been running the show, and the gentlest place to start."
              : "A few quiet minutes, a handful of honest questions, and we will show you the pattern that has been running the show. It is entirely optional, and it makes everything after it more yours."}
          </p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* State C: single filled CTA lives here because there is no
              course to continue. State B: outline, Continue stays filled. */}
          <Link
            to="/StartingPointProfile"
            className={isFree ? BTN_FILLED_ROSE : BTN_OUTLINE_DARK}
          >
            Take the profile <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button onClick={onDismiss} className={LINK_ON_DARK}>
            Maybe later
          </button>
        </div>
      </div>
    </section>
  );
}

// ── 03 · Learning card, paid states ──
function LearningCardPaid({ continueData, courseId, coursePercent }) {
  const navigate = useNavigate();
  const phaseIndex = continueData?.phaseIndex ?? 1;
  const totalSections = continueData?.totalSections ?? 0;
  const completed = continueData?.completedModulesInSection ?? 0;
  const total = continueData?.totalModulesInSection ?? 0;
  const remaining = Math.max(total - completed, 0);
  const isComplete = continueData?.isCourseComplete === true;

  const phaseName = (() => {
    const raw = continueData?.currentSection?.title || continueData?.currentSection?.name || "";
    return raw.replace(/^Phase\s*\d+\s*[-]\s*/i, "").trim();
  })();

  const continueUrl = continueData?.module
    ? createPageUrl("ModulePlayer") +
      `?moduleId=${continueData.module.id}&courseId=${courseId}`
    : courseId
      ? createPageUrl("CourseDetail") + `?courseId=${courseId}`
      : createPageUrl("Classroom");

  const openCourseUrl = courseId
    ? createPageUrl("CourseDetail") + `?courseId=${courseId}`
    : createPageUrl("Classroom");

  return (
    <section className="rounded-2xl overflow-hidden text-white flex-1 relative" style={DARK_PANEL_STYLE}>
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src={BLUEPRINT_BG_VIDEO}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
      <div className="absolute inset-0" style={{ background: BLUEPRINT_VIDEO_OVERLAY }} />
      <div className="relative p-6 md:p-8">
        <div className="flex items-center justify-between gap-6">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 font-body font-bold text-[9px] tracking-eyebrow uppercase text-awrose-pale bg-white/10 rounded-full px-3 py-1.5 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-awrose-light" />
              {isComplete
                ? "Complete · all five phases"
                : `In progress · Phase ${phaseIndex} of ${totalSections || 5}`}
            </span>
            <h3 className="font-display text-[24px] md:text-[28px] leading-tight mb-2">
              The Aligned <span className="italic text-awrose-light">Woman</span> Blueprint
            </h3>
            <p className="font-body font-light text-sm text-white/90">
              {isComplete
                ? "You have completed all five phases. Begin again from Awareness whenever you like."
                : phaseName
                  ? `You are in ${phaseName}. ${numberWord(remaining, true)} ${remaining === 1 ? "module" : "modules"} left in this phase.`
                  : "Pick up where you left off."}
            </p>
          </div>
          {!isComplete && typeof coursePercent === "number" && (
            <ProgressRing percent={coursePercent} />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-7">
          <button onClick={() => navigate(continueUrl)} className={BTN_FILLED_ROSE}>
            Continue <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => navigate(openCourseUrl)} className={LINK_ON_DARK}>
            Open the course
          </button>
        </div>
      </div>
    </section>
  );
}

// ── 03 · Learning card, free member ──
function LearningCardFree() {
  return (
    <section className="rounded-2xl overflow-hidden text-white flex-1 relative" style={DARK_PANEL_STYLE}>
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src={BLUEPRINT_BG_VIDEO}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
      <div className="absolute inset-0" style={{ background: BLUEPRINT_VIDEO_OVERLAY }} />
      <div className="relative p-6 md:p-8">
        <span className="inline-block font-body font-bold text-[9px] tracking-eyebrow uppercase text-awrose-pale bg-white/10 rounded-full px-3 py-1.5 mb-4">
          The flagship
        </span>
        <h3 className="font-display text-[24px] md:text-[28px] leading-tight mb-2">
          The Aligned <span className="italic text-awrose-light">Woman</span> Blueprint
        </h3>
        <p className="font-body font-light text-sm text-white/90 mb-6 max-w-md">
          The education you should have been given. Five phases, taught by women who have
          lived them, at your own pace, yours for life.
        </p>
        <Link to={createPageUrl("BlueprintPage")} className={BTN_OUTLINE_DARK}>
          Explore the Blueprint <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}

function MoreCoursesCard() {
  return (
    <section className={`${GLASS_CARD} p-6 md:p-8 lg:w-72 flex-shrink-0`}>
      <h3 className="font-display text-awburg-core text-[20px] leading-tight mb-3">
        More courses are coming.
      </h3>
      <p className="font-body font-light text-[13px] leading-relaxed text-awburg-core/70 mb-5">
        AW Verified experts are bringing their work here, taught the Aligned{" "}
        <span className="font-display italic">Woman</span> way. Have a look at what is
        arriving.
      </p>
      <Link to="/Classroom" className={BTN_OUTLINE}>
        Explore courses
      </Link>
    </section>
  );
}

// ── 04 · Directory band ──
function DirectoryBand() {
  return (
    <section>
      <SectionLabel>Trusted help, when you want it</SectionLabel>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div
          className={`${GLASS_CARD} relative overflow-hidden p-6 md:p-8`}
          style={{ background: SOFT_RADIAL_CARD }}
        >
          {/* Decorative rose glow, per the reference design. */}
          <div
            aria-hidden="true"
            className="absolute -right-8 bottom-0 w-56 h-56 rounded-full bg-awrose-light/40 blur-3xl pointer-events-none"
          />
          <Tag>Practitioners</Tag>
          <h3 className="font-display text-awburg-core text-[20px] leading-tight mt-4 mb-3">
            Find an AW Verified practitioner
          </h3>
          {/* "vetted" lives in this copy only, by design. */}
          <p className="font-body font-light text-[13px] leading-relaxed text-awburg-core/70 mb-5">
            Every AW Verified practitioner has been vetted by us, credentials, proof, and a
            real conversation. Women you do not have to second-guess.
          </p>
          <Link to="/ExpertsDirectory" className={BTN_OUTLINE}>
            Browse practitioners <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className={`${GLASS_CARD} p-6 md:p-8`} style={{ background: SOFT_RADIAL_CARD }}>
          <Tag>Businesses</Tag>
          <h3 className="font-display text-awburg-core text-[20px] leading-tight mt-4 mb-3">
            Find an AW Verified business
          </h3>
          <p className="font-body font-light text-[13px] leading-relaxed text-awburg-core/70 mb-5">
            Women-owned businesses we trust enough to put our name near. Find the ones doing
            the work you need done.
          </p>
          {/* type=business is a forward param; the directory adopts it when
              the business filter ships. Until then it lands on the directory. */}
          <Link to="/ExpertsDirectory?type=business" className={BTN_OUTLINE}>
            Browse businesses <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── 05 · Apply strip ──
function ApplyStrip() {
  return (
    <section className={`${GLASS_CARD} p-6 md:p-8`}>
      <h3 className="font-display text-awburg-core text-[18px] leading-tight mb-2">
        Do you serve women too?
      </h3>
      <p className="font-body font-light text-[13px] leading-relaxed text-awburg-core/70 mb-5 max-w-xl">
        We would love to meet you. AW Verification is free, and Verified practitioners can
        bring their courses here.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link to="/Apply" className={BTN_OUTLINE}>
          Apply to become AW Verified
        </Link>
        <Link to="/Apply?intent=course" className={BTN_OUTLINE}>
          Apply to feature your course
        </Link>
      </div>
    </section>
  );
}

// ── 06 · Free resources ──
function FreeResources({ userEmail, isPaid }) {
  const navigate = useNavigate();

  // Any response on record means she has started: Begin becomes Continue.
  const { data: moneyStoryStarted = false } = useQuery({
    queryKey: ["v2-money-story", userEmail],
    queryFn: async () => {
      try {
        const rows = await base44.entities.MoneyStoryResponse.filter(
          userEmail ? { created_by: userEmail } : {},
          "-created_date",
          1
        );
        return (rows?.length ?? 0) > 0;
      } catch (_) {
        return false;
      }
    },
    enabled: !!userEmail,
  });

  return (
    <section>
      <SectionLabel>Free resources</SectionLabel>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className={`${GLASS_CARD} p-6 flex flex-col`}>
          <div>
            <Tag>Workbook</Tag>
          </div>
          <h3 className="font-display text-awburg-core text-[19px] leading-tight mt-4 mb-2">
            Your Money Story
          </h3>
          <p className="font-body font-light text-[13px] leading-relaxed text-awburg-core/70 mb-4 flex-1">
            The beliefs you inherited about money are running quietly underneath every
            decision. Meet them on paper.
          </p>
          <p className="font-body text-[11px] text-awburg-core/55 mb-4">
            {moneyStoryStarted
              ? "In progress · resume where you left off"
              : "Free · about 30 minutes"}
          </p>
          <div>
            <button onClick={() => navigate("/YourMoneyStory")} className={BTN_OUTLINE}>
              {moneyStoryStarted ? "Continue" : "Begin"}
            </button>
          </div>
        </div>

        {YIN_VIDEO_URL ? (
          <div className={`${GLASS_CARD} p-6 flex flex-col`}>
            <div>
              <Tag>Video practice</Tag>
            </div>
            <h3 className="font-display text-awburg-core text-[19px] leading-tight mt-4 mb-2">
              Yin, with Phoebe
            </h3>
            <p className="font-body font-light text-[13px] leading-relaxed text-awburg-core/70 mb-4 flex-1">
              A slow yin practice with Phoebe Greenacre, somatic therapist and nervous
              system coach. For the days your body needs to arrive before your mind can.
            </p>
            <p className="font-body text-[11px] text-awburg-core/55 mb-4">
              20 minutes · watch anytime
            </p>
            <div>
              <a
                href={YIN_VIDEO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={BTN_OUTLINE}
              >
                Watch now
              </a>
            </div>
          </div>
        ) : (
          <FutureResourceSlot />
        )}

        <FutureResourceSlot />
      </div>
    </section>
  );
}

function FutureResourceSlot() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-awrose-core/35 bg-white/25 p-6 flex items-center justify-center min-h-[220px]">
      <p className="font-body font-light text-[12px] leading-relaxed text-awburg-core/45 text-center max-w-[220px]">
        Future resource card. Same shape: type, title, one warm line, one action.
      </p>
    </div>
  );
}

export default function DashboardV2() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(undefined); // undefined = loading
  const [dash, setDash] = useState(null); // { state, user, profile }
  const [dashError, setDashError] = useState("");
  const [inviteDismissed, setInviteDismissed] = useState(
    () => sessionStorage.getItem("aw_v2_invite_dismissed") === "1"
  );

  useEffect(() => {
    base44.auth
      .me()
      .then(setCurrentUser)
      .catch(() => setCurrentUser(null));
  }, []);

  const resolvedUser = currentUser === undefined ? user : currentUser;
  const isPrivileged =
    resolvedUser && PRIVILEGED_ROLES.includes(resolvedUser.role);

  useEffect(() => {
    if (!isPrivileged) return;
    getDashboardState()
      .then(setDash)
      .catch((e) => setDashError(e?.message || "Could not load your dashboard state."));
  }, [isPrivileged]);

  const continueData = useContinueModule(dash?.user || resolvedUser);

  // Blueprint course id, same selection rule the continue hook uses.
  const { data: courses = [] } = useQuery({
    queryKey: ["v2-courses"],
    queryFn: () => base44.entities.Course.filter({ isPublished: true }),
    enabled: !!isPrivileged,
  });
  const courseId =
    (courses.find((c) => c.tags?.includes("blueprint_paid")) || courses[0])?.id || null;

  // Honest whole-course percent for the learning card ring: completed
  // content modules over total content modules, using the SAME completion
  // rules as useContinueModule (explicit module-level record, or every
  // page complete). Kept here rather than in the shared hook so the live
  // dashboard's code path is untouched.
  const { data: coursePercent = null } = useQuery({
    queryKey: ["v2-course-percent", courseId, resolvedUser?.email],
    enabled: !!isPrivileged && !!courseId && !!resolvedUser?.email,
    queryFn: async () => {
      const [modules, pages, progress] = await Promise.all([
        base44.entities.CourseModule.filter({ courseId, isPublished: true }),
        base44.entities.CoursePage.filter({ courseId }),
        base44.entities.CourseProgress.filter({ created_by: resolvedUser.email }),
      ]);
      const pagesByModule = {};
      for (const p of pages) {
        if (!p.moduleId) continue;
        if (!pagesByModule[p.moduleId]) pagesByModule[p.moduleId] = [];
        pagesByModule[p.moduleId].push(p);
      }
      const completedPageIds = new Set(
        progress.filter((p) => p.status === "completed" && p.pageId).map((p) => p.pageId)
      );
      const moduleLevelComplete = new Set(
        progress
          .filter((p) => p.status === "completed" && !p.pageId && p.moduleId)
          .map((p) => p.moduleId)
      );
      const contentModules = modules.filter(
        (m) => (pagesByModule[m.id] || []).length > 0
      );
      if (contentModules.length === 0) return null;
      const done = contentModules.filter(
        (m) =>
          moduleLevelComplete.has(m.id) ||
          (pagesByModule[m.id] || []).every((pg) => completedPageIds.has(pg.id))
      ).length;
      return Math.round((done / contentModules.length) * 100);
    },
  });

  if (currentUser === undefined && !user) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-awrose-pale border-t-awburg-core rounded-full animate-spin" />
      </div>
    );
  }

  // Members never see the rebuild. They go to the live dashboard.
  if (currentUser !== undefined && !isPrivileged) {
    return <Navigate to="/Dashboard" replace />;
  }

  const firstName = (resolvedUser?.full_name || "").split(" ")[0] || "there";
  const state = dash?.state || null;
  const profile = dash?.profile || null;

  const isPaidState =
    state === "state_a_with_quiz" || state === "state_a_no_quiz" || state === "state_b";
  const isFreeState = state === "state_c" || state === "state_c_no_quiz";
  const hasPattern = state === "state_a_with_quiz" || state === "state_c";

  const greetingLine = isFreeState && !hasPattern ? "Welcome" : `${timeGreeting()}`;
  const greetingSub =
    isFreeState && !hasPattern
      ? "You are in the right place. Here is where to begin."
      : "This is your space. Pick up where you left off, or wander.";

  const memberSince = (() => {
    const raw = resolvedUser?.created_date;
    if (!raw) return null;
    const d = new Date(raw);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  })();

  const dismissInvite = () => {
    sessionStorage.setItem("aw_v2_invite_dismissed", "1");
    setInviteDismissed(true);
  };

  return (
    <div className="min-h-screen flex relative" style={PAGE_BG_STYLE}>
      {/* Atmosphere orbs — fixed behind all content. */}
      <div aria-hidden="true" style={TOP_HAZE_STYLE} />
      <div aria-hidden="true" style={ROSE_SPHERE_STYLE} />
      {/* ── Sidebar, desktop ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 bg-paper border-r border-awburg-core/8 flex-col z-40">
        <div className="p-6 pb-8">
          <img
            src="https://media.base44.com/images/public/69f46886a412ee042303f1af/1c0c68566_awblogo.png"
            alt="The Aligned Woman"
            className="h-10 w-auto object-contain"
          />
        </div>
        <nav className="flex-1 px-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                    item.active
                      ? "bg-awrose-pale text-awburg-core font-medium"
                      : "text-awburg-core/70 hover:text-awburg-core hover:bg-awrose-wash"
                  }`}
                >
                  {item.active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-awrose-core flex-shrink-0" />
                  )}
                  <span className="font-body font-bold text-[11px] tracking-eyebrow uppercase">
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="px-8 pb-6 space-y-2">
          {/* LaurAI is not built yet: greyed and non-interactive, so no dead
              link. Becomes a real route when LaurAI ships. */}
          <p
            aria-disabled="true"
            className="font-body font-semibold text-[10px] tracking-eyebrow uppercase text-awburg-core/30 cursor-default select-none"
          >
            Talk to LaurAI
            <span className="ml-2 normal-case tracking-normal text-[9px] font-medium text-awburg-core/40">
              coming soon
            </span>
          </p>
          <Link
            to="/Support"
            className="block font-body font-semibold text-[10px] tracking-eyebrow uppercase text-awburg-core/55 hover:text-awburg-core transition-colors"
          >
            Support
          </Link>
          <p className="font-body font-bold text-[9px] tracking-[0.18em] text-awburg-core/55 uppercase leading-relaxed pt-2">
            THE ALIGNED WOMAN
          </p>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 lg:ml-60 relative z-10">
        {/* Admin preview banner: remove at cutover */}
        <div className="bg-awburg-core text-paper px-6 py-2">
          <p className="font-body font-bold text-[10px] tracking-eyebrow uppercase text-center">
            Dashboard rebuild · admin preview only · members still see the current dashboard
          </p>
        </div>

        {/* Mobile top bar */}
        <div className="lg:hidden px-5 py-4 border-b border-awburg-core/8 flex items-center justify-between">
          <img
            src="https://media.base44.com/images/public/69f46886a412ee042303f1af/1c0c68566_awblogo.png"
            alt="The Aligned Woman"
            className="h-8 w-auto object-contain"
          />
          <div className="flex items-center gap-4">
            <Link
              to="/Classroom"
              className="font-body font-bold text-[10px] tracking-eyebrow uppercase text-awburg-core/70"
            >
              Classroom
            </Link>
            <Link
              to="/ExpertsDirectory"
              className="font-body font-bold text-[10px] tracking-eyebrow uppercase text-awburg-core/70"
            >
              Directory
            </Link>
          </div>
        </div>

        <main className="max-w-5xl mx-auto px-5 md:px-6 py-10 space-y-14 lg:space-y-24">
          {/* 01 · Greeting */}
          <section>
            <h1 className="font-display text-[30px] md:text-[34px] text-awburg-core leading-tight">
              {greetingLine}, {firstName}.
            </h1>
            <p className="font-body font-light text-[14px] text-awburg-core/60 mt-1">
              {greetingSub}
            </p>
          </section>

          {dashError && (
            <section className={`${GLASS_CARD} p-6`}>
              <p className="font-body text-[13px] text-awburg-core/80">
                Something quiet went wrong loading your space. Refresh to try again, or{" "}
                <Link to="/Support" className="underline underline-offset-2">
                  reach Support
                </Link>{" "}
                and we will sort it out together.
              </p>
            </section>
          )}

          {/* 02 · State block */}
          {!dashError && !state && (
            <section className="rounded-2xl bg-awrose-wash animate-pulse h-44" />
          )}
          {state && hasPattern && (
            <PatternHero profile={profile} isPaid={isPaidState} />
          )}
          {state && !hasPattern && !inviteDismissed && (
            <ProfileInviteHero
              variant={isFreeState ? "c" : "b"}
              onDismiss={dismissInvite}
            />
          )}

          {/* 03 · Your learning */}
          <section>
            <SectionLabel>Your learning</SectionLabel>
            <div className="flex flex-col lg:flex-row gap-5">
              {isPaidState ? (
                <LearningCardPaid
                  continueData={continueData}
                  courseId={courseId}
                  coursePercent={coursePercent}
                />
              ) : (
                <LearningCardFree />
              )}
              <MoreCoursesCard />
            </div>
          </section>

          {/* 04 · Directory */}
          <DirectoryBand />

          {/* 05 · For practitioners */}
          <ApplyStrip />

          {/* 06 · Free resources */}
          <FreeResources userEmail={resolvedUser?.email || null} isPaid={isPaidState} />

          {/* Closing line + footer */}
          <section className="pt-2">
            <p className="font-body font-light text-[12.5px] text-awburg-core/70 text-center mb-10">
              Take what you need. It will all be here when you come back.
            </p>
            <footer className="border-t border-awburg-core/8 pt-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <p className="font-body text-[11px] text-awburg-core/55">
                {memberSince ? `Member since ${memberSince} · ` : ""}
                {isPaidState ? (
                  <>
                    The Aligned <span className="font-display italic">Woman</span> Blueprint
                  </>
                ) : (
                  "Free member"
                )}
              </p>
              <div className="flex items-center gap-4">
                <span
                  aria-disabled="true"
                  className="font-body text-[11px] text-awburg-core/30 cursor-default select-none"
                >
                  Talk to LaurAI · coming soon
                </span>
                <Link
                  to="/ProfileSettings"
                  className="font-body text-[11px] text-awburg-core/55 hover:text-awburg-core transition-colors"
                >
                  Your profile
                </Link>
                <Link
                  to="/Support"
                  className="font-body text-[11px] text-awburg-core/55 hover:text-awburg-core transition-colors"
                >
                  Support
                </Link>
              </div>
            </footer>
          </section>
        </main>
      </div>
    </div>
  );
}