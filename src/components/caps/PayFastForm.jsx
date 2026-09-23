import React, { useEffect, useRef, useState } from "react";

/* The caps checkout. It receives the whole order (every cap line the buyer
   added), collects the compulsory delivery details and hands one payment to
   PayFast. Everything the order sheet needs rides along in PayFast's custom
   fields, because PayFast only sends its own fields back to payfastNotify. */

const C = {
  ink: "#080105",
  burg: "#7A1B34",
  burgMid: "#6B1642",
  rose: "#C4847A",
  roseLight: "#E8B4AE",
  white: "#FFFFFF",
  bg: "#F6EFE8",
  btn: "#7A1B34",
  btnText: "#C4837B",
};
const SERIF = "'Libre Baskerville', Baskerville, 'DM Serif Display', Georgia, serif";

const RECEIVER = "32598411";
const RETURN_URL = "https://app.alignedwomanco.com/caps";
const CANCEL_URL = "https://app.alignedwomanco.com/caps#caps";
// Checked September 22, 2026: this app-domain route reaches the function
// (answers GET with 405). The api.base44.com form returned 404, so it is not used.
const NOTIFY_URL = "https://new-aligned-woman-dashboard-copy-2303f1af.base44.app/functions/payfastNotify";
const COUNTRIES = ["South Africa", "Botswana", "Lesotho", "Mauritius", "Mozambique", "Swaziland", "Zimbabwe"];

// Most caps in one order, across every line.
export const MAX_CAPS = 20;

const inputStyle = { padding: "12px 14px", border: `1px solid ${C.rose}`, borderRadius: 10, background: C.white, color: C.ink, fontFamily: "inherit", fontSize: 15, minHeight: 44, width: "100%" };
const labelStyle = { fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: C.burgMid };

/* Minus, count, plus. Shared by the product cards and the checkout, so a
   quantity can never be typed wrong. */
export function QtyStepper({ value, onChange, min = 1, max = MAX_CAPS, label = "cap" }) {
  const btn = { width: 44, height: 44, borderRadius: "100%", border: `1px solid ${C.rose}`, background: C.white, color: C.burg, fontSize: 20, lineHeight: 1, cursor: "pointer" };
  return (
    <div className="inline-flex items-center gap-3">
      <button type="button" aria-label={`One fewer ${label}`} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} style={{ ...btn, opacity: value <= min ? 0.4 : 1 }}>
        -
      </button>
      <span aria-live="polite" className="text-lg font-medium" style={{ minWidth: 24, textAlign: "center", color: C.ink }}>{value}</span>
      <button type="button" aria-label={`One more ${label}`} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} style={{ ...btn, opacity: value >= max ? 0.4 : 1 }}>
        +
      </button>
    </div>
  );
}

/* Each cap line travels as line|cap|thread|placement|qty, joined with ;.
   A line fills custom_str1 whole, and any that do not fit move to custom_str2,
   so no line is ever cut in half. About 40 characters a line, so all six
   designs fit with room to spare. */
function encodeItems(items) {
  const clean = (s) => String(s == null ? "" : s).replace(/[|;]/g, " ").trim();
  const entries = items.map((i) => [i.line, i.cap, i.thread, i.placement, i.qty].map(clean).join("|"));
  const first = [];
  const second = [];
  let used = 0;
  entries.forEach((entry) => {
    const cost = (first.length ? 1 : 0) + entry.length;
    if (second.length === 0 && used + cost <= 255) {
      first.push(entry);
      used += cost;
    } else {
      second.push(entry);
    }
  });
  return [first.join(";"), second.join(";").slice(0, 255)];
}

