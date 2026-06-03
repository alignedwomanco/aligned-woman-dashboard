import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { isPreviewMode } from "@/lib/previewMode";
import { MEMBER_READ_LIMIT } from "@/lib/limits";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  CheckCircle,
  Lock,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import { useCourseAccess } from "@/hooks/useCourseAccess";
import CourseAccessGate from "@/components/classroom/CourseAccessGate";

// ── Phase metadata fallback ──
const PHASE_QUOTES = {
  awareness: "My body is not working against me, it is speaking to me.",
  liberation: "I do not have to live in survival mode anymore.",
  intention: "I think differently, so I choose differently.",
  "intentional action": "I think differently, so I choose differently.",
  vision: "What do I actually want?",
  embodiment: "This is who I am now.",
  "vision & embodiment": "What do I actually want?",
};

const PHASE_LETTERS = {
  awareness: "A",
  liberation: "L",
  intention: "I",
  "intentional action": "I",
  vision: "V",
  embodiment: "E",
  "vision & embodiment": "V",
};

function stripPhasePrefix(t) {
  return (t || "").replace(/^Phase\s+\d+\s*[-:·]\s*/i, "").trim();
}

function getPhaseKey(section) {
  if (!section?.title) return null;
  return stripPhasePrefix(section.title).toLowerCase();
}

