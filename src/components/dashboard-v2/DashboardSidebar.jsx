import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function DashboardSidebar({ siteSettings, memberSince, isBlueprintOwner }) {
  const location = useLocation();

  const { data: currentUser } = useQuery({
    queryKey: ["sidebar-current-user"],
    queryFn: () => base44.auth.me(),
  });

  // An approved expert is anyone whose login email is linked to an Expert
  // record. That link is set on invite or application approval and is
  // independent of Blueprint access, so members who are not experts never see
  // the item, and approved experts always do.
  const { data: linkedExperts = [] } = useQuery({
    queryKey: ["sidebar-expert-link", currentUser?.email],
    queryFn: () => base44.entities.Expert.filter({ linked_user_email: currentUser.email }),
    enabled: !!currentUser?.email,
  });
  const isApprovedExpert = linkedExperts.length > 0;

  const isActive = (pageName) => {
    const url = createPageUrl(pageName);
    return location.pathname === url || location.pathname === `/${pageName}`;
  };

  const navItems = [
    { name: "Dashboard", to: createPageUrl("Dashboard"), active: isActive("Dashboard") },
    { name: "Classroom", to: createPageUrl("Classroom"), active: isActive("Classroom") },
    { name: "Experts", to: createPageUrl("ExpertsDirectory"), active: isActive("ExpertsDirectory") },
  ];
  if (isApprovedExpert) {
    navItems.push({
      name: "My Profile",
      to: "/expert-dashboard",
      active: location.pathname === "/expert-dashboard",
    });
  }

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 bg-paper border-r border-awburg-core/8 flex-col z-40">
      <div className="p-6 pb-8">
        <Link to={createPageUrl("Home")}>
          <img
            src={siteSettings?.dark_logo || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695154cb868ee011bb627195/23f49bf5a_AlignedWomanLogoPurple.png"}
            alt="The Aligned Woman"
            className="h-10 w-auto object-contain"
            style={{ filter: "brightness(0) saturate(100%) invert(11%) sepia(60%) saturate(1500%) hue-rotate(300deg) brightness(75%)" }}
          />
        </Link>
      </div>

      <nav className="flex-1 px-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.to}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  item.active
                    ? "bg-awrose-pale text-awburg-core font-medium"
                    : "text-awburg-core/70 hover:text-awburg-core hover:bg-awrose-wash"
                }`}
              >
                {item.active && <div className="w-1.5 h-1.5 rounded-full bg-awrose-core flex-shrink-0" />}
                <span className="font-body font-bold text-[11px] tracking-eyebrow uppercase">{item.name}</span>
              </Link>
            </li>
          ))}
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