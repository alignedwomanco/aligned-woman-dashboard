import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import base44 from "@/api/base44";
import { Loader2, BookOpen, ArrowLeft, ArrowRight, Download, ChevronLeft, ChevronRight, Check, Lock, Zap, UtensilsCrossed, BarChart3, TrendingUp, X, Menu } from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────────

const WORKBOOK_SECTIONS = [
  { id: "intro", label: "Welcome", icon: "✦" },
  { id: "pillar1", label: "01 Protein", icon: "01" },
  { id: "pillar2", label: "02 Blood Sugar", icon: "02" },
  { id: "pillar3", label: "03 Gut Health", icon: "03" },
  { id: "pillar4", label: "04 Rhythm", icon: "04" },
  { id: "pillar5", label: "05 Awareness", icon: "05" },
  { id: "commitments", label: "Commitments", icon: "♡" },
  { id: "notes", label: "Notes", icon: "✎" },
];

const TOOL_TABS = [
  { id: "calculator", label: "My Target", icon: Zap },
  { id: "mealbuilder", label: "Meal Builder", icon: UtensilsCrossed },
  { id: "tracker", label: "Daily Log", icon: BarChart3 },
  { id: "dashboard", label: "Dashboard", icon: TrendingUp },
];

const PROTEIN_REFERENCE = [
  ["Eggs (3)", "3-egg omelette", "~21g"],
  ["Tinned tuna", "1 tin drained", "~25g"],
  ["Grilled chicken", "100g", "~25-30g"],
  ["Greek yogurt", "200g plain", "~18-20g"],
  ["Cottage cheese", "200g", "~22g"],
  ["Lentils (cooked)", "1 cup", "~18g"],
  ["Salmon fillet", "120g", "~25g"],
  ["Whey protein", "1 scoop", "~25g"],
];

// ── Shared UI helpers ──────────────────────────────────────────────────────────

function SectionHeader({ kicker, title, emphasis }) {
  return (
    <>
      <p
        className="text-[9px] tracking-[0.22em] font-bold uppercase mb-1.5"
        style={{ color: "var(--aw-rose-core)" }}
      >
        {kicker}
      </p>
      <h2
        className="text-2xl mb-1"
        style={{ fontFamily: "var(--aw-font-display)", color: "var(--aw-burg-core)", lineHeight: 1.15 }}
      >
        {title} <em style={{ color: "var(--aw-rose-core)", fontStyle: "italic" }}>{emphasis}</em>
      </h2>
      <div className="w-10 h-0.5 mt-2.5 mb-5" style={{ background: "var(--aw-rose-core)" }} />
    </>
  );
}

function Callout({ label, children }) {
  return (
    <div
      className="rounded-r-lg p-4 my-4"
      style={{ background: "var(--aw-rose-wash)", borderLeft: "3px solid var(--aw-rose-core)" }}
    >
      <p className="text-[8px] tracking-[0.15em] font-bold uppercase mb-1" style={{ color: "var(--aw-rose-deep)" }}>
        {label}
      </p>
      <p className="text-[13px] leading-7" style={{ color: "var(--aw-burg-core)", fontWeight: 400 }}>
        {children}
      </p>
    </div>
  );
}

function SubHeading({ children }) {
  return (
    <p className="text-base mb-2 mt-5" style={{ fontFamily: "var(--aw-font-display)", fontStyle: "italic", color: "var(--aw-burg-core)" }}>
      {children}
    </p>
  );
}

function BodyText({ children, className = "" }) {
  return (
    <p className={`text-[13px] leading-7 mb-3 ${className}`} style={{ color: "var(--aw-dark-grey)", fontWeight: 300 }}>
      {children}
    </p>
  );
}

function AuditTextarea({ value, onChange, placeholder, rows = 2 }) {
  return (
    <textarea
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2.5 text-xs rounded-lg border outline-none resize-none mb-2"
      style={{
        borderColor: "var(--aw-rose-pale)",
        fontFamily: "var(--aw-font-sans)",
        color: "var(--aw-dark-grey)",
        lineHeight: 1.7,
      }}
    />
  );
}

function SaveButton({ onClick, isSaving, label = "Save" }) {
  return (
    <button
      onClick={onClick}
      disabled={isSaving}
      className="mt-3 px-5 py-2 rounded-full text-[10px] font-semibold tracking-wide uppercase transition-all disabled:opacity-40"
      style={{
        background: "var(--aw-rose-core)",
        color: "var(--aw-white)",
        fontFamily: "var(--aw-font-sans)",
      }}
    >
      {isSaving ? "Saving..." : label}
    </button>
  );
}

// ── Protein Calculator Tool ────────────────────────────────────────────────────

