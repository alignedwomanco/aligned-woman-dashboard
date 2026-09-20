import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { serif, sans } from "@/components/community/communityUI";

// ────────────────────────────────────────────────────────────────
// Start your own group · the request form behind "Create a group" on
// the Community index.
//
// A group is never created from here. The request is written as an
// ExpertApplication with interested_in ["host_community"] only, so it
// lands in the admin Applications tab next to the partner applications,
// with the room name and address already filled in. Approving it there
// creates the room in draft and sends the host her set up email. The
// applicant gets a confirmation through sendExpertApplicationEmail,
// which reads the record server side and picks the group wording.
// ────────────────────────────────────────────────────────────────

const ADMIN_EMAIL = "hello@alignedwomanco.com";

const FIELD = "w-full bg-paper border border-awburg-core/15 focus:border-awrose-core rounded-[16px] px-4 py-3 font-body font-light text-[14px] leading-[1.6] text-awburg-dark outline-none";
const LABEL = "block font-body font-semibold text-[12px] text-awburg-dark mb-1.5";
const HELP = "font-body font-light text-[11.5px] leading-[1.6] text-awburg-mid mt-1.5";
const ERR = "font-body text-[12px] text-awrose-deep mt-1.5";

function Field({ label, help, error, children }) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      {children}
      {help && !error && <p className={HELP}>{help}</p>}
      {error && <p className={ERR}>{error}</p>}
    </div>
  );
}

