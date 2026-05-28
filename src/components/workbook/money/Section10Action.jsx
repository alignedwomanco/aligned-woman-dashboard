import React, { useState, useEffect } from "react";

/*
  MONEY WORKBOOK - Section 10: My Financial Confidence Action Plan
  
  DATA CONTRACT (field_ids via onAnswerChange):
    s10_reflections       - object { partKey: string }
    s10_new_script        - string
    s10_actions_30d       - array of { action, by, need }
    s10_actions_6m        - array of { action, by, need }
    s10_actions_12m       - array of { action, by, need }
    s10_letter            - string
    s10_confidence_after  - number (1-10)
    s10_commitments       - array of strings
*/

function FadeIn({ children, delay = 0 }) {
  const [v, setV] = useState(false);
  useEffect(() => { const t = setTimeout(() => setV(true), delay); return () => clearTimeout(t); }, [delay]);
  return <div style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(12px)", transition: "all 0.5s cubic-bezier(0.22,1,0.36,1)" }}>{children}</div>;
}

function StepIndicator({ steps, current, onStepClick }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, padding: "0 4px", marginBottom: 28 }}>
      {steps.map((s, i) => {
        const done = i < current; const active = i === current; const clickable = done && onStepClick;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
            <div onClick={() => clickable && onStepClick(i)} style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: done ? "var(--aw-burg-core)" : active ? "white" : "transparent", border: `2px solid ${done || active ? "var(--aw-burg-core)" : "var(--aw-border, #E8DDD6)"}`, color: done ? "white" : active ? "var(--aw-burg-core)" : "var(--aw-soft-grey, #A89B94)", fontSize: 13, fontWeight: 600, flexShrink: 0, cursor: clickable ? "pointer" : "default", fontFamily: "var(--aw-font-sans)" }}>{done ? "\u2713" : i + 1}</div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: done ? "var(--aw-burg-core)" : "var(--aw-border, #E8DDD6)", margin: "0 6px", minWidth: 16 }} />}
          </div>
        );
      })}
    </div>
  );
}

