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

      {/* Form fields */}
      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold mb-1" style={{ color: "var(--aw-burg-core)" }}>
              Age
            </label>
            <input
              type="number"
              value={form.age}
              onChange={e => update("age", e.target.value)}
              placeholder="e.g. 35"
              className="w-full px-3 py-2 text-xs rounded-lg border outline-none focus:ring-1"
              style={{
                borderColor: "var(--aw-rose-pale)",
                background: "var(--aw-white)",
                color: "var(--aw-dark-grey)",
                fontFamily: "var(--aw-font-sans)",
              }}
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold mb-1" style={{ color: "var(--aw-burg-core)" }}>
              Weight (kg)
            </label>
            <input
              type="number"
              value={form.weight_kg}
              onChange={e => update("weight_kg", e.target.value)}
              placeholder="e.g. 65"
              className="w-full px-3 py-2 text-xs rounded-lg border outline-none focus:ring-1"
              style={{
                borderColor: "var(--aw-rose-pale)",
                background: "var(--aw-white)",
                color: "var(--aw-dark-grey)",
                fontFamily: "var(--aw-font-sans)",
              }}
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-semibold mb-1" style={{ color: "var(--aw-burg-core)" }}>
            Height (cm)
          </label>
          <input
            type="number"
            value={form.height_cm}
            onChange={e => update("height_cm", e.target.value)}
            placeholder="e.g. 165"
            className="w-full px-3 py-2 text-xs rounded-lg border outline-none focus:ring-1"
            style={{
              borderColor: "var(--aw-rose-pale)",
              background: "var(--aw-white)",
              color: "var(--aw-dark-grey)",
              fontFamily: "var(--aw-font-sans)",
            }}
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold mb-1" style={{ color: "var(--aw-burg-core)" }}>
            Activity Level
          </label>
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
                <span className="text-xs font-semibold" style={{ color: "var(--aw-burg-core)" }}>
                  {opt.label}
                </span>
                <span className="block text-[10px] mt-0.5" style={{ color: "var(--aw-mid-grey)", fontWeight: 300 }}>
                  {opt.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result */}
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

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!target || isSaving}
        className="w-full py-2.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-all disabled:opacity-40"
        style={{
          background: "var(--aw-rose-core)",
          color: "var(--aw-white)",
          fontFamily: "var(--aw-font-sans)",
        }}
      >
        {isSaving ? "Saving..." : profile?.protein_target_g ? "Update My Target" : "Save My Target"}
      </button>
    </div>
  );
}

// ── Meal Builder Placeholder ───────────────────────────────────────────────────

function MealBuilderTool({ proteinTarget }) {
  return (
    <div>
      <p
        className="text-[9px] tracking-[0.22em] font-bold uppercase mb-1.5"
        style={{ color: "var(--aw-rose-core)" }}
      >
        Meal Builder
      </p>
      <h3
        className="text-lg mb-1"
        style={{ fontFamily: "var(--aw-font-display)", color: "var(--aw-burg-core)" }}
      >
        Build Your <em style={{ color: "var(--aw-rose-core)" }}>Plate.</em>
      </h3>
      <div className="w-8 h-0.5 mb-4" style={{ background: "var(--aw-rose-core)" }} />

      <div
        className="rounded-xl p-6 text-center"
        style={{ background: "var(--aw-rose-wash)", border: "1.5px dashed var(--aw-rose-pale)" }}
      >
        <UtensilsCrossed className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--aw-rose-core)" }} />
        <p className="text-sm font-medium mb-1" style={{ color: "var(--aw-burg-core)" }}>Coming Soon</p>
        <p className="text-xs" style={{ color: "var(--aw-mid-grey)", fontWeight: 300 }}>
          Build balanced meals that hit your {proteinTarget ? `${proteinTarget}g` : ""} protein target. Plan breakfast, lunch, dinner, and snacks.
        </p>
      </div>
    </div>
  );
}

// ── Daily Log Placeholder ──────────────────────────────────────────────────────

