import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ────────────────────────────────────────────────────────────────
// auditFlow: every write to a member's Alignment Audit goes through here.
//
// AuditResponse is readable by its owner and master_admin only, and
// writable by master_admin only, so nothing can unlock or alter an audit
// from the browser. This function checks the signed-in member owns the
// audit, then writes with the service role.
//
// Actions (POST body { action, ... }):
//   get       her current audit, or null. Links user_id if it was bought
//             before she had an account.
//   start     she ticked the agreement and pressed Start. Saves the tick,
//             the exact wording and the time. purchased → in_progress.
//   snapshot  copies her latest Starting Point Profile result onto the
//             audit, once. A retake later never changes it.
//   save      autosave. Merges answers by question id, stores the part
//             she is on, progress and track, and copies the once-only
//             facts to her MemberProfile.
//   submit    locks the answers. in_progress → submitted, with the due
//             date five business days later (weekends and South African
//             public holidays skipped).
//
// Admin actions (role admin, owner or master_admin only):
//   admin_list      every audit, newest first, as a summary.
//   admin_get       one audit in full, by id.
//   admin_save      saves Laura's blueprint as a draft. Not visible to her.
//   admin_release   saves the blueprint, marks it ready and emails her.
//   admin_complete  marks the audit complete after the call.
// ────────────────────────────────────────────────────────────────

const EDITABLE = ["purchased", "in_progress"];
const PROFILE_FACTS = ["track", "role_or_business", "stage", "industry"];
const SAST_OFFSET_MS = 2 * 60 * 60 * 1000; // South Africa has no daylight saving

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

const lower = (s: unknown) => String(s ?? "").trim().toLowerCase();

// Prefer an audit she is still working on, then the most recent one.
function pickAudit(list: any[]): any | null {
  if (!list.length) return null;
  const sorted = list.slice().sort((a, b) =>
    String(b.purchased_at || b.created_date || "").localeCompare(String(a.purchased_at || a.created_date || ""))
  );
  return sorted.find((a) => EDITABLE.includes(a.status)) || sorted[0];
}

async function findAudits(base44: any, user: any): Promise<any[]> {
  const byId = await base44.asServiceRole.entities.AuditResponse.filter({ user_id: user.id });
  const byEmail = await base44.asServiceRole.entities.AuditResponse.filter({ email: lower(user.email) });
  const seen = new Set<string>();
  const out: any[] = [];
  for (const a of [...(byId || []), ...(byEmail || [])]) {
    if (!seen.has(a.id)) { seen.add(a.id); out.push(a); }
  }
  return out;
}

function owns(audit: any, user: any): boolean {
  return audit && (audit.user_id === user.id || lower(audit.email) === lower(user.email));
}

// ── South African public holidays ──
// Fixed dates, Easter-based dates, and the Public Holidays Act rule that a
// holiday falling on a Sunday moves to the Monday.
function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function saHolidays(year: number): Set<string> {
  const fixed = [
    [1, 1], [3, 21], [4, 27], [5, 1], [6, 16], [8, 9], [9, 24], [12, 16], [12, 25], [12, 26],
  ];
  const days: Date[] = fixed.map(([m, d]) => new Date(Date.UTC(year, m - 1, d)));
  const easter = easterSunday(year);
  days.push(new Date(easter.getTime() - 2 * 86400000)); // Good Friday
  days.push(new Date(easter.getTime() + 1 * 86400000)); // Family Day
  const set = new Set<string>();
  for (const d of days) {
    set.add(ymd(d));
    if (d.getUTCDay() === 0) set.add(ymd(new Date(d.getTime() + 86400000)));
  }
  return set;
}

// Five business days after the submission day, in South African time.
// Due at 17:00 SAST on that day.
function dueDateFrom(submitted: Date, businessDays = 5): Date {
  const local = new Date(submitted.getTime() + SAST_OFFSET_MS);
  let day = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()));
  let counted = 0;
  const cache: Record<number, Set<string>> = {};
  while (counted < businessDays) {
    day = new Date(day.getTime() + 86400000);
    const y = day.getUTCFullYear();
    cache[y] = cache[y] || saHolidays(y);
    const dow = day.getUTCDay();
    if (dow === 0 || dow === 6) continue;
    if (cache[y].has(ymd(day))) continue;
    counted++;
  }
  return new Date(day.getTime() + 17 * 60 * 60 * 1000 - SAST_OFFSET_MS);
}

function clampProgress(n: unknown): number {
  const v = Math.round(Number(n));
  return Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : 0;
}

