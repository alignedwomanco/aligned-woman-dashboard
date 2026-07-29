import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import DashboardSidebar from "@/components/dashboard-v2/DashboardSidebar";
import ReportModal from "@/components/community/ReportModal";
import {
  CommunityStyles, Eyebrow, Chip, Avatar, Knob,
  serif, sans, friendlyTime, joinedLabel, sessionDateLabel, countdownLabel,
} from "@/components/community/communityUI";

// ────────────────────────────────────────────────────────────────
// Group page · three states, per the design handoff.
//   A  not joined, conversation fades under a join prompt
//   B  joined, session upcoming
//   C  joined, no session, last replay takes the block
//
// Plus two states the handoff did not draw and every early member will
// actually see: an empty conversation, and a group with no session ever
// scheduled.
//
// Member counts are read from GroupMember rather than the denormalised
// Group.member_count, because Group.update is admin only in RLS, so a
// member joining cannot maintain that counter. It stays on the schema
// for when a service role function can keep it in step.
// ────────────────────────────────────────────────────────────────

export default function CommunityGroup() {
  const { slug } = useParams();
  const qc = useQueryClient();
  const [posting, setPosting] = useState(false);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState(null);

  const { data: currentUser } = useQuery({
    queryKey: ["sidebar-current-user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: groups = [], isLoading: groupLoading } = useQuery({
    queryKey: ["community-groups"],
    queryFn: () => base44.entities.Group.filter({ is_active: true }, "order", 200),
  });

  const group = groups.find((g) => g.slug === slug) || null;

  const { data: members = [] } = useQuery({
    queryKey: ["group-members", group?.id],
    queryFn: () => base44.entities.GroupMember.filter({ group_id: group.id }, "-created_date", 500),
    enabled: !!group?.id,
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["group-posts", group?.id],
    queryFn: () => base44.entities.GroupPost.filter({ group_id: group.id }, "-created_date", 300),
    enabled: !!group?.id,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["group-sessions", group?.id],
    queryFn: () => base44.entities.LiveSession.filter({ group_id: group.id }, "scheduled_for", 100),
    enabled: !!group?.id,
  });

  const { data: experts = [] } = useQuery({
    queryKey: ["allExperts"],
    queryFn: () => base44.entities.Expert.list(),
  });

  const myMembership = members.find((m) => m.created_by === currentUser?.email) || null;
  const isMember = !!myMembership;
  const isAdmin = currentUser?.role === "admin";
  const myExpert = experts.find((e) => e.linked_user_email === currentUser?.email) || null;

  const now = Date.now();
  const upcoming = sessions
    .filter((s) => s.status !== "cancelled" && new Date(s.scheduled_for).getTime() > now)
    .sort((a, b) => new Date(a.scheduled_for) - new Date(b.scheduled_for))[0] || null;
  const lastEnded = sessions
    .filter((s) => s.status !== "cancelled" && new Date(s.scheduled_for).getTime() <= now)
    .sort((a, b) => new Date(b.scheduled_for) - new Date(a.scheduled_for))[0] || null;
  const sessionExpert = (s) => experts.find((e) => e.id === s?.expert_id) || null;

  // Mark the group read when a member opens it. This is what makes the
  // "new posts since you were here" marker meaningful on the index.
  useEffect(() => {
    if (!myMembership?.id) return;
    base44.entities.GroupMember.update(myMembership.id, { last_read_at: new Date().toISOString() }).catch(() => {});
  }, [myMembership?.id]);

  useEffect(() => {
    if (group) document.title = `${group.name} | The Aligned Woman Co`;
  }, [group]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["group-members", group?.id] });
    qc.invalidateQueries({ queryKey: ["group-posts", group?.id] });
    qc.invalidateQueries({ queryKey: ["community-my-memberships"] });
  };

  const join = async () => {
    if (!currentUser?.email || busy) return;
    setBusy(true);
    try {
      await base44.entities.GroupMember.create({
        group_id: group.id,
        user_email: currentUser.email,
        role: "member",
        joined_at: new Date().toISOString(),
        last_read_at: new Date().toISOString(),
      });
      base44.analytics.track({ eventName: "group_join", properties: { group: group.slug } });
      refresh();
    } finally {
      setBusy(false);
    }
  };

  const leave = async () => {
    if (!myMembership?.id || busy) return;
    setBusy(true);
    try {
      await base44.entities.GroupMember.delete(myMembership.id);
      base44.analytics.track({ eventName: "group_leave", properties: { group: group.slug } });
      refresh();
    } finally {
      setBusy(false);
    }
  };

  const addPost = async (body, parentId) => {
    if (!body.trim() || busy) return;
    setBusy(true);
    try {
      await base44.entities.GroupPost.create({
        group_id: group.id,
        body: body.trim(),
        parent_id: parentId || "",
        author_name: currentUser?.full_name || currentUser?.email || "Member",
        author_avatar: myExpert?.profile_picture || "",
        author_is_practitioner: !!myExpert,
      });
      setDraft("");
      setReplyDraft("");
      setReplyTo(null);
      setPosting(false);
      refresh();
    } finally {
      setBusy(false);
    }
  };

  if (groupLoading) {
    return (
      <div className="aw-c min-h-screen flex">
        <CommunityStyles />
        <DashboardSidebar />
        <div className="flex-1 lg:ml-72"><div className="page"><p style={{ color: "#92707D", fontSize: 13 }}>Loading...</p></div></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="aw-c min-h-screen flex">
        <CommunityStyles />
        <DashboardSidebar />
        <div className="flex-1 lg:ml-72">
          <div className="page">
            <h1 style={{ fontFamily: serif, fontSize: 30, color: "#4A0E2E", margin: "0 0 16px" }}>Group not found.</h1>
            <Link to={createPageUrl("Community")} className="btn ghost">Back to Community</Link>
          </div>
        </div>
      </div>
    );
  }

  const topLevel = posts.filter((p) => !p.parent_id && !p.is_deleted);
  const repliesOf = (id) => posts.filter((p) => p.parent_id === id && !p.is_deleted).sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  const visiblePosts = isMember ? topLevel : topLevel.slice(0, 3);
  const practitionerCount = members.filter((m) => experts.some((e) => e.linked_user_email === m.created_by)).length;

  return (
    <div className="aw-c min-h-screen flex">
      <CommunityStyles />
      <DashboardSidebar />

      <div className="flex-1 lg:ml-72">
        <div className="page">
          <Link to={createPageUrl("Community")} className="eyebrow" style={{ textDecoration: "none", display: "inline-block", marginBottom: 18 }}>
            Back to Community
          </Link>

          <div className="main">
            {/* ── HEADER ── */}
            <div className="card dark">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ maxWidth: 620 }}>
                  <Chip onDark>{group.group_type === "event" ? "Event group" : "Live group"}</Chip>
                  <h1 style={{ fontFamily: serif, fontWeight: 400, fontSize: 34, margin: "14px 0 10px", lineHeight: 1.15 }}>
                    {group.name}
                  </h1>
                  <p style={{ fontSize: 13, lineHeight: 1.7, margin: "0 0 12px" }}>{group.blurb}</p>
                  <p className="meta" style={{ fontSize: 11.5, margin: 0 }}>
                    {members.length} {members.length === 1 ? "member" : "members"}
                    {group.visibility === "public" ? " · open to everyone" : ""}
                    {myMembership?.joined_at ? ` · ${joinedLabel(myMembership.joined_at)}` : ""}
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
                  {isMember ? (
                    <button type="button" onClick={leave} disabled={busy} className="btn ghost-light">
                      Leave group
                    </button>
                  ) : (
                    <button type="button" onClick={join} disabled={busy} className="btn rose">
                      Join the group <Knob />
                    </button>
                  )}
                  {/* Only members and admins ever see management actions. */}
                  {isAdmin && (
                    <Link to={createPageUrl("Dashboard")} className="textlink light">Group settings</Link>
                  )}
                </div>
              </div>
            </div>

            {/* ── SESSION ── */}
            {upcoming ? (
              <SessionCard session={upcoming} expert={sessionExpert(upcoming)} isMember={isMember} onJoin={join} busy={busy} />
            ) : lastEnded ? (
              <ReplayCard session={lastEnded} expert={sessionExpert(lastEnded)} />
            ) : (
              <div className="card quiet">
                <Eyebrow>Live sessions</Eyebrow>
                <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 12.5, color: "#2B1220", opacity: 0.82, lineHeight: 1.75, margin: "12px 0 0", maxWidth: 560 }}>
                  The first live session is being scheduled. You will hear about it here first, and you will be able to send your question in before the night.
                </p>
              </div>
            )}

            {/* ── CONVERSATION ── */}
            <p className="section-title">Conversation</p>

            {isMember && (
              <div className="card">
                {posting ? (
                  <>
                    <textarea
                      autoFocus
                      rows={4}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Share something with the group..."
                      style={textareaStyle}
                    />
                    <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12 }}>
                      <button type="button" className="btn rose" disabled={busy || !draft.trim()} onClick={() => addPost(draft, null)}>
                        Post
                      </button>
                      <button type="button" className="textlink" onClick={() => { setPosting(false); setDraft(""); }}>
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPosting(true)}
                    style={{ ...textareaStyle, textAlign: "left", cursor: "pointer", color: "#92707D", minHeight: 0, padding: "14px 16px" }}
                  >
                    Share something with the group...
                  </button>
                )}
              </div>
            )}

            {postsLoading ? (
              <div className="card quiet"><p style={{ fontSize: 12.5, color: "#92707D", margin: 0 }}>Loading the conversation...</p></div>
            ) : topLevel.length === 0 ? (
              // The state every early member actually sees, and the one
              // the handoff did not draw.
              <div className="card">
                <div className="empty">
                  <h4>It is quiet in here, for now.</h4>
                  <p>
                    {isMember
                      ? "Nobody has posted yet. Somebody has to be first, and it may as well be you. A question counts."
                      : "The conversation starts when the first member posts. Join the group and it could be you."}
                  </p>
                  {isMember ? (
                    <button type="button" className="btn ghost" onClick={() => setPosting(true)}>Write the first post</button>
                  ) : (
                    <button type="button" className="btn rose" onClick={join} disabled={busy}>Join the group</button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {visiblePosts.map((p) => (
                  <PostCard
                    key={p.id}
                    post={p}
                    replies={repliesOf(p.id)}
                    isMember={isMember}
                    onReply={() => { setReplyTo(replyTo === p.id ? null : p.id); setReplyDraft(""); }}
                    replyOpen={replyTo === p.id}
                    replyDraft={replyDraft}
                    setReplyDraft={setReplyDraft}
                    submitReply={() => addPost(replyDraft, p.id)}
                    busy={busy}
                    onReport={(target) => setReport(target)}
                  />
                ))}

                {!isMember && topLevel.length > 0 && (
                  <div className="card quiet" style={{ textAlign: "center" }}>
                    <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 12.5, color: "#2B1220", opacity: 0.82, margin: "0 0 16px" }}>
                      Join the group to read the rest of the conversation and to ask your own question.
                    </p>
                    <button type="button" className="btn rose" onClick={join} disabled={busy}>
                      Join the group <Knob />
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ── MEMBERS ── */}
            <p className="section-title">Members</p>
            <div className="card">
              {members.length === 0 ? (
                <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 12.5, color: "#92707D", margin: 0 }}>
                  No members yet. This group is open to everyone.
                </p>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
                    {members.slice(0, 6).map((m) => (
                      <span key={m.id} style={{ marginRight: -10, boxShadow: "0 0 0 3px rgba(255,255,255,0.9)", borderRadius: "50%" }}>
                        <Avatar name={m.user_email} />
                      </span>
                    ))}
                    {members.length > 6 && (
                      <span style={{ marginLeft: 20, fontSize: 11.5, fontWeight: 600, color: "#92707D" }}>
                        +{members.length - 6}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 11.5, color: "#92707D", margin: 0 }}>
                    {members.length} {members.length === 1 ? "member" : "members"}
                    {practitionerCount > 0 ? ` · ${practitionerCount} AW Verified ${practitionerCount === 1 ? "practitioner" : "practitioners"}` : ""}
                  </p>
                </>
              )}
            </div>

            {/* ── ABOUT ── */}
            <p className="section-title">About this group</p>
            <div className="card about">
              <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 12.5, color: "#2B1220", opacity: 0.82, lineHeight: 1.8, margin: 0, maxWidth: 640 }}>
                {group.description || group.blurb}
              </p>
              <div style={{ marginTop: 18, padding: "16px 18px", borderRadius: 16, background: "rgba(196,132,122,0.12)" }}>
                <p style={{ fontFamily: sans, fontWeight: 400, fontSize: 11.5, color: "#2B1220", opacity: 0.9, lineHeight: 1.7, margin: 0 }}>
                  This group is for information and connection. It is not medical care, and nothing here replaces a consultation with your own doctor.
                </p>
              </div>
              <p style={{ marginTop: 14, fontSize: 11.5, color: "#92707D", lineHeight: 1.7 }}>
                If you are struggling and need help now, please{" "}
                <Link to={createPageUrl("Support")} style={{ fontWeight: 600, color: "#4A0E2E", textDecoration: "underline", textUnderlineOffset: 3 }}>
                  reach out here
                </Link>
                . We would always rather you told us.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ReportModal
        open={!!report}
        onClose={() => setReport(null)}
        targetType={report?.type}
        targetId={report?.id}
        targetPreview={report?.preview}
        groupId={group.id}
      />
    </div>
  );
}