function DailyLogTool({ proteinTarget }) {
  return (
    <div>
      <p
        className="text-[9px] tracking-[0.22em] font-bold uppercase mb-1.5"
        style={{ color: "var(--aw-rose-core)" }}
      >
        Daily Log
      </p>
      <h3
        className="text-lg mb-1"
        style={{ fontFamily: "var(--aw-font-display)", color: "var(--aw-burg-core)" }}
      >
        Track Your <em style={{ color: "var(--aw-rose-core)" }}>Day.</em>
      </h3>
      <div className="w-8 h-0.5 mb-4" style={{ background: "var(--aw-rose-core)" }} />

      <div
        className="rounded-xl p-6 text-center"
        style={{ background: "var(--aw-rose-wash)", border: "1.5px dashed var(--aw-rose-pale)" }}
      >
        <BarChart3 className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--aw-rose-core)" }} />
        <p className="text-sm font-medium mb-1" style={{ color: "var(--aw-burg-core)" }}>Coming Soon</p>
        <p className="text-xs" style={{ color: "var(--aw-mid-grey)", fontWeight: 300 }}>
          Log your daily food intake, track protein, and check in on your five pillars.
        </p>
      </div>
    </div>
  );
}

// ── Dashboard Placeholder ──────────────────────────────────────────────────────

function NutritionDashboardTool() {
  return (
    <div>
      <p
        className="text-[9px] tracking-[0.22em] font-bold uppercase mb-1.5"
        style={{ color: "var(--aw-rose-core)" }}
      >
        Your Dashboard
      </p>
      <h3
        className="text-lg mb-1"
        style={{ fontFamily: "var(--aw-font-display)", color: "var(--aw-burg-core)" }}
      >
        Progress <em style={{ color: "var(--aw-rose-core)" }}>Overview.</em>
      </h3>
      <div className="w-8 h-0.5 mb-4" style={{ background: "var(--aw-rose-core)" }} />

      <div
        className="rounded-xl p-6 text-center"
        style={{ background: "var(--aw-rose-wash)", border: "1.5px dashed var(--aw-rose-pale)" }}
      >
        <TrendingUp className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--aw-rose-core)" }} />
        <p className="text-sm font-medium mb-1" style={{ color: "var(--aw-burg-core)" }}>Coming Soon</p>
        <p className="text-xs" style={{ color: "var(--aw-mid-grey)", fontWeight: 300 }}>
          See your weekly protein averages, pillar alignment scores, and tracking streaks.
        </p>
      </div>
    </div>
  );
}

// ── Workbook Content Sections ──────────────────────────────────────────────────

function WelcomeSection() {
  return (
    <div>
      {/* Hero banner */}
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
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>
          with Danielle Venter
        </p>
      </div>

      <p
        className="text-[9px] tracking-[0.22em] font-bold uppercase mb-1.5"
        style={{ color: "var(--aw-rose-core)" }}
      >
        Before You Begin
      </p>
      <h2
        className="text-2xl mb-1"
        style={{ fontFamily: "var(--aw-font-display)", color: "var(--aw-burg-core)", lineHeight: 1.15 }}
      >
        How to Use This <em style={{ color: "var(--aw-rose-core)", fontStyle: "italic" }}>Workbook.</em>
      </h2>
      <div className="w-10 h-0.5 mt-2.5 mb-5" style={{ background: "var(--aw-rose-core)" }} />

      <p className="text-[13px] leading-7 mb-4" style={{ color: "var(--aw-dark-grey)", fontWeight: 300 }}>
        This is not another diet plan. This is a framework for how you nourish yourself for the rest of your life. Danielle's masterclass introduced five pillars of aligned nutrition. This workbook will help you apply each one.
      </p>

      {/* Numbered instructions */}
      {[
        { n: "01", t: "Complete it honestly.", d: "No right answers. Write what is true for you right now." },
        { n: "02", t: "Use the interactive tools.", d: "The calculator, meal builder, and tracker turn knowledge into action." },
        { n: "03", t: "Start with one pillar.", d: "Pick the most urgent. Build confidence there, the rest follows." },
      ].map(r => (
        <div key={r.n} className="flex gap-3 mb-3">
          <span className="text-2xl min-w-[32px]" style={{ fontFamily: "var(--aw-font-display)", fontStyle: "italic", color: "var(--aw-rose-pale)" }}>
            {r.n}
          </span>
          <div>
            <p className="text-sm mb-0.5" style={{ fontFamily: "var(--aw-font-display)", fontStyle: "italic", color: "var(--aw-burg-core)" }}>
              {r.t}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--aw-dark-grey)", fontWeight: 300 }}>
              {r.d}
            </p>
          </div>
        </div>
      ))}

      {/* Framework callout */}
      <div
        className="rounded-r-lg p-4 mt-4"
        style={{ background: "var(--aw-rose-wash)", borderLeft: "3px solid var(--aw-rose-core)" }}
      >
        <p className="text-[8px] tracking-[0.15em] font-bold uppercase mb-1" style={{ color: "var(--aw-rose-deep)" }}>
          The Framework
        </p>
        <p className="text-[13px] leading-7" style={{ color: "var(--aw-burg-core)", fontWeight: 400 }}>
          Protein is your anchor. Balance your blood sugar. Support your gut. Eat with rhythm, not restriction. Nourish with awareness, not control.
        </p>
      </div>
    </div>
  );
}

