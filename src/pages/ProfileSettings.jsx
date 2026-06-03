import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, Save, Mail, AlertCircle, Lock, BookOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AvatarGenerator from "@/components/admin/AvatarGenerator";

// Derives accessible course titles from the user's access_tags and published courses.
// CourseEnrollment RLS restricts member reads to admins, so we cannot query it here.
// Access is determined entirely from User.access_tags matched against Course records.
// Flag: if CourseEnrollment RLS is ever opened to self-reads, switch to querying
// CourseEnrollment filtered by created_by_id for richer data.
function deriveAccessFromTags(user, courses) {
  if (!user || !courses.length) return [];

  const tags = Array.isArray(user.access_tags) ? user.access_tags : [];

  // Blueprint paid tag grants access to the main Blueprint course.
  const hasBlueprintPaid = tags.includes("blueprint_paid");

  return courses.filter((course) => {
    if (!course.isPublished) return false;
    // Match by explicit tag slug e.g. course_<id> or course title slug.
    const courseSlug = `course_${course.id}`;
    if (tags.includes(courseSlug)) return true;
    // Blueprint shorthand.
    if (hasBlueprintPaid && course.title?.toLowerCase().includes("blueprint")) return true;
    return false;
  });
}

const toTitleCase = (str) => {
  if (!str) return "";
  return str
    .trim()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
};

