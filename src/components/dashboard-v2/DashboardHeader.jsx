import React from "react";
import DateLabel from "@/components/dashboard-v2/DateLabel";
import TopBar from "@/components/dashboard-v2/TopBar";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function DashboardHeader({ firstName, user }) {
  const safeName = firstName && firstName.trim() ? firstName : "there";
  const greeting = getGreeting();

  return (
    <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10">
      <div className="flex-1 min-w-0">
        <DateLabel />
        <h1 className="font-display text-awburg-core text-[34px] md:text-[48px] leading-tight mt-3">
          {greeting}, <span className="italic text-awrose-core">{safeName}</span>.
        </h1>
        <p className="font-body font-light text-awburg-core/70 mt-2">
          Hope you feel centered today.
        </p>
      </div>

      <div className="flex-shrink-0">
        <TopBar user={user} hasUnreadNotifications={false} />
      </div>
    </header>
  );
}