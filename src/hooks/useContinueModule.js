import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * Resolves the user's current in-progress module and computes
 * per-phase completion and lock/unlock status from real course data.
 */
export default function useContinueModule(currentUser) {
  const { data: courses, isLoading: loadingCourses } = useQuery({
    queryKey: ["continue-courses"],
    queryFn: () => base44.entities.Course.filter({ isPublished: true }),
    initialData: [],
  });

  const accessibleCourse = courses.find(c => c.tags?.includes("blueprint_paid")) || courses[0] || null;
  const courseId = accessibleCourse?.id;

  const { data: sections, isLoading: loadingSections } = useQuery({
    queryKey: ["continue-sections", courseId],
    queryFn: () => base44.entities.CourseSection.filter({ courseId }, "order"),
    initialData: [],
    enabled: !!courseId,
  });

  const { data: modules, isLoading: loadingModules } = useQuery({
    queryKey: ["continue-modules", courseId],
    queryFn: () => base44.entities.CourseModule.filter({ courseId }, "order"),
    initialData: [],
    enabled: !!courseId,
  });

  const { data: pages, isLoading: loadingPages } = useQuery({
    queryKey: ["continue-pages", courseId],
    queryFn: () => base44.entities.CoursePage.filter({ courseId }, "order"),
    initialData: [],
    enabled: !!courseId,
  });

  const { data: progress, isLoading: loadingProgress } = useQuery({
    queryKey: ["continue-progress"],
    queryFn: () => base44.entities.CourseProgress.filter({}),
    initialData: [],
  });

  const { data: experts, isLoading: loadingExperts } = useQuery({
    queryKey: ["continue-experts"],
    queryFn: () => base44.entities.Expert.filter({ isPublished: true }),
    initialData: [],
  });

  const isLoading = loadingCourses || loadingSections || loadingModules || loadingPages || loadingProgress || loadingExperts;

  if (isLoading || !courseId) {
    return {
      module: null, expert: null, completedPages: 0, totalPages: 0,
      moduleIndex: 1, totalModules: 0, nextPageId: null, isLoading,
      currentSection: null, phaseIndex: 1, totalSections: 0,
      completedModulesInSection: 0, totalModulesInSection: 0,
      allPhasesData: [], courseId: null,
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

  // ── Find the user's current in-progress module ──────────────────────────
  let inProgressModule = null;
  let bestLastAccessed = null;

  const contentSectionIds = new Set(contentSections.map((s) => s.id));
  for (const mod of sortedModules) {
    if (!contentSectionIds.has(mod.sectionId)) continue;
    const modPages = pages.filter(p => p.moduleId === mod.id);
    if (modPages.length === 0) continue;
    if (!modPages.some(p => !completedPageIds.has(p.id))) continue;

    const moduleProgress = progress.filter(p => p.moduleId === mod.id);
    const lastAccessed = moduleProgress.reduce((latest, p) => {
      if (!p.lastAccessedAt) return latest;
      const d = new Date(p.lastAccessedAt);
      return (!latest || d > latest) ? d : latest;
    }, null);

    if (!inProgressModule || (lastAccessed && (!bestLastAccessed || lastAccessed > bestLastAccessed))) {
      if (lastAccessed) {
        inProgressModule = mod;
        bestLastAccessed = lastAccessed;
      }
    }
    if (!inProgressModule) {
      inProgressModule = mod;
    }
  }

  // Fallback: first module in first content section
  if (!inProgressModule && contentSections.length > 0 && sortedModules.length > 0) {
    const firstSection = contentSections[0];
    const firstSectionModules = sortedModules.filter(m => m.sectionId === firstSection.id);
    inProgressModule = firstSectionModules[0] || sortedModules[0];
  }

  if (!inProgressModule) {
    return {
      module: null, expert: null, completedPages: 0, totalPages: 0,
      moduleIndex: 1, totalModules: 0, nextPageId: null, isLoading: false,
      currentSection: null, phaseIndex: 1, totalSections: contentSections.length,
      completedModulesInSection: 0, totalModulesInSection: 0,
      allPhasesData: phasesWithStatus, courseId,
      welcomeModule: null, welcomeComplete: true, welcomeExpertName: "",
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

  // ── Welcome intro: shown first, never gated, never repeated ──────────────
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
  };
}