function NavBtn({ onClick, label, onBack }) {
  return (
    <FadeIn delay={200}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 28 }}>
        {onBack && <button onClick={onBack} style={{ padding: "12px 24px", background: "white", color: "var(--aw-burg-core)", border: "1.5px solid var(--aw-burg-core)", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "var(--aw-font-sans)" }}>&#8592; Back</button>}
        {onClick && <button onClick={onClick} style={{ padding: "12px 32px", background: "var(--aw-burg-core)", color: "white", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--aw-font-sans)" }}>{label || "Continue"} <span style={{ fontSize: 18 }}>&#8594;</span></button>}
      </div>
    </FadeIn>
  );
}

// ─── STEP 1: THE JOURNEY REFLECTION ───

const JOURNEY_PROMPTS = [
  { part: "Part 1", title: "My relationship with money today", icon: "📍", question: "What was the single biggest thing you recognised about your current financial state?", placeholder: "One sentence. The most important insight." },
  { part: "Part 2", title: "The blueprint I was given", icon: "🏠", question: "What did you inherit from your childhood that still shapes your money decisions?", placeholder: "The pattern, the atmosphere, the message that stuck." },
  { part: "Part 3", title: "My money scripts", icon: "📝", question: "What is your old money script, in one line?", placeholder: "The story that has been running in the background." },
  { part: "Part 4", title: "Emotional triggers", icon: "⚡", question: "What is your most powerful financial trigger?", placeholder: "The situation that overrides your rational thinking." },
  { part: "Part 5", title: "Wealth vs visible spending", icon: "👁️", question: "What did you learn about the gap between how wealthy you look and how wealthy you are?", placeholder: "The honest truth you saw in the numbers." },
  { part: "Part 6", title: "The gap", icon: "📊", question: "What is your freedom number, and how did it make you feel?", placeholder: "The gap between earning and spending." },
  { part: "Part 7", title: "Saving with intention", icon: "🎯", question: "What is the one savings goal that matters most to you right now?", placeholder: "The goal that will change your life." },
  { part: "Part 8", title: "My risk profile", icon: "📈", question: "What did you learn about how fear vs capacity shape your investment decisions?", placeholder: "Are you investing based on wisdom or inherited anxiety?" },
  { part: "Part 9", title: "The value of advice", icon: "🤝", question: "What is the one barrier you need to overcome to get professional support?", placeholder: "The thing between you and the help you need." },
];

function Step1({ reflections, setReflection, newScript, setNewScript, onNext }) {
  const filled = Object.values(reflections).filter((v) => v && v.trim()).length;

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)" }}>
        The journey so far
      </h3>
      <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>
        You have worked through nine sections of honest self-examination. Before building your action plan, distill each section into its single most important insight. One sentence per part. No paragraphs. Just the core truth.
      </p>
      <div style={{
        margin: "0 0 24px", padding: "12px 16px", borderRadius: 8, background: "var(--aw-rose-pale)",
        fontSize: 13, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontFamily: "var(--aw-font-sans)",
      }}>
        <strong style={{ color: "var(--aw-burg-core)" }}>If you completed each section:</strong> go back and review your summaries, then capture the headline here. If you skipped sections, answer from what you know about yourself.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {JOURNEY_PROMPTS.map((p) => {
          const val = reflections[p.part] || "";
          const isFilled = val.trim().length > 0;
          return (
            <div key={p.part} style={{
              borderRadius: 10, border: `1.5px solid ${isFilled ? "var(--aw-green, #3D7A5F)" : "var(--aw-border, #E8DDD6)"}`,
              background: "white", padding: "14px 16px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 18 }}>{p.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--aw-burg-core)" }}>{p.part}</span>
                <span style={{ fontSize: 13, color: "var(--aw-dark-grey)" }}>{p.title}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--aw-dark-grey)", marginBottom: 8 }}>{p.question}</div>
              <input type="text" value={val} onChange={(e) => setReflection(p.part, e.target.value)}
                placeholder={p.placeholder}
                style={{
                  width: "100%", padding: "8px 12px", border: `1px solid ${"var(--aw-border, #E8DDD6)"}`, borderRadius: 6,
                  fontSize: 14, color: "var(--aw-dark-grey)", boxSizing: "border-box",
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--aw-burg-core)"}
                onBlur={(e) => e.target.style.borderColor = "var(--aw-border, #E8DDD6)"}
              />
            </div>
          );
        })}
      </div>

      {/* New script */}
      {filled >= 5 && (
        <FadeIn>
          <div style={{
            marginTop: 24, padding: "20px", borderRadius: 12,
            background: "#E8F3ED", border: `1.5px solid ${"var(--aw-green, #3D7A5F)"}`,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-green, #3D7A5F)", marginBottom: 8 }}>
              Your rewritten money script
            </div>
            <p style={{ margin: "0 0 10px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontFamily: "var(--aw-font-sans)" }}>
              In Part 3, you wrote a new script. After completing the full workbook, refine it here. This is the story you are choosing to live by going forward.
            </p>
            <textarea value={newScript} onChange={(e) => setNewScript(e.target.value)}
              rows={3} placeholder="e.g. I am a woman who faces her finances with honesty, makes decisions from intention rather than fear, and builds wealth quietly and consistently."
              style={{
                width: "100%", padding: "12px 14px", border: `1.5px solid ${"var(--aw-green, #3D7A5F)"}`, borderRadius: 8,
                fontSize: 16, color: "var(--aw-dark-grey)", lineHeight: 1.6, resize: "vertical", boxSizing: "border-box",
                fontWeight: 500,
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--aw-green, #3D7A5F)"}
              onBlur={(e) => e.target.style.borderColor = "var(--aw-green, #3D7A5F)"}
            />
          </div>
        </FadeIn>
      )}

      <div style={{ marginTop: 12, fontSize: 13, color: "var(--aw-soft-grey, #A89B94)" }}>{filled} of {JOURNEY_PROMPTS.length} insights captured</div>
      {filled >= 5 && <NavBtn onNext={onNext} />}
    </div>
  );
}

// ─── STEP 2: ACTION PLAN ───

function Step2({ actions30, setAction30, actions6m, setAction6m, actions12m, setAction12m, onNext, onBack }) {
  const addRow = (setter, current) => setter([...current, { action: "", by: "", need: "" }]);
  const updateRow = (setter, current, idx, field, val) => {
    const updated = [...current];
    updated[idx] = { ...updated[idx], [field]: val };
    setter(updated);
  };
  const removeRow = (setter, current, idx) => setter(current.filter((_, i) => i !== idx));

  const filled30 = actions30.filter((a) => a.action.trim()).length;
  const filled6m = actions6m.filter((a) => a.action.trim()).length;
  const filled12m = actions12m.filter((a) => a.action.trim()).length;

  const renderActionGroup = (title, timeframe, colour, description, actions, setter) => (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: colour }} />
        <div style={{ fontSize: 16, fontWeight: 600, color: "var(--aw-dark-grey)" }}>{title}</div>
      </div>
      <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--aw-dark-grey)", fontStyle: "italic", paddingLeft: 20 }}>{description}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 20 }}>
        {actions.map((a, i) => (
          <div key={i} style={{ padding: "12px 16px", borderRadius: 10, background: "white", border: `1px solid ${a.action.trim() ? colour : "var(--aw-border, #E8DDD6)"}` }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input type="text" value={a.action} onChange={(e) => updateRow(setter, actions, i, "action", e.target.value)}
                placeholder="What will you do?"
                style={{ flex: 1, padding: "8px 12px", border: `1px solid ${"var(--aw-border, #E8DDD6)"}`, borderRadius: 6, fontSize: 14, color: "var(--aw-dark-grey)", boxSizing: "border-box" }}
                onFocus={(e) => e.target.style.borderColor = colour}
                onBlur={(e) => e.target.style.borderColor = "var(--aw-border, #E8DDD6)"}
              />
              {actions.length > 1 && (
                <button onClick={() => removeRow(setter, actions, i)} style={{ padding: "6px 10px", background: "none", border: `1px solid ${"var(--aw-border, #E8DDD6)"}`, borderRadius: 6, color: "var(--aw-soft-grey, #A89B94)", cursor: "pointer", fontSize: 14 }}>x</button>
              )}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "var(--aw-soft-grey, #A89B94)", marginBottom: 3 }}>By when</div>
                <input type="text" value={a.by} onChange={(e) => updateRow(setter, actions, i, "by", e.target.value)}
                  placeholder={timeframe}
                  style={{ width: "100%", padding: "6px 10px", border: `1px solid ${"var(--aw-border, #E8DDD6)"}`, borderRadius: 6, fontSize: 13, color: "var(--aw-dark-grey)", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "var(--aw-soft-grey, #A89B94)", marginBottom: 3 }}>What I need</div>
                <input type="text" value={a.need} onChange={(e) => updateRow(setter, actions, i, "need", e.target.value)}
                  placeholder="e.g. information, courage, a phone call"
                  style={{ width: "100%", padding: "6px 10px", border: `1px solid ${"var(--aw-border, #E8DDD6)"}`, borderRadius: 6, fontSize: 13, color: "var(--aw-dark-grey)", boxSizing: "border-box" }}
                />
              </div>
            </div>
          </div>
        ))}
        <button onClick={() => addRow(setter, actions)} style={{
          padding: "10px", border: `1.5px dashed ${"var(--aw-border, #E8DDD6)"}`, borderRadius: 8,
          background: "transparent", color: "var(--aw-dark-grey)", cursor: "pointer", fontSize: 13,
        }}>+ Add another action</button>
      </div>
    </div>
  );

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)" }}>
        Your action plan
      </h3>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>
        Dr. Nasrat teaches: design a plan that puts your strategy, your values, and your confidence at the centre. Not somebody else's plan. Yours. Make each action specific enough that you will know whether you did it.
      </p>

      {renderActionGroup(
        "Next 30 days", "e.g. by June 15", "var(--aw-red, #A23B3B)",
        "These are the immediate moves. Small, concrete, achievable. What will you do in the next month?",
        actions30, setAction30
      )}
      {renderActionGroup(
        "Next 6 months", "e.g. by December", "var(--aw-amber, #B8860B)",
        "These are the building blocks. Goals that require sustained effort and possibly external help.",
        actions6m, setAction6m
      )}
      {renderActionGroup(
        "Next 12 months", "e.g. by next year", "var(--aw-green, #3D7A5F)",
        "These are the transformation goals. Where do you want to be one year from now?",
        actions12m, setAction12m
      )}

      {(filled30 >= 1 || filled6m >= 1 || filled12m >= 1) && (
        <FadeIn>
          <div style={{ padding: "14px 18px", borderRadius: 10, background: "white", border: `1px solid ${"var(--aw-border, #E8DDD6)"}` }}>
            <span style={{ fontSize: 13, color: "var(--aw-dark-grey)" }}>
              {filled30 + filled6m + filled12m} action{filled30 + filled6m + filled12m !== 1 ? "s" : ""} planned:
              <span style={{ color: "var(--aw-red, #A23B3B)", fontWeight: 600 }}> {filled30} immediate</span>,
              <span style={{ color: "var(--aw-amber, #B8860B)", fontWeight: 600 }}> {filled6m} medium-term</span>,
              <span style={{ color: "var(--aw-green, #3D7A5F)", fontWeight: 600 }}> {filled12m} long-term</span>
            </span>
          </div>
        </FadeIn>
      )}

      {filled30 >= 1 && <NavBtn onNext={onNext} onBack={onBack} />}
    </div>
  );
}

