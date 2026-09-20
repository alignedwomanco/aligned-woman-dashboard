import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

// ────────────────────────────────────────────────────────────────
// Shared helpers for the Circle functions. Base44 functions deploy as
// isolated folders, so this block is embedded verbatim at the top of
// each entry.ts rather than imported. Keep the six copies identical.
// ────────────────────────────────────────────────────────────────

const OWNER_EMAIL = "hello@alignedwomanco.com";
const FROM_HEADER = `The Aligned Woman <${OWNER_EMAIL}>`;
const APP_ORIGIN = "https://app.alignedwomanco.com";
const ANON_NAME = "Anonymous member";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

function lower(s: unknown) {
  return typeof s === "string" ? s.trim().toLowerCase() : "";
}

function firstNameInitial(fullName: string, email: string) {
  const name = (fullName || "").trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
  }
  const local = (email || "").split("@")[0] || "Member";
  return local.charAt(0).toUpperCase() + local.slice(1);
}

// Who is calling, and what may they do in this room.
// Returns { user, group, membership, isAdmin, isHost, isApproved }.
async function loadContext(base44: any, groupId: string) {
  let user: any = null;
  try {
    user = await base44.auth.me();
  } catch (_e) {
    user = null;
  }
  if (!user?.email) return { error: json({ error: "not_authenticated" }, 401) };

  const email = lower(user.email);
  const svc = base44.asServiceRole.entities;

  const groups = await svc.Group.filter({ id: groupId });
  const group = Array.isArray(groups) ? groups[0] : null;
  if (!group) return { error: json({ error: "room_not_found" }, 404) };

  const isAdmin = user.role === "admin";

  let isHost = false;
  let hostExpert: any = null;
  if (group.host_expert_id) {
    const experts = await svc.Expert.filter({ id: group.host_expert_id });
    hostExpert = Array.isArray(experts) ? experts[0] : null;
    if (hostExpert && lower(hostExpert.linked_user_email) === email) isHost = true;
  }

  const rows = await svc.GroupMember.filter({ group_id: group.id, user_email: email });
  let membership = Array.isArray(rows) ? rows[0] : null;
  if (!membership) {
    // Legacy rows carry the email only on created_by.
    const legacy = await svc.GroupMember.filter({ group_id: group.id, created_by: email });
    membership = Array.isArray(legacy) ? legacy[0] : null;
  }

  // In a partner room a membership counts only when a moderator set it to
  // approved. An empty status is treated as approved for legacy open rooms
  // alone, so a row written outside the functions can never open a room.
  const isPartnerRoom = !!group.host_expert_id;
  const memberStatus = membership ? (membership.status || (isPartnerRoom ? "pending" : "approved")) : "none";
  const isApproved = memberStatus === "approved" && (!isPartnerRoom || !!membership?.reviewed_by || membership?.role === "owner");

  return { user, email, group, hostExpert, membership, memberStatus, isAdmin, isHost, isApproved };
}

