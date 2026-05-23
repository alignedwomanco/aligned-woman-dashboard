import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Shield, Check, Linkedin, Instagram, Globe, Mail, ChevronLeft, ArrowRight } from "lucide-react";

// ─── DESIGN TOKENS ───
const C = {
  burgDeep: "#0E0208",
  burgCore: "#4A0E2E",
  burgMid: "#6B1642",
  roseCore: "#C4847A",
  roseLight: "#E8B4AE",
  rosePale: "#F5DDD9",
  roseWash: "#FDF5F3",
  offWhite: "#FAF5F3",
  white: "#FFFFFF",
  midGrey: "#8A7A76",
  darkGrey: "#3A2A28",
};

const serif = "'DM Serif Display', Georgia, serif";
const sans = "Montserrat, sans-serif";

const CATEGORY_DOMAIN_MAP = {
  "69f48a8d1e94ea01a3a8c3f9": "Health & Hormones",
  "69f48a8d1e94ea01a3a8c3fa": "Nervous System",
  "69f48a8d1e94ea01a3a8c3fb": "Mindset & Behaviour",
  "69f48a8d1e94ea01a3a8c3fc": "Money",
  "69f48a8d1e94ea01a3a8c3fd": "Leadership & Authority",
  "69f48a8d1e94ea01a3a8c3fe": "Relationships",
  "69f48a8d1e94ea01a3a8c3ff": "Identity & Visibility",
};

function slugify(name) {
  return name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "";
}

function Initials({ name, size = 72 }) {
  const parts = (name || "").split(" ");
  const initials = (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg, ${C.rosePale}, ${C.roseCore})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontFamily: serif, fontStyle: "italic", fontSize: size * 0.28, color: C.burgCore }}>{initials.toUpperCase()}</span>
    </div>
  );
}

