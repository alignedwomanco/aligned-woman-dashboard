import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PageNotFound from "@/lib/PageNotFound";
import { isReservedRoomSlug } from "@/lib/circle";
import { PlatformBar, HostBand } from "@/components/circle/CircleShell";
import { Pitch, JoinGate, Pending, Declined } from "@/components/circle/CircleArrive";
import CircleFeed from "@/components/circle/CircleFeed";
import CircleThread, { ReportSheet } from "@/components/circle/CircleThread";
import CircleComposer from "@/components/circle/CircleComposer";
import CircleModerate from "@/components/circle/CircleModerate";

// ────────────────────────────────────────────────────────────────
// CirclePage · one address per room: app.alignedwomanco.com/<slug>.
//
// The single route renders every state: logged out (the pitch), signed
// in and not a member (the join gate), pending, declined or removed,
// and the room itself (feed, thread, moderate). The header is the same
// in every one, so a woman can see she is in the same place throughout.
//
// Group is readable by anyone, which is fine: it holds the name, the
// intro and the rules, nothing from inside the room. Everything inside
// comes through getCirclePosts, which returns nothing until she is
// approved and strips identity from anonymous posts for everyone but
// the host and admins.
// ────────────────────────────────────────────────────────────────

async function fetchRoom(groupId, postId) {
  const res = await base44.functions.invoke("getCirclePosts", postId ? { groupId, postId } : { groupId });
  const data = res?.data || res;
  if (data?.error) throw new Error(data.error);
  return data;
}

