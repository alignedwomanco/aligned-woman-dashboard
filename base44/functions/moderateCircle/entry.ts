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
// moderateCircle
// Everything a host or admin does to a room. A host is scoped to the
// one room her Expert record hosts; an admin may act on any room.
//
// Payload: { groupId, action, ...args }
//   overview                      requests, members, reports, topics, insights
//   approve | decline | remove    memberId
//   pin | unpin | mark_answered | unmark_answered | delete_post   postId
//   retag                         postId, topicKey
//   resolve_report | dismiss_report   reportId, note?
//   update_room                   fields: subtitle, description, rules_text,
//                                 host_bio_override, topics, cover_image
//   publish | unpublish
//   export                        CSV text with no names or emails
// ────────────────────────────────────────────────────────────────

const RESERVED = ["login","register","forgot-password","reset-password","home","blueprint","about-us","checkoutcomplete","claritysprint","apply","checkout","terms-and-conditions","competition","contact","contactform","welcome","checkout-success","pdf-test","startingpointprofile","theawstandard","yourmoneystory","money-story","dashboard","community","experts","admin","expert-dashboard","partner","host-guide","feminineworkbook","analytics","coursedetail","sectiondetail","workbook","workbookviewer","dashboardsettings","classroom","dailycheckin","definemypurpose","expertsdirectory","expertprofile","members","moduleframeworkbuilder","moduleplayer","myalivejourney","mycycle","mymetrics","mypathway","ourwhy","profilesettings","progress","settings","support","toolshub","home_page","applications","api","assets","static","functions","groundedwoman"];

