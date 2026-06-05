import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Shield, ChevronDown, ChevronUp } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  CONSTANTS                                                          */
/* ------------------------------------------------------------------ */

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/6oU7sN7Vkg8p1Cp5p7eME06";

// Authed entry that claims access on first sign-in and lands the buyer in the
// course. The success screens and the welcome email all point here.
const SIGN_IN_URL = "https://app.alignedwomanco.com/Dashboard";

const PURCHASE_TYPES = [
  { id: "self", label: "Purchase for myself", sub: "Secure your place in the course." },
  { id: "friend", label: "Gift to a friend", sub: "Gift access to someone you believe in." },
  { id: "daughter", label: "Gift to my daughter", sub: "Invest in her future." },
  { id: "charity", label: "Gift a seat to a woman in need", sub: "Help another woman access this education." },
  { id: "bulk", label: "Team or school (bulk)", sub: "Request team pricing and invoicing." },
];

const INCLUDED_ITEMS = [
  "13 specialist-led modules across 7 life domains",
  "The ALIVE Method sequenced framework",
  "Deep-work workbooks and progress tracking",
  "Private community access",
  "Low Energy Entry Points Guide",
  "LauraAI Beta access",
];

const SUCCESS_COPY = {
  self: {
    headline: "You\u2019re in.",
    body: () => `Your access to The Aligned Woman Blueprint\u2122 is ready now.`,
    steps: (f) => [
      { title: "Sign in to your course", body: `Use the email you paid with, ${f.email}. That is the address your access is linked to.` },
      { title: "You land straight in", body: "Signing in takes you into your dashboard with the Blueprint already unlocked. There is nothing to wait for." },
      { title: "Your community is included", body: "Access to the private community comes with your place. You will find it inside your dashboard." },
    ],
  },
  friend: {
    headline: "Your gift is on its way.",
    body: (f) => `You have given ${f.friendName || "your friend"} access to The Aligned Woman Blueprint\u2122. She will receive an email at ${f.friendEmail} with your message and how to sign in.`,
    steps: (f) => [
      { title: "She receives an email", body: `Sent to ${f.friendEmail} with your personal message and a sign-in link.` },
      { title: "She signs in and she is in", body: "She signs in with that email and lands straight in the course. There is nothing to wait for." },
      { title: "You are notified", body: `A confirmation copy has been sent to ${f.email}.` },
    ],
  },
  daughter: {
    headline: "Her place is ready.",
    body: (f) => `You have given ${f.daughterName || "your daughter"} access to The Aligned Woman Blueprint\u2122. She will receive an email at ${f.daughterEmail} with your message and how to sign in.`,
    steps: (f) => [
      { title: "She receives an email", body: `Sent to ${f.daughterEmail} with a sign-in link.` },
      { title: "She signs in and she is in", body: "She signs in with that email and lands straight in the course. There is nothing to wait for." },
      { title: "You are notified", body: `A confirmation copy has been sent to ${f.email}.` },
    ],
  },
  charity: {
    headline: "You just changed someone\u2019s future.",
    body: () => "Your contribution has funded a full seat in The Aligned Woman Blueprint\u2122 for a woman who could not otherwise access it. You will be notified when your gift has been allocated.",
    steps: (f) => [
      { title: "Confirmation sent", body: `A receipt has been sent to ${f.email}.` },
      { title: "Allocation in progress", body: "Our team will match your gift with a recipient." },
      { title: "You will hear from us", body: "We will notify you when the seat has been allocated. No recipient details are shared, for her privacy." },
    ],
  },
  bulk: {
    headline: "Request received.",
    body: (f) => `We have received your team pricing enquiry and will be in touch within 2 business days at ${f.email}.`,
    steps: null,
  },
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ------------------------------------------------------------------ */
/*  HELPER: Validation                                                 */
/* ------------------------------------------------------------------ */

function getRequiredFields(type) {
  const base = ["name", "email"];
  if (type === "friend") return [...base, "friendName", "friendEmail"];
  if (type === "daughter") return [...base, "daughterName", "daughterEmail"];
  if (type === "bulk") return [...base, "org", "seats"];
  return base;
}

function validateField(field, value) {
  if (!value || (typeof value === "string" && !value.trim())) {
    return "This field is required.";
  }
  if ((field === "email" || field === "friendEmail" || field === "daughterEmail") && !EMAIL_REGEX.test(value)) {
    return "Please enter a valid email address.";
  }
  if (field === "seats" && (isNaN(value) || Number(value) < 1)) {
    return "Please enter at least 1 seat.";
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  SUB-COMPONENTS                                                     */
/* ------------------------------------------------------------------ */

function RadioCircle({ active }) {
  return (
    <div
      className="shrink-0 rounded-full flex items-center justify-center"
      style={{
        width: 20,
        height: 20,
        border: active ? "none" : "2px solid rgba(74,14,46,0.25)",
        background: active ? "#C4847A" : "transparent",
      }}
    >
      {active && <div className="rounded-full bg-white" style={{ width: 7, height: 7 }} />}
    </div>
  );
}

function PurchaseTypeCard({ item, active, onClick }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className="w-full text-left flex items-start gap-3.5 transition-all"
      style={{
        minHeight: 72,
        padding: "18px 20px",
        background: active ? "#FDF5F3" : "#FFFFFF",
        border: "1px solid rgba(74,14,46,0.06)",
        borderLeft: active ? "3px solid #C4847A" : "3px solid transparent",
        borderRadius: 8,
        cursor: "pointer",
      }}
    >
      <RadioCircle active={active} />
      <div>
        <div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 15, color: "#4A0E2E" }}>
          {item.label}
        </div>
        <div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: 13, color: "#8A7A76", lineHeight: 1.5, marginTop: 2 }}>
          {item.sub}
        </div>
      </div>
    </button>
  );
}

