import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Linkedin, Instagram, Globe, Mail, MapPin, Video, Check, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import DashboardSidebar from "@/components/dashboard-v2/DashboardSidebar";

// ────────────────────────────────────────────────────────────────
// Expert profile · the end of the directory journey and the start of a
// working relationship. Everything answers one question: is she qualified,
// and how do I reach her? Credibility first, contact second, discovery last.
//
// This page sits behind ProtectedRoute. Nothing in the directory is public.
// ────────────────────────────────────────────────────────────────

const C = {
  burg: "#4A0E2E",
  rose: "#C4847A",
  roseDeep: "#A86460",
  roseSoft: "#E9B7AC",
  ink: "#2B1220",
  meta: "#92707D",
  onDark: "#F8ECE7",
  // Blush dreamscape gradient stops, named rather than left inline so the
  // surface is defined in one place like every other colour on the page.
  bg1: "#F6EEEA",
  bg2: "#EEDAD3",
  bg3: "#E9D3CD",
  bg4: "#F1E3DD",
  bg5: "#F8F1ED",
};

const GLASS = "rgba(255,255,255,0.42)";
const GLASS_HOVER = "rgba(255,255,255,0.58)";
const DARK_PANEL = "rgba(40,8,24,0.58)";
const CARD_SHADOW = "0 20px 50px rgba(74,14,46,0.09), inset 0 1px 0 rgba(255,255,255,0.55)";
const EASE = "320ms cubic-bezier(0.2,0.7,0.2,1)";

const serif = "'DM Serif Display', Georgia, serif";
const sans = "'Montserrat', system-ui, sans-serif";

const SEAL_IMAGE_URL =
  "https://media.base44.com/images/public/69f46886a412ee042303f1af/c01141aed_aw-verified-seal.png";

// Domain label per category id. The record carries an array, and the first
// non-Founder entry is the one that prints. Indexing this map with the raw
// array returns undefined, which is what made every profile read "Identity &
// Visibility" regardless of who it was.
const CATEGORY_DOMAIN_MAP = {
  "69f48a8d1e94ea01a3a8c3f9": "Health & Hormones",
  "69f48a8d1e94ea01a3a8c3fa": "Nervous System",
  "69f48a8d1e94ea01a3a8c3fb": "Mindset & Behaviour",
  "69f48a8d1e94ea01a3a8c3fc": "Money",
  "69f48a8d1e94ea01a3a8c3fd": "Leadership & Authority",
  "69f48a8d1e94ea01a3a8c3fe": "Relationships",
  "69f48a8d1e94ea01a3a8c3ff": "Identity & Visibility",
};

const DELIVERY_LABELS = {
  online: ["Online"],
  in_person: ["In person"],
  both: ["In person", "Online"],
};

function resolveDomain(expert) {
  if (!expert) return "";
  const ids = Array.isArray(expert.category) ? expert.category : expert.category ? [expert.category] : [];
  return ids.map((id) => CATEGORY_DOMAIN_MAP[id]).find(Boolean) || "";
}

function slugify(name) {
  return (name || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function initials(name) {
  return (name || "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
}

// ─── AW VERIFIED MARK ───
// The full starburst seal is used at hero scale. This is the compact form for
// inline use, where the wordmark inside the seal would be illegible.
function VerifiedMark({ onDark = false }) {
  const fg = onDark ? C.onDark : C.burg;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span
        aria-hidden="true"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 15,
          height: 15,
          borderRadius: "50%",
          background: onDark ? "rgba(248,236,231,0.9)" : C.burg,
          flexShrink: 0,
        }}
      >
        <Check style={{ width: 9, height: 9, color: onDark ? C.burg : "#FFFFFF" }} strokeWidth={3} />
      </span>
      <span
        style={{
          fontFamily: sans,
          fontWeight: 700,
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          color: fg,
        }}
      >
        AW Verified
      </span>
    </span>
  );
}

