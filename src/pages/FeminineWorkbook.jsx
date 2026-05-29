import React, { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, ChevronLeft, ChevronRight, Menu, X, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import FemFieldRenderer from "@/components/workbook/feminine/FemFieldRenderer";
import FemComputedFields from "@/components/workbook/feminine/FemComputedFields";

const WORKBOOK_ID = "6a1958f44abcf0360979ef18";
const MAROON = "#6B1B3D";
const CREAM = "#FAF7F4";

export default function FeminineWorkbook() {
  const [workbook, setWorkbook] = useState(null);
  const [expert, setExpert] = useState(null);
  const [answers, setAnswers] = useState({});
  const [responseId, setResponseId] = useState(null);
  const [responseLoaded, setResponseLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(0);
  const [lastSaved, setLastSaved] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const saveTimer = useRef(null);
  const initialSectionIdRef = useRef(null);

  useEffect(() => {
    Promise.all([
      base44.entities.Workbook.filter({ id: WORKBOOK_ID }).then(r => r[0] || null),
      base44.entities.WorkbookResponse.filter({ workbook_id: WORKBOOK_ID }, "-created_date", 1),
    ]).then(([wb, responses]) => {
      setWorkbook(wb);
      if (wb?.expert_id) {
        base44.entities.Expert.filter({ id: wb.expert_id }).then(r => setExpert(r[0] || null));
      }
      if (responses.length > 0) {
        const r = responses[0];
        setResponseId(r.id);
        setAnswers(r.answers || {});
        setIsComplete(r.is_complete || false);
        initialSectionIdRef.current = r.last_section_id || null;
      }
    }).catch(() => {}).finally(() => {
      setResponseLoaded(true);
      setIsLoading(false);
    });
  }, []);

  const sections = workbook?.schema?.sections || [];

  // Restore last section on load
  useEffect(() => {
    if (!sections.length || !initialSectionIdRef.current) return;
    const idx = sections.findIndex(s => s.section_id === initialSectionIdRef.current);
    if (idx > 0) setActiveSection(idx);
    initialSectionIdRef.current = null;
  }, [sections]);

  const persistAnswers = useCallback(async (updated) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (responseId) {
        await base44.entities.WorkbookResponse.update(responseId, { answers: updated });
      } else {
        const created = await base44.entities.WorkbookResponse.create({ workbook_id: WORKBOOK_ID, answers: updated });
        setResponseId(created.id);
      }
      setLastSaved(new Date());
    }, 2000);
  }, [responseId]);

  const handleAnswerChange = useCallback((fieldId, value) => {
    setAnswers(prev => {
      const updated = { ...prev, [fieldId]: value };
      persistAnswers(updated);
      return updated;
    });
  }, [persistAnswers]);

  const jumpTo = useCallback(async (idx) => {
    setActiveSection(idx);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    const sId = sections[idx]?.section_id;
    if (sId) {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        if (responseId) {
          await base44.entities.WorkbookResponse.update(responseId, { last_section_id: sId });
        } else {
          const created = await base44.entities.WorkbookResponse.create({ workbook_id: WORKBOOK_ID, answers: {}, last_section_id: sId });
          setResponseId(created.id);
        }
      }, 800);
    }
  }, [sections, responseId]);

  const handleComplete = async () => {
    const now = new Date().toISOString();
    // Compute scores
    const mascIds = answers.s02_wounded_masc || [];
    const femIds = answers.s02_wounded_fem || [];
    const allMascItems = sections.find(s => s.section_id === "s02_energy_honest")?.fields?.find(f => f.field_id === "s02_wounded_masc")?.items || [];
    const allFemItems = sections.find(s => s.section_id === "s02_energy_honest")?.fields?.find(f => f.field_id === "s02_wounded_fem")?.items || [];
    const catCount = {};
    [...allMascItems.filter(i => mascIds.includes(i.id)), ...allFemItems.filter(i => femIds.includes(i.id))].forEach(i => {
      catCount[i.category] = (catCount[i.category] || 0) + 1;
    });
    const topCats = Object.entries(catCount).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([c])=>c);
    const structCount = (answers.s07_structures || []).length;
    const scores = {
      energy_dominant: mascIds.length > femIds.length + 2 ? "masculine" : femIds.length > mascIds.length + 2 ? "feminine" : "mixed",
      energy_masculine_count: mascIds.length,
      energy_feminine_count: femIds.length,
      top_categories: topCats,
      vitals: {
        sales_energy: answers.s04_energy_scale || null,
        intuition_trust: answers.s05_intuition_scale || null,
        energy_tank: answers.s06_tank || null,
      },
      foundation_score: structCount,
      foundation_total: 7,
    };
    const payload = { is_complete: true, completed_at: now, computed_scores: scores };
    if (responseId) {
      await base44.entities.WorkbookResponse.update(responseId, payload);
    } else {
      const created = await base44.entities.WorkbookResponse.create({ workbook_id: WORKBOOK_ID, answers, ...payload });
      setResponseId(created.id);
    }
    setIsComplete(true);
    setShowCelebration(true);
  };

  if (isLoading || !responseLoaded) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: CREAM }}>
        <Loader2 style={{ width: 36, height: 36, color: MAROON, animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!workbook) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: CREAM, textAlign: "center", padding: "0 24px" }}>
        <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 28, color: MAROON }}>Workbook not found</p>
        <Link to="/Dashboard" style={{ marginTop: 24, color: MAROON, fontFamily: "DM Sans, sans-serif", fontSize: 13 }}>← Back to Dashboard</Link>
      </div>
    );
  }

  if (showCelebration) {
    return <FemCelebration workbook={workbook} onBack={() => { setShowCelebration(false); jumpTo(sections.length - 1); }} />;
  }

  const isLastSection = activeSection === sections.length - 1;
  const totalSections = sections.length;

  return (
    <div style={{ minHeight: "100vh", background: "#FFFDFB", fontFamily: "DM Sans, sans-serif" }}>
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
          <div style={{ flex: 1, background: "rgba(0,0,0,0.4)" }} onClick={() => setSidebarOpen(false)} />
          <FemSidebar sections={sections} activeSection={activeSection} answers={answers} onJump={jumpTo} onClose={() => setSidebarOpen(false)} expert={expert} />
        </div>
      )}

      {/* Top bar */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(250,247,244,0.96)", backdropFilter: "blur(10px)", borderBottom: `1px solid rgba(107,27,61,0.1)`, padding: "0 20px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", height: 56, display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: MAROON, display: "flex" }}>
            <Menu style={{ width: 20, height: 20 }} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ height: 3, background: "rgba(107,27,61,0.1)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.round(((activeSection + 1) / totalSections) * 100)}%`, background: `linear-gradient(90deg, ${MAROON}, #C4847A)`, borderRadius: 2, transition: "width 0.3s ease" }} />
            </div>
            <p style={{ margin: "4px 0 0", fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: `${MAROON}99` }}>
              Section {activeSection + 1} of {totalSections}
            </p>
          </div>
          {lastSaved && (
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "#999", flexShrink: 0 }}>Saved</span>
          )}
        </div>
      </header>

      {/* Section content */}
      <main style={{ maxWidth: 700, margin: "0 auto", padding: "48px 24px 100px" }}>
        <FemSection
          section={sections[activeSection]}
          sectionIndex={activeSection}
          totalSections={totalSections}
          answers={answers}
          onAnswerChange={handleAnswerChange}
          isLastSection={isLastSection}
          isComplete={isComplete}
          onComplete={handleComplete}
          allSections={sections}
        />
      </main>

      {/* Bottom nav */}
      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(250,247,244,0.96)", backdropFilter: "blur(10px)", borderTop: `1px solid rgba(107,27,61,0.1)`, padding: "12px 20px", zIndex: 40 }}>
        <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={() => jumpTo(Math.max(0, activeSection - 1))}
            disabled={activeSection === 0}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 100, border: `1px solid rgba(107,27,61,0.15)`, background: "transparent", fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: activeSection === 0 ? "#ccc" : MAROON, cursor: activeSection === 0 ? "not-allowed" : "pointer", transition: "all 0.15s" }}
          >
            <ChevronLeft style={{ width: 15, height: 15 }} /> Previous
          </button>

          {!isLastSection ? (
            <button
              onClick={() => jumpTo(Math.min(sections.length - 1, activeSection + 1))}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 22px", borderRadius: 100, border: "none", background: MAROON, fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "#fff", cursor: "pointer", transition: "all 0.15s" }}
            >
              Continue <ChevronRight style={{ width: 15, height: 15 }} />
            </button>
          ) : !isComplete ? (
            <button
              onClick={handleComplete}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 22px", borderRadius: 100, border: "none", background: MAROON, fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "#fff", cursor: "pointer" }}
            >
              <CheckCircle2 style={{ width: 15, height: 15 }} /> Mark Complete
            </button>
          ) : (
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "#4CAF50", fontWeight: 700 }}>✓ Completed</span>
          )}
        </div>
      </nav>
    </div>
  );
}

