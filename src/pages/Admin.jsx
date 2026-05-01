import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";

export default function Admin() {
  useEffect(() => {
    base44.auth.me().then((u) => {
      if (!u || !["admin", "owner", "master_admin"].includes(u.role)) {
        window.location.href = "/";
      }
    }).catch(() => { window.location.href = "/"; });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Admin Panel</h1>
        <p className="text-gray-500 mb-6">The admin panel has been updated. Please use Dashboard Settings.</p>
        <Link
          to="/dashboardsettings"
          className="px-6 py-3 bg-[#6E1D40] text-white rounded-lg hover:bg-[#5A1633] transition-colors"
        >
          Go to Dashboard Settings
        </Link>
      </div>
    </div>
  );
}