function Pillar1Section({ auditData, onSaveAudit }) {
  const [meals, setMeals] = useState(auditData?.meals || { breakfast: { food: "", protein: "" }, lunch: { food: "", protein: "" }, dinner: { food: "", protein: "" } });
  const [reflection, setReflection] = useState(auditData?.reflection || "");

  const updateMeal = (meal, field, value) => {
    setMeals(prev => ({ ...prev, [meal]: { ...prev[meal], [field]: value } }));
  };

  const handleSave = () => {
    onSaveAudit("protein", { meals, reflection });
  };

  return (
    <div>
      <p
        className="text-[9px] tracking-[0.22em] font-bold uppercase mb-1.5"
        style={{ color: "var(--aw-rose-core)" }}
      >
        Pillar One
      </p>
      <h2
        className="text-2xl mb-1"
        style={{ fontFamily: "var(--aw-font-display)", color: "var(--aw-burg-core)", lineHeight: 1.15 }}
      >
        Protein is Your <em style={{ color: "var(--aw-rose-core)", fontStyle: "italic" }}>Anchor.</em>
      </h2>
      <div className="w-10 h-0.5 mt-2.5 mb-5" style={{ background: "var(--aw-rose-core)" }} />

      <p className="text-[13px] leading-7 mb-3" style={{ color: "var(--aw-dark-grey)", fontWeight: 300 }}>
        Protein is not just for athletes. It does not make you bulky. It is the building block of your hormones, neurotransmitters, muscle, and mood. Most women eat half the protein they need, especially in the morning.
      </p>

      <p className="text-base mb-2 mt-5" style={{ fontFamily: "var(--aw-font-display)", fontStyle: "italic", color: "var(--aw-burg-core)" }}>
        Why Protein Matters for Women
      </p>

      <p className="text-[13px] leading-7 mb-2" style={{ color: "var(--aw-dark-grey)", fontWeight: 300 }}>
        <strong style={{ fontWeight: 600, color: "var(--aw-burg-core)" }}>Hormone Production:</strong> Insulin, thyroid hormones, dopamine, serotonin, and leptin are all made from amino acids.
      </p>
      <p className="text-[13px] leading-7 mb-2" style={{ color: "var(--aw-dark-grey)", fontWeight: 300 }}>
        <strong style={{ fontWeight: 600, color: "var(--aw-burg-core)" }}>Lean Muscle:</strong> From age 30, women lose 3-8% per decade. Protein is your anti-aging tool.
      </p>
      <p className="text-[13px] leading-7 mb-2" style={{ color: "var(--aw-dark-grey)", fontWeight: 300 }}>
        <strong style={{ fontWeight: 600, color: "var(--aw-burg-core)" }}>Blood Sugar Balance:</strong> Protein slows the absorption of glucose. It stabilises your energy and curbs cravings.
      </p>
      <p className="text-[13px] leading-7 mb-2" style={{ color: "var(--aw-dark-grey)", fontWeight: 300 }}>
        <strong style={{ fontWeight: 600, color: "var(--aw-burg-core)" }}>Satiety:</strong> Protein is the most filling macronutrient. It reduces the urge to snack on sugar.
      </p>

      {/* Target callout */}
      <div
        className="rounded-r-lg p-4 my-4"
        style={{ background: "var(--aw-rose-wash)", borderLeft: "3px solid var(--aw-rose-core)" }}
      >
        <p className="text-[8px] tracking-[0.15em] font-bold uppercase mb-1" style={{ color: "var(--aw-rose-deep)" }}>
          Your Daily Target
        </p>
        <p className="text-[13px] leading-7" style={{ color: "var(--aw-burg-core)", fontWeight: 400 }}>
          <strong>80-120g protein per day</strong>, 20-30g per meal. Use the calculator in the Tools panel to find your exact target.
        </p>
      </div>

      {/* Reference table */}
      <p className="text-base mb-2 mt-5" style={{ fontFamily: "var(--aw-font-display)", fontStyle: "italic", color: "var(--aw-burg-core)" }}>
        Protein Reference Guide
      </p>
      <div className="rounded-lg overflow-hidden border mb-5" style={{ borderColor: "var(--aw-rose-pale)" }}>
        <div className="grid grid-cols-[2fr_1.5fr_1fr] px-3 py-1.5" style={{ background: "var(--aw-burg-core)" }}>
          {["Food", "Serving", "Protein"].map(h => (
            <p key={h} className="text-[8px] tracking-[0.1em] font-bold uppercase" style={{ color: "var(--aw-white)" }}>
              {h}
            </p>
          ))}
        </div>
        {PROTEIN_REFERENCE.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-[2fr_1.5fr_1fr] px-3 py-1.5"
            style={{
              background: i % 2 === 0 ? "var(--aw-white)" : "var(--aw-rose-wash)",
              borderBottom: "1px solid var(--aw-rose-pale)",
            }}
          >
            {row.map((cell, j) => (
              <p
                key={j}
                className="text-[11px]"
                style={{
                  color: j === 2 ? "var(--aw-burg-core)" : "var(--aw-dark-grey)",
                  fontWeight: j === 2 ? 600 : 300,
                }}
              >
                {cell}
              </p>
            ))}
          </div>
        ))}
      </div>

      {/* Protein Audit */}
      <p className="text-base mb-2 mt-5" style={{ fontFamily: "var(--aw-font-display)", fontStyle: "italic", color: "var(--aw-burg-core)" }}>
        Your Protein Audit
      </p>
      <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--aw-dark-grey)", fontWeight: 300 }}>
        Think about yesterday. Estimate your protein at each meal.
      </p>

      {["breakfast", "lunch", "dinner"].map(meal => (
        <div key={meal} className="flex gap-2 mb-2">
          <div className="min-w-[70px] pt-2.5">
            <p className="text-[10px] font-semibold capitalize" style={{ color: "var(--aw-burg-core)" }}>
              {meal}
            </p>
          </div>
          <input
            type="text"
            value={meals[meal]?.food || ""}
            onChange={e => updateMeal(meal, "food", e.target.value)}
            placeholder="What did you eat?"
            className="flex-[2] px-3 py-2 text-xs rounded-lg border outline-none"
            style={{ borderColor: "var(--aw-rose-pale)", fontFamily: "var(--aw-font-sans)", color: "var(--aw-dark-grey)" }}
          />
          <input
            type="text"
            value={meals[meal]?.protein || ""}
            onChange={e => updateMeal(meal, "protein", e.target.value)}
            placeholder="Est. protein (g)"
            className="flex-1 px-3 py-2 text-xs rounded-lg border outline-none"
            style={{ borderColor: "var(--aw-rose-pale)", fontFamily: "var(--aw-font-sans)", color: "var(--aw-dark-grey)" }}
          />
        </div>
      ))}

      {/* Reflection */}
      <div className="mt-4">
        <p className="text-[10px] font-semibold mb-1" style={{ color: "var(--aw-burg-core)" }}>
          Reflection
        </p>
        <textarea
          value={reflection}
          onChange={e => setReflection(e.target.value)}
          placeholder="How far are you from your target? What is the biggest gap?"
          rows={3}
          className="w-full px-3 py-2.5 text-xs rounded-lg border outline-none resize-none"
          style={{
            borderColor: "var(--aw-rose-pale)",
            fontFamily: "var(--aw-font-sans)",
            color: "var(--aw-dark-grey)",
            lineHeight: 1.7,
          }}
        />
      </div>

      <button
        onClick={handleSave}
        className="mt-3 px-5 py-2 rounded-full text-[10px] font-semibold tracking-wide uppercase transition-all"
        style={{
          background: "var(--aw-rose-core)",
          color: "var(--aw-white)",
          fontFamily: "var(--aw-font-sans)",
        }}
      >
        Save Audit
      </button>
    </div>
  );
}

