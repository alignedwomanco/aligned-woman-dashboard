import React, { useState, useEffect } from "react";

/*
  MONEY WORKBOOK - Section 1: My Relationship with Money Today
  Interactive diagnostic with step-by-step flow.

  DATA CONTRACT:
  Reads/writes these field_ids via onAnswerChange(fieldId, value):
    s01_confidence      - number (1-10)
    s01_financial_state  - array of selected item ids
    s01_emotions        - array of emotion words
    s01_custom_emotion  - string
    s01_narrative       - string
*/

/* ── Shared constants ─────────────────────────────────── */

const CONFIDENCE_LABELS = {
  1:  { label: "In crisis", severity: "red", msg: "You are carrying a heavy load right now. That takes courage to name. This workbook is a safe place to start understanding why, and what small shifts might help." },
  2:  { label: "Deeply anxious", severity: "red", msg: "Money feels like a source of real pain for you. That is more common than you think, and it is not a reflection of your worth. Let us gently explore what is underneath this." },
  3:  { label: "Struggling", severity: "red", msg: "You are aware that something is not working. That awareness is the first step. Many women sit here for years before doing what you are doing right now." },
  4:  { label: "Uncertain", severity: "amber", msg: "You are in a middle space. Not in crisis, but not confident either. This is actually the most common starting point, and the place where small changes create the biggest shifts." },
  5:  { label: "Neutral", severity: "amber", msg: "You are managing, but something brought you here. Perhaps a feeling that you could be doing more, or a quiet worry you have been putting off. Let us explore that." },
  6:  { label: "Cautiously okay", severity: "amber", msg: "You have some foundations in place but know there are gaps. That self-awareness is valuable. This workbook will help you identify exactly where to focus." },
  7:  { label: "Mostly confident", severity: "green", msg: "You are in a good position. The work ahead is about refinement and intention, making sure your money decisions reflect your actual values, not just habits." },
  8:  { label: "Confident", severity: "green", msg: "You have built real financial stability. This workbook will help you deepen that confidence and close any remaining gaps." },
  9:  { label: "Very confident", severity: "green", msg: "You are in a strong position. The value of this workbook for you is in examining the emotional and psychological patterns that could still influence your decisions." },
  10: { label: "Fully at peace", severity: "green", msg: "Complete financial peace is rare and worth protecting. Use this workbook to document what is working for you, so you can maintain it through life changes ahead." },
};

const DIAGNOSTIC_ITEMS = [
  { id: "cashflow", text: "I spend more than I earn most months", category: "Cashflow", severity: "high", insight: "This is the single most important number in your financial life. When outflow exceeds income, every other financial goal becomes unreachable. Part 6 of this workbook will help you map exactly where the gap is." },
  { id: "emergency", text: "I have no emergency fund", category: "Safety Net", severity: "high", insight: "Without a buffer, every unexpected expense becomes a crisis. Dr. Nasrat calls this the foundation of financial confidence. Even a small amount set aside is a start." },
  { id: "avoidance", text: "I avoid looking at my bank statements", category: "Behaviour", severity: "medium", insight: "Avoidance is one of the most common money behaviours, and it almost always has roots in childhood. We will explore this in Parts 2 and 3. For now, simply notice: what feeling comes up when you think about opening your banking app?" },
  { id: "debt", text: "I carry credit card debt I cannot pay off monthly", category: "Debt", severity: "high", insight: "Revolving credit card debt is one of the most expensive forms of borrowing. This is not a moral failing. It is often a sign that spending and income are misaligned. Part 6 will help you see where." },
  { id: "no_plan", text: "I have no savings or investment plan", category: "Future Planning", severity: "high", insight: "As Dr. Nasrat teaches, compounding rewards patience. Every month without a plan is a month of compounding you will not get back. Part 7 will help you build a simple, achievable savings framework." },
  { id: "anxiety", text: "I feel anxious when money comes up in conversation", category: "Emotional", severity: "medium", insight: "Money anxiety often signals unresolved experiences from childhood. This is not about the numbers. It is about what money represents to you. Parts 2, 3, and 4 will help you trace this." },
  { id: "emotional", text: "I make financial decisions based on emotion rather than strategy", category: "Behaviour", severity: "medium", insight: "Emotional decision-making is human, not wrong. But when emotions consistently override planning, it often means deeper patterns are at work. Part 4 will map your specific triggers." },
  { id: "dependent", text: "I rely on someone else to manage my finances", category: "Agency", severity: "medium", insight: "Financial dependence can feel safe, but it also means your security depends on someone else's choices. Dr. Nasrat spoke about women who could not leave difficult situations because of this pattern. Parts 7 and 9 address building your own foundation." },
  { id: "directionless_savings", text: "I have savings but no clear goals for them", category: "Direction", severity: "low", insight: "Having savings is a genuine strength. What is missing is intention. Part 7 will help you assign purpose to what you have, across short, medium, and long-term horizons." },
  { id: "control", text: "I feel relatively in control but want to do better", category: "Growth", severity: "low", insight: "You are starting from a position of stability. The work ahead is about optimisation and depth: understanding why you make the choices you do, and whether your strategy reflects your actual values." },
];

