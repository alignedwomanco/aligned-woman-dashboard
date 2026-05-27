import React from "react";
import { createPageUrl } from "@/utils";

const PLACEHOLDER_ITEMS = [
  { titleStart: "New post", titleAccent: "in Building Without Burnout", timestamp: "12 MIN AGO" },
  { titleStart: "Your circle", titleAccent: "has 5 new messages", timestamp: "TODAY" },
  { titleStart: "Reply from Mimi", titleAccent: "in Redefining Love & Boundaries", timestamp: "2H AGO" },
];

export default function CommunityCard() {
  return (
    <section className="relative bg-paper rounded-xl border border-awburg-core/8 p-6 mb-4 overflow-hidden">
      {/* Greyed out overlay */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-xl">
        <span className="font-body font-bold text-[11px] tracking-eyebrow text-awburg-core/50 uppercase">Coming Soon</span>
      </div>

      <div className="opacity-40 pointer-events-none">
        <div className="flex items-center justify-between mb-5">
          <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase flex items-center">
            <span className="inline-block w-3 h-px bg-awrose-core mr-2 align-middle" />
            COMMUNITY
          </p>
          <span aria-label="New activity" className="w-2 h-2 rounded-full bg-awrose-deep" />
        </div>

        <ul className="flex flex-col gap-4">
          {PLACEHOLDER_ITEMS.map((item, i) => (
            <li key={i} className="border-b border-awburg-core/8 pb-4 last:border-0 last:pb-0">
              <p className="font-body font-light text-sm text-awburg-core leading-snug">
                <span className="font-display italic">{item.titleStart}</span>{" "}
                {item.titleAccent}
              </p>
              <p className="font-body font-bold text-[9px] tracking-eyebrow text-awburg-core/55 uppercase mt-1">
                {item.timestamp}
              </p>
            </li>
          ))}
        </ul>

        <span className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core uppercase mt-5 inline-flex items-center gap-1">
          OPEN COMMUNITY →
        </span>
      </div>
    </section>
  );
}