function ProteinCalculator({ profile, onSave, isSaving }) {
  const [form, setForm] = useState({
    age: profile?.age || "",
    weight_kg: profile?.weight_kg || "",
    height_cm: profile?.height_cm || "",
    activity_level: profile?.activity_level || "moderately_active",
  });

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const target = useMemo(() => {
    const w = parseFloat(form.weight_kg);
    if (!w || w <= 0) return null;
    const multipliers = {
      sedentary: 1.2,
      lightly_active: 1.4,
      moderately_active: 1.6,
      very_active: 1.8,
    };
    const mult = multipliers[form.activity_level] || 1.6;
    const proteinG = Math.round(w * mult);
    const perMeal = Math.round(proteinG / 3);
    return { daily: proteinG, perMeal };
  }, [form.weight_kg, form.activity_level]);

  const handleSave = () => {
    onSave({
      age: parseInt(form.age) || 0,
      weight_kg: parseFloat(form.weight_kg) || 0,
      height_cm: parseFloat(form.height_cm) || 0,
      activity_level: form.activity_level,
      protein_target_g: target?.daily || 0,
    });
  };

  const activityOptions = [
    { value: "sedentary", label: "Sedentary", desc: "Desk job, minimal exercise" },
    { value: "lightly_active", label: "Lightly Active", desc: "Light exercise 1-3 days/week" },
    { value: "moderately_active", label: "Moderately Active", desc: "Moderate exercise 3-5 days/week" },
    { value: "very_active", label: "Very Active", desc: "Hard exercise 6-7 days/week" },
  ];

  return (
    <div>
      <p
        className="text-[9px] tracking-[0.22em] font-bold uppercase mb-1.5"
        style={{ color: "var(--aw-rose-core)" }}
      >
        Protein Calculator
      </p>
      <h3
        className="text-lg mb-1"
        style={{ fontFamily: "var(--aw-font-display)", color: "var(--aw-burg-core)" }}
      >
        Find Your <em style={{ color: "var(--aw-rose-core)" }}>Target.</em>
      </h3>
      <div className="w-8 h-0.5 mb-4" style={{ background: "var(--aw-rose-core)" }} />

      <p className="text-xs mb-4" style={{ color: "var(--aw-dark-grey)", fontWeight: 300, lineHeight: 1.7 }}>
        Your protein target depends on your weight and activity level. Enter your details below to calculate your personalised daily and per-meal targets.
      </p>

      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "age", label: "Age", placeholder: "e.g. 35" },
            { key: "weight_kg", label: "Weight (kg)", placeholder: "e.g. 65" },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-[10px] font-semibold mb-1" style={{ color: "var(--aw-burg-core)" }}>{f.label}</label>
              <input
                type="number"
                value={form[f.key]}
                onChange={e => update(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full px-3 py-2 text-xs rounded-lg border outline-none focus:ring-1"
                style={{ borderColor: "var(--aw-rose-pale)", background: "var(--aw-white)", color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-sans)" }}
              />
            </div>
          ))}
        </div>
        <div>
          <label className="block text-[10px] font-semibold mb-1" style={{ color: "var(--aw-burg-core)" }}>Height (cm)</label>
          <input
            type="number"
            value={form.height_cm}
            onChange={e => update("height_cm", e.target.value)}
            placeholder="e.g. 165"
            className="w-full px-3 py-2 text-xs rounded-lg border outline-none focus:ring-1"
            style={{ borderColor: "var(--aw-rose-pale)", background: "var(--aw-white)", color: "var(--aw-dark-grey)", fontFamily: "var(--aw-font-sans)" }}
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold mb-1" style={{ color: "var(--aw-burg-core)" }}>Activity Level</label>
          <div className="space-y-1.5">
            {activityOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => update("activity_level", opt.value)}
                className="w-full text-left px-3 py-2 rounded-lg border transition-all"
                style={{
                  borderColor: form.activity_level === opt.value ? "var(--aw-rose-core)" : "var(--aw-rose-pale)",
                  background: form.activity_level === opt.value ? "var(--aw-rose-wash)" : "var(--aw-white)",
                }}
              >
                <span className="text-xs font-semibold" style={{ color: "var(--aw-burg-core)" }}>{opt.label}</span>
                <span className="block text-[10px] mt-0.5" style={{ color: "var(--aw-mid-grey)", fontWeight: 300 }}>{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {target && (
        <div
          className="rounded-xl p-4 mb-4 text-center"
          style={{ background: "linear-gradient(135deg, var(--aw-ink), var(--aw-burg-core))" }}
        >
          <p className="text-[8px] tracking-[0.2em] font-bold uppercase mb-2" style={{ color: "var(--aw-rose-core)" }}>
            Your Daily Protein Target
          </p>
          <p className="text-3xl mb-1" style={{ fontFamily: "var(--aw-font-display)", fontStyle: "italic", color: "var(--aw-rose-light)" }}>
            {target.daily}g
          </p>
          <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>
            approximately {target.perMeal}g per meal across 3 meals
          </p>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={!target || isSaving}
        className="w-full py-2.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-all disabled:opacity-40"
        style={{ background: "var(--aw-rose-core)", color: "var(--aw-white)", fontFamily: "var(--aw-font-sans)" }}
      >
        {isSaving ? "Saving..." : profile?.protein_target_g ? "Update My Target" : "Save My Target"}
      </button>
    </div>
  );
}

// ── Tool Placeholders ──────────────────────────────────────────────────────────

function ToolPlaceholder({ kicker, title, emphasis, icon: Icon, description }) {
  return (
    <div>
      <p className="text-[9px] tracking-[0.22em] font-bold uppercase mb-1.5" style={{ color: "var(--aw-rose-core)" }}>{kicker}</p>
      <h3 className="text-lg mb-1" style={{ fontFamily: "var(--aw-font-display)", color: "var(--aw-burg-core)" }}>
        {title} <em style={{ color: "var(--aw-rose-core)" }}>{emphasis}</em>
      </h3>
      <div className="w-8 h-0.5 mb-4" style={{ background: "var(--aw-rose-core)" }} />
      <div className="rounded-xl p-6 text-center" style={{ background: "var(--aw-rose-wash)", border: "1.5px dashed var(--aw-rose-pale)" }}>
        <Icon className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--aw-rose-core)" }} />
        <p className="text-sm font-medium mb-1" style={{ color: "var(--aw-burg-core)" }}>Coming Soon</p>
        <p className="text-xs" style={{ color: "var(--aw-mid-grey)", fontWeight: 300 }}>{description}</p>
      </div>
    </div>
  );
}

// ── Workbook Content: Welcome ──────────────────────────────────────────────────

function WelcomeSection() {
  return (
    <div>
      <div
        className="rounded-xl p-7 text-center mb-6"
        style={{ background: "linear-gradient(160deg, var(--aw-ink), var(--aw-burg-dark), var(--aw-burg-core))" }}
      >
        <p className="text-[7px] tracking-[0.3em] font-bold uppercase mb-2" style={{ color: "var(--aw-rose-core)" }}>
          The Aligned Woman Blueprint
        </p>
        <p className="text-3xl mb-2" style={{ fontFamily: "var(--aw-font-display)", fontStyle: "italic", color: "var(--aw-rose-light)", lineHeight: 1.1 }}>
          Food Blueprint
        </p>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>with Danielle Venter</p>
      </div>

      <SectionHeader kicker="Before You Begin" title="How to Use This" emphasis="Workbook." />

      <BodyText>
        This is not another diet plan. This is a framework for how you nourish yourself for the rest of your life. Danielle's masterclass introduced five pillars of aligned nutrition. This workbook will help you apply each one.
      </BodyText>

      {[
        { n: "01", t: "Complete it honestly.", d: "No right answers. Write what is true for you right now." },
        { n: "02", t: "Use the interactive tools.", d: "The calculator, meal builder, and tracker turn knowledge into action." },
        { n: "03", t: "Start with one pillar.", d: "Pick the most urgent. Build confidence there, the rest follows." },
      ].map(r => (
        <div key={r.n} className="flex gap-3 mb-3">
          <span className="text-2xl min-w-[32px]" style={{ fontFamily: "var(--aw-font-display)", fontStyle: "italic", color: "var(--aw-rose-pale)" }}>{r.n}</span>
          <div>
            <p className="text-sm mb-0.5" style={{ fontFamily: "var(--aw-font-display)", fontStyle: "italic", color: "var(--aw-burg-core)" }}>{r.t}</p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--aw-dark-grey)", fontWeight: 300 }}>{r.d}</p>
          </div>
        </div>
      ))}

      <Callout label="The Framework">
        Protein is your anchor. Balance your blood sugar. Support your gut. Eat with rhythm, not restriction. Nourish with awareness, not control.
      </Callout>
    </div>
  );
}