function csvEscape(v: unknown) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, "\"\"")}"` : s;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders() });
  try {
    const base44 = createClientFromRequest(req);
    const p = await req.json().catch(() => ({}));
    const groupId = typeof p.groupId === "string" ? p.groupId : "";
    const action = typeof p.action === "string" ? p.action : "";
    if (!groupId || !action) return json({ error: "groupId and action are required" }, 400);

    const ctx = await loadContext(base44, groupId);
    if (ctx.error) return ctx.error;
    const { email, group, isAdmin, isHost, hostExpert } = ctx;
    const svc = base44.asServiceRole.entities;
    const now = new Date().toISOString();

    if (!(isHost || isAdmin)) return json({ error: "not_a_moderator" }, 403);
    const actor = email;

    const findMember = async (id: string) => {
      const rows = await svc.GroupMember.filter({ id, group_id: group.id });
      return Array.isArray(rows) ? rows[0] : null;
    };
    const findPost = async (id: string) => {
      const rows = await svc.GroupPost.filter({ id, group_id: group.id });
      return Array.isArray(rows) ? rows[0] : null;
    };

    if (action === "overview") {
      const members = await svc.GroupMember.filter({ group_id: group.id }, "-created_date", 1000);
      const reports = await svc.Report.filter({ group_id: group.id }, "-created_date", 200);
      const posts = await svc.GroupPost.filter({ group_id: group.id }, "-created_date", 1000);
      const live = (Array.isArray(posts) ? posts : []).filter((x: any) => !x.is_deleted);
      const questions = live.filter((x: any) => !x.parent_id && x.post_type === "question");
      const byTopic: Record<string, number> = {};
      questions.forEach((q: any) => { byTopic[q.topic_key || "none"] = (byTopic[q.topic_key || "none"] || 0) + 1; });
      const since = Date.now() - 30 * 86400000;
      const rows = (Array.isArray(members) ? members : []).map((m: any) => ({
        id: m.id,
        email: m.user_email || m.created_by,
        display_name: m.display_name || firstNameInitial("", m.user_email || m.created_by || ""),
        status: m.status || "approved",
        role: m.role || "member",
        identifies_as_woman: !!m.identifies_as_woman,
        agreed_to_rules_at: m.agreed_to_rules_at || "",
        created_date: m.created_date,
        reviewed_by: m.reviewed_by || "",
        reviewed_at: m.reviewed_at || "",
      }));
      const postById: Record<string, any> = {};
      live.forEach((x: any) => { postById[x.id] = x; });
      const reportRows = (Array.isArray(reports) ? reports : []).map((r: any) => {
        const target = r.target_type === "post" ? postById[r.target_id] : null;
        return {
          id: r.id,
          reason: r.reason,
          detail: r.detail || "",
          status: r.status || "open",
          target_type: r.target_type,
          target_id: r.target_id,
          target_preview: r.target_preview || "",
          created_date: r.created_date,
          resolution_notes: r.resolution_notes || "",
          // Moderator only: the real name behind an anonymous post.
          posted_by: target ? (target.author_name_private || target.author_email_private || target.author_name) : "",
          posted_by_email: target ? (target.author_email_private || "") : "",
          is_anonymous: target ? !!target.is_anonymous : false,
        };
      });
      return json({
        me: { email, role: isAdmin ? "admin" : "host" },
        room: {
          id: group.id, name: group.name, slug: group.slug, subtitle: group.subtitle || "",
          description: group.description || "", rules_text: group.rules_text || "",
          host_bio_override: group.host_bio_override || "", topics: group.topics || [],
          status: group.status || "published", cover_image: group.cover_image || "",
          welcome_post_id: group.welcome_post_id || "",
          live_session: group.live_session || null,
        },
        host: hostExpert ? { name: hostExpert.name, business_name: hostExpert.business_name || "", logo_url: hostExpert.logo_url || hostExpert.profile_picture || "", bio: hostExpert.bio || "" } : null,
        requests: rows.filter((r: any) => r.status === "pending"),
        members: rows.filter((r: any) => r.status !== "pending"),
        reports: reportRows,
        // Every notice she has ever posted, newest first, so she can post
        // one again. Expired ones are only marked here; reads filter them.
        announcements: live
          .filter((x: any) => !x.parent_id && x.post_type === "announcement")
          .sort((a: any, b: any) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime())
          .map((x: any) => ({
            id: x.id,
            body: x.body,
            announcement_kind: x.announcement_kind || "note",
            created_date: x.created_date,
            expires_at: x.expires_at || "",
            expired: !x.expires_at || new Date(x.expires_at).getTime() <= Date.now(),
          })),
        insights: {
          questions_total: questions.length,
          questions_open: questions.filter((q: any) => (q.status || "open") === "open").length,
          questions_answered: questions.filter((q: any) => q.status === "answered").length,
          shares_total: live.filter((x: any) => !x.parent_id && x.post_type === "share").length,
          replies_total: live.filter((x: any) => !!x.parent_id).length,
          members_approved: rows.filter((r: any) => r.status === "approved").length,
          members_pending: rows.filter((r: any) => r.status === "pending").length,
          members_new_30d: rows.filter((r: any) => r.status === "approved" && new Date(r.created_date).getTime() > since).length,
          by_topic: byTopic,
        },
      });
    }

    if (action === "approve" || action === "decline" || action === "remove") {
      const m = await findMember(String(p.memberId || ""));
      if (!m) return json({ error: "member_not_found" }, 404);
      const status = action === "approve" ? "approved" : action === "decline" ? "declined" : "removed";
      const memberEmail = lower(m.user_email || m.created_by);
      let displayName = m.display_name || "";
      if (action === "approve" && !displayName) {
        try {
          const users = await svc.User.filter({ email: memberEmail });
          const u = Array.isArray(users) ? users[0] : null;
          displayName = firstNameInitial(u?.full_name || "", memberEmail);
        } catch (_e) { displayName = firstNameInitial("", memberEmail); }
      }
      await svc.GroupMember.update(m.id, { status, reviewed_by: actor, reviewed_at: now, display_name: displayName || m.display_name || "" });
      const link = `/${group.slug}`;
      const greetName = (displayName || m.display_name || "").trim().split(/\s+/)[0] || "";
      const greeting = greetName ? `Hi ${greetName},` : `Hi there,`;
      const hostLabel = hostExpert ? hostFirstName(hostExpert) : "The host";
      if (action === "approve") {
        await notifyInApp(base44, { recipient: memberEmail, type: "circle_approved", message: `You are in. ${group.name} is open to you now.`, linkTo: link, groupId: group.id });
        await sendCircleEmail(base44, {
          to: memberEmail, subject: `You are in: ${group.name}`, dedupeKey: `circle:approved:${m.id}`,
          text: [
            greeting, ``,
            `Your request to join ${group.name} has been approved. The Circle is open to you now.`, ``,
            `Step in here: ${roomUrl(group)}`, ``,
            `A reminder of how it works: post under your name or as Anonymous member, your choice each time. ${hostLabel} and The Aligned Woman Co. can see who posted, to keep the Circle safe. What is shared in the Circle stays in the Circle.`, ``,
            `With warmth,`, `The Aligned Woman Co.`,
          ].join("\n"),
        });
      } else if (action === "decline") {
        await notifyInApp(base44, { recipient: memberEmail, type: "circle_declined", message: `Your request to join ${group.name} was not approved.`, linkTo: link, groupId: group.id });
        await sendCircleEmail(base44, {
          to: memberEmail, subject: `About your request to join ${group.name}`, dedupeKey: `circle:declined:${m.id}`,
          text: [
            greeting, ``,
            `Every request to join ${group.name} is reviewed one at a time, and this one has not been approved.`, ``,
            `If you think something went wrong, reply to this email and we will look.`, ``,
            `The Aligned Woman Co.`,
          ].join("\n"),
        });
      }
      return json({ success: true, status, reviewed_by: actor });
    }

    if (["pin", "unpin", "mark_answered", "unmark_answered", "delete_post"].includes(action)) {
      const post = await findPost(String(p.postId || ""));
      if (!post) return json({ error: "post_not_found" }, 404);
      const patch: any = {};
      if (action === "pin") patch.is_pinned = true;
      if (action === "unpin") patch.is_pinned = false;
      if (action === "mark_answered") { patch.status = "answered"; patch.answered_by = actor; patch.answered_at = now; if (typeof p.answerPostId === "string") patch.answer_post_id = p.answerPostId; }
      if (action === "unmark_answered") { patch.status = "open"; patch.answered_by = ""; patch.answered_at = ""; patch.answer_post_id = ""; }
      if (action === "delete_post") patch.is_deleted = true;
      await svc.GroupPost.update(post.id, patch);
      if (action === "delete_post" && post.parent_id) {
        const parent = await findPost(post.parent_id);
        if (parent) await svc.GroupPost.update(parent.id, { reply_count: Math.max(0, (parent.reply_count || 0) - 1) }).catch(() => {});
      }
      return json({ success: true });
    }

    if (action === "clear_announcement") {
      const post = await findPost(String(p.postId || ""));
      if (!post || post.post_type !== "announcement") return json({ error: "post_not_found" }, 404);
      // Clearing is expiring. The record stays, so she can post it again.
      await svc.GroupPost.update(post.id, { expires_at: now });
      return json({ success: true });
    }

    if (action === "retag") {
      const post = await findPost(String(p.postId || ""));
      if (!post) return json({ error: "post_not_found" }, 404);
      const topics = Array.isArray(group.topics) ? group.topics : [];
      if (!topics.some((t: any) => t.key === p.topicKey)) return json({ error: "unknown_topic" }, 422);
      await svc.GroupPost.update(post.id, { topic_key: p.topicKey });
      return json({ success: true });
    }

    if (action === "resolve_report" || action === "dismiss_report") {
      const rows = await svc.Report.filter({ id: String(p.reportId || ""), group_id: group.id });
      const r = Array.isArray(rows) ? rows[0] : null;
      if (!r) return json({ error: "report_not_found" }, 404);
      await svc.Report.update(r.id, {
        status: action === "resolve_report" ? "actioned" : "dismissed",
        resolution_notes: `${typeof p.note === "string" ? p.note.trim() + " " : ""}(by ${actor}, ${now})`.trim(),
      });
      return json({ success: true });
    }

    if (action === "update_room") {
      const f = p.fields || {};
      const patch: any = {};
      for (const k of ["subtitle", "description", "rules_text", "host_bio_override", "cover_image"]) {
        if (typeof f[k] === "string") patch[k] = f[k].trim().slice(0, 4000);
      }
      // Three things cannot be switched off, per the host guide: women
      // only, approved members only, nothing shared outside the room. If a
      // host edits them out, the promise is appended back.
      if (typeof patch.rules_text === "string") {
        const t = patch.rules_text.toLowerCase();
        const fixed = [
          ["women only", "This is a closed, women only space."],
          ["approved", "Every member is approved before she can see anything."],
          ["stays in the circle", "What is shared in the Circle stays in the Circle: no screenshots, no sharing."],
        ].filter(([needle]) => !t.includes(needle)).map(([, sentence]) => sentence);
        if (fixed.length) patch.rules_text = `${patch.rules_text}${patch.rules_text ? " " : ""}${fixed.join(" ")}`;
      }
      if (Array.isArray(f.topics)) {
        // Keys are stable identifiers posts point at. The client sends one
        // for every topic; a missing key gets a random one, never one
        // derived from the label, so a rename can never orphan posts.
        patch.topics = f.topics
          .filter((t: any) => t && typeof t.label === "string" && t.label.trim())
          .slice(0, 30)
          .map((t: any, i: number) => ({
            key: (typeof t.key === "string" && t.key.trim()) ? t.key.trim() : `t${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`,
            label: t.label.trim().slice(0, 60),
            order: typeof t.order === "number" ? t.order : i,
            active: t.active !== false,
          }));
      }
      // The weekly live hour. Times are South African time, so a fixed
      // offset is exact. The next occurrence is worked out in the browser.
      if (f.live_session && typeof f.live_session === "object") {
        const ls = f.live_session;
        const day = Number(ls.day);
        const time = String(ls.start_time || "");
        if (!(Number.isInteger(day) && day >= 0 && day <= 6) || !/^\d{1,2}:\d{2}$/.test(time)) return json({ error: "invalid_live_session" }, 422);
        patch.live_session = {
          on: ls.on !== false,
          day,
          start_time: time,
          duration_minutes: Math.min(240, Math.max(15, Number(ls.duration_minutes) || 60)),
          label: (typeof ls.label === "string" && ls.label.trim() ? ls.label.trim() : "Circle Hour").slice(0, 40),
        };
      }
      // The host may rename her room. The address stays with admins, since
      // changing it after the link has been shared breaks every copy of it.
      if (typeof f.name === "string" && f.name.trim()) patch.name = f.name.trim().slice(0, 120);
      if (isAdmin && typeof f.slug === "string") {
        const slug = f.slug.trim().toLowerCase();
        if (!/^[a-z0-9-]{3,40}$/.test(slug) || RESERVED.includes(slug)) return json({ error: "slug_not_allowed" }, 422);
        const clash = await svc.Group.filter({ slug });
        if ((Array.isArray(clash) ? clash : []).some((g: any) => g.id !== group.id)) return json({ error: "slug_taken" }, 422);
        patch.slug = slug;
      }
      if (Object.keys(patch).length === 0) return json({ error: "nothing_to_update" }, 422);
      await svc.Group.update(group.id, patch);
      return json({ success: true, patch });
    }

    if (action === "publish" || action === "unpublish") {
      const status = action === "publish" ? "published" : "draft";
      await svc.Group.update(group.id, { status, is_active: true });
      return json({ success: true, status });
    }

    if (action === "export") {
      const posts = await svc.GroupPost.filter({ group_id: group.id }, "-created_date", 2000);
      const topics: Record<string, string> = {};
      (Array.isArray(group.topics) ? group.topics : []).forEach((t: any) => { topics[t.key] = t.label; });
      const lines = ["date,type,topic,status,anonymous,replies,body"];
      (Array.isArray(posts) ? posts : []).filter((x: any) => !x.is_deleted && !x.parent_id).forEach((x: any) => {
        lines.push([
          x.created_date, x.post_type || "share", topics[x.topic_key] || "", x.status || "open",
          x.is_anonymous ? "yes" : "no", x.reply_count || 0, x.body,
        ].map(csvEscape).join(","));
      });
      return json({ success: true, csv: lines.join("\n"), filename: `${group.slug}-questions.csv` });
    }

    return json({ error: "unknown_action" }, 400);
  } catch (error) {
    return json({ error: (error as Error).message }, 500);
  }
});