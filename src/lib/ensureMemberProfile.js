import { base44 } from "@/api/base44Client";

export async function ensureMemberProfile(user) {
  if (!user?.email) return null;

  const findOne = async () => {
    const rows = await base44.entities.MemberProfile.filter(
      { created_by: user.email },
      "-created_date",
      1
    );
    return rows && rows.length > 0 ? rows[0] : null;
  };

  const existing = await findOne();
  if (existing) return existing;

  try {
    return await base44.entities.MemberProfile.create({
      user_id: user.id,
      full_name: user.full_name || "",
      first_name: (user.full_name || "").trim().split(" ")[0] || "",
      has_seen_welcome: false,
    });
  } catch (err) {
    const after = await findOne();
    if (after) return after;
    throw err;
  }
}