// ─── MINI EXPERT CARD (for "Other Experts") ───
function MiniExpertCard({ expert }) {
  const slug = slugify(expert.name);
  const domain = CATEGORY_DOMAIN_MAP[expert.category] || "Identity & Visibility";

  return (
    <div style={{ background: C.white, border: "1px solid rgba(74,14,46,0.07)", borderRadius: 8, padding: 24, minWidth: 260, maxWidth: 300, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: `linear-gradient(135deg, ${C.rosePale}, ${C.roseCore})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {expert.profile_picture
            ? <img src={expert.profile_picture} alt={`${expert.name}, expert at The Aligned Woman Co`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <Initials name={expert.name} size={56} />}
        </div>
        <div>
          <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 8, textTransform: "uppercase", letterSpacing: "0.2em", color: C.roseCore, display: "block", marginBottom: 3 }}>{domain}</span>
          <p style={{ fontFamily: sans, fontWeight: 600, fontSize: 13, color: C.burgCore, margin: 0, lineHeight: 1.3 }}>{expert.name}</p>
          <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 11, color: C.midGrey, margin: "2px 0 0" }}>{expert.title}</p>
        </div>
      </div>
      {expert.bio && <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 12, color: C.darkGrey, lineHeight: 1.65, margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{expert.bio}</p>}
      <Link
        to={`/experts/${slug}`}
        style={{ display: "inline-block", textAlign: "center", background: C.burgCore, color: C.white, borderRadius: 100, padding: "10px 16px", fontFamily: sans, fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", textDecoration: "none", marginTop: "auto", minHeight: 40, lineHeight: "20px" }}
      >
        View Profile
      </Link>
    </div>
  );
}

// ─── CONNECTION FORM ───
function ConnectionForm({ expertName, formRef }) {
  const [form, setForm] = useState({ name: "", email: "", regarding: "", message: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const firstName = expertName?.split(" ")[0] || "this expert";

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required.";
    if (!form.regarding) e.regarding = "Please select a reason.";
    if (!form.message.trim()) e.message = "Please include a message.";
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    base44.integrations.Core.SendEmail({
      to: "hello@alignedwomanco.com",
      subject: `Expert Connection Request — ${expertName}`,
      body: `Name: ${form.name}\nEmail: ${form.email}\nRegarding: ${form.regarding}\nExpert: ${expertName}\n\nMessage:\n${form.message}`,
    }).catch(() => {});
    base44.analytics.track({ eventName: "expert_profile_connection_request", properties: { expert: expertName } });
    setSubmitted(true);
  };

  const inputStyle = (hasError) => ({
    width: "100%",
    height: 48,
    background: C.white,
    border: `1px solid ${hasError ? C.roseCore : "rgba(74,14,46,0.15)"}`,
    borderRadius: 6,
    padding: "0 16px",
    fontFamily: sans,
    fontWeight: 400,
    fontSize: 14,
    color: C.darkGrey,
    boxSizing: "border-box",
    outline: "none",
  });

  return (
    <section ref={formRef} id="connect" style={{ background: C.offWhite, padding: "80px 32px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        {/* Header — centred above form */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontFamily: sans, fontWeight: 600, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.22em", color: C.roseCore, marginBottom: 16 }}>Connect</p>
          <h2 style={{ fontFamily: serif, fontStyle: "italic", fontSize: 32, color: C.burgCore, lineHeight: 1.2, margin: "0 0 16px" }}>Get in touch.</h2>
          <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 14, color: C.darkGrey, lineHeight: 1.8, margin: 0 }}>
            Send a message directly to {expertName}.
          </p>
        </div>

        {/* Form */}
        <div style={{ background: C.white, borderRadius: 12, padding: 32, boxShadow: "0 4px 20px rgba(74,14,46,0.06)", maxWidth: 600, margin: "0 auto" }}>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.rosePale, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <Check size={24} style={{ color: C.roseCore }} />
              </div>
              <p style={{ fontFamily: serif, fontStyle: "italic", fontSize: 24, color: C.burgCore, marginBottom: 12 }}>Request sent.</p>
              <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 14, color: C.darkGrey, lineHeight: 1.8, marginBottom: 20 }}>
                We have received your connection request for {expertName}. You will hear from us within 48 hours at {form.email}.
              </p>
              <Link to="/ExpertsDirectory" style={{ fontFamily: sans, fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: C.roseCore, textDecoration: "none" }}>
                ← Return to all experts
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Name */}
              <div>
                <label style={{ display: "block", fontFamily: sans, fontWeight: 500, fontSize: 11, color: C.burgCore, marginBottom: 6 }}>
                  Your full name <span style={{ color: C.roseCore }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: undefined })); }}
                  style={inputStyle(errors.name)}
                  onFocus={(e) => { e.target.style.borderColor = C.roseCore; e.target.style.boxShadow = "0 0 0 3px rgba(196,132,122,0.12)"; }}
                  onBlur={(e) => { e.target.style.borderColor = errors.name ? C.roseCore : "rgba(74,14,46,0.15)"; e.target.style.boxShadow = "none"; }}
                />
                {errors.name && <p style={{ fontFamily: sans, fontSize: 11, color: C.roseCore, marginTop: 4 }}>{errors.name}</p>}
              </div>
              {/* Email */}
              <div>
                <label style={{ display: "block", fontFamily: sans, fontWeight: 500, fontSize: 11, color: C.burgCore, marginBottom: 6 }}>
                  Email address <span style={{ color: C.roseCore }}>*</span>
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => { setForm(f => ({ ...f, email: e.target.value })); setErrors(er => ({ ...er, email: undefined })); }}
                  style={inputStyle(errors.email)}
                  onFocus={(e) => { e.target.style.borderColor = C.roseCore; e.target.style.boxShadow = "0 0 0 3px rgba(196,132,122,0.12)"; }}
                  onBlur={(e) => { e.target.style.borderColor = errors.email ? C.roseCore : "rgba(74,14,46,0.15)"; e.target.style.boxShadow = "none"; }}
                />
                {errors.email && <p style={{ fontFamily: sans, fontSize: 11, color: C.roseCore, marginTop: 4 }}>{errors.email}</p>}
              </div>
              {/* Regarding */}
              <div>
                <label style={{ display: "block", fontFamily: sans, fontWeight: 500, fontSize: 11, color: C.burgCore, marginBottom: 6 }}>
                  What is this regarding? <span style={{ color: C.roseCore }}>*</span>
                </label>
                <select
                  value={form.regarding}
                  onChange={(e) => { setForm(f => ({ ...f, regarding: e.target.value })); setErrors(er => ({ ...er, regarding: undefined })); }}
                  style={{ ...inputStyle(errors.regarding), appearance: "none", cursor: "pointer" }}
                  onFocus={(e) => { e.target.style.borderColor = C.roseCore; }}
                  onBlur={(e) => { e.target.style.borderColor = errors.regarding ? C.roseCore : "rgba(74,14,46,0.15)"; }}
                >
                  <option value="">Select a reason</option>
                  <option value="Professional consultation">Professional consultation</option>
                  <option value="Speaking or media enquiry">Speaking or media enquiry</option>
                  <option value="Collaboration opportunity">Collaboration opportunity</option>
                  <option value="Programme-related question">Programme-related question</option>
                  <option value="Other">Other</option>
                </select>
                {errors.regarding && <p style={{ fontFamily: sans, fontSize: 11, color: C.roseCore, marginTop: 4 }}>{errors.regarding}</p>}
              </div>
              {/* Message */}
              <div>
                <label style={{ display: "block", fontFamily: sans, fontWeight: 500, fontSize: 11, color: C.burgCore, marginBottom: 6 }}>
                  Your message <span style={{ color: C.roseCore }}>*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder={`Tell us briefly why you'd like to connect with ${firstName}...`}
                  value={form.message}
                  onChange={(e) => { setForm(f => ({ ...f, message: e.target.value })); setErrors(er => ({ ...er, message: undefined })); }}
                  style={{ width: "100%", background: C.white, border: `1px solid ${errors.message ? C.roseCore : "rgba(74,14,46,0.15)"}`, borderRadius: 6, padding: "12px 16px", fontFamily: sans, fontWeight: 400, fontSize: 14, color: C.darkGrey, boxSizing: "border-box", outline: "none", resize: "vertical" }}
                  onFocus={(e) => { e.target.style.borderColor = C.roseCore; e.target.style.boxShadow = "0 0 0 3px rgba(196,132,122,0.12)"; }}
                  onBlur={(e) => { e.target.style.borderColor = errors.message ? C.roseCore : "rgba(74,14,46,0.15)"; e.target.style.boxShadow = "none"; }}
                />
                {errors.message && <p style={{ fontFamily: sans, fontSize: 11, color: C.roseCore, marginTop: 4 }}>{errors.message}</p>}
              </div>
              <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 11, color: C.midGrey, lineHeight: 1.6 }}>
                Your message will be shared with {expertName} directly.
              </p>
              <button
                type="submit"
                style={{ width: "100%", height: 48, background: C.roseCore, color: C.burgDeep, border: "none", borderRadius: 100, fontFamily: sans, fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", cursor: "pointer" }}
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── MAIN PAGE ───
export default function ExpertProfile() {
  const { slug } = useParams();
  const formRef = useRef(null);

  const { data: allExperts = [], isLoading } = useQuery({
    queryKey: ["all-experts-profile"],
    queryFn: () => base44.entities.Expert.filter({ isPublished: true }),
  });

  const expert = allExperts.find(e => slugify(e.name) === slug) || null;
  const otherExperts = allExperts.filter(e => slugify(e.name) !== slug).slice(0, 4);

  const domain = expert ? (CATEGORY_DOMAIN_MAP[expert.category] || "Identity & Visibility") : "";
  const firstName = expert?.name?.split(" ")[0] || "";

  // Scroll to form
  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (expert) {
      base44.analytics.track({ eventName: "view_expert_profile", properties: { expert: expert.name } });
      document.title = `${expert.name} | ${domain} Expert | The Aligned Woman Co`;
    }
  }, [expert, domain]);

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: C.offWhite, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: sans, fontWeight: 300, fontSize: 14, color: C.midGrey }}>Loading…</div>
      </div>
    );
  }

  if (!expert) {
    return (
      <div style={{ minHeight: "100vh", background: C.offWhite, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
        <p style={{ fontFamily: serif, fontStyle: "italic", fontSize: 28, color: C.burgCore }}>Expert not found.</p>
        <Link to="/ExpertsDirectory" style={{ fontFamily: sans, fontWeight: 500, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", color: C.roseCore, textDecoration: "none" }}>← Back to all experts</Link>
      </div>
    );
  }

  // Parse tags from title
  const titleTags = (expert.title || "").split("|").map(s => s.trim()).filter(Boolean);

  // Social links — only shown if present (we use specialties array as a place to store them, or fallback fields)
  const socials = [];
  if (expert.linkedin_url) socials.push({ icon: <Linkedin size={18} />, href: expert.linkedin_url, label: `View ${expert.name}'s LinkedIn profile` });
  if (expert.instagram_url) socials.push({ icon: <Instagram size={18} />, href: expert.instagram_url, label: `View ${expert.name}'s Instagram` });
  if (expert.website_url) socials.push({ icon: <Globe size={18} />, href: expert.website_url, label: `Visit ${expert.name}'s website` });
  if (expert.email) socials.push({ icon: <Mail size={18} />, href: `mailto:${expert.email}`, label: `Email ${expert.name}` });

  // Bio paragraphs
  const bioParagraphs = (expert.bio || "").split(/\n\n+/).filter(Boolean);

  // Qualifications and experience from specialties (split by type)
  // We store qualifications in specialties array, and experience as extra items
  const qualifications = Array.isArray(expert.qualifications) ? expert.qualifications : [];
  const experience = Array.isArray(expert.experience_points) ? expert.experience_points : [];
  const expertiseTags = Array.isArray(expert.specialties) ? expert.specialties : [];
  const featuredQuote = expert.featured_quote || null;

  return (
    <main style={{ fontFamily: sans, background: C.offWhite, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Montserrat:wght@300;400;500;600;700;800&display=swap');
        *:focus-visible { outline: 2px solid #C4847A !important; outline-offset: 3px !important; }
        .social-icon-btn { transition: background 0.2s, color 0.2s; }
        .social-icon-btn:hover { background: ${C.burgCore} !important; color: #fff !important; }
        .social-icon-btn:hover svg { stroke: #fff !important; }
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .creds-grid { grid-template-columns: 1fr !important; }
          .other-experts-row { flex-wrap: wrap !important; overflow-x: unset !important; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ background: C.white, borderBottom: "1px solid rgba(74,14,46,0.06)", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link to="/" aria-label="Back to homepage">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695154cb868ee011bb627195/23f49bf5a_AlignedWomanLogoPurple.png"
              alt="The Aligned Woman"
              style={{ height: 32, objectFit: "contain" }}
            />
          </Link>
          <Link
            to="/ExpertsDirectory"
            style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: sans, fontWeight: 400, fontSize: 13, color: C.burgCore, textDecoration: "none" }}
            onMouseEnter={(e) => e.currentTarget.style.color = C.roseCore}
            onMouseLeave={(e) => e.currentTarget.style.color = C.burgCore}
          >
            <ChevronLeft size={14} /> Back to All Experts
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ background: C.offWhite, padding: "64px 32px" }}>
        <div className="hero-grid" style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gridTemplateColumns: "40% 60%", gap: 56, alignItems: "start" }}>
          {/* Left — photo */}
          <div>
            <div style={{ borderRadius: 12, overflow: "hidden", maxWidth: 360, aspectRatio: "3/4", boxShadow: "0 8px 32px rgba(74,14,46,0.08)", background: `linear-gradient(135deg, ${C.rosePale}, ${C.roseCore})` }}>
              {expert.profile_picture ? (
                <img
                  src={expert.profile_picture}
                  alt={`${expert.name}, ${domain} specialist at The Aligned Woman Co`}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: serif, fontStyle: "italic", fontSize: 72, color: C.burgCore }}>
                    {expert.name.split(" ").map(p => p[0]).join("").slice(0, 2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right — details */}
          <div style={{ paddingTop: 8 }}>
            <p style={{ fontFamily: sans, fontWeight: 600, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.22em", color: C.roseCore, marginBottom: 12 }}>
              {domain}
            </p>
            <h1 style={{ fontFamily: serif, fontSize: 40, color: C.burgCore, lineHeight: 1.1, margin: "0 0 12px" }}>
              {expert.name}
            </h1>
            <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 16, color: C.midGrey, margin: "0 0 20px" }}>
              {expert.title}
            </p>

            {/* Title tags */}
            {titleTags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                {titleTags.map((tag, i) => (
                  <span key={i} style={{ fontFamily: sans, fontWeight: 400, fontSize: 11, color: C.burgCore, border: "1px solid rgba(74,14,46,0.15)", borderRadius: 100, padding: "6px 14px" }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Social icons */}
            {socials.length > 0 && (
              <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
                {socials.map((s, i) => (
                  <a
                    key={i}
                    href={s.href}
                    target={s.href.startsWith("mailto") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="social-icon-btn"
                    style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid rgba(74,14,46,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: C.burgCore, textDecoration: "none" }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            )}

            {/* CTAs */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <button
                onClick={scrollToForm}
                style={{ background: C.roseCore, color: C.burgDeep, border: "none", borderRadius: 100, padding: "14px 32px", fontFamily: sans, fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", minHeight: 48 }}
              >
                Send a Message
              </button>
              <a
                href="/blueprint"
                style={{ background: "transparent", color: C.burgCore, border: "1px solid rgba(74,14,46,0.2)", borderRadius: 100, padding: "14px 32px", fontFamily: sans, fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", textDecoration: "none", minHeight: 48, display: "inline-flex", alignItems: "center" }}
              >
                View Programme
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      {bioParagraphs.length > 0 && (
        <section style={{ padding: "0 32px 40px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ background: C.white, borderRadius: 12, padding: "40px", boxShadow: "0 2px 16px rgba(74,14,46,0.04)" }}>
              <p style={{ fontFamily: sans, fontWeight: 600, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.22em", color: C.roseCore, marginBottom: 20 }}>About</p>
              <div>
                {bioParagraphs.map((p, i) => (
                  <p key={i} style={{ fontFamily: sans, fontWeight: 300, fontSize: 15, color: C.darkGrey, lineHeight: 1.88, margin: i < bioParagraphs.length - 1 ? "0 0 20px" : 0 }}>
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── CREDENTIALS ── */}
      {(qualifications.length > 0 || experience.length > 0) && (
        <section style={{ padding: "0 32px 40px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ background: C.white, borderRadius: 12, padding: "40px", boxShadow: "0 2px 16px rgba(74,14,46,0.04)" }}>
              <p style={{ fontFamily: sans, fontWeight: 600, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.22em", color: C.roseCore, marginBottom: 28 }}>Credentials</p>
              <div className="creds-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
                {qualifications.length > 0 && (
                  <div>
                    <p style={{ fontFamily: sans, fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: C.burgCore, marginBottom: 16 }}>Qualifications</p>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {qualifications.map((q, i) => (
                        <li key={i} style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.roseCore, flexShrink: 0, marginTop: 6 }} />
                          <span style={{ fontFamily: sans, fontWeight: 300, fontSize: 14, color: C.darkGrey, lineHeight: 2 }}>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {experience.length > 0 && (
                  <div>
                    <p style={{ fontFamily: sans, fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: C.burgCore, marginBottom: 16 }}>Experience</p>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {experience.map((ex, i) => (
                        <li key={i} style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.roseCore, flexShrink: 0, marginTop: 6 }} />
                          <span style={{ fontFamily: sans, fontWeight: 300, fontSize: 14, color: C.darkGrey, lineHeight: 2 }}>{ex}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid rgba(74,14,46,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
                <Shield size={12} style={{ color: C.midGrey, flexShrink: 0 }} />
                <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 12, fontStyle: "italic", color: C.midGrey, margin: 0 }}>
                  All credentials listed on this page have been independently verified by The Aligned Woman Co.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── AREAS OF EXPERTISE ── */}
      {expertiseTags.length > 0 && (
        <section style={{ padding: "16px 32px 56px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <p style={{ fontFamily: sans, fontWeight: 600, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.22em", color: C.roseCore, marginBottom: 20 }}>Areas of Expertise</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {expertiseTags.map((tag, i) => (
                <span key={i} style={{ background: C.rosePale, color: C.burgCore, borderRadius: 100, padding: "10px 20px", fontFamily: sans, fontWeight: 400, fontSize: 13 }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── PROGRAMME APPEARANCES ── */}
      <section style={{ padding: "0 32px 56px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ background: C.white, borderRadius: 12, padding: 40, boxShadow: "0 2px 16px rgba(74,14,46,0.04)" }}>
            <p style={{ fontFamily: sans, fontWeight: 600, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.22em", color: C.roseCore, marginBottom: 8 }}>Programmes</p>
            <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 14, color: C.midGrey, marginBottom: 24 }}>Currently teaching in:</p>
            <div style={{ border: "1px solid rgba(74,14,46,0.06)", borderRadius: 8, padding: 32 }}>
              <p style={{ fontFamily: sans, fontWeight: 700, fontSize: 16, color: C.burgCore, marginBottom: 6 }}>THE ALIGNED WOMAN BLUEPRINT™</p>
              <p style={{ fontFamily: sans, fontWeight: 400, fontSize: 13, color: C.midGrey, marginBottom: 16 }}>
                Domain: {domain}
              </p>
              {expert.module_quote && (
                <p style={{ fontFamily: serif, fontStyle: "italic", fontSize: 15, color: C.burgCore, lineHeight: 1.65, marginBottom: 20 }}>
                  "{expert.module_quote}"
                </p>
              )}
              <a
                href="/blueprint"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: sans, fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: C.roseCore, textDecoration: "none" }}
              >
                Explore the Programme <ArrowRight size={13} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED QUOTE ── */}
      {featuredQuote && (
        <section style={{ background: "linear-gradient(160deg, #0E0208 0%, #1A0510 35%, #4A0E2E 65%, #1A0510 100%)", padding: "80px 32px", textAlign: "center" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ fontFamily: serif, fontSize: 120, color: "rgba(196,132,122,0.15)", lineHeight: 0.6, marginBottom: 32, userSelect: "none" }}>"</div>
            <p style={{ fontFamily: serif, fontStyle: "italic", fontSize: 24, color: C.white, lineHeight: 1.6, marginBottom: 24 }}>
              {featuredQuote}
            </p>
            <p style={{ fontFamily: sans, fontWeight: 500, fontSize: 13, color: C.roseCore }}>— {expert.name}</p>
          </div>
        </section>
      )}

      {/* ── CONNECTION FORM ── */}
      <ConnectionForm expertName={expert.name} formRef={formRef} />

      {/* ── OTHER EXPERTS ── */}
      {otherExperts.length > 0 && (
        <section style={{ padding: "56px 32px 80px", background: C.offWhite }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <p style={{ fontFamily: sans, fontWeight: 600, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.22em", color: C.roseCore, marginBottom: 12 }}>Other Experts</p>
            <h2 style={{ fontFamily: serif, fontStyle: "italic", fontSize: 28, color: C.burgCore, marginBottom: 32 }}>More from the faculty.</h2>
            <div className="other-experts-row" style={{ display: "flex", gap: 20, overflowX: "auto", paddingBottom: 8 }}>
              {otherExperts.map(e => <MiniExpertCard key={e.id} expert={e} />)}
            </div>
            <div style={{ marginTop: 24 }}>
              <Link
                to="/ExpertsDirectory"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: sans, fontWeight: 500, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", color: C.roseCore, textDecoration: "none" }}
              >
                View all experts <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer style={{ background: C.burgCore, color: C.white }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "56px 32px 32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 40, marginBottom: 40 }}>
            <div>
              <p style={{ fontFamily: sans, fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>THE ALIGNED WOMAN BLUEPRINT™</p>
              <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.75 }}>
                Your personal operating system for embodied success. Powered by the ALIVE Method™.
              </p>
            </div>
            <div>
              <p style={{ fontFamily: sans, fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: C.roseCore, marginBottom: 12 }}>Navigate</p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {[["Home", "/"], ["Blueprint", "/blueprint"], ["About Us", "/about-us"], ["Experts", "/ExpertsDirectory"]].map(([label, href]) => (
                  <li key={label}><a href={href} style={{ fontFamily: sans, fontWeight: 300, fontSize: 13, color: "rgba(255,255,255,0.65)", textDecoration: "none" }}>{label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p style={{ fontFamily: sans, fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: C.roseCore, marginBottom: 12 }}>Connect</p>
              <a href="mailto:hello@alignedwomanco.com" style={{ fontFamily: sans, fontWeight: 300, fontSize: 13, color: "rgba(255,255,255,0.65)", textDecoration: "none" }}>hello@alignedwomanco.com</a>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24, textAlign: "center" }}>
            <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
              © {new Date().getFullYear()} The Aligned Woman Blueprint. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}