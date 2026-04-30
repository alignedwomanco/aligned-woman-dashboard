import React from "react";
import { Link } from "react-router-dom";
import { Clock, Play, ArrowRight } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function ContinueHero({ module, expert, completedPages, totalPages, moduleIndex, totalModules, nextPageId }) {
  const completed = completedPages || 0;
  const total = totalPages || 0;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const hasDuration = module?.durationMinutes != null && module.durationMinutes > 0;
  const remainingMin = hasDuration ? Math.round(module.durationMinutes * (1 - progressPercent / 100)) : null;

  const playerUrl = module?.id
    ? `${createPageUrl("ModulePlayer")}?moduleId=${module.id}${nextPageId ? `&pageId=${nextPageId}` : ""}`
    : null;

  if (!module) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm mb-6">
      {/* Video Panel */}
      <div className="relative aspect-video bg-gradient-to-br from-[#3D0F1F] via-[#5C1A2E] to-[#3D0F1F] flex items-center justify-center">
        {/* Overlay text top-left */}
        <div className="absolute top-4 left-5">
          <p className="text-[10px] tracking-[0.2em] text-white/80 font-medium uppercase">
            MODULE {String(moduleIndex).padStart(2, "0")} OF {String(totalModules).padStart(2, "0")}
          </p>
        </div>
        {/* Overlay text top-right */}
        {remainingMin != null && (
          <div className="absolute top-4 right-5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-white/80" />
            <p className="text-[10px] tracking-[0.2em] text-white/80 font-medium uppercase">
              {remainingMin} MIN REMAINING
            </p>
          </div>
        )}
        {/* Play button */}
        <Link
          to={playerUrl || "#"}
          className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all"
        >
          <Play className="w-8 h-8 text-white ml-1" fill="white" />
        </Link>
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
      </div>

      {/* Bottom Info */}
      <div className="p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:gap-8">
          {/* Left half */}
          <div className="flex-1 mb-4 md:mb-0">
            <p className="text-[10px] tracking-[0.2em] text-[#C77B85] font-medium uppercase mb-2">
              CONTINUE WHERE YOU LEFT OFF
            </p>
            <h2 className="text-xl md:text-2xl text-[#2A1218] leading-snug mb-3" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              {module.title}
            </h2>
            {/* Expert byline — hidden when no expert */}
            {expert && (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#5C1A2E] flex items-center justify-center flex-shrink-0">
                  {expert.profile_picture ? (
                    <img src={expert.profile_picture} alt={expert.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-white text-xs font-medium">{expert.name?.[0]}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-[#2A1218] font-medium">{expert.name}</p>
                  {expert.title && (
                    <p className="text-[10px] tracking-[0.15em] text-[#6B6168] uppercase">{expert.title}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right half */}
          <div className="flex-1 md:max-w-[280px]">
            {/* Workbook progress strip */}
            {total > 0 && (
              <div className="bg-[#F5E6E8] rounded-lg p-3 mb-3">
                <p className="text-[10px] tracking-[0.15em] text-[#5C1A2E] font-medium uppercase mb-2">
                  WORKBOOK · PAGE {completed} OF {total} · {progressPercent}%
                </p>
                <div className="w-full h-1.5 bg-white/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#5C1A2E] rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Primary CTA */}
            <Link
              to={playerUrl || "#"}
              className="w-full flex items-center justify-center gap-2 bg-[#5C1A2E] hover:bg-[#3D0F1F] text-white text-sm font-medium py-3 px-6 rounded-lg transition-colors mb-2"
            >
              CONTINUE
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Secondary link */}
            <Link
              to={module.id ? `${createPageUrl("ModulePlayer")}?moduleId=${module.id}` : "#"}
              className="block text-center text-[10px] tracking-[0.15em] text-[#6B6168] hover:text-[#5C1A2E] font-medium uppercase transition-colors"
            >
              MODULE OVERVIEW →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}