const EMOTION_PRESETS = [
  { word: "Anxiety", category: "fear" }, { word: "Shame", category: "fear" },
  { word: "Guilt", category: "fear" }, { word: "Overwhelm", category: "fear" },
  { word: "Denial", category: "avoidance" }, { word: "Numbness", category: "avoidance" },
  { word: "Indifference", category: "avoidance" },
  { word: "Control", category: "power" }, { word: "Pride", category: "power" },
  { word: "Freedom", category: "power" },
  { word: "Hope", category: "growth" }, { word: "Curiosity", category: "growth" },
  { word: "Excitement", category: "growth" },
  { word: "Frustration", category: "tension" }, { word: "Resentment", category: "tension" },
  { word: "Confusion", category: "tension" },
];

const EMOTION_INSIGHTS = {
  fear: "Fear-based money emotions usually trace back to experiences of scarcity, instability, or shame in childhood. In Parts 2 and 3, we will look at where these feelings first took root.",
  avoidance: "When we disconnect from money emotionally, it is often a protective mechanism. Your mind learned at some point that not engaging was safer than engaging. We will explore when that started.",
  power: "Feeling a sense of power or control around money is a strength. The question for you in this workbook is whether that control comes from a healthy place, or from a fear of what happens without it.",
  growth: "Approaching money with hope or curiosity is a wonderful starting point. You are open to learning, which means the patterns we uncover in later sections can be worked with rather than fought against.",
  tension: "Frustration and resentment around money often signal a gap between where you are and where you feel you should be. That gap is not failure. It is information we will use.",
};

const SEVERITY_CONFIG = {
  high:   { color: "var(--aw-red, #A23B3B)", bg: "#FEF2F2", border: "#FECACA", label: "Needs attention" },
  medium: { color: "var(--aw-amber, #B8860B)", bg: "#FFFBEB", border: "#FDE68A", label: "Worth exploring" },
  low:    { color: "var(--aw-green, #3D7A5F)", bg: "#F0FDF4", border: "#BBF7D0", label: "Building on strength" },
};

/* ── Fade-in wrapper ──────────────────────────────────── */

function FadeIn({ children, delay = 0 }) {
  const [v, setV] = useState(false);
  useEffect(() => { const t = setTimeout(() => setV(true), delay); return () => clearTimeout(t); }, [delay]);
  return <div style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(12px)", transition: "all 0.5s cubic-bezier(0.22,1,0.36,1)" }}>{children}</div>;
}

/* ── Step indicator ───────────────────────────────────── */

