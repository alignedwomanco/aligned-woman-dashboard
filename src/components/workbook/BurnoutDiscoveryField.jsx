import React, { useMemo } from "react";

const FONT_SANS = "var(--aw-font-sans, 'Montserrat', sans-serif)";
const FONT_DISPLAY = "var(--aw-font-display, 'DM Serif Display', serif)";
const BURG = "var(--aw-burg-core, #4A0E2E)";
const ROSE = "var(--aw-rose-core, #C4847A)";
const DARK = "var(--aw-dark-grey, #3A2A2A)";

const STAGE_COLORS = {
  1: "#5A8C6A",
  2: "#8A9C3A",
  3: "#C49A3A",
  4: "#B35A3A",
  5: "#4A0E2E",
};

const STAGE_META = {
  1: {
    label: "Stretched but Resourced",
    color: "#5A8C6A",
    message: "Your system is under pressure but it can recover. Sleep still restores you. You still have access to joy, presence, and creativity. The work ahead is about protecting this capacity before it erodes, not about crisis management.",
  },
  2: {
    label: "Running on Reserves",
    color: "#8A9C3A",
    message: "You are drawing on reserves that are not being replenished. Recovery takes longer than it used to. You may be telling yourself this is temporary, but your body is already compensating. The practices in this workbook are designed to interrupt the depletion before it deepens.",
  },
  3: {
    label: "Chronic Activation",
    color: "#C49A3A",
    message: "Your nervous system has lost its ability to switch off. You are wired but tired. Sleep is disrupted, emotions are unpredictable, and the line between coping and struggling has blurred. This is the stage where intervention makes the most difference. You are not too far gone. But your body is asking you to change something.",
  },
  4: {
    label: "Approaching Shutdown",
    color: "#B35A3A",
    message: "Your body is producing symptoms it was not producing six months ago. Headaches, digestive issues, hormonal shifts, brain fog, chest tightness. These are not separate problems. They are your nervous system signaling that it cannot sustain the current load.",
  },
  5: {
    label: "Nervous System Shutdown",
    color: "#4A0E2E",
    message: "Your body has enforced the stop you would not choose. Pushing through is no longer available to you. Everything feels heavy, impossible, or pointless. This is not depression in the way most people understand it. It is your nervous system protecting you by shutting down non-essential functions. You are not broken. You are depleted at a biological level. Go gently.",
  },
};

const QUESTIONS = [
  {
    id: "q1",
    text: "When you wake up in the morning, how do you feel?",
    options: [
      { stage: 1, label: "Rested. Ready for the day." },
      { stage: 2, label: "Tired, but functional after coffee." },
      { stage: 3, label: "Exhausted before the day has started." },
      { stage: 4, label: "Dread. My body feels heavy and my mind is already racing." },
      { stage: 5, label: "I struggle to get out of bed. Some days I cannot." },
    ],
  },
  {
    id: "q2",
    text: "Think about the last time you felt genuinely rested. How long ago was it?",
    options: [
      { stage: 1, label: "This week or last weekend." },
      { stage: 2, label: "A few weeks ago, maybe after a holiday." },
      { stage: 3, label: "I honestly cannot remember." },
      { stage: 4, label: "Months. Possibly longer." },
      { stage: 5, label: "I do not know what rested feels like anymore." },
    ],
  },
  {
    id: "q3",
    text: "When something small goes wrong, how do you react?",
    options: [
      { stage: 1, label: "I handle it. Minor things do not throw me." },
      { stage: 2, label: "I notice more irritation than the situation warrants." },
      { stage: 3, label: "I snap, cry, or shut down. My reaction does not match the event." },
      { stage: 4, label: "I feel overwhelmed instantly. Everything feels like too much." },
      { stage: 5, label: "I feel nothing. Or I cannot process it at all." },
    ],
  },
  {
    id: "q4",
    text: "How does your body feel most of the time?",
    options: [
      { stage: 1, label: "Generally fine. Occasional tension but nothing persistent." },
      { stage: 2, label: "Tight shoulders, sore jaw, low-level tension that never fully lifts." },
      { stage: 3, label: "Wired but tired. My body is buzzing but I have no energy." },
      { stage: 4, label: "New symptoms have appeared: headaches, digestion issues, chest tightness, hormonal changes." },
      { stage: 5, label: "Heavy. Numb. Disconnected. Like I am moving through fog." },
    ],
  },
  {
    id: "q5",
    text: "After a stressful event, how long does it take you to come back to baseline?",
    options: [
      { stage: 1, label: "Minutes to an hour. I recover quickly." },
      { stage: 2, label: "A few hours. I need time alone to reset." },
      { stage: 3, label: "It lingers into the next day. Sometimes longer." },
      { stage: 4, label: "Days. I carry it in my body and my mood." },
      { stage: 5, label: "I do not come back. I just add it to the weight I am already carrying." },
    ],
  },
  {
    id: "q6",
    text: "How do you feel about your work or daily responsibilities?",
    options: [
      { stage: 1, label: "Engaged. Challenged but not overwhelmed." },
      { stage: 2, label: "Managing, but it takes more effort than it used to." },
      { stage: 3, label: "Going through the motions. The meaning has faded." },
      { stage: 4, label: "Resentful. I fantasise about stopping everything." },
      { stage: 5, label: "I cannot engage. Even simple tasks feel impossible." },
    ],
  },
  {
    id: "q7",
    text: "When was the last time you did something purely for enjoyment, not productivity?",
    options: [
      { stage: 1, label: "This week." },
      { stage: 2, label: "I keep meaning to. It has been a while." },
      { stage: 3, label: "I cannot remember. I feel guilty when I am not being productive." },
      { stage: 4, label: "Nothing sounds appealing. I have lost interest." },
      { stage: 5, label: "I do not have the energy to enjoy anything." },
    ],
  },
  {
    id: "q8",
    text: "How connected do you feel to the people closest to you?",
    options: [
      { stage: 1, label: "Connected. I have the capacity for my relationships." },
      { stage: 2, label: "Present but stretched. I give what I can." },
      { stage: 3, label: "Distant. I am physically there but emotionally absent." },
      { stage: 4, label: "Irritable or withdrawn. Relationships feel like another demand." },
      { stage: 5, label: "Isolated. I do not have the energy to connect." },
    ],
  },
];

