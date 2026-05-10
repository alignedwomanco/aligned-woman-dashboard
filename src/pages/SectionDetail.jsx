import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, CheckCircle, Play, Zap, Award, User, Lock } from "lucide-react";

// Known entity IDs
const WELCOME_SECTION_ID = "69f489b6873a93ae61729b8e";
const PHASE_1_SECTION_ID = "69f4886c850c814862817d6b";
const MODULE_1_ID = "69f48883716034047de26b98";

export default function SectionDetail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sectionId = searchParams.get("sectionId");
  const courseId = searchParams.get("courseId");

  const [section, setSection] = useState(null);
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [pages, setPages] = useState([]);
  const [progress, setProgress] = useState([]);
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sectionId) return;
    const loadData = async () => {
      try {
        const sections = await base44.entities.CourseSection.filter({ id: sectionId });
        const sectionData = sections[0];
        setSection(sectionData);

        if (courseId) {
          const courses = await base44.entities.Course.filter({ id: courseId });
          setCourse(courses[0]);
        }

        // Load modules for this section
        const sectionModules = await base44.entities.CourseModule.filter({ sectionId });
        const sorted = sectionModules.sort((a, b) => {
          const aHasOrder = a.order !== undefined && a.order !== null;
          const bHasOrder = b.order !== undefined && b.order !== null;
          if (aHasOrder && bHasOrder) return a.order - b.order;
          if (aHasOrder) return -1;
          if (bHasOrder) return 1;
          return (a.created_date || "").localeCompare(b.created_date || "");
        });
        setModules(sorted);

        // Load all pages for modules in this section (for unlock logic)
        if (courseId) {
          const allPages = await base44.entities.CoursePage.filter({ courseId }, "order");
          setPages(allPages);
        }

        // Load experts
        const allExperts = await base44.entities.Expert.list();
        setExperts(allExperts);

        // Load progress
        const prog = await base44.entities.CourseProgress.filter({});
        setProgress(prog);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [sectionId, courseId]);

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

  // Check if all published pages in a module are completed
  const isModuleFullyComplete = (moduleId) => {
    const modulePages = pages.filter(
      (p) => p.moduleId === moduleId && p.isPublished !== false
    );
    if (modulePages.length === 0) return false;
    return modulePages.every((page) => {
      const prog = progress.find(
        (p) => p.pageId === page.id && p.status === "completed"
      );
      return !!prog;
    });
  };

  // Determine if a module is accessible based on unlock rules:
  //  - Welcome section: all modules always accessible
  //  - Phase 1, Module 1 (Hormones): always accessible to enrolled users
  //  - Phase 1, Modules 2+: require previous module to be completed
  //  - Phase 2+: would require all Phase 1 modules to be completed (handled by section-level gating)
  const isModuleAccessible = (module, idx) => {
    // If module is unpublished or coming soon, lock it
    if (!module.isPublished || module.isComingSoon) return false;

    // Welcome section modules are always accessible
    if (sectionId === WELCOME_SECTION_ID) return true;

    // Module 1 (Hormones) is always accessible in Phase 1
    if (module.id === MODULE_1_ID) return true;

    // Phase 1: first module in the sorted list is always accessible
    if (sectionId === PHASE_1_SECTION_ID && idx === 0) return true;

    // For subsequent modules in any section, require the previous module to be completed
    if (idx > 0) {
      const previousModule = modules[idx - 1];
      return isModuleFullyComplete(previousModule.id);
    }

    // Default: accessible (first module in any section)
    return true;
  };

  const completedCount = modules.filter(
    (m) => getModuleStatus(m.id) === "Complete" || isModuleFullyComplete(m.id)
  ).length;
  const sectionProgress =
    modules.length > 0
      ? Math.round((completedCount / modules.length) * 100)
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#6E1D40] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!section) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Section not found.</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(180deg, #F5E9EE 0%, #FFFFFF 100%)",
      }}
    >
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <button onClick={() => navigate(-1)} className="inline-block mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-[#6E1D40] hover:text-[#6E1D40]/80"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </button>

        {/* Section Banner */}
        <div
          className="rounded-2xl overflow-hidden border-2"
          style={{ borderColor: "#6E1D40" }}
        >
          <div className="h-48 bg-gradient-to-br from-[#6E1D40] to-[#943A59] relative">
            {section.coverImage ? (
              <img
                src={section.coverImage}
                alt={section.title}
                className="w-full h-full object-cover opacity-70"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#6E1D40] to-[#943A59]" />
            )}
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <h1 className="text-3xl font-bold text-white">
                {section.title}
              </h1>
              {section.description && (
                <p className="text-white/80 text-sm mt-1">
                  {section.description}
                </p>
              )}
            </div>
          </div>

          {/* Progress Info */}
          <div className="bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {modules.length} modules
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#6E1D40]">
                  {sectionProgress}% Complete
                </span>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${sectionProgress}%`,
                      background:
                        sectionProgress >= 100
                          ? "#22c55e"
                          : `repeating-linear-gradient(-45deg, #6E1D40, #6E1D40 4px, #943A59 4px, #943A59 8px)`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modules List */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {modules.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No modules in this section yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {modules.map((module, idx) => {
              const status = getModuleStatus(module.id);
              const prog = getModuleProgress(module.id);
              const isCompleted =
                status === "Complete" || isModuleFullyComplete(module.id);
              const expert = module.expertId
                ? experts.find((e) => e.id === module.expertId)
                : null;
              const accessible = isModuleAccessible(module, idx);

              // Determine page count for display
              const modulePages = pages.filter(
                (p) => p.moduleId === module.id && p.isPublished !== false
              );
              const completedPages = modulePages.filter((p) => {
                const pr = progress.find(
                  (pr) => pr.pageId === p.id && pr.status === "completed"
                );
                return !!pr;
              }).length;

              const moduleCard = (
                <div
                  className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                    isCompleted
                      ? "border-green-200 bg-green-50/30"
                      : accessible
                      ? "border-[#DEBECC] hover:shadow-lg cursor-pointer"
                      : "border-gray-200 opacity-60"
                  }`}
                >
                  <div className="p-6 flex items-start gap-4">
                    {/* Module number / status icon */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isCompleted
                          ? "bg-green-100"
                          : accessible
                          ? "bg-gradient-to-br from-[#6E1D40] to-[#943A59]"
                          : "bg-gray-100"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : accessible ? (
                        <Play className="w-6 h-6 text-white" />
                      ) : (
                        <Lock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    {/* Module info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3
                          className={`text-lg font-semibold ${
                            accessible ? "text-[#4A1228]" : "text-gray-400"
                          }`}
                        >
                          {module.title}
                        </h3>
                        {isCompleted && (
                          <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                            Complete
                          </Badge>
                        )}
                        {!accessible && (
                          <Badge className="bg-gray-100 text-gray-500 border-0 text-xs">
                            Locked
                          </Badge>
                        )}
                        {module.isComingSoon && (
                          <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                            Coming Soon
                          </Badge>
                        )}
                      </div>

                      {module.description && (
                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                          {module.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 flex-wrap">
                        {module.durationMinutes > 0 && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {module.durationMinutes} min
                          </span>
                        )}
                        {modulePages.length > 0 && (
                          <span className="text-xs text-gray-500">
                            {completedPages} / {modulePages.length} lessons
                          </span>
                        )}
                        {expert && (
                          <span className="text-xs text-[#6E1D40] flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {expert.name}
                          </span>
                        )}
                      </div>

                      {/* Progress bar for in-progress modules */}
                      {accessible && modulePages.length > 0 && !isCompleted && (
                        <div className="mt-3">
                          <Progress
                            value={
                              modulePages.length > 0
                                ? Math.round(
                                    (completedPages / modulePages.length) * 100
                                  )
                                : 0
                            }
                            className="h-1.5"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );

              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  {accessible ? (
                    <Link
                      to={
                        createPageUrl("ModulePlayer") +
                        `?moduleId=${module.id}&courseId=${courseId}`
                      }
                    >
                      {moduleCard}
                    </Link>
                  ) : (
                    moduleCard
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}