// ─── CONNECTION FORM ───
function ConnectionForm({ expertName, expertEmail, formRef }) {
  const [form, setForm] = useState({ name: "", email: "", regarding: "", message: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const firstName = expertName?.split(" ")[0] || "there";
  const recipient = (expertEmail || "hello@alignedwomanco.com").trim();

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required.";
    if (!form.regarding) e.regarding = "Please select a reason.";
    if (!form.message.trim()) e.message = "Please include a message.";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setSending(true);
    setSendError("");
    try {
      await base44.integrations.Core.SendEmail({
        to: recipient,
        subject: `New message from ${form.name} via your Aligned Woman profile`,
        body:
          `Hi ${firstName},\n\n` +
          `You have received a message from ${form.name} via your Aligned Woman profile.\n\n` +
          `From: ${form.name} (${form.email})\n` +
          `Regarding: ${form.regarding}\n\n` +
          `Message:\n${form.message}\n\n` +
          `Reply directly to ${form.email} to respond.`,
      });
      base44.analytics.track({
        eventName: "expert_profile_connection_request",
        properties: { expert: expertName },
      });
      setSubmitted(true);
    } catch (err) {
      setSendError(
        "We could not send your message just now. Please try again, or email hello@alignedwomanco.com directly."
      );
    } finally {
      setSending(false);
    }
  };

  const labelStyle = {
    display: "block",
    fontFamily: sans,
    fontWeight: 700,
    fontSize: 10.5,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: C.burg,
    marginBottom: 8,
  };

  const inputStyle = (hasError) => ({
    width: "100%",
    background: "rgba(255,255,255,0.65)",
    border: `1px solid ${hasError ? C.roseDeep : "rgba(74,14,46,0.18)"}`,
    borderRadius: 14,
    padding: "13px 16px",
    fontFamily: sans,
    fontWeight: 400,
    fontSize: 13,
    color: C.ink,
    boxSizing: "border-box",
    outline: "none",
    transition: `border-color ${EASE}`,
  });

  const errorStyle = {
    fontFamily: sans,
    fontWeight: 500,
    fontSize: 11,
    color: C.roseDeep,
    margin: "6px 0 0",
  };

  if (submitted) {
    return (
      <section ref={formRef} id="connect" className="aw-card" style={{ padding: "56px 40px", textAlign: "center" }}>
        <p style={{ fontFamily: serif, fontSize: 26, color: C.burg, margin: "0 0 10px" }}>Message sent.</p>
        <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 13, color: C.ink, opacity: 0.82, margin: 0 }}>
          {firstName} will be in touch with you directly.
        </p>
      </section>
    );
  }

  return (
    <section ref={formRef} id="connect" className="aw-card aw-card--orb" style={{ padding: "56px 40px" }}>
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <p
            style={{
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 10.5,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: C.rose,
              margin: "0 0 12px",
            }}
          >
            Connect
          </p>
          <h2 style={{ fontFamily: serif, fontSize: 30, color: C.burg, lineHeight: 1.2, margin: "0 0 10px" }}>
            Get in touch.
          </h2>
          <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 12.5, color: C.meta, margin: 0 }}>
            Send a message directly to {expertName}.
          </p>
        </div>

        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="cf-name" style={labelStyle}>Your full name</label>
            <input
              id="cf-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
              style={inputStyle(!!errors.name)}
            />
            {errors.name && <p style={errorStyle}>{errors.name}</p>}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label htmlFor="cf-email" style={labelStyle}>Email address</label>
            <input
              id="cf-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              style={inputStyle(!!errors.email)}
            />
            {errors.email && <p style={errorStyle}>{errors.email}</p>}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label htmlFor="cf-regarding" style={labelStyle}>What is this regarding?</label>
            <select
              id="cf-regarding"
              value={form.regarding}
              onChange={(e) => setForm({ ...form, regarding: e.target.value })}
              style={inputStyle(!!errors.regarding)}
            >
              <option value="">Select a reason</option>
              <option value="Working together">Working together</option>
              <option value="A speaking or media request">A speaking or media request</option>
              <option value="A question about her work">A question about her work</option>
              <option value="Something else">Something else</option>
            </select>
            {errors.regarding && <p style={errorStyle}>{errors.regarding}</p>}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label htmlFor="cf-message" style={labelStyle}>Your message</label>
            <textarea
              id="cf-message"
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder={`Your message to ${expertName}...`}
              style={{ ...inputStyle(!!errors.message), height: "auto", resize: "vertical" }}
            />
            {errors.message && <p style={errorStyle}>{errors.message}</p>}
          </div>

          {/* Reassurance sits above the action, never below it. */}
          <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 11.5, color: C.meta, margin: "0 0 18px" }}>
            Your message will be shared with {expertName} directly.
          </p>

          {sendError && <p style={{ ...errorStyle, marginBottom: 14 }}>{sendError}</p>}

          <button type="button" onClick={handleSubmit} disabled={sending} className="aw-btn aw-btn--filled">
            {sending ? "Sending..." : "Send message"}
            <ArrowRight style={{ width: 13, height: 13 }} />
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── FACULTY CARD ───
function FacultyCard({ person }) {
  const domain = resolveDomain(person);
  return (
    <Link to={`/experts/${slugify(person.name)}`} className="aw-faculty" style={{ textDecoration: "none" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
        <div
          aria-hidden="true"
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            flexShrink: 0,
            background: `linear-gradient(135deg, ${C.rose}, ${C.burg})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {person.profile_picture ? (
            <img src={person.profile_picture} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontFamily: serif, fontSize: 14, color: "#FFFFFF" }}>{initials(person.name)}</span>
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          {domain && (
            <span
              style={{
                display: "block",
                fontFamily: sans,
                fontWeight: 700,
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: C.rose,
                marginBottom: 4,
              }}
            >
              {domain}
            </span>
          )}
          <div style={{ marginBottom: 4 }}>
            <VerifiedMark />
          </div>
          <h3
            className="aw-clamp-2"
            style={{ fontFamily: serif, fontWeight: 400, fontSize: 17, color: C.burg, lineHeight: 1.2, margin: 0 }}
          >
            {person.name}
          </h3>
        </div>
      </div>
      <p
        className="aw-clamp-2"
        style={{ fontFamily: sans, fontWeight: 600, fontSize: 11.5, color: C.rose, lineHeight: 1.45, margin: "0 0 10px" }}
      >
        {person.title}
      </p>
      <p
        className="aw-clamp-3"
        style={{ fontFamily: sans, fontWeight: 300, fontSize: 12, color: C.ink, opacity: 0.82, lineHeight: 1.65, margin: "0 0 18px" }}
      >
        {person.bio}
      </p>
      <span className="aw-btn aw-btn--outline" style={{ pointerEvents: "none" }}>
        View profile
      </span>
    </Link>
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

  const { data: allCourses = [] } = useQuery({
    queryKey: ["all-courses-profile"],
    queryFn: () => base44.entities.Course.list(),
  });

  const expert = allExperts.find((e) => slugify(e.name) === slug) || null;
  const otherExperts = allExperts.filter((e) => slugify(e.name) !== slug).slice(0, 3);

  const domain = resolveDomain(expert);
  const firstName = expert?.name?.split(" ")[0] || "";

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (expert) {
      base44.analytics.track({ eventName: "view_expert_profile", properties: { expert: expert.name } });
      document.title = `${expert.name} | The Aligned Woman Co`;
    }
  }, [expert]);

  const pageStyles = (
    <style>{`
      .aw-profile {
        background: linear-gradient(168deg, ${C.bg1} 0%, ${C.bg2} 30%, ${C.bg3} 55%, ${C.bg4} 80%, ${C.bg5} 100%);
        min-height: 100vh;
        position: relative;
        overflow-x: hidden;
      }
      .aw-orb { position: fixed; z-index: 0; pointer-events: none; border-radius: 50%; }
      .aw-orb--haze { top: -220px; left: -180px; width: 760px; height: 760px;
        background: radial-gradient(circle, rgba(233,183,172,0.55), rgba(233,183,172,0)); filter: blur(120px); }
      .aw-orb--sphere { top: 44%; right: -160px; width: 680px; height: 680px; opacity: 0.38;
        background: radial-gradient(circle, ${C.rose}, rgba(196,132,122,0)); filter: blur(28px); }
      .aw-orb--burg { bottom: -160px; left: -120px; width: 540px; height: 540px;
        background: radial-gradient(circle, rgba(74,14,46,0.35), rgba(74,14,46,0)); filter: blur(110px); }

      .aw-card {
        position: relative;
        background: ${GLASS};
        backdrop-filter: blur(32px);
        -webkit-backdrop-filter: blur(32px);
        border-radius: 36px;
        box-shadow: ${CARD_SHADOW};
        transition: background ${EASE};
      }
      .aw-card:hover { background: ${GLASS_HOVER}; }
      .aw-card--orb { overflow: hidden; }
      .aw-card--orb::before {
        content: ""; position: absolute; top: -140px; right: -120px;
        width: 460px; height: 460px; border-radius: 50%; z-index: 0; pointer-events: none;
        background: radial-gradient(circle, rgba(196,132,122,0.34), rgba(196,132,122,0));
        filter: blur(40px);
      }

      .aw-btn {
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        border-radius: 999px; font-family: ${sans}; font-weight: 600; font-size: 12.5px;
        padding: 13px 26px; cursor: pointer; border: none; text-decoration: none;
        transition: background ${EASE}, color ${EASE}, transform ${EASE}, border-color ${EASE};
      }
      .aw-btn:active { transform: scale(0.96); }
      .aw-btn--filled { background: ${C.rose}; color: #FFFFFF; }
      .aw-btn--filled:hover { background: ${C.roseDeep}; }
      .aw-btn--filled:disabled { opacity: 0.6; cursor: default; }
      .aw-btn--outline { background: transparent; color: ${C.burg}; border: 1.5px solid rgba(74,14,46,0.35); }
      .aw-btn--outline:hover { background: ${C.burg}; color: #FFFFFF; border-color: ${C.burg}; }
      .aw-btn--on-dark { background: transparent; color: ${C.onDark}; border: 1px solid rgba(255,255,255,0.4); }
      .aw-btn--on-dark:hover { background: rgba(255,255,255,0.12); }

      .aw-social {
        width: 38px; height: 38px; border-radius: 50%;
        display: inline-flex; align-items: center; justify-content: center;
        border: 1px solid rgba(255,255,255,0.28); color: ${C.onDark};
        transition: background ${EASE};
      }
      .aw-social:hover { background: rgba(255,255,255,0.16); }

      .aw-fact {
        display: inline-flex; align-items: center; gap: 6px;
        background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.28);
        border-radius: 999px; padding: 7px 14px;
        font-family: ${sans}; font-weight: 500; font-size: 11.5px; color: ${C.onDark};
      }

      .aw-chip {
        display: inline-block; background: rgba(255,255,255,0.55);
        border-radius: 999px; padding: 8px 16px;
        font-family: ${sans}; font-weight: 600; font-size: 10.5px; color: ${C.burg};
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
      }

      .aw-faculty {
        display: block; background: ${GLASS}; backdrop-filter: blur(32px);
        -webkit-backdrop-filter: blur(32px); border-radius: 28px; padding: 26px;
        box-shadow: 0 10px 28px rgba(74,14,46,0.06), inset 0 1px 0 rgba(255,255,255,0.55);
        transition: background ${EASE};
      }
      .aw-faculty:hover { background: ${GLASS_HOVER}; }

      .aw-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      .aw-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

      .aw-stack > * + * { margin-top: 96px; }
      .aw-hero-grid { display: grid; grid-template-columns: 210px 1fr; gap: 36px; align-items: center; }
      .aw-services { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
      .aw-faculty-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }

      *:focus-visible { outline: 2px solid ${C.roseDeep} !important; outline-offset: 3px !important; }

      @media (max-width: 1100px) {
        .aw-faculty-grid { grid-template-columns: repeat(2, 1fr); }
        .aw-services { grid-template-columns: 1fr; }
      }
      @media (max-width: 980px) {
        .aw-stack > * + * { margin-top: 56px; }
        .aw-hero-grid { grid-template-columns: 1fr; text-align: left; }
        .aw-faculty-grid { grid-template-columns: 1fr; }
        .aw-card { border-radius: 28px; }
      }
      @media (max-width: 700px) {
        .aw-btn { padding: 14px 22px; }
        .aw-social { width: 44px; height: 44px; }
      }
    `}</style>
  );

  if (isLoading) {
    return (
      <div className="aw-profile" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        {pageStyles}
        <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 14, color: C.meta }}>Loading...</p>
      </div>
    );
  }

  if (!expert) {
    return (
      <div
        className="aw-profile"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}
      >
        {pageStyles}
        <p style={{ fontFamily: serif, fontSize: 28, color: C.burg }}>Expert not found.</p>
        <Link to={createPageUrl("ExpertsDirectory")} className="aw-btn aw-btn--outline">
          Back to all experts
        </Link>
      </div>
    );
  }

  const socials = [];
  if (expert.linkedin_url) socials.push({ icon: <Linkedin size={16} />, href: expert.linkedin_url, label: `${expert.name} on LinkedIn` });
  if (expert.instagram_url) socials.push({ icon: <Instagram size={16} />, href: expert.instagram_url, label: `${expert.name} on Instagram` });
  if (expert.website_url) socials.push({ icon: <Globe size={16} />, href: expert.website_url, label: `${expert.name}'s website` });
  if (expert.email) socials.push({ icon: <Mail size={16} />, href: `mailto:${expert.email}`, label: `Email ${expert.name}` });

  const bioParagraphs = (expert.bio || "").split(/\n\n+/).filter(Boolean);
  const leadSentence = bioParagraphs[0] || "";
  const restParagraphs = bioParagraphs.slice(1);
  const expertiseTags = Array.isArray(expert.specialties) ? expert.specialties : [];
  const services = Array.isArray(expert.services) ? expert.services.filter((s) => s && s.name) : [];
  const locations = Array.isArray(expert.locations) ? expert.locations.filter((l) => l && l.label) : [];
  const deliveryLabels = DELIVERY_LABELS[expert.delivery_mode] || DELIVERY_LABELS.online;

  // Programmes she teaches. Everyone currently teaches the Blueprint. An
  // internal course resolves to its course page, an external one to its url.
  const coursesById = {};
  allCourses.forEach((c) => { coursesById[c.id] = c; });
  const programmes = (Array.isArray(expert.programmes) ? expert.programmes : []).filter((p) => p && (p.course_id || p.url));
  const primaryProgramme = programmes[0] || null;
  const programmeHref = primaryProgramme
    ? primaryProgramme.course_id
      ? `${createPageUrl("CourseDetail")}?courseId=${primaryProgramme.course_id}`
      : primaryProgramme.url
    : null;
  const programmeLabel = programmes.length > 1 ? "View programmes" : "View programme";

  return (
    <div className="min-h-screen flex aw-profile">
      {pageStyles}

      <div className="aw-orb aw-orb--haze" aria-hidden="true" />
      <div className="aw-orb aw-orb--sphere" aria-hidden="true" />
      <div className="aw-orb aw-orb--burg" aria-hidden="true" />

      <DashboardSidebar />

      <div className="flex-1 lg:ml-72" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "32px 40px 104px" }}>

          {/* Back link pulls up into the gap so it reads as a page affordance,
              not a section of its own. */}
          <Link
            to={createPageUrl("ExpertsDirectory")}
            style={{
              display: "inline-block",
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 10.5,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: C.rose,
              textDecoration: "none",
              marginBottom: 24,
            }}
          >
            Back to all experts
          </Link>

          <div className="aw-stack">

            {/* ─── HERO · the credibility block ───
                Order is load-bearing: eyebrow, verification, name, role,
                socials, facts, actions. Verification precedes identity
                because trust precedes identity. */}
            <section
              style={{
                position: "relative",
                background: DARK_PANEL,
                backdropFilter: "blur(32px)",
                WebkitBackdropFilter: "blur(32px)",
                borderRadius: 36,
                padding: "48px 52px",
                overflow: "hidden",
              }}
            >
              <img
                src={SEAL_IMAGE_URL}
                alt="AW Verified"
                className="aw-seal"
                style={{ position: "absolute", top: 28, right: 32, width: 124, height: 124, objectFit: "contain" }}
              />

              <div className="aw-hero-grid">
                <div
                  aria-hidden={expert.profile_picture ? undefined : "true"}
                  style={{
                    width: 210,
                    height: 210,
                    borderRadius: "50%",
                    overflow: "hidden",
                    flexShrink: 0,
                    boxShadow: "0 0 0 2px rgba(233,183,172,0.45), 0 18px 44px rgba(8,1,5,0.35)",
                    background: `linear-gradient(135deg, ${C.rose}, ${C.burg})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {expert.profile_picture ? (
                    <img
                      src={expert.profile_picture}
                      alt={`Portrait of ${expert.name}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span style={{ fontFamily: serif, fontSize: 56, color: "#FFFFFF" }}>{initials(expert.name)}</span>
                  )}
                </div>

                <div style={{ minWidth: 0, paddingRight: 140 }}>
                  {domain && (
                    <p
                      style={{
                        fontFamily: sans,
                        fontWeight: 700,
                        fontSize: 10.5,
                        textTransform: "uppercase",
                        letterSpacing: "0.2em",
                        color: C.onDark,
                        margin: "0 0 10px",
                      }}
                    >
                      {domain}
                    </p>
                  )}

                  <div style={{ marginBottom: 12 }}>
                    <VerifiedMark onDark />
                  </div>

                  <h1 style={{ fontFamily: serif, fontWeight: 400, fontSize: "clamp(32px, 4vw, 46px)", color: C.onDark, lineHeight: 1.1, margin: "0 0 10px" }}>
                    {expert.name}
                  </h1>

                  <p style={{ fontFamily: sans, fontWeight: 400, fontSize: 13.5, color: C.onDark, opacity: 0.9, lineHeight: 1.6, margin: "0 0 22px" }}>
                    {expert.title}
                  </p>

                  {socials.length > 0 && (
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
                      {socials.map((s, i) => (
                        <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="aw-social">
                          {s.icon}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Fact pills carry the same axes the directory filters on,
                      so a filtered result and its profile always agree. */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 26 }}>
                    {locations.map((loc, i) => (
                      <span key={`loc-${i}`} className="aw-fact">
                        <MapPin style={{ width: 12, height: 12 }} aria-hidden="true" />
                        {loc.label}
                      </span>
                    ))}
                    {deliveryLabels.map((label) => (
                      <span key={label} className="aw-fact">
                        {label === "Online" ? (
                          <Video style={{ width: 12, height: 12 }} aria-hidden="true" />
                        ) : (
                          <MapPin style={{ width: 12, height: 12 }} aria-hidden="true" />
                        )}
                        {label}
                      </span>
                    ))}
                  </div>

                  {/* Exactly one filled button above the fold. */}
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <button type="button" onClick={scrollToForm} className="aw-btn aw-btn--filled">
                      Send a message
                      <ArrowRight style={{ width: 13, height: 13 }} />
                    </button>
                    {programmeHref && (
                      <a
                        href={programmeHref}
                        className="aw-btn aw-btn--on-dark"
                        onClick={() =>
                          base44.analytics.track({
                            eventName: "expert_programme_click",
                            properties: { expert: expert.name },
                          })
                        }
                      >
                        {programmeLabel}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* ─── EXPERTISE ───
                Unwrapped on purpose. A scannable index between two heavy
                blocks; a card here would flatten the rhythm. */}
            {expertiseTags.length > 0 && (
              <section>
                <h2 style={{ fontFamily: sans, fontWeight: 600, fontSize: 13, color: C.burg, margin: "0 0 16px" }}>
                  Areas of expertise
                </h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {expertiseTags.map((tag, i) => (
                    <span key={i} className="aw-chip">{tag}</span>
                  ))}
                </div>
              </section>
            )}

            {/* ─── ABOUT, with services nested ─── */}
            {(leadSentence || services.length > 0) && (
              <section className="aw-card aw-card--orb" style={{ padding: "48px 52px" }}>
                <div style={{ position: "relative", zIndex: 1 }}>
                  <p
                    style={{
                      fontFamily: sans,
                      fontWeight: 700,
                      fontSize: 10.5,
                      textTransform: "uppercase",
                      letterSpacing: "0.2em",
                      color: C.rose,
                      margin: "0 0 18px",
                    }}
                  >
                    About
                  </p>

                  {leadSentence && (
                    <p style={{ fontFamily: serif, fontWeight: 400, fontSize: 24, color: C.burg, lineHeight: 1.35, maxWidth: 720, margin: "0 0 24px" }}>
                      {leadSentence}
                    </p>
                  )}

                  {restParagraphs.map((para, i) => (
                    <p
                      key={i}
                      style={{
                        fontFamily: sans,
                        fontWeight: 300,
                        fontSize: 12.5,
                        color: C.ink,
                        opacity: 0.82,
                        lineHeight: 1.85,
                        maxWidth: 720,
                        margin: "0 0 16px",
                      }}
                    >
                      {para}
                    </p>
                  ))}

                  {services.length > 0 && (
                    <div style={{ borderTop: "1px solid rgba(74,14,46,0.12)", paddingTop: 30, marginTop: 30 }}>
                      <p
                        style={{
                          fontFamily: sans,
                          fontWeight: 700,
                          fontSize: 10.5,
                          textTransform: "uppercase",
                          letterSpacing: "0.2em",
                          color: C.rose,
                          margin: "0 0 20px",
                        }}
                      >
                        Services
                      </p>
                      <div className="aw-services">
                        {services.map((s, i) => (
                          <div key={i} style={{ background: "rgba(255,255,255,0.5)", borderRadius: 22, padding: 24 }}>
                            <h3 style={{ fontFamily: serif, fontWeight: 400, fontSize: 17, color: C.burg, lineHeight: 1.25, margin: "0 0 8px" }}>
                              {s.name}
                            </h3>
                            {s.description && (
                              <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 12, color: C.ink, opacity: 0.82, lineHeight: 1.65, margin: 0 }}>
                                {s.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ─── CONTACT ─── */}
            <ConnectionForm expertName={expert.name} expertEmail={expert.email} formRef={formRef} />

            {/* ─── FACULTY ───
                Discovery sits after contact deliberately. */}
            {otherExperts.length > 0 && (
              <section>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
                  <h2 style={{ fontFamily: sans, fontWeight: 600, fontSize: 13, color: C.burg, margin: 0 }}>
                    More from the faculty
                  </h2>
                  <Link
                    to={createPageUrl("ExpertsDirectory")}
                    style={{
                      fontFamily: sans,
                      fontWeight: 700,
                      fontSize: 10.5,
                      textTransform: "uppercase",
                      letterSpacing: "0.16em",
                      color: C.rose,
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    View all experts +
                  </Link>
                </div>
                <div className="aw-faculty-grid">
                  {otherExperts.map((person) => (
                    <FacultyCard key={person.id} person={person} />
                  ))}
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