function FormInput({ label, id, error, touched, required, ...props }) {
  const hasError = touched && error;
  return (
    <div>
      <label
        htmlFor={id}
        style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500, fontSize: 12, color: "#4A0E2E", display: "block", marginBottom: 8 }}
      >
        {label}{required && <span style={{ color: "#C4847A" }}> *</span>}
      </label>
      {props.rows ? (
        <textarea
          id={id}
          aria-required={required}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? `${id}-err` : undefined}
          className="w-full transition-all"
          style={{
            minHeight: 88,
            padding: "12px 16px",
            borderRadius: 6,
            border: `1px solid ${hasError ? "#C0392B" : "rgba(74,14,46,0.15)"}`,
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 400,
            fontSize: 14,
            color: "#3A2A28",
            background: "#FFFFFF",
            outline: "none",
            resize: "vertical",
          }}
          {...props}
        />
      ) : (
        <input
          id={id}
          aria-required={required}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? `${id}-err` : undefined}
          className="w-full transition-all"
          style={{
            height: 48,
            padding: "0 16px",
            borderRadius: 6,
            border: `1px solid ${hasError ? "#C0392B" : "rgba(74,14,46,0.15)"}`,
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 400,
            fontSize: 14,
            color: "#3A2A28",
            background: "#FFFFFF",
            outline: "none",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = hasError ? "#C0392B" : "#C4847A";
            e.target.style.boxShadow = `0 0 0 3px rgba(196,132,122,0.15)`;
          }}
          onBlurCapture={(e) => {
            e.target.style.borderColor = hasError ? "#C0392B" : "rgba(74,14,46,0.15)";
            e.target.style.boxShadow = "none";
          }}
          {...props}
        />
      )}
      {hasError && (
        <p role="alert" id={`${id}-err`} style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400, fontSize: 12, color: "#C0392B", marginTop: 6 }}>
          {error}
        </p>
      )}
    </div>
  );
}

function SectionDivider({ text }) {
  return (
    <div style={{ marginTop: 32, marginBottom: 20, paddingBottom: 10, borderBottom: "1px solid rgba(74,14,46,0.08)" }}>
      <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4A0E2E" }}>
        {text}
      </span>
    </div>
  );
}

