import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const typeConfig = {
  apply_programme: {
    label: "Apply for the Programme",
    description: "Tell us a little about yourself — we read every application personally.",
    extraLabel: "What do you most hope to experience through The Aligned Woman?",
    showApplicationForm: true,
  },
  apply_expert: {
    label: "Apply as an Expert",
    description: "Share your expertise with our community of aligned women.",
    extraLabel: "Your area of expertise",
  },
  corporate_di: {
    label: "Corporate & D&I Enquiry",
    description: "Let's explore how we can bring alignment to your organisation.",
    showBulkForm: true,
  },
  brand_collab: {
    label: "Brand Collaboration",
    description: "Tell us about your brand and how you'd like to collaborate.",
    extraLabel: "Your brand/company name and website",
  },
  press: {
    label: "Press Enquiry",
    description: "We'd love to share our story with your audience.",
    extraLabel: "Publication or media outlet",
  },
  general: {
    label: "General Enquiry",
    description: "We're here to help — send us your question.",
    extraLabel: null,
  },
  newsletter: {
    label: "Newsletter Signup",
    description: "Join our community and receive wisdom directly to your inbox.",
    extraLabel: null,
    newsletterOnly: true,
  },
};

const AGE_RANGES = ["18-24", "25-30", "31-35", "36-40", "41-45", "46-50", "50+"];
const PRIMARY_FOCUS = [
  "Career & Purpose",
  "Money & Financial Power",
  "Relationships & Intimacy",
  "Health & Vitality",
  "Spirituality & Inner Life",
  "Leadership & Visibility",
  "Identity & Self-Worth",
];

