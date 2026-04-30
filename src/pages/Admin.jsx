import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AdminSidebar from "@/components/admin2/AdminSidebar";
import AdminTopBar from "@/components/admin2/AdminTopBar";
import OverviewTab from "@/components/admin2/tabs/OverviewTab";
import ProfileTab from "@/components/admin2/tabs/ProfileTab";
import UsersTab from "@/components/admin2/tabs/UsersTab";
import PaymentSettingsTab from "@/components/admin2/tabs/PaymentSettingsTab";
import IntegrationsTab from "@/components/admin2/tabs/IntegrationsTab";
import AffiliatesTab from "@/components/admin2/tabs/AffiliatesTab";
import SalesTab from "@/components/admin2/tabs/SalesTab";
import WaitlistTab from "@/components/admin2/tabs/WaitlistTab";
import LeadsTab from "@/components/admin2/tabs/LeadsTab";
import EmailsTab from "@/components/admin2/tabs/EmailsTab";
import ExpertsTab from "@/components/admin2/tabs/ExpertsTab";
import PagesTab from "@/components/admin2/tabs/PagesTab";
import AppSettingsTab from "@/components/admin2/tabs/AppSettingsTab";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then((u) => {
      if (!u || !["admin", "owner", "master_admin"].includes(u.role)) {
        window.location.href = "/";
        return;
      }
      setUser(u);
      setLoading(false);
    }).catch(() => { window.location.href = "/"; });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-[#6B1B3D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const TAB_COMPONENTS = {
    overview: <OverviewTab />,
    profile: <ProfileTab user={user} setUser={setUser} />,
    users: <UsersTab currentUser={user} />,
    payments: <PaymentSettingsTab />,
    integrations: <IntegrationsTab />,
    affiliates: <AffiliatesTab />,
    sales: <SalesTab />,
    waitlist: <WaitlistTab />,
    leads: <LeadsTab />,
    emails: <EmailsTab />,
    experts: <ExpertsTab />,
    pages: <PagesTab />,
    settings: <AppSettingsTab />,
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "Montserrat, sans-serif", background: "#FAFAFA" }}>
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-60">
        <AdminTopBar user={user} activeTab={activeTab} />
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          {TAB_COMPONENTS[activeTab] || <OverviewTab />}
        </main>
      </div>
    </div>
  );
}