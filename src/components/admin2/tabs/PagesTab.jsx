import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { SectionLabel } from "@/components/admin2/AdminCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

const CATS = ["Awareness", "Liberation", "Intention", "Vision", "Embodiment", "Power & Money"];
const EMPTY = { title: "", slug: "", category: "Awareness", excerpt: "", content: "", image_url: "", status: "coming_soon", published_date: "" };

function toSlug(str) { return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

export default function PagesTab() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const qc = useQueryClient();

  const { data: posts = [] } = useQuery({ queryKey: ["admin-blog"], queryFn: () => base44.entities.BlogPost.list("-created_date") });

  const save = useMutation({
    mutationFn: () => editing ? base44.entities.BlogPost.update(editing.id, form) : base44.entities.BlogPost.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-blog"] }); setOpen(false); },
  });

  const remove = useMutation({
    mutationFn: id => base44.entities.BlogPost.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-blog"] }),
  });

  const openEdit = p => { setEditing(p); setForm(p); setOpen(true); };
  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <SectionLabel>Blog Posts</SectionLabel>
        <Button onClick={openNew} style={{ background: "#6B1B3D", color: "#fff", borderRadius: 100, fontSize: 12, fontFamily: "Montserrat, sans-serif" }}>
          <Plus className="w-4 h-4 mr-2" /> New Post
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E0DC] overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-[#F0E8E4]">
              {["Title", "Category", "Slug", "Status", "Published", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "#C4866C", fontFamily: "Montserrat, sans-serif" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {posts.map(p => (
              <tr key={p.id} className="border-b border-[#F8F3F1] hover:bg-[#FDF9F8]">
                <td className="px-4 py-3" style={{ fontSize: 13, fontWeight: 600, fontFamily: "Montserrat, sans-serif" }}>{p.title}</td>
                <td className="px-4 py-3" style={{ fontSize: 13, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>{p.category}</td>
                <td className="px-4 py-3"><span className="text-xs font-mono text-[#6B1B3D] bg-[#FDF5F3] px-2 py-1 rounded">{p.slug}</span></td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ background: p.status === "live" ? "#F0FDF4" : "#F3F4F6", color: p.status === "live" ? "#22C55E" : "#9CA3AF", fontFamily: "Montserrat, sans-serif" }}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3" style={{ fontSize: 13, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>{p.published_date || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="text-[#6B1B3D] hover:opacity-70"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => remove.mutate(p.id)} className="text-red-400 hover:opacity-70"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Post" : "New Post"}</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <label className="block mb-1" style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>Title</label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: toSlug(e.target.value) }))} />
            </div>
            <div>
              <label className="block mb-1" style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>Slug (auto-generated)</label>
              <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1" style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>Category</label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="block mb-1" style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>Status</label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="coming_soon">Coming Soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block mb-1" style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>Cover Image URL</label>
              <Input value={form.image_url || ""} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
            </div>
            <div>
              <label className="block mb-1" style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>Excerpt</label>
              <textarea value={form.excerpt || ""} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded-xl p-3 text-sm" />
            </div>
            <div>
              <label className="block mb-1" style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>Content</label>
              <textarea value={form.content || ""} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={10} className="w-full border border-gray-200 rounded-xl p-3 text-sm" />
            </div>
            <Button onClick={() => save.mutate()} disabled={save.isPending} style={{ background: "#6B1B3D", color: "#fff", width: "100%", borderRadius: 100 }}>
              {save.isPending ? "Saving..." : "Save Post"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}