// What the browser is allowed to see of her own audit. Laura's diagnostic
// is only included once it has been released.
function forClient(a: any) {
  if (!a) return null;
  const released = ["diagnostic_ready", "complete"].includes(a.status);
  return {
    id: a.id,
    status: a.status,
    track: a.track || null,
    agreement_accepted_at: a.agreement_accepted_at || null,
    spp_snapshot: a.spp_snapshot || null,
    answers: a.answers || {},
    last_part: a.last_part || null,
    progress_percent: a.progress_percent || 0,
    purchased_at: a.purchased_at || null,
    submitted_at: a.submitted_at || null,
    due_at: a.due_at || null,
    diagnostic: released ? a.diagnostic || "" : "",
    released_at: released ? a.released_at || null : null,
    completed_at: a.completed_at || null,
  };
}

const ADMIN_ROLES = ["admin", "owner", "master_admin"];
const PROFILE_URL = "https://app.alignedwomanco.com/Profile?tab=audit";

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

function summary(a: any, names: Record<string, string>) {
  return {
    id: a.id,
    email: a.email || "",
    name: names[lower(a.email)] || "",
    status: a.status,
    track: a.track || null,
    progress_percent: a.progress_percent || 0,
    purchased_at: a.purchased_at || a.created_date || null,
    submitted_at: a.submitted_at || null,
    due_at: a.due_at || null,
    released_at: a.released_at || null,
    completed_at: a.completed_at || null,
    has_draft: !!String(a.diagnostic || "").trim(),
  };
}

async function buyerNames(base44: any): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  try {
    const sales = await base44.asServiceRole.entities.Sale.filter({ description: "Alignment Audit" });
    for (const s of sales || []) {
      if (s.buyer_email && s.buyer_name) out[lower(s.buyer_email)] = s.buyer_name;
    }
  } catch (_e) { /* names are a nicety */ }
  return out;
}

async function sendReadyEmail(base44: any, audit: any, name: string) {
  const first = esc(String(name || "").trim().split(" ")[0] || "there");
  const subject = "Your Alignment Audit blueprint is ready";
  const body =
    '<div style="margin:0;padding:0;background-color:#F7F2EE;">' +
      '<div style="max-width:560px;margin:0 auto;padding:40px 24px;font-family:\'Montserrat\',Helvetica,Arial,sans-serif;color:#3A2B30;">' +
        '<div style="background-color:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(74,14,46,0.08);">' +
          '<div style="height:6px;background:linear-gradient(90deg,#4A0E2E,#C4847A);"></div>' +
          '<div style="padding:40px 36px;">' +
            '<p style="margin:0 0 24px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#C4847A;font-weight:600;">The Alignment Audit</p>' +
            '<h1 style="margin:0 0 20px;font-family:\'DM Serif Display\',Georgia,serif;font-size:30px;line-height:1.2;color:#4A0E2E;font-weight:400;">Your blueprint is ready</h1>' +
            '<p style="margin:0 0 16px;font-size:16px;line-height:1.7;">Hi ' + first + ',</p>' +
            '<p style="margin:0 0 16px;font-size:16px;line-height:1.7;">I\'ve read everything you wrote, and your blueprint is waiting in your profile.</p>' +
            '<p style="margin:0 0 28px;font-size:16px;line-height:1.7;">Read it when you have a quiet moment. Then we\'ll go through it together on our call.</p>' +
            '<p style="margin:0 0 28px;"><a href="' + PROFILE_URL + '" style="display:inline-block;background:#C4847A;color:#26030F;text-decoration:none;font-size:12px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;padding:16px 28px;border-radius:100px;">Read your blueprint</a></p>' +
            '<p style="margin:0;font-size:16px;line-height:1.7;">Laura</p>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  let status = "sent";
  let errorMessage = "";
  try {
    await base44.asServiceRole.integrations.Core.SendEmail({ to: audit.email, subject, body });
  } catch (err) {
    status = "failed";
    errorMessage = (err as any)?.message || "send_failed";
  }
  try {
    await base44.asServiceRole.entities.EmailLog.create({
      sent_at: new Date().toISOString(),
      to_email: audit.email,
      to_name: name || "",
      subject,
      type: "one_time",
      status,
      error_message: errorMessage,
    });
  } catch (_e) { /* logging is best effort */ }
  return status === "sent";
}