function StepIndicator({ steps, current, onStepClick }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, padding: "0 4px", marginBottom: 28 }}>
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const clickable = done && onStepClick;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
            <div
              onClick={() => clickable && onStepClick(i)}
              style={{
                width: 32, height: 32, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: done ? "var(--aw-burg-core)" : active ? "white" : "transparent",
                border: `2px solid ${done || active ? "var(--aw-burg-core)" : "var(--aw-border, #E8DDD6)"}`,
                color: done ? "white" : active ? "var(--aw-burg-core)" : "var(--aw-soft-grey, #A89B94)",
                fontSize: 13, fontWeight: 600, flexShrink: 0,
                cursor: clickable ? "pointer" : "default",
                fontFamily: "var(--aw-font-sans)",
              }}
            >
              {done ? "✓" : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? "var(--aw-burg-core)" : "var(--aw-border, #E8DDD6)", margin: "0 6px", minWidth: 16 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Continue button removed — navigation handled by bottom bar ── */

/* ── Step 1: Confidence scale ─────────────────────────── */

function ConfidenceStep({ value, onChange, onNext }) {
  const info = value ? CONFIDENCE_LABELS[value] : null;
  const severityColor = info ? ({ red: "var(--aw-red, #A23B3B)", amber: "var(--aw-amber, #B8860B)", green: "var(--aw-green, #3D7A5F)" }[info.severity]) : null;
  const severityBg = info ? ({ red: "#FDEAEA", amber: "#FDF3E0", green: "#E8F3ED" }[info.severity]) : null;

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-burg-core)", fontFamily: "var(--aw-font-display)" }}>
        How financially confident do you feel right now?
      </h3>
      <p style={{ margin: "0 0 20px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>
        There is no right answer. This is your private starting point.
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: "var(--aw-soft-grey, #A89B94)", fontFamily: "var(--aw-font-sans)" }}>Constant anxiety</span>
        <span style={{ fontSize: 12, color: "var(--aw-soft-grey, #A89B94)", fontFamily: "var(--aw-font-sans)" }}>Completely at peace</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const isSelected = value === n;
          return (
            <button key={n} onClick={() => onChange(n)} style={{
              width: 44, height: 44, borderRadius: "50%",
              border: `2px solid ${isSelected ? "var(--aw-burg-core)" : "var(--aw-border, #E8DDD6)"}`,
              background: isSelected ? "var(--aw-burg-core)" : "white",
              color: isSelected ? "white" : "var(--aw-dark-grey)",
              fontWeight: 600, fontSize: 16, cursor: "pointer",
              transition: "all 0.25s", fontFamily: "var(--aw-font-sans)",
              transform: isSelected ? "scale(1.15)" : "scale(1)",
              boxShadow: isSelected ? "0 4px 16px rgba(122,45,60,0.3)" : "none",
            }}>{n}</button>
          );
        })}
      </div>
      {info && (
        <FadeIn key={value}>
          <div style={{ background: severityBg, borderRadius: 12, padding: "20px 24px", borderLeft: `4px solid ${severityColor}`, marginTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ padding: "3px 12px", borderRadius: 20, background: severityColor, color: "white", fontSize: 12, fontWeight: 600, fontFamily: "var(--aw-font-sans)" }}>{value}/10</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: severityColor, fontFamily: "var(--aw-font-sans)" }}>{info.label}</span>
            </div>
            <p style={{ margin: 0, fontSize: 15, color: "var(--aw-dark-grey)", lineHeight: 1.65, fontFamily: "var(--aw-font-sans)" }}>{info.msg}</p>
          </div>
        </FadeIn>
      )}
      {/* navigation via bottom bar */}
    </div>
  );
}

/* ── Step 2: Diagnostic checklist ─────────────────────── */

