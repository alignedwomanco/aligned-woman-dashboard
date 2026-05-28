import React, { useState, useEffect } from "react";

/*
  MONEY WORKBOOK - Section 4: Emotional Triggers and Financial Decisions
  
  DATA CONTRACT (field_ids via onAnswerChange):
    s04_intensities   - object { triggerId: intensityLevel (0-3) }
    s04_chains        - object { triggerId: { emotion, thought, action, consequence } }
    s04_body_signals  - array of signal strings
    s04_patterns      - object { patternId: { recognised, reflection, frequency } }
    s04_regret        - object { what, when, feeling_before, trigger, script, consequence, different }
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

/* -- DATA -- */

) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, padding: "0 4px" }}>
      {steps.map((s, i) => {
        const done = i < current; const active = i === current;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              background: done ? "var(--aw-burg-core)" : active ? "white" : "transparent",
              border: `2px solid ${done || active ? "var(--aw-burg-core)" : "var(--aw-border, #E8DDD6)"}`,
              color: done ? "white" : active ? "var(--aw-burg-core)" : "var(--aw-soft-grey, #A89B94)", fontSize: 13, fontWeight: 600, flexShrink: 0,
            }}>{done ? "✓" : i + 1}</div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: done ? "var(--aw-burg-core)" : "var(--aw-border, #E8DDD6)", margin: "0 6px", minWidth: 16 }} />}
          </div>
        );
      })}
    </div>
  );
}

) {
  return (
    <FadeIn delay={200}>
      <button onClick={onClick} style={{
        marginTop: 28, padding: "12px 32px", background: "var(--aw-burg-core)", color: "white", border: "none",
        borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
      }}>{label || "Continue"} <span style={{ fontSize: 18 }}>&#8594;</span></button>
    </FadeIn>
  );
}

// ─── DATA ───

const TRIGGER_SITUATIONS = [
  { id: "t1", situation: "Someone says 'we cannot afford that'", category: "Language", childhood_echo: "This phrase is one of the most common childhood money messages. Dr. Nasrat warns it can become a trigger for conflict in adult relationships, whether with a partner, a child, or even yourself." },
  { id: "t2", situation: "An unexpected bill or expense arrives", category: "Surprise", childhood_echo: "If your childhood home lacked a safety net, unexpected costs were crises. Your nervous system may still respond to any unplanned expense as a threat, regardless of your current financial position." },
  { id: "t3", situation: "End of the month and money is running low", category: "Scarcity", childhood_echo: "If you watched parents stress at month-end, your body learned to brace itself at the same point in the calendar. This pattern can persist even when you earn well." },
  { id: "t4", situation: "A friend or colleague shows off a purchase", category: "Comparison", childhood_echo: "Comparison triggers can trace back to childhood envy: the classmate who had what you could not, the family that seemed to have more. Social media amplifies this trigger enormously." },
  { id: "t5", situation: "Being asked to discuss finances with a partner", category: "Intimacy", childhood_echo: "If money conversations in your childhood home led to conflict, silence, or shame, your body may treat 'let us talk about money' as a threat signal, even when your partner's intent is collaborative." },
  { id: "t6", situation: "Seeing your bank balance after a spending period", category: "Reality check", childhood_echo: "The moment of looking is where avoidance meets reality. If you grew up in a home where the truth about money was hidden or painful, the act of checking your balance can feel like opening a door you were taught to keep closed." },
  { id: "t7", situation: "Being asked for money by family or friends", category: "Obligation", childhood_echo: "In extended family systems, financial obligation runs deep. Dr. Nasrat described households where whatever was purchased was shared equally. The expectation to give can feel inescapable, even when giving hurts you." },
  { id: "t8", situation: "A pay day or financial windfall", category: "Abundance", childhood_echo: "Not all triggers are negative. If scarcity defined your childhood, receiving money can trigger a rush to spend (before it disappears) or a compulsion to hoard (because it might not come again)." },
  { id: "t9", situation: "Your child asks for something you cannot easily afford", category: "Parenting", childhood_echo: "This is where your childhood and your child's childhood collide. If you were told 'no' as a child and it wounded you, saying 'no' to your own child can feel like you are recreating your own pain." },
  { id: "t10", situation: "Making a large purchase decision", category: "Commitment", childhood_echo: "Large purchases test your core money beliefs. If your blueprint says money is scarce, every big decision feels like a gamble. If it says money should flow, you may commit too quickly without planning." },
];

