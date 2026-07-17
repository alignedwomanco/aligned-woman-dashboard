import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

// ────────────────────────────────────────────────────────────────
// Live member sidebar, shared by the live Dashboard and Layout.jsx.
// Restyled July 2026 to the approved floating-card design: serif
// wordmark, sentence-case items, active white pill with rose dot,
// hairline separators, quiet LaurAI + Support block.
//
// Behavior preserved from the previous version:
// - Approved experts (login email linked to an Expert record) see
//   My Profile → /expert-dashboard. Members who are not experts never
//   see that item.
// - The member-since caption renders only when the caller passes it.
// - The wordmark links Home, as the logo did.
//
// Pages using this must offset their content with lg:pl-72 / lg:ml-72
// to clear the floating card (left-6 + w-60 + gap).
// ────────────────────────────────────────────────────────────────

export default function DashboardSidebar({ memberSince, isBlueprintOwner }) {
  const location = useLocation();

  const { data: currentUser } = useQuery({
    queryKey: ["sidebar-current-user"],
    queryFn: () => base44.auth.me(),
  });

  // An approved expert is anyone whose login email is linked to an Expert
  // record. That link is set on invite or application approval and is
  // independent of Blueprint access.
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
    { name: "Directory", to: createPageUrl("ExpertsDirectory"), active: isActive("ExpertsDirectory") },
  ];
  navItems.push({
    name: "My Profile",
    to: isApprovedExpert ? "/expert-dashboard" : createPageUrl("ProfileSettings"),
    active: isApprovedExpert
      ? location.pathname === "/expert-dashboard"
      : isActive("ProfileSettings"),
  });

  return (
    <aside className="hidden lg:block fixed left-6 top-8 w-60 z-40">
      <div className="rounded-[28px] bg-white/55 backdrop-blur-2xl border border-white/60 shadow-xl pt-8 pb-7 px-4">
        <Link to={createPageUrl("Home")} className="block px-4 mb-8">
          <p className="font-display text-[14px] tracking-[0.1em] text-awburg-core">
            THE ALIGNED <span className="italic">WOMAN</span>
          </p>
        </Link>

        <nav>
          <ul>
            {navItems.map((item, i) => {
              const isLast = i === navItems.length - 1;
              return (
                <li key={item.name}>
                  <Link
                    to={item.to}
                    aria-current={item.active ? "page" : undefined}
                    className={
                      item.active
                        ? "flex items-center gap-3 bg-white rounded-full shadow-md px-5 py-3 mb-1"
                        : `flex items-center gap-3 px-5 py-3 text-awburg-core/70 hover:text-awburg-core transition-colors ${
                            isLast ? "" : "border-b border-awburg-core/8"
                          }`
                    }
                  >
                    {item.active && (
                      <span className="w-2 h-2 rounded-full bg-awrose-core flex-shrink-0" />
                    )}
                    <span
                      className={`font-body text-[15px] ${
                        item.active ? "font-semibold text-awburg-core" : "font-normal"
                      }`}
                    >
                      {item.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-8 pt-5 border-t border-awburg-core/10 px-4 space-y-3">
          {/* LaurAI is not built yet: greyed and non-interactive, so no dead
              link. Becomes a real route when LaurAI ships. */}
          <p
            aria-disabled="true"
            className="font-body text-[13px] text-awburg-core/35 cursor-default select-none"
          >
            Talk to LaurAI
            <span className="ml-2 text-[11px] text-awburg-core/40">coming soon</span>
          </p>
          <Link
            to={createPageUrl("Support")}
            className="block font-body text-[13px] text-awburg-core/60 hover:text-awburg-core transition-colors"
          >
            Support
          </Link>
          {memberSince && (
            <p className="font-body font-bold text-[9px] tracking-[0.18em] text-awburg-core/55 uppercase leading-relaxed pt-2">
              MEMBER SINCE {memberSince}
              {isBlueprintOwner && " · BLUEPRINT OWNER"}
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
