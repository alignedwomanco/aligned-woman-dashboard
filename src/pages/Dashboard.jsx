import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { ArrowRight } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import IntakeCard from "@/components/dashboard/IntakeCard";
import ContinueCard from "@/components/dashboard/ContinueCard";
import CommunityCard from "@/components/dashboard/CommunityCard";
import ExpertCard from "@/components/dashboard/ExpertCard";
import LaurAIChatWidget from "@/components/LaurAIChatWidget";

// Known entity IDs
const BLUEPRINT_COURSE_ID = "69f4885c4fadbeea6d28a9be";
const PHASE_1_SECTION_ID = "69f4886c850c814862817d6b";
const WELCOME_SECTION_ID = "69f489b6873a93ae61729b8e";
const MODULE_1_ID = "69f48883716034047de26b98";

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  // Diagnostic session (intake data)
  const { data: diagnosticSession } = useQuery({
    queryKey: ["diagnosticSession"],
    queryFn: async () => {
      const sessions = await base44.entities.DiagnosticSession.filter(
        { isComplete: true },
        "-created_date",
        1
      );
      return sessions[0] || null;
    },
  });

  // Course progress: user's page-level completions, sorted by most recent first
  const { data: courseProgress = [] } = useQuery({
    queryKey: ["dashboard-courseProgress"],
    queryFn: () =>
      base44.entities.CourseProgress.filter(
        { courseId: BLUEPRINT_COURSE_ID },
        "-lastAccessedAt"
      ),
    initialData: [],
  });

  // All published modules for the Blueprint course
  const { data: courseModules = [] } = useQuery({
    queryKey: ["dashboard-courseModules"],
    queryFn: () =>
      base44.entities.CourseModule.filter(
        { courseId: BLUEPRINT_COURSE_ID, isPublished: true },
        "order"
      ),
    initialData: [],
  });

  // All pages for the Blueprint course (to count per-module completions)
  const { data: coursePages = [] } = useQuery({
    queryKey: ["dashboard-coursePages"],
    queryFn: () =>
      base44.entities.CoursePage.filter(
        { courseId: BLUEPRINT_COURSE_ID },
        "order"
      ),
    initialData: [],
  });

  // Experts (for ContinueCard and spotlight)
  const { data: experts = [] } = useQuery({
    queryKey: ["experts"],
    queryFn: () => base44.entities.Expert.filter({ isPublished: true }),
    initialData: [],
  });

  // Community posts (for sidebar card)
  const { data: communityPosts = [] } = useQuery({
    queryKey: ["communityPosts"],
    queryFn: () => base44.entities.CommunityPost.list("-created_date", 3),
    initialData: [],
  });

  // Phase progress computation
  const phaseData = useMemo(() => {
    // Modules that belong to Phase 1 (Awareness)
    const phase1Modules = courseModules.filter(
      (m) => m.sectionId === PHASE_1_SECTION_ID
    );
    const totalModules = phase1Modules.length || 4;

    // Build a set of completed page IDs
    const completedPageIds = new Set(
      courseProgress
        .filter((p) => p.status === "completed")
        .map((p) => p.pageId)
    );

    // A module is "complete" when ALL its published pages have been completed
    let completedModules = 0;
    for (const mod of phase1Modules) {
      const modPages = coursePages.filter(
        (p) => p.moduleId === mod.id && p.isPublished !== false
      );
      if (
        modPages.length > 0 &&
        modPages.every((page) => completedPageIds.has(page.id))
      ) {
        completedModules++;
      }
    }

    const hasProgress = courseProgress.length > 0;
    // Already sorted by -lastAccessedAt, so index 0 is most recent
    const latestProgress = courseProgress[0] || null;

    return {
      totalModules,
      completedModules,
      remaining: totalModules - completedModules,
      hasProgress,
      latestProgress,
    };
  }, [courseModules, coursePages, courseProgress]);

  // ContinueCard data: find the first incomplete module
  const currentModuleData = useMemo(() => {
    if (!courseModules.length) {
      return { module: null, expert: null, completedPages: 0, totalPages: 0 };
    }

    const completedPageIds = new Set(
      courseProgress
        .filter((p) => p.status === "completed")
        .map((p) => p.pageId)
    );

    // Find first module with at least one incomplete page
    let incompleteModule = null;
    for (const mod of courseModules) {
      const modPages = coursePages.filter((p) => p.moduleId === mod.id);
      const hasIncompletePage = modPages.some(
        (p) => !completedPageIds.has(p.id)
      );
      if (hasIncompletePage) {
        incompleteModule = mod;
        break;
      }
    }

    if (!incompleteModule) {
      incompleteModule = courseModules[0];
    }

    const modPages = coursePages.filter(
      (p) => p.moduleId === incompleteModule.id
    );
    const completedCount = modPages.filter((p) =>
      completedPageIds.has(p.id)
    ).length;

    const expert = incompleteModule.expertId
      ? experts.find((e) => e.id === incompleteModule.expertId)
      : experts[0];

    return {
      module: incompleteModule,
      expert: expert || null,
      completedPages: completedCount,
      totalPages: modPages.length || 4,
    };
  }, [courseModules, coursePages, courseProgress, experts]);

  // Member since date
  const memberSince = currentUser?.created_date
    ? new Date(currentUser.created_date)
        .toLocaleDateString("en-US", { month: "long", year: "numeric" })
        .toUpperCase()
    : "MAY 2026";

  // Random expert for spotlight
  const spotlightExpert = useMemo(() => {
    if (!experts.length) return null;
    return experts[Math.floor(Math.random() * experts.length)];
  }, [experts]);

  // Navigation handler for the phase card button
  const handlePhaseButtonClick = () => {
    if (!phaseData.hasProgress) {
      // New user: navigate to Phase 1 section overview
      navigate(
        createPageUrl("SectionDetail") +
          `?sectionId=${PHASE_1_SECTION_ID}&courseId=${BLUEPRINT_COURSE_ID}`
      );
    } else {
      // Returning user: navigate to their most recently accessed module
      const latest = phaseData.latestProgress;
      if (latest?.moduleId) {
        navigate(
          createPageUrl("ModulePlayer") +
            `?moduleId=${latest.moduleId}&courseId=${BLUEPRINT_COURSE_ID}`
        );
      } else {
        // Fallback: go to Phase 1 section
        navigate(
          createPageUrl("SectionDetail") +
            `?sectionId=${PHASE_1_SECTION_ID}&courseId=${BLUEPRINT_COURSE_ID}`
        );
      }
    }
  };

  // Navigation handler for the ContinueCard
  const handleContinue = () => {
    if (currentModuleData.module) {
      navigate(
        createPageUrl("ModulePlayer") +
          `?moduleId=${currentModuleData.module.id}&courseId=${BLUEPRINT_COURSE_ID}`
      );
    } else {
      navigate(
        createPageUrl("SectionDetail") +
          `?sectionId=${PHASE_1_SECTION_ID}&courseId=${BLUEPRINT_COURSE_ID}`
      );
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "white" }}>
      {/* Main container with left sidebar space */}
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "clamp(24px, 5vw, 40px)",
          paddingLeft: "clamp(24px, 5vw, 40px)",
        }}
      >
        {/* Header */}
        <DashboardHeader user={currentUser} />

        {/* Two-column layout: Left ~65%, Right ~35% */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: "32px",
            alignItems: "start",
          }}
        >
          {/* LEFT COLUMN */}
          <div>
            {/* 1. Intake Card */}
            <IntakeCard
              diagnosticSession={diagnosticSession}
              onEdit={() => console.log("Edit intake")}
              onRetake={() => console.log("Retake quiz")}
            />

            {/* 2. Continue Where You Left Off */}
            <ContinueCard
              module={currentModuleData.module}
              expert={currentModuleData.expert}
              completedPages={currentModuleData.completedPages}
              totalPages={currentModuleData.totalPages}
              onContinue={handleContinue}
            />

            {/* 3. Current Phase Card */}
            {diagnosticSession && (
              <div
                style={{
                  background: "white",
                  border: "1px solid #f0f0f0",
                  borderRadius: "16px",
                  padding: "24px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  marginBottom: "24px",
                }}
              >
                <p
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "#6B1B3D",
                    marginBottom: "12px",
                    fontFamily: "Montserrat, sans-serif",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: "12px",
                      height: "1px",
                      background: "#6B1B3D",
                      marginRight: "8px",
                    }}
                  />
                  CURRENT PHASE . 01 OF 04
                </p>
                <div className="flex items-start gap-6">
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontFamily: "'DM Serif Display', Georgia, serif",
                        fontSize: "28px",
                        color: "#1a1a1a",
                        marginBottom: "4px",
                        fontWeight: 400,
                      }}
                    >
                      Awareness
                    </h3>
                    <p
                      style={{
                        fontFamily: "'DM Serif Display', Georgia, serif",
                        fontStyle: "italic",
                        fontSize: "14px",
                        color: "#888",
                        marginBottom: "16px",
                      }}
                    >
                      "My body is not working against me. It is speaking to me."
                    </p>
                    <button
                      onClick={handlePhaseButtonClick}
                      style={{
                        background: "#6B1B3D",
                        color: "white",
                        border: "none",
                        borderRadius: "100px",
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        fontFamily: "Montserrat, sans-serif",
                        padding: "10px 24px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {phaseData.hasProgress ? "CONTINUE PHASE" : "START PHASE 1"}
                      <ArrowRight style={{ width: "14px", height: "14px" }} />
                    </button>
                  </div>
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <p
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "#6B1B3D",
                        marginBottom: "4px",
                        fontFamily: "Montserrat, sans-serif",
                      }}
                    >
                      MODULES COMPLETE
                    </p>
                    <p
                      style={{
                        fontSize: "24px",
                        fontWeight: 700,
                        color: "#1a1a1a",
                        fontFamily: "Montserrat, sans-serif",
                      }}
                    >
                      {phaseData.completedModules} / {phaseData.totalModules}
                    </p>
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#888",
                        marginTop: "4px",
                        fontFamily: "Montserrat, sans-serif",
                      }}
                    >
                      {phaseData.remaining} remaining
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Your Workbooks */}
            <div
              style={{
                background: "white",
                border: "1px solid #f0f0f0",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <p
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "#6B1B3D",
                    fontFamily: "Montserrat, sans-serif",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: "12px",
                      height: "1px",
                      background: "#6B1B3D",
                      marginRight: "8px",
                    }}
                  />
                  YOUR WORKBOOKS . PHASE 01
                </p>
                <a
                  href="#"
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#6B1B3D",
                    textDecoration: "none",
                    fontFamily: "Montserrat, sans-serif",
                  }}
                >
                  ALL WORKBOOKS →
                </a>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "16px",
                }}
              >
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      background: "#FAF5F3",
                      borderRadius: "12px",
                      padding: "16px",
                      textAlign: "center",
                    }}
                  >
                    <p style={{ fontSize: "24px", marginBottom: "8px" }}>📖</p>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "9px",
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        background: "#C4847A",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        marginBottom: "8px",
                        fontFamily: "Montserrat, sans-serif",
                      }}
                    >
                      IN PROGRESS
                    </span>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#1a1a1a",
                        marginBottom: "4px",
                        fontFamily: "Montserrat, sans-serif",
                      }}
                    >
                      Workbook {i}
                    </p>
                    <p
                      style={{
                        fontSize: "10px",
                        color: "#888",
                        marginBottom: "8px",
                        fontFamily: "Montserrat, sans-serif",
                      }}
                    >
                      EXPERT NAME
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <a
                        href="#"
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          color: "#6B1B3D",
                          textDecoration: "none",
                          fontFamily: "Montserrat, sans-serif",
                        }}
                      >
                        CONTINUE
                      </a>
                      <span style={{ fontSize: "10px", color: "#aaa" }}>•</span>
                      <a
                        href="#"
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          color: "#6B1B3D",
                          textDecoration: "none",
                          fontFamily: "Montserrat, sans-serif",
                        }}
                      >
                        PDF
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div>
            {/* Community Card */}
            <CommunityCard posts={communityPosts} />

            {/* Expert Spotlight */}
            {spotlightExpert && <ExpertCard expert={spotlightExpert} />}

            {/* Membership status */}
            <div
              style={{
                background: "#FAF5F3",
                borderRadius: "16px",
                padding: "16px",
                textAlign: "center",
                marginTop: "16px",
              }}
            >
              <p
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#6B1B3D",
                  marginBottom: "4px",
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                MEMBER SINCE
              </p>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#1a1a1a",
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                {memberSince}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* LaurAI Chat Widget */}
      <LaurAIChatWidget />
    </div>
  );
}