import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import TabHeader from "./TabHeader";

const ROLES = ["user", "member", "expert", "educator", "facilitator", "support", "moderator", "admin", "master_admin", "owner"];

export default function UsersTab() {
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await base44.functions.invoke("getAllUsers");
      return res.data.users || [];
    },
  });

  const updateRole = useMutation({
    mutationFn: ({ id, role }) => base44.entities.User.update(id, { role }),
    onSuccess: () => qc.invalidateQueries(["admin-users"]),
  });

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const roleColor = { owner: "#6B1B3D", admin: "#1d4ed8", master_admin: "#7c3aed", moderator: "#0891b2", expert: "#d97706", user: "#6b7280", member: "#16a34a" };

  return (
    <div>
      <TabHeader title="Users" subtitle="Manage all registered users" />

      <div className="mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full max-w-sm px-4 py-2 rounded-lg border text-sm"
          style={{ borderColor: "rgba(107,27,61,0.2)", outline: "none" }}
        />
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid rgba(107,27,61,0.1)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#FAF5F3" }}>
                {["Name", "Email", "Role", "Joined", "Change Role"].map(h => (
                  <th key={h} className="px-4 py-3 text-left" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#C4866C" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="border-t" style={{ borderColor: "rgba(107,27,61,0.06)" }}>
                  <td className="px-4 py-3 text-sm font-medium">{u.full_name || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold capitalize" style={{ background: `${roleColor[u.role] || "#6b7280"}20`, color: roleColor[u.role] || "#6b7280" }}>
                      {u.role?.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{u.created_date ? new Date(u.created_date).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={e => updateRole.mutate({ id: u.id, role: e.target.value })}
                      className="text-sm px-2 py-1 rounded border"
                      style={{ borderColor: "rgba(107,27,61,0.2)" }}
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}