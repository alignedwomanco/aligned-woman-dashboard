import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import AdminSidebar from "@/components/adminpanel/AdminSidebar";
import OverviewTab from "@/components/adminpanel/OverviewTab";
import UsersTab from "@/components/adminpanel/UsersTab";
import PaymentSettingsTab from "@/components/adminpanel/PaymentSettingsTab";
import AffiliatesTab from "@/components/adminpanel/AffiliatesTab";
import SalesTab from "@/components/adminpanel/SalesTab";
import WaitlistTab from "@/components/adminpanel/WaitlistTab";
import LeadsTab from "@/components/adminpanel/LeadsTab";
import EmailsTab from "@/components/adminpanel/EmailsTab";
import ExpertsTab from "@/components/adminpanel/ExpertsTab";
import PagesTab from "@/components/adminpanel/PagesTab";
import AppSettingsTab from "@/components/adminpanel/AppSettingsTab";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "users", label: "Users", icon: "👥" },
  { id: "payment-settings", label: "Payment Settings", icon: "💳" },
  { id: "affiliates", label: "Affiliates", icon: "🤝" },
  { id: "sales", label: "Sales", icon: "💰" },
  { id: "waitlist", label: "Waitlist", icon: "📋" },
  { id: "leads", label: "Leads", icon: "📬" },
  { id: "emails", label: "Emails", icon: "✉️" },
  { id: "experts", label: "Experts", icon: "⭐" },
  { id: "pages", label: "Pages", icon: "📝" },
  { id: "app-settings", label: "App Settings", icon: "⚙️" },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then((u) => {
      if (!u || !["admin", "owner"].includes(u.role)) {
        navigate("/");
      } else {
        setUser(u);
        setLoading(false);
      }
    }).catch(() => navigate("/"));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F5E6E0" }}>
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#6B1B3D", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const TAB_COMPONENTS = {
    "overview": <OverviewTab />,
    "users": <UsersTab />,
    "payment-settings": <PaymentSettingsTab />,
    "affiliates": <AffiliatesTab />,
    "sales": <SalesTab />,
    "waitlist": <WaitlistTab />,
    "leads": <LeadsTab />,
    "emails": <EmailsTab />,
    "experts": <ExpertsTab />,
    "pages": <PagesTab />,
    "app-settings": <AppSettingsTab />,
  };

  return (
    <div className="flex min-h-screen" style={{ fontFamily: "Montserrat, sans-serif" }}>
      <AdminSidebar navItems={NAV_ITEMS} activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
      <main className="flex-1 overflow-auto" style={{ background: "#FAF5F3", marginLeft: 260 }}>
        <div className="p-8 max-w-7xl mx-auto">
          {TAB_COMPONENTS[activeTab] || <OverviewTab />}
        </div>
      </main>
    </div>
  );
}