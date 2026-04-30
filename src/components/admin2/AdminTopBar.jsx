import React from "react";
import { Bell } from "lucide-react";

const TAB_TITLES = {
  overview: { title: "Admin Dashboard", subtitle: "Platform health at a glance" },
  profile: { title: "My Profile", subtitle: "Update your admin profile" },
  users: { title: "Users", subtitle: "Manage platform members" },
  payments: { title: "Payment Settings", subtitle: "Regional pricing & gateways" },
  integrations: { title: "Integrations", subtitle: "Connected payment & API services" },
  affiliates: { title: "Affiliates", subtitle: "Track referrals & commissions" },
  sales: { title: "Sales", subtitle: "Revenue & transaction records" },
  waitlist: { title: "Waitlist", subtitle: "Signups awaiting access" },
  leads: { title: "Leads", subtitle: "Contact submissions, applications & enquiries" },
  emails: { title: "Emails", subtitle: "Campaigns & delivery logs" },
  experts: { title: "Experts", subtitle: "Directory & category management" },
  pages: { title: "Pages", subtitle: "Blog & content management" },
  settings: { title: "App Settings", subtitle: "Logos, social links & configuration" },
};

export default function AdminTopBar({ user, activeTab }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long" }).toUpperCase();
  const { title, subtitle } = TAB_TITLES[activeTab] || TAB_TITLES.overview;

  return (
    <header className="bg-white border-b border-gray-100 px-6 lg:px-10 py-5 flex items-start justify-between gap-4">
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", color: "#C4866C", marginBottom: 4, fontFamily: "Montserrat, sans-serif" }}>
          TODAY · {dateStr}
        </p>
        <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: "#1a0510", lineHeight: 1.1 }}>
          {title}
        </h1>
        <p style={{ fontStyle: "italic", color: "#9CA3AF", fontSize: 15, marginTop: 2, fontFamily: "Montserrat, sans-serif" }}>
          {subtitle}
        </p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <button className="p-2 hover:bg-[#FDF5F3] rounded-full transition-colors">
          <Bell className="w-5 h-5 text-[#9CA3AF]" />
        </button>
        <div className="w-9 h-9 rounded-full bg-[#6B1B3D] flex items-center justify-center">
          <span style={{ color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "Montserrat, sans-serif" }}>
            {user?.full_name?.[0] || "A"}
          </span>
        </div>
      </div>
    </header>
  );
}