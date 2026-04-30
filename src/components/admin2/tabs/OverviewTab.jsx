import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { SectionLabel, StatCard } from "@/components/admin2/AdminCard";
import { DollarSign, ShoppingBag, Users, Share2, ShoppingCart } from "lucide-react";
import { format } from "date-fns";

export default function OverviewTab() {
  const { data: sales = [] } = useQuery({ queryKey: ["admin-sales"], queryFn: () => base44.entities.Sale.list("-created_date", 50) });
  const { data: waitlist = [] } = useQuery({ queryKey: ["admin-waitlist"], queryFn: () => base44.entities.WaitlistSignup.list() });
  const { data: affiliates = [] } = useQuery({ queryKey: ["admin-affiliates"], queryFn: () => base44.entities.Affiliate.list() });
  const { data: carts = [] } = useQuery({ queryKey: ["admin-carts"], queryFn: () => base44.entities.AbandonedCart.list() });

  const completedSales = sales.filter(s => s.status === "completed");
  const totalRevenue = completedSales.reduce((sum, s) => sum + (s.amount || 0), 0);

  return (
    <div>
      <SectionLabel>Platform Overview</SectionLabel>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <StatCard label="Total Revenue" value={`R${totalRevenue.toLocaleString()}`} icon={DollarSign} />
        <StatCard label="Completed Sales" value={completedSales.length} icon={ShoppingBag} iconBg="#F0FDF4" iconColor="#22C55E" />
        <StatCard label="Waitlist Signups" value={waitlist.length} icon={Users} iconBg="#EFF6FF" iconColor="#3B82F6" />
        <StatCard label="Affiliates" value={affiliates.length} icon={Share2} iconBg="#FDF4FF" iconColor="#A855F7" />
        <StatCard label="Abandoned Carts" value={carts.length} icon={ShoppingCart} iconBg="#FFF7ED" iconColor="#F59E0B" />
      </div>

      <SectionLabel>Recent Activity</SectionLabel>

      <div className="bg-white rounded-2xl border border-[#E8E0DC] overflow-hidden">
        {completedSales.length === 0 ? (
          <p className="p-8 text-center italic" style={{ color: "#9CA3AF", fontFamily: "Montserrat, sans-serif" }}>No sales recorded yet.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F0E8E4]">
                {["Date", "Buyer", "Amount", "Region", "Affiliate"].map(h => (
                  <th key={h} className="text-left px-5 py-3" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "#C4866C", fontFamily: "Montserrat, sans-serif" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {completedSales.slice(0, 10).map((sale, i) => (
                <tr key={sale.id} className="border-b border-[#F8F3F1] hover:bg-[#FDF9F8] transition-colors">
                  <td className="px-5 py-3" style={{ fontSize: 13, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>
                    {sale.created_date ? format(new Date(sale.created_date), "d MMM yyyy") : "—"}
                  </td>
                  <td className="px-5 py-3" style={{ fontSize: 13, color: "#1a0510", fontFamily: "Montserrat, sans-serif" }}>{sale.buyer_email || sale.buyer_name || "—"}</td>
                  <td className="px-5 py-3" style={{ fontSize: 13, fontWeight: 600, color: "#6B1B3D", fontFamily: "Montserrat, sans-serif" }}>
                    {sale.currency_symbol || "R"}{(sale.amount || 0).toLocaleString()}
                  </td>
                  <td className="px-5 py-3" style={{ fontSize: 13, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>{sale.region || "—"}</td>
                  <td className="px-5 py-3" style={{ fontSize: 13, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>{sale.affiliate_code || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}