// ── Workbook Content: Pillar 1 (Protein) ───────────────────────────────────────

function Pillar1Section({ auditData, onSaveAudit, isSaving }) {
  const [meals, setMeals] = useState(auditData?.meals || { breakfast: { food: "", protein: "" }, lunch: { food: "", protein: "" }, dinner: { food: "", protein: "" } });
  const [reflection, setReflection] = useState(auditData?.reflection || "");
  const updateMeal = (meal, field, value) => setMeals(prev => ({ ...prev, [meal]: { ...prev[meal], [field]: value } }));

  return (
    <div>
      <SectionHeader kicker="Pillar One" title="Protein is Your" emphasis="Anchor." />

      <BodyText>
        Protein is not just for athletes. It does not make you bulky. It is the building block of your hormones, neurotransmitters, muscle, and mood. Most women eat half the protein they need, especially in the morning.
      </BodyText>

      <SubHeading>Why Protein Matters for Women</SubHeading>
      {[
        { b: "Hormone Production:", t: "Insulin, thyroid hormones, dopamine, serotonin, and leptin are all made from amino acids." },
        { b: "Lean Muscle:", t: "From age 30, women lose 3-8% per decade. Protein is your anti-aging tool." },
        { b: "Blood Sugar Balance:", t: "Protein slows the absorption of glucose. It stabilises your energy and curbs cravings." },
        { b: "Satiety:", t: "Protein is the most filling macronutrient. It reduces the urge to snack on sugar." },
      ].map(item => (
        <BodyText key={item.b}>
          <strong style={{ fontWeight: 600, color: "var(--aw-burg-core)" }}>{item.b}</strong> {item.t}
        </BodyText>
      ))}

      <Callout label="Your Daily Target">
        <strong>80-120g protein per day</strong>, 20-30g per meal. Use the calculator in the Tools panel to find your exact target.
      </Callout>

      <SubHeading>Protein Reference Guide</SubHeading>
      <div className="rounded-lg overflow-hidden border mb-5" style={{ borderColor: "var(--aw-rose-pale)" }}>
        <div className="grid grid-cols-[2fr_1.5fr_1fr] px-3 py-1.5" style={{ background: "var(--aw-burg-core)" }}>
          {["Food", "Serving", "Protein"].map(h => (
            <p key={h} className="text-[8px] tracking-[0.1em] font-bold uppercase" style={{ color: "var(--aw-white)" }}>{h}</p>
          ))}
        </div>
        {PROTEIN_REFERENCE.map((row, i) => (
          <div key={i} className="grid grid-cols-[2fr_1.5fr_1fr] px-3 py-1.5" style={{ background: i % 2 === 0 ? "var(--aw-white)" : "var(--aw-rose-wash)", borderBottom: "1px solid var(--aw-rose-pale)" }}>
            {row.map((cell, j) => (
              <p key={j} className="text-[11px]" style={{ color: j === 2 ? "var(--aw-burg-core)" : "var(--aw-dark-grey)", fontWeight: j === 2 ? 600 : 300 }}>{cell}</p>
            ))}
          </div>
        ))}
      </div>

      <SubHeading>Your Protein Audit</SubHeading>
      <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--aw-dark-grey)", fontWeight: 300 }}>
        Think about yesterday. Estimate your protein at each meal.
      </p>
      {["breakfast", "lunch", "dinner"].map(meal => (
        <div key={meal} className="flex gap-2 mb-2">
          <div className="min-w-[70px] pt-2.5">
            <p className="text-[10px] font-semibold capitalize" style={{ color: "var(--aw-burg-core)" }}>{meal}</p>
          </div>
          <input type="text" value={meals[meal]?.food || ""} onChange={e => updateMeal(meal, "food", e.target.value)} placeholder="What did you eat?" className="flex-[2] px-3 py-2 text-xs rounded-lg border outline-none" style={{ borderColor: "var(--aw-rose-pale)", fontFamily: "var(--aw-font-sans)", color: "var(--aw-dark-grey)" }} />
          <input type="text" value={meals[meal]?.protein || ""} onChange={e => updateMeal(meal, "protein", e.target.value)} placeholder="Est. protein (g)" className="flex-1 px-3 py-2 text-xs rounded-lg border outline-none" style={{ borderColor: "var(--aw-rose-pale)", fontFamily: "var(--aw-font-sans)", color: "var(--aw-dark-grey)" }} />
        </div>
      ))}
      <div className="mt-4">
        <p className="text-[10px] font-semibold mb-1" style={{ color: "var(--aw-burg-core)" }}>Reflection</p>
        <AuditTextarea value={reflection} onChange={setReflection} placeholder="How far are you from your target? What is the biggest gap?" rows={3} />
      </div>
      <SaveButton onClick={() => onSaveAudit("protein", { meals, reflection })} isSaving={isSaving} label="Save Audit" />
    </div>
  );
}

// ── Workbook Content: Pillar 2 (Blood Sugar) ───────────────────────────────────

