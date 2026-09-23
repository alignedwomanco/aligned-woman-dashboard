import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

// Keeps a Google Sheet of everyone who has ordered caps, with their full order
// details. The first run creates the spreadsheet in the connected Google
// account and remembers it on a SheetTracker record; every later run rewrites
// the same sheet, so an order edited or deleted in the app is reflected here.

const SHEET_NAME = "The Aligned Woman Co - Cap Orders";
const TAB_NAME = "Cap orders";
const ADMIN_ROLES = ["owner", "admin", "master_admin"];

// One column per cap design, so an order with several designs shows how many
// of each on one row and every column can be totalled for production. Keep in
// step with LINES in src/pages/Caps.jsx. A cap whose line is not listed here
// lands in "Other caps" rather than disappearing.
const DESIGNS = [
  "you stay home",
  "you're too close",
  "coming for kempton",
  "try me",
  "how about no",
  "100% that bitch",
];

const HEADERS = [
  "Order ID",
  "Date ordered",
  "Customer",
  "Email",
  "Phone",
  "Delivery",
  "Address",
  "Total caps",
  ...DESIGNS,
  "Other caps",
  "Items",
  "Subtotal",
  "Shipping",
  "Total",
  "Status",
  "Notes",
];

// Column letter for a 1-based column number (1 = A, 27 = AA).
function columnLetter(n) {
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}
const LAST_COL = columnLetter(HEADERS.length);

// Matches a design however the line was typed: case and curly apostrophes aside.
function designKey(line) {
  return String(line || "").toLowerCase().replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim();
}
const DESIGN_KEYS = DESIGNS.map(designKey);

// How many of each design, plus anything unrecognised, for one order.
function designCounts(items) {
  const counts = DESIGNS.map(() => 0);
  let other = 0;
  (items || []).forEach((item) => {
    const q = Number(item.quantity) || 1;
    const i = DESIGN_KEYS.indexOf(designKey(item.line));
    if (i >= 0) counts[i] += q;
    else other += q;
  });
  // Blank rather than 0, so each row reads at a glance. SUM treats blanks as 0.
  return [...counts, other].map((n) => (n > 0 ? n : ""));
}

function summariseItems(items) {
  return (items || [])
    .map((item) => {
      const colours = [item.cap_colour, item.thread_colour].filter(Boolean).join(" / ");
      const placement = item.placement ? ` (${item.placement})` : "";
      return `${item.quantity || 1} x ${item.line || "Cap"}${colours ? ` - ${colours}` : ""}${placement}`;
    })
    .join("; ");
}