// ─── STEP 3: LETTER TO FUTURE SELF + CONFIDENCE ───

function Step3({ letter, setLetter, confidenceBefore, confidenceAfter, setConfidenceAfter, commitments, toggleCommitment, onNext, onBack }) {
  const COMMIT_OPTIONS = [
    "Reviewing my income and expenses monthly",
    "Saving a fixed amount every month, no matter how small",
    "Pausing before making financial decisions when emotional",
    "Seeking professional financial advice within 90 days",
    "Having an honest conversation about money with my partner or family",
    "Revisiting this workbook in 3 months to measure my progress",
    "Reading my new money script once a week",
    "Not comparing my financial journey to anyone else's",
  ];

  const CONFIDENCE_LABELS = {
    1: "In crisis", 2: "Deeply anxious", 3: "Struggling", 4: "Uncertain",
    5: "Neutral", 6: "Cautiously okay", 7: "Mostly confident",
    8: "Confident", 9: "Very confident", 10: "Fully at peace",
  };

  const shift = confidenceAfter - confidenceBefore;

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)" }}>
        A letter to the woman you are becoming
      </h3>
      <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>
        Dr. Nasrat closed her masterclass with this: financial planning transforms every stage of life, lighting the path and empowering us with confidence, resilience, and a sense of possibility. Write to the woman you will be 12 months from now. Speak to her with kindness.
      </p>
      <div style={{
        margin: "0 0 20px", padding: "12px 16px", borderRadius: 8, background: "var(--aw-rose-pale)",
        fontSize: 13, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontFamily: "var(--aw-font-sans)",
      }}>
        <strong style={{ color: "var(--aw-burg-core)" }}>Prompts to guide you:</strong> What have you changed? What did you let go of? What do you feel about money now that you did not feel before? What are you proud of? What do you want to remind your future self when the old patterns try to return?
      </div>

      <textarea value={letter} onChange={(e) => setLetter(e.target.value)}
        rows={8} placeholder="Dear future me..."
        style={{
          width: "100%", padding: "16px 18px", border: `1.5px solid ${"var(--aw-rose-core)"}`, borderRadius: 12,
          fontSize: 16, color: "var(--aw-dark-grey)", lineHeight: 1.7, resize: "vertical", boxSizing: "border-box",
          background: "white",
        }}
        onFocus={(e) => e.target.style.borderColor = "var(--aw-burg-core)"}
        onBlur={(e) => e.target.style.borderColor = "var(--aw-rose-core)"}
      />
      <div style={{ textAlign: "right", fontSize: 12, color: "var(--aw-soft-grey, #A89B94)", marginTop: 4 }}>
        {letter.trim().split(/\s+/).filter(Boolean).length} words
      </div>

      {/* Confidence after */}
      <div style={{ marginTop: 28 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 6 }}>
          Your financial confidence now
        </div>
        <p style={{ margin: "0 0 12px", fontSize: 14, color: "var(--aw-dark-grey)", fontStyle: "italic" }}>
          In Part 1, you rated yourself {confidenceBefore}/10 ({CONFIDENCE_LABELS[confidenceBefore] || ""}). After completing this workbook, where are you now?
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
            const sel = confidenceAfter === n;
            const isBefore = n === confidenceBefore;
            return (
              <button key={n} onClick={() => setConfidenceAfter(n)}
                style={{
                  width: 44, height: 44, borderRadius: "50%",
                  border: `2px solid ${sel ? "var(--aw-burg-core)" : isBefore ? "var(--aw-rose-core)" : "var(--aw-border, #E8DDD6)"}`,
                  background: sel ? "var(--aw-burg-core)" : isBefore ? "var(--aw-rose-pale)" : "white",
                  color: sel ? "white" : isBefore ? "var(--aw-rose-core)" : "var(--aw-dark-grey)",
                  fontWeight: 600, fontSize: 16, cursor: "pointer",
                  transition: "all 0.25s",
                  transform: sel ? "scale(1.15)" : "scale(1)",
                  boxShadow: sel ? `0 4px 16px ${"var(--aw-burg-core)"}44` : "none",
                  position: "relative",
                }}>{n}
              </button>
            );
          })}
        </div>
        {confidenceBefore > 0 && (
          <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--aw-soft-grey, #A89B94)" }}>
            <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "var(--aw-rose-pale)", border: `1px solid ${"var(--aw-rose-core)"}`, verticalAlign: "middle", marginRight: 4 }} /> Part 1: {confidenceBefore}/10</span>
            {confidenceAfter > 0 && <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "var(--aw-burg-core)", verticalAlign: "middle", marginRight: 4 }} /> Now: {confidenceAfter}/10</span>}
          </div>
        )}

        {confidenceAfter > 0 && confidenceBefore > 0 && (
          <FadeIn>
            <div style={{
              marginTop: 16, padding: "16px 20px", borderRadius: 10,
              background: shift > 0 ? "#E8F3ED" : shift === 0 ? "#FDF3E0" : "var(--aw-rose-pale)",
              borderLeft: `4px solid ${shift > 0 ? "var(--aw-green, #3D7A5F)" : shift === 0 ? "var(--aw-amber, #B8860B)" : "var(--aw-rose-core)"}`,
            }}>
              {shift > 0 && (
                <p style={{ margin: 0, fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontFamily: "var(--aw-font-sans)" }}>
                  You moved from {confidenceBefore} to {confidenceAfter}. That is a <strong>+{shift} point shift</strong>. The workbook did not change your bank balance. It changed your relationship with money. That is where financial confidence begins.
                </p>
              )}
              {shift === 0 && (
                <p style={{ margin: 0, fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontFamily: "var(--aw-font-sans)" }}>
                  Your number stayed the same. That is okay. Confidence often shifts not as a feeling but as a set of new actions. The plan you built in this workbook is the vehicle. The feeling follows the doing.
                </p>
              )}
              {shift < 0 && (
                <p style={{ margin: 0, fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontFamily: "var(--aw-font-sans)" }}>
                  Your number went down. That can happen when honesty replaces denial. Seeing your situation clearly can feel worse before it feels better. The fact that you completed this workbook means you are already acting differently.
                </p>
              )}
            </div>
          </FadeIn>
        )}
      </div>

      {/* Commitments */}
      <div style={{ marginTop: 28 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 10 }}>
          I commit to the following ongoing practices:
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {COMMIT_OPTIONS.map((opt) => {
            const sel = commitments.includes(opt);
            return (
              <label key={opt} style={{
                display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer",
                padding: "8px 12px", borderRadius: 8, background: sel ? "#E8F3ED" : "transparent",
              }}>
                <input type="checkbox" checked={sel} onChange={() => toggleCommitment(opt)}
                  style={{ accentColor: "var(--aw-green, #3D7A5F)", width: 17, height: 17, marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.45 }}>{opt}</span>
              </label>
            );
          })}
        </div>
      </div>

      {confidenceAfter > 0 && commitments.length > 0 && letter.trim().length > 20 && (
        <NavBtn onNext={onNext} onBack={onBack} label="Complete workbook" />
      )}
    </div>
  );
}

