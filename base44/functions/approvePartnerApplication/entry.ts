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
// approvePartnerApplication
// The approval path that did not exist. Admin only. One action does
// everything: updates the application, creates or links exactly one
// Expert record, applies grants, creates the room in draft when
// community hosting is granted (or links an existing unhosted room at
// that slug, which is how the renamed Grounded Women Circle is handed
// to Warda), and sends the approval email with the host guide link.
//
// Payload: { applicationId, action: "approve" | "decline",
//            grants?: { affiliate, courseHost, communityHost },
//            roomName?, roomSlug?, reason? }
// ────────────────────────────────────────────────────────────────

const RESERVED = ["login","register","forgot-password","reset-password","home","blueprint","about-us","checkoutcomplete","claritysprint","apply","checkout","terms-and-conditions","competition","contact","contactform","welcome","checkout-success","pdf-test","startingpointprofile","theawstandard","yourmoneystory","money-story","dashboard","community","experts","admin","expert-dashboard","partner","feminineworkbook","analytics","coursedetail","sectiondetail","workbook","workbookviewer","dashboardsettings","classroom","dailycheckin","definemypurpose","expertsdirectory","expertprofile","members","moduleframeworkbuilder","moduleplayer","myalivejourney","mycycle","mymetrics","mypathway","ourwhy","profilesettings","progress","settings","support","toolshub","home_page","applications","api","assets","static","functions","groundedwoman"];

const DEFAULT_RULES = "This is a closed, women only space. Be kind. No medical advice is given here, only shared experience and guidance to find the right help. What is shared in the Circle stays in the Circle: no screenshots, no sharing. Right of admission reserved. Moderators may remove anyone who makes other members feel unsafe.";

