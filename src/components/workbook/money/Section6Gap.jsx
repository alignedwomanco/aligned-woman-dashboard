import React, { useState, useEffect } from "react";

/*
  MONEY WORKBOOK - Section 6: The Gap Between Earning and Spending
  
  DATA CONTRACT (field_ids via onAnswerChange):
    s06_income           - object { incomeTypeId: string (numeric) }
    s06_income_stability - string
    s06_expenses         - object { categoryId: string (numeric) }
    s06_leaks            - object { categoryId: "none" | "small" | "significant" | "eliminate" }
    s06_leak_actions     - object { categoryId: string }
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

const num = (v) => parseFloat(v) || 0;
const fmt = (n) => {
  if (n === 0) return "0";
  const abs = Math.abs(n);
  const s = abs >= 1000 ? abs.toLocaleString("en", { maximumFractionDigits: 0 }) : String(abs);
  return n < 0 ? `-${s}` : s;
};

// ─── STEP 1: INCOME REALITY ───

const INCOME_TYPES = [
  { id: "salary", label: "Salary / wages (after tax)", icon: "💼", stable: true },
  { id: "freelance", label: "Freelance / contract / side income", icon: "🔧", stable: false },
  { id: "business", label: "Business income", icon: "📈", stable: false },
  { id: "rental", label: "Rental income", icon: "🏠", stable: true },
  { id: "investments", label: "Investment income / dividends", icon: "📊", stable: true },
  { id: "support", label: "Support payments received (child, spousal)", icon: "🤝", stable: false },
  { id: "government", label: "Government grants or benefits", icon: "🏛️", stable: true },
  { id: "other", label: "Other income", icon: "➕", stable: false },
];

function Step1({ income, setIncome, incomeStability, setIncomeStability, onNext }) {
  const total = INCOME_TYPES.reduce((s, t) => s + num(income[t.id]), 0);
  const activeStreams = INCOME_TYPES.filter((t) => num(income[t.id]) > 0);
  const stableIncome = activeStreams.filter((t) => t.stable).reduce((s, t) => s + num(income[t.id]), 0);
  const variableIncome = total - stableIncome;
  const stabilityRatio = total > 0 ? Math.round((stableIncome / total) * 100) : 0;

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)" }}>
        Your income reality
      </h3>
      <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>
        Before we map your spending, we need an honest picture of what is coming in. Dr. Nasrat noted that some people earn a stable salary while others have volatile business income. Your income pattern affects every financial decision you make.
      </p>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontFamily: "var(--aw-font-sans)" }}>
        Enter your average monthly amount for each income source. Use after-tax figures. If an income varies, use your average over the last 6 months.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {INCOME_TYPES.map((t) => {
          const val = income[t.id] || "";
          const hasVal = num(val) > 0;
          return (
            <div key={t.id} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
              borderRadius: 8, background: "white", border: `1px solid ${hasVal ? "var(--aw-green, #3D7A5F)" : "var(--aw-border, #E8DDD6)"}`,
            }}>
              <span style={{ fontSize: 20 }}>{t.icon}</span>
              <span style={{ flex: 1, fontSize: 14, color: "var(--aw-dark-grey)" }}>{t.label}</span>
              <input type="text" value={val}
                onChange={(e) => setIncome(t.id, e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="0"
                style={{
                  width: 120, padding: "6px 10px", border: `1px solid ${"var(--aw-border, #E8DDD6)"}`, borderRadius: 6,
                  fontSize: 14, color: "var(--aw-dark-grey)", textAlign: "right", boxSizing: "border-box",
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--aw-green, #3D7A5F)"}
                onBlur={(e) => e.target.style.borderColor = "var(--aw-border, #E8DDD6)"}
              />
            </div>
          );
        })}
      </div>

      {/* Live total */}
      {total > 0 && (
        <FadeIn>
          <div style={{
            marginTop: 20, padding: "20px", borderRadius: 12,
            background: "var(--aw-burg-core)", color: "white",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "var(--aw-font-sans)", opacity: 0.6 }}>Total monthly income</div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{fmt(total)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "var(--aw-font-sans)", opacity: 0.6 }}>Income streams</div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{activeStreams.length}</div>
              </div>
            </div>

            {/* Stability bar */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
                <span>Stable income: {fmt(stableIncome)} ({stabilityRatio}%)</span>
                <span>Variable income: {fmt(variableIncome)} ({100 - stabilityRatio}%)</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.15)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${stabilityRatio}%`, background: "#4ADE80", borderRadius: 4, transition: "width 0.4s" }} />
              </div>
            </div>

            {stabilityRatio < 50 && (
              <p style={{ margin: "12px 0 0", fontSize: 13, opacity: 0.8, lineHeight: 1.5 }}>
                More than half your income is variable. This means your expense planning needs a wider safety margin. Dr. Nasrat noted that business owners with volatile income may need to see their financial planner more often.
              </p>
            )}
          </div>
        </FadeIn>
      )}

      {/* Stability question */}
      {total > 0 && (
        <FadeIn delay={200}>
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 8 }}>
              How stable has your income been over the last 12 months?
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Very stable", "Mostly stable with occasional dips", "Unpredictable", "Declining", "Growing"].map((opt) => {
                const sel = incomeStability === opt;
                return (
                  <button key={opt} onClick={() => setIncomeStability(opt)}
                    style={{
                      padding: "8px 16px", borderRadius: 20, fontSize: 13,
                      border: `1.5px solid ${sel ? "var(--aw-burg-core)" : "var(--aw-border, #E8DDD6)"}`,
                      background: sel ? "var(--aw-rose-pale)" : "white", color: sel ? "var(--aw-burg-core)" : "var(--aw-dark-grey)",
                      fontWeight: sel ? 600 : 400, cursor: "pointer",
                    }}>{opt}</button>
                );
              })}
            </div>
          </div>
        </FadeIn>
      )}


    </div>
  );
}

// ─── STEP 2: EXPENSE MAPPING ───

const EXPENSE_CATEGORIES = [
  { id: "housing", label: "Housing (rent / mortgage)", icon: "🏠", fixed: true, essential: true },
  { id: "utilities", label: "Utilities (electricity, water, internet, phone)", icon: "💡", fixed: true, essential: true },
  { id: "transport", label: "Transport (fuel, car payment, insurance, public transit)", icon: "🚗", fixed: true, essential: true },
  { id: "food", label: "Groceries and household essentials", icon: "🛒", fixed: false, essential: true },
  { id: "debt", label: "Debt repayments (credit cards, loans, store accounts)", icon: "💳", fixed: true, essential: true },
  { id: "insurance", label: "Insurance (life, medical, disability)", icon: "🛡️", fixed: true, essential: true },
  { id: "children", label: "Children (school fees, activities, care, clothing)", icon: "👶", fixed: false, essential: true },
  { id: "healthcare", label: "Healthcare (medical aid, prescriptions, appointments)", icon: "🏥", fixed: true, essential: true },
  { id: "dining", label: "Eating out and takeaways", icon: "🍽️", fixed: false, essential: false },
  { id: "personal", label: "Personal spending (clothing, beauty, grooming)", icon: "👗", fixed: false, essential: false },
  { id: "subscriptions", label: "Subscriptions and memberships", icon: "📱", fixed: true, essential: false },
  { id: "entertainment", label: "Entertainment (events, hobbies, streaming)", icon: "🎬", fixed: false, essential: false },
  { id: "gifts", label: "Gifts and financial support for others", icon: "🎁", fixed: false, essential: false },
  { id: "savings", label: "Savings and investments (existing contributions)", icon: "📈", fixed: true, essential: true },
  { id: "other", label: "Other / unaccounted spending", icon: "❓", fixed: false, essential: false },
];

function Step2({ expenses, setExpense, income, onNext, onBack }) {
  const totalIncome = INCOME_TYPES.reduce((s, t) => s + num(income[t.id]), 0);
  const totalExpenses = EXPENSE_CATEGORIES.reduce((s, c) => s + num(expenses[c.id]), 0);
  const gap = totalIncome - totalExpenses;
  const filledCount = EXPENSE_CATEGORIES.filter((c) => num(expenses[c.id]) > 0).length;

  const essentialTotal = EXPENSE_CATEGORIES.filter((c) => c.essential).reduce((s, c) => s + num(expenses[c.id]), 0);
  const discretionaryTotal = EXPENSE_CATEGORIES.filter((c) => !c.essential).reduce((s, c) => s + num(expenses[c.id]), 0);
  const fixedTotal = EXPENSE_CATEGORIES.filter((c) => c.fixed).reduce((s, c) => s + num(expenses[c.id]), 0);
  const variableTotal = totalExpenses - fixedTotal;

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)" }}>
        Where your money goes
      </h3>
      <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>
        This is the exercise most people avoid. Writing down what you actually spend, category by category, is uncomfortable. It is also the single most powerful thing you can do for your financial confidence.
      </p>
      <div style={{
        margin: "0 0 24px", padding: "12px 16px", borderRadius: 8, background: "var(--aw-rose-pale)",
        fontSize: 13, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontFamily: "var(--aw-font-sans)",
      }}>
        <strong style={{ color: "var(--aw-burg-core)" }}>Use your best estimate.</strong> Check your bank statement or app if you can. If not, round numbers are fine. Accuracy matters less than honesty. The goal is to see the pattern, not to get the exact total.
      </div>

      {/* Sticky income reference */}
      <div style={{
        padding: "10px 14px", borderRadius: 8, background: "white",
        border: `1px solid ${"var(--aw-green, #3D7A5F)"}`, marginBottom: 20,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontSize: 13, color: "var(--aw-green, #3D7A5F)", fontWeight: 600 }}>Your monthly income</span>
        <span style={{ fontSize: 16, fontWeight: 700, color: "var(--aw-green, #3D7A5F)" }}>{fmt(totalIncome)}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {EXPENSE_CATEGORIES.map((c) => {
          const val = expenses[c.id] || "";
          const hasVal = num(val) > 0;
          return (
            <div key={c.id} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
              borderRadius: 8, background: "white", border: `1px solid ${hasVal ? (c.essential ? "var(--aw-amber, #B8860B)" : "var(--aw-rose-core)") : "var(--aw-border, #E8DDD6)"}`,
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{c.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.3 }}>{c.label}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
                  <span style={{
                    fontSize: 10, padding: "1px 6px", borderRadius: 8,
                    background: c.essential ? "#FDF3E0" : "var(--aw-rose-pale)",
                    color: c.essential ? "var(--aw-amber, #B8860B)" : "var(--aw-rose-core)", fontWeight: 600,
                  }}>{c.essential ? "Essential" : "Discretionary"}</span>
                  <span style={{
                    fontSize: 10, padding: "1px 6px", borderRadius: 8,
                    background: "#F0F0F0", color: "var(--aw-soft-grey, #A89B94)", fontWeight: 600,
                  }}>{c.fixed ? "Fixed" : "Variable"}</span>
                </div>
              </div>
              <input type="text" value={val}
                onChange={(e) => setExpense(c.id, e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="0"
                style={{
                  width: 110, padding: "6px 10px", border: `1px solid ${"var(--aw-border, #E8DDD6)"}`, borderRadius: 6,
                  fontSize: 14, color: "var(--aw-dark-grey)", textAlign: "right", boxSizing: "border-box", flexShrink: 0,
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--aw-burg-core)"}
                onBlur={(e) => e.target.style.borderColor = "var(--aw-border, #E8DDD6)"}
              />
            </div>
          );
        })}
      </div>

      {/* Live dashboard */}
      {filledCount >= 3 && (
        <FadeIn>
          <div style={{
            marginTop: 20, padding: "20px", borderRadius: 12,
            background: gap >= 0 ? "var(--aw-burg-core)" : "var(--aw-red, #A23B3B)", color: "white",
          }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
              <div style={{ flex: "1 1 120px" }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--aw-font-sans)", opacity: 0.6 }}>Income</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#4ADE80" }}>{fmt(totalIncome)}</div>
              </div>
              <div style={{ flex: "1 1 120px" }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--aw-font-sans)", opacity: 0.6 }}>Expenses</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{fmt(totalExpenses)}</div>
              </div>
              <div style={{ flex: "1 1 120px" }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--aw-font-sans)", opacity: 0.6 }}>The gap</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: gap >= 0 ? "#4ADE80" : "#FCA5A5" }}>
                  {gap >= 0 ? "+" : ""}{fmt(gap)}
                </div>
              </div>
            </div>

            {/* Breakdown bar */}
            {totalExpenses > 0 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, opacity: 0.7, marginBottom: 4 }}>
                  <span>Essential: {fmt(essentialTotal)} ({Math.round((essentialTotal / totalExpenses) * 100)}%)</span>
                  <span>Discretionary: {fmt(discretionaryTotal)} ({Math.round((discretionaryTotal / totalExpenses) * 100)}%)</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.15)", overflow: "hidden", display: "flex" }}>
                  <div style={{ height: "100%", width: `${(essentialTotal / totalExpenses) * 100}%`, background: "var(--aw-amber, #B8860B)", transition: "width 0.4s" }} />
                  <div style={{ height: "100%", width: `${(discretionaryTotal / totalExpenses) * 100}%`, background: "var(--aw-rose-core)", transition: "width 0.4s" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, opacity: 0.7, marginTop: 6 }}>
                  <span>Fixed: {fmt(fixedTotal)}</span>
                  <span>Variable: {fmt(variableTotal)}</span>
                </div>
              </div>
            )}
          </div>
        </FadeIn>
      )}


    </div>
  );
}

// ─── STEP 3: THE GAP DIAGNOSTIC ───

function Step3({ income, expenses, onNext, onBack }) {
  const totalIncome = INCOME_TYPES.reduce((s, t) => s + num(income[t.id]), 0);
  const totalExpenses = EXPENSE_CATEGORIES.reduce((s, c) => s + num(expenses[c.id]), 0);
  const gap = totalIncome - totalExpenses;
  const gapPercent = totalIncome > 0 ? Math.round((gap / totalIncome) * 100) : 0;

  const essentialTotal = EXPENSE_CATEGORIES.filter((c) => c.essential).reduce((s, c) => s + num(expenses[c.id]), 0);
  const discretionaryTotal = EXPENSE_CATEGORIES.filter((c) => !c.essential).reduce((s, c) => s + num(expenses[c.id]), 0);
  const debtTotal = num(expenses.debt);
  const savingsTotal = num(expenses.savings);

  // Diagnostics
  const diagnostics = [];
  if (gap < 0) diagnostics.push({ severity: "critical", msg: "You are spending more than you earn. Every month in this position adds to your debt. This is the first thing to address.", icon: "🔴" });
  else if (gapPercent < 5) diagnostics.push({ severity: "warning", msg: "Your gap is razor-thin. One unexpected expense could push you into deficit. Building even a small buffer is your immediate priority.", icon: "🟠" });
  else if (gapPercent < 15) diagnostics.push({ severity: "moderate", msg: "You have a gap, but it is modest. The 50/30/20 guideline suggests 20% to savings. You are not there yet, but you have room to work with.", icon: "🟡" });
  else if (gapPercent < 25) diagnostics.push({ severity: "good", msg: "You have a healthy gap. The question now is whether this gap is being directed intentionally into savings, investments, and goals, or whether it is leaking into untracked spending.", icon: "🟢" });
  else diagnostics.push({ severity: "strong", msg: "Your gap is strong. You have significant capacity to build wealth. Part 7 will help you direct this gap with intention across short, medium, and long-term goals.", icon: "🟢" });

  if (debtTotal > 0 && totalIncome > 0) {
    const debtRatio = Math.round((debtTotal / totalIncome) * 100);
    if (debtRatio > 30) diagnostics.push({ severity: "critical", msg: `Debt repayments consume ${debtRatio}% of your income. Above 30% is a danger zone. Debt reduction should be your primary financial goal right now.`, icon: "🔴" });
    else if (debtRatio > 15) diagnostics.push({ severity: "warning", msg: `Debt repayments take ${debtRatio}% of your income. This is manageable but significant. Every percentage point freed from debt is a percentage point available for building wealth.`, icon: "🟠" });
  }

  if (savingsTotal === 0 || !expenses.savings) {
    diagnostics.push({ severity: "warning", msg: "No savings or investment contributions appear in your expenses. If you are not paying yourself first, everything else in your financial life is built on an unstable foundation.", icon: "🟠" });
  } else if (totalIncome > 0) {
    const savingsRate = Math.round((savingsTotal / totalIncome) * 100);
    if (savingsRate >= 15) diagnostics.push({ severity: "good", msg: `You are saving ${savingsRate}% of your income. This is above average and building real long-term security.`, icon: "🟢" });
  }

  if (discretionaryTotal > essentialTotal * 0.6 && discretionaryTotal > 0) {
    diagnostics.push({ severity: "moderate", msg: "Your discretionary spending is high relative to your essentials. This is where most of your flexibility lives. Small reductions here compound into significant savings over time.", icon: "🟡" });
  }

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)" }}>
        Your gap diagnostic
      </h3>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>
        Dr. Nasrat's central teaching: security comes from the gap between earning and spending. Not from income alone. This is your gap, and what it means.
      </p>

      {/* The gap visual */}
      <FadeIn>
        <div style={{
          padding: "28px", borderRadius: 16, textAlign: "center", marginBottom: 24,
          background: gap >= 0 ? "var(--aw-burg-core)" : "var(--aw-red, #A23B3B)", color: "white",
        }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, fontFamily: "var(--aw-font-sans)", opacity: 0.6, marginBottom: 4 }}>Your freedom number</div>
          <div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.1 }}>
            {gap >= 0 ? "+" : ""}{fmt(gap)}
          </div>
          <div style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>per month</div>
          {totalIncome > 0 && (
            <div style={{ fontSize: 13, opacity: 0.6, marginTop: 8 }}>
              {gapPercent >= 0 ? gapPercent : Math.abs(gapPercent)}% of your income
              {gap >= 0 ? " available" : " in deficit"}
            </div>
          )}

          {/* Visual bar */}
          <div style={{ maxWidth: 400, margin: "20px auto 0" }}>
            <div style={{ height: 12, borderRadius: 6, background: "rgba(255,255,255,0.15)", overflow: "hidden", position: "relative" }}>
              {totalIncome > 0 && (
                <div style={{
                  height: "100%", borderRadius: 6, transition: "width 0.6s ease",
                  width: `${Math.min(100, (totalExpenses / totalIncome) * 100)}%`,
                  background: totalExpenses > totalIncome ? "#FCA5A5" : totalExpenses > totalIncome * 0.85 ? "var(--aw-amber, #B8860B)" : "#4ADE80",
                }} />
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, opacity: 0.6, marginTop: 4 }}>
              <span>0%</span>
              <span>Expenses as % of income</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Diagnostics */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {diagnostics.map((d, i) => {
          const colors = {
            critical: { bg: "#FDEAEA", border: "var(--aw-red, #A23B3B)", text: "var(--aw-red, #A23B3B)" },
            warning: { bg: "#FDF3E0", border: "var(--aw-amber, #B8860B)", text: "var(--aw-amber, #B8860B)" },
            moderate: { bg: "#FDF3E0", border: "var(--aw-amber, #B8860B)", text: "var(--aw-amber, #B8860B)" },
            good: { bg: "#E8F3ED", border: "var(--aw-green, #3D7A5F)", text: "var(--aw-green, #3D7A5F)" },
            strong: { bg: "#E8F3ED", border: "var(--aw-green, #3D7A5F)", text: "var(--aw-green, #3D7A5F)" },
          }[d.severity];
          return (
            <FadeIn key={i} delay={200 + i * 150}>
              <div style={{
                padding: "14px 18px", borderRadius: 10,
                background: colors.bg, borderLeft: `4px solid ${colors.border}`,
              }}>
                <p style={{ margin: 0, fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontFamily: "var(--aw-font-sans)" }}>
                  <span style={{ marginRight: 6 }}>{d.icon}</span> {d.msg}
                </p>
              </div>
            </FadeIn>
          );
        })}
      </div>


    </div>
  );
}

// ─── STEP 4: THE LEAK FINDER ───

function Step4({ expenses, leaks, setLeak, leakActions, setLeakAction, onNext, onBack }) {
  // Identify discretionary and variable expenses as potential leaks
  const discretionary = EXPENSE_CATEGORIES
    .filter((c) => !c.essential && num(expenses[c.id]) > 0)
    .sort((a, b) => num(expenses[b.id]) - num(expenses[a.id]));

  const variableEssentials = EXPENSE_CATEGORIES
    .filter((c) => c.essential && !c.fixed && num(expenses[c.id]) > 0);

  const allLeakable = [...discretionary, ...variableEssentials];

  const REDUCTION_OPTIONS = [
    { value: "none", label: "Cannot reduce", color: "var(--aw-soft-grey, #A89B94)" },
    { value: "small", label: "Could trim 10-20%", color: "var(--aw-amber, #B8860B)" },
    { value: "significant", label: "Could cut 30-50%", color: "var(--aw-rose-core)" },
    { value: "eliminate", label: "Could eliminate", color: "var(--aw-red, #A23B3B)" },
  ];

  const totalSaveable = allLeakable.reduce((sum, c) => {
    const red = leaks[c.id];
    const amount = num(expenses[c.id]);
    if (red === "small") return sum + amount * 0.15;
    if (red === "significant") return sum + amount * 0.4;
    if (red === "eliminate") return sum + amount;
    return sum;
  }, 0);

  const ratedCount = Object.keys(leaks).length;

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)" }}>
        The leak finder
      </h3>
      <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>
        Dr. Nasrat is clear: this is not about deprivation. Deprivation creates a scarcity mindset and fuels the very spending it is trying to prevent. This is about finding leaks: money that leaves your account without creating proportional value in your life.
      </p>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontFamily: "var(--aw-font-sans)" }}>
        For each discretionary and variable category, honestly assess: could you reduce this without feeling deprived?
      </p>

      {allLeakable.length === 0 ? (
        <p style={{ fontSize: 14, color: "var(--aw-dark-grey)", fontStyle: "italic" }}>No discretionary or variable expenses recorded. Go back to Step 2 to add your spending categories.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {allLeakable.map((c) => {
            const amount = num(expenses[c.id]);
            const reduction = leaks[c.id];
            return (
              <div key={c.id} style={{
                borderRadius: 10, border: `1px solid ${"var(--aw-border, #E8DDD6)"}`, background: "white", padding: "14px 18px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{c.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-sans)" }}>{c.label}</span>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "var(--aw-burg-core)" }}>{fmt(amount)}/mo</span>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {REDUCTION_OPTIONS.map((opt) => {
                    const sel = reduction === opt.value;
                    return (
                      <button key={opt.value} onClick={() => setLeak(c.id, opt.value)}
                        style={{
                          padding: "6px 12px", borderRadius: 16, fontSize: 12, fontWeight: sel ? 600 : 400,
                          border: `1.5px solid ${sel ? opt.color : "var(--aw-border, #E8DDD6)"}`,
                          background: sel ? `${opt.color}15` : "white", color: sel ? opt.color : "var(--aw-dark-grey)",
                          cursor: "pointer",
                        }}>{opt.label}</button>
                    );
                  })}
                </div>

                {(reduction === "significant" || reduction === "eliminate") && (
                  <FadeIn>
                    <div style={{ marginTop: 10 }}>
                      <label style={{ fontSize: 13, color: "var(--aw-dark-grey)", display: "block", marginBottom: 4 }}>
                        What would you do instead, or what would make this cut sustainable?
                      </label>
                      <input type="text" value={leakActions[c.id] || ""}
                        onChange={(e) => setLeakAction(c.id, e.target.value)}
                        placeholder="e.g. cook at home 3 nights instead of 1, cancel unused gym, switch to a cheaper plan"
                        style={{
                          width: "100%", padding: "8px 12px", border: `1px solid ${"var(--aw-border, #E8DDD6)"}`, borderRadius: 6,
                          fontSize: 13, color: "var(--aw-dark-grey)", boxSizing: "border-box",
                        }}
                        onFocus={(e) => e.target.style.borderColor = "var(--aw-burg-core)"}
                        onBlur={(e) => e.target.style.borderColor = "var(--aw-border, #E8DDD6)"}
                      />
                    </div>
                  </FadeIn>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Potential savings */}
      {ratedCount >= Math.min(1, allLeakable.length) && totalSaveable > 0 && (
        <FadeIn>
          <div style={{
            marginTop: 24, padding: "20px", borderRadius: 12,
            background: "#E8F3ED", border: `1.5px solid ${"var(--aw-green, #3D7A5F)"}`,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-green, #3D7A5F)", marginBottom: 6 }}>
              Potential monthly savings identified
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--aw-green, #3D7A5F)" }}>{fmt(Math.round(totalSaveable))}/month</div>
            <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontFamily: "var(--aw-font-sans)" }}>
              That is {fmt(Math.round(totalSaveable * 12))}/year. Compounded over 10 years at 8% average return, that becomes approximately {fmt(Math.round(totalSaveable * 12 * 14.5))}. Small changes compound.
            </p>
          </div>
        </FadeIn>
      )}


    </div>
  );
}

// ─── STEP 5: SUMMARY ───

function Step5({ income, expenses, incomeStability, leaks, leakActions, onBack }) {
  const totalIncome = INCOME_TYPES.reduce((s, t) => s + num(income[t.id]), 0);
  const totalExpenses = EXPENSE_CATEGORIES.reduce((s, c) => s + num(expenses[c.id]), 0);
  const gap = totalIncome - totalExpenses;
  const gapPercent = totalIncome > 0 ? Math.round((gap / totalIncome) * 100) : 0;

  const essentialTotal = EXPENSE_CATEGORIES.filter((c) => c.essential).reduce((s, c) => s + num(expenses[c.id]), 0);
  const discretionaryTotal = EXPENSE_CATEGORIES.filter((c) => !c.essential).reduce((s, c) => s + num(expenses[c.id]), 0);
  const debtTotal = num(expenses.debt);
  const savingsTotal = num(expenses.savings);

  const totalSaveable = EXPENSE_CATEGORIES.reduce((sum, c) => {
    const red = leaks[c.id];
    const amount = num(expenses[c.id]);
    if (red === "small") return sum + amount * 0.15;
    if (red === "significant") return sum + amount * 0.4;
    if (red === "eliminate") return sum + amount;
    return sum;
  }, 0);

  const newGap = gap + totalSaveable;

  const topCuts = EXPENSE_CATEGORIES
    .filter((c) => leaks[c.id] && leaks[c.id] !== "none")
    .map((c) => {
      const amount = num(expenses[c.id]);
      const red = leaks[c.id];
      const saved = red === "small" ? amount * 0.15 : red === "significant" ? amount * 0.4 : amount;
      return { ...c, saved, action: leakActions[c.id], reduction: red };
    })
    .sort((a, b) => b.saved - a.saved)
    .slice(0, 5);

  return (
    <div>
      <h3 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)", textAlign: "center" }}>
        Your Financial Gap Report
      </h3>

      {/* Main dashboard */}
      <FadeIn>
        <div style={{ background: "var(--aw-burg-core)", borderRadius: 16, padding: "28px", color: "white", marginBottom: 24 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: "1 1 140px", padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.1)", textAlign: "center" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--aw-font-sans)", opacity: 0.6 }}>Income</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#4ADE80" }}>{fmt(totalIncome)}</div>
            </div>
            <div style={{ flex: "1 1 140px", padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.1)", textAlign: "center" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--aw-font-sans)", opacity: 0.6 }}>Expenses</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{fmt(totalExpenses)}</div>
            </div>
            <div style={{ flex: "1 1 140px", padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.1)", textAlign: "center" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--aw-font-sans)", opacity: 0.6 }}>Current gap</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: gap >= 0 ? "#4ADE80" : "#FCA5A5" }}>{gap >= 0 ? "+" : ""}{fmt(gap)}</div>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <div style={{ flex: "1 1 100px", padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.06)", textAlign: "center" }}>
              <div style={{ fontSize: 10, opacity: 0.5 }}>Essential</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{fmt(essentialTotal)}</div>
            </div>
            <div style={{ flex: "1 1 100px", padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.06)", textAlign: "center" }}>
              <div style={{ fontSize: 10, opacity: 0.5 }}>Discretionary</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{fmt(discretionaryTotal)}</div>
            </div>
            <div style={{ flex: "1 1 100px", padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.06)", textAlign: "center" }}>
              <div style={{ fontSize: 10, opacity: 0.5 }}>Debt payments</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{fmt(debtTotal)}</div>
            </div>
            <div style={{ flex: "1 1 100px", padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.06)", textAlign: "center" }}>
              <div style={{ fontSize: 10, opacity: 0.5 }}>Savings</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{fmt(savingsTotal)}</div>
            </div>
          </div>

          {incomeStability && (
            <div style={{ marginTop: 12, fontSize: 12, opacity: 0.6 }}>Income stability: {incomeStability}</div>
          )}
        </div>
      </FadeIn>

      {/* Leak recovery plan */}
      {topCuts.length > 0 && (
        <FadeIn delay={200}>
          <div style={{ background: "white", borderRadius: 16, padding: "24px", border: `1px solid ${"var(--aw-border, #E8DDD6)"}`, marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 14 }}>Your top spending reductions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {topCuts.map((cut) => (
                <div key={cut.id} style={{
                  padding: "10px 14px", borderRadius: 8, background: "#E8F3ED",
                  display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8,
                }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 500, color: "var(--aw-dark-grey)" }}>{cut.icon} {cut.label}</span>
                    {cut.action && <div style={{ fontSize: 12, color: "var(--aw-dark-grey)", marginTop: 2 }}>Plan: {cut.action}</div>}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--aw-green, #3D7A5F)" }}>Save ~{fmt(Math.round(cut.saved))}/mo</span>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 16, padding: "14px", borderRadius: 10,
              background: "var(--aw-green, #3D7A5F)", color: "white", textAlign: "center",
            }}>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--aw-font-sans)", opacity: 0.8, marginBottom: 4 }}>Potential new gap after reductions</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{newGap >= 0 ? "+" : ""}{fmt(Math.round(newGap))}/month</div>
            </div>
          </div>
        </FadeIn>
      )}

      {/* Bridge */}
      <FadeIn delay={400}>
        <div style={{
          background: "var(--aw-rose-pale)", borderRadius: 16, padding: "24px", borderLeft: `4px solid ${"var(--aw-rose-core)"}`, marginBottom: 24,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--aw-rose-core)", textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--aw-font-sans)", marginBottom: 8 }}>What comes next</div>
          <p style={{ margin: 0, fontSize: 15, color: "var(--aw-dark-grey)", lineHeight: 1.65, fontFamily: "var(--aw-font-sans)" }}>
            You now know your freedom number and where the leaks are. In Part 7, we take that gap and give it purpose: building an emergency fund, setting savings goals across three time horizons, and understanding what compounding can do with even modest consistent contributions.
          </p>
        </div>
      </FadeIn>


    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */

export default function Section6Gap({ section, answers = {}, onAnswerChange }) {
  const income          = answers.s06_income || {};
  const incomeStability = answers.s06_income_stability || null;
  const expenses        = answers.s06_expenses || {};
  const leaks           = answers.s06_leaks || {};
  const leakActions     = answers.s06_leak_actions || {};

  const [step, setStep] = useState(0);

  const save = (fieldId, value) => { if (onAnswerChange) onAnswerChange(fieldId, value); };

  const setIncome = (id, val) => save("s06_income", { ...income, [id]: val });
  const setExpense = (id, val) => save("s06_expenses", { ...expenses, [id]: val });
  const setLeak = (id, val) => save("s06_leaks", { ...leaks, [id]: val });
  const setLeakAction = (id, val) => save("s06_leak_actions", { ...leakActions, [id]: val });

  const goNext = () => setStep(s => s + 1);
  const goBack = () => setStep(s => Math.max(0, s - 1));
  const goToStep = (s) => setStep(s);

  const STEPS = ["Income", "Expenses", "Gap diagnostic", "Leak finder", "Summary"];

  return (
    <div>
      {/* Section header */}
      <div style={{ marginBottom: 36 }}>
        {section?.part_label && <p style={{ fontFamily: "var(--aw-font-sans)", fontWeight: 700, fontSize: 10, lineHeight: 1.4, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--aw-rose-core)", margin: "0 0 8px" }}>{section.part_label}</p>}
        {section?.heading && <h1 style={{ fontFamily: "var(--aw-font-display)", fontWeight: 400, fontSize: "clamp(34px, 4.6vw, 52px)", lineHeight: 1.05, letterSpacing: "-0.015em", color: "var(--aw-burg-core)", margin: 0 }}>{section.heading}</h1>}
        {section?.intro && <p style={{ fontFamily: "var(--aw-font-sans)", fontWeight: 300, fontSize: 16, lineHeight: 1.85, color: "var(--aw-dark-grey)", margin: "18px 0 0" }}>{section.intro}</p>}
      </div>

      <StepIndicator steps={STEPS} current={step} onStepClick={goToStep} />

      {step === 0 && <Step1 income={income} setIncome={setIncome} incomeStability={incomeStability} setIncomeStability={(v) => save("s06_income_stability", v)} onNext={goNext} />}
      {step === 1 && <Step2 expenses={expenses} setExpense={setExpense} income={income} onNext={goNext} onBack={goBack} />}
      {step === 2 && <Step3 income={income} expenses={expenses} onNext={goNext} onBack={goBack} />}
      {step === 3 && <Step4 expenses={expenses} leaks={leaks} setLeak={setLeak} leakActions={leakActions} setLeakAction={setLeakAction} onNext={goNext} onBack={goBack} />}
      {step === 4 && <Step5 income={income} expenses={expenses} incomeStability={incomeStability} leaks={leaks} leakActions={leakActions} onBack={goBack} />}
    </div>
  );
}