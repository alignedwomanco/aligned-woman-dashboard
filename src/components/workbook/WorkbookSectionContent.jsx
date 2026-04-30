import React from "react";
import WorkbookFieldRenderer from "./WorkbookFieldRenderer";

export default function WorkbookSectionContent({ section, answers = {}, onAnswerChange }) {
  if (!section) return null;

  // Split title to render section_number in italic rose if present
  const renderTitle = () => {
    const num = section.section_number;
    const title = section.title || "";
    if (num) {
      return (
        <>
          <span style={{ fontStyle: "italic", color: "var(--aw-rose-core)" }}>{num}.</span>{" "}
          {title}
        </>
      );
    }
    return title;
  };

  return (
    <div>
      {/* Section head — 36px margin-bottom per spec */}
      <div style={{ marginBottom: 36 }}>
        {section.eyebrow && (
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
            {section.eyebrow}
          </p>
        )}
        <h1 style={{
          fontFamily: "var(--aw-font-display)",
          fontWeight: 400,
          fontSize: "clamp(34px, 4.6vw, 52px)",
          lineHeight: 1.05,
          letterSpacing: "-0.015em",
          color: "var(--aw-burg-core)",
          margin: 0,
        }}>
          {renderTitle()}
        </h1>
        {section.intro && (
          <p style={{
            fontFamily: "var(--aw-font-sans)",
            fontWeight: 300,
            fontSize: 16,
            lineHeight: 1.85,
            color: "var(--aw-dark-grey)",
            margin: "18px 0 0",
          }}>
            {section.intro}
          </p>
        )}
      </div>

      {/* Fields */}
      <div className="space-y-6">
        {section.fields?.map((field) => (
          <WorkbookFieldRenderer
            key={field.id}
            field={field}
            answers={answers}
            onAnswerChange={onAnswerChange}
            sectionFields={section.fields}
          />
        ))}
      </div>
    </div>
  );
}