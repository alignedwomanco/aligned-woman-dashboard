import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

// ────────────────────────────────────────────────────────────────
// Apply · the AW Verified practitioner and business application.
//
// Rebuilt July 2026, replacing the legacy member sign-up page that
// previously lived at this route. Copy source: the approved
// AW Verified application copy document.
//
// Wiring is identical to the Directory apply modal, the existing
// source of truth: writes an ExpertApplication record (status
// pending), best-effort admin email, analytics event. Applying
// grants nothing on its own; approval is an admin decision.
// The route is inside the login-protected group, matching the
// entity's sign-in-first flow.
//
// Held schema fields (accreditations and registrations, business
// registration number, country, registered directors) are NOT here;
// they are added only when Laura confirms the schema change.
//
// "Read the Standard in full" link is deliberately absent until the
// Standard page exists: no dead ends.
// ────────────────────────────────────────────────────────────────

// Kept in step with PINNED_CATEGORIES in ExpertsDirectory.jsx.
const CATEGORY_OPTIONS = [
  "Business & Entrepreneurship",
  "Body & Movement",
  "Mindset & Behaviour",
  "Mental Health & Psychology",
  "Health & Medical",
  "Money & Finance",
  "Branding & Visibility",
];

const INTEREST_OPTIONS = [
  {
    key: "marketplace_profile",
    label: "A profile in the directory",
    note: "A listed, AW Verified presence women can find and trust.",
    locked: true,
  },
  {
    key: "affiliate",
    label: "The affiliate programme",
    note: "Earn a share when women you send here choose a course you are assigned to.",
    locked: false,
  },
  {
    key: "host_course",
    label: "Host a course (coming soon)",
    note: "Bring your teaching to the platform, taught the Aligned Woman way.",
    locked: false,
  },
];

const FIVE_CHECKS = [
  {
    title: "Qualifications, with proof",
    body: "You tell us your training and credentials, and we see the paper. The actual certificates, not a bio claim.",
  },
  {
    title: "Registration, where your profession requires it",
    body: "If your field registers with a professional body or council, we take your registration number and check it is current. For businesses, that includes company registration, country, and directors on record.",
  },
  {
    title: "A real conversation",
    body: "We speak to every applicant before the mark is granted. How you work, who you serve, and whether your way of working belongs among women who came here to be treated well.",
  },
  {
    title: "A signed commitment to how women are treated",
    body: "Every Verified practitioner signs the Aligned Woman Code of Care: clear pricing, honest claims, respect for a woman's pace and consent, and no pressure tactics, ever. A document with your name on it.",
  },
  {
    title: "Standing that stays current",
    body: "Verification carries the year it was granted and is renewed annually. The mark means you meet the Standard now, not that you once did.",
  },
];

const GLASS_CARD =
  "rounded-2xl border border-awburg-core/10 bg-white/40 backdrop-blur-2xl shadow-sm";
const BTN_FILLED =
  "inline-flex items-center justify-center gap-2 bg-awburg-core hover:bg-awburg-dark text-paper font-body font-bold text-[11px] tracking-eyebrow uppercase py-3.5 px-7 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
const INPUT =
  "w-full h-11 bg-white border border-awburg-core/15 focus:border-awrose-core rounded-md px-3 font-body text-[13px] text-awburg-core outline-none transition-colors";
const TEXTAREA =
  "w-full bg-white border border-awburg-core/15 focus:border-awrose-core rounded-md p-3 font-body text-[13px] text-awburg-core outline-none transition-colors resize-y";
const LABEL = "block font-body font-medium text-[11px] text-awburg-core mb-1.5";
const HELPER = "font-body font-light text-[11.5px] text-awburg-core/55 mt-1.5 leading-relaxed";
const ERROR_TEXT = "font-body text-[11.5px] text-awrose-deep mt-1.5";

function Field({ label, error, helper, children }) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      {children}
      {error ? <p className={ERROR_TEXT}>{error}</p> : helper ? <p className={HELPER}>{helper}</p> : null}
    </div>
  );
}

