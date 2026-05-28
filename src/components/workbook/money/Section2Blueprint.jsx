import React, { useState, useEffect } from "react";

/*
  MONEY WORKBOOK - Section 2: The Blueprint I Was Given
  
  DATA CONTRACT (field_ids via onAnswerChange):
    s02_household       - string (household type id)
    s02_atmosphere      - array of atmosphere ids
    s02_messages        - object { messageId: impactLevel (0-3) }
    s02_memory_earliest - string
    s02_memory_stress   - string
    s02_memory_lesson   - string
    s02_memory_denial   - string
    s02_memory_positive - string
    s02_value_signals   - object { "systemId:signal": boolean }
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
            <div onClick={() => clickable && onStepClick(i)} style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: done ? "var(--aw-burg-core)" : active ? "white" : "transparent", border: `2px solid ${done || active ? "var(--aw-burg-core)" : "var(--aw-border, #E8DDD6)"}`, color: done ? "white" : active ? "var(--aw-burg-core)" : "var(--aw-soft-grey, #A89B94)", fontSize: 13, fontWeight: 600, flexShrink: 0, cursor: clickable ? "pointer" : "default", fontFamily: "var(--aw-font-sans)" }}>{done ? "✓" : i + 1}</div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: done ? "var(--aw-burg-core)" : "var(--aw-border, #E8DDD6)", margin: "0 6px", minWidth: 16 }} />}
          </div>
        );
      })}
    </div>
  );
}

/* ── DATA ─────────────────────────────────────────────── */

const HOUSEHOLD_TYPES = [
  { id: "nuclear", label: "Two parents and siblings", icon: "👨‍👩‍👧‍👦", desc: "A contained unit where money patterns come primarily from two adults" },
  { id: "single", label: "Single-parent household", icon: "👩‍👧‍👦", desc: "One person carrying the financial weight, which children absorb deeply" },
  { id: "extended", label: "Extended family household", icon: "👨‍👩‍👧‍👦👴👵", desc: "Multiple adults, shared resources, communal financial norms" },
  { id: "blended", label: "Blended or stepfamily", icon: "👨‍👩‍👧👩‍👦", desc: "Merging of different money cultures, often with unspoken tensions" },
  { id: "grandparents", label: "Raised by grandparents or relatives", icon: "👴👵", desc: "A generational leap in money values, often more conservative" },
  { id: "only", label: "Only child", icon: "👩‍👦", desc: "All financial attention focused on one child, for better or worse" },
];

const MONEY_ATMOSPHERE = [
  { id: "open", label: "Money was discussed openly", valence: "positive", insight: "Open money conversations build financial literacy early. You likely have a stronger foundation than you realise, even if the content of those conversations was stressful." },
  { id: "taboo", label: "Money was never discussed", valence: "negative", insight: "When money is treated as unspeakable, children learn that finances are dangerous or shameful. As an adult, this often shows up as avoidance or anxiety around financial conversations." },
  { id: "conflict", label: "Money caused arguments or tension", valence: "negative", insight: "If money meant conflict in your home, your nervous system may still activate when financial topics arise. This is not weakness. It is a learned response that can be unlearned." },
  { id: "stress", label: "I could feel financial stress even when it was not spoken about", valence: "negative", insight: "Children are remarkably perceptive. You did not need to hear the words to absorb the worry. This silent stress often creates the deepest patterns because it was never named or processed." },
  { id: "stability", label: "There was a sense of financial stability", valence: "positive", insight: "Growing up with financial stability is a genuine advantage. The question is whether that stability also came with financial education, or whether money was simply handled in the background." },
  { id: "scarcity", label: "There was often not enough", valence: "negative", insight: "Scarcity in childhood creates one of two adult patterns: compulsive saving (hoarding against future scarcity) or compulsive spending (making up for what you missed). Which one did you develop?" },
  { id: "dependent", label: "One parent controlled all the money", valence: "negative", insight: "When money equals power in a household, children learn that financial control is about dominance, not partnership. Dr. Nasrat spoke about women who could not leave difficult situations because of this pattern." },
  { id: "generous", label: "Money was shared freely with others", valence: "positive", insight: "Generosity as a family value is beautiful, but it can also create difficulty setting financial boundaries as an adult. Do you find it hard to say no when someone asks for financial help?" },
];

