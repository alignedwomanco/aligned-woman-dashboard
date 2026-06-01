// Single source of truth for resolving where a workbook continues to.
// Every workbook page imports this instead of deriving order locally.

function sortByOrder(a, b) {
  const ao = a.order ?? Infinity;
  const bo = b.order ?? Infinity;
  if (ao !== bo) return ao - bo;
  return (a.created_date || "").localeCompare(b.created_date || "");
}

function isWelcomeSection(section) {
  if (!section) return false;
  return (section.order ?? 0) === 0 || (section.title || "").toLowerCase().includes("welcome");
}

// Build the canonical flat module order across all content sections.
// Sections by order (Welcome excluded), then modules within each by order.
export function buildCanonicalModuleOrder(sections, modules) {
  const contentSections = [...sections].filter((s) => !isWelcomeSection(s)).sort(sortByOrder);
  const ordered = [];
  for (const section of contentSections) {
    const inSection = modules.filter((m) => m.sectionId === section.id).sort(sortByOrder);
    ordered.push(...inSection);
  }
  return ordered;
}

// Resolve the module a workbook belongs to.
// Prefers the stored module_id; falls back to expert match for any
// workbook not yet backfilled. Returns null if it cannot be resolved.
export function resolveWorkbookModule(workbook, orderedModules) {
  if (!workbook) return null;
  if (workbook.module_id) {
    const byId = orderedModules.find((m) => m.id === workbook.module_id);
    if (byId) return byId;
  }
  if (workbook.expert_id) {
    return orderedModules.find((m) => m.expertId === workbook.expert_id) || null;
  }
  return null;
}

// The next module after this workbook's module, or null if it is the last.
export function getNextModuleForWorkbook(workbook, sections, modules, pages) {
  const orderedModules = buildCanonicalModuleOrder(sections, modules);
  const current = resolveWorkbookModule(workbook, orderedModules);
  if (!current) return null;
  const modulesWithPages = new Set(pages.map((p) => p.moduleId));
  const idx = orderedModules.findIndex((m) => m.id === current.id);
  if (idx < 0) return null;
  return orderedModules.slice(idx + 1).find((m) => modulesWithPages.has(m.id)) || null;
}

// True once the data the resolver needs has loaded. Until this is true,
// continue controls must be disabled, never fired against empty data.
export function isFlowReady(sections, modules, pages) {
  return sections.length > 0 && modules.length > 0 && pages.length > 0;
}