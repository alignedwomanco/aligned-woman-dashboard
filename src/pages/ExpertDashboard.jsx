import React, { useState, useCallback, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import { motion } from "framer-motion";
import {
  Copy,
  Check,
  TrendingUp,
  DollarSign,
  Users,
  Link as LinkIcon,
  User,
  BarChart3,
  ExternalLink,
  Loader2,
  Landmark,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const SITE_URL = "https://app.alignedwomanco.com";
const APP_ID = "69f46886a412ee042303f1af";
const CONNECT_FUNCTION_URL = `https://api.base44.com/api/apps/${APP_ID}/functions/createConnectAccount`;

function useExpertData() {
  const { user } = useAuth();
  const userEmail = user?.email?.toLowerCase() || "";

  const { data: experts = [], isLoading: loadingExpert } = useQuery({
    queryKey: ["expert-profile", userEmail],
    queryFn: () => base44.entities.Expert.filter({ linked_user_email: userEmail }),
    enabled: !!userEmail,
  });

  const { data: affiliates = [], isLoading: loadingAffiliate } = useQuery({
    queryKey: ["expert-affiliate", userEmail],
    queryFn: () => base44.entities.Affiliate.filter({ email: userEmail }),
    enabled: !!userEmail,
  });

  const affiliateCode = affiliates[0]?.unique_code || "";
  const { data: sales = [], isLoading: loadingSales } = useQuery({
    queryKey: ["expert-sales", affiliateCode],
    queryFn: () => base44.entities.Sale.filter({ affiliate_code: affiliateCode }),
    enabled: !!affiliateCode,
  });

  return {
    user,
    expert: experts[0] || null,
    affiliate: affiliates[0] || null,
    sales,
    isLoading: loadingExpert || loadingAffiliate || loadingSales,
  };
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "#FFFFFF",
        border: "1px solid rgba(74,14,46,0.06)",
        boxShadow: "0 2px 12px rgba(74,14,46,0.04)",
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: "#FDF5F3" }}
        >
          <Icon style={{ width: 18, height: 18, color: "#C4847A" }} />
        </div>
        <span
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 500,
            fontSize: 12,
            color: "#8A7A76",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: 28,
          color: "#4A0E2E",
          lineHeight: 1,
          marginBottom: 4,
        }}
      >
        {value}
      </div>
      {sub && (
        <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: 12, color: "#8A7A76" }}>
          {sub}
        </span>
      )}
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      const input = document.createElement("input");
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
      style={{
        background: copied ? "#2D6A4F" : "#4A0E2E",
        color: "#FFFFFF",
        fontFamily: "Montserrat, sans-serif",
        fontWeight: 600,
        fontSize: 12,
      }}
    >
      {copied ? (
        <><Check style={{ width: 14, height: 14 }} /> Copied</>
      ) : (
        <><Copy style={{ width: 14, height: 14 }} /> Copy Link</>
      )}
    </button>
  );
}

function AffiliateLinkCard({ affiliate }) {
  const affiliateUrl = `${SITE_URL}/blueprint?aff=${affiliate.unique_code}`;

  return (
    <div
      className="rounded-xl p-6"
      style={{ background: "#FFFFFF", border: "1px solid rgba(74,14,46,0.06)", boxShadow: "0 2px 12px rgba(74,14,46,0.04)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <LinkIcon style={{ width: 16, height: 16, color: "#C4847A" }} />
        <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 13, color: "#4A0E2E" }}>
          Your Affiliate Link
        </span>
      </div>
      <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: 13, color: "#8A7A76", lineHeight: 1.6, marginBottom: 16 }}>
        Share this link with your audience. When someone purchases through your link, you earn a {affiliate.commission_percentage}% commission.
      </p>
      <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "#FAF5F3" }}>
        <input
          readOnly
          value={affiliateUrl}
          className="flex-1 bg-transparent border-none outline-none"
          style={{ fontFamily: "Montserrat, sans-serif", fontSize: 13, color: "#4A0E2E" }}
          onClick={(e) => e.target.select()}
        />
        <CopyButton text={affiliateUrl} />
      </div>
    </div>
  );
}