function SessionCard({ session, expert, isMember, onJoin, busy }) {
  return (
    <div className="card">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 32, justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ maxWidth: 560 }}>
          <Eyebrow>Next live</Eyebrow>
          <h3 style={{ fontFamily: serif, fontWeight: 400, fontSize: 26, color: "#4A0E2E", margin: "10px 0 12px", lineHeight: 1.22 }}>
            {session.title}
          </h3>
          {expert && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Avatar name={expert.name} src={expert.profile_picture} sm />
              <div>
                <p style={{ fontSize: 12.5, fontWeight: 600, color: "#4A0E2E", margin: 0 }}>{expert.name}</p>
                <p style={{ fontSize: 11, color: "#92707D", margin: 0 }}>{expert.title}</p>
              </div>
            </div>
          )}
          <p style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: "#4A0E2E", margin: 0 }}>
            {sessionDateLabel(session.scheduled_for)}
            <span style={{ fontWeight: 400, color: "#92707D" }}> · {countdownLabel(session.scheduled_for)}</span>
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start", minWidth: 250 }}>
          {isMember ? (
            <button type="button" className="btn rose" disabled title="Question submission opens in the next release">
              Submit a question <Knob />
            </button>
          ) : (
            <button type="button" className="btn rose" onClick={onJoin} disabled={busy}>
              Join to submit a question <Knob />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReplayCard({ session, expert }) {
  return (
    <div className="card">
      <Eyebrow>Last session</Eyebrow>
      <h3 style={{ fontFamily: serif, fontWeight: 400, fontSize: 24, color: "#4A0E2E", margin: "10px 0 10px", lineHeight: 1.22 }}>
        {session.title}
      </h3>
      {expert && <p style={{ fontSize: 12, color: "#92707D", margin: "0 0 10px" }}>{expert.name} · {expert.title}</p>}
      <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 12.5, color: "#2B1220", opacity: 0.82, lineHeight: 1.75, margin: 0, maxWidth: 560 }}>
        Recorded {sessionDateLabel(session.scheduled_for, { short: true })}
        {session.duration_minutes ? `, ${session.duration_minutes} minutes` : ""}. The next live date is being set, and you will hear from us here first.
      </p>
    </div>
  );
}

