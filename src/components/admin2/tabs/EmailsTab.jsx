import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { SectionLabel } from "@/components/admin2/AdminCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { format } from "date-fns";

const EMPTY = { name: "", subject: "", html_body: "", audience: "all_opted_in", from_name: "Laura | The Aligned Woman", reply_to: "", notes: "" };

const STATUS_COLORS = { draft: "#9CA3AF", sent: "#22C55E", scheduled: "#F59E0B", sending: "#3B82F6" };

export default function EmailsTab() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const qc = useQueryClient();

  const { data: campaigns = [] } = useQuery({ queryKey: ["admin-campaigns"], queryFn: () => base44.entities.EmailCampaign.list("-created_date") });

  const save = useMutation({
    mutationFn: () => base44.entities.EmailCampaign.create({ ...form, status: "draft" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-campaigns"] }); setOpen(false); setForm(EMPTY); },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <SectionLabel>Email Campaigns</SectionLabel>
        <Button onClick={() => setOpen(true)} style={{ background: "#6B1B3D", color: "#fff", borderRadius: 100, fontSize: 12, fontFamily: "Montserrat, sans-serif" }}>
          <Plus className="w-4 h-4 mr-2" /> Create Campaign
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E0DC] overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-[#F0E8E4]">
              {["Name", "Subject", "Audience", "Status", "Sent", "Date"].map(h => (
                <th key={h} className="text-left px-4 py-3" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "#C4866C", fontFamily: "Montserrat, sans-serif" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center italic" style={{ color: "#9CA3AF" }}>No campaigns yet.</td></tr>
            ) : campaigns.map(c => (
              <tr key={c.id} className="border-b border-[#F8F3F1] hover:bg-[#FDF9F8]">
                <td className="px-4 py-3" style={{ fontSize: 13, fontWeight: 600, fontFamily: "Montserrat, sans-serif" }}>{c.name}</td>
                <td className="px-4 py-3" style={{ fontSize: 13, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>{c.subject}</td>
                <td className="px-4 py-3" style={{ fontSize: 13, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>{c.audience}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ background: `${STATUS_COLORS[c.status]}22`, color: STATUS_COLORS[c.status], fontFamily: "Montserrat, sans-serif" }}>
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3" style={{ fontSize: 13, fontFamily: "Montserrat, sans-serif" }}>{c.sent_count || 0}</td>
                <td className="px-4 py-3" style={{ fontSize: 13, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>{c.created_date ? format(new Date(c.created_date), "d MMM yyyy") : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create Campaign</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            {[["name", "Campaign Name"], ["subject", "Subject Line"], ["from_name", "From Name"], ["reply_to", "Reply To"]].map(([k, l]) => (
              <div key={k}>
                <label className="block mb-1" style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>{l}</label>
                <Input value={form[k] || ""} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label className="block mb-1" style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>Audience</label>
              <Select value={form.audience} onValueChange={v => setForm(f => ({ ...f, audience: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["all_opted_in", "waitlist", "abandoned_carts", "buyers", "custom"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-1" style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>HTML Body</label>
              <textarea value={form.html_body} onChange={e => setForm(f => ({ ...f, html_body: e.target.value }))}
                rows={8} className="w-full border border-gray-200 rounded-xl p-3 text-sm font-mono" style={{ fontFamily: "monospace" }} />
            </div>
            <Button onClick={() => save.mutate()} disabled={save.isPending} style={{ background: "#6B1B3D", color: "#fff", width: "100%", borderRadius: 100 }}>
              {save.isPending ? "Saving..." : "Save as Draft"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}