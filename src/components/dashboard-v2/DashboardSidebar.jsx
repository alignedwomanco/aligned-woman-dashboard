import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";

const NAV_ITEMS = [
  { name: "Dashboard", path: "Dashboard" },
  { name: "Classroom", path: "Classroom" },
  { name: "Community", path: "Community" },
  { name: "Experts", path: "ExpertsDirectory" },
];

export default function DashboardSidebar({ siteSettings, memberSince, isBlueprintOwner }) {
  const location = useLocation();

  const isActive = (pageName) => {
    const url = createPageUrl(pageName);
    return location.pathname === url || location.pathname === `/${pageName}`;
  };

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 bg-paper border-r border-awburg-core/8 flex-col z-40">
      <div className="p-6 pb-8">
        <Link to={createPageUrl("Home")}>
          <img
            src={siteSettings?.dark_logo || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695154cb868ee011bb627195/23f49bf5a_AlignedWomanLogoPurple.png"}
            alt="The Aligned Woman"
            className="h-10 w-auto object-contain"
          />
        </Link>
      </div>

      <nav className="flex-1 px-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path);
            return (
              <li key={item.name}>
                <Link
                  to={createPageUrl(item.path)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                    active
                      ? "bg-awrose-pale text-awburg-core font-medium"
                      : "text-awburg-core/70 hover:text-awburg-core hover:bg-awrose-wash"
                  }`}
                >
                  {active && <div className="w-1.5 h-1.5 rounded-full bg-awrose-core flex-shrink-0" />}
                  <span className="font-body font-bold text-[11px] tracking-eyebrow uppercase">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-6 pt-4">
        <p className="font-body font-bold text-[9px] tracking-[0.18em] text-awburg-core/55 uppercase leading-relaxed">
          MEMBER SINCE {memberSince || "APRIL 2026"}
          {isBlueprintOwner && " · BLUEPRINT OWNER"}
        </p>
      </div>
    </aside>
  );
}
