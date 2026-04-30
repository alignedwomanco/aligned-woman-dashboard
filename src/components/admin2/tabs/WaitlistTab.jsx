import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { SectionLabel, StatCard } from "@/components/admin2/AdminCard";
import { ClipboardList } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

function exportCSV(data) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const csv = [keys.join(","), ...data.map(row => keys.map(k => JSON.stringify(row[k] ?? "")).join(","))].join("\n");
  const a = document.createElement("a"); a.href = "data:text/csv," + encodeURIComponent(csv); a.download = "waitlist.csv"; a.click();
}

export default function WaitlistTab() {
  const [search, setSearch] = useState("");
  const { data: list = [] } = useQuery({ queryKey: ["admin-waitlist-full"], queryFn: () => base44.entities.WaitlistSignup.list("-created_date") });

  const filtered = list.filter(w => !search || w.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="grid grid-cols-1 mb-8">
        <StatCard label="Total Waitlist Signups" value={list.length} icon={ClipboardList} />
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative max-w-sm flex-1">
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email..." className="rounded-xl" />
        </div>
        <button onClick={() => exportCSV(filtered)} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#6B1B3D", background: "none", border: "1px solid #6B1B3D", borderRadius: 100, padding: "6px 16px", cursor: "pointer", fontFamily: "Montserrat, sans-serif" }}>
          EXPORT CSV →
        </button>
      </div>

      <SectionLabel>Signups</SectionLabel>
      <div className="bg-white rounded-2xl border border-[#E8E0DC] overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-[#F0E8E4]">
              {["Email", "First Name", "Last Name", "Country", "Affiliate Code", "Source", "Date"].map(h => (
                <th key={h} className="text-left px-4 py-3" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "#C4866C", fontFamily: "Montserrat, sans-serif" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center italic" style={{ color: "#9CA3AF" }}>No signups yet.</td></tr>
            ) : filtered.map(w => (
              <tr key={w.id} className="border-b border-[#F8F3F1] hover:bg-[#FDF9F8]">
                <td className="px-4 py-3" style={{ fontSize: 13, fontFamily: "Montserrat, sans-serif" }}>{w.email}</td>
                <td className="px-4 py-3" style={{ fontSize: 13, fontFamily: "Montserrat, sans-serif" }}>{w.first_name || "—"}</td>
                <td className="px-4 py-3" style={{ fontSize: 13, fontFamily: "Montserrat, sans-serif" }}>{w.last_name || "—"}</td>
                <td className="px-4 py-3" style={{ fontSize: 13, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>{w.country || "—"}</td>
                <td className="px-4 py-3" style={{ fontSize: 13, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>{w.affiliate_code || "—"}</td>
                <td className="px-4 py-3" style={{ fontSize: 13, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>{w.source_page || "—"}</td>
                <td className="px-4 py-3" style={{ fontSize: 13, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>{w.created_date ? format(new Date(w.created_date), "d MMM yyyy") : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}