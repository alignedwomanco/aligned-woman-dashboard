import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

const TARGET_EMAILS = [
  "alignedwomenllc@gmail.com",
  "laurat38@gmail.com",
  "millie@alignedwomanco.com",
  "test1@alignedwomanco.com",
  "test2@alignedwomanco.com",
  "test3@alignedwomanco.com",
  "test4@alignedwomanco.com",
  "test6@alignedwomanco.com",
  "test7@alignedwomanco.com",
  "test8@alignedwomanco.com",
  "test9@alignedwomanco.com",
  "test10@alignedwomanco.com",
  "test11@alignedwomanco.com",
  "test12@alignedwomanco.com",
  "test13@alignedwomanco.com",
  "test14expert@alignedwomanco.com",
  "test15expert@alignedwomanco.com",
  "test@alignedwomanco.com",
  "womanaligned@gmail.com",
  "stripetest4@alignedwomanco.com",
];

const PROTECTED_EMAILS = new Set([
  "hello@laurajanethomas.biz",
  "aaliah.badloo@gmail.com",
]);

const CREATED_BY_ENTITIES = [
  "CourseProgress",
  "CourseEnrollment",
  "MemberProfile",
  "DiagnosticSession",
  "DefineMyPurposeSession",
  "WorkbookResponse",
  "QuizAttempt",
  "ToolRun",
  "JournalEntry",
  "CheckIn",
  "ModuleComment",
  "ModuleEngagement",
  "SubModuleProgress",
  "UserModuleProgress",
  "UserPoints",
  "UserBadge",
  "UserSession",
  "NutritionProfile",
  "NutritionDailyLog",
  "NutritionPillarAudit",
  "NutritionCommitment",
  "MealPlan",
  "CommunityPost",
  "PostComment",
  "PostLike",
  "DirectMessage",
  "UserFollow",
  "Notification",
  "SupportTicket",
  "Application",
  "ContactSubmission",
  "BulkEnquiry",
  "ChatWidgetLog",
];

const SPECIFIC_IDS = [
  { entity: "Expert",    id: "6a21312b8f9140a662f46053" },
  { entity: "Affiliate", id: "6a2138ca3ba72d8ecc3860f1" },
  { entity: "Sale",      id: "6a21e6458a009f6c891057c7" },
  { entity: "Sale",      id: "6a21de31062bf2b9b7096fe8" },
];

async function deleteByField(svc, entityName, field, values, summary) {
  if (!values || values.length === 0) return;
  const entity = svc.entities[entityName];
  if (!entity) { summary.skipped.push(entityName + " (entity not found)"); return; }
  let deleted = 0;
  for (const val of values) {
    try {
      const filter = {};
      filter[field] = val;
      const records = await entity.filter(filter, null, 500);
      for (const rec of (records || [])) {
        await entity.delete(rec.id);
        deleted++;
      }
    } catch (err) {
      summary.errors.push(entityName + " [" + field + "=" + val + "]: " + (err?.message || err));
    }
  }
  summary.counts[entityName] = (summary.counts[entityName] || 0) + deleted;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*" } });
  }

  const base44 = createClientFromRequest(req);
  const svc = base44.asServiceRole;

  // Admin guard
  let caller;
  try { caller = await base44.auth.me(); } catch (_) { caller = null; }
  if (!caller || caller.role !== "admin") {
    return Response.json({ error: "Forbidden: admin only" }, { status: 403 });
  }

  const summary = {
    counts: {},
    usersDeleted: 0,
    usersNeedManualDeletion: [],
    errors: [],
    skipped: [],
  };

  // ── Step 1: Resolve User records ─────────────────────────────────────────
  let allUsers = [];
  try {
    allUsers = await svc.entities.User.list(null, 2000);
  } catch (err) {
    return Response.json({ error: "Failed to list users: " + (err?.message || err) }, { status: 500 });
  }

  const usersByEmail = {};
  for (const u of allUsers) {
    if (u.email) usersByEmail[u.email.toLowerCase()] = u;
  }

  const targetUsers = [];
  for (const email of TARGET_EMAILS) {
    const lc = email.toLowerCase();
    if (PROTECTED_EMAILS.has(lc)) {
      return Response.json({ error: "ABORT: target list contains a protected email: " + email }, { status: 400 });
    }
    const user = usersByEmail[lc];
    if (user) targetUsers.push(user);
  }

  const targetUserIds = new Set(targetUsers.map(u => u.id));
  const targetEmailsLower = TARGET_EMAILS.map(e => e.toLowerCase());

  // Safety: confirm none of the resolved ids belong to protected accounts
  for (const u of targetUsers) {
    if (PROTECTED_EMAILS.has((u.email || "").toLowerCase())) {
      return Response.json({ error: "ABORT: protected account in resolved set: " + u.email }, { status: 400 });
    }
  }

  // ── Step 2: Delete by created_by_id ──────────────────────────────────────
  const userIdArray = [...targetUserIds];
  for (const entityName of CREATED_BY_ENTITIES) {
    await deleteByField(svc, entityName, "created_by_id", userIdArray, summary);
  }

  // ── Step 3: MemberProfile by user_id ─────────────────────────────────────
  await deleteByField(svc, "MemberProfile", "user_id", userIdArray, summary);

  // ── Step 4: Email-keyed footprint records ─────────────────────────────────
  await deleteByField(svc, "CourseEnrollment", "userEmail", targetEmailsLower, summary);
  await deleteByField(svc, "Sale", "buyer_email", targetEmailsLower, summary);
  await deleteByField(svc, "WaitlistSignup", "email", targetEmailsLower, summary);
  await deleteByField(svc, "AbandonedCart", "email", targetEmailsLower, summary);

  // ── Step 5: Specific records by id ───────────────────────────────────────
  for (const { entity, id } of SPECIFIC_IDS) {
    try {
      const ent = svc.entities[entity];
      if (!ent) { summary.skipped.push(entity + " id " + id + " (entity not found)"); continue; }
      await ent.delete(id);
      summary.counts[entity + "_specific"] = (summary.counts[entity + "_specific"] || 0) + 1;
    } catch (err) {
      // Record may already be gone — log but don't fail
      summary.errors.push("Specific delete " + entity + " " + id + ": " + (err?.message || err));
    }
  }

  // ── Step 6: Delete User records ───────────────────────────────────────────
  for (const user of targetUsers) {
    try {
      await svc.entities.User.delete(user.id);
      summary.usersDeleted++;
    } catch (err) {
      summary.usersNeedManualDeletion.push(user.email);
    }
  }

  return Response.json({ success: true, summary });
});