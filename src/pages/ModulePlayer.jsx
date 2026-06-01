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
  const [milestone, setMilestone] = useState(null);
  const [milestoneSnapshot, setMilestoneSnapshot] = useState(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: courseId });
      return courses[0];
    },
    enabled: !!courseId,
  });

  const { hasAccess, isLoading: accessLoading } = useCourseAccess(course);

  const { data: module, isLoading: moduleLoading } = useQuery({
    queryKey: ["courseModule", moduleId],
    queryFn: async () => {
      const modules = await base44.entities.CourseModule.filter({ id: moduleId });
      return modules[0];
    },
    enabled: !!moduleId,
  });

  const { data: rawPages = [], isLoading: pagesLoading } = useQuery({
    queryKey: ["coursePages", moduleId],
    queryFn: () => base44.entities.CoursePage.filter({ moduleId }),
    enabled: !!moduleId,
  });

  const pages = useMemo(() => {
    return [...rawPages].sort((a, b) => {
      const aOrder = a.order ?? Infinity;
      const bOrder = b.order ?? Infinity;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return (a.created_date || "").localeCompare(b.created_date || "");
    });
  }, [rawPages]);

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

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

  const handleTogglePageComplete = async () => {
    const pageProgress = moduleProgress.find((p) => p.pageId === selectedPage.id);
    const isCurrentlyComplete = pageProgress?.status === "completed" || false;

    await togglePageCompleteMutation.mutateAsync({
      pageId: selectedPage.id,
      isComplete: !isCurrentlyComplete,
    });

    if (!isCurrentlyComplete) {
      const freshProgress = await base44.entities.CourseProgress.filter(
        { created_by: currentUser?.email },
        "-created_date",
        500
      );

      const completedPageIds = new Set(
        freshProgress
          .filter((p) => p.status === "completed" && p.pageId)
          .map((p) => p.pageId)
      );
      completedPageIds.add(selectedPage.id);

      const allPagesCompleted = pages.every((page) => completedPageIds.has(page.id));

      if (allPagesCompleted) {
        await completeModule();
        const currentSec = allCourseSections.find((s) => s.id === module?.sectionId);
        const onWelcome =
          currentSec &&
          ((currentSec.order ?? 0) === 0 ||
            (currentSec.title || "").toLowerCase().includes("welcome"));
        
        if (onWelcome) {
          if (!module?.isPhaseIntro) {
            setMilestoneSnapshot(buildMilestoneSnapshot());
            setMilestone("module");
          }
        } else if (!nextModuleInOrder) {
          setMilestoneSnapshot(buildMilestoneSnapshot());
          setMilestone("course");
        } else {
          if (!module?.isPhaseIntro) {
            setMilestoneSnapshot(buildMilestoneSnapshot());
            setMilestone("module");
          }
        }
      } else {
        const completedCount = pages.filter((page) => {
          if (page.id === selectedPage.id) return true;
          const p = freshProgress.find((pr) => pr.pageId === page.id);
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

  const completedPageCount = pages.filter((page) => {
    const p = moduleProgress.find((pr) => pr.pageId === page.id);
    return p?.status === "completed";
  }).length;

  const overallProgress =
    pages.length > 0
      ? Math.round((completedPageCount / pages.length) * 100)
      : 0;

  const isCoreDataLoading = moduleLoading || pagesLoading || accessLoading;

  if (isCoreDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF5F3]">
        <div className="animate-spin w-8 h-8 border-4 border-[#4A0E2E] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!module || !selectedPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF5F3]">
        <div className="text-center">
          <h2 className="text-2xl font-serif text-[#4A0E2E] mb-4">Module not found</h2>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[#FAF5F3]">
        <div className="max-w-2xl mx-auto p-6 pt-20">
          <button onClick={() => navigate(-1)} className="mb-6">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </button>
          <CourseAccessGate course={course} />
        </div>
      </div>
    );
  }

  const isPageCompleted = (pageId) => {
    const p = moduleProgress.find((pr) => pr.pageId === pageId);
    return p?.status === "completed" || false;
  };

  const isCurrentPageComplete = isPageCompleted(selectedPage?.id);
  const currentPageIndex = pages.findIndex((p) => p.id === selectedPage.id);
  const nextPage = pages[currentPageIndex + 1] || null;
  const prevPage = currentPageIndex > 0 ? pages[currentPageIndex - 1] : null;

  const sortedSections = [...allCourseSections].sort((a, b) => {
    const aOrder = a.order ?? Infinity;
    const bOrder = b.order ?? Infinity;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return (a.created_date || "").localeCompare(b.created_date || "");
  });

  const sortedCourseModules = sortedSections.flatMap((section) =>
    [...allCourseModules]
      .filter((m) => m.sectionId === section.id)
      .sort((a, b) => {
        const aOrd = a.order ?? Infinity;
        const bOrd = b.order ?? Infinity;
        if (aOrd !== bOrd) return aOrd - bOrd;
        return (a.created_date || "").localeCompare(b.created_date || "");
      })
  );

  const currentModuleIndex = sortedCourseModules.findIndex((m) => m.id === moduleId);
  const moduleNumber = currentModuleIndex >= 0 ? currentModuleIndex + 1 : 1;
  const modulesWithPages = new Set(allCoursePages.map((p) => p.moduleId));
  const nextModule =
    sortedCourseModules
      .slice(currentModuleIndex + 1)
      .find((m) => modulesWithPages.has(m.id)) || null;

  const courseWorkbook =
    workbooks.find((w) => w.expert_id === module?.expertId) || null;

  const moduleSection = sortedSections.find((s) => s.id === module?.sectionId);
  const pillarLabel = moduleSection?.phase_name || moduleSection?.title?.split(" - ")[1] || "";

  const expertMap = {};
  allExperts.forEach((e) => { expertMap[e.id] = e; });

  const phaseNameOf = (section) =>
    (section?.title || "").split(" - ")[1]?.trim() || section?.title || "";
  const phaseLetterOf = (section) => (phaseNameOf(section)[0] || "").toUpperCase();

  const isModuleComplete = (mId) => {
    const mPages = allCoursePages.filter((pg) => pg.moduleId === mId);
    if (mPages.length === 0) return false;
    return mPages.every(
      (pg) => moduleProgress.find((pr) => pr.pageId === pg.id)?.status === "completed"
    );
  };

  const isWelcomeSection = (s) =>
    (s?.order === 0) || (s?.title || "").toLowerCase().includes("welcome");
  const contentSectionIds = new Set(
    sortedSections.filter((s) => !isWelcomeSection(s)).map((s) => s.id)
  );

  const isIntroModule = !!moduleSection && isWelcomeSection(moduleSection);

  const courseModulesWithPages = sortedCourseModules.filter(
    (m) => modulesWithPages.has(m.id) && contentSectionIds.has(m.sectionId)
  );
  const currentContentIdx = courseModulesWithPages.findIndex((m) => m.id === moduleId);
  const nextModuleInOrder =
    currentContentIdx >= 0
      ? courseModulesWithPages[currentContentIdx + 1] || null
      : null;

  const isCourseEnd = currentContentIdx >= 0 && !nextModuleInOrder;
  const isPhaseBoundary =
    contentSectionIds.has(module?.sectionId) &&
    !!nextModuleInOrder &&
    nextModuleInOrder.sectionId !== module?.sectionId;

  const nextSection = nextModuleInOrder
    ? sortedSections.find((s) => s.id === nextModuleInOrder.sectionId)
    : null;
  const nextExpertName = nextModuleInOrder
    ? expertMap[nextModuleInOrder.expertId]?.name || ""
    : "";

  const buildMilestoneSnapshot = () => ({
    moduleTitle: module?.title || "",
    hasWorkbook: !!courseWorkbook,
    workbookId: courseWorkbook?.id || null,
    nextModuleId: nextModuleInOrder?.id || null,
    nextModuleTitle: nextModuleInOrder?.title || "",
    nextExpertName,
    phaseLetter: phaseLetterOf(moduleSection),
    phaseName: phaseNameOf(moduleSection),
    phaseTagline: moduleSection?.tagline || "",
    nextPhaseName: phaseNameOf(nextSection),
    isCourseEnd,
    isPhaseBoundary,
  });

  const goToNextModule = () => {
    const nextId = milestoneSnapshot?.nextModuleId || nextModuleInOrder?.id || null;
    setMilestone(null);
    setMilestoneSnapshot(null);
    if (nextId) {
      navigate(
        createPageUrl("ModulePlayer") +
          `?moduleId=${nextId}&courseId=${courseId}`
      );
    } else {
      navigate("/Dashboard");
    }
  };

  const handleMilestoneContinue = () => {
    if (milestoneSnapshot?.isCourseEnd) {
      setMilestone("course");
    } else if (milestoneSnapshot?.isPhaseBoundary) {
      setMilestone("phase");
    } else {
      goToNextModule();
    }
  };

  const handleMilestoneStartWorkbook = () => {
    const wbId = milestoneSnapshot?.workbookId || courseWorkbook?.id || null;
    if (wbId) {
      window.location.href = `/Workbook?id=${wbId}`;
    }
  };

  const handleMilestoneDashboard = () => {
    setMilestone(null);
    setMilestoneSnapshot(null);
    navigate("/Dashboard");
  };

  const handleSelectPage = (page) => {
    setSelectedPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNextAction = () => {
    if (!isCurrentPageComplete) {
      toast({
        description: "You must mark this lesson complete to move to the next lesson",
        duration: 3000,
      });
      return;
    }
    if (nextPage) {
      handleSelectPage(nextPage);
      setMobileTab("about");
    } else if (nextModuleInOrder) {
      navigate(
        createPageUrl("ModulePlayer") +
          `?moduleId=${nextModuleInOrder.id}&courseId=${courseId}`
      );
    } else {
      setMilestoneSnapshot(buildMilestoneSnapshot());
      setMilestone("course");
    }
  };

  const handleStartCourse = async () => {
    if (!isCurrentPageComplete) {
      await togglePageCompleteMutation.mutateAsync({
        pageId: selectedPage.id,
        isComplete: true,
      });
      await completeModule();
    }
    const firstContent = courseModulesWithPages[0] || null;
    if (firstContent) {
      navigate(
        createPageUrl("ModulePlayer") +
          `?moduleId=${firstContent.id}&courseId=${courseId}`
      );
    } else {
      navigate("/Dashboard");
    }
  };

  const nextLabel = nextPage
    ? "NEXT LESSON"
    : nextModuleInOrder
    ? "NEXT MODULE"
    : "BACK TO CLASSROOM";

  const nextMobileTopLine = nextPage
    ? `UP NEXT · LESSON ${String(currentPageIndex + 2).padStart(2, "0")}`
    : nextModuleInOrder
    ? "NEXT MODULE"
    : "RETURN HOME";

  const nextMobileBottomLine = nextPage
    ? nextPage.title
    : nextModuleInOrder
    ? nextModuleInOrder.title
    : "Blueprint Home";

  const renderVideo = (roundCorners, cropTop = false) => {
    const radius = roundCorners ? "12px" : "0";
    const iframeStyle = cropTop
      ? { position: "absolute", top: "-10%", left: "0", width: "100%", height: "120%", border: 0 }
      : { border: 0 };
    return (
      <div
        style={{
          width: "100%",
          aspectRatio: "16 / 9",
          position: "relative",
          background: "linear-gradient(135deg, #3D0F1F 0%, #4A0E2E 50%, #3D0F1F 100%)",
          borderRadius: radius,
          overflow: "hidden",
        }}
      >
        {selectedPage.videoUrl ? (
          (() => {
            const url = selectedPage.videoUrl.trim();
            let embedUrl = url;

            if (url.includes("youtube.com") || url.includes("youtu.be")) {
              let videoId = null;
              try {
                if (url.includes("youtu.be"))
                  videoId = url.split("youtu.be/")[1]?.split(/[?&#]/)[0];
                else videoId = new URL(url).searchParams.get("v");
              } catch (e) {
                const match = url.match(/[?&]v=([^&#]+)/);
                videoId = match ? match[1] : null;
              }
              if (videoId)
                embedUrl = `https://www.youtube.com/embed/${videoId}`;
            }

            if (url.includes("vimeo.com")) {
              const vimeoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
              if (vimeoId)
                embedUrl = `https://player.vimeo.com/video/${vimeoId}`;
            }

            if (url.includes("drive.google.com")) {
              const fileId = url.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1];
              if (fileId)
                embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
            }

            if (url.includes("wistia.com") || url.includes("wistia.net")) {
              const videoId =
                url.match(/medias\/([a-zA-Z0-9]+)/)?.[1] ||
                url.split("/").pop();
              embedUrl = `https://fast.wistia.net/embed/iframe/${videoId}`;
            }

            const isDirectVideo =
              /\.(mp4|webm|mov|ogg|m4v|avi|mkv)(\?|$)/i.test(embedUrl) ||
              embedUrl.includes("supabase.co/storage") ||
              embedUrl.includes("base44.app/api/apps");

            if (isDirectVideo) {
              return (
                <video
                  src={embedUrl}
                  controls
                  className={cropTop ? "" : "absolute top-0 left-0 w-full h-full"}
                  style={cropTop ? { ...iframeStyle, backgroundColor: "#000" } : { backgroundColor: "#000" }}
                />
              );
            }

            return (
              <iframe
                src={embedUrl}
                className={cropTop ? "" : "absolute top-0 left-0 w-full h-full"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                style={iframeStyle}
              />
            );
          })()
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <div
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                marginBottom: "16px",
                opacity: 0.8,
              }}
            >
              PRESENTED BY
            </div>
            <div
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "12px",
                fontWeight: 500,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                opacity: 0.9,
              }}
            >
              THE ALIGNED WOMAN CO.
            </div>
            <div
              style={{
                position: "absolute",
                bottom: "16px",
                left: "16px",
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "11px",
                fontWeight: 500,
                opacity: 0.7,
              }}
            >
              00:00 · {selectedPage.estimatedMinutes || "22"} MIN
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderExpertAvatar = (size) => {
    if (!expert) return null;
    const initials = expert.name
      ?.split(" ")
      .map((n) => n[0])
      .join("");
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          background: "#4A0E2E",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {expert.profile_picture ? (
          <img
            src={expert.profile_picture}
            alt={expert.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span
            style={{
              color: "white",
              fontFamily: "'Montserrat', sans-serif",
              fontSize: `${Math.round(size * 0.35)}px`,
              fontWeight: 700,
            }}
          >
            {initials}
          </span>
        )}
      </div>
    );
  };

  const renderLessonList = (onSelect) => (
    <div>
      {pages.map((page, idx) => {
        const isActive = selectedPage?.id === page.id;
        const isComplete = isPageCompleted(page.id);
        return (
          <button
            key={page.id}
            onClick={() => onSelect(page)}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "14px 12px",
              borderLeft: isActive ? "3px solid #C4847A" : "3px solid transparent",
              background: isActive ? "#FDF5F3" : "transparent",
              borderTop: "none",
              borderRight: "none",
              borderBottom: "1px solid rgba(74,14,46,0.06)",
              cursor: "pointer",
              transition: "background 0.2s",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <span
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "18px",
                fontStyle: "italic",
                color: isComplete || isActive ? "#C4847A" : "#C8B8B4",
                flexShrink: 0,
              }}
            >
              {String(idx + 1).padStart(2, "0")}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "13px",
                  fontWeight: isActive ? 600 : 500,
                  color: isComplete ? "#8A7A76" : "#3A2A28",
                  marginBottom: "4px",
                  lineHeight: 1.4,
                }}
              >
                {page.title}
              </div>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "10px",
                  fontWeight: 500,
                  letterSpacing: "0.15em",
                  color: "#8A7A76",
                  textTransform: "uppercase",
                }}
              >
                {page.estimatedMinutes || "22"} MIN
                {isComplete ? " · COMPLETED" : ""}
                {!isComplete && idx === currentPageIndex + 1 ? " · UP NEXT" : ""}
              </div>
            </div>
            <div style={{ flexShrink: 0, marginTop: "2px" }}>
              {isComplete ? (
                <CheckCircle className="w-4 h-4" style={{ color: "#C4847A" }} />
              ) : (
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    border: "1.5px solid #C8B8B4",
                  }}
                />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );

  const renderModuleOverview = () => (
    <div style={{ background: "white", borderRadius: "12px", padding: "20px" }}>
      <div
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.22em",
          color: "#4A0E2E",
          textTransform: "uppercase",
          paddingBottom: "12px",
          borderBottom: "2px solid #4A0E2E",
          marginBottom: "16px",
        }}
      >
        MODULE OVERVIEW
      </div>
      {[
        { label: "Lessons", value: String(pages.length) },
        pillarLabel ? { label: "Pillar", value: pillarLabel } : null,
        expert ? { label: "Expert", value: expert.name } : null,
      ]
        .filter(Boolean)
        .map((row, i, arr) => (
          <div
            key={row.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: i < arr.length - 1 ? "1px solid rgba(74,14,46,0.06)" : "none",
            }}
          >
            <span
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "13px",
                fontWeight: 400,
                color: "#8A7A76",
              }}
            >
              {row.label}
            </span>
            <span
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                color: "#3A2A28",
              }}
            >
              {row.value}
            </span>
          </div>
        ))}
    </div>
  );

  const renderContinueBlueprint = () => {
    if (pages.length === 0 || overallProgress !== 100) return null;
    const label = nextModuleInOrder ? "CONTINUE THE BLUEPRINT" : "BACK TO DASHBOARD";
    return (
      <button
        onClick={goToNextModule}
        style={{
          width: "100%",
          background: "#4A0E2E",
          color: "white",
          border: "none",
          borderRadius: "100px",
          padding: "16px 24px",
          cursor: "pointer",
          fontFamily: "'Montserrat', sans-serif",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#3D0F1F")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#4A0E2E")}
      >
        {label}
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    );
  };

  const renderModuleTitle = (fontSize) => {
    const parts = (module?.title || "").split(" & ");
    if (parts.length < 2) {
      return (
        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize, color: "#4A0E2E" }}>
          {module?.title}
        </span>
      );
    }
    return (
      <>
        {parts[0]}
        <br />
        &amp;{" "}
        <span style={{ fontStyle: "italic" }}>{parts[1]}</span>
      </>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: "#FAF5F3" }}>
      <style>{`
        @keyframes mp-pulse-ring {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0; transform: scale(1.08); }
        }
      `}</style>

      <div className="fixed top-0 left-0 right-0 z-50 md:hidden" style={{ background: "#FAF5F3" }}>
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex-shrink-0 p-1">
            <ChevronLeft className="w-5 h-5" style={{ color: "#4A0E2E" }} />
          </button>
          <div className="flex-1 text-center mx-3 min-w-0">
            <div
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.22em",
                color: "#C4847A",
                textTransform: "uppercase",
                marginBottom: "2px",
              }}
            >
              MODULE {String(moduleNumber).padStart(2, "0")} · {pillarLabel.toUpperCase() || "LESSON"}
            </div>
            <div
              className="truncate"
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "15px",
                fontStyle: "italic",
                color: "#4A0E2E",
                lineHeight: 1.2,
              }}
            >
              {module?.title}
            </div>
          </div>
          <button
            onClick={() => setMobileTab("course")}
            className="flex-shrink-0 p-1"
          >
            <Menu className="w-5 h-5" style={{ color: "#4A0E2E" }} />
          </button>
        </div>
        <div style={{ height: "2px", background: "#F5DDD9", width: "100%" }}>
          <div
            style={{
              height: "100%",
              background: "#C4847A",
              width: `${overallProgress}%`,
              transition: "width 0.7s ease-out",
            }}
          />
        </div>
      </div>

      <div className="hidden md:block sticky top-0 z-40" style={{ background: "#FAF5F3", borderBottom: "1px solid rgba(74,14,46,0.06)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-3"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <ChevronLeft className="w-5 h-5" style={{ color: "#4A0E2E" }} />
            <span
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.22em",
                color: "#4A0E2E",
                textTransform: "uppercase",
              }}
            >
              ALIGNED WOMAN BLUEPRINT
            </span>
          </button>
          <span
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.22em",
              color: "#8A7A76",
              textTransform: "uppercase",
            }}
          >
            MODULE {String(moduleNumber).padStart(2, "0")} · {module?.title}
          </span>
        </div>
      </div>

      <div className="pt-0 md:pt-0 pb-24 md:pb-0">

        <div className="hidden md:block max-w-7xl mx-auto px-6 py-8">

          <div className="flex justify-between items-start gap-12 mb-12">
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  color: "#C4847A",
                  textTransform: "uppercase",
                  marginBottom: "16px",
                }}
              >
                MODULE {String(moduleNumber).padStart(2, "0")} · {pillarLabel.toUpperCase() || module?.title?.split(" ")[0]?.toUpperCase()}
              </div>
              <h1
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "clamp(36px, 4vw, 56px)",
                  color: "#4A0E2E",
                  fontWeight: 400,
                  lineHeight: 1.1,
                }}
              >
                {renderModuleTitle("inherit")}
              </h1>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0, minWidth: "200px" }}>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  color: "#8A7A76",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                }}
              >
                MODULE PROGRESS
              </div>
              <div
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "48px",
                  color: "#4A0E2E",
                  fontWeight: 400,
                  lineHeight: 1,
                  marginBottom: "16px",
                }}
              >
                {overallProgress}%
              </div>
              <div
                style={{
                  height: "4px",
                  background: "#F5DDD9",
                  borderRadius: "2px",
                  overflow: "hidden",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background: "#C4847A",
                    borderRadius: "2px",
                    width: `${overallProgress}%`,
                    transition: "width 0.7s ease-out",
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#8A7A76",
                  letterSpacing: "0.1em",
                }}
              >
                {completedPageCount} OF {pages.length} LESSONS
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">

            <div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedPage.id + "-video"}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ marginBottom: "36px" }}
                >
                  {renderVideo(true)}
                </motion.div>
              </AnimatePresence>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "24px",
                  paddingBottom: "24px",
                  borderBottom: "1px solid rgba(74,14,46,0.06)",
                }}
              >
                <span
                  style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: "22px",
                    fontStyle: "italic",
                    color: "#C4847A",
                  }}
                >
                  {String(currentPageIndex + 1).padStart(2, "0")}
                </span>
                <span
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.2em",
                    color: "#8A7A76",
                    textTransform: "uppercase",
                  }}
                >
                  LESSON {String(currentPageIndex + 1).padStart(2, "0")} OF{" "}
                  {String(pages.length).padStart(2, "0")} ·{" "}
                  {selectedPage.estimatedMinutes || "22"} MIN
                  {pillarLabel ? ` · ${pillarLabel.toUpperCase()}` : ""}
                </span>
                {isCurrentPageComplete && (
                  <div
                    style={{
                      marginLeft: "auto",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "#FDF5F3",
                      border: "1px solid rgba(196,132,122,0.18)",
                      borderRadius: "100px",
                      padding: "6px 14px",
                    }}
                  >
                    <Check className="w-3.5 h-3.5" style={{ color: "#A86460" }} />
                    <span
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.15em",
                        color: "#A86460",
                        textTransform: "uppercase",
                      }}
                    >
                      COMPLETED
                    </span>
                  </div>
                )}
              </div>

              <h2
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "32px",
                  color: "#4A0E2E",
                  fontWeight: 400,
                  lineHeight: 1.3,
                  marginBottom: "16px",
                }}
              >
                {selectedPage.title}
              </h2>

              {expert && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
                  {renderExpertAvatar(40)}
                  <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "14px", color: "#8A7A76" }}>
                    Presented by{" "}
                    <span style={{ fontWeight: 600, color: "#3A2A28" }}>{expert.name}</span>
                    {" · "}
                    {expert.title || "Expert"}
                  </div>
                </div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedPage.id + "-body"}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                >
                  <div
                    className="prose max-w-none"
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "15px",
                      fontWeight: 300,
                      color: "#3A2A28",
                      lineHeight: 1.85,
                      marginBottom: "48px",
                    }}
                    dangerouslySetInnerHTML={{ __html: selectedPage.content || "" }}
                  />
                </motion.div>
              </AnimatePresence>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "32px",
                  borderTop: "1px solid rgba(74,14,46,0.06)",
                }}
              >
                {isIntroModule ? (
                  <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                    <button
                      onClick={handleStartCourse}
                      style={{
                        background: "#4A0E2E",
                        color: "white",
                        border: "none",
                        borderRadius: "100px",
                        padding: "16px 40px",
                        cursor: "pointer",
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#3D0F1F")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#4A0E2E")}
                    >
                      START THE COURSE
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ minWidth: "100px" }}>
                      {prevPage && (
                        <button
                          onClick={() => handleSelectPage(prevPage)}
                          style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontSize: "10px",
                            fontWeight: 700,
                            letterSpacing: "0.2em",
                            color: "#8A7A76",
                            textTransform: "uppercase",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "12px 0",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#4A0E2E")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#8A7A76")}
                        >
                          ← PREVIOUS LESSON
                        </button>
                      )}
                    </div>

                    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                      {!isCurrentPageComplete && (
                        <span
                          style={{
                            position: "absolute",
                            inset: "-4px",
                            borderRadius: "100px",
                            border: "2px solid #C4847A",
                            animation: "mp-pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                            pointerEvents: "none",
                          }}
                        />
                      )}
                      <button
                        onClick={handleTogglePageComplete}
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: "10px",
                          fontWeight: 700,
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          borderRadius: "100px",
                          padding: "14px 24px",
                          cursor: "pointer",
                          transition: "all 0.3s cubic-bezier(0.2, 0.7, 0.2, 1)",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          ...(isCurrentPageComplete
                            ? {
                                color: "#fff",
                                background: "#22c55e",
                                border: "1.5px solid #22c55e",
                              }
                            : {
                                color: "white",
                                background: "#4A0E2E",
                                border: "1.5px solid #4A0E2E",
                              }),
                        }}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {isCurrentPageComplete ? "COMPLETED" : "MARK COMPLETE"}
                      </button>
                    </div>

                    <button
                      onClick={handleNextAction}
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.2em",
                        color: isCurrentPageComplete ? "#4A0E2E" : "#8A7A76",
                        textTransform: "uppercase",
                        background: isCurrentPageComplete ? "#C4847A" : "rgba(196,132,122,0.2)",
                        border: "none",
                        borderRadius: "100px",
                        padding: "14px 28px",
                        cursor: isCurrentPageComplete ? "pointer" : "not-allowed",
                        opacity: isCurrentPageComplete ? 1 : 0.6,
                        transition: "all 0.3s cubic-bezier(0.2, 0.7, 0.2, 1)",
                      }}
                      onMouseEnter={(e) => {
                        if (isCurrentPageComplete) {
                          e.currentTarget.style.background = "#A86460";
                          e.currentTarget.style.color = "white";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isCurrentPageComplete) {
                          e.currentTarget.style.background = "#C4847A";
                          e.currentTarget.style.color = "#4A0E2E";
                        }
                      }}
                    >
                      {nextLabel} →
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="hidden lg:block" style={{ position: "sticky", top: "80px", alignSelf: "start" }}>
              <div style={{ marginBottom: "24px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    paddingBottom: "12px",
                    borderBottom: "2px solid #4A0E2E",
                    marginBottom: "4px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.22em",
                      color: "#4A0E2E",
                      textTransform: "uppercase",
                    }}
                  >
                    COURSE CONTENT
                  </span>
                  <span
                    style={{
                      fontFamily: "'DM Serif Display', serif",
                      fontSize: "18px",
                      fontStyle: "italic",
                      color: "#C4847A",
                    }}
                  >
                    {String(pages.length).padStart(2, "0")}
                  </span>
                </div>
                {renderLessonList(handleSelectPage)}
              </div>

              {!isIntroModule && (
                <div style={{ marginBottom: "24px" }}>
                  {renderModuleOverview()}
                </div>
              )}

              {renderContinueBlueprint()}
            </div>
          </div>
        </div>

        <div className="md:hidden pt-[60px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedPage.id + "-mob-video"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {renderVideo(false, true)}
            </motion.div>
          </AnimatePresence>

          <div className="px-4 pt-5">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <span
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "20px",
                  fontStyle: "italic",
                  color: "#C4847A",
                }}
              >
                {String(currentPageIndex + 1).padStart(2, "0")}
              </span>
              <span
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  color: "#8A7A76",
                  textTransform: "uppercase",
                }}
              >
                LESSON {String(currentPageIndex + 1).padStart(2, "0")} OF{" "}
                {String(pages.length).padStart(2, "0")} ·{" "}
                {selectedPage.estimatedMinutes || "22"} MIN
              </span>
              {isCurrentPageComplete && (
                <Check className="w-4 h-4 ml-auto" style={{ color: "#C4847A" }} />
              )}
            </div>

            <h2
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "26px",
                color: "#4A0E2E",
                fontWeight: 400,
                lineHeight: 1.3,
                marginBottom: "16px",
              }}
            >
              {selectedPage.title}
            </h2>

            {expert && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                {renderExpertAvatar(32)}
                <div>
                  <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "14px", fontWeight: 600, color: "#3A2A28" }}>
                    {expert.name}
                  </div>
                  <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "12px", fontWeight: 400, color: "#8A7A76" }}>
                    {expert.title || "Expert"}
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "24px", borderBottom: "1px solid rgba(74,14,46,0.06)", marginBottom: "20px" }}>
              {["about", "course"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setMobileTab(tab)}
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.2em",
                    color: mobileTab === tab ? "#4A0E2E" : "#8A7A76",
                    textTransform: "uppercase",
                    background: "none",
                    border: "none",
                    borderBottom: mobileTab === tab ? "2px solid #4A0E2E" : "2px solid transparent",
                    padding: "12px 0",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {tab === "about" ? "ABOUT" : `COURSE ${String(pages.length).padStart(2, "0")}`}
                </button>
              ))}
            </div>

            {mobileTab === "about" ? (
              <motion.div
                key="about-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="prose max-w-none"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "14px",
                  fontWeight: 300,
                  color: "#3A2A28",
                  lineHeight: 1.75,
                  paddingBottom: "100px",
                }}
                dangerouslySetInnerHTML={{ __html: selectedPage.content || "" }}
              />
            ) : (
              <motion.div
                key="course-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ paddingBottom: "100px" }}
              >
                <div style={{ marginBottom: "24px" }}>
                  {renderLessonList((page) => {
                    handleSelectPage(page);
                    setMobileTab("about");
                  })}
                </div>
                {!isIntroModule && (
                  <div style={{ marginBottom: "16px" }}>
                    {renderModuleOverview()}
                  </div>
                )}
                {renderContinueBlueprint()}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center gap-3"
        style={{
          background: "white",
          borderTop: "1px solid rgba(74,14,46,0.06)",
          padding: "12px 16px",
          paddingBottom: "max(12px, env(safe-area-inset-bottom))",
        }}
      >
        {isIntroModule ? (
          <button
            onClick={handleStartCourse}
            style={{
              flex: 1,
              background: "#4A0E2E",
              color: "white",
              border: "none",
              borderRadius: "100px",
              padding: "14px 16px",
              cursor: "pointer",
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              minHeight: "48px",
            }}
          >
            START THE COURSE
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <>
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {!isCurrentPageComplete && (
                <span
                  style={{
                    position: "absolute",
                    inset: "-4px",
                    borderRadius: "50%",
                    border: "2px solid #C4847A",
                    animation: "mp-pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                    pointerEvents: "none",
                  }}
                />
              )}
              <button
                onClick={handleTogglePageComplete}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  border: isCurrentPageComplete ? "none" : "2px solid #4A0E2E",
                  background: isCurrentPageComplete ? "#22c55e" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.2, 0.7, 0.2, 1)",
                  flexShrink: 0,
                }}
              >
                {isCurrentPageComplete
                  ? <CheckCircle className="w-5 h-5" style={{ color: "white" }} />
                  : <Check className="w-5 h-5" style={{ color: "#4A0E2E" }} />
                }
              </button>
            </div>
            <button
              onClick={handleNextAction}
              style={{
                flex: 1,
                background: isCurrentPageComplete ? "#C4847A" : "rgba(196,132,122,0.2)",
                border: "none",
                borderRadius: "100px",
                padding: "10px 16px",
                cursor: isCurrentPageComplete ? "pointer" : "not-allowed",
                opacity: isCurrentPageComplete ? 1 : 0.6,
                transition: "all 0.3s cubic-bezier(0.2, 0.7, 0.2, 1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                minHeight: "48px",
              }}
            >
              <div style={{ textAlign: "left" }}>
                <div
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "9px",
                    fontWeight: 700,
                    letterSpacing: "0.2em",
                    color: isCurrentPageComplete ? "#4A0E2E" : "#8A7A76",
                    textTransform: "uppercase",
                    marginBottom: "2px",
                  }}
                >
                  {nextMobileTopLine}
                </div>
                <div
                  className="truncate"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: isCurrentPageComplete ? "#4A0E2E" : "#8A7A76",
                    maxWidth: "200px",
                  }}
                >
                  {nextMobileBottomLine}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: isCurrentPageComplete ? "#4A0E2E" : "#8A7A76" }} />
            </button>
          </>
        )}
      </div>

      <AnimatePresence>
        {milestone && milestoneSnapshot && (
          <JourneyMilestone
            stage={milestone}
            moduleTitle={milestoneSnapshot.moduleTitle}
            hasWorkbook={milestoneSnapshot.hasWorkbook}
            nextModuleTitle={milestoneSnapshot.nextModuleTitle}
            nextExpertName={milestoneSnapshot.nextExpertName}
            phaseLetter={milestoneSnapshot.phaseLetter}
            phaseName={milestoneSnapshot.phaseName}
            phaseTagline={milestoneSnapshot.phaseTagline}
            nextPhaseName={milestoneSnapshot.nextPhaseName}
            onStartWorkbook={handleMilestoneStartWorkbook}
            onContinue={handleMilestoneContinue}
            onNextPhase={goToNextModule}
            onDashboard={handleMilestoneDashboard}
          />
        )}
      </AnimatePresence>
    </div>
  );
}