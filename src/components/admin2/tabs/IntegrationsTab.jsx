import React from "react";
import { SectionLabel } from "@/components/admin2/AdminCard";

export default function IntegrationsTab() {
  const domain = window.location.origin;
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <SectionLabel>Stripe</SectionLabel>
        <div className="bg-white rounded-2xl border border-[#E8E0DC] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <p style={{ fontSize: 14, fontFamily: "Montserrat, sans-serif", color: "#6B7280" }}>Configure your Stripe keys in Payment Settings → Regional Pricing rows.</p>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#C4866C", marginBottom: 6, fontFamily: "Montserrat, sans-serif" }}>WEBHOOK URL</p>
            <code className="block bg-[#FDF5F3] rounded-lg px-4 py-3 text-sm text-[#6B1B3D]" style={{ fontFamily: "monospace" }}>
              {domain}/api/functions/handlePaymentWebhook
            </code>
          </div>
        </div>
      </div>
      <div>
        <SectionLabel>PayFast</SectionLabel>
        <div className="bg-white rounded-2xl border border-[#E8E0DC] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <p style={{ fontSize: 14, fontFamily: "Montserrat, sans-serif", color: "#6B7280" }}>Configure PayFast item names in Payment Settings → Regional Pricing rows.</p>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#C4866C", marginBottom: 6, fontFamily: "Montserrat, sans-serif" }}>WEBHOOK URL</p>
            <code className="block bg-[#FDF5F3] rounded-lg px-4 py-3 text-sm text-[#6B1B3D]" style={{ fontFamily: "monospace" }}>
              {domain}/api/functions/handlePaymentWebhook
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}