async function handleAdmin(base44: any, action: string, body: any): Promise<Response> {
  if (action === "admin_list") {
    const all = await base44.asServiceRole.entities.AuditResponse.list("-created_date", 500);
    const names = await buyerNames(base44);
    return json({ audits: (all || []).map((a: any) => summary(a, names)) });
  }
  const id = String(body.id || "");
  if (!id) return json({ error: "id_required" }, 400);
  const rows = await base44.asServiceRole.entities.AuditResponse.filter({ id });
  const audit = rows?.[0];
  if (!audit) return json({ error: "not_found" }, 404);
  const names = await buyerNames(base44);

  if (action === "admin_get") {
    return json({ audit: { ...audit, name: names[lower(audit.email)] || "" } });
  }
  if (action === "admin_save" || action === "admin_release") {
    const diagnostic = String(body.diagnostic ?? "").slice(0, 100000);
    const patch: Record<string, unknown> = { diagnostic };
    let emailed = false;
    if (action === "admin_release") {
      if (!diagnostic.trim()) return json({ error: "diagnostic_required" }, 400);
      if (!["submitted", "diagnostic_ready", "complete"].includes(audit.status)) return json({ error: "not_submitted" }, 409);
      if (audit.status === "submitted") patch.status = "diagnostic_ready";
      if (!audit.released_at) patch.released_at = new Date().toISOString();
    }
    const updated = await base44.asServiceRole.entities.AuditResponse.update(audit.id, patch);
    if (action === "admin_release" && !audit.released_at && body.send_email !== false) {
      emailed = await sendReadyEmail(base44, audit, names[lower(audit.email)] || "");
    }
    return json({ audit: { ...updated, name: names[lower(audit.email)] || "" }, emailed });
  }
  if (action === "admin_complete") {
    if (!["diagnostic_ready", "complete"].includes(audit.status)) return json({ error: "not_released" }, 409);
    const updated = await base44.asServiceRole.entities.AuditResponse.update(audit.id, {
      status: "complete",
      completed_at: audit.completed_at || new Date().toISOString(),
    });
    return json({ audit: { ...updated, name: names[lower(audit.email)] || "" } });
  }
  return json({ error: "unknown_action" }, 400);
}

