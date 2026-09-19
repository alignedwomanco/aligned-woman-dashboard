import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import DashboardSidebar from "@/components/dashboard-v2/DashboardSidebar";
import {
  CommunityStyles, Eyebrow, Chip, Knob,
  serif, sans, joinedLabel, sessionDateLabel,
} from "@/components/community/communityUI";

// ────────────────────────────────────────────────────────────────
// Community index · Your groups, then Discover, then the two quiet
// banners. Two states: nothing joined, and in one or more groups.
// ────────────────────────────────────────────────────────────────

export default function Community() {
  const { data: currentUser } = useQuery({
    queryKey: ["sidebar-current-user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: groups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ["community-groups"],
    queryFn: () => base44.entities.Group.filter({ is_active: true }, "order", 200),
  });

  // Membership rows are matched on user_email, not created_by: a partner
  // room's rows are written by a service role function, so created_by is
  // not the member. user_email is set on every row, old and new.
  const { data: myMemberships = [], isLoading: memLoading } = useQuery({
    queryKey: ["community-my-memberships", currentUser?.email],
    queryFn: () => base44.entities.GroupMember.filter({ user_email: currentUser.email }, "-created_date", 200),
    enabled: !!currentUser?.email,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["community-upcoming-sessions"],
    queryFn: () => base44.entities.LiveSession.list("scheduled_for", 200),
  });

  const isLoading = groupsLoading || memLoading;

  const membershipByGroup = {};
  myMemberships.forEach((m) => { membershipByGroup[m.group_id] = m; });

  // Next scheduled session per group. Cancelled and past sessions never
  // surface as "next".
  const nextByGroup = {};
  const now = Date.now();
  sessions
    .filter((s) => s.status !== "cancelled" && new Date(s.scheduled_for).getTime() > now)
    .sort((a, b) => new Date(a.scheduled_for) - new Date(b.scheduled_for))
    .forEach((s) => { if (!nextByGroup[s.group_id]) nextByGroup[s.group_id] = s; });

  // A partner room in draft is invisible everywhere until its host
  // publishes it. A pending request is not a membership yet.
  const visibleGroups = groups.filter((g) => g.status !== "draft");
  const isIn = (g) => membershipByGroup[g.id] && (membershipByGroup[g.id].status || "approved") === "approved";
  const joined = visibleGroups.filter((g) => isIn(g));
  const discover = visibleGroups.filter((g) => !isIn(g) && g.visibility !== "secret");

  return (
    <div className="aw-c min-h-screen flex">
      <CommunityStyles />
      <DashboardSidebar />

      <div className="flex-1 lg:ml-72">
        <div className="page">
          <div className="page-head" style={{ padding: "0 10px", marginBottom: 8 }}>
            <h1>Community</h1>
            <p>Rooms to meet people, ask questions, and hear from the women who know.</p>
          </div>

          <p className="section-title" style={{ marginBottom: 18 }}>Your groups</p>
          <div className="main">
            {isLoading ? (
              <div className="card quiet">
                <p style={{ fontSize: 12.5, color: "var(--note)", margin: 0 }}>Loading...</p>
              </div>
            ) : joined.length === 0 ? (
              <div className="empty">
                <p style={{ margin: 0 }}>
                  You have not joined a group yet.{" "}
                  {discover[0] ? `${discover[0].name} is open to everyone.` : "New groups are opening soon."}
                </p>
              </div>
            ) : (
              joined.map((g) => (
                <JoinedCard key={g.id} group={g} membership={membershipByGroup[g.id]} session={nextByGroup[g.id]} />
              ))
            )}
          </div>

          <p className="section-title" style={{ marginBottom: 18 }}>Discover</p>
          <div className="main discover-row">
            {discover.map((g) => (
              <DiscoverCard key={g.id} group={g} session={nextByGroup[g.id]} pending={membershipByGroup[g.id]?.status === "pending"} />
            ))}
            <OpeningSoonCard />
          </div>

          <p className="section-title" style={{ marginBottom: 18 }}>Start your own group</p>
          <div className="main">
            <div className="card quiet banner">
              <div className="banner-row">
                <div className="banner-body">
                  <Chip>Private</Chip>
                  <h3 style={{ fontFamily: serif, fontWeight: 400, fontSize: 22, color: "var(--burg)", margin: "14px 0 10px" }}>
                    Start your own group
                  </h3>
                  <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 13, color: "var(--ink)", opacity: 0.82, lineHeight: 1.75, margin: 0, maxWidth: 520 }}>
                    Bring together the women you already know. A book club, an accountability circle, or the friends you met at an event. Only the people you invite can see it.
                  </p>
                </div>
                <div className="banner-action">
                  {/* Private groups are Phase 3. Until then this captures interest
                      rather than opening a door that leads nowhere. */}
                  <Link to={createPageUrl("Support")} className="btn ghost">
                    Create a group
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="main">
            <div className="card quiet banner">
              <div className="banner-row">
                <div className="banner-body">
                  <div className="badge-row">
                    <Eyebrow>November 2026 · Cape Town</Eyebrow>
                    <Eyebrow>Date to be announced</Eyebrow>
                  </div>
                  <h3 style={{ fontFamily: serif, fontWeight: 400, fontSize: 24, color: "var(--burg)", margin: "0 0 10px", lineHeight: 1.2 }}>
                    One Day Women's Wellness Event
                  </h3>
                  <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 13, color: "var(--ink)", opacity: 0.82, lineHeight: 1.75, margin: 0, maxWidth: 560 }}>
                    A day in Cape Town. The date and tickets are on the way. Everyone who comes gets a group here, so the conversation keeps going after you leave the room.
                  </p>
                </div>
                <div className="banner-action">
                  <Link to={createPageUrl("Support")} className="btn ghost">
                    Register your interest
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// A partner hosted room lives at its own address and nowhere else, so
// there is only ever one URL in circulation for it.
function roomHref(group) {
  return group.host_expert_id ? `/${group.slug}` : `/Community/${group.slug}`;
}

