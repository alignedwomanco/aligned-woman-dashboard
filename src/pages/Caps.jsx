import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

/* ------------------------------------------------------------------
   CAMPAIGN SETTINGS
   Everything the campaign needs to change lives here.
------------------------------------------------------------------ */
const PRICE = 350;                 // ZAR per cap
const RUN_SIZE = 200;              // caps in the run
const SOLD = 0;                    // update as orders are paid, or wire to CapOrder later
const SHIPPING = 0;                // courier fee at cost in ZAR; 0 until the courier quote is in
const PAYMENT_LINK = "";           // Stripe or PayFast link. Empty = order saved, payment link sent by email.
const DONATION_LINK = "";          // Women For Change direct donation link
const LEAD_TIME = "7 working days";
const HERO_IMAGE = "";             // six-cap flat lay. Empty renders a toned placeholder.

const CAP_COLOURS = ["Olive", "Stone", "Pink", "Purple"];
const THREAD_COLOURS = ["White", "Cream", "Burgundy", "Rose pink"];

const LINES = [
  { id: "stay", line: "you stay home", placement: "front", swatch: "#CDC3AC", ink: "#4A0E2E", cap: "Stone", thread: "Burgundy" },
  { id: "close", line: "you're too close", placement: "back", swatch: "#4B2478", ink: "#E8B4AE", cap: "Purple", thread: "Rose pink" },
  { id: "kempton", line: "coming for kempton", placement: "front", swatch: "#5C6134", ink: "#F6EFE8", cap: "Olive", thread: "Cream" },
  { id: "tryme", line: "try me", placement: "front", swatch: "#F2C4CE", ink: "#4A0E2E", cap: "Pink", thread: "Burgundy" },
  { id: "no", line: "how about no", placement: "front", swatch: "#5C6134", ink: "#F6EFE8", cap: "Olive", thread: "Cream" },
  { id: "bitch", line: "100% that bitch", placement: "front", swatch: "#4B2478", ink: "#E8B4AE", cap: "Purple", thread: "Rose pink" },
];

const C = {
  bg: "#F6EFE8",
  ink: "#080105",
  burg: "#4A0E2E",
  burgMid: "#6B1642",
  rose: "#C4847A",
  roseLight: "#E8B4AE",
  white: "#FFFFFF",
};
const SERIF = "'Libre Baskerville', Baskerville, 'DM Serif Display', Georgia, serif";
const SANS = "'Montserrat', system-ui, sans-serif";

const money = (n) => `R${Number(n).toLocaleString("en-ZA")}`;

/* Every mention of Women For Change links to their site. */
function WFC() {
  return (
    <a href="https://womenforchange.co.za/" target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: "2px" }}>
      Women For Change
    </a>
  );
}

/* ------------------------------------------------------------------ */

export default function Caps() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    const id = "aw-caps-fonts";
    if (!document.getElementById(id)) {
      const l = document.createElement("link");
      l.id = id;
      l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@300;400;500&display=swap";
      document.head.appendChild(l);
    }
    document.title = "You stay home. Caps for Women For Change | The Aligned Woman Co.";
  }, []);

  const addToCart = (item) => {
    setCart((c) => {
      const key = `${item.id}|${item.cap}|${item.thread}`;
      const i = c.findIndex((x) => x.key === key);
      if (i >= 0) {
        const n = [...c];
        n[i] = { ...n[i], quantity: n[i].quantity + 1 };
        return n;
      }
      return [...c, { ...item, key, quantity: 1 }];
    });
    setCartOpen(true);
  };
  const setQty = (key, q) =>
    setCart((c) => c.map((x) => (x.key === key ? { ...x, quantity: Math.max(0, q) } : x)).filter((x) => x.quantity > 0));

  const capCount = cart.reduce((s, x) => s + x.quantity, 0);
  const subtotal = capCount * PRICE;

  return (
    <div style={{ background: C.bg, color: C.ink, fontFamily: SANS, fontWeight: 300, minHeight: "100vh" }}>
      <Nav capCount={capCount} onCart={() => setCartOpen(true)} />
      <Hero />
      <StatBand />
      <Shop onAdd={addToCart} />
      <Money />
      <Why />
      <Faq />
      <Footer />

      {cartOpen && !checkout && (
        <CartDrawer
          cart={cart}
          setQty={setQty}
          subtotal={subtotal}
          onClose={() => setCartOpen(false)}
          onCheckout={() => setCheckout(true)}
        />
      )}
      {checkout && !done && (
        <CheckoutModal
          cart={cart}
          capCount={capCount}
          subtotal={subtotal}
          onClose={() => setCheckout(false)}
          onDone={(order) => { setDone(order); setCart([]); }}
        />
      )}
      {done && <DoneModal order={done} onClose={() => { setDone(null); setCheckout(false); setCartOpen(false); }} />}
    </div>
  );
}

