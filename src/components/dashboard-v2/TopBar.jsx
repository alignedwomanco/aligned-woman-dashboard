import React, { useState } from "react";
import { Bell, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationsDropdown from "@/components/navigation/NotificationsDropdown";

export default function TopBar({ user, hasUnreadNotifications }) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Notification bell */}
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Bell className="w-5 h-5 text-[#6B6168]" />
          {hasUnreadNotifications && (
            <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#C77B85] border-2 border-white" />
          )}
        </button>

        {/* Avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 p-1 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="w-9 h-9 rounded-full bg-[#5C1A2E] flex items-center justify-center flex-shrink-0 overflow-hidden">
                {user?.profile_picture ? (
                  <img src={user.profile_picture} alt={user.full_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-sm font-medium">
                    {user?.full_name?.[0] || user?.email?.[0] || "U"}
                  </span>
                )}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#6B6168]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link to={createPageUrl("ProfileSettings")} className="flex items-center gap-2">
                <User className="w-4 h-4" /> Profile Settings
              </Link>
            </DropdownMenuItem>
            {user?.role && ["owner", "admin", "master_admin"].includes(user.role) && (
              <DropdownMenuItem asChild>
                <Link to={createPageUrl("AdminSettings")} className="flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Admin Settings
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => base44.auth.logout()} className="text-red-600">
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {showNotifications && <NotificationsDropdown onClose={() => setShowNotifications(false)} />}
    </>
  );
}