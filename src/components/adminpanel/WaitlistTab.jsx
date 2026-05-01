import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import TabHeader from "./TabHeader";
import { format } from "date-fns";

export default function WaitlistTab() {
  const [search, setSearch] = useState("");
  const { data: waitlist = [], isLoading } = useQuery({ queryKey: ["admin-waitlist"], queryFn: () => base44.entities.WaitlistSignup.list("-created_date", 500) });

  const filtered = waitlist.filter(w =>
    w.email?.toLowerCase().includes(search.toLowerCase()) ||
    w.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    w.last_name?.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const headers = ["Date", "First Name", "Last Name", "Email", "Country", "Affiliate Code", "Source Page"];
    const rows = filtered.map(w => [
      w.created_date ? format(new Date(w.created_date), "yyyy-MM-dd") : "",
      w.first_name || "", w.last_name || "", w.email || "",
      w.country || "", w.affiliate_code || "", w.source_page || ""
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "waitlist.csv"; a.click();
  };

  return (
    <div>
      <TabHeader
        title="Waitlist"
        subtitle={`${filtered.length} signups`}
        action={<button onClick={exportCSV} className="px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "#6B1B3D" }}>Export CSV</button>}
      />

      <div className="mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…" className="w-full max-w-sm px-4 py-2 rounded-lg border text-sm" style={{ borderColor: "rgba(107,27,61,0.2)" }} />
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid rgba(107,27,61,0.1)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#FAF5F3" }}>
                {["Date", "Name", "Email", "Country", "Affiliate", "Source"].map(h => (
                  <th key={h} className="px-4 py-3 text-left" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#C4866C" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>
              ) : filtered.map(w => (
                <tr key={w.id} className="border-t" style={{ borderColor: "rgba(107,27,61,0.06)" }}>
                  <td className="px-4 py-3 text-sm text-gray-500">{w.created_date ? format(new Date(w.created_date), "dd MMM yy") : "—"}</td>
                  <td className="px-4 py-3 text-sm font-medium">{[w.first_name, w.last_name].filter(Boolean).join(" ") || "—"}</td>
                  <td className="px-4 py-3 text-sm">{w.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{w.country || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{w.affiliate_code || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{w.source_page || "—"}</td>
                </tr>
              ))}
              {!isLoading && filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No results</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}