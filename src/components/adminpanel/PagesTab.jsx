import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import TabHeader from "./TabHeader";
import { format } from "date-fns";

const EMPTY = { title: "", slug: "", category: "Awareness", excerpt: "", content: "", image_url: "", published_date: "", status: "coming_soon" };
const CATEGORIES = ["Awareness", "Liberation", "Intention", "Vision", "Embodiment", "Power & Money"];
const STATUS_COLORS = { live: "#16a34a", coming_soon: "#d97706" };

export default function PagesTab() {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const qc = useQueryClient();

  const { data: posts = [] } = useQuery({ queryKey: ["admin-posts"], queryFn: () => base44.entities.BlogPost.list("-created_date") });

  const save = useMutation({
    mutationFn: () => editing === "new"
      ? base44.entities.BlogPost.create(form)
      : base44.entities.BlogPost.update(editing, form),
    onSuccess: () => { qc.invalidateQueries(["admin-posts"]); setEditing(null); setForm(EMPTY); },
  });

  const del = useMutation({
    mutationFn: id => base44.entities.BlogPost.delete(id),
    onSuccess: () => qc.invalidateQueries(["admin-posts"]),
  });

  const openEdit = (p) => { setEditing(p.id); setForm({ ...EMPTY, ...p }); };

  const F = ({ label, field }) => (
    <div>
      <label className="block text-xs font-semibold mb-1" style={{ color: "#6B1B3D" }}>{label}</label>
      <input value={form[field] || ""} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "rgba(107,27,61,0.2)" }} />
    </div>
  );

  return (
    <div>
      <TabHeader
        title="Blog Posts"
        subtitle="Manage published and upcoming articles"
        action={<button onClick={() => { setEditing("new"); setForm(EMPTY); }} className="px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "#6B1B3D" }}>+ New Post</button>}
      />

      {editing && (
        <div className="mb-8 rounded-xl p-6" style={{ background: "#fff", border: "1px solid rgba(107,27,61,0.15)" }}>
          <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 22, color: "#6B1B3D", marginBottom: 16 }}>{editing === "new" ? "New Post" : "Edit Post"}</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <F label="Title" field="title" />
            <F label="Slug (URL)" field="slug" />
            <F label="Image URL" field="image_url" />
            <F label="Published Date" field="published_date" />
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "#6B1B3D" }}>Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "rgba(107,27,61,0.2)" }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "#6B1B3D" }}>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "rgba(107,27,61,0.2)" }}>
                <option value="live">Live</option>
                <option value="coming_soon">Coming Soon</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold mb-1" style={{ color: "#6B1B3D" }}>Excerpt</label>
            <textarea value={form.excerpt || ""} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "rgba(107,27,61,0.2)" }} />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold mb-1" style={{ color: "#6B1B3D" }}>Content (HTML/Markdown)</label>
            <textarea value={form.content || ""} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={12} className="w-full px-3 py-2 rounded-lg border text-sm font-mono" style={{ borderColor: "rgba(107,27,61,0.2)" }} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => save.mutate()} className="px-5 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "#6B1B3D" }}>Save</button>
            <button onClick={() => { setEditing(null); setForm(EMPTY); }} className="px-5 py-2 rounded-lg text-sm" style={{ border: "1px solid rgba(107,27,61,0.2)" }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid rgba(107,27,61,0.1)" }}>
        <table className="w-full">
          <thead><tr style={{ background: "#FAF5F3" }}>{["Title","Category","Status","Date","Actions"].map(h=><th key={h} className="px-4 py-3 text-left" style={{fontSize:11,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"#C4866C"}}>{h}</th>)}</tr></thead>
          <tbody>
            {posts.map(p => (
              <tr key={p.id} className="border-t" style={{ borderColor: "rgba(107,27,61,0.06)" }}>
                <td className="px-4 py-3 text-sm font-medium">{p.title}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{p.category}</td>
                <td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ background: `${STATUS_COLORS[p.status]}20`, color: STATUS_COLORS[p.status] }}>{p.status?.replace("_", " ")}</span></td>
                <td className="px-4 py-3 text-sm text-gray-500">{p.published_date || (p.created_date ? format(new Date(p.created_date), "dd MMM yy") : "—")}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEdit(p)} className="text-xs px-3 py-1 rounded" style={{ background: "#F5E6E0", color: "#6B1B3D" }}>Edit</button>
                  <button onClick={() => del.mutate(p.id)} className="text-xs px-3 py-1 rounded bg-red-50 text-red-600">Delete</button>
                </td>
              </tr>
            ))}
            {posts.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No posts yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}