function FemSection({ section, sectionIndex, totalSections, answers, onAnswerChange, isLastSection, isComplete, onComplete, allSections }) {
  return (
    <div>
      {section.part_label && (
        <p style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: `${MAROON}99`, margin: "0 0 12px" }}>
          {section.part_label}
        </p>
      )}
      <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(28px, 5vw, 42px)", fontStyle: "italic", fontWeight: 600, color: MAROON, margin: "0 0 10px", lineHeight: 1.15 }}>
        {section.heading}
      </h1>
      {section.theme_line && (
        <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 18, fontStyle: "italic", color: `${MAROON}cc`, margin: "0 0 20px" }}>
          {section.theme_line}
        </p>
      )}
      {section.intro_text && (
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 16, color: "#4a3a35", lineHeight: 1.7, margin: "0 0 36px", paddingBottom: 28, borderBottom: `1px solid rgba(107,27,61,0.1)` }}>
          {section.intro_text}
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {section.fields?.map(field => (
          <FemField
            key={field.field_id}
            field={field}
            answers={answers}
            onAnswerChange={onAnswerChange}
            allSections={allSections}
          />
        ))}
      </div>
    </div>
  );
}

function FemField({ field, answers, onAnswerChange, allSections }) {
  const value = answers[field.field_id];

  // Computed types
  if (field.type === "computed_energy_portrait") {
    return <FemComputedFields.EnergyPortrait field={field} answers={answers} allSections={allSections} />;
  }
  if (field.type === "computed_foundation_score") {
    return <FemComputedFields.FoundationScore field={field} answers={answers} />;
  }
  if (field.type === "reference_back") {
    return <FemComputedFields.ReferenceBack field={field} answers={answers} />;
  }
  if (field.type === "computed_snapshot") {
    return <FemComputedFields.Snapshot field={field} answers={answers} allSections={allSections} />;
  }

  return (
    <FemFieldRenderer
      field={field}
      value={value}
      onChange={(val) => onAnswerChange(field.field_id, val)}
    />
  );
}

