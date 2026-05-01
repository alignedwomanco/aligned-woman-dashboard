import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import TabHeader from "./TabHeader";
import { format } from "date-fns";

const STATUS_COLORS = {
  new: "#d97706", reviewed: "#0891b2", responded: "#16a34a",
  pending: "#d97706", accepted: "#16a34a", declined: "#dc2626",
  contacted: "#0891b2", closed: "#6b7280",
};

function ContactsTable() {
  const [search, setSearch] = useState("");
  const qc = useQueryClient();
  const { data: contacts = [] } = useQuery({ queryKey: ["admin-contacts"], queryFn: () => base44.entities.ContactSubmission.list("-created_date") });
  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.ContactSubmission.update(id, { status }),
    onSuccess: () => qc.invalidateQueries(["admin-contacts"]),
  });
  const filtered = contacts.filter(c => c.email?.toLowerCase().includes(search.toLowerCase()) || c.first_name?.toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="mb-4 px-3 py-2 rounded-lg border text-sm w-full max-w-xs" style={{ borderColor: "rgba(107,27,61,0.2)" }} />
      <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid rgba(107,27,61,0.1)" }}>
        <table className="w-full">
          <thead><tr style={{ background: "#FAF5F3" }}>{["Date","Name","Email","Type","Status","Action"].map(h=><th key={h} className="px-4 py-3 text-left" style={{fontSize:11,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"#C4866C"}}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map(c=>(
              <tr key={c.id} className="border-t" style={{borderColor:"rgba(107,27,61,0.06)"}}>
                <td className="px-4 py-3 text-sm text-gray-500">{c.created_date?format(new Date(c.created_date),"dd MMM yy"):"—"}</td>
                <td className="px-4 py-3 text-sm font-medium">{[c.first_name,c.last_name].filter(Boolean).join(" ")||"—"}</td>
                <td className="px-4 py-3 text-sm">{c.email}</td>
                <td className="px-4 py-3 text-sm capitalize text-gray-600">{c.type?.replace("_"," ")||"—"}</td>
                <td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-xs font-semibold" style={{background:`${STATUS_COLORS[c.status]}20`,color:STATUS_COLORS[c.status]}}>{c.status}</span></td>
                <td className="px-4 py-3">
                  <select value={c.status} onChange={e=>updateStatus.mutate({id:c.id,status:e.target.value})} className="text-sm px-2 py-1 rounded border" style={{borderColor:"rgba(107,27,61,0.2)"}}>
                    <option value="new">New</option><option value="reviewed">Reviewed</option><option value="responded">Responded</option>
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length===0&&<tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No results</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ApplicationsTable() {
  const qc = useQueryClient();
  const { data: apps = [] } = useQuery({ queryKey: ["admin-apps"], queryFn: () => base44.entities.Application.list("-created_date") });
  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Application.update(id, { status }),
    onSuccess: () => qc.invalidateQueries(["admin-apps"]),
  });
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid rgba(107,27,61,0.1)" }}>
      <table className="w-full">
        <thead><tr style={{background:"#FAF5F3"}}>{["Date","Name","Email","Age","Payment Pref","Status","Action"].map(h=><th key={h} className="px-4 py-3 text-left" style={{fontSize:11,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"#C4866C"}}>{h}</th>)}</tr></thead>
        <tbody>
          {apps.map(a=>(
            <tr key={a.id} className="border-t" style={{borderColor:"rgba(107,27,61,0.06)"}}>
              <td className="px-4 py-3 text-sm text-gray-500">{a.created_date?format(new Date(a.created_date),"dd MMM yy"):"—"}</td>
              <td className="px-4 py-3 text-sm font-medium">{a.full_name}</td>
              <td className="px-4 py-3 text-sm">{a.email}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{a.age_range||"—"}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{a.payment_preference||"—"}</td>
              <td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-xs font-semibold" style={{background:`${STATUS_COLORS[a.status]}20`,color:STATUS_COLORS[a.status]}}>{a.status}</span></td>
              <td className="px-4 py-3">
                <select value={a.status} onChange={e=>updateStatus.mutate({id:a.id,status:e.target.value})} className="text-sm px-2 py-1 rounded border" style={{borderColor:"rgba(107,27,61,0.2)"}}>
                  <option value="pending">Pending</option><option value="accepted">Accepted</option><option value="declined">Declined</option>
                </select>
              </td>
            </tr>
          ))}
          {apps.length===0&&<tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No applications yet</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function BulkEnquiriesTable() {
  const qc = useQueryClient();
  const { data: enquiries = [] } = useQuery({ queryKey: ["admin-bulk"], queryFn: () => base44.entities.BulkEnquiry.list("-created_date") });
  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.BulkEnquiry.update(id, { status }),
    onSuccess: () => qc.invalidateQueries(["admin-bulk"]),
  });
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid rgba(107,27,61,0.1)" }}>
      <table className="w-full">
        <thead><tr style={{background:"#FAF5F3"}}>{["Date","Organisation","Contact","Email","Seats","Status","Action"].map(h=><th key={h} className="px-4 py-3 text-left" style={{fontSize:11,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"#C4866C"}}>{h}</th>)}</tr></thead>
        <tbody>
          {enquiries.map(e=>(
            <tr key={e.id} className="border-t" style={{borderColor:"rgba(107,27,61,0.06)"}}>
              <td className="px-4 py-3 text-sm text-gray-500">{e.created_date?format(new Date(e.created_date),"dd MMM yy"):"—"}</td>
              <td className="px-4 py-3 text-sm font-medium">{e.organisation_name}</td>
              <td className="px-4 py-3 text-sm">{e.contact_person}</td>
              <td className="px-4 py-3 text-sm">{e.work_email}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{e.number_of_seats||"—"}</td>
              <td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-xs font-semibold" style={{background:`${STATUS_COLORS[e.status]}20`,color:STATUS_COLORS[e.status]}}>{e.status}</span></td>
              <td className="px-4 py-3">
                <select value={e.status} onChange={ev=>updateStatus.mutate({id:e.id,status:ev.target.value})} className="text-sm px-2 py-1 rounded border" style={{borderColor:"rgba(107,27,61,0.2)"}}>
                  <option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option>
                </select>
              </td>
            </tr>
          ))}
          {enquiries.length===0&&<tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No bulk enquiries yet</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export default function LeadsTab() {
  const [subTab, setSubTab] = useState("contacts");
  const tabs = [{ id: "contacts", label: "Contact Submissions" }, { id: "applications", label: "Applications" }, { id: "bulk", label: "Bulk Enquiries" }];

  return (
    <div>
      <TabHeader title="Leads" subtitle="Manage incoming contacts and applications" />
      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)} className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ background: subTab === t.id ? "#6B1B3D" : "#fff", color: subTab === t.id ? "#fff" : "#6B1B3D", border: "1px solid rgba(107,27,61,0.2)" }}>
            {t.label}
          </button>
        ))}
      </div>
      {subTab === "contacts" && <ContactsTable />}
      {subTab === "applications" && <ApplicationsTable />}
      {subTab === "bulk" && <BulkEnquiriesTable />}
    </div>
  );
}