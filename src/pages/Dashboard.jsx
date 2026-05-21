import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { getDashboardState } from "@/lib/dashboardState";
import useContinueModule from "@/hooks/useContinueModule";
import DashboardSidebar from "@/components/dashboard-v2/DashboardSidebar";
import MobileTabBar from "@/components/dashboard-v2/MobileTabBar";
import DashboardHeader from "@/components/dashboard-v2/DashboardHeader";
import CommunityCard from "@/components/dashboard-v2/CommunityCard";
import ExpertSpotlight from "@/components/dashboard-v2/ExpertSpotlight";
import AccountStatusFooter from "@/components/dashboard-v2/AccountStatusFooter";
import StateB from "@/components/dashboard-v2/states/StateB";
import StateANoQuiz from "@/components/dashboard-v2/states/StateANoQuiz";
import StateAWithQuiz from "@/components/dashboard-v2/states/StateAWithQuiz";
import StateC from "@/components/dashboard-v2/states/StateC";

const BLUEPRINT_COURSE_ID = "69f4885c4fadbeea6d28a9be";

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

function DashboardError({ message, onRetry }) {
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
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-awburg-core hover:bg-awburg-dark text-paper text-xs font-bold tracking-eyebrow uppercase py-3 px-6 rounded-full transition-colors"
        >
          REFRESH
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [status, setStatus] = useState("loading");
  const [data, setData] = useState({ state: null, user: null, profile: null });
  const [errorMsg, setErrorMsg] = useState("");

  const load = async () => {
    setStatus("loading");
    setErrorMsg("");
    try {
      const result = await getDashboardState();
      setData(result);
      setStatus("ready");
    } catch (err) {
      setErrorMsg(err?.message || "Unknown error");
      setStatus("error");
    }
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
    queryFn: () => base44.entities.WorkbookResponse.filter({}),
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

  if (status === "error") {
    return (
      <div className="min-h-screen bg-off-white">
        <DashboardSidebar />
        <MobileTabBar />
        <div className="lg:pl-60 pb-20 lg:pb-0">
          <main className="px-6 md:px-10 py-10 max-w-[1400px]">
            <DashboardError message={errorMsg} onRetry={load} />
          </main>
        </div>
      </div>
    );
  }

  const { state, user, profile } = data;
  const joinedDate = formatJoinedDate(profile?.signup_timestamp);
  const membershipLabel = getMembershipLabel(user);
  const isBlueprintOwner = membershipLabel === "Blueprint owner";

  let StateComponent = null;
  if (state === "state_b") StateComponent = StateB;
  else if (state === "state_a_no_quiz") StateComponent = StateANoQuiz;
  else if (state === "state_a_with_quiz") StateComponent = StateAWithQuiz;
  else if (state === "state_c") StateComponent = StateC;

  return (
    <div className="min-h-screen bg-off-white">
      <DashboardSidebar
        memberSince={joinedDate.toUpperCase()}
        isBlueprintOwner={isBlueprintOwner}
      />
      <MobileTabBar />

      <div className="lg:pl-60 pb-20 lg:pb-0">
        <main className="px-6 md:px-10 py-10 max-w-[1400px]">
          <DashboardHeader firstName={profile?.first_name} user={user} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <section className="lg:col-span-8 order-1">
              {StateComponent ? (
                <StateComponent
                  user={user}
                  profile={profile}
                  workbookData={workbookData}
                  continueData={continueData}
                />
              ) : (
                <DashboardError
                  message={`Unrecognised dashboard state: ${state}`}
                  onRetry={load}
                />
              )}
            </section>

            <aside className="lg:col-span-4 order-2 flex flex-col gap-4">
              <CommunityCard />
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
    </div>
  );
}