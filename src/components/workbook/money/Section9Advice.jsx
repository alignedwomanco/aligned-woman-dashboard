import React, { useState, useEffect } from "react";

/*
  MONEY WORKBOOK - Section 9: The Value of Advice
  
  DATA CONTRACT (field_ids via onAnswerChange):
    s09_history             - string
    s09_barriers            - array of barrier ids
    s09_needs               - object { needId: priorityLevel }
    s09_qualities           - array of quality ids
    s09_readiness           - string
    s09_timeline            - string
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
        const clickable = done && onStepClick;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
            <div onClick={() => clickable && onStepClick(i)} style={{
              width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              background: done ? "var(--aw-burg-core)" : active ? "white" : "transparent",
              border: `2px solid ${done || active ? "var(--aw-burg-core)" : "var(--aw-border, #E8DDD6)"}`,
              color: done ? "white" : active ? "var(--aw-burg-core)" : "var(--aw-soft-grey, #A89B94)", fontSize: 13, fontWeight: 600, flexShrink: 0,
              cursor: clickable ? "pointer" : "default",
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
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 28 }}>
        {onBack && <button onClick={onBack} style={{ padding: "12px 24px", background: "white", color: "var(--aw-burg-core)", border: `1.5px solid ${"var(--aw-burg-core)"}`, borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>&#8592; Back</button>}
        {onNext && <button onClick={onNext} style={{ padding: "12px 32px", background: "var(--aw-burg-core)", color: "white", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>{nextLabel || "Continue"} <span style={{ fontSize: 18 }}>&#8594;</span></button>}
      </div>
    </FadeIn>
  );
}

// ─── STEP 1: YOUR ADVISOR HISTORY ───

const HISTORY_OPTIONS = [
  { id: "never", label: "I have never worked with a financial planner", icon: "🚫", followUp: "That is more common than you think, especially among women. The financial industry has historically not made itself accessible to everyone. This section will help you understand what a good advisor relationship looks like so you can enter one with confidence." },
  { id: "bad", label: "I tried, but the experience was negative", icon: "😞", followUp: "A bad experience with one advisor does not mean the profession fails you. Dr. Nasrat spoke about people who were sent down the wrong road or lost money from poor advice. That fear of repeating the experience is valid. But it should inform your criteria, not end your search." },
  { id: "passive", label: "I have one but rarely engage with them", icon: "😶", followUp: "Having a planner you do not use is almost the same as not having one. Dr. Nasrat emphasised regular check-ins, at least annually. If the relationship feels transactional or disconnected, it may be time to re-evaluate the fit." },
  { id: "active", label: "I have one and we meet regularly", icon: "✅", followUp: "This is a strong position. Use this section to evaluate whether your current relationship is still the right one. Even Dr. Nasrat, who is a financial expert herself, works with her own planner to remove bias from her decisions." },
  { id: "informal", label: "I get financial advice from family or friends", icon: "👨‍👩‍👧", followUp: "Informal advice comes from good intentions but often carries the same biases you already have. A qualified planner brings professional analysis, regulatory accountability, and the removal of emotional decision-making. Family advice and professional advice can coexist, but they serve different purposes." },
];

const BARRIERS = [
  {
    id: "b_income",
    label: "I do not think I earn enough to need one",
    response: "Financial planning is not only for the wealthy. In fact, the less margin you have, the more critical it is that every decision is optimised. Many planners work with clients across income levels. The conversation costs nothing. The absence of planning costs everything.",
  },
  {
    id: "b_fees",
    label: "I am worried about fees and commissions",
    response: "This is a reasonable concern. Ask about fee structure upfront. Fee-only planners charge a flat rate. Commission-based planners earn from products they recommend. Neither is inherently wrong, but transparency is non-negotiable. If a planner cannot explain exactly how they get paid, walk away.",
  },
  {
    id: "b_trust",
    label: "I do not know how to find a trustworthy one",
    response: "Look for a Certified Financial Planner (CFP) designation. Check that they are registered with the relevant regulatory body in your country. Ask for references. A trustworthy planner will welcome your scrutiny, not be offended by it.",
  },
  {
    id: "b_shame",
    label: "I feel embarrassed about my financial situation",
    response: "Dr. Nasrat named this directly: the shame, guilt, and embarrassment that prevent people from seeking help. A good planner has seen every financial situation. They do not judge. Their job is to start from where you are, not where you think you should be.",
  },
  {
    id: "b_past",
    label: "I had a bad experience with financial advice before",
    response: "Dr. Nasrat acknowledged this pattern: 'You might have actually been sent down the wrong road. You might have lost money. You might have made poor decisions.' That past experience should sharpen your criteria, not stop your search entirely.",
  },
  {
    id: "b_alone",
    label: "I think I can manage on my own",
    response: "Even Dr. Nasrat, who has a PhD in entrepreneurship and 20 years in financial services, works with her own planner. Why? Because we all have biases. A planner removes the emotional decisions, analyses your entire position, and coaches you to stay on track. Independence and professional guidance are not opposites.",
  },
  {
    id: "b_option",
    label: "I did not know it was an option for someone like me",
    response: "It is. Financial planning is not a luxury service for the privileged. It is a professional relationship available to anyone who wants to be intentional about money. The first conversation with most planners is free.",
  },
];

function Step1({ history, setHistory, selectedBarriers, toggleBarrier, onNext }) {
  const hasHistory = !!history;
  const historyInfo = HISTORY_OPTIONS.find((h) => h.id === history);

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)" }}>
        Your relationship with financial advice
      </h3>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>
        Dr. Nasrat shared something personal in her masterclass: even as a financial expert, she works with her own planner. When she wants to make an emotional purchase or act on a hunch, they have long conversations about what is really driving the impulse. Let us map where you stand.
      </p>

      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 10 }}>
        What is your history with professional financial advice?
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {HISTORY_OPTIONS.map((h) => {
          const sel = history === h.id;
          return (
            <div key={h.id}>
              <button onClick={() => setHistory(h.id)} style={{
                width: "100%", textAlign: "left", padding: "12px 16px", borderRadius: 10,
                border: `1.5px solid ${sel ? "var(--aw-burg-core)" : "var(--aw-border, #E8DDD6)"}`, background: sel ? "var(--aw-rose-pale)" : "white",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
              }}>
                <span style={{ fontSize: 20 }}>{h.icon}</span>
                <span style={{ fontSize: 14, fontWeight: sel ? 600 : 400, color: sel ? "var(--aw-burg-core)" : "var(--aw-dark-grey)" }}>{h.label}</span>
              </button>
              {sel && (
                <FadeIn>
                  <div style={{
                    margin: "6px 0 4px 32px", padding: "12px 16px", borderRadius: 8,
                    background: "white", borderLeft: `3px solid ${"var(--aw-rose-core)"}`,
                    fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontStyle: "italic", fontFamily: "var(--aw-font-sans)",
                  }}>{h.followUp}</div>
                </FadeIn>
              )}
            </div>
          );
        })}
      </div>

      {/* Barriers */}
      {hasHistory && history !== "active" && (
        <FadeIn>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 8 }}>
              What has held you back from seeking professional advice? Select all that apply.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {BARRIERS.map((b) => {
                const sel = selectedBarriers.includes(b.id);
                return (
                  <div key={b.id}>
                    <button onClick={() => toggleBarrier(b.id)} style={{
                      width: "100%", textAlign: "left", padding: "12px 16px", borderRadius: 10,
                      border: `1.5px solid ${sel ? "var(--aw-rose-core)" : "var(--aw-border, #E8DDD6)"}`, background: sel ? "#FFFBF9" : "white",
                      cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 10,
                    }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: 4, flexShrink: 0, marginTop: 1,
                        border: `2px solid ${sel ? "var(--aw-rose-core)" : "var(--aw-border, #E8DDD6)"}`, background: sel ? "var(--aw-rose-core)" : "white",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>{sel && <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>✓</span>}</div>
                      <span style={{ fontSize: 14, color: "var(--aw-dark-grey)" }}>{b.label}</span>
                    </button>
                    {sel && (
                      <FadeIn>
                        <div style={{
                          margin: "6px 0 4px 30px", padding: "12px 16px", borderRadius: 8,
                          background: "white", borderLeft: `3px solid ${"var(--aw-green, #3D7A5F)"}`,
                          fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontStyle: "italic", fontFamily: "var(--aw-font-sans)",
                        }}>{b.response}</div>
                      </FadeIn>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>
      )}

      {hasHistory && <NavBtn onNext={onNext} />}
    </div>
  );
}

// ─── STEP 2: WHAT YOU NEED ───

const ADVICE_AREAS = [
  { id: "budget", label: "Creating a monthly budget I can actually follow", category: "Foundation", priority: null },
  { id: "emergency_fund", label: "Building an emergency fund", category: "Foundation", priority: null },
  { id: "debt", label: "Debt management and reduction strategy", category: "Foundation", priority: null },
  { id: "retirement", label: "Setting up or reviewing a retirement plan", category: "Future", priority: null },
  { id: "tax", label: "Tax-efficient saving and investing", category: "Efficiency", priority: null },
  { id: "insurance", label: "Understanding my insurance and protection needs", category: "Protection", priority: null },
  { id: "children", label: "Planning for children's education", category: "Future", priority: null },
  { id: "wealth", label: "Building long-term wealth and investments", category: "Growth", priority: null },
  { id: "emotional", label: "Helping me stop making emotional financial decisions", category: "Behaviour", priority: null },
  { id: "will", label: "Setting up a will and estate plan", category: "Protection", priority: null },
  { id: "partner", label: "Navigating finances as a couple", category: "Relationship", priority: null },
  { id: "transition", label: "Managing a life transition (divorce, retrenchment, inheritance)", category: "Crisis", priority: null },
];

const PRIORITY_OPTIONS = [
  { value: "urgent", label: "Urgent", color: "var(--aw-red, #A23B3B)" },
  { value: "important", label: "Important", color: "var(--aw-amber, #B8860B)" },
  { value: "future", label: "Future", color: "var(--aw-green, #3D7A5F)" },
];

function Step2({ needs, setNeed, onNext, onBack }) {
  const selected = ADVICE_AREAS.filter((a) => needs[a.id]);
  const urgent = selected.filter((a) => needs[a.id] === "urgent");
  const important = selected.filter((a) => needs[a.id] === "important");

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)" }}>
        What do you need help with?
      </h3>
      <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>
        Dr. Nasrat described the value of a good advisor across four dimensions: clarity (a plan with goals and next steps), coaching (staying disciplined), protection (covering risk, shocks, and life changes), and efficiency (tax-optimal, right products). Review this list and prioritise what you need.
      </p>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontFamily: "var(--aw-font-sans)" }}>
        For each area that applies to you, mark it as urgent, important, or future. Skip what does not apply.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {ADVICE_AREAS.map((area) => {
          const val = needs[area.id];
          return (
            <div key={area.id} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10,
              background: "white", border: `1px solid ${val ? (PRIORITY_OPTIONS.find((p) => p.value === val)?.color || "var(--aw-border, #E8DDD6)") : "var(--aw-border, #E8DDD6)"}`,
              flexWrap: "wrap",
            }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 14, color: "var(--aw-dark-grey)", fontWeight: val ? 500 : 400 }}>{area.label}</div>
                <div style={{ fontSize: 11, color: "var(--aw-soft-grey, #A89B94)" }}>{area.category}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {PRIORITY_OPTIONS.map((p) => {
                  const sel = val === p.value;
                  return (
                    <button key={p.value} onClick={() => setNeed(area.id, sel ? null : p.value)}
                      style={{
                        padding: "5px 12px", borderRadius: 14, fontSize: 12,
                        border: `1.5px solid ${sel ? p.color : "var(--aw-border, #E8DDD6)"}`,
                        background: sel ? `${p.color}15` : "white", color: sel ? p.color : "var(--aw-dark-grey)",
                        fontWeight: sel ? 600 : 400, cursor: "pointer",
                      }}>{p.label}</button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {selected.length > 0 && (
        <FadeIn>
          <div style={{ marginTop: 20, padding: "14px 18px", borderRadius: 10, background: "white", border: `1px solid ${"var(--aw-border, #E8DDD6)"}` }}>
            <span style={{ fontSize: 13, color: "var(--aw-dark-grey)" }}>
              {selected.length} area{selected.length > 1 ? "s" : ""} identified
              {urgent.length > 0 && <span style={{ color: "var(--aw-red, #A23B3B)", fontWeight: 600 }}> / {urgent.length} urgent</span>}
              {important.length > 0 && <span style={{ color: "var(--aw-amber, #B8860B)", fontWeight: 600 }}> / {important.length} important</span>}
            </span>
          </div>
        </FadeIn>
      )}

      {selected.length >= 2 && <NavBtn onNext={onNext} onBack={onBack} />}
    </div>
  );
}

// ─── STEP 3: FINDING YOUR FIT ───

const QUALITIES = [
  "Listens more than they talk in the first meeting",
  "Explains things in plain language, not jargon",
  "Asks about my goals and values, not just my income",
  "Is transparent about fees before I commit to anything",
  "Holds a recognised qualification (CFP or equivalent)",
  "Is registered with the relevant regulatory body",
  "Has experience with clients in my life stage",
  "Understands my cultural context and family dynamics",
  "Respects my autonomy and does not pressure me",
  "Follows up regularly, not just when selling a product",
  "Is willing to give me time to think before making decisions",
  "Can explain the risks of any recommendation clearly",
];

const RED_FLAGS = [
  "Pressures you to sign immediately",
  "Cannot clearly explain how they are paid",
  "Dismisses your questions or concerns",
  "Recommends products without understanding your full situation",
  "Guarantees specific returns",
  "Makes you feel stupid or inadequate",
  "Only contacts you to sell something new",
  "Does not ask about your existing financial commitments",
];

const FIRST_MEETING_QUESTIONS = [
  "How are you qualified, and where are you registered?",
  "How do you charge, and what will this cost me?",
  "What does a typical client relationship look like with you?",
  "How often will we meet, and what happens between meetings?",
  "Can you walk me through how you would approach my situation?",
  "What happens if I want to change something or stop?",
  "How do you handle it when a client wants to make an emotional decision?",
];

function Step3({ selectedQualities, toggleQuality, readiness, setReadiness, timeline, setTimeline, onNext, onBack }) {
  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)" }}>
        Finding the right advisor
      </h3>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>
        Dr. Nasrat is specific: find a planner who is well educated, well qualified, a certified financial planner, who provides trusted advice that is transparent and disclosing of all material risks. Here is how to evaluate that.
      </p>

      {/* Qualities */}
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 8 }}>
        Which qualities matter most to you? Select your top 5.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 }}>
        {QUALITIES.map((q) => {
          const sel = selectedQualities.includes(q);
          const maxed = !sel && selectedQualities.length >= 5;
          return (
            <label key={q} style={{
              display: "flex", alignItems: "flex-start", gap: 10, cursor: maxed ? "default" : "pointer",
              padding: "8px 12px", borderRadius: 8, opacity: maxed ? 0.4 : 1,
              background: sel ? "#E8F3ED" : "transparent",
            }}>
              <input type="checkbox" checked={sel} onChange={() => !maxed && toggleQuality(q)}
                style={{ accentColor: "var(--aw-green, #3D7A5F)", width: 16, height: 16, marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.45 }}>{q}</span>
            </label>
          );
        })}
      </div>

      {/* Red flags */}
      <FadeIn>
        <div style={{
          padding: "18px 20px", borderRadius: 12, background: "#FDEAEA", borderLeft: `4px solid ${"var(--aw-red, #A23B3B)"}`, marginBottom: 24,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--aw-red, #A23B3B)", textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--aw-font-sans)", marginBottom: 10 }}>Red flags to walk away from</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {RED_FLAGS.map((f, i) => (
              <div key={i} style={{ fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontFamily: "var(--aw-font-sans)", padding: "4px 0" }}>
                <span style={{ color: "var(--aw-red, #A23B3B)", marginRight: 8 }}>&#10005;</span> {f}
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Questions to ask */}
      <FadeIn delay={200}>
        <div style={{
          padding: "18px 20px", borderRadius: 12, background: "#E8F3ED", borderLeft: `4px solid ${"var(--aw-green, #3D7A5F)"}`, marginBottom: 24,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--aw-green, #3D7A5F)", textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--aw-font-sans)", marginBottom: 10 }}>Questions to ask in your first meeting</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {FIRST_MEETING_QUESTIONS.map((q, i) => (
              <div key={i} style={{ fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontFamily: "var(--aw-font-sans)", padding: "4px 0" }}>
                <span style={{ color: "var(--aw-green, #3D7A5F)", marginRight: 8, fontWeight: 700 }}>{i + 1}.</span> {q}
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Readiness + timeline */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 8 }}>
          How ready do you feel to meet with a financial planner?
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["Ready now", "Almost ready, need to gather information first", "Open to it but nervous", "Not ready yet"].map((opt) => {
            const sel = readiness === opt;
            return (
              <button key={opt} onClick={() => setReadiness(opt)} style={{
                padding: "8px 16px", borderRadius: 20, fontSize: 13,
                border: `1.5px solid ${sel ? "var(--aw-burg-core)" : "var(--aw-border, #E8DDD6)"}`,
                background: sel ? "var(--aw-rose-pale)" : "white", color: sel ? "var(--aw-burg-core)" : "var(--aw-dark-grey)",
                fontWeight: sel ? 600 : 400, cursor: "pointer",
              }}>{opt}</button>
            );
          })}
        </div>
      </div>

      {readiness && (
        <FadeIn>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 8 }}>
              When will you take the first step?
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["This week", "This month", "Within 90 days", "When I finish this workbook", "Undecided"].map((opt) => {
                const sel = timeline === opt;
                return (
                  <button key={opt} onClick={() => setTimeline(opt)} style={{
                    padding: "8px 16px", borderRadius: 20, fontSize: 13,
                    border: `1.5px solid ${sel ? "var(--aw-green, #3D7A5F)" : "var(--aw-border, #E8DDD6)"}`,
                    background: sel ? "#E8F3ED" : "white", color: sel ? "var(--aw-green, #3D7A5F)" : "var(--aw-dark-grey)",
                    fontWeight: sel ? 600 : 400, cursor: "pointer",
                  }}>{opt}</button>
                );
              })}
            </div>
          </div>
        </FadeIn>
      )}

      {readiness && timeline && <NavBtn onNext={onNext} onBack={onBack} label="See my advisor brief" />}
    </div>
  );
}