function PillarPlaceholder({ number, title, emphasis }) {
  return (
    <div>
      <p
        className="text-[9px] tracking-[0.22em] font-bold uppercase mb-1.5"
        style={{ color: "var(--aw-rose-core)" }}
      >
        Pillar {number}
      </p>
      <h2
        className="text-2xl mb-1"
        style={{ fontFamily: "var(--aw-font-display)", color: "var(--aw-burg-core)", lineHeight: 1.15 }}
      >
        {title} <em style={{ color: "var(--aw-rose-core)", fontStyle: "italic" }}>{emphasis}</em>
      </h2>
      <div className="w-10 h-0.5 mt-2.5 mb-5" style={{ background: "var(--aw-rose-core)" }} />

      <div
        className="rounded-xl p-6 text-center"
        style={{ background: "var(--aw-rose-wash)", border: "1.5px dashed var(--aw-rose-pale)" }}
      >
        <BookOpen className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--aw-rose-core)" }} />
        <p className="text-sm font-medium mb-1" style={{ color: "var(--aw-burg-core)" }}>Content Coming Soon</p>
        <p className="text-xs" style={{ color: "var(--aw-mid-grey)", fontWeight: 300 }}>
          This pillar's teaching content, reflection prompts, and exercises are being finalised.
        </p>
      </div>
    </div>
  );
}

