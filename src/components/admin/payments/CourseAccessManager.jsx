import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { UserPlus, Trash2, Key, Search } from "lucide-react";

export default function CourseAccessManager() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [paymentSource, setPaymentSource] = useState("manual");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ["paidEnrollments"],
    queryFn: () => base44.entities.CourseEnrollment.filter({ isPaid: true }, "-created_date"),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["allCourses"],
    queryFn: () => base44.entities.Course.list(),
  });

  const grantAccessMutation = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke("grantCourseAccess", {
        email: email.toLowerCase(),
        courseId: selectedCourse,
        isPaid: true,
        paymentSource,
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["paidEnrollments"] });
      setDialogOpen(false);
      setEmail("");
      setSelectedCourse("");
      alert(data.userFound
        ? "Access granted! User has been updated."
        : "Access granted! The user will see the course when they sign up with this email."
      );
    },
  });

  const revokeAccessMutation = useMutation({
    mutationFn: async (enrollmentId) => {
      await base44.entities.CourseEnrollment.update(enrollmentId, { isPaid: false });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["paidEnrollments"] }),
  });

  const filtered = enrollments.filter((e) =>
    !searchQuery ||
    (e.userEmail || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.created_by || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCourseName = (courseId) => {
    const c = courses.find((c) => c.id === courseId);
    return c?.title || courseId;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-semibold text-gray-800">Course Access Management</h3>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-[#6E1D40] hover:bg-[#5A1633] text-white gap-2"
        >
          <UserPlus className="w-4 h-4" /> Grant Access
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by email..."
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin w-6 h-6 border-4 border-[#6E1D40] border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Key className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>No paid enrollments found.</p>
            <p className="text-sm">Grant access manually or via the payment webhook.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.userEmail || e.created_by}</TableCell>
                    <TableCell>{getCourseName(e.courseId)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{e.paymentSource || "—"}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">{e.transactionId || "—"}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm("Revoke paid access for this user?")) revokeAccessMutation.mutate(e.id);
                        }}
                      >
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Grant Course Access</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>User Email *</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div>
              <Label>Course *</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment Source</Label>
              <Select value={paymentSource} onValueChange={setPaymentSource}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="payfast">PayFast</SelectItem>
                  <SelectItem value="comp">Complimentary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => grantAccessMutation.mutate()}
              disabled={!email || !selectedCourse || grantAccessMutation.isPending}
              className="w-full bg-[#6E1D40] hover:bg-[#5A1633] text-white"
            >
              {grantAccessMutation.isPending ? "Granting..." : "Grant Access"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}