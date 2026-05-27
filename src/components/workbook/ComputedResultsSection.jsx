import React from "react";
import WorkbookFieldRenderer from "./WorkbookFieldRenderer";
import {
  DOMINANT_STATE_PORTRAITS,
  WINDOW_PORTRAITS,
  RESOURCE_PORTRAITS,
  SOMATIC_PORTRAITS,
  STATE_DISPLAY_NAMES,
  WINDOW_DISPLAY_NAMES,
  RESOURCE_DISPLAY_NAMES,
  SOMATIC_DISPLAY_NAMES,
  STRESS_LOCATION_LABELS,
  SAFETY_SIGNAL_LABELS,
} from "@/data/nervousSystemPortraits";

/* ── Shared prose style ───────────────────────────────── */
const PROSE = {
  fontFamily: "var(--aw-font-sans)",
  fontWeight: 300,
  fontSize: 15,
  lineHeight: 1.85,
  color: "var(--aw-dark-grey)",
  margin: 0,
};

/* ── Individual portrait card ─────────────────────────── */
function PortraitCard({ portrait, accent = false }) {
  if (!portrait) return null;
  return (
    <div style={{
      borderRadius: 14,
      padding: "24px 28px",
      background: accent ? "var(--aw-rose-pale)" : "#fff",
      border: `1.5px solid ${accent ? "rgba(74,14,46,0.18)" : "rgba(74,14,46,0.08)"}`,
      marginBottom: 20,
    }}>
      <p style={{
        fontFamily: "var(--aw-font-display)",
        fontWeight: 400,
        fontSize: "clamp(19px, 2.4vw, 23px)",
        lineHeight: 1.2,
        color: "var(--aw-burg-core)",
        margin: "0 0 12px",
      }}>
        {portrait.title}
      </p>
      <p style={PROSE}>{portrait.body}</p>
    </div>
  );
}

/* ── Summary chip row ─────────────────────────────────── */
function Chip({ label, value }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 4,
      padding: "12px 16px",
      borderRadius: 10,
      background: "var(--aw-rose-wash)",
      border: "1px solid rgba(196,132,122,0.22)",
      flex: "1 1 0",
      minWidth: 0,
    }}>
      <span style={{
        fontFamily: "var(--aw-font-sans)",
        fontWeight: 700,
        fontSize: 9,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: "var(--aw-rose-core)",
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: "var(--aw-font-sans)",
        fontWeight: 600,
        fontSize: 13,
        color: "var(--aw-burg-core)",
        lineHeight: 1.35,
      }}>
        {value}
      </span>
    </div>
  );
}