export default function StartGroupSheet({ open, onClose }) {
  const [form, setForm] = useState({ applicant_name: "", email: "", community_name: "", community_for: "", community_topics: "", message: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    base44.auth.me().then((me) => {
      setForm((f) => ({ ...f, applicant_name: f.applicant_name || me?.full_name || "", email: f.email || me?.email || "" }));
    }).catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!open) { setErrors({}); setSaving(false); setDone(false); }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape" && !saving) onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, saving, onClose]);

  if (!open) return null;

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined, form: undefined })); };

  const validate = () => {
    const e = {};
    if (!form.applicant_name.trim()) e.applicant_name = "Your name is required.";
    if (!form.email.trim()) e.email = "Your email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Please enter a valid email.";
    if (!form.community_name.trim()) e.community_name = "Give the group a name, even a working one.";
    if (!form.community_for.trim()) e.community_for = "Tell us who it is for.";
    if (!form.community_topics.trim()) e.community_topics = "Tell us what women would talk about there.";
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    const name = form.applicant_name.trim();
    const email = form.email.trim().toLowerCase();

    let created = null;
    try {
      created = await base44.entities.ExpertApplication.create({
        applicant_name: name,
        email,
        application_type: "individual",
        business_name: "",
        headline: "",
        bio: "",
        website_url: "",
        instagram_url: "",
        linkedin_url: "",
        logo_url: "",
        category_interest: [],
        interested_in: ["host_community"],
        community_name: form.community_name.trim(),
        community_for: form.community_for.trim(),
        community_topics: form.community_topics.trim(),
        message: form.message.trim(),
        status: "pending",
      });
    } catch (_err) {
      setErrors({ form: "Something went wrong sending your request. Please try again." });
      setSaving(false);
      return;
    }

    setDone(true);
    setSaving(false);

    try {
      base44.integrations.Core.SendEmail({
        to: ADMIN_EMAIL,
        subject: `New group request - ${name}`,
        body: `Name: ${name}\nEmail: ${email}\n\nGroup: ${form.community_name.trim()}\nFor: ${form.community_for.trim()}\nTalk about: ${form.community_topics.trim()}\n\n${form.message.trim()}\n\nReview: https://app.alignedwomanco.com/admin?tab=applications`,
      }).catch(() => {});
    } catch (_err) { /* best effort */ }

    try {
      if (created?.id) base44.functions.invoke("sendExpertApplicationEmail", { applicationId: created.id }).catch(() => {});
    } catch (_err) { /* best effort */ }

    try {
      base44.analytics.track({ eventName: "group_request_submit", properties: { source: "community_page" } });
    } catch (_err) { /* best effort */ }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center" role="dialog" aria-modal="true" aria-label="Start your own group">
      <button type="button" aria-label="Close" onClick={saving ? undefined : onClose} className="absolute inset-0 bg-awburg-dark/50" />
      <div className="relative w-full md:max-w-[560px] max-h-[92vh] overflow-y-auto bg-off-white rounded-t-[28px] md:rounded-[28px] shadow-2xl">
        <div className="px-[22px] pt-6 pb-8 md:px-8 flex flex-col gap-5" style={{ fontFamily: sans }}>
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-[26px] leading-tight text-awburg-dark m-0" style={{ fontFamily: serif, fontWeight: 400 }}>
              {done ? <>We have <em className="italic text-awburg-bright">your request</em></> : <>Start your <em className="italic text-awburg-bright">own group</em></>}
            </h2>
            <button type="button" aria-label="Close" onClick={onClose} disabled={saving} className="w-11 h-11 -mr-2 -mt-2 flex items-center justify-center text-awburg-core text-[20px]">{"✕"}</button>
          </div>

          {done ? (
            <>
              <p className="font-body font-light text-[14px] leading-[1.7] text-awburg-dark m-0">
                Thank you. Every group is read and approved by a person, so it stays a room women can trust. We will write to you once we have looked at it, and a confirmation is on its way to your inbox now.
              </p>
              <p className="font-body font-light text-[12.5px] leading-[1.7] text-awburg-mid m-0">
                Once approved, your group gets its own address on the platform, a private space only the women you invite can see, and a short guide to hosting it well.
              </p>
              <button type="button" onClick={onClose} className="w-full min-h-[48px] rounded-full bg-awburg-core text-paper font-body font-semibold text-[12px] tracking-eyebrow uppercase">
                Back to Community
              </button>
            </>
          ) : (
            <>
              <p className="font-body font-light text-[13.5px] leading-[1.7] text-awburg-mid m-0">
                Bring together the women you already know. Tell us a little about the group and we will set it up with you. Only the people you invite will ever see it.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Your name" error={errors.applicant_name}>
                  <input className={FIELD} value={form.applicant_name} onChange={(e) => set("applicant_name", e.target.value)} autoComplete="name" />
                </Field>
                <Field label="Your email" error={errors.email}>
                  <input className={FIELD} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
                </Field>
              </div>

              <Field label="What would the group be called" help="A working name is fine. You can change it later." error={errors.community_name}>
                <input className={FIELD} value={form.community_name} onChange={(e) => set("community_name", e.target.value)} placeholder="The Thursday Book Club" />
              </Field>

              <Field label="Who is it for" error={errors.community_for}>
                <textarea className={`${FIELD} resize-y min-h-[84px]`} rows={3} value={form.community_for} onChange={(e) => set("community_for", e.target.value)} placeholder="The friends I met at the retreat, an accountability circle from my course, my walking group." />
              </Field>

              <Field label="What would women talk about there" error={errors.community_topics}>
                <textarea className={`${FIELD} resize-y min-h-[84px]`} rows={3} value={form.community_topics} onChange={(e) => set("community_topics", e.target.value)} placeholder="Books, money, the month ahead, the things we said we would do." />
              </Field>

              <Field label="Anything else you want us to know" help="Optional. Why now, how many women, how you would like to run it.">
                <textarea className={`${FIELD} resize-y min-h-[84px]`} rows={3} value={form.message} onChange={(e) => set("message", e.target.value)} />
              </Field>

              {errors.form && <p className={ERR}>{errors.form}</p>}

              <button type="button" onClick={submit} disabled={saving} className="w-full min-h-[48px] rounded-full bg-awburg-core text-paper font-body font-semibold text-[12px] tracking-eyebrow uppercase disabled:opacity-60">
                {saving ? "Sending..." : "Send my request"}
              </button>
              <p className="font-body font-light text-[11.5px] leading-[1.6] text-awburg-mid text-center m-0">
                Groups are approved one at a time. You will hear from us either way.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
