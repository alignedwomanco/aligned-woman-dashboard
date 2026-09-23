import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

// PayFast instant transaction notification. PayFast posts here once a payment
// completes, and this is where a cap sale first becomes a record in the app,
// which is what the cap orders sheet is built from.
//
// Current layout, a multi-cap order (custom_int2 = 2), sent by
// src/components/caps/PayFastForm.jsx:
//   m_payment_id  CAP-<timestamp>, our reference
//   custom_int1   total caps in the order
//   custom_str1   cap lines, line|cap|thread|placement|qty joined with ;
//   custom_str2   cap lines that did not fit in custom_str1
//   custom_str3   phone
//   custom_str4   name | surname
//   custom_str5   shipping address
//
// Older single-cap layouts are still read, so a payment started before a
// release still records correctly:
//   September 22, 2026 evening: str1 line, str2 cap | thread | placement,
//     str3 phone, str4 name | surname
//   Before that: str1 line, str2 cap, str3 thread, str4 placement, no phone

const VALIDATE_URL = "https://www.payfast.co.za/eng/query/validate";
const MERCHANT_ID = "32598411";
const CAP_PRICE = 350; // ZAR per cap, keep in step with PRICE in src/pages/Caps.jsx

function clean(value) {
  return (value || "").trim();
}

function wholeNumber(value, fallback) {
  const n = parseInt(String(value || ""), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// line|cap|thread|placement|qty;line|cap|thread|placement|qty
function parseCapLines(text) {
  return text
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [line, cap, thread, placement, qty] = entry.split("|").map((p) => p.trim());
      return {
        line: line || "Cap",
        cap_colour: cap || "",
        thread_colour: thread || "",
        placement: placement || "",
        quantity: wholeNumber(qty, 1),
        unit_price: CAP_PRICE,
      };
    });
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
    const str1 = clean(params.get("custom_str1"));
    const str2 = clean(params.get("custom_str2"));
    const str3 = clean(params.get("custom_str3"));
    const str4 = clean(params.get("custom_str4"));
    const declaredCaps = wholeNumber(params.get("custom_int1"), 0);
    const multiCap = clean(params.get("custom_int2")) === "2";

    let items = [];
    let phone = "";
    let hasNameField = false;

    if (multiCap) {
      items = parseCapLines([str1, str2].filter(Boolean).join(";"));
      phone = str3;
      hasNameField = true;
    } else if (str2.includes("|")) {
      // September 22 evening single-cap layout.
      const parts = str2.split("|").map((p) => p.trim());
      items = [{
        line: str1 || clean(params.get("item_name")) || "Cap",
        cap_colour: parts[0] || "",
        thread_colour: parts[1] || "",
        placement: parts[2] || "",
        quantity: declaredCaps || 1,
        unit_price: CAP_PRICE,
      }];
      phone = str3;
      hasNameField = true;
    } else {
      // Original single-cap layout.
      items = [{
        line: str1 || clean(params.get("item_name")) || "Cap",
        cap_colour: str2,
        thread_colour: str3,
        placement: str4,
        quantity: declaredCaps || 1,
        unit_price: CAP_PRICE,
      }];
    }
    phone = phone || clean(params.get("cell_number"));

    const flags = [];
    if (items.length === 0) {
      flags.push("CHECK: no cap lines received, confirm the order with the buyer");
      items = [{ line: "Cap", cap_colour: "", thread_colour: "", placement: "", quantity: declaredCaps || 1, unit_price: CAP_PRICE }];
    }

    const capCount = items.reduce((n, i) => n + i.quantity, 0);
    if (declaredCaps && declaredCaps !== capCount) {
      flags.push(`CHECK: order said ${declaredCaps} caps, lines add up to ${capCount}`);
    }

    // The price travels in a form field a buyer could edit, so the amount
    // PayFast actually took is checked against what the caps cost.
    const expected = CAP_PRICE * capCount;
    if (Math.abs(total - expected) > 0.009) {
      flags.push(`CHECK AMOUNT: paid R${total.toFixed(2)}, expected R${expected.toFixed(2)} for ${capCount} cap${capCount === 1 ? "" : "s"}`);
    }

    const address = clean(params.get("custom_str5"));
    const payerName = [clean(params.get("name_first")), clean(params.get("name_last"))]
      .filter(Boolean)
      .join(" ");
    // The name typed on the cap form is who the caps go to. The PayFast payer
    // can differ (a partner's card, a company account), so it is kept in Notes.
    const formName = hasNameField && str4.includes("|")
      ? str4.split("|").map((p) => p.trim()).filter(Boolean).join(" ")
      : "";
    const buyerName = formName || payerName;
    const email = clean(params.get("email_address"));

    if (!address) flags.push("CHECK: no shipping address received");
    if (!phone) flags.push("CHECK: no phone received");
    if (!formName) flags.push("CHECK: no name received from the cap form");
    if (!ourReference) flags.push("CHECK: payment did not come through the cap form");

    const noteParts = [
      ...flags,
      `Paid by PayFast${ourReference ? `, payment ${ourReference}` : ""}${pfPaymentId ? ` (PayFast ${pfPaymentId})` : ""}`,
    ];
    if (formName && payerName && formName.toLowerCase() !== payerName.toLowerCase()) {
      noteParts.push(`Paid by ${payerName}`);
    }

    const order = await base44.asServiceRole.entities.CapOrder.create({
      customer_name: buyerName || email || "Cap buyer",
      email,
      phone,
      delivery_method: address ? "courier" : "collect",
      address,
      items,
      cap_count: capCount,
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