/* ── Main component ───────────────────────────────────── */
export default function ComputedResultsSection({
  section,
  computedScores,
  answers,
  onAnswerChange,
  sections,
  onJumpToSection,
  assets,
}) {
  // Section header
  const SectionHead = () => (
    <div style={{ marginBottom: 36 }}>
      {section.part_label && (
        <p style={{
          fontFamily: "var(--aw-font-sans)",
          fontWeight: 700, fontSize: 10, letterSpacing: "0.28em",
          textTransform: "uppercase", color: "var(--aw-rose-core)", margin: "0 0 8px",
        }}>
          {section.part_label}
        </p>
      )}
      {section.heading && (
        <h1 style={{
          fontFamily: "var(--aw-font-display)", fontWeight: 400,
          fontSize: "clamp(34px, 4.6vw, 52px)", lineHeight: 1.05,
          letterSpacing: "-0.015em", color: "var(--aw-burg-core)", margin: 0,
        }}>
          {section.heading}
        </h1>
      )}
      {section.intro_text && (
        <p style={{ ...PROSE, margin: "18px 0 0" }}>{section.intro_text}</p>
      )}
    </div>
  );

  // Not yet complete
  if (!computedScores) {
    return (
      <div>
        <SectionHead />
        <div style={{
          borderRadius: 14,
          padding: "32px 28px",
          background: "var(--aw-rose-wash)",
          border: "1.5px dashed rgba(196,132,122,0.4)",
          textAlign: "center",
        }}>
          <p style={{
            fontFamily: "var(--aw-font-display)",
            fontWeight: 400,
            fontSize: 22,
            color: "var(--aw-burg-core)",
            margin: "0 0 10px",
          }}>
            Your portrait is waiting
          </p>
          <p style={{ ...PROSE, textAlign: "center" }}>
            Complete all sections above to see your portrait.
          </p>
        </div>
      </div>
    );
  }

  const { portrait_keys, state_frequencies, top_stress_locations, top_safety_signals } = computedScores;

  // Resolve portraits
  const dominantPortrait = DOMINANT_STATE_PORTRAITS[portrait_keys?.dominant];
  const windowPortrait   = WINDOW_PORTRAITS[portrait_keys?.window];
  const resourcePortrait = RESOURCE_PORTRAITS[portrait_keys?.resources];
  const somaticPortrait  = SOMATIC_PORTRAITS[portrait_keys?.somatic];

  // Summary data
  const stressLabels  = (top_stress_locations || []).map(k => STRESS_LOCATION_LABELS[k] || k);
  const safetyLabels  = (top_safety_signals   || []).map(k => SAFETY_SIGNAL_LABELS[k]   || k);

  return (
    <div>
      <SectionHead />

      {/* Eyebrow */}
      <p style={{
        fontFamily: "var(--aw-font-sans)",
        fontWeight: 700, fontSize: 10, letterSpacing: "0.28em",
        textTransform: "uppercase", color: "var(--aw-rose-core)", margin: "0 0 28px",
      }}>
        Your Nervous System Portrait
      </p>

      {/* Four portrait cards */}
      <PortraitCard portrait={dominantPortrait} accent />
      <PortraitCard portrait={windowPortrait} />
      <PortraitCard portrait={resourcePortrait} />
      <PortraitCard portrait={somaticPortrait} />

      {/* Summary card */}
      <div style={{
        borderRadius: 14,
        padding: "24px 28px",
        background: "var(--aw-burg-core)",
        marginTop: 8,
        marginBottom: 28,
      }}>
        <p style={{
          fontFamily: "var(--aw-font-sans)",
          fontWeight: 700, fontSize: 10, letterSpacing: "0.22em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.55)", margin: "0 0 16px",
        }}>
          At a Glance
        </p>

        {/* Chip row */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
          <Chip label="Dominant state"    value={STATE_DISPLAY_NAMES[portrait_keys?.dominant]   || portrait_keys?.dominant} />
          <Chip label="Window"            value={WINDOW_DISPLAY_NAMES[portrait_keys?.window]     || portrait_keys?.window} />
          <Chip label="Resources"         value={RESOURCE_DISPLAY_NAMES[portrait_keys?.resources] || portrait_keys?.resources} />
          <Chip label="Body awareness"    value={SOMATIC_DISPLAY_NAMES[portrait_keys?.somatic]   || portrait_keys?.somatic} />
        </div>

        {/* Locations */}
        {stressLabels.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <p style={{
              fontFamily: "var(--aw-font-sans)", fontWeight: 700, fontSize: 9,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)", margin: "0 0 6px",
            }}>
              Top stress locations
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {stressLabels.map(l => (
                <span key={l} style={{
                  padding: "4px 10px", borderRadius: 100,
                  background: "rgba(255,255,255,0.12)",
                  fontFamily: "var(--aw-font-sans)", fontSize: 12,
                  color: "rgba(255,255,255,0.85)", fontWeight: 500,
                }}>
                  {l}
                </span>
              ))}
            </div>
          </div>
        )}
        {safetyLabels.length > 0 && (
          <div>
            <p style={{
              fontFamily: "var(--aw-font-sans)", fontWeight: 700, fontSize: 9,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)", margin: "0 0 6px",
            }}>
              Safety signals
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {safetyLabels.map(l => (
                <span key={l} style={{
                  padding: "4px 10px", borderRadius: 100,
                  background: "rgba(196,132,122,0.35)",
                  fontFamily: "var(--aw-font-sans)", fontSize: 12,
                  color: "rgba(255,255,255,0.9)", fontWeight: 500,
                }}>
                  {l}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Remaining fields (e.g. closing_word short_text) */}
      {section.fields?.length > 0 && (
        <div className="space-y-6">
          {section.fields.map(field => (
            <WorkbookFieldRenderer
              key={field.id || field.field_id}
              field={{ ...field, id: field.id || field.field_id }}
              answers={answers}
              onAnswerChange={onAnswerChange}
              sections={sections}
              onJumpToSection={onJumpToSection}
              assets={assets}
            />
          ))}
        </div>
      )}
    </div>
  );
}