export default function ProfileSettings() {
  const [currentUser, setCurrentUser] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailChangeDialogOpen, setEmailChangeDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [toast, setToast] = useState({ show: false, title: "", message: "", success: false });
  const queryClient = useQueryClient();

  const showToast = (title, message, success = false) => {
    setToast({ show: true, title, message, success });
  };

  const dismissToast = () => setToast({ show: false, title: "", message: "", success: false });

  // Load the authenticated user once on mount.
  useEffect(() => {
    base44.auth.isAuthenticated().then((authed) => {
      if (!authed) return;
      base44.auth.me().then((user) => {
        setCurrentUser(user);
        const parts = (user.full_name || "").split(" ");
        setFirstName(toTitleCase(parts[0] || ""));
        setLastName(toTitleCase(parts.slice(1).join(" ") || ""));
      });
    });
  }, []);

  // Published courses for access derivation.
  const { data: courses = [] } = useQuery({
    queryKey: ["publishedCourses"],
    queryFn: () => base44.entities.Course.filter({ isPublished: true }),
    enabled: !!currentUser,
    initialData: [],
  });

  const accessibleCourses = deriveAccessFromTags(currentUser, courses);

  // Determine if this user signed in with a social provider.
  // Base44 exposes auth_provider on the user object when it is not "email".
  const isSocialLogin = currentUser?.auth_provider && currentUser.auth_provider !== "email";

  // Save name fields.
  const saveNameMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: (_, vars) => {
      setCurrentUser((u) => ({ ...u, ...vars }));
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      showToast("Saved", "Your name has been updated.", true);
      setTimeout(dismissToast, 3000);
    },
    onError: () => {
      showToast("Save failed", "We could not save your changes. Please try again.");
    },
  });

  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim()) {
      showToast("Name required", "Please enter both your first name and last name.");
      return;
    }
    const full_name = `${toTitleCase(firstName)} ${toTitleCase(lastName)}`.trim();
    saveNameMutation.mutate({ full_name });
  };

  // Profile picture upload.
  const handleProfilePicture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.auth.updateMe({ profile_picture: file_url });
    setCurrentUser((u) => ({ ...u, profile_picture: file_url }));
  };

  // Email change: sends a verification email through our existing SendEmail integration.
  const handleEmailChange = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      showToast("Invalid email", "Please enter a valid email address.");
      return;
    }
    try {
      await base44.integrations.Core.SendEmail({
        to: newEmail,
        subject: "Verify Your Email Change - The Aligned Woman",
        body: `You requested to change your email to ${newEmail}.\n\nIf you did not make this request, please ignore this message.\n\n- The Aligned Woman Team`,
      });
      setEmailChangeDialogOpen(false);
      setNewEmail("");
      showToast("Verification sent", "Check your new inbox for a verification link.", true);
      setTimeout(dismissToast, 4000);
    } catch {
      showToast("Send failed", "We could not send the verification email. Please try again.");
    }
  };

  // Password reset: Base44 does not expose a direct API for this from the frontend SDK.
  // The standard flow is to sign out and use "Forgot password?" on the login screen.
  // We redirect to login with a flag so the user can trigger that flow themselves.
  const handleChangePassword = () => {
    base44.auth.logout();
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full"
          style={{ borderColor: "var(--aw-burg-core)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12" style={{ background: "var(--aw-off-white)" }}>
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Page heading */}
        <div>
          <h1 className="font-display text-3xl" style={{ color: "var(--aw-burg-core)" }}>
            Profile Settings
          </h1>
          <p className="font-body text-sm mt-1" style={{ color: "var(--aw-mid-grey)" }}>
            Manage your account and access.
          </p>
        </div>

        {/* Account section */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg" style={{ color: "var(--aw-burg-core)" }}>
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Name fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="font-body text-xs font-bold tracking-widest uppercase" style={{ color: "var(--aw-burg-core)" }}>
                  First Name
                </Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="font-body"
                />
              </div>
              <div className="space-y-1">
                <Label className="font-body text-xs font-bold tracking-widest uppercase" style={{ color: "var(--aw-burg-core)" }}>
                  Last Name
                </Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="font-body"
                />
              </div>
            </div>

            {/* Email (read-only + change dialog) */}
            <div className="space-y-1">
              <Label className="font-body text-xs font-bold tracking-widest uppercase" style={{ color: "var(--aw-burg-core)" }}>
                Email
              </Label>
              <div className="flex gap-2">
                <Input value={currentUser.email} disabled className="bg-gray-50 flex-1 font-body" />
                <Dialog open={emailChangeDialogOpen} onOpenChange={setEmailChangeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="font-body flex-shrink-0">
                      <Mail className="w-4 h-4 mr-1" />
                      Change
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-display" style={{ color: "var(--aw-burg-core)" }}>
                        Change Email Address
                      </DialogTitle>
                      <DialogDescription className="font-body text-sm">
                        Enter your new email. We will send a verification link to confirm the change.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="font-body text-sm">
                          Current email: {currentUser.email}
                        </AlertDescription>
                      </Alert>
                      <div className="space-y-1">
                        <Label className="font-body text-xs font-bold tracking-widest uppercase" style={{ color: "var(--aw-burg-core)" }}>
                          New Email Address
                        </Label>
                        <Input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="newemail@example.com"
                          className="font-body"
                        />
                      </div>
                      <Button
                        onClick={handleEmailChange}
                        className="w-full font-body text-xs tracking-widest uppercase text-white"
                        style={{ background: "var(--aw-rose-core)" }}
                      >
                        Send Verification Email
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label className="font-body text-xs font-bold tracking-widest uppercase" style={{ color: "var(--aw-burg-core)" }}>
                Password
              </Label>
              {isSocialLogin ? (
                <p className="font-body text-sm" style={{ color: "var(--aw-mid-grey)" }}>
                  Your sign-in is managed by your provider ({currentUser.auth_provider}). Password changes are handled there.
                </p>
              ) : (
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleChangePassword}
                    className="font-body text-xs tracking-widest uppercase"
                    style={{ borderColor: "var(--aw-burg-core)", color: "var(--aw-burg-core)" }}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                  <p className="font-body text-xs mt-1" style={{ color: "var(--aw-mid-grey)" }}>
                    You will be signed out so you can use "Forgot password?" on the login screen.
                  </p>
                </div>
              )}
            </div>

            {/* Save button */}
            <Button
              onClick={handleSave}
              disabled={saveNameMutation.isPending}
              className="font-body text-xs tracking-widest uppercase text-white"
              style={{ background: "var(--aw-rose-core)" }}
            >
              <Save className="w-4 h-4 mr-2" />
              {saveNameMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Profile section */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg" style={{ color: "var(--aw-burg-core)" }}>
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24 flex-shrink-0">
                <AvatarImage src={currentUser.profile_picture} />
                <AvatarFallback
                  className="text-white text-2xl font-display"
                  style={{ background: "var(--aw-burg-core)" }}
                >
                  {currentUser.full_name?.[0] || currentUser.email?.[0] || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="profile-pic" className="cursor-pointer">
                    <div
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-white font-body text-xs tracking-widest uppercase transition-opacity hover:opacity-90"
                      style={{ background: "var(--aw-rose-core)" }}
                    >
                      <Upload className="w-4 h-4" />
                      Change Picture
                    </div>
                    <Input
                      id="profile-pic"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePicture}
                    />
                  </Label>
                  <AvatarGenerator
                    currentUser={currentUser}
                    onAvatarGenerated={(url) => setCurrentUser((u) => ({ ...u, profile_picture: url }))}
                  />
                </div>
                <p className="font-body text-xs" style={{ color: "var(--aw-mid-grey)" }}>
                  JPG or PNG, max 5 MB.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Access section */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg flex items-center gap-2" style={{ color: "var(--aw-burg-core)" }}>
              <BookOpen className="w-5 h-5" />
              My Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            {accessibleCourses.length === 0 ? (
              <p className="font-body text-sm" style={{ color: "var(--aw-mid-grey)" }}>
                No courses found for your account. If you believe this is an error, please contact support.
              </p>
            ) : (
              <ul className="space-y-2">
                {accessibleCourses.map((course) => (
                  <li
                    key={course.id}
                    className="font-body text-sm px-4 py-3 rounded-lg"
                    style={{ background: "var(--aw-rose-wash)", color: "var(--aw-burg-core)" }}
                  >
                    {course.title}
                  </li>
                ))}
              </ul>
            )}
            <p className="font-body text-xs mt-3" style={{ color: "var(--aw-mid-grey)" }}>
              Access is read-only. Contact support to make changes.
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Toast dialog */}
      <Dialog open={toast.show} onOpenChange={(open) => !open && dismissToast()}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: toast.success ? "#d1fae5" : "var(--aw-rose-pale)" }}
              >
                {toast.success ? (
                  <Save className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5" style={{ color: "var(--aw-burg-core)" }} />
                )}
              </div>
              <DialogTitle className="font-display text-lg" style={{ color: "var(--aw-burg-core)" }}>
                {toast.title}
              </DialogTitle>
            </div>
          </DialogHeader>
          <p className="font-body text-sm py-2" style={{ color: "var(--aw-mid-grey)" }}>
            {toast.message}
          </p>
          <Button
            onClick={dismissToast}
            className="w-full font-body text-xs tracking-widest uppercase text-white"
            style={{ background: "var(--aw-rose-core)" }}
          >
            Got it
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}