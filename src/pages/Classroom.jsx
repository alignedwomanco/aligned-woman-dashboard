import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Lock, CheckCircle, Clock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function Classroom() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
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

  const { data: modules = [] } = useQuery({
    queryKey: ["modules"],
    queryFn: () => base44.entities.Module.list(),
    initialData: [],
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ["userProgress"],
    queryFn: () => base44.entities.UserModuleProgress.list(),
    initialData: [],
  });

  const getModuleStatus = (moduleId) => {
    const progress = userProgress.find(p => p.moduleId === moduleId);
    return progress?.status || "Locked";
  };

  const getModuleProgress = (moduleId) => {
    const progress = userProgress.find(p => p.moduleId === moduleId);
    return progress?.videoWatchedPercent || 0;
  };

  const modulesByPhase = modules.reduce((acc, module) => {
    if (!acc[module.phase]) acc[module.phase] = [];
    acc[module.phase].push(module);
    return acc;
  }, {});

  const recommendedModules = diagnosticSession?.recommendedModules || [];
  const primaryPhase = diagnosticSession?.primaryPhase || "Awareness";

  const completedCount = userProgress.filter(p => p.status === "Complete").length;
  const totalModules = modules.length;
  const overallProgress = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#4A1228] mb-2">Classroom</h1>
          <p className="text-gray-600">Your personalized learning pathway</p>
        </div>

        {/* Overview Card */}
        <Card className="mb-8 bg-gradient-to-br from-[#6B1B3D] to-[#4A1228] text-white">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Your Progress</h2>
                <p className="text-white/80">Primary Phase: {primaryPhase}</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold">{completedCount}</p>
                <p className="text-white/80">of {totalModules} completed</p>
              </div>
            </div>
            <Progress value={overallProgress} className="h-3 bg-white/20" />
          </CardContent>
        </Card>

        {/* Recommended Modules */}
        {recommendedModules.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#6B1B3D]" />
              <h2 className="text-2xl font-bold text-[#4A1228]">Recommended For You</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {recommendedModules.slice(0, 3).map((moduleName, idx) => {
                const module = modules.find(m => m.title === moduleName);
                if (!module) return null;
                
                const status = getModuleStatus(module.id);
                const progress = getModuleProgress(module.id);

                return (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow border-2 border-pink-100">
                      <CardContent className="p-6">
                        <Badge className="mb-3 bg-[#6B1B3D] text-white">
                          {module.phase}
                        </Badge>
                        <h3 className="font-bold text-lg mb-2">{module.title}</h3>
                        {module.summary && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {module.summary}
                          </p>
                        )}
                        {status === "InProgress" && (
                          <Progress value={progress} className="mb-4" />
                        )}
                        <Link to={createPageUrl("ModulePlayer") + `?id=${module.id}`}>
                          <Button className="w-full bg-[#6B1B3D] hover:bg-[#4A1228]">
                            {status === "Complete" ? "Review" : status === "InProgress" ? "Continue" : "Start"}
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* All Modules by Phase */}
        <Tabs defaultValue={primaryPhase} className="space-y-6">
          <TabsList>
            {Object.keys(modulesByPhase).map(phase => (
              <TabsTrigger key={phase} value={phase}>
                {phase}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(modulesByPhase).map(([phase, phaseModules]) => (
            <TabsContent key={phase} value={phase}>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {phaseModules.map(module => {
                  const status = getModuleStatus(module.id);
                  const progress = getModuleProgress(module.id);

                  return (
                    <Card key={module.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <Badge variant="outline">{module.phase}</Badge>
                          {status === "Complete" && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                          {status === "Locked" && (
                            <Lock className="w-5 h-5 text-gray-400" />
                          )}
                          {status === "InProgress" && (
                            <Clock className="w-5 h-5 text-blue-600" />
                          )}
                        </div>

                        <h3 className="font-bold text-lg mb-2">{module.title}</h3>
                        {module.summary && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                            {module.summary}
                          </p>
                        )}

                        {module.durationMinutes && (
                          <p className="text-xs text-gray-500 mb-4">
                            {module.durationMinutes} minutes
                          </p>
                        )}

                        {status === "InProgress" && (
                          <Progress value={progress} className="mb-4" />
                        )}

                        {status !== "Locked" ? (
                          <Link to={createPageUrl("ModulePlayer") + `?id=${module.id}`}>
                            <Button className="w-full bg-[#6B1B3D] hover:bg-[#4A1228]">
                              {status === "Complete" ? "Review" : status === "InProgress" ? "Continue" : "Start"}
                            </Button>
                          </Link>
                        ) : (
                          <Button disabled className="w-full">
                            <Lock className="w-4 h-4 mr-2" />
                            Locked
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}