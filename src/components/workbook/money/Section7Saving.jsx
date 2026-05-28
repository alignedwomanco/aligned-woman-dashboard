import React, { useState, useEffect } from "react";

/*
  MONEY WORKBOOK - Section 7: Saving and Investing with Intention
  
  DATA CONTRACT (field_ids via onAnswerChange):
    s07_monthly_amount       - string (numeric)
    s07_years                - number
    s07_rate                 - number
    s07_safety_level         - string (none | partial | one | three | six)
    s07_monthly_essentials   - string (numeric)
    s07_survival_reflection  - string
    s07_goals                - object { short: [...], medium: [...], long: [...] }
    s07_protections          - object { itemId: "yes" | "partial" | "no" | "unsure" }
    s07_barriers             - array of barrier ids
    s07_commitment           - string
    s07_start_amount         - string (numeric)
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

const num = (v) => parseFloat(v) || 0;
const fmt = (n) => {
  if (n === 0) return "0";
  const abs = Math.abs(n);
  const s = abs >= 1000000 ? `${(abs / 1000000).toFixed(1)}M` : abs >= 1000 ? abs.toLocaleString("en", { maximumFractionDigits: 0 }) : String(Math.round(abs));
  return n < 0 ? `-${s}` : s;
};

// ─── STEP 1: COMPOUNDING VISUALISER ───

function compound(monthly, years, rate) {
  const r = rate / 100 / 12;
  if (r === 0) return monthly * years * 12;
  return monthly * ((Math.pow(1 + r, years * 12) - 1) / r);
}

function Step1({ monthlyAmount, setMonthlyAmount, years, setYears, rate, setRate, onNext }) {
  const contributed = num(monthlyAmount) * num(years) * 12;
  const total = compound(num(monthlyAmount), num(years), num(rate));
  const growth = total - contributed;
  const growthPercent = contributed > 0 ? Math.round((growth / contributed) * 100) : 0;

  const presets = [
    { amount: 500, label: "500/mo" },
    { amount: 1000, label: "1,000/mo" },
    { amount: 2500, label: "2,500/mo" },
    { amount: 5000, label: "5,000/mo" },
  ];

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)" }}>
        The power of compounding
      </h3>
      <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>
        Dr. Nasrat taught that compounding rewards patience more than brilliance. Staying invested often beats trying to time the market. Consistency turns time into an ally. Let us see what that actually looks like with your numbers.
      </p>
      <div style={{
        margin: "0 0 24px", padding: "12px 16px", borderRadius: 8, background: "var(--aw-rose-pale)",
        fontSize: 13, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontFamily: "var(--aw-font-sans)",
      }}>
        <strong style={{ color: "var(--aw-burg-core)" }}>This is not investment advice.</strong> This calculator shows the mathematical power of consistent saving over time. Real returns vary. The point is the principle: start, stay consistent, let time work.
      </div>

      {/* Monthly amount */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-sans)", display: "block", marginBottom: 8 }}>
          How much could you save per month?
        </label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          {presets.map((p) => (
            <button key={p.amount} onClick={() => setMonthlyAmount(String(p.amount))}
              style={{
                padding: "8px 16px", borderRadius: 20, fontSize: 13,
                border: `1.5px solid ${num(monthlyAmount) === p.amount ? "var(--aw-burg-core)" : "var(--aw-border, #E8DDD6)"}`,
                background: num(monthlyAmount) === p.amount ? "var(--aw-rose-pale)" : "white",
                color: num(monthlyAmount) === p.amount ? "var(--aw-burg-core)" : "var(--aw-dark-grey)",
                fontWeight: num(monthlyAmount) === p.amount ? 600 : 400, cursor: "pointer",
              }}>{p.label}</button>
          ))}
        </div>
        <input type="text" value={monthlyAmount} onChange={(e) => setMonthlyAmount(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="Enter your own amount"
          style={{
            width: "100%", maxWidth: 240, padding: "10px 14px", border: `1.5px solid ${"var(--aw-border, #E8DDD6)"}`, borderRadius: 8,
            fontSize: 15, color: "var(--aw-dark-grey)", boxSizing: "border-box",
          }}
          onFocus={(e) => e.target.style.borderColor = "var(--aw-burg-core)"}
          onBlur={(e) => e.target.style.borderColor = "var(--aw-border, #E8DDD6)"}
        />
      </div>

      {/* Time horizon */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-sans)", display: "block", marginBottom: 8 }}>
          For how many years?
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <input type="range" min={1} max={40} value={years} onChange={(e) => setYears(Number(e.target.value))}
            style={{ flex: 1, accentColor: "var(--aw-burg-core)" }} />
          <span style={{ fontSize: 18, fontWeight: 700, color: "var(--aw-burg-core)", minWidth: 60, textAlign: "right" }}>{years} year{years > 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Return rate */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-sans)", display: "block", marginBottom: 8 }}>
          Assumed average annual return
        </label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[5, 7, 8, 10, 12].map((r) => (
            <button key={r} onClick={() => setRate(r)}
              style={{
                padding: "8px 16px", borderRadius: 20, fontSize: 13,
                border: `1.5px solid ${rate === r ? "var(--aw-burg-core)" : "var(--aw-border, #E8DDD6)"}`,
                background: rate === r ? "var(--aw-rose-pale)" : "white",
                color: rate === r ? "var(--aw-burg-core)" : "var(--aw-dark-grey)",
                fontWeight: rate === r ? 600 : 400, cursor: "pointer",
              }}>{r}%</button>
          ))}
        </div>
      </div>

      {/* Result */}
      {num(monthlyAmount) > 0 && (
        <FadeIn>
          <div style={{
            padding: "28px", borderRadius: 16, background: "var(--aw-burg-core)", color: "white", textAlign: "center",
          }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, fontFamily: "var(--aw-font-sans)", opacity: 0.6, marginBottom: 4 }}>
              After {years} year{years > 1 ? "s" : ""} of saving {fmt(num(monthlyAmount))}/month
            </div>
            <div style={{ fontSize: 42, fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
              {fmt(Math.round(total))}
            </div>

            {/* Visual split */}
            <div style={{ maxWidth: 360, margin: "0 auto 16px" }}>
              <div style={{ height: 12, borderRadius: 6, overflow: "hidden", display: "flex", background: "rgba(255,255,255,0.15)" }}>
                <div style={{ height: "100%", width: `${contributed > 0 ? (contributed / total) * 100 : 0}%`, background: "var(--aw-amber, #B8860B)", transition: "width 0.4s" }} />
                <div style={{ height: "100%", width: `${contributed > 0 ? (growth / total) * 100 : 0}%`, background: "#4ADE80", transition: "width 0.4s" }} />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--aw-amber, #B8860B)" }} />
                  <span style={{ fontSize: 12, opacity: 0.7 }}>You contributed</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{fmt(Math.round(contributed))}</div>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#4ADE80" }} />
                  <span style={{ fontSize: 12, opacity: 0.7 }}>Compounding earned</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{fmt(Math.round(growth))}</div>
              </div>
            </div>

            {growthPercent > 0 && (
              <p style={{ margin: "16px 0 0", fontSize: 14, opacity: 0.8, lineHeight: 1.5 }}>
                Compounding added {growthPercent}% on top of what you put in. That is money your money made while you did nothing. This is what Dr. Nasrat means by patience being rewarded.
              </p>
            )}
          </div>
        </FadeIn>
      )}

      {/* Time comparison */}
      {num(monthlyAmount) > 0 && years >= 5 && (
        <FadeIn delay={300}>
          <div style={{ marginTop: 20, padding: "16px 18px", borderRadius: 10, background: "white", border: `1px solid ${"var(--aw-border, #E8DDD6)"}` }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 10 }}>What starting earlier or later looks like</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[5, 10, 20, 30].filter((y) => y !== years).slice(0, 3).map((y) => {
                const t = compound(num(monthlyAmount), y, num(rate));
                return (
                  <div key={y} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${"var(--aw-border, #E8DDD6)"}` }}>
                    <span style={{ fontSize: 13, color: "var(--aw-dark-grey)" }}>{y} years</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-sans)" }}>{fmt(Math.round(t))}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>
      )}

      {num(monthlyAmount) > 0 && <NavBtn onNext={onNext} />}
    </div>
  );
}

// ─── STEP 2: SAFETY NET AUDIT ───

const SAFETY_LEVELS = [
  { value: "none", label: "No emergency fund at all", color: "var(--aw-red, #A23B3B)", icon: "🔴", msg: "This is your single most urgent priority. Without a buffer, every unexpected expense becomes a crisis. Start with one month of essential expenses as your first target." },
  { value: "partial", label: "Some savings, but less than 1 month of expenses", color: "var(--aw-red, #A23B3B)", icon: "🟠", msg: "You have started, which matters. The next target is one full month of essential expenses. After that, build toward three months." },
  { value: "one", label: "About 1 month of expenses", color: "var(--aw-amber, #B8860B)", icon: "🟡", msg: "One month gives you breathing room for small emergencies. The standard recommendation is three to six months. Keep building." },
  { value: "three", label: "3 months of expenses", color: "var(--aw-green, #3D7A5F)", icon: "🟢", msg: "Three months is the baseline for genuine financial security. You can weather a job loss, a medical event, or a major repair without going into debt." },
  { value: "six", label: "6 or more months of expenses", color: "var(--aw-green, #3D7A5F)", icon: "🟢", msg: "This is a strong position. Your emergency fund is a foundation, not a goal in itself. The question now is whether the rest of your money is working for you through investments." },
];

function Step2({ safetyLevel, setSafetyLevel, monthlyEssentials, setMonthlyEssentials, survivalReflection, setSurvivalReflection, onNext, onBack }) {
  const level = SAFETY_LEVELS.find((l) => l.value === safetyLevel);
  const essentials = num(monthlyEssentials);
  const targets = essentials > 0 ? { one: essentials, three: essentials * 3, six: essentials * 6 } : null;

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)" }}>
        Your safety net
      </h3>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>
        Dr. Nasrat taught that self-empowerment comes from knowing you can face any eventuality. An emergency fund is the foundation of that confidence. Without it, you are one unexpected event away from crisis.
      </p>

      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 10 }}>
        If you lost your income tomorrow, how long could you survive on savings alone?
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {SAFETY_LEVELS.map((sl) => {
          const sel = safetyLevel === sl.value;
          return (
            <div key={sl.value}>
              <button onClick={() => setSafetyLevel(sl.value)} style={{
                width: "100%", textAlign: "left", padding: "12px 16px", borderRadius: 10,
                border: `1.5px solid ${sel ? sl.color : "var(--aw-border, #E8DDD6)"}`,
                background: sel ? `${sl.color}10` : "white", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <span>{sl.icon}</span>
                <span style={{ fontSize: 14, fontWeight: sel ? 600 : 400, color: sel ? sl.color : "var(--aw-dark-grey)" }}>{sl.label}</span>
              </button>
              {sel && (
                <FadeIn>
                  <div style={{
                    margin: "6px 0 4px 30px", padding: "12px 16px", borderRadius: 8,
                    background: "white", borderLeft: `3px solid ${sl.color}`,
                    fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontStyle: "italic", fontFamily: "var(--aw-font-sans)",
                  }}>{sl.msg}</div>
                </FadeIn>
              )}
            </div>
          );
        })}
      </div>

      {/* Monthly essentials calculator */}
      {safetyLevel && (
        <FadeIn>
          <div style={{ padding: "18px 20px", borderRadius: 12, background: "white", border: `1px solid ${"var(--aw-border, #E8DDD6)"}`, marginBottom: 20 }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-sans)", display: "block", marginBottom: 8 }}>
              What are your monthly essential expenses? (Housing, food, transport, insurance, debt payments)
            </label>
            <input type="text" value={monthlyEssentials} onChange={(e) => setMonthlyEssentials(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="From Part 6, add up your essential expenses"
              style={{
                width: "100%", maxWidth: 280, padding: "10px 14px", border: `1.5px solid ${"var(--aw-border, #E8DDD6)"}`, borderRadius: 8,
                fontSize: 15, color: "var(--aw-dark-grey)", boxSizing: "border-box",
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--aw-burg-core)"}
              onBlur={(e) => e.target.style.borderColor = "var(--aw-border, #E8DDD6)"}
            />

            {targets && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 8 }}>Your emergency fund targets</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {[
                    { label: "1 month", amount: targets.one, color: "var(--aw-amber, #B8860B)" },
                    { label: "3 months", amount: targets.three, color: "var(--aw-green, #3D7A5F)" },
                    { label: "6 months", amount: targets.six, color: "var(--aw-green, #3D7A5F)" },
                  ].map((t) => (
                    <div key={t.label} style={{ padding: "10px 16px", borderRadius: 10, background: `${t.color}15`, border: `1px solid ${t.color}30`, flex: "1 1 120px", textAlign: "center" }}>
                      <div style={{ fontSize: 12, color: t.color, fontWeight: 600 }}>{t.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "var(--aw-dark-grey)" }}>{fmt(t.amount)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </FadeIn>
      )}

      {/* Reflection */}
      {safetyLevel && safetyLevel !== "six" && (
        <FadeIn delay={200}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-sans)", display: "block", marginBottom: 6 }}>
              What would change in your life if you had a fully funded emergency fund?
            </label>
            <textarea value={survivalReflection} onChange={(e) => setSurvivalReflection(e.target.value)}
              rows={3} placeholder="Think beyond the money. How would you feel? What decisions could you make? What would you stop tolerating?"
              style={{
                width: "100%", padding: "12px 14px", border: `1.5px solid ${"var(--aw-border, #E8DDD6)"}`, borderRadius: 8,
                fontSize: 15, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontFamily: "var(--aw-font-sans)", resize: "vertical", boxSizing: "border-box",
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--aw-burg-core)"}
              onBlur={(e) => e.target.style.borderColor = "var(--aw-border, #E8DDD6)"}
            />
          </div>
        </FadeIn>
      )}

      {safetyLevel && <NavBtn onNext={onNext} onBack={onBack} />}
    </div>
  );
}

// ─── STEP 3: THREE-HORIZON GOAL BUILDER ───

const HORIZONS = [
  { id: "short", label: "Short-term", timeframe: "Under 1 year", color: "var(--aw-amber, #B8860B)", icon: "🎯", examples: "Emergency fund, holiday, specific purchase, small debt payoff" },
  { id: "medium", label: "Medium-term", timeframe: "1 to 5 years", color: "var(--aw-rose-core)", icon: "📍", examples: "Education fund, home deposit, car replacement, starting a business, debt-free target" },
  { id: "long", label: "Long-term", timeframe: "5+ years", color: "var(--aw-green, #3D7A5F)", icon: "🏔️", examples: "Retirement, children's education, financial independence, property investment" },
];

function Step3({ goals, setGoal, addGoal, removeGoal, onNext, onBack }) {
  const totalMonthly = Object.values(goals).flat().reduce((s, g) => s + num(g.monthly), 0);

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)" }}>
        Building your savings goals
      </h3>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>
        Dr. Nasrat teaches that saving should happen with intention across three horizons: short-term for immediate needs, medium-term for life goals, and long-term for future security. Saving without a goal is better than not saving. Saving with a goal is better still.
      </p>

      {HORIZONS.map((h) => {
        const horizonGoals = goals[h.id] || [];
        return (
          <div key={h.id} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>{h.icon}</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "var(--aw-dark-grey)" }}>{h.label} <span style={{ fontWeight: 400, color: "var(--aw-soft-grey, #A89B94)" }}>({h.timeframe})</span></div>
                <div style={{ fontSize: 12, color: "var(--aw-dark-grey)", fontStyle: "italic" }}>{h.examples}</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginLeft: 32 }}>
              {horizonGoals.map((goal, gi) => (
                <div key={gi} style={{
                  padding: "14px 16px", borderRadius: 10, background: "white",
                  border: `1px solid ${"var(--aw-border, #E8DDD6)"}`,
                }}>
                  <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                    <input type="text" value={goal.name} onChange={(e) => setGoal(h.id, gi, "name", e.target.value)}
                      placeholder="Goal name" style={{
                        flex: 1, padding: "8px 12px", border: `1px solid ${"var(--aw-border, #E8DDD6)"}`, borderRadius: 6,
                        fontSize: 14, color: "var(--aw-dark-grey)", boxSizing: "border-box",
                      }}
                      onFocus={(e) => e.target.style.borderColor = "var(--aw-burg-core)"}
                      onBlur={(e) => e.target.style.borderColor = "var(--aw-border, #E8DDD6)"}
                    />
                    <button onClick={() => removeGoal(h.id, gi)} style={{
                      padding: "6px 12px", background: "none", border: `1px solid ${"var(--aw-border, #E8DDD6)"}`,
                      borderRadius: 6, color: "var(--aw-soft-grey, #A89B94)", cursor: "pointer", fontSize: 14,
                    }}>x</button>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ flex: "1 1 120px" }}>
                      <div style={{ fontSize: 11, color: "var(--aw-soft-grey, #A89B94)", marginBottom: 4 }}>Target amount</div>
                      <input type="text" value={goal.target} onChange={(e) => setGoal(h.id, gi, "target", e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="0" style={{
                          width: "100%", padding: "6px 10px", border: `1px solid ${"var(--aw-border, #E8DDD6)"}`, borderRadius: 6,
                          fontSize: 14, color: "var(--aw-dark-grey)", boxSizing: "border-box",
                        }} />
                    </div>
                    <div style={{ flex: "1 1 120px" }}>
                      <div style={{ fontSize: 11, color: "var(--aw-soft-grey, #A89B94)", marginBottom: 4 }}>Monthly contribution</div>
                      <input type="text" value={goal.monthly} onChange={(e) => setGoal(h.id, gi, "monthly", e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="0" style={{
                          width: "100%", padding: "6px 10px", border: `1px solid ${"var(--aw-border, #E8DDD6)"}`, borderRadius: 6,
                          fontSize: 14, color: "var(--aw-dark-grey)", boxSizing: "border-box",
                        }} />
                    </div>
                    <div style={{ flex: "1 1 120px" }}>
                      <div style={{ fontSize: 11, color: "var(--aw-soft-grey, #A89B94)", marginBottom: 4 }}>Timeframe</div>
                      <input type="text" value={goal.timeframe || ""} onChange={(e) => setGoal(h.id, gi, "timeframe", e.target.value)}
                        placeholder="e.g. 6 months, 3 years" style={{
                          width: "100%", padding: "6px 10px", border: `1px solid ${"var(--aw-border, #E8DDD6)"}`, borderRadius: 6,
                          fontSize: 14, color: "var(--aw-dark-grey)", boxSizing: "border-box",
                        }} />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => addGoal(h.id)} style={{
                padding: "10px", border: `1.5px dashed ${"var(--aw-border, #E8DDD6)"}`, borderRadius: 8,
                background: "transparent", color: "var(--aw-dark-grey)", cursor: "pointer", fontSize: 13,
              }}>+ Add a {h.label.toLowerCase()} goal</button>
            </div>
          </div>
        );
      })}

      {/* Monthly total */}
      {totalMonthly > 0 && (
        <FadeIn>
          <div style={{
            padding: "16px 20px", borderRadius: 10, background: "#E8F3ED",
            border: `1px solid ${"var(--aw-green, #3D7A5F)"}`,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-green, #3D7A5F)" }}>
              Total monthly contribution across all goals: {fmt(totalMonthly)}
            </div>
          </div>
        </FadeIn>
      )}

      <NavBtn onNext={onNext} onBack={onBack} />
    </div>
  );
}

// ─── STEP 4: PROTECTION CHECK ───

const PROTECTION_ITEMS = [
  { id: "emergency", label: "Emergency fund (3+ months)", category: "Safety", critical: true },
  { id: "retirement", label: "Retirement fund or pension", category: "Future", critical: true },
  { id: "tax_free", label: "Tax-free savings account", category: "Growth", critical: false },
  { id: "investments", label: "Investment products (unit trusts, stocks)", category: "Growth", critical: false },
  { id: "life_insurance", label: "Life insurance", category: "Protection", critical: true },
  { id: "disability", label: "Disability or income protection", category: "Protection", critical: true },
  { id: "severe_illness", label: "Severe illness / critical illness cover", category: "Protection", critical: true },
  { id: "medical", label: "Medical aid or health insurance", category: "Protection", critical: true },
  { id: "will", label: "A will or estate plan", category: "Legacy", critical: true },
];

const STATUS_OPTIONS = [
  { value: "yes", label: "In place", color: "var(--aw-green, #3D7A5F)" },
  { value: "partial", label: "Partially", color: "var(--aw-amber, #B8860B)" },
  { value: "no", label: "Not in place", color: "var(--aw-red, #A23B3B)" },
  { value: "unsure", label: "Not sure", color: "var(--aw-soft-grey, #A89B94)" },
];

function Step4({ protections, setProtection, onNext, onBack }) {
  const answered = Object.keys(protections).length;
  const missing = PROTECTION_ITEMS.filter((p) => p.critical && (protections[p.id] === "no" || protections[p.id] === "unsure"));
  const inPlace = PROTECTION_ITEMS.filter((p) => protections[p.id] === "yes");

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)" }}>
        Your protection check
      </h3>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>
        Dr. Nasrat emphasised that a good financial plan ensures every family member is prepared for risk, shocks, and life changes. People are diagnosed with cancer, have heart attacks, have accidents. Are you adequately covered?
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {PROTECTION_ITEMS.map((item) => {
          const status = protections[item.id];
          return (
            <div key={item.id} style={{
              padding: "12px 16px", borderRadius: 10, background: "white",
              border: `1px solid ${status ? (STATUS_OPTIONS.find((s) => s.value === status)?.color || "var(--aw-border, #E8DDD6)") : "var(--aw-border, #E8DDD6)"}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "var(--aw-dark-grey)" }}>{item.label}</span>
                  {item.critical && <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 8, background: "#FDEAEA", color: "var(--aw-red, #A23B3B)", fontWeight: 600 }}>Critical</span>}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {STATUS_OPTIONS.map((opt) => {
                    const sel = status === opt.value;
                    return (
                      <button key={opt.value} onClick={() => setProtection(item.id, opt.value)}
                        style={{
                          padding: "4px 12px", borderRadius: 14, fontSize: 12,
                          border: `1.5px solid ${sel ? opt.color : "var(--aw-border, #E8DDD6)"}`,
                          background: sel ? `${opt.color}15` : "white", color: sel ? opt.color : "var(--aw-dark-grey)",
                          fontWeight: sel ? 600 : 400, cursor: "pointer",
                        }}>{opt.label}</button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {answered >= 5 && missing.length > 0 && (
        <FadeIn>
          <div style={{
            marginTop: 20, padding: "16px 18px", borderRadius: 10,
            background: "#FDEAEA", borderLeft: `3px solid ${"var(--aw-red, #A23B3B)"}`,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--aw-red, #A23B3B)", marginBottom: 6 }}>
              {missing.length} critical protection{missing.length > 1 ? "s" : ""} missing or unknown
            </div>
            <p style={{ margin: 0, fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontFamily: "var(--aw-font-sans)" }}>
              These gaps leave you or your family exposed. Part 9 will help you think about working with a financial planner who can address these specifically.
            </p>
          </div>
        </FadeIn>
      )}

      {answered >= 5 && <NavBtn onNext={onNext} onBack={onBack} />}
    </div>
  );
}

// ─── STEP 5: BARRIERS + COMMITMENT ───

const BARRIER_OPTIONS = [
  { id: "not_enough", label: "I do not earn enough to save", response: "Dr. Nasrat's teaching: the gap between earning and spending creates security, not income alone. Even a small amount per month compounding over 20 years becomes significant. Start with what you can." },
  { id: "debt_first", label: "I need to pay off debt first", response: "Debt reduction and saving are not mutually exclusive. Even a tiny savings contribution alongside debt payments builds the habit and the buffer. Waiting until debt is zero means waiting for the habit to form as well." },
  { id: "overwhelm", label: "I do not know where to start", response: "You have already started. You are six sections into this workbook. The next step is one concrete action, not a complete financial plan." },
  { id: "dont_trust", label: "I do not trust financial products or advisors", response: "This is often rooted in past experience or cultural messaging. Part 9 will help you define what trustworthy advice looks like for you. Not all advisors are the same." },
  { id: "partner", label: "My partner handles our finances", response: "Dr. Nasrat spoke directly about women who could not leave difficult situations because they had no financial agency. Independence is not distrust. It is safety." },
  { id: "fear", label: "I am afraid of losing money in the market", response: "Dr. Nasrat teaches that you cannot time the market. Volatility is normal. A loss on paper is not a loss in your pocket. The market, over the long term, outperforms. Behaviour is the edge: calm, patient, consistent." },
  { id: "later", label: "I keep telling myself I will start later", response: "Every month of delay is a month of compounding you will never get back. The compounding visualiser in Step 1 showed you exactly what time costs. The best time to start was years ago. The second best time is now." },
];

function Step5({ barriers, toggleBarrier, commitment, setCommitment, startAmount, setStartAmount, onNext, onBack }) {
  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)" }}>
        What has stopped you, and what will you do now
      </h3>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>
        Understanding the barrier is the first step to moving past it. Select every barrier that has been true for you.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {BARRIER_OPTIONS.map((b) => {
          const sel = barriers.includes(b.id);
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
                <span style={{ fontSize: 14, color: "var(--aw-dark-grey)", fontWeight: sel ? 500 : 400 }}>{b.label}</span>
              </button>
              {sel && (
                <FadeIn>
                  <div style={{
                    margin: "6px 0 4px 30px", padding: "12px 16px", borderRadius: 8,
                    background: "white", borderLeft: `3px solid ${"var(--aw-rose-core)"}`,
                    fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontStyle: "italic", fontFamily: "var(--aw-font-sans)",
                  }}>{b.response}</div>
                </FadeIn>
              )}
            </div>
          );
        })}
      </div>

      {/* Minimum commitment */}
      <div style={{ padding: "20px", borderRadius: 12, background: "#E8F3ED", border: `1px solid ${"var(--aw-green, #3D7A5F)"}`, marginBottom: 20 }}>
        <label style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-green, #3D7A5F)", display: "block", marginBottom: 8 }}>
          What is the smallest amount you could commit to saving every month, starting this week?
        </label>
        <input type="text" value={startAmount} onChange={(e) => setStartAmount(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="Any amount counts"
          style={{
            width: "100%", maxWidth: 240, padding: "10px 14px", border: `1.5px solid ${"var(--aw-green, #3D7A5F)"}`, borderRadius: 8,
            fontSize: 16, color: "var(--aw-dark-grey)", boxSizing: "border-box", fontWeight: 600,
          }} />
        {num(startAmount) > 0 && (
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--aw-green, #3D7A5F)" }}>
            {fmt(num(startAmount))}/month for 20 years at 8% = {fmt(Math.round(compound(num(startAmount), 20, 8)))}. That is your starting point.
          </p>
        )}
      </div>

      {/* When will you start */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-sans)", display: "block", marginBottom: 8 }}>When will you make your first contribution?</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["This week", "This month", "Next month", "Within 90 days"].map((opt) => {
            const sel = commitment === opt;
            return (
              <button key={opt} onClick={() => setCommitment(opt)} style={{
                padding: "8px 18px", borderRadius: 20, fontSize: 13,
                border: `1.5px solid ${sel ? "var(--aw-green, #3D7A5F)" : "var(--aw-border, #E8DDD6)"}`,
                background: sel ? "#E8F3ED" : "white", color: sel ? "var(--aw-green, #3D7A5F)" : "var(--aw-dark-grey)",
                fontWeight: sel ? 600 : 400, cursor: "pointer",
              }}>{opt}</button>
            );
          })}
        </div>
      </div>

      {(barriers.length > 0 || num(startAmount) > 0) && <NavBtn onNext={onNext} onBack={onBack} label="See my summary" />}
    </div>
  );
}

// ─── STEP 6: SUMMARY ───

function Step6({ monthlyAmount, years, rate, safetyLevel, goals, protections, barriers, startAmount, commitment, onBack }) {
  const total = compound(num(monthlyAmount), num(years), num(rate));
  const missing = PROTECTION_ITEMS.filter((p) => p.critical && (protections[p.id] === "no" || protections[p.id] === "unsure"));
  const inPlace = PROTECTION_ITEMS.filter((p) => protections[p.id] === "yes");
  const allGoals = [...(goals.short || []), ...(goals.medium || []), ...(goals.long || [])].filter((g) => g.name);
  const totalMonthly = allGoals.reduce((s, g) => s + num(g.monthly), 0);
  const level = SAFETY_LEVELS.find((l) => l.value === safetyLevel);

  return (
    <div>
      <h3 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)", textAlign: "center" }}>
        Your Saving and Investment Plan
      </h3>

      <FadeIn>
        <div style={{ background: "var(--aw-burg-core)", borderRadius: 16, padding: "28px", color: "white", marginBottom: 24 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <div style={{ flex: "1 1 140px", padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.1)", textAlign: "center" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--aw-font-sans)", opacity: 0.6 }}>Compounding potential</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{fmt(Math.round(total))}</div>
              <div style={{ fontSize: 11, opacity: 0.5 }}>{fmt(num(monthlyAmount))}/mo for {years}yr at {rate}%</div>
            </div>
            <div style={{ flex: "1 1 140px", padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.1)", textAlign: "center" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--aw-font-sans)", opacity: 0.6 }}>Safety net</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{level?.label || "Not assessed"}</div>
            </div>
            <div style={{ flex: "1 1 140px", padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.1)", textAlign: "center" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--aw-font-sans)", opacity: 0.6 }}>Goals set</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{allGoals.length}</div>
              <div style={{ fontSize: 11, opacity: 0.5 }}>{fmt(totalMonthly)}/mo total</div>
            </div>
            <div style={{ flex: "1 1 140px", padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.1)", textAlign: "center" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--aw-font-sans)", opacity: 0.6 }}>Protections</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#4ADE80" }}>{inPlace.length}</div>
              <div style={{ fontSize: 11, opacity: 0.5, color: missing.length > 0 ? "#FCA5A5" : "inherit" }}>{missing.length} critical gap{missing.length !== 1 ? "s" : ""}</div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Goals list */}
      {allGoals.length > 0 && (
        <FadeIn delay={200}>
          <div style={{ background: "white", borderRadius: 16, padding: "24px", border: `1px solid ${"var(--aw-border, #E8DDD6)"}`, marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 14 }}>Your savings goals</div>
            {HORIZONS.map((h) => {
              const hGoals = (goals[h.id] || []).filter((g) => g.name);
              if (hGoals.length === 0) return null;
              return (
                <div key={h.id} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: h.color, textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--aw-font-sans)", marginBottom: 6 }}>{h.icon} {h.label}</div>
                  {hGoals.map((g, i) => (
                    <div key={i} style={{ padding: "8px 14px", borderRadius: 8, background: `${h.color}10`, marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 14, color: "var(--aw-dark-grey)" }}>{g.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: h.color }}>{num(g.monthly) > 0 ? `${fmt(num(g.monthly))}/mo` : ""}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </FadeIn>
      )}

      {/* Commitment */}
      {(num(startAmount) > 0 || commitment) && (
        <FadeIn delay={400}>
          <div style={{ background: "#E8F3ED", borderRadius: 16, padding: "24px", border: `1px solid ${"var(--aw-green, #3D7A5F)"}`, marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-green, #3D7A5F)", marginBottom: 8 }}>Your commitment</div>
            {num(startAmount) > 0 && <p style={{ margin: "0 0 4px", fontSize: 15, color: "var(--aw-dark-grey)" }}>Starting amount: <strong>{fmt(num(startAmount))}/month</strong></p>}
            {commitment && <p style={{ margin: 0, fontSize: 15, color: "var(--aw-dark-grey)" }}>First contribution: <strong>{commitment}</strong></p>}
          </div>
        </FadeIn>
      )}

      {/* Bridge */}
      <FadeIn delay={600}>
        <div style={{ background: "var(--aw-rose-pale)", borderRadius: 16, padding: "24px", borderLeft: `4px solid ${"var(--aw-rose-core)"}`, marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--aw-rose-core)", textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--aw-font-sans)", marginBottom: 8 }}>What comes next</div>
          <p style={{ margin: 0, fontSize: 15, color: "var(--aw-dark-grey)", lineHeight: 1.65, fontFamily: "var(--aw-font-sans)" }}>
            In Part 8, we examine your risk profile: how much volatility you can tolerate, and whether your tolerance is driven by wisdom or by the childhood patterns we uncovered earlier. Understanding your risk profile ensures your investment choices match who you actually are, not who you think you should be.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={800}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 32, gap: 12 }}>
          {onBack && <button onClick={onBack} style={{ padding: "10px 24px", background: "white", color: "var(--aw-burg-core)", border: `1.5px solid ${"var(--aw-burg-core)"}`, borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>&#8592; Back to edit</button>}
          <button style={{ padding: "14px 40px", background: `linear-gradient(135deg, ${"var(--aw-burg-core)"}, ${"var(--aw-rose-core)"})`, color: "white", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: "pointer", boxShadow: `0 4px 20px ${"var(--aw-burg-core)"}33` }}>
            Save and continue to Part 8: My Risk Profile &#8594;
          </button>
          <p style={{ marginTop: 4, fontSize: 13, color: "var(--aw-soft-grey, #A89B94)" }}>Your answers are saved automatically. You can return and edit anytime.</p>
        </div>
      </FadeIn>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */

export default function Section7Saving({ section, answers = {}, onAnswerChange }) {
  const monthlyAmount      = answers.s07_monthly_amount || "";
  const years              = answers.s07_years || 15;
  const rate               = answers.s07_rate || 8;
  const safetyLevel        = answers.s07_safety_level || null;
  const monthlyEssentials  = answers.s07_monthly_essentials || "";
  const survivalReflection = answers.s07_survival_reflection || "";
  const goals              = answers.s07_goals || { short: [{ name: "", target: "", monthly: "", timeframe: "" }], medium: [{ name: "", target: "", monthly: "", timeframe: "" }], long: [{ name: "", target: "", monthly: "", timeframe: "" }] };
  const protections        = answers.s07_protections || {};
  const barriers           = answers.s07_barriers || [];
  const commitment         = answers.s07_commitment || null;
  const startAmount        = answers.s07_start_amount || "";

  const [step, setStep] = useState(0);

  const save = (fieldId, value) => { if (onAnswerChange) onAnswerChange(fieldId, value); };

  const setGoal = (horizon, idx, field, val) => {
    const updated = { ...goals };
    updated[horizon] = [...(goals[horizon] || [])];
    updated[horizon][idx] = { ...updated[horizon][idx], [field]: val };
    save("s07_goals", updated);
  };
  const addGoal = (horizon) => save("s07_goals", { ...goals, [horizon]: [...(goals[horizon] || []), { name: "", target: "", monthly: "", timeframe: "" }] });
  const removeGoal = (horizon, idx) => save("s07_goals", { ...goals, [horizon]: (goals[horizon] || []).filter((_, i) => i !== idx) });
  const setProtection = (id, val) => save("s07_protections", { ...protections, [id]: val });
  const toggleBarrier = (id) => {
    const next = barriers.includes(id) ? barriers.filter(x => x !== id) : [...barriers, id];
    save("s07_barriers", next);
  };

  const goNext = () => setStep(s => s + 1);
  const goBack = () => setStep(s => Math.max(0, s - 1));
  const goToStep = (s) => setStep(s);

  const STEPS = ["Compounding", "Safety net", "Goals", "Protection", "Barriers", "Summary"];

  return (
    <div>
      {/* Section header */}
      <div style={{ marginBottom: 36 }}>
        {section?.part_label && <p style={{ fontFamily: "var(--aw-font-sans)", fontWeight: 700, fontSize: 10, lineHeight: 1.4, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--aw-rose-core)", margin: "0 0 8px" }}>{section.part_label}</p>}
        {section?.heading && <h1 style={{ fontFamily: "var(--aw-font-display)", fontWeight: 400, fontSize: "clamp(34px, 4.6vw, 52px)", lineHeight: 1.05, letterSpacing: "-0.015em", color: "var(--aw-burg-core)", margin: 0 }}>{section.heading}</h1>}
        {section?.intro && <p style={{ fontFamily: "var(--aw-font-sans)", fontWeight: 300, fontSize: 16, lineHeight: 1.85, color: "var(--aw-dark-grey)", margin: "18px 0 0" }}>{section.intro}</p>}
      </div>

      <StepIndicator steps={STEPS} current={step} onStepClick={goToStep} />

      {step === 0 && <Step1 monthlyAmount={monthlyAmount} setMonthlyAmount={(v) => save("s07_monthly_amount", v)} years={years} setYears={(v) => save("s07_years", v)} rate={rate} setRate={(v) => save("s07_rate", v)} onNext={goNext} />}
      {step === 1 && <Step2 safetyLevel={safetyLevel} setSafetyLevel={(v) => save("s07_safety_level", v)} monthlyEssentials={monthlyEssentials} setMonthlyEssentials={(v) => save("s07_monthly_essentials", v)} survivalReflection={survivalReflection} setSurvivalReflection={(v) => save("s07_survival_reflection", v)} onNext={goNext} onBack={goBack} />}
      {step === 2 && <Step3 goals={goals} setGoal={setGoal} addGoal={addGoal} removeGoal={removeGoal} onNext={goNext} onBack={goBack} />}
      {step === 3 && <Step4 protections={protections} setProtection={setProtection} onNext={goNext} onBack={goBack} />}
      {step === 4 && <Step5 barriers={barriers} toggleBarrier={toggleBarrier} commitment={commitment} setCommitment={(v) => save("s07_commitment", v)} startAmount={startAmount} setStartAmount={(v) => save("s07_start_amount", v)} onNext={goNext} onBack={goBack} />}
      {step === 5 && <Step6 monthlyAmount={monthlyAmount} years={years} rate={rate} safetyLevel={safetyLevel} goals={goals} protections={protections} barriers={barriers} startAmount={startAmount} commitment={commitment} onBack={goBack} />}
    </div>
  );
}