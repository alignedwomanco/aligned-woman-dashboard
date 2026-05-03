import React from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";

function getInitials(name) {
  if (!name) return "??";
  const parts = name.split(" ").filter(Boolean);
  return parts.map((p) => p[0]).join("").toUpperCase().slice(0, 2);
}

export default function ExpertProfile() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const expertId = params.get("id");

  const { data: experts = [], isLoading: loadingExperts } = useQuery({
    queryKey: ["experts-all"],
    queryFn: () => base44.entities.Expert.filter({ isPublished: true }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["expert-categories"],
    queryFn: () => base44.entities.ExpertCategory.list(),
  });

  // Try to fetch modules taught by this expert
  // TODO: most CourseModule.expertId fields are empty; populate them in /dashboardsettings to make this section reflect real teaching
  const { data: modules = [] } = useQuery({
    queryKey: ["expert-modules", expertId],
    queryFn: () => base44.entities.CourseModule.filter({ expertId }),
    enabled: !!expertId,
  });

  const expert = experts.find((e) => e.id === expertId) || null;
  const expertIndex = experts.findIndex((e) => e.id === expertId);
  const totalExperts = experts.length;

  const getCategoryName = (id) => categories.find((c) => c.id === id)?.name || "";

  if (loadingExperts) {
    return (
      <div className="min-h-screen bg-off-white px-6 md:px-10 py-12 animate-pulse">
        <div className="max-w-5xl mx-auto">
          <div className="h-4 w-40 bg-awburg-core/10 rounded mb-10" />
          <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-10">
            <div className="aspect-[3/4] bg-awrose-pale rounded-xl" />
            <div className="space-y-4">
              <div className="h-3 w-24 bg-awburg-core/10 rounded" />
              <div className="h-14 w-2/3 bg-awburg-core/10 rounded" />
              <div className="h-4 w-40 bg-awburg-core/10 rounded" />
              <div className="h-20 w-full bg-awrose-pale rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="text-center">
          <p className="font-body text-awburg-core/60 mb-4">Expert not found.</p>
          <Link to={createPageUrl("ExpertsDirectory")} className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core uppercase">
            BACK TO THE COUNCIL
          </Link>
        </div>
      </div>
    );
  }

  const initials = getInitials(expert.name);
  const nameParts = expert.name ? expert.name.trim().split(" ") : [""];
  const firstName = nameParts.slice(0, -1).join(" ");
  const lastName = nameParts[nameParts.length - 1];
  const categoryName = getCategoryName(expert.category);

  const bioParagraphs = (expert.bio || "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const hasModules = modules.length > 0;

  // Placeholder modules shown when no real CourseModule.expertId is linked
  const placeholderModules = [
    { title: "Reading Your Cycle", phase: "AWARENESS", duration: "32 min" },
    { title: "Hormones in Your 30s and 40s", phase: "LIBERATION", duration: "48 min" },
    { title: "The Perimenopause Conversation", phase: "LIBERATION", duration: "56 min" },
  ];

  const displayModules = hasModules
    ? modules.map((m) => ({ title: m.title, phase: m.phase?.toUpperCase() || "AWARENESS", duration: m.durationMinutes ? `${m.durationMinutes} min` : "" }))
    : placeholderModules;

  return (
    <div className="min-h-screen bg-off-white">
      <div className="px-6 md:px-10 py-10 max-w-5xl mx-auto">

        {/* Back link */}
        <Link
          to={createPageUrl("ExpertsDirectory")}
          className="inline-flex items-center gap-2 font-body font-bold text-[10px] tracking-eyebrow text-awburg-core/60 hover:text-awburg-core uppercase transition-colors mb-10"
        >
          + BACK TO THE COUNCIL
        </Link>

        {/* Top two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-10 mb-12">

          {/* Left - Portrait */}
          <div className="relative aspect-[3/4] bg-gradient-to-br from-awrose-pale to-awrose-wash rounded-xl overflow-hidden flex items-center justify-center">
            {expert.profile_picture ? (
              <img
                src={expert.profile_picture}
                alt={expert.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <span className="font-display italic text-awburg-core text-7xl select-none">
                  {initials}
                </span>
                <span className="absolute bottom-4 left-5 font-body font-bold text-[9px] tracking-eyebrow text-awburg-core/40 uppercase">
                  PORTRAIT . PLACEHOLDER
                </span>
              </>
            )}
          </div>

          {/* Right - Info */}
          <div className="flex flex-col justify-start pt-2">
            {categoryName && (
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-block w-4 h-px bg-awrose-core" />
                <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase">
                  {categoryName}
                </p>
              </div>
            )}

            <h1 className="font-display text-awburg-core text-5xl leading-tight mb-2">
              {firstName && <span>{firstName}<br /></span>}
              <span className="italic text-awrose-deep">{lastName}</span>
            </h1>

            {expert.title && (
              <p className="font-body text-sm text-awburg-core/70 mb-5">{expert.title}</p>
            )}

            {/* Quote placeholder */}
            {/* TODO: add a "quote" field to the Expert schema so each expert has a signature quote; for now showing a placeholder */}
            <div className="bg-awrose-pale rounded-xl px-6 py-5 mb-6">
              <p className="font-display italic text-awburg-core text-lg leading-snug">
                "I want women to leave my consulting room knowing more about their own body than when they came in. That's the whole job."
              </p>
            </div>

            {/* CTAs */}
            {/* TODO: wire booking and messaging when CourseEnrollment / DirectMessage flows exist */}
            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 bg-awrose-core text-paper text-xs font-body font-bold tracking-eyebrow uppercase py-3 px-6 rounded-full transition-colors hover:bg-awrose-deep">
                BOOK A SESSION
              </button>
              <button className="inline-flex items-center gap-2 bg-paper text-awburg-core border border-awburg-core text-xs font-body font-bold tracking-eyebrow uppercase py-3 px-6 rounded-full transition-colors hover:bg-awrose-wash">
                SEND A MESSAGE
              </button>
            </div>
          </div>
        </div>

        {/* Bottom two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-10">

          {/* Left - Bio, specialisms, modules */}
          <div>
            {/* About */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block w-4 h-px bg-awrose-core" />
                <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase">
                  ABOUT
                </p>
              </div>
              <div className="space-y-4">
                {bioParagraphs.length > 0
                  ? bioParagraphs.map((para, i) => (
                      <p key={i} className="font-body font-light text-sm text-awburg-core/80 leading-relaxed">
                        {para}
                      </p>
                    ))
                  : (
                    <p className="font-body font-light text-sm text-awburg-core/80 leading-relaxed">
                      {expert.bio}
                    </p>
                  )}
              </div>
            </div>

            {/* Specialisms */}
            {expert.specialties?.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-block w-4 h-px bg-awrose-core" />
                  <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase">
                    SPECIALISMS
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {expert.specialties.map((s, i) => (
                    <span
                      key={i}
                      className="font-body font-bold text-[10px] tracking-eyebrow uppercase text-awburg-core border border-awburg-core/20 rounded-full px-4 py-2"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Modules She Teaches */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-5">
                <span className="inline-block w-4 h-px bg-awrose-core" />
                <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase">
                  MODULES SHE TEACHES
                </p>
              </div>
              <div className="divide-y divide-awburg-core/8">
                {displayModules.map((m, i) => (
                  <div key={i} className="flex items-center justify-between py-4 gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="font-body font-bold text-[9px] tracking-eyebrow text-awrose-deep uppercase whitespace-nowrap flex-shrink-0 w-20">
                        {m.phase}
                      </span>
                      <p className="font-display italic text-awburg-core text-lg leading-tight truncate">
                        {m.title}
                      </p>
                    </div>
                    {m.duration && (
                      <span className="font-body text-xs text-awburg-core/50 flex-shrink-0">{m.duration}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Credentials + Contact Details */}
          <div>
            {/* Credentials */}
            {/* TODO: add a credentials field to Expert schema or store structured credentials in the services array */}
            <div className="bg-paper border border-awburg-core/8 rounded-xl p-6 mb-4">
              <div className="flex items-center gap-3 mb-5">
                <span className="inline-block w-4 h-px bg-awrose-core" />
                <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase">
                  CREDENTIALS
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="font-body font-bold text-sm text-awburg-core">MBBS, MRCOG - 2008</p>
                  <p className="font-body font-light text-xs text-awburg-core/60">Royal College of Obstetricians and Gynaecologists</p>
                </div>
                <div>
                  <p className="font-body font-bold text-sm text-awburg-core">PGDip Reproductive Medicine - 2014</p>
                  <p className="font-body font-light text-xs text-awburg-core/60">University of Edinburgh</p>
                </div>
                <div>
                  <p className="font-body font-bold text-sm text-awburg-core">Practicing clinician</p>
                  <p className="font-body font-light text-xs text-awburg-core/60">London - 15 years private and NHS</p>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            {/* TODO: replace placeholder with real contact details once added to Expert schema */}
            <div className="bg-paper border border-awburg-core/8 rounded-xl p-6 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block w-4 h-px bg-awrose-core" />
                <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase">
                  CONTACT DETAILS
                </p>
              </div>
              <p className="font-body font-light text-sm text-awburg-core/60">
                Contact details coming soon.
              </p>
            </div>
          </div>
        </div>

        {/* Footer label */}
        <div className="border-t border-awburg-core/10 mt-10 pt-6 text-center">
          <p className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core/40 uppercase">
            VIEWING {expert.name?.toUpperCase()} . {expertIndex + 1} OF {totalExperts} EXPERTS
          </p>
        </div>

      </div>
    </div>
  );
}