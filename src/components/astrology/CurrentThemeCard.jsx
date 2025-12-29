import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CurrentThemeCard({ theme, isLast = false }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className={`border-l-4 border-l-purple-500 ${!isLast ? 'mb-4' : ''}`}>
      <CardContent className="p-5">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{theme.title}</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{theme.summary}</p>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
            )}
          </div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-4"
            >
              {/* Deeper Explanation */}
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 leading-relaxed">{theme.deeperExplanation}</p>
              </div>

              {/* When Misaligned / Aligned */}
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-red-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-semibold text-gray-900">When misaligned</span>
                  </div>
                  <p className="text-xs text-gray-700">{theme.whenMisaligned}</p>
                </div>

                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-semibold text-gray-900">When aligned</span>
                  </div>
                  <p className="text-xs text-gray-700">{theme.whenAligned}</p>
                </div>
              </div>

              {/* Suggested Practice/Course */}
              {theme.suggestion && (
                <div className="bg-purple-100 rounded-lg p-3 flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-900 mb-1">Try this</p>
                    <p className="text-xs text-gray-700">{theme.suggestion}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}