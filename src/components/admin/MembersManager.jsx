import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Search, Users, Eye, Edit, Trash2, Tag, UserPlus } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import MemberDetailDialog from "./MemberDetailDialog";
import MemberAccessTagEditor from "./MemberAccessTagEditor";

export default function MembersManager({ allUsers }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [editTagsMember, setEditTagsMember] = useState(null);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addMode, setAddMode] = useState("invite"); // "invite" or "existing"
  const [selectedExistingUser, setSelectedExistingUser] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberTags, setNewMemberTags] = useState([]);
  const queryClient = useQueryClient();

  // Members = users with role member/user OR is_member flag
  const members = allUsers.filter(
    (u) => ["user", "member"].includes(u.role) || u.is_member
  );

  // Non-member users available to add as members
  const nonMembers = allUsers.filter(
    (u) => !["user", "member"].includes(u.role) && !u.is_member
  );

  const filtered = members.filter((m) =>
    !searchQuery ||
    (m.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { data: enrollments = [] } = useQuery({
    queryKey: ["allEnrollments"],
    queryFn: () => base44.entities.CourseEnrollment.filter({ isPaid: true }),
  });

  const { data: accessTags = [] } = useQuery({
    queryKey: ["accessTags"],
    queryFn: () => base44.entities.AccessTag.filter({ is_active: true }),
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (userId) => base44.entities.User.delete(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["allUsers"] }),
  });

  const inviteMemberMutation = useMutation({
    mutationFn: async ({ email, tags }) => {
      await base44.users.inviteUser(email, "member");
      return { email, tags };
    },
    onSuccess: (data) => {
      setAddMemberOpen(false);
      setNewMemberEmail("");
      setNewMemberTags([]);
      setAddMode("invite");
      setSelectedExistingUser("");
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      alert(`Invitation sent to ${data.email}!`);
    },
    onError: (error) => {
      alert(`Failed to send invitation: ${error.message}`);
    },
  });

  const addExistingMutation = useMutation({
    mutationFn: async (userId) => {
      await base44.entities.User.update(userId, { is_member: true });
    },
    onSuccess: () => {
      setAddMemberOpen(false);
      setSelectedExistingUser("");
      setAddMode("invite");
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });

  const getMembershipStatus = (user) => {
    if (user.membership_type === "paid") return "paid";
    const hasPaidEnrollment = enrollments.some(
      (e) => (e.userEmail || "").toLowerCase() === (user.email || "").toLowerCase() && e.isPaid
    );
    return hasPaidEnrollment ? "paid" : "free";
  };

  const paidCount = filtered.filter((m) => getMembershipStatus(m) === "paid").length;
  const freeCount = filtered.length - paidCount;

  const toggleNewMemberTag = (tagKey) => {
    setNewMemberTags(prev => 
      prev.includes(tagKey) ? prev.filter(t => t !== tagKey) : [...prev, tagKey]
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-2.5 sm:p-4 text-center">
            <p className="text-lg sm:text-2xl font-bold text-[#6E1D40]">{members.length}</p>
            <p className="text-[10px] sm:text-sm text-gray-500">Total Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2.5 sm:p-4 text-center">
            <p className="text-lg sm:text-2xl font-bold text-green-600">{paidCount}</p>
            <p className="text-[10px] sm:text-sm text-gray-500">Paid Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2.5 sm:p-4 text-center">
            <p className="text-lg sm:text-2xl font-bold text-gray-500">{freeCount}</p>
            <p className="text-[10px] sm:text-sm text-gray-500">Free</p>
          </CardContent>
        </Card>
      </div>

      {/* Search + Add */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search members..."
            className="pl-9"
          />
        </div>
        <Button
          onClick={() => { setAddMemberOpen(true); setAddMode("invite"); setSelectedExistingUser(""); }}
          className="text-white flex-shrink-0"
          style={{ backgroundColor: '#6E1D40' }}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Add Member</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="w-5 h-5" />
            Members ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell">Role</TableHead>
                <TableHead className="hidden lg:table-cell">Access Tags</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No members found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((member) => {
                  const status = getMembershipStatus(member);
                  const isTeamMember = !["user", "member"].includes(member.role);
                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarImage src={member.profile_picture} />
                            <AvatarFallback className="bg-[#6E1D40] text-white text-xs">
                              {member.full_name?.[0] || member.email?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{member.full_name || "Unnamed"}</p>
                            <p className="text-xs text-gray-400 truncate">{member.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge className={status === "paid"
                          ? "bg-green-100 text-green-800 border-0 text-xs"
                          : "bg-gray-100 text-gray-600 border-0 text-xs"
                        }>
                          {status === "paid" ? "Paid" : "Free"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {isTeamMember ? (
                          <Badge className="bg-purple-100 text-purple-800 border-0 text-xs capitalize">
                            {member.role?.replace("_", " ")}
                          </Badge>
                        ) : (
                          <span className="text-xs text-gray-400">Member</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {(member.access_tags || []).length > 0 ? (
                            (member.access_tags || []).slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">None</span>
                          )}
                          {(member.access_tags || []).length > 2 && (
                            <Badge variant="outline" className="text-xs">+{member.access_tags.length - 2}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-0.5">
                          <Button variant="ghost" size="sm" title="View" onClick={() => setSelectedMember(member)} className="h-8 w-8 p-0">
                            <Eye className="w-4 h-4 text-gray-600" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Tags" onClick={() => setEditTagsMember(member)} className="h-8 w-8 p-0">
                            <Tag className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Remove" onClick={() => { if (confirm(`Remove ${member.full_name || member.email}?`)) deleteMemberMutation.mutate(member.id); }} className="h-8 w-8 p-0">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedMember && (
        <MemberDetailDialog
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}

      {editTagsMember && (
        <MemberAccessTagEditor
          member={editTagsMember}
          onClose={() => setEditTagsMember(null)}
        />
      )}

      {/* Add Member Dialog */}
      <Dialog open={addMemberOpen} onOpenChange={(open) => { setAddMemberOpen(open); if (!open) { setAddMode("invite"); setSelectedExistingUser(""); setNewMemberEmail(""); setNewMemberTags([]); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Toggle between invite and existing */}
            <div className="flex gap-2">
              <button
                onClick={() => setAddMode("invite")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                  addMode === "invite" ? "bg-[#6E1D40] text-white border-[#6E1D40]" : "bg-white text-gray-600 border-gray-200"
                }`}
              >
                Invite New
              </button>
              <button
                onClick={() => setAddMode("existing")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                  addMode === "existing" ? "bg-[#6E1D40] text-white border-[#6E1D40]" : "bg-white text-gray-600 border-gray-200"
                }`}
              >
                Existing User
              </button>
            </div>

            {addMode === "invite" ? (
              <>
                <div>
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="member@example.com"
                  />
                </div>
                <div>
                  <Label>Access Tags (optional)</Label>
                  <p className="text-xs text-gray-500 mb-2">Tags will be applied once the member accepts their invitation.</p>
                  <div className="flex flex-wrap gap-2">
                    {accessTags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleNewMemberTag(tag.tag_key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          newMemberTags.includes(tag.tag_key)
                            ? "bg-[#6E1D40] text-white border-[#6E1D40]"
                            : "bg-white text-gray-600 border-gray-200 hover:border-[#DEBECC]"
                        }`}
                      >
                        {tag.label}
                      </button>
                    ))}
                    {accessTags.length === 0 && <p className="text-xs text-gray-400">No access tags created yet.</p>}
                  </div>
                </div>
                <Button
                  onClick={() => inviteMemberMutation.mutate({ email: newMemberEmail, tags: newMemberTags })}
                  disabled={!newMemberEmail || inviteMemberMutation.isPending}
                  className="w-full text-white"
                  style={{ backgroundColor: '#6E1D40' }}
                >
                  {inviteMemberMutation.isPending ? "Sending..." : "Send Invitation"}
                </Button>
              </>
            ) : (
              <>
                <div>
                  <Label>Select User</Label>
                  <Select value={selectedExistingUser} onValueChange={setSelectedExistingUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user to add as member..." />
                    </SelectTrigger>
                    <SelectContent>
                      {nonMembers.length === 0 ? (
                        <SelectItem value="_none" disabled>All users are already members</SelectItem>
                      ) : (
                        nonMembers.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.full_name || u.email} ({u.role})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => addExistingMutation.mutate(selectedExistingUser)}
                  disabled={!selectedExistingUser || selectedExistingUser === "_none" || addExistingMutation.isPending}
                  className="w-full text-white"
                  style={{ backgroundColor: '#6E1D40' }}
                >
                  {addExistingMutation.isPending ? "Adding..." : "Add as Member"}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}