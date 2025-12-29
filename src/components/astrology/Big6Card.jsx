import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Sun, Moon, ArrowUp, MessageCircle, Heart, Zap } from "lucide-react";

const planetIcons = {
  Sun,
  Moon,
  Rising: ArrowUp,
  Mercury: MessageCircle,
  Venus: Heart,
  Mars: Zap
};

export default function Big6Card({ planet, sign, descriptor, onClick }) {
  const Icon = planetIcons[planet] || Sparkles;
  
  const planetColors = {
    Sun: "from-yellow-400 to-orange-500",
    Moon: "from-blue-400 to-indigo-500",
    Rising: "from-purple-400 to-pink-500",
    Mercury: "from-green-400 to-teal-500",
    Venus: "from-pink-400 to-rose-500",
    Mars: "from-red-400 to-orange-600"
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left group"
    >
      <Card className="hover:shadow-lg transition-all border-0 bg-white/95 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${planetColors[planet] || "from-purple-400 to-pink-500"} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-gray-900">{planet}</h3>
              <p className="text-xs text-gray-600">{sign}</p>
            </div>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">
            {descriptor}
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs text-purple-600 group-hover:text-purple-700">
            <span>Learn more</span>
            <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}