// ─── STEP 4: COMPLETION ───

function Step4Final({ reflections, newScript, actions30, actions6m, actions12m, confidenceBefore, confidenceAfter, commitments, letter, onBack }) {
  const shift = confidenceAfter - confidenceBefore;
  const totalActions = [
    ...actions30.filter((a) => a.action.trim()),
    ...actions6m.filter((a) => a.action.trim()),
    ...actions12m.filter((a) => a.action.trim()),
  ];
  const insightCount = Object.values(reflections).filter((v) => v && v.trim()).length;
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const firstAction = actions30.find((a) => a.action.trim());

  return (
    <div>
      {/* ─── THE OPENING: not a summary. A moment. ─── */}
      <FadeIn>
        <div style={{ textAlign: "center", padding: "20px 0 36px" }}>
          <div style={{ fontSize: 13, color: "var(--aw-soft-grey, #A89B94)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 24 }}>You made it here</div>
          <div style={{ width: 80, height: 1, background: "var(--aw-rose-core)", margin: "0 auto 24px" }} />
          <p style={{ margin: "0 auto", maxWidth: 480, fontSize: 17, color: "var(--aw-dark-grey)", lineHeight: 1.75 }}>
            Most people never look at their money story. They live inside it without ever seeing it. You just spent ten sections tracing yours from childhood to today, naming the patterns, feeling the triggers, facing the numbers, and choosing something different.
          </p>
          <p style={{ margin: "20px auto 0", maxWidth: 480, fontSize: 17, color: "var(--aw-dark-grey)", lineHeight: 1.75 }}>
            That is not a small thing.
          </p>
        </div>
      </FadeIn>

      {/* ─── THE TRANSFORMATION: before/after as a story ─── */}
      <FadeIn delay={400}>
        <div style={{
          background: "var(--aw-burg-core)", borderRadius: 20, padding: "36px 32px", color: "white",
          marginBottom: 32, position: "relative", overflow: "hidden",
        }}>
          {/* Decorative line */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${"var(--aw-rose-core)"}, ${"var(--aw-burg-core)"}, ${"var(--aw-rose-core)"})` }} />

          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 3, fontFamily: "var(--aw-font-sans)", opacity: 0.5, marginBottom: 8 }}>Your transformation</div>
          </div>

          <div style={{ display: "flex", alignItems: "stretch", gap: 0, justifyContent: "center", flexWrap: "wrap" }}>
            {/* Before */}
            <div style={{ flex: "1 1 180px", padding: "20px", textAlign: "center", opacity: 0.6 }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "var(--aw-font-sans)", marginBottom: 12 }}>When you arrived</div>
              <div style={{
                width: 64, height: 64, borderRadius: "50%", margin: "0 auto 12px",
                border: "2px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 26, fontWeight: 700 }}>{confidenceBefore}</span>
              </div>
              <div style={{ fontSize: 13 }}>out of 10</div>
            </div>

            {/* Arrow */}
            <div style={{ display: "flex", alignItems: "center", padding: "0 8px" }}>
              <div style={{ width: 48, height: 2, background: `linear-gradient(90deg, rgba(255,255,255,0.2), rgba(255,255,255,0.8))`, position: "relative" }}>
                <div style={{ position: "absolute", right: -6, top: -4, width: 0, height: 0, borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderLeft: "8px solid rgba(255,255,255,0.8)" }} />
              </div>
            </div>

            {/* After */}
            <div style={{ flex: "1 1 180px", padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "var(--aw-font-sans)", marginBottom: 12 }}>Where you stand now</div>
              <div style={{
                width: 64, height: 64, borderRadius: "50%", margin: "0 auto 12px",
                border: "2px solid rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(255,255,255,0.1)",
              }}>
                <span style={{ fontSize: 26, fontWeight: 700 }}>{confidenceAfter}</span>
              </div>
              <div style={{ fontSize: 13 }}>out of 10</div>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 20, padding: "16px 20px", borderRadius: 10, background: "rgba(255,255,255,0.08)" }}>
            {shift > 0 && <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, opacity: 0.9 }}>A +{shift} point shift. Not because your bank balance changed. Because your relationship with money did. The numbers follow the awareness. Always.</p>}
            {shift === 0 && <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, opacity: 0.9 }}>The number held. But you are not the same person who wrote it the first time. You now see what was invisible before: the patterns, the triggers, the scripts. That seeing changes everything that comes next.</p>}
            {shift < 0 && <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, opacity: 0.9 }}>The number went down. That happens when honesty arrives. You traded the comfort of not knowing for the power of seeing clearly. That trade is worth more than any number on a scale.</p>}
          </div>
        </div>
      </FadeIn>

      {/* ─── THE SCRIPT: the centrepiece ─── */}
      {newScript && newScript.trim() && (
        <FadeIn delay={800}>
          <div style={{ margin: "0 0 32px", textAlign: "center" }}>
            <div style={{ width: 40, height: 1, background: "var(--aw-rose-core)", margin: "0 auto 20px" }} />
            <div style={{ fontSize: 11, color: "var(--aw-rose-core)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>
              The story you are choosing now
            </div>
            <div style={{
              padding: "32px 28px", borderRadius: 16, background: "white",
              border: `2px solid ${"var(--aw-burg-core)"}`, position: "relative",
            }}>
              <div style={{
                position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                background: "var(--aw-rose-pale)", padding: "0 16px",
              }}>
                <span style={{ fontSize: 28, color: "var(--aw-rose-core)" }}>"</span>
              </div>
              <p style={{ margin: 0, fontSize: 20, color: "var(--aw-burg-core)", lineHeight: 1.7, fontStyle: "italic", fontWeight: 400 }}>
                {newScript}
              </p>
            </div>
          </div>
        </FadeIn>
      )}

      {/* ─── THE FIRST STEP: not a list. A single commitment. ─── */}
      {firstAction && (
        <FadeIn delay={1200}>
          <div style={{
            padding: "24px 28px", borderRadius: 16, background: "#E8F3ED",
            border: `1.5px solid ${"var(--aw-green, #3D7A5F)"}`, marginBottom: 32, textAlign: "center",
          }}>
            <div style={{ fontSize: 11, color: "var(--aw-green, #3D7A5F)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>
              Your very first move
            </div>
            <p style={{ margin: 0, fontSize: 18, color: "var(--aw-dark-grey)", fontWeight: 600, lineHeight: 1.5 }}>
              {firstAction.action}
            </p>
            {firstAction.by && (
              <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--aw-green, #3D7A5F)" }}>By: {firstAction.by}</p>
            )}
          </div>
        </FadeIn>
      )}

      {/* ─── THE FULL PLAN: collapsible, secondary ─── */}
      <FadeIn delay={1400}>
        <details style={{ marginBottom: 28 }}>
          <summary style={{
            padding: "14px 18px", borderRadius: 10, background: "white", border: `1px solid ${"var(--aw-border, #E8DDD6)"}`,
            cursor: "pointer", fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-sans)",
            listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span>View full action plan and commitments ({totalActions.length} actions, {commitments.length} commitments)</span>
            <span style={{ color: "var(--aw-soft-grey, #A89B94)" }}>&#9662;</span>
          </summary>
          <div style={{ padding: "20px", background: "white", border: `1px solid ${"var(--aw-border, #E8DDD6)"}`, borderTop: "none", borderRadius: "0 0 10px 10px" }}>
            {[
              { title: "30 days", color: "var(--aw-red, #A23B3B)", items: actions30 },
              { title: "6 months", color: "var(--aw-amber, #B8860B)", items: actions6m },
              { title: "12 months", color: "var(--aw-green, #3D7A5F)", items: actions12m },
            ].map((group) => {
              const filled = group.items.filter((a) => a.action.trim());
              if (filled.length === 0) return null;
              return (
                <div key={group.title} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: group.color, textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--aw-font-sans)", marginBottom: 6 }}>{group.title}</div>
                  {filled.map((a, i) => (
                    <div key={i} style={{ padding: "8px 12px", marginBottom: 4, borderRadius: 6, background: `${group.color}10`, fontSize: 14, color: "var(--aw-dark-grey)" }}>
                      {a.action}{a.by ? ` (by ${a.by})` : ""}
                    </div>
                  ))}
                </div>
              );
            })}
            {commitments.length > 0 && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${"var(--aw-border, #E8DDD6)"}` }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--aw-green, #3D7A5F)", textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--aw-font-sans)", marginBottom: 8 }}>Ongoing commitments</div>
                {commitments.map((c, i) => (
                  <div key={i} style={{ padding: "4px 0", fontSize: 14, color: "var(--aw-dark-grey)" }}>
                    <span style={{ color: "var(--aw-green, #3D7A5F)", marginRight: 8 }}>&#10003;</span>{c}
                  </div>
                ))}
              </div>
            )}
          </div>
        </details>
      </FadeIn>

      {/* ─── THE CLOSING: not a quote card. A message. ─── */}
      <FadeIn delay={1600}>
        <div style={{ margin: "0 0 36px", textAlign: "center" }}>
          <div style={{ width: 40, height: 1, background: "var(--aw-rose-core)", margin: "0 auto 24px" }} />
          <p style={{ margin: "0 auto", maxWidth: 500, fontSize: 16, color: "var(--aw-dark-grey)", lineHeight: 1.75 }}>
            The blueprint you were given was not your choice.
          </p>
          <p style={{ margin: "16px auto 0", maxWidth: 500, fontSize: 16, color: "var(--aw-dark-grey)", lineHeight: 1.75 }}>
            The scripts you carried were not your fault.
          </p>
          <p style={{ margin: "16px auto 0", maxWidth: 500, fontSize: 16, color: "var(--aw-dark-grey)", lineHeight: 1.75 }}>
            The triggers that fire in your body were learned before you had words for them.
          </p>
          <p style={{ margin: "24px auto 0", maxWidth: 500, fontSize: 17, color: "var(--aw-burg-core)", lineHeight: 1.75, fontWeight: 600 }}>
            But from this moment forward, the story is yours to write.
          </p>
        </div>
      </FadeIn>

      {/* ─── DR. NASRAT'S WORDS ─── */}
      <FadeIn delay={2000}>
        <div style={{
          padding: "28px 32px", borderRadius: 16, marginBottom: 36,
          background: `linear-gradient(135deg, ${"var(--aw-burg-core)"}, ${"var(--aw-burg-core)"})`, color: "white", textAlign: "center",
          position: "relative",
        }}>
          <div style={{ position: "absolute", top: 16, left: 28, fontSize: 48, opacity: 0.15, lineHeight: 1 }}>"</div>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.75, fontStyle: "italic", fontWeight: 300, position: "relative" }}>
            Financial planning transforms every stage of life into an opportunity, lighting the path from cradle to grave and empowering us with confidence, resilience, and a sense of possibility.
          </p>
          <div style={{ width: 40, height: 1, background: "rgba(255,255,255,0.3)", margin: "20px auto" }} />
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, opacity: 0.85 }}>Dr. Nasrat Sirkissoon</p>
          <p style={{ margin: "4px 0 0", fontSize: 12, opacity: 0.5 }}>The Aligned Woman Blueprint / Phase I: Intentional Action</p>
        </div>
      </FadeIn>

      {/* ─── COMPLETION CARD ─── */}
      <FadeIn delay={2400}>
        <div style={{
          padding: "32px", borderRadius: 16, border: `2px solid ${"var(--aw-burg-core)"}`,
          background: "white", textAlign: "center", marginBottom: 28,
        }}>
          <div style={{ fontSize: 11, color: "var(--aw-soft-grey, #A89B94)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Certificate of Completion</div>
          <div style={{ width: 60, height: 1, background: "var(--aw-burg-core)", margin: "0 auto 16px" }} />
          <div style={{ fontSize: 20, fontWeight: 600, color: "var(--aw-burg-core)", marginBottom: 4 }}>Your Money Story</div>
          <div style={{ fontSize: 14, color: "var(--aw-dark-grey)", marginBottom: 4 }}>Integration Workbook</div>
          <div style={{ fontSize: 14, color: "var(--aw-dark-grey)", marginBottom: 16 }}>by Dr. Nasrat Sirkissoon</div>
          <div style={{ fontSize: 13, color: "var(--aw-soft-grey, #A89B94)" }}>{today}</div>
          <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 16, fontSize: 12, color: "var(--aw-soft-grey, #A89B94)" }}>
            <span>{insightCount} insights</span>
            <span>|</span>
            <span>{totalActions.length} actions</span>
            <span>|</span>
            <span>{commitments.length} commitments</span>
            <span>|</span>
            <span>10 sections</span>
          </div>
        </div>
      </FadeIn>

      {/* ─── ACTIONS ─── */}
      <FadeIn delay={2800}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          {onBack && <button onClick={onBack} style={{ padding: "10px 24px", background: "white", color: "var(--aw-burg-core)", border: `1.5px solid ${"var(--aw-burg-core)"}`, borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>&#8592; Back to edit</button>}
          <button style={{
            padding: "16px 48px", background: `linear-gradient(135deg, ${"var(--aw-burg-core)"}, ${"var(--aw-rose-core)"})`,
            color: "white", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 600,
            cursor: "pointer", boxShadow: `0 4px 20px ${"var(--aw-burg-core)"}33`,
          }}>
            Download my completed workbook
          </button>
          <p style={{ marginTop: 8, fontSize: 13, color: "var(--aw-soft-grey, #A89B94)", maxWidth: 400, textAlign: "center", lineHeight: 1.5 }}>
            Your workbook is saved. Return anytime to revisit your answers, update your plan, or measure how far you have come.
          </p>
        </div>
      </FadeIn>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */

export default function Section10Action({ section, answers = {}, onAnswerChange, allAnswers }) {
  const reflections      = answers.s10_reflections || {};
  const newScript        = answers.s10_new_script || "";
  const actions30        = answers.s10_actions_30d || [{ action: "", by: "", need: "" }, { action: "", by: "", need: "" }, { action: "", by: "", need: "" }];
  const actions6m        = answers.s10_actions_6m || [{ action: "", by: "", need: "" }, { action: "", by: "", need: "" }, { action: "", by: "", need: "" }];
  const actions12m       = answers.s10_actions_12m || [{ action: "", by: "", need: "" }, { action: "", by: "", need: "" }];
  const letter           = answers.s10_letter || "";
  const confidenceBefore = allAnswers?.s01_confidence || 0;
  const confidenceAfter  = answers.s10_confidence_after || 0;
  const commitments      = answers.s10_commitments || [];

  const [step, setStep] = useState(0);

  const save = (fieldId, value) => { if (onAnswerChange) onAnswerChange(fieldId, value); };

  const setReflection = (key, val) => save("s10_reflections", { ...reflections, [key]: val });
  const setAction30 = (idx, field, val) => {
    const updated = [...actions30];
    updated[idx] = { ...updated[idx], [field]: val };
    save("s10_actions_30d", updated);
  };
  const setAction6m = (idx, field, val) => {
    const updated = [...actions6m];
    updated[idx] = { ...updated[idx], [field]: val };
    save("s10_actions_6m", updated);
  };
  const setAction12m = (idx, field, val) => {
    const updated = [...actions12m];
    updated[idx] = { ...updated[idx], [field]: val };
    save("s10_actions_12m", updated);
  };
  const toggleCommitment = (opt) => {
    const next = commitments.includes(opt) ? commitments.filter(x => x !== opt) : [...commitments, opt];
    save("s10_commitments", next);
  };

  const goNext = () => setStep(s => s + 1);
  const goBack = () => setStep(s => Math.max(0, s - 1));
  const goToStep = (s) => setStep(s);

  const STEPS = ["Journey review", "Action plan", "Letter + confidence", "Complete"];

  return (
    <div>
      {/* Section header */}
      <div style={{ marginBottom: 36 }}>
        {section?.part_label && <p style={{ fontFamily: "var(--aw-font-sans)", fontWeight: 700, fontSize: 10, lineHeight: 1.4, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--aw-rose-core)", margin: "0 0 8px" }}>{section.part_label}</p>}
        {section?.heading && <h1 style={{ fontFamily: "var(--aw-font-display)", fontWeight: 400, fontSize: "clamp(34px, 4.6vw, 52px)", lineHeight: 1.05, letterSpacing: "-0.015em", color: "var(--aw-burg-core)", margin: 0 }}>{section.heading}</h1>}
        {section?.intro && <p style={{ fontFamily: "var(--aw-font-sans)", fontWeight: 300, fontSize: 16, lineHeight: 1.85, color: "var(--aw-dark-grey)", margin: "18px 0 0" }}>{section.intro}</p>}
      </div>

      <StepIndicator steps={STEPS} current={step} onStepClick={goToStep} />

      {step === 0 && <Step1 reflections={reflections} setReflection={setReflection} newScript={newScript} setNewScript={(v) => save("s10_new_script", v)} onNext={goNext} />}
      {step === 1 && <Step2 actions30={actions30} setAction30={setAction30} actions6m={actions6m} setAction6m={setAction6m} actions12m={actions12m} setAction12m={setAction12m} onNext={goNext} onBack={goBack} />}
      {step === 2 && <Step3 letter={letter} setLetter={(v) => save("s10_letter", v)} confidenceBefore={confidenceBefore} confidenceAfter={confidenceAfter} setConfidenceAfter={(v) => save("s10_confidence_after", v)} commitments={commitments} toggleCommitment={toggleCommitment} onNext={goNext} onBack={goBack} />}
      {step === 3 && <Step4Final reflections={reflections} newScript={newScript} actions30={actions30} actions6m={actions6m} actions12m={actions12m} letter={letter} confidenceBefore={confidenceBefore} confidenceAfter={confidenceAfter} commitments={commitments} onBack={goBack} />}
    </div>
  );
}