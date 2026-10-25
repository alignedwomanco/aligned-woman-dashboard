import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Starting Point Profile (v3). Every attempt is saved, including women who
// never sign up, so the quiz has to write before there is an account. Base44
// will not let a signed-out visitor update a record she created, so all
// ProfileAttempt writes come through here, using the service role. The
// browser holds the attempt id and a random token; an update must match both.
// user_id is only ever taken from the signed-in session, never from the body.

const KEYS = ['performer', 'over_functioner', 'delegator', 'overrider', 'reactor'];
const GUESSES = [...KEYS, 'unsure'];
const FITS = ['yes', 'partly', 'not_really'];
const STAGE_ORDER = ['started', 'completed', 'lead', 'account'];

function str(v: unknown, max = 500) {
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  return t ? t.slice(0, max) : undefined;
}

function clean(input: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  if (Array.isArray(input.answers)) {
    const a = input.answers.filter((x) => typeof x === 'string' && KEYS.includes(x as string)).slice(0, 12);
    out.answers = a;
  }
  if (typeof input.primary_key === 'string' && KEYS.includes(input.primary_key)) out.primary_key = input.primary_key;
  if (typeof input.secondary_key === 'string' && KEYS.includes(input.secondary_key)) out.secondary_key = input.secondary_key;
  if (typeof input.guess === 'string' && GUESSES.includes(input.guess)) out.guess = input.guess;
  if (typeof input.fit === 'string' && FITS.includes(input.fit)) out.fit = input.fit;
  if (input.mix && typeof input.mix === 'object' && !Array.isArray(input.mix)) {
    const m: Record<string, number> = {};
    for (const k of KEYS) {
      const n = Number((input.mix as Record<string, unknown>)[k]);
      if (Number.isFinite(n)) m[k] = Math.max(0, Math.min(100, Math.round(n)));
    }
    out.mix = m;
  }
  for (const f of ['source', 'utm_source', 'utm_medium', 'utm_campaign']) {
    const v = str(input[f], 200);
    if (v !== undefined) out[f] = v;
  }
  const fn = str(input.first_name, 100);
  if (fn !== undefined) out.first_name = fn;
  const em = str(input.email, 200);
  if (em !== undefined && /^\S+@\S+\.\S+$/.test(em)) out.email = em.toLowerCase();
  if (typeof input.consent === 'boolean') out.consent = input.consent;
  const ct = str(input.consent_text, 500);
  if (ct !== undefined) out.consent_text = ct;
  if (typeof input.stage === 'string' && STAGE_ORDER.includes(input.stage)) out.stage = input.stage;
  for (const f of ['started_at', 'completed_at', 'consent_at']) {
    const v = str(input[f], 40);
    if (v !== undefined && !Number.isNaN(Date.parse(v))) out[f] = v;
  }
  return out;
}

function newToken() {
  const b = new Uint8Array(24);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = body?.action;
    const fields = clean(body?.fields || {});

    let user = null;
    try { user = await base44.auth.me(); } catch (_e) { user = null; }

    const db = base44.asServiceRole.entities.ProfileAttempt;

    if (action === 'create') {
      const token = newToken();
      const rec = await db.create({
        quiz_version: 'v3',
        stage: 'started',
        started_at: new Date().toISOString(),
        ...fields,
        token,
        ...(user?.id ? { user_id: user.id } : {}),
      });
      return Response.json({ id: rec.id, token });
    }

    if (action === 'update' || action === 'link') {
      const id = str(body?.id, 64);
      const token = str(body?.token, 128);
      if (!id || !token) return Response.json({ error: 'missing id or token' }, { status: 400 });
      let rec = null;
      try { rec = await db.get(id); } catch (_e) { rec = null; }
      if (!rec || rec.token !== token) return Response.json({ error: 'not found' }, { status: 404 });

      const patch: Record<string, unknown> = { ...fields };
      // Stage only ever moves forward.
      if (patch.stage && STAGE_ORDER.indexOf(patch.stage as string) < STAGE_ORDER.indexOf(rec.stage || 'started')) {
        delete patch.stage;
      }
      if (user?.id) {
        patch.user_id = user.id;
        if (action === 'link') patch.stage = 'account';
        if (!rec.email && user.email) patch.email = String(user.email).toLowerCase();
      }
      if (patch.consent === true && !rec.consent_at && !patch.consent_at) patch.consent_at = new Date().toISOString();
      await db.update(id, patch);
      return Response.json({ ok: true, id });
    }

    return Response.json({ error: 'unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});
