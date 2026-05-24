import React, { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
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
  X,
  Edit,
  Save,
  Upload,
  Trash2,
  Plus,
  Mail,
  MessageSquare,
  Eye,
  Linkedin,
  Instagram,
  Globe,
  Twitter,
  ChevronDown,
} from "lucide-react";

const SITE_URL = "https://app.alignedwomanco.com";

function useExpertData() {
  const { user } = useAuth();
  const userEmail = user?.email?.toLowerCase() || "";
  const isAdminRole = user?.role === "admin" || user?.role === "owner";

  // Check for ?expert_id= param (admin mode)
  const params = new URLSearchParams(window.location.search);
  const adminExpertId = isAdminRole ? (params.get("expert_id") || "") : "";

  const { data: expertById = null, isLoading: loadingById } = useQuery({
    queryKey: ["expert-by-id", adminExpertId],
    queryFn: async () => {
      const results = await base44.entities.Expert.filter({ id: adminExpertId });
      return results[0] || null;
    },
    enabled: !!adminExpertId,
  });

  const { data: experts = [], isLoading: loadingExpert } = useQuery({
    queryKey: ["expert-profile", userEmail],
    queryFn: () => base44.entities.Expert.filter({ linked_user_email: userEmail }),
    enabled: !!userEmail && !adminExpertId,
  });

  const expert = adminExpertId ? expertById : (experts[0] || null);

  const { data: affiliates = [], isLoading: loadingAffiliate } = useQuery({
    queryKey: ["expert-affiliate", expert?.linked_user_email || userEmail],
    queryFn: () => base44.entities.Affiliate.filter({ email: expert?.linked_user_email || userEmail }),
    enabled: !!expert,
  });

  const affiliateCode = affiliates[0]?.unique_code || "";
  const { data: sales = [], isLoading: loadingSales } = useQuery({
    queryKey: ["expert-sales", affiliateCode],
    queryFn: () => base44.entities.Sale.filter({ affiliate_code: affiliateCode }),
    enabled: !!affiliateCode,
  });

  return {
    user,
    userEmail,
    expert,
    affiliate: affiliates[0] || null,
    sales,
    isAdminMode: !!adminExpertId,
    isLoading: (adminExpertId ? loadingById : loadingExpert) || loadingAffiliate || loadingSales,
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

function BankDetailsCard({ affiliate }) {
  const [formData, setFormData] = useState({
    bank_name: "",
    account_holder_name: "",
    account_number: "",
    branch_code: "",
    account_type: "Cheque",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await base44.entities.Affiliate.update(affiliate.id, {
        bank_name: formData.bank_name,
        account_holder_name: formData.account_holder_name,
        account_number: formData.account_number,
        branch_code: formData.branch_code,
        account_type: formData.account_type,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="rounded-xl p-6"
      style={{ background: "#FFFFFF", border: "1px solid rgba(74,14,46,0.06)", boxShadow: "0 2px 12px rgba(74,14,46,0.04)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Landmark style={{ width: 16, height: 16, color: "#C4847A" }} />
        <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 13, color: "#4A0E2E" }}>
          Bank Details
        </span>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-3 rounded-lg mb-4" style={{ background: "rgba(45,106,79,0.08)" }}>
          <CheckCircle2 style={{ width: 14, height: 14, color: "#2D6A4F" }} />
          <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, color: "#2D6A4F" }}>Bank details saved successfully</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg mb-4" style={{ background: "rgba(192,57,43,0.08)" }}>
          <AlertCircle style={{ width: 14, height: 14, color: "#C0392B" }} />
          <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, color: "#C0392B" }}>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500, fontSize: 12, color: "#4A0E2E", display: "block", marginBottom: 6 }}>
            Bank Name
          </label>
          <input
            type="text"
            value={formData.bank_name}
            onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
            required
            className="w-full px-3 py-2 rounded-lg border outline-none"
            style={{ fontFamily: "Montserrat, sans-serif", fontSize: 13, color: "#3A2A28", borderColor: "rgba(74,14,46,0.15)", focusBorderColor: "#C4847A" }}
            placeholder="e.g. FNB, Standard Bank"
          />
        </div>

        <div>
          <label style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500, fontSize: 12, color: "#4A0E2E", display: "block", marginBottom: 6 }}>
            Account Holder Name
          </label>
          <input
            type="text"
            value={formData.account_holder_name}
            onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
            required
            className="w-full px-3 py-2 rounded-lg border outline-none"
            style={{ fontFamily: "Montserrat, sans-serif", fontSize: 13, color: "#3A2A28", borderColor: "rgba(74,14,46,0.15)" }}
            placeholder="Full name as on account"
          />
        </div>

        <div>
          <label style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500, fontSize: 12, color: "#4A0E2E", display: "block", marginBottom: 6 }}>
            Account Number
          </label>
          <input
            type="text"
            value={formData.account_number}
            onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
            required
            className="w-full px-3 py-2 rounded-lg border outline-none"
            style={{ fontFamily: "Montserrat, sans-serif", fontSize: 13, color: "#3A2A28", borderColor: "rgba(74,14,46,0.15)" }}
            placeholder="Your account number"
          />
        </div>

        <div>
          <label style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500, fontSize: 12, color: "#4A0E2E", display: "block", marginBottom: 6 }}>
            Branch Code
          </label>
          <input
            type="text"
            value={formData.branch_code}
            onChange={(e) => setFormData({ ...formData, branch_code: e.target.value })}
            required
            className="w-full px-3 py-2 rounded-lg border outline-none"
            style={{ fontFamily: "Montserrat, sans-serif", fontSize: 13, color: "#3A2A28", borderColor: "rgba(74,14,46,0.15)" }}
            placeholder="6-digit branch code"
          />
        </div>

        <div>
          <label style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500, fontSize: 12, color: "#4A0E2E", display: "block", marginBottom: 6 }}>
            Account Type
          </label>
          <select
            value={formData.account_type}
            onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border outline-none"
            style={{ fontFamily: "Montserrat, sans-serif", fontSize: 13, color: "#3A2A28", borderColor: "rgba(74,14,46,0.15)" }}
          >
            <option value="Cheque">Cheque</option>
            <option value="Savings">Savings</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-3 rounded-lg transition-all"
          style={{
            background: "#C4847A",
            color: "#0E0208",
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "0.05em",
            opacity: saving ? 0.6 : 1,
            cursor: saving ? "wait" : "pointer",
          }}
        >
          {saving ? (
            <><Loader2 className="animate-spin" style={{ width: 16, height: 16 }} /> Saving...</>
          ) : (
            <>Save Bank Details</>
          )}
        </button>
      </form>
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

