const PRIVILEGED_ROLES = ["admin", "master_admin", "owner"];

export function hasBlueprintAccess(user) {
  if (!user) return false;
  if (PRIVILEGED_ROLES.includes(user.role)) return true;
  const tags = Array.isArray(user.access_tags) ? user.access_tags : [];
  if (tags.includes("blueprint_paid")) return true;
  if (user.membership_type === "paid") return true;
  return false;
}

export function getMembershipStatus(user, enrollments = []) {
  if (hasBlueprintAccess(user)) return "paid";
  const email = (user?.email || "").toLowerCase();
  const hasPaidEnrollment = enrollments.some(
    (e) => (e.userEmail || "").toLowerCase() === email && e.isPaid
  );
  return hasPaidEnrollment ? "paid" : "free";
}