function PostCard({ post, replies, isMember, onReply, replyOpen, replyDraft, setReplyDraft, submitReply, busy, onReport }) {
  return (
    <div className="card">
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Avatar name={post.author_name} src={post.author_avatar} />
        <div>
          <p style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: "#4A0E2E", margin: 0 }}>
            {post.author_name}
            {post.author_is_practitioner && (
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#A86460" }}>
                AW Verified
              </span>
            )}
          </p>
          <p style={{ fontSize: 10.5, color: "#92707D", margin: 0 }}>{friendlyTime(post.created_date)}</p>
        </div>
      </div>

      <p style={{ fontSize: 12.5, color: "#2B1220", opacity: 0.86, lineHeight: 1.75, margin: "12px 0 0", paddingLeft: 50 }}>
        {post.body}
      </p>

      <div style={{ paddingLeft: 50, marginTop: 12, display: "flex", gap: 18, alignItems: "center" }}>
        {isMember && (
          <button type="button" className="textlink" style={{ textDecoration: "none", color: "#92707D" }} onClick={onReply}>
            Reply
          </button>
        )}
        <button
          type="button"
          className="textlink"
          style={{ textDecoration: "none", color: "#92707D", fontSize: 11 }}
          onClick={() => onReport({ type: "post", id: post.id, preview: post.body })}
        >
          Report
        </button>
      </div>

      {replyOpen && (
        <div style={{ paddingLeft: 50, marginTop: 14 }}>
          <textarea
            autoFocus
            rows={3}
            value={replyDraft}
            onChange={(e) => setReplyDraft(e.target.value)}
            placeholder="Write a reply..."
            style={textareaStyle}
          />
          <div style={{ marginTop: 10 }}>
            <button type="button" className="btn rose" disabled={busy || !replyDraft.trim()} onClick={submitReply}>
              Reply
            </button>
          </div>
        </div>
      )}

      {replies.length > 0 && (
        <div style={{ paddingLeft: 50, marginTop: 18, display: "flex", flexDirection: "column", gap: 16 }}>
          {replies.map((r) => (
            <div key={r.id} style={{ borderLeft: "2px solid rgba(196,132,122,0.3)", paddingLeft: 16 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Avatar name={r.author_name} src={r.author_avatar} sm />
                <div>
                  <p style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 600, color: "#4A0E2E", margin: 0 }}>
                    {r.author_name}
                    {r.author_is_practitioner && (
                      <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#A86460" }}>
                        AW Verified
                      </span>
                    )}
                  </p>
                  <p style={{ fontSize: 10, color: "#92707D", margin: 0 }}>{friendlyTime(r.created_date)}</p>
                </div>
              </div>
              <p style={{ fontSize: 12, color: "#2B1220", opacity: 0.86, lineHeight: 1.7, margin: "8px 0 0" }}>{r.body}</p>
              <button
                type="button"
                className="textlink"
                style={{ textDecoration: "none", color: "#92707D", fontSize: 10.5, marginTop: 8 }}
                onClick={() => onReport({ type: "post", id: r.id, preview: r.body })}
              >
                Report
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const textareaStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.72)",
  border: "1px solid rgba(74,14,46,0.16)",
  borderRadius: 16,
  padding: "14px 16px",
  fontFamily: sans,
  fontSize: 12.5,
  color: "#2B1220",
  boxSizing: "border-box",
  outline: "none",
  resize: "vertical",
  lineHeight: 1.7,
};
