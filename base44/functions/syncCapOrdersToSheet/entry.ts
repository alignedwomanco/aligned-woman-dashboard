import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

// Keeps a Google Sheet of everyone who has ordered caps, with their full order
// details. The first run creates the spreadsheet in the connected Google
// account and remembers it on a SheetTracker record; every later run rewrites
// the same sheet, so an order edited or deleted in the app is reflected here.

const SHEET_NAME = "The Aligned Woman Co - Cap Orders";
const TAB_NAME = "Cap orders";
const ADMIN_ROLES = ["owner", "admin", "master_admin"];

const HEADERS = [
  "Order ID",
  "Date ordered",
  "Customer",
  "Email",
  "Phone",
  "Delivery",
  "Address",
  "Caps",
  "Items",
  "Subtotal",
  "Shipping",
  "Total",
  "Status",
  "Notes",
];

function summariseItems(items) {
  return (items || [])
    .map((item) => {
      const colours = [item.cap_colour, item.thread_colour].filter(Boolean).join(" / ");
      const placement = item.placement ? ` (${item.placement})` : "";
      return `${item.quantity || 1} x ${item.line || "Cap"}${colours ? ` - ${colours}` : ""}${placement}`;
    })
    .join("; ");
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
      order.created_date ? String(order.created_date).slice(0, 10) : "",
      order.customer_name || "",
      order.email || "",
      order.phone || "",
      deliveryLabel(order.delivery_method),
      order.address || "",
      order.cap_count != null
        ? order.cap_count
        : (order.items || []).reduce((total, item) => total + (item.quantity || 0), 0),
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
      `spreadsheets/${spreadsheetId}/values/${encodeURIComponent(`${TAB_NAME}!A2:N100000`)}:clear`,
      { method: "POST", body: {} }
    );

    const range = `${TAB_NAME}!A1:N${rows.length + 1}`;
    await sheetsRequest(
      accessToken,
      `spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
      {
        method: "PUT",
        body: { range, majorDimension: "ROWS", values: [HEADERS, ...rows] },
      }
    );

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