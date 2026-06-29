import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { enablePreviewMode, disablePreviewMode, isPreviewMode } from "@/lib/previewMode";
import { useQuery } from "@tanstack/react-query";
import { getDashboardState } from "@/lib/dashboardState";
import { ensureMemberProfile } from "@/lib/ensureMemberProfile";
import { MEMBER_READ_LIMIT } from "@/lib/limits";
import useContinueModule from "@/hooks/useContinueModule";
import DashboardSidebar from "@/components/dashboard-v2/DashboardSidebar";
import MobileTabBar from "@/components/dashboard-v2/MobileTabBar";
import DashboardHeader from "@/components/dashboard-v2/DashboardHeader";
import ExpertSpotlight from "@/components/dashboard-v2/ExpertSpotlight";
import AccountStatusFooter from "@/components/dashboard-v2/AccountStatusFooter";
import StateB from "@/components/dashboard-v2/states/StateB";
import StateANoQuiz from "@/components/dashboard-v2/states/StateANoQuiz";
import StateAWithQuiz from "@/components/dashboard-v2/states/StateAWithQuiz";
import StateC from "@/components/dashboard-v2/states/StateC";
import StateCNoQuiz from "@/components/dashboard-v2/states/StateCNoQuiz";
import CheckoutModal from "@/components/dashboard/CheckoutModal";

const BLUEPRINT_COURSE_ID = "69f4885c4fadbeea6d28a9be";

