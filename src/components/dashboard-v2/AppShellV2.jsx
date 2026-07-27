import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
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
//
// July 2026: the mobile top bar's two inline text links (Classroom,
// Directory) were replaced by a hamburger that opens a full nav drawer.
// The drawer carries the same items as DashboardSidebar, because on
// mobile this bar is the only navigation on the page.
// ────────────────────────────────────────────────────────────────

function Wordmark({ className = "" }) {
  return (
    <p className={`font-display text-[14px] tracking-[0.1em] text-awburg-core ${className}`}>
      THE ALIGNED <span className="italic">WOMAN</span>
    </p>
  );
}

// Single source of truth for member nav, shared in shape and behaviour with
// DashboardSidebar. The query keys deliberately match the sidebar's, so
// TanStack Query serves both from one cache entry and this adds no extra
// network calls.
function useMemberNav() {
  const location = useLocation();

  const { data: currentUser } = useQuery({
    queryKey: ["sidebar-current-user"],
    queryFn: () => base44.auth.me(),
  });

  // An approved expert is anyone whose login email is linked to an Expert
  // record. Members who are not experts never see My Profile point at the
  // expert dashboard.
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

  return [
    { name: "Dashboard", to: createPageUrl("Dashboard"), active: isActive("Dashboard") },
    { name: "Classroom", to: createPageUrl("Classroom"), active: isActive("Classroom") },
    { name: "Directory", to: createPageUrl("ExpertsDirectory"), active: isActive("ExpertsDirectory") },
    {
      name: "My Profile",
      to: isApprovedExpert ? "/expert-dashboard" : createPageUrl("ProfileSettings"),
      active: isApprovedExpert
        ? location.pathname === "/expert-dashboard"
        : isActive("ProfileSettings"),
    },
  ];
}

function MobileNavDrawer({ isOpen, onClose }) {
  const navItems = useMemberNav();

  // Escape closes, and the page behind must not scroll while the panel is up.
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="lg:hidden fixed inset-0 z-[70] bg-awburg-dark/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="lg:hidden fixed top-0 right-0 bottom-0 z-[80] w-[82%] max-w-[320px] flex flex-col bg-off-white border-l border-awburg-core/8 shadow-xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.26, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <div className="flex items-center justify-between pl-5 pr-3 pt-5 pb-4 border-b border-awburg-core/8">
              <Wordmark className="text-[12px]" />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full"
                style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
              >
                <X className="w-5 h-5 text-awburg-core" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <ul>
                {navItems.map((item, i) => {
                  const isLast = i === navItems.length - 1;
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.to}
                        onClick={onClose}
                        aria-current={item.active ? "page" : undefined}
                        className={
                          item.active
                            ? "flex items-center gap-3 bg-paper rounded-full shadow-md px-5 py-3.5 mb-1"
                            : `flex items-center gap-3 px-5 py-3.5 text-awburg-core/70 ${
                                isLast ? "" : "border-b border-awburg-core/8"
                              }`
                        }
                        style={{ touchAction: "manipulation" }}
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

            <div className="border-t border-awburg-core/10 px-8 py-5 space-y-3">
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
                onClick={onClose}
                className="block font-body text-[13px] text-awburg-core/60"
                style={{ touchAction: "manipulation" }}
              >
                Support
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function MobileTopBarV2({ onOpenMenu }) {
  return (
    <div className="lg:hidden px-5 py-3 border-b border-awburg-core/8 flex items-center justify-between">
      <Wordmark className="text-[12px]" />
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open menu"
        className="flex-shrink-0 flex items-center justify-center w-11 h-11 -mr-2 rounded-full"
        style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
      >
        <Menu className="w-5 h-5 text-awburg-core" />
      </button>
    </div>
  );
}

export default function AppShellV2({ active, children }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close on navigation, so the panel never survives a route change.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Close if the viewport grows past the breakpoint where the real sidebar
  // takes over, so the drawer cannot be left open behind it.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <DashboardSidebar />
      <div className="flex-1 lg:ml-72 relative z-10">
        <MobileTopBarV2 onOpenMenu={() => setMenuOpen(true)} />
        {children}
      </div>
      <MobileNavDrawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
