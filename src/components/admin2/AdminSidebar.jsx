import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  LayoutGrid, User, Users, CreditCard, Globe, Share2,
  BarChart2, ClipboardList, Inbox, Mail, Star, FileText, Settings, LogOut, Menu, X
} from "lucide-react";

const NAV = [
  { key: "overview", label: "Dashboard", icon: LayoutGrid },
  { key: "profile", label: "Profile", icon: User },
  { key: "users", label: "Users", icon: Users },
  { key: "payments", label: "Payment Settings", icon: CreditCard },
  { key: "integrations", label: "Integrations", icon: Globe },
  { key: "affiliates", label: "Affiliates", icon: Share2 },
  { key: "sales", label: "Sales", icon: BarChart2 },
  { key: "waitlist", label: "Waitlist", icon: ClipboardList },
  { key: "leads", label: "Leads", icon: Inbox },
  { key: "emails", label: "Emails", icon: Mail },
  { key: "experts", label: "Experts", icon: Star },
  { key: "pages", label: "Pages", icon: FileText },
  { key: "settings", label: "App Settings", icon: Settings },
];

function SidebarContent({ activeTab, setActiveTab, setMobileOpen }) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Logo + Admin badge */}
      <div className="px-6 pt-7 pb-6">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695154cb868ee011bb627195/23f49bf5a_AlignedWomanLogoPurple.png"
          alt="The Aligned Woman"
          className="h-7 w-auto mb-2"
        />
        <span style={{
          fontSize: 10,
          letterSpacing: "0.2em",
          color: "#C4866C",
          fontWeight: 700,
          textTransform: "uppercase",
          fontFamily: "Montserrat, sans-serif",
        }}>
          Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pb-4 overflow-y-auto space-y-0.5">
        {NAV.map(({ key, label, icon: Icon }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => { setActiveTab(key); if (setMobileOpen) setMobileOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left group"
              style={{
                background: active ? "#F5E8EE" : "transparent",
              }}
            >
              <Icon
                className="w-4 h-4 flex-shrink-0 transition-colors"
                style={{ color: active ? "#6B1B3D" : "#BBBBBB" }}
              />
              <span style={{
                fontSize: 13,
                fontWeight: active ? 700 : 400,
                color: active ? "#6B1B3D" : "#555555",
                fontFamily: "Montserrat, sans-serif",
                letterSpacing: "0.01em",
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-4 py-5 border-t border-gray-100">
        <button
          onClick={() => base44.auth.logout()}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors w-full text-left"
        >
          <LogOut className="w-4 h-4 text-gray-400" />
          <span style={{ fontSize: 13, color: "#9CA3AF", fontFamily: "Montserrat, sans-serif" }}>Sign out</span>
        </button>
      </div>
    </div>
  );
}

export default function AdminSidebar({ activeTab, setActiveTab, user }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-sm border border-gray-200"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5 text-[#6B1B3D]" /> : <Menu className="w-5 h-5 text-[#6B1B3D]" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/30 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside className={`lg:hidden fixed top-0 left-0 h-full w-60 bg-white z-50 shadow-xl transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <SidebarContent activeTab={activeTab} setActiveTab={setActiveTab} setMobileOpen={setMobileOpen} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-100 z-40 overflow-hidden">
        <SidebarContent activeTab={activeTab} setActiveTab={setActiveTab} />
      </aside>
    </>
  );
}