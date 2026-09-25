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

// An announcement is the host's own notice, never anonymous, and it is
// shown as a strip, not a thread. Only what the strip needs leaves here.
function announcementView(post: any) {
  return {
    id: post.id,
    body: post.body,
    announcement_kind: post.announcement_kind || "note",
    author_name: post.author_name || "The host",
    created_date: post.created_date,
    expires_at: post.expires_at || "",
  };
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

    const svc = base44.asServiceRole.entities;

    if (!canRead) {
      // Nothing visible before approval except one thing: an active notice,
      // and only when it is not an away notice. A woman waiting to be
      // approved should see when the room next meets, not that the host is
      // away. The schedule itself comes from the public Group record.
      let notice: any = null;
      try {
        const raw = await svc.GroupPost.filter({ group_id: group.id, post_type: "announcement" }, "-created_date", 20);
        const open = (Array.isArray(raw) ? raw : []).filter((a: any) =>
          !a.is_deleted && a.announcement_kind !== "away" && a.expires_at && new Date(a.expires_at).getTime() > Date.now());
        notice = open[0] ? announcementView(open[0]) : null;
      } catch (_e) { notice = null; }
      return json({ me, host, posts: [], replies: [], pinned: null, announcement: notice });
    }

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
      .filter((p: any) => p.post_type !== "welcome" && p.post_type !== "announcement")
      .sort((a: any, b: any) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0))
      .map((p: any) => publicView(p, viewer, ""));
    const welcome = topLevel.find((p: any) => p.post_type === "welcome") || null;
    const pinned = welcome ? publicView(welcome, viewer, "") : null;

    // Only the newest unexpired notice is ever active. Expired ones are
    // filtered here, never deleted, so the host still has her history.
    const nowMs = Date.now();
    const active = topLevel
      .filter((p: any) => p.post_type === "announcement" && p.expires_at && new Date(p.expires_at).getTime() > nowMs)
      .sort((a: any, b: any) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime())[0] || null;

    return json({ me, host, posts, pinned, announcement: active ? announcementView(active) : null });
  } catch (error) {
    return json({ error: (error as Error).message }, 500);
  }
});