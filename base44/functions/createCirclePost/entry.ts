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

const BRAND_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695154cb868ee011bb627195/23f49bf5a_AlignedWomanLogoPurple.png";
const BRAND_FONT_BODY = "Montserrat, 'Helvetica Neue', Arial, sans-serif";
const BRAND_FONT_DISPLAY = "'DM Serif Display', Georgia, 'Times New Roman', serif";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function linkify(s: string): string {
  return escapeHtml(s).replace(/(https?:\/\/[^\s<]+)/g, (u) => `<a href="${u}" style="color:#C4847A;text-decoration:underline;word-break:break-all;">${u}</a>`);
}

// Turns the plain text email into the branded HTML version. Blocks are
// split on blank lines. A line shaped "Label: https://..." becomes the
// call to action (the first one a filled button, later ones a link).
// The sign off is set quieter. The plain text part is still sent, so
// a client that cannot render HTML gets exactly the same words.
function renderCircleHtml(subject: string, text: string): string {
  const blocks = text.replace(/\r/g, "").split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const ctaRe = /^(.{2,80}?):\s*(https?:\/\/\S+)$/;
  let usedButton = false;
  const parts: string[] = [];
  const P = `margin:0 0 18px;font-family:${BRAND_FONT_BODY};font-size:15px;line-height:1.7;color:#3D2B2D;font-weight:300;`;
  const QUIET = `margin:0 0 6px;font-family:${BRAND_FONT_BODY};font-size:14px;line-height:1.6;color:#8A7068;font-weight:300;`;

  blocks.forEach((block, i) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const isSignOff = /^with warmth,?$/i.test(lines[0] || "") || (i === blocks.length - 1 && lines.length <= 3 && /aligned woman/i.test(block));
    if (isSignOff) {
      parts.push(`<p style="${QUIET}margin-top:10px;">${lines.map(escapeHtml).join("<br/>")}</p>`);
      return;
    }
    const single = lines.length === 1 ? lines[0] : "";
    const cta = single ? single.match(ctaRe) : null;
    if (cta) {
      const label = escapeHtml(cta[1]);
      const href = cta[2];
      if (!usedButton) {
        usedButton = true;
        parts.push(
          `<table cellpadding="0" cellspacing="0" role="presentation" style="margin:6px 0 26px;"><tr><td style="background:#4A0E2E;border-radius:100px;padding:15px 34px;">` +
          `<a href="${href}" style="color:#FFFFFF;font-family:${BRAND_FONT_BODY};font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;text-decoration:none;display:inline-block;">${label}</a>` +
          `</td></tr></table>`,
        );
      } else {
        parts.push(`<p style="${P}"><strong style="font-weight:600;">${label}:</strong> <a href="${href}" style="color:#C4847A;text-decoration:underline;word-break:break-all;">${href}</a></p>`);
      }
      return;
    }
    parts.push(`<p style="${P}">${lines.map(linkify).join("<br/>")}</p>`);
  });

  const heading = escapeHtml(subject).replace(/\bWoman\b/, `<em style="font-style:italic;">Woman</em>`).replace(/\bWomen\b/, `<em style="font-style:italic;">Women</em>`);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#F7EFEC;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#F7EFEC;padding:36px 14px;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" role="presentation" style="max-width:580px;width:100%;background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 14px 40px rgba(61,43,45,0.07);">
          <tr>
            <td style="background:#4A0E2E;padding:28px 40px;text-align:center;">
              <img src="${BRAND_LOGO}" alt="The Aligned Woman" height="36" style="filter:brightness(0) invert(1);height:36px;" />
            </td>
          </tr>
          <tr>
            <td style="padding:38px 40px 26px;">
              <h1 style="margin:0 0 22px;font-family:${BRAND_FONT_DISPLAY};font-size:27px;line-height:1.2;color:#4A0E2E;font-weight:400;">${heading}</h1>
              ${parts.join("\n              ")}
            </td>
          </tr>
          <tr>
            <td style="background:#F5DDD9;padding:22px 40px;text-align:center;">
              <p style="margin:0;font-family:${BRAND_FONT_BODY};font-size:12px;line-height:1.7;color:#8A7068;">
                The education women should have been given.<br/>
                Reply to this email and a person will answer.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildMime(to: string, bcc: string | null, subject: string, text: string): string {
  const encodedSubject = `=?utf-8?B?${toBase64(subject)}?=`;
  const boundary = `----=_AW_${crypto.randomUUID().replace(/-/g, "")}`;
  const headers = [
    `From: ${FROM_HEADER}`,
    `To: ${to}`,
    bcc ? `Bcc: ${bcc}` : null,
    `Reply-To: ${OWNER_EMAIL}`,
    `Subject: ${encodedSubject}`,
    `Date: ${new Date().toUTCString()}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ].filter(Boolean).join("\r\n");
  const body = [
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    toBase64(text),
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    toBase64(renderCircleHtml(subject, text)),
    `--${boundary}--`,
  ].join("\r\n");
  return `${headers}\r\n\r\n${body}`;
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
    } else if (payload.postType === "announcement" && (isHost || isAdmin)) {
      // A one off notice for an exception. Host and admins only, never
      // tagged, never a thread. It carries its own expiry and leaves the
      // feed by falling out of the active window on read.
      postType = "announcement";
      topicKey = "";
    } else {
      postType = payload.postType === "question" ? "question" : "share";
      const valid = topics.some((t: any) => t.key === topicKey && t.active !== false);
      if (!valid) return json({ error: "topic_required" }, 422);
    }

    let expiresAt = "";
    let announcementKind = "";
    if (postType === "announcement") {
      const expiry = Date.parse(String(payload.expiresAt || ""));
      if (!Number.isFinite(expiry) || expiry <= Date.now()) return json({ error: "announcement_needs_future_expiry" }, 422);
      expiresAt = new Date(expiry).toISOString();
      announcementKind = ["live", "answers", "away", "note"].includes(payload.announcementKind) ? payload.announcementKind : "note";
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
      expires_at: expiresAt,
      announcement_kind: announcementKind,
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

    // An announcement is not a conversation. It notifies the approved
    // members once, if the host asked for it, and stops there: no topic,
    // no replies, no thread. Posting a new one supersedes the last,
    // because only the newest unexpired notice is ever active.
    if (postType === "announcement") {
      if (payload.notify === true) {
        const approved = await svc.GroupMember.filter({ group_id: group.id, status: "approved" }, "-created_date", 500);
        for (const m of (Array.isArray(approved) ? approved : [])) {
          const to = lower(m.user_email || m.created_by);
          if (!to || to === email) continue;
          await notifyInApp(base44, {
            recipient: to, type: "circle_announcement",
            message: `${hostFirstName(hostExpert)} posted a notice in ${group.name}.`,
            linkTo: `/${group.slug}`, groupId: group.id, postId: record.id, source: email,
          });
        }
      }
      return json({ success: true, postId: record.id });
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