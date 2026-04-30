import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * Resolves the user's current in-progress module from the
 * Course → Section → Module → Page hierarchy.
 *
 * Priority:
 *   1. Module with at least one incomplete page, most recently accessed first
 *   2. First module (order) in first section (order) of accessible course
 *
 * Returns: { module, expert, completedPages, totalPages, moduleIndex,
 *            totalModules, nextPageId, isLoading }
 */
export default function useContinueModule(currentUser) {
  // 1. Courses the user has access to (blueprint_paid tag match)
  const { data: courses, isLoading: loadingCourses } = useQuery({
    queryKey: ["continue-courses"],
    queryFn: () => base44.entities.Course.filter({ isPublished: true }),
    initialData: [],
  });

  // Pick the first course tagged "blueprint_paid" (or first published)
  const accessibleCourse = courses.find(c => c.tags?.includes("blueprint_paid")) || courses[0] || null;
  const courseId = accessibleCourse?.id;

  // 2. All published sections for this course
  const { data: sections, isLoading: loadingSections } = useQuery({
    queryKey: ["continue-sections", courseId],
    queryFn: () => base44.entities.CourseSection.filter({ courseId, isPublished: true }, "order"),
    initialData: [],
    enabled: !!courseId,
  });

  // 3. All published modules for this course
  const { data: modules, isLoading: loadingModules } = useQuery({
    queryKey: ["continue-modules", courseId],
    queryFn: () => base44.entities.CourseModule.filter({ courseId, isPublished: true }, "order"),
    initialData: [],
    enabled: !!courseId,
  });

  // 4. All pages for this course (to count per-module)
  const { data: pages, isLoading: loadingPages } = useQuery({
    queryKey: ["continue-pages", courseId],
    queryFn: () => base44.entities.CoursePage.filter({ courseId }, "order"),
    initialData: [],
    enabled: !!courseId,
  });

  // 5. User's progress records (page-level completions)
  const { data: progress, isLoading: loadingProgress } = useQuery({
    queryKey: ["continue-progress", courseId],
    queryFn: () => base44.entities.CourseProgress.filter({ courseId }, "-lastAccessedAt"),
    initialData: [],
    enabled: !!courseId,
  });

  // 6. All published experts (for expert lookup)
  const { data: experts, isLoading: loadingExperts } = useQuery({
    queryKey: ["continue-experts"],
    queryFn: () => base44.entities.Expert.filter({ isPublished: true }),
    initialData: [],
  });

  const isLoading = loadingCourses || loadingSections || loadingModules || loadingPages || loadingProgress || loadingExperts;

  if (isLoading || !courseId) {
    return { module: null, expert: null, completedPages: 0, totalPages: 0, moduleIndex: 1, totalModules: 0, nextPageId: null, isLoading };
  }

  // Build a set of completed page IDs
  const completedPageIds = new Set(
    progress.filter(p => p.status === "completed" && p.pageId).map(p => p.pageId)
  );

  // Sort sections and modules by order
  const sortedSections = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));
  const sortedModules = [...modules].sort((a, b) => (a.order || 0) - (b.order || 0));

  // Strategy 1: Find a module the user has in-progress pages in (most recently accessed first)
  // Build module-level progress info
  let inProgressModule = null;
  let bestLastAccessed = null;

  for (const mod of sortedModules) {
    const modPages = pages.filter(p => p.moduleId === mod.id);
    if (modPages.length === 0) continue;

    const hasIncompletePage = modPages.some(p => !completedPageIds.has(p.id));
    if (!hasIncompletePage) continue;

    // Check if user has any progress records for this module
    const moduleProgress = progress.filter(p => p.moduleId === mod.id);
    const lastAccessed = moduleProgress.reduce((latest, p) => {
      if (!p.lastAccessedAt) return latest;
      const d = new Date(p.lastAccessedAt);
      return (!latest || d > latest) ? d : latest;
    }, null);

    // Any module with incomplete pages is a candidate
    if (!inProgressModule || (lastAccessed && (!bestLastAccessed || lastAccessed > bestLastAccessed))) {
      // Prefer module with actual recent access
      if (lastAccessed) {
        inProgressModule = mod;
        bestLastAccessed = lastAccessed;
      }
    }
    // If no module with lastAccessed found yet, take the first one with incomplete pages
    if (!inProgressModule) {
      inProgressModule = mod;
    }
  }

  // Strategy 2 fallback: first module in first section
  if (!inProgressModule && sortedSections.length > 0 && sortedModules.length > 0) {
    const firstSection = sortedSections[0];
    const firstSectionModules = sortedModules.filter(m => m.sectionId === firstSection.id);
    inProgressModule = firstSectionModules[0] || sortedModules[0];
  }

  if (!inProgressModule) {
    return { module: null, expert: null, completedPages: 0, totalPages: 0, moduleIndex: 1, totalModules: 0, nextPageId: null, isLoading: false };
  }

  // Compute page stats for this module
  const modulePages = pages.filter(p => p.moduleId === inProgressModule.id).sort((a, b) => (a.order || 0) - (b.order || 0));
  const completedCount = modulePages.filter(p => completedPageIds.has(p.id)).length;
  const totalCount = modulePages.length;

  // Find next incomplete page
  const nextPage = modulePages.find(p => !completedPageIds.has(p.id));
  const nextPageId = nextPage?.id || null;

  // Module index within its section
  const sectionModules = sortedModules.filter(m => m.sectionId === inProgressModule.sectionId);
  const moduleIndex = sectionModules.findIndex(m => m.id === inProgressModule.id) + 1;
  const totalModules = sectionModules.length;

  // Expert lookup
  const expert = inProgressModule.expertId
    ? experts.find(e => e.id === inProgressModule.expertId) || null
    : null;

  return {
    module: inProgressModule,
    expert,
    completedPages: completedCount,
    totalPages: totalCount,
    moduleIndex: moduleIndex || 1,
    totalModules,
    nextPageId,
    isLoading: false,
  };
}