function ContactRequestsTab({ expert }) {
  const { data: contactSubmissions = [], isLoading } = useQuery({
    queryKey: ["expert-contact-requests", expert?.id],
    queryFn: () => base44.entities.ContactSubmission.filter({ recipient_email: expert?.linked_user_email }),
    enabled: !!expert?.linked_user_email,
  });

  const sortedSubmissions = [...contactSubmissions].sort((a, b) => {
    const dateA = new Date(a.created_date || 0);
    const dateB = new Date(b.created_date || 0);
    return dateB - dateA;
  });

  const unreadCount = contactSubmissions.filter((s) => s.status === "new").length;

  const handleMarkAsRead = async (id) => {
    await base44.entities.ContactSubmission.update(id, { status: "reviewed" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin" style={{ width: 24, height: 24, color: "#C4847A" }} />
      </div>
    );
  }

  if (sortedSubmissions.length === 0) {
    return (
      <div className="rounded-xl p-12 text-center" style={{ background: "#FFFFFF", border: "1px solid rgba(74,14,46,0.06)" }}>
        <MessageSquare style={{ width: 48, height: 48, color: "#C4847A", margin: "0 auto 16px" }} />
        <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500, fontSize: 14, color: "#4A0E2E", marginBottom: 4 }}>
          No contact requests yet
        </p>
        <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: 13, color: "#8A7A76" }}>
          When someone contacts you, their message will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedSubmissions.map((submission) => (
        <div
          key={submission.id}
          className="rounded-xl p-5 transition-all cursor-pointer"
          style={{
            background: "#FFFFFF",
            border: submission.status === "new" ? "1px solid #C4847A" : "1px solid rgba(74,14,46,0.06)",
            boxShadow: "0 2px 12px rgba(74,14,46,0.04)",
          }}
          onClick={() => handleMarkAsRead(submission.id)}
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 14, color: "#4A0E2E" }}>
                  {submission.first_name} {submission.last_name}
                </span>
                {submission.status === "new" && (
                  <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "#C4847A", color: "#FFFFFF", fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 10 }}>
                    NEW
                  </span>
                )}
              </div>
              <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: 12, color: "#8A7A76" }}>
                {submission.email}
              </p>
            </div>
            <div className="text-right">
              <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: 11, color: "#8A7A76" }}>
                {submission.created_date ? new Date(submission.created_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
              </p>
              {submission.status !== "new" && (
                <span className="inline-flex items-center gap-1 text-xs" style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500, fontSize: 10, color: "#8A7A76" }}>
                  <Eye style={{ width: 10, height: 10 }} />
                  {submission.status}
                </span>
              )}
            </div>
          </div>
          <p className="line-clamp-2" style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: 13, color: "#3A2A28", lineHeight: 1.6 }}>
            {submission.message || "No message"}
          </p>
        </div>
      ))}
    </div>
  );
}