function Pillar2Section({ auditData, onSaveAudit, isSaving }) {
  const [unpaired, setUnpaired] = useState(auditData?.additional_answers?.unpaired || "");
  const [pairWith, setPairWith] = useState(auditData?.additional_answers?.pair_with || "");
  const [energyLevel, setEnergyLevel] = useState(auditData?.additional_answers?.energy_level || 0);
  const [reflection, setReflection] = useState(auditData?.reflection || "");

  const plateCards = [
    { t: "Protein (Anchor)", d: "Eggs, chicken, fish, cottage cheese, legumes", bg: "var(--aw-burg-core)", c: "var(--aw-white)" },
    { t: "Vegetables (Half Plate)", d: "Colourful veggies, antioxidants, fibre", bg: "#e8f0e4", c: "var(--aw-dark-grey)" },
    { t: "Carbs (Fist-Sized)", d: "Sweet potato, quinoa, rice, fruit", bg: "var(--aw-rose-core)", c: "var(--aw-white)" },
    { t: "Fats (Thumb-Sized)", d: "Olive oil, avocado, nuts, seeds", bg: "var(--aw-rose-pale)", c: "var(--aw-burg-core)" },
  ];

  return (
    <div>
      <SectionHeader kicker="Pillar Two" title="Balance Your" emphasis="Blood Sugar." />

      <BodyText>
        Balanced blood sugar equals balanced hormones. When glucose swings from eating carbs alone, cortisol rises, fat stores around the midsection, and cravings, fatigue, and anxiety follow.
      </BodyText>

      <Callout label="Key Insight">
        Carbohydrates are not the problem. <strong>Unpaired carbohydrates are the problem.</strong> Pair them with protein, fibre, or healthy fat.
      </Callout>

      <SubHeading>The Aligned Plate</SubHeading>
      <div className="grid grid-cols-2 gap-1.5 mb-4">
        {plateCards.map((p, i) => (
          <div key={i} className="rounded-lg px-3.5 py-3" style={{ background: p.bg, color: p.c }}>
            <p className="text-[13px] mb-0.5" style={{ fontFamily: "var(--aw-font-display)", fontStyle: "italic" }}>{p.t}</p>
            <p className="text-[10px] leading-relaxed" style={{ opacity: 0.9 }}>{p.d}</p>
          </div>
        ))}
      </div>

      <SubHeading>Pairing, Not Removing</SubHeading>
      <div className="grid grid-cols-2 gap-1.5 mb-4">
        <div className="rounded-r-lg p-3" style={{ background: "#fce8e6", borderLeft: "3px solid var(--aw-rose-core)" }}>
          <p className="text-[9px] font-bold uppercase mb-1" style={{ color: "var(--aw-rose-deep)" }}>Instead of</p>
          {["Toast alone", "Fruit alone", "Sugary cereal", "Crackers from the drawer"].map(x => (
            <p key={x} className="text-[11px] mb-0.5" style={{ color: "var(--aw-dark-grey)", fontWeight: 300 }}>{x}</p>
          ))}
        </div>
        <div className="rounded-r-lg p-3" style={{ background: "#e8f0e4", borderLeft: "3px solid #6B8E5E" }}>
          <p className="text-[9px] font-bold uppercase mb-1" style={{ color: "#6B8E5E" }}>Try This</p>
          {["Eggs on toast", "Fruit + Greek yogurt", "Yogurt + almonds + berries", "Crackers + cottage cheese"].map(x => (
            <p key={x} className="text-[11px] mb-0.5" style={{ color: "var(--aw-dark-grey)", fontWeight: 300 }}>{x}</p>
          ))}
        </div>
      </div>

      <SubHeading>Your Blood Sugar Audit</SubHeading>
      <AuditTextarea value={unpaired} onChange={setUnpaired} placeholder="List 3 moments this week you ate carbs without protein or fat..." rows={2} />
      <AuditTextarea value={pairWith} onChange={setPairWith} placeholder="For each one, what could you have paired it with?" rows={2} />

      <p className="text-[10px] font-semibold mb-2 mt-3" style={{ color: "var(--aw-burg-core)" }}>
        Afternoon energy level (1-10)
      </p>
      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
          <button
            key={n}
            onClick={() => setEnergyLevel(n)}
            className="w-7 h-7 rounded-full text-[11px] font-semibold flex items-center justify-center transition-all"
            style={{
              border: `2px solid ${energyLevel === n ? "var(--aw-rose-core)" : "var(--aw-rose-pale)"}`,
              background: energyLevel === n ? "var(--aw-rose-core)" : "var(--aw-white)",
              color: energyLevel === n ? "var(--aw-white)" : "var(--aw-mid-grey)",
            }}
          >
            {n}
          </button>
        ))}
      </div>

      <SaveButton
        onClick={() => onSaveAudit("blood_sugar", {
          meals: {},
          reflection,
          additional_answers: { unpaired, pair_with: pairWith, energy_level: energyLevel },
        })}
        isSaving={isSaving}
        label="Save Audit"
      />
    </div>
  );
}

// ── Workbook Content: Pillar 3 (Gut Health) ────────────────────────────────────

function Pillar3Section({ auditData, onSaveAudit, isSaving }) {
  const questions = [
    "How many cups of veg, salad, and fruit did you eat yesterday?",
    "Do you include any probiotic foods? Which ones?",
    "How would you describe your digestion most days?",
    "Do you eat in a calm environment, or are you rushing?",
  ];
  const [answers, setAnswers] = useState(auditData?.additional_answers || {});
  const updateAnswer = (idx, val) => setAnswers(prev => ({ ...prev, [`q${idx}`]: val }));

  const gutSigns = ["Bloating after meals", "Constipation", "Chronic fatigue", "Skin breakouts", "Anxiety or low mood", "Food sensitivities", "Inflammation", "Feeling 'off'"];
  const [checkedSigns, setCheckedSigns] = useState(auditData?.additional_answers?.checked_signs || {});
  const toggleSign = (s) => setCheckedSigns(prev => ({ ...prev, [s]: !prev[s] }));

  return (
    <div>
      <SectionHeader kicker="Pillar Three" title="Your Gut is Your" emphasis="Second Brain." />

      <BodyText>
        Alignment is not just about what you eat. It is about what your body can absorb. If your gut is inflamed, you are not absorbing nutrients. This is why you can eat well and still feel exhausted.
      </BodyText>

      <Callout label="The 90% Statistic">
        90% of your serotonin is made in your gut. Not your brain. Your vagus nerve constantly asks: is it safe or stressed?
      </Callout>

      <SubHeading>Signs of a Dysregulated Gut</SubHeading>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-4">
        {gutSigns.map(s => (
          <button key={s} onClick={() => toggleSign(s)} className="flex items-center gap-2 py-1.5 text-left">
            <div
              className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center transition-all"
              style={{
                border: `2px solid ${checkedSigns[s] ? "var(--aw-rose-core)" : "var(--aw-rose-pale)"}`,
                background: checkedSigns[s] ? "var(--aw-rose-core)" : "var(--aw-white)",
                borderRadius: 3,
              }}
            >
              {checkedSigns[s] && <Check className="w-2.5 h-2.5" style={{ color: "var(--aw-white)" }} />}
            </div>
            <span className="text-[11px]" style={{ color: "var(--aw-dark-grey)", fontWeight: 300 }}>{s}</span>
          </button>
        ))}
      </div>

      <SubHeading>Probiotics + Prebiotics</SubHeading>
      <div className="grid grid-cols-2 gap-1.5 mb-4">
        <div className="rounded-lg p-3" style={{ background: "var(--aw-rose-wash)" }}>
          <p className="text-[13px] mb-0.5" style={{ fontFamily: "var(--aw-font-display)", fontStyle: "italic", color: "var(--aw-burg-core)" }}>Probiotics</p>
          <p className="text-[10px] leading-relaxed" style={{ color: "var(--aw-dark-grey)", fontWeight: 300 }}>Live bacteria: yogurt, kefir, kimchi, sauerkraut</p>
        </div>
        <div className="rounded-lg p-3" style={{ background: "#e8f0e4" }}>
          <p className="text-[13px] mb-0.5" style={{ fontFamily: "var(--aw-font-display)", fontStyle: "italic", color: "var(--aw-burg-core)" }}>Prebiotics</p>
          <p className="text-[10px] leading-relaxed" style={{ color: "var(--aw-dark-grey)", fontWeight: 300 }}>Fibre that feeds probiotics: broccoli, cabbage, apple skins</p>
        </div>
      </div>

      <SubHeading>Your Gut Health Audit</SubHeading>
      {questions.map((q, i) => (
        <AuditTextarea key={i} value={answers[`q${i}`] || ""} onChange={v => updateAnswer(i, v)} placeholder={q} rows={2} />
      ))}

      <SaveButton
        onClick={() => onSaveAudit("gut_health", {
          meals: {},
          reflection: "",
          additional_answers: { ...answers, checked_signs: checkedSigns },
        })}
        isSaving={isSaving}
        label="Save Audit"
      />
    </div>
  );
}