function DiagnosticChecklistStep({ selected, onToggle, onNext, onBack }) {
  const highCount = DIAGNOSTIC_ITEMS.filter(d => selected.includes(d.id) && d.severity === "high").length;
  const medCount = DIAGNOSTIC_ITEMS.filter(d => selected.includes(d.id) && d.severity === "medium").length;
  const lowCount = DIAGNOSTIC_ITEMS.filter(d => selected.includes(d.id) && d.severity === "low").length;

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-burg-core)", fontFamily: "var(--aw-font-display)" }}>
        Which of these are true for you right now?
      </h3>
      <p style={{ margin: "0 0 20px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>
        Select everything that applies. Each selection unlocks a personalised insight.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {DIAGNOSTIC_ITEMS.map((item) => {
          const isSelected = selected.includes(item.id);
          const sev = SEVERITY_CONFIG[item.severity];
          return (
            <div key={item.id}>
              <button onClick={() => onToggle(item.id)} style={{
                width: "100%", textAlign: "left", padding: "14px 18px", borderRadius: 10,
                border: `1.5px solid ${isSelected ? sev.border : "var(--aw-border, #E8DDD6)"}`,
                background: isSelected ? sev.bg : "white", cursor: "pointer", transition: "all 0.25s",
                display: "flex", alignItems: "flex-start", gap: 14,
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 4, flexShrink: 0, marginTop: 1,
                  border: `2px solid ${isSelected ? sev.color : "var(--aw-border, #E8DDD6)"}`,
                  background: isSelected ? sev.color : "white",
                  display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
                }}>{isSelected && <span style={{ color: "white", fontSize: 14, fontWeight: 700 }}>&#10003;</span>}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 15, fontWeight: isSelected ? 600 : 400, color: "var(--aw-dark-grey)", lineHeight: 1.45, fontFamily: "var(--aw-font-sans)" }}>{item.text}</span>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, fontWeight: 600, background: isSelected ? `${sev.color}22` : "rgba(168,155,148,0.15)", color: isSelected ? sev.color : "var(--aw-soft-grey, #A89B94)", fontFamily: "var(--aw-font-sans)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{item.category}</span>
                  </div>
                </div>
              </button>
              {isSelected && (
                <FadeIn>
                  <div style={{ margin: "6px 0 4px 36px", padding: "12px 16px", borderRadius: 8, background: "white", borderLeft: `3px solid ${sev.color}`, fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontFamily: "var(--aw-font-sans)", fontStyle: "italic" }}>{item.insight}</div>
                </FadeIn>
              )}
            </div>
          );
        })}
      </div>
      {selected.length > 0 && (
        <FadeIn>
          <div style={{ marginTop: 24, padding: "16px 20px", borderRadius: 10, background: "white", border: "1px solid var(--aw-border, #E8DDD6)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 10, fontFamily: "var(--aw-font-sans)" }}>Your snapshot: {selected.length} item{selected.length > 1 ? "s" : ""} selected</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {highCount > 0 && <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, background: SEVERITY_CONFIG.high.bg, border: `1px solid ${SEVERITY_CONFIG.high.border}` }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: SEVERITY_CONFIG.high.color }} /><span style={{ fontSize: 13, fontWeight: 600, color: SEVERITY_CONFIG.high.color, fontFamily: "var(--aw-font-sans)" }}>{highCount} need{highCount > 1 ? "" : "s"} attention</span></div>}
              {medCount > 0 && <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, background: SEVERITY_CONFIG.medium.bg, border: `1px solid ${SEVERITY_CONFIG.medium.border}` }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: SEVERITY_CONFIG.medium.color }} /><span style={{ fontSize: 13, fontWeight: 600, color: SEVERITY_CONFIG.medium.color, fontFamily: "var(--aw-font-sans)" }}>{medCount} worth exploring</span></div>}
              {lowCount > 0 && <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, background: SEVERITY_CONFIG.low.bg, border: `1px solid ${SEVERITY_CONFIG.low.border}` }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: SEVERITY_CONFIG.low.color }} /><span style={{ fontSize: 13, fontWeight: 600, color: SEVERITY_CONFIG.low.color, fontFamily: "var(--aw-font-sans)" }}>{lowCount} building on strength</span></div>}
            </div>
          </div>
        </FadeIn>
      )}
      {/* navigation via bottom bar */}
    </div>
  );
}

