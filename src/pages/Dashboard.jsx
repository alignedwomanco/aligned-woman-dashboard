import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { daysBetweenDates, isSameDay } from "@/components/utils/dateUtils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import PersonalizedLearningPath from "@/components/dashboard/PersonalizedLearningPath";
import DailySnapshotCard from "@/components/dashboard/DailySnapshotCard";
import WeeklySnapshotCard from "@/components/dashboard/WeeklySnapshotCard";
import MonthlySnapshotCard from "@/components/dashboard/MonthlySnapshotCard";
import { DASHBOARD_CONSTANTS, ALIVE_PHASES, SNAPSHOT_VIEWS } from "@/components/dashboard/constants";
import SystemDetailDrawer from "@/components/dashboard/SystemDetailDrawer";
import {
  Sparkles,
  Target,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Heart,
  Smile,
  Moon,
  Edit3,
  Activity,
  Calendar,
  Play,
  Clock,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Waves,
} from "lucide-react";

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [snapshotView, setSnapshotView] = useState(SNAPSHOT_VIEWS.DAILY);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [snapshotData, setSnapshotData] = useState(null);
  const [isGeneratingSnapshot, setIsGeneratingSnapshot] = useState(false);
  const [lauraiQuestion, setLauraiQuestion] = useState("");
  const [lauraiResponse, setLauraiResponse] = useState("");
  const [isLauraiThinking, setIsLauraiThinking] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [systemData, setSystemData] = useState({});

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setCurrentUser(userData);
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    };
    loadUser();
  }, []);

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

  const { data: moduleProgress } = useQuery({
    queryKey: ["moduleProgress"],
    queryFn: () => base44.entities.UserModuleProgress.list("-updated_date"),
    initialData: [],
  });

  const { data: checkIns } = useQuery({
    queryKey: ["checkIns"],
    queryFn: () => base44.entities.CheckIn.list("-created_date", DASHBOARD_CONSTANTS.RECENT_CHECKINS_LIMIT),
    initialData: [],
  });

  const { data: journalEntries } = useQuery({
    queryKey: ["journalEntries"],
    queryFn: () => base44.entities.JournalEntry.list("-created_date", DASHBOARD_CONSTANTS.RECENT_JOURNAL_ENTRIES_LIMIT),
    initialData: [],
  });

  const { data: purposeRuns } = useQuery({
    queryKey: ["purposeRuns"],
    queryFn: () =>
      base44.entities.ToolRun.filter(
        { toolSlug: "define-my-purpose", status: "Complete" },
        "-completed_date",
        1
      ),
    initialData: [],
  });

  const { data: userPoints } = useQuery({
    queryKey: ["userPoints"],
    queryFn: async () => {
      const points = await base44.entities.UserPoints.filter({});
      return points[0] || null;
    },
    enabled: !!currentUser,
  });

  const completedModules = moduleProgress?.filter((p) => p.status === "Complete").length || 0;
  const completedModulesList = moduleProgress?.filter((p) => p.status === "Complete") || [];
  const inProgressModule = moduleProgress?.find((p) => p.status === "InProgress");
  const checkInStreak = checkIns?.length || 0;
  const latestCheckIn = checkIns?.[0];
  const latestPurposeRun = purposeRuns?.[0];

  // Generate personalized recommendations
  const recommendedModules = useMemo(() => {
    return diagnosticSession?.recommendedModules?.slice(0, DASHBOARD_CONSTANTS.RECOMMENDED_MODULES_LIMIT).map((title, index) => ({
      id: `rec-${index}`,
      title,
      phase: diagnosticSession.primaryPhase || ALIVE_PHASES.AWARENESS,
      duration: 45,
      summary: `Recommended based on your ${diagnosticSession.primaryPhase} phase focus`,
      isRecommended: true,
      pointsReward: 20,
    })) || [];
  }, [diagnosticSession]);
  
  const canRerunPurpose = () => {
    if (!latestPurposeRun?.completedAt) return true;
    const daysSince = daysBetweenDates(latestPurposeRun.completedAt, new Date());
    return daysSince >= DASHBOARD_CONSTANTS.PURPOSE_RERUN_COOLDOWN_DAYS;
  };

  const { data: allModules } = useQuery({
    queryKey: ["allModules"],
    queryFn: () => base44.entities.Module.list(),
    initialData: [],
  });

  const phaseProgress = useMemo(() => {
    const phases = Object.values(ALIVE_PHASES);
    const progress = {};
    
    phases.forEach(phase => {
      const modulesInPhase = allModules.filter(m => m.phase === phase);
      const completedInPhase = moduleProgress.filter(p => 
        p.status === "Complete" && 
        modulesInPhase.some(m => m.id === p.moduleId)
      );
      progress[phase] = modulesInPhase.length > 0 
        ? Math.round((completedInPhase.length / modulesInPhase.length) * 100)
        : 0;
    });
    
    return progress;
  }, [allModules, moduleProgress]);

  useEffect(() => {
    if (diagnosticSession?.snapshotFrequency) {
      setSnapshotView(diagnosticSession.snapshotFrequency);
    }
  }, [diagnosticSession]);

  const needsCheckIn = useMemo(() => {
    if (!diagnosticSession?.lastCheckInDate) return true;
    return !isSameDay(diagnosticSession.lastCheckInDate, new Date());
  }, [diagnosticSession]);

  // Generate dynamic snapshot
  const generateSnapshot = async () => {
    if (!diagnosticSession || !currentUser) return;
    
    setIsGeneratingSnapshot(true);
    
    try {
      const latestCheckIn = checkIns?.[0];
      const cyclePhase = diagnosticSession?.cycleProfile?.cycleStage === "Cycling" 
        ? (latestCheckIn?.cycle_phase || "Luteal")
        : diagnosticSession?.cycleProfile?.cycleStage || "Not tracking";
      
      const nervousSystemState = latestCheckIn?.nervous_system_state || "Fawn";
      const capacityScore = latestCheckIn?.capacity || diagnosticSession?.capacityScore || 5.5;
      const energyLevel = latestCheckIn?.energy || 5;
      const stressLevel = latestCheckIn?.stress || 5;
      
      const prompt = `You are generating a personalized Daily ALIVE Snapshot for ${currentUser.full_name}.

USER CONTEXT:
- Human Design: Type: ${diagnosticSession.humanDesignProfile?.type || "Projector"}, Authority: ${diagnosticSession.humanDesignProfile?.authority || "Emotional"}
- Cycle Phase: ${cyclePhase}
- Nervous System State: ${nervousSystemState}
- ALIVE Phase: Primary - ${diagnosticSession.primaryPhase || "Intention"}, Secondary - ${diagnosticSession.secondaryPhase || "Liberation"}
- Capacity Score: ${capacityScore}/10
- Energy Level: ${energyLevel}/10
- Stress Level: ${stressLevel}/10
- Recent Context: ${diagnosticSession.userContextText || "No recent context"}
- Core Values: ${diagnosticSession.values?.join(", ") || "Not specified"}
- Current Concerns: ${diagnosticSession.concerns?.join(", ") || "General wellbeing"}

GENERATE:
1. A scrollable 3-4 paragraph narrative that weaves together:
   - How their cycle phase affects capacity today
   - What their nervous system state means for their decisions
   - How their Human Design suggests they respond (not push)
   - What their ALIVE phase indicates about their growth journey
   - Normalize low capacity - it's biological, not failure

2. A short guiding phrase (5-8 words) based on their state

3. Icon explanations for: Cycle, Nervous System, Human Design, ALIVE Phase

The tone must be:
- Warm, not clinical
- Normalizing, not diagnosing
- Systemic (connecting patterns), not isolated advice

NO TWO SNAPSHOTS SHOULD BE IDENTICAL. Reference today's date, energy patterns, and make it feel personalized.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            narrative: { type: "string" },
            guidingPhrase: { type: "string" },
            iconExplanations: {
              type: "object",
              properties: {
                cycle: { type: "string" },
                nervousSystem: { type: "string" },
                humanDesign: { type: "string" },
                alivePhase: { type: "string" }
              }
            }
          }
        }
      });
      
      setSnapshotData({
        ...result,
        cyclePhase,
        nervousSystemState,
        capacityScore,
        humanDesign: diagnosticSession.humanDesignProfile,
        alivePhase: diagnosticSession.primaryPhase || "Intention",
        astrology: diagnosticSession.astrologyProfile
      });
    } catch (error) {
      console.error("Failed to generate snapshot:", error);
    } finally {
      setIsGeneratingSnapshot(false);
    }
  };

  // Generate snapshot on load or when view changes
  useEffect(() => {
    if (diagnosticSession && currentUser && !snapshotData) {
      generateSnapshot();
    }
  }, [diagnosticSession, currentUser, snapshotView]);

  // Handle LaurAI questions
  const askLaurAI = async (question) => {
    if (!question.trim() || !snapshotData) return;
    
    setIsLauraiThinking(true);
    setLauraiResponse("");
    
    try {
      const contextPrompt = `You are LaurAI, a personalized wellness assistant integrated with The Aligned Woman Blueprint.

CRITICAL CONTEXT (Must reference in every response):
- User: ${currentUser.full_name}
- Today's Date: ${new Date().toLocaleDateString()}
- Cycle Phase: ${snapshotData.cyclePhase}
- Nervous System State: ${snapshotData.nervousSystemState}
- Capacity: ${snapshotData.capacityScore}/10
- Human Design Type: ${snapshotData.humanDesign?.type || "Projector"}
- Human Design Authority: ${snapshotData.humanDesign?.authority || "Emotional"}
- ALIVE Phase: ${snapshotData.alivePhase}
- Recent Concerns: ${diagnosticSession.concerns?.join(", ") || "General wellbeing"}

TODAY'S SNAPSHOT SUMMARY:
${snapshotData.narrative}

USER QUESTION: "${question}"

RESPONSE REQUIREMENTS:
- Reference their current cycle, nervous system, or capacity
- Normalize reduced capacity - it's biological
- Connect to their ALIVE phase
- Never contradict today's snapshot
- Keep responses warm, grounded, and brief (2-3 paragraphs max)
- Make it feel like you understand TODAY specifically, not generic advice`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: contextPrompt
      });
      
      setLauraiResponse(response);
    } catch (error) {
      console.error("LaurAI error:", error);
      setLauraiResponse("I'm having trouble connecting right now. Please try again.");
    } finally {
      setIsLauraiThinking(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setLauraiQuestion(question);
    askLaurAI(question);
  };

  const handleCustomQuestion = () => {
    askLaurAI(lauraiQuestion);
  };

  // Generate dynamic system data
  const generateSystemData = async (system) => {
    if (!diagnosticSession || !currentUser) return;
    
    const latestCheckIn = checkIns?.[0];
    const cyclePhase = diagnosticSession?.cycleProfile?.cycleStage === "Cycling" 
      ? (latestCheckIn?.cycle_phase || "Luteal")
      : diagnosticSession?.cycleProfile?.cycleStage || "Not tracking";
    
    const nervousSystemState = latestCheckIn?.nervous_system_state || "Fawn";
    const capacityScore = latestCheckIn?.capacity || diagnosticSession?.capacityScore || 5.5;
    
    const systemPrompts = {
      nervous_system: `Generate guidance for Nervous System state: ${nervousSystemState}, Capacity: ${capacityScore}/10, Recent stress: ${latestCheckIn?.stress || 5}/10`,
      human_design: `Generate guidance for Human Design Type: ${diagnosticSession.humanDesignProfile?.type || "Projector"}, Authority: ${diagnosticSession.humanDesignProfile?.authority || "Emotional"}, ALIVE Phase: ${diagnosticSession.primaryPhase}`,
      cycle: `Generate guidance for Cycle Phase: ${cyclePhase}, Capacity: ${capacityScore}/10, Energy: ${latestCheckIn?.energy || 5}/10`,
      astrology: `Generate guidance for Astrology: Sun ${diagnosticSession.astrologyProfile?.sunSign || "Sagittarius"}, Moon ${diagnosticSession.astrologyProfile?.moonSign || "Unknown"}, Current transits`
    };

    const prompt = `You are generating system-specific guidance for ${currentUser.full_name}.

SYSTEM: ${system.replace('_', ' ').toUpperCase()}
${systemPrompts[system]}

GENERATE:
1. A 2-3 sentence summary of their current state in this system
2. Today's guidance (one clear statement)
3. 3-5 things that help today (short phrases)
4. 2-4 things to avoid today (short phrases)

Format: JSON with keys: summary, guidance, helps (array), avoid (array)`;

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            guidance: { type: "string" },
            helps: { type: "array", items: { type: "string" } },
            avoid: { type: "array", items: { type: "string" } }
          }
        }
      });

      const systemSpecificData = {
        nervous_system: {
          state: nervousSystemState,
          recentPattern: checkIns?.length > 3 ? "Variable stress patterns" : "Stable",
          actions: [
            { label: "Log how you feel", onClick: () => window.location.href = createPageUrl("CheckIn") },
            { label: "3-min reset", onClick: () => {} }
          ]
        },
        human_design: {
          type: diagnosticSession.humanDesignProfile?.type || "Projector",
          authority: diagnosticSession.humanDesignProfile?.authority || "Emotional",
          strategy: diagnosticSession.humanDesignProfile?.strategy || "Wait for invitation"
        },
        cycle: {
          phase: cyclePhase,
          dayOfCycle: latestCheckIn?.cycle_day || "Unknown",
          capacityGuidance: capacityScore < 5 ? "Lower capacity phase" : "Higher capacity phase",
          actions: [
            { label: "Log symptoms", onClick: () => {} },
            { label: "Plan by phase", onClick: () => {} }
          ]
        },
        astrology: {
          currentSign: diagnosticSession.astrologyProfile?.sunSign || "Sagittarius",
          theme: "Vision and expansion",
          emotionalTone: "Optimistic with need for refinement"
        }
      };

      setSystemData({
        ...result,
        ...systemSpecificData[system]
      });
    } catch (error) {
      console.error("Failed to generate system data:", error);
    }
  };

  const handleSystemClick = async (system) => {
    setSelectedSystem(system);
    await generateSystemData(system);
  };

  const { data: relevantCourses = [] } = useQuery({
    queryKey: ["relevantCourses", selectedSystem],
    queryFn: async () => {
      if (!selectedSystem) return [];
      const courses = await base44.entities.Course.list();
      // Filter based on system - simplified logic
      return courses.slice(0, 3);
    },
    enabled: !!selectedSystem
  });

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good Morning", emoji: "☀️" };
    if (hour < 17) return { text: "Good Afternoon", emoji: "🌤️" };
    return { text: "Good Evening", emoji: "🌙" };
  };

  const greeting = getGreeting();

  // Apply background
  useEffect(() => {
    const bg = currentUser?.background_image || '#FBF4FD';
    if (bg.startsWith('#')) {
      document.body.style.backgroundColor = bg;
      document.body.style.backgroundImage = "none";
    } else if (bg.startsWith('data:image/svg+xml')) {
      document.body.style.backgroundImage = `url("${bg}")`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundAttachment = "fixed";
      document.body.style.backgroundColor = "transparent";
    } else {
      document.body.style.backgroundImage = `url(${bg})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundAttachment = "fixed";
      document.body.style.backgroundColor = "transparent";
    }
  }, [currentUser?.background_image]);

  // Mock stress/energy calendar data (would come from CheckIn entities)
  const stressCalendarData = useMemo(() => {
    const data = {};
    checkIns?.forEach(checkIn => {
      const date = new Date(checkIn.created_date).toLocaleDateString();
      data[date] = {
        stress: checkIn.stress,
        energy: checkIn.energy,
        regulated: checkIn.stress < 5
      };
    });
    return data;
  }, [checkIns]);

  if (!diagnosticSession) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6">
        <div className="max-w-4xl mx-auto pt-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-[#3B224E] to-[#4A2B5E] rounded-full flex items-center justify-center mx-auto mb-8">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-[#3B224E] mb-4">
              Welcome{currentUser?.full_name ? `, ${currentUser.full_name.split(" ")[0]}` : ""}!
            </h1>
            <p className="text-xl text-gray-600 max-w-xl mx-auto mb-8">
              Let's build your personalised ALIVE Pathway. Complete a short diagnostic so we can prescribe exactly what you need.
            </p>
            <Link to={createPageUrl("OnboardingForm")}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#3B224E] to-[#4A2B5E] hover:from-[#1F0B2E] hover:to-[#3B224E] text-white px-10 py-6 text-lg font-semibold rounded-full shadow-xl"
              >
                Begin Your Diagnostic
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const getSnapshotContent = () => {
    if (snapshotView === SNAPSHOT_VIEWS.WEEKLY) {
      return <WeeklySnapshotCard diagnosticSession={diagnosticSession} />;
    }

    if (snapshotView === SNAPSHOT_VIEWS.MONTHLY) {
      return <MonthlySnapshotCard diagnosticSession={diagnosticSession} />;
    }

    return <DailySnapshotCard diagnosticSession={diagnosticSession} needsCheckIn={needsCheckIn} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {greeting.text}, {currentUser?.full_name?.split(" ")[0] || "there"} {greeting.emoji}
          </h1>
          <p className="text-gray-600">Here's your personalized snapshot for today</p>
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Snapshot + Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Snapshot */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-purple-100 to-indigo-100 border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      Your ALIVE Snapshot
                    </CardTitle>
                    <Tabs value={snapshotView} onValueChange={setSnapshotView}>
                      <TabsList className="bg-white/50">
                        <TabsTrigger value={SNAPSHOT_VIEWS.DAILY}>Daily</TabsTrigger>
                        <TabsTrigger value={SNAPSHOT_VIEWS.WEEKLY}>Weekly</TabsTrigger>
                        <TabsTrigger value={SNAPSHOT_VIEWS.MONTHLY}>Monthly</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardHeader>
                <CardContent>
                  {getSnapshotContent()}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link to={createPageUrl("CheckIn")}>
                      <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                        <Heart className="w-6 h-6 text-pink-500" />
                        <span className="text-xs">Check In</span>
                        {needsCheckIn && <Badge variant="destructive" className="text-xs">Due</Badge>}
                      </Button>
                    </Link>
                    <Link to={createPageUrl("Journal")}>
                      <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                        <Edit3 className="w-6 h-6 text-blue-500" />
                        <span className="text-xs">Journal</span>
                      </Button>
                    </Link>
                    <Link to={createPageUrl("DefineMyPurpose")}>
                      <Button 
                        variant="outline" 
                        className="w-full h-24 flex flex-col gap-2"
                        disabled={!canRerunPurpose()}
                      >
                        <Target className="w-6 h-6 text-purple-500" />
                        <span className="text-xs">Purpose</span>
                        {latestPurposeRun && <Badge variant="secondary" className="text-xs">Done</Badge>}
                      </Button>
                    </Link>
                    <Link to={createPageUrl("Classroom")}>
                      <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                        <TrendingUp className="w-6 h-6 text-green-500" />
                        <span className="text-xs">Learn</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Learning Path */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <PersonalizedLearningPath 
                recommendedModules={recommendedModules}
                completedModules={completedModulesList}
                checkInStreak={checkInStreak}
                points={userPoints}
              />
            </motion.div>
          </div>

          {/* Right Column - Stats & Progress */}
          <div className="space-y-6">
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Modules Completed</span>
                      <span className="font-semibold">{completedModules}</span>
                    </div>
                    <Progress value={(completedModules / 20) * 100} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Check-in Streak</span>
                      <span className="font-semibold">{checkInStreak} days</span>
                    </div>
                    <Progress value={(checkInStreak / 30) * 100} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Points</span>
                      <span className="font-semibold">{userPoints?.total_points || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ALIVE Phase Progress */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ALIVE Journey</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(phaseProgress).map(([phase, progress]) => (
                    <div key={phase} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{phase}</span>
                        <span className="text-gray-600">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {latestCheckIn && (
                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                      <Heart className="w-4 h-4 text-purple-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Daily Check-In</p>
                        <p className="text-xs text-gray-600">
                          Energy: {latestCheckIn.energy}/10 • Mood: {latestCheckIn.mood}/10
                        </p>
                      </div>
                    </div>
                  )}
                  {journalEntries?.[0] && (
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <Edit3 className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Journal Entry</p>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {journalEntries[0].entry?.substring(0, 60)}...
                        </p>
                      </div>
                    </div>
                  )}
                  {inProgressModule && (
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">In Progress</p>
                        <p className="text-xs text-gray-600">Continue learning</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}