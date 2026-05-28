import React, { useState, useEffect } from "react";

/*
  MONEY WORKBOOK - Section 3: My Money Scripts
  
  DATA CONTRACT:
    s03_scenario_answers   - object { scenarioId: identityId }
    s03_identity_reflections - object { identityId: string }
    s03_script_origin      - string
    s03_script_belief      - string
    s03_script_behaviour   - string
    s03_script_cost        - string
    s03_new_script_origin  - string
    s03_new_script_belief  - string
    s03_new_script_behaviour - string
    s03_new_script_future  - string
    s03_commitments        - array of strings
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
        return (<div key={i} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
          <div onClick={() => clickable && onStepClick(i)} style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: done ? "var(--aw-burg-core)" : active ? "white" : "transparent", border: `2px solid ${done || active ? "var(--aw-burg-core)" : "var(--aw-border, #E8DDD6)"}`, color: done ? "white" : active ? "var(--aw-burg-core)" : "var(--aw-soft-grey)", fontSize: 13, fontWeight: 600, flexShrink: 0, cursor: clickable ? "pointer" : "default", fontFamily: "var(--aw-font-sans)" }}>{done ? "✓" : i + 1}</div>
          {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: done ? "var(--aw-burg-core)" : "var(--aw-border, #E8DDD6)", margin: "0 6px", minWidth: 16 }} />}
        </div>);
      })}
    </div>
  );
}

const IDENTITIES = [
  { id: "saver", label: "The Saver", icon: "🏦", tagline: "I protect myself by holding on", strength: "Discipline, preparedness, resilience. You are unlikely to be caught without a safety net.", limitation: "Saving can become compulsive. No amount feels like enough. You may deny yourself joy because letting go of money feels physically unsafe.", rootQuestion: "What are you really saving against? Is it a future emergency, or a childhood feeling of scarcity that never fully resolved?" },
  { id: "spender", label: "The Spender", icon: "🛍️", tagline: "I comfort myself through spending", strength: "Generosity, present-moment enjoyment, willingness to invest in quality of life.", limitation: "Spending can become a coping mechanism. When you are stressed, sad, bored, or celebrating, the response is the same: buy something.", rootQuestion: "What feeling are you trying to create or avoid when you spend? Is it filling a gap that money cannot actually fill?" },
  { id: "avoider", label: "The Avoider", icon: "🙈", tagline: "I protect myself by not looking", strength: "Avoidance is a survival mechanism. It protected you from overwhelm when you did not have the tools to cope.", limitation: "What you do not look at still exists. Bills grow, debts compound, opportunities pass.", rootQuestion: "When did you first learn that not looking was safer than looking? What happened that made financial awareness feel dangerous?" },
  { id: "planner", label: "The Planner", icon: "📊", tagline: "I control through structure", strength: "Organisation, foresight, financial literacy. You likely know your numbers better than most.", limitation: "Planning can become rigidity. You may feel anxious when things deviate from the plan.", rootQuestion: "Is your planning driven by wisdom or by fear? Would you be okay if the plan changed tomorrow?" },
  { id: "giver", label: "The Giver", icon: "🤲", tagline: "I prove my worth through generosity", strength: "Deep empathy, community orientation, willingness to share.", limitation: "Giving without boundaries depletes you. You may fund others' lives while neglecting your own savings.", rootQuestion: "If you stopped giving, who would you be? Is your generosity freely chosen, or does it feel compulsory?" },
  { id: "compensator", label: "The Compensator", icon: "🎁", tagline: "I give my children what I never had", strength: "Love, determination to break the cycle, awareness that your children deserve more.", limitation: "Overcompensating can create the opposite problem: children who do not learn the value of money.", rootQuestion: "Are you giving your children what they need, or what the child inside you needed? Those are not always the same thing." },
];

const SCENARIOS = [
  { id: "sc1", situation: "You receive an unexpected bonus of 10,000 at work.", responses: [
    { text: "Transfer it to savings immediately. Do not touch it.", identity: "saver" },
    { text: "Treat yourself to something you have been wanting.", identity: "spender" },
    { text: "Leave it in your account and decide later. Or forget about it.", identity: "avoider" },
    { text: "Sit down and allocate it across goals: emergency, debt, investment.", identity: "planner" },
    { text: "Think about who in your life needs help right now.", identity: "giver" },
    { text: "Buy something special for your children.", identity: "compensator" },
  ]},
  { id: "sc2", situation: "Your car breaks down and the repair bill is 8,000.", responses: [
    { text: "Pay from your emergency fund. This is what it is for.", identity: "saver" },
    { text: "Put it on your credit card and deal with it later.", identity: "spender" },
    { text: "Feel a wave of panic and avoid calling the mechanic for days.", identity: "avoider" },
    { text: "Check your budget, move money between categories, and plan the payment.", identity: "planner" },
    { text: "Worry about how this affects what you promised to give someone else.", identity: "giver" },
    { text: "Feel sick because this means you cannot buy what your child asked for.", identity: "compensator" },
  ]},
  { id: "sc3", situation: "A friend invites you on a weekend trip that costs 5,000.", responses: [
    { text: "Say no. That money should be saved, not spent on a weekend.", identity: "saver" },
    { text: "Say yes immediately. Life is short.", identity: "spender" },
    { text: "Say 'let me check' and then never follow up.", identity: "avoider" },
    { text: "Check if it fits this month's discretionary budget before deciding.", identity: "planner" },
    { text: "Say yes but secretly worry because you just lent money to a family member.", identity: "giver" },
    { text: "Say no, but feel guilty because you just spent that much on your child's birthday.", identity: "compensator" },
  ]},
  { id: "sc4", situation: "Your partner wants to discuss your combined finances this weekend.", responses: [
    { text: "Feel comfortable because you know exactly where you stand.", identity: "saver" },
    { text: "Feel nervous because you have not been tracking your spending.", identity: "spender" },
    { text: "Find a reason to postpone the conversation.", identity: "avoider" },
    { text: "Prepare a spreadsheet to bring to the conversation.", identity: "planner" },
    { text: "Worry that they will question your financial commitments to others.", identity: "giver" },
    { text: "Worry they will say you spend too much on the children.", identity: "compensator" },
  ]},
  { id: "sc5", situation: "You see someone you know post about a luxury purchase on social media.", responses: [
    { text: "Feel quietly confident that your savings are more valuable.", identity: "saver" },
    { text: "Feel a pull to buy something similar.", identity: "spender" },
    { text: "Scroll past and try not to think about your own finances.", identity: "avoider" },
    { text: "Remind yourself that visible spending is not wealth.", identity: "planner" },
    { text: "Wonder how they afford it when you cannot, despite giving so much.", identity: "giver" },
    { text: "Feel a pang because you want to give your children that lifestyle.", identity: "compensator" },
  ]},
  { id: "sc6", situation: "You are offered a raise but it comes with significantly more responsibility.", responses: [
    { text: "Accept. More income means more savings and security.", identity: "saver" },
    { text: "Accept. More income means you can enjoy more.", identity: "spender" },
    { text: "Feel overwhelmed and unsure if you can handle it.", identity: "avoider" },
    { text: "Model the tax impact and net benefit before deciding.", identity: "planner" },
    { text: "Accept, thinking of how many people you could help with more money.", identity: "giver" },
    { text: "Accept, thinking of the opportunities it opens for your children.", identity: "compensator" },
  ]},
];

const SCRIPT_PROMPTS = [
  { key: "origin", fid: "s03_script_origin", label: "Where it started", stem: "Growing up, the message I absorbed about money was...", placeholder: "e.g. Money was scarce and you had to fight for every cent." },
  { key: "belief", fid: "s03_script_belief", label: "The belief it created", stem: "Because of that, I came to believe that money is...", placeholder: "e.g. dangerous, unreliable, a measure of my worth." },
  { key: "behaviour", fid: "s03_script_behaviour", label: "How it shows up now", stem: "That belief makes me...", placeholder: "e.g. save compulsively, spend to fill a void, avoid my bank balance." },
  { key: "cost", fid: "s03_script_cost", label: "What it costs me", stem: "The price I pay for this pattern is...", placeholder: "e.g. I never enjoy what I have. I am always anxious." },
];

const REWRITE_PROMPTS = [
  { key: "origin_r", fid: "s03_new_script_origin", label: "Acknowledging the past", stem: "I grew up with certain beliefs about money, and...", placeholder: "e.g. I now see those beliefs were inherited, not chosen." },
  { key: "belief_r", fid: "s03_new_script_belief", label: "Choosing a new belief", stem: "I am learning that money is...", placeholder: "e.g. a tool I can learn to use with confidence and intention." },
  { key: "behaviour_r", fid: "s03_new_script_behaviour", label: "Committing to new behaviour", stem: "From now on, I choose to...", placeholder: "e.g. face my finances with honesty, even when it is uncomfortable." },
  { key: "future_r", fid: "s03_new_script_future", label: "The life this creates", stem: "This new pattern will give me...", placeholder: "e.g. peace, control, the ability to make choices from strength." },
];

const COMMIT_OPTIONS = [
  "I will notice when my old script is driving a financial decision",
  "I will pause before reacting financially when I am emotional",
  "I will read my new script once a week for the next month",
  "I will share my money story with someone I trust",
  "I will be patient with myself when old patterns resurface",
  "I will revisit this section in 30 days to see what has shifted",
];

/* ── STEP 1: Scenario Quiz ───────────────────────────── */

