import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, UserPlus, TrendingUp, DollarSign, Eye, Plus, X, Edit, Upload, Mail, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import ImageCropper from "./ImageCropper";
import ExpertCategoryManager from "./ExpertCategoryManager";

export default function ExpertsManagementContent({ expertOnlyEmail = null }) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("expert");
  const [editExpertDialogOpen, setEditExpertDialogOpen] = useState(false);
  const [currentExpert, setCurrentExpert] = useState(null);
  const [expertForm, setExpertForm] = useState({
    name: "",
    title: "",
    bio: "",
    profile_picture: "",
    category: [],
    specialties: [],
    services: [],
    teaching_courses: [],
    isPublished: true,
    linked_user_email: "",
  });
  const [cropperOpen, setCropperOpen] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);
  const [grantBlueprint, setGrantBlueprint] = useState(false);
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const PLATFORM_OPTIONS = ["Website", "Email", "Instagram", "LinkedIn", "TikTok", "YouTube", "Twitter/X", "Other"];

  const signupLink = "https://app.alignedwomanco.com/welcome";

  const { data: expertCategoriesRaw = [] } = useQuery({
    queryKey: ["expertCategories"],
    queryFn: () => base44.entities.ExpertCategory.list(),
  });

  const expertCategories = [...expertCategoriesRaw].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const { data: expertsProfiles = [] } = useQuery({
    queryKey: ["expertsProfiles"],
    queryFn: () => base44.entities.Expert.list(),
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: preApproved = [] } = useQuery({
    queryKey: ["preApprovedMembers"],
    queryFn: () => base44.entities.PreApprovedMember.list(),
  });

  const { data: allCourses = [] } = useQuery({
    queryKey: ["adminCourses"],
    queryFn: () => base44.entities.Course.list(),
  });

  const { data: moduleEngagement = [] } = useQuery({
    queryKey: ["moduleEngagement"],
    queryFn: () => base44.entities.ModuleEngagement.list("-created_date", 100),
  });

  const expertsAndCreators = allUsers.filter(u =>
    ["expert", "course_creator"].includes(u.role)
  );

  const updateUserRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => base44.entities.User.update(userId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => base44.entities.User.delete(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });

  const sendInviteMutation = useMutation({
    mutationFn: async ({ email, role }) => {
      await base44.integrations.Core.SendEmail({
        to: email,
        subject: "Invitation to Join as Expert - The Aligned Woman Blueprint",
        body: `You've been invited to join The Aligned Woman Blueprint as ${role.replace("_", " ")}. Please sign up at ${window.location.origin}`,
      });
    },
    onSuccess: () => {
      setInviteDialogOpen(false);
      setInviteEmail("");
      setInviteRole("expert");
    },
  });

  const createExpertMutation = useMutation({
    mutationFn: (data) => base44.entities.Expert.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expertsProfiles"] });
    },
  });

  const updateExpertMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Expert.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expertsProfiles"] });
    },
  });

  const deleteExpertMutation = useMutation({
    mutationFn: (id) => base44.entities.Expert.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expertsProfiles"] });
    },
  });

  const resetForm = () => {
    setCurrentExpert(null);
    setExpertForm({
      name: "",
      title: "",
      bio: "",
      profile_picture: "",
      category: [],
      specialties: [],
      services: [],
      teaching_courses: [],
      isPublished: true,
      linked_user_email: "",
    });
    setGrantBlueprint(false);
    setInviteMsg("");
    setCopied(false);
  };

  // Does this email already hold blueprint access on its User record?
  const emailHasBlueprint = (email) => {
    const e = (email || "").trim().toLowerCase();
    if (!e) return false;
    const u = allUsers.find((x) => x.email && x.email.toLowerCase() === e);
    return !!(u && Array.isArray(u.access_tags) && u.access_tags.includes("blueprint_paid"));
  };

  // Is there a queued (unclaimed) blueprint grant waiting for this email?
  const emailHasPendingGrant = (email) => {
    const e = (email || "").trim().toLowerCase();
    if (!e) return false;
    return preApproved.some((p) => p.email && p.email.toLowerCase() === e && p.status !== "claimed");
  };

  const openEditDialog = (expert = null) => {
    setInviteMsg("");
    setCopied(false);
    if (expert) {
      setCurrentExpert(expert);
      // Normalize legacy single-string category to array
      const normalizedCategory = Array.isArray(expert.category)
        ? expert.category
        : expert.category ? [expert.category] : [];
      setExpertForm({ ...expert, category: normalizedCategory });
      setSocialLinks(Array.isArray(expert.social_links) ? expert.social_links : []);
      const le = (expert.linked_user_email || "").trim();
      setGrantBlueprint(emailHasBlueprint(le) || emailHasPendingGrant(le));
    } else {
      resetForm();
      setSocialLinks([]);
      setGrantBlueprint(false);
    }
    setEditExpertDialogOpen(true);
  };

  // Grant or cancel a queued blueprint grant for an email, keyed by email only.
  // Membership never lives on the Expert record, so the two stay decoupled.
  const applyBlueprintGrant = async (email) => {
    const e = (email || "").trim().toLowerCase();
    if (!e) return;
    const alreadyTagged = emailHasBlueprint(e);
    const pending = preApproved.find((p) => p.email && p.email.toLowerCase() === e && p.status !== "claimed");
    if (grantBlueprint) {
      if (!alreadyTagged && !pending) {
        await base44.entities.PreApprovedMember.create({
          email: e,
          grant_membership_type: "paid",
          grant_access_tags: ["blueprint_paid"],
          status: "pending",
          note: expertForm.name || "Expert invite",
        });
      }
    } else if (pending) {
      await base44.entities.PreApprovedMember.delete(pending.id);
    }
  };

  const persistExpert = async () => {
    const formWithLinks = { ...expertForm, social_links: socialLinks.filter((l) => l.platform && l.url) };
    if (currentExpert) {
      await updateExpertMutation.mutateAsync({ id: currentExpert.id, data: formWithLinks });
      return currentExpert.id;
    }
    const created = await createExpertMutation.mutateAsync(formWithLinks);
    if (created && created.id) setCurrentExpert(created);
    return created && created.id;
  };

  const handleSaveOnly = async () => {
    try {
      await persistExpert();
      await applyBlueprintGrant(expertForm.linked_user_email);
      queryClient.invalidateQueries({ queryKey: ["expertsProfiles"] });
      queryClient.invalidateQueries({ queryKey: ["preApprovedMembers"] });
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      setEditExpertDialogOpen(false);
      resetForm();
    } catch (err) {
      setInviteMsg("Could not save. " + (err?.message || "Please try again."));
    }
  };

  const handleSaveAndInvite = async () => {
    const email = (expertForm.linked_user_email || "").trim().toLowerCase();
    if (!email) {
      setInviteMsg("Add a pre-authorized email before inviting.");
      return;
    }
    setInviteSending(true);
    setInviteMsg("");
    try {
      await persistExpert();
      await applyBlueprintGrant(email);
      queryClient.invalidateQueries({ queryKey: ["expertsProfiles"] });
      queryClient.invalidateQueries({ queryKey: ["preApprovedMembers"] });
      let note = "";
      try {
        await base44.integrations.Core.SendEmail({
          to: email,
          subject: "You're pre-approved - The Aligned Woman",
          body: `Hi,\n\nYou have been pre-approved to access your expert dashboard on The Aligned Woman.\n\nSign in using this email address (${email}) here:\n${signupLink}\n\nOnce you sign in, your profile will be ready to edit.\n\nWarmly,\nThe Aligned Woman team`,
        });
        note = "Invite email sent to " + email + ". ";
      } catch (mailErr) {
        note = "Saved and access set, but the email did not send (delivery may not be configured). Copy the link below and send it directly. ";
      }
      setInviteMsg(note + "They sign in with " + email + " to get access.");
    } catch (err) {
      setInviteMsg("Could not complete. " + (err?.message || "Please try again."));
    } finally {
      setInviteSending(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(signupLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setInviteMsg("Could not copy automatically. The link is: " + signupLink);
    }
  };

  const addService = () => {
    setExpertForm({
      ...expertForm,
      services: [...expertForm.services, { name: "", description: "", price: 0, duration: "" }],
    });
  };

  const updateService = (index, field, value) => {
    const updated = [...expertForm.services];
    updated[index][field] = value;
    setExpertForm({ ...expertForm, services: updated });
  };

  const removeService = (index) => {
    setExpertForm({
      ...expertForm,
      services: expertForm.services.filter((_, i) => i !== index),
    });
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      course_creator: "bg-orange-100 text-orange-800",
      expert: "bg-pink-100 text-pink-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const getExpertMetrics = (expertEmail) => {
    const expertModules = moduleEngagement.filter(e => e.created_by === expertEmail);
    const views = expertModules.length;
    const uniqueUsers = new Set(expertModules.map(e => e.created_by)).size;

    return {
      views,
      uniqueUsers,
      revenue: (views * 2.5).toFixed(2), // Mock revenue calculation
    };
  };

  // If expertOnlyEmail is set, filter to only that expert's profile
  const visibleProfiles = expertOnlyEmail
    ? expertsProfiles.filter(e => e.linked_user_email?.toLowerCase() === expertOnlyEmail.toLowerCase())
    : expertsProfiles;

  // Helper: get all category IDs for an expert (supports both legacy string and new array)
  const getExpertCategoryIds = (expert) =>
    Array.isArray(expert.category) ? expert.category : expert.category ? [expert.category] : [];

  // Sort experts by first category order
  const sortedExperts = [...visibleProfiles].sort((a, b) => {
    const aCatIds = getExpertCategoryIds(a);
    const bCatIds = getExpertCategoryIds(b);
    const aCat = expertCategories.find((c) => aCatIds.includes(c.id));
    const bCat = expertCategories.find((c) => bCatIds.includes(c.id));
    const aOrder = aCat?.order ?? 9999;
    const bOrder = bCat?.order ?? 9999;
    return aOrder - bOrder;
  });

  const getExpertStatus = (expert) => {
    if (!expert.linked_user_email) return "not_invited";
    const linkedUser = allUsers.find(
      (u) => u.email?.toLowerCase() === expert.linked_user_email?.toLowerCase()
    );
    if (linkedUser) return "active";
    return "invited";
  };

  const linkUserMutation = useMutation({
    mutationFn: ({ expertId, email }) => base44.entities.Expert.update(expertId, { linked_user_email: email }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expertsProfiles"] }),
  });

  const linkedEmailNow = (expertForm.linked_user_email || "").trim();
  const blueprintStateLabel = !linkedEmailNow
    ? ""
    : emailHasBlueprint(linkedEmailNow)
      ? "This account already has course access."
      : emailHasPendingGrant(linkedEmailNow)
        ? "Course access is queued and applies at their next login."
        : "No course access yet. Toggle on to grant it.";

  return (
    <div className="space-y-6">
      {/* Experts Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">Experts</CardTitle>
              <p className="text-gray-600">Manage expert profiles shown on the Experts page</p>
            </div>
            <Button onClick={() => openEditDialog()} className="bg-[#6E1D40] hover:bg-[#5A1633]">
              <Plus className="w-4 h-4 mr-2" />
              Add Expert Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-4 pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Expert</TableHead>
                <TableHead className="hidden sm:table-cell">Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Linked Account</TableHead>
                <TableHead className="hidden lg:table-cell">Services</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedExperts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">No experts added yet.</TableCell>
                </TableRow>
              ) : (
                sortedExperts.map((expert) => {
                  const status = getExpertStatus(expert);
                  const linkedUser = expert.linked_user_email
                    ? allUsers.find((u) => u.email?.toLowerCase() === expert.linked_user_email?.toLowerCase())
                    : null;
                  return (
                    <TableRow key={expert.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9 flex-shrink-0">
                            <AvatarImage src={expert.profile_picture} />
                            <AvatarFallback className="bg-[#6E1D40] text-white text-xs">
                              {expert.name?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm text-[#6E1D40]">{expert.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-gray-600 max-w-[200px] truncate">
                        {expert.title}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {getExpertCategoryIds(expert).map((catId) => {
                            const cat = expertCategories.find((c) => c.id === catId);
                            return cat ? (
                              <Badge key={catId} className="bg-purple-100 text-purple-800 border-0 text-[10px] px-1.5 py-0">
                                {cat.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={{
                          active: "bg-green-100 text-green-800 border-0 text-xs",
                          invited: "bg-yellow-100 text-yellow-800 border-0 text-xs",
                          not_invited: "bg-gray-100 text-gray-500 border-0 text-xs",
                        }[status]}>
                          {status === "active" ? "Active" : status === "invited" ? "Invited" : "Not Invited"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {linkedUser ? (
                          <span className="text-sm text-gray-600">{linkedUser.email}</span>
                        ) : expert.linked_user_email ? (
                          <span className="text-sm text-yellow-600">{expert.linked_user_email} (pending)</span>
                        ) : (
                          <Select
                            value=""
                            onValueChange={(email) => linkUserMutation.mutate({ expertId: expert.id, email })}
                          >
                            <SelectTrigger className="w-44 h-8 text-xs">
                              <SelectValue placeholder="Link account..." />
                            </SelectTrigger>
                            <SelectContent>
                              {allUsers.filter(u => u.email).map((u) => (
                                <SelectItem key={u.id} value={u.email}>
                                  {u.full_name || u.email} ({u.role})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {expert.services?.length > 0 ? (
                          <Badge className="bg-green-100 text-green-800 border-0 text-xs">
                            {expert.services.length} service{expert.services.length > 1 ? "s" : ""}
                          </Badge>
                        ) : (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(expert)} className="h-8 w-8 p-0">
                            <Edit className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => { if (confirm(`Delete ${expert.name}?`)) deleteExpertMutation.mutate(expert.id); }} className="h-8 w-8 p-0">
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

      {/* Category Manager */}
      <ExpertCategoryManager />

      {/* User Roles Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">User Roles Management</CardTitle>
              <p className="text-gray-600">Manage expert and course creator user accounts</p>
            </div>
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#6E1D40] hover:bg-[#5A1633]">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Expert
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Expert or Course Creator</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="expert@example.com"
                    />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expert">Expert</SelectItem>
                        <SelectItem value="course_creator">Course Creator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => sendInviteMutation.mutate({ email: inviteEmail, role: inviteRole })}
                    disabled={!inviteEmail}
                    className="w-full bg-[#6E1D40]"
                  >
                    Send Invitation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Expert</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Change Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expertsAndCreators.map((expert) => {
                const metrics = getExpertMetrics(expert.email);
                return (
                  <TableRow key={expert.id}>
                    <TableCell className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={expert.profile_picture} />
                        <AvatarFallback className="bg-[#6E1D40] text-white">
                          {expert.full_name?.[0] || expert.email?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{expert.full_name || "Expert"}</span>
                    </TableCell>
                    <TableCell>{expert.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(expert.role)}>
                        {expert.role?.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-gray-500" />
                        {metrics.views}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-green-600">
                        <DollarSign className="w-4 h-4" />
                        ${metrics.revenue}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={expert.role}
                        onValueChange={(role) =>
                          updateUserRoleMutation.mutate({ userId: expert.id, role })
                        }
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                          <SelectItem value="course_creator">Course Creator</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteUserMutation.mutate(expert.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to={createPageUrl("AdminSettings") + "?tab=courses"}>
              <Button variant="outline" className="w-full justify-start">
                Manage Course Content
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start">
              View Performance Analytics
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Payment Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Expert Dialog */}
      <Dialog open={editExpertDialogOpen} onOpenChange={setEditExpertDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentExpert ? "Edit Expert Profile" : "Add Expert Profile"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={expertForm.name}
                onChange={(e) => setExpertForm({ ...expertForm, name: e.target.value })}
                placeholder="Expert full name"
              />
            </div>

            <div>
              <Label>Title *</Label>
              <Input
                value={expertForm.title}
                onChange={(e) => setExpertForm({ ...expertForm, title: e.target.value })}
                placeholder="e.g., Nervous System Specialist"
              />
            </div>

            {/* Access and invite */}
            <div className="rounded-lg border border-gray-200 p-4 space-y-3">
              <div>
                <Label>Pre-authorized email</Label>
                <Input
                  type="email"
                  value={expertForm.linked_user_email || ""}
                  onChange={(e) => setExpertForm({ ...expertForm, linked_user_email: e.target.value })}
                  placeholder="them@example.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  They sign in with this email to reach their dashboard. Access attaches automatically the first time they log in, whether or not they already have an account.
                </p>
              </div>

              <div>
                <Label className="text-xs text-gray-500">Or pick an existing account</Label>
                <Select
                  value={expertForm.linked_user_email || ""}
                  onValueChange={(val) => setExpertForm({ ...expertForm, linked_user_email: val === "_none" ? "" : val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an existing user account..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">No linked account</SelectItem>
                    {allUsers.filter(u => u.email).map((u) => (
                      <SelectItem key={u.id} value={u.email}>
                        {u.full_name || u.email} ({u.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={grantBlueprint}
                    onChange={(e) => setGrantBlueprint(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Blueprint paid member (grants course access)</span>
                </label>
                {linkedEmailNow && (
                  <p className="text-xs text-gray-500 mt-1">{blueprintStateLabel}</p>
                )}
                {!grantBlueprint && linkedEmailNow && emailHasBlueprint(linkedEmailNow) && (
                  <p className="text-xs text-yellow-700 mt-1">
                    Turning this off will not remove access they already have. Remove that from the user admin.
                  </p>
                )}
              </div>

              <div className="pt-1">
                <Label className="text-xs text-gray-500">Invite link</Label>
                <div className="flex gap-2">
                  <Input value={signupLink} readOnly className="flex-1 text-xs" />
                  <Button type="button" variant="outline" onClick={handleCopyLink}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                {inviteMsg && <p className="text-xs text-gray-600 mt-2">{inviteMsg}</p>}
              </div>
            </div>

            <div>
              <Label>Bio</Label>
              <Textarea
                value={expertForm.bio}
                onChange={(e) => setExpertForm({ ...expertForm, bio: e.target.value })}
                placeholder="Expert biography"
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label>Categories</Label>
              <p className="text-xs text-gray-400 mb-2">Select one or more categories</p>
              <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                {expertCategories.length === 0 && (
                  <p className="text-xs text-gray-400">No categories available</p>
                )}
                {expertCategories.map((cat) => {
                  const selected = (expertForm.category || []).includes(cat.id);
                  return (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-1 py-1">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => {
                          const current = expertForm.category || [];
                          setExpertForm({
                            ...expertForm,
                            category: selected
                              ? current.filter((id) => id !== cat.id)
                              : [...current, cat.id],
                          });
                        }}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">{cat.name}</span>
                    </label>
                  );
                })}
              </div>
              {(expertForm.category || []).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {(expertForm.category || []).map((id) => {
                    const cat = expertCategories.find((c) => c.id === id);
                    return cat ? (
                      <Badge key={id} className="bg-purple-100 text-purple-800 border-0 text-xs">
                        {cat.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            <div>
              <Label>Teaching in</Label>
              <p className="text-xs text-gray-400 mb-2">Select the courses this expert teaches</p>
              <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                {allCourses.length === 0 && (
                  <p className="text-xs text-gray-400">No courses available</p>
                )}
                {allCourses.map((course) => {
                  const selected = (expertForm.teaching_courses || []).includes(course.id);
                  return (
                    <label key={course.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-1 py-1">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => {
                          const current = expertForm.teaching_courses || [];
                          setExpertForm({
                            ...expertForm,
                            teaching_courses: selected
                              ? current.filter((id) => id !== course.id)
                              : [...current, course.id],
                          });
                        }}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">{course.title}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <Label>Profile Picture</Label>
              <div className="flex items-center gap-3">
                {expertForm.profile_picture && (
                  <img
                    src={expertForm.profile_picture}
                    alt="Profile preview"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div className="flex-1 space-y-2">
                  <label htmlFor="expert-pic-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors" style={{ backgroundColor: '#6E1D40' }}>
                      <Upload className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {expertForm.profile_picture ? 'Change Picture' : 'Upload Picture'}
                      </span>
                    </div>
                  </label>
                  <input
                    id="expert-pic-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setTempImage(event.target.result);
                          setCropperOpen(true);
                        };
                        reader.readAsDataURL(file);
                      }
                      e.target.value = null;
                    }}
                  />
                  <p className="text-xs text-gray-500">JPG, PNG, max 5MB</p>
                </div>
              </div>
            </div>

            {/* Links Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Links</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSocialLinks([...socialLinks, { platform: "", url: "" }])}
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Link
                </Button>
              </div>
              <div className="space-y-2">
                {socialLinks.map((link, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Select
                      value={link.platform}
                      onValueChange={(val) => {
                        const updated = [...socialLinks];
                        updated[idx].platform = val;
                        setSocialLinks(updated);
                      }}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORM_OPTIONS.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      className="flex-1"
                      placeholder="URL or email"
                      value={link.url}
                      onChange={(e) => {
                        const updated = [...socialLinks];
                        updated[idx].url = e.target.value;
                        setSocialLinks(updated);
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setSocialLinks(socialLinks.filter((_, i) => i !== idx))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Services</Label>
              <div className="space-y-3 mt-2">
                {expertForm.services.map((service, idx) => (
                  <div key={idx} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Service {idx + 1}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeService(idx)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Service name"
                      value={service.name}
                      onChange={(e) => updateService(idx, "name", e.target.value)}
                    />
                    <Textarea
                      placeholder="Service description"
                      value={service.description}
                      onChange={(e) => updateService(idx, "description", e.target.value)}
                      className="min-h-[60px]"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Price"
                        value={service.price}
                        onChange={(e) => updateService(idx, "price", parseFloat(e.target.value))}
                      />
                      <Input
                        placeholder="Duration (e.g., 60 min)"
                        value={service.duration}
                        onChange={(e) => updateService(idx, "duration", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addService}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={expertForm.isPublished}
                onChange={(e) => setExpertForm({ ...expertForm, isPublished: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="isPublished" className="cursor-pointer">
                Publish on Experts page
              </Label>
            </div>

            <div className="flex flex-wrap gap-2 pt-4">
              <Button
                onClick={handleSaveAndInvite}
                disabled={!expertForm.name || !expertForm.title || inviteSending}
                className="flex-1 min-w-[160px] bg-[#6E1D40] hover:bg-[#5A1633]"
              >
                <Mail className="w-4 h-4 mr-2" />
                {inviteSending ? "Sending..." : "Save & send invite"}
              </Button>
              <Button
                variant="outline"
                onClick={handleSaveOnly}
                disabled={!expertForm.name || !expertForm.title}
              >
                {currentExpert ? "Update only" : "Save only"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditExpertDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Cropper */}
      {cropperOpen && tempImage && (
        <ImageCropper
          image={tempImage}
          onCrop={async (blob) => {
            const file = new File([blob], "profile.jpg", { type: "image/jpeg" });
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            setExpertForm({ ...expertForm, profile_picture: file_url });
            setCropperOpen(false);
            setTempImage(null);
          }}
          onCancel={() => {
            setCropperOpen(false);
            setTempImage(null);
          }}
        />
      )}
    </div>
  );
}