import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Users, Trash2 } from "lucide-react";

export default function WaitlistManager() {
  const queryClient = useQueryClient();

  const { data: signups = [], isLoading } = useQuery({
    queryKey: ["waitlistSignups"],
    queryFn: () => base44.entities.WaitlistSignup.list("-created_date", 200),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.WaitlistSignup.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["waitlistSignups"] }),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin w-6 h-6 border-4 border-[#6E1D40] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Waitlist Signups ({signups.length})</h3>
      </div>

      {signups.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>No waitlist signups yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Age Range</TableHead>
                  <TableHead>Life Stage</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signups.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.full_name}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>{s.age_range || "—"}</TableCell>
                    <TableCell>{s.life_stage || "—"}</TableCell>
                    <TableCell>
                      <div className="text-xs">
                        {s.source_page && <Badge variant="outline" className="mr-1">{s.source_page}</Badge>}
                        {s.utm_source && <span className="text-gray-400">{s.utm_source}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {s.created_date ? new Date(s.created_date).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => {
                        if (confirm("Delete this signup?")) deleteMutation.mutate(s.id);
                      }}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}