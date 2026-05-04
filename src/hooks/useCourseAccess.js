import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Shared hook for course access logic.
 * Usage: const { hasAccess, isAdmin, isPaid, isFree, isComingSoon, isLoading, hasError } = useCourseAccess(course);
 */
export function useCourseAccess(course) {
  const [user, setUser] = useState(null);
  const [hasPaidEnrollment, setHasPaidEnrollment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!course?.id) {
      setIsLoading(false);
      return;
    }

    const fetchAccess = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const me = await base44.auth.me();
        setUser(me);

        if (me?.email) {
          const enrollments = await base44.entities.CourseEnrollment.filter({
            userEmail: me.email.toLowerCase(),
            courseId: course.id,
            isPaid: true,
          });
          setHasPaidEnrollment(enrollments.length > 0);
        }
      } catch (e) {
        console.error("[useCourseAccess]", e);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccess();
  }, [course?.id]);

  const isAdmin = ["admin", "owner", "master_admin"].includes(user?.role);
  const isComingSoon = course?.isComingSoon === true;
  const isFree = (!course?.tags || course.tags.length === 0) && (!course?.price || course.price === 0);
  const isPaid =
    user?.membership_type === "paid" ||
    (course?.tags?.length > 0 && course.tags.some((t) => (user?.access_tags ?? []).includes(t))) ||
    hasPaidEnrollment;

  const hasAccess = isAdmin || (!isComingSoon && (isPaid || isFree));

  return { hasAccess, isAdmin, isPaid, isFree, isComingSoon, isLoading, hasError };
}