/* ── Step 3: Emotion picker ───────────────────────────── */

function EmotionStep({ selectedEmotions, onToggle, customEmotion, onCustomChange, onNext, onBack }) {
  const topCategory = (() => {
    const cats = selectedEmotions.map(w => EMOTION_PRESETS.find(e => e.word === w)?.category).filter(Boolean);
    if (cats.length === 0) return null;
    const counts = {};
    cats.forEach(c => { counts[c] = (counts[c] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  })();

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-burg-core)", fontFamily: "var(--aw-font-display)" }}>When you think about money, what do you feel?</h3>
      <p style={{ margin: "0 0 20px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>Choose up to 3 emotions. These are not judgements. They are data about your inner landscape.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {EMOTION_PRESETS.map(em => {
          const sel = selectedEmotions.includes(em.word);
          const disabled = !sel && selectedEmotions.length >= 3;
          return (
            <button key={em.word} onClick={() => !disabled && onToggle(em.word)} style={{
              padding: "10px 18px", borderRadius: 24,
              border: `1.5px solid ${sel ? "var(--aw-burg-core)" : "var(--aw-border, #E8DDD6)"}`,
              background: sel ? "var(--aw-rose-pale)" : "white",
              cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.4 : 1,
              fontSize: 14, fontWeight: sel ? 600 : 400,
              color: sel ? "var(--aw-burg-core)" : "var(--aw-dark-grey)",
              fontFamily: "var(--aw-font-sans)", transition: "all 0.2s",
            }}>{em.word}</button>
          );
        })}
      </div>
      <div style={{ marginTop: 16 }}>
        <label style={{ fontSize: 13, color: "var(--aw-dark-grey)", display: "block", marginBottom: 6, fontFamily: "var(--aw-font-sans)" }}>Or name your own:</label>
        <input type="text" value={customEmotion} onChange={e => onCustomChange(e.target.value)} placeholder="Type an emotion not listed above..." style={{
          width: "100%", maxWidth: 360, padding: "10px 14px",
          border: "1.5px solid var(--aw-border, #E8DDD6)", borderRadius: 8,
          fontSize: 15, fontFamily: "var(--aw-font-sans)", color: "var(--aw-dark-grey)", boxSizing: "border-box",
        }} />
      </div>
      {topCategory && EMOTION_INSIGHTS[topCategory] && (
        <FadeIn key={topCategory}>
          <div style={{ marginTop: 24, padding: "20px 24px", borderRadius: 12, background: "var(--aw-rose-pale)", borderLeft: "4px solid var(--aw-rose-core)" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--aw-rose-core)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontFamily: "var(--aw-font-sans)" }}>What your emotions suggest</div>
            <p style={{ margin: 0, fontSize: 15, color: "var(--aw-dark-grey)", lineHeight: 1.65, fontFamily: "var(--aw-font-sans)" }}>{EMOTION_INSIGHTS[topCategory]}</p>
          </div>
        </FadeIn>
      )}
      {/* navigation via bottom bar */}
    </div>
  );
}

/* ── Step 4: Narrative ────────────────────────────────── */

