import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, ShoppingCart, Mail, FileText, Building2, TrendingUp, Send, Eye, CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// eslint-disable-next-line no-unused-vars
const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <div>
      <div className="text-3xl font-bold text-[#6E1D40]">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  </div>
);

const statusBadge = {
  new: <Badge className="bg-blue-100 text-blue-700 border-0">New</Badge>,
  reviewed: <Badge className="bg-yellow-100 text-yellow-700 border-0">Reviewed</Badge>,
  responded: <Badge className="bg-green-100 text-green-700 border-0">Responded</Badge>,
  pending: <Badge className="bg-blue-100 text-blue-700 border-0">Pending</Badge>,
  accepted: <Badge className="bg-green-100 text-green-700 border-0">Accepted</Badge>,
  declined: <Badge className="bg-red-100 text-red-700 border-0">Declined</Badge>,
  contacted: <Badge className="bg-yellow-100 text-yellow-700 border-0">Contacted</Badge>,
  closed: <Badge className="bg-gray-100 text-gray-700 border-0">Closed</Badge>,
  draft: <Badge className="bg-gray-100 text-gray-700 border-0">Draft</Badge>,
  scheduled: <Badge className="bg-yellow-100 text-yellow-700 border-0">Scheduled</Badge>,
  sent: <Badge className="bg-green-100 text-green-700 border-0">Sent</Badge>,
};

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Data
  const [waitlist, setWaitlist] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [applications, setApplications] = useState([]);
  const [bulkEnquiries, setBulkEnquiries] = useState([]);
  const [abandonedCarts, setAbandonedCarts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  // Email campaign form
  const [newCampaign, setNewCampaign] = useState({ name: "", subject: "", body_html: "", target_audience: "all_waitlist" });
  const [sendingCampaign, setSendingCampaign] = useState(false);

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      setUser(me);
      if (!["admin", "owner", "master_admin"].includes(me?.role)) {
        setLoading(false);
        return;
      }
      await loadAll();
      setLoading(false);
    };
    init();
  }, []);

  const loadAll = async () => {
    const [w, c, a, b, ac, camp] = await Promise.all([
      base44.entities.WaitlistSignup.list("-created_date", 100),
      base44.entities.ContactSubmission.list("-created_date", 100),
      base44.entities.Application.list("-created_date", 100),
      base44.entities.BulkEnquiry.list("-created_date", 100),
      base44.entities.AbandonedCart.list("-created_date", 100),
      base44.entities.EmailCampaign.list("-created_date", 50),
    ]);
    setWaitlist(w || []);
    setContacts(c || []);
    setApplications(a || []);
    setBulkEnquiries(b || []);
    setAbandonedCarts(ac || []);
    setCampaigns(camp || []);
  };

  const updateContactStatus = async (id, status) => {
    await base44.entities.ContactSubmission.update(id, { status });
    setContacts(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const updateApplicationStatus = async (id, status) => {
    await base44.entities.Application.update(id, { status });
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const updateBulkStatus = async (id, status) => {
    await base44.entities.BulkEnquiry.update(id, { status });
    setBulkEnquiries(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const createCampaign = async () => {
    if (!newCampaign.name || !newCampaign.subject) return;
    setSendingCampaign(true);
    await base44.entities.EmailCampaign.create({ ...newCampaign, status: "draft" });
    setNewCampaign({ name: "", subject: "", body_html: "", target_audience: "all_waitlist" });
    await loadAll();
    setSendingCampaign(false);
  };

  const sendCampaign = async (campaign) => {
    let recipients = [];
    if (campaign.target_audience === "all_waitlist") recipients = waitlist.map(w => ({ email: w.email, name: w.full_name }));
    else if (campaign.target_audience === "abandoned_carts") recipients = abandonedCarts.filter(a => a.email).map(a => ({ email: a.email, name: a.full_name }));
    else if (campaign.target_audience === "applications") recipients = applications.map(a => ({ email: a.email, name: a.full_name }));

    for (const r of recipients) {
      await base44.integrations.Core.SendEmail({
        to: r.email,
        subject: campaign.subject,
        body: campaign.body_html,
        from_name: "The Aligned Woman",
      });
      await base44.entities.EmailLog.create({
        campaign_id: campaign.id,
        recipient_email: r.email,
        recipient_name: r.name,
        status: "sent",
        sent_at: new Date().toISOString(),
      });
    }
    await base44.entities.EmailCampaign.update(campaign.id, { status: "sent", sent_at: new Date().toISOString(), sent_count: recipients.length });
    await loadAll();
    alert(`Campaign sent to ${recipients.length} recipients!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#6E1D40] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!["admin", "owner", "master_admin"].includes(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-serif text-[#6E1D40] mb-2">Access Restricted</h2>
          <p className="text-gray-500">This page is only accessible to administrators.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "waitlist", label: `Waitlist (${waitlist.length})` },
    { id: "contacts", label: `Contact (${contacts.length})` },
    { id: "applications", label: `Applications (${applications.length})` },
    { id: "bulk", label: `Corporate (${bulkEnquiries.length})` },
    { id: "carts", label: `Abandoned Carts (${abandonedCarts.length})` },
    { id: "campaigns", label: "Email Campaigns" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#6E1D40] text-white px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif">Admin Dashboard</h1>
            <p className="text-white/60 mt-1">The Aligned Woman — Business Intelligence</p>
          </div>
          <Button onClick={loadAll} variant="ghost" className="text-white hover:bg-white/10">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b shadow-sm px-6 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[#6E1D40] text-[#6E1D40]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard label="Waitlist Signups" value={waitlist.length} icon={Users} color="bg-[#6E1D40]" />
              <StatCard label="Contact Submissions" value={contacts.length} icon={Mail} color="bg-[#943A59]" />
              <StatCard label="Applications" value={applications.length} icon={FileText} color="bg-[#B85A7A]" />
              <StatCard label="Corporate Enquiries" value={bulkEnquiries.length} icon={Building2} color="bg-[#5A1633]" />
              <StatCard label="Abandoned Carts" value={abandonedCarts.length} icon={ShoppingCart} color="bg-[#7A2550]" />
              <StatCard label="Email Campaigns" value={campaigns.filter(c => c.status === "sent").length} icon={Send} color="bg-[#D4849A]" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-700 mb-4">Recent Applications</h3>
                {applications.slice(0, 5).map(a => (
                  <div key={a.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <div className="font-medium text-gray-800">{a.full_name}</div>
                      <div className="text-xs text-gray-400">{a.email}</div>
                    </div>
                    {statusBadge[a.status]}
                  </div>
                ))}
                {applications.length === 0 && <p className="text-gray-400 text-sm">No applications yet.</p>}
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-700 mb-4">Recent Waitlist Signups</h3>
                {waitlist.slice(0, 5).map(w => (
                  <div key={w.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <div className="font-medium text-gray-800">{w.full_name}</div>
                      <div className="text-xs text-gray-400">{w.email}</div>
                    </div>
                    <span className="text-xs text-gray-400">{w.created_date ? new Date(w.created_date).toLocaleDateString() : ""}</span>
                  </div>
                ))}
                {waitlist.length === 0 && <p className="text-gray-400 text-sm">No waitlist signups yet.</p>}
              </div>
            </div>
          </div>
        )}

        {/* Waitlist */}
        {activeTab === "waitlist" && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-serif text-[#6E1D40]">Waitlist Signups ({waitlist.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {["Name", "Email", "Instagram", "Age Range", "Life Stage", "Source", "Date"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {waitlist.map(w => (
                    <tr key={w.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{w.full_name}</td>
                      <td className="px-4 py-3 text-gray-600">{w.email}</td>
                      <td className="px-4 py-3 text-gray-500">{w.instagram_handle || "-"}</td>
                      <td className="px-4 py-3 text-gray-500">{w.age_range || "-"}</td>
                      <td className="px-4 py-3 text-gray-500">{w.life_stage || "-"}</td>
                      <td className="px-4 py-3 text-gray-500">{w.utm_source || w.source_page || "-"}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{w.created_date ? new Date(w.created_date).toLocaleDateString() : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {waitlist.length === 0 && <div className="p-8 text-center text-gray-400">No waitlist signups yet.</div>}
            </div>
          </div>
        )}

        {/* Contact Submissions */}
        {activeTab === "contacts" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm p-6 border-b">
              <h2 className="text-xl font-serif text-[#6E1D40]">Contact Submissions ({contacts.length})</h2>
            </div>
            {contacts.map(c => (
              <div key={c.id} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="font-semibold text-gray-800">{c.first_name} {c.last_name}</div>
                    <div className="text-sm text-gray-500">{c.email} · {c.country}</div>
                    <div className="text-xs text-gray-400 mt-1">{c.type?.replace(/_/g, " ")} · {c.created_date ? new Date(c.created_date).toLocaleDateString() : ""}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusBadge[c.status]}
                    <select
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1"
                      value={c.status}
                      onChange={e => updateContactStatus(c.id, e.target.value)}
                    >
                      <option value="new">New</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="responded">Responded</option>
                    </select>
                  </div>
                </div>
                {c.message && <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{c.message}</p>}
                {c.extra_field_label && c.extra_field_value && (
                  <p className="text-xs text-gray-500 mt-2"><strong>{c.extra_field_label}:</strong> {c.extra_field_value}</p>
                )}
              </div>
            ))}
            {contacts.length === 0 && <div className="bg-white rounded-2xl p-8 text-center text-gray-400">No contact submissions yet.</div>}
          </div>
        )}

        {/* Applications */}
        {activeTab === "applications" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-serif text-[#6E1D40]">Programme Applications ({applications.length})</h2>
            </div>
            {applications.map(a => (
              <div key={a.id} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="font-semibold text-gray-800">{a.full_name}</div>
                    <div className="text-sm text-gray-500">{a.email} · {a.country_city}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {a.age_range} · {a.primary_focus} · {a.created_date ? new Date(a.created_date).toLocaleDateString() : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusBadge[a.status]}
                    <select
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1"
                      value={a.status}
                      onChange={e => updateApplicationStatus(a.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accept</option>
                      <option value="declined">Decline</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                  {[
                    { label: "Payment Pref", val: a.payment_preference },
                    { label: "Instagram", val: a.instagram_handle },
                    { label: "Understands paid", val: a.understands_paid_programme ? "Yes" : "No" },
                    { label: "Ready to reserve", val: a.confirms_reservation ? "Yes" : "No" },
                  ].map(item => (
                    <div key={item.label} className="bg-gray-50 rounded-lg px-3 py-2">
                      <div className="text-xs text-gray-400">{item.label}</div>
                      <div className="text-sm font-medium text-gray-700">{item.val || "-"}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {applications.length === 0 && <div className="bg-white rounded-2xl p-8 text-center text-gray-400">No applications yet.</div>}
          </div>
        )}

        {/* Bulk Enquiries */}
        {activeTab === "bulk" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-serif text-[#6E1D40]">Corporate & D&I Enquiries ({bulkEnquiries.length})</h2>
            </div>
            {bulkEnquiries.map(b => (
              <div key={b.id} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="font-semibold text-gray-800">{b.organisation_name}</div>
                    <div className="text-sm text-gray-500">{b.contact_person} · {b.work_email}</div>
                    <div className="text-xs text-gray-400 mt-1">{b.country} · {b.number_of_seats} seats requested</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusBadge[b.status]}
                    <select
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1"
                      value={b.status}
                      onChange={e => updateBulkStatus(b.id, e.target.value)}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
                {b.notes && <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{b.notes}</p>}
              </div>
            ))}
            {bulkEnquiries.length === 0 && <div className="bg-white rounded-2xl p-8 text-center text-gray-400">No corporate enquiries yet.</div>}
          </div>
        )}

        {/* Abandoned Carts */}
        {activeTab === "carts" && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-serif text-[#6E1D40]">Abandoned Carts ({abandonedCarts.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {["Name", "Email", "Region", "Purchase Type", "Provider", "Converted", "Date"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {abandonedCarts.map(ac => (
                    <tr key={ac.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{ac.full_name || "-"}</td>
                      <td className="px-4 py-3 text-gray-600">{ac.email}</td>
                      <td className="px-4 py-3 text-gray-500">{ac.region || "-"}</td>
                      <td className="px-4 py-3 text-gray-500 capitalize">{ac.purchase_type || "-"}</td>
                      <td className="px-4 py-3 text-gray-500">{ac.payment_provider || "-"}</td>
                      <td className="px-4 py-3">{ac.converted ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{ac.created_date ? new Date(ac.created_date).toLocaleDateString() : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {abandonedCarts.length === 0 && <div className="p-8 text-center text-gray-400">No abandoned carts recorded.</div>}
            </div>
          </div>
        )}

        {/* Email Campaigns */}
        {activeTab === "campaigns" && (
          <div className="space-y-6">
            {/* New Campaign Form */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-xl font-serif text-[#6E1D40] mb-6">Create Email Campaign</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                    <Input value={newCampaign.name} onChange={e => setNewCampaign(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Welcome to the Waitlist" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                    <select
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      value={newCampaign.target_audience}
                      onChange={e => setNewCampaign(p => ({ ...p, target_audience: e.target.value }))}
                    >
                      <option value="all_waitlist">All Waitlist ({waitlist.length})</option>
                      <option value="abandoned_carts">Abandoned Carts ({abandonedCarts.length})</option>
                      <option value="applications">Applications ({applications.length})</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject</label>
                  <Input value={newCampaign.subject} onChange={e => setNewCampaign(p => ({ ...p, subject: e.target.value }))} placeholder="Your subject line..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Body</label>
                  <Textarea rows={6} value={newCampaign.body_html} onChange={e => setNewCampaign(p => ({ ...p, body_html: e.target.value }))} placeholder="Write your email content here..." />
                </div>
                <Button onClick={createCampaign} disabled={sendingCampaign} style={{ backgroundColor: '#6E1D40' }} className="text-white">
                  {sendingCampaign ? "Saving..." : "Save Campaign as Draft"}
                </Button>
              </div>
            </div>

            {/* Campaign List */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="font-semibold text-gray-700">All Campaigns</h3>
              </div>
              {campaigns.map(c => (
                <div key={c.id} className="p-6 border-b last:border-0">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold text-gray-800">{c.name}</div>
                      <div className="text-sm text-gray-500">{c.subject}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Audience: {c.target_audience?.replace(/_/g, " ")} · {c.sent_count || 0} sent
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {statusBadge[c.status]}
                      {c.status === "draft" && (
                        <Button
                          onClick={() => sendCampaign(c)}
                          size="sm"
                          style={{ backgroundColor: '#943A59' }}
                          className="text-white"
                        >
                          <Send className="w-3 h-3 mr-1" /> Send Now
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {campaigns.length === 0 && <div className="p-8 text-center text-gray-400">No campaigns yet.</div>}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}