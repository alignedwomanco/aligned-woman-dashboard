import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

// ────────────────────────────────────────────────────────────────
// DashboardV2 · parallel rebuild of the member dashboard
//
// ADMIN-ONLY PREVIEW while we build. Members never see this page:
// anyone without an admin role is sent to the live /Dashboard.
// The live Dashboard.jsx is untouched.
//
// CUTOVER NOTE (agreed with Laura, on record):
// No data or schema migrates at cutover. This page binds to the
// SAME live entities the current dashboard uses today:
//   User, MemberProfile, CourseProgress, Course, MoneyStoryResponse,
//   Expert / ExpertCategory (directory), ExpertApplication (apply).
// When the rebuild is complete, cutover is a one-line swap in
// App.jsx so /Dashboard renders this page instead of Dashboard.jsx.
// Keep Dashboard.jsx in place as the instant rollback. Then remove
// the admin gate and the preview banner below.
//
// Block structure follows the approved wireframe:
//   01 Greeting · 02 Pattern (state-aware) · 03 Your courses
//   04 Directory · 05 For practitioners · 06 Free resources
// Blocks marked BUILD SLOT are scaffolds to be built next.
// ────────────────────────────────────────────────────────────────

const PRIVILEGED_ROLES = ["admin", "master_admin", "owner"];

const NAV_ITEMS = [
  { label: "Dashboard", path: "/DashboardV2", active: true },
  { label: "Classroom", path: "/Classroom" },
  { label: "Directory", path: "/ExpertsDirectory" },
  { label: "Community", path: "/Community" },
  { label: "My Profile", path: "/ProfileSettings" },
];

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function SectionTitle({ children }) {
  return (
    <p className="font-body font-bold text-[12px] tracking-eyebrow uppercase text-awburg-core mb-4">
      {children}
    </p>
  );
}

function BuildSlot({ label, note }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-awrose-core/40 bg-white/40 px-6 py-10 text-center">
      <p className="font-body font-bold text-[11px] tracking-eyebrow uppercase text-awrose-core mb-1">
        Build slot · {label}
      </p>
      {note && <p className="font-body text-[12px] text-awburg-core/60">{note}</p>}
    </div>
  );
}

export default function DashboardV2() {
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    base44.auth
      .me()
      .then(setCurrentUser)
      .catch(() => setCurrentUser(null));
  }, []);

  // Resolve the freshest user we have; wait before deciding access.
  const resolvedUser = currentUser === undefined ? user : currentUser;

  if (currentUser === undefined && !user) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-awrose-pale border-t-awburg-core rounded-full animate-spin" />
      </div>
    );
  }

  const isPrivileged =
    resolvedUser && PRIVILEGED_ROLES.includes(resolvedUser.role);

  // Members never see the rebuild. They go to the live dashboard.
  if (currentUser !== undefined && !isPrivileged) {
    return <Navigate to="/Dashboard" replace />;
  }

  const firstName =
    (resolvedUser?.full_name || "").split(" ")[0] || "there";

  return (
    <div className="min-h-screen flex bg-paper">
      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 bg-paper border-r border-awburg-core/8 flex-col z-40">
        <div className="p-6 pb-8">
          <img
            src="https://media.base44.com/images/public/69f46886a412ee042303f1af/1c0c68566_awblogo.png"
            alt="The Aligned Woman"
            className="h-10 w-auto object-contain"
          />
        </div>
        <nav className="flex-1 px-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                    item.active
                      ? "bg-awrose-pale text-awburg-core font-medium"
                      : "text-awburg-core/70 hover:text-awburg-core hover:bg-awrose-wash"
                  }`}
                >
                  {item.active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-awrose-core flex-shrink-0" />
                  )}
                  <span className="font-body font-bold text-[11px] tracking-eyebrow uppercase">
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="px-8 pb-6 space-y-2">
          <Link
            to="/Support"
            className="block font-body font-semibold text-[10px] tracking-eyebrow uppercase text-awburg-core/55 hover:text-awburg-core transition-colors"
          >
            Support
          </Link>
          <p className="font-body font-bold text-[9px] tracking-[0.18em] text-awburg-core/55 uppercase leading-relaxed pt-2">
            THE ALIGNED WOMAN
          </p>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 lg:ml-60">
        {/* Admin preview banner: remove at cutover */}
        <div className="bg-awburg-core text-paper px-6 py-2">
          <p className="font-body font-bold text-[10px] tracking-eyebrow uppercase text-center">
            Dashboard rebuild · admin preview only · members still see the
            current dashboard
          </p>
        </div>

        <main className="max-w-5xl mx-auto px-6 py-10 space-y-12">
          {/* 01 · Greeting */}
          <section>
            <h1
              className="text-[32px] text-awburg-core"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              {timeGreeting()}, {firstName}.
            </h1>
            <p className="font-body text-[14px] text-awburg-core/60 mt-1">
              This is your space. Pick up where you left off, or wander.
            </p>
          </section>

          {/* 02 · Pattern block, state-aware */}
          <section>
            <BuildSlot
              label="02 · Your pattern"
              note="State-aware: profile invitation when no pattern, extended pattern card when taken. Binds to MemberProfile."
            />
          </section>

          {/* 03 · Your courses */}
          <section>
            <SectionTitle>Your learning</SectionTitle>
            <BuildSlot
              label="03 · Your courses"
              note="One card per owned course from Course + CourseProgress, plus the Explore courses card."
            />
          </section>

          {/* 04 · Directory */}
          <section>
            <SectionTitle>Trusted help, when you want it</SectionTitle>
            <BuildSlot
              label="04 · The directory"
              note="Find a practitioner + Find an AW Verified business, routing into the directory with filters preselected."
            />
          </section>

          {/* 05 · For practitioners */}
          <section>
            <BuildSlot
              label="05 · For practitioners"
              note="Slim strip: Apply to become AW Verified + Apply to feature your course, both landing on the apply page."
            />
          </section>

          {/* 06 · Free resources */}
          <section>
            <SectionTitle>Free resources</SectionTitle>
            <BuildSlot
              label="06 · Free resources"
              note="Your Money Story (MoneyStoryResponse states: Begin / Continue / Revisit) + Yin with Phoebe video card."
            />
          </section>
        </main>
      </div>
    </div>
  );
}
