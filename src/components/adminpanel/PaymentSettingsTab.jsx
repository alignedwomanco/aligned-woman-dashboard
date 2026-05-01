import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import TabHeader from "./TabHeader";

const EMPTY = { region_name: "", currency_code: "", currency_symbol: "", price_full: "", price_payment_plan: "", payment_plan_months: "", payment_gateway: "stripe", stripe_price_id: "", stripe_plan_price_id: "", payfast_item_name: "", is_active: true };

export default function PaymentSettingsTab() {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const qc = useQueryClient();

  const { data: pricing = [] } = useQuery({ queryKey: ["admin-pricing"], queryFn: () => base44.entities.RegionalPricing.list() });

  const save = useMutation({
    mutationFn: () => editing === "new"
      ? base44.entities.RegionalPricing.create(form)
      : base44.entities.RegionalPricing.update(editing, form),
    onSuccess: () => { qc.invalidateQueries(["admin-pricing"]); setEditing(null); setForm(EMPTY); },
  });

  const del = useMutation({
    mutationFn: id => base44.entities.RegionalPricing.delete(id),
    onSuccess: () => qc.invalidateQueries(["admin-pricing"]),
  });

  const openEdit = (p) => { setEditing(p.id); setForm({ ...EMPTY, ...p }); };

  const Field = ({ label, field, type = "text" }) => (
    <div>
      <label className="block text-xs font-semibold mb-1" style={{ color: "#6B1B3D" }}>{label}</label>
      <input
        type={type}
        value={form[field] ?? ""}
        onChange={e => setForm(f => ({ ...f, [field]: type === "number" ? Number(e.target.value) : e.target.value }))}
        className="w-full px-3 py-2 rounded-lg border text-sm"
        style={{ borderColor: "rgba(107,27,61,0.2)" }}
      />
    </div>
  );

  return (
    <div>
      <TabHeader
        title="Payment Settings"
        subtitle="Manage regional pricing configurations"
        action={
          <button onClick={() => { setEditing("new"); setForm(EMPTY); }} className="px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "#6B1B3D" }}>
            + Add Region
          </button>
        }
      />

      {editing && (
        <div className="mb-8 rounded-xl p-6" style={{ background: "#fff", border: "1px solid rgba(107,27,61,0.15)" }}>
          <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 22, color: "#6B1B3D", marginBottom: 16 }}>
            {editing === "new" ? "Add Region" : "Edit Region"}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <Field label="Region Name" field="region_name" />
            <Field label="Currency Code" field="currency_code" />
            <Field label="Currency Symbol" field="currency_symbol" />
            <Field label="Full Price" field="price_full" type="number" />
            <Field label="Payment Plan Price" field="price_payment_plan" type="number" />
            <Field label="Plan Months" field="payment_plan_months" type="number" />
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "#6B1B3D" }}>Payment Gateway</label>
              <select value={form.payment_gateway} onChange={e => setForm(f => ({ ...f, payment_gateway: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "rgba(107,27,61,0.2)" }}>
                <option value="stripe">Stripe</option>
                <option value="payfast">PayFast</option>
              </select>
            </div>
            <Field label="Stripe Price ID" field="stripe_price_id" />
            <Field label="Stripe Plan Price ID" field="stripe_plan_price_id" />
            <Field label="PayFast Item Name" field="payfast_item_name" />
          </div>
          <label className="flex items-center gap-2 mb-4 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
            Active
          </label>
          <div className="flex gap-3">
            <button onClick={() => save.mutate()} className="px-5 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "#6B1B3D" }}>Save</button>
            <button onClick={() => { setEditing(null); setForm(EMPTY); }} className="px-5 py-2 rounded-lg text-sm" style={{ border: "1px solid rgba(107,27,61,0.2)" }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid rgba(107,27,61,0.1)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#FAF5F3" }}>
                {["Region", "Currency", "Full Price", "Plan Price", "Gateway", "Active", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#C4866C" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pricing.map(p => (
                <tr key={p.id} className="border-t" style={{ borderColor: "rgba(107,27,61,0.06)" }}>
                  <td className="px-4 py-3 text-sm font-medium">{p.region_name}</td>
                  <td className="px-4 py-3 text-sm">{p.currency_symbol} {p.currency_code}</td>
                  <td className="px-4 py-3 text-sm">{p.currency_symbol}{p.price_full?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">{p.currency_symbol}{p.price_payment_plan?.toLocaleString()} x{p.payment_plan_months}</td>
                  <td className="px-4 py-3 text-sm capitalize">{p.payment_gateway}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{p.is_active ? "Active" : "Inactive"}</span></td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => openEdit(p)} className="text-xs px-3 py-1 rounded" style={{ background: "#F5E6E0", color: "#6B1B3D" }}>Edit</button>
                    <button onClick={() => del.mutate(p.id)} className="text-xs px-3 py-1 rounded bg-red-50 text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
              {pricing.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No pricing regions yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}