import React, { useEffect, useRef } from "react";
import { Check } from "@/components/spp/SppUI";
import { OPTION_SETS, CARRY_LEAD, optionsFor, liveQuote } from "@/data/auditQuestions";

// Answer fields for the Alignment Audit. One component per answer type in
// src/data/auditQuestions.js. Every field is optional: an untouched field
// stays empty and counts as skipped. Chips are real radio buttons or
// checkboxes (role and aria-checked on a focusable button), so they work
// with a keyboard and show the shared focus ring from spp.css.

function optionsOf(name) {
  return OPTION_SETS[name] || [];
}

const hasText = (x) => String(x ?? "").trim().length > 0;

// A text field that grows as she types.
export function AutoText({ value, onChange, id, ariaLabel, minRows = 3, disabled, placeholder }) {
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
      placeholder={placeholder || undefined}
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

// Her answers from earlier in this audit, quoted back. "kind" is one kind
// or a list of kinds, shown in order. A kind with nothing to quote shows
// nothing.
export function LiveQuote({ kind, answers }) {
  const kinds = Array.isArray(kind) ? kind : kind ? [kind] : [];
  const found = kinds.map((k) => ({ k, quote: liveQuote(k, answers) })).filter((x) => x.quote);
  if (!found.length) return null;
  return found.map(({ k, quote }) => (
    <div key={k} className="aw-carry">
      {typeof quote === "string" ? (
        <blockquote style={{ marginTop: 0, whiteSpace: "pre-wrap" }}>{quote}</blockquote>
      ) : (
        <>
          <p>{quote.lead}</p>
          {quote.lines.map((line, i) => (
            <blockquote key={i} style={{ whiteSpace: "pre-wrap" }}>{line}</blockquote>
          ))}
        </>
      )}
    </div>
  ));
}

// Words she wrote before the answer format changed, where the new layout
// has no text box to hold them. Nothing she wrote is lost.
function LegacyNote({ text }) {
  if (!hasText(text)) return null;
  return (
    <div className="aw-carry">
      <p>What you wrote before:</p>
      <blockquote>{text}</blockquote>
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

// ── Chips ──
// Value: { selected: [...values], other: "" }. When "other" is chosen a
// short text box appears for it.
function ChipSet({ options, mode = "single", value, onChange, label, id }) {
  const v = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const selected = Array.isArray(v.selected) ? v.selected : [];
  const multi = mode === "multi";
  const toggle = (val) => {
    let next;
    if (multi) next = selected.includes(val) ? selected.filter((x) => x !== val) : [...selected, val];
    else next = selected[0] === val ? [] : [val];
    const out = { ...v, selected: next };
    if (!next.includes("other")) out.other = "";
    onChange(out);
  };
  const otherOn = selected.includes("other");
  return (
    <div>
      <div className="chips aw-chips" role={multi ? "group" : "radiogroup"} aria-label={label}>
        {options.map((o) => {
          const on = selected.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              role={multi ? "checkbox" : "radio"}
              aria-checked={on}
              className={"chip" + (on ? " sel" : "")}
              onClick={() => toggle(o.value)}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {otherOn && (
        <div style={{ marginTop: 8 }}>
          <label className="aw-label" htmlFor={`${id}-other`}><span>Other</span></label>
          <input id={`${id}-other`} type="text" value={v.other || ""} onChange={(e) => onChange({ ...v, other: e.target.value })} />
        </div>
      )}
    </div>
  );
}

// Two options side by side, one choice. Value: the chosen option's value.
function Toggle({ options, value, onChange, label }) {
  return (
    <div className="aw-toggle" role="radiogroup" aria-label={label}>
      {options.map((o) => {
        const on = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            className={"chip" + (on ? " sel" : "")}
            onClick={() => onChange(on ? "" : o.value)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// One box inside rows, fields or a list line.
function Box({ def, value, onChange, id, answers }) {
  const label = def.label;
  const ph = def.placeholder || undefined;
  if (def.kind === "chips") {
    const options = optionsFor(def.options, answers);
    if (!options.length && def.fallback === "text") {
      return <AutoText id={id} ariaLabel={label} minRows={2} placeholder={ph} value={typeof value === "string" ? value : ""} onChange={onChange} />;
    }
    return <ChipSet id={id} options={options} mode={def.mode} value={value} onChange={onChange} label={label} />;
  }
  if (def.kind === "toggle") {
    return <Toggle options={optionsFor(def.options, answers)} value={value} onChange={onChange} label={label} />;
  }
  if (def.kind === "number") {
    return (
      <div className="aw-numbox">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          placeholder={ph}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        />
        {def.suffix && <span className="aw-suffix">{def.suffix}</span>}
      </div>
    );
  }
  if (def.kind === "time") {
    return <input id={id} type="time" value={value || ""} onChange={(e) => onChange(e.target.value)} />;
  }
  if (def.kind === "short") {
    return <input id={id} type="text" placeholder={ph} value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.target.value)} />;
  }
  // text
  return (
    <>
      {def.leadIn && <p className="aw-leadin">{def.leadIn}</p>}
      <AutoText id={id} ariaLabel={label} minRows={2} placeholder={ph} value={typeof value === "string" ? value : ""} onChange={onChange} />
    </>
  );
}

function BoxWithLabel({ def, value, onChange, id, answers }) {
  // Chips and toggles label a group; inputs label the input itself.
  const isGroup = def.kind === "chips" || def.kind === "toggle";
  return (
    <div className="aw-sub">
      {isGroup ? (
        <p className="aw-label" id={`${id}-label`}><span>{def.label}</span></p>
      ) : (
        <label className="aw-label" htmlFor={id}><span>{def.label}</span></label>
      )}
      <Box def={def} value={value} onChange={onChange} id={id} answers={answers} />
    </div>
  );
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
              <input id={id} type="text" placeholder={f.placeholder || undefined} value={v[f.key] || ""} onChange={(e) => set(f.key, e.target.value)} />
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

function MultiField({ q, n, value, onChange }) {
  const v = value || {};
  const selected = Array.isArray(v.selected) ? v.selected : [];
  // "exclusive" (Q17's "Nothing") clears the others, and any other option
  // clears it.
  const toggle = (val) => {
    let next = selected.includes(val) ? selected.filter((x) => x !== val) : [...selected, val];
    if (q.exclusive && !selected.includes(val)) {
      next = val === q.exclusive ? [val] : next.filter((x) => x !== q.exclusive);
    }
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
          <AutoText value={v.text} ariaLabel={`${n}, in your own words`} minRows={2} placeholder={q.placeholder} onChange={(t) => onChange({ ...v, text: t })} />
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

// ── taps ──
// One tap per line (q.rows), from the answers in q.scale. An optional
// written box sits before the taps (textBefore) or after them (textAfter).
// Saved flat: { <line id>: <answer>, <text key>: "..." }. A value that
// isn't one of the answers (an old score) shows as untapped.
function TapsField({ q, n, value, onChange }) {
  const v = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const scale = optionsOf(q.scale);
  const set = (key, val) => {
    const next = { ...v };
    if (val === "" || val === undefined) delete next[key];
    else next[key] = val;
    onChange(next);
  };
  const textBox = (t) => (
    <div className="aw-sub" style={{ marginTop: 6, marginBottom: 18 }}>
      <label className="aw-label" htmlFor={`${q.id}-${t.key}`}><span>{t.label}</span></label>
      <AutoText id={`${q.id}-${t.key}`} value={typeof v[t.key] === "string" ? v[t.key] : ""} minRows={3} placeholder={t.placeholder} onChange={(x) => set(t.key, x)} />
    </div>
  );
  return (
    <div className="aw-field">
      {q.textBefore && textBox(q.textBefore)}
      {q.tapsLabel && <p className="aw-label" style={{ marginTop: 8 }}><span>{q.tapsLabel}</span></p>}
      {optionsOf(q.rows).map((r) => (
        <div key={r.id} className="aw-row aw-taprow">
          <p className="aw-row-label" id={`${q.id}-${r.id}-l`} style={{ margin: "0 0 8px" }}>{r.label}</p>
          <Toggle
            options={scale}
            value={scale.some((s) => s.value === v[r.id]) ? v[r.id] : ""}
            label={`${n ? `Question ${n}, ` : ""}${r.label}`}
            onChange={(val) => set(r.id, val)}
          />
        </div>
      ))}
      {q.textAfter && <div style={{ marginTop: 18 }}>{textBox(q.textAfter)}</div>}
    </div>
  );
}

function HoursField({ value, onChange }) {
  const v = value || {};
  const total = Object.values(v).reduce((s, x) => s + (typeof x === "number" && x > 0 ? x : 0), 0);
  const shown = Math.round(total * 10) / 10;
  return (
    <div className="aw-field">
      <div className="aw-hours">
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
      <p className="aw-total" aria-live="polite">{shown} of the 168 hours in a week</p>
      {total > 168 && <p className="aw-total-note">That's more hours than a week has. Worth a second look.</p>}
    </div>
  );
}

// Two lists she adds lines to. A list can give each line an extra box,
// saved as { text, <extra key> }.
function Lists2Field({ q, value, onChange, answers }) {
  const v = value || {};
  const listOf = (key) => {
    const raw = Array.isArray(v[key]) && v[key].length ? v[key] : [{ text: "" }];
    return raw.map((x) => (typeof x === "string" ? { text: x } : x || { text: "" }));
  };
  const setList = (key, list) => onChange({ ...v, [key]: list });
  return (
    <div className="aw-field">
      {q.lists.map((l) => {
        const list = listOf(l.key);
        return (
          <div key={l.key} className="aw-sub" style={{ marginTop: 18 }}>
            <p className="aw-label"><span>{l.label}</span></p>
            {list.map((item, i) => {
              const idBase = `${q.id}-${l.key}-${i}`;
              const setItem = (patch) => setList(l.key, list.map((x, j) => (j === i ? { ...x, ...patch } : x)));
              return (
                <div key={i} className={l.extra ? "aw-line-card" : ""}>
                  <div className="aw-list-row">
                    <input
                      type="text"
                      aria-label={`${l.label}, line ${i + 1}`}
                      placeholder={l.placeholder || undefined}
                      value={item.text || ""}
                      onChange={(e) => setItem({ text: e.target.value })}
                    />
                    <button
                      type="button"
                      className="aw-x"
                      aria-label={`Remove line ${i + 1}`}
                      onClick={() => setList(l.key, list.length > 1 ? list.filter((_, j) => j !== i) : [{ text: "" }])}
                    >
                      ×
                    </button>
                  </div>
                  {l.extra && (
                    <div className="aw-line-extra">
                      {l.extra.kind === "chips" ? (
                        <>
                          <p className="aw-label"><span>{l.extra.label}</span></p>
                          <Toggle
                            options={optionsFor(l.extra.options, answers)}
                            value={item[l.extra.key] || ""}
                            label={`${l.extra.label}, line ${i + 1}`}
                            onChange={(val) => setItem({ [l.extra.key]: val })}
                          />
                        </>
                      ) : (
                        <>
                          <label className="aw-label" htmlFor={`${idBase}-x`}><span>{l.extra.label}</span></label>
                          <Box
                            def={l.extra}
                            id={`${idBase}-x`}
                            value={item[l.extra.key]}
                            answers={answers}
                            onChange={(val) => setItem({ [l.extra.key]: val })}
                          />
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <button type="button" className="btn-t" onClick={() => setList(l.key, [...list, { text: "" }])}>
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
      {q.textFields.map((f) => {
        const label = f.scoreLabel && typeof v.score === "number" ? f.scoreLabel.replace("{score}", String(v.score)) : f.label;
        return (
          <div key={f.key} className="aw-sub" style={{ marginTop: 18 }}>
            <label className="aw-label" htmlFor={`q54-${f.key}`}><span>{label}</span></label>
            <AutoText id={`q54-${f.key}`} value={text[f.key]} minRows={2} placeholder={f.placeholder} onChange={(t) => onChange({ ...v, text: { ...text, [f.key]: t } })} />
          </div>
        );
      })}
    </div>
  );
}

// ── rows ──
// Rows she adds with "Add another", up to maxRows. One empty row shows to
// start. Each row is its own card on a phone, so its boxes read as one
// answer. Empty rows are dropped when saving (see cleanAnswer in Audit.jsx).
function RowsField({ q, n, value, onChange, answers }) {
  const rows = Array.isArray(value) && value.length ? value : [{}];
  const max = q.maxRows || 3;
  const legacy = rows.map((r) => r?.legacy).filter(hasText);
  const setRow = (i, patch) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const total = q.total
    ? rows.reduce((s, r) => s + (typeof r?.[q.total] === "number" && r[q.total] > 0 ? r[q.total] : 0), 0)
    : null;
  return (
    <div className="aw-field">
      {legacy.map((t, i) => <LegacyNote key={i} text={t} />)}
      <div className="aw-rows">
        {rows.map((row, i) => (
          <div key={i} className="aw-row-card" role="group" aria-label={`${n}, answer ${i + 1}`}>
            <div className="aw-cols">
              {q.columns.map((c) => (
                <BoxWithLabel
                  key={c.key}
                  def={c}
                  id={`${q.id}-${i}-${c.key}`}
                  value={row?.[c.key]}
                  answers={answers}
                  onChange={(val) => setRow(i, { [c.key]: val })}
                />
              ))}
            </div>
            {i > 0 && (
              <button type="button" className="aw-remove" onClick={() => onChange(rows.filter((_, j) => j !== i))}>
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
      {q.total && (
        <p className="aw-total" aria-live="polite">{Math.round(total * 10) / 10}% of your income</p>
      )}
      {rows.length < max && (
        <button type="button" className="btn btn-s full aw-add" onClick={() => onChange([...rows, {}])}>
          Add another
        </button>
      )}
    </div>
  );
}

// ── fields ──
// Two or more labelled boxes for one question, side by side on a wide
// screen, stacked on a phone in the order listed.
function FieldsField({ q, value, onChange, answers }) {
  const v = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const visible = q.fields.filter((f) => {
    if (!f.hideWhen) return true;
    const ctl = v[f.hideWhen.field];
    const sel = Array.isArray(ctl?.selected) ? ctl.selected : [];
    return !sel.includes(f.hideWhen.value);
  });
  return (
    <div className="aw-field">
      <LegacyNote text={v.legacy} />
      <div className={"aw-cols" + (q.fields.some((f) => f.kind === "chips") ? " has-chips" : "")}>
        {visible.map((f) => (
          <BoxWithLabel
            key={f.key}
            def={f}
            id={`${q.id}-${f.key}`}
            value={v[f.key]}
            answers={answers}
            onChange={(val) => onChange({ ...v, [f.key]: val })}
          />
        ))}
      </div>
    </div>
  );
}

function ChipsField({ q, n, value, onChange }) {
  const v = value && typeof value === "object" ? value : {};
  return (
    <div className="aw-field">
      <LegacyNote text={v.legacy} />
      <ChipSet id={q.id} options={optionsOf(q.options)} mode={q.mode} value={v} onChange={onChange} label={`Question ${n}`} />
    </div>
  );
}

// One line that starts with fixed words she finishes. Saves her words only.
function PrefixField({ q, value, onChange }) {
  const id = `${q.id}-prefix`;
  return (
    <div className="aw-field aw-prefix">
      <label htmlFor={id} className="aw-prefix-lead">{q.leadIn}</label>
      <input id={id} type="text" placeholder={q.placeholder || undefined} value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.target.value)} />
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
    <>
      <p className="aw-qtext">
        {q.lead && <><b>{q.lead}</b> </>}
        {content}
      </p>
      {q.text2 && <p className="aw-qtext" style={{ marginTop: 12 }}>{q.text2}</p>}
    </>
  );
}

// "n" is the number she sees beside the question (displayNumbers in
// auditQuestions.js), used in labels for screen readers.
export function AnswerField({ q, n, value, onChange, profileFacts, answers }) {
  switch (q.type) {
    case "text":
      return (
        <div className="aw-field">
          <AutoText value={value} ariaLabel={`Question ${n}`} placeholder={q.placeholder} onChange={onChange} />
        </div>
      );
    case "facts":
      return <FactsField q={q} value={value} onChange={onChange} profileFacts={profileFacts} />;
    case "sliders2":
      return <Sliders2Field q={q} value={value} onChange={onChange} />;
    case "multi":
      return <MultiField q={q} n={n} value={value} onChange={onChange} />;
    case "leakmap":
      return <LeakMapField value={value} onChange={onChange} />;
    case "taps":
      return <TapsField q={q} n={n} value={value} onChange={onChange} />;
    case "hours":
      return <HoursField value={value} onChange={onChange} />;
    case "lists2":
      return <Lists2Field q={q} value={value} onChange={onChange} answers={answers} />;
    case "rows5":
      return <Rows5Field q={q} value={value} onChange={onChange} />;
    case "single":
      return <SingleField q={q} value={value} onChange={onChange} />;
    case "readiness":
      return <ReadinessField q={q} value={value} onChange={onChange} />;
    case "rows":
      return <RowsField q={q} n={n} value={value} onChange={onChange} answers={answers} />;
    case "fields":
      return <FieldsField q={q} value={value} onChange={onChange} answers={answers} />;
    case "chips":
      return <ChipsField q={q} n={n} value={value} onChange={onChange} />;
    case "prefix":
      return <PrefixField q={q} value={value} onChange={onChange} />;
    default:
      return null;
  }
}