const INTENSITY_LEVELS = [
  { value: 0, label: "No reaction", color: "var(--aw-soft-grey, #A89B94)", bg: "white" },
  { value: 1, label: "Mild discomfort", color: "var(--aw-amber, #B8860B)", bg: "#FDF3E0" },
  { value: 2, label: "Strong emotional response", color: "var(--aw-rose-core)", bg: "var(--aw-rose-pale)" },
  { value: 3, label: "Fight, flight, or freeze", color: "var(--aw-red, #A23B3B)", bg: "#FDEAEA" },
];

const BODY_SIGNALS = [
  "Chest tightens", "Stomach drops", "Jaw clenches", "Shoulders rise",
  "Hands sweat", "Face flushes", "Heart races", "Breathing goes shallow",
  "Throat closes", "Legs feel heavy", "Sudden fatigue", "Restlessness",
];

const SPENDING_PATTERNS = [
  {
    id: "retail_therapy",
    label: "Retail therapy",
    desc: "Spending to manage stress, sadness, or boredom",
    question: "When did you last buy something not because you needed it, but because you needed to feel something different?",
    rootCause: "Retail therapy is a regulation strategy. You are not chasing the item. You are chasing the neurochemical hit of acquisition: the brief relief from whatever you were actually feeling.",
  },
  {
    id: "guilt_spending",
    label: "Guilt spending",
    desc: "Spending on others to feel worthy or to apologise",
    question: "Do you find yourself buying gifts, meals, or paying for things to earn love, approval, or forgiveness?",
    rootCause: "Guilt spending often connects to a belief that you are not enough without the transaction. If love in your childhood was conditional or tied to material gestures, spending can feel like the only reliable way to maintain connection.",
  },
  {
    id: "revenge_spending",
    label: "Revenge spending",
    desc: "Spending to compensate for past deprivation",
    question: "Have you ever thought 'I deserve this because I went without for so long'?",
    rootCause: "Dr. Nasrat described this pattern directly: 'Because I did not have, there is no way that I am not going to indulge for myself.' The child who went without is now spending through the adult's wallet.",
  },
  {
    id: "status_spending",
    label: "Status spending",
    desc: "Spending to signal success or belonging",
    question: "How much of what you own was bought partly to be seen by others?",
    rootCause: "Dr. Nasrat taught that visible spending is not equal to wealth. Luxury cars and designer items signal consumption, not financial strength. If status spending is your pattern, the question is: whose approval are you still trying to earn?",
  },
  {
    id: "comfort_spending",
    label: "Comfort spending",
    desc: "Spending to avoid difficult emotions",
    question: "When something painful happens, is your first instinct to open a shopping app or visit a store?",
    rootCause: "Comfort spending is avoidance with a credit card. The difficult emotion remains unprocessed. The item provides temporary relief. Then the cycle repeats, often compounded by guilt about the spending itself.",
  },
  {
    id: "scarcity_hoarding",
    label: "Scarcity hoarding",
    desc: "Accumulating money or items from fear of running out",
    question: "Do you stockpile, over-buy, or refuse to use things 'just in case'? Does spending physically hurt even when you can afford it?",
    rootCause: "Hoarding is the flip side of spending. Both are driven by fear. You are not saving strategically. You are saving to soothe a nervous system that still believes scarcity is one bad day away.",
  },
];

// ─── STEP 1: TRIGGER INTENSITY MAPPING ───

