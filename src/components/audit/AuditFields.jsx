import React, { useEffect, useRef } from "react";
import { Check } from "@/components/spp/SppUI";
import { OPTION_SETS, CARRY_LEAD } from "@/data/auditQuestions";

// Answer fields for the Alignment Audit. One component per answer type in
// src/data/auditQuestions.js. Every field is optional: an untouched field
// stays empty and counts as skipped.

function optionsOf(name) {
  return OPTION_SETS[name] || [];
}

// A text field that grows as she types.
export function AutoText({ value, onChange, id, ariaLabel, minRows = 3, disabled }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      id={id}
      aria-label={ariaLabel}
      rows={minRows}
      value={value || ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

// Her earlier Starting Point Profile choice, shown above the question.
export function CarryQuote({ quotes }) {
  const list = (quotes || []).filter(Boolean);
  if (!list.length) return null;
  return (
    <div className="aw-carry">
      <p>{CARRY_LEAD}</p>
      {list.map((q, i) => (
        <blockquote key={i}>{q}</blockquote>
      ))}
    </div>
  );
}

function Range({ min, max, value, onChange, label }) {
  const unset = typeof value !== "number";
  const mid = Math.round((min + max) / 2);
  const set = (v) => onChange(Number(v));
  return (
    <input
      type="range"
      className={"aw-range" + (unset ? " unset" : "")}
      min={min}
      max={max}
      step={1}
      value={unset ? mid : value}
      aria-label={label}
      aria-valuetext={unset ? "Not set" : String(value)}
      onChange={(e) => set(e.target.value)}
      onPointerUp={(e) => set(e.currentTarget.value)}
      onKeyUp={(e) => set(e.currentTarget.value)}
    />
  );
}

function Nums({ from, to, value, onChange, label }) {
  const nums = [];
  for (let n = from; n <= to; n++) nums.push(n);
  return (
    <div className="aw-nums" role="radiogroup" aria-label={label}>
      {nums.map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          className={"aw-num" + (value === n ? " sel" : "")}
          onClick={() => onChange(value === n ? undefined : n)}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function FromProfile() {
  return <span className="tag">From your profile</span>;
}

// Q2 or Q3. Fields marked "profile" start from her saved profile.
function FactsField({ q, value, onChange, profileFacts }) {
  const v = value || {};
  const set = (key, val) => onChange({ ...v, [key]: val });
  return (
    <div className="aw-field">
      {q.fields.map((f) => {
        const fromProfile = f.profile && profileFacts?.[f.profile] && v[f.key] === profileFacts[f.profile];
        const id = `${q.id}-${f.key}`;
        return (
          <div key={f.key} className="aw-sub">
            <label className="aw-label" htmlFor={id}>
              <span>{f.label}</span>
              {fromProfile && <FromProfile />}
            </label>
            {f.options ? (
              <div className="chips" role="radiogroup" aria-label={f.label}>
                {optionsOf(f.options).map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    role="radio"
                    aria-checked={v[f.key] === o.value}
                    className={"chip" + (v[f.key] === o.value ? " sel" : "")}
                    onClick={() => set(f.key, v[f.key] === o.value ? "" : o.value)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            ) : (
              <input id={id} type="text" value={v[f.key] || ""} onChange={(e) => set(f.key, e.target.value)} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Sliders2Field({ q, value, onChange }) {
  const v = value || {};
  return (
    <div className="aw-field">
      {q.sliders.map((s) => (
        <div key={s.key} className="aw-row">
          <div className="aw-label">
            <span className="aw-row-label">{s.label}</span>
            <span className={"aw-val" + (typeof v[s.key] === "number" ? "" : " muted")}>
              {typeof v[s.key] === "number" ? `${v[s.key]} / 10` : "Not set"}
            </span>
          </div>
          <Range min={1} max={10} value={v[s.key]} label={s.label} onChange={(n) => onChange({ ...v, [s.key]: n })} />
          <div className="aw-scale-ends"><span>1</span><span>10</span></div>
        </div>
      ))}
    </div>
  );
}

function MultiField({ q, value, onChange }) {
  const v = value || {};
  const selected = Array.isArray(v.selected) ? v.selected : [];
  const toggle = (val) => {
    const next = selected.includes(val) ? selected.filter((x) => x !== val) : [...selected, val];
    onChange({ ...v, selected: next });
  };
  return (
    <div className="aw-field">
      <div className="answers" style={{ marginTop: 0 }}>
        {optionsOf(q.options).map((o) => {
          const on = selected.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              role="checkbox"
              aria-checked={on}
              className={"ans" + (on ? " sel" : "")}
              onClick={() => toggle(o.value)}
            >
              <span>{o.label}</span>
              <span className="tick">{on && <Check />}</span>
            </button>
          );
        })}
      </div>
      {q.withText && (
        <div className="aw-sub" style={{ marginTop: 14 }}>
          <AutoText value={v.text} ariaLabel={`${q.n}, in your own words`} minRows={2} onChange={(t) => onChange({ ...v, text: t })} />
        </div>
      )}
    </div>
  );
}

function LeakMapField({ value, onChange }) {
  const v = value || {};
  const set = (id, val) => {
    const next = { ...v };
    if (val === undefined) delete next[id];
    else next[id] = val;
    onChange(next);
  };
  return (
    <div className="aw-field">
      {optionsOf("LEAK_AREAS").map((a) => {
        const cur = v[a.id];
        const na = cur === "na";
        const num = typeof cur === "number" ? cur : undefined;
        return (
          <div key={a.id} className="aw-row">
            <div className="aw-label">
              <span className="aw-row-label">{a.label}</span>
              <span className={"aw-val" + (num === undefined ? " muted" : "")}>
                {na ? "Doesn't apply" : num === undefined ? "Not set" : num > 0 ? `+${num}` : String(num)}
              </span>
            </div>
            {!na && <Range min={-5} max={5} value={num} label={a.label} onChange={(n) => set(a.id, n)} />}
            <div className="aw-scale-ends">
              {!na ? <span>-5</span> : <span />}
              {!na ? <span>0</span> : <span />}
              {!na ? <span>+5</span> : <span />}
            </div>
            <div>
              <button
                type="button"
                className={"aw-na" + (na ? " sel" : "")}
                aria-pressed={na}
                onClick={() => set(a.id, na ? undefined : "na")}
              >
                Doesn't apply
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HoursField({ value, onChange }) {
  const v = value || {};
  return (
    <div className="aw-field aw-hours">
      {optionsOf("TIME_RECEIPT").map((r) => {
        const id = `q21-${r.id}`;
        return (
          <div key={r.id}>
            <label htmlFor={id}>{r.label}</label>
            <input
              id={id}
              type="number"
              inputMode="decimal"
              min="0"
              max="168"
              step="0.5"
              placeholder="Hours"
              value={v[r.id] ?? ""}
              onChange={(e) => onChange({ ...v, [r.id]: e.target.value === "" ? "" : Number(e.target.value) })}
            />
          </div>
        );
      })}
    </div>
  );
}

function Lists2Field({ q, value, onChange }) {
  const v = value || {};
  const listOf = (key) => (Array.isArray(v[key]) && v[key].length ? v[key] : [""]);
  const setList = (key, list) => onChange({ ...v, [key]: list });
  return (
    <div className="aw-field">
      {q.lists.map((l) => {
        const list = listOf(l.key);
        return (
          <div key={l.key} className="aw-sub" style={{ marginTop: 18 }}>
            <div className="aw-label"><span>{l.label}</span></div>
            {list.map((item, i) => (
              <div key={i} className="aw-list-row">
                <input
                  type="text"
                  aria-label={`${l.label}, line ${i + 1}`}
                  value={item}
                  onChange={(e) => setList(l.key, list.map((x, j) => (j === i ? e.target.value : x)))}
                />
                <button
                  type="button"
                  className="aw-x"
                  aria-label={`Remove line ${i + 1}`}
                  onClick={() => setList(l.key, list.length > 1 ? list.filter((_, j) => j !== i) : [""])}
                >
                  ×
                </button>
              </div>
            ))}
            <button type="button" className="btn-t" onClick={() => setList(l.key, [...list, ""])}>
              + Add a line
            </button>
          </div>
        );
      })}
    </div>
  );
}

function Rows5Field({ q, value, onChange }) {
  const v = value || {};
  const set = (id, n) => {
    const next = { ...v };
    if (n === undefined) delete next[id];
    else next[id] = n;
    onChange(next);
  };
  return (
    <div className="aw-field">
      <div className="aw-scale-ends" style={{ marginBottom: 4 }}>
        <span>1 = {q.lowLabel}</span>
        <span>5 = {q.highLabel}</span>
      </div>
      {optionsOf(q.rows).map((r) => (
        <div key={r.id} className="aw-row inline">
          <span className="aw-row-label">{r.label}</span>
          <Nums from={1} to={5} value={v[r.id]} label={r.label} onChange={(n) => set(r.id, n)} />
        </div>
      ))}
    </div>
  );
}

function SingleField({ q, value, onChange }) {
  return (
    <div className="aw-field">
      <div className="answers" role="radiogroup" aria-label={q.text} style={{ marginTop: 0 }}>
        {optionsOf(q.options).map((o) => {
          const on = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={on}
              className={"ans" + (on ? " sel" : "")}
              onClick={() => onChange(on ? "" : o.value)}
            >
              <span>{o.label}</span>
              <span className="tick">{on && <Check />}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ReadinessField({ q, value, onChange }) {
  const v = value || {};
  const text = v.text || {};
  return (
    <div className="aw-field">
      <Nums from={1} to={10} value={v.score} label={q.scaleText} onChange={(n) => onChange({ ...v, score: n })} />
      {q.textFields.map((f) => (
        <div key={f.key} className="aw-sub" style={{ marginTop: 18 }}>
          <label className="aw-label" htmlFor={`q54-${f.key}`}><span>{f.label}</span></label>
          <AutoText id={`q54-${f.key}`} value={text[f.key]} minRows={2} onChange={(t) => onChange({ ...v, text: { ...text, [f.key]: t } })} />
        </div>
      ))}
    </div>
  );
}

// The question text, with the bold lead and the one italic word the doc uses.
export function QuestionText({ q }) {
  const body = q.type === "readiness" ? q.scaleText : q.type === "sliders2" ? null : q.text;
  if (!body && !q.lead) return null;
  let content = body;
  if (q.em && body && body.includes(q.em)) {
    const [before, after] = body.split(q.em);
    content = <>{before}<em>{q.em}</em>{after}</>;
  }
  return (
    <p className="aw-qtext">
      {q.lead && <><b>{q.lead}</b> </>}
      {content}
    </p>
  );
}

export function AnswerField({ q, value, onChange, profileFacts }) {
  switch (q.type) {
    case "text":
      return (
        <div className="aw-field">
          <AutoText value={value} ariaLabel={`Question ${q.n}`} onChange={onChange} />
        </div>
      );
    case "facts":
      return <FactsField q={q} value={value} onChange={onChange} profileFacts={profileFacts} />;
    case "sliders2":
      return <Sliders2Field q={q} value={value} onChange={onChange} />;
    case "multi":
      return <MultiField q={q} value={value} onChange={onChange} />;
    case "leakmap":
      return <LeakMapField value={value} onChange={onChange} />;
    case "hours":
      return <HoursField value={value} onChange={onChange} />;
    case "lists2":
      return <Lists2Field q={q} value={value} onChange={onChange} />;
    case "rows5":
      return <Rows5Field q={q} value={value} onChange={onChange} />;
    case "single":
      return <SingleField q={q} value={value} onChange={onChange} />;
    case "readiness":
      return <ReadinessField q={q} value={value} onChange={onChange} />;
    default:
      return null;
  }
}
