import React, { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IntakeModal({ isOpen, onClose, concerns, archetype, diagnosticSession }) {
  const tags = concerns?.length > 0 ? concerns : ["Burnout", "Hormone disruption", "Disconnection from purpose", "Career uncertainty"];
  const archetypeName = archetype || "The Reckoning Woman";
  const completionDate = diagnosticSession?.created_date
    ? new Date(diagnosticSession.created_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "your intake date";

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Extract Q&A from diagnostic session
  const qaItems = [
    { q: "How would you describe your energy most days?", a: diagnosticSession?.currentFeeling || "Wired but exhausted — I can't switch off." },
    { q: "Where do you feel most disconnected?", a: diagnosticSession?.userContextText?.slice(0, 80) || "From my body. From what I actually want." },
    { q: "What's your relationship with your career?", a: "Successful on paper. Hollow underneath." },
    { q: "When did you last feel aligned?", a: "Honestly? Years ago." },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl z-10">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-start justify-between z-10 rounded-t-2xl">
          <div>
            <p className="text-[10px] tracking-[0.2em] text-[#C77B85] font-medium uppercase mb-1">
              YOUR ONBOARDING INTAKE
            </p>
            <p className="text-xs text-[#6B6168]">
              Saved {completionDate}. You can retake anytime.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors -mt-1">
            <X className="w-5 h-5 text-[#6B6168]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 md:p-6">
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* Left: Tags */}
            <div className="flex-1">
              <h3 className="text-sm text-[#2A1218] font-medium mb-3">Based on your answers, you're navigating:</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full border border-[#C77B85]/30 text-sm text-[#5C1A2E]">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-sm text-[#2A1218] italic">
                The Aligned Woman Blueprint was built for exactly this.
              </p>
            </div>

            {/* Right: Archetype */}
            <div className="flex-shrink-0">
              <div className="w-full md:w-56 aspect-square bg-gradient-to-br from-[#3D0F1F] to-[#5C1A2E] rounded-xl p-6 flex flex-col items-center justify-center text-center">
                <p className="text-[10px] tracking-[0.15em] text-white/60 uppercase mb-2">YOUR ARCHETYPE</p>
                <p className="text-xl text-white italic leading-snug" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                  {archetypeName}
                </p>
                <p className="text-xs text-white/60 mt-2 leading-relaxed">
                  A woman mid-reckoning — aware that something needs to change.
                </p>
              </div>
            </div>
          </div>

          {/* Q&A Section */}
          <div className="border-t border-gray-100 pt-6">
            <p className="text-[10px] tracking-[0.2em] text-[#C77B85] font-medium uppercase mb-4">
              YOUR ANSWERS · {qaItems.length} QUESTIONS
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {qaItems.map((item, i) => (
                <div key={i}>
                  <p className="text-[10px] tracking-[0.15em] text-[#6B6168] uppercase mb-1">Q{i + 1}</p>
                  <p className="text-xs text-[#6B6168] mb-1.5">{item.q}</p>
                  <p className="text-sm text-[#2A1218] italic font-medium" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                    "{item.a}"
                  </p>
                </div>
              ))}
            </div>

            <p className="text-xs text-[#6B6168] italic mt-6">
              Your answers shaped your archetype and the Blueprint's pacing. They're yours to revisit, edit, or retake.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-5 flex items-center justify-between rounded-b-2xl">
          <button className="text-[10px] tracking-[0.15em] text-[#6B6168] hover:text-[#5C1A2E] font-medium uppercase transition-colors">
            Retake the quiz
          </button>
          <Button onClick={onClose} className="bg-[#5C1A2E] hover:bg-[#3D0F1F] text-white px-6">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}