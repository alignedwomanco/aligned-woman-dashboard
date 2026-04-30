import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { SectionLabel } from "@/components/admin2/AdminCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Copy } from "lucide-react";

const EMPTY = { name: "", email: "", commission_percentage: 20, unique_code: "" };

export default function AffiliatesTab() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const qc = useQueryClient();

  const { data: affiliates = [] } = useQuery({ queryKey: ["admin-affiliates-full"], queryFn: () => base44.entities.Affiliate.list() });

  const save = useMutation({
    mutationFn: () => editing ? base44.entities.Affiliate.update(editing.id, form) : base44.entities.Affiliate.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-affiliates-full"] }); setOpen(false); },
  });

  const remove = useMutation({
    mutationFn: id => base44.entities.Affiliate.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-affiliates-full"] }),
  });

  const openEdit = a => { setEditing(a); setForm(a); setOpen(true); };
  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };

  const domain = window.location.origin;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <SectionLabel>Affiliates</SectionLabel>
        <Button onClick={openNew} style={{ background: "#6B1B3D", color: "#fff", borderRadius: 100, fontSize: 12, fontFamily: "Montserrat, sans-serif" }}>
          <Plus className="w-4 h-4 mr-2" /> Add Affiliate
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E0DC] overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-[#F0E8E4]">
              {["Name", "Code", "Commission %", "Email", "Total Sales", "Total Commission", "Tracking Link", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "#C4866C", fontFamily: "Montserrat, sans-serif" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {affiliates.map(a => (
              <tr key={a.id} className="border-b border-[#F8F3F1] hover:bg-[#FDF9F8]">
                <td className="px-4 py-3" style={{ fontSize: 13, fontWeight: 600, fontFamily: "Montserrat, sans-serif" }}>{a.name}</td>
                <td className="px-4 py-3"><span className="px-2 py-1 bg-[#FDF5F3] rounded text-xs font-mono text-[#6B1B3D]">{a.unique_code}</span></td>
                <td className="px-4 py-3" style={{ fontSize: 13, fontFamily: "Montserrat, sans-serif" }}>{a.commission_percentage}%</td>
                <td className="px-4 py-3" style={{ fontSize: 13, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>{a.email}</td>
                <td className="px-4 py-3" style={{ fontSize: 13, fontFamily: "Montserrat, sans-serif" }}>{a.total_sales || 0}</td>
                <td className="px-4 py-3" style={{ fontSize: 13, fontWeight: 600, color: "#6B1B3D", fontFamily: "Montserrat, sans-serif" }}>R{(a.total_commission || 0).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => navigator.clipboard.writeText(`${domain}/?aff=${a.unique_code}`)}
                    className="flex items-center gap-1 text-[#6B1B3D] hover:opacity-70"
                    style={{ fontSize: 11, fontFamily: "Montserrat, sans-serif" }}
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(a)} className="text-[#6B1B3D] hover:opacity-70"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => remove.mutate(a.id)} className="text-red-400 hover:opacity-70"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Affiliate" : "Add Affiliate"}</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            {[["name", "Name"], ["email", "Email"], ["unique_code", "Unique Code (lowercase slug)"]].map(([k, l]) => (
              <div key={k}>
                <label className="block mb-1" style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>{l}</label>
                <Input value={form[k] || ""} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label className="block mb-1" style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>Commission %</label>
              <Input type="number" value={form.commission_percentage} onChange={e => setForm(f => ({ ...f, commission_percentage: Number(e.target.value) }))} />
            </div>
            <Button onClick={() => save.mutate()} disabled={save.isPending} style={{ background: "#6B1B3D", color: "#fff", width: "100%", borderRadius: 100 }}>
              {save.isPending ? "Saving..." : "Save Affiliate"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}