function JoinedCard({ group, membership, session }) {
  const isCircle = !!group.host_expert_id;
  return (
    <div className="card dark">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ maxWidth: 560 }}>
          <Chip onDark>{isCircle ? "Private circle" : group.group_type === "event" ? "Event group" : "Live group"}</Chip>
          <h3 style={{ fontFamily: serif, fontWeight: 400, fontSize: 26, margin: "12px 0 8px", lineHeight: 1.2 }}>
            {group.name}
          </h3>
          <p className="meta" style={{ fontSize: 11.5, margin: 0 }}>
            {isCircle ? (group.subtitle || group.blurb || "") : `${group.member_count || 0} ${group.member_count === 1 ? "member" : "members"}`}
            {membership?.joined_at ? ` · ${joinedLabel(membership.joined_at)}` : ""}
          </p>
          {session && (
            <p style={{ fontFamily: sans, fontSize: 14, fontWeight: 600, color: "#fff", margin: "16px 0 0" }}>
              <span className="eyebrow on-dark" style={{ marginRight: 10 }}>Next live</span>
              {sessionDateLabel(session.scheduled_for, { short: true })}
            </p>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
          <Link to={roomHref(group)} className="btn rose">
            {isCircle ? "Open the Circle" : "Open group"} <Knob />
          </Link>
        </div>
      </div>
    </div>
  );
}

function DiscoverCard({ group, session, pending }) {
  const isCircle = !!group.host_expert_id;
  return (
    <div className="card">
      <Chip>{isCircle ? "Private circle" : group.group_type === "event" ? "Event group" : "Live group"}</Chip>
      <h3 style={{ fontFamily: serif, fontWeight: 400, fontSize: 24, color: "var(--burg)", margin: "14px 0 10px", lineHeight: 1.2 }}>
        {group.name}
      </h3>
      <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 13, color: "var(--ink)", opacity: 0.82, lineHeight: 1.75, margin: "0 0 12px" }}>
        {group.blurb}
      </p>
      {/* Nothing is visible before approval in a partner room, counts included. */}
      {!isCircle && (
        <p style={{ fontSize: 12, color: "var(--note)", margin: 0 }}>
          {group.member_count || 0} {group.member_count === 1 ? "member" : "members"}
        </p>
      )}
      {session && (
        <div className="next-live">
          <span className="eyebrow">Next live</span>
          <span className="nl-date">{sessionDateLabel(session.scheduled_for, { short: true })}</span>
        </div>
      )}
      <div className="actions">
        <Link to={roomHref(group)} className="btn rose">
          {pending ? "Request pending" : isCircle ? "Request to join" : "Join the group"} <Knob />
        </Link>
        {!isCircle && (
          <Link to={roomHref(group)} className="textlink">
            Have a look first
          </Link>
        )}
      </div>
    </div>
  );
}

function OpeningSoonCard() {
  return (
    <div className="card">
      <Chip dot={false}>Opening soon</Chip>
      <h3 style={{ fontFamily: serif, fontWeight: 400, fontSize: 24, color: "var(--burg)", margin: "14px 0 10px", lineHeight: 1.2 }}>
        More rooms are coming.
      </h3>
      <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 13, color: "var(--ink)", opacity: 0.82, lineHeight: 1.75, margin: 0 }}>
        We are opening a group for each pillar as the practitioners come on board. Money, nervous system and perimenopause are next.
      </p>
    </div>
  );
}