function slugify(s: string) {
  return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 40);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders() });
  try {
    const base44 = createClientFromRequest(req);
    let user: any = null;
    try { user = await base44.auth.me(); } catch (_e) { user = null; }
    if (!user?.email) return json({ error: "not_authenticated" }, 401);
    if (user.role !== "admin") return json({ error: "admin_only" }, 403);

    const p = await req.json().catch(() => ({}));
    const applicationId = typeof p.applicationId === "string" ? p.applicationId : "";
    const action = p.action === "decline" ? "decline" : p.action === "approve" ? "approve" : "";
    if (!applicationId || !action) return json({ error: "applicationId and action are required" }, 400);

    const svc = base44.asServiceRole.entities;
    const found = await svc.ExpertApplication.filter({ id: applicationId });
    const app = Array.isArray(found) ? found[0] : null;
    if (!app) return json({ error: "application_not_found" }, 404);
    if (app.status !== "pending") return json({ error: "already_reviewed", status: app.status }, 409);

    const now = new Date().toISOString();
    const actor = lower(user.email);
    const applicantEmail = lower(app.email);
    const firstName = (app.applicant_name || "there").trim().split(/\s+/)[0];

    if (action === "decline") {
      const reason = typeof p.reason === "string" ? p.reason.trim() : "";
      await svc.ExpertApplication.update(app.id, { status: "rejected", reviewed_at: now, reviewed_by: actor, review_notes: reason });
      await sendCircleEmail(base44, {
        to: applicantEmail, toName: app.applicant_name, bcc: OWNER_EMAIL,
        subject: "About your AW Verified application",
        dedupeKey: `partner:declined:${app.id}`,
        text: [
          `Hi ${firstName},`, ``,
          `Thank you for standing in front of the Aligned Woman Standard. We have read your application carefully, and we are not able to offer verification at this time.`,
          reason ? `\n${reason}\n` : ``,
          `This is not a judgement of your work, and it is not the end of the conversation. You are welcome to apply again in the future.`, ``,
          `With warmth,`, `The Aligned Woman Co.`,
        ].join("\n"),
      });
      return json({ success: true, status: "rejected" });
    }

    const grants = p.grants || {};
    const grantAffiliate = grants.affiliate === true;
    const grantCourseHost = grants.courseHost === true;
    const grantCommunityHost = grants.communityHost === true;
    const isBusiness = app.application_type === "business";

    // One Expert record per person. Link by login email first.
    let expert: any = null;
    const existing = await svc.Expert.filter({ linked_user_email: applicantEmail });
    if (Array.isArray(existing) && existing[0]) expert = existing[0];

    const expertFields: any = {
      name: app.applicant_name,
      title: app.headline || (isBusiness ? "Partner business" : "Practitioner"),
      bio: app.bio || "",
      profile_picture: app.profile_picture || "",
      entity_type: isBusiness ? "business" : "individual",
      business_name: isBusiness ? (app.business_name || "") : "",
      logo_url: isBusiness ? (app.logo_url || "") : "",
      linked_user_email: applicantEmail,
      email: applicantEmail,
      website_url: app.website_url || "",
      instagram_url: app.instagram_url || "",
      linkedin_url: app.linkedin_url || "",
      category: Array.isArray(app.category_interest) ? app.category_interest : [],
      // The admin has just reviewed this person, and the host guide promises
      // the listing goes live on approval. The partner can refine it from
      // My Listing afterwards.
      isPublished: true,
    };

    if (expert) {
      const patch: any = {};
      for (const k of Object.keys(expertFields)) {
        if (k === "isPublished") continue;
        if (!expert[k] && expertFields[k]) patch[k] = expertFields[k];
      }
      patch.isPublished = true;
      await svc.Expert.update(expert.id, patch);
      expert = { ...expert, ...patch };
    } else {
      expert = await svc.Expert.create(expertFields);
    }

    let group: any = null;
    if (grantCommunityHost) {
      const roomName = (typeof p.roomName === "string" && p.roomName.trim()) ? p.roomName.trim() : (app.community_name || `${app.business_name || app.applicant_name} Circle`);
      const slug = slugify(typeof p.roomSlug === "string" && p.roomSlug.trim() ? p.roomSlug : roomName);
      if (!slug || slug.length < 3 || RESERVED.includes(slug)) return json({ error: "slug_not_allowed", slug }, 422);

      const clash = await svc.Group.filter({ slug });
      const atSlug = Array.isArray(clash) ? clash[0] : null;
      if (atSlug && atSlug.host_expert_id && atSlug.host_expert_id !== expert.id) {
        return json({ error: "slug_taken", slug }, 422);
      }
      if (atSlug) {
        // Hand an existing unhosted room to this partner. This is the
        // Hormone Health rename path: the record keeps its id.
        await svc.Group.update(atSlug.id, {
          host_expert_id: expert.id,
          access_mode: atSlug.access_mode || "request",
          status: atSlug.status || "draft",
          rules_text: atSlug.rules_text || DEFAULT_RULES,
        });
        group = { ...atSlug, host_expert_id: expert.id };
      } else {
        group = await svc.Group.create({
          name: roomName,
          slug,
          subtitle: "",
          blurb: app.community_for || "",
          description: app.community_topics || "",
          group_type: "interest",
          visibility: "private",
          is_active: true,
          member_count: 0,
          order: 100,
          host_expert_id: expert.id,
          rules_text: DEFAULT_RULES,
          topics: [],
          accent_token: "sage",
          is_sensitive: true,
          access_mode: "request",
          status: "draft",
        });
      }
      await svc.Expert.update(expert.id, { hosts_group_id: group.id });
      // The host's own membership row, so her moderator view and read marker work.
      const rows = await svc.GroupMember.filter({ group_id: group.id, user_email: applicantEmail });
      if (!(Array.isArray(rows) && rows[0])) {
        await svc.GroupMember.create({
          group_id: group.id, user_email: applicantEmail, role: "owner", status: "approved",
          joined_at: now, last_read_at: now, identifies_as_woman: true, agreed_to_rules_at: now,
          notify_pref: "all", display_name: firstName,
        });
      }
    }

    await svc.ExpertApplication.update(app.id, {
      status: "approved",
      reviewed_at: now,
      reviewed_by: actor,
      created_expert_id: expert.id,
      created_group_id: group?.id || "",
      granted_affiliate: grantAffiliate,
      granted_course_host: grantCourseHost,
      granted_community_host: grantCommunityHost,
      review_notes: typeof p.reason === "string" ? p.reason.trim() : (app.review_notes || ""),
    });

    // Wording follows the approved template in the community host guide.
    const partnerUrl = `${APP_ORIGIN}/partner`;
    const lines = grantCommunityHost && group
      ? [
          `Hi ${firstName},`, ``,
          `Your application to host a community on The Aligned Woman Co. has been approved, and your listing is live in the AW Verified directory.`, ``,
          `Your room has been created in draft. Nobody can see it yet. You set it up yourself, and you decide when it opens.`, ``,
          `Set up your room: ${partnerUrl}`, ``,
          `It takes about ten minutes. Everything is pre-filled from your application, so you are editing rather than starting from nothing: your room name, your bio, the rules, the topics women choose from, a welcome post in your voice, and your invite link. Your room's address is ${roomUrl(group)}.`, ``,
          `The host guide in your dashboard walks you through it, including what you can see as a host, what we ask of you, and how join requests and reports work. Read it before you open the doors.`, ``,
          `When you press Publish, your link goes live and you can start inviting women in.`, ``,
          `If anything is unclear, reply to this email and a person will answer.`, ``,
          `With warmth,`, `The Aligned Woman Co.`,
        ]
      : [
          `Hi ${firstName},`, ``,
          `We are glad to tell you that your application has been approved. You are now AW Verified, and your listing is live in the directory.`, ``,
          `Your partner dashboard is here: ${partnerUrl}`,
          `Log in with this email address. From there you can refine your listing and see the women who ask to be introduced to you.`, ``,
          `If anything is unclear, reply to this email and a person will answer.`, ``,
          `With warmth,`, `The Aligned Woman Co.`,
        ];

    await sendCircleEmail(base44, {
      to: applicantEmail, toName: app.applicant_name, bcc: OWNER_EMAIL,
      subject: grantCommunityHost ? "Your community room is ready to set up" : "You are AW Verified",
      dedupeKey: `partner:approved:${app.id}`,
      text: lines.join("\n"),
    });

    return json({ success: true, status: "approved", expertId: expert.id, groupId: group?.id || "", roomSlug: group?.slug || "" });
  } catch (error) {
    return json({ error: (error as Error).message }, 500);
  }
});
