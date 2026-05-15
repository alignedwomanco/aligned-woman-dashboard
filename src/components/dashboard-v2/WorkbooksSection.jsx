import React from "react";
import { ArrowDownToLine } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const BLUEPRINT_COURSE_ID = "69f4885c4fadbeea6d28a9be";

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

function WorkbookCard({ id, title, expert, status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.not_started;
  const actionLabel = status === "completed" ? "REVIEW" : status === "in_progress" ? "CONTINUE" : "BEGIN";

  const handleClick = () => {
    if (id) {
      window.location.href = `/Workbook?id=${id}`;
    }
  };

  return (
    <div className="bg-paper rounded-xl border border-awburg-core/8 p-5 flex flex-col h-full">
      <div className="mb-5">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 ${cfg.pillClass}`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dotClass}`} />
          <span className={`font-body font-bold text-[10px] tracking-eyebrow uppercase ${cfg.textClass}`}>
            {cfg.label}
          </span>
        </span>
      </div>

      <h4 className="font-display text-awburg-core text-xl leading-snug flex-1 mb-2">
        {title}
      </h4>

      <p className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core/55 uppercase mb-5">
        {expert}
      </p>

      <div className="border-t border-awburg-core/8 pt-4 flex items-center justify-between">
        <button
          onClick={handleClick}
          className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core hover:text-awburg-dark hover:underline uppercase transition-colors"
        >
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

export default function WorkbooksSection({ phaseIndex }) {
  // Fetch real workbooks for the Blueprint course
  const { data: workbooks = [] } = useQuery({
    queryKey: ["workbooks-section-list"],
    queryFn: async () => {
      const all = await base44.entities.Workbook.filter({ course_id: BLUEPRINT_COURSE_ID });
      return all.filter(wb => wb.status === "published");
    },
    initialData: [],
  });

  // Fetch user's workbook responses
  const { data: responses = [] } = useQuery({
    queryKey: ["workbooks-section-responses"],
    queryFn: () => base44.entities.WorkbookResponse.filter({}),
    initialData: [],
  });

  // Fetch experts for display names
  const { data: experts = [] } = useQuery({
    queryKey: ["workbooks-section-experts"],
    queryFn: () => base44.entities.Expert.filter({}),
    initialData: [],
  });

  // Build live workbook cards from database
  const liveCards = workbooks.map(wb => {
    const response = responses.find(r => r.workbook_id === wb.id);
    const expert = wb.expert_id ? experts.find(e => e.id === wb.expert_id) : null;

    let status = "not_started";
    if (response?.is_complete) {
      status = "completed";
    } else if (response) {
      const hasAnswers = response.answers && Object.keys(response.answers).length > 0;
      status = hasAnswers ? "in_progress" : "not_started";
    }

    return {
      id: wb.id,
      title: wb.title,
      expert: expert?.name || "",
      status,
    };
  });

  // Use live data if available, otherwise fall back to design placeholders
  const items = liveCards.length > 0 ? liveCards : [
    { id: null, title: "Hormones & Stress Audit", expert: "Dr Shirley Du Plessis", status: "not_started" },
    { id: null, title: "Nutrition, Energy & Metabolic Health", expert: "Danielle Venter", status: "not_started" },
    { id: null, title: "Women's Body Literacy", expert: "Dr Candice Morrison", status: "not_started" },
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
          <WorkbookCard key={wb.id || i} id={wb.id} title={wb.title} expert={wb.expert} status={wb.status} />
        ))}
      </div>
    </div>
  );
}