function Step1({ intensities, setIntensity, onNext }) {
  const rated = Object.keys(intensities).length;
  const highTriggers = Object.entries(intensities).filter(([_, v]) => v >= 2);
  const activeTrigger = Object.entries(intensities).find(([_, v]) => v >= 2);

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)" }}>
        Mapping your financial triggers
      </h3>
      <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>
        A trigger is any situation that activates an emotional response strong enough to override your rational thinking. Dr. Nasrat teaches that these triggers almost always have roots in childhood. They are not character flaws. They are learned responses.
      </p>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontFamily: "var(--aw-font-sans)" }}>
        Rate your emotional intensity for each situation below. Be honest about what your body actually does, not what you think the right answer should be.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {TRIGGER_SITUATIONS.map((t) => {
          const val = intensities[t.id];
          const isHigh = val >= 2;
          const levelInfo = val !== undefined ? INTENSITY_LEVELS[val] : null;
          return (
            <div key={t.id} style={{
              borderRadius: 12, border: `1.5px solid ${isHigh ? "var(--aw-rose-core)" : val !== undefined ? "var(--aw-border, #E8DDD6)" : "var(--aw-border, #E8DDD6)"}`,
              background: isHigh ? "#FFFBF9" : "white", overflow: "hidden",
            }}>
              <div style={{ padding: "14px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "var(--aw-dark-grey)" }}>{t.situation}</span>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: `${"var(--aw-soft-grey, #A89B94)"}22`, color: "var(--aw-soft-grey, #A89B94)", fontWeight: 600, whiteSpace: "nowrap" }}>{t.category}</span>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                  {INTENSITY_LEVELS.map((lvl) => {
                    const sel = val === lvl.value;
                    return (
                      <button key={lvl.value} onClick={() => setIntensity(t.id, lvl.value)}
                        style={{
                          padding: "7px 14px", borderRadius: 20, fontSize: 13, fontWeight: sel ? 600 : 400,
                          border: `1.5px solid ${sel ? lvl.color : "var(--aw-border, #E8DDD6)"}`,
                          background: sel ? lvl.bg : "white", color: sel ? lvl.color : "var(--aw-dark-grey)",
                          cursor: "pointer", transition: "all 0.2s",
                        }}>{lvl.label}</button>
                    );
                  })}
                </div>
              </div>

              {isHigh && (
                <FadeIn>
                  <div style={{
                    padding: "12px 18px", borderTop: `1px solid ${"var(--aw-border, #E8DDD6)"}`, background: "var(--aw-rose-pale)",
                    fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontStyle: "italic", fontFamily: "var(--aw-font-sans)",
                  }}>
                    <span style={{ fontWeight: 600, color: "var(--aw-burg-core)", fontStyle: "normal" }}>Childhood echo: </span>
                    {t.childhood_echo}
                  </div>
                </FadeIn>
              )}
            </div>
          );
        })}
      </div>

      {/* Trigger heat summary */}
      {rated >= 5 && (
        <FadeIn>
          <div style={{ marginTop: 24, padding: "16px 20px", borderRadius: 10, background: "white", border: `1px solid ${"var(--aw-border, #E8DDD6)"}` }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 8 }}>Your trigger profile</div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {INTENSITY_LEVELS.slice(1).map((lvl) => {
                const count = Object.values(intensities).filter((v) => v === lvl.value).length;
                if (count === 0) return null;
                return (
                  <div key={lvl.value} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: lvl.color }} />
                    <span style={{ fontSize: 13, color: lvl.color, fontWeight: 600 }}>{count} {lvl.label.toLowerCase()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>
      )}

      {rated >= 6 && <NavBtn onClick={onNext} />}
    </div>
  );
}

// ─── STEP 2: THE TRIGGER CHAIN ───

