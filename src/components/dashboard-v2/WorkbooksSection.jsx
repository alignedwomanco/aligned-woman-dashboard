import React from "react";
import { ArrowDownToLine } from "lucide-react";

const STATUS_CONFIG = {
  completed: {
    label: "COMPLETED",
    dotClass: "bg-green-500",
    textClass: "text-green-700",
    pillClass: "bg-green-50",
  },
  in_progress: {
    label: "IN PROGRESS",
    dotClass: "bg-awrose-deep",
    textClass: "text-awburg-core",
    pillClass: "bg-awrose-pale",
  },
  not_started: {
    label: "NOT STARTED",
    dotClass: "bg-awburg-core/40",
    textClass: "text-awburg-core/60",
    pillClass: "bg-awburg-core/8",
  },
};

function WorkbookCard({ title, expert, status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.not_started;
  const actionLabel = status === "completed" ? "REVIEW" : status === "in_progress" ? "CONTINUE" : "BEGIN";

  return (
    <div className="bg-paper rounded-xl border border-awburg-core/8 p-5 flex flex-col h-full">
      {/* Status pill */}
      <div className="mb-5">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 ${cfg.pillClass}`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dotClass}`} />
          <span className={`font-body font-bold text-[10px] tracking-eyebrow uppercase ${cfg.textClass}`}>
            {cfg.label}
          </span>
        </span>
      </div>

      {/* Title */}
      <h4 className="font-display text-awburg-core text-xl leading-snug flex-1 mb-2">
        {title}
      </h4>

      {/* Expert */}
      <p className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core/55 uppercase mb-5">
        {expert}
      </p>

      {/* Footer */}
      <div className="border-t border-awburg-core/8 pt-4 flex items-center justify-between">
        <button className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core hover:text-awburg-dark hover:underline uppercase transition-colors">
          {actionLabel} →
        </button>
        <button className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core/55 hover:text-awburg-core uppercase transition-colors flex items-center gap-1">
          <ArrowDownToLine className="w-3 h-3" />
          PDF
        </button>
      </div>
    </div>
  );
}

export default function WorkbooksSection({ workbooks, phaseIndex }) {
  const items = workbooks?.length > 0 ? workbooks : [
    { title: "Hormones & Stress Audit", expert: "Dr Shirley Du Plessis", status: "not_started" },
    { title: "Nutrition, Energy & Metabolic Health", expert: "Danielle Venter", status: "not_started" },
    { title: "Women's Body Literacy", expert: "Dr Candice Morrison", status: "not_started" },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase">
          <span className="inline-block w-3 h-px bg-awrose-core mr-2 align-middle" />
          YOUR WORKBOOKS · PHASE {String(phaseIndex || 1).padStart(2, "0")}
        </p>
        <button className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core/60 hover:text-awburg-core uppercase transition-colors">
          ALL WORKBOOKS +
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map((wb, i) => (
          <WorkbookCard key={i} title={wb.title} expert={wb.expert} status={wb.status} />
        ))}
      </div>
    </div>
  );
}