// ─── STEP 4: SUMMARY - YOUR ADVISOR BRIEF ───

function Step4Summary({ history, selectedBarriers, needs, selectedQualities, readiness, timeline, onBack }) {
  const historyInfo = HISTORY_OPTIONS.find((h) => h.id === history);
  const urgentNeeds = ADVICE_AREAS.filter((a) => needs[a.id] === "urgent");
  const importantNeeds = ADVICE_AREAS.filter((a) => needs[a.id] === "important");
  const futureNeeds = ADVICE_AREAS.filter((a) => needs[a.id] === "future");
  const barrierLabels = BARRIERS.filter((b) => selectedBarriers.includes(b.id));

  return (
    <div>
      <h3 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)", textAlign: "center" }}>
        Your Advisor Brief
      </h3>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontFamily: "var(--aw-font-sans)", textAlign: "center", fontStyle: "italic" }}>
        This is what you would bring to a first meeting with a financial planner. It summarises your situation, priorities, and what you need from the relationship.
      </p>

      {/* Status */}
      <FadeIn>
        <div style={{ background: "var(--aw-burg-core)", borderRadius: 16, padding: "24px", color: "white", marginBottom: 24 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <div style={{ flex: "1 1 180px", padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.1)" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--aw-font-sans)", opacity: 0.6 }}>Advisor history</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>{historyInfo?.label || "Not specified"}</div>
            </div>
            <div style={{ flex: "1 1 180px", padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.1)" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--aw-font-sans)", opacity: 0.6 }}>Readiness</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>{readiness}</div>
            </div>
            <div style={{ flex: "1 1 180px", padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.1)" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--aw-font-sans)", opacity: 0.6 }}>Timeline</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>{timeline}</div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Priority needs */}
      <FadeIn delay={200}>
        <div style={{ background: "white", borderRadius: 16, padding: "24px", border: `1px solid ${"var(--aw-border, #E8DDD6)"}`, marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 14 }}>What I need help with</div>
          {urgentNeeds.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--aw-red, #A23B3B)", textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--aw-font-sans)", marginBottom: 6 }}>Urgent</div>
              {urgentNeeds.map((n) => (
                <div key={n.id} style={{ padding: "6px 12px", marginBottom: 4, borderRadius: 6, background: "#FDEAEA", fontSize: 14, color: "var(--aw-dark-grey)" }}>{n.label}</div>
              ))}
            </div>
          )}
          {importantNeeds.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--aw-amber, #B8860B)", textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--aw-font-sans)", marginBottom: 6 }}>Important</div>
              {importantNeeds.map((n) => (
                <div key={n.id} style={{ padding: "6px 12px", marginBottom: 4, borderRadius: 6, background: "#FDF3E0", fontSize: 14, color: "var(--aw-dark-grey)" }}>{n.label}</div>
              ))}
            </div>
          )}
          {futureNeeds.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--aw-green, #3D7A5F)", textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--aw-font-sans)", marginBottom: 6 }}>Future</div>
              {futureNeeds.map((n) => (
                <div key={n.id} style={{ padding: "6px 12px", marginBottom: 4, borderRadius: 6, background: "#E8F3ED", fontSize: 14, color: "var(--aw-dark-grey)" }}>{n.label}</div>
              ))}
            </div>
          )}
        </div>
      </FadeIn>

      {/* Qualities I value */}
      {selectedQualities.length > 0 && (
        <FadeIn delay={400}>
          <div style={{ background: "white", borderRadius: 16, padding: "24px", border: `1px solid ${"var(--aw-border, #E8DDD6)"}`, marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 12 }}>What I value in an advisor</div>
            {selectedQualities.map((q, i) => (
              <div key={i} style={{ padding: "6px 0", borderBottom: i < selectedQualities.length - 1 ? `1px solid ${"var(--aw-border, #E8DDD6)"}` : "none", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.45 }}>
                <span style={{ color: "var(--aw-green, #3D7A5F)", marginRight: 8 }}>✓</span>{q}
              </div>
            ))}
          </div>
        </FadeIn>
      )}

      {/* Barriers acknowledged */}
      {barrierLabels.length > 0 && (
        <FadeIn delay={600}>
          <div style={{ background: "white", borderRadius: 16, padding: "24px", border: `1px solid ${"var(--aw-border, #E8DDD6)"}`, marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 12 }}>Barriers I am working through</div>
            {barrierLabels.map((b) => (
              <div key={b.id} style={{ padding: "6px 0", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.45 }}>{b.label}</div>
            ))}
          </div>
        </FadeIn>
      )}

      {/* Bridge */}
      <FadeIn delay={800}>
        <div style={{ background: "var(--aw-rose-pale)", borderRadius: 16, padding: "24px", borderLeft: `4px solid ${"var(--aw-rose-core)"}`, marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--aw-rose-core)", textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--aw-font-sans)", marginBottom: 8 }}>What comes next</div>
          <p style={{ margin: 0, fontSize: 15, color: "var(--aw-dark-grey)", lineHeight: 1.65, fontFamily: "var(--aw-font-sans)" }}>
            Part 10 is your final section: the Financial Confidence Action Plan. Everything you have reflected on, mapped, calculated, and committed to across this entire workbook comes together into a single actionable plan. You will also write a letter to your future self about the financial woman you are becoming.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={1000}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 32, gap: 12 }}>
          {onBack && <button onClick={onBack} style={{ padding: "10px 24px", background: "white", color: "var(--aw-burg-core)", border: `1.5px solid ${"var(--aw-burg-core)"}`, borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>&#8592; Back to edit</button>}
          <button style={{ padding: "14px 40px", background: `linear-gradient(135deg, ${"var(--aw-burg-core)"}, ${"var(--aw-rose-core)"})`, color: "white", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: "pointer", boxShadow: `0 4px 20px ${"var(--aw-burg-core)"}33` }}>
            Save and continue to Part 10: My Action Plan &#8594;
          </button>
          <p style={{ marginTop: 4, fontSize: 13, color: "var(--aw-soft-grey, #A89B94)" }}>Your answers are saved automatically.</p>
        </div>
      </FadeIn>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */

export default function Section9Advice({ section, answers = {}, onAnswerChange }) {
  const history            = answers.s09_history || null;
  const selectedBarriers   = answers.s09_barriers || [];
  const needs              = answers.s09_needs || {};
  const selectedQualities  = answers.s09_qualities || [];
  const readiness          = answers.s09_readiness || null;
  const timeline           = answers.s09_timeline || null;

  const [step, setStep] = useState(0);

  const save = (fieldId, value) => { if (onAnswerChange) onAnswerChange(fieldId, value); };

  const toggleBarrier = (id) => {
    const next = selectedBarriers.includes(id) ? selectedBarriers.filter(x => x !== id) : [...selectedBarriers, id];
    save("s09_barriers", next);
  };
  const setNeed = (id, val) => save("s09_needs", { ...needs, [id]: val });
  const toggleQuality = (id) => {
    const next = selectedQualities.includes(id) ? selectedQualities.filter(x => x !== id) : [...selectedQualities, id];
    save("s09_qualities", next);
  };

  const goNext = () => setStep(s => s + 1);
  const goBack = () => setStep(s => Math.max(0, s - 1));
  const goToStep = (s) => setStep(s);

  const STEPS = ["Your history", "What you need", "Finding your fit", "Advisor brief"];

  return (
    <div>
      {/* Section header */}
      <div style={{ marginBottom: 36 }}>
        {section?.part_label && <p style={{ fontFamily: "var(--aw-font-sans)", fontWeight: 700, fontSize: 10, lineHeight: 1.4, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--aw-rose-core)", margin: "0 0 8px" }}>{section.part_label}</p>}
        {section?.heading && <h1 style={{ fontFamily: "var(--aw-font-display)", fontWeight: 400, fontSize: "clamp(34px, 4.6vw, 52px)", lineHeight: 1.05, letterSpacing: "-0.015em", color: "var(--aw-burg-core)", margin: 0 }}>{section.heading}</h1>}
        {section?.intro && <p style={{ fontFamily: "var(--aw-font-sans)", fontWeight: 300, fontSize: 16, lineHeight: 1.85, color: "var(--aw-dark-grey)", margin: "18px 0 0" }}>{section.intro}</p>}
      </div>

      <StepIndicator steps={STEPS} current={step} onStepClick={goToStep} />

      {step === 0 && <Step1 history={history} setHistory={(v) => save("s09_history", v)} selectedBarriers={selectedBarriers} toggleBarrier={toggleBarrier} onNext={goNext} />}
      {step === 1 && <Step2 needs={needs} setNeed={setNeed} onNext={goNext} onBack={goBack} />}
      {step === 2 && <Step3 selectedQualities={selectedQualities} toggleQuality={toggleQuality} readiness={readiness} setReadiness={(v) => save("s09_readiness", v)} timeline={timeline} setTimeline={(v) => save("s09_timeline", v)} onNext={goNext} onBack={goBack} />}
      {step === 3 && <Step4Summary history={history} selectedBarriers={selectedBarriers} needs={needs} selectedQualities={selectedQualities} readiness={readiness} timeline={timeline} onBack={goBack} />}
    </div>
  );
}