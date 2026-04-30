import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ExpertSpotlight({ expert }) {
  const name = expert?.name || "Cato Vermeulen";
  const nameParts = name.split(" ");
  const initials = nameParts.map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
  const firstName = nameParts[0] || "";
  const specialty = expert?.title || "FEMININE BUSINESS";
  const bio = expert?.bio?.slice(0, 120) || "Feminine sales expert. Forbes featured. Teaches the Visibility & Money modules.";

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm mb-4">
      {/* Top dark panel */}
      <div className="relative bg-gradient-to-br from-[#3D0F1F] to-[#5C1A2E] h-48 flex items-center justify-center">
        {expert?.profile_picture ? (
          <img src={expert.profile_picture} alt={name} className="w-full h-full object-cover opacity-60" />
        ) : (
          <span className="text-6xl text-white/20 italic" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            {initials}
          </span>
        )}
        {/* Bottom overlay labels */}
        <div className="absolute bottom-3 left-4">
          <p className="text-[9px] tracking-[0.2em] text-white/50 uppercase">EXPERT · THIS WEEK</p>
        </div>
      </div>

      {/* Bottom white section */}
      <div className="p-5">
        <h4 className="text-lg text-[#2A1218] mb-0.5" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
          {firstName} <em>{lastName}</em>
        </h4>
        <p className="text-[9px] tracking-[0.2em] text-[#6B6168] uppercase mb-3">{specialty}</p>
        <p className="text-sm text-[#6B6168] leading-relaxed mb-3">{bio}</p>
        <Link
          to={createPageUrl("ExpertsDirectory")}
          className="text-[10px] tracking-[0.15em] text-[#5C1A2E] hover:text-[#3D0F1F] font-medium uppercase transition-colors"
        >
          VIEW PROFILE →
        </Link>
      </div>
    </div>
  );
}