import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { SectionLabel } from "@/components/admin2/AdminCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AppSettingsTab() {
  const qc = useQueryClient();
  const { data: settingsList = [] } = useQuery({ queryKey: ["admin-site-settings"], queryFn: () => base44.entities.SiteSettings.list() });
  const settings = settingsList[0] || null;
  const [form, setForm] = useState({});

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings?.id]);

  const save = useMutation({
    mutationFn: () => settings ? base44.entities.SiteSettings.update(settings.id, form) : base44.entities.SiteSettings.create(form),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-site-settings"] }),
  });

  const fields = [
    ["light_logo", "Light Logo URL (for dark backgrounds)"],
    ["dark_logo", "Dark Logo URL (for light backgrounds)"],
    ["light_favicon", "Light Favicon URL"],
    ["dark_favicon", "Dark Favicon URL"],
  ];

  return (
    <div className="max-w-lg">
      <SectionLabel>App Settings</SectionLabel>
      <div className="bg-white rounded-2xl border border-[#E8E0DC] p-8 space-y-5">
        {fields.map(([k, l]) => (
          <div key={k}>
            <label className="block mb-1" style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>{l}</label>
            <Input value={form[k] || ""} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} placeholder="https://..." />
            {form[k] && <img src={form[k]} alt="" className="mt-2 h-8 object-contain rounded" onError={e => e.target.style.display = "none"} />}
          </div>
        ))}
        <Button onClick={() => save.mutate()} disabled={save.isPending} style={{ background: "#6B1B3D", color: "#fff", borderRadius: 100 }}>
          {save.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}