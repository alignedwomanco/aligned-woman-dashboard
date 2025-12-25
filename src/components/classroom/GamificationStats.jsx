import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Flame, 
  Star, 
  Target,
  TrendingUp,
  Award 
} from "lucide-react";
import { motion } from "framer-motion";

export default function GamificationStats({ userPoints, userBadges }) {
  const pointsForNextLevel = (userPoints?.level || 1) * 100;
  const currentLevelPoints = ((userPoints?.level || 1) - 1) * 100;
  const progressToNextLevel = ((userPoints?.points || 0) - currentLevelPoints) / (pointsForNextLevel - currentLevelPoints) * 100;

  return (
    <div className="grid md:grid-cols-4 gap-4 mb-8">
      {/* Level & Points */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-900">
                Level {userPoints?.level || 1}
              </div>
              <div className="text-sm text-purple-700">{userPoints?.points || 0} points</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-purple-700">
              <span>Progress to Level {(userPoints?.level || 1) + 1}</span>
              <span>{Math.round(progressToNextLevel)}%</span>
            </div>
            <Progress value={progressToNextLevel} className="h-2 bg-purple-200 [&>div]:bg-purple-600" />
          </div>
        </CardContent>
      </Card>

      {/* Current Streak */}
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-900">
                {userPoints?.currentStreak || 0}
              </div>
              <div className="text-sm text-orange-700">Day Streak 🔥</div>
            </div>
          </div>
          {userPoints?.longestStreak > 0 && (
            <div className="mt-3 text-xs text-orange-600">
              Best: {userPoints.longestStreak} days
            </div>
          )}
        </CardContent>
      </Card>

      {/* Badges Earned */}
      <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#6B1B3D] rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#4A1228]">
                {userBadges?.length || 0}
              </div>
              <div className="text-sm text-[#6B1B3D]">Badges Earned</div>
            </div>
          </div>
          <div className="flex gap-1 mt-3 overflow-x-auto">
            {userBadges?.slice(0, 5).map((badge) => (
              <Badge 
                key={badge.id} 
                className="bg-[#6B1B3D]/20 text-[#6B1B3D] text-xs whitespace-nowrap"
              >
                {badge.badgeIcon} {badge.badgeName}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-900">
                {/* Calculate completion percentage */}
                {Math.round(((userBadges?.length || 0) / 20) * 100)}%
              </div>
              <div className="text-sm text-green-700">Overall Progress</div>
            </div>
          </div>
          <div className="mt-3">
            <Progress 
              value={((userBadges?.length || 0) / 20) * 100} 
              className="h-2 bg-green-200 [&>div]:bg-green-600" 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}