import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { SectionLabel } from "@/components/admin2/AdminCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";

const EMPTY = { region_name: "", country_codes: "", currency_code: "", currency_symbol: "", price_full: "", display_price: "", price_payment_plan: "", payment_plan_months: "", payment_gateway: "stripe", stripe_price_id: "", stripe_plan_price_id: "", payfast_item_name: "", is_active: true };

export default function PaymentSettingsTab() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const qc = useQueryClient();

  const { data: regions = [] } = useQuery({ queryKey: ["admin-regions"], queryFn: () => base44.entities.RegionalPricing.list() });

  const save = useMutation({
    mutationFn: async () => {
      const data = { ...form, country_codes: form.country_codes.split(",").map(s => s.trim()).filter(Boolean), price_full: Number(form.price_full), price_payment_plan: Number(form.price_payment_plan), payment_plan_months: Number(form.payment_plan_months) };
      if (editing) return base44.entities.RegionalPricing.update(editing.id, data);
      return base44.entities.RegionalPricing.create(data);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-regions"] }); setOpen(false); setEditing(null); setForm(EMPTY); },
  });

  const remove = useMutation({
    mutationFn: id => base44.entities.RegionalPricing.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-regions"] }),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, val }) => base44.entities.RegionalPricing.update(id, { is_active: val }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-regions"] }),
  });

  const openEdit = (r) => { setEditing(r); setForm({ ...r, country_codes: (r.country_codes || []).join(", ") }); setOpen(true); };
  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <SectionLabel>Regional Pricing</SectionLabel>
        <Button onClick={openNew} style={{ background: "#6B1B3D", color: "#fff", borderRadius: 100, fontSize: 12, fontFamily: "Montserrat, sans-serif" }}>
          <Plus className="w-4 h-4 mr-2" /> Add Region
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E0DC] overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-[#F0E8E4]">
              {["Region", "Countries", "Currency", "Full Price", "Plan Price", "Months", "Gateway", "Active", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "#C4866C", fontFamily: "Montserrat, sans-serif" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {regions.map(r => (
              <tr key={r.id} className="border-b border-[#F8F3F1] hover:bg-[#FDF9F8]">
                <td className="px-4 py-3" style={{ fontSize: 13, fontWeight: 600, fontFamily: "Montserrat, sans-serif" }}>{r.region_name}</td>
                <td className="px-4 py-3" style={{ fontSize: 12, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>{(r.country_codes || []).join(", ")}</td>
                <td className="px-4 py-3" style={{ fontSize: 13, fontFamily: "Montserrat, sans-serif" }}>{r.currency_symbol} {r.currency_code}</td>
                <td className="px-4 py-3" style={{ fontSize: 13, fontWeight: 600, color: "#6B1B3D", fontFamily: "Montserrat, sans-serif" }}>{r.display_price}</td>
                <td className="px-4 py-3" style={{ fontSize: 13, fontFamily: "Montserrat, sans-serif" }}>{r.currency_symbol}{r.price_payment_plan}</td>
                <td className="px-4 py-3" style={{ fontSize: 13, fontFamily: "Montserrat, sans-serif" }}>{r.payment_plan_months}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full text-xs font-semibold uppercase" style={{ background: r.payment_gateway === "stripe" ? "#EFF6FF" : "#F0FDF4", color: r.payment_gateway === "stripe" ? "#3B82F6" : "#22C55E", fontFamily: "Montserrat, sans-serif" }}>
                    {r.payment_gateway}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive.mutate({ id: r.id, val: !r.is_active })}
                    className="w-10 h-5 rounded-full transition-colors relative"
                    style={{ background: r.is_active ? "#22C55E" : "#D1D5DB" }}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${r.is_active ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(r)} className="text-[#6B1B3D] hover:opacity-70"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => remove.mutate(r.id)} className="text-red-400 hover:opacity-70"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Region" : "Add Region"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 pt-2">
            {[
              ["region_name", "Region Name"], ["country_codes", "Country Codes (comma-sep)"],
              ["currency_code", "Currency Code"], ["currency_symbol", "Currency Symbol"],
              ["price_full", "Full Price"], ["display_price", "Display Price (e.g. R19,700)"],
              ["price_payment_plan", "Plan Price/Month"], ["payment_plan_months", "Plan Months"],
              ["stripe_price_id", "Stripe Price ID"], ["stripe_plan_price_id", "Stripe Plan Price ID"],
              ["payfast_item_name", "PayFast Item Name"],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="block mb-1" style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", letterSpacing: "0.08em", fontFamily: "Montserrat, sans-serif" }}>{label}</label>
                <Input value={form[key] || ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="text-sm" />
              </div>
            ))}
            <div>
              <label className="block mb-1" style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>Payment Gateway</label>
              <Select value={form.payment_gateway} onValueChange={v => setForm(f => ({ ...f, payment_gateway: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="payfast">PayFast</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={() => save.mutate()} disabled={save.isPending} style={{ background: "#6B1B3D", color: "#fff", width: "100%", marginTop: 16, borderRadius: 100 }}>
            {save.isPending ? "Saving..." : "Save Region"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}