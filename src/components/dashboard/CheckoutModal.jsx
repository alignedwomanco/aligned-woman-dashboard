import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Loader2, Shield, Check } from "lucide-react";

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/6oU7sN7Vkg8p1Cp5p7eME06";

const INCLUSIONS = [
  "13 globally credentialled specialists",
  "5 phases, 11 year Access",
  "Workbooks, tools, and community",

];

export default function CheckoutModal({ open, onOpenChange }) {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      setLoading(true);
      try {
        const [pricingRecords, me] = await Promise.all([
          base44.entities.RegionalPricing.list(),
          base44.auth.me(),
        ]);
        const active =
          pricingRecords.find((p) => p.is_active) ||
          pricingRecords[0] ||
          null;
        setPricing(active);
        if (me?.email) setUserEmail(me.email);
      } catch (_) {
        setPricing(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open]);

  const handleEnrol = async () => {
    if (userEmail) {
      try {
        await base44.entities.AbandonedCart.create({
          email: userEmail,
          purchase_type: "SELF",
          selected_plan: "full",
          region: pricing?.region_name || "",
          currency: pricing?.currency_code || "ZAR",
          price: pricing?.price_full || 0,
          affiliate_code: sessionStorage.getItem("aff") || "",
          recovered: false,
        });
      } catch (_) {}
    }

    const url = new URL(STRIPE_PAYMENT_LINK);
    if (userEmail) {
      url.searchParams.set("prefilled_email", userEmail);
    }
    window.location.href = url.toString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[440px] p-0 overflow-hidden border-0 rounded-2xl"
        style={{ background: "#FAF5F3" }}
      >
        <div
          className="px-8 pt-8 pb-6 text-center"
          style={{ background: "linear-gradient(135deg, #3D0F1F, #5C1A2E)" }}
        >
          <p
            className="text-[10px] tracking-[0.2em] uppercase mb-3"
            style={{
              color: "rgba(250,245,243,0.5)",
              fontFamily: "Montserrat, sans-serif",
            }}
          >
            Your next step
          </p>
          <h2
            className="text-2xl mb-1"
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              color: "#FAF5F3",
              fontWeight: 400,
            }}
          >
            The Aligned <em>Woman</em> Blueprint
          </h2>
          <p
            className="text-xs mt-3"
            style={{
              color: "rgba(250,245,243,0.45)",
              fontFamily: "Montserrat, sans-serif",
            }}
          >
            One investment. Lifetime access.
          </p>
        </div>

        <div className="px-8 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2
                className="w-6 h-6 animate-spin"
                style={{ color: "#5C1A2E" }}
              />
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div
                  className="text-4xl font-bold"
                  style={{
                    color: "#5C1A2E",
                    fontFamily: "Montserrat, sans-serif",
                  }}
                >
                  {pricing?.currency_symbol || "R"}
                  {pricing?.price_full?.toLocaleString() || "3,997"}
                </div>
                <p
                  className="text-xs mt-1"
                  style={{
                    color: "#6B6168",
                    fontFamily: "Montserrat, sans-serif",
                  }}
                >
                  One investment, lifetime access
                </p>
              </div>

              <div className="space-y-2.5 mb-6">
                {INCLUSIONS.map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <Check
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                      style={{ color: "#C4847A" }}
                    />
                    <span
                      className="text-sm"
                      style={{
                        color: "#2A1218",
                        fontFamily: "Montserrat, sans-serif",
                      }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleEnrol}
                className="w-full py-4 rounded-full text-white font-bold text-sm tracking-wide transition-all hover:opacity-90 hover:shadow-xl active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #5C1A2E, #C4847A)",
                  fontFamily: "Montserrat, sans-serif",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Enrol Now
              </button>

              <div
                className="flex items-center justify-center gap-2 mt-4"
                style={{ color: "#6B6168" }}
              >
                <Shield className="w-3.5 h-3.5" />
                <span
                  className="text-xs"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  Secure checkout via Stripe
                </span>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}