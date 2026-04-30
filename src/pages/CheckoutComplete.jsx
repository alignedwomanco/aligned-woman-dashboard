import React, { useEffect, useState } from "react";
import { CheckCircle, ArrowRight, Heart, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function CheckoutComplete() {
  const [params, setParams] = useState({});

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setParams({
      purchaseType: urlParams.get("custom_str1") || "SELF",
      email: urlParams.get("email_address") || "",
      name: urlParams.get("name_first") || "",
      amount: urlParams.get("amount") || "",
      sessionId: urlParams.get("session_id") || "",
    });
    // Scroll to top
    window.scrollTo(0, 0);
  }, []);

  const messages = {
    SELF: { headline: "Welcome to Your Transformation", sub: "You've made the best investment of your life — in yourself." },
    FRIEND: { headline: "What a Beautiful Gift", sub: "You've gifted someone you love the journey of a lifetime." },
    DAUGHTER: { headline: "A Gift for Her Future", sub: "The greatest inheritance you can give your daughter is her own alignment." },
    CHARITY: { headline: "Thank You for Your Generosity", sub: "Your sponsorship is changing a woman's life. You are part of the ripple." },
  };

  const msg = messages[params.purchaseType] || messages.SELF;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20" style={{ background: "linear-gradient(160deg,#FDF5F3 0%,#F5E8EE 50%,#DEBECC 100%)" }}>
      <div className="max-w-2xl w-full mx-auto">
        {/* Success card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="h-2 w-full" style={{ background: "linear-gradient(90deg,#6E1D40,#C4847A)" }} />
          <div className="p-10 md:p-14 text-center">
            <div className="relative inline-block mb-8">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto" style={{ background: "linear-gradient(135deg,#6E1D40,#C4847A)" }}>
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 w-7 h-7" style={{ color: "#C4847A" }} />
            </div>

            <div className="inline-block bg-green-50 text-green-700 px-5 py-2 rounded-full text-sm font-semibold mb-6 border border-green-200">
              Payment Confirmed
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight" style={{ color: "#6E1D40", fontFamily: "'DM Serif Display', Georgia, serif" }}>
              {msg.headline}
            </h1>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">{msg.sub}</p>

            {params.amount && (
              <div className="bg-rose-50 rounded-2xl p-5 mb-8 border border-rose-100 text-left">
                <div className="text-sm text-gray-500 mb-1">Payment received</div>
                <div className="text-2xl font-bold" style={{ color: "#6E1D40" }}>{params.amount}</div>
                {params.email && <div className="text-sm text-gray-500 mt-1">Receipt sent to: {params.email}</div>}
              </div>
            )}

            <div className="space-y-4 text-left mb-10">
              <h3 className="font-bold text-base" style={{ color: "#6E1D40" }}>What happens next:</h3>
              {[
                "Check your inbox — your welcome email is on its way",
                "You'll receive access to the member portal within 24 hours",
                "Join our private community to meet your cohort sisters",
                "Your first module unlocks on cohort start date",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5" style={{ background: "#6E1D40" }}>
                    {i + 1}
                  </div>
                  <span className="text-gray-700 text-sm">{step}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/Dashboard"
                className="group inline-flex items-center gap-2 text-white font-bold px-8 py-3 rounded-full text-sm transition-all hover:opacity-90 hover:shadow-xl"
                style={{ background: "linear-gradient(135deg,#6E1D40,#C4847A)" }}
              >
                Go to Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="/"
                className="inline-flex items-center gap-2 border-2 font-bold px-8 py-3 rounded-full text-sm transition-all hover:bg-rose-50"
                style={{ borderColor: "#6E1D40", color: "#6E1D40" }}
              >
                <Heart className="w-4 h-4" /> Back to Home
              </a>
            </div>
          </div>
        </div>

        {/* Share card */}
        <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-rose-100">
          <p className="text-sm text-gray-600 mb-3">Share your journey with the hashtag</p>
          <div className="text-xl font-bold" style={{ color: "#6E1D40" }}>#TheAlignedWoman</div>
        </div>
      </div>
    </div>
  );
}