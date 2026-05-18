import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Upload, X, Eye, Image, Plus, Trash2, Copy, Check } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Workbook Assets sub-component                                     */
/* ------------------------------------------------------------------ */

function WorkbookAssets({ assets, onChange }) {
  const [uploading, setUploading] = useState(null); // index being uploaded
  const [copiedKey, setCopiedKey] = useState(null);
  const [zoneDragOver, setZoneDragOver] = useState(false);
  const [rowDragOver, setRowDragOver] = useState(null); // index of row being dragged over

  const getNextKey = (currentAssets) => {
    if (!currentAssets.length) return "asset_01";
    const nums = currentAssets.map((a) => {
      const m = a.key.match(/asset_(\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    });
    const next = Math.max(...nums) + 1;
    return `asset_${String(next).padStart(2, "0")}`;
  };

  const nextKey = () => getNextKey(assets);

  // Upload a File object for a specific asset index
  const uploadFile = async (file, index) => {
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(index);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const updated = [...assets];
      updated[index] = { ...updated[index], url: file_url };
      onChange(updated);
    } catch (err) {
      console.error("Asset upload failed:", err);
    } finally {
      setUploading(null);
    }
  };

  const handleUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file, index);
  };

  // Drag-and-drop: bulk drop onto the zone (empty state or bottom area)
  const handleZoneDrop = async (e) => {
    e.preventDefault();
    setZoneDragOver(false);
    const files = [...(e.dataTransfer.files || [])].filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;

    // Create new rows for each dropped file and upload them
    let updatedAssets = [...assets];
    const newIndices = [];

    for (const file of files) {
      const key = getNextKey(updatedAssets);
      const newIndex = updatedAssets.length;
      updatedAssets.push({ key, label: file.name.replace(/\.[^.]+$/, ""), url: "" });
      newIndices.push({ index: newIndex, file });
    }

    onChange(updatedAssets);

    // Upload each file sequentially
    for (const { index, file } of newIndices) {
      setUploading(index);
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        updatedAssets = [...updatedAssets];
        updatedAssets[index] = { ...updatedAssets[index], url: file_url };
        onChange(updatedAssets);
      } catch (err) {
        console.error("Asset upload failed:", err);
      }
    }
    setUploading(null);
  };

  // Drag-and-drop: single drop onto an existing row thumbnail
  const handleRowDrop = async (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setRowDragOver(null);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      uploadFile(file, index);
    }
  };

  const preventDefaults = (e) => { e.preventDefault(); e.stopPropagation(); };

  const addRow = () => {
    onChange([...assets, { key: nextKey(), label: "", url: "" }]);
  };

  const removeRow = (index) => {
    onChange(assets.filter((_, i) => i !== index));
  };

  const updateLabel = (index, label) => {
    const updated = [...assets];
    updated[index] = { ...updated[index], label };
    onChange(updated);
  };

  const copyKey = (key) => {
    navigator.clipboard.writeText(`"asset_key": "${key}"`).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <Label className="text-sm font-semibold">Workbook Assets</Label>
          <p className="text-xs text-gray-400 mt-0.5">
            Upload or drag and drop images, then reference them in the schema using <code className="bg-gray-100 px-1 py-0.5 rounded text-[11px]">asset_key</code>
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus className="w-3 h-3 mr-1" /> Add Image
        </Button>
      </div>

      {/* Empty state / drop zone */}
      {assets.length === 0 && (
        <label
          className={`flex flex-col items-center justify-center py-10 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
            zoneDragOver
              ? "border-[#6E1D40] bg-[#F5E8EE]/40"
              : "border-gray-200 bg-gray-50/50 hover:border-gray-300"
          }`}
          onDragOver={(e) => { preventDefaults(e); setZoneDragOver(true); }}
          onDragEnter={(e) => { preventDefaults(e); setZoneDragOver(true); }}
          onDragLeave={(e) => { preventDefaults(e); setZoneDragOver(false); }}
          onDrop={handleZoneDrop}
        >
          <Image className={`w-8 h-8 mb-2 transition-colors ${zoneDragOver ? "text-[#6E1D40]" : "text-gray-300"}`} />
          <p className={`text-sm transition-colors ${zoneDragOver ? "text-[#6E1D40] font-medium" : "text-gray-400"}`}>
            {zoneDragOver ? "Drop images here" : "Drag and drop images here, or click to browse"}
          </p>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={async (e) => {
              const files = [...(e.target.files || [])].filter((f) => f.type.startsWith("image/"));
              if (!files.length) return;
              // Simulate a drop
              const fakeEvent = { preventDefault: () => {}, dataTransfer: { files } };
              // Reuse zone drop logic
              let updatedAssets = [...assets];
              for (const file of files) {
                const key = getNextKey(updatedAssets);
                updatedAssets.push({ key, label: file.name.replace(/\.[^.]+$/, ""), url: "" });
              }
              onChange(updatedAssets);
              for (let i = 0; i < files.length; i++) {
                const idx = assets.length + i;
                setUploading(idx);
                try {
                  const { file_url } = await base44.integrations.Core.UploadFile({ file: files[i] });
                  updatedAssets = [...updatedAssets];
                  updatedAssets[idx] = { ...updatedAssets[idx], url: file_url };
                  onChange(updatedAssets);
                } catch (err) {
                  console.error("Asset upload failed:", err);
                }
              }
              setUploading(null);
            }}
          />
        </label>
      )}

      {/* Asset rows */}
      {assets.length > 0 && (
        <div className="space-y-3">
          {assets.map((asset, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50/60"
            >
              {/* Thumbnail / upload area with drop support */}
              <div className="flex-shrink-0">
                {asset.url ? (
                  <div
                    className="relative group"
                    onDragOver={(e) => { preventDefaults(e); setRowDragOver(idx); }}
                    onDragEnter={(e) => { preventDefaults(e); setRowDragOver(idx); }}
                    onDragLeave={(e) => { preventDefaults(e); setRowDragOver(null); }}
                    onDrop={(e) => handleRowDrop(e, idx)}
                  >
                    <img
                      src={asset.url}
                      alt={asset.label || asset.key}
                      className={`w-20 h-20 rounded-lg object-cover border transition-all ${
                        rowDragOver === idx ? "border-[#6E1D40] ring-2 ring-[#6E1D40]/30" : "border-gray-200"
                      }`}
                    />
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <span className="text-[10px] font-semibold text-white tracking-wide uppercase">Replace</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUpload(e, idx)}
                      />
                    </label>
                  </div>
                ) : (
                  <label
                    className={`flex flex-col items-center justify-center w-20 h-20 rounded-lg border-2 border-dashed bg-white cursor-pointer transition-all ${
                      rowDragOver === idx
                        ? "border-[#6E1D40] bg-[#F5E8EE]/30"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onDragOver={(e) => { preventDefaults(e); setRowDragOver(idx); }}
                    onDragEnter={(e) => { preventDefaults(e); setRowDragOver(idx); }}
                    onDragLeave={(e) => { preventDefaults(e); setRowDragOver(null); }}
                    onDrop={(e) => handleRowDrop(e, idx)}
                  >
                    {uploading === idx ? (
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Upload className={`w-4 h-4 mb-1 ${rowDragOver === idx ? "text-[#6E1D40]" : "text-gray-400"}`} />
                        <span className={`text-[10px] font-medium ${rowDragOver === idx ? "text-[#6E1D40]" : "text-gray-400"}`}>
                          {rowDragOver === idx ? "Drop" : "Upload"}
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUpload(e, idx)}
                    />
                  </label>
                )}
              </div>

              {/* Key + label */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono bg-white border border-gray-200 rounded px-2 py-1 text-[#6E1D40] select-all flex-shrink-0">
                    {asset.key}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyKey(asset.key)}
                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    title="Copy schema reference"
                  >
                    {copiedKey === asset.key ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <Input
                  value={asset.label}
                  onChange={(e) => updateLabel(idx, e.target.value)}
                  placeholder="Label, e.g. Reticular Activating System diagram"
                  className="text-sm h-8"
                />
              </div>

              {/* Delete */}
              <button
                type="button"
                onClick={() => removeRow(idx)}
                className="flex-shrink-0 mt-1 p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Drop zone below existing rows for adding more */}
          <label
            className={`flex items-center justify-center py-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
              zoneDragOver
                ? "border-[#6E1D40] bg-[#F5E8EE]/40"
                : "border-gray-200 bg-gray-50/30 hover:border-gray-300"
            }`}
            onDragOver={(e) => { preventDefaults(e); setZoneDragOver(true); }}
            onDragEnter={(e) => { preventDefaults(e); setZoneDragOver(true); }}
            onDragLeave={(e) => { preventDefaults(e); setZoneDragOver(false); }}
            onDrop={handleZoneDrop}
          >
            <p className={`text-xs transition-colors ${zoneDragOver ? "text-[#6E1D40] font-medium" : "text-gray-400"}`}>
              {zoneDragOver ? "Drop to add more images" : "Drag more images here, or click to browse"}
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={async (e) => {
                const files = [...(e.target.files || [])].filter((f) => f.type.startsWith("image/"));
                if (!files.length) return;
                let updatedAssets = [...assets];
                for (const file of files) {
                  const key = getNextKey(updatedAssets);
                  updatedAssets.push({ key, label: file.name.replace(/\.[^.]+$/, ""), url: "" });
                }
                onChange(updatedAssets);
                for (let i = 0; i < files.length; i++) {
                  const idx = assets.length + i;
                  setUploading(idx);
                  try {
                    const { file_url } = await base44.integrations.Core.UploadFile({ file: files[i] });
                    updatedAssets = [...updatedAssets];
                    updatedAssets[idx] = { ...updatedAssets[idx], url: file_url };
                    onChange(updatedAssets);
                  } catch (err) {
                    console.error("Asset upload failed:", err);
                  }
                }
                setUploading(null);
              }}
            />
          </label>
        </div>
      )}

      {assets.length > 0 && (
        <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
          To display an image in your workbook, add a <code className="bg-gray-100 px-1 py-0.5 rounded">content_block</code> field
          to the schema with <code className="bg-gray-100 px-1 py-0.5 rounded">"asset_key": "{assets[0]?.key}"</code>. Click the copy icon next to any key to copy the reference.
        </p>
      )}
    </div>
  );
}


/* ------------------------------------------------------------------ */
/*  Main form                                                         */
/* ------------------------------------------------------------------ */

export default function WorkbookForm({ workbook, onBack }) {
  const isNew = !workbook;
  const queryClient = useQueryClient();

  const { data: experts = [] } = useQuery({
    queryKey: ["experts"],
    queryFn: () => base44.entities.Expert.list(),
  });
  const { data: courses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: () => base44.entities.Course.list(),
  });
  const { data: allWorkbooks = [] } = useQuery({
    queryKey: ["adminWorkbooks"],
    queryFn: () => base44.entities.Workbook.list("order"),
  });

  const nextOrder = useMemo(() => {
    if (!allWorkbooks.length) return 0;
    return Math.max(...allWorkbooks.map((w) => w.order ?? 0)) + 1;
  }, [allWorkbooks]);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    expert_id: "",
    course_id: "",
    schema: "{}",
    blank_pdf_url: "",
    cover_image_url: "",
    intro_text: "",
    closing_text: "",
    order: 0,
    status: "draft",
  });

  // Assets managed separately from the schema text, merged on save
  const [assets, setAssets] = useState([]);

  const [schemaPreview, setSchemaPreview] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [savedId, setSavedId] = useState(workbook?.id || null);

  // Init form from workbook or defaults
  useEffect(() => {
    if (workbook) {
      // Extract assets from the stored schema if present
      const storedAssets = workbook.schema?.assets || [];

      setForm({
        title: workbook.title || "",
        subtitle: workbook.subtitle || "",
        expert_id: workbook.expert_id || "",
        course_id: workbook.course_id || "",
        schema: workbook.schema
          ? JSON.stringify(stripAssets(workbook.schema), null, 2)
          : "{}",
        blank_pdf_url: workbook.blank_pdf_url || "",
        cover_image_url: workbook.cover_image_url || "",
        intro_text: workbook.intro_text || "",
        closing_text: workbook.closing_text || "",
        order: workbook.order ?? 0,
        status: workbook.status || "draft",
      });

      setAssets(storedAssets);
    } else {
      setForm((f) => ({ ...f, order: nextOrder }));
    }
  }, [workbook, nextOrder]);

  // Strip the "assets" key from a schema object for display in the text editor
  function stripAssets(schema) {
    if (!schema || typeof schema !== "object") return schema;
    const { assets: _removed, ...rest } = schema;
    return rest;
  }

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setSaveError(null);
  };

  // Schema preview
  const handlePreview = () => {
    const result = parseSchema(form.schema);
    setSchemaPreview(result);
  };

  function parseSchema(raw) {
    try {
      const obj = JSON.parse(raw);
      const sections = Array.isArray(obj.sections) ? obj.sections : [];
      const fields = sections.flatMap((s) => (Array.isArray(s.fields) ? s.fields : []));
      const types = [...new Set(fields.map((f) => f.type).filter(Boolean))];

      // Count content_block fields referencing assets
      const assetRefs = fields.filter(
        (f) => f.type === "content_block" && f.asset_key
      );
      const unresolvedRefs = assetRefs.filter(
        (f) => !assets.find((a) => a.key === f.asset_key)
      );

      let message = `Schema parsed. Sections: ${sections.length}. Fields: ${fields.length}. Field types: ${types.length ? types.join(", ") : "none"}.`;
      if (assetRefs.length) {
        message += ` Asset references: ${assetRefs.length}.`;
      }
      if (unresolvedRefs.length) {
        message += ` WARNING: ${unresolvedRefs.length} asset reference(s) have no matching upload (${unresolvedRefs.map((f) => f.asset_key).join(", ")}).`;
        return { ok: true, message, warning: true };
      }
      return { ok: true, message };
    } catch (e) {
      let msg = e.message || "Unknown parse error";
      return { ok: false, message: `Invalid JSON: ${msg}` };
    }
  }

  // Save
  const createMut = useMutation({
    mutationFn: (data) => base44.entities.Workbook.create(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["adminWorkbooks"] });
      setSavedId(result.id);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Workbook.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminWorkbooks"] });
    },
  });

  const handleSave = async () => {
    setSaveError(null);

    // Parse schema
    const parsed = parseSchema(form.schema);
    if (!parsed.ok) {
      setSchemaPreview(parsed);
      setSaveError("Cannot save while schema JSON is invalid.");
      return;
    }

    let schemaObj;
    try {
      schemaObj = JSON.parse(form.schema);
    } catch {
      return;
    }

    // Merge assets into the schema object before saving
    if (assets.length > 0) {
      schemaObj.assets = assets.filter((a) => a.url); // only save assets that have a URL
    } else {
      delete schemaObj.assets;
    }

    // Uniqueness constraint: max one published per expert+course
    if (form.status === "published") {
      const conflict = allWorkbooks.find(
        (w) =>
          w.expert_id === form.expert_id &&
          w.course_id === form.course_id &&
          w.status === "published" &&
          w.id !== savedId
      );
      if (conflict) {
        setSaveError(
          `A published workbook already exists for this expert + course pair ("${conflict.title}"). Only one published workbook per expert per course is allowed. Set the other to draft first.`
        );
        return;
      }
    }

    const payload = {
      title: form.title,
      subtitle: form.subtitle || null,
      expert_id: form.expert_id,
      course_id: form.course_id,
      schema: schemaObj,
      blank_pdf_url: form.blank_pdf_url || null,
      cover_image_url: form.cover_image_url || null,
      intro_text: form.intro_text || null,
      closing_text: form.closing_text || null,
      order: Number(form.order) || 0,
      status: form.status,
    };

    if (savedId) {
      await updateMut.mutateAsync({ id: savedId, data: payload });
    } else {
      const result = await createMut.mutateAsync(payload);
      setSavedId(result.id);
    }
  };

  const isSaving = createMut.isPending || updateMut.isPending;
  const canSave = form.title && form.expert_id && form.course_id && form.schema;

  // File uploads
  const handleFileUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set(field, file_url);
  };

  const pdfFilename = form.blank_pdf_url
    ? decodeURIComponent(form.blank_pdf_url.split("/").pop().split("?")[0])
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" /> All Workbooks
        </Button>
        <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
          WORKBOOKS · ADMIN
        </p>
        <h2 className="text-2xl font-bold" style={{ color: "#6E1D40" }}>
          {isNew && !savedId ? "New" : "Edit"}{" "}
          <em className="not-italic" style={{ color: "#C4847A", fontStyle: "italic" }}>Workbook</em>
        </h2>
      </div>

      {/* Form */}
      <div className="border-2 border-gray-200 rounded-xl bg-white p-6 space-y-5">
        {/* Title */}
        <div>
          <Label>Title *</Label>
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g., The Hormones Workbook" />
        </div>

        {/* Subtitle */}
        <div>
          <Label>Subtitle</Label>
          <Input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} placeholder="e.g., Companion to the Hormones Module" />
        </div>

        {/* Expert */}
        <div>
          <Label>Authoring Expert *</Label>
          <Select value={form.expert_id} onValueChange={(v) => set("expert_id", v)}>
            <SelectTrigger><SelectValue placeholder="Select expert" /></SelectTrigger>
            <SelectContent>
              {experts.map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Course */}
        <div>
          <Label>Course *</Label>
          <Select value={form.course_id} onValueChange={(v) => set("course_id", v)}>
            <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Schema */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label>Schema *</Label>
            <Button type="button" variant="outline" size="sm" onClick={handlePreview}>
              <Eye className="w-3 h-3 mr-1" /> Preview
            </Button>
          </div>
          <Textarea
            value={form.schema}
            onChange={(e) => { set("schema", e.target.value); setSchemaPreview(null); }}
            className="font-mono text-sm"
            style={{ minHeight: "400px" }}
            placeholder='{"sections":[...]}'
          />
          {schemaPreview && (
            <div
              className={`mt-2 px-4 py-3 rounded-lg text-sm ${
                schemaPreview.ok && !schemaPreview.warning
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : schemaPreview.ok && schemaPreview.warning
                  ? "bg-yellow-50 text-yellow-800 border border-yellow-300"
                  : "bg-red-50 text-red-700 border-2 border-red-400"
              }`}
            >
              {schemaPreview.message}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/*  WORKBOOK ASSETS - NEW SECTION                               */}
        {/* ============================================================ */}
        <div className="border-t border-gray-100 pt-5">
          <WorkbookAssets assets={assets} onChange={setAssets} />
        </div>

        {/* Blank PDF */}
        <div>
          <Label>Blank PDF</Label>
          {form.blank_pdf_url ? (
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-gray-700 truncate max-w-xs">{pdfFilename}</span>
              <label className="cursor-pointer">
                <span className="text-xs font-medium text-[#6E1D40] hover:underline">Replace</span>
                <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleFileUpload(e, "blank_pdf_url")} />
              </label>
              <button onClick={() => set("blank_pdf_url", "")} className="text-xs font-medium text-red-600 hover:underline">
                Remove
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-2 px-4 py-2 mt-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer text-sm font-medium text-gray-700 w-fit">
              <Upload className="w-4 h-4" /> Upload PDF
              <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleFileUpload(e, "blank_pdf_url")} />
            </label>
          )}
        </div>

        {/* Cover Image */}
        <div>
          <Label>Cover Image</Label>
          {form.cover_image_url ? (
            <div className="mt-1 space-y-2">
              <div className="relative w-40 h-24 rounded-lg overflow-hidden border border-gray-200">
                <img src={form.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer">
                  <span className="text-xs font-medium text-[#6E1D40] hover:underline">Replace</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "cover_image_url")} />
                </label>
                <button onClick={() => set("cover_image_url", "")} className="text-xs font-medium text-red-600 hover:underline">
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <label className="flex items-center gap-2 px-4 py-2 mt-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer text-sm font-medium text-gray-700 w-fit">
              <Upload className="w-4 h-4" /> Upload Image
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "cover_image_url")} />
            </label>
          )}
        </div>

        {/* Intro text */}
        <div>
          <Label>Intro text</Label>
          <Textarea value={form.intro_text} onChange={(e) => set("intro_text", e.target.value)} placeholder="How to use this workbook..." className="min-h-[80px]" />
        </div>

        {/* Closing text */}
        <div>
          <Label>Closing text</Label>
          <Textarea value={form.closing_text} onChange={(e) => set("closing_text", e.target.value)} placeholder="Closing note shown on completion" className="min-h-[80px]" />
        </div>

        {/* Order */}
        <div>
          <Label>Order *</Label>
          <Input type="number" value={form.order} onChange={(e) => set("order", Number(e.target.value))} />
        </div>

        {/* Status */}
        <div>
          <Label>Status *</Label>
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Error */}
        {saveError && (
          <div className="px-4 py-3 rounded-lg bg-red-50 text-red-700 border-2 border-red-400 text-sm">
            {saveError}
          </div>
        )}

        {/* Save */}
        <Button
          onClick={handleSave}
          disabled={!canSave || isSaving}
          className="w-full text-white"
          style={{ backgroundColor: "#6E1D40" }}
        >
          {isSaving ? "Saving..." : savedId ? "Save Changes" : "Create Workbook"}
        </Button>
      </div>
    </div>
  );
}