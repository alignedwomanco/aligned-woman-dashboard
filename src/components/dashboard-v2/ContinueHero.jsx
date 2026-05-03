import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function ContinueHero({ module, expert, completedPages, totalPages, moduleIndex, totalModules, nextPageId, eyebrowOverride, titleOverride }) {
  const completed = completedPages || 0;
  const total = totalPages || 0;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const playerUrl = module?.id
    ? `${createPageUrl("ModulePlayer")}?moduleId=${module.id}${nextPageId ? `&pageId=${nextPageId}` : ""}`
    : "#";

  const eyebrow = eyebrowOverride || (moduleIndex && totalModules
    ? `MODULE ${String(moduleIndex).padStart(2, "0")} OF ${String(totalModules).padStart(2, "0")}`
    : "CONTINUE WHERE YOU LEFT OFF");

  const title = titleOverride || module?.title || "Begin your first module";

  return (
    <div className="bg-paper rounded-xl border border-awburg-core/8 p-6 md:p-8 mb-6">
      <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-4">
        <span className="inline-block w-3 h-px bg-awrose-core mr-2 align-middle" />
        {eyebrow}
      </p>

      <div className="flex flex-col md:flex-row gap-6 md:items-end md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-awburg-core text-[26px] md:text-[30px] leading-tight mb-3">
            {title}
          </h2>

          {expert && (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-awburg-core flex items-center justify-center overflow-hidden flex-shrink-0">
                {expert.profile_picture ? (
                  <img src={expert.profile_picture} alt={expert.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-paper text-xs font-medium">{expert.name?.[0]}</span>
                )}
              </div>
              <p className="font-body text-sm text-awburg-core/80">{expert.name}</p>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 md:max-w-[280px] w-full md:w-auto">
          {total > 0 && (
            <div className="bg-awrose-pale rounded-lg p-3 mb-3">
              <p className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core uppercase mb-2">
                WORKBOOK · PAGE {completed} OF {total} · {progressPercent}%
              </p>
              <div className="w-full h-1.5 bg-paper/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-awburg-core rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          <Link
            to={playerUrl}
            className="w-full flex items-center justify-center gap-2 bg-awburg-core hover:bg-awburg-dark text-paper text-xs font-bold tracking-eyebrow uppercase py-3 px-6 rounded-full transition-colors"
          >
            CONTINUE
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to={module?.id ? `${createPageUrl("ModulePlayer")}?moduleId=${module.id}` : "#"}
            className="block text-center font-body font-bold text-[10px] tracking-eyebrow text-awburg-core/60 hover:text-awburg-core uppercase mt-2 transition-colors"
          >
            MODULE OVERVIEW →
          </Link>
        </div>
      </div>
    </div>
  );
}