import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

export const THEME_OPTIONS = [
  {
    id: "aligned",
    label: "Aligned",
    colors: { primary: "#2F1B3E", secondary: "#482C83" },
    isDefault: true,
  },
  {
    id: "rose",
    label: "Rose Bloom",
    colors: { primary: "#E11D48", secondary: "#F43F5E" },
  },
  {
    id: "lavender",
    label: "Lavender Dream",
    colors: { primary: "#9333EA", secondary: "#C084FC" },
  },
  {
    id: "ocean",
    label: "Ocean Depths",
    colors: { primary: "#0369A1", secondary: "#0EA5E9" },
  },
  {
    id: "forest",
    label: "Forest Green",
    colors: { primary: "#065F46", secondary: "#10B981" },
  },
  {
    id: "sunset",
    label: "Sunset Glow",
    colors: { primary: "#DC2626", secondary: "#F97316" },
  },
  {
    id: "midnight",
    label: "Midnight Sky",
    colors: { primary: "#1E293B", secondary: "#475569" },
  },
  {
    id: "blush",
    label: "Blush Pink",
    colors: { primary: "#BE185D", secondary: "#EC4899" },
  },
];

export default function ThemeSelector({ currentTheme, onThemeChange }) {
  const selectedTheme = THEME_OPTIONS.find((t) => t.id === currentTheme) || THEME_OPTIONS[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Color Theme</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {THEME_OPTIONS.map((theme) => (
            <button
              key={theme.id}
              onClick={() => onThemeChange(theme.id)}
              className={`relative rounded-lg overflow-hidden border-2 transition-all p-4 ${
                currentTheme === theme.id
                  ? "border-[#2F1B3E] ring-2 ring-[#2F1B3E]/20"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex gap-2 mb-2">
                <div
                  className="w-10 h-10 rounded-full"
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <div
                  className="w-10 h-10 rounded-full"
                  style={{ backgroundColor: theme.colors.secondary }}
                />
              </div>
              <p className="text-sm font-medium text-gray-900">{theme.label}</p>
              {theme.isDefault && (
                <span className="text-xs text-gray-500 mt-1 block">Default</span>
              )}
              {currentTheme === theme.id && (
                <div className="absolute top-2 right-2">
                  <Check className="w-5 h-5 text-[#2F1B3E]" />
                </div>
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}