const MONEY_MESSAGES = [
  { id: "trees", phrase: "Money does not grow on trees", origin: "Scarcity mindset", adultPattern: "You may swing between compulsive saving and guilt-driven overspending. The underlying belief is that money is finite and hard to come by, so every financial decision carries outsized weight." },
  { id: "afford", phrase: "We cannot afford that", origin: "Caution and limitation", adultPattern: "As an adult, you may constantly second-guess purchases, even ones you can afford. Or you may have gone the opposite direction, overspending on your children to compensate for what you missed." },
  { id: "card", phrase: "Just put it on the card", origin: "Normalised debt", adultPattern: "Credit may feel like free money to you. You may not fully connect the swipe to the real cost. Dr. Nasrat shared how her own son saw the ATM as a source of unlimited money. Children internalise what they see." },
  { id: "hardwork", phrase: "You have to work hard for every cent", origin: "Effort-linked worth", adultPattern: "You may believe that if you are not grinding, you do not deserve financial comfort. Rest might feel like laziness. Passive income or windfalls might trigger guilt rather than gratitude." },
  { id: "rich_bad", phrase: "Rich people are greedy or dishonest", origin: "Wealth shame", adultPattern: "You may unconsciously sabotage your own wealth building because deep down you associate having money with being a bad person. Wanting more might feel morally wrong." },
  { id: "no_talk", phrase: "Money is not something we discuss", origin: "Financial secrecy", adultPattern: "You may find it physically uncomfortable to talk about money with a partner, friend, or advisor. Financial conversations may trigger shame or anxiety, even when the content is neutral." },
  { id: "rainy", phrase: "Save for a rainy day", origin: "Preparedness anxiety", adultPattern: "Saving may feel compulsive rather than empowering. No amount feels like enough. The rainy day is always coming, and you can never fully relax into what you have." },
  { id: "taken_care", phrase: "Someone else will take care of you", origin: "Learned dependence", adultPattern: "You may have outsourced your financial agency to a partner, parent, or institution. Independence may feel unnecessary or even scary. Dr. Nasrat specifically warned about this pattern for women." },
  { id: "earn_it", phrase: "If you want it, you have to earn it", origin: "Conditional worth", adultPattern: "You may struggle to receive gifts, help, or generosity. Everything must be earned or it does not count. This can make you a strong provider but a poor receiver." },
  { id: "dont_worry", phrase: "Do not worry about money", origin: "Shielded from reality", adultPattern: "You may have entered adulthood without basic financial skills because you were protected from the topic entirely. Financial decisions may feel overwhelming because you never had practice." },
];

const IMPACT_LEVELS = [
  { value: 0, label: "Never heard this", color: "var(--aw-soft-grey, #A89B94)" },
  { value: 1, label: "Heard it sometimes", color: "var(--aw-amber, #B8860B)" },
  { value: 2, label: "Heard it often", color: "var(--aw-rose-core)" },
  { value: 3, label: "This defined my childhood", color: "var(--aw-red, #A23B3B)" },
];

const MEMORY_PROMPTS = [
  { id: "earliest", fid: "s02_memory_earliest", label: "The earliest money moment I remember", help: "It might be small: a coin, a conversation, a trip to a shop. What comes to mind first?" },
  { id: "stress", fid: "s02_memory_stress", label: "A time I felt financial stress in my home", help: "Maybe you overheard an argument. Maybe a planned event was cancelled. Maybe you saw a parent's face change when a bill arrived." },
  { id: "lesson", fid: "s02_memory_lesson", label: "Something an adult taught me about money", help: "It could be a direct lesson ('save your pocket money') or something you learned by watching. What stuck with you?" },
  { id: "denial", fid: "s02_memory_denial", label: "A time I was told no because of money", help: "A school trip, a toy, new shoes, a class. Something you wanted that was not possible. How did that feel?" },
  { id: "positive", fid: "s02_memory_positive", label: "A positive money memory", help: "A gift, a reward, a moment where money meant something good. Not every money memory is painful." },
];

