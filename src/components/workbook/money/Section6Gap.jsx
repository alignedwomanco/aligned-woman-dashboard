import React from "react";
import WorkbookFieldRenderer from "../WorkbookFieldRenderer";
import WorkbookFinishButton from "../WorkbookFinishButton";

export default function Section6Gap({ section, answers, onAnswerChange, isLastSection, isComplete, completedAt, onFinish, onMarkInProgress, assets }) {
  return (
    <div>
      {section.fields?.map((field) => (
        <WorkbookFieldRenderer
          key={field.id}
          field={field}
          answers={answers}
          onAnswerChange={onAnswerChange}
          assets={assets}
        />
      ))}
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