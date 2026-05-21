import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";
import CourseAccessGate from "@/components/classroom/CourseAccessGate";

export default function ModulePlayer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get("moduleId");
  const courseId = searchParams.get("courseId");
  const [selectedPage, setSelectedPage] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [hasPaidAccess, setHasPaidAccess] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const queryClient = useQueryClient();

  // Check course access
  useEffect(() => {
    const checkAccess = async () => {
      if (!courseId) return;
      const me = await base44.auth.me();
      const email = me?.email?.toLowerCase();
      const adminUser = ['owner', 'admin', 'master_admin'].includes(me?.role);
      // Admin/owner bypass: always grant access
      if (adminUser) {
        setHasPaidAccess(true);
        setAccessChecked(true);
        return;
      }
      if (email) {
        const enrollments = await base44.entities.CourseEnrollment.filter({ userEmail: email, courseId, isPaid: true });
        if (enrollments.length > 0) { setHasPaidAccess(true); setAccessChecked(true); return; }
        // Check user access tags against course tags
        const userTags = me?.access_tags || [];
        const courses = await base44.entities.Course.filter({ id: courseId });
        const courseData = courses[0];
        if (courseData?.isComingSoon) { setHasPaidAccess(false); setAccessChecked(true); return; }
        if (courseData?.tags?.length > 0 && courseData.tags.some(t => userTags.includes(t))) {
          setHasPaidAccess(true); setAccessChecked(true); return;
        }
      }
      // Truly free = no tags and no price
      const courses2 = await base44.entities.Course.filter({ id: courseId });
      const c = courses2[0];
      if (c && (!c.tags || c.tags.length === 0) && (!c.price || c.price === 0)) {
        setHasPaidAccess(true);
      }
      setAccessChecked(true);
    };
    checkAccess();
  }, [courseId]);

  const { data: module } = useQuery({
    queryKey: ["courseModule", moduleId],
    queryFn: async () => {
      const modules = await base44.entities.CourseModule.filter({ id: moduleId });
      return modules[0];
    },
    enabled: !!moduleId,
  });

  const { data: course } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: courseId });
      return courses[0];
    },
    enabled: !!courseId,
  });

  const { data: rawPages = [] } = useQuery({
    queryKey: ["coursePages", moduleId],
    queryFn: () => base44.entities.CoursePage.filter({ moduleId }),
    enabled: !!moduleId,
  });

  // Sort pages client-side using the same logic as the admin Course Builder
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
      base44.entities.ModuleComment.filter(
        { moduleId },
        "-created_date"
      ),
    enabled: !!moduleId,
  });

  // All modules in this course (for next module navigation)
  const { data: allCourseModules = [] } = useQuery({
    queryKey: ["allCourseModules", courseId],
    queryFn: () => base44.entities.CourseModule.filter({ courseId }),
    enabled: !!courseId,
  });

  // All sections in this course (for cross-section ordering)
  const { data: allCourseSections = [] } = useQuery({
    queryKey: ["allCourseSections", courseId],
    queryFn: () => base44.entities.CourseSection.filter({ courseId }),
    enabled: !!courseId,
  });

  // FIX: Workbook entity uses snake_case course_id, not camelCase courseId
  const { data: workbooks = [] } = useQuery({
    queryKey: ["courseWorkbooks", courseId],
    queryFn: () => base44.entities.Workbook.filter({ course_id: courseId }),
    enabled: !!courseId,
  });

  // All pages across all course modules (to identify which modules have content)
  const { data: allCoursePages = [] } = useQuery({
    queryKey: ["allCoursePages", courseId],
    queryFn: async () => {
      const results = await Promise.all(
        allCourseModules.map(m => base44.entities.CoursePage.filter({ moduleId: m.id }))
      );
      return results.flat();
    },
    enabled: allCourseModules.length > 0,
  });

  // Reset selectedPage when navigating to a different module
  useEffect(() => {
    setSelectedPage(null);
  }, [moduleId]);

  const updateProgressMutation = useMutation({
    mutationFn: async ({ status, progressPercentage }) => {
      // Find the module-level progress record (one without a pageId)
      const existing = moduleProgress.find(p => !p.pageId);
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
      const existing = moduleProgress.find(p => p.pageId === pageId);
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
    const pageProgress = moduleProgress.find(p => p.pageId === selectedPage.id);
    const isCurrentlyComplete = pageProgress?.status === "completed" || false;
    
    await togglePageCompleteMutation.mutateAsync({
      pageId: selectedPage.id,
      isComplete: !isCurrentlyComplete,
    });

    // Check if all pages are now completed
    if (!isCurrentlyComplete) {
      const allPagesCompleted = pages.every(page => {
        if (page.id === selectedPage.id) return true;
        const progress = moduleProgress.find(p => p.pageId === page.id);
        return progress?.status === "completed";
      });

      if (allPagesCompleted) {
        await completeModule();
      } else {
        // Update module-level progress percentage
        const completedCount = pages.filter(page => {
          if (page.id === selectedPage.id) return true;
          const p = moduleProgress.find(pr => pr.pageId === page.id);
          return p?.status === "completed";
        }).length;
        const pct = Math.round((completedCount / pages.length) * 100);
        updateProgressMutation.mutate({ status: "in_progress", progressPercentage: pct });
      }
    } else {
      // Unmarking: recalculate
      const completedCount = pages.filter(page => {
        if (page.id === selectedPage.id) return false;
        const p = moduleProgress.find(pr => pr.pageId === page.id);
        return p?.status === "completed";
      }).length;
      const pct = Math.round((completedCount / pages.length) * 100);
      updateProgressMutation.mutate({ status: pct > 0 ? "in_progress" : "not_started", progressPercentage: pct });
    }
  };

  // FIX: use mutateAsync so the module-level write is awaited and errors
  // surface instead of silently leaving the record as "in_progress"
  const completeModule = async () => {
    try {
      await updateProgressMutation.mutateAsync({
        status: "completed",
        progressPercentage: 100,
      });
    } catch (error) {
      console.error("Failed to mark module complete:", error);
    }

    // Award points for module completion
    await awardModuleCompletion();
  };

  const awardModuleCompletion = async () => {
    try {
      const pointsRecords = await base44.entities.UserPoints.filter({});
      const currentPoints = pointsRecords[0];
      
      const modulePoints = 50; // Base points for module completion
      const streakBonus = (currentPoints?.currentStreak || 0) >= 3 ? 5 : 0;
      const totalPoints = (currentPoints?.points || 0) + modulePoints + streakBonus;
      const newLevel = Math.floor(totalPoints / 100) + 1;

      if (currentPoints) {
        await base44.entities.UserPoints.update(currentPoints.id, {
          points: totalPoints,
          level: newLevel,
          lastActivityDate: new Date().toISOString().split('T')[0],
        });
      } else {
        await base44.entities.UserPoints.create({
          points: totalPoints,
          level: newLevel,
          lastActivityDate: new Date().toISOString().split('T')[0],
        });
      }

      // Award badge for module completion
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

  // Calculate progress from actual page completions
  const overallProgress = pages.length > 0
    ? Math.round((pages.filter(page => {
        const p = moduleProgress.find(pr => pr.pageId === page.id);
        return p?.status === "completed";
      }).length / pages.length) * 100)
    : 0;

  if (!module || !selectedPage || !accessChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#6B1B3D] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!hasPaidAccess) {
    return (
      <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #F5E9EE 0%, #FFFFFF 100%)" }}>
        <div className="max-w-2xl mx-auto p-6 pt-20">
          <button onClick={() => navigate(-1)} className="mb-6">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
          </button>
          <CourseAccessGate course={course} />
        </div>
      </div>
    );
  }

  // Helper: check if a specific page is completed
  const isPageCompleted = (pageId) => {
    const p = moduleProgress.find(pr => pr.pageId === pageId);
    return p?.status === "completed";
  };

  // Helper: check if ALL pages in the module are completed
  const allPagesCompleted = pages.length > 0 && pages.every(page => isPageCompleted(page.id));

  // Helper: check if the currently selected page is completed
  const isCurrentPageComplete = isPageCompleted(selectedPage?.id);

  // Compute the next module in the course (cross-section ordering)
  const sortedSections = [...allCourseSections].sort((a, b) => {
    const aOrder = a.order ?? Infinity;
    const bOrder = b.order ?? Infinity;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return (a.created_date || "").localeCompare(b.created_date || "");
  });
  const sortedCourseModules = sortedSections.flatMap(section =>
    [...allCourseModules]
      .filter(m => m.sectionId === section.id)
      .sort((a, b) => {
        const aOrd = a.order ?? Infinity;
        const bOrd = b.order ?? Infinity;
        if (aOrd !== bOrd) return aOrd - bOrd;
        return (a.created_date || "").localeCompare(b.created_date || "");
      })
  );
  const currentModuleIndex = sortedCourseModules.findIndex(m => m.id === moduleId);
  // Skip modules that have no pages (e.g. placeholder "Assessment" modules)
  const modulesWithPages = new Set(allCoursePages.map(p => p.moduleId));
  const nextModule = sortedCourseModules
    .slice(currentModuleIndex + 1)
    .find(m => modulesWithPages.has(m.id)) || null;

  // FIX: Find the workbook matching this module's expert, not just the first one
  const courseWorkbook = workbooks.find(w => w.expert_id === module?.expertId)
    || (workbooks.length > 0 ? workbooks[0] : null);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #F5E9EE 0%, #FFFFFF 100%)" }}>
      {/* Header */}
      <div className="bg-white border-b sticky top-20 z-40">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <button onClick={() => navigate(-1)} className="flex-shrink-0">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </button>
              <div className="min-w-0">
                {course && (
                  <Badge className="bg-[#F5E8EE] text-[#6E1D40] border-[#DEBECC] border mb-1 max-w-full">
                    <Eye className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{course.title}</span>
                  </Badge>
                )}
                <h1 className="text-base sm:text-xl font-bold text-[#4A1228] break-words">{module?.title}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <span className="text-sm text-gray-500 items-center gap-1 hidden sm:flex">
                <Clock className="w-4 h-4" />
                {module.durationMinutes} min
              </span>
              <Progress value={overallProgress} className="w-20 sm:w-32" />
              <span className="text-sm font-medium text-[#6B1B3D]">{overallProgress}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-6 sm:py-8 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 overflow-hidden">
          {/* Left Sidebar - Pages List & Resources */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Course Content</CardTitle>
                <Progress value={overallProgress} className="h-1.5" />
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="space-y-1 p-4">
                    {pages.map((page, idx) => {
                      const pageProgress = moduleProgress.find(p => p.pageId === page.id);
                      const isCompleted = pageProgress?.status === "completed" || false;
                      return (
                        <button
                          key={page.id}
                          onClick={() => setSelectedPage(page)}
                          className={`w-full text-left p-3 rounded-lg transition-all ${
                            selectedPage?.id === page.id
                              ? "bg-pink-50 border-2 border-[#6B1B3D]"
                              : "hover:bg-gray-50 border-2 border-transparent"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isCompleted ? "bg-green-100" : "bg-gray-200"
                            }`}>
                              <span className={`text-xs font-semibold ${isCompleted ? "text-green-600" : "text-gray-600"}`}>{idx + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-1.5 text-sm font-medium text-[#4A1228] break-words">
                                  {page.title}
                                  {isCompleted && <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />}
                                </div>
                                {(page.estimatedMinutes || page.videoDuration) && (
                                  <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5">
                                    {page.estimatedMinutes
                                      ? `${page.estimatedMinutes} min`
                                      : `${Math.round(page.videoDuration / 60)} min`}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Resources Section */}
            {selectedPage.downloads && selectedPage.downloads.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedPage.downloads.map((download, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Download className="w-4 h-4 text-[#6B1B3D] flex-shrink-0" />
                        <span className="text-sm font-medium text-[#4A1228] truncate">
                          {download.name}
                        </span>
                      </div>
                      <a
                        href={download.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2"
                      >
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Download className="w-4 h-4" />
                        </Button>
                      </a>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Video Player */}
            <motion.div
              key={selectedPage.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="overflow-hidden">
                <div style={{ paddingTop: '56.25%', position: 'relative' }} className="bg-gray-900">
                  {selectedPage.videoUrl ? (
                    (() => {
                      const url = selectedPage.videoUrl.trim();
                      let embedUrl = url;

                      // YouTube
                      if (url.includes('youtube.com') || url.includes('youtu.be')) {
                        let videoId = null;
                        try {
                          if (url.includes('youtu.be')) videoId = url.split('youtu.be/')[1]?.split(/[?&#]/)[0];
                          else videoId = new URL(url).searchParams.get('v');
                        } catch (e) {
                          const match = url.match(/[?&]v=([^&#]+)/);
                          videoId = match ? match[1] : null;
                        }
                        if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
                      }

                      // Vimeo
                      if (url.includes('vimeo.com')) {
                        const vimeoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
                        if (vimeoId) embedUrl = `https://player.vimeo.com/video/${vimeoId}`;
                      }

                      // Google Drive
                      if (url.includes('drive.google.com')) {
                        const fileId = url.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1];
                        if (fileId) embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
                      }

                      // Wistia
                      if (url.includes('wistia.com') || url.includes('wistia.net')) {
                        const videoId = url.match(/medias\/([a-zA-Z0-9]+)/)?.[1] || url.split('/').pop();
                        embedUrl = `https://fast.wistia.net/embed/iframe/${videoId}`;
                      }
                      
                      // Check if it's a direct video file (mp4, webm, mov, ogg, etc.) or hosted upload
                      const isDirectVideo = /\.(mp4|webm|mov|ogg|m4v|avi|mkv)(\?|$)/i.test(embedUrl) || embedUrl.includes('supabase.co/storage') || embedUrl.includes('base44.app/api/apps');
                      if (isDirectVideo) {
                        return (
                          <video
                            src={embedUrl}
                            controls
                            className="absolute top-0 left-0 w-full h-full"
                            style={{ backgroundColor: '#000' }}
                          />
                        );
                      }

                      // For Google Drive, Wistia, Vimeo, and other embed URLs
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
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white">
                      No video available
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Lesson Content */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedPage.title}</CardTitle>
                  {(() => {
                    const pageProgress = moduleProgress.find(p => p.pageId === selectedPage.id);
                    const isPageComplete = pageProgress?.status === "completed" || false;
                    
                    return (
                      <div className="flex flex-col items-end">
                        {/* Helper text above Mark Complete (only when not completed) */}
                        {!isPageComplete && (
                          <p
                            className="text-xs italic mb-2 text-right max-w-[220px]"
                            style={{ color: "var(--aw-burg-core, #4A0E2E)", opacity: 0.6 }}
                          >
                            You must press this button in order to move onto the next module.
                          </p>
                        )}
                        {/* Pulse animation on Mark Complete when not completed */}
                        <Button
                          onClick={handleTogglePageComplete}
                          variant={isPageComplete ? "outline" : "default"}
                          className={
                            isPageComplete
                              ? "border-[#943A59] text-[#943A59] hover:bg-pink-50"
                              : "bg-[#943A59] hover:bg-[#7a2e49] text-white animate-pulse ring-2 ring-offset-2"
                          }
                          style={
                            !isPageComplete
                              ? { "--tw-ring-color": "rgba(196, 132, 122, 0.4)" }
                              : undefined
                          }
                        >
                          <span className="font-medium">{isPageComplete ? "Completed" : "Mark Complete"}</span>
                          <CheckCircle className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    );
                  })()}
                </div>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose max-w-none" 
                  dangerouslySetInnerHTML={{ __html: selectedPage.content || '' }}
                />
              </CardContent>
            </Card>

            {/* Next/Complete Actions */}
            <Card className="bg-gradient-to-br from-pink-50 to-white border-pink-100">
              <CardContent className="p-6">
                <div className="space-y-3">
                  {(() => {
                    const currentIndex = pages.findIndex(p => p.id === selectedPage.id);
                    const nextPage = pages[currentIndex + 1];

                    // Not the last page: show Next Lesson
                    if (nextPage) {
                      return (
                        <Button
                          className={`w-full ${
                            isCurrentPageComplete
                              ? "bg-[#6B1B3D] hover:bg-[#4A1228] text-white"
                              : "bg-[#6B1B3D] text-white opacity-50 cursor-not-allowed"
                          }`}
                          onClick={() => {
                            if (isCurrentPageComplete) {
                              setSelectedPage(nextPage);
                            }
                          }}
                          disabled={!isCurrentPageComplete}
                        >
                          Next Lesson &rarr;
                        </Button>
                      );
                    }

                    // Last page: show Workbook + Next Module + Back to Classroom
                    return (
                      <>
                        {/* Continue to Workbook (if one exists for this module's expert) */}
                        {courseWorkbook && (
                          <Button
                            className={`w-full ${
                              allPagesCompleted
                                ? "bg-[#943A59] hover:bg-[#7a2e49] text-white"
                                : "bg-[#943A59] text-white opacity-50 cursor-not-allowed"
                            }`}
                            onClick={() => {
                              if (allPagesCompleted) {
                                // FIX: use the registered /Workbook route with ?id= param
                                window.location.href = `/Workbook?id=${courseWorkbook.id}`;
                              }
                            }}
                            disabled={!allPagesCompleted}
                          >
                            Continue to Workbook &rarr;
                          </Button>
                        )}

                        {/* Next Module (if one exists in the course) */}
                        {nextModule && (
                          <Button
                            className={`w-full ${
                              allPagesCompleted
                                ? "bg-[#6B1B3D] hover:bg-[#4A1228] text-white"
                                : "bg-[#6B1B3D] text-white opacity-50 cursor-not-allowed"
                            }`}
                            onClick={() => {
                              if (allPagesCompleted) {
                                navigate(createPageUrl("ModulePlayer") + `?moduleId=${nextModule.id}&courseId=${courseId}`);
                              }
                            }}
                            disabled={!allPagesCompleted}
                          >
                            Next Module: {nextModule.title} &rarr;
                          </Button>
                        )}

                        {/* Back to Classroom (always available) */}
                        <Button
                          variant="outline"
                          className="w-full border-[#6B1B3D] text-[#6B1B3D] hover:bg-pink-50"
                          onClick={() => navigate(createPageUrl("Classroom"))}
                        >
                          Back to Classroom
                        </Button>
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="w-5 h-5" />
                  Questions & Comments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Add Comment */}
                  <div className="flex gap-3">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Ask a question or leave a comment..."
                      className="flex-1"
                    />
                    <Button
                      onClick={handleAddComment}
                      className="bg-[#6B1B3D] hover:bg-[#4A1228]"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>

                  <Separator />

                  {/* Comments List */}
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-[#6B1B3D] rounded-full flex items-center justify-center text-white text-sm">
                              {comment.created_by?.[0]}
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {comment.created_by}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.created_date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{comment.comment}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}