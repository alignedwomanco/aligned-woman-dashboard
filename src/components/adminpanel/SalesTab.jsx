import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import TabHeader from "./TabHeader";
import { format } from "date-fns";

const STATUS_COLOR = { completed: "#16a34a", pending: "#d97706", refunded: "#6366f1", failed: "#dc2626" };

export default function SalesTab() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRegion, setFilterRegion] = useState("");
  const [filterAffiliate, setFilterAffiliate] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data: sales = [], isLoading } = useQuery({ queryKey: ["admin-sales-full"], queryFn: () => base44.entities.Sale.list("-created_date", 500) });

  const filtered = sales.filter(s => {
    if (filterStatus !== "all" && s.status !== filterStatus) return false;
    if (filterRegion && !s.region?.toLowerCase().includes(filterRegion.toLowerCase())) return false;
    if (filterAffiliate && !s.affiliate_code?.toLowerCase().includes(filterAffiliate.toLowerCase())) return false;
    if (dateFrom && new Date(s.created_date) < new Date(dateFrom)) return false;
    if (dateTo && new Date(s.created_date) > new Date(dateTo)) return false;
    return true;
  });

  const totalFiltered = filtered.filter(s => s.status === "completed").reduce((sum, s) => sum + (s.amount || 0), 0);

  const exportCSV = () => {
    const headers = ["Date", "Buyer Name", "Buyer Email", "Amount", "Currency", "Region", "Type", "Status", "Affiliate Code"];
    const rows = filtered.map(s => [
      s.created_date ? format(new Date(s.created_date), "yyyy-MM-dd") : "",
      s.buyer_name || "", s.buyer_email || "",
      s.amount || 0, s.currency || "", s.region || "",
      s.purchase_type || "", s.status || "", s.affiliate_code || ""
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "sales.csv"; a.click();
  };

  return (
    <div>
      <TabHeader
        title="Sales"
        subtitle={`${filtered.length} records — $${totalFiltered.toLocaleString()} revenue (completed)`}
        action={<button onClick={exportCSV} className="px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "#6B1B3D" }}>Export CSV</button>}
      />

      <div className="flex flex-wrap gap-3 mb-6">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "rgba(107,27,61,0.2)" }}>
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="refunded">Refunded</option>
          <option value="failed">Failed</option>
        </select>
        <input placeholder="Filter by region…" value={filterRegion} onChange={e => setFilterRegion(e.target.value)} className="px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "rgba(107,27,61,0.2)" }} />
        <input placeholder="Filter by affiliate…" value={filterAffiliate} onChange={e => setFilterAffiliate(e.target.value)} className="px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "rgba(107,27,61,0.2)" }} />
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "rgba(107,27,61,0.2)" }} />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "rgba(107,27,61,0.2)" }} />
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid rgba(107,27,61,0.1)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#FAF5F3" }}>
                {["Date", "Buyer", "Email", "Amount", "Region", "Type", "Affiliate", "Status"].map(h => (
                  <th key={h} className="px-4 py-3 text-left" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#C4866C" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>
              ) : filtered.map(s => (
                <tr key={s.id} className="border-t" style={{ borderColor: "rgba(107,27,61,0.06)" }}>
                  <td className="px-4 py-3 text-sm text-gray-500">{s.created_date ? format(new Date(s.created_date), "dd MMM yy") : "—"}</td>
                  <td className="px-4 py-3 text-sm font-medium">{s.buyer_name || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.buyer_email}</td>
                  <td className="px-4 py-3 text-sm font-semibold">{s.currency || "$"}{s.amount?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.region || "—"}</td>
                  <td className="px-4 py-3 text-sm capitalize text-gray-600">{s.purchase_type || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.affiliate_code || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ background: `${STATUS_COLOR[s.status]}20`, color: STATUS_COLOR[s.status] }}>{s.status}</span>
                  </td>
                </tr>
              ))}
              {!isLoading && filtered.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No results</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}