import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { SectionLabel } from "@/components/admin2/AdminCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";

const EMPTY = { name: "", title: "", bio: "", profile_picture: "", isPublished: true };

export default function ExpertsTab() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const qc = useQueryClient();

  const { data: experts = [] } = useQuery({ queryKey: ["admin-experts"], queryFn: () => base44.entities.Expert.list() });
  const { data: categories = [] } = useQuery({ queryKey: ["admin-expert-cats"], queryFn: () => base44.entities.ExpertCategory.list() });

  const save = useMutation({
    mutationFn: () => editing ? base44.entities.Expert.update(editing.id, form) : base44.entities.Expert.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-experts"] }); setOpen(false); },
  });

  const remove = useMutation({
    mutationFn: id => base44.entities.Expert.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-experts"] }),
  });

  const togglePublished = useMutation({
    mutationFn: ({ id, val }) => base44.entities.Expert.update(id, { isPublished: val }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-experts"] }),
  });

  const openEdit = e => { setEditing(e); setForm(e); setOpen(true); };
  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <SectionLabel>Experts</SectionLabel>
        <Button onClick={openNew} style={{ background: "#6B1B3D", color: "#fff", borderRadius: 100, fontSize: 12, fontFamily: "Montserrat, sans-serif" }}>
          <Plus className="w-4 h-4 mr-2" /> Add Expert
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E0DC] overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-[#F0E8E4]">
              {["Name", "Title", "Category", "Published", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "#C4866C", fontFamily: "Montserrat, sans-serif" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {experts.map(e => (
              <tr key={e.id} className="border-b border-[#F8F3F1] hover:bg-[#FDF9F8]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {e.profile_picture && <img src={e.profile_picture} alt="" className="w-8 h-8 rounded-full object-cover" />}
                    <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "Montserrat, sans-serif" }}>{e.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3" style={{ fontSize: 13, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>{e.title}</td>
                <td className="px-4 py-3" style={{ fontSize: 13, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>
                  {categories.find(c => c.id === e.category)?.name || e.category || "—"}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => togglePublished.mutate({ id: e.id, val: !e.isPublished })}
                    className="w-10 h-5 rounded-full transition-colors relative"
                    style={{ background: e.isPublished ? "#22C55E" : "#D1D5DB" }}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${e.isPublished ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(e)} className="text-[#6B1B3D] hover:opacity-70"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => remove.mutate(e.id)} className="text-red-400 hover:opacity-70"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Expert" : "Add Expert"}</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            {[["name", "Name"], ["title", "Title"], ["profile_picture", "Profile Picture URL"]].map(([k, l]) => (
              <div key={k}>
                <label className="block mb-1" style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>{l}</label>
                <Input value={form[k] || ""} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label className="block mb-1" style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>Bio</label>
              <textarea value={form.bio || ""} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={4} className="w-full border border-gray-200 rounded-xl p-3 text-sm" />
            </div>
            <Button onClick={() => save.mutate()} disabled={save.isPending} style={{ background: "#6B1B3D", color: "#fff", width: "100%", borderRadius: 100 }}>
              {save.isPending ? "Saving..." : "Save Expert"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}