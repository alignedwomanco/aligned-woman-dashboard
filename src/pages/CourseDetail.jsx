import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Clock, Play, CheckCircle, Lock, BookOpen } from "lucide-react";

export default function CourseDetail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const courseId = searchParams.get("courseId");
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    const loadData = async () => {
      try {
        const courses = await base44.entities.Course.filter({ id: courseId });
        const courseData = courses[0];
        setCourse(courseData);

        // Load sections sorted by created_date (oldest first)
        const courseSections = await base44.entities.CourseSection.filter({ courseId }, "created_date");
        setSections(courseSections);
        if (courseSections.length > 0) setActiveSection(courseSections[0].id);

        // Load all modules for this course sorted by created_date (oldest first)
        const courseModules = await base44.entities.CourseModule.filter({ courseId }, "created_date");
        setModules(courseModules);

        // Load progress
        const prog = await base44.entities.CourseProgress.filter({ courseId });
        setProgress(prog);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [courseId]);

  const getSectionModules = (sectionId) =>
    modules.filter((m) => m.sectionId === sectionId);

  const getModuleProgress = (moduleId) => {
    const p = progress.find((p) => p.moduleId === moduleId);
    return p?.progressPercentage || 0;
  };

  const getModuleStatus = (moduleId) => {
    const p = progress.find((p) => p.moduleId === moduleId);
    if (!p || p.status === "not_started") return "Available";
    if (p.status === "completed") return "Complete";
    return "InProgress";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#3B224E] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Course not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#E4CAFB" }}>
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("Classroom")}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              {course.category && (
                <Badge className="bg-purple-100 text-purple-700 border-purple-200 border mb-1 text-xs">
                  {course.category}
                </Badge>
              )}
              <h1 className="text-xl font-bold text-[#3B224E]">{course.title}</h1>
              {course.description && (
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{course.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {sections.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No sections available yet.</p>
          </div>
        ) : (
          <Tabs value={activeSection || sections[0]?.id} onValueChange={setActiveSection}>
            {/* Section Tabs */}
            <TabsList className="bg-white/80 border border-purple-200 mb-6 flex-wrap h-auto gap-1 p-1 rounded-xl">
              {sections.map((section) => (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className="rounded-lg data-[state=active]:bg-[#3B224E] data-[state=active]:text-white text-sm px-4 py-2"
                >
                  {section.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {sections.map((section) => {
              const sectionModules = getSectionModules(section.id);
              return (
                <TabsContent key={section.id} value={section.id}>
                  {section.description && (
                    <p className="text-gray-600 mb-4 text-sm">{section.description}</p>
                  )}
                  {sectionModules.length === 0 ? (
                    <div className="text-center py-12 bg-white/60 rounded-2xl">
                      <p className="text-gray-500">No modules in this section yet.</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {sectionModules.map((module, idx) => {
                        const status = getModuleStatus(module.id);
                        const prog = getModuleProgress(module.id);
                        return (
                          <motion.div
                            key={module.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <Link
                              to={createPageUrl("ModulePlayer") + `?moduleId=${module.id}&courseId=${courseId}`}
                            >
                              <Card className="h-full hover:shadow-lg transition-all cursor-pointer bg-white">
                                <CardContent className="p-5">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                      <h3 className="font-semibold text-[#3B224E] text-base leading-snug">
                                        {module.title}
                                      </h3>
                                      {module.description && (
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                          {module.description}
                                        </p>
                                      )}
                                    </div>
                                    <div className="ml-3 flex-shrink-0">
                                      {status === "Complete" ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                      ) : status === "InProgress" ? (
                                        <Play className="w-5 h-5 text-[#3B224E]" />
                                      ) : (
                                        <Play className="w-5 h-5 text-gray-400" />
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                                    {module.durationMinutes > 0 && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {module.durationMinutes} min
                                      </span>
                                    )}
                                    <Badge
                                      variant="outline"
                                      className={
                                        status === "Complete"
                                          ? "border-green-300 text-green-700 bg-green-50"
                                          : status === "InProgress"
                                          ? "border-purple-300 text-purple-700 bg-purple-50"
                                          : "border-gray-200 text-gray-500"
                                      }
                                    >
                                      {status === "Complete"
                                        ? "Completed"
                                        : status === "InProgress"
                                        ? "In Progress"
                                        : "Start"}
                                    </Badge>
                                  </div>
                                  {prog > 0 && (
                                    <div>
                                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>Progress</span>
                                        <span>{prog}%</span>
                                      </div>
                                      <Progress value={prog} className="h-1.5" />
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </div>
    </div>
  );
}