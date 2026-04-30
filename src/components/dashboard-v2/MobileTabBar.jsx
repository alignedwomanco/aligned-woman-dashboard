import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LayoutDashboard, BookOpen, Users, Lightbulb } from "lucide-react";

const TABS = [
  { name: "Dashboard", path: "Dashboard", icon: LayoutDashboard },
  { name: "Classroom", path: "Classroom", icon: BookOpen },
  { name: "Community", path: "Community", icon: Users },
  { name: "Experts", path: "ExpertsDirectory", icon: Lightbulb },
];

export default function MobileTabBar() {
  const location = useLocation();

  const isActive = (pageName) => {
    const url = createPageUrl(pageName);
    return location.pathname === url || location.pathname === `/${pageName}`;
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 safe-area-bottom">
      <div className="flex items-center justify-around py-2">
        {TABS.map((tab) => {
          const active = isActive(tab.path);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              to={createPageUrl(tab.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors relative ${
                active ? "text-[#5C1A2E]" : "text-[#6B6168]"
              }`}
            >
              {active && (
                <div className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-[#C77B85]" />
              )}
              <Icon className="w-5 h-5" strokeWidth={active ? 2 : 1.5} />
              <span className="text-[9px] tracking-[0.1em] uppercase font-medium">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}