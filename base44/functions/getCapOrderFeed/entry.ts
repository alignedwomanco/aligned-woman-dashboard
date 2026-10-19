import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// The caps page shows a short feed of what has just been bought. It reads the
// same Google Sheet the orders are synced into, so the page and the sheet can
// never disagree. Only the cap line, the quantity, the town and the date ever
// leave this function: no name, email, phone or street address.

const TAB_NAME = "Cap orders";
const FEED_SIZE = 8;

// Column positions in the sheet written by syncCapOrdersToSheet.
const COL_ID = 0;
const COL_DATE = 1;
const COL_ADDRESS = 6;
const COL_ITEMS = 15;
const COL_STATUS = 19;

const PROVINCES = [
  "western cape",
  "eastern cape",
  "northern cape",
  "gauteng",
  "kwazulu-natal",
  "kwa zulu natal",
  "free state",
  "mpumalanga",
  "limpopo",
  "north west",
];

// "1 x you stay home - Forest green / Light pink (front); 2 x try me - ..."
function parseItems(text) {
  return String(text || "")
    .split(";")
    .map((part) => {
      const match = part.trim().match(/^(\d+)\s*x\s*(.+)$/i);
      if (!match) return null;
      const line = match[2].split(" - ")[0].trim();
      if (!line) return null;
      return { line, qty: Number(match[1]) || 1 };
    })
    .filter(Boolean);
}

// The town, never the street. "573 Gracida rd, Val de Vie Estate, Paarl,
// Western Cape, 7646, South Africa" gives Paarl.
function townFrom(address) {
  const parts = String(address || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const kept = parts.filter((part) => !/^\d{4,}$/.test(part) && !/^south africa$/i.test(part));
  if (!kept.length) return "";
  const last = kept[kept.length - 1];
  // The sheet sometimes carries a clipped province, so "Western" counts too.
  const isRegion = (value) => {
    const lower = value.toLowerCase();
    return PROVINCES.includes(lower) || lower.includes("province") || ["western", "eastern", "northern"].includes(lower);
  };
  if (isRegion(last) && kept.length > 1) return kept[kept.length - 2];
  return last;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    const trackers = await base44.asServiceRole.entities.SheetTracker.list("-created_date", 1);
    const tracker = trackers && trackers[0];
    if (!tracker || !tracker.spreadsheet_id) return Response.json({ orders: [] });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("googlesheets");

    const range = encodeURIComponent(`${TAB_NAME}!A1:T500`);
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${tracker.spreadsheet_id}/values/${range}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(10000),
      }
    );
    if (!res.ok) throw new Error(`Google Sheets responded ${res.status}`);
    const data = await res.json();

    const orders = (data.values || [])
      .slice(1)
      .filter((row) => row && row[COL_ID])
      .filter((row) => String(row[COL_STATUS] || "").toLowerCase() !== "cancelled")
      .map((row) => {
        const lines = parseItems(row[COL_ITEMS]);
        return {
          id: row[COL_ID],
          date: row[COL_DATE] || "",
          town: townFrom(row[COL_ADDRESS]),
          lines,
        };
      })
      .filter((order) => order.lines.length > 0)
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .slice(0, FEED_SIZE);

    return Response.json({ orders });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}