async function updateProfileFacts(base44: any, user: any, facts: Record<string, unknown>) {
  const patch: Record<string, string> = {};
  for (const k of PROFILE_FACTS) {
    if (facts[k] === undefined) continue;
    const v = String(facts[k] ?? "").trim().slice(0, 300);
    if (k === "track" && v && v !== "business" && v !== "career") continue;
    patch[k] = v;
  }
  if (!Object.keys(patch).length) return;
  try {
    const profiles = await base44.asServiceRole.entities.MemberProfile.filter({ user_id: user.id });
    if (profiles && profiles.length) {
      await base44.asServiceRole.entities.MemberProfile.update(profiles[0].id, patch);
    }
  } catch (_e) {
    // The audit answer is saved either way; the profile catches up next save.
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let base44: any;
  let user: any;
  try {
    base44 = createClientFromRequest(req);
    user = await base44.auth.me();
  } catch (_e) {
    return json({ error: "not_authenticated" }, 401);
  }
  if (!user) return json({ error: "not_authenticated" }, 401);

  let body: any = {};
  try { body = await req.json(); } catch (_e) { body = {}; }
  const action = String(body.action || "");

  if (action.startsWith("admin_")) {
    if (!ADMIN_ROLES.includes(String(user.role || ""))) return json({ error: "forbidden" }, 403);
    try {
      return await handleAdmin(base44, action, body);
    } catch (error) {
      console.error("auditFlow admin error:", (error as any)?.message);
      return json({ error: "server_error" }, 500);
    }
  }

  try {
    const audits = await findAudits(base44, user);
    let audit = pickAudit(audits);

    // Link an audit bought before she had an account.
    if (audit && !audit.user_id) {
      try {
        audit = await base44.asServiceRole.entities.AuditResponse.update(audit.id, { user_id: user.id });
      } catch (_e) { /* still hers by email */ }
    }

    if (action === "get") {
      return json({ audit: forClient(audit) });
    }

    if (!audit || !owns(audit, user)) return json({ error: "no_audit" }, 404);

    if (action === "start") {
      if (!EDITABLE.includes(audit.status)) return json({ error: "locked", audit: forClient(audit) }, 409);
      const text = String(body.agreement_text || "").trim();
      if (!text) return json({ error: "agreement_required" }, 400);
      const patch: Record<string, unknown> = { status: "in_progress" };
      if (!audit.agreement_accepted_at) {
        patch.agreement_accepted_at = new Date().toISOString();
        patch.agreement_text = text.slice(0, 2000);
      }
      if (!audit.last_part) patch.last_part = "track";
      const updated = await base44.asServiceRole.entities.AuditResponse.update(audit.id, patch);
      return json({ audit: forClient(updated) });
    }

    if (action === "snapshot") {
      if (!EDITABLE.includes(audit.status)) return json({ error: "locked", audit: forClient(audit) }, 409);
      if (audit.spp_snapshot && audit.spp_snapshot.primary) return json({ audit: forClient(audit) });

      // Pattern and date come from her own records, not the browser.
      let attempt: any = null;
      const attemptId = String(body.attempt_id || "");
      if (attemptId) {
        try {
          const rows = await base44.asServiceRole.entities.ProfileAttempt.filter({ id: attemptId });
          const row = rows?.[0];
          if (row && (row.user_id === user.id || lower(row.email) === lower(user.email))) attempt = row;
        } catch (_e) { attempt = null; }
      }
      let profile: any = null;
      try {
        const profiles = await base44.asServiceRole.entities.MemberProfile.filter({ user_id: user.id });
        profile = profiles?.[0] || null;
      } catch (_e) { profile = null; }

      const primary = attempt?.primary_key || profile?.computed_archetype_key || "";
      if (!primary) return json({ error: "no_profile" }, 400);

      // The quoted option text is stored as text, because the profile wording
      // changes between versions. Only kept when it came from a verified
      // attempt of hers.
      const quotes: Record<string, string[]> = {};
      if (attempt && body.quotes && typeof body.quotes === "object") {
        for (const [k, v] of Object.entries(body.quotes)) {
          if (!Array.isArray(v)) continue;
          quotes[k] = v.map((x) => String(x || "").slice(0, 600)).filter(Boolean).slice(0, 2);
        }
      }

      const snapshot = {
        attempt_id: attempt?.id || "",
        completed_at: attempt?.completed_at || profile?.quiz_completed_at || "",
        primary,
        secondary: attempt?.secondary_key || profile?.secondary_archetype_key || "",
        quiz_version: attempt?.quiz_version || "",
        quotes,
        taken_at: new Date().toISOString(),
      };
      const updated = await base44.asServiceRole.entities.AuditResponse.update(audit.id, { spp_snapshot: snapshot });
      return json({ audit: forClient(updated) });
    }

    if (action === "save") {
      if (!EDITABLE.includes(audit.status)) return json({ error: "locked", audit: forClient(audit) }, 409);
      const patch: Record<string, unknown> = {};
      if (body.answers && typeof body.answers === "object") {
        const merged = { ...(audit.answers || {}) };
        for (const [k, v] of Object.entries(body.answers)) {
          if (!/^[a-z][a-z0-9_]{0,15}$/.test(k)) continue;
          if (v === null) delete merged[k];
          else merged[k] = v;
        }
        patch.answers = merged;
      }
      if (typeof body.last_part === "string" && body.last_part.length <= 20) patch.last_part = body.last_part;
      if (body.progress_percent !== undefined) patch.progress_percent = clampProgress(body.progress_percent);
      if (body.track === "business" || body.track === "career") patch.track = body.track;
      if (audit.status === "purchased" && audit.agreement_accepted_at) patch.status = "in_progress";
      const updated = Object.keys(patch).length
        ? await base44.asServiceRole.entities.AuditResponse.update(audit.id, patch)
        : audit;
      if (body.profile_facts && typeof body.profile_facts === "object") {
        await updateProfileFacts(base44, user, body.profile_facts);
      }
      return json({ audit: forClient(updated), saved_at: new Date().toISOString() });
    }

    if (action === "submit") {
      if (audit.status !== "in_progress") return json({ error: "locked", audit: forClient(audit) }, 409);
      if (!audit.agreement_accepted_at || !audit.track) return json({ error: "not_started" }, 400);
      const now = new Date();
      const updated = await base44.asServiceRole.entities.AuditResponse.update(audit.id, {
        status: "submitted",
        submitted_at: now.toISOString(),
        due_at: dueDateFrom(now).toISOString(),
        progress_percent: clampProgress(body.progress_percent ?? audit.progress_percent),
        last_part: "review",
      });
      return json({ audit: forClient(updated) });
    }

    return json({ error: "unknown_action" }, 400);
  } catch (error) {
    console.error("auditFlow error:", (error as any)?.message);
    return json({ error: "server_error" }, 500);
  }
});