/* ---------------- Sections ---------------- */

function Nav({ capCount, onCart }) {
  return (
    <div className="flex items-center justify-between px-6 md:px-24 py-6" style={{ borderBottom: `1px solid ${C.roseLight}` }}>
      <a href="/" style={{ fontFamily: SERIF, fontSize: 20, color: C.ink, textDecoration: "none" }}>The Aligned Woman Co.</a>
      <div className="flex items-center gap-4 md:gap-8 text-[13px] uppercase" style={{ letterSpacing: "0.12em" }}>
        <a href="#caps" className="hidden md:inline" style={{ color: C.ink, textDecoration: "none" }}>The caps</a>
        <a href="#money" className="hidden md:inline" style={{ color: C.ink, textDecoration: "none" }}>Where the money goes</a>
        <a href="#why" className="hidden md:inline" style={{ color: C.ink, textDecoration: "none" }}>Why</a>
        <button type="button" onClick={onCart} className="rounded-full px-6 py-3 font-medium" style={{ background: C.rose, color: C.ink, minHeight: 44 }}>
          Cart{capCount > 0 ? ` (${capCount})` : ""}
        </button>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <div className="grid md:grid-cols-2 gap-10 md:gap-16 px-6 md:px-24 pt-16 pb-12 md:pt-24 md:pb-20 items-center">
      <div className="flex flex-col gap-7">
        <div className="text-[13px] uppercase font-medium" style={{ letterSpacing: "0.16em", color: C.burgMid }}>
          {RUN_SIZE} caps. 100% to <WFC />.
        </div>
        <h1 className="m-0 text-6xl md:text-[88px] leading-none" style={{ fontFamily: SERIF, fontWeight: 400, color: C.burg }}>
          You stay home.
        </h1>
        <p className="m-0 text-lg md:text-xl max-w-[560px]" style={{ lineHeight: 1.55 }}>
          After nine women were found dead in Ekurhuleni, the police told women in Kempton Park not to walk or run alone. This is the country's answer, embroidered on a cap.
        </p>
        <div className="flex flex-wrap items-center gap-5 mt-2">
          <a href="#caps" className="rounded-full px-9 py-5 text-[15px] font-medium" style={{ background: C.rose, color: C.ink, textDecoration: "none", letterSpacing: "0.04em" }}>
            Buy a cap for {money(PRICE)}
          </a>
          <div className="text-sm" style={{ color: C.burgMid }}>Every cent goes to <WFC />.</div>
        </div>
        <div className="flex items-baseline gap-3 mt-4 pt-6" style={{ borderTop: `1px solid ${C.roseLight}` }}>
          <div className="text-5xl" style={{ fontFamily: SERIF, color: C.burg }}>{SOLD}</div>
          <div className="text-[15px] uppercase" style={{ letterSpacing: "0.06em" }}>of {RUN_SIZE} caps sold</div>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {HERO_IMAGE ? (
          <img src={HERO_IMAGE} alt="The six caps, laid flat" className="w-full rounded-2xl object-cover" style={{ height: 480 }} />
        ) : (
          <div className="w-full rounded-2xl flex items-center justify-center text-center p-6 text-sm uppercase" style={{ height: 480, background: C.roseLight, color: C.burg, letterSpacing: "0.1em" }}>
            Six-cap flat lay. Drop the image URL into HERO_IMAGE.
          </div>
        )}
        <div className="text-xs uppercase text-right" style={{ letterSpacing: "0.1em", color: C.burgMid }}>Caps and embroidery sponsored by Barron</div>
      </div>
    </div>
  );
}

