import React from "react";
import { partsForTrack, questionsFor, displayNumbers, isAnswered, optionsFor, OPTION_SETS } from "@/data/auditQuestions";
import { QuestionText } from "@/components/audit/AuditFields";

// ────────────────────────────────────────────────────────────────
// AuditAnswersView: her Alignment Audit answers, read-only, part by part.
// Used in her profile (/Profile?tab=audit) once she has submitted, and in
// the admin Audits tab. Questions she skipped are left out. Every answer
// shape the questionnaire saves (see AuditFields.jsx) is turned back into
// plain words here, using the same option labels she picked from.
// Questions are in the order she saw them, with the numbers she saw
// (displayNumbers). Answers to questions that have since been retired, and
// boxes that have come off a question, are listed at the end of their part
// under "From an earlier version of the audit", each under its original
// wording, so nothing she wrote is lost.
// ────────────────────────────────────────────────────────────────

const has = (x) => x !== undefined && x !== null && String(x).trim() !== "";

function labelOf(setName, value, answers) {
  const opt = optionsFor(setName, answers).find((o) => o.value === value);
  return opt ? opt.label : String(value);
}

// Chip boxes save { selected: [...], other: "" }; toggles save a string.
function chipText(setName, v, answers) {
  if (!v) return "";
  if (typeof v === "string") return labelOf(setName, v, answers);
  const sel = Array.isArray(v.selected) ? v.selected : [];
  const parts = sel.filter((s) => s !== "other").map((s) => labelOf(setName, s, answers));
  if (sel.includes("other")) parts.push(has(v.other) ? v.other.trim() : "Other");
  if (has(v.legacy)) parts.push(v.legacy.trim());
  return parts.join(", ");
}

function boxText(def, v, answers) {
  if (v === undefined || v === null || v === "") return "";
  if (def.kind === "chips" || def.kind === "toggle") return chipText(def.options, v, answers);
  if (def.kind === "number") return has(v) ? `${v}${def.suffix ? ` ${def.suffix}` : ""}` : "";
  if (typeof v === "object") return chipText(def.options, v, answers);
  return String(v);
}

function Line({ label, children }) {
  if (!has(children)) return null;
  return (
    <p className="aav-line">
      {label && <span className="aav-k">{label}</span>}
      <span className="aav-v">{children}</span>
    </p>
  );
}

function Answer({ q, v, answers }) {
  switch (q.type) {
    case "text":
      return <p className="aav-text">{typeof v === "object" && v !== null ? v.legacy || "" : v}</p>;
    case "prefix":
      return <p className="aav-text"><em>{q.leadIn}</em> {v}</p>;
    case "facts":
    case "fields":
      return (q.fields || []).map((f) => (
        <Line key={f.key} label={f.label}>{boxText(f.options && !f.kind ? { ...f, kind: "chips" } : f, v?.[f.key], answers)}</Line>
      ));
    case "sliders2":
      return (q.sliders || []).map((s) => (
        <Line key={s.key} label={s.label}>{typeof v?.[s.key] === "number" ? `${v[s.key]} out of 10` : ""}</Line>
      ));
    case "multi": {
      const sel = Array.isArray(v?.selected) ? v.selected : [];
      return (
        <>
          <Line>{sel.map((s) => labelOf(q.options, s, answers)).join(", ")}</Line>
          <Line label="In her words">{v?.text}</Line>
        </>
      );
    }
    case "chips":
      return <Line>{chipText(q.options, v, answers)}</Line>;
    case "single":
      return <Line>{labelOf(q.options, v, answers)}</Line>;
    case "leakmap":
      return OPTION_SETS.LEAK_AREAS.filter((a) => v?.[a.id] !== undefined).map((a) => {
        const n = v[a.id];
        const shown = n === "na" ? "Doesn't apply" : `${n > 0 ? "+" : ""}${n}`;
        return <Line key={a.id} label={a.label}>{shown}</Line>;
      });
    case "hours":
      return OPTION_SETS.TIME_RECEIPT.map((r) => (
        <Line key={r.id} label={r.label}>{has(v?.[r.id]) ? `${v[r.id]} hours` : ""}</Line>
      ));
    case "rows5":
      return (OPTION_SETS[q.rows] || []).map((r) => (
        <Line key={r.id} label={r.label}>{typeof v?.[r.id] === "number" ? `${v[r.id]} out of 5` : ""}</Line>
      ));
    case "readiness":
      return (
        <>
          <Line label="Readiness">{typeof v?.score === "number" ? `${v.score} out of 10` : ""}</Line>
          {(q.textFields || []).map((f) => (
            <Line key={f.key} label={f.label}>{v?.text?.[f.key]}</Line>
          ))}
        </>
      );
    case "lists2":
      return (q.lists || []).map((l) => {
        const items = (Array.isArray(v?.[l.key]) ? v[l.key] : [])
          .map((x) => (typeof x === "string" ? { text: x } : x || {}))
          .filter((x) => has(x.text));
        if (!items.length) return null;
        return (
          <div key={l.key} className="aav-block">
            <p className="aav-k">{l.label}</p>
            <ul className="aav-list">
              {items.map((x, i) => {
                const extra = l.extra ? boxText(l.extra, x[l.extra.key], answers) : "";
                return <li key={i}>{x.text}{extra ? <span className="aav-extra"> · {extra}</span> : null}</li>;
              })}
            </ul>
          </div>
        );
      });
    case "rows": {
      const rows = (Array.isArray(v) ? v : []).filter((r) => r && Object.values(r).some((x) => has(typeof x === "object" ? chipText("", x, answers) : x)));
      return rows.map((r, i) => (
        <div key={i} className="aav-block">
          {rows.length > 1 && <p className="aav-n">{i + 1}</p>}
          {(q.columns || []).map((c) => (
            <Line key={c.key} label={(q.columns || []).length > 1 ? c.label : ""}>{boxText(c, r[c.key], answers)}</Line>
          ))}
        </div>
      ));
    }
    default:
      return <p className="aav-text">{typeof v === "object" ? JSON.stringify(v) : String(v)}</p>;
  }
}

