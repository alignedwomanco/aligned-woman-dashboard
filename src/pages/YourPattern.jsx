import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import AppShellV2 from "@/components/dashboard-v2/AppShellV2";
import CheckoutModal from "@/components/dashboard/CheckoutModal";
import { usePaymentContext } from "@/context/PaymentContext";
import { hasBlueprintAccess } from "@/lib/entitlement";
import "@/components/spp/spp.css";
import { DESIGN_KEY, PLATFORM_KEY } from "@/data/startingPointProfile";
import { PatternFull, Doors, ApplySheet, FootNote, Primary } from "@/components/spp/SppUI";
import { saveQuizResultToProfile, mixFromObject, guessFromPlatform, track, clearProgress } from "@/lib/sppStore";

// ────────────────────────────────────────────────────────────────
// Your Pattern (/YourPattern). Her full Starting Point Profile and the two
// doors (design screens 9 and 10). In the side menu under Directory.
// Declared in App.jsx ahead of the generic page loop, like /Dashboard, so it
// renders in its own AppShellV2 chrome and never meets Layout.jsx's
// PendingApproval gate: free members who just took the quiz must reach it.
// ────────────────────────────────────────────────────────────────

export default function YourPattern() {
  const navigate = useNavigate();
  const { displayPrice, loading: priceLoading } = usePaymentContext();
  const [me, setMe] = useState(null);
  const [profile, setProfile] = useState(undefined); // undefined = loading
  const [first, setFirst] = useState(false);
  const [route, setRouteState] = useState(null);
  const [applied, setApplied] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await base44.auth.me();
        if (cancelled) return;
        setMe(user);
        let pending = "";
        try { pending = sessionStorage.getItem("aw_pending_full_name") || ""; } catch (_e) { /* ignore */ }
        const p = await saveQuizResultToProfile(user, { firstName: pending || (user?.full_name || "").split(" ")[0] });
        if (cancelled) return;
        setProfile(p || null);
        setRouteState(p?.next_step_route || null);
        if (p?.computed_archetype_key && !p.pattern_section_seen_at) {
          setFirst(true);
          base44.entities.MemberProfile.update(p.id, { pattern_section_seen_at: new Date().toISOString() }).catch(() => {});
        }
        try {
          const apps = await base44.entities.Application.filter({ programme: "one_on_one", user_id: user.id }, "-created_date", 1);
          if (!cancelled && apps?.length) setApplied(true);
        } catch (_e) { /* ignore */ }
      } catch (_e) {
        if (!cancelled) { setLoadError(true); setProfile(null); }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const firstName = profile?.first_name || (me?.full_name || "").split(" ")[0] || "there";
  const primary = DESIGN_KEY[profile?.computed_archetype_key];
  const secondary = DESIGN_KEY[profile?.secondary_archetype_key];
  const mix = primary ? mixFromObject(profile?.quiz_mix, primary, secondary) : null;
  const res = primary ? { primary, secondary: secondary || primary, mix } : null;
  const guess = guessFromPlatform(profile?.quiz_guess);
  const imgIdx = Number(profile?.quiz_image_variant) || 0;
  const bought = hasBlueprintAccess(me);
  const bpPrice = priceLoading ? "" : displayPrice;

  const setRoute = (r) => {
    setRouteState(r);
    if (r) track("spp_route", { route: r });
    if (profile?.id) base44.entities.MemberProfile.update(profile.id, { next_step_route: r || null }).catch(() => {});
  };

  const onDoor = (k) => {
    track("spp_door_click", { door: k });
    if (k === "bp") setCheckoutOpen(true);
    else if (k === "laura") setSheet(true);
    else if (k === "continue") navigate("/Classroom");
  };

  const retake = () => {
    track("spp_retake", {});
    clearProgress();
    navigate("/StartingPointProfile");
  };

  const submitApplication = async ({ name, email, a1, a2 }) => {
    await base44.entities.Application.create({
      full_name: name,
      email,
      programme: "one_on_one",
      user_id: me?.id,
      primary_key: profile?.computed_archetype_key,
      secondary_key: profile?.secondary_archetype_key || undefined,
      answer_1: a1,
      answer_2: a2 || "",
      source: profile?.quiz_source || "",
      status: "pending",
    });
    track("spp_application_sent", { primary: profile?.computed_archetype_key || "" });
  };

  return (
    <div className="min-h-screen flex relative" style={{ background: "#FAF5F3" }}>
      <AppShellV2 active="yourpattern">
        <div className="spp-c">
          <div className="spp in-shell">
            {profile === undefined ? (
              <div className="pad" style={{ paddingTop: 40 }}><div style={{ height: 180, borderRadius: 10, background: "var(--rose-pale)", opacity: 0.6 }} /></div>
            ) : res ? (
              <div className="wrap">
                <div className="dash-top"><span /><span className="avatar-s" aria-hidden="true">{firstName[0]?.toUpperCase()}</span></div>
                <div className="pad narrow">
                  <h1 className="h-m" style={{ fontSize: 28, marginTop: 8 }}>
                    {first ? <>Welcome, {firstName}. <em>Here's your full profile.</em></> : <>Good to see you, {firstName}.</>}
                  </h1>
                </div>
                {res.mix ? (
                  <PatternFull res={res} guess={guess} imgIdx={imgIdx} onRetake={retake} />
                ) : (
                  <PatternFull res={{ ...res, mix: [{ k: primary, pct: 100 }] }} guess={null} imgIdx={imgIdx} onRetake={retake} />
                )}
                <Doors route={route} setRoute={setRoute} doorState={{ applied: applied ? "laura" : null, bought }} onDoor={onDoor} res={res} bpPrice={bpPrice} />
                <FootNote />
              </div>
            ) : (
              <div className="wrap">
                <div className="dash-top"><span /><span className="avatar-s" aria-hidden="true">{firstName[0]?.toUpperCase()}</span></div>
                <section className="pad narrow" style={{ marginTop: 8, paddingBottom: 56 }}>
                  {loadError ? (
                    <p className="body">We couldn't load your profile. Refresh to try again.</p>
                  ) : (
                    <div className="panel" style={{ padding: "28px 20px" }}>
                      <p className="eye">Your starting point</p>
                      <h1 className="h-m" style={{ marginTop: 10 }}>You haven't taken your Starting Point Profile yet.</h1>
                      <div style={{ marginTop: 22 }}><Primary onClick={retake}>Show me my pattern</Primary></div>
                    </div>
                  )}
                </section>
              </div>
            )}
            {sheet && res && (
              <ApplySheet
                user={{ name: firstName === "there" ? "" : firstName, email: me?.email || "" }}
                res={res}
                onClose={() => setSheet(false)}
                onSubmit={submitApplication}
                onSent={() => setApplied(true)}
              />
            )}
          </div>
        </div>
      </AppShellV2>
      <CheckoutModal open={checkoutOpen} onOpenChange={setCheckoutOpen} />
    </div>
  );
}

// Keep PLATFORM_KEY referenced for readers looking for the key map.
export { PLATFORM_KEY };
