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
import { ArrowLeft, Upload, X, Eye } from "lucide-react";

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

  const [schemaPreview, setSchemaPreview] = useState(null); // { ok, message }
  const [saveError, setSaveError] = useState(null);
  const [savedId, setSavedId] = useState(workbook?.id || null);

  // Init form from workbook or defaults
  useEffect(() => {
    if (workbook) {
      setForm({
        title: workbook.title || "",
        subtitle: workbook.subtitle || "",
        expert_id: workbook.expert_id || "",
        course_id: workbook.course_id || "",
        schema: workbook.schema ? JSON.stringify(workbook.schema, null, 2) : "{}",
        blank_pdf_url: workbook.blank_pdf_url || "",
        cover_image_url: workbook.cover_image_url || "",
        intro_text: workbook.intro_text || "",
        closing_text: workbook.closing_text || "",
        order: workbook.order ?? 0,
        status: workbook.status || "draft",
      });
    } else {
      setForm((f) => ({ ...f, order: nextOrder }));
    }
  }, [workbook, nextOrder]);

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
      return {
        ok: true,
        message: `Schema parsed. Sections: ${sections.length}. Fields: ${fields.length}. Field types referenced: ${types.length ? types.join(", ") : "none"}.`,
      };
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
      // Navigate to edit view
      setForm((f) => ({ ...f })); // keep state
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
    try { schemaObj = JSON.parse(form.schema); } catch { return; }

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
                schemaPreview.ok
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-700 border-2 border-red-400"
              }`}
            >
              {schemaPreview.message}
            </div>
          )}
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
          <Textarea value={form.intro_text} onChange={(e) => set("intro_text", e.target.value)} placeholder="How to use this workbook…" className="min-h-[80px]" />
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
          {isSaving ? "Saving…" : savedId ? "Save Changes" : "Create Workbook"}
        </Button>
      </div>
    </div>
  );
}