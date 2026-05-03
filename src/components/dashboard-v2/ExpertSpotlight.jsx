import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ExpertSpotlight({ expert }) {
  const name = expert?.name || "Cato Vermeulen";
  const nameParts = name.split(" ");
  const initials = nameParts.map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
  const firstName = nameParts[0] || "";
  const specialty = expert?.title || "FEMININE BUSINESS";
  const bio = expert?.bio?.slice(0, 120) || "Feminine sales expert. Forbes featured. Teaches the Visibility & Money modules.";
  const quote = expert?.quote || "Selling, when it's done in alignment, is just an offering.";

  return (
    <div className="rounded-xl border border-awburg-core/8 overflow-hidden mb-4">
      <div className="relative bg-awrose-pale h-44 flex items-center justify-center">
        <span className="absolute top-3 left-4 font-body font-bold text-[9px] tracking-eyebrow text-awrose-core uppercase">
          EXPERT · THIS WEEK
        </span>
        <span className="absolute top-3 right-4 font-body font-bold text-[9px] tracking-eyebrow text-awrose-core uppercase">
          FORBES
        </span>
        {expert?.profile_picture ? (
          <img src={expert.profile_picture} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-display italic text-awrose-deep text-[80px] leading-none">
            {initials}
          </span>
        )}
      </div>

      <div className="bg-paper p-6">
        <h4 className="font-display text-awburg-core text-[22px] leading-tight mb-1">
          {firstName} <span className="italic text-awrose-core">{lastName}</span>
        </h4>
        <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-3">
          {specialty}
        </p>
        <blockquote className="font-display italic text-awburg-core text-base leading-snug mb-3">
          &ldquo;{quote}&rdquo;
        </blockquote>
        <p className="font-body font-light text-sm text-awburg-core/75 leading-relaxed mb-4">
          {bio}
        </p>
        <Link
          to={createPageUrl("ExpertsDirectory")}
          className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core hover:text-awburg-dark uppercase transition-colors inline-flex items-center gap-1"
        >
          VIEW PROFILE →
        </Link>
      </div>
    </div>
  );
}