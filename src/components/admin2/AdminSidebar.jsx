import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  LayoutGrid, User, Users, CreditCard, Globe, Share2,
  BarChart2, ClipboardList, Inbox, Mail, Star, FileText, Settings, LogOut, Menu, X
} from "lucide-react";

const NAV = [
  { key: "overview", label: "OVERVIEW", icon: LayoutGrid },
  { key: "profile", label: "PROFILE", icon: User },
  { key: "users", label: "USERS", icon: Users },
  { key: "payments", label: "PAYMENT SETTINGS", icon: CreditCard },
  { key: "integrations", label: "INTEGRATIONS", icon: Globe },
  { key: "affiliates", label: "AFFILIATES", icon: Share2 },
  { key: "sales", label: "SALES", icon: BarChart2 },
  { key: "waitlist", label: "WAITLIST", icon: ClipboardList },
  { key: "leads", label: "LEADS", icon: Inbox },
  { key: "emails", label: "EMAILS", icon: Mail },
  { key: "experts", label: "EXPERTS", icon: Star },
  { key: "pages", label: "PAGES", icon: FileText },
  { key: "settings", label: "APP SETTINGS", icon: Settings },
];

export default function AdminSidebar({ activeTab, setActiveTab, user }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-[#F0E8E4]">
        <div className="flex items-center gap-2">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695154cb868ee011bb627195/23f49bf5a_AlignedWomanLogoPurple.png"
            alt="AW"
            className="h-8 w-auto"
          />
        </div>
        <p style={{ fontSize: 10, letterSpacing: "0.15em", color: "#C4866C", marginTop: 4, fontWeight: 600, textTransform: "uppercase" }}>
          Admin
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {NAV.map(({ key, label, icon: Icon }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setMobileOpen(false); }}
              className="w-full flex items-center gap-3 px-6 py-3 transition-colors hover:bg-[#FDF5F3] text-left"
            >
              {active && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#6B1B3D] flex-shrink-0" />
              )}
              {!active && <span className="w-1.5 h-1.5 flex-shrink-0" />}
              <Icon className="w-4 h-4 flex-shrink-0" style={{ color: active ? "#6B1B3D" : "#9CA3AF" }} />
              <span style={{
                fontSize: 11,
                fontWeight: active ? 700 : 500,
                letterSpacing: "0.12em",
                color: active ? "#6B1B3D" : "#6B7280",
                fontFamily: "Montserrat, sans-serif",
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-6 py-4 border-t border-[#F0E8E4]">
        <button
          onClick={() => base44.auth.logout()}
          className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span style={{ fontSize: 11, letterSpacing: "0.12em", fontFamily: "Montserrat, sans-serif" }}>SIGN OUT</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow border border-[#F0E8E4]"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5 text-[#6B1B3D]" /> : <Menu className="w-5 h-5 text-[#6B1B3D]" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white z-50 shadow-xl transition-transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-64 bg-white border-r border-[#F0E8E4] flex-col z-40">
        <SidebarContent />
      </aside>
    </>
  );
}