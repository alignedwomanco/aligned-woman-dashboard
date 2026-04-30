import React from "react";
import { useGeoPrice } from "./useGeoPrice";
import { Loader2, MapPin } from "lucide-react";

export default function GeoPricingBanner({ onJoinClick }) {
  const { pricing, loading } = useGeoPrice();

  return (
    <section className="py-20 px-4" style={{ background: "linear-gradient(135deg,#6E1D40 0%,#943A59 50%,#C4847A 100%)" }}>
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-white/70" />
          <span className="text-white/70 text-sm">Pricing for your region</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        ) : (
          <>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-2" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
              {pricing?.currency_symbol}{pricing?.price_full?.toLocaleString()}
              <span className="text-2xl ml-2 opacity-75">{pricing?.currency_code}</span>
            </h2>
            <p className="text-white/75 mb-2">
              or {pricing?.currency_symbol}{pricing?.price_payment_plan?.toLocaleString()} × {pricing?.payment_plan_months || 3} months
            </p>
            <p className="text-white/60 text-sm mb-8">{pricing?.region_name} pricing</p>
          </>
        )}

        <button
          onClick={onJoinClick}
          className="inline-flex items-center gap-2 bg-white text-[#6E1D40] font-bold px-10 py-4 rounded-full text-base hover:bg-rose-50 transition-all hover:shadow-xl hover:-translate-y-0.5"
        >
          Join the Waitlist
        </button>
      </div>
    </section>
  );
}