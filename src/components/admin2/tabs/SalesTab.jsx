import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { SectionLabel, StatCard } from "@/components/admin2/AdminCard";
import { DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

function exportCSV(data) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const csv = [keys.join(","), ...data.map(row => keys.map(k => JSON.stringify(row[k] ?? "")).join(","))].join("\n");
  const a = document.createElement("a"); a.href = "data:text/csv," + encodeURIComponent(csv); a.download = "sales.csv"; a.click();
}

export default function SalesTab() {
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: sales = [] } = useQuery({ queryKey: ["admin-sales-all"], queryFn: () => base44.entities.Sale.list("-created_date", 200) });

  const filtered = sales.filter(s => statusFilter === "all" || s.status === statusFilter);
  const completed = sales.filter(s => s.status === "completed");
  const totalRevenue = completed.reduce((sum, s) => sum + (s.amount || 0), 0);
  const avg = completed.length ? Math.round(totalRevenue / completed.length) : 0;

  return (
    <div>
      <SectionLabel>Sales</SectionLabel>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Revenue" value={`R${totalRevenue.toLocaleString()}`} icon={DollarSign} />
        <StatCard label="Completed Sales" value={completed.length} icon={ShoppingBag} iconBg="#F0FDF4" iconColor="#22C55E" />
        <StatCard label="Avg Order Value" value={`R${avg.toLocaleString()}`} icon={TrendingUp} iconBg="#EFF6FF" iconColor="#3B82F6" />
      </div>

      <div className="flex items-center gap-3 mb-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <button onClick={() => exportCSV(filtered)} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#6B1B3D", background: "none", border: "1px solid #6B1B3D", borderRadius: 100, padding: "6px 16px", cursor: "pointer", fontFamily: "Montserrat, sans-serif" }}>
          EXPORT CSV →
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E0DC] overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-[#F0E8E4]">
              {["Date", "Buyer", "Amount", "Currency", "Region", "Affiliate", "Status", "Gateway"].map(h => (
                <th key={h} className="text-left px-4 py-3" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "#C4866C", fontFamily: "Montserrat, sans-serif" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-5 py-8 text-center italic" style={{ color: "#9CA3AF" }}>No sales found.</td></tr>
            ) : filtered.map(s => (
              <tr key={s.id} className="border-b border-[#F8F3F1] hover:bg-[#FDF9F8]">
                <td className="px-4 py-3" style={{ fontSize: 13, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>{s.created_date ? format(new Date(s.created_date), "d MMM yyyy") : "—"}</td>
                <td className="px-4 py-3" style={{ fontSize: 13, fontFamily: "Montserrat, sans-serif" }}>{s.buyer_email || s.buyer_name || "—"}</td>
                <td className="px-4 py-3" style={{ fontSize: 13, fontWeight: 600, color: "#6B1B3D", fontFamily: "Montserrat, sans-serif" }}>{s.currency_symbol || ""}{(s.amount || 0).toLocaleString()}</td>
                <td className="px-4 py-3" style={{ fontSize: 13, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>{s.currency || "—"}</td>
                <td className="px-4 py-3" style={{ fontSize: 13, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>{s.region || "—"}</td>
                <td className="px-4 py-3" style={{ fontSize: 13, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>{s.affiliate_code || "—"}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ background: s.status === "completed" ? "#F0FDF4" : s.status === "failed" ? "#FEF2F2" : "#FFF7ED", color: s.status === "completed" ? "#22C55E" : s.status === "failed" ? "#EF4444" : "#F59E0B", fontFamily: "Montserrat, sans-serif" }}>
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3" style={{ fontSize: 13, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>{s.payment_gateway || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}