import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Globe } from "lucide-react";

const emptyForm = {
  region_name: "",
  country_codes: "",
  currency_code: "",
  currency_symbol: "",
  display_price: "",
  course_value: "",
  stripe_price_id: "",
  checkout_link: "",
  success_url: "",
  payment_provider: "stripe",
  is_active: true,
  sort_order: 0,
};

export default function RegionalPricingManager() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const queryClient = useQueryClient();

  const { data: pricings = [], isLoading } = useQuery({
    queryKey: ["regionalPricing"],
    queryFn: () => base44.entities.RegionalPricing.list("sort_order"),
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        ...data,
        display_price: Number(data.display_price) || 0,
        course_value: Number(data.course_value) || 0,
        sort_order: Number(data.sort_order) || 0,
        country_codes: typeof data.country_codes === "string"
          ? data.country_codes.split(",").map((c) => c.trim()).filter(Boolean)
          : data.country_codes,
      };
      if (editingId) {
        return base44.entities.RegionalPricing.update(editingId, payload);
      }
      return base44.entities.RegionalPricing.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regionalPricing"] });
      setDialogOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.RegionalPricing.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["regionalPricing"] }),
  });

  const handleEdit = (pricing) => {
    setForm({
      region_name: pricing.region_name || "",
      country_codes: (pricing.country_codes || []).join(", "),
      currency_code: pricing.currency_code || "",
      currency_symbol: pricing.currency_symbol || "",
      display_price: pricing.display_price || "",
      course_value: pricing.course_value || "",
      stripe_price_id: pricing.stripe_price_id || "",
      checkout_link: pricing.checkout_link || "",
      success_url: pricing.success_url || "",
      payment_provider: pricing.payment_provider || "stripe",
      is_active: pricing.is_active !== false,
      sort_order: pricing.sort_order || 0,
    });
    setEditingId(pricing.id);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Regional Pricing</h3>
        <Button onClick={handleNew} className="bg-[#6E1D40] hover:bg-[#5A1633] text-white gap-2">
          <Plus className="w-4 h-4" /> Add Region
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin w-6 h-6 border-4 border-[#6E1D40] border-t-transparent rounded-full" />
        </div>
      ) : pricings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Globe className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>No regional pricing configured yet.</p>
            <p className="text-sm">Click "Add Region" to set up your first pricing region.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Region</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricings.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{p.region_name}</span>
                        <div className="text-xs text-gray-400">{(p.country_codes || []).join(", ")}</div>
                      </div>
                    </TableCell>
                    <TableCell>{p.currency_symbol}{p.currency_code}</TableCell>
                    <TableCell>
                      <span className="font-semibold">{p.currency_symbol}{p.display_price}</span>
                      {p.course_value > 0 && (
                        <span className="text-xs text-gray-400 line-through ml-2">
                          {p.currency_symbol}{p.course_value}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{p.payment_provider}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={p.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>
                        {p.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(p)}>
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                          if (confirm("Delete this pricing region?")) deleteMutation.mutate(p.id);
                        }}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Region" : "Add Region"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Region Name *</Label>
              <Input value={form.region_name} onChange={(e) => setForm({ ...form, region_name: e.target.value })} placeholder="e.g. South Africa" />
            </div>
            <div>
              <Label>Country Codes (comma-separated)</Label>
              <Input value={form.country_codes} onChange={(e) => setForm({ ...form, country_codes: e.target.value })} placeholder="e.g. ZA, BW, NA" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Currency Code *</Label>
                <Input value={form.currency_code} onChange={(e) => setForm({ ...form, currency_code: e.target.value })} placeholder="e.g. ZAR" />
              </div>
              <div>
                <Label>Currency Symbol</Label>
                <Input value={form.currency_symbol} onChange={(e) => setForm({ ...form, currency_symbol: e.target.value })} placeholder="e.g. R" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Display Price *</Label>
                <Input type="number" value={form.display_price} onChange={(e) => setForm({ ...form, display_price: e.target.value })} placeholder="499" />
              </div>
              <div>
                <Label>Full Value (strikethrough)</Label>
                <Input type="number" value={form.course_value} onChange={(e) => setForm({ ...form, course_value: e.target.value })} placeholder="999" />
              </div>
            </div>
            <div>
              <Label>Payment Provider *</Label>
              <Select value={form.payment_provider} onValueChange={(v) => setForm({ ...form, payment_provider: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="payfast">PayFast</SelectItem>
                  <SelectItem value="link">External Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.payment_provider === "stripe" && (
              <div>
                <Label>Stripe Price ID</Label>
                <Input value={form.stripe_price_id} onChange={(e) => setForm({ ...form, stripe_price_id: e.target.value })} placeholder="price_xxxxx" />
              </div>
            )}
            <div>
              <Label>Checkout Link</Label>
              <Input value={form.checkout_link} onChange={(e) => setForm({ ...form, checkout_link: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <Label>Success URL</Label>
              <Input value={form.success_url} onChange={(e) => setForm({ ...form, success_url: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <Label>Sort Order</Label>
              <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>Active</Label>
            </div>
            <Button
              onClick={() => saveMutation.mutate(form)}
              disabled={!form.region_name || !form.currency_code || !form.display_price || saveMutation.isPending}
              className="w-full bg-[#6E1D40] hover:bg-[#5A1633] text-white"
            >
              {saveMutation.isPending ? "Saving..." : editingId ? "Update Region" : "Create Region"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}