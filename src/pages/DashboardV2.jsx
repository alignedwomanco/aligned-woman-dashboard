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
  { label: "Community", path: "/Community" },
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
    <p className="font-body font-bold text-[11px] tracking-eyebrow uppercase text-awburg-core mb-6">
      {children}
    </p>
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
      {/* Legibility overlay, same values used on the live dashboard hero. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(74,14,46,0.40) 0%, rgba(44,6,26,0.40) 100%)",
        }}
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
      {/* Legibility overlay, same values used on the live dashboard hero. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(74,14,46,0.80) 0%, rgba(44,6,26,0.80) 100%)",
        }}
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
function LearningCardPaid({ continueData, courseId }) {
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
        <span className="inline-flex items-center gap-2 font-body font-bold text-[9px] tracking-eyebrow uppercase text-awrose-pale bg-white/10 rounded-full px-3 py-1.5 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-awrose-light" />
          {isComplete
            ? "Complete · all five phases"
            : `In progress · Phase ${phaseIndex} of ${totalSections || 5}`}
        </span>
        <h3 className="font-display text-[24px] md:text-[28px] leading-tight mb-2">
          The Aligned <span className="italic text-awrose-light">Woman</span> Blueprint
        </h3>
        <p className="font-body font-light text-sm text-white/90 mb-6">
          {isComplete
            ? "You have completed all five phases. Begin again from Awareness whenever you like."
            : phaseName
              ? `You are in ${phaseName}. ${remaining} ${remaining === 1 ? "module" : "modules"} left in this phase.`
              : "Pick up where you left off."}
        </p>
        {!isComplete && total > 0 && (
          <div className="w-full max-w-xs h-1.5 rounded-full bg-white/15 overflow-hidden mb-6">
            <div
              className="h-full rounded-full bg-awrose-light transition-all"
              style={{ width: `${Math.round((completed / total) * 100)}%` }}
            />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-4">
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
        <div className={`${GLASS_CARD} p-6 md:p-8`}>
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
        <div className={`${GLASS_CARD} p-6 md:p-8`}>
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
    <div className="min-h-screen flex bg-paper">
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
      <div className="flex-1 lg:ml-60">
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
                <LearningCardPaid continueData={continueData} courseId={courseId} />
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