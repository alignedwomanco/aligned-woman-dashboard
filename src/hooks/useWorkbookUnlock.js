import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Determines whether a Workbook is unlocked for the current user.
 *
 * Admin/owner/master_admin/moderator roles are always unlocked.
 *
 * For regular users: a Workbook is unlocked when the user has completed every
 * published CourseModule where expertId === workbook.expert_id AND
 * courseId === workbook.course_id. Completion means every CoursePage in the
 * module has a CourseProgress record with status === "completed" for this user.
 *
 * Returns { isUnlocked, isLoading }.
 */
export default function useWorkbookUnlock(workbook) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!workbook) {
      setIsUnlocked(false);
      setIsLoading(false);
      return;
    }

    // No course/expert requirement = unlocked for everyone
    if (!workbook?.expert_id || !workbook?.course_id) {
      setIsUnlocked(true);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function check() {
      setIsLoading(true);

      let me = null;
      try {
        me = await base44.auth.me();
      } catch {
        me = null;
      }

      // Admin bypass
      if (me && ["admin", "owner", "master_admin", "moderator"].includes(me.role)) {
        if (!cancelled) { setIsUnlocked(true); setIsLoading(false); }
        return;
      }

      // 1. Published modules taught by this workbook's expert in this course
      const allModules = await base44.entities.CourseModule.filter({
        expertId: workbook.expert_id,
        courseId: workbook.course_id,
        isPublished: true,
      }, "order", 500);

      if (allModules.length === 0) {
        // No modules to complete = unlocked by default
        if (!cancelled) { setIsUnlocked(true); setIsLoading(false); }
        return;
      }

      // 2. All pages for this course. Explicit limit: the default 50 truncates.
      const allPages = await base44.entities.CoursePage.filter({
        courseId: workbook.course_id,
      }, "order", 500);

      // 3. This user's progress for this course. RLS scopes to the user; the
      //    explicit limit prevents the default 50 from truncating a learner who
      //    has many progress rows, which would otherwise keep the workbook locked.
      const progressQuery = me?.email
        ? { courseId: workbook.course_id, created_by: me.email }
        : { courseId: workbook.course_id };
      const allProgress = await base44.entities.CourseProgress.filter(
        progressQuery, "-created_date", 500
      );

      const completedPageIds = new Set(
        allProgress
          .filter(p => p.status === "completed" && p.pageId)
          .map(p => p.pageId)
      );

      // 4. Every module's pages must be completed
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