function StatBand() {
  const stats = [
    [String(RUN_SIZE), "caps in the run. When they're gone, they're gone."],
    ["100%", <>of proceeds to <WFC />. Barron covers the caps and embroidery, so there is no cost of goods to deduct.</>],
    [money(RUN_SIZE * PRICE), <>to <WFC /> if every cap sells. You decide how close we get.</>],
  ];
  return (
    <div className="grid md:grid-cols-3 gap-8 md:gap-12 px-6 md:px-24 py-12" style={{ background: C.burg, color: C.bg }}>
      {stats.map(([n, t]) => (
        <div key={n} className="flex flex-col gap-2">
          <div className="text-4xl" style={{ fontFamily: SERIF }}>{n}</div>
          <div className="text-sm" style={{ lineHeight: 1.5, color: C.roseLight }}>{t}</div>
        </div>
      ))}
    </div>
  );
}

function Shop({ onAdd }) {
  return (
    <div id="caps" className="px-6 md:px-24 pt-16 md:pt-24 pb-16 flex flex-col gap-10">
      <div className="flex flex-col gap-3 max-w-[720px]">
        <h2 className="m-0 text-4xl md:text-5xl" style={{ fontFamily: SERIF, fontWeight: 400, color: C.burg }}>Six lines women shouldn't have to say.</h2>
        <p className="m-0 text-[17px]" style={{ lineHeight: 1.6 }}>
          Barron 6-panel heavy brushed cotton cap, pre-curved peak, low profile, adjustable closure. One size. Four colours: olive, stone, pink and purple. {money(PRICE)} each.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {LINES.map((l) => <ProductCard key={l.id} item={l} onAdd={onAdd} />)}
      </div>
      <div className="text-sm" style={{ color: C.burgMid }}>Shipping is charged at cost and never comes out of the donation.</div>
    </div>
  );
}