export default function PayFastForm({ items, price, onChangeQty, onClose }) {
  const formRef = useRef(null);
  const [err, setErr] = useState("");

  const capCount = items.reduce((n, i) => n + i.qty, 0);
  const amount = price * capCount;
  const [itemsA, itemsB] = encodeItems(items);
  const description = items.map((i) => `${i.qty} x ${i.line}`).join(", ").slice(0, 255);

  useEffect(() => {
    if (capCount > 0 && err === "Your order is empty.") setErr("");
  }, [capCount, err]);

  const handleSubmit = (e) => {
    const f = formRef.current;
    const val = (n) => (f.elements[n]?.value || "").trim();
    if (capCount < 1) {
      e.preventDefault();
      setErr("Your order is empty.");
      return;
    }
    if (capCount > MAX_CAPS) {
      e.preventDefault();
      setErr(`One order can hold up to ${MAX_CAPS} caps.`);
      return;
    }
    if (!val("first_name") || !val("last_name")) {
      e.preventDefault();
      setErr("Add your name and surname.");
      return;
    }
    if (val("phone").replace(/[^0-9]/g, "").length < 9) {
      e.preventDefault();
      setErr("Add a phone number the courier can reach you on.");
      return;
    }
    if (!val("line1") || !val("city") || !val("region") || !val("code")) {
      e.preventDefault();
      setErr("Complete all the mandatory address fields.");
      return;
    }
    if (!val("country")) {
      e.preventDefault();
      setErr("Select a country.");
      return;
    }
    // Filled in on the way out, once the form is known to be complete. The
    // address reads the way a courier writes it, postal code before country.
    f.elements["m_payment_id"].value = `CAP-${Date.now()}`;
    f.elements["custom_str3"].value = val("phone").slice(0, 255);
    f.elements["custom_str4"].value = `${val("first_name").replace(/\|/g, "")} | ${val("last_name").replace(/\|/g, "")}`.slice(0, 255);
    f.elements["custom_str5"].value = [
      val("line1"),
      val("line2"),
      val("city"),
      val("region"),
      val("code"),
      val("country"),
    ]
      .filter(Boolean)
      .join(", ")
      .slice(0, 255);
    setErr("");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(8,1,5,0.55)" }} onClick={onClose}>
      <div className="h-full w-full max-w-[480px] overflow-y-auto p-6 md:p-8 flex flex-col gap-6" style={{ background: C.bg }} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <div className="text-3xl" style={{ fontFamily: SERIF, color: C.burg }}>Your order</div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full px-4 py-2" style={{ background: C.roseLight, color: C.ink, border: 0, minHeight: 44, cursor: "pointer" }}>Close</button>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl p-5 text-[15px]" style={{ background: C.white, color: C.burgMid }}>
            Your order is empty. Close this and add a cap.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((i) => (
              <div key={i.id} className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: C.white }}>
                <div className="flex flex-col gap-1">
                  <div className="text-lg" style={{ fontFamily: SERIF, color: C.burg }}>{i.line}</div>
                  <div className="text-[12px] uppercase" style={{ color: C.burgMid, letterSpacing: "0.06em" }}>
                    {i.cap} cap · {i.thread} embroidery · {i.placement}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <QtyStepper
                    value={i.qty}
                    onChange={(q) => onChangeQty(i.id, q)}
                    max={Math.max(i.qty, MAX_CAPS - (capCount - i.qty))}
                    label={i.line}
                  />
                  <div className="flex items-center gap-4">
                    <span className="text-[15px] font-medium" style={{ color: C.burg }}>R{(price * i.qty).toLocaleString("en-ZA")}</span>
                    <button type="button" onClick={() => onChangeQty(i.id, 0)} className="text-[13px]" style={{ background: "none", border: 0, color: C.burgMid, textDecoration: "underline", cursor: "pointer", minHeight: 44 }}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <form ref={formRef} action="https://payment.payfast.io/eng/process" method="post" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="cmd" value="_paynow" />
          <input type="hidden" name="receiver" value={RECEIVER} />
          <input type="hidden" name="return_url" value={RETURN_URL} />
          <input type="hidden" name="cancel_url" value={CANCEL_URL} />
          <input type="hidden" name="notify_url" value={NOTIFY_URL} />
          {/* PayFast charges exactly this amount and does not multiply by
              custom_quantity (tested September 22, 2026), so the full total
              for the whole order is sent here. */}
          <input type="hidden" name="amount" value={amount.toFixed(2)} />
          <input type="hidden" name="item_name" value="Caps4Cause" />
          <input type="hidden" name="item_description" value={description} />
          <input type="hidden" name="custom_quantity" value={capCount} />
          {/* What payfastNotify reads back:
              custom_int2  2, marks this multi-cap order layout
              custom_int1  total caps in the order
              custom_str1  cap lines, line|cap|thread|placement|qty joined with ;
              custom_str2  cap lines that did not fit in custom_str1
              custom_str3  phone (filled in on submit)
              custom_str4  name | surname (filled in on submit)
              custom_str5  shipping address (filled in on submit) */}
          <input type="hidden" name="custom_int2" value="2" />
          <input type="hidden" name="custom_int1" value={capCount} />
          <input type="hidden" name="custom_str1" value={itemsA} />
          <input type="hidden" name="custom_str2" value={itemsB} />
          {/* Filled in on submit, so these stay uncontrolled: a re-render must
              never reset them to empty before the form posts to PayFast. */}
          <input type="hidden" name="m_payment_id" defaultValue="" />
          <input type="hidden" name="custom_str3" defaultValue="" />
          <input type="hidden" name="custom_str4" defaultValue="" />
          <input type="hidden" name="custom_str5" defaultValue="" />

          <div className="text-[11px] uppercase" style={{ letterSpacing: "0.12em", color: C.burgMid }}>Your details</div>
          <div className="flex flex-col gap-1.5"><label htmlFor="pf-first" style={labelStyle}>Name</label><input id="pf-first" name="first_name" autoComplete="given-name" required style={inputStyle} /></div>
          <div className="flex flex-col gap-1.5"><label htmlFor="pf-last" style={labelStyle}>Surname</label><input id="pf-last" name="last_name" autoComplete="family-name" required style={inputStyle} /></div>
          <div className="flex flex-col gap-1.5"><label htmlFor="pf-phone" style={labelStyle}>Phone for the courier</label><input id="pf-phone" name="phone" type="tel" autoComplete="tel" required style={inputStyle} /></div>

          <div className="text-[11px] uppercase" style={{ letterSpacing: "0.12em", color: C.burgMid }}>Shipping address</div>
          <div className="flex flex-col gap-1.5"><label htmlFor="pf-line1" style={labelStyle}>Line 1</label><input id="pf-line1" name="line1" className="shipping" autoComplete="address-line1" required style={inputStyle} /></div>
          <div className="flex flex-col gap-1.5"><label htmlFor="pf-line2" style={labelStyle}>Line 2</label><input id="pf-line2" name="line2" className="shipping" autoComplete="address-line2" style={inputStyle} /></div>
          <div className="flex flex-col gap-1.5"><label htmlFor="pf-city" style={labelStyle}>City</label><input id="pf-city" name="city" className="shipping" autoComplete="address-level2" required style={inputStyle} /></div>
          <div className="flex flex-col gap-1.5"><label htmlFor="pf-region" style={labelStyle}>Province</label><input id="pf-region" name="region" className="shipping" autoComplete="address-level1" required style={inputStyle} /></div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pf-country" style={labelStyle}>Country</label>
            <select id="pf-country" name="country" className="shipping" required defaultValue="" style={inputStyle}>
              <option value="" disabled>- Select -</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5"><label htmlFor="pf-code" style={labelStyle}>Postal code</label><input id="pf-code" name="code" className="shipping" autoComplete="postal-code" required style={inputStyle} /></div>

          <div className="flex justify-between text-lg font-medium pt-4" style={{ borderTop: `1px solid ${C.roseLight}` }}>
            <span>{capCount} cap{capCount === 1 ? "" : "s"}</span>
            <span>R{amount.toLocaleString("en-ZA")}</span>
          </div>
          {err && <div className="text-sm" style={{ color: C.burgMid }}>{err}</div>}
          <button
            type="submit"
            disabled={capCount < 1}
            className="aw-buy rounded-full py-4 text-[15px] font-medium"
            style={{ background: C.btn, color: C.btnText, border: 0, minHeight: 44, cursor: capCount < 1 ? "not-allowed" : "pointer", opacity: capCount < 1 ? 0.5 : 1 }}
          >
            Pay R{amount.toLocaleString("en-ZA")} with PayFast
          </button>
          <div className="text-xs" style={{ color: C.burgMid, lineHeight: 1.5 }}>
            You will be taken to PayFast to pay securely. 100% of the cap price goes to Women For Change. Shipping is charged at cost and never comes out of the donation.
          </div>
        </form>
      </div>
    </div>
  );
}
