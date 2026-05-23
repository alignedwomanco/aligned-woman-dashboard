import React from "react";

const C = {
  burgCore: "#4A0E2E",
  roseCore: "#C4847A",
  offWhite: "#FAF5F3",
  midGrey: "#8A7A76",
  darkGrey: "#3A2A28",
  white: "#FFFFFF",
};

const serif = "'DM Serif Display', Georgia, serif";
const sans = "Montserrat, sans-serif";

export default function Checkout() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16" style={{ background: C.offWhite, fontFamily: sans }}>
      <div className="max-w-[560px] w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] mb-3" style={{ color: C.roseCore }}>
            SECURE CHECKOUT
          </p>
          <h1 className="text-[clamp(28px,5vw,40px)] mb-2" style={{ fontFamily: serif, fontStyle: "italic", color: C.burgCore }}>
            The Aligned Woman Blueprint
          </h1>
          <p className="text-[14px] font-light" style={{ color: C.midGrey }}>
            Founding Member Price &middot; R3,997
          </p>
        </div>

        {/* Order summary */}
        <div
          className="rounded-lg p-6 mb-6"
          style={{ background: C.white, border: `1px solid rgba(74,14,46,0.08)`, boxShadow: "0 4px 24px rgba(74,14,46,0.06)" }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: C.midGrey }}>
            ORDER SUMMARY
          </p>
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-[14px] font-medium" style={{ color: C.darkGrey }}>The Aligned Woman Blueprint™</p>
              <p className="text-[12px] font-light" style={{ color: C.midGrey }}>Founding Member Access · Lifetime</p>
            </div>
            <p className="text-[16px] font-semibold" style={{ fontFamily: serif, fontStyle: "italic", color: C.burgCore }}>R3,997</p>
          </div>
          <div className="pt-3 mt-3 flex justify-between" style={{ borderTop: `1px solid rgba(74,14,46,0.06)` }}>
            <p className="text-[13px] font-semibold uppercase tracking-[0.06em]" style={{ color: C.burgCore }}>Total</p>
            <p className="text-[18px] font-semibold" style={{ fontFamily: serif, fontStyle: "italic", color: C.burgCore }}>R3,997</p>
          </div>
        </div>

        {/* Placeholder for payment form */}
        <div
          className="rounded-lg p-8 mb-6 text-center"
          style={{ background: C.white, border: `1px solid rgba(74,14,46,0.08)` }}
        >
          <p className="text-[13px] font-light" style={{ color: C.midGrey }}>
            Payment form will be configured here.
          </p>
        </div>

        {/* Guarantee note */}
        <p className="text-center text-[11px] font-light" style={{ color: C.midGrey }}>
          30-day completion guarantee &middot; Secure checkout &middot; Instant access on payment
        </p>
      </div>
    </div>
  );
}