function FemSidebar({ sections, activeSection, answers, onJump, onClose, expert }) {
  return (
    <div style={{ width: 300, background: CREAM, borderLeft: `1px solid rgba(107,27,61,0.1)`, height: "100vh", overflow: "auto", display: "flex", flexDirection: "column", marginLeft: "auto" }}>
      <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid rgba(107,27,61,0.1)`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: MAROON, margin: 0 }}>Contents</p>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: MAROON, display: "flex" }}>
          <X style={{ width: 18, height: 18 }} />
        </button>
      </div>
      <nav style={{ flex: 1, padding: "12px 0" }}>
        {sections.map((s, idx) => {
          const hasAnswer = s.fields?.some(f => {
            const v = answers[f.field_id];
            if (!v) return false;
            if (typeof v === "string") return v.trim() !== "";
            if (Array.isArray(v)) return v.length > 0;
            if (typeof v === "number") return true;
            return false;
          });
          const isCurrent = idx === activeSection;
          return (
            <button
              key={s.section_id}
              onClick={() => onJump(idx)}
              style={{ width: "100%", textAlign: "left", padding: "10px 20px", background: isCurrent ? "rgba(107,27,61,0.06)" : "transparent", border: "none", borderLeft: isCurrent ? `3px solid ${MAROON}` : "3px solid transparent", cursor: "pointer", transition: "all 0.15s" }}
            >
              {s.part_label && (
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: `${MAROON}80`, margin: "0 0 2px" }}>{s.part_label}</p>
              )}
              <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 14, fontWeight: 600, color: isCurrent ? MAROON : "#6b5550", margin: 0 }}>{s.heading}</p>
              {hasAnswer && !isCurrent && (
                <span style={{ fontSize: 10, color: "#4CAF50", fontFamily: "DM Sans, sans-serif" }}>✓ answered</span>
              )}
            </button>
          );
        })}
      </nav>
      {expert && (
        <div style={{ padding: "16px 20px", borderTop: `1px solid rgba(107,27,61,0.1)`, display: "flex", alignItems: "center", gap: 12 }}>
          {expert.profile_picture && <img src={expert.profile_picture} alt={expert.name} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />}
          <div>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: 12, color: MAROON, margin: 0 }}>{expert.name}</p>
            {expert.title && <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "#8a7a76", margin: 0 }}>{expert.title}</p>}
          </div>
        </div>
      )}
      <div style={{ padding: "12px 20px", borderTop: `1px solid rgba(107,27,61,0.1)` }}>
        <Link to="/Dashboard" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: `${MAROON}80`, textDecoration: "none" }}>← Dashboard</Link>
      </div>
    </div>
  );
}

function FemCelebration({ workbook, onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: MAROON, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", textAlign: "center" }}>
      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(250,247,244,0.6)", marginBottom: 16 }}>Workbook Complete</p>
      <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(36px, 6vw, 56px)", fontStyle: "italic", color: CREAM, margin: "0 0 20px", lineHeight: 1.15 }}>
        {workbook.title}
      </h1>
      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 16, color: "rgba(250,247,244,0.8)", maxWidth: 480, lineHeight: 1.7, margin: "0 0 48px" }}>
        {workbook.closing_text || "You have completed this workbook. The work you have done here is the beginning of a new way of leading."}
      </p>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        <button onClick={onBack} style={{ padding: "12px 28px", borderRadius: 100, border: "1px solid rgba(250,247,244,0.3)", background: "transparent", fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: CREAM, cursor: "pointer" }}>
          View Your Snapshot
        </button>
        <Link to="/Dashboard" style={{ padding: "12px 28px", borderRadius: 100, border: "none", background: CREAM, fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: MAROON, cursor: "pointer", textDecoration: "none" }}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}