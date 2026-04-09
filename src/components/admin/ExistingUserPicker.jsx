import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ExistingUserPicker({
  nonMembers,
  filteredNonMembers,
  existingSearch,
  setExistingSearch,
  selectedExistingUser,
  setSelectedExistingUser,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (dropdownOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [dropdownOpen]);

  return (
    <div ref={containerRef}>
      <Label>Select User</Label>
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="w-full mt-1 flex items-center justify-between px-3 py-2.5 border rounded-md bg-white hover:bg-gray-50 transition-colors text-left"
      >
        {selectedExistingUser ? (
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="w-6 h-6 flex-shrink-0">
              <AvatarImage src={selectedExistingUser.profile_picture} />
              <AvatarFallback className="bg-[#6E1D40] text-white text-[10px]">
                {selectedExistingUser.full_name?.[0] || "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm truncate">{selectedExistingUser.full_name || selectedExistingUser.email}</span>
            <Badge className="bg-gray-100 text-gray-600 border-0 text-[10px] capitalize flex-shrink-0">
              {selectedExistingUser.role?.replace("_", " ")}
            </Badge>
          </div>
        ) : (
          <span className="text-sm text-gray-400">Choose a user...</span>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
      </button>

      {dropdownOpen && (
        <div className="mt-1 border rounded-lg bg-white shadow-lg z-10 relative">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                ref={searchRef}
                value={existingSearch}
                onChange={(e) => setExistingSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-8 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-[#6E1D40]"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredNonMembers.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                {nonMembers.length === 0 ? "All users are already members" : "No matching users"}
              </p>
            ) : (
              filteredNonMembers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    setSelectedExistingUser(u);
                    setDropdownOpen(false);
                    setExistingSearch("");
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors border-b last:border-b-0 ${
                    selectedExistingUser?.id === u.id ? "bg-[#F5E8EE]" : ""
                  }`}
                >
                  <Avatar className="w-7 h-7 flex-shrink-0">
                    <AvatarImage src={u.profile_picture} />
                    <AvatarFallback className="bg-[#6E1D40] text-white text-[10px]">
                      {u.full_name?.[0] || u.email?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{u.full_name || "Unnamed"}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                  <Badge className="bg-gray-100 text-gray-600 border-0 text-[10px] capitalize flex-shrink-0">
                    {u.role?.replace("_", " ")}
                  </Badge>
                  {selectedExistingUser?.id === u.id && (
                    <Check className="w-4 h-4 text-[#6E1D40] flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}