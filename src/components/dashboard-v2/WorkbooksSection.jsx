import React from "react";
import { FileText } from "lucide-react";

const STATUS_CONFIG = {
  completed: { label: "COMPLETED", dotClass: "bg-green-500", textClass: "text-green-700" },
  in_progress: { label: "IN PROGRESS", dotClass: "bg-awrose-core", textClass: "text-awburg-core" },
  not_started: { label: "NOT STARTED", dotClass: "bg-awburg-core/20", textClass: "text-awburg-core/60" },
};

function WorkbookCard({ title, expert, status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.not_started;
  const actionLabel = status === "completed" ? "REVIEW" : status === "in_progress" ? "CONTINUE" : "BEGIN";

  return (
    <div className="bg-paper rounded-xl border border-awburg-core/8 p-4 flex flex-col h-full">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-awrose-pale rounded-lg flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-awburg-core" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${cfg.dotClass}`} />
          <span className={`font-body font-bold text-[9px] tracking-eyebrow uppercase ${cfg.textClass}`}>
            {cfg.label}
          </span>
        </div>
      </div>

      <h4 className="font-display text-awburg-core text-base mb-1 leading-snug flex-1">
        {title}
      </h4>

      <p className="font-body font-bold text-[9px] tracking-eyebrow text-awburg-core/55 uppercase mb-3">
        {expert}
      </p>

      <div className="border-t border-awburg-core/8 pt-3 flex items-center justify-between">
        <button className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core hover:text-awburg-dark uppercase transition-colors">
          {actionLabel} →
        </button>
        <button className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core/55 hover:text-awburg-core uppercase transition-colors">
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
          ALL WORKBOOKS →
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