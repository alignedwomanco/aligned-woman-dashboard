import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import TabHeader from "./TabHeader";

const EMPTY_EXPERT = { name: "", title: "", bio: "", profile_picture: "", specialties: [], isPublished: true, linked_user_email: "" };

export default function ExpertsTab() {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_EXPERT);
  const [specialtyInput, setSpecialtyInput] = useState("");
  const qc = useQueryClient();

  const { data: experts = [] } = useQuery({ queryKey: ["admin-experts"], queryFn: () => base44.entities.Expert.list() });

  const save = useMutation({
    mutationFn: () => editing === "new"
      ? base44.entities.Expert.create(form)
      : base44.entities.Expert.update(editing, form),
    onSuccess: () => { qc.invalidateQueries(["admin-experts"]); setEditing(null); setForm(EMPTY_EXPERT); },
  });

  const del = useMutation({
    mutationFn: id => base44.entities.Expert.delete(id),
    onSuccess: () => qc.invalidateQueries(["admin-experts"]),
  });

  const openEdit = (e) => { setEditing(e.id); setForm({ ...EMPTY_EXPERT, ...e }); };

  const addSpecialty = () => {
    if (specialtyInput.trim()) {
      setForm(f => ({ ...f, specialties: [...(f.specialties || []), specialtyInput.trim()] }));
      setSpecialtyInput("");
    }
  };

  return (
    <div>
      <TabHeader
        title="Experts"
        subtitle="Manage expert profiles"
        action={<button onClick={() => { setEditing("new"); setForm(EMPTY_EXPERT); }} className="px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "#6B1B3D" }}>+ Add Expert</button>}
      />

      {editing && (
        <div className="mb-8 rounded-xl p-6" style={{ background: "#fff", border: "1px solid rgba(107,27,61,0.15)" }}>
          <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 22, color: "#6B1B3D", marginBottom: 16 }}>{editing === "new" ? "Add Expert" : "Edit Expert"}</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[["Name", "name"], ["Title / Role", "title"], ["Profile Picture URL", "profile_picture"], ["Linked User Email", "linked_user_email"]].map(([label, field]) => (
              <div key={field}>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#6B1B3D" }}>{label}</label>
                <input value={form[field] || ""} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "rgba(107,27,61,0.2)" }} />
              </div>
            ))}
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold mb-1" style={{ color: "#6B1B3D" }}>Bio</label>
            <textarea value={form.bio || ""} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={4} className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "rgba(107,27,61,0.2)" }} />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold mb-1" style={{ color: "#6B1B3D" }}>Specialties</label>
            <div className="flex gap-2 mb-2">
              <input value={specialtyInput} onChange={e => setSpecialtyInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addSpecialty()} placeholder="Add specialty…" className="flex-1 px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "rgba(107,27,61,0.2)" }} />
              <button onClick={addSpecialty} className="px-3 py-2 rounded-lg text-white text-sm" style={{ background: "#6B1B3D" }}>Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(form.specialties || []).map((s, i) => (
                <span key={i} className="px-3 py-1 rounded-full text-xs flex items-center gap-1" style={{ background: "#F5E6E0", color: "#6B1B3D" }}>
                  {s}
                  <button onClick={() => setForm(f => ({ ...f, specialties: f.specialties.filter((_, j) => j !== i) }))} className="ml-1 text-xs">×</button>
                </span>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 mb-4 text-sm">
            <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} />
            Published (visible on public page)
          </label>
          <div className="flex gap-3">
            <button onClick={() => save.mutate()} className="px-5 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "#6B1B3D" }}>Save</button>
            <button onClick={() => { setEditing(null); setForm(EMPTY_EXPERT); }} className="px-5 py-2 rounded-lg text-sm" style={{ border: "1px solid rgba(107,27,61,0.2)" }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid rgba(107,27,61,0.1)" }}>
        <table className="w-full">
          <thead><tr style={{ background: "#FAF5F3" }}>{["Name","Title","Specialties","Published","Actions"].map(h=><th key={h} className="px-4 py-3 text-left" style={{fontSize:11,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"#C4866C"}}>{h}</th>)}</tr></thead>
          <tbody>
            {experts.map(e => (
              <tr key={e.id} className="border-t" style={{ borderColor: "rgba(107,27,61,0.06)" }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {e.profile_picture && <img src={e.profile_picture} alt="" className="w-8 h-8 rounded-full object-cover" />}
                    <span className="text-sm font-medium">{e.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{e.title}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(e.specialties || []).slice(0, 3).map((s, i) => <span key={i} className="px-2 py-0.5 rounded-full text-xs" style={{ background: "#F5E6E0", color: "#6B1B3D" }}>{s}</span>)}
                  </div>
                </td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${e.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{e.isPublished ? "Yes" : "No"}</span></td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEdit(e)} className="text-xs px-3 py-1 rounded" style={{ background: "#F5E6E0", color: "#6B1B3D" }}>Edit</button>
                  <button onClick={() => del.mutate(e.id)} className="text-xs px-3 py-1 rounded bg-red-50 text-red-600">Delete</button>
                </td>
              </tr>
            ))}
            {experts.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No experts yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}