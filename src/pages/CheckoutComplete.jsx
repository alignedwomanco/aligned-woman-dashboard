import React, { useEffect, useState } from "react";
import { CheckCircle, ArrowRight, Heart, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Single return page for the Stripe Payment Link. It confirms the payment,
// unlocks the course for the signed in account, and routes a brand new buyer
// through sign up first so access has an account to attach to.
const APP_ORIGIN = "https://app.alignedwomanco.com";
const COURSE_URL = APP_ORIGIN + "/Dashboard";
const STORAGE_KEY = "aw_pending_session_id";

function Shell({ children }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-20"
      style={{ background: "linear-gradient(160deg,#FDF5F3 0%,#F5E8EE 50%,#DEBECC 100%)" }}
    >
      <div className="max-w-2xl w-full mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="h-2 w-full" style={{ background: "linear-gradient(90deg,#6E1D40,#C4847A)" }} />
          <div className="p-10 md:p-14 text-center">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutComplete() {
  const [phase, setPhase] = useState("working");
  const [legacy, setLegacy] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const url = new URLSearchParams(window.location.search);
    const sessionId = url.get("session_id") || "";

    // No Stripe session on the URL. Preserve the original confirmation screen
    // for any legacy or non session return, for example a charity sponsorship.
    if (!sessionId) {
      setLegacy({
        purchaseType: url.get("custom_str1") || "SELF",
        email: url.get("email_address") || "",
        amount: url.get("amount") || "",
      });
      setPhase("legacy");
      return;
    }

    let cancelled = false;

    const run = async () => {
      // Hold the session id so access can still be claimed if the buyer takes a
      // detour through sign up before they land back here.
      try {
        window.localStorage.setItem(STORAGE_KEY, sessionId);
      } catch (_e) {
        // Storage can be blocked. The flow still works through the URL.
      }

      // Who is signed in. me() throws when there is no session.
      let signedIn = false;
      try {
        const me = await base44.auth.me();
        signedIn = !!me;
      } catch (_e) {
        signedIn = false;
      }
      if (cancelled) return;

      // Not signed in yet. Send the buyer to create their account, then bring
      // them straight back here so access attaches on return.
      if (!signedIn) {
        const returnUrl = APP_ORIGIN + "/CheckoutComplete?session_id=" + encodeURIComponent(sessionId);
        window.location.href = "/register?from_url=" + encodeURIComponent(returnUrl);
        return;
      }

      // Signed in. Confirm the payment with Stripe and unlock the course for
      // this account. Idempotent: a repeat call just re confirms access.
      try {
        const raw = await base44.functions.verifyCheckoutSession({ session_id: sessionId });
        const result = raw && raw.data ? raw.data : raw;
        if (cancelled) return;

        if (result && result.success && result.conflict) {
          setPhase("conflict");
          return;
        }
        if (result && result.success && (result.granted || result.hasAccess || result.alreadyProcessed)) {
          try {
            window.localStorage.removeItem(STORAGE_KEY);
          } catch (_e) {
            // Non fatal.
          }
          setPhase("granted");
          return;
        }
        setPhase("error");
      } catch (_e) {
        if (!cancelled) setPhase("error");
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  if (phase === "working") {
    return (
      <Shell>
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ background: "linear-gradient(135deg,#6E1D40,#C4847A)" }}
        >
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
        <h1
          className="text-3xl md:text-4xl font-bold mb-4 leading-tight"
          style={{ color: "#6E1D40", fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          Confirming your payment
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          One moment while we unlock your Blueprint. Please do not close this window.
        </p>
      </Shell>
    );
  }

  if (phase === "conflict") {
    return (
      <Shell>
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ background: "linear-gradient(135deg,#6E1D40,#C4847A)" }}
        >
          <AlertCircle className="w-12 h-12 text-white" />
        </div>
        <h1
          className="text-3xl md:text-4xl font-bold mb-4 leading-tight"
          style={{ color: "#6E1D40", fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          This purchase is already linked
        </h1>
        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
          Your payment is safe. This Blueprint is already connected to another account, the email that
          first claimed it. Sign in with that email, or contact our team and we will move it across for you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/login"
            className="group inline-flex items-center gap-2 text-white font-bold px-8 py-3 rounded-full text-sm transition-all hover:opacity-90 hover:shadow-xl"
            style={{ background: "linear-gradient(135deg,#6E1D40,#C4847A)" }}
          >
            Sign in <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="/Contact"
            className="inline-flex items-center gap-2 border-2 font-bold px-8 py-3 rounded-full text-sm transition-all hover:bg-rose-50"
            style={{ borderColor: "#6E1D40", color: "#6E1D40" }}
          >
            <Heart className="w-4 h-4" /> Contact our team
          </a>
        </div>
      </Shell>
    );
  }

  if (phase === "error") {
    return (
      <Shell>
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ background: "linear-gradient(135deg,#6E1D40,#C4847A)" }}
        >
          <AlertCircle className="w-12 h-12 text-white" />
        </div>
        <h1
          className="text-3xl md:text-4xl font-bold mb-4 leading-tight"
          style={{ color: "#6E1D40", fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          Almost there
        </h1>
        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
          We could not confirm your payment just yet. If you completed checkout, give it a moment and try
          again. If it keeps happening, contact our team and we will sort it out quickly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="group inline-flex items-center gap-2 text-white font-bold px-8 py-3 rounded-full text-sm transition-all hover:opacity-90 hover:shadow-xl"
            style={{ background: "linear-gradient(135deg,#6E1D40,#C4847A)" }}
          >
            Try again <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <a
            href="/Contact"
            className="inline-flex items-center gap-2 border-2 font-bold px-8 py-3 rounded-full text-sm transition-all hover:bg-rose-50"
            style={{ borderColor: "#6E1D40", color: "#6E1D40" }}
          >
            <Heart className="w-4 h-4" /> Contact our team
          </a>
        </div>
      </Shell>
    );
  }

  if (phase === "legacy") {
    const messages = {
      SELF: { headline: "Welcome to Your Transformation", sub: "You have made the best investment of your life, in yourself." },
      FRIEND: { headline: "What a Beautiful Gift", sub: "You have gifted someone you love the journey of a lifetime." },
      DAUGHTER: { headline: "A Gift for Her Future", sub: "The greatest inheritance you can give your daughter is her own alignment." },
      CHARITY: { headline: "Thank You for Your Generosity", sub: "Your sponsorship is changing a woman's life. You are part of the ripple." },
    };
    const msg = messages[legacy.purchaseType] || messages.SELF;
    const showSignIn = legacy.purchaseType !== "CHARITY";
    return (
      <Shell>
        <div className="relative inline-block mb-8">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto"
            style={{ background: "linear-gradient(135deg,#6E1D40,#C4847A)" }}
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <Sparkles className="absolute -top-2 -right-2 w-7 h-7" style={{ color: "#C4847A" }} />
        </div>
        <div className="inline-block bg-green-50 text-green-700 px-5 py-2 rounded-full text-sm font-semibold mb-6 border border-green-200">
          Payment Confirmed
        </div>
        <h1
          className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
          style={{ color: "#6E1D40", fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          {msg.headline}
        </h1>
        <p className="text-gray-600 text-lg mb-8 leading-relaxed">{msg.sub}</p>
        {legacy.amount && (
          <div className="bg-rose-50 rounded-2xl p-5 mb-8 border border-rose-100 text-left">
            <div className="text-sm text-gray-500 mb-1">Payment received</div>
            <div className="text-2xl font-bold" style={{ color: "#6E1D40" }}>{legacy.amount}</div>
            {legacy.email && <div className="text-sm text-gray-500 mt-1">Receipt sent to: {legacy.email}</div>}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {showSignIn && (
            <a
              href={COURSE_URL}
              className="group inline-flex items-center gap-2 text-white font-bold px-8 py-3 rounded-full text-sm transition-all hover:opacity-90 hover:shadow-xl"
              style={{ background: "linear-gradient(135deg,#6E1D40,#C4847A)" }}
            >
              Sign in to your course <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          )}
          <a
            href="/"
            className="inline-flex items-center gap-2 border-2 font-bold px-8 py-3 rounded-full text-sm transition-all hover:bg-rose-50"
            style={{ borderColor: "#6E1D40", color: "#6E1D40" }}
          >
            <Heart className="w-4 h-4" /> Back to Home
          </a>
        </div>
        {showSignIn && (
          <p className="text-gray-500 text-xs italic mt-6 leading-relaxed">
            Sign in with the same email you paid with. That is the address your access is linked to.
          </p>
        )}
      </Shell>
    );
  }

  // phase === "granted"
  const steps = [
    "Your Blueprint is unlocked and waiting inside your dashboard",
    "Check your inbox, your welcome email is on its way",
    "Join the private community from inside your dashboard",
  ];
  return (
    <Shell>
      <div className="relative inline-block mb-8">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto"
          style={{ background: "linear-gradient(135deg,#6E1D40,#C4847A)" }}
        >
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        <Sparkles className="absolute -top-2 -right-2 w-7 h-7" style={{ color: "#C4847A" }} />
      </div>
      <div className="inline-block bg-green-50 text-green-700 px-5 py-2 rounded-full text-sm font-semibold mb-6 border border-green-200">
        Access Unlocked
      </div>
      <h1
        className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
        style={{ color: "#6E1D40", fontFamily: "'DM Serif Display', Georgia, serif" }}
      >
        Welcome to your Blueprint
      </h1>
      <p className="text-gray-600 text-lg mb-8 leading-relaxed">
        Your payment is confirmed and your course is open. This is the beginning of the work you were
        always meant to do.
      </p>
      <div className="space-y-4 text-left mb-10">
        <h3 className="font-bold text-base" style={{ color: "#6E1D40" }}>What happens next:</h3>
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
              style={{ background: "#6E1D40" }}
            >
              {i + 1}
            </div>
            <span className="text-gray-700 text-sm">{step}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href={COURSE_URL}
          className="group inline-flex items-center gap-2 text-white font-bold px-8 py-3 rounded-full text-sm transition-all hover:opacity-90 hover:shadow-xl"
          style={{ background: "linear-gradient(135deg,#6E1D40,#C4847A)" }}
        >
          Enter your course <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
        <a
          href="/"
          className="inline-flex items-center gap-2 border-2 font-bold px-8 py-3 rounded-full text-sm transition-all hover:bg-rose-50"
          style={{ borderColor: "#6E1D40", color: "#6E1D40" }}
        >
          <Heart className="w-4 h-4" /> Back to Home
        </a>
      </div>
    </Shell>
  );
}