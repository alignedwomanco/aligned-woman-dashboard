import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import TabHeader from "./TabHeader";

export default function AppSettingsTab() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ light_logo: "", dark_logo: "", light_favicon: "", dark_favicon: "" });
  const [settingsId, setSettingsId] = useState(null);
  const [saved, setSaved] = useState(false);

  const { data: settings = [] } = useQuery({ queryKey: ["admin-site-settings"], queryFn: () => base44.entities.SiteSettings.list() });

  useEffect(() => {
    if (settings.length > 0) {
      setSettingsId(settings[0].id);
      setForm({ light_logo: settings[0].light_logo || "", dark_logo: settings[0].dark_logo || "", light_favicon: settings[0].light_favicon || "", dark_favicon: settings[0].dark_favicon || "" });
    }
  }, [settings]);

  const save = useMutation({
    mutationFn: () => settingsId
      ? base44.entities.SiteSettings.update(settingsId, form)
      : base44.entities.SiteSettings.create(form),
    onSuccess: (data) => {
      qc.invalidateQueries(["admin-site-settings"]);
      if (!settingsId && data?.id) setSettingsId(data.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const handleUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, [field]: file_url }));
  };

  const F = ({ label, field, hint }) => (
    <div className="mb-6 pb-6 border-b" style={{ borderColor: "rgba(107,27,61,0.08)" }}>
      <label className="block text-sm font-semibold mb-1" style={{ color: "#6B1B3D" }}>{label}</label>
      {hint && <p className="text-xs text-gray-500 mb-2">{hint}</p>}
      <div className="flex gap-3 items-center">
        <input
          value={form[field] || ""}
          onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
          placeholder="Paste URL or upload below…"
          className="flex-1 px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: "rgba(107,27,61,0.2)" }}
        />
        <label className="cursor-pointer px-3 py-2 rounded-lg text-sm font-semibold" style={{ background: "#F5E6E0", color: "#6B1B3D" }}>
          Upload
          <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e, field)} />
        </label>
      </div>
      {form[field] && (
        <img src={form[field]} alt={label} className="mt-3 h-12 object-contain rounded border" style={{ borderColor: "rgba(107,27,61,0.1)" }} />
      )}
    </div>
  );

  return (
    <div>
      <TabHeader title="App Settings" subtitle="Manage site logos and branding" />

      <div className="max-w-2xl rounded-xl p-8" style={{ background: "#fff", border: "1px solid rgba(107,27,61,0.1)" }}>
        <F label="Light Logo" field="light_logo" hint="Used on light backgrounds (dark coloured logo)" />
        <F label="Dark Logo" field="dark_logo" hint="Used on dark backgrounds (white/light logo)" />
        <F label="Light Favicon" field="light_favicon" hint="Favicon for light theme (dark icon)" />
        <F label="Dark Favicon" field="dark_favicon" hint="Favicon for dark theme (white icon)" />

        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="px-6 py-3 rounded-lg text-white font-semibold transition-all"
          style={{ background: "#6B1B3D", opacity: save.isPending ? 0.7 : 1 }}
        >
          {save.isPending ? "Saving…" : saved ? "✓ Saved!" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}