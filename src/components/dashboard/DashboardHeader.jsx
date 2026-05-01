import React from "react";
import { Bell, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function DashboardHeader({ user }) {
  const today = new Date();
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  const dateStr = today.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" }).split("/").join(" ");
  
  const firstName = user?.full_name?.split(" ")[0] || "There";

  return (
    <div className="flex items-start justify-between mb-10">
      {/* Left: Date & Greeting */}
      <div>
        <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#C4847A", marginBottom: "16px", fontFamily: "Montserrat, sans-serif" }}>
          TODAY . {dayName} {dateStr}
        </p>
        <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(28px, 4vw, 36px)", color: "#1a1a1a", fontWeight: 400, marginBottom: "8px", lineHeight: 1 }}>
          Good Afternoon, {firstName}.
        </h1>
        <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: "italic", fontSize: "16px", color: "#888", fontWeight: 400 }}>
          Hope you feel centered today.
        </p>
      </div>

      {/* Right: Bell + Avatar Dropdown */}
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-gray-700" />
        </button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded-lg transition-colors">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.profile_picture} />
                <AvatarFallback style={{ backgroundColor: "#6B1B3D", color: "white" }}>
                  {user?.full_name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>Profile Settings</DropdownMenuItem>
            <DropdownMenuItem>Dashboard Settings</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}