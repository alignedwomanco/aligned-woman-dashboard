import React, { createContext, useContext } from "react";
import useRegion from "@/hooks/useRegion";

const PaymentContext = createContext(null);

export function PaymentProvider({ children }) {
  const { countryCode, regionName, regionalPricing, loading, error } = useRegion();

  const value = {
    countryCode,
    regionName,
    currencySymbol: regionalPricing?.currency_symbol || "$",
    currencyCode: regionalPricing?.currency_code || "USD",
    displayPrice: regionalPricing?.display_price || "Contact us for pricing",
    priceFullNumeric: regionalPricing?.price_full || null,
    paymentPlanPrice: regionalPricing?.price_payment_plan || null,
    paymentPlanMonths: regionalPricing?.payment_plan_months || null,
    paymentGateway: regionalPricing?.payment_gateway || "stripe",
    stripePriceId: regionalPricing?.stripe_price_id || null,
    stripePlanPriceId: regionalPricing?.stripe_plan_price_id || null,
    payfastItemName: regionalPricing?.payfast_item_name || null,
    loading,
    error,
  };

  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>;
}

export function usePaymentContext() {
  const ctx = useContext(PaymentContext);
  if (!ctx) throw new Error("usePaymentContext must be used within PaymentProvider");
  return ctx;
}