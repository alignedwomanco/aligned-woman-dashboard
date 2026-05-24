import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { X, Search, ChevronDown, Pencil } from "lucide-react";

// ─── DESIGN TOKENS ───
const C = {
  burgDeep: "#0E0208",
  burgCore: "#4A0E2E",
  roseCore: "#C4847A",
  roseLight: "#E8B4AE",
  rosePale: "#F5DDD9",
  roseWash: "#FDF5F3",
  offWhite: "#FAF5F3",
  white: "#FFFFFF",
  midGrey: "#8A7A76",
  darkGrey: "#3A2A28",
  ink: "#080105",
};

const serif = "'DM Serif Display', Georgia, serif";
const sans = "Montserrat, sans-serif";

// The 7 pinned category pills (+ ALL). Everything else goes in "+ MORE"
const PINNED_CATEGORIES = [
  "Business & Entrepreneurship",
  "Body & Movement",
  "Mindset & Behaviour",
  "Mental Health & Psychology",
  "Health & Medical",
  "Money & Finance",
  "Branding & Visibility",
];

// Category ID → domain label mapping (matches DB category IDs)
const CATEGORY_DOMAIN_MAP = {
  "69f48a8d1e94ea01a3a8c3f9": "Health & Hormones",
  "69f48a8d1e94ea01a3a8c3fa": "Nervous System",
  "69f48a8d1e94ea01a3a8c3fb": "Mindset & Behaviour",
  "69f48a8d1e94ea01a3a8c3fc": "Money",
  "69f48a8d1e94ea01a3a8c3fd": "Leadership & Authority",
  "69f48a8d1e94ea01a3a8c3fe": "Relationships",
  "69f48a8d1e94ea01a3a8c3ff": "Identity & Visibility",
};

// Fallback credential chips derived from title
function credentialsFromTitle(title) {
  if (!title) return [];
  return title.split("|").map(s => s.trim()).filter(Boolean).slice(0, 4);
}

// Map a DB expert record to the card shape
function mapDbExpert(e) {
  const domain = CATEGORY_DOMAIN_MAP[e.category] || "Identity & Visibility";
  return {
    id: e.id,
    name: e.name,
    role: e.title || "",
    domain,
    bio: e.bio || "",
    credentials: credentialsFromTitle(e.title),
    profile_picture: e.profile_picture || null,
    specialties: Array.isArray(e.specialties) ? e.specialties : [],
  };
}