// ── Workbook Content: Pillar 4 (Rhythm) ────────────────────────────────────────

function Pillar4Section({ auditData, onSaveAudit, isSaving }) {
  const rhythmQuestions = [
    "How many meals do you typically eat per day?",
    "Last meal time? First meal next day?",
    "Do you skip meals? What happens?",
    "When do your worst cravings show up?",
  ];
  const [answers, setAnswers] = useState(auditData?.additional_answers || {});
  const [weeklyPrep, setWeeklyPrep] = useState(auditData?.reflection || "");
  const updateAnswer = (idx, val) => setAnswers(prev => ({ ...prev, [`q${idx}`]: val }));

  const dailyRhythm = [
    { t: "7-8am", m: "High-Protein Breakfast", d: "Eggs, smoothie with protein, Greek yogurt" },
    { t: "12-1pm", m: "Satisfying Lunch", d: "100-150g protein with cottage cheese or nuts" },
    { t: "3-4pm", m: "Optional Snack", d: "Biltong, nuts, fruit with nut butter" },
    { t: "6-7pm", m: "Dinner That Satisfies", d: "150g protein, baby potatoes, half plate veggies" },
  ];

  return (
    <div>
      <SectionHeader kicker="Pillar Four" title="Rhythm, Not" emphasis="Restriction." />

      <BodyText>
        Chronic under-eating tells your body: I am not safe. It raises cortisol, stores fat, increases cravings, lowers metabolic rate, disrupts hormones, and causes fatigue. Fat loss happens best in a body that feels safe.
      </BodyText>

      <Callout label="The Truth">
        Stop punishing your body into change. Danielle recommends a maximum 14-hour overnight fast for women.
      </Callout>

      <SubHeading>A Simple Aligned Rhythm</SubHeading>
      <div className="space-y-2 mb-4">
        {dailyRhythm.map((r, i) => (
          <div key={i} className="flex gap-2.5">
            <span className="text-sm min-w-[48px] pt-1.5" style={{ fontFamily: "var(--aw-font-display)", fontStyle: "italic", color: "var(--aw-rose-core)" }}>
              {r.t}
            </span>
            <div className="rounded-md px-3 py-2 flex-1" style={{ background: "var(--aw-rose-wash)" }}>
              <p className="text-[11px] font-semibold" style={{ color: "var(--aw-burg-core)" }}>{r.m}</p>
              <p className="text-[10px]" style={{ color: "var(--aw-dark-grey)", fontWeight: 300 }}>{r.d}</p>
            </div>
          </div>
        ))}
      </div>

      <SubHeading>Your Rhythm Audit</SubHeading>
      {rhythmQuestions.map((q, i) => (
        <AuditTextarea key={i} value={answers[`q${i}`] || ""} onChange={v => updateAnswer(i, v)} placeholder={q} rows={2} />
      ))}

      <SubHeading>Weekly Prep Plan</SubHeading>
      <AuditTextarea value={weeklyPrep} onChange={setWeeklyPrep} placeholder="Write 3-5 go-to meals you could rotate this week..." rows={3} />

      <SaveButton
        onClick={() => onSaveAudit("rhythm", {
          meals: {},
          reflection: weeklyPrep,
          additional_answers: answers,
        })}
        isSaving={isSaving}
        label="Save Audit"
      />
    </div>
  );
}

// ── Workbook Content: Pillar 5 (Awareness) ─────────────────────────────────────

function Pillar5Section({ auditData, onSaveAudit, isSaving }) {
  const reflectionQuestions = [
    "When do you most often eat emotionally? Describe the situation...",
    "What are you feeling right before you reach for food?",
    "What could nourish you that is not food?",
    "Write a compassionate sentence to yourself about food...",
  ];
  const [answers, setAnswers] = useState(auditData?.additional_answers || {});
  const updateAnswer = (idx, val) => setAnswers(prev => ({ ...prev, [`q${idx}`]: val }));

  const pauseChecks = [
    "Am I actually hungry, or stressed/tired/bored?",
    "Could I go outside for a moment?",
    "Could I take three deep breaths?",
    "Could I have water and wait 10 minutes?",
    "Did I eat enough protein at my last meal?",
  ];
  const [checked, setChecked] = useState(auditData?.additional_answers?.pause_checks || {});
  const toggleCheck = (idx) => setChecked(prev => ({ ...prev, [idx]: !prev[idx] }));

  return (
    <div>
      <SectionHeader kicker="Pillar Five" title="Awareness Over" emphasis="Control." />

      <BodyText>
        Food is not only nutrition. It is comfort, celebration, stress release, and connection. An aligned woman does not ask "how do I control myself?" She asks "what do I really need right now?"
      </BodyText>

      <SubHeading>True Hunger vs. Emotional Hunger</SubHeading>
      <div className="grid grid-cols-2 gap-1.5 mb-4">
        <div className="rounded-r-lg p-3" style={{ background: "#e8f0e4", borderLeft: "3px solid #6B8E5E" }}>
          <p className="text-[9px] font-bold uppercase mb-1" style={{ color: "#6B8E5E" }}>True Hunger</p>
          {["Comes on gradually", "Stomach feels empty", "Any food would satisfy", "You eat and feel content"].map(x => (
            <p key={x} className="text-[11px] mb-0.5" style={{ color: "var(--aw-dark-grey)", fontWeight: 300 }}>{x}</p>
          ))}
        </div>
        <div className="rounded-r-lg p-3" style={{ background: "#fce8e6", borderLeft: "3px solid var(--aw-rose-deep)" }}>
          <p className="text-[9px] font-bold uppercase mb-1" style={{ color: "var(--aw-rose-deep)" }}>Emotional Hunger</p>
          {["Comes on suddenly", "Craves specific food", "Mental, not physical", "Never feels satisfied"].map(x => (
            <p key={x} className="text-[11px] mb-0.5" style={{ color: "var(--aw-dark-grey)", fontWeight: 300 }}>{x}</p>
          ))}
        </div>
      </div>

      <Callout label="Danielle's Rule">
        Always try protein first. Then pause 20 minutes. When you nourish properly, urgent cravings stop showing up.
      </Callout>

      <SubHeading>Before You Reach for the Drawer</SubHeading>
      <div className="mb-4">
        {pauseChecks.map((q, i) => (
          <button key={i} onClick={() => toggleCheck(i)} className="flex items-center gap-2 py-1.5 w-full text-left" style={{ borderBottom: "1px solid var(--aw-rose-pale)" }}>
            <div
              className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center transition-all"
              style={{
                border: `2px solid ${checked[i] ? "var(--aw-rose-core)" : "var(--aw-rose-pale)"}`,
                background: checked[i] ? "var(--aw-rose-core)" : "var(--aw-white)",
                borderRadius: 3,
              }}
            >
              {checked[i] && <Check className="w-2.5 h-2.5" style={{ color: "var(--aw-white)" }} />}
            </div>
            <span className="text-[11px]" style={{ color: "var(--aw-dark-grey)", fontWeight: 300 }}>{q}</span>
          </button>
        ))}
      </div>

      <SubHeading>Your Awareness Reflection</SubHeading>
      {reflectionQuestions.map((q, i) => (
        <AuditTextarea key={i} value={answers[`q${i}`] || ""} onChange={v => updateAnswer(i, v)} placeholder={q} rows={i === 3 ? 3 : 2} />
      ))}

      <SaveButton
        onClick={() => onSaveAudit("awareness", {
          meals: {},
          reflection: "",
          additional_answers: { ...answers, pause_checks: checked },
        })}
        isSaving={isSaving}
        label="Save Audit"
      />
    </div>
  );
}