function AdminPreviewPanel({ stateOverride, setStateOverride, enablePreviewMode, disablePreviewMode }) {
  const [minimized, setMinimized] = useState(false);

  return (
    <div className="fixed bottom-24 left-4 right-4 lg:bottom-6 lg:left-auto lg:right-6 lg:max-w-xs z-50 bg-gray-900 text-white text-xs rounded-lg shadow-lg overflow-hidden">
      {/* Header - always visible */}
      <div className="flex items-center justify-between px-4 py-3 cursor-pointer select-none" onClick={() => setMinimized(m => !m)}>
        <p className="font-semibold text-gray-300">ADMIN: Preview State</p>
        <span className="text-gray-400 text-base leading-none">{minimized ? "▲" : "▼"}</span>
      </div>

      {/* Body - hidden when minimized */}
      {!minimized && (
        <div className="px-4 pb-4">
          <a
            href={`/CourseDetail?courseId=69f4885c4fadbeea6d28a9be&preview=new_user`}
            className="block w-full text-center px-3 py-2 rounded mb-3 bg-amber-700 text-white text-xs font-bold hover:bg-amber-600 transition-colors min-h-[44px] flex items-center justify-center"
            style={{ textDecoration: "none" }}
          >
            → View Course as New User
          </a>
          <div className="space-y-2">
            {[
              { label: "New paid user (blank)", value: "new_paid_user", preview: true },
              { label: "A (no quiz)", value: "state_a_no_quiz" },
              { label: "A (with quiz)", value: "state_a_with_quiz" },
              { label: "B (welcome)", value: "state_b" },
              { label: "C (free)", value: "state_c" },
              { label: "Real", value: null },
            ].map(({ label, value, preview }) => (
              <button
                key={label}
                onClick={() => { preview ? enablePreviewMode() : disablePreviewMode(); setStateOverride(value); }}
                className={`w-full text-left px-3 py-2 rounded transition-colors min-h-[44px] ${
                  stateOverride === value
                    ? value === "new_paid_user" ? "bg-amber-600 text-white" : "bg-awburg-core text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatJoinedDate(timestamp) {
  if (!timestamp) return "";
  const d = new Date(timestamp);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function getMembershipLabel(user) {
  const tags = Array.isArray(user?.access_tags) ? user.access_tags : [];
  const isPaid = user?.membership_type === "paid" || tags.includes("blueprint_paid");
  return isPaid ? "Blueprint owner" : "Free member";
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-12 w-2/3 bg-awburg-core/8 rounded" />
      <div className="h-64 bg-awburg-core/8 rounded-xl" />
      <div className="h-40 bg-awburg-core/8 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-awburg-core/8 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-44 bg-awburg-core/8 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function DashboardError({ message, onRetry, onLogout }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-paper rounded-xl border border-awburg-core/8 p-8 max-w-md text-center">
        <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-3">
          SOMETHING WENT WRONG
        </p>
        <h2 className="font-display text-awburg-core text-2xl leading-tight mb-3">
          We could not load your dashboard.
        </h2>
        <p className="font-body font-light text-awburg-core/75 text-sm leading-relaxed mb-6">
          {message || "Please try again, or sign out and back in."}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 bg-awburg-core hover:bg-awburg-dark text-paper text-xs font-bold tracking-eyebrow uppercase py-3 px-6 rounded-full transition-colors"
          >
            REFRESH
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 border border-awburg-core/30 text-awburg-core hover:bg-awburg-core/5 text-xs font-bold tracking-eyebrow uppercase py-3 px-6 rounded-full transition-colors"
            >
              LOG OUT
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [status, setStatus] = useState("loading");
  const [data, setData] = useState({ state: null, user: null, profile: null });
  const [errorMsg, setErrorMsg] = useState("");
  const [stateOverride, setStateOverride] = useState(() => isPreviewMode() ? "new_paid_user" : null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);

  // A member arriving from an emailed link may not be signed in yet.
  // Send them to Base44's own sign-in, then return them here.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (!authed && active) {
          base44.auth.redirectToLogin(window.location.href);
        }
      } catch (e) {
        // If the check fails, leave the page to render its normal state.
      }
    })();
    return () => { active = false; };
  }, []);

  // Process pending quiz result from localStorage (set by StartingPointProfile after quiz completion)
  useEffect(() => {
    const processPendingQuiz = async () => {
      const raw = localStorage.getItem("aw_quiz_result");
      if (!raw) return;

      try {
        // Check auth first - if not logged in, leave localStorage and bail
        const authed = await base44.auth.isAuthenticated();
        if (!authed) return;

        const quizResult = JSON.parse(raw);
        const me = await base44.auth.me();
        if (!me) return;

        let profiles = [];
        try {
          profiles = await base44.entities.MemberProfile.filter({ user_id: me.id });
        } catch (_) {
          profiles = await base44.entities.MemberProfile.list();
        }

        const profile = profiles.length > 0
          ? profiles[0]
          : await ensureMemberProfile(me);
        if (profile?.id) {
          await base44.entities.MemberProfile.update(profile.id, {
            computed_archetype_key: quizResult.archetype_key,
            quiz_completed_at: quizResult.completed_at,
            has_seen_welcome: true,
          });
        }

        localStorage.removeItem("aw_quiz_result");
        window.location.reload();
      } catch (err) {
        console.error("Failed to process quiz result:", err);
        // Only act if this was a data error, not an auth error. Clear the bad
        // result so the reload cannot loop, then reload so load() resolves to a
        // real state instead of sitting on the loading skeleton (which load()
        // shows while a quiz result is pending).
        const authed = await base44.auth.isAuthenticated().catch(() => false);
        if (authed) {
          localStorage.removeItem("aw_quiz_result");
          window.location.reload();
        }
      }
    };

    processPendingQuiz();
  }, []);

  // Check if user is admin on mount
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await base44.auth.me();
        const isAdminUser = user?.role && ['owner', 'admin', 'master_admin'].includes(user.role);
        setIsAdmin(isAdminUser);
      } catch (err) {
        console.error("Failed to check admin status:", err);
        setIsAdmin(false);
      }
      setAdminCheckComplete(true);
    };
    checkAdmin();
  }, []);

  const load = async () => {
    setStatus("loading");
    setErrorMsg("");

    // A free member who just finished the quiz arrives with a pending result in
    // localStorage. processPendingQuiz owns that first pass: it creates the
    // MemberProfile, writes the archetype, then reloads. Defer to it so load()
    // does not race ahead into the not-registered wall. On the reload the result
    // is cleared and the profile is in place, so load() resolves to state_c.
    if (localStorage.getItem("aw_quiz_result")) {
      return; // stay on the loading skeleton; processPendingQuiz finishes and reloads
    }

    try {
      const result = await getDashboardState();
      setData(result);
      setStatus("ready");
      return;
    } catch (err) {
      const msg = err?.message || "Unknown error";

      // Anything other than a missing profile: show the generic error card.
      if (!msg.toLowerCase().includes("no memberprofile")) {
        setErrorMsg(msg);
        setStatus("error");
        return;
      }

      // No MemberProfile yet. Branch on whether this account is entitled.
      try {
        let me = await base44.auth.me();
        let tags = Array.isArray(me?.access_tags) ? me.access_tags : [];
        let isPaid =
          me?.membership_type === "paid" ||
          tags.includes("blueprint_paid") ||
          ["admin", "owner", "master_admin"].includes(me?.role);

        // First-login race: a pre-approved member may not have been granted
        // access yet, because claimPreApproval is still running in the
        // background. Before showing the not-registered screen, run the claim
        // here, wait for it, and re-read the account. Only treat them as not
        // registered if they still have no access after the claim has run.
        if (!isPaid) {
          try {
            await base44.functions.invoke("claimPreApproval", {});
          } catch (_) {
            // Nothing to claim, or the claim failed. Fall through to re-check.
          }

          // Checkout backstop: a buyer who paid then created their account may
          // land here instead of returning to the success page. If we are
          // holding their Stripe session, claim it now so the Blueprint
          // unlocks wherever they land. verifyCheckoutSession is idempotent and
          // grants to the signed-in account.
          try {
            const pendingSession = localStorage.getItem("aw_pending_checkout_session");
            if (pendingSession) {
              await base44.functions.invoke("verifyCheckoutSession", { session_id: pendingSession });
              localStorage.removeItem("aw_pending_checkout_session");
            }
          } catch (_) {
            // Nothing to claim, or a transient failure. Leave the key so a later
            // load can retry, and fall through to re-check.
          }

          try {
            me = await base44.auth.me();
          } catch (_) {
            // Keep the earlier value if the refetch fails.
          }
          tags = Array.isArray(me?.access_tags) ? me.access_tags : [];
          isPaid =
            me?.membership_type === "paid" ||
            tags.includes("blueprint_paid") ||
            ["admin", "owner", "master_admin"].includes(me?.role);
        }

        if (!isPaid) {
          // Logged in with no Blueprint access: a free member, for example one
          // arriving through the Your Money Story funnel. Give them a free profile
          // and resolve to the free home instead of the not-registered wall. The
          // wrong-email buyer path now lives as a quiet link on the free home.
          await ensureMemberProfile(me);
          const result = await getDashboardState();
          setData(result);
          setStatus("ready");
          return;
        }

        // Entitled but no profile yet (pre-approval just claimed, or added
        // manually): create one, then retry.
        await ensureMemberProfile(me);
        const result = await getDashboardState();
        setData(result);
        setStatus("ready");
      } catch (e2) {
        setErrorMsg(e2?.message || msg);
        setStatus("error");
      }
    }
  };

  const handleLogout = () => {
    // Log out, then land back on the dashboard, which prompts a fresh sign-in.
    base44.auth.logout(`${window.location.origin}/Dashboard`);
  };

  useEffect(() => {
    load();
  }, []);

  // Real course progress data from useContinueModule
  const continueData = useContinueModule(data.user);

  // Workbook queries at Dashboard level so ALL states can use them
  const { data: workbooks = [] } = useQuery({
    queryKey: ["dashboard-workbooks"],
    queryFn: () => base44.entities.Workbook.filter({ course_id: BLUEPRINT_COURSE_ID, status: "published" }),
    initialData: [],
  });

  const { data: workbookResponses = [] } = useQuery({
    queryKey: ["dashboard-workbook-responses"],
    queryFn: () => base44.entities.WorkbookResponse.filter({}, "-updated_date", MEMBER_READ_LIMIT),
    initialData: [],
  });

  const { data: allExperts = [] } = useQuery({
    queryKey: ["dashboard-experts"],
    queryFn: () => base44.entities.Expert.filter({}),
    initialData: [],
  });

  // Build workbook data with real completion status
  const workbookData = workbooks.map(wb => {
    const response = workbookResponses.find(r => r.workbook_id === wb.id);
    const expert = wb.expert_id ? allExperts.find(e => e.id === wb.expert_id) : null;

    let wbStatus = "not_started";
    if (response?.is_complete) {
      wbStatus = "completed";
    } else if (response) {
      const hasAnswers = response.answers && Object.keys(response.answers).length > 0;
      wbStatus = hasAnswers ? "in_progress" : "not_started";
    }

    return {
      id: wb.id,
      title: wb.title,
      expert: expert?.name || "",
      status: wbStatus,
    };
  });

  // Side effect: flip has_seen_welcome when state_b renders
  useEffect(() => {
    if (status !== "ready") return;
    if (data.state !== "state_b") return;
    if (!data.profile?.id) return;

    base44.entities.MemberProfile
      .update(data.profile.id, { has_seen_welcome: true })
      .catch((err) => {
        console.error("[Dashboard] Failed to flip has_seen_welcome:", err);
      });
  }, [status, data.state, data.profile?.id]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-off-white">
        <DashboardSidebar />
        <MobileTabBar />
        <div className="lg:pl-60 pb-20 lg:pb-0">
          <main className="px-6 md:px-10 py-10 max-w-[1400px]">
            <div className="mb-10">
              <div className="h-3 w-32 bg-awburg-core/8 rounded mb-4 animate-pulse" />
              <div className="h-12 w-2/3 bg-awburg-core/8 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <section className="lg:col-span-8">
                <DashboardSkeleton />
              </section>
              <aside className="lg:col-span-4 space-y-4">
                <div className="h-60 bg-awburg-core/8 rounded-xl animate-pulse" />
                <div className="h-72 bg-awburg-core/8 rounded-xl animate-pulse" />
              </aside>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (status === "not_registered") {
    return (
      <div className="min-h-screen bg-off-white">
        <DashboardSidebar />
        <MobileTabBar />
        <div className="lg:pl-60 pb-20 lg:pb-0">
          <main className="px-6 md:px-10 py-10 max-w-[1400px]">
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="bg-paper rounded-xl border border-awburg-core/8 p-8 max-w-md text-center">
                <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-3">
                  WELCOME
                </p>
                <h2 className="font-display text-awburg-core text-2xl leading-tight mb-3">
                  Oops! You don't seem to be registered for this course.
                </h2>
                <p className="font-body font-light text-awburg-core/75 text-sm leading-relaxed mb-6">
                  If you have paid for this course, you may have tried to enter on another email address. Log out and sign in with the email you used when you joined.
                </p>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 bg-awburg-core hover:bg-awburg-dark text-paper text-xs font-bold tracking-eyebrow uppercase py-3 px-6 rounded-full transition-colors"
                >
                  LOG OUT AND TRY ANOTHER EMAIL
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (status === "error") {
    if (errorMsg && typeof errorMsg === "string" && errorMsg.toLowerCase().includes("auth")) {
      window.location.href = "/";
      return null;
    }
    return (
      <div className="min-h-screen bg-off-white">
        <DashboardSidebar />
        <MobileTabBar />
        <div className="lg:pl-60 pb-20 lg:pb-0">
          <main className="px-6 md:px-10 py-10 max-w-[1400px]">
            <DashboardError message={errorMsg} onRetry={load} onLogout={handleLogout} />
          </main>
        </div>
      </div>
    );
  }

  const { state, user, profile } = data;
  const joinedDate = formatJoinedDate(profile?.signup_timestamp);
  const membershipLabel = getMembershipLabel(user);
  const isBlueprintOwner = membershipLabel === "Blueprint owner";

  // Use override state if set, otherwise use real state
  const effectiveState = stateOverride || state;

  const isNewPaidUserPreview = effectiveState === "new_paid_user";

  let StateComponent = null;
  if (effectiveState === "state_b") StateComponent = StateB;
  else if (effectiveState === "state_a_no_quiz" || isNewPaidUserPreview) StateComponent = StateANoQuiz;
  else if (effectiveState === "state_a_with_quiz") StateComponent = StateAWithQuiz;
  else if (effectiveState === "state_c") StateComponent = StateC;
  else if (effectiveState === "state_c_no_quiz") StateComponent = StateCNoQuiz;

  return (
    <div className="min-h-screen bg-off-white">
      <DashboardSidebar
        memberSince={joinedDate.toUpperCase()}
        isBlueprintOwner={isBlueprintOwner}
      />
      <MobileTabBar />

      <div className="lg:pl-60 pb-20 lg:pb-0">
        <main className="px-6 md:px-10 py-10 max-w-[1400px]">
          {/* Preview banner when override is active */}
          {stateOverride && isAdmin && (
            <div className="mb-6 bg-amber-100 border border-amber-300 rounded-lg px-4 py-3 text-center">
              <span className="text-amber-900 text-sm font-semibold">
                PREVIEWING: {stateOverride.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>
          )}

          <DashboardHeader firstName={profile?.first_name} user={user} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <section className="lg:col-span-8 order-1">
              {StateComponent ? (
                <StateComponent
                  user={user}
                  profile={profile}
                  workbookData={isNewPaidUserPreview ? [] : workbookData}
                  continueData={isNewPaidUserPreview ? null : continueData}
                  onCheckout={() => setCheckoutOpen(true)}
                />
              ) : (
                <DashboardError
                  message={`Unrecognised dashboard state: ${state}`}
                  onRetry={load}
                  onLogout={handleLogout}
                />
              )}
            </section>

            <aside className="lg:col-span-4 order-2 flex flex-col gap-4">
              <ExpertSpotlight />
              <div className="pt-2">
                <AccountStatusFooter
                  joinedDate={joinedDate}
                  membershipLabel={membershipLabel}
                />
              </div>
            </aside>
          </div>
        </main>
      </div>

      <CheckoutModal open={checkoutOpen} onOpenChange={setCheckoutOpen} />

      {/* Admin state preview toggle - fixed position bottom-right */}
      {isAdmin && adminCheckComplete && (
        <AdminPreviewPanel
          stateOverride={stateOverride}
          setStateOverride={setStateOverride}
          enablePreviewMode={enablePreviewMode}
          disablePreviewMode={disablePreviewMode}
        />
      )}
    </div>
  );
}