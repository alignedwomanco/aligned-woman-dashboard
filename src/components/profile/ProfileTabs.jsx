import React from "react";
import { Link } from "react-router-dom";

// ────────────────────────────────────────────────────────────────
// The My Profile tab row, shared by /Profile and the partner dashboard
// (/partner), so a partner can move between her pattern, her Audit, her
// account and her partner dashboard without the other tabs disappearing.
// `active` is one of: pattern, audit, account, partner.
// ────────────────────────────────────────────────────────────────

export const PROFILE_TABS = [
  { id: "pattern", label: "Your Pattern" },
  { id: "audit", label: "Alignment Audit" },
  { id: "account", label: "Account" },
];

const tabStyle = (on) => ({
  minHeight: 44, padding: "0 20px", borderRadius: 10, border: "none", cursor: "pointer", whiteSpace: "nowrap",
  background: on ? "#4A0E2E" : "transparent", color: on ? "#FFFFFF" : "#6B5B60",
  fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 13, textDecoration: "none",
  display: "inline-flex", alignItems: "center",
});

export default function ProfileTabs({ active, isPartner, onSelect }) {
  return (
    <nav aria-label="My Profile sections" style={{ display: "inline-flex", flexWrap: "wrap", gap: 4, padding: 4, borderRadius: 14, background: "#FFFFFF", marginBottom: 32, maxWidth: "100%" }}>
      {PROFILE_TABS.map((t) =>
        onSelect ? (
          <button key={t.id} type="button" aria-current={active === t.id ? "page" : undefined} onClick={() => onSelect(t.id)} style={tabStyle(active === t.id)}>
            {t.label}
          </button>
        ) : (
          <Link key={t.id} to={`/Profile?tab=${t.id}`} aria-current={active === t.id ? "page" : undefined} style={tabStyle(active === t.id)}>
            {t.label}
          </Link>
        )
      )}
      {isPartner && (
        <Link to="/partner" aria-current={active === "partner" ? "page" : undefined} style={tabStyle(active === "partner")}>
          Partner dashboard
        </Link>
      )}
    </nav>
  );
}