const VALUE_SYSTEMS = [
  { id: "security", label: "Security-focused", tagline: "Saving and caution were the highest values", icon: "🛡️", signals: ["There was always an emergency fund or savings", "Spending was careful and considered", "Frugality was praised", "Risk was seen as irresponsible", "Insurance and protection were prioritised"], blueprint: "You likely default to caution in financial decisions. Saving may come naturally, but taking calculated risks may feel physically uncomfortable. The strength is discipline. The limitation is that safety can become a prison if it prevents you from ever growing your wealth." },
  { id: "achievement", label: "Achievement-driven", tagline: "Money was linked to status and success", icon: "🏆", signals: ["Success was measured by visible markers (house, car, school)", "Education was seen as a path to earning more", "Hard work was the primary value", "There was pressure to achieve or earn", "Financial success was publicly celebrated"], blueprint: "You likely measure your worth partly through your earning power or financial position. The strength is drive. The limitation is that your self-worth may be entangled with your bank balance." },
  { id: "generous", label: "Generous", tagline: "Sharing and giving were modelled", icon: "🤲", signals: ["When the family had, they shared with others", "Community obligations came before individual wants", "Giving was seen as a moral duty", "Extended family was financially supported", "Saying no to requests for money felt selfish"], blueprint: "You likely struggle to put your own financial needs first. The strength is empathy and community. The limitation is that you may give until you have nothing left for yourself." },
  { id: "entrepreneurial", label: "Entrepreneurial", tagline: "Risk and opportunity were normalised", icon: "🚀", signals: ["A parent or relative ran their own business", "Financial ups and downs were accepted as normal", "Opportunity was valued over security", "Children were encouraged to earn their own money", "Investment and risk-taking were discussed positively"], blueprint: "You likely have a higher tolerance for financial risk and may be comfortable with income volatility. The strength is boldness. The limitation is that you may undervalue safety nets and the quiet power of compounding." },
  { id: "scarcity", label: "Scarcity-driven", tagline: "There was never enough", icon: "⏳", signals: ["Money was a constant source of stress", "Choices were always constrained by lack", "Children were aware of financial limitations early", "There was borrowing from family or institutions", "The future felt uncertain"], blueprint: "You may oscillate between two extremes: over-saving from fear of returning to scarcity, or over-spending to compensate for what you missed. The strength is resourcefulness and resilience. The limitation is that scarcity thinking can persist long after the actual scarcity has ended." },
  { id: "avoidant", label: "Avoidant", tagline: "Money was simply not discussed", icon: "🙈", signals: ["Financial matters were handled behind closed doors", "Children were told not to worry about money", "There was no financial education at home", "Money appeared or disappeared without explanation", "Asking about money was discouraged"], blueprint: "You may have entered adulthood without basic financial literacy, not because you lacked intelligence, but because you were never given the language or the practice. The strength is that you are a blank slate. The limitation is that the avoidance pattern itself may have become your habit." },
];

/* ── STEP 1: Your Childhood Home ─────────────────────── */

