import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { SectionLabel } from "@/components/admin2/AdminCard";
import { Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";

const ROLES = ["owner", "admin", "master_admin", "moderator", "educator", "facilitator", "expert", "support", "member", "user"];

export default function UsersTab({ currentUser }) {
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const qc = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-all-users"],
    queryFn: async () => {
      const res = await base44.functions.invoke("getAllUsers");
      return res.data?.users || [];
    },
  });

  const updateRole = useMutation({
    mutationFn: ({ id, role }) => base44.entities.User.update(id, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-all-users"] }),
  });

  const invite = useMutation({
    mutationFn: () => base44.users.inviteUser(inviteEmail, inviteRole),
    onSuccess: () => { setInviteOpen(false); setInviteEmail(""); },
  });

  const filtered = users.filter(u =>
    !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <SectionLabel>All Users</SectionLabel>
        <Button onClick={() => setInviteOpen(true)} style={{ background: "#6B1B3D", color: "#fff", borderRadius: 100, fontSize: 12, fontFamily: "Montserrat, sans-serif" }}>
          <UserPlus className="w-4 h-4 mr-2" /> Invite User
        </Button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="pl-9 rounded-xl" />
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E0DC] overflow-hidden">
        {isLoading ? (
          <p className="p-8 text-center italic" style={{ color: "#9CA3AF" }}>Loading...</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F0E8E4]">
                {["Name", "Email", "Role", "Member Since", "Change Role"].map(h => (
                  <th key={h} className="text-left px-5 py-3" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "#C4866C", fontFamily: "Montserrat, sans-serif" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-[#F8F3F1] hover:bg-[#FDF9F8] transition-colors">
                  <td className="px-5 py-3" style={{ fontSize: 13, color: "#1a0510", fontFamily: "Montserrat, sans-serif" }}>{u.full_name || "—"}</td>
                  <td className="px-5 py-3" style={{ fontSize: 13, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>{u.email}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold capitalize" style={{ background: "#FDF5F3", color: "#6B1B3D", fontFamily: "Montserrat, sans-serif" }}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3" style={{ fontSize: 13, color: "#6B7280", fontFamily: "Montserrat, sans-serif" }}>
                    {u.created_date ? format(new Date(u.created_date), "d MMM yyyy") : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <Select value={u.role} onValueChange={role => updateRole.mutate({ id: u.id, role })} disabled={u.id === currentUser?.id}>
                      <SelectTrigger className="w-36 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invite User</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <Input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="Email address" type="email" />
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={() => invite.mutate()} disabled={!inviteEmail || invite.isPending} style={{ background: "#6B1B3D", color: "#fff", width: "100%", borderRadius: 100 }}>
              {invite.isPending ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}