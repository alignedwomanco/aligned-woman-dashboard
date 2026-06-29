import React from "react";
import { ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import MoneyStoryCard from "@/components/dashboard-v2/MoneyStoryCard";

/**
 * StateCNoQuiz - free member home for an account with no archetype yet, for
 * example one arriving through the Your Money Story funnel rather than the quiz.
 * Shows only free content: the quiz invitation, the Money Story card, and a
 * Blueprint invitation. It never renders Blueprint course material. A quiet link
 * lets a buyer who signed in on the wrong email switch accounts.
 */
export default function StateCNoQuiz({ user, profile, onCheckout }) {
  const handleWrongEmail = () => {
    base44.auth.logout(`${window.location.origin}/Dashboard`);
  };

  return (
    <div className="space-y-6">
      {/* Welcome / orientation */}
      <section className="bg-awrose-pale rounded-xl p-6 md:p-8">
        <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-deep uppercase mb-4">
          <span className="inline-block w-3 h-px bg-awrose-deep mr-2 align-middle" />
          WELCOME IN
        </p>
        <h2 className="font-display text-awburg-core text-[28px] md:text-[34px] leading-tight mb-4">
          This is your <span className="italic text-awrose-core">starting place</span>.
        </h2>
        <p className="font-body font-light text-awburg-core/75 text-sm md:text-base leading-relaxed max-w-xl">
          You are in, and two things are open to you right now with nothing to pay. Find your pattern in a short diagnostic, and work through Your Money Story whenever you are ready. When the time feels right, the full Blueprint is here too.
        </p>
      </section>

      {/* Quiz invitation */}
      <section className="rounded-xl border border-awburg-core/8 p-6 md:p-8 overflow-hidden relative" style={{ minHeight: 180 }}>
        <video
          src="https://pub-e1032a6c8b9241cf9d03513d43a81f17.r2.dev/YourPattern.mp4"
          autoPlay
          muted
          loop
          playsInline
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(10,2,6,0.55)", pointerEvents: "none" }} />
        <h3 className="relative font-display text-paper text-[26px] md:text-[30px] leading-tight mb-3">
          Find your <span className="italic text-awrose-light">pattern</span>.
        </h3>
        <p className="relative font-body font-light text-white text-sm leading-relaxed mb-5 max-w-lg">
          A short diagnostic. It will not change what you have access to. It will sharpen what you notice in the work.
        </p>
        <button onClick={() => window.location.href = "/StartingPointProfile"} className="relative font-body font-bold text-[11px] tracking-eyebrow text-paper hover:text-awrose-light uppercase inline-flex items-center gap-2 transition-colors">
          TAKE THE QUIZ <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </section>

      {/* Your Money Story */}
      <MoneyStoryCard />

      {/* Blueprint invitation - dark editorial (mirrors StateC) */}
      <section
        className="rounded-xl p-8 md:p-10"
        style={{
          background: "linear-gradient(160deg, #0E0208 0%, #1A0510 35%, #4A0E2E 65%, #1A0510 100%)",
          color: "#FAF5F3",
        }}
      >
        <p
          className="font-body font-bold text-[10px] tracking-eyebrow uppercase mb-6"
          style={{ color: "#E8B4AE" }}
        >
          <span className="inline-block w-5 h-px mr-3 align-middle" style={{ background: "#E8B4AE" }} />
          WHEN YOU ARE READY
        </p>
        <h3
          className="font-display text-[34px] md:text-[48px] leading-tight mb-5 max-w-xl"
          style={{ color: "#FAF5F3", fontWeight: 400 }}
        >
          The room beyond <span className="italic" style={{ color: "#E8B4AE" }}>the doorway</span>.
        </h3>
        <p
          className="font-body font-light text-sm md:text-base leading-relaxed mb-8 max-w-lg"
          style={{ color: "rgba(250,245,243,0.6)" }}
        >
          The internal architecture you were never given, taught in sequence, by practitioners who have done the work.
        </p>

        <div className="mb-8" style={{ width: 48, height: 1, background: "rgba(232,180,174,0.3)" }} />

        <div className="flex items-baseline gap-4 mb-8">
          <span
            className="font-display italic"
            style={{ fontSize: "clamp(40px, 5vw, 56px)", color: "#E8B4AE", lineHeight: 1, fontWeight: 400 }}
          >
            R3,997
          </span>
          <span
            className="font-body font-bold text-[10px] tracking-eyebrow uppercase"
            style={{ color: "rgba(250,245,243,0.45)" }}
          >
            ONE INVESTMENT · 1 YEAR ACCESS
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={onCheckout}
            className="inline-flex items-center gap-2 text-xs font-bold tracking-eyebrow uppercase py-4 px-8 rounded-full transition-all duration-200"
            style={{ background: "#C4847A", color: "#0E0208" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#E8B4AE"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#C4847A"; }}
          >
            BEGIN THE BLUEPRINT
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.location.href = "/blueprint"}
            className="inline-flex items-center gap-2 text-xs font-bold tracking-eyebrow uppercase py-4 px-8 rounded-full transition-all duration-200"
            style={{ background: "transparent", border: "1px solid rgba(250,245,243,0.2)", color: "rgba(250,245,243,0.6)" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(250,245,243,0.4)"; e.currentTarget.style.color = "#FAF5F3"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(250,245,243,0.2)"; e.currentTarget.style.color = "rgba(250,245,243,0.6)"; }}
          >
            LEARN MORE
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Quiet path for a buyer who signed in on the wrong email */}
      <p className="font-body text-xs text-awburg-core/55 text-center pt-1">
        Already purchased the Blueprint?{" "}
        <button
          onClick={handleWrongEmail}
          className="font-bold text-awburg-core/75 hover:text-awburg-core underline underline-offset-2 transition-colors"
        >
          Log in with the email you bought on
        </button>
      </p>
    </div>
  );
}