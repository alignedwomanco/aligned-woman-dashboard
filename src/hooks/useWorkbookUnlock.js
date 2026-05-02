import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Determines whether a Workbook is unlocked for the current user.
 *
 * Admin/owner/master_admin roles are always unlocked.
 *
 * For regular users: a Workbook is unlocked when the user has completed ALL
 * published CourseModules where expertId === workbook.expert_id AND
 * courseId === workbook.course_id. Completion means every CoursePage in the
 * module has a CourseProgress record with status === "completed".
 *
 * Returns { isUnlocked, isLoading }.
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

      // Admin bypass — checked before any DB queries
      try {
        const me = await base44.auth.me();
        if (me && ["admin", "owner", "master_admin"].includes(me.role)) {
          if (!cancelled) { setIsUnlocked(true); setIsLoading(false); }
          return;
        }
      } catch {
        // auth.me() failed — fall through to normal check
      }

      // 1. Get all published modules for this expert + course
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

      // 2. Get all pages for this course
      const allPages = await base44.entities.CoursePage.filter({
        courseId: workbook.course_id,
      });

      // 3. Get all user progress for this course
      const allProgress = await base44.entities.CourseProgress.filter({
        courseId: workbook.course_id,
      });

      const completedPageIds = new Set(
        allProgress
          .filter(p => p.status === "completed" && p.pageId)
          .map(p => p.pageId)
      );

      // 4. Every module must have all pages completed
      let unlocked = true;
      for (const mod of allModules) {
        const modPages = allPages.filter(p => p.moduleId === mod.id);
        if (modPages.length === 0) continue;
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