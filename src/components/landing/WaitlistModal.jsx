import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Loader2, CheckCircle } from "lucide-react";

export default function WaitlistModal({ onClose, affiliateCode }) {
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.entities.WaitlistSignup.create({
        ...form,
        affiliate_code: affiliateCode || "",
        source_page: window.location.pathname,
      });
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-2 w-full" style={{ background: "linear-gradient(90deg,#6E1D40,#C4847A)" }} />
        <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {done ? (
          <div className="p-10 text-center">
            <CheckCircle className="w-14 h-14 mx-auto mb-4" style={{ color: "#6E1D40" }} />
            <h3 className="text-2xl font-bold mb-2" style={{ color: "#6E1D40", fontFamily: "'DM Serif Display', Georgia, serif" }}>
              You're on the list!
            </h3>
            <p className="text-gray-600">We'll be in touch as soon as the next cohort opens. Watch your inbox.</p>
            <button
              onClick={onClose}
              className="mt-6 px-8 py-3 rounded-full text-white font-semibold text-sm tracking-wide transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#6E1D40,#C4847A)" }}
            >
              Close
            </button>
          </div>
        ) : (
          <div className="p-8">
            <h3 className="text-2xl font-bold mb-1" style={{ color: "#6E1D40", fontFamily: "'DM Serif Display', Georgia, serif" }}>
              Join the Waitlist
            </h3>
            <p className="text-gray-500 text-sm mb-6">Be first to know when enrolment opens.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-3">
                <input
                  placeholder="First name"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
                <input
                  placeholder="Last name"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
              </div>
              <input
                type="email"
                placeholder="Email address"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full text-white font-semibold text-sm tracking-wide transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#6E1D40,#C4847A)" }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Reserve My Spot
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}