function toBase64(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function toBase64Url(input: string): string {
  return toBase64(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function buildMime(to: string, bcc: string | null, subject: string, text: string): string {
  const encodedSubject = `=?utf-8?B?${toBase64(subject)}?=`;
  const headers = [
    `From: ${FROM_HEADER}`,
    `To: ${to}`,
    bcc ? `Bcc: ${bcc}` : null,
    `Reply-To: ${OWNER_EMAIL}`,
    `Subject: ${encodedSubject}`,
    `Date: ${new Date().toUTCString()}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `Content-Transfer-Encoding: base64`,
  ].filter(Boolean).join("\r\n");
  return `${headers}\r\n\r\n${toBase64(text)}`;
}

// Plain text, brand light, one per (dedupeKey, recipient). Never throws:
// email is a side effect and must not undo the record that caused it.
async function sendCircleEmail(base44: any, opts: {
  to: string; subject: string; text: string; dedupeKey: string; bcc?: string | null; toName?: string;
}) {
  const to = lower(opts.to);
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return false;
  const svc = base44.asServiceRole.entities;
  try {
    const prior = await svc.EmailLog.filter({ campaign_name: opts.dedupeKey, to_email: to });
    if (Array.isArray(prior) && prior.length > 0) return false;
  } catch (_e) { /* dedupe read failing is not a reason to skip the email */ }

  let status = "sent";
  let errorMessage = "";
  try {
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("gmail");
    if (!accessToken) throw new Error("Gmail connector is not available");
    const raw = toBase64Url(buildMime(to, opts.bcc ?? null, opts.subject, opts.text));
    const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ raw }),
    });
    if (!res.ok) {
      const detail = await res.json().catch(() => ({}));
      throw new Error(detail?.error?.message || "Gmail rejected the message");
    }
  } catch (e) {
    status = "failed";
    errorMessage = (e as Error)?.message || "send failed";
  }
  try {
    await svc.EmailLog.create({
      campaign_name: opts.dedupeKey,
      to_email: to,
      to_name: opts.toName || "",
      subject: opts.subject,
      type: "one_time",
      status,
      error_message: errorMessage,
      sent_at: new Date().toISOString(),
    });
  } catch (_e) { /* logging must never fail the caller */ }
  return status === "sent";
}

// In app notification. source_user_email is deliberately empty when the
// trigger was an anonymous post, so the row can never leak who posted.
async function notifyInApp(base44: any, n: {
  recipient: string; type: string; message: string; linkTo: string; groupId: string; postId?: string; source?: string;
}) {
  const recipient = lower(n.recipient);
  if (!recipient) return;
  try {
    await base44.asServiceRole.entities.Notification.create({
      type: n.type,
      message: n.message,
      linkTo: n.linkTo,
      isRead: false,
      recipient_email: recipient,
      source_user_email: n.source || "",
      target_post_id: n.postId || "",
      group_id: n.groupId,
    });
  } catch (_e) { /* best effort */ }
}

async function hostEmails(base44: any, group: any): Promise<string[]> {
  const out: string[] = [];
  if (group?.host_expert_id) {
    try {
      const experts = await base44.asServiceRole.entities.Expert.filter({ id: group.host_expert_id });
      const e = Array.isArray(experts) ? experts[0] : null;
      if (e?.linked_user_email) out.push(lower(e.linked_user_email));
    } catch (_e) { /* no host yet */ }
  }
  return out;
}

function roomUrl(group: any) {
  return `${APP_ORIGIN}/${group.slug}`;
}

function hostFirstName(hostExpert: any) {
  const n = (hostExpert?.name || "").trim();
  return n ? n.split(/\s+/)[0] : "the host";
}

// ────────────────────────────────────────────────────────────────
// getCirclePosts
// The only read path into a sensitive room. Returns nothing but the
// caller's own state until she is approved. Strips identity from
// anonymous posts for everyone except the host and admins. Marks
// the asker's own replies on her thread as is_asker without naming
// her, and the viewer's own posts as is_mine.
//
// Payload: { groupId, postId? }  postId returns one thread in full.
// ────────────────────────────────────────────────────────────────

function publicView(post: any, viewer: { email: string; canSeeIdentity: boolean }, askerEmail: string, askerAnon = false) {
  const anon = !!post.is_anonymous;
  const real = lower(post.author_email_private || post.created_by || "");
  const out: any = {
    id: post.id,
    group_id: post.group_id,
    parent_id: post.parent_id || "",
    body: post.body,
    post_type: post.post_type || "share",
    topic_key: post.topic_key || "",
    status: post.status || "open",
    is_pinned: !!post.is_pinned,
    is_anonymous: anon,
    anon_tint: typeof post.anon_tint === "number" ? post.anon_tint : 0,
    author_name: anon ? ANON_NAME : (post.author_name || "Member"),
    author_avatar: anon ? "" : (post.author_avatar || ""),
    author_is_host: !!post.author_is_host,
    author_is_practitioner: !!post.author_is_practitioner,
    media: Array.isArray(post.media) ? post.media : [],
    reply_count: typeof post.reply_count === "number" ? post.reply_count : 0,
    answer_post_id: post.answer_post_id || "",
    answered_at: post.answered_at || "",
    created_date: post.created_date,
    is_mine: !!real && real === viewer.email,
    // Asked this is only shown when the reply carries the same anonymity as
    // the question, so the tag can never sit next to a real name on an
    // anonymous thread, or next to an anonymous reply on a named one.
    is_asker: !!askerEmail && !!real && real === askerEmail && anon === askerAnon,
  };
  if (viewer.canSeeIdentity && anon) {
    out.moderator_only = { real_name: post.author_name_private || real, email: real };
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders() });
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const groupId = typeof body.groupId === "string" ? body.groupId : "";
    const postId = typeof body.postId === "string" ? body.postId : "";
    if (!groupId) return json({ error: "groupId is required" }, 400);

    const ctx = await loadContext(base44, groupId);
    if (ctx.error) return ctx.error;
    const { email, group, membership, memberStatus, isAdmin, isHost, isApproved, hostExpert } = ctx;

    const canRead = isApproved || isHost || isAdmin;
    const viewer = { email, canSeeIdentity: isHost || isAdmin };

    const me = {
      email,
      status: isHost || isAdmin ? "approved" : memberStatus,
      role: isAdmin ? "admin" : isHost ? "host" : (membership?.role || "member"),
      notify_pref: membership?.notify_pref || "all",
      display_name: membership?.display_name || "",
    };

    const host = hostExpert ? {
      name: hostExpert.name,
      business_name: hostExpert.business_name || "",
      logo_url: hostExpert.logo_url || hostExpert.profile_picture || "",
      bio: group.host_bio_override || hostExpert.bio || "",
      first_name: hostFirstName(hostExpert),
    } : null;

    if (!canRead) {
      // Nothing visible before approval: no posts, no members, no counts.
      return json({ me, host, posts: [], replies: [], pinned: null });
    }

    const svc = base44.asServiceRole.entities;
    // Keep the member's read marker in step for the unread dot on the index.
    if (membership?.id) {
      svc.GroupMember.update(membership.id, { last_read_at: new Date().toISOString() }).catch(() => {});
    }

    if (postId) {
      const found = await svc.GroupPost.filter({ id: postId, group_id: group.id });
      const question = Array.isArray(found) ? found[0] : null;
      if (!question || question.is_deleted) return json({ error: "post_not_found" }, 404);
      const askerEmail = lower(question.author_email_private || question.created_by || "");
      const askerAnon = !!question.is_anonymous;
      const rawReplies = await svc.GroupPost.filter({ group_id: group.id, parent_id: question.id }, "created_date", 500);
      const replies = (Array.isArray(rawReplies) ? rawReplies : [])
        .filter((r: any) => !r.is_deleted)
        .map((r: any) => publicView(r, viewer, askerEmail, askerAnon));
      return json({ me, host, post: publicView(question, viewer, askerEmail, askerAnon), replies });
    }

    const raw = await svc.GroupPost.filter({ group_id: group.id }, "-created_date", 500);
    const all = (Array.isArray(raw) ? raw : []).filter((p: any) => !p.is_deleted);
    const topLevel = all.filter((p: any) => !p.parent_id);
    // Answered is a state the record carries (set when the host replies or
    // marks it), so the feed, the insights and the export agree.
    const posts = topLevel
      .filter((p: any) => p.post_type !== "welcome")
      .sort((a: any, b: any) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0))
      .map((p: any) => publicView(p, viewer, ""));
    const welcome = topLevel.find((p: any) => p.post_type === "welcome") || null;
    const pinned = welcome ? publicView(welcome, viewer, "") : null;

    return json({ me, host, posts, pinned });
  } catch (error) {
    return json({ error: (error as Error).message }, 500);
  }
});
