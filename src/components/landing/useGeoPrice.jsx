import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const FALLBACK = {
  region_name: "International",
  currency_code: "USD",
  currency_symbol: "$",
  price_full: 997,
  price_payment_plan: 397,
  payment_plan_months: 3,
  payment_gateway: "stripe",
};

export function useGeoPrice() {
  const [pricing, setPricing] = useState(null);
  const [countryCode, setCountryCode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function detect() {
      let cc = null;
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        cc = data.country_code;
        setCountryCode(cc);
      } catch (_) {}

      try {
        const pricingList = await base44.entities.RegionalPricing.filter({ is_active: true });
        let matched = null;
        if (cc) {
          matched = pricingList.find((p) => {
            const codes = (p.country_codes || "").split(",").map((c) => c.trim().toUpperCase());
            return codes.includes(cc.toUpperCase());
          });
        }
        setPricing(matched || pricingList.find((p) => p.region_name === "International") || pricingList[0] || FALLBACK);
      } catch (_) {
        setPricing(FALLBACK);
      }
      setLoading(false);
    }
    detect();
  }, []);

  return { pricing, countryCode, loading };
}