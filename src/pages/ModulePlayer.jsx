import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  Download,
  MessageCircle,
  Send,
  Check,
  Lock,
  ExternalLink,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import CourseAccessGate from "@/components/classroom/CourseAccessGate";
import { useCourseAccess } from "@/hooks/useCourseAccess";
import { useToast } from "@/components/ui/use-toast";
import JourneyMilestone from "@/components/classroom/JourneyMilestone";

export default function ModulePlayer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get("moduleId");
  const courseId = searchParams.get("courseId");
  const [selectedPage, setSelectedPage] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [mobileTab, setMobileTab] = useState("about");
  const [milestone, setMilestone] = useState(null); // null | "module" | "phase" | "course"
  // Frozen copy of the just-finished module, its next module and its phase
  // boundary, captured at the moment of completion. The milestone reads from
  // this snapshot rather than the live module, so navigation or a late data
  // load can never shift the card onto the following module.
  const [milestoneSnapshot, setMilestoneSnapshot] = useState(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // ── Queries ──────────────────────────────────────────────

  const { data: course } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: courseId });
      return courses[0];
    },
    enabled: !!courseId,
  });

  const { hasAccess, isLoading: accessLoading } = useCourseAccess(course);

  const { data: module } = useQuery({
    queryKey: ["courseModule", moduleId],
    queryFn: async () => {
      const modules = await base44.entities.CourseModule.filter({ id: moduleId });
      return modules[0];
    },
    enabled: !!moduleId,
  });

  const { data: rawPages = [] } = useQuery({
    queryKey: ["coursePages", moduleId],
    queryFn: () => base44.entities.CoursePage.filter({ moduleId }),
    enabled: !!moduleId,
  });

  const pages = [...rawPages].sort((a, b) => {
    const aOrder = a.order ?? Infinity;
    const bOrder = b.order ?? Infinity;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return (a.created_date || "").localeCompare(b.created_date || "");
  });

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  // Load THIS user's progress, scoped per user in both the cache key and the
  // filter, so different accounts in the same browser never share a cache entry.
  const { data: rawProgress = [] } = useQuery({
    queryKey: ["courseProgress", currentUser?.email],
    queryFn: () =>
      base44.entities.CourseProgress.filter(
        { created_by: currentUser?.email },
        "-created_date",
        500
      ),
    enabled: !!currentUser?.email,
  });

  // Deduplicate: keep only the most recently updated record per pageId so
  // stale duplicates never shadow a completed record.
  const moduleProgress = useMemo(() => {
    const best = {};
    rawProgress.forEach((p) => {
      const key = p.pageId || `module:${p.moduleId}`;
      const existing = best[key];
      if (!existing) { best[key] = p; return; }
      const pDate = p.updated_date || p.created_date || "";
      const eDate = existing.updated_date || existing.created_date || "";
      if (pDate > eDate) best[key] = p;
    });
    return Object.values(best);
  }, [rawProgress]);

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", moduleId],
    queryFn: () =>
      base44.entities.ModuleComment.filter({ moduleId }, "-created_date"),
    enabled: !!moduleId,
  });

  const { data: allCourseModules = [] } = useQuery({
    queryKey: ["allCourseModules", courseId],
    queryFn: () => base44.entities.CourseModule.filter({ courseId }, "order", 500),
    enabled: !!courseId,
  });

  const { data: allCourseSections = [] } = useQuery({
    queryKey: ["allCourseSections", courseId],
    queryFn: () => base44.entities.CourseSection.filter({ courseId }, "order", 500),
    enabled: !!courseId,
  });

  const { data: workbooks = [] } = useQuery({
    queryKey: ["courseWorkbooks", courseId],
    queryFn: () => base44.entities.Workbook.filter({ course_id: courseId }, "order", 500),
    enabled: !!courseId,
  });

  // Load every page for the course in a single query keyed only on courseId,
  // the same way the dashboard hook does. The previous version mapped over the
  // module list inside a query that did not track that list, so when the
  // modules arrived late or partially the page set silently dropped the newest
  // modules and the course appeared to end early. Sourcing pages directly by
  // courseId removes that dependency entirely.
  const { data: allCoursePages = [] } = useQuery({
    queryKey: ["allCoursePages", courseId],
    queryFn: () => base44.entities.CoursePage.filter({ courseId }, "order", 500),
    enabled: !!courseId,
  });

  const { data: expert } = useQuery({
    queryKey: ["expert", module?.expertId],
    queryFn: async () => {
      if (!module?.expertId) return null;
      const experts = await base44.entities.Expert.filter({ id: module.expertId });
      return experts[0] || null;
    },
    enabled: !!module?.expertId,
  });

  const { data: allExperts = [] } = useQuery({
    queryKey: ["allExperts"],
    queryFn: () => base44.entities.Expert.list(),
  });

  // ── Effects ──────────────────────────────────────────────

  useEffect(() => {
    setSelectedPage(null);
    setMilestone(null);
    setMilestoneSnapshot(null);
  }, [moduleId]);

  useEffect(() => {
    if (pages.length > 0 && !selectedPage) {
      setSelectedPage(pages[0]);
    }
  }, [pages]);

  // ── Mutations ────────────────────────────────────────────

  const updateProgressMutation = useMutation({
    mutationFn: async ({ status, progressPercentage }) => {
      const existing = moduleProgress.find((p) => !p.pageId && p.moduleId === moduleId);
      if (existing) {
        return base44.entities.CourseProgress.update(existing.id, {
          status,
          progressPercentage: progressPercentage || existing.progressPercentage || 0,
        });
      } else {
        return base44.entities.CourseProgress.create({
          courseId,
          moduleId,
          status,
          progressPercentage: progressPercentage || 0,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseProgress"] });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: (comment) => base44.entities.ModuleComment.create(comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      setNewComment("");
    },
  });

  const togglePageCompleteMutation = useMutation({
    mutationFn: async ({ pageId, isComplete }) => {
      const existing = moduleProgress.find((p) => p.pageId === pageId);
      if (existing) {
        return base44.entities.CourseProgress.update(existing.id, {
          status: isComplete ? "completed" : "in_progress",
          progressPercentage: isComplete ? 100 : existing.progressPercentage,
        });
      } else {
        return base44.entities.CourseProgress.create({
          courseId,
          moduleId,
          pageId,
          status: isComplete ? "completed" : "in_progress",
          progressPercentage: isComplete ? 100 : 0,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseProgress"] });
    },
  });

  // ── Handlers ─────────────────────────────────────────────

  const handleTogglePageComplete = async () => {
    const pageProgress = moduleProgress.find((p) => p.pageId === selectedPage.id);
    const isCurrentlyComplete = pageProgress?.status === "completed" || false;

    await togglePageCompleteMutation.mutateAsync({
      pageId: selectedPage.id,
      isComplete: !isCurrentlyComplete,
    });

    if (!isCurrentlyComplete) {
      const allPagesCompleted = pages.every((page) => {
        if (page.id === selectedPage.id) return true;
        const progress = moduleProgress.find((p) => p.pageId === page.id);
        return progress?.status === "completed";
      });

      if (allPagesCompleted) {
        await completeModule();
        // Welcome intro: send them straight into the first content module
        // (Awareness), with no module/phase milestone in between.
        const currentSec = allCourseSections.find((s) => s.id === module?.sectionId);
        const onWelcome =
          currentSec &&
          ((currentSec.order ?? 0) === 0 ||
            (currentSec.title || "").toLowerCase().includes("welcome"));
        if (onWelcome) {
          const firstContent = courseModulesWithPages[0] || null;
          if (firstContent) {
            navigate(
              createPageUrl("ModulePlayer") +
                `?moduleId=${firstContent.id}&courseId=${courseId}`
            );
            return;
          }
        }
        if (!module?.isPhaseIntro) {
          setMilestoneSnapshot(buildMilestoneSnapshot());
          setMilestone("module");
        }
      } else {
        const completedCount = pages.filter((page) => {
          if (page.id === selectedPage.id) return true;
          const p = moduleProgress.find((pr) => pr.pageId === page.id);
          return p?.status === "completed";
        }).length;
        const pct = Math.round((completedCount / pages.length) * 100);
        updateProgressMutation.mutate({
          status: "in_progress",
          progressPercentage: pct,
        });
      }
    } else {
      const completedCount = pages.filter((page) => {
        if (page.id === selectedPage.id) return false;
        const p = moduleProgress.find((pr) => pr.pageId === page.id);
        return p?.status === "completed";
      }).length;
      const pct = Math.round((completedCount / pages.length) * 100);
      updateProgressMutation.mutate({
        status: pct > 0 ? "in_progress" : "not_started",
        progressPercentage: pct,
      });
    }
  };

  const completeModule = async () => {
    try {
      await updateProgressMutation.mutateAsync({
        status: "completed",
        progressPercentage: 100,
      });
    } catch (error) {
      console.error("Failed to mark module complete:", error);
    }
    await awardModuleCompletion();
  };

  const awardModuleCompletion = async () => {
    try {
      const pointsRecords = await base44.entities.UserPoints.filter({});
      const currentPoints = pointsRecords[0];

      const modulePoints = 50;
      const streakBonus = (currentPoints?.currentStreak || 0) >= 3 ? 5 : 0;
      const totalPoints = (currentPoints?.points || 0) + modulePoints + streakBonus;
      const newLevel = Math.floor(totalPoints / 100) + 1;

      if (currentPoints) {
        await base44.entities.UserPoints.update(currentPoints.id, {
          points: totalPoints,
          level: newLevel,
          lastActivityDate: new Date().toISOString().split("T")[0],
        });
      } else {
        await base44.entities.UserPoints.create({
          points: totalPoints,
          level: newLevel,
          lastActivityDate: new Date().toISOString().split("T")[0],
        });
      }

      await base44.entities.UserBadge.create({
        badgeId: `module-${moduleId}`,
        badgeName: `${module.title} Complete`,
        badgeIcon: "\uD83C\uDF93",
        earnedDate: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error awarding points:", error);
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addCommentMutation.mutate({
      moduleId,
      comment: newComment,
      isQuestion: false,
    });
  };

  // ── Computed values ──────────────────────────────────────

  const completedPageCount = pages.filter((page) => {
    const p = moduleProgress.find((pr) => pr.pageId === page.id);
    return p?.status === "completed";
  }).length;

  const overallProgress =
    pages.length > 0
      ? Math.round((completedPageCount / pages.length) * 100)
      : 0;

  // ── Loading / access gate ────────────────────────────────

  if (!module || !selectedPage || accessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF5F3]">
        <div className="animate-spin w-8 h-8 border-4 border-[#4A0E2E] border-t-transparent rounded-full" />
      </div>