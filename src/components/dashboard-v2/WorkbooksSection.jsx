import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import base44 from "@/api/base44";
import { FileText, Download, Loader2 } from "lucide-react";

// Danielle Venter's expert ID: routes to /NutritionWorkbook instead of /Workbook
const DANIELLE_EXPERT_ID = "69f48ab57e6d6614129172d8";

const STATUS_CONFIG = {
  completed: { label: "COMPLETED", dotColor: "bg-green-500", textColor: "text-green-700" },
  in_progress: { label: "IN PROGRESS", dotColor: "bg-[#C77B85]", textColor: "text-[#5C1A2E]" },
  not_started: { label: "NOT STARTED", dotColor: "bg-gray-300", textColor: "text-[#6B6168]" },
};

function getWorkbookUrl(wb) {
  if (wb.expert_id === DANIELLE_EXPERT_ID) {
    return `/NutritionWorkbook?id=${wb.id}`;
  }
  return `/Workbook?id=${wb.id}`;
}

function WorkbookCard({ workbook, expertName, status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.not_started;
  const actionLabel = status === "completed" ? "REVIEW" : status === "in_progress" ? "CONTINUE" : "BEGIN";
  const url = getWorkbookUrl(workbook);

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
        <em>{workbook.title}</em>
      </h4>

      {/* Expert */}
      <p className="text-[9px] tracking-[0.15em] text-[#6B6168] uppercase mb-3">
        {expertName}
      </p>

      {/* Divider */}
      <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
        <Link
          to={url}
          className="text-[10px] tracking-[0.15em] text-[#5C1A2E] hover:text-[#3D0F1F] font-medium uppercase transition-colors"
        >
          {actionLabel} →
        </Link>
        {workbook.blank_pdf_url ? (
          <a
            href={workbook.blank_pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] tracking-[0.15em] text-[#6B6168] hover:text-[#5C1A2E] font-medium uppercase transition-colors"
          >
            <Download className="w-3 h-3" />
            PDF
          </a>
        ) : (
          <span className="text-[10px] tracking-[0.15em] text-[#6B6168] font-medium uppercase opacity-40">
            PDF
          </span>
        )}
      </div>
    </div>
  );
}

export default function WorkbooksSection({ phaseIndex }) {
  // Fetch all published workbooks
  const { data: workbooks = [], isLoading: loadingWb } = useQuery({
    queryKey: ["dashboardWorkbooks"],
    queryFn: async () => {
      const items = await base44.entities.Workbook.filter({ status: "published" });
      return items || [];
    },
  });

  // Fetch experts for name lookup
  const { data: experts = [] } = useQuery({
    queryKey: ["dashboardExperts"],
    queryFn: async () => {
      const items = await base44.entities.Expert.list();
      return items || [];
    },
  });

  // Fetch user's WorkbookResponses for status
  const { data: responses = [] } = useQuery({
    queryKey: ["dashboardWbResponses"],
    queryFn: async () => {
      const items = await base44.entities.WorkbookResponse.filter({});
      return items || [];
    },
  });

  // Build lookup maps
  const expertMap = {};
  experts.forEach(e => { expertMap[e.id] = e; });

  const responseMap = {};
  responses.forEach(r => { responseMap[r.workbook_id] = r; });

  const getStatus = (wb) => {
    const resp = responseMap[wb.id];
    if (!resp) return "not_started";
    if (resp.is_complete) return "completed";
    return "in_progress";
  };

  // Sort by order field
  const sorted = [...workbooks].sort((a, b) => (a.order || 0) - (b.order || 0));

  if (loadingWb) {
    return (
      <div className="mb-6 flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-[#C77B85]" />
      </div>
    );
  }

  if (!sorted.length) return null;

  return (
    <div style={{ background: "white", border: "1px solid #f0f0f0", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}>
      <div className="flex items-center justify-between mb-4">
        <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B1B3D", fontFamily: "Montserrat, sans-serif" }}>
          <span style={{ display: "inline-block", width: "12px", height: "1px", background: "#6B1B3D", marginRight: "8px" }} />
          YOUR WORKBOOKS · PHASE {String(phaseIndex || 1).padStart(2, "0")}
        </p>
        <Link
          to="/Workbook"
          className="text-[10px] tracking-[0.15em] text-[#6B6168] hover:text-[#5C1A2E] font-medium uppercase transition-colors"
        >
          ALL WORKBOOKS →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {sorted.map(wb => (
          <WorkbookCard
            key={wb.id}
            workbook={wb}
            expertName={expertMap[wb.expert_id]?.name || "Expert"}
            status={getStatus(wb)}
          />
        ))}
      </div>
    </div>
  );
}