import React, { useState } from "react";
import { useGeoPrice } from "@/components/landing/useGeoPrice";
import { base44 } from "@/api/base44Client";
import { Loader2, Shield, Star, Gift, Heart, Users } from "lucide-react";

const PURCHASE_TYPES = [
  { key: "SELF", label: "For Myself", icon: Star, desc: "Your personal transformation journey" },
  { key: "FRIEND", label: "For a Friend", icon: Heart, desc: "Gift the gift of alignment" },
  { key: "DAUGHTER", label: "For My Daughter", icon: Users, desc: "Invest in her future" },
  { key: "CHARITY", label: "Charity / Bursary", icon: Gift, desc: "Sponsor a woman in need" },
];

export default function PricingSection({ affiliateCode }) {
  const { pricing, loading } = useGeoPrice();
  const [purchaseType, setPurchaseType] = useState("SELF");
  const [plan, setPlan] = useState("full");
  const [form, setForm] = useState({ email: "", first_name: "" });
  const [cartSaved, setCartSaved] = useState(false);

  const saveAbandonedCart = async () => {
    if (!form.email || cartSaved) return;
    try {
      await base44.entities.AbandonedCart.create({
        email: form.email,
        first_name: form.first_name,
        purchase_type: purchaseType,
        selected_plan: plan,
        region: pricing?.region_name,
        currency: pricing?.currency_code,
        price: plan === "full" ? pricing?.price_full : pricing?.price_payment_plan,
        affiliate_code: affiliateCode || "",
        recovered: false,
      });
      setCartSaved(true);
    } catch (_) {}
  };

  const handleCheckout = async () => {
    await saveAbandonedCart();
    if (pricing?.payment_gateway === "payfast") {
      const payfastUrl = buildPayFastUrl(pricing, plan, form, purchaseType, affiliateCode);
      window.location.href = payfastUrl;
    } else {
      alert("Stripe checkout integration — connect your Stripe keys to activate.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#6E1D40" }} />
      </div>
    );
  }

  const displayPrice = plan === "full" ? pricing?.price_full : pricing?.price_payment_plan;

  return (
    <section id="pricing" className="py-24 px-4 bg-gradient-to-br from-[#FDF5F3] to-[#F5E8EE]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3" style={{ color: "#C4847A" }}>Investment</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "#6E1D40", fontFamily: "'DM Serif Display', Georgia, serif" }}>
            Your Transformation Awaits
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Pricing shown in <strong>{pricing?.currency_code}</strong> based on your location ({pricing?.region_name}).
          </p>
        </div>

        {/* Purchase Type */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {PURCHASE_TYPES.map(({ key, label, icon: Icon, desc }) => (
            <button
              key={key}
              onClick={() => setPurchaseType(key)}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                purchaseType === key
                  ? "border-[#6E1D40] bg-white shadow-lg"
                  : "border-gray-200 bg-white hover:border-rose-200"
              }`}
            >
              <Icon className={`w-5 h-5 mb-2 ${purchaseType === key ? "text-[#6E1D40]" : "text-gray-400"}`} />
              <div className="font-semibold text-sm" style={{ color: purchaseType === key ? "#6E1D40" : "#374151" }}>{label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
            </button>
          ))}
        </div>

        {/* Plan Toggle */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex gap-4 mb-8 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setPlan("full")}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                plan === "full" ? "bg-[#6E1D40] text-white shadow" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Pay in Full
              <span className="ml-2 text-xs opacity-75">Save {pricing?.currency_symbol}{((pricing?.price_payment_plan * (pricing?.payment_plan_months || 3)) - pricing?.price_full).toLocaleString()}</span>
            </button>
            <button
              onClick={() => setPlan("payment_plan")}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                plan === "payment_plan" ? "bg-[#6E1D40] text-white shadow" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Payment Plan
              <span className="ml-2 text-xs opacity-75">{pricing?.payment_plan_months || 3} months</span>
            </button>
          </div>

          <div className="text-center mb-8">
            <div className="text-5xl font-bold" style={{ color: "#6E1D40" }}>
              {pricing?.currency_symbol}{displayPrice?.toLocaleString()}
            </div>
            {plan === "payment_plan" && (
              <div className="text-gray-500 text-sm mt-1">per month × {pricing?.payment_plan_months || 3}</div>
            )}
          </div>

          <div className="space-y-3 mb-8">
            <input
              type="text"
              placeholder="First name"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
            <input
              type="email"
              placeholder="Email address"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              onBlur={saveAbandonedCart}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
          </div>

          <button
            onClick={handleCheckout}
            className="w-full py-4 rounded-full text-white font-bold text-base tracking-wide transition-all hover:opacity-90 hover:shadow-xl active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg,#6E1D40,#C4847A)" }}
          >
            Enrol Now — {pricing?.currency_symbol}{displayPrice?.toLocaleString()} {pricing?.currency_code}
          </button>

          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
            <Shield className="w-3.5 h-3.5" />
            <span>Secure checkout · 14-day satisfaction guarantee</span>
          </div>
        </div>

        {pricing?.payment_gateway === "payfast" && (
          <p className="text-center text-xs text-gray-400">Processed securely via PayFast</p>
        )}
        {pricing?.payment_gateway === "stripe" && (
          <p className="text-center text-xs text-gray-400">Processed securely via Stripe</p>
        )}
      </div>
    </section>
  );
}

function buildPayFastUrl(pricing, plan, form, purchaseType, affiliateCode) {
  const merchant_id = "10000100";
  const merchant_key = "46f0cd694581a";
  const amount = plan === "full" ? pricing?.price_full : pricing?.price_payment_plan;
  const params = new URLSearchParams({
    merchant_id,
    merchant_key,
    amount: amount?.toFixed(2),
    item_name: pricing?.payfast_item_name || "The Aligned Woman Blueprint",
    email_address: form.email,
    name_first: form.first_name,
    custom_str1: purchaseType,
    custom_str2: affiliateCode || "",
    return_url: window.location.origin + "/CheckoutComplete",
    cancel_url: window.location.href,
    notify_url: "https://your-notify-url/handlePaymentWebhook",
  });
  return `https://www.payfast.co.za/eng/process?${params.toString()}`;
}