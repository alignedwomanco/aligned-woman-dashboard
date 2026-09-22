import React, { useRef, useState } from "react";

/* One PayFast form, used by every cap. All caps are the same price, so the
   only thing that changes per card is the line and the colour choices, which
   ride along in PayFast's custom fields so the order can be fulfilled. */

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
const SITE_URL = "https://www.app.alignedwomanco.com";
const COUNTRIES = ["South Africa", "Botswana", "Lesotho", "Mauritius", "Mozambique", "Swaziland", "Zimbabwe"];

const inputStyle = { padding: "12px 14px", border: `1px solid ${C.rose}`, borderRadius: 10, background: C.white, color: C.ink, fontFamily: "inherit", fontSize: 15, minHeight: 44, width: "100%" };
const labelStyle = { fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: C.burgMid };

export default function PayFastForm({ item, price, onClose }) {
  const formRef = useRef(null);
  const [qty, setQty] = useState(1);
  const [err, setErr] = useState("");
  const amount = price * qty;

  const handleSubmit = (e) => {
    const f = formRef.current;
    const val = (n) => (f.elements[n]?.value || "").trim();
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
    setErr("");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(8,1,5,0.55)" }} onClick={onClose}>
      <div className="h-full w-full max-w-[480px] overflow-y-auto p-6 md:p-8 flex flex-col gap-6" style={{ background: C.bg }} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <div className="text-3xl" style={{ fontFamily: SERIF, color: C.burg }}>Buy a cap</div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full px-4 py-2" style={{ background: C.roseLight, color: C.ink, border: 0, minHeight: 44, cursor: "pointer" }}>Close</button>
        </div>

        <div className="rounded-2xl p-5 flex flex-col gap-1" style={{ background: C.white }}>
          <div className="text-lg" style={{ fontFamily: SERIF, color: C.burg }}>{item.line}</div>
          <div className="text-[13px] uppercase" style={{ color: C.burgMid, letterSpacing: "0.06em" }}>
            {item.cap} cap · {item.thread} embroidery · {item.placement}
          </div>
        </div>

        <form ref={formRef} action="https://payment.payfast.io/eng/process" method="post" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="cmd" value="_paynow" />
          <input type="hidden" name="receiver" value={RECEIVER} />
          <input type="hidden" name="return_url" value={SITE_URL} />
          <input type="hidden" name="cancel_url" value={SITE_URL} />
          <input type="hidden" name="notify_url" value={SITE_URL} />
          <input type="hidden" name="amount" value={amount} />
          <input type="hidden" name="item_name" value="Cap" />
          <input type="hidden" name="custom_str1" value={item.line} />
          <input type="hidden" name="custom_str2" value={`${item.cap} cap`} />
          <input type="hidden" name="custom_str3" value={`${item.thread} embroidery, ${item.placement}`} />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="pf-qty" style={labelStyle}>Quantity</label>
            <input
              id="pf-qty"
              name="custom_quantity"
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              required
              style={inputStyle}
            />
          </div>

          <div className="text-[11px] uppercase" style={{ letterSpacing: "0.12em", color: C.burgMid }}>Shipping address</div>
          <div className="flex flex-col gap-1.5"><label htmlFor="pf-line1" style={labelStyle}>Line 1</label><input id="pf-line1" name="line1" className="shipping" required style={inputStyle} /></div>
          <div className="flex flex-col gap-1.5"><label htmlFor="pf-line2" style={labelStyle}>Line 2</label><input id="pf-line2" name="line2" className="shipping" style={inputStyle} /></div>
          <div className="flex flex-col gap-1.5"><label htmlFor="pf-city" style={labelStyle}>City</label><input id="pf-city" name="city" className="shipping" required style={inputStyle} /></div>
          <div className="flex flex-col gap-1.5"><label htmlFor="pf-region" style={labelStyle}>Province</label><input id="pf-region" name="region" className="shipping" required style={inputStyle} /></div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pf-country" style={labelStyle}>Country</label>
            <select id="pf-country" name="country" className="shipping" required defaultValue="" style={inputStyle}>
              <option value="" disabled>- Select -</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5"><label htmlFor="pf-code" style={labelStyle}>Postal code</label><input id="pf-code" name="code" className="shipping" required style={inputStyle} /></div>

          <div className="flex justify-between text-lg font-medium pt-4" style={{ borderTop: `1px solid ${C.roseLight}` }}>
            <span>{qty} cap{qty === 1 ? "" : "s"}</span>
            <span>R{amount.toLocaleString("en-ZA")}</span>
          </div>
          {err && <div className="text-sm" style={{ color: C.burgMid }}>{err}</div>}
          <button type="submit" className="aw-buy rounded-full py-4 text-[15px] font-medium" style={{ background: C.btn, color: C.btnText, border: 0, minHeight: 44, cursor: "pointer" }}>
            Buy now
          </button>
          <div className="text-xs" style={{ color: C.burgMid, lineHeight: 1.5 }}>
            You will be taken to PayFast to pay securely. 100% of the cap price goes to Women For Change. Shipping is charged at cost and never comes out of the donation.
          </div>
        </form>
      </div>
    </div>
  );
}