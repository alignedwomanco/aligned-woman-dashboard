import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const PLACEHOLDER_ITEMS = [
  { titleStart: "New post", titleAccent: "in Building Without Burnout", timestamp: "12 MIN AGO" },
  { titleStart: "Your circle", titleAccent: "has 5 new messages", timestamp: "TODAY" },
  { titleStart: "Reply from Mimi", titleAccent: "in Redefining Love & Boundaries", timestamp: "2H AGO" },
];

export default function CommunityCard() {
  return (
    <section className="bg-paper rounded-xl border border-awburg-core/8 p-6 mb-4">
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

      <Link
        to={createPageUrl("Community")}
        className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core hover:text-awburg-dark uppercase mt-5 inline-flex items-center gap-1 transition-colors"
      >
        OPEN COMMUNITY →
      </Link>
    </section>
  );
}