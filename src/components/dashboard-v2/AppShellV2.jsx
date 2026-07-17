import React from "react";
import { Link } from "react-router-dom";
import DashboardSidebar from "@/components/dashboard-v2/DashboardSidebar";

// ────────────────────────────────────────────────────────────────
// AppShellV2 · the shared shell for rebuilt pages.
//
// Since cutover, the sidebar itself is DashboardSidebar, the single
// site-wide sidebar component (floating card, expert-aware My Profile).
// This shell adds the mobile top bar and the content offset that clears
// the floating card. Wrap a page's main column in it:
//
//   <AppShellV2>
//     <main>...</main>
//   </AppShellV2>
//
// The `active` prop is accepted for backwards compatibility; the sidebar
// derives the active item from the route.
// ────────────────────────────────────────────────────────────────

function Wordmark({ className = "" }) {
  return (
    <p className={`font-display text-[14px] tracking-[0.1em] text-awburg-core ${className}`}>
      THE ALIGNED <span className="italic">WOMAN</span>
    </p>
  );
}

function MobileTopBarV2() {
  return (
    <div className="lg:hidden px-5 py-4 border-b border-awburg-core/8 flex items-center justify-between">
      <Wordmark className="text-[12px]" />
      <div className="flex items-center gap-4">
        <Link
          to="/Classroom"
          className="font-body font-semibold text-[12px] text-awburg-core/70"
        >
          Classroom
        </Link>
        <Link
          to="/ExpertsDirectory"
          className="font-body font-semibold text-[12px] text-awburg-core/70"
        >
          Directory
        </Link>
      </div>
    </div>
  );
}

export default function AppShellV2({ active, children }) {
  return (
    <>
      <DashboardSidebar />
      <div className="flex-1 lg:ml-72 relative z-10">
        <MobileTopBarV2 />
        {children}
      </div>
    </>
  );
}
