import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { SectionLabel } from "@/components/admin2/AdminCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

function StatusSelect({ id, entity, value, options }) {
  const qc = useQueryClient();
  const update = useMutation({
    mutationFn: v => base44.entities[entity].update(id, { status: v }),
    onSuccess: () => qc.invalidateQueries(),
  });
  return (
    <Select value={value} onValueChange={v => update.mutate(v)}>
      <SelectTrigger className="w-32 h-7 text-xs"><SelectValue /></SelectTrigger>
      <SelectContent>{options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
    </Select>
  );
}

export default function LeadsTab() {
  const [sub, setSub] = useState("contacts");

  const { data: contacts = [] } = useQuery({ queryKey: ["admin-contacts"], queryFn: () => base44.entities.ContactSubmission.list("-created_date") });
  const { data: applications = [] } = useQuery({ queryKey: ["admin-applications"], queryFn: () => base44.entities.Application.list("-created_date") });
  const { data: enquiries = [] } = useQuery({ queryKey: ["admin-enquiries"], queryFn: () => base44.entities.BulkEnquiry.list("-created_date") });

  const TABS = [
    { key: "contacts", label: "Contact Submissions", count: contacts.length },
    { key: "applications", label: "Applications", count: applications.length },
    { key: "enquiries", label: "Bulk Enquiries", count: enquiries.length },
  ];

  return (
    <div>
      <SectionLabel>Leads</SectionLabel>

      <div className="flex gap-2 mb-6">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setSub(t.key)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border transition-all"
            style={{ background: sub === t.key ? "#6B1B3D" : "#fff", color: sub === t.key ? "#fff" : "#6B1B3D", borderColor: "#6B1B3D", fontSize: 12, fontFamily: "Montserrat, sans-serif", fontWeight: 600 }}>
            {t.label}
            <span className="px-1.5 py-0.5 rounded-full text-xs" style={{ background: sub === t.key ? "rgba(255,255,255,0.2)" : "#FDF5F3" }}>{t.count}</span>
          </button>
        ))}
      </div>

      {sub === "contacts" && (
        <div className="bg-white rounded-2xl border border-[#E8E0DC] overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead><tr className="border-b border-[#F0E8E4]">
              {["Type", "Name", "Email", "Country", "Status", "Date"].map(h => (
                <th key={h} className="text-left px-4 py-3" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "#C4866C", fontFamily: "Montserrat, sans-serif" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {contacts.map(c => (
                <tr key={c.id} className="border-b border-[#F8F3F1] hover:bg-[#FDF9F8]">
                  <td className="px-4 py-3" style={{ fontSize: 13, fontFamily: "Montserrat, sans-serif" }}>{c.type}</td>
                  <td className="px-4 py-3" style={{ fontSize: 13, fontFamily: "Montserrat, sans-serif" }}>{[c.first_name, c.last_name].filter(Boolean).join(" ") || "—"}</td>
                  <td className="px-4 py-3" style={{ fontSize: 13, fontFamily: "Montserrat, sans-serif" }}>{c.email}</td>
                  <td className="px-4 py-3" style={{ fontSize: 13, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>{c.country || "—"}</td>
                  <td className="px-4 py-3"><StatusSelect id={c.id} entity="ContactSubmission" value={c.status} options={["new", "reviewed", "responded"]} /></td>
                  <td className="px-4 py-3" style={{ fontSize: 13, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>{c.created_date ? format(new Date(c.created_date), "d MMM yyyy") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sub === "applications" && (
        <div className="bg-white rounded-2xl border border-[#E8E0DC] overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead><tr className="border-b border-[#F0E8E4]">
              {["Name", "Email", "Age Range", "Focus", "Status", "Date"].map(h => (
                <th key={h} className="text-left px-4 py-3" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "#C4866C", fontFamily: "Montserrat, sans-serif" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {applications.map(a => (
                <tr key={a.id} className="border-b border-[#F8F3F1] hover:bg-[#FDF9F8]">
                  <td className="px-4 py-3" style={{ fontSize: 13, fontFamily: "Montserrat, sans-serif" }}>{a.full_name}</td>
                  <td className="px-4 py-3" style={{ fontSize: 13, fontFamily: "Montserrat, sans-serif" }}>{a.email}</td>
                  <td className="px-4 py-3" style={{ fontSize: 13, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>{a.age_range || "—"}</td>
                  <td className="px-4 py-3" style={{ fontSize: 13, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>{a.primary_focus || "—"}</td>
                  <td className="px-4 py-3"><StatusSelect id={a.id} entity="Application" value={a.status} options={["pending", "accepted", "declined"]} /></td>
                  <td className="px-4 py-3" style={{ fontSize: 13, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>{a.created_date ? format(new Date(a.created_date), "d MMM yyyy") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sub === "enquiries" && (
        <div className="bg-white rounded-2xl border border-[#E8E0DC] overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead><tr className="border-b border-[#F0E8E4]">
              {["Organisation", "Contact", "Email", "Seats", "Status", "Date"].map(h => (
                <th key={h} className="text-left px-4 py-3" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "#C4866C", fontFamily: "Montserrat, sans-serif" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {enquiries.map(e => (
                <tr key={e.id} className="border-b border-[#F8F3F1] hover:bg-[#FDF9F8]">
                  <td className="px-4 py-3" style={{ fontSize: 13, fontFamily: "Montserrat, sans-serif" }}>{e.organisation_name}</td>
                  <td className="px-4 py-3" style={{ fontSize: 13, fontFamily: "Montserrat, sans-serif" }}>{e.contact_person}</td>
                  <td className="px-4 py-3" style={{ fontSize: 13, fontFamily: "Montserrat, sans-serif" }}>{e.work_email}</td>
                  <td className="px-4 py-3" style={{ fontSize: 13, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>{e.number_of_seats || "—"}</td>
                  <td className="px-4 py-3"><StatusSelect id={e.id} entity="BulkEnquiry" value={e.status} options={["new", "contacted", "closed"]} /></td>
                  <td className="px-4 py-3" style={{ fontSize: 13, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>{e.created_date ? format(new Date(e.created_date), "d MMM yyyy") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}