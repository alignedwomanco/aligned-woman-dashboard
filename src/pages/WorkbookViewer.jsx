import React, { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Download, Lock, Loader2 } from "lucide-react";
import useWorkbookUnlock from "@/hooks/useWorkbookUnlock";
import WorkbookSectionContent from "@/components/workbook/WorkbookSectionContent";

export default function WorkbookViewer() {
  const params = new URLSearchParams(window.location.search);
  const workbookId = params.get("id");

  const [activeSection, setActiveSection] = useState(0);

  // Fetch workbook
  const { data: workbook, isLoading } = useQuery({
    queryKey: ["workbook", workbookId],
    queryFn: async () => {
      const items = await base44.entities.Workbook.filter({ id: workbookId });
      return items[0] || null;
    },
    enabled: !!workbookId,
  });

  // Fetch expert
  const { data: expert } = useQuery({
    queryKey: ["workbookExpert", workbook?.expert_id],
    queryFn: async () => {
      const items = await base44.entities.Expert.filter({ id: workbook.expert_id });
      return items[0] || null;
    },
    enabled: !!workbook?.expert_id,
  });

  // Admin bypass for lock check
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    base44.auth.me().then(u => {
      if (u?.role === "admin" || u?.role === "owner" || u?.role === "master_admin") setIsAdmin(true);
    }).catch(() => {});
  }, []);

  // Unlock check (skipped for admins)
  const { isUnlocked: rawUnlocked, isLoading: isCheckingUnlock } = useWorkbookUnlock(workbook);
  const isUnlocked = isAdmin || rawUnlocked;

  // Parse sections from schema
  const sections = useMemo(() => {
    if (!workbook?.schema?.sections) return [];
    return workbook.schema.sections;
  }, [workbook]);

  const current = sections[activeSection] || null;
  const isFirst = activeSection === 0;
  const isLast = activeSection === sections.length - 1;

  // Loading state
  if (isLoading || isCheckingUnlock) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#6E1D40]" />
      </div>
    );
  }

  // No workbook found
  if (!workbook) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
        <p>Workbook not found.</p>
      </div>
    );
  }

  // Locked state
  if (!isUnlocked) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <Lock className="w-12 h-12 mx-auto text-[#C4847A] mb-4" />
        <h2 className="text-2xl font-bold text-[#4A0E2E] mb-2">Workbook Locked</h2>
        <p className="text-gray-500">
          Complete all modules for this course to unlock this workbook.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#C4847A] mb-1">
          Workbook
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#4A0E2E]">
          {workbook.title}
        </h1>
        {workbook.subtitle && (
          <p className="text-gray-500 mt-1">{workbook.subtitle}</p>
        )}
        {expert && (
          <div className="flex items-center gap-2 mt-3">
            {expert.profile_picture && (
              <img src={expert.profile_picture} alt={expert.name} className="w-7 h-7 rounded-full object-cover" />
            )}
            <span className="text-sm font-medium text-gray-600">
              {expert.name}{expert.title ? ` · ${expert.title}` : ""}
            </span>
          </div>
        )}
        {workbook.blank_pdf_url && (
          <a href={workbook.blank_pdf_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg border border-[#4A0E2E] text-[#4A0E2E] text-sm font-medium hover:bg-[#F5E8EE] transition-colors">
            <Download className="w-4 h-4" /> Download Blank PDF
          </a>
        )}
      </div>

      {/* Mobile section tabs */}
      <div className="lg:hidden overflow-x-auto scrollbar-hide pb-4">
        <div className="flex gap-2">
          {sections.map((section, idx) => {
            const isActive = idx === activeSection;
            const label = section.section_number
              ? `${section.section_number}. ${section.title}`
              : section.title;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(idx)}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border whitespace-nowrap ${
                  isActive
                    ? "bg-[#4A0E2E] text-white border-transparent"
                    : "bg-white text-[#6B6168] border-gray-200 hover:border-[#C4847A]"
                }`}
              >
                <span className={`w-2 h-2 rounded-full border-2 flex-shrink-0 ${isActive ? "border-white" : "border-gray-300"}`} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar nav */}
        <div className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-24 space-y-1 max-h-[calc(100vh-120px)] overflow-y-auto pr-2 pb-8">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3 px-3">
              Sections
            </p>
            {sections.map((section, idx) => {
              const isActive = idx === activeSection;
              const num = section.section_number || "";
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(idx)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-3 ${
                    isActive
                      ? "bg-[#F5E8EE] text-[#4A0E2E]"
                      : "text-[#6B6168] hover:bg-gray-50 hover:text-[#4A0E2E]"
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full border-2 flex-shrink-0 ${isActive ? "border-[#C4847A] bg-[#C4847A]" : "border-gray-300"}`} />
                  <div className="min-w-0 flex-1">
                    {num && (
                      <span className="text-[10px] font-semibold uppercase tracking-widest block" style={{ color: isActive ? "#C4847A" : "#999" }}>
                        Section {num}
                      </span>
                    )}
                    <span className={`text-sm block truncate ${isActive ? "font-semibold" : "font-medium"}`}>
                      {section.title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {current && <WorkbookSectionContent section={current} />}

          {/* Bottom navigation */}
          <div className="flex items-center justify-between mt-12 pt-6 border-t border-gray-200">
            {!isFirst ? (
              <Button
                variant="outline"
                onClick={() => setActiveSection((p) => p - 1)}
                className="border-[#4A0E2E] text-[#4A0E2E] hover:bg-[#F5E8EE]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Previous
              </Button>
            ) : (
              <div />
            )}
            {!isLast ? (
              <Button
                variant="outline"
                onClick={() => setActiveSection((p) => p + 1)}
                className="border-[#4A0E2E] text-[#4A0E2E] hover:bg-[#F5E8EE]"
              >
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}