function ScenarioStep({ scenarioAnswers, setAnswer, onNext }) {
  const answeredCount = Object.keys(scenarioAnswers).length;
  const scores = {};
  IDENTITIES.forEach(id => { scores[id.id] = 0; });
  Object.values(scenarioAnswers).forEach(identity => { if (scores[identity] !== undefined) scores[identity]++; });
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const primary = sorted[0]?.[1] > 0 ? sorted[0][0] : null;

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-burg-core)", fontFamily: "var(--aw-font-display)" }}>How do you actually behave with money?</h3>
      <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>Instead of asking you to self-identify, these six real-life scenarios will reveal your dominant pattern through your instinctive reactions. Choose the response closest to what you would actually do, not what you think is correct.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 24 }}>
        {SCENARIOS.map((sc, si) => {
          const chosen = scenarioAnswers[sc.id];
          return (
            <div key={sc.id} style={{ borderRadius: 12, border: `1.5px solid ${chosen ? "var(--aw-burg-core)" : "var(--aw-border, #E8DDD6)"}`, background: chosen ? "#FFFBF9" : "white", overflow: "hidden" }}>
              <div style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: chosen ? "var(--aw-burg-core)" : "var(--aw-border, #E8DDD6)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, fontFamily: "var(--aw-font-sans)" }}>{chosen ? "✓" : si + 1}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--aw-dark-grey)", lineHeight: 1.45, fontFamily: "var(--aw-font-sans)" }}>{sc.situation}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 38 }}>
                  {sc.responses.map((r, ri) => {
                    const sel = chosen === r.identity;
                    return <button key={ri} onClick={() => setAnswer(sc.id, r.identity)} style={{ width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: 8, border: `1.5px solid ${sel ? "var(--aw-burg-core)" : "var(--aw-border, #E8DDD6)"}`, background: sel ? "var(--aw-rose-pale)" : "white", cursor: "pointer", fontSize: 14, color: sel ? "var(--aw-burg-core)" : "var(--aw-dark-grey)", fontWeight: sel ? 500 : 400, lineHeight: 1.45, fontFamily: "var(--aw-font-sans)" }}>{r.text}</button>;
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {answeredCount >= 3 && (
        <FadeIn>
          <div style={{ marginTop: 24, padding: "16px 20px", borderRadius: 10, background: "white", border: "1px solid var(--aw-border, #E8DDD6)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 10, fontFamily: "var(--aw-font-sans)" }}>Emerging pattern ({answeredCount} of {SCENARIOS.length} answered)</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {sorted.filter(([_, c]) => c > 0).map(([id, count]) => {
                const identity = IDENTITIES.find(i => i.id === id);
                const isPrimary = id === primary;
                return (<div key={id} style={{ padding: "6px 14px", borderRadius: 20, background: isPrimary ? "var(--aw-rose-pale)" : "white", border: `1.5px solid ${isPrimary ? "var(--aw-burg-core)" : "var(--aw-border, #E8DDD6)"}`, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 16 }}>{identity.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: isPrimary ? 600 : 400, color: isPrimary ? "var(--aw-burg-core)" : "var(--aw-dark-grey)", fontFamily: "var(--aw-font-sans)" }}>{identity.label}</span>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", fontSize: 11, fontWeight: 700, background: isPrimary ? "var(--aw-burg-core)" : "var(--aw-border, #E8DDD6)", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>{count}</span>
                </div>);
              })}
            </div>
          </div>
        </FadeIn>
      )}
    </div>
  );
}

