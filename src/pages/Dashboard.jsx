import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { createPageUrl, daysBetweenDates, isSameDay } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PersonalizedLearningPath from "@/components/dashboard/PersonalizedLearningPath";
import DailySnapshotCard from "@/components/dashboard/DailySnapshotCard";
import WeeklySnapshotCard from "@/components/dashboard/WeeklySnapshotCard";
import MonthlySnapshotCard from "@/components/dashboard/MonthlySnapshotCard";
import { DASHBOARD_CONSTANTS, ALIVE_PHASES, SNAPSHOT_VIEWS } from "@/components/dashboard/constants";
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
} from "lucide-react";

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [snapshotView, setSnapshotView] = useState(SNAPSHOT_VIEWS.DAILY);

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

  // If no diagnostic completed, show onboarding prompt
  if (!diagnosticSession) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white p-6">
        <div className="max-w-4xl mx-auto pt-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-[#6B1B3D] to-[#8B2E4D] rounded-full flex items-center justify-center mx-auto mb-8">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-[#4A1228] mb-4">
              Welcome{currentUser?.full_name ? `, ${currentUser.full_name.split(" ")[0]}` : ""}!
            </h1>
            <p className="text-xl text-gray-600 max-w-xl mx-auto mb-8">
              Let's build your personalised ALIVE Pathway. Complete a short diagnostic so we can prescribe exactly what you need.
            </p>
            <Link to={createPageUrl("OnboardingForm")}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#6B1B3D] to-[#8B2E4D] hover:from-[#4A1228] hover:to-[#6B1B3D] text-white px-10 py-6 text-lg font-semibold rounded-full shadow-xl"
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

  const needsCheckIn = useMemo(() => {
    if (!diagnosticSession?.lastCheckInDate) return true;
    return !isSameDay(diagnosticSession.lastCheckInDate, new Date());
  }, [diagnosticSession]);

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
    <div className="min-h-screen p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold text-[#4A1228] mb-2">
            Welcome back{currentUser?.full_name ? `, ${currentUser.full_name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-gray-600">Your personalised ALIVE operating system.</p>
        </motion.div>

        {/* ALIVE Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-[#6B1B3D] to-[#4A1228] border-0 overflow-hidden">
            <CardContent className="p-8 relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-rose-300" />
                  <span className="text-rose-200 font-medium">Your ALIVE Profile</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Primary: {diagnosticSession?.primaryPhase || ALIVE_PHASES.AWARENESS}
                </h2>
                <div className="flex flex-wrap gap-3">
                  <Badge className="bg-white/20 text-white border-0 px-4 py-2">
                    Capacity: {diagnosticSession?.capacityScore || 7}/10
                  </Badge>
                  <Badge className="bg-rose-500/30 text-rose-200 border-0 px-4 py-2">
                    Secondary: {diagnosticSession?.secondaryPhase || ALIVE_PHASES.LIBERATION}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 2-Column Layout: Snapshot + Purpose */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column: Today's Snapshot */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs value={snapshotView} onValueChange={setSnapshotView}>
              <TabsList className="mb-4">
                <TabsTrigger value={SNAPSHOT_VIEWS.DAILY}>Daily</TabsTrigger>
                <TabsTrigger value={SNAPSHOT_VIEWS.WEEKLY}>Weekly</TabsTrigger>
                <TabsTrigger value={SNAPSHOT_VIEWS.MONTHLY}>Monthly</TabsTrigger>
              </TabsList>
              <TabsContent value={snapshotView}>
                {getSnapshotContent()}
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Right Column: Purpose Tool */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#6B1B3D]" />
                  My Purpose
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!latestPurposeRun ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Sparkles className="w-10 h-10 text-[#6B1B3D]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#4A1228] mb-3">
                      Define My Purpose
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                      Uncover the masks you wear and the truth you are ready to live
                    </p>
                    <Link to={createPageUrl("DefineMyPurpose")}>
                      <Button className="bg-gradient-to-r from-[#6B1B3D] to-[#8B2E4D] hover:from-[#4A1228] hover:to-[#6B1B3D] text-white px-8 py-6">
                        <Sparkles className="w-5 h-5 mr-2" />
                        Begin Journey
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-100">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-semibold text-green-700">
                          Completed{" "}
                          {new Date(latestPurposeRun.completedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-semibold text-[#4A1228] mb-2">
                        Your Purpose Report is Ready
                      </h4>
                      <p className="text-gray-600 text-sm">
                        View your personalized insights and higher self guidance.
                      </p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <Link to={createPageUrl("DefineMyPurpose")}>
                        <Button className="w-full bg-[#6B1B3D] hover:bg-[#4A1228] text-white">
                          View Purpose Report
                        </Button>
                      </Link>
                      {canRerunPurpose() && (
                        <Link to={createPageUrl("DefineMyPurpose")}>
                          <Button variant="outline" className="w-full border-[#6B1B3D] text-[#6B1B3D] hover:bg-pink-50">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Redefine My Purpose
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Your ALIVE Path */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-10"
        >
          <Card className="bg-gradient-to-br from-[#6B1B3D] to-[#4A1228] border-0 text-white">
            <CardContent className="p-8">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-rose-300" />
                <h2 className="text-2xl font-bold">Your ALIVE Path</h2>
              </div>
              {diagnosticSession.aliveNarrative && (
                <p className="text-white/90 mb-4 leading-relaxed">
                  {diagnosticSession.aliveNarrative}
                </p>
              )}
              {diagnosticSession.phaseFocusAdvice && (
                <div className="bg-white/10 p-4 rounded-xl mb-4">
                  <p className="text-white/90">{diagnosticSession.phaseFocusAdvice}</p>
                </div>
              )}
              {diagnosticSession.recommendedModules && diagnosticSession.recommendedModules.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-rose-200 mb-2">Recommended for You</h3>
                  <div className="space-y-2">
                    {diagnosticSession.recommendedModules.slice(0, DASHBOARD_CONSTANTS.RECOMMENDED_MODULES_LIMIT).map((module, i) => (
                      <div key={i} className="flex items-center gap-2 text-white/80 text-sm">
                        <CheckCircle className="w-4 h-4 text-rose-300" />
                        {module}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Link to={createPageUrl("MyPathway")}>
                <Button className="bg-white text-[#6B1B3D] hover:bg-white/90">
                  Continue Your Path <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Personalized Learning Path */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-10"
        >
          <PersonalizedLearningPath
            userPoints={userPoints}
            completedModules={completedModulesList}
            recommendedModules={recommendedModules}
          />
        </motion.div>

        {/* Cycle & Body Intelligence */}
        {diagnosticSession.dailySnapshot?.cycleInsight && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-10"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  Your Cycle & Body Today
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-xl">
                  <h3 className="text-sm font-semibold text-purple-900 mb-2">Phase Wisdom</h3>
                  <p className="text-gray-700">{diagnosticSession.dailySnapshot.cycleInsight}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {diagnosticSession.dailySnapshot.exerciseRecommendation && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Movement</h3>
                      <p className="text-gray-600 text-sm">{diagnosticSession.dailySnapshot.exerciseRecommendation}</p>
                    </div>
                  )}
                  {diagnosticSession.dailySnapshot.nutritionRecommendation && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Nutrition</h3>
                      <p className="text-gray-600 text-sm">{diagnosticSession.dailySnapshot.nutritionRecommendation}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Design & Energetics */}
        {diagnosticSession.enableDeepPersonalisation && (diagnosticSession.astrologyProfile || diagnosticSession.humanDesignProfile) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-10"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  Your Design & Energetics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {diagnosticSession.humanDesignProfile && (
                  <div className="bg-amber-50 p-4 rounded-xl">
                    <h3 className="text-sm font-semibold text-amber-900 mb-2">Human Design</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge className="bg-amber-200 text-amber-900">
                        {diagnosticSession.humanDesignProfile.type}
                      </Badge>
                      <Badge variant="outline">{diagnosticSession.humanDesignProfile.authority}</Badge>
                    </div>
                    <p className="text-gray-700 text-sm">
                      <strong>Strategy:</strong> {diagnosticSession.humanDesignProfile.strategy}
                    </p>
                    <p className="text-gray-600 text-sm mt-2">{diagnosticSession.humanDesignProfile.energyPattern}</p>
                  </div>
                )}
                {diagnosticSession.astrologyProfile && (
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">Astrology</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {diagnosticSession.astrologyProfile.sunSign && (
                        <Badge className="bg-blue-200 text-blue-900">☉ {diagnosticSession.astrologyProfile.sunSign}</Badge>
                      )}
                      {diagnosticSession.astrologyProfile.moonSign && (
                        <Badge variant="outline">☽ {diagnosticSession.astrologyProfile.moonSign}</Badge>
                      )}
                      {diagnosticSession.astrologyProfile.risingSign && (
                        <Badge variant="outline">↑ {diagnosticSession.astrologyProfile.risingSign}</Badge>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{diagnosticSession.astrologyProfile.currentTransitSummary}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions & Tools */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#4A1228]">Tools</h2>
            <Link to={createPageUrl("ToolsHub")}>
              <Button variant="ghost" className="text-[#6B1B3D]">
                See all <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <Link to={createPageUrl("Journal")}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-5 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Edit3 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-[#4A1228]">Quick Journal</h3>
                </CardContent>
              </Card>
            </Link>

            <Link to={createPageUrl("CheckIn")}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-5 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-[#4A1228]">Daily Check-In</h3>
                </CardContent>
              </Card>
            </Link>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-5 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Smile className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-[#4A1228]">Gratitude</h3>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-5 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Moon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-[#4A1228]">Sleep Check</h3>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Identity & Values Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#6B1B3D]" />
                  Identity Evolution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50 p-4 rounded-xl">
                  <h3 className="text-sm font-semibold text-red-800 mb-2">Releasing</h3>
                  <p className="text-gray-700">{diagnosticSession.releasing || "Not set"}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <h3 className="text-sm font-semibold text-green-800 mb-2">Becoming</h3>
                  <p className="text-gray-700">{diagnosticSession.becoming || "Not set"}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Core Values & Boundaries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Core Values</h3>
                  <div className="flex flex-wrap gap-2">
                    {diagnosticSession.values?.map((value) => (
                      <Badge key={value} className="bg-[#6B1B3D] text-white">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Active Boundaries</h3>
                  <ul className="space-y-1">
                    {diagnosticSession.boundaries?.filter(b => b).map((boundary, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-[#6B1B3D] flex-shrink-0 mt-0.5" />
                        {boundary}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Phase Integration & Stats */}
        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="w-5 h-5 text-[#6B1B3D]" />
                  Phase Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {Object.entries(phaseProgress).map(([phase, progress]) => (
                  <div key={phase}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-gray-700">
                        {phase === ALIVE_PHASES.VISION_EMBODIMENT ? "Vision & Embodiment" : phase}
                      </span>
                      <span className="text-gray-500">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-[#6B1B3D]" />
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-pink-50 rounded-2xl p-5 text-center">
                    <div className="text-3xl font-bold text-[#6B1B3D] mb-1">
                      {completedModules}
                    </div>
                    <div className="text-sm text-gray-600">Modules Complete</div>
                  </div>
                  <div className="bg-purple-50 rounded-2xl p-5 text-center">
                    <div className="text-3xl font-bold text-purple-700 mb-1">4</div>
                    <div className="text-sm text-gray-600">Tools Unlocked</div>
                  </div>
                  <div className="bg-orange-50 rounded-2xl p-5 text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-1">
                      {checkInStreak}
                    </div>
                    <div className="text-sm text-gray-600">Day Streak</div>
                  </div>
                  <div className="bg-green-50 rounded-2xl p-5 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {journalEntries.length}
                    </div>
                    <div className="text-sm text-gray-600">Journal Entries</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}