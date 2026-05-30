import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Download, Loader2 } from "lucide-react";

// Danielle Venter's expert ID: routes to /NutritionWorkbook instead of /Workbook
const DANIELLE_EXPERT_ID = "69f48ab57e6d6614129172d8";

const STATUS_CONFIG = {
  completed: { label: "COMPLETED", dotColor: "bg-green-500", textColor: "text-green-700" },
  in_progress: { label: "IN PROGRESS", dotColor: "bg-[#C77B85]", textColor: "text-[#5C1A2E]" },
  not_started: { label: "NOT STARTED", dotColor: "bg-gray-300", textColor: "text-[#6B6168]" },
};

// Queue order: in_progress first (resume), then not_started, completed last.
const STATUS_RANK = { in_progress: 0, not_started: 1, completed: 2 };

const FILTER_DEFS = [
  { id: "default", label: "Recent" },
  { id: "all", label: "All" },
  { id: "in_progress", label: "In Progress" },
  { id: "completed", label: "Completed" },
];

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

  const hasCover = !!workbook.cover_image_url;

  return (
    <div
      className="relative rounded-2xl overflow-hidden flex flex-col"
      style={{
        aspectRatio: "3/4",
        background: hasCover ? "transparent" : "linear-gradient(160deg, #5C1433 0%, #3A0B20 100%)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
      }}
    >
      {/* Background cover image */}
      {hasCover && (
        <img
          src={workbook.cover_image_url}
          alt={workbook.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Gradient overlay for readability */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(30,4,16,0.55) 55%, rgba(30,4,16,0.92) 100%)",
        }}
      />

      {/* Status badge top right */}
      <div className="relative z-10 flex justify-end p-4">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: "rgba(60,10,30,0.65)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
          <span className="text-[9px] tracking-[0.18em] font-bold uppercase text-white/90">
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom content */}
      <div className="relative z-10 px-5 pb-5">
        {/* Title */}
        <h4
          className="text-white leading-snug mb-1"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "1.25rem", fontStyle: "italic", fontWeight: 700 }}
        >
          {workbook.title}
        </h4>

        {/* Expert */}
        <p className="text-white/55 mb-4" style={{ fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "Montserrat, sans-serif", fontWeight: 600 }}>
          {expertName}
        </p>

        {/* Divider */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.15)", marginBottom: "14px" }} />

        {/* Actions row */}
        <div className="flex items-center justify-between">
          <Link
            to={url}
            className="text-white/90 hover:text-white transition-colors font-bold uppercase"
            style={{ fontSize: "9px", letterSpacing: "0.22em", fontFamily: "Montserrat, sans-serif" }}
          >
            {actionLabel} →
          </Link>
          {workbook.blank_pdf_url && (
            <a
              href={workbook.blank_pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/55 hover:text-white/90 transition-colors font-bold uppercase"
              style={{ fontSize: "9px", letterSpacing: "0.22em", fontFamily: "Montserrat, sans-serif" }}
            >
              DOWNLOAD
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterChip({ filter, active, onSelect }) {
  const disabled = filter.count === 0;
  return (
    <button
      type="button"
      onClick={() => { if (!disabled) onSelect(filter.id); }}
      disabled={disabled}
      aria-pressed={active}
      className="shrink-0 rounded-full transition-colors"
      style={{
        fontFamily: "Montserrat, sans-serif",
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        padding: "9px 14px",
        minHeight: "38px",
        border: "1px solid",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        background: active ? "#6B1B3D" : "transparent",
        color: active ? "#FFFFFF" : "#6B6168",
        borderColor: active ? "#6B1B3D" : "#f0f0f0",
      }}
    >
      {filter.label} <span style={{ opacity: 0.6, marginLeft: "2px" }}>{filter.count}</span>
    </button>
  );
}

export default function WorkbooksSection({ phaseIndex }) {
  const [activeFilter, setActiveFilter] = useState("default");
  // "default" = snap rail of first 3; "all" = full grid; others = filtered snap rail

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

  // Base list, ordered by the workbook's own order field (within-band tiebreak)
  const ordered = [...workbooks].sort((a, b) => (a.order || 0) - (b.order || 0));

  // Attach derived status and response once
  const enriched = ordered.map(wb => ({ wb, status: getStatus(wb), resp: responseMap[wb.id] }));

  // Counts for the chips (live)
  const counts = {
    default: Math.min(enriched.length, 3),
    all: enriched.length,
    in_progress: enriched.filter(e => e.status === "in_progress").length,
    completed: enriched.filter(e => e.status === "completed").length,
  };
  const filters = FILTER_DEFS.map(f => ({ ...f, count: counts[f.id] }));

  // Build the visible, sorted slice for the active filter
  const queueSorted = [...enriched].sort((a, b) => {
    const ra = STATUS_RANK[a.status] ?? 9;
    const rb = STATUS_RANK[b.status] ?? 9;
    if (ra !== rb) return ra - rb;
    return (a.wb.order || 0) - (b.wb.order || 0);
  });

  let visible;
  if (activeFilter === "in_progress") {
    visible = enriched.filter(e => e.status === "in_progress");
  } else if (activeFilter === "completed") {
    visible = enriched
      .filter(e => e.status === "completed")
      .sort((a, b) => {
        const at = a.resp?.completed_at ? new Date(a.resp.completed_at).getTime() : 0;
        const bt = b.resp?.completed_at ? new Date(b.resp.completed_at).getTime() : 0;
        return bt - at;
      });
  } else if (activeFilter === "default") {
    visible = queueSorted.slice(0, 3);
  } else {
    // "all": full queue
    visible = queueSorted;
  }



  if (loadingWb) {
    return (
      <div className="mb-6 flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-[#C77B85]" />
      </div>
    );
  }

  if (!enriched.length) return null;

  return (
    <div style={{ background: "white", border: "1px solid #f0f0f0", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}>
      {/* Header row: kicker */}
      <div className="flex items-center mb-4">
        <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B1B3D", fontFamily: "Montserrat, sans-serif" }}>
          <span style={{ display: "inline-block", width: "12px", height: "1px", background: "#6B1B3D", marginRight: "8px" }} />
          YOUR INTEGRATION PRACTICES · PHASE {String(phaseIndex || 1).padStart(2, "0")}
        </p>
      </div>

      {/* Filter chips: scrollable on narrow screens */}
      <div
        className="flex items-center gap-2 mb-5 overflow-x-auto"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {filters.map(f => (
          <FilterChip
            key={f.id}
            filter={f}
            active={activeFilter === f.id}
            onSelect={setActiveFilter}
          />
        ))}
      </div>

      {/* Grid for "all" filter (full grid), snap rail for everything else */}
      {visible.length > 0 ? (
        activeFilter === "all" ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {visible.map(({ wb, status }) => (
              <WorkbookCard
                key={wb.id}
                workbook={wb}
                expertName={expertMap[wb.expert_id]?.name || "Expert"}
                status={status}
              />
            ))}
          </div>
        ) : (
          <div
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1"
            style={{ scrollbarWidth: "thin", WebkitOverflowScrolling: "touch" }}
          >
            {visible.map(({ wb, status }) => (
              <div
                key={wb.id}
                className="snap-start shrink-0 w-[78%] sm:w-[calc((100%-2rem)/3)]"
              >
                <WorkbookCard
                  workbook={wb}
                  expertName={expertMap[wb.expert_id]?.name || "Expert"}
                  status={status}
                />
              </div>
            ))}
          </div>
        )
      ) : (
        <p style={{ fontSize: "12px", color: "#6B6168", fontFamily: "Montserrat, sans-serif", padding: "8px 0" }}>
          Nothing here yet.
        </p>
      )}
    </div>
  );
}