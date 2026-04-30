import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "JUST NOW";
  if (diffMin < 60) return `${diffMin} MIN AGO`;
  if (diffHours < 24) {
    if (date.toDateString() === now.toDateString()) return "TODAY";
    return `${diffHours}H AGO`;
  }
  if (diffDays === 1) return "YESTERDAY";
  return `${diffDays}D AGO`;
}

export default function CommunityTile({ posts, hasNewActivity }) {
  // Build activity items from real posts or use defaults
  const activities = posts?.length > 0
    ? posts.slice(0, 3).map((p) => ({
        text: p.content?.replace(/<[^>]*>/g, "")?.slice(0, 60) || "New activity",
        space: "Community",
        time: formatRelativeTime(p.created_date),
      }))
    : [
        { text: '"New post" in Building Without Burnout', time: "12 MIN AGO" },
        { text: '"Your circle" has 5 new messages', time: "TODAY" },
        { text: '"Reply from Mimi" in Redefining Love & Boundaries', time: "2H AGO" },
      ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-[#C77B85] rounded-full" />
          <p className="text-[10px] tracking-[0.2em] text-[#C77B85] font-medium uppercase">
            COMMUNITY
          </p>
        </div>
        {hasNewActivity !== false && (
          <div className="w-2.5 h-2.5 rounded-full bg-[#C77B85]" />
        )}
      </div>

      {/* Activity list */}
      <div className="space-y-3.5 mb-4">
        {activities.map((item, i) => (
          <div key={i} className="flex items-start justify-between gap-3">
            <p className="text-sm text-[#2A1218] leading-snug flex-1">
              <span dangerouslySetInnerHTML={{
                __html: item.text.replace(
                  /"([^"]+)"/g,
                  '<em class="italic text-[#5C1A2E]">$1</em>'
                )
              }} />
            </p>
            <span className="text-[9px] tracking-[0.1em] text-[#6B6168] uppercase flex-shrink-0 mt-0.5">
              {item.time}
            </span>
          </div>
        ))}
      </div>

      {/* Footer link */}
      <Link
        to={createPageUrl("Community")}
        className="text-[10px] tracking-[0.15em] text-[#5C1A2E] hover:text-[#3D0F1F] font-medium uppercase transition-colors"
      >
        OPEN COMMUNITY →
      </Link>
    </div>
  );
}