function Step2({ intensities, chains, setChain, bodySignals, toggleBodySignal, onNext }) {
  const highTriggers = TRIGGER_SITUATIONS.filter((t) => (intensities[t.id] || 0) >= 2);

  if (highTriggers.length === 0) {
    return (
      <div>
        <h3 style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)" }}>No high-intensity triggers detected</h3>
        <p style={{ fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontFamily: "var(--aw-font-sans)" }}>
          Your trigger ratings were all mild or neutral. This could mean you have strong emotional regulation, or it could mean you have learned to minimise your responses. Either way, you can continue to the next step.
        </p>
        <NavBtn onClick={onNext} />
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)" }}>
        Tracing the trigger chain
      </h3>
      <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>
        For your highest-intensity triggers, let us trace what actually happens inside you. Every financial reaction follows a chain: the situation activates a body response, which creates an emotion, which generates a thought, which drives an action.
      </p>
      <p style={{ margin: "0 0 16px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontFamily: "var(--aw-font-sans)" }}>
        Understanding the chain is how you interrupt it. You cannot stop the trigger. You can change what happens after it fires.
      </p>

      {/* Body signals selector (shared across triggers) */}
      <div style={{
        padding: "16px 18px", borderRadius: 12, background: "white", border: `1px solid ${"var(--aw-border, #E8DDD6)"}`, marginBottom: 24,
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 6 }}>
          Where do you feel financial stress in your body?
        </div>
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--aw-dark-grey)", fontStyle: "italic" }}>
          Select all that apply. Your body responds to money triggers before your mind does.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {BODY_SIGNALS.map((sig) => {
            const sel = bodySignals.includes(sig);
            return (
              <button key={sig} onClick={() => toggleBodySignal(sig)}
                style={{
                  padding: "7px 14px", borderRadius: 20, fontSize: 13,
                  border: `1.5px solid ${sel ? "var(--aw-rose-core)" : "var(--aw-border, #E8DDD6)"}`,
                  background: sel ? "var(--aw-rose-pale)" : "white", color: sel ? "var(--aw-burg-core)" : "var(--aw-dark-grey)",
                  fontWeight: sel ? 600 : 400, cursor: "pointer", transition: "all 0.2s",
                }}>{sig}</button>
            );
          })}
        </div>
      </div>

      {/* Chain builder per high trigger */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {highTriggers.slice(0, 3).map((t, idx) => {
          const chain = chains[t.id] || {};
          const intensity = intensities[t.id];
          const lvl = INTENSITY_LEVELS[intensity];
          return (
            <div key={t.id} style={{
              borderRadius: 12, border: `1.5px solid ${"var(--aw-rose-core)"}`, background: "white", overflow: "hidden",
            }}>
              <div style={{
                padding: "14px 18px", background: lvl.bg, borderBottom: `1px solid ${"var(--aw-border, #E8DDD6)"}`,
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%", background: lvl.color, color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0,
                }}>{idx + 1}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--aw-dark-grey)" }}>{t.situation}</div>
                  <div style={{ fontSize: 12, color: lvl.color, fontWeight: 600 }}>{lvl.label}</div>
                </div>
              </div>

              <div style={{ padding: "18px" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--aw-soft-grey, #A89B94)", textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--aw-font-sans)", marginBottom: 16 }}>
                  Trace the chain
                </div>

                {[
                  { key: "emotion", label: "The emotion that fires", placeholder: "e.g. panic, shame, anger, helplessness, resentment" },
                  { key: "thought", label: "The thought that follows", placeholder: "e.g. 'I will never have enough', 'They will judge me', 'I am failing'" },
                  { key: "action", label: "What I typically do next", placeholder: "e.g. shut down, spend impulsively, avoid, lash out, go silent" },
                  { key: "consequence", label: "Where that action leads", placeholder: "e.g. guilt, more debt, conflict, missed opportunity, isolation" },
                ].map((field) => (
                  <div key={field.key} style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-sans)", display: "block", marginBottom: 4 }}>
                      {field.label}
                    </label>
                    <input type="text"
                      value={chain[field.key] || ""}
                      onChange={(e) => setChain(t.id, field.key, e.target.value)}
                      placeholder={field.placeholder}
                      style={{
                        width: "100%", padding: "10px 14px", border: `1.5px solid ${"var(--aw-border, #E8DDD6)"}`, borderRadius: 8,
                        fontSize: 14, color: "var(--aw-dark-grey)", boxSizing: "border-box",
                      }}
                      onFocus={(e) => e.target.style.borderColor = "var(--aw-burg-core)"}
                      onBlur={(e) => e.target.style.borderColor = "var(--aw-border, #E8DDD6)"}
                    />
                  </div>
                ))}

                {/* Visual chain */}
                {chain.emotion && chain.thought && chain.action && chain.consequence && (
                  <FadeIn>
                    <div style={{
                      marginTop: 8, padding: "14px", borderRadius: 8, background: "var(--aw-rose-pale)",
                      display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, fontSize: 13, color: "var(--aw-burg-core)",
                    }}>
                      <span style={{ fontWeight: 600 }}>Trigger</span> &#8594;
                      <span>{chain.emotion}</span> &#8594;
                      <span>"{chain.thought}"</span> &#8594;
                      <span>{chain.action}</span> &#8594;
                      <span style={{ color: "var(--aw-red, #A23B3B)", fontWeight: 600 }}>{chain.consequence}</span>
                    </div>
                  </FadeIn>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <NavBtn onClick={onNext} />
    </div>
  );
}

// ─── STEP 3: SPENDING PATTERNS ───

function Step3({ patterns, setPattern, onNext }) {
  const identifiedCount = Object.values(patterns).filter((v) => v.recognised).length;

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)" }}>
        Your emotional spending patterns
      </h3>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>
        Emotional spending is when the decision to buy is driven by a feeling rather than a need or a plan. Everyone does it occasionally. The question is whether it has become a pattern, and what feeling it is trying to manage.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {SPENDING_PATTERNS.map((sp) => {
          const data = patterns[sp.id] || {};
          const recognised = data.recognised;
          return (
            <div key={sp.id} style={{
              borderRadius: 12, border: `1.5px solid ${recognised ? "var(--aw-rose-core)" : "var(--aw-border, #E8DDD6)"}`,
              background: "white", overflow: "hidden",
            }}>
              <div style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <button onClick={() => setPattern(sp.id, "recognised", !recognised)}
                    style={{
                      width: 22, height: 22, borderRadius: 4, flexShrink: 0, marginTop: 2, cursor: "pointer",
                      border: `2px solid ${recognised ? "var(--aw-rose-core)" : "var(--aw-border, #E8DDD6)"}`,
                      background: recognised ? "var(--aw-rose-core)" : "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                    {recognised && <span style={{ color: "white", fontSize: 14, fontWeight: 700 }}>✓</span>}
                  </button>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "var(--aw-dark-grey)" }}>{sp.label}</div>
                    <div style={{ fontSize: 13, color: "var(--aw-dark-grey)", marginTop: 2 }}>{sp.desc}</div>
                  </div>
                </div>
              </div>

              {recognised && (
                <FadeIn>
                  <div style={{ padding: "0 18px 18px" }}>
                    {/* Root cause */}
                    <div style={{
                      padding: "12px 14px", borderRadius: 8, background: "var(--aw-rose-pale)",
                      borderLeft: `3px solid ${"var(--aw-rose-core)"}`, marginBottom: 14,
                      fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontFamily: "var(--aw-font-sans)",
                    }}>
                      {sp.rootCause}
                    </div>

                    {/* Reflection question */}
                    <label style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-sans)", display: "block", marginBottom: 6 }}>
                      {sp.question}
                    </label>
                    <textarea
                      value={data.reflection || ""}
                      onChange={(e) => setPattern(sp.id, "reflection", e.target.value)}
                      rows={2}
                      placeholder="Write what comes to mind..."
                      style={{
                        width: "100%", padding: "10px 14px", border: `1.5px solid ${"var(--aw-border, #E8DDD6)"}`, borderRadius: 8,
                        fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontFamily: "var(--aw-font-sans)", resize: "vertical", boxSizing: "border-box",
                      }}
                      onFocus={(e) => e.target.style.borderColor = "var(--aw-burg-core)"}
                      onBlur={(e) => e.target.style.borderColor = "var(--aw-border, #E8DDD6)"}
                    />

                    {/* Frequency */}
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 6 }}>How often does this happen?</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {["Rarely", "Monthly", "Weekly", "Multiple times a week"].map((freq) => {
                          const sel = data.frequency === freq;
                          return (
                            <button key={freq} onClick={() => setPattern(sp.id, "frequency", freq)}
                              style={{
                                padding: "6px 14px", borderRadius: 20, fontSize: 13,
                                border: `1.5px solid ${sel ? "var(--aw-burg-core)" : "var(--aw-border, #E8DDD6)"}`,
                                background: sel ? "var(--aw-rose-pale)" : "white", color: sel ? "var(--aw-burg-core)" : "var(--aw-dark-grey)",
                                fontWeight: sel ? 600 : 400, cursor: "pointer",
                              }}>{freq}</button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </FadeIn>
              )}
            </div>
          );
        })}
      </div>

      {identifiedCount > 0 && (
        <FadeIn>
          <div style={{ marginTop: 20, padding: "14px 18px", borderRadius: 10, background: "white", border: `1px solid ${"var(--aw-border, #E8DDD6)"}`, fontSize: 13, color: "var(--aw-dark-grey)" }}>
            {identifiedCount} pattern{identifiedCount > 1 ? "s" : ""} identified
          </div>
        </FadeIn>
      )}

      <NavBtn onClick={onNext} />
    </div>
  );
}

// ─── STEP 4: THE REGRET AUTOPSY ───

function Step4({ regret, setRegretField, onNext }) {
  const fields = [
    { key: "what", label: "What was the financial decision?", placeholder: "e.g. I bought a car I could not afford, I lent money I needed, I signed up for a service on impulse" },
    { key: "when", label: "When did it happen?", placeholder: "e.g. Last month, six months ago, last year" },
    { key: "feeling_before", label: "What were you feeling before you made the decision?", placeholder: "e.g. I was stressed about work, I was celebrating, I felt pressured, I was trying to keep up" },
    { key: "trigger", label: "What triggered it?", placeholder: "e.g. A conversation, an ad, a comparison, an argument, an event" },
    { key: "script", label: "Which money script was running? (Think back to Part 3)", placeholder: "e.g. 'I deserve this because I went without', 'I need to show I am doing well', 'I cannot say no'" },
    { key: "consequence", label: "What was the real consequence?", placeholder: "e.g. Debt, guilt, strained relationship, lost savings, ongoing payments I cannot sustain" },
    { key: "different", label: "If you could go back, what would you do differently?", placeholder: "Be specific. Not just 'I would not do it' but what you would do instead." },
  ];

  const filled = fields.filter((f) => regret[f.key] && regret[f.key].trim()).length;

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)" }}>
        The regret autopsy
      </h3>
      <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>
        Regret is only useful if you learn from it. This exercise takes one financial decision you wish you could undo and walks through it step by step, not to shame you, but to reveal the pattern so it does not repeat.
      </p>
      <div style={{
        margin: "0 0 24px", padding: "12px 16px", borderRadius: 8, background: "var(--aw-rose-pale)",
        fontSize: 13, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontFamily: "var(--aw-font-sans)",
      }}>
        <strong style={{ color: "var(--aw-burg-core)" }}>Choose one decision.</strong> Not necessarily the biggest. Choose the one that still bothers you. The one where you knew, even as you were doing it, that something was off.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {fields.map((f, i) => {
          const val = regret[f.key] || "";
          const isFilled = val.trim().length > 0;
          return (
            <div key={f.key} style={{
              borderRadius: 10, border: `1.5px solid ${isFilled ? "var(--aw-green, #3D7A5F)" : "var(--aw-border, #E8DDD6)"}`,
              background: "white", padding: "16px 18px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", fontSize: 11, fontWeight: 600, flexShrink: 0,
                  background: isFilled ? "var(--aw-green, #3D7A5F)" : "var(--aw-border, #E8DDD6)", color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{isFilled ? "✓" : i + 1}</div>
                <label style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-sans)" }}>{f.label}</label>
              </div>
              <textarea
                value={val}
                onChange={(e) => setRegretField(f.key, e.target.value)}
                rows={2}
                placeholder={f.placeholder}
                style={{
                  width: "100%", padding: "10px 14px", border: `1.5px solid ${"var(--aw-border, #E8DDD6)"}`, borderRadius: 8,
                  fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontFamily: "var(--aw-font-sans)", resize: "vertical", boxSizing: "border-box",
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--aw-burg-core)"}
                onBlur={(e) => e.target.style.borderColor = "var(--aw-border, #E8DDD6)"}
              />
            </div>
          );
        })}
      </div>

      {filled >= 5 && (
        <FadeIn>
          <div style={{
            marginTop: 24, padding: "16px 18px", borderRadius: 10, background: "#E8F3ED",
            borderLeft: `3px solid ${"var(--aw-green, #3D7A5F)"}`, fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontFamily: "var(--aw-font-sans)",
          }}>
            You have just done something most people never do: traced a financial regret from trigger to consequence to alternative. This is not about blame. It is about building a circuit breaker between the trigger and the action.
          </div>
        </FadeIn>
      )}

      <NavBtn onClick={onNext} label="See my summary" />
    </div>
  );
}

// ─── STEP 5: SUMMARY ───

function Step5({ intensities, bodySignals, chains, patterns, regret }) {
  const highTriggers = TRIGGER_SITUATIONS.filter((t) => (intensities[t.id] || 0) >= 2);
  const fightFlightTriggers = TRIGGER_SITUATIONS.filter((t) => (intensities[t.id] || 0) === 3);
  const activePatterns = SPENDING_PATTERNS.filter((sp) => patterns[sp.id]?.recognised);
  const frequentPatterns = activePatterns.filter((sp) => ["Weekly", "Multiple times a week"].includes(patterns[sp.id]?.frequency));

  return (
    <div>
      <h3 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)", textAlign: "center" }}>
        Your Trigger and Response Map
      </h3>

      {/* Trigger severity overview */}
      <FadeIn>
        <div style={{ background: "var(--aw-burg-core)", borderRadius: 16, padding: "28px", color: "white", marginBottom: 24 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, fontFamily: "var(--aw-font-sans)", opacity: 0.6, marginBottom: 16 }}>Trigger overview</div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
            <div style={{ padding: "10px 16px", borderRadius: 10, background: "rgba(255,255,255,0.1)", flex: "1 1 140px" }}>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{highTriggers.length}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>High-intensity triggers</div>
            </div>
            <div style={{ padding: "10px 16px", borderRadius: 10, background: "rgba(255,255,255,0.1)", flex: "1 1 140px" }}>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{fightFlightTriggers.length}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Fight/flight/freeze responses</div>
            </div>
            <div style={{ padding: "10px 16px", borderRadius: 10, background: "rgba(255,255,255,0.1)", flex: "1 1 140px" }}>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{activePatterns.length}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Spending patterns identified</div>
            </div>
          </div>

          {bodySignals.length > 0 && (
            <div>
              <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 6 }}>Your body signals</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {bodySignals.map((s) => (
                  <span key={s} style={{ padding: "4px 12px", borderRadius: 12, background: "rgba(255,255,255,0.12)", fontSize: 13 }}>{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </FadeIn>

      {/* Chain summaries */}
      {highTriggers.length > 0 && (
        <FadeIn delay={200}>
          <div style={{ background: "white", borderRadius: 16, padding: "24px", border: `1px solid ${"var(--aw-border, #E8DDD6)"}`, marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 14 }}>Your trigger chains</div>
            {highTriggers.slice(0, 3).map((t) => {
              const chain = chains[t.id] || {};
              const hasChain = chain.emotion && chain.action;
              return (
                <div key={t.id} style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 8, background: "var(--aw-rose-pale)" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 4 }}>{t.situation}</div>
                  {hasChain ? (
                    <div style={{ fontSize: 13, color: "var(--aw-dark-grey)" }}>
                      {chain.emotion} &#8594; "{chain.thought}" &#8594; {chain.action} &#8594; <span style={{ color: "var(--aw-red, #A23B3B)" }}>{chain.consequence}</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: "var(--aw-soft-grey, #A89B94)", fontStyle: "italic" }}>Chain not yet mapped</div>
                  )}
                </div>
              );
            })}
          </div>
        </FadeIn>
      )}

      {/* Spending patterns */}
      {activePatterns.length > 0 && (
        <FadeIn delay={400}>
          <div style={{ background: "white", borderRadius: 16, padding: "24px", border: `1px solid ${"var(--aw-border, #E8DDD6)"}`, marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 14 }}>Active spending patterns</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {activePatterns.map((sp) => {
                const data = patterns[sp.id];
                const isFrequent = ["Weekly", "Multiple times a week"].includes(data?.frequency);
                return (
                  <div key={sp.id} style={{
                    padding: "10px 14px", borderRadius: 8,
                    background: isFrequent ? "#FDEAEA" : "#FDF3E0",
                    borderLeft: `3px solid ${isFrequent ? "var(--aw-red, #A23B3B)" : "var(--aw-amber, #B8860B)"}`,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: "var(--aw-dark-grey)" }}>{sp.label}</span>
                    {data?.frequency && <span style={{ fontSize: 12, color: isFrequent ? "var(--aw-red, #A23B3B)" : "var(--aw-amber, #B8860B)", fontWeight: 600 }}>{data.frequency}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>
      )}

      {/* Bridge */}
      <FadeIn delay={600}>
        <div style={{
          background: "var(--aw-rose-pale)", borderRadius: 16, padding: "24px", borderLeft: `4px solid ${"var(--aw-rose-core)"}`, marginBottom: 24,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--aw-rose-core)", textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--aw-font-sans)", marginBottom: 8 }}>What comes next</div>
          <p style={{ margin: 0, fontSize: 15, color: "var(--aw-dark-grey)", lineHeight: 1.65, fontFamily: "var(--aw-font-sans)" }}>
            You now have a map of what triggers you, how your body responds, what emotions and thoughts follow, and where your spending patterns live. In Part 5, we shift from the emotional to the practical: examining the gap between what visible spending signals and what wealth actually is.
          </p>
        </div>
      </FadeIn>


    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */

export default function Section4Triggers({ section, answers = {}, onAnswerChange }) {
  const intensities  = answers.s04_intensities || {};
  const chains       = answers.s04_chains || {};
  const bodySignals  = answers.s04_body_signals || [];
  const patterns     = answers.s04_patterns || {};
  const regret       = answers.s04_regret || {};

  const [step, setStep] = useState(0);

  const save = (fieldId, value) => { if (onAnswerChange) onAnswerChange(fieldId, value); };

  const setIntensity = (id, val) => save("s04_intensities", { ...intensities, [id]: val });
  const setChain = (triggerId, field, val) => save("s04_chains", { ...chains, [triggerId]: { ...(chains[triggerId] || {}), [field]: val } });
  const toggleBodySignal = (sig) => {
    const next = bodySignals.includes(sig) ? bodySignals.filter(s => s !== sig) : [...bodySignals, sig];
    save("s04_body_signals", next);
  };
  const setPattern = (id, field, val) => save("s04_patterns", { ...patterns, [id]: { ...(patterns[id] || {}), [field]: val } });
  const setRegretField = (key, val) => save("s04_regret", { ...regret, [key]: val });

  const goNext = () => setStep(s => s + 1);
  const goBack = () => setStep(s => Math.max(0, s - 1));
  const goToStep = (s) => setStep(s);

  const STEPS = ["Trigger map", "Trigger chains", "Spending patterns", "Regret autopsy", "Summary"];

  return (
    <div>
      {/* Section header */}
      <div style={{ marginBottom: 36 }}>
        {section?.part_label && <p style={{ fontFamily: "var(--aw-font-sans)", fontWeight: 700, fontSize: 10, lineHeight: 1.4, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--aw-rose-core)", margin: "0 0 8px" }}>{section.part_label}</p>}
        {section?.heading && <h1 style={{ fontFamily: "var(--aw-font-display)", fontWeight: 400, fontSize: "clamp(34px, 4.6vw, 52px)", lineHeight: 1.05, letterSpacing: "-0.015em", color: "var(--aw-burg-core)", margin: 0 }}>{section.heading}</h1>}
        {section?.intro && <p style={{ fontFamily: "var(--aw-font-sans)", fontWeight: 300, fontSize: 16, lineHeight: 1.85, color: "var(--aw-dark-grey)", margin: "18px 0 0" }}>{section.intro}</p>}
      </div>

      <StepIndicator steps={STEPS} current={step} onStepClick={goToStep} />

      {step === 0 && <Step1 intensities={intensities} setIntensity={setIntensity} onNext={goNext} />}
      {step === 1 && <Step2 intensities={intensities} chains={chains} setChain={setChain} bodySignals={bodySignals} toggleBodySignal={toggleBodySignal} onNext={goNext} onBack={goBack} />}
      {step === 2 && <Step3 patterns={patterns} setPattern={setPattern} onNext={goNext} onBack={goBack} />}
      {step === 3 && <Step4 regret={regret} setRegretField={setRegretField} onNext={goNext} onBack={goBack} />}
      {step === 4 && <Step5 intensities={intensities} bodySignals={bodySignals} chains={chains} patterns={patterns} regret={regret} onBack={goBack} />}
    </div>
  );
}