// ── Workbook Content: Commitments ──────────────────────────────────────────────

function CommitmentsSection({ commitmentData, onSaveCommitment, isSaving }) {
  const pillars = [
    { l: "Pillar 1: Protein", p: "My commitment to protein this week is:" },
    { l: "Pillar 2: Blood Sugar", p: "I will stop eating these foods alone and pair them with:" },
    { l: "Pillar 3: Gut Health", p: "I will add these foods to support my gut:" },
    { l: "Pillar 4: Rhythm", p: "My daily eating rhythm will look like:" },
    { l: "Pillar 5: Awareness", p: "When I feel the urge to eat emotionally, I will:" },
  ];
  const [answers, setAnswers] = useState(commitmentData?.commitments || {});
  const updateAnswer = (idx, val) => setAnswers(prev => ({ ...prev, [`p${idx}`]: val }));

  return (
    <div>
      <SectionHeader kicker="Your Aligned Commitments" title="My Food" emphasis="Commitments." />

      <BodyText>
        Based on everything you have learned, write your personal commitments. Not rules. Agreements with yourself.
      </BodyText>

      {pillars.map((c, i) => (
        <div key={i} className="mb-4">
          <p className="text-[8px] tracking-[0.15em] font-bold uppercase mb-0.5" style={{ color: "var(--aw-rose-deep)" }}>{c.l}</p>
          <p className="text-xs mb-1.5" style={{ fontFamily: "var(--aw-font-display)", fontStyle: "italic", color: "var(--aw-burg-core)" }}>{c.p}</p>
          <AuditTextarea value={answers[`p${i}`] || ""} onChange={v => updateAnswer(i, v)} placeholder="Write your commitment..." rows={2} />
        </div>
      ))}

      <SaveButton onClick={() => onSaveCommitment(answers)} isSaving={isSaving} label="Save Commitments" />
    </div>
  );
}

// ── Workbook Content: Notes ────────────────────────────────────────────────────

function NotesSection({ commitmentData, onSaveNotes, isSaving }) {
  const [notes, setNotes] = useState(commitmentData?.notes || "");

  return (
    <div>
      <SectionHeader kicker="Personal Space" title="Notes &" emphasis="Observations." />

      <BodyText>
        Use this space for anything that came up during the masterclass or while working through this workbook.
      </BodyText>

      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Your notes here..."
        rows={12}
        className="w-full px-4 py-3 text-xs rounded-lg border outline-none resize-none"
        style={{
          borderColor: "var(--aw-rose-pale)",
          fontFamily: "var(--aw-font-sans)",
          color: "var(--aw-dark-grey)",
          lineHeight: 1.8,
          minHeight: 300,
        }}
      />

      <SaveButton onClick={() => onSaveNotes(notes)} isSaving={isSaving} label="Save Notes" />
    </div>
  );
}

// ── Main Page Component ────────────────────────────────────────────────────────