function BankAccountCard({ affiliate }) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const isActive = affiliate.payout_status === "active";
  const hasStarted = affiliate.stripe_account_id && affiliate.payout_status === "onboarding_started";

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);

    try {
      const response = await fetch(CONNECT_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ affiliate_id: affiliate.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create connect account");
      }

      if (data.already_onboarded) {
        queryClient.invalidateQueries({ queryKey: ["expert-affiliate"] });
        return;
      }

      if (data.onboarding_url) {
        window.location.href = data.onboarding_url;
      }
    } catch (err) {
      setError(err.message);
      setConnecting(false);
    }
  };

  if (isActive) {
    return (
      <div
        className="rounded-xl p-6"
        style={{ background: "#FFFFFF", border: "1px solid rgba(45,106,79,0.15)", boxShadow: "0 2px 12px rgba(74,14,46,0.04)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(45,106,79,0.1)" }}>
            <CheckCircle2 style={{ width: 20, height: 20, color: "#2D6A4F" }} />
          </div>
          <div>
            <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 14, color: "#2D6A4F" }}>
              Bank account connected
            </span>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: 12, color: "#8A7A76", marginTop: 2 }}>
              Commissions are paid out automatically via Stripe.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-6"
      style={{ background: "#FFFFFF", border: "1px solid rgba(74,14,46,0.06)", boxShadow: "0 2px 12px rgba(74,14,46,0.04)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Landmark style={{ width: 16, height: 16, color: "#C4847A" }} />
        <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 13, color: "#4A0E2E" }}>
          {hasStarted ? "Complete your bank setup" : "Connect your bank account"}
        </span>
      </div>
      <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: 13, color: "#8A7A76", lineHeight: 1.6, marginBottom: 16 }}>
        {hasStarted
          ? "Your setup is incomplete. Complete your details to start receiving automatic commission payouts."
          : "Add your banking details so commissions can be paid directly into your account. Powered by Stripe for secure, automatic payouts."}
      </p>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg mb-4" style={{ background: "rgba(192,57,43,0.08)" }}>
          <AlertCircle style={{ width: 14, height: 14, color: "#C0392B" }} />
          <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, color: "#C0392B" }}>{error}</span>
        </div>
      )}

      <button
        onClick={handleConnect}
        disabled={connecting}
        className="flex items-center gap-2 px-5 py-3 rounded-lg transition-all"
        style={{
          background: "#C4847A",
          color: "#0E0208",
          fontFamily: "Montserrat, sans-serif",
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: "0.05em",
          opacity: connecting ? 0.6 : 1,
          cursor: connecting ? "wait" : "pointer",
        }}
      >
        {connecting ? (
          <><Loader2 className="animate-spin" style={{ width: 16, height: 16 }} /> Setting up...</>
        ) : (
          <><Landmark style={{ width: 16, height: 16 }} /> {hasStarted ? "Continue Setup" : "Connect Bank Account"}</>
        )}
      </button>

      <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: 11, color: "#8A7A76", marginTop: 12 }}>
        You will be redirected to Stripe to securely enter your details. Your banking information is never stored on our servers.
      </p>
    </div>
  );
}

function SalesTable({ sales }) {
  if (sales.length === 0) {
    return (
      <div className="text-center py-12" style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: 14, color: "#8A7A76" }}>
        No sales yet. Share your affiliate link to start earning.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(74,14,46,0.08)" }}>
            {["Date", "Amount", "Commission", "Status"].map((h) => (
              <th
                key={h}
                className="text-left px-4 py-3"
                style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8A7A76" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id} style={{ borderBottom: "1px solid rgba(74,14,46,0.04)" }}>
              <td className="px-4 py-3" style={{ fontFamily: "Montserrat, sans-serif", fontSize: 13, color: "#3A2A28" }}>
                {sale.created_date ? new Date(sale.created_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
              </td>
              <td className="px-4 py-3" style={{ fontFamily: "Montserrat, sans-serif", fontSize: 13, color: "#3A2A28" }}>
                {sale.currency || "ZAR"} {(sale.amount || 0).toLocaleString()}
              </td>
              <td className="px-4 py-3" style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 13, color: "#4A0E2E" }}>
                R{(sale.commission_amount || 0).toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <span
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: sale.status === "completed" ? "rgba(45,106,79,0.1)" : "rgba(196,132,122,0.15)",
                    color: sale.status === "completed" ? "#2D6A4F" : "#8A7A76",
                    fontFamily: "Montserrat, sans-serif",
                  }}
                >
                  {sale.status === "completed" ? "Completed" : sale.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProfileTab({ expert }) {
  if (!expert) return null;

  return (
    <div className="space-y-6">
      <div className="rounded-xl p-6" style={{ background: "#FFFFFF", border: "1px solid rgba(74,14,46,0.06)", boxShadow: "0 2px 12px rgba(74,14,46,0.04)" }}>
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-full overflow-hidden shrink-0" style={{ background: "#FDF5F3" }}>
            {expert.profile_picture ? (
              <img src={expert.profile_picture} alt={expert.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 28, color: "#C4847A" }}>
                {expert.name?.[0] || "?"}
              </div>
            )}
          </div>
          <div>
            <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 24, color: "#4A0E2E", marginBottom: 4 }}>
              {expert.name}
            </h2>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500, fontSize: 14, color: "#C4847A", marginBottom: 8 }}>
              {expert.title}
            </p>
            {expert.specialties?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {expert.specialties.map((s, i) => (
                  <span key={i} className="px-3 py-1 rounded-full text-xs" style={{ background: "#FDF5F3", color: "#4A0E2E", fontFamily: "Montserrat, sans-serif", fontWeight: 500 }}>
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        {expert.bio && (
          <p className="mt-5" style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: 14, color: "#3A2A28", lineHeight: 1.7 }}>
            {expert.bio}
          </p>
        )}
      </div>

      <div className="rounded-xl p-5 flex items-center justify-between" style={{ background: "#FDF5F3", border: "1px solid rgba(74,14,46,0.06)" }}>
        <div>
          <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 13, color: "#4A0E2E" }}>Your public profile</span>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: 12, color: "#8A7A76", marginTop: 2 }}>
            This is how you appear on the Blueprint sales page and Experts directory. Contact the admin team to update your profile.
          </p>
        </div>
        <a href="/Experts" className="flex items-center gap-1.5 px-4 py-2 rounded-lg" style={{ background: "#FFFFFF", border: "1px solid rgba(74,14,46,0.1)", fontFamily: "Montserrat, sans-serif", fontWeight: 500, fontSize: 12, color: "#4A0E2E", textDecoration: "none" }}>
          View <ExternalLink style={{ width: 12, height: 12 }} />
        </a>
      </div>
    </div>
  );
}

