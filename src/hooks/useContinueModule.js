import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * Resolves the user's current module in a linear course.
 *
 * Canonical order is section.order first, then module.order within the
 * section. The continue target is the first content module in that order
 * that the user has not completed. A module counts as complete when it has
 * an explicit module-level completion record (a record with no pageId) OR
 * when every one of its pages has a page-level completion record. This is
 * deterministic and never points backward to a module already finished.
 *
 * Why this shape matters: module.order restarts at 1 inside every section,
 * so sorting modules by module.order alone scrambles the real sequence
 * across phases. Ordering by section first rebuilds the true path.
 *
 * Returns a stable shape consumed by ContinueCard and ContinueHero:
 *   { module, expert, completedPages, totalPages, moduleIndex, totalModules,
 *     nextPageId, isLoading, currentSection, phaseIndex, totalSections,
 *     completedModulesInSection, totalModulesInSection, isCourseComplete }
 */
export default function useContinueModule(currentUser) {
  // 1. Courses the user has access to (blueprint_paid tag match).
  const { data: courses, isLoading: loadingCourses } = useQuery({
    queryKey: ["continue-courses"],
    queryFn: () => base44.entities.Course.filter({ isPublished: true }),
    initialData: [],
  });

  const accessibleCourse =
    courses.find(c => c.tags?.includes("blueprint_paid")) || courses[0] || null;
  const courseId = accessibleCourse?.id;

  // 2. Published sections for this course.
  const { data: sections, isLoading: loadingSections } = useQuery({
    queryKey: ["continue-sections", courseId],
    queryFn: () => base44.entities.CourseSection.filter({ courseId, isPublished: true }, "order"),
    initialData: [],
    enabled: !!courseId,
  });

  // 3. Published modules for this course.
  const { data: modules, isLoading: loadingModules } = useQuery({
    queryKey: ["continue-modules", courseId],
    queryFn: () => base44.entities.CourseModule.filter({ courseId, isPublished: true }, "order"),
    initialData: [],
    enabled: !!courseId,
  });

  // 4. All pages for this course (used to count and group per module).
  const { data: pages, isLoading: loadingPages } = useQuery({
    queryKey: ["continue-pages", courseId],
    queryFn: () => base44.entities.CoursePage.filter({ courseId }, "order"),
    initialData: [],
    enabled: !!courseId,
  });

  // 5. The signed-in user's progress, scoped by created_by so an admin does
  //    not pick up everyone else's completions, and queried without courseId
  //    so legacy records that never stored courseId are still counted. Every
  //    lookup below is keyed by this course's module and page ids, so any
  //    cross-course records are harmless.
  const userEmail = currentUser?.email || null;
  const { data: progress, isLoading: loadingProgress } = useQuery({
    queryKey: ["continue-progress", courseId, userEmail],
    queryFn: () => base44.entities.CourseProgress.filter(userEmail ? { created_by: userEmail } : {}),
    initialData: [],
    enabled: !!courseId,
  });

  // 6. Published experts (for the byline lookup).
  const { data: experts, isLoading: loadingExperts } = useQuery({
    queryKey: ["continue-experts"],
    queryFn: () => base44.entities.Expert.filter({ isPublished: true }),
    initialData: [],
  });

  const isLoading =
    loadingCourses ||
    loadingSections ||
    loadingModules ||
    loadingPages ||
    loadingProgress ||
    loadingExperts;

  const emptyResult = {
    module: null,
    expert: null,
    completedPages: 0,
    totalPages: 0,
    moduleIndex: 1,
    totalModules: 0,
    nextPageId: null,
    isLoading,
    currentSection: null,
    phaseIndex: 1,
    totalSections: 0,
    completedModulesInSection: 0,
    totalModulesInSection: 0,
    isCourseComplete: false,
  };

  if (isLoading || !courseId) {
    return emptyResult;
  }

  // Page-level completions (records that carry a pageId).
  const completedPageIds = new Set(
    progress.filter(p => p.status === "completed" && p.pageId).map(p => p.pageId)
  );
  // Explicit module-level completions (records with no pageId). These are the
  // user's "I finished this module" signal and must be honoured even if an
  // individual page-level record is missing.
  const moduleLevelComplete = new Set(
    progress.filter(p => p.status === "completed" && !p.pageId && p.moduleId).map(p => p.moduleId)
  );

  // Group pages by module, each list ordered by page order.
  const pagesByModule = {};
  for (const page of pages) {
    if (!page.moduleId) continue;
    if (!pagesByModule[page.moduleId]) pagesByModule[page.moduleId] = [];
    pagesByModule[page.moduleId].push(page);
  }
  for (const mid of Object.keys(pagesByModule)) {
    pagesByModule[mid].sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  const moduleHasPages = mod => (pagesByModule[mod.id] || []).length > 0;

  const isModuleComplete = mod => {
    if (moduleLevelComplete.has(mod.id)) return true;
    const modPages = pagesByModule[mod.id] || [];
    if (modPages.length === 0) return false;
    return modPages.every(p => completedPageIds.has(p.id));
  };

  // Canonical linear order: section.order, then module.order within section.
  const sortedSections = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));
  const modulesBySection = {};
  for (const mod of modules) {
    if (!mod.sectionId) continue;
    if (!modulesBySection[mod.sectionId]) modulesBySection[mod.sectionId] = [];
    modulesBySection[mod.sectionId].push(mod);
  }
  for (const sid of Object.keys(modulesBySection)) {
    modulesBySection[sid].sort((a, b) => (a.order || 0) - (b.order || 0));
  }
  const linearModules = [];
  for (const section of sortedSections) {
    const secModules = modulesBySection[section.id] || [];
    for (const mod of secModules) linearModules.push(mod);
  }

  // Continue target: first startable module in canonical order not yet
  // complete. Empty modules (no pages) cannot be started, so they are skipped
  // as candidates and never block progress.
  let targetModule = null;
  for (const mod of linearModules) {
    if (!moduleHasPages(mod)) continue;
    if (isModuleComplete(mod)) continue;
    targetModule = mod;
    break;
  }

  // If nothing is incomplete, the course is finished: point at the last
  // content module for a graceful revisit and flag completion.
  let isCourseComplete = false;
  if (!targetModule) {
    isCourseComplete = linearModules.some(moduleHasPages);
    for (let i = linearModules.length - 1; i >= 0; i--) {
      if (moduleHasPages(linearModules[i])) {
        targetModule = linearModules[i];
        break;
      }
    }
  }

  if (!targetModule) {
    return { ...emptyResult, isLoading: false };
  }

  // Page stats for the chosen module.
  const targetPages = pagesByModule[targetModule.id] || [];
  const completedCount = targetPages.filter(p => completedPageIds.has(p.id)).length;
  const totalCount = targetPages.length;

  // Resume at the first page without a completion, else the first page.
  const nextPage = targetPages.find(p => !completedPageIds.has(p.id)) || targetPages[0] || null;
  const nextPageId = nextPage?.id || null;

  // Index within the module's own section (drives "MODULE 0X OF 0Y").
  const sectionModules = modulesBySection[targetModule.sectionId] || [];
  const moduleIndex = sectionModules.findIndex(m => m.id === targetModule.id) + 1;
  const totalModules = sectionModules.length;

  const expert = targetModule.expertId
    ? experts.find(e => e.id === targetModule.expertId) || null
    : null;

  // Phase / section data for the phase indicator.
  const currentSection = sortedSections.find(s => s.id === targetModule.sectionId) || null;
  const phaseIndex = currentSection
    ? sortedSections.findIndex(s => s.id === currentSection.id) + 1
    : 1;
  const totalSections = sortedSections.length;

  let completedModulesInSection = 0;
  for (const mod of sectionModules) {
    if (moduleHasPages(mod) && isModuleComplete(mod)) completedModulesInSection++;
  }

  return {
    module: targetModule,
    expert,
    completedPages: completedCount,
    totalPages: totalCount,
    moduleIndex: moduleIndex || 1,
    totalModules,
    nextPageId,
    isLoading: false,
    currentSection,
    phaseIndex,
    totalSections,
    completedModulesInSection,
    totalModulesInSection: sectionModules.length,
    isCourseComplete,
  };
}