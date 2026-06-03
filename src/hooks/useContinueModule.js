import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * Resolves the user's current module and computes per-phase completion and
 * lock/unlock status from real course data. The current module is the first
 * unfinished module in course order, so "continue" always moves forward and
 * never lands on a module the user has already completed.
 */
export default function useContinueModule(currentUser) {
  const { data: courses, isLoading: loadingCourses } = useQuery({
    queryKey: ["continue-courses"],
    queryFn: () => base44.entities.Course.filter({ isPublished: true }, "-created_date", 500),
    initialData: [],
  });

  const accessibleCourse = courses.find(c => c.tags?.includes("blueprint_paid")) || courses[0] || null;
  const courseId = accessibleCourse?.id;

  const { data: sections, isLoading: loadingSections } = useQuery({
    queryKey: ["continue-sections", courseId],
    queryFn: () => base44.entities.CourseSection.filter({ courseId }, "order", 500),
    initialData: [],
    enabled: !!courseId,
  });

  const { data: modules, isLoading: loadingModules } = useQuery({
    queryKey: ["continue-modules", courseId],
    queryFn: () => base44.entities.CourseModule.filter({ courseId }, "order", 500),
    initialData: [],
    enabled: !!courseId,
  });

  const { data: pages, isLoading: loadingPages } = useQuery({
    queryKey: ["continue-pages", courseId],
    queryFn: () => base44.entities.CoursePage.filter({ courseId }, "order", 500),
    initialData: [],
    enabled: !!courseId,
  });

  const { data: progress, isLoading: loadingProgress } = useQuery({
    queryKey: ["continue-progress", currentUser?.email],
    queryFn: () => base44.entities.CourseProgress.filter({ created_by: currentUser?.email }, "-created_date", 500),
    initialData: [],
    enabled: !!currentUser?.email,
  });

  const { data: experts, isLoading: loadingExperts } = useQuery({
    queryKey: ["continue-experts"],
    queryFn: () => base44.entities.Expert.filter({ isPublished: true }, "-created_date", 500),
    initialData: [],
  });

  const isLoading = loadingCourses || loadingSections || loadingModules || loadingPages || loadingProgress || loadingExperts;

  if (isLoading || !courseId) {
    return {
      module: null, expert: null, completedPages: 0, totalPages: 0,
      moduleIndex: 1, totalModules: 0, nextPageId: null, isLoading,
      currentSection: null, phaseIndex: 1, totalSections: 0,
      completedModulesInSection: 0, totalModulesInSection: 0,
      allPhasesData: [], courseId: null, isCourseComplete: false,
      restartModule: null,
    };
  }

  const completedPageIds = new Set(
    progress.filter(p => p.status === "completed" && p.pageId).map(p => p.pageId)
  );

  const sortedSections = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));
  const sortedModules = sortedSections.flatMap((section) =>
    [...modules]
      .filter((m) => m.sectionId === section.id)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  );

  /** Module is complete when all its pages are done. 0 pages = complete. */
  const isModComplete = (mod) => {
    const modPages = pages.filter(p => p.moduleId === mod.id);
    if (modPages.length === 0) return true;
    return modPages.every(p => completedPageIds.has(p.id));
  };

  // Identify and exclude the welcome section from progression logic
  const isWelcomeSection = (s) =>
    s.order === 0 || (s.title || "").toLowerCase().includes("welcome");

  const contentSections = sortedSections.filter(s => !isWelcomeSection(s));

  // ── Per-phase completion data (content sections only) ────────────────────
  const allPhasesData = contentSections.map((section, idx) => {
    const phaseMods = sortedModules.filter(m => m.sectionId === section.id);
    let phaseCompleted = 0;
    for (const mod of phaseMods) {
      if (isModComplete(mod)) phaseCompleted++;
    }
    const isPhaseComplete = phaseMods.length > 0
      ? phaseMods.every(m => isModComplete(m))
      : true; // empty phase = complete (placeholder)
    return {
      section,
      index: idx + 1,
      totalModules: phaseMods.length,
      completedModules: phaseCompleted,
      isComplete: isPhaseComplete,
    };
  });

  // Determine which phases are unlocked
  let furthestUnlocked = 0;
  for (let i = 0; i < allPhasesData.length; i++) {
    if (allPhasesData[i].isComplete) {
      furthestUnlocked = i + 1;
    } else {
      break;
    }
  }

  // Tag each phase
  const phasesWithStatus = allPhasesData.map((pd, idx) => ({
    ...pd,
    isLocked: idx > furthestUnlocked,
    isCurrent: idx === furthestUnlocked && idx < allPhasesData.length,
    isComplete: pd.isComplete,
  }));

  // ── Find the user's current module ───────────────────────────────────────
  // The next module is the first one, in course order (section order, then
  // module order), that still has an incomplete lesson. Deterministic, always
  // forward, and never an already-finished module. A brand-new user naturally
  // resolves to the first content module, since all its lessons are incomplete.
  const contentSectionIds = new Set(contentSections.map((s) => s.id));
  let inProgressModule = null;
  for (const mod of sortedModules) {
    if (!contentSectionIds.has(mod.sectionId)) continue; // skip welcome
    const modPages = pages.filter(p => p.moduleId === mod.id);
    if (modPages.length === 0) continue; // skip modules with no lessons
    if (modPages.some(p => !completedPageIds.has(p.id))) {
      inProgressModule = mod;
      break;
    }
  }

  // First content module that has lessons. Used as the revisit target when the
  // course is complete, so "begin again" starts at Awareness lesson one rather
  // than the final phase.
  let restartModule = null;
  for (const mod of sortedModules) {
    if (!contentSectionIds.has(mod.sectionId)) continue;
    if (pages.some((p) => p.moduleId === mod.id)) { restartModule = mod; break; }
  }

  // Welcome intro fields, shared across return paths
  const welcomeSection = sortedSections.find((s) => isWelcomeSection(s)) || null;
  const welcomeModule = welcomeSection
    ? sortedModules.find(
        (m) => m.sectionId === welcomeSection.id && pages.some((p) => p.moduleId === m.id)
      ) || null
    : null;
  const welcomeComplete = welcomeModule ? isModComplete(welcomeModule) : true;
  const welcomeExpertName =
    welcomeModule && welcomeModule.expertId
      ? experts.find((e) => e.id === welcomeModule.expertId)?.name || ""
      : "";

  // Every content module is finished: the course is complete. Do not loop back
  // to module one.
  if (!inProgressModule) {
    return {
      module: null, expert: null, completedPages: 0, totalPages: 0,
      moduleIndex: 1, totalModules: 0, nextPageId: null, isLoading: false,
      currentSection: null, phaseIndex: 1, totalSections: contentSections.length,
      completedModulesInSection: 0, totalModulesInSection: 0,
      allPhasesData: phasesWithStatus, courseId,
      welcomeModule, welcomeComplete, welcomeExpertName,
      isCourseComplete: true,
      restartModule,
    };
  }

  // Module page stats
  const modulePages = pages.filter(p => p.moduleId === inProgressModule.id).sort((a, b) => (a.order || 0) - (b.order || 0));
  const completedCount = modulePages.filter(p => completedPageIds.has(p.id)).length;
  const totalCount = modulePages.length;
  const nextPage = modulePages.find(p => !completedPageIds.has(p.id));
  const nextPageId = nextPage?.id || null;

  // Section-level stats
  const sectionModules = sortedModules.filter(m => m.sectionId === inProgressModule.sectionId);
  const moduleIndex = sectionModules.findIndex(m => m.id === inProgressModule.id) + 1;
  const totalModules2 = sectionModules.length;

  const expert = inProgressModule.expertId
    ? experts.find(e => e.id === inProgressModule.expertId) || null
    : null;

  const currentSection = contentSections.find(s => s.id === inProgressModule.sectionId) || null;
  const phaseIndex = currentSection
    ? contentSections.findIndex(s => s.id === currentSection.id) + 1
    : 1;

  let completedModulesInSection = 0;
  for (const mod of sectionModules) {
    if (isModComplete(mod)) completedModulesInSection++;
  }

  return {
    module: inProgressModule,
    expert,
    completedPages: completedCount,
    totalPages: totalCount,
    moduleIndex: moduleIndex || 1,
    totalModules: totalModules2,
    nextPageId,
    isLoading: false,
    currentSection,
    phaseIndex,
    totalSections: contentSections.length,
    completedModulesInSection,
    totalModulesInSection: sectionModules.length,
    allPhasesData: phasesWithStatus,
    courseId,
    welcomeModule,
    welcomeComplete,
    welcomeExpertName,
    isCourseComplete: false,
    restartModule: null,
  };
}