function CustomCheckbox({ checked, onChange, children, required }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer" style={{ minHeight: 44, padding: "10px 0" }}>
      <div className="relative shrink-0" style={{ width: 20, height: 20, marginTop: 1 }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
          style={{ width: 20, height: 20 }}
        />
        <div
          className="flex items-center justify-center rounded transition-all"
          style={{
            width: 20,
            height: 20,
            border: checked ? "none" : "1.5px solid rgba(74,14,46,0.25)",
            borderRadius: 3,
            background: checked ? "#4A0E2E" : "transparent",
          }}
        >
          {checked && (
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
              <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>
      <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: 13, color: "#3A2A28", lineHeight: 1.55 }}>
        {children}
      </span>
    </label>
  );
}

function AnimatedCheck() {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <motion.circle
          cx="32" cy="32" r="29"
          stroke="#4A0E2E"
          strokeWidth="2.5"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
        <motion.path
          d="M20 33L28 41L44 24"
          stroke="#4A0E2E"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.5, ease: "easeInOut" }}
        />
      </svg>
    </motion.div>
  );
}

function OrderSummaryContent() {
  return (
    <>
      <div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "#8A7A76", marginBottom: 16 }}>
        ORDER SUMMARY
      </div>
      <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: "italic", fontSize: 20, color: "#4A0E2E", marginBottom: 4 }}>
        The Aligned Woman Blueprint&trade;
      </div>
      <div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: 12, color: "#8A7A76", marginBottom: 20 }}>
        Lifetime access &middot; Always open
      </div>
      <div style={{ height: 1, background: "rgba(74,14,46,0.06)", marginBottom: 20 }} />
      <ul className="space-y-2.5" style={{ marginBottom: 20 }}>
        {INCLUDED_ITEMS.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0 mt-0.5">
              <path d="M3 8L6.5 11.5L13 4.5" stroke="#C4847A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400, fontSize: 13, color: "#3A2A28", lineHeight: 1.5 }}>
              {item}
            </span>
          </li>
        ))}
      </ul>
      <div style={{ height: 1, background: "rgba(74,14,46,0.06)", marginBottom: 20 }} />
      <div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400, fontSize: 11, color: "#8A7A76", marginBottom: 4 }}>
        Private value
      </div>
      <div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400, fontSize: 14, color: "#C8B8B4", textDecoration: "line-through", marginBottom: 16 }}>
        R116,200
      </div>
      <div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400, fontSize: 11, color: "#8A7A76", marginBottom: 4 }}>
        Your investment
      </div>
      <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: "italic", fontSize: 36, color: "#4A0E2E", lineHeight: 1, marginBottom: 4 }}>
        R3,997
      </div>
      <div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: 12, color: "#8A7A76", marginBottom: 2 }}>
        &asymp; $215 USD
      </div>
      <div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontStyle: "italic", fontSize: 10, color: "#8A7A76", marginBottom: 0 }}>
        * Price may vary slightly based on exchange rate
      </div>
    </>
  );
}

function TrustSignals() {
  return (
    <div className="flex items-center justify-center gap-5 flex-wrap" style={{ marginTop: 16 }}>
      <span className="flex items-center gap-1.5" style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: 10, color: "#8A7A76" }}>
        <Lock style={{ width: 12, height: 12 }} /> 256-bit SSL encrypted
      </span>
      <span className="flex items-center gap-1.5" style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: 10, color: "#8A7A76" }}>
        <Shield style={{ width: 12, height: 12 }} /> Stripe secure payments
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SUCCESS SCREEN                                                     */
/* ------------------------------------------------------------------ */

