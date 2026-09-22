import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

// PayFast instant transaction notification. PayFast posts here once a payment
// completes, and this is where a cap sale first becomes a record in the app,
// which is what the cap orders sheet is built from.
//
// Field layout sent by src/components/caps/PayFastForm.jsx:
//   m_payment_id  CAP-<timestamp>, our reference
//   custom_str1   the line
//   custom_str2   cap colour | thread colour | placement
//   custom_str3   phone
//   custom_str4   item id
//   custom_str5   shipping address
//   custom_int1   quantity
// Payments started before September 22, 2026 used an older layout
// (str2 cap, str3 thread, str4 placement, no phone). Both are read.

const VALIDATE_URL = "https://www.payfast.co.za/eng/query/validate";
const MERCHANT_ID = "32598411";
const CAP_PRICE = 350; // ZAR per cap, keep in step with PRICE in src/pages/Caps.jsx

function clean(value) {
  return (value || "").trim();
}

export default async function (req) {
  try {
    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const rawBody = await req.text();
    if (!rawBody) {
      return Response.json({ error: "Empty notification" }, { status: 400 });
    }

    const params = new URLSearchParams(rawBody);

    // PayFast asks for the notification to be posted straight back, exactly as
    // received and in the same order, with only the signature removed. Working
    // from the raw text keeps every character byte for byte.
    const validationBody = rawBody
      .split("&")
      .filter((pair) => !pair.startsWith("signature="))
      .join("&");

    const check = await fetch(VALIDATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: validationBody,
    });
    const verdict = (await check.text()).trim().toUpperCase();

    if (verdict !== "VALID") {
      return Response.json({ error: "Notification could not be verified" }, { status: 400 });
    }

    // A valid notification for some other merchant account is not our sale.
    const merchantId = clean(params.get("merchant_id"));
    if (merchantId && merchantId !== MERCHANT_ID) {
      return Response.json({ error: "Unexpected merchant" }, { status: 400 });
    }

    const paymentStatus = clean(params.get("payment_status")).toUpperCase();

    // Only a completed payment becomes an order. Anything else is acknowledged
    // so PayFast stops retrying it.
    if (paymentStatus !== "COMPLETE") {
      return Response.json({ ok: true, ignored: paymentStatus || "unknown" });
    }

    const base44 = createClientFromRequest(req);

    const ourReference = clean(params.get("m_payment_id"));
    const pfPaymentId = clean(params.get("pf_payment_id"));
    // A payment that did not start from the cap form has no m_payment_id, so
    // PayFast's own id keeps it to one order all the same.
    const paymentReference = ourReference || (pfPaymentId ? `PF-${pfPaymentId}` : "");

    // PayFast repeats a notification until it gets a 200, so the same sale must
    // never be written twice.
    if (paymentReference) {
      const already = await base44.asServiceRole.entities.CapOrder.filter({
        payment_reference: paymentReference,
      });
      if (already.length > 0) {
        return Response.json({ ok: true, duplicate: true, order_id: already[0].id });
      }
    }

    const total = Number(params.get("amount_gross") || 0);
    const quantity = Math.max(1, Math.round(Number(params.get("custom_int1") || 1) || 1));

    const str2 = clean(params.get("custom_str2"));
    const str3 = clean(params.get("custom_str3"));
    const str4 = clean(params.get("custom_str4"));
    const newLayout = str2.includes("|");

    let capColour = "";
    let threadColour = "";
    let placement = "";
    let phone = "";

    if (newLayout) {
      const parts = str2.split("|").map((p) => p.trim());
      capColour = parts[0] || "";
      threadColour = parts[1] || "";
      placement = parts[2] || "";
      phone = str3;
    } else {
      capColour = str2;
      threadColour = str3;
      placement = str4;
    }
    phone = phone || clean(params.get("cell_number"));

    const address = clean(params.get("custom_str5"));
    const buyerName = [clean(params.get("name_first")), clean(params.get("name_last"))]
      .filter(Boolean)
      .join(" ");
    const email = clean(params.get("email_address"));

    // The price travels in a form field a buyer could edit, so the amount
    // PayFast actually took is checked against what the caps cost.
    const expected = CAP_PRICE * quantity;
    const flags = [];
    if (Math.abs(total - expected) > 0.009) {
      flags.push(`CHECK AMOUNT: paid R${total.toFixed(2)}, expected R${expected.toFixed(2)} for ${quantity} cap${quantity === 1 ? "" : "s"}`);
    }
    if (!address) flags.push("CHECK: no shipping address received");
    if (!ourReference) flags.push("CHECK: payment did not come through the cap form");

    const noteParts = [
      ...flags,
      `Paid by PayFast${ourReference ? `, payment ${ourReference}` : ""}${pfPaymentId ? ` (PayFast ${pfPaymentId})` : ""}`,
    ];
    if (str4 && newLayout) noteParts.push(`Item ${str4}`);

    const order = await base44.asServiceRole.entities.CapOrder.create({
      customer_name: buyerName || email || "Cap buyer",
      email,
      phone,
      delivery_method: address ? "courier" : "collect",
      address,
      items: [
        {
          line: clean(params.get("custom_str1")) || clean(params.get("item_name")) || "Cap",
          cap_colour: capColour,
          thread_colour: threadColour,
          placement,
          quantity,
          unit_price: Number((total / quantity).toFixed(2)),
        },
      ],
      cap_count: quantity,
      subtotal: total,
      shipping: 0,
      total,
      status: "paid",
      payment_reference: paymentReference,
      notes: noteParts.join(". "),
    });

    return Response.json({ ok: true, order_id: order.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
