import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Edit, Copy, Trash2, Sparkles, ExternalLink, Loader2 } from "lucide-react";

const STATUS_COLORS = { live: "bg-green-100 text-green-800", coming_soon: "bg-yellow-100 text-yellow-800" };

const CATEGORIES = ["Awareness", "Liberation", "Intention", "Vision", "Embodiment", "Power & Money"];
const TONES = ["Authoritative", "Warm", "Direct", "Reflective", "Inspiring"];
const LENGTHS = ["500 words", "800 words", "1200 words", "1500 words"];

const EMPTY_POST = { title: "", slug: "", category: "Awareness", status: "coming_soon", excerpt: "", content: "", published_date: "" };

export default function BlogManagementContent() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState(EMPTY_POST);

  // AI Studio state
  const [aiTopic, setAiTopic] = useState("");
  const [aiCategory, setAiCategory] = useState("Awareness");
  const [aiTone, setAiTone] = useState("Authoritative");
  const [aiLength, setAiLength] = useState("800 words");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const qc = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: () => base44.entities.BlogPost.list("-published_date"),
  });

  const saveMutation = useMutation({
    mutationFn: (data) =>
      editingPost ? base44.entities.BlogPost.update(editingPost.id, data) : base44.entities.BlogPost.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-blog-posts"] }); setEditorOpen(false); setEditingPost(null); setFormData(EMPTY_POST); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-blog-posts"] }),
  });

  const duplicateMutation = useMutation({
    mutationFn: (post) => {
      const { id, created_date, updated_date, ...rest } = post;
      return base44.entities.BlogPost.create({ ...rest, title: `${rest.title} (Copy)`, slug: `${rest.slug}-copy`, status: "coming_soon" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-blog-posts"] }),
  });

  const openCreate = () => { setEditingPost(null); setFormData(EMPTY_POST); setEditorOpen(true); };
  const openEdit = (post) => { setEditingPost(post); setFormData({ ...post }); setEditorOpen(true); };

  const handleGenerate = async () => {
    if (!aiTopic) return;
    setAiGenerating(true);
    setAiResult(null);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a ${aiLength} SEO-optimized blog article for The Aligned Woman Blueprint.
Topic/keyword: "${aiTopic}"
Category: ${aiCategory}
Tone: ${aiTone}
Author voice: Laura Jane Thomas, senior strategist, former agency owner, creator of the A.L.I.V.E. Method.

Return a JSON object with:
- title: engaging SEO title
- slug: url-friendly slug
- excerpt: 1-2 sentence excerpt (under 160 chars)
- content: full article in HTML paragraphs (no markdown, just <p>, <h2>, <h3>, <ul>, <li> tags)
- meta_description: SEO meta description under 160 chars

The article should be written in first person where appropriate, grounded in the A.L.I.V.E. Method (Awareness, Liberation, Intentional Action, Vision, Embodiment), and end with a gentle CTA toward The Clarity Sprint or The Aligned Woman Blueprint platform.`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          slug: { type: "string" },
          excerpt: { type: "string" },
          content: { type: "string" },
          meta_description: { type: "string" },
        },
      },
    });
    setAiResult(result);
    setAiGenerating(false);
  };

  const useGeneratedArticle = () => {
    if (!aiResult) return;
    setFormData({
      title: aiResult.title || "",
      slug: aiResult.slug || "",
      category: aiCategory,
      status: "coming_soon",
      excerpt: aiResult.excerpt || "",
      content: aiResult.content || "",
      published_date: new Date().toISOString().split("T")[0],
    });
    setEditingPost(null);
    setEditorOpen(true);
  };

  const filtered = posts.filter((p) => {
    const matchStatus = statusFilter === "All" || (statusFilter === "Live" ? p.status === "live" : p.status === "coming_soon");
    const q = search.toLowerCase();
    return matchStatus && (!q || p.title?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      <Tabs defaultValue="articles">
        <TabsList className="bg-awrose-wash border border-awrose-pale">
          <TabsTrigger value="articles" className="font-body font-bold text-[10px] tracking-eyebrow uppercase">Articles</TabsTrigger>
          <TabsTrigger value="ai-studio" className="font-body font-bold text-[10px] tracking-eyebrow uppercase">AI Blog Studio</TabsTrigger>
        </TabsList>

        {/* ARTICLES TAB */}
        <TabsContent value="articles" className="space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-awburg-core text-2xl">Blog Articles</h2>
              <p className="font-body text-awburg-core/60 text-sm">{posts.length} articles total</p>
            </div>
            <Button onClick={openCreate} className="bg-awburg-core hover:bg-awburg-mid text-paper gap-2">
              <Plus className="w-4 h-4" /> Create New Article
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex gap-1.5">
              {["All", "Live", "Coming Soon"].map((tab) => (
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
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-awburg-core/40" />
              <Input placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 text-sm" />
            </div>
          </div>

          <div className="bg-paper border border-awburg-core/8 rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Published</TableHead>
                  <TableHead className="hidden lg:table-cell">Slug</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && <TableRow><TableCell colSpan={6} className="text-center py-8 text-awburg-core/40">Loading...</TableCell></TableRow>}
                {!isLoading && filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-12 text-awburg-core/40">No articles found.</TableCell></TableRow>}
                {filtered.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <p className="font-body font-medium text-awburg-core text-sm line-clamp-1">{post.title}</p>
                    </TableCell>
                    <TableCell>
                      <span className="font-body text-awburg-core/60 text-xs">{post.category}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${STATUS_COLORS[post.status] || "bg-gray-100 text-gray-600"} capitalize text-xs`}>
                        {post.status === "coming_soon" ? "Coming Soon" : "Live"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="font-body text-awburg-core/50 text-xs">{post.published_date || "-"}</span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="font-body text-awburg-core/50 text-xs">/{post.slug}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(post)}>
                          <Edit className="w-3.5 h-3.5 text-awburg-core/60" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => duplicateMutation.mutate(post)}>
                          <Copy className="w-3.5 h-3.5 text-awburg-core/60" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { if (window.confirm("Delete this article?")) deleteMutation.mutate(post.id); }}>
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* AI STUDIO TAB */}
        <TabsContent value="ai-studio" className="space-y-6 mt-6">
          <div>
            <h2 className="font-display text-awburg-core text-2xl">AI Blog Studio</h2>
            <p className="font-body text-awburg-core/60 text-sm">Generate SEO-optimized articles in Laura's voice using the A.L.I.V.E. Method framework.</p>
          </div>

          <Card className="border-awburg-core/8">
            <CardHeader>
              <CardTitle className="font-display text-awburg-core text-xl flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-awrose-core" /> Article Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Topic or Keyword</Label>
                <Input value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder="e.g. why high-functioning women burn out" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={aiCategory} onValueChange={setAiCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tone</Label>
                  <Select value={aiTone} onValueChange={setAiTone}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Length</Label>
                  <Select value={aiLength} onValueChange={setAiLength}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{LENGTHS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleGenerate} disabled={!aiTopic || aiGenerating} className="bg-awrose-core hover:bg-awburg-core text-paper gap-2">
                {aiGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Article</>}
              </Button>

              {aiResult && (
                <div className="mt-6 p-6 bg-awrose-wash rounded-xl border border-awrose-pale space-y-4">
                  <div>
                    <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-1">Generated Title</p>
                    <p className="font-display text-awburg-core text-xl">{aiResult.title}</p>
                  </div>
                  <div>
                    <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-1">Excerpt</p>
                    <p className="font-body text-awburg-core/70 text-sm">{aiResult.excerpt}</p>
                  </div>
                  <div>
                    <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-1">SEO Description</p>
                    <p className="font-body text-awburg-core/70 text-sm">{aiResult.meta_description}</p>
                  </div>
                  <div>
                    <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-2">Content Preview</p>
                    <div className="max-h-60 overflow-y-auto bg-paper rounded-lg p-4 border border-awburg-core/8 text-sm text-awburg-core/70 font-body leading-relaxed" dangerouslySetInnerHTML={{ __html: aiResult.content?.slice(0, 1000) + "..." }} />
                  </div>
                  <Button onClick={useGeneratedArticle} className="bg-awburg-core hover:bg-awburg-mid text-paper gap-2">
                    <Edit className="w-4 h-4" /> Edit and Save This Article
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SEO Settings Panel */}
          <Card className="border-awburg-core/8">
            <CardHeader>
              <CardTitle className="font-display text-awburg-core text-xl">SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Default OG Image URL</Label>
                  <Input placeholder="https://..." />
                </div>
                <div>
                  <Label>Twitter / X Handle</Label>
                  <Input placeholder="@yourbrand" />
                </div>
                <div>
                  <Label>Sitemap URL</Label>
                  <Input placeholder="/sitemap.xml" />
                </div>
                <div>
                  <Label>Canonical URL Pattern</Label>
                  <Input placeholder="https://alignedwomanco.com/{slug}" />
                </div>
              </div>
              <div>
                <Label>Default Meta Description Template</Label>
                <Textarea placeholder="Written by Laura Jane Thomas. {excerpt}" className="min-h-[80px]" />
              </div>
              <div>
                <Label>robots.txt Content</Label>
                <Textarea placeholder="User-agent: *&#10;Allow: /" className="font-mono text-xs min-h-[100px]" />
              </div>
              <Button className="bg-awburg-core hover:bg-awburg-mid text-paper">Save SEO Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Article Editor Dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-awburg-core">{editingPost ? "Edit Article" : "Create Article"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Slug</Label>
                <Input value={formData.slug || ""} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status || "coming_soon"} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="coming_soon">Coming Soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={formData.category || "Awareness"} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Published Date</Label>
                <Input type="date" value={formData.published_date || ""} onChange={(e) => setFormData({ ...formData, published_date: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Excerpt</Label>
              <Textarea value={formData.excerpt || ""} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} className="min-h-[80px]" />
            </div>
            <div>
              <Label>Content (HTML)</Label>
              <Textarea value={formData.content || ""} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="min-h-[200px] font-mono text-xs" />
            </div>
            <Button
              onClick={() => saveMutation.mutate(formData)}
              disabled={!formData.title || saveMutation.isPending}
              className="w-full bg-awburg-core hover:bg-awburg-mid text-paper"
            >
              {saveMutation.isPending ? "Saving..." : editingPost ? "Save Changes" : "Create Article"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}