// Base44 stores created_date in UTC, often without a zone marker. The sheet
// shows South African time, so a sale just after midnight lands on the right day.
function saDateTime(value) {
  if (!value) return "";
  const text = String(value);
  const hasZone = /(Z|[+-]\d{2}:?\d{2})$/.test(text);
  const date = new Date(hasZone ? text : `${text}Z`);
  if (Number.isNaN(date.getTime())) return text.slice(0, 10);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type) => (parts.find((p) => p.type === type) || {}).value || "";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`;
}

function deliveryLabel(method) {
  if (method === "courier") return "Courier";
  if (method === "collect") return "Collection";
  return method || "";
}

async function sheetsRequest(accessToken, path, options) {
  const opts = options || {};
  const res = await fetch(`https://sheets.googleapis.com/v4/${path}`, {
    method: opts.method || "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (_err) {
    data = { raw: text };
  }

  if (!res.ok) {
    const detail = (data && data.error && data.error.message) || (data && data.raw) || res.statusText;
    throw new Error(`Google Sheets responded ${res.status}: ${detail}`);
  }

  return data;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    // The nightly workflow calls this with no signed-in person. A signed-in
    // caller has to be an admin, so a member cannot trigger a sheet write.
    const user = await base44.auth.me().catch(() => null);
    if (user && !ADMIN_ROLES.includes(user.role)) {
      return Response.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("googlesheets");

    const existing = await base44.asServiceRole.entities.SheetTracker.list("-created_date", 1);
    let tracker = existing && existing[0] ? existing[0] : null;
    let spreadsheetId = tracker ? tracker.spreadsheet_id : null;

    if (!spreadsheetId) {
      const created = await sheetsRequest(accessToken, "spreadsheets", {
        method: "POST",
        body: {
          properties: { title: SHEET_NAME },
          sheets: [
            {
              properties: {
                title: TAB_NAME,
                gridProperties: { frozenRowCount: 1 },
              },
            },
          ],
        },
      });

      spreadsheetId = created.spreadsheetId;

      // A bold header row, so it reads as a tracker rather than raw data.
      await sheetsRequest(accessToken, `spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: "POST",
        body: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: (created.sheets && created.sheets[0] && created.sheets[0].properties.sheetId) || 0,
                  startRowIndex: 0,
                  endRowIndex: 1,
                },
                cell: { userEnteredFormat: { textFormat: { bold: true } } },
                fields: "userEnteredFormat.textFormat.bold",
              },
            },
          ],
        },
      });

      tracker = await base44.asServiceRole.entities.SheetTracker.create({
        name: SHEET_NAME,
        spreadsheet_id: spreadsheetId,
        spreadsheet_url: created.spreadsheetUrl,
      });
    }

    const orders = await base44.asServiceRole.entities.CapOrder.list("-created_date", 5000);

    const rows = orders.map((order) => [
      order.id || "",
      saDateTime(order.created_date),
      order.customer_name || "",
      order.email || "",
      order.phone || "",
      deliveryLabel(order.delivery_method),
      order.address || "",
      order.cap_count != null
        ? order.cap_count
        : (order.items || []).reduce((total, item) => total + (item.quantity || 0), 0),
      ...designCounts(order.items),
      summariseItems(order.items),
      order.subtotal != null ? order.subtotal : "",
      order.shipping != null ? order.shipping : "",
      order.total != null ? order.total : "",
      order.status || "",
      order.notes || "",
    ]);

    // Clear the old body first, so an order removed in the app does not linger.
    await sheetsRequest(
      accessToken,
      // Wider than the table, so columns from an older layout are cleared too.
      `spreadsheets/${spreadsheetId}/values/${encodeURIComponent(`${TAB_NAME}!A2:AZ100000`)}:clear`,
      { method: "POST", body: {} }
    );

    const range = `${TAB_NAME}!A1:${LAST_COL}${rows.length + 1}`;
    await sheetsRequest(
      accessToken,
      `spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
      {
        method: "PUT",
        body: { range, majorDimension: "ROWS", values: [HEADERS, ...rows] },
      }
    );

    // Keep the whole header row bold, including columns added after the sheet
    // was first made. Cosmetic, so a failure here never stops the sync.
    try {
      const meta = await sheetsRequest(
        accessToken,
        `spreadsheets/${spreadsheetId}?fields=sheets.properties(sheetId,title)`
      );
      const tab = (meta.sheets || []).find((s) => s.properties && s.properties.title === TAB_NAME);
      if (tab) {
        await sheetsRequest(accessToken, `spreadsheets/${spreadsheetId}:batchUpdate`, {
          method: "POST",
          body: {
            requests: [
              {
                repeatCell: {
                  range: { sheetId: tab.properties.sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: HEADERS.length },
                  cell: { userEnteredFormat: { textFormat: { bold: true } } },
                  fields: "userEnteredFormat.textFormat.bold",
                },
              },
            ],
          },
        });
      }
    } catch (_err) {
      // Formatting only.
    }

    await base44.asServiceRole.entities.SheetTracker.update(tracker.id, {
      last_synced_at: new Date().toISOString(),
      row_count: rows.length,
    });

    return Response.json({
      success: true,
      orders: rows.length,
      spreadsheet_url: tracker.spreadsheet_url,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}