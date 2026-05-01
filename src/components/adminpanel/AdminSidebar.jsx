import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Home } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AdminSidebar({ navItems, activeTab, setActiveTab, user }) {
  return (
    <aside
      className="fixed left-0 top-0 bottom-0 flex flex-col z-50"
      style={{ width: 260, background: "#6B1B3D", color: "#fff" }}
    >
      {/* Logo */}
      <div className="p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695154cb868ee011bb627195/23f49bf5a_AlignedWomanLogoPurple.png"
          alt="AW"
          className="brightness-0 invert object-contain"
          style={{ height: 36, marginBottom: 8 }}
        />
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(196,134,108,0.85)", marginTop: 4 }}>
          Admin Panel
        </p>
      </div>

      {/* User info */}
      <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{user?.full_name || "Admin"}</p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "capitalize" }}>{user?.role}</p>
      </div>

      {/* Quick Nav - Back to Dashboard & Home */}
      <div className="px-6 py-4 space-y-2 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
        <Link
          to="/dashboard"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
          style={{ color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.05)" }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
          style={{ color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.05)" }}
        >
          <Home className="w-4 h-4" />
          Home
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className="w-full flex items-center gap-3 px-6 py-3 text-left transition-all"
            style={{
              background: activeTab === item.id ? "rgba(255,255,255,0.15)" : "transparent",
              borderLeft: activeTab === item.id ? "3px solid #C4866C" : "3px solid transparent",
              color: activeTab === item.id ? "#fff" : "rgba(255,255,255,0.65)",
              fontSize: 14,
              fontWeight: activeTab === item.id ? 600 : 400,
            }}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-6 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
        <button
          onClick={() => base44.auth.logout("/")}
          className="w-full py-3 rounded-lg text-sm font-semibold transition-all"
          style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}