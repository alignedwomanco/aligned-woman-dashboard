// ────────────────────────────────────────────────────────────────
// Circle · shared constants for partner hosted community rooms.
//
// A room lives at its own slug as a top level address, so a slug may
// never collide with a real route. RESERVED_ROOM_SLUGS is the client
// copy of the list the moderateCircle and approvePartnerApplication
// functions enforce server side. Keep the three in step.
// ────────────────────────────────────────────────────────────────

export const RESERVED_ROOM_SLUGS = [
  "login", "register", "forgot-password", "reset-password", "home", "blueprint",
  "about-us", "checkoutcomplete", "claritysprint", "apply", "checkout",
  "terms-and-conditions", "competition", "contact", "contactform", "welcome",
  "checkout-success", "pdf-test", "startingpointprofile", "theawstandard",
  "yourmoneystory", "money-story", "dashboard", "community", "experts", "admin",
  "expert-dashboard", "partner", "host-guide", "feminineworkbook", "analytics", "coursedetail",
  "sectiondetail", "workbook", "workbookviewer", "dashboardsettings", "classroom",
  "dailycheckin", "definemypurpose", "expertsdirectory", "expertprofile", "members",
  "moduleframeworkbuilder", "moduleplayer", "myalivejourney", "mycycle", "mymetrics",
  "mypathway", "ourwhy", "profilesettings", "progress", "settings", "support",
  "toolshub", "home_page", "applications", "api", "assets", "static", "functions",
  "groundedwoman",
];

export function isReservedRoomSlug(slug) {
  return RESERVED_ROOM_SLUGS.includes(String(slug || "").trim().toLowerCase());
}

export function slugifyRoom(name) {
  return String(name || "").toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 40);
}

// The Grounded Women Circle starting list. Topics are data on the Group
// record; this is only the seed a new room can start from.
export const DEFAULT_CIRCLE_TOPICS = [
  { key: "perimenopause-menopause", label: "Perimenopause and menopause", order: 0, active: true },
  { key: "periods-bleeding", label: "Periods and bleeding", order: 1, active: true },
  { key: "pms-pmdd", label: "PMS and PMDD", order: 2, active: true },
  { key: "pcos", label: "PCOS", order: 3, active: true },
  { key: "endometriosis-fertility", label: "Endometriosis and fertility", order: 4, active: true },
  { key: "intimate-vaginal-health", label: "Intimate and vaginal health", order: 5, active: true },
  { key: "hrt-treatment", label: "HRT and treatment", order: 6, active: true },
  { key: "mood-sleep-brain-fog", label: "Mood, sleep and brain fog", order: 7, active: true },
  { key: "relationships-intimacy", label: "Relationships and intimacy", order: 8, active: true },
  { key: "products", label: "Products", order: 9, active: true },
  { key: "something-else", label: "Something else", order: 10, active: true },
];

export const DEFAULT_RULES_TEXT =
  "This is a closed, women only space. Be kind. No medical advice is given here, only shared experience and guidance to find the right help. What is shared in the Circle stays in the Circle: no screenshots, no sharing. Right of admission reserved. Moderators may remove anyone who makes other members feel unsafe.";

// Copy that looks identical in every room, whoever hosts it.
export const CIRCLE_COPY = {
  anonymousHelper: (hostFirstName) =>
    `Other members will see Anonymous member. ${hostFirstName || "The host"} and The Aligned Woman Co. can see who you are, to keep the Circle safe. Take care with names or places that could identify you.`,
  mediaHelper: "A photo can show who you are. Share what feels right for you.",
  finePrint: (hostBusiness) => `${hostBusiness || "The host"} shares lived experience and education, not medical advice.`,
  questionPlaceholder: "No question is embarrassing. No question is off limits.",
  sharePlaceholder: "Something that helped, something you learned, something you want other women to know.",
  trustChips: ["Women only", "Anonymous questions", "Private and not shareable"],
};

export const ANONYMOUS_NAME = "Anonymous member";

// Six muted tints for anonymous avatars, indexed by anon_tint. Picked per
// post on the server, never per person, so posts cannot be linked by colour.
export const ANON_TINT_CLASSES = [
  "bg-awrose-pale text-awburg-mid",
  "bg-awsage-wash text-awsage-core",
  "bg-off-white text-awburg-core",
  "bg-awrose-wash text-awrose-deep",
  "bg-awrose-light/40 text-awburg-core",
  "bg-awsage-wash text-awburg-mid",
];

export function activeTopics(group) {
  return (Array.isArray(group?.topics) ? group.topics : [])
    .filter((t) => t && t.active !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function topicLabel(group, key) {
  const t = (Array.isArray(group?.topics) ? group.topics : []).find((x) => x.key === key);
  return t ? t.label : "";
}

// "2h", "Yesterday", "3 Sep": the compact stamp the room cards use.
export function shortTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24 && d.toDateString() === now.toDateString()) return `${hours}h`;
  const yest = new Date(now);
  yest.setDate(now.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function formatDuration(seconds) {
  const s = Math.max(0, Math.round(seconds || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// Photos are drawn to a canvas and re-encoded before upload. That drops
// every byte of metadata, including GPS, and gives the file a random name
// so the original file name never reaches the server either.
export async function scrubPhoto(file, maxEdge = 1600) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.86));
    if (!blob) throw new Error("Could not process the photo");
    return new File([blob], `${randomId()}.jpg`, { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function randomId() {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