function CommitmentsSection() {
  return (
    <PillarPlaceholder number="" title="Your" emphasis="Commitments." />
  );
}

function NotesSection() {
  return (
    <PillarPlaceholder number="" title="Your" emphasis="Notes." />
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
  const [mobilePanel, setMobilePanel] = useState("workbook"); // "workbook" | "tools"
  const [sideNavOpen, setSideNavOpen] = useState(false);
  const contentRef = useRef(null);

  // Responsive check
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Scroll to top on section change
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

  const { data: workbookResponse } = useQuery({
    queryKey: ["nutritionWbResponse", workbookId],
    queryFn: async () => {
      const items = await base44.entities.WorkbookResponse.filter({ workbook_id: workbookId });
      return items[0] || null;
    },
    enabled: !!workbookId,
  });

  // ── Mutations ──

  const saveProfileMutation = useMutation({
    mutationFn: async (data) => {
      if (nutritionProfile?.id) {
        return base44.entities.NutritionProfile.update(nutritionProfile.id, data);
      }
      return base44.entities.NutritionProfile.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutritionProfile"] });
    },
  });

  const saveAuditMutation = useMutation({
    mutationFn: async ({ pillar, data }) => {
      const existing = pillarAudits?.find(a => a.pillar === pillar);
      if (existing?.id) {
        return base44.entities.NutritionPillarAudit.update(existing.id, {
          meals: data.meals,
          reflection: data.reflection,
        });
      }
      return base44.entities.NutritionPillarAudit.create({
        pillar,
        meals: data.meals,
        reflection: data.reflection,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pillarAudits"] });
    },
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

  // ── Section content renderer ──

  const renderSection = () => {
    const auditForPillar = (p) => pillarAudits?.find(a => a.pillar === p) || null;

    switch (activeSection) {
      case "intro":
        return <WelcomeSection />;
      case "pillar1":
        return <Pillar1Section auditData={auditForPillar("protein")} onSaveAudit={handleSaveAudit} />;
      case "pillar2":
        return <PillarPlaceholder number="Two" title="Balance Your" emphasis="Blood Sugar." />;
      case "pillar3":
        return <PillarPlaceholder number="Three" title="Support Your" emphasis="Gut." />;
      case "pillar4":
        return <PillarPlaceholder number="Four" title="Eat with" emphasis="Rhythm." />;
      case "pillar5":
        return <PillarPlaceholder number="Five" title="Nourish with" emphasis="Awareness." />;
      case "commitments":
        return <CommitmentsSection />;
      case "notes":
        return <NotesSection />;
      default:
        return <WelcomeSection />;
    }
  };

  // ── Tool content renderer ──

  const renderTool = () => {
    const proteinTarget = nutritionProfile?.protein_target_g || null;

    switch (activeToolTab) {
      case "calculator":
        return (
          <ProteinCalculator
            profile={nutritionProfile}
            onSave={(data) => saveProfileMutation.mutate(data)}
            isSaving={saveProfileMutation.isPending}
          />
        );
      case "mealbuilder":
        return <MealBuilderTool proteinTarget={proteinTarget} />;
      case "tracker":
        return <DailyLogTool proteinTarget={proteinTarget} />;
      case "dashboard":
        return <NutritionDashboardTool />;
      default:
        return null;
    }
  };

  // ── Section navigation (pill bar) ──

  const SectionNav = ({ className = "" }) => (
    <div
      className={`flex gap-1 overflow-x-auto py-2.5 px-5 ${className}`}
      style={{
        background: "var(--aw-rose-wash)",
        borderBottom: "1px solid var(--aw-rose-pale)",
      }}
    >
      {WORKBOOK_SECTIONS.map(s => (
        <button
          key={s.id}
          onClick={() => setActiveSection(s.id)}
          className="px-3 py-1 rounded-full text-[9px] font-semibold whitespace-nowrap transition-all"
          style={{
            border: `1px solid ${activeSection === s.id ? "var(--aw-rose-core)" : "var(--aw-rose-pale)"}`,
            background: activeSection === s.id ? "var(--aw-rose-core)" : "var(--aw-white)",
            color: activeSection === s.id ? "var(--aw-white)" : "var(--aw-mid-grey)",
            letterSpacing: "0.02em",
            fontFamily: "var(--aw-font-sans)",
          }}
        >
          {s.label}
        </button>
      ))}
    </div>
  );

  // ── Tool tab bar ──

  const ToolTabs = () => (
    <div className="flex gap-1.5 mb-4">
      {TOOL_TABS.map(t => {
        const Icon = t.icon;
        const isActive = activeToolTab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setActiveToolTab(t.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[9px] font-semibold transition-all"
            style={{
              border: `1px solid ${isActive ? "var(--aw-rose-core)" : "var(--aw-rose-pale)"}`,
              background: isActive ? "var(--aw-rose-wash)" : "var(--aw-white)",
              color: isActive ? "var(--aw-burg-core)" : "var(--aw-mid-grey)",
              fontFamily: "var(--aw-font-sans)",
            }}
          >
            <Icon className="w-3 h-3" />
            {t.label}
          </button>
        );
      })}
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // MOBILE LAYOUT
  // ════════════════════════════════════════════════════════════════════════════

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen" style={{ background: "var(--aw-off-white)", fontFamily: "var(--aw-font-sans)" }}>
        {/* Mobile header */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, var(--aw-ink), var(--aw-burg-core))" }}
        >
          <div>
            <p className="text-[7px] tracking-[0.25em] font-bold uppercase" style={{ color: "var(--aw-rose-core)" }}>
              Nutrition Module
            </p>
            <p className="text-base" style={{ fontFamily: "var(--aw-font-display)", fontStyle: "italic", color: "var(--aw-rose-light)" }}>
              Food Blueprint
            </p>
          </div>
          <Link
            to="/Dashboard"
            className="px-3 py-1.5 rounded-md text-[9px] font-semibold"
            style={{ background: "rgba(196,132,122,0.2)", color: "var(--aw-rose-light)" }}
          >
            DASHBOARD
          </Link>
        </div>

        {/* Workbook / Tools toggle */}
        <div className="flex" style={{ background: "var(--aw-white)", borderBottom: "1px solid var(--aw-rose-pale)" }}>
          {["workbook", "tools"].map(panel => (
            <button
              key={panel}
              onClick={() => setMobilePanel(panel)}
              className="flex-1 py-2.5 text-[11px] font-semibold tracking-wide uppercase"
              style={{
                borderBottom: `2.5px solid ${mobilePanel === panel ? "var(--aw-rose-core)" : "transparent"}`,
                color: mobilePanel === panel ? "var(--aw-burg-core)" : "var(--aw-warm-grey)",
                background: "transparent",
                fontFamily: "var(--aw-font-sans)",
              }}
            >
              {panel === "workbook" ? "Workbook" : "Tools"}
            </button>
          ))}
        </div>

        {/* Mobile body */}
        <div className="flex-1 overflow-auto">
          {mobilePanel === "workbook" ? (
            <div>
              <SectionNav />
              <div className="px-4 py-5">
                {renderSection()}
              </div>
            </div>
          ) : (
            <div className="px-4 py-4">
              <ToolTabs />
              {renderTool()}
            </div>
          )}
        </div>

        {/* Mobile footer */}
        <div
          className="px-4 py-2.5 flex items-center justify-between"
          style={{ borderTop: "1px solid var(--aw-rose-pale)", background: "var(--aw-white)" }}
        >
          <span className="text-[8px] font-semibold tracking-[0.2em] uppercase" style={{ color: "var(--aw-warm-grey)" }}>
            blueprint™
          </span>
          <span className="text-[8px]" style={{ color: "var(--aw-warm-grey)", fontWeight: 500 }}>
            Phase One of The A.L.I.V.E Method™
          </span>
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

        {/* Course-level header */}
        <div
          className="rounded-t-2xl px-6 py-3.5 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, var(--aw-ink), var(--aw-burg-dark), var(--aw-burg-core))" }}
        >
          <div className="flex items-center gap-4">
            <Link
              to="/Dashboard"
              className="flex items-center gap-1.5 text-[10px] font-medium transition-colors"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              <ArrowLeft className="w-3 h-3" />
              Dashboard
            </Link>
            <div className="w-px h-4" style={{ background: "rgba(196,132,122,0.4)" }} />
            <p className="text-[7px] tracking-[0.3em] font-bold uppercase" style={{ color: "var(--aw-rose-core)" }}>
              The Aligned Woman Blueprint™
            </p>
            <div className="w-px h-4" style={{ background: "rgba(196,132,122,0.4)" }} />
            <p className="text-[15px]" style={{ fontFamily: "var(--aw-font-display)", fontStyle: "italic", color: "var(--aw-rose-light)" }}>
              Phase One: Awareness
            </p>
          </div>
        </div>

        {/* Expert header bar */}
        <div
          className="px-6 py-3 flex items-center justify-between"
          style={{
            background: "var(--aw-off-white)",
            borderBottom: "1px solid var(--aw-rose-pale)",
            borderLeft: "1px solid var(--aw-rose-pale)",
            borderRight: "1px solid var(--aw-rose-pale)",
          }}
        >
          <div className="flex items-center gap-3">
            {expert?.profile_picture ? (
              <img
                src={expert.profile_picture}
                alt={expert.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, var(--aw-burg-core), var(--aw-burg-mid))" }}
              >
                <span style={{ fontFamily: "var(--aw-font-display)", fontStyle: "italic", fontSize: 16, color: "var(--aw-rose-light)" }}>
                  DV
                </span>
              </div>
            )}
            <div>
              <p className="text-[13px] font-semibold" style={{ color: "var(--aw-burg-core)" }}>
                {expert?.name || "Danielle Venter"}
              </p>
              <p className="text-[10px]" style={{ color: "var(--aw-mid-grey)", fontWeight: 300 }}>
                {expert?.title || "Registered Dietitian"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {workbook?.blank_pdf_url && (
              <a
                href={workbook.blank_pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-semibold border transition-colors"
                style={{
                  borderColor: "var(--aw-rose-pale)",
                  color: "var(--aw-mid-grey)",
                  background: "var(--aw-white)",
                }}
              >
                <Download className="w-3 h-3" />
                Download PDF
              </a>
            )}
          </div>
        </div>

        {/* ═══ MAIN SPLIT LAYOUT ═══ */}
        <div
          className="flex rounded-b-2xl overflow-hidden"
          style={{
            border: "1px solid var(--aw-rose-pale)",
            borderTop: "none",
            background: "var(--aw-white)",
            minHeight: 700,
          }}
        >
          {/* ── LEFT PANEL: WORKBOOK (58%) ── */}
          <div
            className="flex-shrink-0 flex flex-col"
            style={{
              flexBasis: "58%",
              borderRight: "1px solid var(--aw-rose-pale)",
            }}
          >
            {/* Section pill nav */}
            <div className="sticky top-0 z-10">
              <SectionNav />
            </div>

            {/* Scrollable content */}
            <div
              ref={contentRef}
              className="flex-1 overflow-y-auto px-7 py-6"
              style={{ maxHeight: 650 }}
            >
              {renderSection()}
            </div>

            {/* Section prev/next */}
            <div
              className="px-6 py-3 flex items-center justify-between"
              style={{ borderTop: "1px solid var(--aw-rose-pale)" }}
            >
              <button
                onClick={() => {
                  const idx = WORKBOOK_SECTIONS.findIndex(s => s.id === activeSection);
                  if (idx > 0) setActiveSection(WORKBOOK_SECTIONS[idx - 1].id);
                }}
                disabled={activeSection === WORKBOOK_SECTIONS[0].id}
                className="flex items-center gap-1 text-[10px] font-semibold tracking-wide uppercase disabled:opacity-30 transition-colors"
                style={{ color: "var(--aw-mid-grey)", fontFamily: "var(--aw-font-sans)" }}
              >
                <ChevronLeft className="w-3 h-3" />
                Previous
              </button>
              <p className="text-[9px]" style={{ color: "var(--aw-warm-grey)" }}>
                {WORKBOOK_SECTIONS.findIndex(s => s.id === activeSection) + 1} of {WORKBOOK_SECTIONS.length}
              </p>
              <button
                onClick={() => {
                  const idx = WORKBOOK_SECTIONS.findIndex(s => s.id === activeSection);
                  if (idx < WORKBOOK_SECTIONS.length - 1) setActiveSection(WORKBOOK_SECTIONS[idx + 1].id);
                }}
                disabled={activeSection === WORKBOOK_SECTIONS[WORKBOOK_SECTIONS.length - 1].id}
                className="flex items-center gap-1 text-[10px] font-semibold tracking-wide uppercase disabled:opacity-30 transition-colors"
                style={{ color: "var(--aw-mid-grey)", fontFamily: "var(--aw-font-sans)" }}
              >
                Next
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* ── RIGHT PANEL: TOOLS (42%) ── */}
          <div
            className="flex-1 flex flex-col"
            style={{ background: "var(--aw-off-white)" }}
          >
            {/* Sticky tools header */}
            <div
              className="sticky top-0 z-10 px-5 pt-4 pb-0"
              style={{ background: "var(--aw-off-white)" }}
            >
              <p
                className="text-[8px] tracking-[0.2em] font-bold uppercase mb-3"
                style={{ color: "var(--aw-rose-core)" }}
              >
                Interactive Tools
              </p>
              <ToolTabs />
            </div>

            {/* Scrollable tool content */}
            <div className="flex-1 overflow-y-auto px-5 pb-5" style={{ maxHeight: 580 }}>
              {renderTool()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 px-2">
          <span className="text-[8px] font-semibold tracking-[0.2em] uppercase" style={{ color: "var(--aw-warm-grey)" }}>
            blueprint™ · est. 2026
          </span>
          <span className="text-[8px]" style={{ color: "var(--aw-warm-grey)", fontWeight: 500 }}>
            Phase One of The A.L.I.V.E Method™
          </span>
        </div>
      </div>
    </div>
  );
}