import React from "react";
import WorkbookFieldRenderer from "./WorkbookFieldRenderer";
import WorkbookFinishButton from "./WorkbookFinishButton";
import ScoredQuizSection from "./ScoredQuizSection";
import ComputedResultsSection from "./ComputedResultsSection";

/* ── Interactive workbook sections (Money workbook) ──── */
import Section1Diagnostic from "./money/Section1Diagnostic";
import Section2Blueprint from "./money/Section2Blueprint";
import Section3Scripts from "./money/Section3Scripts";
import Section4Triggers from "./money/Section4Triggers";
import Section5Wealth from "./money/Section5Wealth";
import Section6Gap from "./money/Section6Gap";
import Section7Saving from "./money/Section7Saving";
import Section8Risk from "./money/Section8Risk";
import Section9Advice from "./money/Section9Advice";
import Section10Action from "./money/Section10Action";

const INTERACTIVE_SECTIONS = {
  s01: Section1Diagnostic,
  s02: Section2Blueprint,
  s03: Section3Scripts,
  s04: Section4Triggers,
  s05: Section5Wealth,
  s06: Section6Gap,
  s07: Section7Saving,
  s08: Section8Risk,
  s09: Section9Advice,
  s10: Section10Action,
};

/* ── Grounding prompt callout ────────────────────────── */
function GroundingCallout({ text }) {
  return (
    <div style={{
      borderRadius: 12,
      padding: "18px 22px",
      background: "var(--aw-rose-pale)",
      border: "1.5px solid rgba(196,132,122,0.3)",
      marginBottom: 28,
      display: "flex",
      gap: 14,
      alignItems: "flex-start",
    }}>
      <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>🌿</span>
      <p style={{
        fontFamily: "var(--aw-font-sans)",
        fontWeight: 400,
        fontSize: 14,
        fontStyle: "italic",
        lineHeight: 1.75,
        color: "var(--aw-burg-core)",
        margin: 0,
      }}>
        {text}
      </p>
    </div>
  );
}