export default function NutritionWorkbook() {
  const { search } = useLocation();
  const workbookId = new URLSearchParams(search).get("id") || null;
  const queryClient = useQueryClient();

  const [activeSection, setActiveSection] = useState("intro");
  const [activeToolTab, setActiveToolTab] = useState("calculator");
  const [isMobile, setIsMobile] = useState(false);
  const [mobilePanel, setMobilePanel] = useState("workbook");
  const contentRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [activeSection]);

  // ── Data fetching ──

  const { data: workbook, isLoading: loadingWorkbook } = useQuery({
    queryKey: ["nutritionWorkbook", workbookId],
    queryFn: async () => {
      if (!workbookId) return null;
      const items = await base44.entities.Workbook.filter({ id: workbookId });
      return items[0] || null;
    },
    enabled: !!workbookId,
  });

  const { data: expert } = useQuery({
    queryKey: ["nutritionExpert", workbook?.expert_id],
    queryFn: async () => {
      const items = await base44.entities.Expert.filter({ id: workbook.expert_id });
      return items[0] || null;
    },
    enabled: !!workbook?.expert_id,
  });

  const { data: nutritionProfile } = useQuery({
    queryKey: ["nutritionProfile"],
    queryFn: async () => {
      const items = await base44.entities.NutritionProfile.filter({});
      return items[0] || null;
    },
  });

  const { data: pillarAudits } = useQuery({
    queryKey: ["pillarAudits"],
    queryFn: async () => {
      const items = await base44.entities.NutritionPillarAudit.filter({});
      return items || [];
    },
  });

  const { data: commitmentData } = useQuery({
    queryKey: ["nutritionCommitments"],
    queryFn: async () => {
      const items = await base44.entities.NutritionCommitment.filter({});
      return items[0] || null;
    },
  });

  // ── Mutations ──

  const saveProfileMutation = useMutation({
    mutationFn: async (data) => {
      if (nutritionProfile?.id) {
        return base44.entities.NutritionProfile.update(nutritionProfile.id, data);
      }
      return base44.entities.NutritionProfile.create(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["nutritionProfile"] }),
  });

  const saveAuditMutation = useMutation({
    mutationFn: async ({ pillar, data }) => {
      const existing = pillarAudits?.find(a => a.pillar === pillar);
      const payload = {
        pillar,
        meals: data.meals || {},
        reflection: data.reflection || "",
        additional_answers: data.additional_answers || {},
      };
      if (existing?.id) {
        return base44.entities.NutritionPillarAudit.update(existing.id, payload);
      }
      return base44.entities.NutritionPillarAudit.create(payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pillarAudits"] }),
  });

  const saveCommitmentMutation = useMutation({
    mutationFn: async (commitments) => {
      if (commitmentData?.id) {
        return base44.entities.NutritionCommitment.update(commitmentData.id, { commitments });
      }
      return base44.entities.NutritionCommitment.create({ commitments });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["nutritionCommitments"] }),
  });

  const saveNotesMutation = useMutation({
    mutationFn: async (notes) => {
      if (commitmentData?.id) {
        return base44.entities.NutritionCommitment.update(commitmentData.id, { notes });
      }
      return base44.entities.NutritionCommitment.create({ notes });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["nutritionCommitments"] }),
  });

  const handleSaveAudit = useCallback((pillar, data) => {
    saveAuditMutation.mutate({ pillar, data });
  }, [saveAuditMutation]);

  // ── Loading ──

  if (loadingWorkbook) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--aw-off-white)" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--aw-burg-core)" }} />
      </div>
    );
  }

  // ── Section renderer ──

  const auditForPillar = (p) => pillarAudits?.find(a => a.pillar === p) || null;
  const auditSaving = saveAuditMutation.isPending;

  const renderSection = () => {
    switch (activeSection) {
      case "intro": return <WelcomeSection />;
      case "pillar1": return <Pillar1Section auditData={auditForPillar("protein")} onSaveAudit={handleSaveAudit} isSaving={auditSaving} />;
      case "pillar2": return <Pillar2Section auditData={auditForPillar("blood_sugar")} onSaveAudit={handleSaveAudit} isSaving={auditSaving} />;
      case "pillar3": return <Pillar3Section auditData={auditForPillar("gut_health")} onSaveAudit={handleSaveAudit} isSaving={auditSaving} />;
      case "pillar4": return <Pillar4Section auditData={auditForPillar("rhythm")} onSaveAudit={handleSaveAudit} isSaving={auditSaving} />;
      case "pillar5": return <Pillar5Section auditData={auditForPillar("awareness")} onSaveAudit={handleSaveAudit} isSaving={auditSaving} />;
      case "commitments": return <CommitmentsSection commitmentData={commitmentData} onSaveCommitment={c => saveCommitmentMutation.mutate(c)} isSaving={saveCommitmentMutation.isPending} />;
      case "notes": return <NotesSection commitmentData={commitmentData} onSaveNotes={n => saveNotesMutation.mutate(n)} isSaving={saveNotesMutation.isPending} />;
      default: return <WelcomeSection />;
    }
  };

  // ── Tool renderer ──

  const renderTool = () => {
    const pt = nutritionProfile?.protein_target_g || null;
    switch (activeToolTab) {
      case "calculator": return <ProteinCalculator profile={nutritionProfile} onSave={d => saveProfileMutation.mutate(d)} isSaving={saveProfileMutation.isPending} />;
      case "mealbuilder": return <ToolPlaceholder kicker="Meal Builder" title="Build Your" emphasis="Plate." icon={UtensilsCrossed} description={`Build balanced meals that hit your ${pt ? pt + "g" : ""} protein target.`} />;
      case "tracker": return <ToolPlaceholder kicker="Daily Log" title="Track Your" emphasis="Day." icon={BarChart3} description="Log daily food intake, track protein, and check in on your five pillars." />;
      case "dashboard": return <ToolPlaceholder kicker="Your Dashboard" title="Progress" emphasis="Overview." icon={TrendingUp} description="Weekly protein averages, pillar alignment scores, and tracking streaks." />;
      default: return null;
    }
  };

  // ── Shared nav components ──

  const SectionNav = ({ className = "" }) => (
    <div className={`flex gap-1 overflow-x-auto py-2.5 px-5 ${className}`} style={{ background: "var(--aw-rose-wash)", borderBottom: "1px solid var(--aw-rose-pale)" }}>
      {WORKBOOK_SECTIONS.map(s => (
        <button key={s.id} onClick={() => setActiveSection(s.id)} className="px-3 py-1 rounded-full text-[9px] font-semibold whitespace-nowrap transition-all" style={{ border: `1px solid ${activeSection === s.id ? "var(--aw-rose-core)" : "var(--aw-rose-pale)"}`, background: activeSection === s.id ? "var(--aw-rose-core)" : "var(--aw-white)", color: activeSection === s.id ? "var(--aw-white)" : "var(--aw-mid-grey)", letterSpacing: "0.02em", fontFamily: "var(--aw-font-sans)" }}>
          {s.label}
        </button>
      ))}
    </div>
  );

  const ToolTabs = () => (
    <div className="flex gap-1.5 mb-4">
      {TOOL_TABS.map(t => {
        const Icon = t.icon;
        const isActive = activeToolTab === t.id;
        return (
          <button key={t.id} onClick={() => setActiveToolTab(t.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[9px] font-semibold transition-all" style={{ border: `1px solid ${isActive ? "var(--aw-rose-core)" : "var(--aw-rose-pale)"}`, background: isActive ? "var(--aw-rose-wash)" : "var(--aw-white)", color: isActive ? "var(--aw-burg-core)" : "var(--aw-mid-grey)", fontFamily: "var(--aw-font-sans)" }}>
            <Icon className="w-3 h-3" />
            {t.label}
          </button>
        );
      })}
    </div>
  );

  const sectionIdx = WORKBOOK_SECTIONS.findIndex(s => s.id === activeSection);

  // ════════════════════════════════════════════════════════════════════════════
  // MOBILE LAYOUT
  // ════════════════════════════════════════════════════════════════════════════

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen" style={{ background: "var(--aw-off-white)", fontFamily: "var(--aw-font-sans)" }}>
        <div className="px-4 py-3 flex items-center justify-between" style={{ background: "linear-gradient(135deg, var(--aw-ink), var(--aw-burg-core))" }}>
          <div>
            <p className="text-[7px] tracking-[0.25em] font-bold uppercase" style={{ color: "var(--aw-rose-core)" }}>Nutrition Module</p>
            <p className="text-base" style={{ fontFamily: "var(--aw-font-display)", fontStyle: "italic", color: "var(--aw-rose-light)" }}>Food Blueprint</p>
          </div>
          <Link to="/Dashboard" className="px-3 py-1.5 rounded-md text-[9px] font-semibold" style={{ background: "rgba(196,132,122,0.2)", color: "var(--aw-rose-light)" }}>DASHBOARD</Link>
        </div>

        <div className="flex" style={{ background: "var(--aw-white)", borderBottom: "1px solid var(--aw-rose-pale)" }}>
          {["workbook", "tools"].map(panel => (
            <button key={panel} onClick={() => setMobilePanel(panel)} className="flex-1 py-2.5 text-[11px] font-semibold tracking-wide uppercase" style={{ borderBottom: `2.5px solid ${mobilePanel === panel ? "var(--aw-rose-core)" : "transparent"}`, color: mobilePanel === panel ? "var(--aw-burg-core)" : "var(--aw-warm-grey)", background: "transparent", fontFamily: "var(--aw-font-sans)" }}>
              {panel === "workbook" ? "Workbook" : "Tools"}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto">
          {mobilePanel === "workbook" ? (
            <div>
              <SectionNav />
              <div className="px-4 py-5">{renderSection()}</div>
            </div>
          ) : (
            <div className="px-4 py-4">
              <ToolTabs />
              {renderTool()}
            </div>
          )}
        </div>

        <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderTop: "1px solid var(--aw-rose-pale)", background: "var(--aw-white)" }}>
          <span className="text-[8px] font-semibold tracking-[0.2em] uppercase" style={{ color: "var(--aw-warm-grey)" }}>blueprint™</span>
          <span className="text-[8px]" style={{ color: "var(--aw-warm-grey)", fontWeight: 500 }}>Phase One of The A.L.I.V.E Method™</span>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // DESKTOP LAYOUT
  // ════════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen" style={{ background: "var(--aw-off-white)", fontFamily: "var(--aw-font-sans)" }}>
      <div className="max-w-[1200px] mx-auto py-5 px-5">

        {/* Course header */}
        <div className="rounded-t-2xl px-6 py-3.5 flex items-center justify-between" style={{ background: "linear-gradient(135deg, var(--aw-ink), var(--aw-burg-dark), var(--aw-burg-core))" }}>
          <div className="flex items-center gap-4">
            <Link to="/Dashboard" className="flex items-center gap-1.5 text-[10px] font-medium transition-colors" style={{ color: "rgba(255,255,255,0.5)" }}>
              <ArrowLeft className="w-3 h-3" /> Dashboard
            </Link>
            <div className="w-px h-4" style={{ background: "rgba(196,132,122,0.4)" }} />
            <p className="text-[7px] tracking-[0.3em] font-bold uppercase" style={{ color: "var(--aw-rose-core)" }}>The Aligned Woman Blueprint™</p>
            <div className="w-px h-4" style={{ background: "rgba(196,132,122,0.4)" }} />
            <p className="text-[15px]" style={{ fontFamily: "var(--aw-font-display)", fontStyle: "italic", color: "var(--aw-rose-light)" }}>Phase One: Awareness</p>
          </div>
        </div>

        {/* Expert header */}
        <div className="px-6 py-3 flex items-center justify-between" style={{ background: "var(--aw-off-white)", borderBottom: "1px solid var(--aw-rose-pale)", borderLeft: "1px solid var(--aw-rose-pale)", borderRight: "1px solid var(--aw-rose-pale)" }}>
          <div className="flex items-center gap-3">
            {expert?.profile_picture ? (
              <img src={expert.profile_picture} alt={expert.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--aw-burg-core), var(--aw-burg-mid))" }}>
                <span style={{ fontFamily: "var(--aw-font-display)", fontStyle: "italic", fontSize: 16, color: "var(--aw-rose-light)" }}>DV</span>
              </div>
            )}
            <div>
              <p className="text-[13px] font-semibold" style={{ color: "var(--aw-burg-core)" }}>{expert?.name || "Danielle Venter"}</p>
              <p className="text-[10px]" style={{ color: "var(--aw-mid-grey)", fontWeight: 300 }}>{expert?.title || "Registered Dietitian"}</p>
            </div>
          </div>
          {workbook?.blank_pdf_url && (
            <a href={workbook.blank_pdf_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-semibold border transition-colors" style={{ borderColor: "var(--aw-rose-pale)", color: "var(--aw-mid-grey)", background: "var(--aw-white)" }}>
              <Download className="w-3 h-3" /> Download PDF
            </a>
          )}
        </div>

        {/* Split layout */}
        <div className="flex rounded-b-2xl overflow-hidden" style={{ border: "1px solid var(--aw-rose-pale)", borderTop: "none", background: "var(--aw-white)", minHeight: 700 }}>

          {/* LEFT: Workbook */}
          <div className="flex-shrink-0 flex flex-col" style={{ flexBasis: "58%", borderRight: "1px solid var(--aw-rose-pale)" }}>
            <div className="sticky top-0 z-10"><SectionNav /></div>
            <div ref={contentRef} className="flex-1 overflow-y-auto px-7 py-6" style={{ maxHeight: 650 }}>
              {renderSection()}
            </div>
            <div className="px-6 py-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--aw-rose-pale)" }}>
              <button onClick={() => { if (sectionIdx > 0) setActiveSection(WORKBOOK_SECTIONS[sectionIdx - 1].id); }} disabled={sectionIdx === 0} className="flex items-center gap-1 text-[10px] font-semibold tracking-wide uppercase disabled:opacity-30 transition-colors" style={{ color: "var(--aw-mid-grey)", fontFamily: "var(--aw-font-sans)" }}>
                <ChevronLeft className="w-3 h-3" /> Previous
              </button>
              <p className="text-[9px]" style={{ color: "var(--aw-warm-grey)" }}>{sectionIdx + 1} of {WORKBOOK_SECTIONS.length}</p>
              <button onClick={() => { if (sectionIdx < WORKBOOK_SECTIONS.length - 1) setActiveSection(WORKBOOK_SECTIONS[sectionIdx + 1].id); }} disabled={sectionIdx === WORKBOOK_SECTIONS.length - 1} className="flex items-center gap-1 text-[10px] font-semibold tracking-wide uppercase disabled:opacity-30 transition-colors" style={{ color: "var(--aw-mid-grey)", fontFamily: "var(--aw-font-sans)" }}>
                Next <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* RIGHT: Tools */}
          <div className="flex-1 flex flex-col" style={{ background: "var(--aw-off-white)" }}>
            <div className="sticky top-0 z-10 px-5 pt-4 pb-0" style={{ background: "var(--aw-off-white)" }}>
              <p className="text-[8px] tracking-[0.2em] font-bold uppercase mb-3" style={{ color: "var(--aw-rose-core)" }}>Interactive Tools</p>
              <ToolTabs />
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-5" style={{ maxHeight: 580 }}>
              {renderTool()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 px-2">
          <span className="text-[8px] font-semibold tracking-[0.2em] uppercase" style={{ color: "var(--aw-warm-grey)" }}>blueprint™ · est. 2026</span>
          <span className="text-[8px]" style={{ color: "var(--aw-warm-grey)", fontWeight: 500 }}>Phase One of The A.L.I.V.E Method™</span>
        </div>
      </div>
    </div>
  );
}