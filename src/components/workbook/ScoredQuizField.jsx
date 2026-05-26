import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

/**
 * ScoredQuizField — renders a scored_quiz field within a regular workbook section.
 * field.type === "scored_quiz"
 */
export default function ScoredQuizField({ field, answers = {}, onAnswerChange }) {
  const saved = answers[field.id] || {};

  const [phase, setPhase] = useState("intro"); // intro | quiz | results
  const [currentIdx, setCurrentIdx] = useState(0);
  const [responses, setResponses] = useState({});
  const [advancing, setAdvancing] = useState(false);
  const [computedResults, setComputedResults] = useState(null);

  const questions = field.questions || [];
  const scoring = field.scoring || {};
  const scaleLabels = field.scale_labels || [
    { value: 1, label: "Rarely", description: "This almost never applies to me" },
    { value: 2, label: "Occasionally", description: "This happens sometimes but is not my default" },
    { value: 3, label: "Sometimes", description: "This shows up regularly in certain contexts" },
    { value: 4, label: "Often", description: "This is a frequent pattern in my life" },
    { value: 5, label: "Almost Always", description: "This is my default in most situations" },
  ];

  // Pure calculation — safe, never throws
  const computeResults = useCallback((responseMap) => {
    try {
      const total = questions.reduce((sum, q) => sum + (responseMap[q.id] || 0), 0);

      const matchedBand = (scoring.bands || []).find(b => {
        const r = b.range || {};
        return total >= (r.min || 0) && total <= (r.max || 9999);
      }) || null;

      let highQ = questions[0] || null;
      let lowQ = questions[0] || null;
      let highScore = -1;
      let lowScore = 6;
      questions.forEach(q => {
        const s = responseMap[q.id] || 0;
        if (s > highScore) { highScore = s; highQ = q; }
        if (s < lowScore) { lowScore = s; lowQ = q; }
      });

      // Aggregate by dimension for radar
      const dimMap = {};
      questions.forEach(q => {
        const dim = q.dimension || q.id;
        if (!dimMap[dim]) dimMap[dim] = { sum: 0, count: 0 };
        dimMap[dim].sum += responseMap[q.id] || 0;
        dimMap[dim].count += 1;
      });
      const radarData = Object.entries(dimMap).map(([dim, { sum, count }]) => ({
        dimension: dim,
        score: parseFloat((sum / count).toFixed(2)),
        fullMark: 5,
      }));

      return { total, matchedBand, highQ, highScore, lowQ, lowScore, radarData };
    } catch (err) {
      console.error("[ScoredQuizField] computeResults error:", err);
      return { total: 0, matchedBand: null, highQ: null, highScore: 0, lowQ: null, lowScore: 0, radarData: [] };
    }
  }, [questions, scoring.bands]);

  // Restore state from saved data
  useEffect(() => {
    if (saved.total_score !== undefined && saved.responses) {
      setResponses(saved.responses);
      setComputedResults(computeResults(saved.responses));
      setPhase("results");
    } else if (saved.responses) {
      setResponses(saved.responses);
      const count = Object.keys(saved.responses).length;
      if (count >= questions.length) {
        const res = computeResults(saved.responses);
        setComputedResults(res);
        setPhase("results");
      } else {
        setCurrentIdx(count);
        setPhase("quiz");
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = useCallback((questionId, value) => {
    if (advancing) return;
    setAdvancing(true);
    const updated = { ...responses, [questionId]: value };
    setResponses(updated);

    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(i => i + 1);
        onAnswerChange?.(field.id, { responses: updated });
      } else {
        // All done
        const res = computeResults(updated);
        setComputedResults(res);
        const saveData = {
          responses: updated,
          total_score: res.total,
          band_id: res.matchedBand?.id || null,
          completed_at: new Date().toISOString(),
        };
        onAnswerChange?.(field.id, saveData);
        setPhase("view_results");
      }
      setAdvancing(false);
    }, 380);
  }, [advancing, responses, currentIdx, questions.length, field.id, onAnswerChange, computeResults]);

  const handleViewResults = () => setPhase("results");

  const handleRetake = useCallback(() => {
    setResponses({});
    setCurrentIdx(0);
    setComputedResults(null);
    setPhase("intro");
    onAnswerChange?.(field.id, {});
  }, [field.id, onAnswerChange]);

  // ─── INTRO ───
  if (phase === "intro") {
    return (
      <div style={{ padding: "28px 0 8px" }}>
        {field.label && (
          <h3 style={{
            fontFamily: "var(--aw-font-display)",
            fontSize: "clamp(22px, 3vw, 30px)",
            fontWeight: 400,
            color: "#4A0E2E",
            margin: "0 0 12px",
            lineHeight: 1.2,
          }}>
            {field.label}
          </h3>
        )}
        {field.instructions && (
          <p style={{
            fontFamily: "var(--aw-font-sans)",
            fontSize: 14,
            fontWeight: 300,
            color: "#3A2A28",
            lineHeight: 1.75,
            margin: "0 0 24px",
          }}>
            {field.instructions}
          </p>
        )}
        <button
          onClick={() => setPhase("quiz")}
          style={btnPrimaryStyle}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          Begin Audit
        </button>
      </div>
    );
  }

  // ─── QUIZ ───
  if (phase === "quiz") {
    const q = questions[currentIdx];
    const progress = ((currentIdx) / questions.length) * 100;

    return (
      <div style={{ maxWidth: 680, padding: "12px 0" }}>
        {/* Progress */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={eyebrowStyle}>{currentIdx + 1} of {questions.length}</span>
            <span style={eyebrowStyle}>{Math.round(progress)}%</span>
          </div>
          <div style={{ height: 3, background: "rgba(74,14,46,0.08)", borderRadius: 2 }}>
            <div style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg, #C4847A, #4A0E2E)",
              borderRadius: 2,
              transition: "width 300ms ease",
            }} />
          </div>
          {/* Dots */}
          <div style={{ display: "flex", gap: 6, marginTop: 10, justifyContent: "center" }}>
            {questions.map((_, i) => (
              <div key={i} style={{
                width: i === currentIdx ? 20 : 8,
                height: 8,
                borderRadius: 4,
                background: i < currentIdx ? "#4A0E2E" : i === currentIdx ? "#C4847A" : "rgba(74,14,46,0.12)",
                transition: "all 300ms ease",
              }} />
            ))}
          </div>
        </div>

        {/* Question */}
        <h3 style={{
          fontFamily: "var(--aw-font-display)",
          fontSize: "clamp(20px, 2.6vw, 26px)",
          fontWeight: 400,
          color: "#4A0E2E",
          lineHeight: 1.3,
          margin: "0 0 24px",
        }}>
          {q?.text}
        </h3>

        {/* Scale options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {scaleLabels.map(opt => {
            const selected = responses[q?.id] === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleSelect(q.id, opt.value)}
                disabled={advancing}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "18px 22px",
                  borderRadius: 12,
                  border: selected ? "2px solid #4A0E2E" : "1.5px solid rgba(74,14,46,0.14)",
                  background: selected ? "#4A0E2E" : "#FFFFFF",
                  color: selected ? "#FFFFFF" : "#3A2A28",
                  cursor: advancing ? "not-allowed" : "pointer",
                  opacity: advancing ? 0.75 : 1,
                  transition: "all 180ms ease",
                }}
                onMouseEnter={e => { if (!advancing && !selected) { e.currentTarget.style.background = "#FDF5F3"; e.currentTarget.style.borderColor = "rgba(74,14,46,0.3)"; }}}
                onMouseLeave={e => { if (!advancing && !selected) { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.borderColor = "rgba(74,14,46,0.14)"; }}}
              >
                <div style={{ fontFamily: "var(--aw-font-sans)", fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 4 }}>
                  {opt.value}. {opt.label}
                </div>
                <div style={{ fontFamily: "var(--aw-font-sans)", fontSize: 13, fontWeight: 300, lineHeight: 1.5 }}>
                  {opt.description}
                </div>
              </button>
            );
          })}
        </div>

        {currentIdx > 0 && (
          <button
            onClick={() => setCurrentIdx(i => i - 1)}
            disabled={advancing}
            style={{ marginTop: 20, fontFamily: "var(--aw-font-sans)", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", background: "transparent", color: "#8A7A76", border: "none", padding: "8px 0", cursor: "pointer" }}
          >
            ← Previous
          </button>
        )}
      </div>
    );
  }

  // ─── VIEW RESULTS CTA ───
  if (phase === "view_results") {
    return (
      <div style={{ padding: "32px 0", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--aw-font-display)", fontSize: 24, fontWeight: 400, color: "#4A0E2E", marginBottom: 8 }}>
          All questions answered
        </p>
        <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 14, fontWeight: 300, color: "#8A7A76", marginBottom: 28 }}>
          Your results are ready.
        </p>
        <button onClick={handleViewResults} style={btnPrimaryStyle} onMouseEnter={e => e.currentTarget.style.opacity = "0.85"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
          View My Results
        </button>
      </div>
    );
  }

  // ─── RESULTS ───
  if (phase === "results") {
    const res = computedResults || computeResults(responses);
    const { total, matchedBand, highQ, highScore, lowQ, lowScore, radarData } = res;
    const maxTotal = scoring.max_total || (questions.length * 5);

    return (
      <div style={{ maxWidth: 720, padding: "8px 0" }}>

        {/* 1. Score header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
            <span style={{ fontFamily: "var(--aw-font-display)", fontSize: 60, fontWeight: 400, color: "#4A0E2E", lineHeight: 1 }}>
              {total}
            </span>
            <span style={{ fontFamily: "var(--aw-font-sans)", fontSize: 14, color: "#8A7A76" }}>/ {maxTotal}</span>
          </div>
          {matchedBand && (
            <>
              <h3 style={{ fontFamily: "var(--aw-font-display)", fontSize: 26, fontWeight: 400, color: "#4A0E2E", margin: "0 0 10px" }}>
                {matchedBand.label}
              </h3>
              <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 15, fontWeight: 300, color: "#3A2A28", lineHeight: 1.7, margin: 0 }}>
                {matchedBand.summary}
              </p>
            </>
          )}
        </div>

        {/* 2. Radar chart */}
        {radarData.length > 0 && (
          <div style={{ width: "100%", height: 300, background: "#0E0208", borderRadius: 14, padding: 20, marginBottom: 32 }}>
            <ResponsiveContainer>
              <RadarChart cx="50%" cy="50%" outerRadius="78%" data={radarData}>
                <PolarGrid stroke="rgba(196,132,122,0.15)" />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 9, fontFamily: "var(--aw-font-sans)" }} />
                <Radar name="Score" dataKey="score" stroke="#C4847A" fill="#C4847A" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 3. Horizontal bar chart */}
        <div style={{ marginBottom: 32 }}>
          {questions.map(q => {
            const score = responses[q.id] || 0;
            const color = score <= 2 ? "#C4847A" : score === 3 ? "#A86460" : "#4A0E2E";
            return (
              <div key={q.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <span style={{ fontFamily: "var(--aw-font-sans)", fontSize: 11, fontWeight: 500, color: "#3A2A28", width: 130, flexShrink: 0 }}>
                  {q.dimension || q.id}
                </span>
                <div style={{ flex: 1, height: 8, background: "rgba(74,14,46,0.1)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${(score / 5) * 100}%`, height: "100%", background: color, borderRadius: 4, transition: "width 600ms ease" }} />
                </div>
                <span style={{ fontFamily: "var(--aw-font-sans)", fontSize: 11, fontWeight: 600, color: "#3A2A28", width: 28, textAlign: "right" }}>{score}</span>
              </div>
            );
          })}
        </div>

        {/* 4. Band detail */}
        {matchedBand?.detail && (
          <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 15, fontWeight: 300, color: "#3A2A28", lineHeight: 1.75, marginBottom: 24 }}>
            {matchedBand.detail}
          </p>
        )}

        {/* 5. Band caution */}
        {matchedBand?.caution && (
          <div style={{ borderRadius: 12, padding: "16px 20px", background: "#FDF5F3", border: "1px solid #E8C9C0", marginBottom: 24 }}>
            <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 14, fontWeight: 300, color: "#3A2A28", lineHeight: 1.7, margin: 0 }}>
              {matchedBand.caution}
            </p>
          </div>
        )}

        {/* 6. Band action callout */}
        {matchedBand?.action && (
          <div style={{ borderRadius: 12, padding: "20px 24px", background: "#4A0E2E", marginBottom: 32 }}>
            <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#E8B4AE", marginBottom: 10 }}>
              What to Focus On
            </p>
            <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 14, fontWeight: 300, color: "#FFFFFF", lineHeight: 1.7, margin: 0 }}>
              {matchedBand.action}
            </p>
          </div>
        )}

        {/* 7. Highest / lowest */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 32 }}>
          {highQ && (
            <div style={{ padding: 20, borderRadius: 12, background: "#FDF5F3", border: "1px solid rgba(196,132,122,0.25)" }}>
              <p style={eyebrowStyle2}>Highest Load</p>
              <p style={{ fontFamily: "var(--aw-font-display)", fontSize: 18, fontWeight: 400, color: "#4A0E2E", marginBottom: 4 }}>{highQ.dimension || highQ.id}</p>
              <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 13, fontWeight: 600, color: "#3A2A28", marginBottom: 10 }}>{highScore} / 5</p>
              <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 12, fontWeight: 300, color: "#3A2A28", lineHeight: 1.6, margin: 0 }}>
                This is where you're carrying the most weight. Start your attention here.
              </p>
            </div>
          )}
          {lowQ && (
            <div style={{ padding: 20, borderRadius: 12, background: "#FDF5F3", border: "1px solid rgba(196,132,122,0.25)" }}>
              <p style={eyebrowStyle2}>Relative Strength</p>
              <p style={{ fontFamily: "var(--aw-font-display)", fontSize: 18, fontWeight: 400, color: "#4A0E2E", marginBottom: 4 }}>{lowQ.dimension || lowQ.id}</p>
              <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 13, fontWeight: 600, color: "#3A2A28", marginBottom: 10 }}>{lowScore} / 5</p>
              <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 12, fontWeight: 300, color: "#3A2A28", lineHeight: 1.6, margin: 0 }}>
                You carry less load here. Notice what makes this area different.
              </p>
            </div>
          )}
        </div>

        {/* 8. Per-question insight cards */}
        <div style={{ marginBottom: 32 }}>
          {questions.map(q => {
            const score = responses[q.id] || 0;
            const interpretation = score >= 4 ? q.interpretation?.high : q.interpretation?.low;
            return (
              <div key={q.id} style={{ padding: 16, borderRadius: 12, background: "#FFFFFF", border: "1px solid rgba(74,14,46,0.08)", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div>
                    <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 12, fontWeight: 700, color: "#C4847A", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>
                      {q.dimension || q.id}
                    </p>
                    <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 13, fontWeight: 400, color: "#4A0E2E", margin: 0 }}>
                      {q.text}
                    </p>
                  </div>
                  <span style={{ fontFamily: "var(--aw-font-sans)", fontSize: 18, fontWeight: 700, color: "#4A0E2E", marginLeft: 16, flexShrink: 0 }}>
                    {score}
                  </span>
                </div>
                <div style={{ height: 4, background: "rgba(74,14,46,0.08)", borderRadius: 2, marginBottom: 10 }}>
                  <div style={{ width: `${(score / 5) * 100}%`, height: "100%", background: score <= 2 ? "#C4847A" : score === 3 ? "#A86460" : "#4A0E2E", borderRadius: 2 }} />
                </div>
                {interpretation && (
                  <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 13, fontWeight: 300, color: "#3A2A28", lineHeight: 1.6, margin: 0 }}>
                    {interpretation}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* 9. Core insight */}
        {scoring.core_insight && (
          <div style={{ borderRadius: 12, padding: "24px 28px", background: "#0E0208", marginBottom: 32 }}>
            {scoring.core_insight.body && (
              <p style={{ fontFamily: "var(--aw-font-display)", fontSize: 18, fontWeight: 400, color: "#FFFFFF", lineHeight: 1.5, marginBottom: 10 }}>
                {scoring.core_insight.body}
              </p>
            )}
            {scoring.core_insight.supporting && (
              <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 13, fontWeight: 300, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, margin: 0 }}>
                {scoring.core_insight.supporting}
              </p>
            )}
          </div>
        )}

        {/* Restart button */}
        <button
          onClick={handleRetake}
          style={btnSecondaryStyle}
          onMouseEnter={e => { e.currentTarget.style.background = "#4A0E2E"; e.currentTarget.style.color = "#FFFFFF"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#4A0E2E"; }}
        >
          ↺ Restart Quiz
        </button>
      </div>
    );
  }

  return null;
}

// ─── Shared styles ───
const btnPrimaryStyle = {
  fontFamily: "var(--aw-font-sans)",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  background: "#4A0E2E",
  color: "#FFFFFF",
  border: "none",
  borderRadius: 100,
  padding: "14px 32px",
  cursor: "pointer",
  transition: "opacity 180ms ease",
  display: "inline-block",
};

const btnSecondaryStyle = {
  fontFamily: "var(--aw-font-sans)",
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  background: "transparent",
  color: "#4A0E2E",
  border: "1.5px solid #4A0E2E",
  borderRadius: 100,
  padding: "14px 32px",
  cursor: "pointer",
  transition: "all 180ms ease",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

const eyebrowStyle = {
  fontFamily: "var(--aw-font-sans)",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "#8A7A76",
};

const eyebrowStyle2 = {
  fontFamily: "var(--aw-font-sans)",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "#C4847A",
  marginBottom: 6,
};