function SuccessScreen({ type, form }) {
  const headingRef = useRef(null);
  const copy = SUCCESS_COPY[type] || SUCCESS_COPY.self;

  // Bulk is an enquiry, not a purchase, so it gets no sign-in action.
  const showSignIn = type !== "bulk";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => headingRef.current?.focus(), 600);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-[600px] mx-auto text-center"
      style={{ padding: "80px 24px" }}
    >
      <div className="flex justify-center mb-8">
        <AnimatedCheck />
      </div>

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="outline-none"
        style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: "italic", fontSize: "clamp(32px, 5vw, 40px)", color: "#4A0E2E", marginBottom: 16 }}
      >
        {copy.headline}
      </h1>

      <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: 16, color: "#3A2A28", lineHeight: 1.65, marginBottom: 40 }}>
        {copy.body(form)}
      </p>

      {copy.steps && (
        <div className="text-left" style={{ background: "#FFFFFF", borderRadius: 12, boxShadow: "0 4px 24px rgba(74,14,46,0.06)", padding: 32, marginBottom: 32 }}>
          {copy.steps(form).map((step, i) => (
            <div key={i}>
              <div className="flex items-start gap-4" style={{ padding: "0 0 18px 0" }}>
                <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: "italic", fontSize: 20, color: "#C4847A", lineHeight: 1, minWidth: 24 }}>
                  {i + 1}
                </span>
                <div>
                  <div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 14, color: "#4A0E2E", marginBottom: 4 }}>
                    {step.title}
                  </div>
                  <div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: 13, color: "#3A2A28", lineHeight: 1.65 }}>
                    {step.body}
                  </div>
                </div>
              </div>
              {i < copy.steps(form).length - 1 && (
                <div style={{ height: 1, background: "rgba(74,14,46,0.06)", marginBottom: 18 }} />
              )}
            </div>
          ))}
        </div>
      )}

      {showSignIn && (
        <a
          href={SIGN_IN_URL}
          className="inline-flex items-center justify-center transition-all"
          style={{
            height: 56,
            padding: "0 40px",
            borderRadius: 100,
            background: "#C4847A",
            color: "#0E0208",
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          Sign in to your course
        </a>
      )}

      {showSignIn && (
        <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontStyle: "italic", fontSize: 13, color: "#8A7A76", lineHeight: 1.65, marginTop: 20 }}>
          Sign in with the same email you paid with. That is the address your access is linked to.
        </p>
      )}

      <div style={{ marginTop: 48 }}>
        <a
          href="/"
          style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500, fontSize: 13, color: "#4A0E2E", textDecoration: "underline", textUnderlineOffset: 4 }}
        >
          &larr; Return to The Aligned Woman Co
        </a>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  MOBILE ORDER SUMMARY (collapsible)                                 */
/* ------------------------------------------------------------------ */

function MobileOrderSummary({ open, onToggle }) {
  return (
    <div className="lg:hidden" style={{ background: "#FFFFFF", boxShadow: "0 4px 16px rgba(74,14,46,0.06)", borderRadius: 8, marginBottom: 24, overflow: "hidden" }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between"
        style={{ padding: "16px 20px" }}
      >
        <div>
          <div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500, fontSize: 14, color: "#4A0E2E" }}>
            The Aligned Woman Blueprint&trade;
          </div>
          <div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400, fontSize: 11, color: "#8A7A76" }}>
            Lifetime access &middot; Always open
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: "italic", fontSize: 22, color: "#4A0E2E" }}>
            R3,997
          </span>
          <span className="flex items-center gap-1" style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400, fontSize: 11, color: "#C4847A" }}>
            {open ? "Hide details" : "View details"}
            {open ? <ChevronUp style={{ width: 14, height: 14 }} /> : <ChevronDown style={{ width: 14, height: 14 }} />}
          </span>
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 24px 24px" }}>
              <div style={{ height: 1, background: "rgba(74,14,46,0.06)", marginBottom: 20 }} />
              <OrderSummaryContent />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN CHECKOUT PAGE                                                 */
/* ------------------------------------------------------------------ */

