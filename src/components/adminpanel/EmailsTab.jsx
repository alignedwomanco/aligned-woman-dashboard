import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import TabHeader from "./TabHeader";
import { format } from "date-fns";

const EMPTY = { name: "", subject: "", html_body: "", type: "blast", status: "draft", audience: "all_opted_in", from_name: "Laura | The Aligned Woman", reply_to: "", notes: "" };

const STATUS_COLORS = { draft: "#6b7280", sent: "#16a34a", scheduled: "#d97706", sending: "#0891b2" };

export default function EmailsTab() {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const qc = useQueryClient();

  const { data: campaigns = [] } = useQuery({ queryKey: ["admin-campaigns"], queryFn: () => base44.entities.EmailCampaign.list("-created_date") });

  const save = useMutation({
    mutationFn: () => editing === "new"
      ? base44.entities.EmailCampaign.create(form)
      : base44.entities.EmailCampaign.update(editing, form),
    onSuccess: () => { qc.invalidateQueries(["admin-campaigns"]); setEditing(null); setForm(EMPTY); },
  });

  const del = useMutation({
    mutationFn: id => base44.entities.EmailCampaign.delete(id),
    onSuccess: () => qc.invalidateQueries(["admin-campaigns"]),
  });

  const openEdit = (c) => { setEditing(c.id); setForm({ ...EMPTY, ...c }); };

  const F = ({ label, field, type = "text" }) => (
    <div>
      <label className="block text-xs font-semibold mb-1" style={{ color: "#6B1B3D" }}>{label}</label>
      <input type={type} value={form[field] || ""} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "rgba(107,27,61,0.2)" }} />
    </div>
  );

  return (
    <div>
      <TabHeader
        title="Email Campaigns"
        subtitle="Create and manage email campaigns"
        action={<button onClick={() => { setEditing("new"); setForm(EMPTY); }} className="px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "#6B1B3D" }}>+ New Campaign</button>}
      />

      {editing && (
        <div className="mb-8 rounded-xl p-6" style={{ background: "#fff", border: "1px solid rgba(107,27,61,0.15)" }}>
          <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 22, color: "#6B1B3D", marginBottom: 16 }}>{editing === "new" ? "New Campaign" : "Edit Campaign"}</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <F label="Campaign Name" field="name" />
            <F label="Subject Line" field="subject" />
            <F label="From Name" field="from_name" />
            <F label="Reply To" field="reply_to" />
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "#6B1B3D" }}>Audience</label>
              <select value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "rgba(107,27,61,0.2)" }}>
                <option value="all_opted_in">All Opted In</option>
                <option value="waitlist">Waitlist</option>
                <option value="abandoned_carts">Abandoned Carts</option>
                <option value="buyers">Buyers</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "#6B1B3D" }}>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "rgba(107,27,61,0.2)" }}>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="sent">Sent</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold mb-1" style={{ color: "#6B1B3D" }}>Email Body (HTML)</label>
            <textarea value={form.html_body || ""} onChange={e => setForm(f => ({ ...f, html_body: e.target.value }))} rows={8} className="w-full px-3 py-2 rounded-lg border text-sm font-mono" style={{ borderColor: "rgba(107,27,61,0.2)" }} />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold mb-1" style={{ color: "#6B1B3D" }}>Notes</label>
            <textarea value={form.notes || ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "rgba(107,27,61,0.2)" }} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => save.mutate()} className="px-5 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "#6B1B3D" }}>Save</button>
            <button onClick={() => { setEditing(null); setForm(EMPTY); }} className="px-5 py-2 rounded-lg text-sm" style={{ border: "1px solid rgba(107,27,61,0.2)" }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid rgba(107,27,61,0.1)" }}>
        <table className="w-full">
          <thead><tr style={{ background: "#FAF5F3" }}>{["Name","Subject","Audience","Status","Sent","Date","Actions"].map(h=><th key={h} className="px-4 py-3 text-left" style={{fontSize:11,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"#C4866C"}}>{h}</th>)}</tr></thead>
          <tbody>
            {campaigns.map(c => (
              <tr key={c.id} className="border-t" style={{ borderColor: "rgba(107,27,61,0.06)" }}>
                <td className="px-4 py-3 text-sm font-medium">{c.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{c.subject}</td>
                <td className="px-4 py-3 text-sm text-gray-600 capitalize">{c.audience?.replace("_"," ")}</td>
                <td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-xs font-semibold" style={{background:`${STATUS_COLORS[c.status]}20`,color:STATUS_COLORS[c.status]}}>{c.status}</span></td>
                <td className="px-4 py-3 text-sm text-gray-600">{c.sent_count || 0}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{c.created_date?format(new Date(c.created_date),"dd MMM yy"):"—"}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEdit(c)} className="text-xs px-3 py-1 rounded" style={{ background: "#F5E6E0", color: "#6B1B3D" }}>Edit</button>
                  <button onClick={() => del.mutate(c.id)} className="text-xs px-3 py-1 rounded bg-red-50 text-red-600">Delete</button>
                </td>
              </tr>
            ))}
            {campaigns.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No campaigns yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}