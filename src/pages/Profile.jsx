import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AppShellV2 from "@/components/dashboard-v2/AppShellV2";
import PatternSection from "@/components/profile/PatternSection";
import AuditSection from "@/components/profile/AuditSection";
import ProfileSettings from "@/pages/ProfileSettings";

// ────────────────────────────────────────────────────────────────
// My Profile (/Profile). One home for everything that is hers:
//   ?tab=pattern  her Starting Point Profile result (was /YourPattern)
//   ?tab=audit    her Alignment Audit: status, answers, blueprint
//   ?tab=account  name, picture, access (was /ProfileSettings)
// Approved partners also get a link to their partner dashboard (/partner).
// Declared in App.jsx beside /Dashboard, in its own AppShellV2 chrome and
// outside Layout, so free members are never stopped by PendingApproval.
// ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "pattern", label: "Your Pattern" },
  { id: "audit", label: "Alignment Audit" },
  { id: "account", label: "Account" },
];

export default function Profile() {
  const [params, setParams] = useSearchParams();
  const requested = params.get("tab");
  const tab = TABS.some((t) => t.id === requested) ? requested : "pattern";

  // Same query keys as the sidebar, so these come from its cache.
  const { data: me } = useQuery({ queryKey: ["sidebar-current-user"], queryFn: () => base44.auth.me() });
  const { data: linkedExperts = [] } = useQuery({
    queryKey: ["sidebar-expert-link", me?.email],
    queryFn: () => base44.entities.Expert.filter({ linked_user_email: me.email }),
    enabled: !!me?.email,
  });
  const isPartner = linkedExperts.length > 0;
  const firstName = (me?.full_name || "").trim().split(" ")[0];

  const tabStyle = (on) => ({
    minHeight: 44, padding: "0 20px", borderRadius: 10, border: "none", cursor: "pointer", whiteSpace: "nowrap",
    background: on ? "#4A0E2E" : "transparent", color: on ? "#FFFFFF" : "#6B5B60",
    fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 13, textDecoration: "none",
    display: "inline-flex", alignItems: "center",
  });

  return (
    <div className="min-h-screen flex relative" style={{ background: "#FAF5F3" }}>
      <AppShellV2 active="profile">
        <main className="max-w-5xl mx-auto px-5 md:px-6 py-8">
          <p style={{ margin: 0, fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#A86460" }}>My Profile</p>
          <h1 className="font-display" style={{ margin: "10px 0 6px", fontSize: 34, lineHeight: 1.15, color: "#4A0E2E" }}>
            {firstName ? `Your space, ${firstName}.` : "Your space."}
          </h1>
          <p style={{ margin: "0 0 28px", fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: 15, color: "#6B5B60" }}>
            Your pattern, your Alignment Audit and your account, in one place.
          </p>

          <div role="tablist" aria-label="My Profile sections" style={{ display: "inline-flex", flexWrap: "wrap", gap: 4, padding: 4, borderRadius: 14, background: "#FFFFFF", marginBottom: 32, maxWidth: "100%" }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setParams({ tab: t.id }, { replace: true })}
                style={tabStyle(tab === t.id)}
              >
                {t.label}
              </button>
            ))}
            {isPartner && (
              <Link to="/partner" style={tabStyle(false)}>Partner dashboard →</Link>
            )}
          </div>

          <div role="tabpanel">
            {tab === "pattern" && <PatternSection />}
            {tab === "audit" && <AuditSection />}
            {tab === "account" && <ProfileSettings embedded />}
          </div>
        </main>
      </AppShellV2>
    </div>
  );
}
