import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Lock } from "lucide-react";
import ContinueHero from "@/components/dashboard-v2/ContinueHero";
import WorkbooksSection from "@/components/dashboard-v2/WorkbooksSection";
import AlivePhasePeek from "@/components/dashboard-v2/AlivePhasePeek";

const ARCHETYPES = [
  "The Performer",
  "The Over-Functioner",
  "The Outsourcer",
  "The Overrider",
  "The Reactor",
];

export default function StateANoQuiz({ user, profile }) {
  const completedCount = profile?.completed_modules_count ?? 0;

  return (
    <div className="space-y-6">
      <section className="bg-paper rounded-xl border border-awburg-core/8 p-6 md:p-8">
        <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-4">
          <span className="inline-block w-3 h-px bg-awrose-core mr-2 align-middle" />
          FIND YOUR PATTERN
        </p>
        <h2 className="font-display text-awburg-core text-[28px] md:text-[34px] leading-tight mb-4">
          The diagnostic is <span className="italic text-awrose-core">waiting</span> for you.
        </h2>
        <p className="font-body font-light text-awburg-core/75 text-sm md:text-base leading-relaxed mb-6 max-w-xl">
          Two minutes. Five questions. The result is a pattern you have probably already lived for years. Naming it is the first thing the work asks of you.
        </p>

        <ul className="space-y-2 mb-6 max-w-md">
          {ARCHETYPES.map((name) => (
            <li
              key={name}
              className="flex items-center justify-between bg-awrose-wash rounded-lg px-4 py-3"
            >
              <span className="font-display italic text-awburg-core text-base">{name}</span>
              <Lock className="w-3.5 h-3.5 text-awburg-core/40" />
            </li>
          ))}
        </ul>

        <Link
          to="/quiz"
          className="inline-flex items-center gap-2 bg-awrose-core hover:bg-awrose-deep hover:shadow-md text-paper text-xs font-bold tracking-eyebrow uppercase py-3 px-6 rounded-full transition-all duration-200"
        >
          TAKE THE QUIZ
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <ContinueHero
        module={null}
        expert={null}
        completedPages={completedCount}
        totalPages={9}
        eyebrowOverride={`CURRENT PHASE · ${(profile?.current_phase || "awareness").toUpperCase()}`}
        titleOverride="Continue your phase"
      />

      <AlivePhasePeek />

      <WorkbooksSection phaseIndex={1} />
    </div>
  );
}