import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Eye,
  Download,
  MessageCircle,
  Send,
  Check,
  Lock,
  ExternalLink,
  FileText,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import CourseAccessGate from "@/components/classroom/CourseAccessGate";
import { useCourseAccess } from "@/hooks/useCourseAccess";

export default function ModulePlayer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get("moduleId");
  const courseId = searchParams.get("courseId");
  const [selectedPage, setSelectedPage] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [mobileTab, setMobileTab] = useState("about");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const queryClient = useQueryClient();

  // Fetch course for access check
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
      const modules = await base44.entities.CourseModule.filter({
        id: moduleId,
      });
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

  const { data: moduleProgress = [] } = useQuery({
    queryKey: ["courseProgress", moduleId],
    queryFn: () => base44.entities.CourseProgress.filter({ moduleId }),
    enabled: !!moduleId,
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", moduleId],
    queryFn: () =>
      base44.entities.ModuleComment.filter({ moduleId }, "-created_date"),
    enabled: !!moduleId,
  });

  const { data: allCourseModules = [] } = useQuery({
    queryKey: ["allCourseModules", courseId],
    queryFn: () => base44.entities.CourseModule.filter({ courseId }),
    enabled: !!courseId,
  });

  const { data: allCourseSections = [] } = useQuery({
    queryKey: ["allCourseSections", courseId],
    queryFn: () => base44.entities.CourseSection.filter({ courseId }),
    enabled: !!courseId,
  });

  const { data: workbooks = [] } = useQuery({
    queryKey: ["courseWorkbooks", courseId],
    queryFn: () => base44.entities.Workbook.filter({ course_id: courseId }),
    enabled: !!courseId,
  });

  const { data: allCoursePages = [] } = useQuery({
    queryKey: ["allCoursePages", courseId],
    queryFn: async () => {
      const results = await Promise.all(
        allCourseModules.map((m) =>
          base44.entities.CoursePage.filter({ moduleId: m.id })
        )
      );
      return results.flat();
    },
    enabled: allCourseModules.length > 0,
  });

  const { data: expert } = useQuery({
    queryKey: ["expert", module?.expertId],
    queryFn: async () => {
      if (!module?.expertId) return null;
      const experts = await base44.entities.Expert.filter({
        id: module.expertId,
      });
      return experts[0] || null;
    },
    enabled: !!module?.expertId,
  });

  useEffect(() => {
    setSelectedPage(null);
  }, [moduleId]);

  const updateProgressMutation = useMutation({
    mutationFn: async ({ status, progressPercentage }) => {
      const existing = moduleProgress.find((p) => !p.pageId);
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

  useEffect(() => {
    if (pages.length > 0 && !selectedPage) {
      setSelectedPage(pages[0]);
    }
  }, [pages]);

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

  const overallProgress =
    pages.length > 0
      ? Math.round(
          (pages.filter((page) => {
            const p = moduleProgress.find((pr) => pr.pageId === page.id);
            return p?.status === "completed";
          }).length /
            pages.length) *
            100
        )
      : 0;

  if (!module || !selectedPage || accessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#4A0E2E] border-t-transparent rounded-full" />
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

  const allPagesCompleted =
    pages.length > 0 && pages.every((page) => isPageCompleted(page.id));
  const isCurrentPageComplete = isPageCompleted(selectedPage?.id);

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

  const currentModuleIndex = sortedCourseModules.findIndex(
    (m) => m.id === moduleId
  );
  const modulesWithPages = new Set(allCoursePages.map((p) => p.moduleId));
  const nextModule =
    sortedCourseModules
      .slice(currentModuleIndex + 1)
      .find((m) => modulesWithPages.has(m.id)) || null;

  const courseWorkbook =
    workbooks.find((w) => w.expert_id === module?.expertId) ||
    (workbooks.length > 0 ? workbooks[0] : null);

  const currentPageIndex = pages.findIndex((p) => p.id === selectedPage.id);
  const nextPage = pages[currentPageIndex + 1] || null;
  const prevPage = currentPageIndex > 0 ? pages[currentPageIndex - 1] : null;

  // Mobile sticky header
  const MobileHeader = () => (
    <div className="fixed top-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-[#FAF5F3] px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex-shrink-0">
          <ChevronLeft className="w-5 h-5" style={{ color: "#4A0E2E" }} />
        </button>
        <div className="flex-1 text-center mx-4">
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
            MODULE {String(currentPageIndex + 1).padStart(2, "0")} . {module?.title?.split(" ")[0]?.toUpperCase()}
          </div>
          <div
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "16px",
              fontStyle: "italic",
              color: "#4A0E2E",
              lineHeight: 1,
            }}
          >
            {module?.title}
          </div>
        </div>
        <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="flex-shrink-0">
          <Menu className="w-5 h-5" style={{ color: "#4A0E2E" }} />
        </button>
      </div>
      <div
        style={{
          height: "2px",
          background: "#F5DDD9",
          width: "100%",
        }}
      >
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
  );

  return (
    <div style={{ background: "#FAF5F3" }} className="min-h-screen">
        <MobileHeader />

        {/* Desktop Top Bar */}
        <div className="hidden md:block sticky top-0 z-40 bg-[#FAF5F3] border-b border-[rgba(74,14,46,0.06)]">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)}>
                <ChevronLeft className="w-5 h-5" style={{ color: "#4A0E2E" }} />
              </button>
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
            </div>
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
              MODULE {String(currentPageIndex + 1).padStart(2, "0")} . {module?.title}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:pt-0 pt-20 pb-safe">
          {/* Desktop Layout */}
          <div className="hidden md:block">
            <div className="max-w-7xl mx-auto px-6 py-8">
              {/* Module Header */}
              <div className="grid grid-cols-2 gap-12 mb-12">
                <div>
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
                    MODULE {String(currentPageIndex + 1).padStart(2, "0")} . {module?.title?.split(" ")[0]?.toUpperCase()}
                  </div>
                  <h1
                    style={{
                      fontFamily: "'DM Serif Display', serif",
                      fontSize: "52px",
                      color: "#4A0E2E",
                      fontWeight: 400,
                      lineHeight: 1.2,
                      marginBottom: "8px",
                    }}
                  >
                    {module?.title?.split(" & ")[0]}
                    <br />
                    &{" "}
                    <span style={{ fontStyle: "italic" }}>
                      {module?.title?.split(" & ")[1] || ""}
                    </span>
                  </h1>
                </div>
                <div style={{ textAlign: "right" }}>
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
                      marginBottom: "12px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        background: "#C4847A",
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
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                    }}
                  >
                    {currentPageIndex + 1} OF {pages.length} LESSONS ·{" "}
                    {module?.durationMinutes || "0"} OF {module?.durationMinutes || "0"} MIN
                  </div>
                </div>
              </div>

              {/* Two-Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">
                {/* Left Column */}
                <div>
                  {/* Video Player */}
                  <motion.div
                    key={selectedPage.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ marginBottom: "36px" }}
                  >
                    <div
                      style={{
                        paddingTop: "56.25%",
                        position: "relative",
                        background: "linear-gradient(135deg, #3D0F1F 0%, #4A0E2E 50%, #3D0F1F 100%)",
                        borderRadius: "12px",
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
                                className="absolute top-0 left-0 w-full h-full"
                                style={{ backgroundColor: "#000" }}
                              />
                            );
                          }

                          return (
                            <iframe
                              src={embedUrl}
                              className="absolute top-0 left-0 w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                              allowFullScreen
                              style={{ border: 0 }}
                            />
                          );
                        })()
                      ) : (
                        <div
                          className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white"
                          style={{
                            fontFamily: "'Montserrat', sans-serif",
                          }}
                        >
                          <div className="text-center">
                            <div
                              style={{
                                fontSize: "12px",
                                fontWeight: 500,
                                letterSpacing: "0.2em",
                                textTransform: "uppercase",
                                marginBottom: "12px",
                              }}
                            >
                              PRESENTED BY
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                fontWeight: 500,
                                letterSpacing: "0.3em",
                                textTransform: "uppercase",
                              }}
                            >
                              THE ALIGNED WOMAN CO.
                            </div>
                          </div>
                        </div>
                      )}
                      {/* Timestamp overlay */}
                      {!selectedPage.videoUrl && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: "16px",
                            left: "16px",
                            fontFamily: "'Montserrat', sans-serif",
                            fontSize: "11px",
                            fontWeight: 500,
                            color: "white",
                          }}
                        >
                          00:00 · {selectedPage.estimatedMinutes || module?.durationMinutes || "22"} MIN
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Lesson Meta Line */}
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
                      LESSON {String(currentPageIndex + 1).padStart(2, "0")} OF {pages.length} · {selectedPage.estimatedMinutes || module?.durationMinutes || "22"} MIN
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
                          padding: "6px 12px",
                        }}
                      >
                        <Check
                          className="w-4 h-4"
                          style={{ color: "#A86460" }}
                        />
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

                  {/* Lesson Title */}
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

                  {/* Expert Byline */}
                  {expert && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "24px",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: expert.profile_picture
                            ? `url(${expert.profile_picture}) center/cover`
                            : "#4A0E2E",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: "14px",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {!expert.profile_picture &&
                          expert.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                      </div>
                      <div>
                        <div
                          style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontSize: "14px",
                            fontWeight: 400,
                            color: "#8A7A76",
                          }}
                        >
                          Presented by{" "}
                          <span style={{ fontWeight: 600, color: "#3A2A28" }}>
                            {expert.name}
                          </span>{" "}
                          ·{" "}
                          <span style={{ color: "#8A7A76" }}>
                            {expert.title || "Expert"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lesson Body Copy */}
                  <motion.div
                    key={selectedPage.id + "-content"}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    style={{
                      marginBottom: "32px",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: "15px",
                        fontWeight: 300,
                        color: "#3A2A28",
                        lineHeight: 1.85,
                      }}
                      dangerouslySetInnerHTML={{
                        __html: selectedPage.content || "",
                      }}
                    />
                  </motion.div>

                  {/* Bottom Navigation */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      paddingTop: "24px",
                      borderTop: "1px solid rgba(74,14,46,0.06)",
                    }}
                  >
                    {prevPage && (
                      <button
                        onClick={() => {
                          setSelectedPage(prevPage);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
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
                          padding: "8px 0",
                          transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.color = "#4A0E2E")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.color = "#8A7A76")
                        }
                      >
                        ← PREVIOUS
                      </button>
                    )}

                    <button
                      onClick={handleTogglePageComplete}
                      style={{
                        marginLeft: "auto",
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.2em",
                        color: isCurrentPageComplete ? "#A86460" : "#4A0E2E",
                        textTransform: "uppercase",
                        background: isCurrentPageComplete ? "transparent" : "#4A0E2E",
                        border:
                          isCurrentPageComplete
                            ? "1px solid rgba(196,132,122,0.18)"
                            : "none",
                        borderRadius: "100px",
                        padding: "8px 16px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (!isCurrentPageComplete) {
                          e.target.style.background = "#3A1F20";
                          e.target.style.color = "white";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isCurrentPageComplete) {
                          e.target.style.background = "#4A0E2E";
                          e.target.style.color = "#4A0E2E";
                        }
                      }}
                    >
                      ✓ {isCurrentPageComplete ? "MARKED COMPLETE" : "MARK COMPLETE"}
                    </button>

                    <button
                      onClick={() => {
                        if (nextPage) {
                          setSelectedPage(nextPage);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        } else if (nextModule) {
                          navigate(
                            createPageUrl("ModulePlayer") +
                              `?moduleId=${nextModule.id}&courseId=${courseId}`
                          );
                        } else {
                          navigate(createPageUrl("Classroom"));
                        }
                      }}
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.2em",
                        color: "#4A0E2E",
                        textTransform: "uppercase",
                        background: "#C4847A",
                        border: "none",
                        borderRadius: "100px",
                        padding: "8px 16px",
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.background = "#A86460")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.background = "#C4847A")
                      }
                    >
                      NEXT LESSON →
                    </button>
                  </div>
                </div>

                {/* Right Column - Sticky Sidebar */}
                <div
                  style={{
                    position: "sticky",
                    top: "32px",
                    height: "fit-content",
                  }}
                >
                  {/* Course Content Panel */}
                  <div style={{ marginBottom: "24px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: "8px",
                        marginBottom: "8px",
                        paddingBottom: "12px",
                        borderBottom: "2px solid #4A0E2E",
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

                    <div style={{ space: "1px" }}>
                      {pages.map((page, idx) => {
                        const isActive = selectedPage?.id === page.id;
                        const isComplete = isPageCompleted(page.id);
                        return (
                          <button
                            key={page.id}
                            onClick={() => {
                              setSelectedPage(page);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "12px",
                              borderLeft: isActive
                                ? "3px solid #C4847A"
                                : "3px solid transparent",
                              background: isActive ? "#FDF5F3" : "transparent",
                              borderBottom: "1px solid rgba(74,14,46,0.06)",
                              cursor: "pointer",
                              transition: "all 0.2s",
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "12px",
                              border: "none",
                            }}
                            onMouseEnter={(e) => {
                              if (!isActive) {
                                e.currentTarget.style.background = "#FDF5F3";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isActive) {
                                e.currentTarget.style.background = "transparent";
                              }
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "'DM Serif Display', serif",
                                fontSize: "18px",
                                fontStyle: "italic",
                                color: isComplete ? "#C4847A" : "#C8B8B4",
                                flexShrink: 0,
                                fontWeight: 400,
                              }}
                            >
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontFamily: "'Montserrat', sans-serif",
                                  fontSize: "13px",
                                  fontWeight: 500,
                                  color: "#3A2A28",
                                  marginBottom: "4px",
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
                                {page.estimatedMinutes || module?.durationMinutes || "22"} MIN{" "}
                                · {isComplete ? "COMPLETED" : ""}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Module Overview Card */}
                  <div style={{ marginBottom: "24px", background: "white", borderRadius: "12px", padding: "20px" }}>
                    <div
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.22em",
                        color: "#4A0E2E",
                        textTransform: "uppercase",
                        marginBottom: "12px",
                        paddingBottom: "12px",
                        borderBottom: "2px solid #4A0E2E",
                      }}
                    >
                      MODULE OVERVIEW
                    </div>

                    <div style={{ space: "16px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          paddingBottom: "12px",
                          borderBottom: "1px solid rgba(74,14,46,0.06)",
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
                          Lessons
                        </span>
                        <span
                          style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#3A2A28",
                          }}
                        >
                          {pages.length}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          paddingBottom: "12px",
                          borderBottom: "1px solid rgba(74,14,46,0.06)",
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
                          Total duration
                        </span>
                        <span
                          style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#3A2A28",
                          }}
                        >
                          {module?.durationMinutes
                            ? `${Math.floor(module.durationMinutes / 60)} hr ${
                                module.durationMinutes % 60
                              } min`
                            : "N/A"}
                        </span>
                      </div>

                      {expert && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            paddingBottom: "12px",
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
                            Expert
                          </span>
                          <span
                            style={{
                              fontFamily: "'Montserrat', sans-serif",
                              fontSize: "13px",
                              fontWeight: 600,
                              color: "#3A2A28",
                            }}
                          >
                            {expert.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Workbook Card */}
                  {courseWorkbook && (
                    <button
                      onClick={() => {
                        window.location.href = `/Workbook?id=${courseWorkbook.id}`;
                      }}
                      style={{
                        width: "100%",
                        background: "#FDF5F3",
                        border: "1px solid rgba(196,132,122,0.18)",
                        borderRadius: "12px",
                        padding: "16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#F5DDD9";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#FDF5F3";
                      }}
                    >
                      <FileText className="w-5 h-5" style={{ color: "#4A0E2E", flexShrink: 0 }} />
                      <div style={{ textAlign: "left", flex: 1 }}>
                        <div
                          style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "#4A0E2E",
                            marginBottom: "2px",
                          }}
                        >
                          Module workbook
                        </div>
                        <div
                          style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontSize: "12px",
                            fontWeight: 400,
                            color: "#8A7A76",
                          }}
                        >
                          PDF · 24 PAGES
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4" style={{ color: "#4A0E2E", flexShrink: 0 }} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden px-4 space-y-4">
            {/* Video Player */}
            <motion.div
              key={selectedPage.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                style={{
                  paddingTop: "56.25%",
                  position: "relative",
                  background:
                    "linear-gradient(135deg, #3D0F1F 0%, #4A0E2E 50%, #3D0F1F 100%)",
                  borderRadius: "0px",
                  overflow: "hidden",
                  marginLeft: "-16px",
                  marginRight: "-16px",
                  marginBottom: "24px",
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
                          className="absolute top-0 left-0 w-full h-full"
                          style={{ backgroundColor: "#000" }}
                        />
                      );
                    }

                    return (
                      <iframe
                        src={embedUrl}
                        className="absolute top-0 left-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                        allowFullScreen
                        style={{ border: 0 }}
                      />
                    );
                  })()
                ) : (
                  <div
                    className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white"
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    <div className="text-center">
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 500,
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          marginBottom: "12px",
                        }}
                      >
                        PRESENTED BY
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 500,
                          letterSpacing: "0.3em",
                          textTransform: "uppercase",
                        }}
                      >
                        THE ALIGNED WOMAN CO.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Lesson Meta */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
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
              <div>
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
                  LESSON {String(currentPageIndex + 1).padStart(2, "0")} OF {pages.length} ·{" "}
                  {selectedPage.estimatedMinutes || module?.durationMinutes || "22"} MIN
                </span>
              </div>
              {isCurrentPageComplete && (
                <div
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Check className="w-4 h-4" style={{ color: "#C4847A" }} />
                </div>
              )}
            </div>

            {/* Lesson Title */}
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

            {/* Expert Byline Mobile */}
            {expert && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: expert.profile_picture
                      ? `url(${expert.profile_picture}) center/cover`
                      : "#4A0E2E",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "12px",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {!expert.profile_picture &&
                    expert.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#3A2A28",
                    }}
                  >
                    {expert.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "12px",
                      fontWeight: 400,
                      color: "#8A7A76",
                    }}
                  >
                    {expert.title || "Expert"}
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div
              style={{
                display: "flex",
                gap: "24px",
                borderBottom: "1px solid rgba(74,14,46,0.06)",
                marginBottom: "20px",
              }}
            >
              <button
                onClick={() => setMobileTab("about")}
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  color: mobileTab === "about" ? "#4A0E2E" : "#8A7A76",
                  textTransform: "uppercase",
                  background: "none",
                  border: "none",
                  borderBottom:
                    mobileTab === "about" ? "2px solid #4A0E2E" : "none",
                  padding: "12px 0",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                ABOUT
              </button>
              <button
                onClick={() => setMobileTab("course")}
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  color: mobileTab === "course" ? "#4A0E2E" : "#8A7A76",
                  textTransform: "uppercase",
                  background: "none",
                  border: "none",
                  borderBottom:
                    mobileTab === "course" ? "2px solid #4A0E2E" : "none",
                  padding: "12px 0",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                COURSE {String(pages.length).padStart(2, "0")}
              </button>
            </div>

            {/* About Tab Content */}
            {mobileTab === "about" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "14px",
                  fontWeight: 300,
                  color: "#3A2A28",
                  lineHeight: 1.75,
                  marginBottom: "20px",
                }}
                dangerouslySetInnerHTML={{
                  __html: selectedPage.content || "",
                }}
              />
            )}

            {/* Course Tab Content */}
            {mobileTab === "course" && (
              <div style={{ marginBottom: "20px" }}>
                {/* Lesson List */}
                <div style={{ marginBottom: "24px" }}>
                  {pages.map((page, idx) => {
                    const isActive = selectedPage?.id === page.id;
                    const isComplete = isPageCompleted(page.id);
                    return (
                      <button
                        key={page.id}
                        onClick={() => {
                          setSelectedPage(page);
                          setMobileTab("about");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "12px 0",
                          borderBottom: "1px solid rgba(74,14,46,0.06)",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'DM Serif Display', serif",
                            fontSize: "16px",
                            fontStyle: "italic",
                            color: isComplete ? "#C4847A" : "#C8B8B4",
                            flexShrink: 0,
                            fontWeight: 400,
                          }}
                        >
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontFamily: "'Montserrat', sans-serif",
                              fontSize: "13px",
                              fontWeight: 500,
                              color: "#3A2A28",
                              marginBottom: "4px",
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
                            {page.estimatedMinutes ||
                              module?.durationMinutes ||
                              "22"}{" "}
                            MIN {isComplete ? "· COMPLETED" : ""}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Module Overview Mobile */}
                <div
                  style={{
                    background: "white",
                    borderRadius: "12px",
                    padding: "16px",
                    marginBottom: "24px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.22em",
                      color: "#4A0E2E",
                      textTransform: "uppercase",
                      marginBottom: "12px",
                      paddingBottom: "12px",
                      borderBottom: "2px solid #4A0E2E",
                    }}
                  >
                    MODULE OVERVIEW
                  </div>

                  <div style={{ space: "12px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        paddingBottom: "10px",
                        borderBottom:
                          "1px solid rgba(74,14,46,0.06)",
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
                        Lessons
                      </span>
                      <span
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#3A2A28",
                        }}
                      >
                        {pages.length}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        paddingBottom: "10px",
                        borderBottom:
                          "1px solid rgba(74,14,46,0.06)",
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
                        Total duration
                      </span>
                      <span
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#3A2A28",
                        }}
                      >
                        {module?.durationMinutes
                          ? `${Math.floor(
                              module.durationMinutes / 60
                            )} hr ${module.durationMinutes % 60} min`
                          : "N/A"}
                      </span>
                    </div>

                    {expert && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
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
                          Expert
                        </span>
                        <span
                          style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#3A2A28",
                          }}
                        >
                          {expert.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Workbook Card Mobile */}
                {courseWorkbook && (
                  <button
                    onClick={() => {
                      window.location.href = `/Workbook?id=${courseWorkbook.id}`;
                    }}
                    style={{
                      width: "100%",
                      background: "#FDF5F3",
                      border: "1px solid rgba(196,132,122,0.18)",
                      borderRadius: "12px",
                      padding: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                  >
                    <FileText
                      className="w-5 h-5"
                      style={{ color: "#4A0E2E", flexShrink: 0 }}
                    />
                    <div style={{ textAlign: "left", flex: 1 }}>
                      <div
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#4A0E2E",
                          marginBottom: "2px",
                        }}
                      >
                        Module workbook
                      </div>
                      <div
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: "12px",
                          fontWeight: 400,
                          color: "#8A7A76",
                        }}
                      >
                        PDF · 24 PAGES
                      </div>
                    </div>
                    <ChevronRight
                      className="w-4 h-4"
                      style={{ color: "#4A0E2E", flexShrink: 0 }}
                    />
                  </button>
                )}
              </div>
            )}

            {/* Mobile Sticky Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[rgba(74,14,46,0.06)] px-4 py-3 flex items-center gap-3 safe-area-bottom">
          <button
            onClick={handleTogglePageComplete}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: isCurrentPageComplete
                ? "none"
                : "2px solid #4A0E2E",
              background: isCurrentPageComplete ? "#4A0E2E" : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              flexShrink: 0,
            }}
          >
            <Check
              className="w-5 h-5"
              style={{
                color: isCurrentPageComplete ? "white" : "#4A0E2E",
              }}
            />
          </button>

          <button
            onClick={() => {
              if (nextPage) {
                setSelectedPage(nextPage);
                setMobileTab("about");
                window.scrollTo({ top: 0, behavior: "smooth" });
              } else if (nextModule) {
                navigate(
                  createPageUrl("ModulePlayer") +
                    `?moduleId=${nextModule.id}&courseId=${courseId}`
                );
              } else {
                navigate(createPageUrl("Classroom"));
              }
            }}
            style={{
              flex: 1,
              background: "#C4847A",
              border: "none",
              borderRadius: "100px",
              padding: "12px 16px",
              cursor: "pointer",
              transition: "background 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#A86460";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#C4847A";
            }}
          >
            <div style={{ textAlign: "left" }}>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  color: "#4A0E2E",
                  textTransform: "uppercase",
                }}
              >
                {nextPage
                  ? `UP NEXT · LESSON ${String(currentPageIndex + 2).padStart(
                      2,
                      "0"
                    )}`
                  : nextModule
                  ? "NEXT MODULE"
                  : "RETURN HOME"}
              </div>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#4A0E2E",
                  textTransform: "uppercase",
                }}
              >
                {nextPage
                  ? nextPage.title.substring(0, 20)
                  : nextModule
                  ? nextModule.title.substring(0, 20)
                  : "Blueprint Home"}
              </div>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: "#4A0E2E" }} />
          </button>
        </div>
      </div>
    );
  }
}