function Step1({ household, setHousehold, atmosphere, toggleAtmosphere, onNext }) {
  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-burg-core)", fontFamily: "var(--aw-font-display)" }}>Your childhood home</h3>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>Dr. Nasrat teaches that your relationship with money did not start when you opened your first bank account. It started in the home you grew up in. Let us map that home.</p>

      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 12, fontFamily: "var(--aw-font-sans)" }}>Which best describes the household you grew up in?</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
        {HOUSEHOLD_TYPES.map(h => {
          const sel = household === h.id;
          return (
            <button key={h.id} onClick={() => setHousehold(h.id)} style={{ width: "100%", textAlign: "left", padding: "14px 18px", borderRadius: 10, border: `1.5px solid ${sel ? "var(--aw-burg-core)" : "var(--aw-border, #E8DDD6)"}`, background: sel ? "var(--aw-rose-pale)" : "white", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 24 }}>{h.icon}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: sel ? 600 : 400, color: sel ? "var(--aw-burg-core)" : "var(--aw-dark-grey)", fontFamily: "var(--aw-font-sans)" }}>{h.label}</div>
                {sel && <div style={{ fontSize: 13, color: "var(--aw-dark-grey)", marginTop: 4, lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>{h.desc}</div>}
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 8, fontFamily: "var(--aw-font-sans)" }}>What was the atmosphere around money in your home? Select all that are true.</div>
      <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--aw-dark-grey)", fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>Each selection unlocks a reflection specific to that experience.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {MONEY_ATMOSPHERE.map(a => {
          const sel = atmosphere.includes(a.id);
          const valColor = a.valence === "positive" ? "var(--aw-green, #3D7A5F)" : "var(--aw-rose-core)";
          const valBg = a.valence === "positive" ? "#E8F3ED" : "var(--aw-rose-pale)";
          return (
            <div key={a.id}>
              <button onClick={() => toggleAtmosphere(a.id)} style={{ width: "100%", textAlign: "left", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${sel ? valColor : "var(--aw-border, #E8DDD6)"}`, background: sel ? valBg : "white", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 20, height: 20, borderRadius: 4, flexShrink: 0, marginTop: 1, border: `2px solid ${sel ? valColor : "var(--aw-border, #E8DDD6)"}`, background: sel ? valColor : "white", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>{sel && <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>✓</span>}</div>
                <span style={{ fontSize: 15, color: "var(--aw-dark-grey)", fontWeight: sel ? 500 : 400, fontFamily: "var(--aw-font-sans)" }}>{a.label}</span>
              </button>
              {sel && <FadeIn><div style={{ margin: "6px 0 4px 32px", padding: "12px 16px", borderRadius: 8, background: "white", borderLeft: `3px solid ${valColor}`, fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>{a.insight}</div></FadeIn>}
            </div>
          );
        })}
      </div>
      {/* NavBtn removed — navigation via StepIndicator dots and bottom bar */}
    </div>
  );
}

/* ── STEP 2: Money Soundtrack ─────────────────────────── */

function Step2({ messageImpacts, setMessageImpact, expandedMsg, setExpandedMsg, onNext, onBack }) {
  const ratedCount = Object.values(messageImpacts).filter(v => v > 0).length;
  const highImpact = Object.entries(messageImpacts).filter(([_, v]) => v >= 2);

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-burg-core)", fontFamily: "var(--aw-font-display)" }}>The money soundtrack of your childhood</h3>
      <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>Dr. Nasrat calls these "financial scripts." They are the phrases that played on repeat in your home, and they became the invisible rules you carry into adulthood.</p>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontFamily: "var(--aw-font-sans)" }}>For each message below, rate how present it was in your childhood. Messages you rate as "heard often" or "defined my childhood" will reveal how they likely show up in your adult financial behaviour.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {MONEY_MESSAGES.map(msg => {
          const impact = messageImpacts[msg.id] || 0;
          const isHigh = impact >= 2;
          const isExpanded = expandedMsg === msg.id;
          return (
            <div key={msg.id} style={{ borderRadius: 12, border: `1.5px solid ${isHigh ? "var(--aw-rose-core)" : "var(--aw-border, #E8DDD6)"}`, background: isHigh ? "#FFFBF9" : "white", overflow: "hidden", transition: "all 0.3s" }}>
              <div style={{ padding: "16px 18px" }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 4, fontFamily: "var(--aw-font-display)" }}>"{msg.phrase}"</div>
                <div style={{ fontSize: 12, color: "var(--aw-soft-grey, #A89B94)", marginBottom: 14, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>Origin: {msg.origin}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {IMPACT_LEVELS.map(lvl => {
                    const sel = impact === lvl.value;
                    return <button key={lvl.value} onClick={() => setMessageImpact(msg.id, lvl.value)} style={{ padding: "7px 14px", borderRadius: 20, fontSize: 13, fontWeight: sel ? 600 : 400, border: `1.5px solid ${sel ? lvl.color : "var(--aw-border, #E8DDD6)"}`, background: sel ? `${lvl.color}15` : "white", color: sel ? lvl.color : "var(--aw-dark-grey)", cursor: "pointer", transition: "all 0.2s", fontFamily: "var(--aw-font-sans)" }}>{lvl.label}</button>;
                  })}
                </div>
              </div>
              {isHigh && (
                <FadeIn>
                  <div style={{ borderTop: "1px solid var(--aw-border, #E8DDD6)" }}>
                    <button onClick={() => setExpandedMsg(isExpanded ? null : msg.id)} style={{ width: "100%", padding: "12px 18px", background: "var(--aw-rose-pale)", border: "none", cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--aw-burg-core)", fontFamily: "var(--aw-font-sans)" }}>How this shows up in your adult life</span>
                      <span style={{ fontSize: 16, color: "var(--aw-burg-core)", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▾</span>
                    </button>
                    {isExpanded && <FadeIn><div style={{ padding: "14px 18px 18px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.65, background: "var(--aw-rose-pale)", fontFamily: "var(--aw-font-sans)" }}>{msg.adultPattern}</div></FadeIn>}
                  </div>
                </FadeIn>
              )}
            </div>
          );
        })}
      </div>
      {ratedCount > 0 && (
        <FadeIn><div style={{ marginTop: 24, padding: "14px 18px", borderRadius: 10, background: "white", border: "1px solid var(--aw-border, #E8DDD6)" }}><span style={{ fontSize: 13, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-sans)" }}>{ratedCount} message{ratedCount !== 1 ? "s" : ""} rated{highImpact.length > 0 && <span style={{ color: "var(--aw-burg-core)", fontWeight: 600 }}> / {highImpact.length} with high impact</span>}</span></div></FadeIn>
      )}

    </div>
  );
}

/* ── STEP 3: Memory Excavation ────────────────────────── */

function Step3({ memories, setMemory, activePrompt, setActivePrompt, onNext, onBack }) {
  const filledCount = MEMORY_PROMPTS.filter(p => memories[p.fid] && memories[p.fid].trim()).length;
  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-burg-core)", fontFamily: "var(--aw-font-display)" }}>Memory excavation</h3>
      <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>Your financial blueprint was written in moments you may not have thought about in years. This exercise asks you to recall five specific memories. Take your time.</p>
      <div style={{ margin: "0 0 24px", padding: "12px 16px", borderRadius: 8, background: "var(--aw-rose-pale)", fontSize: 13, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontFamily: "var(--aw-font-sans)" }}>
        <strong style={{ color: "var(--aw-burg-core)" }}>A note from the therapist's chair:</strong> You do not need perfect recall. Impressions, feelings, and fragments count. If a prompt brings up nothing, skip it. If one brings up a lot, stay with it.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {MEMORY_PROMPTS.map((p, i) => {
          const isActive = activePrompt === p.id;
          const hasContent = memories[p.fid] && memories[p.fid].trim().length > 0;
          return (
            <div key={p.id} style={{ borderRadius: 12, border: `1.5px solid ${isActive ? "var(--aw-burg-core)" : hasContent ? "var(--aw-green, #3D7A5F)" : "var(--aw-border, #E8DDD6)"}`, background: isActive ? "white" : hasContent ? "#E8F3ED" : "white", overflow: "hidden" }}>
              <button onClick={() => setActivePrompt(isActive ? null : p.id)} style={{ width: "100%", padding: "14px 18px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: hasContent ? "var(--aw-green, #3D7A5F)" : isActive ? "var(--aw-burg-core)" : "var(--aw-border, #E8DDD6)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, fontFamily: "var(--aw-font-sans)" }}>{hasContent ? "✓" : i + 1}</div>
                <span style={{ fontSize: 15, fontWeight: isActive || hasContent ? 600 : 400, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-sans)" }}>{p.label}</span>
              </button>
              {isActive && (
                <FadeIn><div style={{ padding: "0 18px 18px" }}>
                  <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>{p.help}</p>
                  <textarea value={memories[p.fid] || ""} onChange={e => setMemory(p.fid, e.target.value)} rows={4} placeholder="Write what comes to mind..." style={{ width: "100%", padding: "12px 14px", border: "1.5px solid var(--aw-border, #E8DDD6)", borderRadius: 8, fontSize: 15, color: "var(--aw-dark-grey)", lineHeight: 1.6, resize: "vertical", boxSizing: "border-box", fontFamily: "var(--aw-font-sans)" }} />
                </div></FadeIn>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 16, fontSize: 13, color: "var(--aw-soft-grey, #A89B94)", fontFamily: "var(--aw-font-sans)" }}>{filledCount} of {MEMORY_PROMPTS.length} memories recorded</div>

    </div>
  );
}

/* ── STEP 4: Family Value System ──────────────────────── */

function Step4({ signalChecks, toggleSignal, onNext, onBack }) {
  const primaryValue = (() => {
    let best = null, bestCount = 0;
    VALUE_SYSTEMS.forEach(vs => {
      const count = vs.signals.filter(s => signalChecks[vs.id + ":" + s]).length;
      if (count > bestCount) { best = vs.id; bestCount = count; }
    });
    return bestCount >= 2 ? best : null;
  })();

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 600, color: "var(--aw-burg-core)", fontFamily: "var(--aw-font-display)" }}>Your family's money values</h3>
      <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>Dr. Nasrat identifies six family value systems that shape financial behaviour. Most families are a blend, but one or two tend to dominate.</p>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.5, fontFamily: "var(--aw-font-sans)" }}>For each value system, review the signals. Check the ones that were true in your home. The system with the most checked signals is likely your primary inherited blueprint.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {VALUE_SYSTEMS.map(vs => {
          const checkedCount = vs.signals.filter(s => signalChecks[vs.id + ":" + s]).length;
          const isPrimary = vs.id === primaryValue;
          return (
            <div key={vs.id} style={{ borderRadius: 12, border: `1.5px solid ${isPrimary ? "var(--aw-burg-core)" : checkedCount > 0 ? "var(--aw-rose-core)" : "var(--aw-border, #E8DDD6)"}`, background: isPrimary ? "var(--aw-rose-pale)" : "white", overflow: "hidden" }}>
              <div style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 22 }}>{vs.icon}</span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)" }}>{vs.label}</div>
                    <div style={{ fontSize: 13, color: "var(--aw-dark-grey)", fontStyle: "italic", fontFamily: "var(--aw-font-sans)" }}>{vs.tagline}</div>
                  </div>
                  {isPrimary && <span style={{ marginLeft: "auto", padding: "3px 10px", borderRadius: 12, background: "var(--aw-burg-core)", color: "white", fontSize: 11, fontWeight: 600, fontFamily: "var(--aw-font-sans)" }}>Primary</span>}
                </div>
                <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                  {vs.signals.map(sig => {
                    const key = vs.id + ":" + sig;
                    const checked = !!signalChecks[key];
                    return (
                      <label key={key} style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", padding: "4px 0" }}>
                        <input type="checkbox" checked={checked} onChange={() => toggleSignal(key)} style={{ accentColor: "var(--aw-burg-core)", width: 16, height: 16, marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.45, fontFamily: "var(--aw-font-sans)" }}>{sig}</span>
                      </label>
                    );
                  })}
                </div>
                {checkedCount > 0 && <div style={{ marginTop: 6, fontSize: 12, color: "var(--aw-soft-grey, #A89B94)", fontFamily: "var(--aw-font-sans)" }}>{checkedCount} of {vs.signals.length} signals present</div>}
              </div>
              {checkedCount >= 2 && (
                <FadeIn><div style={{ padding: "14px 18px", borderTop: "1px solid var(--aw-border, #E8DDD6)", background: "var(--aw-rose-pale)", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.65, fontFamily: "var(--aw-font-sans)" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--aw-burg-core)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, fontFamily: "var(--aw-font-sans)" }}>What this blueprint creates in adulthood</div>
                  {vs.blueprint}
                </div></FadeIn>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}

/* ── STEP 5: Blueprint Summary ────────────────────────── */

function Step5({ household, atmosphere, messageImpacts, memories, signalChecks, onBack }) {
  const householdInfo = HOUSEHOLD_TYPES.find(h => h.id === household);
  const activeAtmosphere = MONEY_ATMOSPHERE.filter(a => atmosphere.includes(a.id));
  const negAtmosphere = activeAtmosphere.filter(a => a.valence === "negative");
  const posAtmosphere = activeAtmosphere.filter(a => a.valence === "positive");
  const highImpactMessages = MONEY_MESSAGES.filter(m => (messageImpacts[m.id] || 0) >= 2);
  const filledMemories = MEMORY_PROMPTS.filter(p => memories[p.fid] && memories[p.fid].trim()).length;

  const primaryValue = (() => {
    let best = null, bestCount = 0;
    VALUE_SYSTEMS.forEach(vs => { const c = vs.signals.filter(s => signalChecks[vs.id + ":" + s]).length; if (c > bestCount) { best = vs.id; bestCount = c; } });
    return best ? VALUE_SYSTEMS.find(v => v.id === best) : null;
  })();
  const secondaryValue = (() => {
    const pid = primaryValue?.id;
    let best = null, bestCount = 0;
    VALUE_SYSTEMS.forEach(vs => { if (vs.id === pid) return; const c = vs.signals.filter(s => signalChecks[vs.id + ":" + s]).length; if (c > bestCount && c >= 2) { best = vs.id; bestCount = c; } });
    return best ? VALUE_SYSTEMS.find(v => v.id === best) : null;
  })();

  return (
    <div>
      <h3 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 600, color: "var(--aw-burg-core)", textAlign: "center", fontFamily: "var(--aw-font-display)" }}>Your Inherited Financial Blueprint</h3>
      <FadeIn>
        <div style={{ background: "var(--aw-burg-core)", borderRadius: 16, padding: "28px", color: "white", marginBottom: 24 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.2em", opacity: 0.6, marginBottom: 16, fontFamily: "var(--aw-font-sans)" }}>The home that shaped you</div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
            {householdInfo && <div style={{ padding: "10px 16px", borderRadius: 10, background: "rgba(255,255,255,0.1)", flex: "1 1 200px" }}><div style={{ fontSize: 12, opacity: 0.6, fontFamily: "var(--aw-font-sans)" }}>Household</div><div style={{ fontSize: 15, fontWeight: 600, fontFamily: "var(--aw-font-sans)" }}>{householdInfo.icon} {householdInfo.label}</div></div>}
            {primaryValue && <div style={{ padding: "10px 16px", borderRadius: 10, background: "rgba(255,255,255,0.1)", flex: "1 1 200px" }}><div style={{ fontSize: 12, opacity: 0.6, fontFamily: "var(--aw-font-sans)" }}>Primary value system</div><div style={{ fontSize: 15, fontWeight: 600, fontFamily: "var(--aw-font-sans)" }}>{primaryValue.icon} {primaryValue.label}</div></div>}
            {secondaryValue && <div style={{ padding: "10px 16px", borderRadius: 10, background: "rgba(255,255,255,0.1)", flex: "1 1 200px" }}><div style={{ fontSize: 12, opacity: 0.6, fontFamily: "var(--aw-font-sans)" }}>Secondary influence</div><div style={{ fontSize: 15, fontWeight: 600, fontFamily: "var(--aw-font-sans)" }}>{secondaryValue.icon} {secondaryValue.label}</div></div>}
          </div>
          <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 8, fontFamily: "var(--aw-font-sans)" }}>Money atmosphere balance</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {posAtmosphere.length > 0 && <span style={{ padding: "4px 12px", borderRadius: 12, background: "rgba(61,122,95,0.25)", fontSize: 13, fontFamily: "var(--aw-font-sans)" }}>{posAtmosphere.length} stabilising factor{posAtmosphere.length > 1 ? "s" : ""}</span>}
            {negAtmosphere.length > 0 && <span style={{ padding: "4px 12px", borderRadius: 12, background: "rgba(196,114,127,0.25)", fontSize: 13, fontFamily: "var(--aw-font-sans)" }}>{negAtmosphere.length} stress factor{negAtmosphere.length > 1 ? "s" : ""}</span>}
          </div>
        </div>
      </FadeIn>

      {highImpactMessages.length > 0 && (
        <FadeIn delay={200}>
          <div style={{ background: "white", borderRadius: 16, padding: "24px", border: "1px solid var(--aw-border, #E8DDD6)", marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 14, fontFamily: "var(--aw-font-sans)" }}>The scripts that shaped you most</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {highImpactMessages.map(m => {
                const isDefining = (messageImpacts[m.id] || 0) === 3;
                return (
                  <div key={m.id} style={{ padding: "10px 14px", borderRadius: 8, background: isDefining ? "#FDEAEA" : "#FDF3E0", borderLeft: `3px solid ${isDefining ? "var(--aw-red, #A23B3B)" : "var(--aw-amber, #B8860B)"}` }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-display)" }}>"{m.phrase}"</div>
                    <div style={{ fontSize: 12, color: "var(--aw-dark-grey)", marginTop: 2, fontFamily: "var(--aw-font-sans)" }}>{isDefining ? "Defining message" : "Frequently heard"} / {m.origin}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>
      )}

      <FadeIn delay={400}>
        <div style={{ background: "white", borderRadius: 16, padding: "24px", border: "1px solid var(--aw-border, #E8DDD6)", marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-dark-grey)", marginBottom: 8, fontFamily: "var(--aw-font-sans)" }}>Memories recorded</div>
          <p style={{ margin: 0, fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.6, fontFamily: "var(--aw-font-sans)" }}>You captured {filledMemories} memor{filledMemories === 1 ? "y" : "ies"}. These are the raw material that Part 3 (Money Scripts) and Part 4 (Emotional Triggers) will build on. The patterns you identified here are not your fault. They were given to you. What you do with them from this point forward is your choice.</p>
        </div>
      </FadeIn>

      <FadeIn delay={600}>
        <div style={{ background: "var(--aw-rose-pale)", borderRadius: 16, padding: "24px", borderLeft: "4px solid var(--aw-rose-core)", marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--aw-rose-core)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontFamily: "var(--aw-font-sans)" }}>What comes next</div>
          <p style={{ margin: 0, fontSize: 15, color: "var(--aw-dark-grey)", lineHeight: 1.65, fontFamily: "var(--aw-font-sans)" }}>In Part 3, you will take the raw material from this section and distill it into your personal money script: the single narrative that governs how you earn, spend, save, and relate to money as an adult. The blueprint was given to you. The script is what you wrote from it. And the script can be rewritten.</p>
        </div>
      </FadeIn>


    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */

export default function Section2Blueprint({ section, answers = {}, onAnswerChange, step = 0, onStepChange }) {
  // ── Read persisted state ──
  const household     = answers.s02_household || null;
  const atmosphere    = answers.s02_atmosphere || [];
  const messageImpacts = answers.s02_messages || {};
  const signalChecks  = answers.s02_value_signals || {};

  // ── Local UI state ──
  const [expandedMsg, setExpandedMsg] = useState(null);
  const [activePrompt, setActivePrompt] = useState(null);

  // ── Save helper ──
  const save = (fieldId, value) => { if (onAnswerChange) onAnswerChange(fieldId, value); };

  const toggleAtmosphere = (id) => {
    const next = atmosphere.includes(id) ? atmosphere.filter(x => x !== id) : [...atmosphere, id];
    save("s02_atmosphere", next);
  };

  const setMessageImpact = (msgId, val) => {
    save("s02_messages", { ...messageImpacts, [msgId]: val });
  };

  const setMemory = (fid, val) => { save(fid, val); };

  const toggleSignal = (key) => {
    save("s02_value_signals", { ...signalChecks, [key]: !signalChecks[key] });
  };

  // Build memories object from answers for display
  const memories = {};
  MEMORY_PROMPTS.forEach(p => { memories[p.fid] = answers[p.fid] || ""; });



  const STEPS = ["Your home", "Money soundtrack", "Memories", "Values", "Blueprint"];

  return (
    <div>
      {/* Section header */}
      <div style={{ marginBottom: 36 }}>
        {section?.part_label && <p style={{ fontFamily: "var(--aw-font-sans)", fontWeight: 700, fontSize: 10, lineHeight: 1.4, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--aw-rose-core)", margin: "0 0 8px" }}>{section.part_label}</p>}
        {section?.heading && <h1 style={{ fontFamily: "var(--aw-font-display)", fontWeight: 400, fontSize: "clamp(34px, 4.6vw, 52px)", lineHeight: 1.05, letterSpacing: "-0.015em", color: "var(--aw-burg-core)", margin: 0 }}>{section.heading}</h1>}
        {section?.intro && <p style={{ fontFamily: "var(--aw-font-sans)", fontWeight: 300, fontSize: 16, lineHeight: 1.85, color: "var(--aw-dark-grey)", margin: "18px 0 0" }}>{section.intro}</p>}
      </div>

      <StepIndicator steps={STEPS} current={step} />

      {step === 0 && <Step1 household={household} setHousehold={v => save("s02_household", v)} atmosphere={atmosphere} toggleAtmosphere={toggleAtmosphere} onNext={() => onStepChange?.(step + 1)} />}
      {step === 1 && <Step2 messageImpacts={messageImpacts} setMessageImpact={setMessageImpact} expandedMsg={expandedMsg} setExpandedMsg={setExpandedMsg} onNext={() => onStepChange?.(step + 1)} onBack={() => onStepChange?.(step - 1)} />}
      {step === 2 && <Step3 memories={memories} setMemory={setMemory} activePrompt={activePrompt} setActivePrompt={setActivePrompt} onNext={() => onStepChange?.(step + 1)} onBack={() => onStepChange?.(step - 1)} />}
      {step === 3 && <Step4 signalChecks={signalChecks} toggleSignal={toggleSignal} onNext={() => onStepChange?.(step + 1)} onBack={() => onStepChange?.(step - 1)} />}
      {step === 4 && <Step5 household={household} atmosphere={atmosphere} messageImpacts={messageImpacts} memories={memories} signalChecks={signalChecks} onBack={() => onStepChange?.(step - 1)} />}
    </div>
  );
}