// What she wrote in a part under an earlier version of the audit: answers
// to retired questions, and boxes that have since come off a question
// (Q37 "What I'll give up"). Each is shown under its original wording.
function earlierFor(part, track, answers) {
  const out = [];
  for (const q of part.questions) {
    if (q.track && q.track !== track) continue;
    if (q.retired) {
      if (isAnswered(q, answers[q.id])) out.push({ key: q.id, q, v: answers[q.id] });
    } else if (q.retiredFields) {
      const old = { ...q, text: q.retiredText || q.text, text2: undefined, lead: undefined, fields: q.retiredFields };
      if (isAnswered(old, answers[q.id])) out.push({ key: `${q.id}-earlier`, q: old, v: answers[q.id] });
    }
  }
  return out;
}

export default function AuditAnswersView({ track, answers }) {
  const a = answers || {};
  const t = track || "business";
  const parts = partsForTrack(t);
  const numbers = displayNumbers(t);
  return (
    <div className="aav">
      <style>{`
        .aav{font-family:Montserrat,sans-serif;color:#3A2B30}
        .aav-part{margin-top:40px}
        .aav-part:first-child{margin-top:0}
        .aav-title{font-family:'Libre Baskerville',Georgia,serif;font-size:22px;line-height:1.25;color:#4A0E2E;margin:0 0 4px}
        .aav-q{padding:20px 0;border-top:1px solid rgba(74,14,46,0.12)}
        .aav-qn{font-size:11px;font-weight:700;letter-spacing:0.18em;color:#A86460;text-transform:uppercase}
        .aav .aw-qtext{font-size:15px;line-height:1.55;color:#5A4A50;margin:6px 0 12px}
        .aav .aw-qtext b{font-weight:600;color:#4A0E2E}
        .aav-text{margin:0;font-size:16px;line-height:1.65;color:#1A0E12;white-space:pre-wrap}
        .aav-line{margin:0 0 8px;font-size:15px;line-height:1.55;display:flex;flex-wrap:wrap;gap:4px 12px}
        .aav-k{font-weight:600;color:#4A0E2E;font-size:13px}
        .aav-v{color:#1A0E12;white-space:pre-wrap}
        .aav-block{padding:10px 0 4px}
        .aav-n{margin:0 0 4px;font-size:12px;font-weight:700;color:#A86460}
        .aav-list{margin:6px 0 0;padding-left:18px;font-size:15px;line-height:1.6}
        .aav-extra{color:#6B1642;font-size:13px}
        .aav-empty{font-size:14px;color:#8A7A76}
        .aav-earlier{padding-top:20px;border-top:1px solid rgba(74,14,46,0.12)}
        .aav-earlier .aav-q{border-top:0;padding:14px 0 6px}
      `}</style>
      {parts.map((p) => {
        const qs = questionsFor(p, t).filter((q) => isAnswered(q, a[q.id]));
        const earlier = earlierFor(p, t, a);
        return (
          <section key={p.id} className="aav-part">
            <h3 className="aav-title">{p.title}</h3>
            {qs.length === 0 && earlier.length === 0 && (
              <p className="aav-empty">Nothing answered in this part.</p>
            )}
            {qs.map((q) => (
              <div key={q.id} className="aav-q">
                <p className="aav-qn">Question {numbers[q.id]}</p>
                <QuestionText q={q} />
                <Answer q={q} v={a[q.id]} answers={a} />
              </div>
            ))}
            {earlier.length > 0 && (
              <div className="aav-earlier">
                <p className="aav-qn">From an earlier version of the audit</p>
                {earlier.map(({ key, q, v }) => (
                  <div key={key} className="aav-q">
                    <QuestionText q={q} />
                    <Answer q={q} v={v} answers={a} />
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