function NarrativeStep({ text, onChange, onNext, onBack }) {
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-burg-core)", fontFamily: "var(--aw-font-display)" }}>Describe your financial life right now, in your own words.</h3>
      <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>Write 3 to 5 sentences. Nobody else will see this. Be as honest as you can.</p>
      <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 8, background: "var(--aw-rose-pale)", fontSize: 13, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontFamily: "var(--aw-font-sans)" }}>
        <strong style={{ color: "var(--aw-burg-core)" }}>Prompts to help you start:</strong><br />
        Do you know exactly what you earn and spend each month? Is there a plan in place, or are you winging it? What is the thing that worries you most about money right now? What would change if you felt truly confident with your finances?
      </div>
      <div style={{ position: "relative" }}>
        <textarea value={text} onChange={e => onChange(e.target.value)} rows={6} placeholder="Start writing here..." style={{
          width: "100%", padding: "14px 16px",
          border: "1.5px solid var(--aw-border, #E8DDD6)", borderRadius: 10,
          fontSize: 16, fontFamily: "var(--aw-font-sans)", color: "var(--aw-dark-grey)",
          lineHeight: 1.7, resize: "vertical", boxSizing: "border-box", background: "white",
        }} />
        <div style={{ position: "absolute", bottom: 10, right: 14, fontSize: 12, color: wordCount >= 20 ? "var(--aw-green, #3D7A5F)" : "var(--aw-soft-grey, #A89B94)", fontFamily: "var(--aw-font-sans)" }}>{wordCount} word{wordCount !== 1 ? "s" : ""}</div>
      </div>
      {/* navigation via bottom bar */}
    </div>
  );
}

/* ── Step 5: Diagnostic summary ───────────────────────── */

