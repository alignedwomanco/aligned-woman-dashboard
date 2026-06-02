import React from "react";
import { motion } from "framer-motion";

const FONT_SERIF = "'DM Serif Display', serif";
const FONT_SANS = "'Montserrat', sans-serif";

function Eyebrow({ children }) {
  return (
    <p style={{ fontFamily: FONT_SANS, fontWeight: 700, fontSize: "10px", letterSpacing: "0.28em", textTransform: "uppercase", color: "#C4847A", marginBottom: "16px" }}>
      {children}
    </p>
  );
}

function PrimaryButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "15px 30px", borderRadius: "100px", background: "#4A0E2E", color: "#FFFFFF", border: "none", fontFamily: FONT_SANS, fontWeight: 700, fontSize: "11px", letterSpacing: "0.22em", textTransform: "uppercase", cursor: "pointer", transition: "opacity 180ms ease" }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "15px 30px", borderRadius: "100px", background: "transparent", color: "#4A0E2E", border: "1px solid #4A0E2E", fontFamily: FONT_SANS, fontWeight: 700, fontSize: "11px", letterSpacing: "0.22em", textTransform: "uppercase", cursor: "pointer", transition: "all 180ms ease" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(74,14,46,0.05)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </button>
  );
}

// Full-screen milestone shown by the module player at completion points.
// Three stages: "lesson", "module", "course".
export default function JourneyMilestone({
  stage,
  moduleTitle,
  lessonTitle,
  nextLessonTitle,
  hasWorkbook,
  nextModuleTitle,
  nextExpertName,
  onStartWorkbook,
  onContinue,
  onDashboard,
}) {
  const nextModuleUp = nextModuleTitle ? (
    <p style={{ fontFamily: FONT_SANS, fontSize: "12px", color: "#8A7A76", marginTop: "28px" }}>
      Up next, <span style={{ color: "#3A2A28", fontWeight: 600 }}>{nextModuleTitle}</span>
      {nextExpertName ? <> with {nextExpertName}</> : null}.
    </p>
  ) : null;

  let content;

  if (stage === "lesson") {
    content = (
      <>
        <Eyebrow>Lesson complete</Eyebrow>
        <h1 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: "40px", lineHeight: 1.1, color: "#4A0E2E", margin: "0 0 20px" }}>
          {lessonTitle ? (
            <>You've finished <span style={{ fontStyle: "italic", color: "#C4847A" }}>{lessonTitle}</span>.</>
          ) : (
            "Lesson complete."
          )}
        </h1>
        {hasWorkbook ? (
          <p style={{ fontFamily: FONT_SANS, fontSize: "16px", lineHeight: 1.7, color: "#3A2A28", margin: "0 auto 32px", maxWidth: "520px" }}>
            This module has an integration practice waiting whenever you want to take what you are learning deeper. It stays open, so there is no rush.
          </p>
        ) : (
          <p style={{ fontFamily: FONT_SANS, fontSize: "16px", lineHeight: 1.7, color: "#3A2A28", margin: "0 auto 32px", maxWidth: "520px" }}>
            That is one more piece in place. Keep going whenever you are ready.
          </p>
        )}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <PrimaryButton onClick={onContinue}>{nextLessonTitle ? "Next lesson" : "Continue"}</PrimaryButton>
          {hasWorkbook ? <SecondaryButton onClick={onStartWorkbook}>Open the integration practice</SecondaryButton> : null}
        </div>
        {nextLessonTitle ? (
          <p style={{ fontFamily: FONT_SANS, fontSize: "12px", color: "#8A7A76", marginTop: "28px" }}>
            Up next, <span style={{ color: "#3A2A28", fontWeight: 600 }}>{nextLessonTitle}</span>.
          </p>
        ) : null}
      </>
    );
  } else if (stage === "module") {
    content = (
      <>
        <Eyebrow>Module complete</Eyebrow>
        <h1 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: "44px", lineHeight: 1.1, color: "#4A0E2E", margin: "0 0 20px" }}>
          You've finished{" "}
          <span style={{ fontStyle: "italic", color: "#C4847A" }}>{moduleTitle}</span>.
        </h1>
        {hasWorkbook ? (
          <>
            <p style={{ fontFamily: FONT_SANS, fontSize: "16px", lineHeight: 1.7, color: "#3A2A28", margin: "0 auto 32px", maxWidth: "520px" }}>
              Before you move on, there is the integration practice. This is where what you have just learned settles into your real life, in your own words. Take your time with it.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <PrimaryButton onClick={onStartWorkbook}>Start the integration practice</PrimaryButton>
              <SecondaryButton onClick={onContinue}>Continue the Blueprint</SecondaryButton>
            </div>
            <p style={{ fontFamily: FONT_SANS, fontSize: "12px", color: "#8A7A76", marginTop: "16px" }}>
              It stays open. You can come back whenever you are ready.
            </p>
          </>
        ) : (
          <>
            <p style={{ fontFamily: FONT_SANS, fontSize: "16px", lineHeight: 1.7, color: "#3A2A28", margin: "0 auto 32px", maxWidth: "520px" }}>
              That is another piece of the picture in place. When you are ready, the next one is waiting.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <PrimaryButton onClick={onContinue}>Continue the Blueprint</PrimaryButton>
            </div>
          </>
        )}
        {nextModuleUp}
      </>
    );
  } else {
    content = (
      <>
        <Eyebrow>The Aligned Woman Blueprint</Eyebrow>
        <h1 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: "48px", lineHeight: 1.05, color: "#4A0E2E", margin: "0 0 20px" }}>
          You've done the whole thing.
        </h1>
        <p style={{ fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: "24px", lineHeight: 1.35, color: "#C4847A", margin: "0 auto 24px", maxWidth: "560px" }}>
          This was the education you should have been given. Now it belongs to you.
        </p>
        <p style={{ fontFamily: FONT_SANS, fontSize: "16px", lineHeight: 1.7, color: "#3A2A28", margin: "0 auto 32px", maxWidth: "540px" }}>
          Every phase, every practice, every honest answer. You kept showing up for yourself, and that changes things. None of it closes behind you. Return to any practice whenever life asks the questions again.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <PrimaryButton onClick={onDashboard}>Return to your dashboard</PrimaryButton>
        </div>
      </>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center px-6 overflow-y-auto"
      style={{ background: "#FAF5F3" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
        style={{ maxWidth: "640px", width: "100%", textAlign: "center", paddingTop: "40px", paddingBottom: "40px" }}
      >
        {content}
      </motion.div>
    </motion.div>
  );
}