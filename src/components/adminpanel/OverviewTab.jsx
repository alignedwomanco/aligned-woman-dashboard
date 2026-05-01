import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import TabHeader from "./TabHeader";
import StatCard from "./StatCard";
import { format } from "date-fns";

export default function OverviewTab() {
  const { data: sales = [] } = useQuery({ queryKey: ["admin-sales"], queryFn: () => base44.entities.Sale.list("-created_date", 200) });
  const { data: waitlist = [] } = useQuery({ queryKey: ["admin-waitlist"], queryFn: () => base44.entities.WaitlistSignup.list() });
  const { data: affiliates = [] } = useQuery({ queryKey: ["admin-affiliates"], queryFn: () => base44.entities.Affiliate.list() });
  const { data: carts = [] } = useQuery({ queryKey: ["admin-carts"], queryFn: () => base44.entities.AbandonedCart.list() });

  const completedSales = sales.filter(s => s.status === "completed");
  const totalRevenue = completedSales.reduce((sum, s) => sum + (s.amount || 0), 0);
  const recentSales = [...sales].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 10);

  const statusColor = { completed: "#16a34a", pending: "#d97706", refunded: "#6366f1", failed: "#dc2626" };

  return (
    <div>
      <TabHeader title="Overview" subtitle="Platform health at a glance" />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <StatCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} sub="completed sales only" />
        <StatCard label="Completed Sales" value={completedSales.length} />
        <StatCard label="Waitlist Signups" value={waitlist.length} />
        <StatCard label="Affiliates" value={affiliates.length} />
        <StatCard label="Abandoned Carts" value={carts.length} />
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid rgba(107,27,61,0.1)" }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(107,27,61,0.08)" }}>
          <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 22, color: "#6B1B3D" }}>Recent Sales</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#FAF5F3" }}>
                {["Buyer", "Email", "Amount", "Region", "Type", "Status", "Date"].map(h => (
                  <th key={h} className="px-4 py-3 text-left" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#C4866C" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentSales.map((s) => (
                <tr key={s.id} className="border-t" style={{ borderColor: "rgba(107,27,61,0.06)" }}>
                  <td className="px-4 py-3 text-sm font-medium">{s.buyer_name || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.buyer_email}</td>
                  <td className="px-4 py-3 text-sm font-semibold">{s.currency || "$"}{s.amount?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.region || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{s.purchase_type || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ background: `${statusColor[s.status]}20`, color: statusColor[s.status] }}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{s.created_date ? format(new Date(s.created_date), "dd MMM yyyy") : "—"}</td>
                </tr>
              ))}
              {recentSales.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No sales yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}