export default function CirclePage() {
  const { roomSlug } = useParams();
  const slug = String(roomSlug || "").toLowerCase();
  const [params, setParams] = useSearchParams();
  const qc = useQueryClient();
  const postId = params.get("post") || "";
  const tab = params.get("tab") || "";
  const [composer, setComposer] = useState(null); // "question" | "share" | null
  const [report, setReport] = useState(null);
  const [joinBusy, setJoinBusy] = useState(false);
  const [joinError, setJoinError] = useState("");

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["circle-user"],
    queryFn: () => base44.auth.me().catch(() => null),
    staleTime: 60000,
  });

  const { data: groups = [], isLoading: groupLoading } = useQuery({
    queryKey: ["circle-group", slug],
    queryFn: () => base44.entities.Group.filter({ slug }),
    enabled: !!slug && !isReservedRoomSlug(slug),
  });
  const group = groups[0] || null;

  const { data: room, isLoading: roomLoading, error: roomError } = useQuery({
    queryKey: ["circle-room", group?.id, user?.email || "anon"],
    queryFn: () => fetchRoom(group.id),
    enabled: !!group?.id && !!user,
  });

  const { data: thread, isLoading: threadLoading } = useQuery({
    queryKey: ["circle-thread", group?.id, postId],
    queryFn: () => fetchRoom(group.id, postId),
    enabled: !!group?.id && !!user && !!postId && room?.me?.status === "approved",
  });

  useEffect(() => {
    if (group) document.title = `${group.name} | The Aligned Woman Co`;
  }, [group]);

  const refreshRoom = () => {
    qc.invalidateQueries({ queryKey: ["circle-room", group?.id] });
    if (postId) qc.invalidateQueries({ queryKey: ["circle-thread", group?.id, postId] });
    qc.invalidateQueries({ queryKey: ["circle-moderate", group?.id] });
  };

  const go = (next) => {
    const p = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => { if (v) p.set(k, v); });
    setParams(p);
    window.scrollTo(0, 0);
  };

  const requestJoin = async () => {
    setJoinBusy(true);
    setJoinError("");
    try {
      const res = await base44.functions.invoke("requestCircleJoin", { groupId: group.id, identifiesAsWoman: true, agreedToRules: true });
      const data = res?.data || res;
      if (data?.error) throw new Error(data.error);
      refreshRoom();
    } catch (_e) {
      setJoinError("That did not send. Please try again in a moment.");
    } finally {
      setJoinBusy(false);
    }
  };

  const moderateAction = async (action, post, answerPostId) => {
    try {
      const extra = { postId: post.id };
      if (action === "mark_answered" && answerPostId) extra.answerPostId = answerPostId;
      await base44.functions.invoke("moderateCircle", { groupId: group.id, action, ...extra });
      if (action === "delete_post" && !post.parent_id) go({});
      refreshRoom();
    } catch (_e) { /* the next refresh shows the truth */ }
  };

  if (!slug || isReservedRoomSlug(slug)) return <PageNotFound />;
  if (groupLoading || userLoading) return <Shell><Loading /></Shell>;
  if (!group) return <PageNotFound />;

  const isDraft = group.status === "draft";
  const me = room?.me || null;
  const host = room?.host || null;
  const isMod = me?.role === "host" || me?.role === "admin";

  // A draft room is invisible to everyone but its host and admins.
  if (isDraft && (!user || (room && !isMod))) return <PageNotFound />;

  const status = !user ? "pitch" : roomLoading || !room ? "loading" : me?.status === "approved" ? "room" : me?.status === "pending" ? "pending" : (me?.status === "declined" || me?.status === "removed") ? "declined" : "gate";

  let body = null;
  if (status === "pitch") body = <Pitch group={group} host={host || hostFromGroup(group)} slug={slug} />;
  else if (status === "loading") body = roomError ? <p className="px-6 py-10 font-body text-[13px] text-awrose-deep text-center">We could not open the Circle just now. Refresh to try again.</p> : <Loading />;
  else if (status === "gate") body = <JoinGate group={group} host={host} onRequest={requestJoin} busy={joinBusy} error={joinError} />;
  else if (status === "pending") body = <Pending host={host} />;
  else if (status === "declined") body = <Declined group={group} />;
  else if (tab === "moderate" && isMod) body = <CircleModerate group={group} onBack={() => go({})} onOpenPost={(id) => go({ post: id })} />;
  else if (postId) {
    body = threadLoading || !thread ? <Loading /> : thread.post ? (
      <CircleThread
        group={group}
        host={host}
        me={me}
        post={thread.post}
        replies={thread.replies || []}
        onBack={() => go({})}
        onPosted={refreshRoom}
        onModerateAction={moderateAction}
      />
    ) : <p className="px-6 py-10 font-body text-[13px] text-awburg-mid text-center">That post is no longer in the Circle.</p>;
  } else {
    body = (
      <CircleFeed
        group={group}
        host={host}
        me={me}
        posts={room.posts || []}
        pinned={room.pinned}
        pendingCount={0}
        onOpenPost={(id) => go({ post: id })}
        onAsk={() => setComposer("question")}
        onShare={() => setComposer("share")}
        onReport={(p) => setReport(p)}
        onModerate={() => go({ tab: "moderate" })}
        onPrefSaved={refreshRoom}
      />
    );
  }

  return (
    <Shell user={user} slug={slug} group={group} host={host || hostFromGroup(group)} compact={!!postId || tab === "moderate"} draft={isDraft && isMod}>
      {body}
      <CircleComposer
        open={!!composer}
        mode={composer || "question"}
        group={group}
        host={host}
        onClose={() => setComposer(null)}
        onPosted={(id) => { setComposer(null); refreshRoom(); if (id) go({ post: id }); }}
      />
      <ReportSheet open={!!report} target={report} group={group} host={host} onClose={() => setReport(null)} />
    </Shell>
  );
}

// Before she is signed in there is no getCirclePosts call, so the host
// lockup on the pitch comes from the room record alone. The name is
// filled in once the host's Expert record is linked; until then the
// band shows the room name and a monogram.
function hostFromGroup(group) {
  return group?.host_expert_id ? { name: "", business_name: "", logo_url: "", first_name: "" } : null;
}

function Shell({ user, slug, group, host, compact, draft, children }) {
  return (
    <div className="min-h-screen bg-off-white font-body text-awburg-dark">
      <PlatformBar user={user} slug={slug} />
      {group && <HostBand group={group} host={host} compact={compact} />}
      {draft && (
        <p className="bg-awsage-wash text-awsage-core font-body text-[11.5px] font-semibold text-center px-4 py-2">
          Not visible yet. Only you and The Aligned Woman Co. can see this room until you publish it from your Partner Dashboard.
        </p>
      )}
      {children}
    </div>
  );
}

function Loading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-7 h-7 border-[3px] border-awrose-pale border-t-awburg-core rounded-full animate-spin" aria-label="Loading" />
    </div>
  );
}