function parsePhaseMeta(section, index) {
  // Schema fields first (future-proof)
  if (section.phase_letter && section.phase_name) {
    return {
      letter: section.phase_letter,
      name: section.phase_name,
      tagline: section.tagline || "",
      phaseNum: index + 1,
    };
  }
  const key = getPhaseKey(section);
  const name = stripPhasePrefix(section.title) || "Section";
  return {
    letter: PHASE_LETTERS[key] || String.fromCharCode(65 + index),
    name,
    tagline: PHASE_QUOTES[key] || section.description || "",
    phaseNum: section.order ?? (index + 1),
  };
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function sortByOrder(items) {
  return [...items].sort((a, b) => {
    const ao = a.order ?? 9999;
    const bo = b.order ?? 9999;
    return ao !== bo ? ao - bo : (a.created_date || "").localeCompare(b.created_date || "");
  });
}

/**
 * A module is complete when every page in it has status "completed".
 * Modules with zero pages are treated as complete (placeholder modules
 * like "Assessment" should not block phase progression).
 */
function isModuleComplete(moduleId, pages, progressMap) {
  const modPages = pages.filter((p) => p.moduleId === moduleId);
  if (modPages.length === 0) return true;
  return modPages.every((p) => progressMap[p.id] === "completed");
}

/**
 * Compute the furthest unlocked phase index based on actual page completion.
 * A phase unlocks when ALL modules in EVERY prior phase are complete.
 */
function computeCurrentPhaseIndex(phaseSections, modules, pages, progressMap) {
  let unlocked = 0;
  for (let i = 0; i < phaseSections.length; i++) {
    const sectionMods = modules.filter((m) => m.sectionId === phaseSections[i].id);
    if (sectionMods.length === 0) {
      if (i >= unlocked) unlocked = i + 1;
      continue;
    }
    const allComplete = sectionMods.every((mod) =>
      isModuleComplete(mod.id, pages, progressMap)
    );
    if (allComplete) {
      unlocked = i + 1;
    } else {
      return i;
    }
  }
  return Math.max(0, phaseSections.length - 1);
}

function buildPlayerUrl(moduleId, pageId, courseId) {
  let url = createPageUrl("ModulePlayer") + `?moduleId=${moduleId}`;
  if (courseId) url += `&courseId=${courseId}`;
  if (pageId) url += `&pageId=${pageId}`;
  return url;
}

// ── Component-scoped CSS ──
const PAGE_CSS = `
/* ═══ COURSE DETAIL: COMPACT RESPONSIVE ═══ */

.cd-hero {
  position: relative;
  background: linear-gradient(160deg, #0E0208 0%, #1A0510 35%, #4A0E2E 65%, #1A0510 100%);
  border-radius: var(--aw-radius-md, 10px);
  overflow: hidden; color: #fff;
  padding: 28px 36px;
  display: grid; grid-template-columns: minmax(0, 1fr) auto;
  gap: 40px; align-items: center;
  box-shadow: 0 10px 28px rgba(8,1,5,0.16);
}
.cd-hero__watermark {
  position: absolute; right: -20px; top: 50%;
  transform: translateY(-50%);
  font-family: var(--aw-font-display, 'DM Serif Display', Georgia, serif);
  font-style: italic; font-weight: 400;
  font-size: 180px; line-height: 0.9;
  color: rgba(232,180,174,0.06);
  letter-spacing: -0.04em;
  pointer-events: none; white-space: nowrap;
}
.cd-hero__eyebrow {
  font-family: var(--aw-font-sans, 'Montserrat', sans-serif);
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.28em; text-transform: uppercase;
  color: #E8B4AE; margin-bottom: 10px;
}
.cd-hero__title {
  font-family: var(--aw-font-display, 'DM Serif Display', Georgia, serif);
  font-weight: 400; font-size: clamp(28px, 3.4vw, 44px);
  line-height: 1; letter-spacing: -0.01em;
  margin: 0 0 8px; color: #fff;
}
.cd-hero__title em { font-style: italic; color: #E8B4AE; }
.cd-hero__sub {
  font-family: var(--aw-font-sans, 'Montserrat', sans-serif);
  font-size: 11px; font-weight: 500;
  letter-spacing: 0.22em; text-transform: uppercase;
  color: rgba(255,255,255,0.55); margin: 0;
}
.cd-hero__right {
  position: relative; z-index: 1;
  display: flex; flex-direction: column;
  gap: 14px; min-width: 300px; align-items: stretch;
}
.cd-hero__progress-row {
  display: flex; align-items: baseline;
  justify-content: space-between; margin-bottom: 8px;
}
.cd-hero__progress-label {
  font-family: var(--aw-font-sans, 'Montserrat', sans-serif);
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.26em; text-transform: uppercase;
  color: rgba(255,255,255,0.6);
}
.cd-hero__progress-pct {
  font-family: var(--aw-font-display, 'DM Serif Display', Georgia, serif);
  font-style: italic; font-weight: 400;
  font-size: 26px; color: #E8B4AE; line-height: 1;
}
.cd-hero__progress-bar {
  height: 3px; background: rgba(255,255,255,0.1);
  border-radius: 100px; overflow: hidden;
}
.cd-hero__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #A86460, #E8B4AE);
  transition: width 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.cd-hero__cta {
  font-family: var(--aw-font-sans, 'Montserrat', sans-serif);
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.2em; text-transform: uppercase;
  background: #C4847A; color: #0E0208;
  padding: 14px 22px; border: none; border-radius: 100px;
  cursor: pointer;
  display: inline-flex; align-items: center;
  justify-content: center; gap: 10px;
  transition: all 0.32s cubic-bezier(0.2, 0.7, 0.2, 1);
  text-decoration: none;
}
.cd-hero__cta:hover { background: #fff; color: #4A0E2E; }
.cd-hero__cta-mobile { display: none; }

/* ── PHASE TABS (desktop) ── */
.cd-tabs {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px;
}
.cd-tab {
  display: grid; grid-template-columns: 48px 1fr;
  gap: 12px; align-items: center;
  padding: 12px 14px;
  background: #fff; border: 1px solid rgba(74,14,46,0.08);
  border-radius: 10px; cursor: pointer;
  text-align: left; font-family: inherit;
  transition: all 0.18s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.cd-tab:hover { border-color: rgba(196,132,122,0.25); background: #FDF5F3; }
.cd-tab.is-active {
  background: #4A0E2E; border-color: #4A0E2E;
  box-shadow: 0 8px 22px rgba(74,14,46,0.18);
}
.cd-tab__letter {
  font-family: var(--aw-font-display, 'DM Serif Display', Georgia, serif);
  font-style: italic; font-weight: 400;
  font-size: 40px; color: #C4847A;
  line-height: 0.9; text-align: center; letter-spacing: -0.04em;
}
.cd-tab.is-done .cd-tab__letter { color: rgba(196,132,122,0.6); }
.cd-tab.is-active .cd-tab__letter { color: #E8B4AE; }
.cd-tab__body { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.cd-tab__head {
  display: flex; align-items: center; gap: 6px;
  font-family: var(--aw-font-sans, 'Montserrat', sans-serif);
  font-size: 9px; font-weight: 700;
  letter-spacing: 0.24em; text-transform: uppercase; color: #8A7A76;
}
.cd-tab.is-active .cd-tab__head { color: rgba(255,255,255,0.5); }
.cd-tab__status-check { width: 12px; height: 12px; color: #A86460; }
.cd-tab.is-active .cd-tab__status-check { color: #E8B4AE; }
.cd-tab__dot {
  width: 6px; height: 6px; border-radius: 100px;
  background: #C4847A;
  box-shadow: 0 0 0 3px rgba(196,132,122,0.2);
  animation: cd-pulse 2s ease-in-out infinite;
}
.cd-tab.is-active .cd-tab__dot {
  background: #E8B4AE; box-shadow: 0 0 0 3px rgba(232,180,174,0.25);
}
@keyframes cd-pulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(196,132,122,0.2); }
  50% { box-shadow: 0 0 0 6px rgba(196,132,122,0); }
}
.cd-tab__name {
  font-family: var(--aw-font-display, 'DM Serif Display', Georgia, serif);
  font-weight: 400; font-size: 17px; line-height: 1.05;
  color: #4A0E2E; letter-spacing: -0.005em;
}
.cd-tab.is-active .cd-tab__name { color: #fff; }
.cd-tab.is-done .cd-tab__name { color: #8A7A76; }
.cd-tab__pct { display: flex; align-items: center; gap: 8px; margin-top: 5px; }
.cd-tab__bar {
  flex: 1; height: 3px; background: rgba(74,14,46,0.08);
  border-radius: 100px; overflow: hidden;
}
.cd-tab.is-active .cd-tab__bar { background: rgba(255,255,255,0.12); }
.cd-tab__bar-fill { display: block; height: 100%; background: #C4847A; transition: width 0.4s ease; }
.cd-tab.is-active .cd-tab__bar-fill { background: #E8B4AE; }
.cd-tab__pctnum {
  font-family: var(--aw-font-sans, 'Montserrat', sans-serif);
  font-size: 9px; font-weight: 700; letter-spacing: 0.18em;
  color: #8A7A76; width: 30px; text-align: right;
}
.cd-tab.is-active .cd-tab__pctnum { color: rgba(255,255,255,0.6); }

/* ── MOBILE PHASE PILLS ── */
.cd-pills-wrap { display: none; }

/* ── CONTENT GRID ── */
.cd-content {
  display: grid; grid-template-columns: minmax(0, 1fr) 320px;
  gap: 28px; align-items: start;
}

/* ── DETAIL PANE ── */
.cd-detail {
  background: #fff; border: 1px solid rgba(74,14,46,0.08);
  border-radius: 10px; padding: 24px 28px 20px;
}
.cd-detail__head {
  display: grid; grid-template-columns: 90px 1fr;
  gap: 16px; align-items: center;
  padding-bottom: 18px; margin-bottom: 16px;
  border-bottom: 1px solid rgba(74,14,46,0.08);
}
.cd-detail__letterwrap {
  display: flex; align-items: center; justify-content: center;
  background: #FDF5F3; border-radius: 10px; padding: 12px 8px;
}
.cd-detail__letter {
  font-family: var(--aw-font-display, 'DM Serif Display', Georgia, serif);
  font-style: italic; font-weight: 400;
  font-size: 58px; line-height: 0.8;
  color: #C4847A; letter-spacing: -0.04em;
}
.cd-detail__eyebrow {
  font-family: var(--aw-font-sans, 'Montserrat', sans-serif);
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.26em; text-transform: uppercase;
  color: #4A0E2E; margin-bottom: 6px;
}
.cd-detail__quote {
  font-family: var(--aw-font-display, 'DM Serif Display', Georgia, serif);
  font-style: italic; font-weight: 400;
  font-size: clamp(20px, 2.2vw, 28px); line-height: 1.15;
  letter-spacing: -0.005em; color: #4A0E2E; margin: 0;
}
.cd-detail__modules { display: flex; flex-direction: column; gap: 8px; }

/* ── MODULE ── */
.cd-mod {
  background: #FAF5F3; border: 1px solid rgba(74,14,46,0.08);
  border-radius: 6px; overflow: hidden;
  transition: all 0.18s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.cd-mod.is-current { border-color: rgba(196,132,122,0.25); background: #FDF5F3; }
.cd-mod.is-locked { opacity: 0.85; }
.cd-mod.is-open { background: #fff; }
.cd-mod.is-current.is-open { background: #FDF5F3; }
.cd-mod__head {
  display: grid; grid-template-columns: 36px 1fr auto;
  align-items: center; gap: 14px;
  width: 100%; padding: 14px 18px;
  background: transparent; border: none;
  cursor: pointer; text-align: left; font-family: inherit;
}
.cd-mod.is-locked .cd-mod__head { cursor: not-allowed; }
.cd-mod__num {
  font-family: var(--aw-font-sans, 'Montserrat', sans-serif);
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.22em; text-transform: uppercase; color: #8A7A76;
}
.cd-mod.is-locked .cd-mod__num { color: #C8B8B4; }
.cd-mod__title {
  font-family: var(--aw-font-display, 'DM Serif Display', Georgia, serif);
  font-weight: 400; font-size: 15px; line-height: 1.25; color: #4A0E2E;
}
.cd-mod.is-locked .cd-mod__title { color: #C8B8B4; }
.cd-mod__status { display: flex; align-items: center; gap: 10px; }
.cd-mod__currentpill {
  font-family: var(--aw-font-sans, 'Montserrat', sans-serif);
  font-size: 9px; font-weight: 700;
  letter-spacing: 0.2em; text-transform: uppercase;
  background: #fff; color: #A86460;
  padding: 4px 10px; border-radius: 100px;
  line-height: 1; border: 1px solid rgba(196,132,122,0.25);
  white-space: nowrap;
}
.cd-mod__locknote {
  padding: 0 18px 14px;
  font-family: var(--aw-font-sans, 'Montserrat', sans-serif);
  font-size: 12px; font-style: italic; color: #8A7A76; margin-top: -4px;
}
.cd-mod__locknote strong { font-style: normal; font-weight: 600; color: #4A0E2E; }
.cd-mod__body { padding: 0 10px 8px; display: flex; flex-direction: column; }

/* ── LESSON ROW ── */
.cd-lesson {
  display: grid; grid-template-columns: 26px 1fr auto;
  align-items: center; gap: 12px;
  padding: 10px 10px; text-decoration: none;
  border-bottom: 1px solid rgba(74,14,46,0.08);
  border-radius: 6px; cursor: pointer;
  transition: background 0.15s ease;
}
.cd-lesson:last-of-type { border-bottom: none; }
.cd-lesson:hover { background: rgba(196,132,122,0.06); }
.cd-lesson.is-locked { opacity: 0.6; cursor: not-allowed; }
.cd-lesson.is-locked:hover { background: transparent; }
.cd-lesson.is-current { background: rgba(196,132,122,0.08); }
.cd-lesson__num {
  font-family: var(--aw-font-display, 'DM Serif Display', Georgia, serif);
  font-style: italic; font-weight: 400;
  font-size: 16px; color: #C4847A; line-height: 1; text-align: center;
}
.cd-lesson.is-completed .cd-lesson__num,
.cd-lesson.is-locked .cd-lesson__num { color: #C8B8B4; }
.cd-lesson.is-current .cd-lesson__num { color: #4A0E2E; }
.cd-lesson__title {
  font-family: var(--aw-font-sans, 'Montserrat', sans-serif);
  font-size: 13px; font-weight: 500; color: #4A0E2E; line-height: 1.4;
}
.cd-lesson.is-completed .cd-lesson__title { color: #8A7A76; font-weight: 400; }
.cd-lesson.is-current .cd-lesson__title { font-weight: 600; }
.cd-lesson__pill {
  font-family: var(--aw-font-sans, 'Montserrat', sans-serif);
  font-size: 9px; font-weight: 700;
  letter-spacing: 0.18em; text-transform: uppercase;
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 10px; border-radius: 100px;
  line-height: 1; white-space: nowrap;
}
.cd-lesson__pill--done { color: #A86460; padding-left: 0; }
.cd-lesson__pill--cta { background: #4A0E2E; color: #fff; padding: 7px 12px; }
.cd-lesson__pill--avail { color: #8A7A76; border: 1px solid rgba(74,14,46,0.08); }
.cd-lesson__pill--locked { color: #C8B8B4; padding-left: 0; }

/* ── WORKBOOK ── */
.cd-wb {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 8px 12px; background: #FDF5F3;
  border: 1px solid rgba(196,132,122,0.25);
  border-radius: 100px; margin: 6px 0 4px 10px;
  text-decoration: none; width: fit-content;
  cursor: pointer; transition: background 0.15s ease;
}
.cd-wb:hover { background: #F5DDD9; }
.cd-wb__title {
  font-family: var(--aw-font-display, 'DM Serif Display', Georgia, serif);
  font-weight: 400; font-size: 13px; color: #4A0E2E;
}
.cd-wb__label {
  font-family: var(--aw-font-sans, 'Montserrat', sans-serif);
  font-size: 8px; font-weight: 700;
  letter-spacing: 0.22em; text-transform: uppercase;
  color: #A86460; padding-left: 10px;
  border-left: 1px solid rgba(196,132,122,0.25);
}

/* ── UP-NEXT CARD ── */
.cd-next {
  position: sticky; top: 24px;
  background: linear-gradient(160deg, #0E0208 0%, #1A0510 35%, #4A0E2E 65%, #1A0510 100%);
  color: #fff; border-radius: 10px;
  padding: 24px 24px 22px;
  box-shadow: 0 10px 28px rgba(8,1,5,0.18);
}
.cd-next__eyebrow {
  font-family: var(--aw-font-sans, 'Montserrat', sans-serif);
  font-size: 9px; font-weight: 700;
  letter-spacing: 0.28em; text-transform: uppercase;
  color: #E8B4AE; margin-bottom: 14px;
}
.cd-next__module {
  font-family: var(--aw-font-display, 'DM Serif Display', Georgia, serif);
  font-style: italic; font-weight: 400;
  font-size: 20px; color: rgba(232,180,174,0.85);
  line-height: 1; margin-bottom: 8px;
}
.cd-next__title {
  font-family: var(--aw-font-display, 'DM Serif Display', Georgia, serif);
  font-weight: 400; font-size: 18px; line-height: 1.2;
  color: #fff; margin: 0 0 18px;
}
.cd-next__cta {
  width: 100%;
  font-family: var(--aw-font-sans, 'Montserrat', sans-serif);
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.22em; text-transform: uppercase;
  background: #C4847A; color: #0E0208;
  padding: 14px 18px; border: none; border-radius: 100px;
  cursor: pointer;
  display: inline-flex; align-items: center;
  justify-content: center; gap: 10px;
  transition: all 0.32s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.cd-next__cta:hover { background: #fff; color: #4A0E2E; }

/* ── FOOTER ── */
.cd-foot {
  margin-top: 40px; padding: 22px 0;
  border-top: 1px solid rgba(74,14,46,0.08);
  display: flex; justify-content: space-between; align-items: center;
  font-family: var(--aw-font-sans, 'Montserrat', sans-serif);
  font-size: 9px; font-weight: 700;
  letter-spacing: 0.22em; text-transform: uppercase; color: #C8B8B4;
}
.cd-foot a { color: #4A0E2E; text-decoration: none; border: none; }

/* ── SKELETON ── */
.cd-skel { border-radius: 10px; overflow: hidden; }
.cd-skel__shimmer {
  background: linear-gradient(90deg, #f0e8e4 25%, #f7efec 50%, #f0e8e4 75%);
  background-size: 200% 100%;
  animation: cd-shimmer 1.5s ease-in-out infinite;
}
@keyframes cd-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ═══ RESPONSIVE ═══ */
@media (max-width: 1280px) {
  .cd-content { grid-template-columns: 1fr; }
  .cd-next { position: static; }
}
@media (max-width: 1100px) {
  .cd-tab { padding: 10px 10px; gap: 8px; }
  .cd-tab__letter { font-size: 34px; }
  .cd-tab__name { font-size: 14px; }
}
@media (max-width: 768px) {
  .cd-hero {
    grid-template-columns: 1fr; gap: 20px; padding: 24px 22px;
  }
  .cd-hero__watermark { display: none; }
  .cd-hero__right { min-width: 0; }
  .cd-hero__title { font-size: 30px; }
  .cd-hero__sub { display: none; }
  .cd-hero__cta { display: none; }
  .cd-hero__cta-mobile {
    display: grid; grid-template-columns: 1fr auto;
    align-items: center; gap: 12px; width: 100%;
    font-family: var(--aw-font-sans, 'Montserrat', sans-serif);
    background: #C4847A; color: #0E0208;
    padding: 12px 18px; border: none; border-radius: 100px;
    cursor: pointer; text-align: left;
  }
  .cd-hero__cta-sub {
    font-size: 8px; font-weight: 700;
    letter-spacing: 0.26em; text-transform: uppercase;
    opacity: 0.55; margin-bottom: 2px; line-height: 1;
  }
  .cd-hero__cta-main {
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.18em; text-transform: uppercase; line-height: 1;
  }
  .cd-tabs { display: none; }
  .cd-pills-wrap { display: block; margin-top: 20px; }
  .cd-pills-label {
    font-family: var(--aw-font-sans, 'Montserrat', sans-serif);
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.28em; text-transform: uppercase;
    color: #8A7A76; padding-bottom: 10px;
    border-bottom: 1px solid rgba(74,14,46,0.08); margin-bottom: 10px;
  }
  .cd-pills {
    display: flex; gap: 8px; overflow-x: auto;
    padding-bottom: 6px; scrollbar-width: none;
    -webkit-overflow-scrolling: touch; scroll-snap-type: x mandatory;
  }
  .cd-pills::-webkit-scrollbar { display: none; }
  .cd-pill {
    flex-shrink: 0; width: 130px;
    display: grid; grid-template-columns: 30px 1fr;
    grid-template-rows: auto auto;
    gap: 6px 10px; align-items: center;
    padding: 10px 12px;
    background: #fff; border: 1px solid rgba(74,14,46,0.08);
    border-radius: 10px; cursor: pointer;
    font-family: inherit; text-align: left;
    scroll-snap-align: center;
  }
  .cd-pill.is-active { background: #4A0E2E; border-color: #4A0E2E; }
  .cd-pill__letter {
    font-family: var(--aw-font-display, 'DM Serif Display', Georgia, serif);
    font-style: italic; font-weight: 400;
    font-size: 28px; color: #C4847A;
    line-height: 0.9; grid-row: 1 / span 2;
    text-align: center; letter-spacing: -0.04em;
  }
  .cd-pill.is-active .cd-pill__letter { color: #E8B4AE; }
  .cd-pill.is-done .cd-pill__letter { color: rgba(196,132,122,0.55); }
  .cd-pill__num {
    font-family: var(--aw-font-sans, 'Montserrat', sans-serif);
    font-size: 8px; font-weight: 700;
    letter-spacing: 0.22em; text-transform: uppercase; color: #8A7A76;
  }
  .cd-pill.is-active .cd-pill__num { color: rgba(255,255,255,0.55); }
  .cd-pill__name {
    font-family: var(--aw-font-display, 'DM Serif Display', Georgia, serif);
    font-weight: 400; font-size: 14px;
    color: #4A0E2E; line-height: 1.05;
  }
  .cd-pill.is-active .cd-pill__name { color: #fff; }
  .cd-pill.is-done .cd-pill__name { color: #8A7A76; }
  .cd-pill__bar {
    grid-column: 1 / -1; height: 2px;
    background: rgba(74,14,46,0.08);
    border-radius: 100px; overflow: hidden; margin-top: 4px;
  }
  .cd-pill.is-active .cd-pill__bar { background: rgba(255,255,255,0.12); }
  .cd-pill__bar-fill { display: block; height: 100%; background: #C4847A; }
  .cd-pill.is-active .cd-pill__bar-fill { background: #E8B4AE; }
  .cd-detail { padding: 18px 16px; border: none; background: transparent; }
  .cd-detail__head { grid-template-columns: 64px 1fr; gap: 14px; }
  .cd-detail__letter { font-size: 46px; }
  .cd-detail__letterwrap { height: 64px; padding: 10px; }
  .cd-detail__quote { font-size: 19px; }
  .cd-mod__head { padding: 14px 14px; gap: 12px; grid-template-columns: 32px 1fr auto; }
  .cd-mod__title { font-size: 14px; }
  .cd-lesson { grid-template-columns: 26px 1fr; gap: 10px; padding: 10px 8px; }
  .cd-lesson__title { font-size: 12.5px; }
  .cd-lesson__meta { margin-top: 6px; }
  .cd-wb {
    display: grid; grid-template-columns: 20px 1fr auto;
    gap: 12px; width: auto; margin: 8px 0 4px;
    padding: 12px 14px; border-radius: 10px;
  }
}
`;

// ── Main Component ──
export default function CourseDetail() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const courseId = searchParams.get("courseId") || searchParams.get("id");
  const phaseParam = searchParams.get("phase");
  const isNewUserPreview = searchParams.get("preview") === "new_user";

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [modules, setModules] = useState([]);
  const [pages, setPages] = useState([]);
  const [progress, setProgress] = useState([]);
  const [profile, setProfile] = useState(null);
  const [workbooks, setWorkbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const pillsRef = useRef(null);

  const { hasAccess, isLoading: accessLoading } = useCourseAccess(course);

  // ── Data loading (preserved from live code) ──
  useEffect(() => {
    if (!courseId) { setLoading(false); return; }
    const loadData = async () => {
      try {
        const me = await base44.auth.me();
        const email = me?.email?.toLowerCase();

        const allCourses = await base44.entities.Course.list();
        setCourse(allCourses.find((c) => c.id === courseId));

        const rawSections = await base44.entities.CourseSection.filter({ courseId }, "order", MEMBER_READ_LIMIT);
        setSections(sortByOrder(rawSections));

        const rawModules = await base44.entities.CourseModule.filter({ courseId }, "order", MEMBER_READ_LIMIT);
        setModules(sortByOrder(rawModules));

        const rawPages = await base44.entities.CoursePage.filter({ courseId }, "order", MEMBER_READ_LIMIT);
        setPages(rawPages.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));

        if (email && !isNewUserPreview && !isPreviewMode()) {
          const prog = await base44.entities.CourseProgress.filter({ created_by: email }, "-created_date", 500);
          setProgress(prog);
          const profileArr = await base44.entities.MemberProfile.filter(
            { user_id: me.id }, "-created_date", 1
          );
          setProfile(profileArr[0] ?? null);
        }

        const wb = await base44.entities.Workbook.filter({ course_id: courseId });
        setWorkbooks(wb);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    const unsubSections = base44.entities.CourseSection.subscribe((event) => {
      if (event.data?.courseId === courseId) {
        base44.entities.CourseSection.filter({ courseId }, "order", MEMBER_READ_LIMIT).then((s) =>
          setSections(sortByOrder(s))
        );
      }
    });
    const unsubModules = base44.entities.CourseModule.subscribe((event) => {
      if (event.data?.courseId === courseId) {
        base44.entities.CourseModule.filter({ courseId }, "order", MEMBER_READ_LIMIT).then((m) =>
          setModules(sortByOrder(m))
        );
      }
    });
    return () => { unsubSections(); unsubModules(); };
  }, [courseId]);

  // ── Build progressMap: pageId -> status ──
  // When duplicate CourseProgress records exist for the same pageId
  // (caused by records created with different or null moduleId), the
  // most recently updated record must win so completions are not hidden.
  const progressMap = useMemo(() => {
    const map = {};
    const dateMap = {};
    progress.forEach((p) => {
      if (!p.pageId) return;
      const pDate = p.updated_date || p.created_date || "";
      if (!map[p.pageId] || pDate > (dateMap[p.pageId] || "")) {
        map[p.pageId] = p.status;
        dateMap[p.pageId] = pDate;
      }
    });
    return map;
  }, [progress]);

  // ── Split welcome vs phase sections ──
  const welcomeSection = useMemo(() => {
    return sections.find(
      (s) => s.order === 0 || s.title?.toLowerCase().includes("welcome")
    );
  }, [sections]);

  const phaseSections = useMemo(() => {
    return sections.filter((s) => s.id !== welcomeSection?.id);
  }, [sections, welcomeSection]);

  // ── Compute current phase index from page-level completion ──
  const currentPhaseIndex = useMemo(() => {
    return computeCurrentPhaseIndex(phaseSections, modules, pages, progressMap);
  }, [phaseSections, modules, pages, progressMap]);

  // ── Overall progress ──
  const overallPct = useMemo(() => {
    if (pages.length === 0) return 0;
    const completed = pages.filter((p) => progressMap[p.id] === "completed").length;
    return Math.round((completed / pages.length) * 100);
  }, [pages, progressMap]);

  const isComplete = overallPct >= 100;

  // ── Section progress (for tab percentage) ──
  const getSectionProgress = useCallback((sectionId) => {
    const sectionMods = modules.filter((m) => m.sectionId === sectionId);
    const sectionPages = pages.filter((p) =>
      sectionMods.some((m) => m.id === p.moduleId)
    );
    if (sectionPages.length === 0) return 100;
    const done = sectionPages.filter((p) => progressMap[p.id] === "completed").length;
    return Math.round((done / sectionPages.length) * 100);
  }, [modules, pages, progressMap]);

  // ── Section state ──
  const getSectionState = useCallback((sectionId, idx) => {
    if (idx < currentPhaseIndex) return "completed";
    if (idx === currentPhaseIndex) return "current";
    return "upcoming";
  }, [currentPhaseIndex]);

  // ── Find next lesson (program-wide) ──
  const nextLesson = useMemo(() => {
    for (let si = 0; si < phaseSections.length; si++) {
      if (si > currentPhaseIndex) break;
      const sectionMods = sortByOrder(modules.filter((m) => m.sectionId === phaseSections[si].id));
      for (let mi = 0; mi < sectionMods.length; mi++) {
        const mod = sectionMods[mi];
        if (mi > 0 && !isModuleComplete(sectionMods[mi - 1].id, pages, progressMap)) break;
        const modPages = pages.filter((p) => p.moduleId === mod.id).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        for (const page of modPages) {
          if (progressMap[page.id] !== "completed") {
            return { page, module: mod, section: phaseSections[si], sectionIdx: si };
          }
        }
      }
    }
    return null;
  }, [phaseSections, modules, pages, progressMap, currentPhaseIndex]);

  // ── Find next lesson within active phase ──
  const activePhaseNextLesson = useMemo(() => {
    if (phaseSections.length === 0) return null;
    const section = phaseSections[activeTabIdx];
    if (!section) return null;
    const sectionMods = sortByOrder(modules.filter((m) => m.sectionId === section.id));
    for (let mi = 0; mi < sectionMods.length; mi++) {
      const mod = sectionMods[mi];
      if (mi > 0 && !isModuleComplete(sectionMods[mi - 1].id, pages, progressMap)) break;
      const modPages = pages.filter((p) => p.moduleId === mod.id).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      for (const page of modPages) {
        if (progressMap[page.id] !== "completed") {
          return { page, module: mod };
        }
      }
    }
    return null;
  }, [activeTabIdx, phaseSections, modules, pages, progressMap]);

  // ── Set initial tab from ?phase= or current phase ──
  useEffect(() => {
    if (phaseSections.length === 0) return;
    if (phaseParam) {
      const idx = phaseSections.findIndex((s) => {
        const meta = parsePhaseMeta(s, phaseSections.indexOf(s));
        return meta.letter === phaseParam.toUpperCase();
      });
      if (idx >= 0) { setActiveTabIdx(idx); return; }
    }
    setActiveTabIdx(currentPhaseIndex);
  }, [phaseSections, phaseParam, currentPhaseIndex]);

  // ── Tab change with URL sync ──
  const handleTabChange = useCallback((idx) => {
    // Clamp to latest unlocked phase
    const clamped = Math.min(idx, currentPhaseIndex);
    setActiveTabIdx(clamped);
    const meta = parsePhaseMeta(phaseSections[clamped], clamped);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("phase", meta.letter);
      return next;
    }, { replace: true });
  }, [phaseSections, currentPhaseIndex, setSearchParams]);

  // ── Scroll active pill into view on mobile ──
  useEffect(() => {
    const el = pillsRef.current?.querySelector(".cd-pill.is-active");
    if (el) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeTabIdx]);

  // ── Navigate to lesson ──
  const goToLesson = useCallback((page, mod) => {
    if (!page || !mod) return;
    navigate(buildPlayerUrl(mod.id, page.id, courseId));
  }, [courseId, navigate]);

  // ── Loading: skeleton ──
  if (loading || accessLoading) {
    return (
      <div className="min-h-screen" style={{ background: "var(--aw-off-white, #FAF5F3)" }}>
        <style>{PAGE_CSS}</style>
        <div className="mx-auto px-4 sm:px-6 lg:px-10 py-6" style={{ maxWidth: 1480 }}>
          <div className="cd-skel cd-skel__shimmer" style={{ height: 140, marginBottom: 20 }} />
          <div className="flex gap-2.5">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="cd-skel cd-skel__shimmer flex-1" style={{ height: 90 }} />
            ))}
          </div>
          <div className="cd-skel cd-skel__shimmer" style={{ height: 400, marginTop: 20 }} />
        </div>
      </div>
    );
  }

  if (!courseId || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--aw-off-white, #FAF5F3)" }}>
        <p style={{ fontFamily: "var(--aw-font-sans)", color: "#8A7A76" }}>Course not found.</p>
      </div>
    );
  }

  const activePhaseSection = phaseSections[activeTabIdx] || null;

  // Hero CTA logic
  let heroCTACopy = "Begin Course";
  if (nextLesson) {
    heroCTACopy = `Continue · ${nextLesson.page.title?.split(":")[0] || "Lesson"}`;
  } else if (isComplete) {
    heroCTACopy = "Revisit the Blueprint";
  }

  const handleHeroCTA = () => {
    if (nextLesson) {
      goToLesson(nextLesson.page, nextLesson.module);
    } else if (isComplete && phaseSections.length > 0) {
      // Revisit from the beginning: first phase, first module, first lesson.
      const firstSection = phaseSections[0];
      const firstMods = sortByOrder(modules.filter((m) => m.sectionId === firstSection.id));
      const firstMod = firstMods[0];
      if (firstMod) {
        const firstPages = pages.filter((p) => p.moduleId === firstMod.id).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        const firstPage = firstPages[0];
        if (firstPage) {
          goToLesson(firstPage, firstMod);
        } else {
          navigate(buildPlayerUrl(firstMod.id, null, courseId));
        }
      }
    } else if (modules[0]) {
      navigate(buildPlayerUrl(modules[0].id, null, courseId));
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--aw-off-white, #FAF5F3)" }}>
      <style>{PAGE_CSS}</style>

      <div className="mx-auto px-4 sm:px-6 lg:px-10 py-6" style={{ maxWidth: 1480 }}>
        {/* Admin preview banner */}
        {isNewUserPreview && (
          <div style={{ marginBottom: 16, background: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: 8, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <span style={{ fontFamily: "var(--aw-font-sans)", fontSize: 12, fontWeight: 700, color: "#92400E", letterSpacing: "0.1em" }}>
              ADMIN PREVIEW · New user (zero progress)
            </span>
            <button
              onClick={() => setSearchParams((prev) => { const next = new URLSearchParams(prev); next.delete("preview"); return next; }, { replace: true })}
              style={{ fontFamily: "var(--aw-font-sans)", fontSize: 11, fontWeight: 700, color: "#92400E", background: "transparent", border: "1px solid #FCD34D", borderRadius: 100, padding: "4px 12px", cursor: "pointer" }}
            >
              Exit Preview
            </button>
          </div>
        )}

        {/* Back link */}
        <Link to={createPageUrl("Classroom")}
          className="inline-flex items-center gap-2 mb-5"
          style={{
            fontFamily: "var(--aw-font-sans)", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.22em", textTransform: "uppercase",
            color: "#8A7A76", textDecoration: "none", border: "none",
          }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Classroom
        </Link>

        {/* Access gate */}
        {!hasAccess && !previewMode ? (
          <div className="max-w-2xl mx-auto mt-8">
            <CourseAccessGate course={course} onPreview={() => setPreviewMode(true)} />
          </div>
        ) : (
          <div className="flex flex-col" style={{ gap: 20 }}>
            {/* HERO */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="cd-hero">
                <div className="cd-hero__watermark" aria-hidden="true">BLUEPRINT</div>
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div className="cd-hero__eyebrow">
                    {course.title || "Aligned Woman Blueprint"} · {phaseSections.length} Phases
                  </div>
                  <h1 className="cd-hero__title">
                    Aligned <em>Woman</em> {course.title?.replace(/Aligned\s*Woman\s*/i, "") || "Blueprint"}
                  </h1>
                  <p className="cd-hero__sub">
                    {course.description || "Psychology · Money · Health · Identity · Leadership"}
                  </p>
                </div>
                <div className="cd-hero__right">
                  <div>
                    <div className="cd-hero__progress-row">
                      <span className="cd-hero__progress-label">Your Progress</span>
                      <span className="cd-hero__progress-pct">{overallPct}%</span>
                    </div>
                    <div className="cd-hero__progress-bar">
                      <div className="cd-hero__progress-fill" style={{ width: `${overallPct}%` }} />
                    </div>
                  </div>
                  <button className="cd-hero__cta" onClick={handleHeroCTA}>
                    {heroCTACopy} <ArrowRight className="w-4 h-4" />
                  </button>
                  <button className="cd-hero__cta-mobile" onClick={handleHeroCTA}>
                    <div>
                      <div className="cd-hero__cta-sub">
                        {nextLesson ? `Continue · Lesson ${pad(pages.filter((p) => p.moduleId === nextLesson.module.id).sort((a,b) => (a.order??0)-(b.order??0)).findIndex((p) => p.id === nextLesson.page.id) + 1)}` : heroCTACopy}
                      </div>
                      <div className="cd-hero__cta-main">
                        {nextLesson ? nextLesson.page.title?.split(":")[0] || "Lesson" : "Start"}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4" style={{ gridRow: "1 / span 2" }} />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* DESKTOP PHASE TABS */}
            {phaseSections.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                <div className="cd-tabs" role="tablist">
                  {phaseSections.map((section, idx) => {
                    const meta = parsePhaseMeta(section, idx);
                    const active = idx === activeTabIdx;
                    const state = getSectionState(section.id, idx);
                    const done = state === "completed";
                    const current = state === "current";
                    const isLocked = state === "upcoming";
                    const pct = getSectionProgress(section.id);
                    return (
                      <button key={section.id} role="tab" aria-selected={active}
                        className={["cd-tab", active && "is-active", done && "is-done"].filter(Boolean).join(" ")}
                        onClick={() => handleTabChange(idx)}
                        style={isLocked && !active ? { opacity: 0.5 } : undefined}>
                        <span className="cd-tab__letter">{meta.letter}</span>
                        <span className="cd-tab__body">
                          <span className="cd-tab__head">
                            <span>Phase {meta.phaseNum}</span>
                            {done && <CheckCircle className="cd-tab__status-check" />}
                            {current && !done && <span className="cd-tab__dot" />}
                            {isLocked && <Lock className="w-2.5 h-2.5" style={{ color: "#C8B8B4" }} />}
                          </span>
                          <span className="cd-tab__name">{meta.name}</span>
                          <span className="cd-tab__pct">
                            <span className="cd-tab__bar">
                              <span className="cd-tab__bar-fill" style={{ width: `${pct}%` }} />
                            </span>
                            <span className="cd-tab__pctnum">{pct}%</span>
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* MOBILE PHASE PILLS */}
            {phaseSections.length > 0 && (
              <div className="cd-pills-wrap">
                <div className="cd-pills-label">Phases</div>
                <div className="cd-pills" ref={pillsRef}>
                  {phaseSections.map((section, idx) => {
                    const meta = parsePhaseMeta(section, idx);
                    const active = idx === activeTabIdx;
                    const state = getSectionState(section.id, idx);
                    const done = state === "completed";
                    const isLocked = state === "upcoming";
                    const pct = getSectionProgress(section.id);
                    return (
                      <button key={section.id}
                        className={["cd-pill", active && "is-active", done && "is-done"].filter(Boolean).join(" ")}
                        onClick={() => handleTabChange(idx)}
                        style={isLocked && !active ? { opacity: 0.5 } : undefined}>
                        <span className="cd-pill__letter">{meta.letter}</span>
                        <span style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
                          <span className="cd-pill__num">
                            P{meta.phaseNum}{done ? " \u2713" : ""}{state === "current" ? " \u00b7" : ""}{isLocked ? " \uD83D\uDD12" : ""}
                          </span>
                          <span className="cd-pill__name">{meta.name}</span>
                        </span>
                        <span className="cd-pill__bar">
                          <span className="cd-pill__bar-fill" style={{ width: `${pct}%` }} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CONTENT: Detail + Up Next */}
            {activePhaseSection && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} key={activeTabIdx}>
                <div className="cd-content">
                  <PhaseDetailPane
                    section={activePhaseSection}
                    phaseIdx={activeTabIdx}
                    modules={modules}
                    pages={pages}
                    progressMap={progressMap}
                    workbooks={workbooks}
                    courseId={courseId}
                    currentPhaseIndex={currentPhaseIndex}
                    goToLesson={goToLesson}
                    navigate={navigate}
                  />
                  {activePhaseNextLesson && activeTabIdx <= currentPhaseIndex && (
                    <UpNextCard
                      phaseSection={activePhaseSection}
                      phaseIdx={activeTabIdx}
                      lesson={activePhaseNextLesson}
                      goToLesson={goToLesson}
                    />
                  )}
                </div>
              </motion.div>
            )}

            {phaseSections.length === 0 && (
              <div className="text-center py-16">
                <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: "#C8B8B4" }} />
                <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 14, color: "#8A7A76" }}>
                  No course sections available yet.
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="cd-foot">
              <span>{course.title || "Aligned Woman Blueprint"} · {overallPct}%</span>
              <Link to={createPageUrl("Classroom")} style={{ border: "none" }}>All Courses &rarr;</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Phase Detail Pane ──
function PhaseDetailPane({
  section, phaseIdx, modules, pages, progressMap,
  workbooks, courseId, currentPhaseIndex, goToLesson, navigate,
}) {
  const meta = parsePhaseMeta(section, phaseIdx);
  const sectionMods = sortByOrder(modules.filter((m) => m.sectionId === section.id));
  const isPhaseAccessible = phaseIdx <= currentPhaseIndex;

  return (
    <div className="cd-detail">
      <div className="cd-detail__head">
        <div className="cd-detail__letterwrap">
          <span className="cd-detail__letter">{meta.letter}</span>
        </div>
        <div>
          <div className="cd-detail__eyebrow">Phase {meta.phaseNum} · {meta.name}</div>
          {meta.tagline && (
            <h2 className="cd-detail__quote">&ldquo;{meta.tagline}&rdquo;</h2>
          )}
        </div>
      </div>
      <div className="cd-detail__modules">
        {sectionMods.map((mod, mi) => {
          const prevModComplete = mi === 0 || isModuleComplete(sectionMods[mi - 1].id, pages, progressMap);
          const isModLocked = !isPhaseAccessible || (mi > 0 && !prevModComplete);
          return (
            <CompactModule
              key={mod.id}
              module={mod}
              moduleIndex={mi}
              pages={pages}
              progressMap={progressMap}
              workbooks={workbooks}
              courseId={courseId}
              isModLocked={isModLocked}
              isModuleAccessible={isPhaseAccessible && !isModLocked}
              goToLesson={goToLesson}
              navigate={navigate}
            />
          );
        })}
        {sectionMods.length === 0 && (
          <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 13, color: "#C8B8B4", textAlign: "center", padding: "20px 0" }}>
            No modules in this phase yet.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Compact Module ──
function CompactModule({
  module: mod, moduleIndex, pages, progressMap,
  workbooks, courseId, isModLocked, isModuleAccessible,
  goToLesson, navigate,
}) {
  const modPages = pages.filter((p) => p.moduleId === mod.id).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const modComplete = isModuleComplete(mod.id, pages, progressMap);
  const hasIncomplete = modPages.some((p) => progressMap[p.id] !== "completed");
  const hasAnyProgress = modPages.some((p) => progressMap[p.id] === "completed");
  const isCurrent = isModuleAccessible && hasIncomplete && (hasAnyProgress || moduleIndex === 0);

  const workbook = workbooks.find(
    (w) => w.expert_id === mod.expertId && w.course_id === (mod.courseId || courseId)
  );

  const [open, setOpen] = useState(isCurrent);
  const modNum = pad(moduleIndex + 1);

  const cls = [
    "cd-mod",
    open && "is-open",
    isModLocked && "is-locked",
    isCurrent && "is-current",
    modComplete && "is-completed",
  ].filter(Boolean).join(" ");

  return (
    <div className={cls}>
      <button className="cd-mod__head"
        onClick={() => !isModLocked && setOpen((o) => !o)}
        aria-expanded={open} aria-disabled={isModLocked}>
        <span className="cd-mod__num">{modNum}</span>
        <span className="cd-mod__title">{mod.title}</span>
        <span className="cd-mod__status">
          {modComplete && <CheckCircle className="w-4 h-4" style={{ color: "#A86460" }} />}
          {isCurrent && <span className="cd-mod__currentpill">In progress</span>}
          {isModLocked
            ? <Lock className="w-3.5 h-3.5" style={{ color: "#C8B8B4" }} />
            : <ChevronDown className="w-4 h-4 transition-transform duration-200"
                style={{ color: "#4A0E2E", transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
          }
        </span>
      </button>

      {isModLocked && (
        <div className="cd-mod__locknote">
          Unlocks after completing <strong>Module {pad(moduleIndex)}</strong>
        </div>
      )}

      <AnimatePresence>
        {open && !isModLocked && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: "hidden" }}>
            <div className="cd-mod__body">
              {modPages.map((page, pi) => {
                const isPageComplete = progressMap[page.id] === "completed";
                const isFirstIncomplete = !isPageComplete && modPages.slice(0, pi).every((p) => progressMap[p.id] === "completed");
                const isPageLocked = !isModuleAccessible || (!isPageComplete && !isFirstIncomplete && pi > 0 && modPages.slice(0, pi).some((p) => progressMap[p.id] !== "completed"));
                let status = "available";
                if (isPageComplete) status = "completed";
                else if (isFirstIncomplete && isModuleAccessible) status = "current";
                else if (isPageLocked) status = "locked";

                return (
                  <CompactLesson key={page.id} page={page} pageIndex={pi}
                    status={status} module={mod} goToLesson={goToLesson}
                    courseId={courseId} />
                );
              })}
              {modPages.length === 0 && (
                <div style={{ padding: "12px 10px", fontFamily: "var(--aw-font-sans)", fontSize: 12, color: "#C8B8B4", fontStyle: "italic" }}>
                  Lessons coming soon
                </div>
              )}
              {workbook && isModuleAccessible && (
                <div className="cd-wb" onClick={() => navigate(`/Workbook?id=${workbook.id}`)}
                  role="button" tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter") navigate(`/Workbook?id=${workbook.id}`); }}>
                  <BookOpen className="w-3.5 h-3.5" style={{ color: "#4A0E2E" }} />
                  <span className="cd-wb__title">{workbook.title || "Workbook"}</span>
                  <span className="cd-wb__label">Workbook</span>
                </div>
              )}
              {workbook && !isModuleAccessible && (
                <div className="cd-wb" style={{ opacity: 0.5, cursor: "not-allowed" }}>
                  <BookOpen className="w-3.5 h-3.5" style={{ color: "#C8B8B4" }} />
                  <span className="cd-wb__title" style={{ color: "#C8B8B4" }}>{workbook.title || "Workbook"}</span>
                  <Lock className="w-3 h-3" style={{ color: "#C8B8B4" }} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Compact Lesson Row ──
function CompactLesson({ page, pageIndex, status, module: mod, goToLesson, courseId }) {
  const navigate = useNavigate();
  const num = pad(pageIndex + 1);
  const isLocked = status === "locked";
  const isCurrent = status === "current";
  const isCompleted = status === "completed";
  const canClick = !isLocked;

  const handleClick = () => {
    if (!canClick) return;
    navigate(buildPlayerUrl(mod.id, page.id, courseId));
  };

  const cls = ["cd-lesson", isCompleted && "is-completed", isCurrent && "is-current", isLocked && "is-locked"]
    .filter(Boolean).join(" ");

  return (
    <div className={cls} onClick={canClick ? handleClick : undefined}
      role={canClick ? "button" : undefined} tabIndex={isLocked ? -1 : 0}
      onKeyDown={(e) => { if (canClick && e.key === "Enter") handleClick(); }}
      aria-disabled={isLocked}>
      <span className="cd-lesson__num">{num}</span>
      <span className="cd-lesson__title">{page.title}</span>
      <span className="cd-lesson__meta">
        {isCompleted && <span className="cd-lesson__pill cd-lesson__pill--done"><CheckCircle className="w-3 h-3" /> Completed</span>}
        {isCurrent && <span className="cd-lesson__pill cd-lesson__pill--cta">Watch Lesson <ArrowRight className="w-3 h-3" /></span>}
        {status === "available" && <span className="cd-lesson__pill cd-lesson__pill--avail"><Play className="w-3 h-3" /> Lesson</span>}
        {isLocked && <span className="cd-lesson__pill cd-lesson__pill--locked"><Lock className="w-3 h-3" /> Locked</span>}
      </span>
    </div>
  );
}

// ── Up Next Card ──
function UpNextCard({ phaseSection, phaseIdx, lesson, goToLesson }) {
  if (!lesson) return null;
  const meta = parsePhaseMeta(phaseSection, phaseIdx);
  return (
    <aside className="cd-next">
      <div className="cd-next__eyebrow">Up Next · Phase {meta.letter}</div>
      <div className="cd-next__module">{lesson.module?.title?.split(":")[0] || "Module"}</div>
      <h3 className="cd-next__title">{lesson.page.title}</h3>
      <button className="cd-next__cta" onClick={() => goToLesson(lesson.page, lesson.module)}>
        Watch Lesson <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
}