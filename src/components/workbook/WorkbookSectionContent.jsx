import React from "react";
import WorkbookFieldRenderer from "./WorkbookFieldRenderer";

export default function WorkbookSectionContent({ section, answers = {}, onAnswerChange }) {
  if (!section) return null;

  return (
    <div className="space-y-6">
      {/* Section header */}
      {section.eyebrow && (
        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#C4847A" }}>
          {section.eyebrow}
        </p>
      )}
      <h2 className="text-xl sm:text-2xl font-bold text-[#4A0E2E]">
        {section.section_number && (
          <span className="text-[#C4847A] mr-2">{section.section_number}.</span>
        )}
        {section.title}
      </h2>
      {section.intro && (
        <p className="text-gray-600 leading-relaxed">{section.intro}</p>
      )}

      {/* Fields */}
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
  );
}