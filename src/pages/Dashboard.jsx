import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import IntakeCard from "@/components/dashboard/IntakeCard";
import ContinueCard from "@/components/dashboard/ContinueCard";
import CommunityCard from "@/components/dashboard/CommunityCard";
import ExpertCard from "@/components/dashboard/ExpertCard";
import LaurAIChatWidget from "@/components/LaurAIChatWidget";

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  // Diagnostic session (intake data)
  const { data: diagnosticSession } = useQuery({
    queryKey: ["diagnosticSession"],
    queryFn: async () => {
      const sessions = await base44.entities.DiagnosticSession.filter({ isComplete: true }, "-created_date", 1);
      return sessions[0] || null;
    },
  });

  // Get course progress data
  const { data: modules } = useQuery({
    queryKey: ["modules"],
    queryFn: () => base44.entities.Module.list("-updated_date", 10),
    initialData: [],
  });

  const { data: userModuleProgress } = useQuery({
    queryKey: ["userModuleProgress"],
    queryFn: () => base44.entities.UserModuleProgress.list(),
    initialData: [],
  });

  const { data: experts } = useQuery({
    queryKey: ["experts"],
    queryFn: () => base44.entities.Expert.filter({ isPublished: true }),
    initialData: [],
  });

  const { data: communityPosts } = useQuery({
    queryKey: ["communityPosts"],
    queryFn: () => base44.entities.CommunityPost.list("-created_date", 3),
    initialData: [],
  });

  // Get first incomplete module or default
  const currentModuleData = useMemo(() => {
    if (!modules.length) return { module: null, expert: null, completedPages: 0, totalPages: 0 };
    
    const incompleteModule = modules.find(m => {
      const progress = userModuleProgress.find(p => p.moduleId === m.id);
      return !progress || progress.status !== "Complete";
    }) || modules[0];

    const progress = userModuleProgress.find(p => p.moduleId === incompleteModule.id);
    const expert = incompleteModule.expertId ? experts.find(e => e.id === incompleteModule.expertId) : experts[0];

    return {
      module: incompleteModule,
      expert: expert || null,
      completedPages: progress?.videoWatchedPercent || 0,
      totalPages: 4,
    };
  }, [modules, userModuleProgress, experts]);

  // Member since date
  const memberSince = currentUser?.created_date
    ? new Date(currentUser.created_date).toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase()
    : "MAY 2026";

  // Random expert for spotlight
  const spotlightExpert = useMemo(() => {
    if (!experts.length) return null;
    return experts[Math.floor(Math.random() * experts.length)];
  }, [experts]);

  return (
    <div style={{ minHeight: "100vh", background: "white" }}>
      {/* Main container with left sidebar space */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "clamp(24px, 5vw, 40px)", paddingLeft: "clamp(24px, 5vw, 40px)" }}>
        
        {/* Header */}
        <DashboardHeader user={currentUser} />

        {/* Two-column layout: Left ~65%, Right ~35% */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "32px", alignItems: "start" }}>
          
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
              onContinue={() => console.log("Continue")}
            />

            {/* 3. Current Phase Card */}
            {diagnosticSession && (
              <div style={{ background: "white", border: "1px solid #f0f0f0", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}>
                <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B1B3D", marginBottom: "12px", fontFamily: "Montserrat, sans-serif" }}>
                  <span style={{ display: "inline-block", width: "12px", height: "1px", background: "#6B1B3D", marginRight: "8px" }} />
                  CURRENT PHASE . 04 OF 04
                </p>
                <div className="flex items-start gap-6">
                  <div>
                    <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "28px", color: "#1a1a1a", marginBottom: "4px", fontWeight: 400 }}>
                      {diagnosticSession.primaryPhase || "Embodiment"}
                    </h3>
                    <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: "italic", fontSize: "14px", color: "#888", marginBottom: "12px" }}>
                      Integration & mastery phase
                    </p>
                  </div>
                  <div style={{ marginLeft: "auto", textAlign: "center" }}>
                    <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B1B3D", marginBottom: "4px", fontFamily: "Montserrat, sans-serif" }}>
                      MODULES COMPLETE
                    </p>
                    <p style={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a", fontFamily: "Montserrat, sans-serif" }}>
                      0 / 4
                    </p>
                    <p style={{ fontSize: "11px", color: "#888", marginTop: "4px", fontFamily: "Montserrat, sans-serif" }}>
                      4 remaining
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Your Workbooks */}
            <div style={{ background: "white", border: "1px solid #f0f0f0", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center justify-between mb-6">
                <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B1B3D", fontFamily: "Montserrat, sans-serif" }}>
                  <span style={{ display: "inline-block", width: "12px", height: "1px", background: "#6B1B3D", marginRight: "8px" }} />
                  YOUR WORKBOOKS . PHASE 01
                </p>
                <a href="#" style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B1B3D", textDecoration: "none", fontFamily: "Montserrat, sans-serif" }}>
                  ALL WORKBOOKS →
                </a>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ background: "#FAF5F3", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                    <p style={{ fontSize: "24px", marginBottom: "8px" }}>📖</p>
                    <span style={{ display: "inline-block", fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", background: "#C4847A", color: "white", padding: "4px 8px", borderRadius: "4px", marginBottom: "8px", fontFamily: "Montserrat, sans-serif" }}>
                      IN PROGRESS
                    </span>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "#1a1a1a", marginBottom: "4px", fontFamily: "Montserrat, sans-serif" }}>
                      Workbook {i}
                    </p>
                    <p style={{ fontSize: "10px", color: "#888", marginBottom: "8px", fontFamily: "Montserrat, sans-serif" }}>
                      EXPERT NAME
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <a href="#" style={{ fontSize: "10px", fontWeight: 700, color: "#6B1B3D", textDecoration: "none", fontFamily: "Montserrat, sans-serif" }}>
                        CONTINUE
                      </a>
                      <span style={{ fontSize: "10px", color: "#aaa" }}>•</span>
                      <a href="#" style={{ fontSize: "10px", fontWeight: 700, color: "#6B1B3D", textDecoration: "none", fontFamily: "Montserrat, sans-serif" }}>
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
            <CommunityCard />

            {/* Expert This Week */}
            <ExpertCard expert={spotlightExpert} />

            {/* Member Since Badge */}
            <div style={{ textAlign: "center", marginTop: "32px", paddingTop: "24px", borderTop: "1px solid #f0f0f0" }}>
              <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", marginBottom: "4px", fontFamily: "Montserrat, sans-serif" }}>
                MEMBER SINCE {memberSince}
              </p>
              <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#C4847A", fontFamily: "Montserrat, sans-serif" }}>
                BLUEPRINT OWNER
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