import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { isPreviewMode } from "@/lib/previewMode";
import { hasBlueprintAccess } from "@/lib/entitlement";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import CheckoutModal from "@/components/dashboard/CheckoutModal";

function splitTitleForDisplay(title) {
  if (!title) return { main: "", italic: "" };
  const words = title.trim().split(" ");
  if (words.length < 3) return { main: title, italic: "" };
  const italicCount = words.length >= 4 ? 2 : 1;
  const main = words.slice(0, words.length - italicCount).join(" ");
  const italic = words.slice(words.length - italicCount).join(" ");
  return { main, italic };
}

function stripPhasePrefix(sectionTitle) {
  if (!sectionTitle) return "";
  return sectionTitle.replace(/^Phase\s+\d+\s*[-:]\s*/i, "").trim();
}

function ResumeBanner({ profile, modules, sections, courses, progressRecords }) {
  const navigate = useNavigate();
  if (!profile?.last_module_id) return null;

  const module = modules.find((m) => m.id === profile.last_module_id);
  const section = module ? sections.find((s) => s.id === module.sectionId) : null;
  const course = module ? courses.find((c) => c.id === module.courseId) : null;

  if (!module || !course) return null;

  const sectionModules = modules.filter((m) => m.sectionId === module.sectionId);
  const totalSectionModules = sectionModules.length;
  const moduleOrder = module.order ?? (sectionModules.findIndex((m) => m.id === module.id) + 1);

  const courseModules = modules.filter((m) => m.courseId === course.id);
  const totalCourseModules = courseModules.length;
  const completedCount = profile.completed_modules_count ?? 0;
  const progressPct = totalCourseModules > 0 ? Math.round((completedCount / totalCourseModules) * 100) : 0;

  const resumeProgress = progressRecords
    .filter((p) => p.moduleId === profile.last_module_id)
    .sort((a, b) => {
      const da = a.lastAccessedAt || a.updated_date || "";
      const db = b.lastAccessedAt || b.updated_date || "";
      return db.localeCompare(da);
    })[0];
  const resumePageId = resumeProgress?.pageId;

  const resumeUrl =
    createPageUrl("ModulePlayer") +
    `?moduleId=${profile.last_module_id}` +
    `&courseId=${course.id}` +
    (resumePageId ? `&pageId=${resumePageId}` : "");

  const { main: titleMain, italic: titleItalic } = splitTitleForDisplay(module.title);
  const phaseNum = section?.order ?? "";
  const phaseName = stripPhasePrefix(section?.title);

  const handleResume = () => {
    base44.analytics.track({ eventName: "course_resume_click", properties: { module_id: profile.last_module_id } });
    navigate(resumeUrl);
  };

  return (
    <div className="bg-awrose-wash border border-awrose-pale rounded-2xl p-8 md:p-10 mb-10">
      <div className="flex flex-col md:flex-row gap-8 md:gap-10">
        <div className="flex-1 md:w-3/5">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-block w-5 h-px bg-awrose-core flex-shrink-0" />
            <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase">
              PICK UP WHERE YOU LEFT OFF
            </p>
          </div>
          <h2 className="font-display text-awburg-core text-3xl md:text-4xl leading-tight mb-3">
            {titleMain}{titleItalic && (
              <><br /><span className="italic text-awrose-deep">{titleItalic}</span></>
            )}
          </h2>
          <p className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core/70 uppercase">
            {course.title}
            {phaseNum ? ` · PHASE ${phaseNum}` : ""}
            {phaseName ? ` · ${phaseName.toUpperCase()}` : ""}
            {` · MODULE ${moduleOrder} OF ${totalSectionModules}`}
          </p>
        </div>

        <div className="md:w-2/5 flex flex-col justify-center gap-3">
          <div className="flex items-center justify-between">
            <p className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core uppercase">
              {completedCount} OF {totalCourseModules} MODULES
            </p>
            <p className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core">{progressPct}%</p>
          </div>
          <div className="w-full bg-awrose-pale rounded-full" style={{ height: 3 }}>
            <div
              className="bg-awrose-core rounded-full h-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <button
            onClick={handleResume}
            aria-label="Resume course"
            className="mt-2 w-full bg-awrose-core hover:bg-awburg-core text-paper font-body font-bold text-[10px] tracking-eyebrow uppercase py-4 rounded-full transition-colors"
          >
            RESUME →
          </button>
        </div>
      </div>
    </div>
  );
}

