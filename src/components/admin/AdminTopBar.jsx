import React from "react";
import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function AdminTopBar({ user }) {
  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: "16px",
      padding: "16px 32px",
      borderBottom: "1px solid #e0e0e0",
      background: "white",
    }}>
      {/* Bell icon */}
      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
        <Bell className="w-5 h-5 text-gray-700" />
      </button>

      {/* Avatar dropdown */}
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
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem asChild>
            <Link to="/dashboardsettings" className="flex items-center gap-2 cursor-pointer">
              <User className="w-4 h-4" />
              Profile Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/dashboardsettings" className="flex items-center gap-2 cursor-pointer">
              <Settings className="w-4 h-4" />
              Dashboard Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}