/* ── STEP 2: Identity Deep Dive ──────────────────────── */

function IdentityStep({ primary, secondary, reflections, setReflection, onNext, onBack }) {
  const pId = IDENTITIES.find(i => i.id === primary);
  const sId = secondary ? IDENTITIES.find(i => i.id === secondary) : null;
  if (!pId) return <div><p>Complete more scenarios to reveal your identity.</p></div>;

  const renderCard = (identity, isPrimary) => (
    <div style={{ borderRadius: 12, border: `1.5px solid ${isPrimary ? "var(--aw-burg-core)" : "var(--aw-border, #E8DDD6)"}`, background: "white", overflow: "hidden", marginBottom: 20 }}>
      <div style={{ padding: "18px 20px", background: isPrimary ? "var(--aw-burg-core)" : "var(--aw-dark-grey)", color: "white", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 28 }}>{identity.icon}</span>
        <div>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", opacity: 0.7, fontFamily: "var(--aw-font-sans)" }}>{isPrimary ? "Your primary identity" : "Your secondary pattern"}</div>
          <div style={{ fontSize: 20, fontWeight: 600, fontFamily: "var(--aw-font-display)" }}>{identity.label}</div>
          <div style={{ fontSize: 14, fontStyle: "italic", opacity: 0.85, fontFamily: "var(--aw-font-sans)" }}>{identity.tagline}</div>
        </div>
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--aw-green, #3D7A5F)" }} /><span style={{ fontSize: 13, fontWeight: 600, color: "var(--aw-green, #3D7A5F)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--aw-font-sans)" }}>The strength</span></div>
          <p style={{ margin: 0, fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.6, paddingLeft: 16, fontFamily: "var(--aw-font-sans)" }}>{identity.strength}</p>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--aw-rose-core)" }} /><span style={{ fontSize: 13, fontWeight: 600, color: "var(--aw-rose-core)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--aw-font-sans)" }}>The limitation</span></div>
          <p style={{ margin: 0, fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.6, paddingLeft: 16, fontFamily: "var(--aw-font-sans)" }}>{identity.limitation}</p>
        </div>
        <div style={{ padding: "14px 16px", borderRadius: 8, background: "var(--aw-rose-pale)", borderLeft: "3px solid var(--aw-rose-core)", marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--aw-burg-core)", marginBottom: 4, fontFamily: "var(--aw-font-sans)" }}>The question underneath</div>
          <p style={{ margin: 0, fontSize: 15, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>{identity.rootQuestion}</p>
        </div>
        <label style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", display: "block", marginBottom: 6, fontFamily: "var(--aw-font-sans)" }}>Your response:</label>
        <textarea value={reflections[identity.id] || ""} onChange={e => setReflection(identity.id, e.target.value)} rows={3} placeholder="Write what comes to mind..." style={{ width: "100%", padding: "12px 14px", border: "1.5px solid var(--aw-border, #E8DDD6)", borderRadius: 8, fontSize: 15, color: "var(--aw-dark-grey)", lineHeight: 1.6, resize: "vertical", boxSizing: "border-box", fontFamily: "var(--aw-font-sans)" }} />
      </div>
    </div>
  );

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-burg-core)", fontFamily: "var(--aw-font-display)" }}>Understanding your money identity</h3>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>Every identity has a strength and a limitation. Neither is good or bad. The goal is awareness.</p>
      <FadeIn>{renderCard(pId, true)}</FadeIn>
      {sId && <FadeIn delay={300}>{renderCard(sId, false)}</FadeIn>}
    </div>
  );
}