export default function ContactFormPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get("type") || "general";
  const config = typeConfig[type] || typeConfig.general;

  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", country: "", message: "", extra_field_value: "",
    // Application fields
    instagram_handle: "", age_range: "", primary_focus: "",
    understands_paid_programme: false, acknowledges_price: false,
    payment_preference: "", confirms_reservation: false,
    // Bulk fields
    organisation_name: "", organisation_type: "", contact_person: "",
    work_email: "", phone: "", number_of_seats: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Save ContactSubmission
    await base44.entities.ContactSubmission.create({
      type,
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      country: form.country,
      message: form.message,
      extra_field_label: config.extraLabel,
      extra_field_value: form.extra_field_value,
      status: "new",
    });

    // Save Application if apply_programme
    if (type === "apply_programme") {
      await base44.entities.Application.create({
        full_name: `${form.first_name} ${form.last_name}`.trim(),
        email: form.email,
        country_city: form.country,
        instagram_handle: form.instagram_handle,
        age_range: form.age_range,
        primary_focus: form.primary_focus,
        understands_paid_programme: form.understands_paid_programme,
        acknowledges_price: form.acknowledges_price,
        payment_preference: form.payment_preference,
        confirms_reservation: form.confirms_reservation,
        status: "pending",
      });
    }

    // Save BulkEnquiry if corporate
    if (type === "corporate_di") {
      await base44.entities.BulkEnquiry.create({
        organisation_name: form.organisation_name,
        organisation_type: form.organisation_type,
        contact_person: `${form.first_name} ${form.last_name}`.trim(),
        work_email: form.work_email || form.email,
        phone: form.phone,
        number_of_seats: Number(form.number_of_seats) || 0,
        country: form.country,
        notes: form.message,
        status: "new",
      });
    }

    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FDF5F3] to-[#F5E8EE] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-[#943A59] mx-auto mb-6" />
          <h2 className="text-3xl font-serif text-[#6E1D40] mb-4">Thank You!</h2>
          <p className="text-gray-600 mb-8">
            {type === "newsletter"
              ? "You've been added to our newsletter. Expect beautiful wisdom in your inbox soon."
              : "We've received your submission and will be in touch very soon."}
          </p>
          <Link to="/contact" className="inline-flex items-center gap-2 text-[#943A59] font-semibold hover:text-[#6E1D40] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Contact
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDF5F3] via-white to-[#F5E8EE]">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Link to="/contact" className="inline-flex items-center gap-2 text-[#943A59] text-sm mb-8 hover:text-[#6E1D40] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
          <div className="mb-8">
            <p className="text-[#943A59] font-semibold tracking-widest uppercase text-xs mb-2">{config.label}</p>
            <h1 className="text-3xl font-serif text-[#6E1D40] mb-3">{config.label}</h1>
            <p className="text-gray-500">{config.description}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Newsletter-only: just email */}
            {config.newsletterOnly ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <Input required value={form.first_name} onChange={e => set("first_name", e.target.value)} placeholder="First name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <Input value={form.last_name} onChange={e => set("last_name", e.target.value)} placeholder="Last name" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <Input required type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="your@email.com" />
                </div>
              </>
            ) : config.showBulkForm ? (
              /* Corporate / D&I form */
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <Input required value={form.first_name} onChange={e => set("first_name", e.target.value)} placeholder="First name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <Input required value={form.last_name} onChange={e => set("last_name", e.target.value)} placeholder="Last name" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organisation Name *</label>
                  <Input required value={form.organisation_name} onChange={e => set("organisation_name", e.target.value)} placeholder="Company / Organisation" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organisation Type</label>
                  <Input value={form.organisation_type} onChange={e => set("organisation_type", e.target.value)} placeholder="e.g. Corporate, NGO, Government" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Work Email *</label>
                    <Input required type="email" value={form.work_email || form.email} onChange={e => { set("work_email", e.target.value); set("email", e.target.value); }} placeholder="work@company.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+27 ..." />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Seats</label>
                    <Input type="number" min="1" value={form.number_of_seats} onChange={e => set("number_of_seats", e.target.value)} placeholder="e.g. 10" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <Input value={form.country} onChange={e => set("country", e.target.value)} placeholder="Country" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Message</label>
                  <Textarea rows={4} value={form.message} onChange={e => set("message", e.target.value)} placeholder="Tell us about your objectives..." />
                </div>
              </>
            ) : (
              /* Standard form */
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <Input required value={form.first_name} onChange={e => set("first_name", e.target.value)} placeholder="First name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <Input required value={form.last_name} onChange={e => set("last_name", e.target.value)} placeholder="Last name" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <Input required type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="your@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <Input value={form.country} onChange={e => set("country", e.target.value)} placeholder="Country" />
                </div>

                {config.extraLabel && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{config.extraLabel}</label>
                    <Input value={form.extra_field_value} onChange={e => set("extra_field_value", e.target.value)} placeholder="" />
                  </div>
                )}

                {/* Programme-specific fields */}
                {type === "apply_programme" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Instagram Handle</label>
                      <Input value={form.instagram_handle} onChange={e => set("instagram_handle", e.target.value)} placeholder="@yourhandle" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Age Range</label>
                      <select
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#943A59]"
                        value={form.age_range} onChange={e => set("age_range", e.target.value)}
                      >
                        <option value="">Select age range</option>
                        {AGE_RANGES.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Primary Focus</label>
                      <select
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#943A59]"
                        value={form.primary_focus} onChange={e => set("primary_focus", e.target.value)}
                      >
                        <option value="">What area do you most want to work on?</option>
                        {PRIMARY_FOCUS.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Preference</label>
                      <select
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#943A59]"
                        value={form.payment_preference} onChange={e => set("payment_preference", e.target.value)}
                      >
                        <option value="">Select preference</option>
                        <option value="full">Full payment</option>
                        <option value="instalment">Instalment plan</option>
                        <option value="not_sure">Not sure yet</option>
                      </select>
                    </div>
                    <div className="space-y-3 bg-[#FDF5F3] rounded-xl p-5">
                      {[
                        { key: "understands_paid_programme", label: "I understand this is a paid, high-touch programme." },
                        { key: "acknowledges_price", label: "I acknowledge this is a premium investment in myself." },
                        { key: "confirms_reservation", label: "I confirm I am ready to reserve my spot if accepted." },
                      ].map(item => (
                        <label key={item.key} className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form[item.key]}
                            onChange={e => set(item.key, e.target.checked)}
                            className="mt-1 accent-[#6E1D40]"
                          />
                          <span className="text-sm text-gray-700">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <Textarea
                    rows={4}
                    value={form.message}
                    onChange={e => set("message", e.target.value)}
                    placeholder={type === "apply_programme" ? "Share more about yourself and what you hope to gain..." : "Your message..."}
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-white font-semibold rounded-xl text-base"
              style={{ backgroundColor: '#6E1D40' }}
            >
              {loading ? "Submitting..." : config.newsletterOnly ? "Subscribe" : "Submit"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}