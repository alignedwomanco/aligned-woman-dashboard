/**
 * Global admin preview mode helper.
 * When active, all user-facing pages skip CourseProgress, WorkbookResponse,
 * MemberProfile etc. and behave as if the user is brand new.
 */

const KEY = "aw_admin_preview";

export function isPreviewMode() {
  try {
    return sessionStorage.getItem(KEY) === "new_user";
  } catch {
    return false;
  }
}

export function enablePreviewMode() {
  try {
    sessionStorage.setItem(KEY, "new_user");
  } catch {}
}

export function disablePreviewMode() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
}