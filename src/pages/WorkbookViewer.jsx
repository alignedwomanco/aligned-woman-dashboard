import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Lock, Loader2, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

// ── No-ID picker ──────────────────────────────────────────────────────────────
function WorkbookPicker() {
  const { data: workbooks, isLoading } = useQuery({
    queryKey: ["publishedWorkbooks"],
    queryFn: () => base44.entities.Workbook.filter({ status: "published" }),
  });

  useEffect(() => {
    if (workbooks?.length === 1) {
      window.location.replace(`/WorkbookViewer?id=${workbooks[0].id}`);
    }
  }, [workbooks]);

  if (isLoading || workbooks?.length === 1) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#FAF5F3" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#4A0E2E" }} />
      </div>
    );
  }

  if (!workbooks?.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-6" style={{ background: "#FAF5F3" }}>
        <BookOpen className="w-12 h-12 mb-4" style={{ color: "#C4847A" }} />
        <h2 style={{ fontFamily: "var(--aw-font-display)", fontSize: 28, color: "#4A0E2E", marginBottom: 8 }}>
          No workbooks available
        </h2>
        <Link
          to="/Dashboard"
          style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
            color: "#fff", background: "#C4847A", padding: "12px 28px", borderRadius: 100,
            textDecoration: "none", fontFamily: "var(--aw-font-sans)" }}
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-16" style={{ background: "#FAF5F3" }}>
      <h2 style={{ fontFamily: "var(--aw-font-display)", fontSize: 32, color: "#4A0E2E", marginBottom: 8, textAlign: "center" }}>
        Your Workbooks
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 480, marginTop: 40 }}>
        {workbooks.map(wb => (
          <a
            key={wb.id}
            href={`/WorkbookViewer?id=${wb.id}`}
            style={{
              display: "flex", alignItems: "center", gap: 16, padding: "20px 24px",
              background: "#fff", borderRadius: 12, border: "1px solid rgba(74,14,46,0.08)",
              textDecoration: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ width: 56, height: 56, borderRadius: 8, background: "linear-gradient(135deg,#C4847A,#4A0E2E)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookOpen style={{ width: 24, height: 24, color: "#fff" }} />
            </div>
            <div>
              <p style={{ fontFamily: "var(--aw-font-sans)", fontWeight: 700, fontSize: 15, color: "#1a1a1a", margin: 0 }}>{wb.title}</p>
              {wb.subtitle && <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 12, color: "#8A7A76", margin: "2px 0 0" }}>{wb.subtitle}</p>}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function WorkbookViewer() {
  const { search } = useLocation();
  const workbookId = new URLSearchParams(search).get("id") || null;

  if (!workbookId) {
    return <WorkbookPicker />;
  }

  return <WorkbookViewerInner workbookId={workbookId} />;
}

// ── Inner viewer (self-contained, no custom component imports) ────────────────
function WorkbookViewerInner({ workbookId }) {
  const [activeSection, setActiveSection] = useState(0);
  const [answers, setAnswers] = useState({});
  const [responseId, setResponseId] = useState(null);
  const [responseLoaded, setResponseLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [user, setUser] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const saveTimer = useRef(null);

  const { data: workbook, isLoading } = useQuery({
    queryKey: ["workbook", workbookId],
    queryFn: async () => {
      const items = await base44.entities.Workbook.filter({ id: workbookId });
      return items[0] || null;
    },
    enabled: !!workbookId,
  });

  const { data: expert } = useQuery({
    queryKey: ["workbookExpert", workbook?.expert_id],
    queryFn: async () => {
      const items = await base44.entities.Expert.filter({ id: workbook.expert_id });
      return items[0] || null;
    },
    enabled: !!workbook?.expert_id,
  });

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
  }, []);

  useEffect(() => {
    base44.entities.WorkbookResponse.filter({ workbook_id: workbookId }, "-created_date", 1)
      .then(responses => {
        if (responses?.length > 0) {
          setResponseId(responses[0].id);
          setAnswers(responses[0].answers || {});
          setIsComplete(responses[0].is_complete || false);
        }
      }).catch(() => {}).finally(() => setResponseLoaded(true));
  }, [workbookId]);

  const persistData = useCallback((updated) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (responseId) {
        await base44.entities.WorkbookResponse.update(responseId, { answers: updated });
      } else {
        const created = await base44.entities.WorkbookResponse.create({ workbook_id: workbookId, answers: updated });
        setResponseId(created.id);
      }
      setLastSaved(new Date());
    }, 800);
  }, [responseId, workbookId]);

  const handleAnswerChange = useCallback((fieldId, value) => {
    setAnswers(prev => {
      const updated = { ...prev, [fieldId]: value };
      persistData(updated);
      return updated;
    });
  }, [persistData]);

  const sections = useMemo(() => {
    if (!workbook?.schema?.sections) return [];
    return workbook.schema.sections;
  }, [workbook]);

  const progressPct = useMemo(() => {
    const fillable = sections.filter(s => s.display_only !== true);
    if (!fillable.length) return 0;
    const answered = fillable.filter(section =>
      section.fields?.some(f => {
        const v = answers[f.id];
        if (v === undefined || v === null) return false;
        if (typeof v === "string") return v.trim() !== "";
        return true;
      })
    );
    return Math.round((answered.length / fillable.length) * 100);
  }, [sections, answers]);

  if (isLoading || !responseLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#FAF5F3" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#4A0E2E" }} />
      </div>
    );
  }

  if (!workbook) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-6" style={{ background: "#FAF5F3" }}>
        <BookOpen className="w-12 h-12 mb-4" style={{ color: "#C4847A" }} />
        <h2 style={{ fontFamily: "var(--aw-font-display)", fontSize: 28, color: "#4A0E2E", marginBottom: 8 }}>Workbook not found</h2>
        <Link
          to="/Dashboard"
          style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
            color: "#fff", background: "#C4847A", padding: "12px 28px", borderRadius: 100,
            textDecoration: "none", fontFamily: "var(--aw-font-sans)" }}
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const currentSection = sections[activeSection];
  const isFirst = activeSection === 0;
  const isLast = activeSection === sections.length - 1;

  return (
    <div style={{ minHeight: "100vh", background: "#FAF5F3" }}>
      {/* Top bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 40, background: "#fff", borderBottom: "1px solid rgba(74,14,46,0.08)", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <Link to="/Dashboard" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#4A0E2E", textDecoration: "none", fontFamily: "var(--aw-font-sans)" }}>
            ← BACK
          </Link>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "var(--aw-font-sans)", fontWeight: 700, fontSize: 13, color: "#4A0E2E", margin: 0 }}>{workbook.title}</p>
          <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 11, color: "#8A7A76", margin: 0 }}>
            Section {activeSection + 1} of {sections.length} · {progressPct}% complete
          </p>
        </div>
        <div style={{ width: 60 }} />
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: "rgba(74,14,46,0.08)" }}>
        <div style={{ height: "100%", width: `${progressPct}%`, background: "#C4847A", transition: "width 0.3s" }} />
      </div>

      {/* Section content */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 32px 120px" }}>
        {currentSection ? (
          <div>
            {currentSection.title && (
              <h2 style={{ fontFamily: "var(--aw-font-display)", fontSize: 28, color: "#4A0E2E", marginBottom: 8 }}>
                {currentSection.title}
              </h2>
            )}
            {currentSection.description && (
              <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 14, color: "#8A7A76", marginBottom: 32, lineHeight: 1.6 }}>
                {currentSection.description}
              </p>
            )}

            {/* Fields */}
            {currentSection.fields?.map(field => (
              <div key={field.id} style={{ marginBottom: 24 }}>
                {field.label && (
                  <label style={{ display: "block", fontFamily: "var(--aw-font-sans)", fontWeight: 600, fontSize: 13, color: "#4A0E2E", marginBottom: 8 }}>
                    {field.label}
                  </label>
                )}
                {field.helper_text && (
                  <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 12, color: "#8A7A76", marginBottom: 8, fontStyle: "italic" }}>
                    {field.helper_text}
                  </p>
                )}

                {(field.type === "textarea" || field.type === "long_text" || field.type === "reflection") && (
                  <textarea
                    value={answers[field.id] || ""}
                    onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                    placeholder={field.placeholder || "Write your response..."}
                    rows={5}
                    style={{
                      width: "100%", padding: "14px 16px", borderRadius: 12,
                      border: "1px solid rgba(74,14,46,0.15)", fontFamily: "var(--aw-font-sans)",
                      fontSize: 14, lineHeight: 1.6, resize: "vertical", background: "#fff",
                      outline: "none",
                    }}
                  />
                )}

                {(field.type === "text" || field.type === "short_text") && (
                  <input
                    type="text"
                    value={answers[field.id] || ""}
                    onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                    placeholder={field.placeholder || ""}
                    style={{
                      width: "100%", padding: "12px 16px", borderRadius: 12,
                      border: "1px solid rgba(74,14,46,0.15)", fontFamily: "var(--aw-font-sans)",
                      fontSize: 14, background: "#fff", outline: "none",
                    }}
                  />
                )}

                {field.type === "scale" && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {Array.from({ length: (field.max || 10) - (field.min || 1) + 1 }, (_, i) => i + (field.min || 1)).map(n => (
                      <button
                        key={n}
                        onClick={() => handleAnswerChange(field.id, String(n))}
                        style={{
                          width: 40, height: 40, borderRadius: "50%",
                          border: answers[field.id] === String(n) ? "2px solid #4A0E2E" : "1px solid rgba(74,14,46,0.15)",
                          background: answers[field.id] === String(n) ? "#4A0E2E" : "#fff",
                          color: answers[field.id] === String(n) ? "#fff" : "#4A0E2E",
                          fontFamily: "var(--aw-font-sans)", fontWeight: 600, fontSize: 13, cursor: "pointer",
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                )}

                {(field.type === "info" || field.type === "display") && field.content && (
                  <div style={{ fontFamily: "var(--aw-font-sans)", fontSize: 14, color: "#4A0E2E", lineHeight: 1.6 }}
                    dangerouslySetInnerHTML={{ __html: field.content }}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#8A7A76" }}>No content for this section.</p>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff",
        borderTop: "1px solid rgba(74,14,46,0.08)", padding: "12px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 40,
      }}>
        <button
          onClick={() => !isFirst && setActiveSection(activeSection - 1)}
          disabled={isFirst}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 100,
            border: "1px solid rgba(74,14,46,0.15)", background: "#fff", cursor: isFirst ? "not-allowed" : "pointer",
            opacity: isFirst ? 0.4 : 1, fontFamily: "var(--aw-font-sans)", fontWeight: 700, fontSize: 11,
            letterSpacing: "0.15em", textTransform: "uppercase", color: "#4A0E2E",
          }}
        >
          <ChevronLeft style={{ width: 16, height: 16 }} /> PREV
        </button>

        <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 11, color: "#8A7A76" }}>
          {activeSection + 1} / {sections.length}
        </p>

        <button
          onClick={() => !isLast && setActiveSection(activeSection + 1)}
          disabled={isLast}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 100,
            border: "none", background: "#C4847A", cursor: isLast ? "not-allowed" : "pointer",
            opacity: isLast ? 0.4 : 1, fontFamily: "var(--aw-font-sans)", fontWeight: 700, fontSize: 11,
            letterSpacing: "0.15em", textTransform: "uppercase", color: "#fff",
          }}
        >
          NEXT <ChevronRight style={{ width: 16, height: 16 }} />
        </button>
      </div>

      {lastSaved && (
        <div style={{ position: "fixed", bottom: 60, right: 24, fontFamily: "var(--aw-font-sans)", fontSize: 10, color: "#8A7A76" }}>
          Saved {lastSaved.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}