import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, ExternalLink, Edit, Copy, Trash2, Globe, FileText, Archive } from "lucide-react";

const STATUS_COLORS = {
  published: "bg-green-100 text-green-800",
  draft: "bg-yellow-100 text-yellow-800",
  archived: "bg-gray-100 text-gray-600",
};

const STATUS_TABS = ["All", "Published", "Draft", "Archived"];

const EMPTY_PAGE = {
  title: "",
  slug: "",
  status: "draft",
  page_type: "custom",
  template: "blank",
  meta_title: "",
  meta_description: "",
  show_navbar: true,
  show_footer: true,
  is_homepage: false,
};

export default function PagesManagerContent() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [formData, setFormData] = useState(EMPTY_PAGE);
  const [selected, setSelected] = useState(new Set());
  const qc = useQueryClient();

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["admin-pages"],
    queryFn: () => base44.entities.Page.list("-updated_date"),
  });

  const saveMutation = useMutation({
    mutationFn: (data) =>
      editingPage
        ? base44.entities.Page.update(editingPage.id, data)
        : base44.entities.Page.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-pages"] });
      setEditorOpen(false);
      setEditingPage(null);
      setFormData(EMPTY_PAGE);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Page.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-pages"] }),
  });

  const duplicateMutation = useMutation({
    mutationFn: (page) => {
      const { id, created_date, updated_date, ...rest } = page;
      return base44.entities.Page.create({ ...rest, title: `${rest.title} (Copy)`, slug: `${rest.slug}-copy`, status: "draft" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-pages"] }),
  });

  const bulkMutation = useMutation({
    mutationFn: async ({ action, ids }) => {
      if (action === "delete") {
        await Promise.all(ids.map((id) => base44.entities.Page.delete(id)));
      } else {
        await Promise.all(ids.map((id) => base44.entities.Page.update(id, { status: action })));
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-pages"] });
      setSelected(new Set());
    },
  });

  const openCreate = () => { setEditingPage(null); setFormData(EMPTY_PAGE); setEditorOpen(true); };
  const openEdit = (page) => { setEditingPage(page); setFormData({ ...page }); setEditorOpen(true); };

  const filtered = pages.filter((p) => {
    const matchStatus = statusFilter === "All" || p.status?.toLowerCase() === statusFilter.toLowerCase();
    const q = search.toLowerCase();
    const matchSearch = !q || p.title?.toLowerCase().includes(q) || p.slug?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const toggleSelect = (id) => {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const toggleAll = () => {
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map((p) => p.id)));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-awburg-core text-2xl">Website Pages</h2>
          <p className="font-body text-awburg-core/60 text-sm mt-1">Manage all public-facing pages on your site.</p>
        </div>
        <Button onClick={openCreate} className="bg-awburg-core hover:bg-awburg-mid text-paper gap-2">
          <Plus className="w-4 h-4" /> Create New Page
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex gap-1.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-1.5 rounded-full font-body font-bold text-[10px] tracking-eyebrow uppercase border transition-colors ${
                statusFilter === tab
                  ? "bg-awburg-core text-paper border-awburg-core"
                  : "bg-paper text-awburg-core/60 border-awburg-core/20 hover:border-awburg-core/40"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-awburg-core/40" />
          <Input
            placeholder="Search pages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-awrose-pale rounded-lg border border-awrose-light">
          <span className="font-body text-awburg-core text-sm">{selected.size} selected</span>
          <Button size="sm" variant="outline" onClick={() => bulkMutation.mutate({ action: "published", ids: [...selected] })}>
            <Globe className="w-3.5 h-3.5 mr-1" /> Publish
          </Button>
          <Button size="sm" variant="outline" onClick={() => bulkMutation.mutate({ action: "archived", ids: [...selected] })}>
            <Archive className="w-3.5 h-3.5 mr-1" /> Archive
          </Button>
          <Button size="sm" variant="destructive" onClick={() => { if (window.confirm("Delete selected pages?")) bulkMutation.mutate({ action: "delete", ids: [...selected] }); }}>
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="bg-paper border border-awburg-core/8 rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="rounded" />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Slug / URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Type</TableHead>
              <TableHead className="hidden lg:table-cell">Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-awburg-core/40">Loading...</TableCell></TableRow>
            )}
            {!isLoading && filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center py-12 text-awburg-core/40">No pages found.</TableCell></TableRow>
            )}
            {filtered.map((page) => (
              <TableRow key={page.id}>
                <TableCell>
                  <input type="checkbox" checked={selected.has(page.id)} onChange={() => toggleSelect(page.id)} className="rounded" />
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-body font-medium text-awburg-core text-sm">{page.title}</p>
                    {page.is_homepage && <span className="text-[9px] font-body font-bold tracking-eyebrow text-awrose-core uppercase">Homepage</span>}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-body text-awburg-core/60 text-sm">/{page.slug}</span>
                </TableCell>
                <TableCell>
                  <Badge className={`${STATUS_COLORS[page.status] || "bg-gray-100 text-gray-600"} capitalize text-xs`}>
                    {page.status || "draft"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="font-body text-awburg-core/60 text-xs capitalize">{page.page_type || "custom"}</span>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <span className="font-body text-awburg-core/50 text-xs">
                    {page.updated_date ? new Date(page.updated_date).toLocaleDateString() : "-"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => window.open(`/${page.slug}`, "_blank")}>
                      <ExternalLink className="w-3.5 h-3.5 text-awburg-core/60" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(page)}>
                      <Edit className="w-3.5 h-3.5 text-awburg-core/60" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => duplicateMutation.mutate(page)}>
                      <Copy className="w-3.5 h-3.5 text-awburg-core/60" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { if (window.confirm("Delete this page?")) deleteMutation.mutate(page.id); }}>
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Page Editor Dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-awburg-core">{editingPage ? "Edit Page" : "Create New Page"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Page Title</Label>
                <Input value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. The Clarity Sprint" />
              </div>
              <div>
                <Label>Slug (URL path)</Label>
                <Input value={formData.slug || ""} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="claritysprint" />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status || "draft"} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Page Type</Label>
                <Select value={formData.page_type || "custom"} onValueChange={(v) => setFormData({ ...formData, page_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["landing", "sales", "about", "contact", "legal", "custom"].map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Template</Label>
                <Select value={formData.template || "blank"} onValueChange={(v) => setFormData({ ...formData, template: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["blank", "landing", "sales", "about", "blog_index"].map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>SEO Title</Label>
              <Input value={formData.meta_title || ""} onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })} />
            </div>
            <div>
              <Label>SEO Description</Label>
              <Textarea value={formData.meta_description || ""} onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })} className="min-h-[80px]" />
            </div>
            <div>
              <Label>OG Image URL</Label>
              <Input value={formData.og_image || ""} onChange={(e) => setFormData({ ...formData, og_image: e.target.value })} />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!formData.show_navbar} onChange={(e) => setFormData({ ...formData, show_navbar: e.target.checked })} className="rounded" />
                <span className="font-body text-sm text-awburg-core">Show Navbar</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!formData.show_footer} onChange={(e) => setFormData({ ...formData, show_footer: e.target.checked })} className="rounded" />
                <span className="font-body text-sm text-awburg-core">Show Footer</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!formData.is_homepage} onChange={(e) => setFormData({ ...formData, is_homepage: e.target.checked })} className="rounded" />
                <span className="font-body text-sm text-awburg-core">Set as Homepage</span>
              </label>
            </div>
            <Button
              onClick={() => saveMutation.mutate(formData)}
              disabled={!formData.title || !formData.slug || saveMutation.isPending}
              className="w-full bg-awburg-core hover:bg-awburg-mid text-paper"
            >
              {saveMutation.isPending ? "Saving..." : editingPage ? "Save Changes" : "Create Page"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}