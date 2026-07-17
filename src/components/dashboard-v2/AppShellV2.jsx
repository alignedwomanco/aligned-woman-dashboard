import React from "react";
import { Link } from "react-router-dom";

// ────────────────────────────────────────────────────────────────
// AppShellV2 · the shared navigation shell for every rebuilt page.
//
// One source of truth for the sidebar and the mobile top bar, so the
// shell is edited once and every V2 page follows. Wrap a page's main
// column in it and pass which nav item is active:
//
//   <AppShellV2 active="dashboard">
//     ...banner + <main>...</main>
//   </AppShellV2>
//
// The page keeps ownership of its own background, atmosphere, and any
// preview banner. This shell is used by V2 preview pages only until
// cutover; live member pages keep their current layout.
//
// Design source: approved sidebar reference (floating card, serif
// wordmark, sentence-case items, active white pill with rose dot,
// hairline separators, quiet LaurAI + Support block).
// ────────────────────────────────────────────────────────────────

const NAV = [
  { key: "dashboard", label: "Dashboard", path: "/DashboardV2" },
  { key: "classroom", label: "Classroom", path: "/Classroom" },
  { key: "directory", label: "Directory", path: "/ExpertsDirectory" },
  { key: "profile", label: "My Profile", path: "/ProfileSettings" },
];

function Wordmark({ className = "" }) {
  return (
    <p className={`font-display text-[14px] tracking-[0.1em] text-awburg-core ${className}`}>
      THE ALIGNED <span className="italic">WOMAN</span>
    </p>
  );
}

function SidebarV2({ active }) {
  return (
    <aside className="hidden lg:block fixed left-6 top-8 w-60 z-40">
      <div className="rounded-[28px] bg-white/55 backdrop-blur-2xl border border-white/60 shadow-xl pt-8 pb-7 px-4">
        <Wordmark className="px-4 mb-8" />
        <nav>
          <ul>
            {NAV.map((item, i) => {
              const isActive = item.key === active;
              const isLast = i === NAV.length - 1;
              return (
                <li key={item.key}>
                  <Link
                    to={item.path}
                    aria-current={isActive ? "page" : undefined}
                    className={
                      isActive
                        ? "flex items-center gap-3 bg-white rounded-full shadow-md px-5 py-3 mb-1"
                        : `flex items-center gap-3 px-5 py-3 text-awburg-core/70 hover:text-awburg-core transition-colors ${
                            isLast ? "" : "border-b border-awburg-core/8"
                          }`
                    }
                  >
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-awrose-core flex-shrink-0" />
                    )}
                    <span
                      className={`font-body text-[15px] ${
                        isActive ? "font-semibold text-awburg-core" : "font-normal"
                      }`}
                    >
                      {item.label}
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
            to="/Support"
            className="block font-body text-[13px] text-awburg-core/60 hover:text-awburg-core transition-colors"
          >
            Support
          </Link>
        </div>
      </div>
    </aside>
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
      <SidebarV2 active={active} />
      <div className="flex-1 lg:ml-72 relative z-10">
        <MobileTopBarV2 />
        {children}
      </div>
    </>
  );
}