function DiagnosticSummary({ confidence, selected, emotions, onBack }) {
  const confInfo = CONFIDENCE_LABELS[confidence] || {};
  const selectedItems = DIAGNOSTIC_ITEMS.filter(d => selected.includes(d.id));
  const highItems = selectedItems.filter(d => d.severity === "high");
  const medItems = selectedItems.filter(d => d.severity === "medium");

  let profile = "Stable", profileColor = "var(--aw-green, #3D7A5F)", profileDesc = "";
  if (highItems.length >= 3) { profile = "Under pressure"; profileColor = "var(--aw-red, #A23B3B)"; profileDesc = "Multiple areas of your financial life need attention. This is not a judgement. It is a starting point."; }
  else if (highItems.length >= 1) { profile = "Mixed foundations"; profileColor = "var(--aw-amber, #B8860B)"; profileDesc = "You have some strengths to build on, and some areas that need focused attention."; }
  else if (medItems.length >= 2) { profile = "Emerging awareness"; profileColor = "var(--aw-amber, #B8860B)"; profileDesc = "Your financial foundations are present but there are patterns worth examining."; }
  else if (selected.length === 0) { profile = "Strong foundation"; profileDesc = "Your financial position is relatively stable. The value of this workbook is in deepening your understanding of the patterns that influence your decisions."; }
  else { profile = "Building"; profileColor = "var(--aw-amber, #B8860B)"; profileDesc = "You are in a transitional space. The awareness you are bringing is exactly what is needed."; }

  return (
    <div>
      <h3 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 600, color: "var(--aw-burg-core)", textAlign: "center", fontFamily: "var(--aw-font-display)" }}>Your Financial State Diagnostic</h3>

      <FadeIn>
        <div style={{ background: "white", borderRadius: 16, padding: "28px", marginBottom: 24, border: "1px solid var(--aw-border, #E8DDD6)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--aw-soft-grey, #A89B94)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6, fontFamily: "var(--aw-font-sans)" }}>Your current profile</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: profileColor, fontFamily: "var(--aw-font-display)" }}>{profile}</div>
            </div>
            <div style={{ width: 72, height: 72, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: `${confInfo.severity === "red" ? "#FDEAEA" : confInfo.severity === "amber" ? "#FDF3E0" : "#E8F3ED"}`, border: `3px solid ${confInfo.severity === "red" ? "var(--aw-red, #A23B3B)" : confInfo.severity === "amber" ? "var(--aw-amber, #B8860B)" : "var(--aw-green, #3D7A5F)"}` }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-sans)" }}>{confidence}</span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 15, color: "var(--aw-dark-grey)", lineHeight: 1.65, fontFamily: "var(--aw-font-sans)" }}>{profileDesc}</p>
        </div>
      </FadeIn>

      {selectedItems.length > 0 && (
        <FadeIn delay={200}>
          <div style={{ background: "white", borderRadius: 16, padding: "24px", border: "1px solid var(--aw-border, #E8DDD6)", marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 16, fontFamily: "var(--aw-font-sans)" }}>Areas identified</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {selectedItems.map(item => {
                const sev = SEVERITY_CONFIG[item.severity];
                return (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 8, background: sev.bg }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: sev.color, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 14, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-sans)" }}>{item.text}</span>
                    <span style={{ fontSize: 11, color: sev.color, fontWeight: 600, fontFamily: "var(--aw-font-sans)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{sev.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>
      )}

      {emotions.length > 0 && (
        <FadeIn delay={400}>
          <div style={{ background: "white", borderRadius: 16, padding: "24px", border: "1px solid var(--aw-border, #E8DDD6)", marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 12, fontFamily: "var(--aw-font-sans)" }}>Your emotional landscape with money</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {emotions.map(e => (
                <div key={e} style={{ padding: "8px 16px", borderRadius: 20, background: "var(--aw-rose-pale)", border: "1px solid rgba(196,132,122,0.3)" }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "var(--aw-burg-core)", fontFamily: "var(--aw-font-sans)" }}>{e}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      )}

      {/* navigation via bottom bar */}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */

export default function Section1Diagnostic({ section, answers = {}, onAnswerChange, isLastSection, isComplete, completedAt, onFinish, onMarkInProgress, step = 0 }) {
  // ── Read persisted state from answers ──
  const confidence     = answers.s01_confidence || 0;
  const selected       = answers.s01_financial_state || [];
  const emotions       = answers.s01_emotions || [];
  const customEmotion  = answers.s01_custom_emotion || "";
  const narrative      = answers.s01_narrative || "";

  // ── Helpers to write back to the workbook response ──
  const save = (fieldId, value) => {
    if (onAnswerChange) onAnswerChange(fieldId, value);
  };

  const toggleSelected = (id) => {
    const next = selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id];
    save("s01_financial_state", next);
  };

  const toggleEmotion = (word) => {
    const next = emotions.includes(word) ? emotions.filter(w => w !== word) : emotions.length < 3 ? [...emotions, word] : emotions;
    save("s01_emotions", next);
  };

  const STEPS = ["Confidence", "Financial state", "Emotions", "Your words", "Diagnostic"];

  return (
    <div>
      {/* Section header (matches app pattern) */}
      <div style={{ marginBottom: 36 }}>
        {section?.part_label && (
          <p style={{ fontFamily: "var(--aw-font-sans)", fontWeight: 700, fontSize: 10, lineHeight: 1.4, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--aw-rose-core)", margin: "0 0 8px" }}>{section.part_label}</p>
        )}
        {section?.heading && (
          <h1 style={{ fontFamily: "var(--aw-font-display)", fontWeight: 400, fontSize: "clamp(34px, 4.6vw, 52px)", lineHeight: 1.05, letterSpacing: "-0.015em", color: "var(--aw-burg-core)", margin: 0 }}>{section.heading}</h1>
        )}
        {section?.intro && (
          <p style={{ fontFamily: "var(--aw-font-sans)", fontWeight: 300, fontSize: 16, lineHeight: 1.85, color: "var(--aw-dark-grey)", margin: "18px 0 0" }}>{section.intro}</p>
        )}
      </div>

      {/* Step indicator */}
      <StepIndicator steps={STEPS} current={step} />

      {/* Steps */}
      {step === 0 && <ConfidenceStep value={confidence} onChange={v => save("s01_confidence", v)} />}
      {step === 1 && <DiagnosticChecklistStep selected={selected} onToggle={toggleSelected} />}
      {step === 2 && <EmotionStep selectedEmotions={emotions} onToggle={toggleEmotion} customEmotion={customEmotion} onCustomChange={v => save("s01_custom_emotion", v)} />}
      {step === 3 && <NarrativeStep text={narrative} onChange={v => save("s01_narrative", v)} />}
      {step === 4 && <DiagnosticSummary confidence={confidence} selected={selected} emotions={emotions} />}
    </div>
  );
}