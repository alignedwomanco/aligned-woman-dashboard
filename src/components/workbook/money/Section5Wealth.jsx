import React, { useState, useEffect } from "react";

/*
  MONEY WORKBOOK - Section 5: Wealth vs. Visible Spending
  
  DATA CONTRACT (field_ids via onAnswerChange):
    s05_guesses             - object { scenarioId: "Person A" | "Person B" }
    s05_revealed            - array of scenario ids
    s05_audit               - object { categoryId: { classification, purpose } }
    s05_visibility          - object { questionId: "yes" | "sometimes" | "no" }
    s05_assets              - object { assetId: string (numeric) }
    s05_liabilities         - object { liabilityId: string (numeric) }
    s05_net_worth_reflection - string
    s05_wealth_definition   - string
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

// ─── STEP 1: THE WEALTH ILLUSION TEST ───

const ILLUSION_SCENARIOS = [
  {
    id: "il1",
    personA: { desc: "Drives a new BMW 3 Series, wears designer clothes, lives in a trendy apartment, posts travel photos regularly", label: "Person A" },
    personB: { desc: "Drives a 10-year-old Toyota, shops at Pick n Pay Clothing, owns a modest townhouse, rarely posts on social media", label: "Person B" },
    reveal: "Person A earns 45,000/month, has 180,000 in credit card debt, no savings, and a car payment of 9,500/month. Person B earns 38,000/month, has zero debt, 420,000 in investments, a fully paid-off home, and saves 8,000/month. Person B is significantly wealthier.",
    lesson: "Dr. Nasrat said it plainly: the person driving the tiny car might actually be richer than the person who sparkles. Wealth is invisible. People cannot see your savings, your investments, or your flexibility.",
  },
  {
    id: "il2",
    personA: { desc: "Recently upgraded to a luxury handbag collection worth 80,000, takes the family to upscale restaurants weekly", label: "Person A" },
    personB: { desc: "Carries the same bag for three years, cooks most meals at home, puts 3,000/month into a tax-free savings account", label: "Person B" },
    reveal: "In 20 years, Person B's 3,000/month at 10% average return becomes approximately 2.3 million. Person A's handbag collection is worth perhaps 15,000 at resale. That is the power of compounding that Dr. Nasrat teaches: it rewards patience, not display.",
    lesson: "Every unit of currency spent on a depreciating status item is a unit that will never compound. This is not about deprivation. It is about understanding what you are actually trading when you choose visible spending over invisible wealth.",
  },
  {
    id: "il3",
    personA: { desc: "Earns 120,000/month, spends 150,000/month, finances the gap with credit", label: "Person A" },
    personB: { desc: "Earns 50,000/month, spends 35,000/month, invests the 15,000 difference every month", label: "Person B" },
    reveal: "Person A is technically in crisis despite a high income. Person B has a 30% savings rate and is building real security. Income is not wealth. The gap between earning and spending is wealth.",
    lesson: "Dr. Nasrat's core lesson: security comes from the gap between earning and spending, not from high income alone. If you earn 100 and spend 80, you have 20 of freedom. If you earn 100 and spend 150, you have 50 of stress.",
  },
];

function Step1({ guesses, setGuess, revealed, setRevealed, onNext }) {
  const allRevealed = ILLUSION_SCENARIOS.every((s) => revealed.includes(s.id));

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)" }}>
        The wealth illusion test
      </h3>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>
        Dr. Nasrat taught that most people confuse visible spending with wealth. Before we examine your own spending, test your instincts. In each scenario below, who do you think is wealthier?
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {ILLUSION_SCENARIOS.map((sc, idx) => {
          const guess = guesses[sc.id];
          const isRevealed = revealed.includes(sc.id);
          return (
            <div key={sc.id} style={{
              borderRadius: 12, border: `1.5px solid ${isRevealed ? "var(--aw-green, #3D7A5F)" : "var(--aw-border, #E8DDD6)"}`,
              background: "white", overflow: "hidden",
            }}>
              <div style={{ padding: "16px 18px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--aw-burg-core)", textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--aw-font-sans)", marginBottom: 14 }}>
                  Scenario {idx + 1}
                </div>

                <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                  {[sc.personA, sc.personB].map((person) => {
                    const sel = guess === person.label;
                    return (
                      <button key={person.label} onClick={() => !isRevealed && setGuess(sc.id, person.label)}
                        style={{
                          flex: "1 1 240px", textAlign: "left", padding: "14px 16px", borderRadius: 10,
                          border: `1.5px solid ${sel ? "var(--aw-burg-core)" : "var(--aw-border, #E8DDD6)"}`,
                          background: sel ? "var(--aw-rose-pale)" : "white",
                          cursor: isRevealed ? "default" : "pointer", transition: "all 0.2s",
                        }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: sel ? "var(--aw-burg-core)" : "var(--aw-dark-grey)", marginBottom: 6 }}>
                          {person.label}
                        </div>
                        <div style={{ fontSize: 13, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontFamily: "var(--aw-font-sans)" }}>{person.desc}</div>
                      </button>
                    );
                  })}
                </div>

                {guess && !isRevealed && (
                  <FadeIn>
                    <button onClick={() => setRevealed([...revealed, sc.id])}
                      style={{
                        padding: "8px 20px", borderRadius: 8, background: "var(--aw-burg-core)", color: "white",
                        border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                      }}>Reveal the answer</button>
                  </FadeIn>
                )}
              </div>

              {isRevealed && (
                <FadeIn>
                  <div style={{ borderTop: `1px solid ${"var(--aw-border, #E8DDD6)"}` }}>
                    <div style={{ padding: "16px 18px", background: "#E8F3ED" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--aw-green, #3D7A5F)", marginBottom: 6 }}>The reality</div>
                      <p style={{ margin: "0 0 12px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontFamily: "var(--aw-font-sans)" }}>{sc.reveal}</p>
                      <p style={{ margin: 0, fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>{sc.lesson}</p>
                    </div>
                  </div>
                </FadeIn>
              )}
            </div>
          );
        })}
      </div>


    </div>
  );
}

// ─── STEP 2: YOUR SPENDING AUDIT ───

const SPENDING_CATEGORIES = [
  { id: "car", label: "Car / vehicle", default_class: "depreciating", default_type: "need" },
  { id: "housing", label: "Home (rent or bond)", default_class: "varies", default_type: "need" },
  { id: "clothing", label: "Clothing and shoes", default_class: "depreciating", default_type: "varies" },
  { id: "beauty", label: "Beauty, hair, skincare", default_class: "depreciating", default_type: "varies" },
  { id: "electronics", label: "Electronics and gadgets", default_class: "depreciating", default_type: "varies" },
  { id: "dining", label: "Restaurants and takeout", default_class: "depreciating", default_type: "want" },
  { id: "subscriptions", label: "Subscriptions and memberships", default_class: "depreciating", default_type: "varies" },
  { id: "kids", label: "Children's expenses beyond essentials", default_class: "depreciating", default_type: "varies" },
  { id: "gifts", label: "Gifts for others", default_class: "depreciating", default_type: "varies" },
  { id: "travel", label: "Travel and holidays", default_class: "depreciating", default_type: "want" },
  { id: "designer", label: "Designer or luxury items", default_class: "depreciating", default_type: "status" },
  { id: "home_decor", label: "Home decor and furnishing", default_class: "depreciating", default_type: "varies" },
];

const CLASS_OPTIONS = [
  { value: "appreciating", label: "Appreciating", color: "var(--aw-green, #3D7A5F)", desc: "Gains value over time" },
  { value: "depreciating", label: "Depreciating", color: "var(--aw-red, #A23B3B)", desc: "Loses value the moment you buy it" },
  { value: "neutral", label: "Neutral", color: "var(--aw-amber, #B8860B)", desc: "Consumed, neither gains nor loses" },
];

const TYPE_OPTIONS = [
  { value: "need", label: "Need", color: "var(--aw-green, #3D7A5F)" },
  { value: "want", label: "Want", color: "var(--aw-amber, #B8860B)" },
  { value: "status", label: "Status signal", color: "var(--aw-red, #A23B3B)" },
];

function Step2({ audit, setAuditField, onNext }) {
  const classified = SPENDING_CATEGORIES.filter((c) => audit[c.id]?.classification && audit[c.id]?.purpose);
  const depreciating = classified.filter((c) => audit[c.id]?.classification === "depreciating");
  const statusItems = classified.filter((c) => audit[c.id]?.purpose === "status");

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)" }}>
        Your spending audit
      </h3>
      <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>
        Dr. Nasrat drew a clear line: your car depreciates, your house appreciates, your designer clothes and handbags depreciate. They do not grow in value. So is it an investment, or a status symbol?
      </p>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontFamily: "var(--aw-font-sans)" }}>
        For each spending category below, classify it honestly. Does it appreciate or depreciate? And is it a need, a want, or a signal to others?
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {SPENDING_CATEGORIES.map((cat) => {
          const data = audit[cat.id] || {};
          return (
            <div key={cat.id} style={{
              borderRadius: 10, border: `1.5px solid ${"var(--aw-border, #E8DDD6)"}`, background: "white", padding: "14px 18px",
            }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 10 }}>{cat.label}</div>

              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 200px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--aw-soft-grey, #A89B94)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Value over time</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {CLASS_OPTIONS.map((opt) => {
                      const sel = data.classification === opt.value;
                      return (
                        <button key={opt.value} onClick={() => setAuditField(cat.id, "classification", opt.value)}
                          style={{
                            padding: "5px 12px", borderRadius: 16, fontSize: 12, fontWeight: sel ? 600 : 400,
                            border: `1.5px solid ${sel ? opt.color : "var(--aw-border, #E8DDD6)"}`,
                            background: sel ? `${opt.color}15` : "white", color: sel ? opt.color : "var(--aw-dark-grey)",
                            cursor: "pointer",
                          }}>{opt.label}</button>
                      );
                    })}
                  </div>
                </div>
                <div style={{ flex: "1 1 200px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--aw-soft-grey, #A89B94)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Why I spend on this</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {TYPE_OPTIONS.map((opt) => {
                      const sel = data.purpose === opt.value;
                      return (
                        <button key={opt.value} onClick={() => setAuditField(cat.id, "purpose", opt.value)}
                          style={{
                            padding: "5px 12px", borderRadius: 16, fontSize: 12, fontWeight: sel ? 600 : 400,
                            border: `1.5px solid ${sel ? opt.color : "var(--aw-border, #E8DDD6)"}`,
                            background: sel ? `${opt.color}15` : "white", color: sel ? opt.color : "var(--aw-dark-grey)",
                            cursor: "pointer",
                          }}>{opt.label}</button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Audit summary */}
      {classified.length >= 6 && (
        <FadeIn>
          <div style={{ marginTop: 24, padding: "18px 20px", borderRadius: 12, background: "white", border: `1px solid ${"var(--aw-border, #E8DDD6)"}` }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 12 }}>Your audit snapshot</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
              <div style={{ padding: "10px 16px", borderRadius: 10, background: "#FDEAEA", flex: "1 1 140px" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--aw-red, #A23B3B)" }}>{depreciating.length}</div>
                <div style={{ fontSize: 12, color: "var(--aw-red, #A23B3B)" }}>Depreciating categories</div>
              </div>
              <div style={{ padding: "10px 16px", borderRadius: 10, background: "#FDEAEA", flex: "1 1 140px" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--aw-red, #A23B3B)" }}>{statusItems.length}</div>
                <div style={{ fontSize: 12, color: "var(--aw-red, #A23B3B)" }}>Status-driven categories</div>
              </div>
            </div>
            {(depreciating.length > 6 || statusItems.length > 2) && (
              <p style={{ margin: 0, fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>
                A high number of depreciating or status-driven categories does not make you a bad person. It makes you a normal person living in a consumer culture. The value of seeing it clearly is that you can now choose intentionally rather than automatically.
              </p>
            )}
          </div>
        </FadeIn>
      )}


    </div>
  );
}

// ─── STEP 3: VISIBILITY SCORE ───

const VISIBILITY_QUESTIONS = [
  { id: "vq1", text: "If nobody could ever see it, would I still buy the same car I drive now?" },
  { id: "vq2", text: "Have I ever bought something specifically because I wanted to post about it or be seen with it?" },
  { id: "vq3", text: "Do I spend more when I am with certain people to match their lifestyle?" },
  { id: "vq4", text: "Would I feel embarrassed if friends saw the inside of my real bank account?" },
  { id: "vq5", text: "Do I own things I cannot actually afford to maintain or replace?" },
  { id: "vq6", text: "Have I ever hidden a purchase from a partner or family member?" },
  { id: "vq7", text: "Do I judge other people's worth partly by what they own?" },
  { id: "vq8", text: "Would I rather look wealthy than be financially secure?" },
];

const VISIBILITY_RESPONSES = [
  { value: "yes", label: "Yes", color: "var(--aw-red, #A23B3B)" },
  { value: "sometimes", label: "Sometimes", color: "var(--aw-amber, #B8860B)" },
  { value: "no", label: "No", color: "var(--aw-green, #3D7A5F)" },
];

function Step3({ visibility, setVisibility, onNext }) {
  const answered = Object.keys(visibility).length;
  const yesCount = Object.values(visibility).filter((v) => v === "yes").length;
  const sometimesCount = Object.values(visibility).filter((v) => v === "sometimes").length;
  const score = yesCount * 2 + sometimesCount;
  const maxScore = VISIBILITY_QUESTIONS.length * 2;

  let profile = "";
  let profileColor = "var(--aw-green, #3D7A5F)";
  let profileMsg = "";
  if (score <= 3) {
    profile = "Low visibility spending";
    profileColor = "var(--aw-green, #3D7A5F)";
    profileMsg = "Your spending appears to be driven by genuine need and personal values rather than external perception. This is a significant strength. Your financial decisions are more likely to build real wealth.";
  } else if (score <= 8) {
    profile = "Moderate visibility influence";
    profileColor = "var(--aw-amber, #B8860B)";
    profileMsg = "External perception plays a role in some of your financial decisions, which is completely normal. The areas where you answered 'yes' or 'sometimes' are worth examining. Which specific people or situations make you spend to be seen?";
  } else {
    profile = "High visibility spending";
    profileColor = "var(--aw-red, #A23B3B)";
    profileMsg = "A significant portion of your spending is shaped by how others perceive you. Dr. Nasrat would say: the person who looks good and sparkles may actually have less than the person driving the tiny car. Visible spending is consumption, not wealth. This is not a judgement. It is the pattern that, once seen, can be changed.";
  }

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)" }}>
        The visibility test
      </h3>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>
        This is the uncomfortable question at the heart of Dr. Nasrat's teaching: how much of your spending is for you, and how much is for an audience? Answer each question honestly. Nobody is watching.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {VISIBILITY_QUESTIONS.map((q) => {
          const val = visibility[q.id];
          return (
            <div key={q.id} style={{
              borderRadius: 10, border: `1.5px solid ${val ? (VISIBILITY_RESPONSES.find((r) => r.value === val)?.color || "var(--aw-border, #E8DDD6)") : "var(--aw-border, #E8DDD6)"}`,
              background: "white", padding: "14px 18px",
            }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--aw-dark-grey)", marginBottom: 10, lineHeight: 1.45 }}>
                {q.text}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {VISIBILITY_RESPONSES.map((r) => {
                  const sel = val === r.value;
                  return (
                    <button key={r.value} onClick={() => setVisibility(q.id, r.value)}
                      style={{
                        padding: "6px 20px", borderRadius: 20, fontSize: 13, fontWeight: sel ? 600 : 400,
                        border: `1.5px solid ${sel ? r.color : "var(--aw-border, #E8DDD6)"}`,
                        background: sel ? `${r.color}15` : "white", color: sel ? r.color : "var(--aw-dark-grey)",
                        cursor: "pointer",
                      }}>{r.label}</button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {answered === VISIBILITY_QUESTIONS.length && (
        <FadeIn>
          <div style={{
            marginTop: 24, padding: "20px", borderRadius: 12,
            background: "white", border: `1.5px solid ${profileColor}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                background: `${profileColor}15`, border: `2px solid ${profileColor}`,
              }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: profileColor }}>{score}</span>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: profileColor }}>{profile}</div>
                <div style={{ fontSize: 12, color: "var(--aw-soft-grey, #A89B94)" }}>Score: {score} of {maxScore}</div>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontFamily: "var(--aw-font-sans)" }}>{profileMsg}</p>
          </div>
        </FadeIn>
      )}


    </div>
  );
}

// ─── STEP 4: NET WORTH SNAPSHOT ───

const ASSET_ROWS = [
  { id: "home", label: "Property / home value" },
  { id: "car_val", label: "Vehicle value (what you could sell it for today)" },
  { id: "savings", label: "Savings accounts" },
  { id: "investments", label: "Investments (unit trusts, stocks, TFSA)" },
  { id: "retirement", label: "Retirement fund / pension" },
  { id: "other_assets", label: "Other assets of value" },
];

const LIABILITY_ROWS = [
  { id: "home_loan", label: "Home loan / bond outstanding" },
  { id: "car_loan", label: "Vehicle finance outstanding" },
  { id: "credit_cards", label: "Credit card balances" },
  { id: "personal_loans", label: "Personal loans" },
  { id: "store_accounts", label: "Store accounts" },
  { id: "other_debt", label: "Other debts (family, informal)" },
];

function Step4({ assets, setAsset, liabilities, setLiability, netWorthReflection, setNetWorthReflection, onNext }) {
  const totalAssets = ASSET_ROWS.reduce((sum, r) => sum + (parseFloat(assets[r.id]) || 0), 0);
  const totalLiabilities = LIABILITY_ROWS.reduce((sum, r) => sum + (parseFloat(liabilities[r.id]) || 0), 0);
  const netWorth = totalAssets - totalLiabilities;
  const hasData = Object.values(assets).some((v) => v) || Object.values(liabilities).some((v) => v);

  const formatR = (n) => {
    if (n === 0) return "0";
    const abs = Math.abs(n);
    const formatted = abs >= 1000000 ? `${(abs / 1000000).toFixed(1)}M` : abs >= 1000 ? `${(abs / 1000).toFixed(0)}K` : `${abs}`;
    return n < 0 ? `-${formatted}` : formatted;
  };

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)" }}>
        Your net worth snapshot
      </h3>
      <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>
        Net worth is the simplest measure of real wealth: what you own minus what you owe. It is the number nobody can see, and it is the only number that actually matters.
      </p>
      <div style={{
        margin: "0 0 24px", padding: "12px 16px", borderRadius: 8, background: "var(--aw-rose-pale)",
        fontSize: 13, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontFamily: "var(--aw-font-sans)",
      }}>
        <strong style={{ color: "var(--aw-burg-core)" }}>Approximate numbers are fine.</strong> This is not an accounting exercise. It is about seeing the big picture. If you do not know a number, estimate. If you genuinely have no idea, leave it blank. That blank is itself information.
      </div>

      {/* Assets */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--aw-green, #3D7A5F)" }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-green, #3D7A5F)", textTransform: "uppercase", letterSpacing: 1 }}>What you own</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ASSET_ROWS.map((r) => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 14px", borderRadius: 8, background: "white", border: `1px solid ${"var(--aw-border, #E8DDD6)"}` }}>
              <span style={{ flex: 1, fontSize: 14, color: "var(--aw-dark-grey)" }}>{r.label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input type="text" value={assets[r.id] || ""} onChange={(e) => setAsset(r.id, e.target.value.replace(/[^0-9.]/g, ""))}
                  placeholder="0" style={{
                    width: 120, padding: "6px 10px", border: `1px solid ${"var(--aw-border, #E8DDD6)"}`, borderRadius: 6,
                    fontSize: 14, color: "var(--aw-dark-grey)", textAlign: "right", boxSizing: "border-box",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "var(--aw-green, #3D7A5F)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--aw-border, #E8DDD6)"}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Liabilities */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--aw-red, #A23B3B)" }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-red, #A23B3B)", textTransform: "uppercase", letterSpacing: 1 }}>What you owe</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {LIABILITY_ROWS.map((r) => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 14px", borderRadius: 8, background: "white", border: `1px solid ${"var(--aw-border, #E8DDD6)"}` }}>
              <span style={{ flex: 1, fontSize: 14, color: "var(--aw-dark-grey)" }}>{r.label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input type="text" value={liabilities[r.id] || ""} onChange={(e) => setLiability(r.id, e.target.value.replace(/[^0-9.]/g, ""))}
                  placeholder="0" style={{
                    width: 120, padding: "6px 10px", border: `1px solid ${"var(--aw-border, #E8DDD6)"}`, borderRadius: 6,
                    fontSize: 14, color: "var(--aw-dark-grey)", textAlign: "right", boxSizing: "border-box",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "var(--aw-red, #A23B3B)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--aw-border, #E8DDD6)"}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Net worth result */}
      {hasData && (
        <FadeIn>
          <div style={{
            padding: "24px", borderRadius: 12,
            background: netWorth >= 0 ? "var(--aw-burg-core)" : "var(--aw-red, #A23B3B)",
            color: "white", textAlign: "center", marginBottom: 20,
          }}>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, fontFamily: "var(--aw-font-sans)", opacity: 0.7, marginBottom: 8 }}>Your net worth</div>
            <div style={{ fontSize: 36, fontWeight: 700, marginBottom: 4 }}>{formatR(netWorth)}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 20, fontSize: 13, opacity: 0.8 }}>
              <span>Assets: {formatR(totalAssets)}</span>
              <span>|</span>
              <span>Liabilities: {formatR(totalLiabilities)}</span>
            </div>
          </div>
        </FadeIn>
      )}

      {hasData && (
        <FadeIn delay={200}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-sans)", display: "block", marginBottom: 8 }}>
              How do you feel seeing this number?
            </label>
            <textarea value={netWorthReflection} onChange={(e) => setNetWorthReflection(e.target.value)}
              rows={3} placeholder="There is no wrong answer. Relief, shock, shame, pride, confusion, motivation. Name it."
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


    </div>
  );
}

// ─── STEP 5: REDEFINE WEALTH + SUMMARY ───

function Step5({ audit, visibility, assets, liabilities, wealthDefinition, setWealthDefinition }) {
  const totalAssets = ASSET_ROWS.reduce((sum, r) => sum + (parseFloat(assets[r.id]) || 0), 0);
  const totalLiabilities = LIABILITY_ROWS.reduce((sum, r) => sum + (parseFloat(liabilities[r.id]) || 0), 0);
  const netWorth = totalAssets - totalLiabilities;

  const depreciating = SPENDING_CATEGORIES.filter((c) => audit[c.id]?.classification === "depreciating").length;
  const statusCount = SPENDING_CATEGORIES.filter((c) => audit[c.id]?.purpose === "status").length;
  const yesCount = Object.values(visibility).filter((v) => v === "yes").length;

  const formatR = (n) => {
    const abs = Math.abs(n);
    const formatted = abs >= 1000000 ? `${(abs / 1000000).toFixed(1)}M` : abs >= 1000 ? `${(abs / 1000).toFixed(0)}K` : `${abs}`;
    return n < 0 ? `-${formatted}` : formatted;
  };

  return (
    <div>
      <h3 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)", textAlign: "center" }}>
        Your Wealth Reality Check
      </h3>

      {/* Dashboard */}
      <FadeIn>
        <div style={{ background: "var(--aw-burg-core)", borderRadius: 16, padding: "28px", color: "white", marginBottom: 24 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, fontFamily: "var(--aw-font-sans)", opacity: 0.6, marginBottom: 16 }}>Your numbers</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.1)", flex: "1 1 130px", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{formatR(netWorth)}</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>Net worth</div>
            </div>
            <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.1)", flex: "1 1 130px", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{depreciating}</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>Depreciating categories</div>
            </div>
            <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.1)", flex: "1 1 130px", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{statusCount}</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>Status purchases</div>
            </div>
            <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.1)", flex: "1 1 130px", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{yesCount}</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>Visibility-driven habits</div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Redefine wealth */}
      <FadeIn delay={200}>
        <div style={{ background: "white", borderRadius: 16, padding: "24px", border: `1px solid ${"var(--aw-border, #E8DDD6)"}`, marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 8 }}>
            Redefine wealth in your own words
          </div>
          <p style={{ margin: "0 0 12px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>
            Dr. Nasrat said: aim for control, good choices, and reduced stress. Wealth is not status symbols. What does wealth mean to you now, after seeing your real numbers?
          </p>
          <textarea value={wealthDefinition} onChange={(e) => setWealthDefinition(e.target.value)}
            rows={3} placeholder="e.g. Wealth means freedom to choose, security for my children, never having to stay in a situation because I cannot afford to leave."
            style={{
              width: "100%", padding: "12px 14px", border: `1.5px solid ${"var(--aw-border, #E8DDD6)"}`, borderRadius: 8,
              fontSize: 15, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontFamily: "var(--aw-font-sans)", resize: "vertical", boxSizing: "border-box",
            }}
            onFocus={(e) => e.target.style.borderColor = "var(--aw-burg-core)"}
            onBlur={(e) => e.target.style.borderColor = "var(--aw-border, #E8DDD6)"}
          />
        </div>
      </FadeIn>

      {/* Bridge */}
      <FadeIn delay={400}>
        <div style={{
          background: "var(--aw-rose-pale)", borderRadius: 16, padding: "24px", borderLeft: `4px solid ${"var(--aw-rose-core)"}`, marginBottom: 24,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--aw-rose-core)", textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--aw-font-sans)", marginBottom: 8 }}>What comes next</div>
          <p style={{ margin: 0, fontSize: 15, color: "var(--aw-dark-grey)", lineHeight: 1.65, fontFamily: "var(--aw-font-sans)" }}>
            You now know what wealth looks like versus what it actually is. In Part 6, we get granular: mapping the exact gap between your earning and your spending, line by line. That gap is your freedom number.
          </p>
        </div>
      </FadeIn>


    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */

export default function Section5Wealth({ section, answers = {}, onAnswerChange }) {
  const guesses            = answers.s05_guesses || {};
  const revealed           = answers.s05_revealed || [];
  const audit              = answers.s05_audit || {};
  const visibility         = answers.s05_visibility || {};
  const assets             = answers.s05_assets || {};
  const liabilities        = answers.s05_liabilities || {};
  const netWorthReflection = answers.s05_net_worth_reflection || "";
  const wealthDefinition   = answers.s05_wealth_definition || "";

  const [step, setStep] = useState(0);

  const save = (fieldId, value) => { if (onAnswerChange) onAnswerChange(fieldId, value); };

  const setGuess = (id, val) => save("s05_guesses", { ...guesses, [id]: val });
  const setRevealed = (val) => save("s05_revealed", val);
  const setAuditField = (catId, field, val) => save("s05_audit", { ...audit, [catId]: { ...(audit[catId] || {}), [field]: val } });
  const setVisibilityAnswer = (id, val) => save("s05_visibility", { ...visibility, [id]: val });
  const setAsset = (id, val) => save("s05_assets", { ...assets, [id]: val });
  const setLiability = (id, val) => save("s05_liabilities", { ...liabilities, [id]: val });

  const goNext = () => setStep(s => s + 1);
  const goBack = () => setStep(s => Math.max(0, s - 1));
  const goToStep = (s) => setStep(s);

  const STEPS = ["Wealth illusion", "Spending audit", "Visibility test", "Net worth", "Summary"];

  return (
    <div>
      {/* Section header */}
      <div style={{ marginBottom: 36 }}>
        {section?.part_label && <p style={{ fontFamily: "var(--aw-font-sans)", fontWeight: 700, fontSize: 10, lineHeight: 1.4, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--aw-rose-core)", margin: "0 0 8px" }}>{section.part_label}</p>}
        {section?.heading && <h1 style={{ fontFamily: "var(--aw-font-display)", fontWeight: 400, fontSize: "clamp(34px, 4.6vw, 52px)", lineHeight: 1.05, letterSpacing: "-0.015em", color: "var(--aw-burg-core)", margin: 0 }}>{section.heading}</h1>}
        {section?.intro && <p style={{ fontFamily: "var(--aw-font-sans)", fontWeight: 300, fontSize: 16, lineHeight: 1.85, color: "var(--aw-dark-grey)", margin: "18px 0 0" }}>{section.intro}</p>}
      </div>

      <StepIndicator steps={STEPS} current={step} onStepClick={goToStep} />

      {step === 0 && <Step1 guesses={guesses} setGuess={setGuess} revealed={revealed} setRevealed={setRevealed} onNext={goNext} />}
      {step === 1 && <Step2 audit={audit} setAuditField={setAuditField} onNext={goNext} onBack={goBack} />}
      {step === 2 && <Step3 visibility={visibility} setVisibility={setVisibilityAnswer} onNext={goNext} onBack={goBack} />}
      {step === 3 && <Step4 assets={assets} setAsset={setAsset} liabilities={liabilities} setLiability={setLiability} netWorthReflection={netWorthReflection} setNetWorthReflection={(v) => save("s05_net_worth_reflection", v)} onNext={goNext} onBack={goBack} />}
      {step === 4 && <Step5 audit={audit} visibility={visibility} assets={assets} liabilities={liabilities} wealthDefinition={wealthDefinition} setWealthDefinition={(v) => save("s05_wealth_definition", v)} onBack={goBack} />}
    </div>
  );
}