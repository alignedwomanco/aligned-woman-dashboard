import React from "react";
import { FileText } from "lucide-react";

const STATUS_CONFIG = {
  completed: { label: "COMPLETED", dotColor: "bg-green-500", textColor: "text-green-700" },
  in_progress: { label: "IN PROGRESS", dotColor: "bg-[#C77B85]", textColor: "text-[#5C1A2E]" },
  not_started: { label: "NOT STARTED", dotColor: "bg-gray-300", textColor: "text-[#6B6168]" },
};

function WorkbookCard({ title, expert, status, onAction }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.not_started;
  const actionLabel = status === "completed" ? "REVIEW" : status === "in_progress" ? "CONTINUE" : "BEGIN";

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col h-full">
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-[#F5E6E8] rounded-lg flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-[#5C1A2E]" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
          <span className={`text-[9px] tracking-[0.15em] font-medium uppercase ${cfg.textColor}`}>
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Title */}
      <h4 className="text-base text-[#2A1218] mb-1 leading-snug flex-1" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
        <em>{title}</em>
      </h4>

      {/* Expert */}
      <p className="text-[9px] tracking-[0.15em] text-[#6B6168] uppercase mb-3">
        {expert}
      </p>

      {/* Divider */}
      <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
        <button className="text-[10px] tracking-[0.15em] text-[#5C1A2E] hover:text-[#3D0F1F] font-medium uppercase transition-colors">
          {actionLabel} →
        </button>
        <button className="text-[10px] tracking-[0.15em] text-[#6B6168] hover:text-[#5C1A2E] font-medium uppercase transition-colors">
          PDF
        </button>
      </div>
    </div>
  );
}

export default function WorkbooksSection({ workbooks, phaseIndex }) {
  // Use provided workbooks or fallback
  const items = workbooks?.length > 0 ? workbooks : [
    { title: "Hormones & Stress Audit", expert: "Dr Shirley Du Plessis", status: "in_progress" },
    { title: "Nutrition & Energy Audit", expert: "Danielle Venter", status: "not_started" },
    { title: "Trauma & Regulation Reflection", expert: "Natacha Wauquiez", status: "completed" },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] tracking-[0.2em] text-[#C77B85] font-medium uppercase">
          YOUR WORKBOOKS · PHASE {String(phaseIndex || 1).padStart(2, "0")}
        </p>
        <button className="text-[10px] tracking-[0.15em] text-[#6B6168] hover:text-[#5C1A2E] font-medium uppercase transition-colors">
          ALL WORKBOOKS →
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map((wb, i) => (
          <WorkbookCard
            key={i}
            title={wb.title}
            expert={wb.expert}
            status={wb.status}
          />
        ))}
      </div>
    </div>
  );
}