import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import TabHeader from "./TabHeader";

const EMPTY = { name: "", email: "", commission_percentage: 20, unique_code: "", total_sales: 0, total_commission: 0 };

export default function AffiliatesTab() {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const qc = useQueryClient();

  const { data: affiliates = [] } = useQuery({ queryKey: ["admin-affiliates"], queryFn: () => base44.entities.Affiliate.list() });

  const save = useMutation({
    mutationFn: () => editing === "new"
      ? base44.entities.Affiliate.create(form)
      : base44.entities.Affiliate.update(editing, form),
    onSuccess: () => { qc.invalidateQueries(["admin-affiliates"]); setEditing(null); setForm(EMPTY); },
  });

  const del = useMutation({
    mutationFn: id => base44.entities.Affiliate.delete(id),
    onSuccess: () => qc.invalidateQueries(["admin-affiliates"]),
  });

  const openEdit = (a) => { setEditing(a.id); setForm({ ...EMPTY, ...a }); };

  return (
    <div>
      <TabHeader
        title="Affiliates"
        subtitle="Manage affiliate partners and commissions"
        action={
          <button onClick={() => { setEditing("new"); setForm(EMPTY); }} className="px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "#6B1B3D" }}>
            + Add Affiliate
          </button>
        }
      />

      {editing && (
        <div className="mb-8 rounded-xl p-6" style={{ background: "#fff", border: "1px solid rgba(107,27,61,0.15)" }}>
          <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 22, color: "#6B1B3D", marginBottom: 16 }}>
            {editing === "new" ? "Add Affiliate" : "Edit Affiliate"}
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[["Name", "name"], ["Email", "email"], ["Unique Code", "unique_code"]].map(([label, field]) => (
              <div key={field}>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#6B1B3D" }}>{label}</label>
                <input value={form[field] || ""} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "rgba(107,27,61,0.2)" }} />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "#6B1B3D" }}>Commission %</label>
              <input type="number" value={form.commission_percentage || ""} onChange={e => setForm(f => ({ ...f, commission_percentage: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "rgba(107,27,61,0.2)" }} />
            </div>
          </div>
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
                {["Name", "Code", "Commission %", "Email", "Total Sales", "Total Commission", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#C4866C" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {affiliates.map(a => (
                <tr key={a.id} className="border-t" style={{ borderColor: "rgba(107,27,61,0.06)" }}>
                  <td className="px-4 py-3 text-sm font-medium">{a.name}</td>
                  <td className="px-4 py-3"><code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{a.unique_code}</code></td>
                  <td className="px-4 py-3 text-sm">{a.commission_percentage}%</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{a.email || "—"}</td>
                  <td className="px-4 py-3 text-sm">{a.total_sales || 0}</td>
                  <td className="px-4 py-3 text-sm font-semibold" style={{ color: "#6B1B3D" }}>${(a.total_commission || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => openEdit(a)} className="text-xs px-3 py-1 rounded" style={{ background: "#F5E6E0", color: "#6B1B3D" }}>Edit</button>
                    <button onClick={() => del.mutate(a.id)} className="text-xs px-3 py-1 rounded bg-red-50 text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
              {affiliates.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No affiliates yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}