const MIN_FOR_RESULT = 5;

function getFooterMessage(stage) {
  if (stage <= 2) return "Naming where you are is the first act of self-honesty. You have capacity to build from here.";
  if (stage === 3) return "You are in the zone where intervention makes the most difference. The practices in this workbook are designed for exactly where you are.";
  return "Your body is asking you to stop. The fact that you are here, doing this work, means you are already listening. Go gently.";
}

export default function BurnoutDiscoveryField({ field, answers, onAnswerChange }) {
  const fieldId = field.id || field.field_id;
  const rawValue = answers?.[fieldId] || {};

  const handleSelect = (questionId, stage) => {
    const current = rawValue[questionId];
    const next = current === stage
      ? { ...rawValue }
      : { ...rawValue, [questionId]: stage };
    if (current === stage) delete next[questionId];
    onAnswerChange(fieldId, next);
  };

  const answeredCount = Object.keys(rawValue).length;

  const { avgStage, distribution } = useMemo(() => {
    const values = Object.values(rawValue).filter(v => typeof v === "number");
    if (!values.length) return { avgStage: null, distribution: {} };
    const avg = Math.round(values.reduce((s, v) => s + v, 0) / values.length);
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    values.forEach(v => { if (dist[v] !== undefined) dist[v]++; });
    return { avgStage: avg, distribution: dist };
  }, [rawValue]);

  const showResult = answeredCount >= MIN_FOR_RESULT && avgStage !== null;
  const stageMeta = avgStage ? STAGE_META[avgStage] : null;

  return (
    <div>
      {field.label && (
        <p style={{ fontFamily: FONT_SANS, fontWeight: 700, fontSize: 15, color: BURG, margin: "0 0 4px" }}>
          {field.label}
        </p>
      )}
      {field.prompt && (
        <p style={{ fontFamily: FONT_SANS, fontWeight: 400, fontSize: 14, fontStyle: "italic", color: ROSE, margin: "0 0 24px" }}>
          {field.prompt}
        </p>
      )}

      {/* Questions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {QUESTIONS.map((q, idx) => {
          const selectedStage = rawValue[q.id];
          return (
            <div key={q.id}>
              {/* Question header */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                <span style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 22,
                  color: ROSE,
                  lineHeight: 1,
                  flexShrink: 0,
                  marginTop: 2,
                }}>
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <p style={{
                  fontFamily: FONT_SANS,
                  fontWeight: 700,
                  fontSize: 15,
                  color: BURG,
                  margin: 0,
                  lineHeight: 1.4,
                }}>
                  {q.text}
                </p>
              </div>

              {/* Options */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {q.options.map((opt) => {
                  const isSelected = selectedStage === opt.stage;
                  const color = STAGE_COLORS[opt.stage];
                  return (
                    <button
                      key={opt.stage}
                      onClick={() => handleSelect(q.id, opt.stage)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 16px",
                        border: isSelected ? `2px solid ${color}` : "1.5px solid rgba(74,14,46,0.1)",
                        borderRadius: 10,
                        background: isSelected ? `${color}12` : "#fff",
                        cursor: "pointer",
                        textAlign: "left",
                        fontFamily: FONT_SANS,
                        fontSize: 14,
                        fontWeight: 300,
                        color: DARK,
                        lineHeight: 1.5,
                        transition: "all 0.15s ease",
                        width: "100%",
                      }}
                    >
                      {/* Radio dot */}
                      <span style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: isSelected ? `2px solid ${color}` : "1.5px solid rgba(74,14,46,0.2)",
                        background: isSelected ? color : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.15s ease",
                      }}>
                        {isSelected && (
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} />
                        )}
                      </span>
                      <span style={{ flex: 1, fontWeight: isSelected ? 500 : 300, color: isSelected ? BURG : DARK }}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress counter */}
      {answeredCount > 0 && answeredCount < MIN_FOR_RESULT && (
        <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: ROSE, margin: "20px 0 0", textAlign: "center" }}>
          {answeredCount} of 8 answered — {MIN_FOR_RESULT - answeredCount} more to see your result
        </p>
      )}

      {/* Result card */}
      {showResult && stageMeta && (
        <div style={{
          marginTop: 32,
          borderRadius: 14,
          overflow: "hidden",
          border: `2px solid ${stageMeta.color}40`,
          background: "#fff",
        }}>
          {/* Header */}
          <div style={{
            padding: "18px 24px",
            background: `${stageMeta.color}10`,
            borderBottom: `1px solid ${stageMeta.color}30`,
          }}>
            <p style={{
              fontFamily: FONT_SANS,
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: stageMeta.color,
              margin: "0 0 4px",
            }}>
              Your Burnout Assessment
            </p>
            <p style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 400,
              fontSize: 22,
              color: BURG,
              margin: 0,
              lineHeight: 1.2,
            }}>
              {stageMeta.label}
            </p>
          </div>

          <div style={{ padding: "20px 24px" }}>
            {/* 5-segment spectrum bar */}
            <div style={{ display: "flex", gap: 4, marginBottom: 8, height: 12 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  style={{
                    flex: 1,
                    borderRadius: 100,
                    background: s === avgStage ? STAGE_COLORS[s] : `${STAGE_COLORS[s]}30`,
                    transition: "background 0.3s ease",
                  }}
                />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} style={{
                  fontFamily: FONT_SANS,
                  fontSize: 9,
                  fontWeight: s === avgStage ? 700 : 400,
                  color: s === avgStage ? STAGE_COLORS[s] : "rgba(74,14,46,0.35)",
                  textAlign: "center",
                  flex: 1,
                }}>
                  {STAGE_META[s].label.split(" ")[0]}
                </span>
              ))}
            </div>

            {/* Distribution */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {[1, 2, 3, 4, 5].map((s) => {
                const count = distribution[s] || 0;
                const pct = answeredCount > 0 ? (count / answeredCount) * 100 : 0;
                if (count === 0) return null;
                return (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: STAGE_COLORS[s],
                      flexShrink: 0,
                    }} />
                    <div style={{ flex: 1, height: 7, background: "rgba(74,14,46,0.06)", borderRadius: 100 }}>
                      <div style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: STAGE_COLORS[s],
                        borderRadius: 100,
                        transition: "width 0.4s ease",
                        minWidth: 8,
                      }} />
                    </div>
                    <span style={{
                      fontFamily: FONT_SANS,
                      fontSize: 12,
                      fontWeight: 600,
                      color: STAGE_COLORS[s],
                      width: 60,
                      flexShrink: 0,
                    }}>
                      {count} answer{count !== 1 ? "s" : ""}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Interpretation */}
            <p style={{
              fontFamily: FONT_SANS,
              fontWeight: 300,
              fontSize: 15,
              lineHeight: 1.85,
              color: DARK,
              margin: 0,
            }}>
              {stageMeta.message}
            </p>
          </div>

          {/* Footer */}
          <div style={{
            padding: "14px 24px",
            background: "rgba(74,14,46,0.03)",
            borderTop: "1px solid rgba(74,14,46,0.06)",
          }}>
            <p style={{
              fontFamily: FONT_SANS,
              fontWeight: 400,
              fontSize: 13,
              fontStyle: "italic",
              color: ROSE,
              margin: 0,
              lineHeight: 1.6,
            }}>
              {getFooterMessage(avgStage)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}