import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { SectionLabel } from "@/components/admin2/AdminCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProfileTab({ user, setUser }) {
  const [form, setForm] = useState({ full_name: user?.full_name || "", bio: user?.bio || "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe(form);
    setUser(u => ({ ...u, ...form }));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePic = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.auth.updateMe({ profile_picture: file_url });
    setUser(u => ({ ...u, profile_picture: file_url }));
  };

  return (
    <div className="max-w-lg">
      <SectionLabel>My Profile</SectionLabel>

      <div className="bg-white rounded-2xl border border-[#E8E0DC] p-8 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-[#FDF5F3] border-2 border-[#E8E0DC] flex items-center justify-center">
            {user?.profile_picture ? (
              <img src={user.profile_picture} alt="" className="w-full h-full object-cover" />
            ) : (
              <span style={{ fontSize: 28, fontWeight: 700, color: "#6B1B3D", fontFamily: "'DM Serif Display', serif" }}>{user?.full_name?.[0] || "A"}</span>
            )}
          </div>
          <label htmlFor="admin-pic" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#6B1B3D", cursor: "pointer", textTransform: "uppercase", fontFamily: "Montserrat, sans-serif" }}>
            Change Photo
          </label>
          <input id="admin-pic" type="file" accept="image/*" className="hidden" onChange={handlePic} />
        </div>

        <div>
          <label className="block mb-1" style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>Full Name</label>
          <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
        </div>
        <div>
          <label className="block mb-1" style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>Email</label>
          <Input value={user?.email || ""} disabled className="bg-gray-50" />
        </div>
        <div>
          <label className="block mb-1" style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>Bio</label>
          <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={4} className="w-full border border-gray-200 rounded-xl p-3 text-sm" style={{ fontFamily: "Montserrat, sans-serif" }} />
        </div>
        <Button onClick={handleSave} disabled={saving} style={{ background: "#6B1B3D", color: "#fff", borderRadius: 100 }}>
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}