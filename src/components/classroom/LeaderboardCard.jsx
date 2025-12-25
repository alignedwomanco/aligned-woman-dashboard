import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";

export default function LeaderboardCard({ leaderboard, currentUserEmail }) {
  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-700" />;
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((entry, index) => {
            const rank = index + 1;
            const isCurrentUser = entry.email === currentUserEmail;
            
            return (
              <div
                key={entry.email}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isCurrentUser ? "bg-[#6B1B3D]/10 border-2 border-[#6B1B3D]" : "bg-gray-50"
                }`}
              >
                <div className="w-8 text-center font-bold text-gray-700">
                  {getRankIcon(rank) || `#${rank}`}
                </div>
                
                <Avatar className="w-10 h-10">
                  <AvatarImage src={entry.profile_picture} />
                  <AvatarFallback className="bg-[#6B1B3D] text-white">
                    {entry.full_name?.[0] || entry.email?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {entry.full_name || "User"}
                    {isCurrentUser && (
                      <Badge className="ml-2 bg-[#6B1B3D] text-white text-xs">You</Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">Level {entry.level}</div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-[#6B1B3D]">{entry.points}</div>
                  <div className="text-xs text-gray-500">points</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}