export default function ExpertDashboard() {
  const { user, expert, affiliate, sales, isLoading } = useExpertData();
  const [activeTab, setActiveTab] = useState("earnings");
  const queryClient = useQueryClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("connect") === "complete" || params.get("connect") === "refresh") {
      queryClient.invalidateQueries({ queryKey: ["expert-affiliate"] });
      window.history.replaceState({}, "", "/expert-dashboard");
    }
  }, [queryClient]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin" style={{ width: 32, height: 32, color: "#C4847A" }} />
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4" style={{ background: "#FAF5F3" }}>
        <User style={{ width: 48, height: 48, color: "#C4847A", marginBottom: 16 }} />
        <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 24, color: "#4A0E2E", marginBottom: 8 }}>
          Expert profile not found
        </h2>
        <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: 14, color: "#8A7A76", maxWidth: 400 }}>
          Your account is not linked to an expert profile yet. Please contact the admin team at hello@alignedwomanco.com to set up your expert account.
        </p>
      </div>
    );
  }

  const totalSales = affiliate?.total_sales || 0;
  const totalCommission = affiliate?.total_commission || 0;
  const commissionRate = affiliate?.commission_percentage || 0;

  const tabs = [
    { id: "earnings", label: "Earnings", icon: BarChart3 },
    { id: "profile", label: "My Profile", icon: User },
  ];

  return (
    <div style={{ background: "#FAF5F3", minHeight: "100vh" }}>
      <div className="mx-auto" style={{ maxWidth: 960, padding: "40px 24px 80px" }}>
        <div className="mb-8">
          <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "#C4847A", marginBottom: 8 }}>
            EXPERT DASHBOARD
          </p>
          <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(24px, 4vw, 32px)", color: "#4A0E2E", marginBottom: 4 }}>
            Welcome back, {expert.name?.split(" ")[0] || "Expert"}
          </h1>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: 14, color: "#8A7A76" }}>
            Manage your profile and track your affiliate earnings.
          </p>
        </div>

        <div className="flex gap-1 p-1 rounded-xl mb-8" style={{ background: "#FFFFFF", display: "inline-flex" }}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all"
              style={{
                background: activeTab === id ? "#4A0E2E" : "transparent",
                color: activeTab === id ? "#FFFFFF" : "#8A7A76",
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              <Icon style={{ width: 15, height: 15 }} />
              {label}
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "earnings" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon={Users} label="Total Sales" value={totalSales} sub="purchases through your link" />
                <StatCard icon={DollarSign} label="Total Earned" value={`R${totalCommission.toLocaleString()}`} sub={`at ${commissionRate}% commission`} />
                <StatCard icon={TrendingUp} label="Commission Rate" value={`${commissionRate}%`} sub="per sale" />
              </div>

              {affiliate && <BankAccountCard affiliate={affiliate} />}

              {affiliate ? (
                <AffiliateLinkCard affiliate={affiliate} />
              ) : (
                <div className="rounded-xl p-6 text-center" style={{ background: "#FFFFFF", border: "1px solid rgba(74,14,46,0.06)" }}>
                  <LinkIcon style={{ width: 32, height: 32, color: "#C4847A", margin: "0 auto 12px" }} />
                  <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500, fontSize: 14, color: "#4A0E2E", marginBottom: 4 }}>
                    Affiliate link not set up yet
                  </p>
                  <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: 13, color: "#8A7A76" }}>
                    Contact the admin team to activate your affiliate link.
                  </p>
                </div>
              )}

              <div className="rounded-xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid rgba(74,14,46,0.06)", boxShadow: "0 2px 12px rgba(74,14,46,0.04)" }}>
                <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(74,14,46,0.06)" }}>
                  <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 14, color: "#4A0E2E" }}>Sales History</span>
                </div>
                <SalesTable sales={sales} />
              </div>
            </div>
          )}

          {activeTab === "profile" && <ProfileTab expert={expert} />}
        </motion.div>
      </div>
    </div>
  );
}