export default function Apply() {
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    applicant_name: "",
    email: "",
    application_type: "individual",
    business_name: "",
    headline: "",
    bio: "",
    website_url: "",
    instagram_url: "",
    linkedin_url: "",
    category_interest: [],
    interested_in:
      searchParams.get("intent") === "course"
        ? ["marketplace_profile", "host_course"]
        : ["marketplace_profile"],
    message: "",
  });

  useEffect(() => {
    base44.auth
      .me()
      .then((me) => {
        setForm((f) => ({
          ...f,
          applicant_name: f.applicant_name || me?.full_name || "",
          email: f.email || me?.email || "",
        }));
      })
      .catch(() => {});
  }, []);

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((er) => ({ ...er, [key]: undefined, form: undefined }));
  };

  const toggleInArray = (key, value) => {
    setForm((f) => {
      const has = f[key].includes(value);
      return { ...f, [key]: has ? f[key].filter((v) => v !== value) : [...f[key], value] };
    });
  };

  const validate = () => {
    const e = {};
    if (!form.applicant_name.trim()) e.applicant_name = "Your name is required.";
    if (!form.email.trim()) e.email = "Your email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Please enter a valid email.";
    if (form.application_type === "business" && !form.business_name.trim()) {
      e.business_name = "The business name is required when applying as a business.";
    }
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setSaving(true);
    try {
      await base44.entities.ExpertApplication.create({
        applicant_name: form.applicant_name.trim(),
        email: form.email.trim().toLowerCase(),
        application_type: form.application_type,
        business_name: form.application_type === "business" ? form.business_name.trim() : "",
        headline: form.headline.trim(),
        bio: form.bio.trim(),
        website_url: form.website_url.trim(),
        instagram_url: form.instagram_url.trim(),
        linkedin_url: form.linkedin_url.trim(),
        category_interest: form.category_interest,
        interested_in: form.interested_in,
        message: form.message.trim(),
        status: "pending",
      });
      base44.integrations.Core.SendEmail({
        to: "hello@alignedwomanco.com",
        subject: `New expert application - ${form.applicant_name.trim()}`,
        body: `Name: ${form.applicant_name}\nEmail: ${form.email}\nType: ${form.application_type}\nInterested in: ${form.interested_in.join(", ")}\n\n${form.message}`,
      }).catch(() => {});
      base44.analytics.track({
        eventName: "expert_application_submit",
        properties: { application_type: form.application_type, source: "apply_page" },
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setErrors({ form: "Something went wrong sending your application. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-5 md:px-6 py-16">
        <div className={`${GLASS_CARD} p-8 md:p-10`}>
          <h1 className="font-display text-[26px] md:text-[30px] text-awburg-core leading-tight mb-4">
            Received. Thank you for standing in front of the Standard.
          </h1>
          <p className="font-body font-light text-[14px] leading-relaxed text-awburg-core/75 mb-8">
            Your application is with our team, and it will be read by a person. If your work
            looks like a fit, we will write to you to arrange a real conversation; that
            conversation is part of verification, not a formality. Either way, you will hear
            back from us. We do not close applications with silence.
          </p>
          <Link to={createPageUrl("ExpertsDirectory")} className={BTN_FILLED}>
            Back to the directory
          </Link>
        </div>
      </div>
    );
  }

  const isBusiness = form.application_type === "business";

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-6 py-12 space-y-10">
      {/* Header */}
      <section>
        <p className="font-body font-bold text-[10px] tracking-eyebrow uppercase text-awrose-deep mb-3">
          For practitioners and women-owned businesses
        </p>
        <h1 className="font-display text-[30px] md:text-[36px] text-awburg-core leading-tight mb-3">
          Apply to become AW Verified.
        </h1>
        <p className="font-display italic text-[17px] text-awrose-deep mb-5">
          The mark that tells every woman here: we checked, so she does not have to.
        </p>
        <p className="font-body font-light text-[14px] leading-relaxed text-awburg-core/75 max-w-2xl">
          Anyone can call herself an expert online. That is the problem this platform exists
          to solve. AW Verification is our answer: a real review of who you are, what stands
          behind your work, and how you treat the women who trust you. It is free to apply,
          it is free to be listed at launch, and it is reviewed by a person, not a form.
        </p>
        <p className="font-body font-light text-[12.5px] leading-relaxed text-awburg-core/55 max-w-2xl mt-4">
          Applying takes a few minutes. If your work looks like a fit, the next step is a
          real conversation with our team. Applying does not grant access to any course or
          content; it is a request to be reviewed against the Aligned Woman Standard.
        </p>
      </section>

      {/* The five checks */}
      <section className={`${GLASS_CARD} p-6 md:p-8`}>
        <p className="font-body font-semibold text-[14px] text-awburg-core mb-6">
          What verification involves
        </p>
        <ol className="space-y-5">
          {FIVE_CHECKS.map((check, i) => (
            <li key={check.title} className="flex gap-4">
              <span className="font-display italic text-[20px] text-awrose-deep leading-none flex-shrink-0 w-6 text-right">
                {i + 1}
              </span>
              <div>
                <p className="font-body font-semibold text-[13px] text-awburg-core mb-1">
                  {check.title}
                </p>
                <p className="font-body font-light text-[13px] leading-relaxed text-awburg-core/70">
                  {check.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Application form */}
      <section className={`${GLASS_CARD} p-6 md:p-8 space-y-8`}>
        {/* Applying as */}
        <div>
          <p className="font-body font-semibold text-[14px] text-awburg-core mb-4">Applying as</p>
          <div className="flex gap-3 mb-2">
            {[
              { key: "individual", label: "A practitioner" },
              { key: "business", label: "A business" },
            ].map((opt) => {
              const active = form.application_type === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => set("application_type", opt.key)}
                  className={`font-body font-medium text-[12px] rounded-full px-5 py-2.5 min-h-[44px] border transition-colors ${
                    active
                      ? "bg-awburg-core text-paper border-awburg-core"
                      : "bg-transparent text-awburg-core border-awburg-core/20 hover:border-awburg-core/45"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <p className={HELPER}>
            Choose practitioner if the work is yours, in your own name. Choose business if
            you are applying on behalf of a women-owned company.
          </p>
        </div>

        {/* About you */}
        <div className="space-y-5">
          <p className="font-body font-semibold text-[14px] text-awburg-core">About you</p>
          <Field label="Full name" error={errors.applicant_name}>
            <input
              className={INPUT}
              value={form.applicant_name}
              onChange={(e) => set("applicant_name", e.target.value)}
              placeholder="Your name, as it appears on your credentials"
            />
          </Field>
          <Field
            label="Email"
            error={errors.email}
            helper="We reply to every application from a person, at this address."
          >
            <input
              className={INPUT}
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>
          {isBusiness && (
            <Field label="Business name" error={errors.business_name}>
              <input
                className={INPUT}
                value={form.business_name}
                onChange={(e) => set("business_name", e.target.value)}
                placeholder="The registered name of the business"
              />
            </Field>
          )}
        </div>

        {/* Your work */}
        <div className="space-y-5">
          <p className="font-body font-semibold text-[14px] text-awburg-core">Your work</p>
          <Field label="Headline">
            <input
              className={INPUT}
              value={form.headline}
              onChange={(e) => set("headline", e.target.value)}
              placeholder='One line that says what you do, e.g. "Functional medicine for women in midlife"'
            />
          </Field>
          <Field
            label="About your work"
            helper="Tell us how you work and who you serve. Write like you speak; this is the beginning of a conversation, not a pitch."
          >
            <textarea
              className={TEXTAREA}
              rows={5}
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
            />
          </Field>
          <div>
            <p className={LABEL}>Where your work lives</p>
            <div className="space-y-3">
              <input
                className={INPUT}
                value={form.website_url}
                onChange={(e) => set("website_url", e.target.value)}
                placeholder="Website URL"
              />
              <input
                className={INPUT}
                value={form.instagram_url}
                onChange={(e) => set("instagram_url", e.target.value)}
                placeholder="Instagram URL"
              />
              <input
                className={INPUT}
                value={form.linkedin_url}
                onChange={(e) => set("linkedin_url", e.target.value)}
                placeholder="LinkedIn URL"
              />
            </div>
            <p className={HELPER}>
              Share what you have. A website, a profile, wherever your work can be seen. We
              look at how you show up, not how many follow you.
            </p>
          </div>
          <div>
            <p className={LABEL}>Areas of work</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((cat) => {
                const active = form.category_interest.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleInArray("category_interest", cat)}
                    className={`font-body font-medium text-[11.5px] rounded-full px-4 py-2 min-h-[40px] border transition-colors ${
                      active
                        ? "bg-awburg-core text-paper border-awburg-core"
                        : "bg-transparent text-awburg-core border-awburg-core/20 hover:border-awburg-core/45"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
            <p className={HELPER}>
              Choose the areas closest to your work. This shapes where women would find you
              in the directory.
            </p>
          </div>
        </div>

        {/* What you are applying for */}
        <div className="space-y-3">
          <p className="font-body font-semibold text-[14px] text-awburg-core">
            What you are applying for
          </p>
          {INTEREST_OPTIONS.map((opt) => {
            const active = form.interested_in.includes(opt.key);
            return (
              <button
                key={opt.key}
                type="button"
                disabled={opt.locked}
                onClick={() => !opt.locked && toggleInArray("interested_in", opt.key)}
                className={`w-full text-left rounded-xl border p-4 transition-colors ${
                  active
                    ? "border-awburg-core/40 bg-white/70"
                    : "border-awburg-core/15 bg-white/35 hover:border-awburg-core/30"
                } ${opt.locked ? "cursor-default" : "cursor-pointer"}`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`w-4 h-4 rounded-full border flex-shrink-0 ${
                      active ? "bg-awrose-core border-awrose-core" : "border-awburg-core/30"
                    }`}
                  />
                  <span className="font-body font-medium text-[13px] text-awburg-core">
                    {opt.label}
                  </span>
                </span>
                <span className="block font-body font-light text-[12px] text-awburg-core/60 mt-1 pl-7">
                  {opt.note}
                </span>
              </button>
            );
          })}
        </div>

        {/* Anything else */}
        <Field label="Anything else">
          <textarea
            className={TEXTAREA}
            rows={3}
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            placeholder="Anything you want us to know before we speak."
          />
        </Field>

        {/* Before-submit note + submit */}
        <div>
          <p className="font-body font-light text-[12px] leading-relaxed text-awburg-core/55 mb-5">
            By applying, you are asking to be reviewed against the Aligned Woman Standard.
            If verification is offered, you will be asked to sign the Aligned Woman Code of
            Care before the mark is granted. Applying is free and commits you to nothing.
          </p>
          {errors.form && <p className={`${ERROR_TEXT} mb-4`}>{errors.form}</p>}
          <button type="button" onClick={handleSubmit} disabled={saving} className={BTN_FILLED}>
            {saving ? "Sending..." : "Send my application"}
            {!saving && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </section>
    </div>
  );
}