export default function WorkbookSectionContent({ section, answers = {}, onAnswerChange, sections, onJumpToSection, isLastSection, isComplete, completedAt, onFinish, onMarkInProgress, assets = [], computedScores, step = 0, onStepChange }) {
  if (!section) return null;

  // ── Interactive workbook sections (detected by step_flow in schema) ──
  if (section.step_flow) {
    const InteractiveSection = INTERACTIVE_SECTIONS[section.section_id];
    if (InteractiveSection) {
      return (
        <InteractiveSection
          section={section}
          answers={answers}
          onAnswerChange={onAnswerChange}
          sections={sections}
          onJumpToSection={onJumpToSection}
          isLastSection={isLastSection}
          isComplete={isComplete}
          completedAt={completedAt}
          onFinish={onFinish}
          onMarkInProgress={onMarkInProgress}
          assets={assets}
          computedScores={computedScores}
          step={step}
          onStepChange={onStepChange}
        />
      );
    }
  }

  // ── Computed results section type ──
  if (section.type === "computed_results") {
    return (
      <ComputedResultsSection
        section={section}
        computedScores={computedScores}
        answers={answers}
        onAnswerChange={onAnswerChange}
        sections={sections}
        onJumpToSection={onJumpToSection}
        assets={assets}
      />
    );
  }

  // ── Scored quiz section type ──
  if (section.type === "scored_quiz") {
    return (
      <div>
        {/* Section head */}
        <div style={{ marginBottom: 36 }}>
          {section.part_label && (
            <p style={{
              fontFamily: "var(--aw-font-sans)",
              fontWeight: 700,
              fontSize: 10,
              lineHeight: 1.4,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "var(--aw-rose-core)",
              margin: "0 0 8px",
            }}>
              {section.part_label}
            </p>
          )}
          {section.heading && (
            <h1 style={{
              fontFamily: "var(--aw-font-display)",
              fontWeight: 400,
              fontSize: "clamp(34px, 4.6vw, 52px)",
              lineHeight: 1.05,
              letterSpacing: "-0.015em",
              color: "var(--aw-burg-core)",
              margin: 0,
            }}>
              {section.heading}
            </h1>
          )}
          {section.theme_line && (
            <p style={{
              fontFamily: "var(--aw-font-display)",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(18px, 2.4vw, 22px)",
              lineHeight: 1.4,
              color: "var(--aw-rose-core)",
              margin: "12px 0 0",
            }}>
              {section.theme_line}
            </p>
          )}
          {section.intro_text && (
            <p style={{
              fontFamily: "var(--aw-font-sans)",
              fontWeight: 300,
              fontSize: 16,
              lineHeight: 1.85,
              color: "var(--aw-dark-grey)",
              margin: "18px 0 0",
            }}>
              {section.intro_text}
            </p>
          )}
        </div>

        {/* Grounding prompt */}
        {section.grounding_prompt && <GroundingCallout text={section.grounding_prompt} />}

        {/* Render fields */}
        <div className="space-y-6 mb-8">
          {section.fields?.map((field) => {
            const fieldId = field.id || field.field_id;
            return (
              <WorkbookFieldRenderer
                key={fieldId}
                field={{ ...field, id: fieldId }}
                answers={answers}
                onAnswerChange={onAnswerChange}
                sectionFields={section.fields}
                sections={sections}
                onJumpToSection={onJumpToSection}
                assets={assets}
              />
            );
          })}
        </div>

        {/* Render scored quiz */}
        <ScoredQuizSection
          section={section}
          answers={answers}
          onAnswerChange={onAnswerChange}
          isComplete={isComplete}
          completedAt={completedAt}
          onMarkInProgress={onMarkInProgress}
        />
      </div>
    );
  }

  // ── Default rendering for standard sections ──
  return (
    <div>
      {/* Section head -- 36px margin-bottom per spec */}
      <div style={{ marginBottom: 36 }}>
        {section.part_label && (
          <p style={{
            fontFamily: "var(--aw-font-sans)",
            fontWeight: 700,
            fontSize: 10,
            lineHeight: 1.4,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "var(--aw-rose-core)",
            margin: "0 0 8px",
          }}>
            {section.part_label}
          </p>
        )}
        {section.heading && (
          <h1 style={{
            fontFamily: "var(--aw-font-display)",
            fontWeight: 400,
            fontSize: "clamp(34px, 4.6vw, 52px)",
            lineHeight: 1.05,
            letterSpacing: "-0.015em",
            color: "var(--aw-burg-core)",
            margin: 0,
          }}>
            {section.heading}
          </h1>
        )}
        {section.theme_line && (
          <p style={{
            fontFamily: "var(--aw-font-display)",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(18px, 2.4vw, 22px)",
            lineHeight: 1.4,
            color: "var(--aw-rose-core)",
            margin: "12px 0 0",
          }}>
            {section.theme_line}
          </p>
        )}
        {section.intro_text && (
          <p style={{
            fontFamily: "var(--aw-font-sans)",
            fontWeight: 300,
            fontSize: 16,
            lineHeight: 1.85,
            color: "var(--aw-dark-grey)",
            margin: "18px 0 0",
          }}>
            {section.intro_text}
          </p>
        )}
      </div>

      {/* Grounding prompt (nervous system map and similar sections) */}
      {section.grounding_prompt && <GroundingCallout text={section.grounding_prompt} />}

      {/* Fields */}
      <div className="space-y-6">
        {section.fields?.map((field) => {
          const fieldId = field.id || field.field_id;
          return (
            <WorkbookFieldRenderer
              key={fieldId}
              field={{ ...field, id: fieldId }}
              answers={answers}
              onAnswerChange={onAnswerChange}
              sectionFields={section.fields}
              sections={sections}
              onJumpToSection={onJumpToSection}
              assets={assets}
            />
          );
        })}
      </div>

      {/* Finish button on the last section */}
      {isLastSection && (
        <WorkbookFinishButton
          isComplete={isComplete}
          completedAt={completedAt}
          onFinish={onFinish}
          onMarkInProgress={onMarkInProgress}
        />
      )}
    </div>
  );
}