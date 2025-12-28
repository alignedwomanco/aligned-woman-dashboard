import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

const lightenColor = (hex, percent) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.floor(((num >> 16) & 0xff) + (255 - ((num >> 16) & 0xff)) * percent));
  const g = Math.min(255, Math.floor(((num >> 8) & 0xff) + (255 - ((num >> 8) & 0xff)) * percent));
  const b = Math.min(255, Math.floor((num & 0xff) + (255 - (num & 0xff)) * percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

export const getBackgroundOptions = (themeColors = { primary: '#3C224F', secondary: '#5B2E84', tertiary: '#4B397F' }) => [
  { id: "theme1", label: "Theme Light", type: "color", value: lightenColor(themeColors.primary, 0.9) },
  { id: "theme2", label: "Theme Soft", type: "color", value: lightenColor(themeColors.secondary, 0.85) },
  { id: "theme3", label: "Theme Mist", type: "color", value: lightenColor(themeColors.tertiary, 0.88) },
  { id: "neutral1", label: "Neutral", type: "color", value: "#F9FAFB" },
  { id: "white1", label: "White", type: "color", value: "#FFFFFF" },
  { 
    id: "pattern1", 
    label: "Theme Gradient", 
    type: "svg",
    value: `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${themeColors.primary};stop-opacity:1" /><stop offset="100%" style="stop-color:${themeColors.secondary};stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(#grad1)"/><circle cx="85%" cy="30%" r="200" fill="${themeColors.secondary}40"/><circle cx="15%" cy="70%" r="150" fill="${themeColors.secondary}30"/></svg>`
  },
  { 
    id: "pattern2", 
    label: "Theme Waves", 
    type: "svg",
    value: `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:${lightenColor(themeColors.primary, 0.9)};stop-opacity:1" /><stop offset="100%" style="stop-color:${lightenColor(themeColors.secondary, 0.85)};stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(#grad2)"/><path d="M0,100 Q250,50 500,100 T1000,100 T1500,100 T2000,100 V200 H0 Z" fill="${themeColors.tertiary}30"/></svg>`
  },
];

export default function BackgroundSelector({ currentBackground, onBackgroundChange }) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState(currentBackground);
  
  // Get theme colors from CSS variables
  const getThemeColors = () => {
    const root = document.documentElement;
    const primary = getComputedStyle(root).getPropertyValue('--theme-primary').trim() || '#3C224F';
    const secondary = getComputedStyle(root).getPropertyValue('--theme-secondary').trim() || '#5B2E84';
    const tertiary = getComputedStyle(root).getPropertyValue('--theme-tertiary').trim() || '#4B397F';
    return { primary, secondary, tertiary };
  };
  
  const themeColors = getThemeColors();
  const backgroundOptions = getBackgroundOptions(themeColors);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setSelectedBackground(file_url);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    await base44.auth.updateMe({ background_image: selectedBackground });
    // Immediately apply the background
    if (selectedBackground && selectedBackground.startsWith('#')) {
      document.body.style.backgroundColor = selectedBackground;
      document.body.style.backgroundImage = "none";
    } else if (selectedBackground && selectedBackground.startsWith('data:image/svg+xml')) {
      document.body.style.backgroundImage = `url("${selectedBackground}")`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundAttachment = "fixed";
      document.body.style.backgroundColor = "transparent";
    } else if (selectedBackground) {
      document.body.style.backgroundImage = `url(${selectedBackground})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundAttachment = "fixed";
      document.body.style.backgroundColor = "transparent";
    }
    onBackgroundChange(selectedBackground);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Background</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          {backgroundOptions.map((bg) => (
            <button
              key={bg.id}
              onClick={() => {
                const newBg = bg.type === "color" ? bg.value : `data:image/svg+xml,${encodeURIComponent(bg.value)}`;
                setSelectedBackground(newBg);
                // Apply instantly
                if (newBg && newBg.startsWith('#')) {
                  document.body.style.backgroundColor = newBg;
                  document.body.style.backgroundImage = "none";
                } else if (newBg && newBg.startsWith('data:image/svg+xml')) {
                  document.body.style.backgroundImage = `url("${newBg}")`;
                  document.body.style.backgroundSize = "cover";
                  document.body.style.backgroundPosition = "center";
                  document.body.style.backgroundAttachment = "fixed";
                  document.body.style.backgroundColor = "transparent";
                }
              }}
              className={`relative rounded-lg overflow-hidden border-2 transition-all h-20 ${
                selectedBackground === (bg.type === "color" ? bg.value : `data:image/svg+xml,${encodeURIComponent(bg.value)}`)
                  ? "ring-2"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              style={selectedBackground === (bg.type === "color" ? bg.value : `data:image/svg+xml,${encodeURIComponent(bg.value)}`) ? {
                borderColor: themeColors.primary,
                '--tw-ring-color': `${themeColors.primary}33`
              } : {}}
            >
              {bg.type === "color" ? (
                <div className="w-full h-full" style={{ backgroundColor: bg.value }} />
              ) : (
                <div 
                  className="w-full h-full" 
                  style={{ 
                    backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(bg.value)}")`,
                    backgroundSize: 'cover'
                  }} 
                />
              )}
              {selectedBackground === (bg.type === "color" ? bg.value : `data:image/svg+xml,${encodeURIComponent(bg.value)}`) && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: `${themeColors.primary}33` }}>
                  <Check className="w-6 h-6 text-white drop-shadow" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 px-2 text-center">
                {bg.label}
              </div>
            </button>
          ))}
        </div>

        <div className="pt-4 border-t space-y-3">
          <Label htmlFor="bg-upload" className="cursor-pointer">
            <div className="flex items-center gap-2 px-4 py-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors border border-pink-200">
              <Upload className="w-4 h-4" style={{ color: themeColors.primary }} />
              <span className="text-sm font-medium" style={{ color: themeColors.primary }}>
                {isUploading ? "Uploading..." : "Upload Custom Background"}
              </span>
            </div>
            <Input
              id="bg-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={isUploading}
            />
          </Label>

          <Button 
            onClick={handleSave} 
            className="w-full text-white"
            style={{ 
              backgroundColor: themeColors.primary,
              opacity: isUploading ? 0.5 : 0.95
            }}
            onMouseEnter={(e) => !isUploading && (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => !isUploading && (e.currentTarget.style.opacity = '0.95')}
            disabled={isUploading}
          >
            Save Background
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}