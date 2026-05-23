import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@17.7.0';

const SITE_URL = "https://app.alignedwomanco.com";

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { affiliate_id } = body;

    if (!affiliate_id) {
      return Response.json({ error: "affiliate_id is required" }, {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    // Get Stripe key from environment
    const stripeKey = Deno.env.get("stripe");
    if (!stripeKey) {
      return Response.json({ error: "Stripe is not configured" }, {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    const stripe = new Stripe(stripeKey);

    // Look up the affiliate
    const affiliates = await base44.asServiceRole.entities.Affiliate.filter({
      id: affiliate_id,
    });

    if (affiliates.length === 0) {
      return Response.json({ error: "Affiliate not found" }, {
        status: 404,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    const affiliate = affiliates[0];

    // If they already have a Stripe account, generate a new onboarding link
    let accountId = affiliate.stripe_account_id;

    if (!accountId) {
      // Create a new Express connected account
      const account = await stripe.accounts.create({
        type: "express",
        email: affiliate.email,
        capabilities: {
          transfers: { requested: true },
        },
        metadata: {
          affiliate_id: affiliate.id,
          affiliate_code: affiliate.unique_code,
        },
      });

      accountId = account.id;

      // Save the account ID to the affiliate record
      await base44.asServiceRole.entities.Affiliate.update(affiliate.id, {
        stripe_account_id: accountId,
        payout_status: "onboarding_started",
      });
    }

    // Check if account is already fully onboarded
    const account = await stripe.accounts.retrieve(accountId);

    if (account.charges_enabled || account.payouts_enabled) {
      // Already onboarded
      await base44.asServiceRole.entities.Affiliate.update(affiliate.id, {
        payout_status: "active",
      });

      return Response.json({
        success: true,
        already_onboarded: true,
        account_id: accountId,
        message: "Bank account is already connected",
      }, {
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    // Generate an onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      return_url: `${SITE_URL}/expert-dashboard?connect=complete`,
      refresh_url: `${SITE_URL}/expert-dashboard?connect=refresh`,
      type: "account_onboarding",
    });

    return Response.json({
      success: true,
      onboarding_url: accountLink.url,
      account_id: accountId,
    }, {
      headers: { "Access-Control-Allow-Origin": "*" },
    });

  } catch (error) {
    console.error("Connect account error:", error.message);
    return Response.json({ error: error.message }, {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
});