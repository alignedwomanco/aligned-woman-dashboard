import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Target, ArrowRight, CheckCircle } from "lucide-react";

export default function DailySnapshotCard({ diagnosticSession, needsCheckIn }) {
  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="bg-gradient-to-br from-pink-50 to-white border-pink-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Today's Snapshot</CardTitle>
          <Badge className="bg-[#6B1B3D] text-white">{todayDate}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {diagnosticSession.dailySnapshot?.mainNarrative ? (
          <>
            {/* Check-in prompt if needed */}
            {needsCheckIn && (
              <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white p-6 rounded-2xl">
                <div className="flex items-start gap-4">
                  <Sparkles className="w-6 h-6 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Start Your Day</h3>
                    <p className="text-white/90 mb-4">Take 2 minutes to check in and get your personalized snapshot for today.</p>
                    <Link to={createPageUrl("DailyCheckIn")}>
                      <Button className="bg-white text-rose-600 hover:bg-white/90">
                        Daily Check-In <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Today Is About */}
            {diagnosticSession.dailySnapshot.todayIsAbout && (
              <div className="bg-gradient-to-r from-[#6B1B3D] to-[#8B2E4D] text-white p-6 rounded-2xl">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Today Is About
                </h3>
                <p className="text-white/90 text-lg leading-relaxed">
                  {diagnosticSession.dailySnapshot.todayIsAbout}
                </p>
              </div>
            )}

            {/* Main Narrative */}
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                {diagnosticSession.dailySnapshot.mainNarrative}
              </p>
            </div>

            {/* Guidance Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {diagnosticSession.dailySnapshot.movementRecommendation && (
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <h3 className="text-sm font-semibold text-green-900 mb-2">Movement</h3>
                  <p className="text-gray-700 text-sm">{diagnosticSession.dailySnapshot.movementRecommendation}</p>
                </div>
              )}
              {diagnosticSession.dailySnapshot.nutritionRecommendation && (
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                  <h3 className="text-sm font-semibold text-orange-900 mb-2">Nutrition</h3>
                  <p className="text-gray-700 text-sm">{diagnosticSession.dailySnapshot.nutritionRecommendation}</p>
                </div>
              )}
              {diagnosticSession.dailySnapshot.energyGuidance && (
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                  <h3 className="text-sm font-semibold text-purple-900 mb-2">Energy Guidance</h3>
                  <p className="text-gray-700 text-sm">{diagnosticSession.dailySnapshot.energyGuidance}</p>
                </div>
              )}
              {diagnosticSession.dailySnapshot.focusReminder && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">Focus</h3>
                  <p className="text-gray-700 text-sm">{diagnosticSession.dailySnapshot.focusReminder}</p>
                </div>
              )}
            </div>

            {/* ALIVE Lens */}
            {diagnosticSession.dailySnapshot.aliveLens && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-xl border border-indigo-200">
                <h3 className="text-sm font-semibold text-indigo-900 mb-2">Your ALIVE Lens</h3>
                <p className="text-gray-700 text-sm">{diagnosticSession.dailySnapshot.aliveLens}</p>
              </div>
            )}

            {/* Recommended Modules */}
            {diagnosticSession.dailySnapshot.recommendedModules && diagnosticSession.dailySnapshot.recommendedModules.length > 0 && (
              <div className="bg-white p-5 rounded-xl border-2 border-pink-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Recommended for Today</h3>
                <div className="space-y-2">
                  {diagnosticSession.dailySnapshot.recommendedModules.map((module, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-700 text-sm">
                      <CheckCircle className="w-4 h-4 text-[#6B1B3D]" />
                      {module}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-rose-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Complete Your Daily Check-In
            </h3>
            <p className="text-gray-600 mb-6">
              Get your personalized snapshot with integrated guidance for today
            </p>
            <Link to={createPageUrl("DailyCheckIn")}>
              <Button className="bg-gradient-to-r from-[#6B1B3D] to-[#8B2E4D] text-white">
                Start Check-In <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}