/* ── STEP 3: Script Construction ─────────────────────── */

const SCRIPT_STEMS = [
  "Growing up, the message I absorbed about money was",
  "Because of that, I came to believe that money is",
  "That belief makes me",
  "The price I pay for this pattern is",
];

function buildOldScript(answers) {
  return SCRIPT_PROMPTS
    .map((p, i) => {
      const val = (answers[p.fid] || "").trim();
      if (!val) return null;
      return `${SCRIPT_STEMS[i]} ${val}.`;
    })
    .filter(Boolean)
    .join(" ");
}

function ScriptStep({ answers, save, onNext, onBack }) {
  const allFilled = SCRIPT_PROMPTS.every(p => answers[p.fid] && answers[p.fid].trim());
  const composite = allFilled ? buildOldScript(answers) : null;

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-burg-core)", fontFamily: "var(--aw-font-display)" }}>Constructing your money script</h3>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontFamily: "var(--aw-font-sans)" }}>Instead of writing a paragraph from scratch, we will build your script in four layers. Complete each sentence stem. Together, they form the story that has been running your financial life.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {SCRIPT_PROMPTS.map((p, i) => {
          const val = answers[p.fid] || "";
          const filled = val.trim().length > 0;
          return (
            <div key={p.key} style={{ borderRadius: 12, border: `1.5px solid ${filled ? "var(--aw-green, #3D7A5F)" : "var(--aw-border, #E8DDD6)"}`, background: "white", padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, background: filled ? "var(--aw-green, #3D7A5F)" : "var(--aw-border, #E8DDD6)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600 }}>{filled ? "✓" : i + 1}</div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--aw-soft-grey)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--aw-font-sans)" }}>{p.label}</span>
              </div>
              <label style={{ display: "block", fontSize: 15, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 8, fontFamily: "var(--aw-font-sans)" }}>{p.stem}</label>
              <textarea value={val} onChange={e => save(p.fid, e.target.value)} rows={2} placeholder={p.placeholder} style={{ width: "100%", padding: "10px 14px", border: "1.5px solid var(--aw-border, #E8DDD6)", borderRadius: 8, fontSize: 15, color: "var(--aw-dark-grey)", lineHeight: 1.6, resize: "vertical", boxSizing: "border-box", fontFamily: "var(--aw-font-sans)" }} />
            </div>
          );
        })}
      </div>
      {allFilled && (
        <FadeIn>
          <div style={{ marginTop: 24, padding: "20px 24px", borderRadius: 12, background: "var(--aw-burg-core)", color: "white" }}>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.15em", opacity: 0.6, marginBottom: 10, fontFamily: "var(--aw-font-sans)" }}>Your money script, assembled</div>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, fontStyle: "italic", fontWeight: 300, fontFamily: "var(--aw-font-sans)" }}>{composite}</p>
            <p style={{ margin: "14px 0 0", fontSize: 13, opacity: 0.7, lineHeight: 1.5, fontFamily: "var(--aw-font-sans)" }}>This is the story that has been running in the background. Seeing it written down is the first step to changing it.</p>
          </div>
        </FadeIn>
      )}
    </div>
  );
}

