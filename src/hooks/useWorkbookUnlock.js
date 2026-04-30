import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Determines whether a Workbook is unlocked for the current user.
 *
 * A Workbook is unlocked when the user has completed ALL Modules where:
 *   Module.expertId === Workbook.expert_id
 *   AND Module.courseId === Workbook.course_id  (via section → course link)
 *
 * Completion means every CoursePage in the Module has a CourseProgress record
 * with status === "completed" for the current user.
 *
 * Returns { isUnlocked, isLoading } for each workbook_id.
 */
export default function useWorkbookUnlock(workbook) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!workbook?.expert_id || !workbook?.course_id) {
      setIsUnlocked(false);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function check() {
      setIsLoading(true);

      // 1. Get all modules by this expert in this course
      const allModules = await base44.entities.CourseModule.filter({
        expertId: workbook.expert_id,
        courseId: workbook.course_id,
        isPublished: true,
      });

      if (allModules.length === 0) {
        // No modules to complete → unlocked by default
        if (!cancelled) { setIsUnlocked(true); setIsLoading(false); }
        return;
      }

      // 2. Get all pages for those modules
      const allPages = await base44.entities.CoursePage.filter({
        courseId: workbook.course_id,
      });

      // 3. Get all user progress
      const allProgress = await base44.entities.CourseProgress.filter({
        courseId: workbook.course_id,
      });

      const completedPageIds = new Set(
        allProgress
          .filter(p => p.status === "completed" && p.pageId)
          .map(p => p.pageId)
      );

      // 4. Check every module: all its pages must be completed
      let unlocked = true;
      for (const mod of allModules) {
        const modPages = allPages.filter(p => p.moduleId === mod.id);
        if (modPages.length === 0) continue; // no pages = counts as done
        const allDone = modPages.every(p => completedPageIds.has(p.id));
        if (!allDone) { unlocked = false; break; }
      }

      if (!cancelled) { setIsUnlocked(unlocked); setIsLoading(false); }
    }

    check();
    return () => { cancelled = true; };
  }, [workbook?.id, workbook?.expert_id, workbook?.course_id]);

  return { isUnlocked, isLoading };
}