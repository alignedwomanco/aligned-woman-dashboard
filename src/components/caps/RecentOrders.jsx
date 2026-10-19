import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

/* The order feed reads the cap orders Google Sheet through a backend function,
   so the page shows what the sheet holds without ever naming a buyer. */

const C = {
  burg: "#7A1B34",
  burgMid: "#6B1642",
  rose: "#C4847A",
  roseLight: "#E8B4AE",
  white: "#FFFFFF",
};
const SERIF = "'Libre Baskerville', Baskerville, 'DM Serif Display', Georgia, serif";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "2026-10-18 07:11" reads as "18 Oct".
function shortDate(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return "";
  return `${Number(match[3])} ${MONTHS[Number(match[2]) - 1] || ""}`.trim();
}

export default function RecentOrders() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    let live = true;
    base44.functions
      .invoke("getCapOrderFeed", {})
      .then((res) => {
        if (live) setOrders((res.data && res.data.orders) || []);
      })
      .catch(() => {
        if (live) setOrders([]);
      });
    return () => {
      live = false;
    };
  }, []);

  // Nothing to show yet, or the sheet could not be read.
  if (!orders || orders.length === 0) return null;

  return (
    <div className="px-6 md:px-24 py-16 md:py-20" style={{ borderTop: `1px solid ${C.roseLight}` }}>
      <div className="flex flex-col gap-3 max-w-[720px]">
        <div className="text-xs uppercase" style={{ letterSpacing: "0.14em", color: C.rose }}>
          Recent orders
        </div>
        <h2 className="m-0 text-4xl md:text-5xl" style={{ fontFamily: SERIF, fontWeight: 400, color: C.burg }}>
          Caps on their way.
        </h2>
        <p className="m-0 text-[17px]" style={{ lineHeight: 1.6 }}>
          Straight from our order sheet. We show the cap and the town, never the name.
        </p>
      </div>

      <ul className="mt-10 flex flex-col gap-3" style={{ listStyle: "none", padding: 0, margin: "40px 0 0" }}>
        {orders.map((order) => (
          <li
            key={order.id}
            className="rounded-2xl px-6 py-4 flex items-center justify-between gap-4 flex-wrap"
            style={{ background: C.white }}
          >
            <div className="flex flex-col gap-0.5">
              <div className="text-[17px]" style={{ fontFamily: SERIF, color: C.burg }}>
                {order.lines.map((line) => `${line.qty} x ${line.line}`).join("  ·  ")}
              </div>
              {order.town && (
                <div className="text-[13px] uppercase" style={{ color: C.burgMid, letterSpacing: "0.06em" }}>
                  {order.town}
                </div>
              )}
            </div>
            <div className="text-[13px]" style={{ color: C.burgMid }}>
              {shortDate(order.date)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}