// TikTok SVG icon (not in lucide-react)
function TikTokIcon({ style }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={style}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  );
}

// Fixed social link fields on the Expert entity
const SOCIAL_FIELDS = [
  { key: "linkedin_url",  label: "LinkedIn",  Icon: Linkedin,    placeholder: "https://linkedin.com/in/yourname" },
  { key: "instagram_url", label: "Instagram", Icon: Instagram,   placeholder: "https://instagram.com/yourhandle" },
  { key: "website_url",   label: "Website",   Icon: Globe,       placeholder: "https://yourwebsite.com" },
  { key: "email",         label: "Email",     Icon: Mail,        placeholder: "you@example.com" },
  { key: "twitter_url",   label: "Twitter/X", Icon: Twitter,     placeholder: "https://twitter.com/yourhandle" },
  { key: "tiktok_url",    label: "TikTok",    Icon: TikTokIcon,  placeholder: "https://tiktok.com/@yourhandle" },
];

const MAX_CUSTOM_LINKS = 2;

const CATEGORY_DOMAIN_MAP_DASH = {
  "69f48a8d1e94ea01a3a8c3f9": "Health & Hormones",
  "69f48a8d1e94ea01a3a8c3fa": "Nervous System",
  "69f48a8d1e94ea01a3a8c3fb": "Mindset & Behaviour",
  "69f48a8d1e94ea01a3a8c3fc": "Money",
  "69f48a8d1e94ea01a3a8c3fd": "Leadership & Authority",
  "69f48a8d1e94ea01a3a8c3fe": "Relationships",
  "69f48a8d1e94ea01a3a8c3ff": "Identity & Visibility",
};

function SocialLinkIcon({ platform, size = 18 }) {
  const s = { width: size, height: size, flexShrink: 0 };
  const p = (platform || "").toLowerCase();
  if (p === "linkedin") return <Linkedin style={s} />;
  if (p === "instagram") return <Instagram style={s} />;
  if (p === "email") return <Mail style={s} />;
  if (p === "website") return <Globe style={s} />;
  return <LinkIcon style={s} />;
}

