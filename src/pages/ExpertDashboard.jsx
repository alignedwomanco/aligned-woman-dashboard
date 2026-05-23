import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export default function ExpertDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => null);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF5F3] p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-display text-[#4A0E2E] mb-2">Expert Dashboard</h1>
        <p className="text-[#8A7A76] font-body">Welcome back{user?.full_name ? `, ${user.full_name}` : ""}.</p>
      </div>
    </div>
  );
}