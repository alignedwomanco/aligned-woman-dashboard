import React, { useState, useEffect } from "react";

/*
  MONEY WORKBOOK - Section 8: My Risk Profile
  
  DATA CONTRACT (field_ids via onAnswerChange):
    s08_reactions            - object { scenarioId: responseValue }
    s08_capacity             - object { questionId: optionValue }
    s08_reflection           - string
    s08_mismatch_reflection  - string
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

// ─── DATA ───

const MARKET_SCENARIOS = [
  {
    id: "ms1",
    title: "The sudden drop",
    situation: "You invested 10,000 three months ago. Today it is worth 8,000. A 20% loss.",
    responses: [
      { text: "Sell everything immediately. I cannot watch it fall further.", score: 1, type: "emotional", label: "Panic exit" },
      { text: "Feel sick but leave it. Check it obsessively hoping it recovers.", score: 2, type: "emotional", label: "Anxious hold" },
      { text: "Remind myself that markets are cyclical and this is normal.", score: 3, type: "rational", label: "Informed patience" },
      { text: "Buy more while prices are low. This is a discount.", score: 4, type: "rational", label: "Opportunistic" },
    ],
    insight_low: "Dr. Nasrat taught that a loss on paper is not a loss in your pocket. Selling during a dip locks in the loss permanently. The impulse to sell is almost always emotional, not strategic.",
    insight_high: "Seeing a dip as a buying opportunity shows strong risk tolerance. Just make sure this confidence is backed by an emergency fund and a long timeline, not by bravado.",
  },
  {
    id: "ms2",
    title: "The long wait",
    situation: "You have been invested for 2 years. Your investment has grown only 3% total. A savings account would have done better.",
    responses: [
      { text: "Move everything to a savings account. At least it is predictable.", score: 1, type: "emotional", label: "Abandon ship" },
      { text: "Feel frustrated and question whether investing is worth the risk.", score: 2, type: "emotional", label: "Doubt" },
      { text: "Accept that 2 years is too short to judge a long-term investment.", score: 3, type: "rational", label: "Long view" },
      { text: "Stay invested and add more. The real returns come in decades, not years.", score: 4, type: "rational", label: "Conviction" },
    ],
    insight_low: "The temptation to quit during flat periods is one of the biggest destroyers of long-term wealth. Dr. Nasrat said steady realistic returns compounded for decades beat sporadic bursts of high performance.",
    insight_high: "Patience during flat periods is rare and valuable. Most investors abandon their strategy precisely when they should be holding. You understand that time is the real variable.",
  },
  {
    id: "ms3",
    title: "The news storm",
    situation: "Headlines are predicting a recession. Markets are volatile. A colleague tells you they have moved everything to cash.",
    responses: [
      { text: "Follow their lead. Get to safety before it gets worse.", score: 1, type: "emotional", label: "Herd exit" },
      { text: "Feel anxious and start checking your portfolio daily.", score: 2, type: "emotional", label: "Anxiety spiral" },
      { text: "Acknowledge the noise but review my actual plan before reacting.", score: 3, type: "rational", label: "Plan first" },
      { text: "Ignore headlines entirely. My strategy is not based on news cycles.", score: 4, type: "rational", label: "Disciplined" },
    ],
    insight_low: "Market sentiment is contagious. Dr. Nasrat warned that empathy (following the crowd's fear) must be replaced by judgement. Other people's panic is not your investment strategy.",
    insight_high: "Tuning out noise is a discipline most investors never develop. The ability to separate headlines from your actual financial position is a genuine competitive advantage.",
  },
  {
    id: "ms4",
    title: "The missed wave",
    situation: "A friend made 300% returns on a trending investment you did not buy. Everyone is talking about it.",
    responses: [
      { text: "Buy in now. I cannot afford to miss out on more gains.", score: 1, type: "emotional", label: "FOMO chase" },
      { text: "Feel regret and question my own strategy.", score: 2, type: "emotional", label: "Self-doubt" },
      { text: "Recognise this as hindsight bias. Nobody knew it would perform this well.", score: 3, type: "rational", label: "Grounded" },
      { text: "Stay on my plan. Chasing past performance is a reliable way to lose money.", score: 4, type: "rational", label: "Disciplined" },
    ],
    insight_low: "Dr. Nasrat specifically warned about this: 'People always say I should have been invested in gold a year ago.' Could you have timed it? Gold was languishing for more than 20 years before its recent surge. Quick wins are gambling, not investing.",
    insight_high: "Resisting FOMO when everyone around you is celebrating gains takes real discipline. It also takes a clear plan. If your plan is working, someone else's windfall is irrelevant.",
  },
];

const CAPACITY_QUESTIONS = [
  {
    id: "timeline",
    question: "How long can you leave your investments untouched?",
    options: [
      { text: "I may need the money within 1 year", score: 1 },
      { text: "I can leave it for 1 to 3 years", score: 2 },
      { text: "I can leave it for 3 to 10 years", score: 3 },
      { text: "I will not need this money for 10+ years", score: 4 },
    ],
    why: "Time is the single biggest factor in risk capacity. With a 10+ year horizon, short-term volatility becomes noise. With a 1-year horizon, even moderate risk can be devastating.",
  },
  {
    id: "knowledge",
    question: "How would you describe your financial knowledge?",
    options: [
      { text: "Very little. Investing feels intimidating and foreign.", score: 1 },
      { text: "I understand the basics but lack confidence to act.", score: 2 },
      { text: "Reasonably informed. I have some investments already.", score: 3 },
      { text: "Experienced. I actively research and manage investments.", score: 4 },
    ],
    why: "Knowledge does not determine what you should invest in, but it determines how much guidance you need. Lower knowledge does not mean lower capacity. It means a financial planner becomes more, not less, valuable.",
  },
  {
    id: "income_stability",
    question: "How stable and predictable is your income?",
    options: [
      { text: "Highly unpredictable. I do not know what next month looks like.", score: 1 },
      { text: "Somewhat variable with a baseline I can count on.", score: 2 },
      { text: "Stable salary with occasional bonuses.", score: 3 },
      { text: "Multiple stable income streams.", score: 4 },
    ],
    why: "Stable income means you can ride out market dips without being forced to sell at a loss. Variable income means you need a larger cash buffer before taking investment risk.",
  },
  {
    id: "dependents",
    question: "How many people depend on your income?",
    options: [
      { text: "Several people (children, parents, extended family)", score: 1 },
      { text: "A partner and/or children", score: 2 },
      { text: "Just one other person", score: 3 },
      { text: "Only myself", score: 4 },
    ],
    why: "More dependents means more obligation to protect capital. This does not mean you should avoid investing. It means the protective layer (emergency fund, insurance) must be in place first.",
  },
  {
    id: "debt",
    question: "What is your current debt situation?",
    options: [
      { text: "High debt that I am struggling to manage", score: 1 },
      { text: "Manageable debt but it takes a significant portion of my income", score: 2 },
      { text: "Low debt, mostly a home loan or similar", score: 3 },
      { text: "Debt-free or nearly so", score: 4 },
    ],
    why: "Investing while carrying high-interest debt is like filling a bucket with a hole in it. The return on paying off 20% credit card debt is guaranteed. Market returns are not.",
  },
];

// ─── STEP 1: MARKET SCENARIOS ───

function Step1({ reactions, setReaction, onNext }) {
  const answered = Object.keys(reactions).length;

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)" }}>
        How you react under pressure
      </h3>
      <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>
        Dr. Nasrat taught that you need to endure volatility for compounding to work. Emotional reactions to downturns are the biggest enemy of long-term returns. These four scenarios test your instinctive response, not your knowledge.
      </p>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontFamily: "var(--aw-font-sans)" }}>
        Choose the response closest to what you would actually do, not what you think is correct.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {MARKET_SCENARIOS.map((sc) => {
          const chosen = reactions[sc.id];
          const chosenData = chosen ? sc.responses.find((r) => r.text === chosen) : null;
          const isLow = chosenData && chosenData.score <= 2;
          return (
            <div key={sc.id} style={{
              borderRadius: 12, border: `1.5px solid ${chosen ? "var(--aw-burg-core)" : "var(--aw-border, #E8DDD6)"}`,
              background: "white", overflow: "hidden",
            }}>
              <div style={{ padding: "16px 18px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--aw-burg-core)", textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--aw-font-sans)", marginBottom: 6 }}>{sc.title}</div>
                <div style={{ fontSize: 15, fontWeight: 500, color: "var(--aw-dark-grey)", marginBottom: 14, lineHeight: 1.5 }}>{sc.situation}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {sc.responses.map((r) => {
                    const sel = chosen === r.text;
                    const typeColor = r.type === "emotional" ? "var(--aw-rose-core)" : "var(--aw-green, #3D7A5F)";
                    return (
                      <button key={r.text} onClick={() => setReaction(sc.id, r.text)}
                        style={{
                          width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: 8,
                          border: `1.5px solid ${sel ? typeColor : "var(--aw-border, #E8DDD6)"}`,
                          background: sel ? `${typeColor}10` : "white",
                          cursor: "pointer", fontSize: 14, color: sel ? typeColor : "var(--aw-dark-grey)",
                          fontWeight: sel ? 500 : 400, lineHeight: 1.45,
                        }}>
                        {r.text}
                        {sel && (
                          <span style={{
                            display: "inline-block", marginLeft: 8, padding: "2px 8px", borderRadius: 10,
                            fontSize: 10, fontWeight: 600, background: `${typeColor}20`, color: typeColor,
                            textTransform: "uppercase", letterSpacing: 0.5,
                          }}>{r.label} / {r.type}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {chosen && (
                <FadeIn>
                  <div style={{
                    padding: "14px 18px", borderTop: `1px solid ${"var(--aw-border, #E8DDD6)"}`,
                    background: isLow ? "var(--aw-rose-pale)" : "#E8F3ED",
                    fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontStyle: "italic", fontFamily: "var(--aw-font-sans)",
                  }}>
                    {isLow ? sc.insight_low : sc.insight_high}
                  </div>
                </FadeIn>
              )}
            </div>
          );
        })}
      </div>

      {answered >= 3 && <NavBtn onNext={onNext} />}
    </div>
  );
}

// ─── STEP 2: RISK CAPACITY ───

function Step2({ capacity, setCapacity, onNext, onBack }) {
  const answered = Object.keys(capacity).length;

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)" }}>
        Your risk capacity
      </h3>
      <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>
        Step 1 measured your emotional risk tolerance. This step measures your actual capacity for risk: how much volatility your life can structurally absorb. These are facts, not feelings.
      </p>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontFamily: "var(--aw-font-sans)" }}>
        Your risk profile is the intersection of both. Someone might have high emotional tolerance but low capacity (single income, high debt, dependents). Someone else might have low tolerance but high capacity (stable income, no debt, long timeline). The mismatch is where problems happen.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {CAPACITY_QUESTIONS.map((q) => {
          const val = capacity[q.id];
          return (
            <div key={q.id} style={{
              borderRadius: 12, border: `1.5px solid ${val ? "var(--aw-burg-core)" : "var(--aw-border, #E8DDD6)"}`,
              background: "white", overflow: "hidden",
            }}>
              <div style={{ padding: "16px 18px" }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 12 }}>{q.question}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {q.options.map((opt) => {
                    const sel = val === opt.score;
                    return (
                      <button key={opt.score} onClick={() => setCapacity(q.id, opt.score)}
                        style={{
                          width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: 8,
                          border: `1.5px solid ${sel ? "var(--aw-burg-core)" : "var(--aw-border, #E8DDD6)"}`,
                          background: sel ? "var(--aw-rose-pale)" : "white",
                          cursor: "pointer", fontSize: 14, color: sel ? "var(--aw-burg-core)" : "var(--aw-dark-grey)",
                          fontWeight: sel ? 500 : 400, lineHeight: 1.45,
                        }}>{opt.text}</button>
                    );
                  })}
                </div>
              </div>

              {val && (
                <FadeIn>
                  <div style={{
                    padding: "12px 18px", borderTop: `1px solid ${"var(--aw-border, #E8DDD6)"}`,
                    background: "var(--aw-rose-pale)", fontSize: 13, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontStyle: "italic", fontFamily: "var(--aw-font-sans)",
                  }}>{q.why}</div>
                </FadeIn>
              )}
            </div>
          );
        })}
      </div>

      {answered >= 4 && <NavBtn onNext={onNext} onBack={onBack} />}
    </div>
  );
}

// ─── STEP 3: THE SPLIT + REFLECTION ───

function Step3({ reactions, capacity, reflection, setReflection, mismatchReflection, setMismatchReflection, onNext, onBack }) {
  // Calculate emotional score
  const emotionalScores = MARKET_SCENARIOS.map((sc) => {
    const chosen = reactions[sc.id];
    if (!chosen) return 0;
    const resp = sc.responses.find((r) => r.text === chosen);
    return resp ? resp.score : 0;
  });
  const emotionalAvg = emotionalScores.filter((s) => s > 0).length > 0
    ? emotionalScores.filter((s) => s > 0).reduce((a, b) => a + b, 0) / emotionalScores.filter((s) => s > 0).length
    : 0;

  // Calculate capacity score
  const capacityScores = Object.values(capacity);
  const capacityAvg = capacityScores.length > 0
    ? capacityScores.reduce((a, b) => a + b, 0) / capacityScores.length
    : 0;

  const emotionalLabel = emotionalAvg <= 1.5 ? "Low" : emotionalAvg <= 2.5 ? "Moderate" : emotionalAvg <= 3.2 ? "Moderate-high" : "High";
  const capacityLabel = capacityAvg <= 1.5 ? "Low" : capacityAvg <= 2.5 ? "Moderate" : capacityAvg <= 3.2 ? "Moderate-high" : "High";

  const emotionalColor = emotionalAvg <= 2 ? "var(--aw-red, #A23B3B)" : emotionalAvg <= 3 ? "var(--aw-amber, #B8860B)" : "var(--aw-green, #3D7A5F)";
  const capacityColor = capacityAvg <= 2 ? "var(--aw-red, #A23B3B)" : capacityAvg <= 3 ? "var(--aw-amber, #B8860B)" : "var(--aw-green, #3D7A5F)";

  const hasMismatch = Math.abs(emotionalAvg - capacityAvg) >= 1;

  // Count emotional vs rational responses
  const emotionalResponses = MARKET_SCENARIOS.filter((sc) => {
    const chosen = reactions[sc.id];
    if (!chosen) return false;
    return sc.responses.find((r) => r.text === chosen)?.type === "emotional";
  }).length;
  const rationalResponses = MARKET_SCENARIOS.filter((sc) => {
    const chosen = reactions[sc.id];
    if (!chosen) return false;
    return sc.responses.find((r) => r.text === chosen)?.type === "rational";
  }).length;

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)" }}>
        The emotional vs rational split
      </h3>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>
        Your risk profile has two dimensions. Here is where they land, and whether they align.
      </p>

      {/* Two-axis visual */}
      <FadeIn>
        <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 260px", padding: "20px", borderRadius: 12, background: "white", border: `1.5px solid ${emotionalColor}` }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: emotionalColor, textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--aw-font-sans)", marginBottom: 8 }}>Emotional tolerance</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "var(--aw-dark-grey)", marginBottom: 4 }}>{emotionalLabel}</div>
            <div style={{ fontSize: 13, color: "var(--aw-dark-grey)", marginBottom: 12 }}>How you react under market pressure</div>

            {/* Bar */}
            <div style={{ height: 8, borderRadius: 4, background: `${"var(--aw-border, #E8DDD6)"}`, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ height: "100%", width: `${(emotionalAvg / 4) * 100}%`, background: emotionalColor, borderRadius: 4, transition: "width 0.4s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--aw-soft-grey, #A89B94)" }}>
              <span>Fear-driven</span><span>Opportunity-driven</span>
            </div>

            <div style={{ marginTop: 12, fontSize: 13, color: "var(--aw-dark-grey)" }}>
              {emotionalResponses} of {emotionalResponses + rationalResponses} responses were emotional
            </div>
          </div>

          <div style={{ flex: "1 1 260px", padding: "20px", borderRadius: 12, background: "white", border: `1.5px solid ${capacityColor}` }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: capacityColor, textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--aw-font-sans)", marginBottom: 8 }}>Structural capacity</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "var(--aw-dark-grey)", marginBottom: 4 }}>{capacityLabel}</div>
            <div style={{ fontSize: 13, color: "var(--aw-dark-grey)", marginBottom: 12 }}>How much risk your life can absorb</div>

            {/* Bar */}
            <div style={{ height: 8, borderRadius: 4, background: `${"var(--aw-border, #E8DDD6)"}`, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ height: "100%", width: `${(capacityAvg / 4) * 100}%`, background: capacityColor, borderRadius: 4, transition: "width 0.4s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--aw-soft-grey, #A89B94)" }}>
              <span>Constrained</span><span>Flexible</span>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Mismatch alert */}
      {hasMismatch && (
        <FadeIn delay={200}>
          <div style={{
            padding: "18px 20px", borderRadius: 12, marginBottom: 20,
            background: "#FDF3E0", borderLeft: `4px solid ${"var(--aw-amber, #B8860B)"}`,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--aw-amber, #B8860B)", marginBottom: 6 }}>Mismatch detected</div>
            <p style={{ margin: "0 0 12px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontFamily: "var(--aw-font-sans)" }}>
              {emotionalAvg > capacityAvg
                ? "Your emotional tolerance for risk is higher than your structural capacity. You feel comfortable with volatility, but your life circumstances (income, debt, dependents, timeline) cannot absorb as much risk as your instincts suggest. This mismatch can lead to overexposure."
                : "Your structural capacity for risk is higher than your emotional tolerance. Your life can absorb more volatility than your emotions will allow. This mismatch means you are likely investing too conservatively, leaving long-term growth on the table because of fear rooted in your money story."
              }
            </p>
            <label style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-sans)", display: "block", marginBottom: 6 }}>
              Does this mismatch connect to anything from your money story in Parts 2 and 3?
            </label>
            <textarea value={mismatchReflection} onChange={(e) => setMismatchReflection(e.target.value)}
              rows={3} placeholder="Think about whether your risk feelings come from rational analysis or inherited fear..."
              style={{
                width: "100%", padding: "10px 14px", border: `1.5px solid ${"var(--aw-border, #E8DDD6)"}`, borderRadius: 8,
                fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontFamily: "var(--aw-font-sans)", resize: "vertical", boxSizing: "border-box",
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--aw-burg-core)"}
              onBlur={(e) => e.target.style.borderColor = "var(--aw-border, #E8DDD6)"}
            />
          </div>
        </FadeIn>
      )}

      {/* Aligned message */}
      {!hasMismatch && (
        <FadeIn delay={200}>
          <div style={{
            padding: "16px 20px", borderRadius: 12, marginBottom: 20,
            background: "#E8F3ED", borderLeft: `4px solid ${"var(--aw-green, #3D7A5F)"}`,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--aw-green, #3D7A5F)", marginBottom: 4 }}>Aligned</div>
            <p style={{ margin: 0, fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontFamily: "var(--aw-font-sans)" }}>
              Your emotional tolerance and structural capacity are in alignment. This is a good foundation for making investment decisions that you can stick to through market cycles.
            </p>
          </div>
        </FadeIn>
      )}

      {/* Core reflection */}
      <FadeIn delay={300}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-sans)", display: "block", marginBottom: 8 }}>
            Based on everything above, what kind of investor are you? And what kind do you want to become?
          </label>
          <textarea value={reflection} onChange={(e) => setReflection(e.target.value)}
            rows={4} placeholder="Consider: Is your current approach serving you? Are you being held back by fear, or are you taking on more risk than your life can handle? What would Dr. Nasrat's advice be for your specific situation?"
            style={{
              width: "100%", padding: "12px 14px", border: `1.5px solid ${"var(--aw-border, #E8DDD6)"}`, borderRadius: 8,
              fontSize: 15, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontFamily: "var(--aw-font-sans)", resize: "vertical", boxSizing: "border-box",
            }}
            onFocus={(e) => e.target.style.borderColor = "var(--aw-burg-core)"}
            onBlur={(e) => e.target.style.borderColor = "var(--aw-border, #E8DDD6)"}
          />
        </div>
      </FadeIn>

      <NavBtn onNext={onNext} onBack={onBack} label="See my risk profile" />
    </div>
  );
}

// ─── STEP 4: PROFILE SUMMARY ───

function Step4Summary({ reactions, capacity, reflection, mismatchReflection, onBack }) {
  const emotionalScores = MARKET_SCENARIOS.map((sc) => {
    const chosen = reactions[sc.id];
    if (!chosen) return 0;
    return sc.responses.find((r) => r.text === chosen)?.score || 0;
  }).filter((s) => s > 0);
  const capacityScores = Object.values(capacity);

  const emotionalAvg = emotionalScores.length > 0 ? emotionalScores.reduce((a, b) => a + b, 0) / emotionalScores.length : 0;
  const capacityAvg = capacityScores.length > 0 ? capacityScores.reduce((a, b) => a + b, 0) / capacityScores.length : 0;
  const combined = (emotionalAvg + capacityAvg) / 2;

  let profile, profileColor, profileDesc, investmentGuidance;
  if (combined <= 1.75) {
    profile = "Conservative";
    profileColor = "var(--aw-green, #3D7A5F)";
    profileDesc = "You prioritise capital preservation over growth. This is not weakness. For your current life stage, risk tolerance, and financial position, a conservative approach protects what you have while still allowing modest compounding.";
    investmentGuidance = "Focus on low-volatility instruments: savings accounts, money market funds, government bonds, conservative balanced funds. Avoid individual stocks or high-growth equity until your capacity shifts.";
  } else if (combined <= 2.5) {
    profile = "Moderate-conservative";
    profileColor = "var(--aw-amber, #B8860B)";
    profileDesc = "You can handle some volatility but prefer stability as a baseline. You are willing to accept moderate fluctuations for better long-term returns, as long as the core of your portfolio feels safe.";
    investmentGuidance = "A blend of fixed income and moderate equity exposure works here. Balanced funds, index trackers with a conservative tilt, and a strong cash buffer alongside your investments.";
  } else if (combined <= 3.25) {
    profile = "Moderate-growth";
    profileColor = "var(--aw-amber, #B8860B)";
    profileDesc = "You understand that volatility is the price of long-term growth and are willing to pay it. You can ride out market dips without panic, and your life structure supports this.";
    investmentGuidance = "A growth-tilted portfolio with significant equity exposure, complemented by some fixed income for stability. Index funds, diversified equity funds, and a disciplined long-term approach.";
  } else {
    profile = "Growth";
    profileColor = "var(--aw-green, #3D7A5F)";
    profileDesc = "You have both the emotional tolerance and the structural capacity for significant market exposure. You see volatility as opportunity and have the timeline to benefit from it.";
    investmentGuidance = "Equity-heavy portfolios, diversified across markets and sectors. Your edge is time and temperament. The risk is overconfidence. Make sure your emergency fund and protections are solid before maximising growth exposure.";
  }

  return (
    <div>
      <h3 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)", textAlign: "center" }}>
        Your Risk Profile
      </h3>

      {/* Profile card */}
      <FadeIn>
        <div style={{ background: "var(--aw-burg-core)", borderRadius: 16, padding: "28px", color: "white", textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, fontFamily: "var(--aw-font-sans)", opacity: 0.6, marginBottom: 8 }}>Your investor profile</div>
          <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>{profile}</div>

          {/* Spectrum */}
          <div style={{ maxWidth: 360, margin: "0 auto 20px" }}>
            <div style={{ height: 10, borderRadius: 5, background: "rgba(255,255,255,0.15)", position: "relative", overflow: "visible" }}>
              <div style={{
                position: "absolute", top: -4, left: `${Math.min(95, Math.max(5, (combined / 4) * 100))}%`,
                width: 18, height: 18, borderRadius: "50%", background: "white",
                transform: "translateX(-50%)", transition: "left 0.6s ease",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }} />
              <div style={{ height: "100%", borderRadius: 5, background: "linear-gradient(90deg, #4ADE80, #FBBF24, #F87171)", opacity: 0.6 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, opacity: 0.5, marginTop: 6 }}>
              <span>Conservative</span><span>Moderate</span><span>Growth</span>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: 14, opacity: 0.85, lineHeight: 1.6 }}>{profileDesc}</p>
        </div>
      </FadeIn>

      {/* Guidance */}
      <FadeIn delay={200}>
        <div style={{ background: "white", borderRadius: 16, padding: "24px", border: `1px solid ${"var(--aw-border, #E8DDD6)"}`, marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 8 }}>What this means for your investments</div>
          <p style={{ margin: "0 0 16px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontFamily: "var(--aw-font-sans)" }}>{investmentGuidance}</p>
          <div style={{
            padding: "12px 16px", borderRadius: 8, background: "var(--aw-rose-pale)", borderLeft: `3px solid ${"var(--aw-rose-core)"}`,
            fontSize: 13, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontStyle: "italic", fontFamily: "var(--aw-font-sans)",
          }}>
            This profile is a starting point for a conversation with a financial planner, not a prescription. Dr. Nasrat teaches that a good advisor removes bias and helps you make decisions aligned to your actual position, not your fears or your ambitions.
          </div>
        </div>
      </FadeIn>

      {/* Dr Nasrat's principles */}
      <FadeIn delay={400}>
        <div style={{ background: "white", borderRadius: 16, padding: "24px", border: `1px solid ${"var(--aw-border, #E8DDD6)"}`, marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 12 }}>Dr. Nasrat's investment principles to carry forward</div>
          {[
            "You cannot time the market. Nobody can.",
            "A loss on paper is not a loss in your pocket. Wait the cycle out.",
            "Steady realistic returns compounded for decades beat sporadic bursts.",
            "Behaviour is the edge. Calm, patient, consistent.",
            "Do not imitate other people's success. Design your own plan.",
            "If you do not have the stomach for high risk, choose something more structured. That is not failure. That is self-awareness.",
          ].map((p, i) => (
            <div key={i} style={{ padding: "8px 0", borderBottom: i < 5 ? `1px solid ${"var(--aw-border, #E8DDD6)"}` : "none", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontFamily: "var(--aw-font-sans)" }}>
              {p}
            </div>
          ))}
        </div>
      </FadeIn>

      {/* Bridge */}
      <FadeIn delay={600}>
        <div style={{ background: "var(--aw-rose-pale)", borderRadius: 16, padding: "24px", borderLeft: `4px solid ${"var(--aw-rose-core)"}`, marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--aw-rose-core)", textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--aw-font-sans)", marginBottom: 8 }}>What comes next</div>
          <p style={{ margin: 0, fontSize: 15, color: "var(--aw-dark-grey)", lineHeight: 1.65, fontFamily: "var(--aw-font-sans)" }}>
            You now know your risk profile. In Part 9, we address the final barrier to financial confidence: the value of professional advice. Many of the protections, investment decisions, and plans identified in this workbook are best implemented with a qualified financial planner. Part 9 helps you define what you need from one and how to find one you trust.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={800}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 32, gap: 12 }}>
          {onBack && <button onClick={onBack} style={{ padding: "10px 24px", background: "white", color: "var(--aw-burg-core)", border: `1.5px solid ${"var(--aw-burg-core)"}`, borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>&#8592; Back to edit</button>}
          <button style={{ padding: "14px 40px", background: `linear-gradient(135deg, ${"var(--aw-burg-core)"}, ${"var(--aw-rose-core)"})`, color: "white", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: "pointer", boxShadow: `0 4px 20px ${"var(--aw-burg-core)"}33` }}>
            Save and continue to Part 9: The Value of Advice &#8594;
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

export default function Section8Risk({ section, answers = {}, onAnswerChange }) {
  const reactions           = answers.s08_reactions || {};
  const capacity            = answers.s08_capacity || {};
  const reflection          = answers.s08_reflection || "";
  const mismatchReflection  = answers.s08_mismatch_reflection || "";

  const [step, setStep] = useState(0);

  const save = (fieldId, value) => { if (onAnswerChange) onAnswerChange(fieldId, value); };

  const setReaction = (id, val) => save("s08_reactions", { ...reactions, [id]: val });
  const setCapacityAnswer = (id, val) => save("s08_capacity", { ...capacity, [id]: val });

  const goNext = () => setStep(s => s + 1);
  const goBack = () => setStep(s => Math.max(0, s - 1));
  const goToStep = (s) => setStep(s);

  const STEPS = ["Market reactions", "Risk capacity", "The split", "Your profile"];

  return (
    <div>
      {/* Section header */}
      <div style={{ marginBottom: 36 }}>
        {section?.part_label && <p style={{ fontFamily: "var(--aw-font-sans)", fontWeight: 700, fontSize: 10, lineHeight: 1.4, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--aw-rose-core)", margin: "0 0 8px" }}>{section.part_label}</p>}
        {section?.heading && <h1 style={{ fontFamily: "var(--aw-font-display)", fontWeight: 400, fontSize: "clamp(34px, 4.6vw, 52px)", lineHeight: 1.05, letterSpacing: "-0.015em", color: "var(--aw-burg-core)", margin: 0 }}>{section.heading}</h1>}
        {section?.intro && <p style={{ fontFamily: "var(--aw-font-sans)", fontWeight: 300, fontSize: 16, lineHeight: 1.85, color: "var(--aw-dark-grey)", margin: "18px 0 0" }}>{section.intro}</p>}
      </div>

      <StepIndicator steps={STEPS} current={step} onStepClick={goToStep} />

      {step === 0 && <Step1 reactions={reactions} setReaction={setReaction} onNext={goNext} />}
      {step === 1 && <Step2 capacity={capacity} setCapacity={setCapacityAnswer} onNext={goNext} onBack={goBack} />}
      {step === 2 && <Step3 reactions={reactions} capacity={capacity} reflection={reflection} setReflection={(v) => save("s08_reflection", v)} mismatchReflection={mismatchReflection} setMismatchReflection={(v) => save("s08_mismatch_reflection", v)} onNext={goNext} onBack={goBack} />}
      {step === 3 && <Step4Summary reactions={reactions} capacity={capacity} reflection={reflection} mismatchReflection={mismatchReflection} onBack={goBack} />}
    </div>
  );
}