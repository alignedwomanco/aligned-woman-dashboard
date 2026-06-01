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

export function buildCanonicalModuleOrder(sections, modules) {
  const contentSections = [...sections].filter((s) => !isWelcomeSection(s)).sort(sortByOrder);
  const ordered = [];
  for (const section of contentSections) {
    const inSection = modules.filter((m) => m.sectionId === section.id).sort(sortByOrder);
    ordered.push(...inSection);
  }
  return ordered;
}

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

export function getNextModuleForWorkbook(workbook, sections, modules, pages) {
  const orderedModules = buildCanonicalModuleOrder(sections, modules);
  const current = resolveWorkbookModule(workbook, orderedModules);
  if (!current) return null;
  const modulesWithPages = new Set(pages.map((p) => p.moduleId));
  const idx = orderedModules.findIndex((m) => m.id === current.id);
  if (idx < 0) return null;
  return orderedModules.slice(idx + 1).find((m) => modulesWithPages.has(m.id)) || null;
}

export function isFlowReady(sections, modules, pages) {
  return sections.length > 0 && modules.length > 0 && pages.length > 0;
}