function ProductCard({ item, onAdd }) {
  const [cap, setCap] = useState(item.cap);
  const [thread, setThread] = useState(item.thread);
  const selectStyle = { flexGrow: 1, padding: "12px 14px", border: `1px solid ${C.rose}`, borderRadius: 10, background: C.white, color: C.ink, fontFamily: "inherit", fontSize: 14, minHeight: 44, width: "100%" };
  const labelStyle = { fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: C.burgMid };
  return (
    <div className="flex flex-col gap-4 rounded-2xl p-6" style={{ background: C.white }}>
      <div className="rounded-xl flex items-center justify-center" style={{ height: 220, background: item.swatch }}>
        <div className="text-[26px] text-center px-4" style={{ fontFamily: SERIF, color: item.ink }}>{item.line}</div>
      </div>
      <div className="flex justify-between items-baseline">
        <div className="text-xl" style={{ fontFamily: SERIF, color: C.burg }}>{item.line}</div>
        <div className="text-sm font-medium">{money(PRICE)}</div>
      </div>
      <div className="text-[13px] uppercase" style={{ color: C.burgMid, letterSpacing: "0.06em" }}>Embroidered on the {item.placement}</div>
      <div className="flex gap-3">
        <div className="flex flex-col gap-1.5 flex-1">
          <label htmlFor={`cap-${item.id}`} style={labelStyle}>Cap colour</label>
          <select id={`cap-${item.id}`} value={cap} onChange={(e) => setCap(e.target.value)} style={selectStyle}>
            {CAP_COLOURS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5 flex-1">
          <label htmlFor={`thread-${item.id}`} style={labelStyle}>Embroidery colour</label>
          <select id={`thread-${item.id}`} value={thread} onChange={(e) => setThread(e.target.value)} style={selectStyle}>
            {THREAD_COLOURS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onAdd({ id: item.id, line: item.line, placement: item.placement, cap, thread })}
        className="rounded-full py-4 text-sm font-medium"
        style={{ background: C.rose, color: C.ink, border: 0, minHeight: 44, cursor: "pointer" }}
      >
        Add to cart
      </button>
    </div>
  );
}

function Money() {
  const partners = [
    ["Beneficiary", <WFC />, "Registered NPO. 100% of proceeds."],
    ["Production partner", "Barron", "Caps and embroidery, sponsored in full."],
    ["Run by", "The Aligned Woman Co.", "Design, sales, fulfilment and PR. No margin."],
    ["Design and illustration", "sadhana.ai / creative-studio", "Artwork and campaign visuals, donated."],
  ];
  return (
    <div id="money" className="grid md:grid-cols-2 gap-10 md:gap-16 px-6 md:px-24 py-16" style={{ borderTop: `1px solid ${C.roseLight}` }}>
      <div className="flex flex-col gap-4">
        <h2 className="m-0 text-4xl" style={{ fontFamily: SERIF, fontWeight: 400, color: C.burg }}>Where the money goes.</h2>
        <p className="m-0 text-[17px]" style={{ lineHeight: 1.6 }}>Every rand you pay for a cap goes to <WFC />, the registered NPO whose petition led to gender-based violence and femicide being declared a national disaster in November 2025.</p>
        <p className="m-0 text-[17px]" style={{ lineHeight: 1.6 }}>Barron is sponsoring the caps and the embroidery. sadhana.ai / creative-studio is donating the design and illustration. We are covering the platform and the fulfilment ourselves. That is how 100% stays 100%.</p>
        <p className="m-0 text-[17px]" style={{ lineHeight: 1.6 }}>When the run sells out we will publish the total, the transfer confirmation and <WFC />'s receipt, here and on our channels.</p>
      </div>
      <div className="flex flex-col gap-4">
        {partners.map(([k, n, d]) => (
          <div key={k} className="rounded-2xl p-7 flex flex-col gap-1.5" style={{ background: C.white }}>
            <div className="text-xs uppercase" style={{ letterSpacing: "0.12em", color: C.burgMid }}>{k}</div>
            <div className="text-2xl" style={{ fontFamily: SERIF, color: C.burg }}>{n}</div>
            <div className="text-sm" style={{ lineHeight: 1.5 }}>{d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Why() {
  return (
    <div id="why" className="grid md:grid-cols-2 gap-10 md:gap-16 px-6 md:px-24 py-16 md:py-24" style={{ background: C.ink, color: C.bg }}>
      <div className="flex flex-col gap-5">
        <h2 className="m-0 text-4xl" style={{ fontFamily: SERIF, fontWeight: 400, color: C.roseLight }}>Why a cap.</h2>
        <p className="m-0 text-[17px]" style={{ lineHeight: 1.65 }}>We have all posted. We have all worn black on a Friday. This is the one with a number attached.</p>
        <p className="m-0 text-[17px]" style={{ lineHeight: 1.65 }}>A cap is worn on the head. It is in every selfie, every memorial run, every school pickup. It says the line so you don't have to, to the person who needs to hear it.</p>
        <p className="m-0 text-[17px]" style={{ lineHeight: 1.65 }}>Seven women are killed every day in South Africa, according to the South African Medical Research Council's 20-year femicide study. Nine were found in Ekurhuleni in two months. We are not going to fix that with a cap. We are going to send all proceeds to the people who are working on it.</p>
      </div>
      <div className="flex flex-col justify-end gap-3">
        <div className="text-5xl md:text-[64px]" style={{ fontFamily: SERIF, lineHeight: 1.05, color: C.bg }}>Stop telling women how to avoid femicide.</div>
        <div className="text-[13px] uppercase" style={{ letterSpacing: "0.12em", color: C.rose }}>The country's answer, September 2026</div>
      </div>
    </div>
  );
}

function Faq() {
  const qs = [
    ["When will my cap arrive?", `Caps are embroidered to order by Barron. Allow ${LEAD_TIME} from close of the run, plus courier time.`],
    ["What size?", "One size, adjustable closure at the back. Fits most adults."],
    ["Can I just donate?", DONATION_LINK ? null : "Yes. Give directly to Women For Change. The cap is for wearing the line in public."],
  ];
  return (
    <div className="grid md:grid-cols-3 gap-10 px-6 md:px-24 py-16 md:py-20">
      {qs.map(([q, a]) => (
        <div key={q} className="flex flex-col gap-2">
          <div className="text-xl" style={{ fontFamily: SERIF, color: C.burg }}>{q}</div>
          <div className="text-[15px]" style={{ lineHeight: 1.6 }}>
            {a ?? (<>Yes. Give directly to <WFC /> <a href={DONATION_LINK} target="_blank" rel="noreferrer" style={{ color: C.burg }}>here</a>. The cap is for wearing the line in public.</>)}
          </div>
        </div>
      ))}
    </div>
  );
}

function Footer() {
  return (
    <div className="flex flex-col md:flex-row gap-2 justify-between px-6 md:px-24 py-8 text-xs uppercase" style={{ borderTop: `1px solid ${C.roseLight}`, letterSpacing: "0.08em", color: C.burgMid }}>
      <div>The Aligned Woman Co.</div>
      <div>#TheAlignedWomanBlueprint · #SouthAfricanWomen</div>
    </div>
  );
}

/* ---------------- Cart and checkout ---------------- */

function Overlay({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(8,1,5,0.55)" }} onClick={onClose}>
      <div className="h-full w-full max-w-[480px] overflow-y-auto p-6 md:p-8 flex flex-col gap-6" style={{ background: C.bg }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function CartDrawer({ cart, setQty, subtotal, onClose, onCheckout }) {
  return (
    <Overlay onClose={onClose}>
      <div className="flex justify-between items-center">
        <div className="text-3xl" style={{ fontFamily: SERIF, color: C.burg }}>Your cart</div>
        <button type="button" onClick={onClose} aria-label="Close cart" className="rounded-full px-4 py-2" style={{ background: C.roseLight, color: C.ink, border: 0, minHeight: 44 }}>Close</button>
      </div>
      {cart.length === 0 ? (
        <div className="text-[15px]">Nothing in here yet. Pick a line.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {cart.map((x) => (
            <div key={x.key} className="rounded-2xl p-5 flex flex-col gap-2" style={{ background: C.white }}>
              <div className="text-lg" style={{ fontFamily: SERIF, color: C.burg }}>{x.line}</div>
              <div className="text-[13px] uppercase" style={{ color: C.burgMid, letterSpacing: "0.06em" }}>{x.cap} cap · {x.thread} embroidery · {x.placement}</div>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-2">
                  <button type="button" aria-label="Fewer" onClick={() => setQty(x.key, x.quantity - 1)} className="rounded-full w-11 h-11" style={{ background: C.roseLight, border: 0 }}>−</button>
                  <div className="w-8 text-center">{x.quantity}</div>
                  <button type="button" aria-label="More" onClick={() => setQty(x.key, x.quantity + 1)} className="rounded-full w-11 h-11" style={{ background: C.roseLight, border: 0 }}>+</button>
                </div>
                <div className="font-medium">{money(x.quantity * PRICE)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-auto flex flex-col gap-3 pt-4" style={{ borderTop: `1px solid ${C.roseLight}` }}>
        <div className="flex justify-between text-[15px]"><span>Caps</span><span>{money(subtotal)}</span></div>
        <div className="flex justify-between text-[15px]"><span>Shipping</span><span>{SHIPPING ? money(SHIPPING) : "At cost, confirmed at checkout"}</span></div>
        <div className="text-sm" style={{ color: C.burgMid }}>100% of the cap price goes to Women For Change.</div>
        <button type="button" disabled={cart.length === 0} onClick={onCheckout} className="rounded-full py-4 text-[15px] font-medium" style={{ background: C.rose, color: C.ink, border: 0, minHeight: 44, opacity: cart.length ? 1 : 0.5 }}>
          Checkout
        </button>
      </div>
    </Overlay>
  );
}

function CheckoutModal({ cart, capCount, subtotal, onClose, onDone }) {
  const [f, setF] = useState({ customer_name: "", email: "", phone: "", delivery_method: "courier", address: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const shipping = f.delivery_method === "courier" ? SHIPPING : 0;
  const total = subtotal + shipping;
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const inputStyle = { padding: "12px 14px", border: `1px solid ${C.rose}`, borderRadius: 10, background: C.white, color: C.ink, fontFamily: "inherit", fontSize: 15, minHeight: 44, width: "100%" };
  const labelStyle = { fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: C.burgMid };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!f.customer_name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) { setErr("Please add your name and a valid email."); return; }
    if (f.delivery_method === "courier" && !f.address.trim()) { setErr("Please add a delivery address, or choose collection."); return; }
    setBusy(true);
    try {
      const order = await base44.entities.CapOrder.create({
        ...f,
        items: cart.map((x) => ({ line: x.line, cap_colour: x.cap, thread_colour: x.thread, placement: x.placement, quantity: x.quantity, unit_price: PRICE })),
        cap_count: capCount,
        subtotal,
        shipping,
        total,
        status: "pending_payment",
      });
      if (PAYMENT_LINK) {
        const url = new URL(PAYMENT_LINK);
        url.searchParams.set("prefilled_email", f.email);
        url.searchParams.set("client_reference_id", order.id);
        window.location.href = url.toString();
        return;
      }
      onDone(order);
    } catch (ex) {
      setErr("Something went wrong saving your order. Please try again or email hello@alignedwomanco.com.");
      setBusy(false);
    }
  };

  return (
    <Overlay onClose={onClose}>
      <div className="flex justify-between items-center">
        <div className="text-3xl" style={{ fontFamily: SERIF, color: C.burg }}>Checkout</div>
        <button type="button" onClick={onClose} aria-label="Back to cart" className="rounded-full px-4 py-2" style={{ background: C.roseLight, color: C.ink, border: 0, minHeight: 44 }}>Back</button>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5"><label htmlFor="co-name" style={labelStyle}>Full name</label><input id="co-name" value={f.customer_name} onChange={set("customer_name")} style={inputStyle} autoComplete="name" /></div>
        <div className="flex flex-col gap-1.5"><label htmlFor="co-email" style={labelStyle}>Email</label><input id="co-email" type="email" value={f.email} onChange={set("email")} style={inputStyle} autoComplete="email" /></div>
        <div className="flex flex-col gap-1.5"><label htmlFor="co-phone" style={labelStyle}>Phone</label><input id="co-phone" type="tel" value={f.phone} onChange={set("phone")} style={inputStyle} autoComplete="tel" /></div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="co-delivery" style={labelStyle}>Delivery</label>
          <select id="co-delivery" value={f.delivery_method} onChange={set("delivery_method")} style={inputStyle}>
            <option value="courier">Courier (charged at cost)</option>
            <option value="collect">Collect</option>
          </select>
        </div>
        {f.delivery_method === "courier" && (
          <div className="flex flex-col gap-1.5"><label htmlFor="co-address" style={labelStyle}>Delivery address</label><textarea id="co-address" rows={3} value={f.address} onChange={set("address")} style={inputStyle} autoComplete="street-address" /></div>
        )}
        <div className="flex flex-col gap-1.5"><label htmlFor="co-notes" style={labelStyle}>Notes (optional)</label><input id="co-notes" value={f.notes} onChange={set("notes")} style={inputStyle} /></div>

        <div className="flex flex-col gap-2 pt-4" style={{ borderTop: `1px solid ${C.roseLight}` }}>
          <div className="flex justify-between text-[15px]"><span>{capCount} cap{capCount === 1 ? "" : "s"}</span><span>{money(subtotal)}</span></div>
          <div className="flex justify-between text-[15px]"><span>Shipping</span><span>{f.delivery_method === "collect" ? "Free" : shipping ? money(shipping) : "Confirmed by email"}</span></div>
          <div className="flex justify-between text-lg font-medium"><span>Total</span><span>{money(total)}</span></div>
        </div>
        {err && <div className="text-sm" style={{ color: C.burgMid }}>{err}</div>}
        <button type="submit" disabled={busy} className="rounded-full py-4 text-[15px] font-medium" style={{ background: C.rose, color: C.ink, border: 0, minHeight: 44, opacity: busy ? 0.6 : 1 }}>
          {busy ? "Saving your order" : PAYMENT_LINK ? "Continue to payment" : "Place order"}
        </button>
        <div className="text-xs" style={{ color: C.burgMid, lineHeight: 1.5 }}>100% of the cap price goes to <WFC />. Shipping is charged at cost and never comes out of the donation.</div>
      </form>
    </Overlay>
  );
}

function DoneModal({ order, onClose }) {
  return (
    <Overlay onClose={onClose}>
      <div className="text-4xl" style={{ fontFamily: SERIF, color: C.burg }}>Thank you.</div>
      <p className="m-0 text-[17px]" style={{ lineHeight: 1.6 }}>
        Your order for {order.cap_count} cap{order.cap_count === 1 ? "" : "s"} is saved. We will email {order.email} with payment details and, once paid, your cap goes into Barron's embroidery run.
      </p>
      <p className="m-0 text-[15px]" style={{ lineHeight: 1.6, color: C.burgMid }}>Order reference: {order.id}</p>
      <button type="button" onClick={onClose} className="rounded-full py-4 text-[15px] font-medium mt-auto" style={{ background: C.rose, color: C.ink, border: 0, minHeight: 44 }}>Back to the caps</button>
    </Overlay>
  );
}