import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import DateLabel from "@/components/dashboard-v2/DateLabel";
import WelcomeHeader from "@/components/dashboard-v2/WelcomeHeader";
import ContinueHero from "@/components/dashboard-v2/ContinueHero";
import PhaseIndicator from "@/components/dashboard-v2/PhaseIndicator";
import WhyYouStarted from "@/components/dashboard-v2/WhyYouStarted";
import WorkbooksSection from "@/components/dashboard-v2/WorkbooksSection";
import AskLaurAI from "@/components/dashboard-v2/AskLaurAI";
import CommunityTile from "@/components/dashboard-v2/CommunityTile";
import ExpertSpotlight from "@/components/dashboard-v2/ExpertSpotlight";
import IntakeModal from "@/components/dashboard-v2/IntakeModal";
import DashboardSidebar from "@/components/dashboard-v2/DashboardSidebar";
import MobileTabBar from "@/components/dashboard-v2/MobileTabBar";
import TopBar from "@/components/dashboard-v2/TopBar";
import LaurAIChatWidget from "@/components/LaurAIChatWidget";
import useContinueModule from "@/hooks/useContinueModule";

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showIntakeModal, setShowIntakeModal] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  // Continue Where You Left Off — reads from Course → Section → Module → Page hierarchy
  const continueData = useContinueModule(currentUser);

  // Site settings
  const { data: siteSettings } = useQuery({
    queryKey: ["siteSettings"],
    queryFn: async () => {
      const settings = await base44.entities.SiteSettings.list();
      return settings[0] || null;
    },
  });

  // Diagnostic session (quiz data / archetype / concerns)
  const { data: diagnosticSession } = useQuery({
    queryKey: ["diagnosticSession"],
    queryFn: async () => {
      const sessions = await base44.entities.DiagnosticSession.filter({ isComplete: true }, "-created_date", 1);
      return sessions[0] || null;
    },
  });

  // Course enrollments (check for blueprint_paid)
  const { data: enrollments } = useQuery({
    queryKey: ["enrollments"],
    queryFn: () => base44.entities.CourseEnrollment.filter({ isPaid: true }, "-created_date", 5),
    initialData: [],
  });

  // Access tags
  const { data: accessTags } = useQuery({
    queryKey: ["accessTags"],
    queryFn: () => base44.entities.AccessTag.filter({ tag_key: "blueprint_paid" }),
    initialData: [],
  });

  const isBlueprintOwner = enrollments?.some(e => e.isPaid) || accessTags?.length > 0;

  // Courses
  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: () => base44.entities.Course.filter({ isPublished: true }),
    initialData: [],
  });

  // Current course (first enrolled published course)
  const currentCourse = courses?.[0];

  // Course sections (phases)
  const { data: sections } = useQuery({
    queryKey: ["courseSections", currentCourse?.id],
    queryFn: () => base44.entities.CourseSection.filter(
      currentCourse?.id ? { courseId: currentCourse.id, isPublished: true } : { isPublished: true },
      "order"
    ),
    initialData: [],
    enabled: !!currentCourse,
  });

  // Course modules
  const { data: modules } = useQuery({
    queryKey: ["courseModules", currentCourse?.id],
    queryFn: () => base44.entities.CourseModule.filter(
      currentCourse?.id ? { courseId: currentCourse.id, isPublished: true } : { isPublished: true },
      "order"
    ),
    initialData: [],
    enabled: !!currentCourse,
  });

  // Course progress
  const { data: progress } = useQuery({
    queryKey: ["courseProgress"],
    queryFn: () => base44.entities.CourseProgress.list("-lastAccessedAt"),
    initialData: [],
  });

  // Sub-module progress (for page-level tracking)
  const { data: subModuleProgress } = useQuery({
    queryKey: ["subModuleProgress"],
    queryFn: () => base44.entities.SubModuleProgress.list("-updated_date"),
    initialData: [],
  });

  // Experts
  const { data: experts } = useQuery({
    queryKey: ["experts"],
    queryFn: () => base44.entities.Expert.filter({ isPublished: true }),
    initialData: [],
  });

  // Community posts (recent)
  const { data: communityPosts } = useQuery({
    queryKey: ["communityPosts"],
    queryFn: () => base44.entities.CommunityPost.list("-created_date", 5),
    initialData: [],
  });

  // Notifications (for unread indicator)
  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => base44.entities.Notification.filter({ isRead: false }, "-created_date", 5),
    initialData: [],
  });

  // SubModules (workbook-like content)
  const { data: subModules } = useQuery({
    queryKey: ["subModules"],
    queryFn: () => base44.entities.SubModule.list("order"),
    initialData: [],
  });

  // Compute current section (first incomplete or first section)
  const currentSection = useMemo(() => {
    if (!sections.length) return null;
    // Find section with incomplete modules
    for (const section of sections) {
      const sectionModules = modules.filter(m => m.sectionId === section.id);
      const completedInSection = sectionModules.filter(m => 
        progress.some(p => p.moduleId === m.id && p.status === "completed")
      );
      if (completedInSection.length < sectionModules.length) return section;
    }
    return sections[0];
  }, [sections, modules, progress]);

  // Compute current module (first incomplete in current section)
  const currentModule = useMemo(() => {
    if (!currentSection || !modules.length) return null;
    const sectionModules = modules.filter(m => m.sectionId === currentSection.id).sort((a, b) => (a.order || 0) - (b.order || 0));
    // Find first incomplete module
    const incomplete = sectionModules.find(m => 
      !progress.some(p => p.moduleId === m.id && p.status === "completed")
    );
    return incomplete || sectionModules[0];
  }, [currentSection, modules, progress]);

  // Current module expert
  const currentExpert = useMemo(() => {
    if (!currentModule?.expertId) return experts[0] || null;
    return experts.find(e => e.id === currentModule.expertId) || experts[0] || null;
  }, [currentModule, experts]);

  // Module counts for current section
  const sectionModules = useMemo(() => {
    if (!currentSection) return [];
    return modules.filter(m => m.sectionId === currentSection.id);
  }, [currentSection, modules]);

  const completedModulesCount = useMemo(() => {
    return sectionModules.filter(m => 
      progress.some(p => p.moduleId === m.id && p.status === "completed")
    ).length;
  }, [sectionModules, progress]);

  const currentModuleIndex = useMemo(() => {
    if (!currentModule) return 1;
    const sorted = sectionModules.sort((a, b) => (a.order || 0) - (b.order || 0));
    const idx = sorted.findIndex(m => m.id === currentModule.id);
    return idx >= 0 ? idx + 1 : 1;
  }, [currentModule, sectionModules]);

  // Phase index
  const phaseIndex = useMemo(() => {
    if (!currentSection || !sections.length) return 1;
    const sorted = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));
    const idx = sorted.findIndex(s => s.id === currentSection.id);
    return idx >= 0 ? idx + 1 : 1;
  }, [currentSection, sections]);

  // Page progress for current module
  const currentModulePages = useMemo(() => {
    if (!currentModule) return { completed: 2, total: 4 };
    const moduleSubMods = subModules.filter(sm => sm.moduleId === currentModule.id);
    const completedSubs = subModuleProgress.filter(sp => 
      sp.moduleId === currentModule.id && sp.isComplete
    );
    return {
      completed: completedSubs.length || 0,
      total: moduleSubMods.length || 1,
    };
  }, [currentModule, subModules, subModuleProgress]);

  // Workbook data from submodules
  const workbooks = useMemo(() => {
    if (!currentSection) return [];
    const sectionMods = modules.filter(m => m.sectionId === currentSection.id);
    // Get submodules for these modules (using downloads as workbook proxy)
    const wbs = [];
    sectionMods.forEach(mod => {
      const modSubs = subModules.filter(sm => sm.moduleId === mod.id && sm.downloads?.length > 0);
      const expert = experts.find(e => e.id === mod.expertId);
      modSubs.forEach(sub => {
        const subProg = subModuleProgress.find(sp => sp.subModuleId === sub.id);
        let status = "not_started";
        if (subProg?.isComplete) status = "completed";
        else if (subProg?.watchedPercent > 0) status = "in_progress";
        wbs.push({
          title: sub.title,
          expert: expert?.name || "Expert",
          status,
        });
      });
    });
    return wbs.length > 0 ? wbs.slice(0, 3) : [];
  }, [currentSection, modules, subModules, subModuleProgress, experts]);

  // Spotlight expert (prefer experts in current phase, otherwise random)
  const spotlightExpert = useMemo(() => {
    if (!experts.length) return null;
    // Try to find one linked to current section modules
    if (currentSection) {
      const sectionMods = modules.filter(m => m.sectionId === currentSection.id);
      for (const mod of sectionMods) {
        const exp = experts.find(e => e.id === mod.expertId && e.id !== currentExpert?.id);
        if (exp) return exp;
      }
    }
    // Fallback: random expert different from current module expert
    const others = experts.filter(e => e.id !== currentExpert?.id);
    return others.length > 0 ? others[Math.floor(Math.random() * others.length)] : experts[0];
  }, [experts, currentSection, modules, currentExpert]);

  // Member since
  const memberSince = currentUser?.created_date
    ? new Date(currentUser.created_date).toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase()
    : "APRIL 2026";

  // Concerns from diagnostic
  const concerns = diagnosticSession?.concerns || [];
  const archetype = diagnosticSession?.primaryPhase
    ? `The ${diagnosticSession.primaryPhase} Woman`
    : null;

  const hasUnreadNotifications = notifications?.length > 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Left Sidebar */}
      <DashboardSidebar
        siteSettings={siteSettings}
        memberSince={memberSince}
        isBlueprintOwner={isBlueprintOwner}
      />

      {/* Main content area */}
      <div className="lg:ml-60">
        {/* Three-column grid */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Top bar with notifications + avatar on the right */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <DateLabel />
              <WelcomeHeader userName={currentUser?.full_name} />
            </div>
            <TopBar user={currentUser} hasUnreadNotifications={hasUnreadNotifications} />
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Centre column */}
            <div className="flex-1 min-w-0">
              <ContinueHero
                module={continueData.module}
                expert={continueData.expert}
                completedPages={continueData.completedPages}
                totalPages={continueData.totalPages}
                moduleIndex={continueData.moduleIndex}
                totalModules={continueData.totalModules}
                nextPageId={continueData.nextPageId}
              />

              <PhaseIndicator
                section={continueData.currentSection}
                completedModules={continueData.completedModulesInSection}
                totalModules={continueData.totalModulesInSection}
                phaseIndex={continueData.phaseIndex}
                totalPhases={continueData.totalSections}
              />

              <WhyYouStarted
                concerns={concerns}
                archetype={archetype}
                onViewIntake={() => setShowIntakeModal(true)}
              />

              <WorkbooksSection
                workbooks={workbooks}
                phaseIndex={phaseIndex}
              />

              <AskLaurAI userName={currentUser?.full_name} />
            </div>

            {/* Right column */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <CommunityTile
                posts={communityPosts}
                hasNewActivity={communityPosts?.length > 0}
              />
              <ExpertSpotlight expert={spotlightExpert} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <MobileTabBar />

      {/* Intake modal */}
      <IntakeModal
        isOpen={showIntakeModal}
        onClose={() => setShowIntakeModal(false)}
        concerns={concerns}
        archetype={archetype}
        diagnosticSession={diagnosticSession}
      />

      {/* LaurAI Chat Widget (preserved) */}
      <LaurAIChatWidget />
    </div>
  );
}