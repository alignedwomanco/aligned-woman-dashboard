import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, CheckCircle2, Play, BookOpen, ChevronRight } from "lucide-react";
import { useCourseAccess } from "@/hooks/useCourseAccess";
import CourseAccessGate from "@/components/classroom/CourseAccessGate";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function splitTitle(title) {
  if (!title) return { main: "", italic: "" };
  const words = title.trim().split(" ");
  if (words.length < 3) return { main: title, italic: "" };
  const italicCount = words.length >= 4 ? 2 : 1;
  return {
    main: words.slice(0, words.length - italicCount).join(" "),
    italic: words.slice(words.length - italicCount).join(" "),
  };
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function stripPhasePrefix(t) {
  return (t || "").replace(/^Phase\s+\d+\s*[-:]\s*/i, "").trim();
}

function isPhaseComplete(sectionId, mods, pagesByCourse, progressMap) {
  const sectionMods = mods.filter((m) => m.sectionId === sectionId);
  if (sectionMods.length === 0) return false;
  return sectionMods.every((m) => {
    const modPages = (pagesByCourse[m.courseId] || []).filter((p) => p.moduleId === m.id);
    if (modPages.length === 0) return false;
    return modPages.every((p) => progressMap[p.id] === "completed");
  });
}

function isModuleComplete(moduleId, pages, progressMap) {
  const modPages = pages.filter((p) => p.moduleId === moduleId);
  if (modPages.length === 0) return false;
  return modPages.every((p) => progressMap[p.id] === "completed");
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function HeroBanner({ course, sections, modules, hasAccess, onResume, onBegin, resumeModuleId }) {
  const { main, italic } = splitTitle(course.title);
  const totalMods = modules.length;

  return (
    <div className="relative rounded-2xl overflow-hidden mb-6" style={{ minHeight: 180 }}>
      {/* Background */}
      <div className="absolute inset-0 bg-awburg-core">
        {course.coverImage && (
          <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover opacity-40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-awburg-core/80 to-awburg-mid/60" />
      </div>

      <div className="relative z-10 p-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="flex-1">
          {/* Eyebrow */}
          <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-light uppercase mb-3">
            {course.category ? `${course.category} · ` : ""}{sections.length} PHASES
          </p>
          {/* Title */}
          <h1 className="font-display text-paper text-3xl md:text-4xl leading-tight mb-3">
            {main}{italic && <span className="italic text-awrose-light"> {italic}</span>}
          </h1>
          {/* Description */}
          {course.description && (
            <p className="font-body font-light text-paper/75 text-sm leading-relaxed max-w-xl line-clamp-3 mb-5">
              {course.description}
            </p>
          )}
          {/* CTA buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            {hasAccess ? (
              <button
                onClick={resumeModuleId ? onResume : onBegin}
                className="bg-paper text-awburg-core font-body font-bold text-[10px] tracking-eyebrow uppercase px-6 py-3 rounded-full hover:bg-awrose-pale transition-colors"
              >
                {resumeModuleId ? "RESUME →" : "BEGIN COURSE →"}
              </button>
            ) : null}
          </div>
        </div>
        {/* Module count chip */}
        <div className="flex-shrink-0 text-right">
          <p className="font-body font-bold text-[10px] tracking-eyebrow text-paper/60 uppercase mb-1">MODULES</p>
          <p className="font-display text-paper text-4xl leading-none">{totalMods}</p>
        </div>
      </div>
    </div>
  );
}

function ResumeBar({ profile, modules, sections, courses }) {
  const navigate = useNavigate();
  if (!profile?.last_module_id) return null;
  const mod = modules.find((m) => m.id === profile.last_module_id);
  const sec = mod ? sections.find((s) => s.id === mod.sectionId) : null;
  if (!mod) return null;
  const secMods = modules.filter((m) => m.sectionId === mod.sectionId);
  const modNum = secMods.findIndex((m) => m.id === mod.id) + 1;

  return (
    <div
      className="bg-awrose-pale border border-awrose-light/40 rounded-xl px-6 py-4 mb-8 flex items-center justify-between cursor-pointer hover:bg-awrose-wash transition-colors"
      onClick={() => navigate(createPageUrl("ModulePlayer") + `?moduleId=${profile.last_module_id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") navigate(createPageUrl("ModulePlayer") + `?moduleId=${profile.last_module_id}`); }}
      aria-label="Resume course"
    >
      <div>
        <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-1">
          PICK UP WHERE YOU LEFT OFF{sec ? ` · ${stripPhasePrefix(sec.title).toUpperCase()}` : ""} · MODULE {pad(modNum)}
        </p>
        <p className="font-display text-awburg-core text-lg leading-tight">{mod.title}</p>
      </div>
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-awrose-core flex items-center justify-center">
        <ChevronRight className="w-5 h-5 text-paper" />
      </div>
    </div>
  );
}

function WelcomeSection({ welcomeSection, modules, hasAccess }) {
  const navigate = useNavigate();
  const welcomeMod = modules.filter((m) => m.sectionId === welcomeSection?.id)[0];

  const handlePlay = () => {
    if (!welcomeMod) return;
    navigate(createPageUrl("ModulePlayer") + `?moduleId=${welcomeMod.id}`);
  };

  return (
    <div className="mb-12">
      {/* Eyebrow */}
      <div className="flex items-center gap-3 mb-3">
        <span className="inline-block w-5 h-px bg-awrose-core flex-shrink-0" />
        <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase">WELCOME</p>
      </div>
      {/* Headline with em dash in customer-facing copy */}
      <h2 className="font-display text-awburg-core text-3xl md:text-4xl leading-tight mb-6">
        An <span className="italic text-awrose-deep">introduction</span> to the programme &mdash; and to this module.
      </h2>
      {/* Video placeholder */}
      <div
        className="relative w-full rounded-2xl overflow-hidden bg-awburg-core cursor-pointer group"
        style={{ aspectRatio: "16/9" }}
        onClick={handlePlay}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter") handlePlay(); }}
        aria-label="Play welcome video"
      >
        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-awburg-mid/60 via-awburg-core to-awburg-dark" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-paper/20 group-hover:bg-paper/30 backdrop-blur-sm flex items-center justify-center transition-colors">
            <Play className="w-7 h-7 text-paper fill-paper" />
          </div>
        </div>
        {/* Bottom label */}
        <div className="absolute bottom-5 left-6">
          <p className="font-body font-bold text-[9px] tracking-eyebrow text-paper/60 uppercase mb-1">FROM LAURA</p>
          <p className="font-display italic text-paper text-xl leading-tight">Before you begin</p>
        </div>
      </div>
    </div>
  );
}

function LessonRow({ page, index, progressMap, isLocked, moduleId }) {
  const navigate = useNavigate();
  const status = progressMap[page.id];
  const isComplete = status === "completed";
  const isAvailable = !isLocked && (isComplete || index === 0 || status === "in_progress");

  const handleClick = () => {
    if (isLocked) return;
    navigate(createPageUrl("ModulePlayer") + `?moduleId=${moduleId}&pageId=${page.id}`);
  };

  return (
    <div
      onClick={isLocked ? undefined : handleClick}
      role={isLocked ? undefined : "button"}
      tabIndex={isLocked ? -1 : 0}
      onKeyDown={(e) => { if (!isLocked && e.key === "Enter") handleClick(); }}
      aria-label={isLocked ? undefined : `Open lesson: ${page.title}`}
      className={`flex items-center gap-4 px-4 py-3 border-b border-awburg-core/6 last:border-0 transition-colors ${
        isLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-awrose-wash rounded-lg"
      }`}
    >
      <span className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core/50 w-6 flex-shrink-0">
        {pad(index + 1)}
      </span>
      <span className="font-body text-sm text-awburg-core flex-1 leading-snug">{page.title}</span>
      {page.pageType && (
        <span className="font-body font-bold text-[9px] tracking-eyebrow text-awrose-core uppercase border border-awrose-light/60 rounded px-2 py-0.5 flex-shrink-0">
          {page.pageType.toUpperCase()}
        </span>
      )}
      <div className="flex-shrink-0 ml-2">
        {isLocked ? (
          <Lock className="w-4 h-4 text-awburg-core/30" />
        ) : isComplete ? (
          <CheckCircle2 className="w-4 h-4 text-awrose-core" />
        ) : (
          <ChevronRight className="w-4 h-4 text-awburg-core/50" />
        )}
      </div>
    </div>
  );
}

function ExpandedModule({ mod, pages, progressMap, modIndex, isLocked, workbooks }) {
  const navigate = useNavigate();
  const modPages = pages.filter((p) => p.moduleId === mod.id).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const workbook = workbooks.find((w) => w.expert_id === mod.expertId && w.course_id === mod.courseId);

  return (
    <div className="mb-6">
      {/* Module header */}
      <div className="flex items-start gap-4 mb-3">
        <span className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core/50 mt-1 flex-shrink-0">
          {pad(modIndex + 1)}
        </span>
        <div>
          <h4 className="font-display text-awburg-core text-xl leading-tight">{mod.title}</h4>
        </div>
      </div>
      {/* Lesson rows */}
      <div className="bg-paper border border-awburg-core/8 rounded-xl overflow-hidden ml-8">
        {modPages.map((page, i) => (
          <LessonRow
            key={page.id}
            page={page}
            index={i}
            progressMap={progressMap}
            isLocked={isLocked}
            moduleId={mod.id}
          />
        ))}
        {modPages.length === 0 && (
          <div className="px-4 py-3 text-sm font-body text-awburg-core/40">No lessons yet.</div>
        )}
        {/* Workbook row */}
        {workbook && (
          <div
            onClick={() => navigate(createPageUrl("WorkbookViewer") + `?workbookId=${workbook.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") navigate(createPageUrl("WorkbookViewer") + `?workbookId=${workbook.id}`); }}
            aria-label={`Open workbook: ${workbook.title}`}
            className="flex items-center gap-4 px-4 py-3 border-t border-awburg-core/6 cursor-pointer hover:bg-awrose-wash rounded-b-xl transition-colors"
          >
            <BookOpen className="w-4 h-4 text-awrose-core flex-shrink-0" />
            <span className="font-body text-sm text-awburg-core flex-1">{workbook.title}</span>
            <span className="font-body font-bold text-[9px] tracking-eyebrow text-awrose-core uppercase border border-awrose-light/60 rounded px-2 py-0.5 flex-shrink-0">
              WORKBOOK
            </span>
            <ChevronRight className="w-4 h-4 text-awburg-core/50" />
          </div>
        )}
      </div>
    </div>
  );
}

function CollapsedModule({ mod, pages, progressMap, modIndex, isLocked }) {
  const navigate = useNavigate();
  const modPages = pages.filter((p) => p.moduleId === mod.id);
  const isComplete = isModuleComplete(mod.id, modPages, progressMap);

  const handleClick = () => {
    if (isLocked) return;
    navigate(createPageUrl("ModulePlayer") + `?moduleId=${mod.id}`);
  };

  return (
    <div
      onClick={isLocked ? undefined : handleClick}
      role={isLocked ? undefined : "button"}
      tabIndex={isLocked ? -1 : 0}
      onKeyDown={(e) => { if (!isLocked && e.key === "Enter") handleClick(); }}
      aria-label={isLocked ? undefined : `Open module: ${mod.title}`}
      className={`flex items-center gap-4 py-3 border-b border-awburg-core/6 last:border-0 transition-colors ${
        isLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-awrose-wash px-2 rounded-lg"
      }`}
    >
      <span className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core/50 w-6 flex-shrink-0">
        {pad(modIndex + 1)}
      </span>
      <span className="font-display text-awburg-core text-base flex-1 leading-snug">{mod.title}</span>
      <div className="flex-shrink-0">
        {isLocked ? (
          <Lock className="w-4 h-4 text-awburg-core/30" />
        ) : isComplete ? (
          <CheckCircle2 className="w-4 h-4 text-awrose-core" />
        ) : (
          <ChevronRight className="w-4 h-4 text-awburg-core/50" />
        )}
      </div>
    </div>
  );
}

function PhaseBlock({ section, sectionIndex, mods, pages, progressMap, currentModuleId, workbooks, prevPhaseComplete, isWelcomeComplete }) {
  const phaseLetter = stripPhasePrefix(section.title)?.[0]?.toUpperCase() || String.fromCharCode(65 + sectionIndex);
  const phaseName = stripPhasePrefix(section.title);

  // Determine phase state
  const isUnlocked = isWelcomeComplete && (sectionIndex === 0 || prevPhaseComplete);
  const isPhaseCompleted = isUnlocked && mods.every((m) => isModuleComplete(m.id, pages.filter((p) => p.moduleId === m.id), progressMap));
  const isCurrent = isUnlocked && !isPhaseCompleted;

  // Find current module within this phase
  const currentModIndexInPhase = mods.findIndex((m) => m.id === currentModuleId);
  const expandedModId = isCurrent
    ? (currentModIndexInPhase !== -1 ? mods[currentModIndexInPhase].id : mods[0]?.id)
    : null;

  // Visual treatment
  const letterOpacity = !isUnlocked ? "opacity-30" : isPhaseCompleted ? "text-awrose-core" : "text-awrose-deep";
  const quoteOpacity = !isUnlocked ? "text-awburg-core/30" : "text-awburg-core";

  return (
    <div className={`flex gap-6 md:gap-10 mb-10 ${!isUnlocked ? "opacity-60" : ""}`}>
      {/* Large letter */}
      <div className="flex-shrink-0 select-none" style={{ width: 80 }}>
        <span
          className={`font-display italic leading-none ${letterOpacity}`}
          style={{ fontSize: "clamp(80px, 12vw, 160px)", lineHeight: 1 }}
        >
          {phaseLetter}
        </span>
      </div>

      {/* Phase content */}
      <div className="flex-1 pt-2">
        {/* Phase meta row */}
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <p className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core/50 uppercase">
            PHASE {section.order ?? (sectionIndex + 1)} · {phaseName.toUpperCase()}
          </p>
          {isCurrent && (
            <span className="bg-awrose-core text-paper font-body font-bold text-[9px] tracking-eyebrow uppercase rounded-full px-2 py-0.5">
              CURRENT
            </span>
          )}
          {!isUnlocked && (
            <span className="flex items-center gap-1 font-body font-bold text-[9px] tracking-eyebrow text-awburg-core/50 uppercase">
              <Lock className="w-3 h-3" /> LOCKED
            </span>
          )}
        </div>

        {/* Phase quote */}
        {section.description && (
          <p className={`font-display italic text-xl md:text-2xl leading-snug mb-5 ${quoteOpacity}`}>
            &ldquo;{section.description}&rdquo;
          </p>
        )}

        {/* Modules - only show if unlocked */}
        {isUnlocked && (
          <div>
            {mods.map((mod, mi) => {
              const isExpanded = mod.id === expandedModId;
              const isModLocked = mi > 0 && !isModuleComplete(mods[mi - 1].id, pages.filter((p) => p.moduleId === mods[mi - 1].id), progressMap) && !isPhaseCompleted;

              return isExpanded ? (
                <ExpandedModule
                  key={mod.id}
                  mod={mod}
                  pages={pages}
                  progressMap={progressMap}
                  modIndex={mi}
                  isLocked={isModLocked}
                  workbooks={workbooks}
                />
              ) : (
                <CollapsedModule
                  key={mod.id}
                  mod={mod}
                  pages={pages}
                  progressMap={progressMap}
                  modIndex={mi}
                  isLocked={isModLocked}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function CourseDetail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const courseId = searchParams.get("courseId") || searchParams.get("id");

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [modules, setModules] = useState([]);
  const [pages, setPages] = useState([]);
  const [progress, setProgress] = useState([]);
  const [profile, setProfile] = useState(null);
  const [workbooks, setWorkbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);

  const { hasAccess, isLoading: accessLoading } = useCourseAccess(course);

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const me = await base44.auth.me();
        const email = me?.email?.toLowerCase();

        // Course
        const courseArr = await base44.entities.Course.filter({ id: courseId });
        const courseData = courseArr[0];
        setCourse(courseData);

        // Sections sorted by order
        const rawSections = await base44.entities.CourseSection.filter({ courseId });
        const sortedSections = rawSections.sort((a, b) => {
          const ao = a.order ?? 9999, bo = b.order ?? 9999;
          if (ao !== bo) return ao - bo;
          return (a.created_date || "").localeCompare(b.created_date || "");
        });
        setSections(sortedSections);

        // Modules sorted by order
        const rawModules = await base44.entities.CourseModule.filter({ courseId });
        const sortedModules = rawModules.sort((a, b) => {
          const ao = a.order ?? 9999, bo = b.order ?? 9999;
          if (ao !== bo) return ao - bo;
          return (a.created_date || "").localeCompare(b.created_date || "");
        });
        setModules(sortedModules);

        // Pages sorted by order
        const rawPages = await base44.entities.CoursePage.filter({ courseId });
        const sortedPages = rawPages.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setPages(sortedPages);

        // Progress for this user
        if (email) {
          const prog = await base44.entities.CourseProgress.filter({ courseId, created_by: email });
          setProgress(prog);

          // Member profile
          const profileArr = await base44.entities.MemberProfile.filter({ user_id: me.id }, "-created_date", 1);
          setProfile(profileArr[0] ?? null);
        }

        // Workbooks for this course
        const wb = await base44.entities.Workbook.filter({ course_id: courseId });
        setWorkbooks(wb);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Realtime subscriptions for live admin reordering
    const unsubSections = base44.entities.CourseSection.subscribe((event) => {
      if (event.data?.courseId === courseId) {
        base44.entities.CourseSection.filter({ courseId }).then((s) => {
          setSections(s.sort((a, b) => {
            const ao = a.order ?? 9999, bo = b.order ?? 9999;
            return ao !== bo ? ao - bo : (a.created_date || "").localeCompare(b.created_date || "");
          }));
        });
      }
    });

    const unsubModules = base44.entities.CourseModule.subscribe((event) => {
      if (event.data?.courseId === courseId) {
        base44.entities.CourseModule.filter({ courseId }).then((m) => {
          setModules(m.sort((a, b) => {
            const ao = a.order ?? 9999, bo = b.order ?? 9999;
            return ao !== bo ? ao - bo : (a.created_date || "").localeCompare(b.created_date || "");
          }));
        });
      }
    });

    return () => {
      unsubSections();
      unsubModules();
    };
  }, [courseId]);

  // Build a flat progress map: pageId -> status
  const progressMap = {};
  progress.forEach((p) => {
    if (p.pageId) progressMap[p.pageId] = p.status;
  });

  // Identify Welcome section (order === 0 or titled "Welcome")
  const welcomeSection = sections.find(
    (s) => s.order === 0 || s.title?.toLowerCase().includes("welcome")
  );
  const nonWelcomeSections = sections.filter((s) => s.id !== welcomeSection?.id);

  // Is welcome complete?
  const welcomeMods = modules.filter((m) => m.sectionId === welcomeSection?.id);
  const welcomePages = pages.filter((p) => welcomeMods.some((m) => m.id === p.moduleId));
  const isWelcomeComplete =
    !welcomeSection ||
    (welcomePages.length > 0 && welcomePages.every((p) => progressMap[p.id] === "completed"));

  // Overall progress
  const totalPages = pages.length;
  const completedPages = pages.filter((p) => progressMap[p.id] === "completed").length;
  const overallPct = totalPages > 0 ? Math.round((completedPages / totalPages) * 100) : 0;

  if (loading || accessLoading) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-awrose-pale border-t-awrose-core rounded-full animate-spin" />
      </div>
    );
  }

  if (!courseId || !course) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <p className="font-body text-awburg-core/50">Course not found.</p>
      </div>
    );
  }

  const handleBegin = () => {
    const firstMod = modules[0];
    if (firstMod) navigate(createPageUrl("ModulePlayer") + `?moduleId=${firstMod.id}`);
  };

  const handleResume = () => {
    if (profile?.last_module_id) {
      navigate(createPageUrl("ModulePlayer") + `?moduleId=${profile.last_module_id}`);
    }
  };

  return (
    <div className="min-h-screen bg-off-white px-6 md:px-10 py-8">
      <div className="max-w-4xl mx-auto">

        {/* Back link */}
        <Link
          to={createPageUrl("Classroom")}
          className="inline-flex items-center gap-2 font-body font-bold text-[10px] tracking-eyebrow text-awburg-core/60 hover:text-awburg-core uppercase mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> CLASSROOM
        </Link>

        {/* Hero Banner */}
        <HeroBanner
          course={course}
          sections={nonWelcomeSections}
          modules={modules}
          hasAccess={hasAccess}
          onResume={handleResume}
          onBegin={handleBegin}
          resumeModuleId={profile?.last_module_id}
        />

        {/* Access gate for non-access users */}
        {!hasAccess && !previewMode && (
          <div className="mb-8">
            <CourseAccessGate course={course} onPreview={() => setPreviewMode(true)} />
          </div>
        )}

        {/* Resume Bar */}
        {hasAccess && (
          <ResumeBar
            profile={profile}
            modules={modules}
            sections={sections}
            courses={[course]}
          />
        )}

        {/* Welcome Section */}
        {welcomeSection && (
          <WelcomeSection
            welcomeSection={welcomeSection}
            modules={modules}
            hasAccess={hasAccess || previewMode}
          />
        )}

        {/* Phase Journey */}
        <div className="space-y-2">
          {nonWelcomeSections.map((section, idx) => {
            const sectionMods = modules.filter((m) => m.sectionId === section.id);

            // Compute prev phase completeness for gating
            const prevSection = nonWelcomeSections[idx - 1];
            const prevMods = prevSection ? modules.filter((m) => m.sectionId === prevSection.id) : [];
            const prevPhaseComplete =
              idx === 0 ||
              (prevMods.length > 0 &&
                prevMods.every((m) =>
                  isModuleComplete(m.id, pages.filter((p) => p.moduleId === m.id), progressMap)
                ));

            return (
              <PhaseBlock
                key={section.id}
                section={section}
                sectionIndex={idx}
                mods={sectionMods}
                pages={pages}
                progressMap={progressMap}
                currentModuleId={profile?.last_module_id}
                workbooks={workbooks}
                prevPhaseComplete={prevPhaseComplete}
                isWelcomeComplete={isWelcomeComplete}
              />
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-awburg-core/8 flex items-center justify-between">
          <p className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core/55 uppercase">
            {course.title} · {overallPct}%
          </p>
          <Link
            to={createPageUrl("Classroom")}
            className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core/55 hover:text-awburg-core uppercase transition-colors"
          >
            ALL COURSES →
          </Link>
        </div>

      </div>
    </div>
  );
}