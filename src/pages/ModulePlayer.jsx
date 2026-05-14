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
  BookOpen,
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

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const me = await base44.auth.me();
        const adminUser = ["owner", "admin", "master_admin"].includes(me?.role);
        if (adminUser) { setHasPaidAccess(true); setAccessChecked(true); return; }
        if (!courseId) { setAccessChecked(true); return; }
        const email = me?.email?.toLowerCase();
        if (email) {
          const enrollments = await base44.entities.CourseEnrollment.filter({ userEmail: email, courseId, isPaid: true });
          if (enrollments.length > 0) { setHasPaidAccess(true); setAccessChecked(true); return; }
          const userTags = me?.access_tags || [];
          const courses = await base44.entities.Course.filter({ id: courseId });
          const courseData = courses[0];
          if (courseData?.isComingSoon) { setHasPaidAccess(false); setAccessChecked(true); return; }
          if (courseData?.tags?.length > 0 && courseData.tags.some(t => userTags.includes(t))) { setHasPaidAccess(true); setAccessChecked(true); return; }
        }
        const courses2 = await base44.entities.Course.filter({ id: courseId });
        const c = courses2[0];
        if (c && (!c.tags || c.tags.length === 0) && (!c.price || c.price === 0)) { setHasPaidAccess(true); }
        setAccessChecked(true);
      } catch (err) {
        console.error("[ModulePlayer] Access check failed:", err);
        setAccessChecked(true);
      }
    };
    checkAccess();
  }, [courseId]);

  const { data: module } = useQuery({
    queryKey: ["courseModule", moduleId],
    queryFn: async () => { const r = await base44.entities.CourseModule.filter({ id: moduleId }); return r[0]; },
    enabled: !!moduleId,
  });

  const { data: course } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => { const r = await base44.entities.Course.filter({ id: courseId }); return r[0]; },
    enabled: !!courseId,
  });

  const { data: pages = [] } = useQuery({
    queryKey: ["coursePages", moduleId],
    queryFn: () => base44.entities.CoursePage.filter({ moduleId }, "order"),
    enabled: !!moduleId,
  });

  const { data: moduleProgress = [] } = useQuery({
    queryKey: ["courseProgress", moduleId],
    queryFn: () => base44.entities.CourseProgress.filter({ moduleId }),
    enabled: !!moduleId,
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", moduleId],
    queryFn: () => base44.entities.ModuleComment.filter({ moduleId }, "-created_date"),
    enabled: !!moduleId,
  });

  const { data: allCourseModules = [] } = useQuery({
    queryKey: ["allCourseModules", courseId],
    queryFn: async () => {
      const mods = await base44.entities.CourseModule.filter({ courseId });
      return mods.sort((a, b) => {
        if (a.sectionId !== b.sectionId) return (a.sectionId || "").localeCompare(b.sectionId || "");
        const ao = a.order ?? 9999, bo = b.order ?? 9999;
        return ao !== bo ? ao - bo : (a.created_date || "").localeCompare(b.created_date || "");
      });
    },
    enabled: !!courseId,
  });

  const { data: allSections = [] } = useQuery({
    queryKey: ["allSections", courseId],
    queryFn: async () => {
      const secs = await base44.entities.CourseSection.filter({ courseId });
      return secs.sort((a, b) => {
        const ao = a.order ?? 9999, bo = b.order ?? 9999;
        return ao !== bo ? ao - bo : (a.created_date || "").localeCompare(b.created_date || "");
      });
    },
    enabled: !!courseId,
  });

  const { data: workbooks = [] } = useQuery({
    queryKey: ["workbooks", courseId],
    queryFn: () => base44.entities.Workbook.filter({ course_id: courseId }),
    enabled: !!courseId,
  });

  const moduleWorkbook = module?.expertId
    ? workbooks.find(w => w.expert_id === module.expertId && w.course_id === courseId)
    : null;

  const getNextModule = () => {
    if (!module || allSections.length === 0) return null;
    const orderedModules = [];
    for (const sec of allSections) {
      const secMods = allCourseModules
        .filter(m => m.sectionId === sec.id)
        .sort((a, b) => {
          const ao = a.order ?? 9999, bo = b.order ?? 9999;
          return ao !== bo ? ao - bo : (a.created_date || "").localeCompare(b.created_date || "");
        });
      orderedModules.push(...secMods);
    }
    const currentIdx = orderedModules.findIndex(m => m.id === moduleId);
    if (currentIdx === -1 || currentIdx >= orderedModules.length - 1) return null;
    return orderedModules[currentIdx + 1];
  };

  const nextModule = getNextModule();

  const updateProgressMutation = useMutation({
    mutationFn: async ({ status, progressPercentage }) => {
      const existing = moduleProgress.find(p => !p.pageId);
      if (existing) {
        return base44.entities.CourseProgress.update(existing.id, { status, progressPercentage: progressPercentage || existing.progressPercentage || 0 });
      } else {
        return base44.entities.CourseProgress.create({ courseId, moduleId, status, progressPercentage: progressPercentage || 0 });
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["courseProgress"] }); },
  });

  const addCommentMutation = useMutation({
    mutationFn: (comment) => base44.entities.ModuleComment.create(comment),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["comments"] }); setNewComment(""); },
  });

  const togglePageCompleteMutation = useMutation({
    mutationFn: async ({ pageId, isComplete }) => {
      const existing = moduleProgress.find(p => p.pageId === pageId);
      if (existing) {
        return base44.entities.CourseProgress.update(existing.id, { status: isComplete ? "completed" : "in_progress", progressPercentage: isComplete ? 100 : existing.progressPercentage });
      } else {
        return base44.entities.CourseProgress.create({ courseId, moduleId, pageId, status: isComplete ? "completed" : "in_progress", progressPercentage: isComplete ? 100 : 0 });
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["courseProgress"] }); },
  });

  useEffect(() => {
    setSelectedPage(null);
  }, [moduleId]);

  useEffect(() => {
    if (pages.length > 0 && !selectedPage) { setSelectedPage(pages[0]); }
  }, [pages, selectedPage]);

  const handleTogglePageComplete = async () => {
    const pageProgress = moduleProgress.find(p => p.pageId === selectedPage.id);
    const isCurrentlyComplete = pageProgress?.status === "completed" || false;
    await togglePageCompleteMutation.mutateAsync({ pageId: selectedPage.id, isComplete: !isCurrentlyComplete });

    if (!isCurrentlyComplete) {
      const allPagesCompleted = pages.every(page => {
        if (page.id === selectedPage.id) return true;
        const progress = moduleProgress.find(p => p.pageId === page.id);
        return progress?.status === "completed";
      });
      if (allPagesCompleted) { await completeModule(); }
      else {
        const completedCount = pages.filter(page => { if (page.id === selectedPage.id) return true; const p = moduleProgress.find(pr => pr.pageId === page.id); return p?.status === "completed"; }).length;
        updateProgressMutation.mutate({ status: "in_progress", progressPercentage: Math.round((completedCount / pages.length) * 100) });
      }
    } else {
      const completedCount = pages.filter(page => { if (page.id === selectedPage.id) return false; const p = moduleProgress.find(pr => pr.pageId === page.id); return p?.status === "completed"; }).length;
      const pct = Math.round((completedCount / pages.length) * 100);
      updateProgressMutation.mutate({ status: pct > 0 ? "in_progress" : "not_started", progressPercentage: pct });
    }
  };

  const completeModule = async () => {
    updateProgressMutation.mutate({ status: "completed", progressPercentage: 100 });
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
        await base44.entities.UserPoints.update(currentPoints.id, { points: totalPoints, level: newLevel, lastActivityDate: new Date().toISOString().split("T")[0] });
      } else {
        await base44.entities.UserPoints.create({ points: totalPoints, level: newLevel, lastActivityDate: new Date().toISOString().split("T")[0] });
      }
      await base44.entities.UserBadge.create({ badgeId: `module-${moduleId}`, badgeName: `${module.title} Complete`, badgeIcon: "🎓", earnedDate: new Date().toISOString() });
    } catch (error) { console.error("Error awarding points:", error); }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addCommentMutation.mutate({ moduleId, comment: newComment, isQuestion: false });
  };

  const overallProgress = pages.length > 0
    ? Math.round((pages.filter(page => { const p = moduleProgress.find(pr => pr.pageId === page.id); return p?.status === "completed"; }).length / pages.length) * 100)
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

  const renderEndOfModuleAction = () => {
    const currentIndex = pages.findIndex(p => p.id === selectedPage.id);
    const nextPage = pages[currentIndex + 1];

    if (nextPage) {
      return (
        <Button className="w-full bg-[#6B1B3D] hover:bg-[#4A1228] text-white" onClick={() => setSelectedPage(nextPage)}>
          Next Lesson →
        </Button>
      );
    }

    const courseDetailUrl = courseId
      ? `${createPageUrl("CourseDetail")}?courseId=${courseId}`
      : createPageUrl("Classroom");

    return (
      <div className="space-y-3">
        {moduleWorkbook && (
          <Button
            className="w-full bg-[#6B1B3D] hover:bg-[#4A1228] text-white gap-2"
            onClick={() => { window.location.href = `/WorkbookViewer?id=${moduleWorkbook.id}`; }}
          >
            <BookOpen className="w-4 h-4" />
            Continue to Workbook
          </Button>
        )}
        {nextModule && (
          <Button
            className={`w-full gap-2 ${moduleWorkbook ? "bg-white text-[#6B1B3D] border border-[#6B1B3D] hover:bg-pink-50" : "bg-[#6B1B3D] hover:bg-[#4A1228] text-white"}`}
            onClick={() => navigate(`${createPageUrl("ModulePlayer")}?moduleId=${nextModule.id}&courseId=${courseId}`)}
          >
            {moduleWorkbook ? "Skip to Next Module →" : "Next Module →"}
          </Button>
        )}
        <Button variant="ghost" className="w-full text-[#6B1B3D] hover:bg-pink-50" onClick={() => navigate(courseDetailUrl)}>
          Back to Course Overview
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #F5E9EE 0%, #FFFFFF 100%)" }}>
      <div className="bg-white border-b sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <button onClick={() => navigate(-1)} className="flex-shrink-0">
                <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
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
                <Clock className="w-4 h-4" />{module.durationMinutes} min
              </span>
              <Progress value={overallProgress} className="w-20 sm:w-32" />
              <span className="text-sm font-medium text-[#6B1B3D]">{overallProgress}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 overflow-hidden">
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
                          className={`w-full text-left p-3 rounded-lg transition-all ${selectedPage?.id === page.id ? "bg-pink-50 border-2 border-[#6B1B3D]" : "hover:bg-gray-50 border-2 border-transparent"}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted ? "bg-green-100" : "bg-gray-200"}`}>
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
                                    {page.estimatedMinutes ? `${page.estimatedMinutes} min` : `${Math.round(page.videoDuration / 60)} min`}
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

            {selectedPage.downloads && selectedPage.downloads.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2"><Download className="w-4 h-4" />Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedPage.downloads.map((download, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Download className="w-4 h-4 text-[#6B1B3D] flex-shrink-0" />
                        <span className="text-sm font-medium text-[#4A1228] truncate">{download.name}</span>
                      </div>
                      <a href={download.url} target="_blank" rel="noopener noreferrer" className="ml-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0"><Download className="w-4 h-4" /></Button>
                      </a>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <motion.div key={selectedPage.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="overflow-hidden">
                <div style={{ paddingTop: "56.25%", position: "relative" }} className="bg-gray-900">
                  {selectedPage.videoUrl ? (() => {
                    const url = selectedPage.videoUrl.trim();
                    if (url.includes("youtube.com") || url.includes("youtu.be")) {
                      let videoId = null;
                      try { videoId = url.includes("youtu.be") ? url.split("youtu.be/")[1]?.split(/[?&#]/)[0] : new URL(url).searchParams.get("v"); }
                      catch (e) { const match = url.match(/[?&]v=([^&#]+)/); videoId = match ? match[1] : null; }
                      if (videoId) return <iframe src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&origin=${window.location.origin}`} className="absolute top-0 left-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-presentation allow-popups" style={{ border: 0 }} />;
                    }
                    let embedUrl = url;
                    if (url.includes("drive.google.com") && !url.includes("docs.google.com")) {
                      const fileId = url.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1] || url.match(/[-\w]{25,}/)?.[0];
                      if (fileId) embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
                    } else if (url.includes("wistia.com")) {
                      const vid = url.match(/medias\/([a-zA-Z0-9]+)/)?.[1] || url.split("/").pop();
                      embedUrl = `https://fast.wistia.net/embed/iframe/${vid}`;
                    }
                    const isDirectVideo = /\.(mp4|webm|mov|ogg|m4v|avi|mkv)(\?|$)/i.test(embedUrl) || embedUrl.includes("supabase.co/storage") || embedUrl.includes("base44.app/api/apps");
                    if (isDirectVideo) return <video src={embedUrl} controls className="absolute top-0 left-0 w-full h-full" style={{ backgroundColor: "#000" }} />;
                    return <iframe src={embedUrl} className="absolute top-0 left-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen style={{ border: 0 }} />;
                  })() : <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white">No video available</div>}
                </div>
              </Card>
            </motion.div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedPage.title}</CardTitle>
                  {(() => {
                    const pp = moduleProgress.find(p => p.pageId === selectedPage.id);
                    const done = pp?.status === "completed" || false;
                    return (
                      <Button onClick={handleTogglePageComplete} variant={done ? "outline" : "default"} className={done ? "border-[#943A59] text-[#943A59] hover:bg-pink-50" : "bg-[#943A59] hover:bg-[#7a2e49] text-white"}>
                        <span className="font-medium">{done ? "Completed" : "Mark Complete"}</span>
                        <CheckCircle className="w-4 h-4 ml-2" />
                      </Button>
                    );
                  })()}
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: selectedPage.content || "" }} />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-50 to-white border-pink-100">
              <CardContent className="p-6">
                {renderEndOfModuleAction()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><MessageCircle className="w-5 h-5" />Questions & Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Ask a question or leave a comment..." className="flex-1" />
                    <Button onClick={handleAddComment} className="bg-[#6B1B3D] hover:bg-[#4A1228]"><Send className="w-4 h-4" /></Button>
                  </div>
                  <Separator />
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-[#6B1B3D] rounded-full flex items-center justify-center text-white text-sm">{comment.created_by?.[0]}</div>
                            <span className="text-sm font-medium text-gray-700">{comment.created_by}</span>
                            <span className="text-xs text-gray-500">{new Date(comment.created_date).toLocaleDateString()}</span>
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