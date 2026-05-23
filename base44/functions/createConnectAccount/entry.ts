import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@17.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const stripeSecret = Deno.env.get('stripe');
    if (!stripeSecret) {
      return Response.json({ error: 'Stripe secret not configured' }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecret);

    const { email, name } = await req.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      email: email,
      business_type: 'individual',
      metadata: {
        user_name: name || '',
        user_email: email,
      },
      capabilities: {
        card_payments: { request: true },
        transfers: { request: true },
      },
    });

    // Create account onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${req.headers.get('origin')}/expert-dashboard`,
      return_url: `${req.headers.get('origin')}/expert-dashboard?setup_complete=true`,
      type: 'account_onboarding',
    });

    return Response.json({
      stripe_account_id: account.id,
      account_link: accountLink.url,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
    });
  } catch (error) {
    console.error('Error creating Connect account:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});