function ProfileTab({ expert, onExpertUpdate, user }) {

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    bio: "",
    specialties: [],
    profile_picture: "",
    linkedin_url: "",
    instagram_url: "",
    website_url: "",
    email: "",
    twitter_url: "",
    tiktok_url: "",
    custom_links: [],
  });

  // Specialty typeahead
  const { data: allSpecialties = [] } = useQuery({
    queryKey: ["specialties-list"],
    queryFn: async () => {
      const results = await base44.entities.Specialty.list();
      console.log("[ExpertDashboard] Specialties loaded:", results);
      return results;
    },
  });
  const [specialtySearch, setSpecialtySearch] = useState("");
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false);

  const filteredSpecialties = specialtySearch.trim()
    ? allSpecialties.filter(s =>
        (s.name || "").toLowerCase().includes(specialtySearch.toLowerCase()) &&
        !formData.specialties.includes(s.name)
      )
    : [];
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [activeLink, setActiveLink] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [activeCustomLink, setActiveCustomLink] = useState(null); // index of custom link being edited

  const buildFormData = (src) => ({
    name: src.name || "",
    title: src.title || "",
    bio: src.bio || "",
    specialties: Array.isArray(src.specialties) ? src.specialties : [],
    profile_picture: src.profile_picture || "",
    linkedin_url: src.linkedin_url || "",
    instagram_url: src.instagram_url || "",
    website_url: src.website_url || "",
    email: src.email || "",
    twitter_url: src.twitter_url || "",
    tiktok_url: src.tiktok_url || "",
    custom_links: Array.isArray(src.custom_links) ? src.custom_links : [],
  });

  useEffect(() => {
    if (expert) setFormData(buildFormData(expert));
  }, [expert]);

  const handleEdit = () => { setIsEditing(true); setSuccess(false); setError(null); };
  const handleCancel = () => { setIsEditing(false); setFormData(buildFormData(expert)); setActiveLink(null); setActiveCustomLink(null); setSuccess(false); setError(null); };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await base44.entities.Expert.update(expert.id, {
        name: formData.name,
        title: formData.title,
        bio: formData.bio,
        specialties: formData.specialties.filter((s) => s.trim().length > 0),
        profile_picture: formData.profile_picture,
        linkedin_url: formData.linkedin_url,
        instagram_url: formData.instagram_url,
        website_url: formData.website_url,
        email: formData.email,
        twitter_url: formData.twitter_url,
        tiktok_url: formData.tiktok_url,
        custom_links: formData.custom_links.filter((l) => l.url?.trim()),
      });
      setSuccess(true);
      setIsEditing(false);
      setActiveLink(null);
      setActiveCustomLink(null);
      setTimeout(() => setSuccess(false), 3000);
      if (onExpertUpdate) onExpertUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeSpecialty = (i) => setFormData((f) => ({ ...f, specialties: f.specialties.filter((_, idx) => idx !== i) }));
  const addSpecialty = (name) => {
    const val = (name || specialtySearch).trim();
    if (!val || formData.specialties.includes(val)) return;
    setFormData((f) => ({ ...f, specialties: [...f.specialties, val] }));
    setSpecialtySearch("");
    setShowSpecialtyDropdown(false);
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData((f) => ({ ...f, profile_picture: file_url }));
    } catch {
      setError("Failed to upload image");
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (!expert) return null;

  const sans = "Montserrat, sans-serif";
  const serif = "'DM Serif Display', Georgia, serif";
  const domain = CATEGORY_DOMAIN_MAP_DASH[expert.category] || "Identity & Visibility";
  const publicSlug = (formData.name || expert.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  // Title tags (split by |)
  const titleTags = (formData.title || "").split("|").map((s) => s.trim()).filter(Boolean);

  return (
    <div className="space-y-6">
      {success && (
        <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: "rgba(45,106,79,0.08)" }}>
          <CheckCircle2 style={{ width: 14, height: 14, color: "#2D6A4F" }} />
          <span style={{ fontFamily: sans, fontSize: 12, color: "#2D6A4F" }}>Profile updated successfully</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: "rgba(192,57,43,0.08)" }}>
          <AlertCircle style={{ width: 14, height: 14, color: "#C0392B" }} />
          <span style={{ fontFamily: sans, fontSize: 12, color: "#C0392B" }}>{error}</span>
        </div>
      )}

      {/* ── WYSIWYG PROFILE CARD — mirrors public ExpertProfile hero layout ── */}
      <div
        className="rounded-xl overflow-visible"
        style={{
          background: "#FAF5F3",
          border: isEditing ? "2px solid #C4847A" : "1px solid rgba(74,14,46,0.06)",
          boxShadow: "0 2px 12px rgba(74,14,46,0.04)",
        }}
      >
        {/* Edit mode banner */}
        {isEditing && (
          <div className="px-6 py-2.5 flex items-center gap-2" style={{ background: "#FDF5F3", borderBottom: "1px solid rgba(196,132,122,0.2)", borderRadius: "10px 10px 0 0" }}>
            <Edit style={{ width: 12, height: 12, color: "#C4847A" }} />
            <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 10, color: "#C4847A", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Editing your public profile
            </span>
          </div>
        )}

        {/* Hero section — matches public profile 40/60 grid */}
        <div className="p-6 md:p-8">
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(0,3fr)", gap: 40, alignItems: "start" }}>

            {/* LEFT — Large photo (3:4 ratio like public profile) */}
            <div>
              <div
                className="relative group"
                style={{ borderRadius: 12, overflow: "hidden", aspectRatio: "3/4", background: `linear-gradient(135deg, #F5DDD9, #C4847A)`, boxShadow: "0 8px 32px rgba(74,14,46,0.1)" }}
              >
                {formData.profile_picture ? (
                  <img src={formData.profile_picture} alt={formData.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: serif, fontStyle: "italic", fontSize: 64, color: "#4A0E2E" }}>
                      {(formData.name || "?").split(" ").map((p) => p[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                )}
                {/* Upload overlay on hover when editing */}
                {isEditing && (
                  <label
                    htmlFor="profile-pic-upload"
                    className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "rgba(74,14,46,0.55)", backdropFilter: "blur(2px)" }}
                  >
                    {uploadingPhoto ? (
                      <Loader2 className="animate-spin" style={{ width: 28, height: 28, color: "#FFFFFF", marginBottom: 8 }} />
                    ) : (
                      <>
                        <Upload style={{ width: 24, height: 24, color: "#FFFFFF", marginBottom: 8 }} />
                        <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 11, color: "#FFFFFF", letterSpacing: "0.15em", textTransform: "uppercase" }}>Change Photo</span>
                      </>
                    )}
                  </label>
                )}
                <input id="profile-pic-upload" type="file" accept="image/*" className="hidden" onChange={handleProfilePictureUpload} />
              </div>
            </div>

            {/* RIGHT — details */}
            <div style={{ paddingTop: 4 }}>
              {/* Domain eyebrow */}
              <p style={{ fontFamily: sans, fontWeight: 600, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.22em", color: "#C4847A", marginBottom: 12 }}>
                {domain}
              </p>

              {/* Name */}
              {isEditing ? (
                <input
                  value={formData.name}
                  onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                  style={{ fontFamily: serif, fontSize: "clamp(24px,3vw,36px)", color: "#4A0E2E", lineHeight: 1.1, margin: "0 0 10px", background: "transparent", border: "none", borderBottom: "2px solid #E8B4AE", outline: "none", width: "100%", padding: "0 0 4px" }}
                  placeholder="Your name"
                />
              ) : (
                <h2 style={{ fontFamily: serif, fontSize: "clamp(24px,3vw,36px)", color: "#4A0E2E", lineHeight: 1.1, margin: "0 0 10px" }}>
                  {formData.name}
                </h2>
              )}

              {/* Title — shown as plain text on public profile */}
              {isEditing ? (
                <input
                  value={formData.title}
                  onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
                  style={{ fontFamily: sans, fontWeight: 300, fontSize: 15, color: "#8A7A76", margin: "0 0 16px", background: "transparent", border: "none", borderBottom: "1px solid rgba(196,132,122,0.3)", outline: "none", width: "100%", padding: "0 0 4px" }}
                  placeholder="Title / role (use | to add multiple tags, e.g. Coach | Author)"
                />
              ) : (
                <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 15, color: "#8A7A76", margin: "0 0 16px" }}>
                  {formData.title}
                </p>
              )}

              {/* Title tags (split by |) — shown as pill tags on public profile */}
              {titleTags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                  {titleTags.map((tag, i) => (
                    <span key={i} style={{ fontFamily: sans, fontWeight: 400, fontSize: 11, color: "#4A0E2E", border: "1px solid rgba(74,14,46,0.15)", borderRadius: 100, padding: "6px 14px" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Specialty tags (from specialties array) */}
              {(formData.specialties.length > 0 || isEditing) && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20, alignItems: "center" }}>
                  {formData.specialties.map((s, i) => (
                    <span
                      key={i}
                      style={{ background: "#F5DDD9", color: "#4A0E2E", borderRadius: 100, padding: "8px 16px", fontFamily: sans, fontWeight: 400, fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 }}
                    >
                      {s}
                      {isEditing && (
                        <button onClick={() => removeSpecialty(i)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#4A0E2E", display: "flex", alignItems: "center", opacity: 0.5 }}>
                          <X style={{ width: 10, height: 10 }} />
                        </button>
                      )}
                    </span>
                  ))}
                  {isEditing && (
                    <div style={{ position: "relative" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <input
                          value={specialtySearch}
                          onChange={(e) => { setSpecialtySearch(e.target.value); setShowSpecialtyDropdown(true); }}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSpecialty(); } if (e.key === "Escape") setShowSpecialtyDropdown(false); }}
                          onFocus={() => setShowSpecialtyDropdown(true)}
                          placeholder="Search specialties…"
                          style={{ fontFamily: sans, fontSize: 12, color: "#3A2A28", border: "1px dashed rgba(74,14,46,0.25)", borderRadius: 100, padding: "6px 14px", outline: "none", background: "transparent", width: 160 }}
                        />
                        <button onClick={() => addSpecialty()} style={{ width: 28, height: 28, borderRadius: "50%", background: "#4A0E2E", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Plus style={{ width: 13, height: 13, color: "#FFFFFF" }} />
                        </button>
                      </div>
                      {showSpecialtyDropdown && filteredSpecialties.length > 0 && (
                        <div style={{ position: "absolute", top: "100%", left: 0, zIndex: 50, background: "#FFFFFF", border: "1px solid rgba(74,14,46,0.12)", borderRadius: 10, padding: "4px 0", minWidth: 200, boxShadow: "0 8px 24px rgba(74,14,46,0.12)", marginTop: 4 }}>
                          {filteredSpecialties.slice(0, 8).map((sp) => (
                            <button
                              key={sp.id}
                              onMouseDown={(e) => { e.preventDefault(); addSpecialty(sp.name); }}
                              style={{ width: "100%", textAlign: "left", background: "none", border: "none", padding: "8px 14px", fontFamily: sans, fontSize: 12, color: "#3A2A28", cursor: "pointer" }}
                              onMouseEnter={e => e.target.style.background = "#FAF5F3"}
                              onMouseLeave={e => e.target.style.background = "none"}
                            >
                              {sp.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Social link icons — one per fixed field + custom links */}
              <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
                {SOCIAL_FIELDS.map(({ key, label, Icon: SIcon, placeholder }) => {
                  const hasValue = !!formData[key];
                  const isActive = activeLink === key;
                  if (!isEditing && !hasValue) return null;
                  return (
                    <div key={key} style={{ position: "relative" }}>
                      <button
                        onClick={() => isEditing && setActiveLink(isActive ? null : key)}
                        title={isEditing ? (hasValue ? `Edit ${label}` : `Add ${label}`) : label}
                        style={{
                          width: 40, height: 40, borderRadius: "50%",
                          border: isActive ? "2px solid #C4847A" : "1px solid rgba(74,14,46,0.12)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: isActive ? "#4A0E2E" : "#FFFFFF",
                          color: isActive ? "#FFFFFF" : "#4A0E2E",
                          opacity: isEditing && !hasValue ? 0.35 : 1,
                          cursor: isEditing ? "pointer" : "default",
                          transition: "all 0.15s",
                          position: "relative",
                        }}
                      >
                        <SIcon style={{ width: 16, height: 16 }} />
                        {isEditing && !hasValue && (
                          <span style={{ position: "absolute", bottom: -2, right: -2, width: 14, height: 14, background: "#C4847A", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Plus style={{ width: 8, height: 8, color: "#FFFFFF" }} />
                          </span>
                        )}
                      </button>
                      {isEditing && isActive && (
                        <div style={{ position: "absolute", top: 48, left: 0, zIndex: 50, background: "#FFFFFF", border: "1px solid rgba(74,14,46,0.12)", borderRadius: 10, padding: 14, minWidth: 270, boxShadow: "0 8px 28px rgba(74,14,46,0.14)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                            <SIcon style={{ width: 13, height: 13, color: "#4A0E2E" }} />
                            <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 11, color: "#4A0E2E", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
                            {hasValue && (
                              <button onClick={() => { setFormData((f) => ({ ...f, [key]: "" })); setActiveLink(null); }} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#C0392B", padding: 2, display: "flex" }}>
                                <Trash2 style={{ width: 13, height: 13 }} />
                              </button>
                            )}
                          </div>
                          <input
                            autoFocus type="text" value={formData[key]}
                            onChange={(e) => setFormData((f) => ({ ...f, [key]: e.target.value }))}
                            placeholder={placeholder}
                            onKeyDown={(e) => { if (e.key === "Enter") setActiveLink(null); }}
                            style={{ width: "100%", fontFamily: sans, fontSize: 12, color: "#3A2A28", border: "1px solid rgba(74,14,46,0.15)", borderRadius: 6, padding: "8px 10px", outline: "none", boxSizing: "border-box", marginBottom: 8 }}
                          />
                          <button onClick={() => setActiveLink(null)} style={{ width: "100%", background: "#4A0E2E", color: "#FFFFFF", border: "none", borderRadius: 6, padding: "8px", fontFamily: sans, fontWeight: 600, fontSize: 11, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                            Done
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Custom links (LinkIcon buttons) */}
                {formData.custom_links.map((cl, i) => {
                  const isActive = activeCustomLink === i;
                  if (!isEditing && !cl.url) return null;
                  return (
                    <div key={`custom-${i}`} style={{ position: "relative" }}>
                      <button
                        onClick={() => isEditing && setActiveCustomLink(isActive ? null : i)}
                        title={cl.label || "Custom Link"}
                        style={{ width: 40, height: 40, borderRadius: "50%", border: isActive ? "2px solid #C4847A" : "1px solid rgba(74,14,46,0.12)", display: "flex", alignItems: "center", justifyContent: "center", background: isActive ? "#4A0E2E" : "#FFFFFF", color: isActive ? "#FFFFFF" : "#4A0E2E", cursor: isEditing ? "pointer" : "default", transition: "all 0.15s" }}
                      >
                        <LinkIcon style={{ width: 16, height: 16 }} />
                      </button>
                      {isEditing && isActive && (
                        <div style={{ position: "absolute", top: 48, left: 0, zIndex: 50, background: "#FFFFFF", border: "1px solid rgba(74,14,46,0.12)", borderRadius: 10, padding: 14, minWidth: 270, boxShadow: "0 8px 28px rgba(74,14,46,0.14)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                            <LinkIcon style={{ width: 13, height: 13, color: "#4A0E2E" }} />
                            <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 11, color: "#4A0E2E", textTransform: "uppercase", letterSpacing: "0.1em" }}>Custom Link</span>
                            <button onClick={() => { setFormData((f) => ({ ...f, custom_links: f.custom_links.filter((_, idx) => idx !== i) })); setActiveCustomLink(null); }} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#C0392B", padding: 2, display: "flex" }}>
                              <Trash2 style={{ width: 13, height: 13 }} />
                            </button>
                          </div>
                          <input
                            autoFocus type="text"
                            value={cl.label || ""}
                            onChange={(e) => setFormData((f) => ({ ...f, custom_links: f.custom_links.map((l, idx) => idx === i ? { ...l, label: e.target.value } : l) }))}
                            placeholder="Label (e.g. Podcast, Substack)"
                            style={{ width: "100%", fontFamily: sans, fontSize: 12, color: "#3A2A28", border: "1px solid rgba(74,14,46,0.15)", borderRadius: 6, padding: "8px 10px", outline: "none", boxSizing: "border-box", marginBottom: 6 }}
                          />
                          <input
                            type="text"
                            value={cl.url || ""}
                            onChange={(e) => setFormData((f) => ({ ...f, custom_links: f.custom_links.map((l, idx) => idx === i ? { ...l, url: e.target.value } : l) }))}
                            placeholder="https://…"
                            onKeyDown={(e) => { if (e.key === "Enter") setActiveCustomLink(null); }}
                            style={{ width: "100%", fontFamily: sans, fontSize: 12, color: "#3A2A28", border: "1px solid rgba(74,14,46,0.15)", borderRadius: 6, padding: "8px 10px", outline: "none", boxSizing: "border-box", marginBottom: 8 }}
                          />
                          <button onClick={() => setActiveCustomLink(null)} style={{ width: "100%", background: "#4A0E2E", color: "#FFFFFF", border: "none", borderRadius: 6, padding: "8px", fontFamily: sans, fontWeight: 600, fontSize: 11, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                            Done
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add custom link button — only in edit mode, max 2 */}
                {isEditing && formData.custom_links.length < MAX_CUSTOM_LINKS && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      onClick={() => {
                        const newIdx = formData.custom_links.length;
                        setFormData((f) => ({ ...f, custom_links: [...f.custom_links, { label: "", url: "" }] }));
                        setActiveCustomLink(newIdx);
                        setActiveLink(null);
                      }}
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: "1px dashed rgba(196,132,122,0.5)", borderRadius: 100, padding: "6px 12px", fontFamily: sans, fontWeight: 600, fontSize: 11, color: "#C4847A", cursor: "pointer" }}
                    >
                      <Plus style={{ width: 12, height: 12 }} />
                      Add Link
                    </button>
                    <span style={{ fontFamily: sans, fontWeight: 300, fontSize: 11, color: "#8A7A76" }}>
                      {MAX_CUSTOM_LINKS - formData.custom_links.length} {MAX_CUSTOM_LINKS - formData.custom_links.length === 1 ? "link" : "links"} remaining
                    </span>
                  </div>
                )}
              </div>

              {/* CTA buttons — non-editable, for visual context only */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <div style={{ background: "#C4847A", color: "#0E0208", borderRadius: 100, padding: "12px 24px", fontFamily: sans, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.5, userSelect: "none" }}>
                  Send a Message
                </div>
                <div style={{ background: "transparent", color: "#4A0E2E", border: "1px solid rgba(74,14,46,0.2)", borderRadius: 100, padding: "12px 24px", fontFamily: sans, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.5, userSelect: "none" }}>
                  View Programme
                </div>
              </div>
            </div>
          </div>

          {/* BIO — full width below the hero, matching public profile "About" card */}
          <div style={{ marginTop: 28 }}>
            <p style={{ fontFamily: sans, fontWeight: 600, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.22em", color: "#C4847A", marginBottom: 12 }}>About</p>
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData((f) => ({ ...f, bio: e.target.value }))}
                rows={6}
                placeholder="Write your biography…"
                style={{ width: "100%", fontFamily: sans, fontWeight: 300, fontSize: 14, color: "#3A2A28", lineHeight: 1.85, border: "1px solid rgba(74,14,46,0.15)", borderRadius: 8, padding: "12px 14px", outline: "none", resize: "vertical", boxSizing: "border-box", background: "#FFFFFF" }}
              />
            ) : (
              formData.bio && (
                <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 14, color: "#3A2A28", lineHeight: 1.85, margin: 0 }}>
                  {formData.bio}
                </p>
              )
            )}
          </div>
        </div>

        {/* Save / Cancel */}
        {isEditing && (
          <div style={{ padding: "0 24px 24px", display: "flex", gap: 12 }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "#4A0E2E", color: "#FFFFFF", border: "none", borderRadius: 100, padding: "13px 28px", fontFamily: sans, fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", cursor: saving ? "wait" : "pointer", opacity: saving ? 0.6 : 1 }}
            >
              {saving ? <><Loader2 className="animate-spin" style={{ width: 15, height: 15 }} /> Saving…</> : <><Save style={{ width: 14, height: 14 }} /> Save Changes</>}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              style={{ background: "transparent", color: "#4A0E2E", border: "1px solid rgba(74,14,46,0.2)", borderRadius: 100, padding: "13px 28px", fontFamily: sans, fontWeight: 500, fontSize: 12, cursor: saving ? "not-allowed" : "pointer" }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Edit Profile button when not editing */}
        {!isEditing && (
          <div style={{ padding: "0 24px 24px" }}>
            <button
              onClick={handleEdit}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#4A0E2E", color: "#FFFFFF", border: "none", borderRadius: 100, padding: "12px 24px", fontFamily: sans, fontWeight: 600, fontSize: 12, cursor: "pointer" }}
            >
              <Edit style={{ width: 13, height: 13 }} /> Edit Profile
            </button>
          </div>
        )}
      </div>

      {/* ── VIEW PUBLIC PROFILE LINK ── */}
      <div className="rounded-xl p-5 flex items-center justify-between" style={{ background: "#FDF5F3", border: "1px solid rgba(74,14,46,0.06)" }}>
        <div>
          <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 13, color: "#4A0E2E" }}>Your public profile</span>
          <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 12, color: "#8A7A76", marginTop: 2 }}>
            This is how you appear on the Blueprint sales page and Experts directory.
          </p>
        </div>
        <a
          href={`/experts/${publicSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FFFFFF", border: "1px solid rgba(74,14,46,0.1)", borderRadius: 8, padding: "8px 16px", fontFamily: sans, fontWeight: 500, fontSize: 12, color: "#4A0E2E", textDecoration: "none" }}
        >
          View <ExternalLink style={{ width: 12, height: 12 }} />
        </a>
      </div>
    </div>
  );
}

export default function ExpertDashboard() {
  const { user, userEmail, expert, affiliate, sales, isLoading, isAdminMode } = useExpertData();
  const [activeTab, setActiveTab] = useState("earnings");
  const queryClient = useQueryClient();

  const { data: contactSubmissions = [] } = useQuery({
    queryKey: ["expert-contact-requests", expert?.id],
    queryFn: () => base44.entities.ContactSubmission.filter({ recipient_email: userEmail }),
    enabled: !!userEmail && !!expert,
  });

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
    { id: "contact-requests", label: "Contact Requests", icon: MessageSquare, badge: contactSubmissions?.filter((s) => s.status === "new").length || 0 },
  ];

  return (
    <div style={{ background: "#FAF5F3", minHeight: "100vh" }}>
      <div className="mx-auto" style={{ maxWidth: 960, padding: "40px 24px 80px" }}>

        {/* Admin mode banner */}
        {isAdminMode && (
          <div className="flex items-center justify-between gap-4 mb-6 px-5 py-3 rounded-xl" style={{ background: "#4A0E2E", color: "#FFFFFF" }}>
            <div className="flex items-center gap-2">
              <Edit style={{ width: 14, height: 14, color: "#C4847A" }} />
              <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 12 }}>
                Admin Mode: Editing <strong>{expert.name}</strong>'s profile
              </span>
            </div>
            <Link
              to="/expert-dashboard"
              style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500, fontSize: 11, color: "#E8B4AE", textDecoration: "none", whiteSpace: "nowrap" }}
            >
              ← Return to your dashboard
            </Link>
          </div>
        )}

        <div className="mb-8">
          <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "#C4847A", marginBottom: 8 }}>
            {isAdminMode ? "ADMIN — EXPERT PROFILE" : "EXPERT DASHBOARD"}
          </p>
          <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(24px, 4vw, 32px)", color: "#4A0E2E", marginBottom: 4 }}>
            {isAdminMode ? expert.name : `Welcome back, ${expert.name?.split(" ")[0] || "Expert"}`}
          </h1>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: 14, color: "#8A7A76" }}>
            {isAdminMode ? "Editing this expert's profile and earnings data." : "Manage your profile and track your affiliate earnings."}
          </p>
        </div>

        <div className="flex gap-1 p-1 rounded-xl mb-8" style={{ background: "#FFFFFF", display: "inline-flex" }}>
          {tabs.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all relative"
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
              {badge > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-xs font-bold" style={{ background: "#C4847A", color: "#FFFFFF", fontFamily: "Montserrat, sans-serif", fontSize: 10 }}>
                  {badge}
                </span>
              )}
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

              {affiliate && <BankDetailsCard affiliate={affiliate} />}

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

          {activeTab === "profile" && (
            <ProfileTab
              expert={expert}
              user={user}
              onExpertUpdate={() => queryClient.invalidateQueries({ queryKey: ["expert-profile", userEmail] })}
            />
          )}

          {activeTab === "contact-requests" && (
            <ContactRequestsTab expert={expert} />
          )}
        </motion.div>
      </div>
    </div>
  );
}