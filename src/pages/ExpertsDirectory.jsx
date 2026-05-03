import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { createPageUrl } from "@/utils";

function getInitials(name) {
  if (!name) return "??";
  const parts = name.split(" ").filter(Boolean);
  return parts
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function ExpertCard({ expert, categoryName }) {
  const initials = getInitials(expert.name);
  const nameParts = expert.name ? expert.name.trim().split(" ") : [""];
  const firstName = nameParts.slice(0, -1).join(" ");
  const lastName = nameParts[nameParts.length - 1];

  return (
    <div className="bg-paper rounded-xl border border-awburg-core/8 overflow-hidden flex flex-col">
      {/* Portrait */}
      <div className="relative aspect-[3/4] bg-gradient-to-br from-awrose-pale to-awrose-wash flex items-center justify-center overflow-hidden">
        {expert.profile_picture ? (
          <img
            src={expert.profile_picture}
            alt={expert.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            <span className="font-display italic text-awburg-core select-none" style={{ fontSize: "clamp(48px, 8vw, 80px)" }}>
              {initials}
            </span>
            <span className="absolute bottom-3 left-4 font-body font-bold text-[9px] tracking-eyebrow text-awburg-core/40 uppercase">
              PORTRAIT . PLACEHOLDER
            </span>
          </>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        {categoryName && (
          <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-deep uppercase mb-2">
            {categoryName}
          </p>
        )}

        <h3 className="font-display text-awburg-core text-2xl leading-tight mb-1">
          {firstName && <span>{firstName} </span>}
          <span className="italic text-awrose-deep">{lastName}</span>
        </h3>

        {expert.title && (
          <p className="font-body text-sm text-awburg-core/70 mb-3">{expert.title}</p>
        )}

        {expert.bio && (
          <p className="font-body font-light text-sm text-awburg-core/65 leading-relaxed line-clamp-4 flex-1 mb-4">
            {expert.bio}
          </p>
        )}

        <Link
          to={`${createPageUrl("ExpertProfile")}?id=${expert.id}`}
          className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core hover:text-awburg-dark uppercase transition-colors inline-flex items-center gap-1"
        >
          VIEW PROFILE +
        </Link>
      </div>
    </div>
  );
}

export default function ExpertsDirectory() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: experts = [] } = useQuery({
    queryKey: ["experts-directory"],
    queryFn: () => base44.entities.Expert.filter({ isPublished: true }),
  });

  const { data: categoriesRaw = [] } = useQuery({
    queryKey: ["expert-categories"],
    queryFn: () => base44.entities.ExpertCategory.list(),
  });

  const categories = [...categoriesRaw].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const getCategoryName = (id) => categories.find((c) => c.id === id)?.name || "";

  const sortedExperts = [...experts].sort((a, b) => {
    const aCat = categories.find((c) => c.id === a.category);
    const bCat = categories.find((c) => c.id === b.category);
    return (aCat?.order ?? 9999) - (bCat?.order ?? 9999);
  });

  const filtered = sortedExperts.filter((e) => {
    const matchesSearch =
      !search ||
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.specialties?.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-off-white px-6 md:px-10 py-12">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-block w-6 h-px bg-awrose-core" />
            <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase">
              YOUR COUNCIL
            </p>
          </div>
          <h1 className="font-display italic text-awburg-core text-5xl md:text-6xl leading-tight mb-4">
            The women teaching you.
          </h1>
          <p className="font-body font-light text-awburg-core/70 text-base max-w-xl leading-relaxed">
            Fourteen specialists across hormones, nervous-system regulation, money, mindset and identity. Browse the full council, or filter by what you're working on.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-awburg-core/40" />
          <input
            type="text"
            placeholder="Search by name or specialism"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-paper border border-awburg-core/15 rounded-full pl-11 pr-5 py-3 text-sm font-body text-awburg-core placeholder-awburg-core/40 focus:outline-none focus:ring-2 focus:ring-awrose-light/60"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-full text-xs font-body font-bold tracking-eyebrow uppercase border transition-colors ${
              selectedCategory === "all"
                ? "bg-awburg-core text-paper border-awburg-core"
                : "bg-paper text-awburg-core/70 border-awburg-core/20 hover:border-awburg-core/50"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-body font-bold tracking-eyebrow uppercase border transition-colors ${
                selectedCategory === cat.id
                  ? "bg-awburg-core text-paper border-awburg-core"
                  : "bg-paper text-awburg-core/70 border-awburg-core/20 hover:border-awburg-core/50"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((expert) => (
              <ExpertCard
                key={expert.id}
                expert={expert}
                categoryName={getCategoryName(expert.category)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="font-body font-light text-awburg-core/50 text-sm">No experts found.</p>
          </div>
        )}

      </div>
    </div>
  );
}