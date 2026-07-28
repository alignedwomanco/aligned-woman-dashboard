// ────────────────────────────────────────────────────────────────
// expertDomain · one definition of the domain label that prints above a
// practitioner's name, on the directory card, the profile hero, the faculty
// strip and the expert dashboard.
//
// This lived in four copies across three files and they drifted. Two of them
// also indexed the map with expert.category directly, which is an array on
// most records, so the lookup returned undefined and eleven of fourteen
// practitioners displayed the same wrong label. Import from here instead.
// ────────────────────────────────────────────────────────────────

export const CATEGORY_DOMAIN_MAP = {
  "69f48a8d1e94ea01a3a8c3f9": "Health & Hormones",
  "69f48a8d1e94ea01a3a8c3fa": "Nervous System",
  "69f48a8d1e94ea01a3a8c3fb": "Mindset & Behaviour",
  "69f48a8d1e94ea01a3a8c3fc": "Money",
  "69f48a8d1e94ea01a3a8c3fd": "Leadership & Authority",
  "69f48a8d1e94ea01a3a8c3fe": "Relationships",
  "69f48a8d1e94ea01a3a8c3ff": "Identity & Visibility",
};

// Founder label. Laura carries a composite string rather than the single
// first-mapped category the rest of the directory uses. Deliberate, and hers
// alone.
export const FOUNDER_NAME_MATCH = "laura thomas";
export const FOUNDER_DOMAIN =
  "AW Founder | Leadership & Authority | Mindset & Behaviour | Women's Retreat Guide";

// A record's category is an array of ExpertCategory ids. The first entry that
// maps to a public domain wins; Founder is not in the map, so it is skipped
// without needing a special case. Returns an empty string when nothing maps,
// so a caller can hide the eyebrow rather than print a label the practitioner
// does not actually hold.
export function resolveDomain(expert) {
  if (!expert) return "";
  if ((expert.name || "").toLowerCase().includes(FOUNDER_NAME_MATCH)) return FOUNDER_DOMAIN;
  const ids = Array.isArray(expert.category)
    ? expert.category
    : expert.category
    ? [expert.category]
    : [];
  return ids.map((id) => CATEGORY_DOMAIN_MAP[id]).find(Boolean) || "";
}
