import React, { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IntakeModal({ isOpen, onClose, concerns, archetype, diagnosticSession }) {
  const tags = concerns?.length > 0 ? concerns : ["Burnout", "Hormone disruption", "Disconnection from purpose", "Career uncertainty"];
  const archetypeName = archetype || "The Reckoning Woman";
  const completionDate = diagnosticSession?.created_date
    ? new Date(diagnosticSession.created_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "your intake date";

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const qaItems = [
    { q: "How would you describe your energy most days?", a: diagnosticSession?.currentFeeling || "Wired but exhausted. I cannot switch off." },
    { q: "Where do you feel most disconnected?", a: diagnosticSession?.userContextText?.slice(0, 80) || "From my body. From what I actually want." },
    { q: "What is your relationship with your career?", a: "Successful on paper. Hollow underneath." },
    { q: "When did you last feel aligned?", a: "Honestly? Years ago." },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-awburg-dark/40" onClick={onClose} />

      <div className="relative bg-paper rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl z-10">
        <div className="sticky top-0 bg-paper border-b border-awburg-core/8 p-5 flex items-start justify-between z-10 rounded-t-2xl">
          <div>
            <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-1">
              YOUR ONBOARDING INTAKE
            </p>
            <p className="text-xs text-awburg-core/70">
              Saved {completionDate}. You can retake anytime.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-awrose-wash rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-awburg-core/60" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-3">
              YOUR CONCERNS
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="font-body text-xs text-awburg-core/80 border border-awburg-core/15 rounded-full px-3 py-1.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-3">
              YOUR ARCHETYPE
            </p>
            <p className="font-display text-awburg-core text-2xl">
              You are <span className="italic text-awrose-core">{archetypeName}</span>
            </p>
          </div>

          <div>
            <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-3">
              YOUR ANSWERS
            </p>
            <div className="space-y-4">
              {qaItems.map((item, i) => (
                <div key={i} className="border-l-2 border-awrose-core/40 pl-4">
                  <p className="font-body text-sm text-awburg-core/70 mb-1">{item.q}</p>
                  <p className="font-display italic text-awburg-core text-base">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-awrose-wash rounded-lg p-4">
            <p className="font-body font-light text-sm text-awburg-core/80 leading-relaxed">
              These answers are your north star. They are yours to revisit, edit, or retake.
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-paper border-t border-awburg-core/8 p-5 flex items-center justify-between rounded-b-2xl">
          <button className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core/60 hover:text-awburg-core uppercase transition-colors">
            Retake the quiz
          </button>
          <Button onClick={onClose} className="bg-awburg-core hover:bg-awburg-dark text-paper px-6">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}