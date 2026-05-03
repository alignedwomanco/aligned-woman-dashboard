import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

const ROTATION_INTERVAL_MS = 5 * 60 * 1000;

function buildDisplayExpert(rawExpert) {
  if (!rawExpert) return null;
  const name = rawExpert.name || "";
  const nameParts = name.split(" ").filter(Boolean);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
  const initials = nameParts
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return {
    id: rawExpert.id,
    name,
    firstName,
    lastName,
    initials,
    title: rawExpert.title || "",
    bio: rawExpert.bio?.slice(0, 120) || "",
    profilePicture: rawExpert.profile_picture || null,
  };
}

const PLACEHOLDER = {
  id: "placeholder",
  name: "Cato Vermeulen",
  firstName: "Cato",
  lastName: "Vermeulen",
  initials: "CV",
  title: "FEMININE BUSINESS",
  bio: "Feminine sales expert. Forbes featured. Teaches the Visibility & Money modules.",
  profilePicture: null,
};

export default function ExpertSpotlight() {
  const [experts, setExperts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    base44.entities.Expert
      .filter({ isPublished: true }, "created_date")
      .then((results) => {
        if (cancelled) return;
        const built = (results || []).map(buildDisplayExpert).filter(Boolean);
        setExperts(built);
        setIsLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[ExpertSpotlight] Failed to load experts:", err);
        setExperts([]);
        setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (experts.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % experts.length);
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [experts.length]);

  const expert = experts.length > 0 ? experts[currentIndex] : PLACEHOLDER;

  if (isLoading) {
    return (
      <div className="rounded-xl border border-awburg-core/8 overflow-hidden mb-4 animate-pulse">
        <div className="bg-awrose-pale h-44" />
        <div className="bg-paper p-6 space-y-3">
          <div className="h-5 w-2/3 bg-awburg-core/10 rounded" />
          <div className="h-3 w-1/2 bg-awburg-core/10 rounded" />
          <div className="h-3 w-full bg-awburg-core/10 rounded" />
          <div className="h-3 w-3/4 bg-awburg-core/10 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-awburg-core/8 overflow-hidden mb-4">
      <div className="relative bg-awrose-pale h-44 flex items-center justify-center">
        <span className="absolute top-3 left-4 font-body font-bold text-[9px] tracking-eyebrow text-awrose-core uppercase">
          EXPERT SPOTLIGHT
        </span>
        {expert.profilePicture ? (
          <img src={expert.profilePicture} alt={expert.name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-display italic text-awrose-deep text-[80px] leading-none">
            {expert.initials}
          </span>
        )}
      </div>

      <div className="bg-paper p-6">
        <h4 className="font-display text-awburg-core text-[22px] leading-tight mb-1">
          {expert.firstName} <span className="italic text-awrose-core">{expert.lastName}</span>
        </h4>
        <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-3">
          {expert.title}
        </p>
        <p className="font-body font-light text-sm text-awburg-core/75 leading-relaxed mb-4">
          {expert.bio}
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