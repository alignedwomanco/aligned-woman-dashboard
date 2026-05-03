import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { createPageUrl } from "@/utils";
import ContinueHero from "@/components/dashboard-v2/ContinueHero";
import WorkbooksSection from "@/components/dashboard-v2/WorkbooksSection";
import AlivePhasePeek from "@/components/dashboard-v2/AlivePhasePeek";

export default function StateB({ user, profile }) {
  return (
    <div className="space-y-6">
      <section className="bg-awrose-pale rounded-xl p-8 md:p-10">
        <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-deep uppercase mb-4">
          <span className="inline-block w-3 h-px bg-awrose-deep mr-2 align-middle" />
          WELCOME TO THE BLUEPRINT
        </p>
        <h2 className="font-display text-awburg-core text-[34px] md:text-[44px] leading-tight mb-6">
          Five phases.<br />
          Fourteen practitioners.<br />
          <span className="italic text-awrose-core">Your</span> pace.
        </h2>
        <p className="font-body font-light text-awburg-core/80 text-base leading-relaxed max-w-xl mb-8">
          The Blueprint is not a course you finish. It is a practice you return to. Each phase opens when the one before it has settled. You set the pace.
        </p>
        <Link
          to={createPageUrl("Classroom")}
          className="inline-flex items-center gap-2 bg-awburg-core hover:bg-awburg-dark text-paper text-xs font-bold tracking-eyebrow uppercase py-4 px-8 rounded-full transition-colors"
        >
          BEGIN PHASE 1: AWARENESS
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <ContinueHero
        module={null}
        expert={null}
        completedPages={0}
        totalPages={9}
        eyebrowOverride="PHASE 01 OF 05 · AWARENESS"
        titleOverride="Begin Awareness"
      />

      <AlivePhasePeek />

      <WorkbooksSection
        workbooks={[
          { title: "Hormones & Stress Audit", expert: "Dr Shirley Du Plessis", status: "not_started" },
          { title: "Nutrition, Energy & Metabolic Health", expert: "Danielle Venter", status: "not_started" },
          { title: "Women's Body Literacy", expert: "Dr Candice Morrison", status: "not_started" },
        ]}
        phaseIndex={1}
      />

      <section className="bg-paper rounded-xl border border-awburg-core/8 p-6 md:p-8">
        <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-3">
          OPTIONAL · TWO MINUTES
        </p>
        <h3 className="font-display text-awburg-core text-[26px] md:text-[30px] leading-tight mb-3">
          Find your <span className="italic text-awrose-core">pattern</span>.
        </h3>
        <p className="font-body font-light text-awburg-core/75 text-sm leading-relaxed mb-5 max-w-lg">
          A short diagnostic. It will not change what you have access to. It will sharpen what you notice in the work.
        </p>
        <Link
          to="/quiz"
          className="font-body font-bold text-[11px] tracking-eyebrow text-awburg-core hover:text-awburg-dark uppercase inline-flex items-center gap-2 transition-colors"
        >
          TAKE THE QUIZ
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </section>
    </div>
  );
}