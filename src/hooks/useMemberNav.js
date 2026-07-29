import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

// ────────────────────────────────────────────────────────────────
// useMemberNav · one definition of the member navigation, so the
// desktop sidebar and the mobile drawer can never drift apart.
//
// The query keys deliberately match DashboardSidebar's, so TanStack
// Query serves every caller from a single cache entry and additional
// consumers add no network calls.
//
// DashboardSidebar still holds its own copy of this logic. When it is
// next touched it should import this hook instead. Doing that now would
// reach into Layout.jsx, which shares the sidebar with Classroom and the
// Directory, and that is a wider change than the mobile drawer needs.
// ────────────────────────────────────────────────────────────────

export default function useMemberNav() {
  const location = useLocation();

  const { data: currentUser } = useQuery({
    queryKey: ["sidebar-current-user"],
    queryFn: () => base44.auth.me(),
  });

  // An approved expert is anyone whose login email is linked to an Expert
  // record. That link is set on invite or application approval and is
  // independent of Blueprint access. Members who are not experts never see
  // My Profile point at the expert dashboard.
  const { data: linkedExperts = [] } = useQuery({
    queryKey: ["sidebar-expert-link", currentUser?.email],
    queryFn: () => base44.entities.Expert.filter({ linked_user_email: currentUser.email }),
    enabled: !!currentUser?.email,
  });
  const isApprovedExpert = linkedExperts.length > 0;

  const isActive = (pageName) => {
    const url = createPageUrl(pageName);
    return location.pathname === url || location.pathname === `/${pageName}`;
  };

  return [
    { name: "Dashboard", to: createPageUrl("Dashboard"), active: isActive("Dashboard") },
    { name: "Classroom", to: createPageUrl("Classroom"), active: isActive("Classroom") },
    // Community stays active on a group page too, so the sidebar does not
    // go blank once you are inside /Community/hormone-health.
    { name: "Community", to: createPageUrl("Community"), active: location.pathname.toLowerCase().startsWith("/community") },
    { name: "Directory", to: createPageUrl("ExpertsDirectory"), active: isActive("ExpertsDirectory") },
    {
      name: "My Profile",
      to: isApprovedExpert ? "/expert-dashboard" : createPageUrl("ProfileSettings"),
      active: isApprovedExpert
        ? location.pathname === "/expert-dashboard"
        : isActive("ProfileSettings"),
    },
  ];
}