/* ── STEP 4: Script Rewrite ──────────────────────────── */

function RewriteStep({ answers, save, commitments, toggleCommitment, onNext, onBack }) {
  const oldScript = buildOldScript(answers);
  const allFilled = REWRITE_PROMPTS.every(p => answers[p.fid] && answers[p.fid].trim());
  const newComposite = allFilled ? REWRITE_PROMPTS.map(p => answers[p.fid]).join(" ") : null;

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-burg-core)", fontFamily: "var(--aw-font-display)" }}>Rewriting your money script</h3>
      <p style={{ margin: "0 0 16px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>You cannot delete the old script, but you can write a new one to run alongside it.</p>
      {oldScript && (
        <div style={{ margin: "0 0 24px", padding: "14px 18px", borderRadius: 10, background: "#FDEAEA", borderLeft: "3px solid var(--aw-red, #A23B3B)" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--aw-red, #A23B3B)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, fontFamily: "var(--aw-font-sans)" }}>Your old script</div>
          <p style={{ margin: 0, fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>{oldScript}</p>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {REWRITE_PROMPTS.map((p, i) => {
          const val = answers[p.fid] || "";
          const filled = val.trim().length > 0;
          return (
            <div key={p.key} style={{ borderRadius: 12, border: `1.5px solid ${filled ? "var(--aw-green, #3D7A5F)" : "var(--aw-border, #E8DDD6)"}`, background: "white", padding: "18px 20px" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--aw-soft-grey)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, fontFamily: "var(--aw-font-sans)" }}>{p.label}</div>
              <label style={{ display: "block", fontSize: 15, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 8, fontFamily: "var(--aw-font-sans)" }}>{p.stem}</label>
              <textarea value={val} onChange={e => save(p.fid, e.target.value)} rows={2} placeholder={p.placeholder} style={{ width: "100%", padding: "10px 14px", border: "1.5px solid var(--aw-border, #E8DDD6)", borderRadius: 8, fontSize: 15, color: "var(--aw-dark-grey)", lineHeight: 1.6, resize: "vertical", boxSizing: "border-box", fontFamily: "var(--aw-font-sans)" }} />
            </div>
          );
        })}
      </div>
      {allFilled && (
        <FadeIn><div style={{ marginTop: 24, padding: "20px 24px", borderRadius: 12, background: "#E8F3ED", borderLeft: "4px solid var(--aw-green, #3D7A5F)" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--aw-green, #3D7A5F)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontFamily: "var(--aw-font-sans)" }}>Your new script</div>
          <p style={{ margin: 0, fontSize: 16, color: "var(--aw-dark-grey)", lineHeight: 1.7, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>{newComposite}</p>
        </div></FadeIn>
      )}
      {allFilled && (
        <FadeIn delay={300}><div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 12, fontFamily: "var(--aw-font-sans)" }}>To anchor this new script, I commit to:</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {COMMIT_OPTIONS.map(opt => {
              const sel = commitments.includes(opt);
              return (<label key={opt} style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", padding: "8px 12px", borderRadius: 8, background: sel ? "#E8F3ED" : "transparent" }}>
                <input type="checkbox" checked={sel} onChange={() => toggleCommitment(opt)} style={{ accentColor: "var(--aw-green, #3D7A5F)", width: 17, height: 17, marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.45, fontFamily: "var(--aw-font-sans)" }}>{opt}</span>
              </label>);
            })}
          </div>
        </div></FadeIn>
      )}
    </div>
  );
}

/* ── STEP 5: Summary ─────────────────────────────────── */

function SummaryStep({ primary, secondary, answers }) {
  const pId = IDENTITIES.find(i => i.id === primary);
  const sId = secondary ? IDENTITIES.find(i => i.id === secondary) : null;
  const oldScript = buildOldScript(answers);
  const newScript = REWRITE_PROMPTS.map(p => answers[p.fid] || "").filter(Boolean).join(" ");

  return (
    <div>
      <h3 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 600, color: "var(--aw-burg-core)", textAlign: "center", fontFamily: "var(--aw-font-display)" }}>Your Money Script Transformation</h3>
      <FadeIn>
        <div style={{ background: "white", borderRadius: 16, padding: "24px", border: "1px solid var(--aw-border, #E8DDD6)", marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 14, fontFamily: "var(--aw-font-sans)" }}>Your money identity</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {pId && <div style={{ padding: "12px 18px", borderRadius: 10, background: "var(--aw-rose-pale)", border: "1.5px solid var(--aw-burg-core)", display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 24 }}>{pId.icon}</span><div><div style={{ fontSize: 11, color: "var(--aw-burg-core)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--aw-font-sans)" }}>Primary</div><div style={{ fontSize: 16, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)" }}>{pId.label}</div></div></div>}
            {sId && <div style={{ padding: "12px 18px", borderRadius: 10, background: "#F5F5F5", border: "1.5px solid var(--aw-border, #E8DDD6)", display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 24 }}>{sId.icon}</span><div><div style={{ fontSize: 11, color: "var(--aw-soft-grey)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--aw-font-sans)" }}>Secondary</div><div style={{ fontSize: 16, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)" }}>{sId.label}</div></div></div>}
          </div>
        </div>
      </FadeIn>
      <FadeIn delay={200}>
        <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 280px", borderRadius: 12, padding: 20, background: "#FDEAEA", borderTop: "4px solid var(--aw-red, #A23B3B)" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--aw-red, #A23B3B)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontFamily: "var(--aw-font-sans)" }}>Old script</div>
            <p style={{ margin: 0, fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.65, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>{oldScript || "Not yet written"}</p>
          </div>
          <div style={{ flex: "1 1 280px", borderRadius: 12, padding: 20, background: "#E8F3ED", borderTop: "4px solid var(--aw-green, #3D7A5F)" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--aw-green, #3D7A5F)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontFamily: "var(--aw-font-sans)" }}>New script</div>
            <p style={{ margin: 0, fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.65, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>{newScript || "Not yet written"}</p>
          </div>
        </div>
      </FadeIn>
      <FadeIn delay={400}>
        <div style={{ background: "var(--aw-rose-pale)", borderRadius: 16, padding: 24, borderLeft: "4px solid var(--aw-rose-core)" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--aw-rose-core)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontFamily: "var(--aw-font-sans)" }}>What comes next</div>
          <p style={{ margin: 0, fontSize: 15, color: "var(--aw-dark-grey)", lineHeight: 1.65, fontFamily: "var(--aw-font-sans)" }}>You now know your identity and your script. In Part 4, we will map the specific emotional triggers that activate your old script in daily life: the moments where intention collapses into reaction.</p>
        </div>
      </FadeIn>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════════════════ */

export default function Section3Scripts({ section, answers = {}, onAnswerChange, step = 0, onStepChange }) {
  const scenarioAnswers = answers.s03_scenario_answers || {};
  const reflections = answers.s03_identity_reflections || {};
  const commitments = answers.s03_commitments || [];

  const save = (fid, val) => { if (onAnswerChange) onAnswerChange(fid, val); };

  // Compute identities from scenarios
  const scores = {};
  IDENTITIES.forEach(id => { scores[id.id] = 0; });
  Object.values(scenarioAnswers).forEach(identity => { if (scores[identity] !== undefined) scores[identity]++; });
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const primary = sorted[0]?.[1] > 0 ? sorted[0][0] : null;
  const secondary = sorted[1]?.[1] > 0 ? sorted[1][0] : null;

  const setScenarioAnswer = (scId, identity) => save("s03_scenario_answers", { ...scenarioAnswers, [scId]: identity });
  const setReflection = (id, val) => save("s03_identity_reflections", { ...reflections, [id]: val });
  const toggleCommitment = (opt) => {
    const next = commitments.includes(opt) ? commitments.filter(x => x !== opt) : [...commitments, opt];
    save("s03_commitments", next);
  };

  const STEPS = ["Scenarios", "Your identity", "Old script", "New script", "Summary"];

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        {section?.part_label && <p style={{ fontFamily: "var(--aw-font-sans)", fontWeight: 700, fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--aw-rose-core)", margin: "0 0 8px" }}>{section.part_label}</p>}
        {section?.heading && <h1 style={{ fontFamily: "var(--aw-font-display)", fontWeight: 400, fontSize: "clamp(34px, 4.6vw, 52px)", lineHeight: 1.05, letterSpacing: "-0.015em", color: "var(--aw-burg-core)", margin: 0 }}>{section.heading}</h1>}
        {section?.intro && <p style={{ fontFamily: "var(--aw-font-sans)", fontWeight: 300, fontSize: 16, lineHeight: 1.85, color: "var(--aw-dark-grey)", margin: "18px 0 0" }}>{section.intro}</p>}
      </div>
      <StepIndicator steps={STEPS} current={step} />
      {step === 0 && <ScenarioStep scenarioAnswers={scenarioAnswers} setAnswer={setScenarioAnswer} onNext={() => onStepChange?.(step + 1)} />}
      {step === 1 && <IdentityStep primary={primary} secondary={secondary} reflections={reflections} setReflection={setReflection} onNext={() => onStepChange?.(step + 1)} onBack={() => onStepChange?.(step - 1)} />}
      {step === 2 && <ScriptStep answers={answers} save={save} onNext={() => onStepChange?.(step + 1)} onBack={() => onStepChange?.(step - 1)} />}
      {step === 3 && <RewriteStep answers={answers} save={save} commitments={commitments} toggleCommitment={toggleCommitment} onNext={() => onStepChange?.(step + 1)} onBack={() => onStepChange?.(step - 1)} />}
      {step === 4 && <SummaryStep primary={primary} secondary={secondary} answers={answers} onBack={() => onStepChange?.(step - 1)} />}
    </div>
  );
}