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
// createCirclePost
// Writes a question, a share, or a reply with the service role, so the
// readable record never carries the member's email in created_by. The
// real identity lives only in author_email_private and
// author_name_private, which getCirclePosts returns to the host and
// admins alone.
//
// Media: photos are re-encoded through a canvas in the browser before
// upload, which drops every byte of EXIF including location, and are
// renamed to a random id. Photos are the only media type; voice notes
// were removed on purpose. This function accepts only URLs on our own file
// host, so a member cannot attach an outside image that would log who
// opened the feed, and stores kind, url and duration, never a file name.
//
// Payload: { groupId, body, parentId?, postType?, isAnonymous?, topicKey?, media? }
// ────────────────────────────────────────────────────────────────

const MAX_BODY = 4000;
// Where base44.integrations.Core.UploadFile puts files for this app.
const FILE_HOST_PREFIXES = [
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/",
];

function cleanMedia(input: unknown) {
  if (!Array.isArray(input)) return [];
  return input
    .filter((m: any) => m && m.kind === "photo" && typeof m.url === "string" && FILE_HOST_PREFIXES.some((p) => m.url.startsWith(p)))
    .slice(0, 4)
    .map((m: any) => ({
      kind: "photo",
      url: m.url,
      duration_seconds: 0,
    }));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders() });
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    const groupId = typeof payload.groupId === "string" ? payload.groupId : "";
    if (!groupId) return json({ error: "groupId is required" }, 400);

    const ctx = await loadContext(base44, groupId);
    if (ctx.error) return ctx.error;
    const { user, email, group, membership, isAdmin, isHost, isApproved, hostExpert } = ctx;
    if (!(isApproved || isHost || isAdmin)) return json({ error: "not_a_member" }, 403);

    const text = typeof payload.body === "string" ? payload.body.trim().slice(0, MAX_BODY) : "";
    const media = cleanMedia(payload.media);
    if (!text && media.length === 0) return json({ error: "empty_post" }, 422);

    const parentId = typeof payload.parentId === "string" ? payload.parentId : "";
    let isAnonymous = payload.isAnonymous === true && !isHost;
    const svc = base44.asServiceRole.entities;

    let parent: any = null;
    if (parentId) {
      const found = await svc.GroupPost.filter({ id: parentId, group_id: group.id });
      parent = Array.isArray(found) ? found[0] : null;
      if (!parent || parent.is_deleted) return json({ error: "parent_not_found" }, 404);
      if (parent.parent_id) return json({ error: "replies_nest_one_level" }, 422);
      // The woman who asked anonymously stays anonymous on her own thread,
      // whatever the switch says, so a named reply can never out her.
      const parentAuthor = lower(parent.author_email_private || parent.created_by || "");
      if (parent.is_anonymous && parentAuthor === email) isAnonymous = true;
    }

    // The welcome post is the host's pinned note and carries no topic.
    // Everything else at the top level must be tagged.
    const topics = Array.isArray(group.topics) ? group.topics : [];
    let topicKey = typeof payload.topicKey === "string" ? payload.topicKey : "";
    let postType = "share";
    if (parent) {
      topicKey = "";
    } else if (payload.postType === "welcome" && (isHost || isAdmin)) {
      postType = "welcome";
      topicKey = "";
    } else {
      postType = payload.postType === "question" ? "question" : "share";
      const valid = topics.some((t: any) => t.key === topicKey && t.active !== false);
      if (!valid) return json({ error: "topic_required" }, 422);
    }

    const realName = (user.full_name || "").trim() || membership?.display_name || email;
    const displayName = isHost
      ? hostFirstName(hostExpert)
      : (membership?.display_name || firstNameInitial(user.full_name || "", email));

    const record = await svc.GroupPost.create({
      group_id: group.id,
      body: text,
      parent_id: parentId,
      post_type: postType,
      topic_key: topicKey,
      status: postType === "question" ? "open" : "",
      is_anonymous: isAnonymous,
      anon_tint: isAnonymous ? Math.floor(Math.random() * 6) : 0,
      author_name: isAnonymous ? ANON_NAME : displayName,
      author_avatar: isAnonymous ? "" : (isHost ? (hostExpert?.logo_url || hostExpert?.profile_picture || "") : ""),
      author_is_host: isHost,
      author_is_practitioner: false,
      author_email_private: email,
      author_name_private: realName,
      media,
      reply_count: 0,
      is_pinned: postType === "welcome",
      is_deleted: false,
    });

    if (postType === "welcome") {
      await svc.Group.update(group.id, { welcome_post_id: record.id }).catch(() => {});
    }

    // Notifications. An anonymous trigger leaves source empty everywhere.
    const source = isAnonymous ? "" : email;
    const link = parent ? `/${group.slug}?post=${parent.id}` : `/${group.slug}?post=${record.id}`;
    const hosts = await hostEmails(base44, group);

    if (parent) {
      // A host reply answers the question. The record carries the state so
      // the feed, the insights, the counters and the export all agree.
      const parentPatch: any = { reply_count: (parent.reply_count || 0) + 1 };
      if (isHost && parent.post_type === "question" && parent.status !== "answered") {
        parentPatch.status = "answered";
        parentPatch.answered_by = email;
        parentPatch.answered_at = new Date().toISOString();
        parentPatch.answer_post_id = record.id;
      }
      await svc.GroupPost.update(parent.id, parentPatch).catch(() => {});
      const askerEmail = lower(parent.author_email_private || parent.created_by || "");
      // A notification to an anonymous asker never names her and never
      // carries the replier's email either, so the row cannot be read back
      // by anyone but her.
      const askerSource = parent.is_anonymous ? "" : source;
      const who = isHost ? hostFirstName(hostExpert) : (isAnonymous ? "Someone" : displayName);
      // The asker, unless she is replying to herself or has opted out.
      if (askerEmail && askerEmail !== email) {
        const rows = await svc.GroupMember.filter({ group_id: group.id, user_email: askerEmail });
        const askerRow = Array.isArray(rows) ? rows[0] : null;
        const pref = askerRow?.notify_pref || "all";
        if (pref !== "none") {
          await notifyInApp(base44, {
            recipient: askerEmail,
            type: isHost ? "circle_answered" : "circle_reply",
            message: isHost ? `${who} answered your question in ${group.name}.` : `${who} replied to your question in ${group.name}.`,
            linkTo: link, groupId: group.id, postId: parent.id, source: askerSource,
          });
          await sendCircleEmail(base44, {
            to: askerEmail,
            subject: isHost ? `${who} answered your question` : `A reply to your question in ${group.name}`,
            dedupeKey: `circle:reply:${record.id}`,
            text: [
              `Hi,`,
              ``,
              isHost
                ? `${who} has answered the question you asked in ${group.name}.`
                : `${who} replied to the question you asked in ${group.name}.`,
              ``,
              `Read it here: ${APP_ORIGIN}${link}`,
              ``,
              `Nothing in this email shows who you are, and you can change how often you hear from the Circle inside the room.`,
              ``,
              `The Aligned Woman Co.`,
            ].join("\n"),
          });
        }
      }
      // The host hears about every reply that is not her own.
      if (!isHost) {
        for (const h of hosts) {
          if (h === askerEmail) continue;
          await notifyInApp(base44, {
            recipient: h, type: "circle_reply",
            message: `${who} replied in ${group.name}.`,
            linkTo: link, groupId: group.id, postId: parent.id, source,
          });
        }
      }
    } else if (postType !== "welcome") {
      const who = isAnonymous ? "An anonymous member" : displayName;
      for (const h of hosts) {
        if (h === email) continue;
        await notifyInApp(base44, {
          recipient: h, type: "circle_new_question",
          message: `${who} ${postType === "question" ? "asked a question" : "shared something"} in ${group.name}.`,
          linkTo: link, groupId: group.id, postId: record.id, source,
        });
        await sendCircleEmail(base44, {
          to: h, toName: hostFirstName(hostExpert),
          subject: `New ${postType === "question" ? "question" : "post"} in ${group.name}`,
          dedupeKey: `circle:new_post:${record.id}`,
          text: [
            `Hi ${hostFirstName(hostExpert)},`,
            ``,
            `${who} ${postType === "question" ? "asked a question" : "shared something"} in ${group.name}.`,
            ``,
            `Read and reply here: ${APP_ORIGIN}${link}`,
            ``,
            `The Aligned Woman Co.`,
          ].join("\n"),
        });
      }
      // Members on All new questions (the default; an empty pref counts as
      // all), in app only, never naming an anonymous poster.
      const approved = await svc.GroupMember.filter({ group_id: group.id, status: "approved" }, "-created_date", 500);
      const wantAll = (Array.isArray(approved) ? approved : []).filter((m: any) => (m.notify_pref || "all") === "all");
      for (const m of wantAll) {
        const to = lower(m.user_email || m.created_by);
        if (!to || to === email || hosts.includes(to)) continue;
        await notifyInApp(base44, {
          recipient: to, type: "circle_new_question",
          message: `A new ${postType === "question" ? "question" : "post"} in ${group.name}.`,
          linkTo: link, groupId: group.id, postId: record.id, source: "",
        });
      }
    }

    return json({ success: true, postId: record.id });
  } catch (error) {
    return json({ error: (error as Error).message }, 500);
  }
});