// ─── MODAL ───
function ExpertModal({ expert, mode, onClose }) {
  const closeRef = useRef(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", reason: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const firstName = expert.name.split(" ")[0];

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Please enter a valid email.";
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    base44.integrations.Core.SendEmail({
      to: "hello@alignedwomanco.com",
      subject: `Expert Connection Request — ${expert.name}`,
      body: `Name: ${form.name}\nEmail: ${form.email}\nExpert: ${expert.name}\n\nMessage:\n${form.reason}`,
    }).catch(() => {});
    base44.analytics.track({ eventName: "expert_request_submit", properties: { expert: expert.name } });
    setSubmitted(true);
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(8,1,5,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-heading"
        style={{ background: C.offWhite, borderRadius: 12, padding: "40px 32px", maxWidth: 560, width: "100%", maxHeight: "90vh", overflowY: "auto", position: "relative", animation: "modalIn 0.3s ease" }}
      >
        <style>{`@keyframes modalIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }`}</style>

        {/* Close */}
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close"
          style={{ position: "absolute", top: 16, right: 16, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", borderRadius: 100 }}
        >
          <X size={18} style={{ color: C.midGrey }} />
        </button>

        {/* Expert header */}
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
          <div
            aria-hidden="true"
            style={{ width: 64, height: 64, borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg, ${C.rosePale}, ${C.roseCore})`, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <span style={{ fontFamily: serif, fontStyle: "italic", fontSize: 22, color: C.burgCore }}>
              {expert.name.split(" ").map(p => p[0]).join("").slice(0, 2)}
            </span>
          </div>
          <div>
            <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em", color: C.roseCore, display: "block", marginBottom: 4 }}>
              {expert.domain}
            </span>
            <h2 id="modal-heading" style={{ fontFamily: serif, fontStyle: "italic", fontSize: 24, color: C.burgCore, margin: 0, lineHeight: 1.2 }}>
              {expert.name}
            </h2>
            <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 12, color: C.midGrey, margin: "4px 0 0" }}>{expert.role}</p>
          </div>
        </div>

        <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 13, color: C.darkGrey, lineHeight: 1.65, marginBottom: 16 }}>{expert.bio}</p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
          {expert.credentials.map((c, i) => (
            <span key={i} style={{ background: C.roseWash, padding: "5px 10px", borderRadius: 100, fontFamily: sans, fontWeight: 500, fontSize: 10, color: C.burgCore, letterSpacing: "0.04em" }}>
              {c}
            </span>
          ))}
        </div>

        {mode === "viewOnly" ? (
          <button
            onClick={onClose}
            style={{ width: "100%", background: C.burgCore, color: C.white, border: "none", borderRadius: 100, padding: "14px 20px", fontFamily: sans, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", cursor: "pointer", minHeight: 48 }}
          >
            Close
          </button>
        ) : submitted ? (
          <div style={{ borderLeft: `3px solid ${C.roseCore}`, paddingLeft: 16, marginTop: 8 }}>
            <p style={{ fontFamily: serif, fontStyle: "italic", fontSize: 20, color: C.burgCore, marginBottom: 8 }}>Request received.</p>
            <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 13, color: C.darkGrey, lineHeight: 1.65 }}>
              We'll review your request and connect you with {firstName} within 3 business days.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <p style={{ fontFamily: sans, fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.22em", color: C.roseCore, marginBottom: 20 }}>
              REQUEST A CONNECTION
            </p>

            {[
              { id: "req-name", label: "Your name", type: "text", key: "name", required: true },
              { id: "req-email", label: "Email", type: "email", key: "email", required: true },
            ].map((field) => (
              <div key={field.key} style={{ marginBottom: 14 }}>
                <label htmlFor={field.id} style={{ display: "block", fontFamily: sans, fontWeight: 500, fontSize: 11, color: C.burgCore, marginBottom: 6 }}>
                  {field.label} <span aria-hidden="true" style={{ color: C.roseCore, marginLeft: 2 }}>*</span>
                </label>
                <input
                  id={field.id}
                  type={field.type}
                  aria-required="true"
                  value={form[field.key]}
                  onChange={(e) => { setForm(f => ({ ...f, [field.key]: e.target.value })); setErrors(er => ({ ...er, [field.key]: undefined })); }}
                  style={{ width: "100%", height: 44, background: C.white, border: `1px solid ${errors[field.key] ? "#C4847A" : "rgba(74,14,46,0.15)"}`, borderRadius: 6, padding: "0 12px", fontFamily: sans, fontWeight: 400, fontSize: 13, color: C.darkGrey, boxSizing: "border-box", outline: "none" }}
                  onFocus={(e) => { e.target.style.borderColor = C.roseCore; e.target.style.boxShadow = "0 0 0 3px rgba(196,132,122,0.15)"; }}
                  onBlur={(e) => { e.target.style.borderColor = errors[field.key] ? C.roseCore : "rgba(74,14,46,0.15)"; e.target.style.boxShadow = "none"; }}
                />
                {errors[field.key] && <p role="alert" style={{ fontFamily: sans, fontSize: 11, color: C.roseCore, marginTop: 4 }}>{errors[field.key]}</p>}
              </div>
            ))}

            <div style={{ marginBottom: 20 }}>
              <label htmlFor="req-reason" style={{ display: "block", fontFamily: sans, fontWeight: 500, fontSize: 11, color: C.burgCore, marginBottom: 6 }}>
                What would you like to work on with {firstName}?
              </label>
              <textarea
                id="req-reason"
                rows={4}
                value={form.reason}
                placeholder="A short paragraph helps us match you to the right kind of engagement."
                onChange={(e) => setForm(f => ({ ...f, reason: e.target.value }))}
                style={{ width: "100%", background: C.white, border: "1px solid rgba(74,14,46,0.15)", borderRadius: 6, padding: "10px 12px", fontFamily: sans, fontWeight: 400, fontSize: 13, color: C.darkGrey, boxSizing: "border-box", outline: "none", resize: "vertical" }}
                onFocus={(e) => { e.target.style.borderColor = C.roseCore; e.target.style.boxShadow = "0 0 0 3px rgba(196,132,122,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(74,14,46,0.15)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <button
              type="submit"
              style={{ width: "100%", background: C.roseCore, color: C.burgDeep, border: "none", borderRadius: 100, padding: "16px 20px", fontFamily: sans, fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", cursor: "pointer", minHeight: 48, marginBottom: 10 }}
            >
              Send request +
            </button>
            <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 11, color: C.midGrey, textAlign: "center" }}>
              Typical response within 3 business days.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── EXPERT CARD ───
function ExpertCard({ expert, onConnect, onView, isAdmin }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.white,
        padding: 28,
        border: `1px solid ${hovered ? "rgba(196,132,122,0.4)" : "rgba(74,14,46,0.06)"}`,
        borderRadius: 6,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        boxShadow: hovered ? "0 12px 32px rgba(74,14,46,0.08)" : "none",
        transform: hovered ? "translateY(-2px)" : "none",
        transition: "border-color 0.25s, box-shadow 0.25s, transform 0.25s",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div
          aria-hidden="true"
          style={{ width: 72, height: 72, borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg, ${C.rosePale}, ${C.roseCore})`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}
        >
          {expert.profile_picture ? (
            <img src={expert.profile_picture} alt={`Headshot of ${expert.name}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontFamily: serif, fontStyle: "italic", fontSize: 20, color: C.burgCore }}>
              {expert.name.split(" ").map(p => p[0]).join("").slice(0, 2)}
            </span>
          )}
        </div>
        <div>
          <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em", color: C.roseCore, display: "block", marginBottom: 4 }}>
            {expert.domain}
          </span>
          <h3 style={{ fontFamily: sans, fontWeight: 600, fontSize: 15, color: C.burgCore, lineHeight: 1.3, margin: 0 }}>
            {expert.name}
          </h3>
          <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 12, color: C.midGrey, margin: "2px 0 0" }}>
            {expert.role}
          </p>
        </div>
      </div>

      {/* Bio */}
      <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 13, color: C.darkGrey, lineHeight: 1.65, margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
        {expert.bio}
      </p>

      {/* Specialty tags */}
      {expert.specialties.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {expert.specialties.slice(0, 4).map((s, i) => (
            <span key={i} style={{ background: C.rosePale, padding: "4px 10px", borderRadius: 100, fontFamily: sans, fontWeight: 400, fontSize: 10, color: C.burgCore }}>
              {s}
            </span>
          ))}
          {expert.specialties.length > 4 && (
            <span style={{ background: "transparent", padding: "4px 10px", borderRadius: 100, fontFamily: sans, fontWeight: 400, fontSize: 10, color: C.midGrey, border: "1px solid rgba(74,14,46,0.12)" }}>
              +{expert.specialties.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={() => onView(expert)}
          aria-label={`View profile of ${expert.name}`}
          style={{ flex: 1, background: C.burgCore, color: C.white, border: "none", borderRadius: 100, padding: "12px 20px", fontFamily: sans, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", cursor: "pointer", minHeight: 44 }}
        >
          View profile
        </button>
        {isAdmin && (
          <button
            onClick={() => navigate(`/expert-dashboard?expert_id=${expert.id}`)}
            title="Edit profile (admin)"
            aria-label={`Edit profile of ${expert.name}`}
            style={{ width: 44, height: 44, background: "transparent", border: `1px solid ${C.roseCore}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, color: C.roseCore }}
          >
            <Pencil style={{ width: 15, height: 15 }} />
          </button>
        )}
      </div>
    </div>
  );
}

function slugify(name) {
  return name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "";
}

// ─── MAIN PAGE ───
export default function ExpertsDirectory() {
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "owner";

  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const [showMore, setShowMore] = useState(false);
  const moreRef = useRef(null);
  const [modal, setModal] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { data: dbExperts = [], isLoading } = useQuery({
    queryKey: ["experts-directory-db"],
    queryFn: () => base44.entities.Expert.filter({ isPublished: true }),
  });

  const { data: specialties = [] } = useQuery({
    queryKey: ["specialties-all"],
    queryFn: () => base44.entities.Specialty.list(),
  });

  // Build category map: { "Business & Entrepreneurship": ["Business Strategy", ...], ... }
  const categoryMap = specialties.reduce((acc, s) => {
    if (!s.category || !s.name) return acc;
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s.name);
    return acc;
  }, {});

  // All category names from DB (for "+ MORE" dropdown)
  const allCategories = Object.keys(categoryMap);
  const moreCategories = allCategories.filter(c => !PINNED_CATEGORIES.includes(c));

  // Close "more" dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setShowMore(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    base44.analytics.track({ eventName: "view_experts_page" });
  }, []);

  // Use live DB data, mapped to card shape — Laura always first
  const experts = [...dbExperts]
    .sort((a, b) => {
      const aIsLaura = a.name?.toLowerCase().includes("laura") ? -1 : 0;
      const bIsLaura = b.name?.toLowerCase().includes("laura") ? -1 : 0;
      return aIsLaura - bIsLaura;
    })
    .map(mapDbExpert);

  // Auto-open modal if ?expert=id is in URL
  useEffect(() => {
    const expertId = searchParams.get("expert");
    if (!expertId || !dbExperts.length) return;
    const match = dbExperts.find(e => e.id === expertId);
    if (match) setModal({ expert: mapDbExpert(match), mode: "viewOnly" });
  }, [dbExperts, searchParams]);

  // Filtering
  const filtered = experts.filter(expert => {
    // Category filter
    if (activeCategory !== "ALL") {
      const categorySpecialties = categoryMap[activeCategory] || [];
      const hasMatch = categorySpecialties.some(sp =>
        expert.specialties.map(s => s.toLowerCase()).includes(sp.toLowerCase())
      );
      if (!hasMatch) return false;
    }
    // Search filter
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      const nameMatch = expert.name?.toLowerCase().includes(q);
      const titleMatch = expert.role?.toLowerCase().includes(q);
      const specialtyMatch = expert.specialties.some(s => s.toLowerCase().includes(q));
      if (!nameMatch && !titleMatch && !specialtyMatch) return false;
    }
    return true;
  });

  const handleFilter = (cat) => {
    setActiveCategory(cat);
    setShowMore(false);
    base44.analytics.track({ eventName: "filter_change", properties: { category: cat } });
  };

  const openView = (expert) => {
    base44.analytics.track({ eventName: "expert_profile_view", properties: { expert: expert.name } });
    navigate(`/experts/${slugify(expert.name)}`);
  };

  const openConnect = (expert) => {
    base44.analytics.track({ eventName: "expert_modal_open", properties: { expert: expert.name, mode: "form" } });
    setModal({ expert, mode: "form" });
  };

  return (
    <main id="main-content" style={{ fontFamily: sans, background: C.offWhite, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Montserrat:wght@300;400;500;600;700;800&display=swap');
        *:focus-visible { outline: 2px solid #C4847A !important; outline-offset: 3px !important; }
        .filter-scroll::-webkit-scrollbar { display: none; }
        .filter-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; animation: none !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section style={{ background: C.offWhite, padding: "80px 32px 64px", textAlign: "center" }}>
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <p style={{ fontFamily: sans, fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.22em", color: C.roseCore, marginBottom: 20 }}>
            Credentialed practitioners · Verified expertise
          </p>
          <h1 style={{ fontFamily: serif, fontStyle: "italic", fontSize: "clamp(40px, 6vw, 64px)", color: C.burgCore, lineHeight: 1.1, marginBottom: 28 }}>
            Connect with an expert.
          </h1>
          <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 16, color: C.darkGrey, lineHeight: 1.8, maxWidth: 780, margin: "0 auto 20px" }}>
            The Aligned Woman Co works exclusively with credentialed practitioners, researchers, and specialists whose expertise has been verified, not self-reported. Every expert on this platform has been selected for depth of qualification, relevance to the women we serve, and the ability to deliver measurable outcomes.
          </p>
          <p style={{ fontFamily: sans, fontWeight: 300, fontStyle: "italic", fontSize: 15, color: C.midGrey, lineHeight: 1.85, maxWidth: 780, margin: "0 auto" }}>
            We do not use influencers. We do not platform anyone whose credentials would not hold up under professional scrutiny. This is a deliberate decision. The women who trust this platform deserve practitioners who have earned their authority through years of clinical practice, academic research, or demonstrated professional results. Not through audience size.
          </p>
        </div>
      </section>

      {/* ── STICKY FILTER BAR ── */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: C.offWhite, borderBottom: "1px solid rgba(74,14,46,0.06)", padding: "20px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Search bar */}
          <div style={{ position: "relative", marginBottom: 16 }}>
            <Search style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: C.midGrey, pointerEvents: "none" }} />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by name, specialty, or topic..."
              style={{ width: "100%", height: 44, paddingLeft: 42, paddingRight: searchText ? 42 : 14, background: C.white, border: "1px solid rgba(74,14,46,0.12)", borderRadius: 100, fontFamily: sans, fontWeight: 400, fontSize: 13, color: C.darkGrey, boxSizing: "border-box", outline: "none" }}
              onFocus={(e) => { e.target.style.borderColor = C.roseCore; e.target.style.boxShadow = "0 0 0 3px rgba(196,132,122,0.12)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(74,14,46,0.12)"; e.target.style.boxShadow = "none"; }}
            />
            {searchText && (
              <button onClick={() => setSearchText("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}>
                <X style={{ width: 14, height: 14, color: C.midGrey }} />
              </button>
            )}
          </div>

          {/* Category pills */}
          <div
            role="tablist"
            aria-label="Filter by category"
            className="filter-scroll"
            style={{ display: "flex", gap: 8, overflowX: "auto", flexWrap: "wrap", alignItems: "center" }}
          >
            {/* ALL pill */}
            {["ALL", ...PINNED_CATEGORIES].map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={active}
                  onClick={() => handleFilter(cat)}
                  style={{
                    background: active ? C.burgCore : "transparent",
                    color: active ? C.white : C.burgCore,
                    border: `1px solid ${active ? C.burgCore : "rgba(74,14,46,0.15)"}`,
                    borderRadius: 100,
                    padding: "8px 16px",
                    fontFamily: sans,
                    fontWeight: 500,
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    minHeight: 40,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "background 0.2s, color 0.2s, border-color 0.2s",
                  }}
                >
                  {cat === "ALL" ? "All" : cat}
                </button>
              );
            })}

            {/* + MORE dropdown */}
            {moreCategories.length > 0 && (
              <div ref={moreRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setShowMore(v => !v)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    background: moreCategories.includes(activeCategory) ? C.burgCore : "transparent",
                    color: moreCategories.includes(activeCategory) ? C.white : C.burgCore,
                    border: `1px solid ${moreCategories.includes(activeCategory) ? C.burgCore : "rgba(74,14,46,0.15)"}`,
                    borderRadius: 100, padding: "8px 14px",
                    fontFamily: sans, fontWeight: 500, fontSize: 11,
                    textTransform: "uppercase", letterSpacing: "0.08em",
                    minHeight: 40, cursor: "pointer", whiteSpace: "nowrap",
                    transition: "background 0.2s, color 0.2s",
                  }}
                >
                  {moreCategories.includes(activeCategory) ? activeCategory : "+ More"}
                  <ChevronDown style={{ width: 13, height: 13, transform: showMore ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                </button>
                {showMore && (
                  <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, background: C.white, border: "1px solid rgba(74,14,46,0.1)", borderRadius: 10, padding: "8px 0", minWidth: 220, boxShadow: "0 8px 28px rgba(74,14,46,0.12)", zIndex: 100 }}>
                    {moreCategories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => handleFilter(cat)}
                        style={{
                          display: "block", width: "100%", textAlign: "left",
                          padding: "10px 16px", background: activeCategory === cat ? C.rosePale : "transparent",
                          border: "none", cursor: "pointer",
                          fontFamily: sans, fontWeight: activeCategory === cat ? 600 : 400,
                          fontSize: 12, color: C.burgCore,
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── DIRECTORY ── */}
      <section style={{ background: C.offWhite, padding: "56px 32px 80px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          {/* Result count */}
          <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 12, color: C.midGrey, letterSpacing: "0.06em", textAlign: "center", marginBottom: 32 }}>
            <strong style={{ fontWeight: 600 }}>{filtered.length}</strong> of <strong style={{ fontWeight: 600 }}>{experts.length}</strong> {filtered.length === 1 ? "expert" : "experts"} shown
          </p>

          {/* Grid */}
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "60px 0", fontFamily: sans, fontWeight: 300, fontSize: 14, color: C.midGrey }}>
              Loading experts…
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
              {filtered.map((expert) => (
                <ExpertCard
                  key={expert.id}
                  expert={expert}
                  onConnect={openConnect}
                  onView={openView}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CLOSING CTA ── */}
      <section style={{ background: "linear-gradient(160deg, #0E0208 0%, #1A0510 35%, #4A0E2E 65%, #1A0510 100%)", padding: "80px 32px", textAlign: "center" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <p style={{ fontFamily: sans, fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.22em", color: C.roseCore, marginBottom: 20 }}>
            Not sure who to start with
          </p>
          <h2 style={{ fontFamily: serif, fontStyle: "italic", fontSize: "clamp(28px, 4vw, 40px)", color: C.white, lineHeight: 1.2, marginBottom: 20 }}>
            Tell us what you are navigating. We will match you to the right practitioner.
          </h2>
          <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.75, marginBottom: 32 }}>
            Every match is reviewed personally by our team. We do not auto-route. Each connection is considered against the practitioner's current focus areas and capacity.
          </p>
          <a
            href="mailto:hello@alignedwomanco.com?subject=Expert%20Connection%20Request"
            onClick={() => base44.analytics.track({ eventName: "matched_intro_click" })}
            style={{ display: "inline-block", background: C.roseCore, color: C.burgDeep, borderRadius: 100, padding: "18px 40px", fontFamily: sans, fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", minHeight: 48, textDecoration: "none", lineHeight: "12px" }}
          >
            Request a matched introduction +
          </a>
        </div>
      </section>

      {/* ── MODAL ── */}
      {modal && (
        <ExpertModal
          expert={modal.expert}
          mode={modal.mode}
          onClose={() => setModal(null)}
        />
      )}
    </main>
  );
}