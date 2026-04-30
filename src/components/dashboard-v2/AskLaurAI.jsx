import React, { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";

export default function AskLaurAI({ userName }) {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const quickPrompts = [
    "How should I work with my energy today?",
    "What does my body need right now?",
    "Help me understand my current phase.",
  ];

  const askQuestion = async (q) => {
    const prompt = q || question.trim();
    if (!prompt || isLoading) return;

    setIsLoading(true);
    setResponse("");
    setQuestion("");

    try {
      const user = await base44.auth.me();
      const sessions = await base44.entities.DiagnosticSession.filter({ isComplete: true }, "-created_date", 1);
      const session = sessions[0];

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are LaurAI, a warm wellness guide for The Aligned Woman Blueprint.
User: ${user?.full_name || userName || "there"}
ALIVE Phase: ${session?.primaryPhase || "Awareness"}
Capacity: ${session?.capacityScore || "unknown"}/10

Question: "${prompt}"

Respond warmly in 100 words or less. Reference their current phase. Be grounded, not generic.`,
      });

      setResponse(result);
    } catch {
      setResponse("I'm having trouble connecting right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 md:p-6 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#5C1A2E] to-[#C77B85] flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-[#2A1218]">Ask LaurAI</h3>
          <p className="text-xs text-[#6B6168]">Design-aware guidance just for you</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => askQuestion(p)}
            className="text-xs text-[#6B6168] hover:text-[#5C1A2E] border border-gray-100 hover:border-[#C77B85]/30 rounded-full px-3 py-1.5 transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && askQuestion()}
          placeholder="Or ask your own question..."
          className="flex-1 rounded-full bg-[#FAEEEE]/50 border-gray-100 text-sm"
          disabled={isLoading}
        />
        <button
          onClick={() => askQuestion()}
          disabled={!question.trim() || isLoading}
          className="w-10 h-10 rounded-full bg-[#5C1A2E] hover:bg-[#3D0F1F] text-white flex items-center justify-center transition-colors disabled:opacity-40 flex-shrink-0"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      {response && (
        <div className="mt-4 bg-[#FAEEEE]/50 rounded-xl p-4">
          <p className="text-sm text-[#2A1218] leading-relaxed">{response}</p>
        </div>
      )}
    </div>
  );
}