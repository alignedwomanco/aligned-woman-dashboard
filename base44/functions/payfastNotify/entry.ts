import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

// PayFast instant transaction notification. PayFast posts here once a payment
// completes, and this is where a cap sale first becomes a record in the app,
// which is what the cap orders sheet is built from.

const VALIDATE_URL = "https://www.payfast.co.za/eng/query/validate";

export default async function (req) {
  try {
    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const rawBody = await req.text();
    if (!rawBody) {
      return Response.json({ error: "Empty notification" }, { status: 400 });
    }

    // PayFast asks that the notification be posted straight back to them to
    // confirm it really came from them. Anything else is discarded.
    const check = await fetch(VALIDATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: rawBody,
    });
    const verdict = (await check.text()).trim().toUpperCase();

    if (verdict !== "VALID") {
      return Response.json({ error: "Notification could not be verified" }, { status: 400 });
    }

    const params = new URLSearchParams(rawBody);
    const paymentStatus = (params.get("payment_status") || "").toUpperCase();

    // Only a completed payment becomes an order. Anything else is acknowledged
    // so PayFast stops retrying it.
    if (paymentStatus !== "COMPLETE") {
      return Response.json({ ok: true, ignored: paymentStatus || "unknown" });
    }

    const base44 = createClientFromRequest(req);

    const paymentReference = (params.get("m_payment_id") || "").trim();
    const pfPaymentId = (params.get("pf_payment_id") || "").trim();

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
    const quantity = Number(params.get("custom_int1") || 1) || 1;
    const address = (params.get("custom_str5") || "").trim();
    const buyerName = [params.get("name_first"), params.get("name_last")]
      .filter(Boolean)
      .join(" ")
      .trim();

    const order = await base44.asServiceRole.entities.CapOrder.create({
      customer_name: buyerName || params.get("email_address") || "Cap buyer",
      email: params.get("email_address") || "",
      phone: params.get("cell_number") || "",
      delivery_method: address ? "courier" : "collect",
      address,
      items: [
        {
          line: params.get("custom_str1") || params.get("item_name") || "Cap",
          cap_colour: params.get("custom_str2") || "",
          thread_colour: params.get("custom_str3") || "",
          placement: params.get("custom_str4") || "",
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
      notes: `Paid by PayFast${paymentReference ? `, payment ${paymentReference}` : ""}${
        pfPaymentId ? ` (${pfPaymentId})` : ""
      }`,
    });

    return Response.json({ ok: true, order_id: order.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}