export default function Checkout() {
  const [type, setType] = useState("self");
  const [form, setForm] = useState({ name: "", email: "", friendName: "", friendEmail: "", daughterName: "", daughterEmail: "", org: "", seats: "", message: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [agreed, setAgreed] = useState(false);
  const [updates, setUpdates] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [stage, setStage] = useState("form");
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  const firstInvalidRef = useRef(null);

  // Check for success return from Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true" || params.get("session_id")) {
      setStage("success");
    }
  }, []);

  // Read affiliate code from sessionStorage
  const affiliateCode = typeof window !== "undefined" ? sessionStorage.getItem("aff") || "" : "";

  const updateField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setPaymentError(null);
    // Clear error on edit
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  const handleBlur = useCallback((field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const required = getRequiredFields(type);
    if (required.includes(field)) {
      const err = validateField(field, form[field]);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  }, [type, form]);

  const validateAll = useCallback(() => {
    const required = getRequiredFields(type);
    const newErrors = {};
    const newTouched = {};
    let firstInvalid = null;

    required.forEach((field) => {
      newTouched[field] = true;
      const err = validateField(field, form[field]);
      if (err) {
        newErrors[field] = err;
        if (!firstInvalid) firstInvalid = field;
      }
    });

    setErrors(newErrors);
    setTouched(newTouched);

    if (firstInvalid) {
      const el = document.getElementById(firstInvalid);
      el?.focus();
      return false;
    }
    return true;
  }, [type, form]);

  const handleSubmit = async () => {
    if (processing) return;
    if (!validateAll()) return;

    setProcessing(true);
    setPaymentError(null);

    try {
      // Save abandoned cart as a completed record
      try {
        await base44.entities.AbandonedCart.create({
          email: form.email,
          first_name: form.name,
          purchase_type: type.toUpperCase(),
          selected_plan: "full",
          affiliate_code: affiliateCode,
          recovered: false,
        });
      } catch (_) { /* best effort */ }

      if (type === "bulk") {
        // Bulk enquiry: save and show success (no payment)
        try {
          await base44.entities.BulkEnquiry.create({
            company_name: form.org,
            contact_name: form.name,
            email: form.email,
            seats_requested: Number(form.seats),
            message: form.message,
            status: "new",
          });
        } catch (_) { /* best effort */ }

        setStage("success");
        return;
      }

      // For all payment types, redirect to Stripe Payment Link
      const url = new URL(STRIPE_PAYMENT_LINK);

      // Pass affiliate code for commission tracking
      if (affiliateCode) {
        url.searchParams.set("client_reference_id", affiliateCode);
      }

      // Pre-fill email on Stripe checkout
      if (form.email) {
        url.searchParams.set("prefilled_email", form.email);
      }

      window.location.href = url.toString();
    } catch (err) {
      setProcessing(false);
      setPaymentError("We couldn\u2019t complete your payment. Please try again or contact hello@alignedwomanco.com for assistance.");
    }
  };

  // Show based on purchase type
  const showRecipientFields = type === "friend" || type === "daughter";
  const showBulkFields = type === "bulk";
  const ctaLabel = type === "bulk" ? "REQUEST TEAM PRICING" : "BEGIN YOUR BLUEPRINT +";

  /* ---------------------------------------------------------------- */
  /*  SUCCESS STATE                                                    */
  /* ---------------------------------------------------------------- */

  if (stage === "success") {
    return (
      <main id="main-content" style={{ background: "#FAF5F3", minHeight: "80vh" }}>
        <SuccessScreen type={type} form={form} />
      </main>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  FORM STATE                                                       */
  /* ---------------------------------------------------------------- */

  return (
    <main id="main-content" style={{ background: "#FAF5F3", minHeight: "100vh" }}>
      <div
        className="mx-auto"
        style={{
          maxWidth: 1080,
          padding: "56px 32px 96px",
        }}
      >
        {/* Page Intro */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "#C4847A", marginBottom: 12 }}>
            YOUR BLUEPRINT BEGINS HERE
          </p>
          <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: "italic", fontSize: "clamp(28px, 4.5vw, 36px)", color: "#4A0E2E", lineHeight: 1.15, marginBottom: 12 }}>
            One step away.
          </h1>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: 15, color: "#8A7A76", lineHeight: 1.7, maxWidth: 560 }}>
            Complete your details below to secure your place.
          </p>
        </div>

        {/* Mobile Order Summary */}
        <MobileOrderSummary open={mobileSummaryOpen} onToggle={() => setMobileSummaryOpen(!mobileSummaryOpen)} />

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row" style={{ gap: 56 }}>

          {/* LEFT: Form Column */}
          <div className="w-full lg:w-[58%]">

            {/* Purchase Type Selector */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4A0E2E", marginBottom: 16 }}>
                THIS PURCHASE IS
              </div>
              <div role="radiogroup" aria-label="Purchase type" className="flex flex-col" style={{ gap: 8 }}>
                {PURCHASE_TYPES.map((item) => (
                  <PurchaseTypeCard
                    key={item.id}
                    item={item}
                    active={type === item.id}
                    onClick={() => { setType(item.id); setPaymentError(null); }}
                  />
                ))}
              </div>
            </div>

            {/* Charity notice */}
            {type === "charity" && (
              <div style={{ background: "#FDF5F3", borderLeft: "3px solid #C4847A", padding: "16px 20px", borderRadius: 4, marginBottom: 32 }}>
                <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: 13, color: "#3A2A28", lineHeight: 1.7 }}>
                  Your contribution will fund access for a woman who cannot currently afford the programme. You will not receive the recipient's details, but you will be notified when your gift has been allocated.
                </p>
              </div>
            )}

            {/* Bulk notice */}
            {type === "bulk" && (
              <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: 13, color: "#8A7A76", lineHeight: 1.7, marginBottom: 32 }}>
                For team or school enquiries, we'll connect you with our partnerships team within 2 business days.
              </p>
            )}

            {/* Form Fields */}
            <div className="space-y-5">

              {/* Section divider for buyer when showing recipient fields */}
              {(showRecipientFields || showBulkFields) && <SectionDivider text="YOUR DETAILS" />}

              <FormInput
                label="Full name"
                id="name"
                required
                placeholder="Your full name"
                autoComplete="name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                onBlur={() => handleBlur("name")}
                error={errors.name}
                touched={touched.name}
              />

              <FormInput
                label="Email address"
                id="email"
                required
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                error={errors.email}
                touched={touched.email}
              />

              {/* Friend fields */}
              {type === "friend" && (
                <>
                  <SectionDivider text="HER DETAILS" />
                  <FormInput
                    label="Her full name"
                    id="friendName"
                    required
                    placeholder="Friend's full name"
                    value={form.friendName}
                    onChange={(e) => updateField("friendName", e.target.value)}
                    onBlur={() => handleBlur("friendName")}
                    error={errors.friendName}
                    touched={touched.friendName}
                  />
                  <FormInput
                    label="Her email address"
                    id="friendEmail"
                    required
                    type="email"
                    placeholder="friend@example.com"
                    value={form.friendEmail}
                    onChange={(e) => updateField("friendEmail", e.target.value)}
                    onBlur={() => handleBlur("friendEmail")}
                    error={errors.friendEmail}
                    touched={touched.friendEmail}
                  />
                  <FormInput
                    label="Personal message"
                    id="message"
                    rows={3}
                    placeholder="Add a note she'll receive with her enrolment confirmation..."
                    value={form.message}
                    onChange={(e) => updateField("message", e.target.value)}
                  />
                </>
              )}

              {/* Daughter fields */}
              {type === "daughter" && (
                <>
                  <SectionDivider text="HER DETAILS" />
                  <FormInput
                    label="Daughter's name"
                    id="daughterName"
                    required
                    placeholder="Daughter's full name"
                    value={form.daughterName}
                    onChange={(e) => updateField("daughterName", e.target.value)}
                    onBlur={() => handleBlur("daughterName")}
                    error={errors.daughterName}
                    touched={touched.daughterName}
                  />
                  <FormInput
                    label="Daughter's email"
                    id="daughterEmail"
                    required
                    type="email"
                    placeholder="daughter@example.com"
                    value={form.daughterEmail}
                    onChange={(e) => updateField("daughterEmail", e.target.value)}
                    onBlur={() => handleBlur("daughterEmail")}
                    error={errors.daughterEmail}
                    touched={touched.daughterEmail}
                  />
                  <FormInput
                    label="Personal message"
                    id="message"
                    rows={3}
                    placeholder="Add a note she'll receive with her enrolment confirmation..."
                    value={form.message}
                    onChange={(e) => updateField("message", e.target.value)}
                  />
                </>
              )}

              {/* Bulk fields */}
              {type === "bulk" && (
                <>
                  <SectionDivider text="ORGANISATION" />
                  <FormInput
                    label="Company or school"
                    id="org"
                    required
                    placeholder="Organisation name"
                    value={form.org}
                    onChange={(e) => updateField("org", e.target.value)}
                    onBlur={() => handleBlur("org")}
                    error={errors.org}
                    touched={touched.org}
                  />
                  <FormInput
                    label="Estimated seats"
                    id="seats"
                    required
                    type="number"
                    min={1}
                    placeholder="Number of seats needed"
                    value={form.seats}
                    onChange={(e) => updateField("seats", e.target.value)}
                    onBlur={() => handleBlur("seats")}
                    error={errors.seats}
                    touched={touched.seats}
                  />
                  <FormInput
                    label="Message"
                    id="message"
                    rows={3}
                    placeholder="Any additional details..."
                    value={form.message}
                    onChange={(e) => updateField("message", e.target.value)}
                  />
                </>
              )}
            </div>

            {/* Consent */}
            <div style={{ marginTop: 32 }}>
              <CustomCheckbox checked={agreed} onChange={() => setAgreed(!agreed)} required>
                I agree to the{" "}
                <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: "#4A0E2E", textDecoration: "underline", textUnderlineOffset: 4 }}>
                  Terms and Conditions
                </a>{" "}
                of The Aligned Woman Co <span style={{ color: "#C4847A" }}>*</span>
              </CustomCheckbox>

              <CustomCheckbox checked={updates} onChange={() => setUpdates(!updates)}>
                Send me updates, invites, and early access to new content
              </CustomCheckbox>

              <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: 11, color: "#8A7A76", lineHeight: 1.6, marginTop: 12 }}>
                Your details are processed securely and will never be shared. You can withdraw consent at any time.
              </p>
            </div>

            {/* Error Banner */}
            {paymentError && (
              <div role="alert" style={{ marginTop: 24, background: "rgba(192,57,43,0.08)", borderLeft: "3px solid #C0392B", padding: "14px 18px", borderRadius: 4 }}>
                <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400, fontSize: 13, color: "#C0392B", lineHeight: 1.6 }}>
                  {paymentError}
                </p>
              </div>
            )}

            {/* Microcopy */}
            <p className="text-center" style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: 11, color: "#8A7A76", marginTop: 32 }}>
              Lifetime access &middot; &#128274; Secure checkout
            </p>

            {/* CTA */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!agreed || processing}
              className="w-full transition-all"
              style={{
                height: 56,
                borderRadius: 100,
                background: "#C4847A",
                color: "#0E0208",
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                border: "none",
                cursor: (!agreed || processing) ? "not-allowed" : "pointer",
                opacity: (!agreed || processing) ? 0.55 : 1,
                marginTop: 16,
              }}
            >
              {processing ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="#0E0208" strokeWidth="2" strokeLinecap="round" strokeDasharray="28" strokeDashoffset="8" />
                  </svg>
                  Processing...
                </span>
              ) : (
                ctaLabel
              )}
            </button>
          </div>

          {/* RIGHT: Order Summary (desktop only) */}
          <div className="hidden lg:block w-[42%]">
            <div style={{ position: "sticky", top: 96, background: "#FFFFFF", borderRadius: 12, boxShadow: "0 4px 24px rgba(74,14,46,0.06)", padding: 32 }}>
              <OrderSummaryContent />
            </div>
            <TrustSignals />
          </div>
        </div>
      </div>
    </main>
  );
}