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
  ChevronDown,
} from "lucide-react";

const SITE_URL = "https://app.alignedwomanco.com";

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
    userEmail,
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

const LINK_PLATFORMS = ["LinkedIn", "Instagram", "Website", "Email", "Twitter", "TikTok", "YouTube"];

function SocialLinkIcon({ platform, size = 18 }) {
  const style = { width: size, height: size };
  const p = platform?.toLowerCase();
  if (p === "linkedin") return <Linkedin style={style} />;
  if (p === "instagram") return <Instagram style={style} />;
  if (p === "email") return <Mail style={style} />;
  if (p === "website") return <Globe style={style} />;
  return <LinkIcon style={style} />;
}

function ProfileTab({ expert, onExpertUpdate, user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    bio: "",
    specialties: [],
    profile_picture: "",
    social_links: [],
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [activeLinkIndex, setActiveLinkIndex] = useState(null);
  const [newSpecialty, setNewSpecialty] = useState("");
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLinkPlatform, setNewLinkPlatform] = useState("Website");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (expert) {
      setFormData({
        name: expert.name || "",
        title: expert.title || "",
        bio: expert.bio || "",
        specialties: expert.specialties || [],
        profile_picture: expert.profile_picture || "",
        social_links: expert.social_links || [],
      });
    }
  }, [expert]);

  const handleEdit = () => {
    setIsEditing(true);
    setSuccess(false);
    setError(null);
    setActiveLinkIndex(null);
    setShowAddLink(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: expert.name || "",
      title: expert.title || "",
      bio: expert.bio || "",
      specialties: expert.specialties || [],
      profile_picture: expert.profile_picture || "",
      social_links: expert.social_links || [],
    });
    setActiveLinkIndex(null);
    setShowAddLink(false);
    setSuccess(false);
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await base44.entities.Expert.update(expert.id, {
        name: formData.name,
        title: formData.title,
        bio: formData.bio,
        specialties: formData.specialties.filter((s) => s.trim().length > 0),
        profile_picture: formData.profile_picture,
        social_links: formData.social_links.filter((l) => l.platform && l.url),
      });
      setSuccess(true);
      setIsEditing(false);
      setActiveLinkIndex(null);
      setShowAddLink(false);
      setTimeout(() => setSuccess(false), 3000);
      if (onExpertUpdate) onExpertUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSpecialty = (i) => {
    setFormData({ ...formData, specialties: formData.specialties.filter((_, idx) => idx !== i) });
  };

  const handleAddSpecialty = () => {
    const val = newSpecialty.trim();
    if (!val) return;
    setFormData({ ...formData, specialties: [...formData.specialties, val] });
    setNewSpecialty("");
  };

  const handleRemoveLink = (i) => {
    setFormData({ ...formData, social_links: formData.social_links.filter((_, idx) => idx !== i) });
    if (activeLinkIndex === i) setActiveLinkIndex(null);
  };

  const handleLinkUrlChange = (i, val) => {
    const updated = formData.social_links.map((l, idx) => idx === i ? { ...l, url: val } : l);
    setFormData({ ...formData, social_links: updated });
  };

  const handleConfirmAddLink = () => {
    if (!newLinkUrl.trim()) return;
    setFormData({ ...formData, social_links: [...formData.social_links, { platform: newLinkPlatform, url: newLinkUrl.trim() }] });
    setNewLinkUrl("");
    setNewLinkPlatform("Website");
    setShowAddLink(false);
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData((prev) => ({ ...prev, profile_picture: file_url }));
    } catch {
      setError("Failed to upload image");
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (!expert) return null;

  const sans = "Montserrat, sans-serif";
  const serif = "'DM Serif Display', Georgia, serif";

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

      {/* ── WYSIWYG PROFILE CARD ── */}
      <div className="rounded-xl overflow-hidden" style={{ background: "#FFFFFF", border: isEditing ? "2px solid #C4847A" : "1px solid rgba(74,14,46,0.06)", boxShadow: "0 2px 12px rgba(74,14,46,0.04)" }}>
        {isEditing && (
          <div className="px-6 py-3 flex items-center gap-2" style={{ background: "#FDF5F3", borderBottom: "1px solid rgba(196,132,122,0.2)" }}>
            <Edit style={{ width: 13, height: 13, color: "#C4847A" }} />
            <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 11, color: "#C4847A", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Editing — changes are live as you type
            </span>
          </div>
        )}

        <div className="p-6 md:p-8">
          {/* ── PHOTO + NAME + TITLE ── */}
          <div className="flex items-start gap-5 mb-5">
            {/* Photo */}
            <div className="relative shrink-0 group" style={{ width: 88, height: 88 }}>
              <div className="w-full h-full rounded-full overflow-hidden" style={{ background: "#FDF5F3" }}>
                {formData.profile_picture ? (
                  <img src={formData.profile_picture} alt={formData.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ fontFamily: serif, fontSize: 32, color: "#C4847A" }}>
                    {formData.name?.[0] || "?"}
                  </div>
                )}
              </div>
              {isEditing && (
                <>
                  <label
                    htmlFor="profile-pic-upload"
                    className="absolute inset-0 rounded-full flex flex-col items-center justify-center cursor-pointer transition-opacity opacity-0 group-hover:opacity-100"
                    style={{ background: "rgba(74,14,46,0.6)" }}
                  >
                    {uploadingPhoto ? (
                      <Loader2 className="animate-spin" style={{ width: 20, height: 20, color: "#FFFFFF" }} />
                    ) : (
                      <>
                        <Upload style={{ width: 16, height: 16, color: "#FFFFFF", marginBottom: 2 }} />
                        <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 9, color: "#FFFFFF", letterSpacing: "0.1em" }}>CHANGE</span>
                      </>
                    )}
                  </label>
                  <input id="profile-pic-upload" type="file" accept="image/*" className="hidden" onChange={handleProfilePictureUpload} />
                </>
              )}
            </div>

            {/* Name + Title */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-transparent outline-none border-b-2 mb-2"
                    style={{ fontFamily: serif, fontStyle: "italic", fontSize: 26, color: "#4A0E2E", borderColor: "#E8B4AE", paddingBottom: 2 }}
                    placeholder="Your name"
                  />
                  <input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-transparent outline-none border-b"
                    style={{ fontFamily: sans, fontWeight: 500, fontSize: 14, color: "#C4847A", borderColor: "rgba(196,132,122,0.3)", paddingBottom: 2 }}
                    placeholder="Your title / role"
                  />
                </>
              ) : (
                <>
                  <h2 style={{ fontFamily: serif, fontStyle: "italic", fontSize: 26, color: "#4A0E2E", marginBottom: 2, lineHeight: 1.2 }}>
                    {formData.name}
                  </h2>
                  <p style={{ fontFamily: sans, fontWeight: 500, fontSize: 14, color: "#C4847A" }}>
                    {formData.title}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* ── SPECIALTIES ── */}
          <div className="flex flex-wrap gap-2 mb-5 items-center">
            {formData.specialties.map((s, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full"
                style={{ background: "#FDF5F3", color: "#4A0E2E", fontFamily: sans, fontWeight: 500, fontSize: 11 }}
              >
                {s}
                {isEditing && (
                  <button onClick={() => handleRemoveSpecialty(i)} className="ml-1 hover:opacity-60 transition-opacity" aria-label="Remove">
                    <X style={{ width: 10, height: 10 }} />
                  </button>
                )}
              </span>
            ))}
            {isEditing && (
              <div className="flex items-center gap-1">
                <input
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSpecialty(); } }}
                  placeholder="Add specialty…"
                  className="px-2 py-1 rounded-full border outline-none"
                  style={{ fontFamily: sans, fontSize: 11, color: "#3A2A28", borderColor: "rgba(74,14,46,0.2)", width: 130 }}
                />
                <button
                  onClick={handleAddSpecialty}
                  className="w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: "#4A0E2E", color: "#FFFFFF" }}
                >
                  <Plus style={{ width: 12, height: 12 }} />
                </button>
              </div>
            )}
          </div>

          {/* ── SOCIAL LINKS ── */}
          <div className="mb-5">
            <div className="flex items-center gap-2 flex-wrap">
              {formData.social_links.map((link, i) => (
                <div key={i} className="relative">
                  <button
                    onClick={() => isEditing && setActiveLinkIndex(activeLinkIndex === i ? null : i)}
                    className="flex items-center justify-center rounded-full transition-all"
                    style={{
                      width: 38,
                      height: 38,
                      background: activeLinkIndex === i ? "#4A0E2E" : "#FDF5F3",
                      color: activeLinkIndex === i ? "#FFFFFF" : "#4A0E2E",
                      border: "1px solid rgba(74,14,46,0.12)",
                      cursor: isEditing ? "pointer" : "default",
                    }}
                    title={link.platform}
                  >
                    <SocialLinkIcon platform={link.platform} size={15} />
                  </button>
                  {/* Inline edit popover */}
                  {isEditing && activeLinkIndex === i && (
                    <div
                      className="absolute top-11 left-0 z-20 rounded-xl p-3 shadow-lg"
                      style={{ background: "#FFFFFF", border: "1px solid rgba(74,14,46,0.1)", minWidth: 240, boxShadow: "0 8px 24px rgba(74,14,46,0.12)" }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <SocialLinkIcon platform={link.platform} size={13} />
                        <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 11, color: "#4A0E2E" }}>{link.platform}</span>
                        <button onClick={() => handleRemoveLink(i)} className="ml-auto p-1 rounded hover:bg-red-50 transition-colors" style={{ color: "#C0392B" }}>
                          <Trash2 style={{ width: 12, height: 12 }} />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => handleLinkUrlChange(i, e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border outline-none"
                        style={{ fontFamily: sans, fontSize: 12, color: "#3A2A28", borderColor: "rgba(74,14,46,0.15)" }}
                        placeholder="https://..."
                        autoFocus
                      />
                      <button
                        onClick={() => setActiveLinkIndex(null)}
                        className="mt-2 w-full py-1.5 rounded-lg text-center"
                        style={{ fontFamily: sans, fontWeight: 600, fontSize: 11, background: "#4A0E2E", color: "#FFFFFF" }}
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Add new link */}
              {isEditing && (
                <div className="relative">
                  <button
                    onClick={() => { setShowAddLink(!showAddLink); setActiveLinkIndex(null); }}
                    className="flex items-center justify-center rounded-full transition-all"
                    style={{ width: 38, height: 38, background: showAddLink ? "#4A0E2E" : "transparent", color: showAddLink ? "#FFFFFF" : "#C4847A", border: "1px dashed rgba(196,132,122,0.5)" }}
                    title="Add link"
                  >
                    <Plus style={{ width: 15, height: 15 }} />
                  </button>
                  {showAddLink && (
                    <div
                      className="absolute top-11 left-0 z-20 rounded-xl p-3 shadow-lg"
                      style={{ background: "#FFFFFF", border: "1px solid rgba(74,14,46,0.1)", minWidth: 240, boxShadow: "0 8px 24px rgba(74,14,46,0.12)" }}
                    >
                      <p style={{ fontFamily: sans, fontWeight: 600, fontSize: 11, color: "#4A0E2E", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>Add a link</p>
                      <select
                        value={newLinkPlatform}
                        onChange={(e) => setNewLinkPlatform(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border outline-none mb-2"
                        style={{ fontFamily: sans, fontSize: 12, color: "#3A2A28", borderColor: "rgba(74,14,46,0.15)" }}
                      >
                        {LINK_PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <input
                        type="text"
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleConfirmAddLink(); }}
                        className="w-full px-2 py-1.5 rounded-lg border outline-none mb-2"
                        style={{ fontFamily: sans, fontSize: 12, color: "#3A2A28", borderColor: "rgba(74,14,46,0.15)" }}
                        placeholder="https://..."
                        autoFocus
                      />
                      <button
                        onClick={handleConfirmAddLink}
                        className="w-full py-1.5 rounded-lg text-center"
                        style={{ fontFamily: sans, fontWeight: 600, fontSize: 11, background: "#4A0E2E", color: "#FFFFFF" }}
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── BIO ── */}
          {isEditing ? (
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full bg-transparent border rounded-lg px-3 py-2 outline-none resize-none"
              rows={5}
              style={{ fontFamily: sans, fontWeight: 300, fontSize: 14, color: "#3A2A28", lineHeight: 1.75, borderColor: "rgba(74,14,46,0.15)" }}
              placeholder="Write your biography…"
            />
          ) : (
            formData.bio && (
              <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 14, color: "#3A2A28", lineHeight: 1.75 }}>
                {formData.bio}
              </p>
            )
          )}

          {/* ── ACTION BUTTONS ── */}
          <div className="mt-6 flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full transition-all"
                  style={{ background: "#4A0E2E", color: "#FFFFFF", fontFamily: sans, fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", opacity: saving ? 0.6 : 1, cursor: saving ? "wait" : "pointer" }}
                >
                  {saving ? <><Loader2 className="animate-spin" style={{ width: 15, height: 15 }} /> Saving…</> : <><Save style={{ width: 14, height: 14 }} /> Save Changes</>}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-full transition-all"
                  style={{ background: "transparent", border: "1px solid rgba(74,14,46,0.15)", fontFamily: sans, fontWeight: 500, fontSize: 12, color: "#4A0E2E", cursor: saving ? "not-allowed" : "pointer" }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full transition-all"
                style={{ background: "#4A0E2E", color: "#FFFFFF", fontFamily: sans, fontWeight: 600, fontSize: 12 }}
              >
                <Edit style={{ width: 13, height: 13 }} /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── VIEW PUBLIC PROFILE ── */}
      <div className="rounded-xl p-5 flex items-center justify-between" style={{ background: "#FDF5F3", border: "1px solid rgba(74,14,46,0.06)" }}>
        <div>
          <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 13, color: "#4A0E2E" }}>Your public profile</span>
          <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 12, color: "#8A7A76", marginTop: 2 }}>
            This is how you appear on the Blueprint sales page and Experts directory.
          </p>
        </div>
        <a
          href={`/experts/${expert.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg"
          style={{ background: "#FFFFFF", border: "1px solid rgba(74,14,46,0.1)", fontFamily: sans, fontWeight: 500, fontSize: 12, color: "#4A0E2E", textDecoration: "none" }}
        >
          View <ExternalLink style={{ width: 12, height: 12 }} />
        </a>
      </div>
    </div>
  );
}

export default function ExpertDashboard() {
  const { user, userEmail, expert, affiliate, sales, isLoading } = useExpertData();
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