function CourseCard({ course, progressRecords, modules, isEnrolled, isLocked, isPurchasable, onPurchase }) {
  const navigate = useNavigate();

  const courseProgressItems = progressRecords.filter((p) => p.courseId === course.id);
  const completedPages = courseProgressItems.filter((p) => p.status === "completed").length;
  const totalPages = courseProgressItems.length;
  const progressPct = totalPages > 0 ? Math.round((completedPages / totalPages) * 100) : 0;

  const cta = isLocked
    ? null
    : progressPct === 0
    ? "BEGIN →"
    : progressPct >= 100
    ? "REVIEW →"
    : "CONTINUE →";

  const firstLetter = (course.title || "?")[0].toUpperCase();

  const clickable = !isLocked && !isPurchasable;

  const handleClick = () => {
    if (!clickable) return;
    base44.analytics.track({ eventName: "course_card_click", properties: { course_id: course.id } });
    navigate(createPageUrl("CourseDetail") + `?id=${course.id}`);
  };

  const handlePurchase = () => {
    base44.analytics.track({ eventName: "course_purchase_click", properties: { course_id: course.id } });
    if (onPurchase) onPurchase(course);
  };

  return (
    <div
      onClick={handleClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : -1}
      onKeyDown={(e) => { if (clickable && (e.key === "Enter" || e.key === " ")) handleClick(); }}
      aria-label={clickable ? `Open course: ${course.title}` : undefined}
      className={`bg-paper rounded-2xl border border-awburg-core/8 overflow-hidden flex flex-col ${
        clickable
          ? "cursor-pointer hover:shadow-md transition-shadow duration-200"
          : isPurchasable
          ? "hover:shadow-md transition-shadow duration-200"
          : "cursor-not-allowed"
      }`}
    >
      <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
        {course.coverImage ? (
          <img
            src={course.coverImage}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-awrose-pale to-awrose-wash flex flex-col items-center justify-center relative">
            <span className="font-display italic text-awburg-core select-none" style={{ fontSize: 96, lineHeight: 1 }}>
              {firstLetter}
            </span>
            <span className="absolute bottom-3 left-4 font-body font-bold text-[9px] tracking-eyebrow text-awburg-core/55 uppercase">
              COVER · PLACEHOLDER
            </span>
          </div>
        )}

        {course.isFeatured && (
          <span className="absolute top-3 left-3 bg-awrose-core text-paper rounded-full px-3 py-1 font-body font-bold text-[10px] tracking-eyebrow uppercase">
            FEATURED
          </span>
        )}

        {isEnrolled ? (
          <span className="absolute top-3 right-3 bg-awburg-mid text-paper rounded-full px-3 py-1 font-body font-bold text-[10px] tracking-eyebrow uppercase">
            ENROLLED
          </span>
        ) : isPurchasable ? (
          <span className="absolute top-3 right-3 bg-awrose-core text-paper rounded-full px-3 py-1 font-body font-bold text-[10px] tracking-eyebrow uppercase">
            UNLOCK
          </span>
        ) : isLocked ? (
          <span className="absolute top-3 right-3 bg-paper border border-awburg-core/20 text-awburg-core rounded-full px-3 py-1 font-body font-bold text-[10px] tracking-eyebrow uppercase">
            LOCKED
          </span>
        ) : null}
      </div>

      <div className="p-5 flex flex-col flex-1">
        {course.category && (
          <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-2">
            {course.category}
          </p>
        )}
        <h3 className="font-display text-awburg-core text-xl leading-tight mb-2">{course.title}</h3>
        {course.description && (
          <p className="font-body font-light text-sm text-awburg-core/75 line-clamp-2 mb-3">
            {course.description}
          </p>
        )}

        {isEnrolled && progressPct > 0 && (
          <div className="w-full bg-awrose-pale rounded-full mb-3" style={{ height: 3 }}>
            <div
              className="bg-awrose-core rounded-full h-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}

        {isPurchasable ? (
          <div className="flex items-center gap-3 mt-auto pt-1">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handlePurchase(); }}
              className="flex-1 bg-awrose-core text-paper rounded-full py-2.5 font-body font-bold text-[11px] tracking-eyebrow uppercase hover:bg-awrose-deep transition-colors"
            >
              GET ACCESS
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); navigate(createPageUrl("blueprint")); }}
              className="font-body font-bold text-[11px] tracking-eyebrow text-awburg-core uppercase hover:text-awrose-deep transition-colors"
            >
              LEARN MORE →
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between mt-auto pt-1">
            {isEnrolled ? (
              <p className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core uppercase">
                {progressPct}% · {completedPages}/{totalPages}
              </p>
            ) : (
              <p className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core/55 uppercase">
                {isLocked ? "NOT YET AVAILABLE" : ""}
              </p>
            )}
            {isLocked ? (
              <p className="font-body font-bold text-[11px] tracking-eyebrow text-awburg-core/55 uppercase">
                COMING SOON
              </p>
            ) : (
              <p className="font-body font-bold text-[11px] tracking-eyebrow text-awburg-core uppercase">
                {cta}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const FILTERS = ["All", "In Progress", "Not Started", "Completed"];

export default function Classroom() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["classroom-user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["classroom-courses"],
    queryFn: () => base44.entities.Course.filter({ isPublished: true }, "order", 500),
    enabled: !!user,
  });

  const { data: profileArr = [] } = useQuery({
    queryKey: ["classroom-profile", user?.id],
    queryFn: () => base44.entities.MemberProfile.filter({ user_id: user.id }, "-created_date", 1),
    enabled: !!user?.id,
  });
  const profile = profileArr[0] ?? null;

  const { data: progressRecords = [] } = useQuery({
    queryKey: ["classroom-progress", user?.email],
    queryFn: () => isPreviewMode() ? [] : base44.entities.CourseProgress.filter({ created_by: user.email }, "-lastAccessedAt", 500),
    enabled: !!user?.email,
  });

  const { data: modules = [] } = useQuery({
    queryKey: ["classroom-modules"],
    queryFn: () => base44.entities.CourseModule.filter({}, "order", 500),
    enabled: !!user,
  });

  const { data: sections = [] } = useQuery({
    queryKey: ["classroom-sections"],
    queryFn: () => base44.entities.CourseSection.filter({}, "order", 500),
    enabled: !!user,
  });

  // Gate the full-page spinner on the genuine first load only. The previous
  // condition also watched isFetching, which goes true on every background
  // refetch, and React Query refetches on window focus by default. Inside
  // in-app browsers, which fire focus and visibility events repeatedly, that
  // blanked the whole page to a spinner over and over, reading as a looping
  // loading screen. isLoading is true only while a query is fetching with no
  // cached data, so refetches no longer hide the page once it has loaded once.
  const loading = userLoading || coursesLoading;

  const userTags = user?.access_tags ?? [];
  const isAdmin = ["owner", "admin", "master_admin"].includes(user?.role);

  const hasAccess = (course) => {
    if (isAdmin) return true;
    if (!course.tags || course.tags.length === 0) return true;
    if (hasBlueprintAccess(user)) return true;
    return course.tags.some((t) => userTags.includes(t));
  };

  const isEnrolledInCourse = (courseId) =>
    progressRecords.some((p) => p.courseId === courseId);

  const isComingSoonCourse = (course) =>
    !isAdmin && course.isComingSoon;

  const isPurchasableCourse = (course) =>
    !isAdmin && !course.isComingSoon && !hasAccess(course);

  const filteredCourses = useMemo(() => {
    let list = courses;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.category?.toLowerCase().includes(q)
      );
    }

    if (activeFilter === "In Progress") {
      list = list.filter((c) =>
        progressRecords.some((p) => p.courseId === c.id && p.status === "in_progress")
      );
    } else if (activeFilter === "Not Started") {
      list = list.filter(
        (c) => hasAccess(c) && !progressRecords.some((p) => p.courseId === c.id)
      );
    } else if (activeFilter === "Completed") {
      list = list.filter((c) => {
        const courseProgress = progressRecords.filter((p) => p.courseId === c.id);
        return courseProgress.length > 0 && courseProgress.every((p) => p.status === "completed");
      });
    }

    return list;
  }, [courses, search, activeFilter, progressRecords, userTags, isAdmin]);

  const subline = useMemo(() => {
    if (activeFilter === "In Progress") return "Your courses in progress.";
    if (activeFilter === "Not Started") return "Your courses to begin.";
    if (activeFilter === "Completed") return "Your courses completed.";
    if (profile?.last_module_id) return "Continue where you left off.";
    return "A curated library, taught by women who have lived it.";
  }, [activeFilter, profile?.last_module_id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-awrose-pale border-t-awrose-core rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white px-6 md:px-10 py-10">
      <div className="max-w-5xl mx-auto">

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-block w-5 h-px bg-awrose-core flex-shrink-0" />
            <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase">
              YOUR COURSES
            </p>
          </div>
          <h1 className="font-display text-awburg-core text-5xl md:text-6xl leading-tight mb-2">
            Classroom.
          </h1>
          <p className="font-display italic text-awrose-deep text-xl md:text-2xl">
            {subline}
          </p>
        </div>

        <ResumeBanner
          profile={profile}
          modules={modules}
          sections={sections}
          courses={courses}
          progressRecords={progressRecords}
        />

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-10">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-awburg-core/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              aria-label="Search courses"
              className="w-full bg-paper border border-awrose-pale rounded-full py-3 pl-11 pr-5 text-sm font-body text-awburg-core placeholder-awburg-core/40 focus:outline-none focus:ring-2 focus:ring-awrose-light/60"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-full font-body font-bold text-[10px] tracking-eyebrow uppercase border transition-colors ${
                  activeFilter === f
                    ? "bg-awburg-mid text-paper border-awburg-mid"
                    : "bg-transparent text-awburg-core/70 border-awrose-pale hover:border-awburg-core/30"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-body font-light text-awburg-core/50 text-sm">No courses found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                progressRecords={progressRecords}
                modules={modules}
                isEnrolled={isEnrolledInCourse(course.id)}
                isLocked={isComingSoonCourse(course)}
                isPurchasable={isPurchasableCourse(course)}
                onPurchase={() => setCheckoutOpen(true)}
              />
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <p className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core/55 uppercase">
            CLASSROOM · {filteredCourses.length} {filteredCourses.length === 1 ? "COURSE" : "COURSES"}
          </p>
        </div>

      </div>

      <CheckoutModal open={checkoutOpen} onOpenChange={setCheckoutOpen} />
    </div>
  );
}